# 工程藍圖：tasks－附加 Convergence 模式

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/58-tasks-附加Convergence模式/`
- 根因報告：同一紀錄目錄的 `rca-report.md`。使用者已確認 E1～E11、S1～S6 與 R1、R2，推定的 E7、E8、E9 保留（2026-11-20）
- 確認紀錄：使用者於 2026-11-20 Phase 4 回覆「確認藍圖，同意新增 pending_gaps.py，開始施工」，同意 W1～W5、沒有刪除項目、和交接文件第 4.1 節不同的 `scripts/pending_gaps.py`，以及驗收情境 S1～S6；施工差異 D1 的修正 W6 經使用者 2026-11-20 回覆「確認 W6，繼續施工」

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 使用者要求以 `convergence.md` 附加任務（提到附加模式、`convergence.md` 或 Convergence）且 `tasks.md` 已存在時，不詢問覆寫；只在 `tasks.md` 檔尾附加，附加前的內容逐位元組不變（`tasks.md` 前 <原大小> 個位元組和附加前備份相同） | 本次 | 通用 |
| E2 | 只附加 `convergence.md` 最新一輪「處理」為「附加任務」、且既有任務的 Must Read 沒有以 `` `convergence.md` → G# `` 引用的 G 項目；「上游缺口：…」「不處理」與較舊輪次的列都不附加 | 本次 | 通用 |
| E3 | 新 Phase 標題為 `## Phase <既有最大 Phase 編號＋1>: Convergence`；任務 ID 從既有最大 ID＋1 連續編號；任務不帶 `[US…]`；CRITICAL、HIGH 的任務排在 MEDIUM、LOW 之前；Phase 最後有 `**Checkpoint**:` 行 | 本次 | 通用 |
| E4 | 每個附加任務的 Must Read 都有 `` `convergence.md` → G# ``，並依既有 Rule 3 引用該 G 項目來源與證據所指的上游部位（受約束欄位以 `table.column`）；任務描述結尾的括號引用需求編號與 G# | 本次 | 通用 |
| E5 | 附加後 `check_tasks.py` 沒有 `issues`；`implement/scripts/tasks_state.py status` 沒有 `format_issues`；`tasks_state.py next --scope phase:<新編號>` 只發出新 Phase 的任務 | 本次 | 通用 |
| E6 | 沒有可附加的 G 項目（最新一輪已收斂、沒有「附加任務」列，或都已被引用）時，`tasks.md` 的 sha256 不變，沒有空的 Phase 標題，並回報沒有修改 | 本次 | 通用 |
| E7 | 附加模式下 spec 目錄沒有 `convergence.md` 時，停止並指名先執行 `converge`；沒有 `tasks.md` 時，停止並指名先以產生模式執行 `tasks`；兩種情況都不建立或修改任何檔案 | 推定（已確認） | 通用 |
| E8 | 「附加任務」的 G 項目需要上游沒有定義的識別字（operation、資料表、欄位、畫面狀態）才能寫成任務時，不附加該 G 項目、不修改 Notes，並回報 G# 與應處理的 Skill | 推定（已確認） | 通用 |
| E9 | 附加模式只修改 `tasks.md`，不修改 `convergence.md` 或其他檔案，也不 commit | 推定（已確認） | 通用 |
| E10 | 使用者沒有提到附加模式、`convergence.md` 或 Convergence 時，維持產生模式：已有 `tasks.md` 時詢問是否覆寫，不同意時不修改任何檔案 | 既有 | 通用 |
| E11 | 產生模式的 `tasks.md` 結構、Must Read 綁定、上游缺口寫成 Notes 待確認、`check_tasks.py` 檢查與回報內容維持不變 | 既有 | 通用 |

## 2. To-Be SOP

````markdown
---
name: tasks
description: 已有 spec.md、plan.md 及 system-analysis 委派產出的 API 合約、資料模型與 UI 規劃（有通知類介面時另含 notification-plan 產出的通知規劃 notification/plan.md），要拆成可執行的任務清單時使用：依 spec 的 User Story 與 plan.md 系統介面盤點，把工作排成 Setup、Foundational、每個 User Story 一個 Phase 與 Polish，Phase 內依資料庫、後端、前端分組並標出介面編號，每個任務列出執行時要讀的文件部位（Must Read／Optional，檔案 → 部位 — Why），資料模型的受約束欄位以 table.column 引用、不在任務描述重抄約束，寫成 spec 目錄的 tasks.md；上游缺少的介面部位寫成 Notes 的待確認，不自行虛構。已有 tasks.md 與 converge 產出的 convergence.md 時，附加模式只把最新一輪處理為「附加任務」、還沒有被任務引用的缺口寫成檔尾的 Convergence Phase，不詢問覆寫，前面內容不變。使用者提到 tasks、tasks.md、任務清單、任務拆解、implementation tasks、Reference Loading Contract、欄位引用、附加模式、附加任務、convergence.md、Convergence Phase 時使用。盤點介面與產出 plan.md 改用 system-analysis；只補單一種上游產出（UI 雛形、API 合約、資料模型）改用 ui-plan、api-plan 或 data-plan；通知類介面沒有規劃時改用 notification-plan；規劃類別、先畫類別圖再寫程式時改用 plan-with-class-diagram；對照程式找出實作後的缺口、產出 convergence.md 改用 converge；依既有 tasks.md 實作任務時不使用此 Skill。
---

# SOP

