# /// script
# requires-python = ">=3.11"
# dependencies = ["pyyaml>=6,<7"]
# ///
"""Audit the structure of modular skills and build the skill call graph.

The audit covers only mechanical facts: SOP format, frontmatter limits,
part references, orphan parts, RuleFile structure, template pairs, and
script declarations. Judgement-based review stays in the calling SOP.
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

import yaml

VERBS = ("READ", "THINK", "WRITE", "CHECK", "DELEGATE")
PART_DIRS = ("rules", "templates", "scripts")
ALLOWED_FRONTMATTER_KEYS = {"name", "description", "license", "allowed-tools", "metadata", "compatibility"}
IGNORED_FILE_NAMES = {".DS_Store", ".gitkeep"}
UNDEFINED_STRENGTH_WORDS = ("盡量", "儘量", "最好", "原則上")

FENCE_RE = re.compile(r"^\s*(`{3,}|~{3,})")
PHASE_RE = re.compile(r"^## Phase (\d+) -- (\S.*)$")
STEP_RE = re.compile(r"^(\d+)\.\s+(.*)$")
VERB_RE = re.compile(r"^`(" + "|".join(VERBS) + r")`\s")
COMPLETION_PREFIX = "完成條件："
PART_PATH_RE = re.compile(
    r"(?<![\w./-])((?:rules|templates|scripts)/[^\s`'\"，。、；：（）()「」<>]+)"
)
BACKTICK_RE = re.compile(r"`([^`]+)`")
NAMED_RESULT_RE = re.compile(r"(?:建立|命名載入結果為)(「[^」]+」|[^，。；、（）\s]+)")
RULE_HEADING_RE = re.compile(r"^# Rule (\d+) - (\S.*)$")
PLACEHOLDER_RE = re.compile(r"\{\{[A-Za-z0-9_]+\}\}")
EXAMPLE_NAME_RE = re.compile(r"^(?P<stem>.+)\.example\.(?P<ext>[^.]+)$")
SKELETON_NAME_RE = re.compile(r"^(?P<stem>[^.].*)\.(?P<ext>[^.]+)$")
PEP723_RE = re.compile(r"^# /// script\s*$(?P<body>.*?)^# ///\s*$", re.MULTILINE | re.DOTALL)


@dataclass
class Finding:
    code: str
    severity: str
    file: str
    line: int | None
    message: str

    def to_json(self) -> dict:
        return {
            "code": self.code,
            "severity": self.severity,
            "file": self.file,
            "line": self.line,
            "message": self.message,
        }


@dataclass
class Step:
    phase: int
    number: int
    verb: str | None
    text: str
    line: int


@dataclass
class Phase:
    number: int
    title: str
    line: int
    steps: list[Step] = field(default_factory=list)
    completion: str | None = None
    completion_line: int | None = None


@dataclass
class SkillDoc:
    name: str
    path: Path
    frontmatter: dict | None
    body_lines: list[tuple[int, str]]
    has_sop: bool
    phases: list[Phase]
    findings: list[Finding] = field(default_factory=list)


def unfenced_lines(lines: list[str], start: int = 1) -> list[tuple[int, str]]:
    """Return (line number, text) pairs for lines outside fenced code blocks."""
    result: list[tuple[int, str]] = []
    fence: str | None = None
    for offset, line in enumerate(lines):
        number = start + offset
        match = FENCE_RE.match(line)
        if fence is None:
            if match:
                fence = match.group(1)
                continue
            result.append((number, line))
        elif match and match.group(1)[0] == fence[0] and len(match.group(1)) >= len(fence) and line.strip() == match.group(1):
            fence = None
    return result


def split_frontmatter(text: str) -> tuple[str | None, list[str], int]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None, lines, 1
    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            return "\n".join(lines[1:index]), lines[index + 1 :], index + 2
    return None, lines, 1


def parse_skill(skill_dir: Path) -> SkillDoc:
    skill_md = skill_dir / "SKILL.md"
    rel = "SKILL.md"
    text = skill_md.read_text(encoding="utf-8")
    raw_frontmatter, body, body_start = split_frontmatter(text)
    findings: list[Finding] = []

    frontmatter: dict | None = None
    if raw_frontmatter is None:
        findings.append(Finding("FM001", "error", rel, 1, "SKILL.md 缺少以 --- 包圍的 YAML frontmatter。"))
    else:
        try:
            loaded = yaml.safe_load(raw_frontmatter)
        except yaml.YAMLError as error:
            findings.append(Finding("FM001", "error", rel, 1, f"frontmatter 不是有效的 YAML：{error}"))
        else:
            if isinstance(loaded, dict):
                frontmatter = loaded
            else:
                findings.append(Finding("FM001", "error", rel, 1, "frontmatter 必須是 YAML mapping。"))

    body_lines = unfenced_lines(body, body_start)
    sop_starts = [number for number, line in body_lines if line.strip() == "# SOP"]
    phases: list[Phase] = []
    in_sop = False
    current_phase: Phase | None = None
    current_step: Step | None = None
    for number, line in body_lines:
        if line.startswith("# "):
            in_sop = line.strip() == "# SOP"
            current_phase = None
            current_step = None
            continue
        if not in_sop:
            continue
        if line.startswith("## "):
            match = PHASE_RE.match(line.rstrip())
            if match:
                current_phase = Phase(int(match.group(1)), match.group(2).strip(), number)
                phases.append(current_phase)
            else:
                findings.append(
                    Finding("SOP002", "error", rel, number, f"SOP 內的二級標題必須是 `## Phase N -- <phase title>`：{line.strip()}")
                )
                current_phase = None
            current_step = None
            continue
        if current_phase is None:
            continue
        step_match = STEP_RE.match(line)
        if step_match:
            content = step_match.group(2)
            verb_match = VERB_RE.match(content)
            current_step = Step(
                current_phase.number,
                int(step_match.group(1)),
                verb_match.group(1) if verb_match else None,
                content,
                number,
            )
            current_phase.steps.append(current_step)
            continue
        stripped = line.strip()
        if stripped.startswith(COMPLETION_PREFIX):
            current_phase.completion = stripped
            current_phase.completion_line = number
            current_step = None
            continue
        if stripped and current_step is not None and line[:1] in (" ", "\t"):
            current_step.text += " " + stripped

    doc = SkillDoc(skill_dir.name, skill_dir, frontmatter, body_lines, bool(sop_starts), phases, findings)
    if len(sop_starts) > 1:
        findings.append(Finding("SOP001", "error", rel, sop_starts[1], "SKILL.md 只能有一個 `# SOP` section。"))
    return doc


def check_frontmatter(doc: SkillDoc) -> None:
    fm = doc.frontmatter
    if fm is None:
        return
    rel = "SKILL.md"
    unexpected = sorted(set(fm) - ALLOWED_FRONTMATTER_KEYS)
    if unexpected:
        doc.findings.append(Finding("FM004", "error", rel, 1, f"frontmatter 含未允許的欄位：{', '.join(unexpected)}。"))
    name = fm.get("name")
    if not isinstance(name, str) or not name.strip():
        doc.findings.append(Finding("FM002", "error", rel, 1, "frontmatter 缺少字串型態的 name。"))
    else:
        name = name.strip()
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name) or len(name) > 64:
            doc.findings.append(Finding("FM002", "error", rel, 1, f"name 必須是 64 字元內的 kebab-case：{name}"))
        if name != doc.path.name:
            doc.findings.append(Finding("FM002", "error", rel, 1, f"name `{name}` 與目錄名稱 `{doc.path.name}` 不一致。"))
    description = fm.get("description")
    if not isinstance(description, str) or not description.strip():
        doc.findings.append(Finding("FM003", "error", rel, 1, "frontmatter 缺少字串型態的 description。"))
    else:
        description = description.strip()
        if len(description) > 1024:
            doc.findings.append(Finding("FM003", "error", rel, 1, f"description 長度 {len(description)} 超過 1024 字元。"))
        if "<" in description or ">" in description:
            doc.findings.append(Finding("FM003", "error", rel, 1, "description 不得包含 < 或 >。"))


def check_sop(doc: SkillDoc) -> None:
    rel = "SKILL.md"
    if not doc.has_sop:
        doc.findings.append(Finding("SOP001", "error", rel, None, "SKILL.md 缺少 `# SOP` section。"))
        return
    if not doc.phases:
        doc.findings.append(Finding("SOP002", "error", rel, None, "`# SOP` 內沒有任何 `## Phase N -- <phase title>`。"))
        return
    for expected, phase in enumerate(doc.phases, start=1):
        if phase.number != expected:
            doc.findings.append(
                Finding("SOP002", "error", rel, phase.line, f"Phase 編號必須從 1 連續遞增；預期 {expected}，實際 {phase.number}。")
            )
        if not phase.steps:
            doc.findings.append(Finding("SOP004", "error", rel, phase.line, f"Phase {phase.number} 沒有任何步驟。"))
        numbering_reported = False
        for expected_step, step in enumerate(phase.steps, start=1):
            if step.number != expected_step and not numbering_reported:
                numbering_reported = True
                doc.findings.append(
                    Finding(
                        "SOP004",
                        "error",
                        rel,
                        step.line,
                        f"Phase {phase.number} 的步驟編號必須連續；預期 {expected_step}，實際 {step.number}。",
                    )
                )
            if step.verb is None:
                doc.findings.append(
                    Finding("SOP003", "error", rel, step.line, f"步驟必須以受控動詞開頭（{'、'.join(VERBS)}）：{step.text[:40]}")
                )
        if phase.completion is None:
            doc.findings.append(Finding("SOP005", "error", rel, phase.line, f"Phase {phase.number} 缺少「完成條件：」。"))
        if phase.steps and all(step.verb == "READ" for step in phase.steps):
            doc.findings.append(
                Finding("SOP007", "warning", rel, phase.line, f"Phase {phase.number} 只有 `READ` 步驟；載入參考檔不得自成 Phase。")
            )
    if not any(step.verb == "CHECK" for phase in doc.phases for step in phase.steps):
        doc.findings.append(Finding("SOP006", "error", rel, None, "SOP 缺少任何 `CHECK` 驗證步驟。"))
    check_load_placement(doc)


def loaded_result_names(text: str) -> list[str]:
    names = [match.group(1).strip() for match in NAMED_RESULT_RE.finditer(text)]
    return [name.strip("「」") for name in names if name.strip("「」")]


def check_load_placement(doc: SkillDoc) -> None:
    """Warn when a part-loading READ is not directly followed by its first dependent step."""
    rel = "SKILL.md"
    ordered = [step for phase in doc.phases for step in phase.steps]
    for index, step in enumerate(ordered):
        if step.verb != "READ" or not any(not p.startswith("scripts/") for p in extract_part_paths(step.text)):
            continue
        for name in loaded_result_names(step.text):
            dependent = next(
                (later for later in ordered[index + 1 :] if name in later.text), None
            )
            if dependent is None:
                doc.findings.append(
                    Finding("SOP008", "warning", rel, step.line, f"載入結果「{name}」沒有被後續步驟使用。")
                )
                continue
            if dependent.phase != step.phase:
                doc.findings.append(
                    Finding(
                        "SOP008",
                        "warning",
                        rel,
                        step.line,
                        f"載入結果「{name}」第一次在 Phase {dependent.phase} 使用；載入步驟必須與第一個依賴步驟位於同一 Phase。",
                    )
                )
                continue
            between = ordered[index + 1 : ordered.index(dependent)]
            if any(other.verb != "READ" for other in between):
                doc.findings.append(
                    Finding(
                        "SOP008",
                        "warning",
                        rel,
                        step.line,
                        f"載入結果「{name}」的載入步驟與第一個依賴步驟（Phase {dependent.phase} 步驟 {dependent.number}）之間有非 `READ` 步驟。",
                    )
                )


def extract_part_paths(text: str) -> list[str]:
    paths = []
    for match in PART_PATH_RE.finditer(text):
        path = match.group(1).rstrip(".,;:")
        if path not in paths:
            paths.append(path)
    return paths


def list_part_files(skill_dir: Path) -> list[str]:
    files: list[str] = []
    for part in PART_DIRS:
        root = skill_dir / part
        if not root.is_dir():
            continue
        for path in sorted(root.rglob("*")):
            if not path.is_file() or path.name in IGNORED_FILE_NAMES or "__pycache__" in path.parts:
                continue
            files.append(path.relative_to(skill_dir).as_posix())
    return files


def check_references(doc: SkillDoc) -> dict[str, list[dict]]:
    """Check where part paths appear and return the reference map."""
    rel = "SKILL.md"
    references: dict[str, list[dict]] = {}
    step_lines = {step.line for phase in doc.phases for step in phase.steps}
    for phase in doc.phases:
        for step in phase.steps:
            for path in extract_part_paths(step.text):
                references.setdefault(path, []).append(
                    {"phase": step.phase, "step": step.number, "verb": step.verb, "line": step.line}
                )
                expected_verb = "DELEGATE" if path.startswith("scripts/") else "READ"
                if step.verb != expected_verb:
                    doc.findings.append(
                        Finding(
                            "REF002",
                            "error",
                            rel,
                            step.line,
                            f"`{path}` 只能出現在 `{expected_verb}` 步驟；目前出現在 `{step.verb}` 步驟。",
                        )
                    )
    for number, line in doc.body_lines:
        if number in step_lines or line.startswith("#"):
            continue
        for path in extract_part_paths(line):
            doc.findings.append(
                Finding("REF002", "error", rel, number, f"`{path}` 出現在步驟以外的位置（例如完成條件或說明文字）。")
            )

    for path, places in references.items():
        if not (doc.path / path).is_file():
            doc.findings.append(Finding("REF001", "error", rel, places[0]["line"], f"引用的部位檔案不存在：`{path}`。"))
        if not path.startswith("scripts/"):
            read_steps = {(place["phase"], place["step"]) for place in places if place["verb"] == "READ"}
            if len(read_steps) > 1:
                doc.findings.append(
                    Finding("REF003", "warning", rel, places[1]["line"], f"`{path}` 在多個 `READ` 步驟重複載入。")
                )

    referenced = set(references)
    for part_file in list_part_files(doc.path):
        if part_file.endswith(".py.lock") and part_file[: -len(".lock")] in referenced:
            continue
        if part_file not in referenced:
            doc.findings.append(
                Finding("REF004", "error", part_file, None, "孤兒部位：沒有任何 SOP 步驟載入或執行此檔案。")
            )
    return references


def check_rulefiles(doc: SkillDoc) -> None:
    rules_dir = doc.path / "rules"
    if not rules_dir.is_dir():
        return
    for rule_file in sorted(rules_dir.glob("*.md")):
        rel = rule_file.relative_to(doc.path).as_posix()
        if not rule_file.name.endswith("-格式規範.md"):
            doc.findings.append(Finding("RUL004", "error", rel, None, "RuleFile 檔名必須是 `<主題>-格式規範.md`。"))
        lines = rule_file.read_text(encoding="utf-8").splitlines()
        visible = unfenced_lines(lines)
        first = next(((number, line) for number, line in visible if line.strip()), None)
        if first is None or not RULE_HEADING_RE.match(first[1].rstrip()) or RULE_HEADING_RE.match(first[1].rstrip()).group(1) != "1":
            doc.findings.append(
                Finding("RUL001", "error", rel, first[0] if first else None, "RuleFile 必須直接從 `# Rule 1 - <Rule name>` 開始。")
            )
        rules: list[dict] = []
        for number, line in visible:
            if line.startswith("# "):
                match = RULE_HEADING_RE.match(line.rstrip())
                if not match:
                    doc.findings.append(Finding("RUL001", "error", rel, number, f"一級標題必須是 `# Rule N - <Rule name>`：{line.strip()}"))
                    continue
                rules.append({"number": int(match.group(1)), "line": number, "sections": [], "description": []})
                continue
            if not rules:
                continue
            if line.startswith("## "):
                rules[-1]["sections"].append((line.strip(), number))
            elif not rules[-1]["sections"]:
                rules[-1]["description"].append((number, line))
        for expected, rule in enumerate(rules, start=1):
            if rule["number"] != expected:
                doc.findings.append(
                    Finding("RUL002", "error", rel, rule["line"], f"Rule 編號必須從 1 連續遞增；預期 {expected}，實際 {rule['number']}。")
                )
            titles = [title for title, _ in rule["sections"]]
            if titles != ["## Good Example", "## Bad Example"]:
                doc.findings.append(
                    Finding(
                        "RUL003",
                        "error",
                        rel,
                        rule["line"],
                        f"Rule {rule['number']} 必須依序只包含 `## Good Example` 與 `## Bad Example`；實際為 {titles or '無'}。",
                    )
                )
            if not any(text.strip().startswith("- ") for _, text in rule["description"]):
                doc.findings.append(Finding("RUL005", "error", rel, rule["line"], f"Rule {rule['number']} 缺少條列式規則說明。"))
            for number, text in rule["description"]:
                cleaned = re.sub(r"「[^」]*」|`[^`]*`", "", text)
                for word in UNDEFINED_STRENGTH_WORDS:
                    if word in cleaned:
                        doc.findings.append(
                            Finding("RUL006", "warning", rel, number, f"規則說明使用未定義的強度用詞「{word}」。")
                        )


def check_templates(doc: SkillDoc, references: dict[str, list[dict]]) -> None:
    templates_dir = doc.path / "templates"
    if not templates_dir.is_dir():
        return
    files = sorted(
        path.name for path in templates_dir.iterdir() if path.is_file() and path.name not in IGNORED_FILE_NAMES
    )
    examples = {}
    skeletons = {}
    for name in files:
        example = EXAMPLE_NAME_RE.match(name)
        if example:
            examples[(example.group("stem"), example.group("ext"))] = name
            continue
        skeleton = SKELETON_NAME_RE.match(name)
        if skeleton:
            skeletons[(skeleton.group("stem"), skeleton.group("ext"))] = name
        else:
            doc.findings.append(Finding("TPL001", "error", f"templates/{name}", None, "樣板檔名必須是 `<樣板名字>.<格式>`。"))
    for key, name in skeletons.items():
        if key not in examples:
            doc.findings.append(
                Finding("TPL001", "error", f"templates/{name}", None, f"骨架缺少對應範例 `templates/{key[0]}.example.{key[1]}`。")
            )
    for key, name in examples.items():
        if key not in skeletons:
            doc.findings.append(
                Finding("TPL001", "error", f"templates/{name}", None, f"範例缺少對應骨架 `templates/{key[0]}.{key[1]}`。")
            )
            continue
        skeleton_rel = f"templates/{skeletons[key]}"
        example_rel = f"templates/{name}"
        skeleton_text = (templates_dir / skeletons[key]).read_text(encoding="utf-8")
        example_text = (templates_dir / name).read_text(encoding="utf-8")
        leftovers = sorted(set(PLACEHOLDER_RE.findall(skeleton_text)) & set(PLACEHOLDER_RE.findall(example_text)))
        if leftovers:
            doc.findings.append(
                Finding("TPL002", "error", example_rel, None, f"範例殘留骨架的填位符號：{', '.join(leftovers)}。")
            )
        skeleton_steps = {(p["phase"], p["step"]) for p in references.get(skeleton_rel, [])}
        example_steps = {(p["phase"], p["step"]) for p in references.get(example_rel, [])}
        if (skeleton_steps or example_steps) and not (skeleton_steps & example_steps):
            doc.findings.append(
                Finding("TPL003", "error", skeleton_rel, None, "骨架與範例必須在同一個 `READ` 步驟一起載入。")
            )


def check_scripts(doc: SkillDoc, references: dict[str, list[dict]]) -> None:
    scripts_dir = doc.path / "scripts"
    if not scripts_dir.is_dir():
        return
    for path in sorted(scripts_dir.rglob("*")):
        if not path.is_file() or path.name in IGNORED_FILE_NAMES or "__pycache__" in path.parts:
            continue
        rel = path.relative_to(doc.path).as_posix()
        if path.name.endswith(".py.lock"):
            continue
        if path.suffix != ".py" or path.parent != scripts_dir:
            doc.findings.append(Finding("SCR004", "error", rel, None, "scripts/ 只能包含單檔 Python 腳本與相鄰的 `.py.lock`。"))
            continue
        text = path.read_text(encoding="utf-8")
        block = PEP723_RE.search(text)
        if not block or "requires-python" not in block.group("body") or "dependencies" not in block.group("body"):
            doc.findings.append(
                Finding("SCR001", "error", rel, None, "腳本缺少包含 `requires-python` 與 `dependencies` 的 PEP 723 區塊。")
            )
        if "argparse" not in text:
            doc.findings.append(Finding("SCR002", "warning", rel, None, "腳本沒有使用 argparse 宣告命令列介面。"))
    for script, places in references.items():
        if not script.startswith("scripts/"):
            continue
        for place in places:
            step = next(
                s for phase in doc.phases for s in phase.steps if s.phase == place["phase"] and s.number == place["step"]
            )
            if "uv run --script" not in step.text:
                doc.findings.append(
                    Finding("SCR003", "error", "SKILL.md", step.line, f"執行 `{script}` 的步驟必須使用 `uv run --script`。")
                )


def build_graph(docs: dict[str, SkillDoc]) -> dict:
    names = sorted(docs)
    edges = []
    for name, doc in docs.items():
        for phase in doc.phases:
            for step in phase.steps:
                if step.verb != "DELEGATE":
                    continue
                for token in BACKTICK_RE.findall(step.text):
                    token = token.strip()
                    if not token or " " in token or "/" in token:
                        continue
                    for target in fnmatch.filter(names, token):
                        if target == name:
                            continue
                        edges.append(
                            {"from": name, "to": target, "phase": phase.number, "step": step.number, "via": token}
                        )
    callers: dict[str, list[str]] = {name: [] for name in names}
    callees: dict[str, list[str]] = {name: [] for name in names}
    for edge in edges:
        if edge["from"] not in callers[edge["to"]]:
            callers[edge["to"]].append(edge["from"])
        if edge["to"] not in callees[edge["from"]]:
            callees[edge["from"]].append(edge["to"])
    return {"edges": edges, "callers": callers, "callees": callees}


def audit(doc: SkillDoc) -> dict:
    check_frontmatter(doc)
    check_sop(doc)
    references = check_references(doc) if doc.has_sop else {}
    check_rulefiles(doc)
    check_templates(doc, references)
    check_scripts(doc, references)
    return {
        "name": doc.name,
        "path": doc.path.as_posix(),
        "errors": sum(1 for f in doc.findings if f.severity == "error"),
        "warnings": sum(1 for f in doc.findings if f.severity == "warning"),
        "findings": [f.to_json() for f in doc.findings],
        "parts": list_part_files(doc.path),
        "references": references,
        "sop": [
            {
                "phase": phase.number,
                "title": phase.title,
                "steps": [{"step": s.number, "verb": s.verb, "text": s.text} for s in phase.steps],
                "completion": phase.completion,
            }
            for phase in doc.phases
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Audit modular skills (SOP, rules, templates, scripts) and print a JSON report."
    )
    parser.add_argument(
        "--skills-root",
        type=Path,
        action="append",
        required=True,
        help="Directory whose subdirectories are skills; repeat for several skills directories.",
    )
    parser.add_argument(
        "--skill",
        action="append",
        default=[],
        help="Skill name to audit; repeat for several skills. Defaults to every skill under the skills roots.",
    )
    parser.add_argument("--graph", action="store_true", help="Include the skill call graph built from DELEGATE steps.")
    args = parser.parse_args()

    roots: list[Path] = []
    for raw_root in args.skills_root:
        root = raw_root.expanduser().resolve()
        if not root.is_dir():
            print(f"{root}: skills root is not a directory", file=sys.stderr)
            return 1
        if root not in roots:
            roots.append(root)
    docs: dict[str, SkillDoc] = {}
    shadowed: list[dict] = []
    try:
        for root in roots:
            for path in sorted(p for p in root.iterdir() if p.is_dir() and (p / "SKILL.md").is_file()):
                if path.name in docs:
                    shadowed.append({"name": path.name, "used": docs[path.name].path.as_posix(), "ignored": path.as_posix()})
                    continue
                docs[path.name] = parse_skill(path)
    except (OSError, UnicodeDecodeError) as error:
        print(f"cannot read skill files: {error}", file=sys.stderr)
        return 1
    if not docs:
        print("no subdirectory of the skills roots contains SKILL.md", file=sys.stderr)
        return 1

    unknown = sorted(set(args.skill) - set(docs))
    if unknown:
        print(f"unknown skill(s): {', '.join(unknown)}", file=sys.stderr)
        return 1
    targets = args.skill or sorted(docs)
    try:
        results = [audit(docs[name]) for name in targets]
    except (OSError, UnicodeDecodeError) as error:
        print(f"cannot read part files: {error}", file=sys.stderr)
        return 1

    report: dict = {
        "skills_roots": [root.as_posix() for root in roots],
        "shadowed_skills": shadowed,
        "summary": {
            "skills": len(results),
            "errors": sum(result["errors"] for result in results),
            "warnings": sum(result["warnings"] for result in results),
        },
        "skills": results,
    }
    if args.graph:
        report["graph"] = build_graph(docs)

    sys.stdout.reconfigure(encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
