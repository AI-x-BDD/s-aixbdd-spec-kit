# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Collect a coverage inventory from a spec directory for the analyze skill.

Reads spec.md, plan.md, tasks.md, the Planner outputs under contracts/,
data/ and ui/, and notification/plan.md produced by notification-plan, then
prints one JSON object to standard output:

  requirements        FR / NFR / SC defined in spec.md, with the ids of the tasks that cite them
  user_stories        User Story headings in spec.md
  tasks               every task in tasks.md: id, phase, story, requirements, interfaces
  interfaces          interfaces listed in plan.md "系統介面盤點", with the contracts operations,
                      data tables, ui/plan.md sections, notification/plan.md sections and
                      tasks that map to each interface; a notification/plan.md section maps
                      to an interface only when its heading starts with an optional
                      "§", an optional section number and the interface id
  unmapped_tasks      tasks that cite no requirement and are not in a User Story phase
  pending_notes       "待確認 n" entries in the tasks.md Notes section
  placeholders        {{, TODO, TBD, TKTK and ??? found in any document of the spec directory
  undefined_requirement_refs  requirement ids cited by a task but not defined in spec.md
  metrics             counts and the coverage rate

Exit status is 0 on success. When spec.md, plan.md or tasks.md is missing, or the
directory does not exist, the script prints the reason to standard error and exits 2.
Contracts are read as YAML text (OpenAPI and AsyncAPI); JSON contracts are not parsed.
Reads files only; writes nothing and makes no network access.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

REQ_DEF_RE = re.compile(r"^\s*[-*]\s+\**((?:FR|NFR|SC)-\d+)\**\s*[:：]")
REQ_RANGE_RE = re.compile(
    r"(?<![A-Za-z0-9])((?:FR|NFR|SC)-)(\d+)\s*[–~～-]\s*(?:(?:FR|NFR|SC)-)?(\d+)(?![0-9])"
)
REQ_RE = re.compile(r"(?<![A-Za-z0-9-])((?:FR|NFR|SC)-\d+)(?![0-9])")
STORY_RE = re.compile(
    r"^###\s+User Story\s+(\d+)\s*[-–—:]\s*(.+?)(?:\s*\(Priority:\s*(P\d+)\))?\s*$"
)
PHASE_RE = re.compile(r"^## Phase (\d+):\s*(.+?)\s*$")
GROUP_RE = re.compile(r"^###\s+.*[（(]([^）)]+)[）)]\s*$")
TASK_RE = re.compile(r"^- \[[ xX]\] (T\d{3})\b(.*)$")
STORY_LABEL_RE = re.compile(r"\[(US\d+)\]")
IFACE_RANGE_RE = re.compile(
    r"(?<![A-Za-z0-9])([A-Z])(\d+)(?:\s*[–~～-]\s*(?:\1)?(\d+))?(?![0-9A-Za-z])"
)
PENDING_RE = re.compile(r"^-\s*待確認\s*(\d+)\s*[:：]\s*(.*)$")
PLACEHOLDER_RE = re.compile(r"\{\{|(?<![A-Za-z])(?:TODO|TBD|TKTK)(?![A-Za-z])|\?\?\?")
HTTP_METHODS = {"get", "put", "post", "delete", "options", "head", "patch", "trace"}
TEXT_SUFFIXES = {".md", ".yaml", ".yml", ".json", ".dbml", ".html", ".txt"}


def read_lines(path: Path) -> list[str]:
    return path.read_text(encoding="utf-8").splitlines()


def indent_of(line: str) -> int:
    return len(line) - len(line.lstrip(" "))


def expand_interface_ids(text: str) -> list[str]:
    """Return interface ids in text, expanding ranges such as B1–B4."""
    found: list[str] = []
    for m in IFACE_RANGE_RE.finditer(text):
        letter, first, last = m.group(1), int(m.group(2)), m.group(3)
        if last is None:
            found.append(f"{letter}{first}")
        elif int(last) >= first:
            found.extend(f"{letter}{n}" for n in range(first, int(last) + 1))
        else:
            found.append(f"{letter}{first}")
    return found


def expand_requirements(text: str) -> list[str]:
    """Return requirement ids in text, expanding ranges such as FR-002–FR-004."""
    found: list[str] = []
    for m in REQ_RANGE_RE.finditer(text):
        prefix, first, last = m.group(1), m.group(2), m.group(3)
        if int(last) >= int(first):
            width = len(first)
            found.extend(f"{prefix}{n:0{width}d}" for n in range(int(first), int(last) + 1))
    for m in REQ_RE.finditer(text):
        found.append(m.group(1))
    return found


def unique(items: list[str]) -> list[str]:
    seen: dict[str, None] = {}
    for item in items:
        seen.setdefault(item, None)
    return list(seen)


def parse_spec(lines: list[str]) -> tuple[list[dict], list[dict]]:
    requirements: dict[str, dict] = {}
    stories: list[dict] = []
    for number, line in enumerate(lines, 1):
        m = REQ_DEF_RE.match(line)
        if m and m.group(1) not in requirements:
            rid = m.group(1)
            requirements[rid] = {"id": rid, "kind": rid.split("-")[0], "line": number, "tasks": []}
        s = STORY_RE.match(line)
        if s:
            stories.append(
                {
                    "id": f"US{s.group(1)}",
                    "title": s.group(2).strip(),
                    "priority": s.group(3),
                    "line": number,
                }
            )
    return list(requirements.values()), stories


def parse_tasks(lines: list[str]) -> tuple[list[dict], list[dict]]:
    tasks: list[dict] = []
    pending: list[dict] = []
    phase_no: int | None = None
    phase_title = ""
    story_phase = False
    group_ids: list[str] = []
    current: dict | None = None
    block: list[str] = []
    in_notes = False

    def close_current() -> None:
        nonlocal current, block
        if current is not None:
            text = "\n".join(block)
            current["requirements"] = unique(expand_requirements(text))
            tasks.append(current)
        current, block = None, []

    for number, line in enumerate(lines, 1):
        if line.startswith("#") or (line and not line.startswith((" ", "\t", "-"))):
            close_current()
        phase = PHASE_RE.match(line)
        if phase:
            phase_no, phase_title = int(phase.group(1)), phase.group(2)
            story_phase = re.search(r"User Story\s+\d+", phase_title) is not None
            group_ids = []
            in_notes = False
            continue
        if line.startswith("## "):
            in_notes = line.strip() == "## Notes"
            phase_no, phase_title, story_phase, group_ids = None, "", False, []
            continue
        group = GROUP_RE.match(line)
        if group and phase_no is not None:
            close_current()
            group_ids = unique(expand_interface_ids(group.group(1)))
            continue
        if in_notes:
            pm = PENDING_RE.match(line)
            if pm:
                pending.append({"n": int(pm.group(1)), "line": number, "text": pm.group(2).strip()})
            continue
        task = TASK_RE.match(line)
        if task and phase_no is not None:
            close_current()
            label = STORY_LABEL_RE.search(task.group(2))
            current = {
                "id": task.group(1),
                "line": number,
                "phase": phase_no,
                "phase_title": phase_title,
                "story_phase": story_phase,
                "story": label.group(1) if label else None,
                "interfaces": list(group_ids),
            }
            block = [line]
            continue
        if current is not None:
            block.append(line)
    close_current()
    return tasks, pending


def parse_interfaces(lines: list[str]) -> list[dict]:
    start = next((i for i, line in enumerate(lines) if re.match(r"^#+\s*系統介面盤點", line)), None)
    if start is None:
        return []
    interfaces: list[dict] = []
    seen_table = False
    for line in lines[start + 1 :]:
        if line.startswith("#") and seen_table:
            break
        if not line.lstrip().startswith("|"):
            if seen_table and line.strip():
                break
            continue
        seen_table = True
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 3 and re.fullmatch(r"[A-Z]\d+", cells[0]):
            interfaces.append(
                {"id": cells[0], "name": cells[1], "endpoint_type": cells[2]}
            )
    return interfaces


def expected_output(endpoint_type: str) -> str:
    head = re.split(r"[（(]", endpoint_type, maxsplit=1)[0].strip()
    return {"前端": "ui", "後端": "contracts", "資料庫": "data"}.get(head, "any")


def tag_interface(tag: str) -> str | None:
    m = re.match(r"^\s*([A-Z]\d+)(?![0-9A-Za-z])", tag.strip().strip("'\""))
    return m.group(1) if m else None


def section_lines(lines: list[str], key: str) -> list[tuple[int, str]]:
    """Return (line number, text) pairs under a top-level YAML key."""
    out: list[tuple[int, str]] = []
    inside = False
    for number, line in enumerate(lines, 1):
        if re.match(rf"^{re.escape(key)}:\s*$", line):
            inside = True
            continue
        if inside:
            if line.strip() and not line.startswith((" ", "#")):
                break
            out.append((number, line))
    return out


def block_tags(block: list[str], op_indent: int) -> list[str]:
    tags: list[str] = []
    for i, line in enumerate(block):
        m = re.match(r"^(\s*)tags:\s*(.*)$", line)
        if not m or len(m.group(1)) != op_indent + 2:
            continue
        inline = m.group(2).strip()
        if inline.startswith("["):
            tags.extend(t.strip().strip("'\"") for t in inline.strip("[]").split(",") if t.strip())
        else:
            for sub in block[i + 1 :]:
                if sub.strip() and indent_of(sub) <= len(m.group(1)):
                    break
                item = re.match(r"^\s*-\s*(?:name:\s*)?(.+?)\s*$", sub)
                if item:
                    tags.append(item.group(1).strip("'\""))
        break
    return tags


def split_blocks(rows: list[tuple[int, str]], indent: int, header: re.Pattern[str]):
    """Yield (match, block lines) for each header line at the given indent."""
    starts = [
        (i, header.match(text))
        for i, (_, text) in enumerate(rows)
        if indent_of(text) == indent and header.match(text)
    ]
    for pos, (i, m) in enumerate(starts):
        end = len(rows)
        for j in range(i + 1, len(rows)):
            text = rows[j][1]
            if text.strip() and indent_of(text) <= indent:
                end = j
                break
        yield m, [text for _, text in rows[i:end]]


def parse_contracts(spec_dir: Path) -> list[dict]:
    operations: list[dict] = []
    contracts_dir = spec_dir / "contracts"
    if not contracts_dir.is_dir():
        return operations
    for path in sorted(contracts_dir.iterdir()):
        if path.suffix not in {".yaml", ".yml"}:
            continue
        lines = read_lines(path)
        rel = f"contracts/{path.name}"
        paths_rows = section_lines(lines, "paths")
        for path_match, path_block in split_blocks(paths_rows, 2, re.compile(r"^\s{2}(\S.*?):\s*$")):
            rows = list(enumerate(path_block))
            method_re = re.compile(r"^\s{4}([a-z]+):\s*$")
            for method_match, block in split_blocks(rows, 4, method_re):
                if method_match.group(1) not in HTTP_METHODS:
                    continue
                op_id = next(
                    (
                        m.group(1).strip("'\"")
                        for line in block
                        if (m := re.match(r"^\s{6}operationId:\s*(\S+)", line))
                    ),
                    f"{method_match.group(1).upper()} {path_match.group(1)}",
                )
                operations.append(
                    {"file": rel, "operation": op_id, "tags": block_tags(block, 4)}
                )
        op_rows = section_lines(lines, "operations")
        for op_match, block in split_blocks(op_rows, 2, re.compile(r"^\s{2}([^\s:][^:]*):\s*$")):
            operations.append(
                {"file": rel, "operation": op_match.group(1), "tags": block_tags(block, 2)}
            )
    return operations


def parse_data(spec_dir: Path) -> list[dict]:
    tables: list[dict] = []
    data_dir = spec_dir / "data"
    if not data_dir.is_dir():
        return tables
    for path in sorted(data_dir.glob("*.dbml")):
        lines = read_lines(path)
        name: str | None = None
        for line in lines:
            head = re.match(r'^Table\s+"?([\w.]+)"?', line)
            if head:
                name = head.group(1)
                continue
            if name and line.startswith("}"):
                name = None
                continue
            note = re.match(r"^\s*Note:\s*(['\"])(.*)\1\s*$", line)
            if name and note:
                prefix = re.match(r"^\s*((?:[A-Z]\d+[、,，／/\s]*)+)", note.group(2))
                ids = unique(expand_interface_ids(prefix.group(1))) if prefix else []
                tables.append(
                    {"file": f"data/{path.name}", "table": f"Table {name}", "interfaces": ids}
                )
    return tables


def parse_ui_sections(spec_dir: Path) -> list[dict]:
    sections: list[dict] = []
    plan = spec_dir / "ui" / "plan.md"
    if not plan.is_file():
        return sections
    heading = ""
    for line in read_lines(plan):
        h = re.match(r"^#+\s+(.+?)\s*$", line)
        if h:
            heading = h.group(1)
            sections.append({"section": heading, "interfaces": []})
            continue
        if not sections:
            sections.append({"section": heading, "interfaces": []})
        sections[-1]["interfaces"].extend(expand_interface_ids(line))
    for s in sections:
        s["interfaces"] = unique(s["interfaces"])
    return sections


NOTIFICATION_HEADING_RE = re.compile(
    r"^#+\s+((?:§\s*)?(?:\d+(?:\.\d+)*\.?\s+)?([A-Z]\d+)(?=\s|$).*?)\s*$"
)


def parse_notification_sections(spec_dir: Path) -> list[dict]:
    sections: list[dict] = []
    plan = spec_dir / "notification" / "plan.md"
    if not plan.is_file():
        return sections
    for line in read_lines(plan):
        h = NOTIFICATION_HEADING_RE.match(line)
        if h:
            sections.append({"section": h.group(1), "interface": h.group(2)})
    return sections


def scan_placeholders(spec_dir: Path) -> list[dict]:
    found: list[dict] = []
    for path in sorted(spec_dir.rglob("*")):
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES:
            continue
        rel = path.relative_to(spec_dir).as_posix()
        if rel == "analysis.md":
            continue
        try:
            lines = read_lines(path)
        except UnicodeDecodeError:
            continue
        for number, line in enumerate(lines, 1):
            if PLACEHOLDER_RE.search(line):
                found.append({"file": rel, "line": number, "text": line.strip()[:160]})
    return found


def build(spec_dir: Path) -> dict:
    spec_lines = read_lines(spec_dir / "spec.md")
    plan_lines = read_lines(spec_dir / "plan.md")
    task_lines = read_lines(spec_dir / "tasks.md")

    requirements, stories = parse_spec(spec_lines)
    tasks, pending = parse_tasks(task_lines)
    interfaces = parse_interfaces(plan_lines)
    contracts = parse_contracts(spec_dir)
    tables = parse_data(spec_dir)
    ui_sections = parse_ui_sections(spec_dir)
    notification_sections = parse_notification_sections(spec_dir)

    defined = {r["id"] for r in requirements}
    undefined: list[dict] = []
    for task in tasks:
        for rid in task["requirements"]:
            if rid in defined:
                next(r for r in requirements if r["id"] == rid)["tasks"].append(task["id"])
            else:
                undefined.append({"task": task["id"], "id": rid})

    for iface in interfaces:
        iid = iface["id"]
        iface["contracts"] = [
            {"file": op["file"], "operation": op["operation"]}
            for op in contracts
            if iid in {tag_interface(t) for t in op["tags"]}
        ]
        iface["data"] = [
            {"file": t["file"], "table": t["table"]} for t in tables if iid in t["interfaces"]
        ]
        iface["ui"] = [
            {"file": "ui/plan.md", "section": s["section"]}
            for s in ui_sections
            if iid in s["interfaces"]
        ]
        iface["notification"] = [
            {"file": "notification/plan.md", "section": s["section"]}
            for s in notification_sections
            if s["interface"] == iid
        ]
        iface["tasks"] = [t["id"] for t in tasks if iid in t["interfaces"]]
        iface["expected_output"] = expected_output(iface["endpoint_type"])

    def has_output(iface: dict) -> bool:
        expected = iface["expected_output"]
        if expected == "any":
            return bool(iface["contracts"] or iface["data"] or iface["ui"] or iface["notification"])
        return bool(iface[expected])

    unmapped = [
        {"id": t["id"], "phase": t["phase"], "phase_title": t["phase_title"]}
        for t in tasks
        if not t["requirements"] and not t["story_phase"]
    ]
    placeholders = scan_placeholders(spec_dir)
    covered = sum(1 for r in requirements if r["tasks"])
    total = len(requirements)

    for task in tasks:
        del task["story_phase"]
    for r in requirements:
        del r["line"]
    for t in tasks:
        del t["line"]

    return {
        "spec_dir": str(spec_dir),
        "requirements": requirements,
        "user_stories": stories,
        "tasks": tasks,
        "interfaces": interfaces,
        "unmapped_tasks": unmapped,
        "pending_notes": pending,
        "placeholders": placeholders,
        "undefined_requirement_refs": undefined,
        "metrics": {
            "requirements_total": total,
            "requirements_with_tasks": covered,
            "coverage_rate": round(covered / total * 100, 1) if total else 0.0,
            "tasks_total": len(tasks),
            "interfaces_total": len(interfaces),
            "interfaces_without_planner_output": sum(1 for i in interfaces if not has_output(i)),
            "interfaces_without_tasks": sum(1 for i in interfaces if not i["tasks"]),
            "unmapped_tasks": len(unmapped),
            "pending_notes": len(pending),
            "placeholders": len(placeholders),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Collect a coverage inventory (JSON) from a spec directory."
    )
    parser.add_argument("--spec-dir", required=True, type=Path, help="spec directory containing spec.md")
    args = parser.parse_args()

    spec_dir: Path = args.spec_dir.expanduser().resolve()
    if not spec_dir.is_dir():
        print(f"error: spec directory not found: {spec_dir}", file=sys.stderr)
        return 2
    missing = [name for name in ("spec.md", "plan.md", "tasks.md") if not (spec_dir / name).is_file()]
    if missing:
        print(
            f"error: missing required file(s) in {spec_dir}: {', '.join(missing)}",
            file=sys.stderr,
        )
        return 2

    result = build(spec_dir)
    sys.stdout.reconfigure(encoding="utf-8")
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