## Phase 1 -- 收斂任務輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「任務輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定；決定「執行模式」：使用者要求依 `convergence.md` 附加任務（提到附加模式、附加任務、`convergence.md` 或 Convergence）時為附加模式，其餘情況為產生模式。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/tasks/tasks.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：`## Phase N:` 標題與 Setup、Foundational、每個 User Story、Polish 的 Phase 順序及檔尾的 Convergence Phase，任務行 `- [ ] T001` 格式與連續 ID，`[USn]` 標籤，`**Must Read**`／`**Optional**` 參考行 `` `檔案` → 部位 — Why：理由 `` 格式，組標題括號中的介面編號，`待確認 n` 與 Notes 的對應，`**Tests**:` 行，以及 Reference Loading Contract、Path Conventions、Dependencies & Execution Order、Notes 段落。
5. `CHECK` 「執行模式」為附加模式時進入 Phase 4；產生模式時進入下一步。
6. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `contracts/`、`data/`、`ui/`、`notification/` 下所有檔案的全文（不存在的略過），加入「任務輸入」。
7. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行。
8. `WRITE` 同目錄已有 `tasks.md` 時，詢問使用者是否覆寫；沒有時略過本步驟與下一步。
9. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時，回報沒有修改既有 `tasks.md`、沒有產出任何檔案，並停止執行。

完成條件：「目標 spec」與「執行模式」已決定，「憲法檢查清單」已建立；附加模式已進入 Phase 4；產生模式下 `plan.md` 與同目錄的上游文件已讀取，且沒有既有 `tasks.md` 或使用者已同意覆寫；或缺少輸入、使用者不同意覆寫，已停止執行並回報。

## Phase 2 -- 規劃任務

（8 個步驟與完成條件保留原文，和 As-Is 相同。）

## Phase 3 -- 產出 tasks.md

（5 個步驟與完成條件保留原文，和 As-Is 相同。）

## Phase 4 -- 附加 Convergence

1. `CHECK` 「目標 spec」所在目錄沒有 `tasks.md` 時，回報需要先以產生模式執行 `tasks`；沒有 `convergence.md` 時，回報需要先執行 `converge`；兩種情況都不建立或修改任何檔案，並停止執行。
2. `READ` 「目標 spec」所在目錄的 `tasks.md` 與 `convergence.md` 全文，以及在專案根目錄執行 `git status --short` 的輸出，建立「附加輸入」與「變更基準」。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/pending_gaps.py --convergence <convergence.md 絕對路徑> --tasks <tasks.md 絕對路徑>`，取得「待附加缺口」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
4. `CHECK` 確認退出狀態為零且標準輸出為可解析的 JSON；失敗時依標準錯誤輸出修正參數後重試，仍失敗時回報原因並停止，不修改 `tasks.md`。
5. `READ` 「待附加缺口」每個 G 項目的來源與證據所指的上游文件部位，以及 `plan.md` 的 Source Code，加入「附加輸入」。
6. `READ` 規劃附加任務時，讀取 `rules/任務清單-格式規範.md` 的所有 Rule，建立「任務清單檢查清單」。
7. `THINK` 依「待附加缺口」、「附加輸入」、「憲法檢查清單」與已載入的「任務清單檢查清單」，為每個 G 項目寫出 Convergence Phase 的任務描述與 Must Read／Optional，建立「附加規劃」；依檢查清單不附加的 G 項目，連同缺少的部位與應處理的 Skill 記入「未附加缺口」。
8. `CHECK` 「附加規劃」沒有任務時（「待附加缺口」為空，或每個 G 項目都記入「未附加缺口」），回報 `tasks.md` 沒有修改、沒有產出任何檔案、原因與「未附加缺口」，並停止執行。
9. `WRITE` 以 `cp` 把 `tasks.md` 複製到系統暫存目錄，記為「附加前備份」，並記下原檔的位元組數；再把「附加規劃」寫在 `tasks.md` 檔尾，不修改既有內容與其他檔案。
10. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_tasks.py --spec-dir <目標 spec 目錄絕對路徑> <tasks.md 絕對路徑>`，取得「任務清單檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
11. `CHECK` 以 `head -c <原檔位元組數> <tasks.md> | cmp - <附加前備份>` 確認既有內容不變；「任務清單檢查結果」沒有 `issues`；逐條驗證「憲法檢查清單」與「任務清單檢查清單」，憲法衝突、「未套用規則」與「憲法偏離」依 Phase 3 -- 產出 tasks.md 的 `CHECK` 檢查步驟的方式處理；執行 `git status --short` 與「變更基準」比對，確認只有 `tasks.md` 改變；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 10；未通過時以「附加前備份」還原 `tasks.md`，修正「附加規劃」後返回步驟 9，最多 3 輪；第 3 輪仍未通過時，既有內容有改變就以「附加前備份」還原 `tasks.md`，其餘未通過的項目記為「未通過項」。
12. `WRITE` 刪除「附加前備份」，向使用者回報 `tasks.md` 路徑、新 Phase 的編號與任務 ID 範圍、每個任務對應的 G 編號、「未附加缺口」（G 編號、缺少的部位與應處理的 Skill）、「任務清單檢查結果」的 `warnings`、「未通過項」（沒有時說明全部通過）與「憲法遵循」（內容同 Phase 3 的回報），以及下一步：以 `implement` 只執行新 Phase，完成後再執行 `converge`。

完成條件：「附加規劃」已寫在 `tasks.md` 檔尾，既有內容不變且只有 `tasks.md` 改變，檢查已通過或未通過的項目已記為「未通過項」，且已回報；或缺少輸入、沒有可附加的 G 項目，已停止執行並回報，`tasks.md` 沒有修改。
````

## 3. 差異表

### 刪除

