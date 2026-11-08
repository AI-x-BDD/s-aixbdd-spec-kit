# 工程藍圖：implement－受阻回報格式不穩定

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/38-implement-受阻回報格式不穩定/`
- 根因報告：`rca-report.md`（R1 載體過弱；使用者 2026-11-08 回覆「照建議」確認，含推定 E5。R2 載體過弱：Phase 5 驗收 S2 未通過後補充分析，使用者 2026-11-08 回覆「照建議」確認）
- 確認紀錄：第 1 版（W1、W2）使用者於 Phase 4 回覆「確認」（2026-11-08），確認藍圖全部內容（含推定 E5）。第 2 版（加入 R2 的 W3、W4）使用者於 Phase 4 回覆「確認」（2026-11-08）。

## 1. 驗收條件

同 `rca-report.md` 第 2 節 E1–E5，全部為通用；E5 為推定，使用者已於 2026-11-08 確認。

## 2. To-Be SOP

只列變更的步驟與完成條件；其餘維持 `.agents/skills/implement/SKILL.md` 現行原文。

````markdown
## Phase 1 -- 確定執行範圍

4. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py status <tasks.md 絕對路徑> --reset [--scope <執行範圍>]`，取得「任務狀態」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。

## Phase 2 -- 逐一執行任務

