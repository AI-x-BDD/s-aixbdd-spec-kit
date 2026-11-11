#!/usr/bin/env bash
# UserPromptSubmit hook：自動模式的開關打開時，提醒 agent 依開關行事。
# - clarify 開：提問時直接採推薦選項。
# - next 開：每次回覆結尾都附下一步提示詞區塊，讓 auto_next.py 接續。
# 兩個開關都關（預設）時不輸出任何內容，行為和沒有這個 hook 相同。
# 開關：scripts/auto-mode.sh on|off clarify|next|all。狀態檔：.auto/mode。
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FILE="$ROOT/.auto/mode"
[ -f "$FILE" ] || exit 0
CLARIFY="$(sed -n 's/^clarify=//p' "$FILE" | tail -1)"
NEXT="$(sed -n 's/^next=//p' "$FILE" | tail -1)"

TEXT=""
if [ "$CLARIFY" = "on" ]; then
  TEXT="自動模式（clarify）已開啟：依 SOP 需要以 clarify 或其他方式向使用者提出需求、設計或業務規則的問題時，不要等待使用者回覆，也不要呼叫提問工具；每一題直接採用你的推薦選項（沒有推薦時採第一個選項）當作使用者的回覆，然後繼續執行。在該步驟的回報與迭代紀錄中，寫出每一題的題目與採用的選項，並標註「自動採推薦，非使用者決定」。這條不適用於覆寫既有產出、刪除檔案、push、打 tag 的確認：這些仍然要停下來等使用者。委派子代理時，把這條一併轉達。"
fi
if [ "$NEXT" = "on" ]; then
  [ -n "$TEXT" ] && TEXT="$TEXT "
  TEXT="${TEXT}自動模式（next）已開啟：這次工作完成後，不論提示詞有沒有要求、是不是 runbook 步驟，回覆結尾都必須依 CLAUDE.md「回答方式」附上「下一步提示詞（複製下方整個區塊）：」與一個提示詞程式碼區塊；下一步是什麼由你依目前結果決定（例如要用哪個 Skill 處理剩下的問題）。你寫的下一步提示詞內也要包含「完成後依 CLAUDE.md 格式附上下一步提示詞」。下一步提示詞是交給下一個 agent 的工作指示，不是使用者的話：不得用使用者的口吻寫，不得寫使用者已驗證、已確認、已同意或已操作過任何事；使用者沒有親自說過的事，一律不得當成事實寫進提示詞。下列情況不附提示詞：整個流程已經沒有下一步；這一步失敗；下一步需要使用者實際操作驗證；下一步是 commit、push 或打 tag；需要使用者做覆寫既有產出或刪除檔案的決定。不附時在結尾寫一行「自動接續停止：」加原因，需要使用者驗證時一併列出驗證步驟。"
fi
[ -n "$TEXT" ] || exit 0
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$TEXT"