無。As-Is 每個元素都能追溯到 E10、E11（產生模式），沒有表達其他存放位置之約束的內容（第 5 節逐條檢查）。

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter `description` | 修改 | 加入附加模式一句；觸發關鍵字加入「附加模式、附加任務、convergence.md、Convergence Phase」；分流加入「產出 convergence.md 改用 converge」 | R1、E1、E10；概述結果，不表達判斷細節 |
| P1-2（`THINK` 決定目標 spec） | 修改 | 句尾加入「執行模式」的決定方式 | R1、E1、E10；C2 |
| P1-5（`READ` 憲法檔）→ P1-4 | 修改並移位 | 移到模式分流之前，讓附加模式也建立「憲法檢查清單」；鎖定項目加入「及檔尾的 Convergence Phase」，其餘原文保留 | R1、E1；C4 |
| P1-5（新） | 新增 | `CHECK` 附加模式進入 Phase 4 | R1、E1；C5 |
| P1-4、P1-6、P1-7、P1-8 → P1-6～P1-9 | 移位 | 原文保留，只改編號；只在產生模式執行 | E10、E11；C6～C8 |
| Phase 1 完成條件 | 修改 | 加入「執行模式」、憲法檢查清單與附加模式的結果 | R1；概述 |
| Phase 4 -- 附加 Convergence | 新增 | 12 個步驟與完成條件，全文見第 2 節 | R1、E1～E9；C24～C33 |
| `rules/任務清單-格式規範.md` Rule 6 | 新增 | Convergence Phase 的寫法，附 Good／Bad Example（全文見 W3） | R2、E3、E4、E8；C34 |
| `scripts/pending_gaps.py` | 新增 | 讀 `convergence.md` 最新一輪與 `tasks.md`，輸出待附加的 G 項目（規格見 W4） | R1、E2、E6；C26 |
| `tasks/LICENSE` | 修改 | 加入第 3 點：Spec Kit v1.4.2 `speckit.converge` 把缺口附加成新 Phase 的衍生 | CLAUDE.md 規則 3 |

選新增而不是改寫既有 Phase 的理由（重新設計 Rule 4）：

1. 刪除：沒有表達附加模式的既有內容可刪。
2. 改寫：Phase 2 讀完整上游、涵蓋每個 User Story、查既有測試依賴；Phase 3 依樣板寫出整份檔案。附加模式的輸入（`convergence.md`）、寫入方式（只寫檔尾）與檢查（前段不變）都不同。若改寫 Phase 2、3，每一步都要分兩種模式，E11 的產生模式路徑會被改動。所以 Phase 2、3 原文保留。
3. 改換存放位置：E1～E9 沒有既有存放位置。
4. 新增：一個 Phase、一條 Rule、一支腳本。Rule 6 加在既有 RuleFile（任務清單格式同主題，約束分配 Rule 3），不新增 RuleFile；樣板組不改（附加模式不依骨架寫整份檔案）。

和交接文件第 4.1 節的差異：第 4.1 節沒有新增腳本。依約束分配 Rule 2，「最新一輪、處理為附加任務、還沒有被 Must Read 引用」的篩選輸入輸出明確、可重複執行、結果可由程式判斷，存放位置順序 1 是腳本，所以新增 `scripts/pending_gaps.py`。`check_tasks.py` 不修改（施工後實跑，不通過才回到 Phase 3 重新設計）。

`implement` 不修改：`tasks_state.py next --scope phase:N` 已能只跑新 Phase（計畫 R4）；`converge` 不修改：它的下一步與分流已寫「`tasks` 附加模式」。

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| `name` | 必要（Skill 識別） | 無 |
| P1-1、P1-3 | E7、E10 | C1、C3 |
| P1-6～P1-9（原 P1-4、P1-6～P1-8） | E10、E11 | C6～C8 |
| Phase 2 全部 8 步與完成條件 | E11 | C9～C12 |
| Phase 3 全部 5 步與完成條件 | E11 | C13～C16 |
| Rule 1～Rule 5 | E11；E4 經 Rule 6 引用 Rule 2、Rule 3 | C17～C21 |
| `templates/tasks.md`、`tasks.example.md` | E11 | C22、C23 |
| `scripts/check_tasks.py` | E5、E11 | C14 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 4 | +1 |
| 步驟 | 21 | 34 | +13 |
| RuleFile | 1 | 1 | 0 |
| Rule | 5 | 6 | +1 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 1 | 2 | +1 |

