# 交接：小變更 small-1，下一步是 runbook 步驟 9 的準備（P9）

- repo：`/Users/steve.tsao/projects-practice/s-aixbdd-spec-kit`（分支 `main`）
- 交接時 HEAD：`374763a`。`git status` 只有已知的未 commit 目錄 `docs/wb-secret-formula/`：不讀、不改、不 commit，也不算 `git status` 不乾淨。
- 回覆語言：繁體中文，依 `CLAUDE.md`「回答方式」（每一步結尾附「下一步提示詞」區塊）。

## 這次在做什麼

依 `docs/dev/迭代-runbook.md` 第 4 節的「小變更路徑」，代號 `small-1`（`{N}`=`small-1`、`{SPEC_DIR}`=`specs/008-overdue-discord-notification`）。

本次變更：008「逾期通知紀錄」的 4 種通知狀態徽章（送出中、送出成功、送出失敗、結果不明），在 Light Mode 的文字對比要調到 WCAG AA 4.5:1 以上。只改徽章文字色；全站共用色彩變數、其他元件與 Dark Mode 不變。

完整過程、決策與 Skill 問題都在 **`docs/iterations/iter-small-1.md`**。開工前先讀這份與 runbook，不要在這裡重複。

## 已完成（小變更路徑第 3 點第 1～4 步）

| 步驟 | commit |
|---|---|
| P0s 準備 | （併入下一個 commit） |
| P5b 重跑 `ui-plan`（F1～F4），新增 4 個徽章文字色 | `9586fc7` |
| P8c 第 1 輪 `converge`：G1～G3，都是附加任務 | `05fe183` |
| P8t `tasks` 附加模式：Phase 7，T043～T045 | `f947b9c` |
| P8 `implement` Phase 7 | `4dab6ec` |
| P8c 第 2 輪 `converge`：已收斂 | `374763a` |

- G1／T043：前端徽章改用 `--badge-sending-ink` `#1d4ed8`、`--badge-sent-ink` `#166534`、`--badge-failed-ink` `#b91c1c`、`--badge-unknown-ink` `#92400e`（定義在 `apps/equipment-loan/frontend/index.html` 的 `:root`，用在 `frontend/src/views/OverdueNotificationsView.tsx` 的 `.odn-badge-*`）。實測 Light Mode 對比 5.49／6.49／5.30／6.37；Dark Mode 仍是 `--ink`（9.90／8.71／9.58／8.67）。
- G2／T044：`backend/src/jobs/overdueScheduler.ts` 的恢復處理、領取與送出結果更新，都把 `updated_by` 設為 null。管理員重送（B2）仍寫管理員 ID。
- G3／T045：`backend/src/config/notificationConfig.ts` 的 `checkWebhookUrlAtStartup()`，在 `start()` 開頭呼叫。`DISCORD_WEBHOOK_URL` 空白或格式錯誤時，啟動 log 只寫固定文字「DISCORD_WEBHOOK_URL 沒有設定或格式不正確」，不寫輸入值，後端照常啟動。

## 下一步：P9 準備（新對話要做的事）

依使用者交接時給的提示詞做（見本文最後）。重點：

1. 寫出從乾淨環境開始的啟動方式。依據是 `apps/equipment-loan/README.md`：第 2 節啟動；`docker compose up -d --wait`、`npm run db:migrate`、`npm run db:seed`；`.env` 說明約在第 257～262 行；模擬器 `npm --prefix backend run discord:sim` 約在第 269 行；demo seed 內容約在第 309 行。
2. 寫出驗證情境（成功操作、關鍵失敗、回歸），每個情境寫「操作步驟」與「預期結果」。可觀察的行為：
   - 徽章：demo seed 有「送出成功」「送出失敗」「結果不明」各 1 則；「送出中」可用重送或「立即檢查逾期」產生。切換 Light／Dark Mode 比對文字顏色。可用 DevTools 檢查 computed `color`，或用 Lighthouse／對比工具量測。
   - T044：重送一則通知後，查 `overdue_notifications.updated_by`：重送當下是管理員 ID，送出程序處理後變成 null。資料庫在 Docker 容器 `equipment-loan-postgres`，資料庫名稱預設 `equipment_loan`；可用 `docker exec ... psql` 查詢。指令要先確認容器內的使用者名稱。
   - T045：把 `DISCORD_WEBHOOK_URL` 設為空白或錯誤格式再啟動後端，終端機出現固定文字警告且不顯示輸入值；設回模擬器位址則沒有警告。
   - 回歸：既有頁籤、登入、逾期通知清單、篩選、換頁、重送、立即檢查逾期照常運作。
