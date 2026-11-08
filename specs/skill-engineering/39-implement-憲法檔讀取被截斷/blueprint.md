# 工程藍圖：implement－憲法檔讀取被截斷

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/39-implement-憲法檔讀取被截斷/`
- 根因報告：`rca-report.md`（R3 載體過弱；使用者 2026-11-08 回覆「照建議」確認）
- 確認紀錄：使用者於 Phase 4 回覆「確認」（2026-11-08），確認藍圖全部內容。

## 1. 驗收條件

同 `rca-report.md` 第 2 節 E1–E4，全部為通用；E1、E2 以對話紀錄中 `status`、`report` 的工具輸出判斷（比照紀錄 38）。

## 2. To-Be SOP

只列變更的步驟；其餘維持 `.agents/skills/implement/SKILL.md` 現行原文。

````markdown
## Phase 2 -- 逐一執行任務

3. `READ` 「任務狀態」的 `constitution`（腳本讀取的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/implement/code.md` 全文，不存在的檔案列在 `missing`），建立「憲法檢查清單」，並建立空的「憲法偏離」與「未套用規則」；鎖定項目不受憲法覆寫：任務依 `tasks_state.py` 指定的順序一次執行一個，`tasks.md` 的核取方塊只由 `tasks_state.py check` 變更。

## Phase 3 -- 完成報告

1. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py report <tasks.md 絕對路徑> [--scope <執行範圍>] --must-pass <yes|no> [--must-detail "<未通過的規則與原因>"] [--deviation "<偏離的應規則與理由>"...] [--unapplied "<未套用的規則與衝突的鎖定項目>"...]`，取得「完成報告摘要」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止；並在專案根目錄執行 `git status --short`，取得「檔案變更」。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| P2-3 以步驟文字直接讀取兩個憲法檔 | P2-3 | R3：改由 `status` 讀取並輸出全文（C21），AI 不再自選讀檔命令 |
| `[--constitution-file <已讀取的憲法檔路徑>...]` | P3-1；`report` 參數 | R3、E2：已讀取的憲法檔改由腳本記錄（C21），不由 AI 傳入 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| P2-3 | 修改 | 改為從「任務狀態」的 `constitution` 建立「憲法檢查清單」（第 2 節），鎖定項目原文不變 | R3；E1 |
| P3-1 | 修改 | 刪除 `--constitution-file` | R3；E2 |
| `scripts/tasks_state.py` `status` | 修改 | 讀取兩個固定路徑的憲法檔，輸出 `constitution`，並把實際載入的路徑記入狀態檔（見 W2） | R3；E1、E2、E4；C21 |
| `scripts/tasks_state.py` `report` | 修改 | 刪除 `--constitution-file`，第 1 項改用狀態檔記錄的路徑（見 W2） | R3；E2；C20、C21 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter（含「（未驗證）」） | E3 | 同紀錄 29 |
| 其餘 SOP 步驟與完成條件 | E3 | 同紀錄 28、29、32、37、38 |
| 4 個 RuleFile | E3 | 同紀錄 27–29、37 |
| `tasks_state.py` 的 `next`、`check`、`block`，`status --reset` 的清除行為 | E3 | C9、C17、C18 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 21 | 21 | 0 |
| RuleFile | 4 | 4 | 0 |
| Rule | 10 | 10 | 0 |
| 樣板組 | 0 | 0 | 0 |
| 腳本 | 1 | 1 | 0（子命令 5 不變） |

- 只改寫既有步驟與子命令：讀檔從 AI 改到既有的 `status`（Phase 1 原本就會執行，且 AI 已需完整讀取其 `context`），不新增子命令。

## 5. 約束分配表

只列本次修改的約束；其餘沿用紀錄 27–29、32、37、38。

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C20 | 完成報告摘要固定格式（同紀錄 38）；第 1 項改為狀態檔記錄的已載入憲法檔路徑，都不存在時「沒有憲法檔」 | P3-1、P3-2 | `scripts/tasks_state.py` `report` | 同紀錄 38；本次只改第 1 項的資料來源（R3） |
| C21 | 由專案根目錄（tasks.md 往上兩層，即 `specs/<目錄>/tasks.md` 的上兩層）讀取 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/implement/code.md` 全文；`status` 輸出 `constitution`（`files`：路徑與全文；`missing`：不存在的路徑），並把實際載入的路徑記入狀態檔 | P1-4、P2-3、P3-1 | `scripts/tasks_state.py` `status` | 路徑固定、輸入輸出明確、可重複執行（約束分配 Rule 2 順序 1）；讀檔交給 AI 時會被截斷（R3） |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-sop` | `SKILL.md`：Phase 2 `READ`「建立『憲法檢查清單』」、Phase 3 `DELEGATE`「`tasks_state.py report`」 | 依第 2 節全文改寫，其餘步驟不變 | C20、C21 | 已完成 |
| 2 | W2 | `skill-form-script` | `scripts/tasks_state.py` | 見工作項內容 | C20、C21 | 已完成 |

### 工作項內容

#### W2：`tasks_state.py`

- 專案根目錄：`tasks.md` 絕對路徑的上兩層目錄（`<root>/specs/<目錄>/tasks.md`）。
- `status`：
  - 讀取 `<root>/.agents/constitution/shared.md` 與 `<root>/.agents/constitution/skills/implement/code.md`（固定順序）。
  - 輸出新增 `constitution`：`{"files": [{"path": <相對於 root 的路徑>, "content": <檔案全文>}], "missing": [<不存在的相對路徑>]}`；放在 JSON 輸出中 `context` 之前。
  - 把實際載入的相對路徑寫入狀態檔的 `constitution_files`（`--reset` 先清除狀態檔，再寫入）；兩個都不存在時寫入空陣列。
  - 寫入狀態檔時保留 `issued`、`blocked`；`issued`、`blocked`、`constitution_files` 都為空時才刪除狀態檔。
- `report`：刪除 `--constitution-file`；「憲法遵循」第 1 項改用狀態檔的 `constitution_files`，以頓號分隔，空陣列或狀態檔沒有此欄位時為「沒有憲法檔」；其餘格式不變。
- 檔頭說明與 `--help` 依新介面更新。
- 驗證（施工者執行）：在 scratchpad 建立 `<root>/specs/001-online-pvp-1a2b/tasks.md` 複本與 `<root>/.agents/constitution/` 下兩個憲法檔（其中 `code.md` 超過 80 行亦可）：`status --reset` 的 `constitution.files` 有兩筆且 `content` 與檔案全文逐字相同、`missing` 為空；`report --must-pass yes` 第 1 項列出兩個相對路徑；刪除 `code.md` 後 `status --reset`，`missing` 列出 `code.md`、`report` 第 1 項只列 `shared.md`；刪除整個 `.agents/constitution/` 後 `status --reset`，`files` 為空、`report` 第 1 項為「沒有憲法檔」；`report --constitution-file x` 被拒（參數不存在）；`next`、`check`、`block` 行為不變。

## 7. 驗收情境

測試環境：每個情境一份暫存專案，`.claude/skills/` 只放修改後的 `implement`，`specs/` 為 `specs/001-online-pvp-1a2b/` 複本（HEAD 的 tasks.md），執行前 commit 基準狀態。以 Herdr 真實 session（`claude --model sonnet --effort medium`）執行（紀錄 38 子代理三次被模型安全機制中止）。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E3 | 本次（原始輸入） | repo 憲法加上測試用 `skills/implement/code.md`（Rule 1 必須：註解用英文；Rule 2 不得：使用 Prettier）。輸入「依 specs/001-online-pvp-1a2b/tasks.md 只完成 Phase 1 與 Phase 2」 | 無（提問即未通過） | `status` 工具輸出的 `constitution.files` 含兩個檔案，`code.md` 的 `content` 含「Rule 2 - 不得使用 Prettier」；T002、T003、T006 以 `block`（憲法衝突，`code.md` Rule 2）受阻、未打勾；`report` 工具輸出第 1 項列出兩個憲法檔、第 5 項為 T002、T003、T006；沒有 `prettier` 依賴與 `.prettierrc`；`tasks.md` 只變更核取方塊 |
| S2 | E2、E3、E4 | 回歸 | 刪除 `.agents/constitution/`。輸入「依 specs/001-online-pvp-1a2b/tasks.md 只完成 Phase 1」 | 無 | `status` 的 `constitution.files` 為空、`missing` 兩筆；7 個任務以 `check` 打勾、沒有 `block`；`report` 第 1 項為「沒有憲法檔」、第 3～5 項「無」；`tasks.md` 只變更 7 行核取方塊 |

- 呼叫者回歸：沒有其他 Skill 委派 `implement`。

## 8. 驗收結果

### 施工後結構診斷

- `audit_skill.py`：errors 0、warnings 0；`sync-skills.sh --from agents` 後 `--check` 為「兩邊一致」；沒有只存在於目標端、未被刪除的 Skill。
- 施工註記（W2）：專案根目錄以 `tasks_md.resolve().parents[2]` 取得；主 session 另抽查 `block` 後 `check` 另一任務時，狀態檔仍保留 `blocked` 與 `constitution_files`，`report` 第 1 項列出兩個憲法檔。

### 驗收方式

- S1、S2：Herdr 真實 session（`claude --model sonnet --effort medium`，Sonnet 5.5，auto mode），暫存專案 scratchpad `accept39/S1`、`accept39/S2`；信任資料夾由主 session 代為選擇。S1 第一次送出需求時 Herdr 回報 `agent_prompt_stalled`，畫面為空輸入框，確認未送達後重送。
- 判斷依據：對話紀錄中 `status`、`block`、`report` 的工具輸出，另以 `git diff` 與檔案檢查核對。

### 各情境結果

| 情境 | 結果 | 證據 |
| ---- | ---- | ---- |
| S1 | 通過（E1、E2；E3 有一處既有規則偏差，見觀察） | `016284f4-….jsonl`：自動觸發；`status` 輸出 `constitution.files` 兩筆，`code.md` 含「Rule 2 - 不得使用 Prettier」，沒有直接讀取憲法檔的命令；T002、T003、T006 以 `block`（憲法衝突，`code.md` Rule 2）受阻，另 13 個連帶受阻，T001、T005、T017、T018 打勾；沒有 `prettier` 依賴與 `.prettierrc`；`report` 第 1 項列出兩個憲法檔、第 2 項「未全部通過：…已記為受阻」、第 5 項 T002、T003、T006；沒有提問；`tasks.md` 只變更 4 行核取方塊 |
| S2 | 通過（回歸） | `status` 輸出 `files` 為空、`missing` 兩筆；7 個任務以 `check` 打勾、沒有 `block`；`report` 第 1 項「沒有憲法檔」、第 3～5 項「無」；`tasks.md` 只變更 7 行核取方塊 |

### 觀察（使用者 2026-11-08 決定接受，記入 `docs/待確認.md` 第 29 項）

- S1 最後以單一 shell 命令串接 `check T018`、`next`、`block T019`、`next`、`block T020`，並以 `sed -n 2p | cut -c1-30` 截短輸出，違反 `rules/任務實作-格式規範.md` Rule 1（不得在同一個命令中處理兩個以上任務的打勾）；腳本只能逐一驗證每個子命令，無法辨識同一 shell 命令中的串接。紀錄 37、38 的實跑沒有出現。
- S1 第 2 項由 AI 傳入 `--must-pass no`，與受阻處理一致。

### 收尾

- 個案驗收條件：無。
- 結論：所有驗收情境均已通過；`description` 保留「（未驗證）」，交回 `user-verify-skill` 以相同需求與測試素材重跑使用者實際驗證。