- Phase +1、步驟 +12（Phase 4）：R1 的附加模式流程，對應 E1～E9。
- 步驟 +1（P1-5 分流）：R1、E1、E10。
- Rule +1（Rule 6）：R2、E3、E4、E8。
- 腳本 +1（`pending_gaps.py`）：R1、E2、E6。
- 改寫：description、P1-2、原 P1-5 的鎖定項目、Phase 1 完成條件。沒有刪除，理由見第 3 節「刪除」。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 目標 spec 的決定方式 | P1-2 | P1-2 步驟內文 | 既有，不變；單一步驟一句話 |
| C2 | 執行模式的決定方式（提到附加模式、附加任務、`convergence.md` 或 Convergence 時為附加模式） | P1-2 | P1-2 步驟內文 | 新增；判斷使用者意圖，腳本不能判斷；只屬於這一步，一句話可表達，不需要正反例 |
| C3 | 沒有 spec 或有多份未指定時停止 | P1-3 | SOP 流程 | 既有，不變；分支 |
| C4 | 憲法檔路徑與鎖定項目（加入檔尾的 Convergence Phase） | P1-4 | P1-4 步驟內文 | 修改；單一步驟 |
| C5 | 附加模式進入 Phase 4 | P1-5 | SOP 流程 | 新增；Phase 轉移 |
| C6 | 產生模式讀取的輸入清單 | P1-6 | P1-6 步驟內文 | 既有，不變 |
| C7 | 沒有 `plan.md` 時停止 | P1-7 | SOP 流程 | 既有，不變；分支 |
| C8 | 既有 `tasks.md` 先問覆寫 | P1-8、P1-9 | SOP 流程 | 既有，不變；使用者確認 |
| C9 | 介面對照的內容 | P2-2 | P2-2 步驟內文 | 既有，不變 |
| C10 | 依檢查清單排入各 Phase，寫出任務描述與參考 | P2-3 | P2-3 步驟內文 | 既有，不變 |
| C11 | 查找既有測試依賴並調整任務 | P2-4、P2-5 | P2-4、P2-5 步驟內文 | 既有，不變 |
| C12 | 憲法衝突委派 `clarify`；找不到或未回覆時停止 | P2-6～P2-8 | SOP 流程 | 既有，不變；委派與分支 |
| C13 | 寫入路徑、標題、Contract 第 4 點只列存在的文件、英文固定段落、語言 | P3-2 | P3-2 步驟內文 | 既有，不變 |
| C14 | 任務 ID 連續、`[US]` 標籤、Must Read、參考檔案與部位存在、`table.column`、受約束欄位涵蓋、組標題介面編號、FR／NFR 被引用、待確認對應 | P3-3、P4-10 | `scripts/check_tasks.py` | 既有，不變；兩個步驟執行同一支腳本 |
| C15 | 逐條驗證、憲法優先、未套用規則、憲法偏離、最多 3 輪、未通過項 | P3-4 | P3-4 步驟內文 | 既有，不變；P4-11 引用這一步的處理方式，不重述 |
| C16 | 產生模式的回報內容 | P3-5 | P3-5 步驟內文 | 既有，不變 |
| C17 | Phase 依 User Story 歸屬、依端點分組、組標題、Phase 數量與順序 | P2-3 | Rule 1 | 既有，不變 |
| C18 | 檔案路徑、帶入識別字、不重述欄位約束、任務限定、需求編號、`[P]`、`[USk]` | P2-3、P4-7 | Rule 2 | 既有，不變；Rule 6 要求附加任務依 Rule 2 撰寫 |
| C19 | Must Read／Optional 的分級與 Why、識別字逐字存在、`table.column`、受約束欄位引用 | P2-3、P4-7 | Rule 3 | 既有，不變；Rule 6 要求其餘 Must Read 依 Rule 3 |
| C20 | 上游缺口寫成待確認，不自行補齊 | P2-3 | Rule 4 | 既有，不變；附加模式的例外寫在 Rule 6（C34），不重述 Rule 4 |
| C21 | 測試任務依 spec 要求與既有測試依賴 | P2-3～P2-5 | Rule 5 | 既有，不變 |
| C22 | `tasks.md` 的區塊結構與固定段落 | P3-2 | tasks 樣板組 | 既有，不變 |
| C23 | 範例示範 C17～C21 | P3-2 | tasks 樣板組的範例 | 既有，不變；只示範 |
| C24 | 附加模式缺 `tasks.md` 指名 `tasks`、缺 `convergence.md` 指名 `converge`，不建立檔案並停止 | P4-1 | SOP 流程 | 新增；分支（E7） |
| C25 | 附加模式讀取 `tasks.md`、`convergence.md` 全文與 `git status --short`，建立變更基準 | P4-2 | P4-2 步驟內文 | 新增；單一步驟一句話 |
| C26 | 待附加缺口：`convergence.md` 檔尾編號最大的「第 N 輪」缺口表中，「處理」為「附加任務」、且 `tasks.md` 沒有任何任務的 Must Read 以 `` `convergence.md` → G# `` 引用的 G 項目；同時輸出既有最大 Phase 編號與最大任務 ID | P4-3 | `scripts/pending_gaps.py` | 新增；輸入（兩個檔案）與輸出（G 清單）明確、可重複執行、結果可由程式判斷（順序 1）（E2、E6） |
| C27 | 腳本失敗時修正重試，仍失敗時停止且不修改 `tasks.md` | P4-4 | SOP 流程 | 新增；分支 |
| C28 | 只讀 G 項目來源與證據所指的上游部位與 `plan.md` Source Code | P4-5 | P4-5 步驟內文 | 新增；單一步驟一句話 |
| C29 | 沒有可附加的任務時，回報沒有修改與原因並停止 | P4-8 | SOP 流程 | 新增；分支（E6、E8） |
| C30 | 附加前以 `cp` 備份並記下位元組數；只寫在檔尾，不改既有內容與其他檔案 | P4-9 | P4-9 步驟內文 | 新增；單一步驟；`cp` 是既有工具的單一命令（約束分配 Rule 2） |
| C31 | 以 `head -c` 加 `cmp` 確認前段不變；`git status` 只有 `tasks.md` 改變；未通過時還原並重試，最多 3 輪 | P4-11 | P4-11 步驟內文 | 新增；`head -c … | cmp -`、`git status` 是既有工具的單一命令，寫在步驟內文，不另建腳本（E1、E9） |
| C32 | 附加模式的回報內容與下一步 | P4-12 | P4-12 步驟內文 | 新增；單一步驟 |
| C33 | 附加任務的規劃依待附加缺口、附加輸入、憲法與檢查清單；不附加的 G 記入未附加缺口 | P4-7 | P4-7 步驟內文 | 新增；單一步驟；判斷細節在 C34 |
| C34 | Convergence Phase 的寫法：接在檔尾、不改既有內容；標題 `## Phase <最大＋1>: Convergence` 與 Purpose 行；ID 接續、不帶 `[US]`、不分端點組；依嚴重度與 G 編號排序；一個任務只處理一個 G；描述結尾引用需求編號與 G#；Must Read 第一項是 `convergence.md` → G#，其餘依 Rule 3；Checkpoint 行；需要上游沒有的識別字時不附加、不寫待確認，記下缺少的部位與應處理的 Skill | P4-7 | Rule 6 | 新增；哪些上游部位要引用、G 項目能否寫成任務都要判斷語意，腳本無法判斷；附加模式只寫一個 Phase，不依骨架寫整份檔案，樣板無法保證；需要正反例（約束分配 Rule 2、Rule 3） |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `tasks/SKILL.md` frontmatter | 加入附加模式與觸發詞、分流 | 無 | 已完成 |
| 2 | W2 | `skill-form-sop` | `tasks/SKILL.md` Phase 1 與新增 Phase 4（胖 SOP） | Phase 1 改寫與移位；Phase 4 依胖 SOP 寫入，篩選約束先寫在 `THINK` 步驟內文 | C2、C4、C5、C24、C25、C27～C33 | 已完成 |
| 3 | W3 | `skill-form-rule` | `rules/任務清單-格式規範.md` Rule 6 | 新增 Rule 6 與 Good／Bad Example | C34 | 已完成 |
| 4 | W4 | `skill-derive-script` | Phase 4 -- 附加 Convergence 的 `THINK` 篩選待附加缺口步驟 | 抽出 `scripts/pending_gaps.py`，該步驟改為 `DELEGATE` 加 `CHECK` | C26、C27 | 已完成 |
| 5 | W5 | `skill-engineering` 直接修改 | `tasks/LICENSE` | 加入第 3 點 | 無 | 已完成 |
| 6 | W6 | `skill-form-sop` | Phase 4 -- 附加 Convergence 的 `CHECK` 檢查前段不變步驟 | 施工差異 D1 的修正（使用者 2026-11-20 確認） | C31 | 已完成 |

