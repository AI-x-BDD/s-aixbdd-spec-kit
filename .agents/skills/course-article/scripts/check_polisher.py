#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = []
# ///
"""Validate the selected project bundle and emit its absolute entry path as JSON."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys


def contained(root, value):
    if not isinstance(value, str) or not value or Path(value).is_absolute():
        raise ValueError(f"{root}：需要相對路徑，收到 {value!r}")
    path = (root / value).resolve()
    if path == root or not path.is_relative_to(root):
        raise ValueError(f"{path}：路徑超出 {root}")
    return path


def read_object(path):
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        raise ValueError(f"{path}：{error}") from error
    if not isinstance(value, dict):
        raise ValueError(f"{path}：預期 JSON 物件")
    return value


def check(config):
    skill_dir = config.absolute().parent
    if skill_dir.parent.name != "skills" or skill_dir.parent.parent.name not in {".agents", ".claude"}:
        raise ValueError(f"{config}：請指定專案內的 course-article 設定檔")
    project = skill_dir.parents[2].resolve()
    selection = read_object(config)
    if set(selection) != {"bundle"}:
        raise ValueError(f"{config}：需要唯一欄位 bundle")
    vendor = project / "vendor" / "skills"
    if vendor.resolve() != vendor:
        raise ValueError(f"{vendor}：請使用專案內的實體目錄")
    bundle = contained(project, selection["bundle"])
    if bundle == vendor or not bundle.is_relative_to(vendor):
        raise ValueError(f"{config}：指定套件須位於 {vendor} 下")
    manifest = contained(bundle, "bundle.json")
    meta = read_object(manifest)
    for field in ("name", "version", "source", "commit"):
        if not isinstance(meta.get(field), str) or not meta[field].strip():
            raise ValueError(f"{manifest}：缺少有效的 {field}")
    files = meta.get("files")
    if not isinstance(files, dict) or not {"SKILL.md", "LICENSE"}.issubset(files):
        raise ValueError(f"{manifest}：files 必須列出 SKILL.md、LICENSE 和執行所需檔案")
    for filename, expected in files.items():
        path = contained(bundle, filename)
        if not isinstance(expected, str) or not re.fullmatch(r"[0-9a-f]{64}", expected):
            raise ValueError(f"{manifest}：{filename} 的 SHA-256 格式錯誤")
        if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise ValueError(f"{path}：SHA-256 與 {manifest} 不符")
    return dict(name=meta["name"], version=meta["version"], commit=meta["commit"],
                entry=str(contained(bundle, "SKILL.md")))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", required=True, type=Path, help="Path to course-article/polisher.json")
    args = parser.parse_args()
    try:
        result = check(args.config)
    except (OSError, ValueError, RuntimeError) as error:
        print(f"潤稿依賴受阻：{error}。請恢復專案所附的設定或指定版本檔案。", file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
