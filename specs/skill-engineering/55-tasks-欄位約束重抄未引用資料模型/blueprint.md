# 工程藍圖：tasks－欄位約束重抄未引用資料模型

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/55-tasks-欄位約束重抄未引用資料模型/`
- 根因報告：同一紀錄目錄的 `rca-report.md`。使用者已確認 E1～E13、S1～S4 與 R1，推定的 E2、E4、E6 保留（2026-11-19）
- 確認紀錄：使用者於 2026-11-19 Phase 4 回覆「確認藍圖，同意刪除，進入 Phase 5 施工」，同意 W1～W7、第 3 節的 2 項刪除與驗收情境 S1～S4

## 1. 驗收條件

「受約束欄位」：`data-model.dbml` 中欄位 `note` 以「驗證：」或「轉換：」開頭的欄位，以及資料表 `Note` 的「跨欄位：」括號內列出的每個 `table.column`。

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 每個受約束欄位，至少有一個實作它的任務在 Must Read 寫 `` `data/data-model.dbml` → `table.column` ``；`table` 是資料模型中的資料表，`column` 是該資料表的欄位 | 本次 | 通用 |
| E2 | 受約束欄位只包含「驗證」「轉換」「跨欄位」寫到的欄位；只有型別與設定的欄位，建立資料表的任務以 `Table <table>` 引用即可 | 推定（已確認） | 通用 |
| E3 | 任務描述不重述資料模型已有的約束（型別、長度、數值範圍、格式、預設值、可否為空、唯一、Enum 的值清單、狀態轉換）；可以寫出欄位名稱與任務要寫入或比對的值 | 本次 | 通用 |
| E4 | 任務比資料模型多加或收窄的限制，以「任務限定：」標出，且不和資料模型矛盾 | 推定（已確認） | 通用 |
| E5 | 寫出 `tasks.md` 前檢查 E1：找出沒有被引用的受約束欄位與找不到的 `table.column`；先修正再寫出，3 輪仍未通過時列為「未通過項」 | 本次 | 通用 |
| E6 | 資料模型沒有受約束欄位時，不要求逐欄引用，也不因此判定未通過；E3 仍適用 | 推定（已確認） | 通用 |
| E7 | Phase 依 Setup、Foundational、每個 User Story、Polish 排列；Phase 內依資料庫 → 後端 → 前端分組，組標題寫介面編號 | 既有 | 通用 |
| E8 | 每個任務至少一項 Must Read；部位的識別字在上游文件逐字存在；Why 寫出部位決定任務的哪一部分；Optional 的 Why 以「……時」寫出情況 | 既有 | 通用 |
| E9 | 上游缺少或矛盾的部位寫成 Notes 的「待確認 n」；不寫出上游沒有的 operationId、路徑、資料表、欄位或錯誤碼 | 既有 | 通用 |
| E10 | 測試任務依 spec 是否要求與既有測試的依賴而定，`**Tests**:` 行寫出依據 | 既有 | 通用 |
| E11 | `check_tasks.py` 沒有 `issues`；區塊順序與樣板一致；沒有殘留的 `{{`；`tasks_state.py status` 的 `format_issues` 為空 | 既有 | 通用 |
| E12 | 只寫入 `tasks.md`；已有 `tasks.md` 時先取得覆寫同意，不同意時不修改任何檔案 | 既有 | 通用 |
| E13 | 回報路徑、各 Phase 任務數、待確認、`warnings`、「未通過項」與「憲法遵循」 | 既有 | 通用 |

## 2. To-Be SOP

````markdown
---
name: tasks
description: 已有 spec.md、plan.md 及 system-analysis 委派產出的 API 合約、資料模型與 UI 規劃（有通知類介面時另含 notification-plan 產出的通知規劃 notification/plan.md），要拆成可執行的任務清單時使用：依 spec 的 User Story 與 plan.md 系統介面盤點，把工作排成 Setup、Foundational、每個 User Story 一個 Phase 與 Polish，Phase 內依資料庫、後端、前端分組並標出介面編號，每個任務列出執行時要讀的文件部位（Must Read／Optional，檔案 → 部位 — Why），資料模型的受約束欄位以 table.column 引用、不在任務描述重抄約束，寫成 spec 目錄的 tasks.md；上游缺少的介面部位寫成 Notes 的待確認，不自行虛構。使用者提到 tasks、tasks.md、任務清單、任務拆解、implementation tasks、Reference Loading Contract、欄位引用時使用。盤點介面與產出 plan.md 改用 system-analysis；只補單一種上游產出（UI 雛形、API 合約、資料模型）改用 ui-plan、api-plan 或 data-plan；通知類介面沒有規劃時改用 notification-plan；規劃類別、先畫類別圖再寫程式時改用 plan-with-class-diagram；依既有 tasks.md 實作任務時不使用此 Skill。
---

# SOP

## Phase 1 -- 收斂任務輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「任務輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `contracts/`、`data/`、`ui/`、`notification/` 下所有檔案的全文（不存在的略過），加入「任務輸入」。
5. `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/tasks/tasks.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：`## Phase N:` 標題與 Setup、Foundational、每個 User Story、Polish 的 Phase 順序，任務行 `- [ ] T001` 格式與連續 ID，`[USn]` 標籤，`**Must Read**`／`**Optional**` 參考行 `` `檔案` → 部位 — Why：理由 `` 格式，組標題括號中的介面編號，`待確認 n` 與 Notes 的對應，`**Tests**:` 行，以及 Reference Loading Contract、Path Conventions、Dependencies & Execution Order、Notes 段落。
6. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行。
7. `WRITE` 同目錄已有 `tasks.md` 時，詢問使用者是否覆寫；沒有時略過本步驟與下一步。
8. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時，回報沒有修改既有 `tasks.md`、沒有產出任何檔案，並停止執行。

完成條件：「目標 spec」、`plan.md` 與同目錄的上游文件已讀取，且沒有既有 `tasks.md` 或使用者已同意覆寫；或缺少輸入、使用者不同意覆寫，已停止執行並回報。

## Phase 2 -- 規劃任務

1. `READ` 規劃任務時，讀取 `rules/任務清單-格式規範.md` 的所有 Rule，建立「任務清單檢查清單」。
2. `THINK` 依「任務輸入」與已載入的「任務清單檢查清單」，為 `plan.md`「系統介面盤點」的每個介面找出 contracts、data、ui 中的 operation、資料表（含受約束欄位）或畫面，以及 `notification/plan.md` 中以介面編號開頭的章節，並記下上游缺口，建立「介面對照」。
3. `THINK` 依「任務輸入」、「介面對照」、「憲法檢查清單」與已載入的「任務清單檢查清單」，把工作排入各 Phase，逐一寫出任務描述與 Must Read／Optional 參考，建立「任務規劃」。
4. `READ` 「任務規劃」中有任務修改專案中已存在的程式檔時，依已載入的「任務清單檢查清單」，在專案既有的自動化測試中查找依賴這些任務所改變之行為的測試，讀取命中的段落，建立「既有測試依賴」；專案沒有既有的自動化測試，或沒有任務修改已存在的程式檔時，「既有測試依賴」為空。
5. `THINK` 依「既有測試依賴」與已載入的「任務清單檢查清單」，調整「任務規劃」中更新既有測試的任務、`**Tests**:` 說明與 Polish 的回歸驗證任務；「既有測試依賴」為空時略過本步驟。
6. `THINK` 比對「憲法檢查清單」的必須／不得規則與「任務輸入」，列出和 spec 或上游產出無法同時滿足的項目，建立「憲法衝突」。
7. `DELEGATE` 「憲法衝突」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以「憲法衝突」為優先提問面向、不要求詳記問答紀錄，取得使用者的決定，依決定調整「任務規劃」；「憲法衝突」為空時略過本步驟與下一步。
8. `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、沒有產出任何檔案，並停止執行；使用者未回覆時停止執行，回報沒有產出任何檔案。

完成條件：「介面對照」涵蓋盤點表的每個介面，「任務規劃」已涵蓋每個 User Story，並已依「既有測試依賴」排入更新既有測試的任務。

## Phase 3 -- 產出 tasks.md

1. `READ` `templates/tasks.md` 與 `templates/tasks.example.md`，載入骨架與範例，命名載入結果為「tasks 樣板組」。
2. `WRITE` 依「tasks 樣板組」與「任務規劃」，將 `tasks.md` 寫入「目標 spec」所在目錄，不建立或修改其他檔案：標題填 spec.md 的功能名稱與英文名稱，spec 目錄填目錄名稱；Reference Loading Contract 第 4 點只列出目標 spec 目錄中存在的文件；樣板的英文固定段落保留原文，其餘說明文字的語言依「憲法檢查清單」，沒有規定時使用繁體中文。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_tasks.py --spec-dir <目標 spec 目錄絕對路徑> <tasks.md 絕對路徑>`，取得「任務清單檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
4. `CHECK` 「任務清單檢查結果」沒有 `issues`，逐條驗證「憲法檢查清單」與「任務清單檢查清單」（衝突時以「憲法檢查清單」為準，規則會改變鎖定項目時不套用並記入「未套用規則」，偏離「應」規則時把規則與理由記入「憲法偏離」），比對 `tasks.md` 與「tasks 樣板組」的區塊順序與固定段落，確認步驟 2 的填寫要求均已滿足；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 3；未通過時修正 `tasks.md` 後返回步驟 3，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
5. `WRITE` 向使用者回報 `tasks.md` 路徑、各 Phase 的任務數、Notes 中的待確認項目、「任務清單檢查結果」的 `warnings`，以及「未通過項」（沒有時說明全部通過）與「憲法遵循」（已讀取的憲法檔路徑，都不存在時寫「沒有憲法檔」；必須／不得規則是否全部通過；「憲法偏離」；「未套用規則」；經 `clarify` 決定的「憲法衝突」）。

完成條件：`tasks.md` 已寫入，「任務清單檢查結果」、「任務清單檢查清單」與樣板結構已通過或未通過的項目已記為「未通過項」，且已回報。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| P2-3 的「Setup、Foundational、spec.md 每個 User Story 一個 Phase（依 spec 順序）與 Polish」 | Phase 2 -- 規劃任務的 `THINK` 規劃任務步驟 | 表達 C15（Phase 的種類、數量與順序），C15 的存放位置是 Rule 1，不是步驟內文（約束分配 Rule 1）。改為「各 Phase」，其餘文字保留 |
| P3-2 的「User Story Phase 數依 spec.md 調整，Polish 的 Phase 編號接在最後一個 User Story 之後；」 | Phase 3 -- 產出 tasks.md 的 `WRITE` 寫入步驟 | 和 Rule 1 第 6 條逐字相同，同一約束存放兩處；P3-4 已逐條驗證 Rule 1。其餘填寫要求保留 |

兩項都不在根因位置，依重新設計 Rule 2「依本 Rule 刪除無法追溯的元素時，不受根因位置限制」列入。

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter `description` | 修改 | 產出描述加入「資料模型的受約束欄位以 table.column 引用、不在任務描述重抄約束」；觸發關鍵字加入「欄位引用」 | E1、E3；概述產出，不表達判斷細節 |
| P2-2（`THINK` 建立介面對照） | 修改 | 「資料表」改為「資料表（含受約束欄位）」 | R1、E1；C7 |
| `rules/任務清單-格式規範.md` Rule 2 | 修改 | 新增 2 個條列：不重述資料模型的欄位約束；任務限定的寫法。既有範例加 `### Example 1`，新增 Example 2 | R1、E3、E4；C17、C18 |
| `rules/任務清單-格式規範.md` Rule 3 | 修改 | 新增 2 個條列：單一欄位寫成 `table.column`；受約束欄位的界定與引用位置。Good Example 的 `Table reservations` 的 `expires_at` 改為 `reservations.expires_at`；新增 Example 2 | R1、E1、E2、E6；C20、C21 |
| `templates/tasks.example.md` | 修改 | Contract 第 4 點的 `data/data-model.dbml` 加入 `table.column`；T008、T016、T026 刪掉重抄的欄位定義，改為引用；相關任務的 Must Read 改用 `table.column` 並補上受約束欄位；T028 的訂單編號產生方式改為「任務限定：」 | R1、E1、E3、E4；C24、C25 |
| `scripts/check_tasks.py` | 修改 | 新增 `table.column` 解析檢查與受約束欄位的涵蓋檢查，JSON 報告新增 `field_citations` | R1、E1、E5、E6；C26 |
| `tasks/LICENSE` | 修改 | 第 1 點之後加入第 2 點，註明 Spec Kit v1.4.2 欄位引用的衍生 | CLAUDE.md 規則 3；計畫第 6 節批 2 |

選新增條列而不是改寫的理由（重新設計 Rule 4）：
1. 刪除：沒有表達「引用欄位、不重抄」的既有內容可刪。範例 T008、T016、T026 示範重抄，已列為修改。
2. 改寫：Rule 2 第 2 條要求帶入識別字，內容正確，仍保留。只改寫它無法表達「不重述約束」與「任務限定」，所以另加條列。Rule 3 沒有欄位層級部位的描述可以改寫。
3. 改換存放位置：E1～E4 沒有既有存放位置。
4. 新增：條列加在既有的 Rule 2、Rule 3，不新增 Rule 或 RuleFile。不重述約束屬於「任務描述」（Rule 2）；引用寫法屬於「綁定部位」（Rule 3）。

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| `name` | 必要（Skill 識別） | 無 |
| 三個 Phase 與完成條件 | Phase 1：E12；Phase 2：E1～E10；Phase 3：E5、E11～E13 | 無（只概述結果） |
| P1-1～P1-8 | E9、E12、E13 | C1～C6 |
| P2-1（載入任務清單檢查清單） | E1～E10 | 無（只載入） |
| P2-3 其餘文字（逐一寫出任務描述與 Must Read／Optional） | E1、E3、E8 | C8 |
| P2-4、P2-5（既有測試依賴） | E10 | C9 |
| P2-6～P2-8（憲法衝突與 `clarify`） | E13 | C10 |
| P3-1（載入樣板組） | E11 | 無（只載入） |
| P3-2 其餘填寫要求 | E11、E12 | C11 |
| P3-3（執行 `check_tasks.py`） | E5、E11 | C12、C26 |
| P3-4（檢查與修正，最多 3 輪） | E5、E11、E13 | C13 |
| P3-5（回報） | E13 | C14 |
| Rule 1 | E7 | C15 |
| Rule 2 既有條列 | E8、E9 | C16 |
| Rule 3 既有條列 | E8 | C19 |
| Rule 4 | E9 | C22 |
| Rule 5 | E10 | C23 |
| `templates/tasks.md`（骨架） | E11 | C24 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 21 | 21 | 0 |
| RuleFile | 1 | 1 | 0 |
| Rule | 5 | 5 | 0 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 1 | 1 | 0 |

- 內容增減：Rule 2、Rule 3 各新增 2 個條列與 1 組正反範例；P2-2 加 4 個字；P2-3、P3-2 各刪除一段重複內容；範例刪除 3 段重抄的欄位定義，改成引用；腳本新增 2 項檢查。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 目標 spec 的決定方式 | P1-2 | P1-2 步驟內文 | 既有，不變；單一步驟一句話 |
| C2 | 沒有 spec 或有多份未指定時停止 | P1-3 | SOP 流程 | 既有，不變；分支 |
| C3 | 讀取的輸入清單 | P1-4 | P1-4 步驟內文 | 既有，不變；單一步驟一句話 |
| C4 | 憲法檔路徑與鎖定項目 | P1-5 | P1-5 步驟內文 | 既有，不變；單一步驟 |
| C5 | 沒有 `plan.md` 時停止 | P1-6 | SOP 流程 | 既有，不變；分支 |
| C6 | 既有 `tasks.md` 先問覆寫 | P1-7、P1-8 | SOP 流程 | 既有，不變；使用者確認 |
| C7 | 介面對照的內容：operation、資料表（含受約束欄位）、畫面、通知章節與上游缺口 | P2-2 | P2-2 步驟內文 | 修改；只屬於這一步，一句話可表達；受約束欄位的界定在 C21，這裡只列收集項目 |
| C8 | 依檢查清單排入各 Phase，寫出任務描述與參考 | P2-3 | P2-3 步驟內文 | 修改（刪除 C15 的重述）；單一步驟 |
| C9 | 查找既有測試依賴並調整任務 | P2-4、P2-5 | P2-4、P2-5 步驟內文 | 既有，不變；單一步驟 |
| C10 | 憲法衝突委派 `clarify`；找不到或未回覆時停止 | P2-6～P2-8 | SOP 流程 | 既有，不變；委派與分支 |
| C11 | 寫入路徑、標題、Contract 第 4 點只列存在的文件、英文固定段落、語言 | P3-2 | P3-2 步驟內文 | 修改（刪除 C15 的重述）；單一步驟 |
| C12 | 任務 ID、標籤、Must Read、參考檔案存在、部位識別字存在、組標題介面編號、FR／NFR 被引用、待確認對應 | P3-3 | `scripts/check_tasks.py` | 既有，不變；可由程式判斷 |
| C13 | 逐條驗證、憲法優先、最多 3 輪、未通過項 | P3-4 | P3-4 步驟內文 | 既有，不變；單一步驟 |
| C14 | 回報內容 | P3-5 | P3-5 步驟內文 | 既有，不變；單一步驟 |
| C15 | Phase 依 User Story 歸屬、依端點分組、組標題、Phase 數量與順序 | P2-3 | Rule 1 | 既有，不變；需要判斷與正反例 |
| C16 | 檔案路徑、帶入識別字、需求編號、`[P]`、`[USk]` | P2-3 | Rule 2 | 既有，不變；需要判斷與正反例 |
| C17 | 任務描述不重述資料模型已定義的欄位約束，改以引用；可以寫出欄位名稱與任務要寫入或比對的值 | P2-3 | Rule 2 | 哪些文字是約束、哪些是任務要寫入的值要判斷語意，腳本無法判斷；樣板以填位符號產生任務，無法逐任務保證；需要正反例 |
| C18 | 任務比資料模型多加或收窄的限制以「任務限定：」寫出並附依據，不得和資料模型矛盾；只說明實作方式不算 | P2-3 | Rule 2 | 是否矛盾、是否算新增要判斷；需要正反例 |
| C19 | Must Read／Optional 的分級、Why 的寫法、識別字逐字存在、合併同部位 | P2-3 | Rule 3 | 既有，不變；需要判斷與正反例 |
| C20 | 部位指向 `data/data-model.dbml` 的單一欄位時寫成 `table.column`；整張表、Enum、關聯分別寫 `Table`、`Enum`、`Ref` | P2-3 | Rule 3 | 寫法要在規劃時就遵守，腳本只能事後檢查；需要正反例說明和 `Table x` 的 `column` 的差別 |
| C21 | 受約束欄位的界定；每個受約束欄位由實作它的任務在 Must Read 引用，Why 寫出實作的約束，只在測試任務引用不算；只有型別與設定的欄位以 `Table` 引用；沒有受約束欄位時不要求逐欄引用 | P2-3 | Rule 3 | 哪個任務「實作」該欄位要判斷，腳本只能檢查有沒有引用；需要正反例 |
| C22 | 上游缺口寫成待確認，不自行補齊 | P2-3 | Rule 4 | 既有，不變 |
| C23 | 測試任務依 spec 要求與既有測試依賴 | P2-3～P2-5 | Rule 5 | 既有，不變 |
| C24 | `tasks.md` 的區塊結構與固定段落，含 Contract 第 4 點各文件的部位寫法 | P3-2 | tasks 樣板組 | 既有；Contract 第 4 點的 `data/data-model.dbml` 項目加入 `table.column`（整份產出的結構） |
| C25 | 範例示範 C15～C23 | P3-2 | tasks 樣板組的範例 | 範例不是存放位置，只示範，不得和 C15～C23 矛盾 |
| C26 | 指向 `.dbml` 的參考中，`table.column` 的資料表存在且欄位屬於該資料表；每個受約束欄位至少在一個任務的 Must Read 以 `table.column` 引用；報告列出受約束欄位與未引用的欄位 | P3-3 | `scripts/check_tasks.py` | 輸入輸出明確、可重複執行、結果可由程式判斷（順序 1）；界定與引用位置由 C20、C21 定義，腳本只檢查一致性 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `tasks/SKILL.md` frontmatter | `description` 加入欄位引用 | 無 | 已完成 |
| 2 | W2 | `skill-form-sop` | Phase 2 -- 規劃任務的 `THINK` 介面對照與 `THINK` 任務規劃；Phase 3 -- 產出 tasks.md 的 `WRITE` 寫入步驟 | 修改與刪除重複內容 | C7、C8、C11 | 已完成 |
| 3 | W3 | `skill-form-rule` | `rules/任務清單-格式規範.md` Rule 2 | 新增 2 個條列與 Example 2 | C17、C18 | 已完成 |
| 4 | W4 | `skill-form-rule` | `rules/任務清單-格式規範.md` Rule 3 | 新增 2 個條列、改 Good Example、新增 Example 2 | C20、C21 | 已完成 |
| 5 | W5 | `skill-form-template` | `templates/tasks.example.md` | 改用引用 | C24、C25 | 已完成 |
| 6 | W6 | `skill-form-script` | `scripts/check_tasks.py` | 新增欄位引用檢查 | C26 | 已完成 |
| 7 | W7 | `skill-engineering` 直接修改 | `tasks/LICENSE` | 註明 v1.4.2 衍生 | 無 | 已完成 |

沒有新增部位，也沒有改變載入步驟：P2-1 整份載入 RuleFile；P3-1 載入樣板組；P3-3 的腳本命令不變。因此 W3～W6 交給 `skill-form-*`。根目錄 `LICENSE` 的 `tasks` 那一列已寫「含 spec-kit 的衍生內容」，不需修改。

### 工作項內容

#### W1：frontmatter

- `description` 的「（Must Read／Optional，檔案 → 部位 — Why），寫成 spec 目錄的 tasks.md」改為「（Must Read／Optional，檔案 → 部位 — Why），資料模型的受約束欄位以 table.column 引用、不在任務描述重抄約束，寫成 spec 目錄的 tasks.md」。
- 觸發關鍵字「Reference Loading Contract」之後加入「欄位引用」。
- 其餘文字與分流保留原文。全文見第 2 節。

#### W2：SOP

1. Phase 2 -- 規劃任務的 `THINK` 介面對照步驟：「operation、資料表或畫面」改為「operation、資料表（含受約束欄位）或畫面」。
2. Phase 2 -- 規劃任務的 `THINK` 任務規劃步驟：「把工作排入 Setup、Foundational、spec.md 每個 User Story 一個 Phase（依 spec 順序）與 Polish，」改為「把工作排入各 Phase，」。
3. Phase 3 -- 產出 tasks.md 的 `WRITE` 寫入步驟：刪除「User Story Phase 數依 spec.md 調整，Polish 的 Phase 編號接在最後一個 User Story 之後；」。

其餘步驟與完成條件保留原文。修改後全文見第 2 節。

#### W3：Rule 2

在既有條列「任務描述必須從上游文件原樣帶入……」之後，加入兩個條列：

- 任務描述不得重述 `data/data-model.dbml` 已定義的欄位約束：型別、長度、數值範圍、格式、預設值、可否為空、唯一、Enum 的值清單、狀態轉換與跨欄位規則；必須改以 Rule 3 的 Must Read 引用該欄位。任務描述可以寫出欄位名稱，以及任務要寫入或比對的值，例如「`status` 改為 `picked_up`」。
- 任務比資料模型多加或收窄欄位的限制時，必須在任務描述以「任務限定：」寫出限制與依據，且不得和資料模型的約束矛盾。只說明實作方式（例如以 `CHECK` 實作某欄位的「驗證」）不算新增限制。

既有 Good Example、Bad Example 加上 `### Example 1` 小標，內容保留原文。新增 Example 2：

Good Example 2（圖書館預約情境）：資料模型的 `reservations.pickup_code` 有「驗證：6 位數字（FR-006）」，`reservations.status` 有「轉換」，`reservations.expires_at` 只有 `timestamptz [not null]`。建立資料表的任務不抄欄位定義；產生取書碼的任務另外規定第一碼不為 0，以「任務限定：」標出。

```markdown
- [ ] T010 [US1] 在 `server/db/schema.sql` 建立 Enum `reservation_status` 與 `reservations`：欄位、型別、預設值、唯一與索引依 Must Read；`reservations.pickup_code` 的「驗證」以 `CHECK` 實作（FR-002、FR-006）
- [ ] T012 [US1] 在 `server/services/pickupCodeService.js` 實作 `generatePickupCode()`：任務限定：第一碼不為 0，避免讀者輸入時被省略（FR-006、research §5）
```

Bad Example 2（同一情境）：建立資料表的任務重抄欄位定義，抄的時候漏掉「6 位數字」；產生取書碼的任務寫了資料模型沒有的限制卻沒有標出，而且和「6 位數字」矛盾。

```markdown
- [ ] T010 [US1] 在 `server/db/schema.sql` 建立 Enum `reservation_status`（`waiting`、`ready`、`picked_up`、`expired`）與 `reservations`：`pickup_code char(6) [not null]`；`status reservation_status [not null, default: 'waiting']`；`expires_at timestamptz [not null]`（FR-002）
- [ ] T012 [US1] 在 `server/services/pickupCodeService.js` 實作 `generatePickupCode()`：產生 5 位數字的取書碼（FR-006）
```

#### W4：Rule 3

在既有條列之後加入兩個條列：

- 部位指向 `data/data-model.dbml` 的單一欄位時，必須寫成 `table.column`，例如 `` `data/data-model.dbml` → `reservations.pickup_code` ``；`table` 必須是資料模型中的資料表，`column` 必須是該資料表的欄位。整張資料表、Enum 與關聯分別寫成 `Table <table>`、`Enum <enum>`、`Ref: …`。
- 受約束欄位指 `data/data-model.dbml` 中欄位 `note` 以「驗證：」或「轉換：」開頭的欄位，以及資料表 `Note` 的「跨欄位：」括號內列出的每個 `table.column`。每個受約束欄位必須在至少一個實作它的任務（建立該欄位、寫入或檢查該欄位值）的 Must Read 以 `table.column` 引用，Why 寫出該任務實作的約束；只在測試任務中引用不算。只有型別與設定（`varchar(n)`、`not null`、`unique`、`Enum`、`default`）的欄位不要求逐欄引用，建立資料表的任務以 `Table <table>` 引用即可；資料模型沒有受約束欄位時，不要求逐欄引用。

既有 Good Example 的程式碼區塊中，`` `data/data-model.dbml` → `Table reservations` 的 `expires_at` `` 改為 `` `data/data-model.dbml` → `reservations.expires_at` ``，其餘保留原文。既有 Good Example、Bad Example 加上 `### Example 1` 小標。新增 Example 2：

Good Example 2（同 Rule 2 Example 2 的資料模型）：受約束欄位 `reservations.pickup_code` 由建立資料表的任務引用，`reservations.status` 由改變狀態的任務引用；`expires_at` 只有型別與設定，以 `Table reservations` 涵蓋。

```markdown
- [ ] T010 [US1] 在 `server/db/schema.sql` 建立 Enum `reservation_status` 與 `reservations`……（FR-002、FR-006）
  - **Must Read**
    - `data/data-model.dbml` → `Enum reservation_status`、`Table reservations` — Why：要建立的欄位、型別、預設值與索引
    - `data/data-model.dbml` → `reservations.pickup_code` — Why：取書碼的「驗證」，以 `CHECK` 實作
- [ ] T016 [US2] 在 `server/services/pickupService.js` 實作 `confirmPickup`：`status` 改為 `picked_up`……（FR-005）
  - **Must Read**
    - `data/data-model.dbml` → `reservations.status` — Why：可以改為 `picked_up` 的來源狀態
```

Bad Example 2（同一情境）：欄位寫成 `Table reservations` 的 `pickup_code`；`reservations.pickup` 不是資料表的欄位；`reservations.status` 的轉換只在測試任務引用，實作任務沒有引用。

```markdown
- [ ] T010 [US1] 在 `server/db/schema.sql` 建立 Enum `reservation_status` 與 `reservations`……（FR-002、FR-006）
  - **Must Read**
    - `data/data-model.dbml` → `Table reservations` 的 `pickup_code` — Why：取書碼
- [ ] T016 [US2] 在 `server/services/pickupService.js` 實作 `confirmPickup`……（FR-005）
  - **Must Read**
    - `data/data-model.dbml` → `reservations.pickup` — Why：取書狀態
- [ ] T017 [US2] 在 `server/tests/pickupService.test.js` 撰寫 `confirmPickup` 的測試……（FR-005）
  - **Must Read**
    - `data/data-model.dbml` → `reservations.status` — Why：狀態轉換
```

#### W5：`templates/tasks.example.md`

範例的資料模型和 `data-plan` 範例相同情境，受約束欄位為 `product_variants.stock_quantity`、`cart_items.quantity`、`orders.order_no`、`orders.status`、`payments.status`、`payments.notified_at`。骨架 `templates/tasks.md` 不修改。修改處：

| 位置 | 修改後 |
| ---- | ------ |
| Reference Loading Contract 第 4 點 | `` - `data/data-model.dbml`：`Table`、`Enum`、`Ref`，以及單一欄位的 `table.column` `` |
| T008 描述 | 「在 `backend/src/db/schema.sql` 開頭以 `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` 重建 schema，並建立 `products` 與 `product_variants`：欄位、型別、預設值、唯一約束、`product_id` 索引與 `Ref: product_variants.product_id > products.id` 依 Must Read；`product_variants.stock_quantity` 的「驗證」以 `CHECK` 實作（research §3、FR-003）」 |
| T008 Must Read | `Table products`、`Table product_variants` 的 Why 改為「要建立的欄位、型別、預設值、唯一約束與索引」；在 `Ref` 那一項之後加入 `` `data/data-model.dbml` → `product_variants.stock_quantity` — Why：庫存數量的「驗證」，以 `CHECK` 實作 `` |
| T016 描述 | 「在 `backend/src/db/schema.sql` 建立 `carts` 與 `cart_items`：欄位、型別、預設值、唯一索引 `uq_cart_items_cart_variant` 與兩個 `Ref` 依 Must Read；`cart_items.quantity` 的「驗證」以 `CHECK` 實作；執行 `npm run db:reset` 確認建立成功（FR-001、FR-002）」 |
| T016 Must Read | `Table carts`、`Table cart_items` 的 Why 改為「要建立的欄位、型別、預設值與唯一索引 `uq_cart_items_cart_variant`」；加入 `` `data/data-model.dbml` → `cart_items.quantity` — Why：購物車數量的「驗證」，以 `CHECK` 實作 `` |
| T018 Must Read | `` `Table products` 的 `is_listed`、`Table cart_items` 的 `uq_cart_items_cart_variant` `` 改為 `` `products.is_listed`、`Table cart_items` 的 `uq_cart_items_cart_variant` ``，Why 不變 |
| T026 描述 | 「在 `backend/src/db/schema.sql` 建立 Enum `order_status`、`payment_status` 與 `orders`、`order_items`、`payments`：欄位、型別、預設值、唯一約束、快照欄位、索引 `idx_orders_customer_created`、`idx_payments_order` 與三個 `Ref` 依 Must Read；`orders.order_no` 的「驗證」與 `payments` 的「跨欄位」以 `CHECK` 實作；執行 `npm run db:reset` 確認建立成功（FR-004、FR-005、FR-006）」 |
| T026 Must Read | `Table orders`、`Table order_items`、`Table payments` 的 Why 改為「要建立的欄位、型別、預設值、快照欄位、`ecpay_trade_no` 唯一約束與索引」；加入 `` `data/data-model.dbml` → `orders.order_no` — Why：訂單編號的「驗證」，以 `CHECK` 實作 `` 與 `` `data/data-model.dbml` → `payments.status`、`payments.notified_at` — Why：兩個欄位之間的「跨欄位」規則，以 `CHECK` 實作 `` |
| T028 描述 | 「以 `SC` 加 `yyyyMMdd` 加 5 碼英數產生 `order_no`」改為「任務限定：`order_no` 以 `SC` 加 `yyyyMMdd` 加 5 碼英數產生（research §5）」，其餘保留 |
| T028 Must Read | 加入 `` `data/data-model.dbml` → `orders.order_no`、`product_variants.stock_quantity` — Why：訂單編號的「驗證」，以及扣減後的庫存不得違反「驗證」 `` |
| T031 Must Read | `` `Table payments`（`ecpay_trade_no`、`check_mac_verified`）、`Enum order_status` — Why：去重依據與要更新的欄位 `` 改為兩項：`` `data/data-model.dbml` → `payments.ecpay_trade_no`、`payments.check_mac_verified` — Why：去重依據與要更新的欄位 ``；`` `data/data-model.dbml` → `orders.status`、`payments.status`、`payments.notified_at` — Why：訂單與付款允許的轉換，以及 `notified_at` 的「跨欄位」規則 `` |
| T033 Must Read | 加入 `` `data/data-model.dbml` → `orders.status` — Why：`pending_payment → expired` 的轉換 `` |

其他任務、段落與 Notes 保留原文。施工後範例中的 `table.column` 必須都存在於 `data-plan` 範例 `templates/data-model.example.dbml`。

#### W6：`scripts/check_tasks.py`

保留既有命令列介面、退出碼與既有檢查，不新增第三方依賴，不依賴 `data-plan` 的腳本。新增：

1. 解析 DBML 文字（不呼叫外部工具）：
   - `Table <name> … {` 區塊，名稱去掉引號；略過 `indexes { … }` 子區塊。
   - 欄位行：欄位名稱，以及 `[...]` 設定中的 `note: '…'`（支援 `\'` 跳脫）。
   - 資料表 `Note: '…'` 與 `Note { '''…''' }` 兩種寫法。
2. 受約束欄位：欄位 `note` 去掉開頭空白後以「驗證：」或「轉換：」開頭；以及資料表 `Note` 中每段「跨欄位：…（…；…）」括號內、分號前列出的 `table.column`。
3. 參考的檔案以 `.dbml` 結尾時，部位中每個反引號識別字若符合 `<識別字>.<識別字>`（不以 `Ref` 開頭），必須是資料模型中的資料表，且欄位屬於該資料表；不符時列為 issue：「第 n 行（Txxx）在 <檔案> 找不到欄位：`a.b`（沒有資料表 `a`／資料表 `a` 沒有欄位 `b`）」。這項取代 `token_exists` 對 `.dbml` 參考只比對欄位名稱的做法；其他檔案維持原行為。
4. 涵蓋：每個受約束欄位至少要在一個任務的 **Must Read** 中，以指向同一個 `.dbml` 檔的參考寫出該 `table.column`；沒有時列為 issue：「受約束欄位 `a.b` 沒有任何任務在 Must Read 以 `<檔案>` → `a.b` 引用」。Optional 不算。
5. 資料模型不存在，或沒有受約束欄位時，第 3 點仍檢查，第 4 點不產生 issue。
6. JSON 報告新增 `field_citations`：`{"data_model": <相對路徑或 null>, "constrained": [<table.column>…], "uncited": [<table.column>…]}`。
7. `--help` 與檔頭說明補上新檢查。

自測（skill-form-script 驗證時）：以 `data-plan` 範例 `templates/data-model.example.dbml` 搭配施工後的 `tasks.example.md` 建立暫存 spec 目錄，確認新檢查沒有 issue；故意刪掉一個受約束欄位的引用、寫一個不存在的 `table.column`，確認兩者都列為 issue；以 `specs/008-overdue-discord-notification/` 既有的 `tasks.md`（舊寫法資料模型）執行，確認 `field_citations.constrained` 為空，且新檢查沒有新增 issue。

#### W7：LICENSE

`tasks/LICENSE` 第 1 點之後加入第 2 點：

```text
2. GitHub Spec Kit v1.4.2（tag `v1.4.2`，commit `1e421b5`）`templates/commands/tasks.md` 第 74、81、201-204 行：
   以資料模型為欄位約束的唯一來源、任務以欄位引用取代重抄的約束、任務自己新增或收窄的限制要標出且不得矛盾、
   寫出前確認每個受約束欄位都有引用。本 Skill 改寫為 `data/data-model.dbml` 的 `table.column` 引用，
   受約束欄位以 data-plan 的「驗證」「轉換」「跨欄位」界定；RuleFile 條列、範例與 `scripts/check_tasks.py`
   的檢查為重新撰寫，未直接複製上游檔案。
```

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E5、E7～E13 | 本次 | 暫存複本對 `specs/008-overdue-discord-notification/` 依序執行 `data-plan`（資料庫介面）與 `tasks` | 兩個覆寫詢問都回覆「同意覆寫」 | (1) `check_data_model.py` 報告的每個 `constrained_fields` 與「跨欄位」列出的欄位，都在某個任務的 Must Read 以 `` `data/data-model.dbml` → `table.column` `` 出現，包括 `overdue_notifications.auto_retry_count`；(2) 建立 `overdue_notifications` 的任務描述沒有欄位型別、預設值、可否為空、範圍與 Enum 值清單；(3) 有額外限制的任務以「任務限定：」標出；(4) 故意把一個引用改成不存在的欄位、刪掉一個受約束欄位的引用時，`check_tasks.py` 兩項都列為 issue；(5) `check_tasks.py` 沒有 `issues`，`tasks_state.py status` 的 `format_issues` 為空；(6) 只有 `data/data-model.dbml` 與 `tasks.md` 改變 |
| S2 | E1～E3、E5、E7～E11、E13 | 本次（換情境） | 暫存複本對 `specs/006-reservation-reschedule/` 依序執行 `data-plan` 與 `tasks` | 兩個覆寫詢問都回覆「同意覆寫」 | 同 S1 的 (1)(2)(5)；`reschedule_requests.reject_reason`（200 字）、`captcha_challenges.captcha_code`（英數 7 碼）、`reschedule_requests.status` 的轉換都只以引用出現，任務描述沒有重抄 |
| S3 | E3、E6～E9、E11、E13 | 回歸 | 暫存複本對 `specs/002-room-game-chat/` 只執行 `tasks`（資料模型維持舊寫法） | 覆寫詢問回覆「同意覆寫」 | 沒有因缺少逐欄引用而列「未通過項」；建立資料表的任務以 `Table <table>` 引用，沒有重抄欄位定義；`check_tasks.py` 沒有 `issues` |
| S4 | E12 | 回歸 | 暫存複本對 `specs/004-equipment-approval-review/` 執行 `tasks` | 覆寫詢問回覆「不同意」 | 回報沒有修改既有 `tasks.md`；`git status` 與執行前相同 |

直接呼叫者：無（沒有 Skill 委派 `tasks`），不需呼叫者回歸情境。`implement` 讀 `tasks.md`，由 S1 的 `tasks_state.py status` 驗證解析不受影響。

## 8. 驗收結果

- 施工後結構診斷：`tasks` 0 個 error、0 個 warning。
- 同步：`./scripts/sync-skills.sh --from claude` 與 `--check` 退出狀態都是 0，結果為「兩邊一致」；同步輸出沒有只存在於目標端的 Skill。
- To-Be 一致性：施工後 `SKILL.md` 與第 2 節 To-Be 全文逐字相同。
- 腳本自測（skill-form-script Phase 2，暫存目錄）：
  - `data-plan` 範例 `data-model.example.dbml` 搭配施工後的 `tasks.example.md`：`constrained` 6 個、`uncited` 為空，欄位相關 issue 為 0。
  - 刪掉 `cart_items.quantity` 的引用、寫入 `products.is_listedx` 與 `order.order_no`：3 項都列為 issue。
  - 多行 `Note { ''' … ''' }`、帶引號的資料表名稱、字串內的大括號、`\'` 跳脫都能解析；只在 Optional 引用不算涵蓋。
  - 既有 8 個 spec 目錄的 `tasks.md`（舊寫法資料模型）：新舊腳本的 `issues` 與 `warnings` 完全相同，`constrained` 都為空。
  - `tasks.md` 不存在時退出狀態 2。
- 驗收方式：S1～S4 各在含本次未提交修改的暫存專案複本（排除 `.git`、`node_modules`，`git init` 建立基準 commit）中，由不帶本次分析脈絡的 `skill-tester` 子代理執行；Agent 工具指定 model `sonnet`、effort `medium`，4 個子代理平行執行。S1 的 (4) 變更測試、S1 與 S2 的 `tasks_state.py status` 由主 session 在子代理產出上執行。
- S1 通過：
  - `data-plan` 產出的受約束欄位為 `overdue_notifications.status`（轉換）、`auto_retry_count`（驗證 0 到 3），加上 3 條跨欄位涉及的 `next_attempt_at`、`failure_reason`、`sent_at`、`discord_message_id`，共 6 個；`check_tasks.py` 的 `uncited` 為空。
  - T003 改為「欄位、型別、預設值、可否為空、唯一約束與索引……依 Must Read」，沒有重抄型別、預設值、範圍與 Enum 值清單；T011 以 `overdue_notifications.auto_retry_count` 等 6 項 `table.column` 引用。
  - 沒有任務比資料模型多加欄位限制，沒有出現「任務限定：」（E4 無適用對象）。
  - 變更測試：刪掉 `overdue_notifications.sent_at` 的所有引用、把一個引用改成 `overdue_notifications.discord_msg_id`，腳本兩項都列為 issue。
  - `check_tasks.py` 沒有 `issues`；`tasks_state.py status` 的 `format_issues` 為空；`git status` 只有 `data/data-model.dbml` 與 `tasks.md` 改變（另有子代理的暫存目錄 `.tmp-accept/`）。
- S2 通過：
  - 受約束欄位 12 個，`uncited` 為空；`issues`、`warnings` 都是空的；`format_issues` 為空。
  - T015 以「`reschedule_requests.to_reservation_date` 的「驗證」、新舊日期時段的「跨欄位」規則」引用，沒有重抄「7 天」；T029 寫入 `reject_reason` 時沒有重抄 200 字；建立資料表的 T012 改為「依 Must Read」。
  - `git status` 只有 `data/data-model.dbml` 與 `tasks.md` 改變（另有 `.tmp-accept/`）。
- S3 通過：002 的資料模型沒有固定寫法，`constrained` 為空，沒有列「未通過項」；建立 `chat_messages` 的 T007 寫「欄位、型別、預設值、兩個唯一索引與一個一般索引依 Must Read」；`issues`、`warnings` 都是空的；`git status` 只有新的 `tasks.md`。002 原本沒有 `tasks.md`，所以沒有出現覆寫詢問，預先回覆沒有用到。
- S4 通過：覆寫詢問回覆「不同意」後停止，回報沒有修改既有 `tasks.md`；`git status` 為空。
- 觀察（不影響判定）：
  - S1、S2 的子代理沒有從樣板重填，而是在既有 `tasks.md` 上就地修改；S1 保留了既有的 `[X]`。這是子代理為了省事的做法，測試環境的既有檔案是實作完成後的狀態。產出仍符合各項判斷方式。
  - 部分 Must Read 的 Why 寫出約束值，例如 S1 T011 的「0 到 3 範圍」。E3 只規定任務描述，Why 不在範圍內。
  - S2 的 `data-plan` 產出中，`captcha_challenges.captcha_code` 的「英數 7 碼」仍寫在一般說明，沒有寫成「驗證」。這是 `data-plan` 該次產出的落差，不是 `tasks` 的問題；`tasks` 依現有資料模型處理，沒有重抄這個約束。
- 約束分配：C1～C26 各只出現在指定的存放位置；W2 已刪除 P2-3、P3-2 中 C15 的重述。
- 個案驗收條件：無。
