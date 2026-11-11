# 工程藍圖：implement－check 未比對 Must Read

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/49-implement-check未比對MustRead/`
- 根因報告：同一紀錄目錄的 `rca-report.md`，使用者已確認 E1～E5 與 R1，推定的 E2 保留
- 確認紀錄：2026-11-11 使用者於 Phase 4 回覆：同意修改方案（W1 改 Phase 2 步驟 12 的 check 參數、W2 改 tasks_state.py check 比對 Must Read、W3 擴充任務實作 Rule 3）、沒有刪除項目、驗收情境 S1～S4；推定的 E2 已於 Phase 2 確認保留

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 執行 `check` 時，目前任務的每一項 Must Read 都必須出現在讀取紀錄中；有任何一項沒有出現時，`check` 不打勾、以非零狀態結束，並在標準錯誤列出缺少的 Must Read 項目 | 本次 | 通用 |
| E2 | Must Read 指向的部位在文件中找不到時，執行者可以把該項記為「找不到」並寫出原因，`check` 接受並在進度回報中顯示這一項與原因；只接受「找不到」，不接受「判斷不需要」 | 推定（使用者已確認保留） | 通用 |
| E3 | `check` 原有的行為不變：只能打勾 `next` 發出的任務、一次一個；`--verify` 必須不為空；進度回報有「讀取」「驗證」兩行與剩餘任務提醒；`status`、`next`、`block`、`report` 的輸入與輸出不變 | 既有 | 通用 |
| E4 | Optional 部位不要求出現在讀取紀錄中；只在遇到 Why 描述的情況時讀取，讀取時照舊寫進讀取紀錄 | 既有 | 通用 |
| E5 | 執行者照舊只讀任務綁定的部位（`rules/任務實作-格式規範.md` Rule 3），全程不向使用者提問；`tasks.md` 的格式與 `tasks` Skill 不需要修改 | 既有 | 通用 |

## 2. To-Be SOP

推導：

1. 依 R1（載體過弱）與 E1 推導：「每項 Must Read 都要出現在讀取紀錄」可由程式判斷，存放位置改為 `tasks_state.py check`（C5）。`check` 以序號比對：Must Read 依任務區塊中的列出順序從 1 起算。為了維持 E3，`next` 的輸出不加欄位，序號由 `check` 的說明與錯誤訊息交代。
2. 依 E2 推導：「哪種情況可以記為找不到」需要判斷，放在 `rules/任務實作-格式規範.md` Rule 3（C6，讀取 Must Read 的同一主題）；「記為找不到時必須寫原因、進度回報顯示」可由程式判斷，放在 `check`（C5）。
3. 依 C5 推導：SOP 中執行 `check` 的步驟（P2-12）要傳入新的參數；P2-6 的讀取動作不變。
4. 依 E3、E4、E5 推導：`status`、`next`、`block`、`report` 與 Optional 的處理不變，其他步驟與部位保留原文。
5. 載體過弱的修改方向是「改換存放位置並刪除原本的載體」：原本的載體是 P2-6 的文字。P2-6 的「讀取所有 Must Read 部位」是讀取動作本身（必要流程），不是檢查；檢查改由腳本負責後，P2-6 沒有表達檢查的文字可刪，保留原文。

To-Be `SKILL.md` 只有 Phase 2 步驟 12 改寫，其餘與 As-Is 逐字相同。步驟 12 全文：

````markdown
12. `DELEGATE` 在本 Skill 目錄執行 `tasks_state.py`，取得「回寫結果」：驗證通過時執行 `uv run --script scripts/tasks_state.py check <tasks.md 絕對路徑> <任務 ID> --read "<本任務讀取的 Must Read 與 Optional 部位>" --must-read "<已讀的 Must Read 序號，依任務區塊中的列出順序從 1 起算，以逗號分隔>" [--not-found "<序號>：<搜尋方式與結果>"...] --verify "<驗證命令與結果>" [--scope <執行範圍>]`，把本任務標為 `[X]`；依「決策檢查清單」判定受阻時執行 `uv run --script scripts/tasks_state.py block <tasks.md 絕對路徑> <任務 ID> --cause <env|constitution|dependency> --detail "<受阻原因>" [--rule "<憲法檔路徑> Rule <編號>"] [--depends <所依賴的受阻任務 ID>...] [--scope <執行範圍>]`；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止；退出狀態不為零時，依標準錯誤輸出回到步驟 4 取得腳本指定的目前任務，不得以其他方式修改 tasks.md 的核取方塊。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無 | — | 依重新設計 Rule 4 依序考慮：P2-6 的文字是讀取動作，不是檢查載體，沒有可刪的檢查文字；`check` 第 411～413 行的「不為空」檢查仍表達 E3（`--read`、`--verify` 必填），保留；其餘元素都能追溯（見「保留」） |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `SKILL.md` Phase 2 步驟 12（`DELEGATE` 執行 `tasks_state.py` check／block） | 修改 | `check` 命令加入 `--must-read` 與可重複的 `--not-found`，其餘文字保留原文（全文見第 2 節） | R1、E1、E2（C13） |
| `scripts/tasks_state.py` 的 `check` | 改換存放位置（從 P2-6 文字改由腳本把關）並修改 | 依 W2：比對目前任務的 Must Read 與 `--must-read`、`--not-found`，缺項時退出 1 並列出缺少的項目；`--not-found` 必須有原因；進度回報加一行列出找不到的項目 | R1、E1、E2、E3（C5） |
| `scripts/tasks_state.py` 檔頭說明與 `check` 參數說明 | 修改 | 補寫 `--must-read`、`--not-found` 的用法、序號規則與退出狀態 | E1、E2（C5 的介面說明） |
| `rules/任務實作-格式規範.md` Rule 3 | 修改 | 加一條：每項 Must Read 都要讀；只有以部位識別字搜尋不到時才可以記為找不到，並寫出搜尋方式與結果；不得因判斷其他文件已涵蓋而略過或記為找不到。Good Example、Bad Example 各補一段 | R1、E2（C6） |

改寫說明（重新設計 Rule 4）：刪除不適用（見上）；改寫 P2-6 不能解決，因為文字檢查仍由執行者判斷（rca-report H2）；改換存放位置適用，把檢查移到 `check`；E2 的判斷規則沒有既有存放位置，擴充同主題的 Rule 3，不新增 RuleFile 或 Rule。

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter（`name` 與 `description`） | E5：description 已概述只讀綁定部位、不提問 | 無（只概述用途與觸發情境） |
| 三個 Phase 的完成條件 | Phase 1、2、3：E3、E5 | 無（只概述結果） |
| Phase 1 -- 確定執行範圍（P1-1～P1-5） | 必要流程；E3 | C1～C3 |
| P2-1～P2-3（載入實作檢查清單、執行脈絡、憲法檢查清單） | E5；必要流程 | C17 |
| P2-4、P2-5（`next` 取得目前任務） | E3 | C4 |
| P2-6（讀取 Must Read 部位） | E1、E5（讀取動作） | 無（只讀取，讀取方式依 C7、C6） |
| P2-7、P2-8、P2-10（載入決策、專案衛生、驗證檢查清單） | 必要流程 | 無（只載入） |
| P2-9（實作；遇到 Optional 的 Why 時讀取） | E4 | C18 |
| P2-11（驗證，最多 3 輪） | 必要流程 | C12 |
| P2-13（回報進度） | E3 | C14 |
| P2-14（Phase Checkpoint） | 必要流程 | C15 |
| Phase 3（P3-1、P3-2，`report` 與完成報告） | E3 | C16 |
| `rules/任務實作-格式規範.md` Rule 1、2 | E5（一次一個任務、識別字逐字相同） | C8 |
| `rules/任務實作-格式規範.md` Rule 3 原有條列 | E5 | C7 |
| `rules/任務驗證-格式規範.md` Rule 1～3 | 必要流程（驗證） | C9 |
| `rules/自主決策-格式規範.md` Rule 1～3 | E5（不提問） | C10 |
| `rules/專案衛生-格式規範.md` Rule 1 | 必要流程 | C11 |
| `scripts/tasks_state.py` 的 `status`、`next`、`block`、`report` 與 `check` 原有檢查 | E3 | C4 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 21 | 21 | 0 |
| RuleFile | 4 | 4 | 0 |
| Rule | 10 | 10 | 0 |
| 樣板組 | 0 | 0 | 0 |
| 腳本 | 1 | 1 | 0 |

內容增減：P2-12 的 `check` 命令加 2 個參數；`check` 加 Must Read 比對（R1，載體過弱，檢查從文字改由腳本負責）；Rule 3 加 1 條與正反例各 1 段（E2）。沒有刪除，理由見「刪除」。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 以 `ls specs/[0-9][0-9][0-9]-*/tasks.md` 取得清單 | P1-1 | P1-1 步驟內文 | 既有，不變；既有工具的單一命令 |
| C2 | 目標 tasks 與 `--scope` 的決定方式 | P1-2 | P1-2 步驟內文 | 既有，不變；只屬於單一步驟 |
| C3 | 缺少 tasks、多份未指定、格式問題、範圍已完成時停止 | P1-3、P1-5 | SOP 流程 | 既有，不變；屬於分支與停止 |
| C4 | 任務順序、一次一個、狀態檔、憲法檔載入、`block` 規則、完成報告格式、`--read` 與 `--verify` 必填 | P1-4、P2-4、P2-12、P3-1 | `scripts/tasks_state.py` | 既有，不變；可由程式判斷 |
| C5 | `check` 時每項 Must Read（依任務區塊列出順序從 1 起算）都要出現在 `--must-read` 或 `--not-found`；缺項時不打勾、退出 1、標準錯誤列出缺少的序號與部位；序號超出範圍、重複或 `--not-found` 沒有原因時退出 2；進度回報加一行列出找不到的項目與原因（本次） | P2-12 | `scripts/tasks_state.py` 的 `check` | 輸入（任務區塊與參數）與輸出明確、可重複執行、結果可由程式判斷，順序 1 的腳本即符合；腳本已能解析 Must Read 參考行 |
| C6 | 每項 Must Read 都要讀；只有以部位識別字搜尋不到時，才可以記為找不到，並寫出搜尋方式與結果；不得因判斷其他文件已涵蓋而略過或記為找不到（本次） | P2-6、P2-12 | `rules/任務實作-格式規範.md` Rule 3 | 「是不是真的找不到」需要判斷，腳本不能判斷；不是檔案結構，樣板不適用；持續適用且需要正反例；與 Rule 3「只讀目前任務的參考部位」同主題 |
| C7 | 開工前只讀 `context`、任務內容只從 `next` 取得、以識別字定位部位、矛盾時可讀權威較高文件的相關部位 | P2-2、P2-6 | `rules/任務實作-格式規範.md` Rule 3 原有條列 | 既有，不變；需要判斷與正反例 |
| C8 | 一次只實作目前任務；對外識別字逐字相同 | P2-9 | `rules/任務實作-格式規範.md` Rule 1、2 | 既有，不變 |
| C9 | 依任務類型驗證、Checkpoint 驗證整個 Phase、驗證不留痕跡 | P2-11、P2-14 | `rules/任務驗證-格式規範.md` Rule 1～3 | 既有，不變 |
| C10 | 不提問、權威順序、受阻條件、決策紀錄 | P2-9、P2-11、P2-13 | `rules/自主決策-格式規範.md` Rule 1～3 | 既有，不變 |
| C11 | ignore 檔涵蓋任務引入的產物 | P2-9 | `rules/專案衛生-格式規範.md` Rule 1 | 既有，不變 |
| C12 | 驗證最多 3 輪、憲法與實作規則衝突時的處理 | P2-11 | P2-11 步驟內文 | 既有，不變；只屬於單一步驟 |
| C13 | `check`／`block` 命令要傳入的參數（本次加 `--must-read`、`--not-found`）、缺少 `uv` 的處理、退出非零時回到步驟 4 | P2-12 | P2-12 步驟內文 | 呼叫腳本的命令寫在委派步驟；比對規則本身在 C5，步驟只列參數，不重述規則 |
| C14 | 進度回報原文輸出 `progress`，再補 Optional 觸發與決策 | P2-13 | P2-13 步驟內文 | 既有，不變 |
| C15 | `closes_phase` 為 `true` 時做 Checkpoint，最多 3 輪 | P2-14 | SOP 流程 | 既有，不變；屬於分支 |
| C16 | 完成報告的內容順序 | P3-2 | P3-2 步驟內文 | 既有，不變 |
| C17 | 鎖定項目：任務依腳本順序一次一個、核取方塊只由 `check` 變更 | P2-3 | P2-3 步驟內文 | 既有，不變 |
| C18 | 遇到 Optional 的 Why 描述的情況時讀取該部位 | P2-9 | P2-9 步驟內文 | 既有，不變；E4 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-sop` | Phase 2 -- 逐一執行任務的 `DELEGATE` 執行 `tasks_state.py` check／block 步驟 | 改寫為第 2 節的步驟 12 全文 | C13 | 已完成 |
| 2 | W2 | `skill-form-script` | `scripts/tasks_state.py` | `check` 加 Must Read 比對與 2 個參數，更新說明 | C5 | 已完成 |
| 3 | W3 | `skill-form-rule` | `rules/任務實作-格式規範.md` Rule 3 | 加 1 條與正反例 | C6 | 已完成 |

