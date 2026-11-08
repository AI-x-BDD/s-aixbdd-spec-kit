# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Read and update the progress of a tasks.md produced by the tasks skill.

Subcommands:
  status  check the tasks.md format, count done / remaining tasks and print
          the shared execution context (Tests policy, Reference Loading
          Contract, Path Conventions, Dependencies & Execution Order, Notes).
          It also reads the constitution files from the project root (two
          levels above the directory that holds tasks.md, i.e. <root> in
          <root>/specs/<dir>/tasks.md): .agents/constitution/shared.md and
          .agents/constitution/skills/implement/code.md, in that order. The
          `constitution` field (before `context`) is {"files": [{"path",
          "content"}], "missing": [path]} with paths relative to <root> and the
          full file text in `content`. The paths actually loaded are stored in
          the state file as `constitution_files`.
          --reset first clears the state file (issued task, blocked list and
          constitution_files), then stores the newly loaded paths.
  next    print the task to run now. While the task issued by the previous
          `next` is still unchecked and not blocked, print that same task
          again; otherwise issue the first unchecked, unblocked task in file
          order inside --scope. Output includes the task block, phase
          information, group heading, referenced pending notes, the blocked
          task ids inside --scope (`blocked`) and whether it closes its phase.
          When no task can be issued (`task` is null), the output also has
          `next_step`: the reminder to run `report` right away and then write
          the completion report as Phase 3 says. `next_step` is absent when a
          task is issued.
  check   mark the currently issued task as done by changing only its "- [ ]"
          to "- [X]". Any other task id is rejected, so only one task can be
          completed at a time. --read (parts read) and --verify (verification
          commands and results) are required and echoed back as the task's
          progress report in the `progress` field, which ends with how many
          tasks remain in --scope (excluding blocked tasks) and a reminder to
          run `next` right away; when none remain, the last line is instead
          the reminder to run `report` right away and then write the completion
          report as Phase 3 says.
  block   mark the currently issued, unchecked task as blocked, without
          changing tasks.md. --cause is env, constitution or dependency;
          --detail is required; constitution also requires --rule; dependency
          also requires --depends (each id must already be blocked). The
          `progress` field has three lines: "<ID> 受阻，繼續下一個任務", the
          cause line, and the same last line as `check` (remaining-task
          reminder, or the `report` reminder when none remain).
          `next` no longer issues blocked tasks.
  report  build the fixed-format completion report text (`report` field):
          done counts, blocked tasks inside --scope, and the five-item
          constitution compliance block. Item 1 lists the `constitution_files`
          stored in the state file by `status`, joined with the separator
          "、" ("沒有憲法檔" when empty or missing). --must-pass is yes or no
          (no requires --must-detail); --deviation and --unapplied are
          repeatable. It reads tasks.md and the state file only; it writes
          nothing and does not clear the state file.

All output is JSON on stdout. Exit status: 0 success, 1 logical error (task not
found, already done, already blocked, not the issued task), 2 invalid arguments
or unreadable file. `check` is the only subcommand that writes tasks.md; `status`,
`next`, `check` and `block` keep the issued task id, the blocked list and the
loaded constitution paths in a small state file under the system temp
directory (never in the project); the file is deleted when all three are
empty. No network access.
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
CONSTITUTION_PATHS = [
    ".agents/constitution/shared.md",
    ".agents/constitution/skills/implement/code.md",
]
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


def load_state(tasks_md: Path) -> dict:
    try:
        data = json.loads(state_path(tasks_md).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        data = {}
    if not isinstance(data, dict):
        data = {}
    blocked = data.get("blocked")
    files = data.get("constitution_files")
    return {"issued": data.get("issued"),
            "blocked": blocked if isinstance(blocked, list) else [],
            "constitution_files": files if isinstance(files, list) else []}


def save_state(tasks_md: Path, issued: str | None, blocked: list[dict],
               constitution_files: list[str]) -> None:
    path = state_path(tasks_md)
    if issued is None and not blocked and not constitution_files:
        path.unlink(missing_ok=True)
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"tasks_md": str(tasks_md.resolve()), "issued": issued,
                                "blocked": blocked,
                                "constitution_files": constitution_files},
                               ensure_ascii=False),
                    encoding="utf-8")


