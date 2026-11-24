# /// script
# requires-python = ">=3.9"
# dependencies = []
# ///
"""逐字比對 course-article 筆記的來源欄；不寫入檔案。"""

import argparse
import re
import sys
from pathlib import Path


SOURCE_HEADER = "逐字稿原句或時間碼"
QUOTED = re.compile(r"「([^「」\r\n]*)」")
TIMESTAMP = r"(?:\d+:)?\d{1,2}:[0-5]\d(?:[.,]\d+)?"
TIMESTAMP_ONLY = re.compile(rf"[（(\[]?\s*{TIMESTAMP}(?:\s*[～–—-]\s*{TIMESTAMP})?\s*[）)\]]?")


def table_cells(line):
    """拆分樣板表格，保留引句空白並解碼 Markdown 表格的跳脫直線。"""
    if not (line.startswith("|") and line.endswith("|")):
        return []
    cells = re.split(r"(?<!\\)((?:\\\\)*)\|", line[1:-1])
    # 分隔符前有偶數支反斜線時，這些反斜線仍屬於前一欄。
    return [
        re.sub(r"\\\|", "|", cells[i] + (cells[i + 1] if i + 1 < len(cells) else "")).strip()
        for i in range(0, len(cells), 2)
    ]


def check(notes, transcript):
    lines = notes.splitlines()
    header = next(
        ((i, cells) for i, line in enumerate(lines)
         if SOURCE_HEADER in (cells := table_cells(line.strip()))),
        None,
    )
    if header is None:
        return 0, 0, [f"找不到「{SOURCE_HEADER}」欄。"]
    index, columns = header
    divider = table_cells(lines[index + 1].strip()) if index + 1 < len(lines) else []
    if len(divider) != len(columns) or not all(re.fullmatch(r":?-{3,}:?", c) for c in divider):
        return 0, 0, [f"第 {index + 2} 行：來源表格缺少有效的分隔列。"]

    source_index = columns.index(SOURCE_HEADER)
    errors, quotes, timestamps = [], 0, 0
    row_count = 0
    for line_number, line in enumerate(lines[index + 2:], start=index + 3):
        if not line.lstrip().startswith("|"):
            break
        row_count += 1
        cells = table_cells(line.strip())
        if len(cells) != len(columns):
            errors.append(f"第 {line_number} 行：來源表格欄數不符。")
            continue
        source = cells[source_index]
        excerpts = QUOTED.findall(source)
        if not excerpts:
            if TIMESTAMP_ONLY.fullmatch(source):
                timestamps += 1
            else:
                errors.append(f"第 {line_number} 行：來源欄須提供以「」標示的引句或時間碼。")
            continue
        remaining = QUOTED.sub("", source)
        if "「" in remaining or "」" in remaining:
            errors.append(f"第 {line_number} 行：引句標記不完整或巢狀。")
        for number, excerpt in enumerate(excerpts, start=1):
            quotes += 1
            if not excerpt.strip() or excerpt not in transcript:
                errors.append(f"第 {line_number} 行，第 {number} 段引句與逐字稿不符。")
    if not row_count:
        errors.append("來源表格沒有收穫資料列。")
    return quotes, timestamps, errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--notes", required=True, type=Path, help="筆記 Markdown 路徑")
    parser.add_argument("--transcript", required=True, type=Path, help="UTF-8 逐字稿路徑")
    args = parser.parse_args()
    try:
        notes = args.notes.read_bytes().decode("utf-8-sig")
        transcript = args.transcript.read_bytes().decode("utf-8-sig")
        if not transcript.strip():
            raise ValueError("逐字稿是空檔案。")
    except (OSError, ValueError) as exc:
        print(f"引句檢查無法執行：{exc}", file=sys.stderr)
        return 2
    quotes, timestamps, errors = check(notes, transcript)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1
    print(f"引句檢查通過：{quotes} 段逐字相符；{timestamps} 列僅有時間碼，由流程另行核對。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