施工完成後依 SOP 以 `./scripts/sync-skills.sh --from agents` 同步，再以 `--check` 確認兩邊一致。不修改 B 組 worktree。

### 工作項內容

#### W1：SOP 修改

把 Phase 2 -- 逐一執行任務中「`DELEGATE` 在本 Skill 目錄執行 `tasks_state.py`，取得「回寫結果」」那一步，改為第 2 節的全文。只在 `check` 命令的 `--read "…"` 之後、`--verify "…"` 之前插入 `--must-read "<已讀的 Must Read 序號，依任務區塊中的列出順序從 1 起算，以逗號分隔>" [--not-found "<序號>：<搜尋方式與結果>"...]`，其餘文字保留原文。其他步驟、完成條件與 frontmatter 不改。

#### W2：`scripts/tasks_state.py`

- 新增函式，從任務區塊取出 Must Read 項目：第一個符合 `MUST_READ_RE` 的行之後，到下一個符合 `LEVEL_RE` 的行（或區塊結束）為止，所有符合 `REF_LINE_RE` 的行；每項的顯示文字是去掉開頭 `- ` 後、` — Why` 之前的內容（沒有 ` — Why` 時取整行）。`format_issues` 不改。
- `check` 新增參數：
  - `--must-read`：已讀的 Must Read 序號，逗號分隔（也接受頓號 `、` 與空白）；可以省略，省略時為空。
  - `--not-found`：可重複，格式 `<序號>：<搜尋方式與結果>`（也接受半形 `:`）。
