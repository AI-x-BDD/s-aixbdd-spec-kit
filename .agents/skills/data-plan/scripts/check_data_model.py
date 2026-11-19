# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Check a DBML data model with the official DBML parser.

Checks that table notes trace to interfaces and spec requirements, and that the fixed
constraint notations are consistent:

- column note prefix `轉換：...。` (state transitions of an Enum column),
- column note prefix `驗證：...。` (single-column validation rules),
- table Note segment `跨欄位：...（table.column、table.column；basis）。` (cross-column rules).
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

DBML_CLI = "@dbml/cli@10"
# ASCII boundaries: Python's \b treats CJK characters as word characters.
REQUIREMENT_RE = re.compile(r"(?<![A-Za-z0-9-])(US\d+|(?:FR|NFR|SC)-\d+)(?![A-Za-z0-9])")
SQL_NAME = r'(?:"[^"]+"\.)*"[^"]+"|\S+'
CREATE_TABLE_RE = re.compile(rf"^CREATE TABLE\s+({SQL_NAME})\s*\((.*?)\n\);", re.MULTILINE | re.DOTALL)
CREATE_ENUM_RE = re.compile(rf"^CREATE TYPE\s+({SQL_NAME})\s+AS ENUM\s*\((.*?)\);", re.MULTILINE | re.DOTALL)
ENUM_VALUE_RE = re.compile(r"'((?:[^']|'')*)'")
COLUMN_RE = re.compile(r'^\s*"([^"]+)"\s+((?:"[^"]+"\.)*"[^"]+"|[^\s,]+)', re.MULTILINE)
COMMENT_RE = re.compile(rf"^COMMENT ON TABLE\s+({SQL_NAME})\s+IS\s+'((?:[^']|'')*)';", re.MULTILINE)
COLUMN_COMMENT_RE = re.compile(r"^COMMENT ON COLUMN\s+((?:\"[^\"]+\"\.)*\"[^\"]+\")\s+IS\s+'((?:[^']|'')*)';", re.MULTILINE)
ERROR_BLOCK_RE = re.compile(r"^\s*ERROR:\s*$", re.MULTILINE)
ERROR_LINE_RE = re.compile(r"^\s*\S+\(\d+,\d+\):.*$", re.MULTILINE)
DATABASE_TYPE_RE = re.compile(r"Project\s+[^{]*\{[^}]*?database_type\s*:\s*(['\"])(.*?)\1", re.DOTALL)
LEADING_SEGMENT_RE = re.compile(r"(轉換|驗證)：([^。]*)(?:。|$)")
CROSS_FIELD_RE = re.compile(r"跨欄位：([^。]*)(?:。|$)")
TRANSITION_RE = re.compile(r"^(\S+)\s*→\s*(\S+?)（([^（）]+)）$")
VALUE_WITH_BASIS_RE = re.compile(r"^(\S+?)（([^（）]+)）$")
FIELD_REF_RE = re.compile(r"^([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)$")
NAMED_BASIS_PREFIXES = ("Key Entities ", "Edge Cases ")


def requirement_exists(requirement: str, spec_text: str) -> bool:
    patterns = [re.escape(requirement)]
    story = re.fullmatch(r"US(\d+)", requirement)
    if story:
        patterns.append(rf"User Story {story.group(1)}")
    return any(re.search(rf"(?<![A-Za-z0-9-]){p}(?![0-9])", spec_text) for p in patterns)


def last_segment(raw: str) -> str:
    """Return the last segment of a possibly schema-qualified, quoted SQL name."""
    return raw.split(".")[-1].strip('"')


def unquote(text: str) -> str:
    return text.replace("''", "'")


def split_top_level(text: str, separator: str) -> list[str]:
    """Split on separator characters that are outside full-width or ASCII parentheses."""
    parts: list[str] = []
    depth = 0
    current = ""
    for char in text:
        if char in "（(":
            depth += 1
        elif char in "）)":
            depth = max(depth - 1, 0)
        if char == separator and depth == 0:
            parts.append(current.strip())
            current = ""
        else:
            current += char
    parts.append(current.strip())
    return [part for part in parts if part]


