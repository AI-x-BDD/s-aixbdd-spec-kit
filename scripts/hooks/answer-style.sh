#!/usr/bin/env bash
# UserPromptSubmit hook：每次輸入時提醒 agent 依 CLAUDE.md／AGENTS.md「回答方式」回覆。
# Claude Code（.claude/settings.json）與 Codex（.codex/hooks.json）共用，輸出格式兩邊相同。
cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"提醒：依 CLAUDE.md／AGENTS.md「回答方式」回覆：用 ASD-STE100 的方式解釋，大約做到 80% 就好，以繁體中文回答；執行多步驟工作流或迭代 runbook 時，每一步結尾必須寫明目前完成步驟、下一步是什麼，並附上已代換好變數的可直接貼上提示詞。提示詞格式：放在整則回覆的最後面，之後不得再寫任何文字；前一行固定寫「下一步提示詞（複製下方整個區塊）：」；只放一個程式碼區塊，區塊內只放提示詞、不夾說明；所有說明與貼上前要做的事都寫在那一行之前。"}}
JSON