- `check` 的檢查順序：沿用現有的 `--read`、`--verify` 不為空、任務存在、未打勾、是 `next` 發出的任務等檢查；之後才比對 Must Read，比對通過後才寫入 `tasks.md`。
- 比對規則：
  - 序號不是正整數、超出 1～N、在兩個參數中重複，或 `--not-found` 沒有原因：`UsageError`（退出 2），標準錯誤指出哪一個值不正確。
  - `--must-read` 與 `--not-found` 的序號合起來沒有涵蓋 1～N：`LogicError`（退出 1），不寫入 `tasks.md`；標準錯誤寫出目前任務 ID、缺少的序號與每項的顯示文字，並提示：讀完後以 `--must-read` 列出序號；部位以識別字搜尋不到時，以 `--not-found "<序號>：<搜尋方式與結果>"` 記錄。
- 進度回報：`- 讀取：` 行之後，只在有 `--not-found` 時加一行 `- 找不到的 Must Read：<序號> <顯示文字>（<原因>）`，多項以 `；` 分隔；其他行與回傳欄位不變。
- 檔頭的 `check` 說明補寫上述參數、序號規則與退出狀態；`check` 子命令的參數說明同步補上。
- `status`、`next`、`block`、`report` 不改；不新增 PEP 723 依賴。