2. `READ` 依「實作檢查清單」，讀取「任務狀態」的 `context`（tasks.md 的 Tests 政策、Reference Loading Contract、Path Conventions、Dependencies & Execution Order 與 Notes），建立「執行脈絡」，並建立空的「決策紀錄」。
4. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py next <tasks.md 絕對路徑> [--scope <執行範圍>]`，取得「目前任務」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
11. `CHECK` 依「驗證檢查清單」與「憲法檢查清單」驗證本任務，取得「驗證結果」（「憲法檢查清單」和實作規則衝突時以「憲法檢查清單」為準，規則會改變鎖定項目時不套用並記入「未套用規則」，偏離「應」規則時把規則與理由記入「憲法偏離」）；未通過時修正後重新驗證，最多 3 輪；第 3 輪仍未通過，或任務要求和「憲法檢查清單」的必須／不得規則無法同時滿足時，依「決策檢查清單」處理，不向使用者提問。
12. `DELEGATE` 在本 Skill 目錄執行 `tasks_state.py`，取得「回寫結果」：驗證通過時執行 `uv run --script scripts/tasks_state.py check <tasks.md 絕對路徑> <任務 ID> --read "<本任務讀取的 Must Read 與 Optional 部位>" --verify "<驗證命令與結果>" [--scope <執行範圍>]`，把本任務標為 `[X]`；依「決策檢查清單」判定受阻時執行 `uv run --script scripts/tasks_state.py block <tasks.md 絕對路徑> <任務 ID> --cause <env|constitution|dependency> --detail "<受阻原因>" [--rule "<憲法檔路徑> Rule <編號>"] [--depends <所依賴的受阻任務 ID>...] [--scope <執行範圍>]`；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止；退出狀態不為零時，依標準錯誤輸出回到步驟 4 取得腳本指定的目前任務，不得以其他方式修改 tasks.md 的核取方塊。
13. `WRITE` 回報本任務進度：原文輸出「回寫結果」的 `progress`，再補充 Optional 的觸發情況與本任務的決策；決策同時依「決策檢查清單」加入「決策紀錄」。

完成條件：範圍內每個任務都已以 `check` 標為 `[X]` 或以 `block` 記為受阻，每個完成的 Phase 都已執行 Checkpoint 驗證，且期間沒有結束回合或等待使用者回覆。

## Phase 3 -- 完成報告

1. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py report <tasks.md 絕對路徑> [--scope <執行範圍>] [--constitution-file <已讀取的憲法檔路徑>...] --must-pass <yes|no> [--must-detail "<未通過的規則與原因>"] [--deviation "<偏離的應規則與理由>"...] [--unapplied "<未套用的規則與衝突的鎖定項目>"...]`，取得「完成報告摘要」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止；並在專案根目錄執行 `git status --short`，取得「檔案變更」。
2. `WRITE` 向使用者回報完成報告：原文輸出「完成報告摘要」的 `report`，再依序補上各 Phase Checkpoint 驗證結果、「決策紀錄」、「檔案變更」中新增與修改的檔案，以及本機啟動與操作方式，沒有內容的項目寫「無」。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| `[--skip <受阻任務 ID>...]` | P2-4（`next`）、P2-12（`check`） | R1：受阻清單改由腳本狀態保存（C9、C17），AI 不再手動累加 |
| 「建立空的『受阻任務』」 | P2-2 | R1：「受阻任務」改由腳本保存，Phase 3 從 `status` 的 `blocked` 讀取 |
| 「任務記入『受阻任務』時略過步驟 12」 | P2-11 | R1：受阻改由步驟 12 的 `block` 分支處理 |
| 「（受阻時改為輸出『<任務 ID> 受阻，繼續下一個任務』與受阻原因）」 | P2-13 | R1：進度行改由 `block` 的 `progress` 輸出（C17），步驟只原文輸出 |
| P3-2 中「範圍內完成數與總數」「`blocked`」「憲法遵循（依序寫出…）」的格式文字 | P3-2 | R2：改由 `report` 輸出固定格式（C20），步驟只原文輸出；同時刪除 W1 寫入的 C19 |
| `status` 輸出的 `blocked` 欄位 | `scripts/tasks_state.py` `status` | R2：Phase 3 改用 `report`，沒有步驟再使用 `status` 的 `blocked`，無法追溯 |
| `scripts/tasks_state.py` 的 `--skip` 參數 | `next`、`check` | 同上 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| P1-4 | 修改 | `status` 加 `--reset` | E5；C18 |
| P2-12 | 修改 | 驗證通過執行 `check`、判定受阻執行 `block`，結果改名「回寫結果」 | R1；E1、E4；C9、C17 |
| P2-13、Phase 2 完成條件 | 修改 | 原文輸出「回寫結果」；完成條件改為 `check` 或 `block` | R1；E1 |
| P3-2 | 修改 | 受阻清單與「因憲法衝突而受阻的任務」改取「最終狀態」的 `blocked`；「憲法遵循」寫明「依序」；沒有內容的項目寫「無」 | R1；E2；C19 |
| P3-1、P3-2 | 修改 | P3-1 改執行 `report` 取得「完成報告摘要」；P3-2 原文輸出 `report`，再補 Checkpoint、決策紀錄、檔案變更與啟動方式（第 2 節） | R2；E2；C20 |
| `scripts/tasks_state.py` `report` | 新增 | 見 W4 | R2；E2；C20 |
| `scripts/tasks_state.py` | 修改 | 新增 `block` 子命令；狀態檔保存 `blocked`；`status` 新增 `--reset` 與 `blocked` 輸出；`next`／`check` 改以 `blocked` 排除；刪除 `--skip`（見 W2） | R1；E1、E3、E4、E5；C9、C17、C18 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter（含「（未驗證）」） | E4 | 同紀錄 29 |
| Phase 1 其餘步驟、Phase 2 步驟 1、3、5–10、14、各完成條件（除 Phase 2） | E4 | 同紀錄 28、29、32、37 |
| `自主決策` Rule 1–3（Rule 3 的憲法受阻理由要含憲法檔與 Rule） | E3、E4 | C14、C15、C16 |
| `任務實作`、`任務驗證`、`專案衛生` RuleFile | E4 | 同紀錄 27–29 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 21 | 21 | 0 |
| RuleFile | 4 | 4 | 0 |
| Rule | 10 | 10 | 0 |
| 樣板組 | 0 | 0 | 0 |
| 腳本 | 1 | 1 | 0（子命令 3 → 5） |

- 新增 `block` 子命令的理由：受阻進度行、原因欄位與受阻清單需要程式保證（R1）。刪除或改寫文字無法讓結果穩定（紀錄 28、29、38 的觀察）；既有 `check` 只負責打勾，把受阻併入 `check` 會讓「打勾」與「不打勾」混在同一命令，所以另設子命令。新增 `report` 子命令的理由（R2）：報告的固定結構只靠 P3-2 文字時，沒有受阻的 S2 合併與省略項目；`status` 是 Phase 1 的格式檢查與脈絡輸出，併入報告格式會讓同一命令承擔兩個目的，所以另設子命令，並刪除 `status` 不再使用的 `blocked` 輸出。同時刪除 `--skip`，AI 需要自行維護的參數變少。