def split_trailing_basis(item: str) -> tuple[str, str] | None:
    """Split `<text>（<basis>）` into text and basis; None when the item has no trailing basis."""
    if not item.endswith("）"):
        return None
    start = item.rfind("（")
    if start <= 0:
        return None
    return item[:start].strip(), item[start + 1 : -1].strip()


def basis_issues(where: str, basis: str, spec_text: str) -> list[str]:
    requirements = REQUIREMENT_RE.findall(basis)
    if not requirements:
        if basis.startswith(NAMED_BASIS_PREFIXES):
            return []
        return [f"{where}: basis '{basis}' must cite a requirement ID or start with 'Key Entities ' or 'Edge Cases '"]
    return [f"{where}: requirement {r} not found in spec" for r in requirements if not requirement_exists(r, spec_text)]


def parse_leading_segments(note: str) -> tuple[dict[str, str], str, list[str]]:
    """Return the leading 轉換／驗證 segments, the remaining note text, and order issues."""
    segments: dict[str, str] = {}
    issues: list[str] = []
    rest = note
    while True:
        match = LEADING_SEGMENT_RE.match(rest)
        if match is None:
            break
        kind, body = match.group(1), match.group(2).strip()
        if kind in segments:
            issues.append(f"'{kind}：' appears more than once")
        if kind == "轉換" and "驗證" in segments:
            issues.append("'轉換：' must come before '驗證：'")
        segments[kind] = body
        rest = rest[match.end() :]
    for kind in ("轉換", "驗證"):
        if f"{kind}：" in rest:
            issues.append(f"'{kind}：' must be at the start of the column note")
    return segments, rest, issues


def check_validation(where: str, body: str, spec_text: str) -> list[str]:
    issues: list[str] = []
    items = split_top_level(body, "；")
    if not items:
        return [f"{where}: '驗證：' has no rule"]
    for item in items:
        parsed = split_trailing_basis(item)
        if parsed is None or not parsed[0]:
            issues.append(f"{where}: validation rule '{item}' must end with '（<basis>）'")
            continue
        issues.extend(basis_issues(where, parsed[1], spec_text))
    return issues


def check_transitions(where: str, body: str, enum_name: str | None, enum_values: list[str] | None, spec_text: str) -> list[str]:
    issues: list[str] = []
    if enum_values is None:
        return [f"{where}: '轉換：' is only allowed on an Enum column"]
    initials: list[str] = []
    terminals: list[str] = []
    edges: list[tuple[str, str]] = []
    for item in split_top_level(body, "；"):
        if item.startswith("初始"):
            for entry in split_top_level(item[len("初始") :].strip(), "、"):
                match = VALUE_WITH_BASIS_RE.match(entry)
                if match is None:
                    issues.append(f"{where}: initial value '{entry}' must be written as '<value>（<basis>）'")
                    continue
                initials.append(match.group(1))
                issues.extend(basis_issues(where, match.group(2), spec_text))
        elif item.startswith("終態"):
            terminals.extend(split_top_level(item[len("終態") :].strip(), "、"))
        else:
            match = TRANSITION_RE.match(item)
            if match is None:
                issues.append(f"{where}: transition '{item}' must be written as '<from> → <to>（<basis>）'")
                continue
            edges.append((match.group(1), match.group(2)))
            issues.extend(basis_issues(where, match.group(3), spec_text))
    if not initials:
        issues.append(f"{where}: '轉換：' must list at least one '初始' value")
    mentioned = set(initials) | set(terminals) | {value for edge in edges for value in edge}
    for value in sorted(mentioned - set(enum_values)):
        issues.append(f"{where}: value '{value}' is not in Enum {enum_name}")
    for value in enum_values:
        if value not in mentioned:
            issues.append(f"{where}: Enum {enum_name} value '{value}' is missing from '轉換：'")
    sources = {source for source, _ in edges}
    for value in terminals:
        if value in sources:
            issues.append(f"{where}: terminal value '{value}' must not have outgoing transitions")
    for value in enum_values:
        if value in mentioned and value not in terminals and value not in sources:
            issues.append(f"{where}: non-terminal value '{value}' has no outgoing transition; list it under '終態' or add a transition")
    return issues


