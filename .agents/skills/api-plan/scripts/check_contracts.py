# /// script
# requires-python = ">=3.11"
# dependencies = ["pyyaml>=6,<7"]
# ///
"""Check OpenAPI / AsyncAPI contracts produced by api-plan.

Runs Redocly CLI lint (errors only) and verifies that every operation has exactly
one tag starting with an assigned interface id, that every assigned interface is
covered by at least one operation, and that requirement ids cited in each
operation description exist in the target spec. Writes no files; the only
network access is npx fetching @redocly/cli@2.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import yaml

REDOCLY = "@redocly/cli@2"
HTTP_METHODS = ("get", "put", "post", "delete", "options", "head", "patch", "trace")
# ASCII boundaries: Python's \b treats CJK characters as word characters.
REQUIREMENT_RE = re.compile(r"(?<![A-Za-z0-9-])(US\d+|(?:FR|NFR|SC)-\d+)(?![A-Za-z0-9])")


def requirement_exists(requirement: str, spec_text: str) -> bool:
    patterns = [re.escape(requirement)]
    story = re.fullmatch(r"US(\d+)", requirement)
    if story:
        patterns.append(rf"User Story {story.group(1)}")
    return any(re.search(rf"(?<![A-Za-z0-9-]){p}(?![0-9])", spec_text) for p in patterns)


def run_redocly(contracts: list[Path]) -> list[str]:
    npx = shutil.which("npx")
    if npx is None:
        raise EnvironmentError("npx not found; install Node.js to run Redocly CLI")
    result = subprocess.run(
        [npx, "--yes", REDOCLY, "lint", "--extends", "minimal", "--format", "json", *map(str, contracts)],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    try:
        report = json.loads(result.stdout)
    except json.JSONDecodeError:
        if result.returncode == 0:
            return []
        detail = (result.stderr or result.stdout).strip().splitlines()
        return [f"redocly lint failed: {' / '.join(detail[-5:])}"]
    issues = []
    for problem in report.get("problems", []):
        if problem.get("severity") != "error":
            continue
        location = (problem.get("location") or [{}])[0]
        source = location.get("source", {}).get("ref", "?")
        pointer = location.get("pointer", "")
        issues.append(f"redocly error ({problem.get('ruleId')}) {source} {pointer}: {problem.get('message')}")
    return issues


def collect_operations(path: Path, document: dict) -> list[dict]:
    operations = []
    if "openapi" in document:
        for route, item in (document.get("paths") or {}).items():
            if not isinstance(item, dict):
                continue
            for method in HTTP_METHODS:
                operation = item.get(method)
                if isinstance(operation, dict):
                    operations.append({
                        "id": operation.get("operationId") or f"{method.upper()} {route}",
                        "tags": [str(tag) for tag in operation.get("tags") or []],
                        "description": str(operation.get("description") or ""),
                    })
    elif "asyncapi" in document:
        for key, operation in (document.get("operations") or {}).items():
            if isinstance(operation, dict):
                operations.append({
                    "id": key,
                    "tags": [str(tag.get("name", "")) if isinstance(tag, dict) else str(tag) for tag in operation.get("tags") or []],
                    "description": str(operation.get("description") or ""),
                })
    else:
        raise ValueError(f"{path}: neither an OpenAPI nor an AsyncAPI document")
    for operation in operations:
        operation["file"] = str(path)
    return operations


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Lint api-plan contracts with Redocly CLI and check interface tags, interface coverage and requirement ids. Prints a JSON report; exit 0 = no issues, 1 = issues found, 2 = invalid arguments or environment."
    )
    parser.add_argument("--spec", type=Path, required=True, help="Target spec.md used to verify cited requirement ids.")
    parser.add_argument("--interfaces", required=True, help="Comma-separated interface ids assigned to api-plan, for example B1,B2,B3.")
    parser.add_argument("contracts", type=Path, nargs="+", help="Contract files (contracts/openapi.yaml, contracts/asyncapi.yaml).")
    args = parser.parse_args()

    spec: Path = args.spec.expanduser().resolve()
    contracts = [path.expanduser().resolve() for path in args.contracts]
    interfaces = [item.strip() for item in args.interfaces.split(",") if item.strip()]
    if not interfaces:
        print("--interfaces must list at least one interface id", file=sys.stderr)
        return 2
    for path in [spec, *contracts]:
        if not path.is_file():
            print(f"{path}: file not found", file=sys.stderr)
            return 2

    spec_text = spec.read_text(encoding="utf-8")
    try:
        issues = run_redocly(contracts)
    except EnvironmentError as error:
        print(str(error), file=sys.stderr)
        return 2

    operations = []
    for path in contracts:
        try:
            document = yaml.safe_load(path.read_text(encoding="utf-8"))
        except yaml.YAMLError as error:
            issues.append(f"{path}: invalid YAML: {error}")
            continue
        if not isinstance(document, dict):
            issues.append(f"{path}: top level is not a mapping")
            continue
        try:
            operations.extend(collect_operations(path, document))
        except ValueError as error:
            issues.append(str(error))

    coverage = {interface: 0 for interface in interfaces}
    report_operations = []
    for operation in operations:
        label = f"{Path(operation['file']).name} {operation['id']}"
        tags = operation["tags"]
        matched = None
        if len(tags) != 1:
            issues.append(f"{label}: expected exactly one tag, found {len(tags)}")
        else:
            matched = next((i for i in interfaces if tags[0].startswith(f"{i} ")), None)
            if matched is None:
                issues.append(f"{label}: tag {tags[0]!r} does not start with an assigned interface id followed by a space")
            else:
                coverage[matched] += 1
        requirements = sorted(set(REQUIREMENT_RE.findall(operation["description"])))
        if not requirements:
            issues.append(f"{label}: description cites no requirement id (US, FR, NFR, SC)")
        for requirement in requirements:
            if not requirement_exists(requirement, spec_text):
                issues.append(f"{label}: requirement {requirement} not found in {spec.name}")
        report_operations.append({"file": operation["file"], "id": operation["id"], "tag": tags[0] if len(tags) == 1 else tags, "requirements": requirements})

    for interface, count in coverage.items():
        if count == 0:
            issues.append(f"interface {interface}: no operation is tagged with it")

    report = {
        "files": [str(path) for path in contracts],
        "operations": report_operations,
        "coverage": coverage,
        "issues": issues,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