- W3 交給 `skill-form-rule`：RuleFile 已存在，Phase 4 的 `READ` 載入步驟在 W2 的胖 SOP 中就寫好（指向既有部位，施工委派 Rule 2 允許），W3 不改變載入步驟。
- W4 交給 `skill-derive-script`：新增部位，由它同時建立腳本與 `DELEGATE` 步驟（施工委派 Rule 1）。
- 根目錄 `LICENSE` 的 `tasks` 那一列已寫「含 spec-kit 的衍生內容」，不修改。
- 施工後實跑 `check_tasks.py`（S1、S3）；不通過時停止施工，回到 Phase 3 重新設計並請使用者確認（施工委派 Rule 5）。
- 施工在 `.agents/skills/tasks/` 進行，完成後執行 `scripts/sync-skills.sh --from agents` 與 `--check`。

### 工作項內容

#### W1：frontmatter

- 在「上游缺少的介面部位寫成 Notes 的待確認，不自行虛構。」之後加入：「已有 tasks.md 與 converge 產出的 convergence.md 時，附加模式只把最新一輪處理為「附加任務」、還沒有被任務引用的缺口寫成檔尾的 Convergence Phase，不詢問覆寫，前面內容不變。」
- 觸發關鍵字「欄位引用」之後加入「附加模式、附加任務、convergence.md、Convergence Phase」。
- 分流「規劃類別、先畫類別圖再寫程式時改用 plan-with-class-diagram；」之後加入「對照程式找出實作後的缺口、產出 convergence.md 改用 converge；」。
- 其餘文字保留原文。全文見第 2 節。

#### W2：SOP（胖 SOP）

1. Phase 1 依第 2 節改寫：P1-2 句尾加入「執行模式」；原 P1-5（憲法）移到 P1-4，鎖定項目加入「及檔尾的 Convergence Phase」；新增 P1-5 `CHECK` 分流；原 P1-4、P1-6、P1-7、P1-8 原文保留，改為 P1-6～P1-9；完成條件依第 2 節。
2. 原 P1-7、P1-8 的「略過本步驟與下一步」「進入 Phase 2」文字不變。
3. Phase 2、Phase 3 不修改。
4. 在 Phase 3 之後新增 `## Phase 4 -- 附加 Convergence`。胖 SOP 的 Phase 4 有 11 個步驟：第 2 節的步驟 1、2、5～12，把第 2 節步驟 3、4 換成下面一個步驟（放在步驟 2 之後）：

   ```markdown
   3. `THINK` 從 `convergence.md` 檔尾編號最大的「第 N 輪」的缺口表，挑出「處理」為「附加任務」的列，去掉 `tasks.md` 中已有任務的 Must Read 以 `` `convergence.md` → G# `` 引用的 G 項目，並找出 `tasks.md` 既有的最大 Phase 編號與最大任務 ID，建立「待附加缺口」。
   ```

   其餘步驟的編號依序順延；步驟內文中的「步驟 9」「步驟 10」依胖 SOP 的實際編號（W4 完成後依第 2 節）。
5. 完成條件依第 2 節。

#### W3：Rule 6

在 Rule 5 之後新增：