3. 確認 demo seed 能重設展示資料，寫出重設指令（`npm run db:seed`）。
4. 寫進 `iter-small-1.md` 的「使用者驗證」一節，然後**停下來等使用者操作**。不代替使用者宣稱已驗證。

### 環境注意事項

- **5173 埠被別的專案的 Vite 占用**（`/Users/steve.tsao/projects-staff/...`），不是本專案的程序，不要關掉它。README 預設前端開在 `http://localhost:5173`。寫啟動方式時要提醒使用者：5173 被占用時，Vite 會改用其他埠，或要指定 `--port`。驗證情境裡的網址要配合實際埠。
- e2e 使用 3000（後端）、5183（前端）、4010（模擬器）。
- agent 自己啟動的伺服器，驗證後都要關掉；`npx` 會留下子程序，要用 `lsof -iTCP:<埠> -sTCP:LISTEN` 確認。
- 開發資料庫目前是 demo seed 狀態；PostgreSQL 容器保持運行。

## P9 之後的流程（參考，不要提前做）

使用者回報驗證結果 → 寫進「使用者驗證」（P9 第二段）→ P10 填「Skill 表現檢查」→（有 Skill 缺陷時）P11 → P12 收尾。

步驟 12 的提醒：
- 不在 runbook 第 5 節新增列。
- 第 4 列遺留項 `iter-4.md:107` 屬於 006，不標已處理。
- `iter-small-1.md` 已記下待決定去向的事：
  - 遺留項候選：「已歸還」徽章 Light Mode 4.34:1、「借用中」徽章 Dark Mode 3.68:1。
  - Skill 問題 1～5（`ui-plan` 沒有對比檢查；`converge` 的 4 項）。
  - 流程不足：`ui-plan` 只能整份重寫。
  - 固定環境的中途變動：`converge` 由 Opus 子代理執行。

## 使用者給的規則（P0s，仍有效）

- 每一步只做使用者貼的那一步，做完就停。
- 用路徑指定 Skill：讀 `.agents/skills/<name>/SKILL.md` 並依 SOP 執行，不用同名的全域 Skill。
- 不修改任何 Skill（`.claude/skills/`、`.agents/skills/`）。Skill 問題依 runbook 第 7 節格式記進 `iter-small-1.md`。
- 在 runbook 第 4 節（含小變更路徑）標出的檢查點，可以自行 commit，訊息依 `.agents/skills/conventional-commits/SKILL.md`。不 push、不打 tag。
- 每一步結束時，用 3 行以內回報：產出、問題、下一步。
- 每次回覆結尾附下一步提示詞（自動模式已開啟）。需要使用者實際操作驗證時不附，改寫「自動接續停止：」加原因與驗證步驟。

## 建議的 Skill

- P9 準備不需要呼叫任何 Skill（runbook 步驟 9 沒有對應的 Skill）。
- 要在瀏覽器確認徽章顏色或畫面時：`chrome-devtools-mcp:chrome-devtools`（或 `chrome-devtools-mcp:a11y-debugging`，看色彩對比）。驗證情境由使用者操作，agent 只在準備時自我確認。
- 之後的 commit：讀 `.agents/skills/conventional-commits/SKILL.md`，依它的 SOP 寫訊息。不要用 Skill 工具呼叫同名的全域版本。

## 新對話要執行的提示詞（使用者提供）

```text
請做 runbook 步驟 9 的準備：
1. 寫出啟動方式（從乾淨環境開始的指令）。
2. 寫出本次驗證情境：成功操作、關鍵失敗、前幾次功能的回歸，每個情境寫「操作步驟」與「預期結果」。本次是小變更 small-1，情境以 4 種通知狀態徽章在 Light Mode 與 Dark Mode 的文字顏色與可讀性為主，並涵蓋 T044（送出程序寫入時 updated_by 為空）與 T045（後端啟動時驗證 DISCORD_WEBHOOK_URL）可以觀察到的行為。
3. 確認 demo seed 可以重設本次的展示資料，寫出重設指令。
寫進 docs/iterations/iter-small-1.md 的「使用者驗證」，然後停下來，等我操作完回報結果。
完成後依 CLAUDE.md 格式附上下一步提示詞。
```
