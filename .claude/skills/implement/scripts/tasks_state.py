# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Read and update the progress of a tasks.md produced by the tasks skill.

Subcommands:
  status  check the tasks.md format, count done / remaining tasks and print the
          shared execution context (Tests policy, Reference Loading Contract,
          Path Conventions, Dependencies & Execution Order, Notes).
  next    print the task to run now. While the task issued by the previous
          `next` is still unchecked (and not in --skip), print that same task
          again; otherwise issue the first unchecked task in file order inside
          --scope that is not listed in --skip. Output includes the task block,
          phase information, group heading, referenced pending notes and
          whether it closes its phase.
  check   mark the currently issued task as done by changing only its "- [ ]"
          to "- [X]". Any other task id is rejected, so only one task can be
          completed at a time. --read (parts read) and --verify (verification
          commands and results) are required and echoed back as the task's
          progress report in the `progress` field, which ends with how many
          tasks remain in --scope (excluding --skip) and a reminder to run
          `next` right away until none remain.

All output is JSON on stdout. Exit status: 0 success, 1 logical error (task not
found, already done, not the issued task), 2 invalid arguments or unreadable
file. `check` writes only to the given tasks.md; `next` and `check` keep the
issued task id in a small state file under the system temp directory (never in
the project). No network access.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import tempfile
from pathlib import Path

PHASE_RE = re.compile(r"^## Phase (\d+): (.+?)\s*$")
H2_RE = re.compile(r"^## ")
GROUP_RE = re.compile(r"^### (.+?)\s*$")
TASK_RE = re.compile(r"^- \[( |x|X)\] (T\d{3})\b")
MUST_READ_RE = re.compile(r"^\s+- \*\*Must Read\*\*\s*$")
LEVEL_RE = re.compile(r"^\s+- \*\*(Must Read|Optional)\*\*\s*$")
REF_LINE_RE = re.compile(r"^\s{4,}- \S")
PENDING_REF_RE = re.compile(r"待確認\s*(\d+)")
PENDING_DEF_RE = re.compile(r"^- 待確認\s*(\d+)：")
FIELD_RE = {
    "goal": re.compile(r"^\*\*Goal\*\*:\s*(.*)$"),
    "independent_test": re.compile(r"^\*\*Independent Test\*\*:\s*(.*)$"),
    "checkpoint": re.compile(r"^\*\*Checkpoint\*\*:\s*(.*)$"),
}
CONTEXT_SECTIONS = [
    "Reference Loading Contract",
    "Path Conventions",
    "Dependencies & Execution Order",
    "Notes",
]


class UsageError(Exception):
    """Invalid arguments or input file (exit 2)."""


class LogicError(Exception):
    """Valid input but the request cannot be fulfilled (exit 1)."""


def state_path(tasks_md: Path) -> Path:
    key = hashlib.sha256(str(tasks_md.resolve()).encode("utf-8")).hexdigest()[:16]
    return Path(tempfile.gettempdir()) / "implement-tasks-state" / f"{key}.json"


def load_issued(tasks_md: Path) -> str | None:
    try:
        data = json.loads(state_path(tasks_md).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    return data.get("issued")


def save_issued(tasks_md: Path, issued: str | None) -> None:
    path = state_path(tasks_md)
    if issued is None:
        path.unlink(missing_ok=True)
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"tasks_md": str(tasks_md.resolve()), "issued": issued}),
                    encoding="utf-8")


def read_lines(path: Path) -> list[str]:
    if not path.is_file():
        raise UsageError(f"tasks.md not found: {path}")
    return path.read_text(encoding="utf-8").splitlines(keepends=True)


def parse(lines: list[str]) -> tuple[list[dict], list[dict]]:
    """Return (phases, tasks) in file order."""
    phases: list[dict] = []
    tasks: list[dict] = []
    phase: dict | None = None
    group: str | None = None
    current: dict | None = None

    def close_task(end: int) -> None:
        nonlocal current
        if current is not None:
            current["end"] = end
            current = None

    for i, raw in enumerate(lines):
        line = raw.rstrip("\n")
        if H2_RE.match(line):
            close_task(i)
            group = None
            m = PHASE_RE.match(line)
            if m:
                phase = {"number": int(m.group(1)), "title": m.group(2), "goal": None,
                         "independent_test": None, "checkpoint": None}
                phases.append(phase)
            else:
                phase = None
            continue
        if phase is None:
            continue
        if line.startswith("---"):
            close_task(i)
            continue
        g = GROUP_RE.match(line)
        if g:
            close_task(i)
            group = g.group(1)
            continue
        for key, rx in FIELD_RE.items():
            fm = rx.match(line)
            if fm:
                close_task(i)
                phase[key] = fm.group(1).strip()
                break
        else:
            t = TASK_RE.match(line)
            if t:
                close_task(i)
                current = {"id": t.group(2), "done": t.group(1) != " ", "line": i,
                           "end": None, "phase": phase["number"], "group": group}
                tasks.append(current)
            elif current is not None and line.strip() and not line.startswith((" ", "\t")):
                close_task(i)
    close_task(len(lines))
    return phases, tasks


