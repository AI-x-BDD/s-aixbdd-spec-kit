#!/usr/bin/env bash
# 自動模式開關。兩個開關預設都關；都關的時候，流程和手動流程完全相同。
#
#   scripts/auto-mode.sh on clarify            clarify 提問時，一律採推薦選項並記錄
#   scripts/auto-mode.sh on next [選項]        回覆結尾有「下一步提示詞」時，由 Herdr 開新分頁、啟動新的 Claude Code 並貼上
#   scripts/auto-mode.sh on all [選項]         兩個都開
#   scripts/auto-mode.sh off [clarify|next|all] 關閉（不寫對象時全部關）
#   scripts/auto-mode.sh status                看目前狀態
#
# on next／on all 的選項：
#   --steps N     最多自動接續幾步（預設 12）
#   --model M     自動開的新對話使用的模型（不寫時沿用上一個對話的模型）
#   --effort E    自動開的新對話使用的 effort（不寫時不指定）
#
# 狀態存在 .auto/mode（不進 git）。hook：scripts/hooks/auto-clarify.sh、scripts/hooks/auto_next.py。
# next 只在 Herdr 的 pane 內有效（HERDR_ENV=1）。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIR="$ROOT/.auto"
FILE="$DIR/mode"

get() {
  [ -f "$FILE" ] || return 0
  sed -n "s/^$1=//p" "$FILE" | tail -1
}

put() {
  mkdir -p "$DIR"
  touch "$FILE"
  grep -v "^$1=" "$FILE" > "$FILE.tmp" || true
  [ -n "$2" ] && echo "$1=$2" >> "$FILE.tmp"
  mv "$FILE.tmp" "$FILE"
}

status() {
  local clarify next
  clarify="$(get clarify)"; next="$(get next)"
  echo "clarify：${clarify:-off}"
  echo "next：${next:-off}"
  if [ "${next:-off}" = "on" ]; then
    echo "  剩餘步數：$(get steps_left)"
    echo "  模型：$(get model | grep . || echo '沿用上一個對話')"
    echo "  effort：$(get effort | grep . || echo '不指定')"
    [ "${HERDR_ENV:-}" = "1" ] || echo "  注意：目前不在 Herdr 的 pane 內，next 不會動作"
  fi
}

usage() { sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }

cmd="${1:-status}"
shift || true

case "$cmd" in
  on)
    target="${1:-}"
    [ -n "$target" ] || { usage; exit 2; }
    shift
    steps=12; model=""; effort=""
    while [ $# -gt 0 ]; do
      case "$1" in
        --steps) steps="$2"; shift 2 ;;
        --model) model="$2"; shift 2 ;;
        --effort) effort="$2"; shift 2 ;;
        *) echo "不認得的選項：$1" >&2; exit 2 ;;
      esac
    done
    case "$steps" in ''|*[!0-9]*) echo "--steps 必須是正整數" >&2; exit 2 ;; esac
    case "$target" in
      clarify) put clarify on ;;
      next|all)
        [ "$target" = "all" ] && put clarify on
        put next on
        put steps_left "$steps"
        put model "$model"
        put effort "$effort"
        put last_key ""
        ;;
      *) echo "對象必須是 clarify、next 或 all" >&2; exit 2 ;;
    esac
    status
    ;;
  off)
    target="${1:-all}"
    case "$target" in
      clarify) put clarify off ;;
      next) put next off ;;
      all) put clarify off; put next off ;;
      *) echo "對象必須是 clarify、next 或 all" >&2; exit 2 ;;
    esac
    status
    ;;
  status) status ;;
  -h|--help|help) usage ;;
  *) usage; exit 2 ;;
esac
