# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Check a DBML data model with the official DBML parser and trace table notes to interfaces and spec requirements."""

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
CREATE_TABLE_RE = re.compile(r'^CREATE TABLE\s+((?:"[^"]+"\.)?"[^"]+"|\S+)\s*\(', re.MULTILINE)
COMMENT_RE = re.compile(r"^COMMENT ON TABLE\s+((?:\"[^\"]+\"\.)?\"[^\"]+\"|\S+)\s+IS\s+'((?:[^']|'')*)';", re.MULTILINE)
ERROR_BLOCK_RE = re.compile(r"^\s*ERROR:\s*$", re.MULTILINE)
ERROR_LINE_RE = re.compile(r"^\s*\S+\(\d+,\d+\):.*$", re.MULTILINE)
DATABASE_TYPE_RE =re.compile(r"Project\s+[^{]*\{[^}]*?database_type\s*:\s*(['\"])(.*?)\1", re.DOTALL)


def requirement_exists(requirement: str, spec_text: str) -> bool:
    patterns = [re.escape(requirement)]
    story = re.fullmatch(r"US(\d+)", requirement)
    if story:
        patterns.append(rf"User Story {story.group(1)}")
    return any(re.search(rf"(?<![A-Za-z0-9-]){p}(?![0-9])", spec_text) for p in patterns)


def table_name(raw: str) -> str:
    """Return the last segment of a possibly schema-qualified, quoted SQL table name."""
    return raw.split(".")[-1].strip('"')


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
        description="Parse a DBML file with the official DBML CLI (dbml2sql via npx) and check that every table note starts with one of the given interface IDs, every interface has a table, and cited requirement IDs exist in the spec. Prints a JSON report; exit 0 when there are no issues, 1 when issues are found, 2 on argument or environment errors."
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
        comments = {table_name(name): text.replace("''", "'") for name, text in COMMENT_RE.findall(sql)}
        for name in (table_name(raw) for raw in CREATE_TABLE_RE.findall(sql)):
            note = comments.get(name)
            entry = {"name": name, "interface": None, "requirements": []}
            report["tables"].append(entry)
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
        for interface, count in report["coverage"].items():
            if count == 0:
                report["issues"].append(f"interface {interface}: no table")

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report["issues"] else 0


if __name__ == "__main__":
    sys.exit(main())
