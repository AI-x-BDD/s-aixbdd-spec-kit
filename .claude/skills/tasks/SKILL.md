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
