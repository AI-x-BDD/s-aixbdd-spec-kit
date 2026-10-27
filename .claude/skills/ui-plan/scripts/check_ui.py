# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Check ui/plan.md and the HTML prototype pages it lists against the spec, the responsible interfaces and each other."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

# ASCII boundaries: Python's \b treats CJK characters as word characters.
REQUIREMENT_RE = re.compile(r"(?<![A-Za-z0-9-])(US\d+|(?:FR|NFR|SC)-\d+)(?![A-Za-z0-9])")
INTERFACE_RE = re.compile(r"(?<![A-Za-z0-9])([A-Z]{1,3}\d+)(?![A-Za-z0-9-])")
SECTION_RE = re.compile(r"^(#{2,3})\s+(\d+(?:\.\d+)?)\.?\s", re.MULTILINE)
BACKTICK_FILE_RE = re.compile(r"`([^`]+\.html)`")
STATES_BLOCK_RE = re.compile(r"const STATES = \[(.*?)\n\s*\];", re.DOTALL)
LABEL_RE = re.compile(r"label:\s*(['\"])(.*?)\1")
EXTERNAL_RE = re.compile(r"""(?:\b(?:src|href)\s*=\s*["']\s*|url\(\s*["']?\s*|@import\s+["'])((?:https?:)?//[^"')\s]*)""", re.IGNORECASE)
LINK_RE = re.compile(r"""(?<=["'`])([A-Za-z0-9_-]+\.html)(?=[?#"'`])""")
SCRIPT_RE = re.compile(r"<script(?P<attrs>[^>]*)>(?P<body>.*?)</script>", re.DOTALL | re.IGNORECASE)
MERMAID_RE = re.compile(r"```mermaid\n(.*?)```", re.DOTALL)
INVENTORY_ROW_RE = re.compile(r"^\|\s*([A-Z]{1,3}\d+)\s*\|", re.MULTILINE)
MERMAID_KEYWORDS = {"flowchart", "graph", "subgraph", "end", "style", "classDef", "class", "click", "linkStyle", "direction", "LR", "RL", "TD", "TB", "BT"}


def parse_interfaces(value: str) -> list[str]:
    ids = [part.strip() for part in value.split(",") if part.strip()]
    if not ids:
        raise argparse.ArgumentTypeError("at least one interface ID is required")
    return ids


def section(text: str, number: str) -> str:
    """Return the body of the heading numbered `number` (for example '1' or '3.1') up to the next heading of any level."""
    matches = list(SECTION_RE.finditer(text))
    for i, m in enumerate(matches):
        if m.group(2) == number:
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            return text[m.end():end]
    return ""


def table_rows(body: str) -> list[list[str]]:
    """Return data rows of the first Markdown table in `body`, skipping the header and separator rows."""
    rows: list[list[str]] = []
    lines = [line.strip() for line in body.splitlines() if line.strip().startswith("|")]
    for line in lines[2:]:
        rows.append([cell.strip() for cell in line.strip("|").split("|")])
    return rows


def requirement_exists(requirement: str, spec_text: str) -> bool:
    patterns = [re.escape(requirement)]
    story = re.fullmatch(r"US(\d+)", requirement)
    if story:
        patterns.append(rf"User Story {story.group(1)}")
    return any(re.search(rf"(?<![A-Za-z0-9-]){p}(?![0-9])", spec_text) for p in patterns)


def mermaid_node_ids(block: str) -> set[str]:
    """Return node IDs in a Mermaid flowchart, ignoring quoted labels, bracketed labels and |edge labels|."""
    text = re.sub(r'"[^"]*"', "", block)
    text = re.sub(r"\|[^|]*\|", "", text)
    text = re.sub(r"[\[\(\{][^\]\)\}]*[\]\)\}]", "", text)
    ids = set(re.findall(r"(?<![A-Za-z0-9_])([A-Za-z][A-Za-z0-9_]*)", text))
    return ids - MERMAID_KEYWORDS


