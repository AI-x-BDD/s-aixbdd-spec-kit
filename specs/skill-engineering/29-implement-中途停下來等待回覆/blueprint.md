# 工程藍圖：implement－中途停下來等待回覆

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/29-implement-中途停下來等待回覆/`
- 根因報告：`rca-report.md`（R4 載體過弱；使用者 2026-11-01 確認）
- 確認紀錄：使用者於 Phase 4 回覆「確認」（2026-11-01），確認藍圖全部內容。

## 1. 驗收條件

同 `rca-report.md` 第 2 節 E1–E11（E1、E5 含本次補上的判斷方式），全部為通用。

## 2. To-Be SOP

只列變更的步驟與完成條件；其餘維持 `.claude/skills/implement/SKILL.md` 現行原文。

````markdown
11. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py check <tasks.md 絕對路徑> <任務 ID> --read "<本任務讀取的 Must Read 與 Optional 部位>" --verify "<驗證命令與結果>" [--scope <執行範圍>] [--skip <受阻任務 ID>...]`，把本任務標為 `[X]`，取得「打勾結果」；（其餘原文不變）

完成條件：範圍內每個任務都已標為 `[X]` 或記入「受阻任務」，每個完成的 Phase 都已執行 Checkpoint 驗證，且期間沒有結束回合或等待使用者回覆。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無 | — | 既有元素都能追溯到 E1–E11；R4 為載體過弱，以腳本提醒加強 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `scripts/tasks_state.py` `check` | 修改 | 新增選用參數 `--scope`、`--skip`（與 `next` 相同）；成功時計算範圍內未打勾且不在 `--skip` 的任務數 N，輸出 `remaining` 欄位，並在 `progress` 末行加上：N > 0 時「範圍內還剩 N 個任務：立即執行 next；全部完成前不得停下來或詢問是否繼續」，N = 0 時「範圍內任務已全部完成：進入完成報告」 | R4；E1、E5；C9 |
| P2-11（打勾） | 修改 | 命令加上與 `next` 相同的 `[--scope …] [--skip …]` | R4；C9 |
| Phase 2 完成條件 | 修改 | 加上「且期間沒有結束回合或等待使用者回覆」 | R4；E1、E5 |
| `rules/自主決策-格式規範.md` Rule 1 | 修改 | 標題改為「執行期間不得中途停止或提問，矛盾必須依權威順序自行決策」；新增條列「範圍內所有任務都已打勾或記為受阻之前，不得結束回合；不得因任務數量、執行時間、上下文用量或想讓使用者確認進度而中途停止，也不得詢問是否繼續」；新增 Good／Bad Example 2（T009 打勾後還剩 40 個任務：直接 `next` vs. 停下來回報進度並問是否繼續） | R4；E1、E5；C14 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| 其餘 SOP 步驟、`任務驗證`、`專案衛生`、`任務實作` RuleFile、`自主決策` Rule 2–3、`status`／`next` | 同紀錄 28 | 同紀錄 28 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 20 | 20 | 0 |
| RuleFile | 4 | 4 | 0 |
| Rule | 10 | 10 | 0 |
| 樣板組 | 0 | 0 | 0 |
| 腳本 | 1 | 1 | 0 |

- 只修改既有內容，沒有新增部位：續跑要求原本已存在於 Rule 1 第一條，改寫為涵蓋「主動停止」的明確條列；腳本提醒改用既有的 `check` 輸出。

## 5. 約束分配表

