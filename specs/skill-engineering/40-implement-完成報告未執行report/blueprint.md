# 工程藍圖：implement－完成報告未執行 report

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/40-implement-完成報告未執行report/`
- 根因報告：`rca-report.md`（R4' 載體過弱；使用者 2026-11-08 回覆「照建議」確認）
- 確認紀錄：使用者於 Phase 4 回覆「確認」（2026-11-08），確認藍圖全部內容。

## 1. 驗收條件

同 `rca-report.md` 第 2 節 E1、E2，全部為通用；以對話紀錄中 `tasks_state.py` 的工具輸出判斷（比照紀錄 38、39）。

## 2. To-Be SOP

SOP 不變。Phase 3 步驟 1 已規定執行 `report`；本次只讓腳本在進入 Phase 3 時指名這個命令。

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 提醒文字「範圍內任務已全部完成：進入完成報告」 | `scripts/tasks_state.py` `remaining_tail` | R4'：沒有指名下一個命令，改寫為下表內容 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `remaining_tail`（`check`、`block` 共用） | 修改 | 範圍完成時改為「範圍內任務已全部完成：立即執行 report 取得完成報告摘要，再依 Phase 3 撰寫完成報告」 | R4'；E1；C22 |
| `next` 回傳 `task: null` 的輸出 | 修改 | 新增欄位 `next_step`，內容與上列提醒相同 | R4'；E1；C22 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter（含「（未驗證）」）、全部 SOP 步驟與完成條件、4 個 RuleFile | E2 | 同紀錄 27–29、32、37–39 |
| `tasks_state.py` 其餘行為（`status`、`next` 發出任務、`check`、`block`、`report`） | E2 | C9、C17、C18、C20、C21 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 21 | 21 | 0 |
| RuleFile | 4 | 4 | 0 |
| Rule | 10 | 10 | 0 |
| 樣板組 | 0 | 0 | 0 |
| 腳本 | 1 | 1 | 0 |

- 只改寫既有提醒文字並在 `next` 的 `null` 輸出加一個欄位；不新增步驟或部位。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C22 | 範圍內任務都打勾或受阻時，腳本輸出指名下一個命令「立即執行 report 取得完成報告摘要，再依 Phase 3 撰寫完成報告」：`check`／`block` 的 `progress` 末行，與 `next` 回傳 `task: null` 時的 `next_step` | P2-12、P2-4、P3-1 | `scripts/tasks_state.py` | 與紀錄 29 的續跑提醒同一載體；腳本在進入 Phase 3 的時點輸出，比只寫在 SOP 文字穩定（R4'） |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-script` | `scripts/tasks_state.py` | 見工作項內容 | C22 | 已完成 |

### 工作項內容

#### W1：`tasks_state.py`

- `remaining_tail`：剩餘數為 0 時回傳「範圍內任務已全部完成：立即執行 report 取得完成報告摘要，再依 Phase 3 撰寫完成報告」；剩餘數大於 0 時原文不變。
- `next`：沒有可發出的任務（`task` 為 `null`）時，輸出新增 `"next_step": "範圍內任務已全部完成：立即執行 report 取得完成報告摘要，再依 Phase 3 撰寫完成報告"`；有任務時不輸出 `next_step`。
- 檔頭說明依新輸出更新。
- 驗證（施工者執行）：以 `specs/001-online-pvp-1a2b/tasks.md` 複本，`status --reset --scope T001-T002` → `next`／`check T001` 的末行為剩餘提醒 → `next`／`block T002 --cause env --detail d` 的末行為新提醒 → `next` 回傳 `task: null` 且 `next_step` 為新提醒；有任務時 `next` 沒有 `next_step`；tasks.md 只變更 T001 一行。

## 7. 驗收情境

測試環境同紀錄 39：暫存專案 `.claude/skills/` 只放修改後的 `implement`，`specs/` 為 `specs/001-online-pvp-1a2b/` 複本，執行前 commit 基準狀態；以 Herdr 真實 session（`claude --model sonnet --effort medium`）執行。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2 | 本次（原始輸入） | repo 憲法加上測試用 `skills/implement/code.md`（Rule 1 必須：註解用英文；Rule 2 不得：使用 Prettier）。輸入「依 specs/001-online-pvp-1a2b/tasks.md 只完成 Phase 1 與 Phase 2」 | 無（提問即未通過） | 最後一個 `check`／`block` 或 `next` 的輸出含新提醒；之後有一次 `report` 呼叫，工具輸出含「憲法遵循」5 項且第 5 項為 T002、T003、T006；T002、T003、T006 以 `block` 受阻；`status` 輸出含 `code.md` Rule 2；沒有提問；`tasks.md` 只變更核取方塊 |

- 回歸：紀錄 39 S2（沒有憲法檔）只走 Phase 3 的同一提醒路徑，S1 已涵蓋；`user-verify-skill` 隨後以相同需求重跑。
- 呼叫者回歸：沒有其他 Skill 委派 `implement`。

## 8. 驗收結果

### 施工後結構診斷

- `audit_skill.py`：errors 0、warnings 0；`sync-skills.sh --from agents` 後 `--check` 為「兩邊一致」；沒有只存在於目標端、未被刪除的 Skill。
- 施工註記（W1）：新增常數 `DONE_REMINDER`，`remaining_tail` 與 `next` 的 `next_step` 共用；施工者另驗證以 `check` 打勾最後一個任務時末行同為新提醒。

### 驗收方式