def check_js(node: str, page: str, html: str, issues: list[str]) -> None:
    for i, m in enumerate(SCRIPT_RE.finditer(html), start=1):
        if re.search(r"\bsrc\s*=", m.group("attrs"), re.IGNORECASE):
            continue
        with tempfile.TemporaryDirectory() as tmp:
            js = Path(tmp) / f"script-{i}.js"
            js.write_text(m.group("body"), encoding="utf-8")
            result = subprocess.run([node, "--check", str(js)], capture_output=True, text=True)
        if result.returncode != 0:
            detail = next((line for line in result.stderr.splitlines() if "Error" in line), result.stderr.strip())
            issues.append(f"{page}: 第 {i} 段內嵌 <script> 沒有通過 node --check：{detail}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Check ui/plan.md and the HTML prototype pages against the spec and the responsible interfaces; print a JSON report."
    )
    parser.add_argument("--spec", type=Path, required=True, help="Path to the target spec.md.")
    parser.add_argument("--interfaces", type=parse_interfaces, required=True, help="Comma-separated responsible interface IDs, for example F1,F2.")
    parser.add_argument("ui_dir", type=Path, help="Path to the ui/ directory that holds plan.md and the HTML pages.")
    args = parser.parse_args()

    if not args.spec.is_file():
        print(f"spec not found: {args.spec}", file=sys.stderr)
        return 2
    if not args.ui_dir.is_dir():
        print(f"ui directory not found: {args.ui_dir}", file=sys.stderr)
        return 2

    spec_text = args.spec.read_text(encoding="utf-8")
    responsible = set(args.interfaces)
    issues: list[str] = []
    warnings: list[str] = []
    pages: list[dict] = []

    plan_path = args.ui_dir / "plan.md"
    if not plan_path.is_file():
        issues.append("ui/plan.md 不存在")
        print(json.dumps({"ok": False, "pages": pages, "issues": issues, "warnings": warnings}, ensure_ascii=False, indent=2))
        return 1
    plan = plan_path.read_text(encoding="utf-8")

    # 第 1 節：介面欄只出現負責介面，且每個負責介面都出現
    scope_ids = {i for row in table_rows(section(plan, "1")) if row for i in INTERFACE_RE.findall(row[0])}
    for extra in sorted(scope_ids - responsible):
        issues.append(f"第 1 節出現負責介面以外的介面 {extra}")
    for missing in sorted(responsible - scope_ids):
        issues.append(f"第 1 節沒有負責介面 {missing}")

    # 第 3.1 節：頁面清單
    page_rows = [row for row in table_rows(section(plan, "3.1")) if row]
    page_files: list[str] = []
    page_interfaces: dict[str, set[str]] = {}
    for row in page_rows:
        found = BACKTICK_FILE_RE.findall(row[0])
        if not found:
            issues.append(f"第 3.1 節的列沒有以反引號標出 HTML 檔名：{row[0]}")
            continue
        page_files.append(found[0])
        page_interfaces[found[0]] = set(INTERFACE_RE.findall(row[2])) if len(row) > 2 else set()
    if not page_files:
        issues.append("第 3.1 節沒有頁面清單")
    elif page_files[0] != "index.html":
        issues.append(f"第 3.1 節頁面清單的第一列是 {page_files[0]}，不是 index.html")
    covered = set().union(*page_interfaces.values()) if page_interfaces else set()
    for extra in sorted(covered - responsible):
        issues.append(f"第 3.1 節出現負責介面以外的介面 {extra}")
    for missing in sorted(responsible - covered):
        issues.append(f"第 3.1 節沒有對應負責介面 {missing} 的頁面")
    existing_html = sorted(p.name for p in args.ui_dir.glob("*.html"))
    for name in existing_html:
        if name not in page_files:
            issues.append(f"ui/ 有頁面清單以外的 HTML：{name}")

    # 需求編號都存在於 spec
    for requirement in sorted(set(REQUIREMENT_RE.findall(plan))):
        if not requirement_exists(requirement, spec_text):
            issues.append(f"ui/plan.md 引用的 {requirement} 不存在於 spec")

    # 第 3.2 節：流程圖節點代號不得與 plan.md 盤點表的介面編號相同
    inventory_path = args.spec.parent / "plan.md"
    if inventory_path.is_file():
        inventory = set(INVENTORY_ROW_RE.findall(inventory_path.read_text(encoding="utf-8")))
        for block in MERMAID_RE.findall(section(plan, "3.2")):
            for node in sorted(mermaid_node_ids(block) & inventory):
                issues.append(f"第 3.2 節流程圖的節點代號 {node} 與 plan.md 盤點表的介面編號相同")
    else:
        warnings.append("目標 spec 同目錄沒有 plan.md，未檢查流程圖節點代號")

    # 第 4 節：依畫面分組狀態名稱
    expected_states: dict[str, list[str]] = {}
    for row in table_rows(section(plan, "4")):
        if len(row) < 2:
            continue
        files = BACKTICK_FILE_RE.findall(row[0])
        if files:
            expected_states.setdefault(files[0], []).append(row[1])

    node = shutil.which("node")
    if node is None:
        warnings.append("找不到 node，未執行內嵌 <script> 的 node --check")

    for name in page_files:
        page_path = args.ui_dir / name
        if not page_path.is_file():
            issues.append(f"頁面清單中的 {name} 不存在")
            continue
        html = page_path.read_text(encoding="utf-8")
        if "{{" in html:
            issues.append(f"{name}: 殘留填位符號 {{{{")
        for url in EXTERNAL_RE.findall(html):
            issues.append(f"{name}: 引用外部資源 {url}")
        for link in sorted(set(LINK_RE.findall(html))):
            if link not in page_files:
                issues.append(f"{name}: 連到頁面清單以外的 {link}")
        block = STATES_BLOCK_RE.search(html)
        labels = [m.group(2) for m in LABEL_RE.finditer(block.group(1))] if block else []
        if not block:
            issues.append(f"{name}: 找不到 const STATES = [ … ];")
        for state in expected_states.get(name, []):
            if state not in labels:
                issues.append(f"{name}: 雛形狀態面板沒有第 4 節的狀態「{state}」")
        if node:
            check_js(node, name, html, issues)
        pages.append({
            "file": name,
            "interfaces": sorted(page_interfaces.get(name, set())),
            "expected_states": expected_states.get(name, []),
            "state_labels": labels,
        })

    for name in expected_states:
        if name not in page_files:
            issues.append(f"第 4 節的畫面 {name} 不在頁面清單中")

    report = {"ok": not issues, "pages": pages, "issues": issues, "warnings": warnings}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not issues else 1


if __name__ == "__main__":
    sys.exit(main())