def section_text(lines: list[str], title: str) -> str | None:
    start = None
    for i, raw in enumerate(lines):
        if raw.rstrip("\n") == f"## {title}":
            start = i
            break
    if start is None:
        return None
    end = len(lines)
    for j in range(start + 1, len(lines)):
        if H2_RE.match(lines[j]):
            end = j
            break
    return "".join(lines[start:end]).strip()


def tests_line(lines: list[str]) -> str | None:
    for raw in lines:
        if raw.startswith("**Tests**:"):
            return raw.strip()
    return None


def pending_notes(lines: list[str]) -> dict[str, str]:
    notes = section_text(lines, "Notes") or ""
    result: dict[str, str] = {}
    for line in notes.splitlines():
        m = PENDING_DEF_RE.match(line)
        if m:
            result[m.group(1)] = line[2:].strip()
    return result


def format_issues(lines: list[str], tasks: list[dict]) -> list[str]:
    issues: list[str] = []
    if section_text(lines, "Reference Loading Contract") is None:
        issues.append("缺少 `## Reference Loading Contract` 區塊")
    if not tasks:
        issues.append("找不到任何任務行（`- [ ] T001 ...`）")
    seen: set[str] = set()
    for t in tasks:
        if t["id"] in seen:
            issues.append(f"{t['id']}：任務 ID 重複")
        seen.add(t["id"])
        block = lines[t["line"] + 1:t["end"]]
        must = [k for k, raw in enumerate(block) if MUST_READ_RE.match(raw.rstrip("\n"))]
        if not must:
            issues.append(f"{t['id']}：沒有 **Must Read**")
            continue
        refs = 0
        for raw in block[must[0] + 1:]:
            line = raw.rstrip("\n")
            if LEVEL_RE.match(line):
                break
            if REF_LINE_RE.match(line):
                refs += 1
        if refs == 0:
            issues.append(f"{t['id']}：**Must Read** 底下沒有參考行")
    return issues


def resolve_scope(spec: str | None, phases: list[dict], tasks: list[dict]) -> list[str]:
    ids = [t["id"] for t in tasks]
    if not spec:
        return ids
    wanted: set[str] = set()
    for token in (s.strip() for s in spec.split(",")):
        if not token:
            continue
        pm = re.fullmatch(r"phase:(\d+)", token, re.I)
        rm = re.fullmatch(r"(T\d{3})-(T\d{3})", token, re.I)
        if pm:
            n = int(pm.group(1))
            if n not in {p["number"] for p in phases}:
                raise LogicError(f"--scope 指定的 Phase 不存在：{token}")
            wanted.update(t["id"] for t in tasks if t["phase"] == n)
        elif rm:
            a, b = rm.group(1).upper(), rm.group(2).upper()
            if a not in ids or b not in ids:
                raise LogicError(f"--scope 指定的任務不存在：{token}")
            lo, hi = sorted((ids.index(a), ids.index(b)))
            wanted.update(ids[lo:hi + 1])
        elif re.fullmatch(r"T\d{3}", token, re.I):
            if token.upper() not in ids:
                raise LogicError(f"--scope 指定的任務不存在：{token}")
            wanted.add(token.upper())
        else:
            raise UsageError(f"--scope 格式錯誤：{token}（可用 T005、T010-T014、phase:3）")
    return [i for i in ids if i in wanted]


def cmd_status(args: argparse.Namespace) -> dict:
    path = Path(args.tasks_md)
    lines = read_lines(path)
    phases, tasks = parse(lines)
    issues = format_issues(lines, tasks)
    try:
        scope = resolve_scope(args.scope, phases, tasks)
    except LogicError as exc:
        issues.append(str(exc))
        scope = []
    done = {t["id"] for t in tasks if t["done"]}
    context_parts = [p for p in [tests_line(lines)] if p]
    context_parts += [s for s in (section_text(lines, t) for t in CONTEXT_SECTIONS) if s]
    return {
        "tasks_md": str(path.resolve()),
        "total": len(tasks),
        "done": len(done),
        "scope": {"total": len(scope), "done": sum(1 for i in scope if i in done),
                  "remaining": [i for i in scope if i not in done]},
        "phases": [{"number": p["number"], "title": p["title"],
                    "total": sum(1 for t in tasks if t["phase"] == p["number"]),
                    "done": sum(1 for t in tasks if t["phase"] == p["number"] and t["done"])}
                   for p in phases],
        "format_issues": issues,
        "context": "\n\n".join(context_parts),
    }


