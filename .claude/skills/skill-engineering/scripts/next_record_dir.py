# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Compute the next skill-engineering record directory without creating it."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

RECORDS_RELATIVE = Path("specs") / "skill-engineering"
NUMBERED_DIR_RE = re.compile(r"^(\d{2})-")
SKILL_NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
FORBIDDEN_TOPIC_CHARS = set('/\\:*?"<>|')


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Print the next record directory under specs/skill-engineering/ as JSON. The number is the highest existing number plus one; gaps are never reused. No files are created."
    )
    parser.add_argument("--project-root", type=Path, required=True, help="Project root that holds specs/.")
    parser.add_argument("--skill", required=True, help="Target skill name in kebab-case.")
    parser.add_argument("--topic", required=True, help="Short topic, for example 建立 or the problem summary.")
    args = parser.parse_args()

    root: Path = args.project_root.expanduser().resolve()
    if not root.is_dir():
        print(f"{root}: project root is not a directory", file=sys.stderr)
        return 2
    if not SKILL_NAME_RE.match(args.skill):
        print(f"{args.skill!r}: skill name must be kebab-case", file=sys.stderr)
        return 2
    topic = args.topic.strip()
    if not topic or topic.startswith(".") or any(char in FORBIDDEN_TOPIC_CHARS for char in topic) or any(c.isspace() for c in topic):
        print(f"{args.topic!r}: topic must be non-empty, without whitespace, path separators or reserved characters", file=sys.stderr)
        return 2

    records = root / RECORDS_RELATIVE
    numbers = []
    if records.is_dir():
        for entry in records.iterdir():
            match = NUMBERED_DIR_RE.match(entry.name)
            if entry.is_dir() and match:
                numbers.append(int(match.group(1)))
    next_number = max(numbers, default=0) + 1
    if next_number > 99:
        print(f"{records}: record numbers are exhausted (highest is {max(numbers):02d})", file=sys.stderr)
        return 1

    name = f"{next_number:02d}-{args.skill}-{topic}"
    result = {
        "number": f"{next_number:02d}",
        "record_dir": (RECORDS_RELATIVE / name).as_posix() + "/",
        "absolute_path": (records / name).as_posix(),
        "existing_numbers": [f"{number:02d}" for number in sorted(numbers)],
    }
    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
