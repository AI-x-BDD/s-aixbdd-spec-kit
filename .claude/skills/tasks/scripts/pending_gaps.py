# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""List the gaps of convergence.md that the tasks skill must still append.

Reads the latest round ("## 第 N 輪", largest N) of convergence.md and its
"### 缺口" table. A row is a candidate when its 處理 column, without backticks
and surrounding spaces, equals "附加任務". A candidate that a task of tasks.md
already cites in a **Must Read** reference line as `convergence.md` → G# moves
to "skipped". Also reports the largest "## Phase N:" number and the largest
task id of tasks.md.

Prints one JSON object to stdout: round, round_result, pending, skipped,
max_phase, max_task_id. Reads files only; writes no file and makes no network
access.

Exit status: 0 on success (pending may be empty); 1 when no "第 N 輪" heading,
no 缺口 table in the latest round, or a missing table column is found, or a
file cannot be read; 2 on a command-line error.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROUND_RE = re.compile(r"^##\s+第\s*(\d+)\s*輪\s*$")
H2_RE = re.compile(r"^##\s")
H3_RE = re.compile(r"^###\s")
GAP_HEADING_RE = re.compile(r"^###\s+缺口\s*$")
RESULT_RE = re.compile(r"^-\s*\*\*結果\*\*\s*[：:]\s*(.*?)\s*$")
PHASE_RE = re.compile(r"^## Phase (\d+):")
TASK_RE = re.compile(r"^- \[[ xX]\] T(\d+)\b")
LEVEL_RE = re.compile(r"^\s*-\s+\*\*(Must Read|Optional)\*\*")
CITE_RE = re.compile(r"`convergence\.md`\s*→\s*(G\d+)")
COLUMNS = {
    "ID": "id",
    "缺口類型": "type",
    "嚴重度": "severity",
    "來源": "source",
    "證據": "evidence",
    "剩餘工作": "remaining",
    "處理": "handling",
}


class GapError(Exception):
    """Raised for input problems that must exit with status 1."""


def read_lines(path: Path) -> list[str]:
    try:
        return path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        raise GapError(f"{path}: {exc.strerror or exc}") from exc


def split_row(line: str) -> list[str]:
    """Split a Markdown table row on pipes outside backticks and not escaped."""
    cells: list[str] = []
    current: list[str] = []
    in_code = False
    i = 0
    while i < len(line):
        ch = line[i]
        if ch == "\\" and i + 1 < len(line) and line[i + 1] == "|":
            current.append("|")
            i += 2
            continue
        if ch == "`":
            in_code = not in_code
        if ch == "|" and not in_code:
            cells.append("".join(current).strip())
            current = []
        else:
            current.append(ch)
        i += 1
    cells.append("".join(current).strip())
    if line.strip().startswith("|"):
        cells = cells[1:]
    if line.strip().endswith("|") and cells:
        cells = cells[:-1]
    return cells


def latest_round(lines: list[str]) -> tuple[int, list[str]]:
    starts = [(int(m.group(1)), i) for i, line in enumerate(lines) if (m := ROUND_RE.match(line))]
    if not starts:
        raise GapError('convergence.md: 找不到任何 "## 第 N 輪" 標題')
    number, start = max(starts)
    end = len(lines)
    for i in range(start + 1, len(lines)):
        if H2_RE.match(lines[i]):
            end = i
            break
    return number, lines[start + 1 : end]


def parse_gap_table(number: int, section: list[str]) -> list[dict[str, str]]:
    start = next((i for i, line in enumerate(section) if GAP_HEADING_RE.match(line)), None)
    if start is None:
        raise GapError(f'convergence.md: 第 {number} 輪找不到 "### 缺口" 表')
    table: list[str] = []
    for line in section[start + 1 :]:
        if H3_RE.match(line):
            break
        if line.strip().startswith("|"):
            table.append(line)
        elif table:
            break
    if len(table) < 2:
        raise GapError(f'convergence.md: 第 {number} 輪的 "### 缺口" 沒有表格')
    header = split_row(table[0])
    missing = [name for name in COLUMNS if name not in header]
    if missing:
        raise GapError(f"convergence.md: 第 {number} 輪的缺口表缺少欄位：{'、'.join(missing)}")
    index = {COLUMNS[name]: header.index(name) for name in COLUMNS}
    rows: list[dict[str, str]] = []
    for line in table[2:]:
        cells = split_row(line)
        if not any(cells):
            continue
        row = {key: (cells[pos].strip() if pos < len(cells) else "") for key, pos in index.items()}
        if row["id"]:
            rows.append(row)
    return rows


def round_result(section: list[str]) -> str:
    for line in section:
        if m := RESULT_RE.match(line):
            return m.group(1)
    return ""


def scan_tasks(lines: list[str]) -> tuple[int | None, str | None, dict[str, list[str]]]:
    max_phase: int | None = None
    max_task = 0
    cited: dict[str, list[str]] = {}
    current_task: str | None = None
    level: str | None = None
    for line in lines:
        if m := PHASE_RE.match(line):
            number = int(m.group(1))
            max_phase = number if max_phase is None else max(max_phase, number)
            current_task, level = None, None
            continue
        if m := TASK_RE.match(line):
            max_task = max(max_task, int(m.group(1)))
            current_task, level = f"T{int(m.group(1)):03d}", None
            continue
        if m := LEVEL_RE.match(line):
            level = m.group(1)
            continue
        if current_task and level == "Must Read":
            for gap_id in CITE_RE.findall(line):
                owners = cited.setdefault(gap_id, [])
                if current_task not in owners:
                    owners.append(current_task)
    return max_phase, (f"T{max_task:03d}" if max_task else None), cited


def build_report(convergence: Path, tasks: Path) -> dict[str, object]:
    number, section = latest_round(read_lines(convergence))
    rows = parse_gap_table(number, section)
    max_phase, max_task_id, cited = scan_tasks(read_lines(tasks))
    pending: list[dict[str, str]] = []
    skipped: list[dict[str, str]] = []
    for row in rows:
        handling = row["handling"].replace("`", "").strip()
        if handling != "附加任務":
            skipped.append({"id": row["id"], "handling": handling, "reason": "處理不是附加任務"})
        elif row["id"] in cited:
            owners = "、".join(cited[row["id"]])
            skipped.append({"id": row["id"], "handling": handling, "reason": f"已被 {owners} 引用"})
        else:
            pending.append({key: row[key] for key in ("id", "type", "severity", "source", "evidence", "remaining")})
    return {
        "round": number,
        "round_result": round_result(section),
        "pending": pending,
        "skipped": skipped,
        "max_phase": max_phase,
        "max_task_id": max_task_id,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="List convergence.md gaps not yet appended to tasks.md.")
    parser.add_argument("--convergence", type=Path, required=True, help="path to convergence.md")
    parser.add_argument("--tasks", type=Path, required=True, help="path to tasks.md")
    args = parser.parse_args()
    try:
        report = build_report(args.convergence, args.tasks)
    except GapError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
