# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""決定 spec 目錄編號並建立 specs/<NNN>-<short-name>/。

成功：標準輸出 JSON（number、spec_dir、duplicates），退出狀態 0。
目標路徑已存在：不建立任何東西，退出狀態 1。
參數錯誤（--short-name 不合法等）：退出狀態 2。
既有編號重複：在標準錯誤輸出警告，照樣繼續。
"""

import json
import re
import sys
from argparse import ArgumentParser
from collections import defaultdict
from pathlib import Path

SHORT_NAME_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
DIR_PATTERN = re.compile(r"^(\d{3})-.+")


def main() -> int:
    parser = ArgumentParser(description="決定編號並建立 spec 目錄")
    parser.add_argument("--project-root", type=Path, required=True, help="專案根目錄")
    parser.add_argument(
        "--short-name",
        required=True,
        help="功能簡稱，只接受小寫英數與連字號（例如 club-event-signup）",
    )
    args = parser.parse_args()

    if not SHORT_NAME_PATTERN.fullmatch(args.short_name):
        print(
            f"--short-name 只接受小寫英數與連字號：{args.short_name!r}",
            file=sys.stderr,
        )
        return 2

    root: Path = args.project_root.resolve()
    if not root.is_dir():
        print(f"--project-root 不是目錄：{root}", file=sys.stderr)
        return 2

    specs = root / "specs"
    groups: dict[str, list[str]] = defaultdict(list)
    if specs.is_dir():
        for child in sorted(specs.iterdir()):
            match = DIR_PATTERN.match(child.name)
            if child.is_dir() and match:
                groups[match.group(1)].append(f"specs/{child.name}")

    duplicates = [
        {"number": number, "dirs": dirs}
        for number, dirs in sorted(groups.items())
        if len(dirs) > 1
    ]
    for item in duplicates:
        print(
            f"警告：編號 {item['number']} 有重複目錄：{', '.join(item['dirs'])}",
            file=sys.stderr,
        )

    number = f"{(max((int(n) for n in groups), default=0) + 1):03d}"
    target = specs / f"{number}-{args.short_name}"
    if target.exists() or target.is_symlink():
        print(f"目標路徑已存在，不建立也不覆寫：{target}", file=sys.stderr)
        return 1

    target.mkdir(parents=True)
    print(
        json.dumps(
            {"number": number, "spec_dir": str(target), "duplicates": duplicates},
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