def load_issued(tasks_md: Path) -> str | None:
    return load_state(tasks_md)["issued"]


def save_issued(tasks_md: Path, issued: str | None) -> None:
    state = load_state(tasks_md)
    save_state(tasks_md, issued, state["blocked"], state["constitution_files"])


def blocked_ids(tasks_md: Path) -> set[str]:
    return {b.get("id") for b in load_state(tasks_md)["blocked"] if isinstance(b, dict)}


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


def load_constitution(tasks_md: Path) -> dict:
    root = tasks_md.resolve().parents[2]
    files: list[dict] = []
    missing: list[str] = []
    for rel in CONSTITUTION_PATHS:
        f = root.joinpath(*rel.split("/"))
        if f.is_file():
            files.append({"path": rel, "content": f.read_text(encoding="utf-8")})
        else:
            missing.append(rel)
    return {"files": files, "missing": missing}


def cmd_status(args: argparse.Namespace) -> dict:
    path = Path(args.tasks_md)
    lines = read_lines(path)
    if args.reset:
        state_path(path).unlink(missing_ok=True)
    constitution = load_constitution(path)
    state = load_state(path)
    save_state(path, state["issued"], state["blocked"],
               [f["path"] for f in constitution["files"]])
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
        "constitution": constitution,
        "context": "\n\n".join(context_parts),
    }


def cmd_next(args: argparse.Namespace) -> dict:
    path = Path(args.tasks_md)
    lines = read_lines(path)
    phases, tasks = parse(lines)
    scope = resolve_scope(args.scope, phases, tasks)
    skip = blocked_ids(path)
    by_id = {t["id"]: t for t in tasks}
    remaining = [i for i in scope if not by_id[i]["done"] and i not in skip]
    result: dict = {"task": None, "reissued": False, "scope_remaining": remaining,
                    "blocked": [i for i in scope if i in skip and not by_id[i]["done"]]}
    issued = load_issued(path)
    if issued in remaining:
        result["reissued"] = True
        chosen = issued
    elif remaining:
        chosen = remaining[0]
    else:
        save_issued(path, None)
        result["next_step"] = DONE_REMINDER
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


DONE_REMINDER = "範圍內任務已全部完成：立即執行 report 取得完成報告摘要，再依 Phase 3 撰寫完成報告"


def remaining_tail(remaining: int) -> str:
    if remaining:
        return f"範圍內還剩 {remaining} 個任務：立即執行 next；全部完成前不得停下來或詢問是否繼續"
    return DONE_REMINDER


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
    skip = blocked_ids(path)
    lines[t["line"]] = lines[t["line"]].replace("- [ ]", "- [X]", 1)
    path.write_text("".join(lines), encoding="utf-8")
    save_issued(path, None)
    by_id = {x["id"]: x for x in tasks}
    remaining = sum(1 for i in scope if i != task_id and not by_id[i]["done"] and i not in skip)
    tail = remaining_tail(remaining)
    progress = f"{task_id} 已通過，回寫後繼續下一個任務\n- 讀取：{read}\n- 驗證：{verify}\n{tail}"
    return {"progress": progress, "remaining": remaining, "id": task_id, "done": sum(1 for x in tasks if x["done"]) + 1, "total": len(tasks)}


