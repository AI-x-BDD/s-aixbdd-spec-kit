#!/usr/bin/env bash
# 讓 .claude/skills/ 與 .agents/skills/、CLAUDE.md 與 AGENTS.md 兩邊保持實體相同（不用 symlink）。
#
# 用法：
#   scripts/sync-skills.sh --from claude   以 .claude/skills/、CLAUDE.md 為準，複製到 .agents/skills/、AGENTS.md
#   scripts/sync-skills.sh --from agents   以 .agents/skills/、AGENTS.md 為準，複製到 .claude/skills/、CLAUDE.md
#   scripts/sync-skills.sh --check         只檢查兩邊是否實體相同，不一致時 exit 1
#
# 兩個 skills/README.md 刻意寫給不同 agent，不同步也不比對。
# 只存在於目標端的 Skill 不會被刪除，只會列出來，請自行確認要補回來源端還是刪掉。

set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
CLAUDE_SKILLS="$ROOT/.claude/skills"
AGENTS_SKILLS="$ROOT/.agents/skills"

usage() {
  sed -n '4,7p' "$0" | sed 's/^# \{0,1\}//'
  exit 2
}

# 列出某個 skills 目錄下的 Skill 名稱（排除最上層 README.md）
list_skills() {
  local dir=$1
  local entry
  for entry in "$dir"/* "$dir"/.[!.]*; do
    [ -e "$entry" ] || [ -L "$entry" ] || continue
    entry=$(basename "$entry")
    [ "$entry" = "README.md" ] && continue
    echo "$entry"
  done
}

sync() {
  local src_skills=$1 dst_skills=$2 src_doc=$3 dst_doc=$4
  local name

  for name in $(list_skills "$src_skills"); do
    if [ -L "$src_skills/$name" ]; then
      echo "錯誤：來源 $src_skills/$name 是 symlink，請先改成實體目錄" >&2
      exit 1
    fi
    rm -rf "${dst_skills:?}/$name"
    cp -R "$src_skills/$name" "$dst_skills/$name"
    echo "已同步 Skill：$name"
  done

  for name in $(list_skills "$dst_skills"); do
    if [ ! -e "$src_skills/$name" ]; then
      echo "注意：$name 只存在於 $dst_skills，未刪除，請自行確認" >&2
    fi
  done

  if [ -L "$src_doc" ]; then
    echo "錯誤：來源 $src_doc 是 symlink，請先改成實體檔案" >&2
    exit 1
  fi
  rm -f "$dst_doc"
  cp "$src_doc" "$dst_doc"
  echo "已同步：$(basename "$src_doc") → $(basename "$dst_doc")"
}

check() {
  local failed=0 name path

  for path in "$ROOT/CLAUDE.md" "$ROOT/AGENTS.md"; do
    if [ -L "$path" ]; then
      echo "不一致：$(basename "$path") 是 symlink" >&2
      failed=1
    fi
  done
  if ! cmp -s "$ROOT/CLAUDE.md" "$ROOT/AGENTS.md"; then
    echo "不一致：CLAUDE.md 與 AGENTS.md 內容不同" >&2
    failed=1
  fi

  for name in $( (list_skills "$CLAUDE_SKILLS"; list_skills "$AGENTS_SKILLS") | sort -u); do
    for path in "$CLAUDE_SKILLS/$name" "$AGENTS_SKILLS/$name"; do
      if [ -L "$path" ]; then
        echo "不一致：${path#"$ROOT"/} 是 symlink" >&2
        failed=1
      elif [ ! -e "$path" ]; then
        echo "不一致：${path#"$ROOT"/} 不存在" >&2
        failed=1
      fi
    done
    if [ -e "$CLAUDE_SKILLS/$name" ] && [ -e "$AGENTS_SKILLS/$name" ] \
      && ! diff -r "$CLAUDE_SKILLS/$name" "$AGENTS_SKILLS/$name" >/dev/null; then
      echo "不一致：Skill $name 兩邊內容不同" >&2
      failed=1
    fi
  done

  if [ "$failed" -ne 0 ]; then
    echo "請在建立或修改的那一邊執行 scripts/sync-skills.sh --from claude 或 --from agents" >&2
    exit 1
  fi
  echo "兩邊一致"
}

case "${1:-}" in
  --from)
    case "${2:-}" in
      claude) sync "$CLAUDE_SKILLS" "$AGENTS_SKILLS" "$ROOT/CLAUDE.md" "$ROOT/AGENTS.md" ;;
      agents) sync "$AGENTS_SKILLS" "$CLAUDE_SKILLS" "$ROOT/AGENTS.md" "$ROOT/CLAUDE.md" ;;
      *) usage ;;
    esac
    ;;
  --check) check ;;
  *) usage ;;
esac