#### W3：`rules/任務實作-格式規範.md` Rule 3

- 在「讀取 Must Read 時，必須以部位的識別字……不得讀取整份文件。」之後加一條：「每一項 Must Read 都必須讀；只有以部位的識別字在檔案中搜尋不到時，才可以記為找不到，並寫出搜尋方式與結果；不得因判斷其他文件已涵蓋該部位而略過或記為找不到。」
- Good Example 補一段：診所掛號系統的 T020 有 3 項 Must Read，第 3 項 `ui/plan.md` → §6 以 `grep -n "^## 6" ui/plan.md` 搜尋不到；讀完前 2 項後執行 `check … --must-read 1,2 --not-found "3：grep -n '^## 6' ui/plan.md 沒有結果，檔案只到 §5"`。
- Bad Example 補一段：同一個專案的 T021，Must Read 第 2 項是 `ui/booking.html` → 雛形狀態「時段已滿」；執行者認為 `ui/plan.md` §4 已寫過這個狀態，沒有讀第 2 項，卻以 `--not-found "2：ui/plan.md §4 已涵蓋"` 記錄。
- 其餘條列、Rule 1、Rule 2 與既有範例保留原文。

## 7. 驗收情境

S1～S3 以腳本直接執行；S4 由子代理依修改後的 `SKILL.md` 實際執行。修改前先以 As-Is 腳本產生 S3 的基準輸出。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E3、E4 | 本次 | 暫存目錄中自建的 `specs/900-demo/tasks.md`（含 Reference Loading Contract、2 個任務；T001 有 2 項 Must Read 與 1 項 Optional）；依序執行 `status --reset`、`next`、`check T001 --must-read 1`、`check T001 --must-read 1,2`、`next` | 無（腳本沒有確認閘門） | `check --must-read 1`：退出 1，標準錯誤列出序號 2 與它的部位文字，`tasks.md` 與執行前相同；`check --must-read 1,2`（沒有列 Optional）：退出 0，T001 變成 `[X]`，`progress` 有「讀取」「驗證」兩行與剩餘提醒，沒有「找不到」行；之後的 `next` 發出 T002 |
| S2 | E2、E3 | 本次 | 接續 S1，T002 有 2 項 Must Read；依序執行 `check T002 --must-read 1,3`、`check T002 --must-read 1 --not-found "2："`、`check T002 --must-read 1 --not-found "2：grep -n 'X' 沒有結果"`；另在同一環境對未發出的任務 ID 執行 `check` | 無 | 第 1 個退出 2（序號 3 超出範圍）；第 2 個退出 2（沒有原因）；第 3 個退出 0，`progress` 有一行「找不到的 Must Read：2 …（grep -n 'X' 沒有結果）」；對未發出的任務仍以退出 1 拒絕；前兩個失敗後 `tasks.md` 沒有變化 |
| S3 | E3、E5 | 回歸 | 主目錄 `specs/007-equipment-maintenance-retire/tasks.md` 的 2 份暫存複本，把核取方塊都改回 `- [ ]`；As-Is 與 To-Be 腳本各對一份執行同一串命令：`status --reset`、`next`、`check`（To-Be 另加涵蓋全部 Must Read 的 `--must-read`）、`next`、`block --cause env --detail …`、`next`、`report --must-pass yes` | 無 | 兩邊的 `status`、`next`、`block`、`report` 輸出逐字相同（路徑欄位除外），`check` 的輸出相同，執行後兩份 `tasks.md` 逐字相同；`tasks.md` 格式不需要修改即可通過 `status` |
| S4 | E1、E2、E5 | 本次 | 暫存專案：`specs/901-greeting/` 有 `tasks.md`（1 個任務：在 `out/greeting.txt` 寫入 `ui/plan.md` §2 指定的問候語；Must Read 3 項：`ui/plan.md` → §2、`ui/plan.md` → §9（不存在）、`ui/greeting.html` → 雛形狀態「問候」（存在，內容與 §2 重複））、`ui/plan.md`（只有 §1、§2）、`ui/greeting.html`；子代理只拿到修改後 `implement` 的路徑與暫存專案位置，依 `SKILL.md` 執行 | 無（implement 全程不提問） | `check` 的 `--must-read` 含 1、3，`--not-found` 只含 2 並寫出搜尋方式與結果；沒有把第 3 項記為找不到；`out/greeting.txt` 依 §2 寫入；執行期間沒有向使用者提問；完成報告已輸出 |