def cmd_block(args: argparse.Namespace) -> dict:
    path = Path(args.tasks_md)
    task_id = args.task_id.upper()
    detail = args.detail.strip()
    rule = (args.rule or "").strip()
    depends = [d.upper() for d in (args.depends or [])]
    if not detail:
        raise UsageError("--detail 不得為空：受阻必須寫出具體原因")
    if args.cause == "constitution" and not rule:
        raise UsageError("--cause constitution 必須提供 --rule（衝突的憲法規則）")
    if args.cause == "dependency" and not depends:
        raise UsageError("--cause dependency 必須提供 --depends（已受阻的任務 ID）")
    state = load_state(path)
    already = {b.get("id") for b in state["blocked"] if isinstance(b, dict)}
    if args.cause == "dependency":
        missing = [d for d in depends if d not in already]
        if missing:
            raise UsageError(f"--depends 指定的任務不在 blocked 中：{', '.join(missing)}")
    lines = read_lines(path)
    phases, tasks = parse(lines)
    t = next((x for x in tasks if x["id"] == task_id), None)
    if t is None:
        raise LogicError(f"找不到任務：{task_id}")
    if t["done"]:
        raise LogicError(f"任務已打勾：{task_id}")
    if task_id in already:
        raise LogicError(f"任務已受阻：{task_id}")
    issued = state["issued"]
    if issued != task_id:
        current = f"目前任務是 {issued}" if issued else "尚未以 next 取得任務"
        raise LogicError(f"{current}，不能標記 {task_id} 受阻；一次只能處理一個任務，"
                         "請先執行 next，確認該任務確實受阻後再標記")
    scope = resolve_scope(args.scope, phases, tasks)
    entry = {"id": task_id, "cause": args.cause, "detail": detail,
             "rule": rule or None, "depends": depends}
    new_blocked = state["blocked"] + [entry]
    save_state(path, None, new_blocked, state["constitution_files"])
    skip = already | {task_id}
    by_id = {x["id"]: x for x in tasks}
    remaining = sum(1 for i in scope if not by_id[i]["done"] and i not in skip)
    if args.cause == "constitution":
        reason = f"- 原因（憲法衝突）：{rule}；{detail}"
    elif args.cause == "dependency":
        reason = f"- 原因（連帶受阻）：依賴 {'、'.join(depends)}；{detail}"
    else:
        reason = f"- 原因（環境限制）：{detail}"
    progress = f"{task_id} 受阻，繼續下一個任務\n{reason}\n{remaining_tail(remaining)}"
    return {"progress": progress, "remaining": remaining, "id": task_id,
            "blocked": sum(1 for i in scope if i in skip and not by_id[i]["done"])}


CAUSE_LABEL = {"constitution": "憲法衝突", "dependency": "連帶受阻", "env": "環境限制"}