def cmd_next(args: argparse.Namespace) -> dict:
    path = Path(args.tasks_md)
    lines = read_lines(path)
    phases, tasks = parse(lines)
    scope = resolve_scope(args.scope, phases, tasks)
    skip = {s.upper() for s in args.skip}
    unknown = sorted(skip - {t["id"] for t in tasks})
    if unknown:
        raise LogicError(f"--skip 指定的任務不存在：{', '.join(unknown)}")
    by_id = {t["id"]: t for t in tasks}
    remaining = [i for i in scope if not by_id[i]["done"] and i not in skip]
    result: dict = {"task": None, "reissued": False, "scope_remaining": remaining,
                    "skipped": [i for i in scope if i in skip and not by_id[i]["done"]]}
    issued = load_issued(path)
    if issued in remaining:
        result["reissued"] = True
        chosen = issued
    elif remaining:
        chosen = remaining[0]
    else:
        save_issued(path, None)
        return result
    save_issued(path, chosen)
    t = by_id[chosen]
    phase = next(p for p in phases if p["number"] == t["phase"])
    block = "".join(lines[t["line"]:t["end"]]).rstrip()
    notes = pending_notes(lines)
    pending = []
    for n in dict.fromkeys(PENDING_REF_RE.findall(block)):
        pending.append({"n": int(n), "text": notes.get(n)})
    others = [x for x in tasks if x["phase"] == t["phase"] and x["id"] != t["id"]]
    result["task"] = {
        "id": t["id"],
        "block": block,
        "phase": {k: phase[k] for k in ("number", "title", "goal", "independent_test", "checkpoint")},
        "group": t["group"],
        "pending": pending,
        "closes_phase": all(x["done"] or x["id"] in skip for x in others),
    }
    return result


def cmd_check(args: argparse.Namespace) -> dict:
    path = Path(args.tasks_md)
    lines = read_lines(path)
    _, tasks = parse(lines)
    task_id = args.task_id.upper()
    read, verify = args.read.strip(), args.verify.strip()
    if not read or not verify:
        raise UsageError("--read 與 --verify 不得為空：打勾前必須寫出本任務讀取的部位與驗證命令和結果")
    t = next((x for x in tasks if x["id"] == task_id), None)
    if t is None:
        raise LogicError(f"找不到任務：{task_id}")
    if t["done"]:
        raise LogicError(f"任務已打勾：{task_id}")
    issued = load_issued(path)
    if issued != task_id:
        current = f"目前任務是 {issued}" if issued else "尚未以 next 取得任務"
        raise LogicError(f"{current}，不能打勾 {task_id}；一次只能完成一個任務，"
                         "請先執行 next，完成該任務的實作與驗證後再打勾")
    phases, _ = parse(lines)
    scope = resolve_scope(args.scope, phases, tasks)
    skip = {s.upper() for s in args.skip}
    lines[t["line"]] = lines[t["line"]].replace("- [ ]", "- [X]", 1)
    path.write_text("".join(lines), encoding="utf-8")
    save_issued(path, None)
    by_id = {x["id"]: x for x in tasks}
    remaining = sum(1 for i in scope if i != task_id and not by_id[i]["done"] and i not in skip)
    if remaining:
        tail = f"範圍內還剩 {remaining} 個任務：立即執行 next；全部完成前不得停下來或詢問是否繼續"
    else:
        tail = "範圍內任務已全部完成：進入完成報告"
    progress = f"{task_id} 已通過，回寫後繼續下一個任務\n- 讀取：{read}\n- 驗證：{verify}\n{tail}"
    return {"progress": progress, "remaining": remaining, "id": task_id, "done": sum(1 for x in tasks if x["done"]) + 1, "total": len(tasks)}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    scope_help = "逗號分隔的範圍，例如 T005,T010-T014,phase:3；省略時為全部任務"
    p_status = sub.add_parser("status", help="檢查格式、統計進度並輸出執行脈絡")
    p_status.add_argument("tasks_md", help="tasks.md 路徑")
    p_status.add_argument("--scope", help=scope_help)
    p_next = sub.add_parser("next", help="輸出下一個要執行的任務")
    p_next.add_argument("tasks_md", help="tasks.md 路徑")
    p_next.add_argument("--scope", help=scope_help)
    p_next.add_argument("--skip", nargs="*", default=[], metavar="ID", help="受阻、不執行的任務 ID")
    p_check = sub.add_parser("check", help="把目前發出的任務標為 [X]")
    p_check.add_argument("tasks_md", help="tasks.md 路徑")
    p_check.add_argument("task_id", help="任務 ID，例如 T005")
    p_check.add_argument("--read", required=True, help="本任務讀取的 Must Read 與 Optional 部位")
    p_check.add_argument("--verify", required=True, help="本任務的驗證命令與結果")
    p_check.add_argument("--scope", help=scope_help)
    p_check.add_argument("--skip", nargs="*", default=[], metavar="ID", help="受阻、不執行的任務 ID")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    handlers = {"status": cmd_status, "next": cmd_next, "check": cmd_check}
    try:
        result = handlers[args.command](args)
    except UsageError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    except LogicError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    except OSError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