只列本次修改的約束；其餘沿用紀錄 27、28。

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C9 | 打勾只接受目前發出的任務；必填 `--read`、`--verify`；成功時輸出 `progress`（含固定進度行、讀取、驗證與剩餘任務提醒）與 `remaining`；`--scope`／`--skip` 與 `next` 相同 | P2-11 | `scripts/tasks_state.py` `check` | 剩餘數與提醒可由程式計算並在每次打勾時穩定輸出，比步驟文字更強（R4） |
| C14 | 執行期間不提問、不中途停止（不因任務數量、時間、上下文或確認進度而停或詢問是否繼續）；矛盾依權威順序決策；優先於 Contract 第 6、7 點 | P2-8、P2-10、P2-13 | `rules/自主決策-格式規範.md` Rule 1 | 判斷何謂「中途停止」與正當的受阻需要正反例；腳本只能提醒，無法阻止回合結束 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-sop` | `SKILL.md` Phase 2 打勾步驟與完成條件 | 打勾命令加 `[--scope …] [--skip …]`；完成條件加「且期間沒有結束回合或等待使用者回覆」 | C9 | 已完成 |
| 2 | W2 | `skill-form-script` | `scripts/tasks_state.py` `check` | 新增 `--scope`、`--skip`，輸出 `remaining` 與 `progress` 末行提醒 | C9 | 已完成 |
| 3 | W3 | `skill-form-rule` | `rules/自主決策-格式規範.md` Rule 1 | 改標題、加條列、加 Example 2 | C14 | 已完成 |

### 工作項內容

- W2 驗證：以 001 客製版 tasks.md 複本，`next`→`check` 後 `progress` 末行為「範圍內還剩 58 個任務……」；`--scope phase:1` 打勾第 7 個任務後末行為「範圍內任務已全部完成：進入完成報告」；`--skip` 的任務不計入剩餘；未帶 `--scope` 時以全部任務計算；其餘行為（只接受目前任務、必填 `--read`／`--verify`）不變。
- W3 範例使用診所掛號情境，不與 1A2B 或購物車相同。

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S5 | E1–E8、E10、E11 | 本次（原始輸入） | 以 Herdr 開全新的 Claude Code session（`--model sonnet --effort medium`，auto mode），暫存專案只含 `implement` 與 001 spec package；送出「依 specs/001-online-pvp-1a2b/tasks.md 把線上 1A2B 對戰平台開發完成」 | 回合中若停下來詢問是否繼續，記為未通過，不代為回覆 | 回合在 59 個任務都打勾或受阻後才結束；期間沒有詢問是否繼續；對話紀錄每個任務一組 `next`／`check`、每個 `check` 輸出含進度行與剩餘提醒；其餘同紀錄 28 S4（tasks.md 只變更核取方塊、git log 不變、識別字逐字、ignore、無殘留、完成報告欄位） |
| S2 | E1、E3、E5 | 回歸（子代理） | 同紀錄 28 S2（T001 已完成、research §1 埋 4000、只執行 Phase 1） | 無 | 同紀錄 28；另確認第 7 個任務的 `check` 輸出「範圍內任務已全部完成」後進入完成報告 |
| S3 | E9 | 回歸 | 沿用紀錄 28 第 2 輪結果 | — | W1–W3 不影響 Phase 1 的停止路徑 |

## 8. 驗收結果

### 施工後結構診斷

- `audit_skill.py`：errors 0、warnings 0；`sync-skills.sh --from claude` 後 `--check` 為「兩邊一致」。
- 施工註記（W2）：001 客製版 tasks.md 複本中，未帶 `--scope` 時 T001 打勾後 `remaining` 為 58；`--scope phase:1` 逐一打勾 T002–T006 時剩餘 5→1，T007 打勾後末行為「範圍內任務已全部完成：進入完成報告」；`next --skip T007` 在其餘任務完成後回傳 `null`。

### 驗收方式

- S2：Claude Sonnet 子代理（`model: sonnet`、`effort: medium`），只取得 Skill 路徑、測試環境與使用者需求；以對話紀錄的工具輸出判斷。
- S5：以 Herdr 在新 pane 啟動全新的 Claude Code（`claude --model sonnet --effort medium`，auto mode），暫存專案 `implement-accept4/S5` 只含 `implement` 與 001 spec package；以對話紀錄 `a740caf3-842f-462a-8288-c5607bb43826.jsonl`（329 次工具呼叫）判斷。
- 測試環境處理（S5）：信任資料夾由主代理代為選擇（測試環境由主代理建立）；測試 session 要求執行 `rm -f $S/*.log $S/*.pid`，Claude Code 因 `$S` 可能為空判為危險命令，主代理選擇「No」，回合因此中斷，送入「這個清理命令不用執行，請繼續。」；之後一次 `API Error: The response stopped arriving` 使回合中斷，送入「繼續」。兩次中斷都不是 Skill 主動停止。

### 各情境結果

| 情境 | 結果 | 證據 |
| ---- | ---- | ---- |
| S5 | 通過 | 59/59 完成、無受阻；對話紀錄中沒有任何「要繼續請告訴我」「是否繼續」類文字，回合只在上述兩次環境中斷與最後完成報告時結束；每個任務都有 `check` 輸出的「<任務 ID> 已通過，回寫後繼續下一個任務」（T001–T059 全數涵蓋）與剩餘任務提醒；沒有迴圈打勾或被拒絕的打勾；tasks.md 只變更 59 行核取方塊，`git log` 不變；抽查錯誤碼、事件名稱、畫面文字逐字出現；`.gitignore` 涵蓋 `node_modules`，未忽略 migrations、lock 檔與 `.env.example`；兩端 `npm run check` 通過；沒有新增測試檔；Phase Checkpoint 以瀏覽器實測；完成報告含完成數、受阻、Checkpoint、決策紀錄、檔案變更與啟動方式 |
| S2 | 通過 | T002–T007 的 `check` 依序輸出「範圍內還剩 5→1 個任務……」，T007 輸出「範圍內任務已全部完成：進入完成報告」後產出完成報告；tasks.md 只變更 6 行核取方塊；T004 依權威順序採 3000 並記錄 |
| S3 | 沿用紀錄 28 第 2 輪通過 | 本次修改不影響 Phase 1 停止路徑 |

### 觀察（不影響判定）

- S5 結束時後端與 Vite 仍在背景執行：測試 session 原本的清理命令被主代理以安全理由拒絕，它在完成報告中說明了未關閉的程序；屬測試環境處理造成，主代理已手動結束兩個程序並移除資料庫容器。
- S5 執行期間兩次回合中斷都來自環境（權限檢查、API 錯誤），送入「繼續」後都從下一個未打勾任務接續，未重做已完成任務。

### 收尾

- 測試 pane 已關閉，資料庫容器以 `docker compose down -v` 移除。
- 個案驗收條件：無。
- 結論：所有驗收情境均已通過；`description` 保留「（未驗證）」，交回 `user-verify-skill` 以相同需求與測試素材重跑使用者實際驗證。

### 使用者實際驗證（2026-11-01）

- 方式：以 `user-verify-skill` 在 scratchpad 建暫存專案 `implement-verify`（`.claude/skills/` 只放 `implement`，`.claude/` 加入 `.git/info/exclude`；測試素材為 repo 的 `specs/001-online-pvp-1a2b/`，含紀錄 27 重產的客製版 tasks.md，提交為初始 commit），以 Herdr 在新 pane 啟動 `claude --model sonnet --effort medium`（auto mode）。實跑需求以自然語言送出、不指名 Skill：「依 specs/001-online-pvp-1a2b/tasks.md 把線上 1A2B 對戰平台開發完成」。三輪皆使用相同需求與測試素材，每輪重建暫存專案。
- 權限處理：
  - 第 1 輪：信任資料夾由使用者回答「trust」；做到 US3 時電腦進入睡眠產生 API 錯誤，依使用者「continue」送入「繼續」。
  - 第 2 輪：沒有出現權限確認。
  - 第 3 輪：沒有出現信任資料夾；4 次「Read outside the working directories」（`/tmp/room.png`、`/tmp/v-win.png`、`/tmp/w360-entry.png`、`/tmp/w720-result.png`，皆為測試 session 以 agent-browser 自行產生的截圖）由使用者選擇「4. Yes, but ask again next time」；之後使用者授權主代理對同類唯讀確認依選項文字自動選擇「Yes, but ask again next time」，實際未再觸發（紀錄 `scratchpad/verify-auto-approvals.log`）。
- 結果：
  - 第 1 輪（Skill 為紀錄 27 版本）：59/59 完成，但 `next` 0 次、以迴圈每次打勾 4–7 個任務、開工前讀完六份 spec 文件全文、沒有逐任務回報；使用者判定不通過，交 `skill-engineering` 優化（紀錄 28：R1 載體過弱、R2 缺失、R3 載體過弱）。
  - 第 2 輪（紀錄 28 版本）：T001–T003 逐一 `next`／`check`、腳本輸出逐任務回報，但 T003 後自行結束回合，輸出「我先在這裡停下來回報進度……要繼續的話，請告訴我」；使用者判定不通過，交 `skill-engineering` 優化（紀錄 29：R4 載體過弱）。
  - 第 3 輪（紀錄 29 版本）：測試 session 自行呼叫 `Skill: implement`（自動觸發成功）；296 次工具呼叫、約 36 分鐘，59/59 在同一回合完成、無受阻、沒有詢問是否繼續；第一次 `next` 前沒有讀取 tasks.md 以外的 spec 文件；T001–T059 各有一則 `check` 輸出的「<任務 ID> 已通過，回寫後繼續下一個任務」與讀取部位、驗證結果；沒有單一命令打勾兩個任務、沒有被拒絕的打勾；tasks.md 只變更 59 行核取方塊，`git log` 只有初始 commit。對照通用驗收條件：E1–E8、E10、E11 符合（抽查 5 個錯誤碼、3 個事件名稱、2 句畫面文字逐字出現；`.gitignore` 未忽略 migrations、lock 檔與 `.env.example`；主代理重跑兩端 `npm run check` 與前端 `npm run build` 通過；沒有新增測試檔，3000、5173 埠已關閉，保留開發用資料庫容器並在報告說明）；E9 本次未觸發，無法親自證實。
- 觀察：
  - 第 1、2 輪的問題都沒有被子代理驗收發現：子代理依提示補寫逐任務回報、且不會中途把回合交還使用者；紀錄 28、29 改以不提示回報格式的子代理與真實 Claude Code session 驗收。
  - 第 3 輪完成報告列出 3 個產品小問題（對局結束後仍顯示「回合 N+1」、雙方同時斷線時記錄良性的 `ROOM_NOT_FOUND`、設定階段對手離開時留下者按「回到入口」才離開房間），屬規格未定義或人工 QA 範圍，不屬 `implement` 的缺陷。
  - `--verify` 的內容真偽仍依賴 AI（紀錄 29 第 3 輪 S2 曾先寫「通過」後補跑），腳本只能保證有填寫。
  - 4 次權限確認都來自 Claude Code 對工作目錄以外讀取的限制（截圖存於 `/tmp`），與 Skill 無關。
- 結論：使用者依課程第四章〈把 /testplan 和 /tdd 放進你的 SDD 工作流中〉約 43:40–46:30 的判準（執行過程長、一次一個 Task、已通過回寫後繼續）判定第 3 輪通過；移除 `description` 開頭的「（未驗證）」，其餘文字不變。測試 pane 與暫存專案已移除。
