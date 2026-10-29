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


def section_exists(number: str, text: str) -> bool:
    n = re.escape(number)
    return (
        re.search(rf"^#{{1,6}}\s*(?:§\s*)?{n}(?![0-9])", text, re.M) is not None
        or re.search(rf"§{n}(?![0-9])", text) is not None
    )


def check_locator(locator: str, text: str) -> tuple[list[str], bool]:
    """Return (missing identifiers, whether any identifier was extracted)."""
    missing: list[str] = []
    found_any = False
    for token in BACKTICK_RE.findall(locator):
        found_any = True
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
    return missing, found_any


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
            missing, found_any = check_locator(ref["locator"], cache[path])
            if missing:
                issues.append(f"第 {ref['line']} 行（{task['id']}）在 {ref['file']} 找不到：{'、'.join(missing)}")
            elif not found_any:
                plain = re.sub(r"（[^）]*）", "", ref["locator"]).strip()
                if plain not in cache[path]:
                    warnings.append(f"第 {ref['line']} 行（{task['id']}）無法在 {ref['file']} 確認部位：{ref['locator']}")

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
        "issues": issues,
        "warnings": warnings,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Check tasks.md against its spec package.")
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