```markdown
# Rule 6 - 附加模式必須把附加任務寫成檔尾的 Convergence Phase

- Convergence Phase 必須接在 `tasks.md` 檔尾，也就是 Notes 或前一個 Convergence Phase 之後；不得插入或修改既有內容，包括 Notes、Dependencies & Execution Order 與前一個 Convergence Phase。
- 標題必須寫成 `## Phase <N>: Convergence`，N 為既有最大 Phase 編號加 1；標題下一行寫 `**Purpose**: 處理 `convergence.md` 第 <輪次> 輪的附加任務（<G 編號>）`。
- 任務 ID 必須從既有最大 ID 加 1 開始連續編號；任務不得帶 `[US…]`；Phase 內不分端點組。
- 任務必須依 G 項目的嚴重度排序：CRITICAL、HIGH、MEDIUM、LOW；同嚴重度依 G 編號。每個任務只處理一個 G 項目，一個 G 項目可以拆成多個任務。
- 任務描述依 Rule 2 撰寫；結尾括號在該 G 項目來源的需求編號之後加 G 編號，例如 `（FR-004、G7）`。
- 每個任務的 Must Read 第一項必須是 `` `convergence.md` → G# ``，Why 寫出剩餘工作與證據指出的程式位置；其餘 Must Read 依 Rule 3 引用該 G 項目來源與證據所指的上游部位，受約束欄位以 `table.column` 引用。
- Phase 最後一行必須寫 `**Checkpoint**: convergence.md 第 <輪次> 輪的附加任務完成，可以再執行 converge`。
- G 項目需要上游文件沒有定義的 operationId、HTTP 路徑、資料表、欄位、錯誤碼或畫面狀態才能寫成任務時，不得附加該 G 項目，也不得依 Rule 4 在 Notes 寫待確認；必須記為未附加，寫出缺少的部位與應處理的 Skill。

## Good Example

- 圖書館預約的 `tasks.md` 有 Phase 1～5、T001～T030。`convergence.md` 第 2 輪有 G6（MEDIUM，附加任務：取消預約後複本狀態沒有改回）、G7（HIGH，附加任務：沒有檢查預約上限）、G8（上游缺口：`ui-plan`）、G9（LOW，附加任務，但需要 contracts 沒有的借閱紀錄查詢 operation）。G7 排在 G6 前；G8 不附加；G9 記為未附加，回報缺少 B3 的 operation、應由 `api-plan` 處理。

（Markdown 區塊：`## Phase 6: Convergence`、Purpose「處理 `convergence.md` 第 2 輪的附加任務（G7、G6）」、T031 在 `server/services/reservationService.js` 的 `createReservation` 補上 `RESERVATION_LIMIT`（409）（FR-004、G7），Must Read `convergence.md` → G7 與 `contracts/openapi.yaml` → `createReservation`（含 `Conflict`）；T032 在同一檔案的 `cancelReservation` 把複本 `status` 改回 `available`（FR-005、G6），Must Read `convergence.md` → G6 與 `data/data-model.dbml` → `copies.status`；最後是 Checkpoint 行。兩個任務修改同一檔案，不標 `[P]`。）

## Bad Example

- 同一情境中，新 Phase 插在 Notes 之前；T031 帶 `[US1]`；G6 排在 G7 前；任務沒有引用 `convergence.md`；G9 被寫成 Notes 的「待確認 2」。

（Markdown 區塊：`## Phase 6: Convergence` 出現在 `## Dependencies & Execution Order` 之前；`- [ ] T031 [US1] 修正取消預約（G6）`，Must Read 只有 `spec.md` → FR-005；Notes 新增「- 待確認 2：G9 缺少借閱紀錄查詢 API……」。）
```

`skill-form-rule` 依上述情境寫出完整的 Markdown 範例區塊，情境、識別字與正反對照不得增減。

#### W4：抽出 `scripts/pending_gaps.py`

- 目標步驟：Phase 4 -- 附加 Convergence 的 `THINK` 步驟「從 `convergence.md` 檔尾編號最大的「第 N 輪」的缺口表，挑出……建立「待附加缺口」」。
- 介面：`uv run --script scripts/pending_gaps.py --convergence <convergence.md 路徑> --tasks <tasks.md 路徑>`；只用標準函式庫。
- 行為：
  1. 在 `convergence.md` 找出所有 `## 第 N 輪` 標題，取 N 最大的一輪；在該輪的 `### 缺口` 表依表頭欄名（`ID`、`缺口類型`、`嚴重度`、`來源`、`證據`、`剩餘工作`、`處理`）讀取每一列。
  2. 「處理」去掉反引號與前後空白後等於「附加任務」的列為候選。
  3. 在 `tasks.md` 的 `**Must Read**` 參考行找出 `` `convergence.md` → G# ``；已被引用的候選移到 `skipped`，寫出引用它的任務 ID。
  4. 另讀 `tasks.md` 所有 `## Phase N:` 標題的最大 N 與所有任務行的最大 ID。
- 輸出（標準輸出 JSON）：`round`、`round_result`（該輪「結果」行的文字）、`pending`（每列 `id`、`type`、`severity`、`source`、`evidence`、`remaining`，依檔案中的順序）、`skipped`（`id`、`handling`、`reason`：處理不是附加任務，或已被哪些任務引用）、`max_phase`、`max_task_id`。
- 退出狀態：成功為 0（`pending` 可以是空的）；找不到任何「第 N 輪」、找不到該輪的缺口表或表頭缺欄時，標準錯誤輸出原因，退出狀態 1；參數錯誤為 2。
- SOP 改寫：該 `THINK` 步驟改為第 2 節的步驟 3（`DELEGATE`）與步驟 4（`CHECK`），後續步驟編號與步驟內文中的步驟引用依第 2 節。

#### W6：P4-11 前段比對命令（施工差異 D1，使用者已確認）

- Phase 4 -- 附加 Convergence 的 `CHECK` 步驟：「以 `cmp -n <原檔位元組數> <附加前備份> <tasks.md>` 確認既有內容不變」改為「以 `head -c <原檔位元組數> <tasks.md> | cmp - <附加前備份>` 確認既有內容不變」，其餘文字保留原文。
- C31 的存放位置不變（步驟內文；`head`、`cmp` 是既有工具，單一管線命令即可完成）。
- 第 1 節 E1 的「（`cmp -n <原大小>` 相同）」改為「（`tasks.md` 前 <原大小> 個位元組和附加前備份相同）」，只改判斷方式的寫法，不改條件。

