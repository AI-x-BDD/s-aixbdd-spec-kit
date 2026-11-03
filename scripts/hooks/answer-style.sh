#!/usr/bin/env bash
# UserPromptSubmit hook：每次輸入時提醒 agent 依 CLAUDE.md／AGENTS.md「回答方式」回覆。
# Claude Code（.claude/settings.json）與 Codex（.codex/hooks.json）共用，輸出格式兩邊相同。
cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"提醒：依 CLAUDE.md／AGENTS.md「回答方式」回覆：用 ASD-STE100 的方式解釋，大約做到 80% 就好，以繁體中文回答。"}}
JSON