def check_cross_field(table: str, columns: dict[str, str], body: str, spec_text: str) -> list[str]:
    where = f"table {table}: cross-field rule '{body}'"
    parsed = split_trailing_basis(body)
    if parsed is None or not parsed[0] or "；" not in parsed[1]:
        return [f"{where}: must end with '（<table.column>、<table.column>；<basis>）'"]
    fields_text, basis = parsed[1].split("；", 1)
    fields = split_top_level(fields_text, "、")
    issues: list[str] = []
    if len(fields) < 2:
        issues.append(f"{where}: must list at least two fields")
    for field in fields:
        match = FIELD_REF_RE.match(field)
        if match is None:
            issues.append(f"{where}: field '{field}' must be written as <table>.<column>")
        elif match.group(1) != table:
            issues.append(f"{where}: field '{field}' must belong to table {table}")
        elif match.group(2) not in columns:
            issues.append(f"{where}: column '{field}' does not exist")
    issues.extend(basis_issues(where, basis.strip(), spec_text))
    return issues


def parse_interfaces(value: str) -> list[str]:
    interfaces = [item.strip() for item in value.split(",") if item.strip()]
    if not interfaces:
        raise argparse.ArgumentTypeError("at least one interface ID is required")
    return interfaces


def run_dbml2sql(npx: str, dbml: Path) -> tuple[str | None, list[str]]:
    """Run dbml2sql in a temporary directory so dbml-error.log never lands in the project."""
    with tempfile.TemporaryDirectory() as workdir:
        result = subprocess.run(
            [npx, "--yes", "-p", DBML_CLI, "dbml2sql", "--postgres", str(dbml)],
            cwd=workdir,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
    # dbml2sql exits 0 on parse errors and prints the ERROR block to stdout when it is not a TTY.
    output = f"{result.stdout}\n{result.stderr}"
    if result.returncode != 0 or ERROR_BLOCK_RE.search(output):
        detail = ERROR_LINE_RE.findall(output)
        return None, [f"DBML syntax error: {line.strip()}" for line in detail] or [f"dbml2sql failed with status {result.returncode}"]
    return result.stdout, []


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Parse a DBML file with the official DBML CLI (dbml2sql via npx) and check that every table note starts with one of "
            "the given interface IDs, every interface has a table, and cited requirement IDs exist in the spec. Also checks the "
            "fixed constraint notations: column notes may start with '轉換：...。' (Enum state transitions: '初始 <value>（<basis>）', "
            "'<from> → <to>（<basis>）', '終態 <value>、<value>') and then '驗證：...。' (rules ending with '（<basis>）'); table notes may "
            "contain '跨欄位：<rule>（<table.column>、<table.column>；<basis>）。'. A basis cites requirement IDs that exist in the spec, "
            "or starts with 'Key Entities ' or 'Edge Cases '. Prints a JSON report with constrained_fields and cross_field_rules per "
            "table; exit 0 when there are no issues, 1 when issues are found, 2 on argument or environment errors."
        )
    )
    parser.add_argument("--spec", type=Path, required=True, help="Path to the target spec.md.")
    parser.add_argument("--interfaces", type=parse_interfaces, required=True, help="Comma-separated interface IDs this data model covers, for example D1,D2.")
    parser.add_argument("dbml", type=Path, help="Path to data-model.dbml.")
    args = parser.parse_args()

    spec: Path = args.spec.expanduser().resolve()
    dbml: Path = args.dbml.expanduser().resolve()
    for path in (spec, dbml):
        if not path.is_file():
            print(f"{path}: file not found", file=sys.stderr)
            return 2
    npx = shutil.which("npx")
    if npx is None:
        print("npx not found: install Node.js to run the official DBML parser", file=sys.stderr)
        return 2

    spec_text = spec.read_text(encoding="utf-8")
    dbml_text = dbml.read_text(encoding="utf-8")
    interfaces: list[str] = args.interfaces
    match = DATABASE_TYPE_RE.search(dbml_text)
    report: dict = {
        "file": str(dbml),
        "database_type": match.group(2) if match else None,
        "tables": [],
        "coverage": {interface: 0 for interface in interfaces},
        "issues": [],
    }
    if report["database_type"] is None:
        report["issues"].append("Project block has no database_type")

    sql, syntax_issues = run_dbml2sql(npx, dbml)
    if sql is None:
        report["issues"].extend(syntax_issues)
    else:
        enums = {last_segment(name): [unquote(v) for v in ENUM_VALUE_RE.findall(body)] for name, body in CREATE_ENUM_RE.findall(sql)}
        comments = {last_segment(name): unquote(text) for name, text in COMMENT_RE.findall(sql)}
        column_comments: dict[str, dict[str, str]] = {}
        for raw, text in COLUMN_COMMENT_RE.findall(sql):
            parts = [part.strip('"') for part in raw.split('"."')]
            column_comments.setdefault(parts[-2].strip('"'), {})[parts[-1].strip('"')] = unquote(text)
        for raw_name, body in CREATE_TABLE_RE.findall(sql):
            name = last_segment(raw_name)
            columns = {column: last_segment(column_type) for column, column_type in COLUMN_RE.findall(body)}
            note = comments.get(name)
            entry = {"name": name, "interface": None, "requirements": [], "constrained_fields": [], "cross_field_rules": 0}
            report["tables"].append(entry)

            for column, column_note in column_comments.get(name, {}).items():
                where = f"column {name}.{column}"
                segments, rest, order_issues = parse_leading_segments(column_note)
                report["issues"].extend(f"{where}: {issue}" for issue in order_issues)
                if "跨欄位：" in column_note:
                    report["issues"].append(f"{where}: '跨欄位：' belongs in the table Note")
                if "轉換" in segments:
                    enum_name = columns.get(column)
                    report["issues"].extend(check_transitions(where, segments["轉換"], enum_name, enums.get(enum_name), spec_text))
                if "驗證" in segments:
                    report["issues"].extend(check_validation(where, segments["驗證"], spec_text))
                if segments:
                    entry["constrained_fields"].append(f"{name}.{column}")

            if note is None:
                report["issues"].append(f"table {name}: missing Note")
                continue
            owner = next((i for i in interfaces if note.startswith(f"{i}：") or note.startswith(f"{i}:")), None)
            if owner is None:
                report["issues"].append(f"table {name}: Note must start with one of {', '.join(interfaces)} followed by '：'")
            else:
                entry["interface"] = owner
                report["coverage"][owner] += 1
            entry["requirements"] = sorted(set(REQUIREMENT_RE.findall(note)))
            for requirement in entry["requirements"]:
                if not requirement_exists(requirement, spec_text):
                    report["issues"].append(f"table {name}: requirement {requirement} not found in spec")
            if "轉換：" in note:
                report["issues"].append(f"table {name}: '轉換：' belongs in the state column note, not the table Note")
            for body in CROSS_FIELD_RE.findall(note):
                entry["cross_field_rules"] += 1
                report["issues"].extend(check_cross_field(name, columns, body.strip(), spec_text))
        for interface, count in report["coverage"].items():
            if count == 0:
                report["issues"].append(f"interface {interface}: no table")

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report["issues"] else 0


if __name__ == "__main__":
    sys.exit(main())