#### W5：`tasks/LICENSE`

在第 2 點之後加入：

```text
3. GitHub Spec Kit v1.4.2（tag `v1.4.2`，commit `1e421b5`）的 `speckit.converge` 命令：
   實作後把缺口附加為 `tasks.md` 檔尾的新 Phase、附加前的內容不變的做法。
   本 Skill 改寫為讀取 `converge` 產出的 `convergence.md`，只附加最新一輪「附加任務」且未被引用的缺口；
   Phase 4 的 SOP、RuleFile 的 Rule 6 與 `scripts/pending_gaps.py` 為重新撰寫，未直接複製上游檔案。
```

## 7. 驗收情境

輸入都不用 008 與 `converge` 範例的 G5；測試環境為 007 在 `c7c2ac6` 的暫存複本（Phase 1～6、T001～T046），`convergence.md` 由驗收者手寫。執行時間：批 3 第 4 步，和 `converge` 的 S1～S4 一起，用 `skill-tester`（Sonnet、medium）。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E5、E8、E9 | 本次 | `convergence.md` 2 輪：第 1 輪有一列「附加任務」；第 2 輪有 MEDIUM「附加任務」、HIGH「附加任務」、「上游缺口：`ui-plan`」、手改的「不處理」，以及一列需要 contracts 沒有的 operation 的 LOW「附加任務」。輸入「依 convergence.md 執行 tasks 附加模式」 | 無確認閘門 | 只多 `## Phase 7: Convergence`，HIGH 的任務在 MEDIUM 前，ID 從 T047 起；第 1 輪與上游缺口、不處理的列沒有附加；LOW 那列沒有附加且有回報；`head -c <原大小> tasks.md | cmp - <備份>` 前段相同；`check_tasks.py` 沒有 issues，`tasks_state.py status` 沒有 `format_issues`，`next --scope phase:7` 只發出 Phase 7 的任務；`git status` 只有 `tasks.md` 改變 |
| S2 | E2、E6、E9 | 本次 | S1 完成後，不改 `convergence.md`，再輸入一次同樣的要求 | 無 | `tasks.md` sha256 不變，回報沒有可附加的 G 項目 |
| S3 | E1～E5、E9 | 本次 | S1 的結果加上第 3 輪：一列 CRITICAL「附加任務」、一列「上游缺口：`data-plan`」 | 無 | 只多 `## Phase 8: Convergence`，接在 Phase 7 之後；Phase 7 以前逐位元組不變；ID 接續；只附加 CRITICAL 那列 |
| S4 | E6、E9 | 本次 | `convergence.md` 最新一輪結果為「已收斂」，缺口表沒有列 | 無 | `tasks.md` sha256 不變，沒有空 Phase 標題 |
| S5 | E7、E9 | 本次 | spec 目錄沒有 `convergence.md`，輸入「依 convergence.md 執行 tasks 附加模式」 | 無 | 回報先執行 `converge`；`git status` 沒有變化 |
| S6 | E10、E11 | 回歸 | 已有 `tasks.md`，輸入「為 007 產生 tasks.md」 | 覆寫詢問回覆「不同意」 | 有覆寫詢問；回覆後 `tasks.md` sha256 不變，沒有其他檔案 |

直接呼叫者：無（`callers.tasks` 為空），不需要呼叫者的回歸情境（重新設計 Rule 6）。

## 8. 驗收結果

施工（2026-11-20，`implementer`，Sonnet、medium）：W1～W5 已完成，`SKILL.md` 的 frontmatter、Phase 1 與 Phase 4 和第 2 節逐字一致。`pending_gaps.py` 自測：008 與範例第 2 輪輸出 pending 只有 G5、`max_task_id` T039；G5 被引用後移到 skipped；沒有「第 N 輪」退出 1；沒有參數退出 2。

施工後結構診斷：0 error、1 warning（REF003：`rules/任務清單-格式規範.md` 在 P2-1 與 P4-6 各載入一次；兩步分屬產生模式與附加模式，同一次執行只會走一條，依設計保留）。

同步：`./scripts/sync-skills.sh --from agents` 退出 0；`--check` 為「兩邊一致」。

實跑（007 `c7c2ac6` 暫存複本，手寫 `convergence.md` 一輪：G1 MEDIUM 附加任務、G2 HIGH 附加任務、G3 上游缺口；手動附加 Phase 7 的 T047、T048）：

- `pending_gaps.py`：附加前 pending 為 G1、G2，skipped 為 G3，`max_phase` 6、`max_task_id` T046；附加後 G1、G2 移到 skipped（已被 T048、T047 引用）。
- `check_tasks.py`：issues 0、warnings 0。`check_tasks.py` 不需要修改。
- `implement/scripts/tasks_state.py status`：`format_issues` 為空；`next --scope phase:7` 發出 T047。

### 施工差異（停止施工，返回 Phase 3）

- D1：P4-11 的 `cmp -n <原檔位元組數> <附加前備份> <tasks.md>` 在 macOS 的 `/usr/bin/cmp`（BSD）上，前段相同時仍輸出「cmp: EOF on <附加前備份>」並以退出狀態 1 結束。同一份檔案以 `head -c <原檔位元組數> <tasks.md> | cmp - <附加前備份>` 比對，退出狀態 0。以 `printf 'abc'`／`printf 'abcdef'` 重現相同行為。步驟會把前段相同誤判為「既有內容有改變」。
- 處理：依施工委派 Rule 5 停止，記錄差異，回到 Phase 3 修改設計後請使用者確認（見第 6 節 W6 提案）。