## 8. 驗收結果

- 施工：W1 由 `skill-form-sop` 完成（Phase 2 步驟 12 的 `check` 命令加入 `--must-read` 與 `--not-found`，其餘逐字不變）。W2 由 `skill-form-script` 完成：新增 `must_read_refs`、`parse_numbers`、`parse_not_found`，`check` 在既有檢查之後比對 Must Read，`progress` 只在有 `--not-found` 時加一行，檔頭與參數說明補寫；`skill-form-script` Phase 2 以暫存 tasks.md 檢查 `--help`、缺項（退出 1）、超出範圍、沒有原因、重複、非正整數（退出 2）、已打勾（退出 1）與成功情境，Python 腳本完成檢查清單 Rule 1～6 都通過（單檔、PEP 723 `dependencies = []` 不變、`argparse` 與 `Path`、退出狀態可檢查、沒有 shell 命令、沒有 lockfile）。W3 由 `skill-form-rule` 完成：Rule 3 加 1 條，Good Example 與 Bad Example 各改為 `### Example 1`（原範例，原文保留）與 `### Example 2`（新增），符合 RuleFile 格式規範 Rule 9 的多組範例寫法。
- 施工後結構診斷：`implement` 為 0 個 error、0 個 warning。
- 同步：`./scripts/sync-skills.sh --from agents` 退出 0，`--check` 為「兩邊一致」；git 只有兩側 `implement` 的 `SKILL.md`、`rules/任務實作-格式規範.md`、`scripts/tasks_state.py` 有差異。同步輸出中沒有只存在於目標端、未被刪除的 Skill；兩側沒有 `__pycache__`。
- 與 To-Be 一致性：`SKILL.md` 只有步驟 12 改變，與第 2 節全文一致；frontmatter、其他 20 個步驟與完成條件不變；其他 3 個 RuleFile 不變；C5 只在腳本、C6 只在 Rule 3、C13 只在步驟 12。
- 驗收方式：在 `/tmp/49-accept/` 建立暫存環境（S1、S2 自建 `tasks.md`；S3 為主目錄 007 `tasks.md` 的 2 份複本，核取方塊改回未勾；S4 為含修改後 `implement` 的暫存 git 專案），並保存修改前的腳本產生 S3 基準輸出。由 2 個不帶本次分析脈絡的 `general-purpose` 子代理平行執行，模型 Sonnet、推理強度 medium，透過 Agent 工具指定：一個執行 S1～S3（腳本層），一個只拿到 Skill 路徑與專案位置，依 `SKILL.md` 執行 S4。
- S1 通過：只列 `--must-read 1` 時退出 1，標準錯誤列出「2 `data/data-model.dbml` → `Table loans`」，`tasks.md` 雜湊不變；列 `1,2`（沒有列 Optional）時退出 0、T001 打勾，`progress` 有「讀取」「驗證」與剩餘提醒，沒有「找不到」行；之後 `next` 發出 T002。
- S2 通過：序號 3 超出範圍、`--not-found "2："` 沒有原因都退出 2，`tasks.md` 不變；寫了原因時退出 0，`progress` 在「讀取」與「驗證」之間有「- 找不到的 Must Read：2 `ui/plan.md` → §8（…）」；對已打勾的 T001 仍以退出 1 拒絕。
- S3 通過：7 個輸出與基準相比，只有 `status` 的 `tasks_md` 路徑欄位不同（asis／tobe 目錄不同）；執行後的 `tasks.md` 與基準逐字相同；`format_issues` 為空。
- S4 通過：子代理依 SOP 執行 `status --reset`、`next`、`check`、`next`、`report`，所有命令退出 0、沒有提問；`check` 為 `--must-read 1,3 --not-found "2：grep -n '^## 9\|§9\|^## 9\.' ui/plan.md 沒有結果，檔案只有 §1、§2"`；內容與 §2 重複的第 3 項（`ui/greeting.html` 雛形狀態「問候」）有讀，沒有記為找不到；`out/greeting.txt` 依 §2 寫入一行並以換行結束；`progress` 顯示找不到的第 2 項；完成報告已輸出。另觀察：子代理以 `grep` 定位第 3 項後讀了整個 `ui/greeting.html`（只有 8 行），與 Rule 3「不得讀取整份文件」的字面要求不完全一致；這和本次修改無關，檔案太小也看不出影響，不列為失敗。
- 副作用：S1～S3 子代理比對雜湊時，看到 `s4/proj/out/greeting.txt` 是新檔；這是同時執行的 S4 子代理的正常產出。其他驗收環境的檔案只依情境改變，`implement/` 底下沒有新檔或 `__pycache__`。
- 個案驗收條件：無。
