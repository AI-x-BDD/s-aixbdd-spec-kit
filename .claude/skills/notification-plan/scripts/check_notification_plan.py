# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Check a notification/plan.md produced by notification-plan.

Issues (exit status 1):
  - an assigned interface has no section heading, or more than one, starting
    with "<optional §><optional section number> <interface id>";
  - a cited requirement id (US, FR, NFR, SC) does not exist in spec.md;
  - one of the 8 required top-level sections is missing.
Warnings (do not change the exit status):
  - a snake_case or camelCase identifier inside backticks is not found in
    data/, contracts/, research.md or spec.md of the spec directory.

Prints JSON {"ok", "issues", "warnings"} to stdout. Reads files
only; writes no files and uses no network. Exit status 2 means invalid input.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

REQUIRED_SECTIONS = [
    "1. 範疇",
    "2. 通知狀態與轉換",
    "3. 失敗分類與重試界線",
    "4. 重複處理",
    "5. 介面規格",
    "6. 紀錄需求",
    "7. 驗收情境",
    "8. 上游衝突與使用者決定",
]
# ASCII boundaries: Python's \b treats CJK characters as word characters.
REQUIREMENT_RE = re.compile(r"(?<![A-Za-z0-9-])(US\d+|(?:FR|NFR|SC)-\d+)(?![A-Za-z0-9])")
HEADING_RE = re.compile(r"^(#{2,6})\s+(.+?)\s*$", re.M)
BACKTICK_RE = re.compile(r"`([^`\n]+)`")
IDENTIFIER_RE = re.compile(
    r"(?<![A-Za-z0-9_])([a-z][a-z0-9]*(?:_[a-z0-9]+)+|[a-z][a-z0-9]*(?:[A-Z][a-z0-9]*)+)(?![A-Za-z0-9_])"
)


def heading_interface(title: str, interface: str) -> bool:
    pattern = rf"(?:§\s*)?(?:\d+(?:\.\d+)*\.?\s+)?{re.escape(interface)}(?=\s|$)"
    return re.match(pattern, title) is not None


def requirement_exists(requirement: str, spec_text: str) -> bool:
    patterns = [re.escape(requirement)]
    story = re.fullmatch(r"US(\d+)", requirement)
    if story:
        patterns.append(rf"User Story {story.group(1)}")
    return any(re.search(rf"(?<![A-Za-z0-9-]){p}(?![0-9])", spec_text) for p in patterns)


def upstream_text(spec_dir: Path) -> str:
    parts: list[str] = []
    for name in ("spec.md", "research.md"):
        path = spec_dir / name
        if path.is_file():
            parts.append(path.read_text(encoding="utf-8"))
    for folder in ("data", "contracts"):
        directory = spec_dir / folder
        if directory.is_dir():
            for path in sorted(directory.rglob("*")):
                if path.is_file():
                    try:
                        parts.append(path.read_text(encoding="utf-8"))
                    except UnicodeDecodeError:
                        continue
    return "\n".join(parts)


def identifier_exists(identifier: str, text: str) -> bool:
    return re.search(rf"(?<![A-Za-z0-9_]){re.escape(identifier)}(?![A-Za-z0-9_])", text) is not None


def main() -> int:
    parser = argparse.ArgumentParser(description="Check notification/plan.md produced by notification-plan.")
    parser.add_argument("--spec-dir", required=True, type=Path, help="spec directory that contains spec.md")
    parser.add_argument("--interfaces", required=True, help="assigned interface ids, comma separated, e.g. S1,S2,N1")
    parser.add_argument("plan", type=Path, help="path to notification/plan.md")
    args = parser.parse_args()

    spec_dir: Path = args.spec_dir
    spec = spec_dir / "spec.md"
    if not spec.is_file():
        print(f"spec.md not found in {spec_dir}", file=sys.stderr)
        return 2
    if not args.plan.is_file():
        print(f"plan file not found: {args.plan}", file=sys.stderr)
        return 2
    interfaces = [i.strip() for i in args.interfaces.split(",") if i.strip()]
    if not interfaces:
        print("--interfaces is empty", file=sys.stderr)
        return 2

    plan_text = args.plan.read_text(encoding="utf-8")
    spec_text = spec.read_text(encoding="utf-8")
    issues: list[str] = []
    warnings: list[str] = []

    headings = [(m.group(1), m.group(2)) for m in HEADING_RE.finditer(plan_text)]
    top_titles = {title for level, title in headings if level == "##"}
    for section in REQUIRED_SECTIONS:
        if section not in top_titles:
            issues.append(f"missing top-level section: ## {section}")

    for interface in interfaces:
        matched = [title for _, title in headings if heading_interface(title, interface)]
        if not matched:
            issues.append(f"interface {interface}: no section heading starts with it")
        elif len(matched) > 1:
            issues.append(f"interface {interface}: {len(matched)} section headings start with it: {matched}")

    for requirement in sorted(set(REQUIREMENT_RE.findall(plan_text))):
        if not requirement_exists(requirement, spec_text):
            issues.append(f"requirement {requirement} not found in spec.md")

    upstream = upstream_text(spec_dir)
    unknown: set[str] = set()
    for span in BACKTICK_RE.findall(plan_text):
        for identifier in IDENTIFIER_RE.findall(span):
            if not identifier_exists(identifier, upstream):
                unknown.add(identifier)
    for identifier in sorted(unknown):
        warnings.append(f"identifier `{identifier}` not found in data/, contracts/, research.md or spec.md")

    report = {"ok": not issues, "issues": issues, "warnings": warnings}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