## 5. 約束分配表

只列本次修改的約束；其餘沿用紀錄 27–29、32、37。

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C9 | 打勾只接受目前發出的任務；必填 `--read`、`--verify`；輸出 `progress`（含剩餘提醒）與 `remaining`；剩餘數排除 `blocked` | P2-12 | `scripts/tasks_state.py` `check` | 同紀錄 29；本次只把排除依據從 `--skip` 改為狀態檔的 `blocked` |
| C17 | 受阻只接受目前發出、未打勾的任務；`--cause` 為 `env`、`constitution`、`dependency`；`--detail` 必填，`constitution` 必填 `--rule`，`dependency` 必填 `--depends` 且只能是已受阻的任務；把任務加入 `blocked`、不改 tasks.md；`progress` 首行為「<ID> 受阻，繼續下一個任務」，接著原因行與剩餘提醒；`next` 不再發出 `blocked` 中的任務 | P2-12、P2-4 | `scripts/tasks_state.py` `block`、`next` | 輸入輸出明確、可重複執行、可由程式判斷（約束分配 Rule 2 順序 1），比文字要求更穩定（R1） |
| C18 | `status --reset` 清除狀態檔（發出中的任務與 `blocked`） | P1-4 | `scripts/tasks_state.py` `status` | 清除時機與輸出由程式保證；放在 Phase 1 唯一的 `status` 呼叫，確保每次執行重新開始（E5） |
| C20 | 完成報告摘要依固定順序輸出：範圍內完成數與總數、受阻任務（ID、原因類型與原因）、「憲法遵循」5 項（已讀取的憲法檔或「沒有憲法檔」；必須／不得是否全部通過，未通過時寫原因；憲法偏離；未套用規則；`blocked` 中原因為 `constitution` 的任務與 Rule）；空項寫「無」；`--must-pass no` 時 `--must-detail` 必填 | P3-1、P3-2 | `scripts/tasks_state.py` `report` | 輸入輸出明確、可由程式判斷（約束分配 Rule 2 順序 1）；報告是對話輸出不是檔案，不適用樣板組；取代紀錄 38 第 1 版的 C19（R2） |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-sop` | `SKILL.md`：Phase 1 `DELEGATE`「`tasks_state.py status`」、Phase 2 `READ`「建立『執行脈絡』」、`DELEGATE`「`tasks_state.py next`」、`CHECK`「依『驗證檢查清單』與『憲法檢查清單』驗證本任務」、`DELEGATE`「`tasks_state.py check`」、`WRITE`「回報本任務進度」、Phase 2 完成條件、Phase 3 `WRITE`「向使用者回報完成報告」 | 依第 2 節全文改寫，其餘步驟不變 | C9、C17、C18、C19 | 已完成 |
| 2 | W2 | `skill-form-script` | `scripts/tasks_state.py` | 見工作項內容 | C9、C17、C18 | 已完成 |
| 3 | W3 | `skill-form-sop` | `SKILL.md`：Phase 3 `DELEGATE`「`tasks_state.py status`…取得『最終狀態』」與 `WRITE`「向使用者回報完成報告」 | 依第 2 節 Phase 3 全文改寫 | C20 | 已完成 |
| 4 | W4 | `skill-form-script` | `scripts/tasks_state.py` | 見工作項內容 | C18、C20 | 已完成 |

### 工作項內容

#### W2：`tasks_state.py`

- 狀態檔（系統 temp 目錄，不在專案中）改為 `{"tasks_md", "issued", "blocked": [{"id", "cause", "detail", "rule", "depends"}]}`；寫入 `issued` 時保留 `blocked`；`issued` 與 `blocked` 都為空時才刪除檔案。
- `status`：新增 `--reset`，執行時先清除狀態檔；輸出新增 `blocked`（狀態檔中的清單，依 tasks.md 順序）。`scope` 中的 `remaining` 不變（只依核取方塊）。
- `next`：刪除 `--skip`；以狀態檔的 `blocked` 排除任務；輸出欄位 `skipped` 改為 `blocked`（範圍內受阻任務 ID）；`closes_phase` 以 `blocked` 判斷。
- `check`：刪除 `--skip`；剩餘數排除 `blocked`；其餘行為不變。
- 新增 `block <tasks.md> <任務 ID> --cause {env,constitution,dependency} --detail <文字> [--rule <文字>] [--depends ID ...] [--scope <範圍>]`：
  - 只接受目前發出、未打勾、未受阻的任務；其他任務以退出狀態 1 拒絕，訊息比照 `check`。
  - `--detail` 不得為空；`--cause constitution` 時 `--rule` 必填；`--cause dependency` 時 `--depends` 必填，且每個 ID 都必須已在 `blocked` 中；不符時退出狀態 2。
  - 把任務加入 `blocked`，清除 `issued`，不修改 tasks.md。
  - `progress` 第 1 行「<ID> 受阻，繼續下一個任務」；第 2 行依原因：`- 原因（憲法衝突）：<rule>；<detail>`、`- 原因（連帶受阻）：依賴 <depends 以頓號分隔>；<detail>`、`- 原因（環境限制）：<detail>`；第 3 行剩餘提醒，文字與 `check` 相同（剩餘數排除 `blocked`）。
  - 輸出 `{"progress", "remaining", "id", "blocked": <範圍內受阻數>}`。
- 檔頭說明與 `--help` 依新介面更新。
- 驗證（施工者執行）：以 `specs/001-online-pvp-1a2b/tasks.md` 複本，`status --reset --scope phase:1` → `next` 得 T001 → `check T001` → `next` 得 T002 → `block T002 --cause constitution --rule "x Rule 2" --detail "…"` 輸出 3 行 `progress` → `next` 得 T003 → `block T003 --cause dependency --depends T002 --detail "…"` 成功；`--depends T009` 被拒（不在 `blocked`）；`--cause constitution` 缺 `--rule` 被拒；`block T001`（已打勾）被拒；`status` 輸出 `blocked` 兩筆；`status --reset` 後 `blocked` 為空、`next` 重新發出 T002；tasks.md 只變更 T001 一行。

#### W4：`tasks_state.py` 的 `report` 與 `status`

- `status`：刪除輸出的 `blocked` 欄位；`--reset` 與其餘輸出不變。
- 新增 `report <tasks.md> [--scope <範圍>] [--constitution-file PATH ...] --must-pass {yes,no} [--must-detail <文字>] [--deviation <文字> ...] [--unapplied <文字> ...]`：
  - 讀取 tasks.md 核取方塊與狀態檔的 `blocked`，不修改任何檔案、不清除狀態檔。
  - `--must-pass no` 時 `--must-detail` 必填，否則退出狀態 2。
  - 輸出 `{"report": <文字>, "done", "total", "scope_done", "scope_total", "blocked": <範圍內受阻數>}`；`report` 固定為下列格式（`<…>` 為填入值）：

```text
完成數：範圍內 <scope_done>／<scope_total>（全部 <done>／<total>）
受阻任務：
- <ID>（<憲法衝突|連帶受阻|環境限制>）：<憲法衝突時為 rule；detail ／連帶受阻時為 依賴 <depends>；detail ／環境限制時為 detail>
憲法遵循：
1. 已讀取的憲法檔：<路徑以頓號分隔；沒有 --constitution-file 時為「沒有憲法檔」>
2. 必須／不得規則：<全部通過 ｜ 未全部通過：<must-detail>>
3. 憲法偏離：<無 ｜ 換行後每項一行「- <deviation>」>
4. 未套用規則：<無 ｜ 換行後每項一行「- <unapplied>」>
5. 因憲法衝突而受阻的任務：<無 ｜ 換行後每項一行「- <ID>：<rule>」>
```
  - 範圍內沒有受阻任務時，「受阻任務：無」寫在同一行。
- 檔頭說明與 `--help` 依新介面更新。
- 驗證（施工者執行）：以 `specs/001-online-pvp-1a2b/tasks.md` 複本，`status --reset --scope phase:1` → `next`／`check T001` → `next`／`block T002 --cause constitution --rule "x Rule 2" --detail d` → `next`／`block T003 --cause dependency --depends T002 --detail d2` → `report --scope phase:1 --constitution-file a.md --constitution-file b.md --must-pass yes` 的 `report` 列出 2 個受阻任務、第 5 項只列 T002；`report --must-pass no` 缺 `--must-detail` 被拒；`status --reset` 後 `report --scope phase:1 --must-pass yes` 的「受阻任務：無」、第 1 項「沒有憲法檔」、第 3～5 項「無」；`status` 輸出不含 `blocked`；tasks.md 只變更 T001 一行。

## 7. 驗收情境

測試環境：每個情境一份暫存專案，`.claude/skills/` 只放修改後的 `implement`，`specs/` 為 `specs/001-online-pvp-1a2b/` 複本（HEAD 的 tasks.md），`.agents/constitution/` 為 repo 憲法加上情境指定的測試用 `skills/implement/code.md`，執行前 commit 基準狀態。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E3、E4 | 本次（原始輸入） | `code.md`：Rule 1 必須「程式碼註解必須使用英文」、Rule 2 不得「不得使用 Prettier」。輸入「依 specs/001-online-pvp-1a2b/tasks.md 只完成 Phase 1 與 Phase 2」 | 無（提問即未通過） | 每個受阻任務在對話紀錄都有一次 `block` 呼叫，且其後的回報原文含 `block` 輸出的「<ID> 受阻，繼續下一個任務」與原因行；T002、T003、T006 的原因為憲法衝突並含 `code.md` 路徑與 Rule 2；連帶受阻含依賴 ID；決策紀錄的憲法受阻理由含憲法檔路徑與 Rule 編號；完成報告「憲法遵循」依序有 5 項，「因憲法衝突而受阻的任務」為 T002、T003、T006；沒有提問；`tasks.md` 只變更核取方塊，受阻任務未打勾 |
| S2 | E2、E4 | 回歸 | `code.md` 只有 Rule 1 必須「程式碼註解必須使用英文」。輸入「依 specs/001-online-pvp-1a2b/tasks.md 只完成 Phase 1」 | 無 | Phase 1 的 7 個任務都以 `check` 打勾，沒有 `block`；「憲法遵循」5 項俱在，「憲法偏離」「未套用規則」「因憲法衝突而受阻的任務」寫「無」；`tasks.md` 只變更 7 行核取方塊 |
| S3 | E1、E5 | 本次 | 同 S1 的 `code.md`。第 1 次輸入「依 specs/001-online-pvp-1a2b/tasks.md 只完成 T002」；執行者在兩次之間把 tasks.md 的 T002 中 `prettier` 相依刪除並 commit；第 2 次以新的子代理輸入同一句 | 無 | 第 1 次：T002 以 `block`（憲法衝突）受阻、未打勾；第 2 次：Phase 1 的 `status` 帶 `--reset`，`next` 重新發出 T002，T002 以 `check` 打勾 |

- 呼叫者回歸：沒有其他 Skill 委派 `implement`。
- 第 2 版（W3、W4）施工後重跑 S1、S2：判斷方式另加「對話紀錄有一次 `report` 呼叫，完成報告含其 `report` 原文」。S3 只驗證 Phase 1 的 `--reset` 與 `block`，不受 W3、W4 影響，沿用第 1 版結果。S1、S2 以 Herdr 真實 session 執行（子代理三次被模型安全機制中止，使用者選定改用 Herdr）。
- 判斷依據（2026-11-08 使用者確認）：E1、E2 以對話紀錄中 `block`、`report` 的工具輸出判斷；AI 在對話文字中的轉述不作為判斷依據。

## 8. 驗收結果

### 施工後結構診斷

- 第 1 版（W1、W2）與第 2 版（W3、W4）施工後，`audit_skill.py` 皆為 errors 0、warnings 0；`sync-skills.sh --from agents` 後 `--check` 為「兩邊一致」；沒有只存在於目標端、未被刪除的 Skill。
- 施工註記：W2 `block` 對已受阻任務以退出狀態 1 拒絕（「任務已受阻」），參數錯誤先於任務狀態檢查；W4 受阻行分隔符用全形「；」、依賴 ID 用「、」，與 `block` 一致。

### 驗收方式

- 第 1 版：S1、S3 為 `general-purpose` 子代理（Agent 工具指定 `model: sonnet`、`effort: medium`，Sonnet 5.5，低於主模型 Opus 5.5）；S2 子代理兩次被模型安全機制中止（`reasoning_extraction`），使用者選定改用 Herdr 真實 session（`claude --model sonnet --effort medium`，auto mode）。
- 第 2 版：S1 子代理再次被安全機制中止，使用者選定 S1、S2 都改用 Herdr 真實 session；信任資料夾由主 session 代為選擇（暫存專案由主 session 建立）。
- 判斷依據：E1、E2 以對話紀錄中 `block`、`report` 的工具輸出判斷（2026-11-08 使用者確認）；主 session 另以 `git diff`、註解檢查核對。

### 各情境結果

| 情境 | 版本 | 結果 | 證據 |
| ---- | ---- | ---- | ---- |
| S1 | 第 1 版 | 通過（E1、E3、E4）；E2 由 S2 發現未穩定 | 子代理：15 個受阻任務都有 `block` 進度行，T002、T003、T006 含 `code.md` Rule 2，連帶受阻含依賴 ID；`tasks.md` 只變更 5 行核取方塊 |
| S2 | 第 1 版 | 未通過（E2） | Herdr：7 個任務 `check` 打勾；「憲法遵循」只有 3 行，合併「憲法偏離」與「未套用規則」、省略「因憲法衝突而受阻的任務：無」→ 補充分析 R2，施工第 2 版 |
| S3 | 第 1 版 | 通過（E1、E5） | 子代理：第 1 次 T002 以 `block`（憲法衝突）受阻、未打勾；執行者刪除 T002 的 `prettier` 並 commit，確認狀態檔仍有 T002 受阻紀錄；第 2 次 `status --reset` 後 T002 重新發出並以 `check` 打勾，`tasks.md` 只變更 T002 一行。第 2 次子代理曾把一次 `next` 誤執行於主專案 tasks.md 路徑，只產生 temp 狀態檔、主專案檔案未變，已刪除；屬執行者偏差 |
| S1 | 第 2 版 | 通過 | Herdr（`ab627ad8-….jsonl`）：自動觸發 `Skill: implement`；`block` 15 次、`check` 5 次、`report` 1 次，沒有單一命令處理兩個任務；`report` 工具輸出列出 15 個受阻任務與原因、「憲法遵循」5 項、第 5 項為 T002、T003、T006；沒有提問；`tasks.md` 只變更 5 行核取方塊 |
| S2 | 第 2 版 | 通過（回歸） | Herdr（`2ca80a0d-….jsonl`）：自動觸發；`check` 8 次（7 個任務，含 1 次重試）、`block` 0 次、`report` 1 次；`report` 工具輸出為「受阻任務：無」、「憲法遵循」5 項、第 3～5 項「無」；`tasks.md` 只變更 7 行核取方塊；沒有中文註解 |

### 觀察（不影響判定）

- 真實 session 的對話文字不會原文貼出 `block`、`check`、`report` 的輸出，而是以短句轉述，最後的完成報告也由 AI 重寫（S1 第 2 版的完成報告沒有「憲法遵循」5 項）。腳本只能保證工具輸出；使用者閱讀的最終訊息格式仍依賴 AI。若要讓最終報告也固定，需要另外的需求（例如由腳本寫出報告檔），本次不處理。
- 依 E3 連帶受阻後，S1 只完成 5／20；修正來源在 `tasks`（`docs/待確認.md` 第 19 項）。

### 收尾

- 個案驗收條件：無。
- 結論：所有驗收情境均已通過（S2 第 1 版的未通過已由第 2 版修正並重跑通過）；`description` 保留「（未驗證）」，交回 `user-verify-skill` 以相同需求與測試素材重跑使用者實際驗證。
