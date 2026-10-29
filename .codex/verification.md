# Codex 代理設定驗證

日期：2026-10-29。環境：本機 Codex CLI 0.165.0。

## 已完成

- 4 份代理 TOML 均可解析，包含 name、description、model、model_reasoning_effort、developer_instructions。
- 從專案根目錄以 `codex exec --strict-config` 啟動獨立、read-only 的設定測試 session；它依 AGENTS.md 入口讀取 `.codex/model-routing.md`。
- 以各自訂代理名稱啟動 4 個子代理，均使用 `fork_turns: "none"`，只要求回覆「設定測試完成」，均成功完成。
- 從 CLI session 的 `session_meta` 對應代理角色，再由 `turn_context` 核對執行設定如下。這是 CLI runtime 的設定證據，不是模型自述，也不是後端權重的獨立證明。

| 代理角色 | runtime model | runtime effort | 子代理 session ID |
|---|---|---|---|
| course-analyst | gpt-6-astra | high | 01a185bd-2f45-7970-aab5-2aa2256dbf45 |
| course-implementer | gpt-6.1-sol | medium | 01a185bd-3e24-72b1-8f17-aaf5165c81a7 |
| skill-tester-luna | gpt-6-luna | high | 01a185bd-480a-7cf2-b6ed-12c9f8b13fee |
| skill-tester-sol | gpt-6.1-sol | medium | 01a185bd-581e-7c43-aa6d-25914196f749 |

主測試 session ID：`01a185bc-fd98-7a13-b49b-9b8898bf2418`。本機原始紀錄位於 `~/.codex/sessions/2026/10/29/` 對應 session ID 的 rollout 檔；不將完整對話紀錄提交至 repo。

- `scripts/sync-skills.sh --check` 通過；`git diff --check` 通過。
- AGENTS.md／CLAUDE.md 只增加限 Codex 讀取的入口；原有 Claude Code 選模表、`.claude/agents/`、兩側 Skills 的內容均未變更。未更動 Claude 或 Codex 全域設定。

## 驗證範圍與限制

本次驗證設定載入、專用文件入口、代理啟動與執行設定，不代表所有工作情境均能正確自動分流，也不代表 Luna 已通過本專案 Skills 的正式驗收。後續實際驗收仍須記錄情境與結果。

測試過程出現既有 MCP 本機連線錯誤；本次測試未使用 MCP，代理均完成，主程序退出狀態為 0。未為此修改 MCP 設定。

本次未模擬模型不可用；該情況沿用既有 Skill 的停止並詢問使用者流程，沒有新增模型備援。