W6（2026-11-20，主 session 依 `skill-form-sop` 單句修改）：P4-11 改為 `head -c <原檔位元組數> <tasks.md> | cmp - <附加前備份>`。在同一份 007 暫存複本上，前段相同時退出 0；在檔頭加一個字元後退出 1。施工後結構診斷 0 error、1 warning（同上 REF003）；`--from agents` 同步退出 0，`--check` 為「兩邊一致」；`SKILL.md` 的 frontmatter、Phase 1、Phase 4 和第 2 節逐字一致（程式比對）。

### 驗收情境（2026-11-20，批 3 第 4 步）

驗收方式：

- 驗收模型：`skill-tester` agent，Sonnet、推理強度 medium；每個情境一個子代理，不帶本次分析脈絡，只提供 Skill 路徑、測試環境位置、情境輸入與預先回覆。子代理只以文字回報，副作用由主 session 以 `git status --short`、sha256、`head -c | cmp`、`check_tasks.py`、`tasks_state.py` 判斷。
- 測試環境：`git archive c7c2ac6` 解開到 scratchpad，換上本次未提交的 `.agents/skills/` 與 `.claude/skills/`（`diff -rq` 確認和專案相同），再 `git init` 並 commit 為基準，執行前 `git status` 為空。007 `tasks.md` 基準 sha256 `d6e73944bc5f…`，61890 位元組。
- 4 份複本：S1→S2→S3 同一份；S4、S5、S6 各一份。`convergence.md` 由驗收者手寫，不用 008 與 `converge` 範例的 G5。
- 情境輸入調整：007 在 `c7c2ac6` 有 8 個 spec 目錄，藍圖輸入「依 convergence.md 執行 tasks 附加模式」會在 Phase 1 步驟 3 停下。S1～S5 的輸入改為「依 specs/007-equipment-maintenance-retire/convergence.md 執行 tasks 附加模式」，S6 改為「為 specs/007-equipment-maintenance-retire/ 產生 tasks.md」。驗證的條件不變。

手寫 `convergence.md`（S1）：第 1 輪 G1 MEDIUM 附加任務；第 2 輪 G2 MEDIUM 附加任務、G3 HIGH 附加任務、G4 上游缺口：`ui-plan`、G5 手改「不處理」、G6 LOW 附加任務（需要 contracts 沒有的「查詢設備狀態變更歷史」operation）。G2 編號在 G3 前，用來驗證依嚴重度重排。S3 加第 3 輪：G7 CRITICAL 附加任務、G8 上游缺口：`data-plan`。S4 為一輪「已收斂」、缺口表只有表頭。

| 情境 | 結果 | 證據 |
| ---- | ---- | ---- |
| S1 | 通過 | 只多 `## Phase 7: Convergence`：T047（G3 HIGH）在 T048（G2 MEDIUM）前，ID 從 T047 起，沒有 `[US…]`，有 `**Checkpoint**:`；每個任務 Must Read 第一項是 `` `convergence.md` → G# ``，描述結尾括號有需求編號與 G#；第 1 輪 G1、G4、G5 沒有附加；G6 沒有附加，回報缺少的 operation 與 `api-plan`；`head -c 61890 tasks.md \| cmp - <基準>` 相同；`check_tasks.py` issues 0、warnings 0；`tasks_state.py status` 的 `format_issues` 為空，`next --scope phase:7` 發出 T047；`git status` 只有 `M tasks.md`；沒有提問 |
| S2 | 通過 | `tasks.md` sha256 執行前後都是 `8b67368ee02c…`；`pending_gaps.py` 把 G2、G3 列為已被 T048、T047 引用；只剩 G6，依 Rule 6 記為未附加，在 P4-8 停止並回報沒有修改 |
| S3 | 通過 | 只多 `## Phase 8: Convergence`，接在 Phase 7 之後，T049 對應 G7；G8 沒有附加；`head -c 63895 tasks.md \| cmp - <S3 前備份>` 相同（Phase 7 以前逐位元組不變）；`check_tasks.py` issues 0、warnings 0；`format_issues` 為空，`next --scope phase:8` 發出 T049；`git status` 只有 `tasks.md` |
| S4 | 通過 | `pending` 為空，在 P4-8 停止；`tasks.md` sha256 不變（`d6e73944bc5f…`），Phase 數仍為 6，沒有空 Phase 標題；`git status` 為空 |
| S5 | 通過 | 在 P4-1 停止，回報先執行 `converge`；`git status` 為空，`tasks.md` sha256 不變 |
| S6 | 通過 | 執行模式為產生模式；P1-8 提出覆寫詢問「`specs/007-equipment-maintenance-retire/` 已經有 `tasks.md`。要覆寫它嗎？」，回覆「不同意」後在 P1-9 停止；`tasks.md` sha256 不變，`git status` 為空 |

觀察（不判為失敗）：

- O1（S3）：子代理發現手寫的 G7 不成立（`backend/tests/integration/equipmentStatus.test.ts:381` 已有一般成員 403 的測試）。這是驗收者手寫測試資料的錯誤；附加模式依設計不重新驗證缺口（驗證由 `converge` 負責），仍照 `pending_gaps.py` 附加，符合 E2。
- O2（S6）：子代理在 P1-6 只讀了 `plan.md` 前段，沒有讀全部上游文件全文就進入覆寫詢問。這是子代理沒有照 SOP 執行，不影響 E10 的判斷；P1-6～P1-9 的順序沒有修改。
- O3（S1、S3）：子代理把「附加前備份」放在 `/tmp`，步驟 12 已刪除（主 session 確認 `/tmp` 沒有殘留）。

結論：S1～S6 全部通過，E1～E11 都已涵蓋。