def cmd_report(args: argparse.Namespace) -> dict:
    path = Path(args.tasks_md)
    lines = read_lines(path)
    phases, tasks = parse(lines)
    detail = (args.must_detail or "").strip()
    if args.must_pass == "no" and not detail:
        raise UsageError("--must-pass no 必須提供 --must-detail（未通過的原因）")
    scope = resolve_scope(args.scope, phases, tasks)
    done = {t["id"] for t in tasks if t["done"]}
    order = {t["id"]: n for n, t in enumerate(tasks)}
    in_scope = set(scope)
    blocked = sorted((b for b in load_state(path)["blocked"]
                      if isinstance(b, dict) and b.get("id") in in_scope
                      and b.get("id") not in done),
                     key=lambda b: order[b["id"]])
    scope_done = sum(1 for i in scope if i in done)

    def reason(b: dict) -> str:
        if b.get("cause") == "constitution":
            return f"{b.get('rule')}；{b.get('detail')}"
        if b.get("cause") == "dependency":
            return f"依賴 {'、'.join(b.get('depends') or [])}；{b.get('detail')}"
        return f"{b.get('detail')}"

    def items(values: list[str] | None) -> str:
        vals = [v.strip() for v in (values or []) if v.strip()]
        return "".join(f"\n- {v}" for v in vals) if vals else "無"

    out = [f"完成數：範圍內 {scope_done}／{len(scope)}（全部 {len(done)}／{len(tasks)}）"]
    if blocked:
        out.append("受阻任務：")
        out += [f"- {b['id']}（{CAUSE_LABEL.get(b.get('cause'), b.get('cause'))}）：{reason(b)}"
                for b in blocked]
    else:
        out.append("受阻任務：無")
    files = "、".join(str(f) for f in load_state(path)["constitution_files"]) or "沒有憲法檔"
    must = "全部通過" if args.must_pass == "yes" else f"未全部通過：{detail}"
    conflicts = [f"{b['id']}：{b.get('rule')}" for b in blocked if b.get("cause") == "constitution"]
    out += ["憲法遵循：",
            f"1. 已讀取的憲法檔：{files}",
            f"2. 必須／不得規則：{must}",
            f"3. 憲法偏離：{items(args.deviation)}",
            f"4. 未套用規則：{items(args.unapplied)}",
            f"5. 因憲法衝突而受阻的任務：{items(conflicts)}"]
    return {"report": "\n".join(out), "done": len(done), "total": len(tasks),
            "scope_done": scope_done, "scope_total": len(scope), "blocked": len(blocked)}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    scope_help = "逗號分隔的範圍，例如 T005,T010-T014,phase:3；省略時為全部任務"
    p_status = sub.add_parser("status", help="檢查格式、統計進度並輸出執行脈絡")
    p_status.add_argument("tasks_md", help="tasks.md 路徑")
    p_status.add_argument("--scope", help=scope_help)
    p_status.add_argument("--reset", action="store_true",
                          help="先清除狀態檔（發出中的任務、blocked 與已載入的憲法檔路徑）")
    p_next = sub.add_parser("next", help="輸出下一個要執行的任務")
    p_next.add_argument("tasks_md", help="tasks.md 路徑")
    p_next.add_argument("--scope", help=scope_help)
    p_check = sub.add_parser("check", help="把目前發出的任務標為 [X]")
    p_check.add_argument("tasks_md", help="tasks.md 路徑")
    p_check.add_argument("task_id", help="任務 ID，例如 T005")
    p_check.add_argument("--read", required=True, help="本任務讀取的 Must Read 與 Optional 部位")
    p_check.add_argument("--verify", required=True, help="本任務的驗證命令與結果")
    p_check.add_argument("--scope", help=scope_help)
    p_block = sub.add_parser("block", help="把目前發出的任務標為受阻（不修改 tasks.md）")
    p_block.add_argument("tasks_md", help="tasks.md 路徑")
    p_block.add_argument("task_id", help="任務 ID，例如 T005")
    p_block.add_argument("--cause", required=True, choices=["env", "constitution", "dependency"],
                         help="受阻原因類型")
    p_block.add_argument("--detail", required=True, help="受阻的具體說明")
    p_block.add_argument("--rule", help="constitution 必填：衝突的憲法規則")
    p_block.add_argument("--depends", nargs="+", metavar="ID",
                         help="dependency 必填：已受阻的依賴任務 ID")
    p_block.add_argument("--scope", help=scope_help)
    p_report = sub.add_parser("report", help="輸出固定格式的完成報告文字（不修改任何檔案）")
    p_report.add_argument("tasks_md", help="tasks.md 路徑")
    p_report.add_argument("--scope", help=scope_help)
    p_report.add_argument("--must-pass", required=True, choices=["yes", "no"],
                          help="必須／不得規則是否全部通過")
    p_report.add_argument("--must-detail", help="--must-pass no 時必填：未通過的原因")
    p_report.add_argument("--deviation", action="append", help="憲法偏離，可重複")
    p_report.add_argument("--unapplied", action="append", help="未套用規則，可重複")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    handlers = {"status": cmd_status, "next": cmd_next, "check": cmd_check,
                "block": cmd_block, "report": cmd_report}
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
