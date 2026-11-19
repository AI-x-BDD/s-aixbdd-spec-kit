# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Check a tasks.md produced by the tasks skill against its spec package.

Verifies task ids, story labels, Must Read / Optional reference lines, that each
referenced file exists (or is created by an earlier task) and that the
identifiers named in each reference can be found in that file, that endpoint
group headings cover the interfaces listed in plan.md, that every FR / NFR in
spec.md is cited, and that every "待確認 n" has a matching Notes entry.

For references to a .dbml file, every `table.column` identifier must name a
table in that data model and a column of that table. Constrained fields of
data/data-model.dbml (columns whose note starts with "驗證：" or "轉換：", and
every table.column listed inside a table Note "跨欄位：…（…；…）") must each be
cited as `table.column` in at least one task's Must Read reference to that
file; Optional references do not count. A missing data model, or one without
constrained fields, adds no coverage issue. The JSON report lists them under
field_citations. The DBML is parsed as text; no external tool is used.
Reads files only; writes nothing and makes no network access.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

PHASE_RE = re.compile(r"^## Phase (\d+): (.+)$")
STORY_RE = re.compile(r"User Story (\d+)")
GROUP_RE = re.compile(r"^### .+（(.+)）\s*$")
TASK_RE = re.compile(r"^- \[[ xX]\] (T\d{3})\b(.*)$")
LEVEL_RE = re.compile(r"^  - \*\*(Must Read|Optional)\*\*\s*$")
REF_LINE_RE = re.compile(r"^    - (.*)$")
REF_RE = re.compile(r"^`([^`]+)`(?: → (.+?))? — Why：(.+)$")
INTERFACE_RE = re.compile(r"(?<![A-Za-z0-9])([A-Z])(\d+)(?:\s*[–~～-]\s*(?:\1)?(\d+))?(?![0-9])")
# ASCII boundaries: Python's \b treats CJK characters as word characters.
REQUIREMENT_RE = re.compile(r"(?<![A-Za-z0-9-])(US\d+|(?:FR|NFR|SC)-\d+)(?![A-Za-z0-9])")
SPEC_REQ_RE = re.compile(r"(?<![A-Za-z0-9-])((?:FR|NFR)-\d+)(?![A-Za-z0-9])")
SECTION_RE = re.compile(r"§(\d+(?:\.\d+)*)")
QUOTE_RE = re.compile(r"「([^」]+)」")
BACKTICK_RE = re.compile(r"`([^`]+)`")
PENDING_REF_RE = re.compile(r"待確認\s*(\d+)")
PENDING_DEF_RE = re.compile(r"^- 待確認\s*(\d+)：")
FIELD_TOKEN_RE = re.compile(r'"?([A-Za-z_]\w*)"?\."?([A-Za-z_]\w*)"?')
FIELD_IN_TEXT_RE = re.compile(r"(?<![A-Za-z0-9_.])([A-Za-z_]\w*)\.([A-Za-z_]\w*)(?![A-Za-z0-9_])")
DBML_TABLE_RE = re.compile(r"^[ \t]*Table[ \t]+([^{\n]+?)[ \t]*\{", re.M)
DBML_STRING_RE = re.compile(r"'''.*?'''|'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"", re.S)
DBML_NOTE_RE = re.compile(r"\bnote\s*:\s*('''.*?'''|'(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")", re.S | re.I)
CROSS_FIELD_RE = re.compile(r"跨欄位：")
CROSS_FIELD_PAREN_RE = re.compile(r"（([^（）]*?)；[^（）]*）")
DATA_MODEL = Path("data") / "data-model.dbml"


def requirement_exists(requirement: str, text: str) -> bool:
    patterns = [re.escape(requirement)]
    story = re.fullmatch(r"US(\d+)", requirement)
    if story:
        patterns.append(rf"User Story {story.group(1)}")
    return any(re.search(rf"(?<![A-Za-z0-9-]){p}(?![0-9])", text) for p in patterns)


def squash(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def token_exists(token: str, text: str) -> bool:
    if token in text:
        return True
    head = re.match(r"^(Table|Enum)\s+(\S+)$", token)
    if head:
        name = re.escape(head.group(2).strip('"'))
        return re.search(rf"^\s*{head.group(1)}\s+\"?{name}\"?[\s{{\[]", text, re.M) is not None
    if token.startswith("Ref"):
        return squash(token) in squash(text)
    if "." in token and " " not in token:
        last = re.escape(token.rsplit(".", 1)[1])
        return re.search(rf"(?<![A-Za-z0-9_]){last}(?![A-Za-z0-9_])", text) is not None
    return False


def unquote(literal: str) -> str:
    if literal.startswith("'''"):
        return literal[3:-3]
    return re.sub(r"\\(.)", r"\1", literal[1:-1])


def split_dbml_block(body: str) -> tuple[list[str], list[tuple[str, str]]]:
    """Split a table body into top-level statements and sub-blocks (header, content)."""
    statements: list[str] = []
    blocks: list[tuple[str, str]] = []
    current = ""
    header = ""
    content = ""
    depth = 0
    i = 0
    while i < len(body):
        m = DBML_STRING_RE.match(body, i)
        if m:
            if depth:
                content += m.group(0)
            else:
                current += m.group(0)
            i = m.end()
            continue
        ch = body[i]
        if ch == "{":
            if depth == 0:
                header, content = current.strip(), ""
                current = ""
            else:
                content += ch
            depth += 1
        elif ch == "}" and depth:
            depth -= 1
            if depth == 0:
                blocks.append((header, content))
            else:
                content += ch
        elif depth:
            content += ch
        elif ch == "\n":
            statements.append(current)
            current = ""
        else:
            current += ch
        i += 1
    statements.append(current)
    return [st.strip() for st in statements if st.strip() and not st.strip().startswith("//")], blocks


def parse_dbml(text: str) -> dict[str, dict]:
    """Return {table: {"columns": {column: note}, "note": table note}} parsed from DBML text."""
    tables: dict[str, dict] = {}
    for m in DBML_TABLE_RE.finditer(text):
        head = re.sub(r"\[.*?\]", "", m.group(1)).split()
        if not head:
            continue
        name = head[0].split(".")[-1].strip('"')
        i, depth = m.end(), 1
        while i < len(text) and depth:
            sm = DBML_STRING_RE.match(text, i)
            if sm:
                i = sm.end()
                continue
            depth += {"{": 1, "}": -1}.get(text[i], 0)
            i += 1
        statements, blocks = split_dbml_block(text[m.end():i - 1])
        columns: dict[str, str] = {}
        note = ""
        for statement in statements:
            nm = re.match(r"^Note\s*:\s*(.+)$", statement, re.S)
            if nm:
                sm = DBML_STRING_RE.match(nm.group(1).strip())
                note = unquote(sm.group(0)) if sm else nm.group(1)
                continue
            cm = re.match(r'^("[^"]+"|[A-Za-z_]\w*)\s+\S', statement)
            if not cm:
                continue
            nm = DBML_NOTE_RE.search(statement)
            columns[cm.group(1).strip('"')] = unquote(nm.group(1)) if nm else ""
        for header, content in blocks:
            if header.lower() == "note":
                sm = DBML_STRING_RE.search(content)
                note = unquote(sm.group(0)) if sm else content.strip()
        tables[name] = {"columns": columns, "note": note}
    return tables


def constrained_fields(tables: dict[str, dict]) -> list[str]:
    fields: list[str] = []
    for table, info in tables.items():
        for column, note in info["columns"].items():
            if note.lstrip().startswith(("驗證：", "轉換：")):
                fields.append(f"{table}.{column}")
        for segment in CROSS_FIELD_RE.split(info["note"])[1:]:
            paren = CROSS_FIELD_PAREN_RE.search(segment)
            if paren:
                fields.extend(f"{t}.{c}" for t, c in FIELD_IN_TEXT_RE.findall(paren.group(1)))
    return list(dict.fromkeys(fields))


def field_problem(token: str, tables: dict[str, dict]) -> str | None:
    table, column = FIELD_TOKEN_RE.fullmatch(token).groups()
    if table not in tables:
        return f"沒有資料表 `{table}`"
    if column not in tables[table]["columns"]:
        return f"資料表 `{table}` 沒有欄位 `{column}`"
    return None


def section_exists(number: str, text: str) -> bool:
    n = re.escape(number)
    return (
        re.search(rf"^#{{1,6}}\s*(?:§\s*)?{n}(?![0-9])", text, re.M) is not None
        or re.search(rf"§{n}(?![0-9])", text) is not None
    )


def check_locator(locator: str, text: str, tables: dict[str, dict] | None = None
                  ) -> tuple[list[str], bool, list[str]]:
    """Return (missing identifiers, whether any identifier was extracted, unresolved table.column)."""
    missing: list[str] = []
    unresolved: list[str] = []
    found_any = False
    for token in BACKTICK_RE.findall(locator):
        found_any = True
        if tables is not None and not token.startswith("Ref") and FIELD_TOKEN_RE.fullmatch(token):
            problem = field_problem(token, tables)
            if problem:
                unresolved.append(f"`{token}`（{problem}）")
            continue
        if not token_exists(token, text):
            missing.append(f"`{token}`")
    for quoted in QUOTE_RE.findall(locator):
        found_any = True
        if quoted not in text:
            missing.append(f"「{quoted}」")
    for number in SECTION_RE.findall(locator):
        found_any = True
        if not section_exists(number, text):
            missing.append(f"§{number}")
    stripped = BACKTICK_RE.sub(" ", QUOTE_RE.sub(" ", locator))
    for requirement in REQUIREMENT_RE.findall(stripped):
        found_any = True
        if not requirement_exists(requirement, text):
            missing.append(requirement)
    return missing, found_any, unresolved


def plan_interfaces(plan_text: str) -> list[str]:
    match = re.search(r"^#+\s*系統介面盤點\s*$(.*?)(?=^#+\s)", plan_text + "\n# end", re.M | re.S)
    if not match:
        return []
    return re.findall(r"^\|\s*([A-Z]\d+)\s*\|", match.group(1), re.M)


def expand_interfaces(label: str) -> list[str]:
    ids: list[str] = []
    for letter, start, end in INTERFACE_RE.findall(label):
        last = int(end) if end else int(start)
        ids.extend(f"{letter}{n}" for n in range(int(start), last + 1))
    return ids


def parse_tasks(lines: list[str]) -> tuple[list[dict], list[dict], list[dict]]:
    phases: list[dict] = []
    tasks: list[dict] = []
    groups: list[dict] = []
    phase: dict | None = None
    task: dict | None = None
    level: str | None = None
    for number, line in enumerate(lines, 1):
        if line.startswith("## "):
            task, level = None, None
            m = PHASE_RE.match(line)
            if m:
                story = STORY_RE.search(m.group(2))
                phase = {"title": line[3:].strip(), "story": int(story.group(1)) if story else None, "tasks": 0}
                phases.append(phase)
            else:
                phase = None
            continue
        if phase is None:
            continue
        m = GROUP_RE.match(line)
        if m:
            task, level = None, None
            groups.append({"line": number, "label": m.group(1), "ids": expand_interfaces(m.group(1))})
            continue
        m = TASK_RE.match(line)
        if m:
            task = {"id": m.group(1), "line": number, "text": m.group(2), "phase": phase,
                    "must": [], "optional": [], "levels": [], "bad": []}
            tasks.append(task)
            phase["tasks"] += 1
            level = None
            continue
        if task is None:
            continue
        m = LEVEL_RE.match(line)
        if m:
            level = "must" if m.group(1) == "Must Read" else "optional"
            task["levels"].append(level)
            continue
        m = REF_LINE_RE.match(line)
        if m and level:
            ref = REF_RE.match(m.group(1))
            if ref:
                task[level].append({"line": number, "file": ref.group(1), "locator": ref.group(2)})
            else:
                task["bad"].append((number, m.group(1)))
            continue
        if line.strip() and not line.startswith(" "):
            task, level = None, None
    return phases, tasks, groups


def check(spec_dir: Path, tasks_path: Path) -> dict:
    text = tasks_path.read_text(encoding="utf-8")
    lines = text.splitlines()
    issues: list[str] = []
    warnings: list[str] = []

    for number, line in enumerate(lines, 1):
        if "{{" in line:
            issues.append(f"第 {number} 行殘留填位符號：{line.strip()}")

    phases, tasks, groups = parse_tasks(lines)
    if not tasks:
        issues.append("找不到任何任務行（- [ ] T001 …）")

    for expected, task in enumerate(tasks, 1):
        if task["id"] != f"T{expected:03d}":
            issues.append(f"第 {task['line']} 行任務 ID 為 {task['id']}，預期 T{expected:03d}")
            break

    for task in tasks:
        story = task["phase"]["story"]
        labels = re.findall(r"\[US(\d+)\]", task["text"])
        if story is not None and labels != [str(story)]:
            issues.append(f"{task['id']} 位於 User Story {story} 的 Phase，標籤應為 [US{story}]")
        if story is None and labels:
            issues.append(f"{task['id']} 不在 User Story Phase，不應帶 [US…] 標籤")
        if not task["must"]:
            issues.append(f"{task['id']} 沒有 Must Read 參考")
        if "optional" in task["levels"] and not task["optional"]:
            issues.append(f"{task['id']} 的 Optional 沒有任何參考")
        for number, raw in task["bad"]:
            issues.append(f"第 {number} 行參考格式不符 `檔案` → 部位 — Why：理由：{raw}")

    cache: dict[Path, str] = {}
    dbml_cache: dict[Path, dict[str, dict]] = {}
    data_model = (spec_dir / DATA_MODEL).resolve()
    cited: set[str] = set()
    reference_count = 0
    for index, task in enumerate(tasks):
        earlier = " ".join(t["text"] for t in tasks[:index])
        for ref in task["must"] + task["optional"]:
            reference_count += 1
            path = spec_dir / ref["file"]
            if not path.is_file():
                if ref["file"] in earlier or Path(ref["file"]).name in earlier:
                    continue
                issues.append(f"第 {ref['line']} 行（{task['id']}）參考的檔案不存在：{ref['file']}")
                continue
            if not ref["locator"]:
                continue
            if path not in cache:
                cache[path] = path.read_text(encoding="utf-8", errors="replace")
            tables = None
            if path.suffix == ".dbml":
                if path not in dbml_cache:
                    dbml_cache[path] = parse_dbml(cache[path])
                tables = dbml_cache[path]
                if path.resolve() == data_model and ref in task["must"]:
                    for token in BACKTICK_RE.findall(ref["locator"]):
                        m = FIELD_TOKEN_RE.fullmatch(token)
                        if m and not token.startswith("Ref"):
                            cited.add(f"{m.group(1)}.{m.group(2)}")
            missing, found_any, unresolved = check_locator(ref["locator"], cache[path], tables)
            if unresolved:
                issues.append(f"第 {ref['line']} 行（{task['id']}）在 {ref['file']} 找不到欄位：{'、'.join(unresolved)}")
            if missing:
                issues.append(f"第 {ref['line']} 行（{task['id']}）在 {ref['file']} 找不到：{'、'.join(missing)}")
            elif not found_any:
                plain = re.sub(r"（[^）]*）", "", ref["locator"]).strip()
                if plain not in cache[path]:
                    warnings.append(f"第 {ref['line']} 行（{task['id']}）無法在 {ref['file']} 確認部位：{ref['locator']}")

    constrained: list[str] = []
    if data_model.is_file():
        if data_model not in dbml_cache:
            dbml_cache[data_model] = parse_dbml(data_model.read_text(encoding="utf-8", errors="replace"))
        constrained = constrained_fields(dbml_cache[data_model])
    uncited = [field for field in constrained if field not in cited]
    for field in uncited:
        issues.append(f"受約束欄位 `{field}` 沒有任何任務在 Must Read 以 `{DATA_MODEL.as_posix()}` → `{field}` 引用")

    plan_path = spec_dir / "plan.md"
    if plan_path.is_file():
        inventory = plan_interfaces(plan_path.read_text(encoding="utf-8"))
        if not inventory:
            warnings.append("plan.md 找不到「系統介面盤點」表，未檢查組標題的介面編號")
        listed = {i for g in groups for i in g["ids"]}
        for group in groups:
            for interface in group["ids"]:
                if interface not in inventory:
                    issues.append(f"第 {group['line']} 行組標題的 {interface} 不在 plan.md 系統介面盤點")
        for interface in inventory:
            if interface not in listed:
                issues.append(f"plan.md 系統介面盤點的 {interface} 沒有出現在任何組標題")
    else:
        issues.append("spec 目錄沒有 plan.md")

    spec_path = spec_dir / "spec.md"
    if spec_path.is_file():
        for requirement in sorted(set(SPEC_REQ_RE.findall(spec_path.read_text(encoding="utf-8"))),
                                  key=lambda r: (r.split("-")[0], int(r.split("-")[1]))):
            if not requirement_exists(requirement, text):
                issues.append(f"spec.md 的 {requirement} 沒有被任何任務引用")
    else:
        issues.append("spec 目錄沒有 spec.md")

    defined = {m.group(1) for line in lines if (m := PENDING_DEF_RE.match(line))}
    referenced = {n for line in lines if not PENDING_DEF_RE.match(line) for n in PENDING_REF_RE.findall(line)}
    for number in sorted(referenced - defined, key=int):
        issues.append(f"「待確認 {number}」在 Notes 沒有對應的「- 待確認 {number}：」")
    for number in sorted(defined - referenced, key=int):
        warnings.append(f"Notes 的「待確認 {number}」沒有被任何任務引用")

    return {
        "tasks": len(tasks),
        "references": reference_count,
        "phases": [{"title": p["title"], "tasks": p["tasks"]} for p in phases],
        "field_citations": {
            "data_model": DATA_MODEL.as_posix() if data_model.is_file() else None,
            "constrained": constrained,
            "uncited": uncited,
        },
        "issues": issues,
        "warnings": warnings,
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Check tasks.md against its spec package. Also checks that `table.column` references to a "
                    ".dbml file name an existing column of that table, and that every constrained field of "
                    "data/data-model.dbml (column note starting with 驗證： or 轉換：, or listed in a table Note "
                    "跨欄位：) is cited as `table.column` in some task's Must Read. Prints a JSON report including "
                    "field_citations; exits 1 when issues exist.")
    parser.add_argument("--spec-dir", required=True, type=Path, help="spec 目錄（含 spec.md、plan.md）")
    parser.add_argument("tasks", type=Path, help="要檢查的 tasks.md")
    args = parser.parse_args()
    if not args.spec_dir.is_dir():
        print(f"spec 目錄不存在：{args.spec_dir}", file=sys.stderr)
        return 2
    if not args.tasks.is_file():
        print(f"tasks.md 不存在：{args.tasks}", file=sys.stderr)
        return 2
    result = check(args.spec_dir.resolve(), args.tasks.resolve())
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if result["issues"] else 0


if __name__ == "__main__":
    sys.exit(main())