- S1：Herdr 真實 session（`claude --model sonnet --effort medium`，Sonnet 5.5，auto mode），暫存專案 scratchpad `accept40/S1`；信任資料夾由主 session 代為選擇；以對話紀錄 `b60cac12-….jsonl` 的工具輸出判斷，另以 `git diff` 與檔案檢查核對。

### 各情境結果

| 情境 | 結果 | 證據 |
| ---- | ---- | ---- |
| S1 | 通過 | 自動觸發；`status` 1、`next` 21、`check` 5、`block` 15、`report` 1，沒有單一命令處理兩個任務，沒有直接讀取憲法檔，沒有提問；`status` 輸出含 `code.md` Rule 2；最後一個回寫輸出含新提醒後執行 `report`；`report` 工具輸出列出 15 個受阻任務與原因、「憲法遵循」5 項（第 1 項兩個憲法檔、第 2 項未全部通過與原因、第 5 項 T002、T003、T006）；沒有 `prettier` 依賴與 `.prettierrc`；`tasks.md` 只變更 5 行核取方塊 |

### 收尾

- 個案驗收條件：無。
- 結論：所有驗收情境均已通過；`description` 保留「（未驗證）」，交回 `user-verify-skill` 以相同需求與測試素材重跑使用者實際驗證。

### 使用者實際驗證（2026-11-08）

- 方式：以 `user-verify-skill` 驗證 `implement`，共 5 輪；每輪在 scratchpad 重建暫存專案 `verify-implement`（`.claude/skills/` 只放 `implement`，`.claude/` 加入 `.git/info/exclude`；測試素材為 `specs/001-online-pvp-1a2b/` 複本與 repo 憲法，加上測試用 `skills/implement/code.md`：Rule 1 必須「程式碼註解必須使用英文」、Rule 2 不得「不得使用 Prettier」，提交為初始 commit），以 Herdr 在新 pane 啟動全新的 `claude --model sonnet --effort medium`（Sonnet 5.5、medium，auto mode）。實跑需求以自然語言送出、不指名 Skill：「依 specs/001-online-pvp-1a2b/tasks.md 只完成 Phase 1 與 Phase 2」。每輪需求與測試素材相同。
- 權限處理：第 1 輪的信任資料夾確認在轉述前已由使用者在 pane 中回答；之後各輪沒有出現信任資料夾確認或其他權限確認；執行者沒有自行放行任何項目。
- 結果：
  - 第 1 輪（紀錄 32 版本，2026-11-07）：T002、T003、T006 刪掉 Prettier 後打勾，衝突寫進「憲法偏離」；使用者判定不通過 → 紀錄 37（R1 衝突：`自主決策` Rule 2 只允許環境受阻）。
  - 第 2 輪（紀錄 37 版本）：受阻行為正確，但受阻進度行、「憲法遵循」子項與 Rule 理由由 AI 自組、不穩定；使用者判定不通過 → 紀錄 38（R1、R2 載體過弱：新增 `block`、`report`，`status --reset`）。
  - 第 3 輪（紀錄 38 版本）：測試 session 以 `cat … | head -80` 讀憲法，`code.md` Rule 2 被截斷，安裝 Prettier、20 個任務全打勾；使用者判定不通過 → 紀錄 39（R3 載體過弱：`status` 輸出憲法全文）。
  - 第 4 輪（紀錄 39 版本）：憲法載入與受阻正確，但 Phase 3 沒有執行 `report`；使用者判定不通過 → 紀錄 40（R4' 載體過弱：完成提醒指名 `report`）。
  - 第 5 輪（紀錄 40 版本，對話紀錄 `9e4d2e46-….jsonl`）：自動觸發 `Skill: implement`；34 次工具呼叫，沒有提問；`status` 輸出含 `code.md` Rule 2，沒有直接讀取憲法檔；T002、T003、T006 以 `block`（憲法衝突，`code.md` Rule 2）受阻，另 13 個連帶受阻，T001、T005、T017、T018 以 `check` 打勾（實作任務都一次一個）；沒有 `prettier` 依賴與 `.prettierrc`，沒有中文註解；`report` 工具輸出列出 16 個受阻任務與原因、「憲法遵循」5 項（第 1 項兩個憲法檔、第 5 項 T002、T003、T006）；`tasks.md` 只變更 4 行核取方塊，`git log` 只有初始 commit。
- 觀察：
  - 第 5 輪以 shell `for` 迴圈批次 `block` T008–T015 並以 `>/dev/null` 丟棄進度輸出，另以自訂函式與單一命令串接 T007、T008 與 T019、T020 的 `block`，違反 `rules/任務實作-格式規範.md` Rule 1；串接只發生在沒有實作工作的連帶受阻任務，`tasks_state.py` 無法辨識 shell 迴圈。記入 `docs/待確認.md` 第 29 項。
  - 第 5 輪 AI 以 `--unapplied "無"` 呼叫 `report`，第 4 項輸出為「- 無」。
  - 依 E3（紀錄 37）連帶受阻後，Phase 1–2 只完成 4／20；修正來源在 `tasks`（`docs/待確認.md` 第 19 項）。
  - 其他 8 個 SDD Skill 以文字讀取憲法檔的同類風險記入 `docs/待確認.md` 第 28 項。
- 結論：使用者判定第 5 輪通過（2026-11-08），移除 `description` 開頭的「（未驗證）」，其餘文字不變；以 `./scripts/sync-skills.sh --from agents` 同步，`--check` 為「兩邊一致」。測試 pane 與暫存專案已移除。
