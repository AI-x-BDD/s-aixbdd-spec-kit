#!/usr/bin/env bash
# UserPromptSubmit hook：自動模式的 clarify 開關打開時，提醒 agent 提問時直接採推薦選項。
# 開關關閉（預設）時不輸出任何內容，行為和沒有這個 hook 相同。
# 開關：scripts/auto-mode.sh on clarify／off clarify。狀態檔：.auto/mode。
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FILE="$ROOT/.auto/mode"
[ -f "$FILE" ] || exit 0
[ "$(sed -n 's/^clarify=//p' "$FILE" | tail -1)" = "on" ] || exit 0
cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"自動模式（clarify）已開啟：依 SOP 需要以 clarify 或其他方式向使用者提出需求、設計或業務規則的問題時，不要等待使用者回覆，也不要呼叫提問工具；每一題直接採用你的推薦選項（沒有推薦時採第一個選項）當作使用者的回覆，然後繼續執行。在該步驟的回報與迭代紀錄中，寫出每一題的題目與採用的選項，並標註「自動採推薦，非使用者決定」。這條不適用於覆寫既有產出、刪除檔案、push、打 tag 的確認：這些仍然要停下來等使用者。委派子代理時，把這條一併轉達。"}}
JSON
