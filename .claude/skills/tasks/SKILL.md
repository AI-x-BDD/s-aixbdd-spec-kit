---
name: tasks
description: 已有 spec.md、plan.md 及 system-analysis 委派產出的 API 合約、資料模型與 UI 規劃，要拆成可執行的任務清單時使用：依 spec 的 User Story 與 plan.md 系統介面盤點，把工作排成 Setup、Foundational、每個 User Story 一個 Phase 與 Polish，Phase 內依資料庫、後端、前端分組並標出介面編號，每個任務列出執行時要讀的文件部位（Must Read／Optional，檔案 → 部位 — Why），寫成 spec 目錄的 tasks.md；上游缺少的介面部位寫成 Notes 的待確認，不自行虛構。使用者提到 tasks、tasks.md、任務清單、任務拆解、implementation tasks、Reference Loading Contract 時使用。盤點介面與產出 plan.md 改用 system-analysis；只補單一種上游產出（UI 雛形、API 合約、資料模型）改用 ui-plan、api-plan 或 data-plan；規劃類別、先畫類別圖再寫程式時改用 plan-with-class-diagram；依既有 tasks.md 實作任務時不使用此 Skill。
---

# SOP

## Phase 1 -- 收斂任務輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「任務輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `contracts/`、`data/`、`ui/` 下所有檔案的全文（不存在的略過），加入「任務輸入」。
5. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行。
6. `WRITE` 同目錄已有 `tasks.md` 時，詢問使用者是否覆寫；沒有時略過本步驟與下一步。
7. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時，回報沒有修改既有 `tasks.md`、沒有產出任何檔案，並停止執行。

完成條件：「目標 spec」、`plan.md` 與同目錄的上游文件已讀取，且沒有既有 `tasks.md` 或使用者已同意覆寫；或缺少輸入、使用者不同意覆寫，已停止執行並回報。

## Phase 2 -- 規劃任務

1. `READ` 規劃任務時，讀取 `rules/任務清單-格式規範.md` 的所有 Rule，建立「任務清單檢查清單」。
2. `THINK` 依「任務輸入」與已載入的「任務清單檢查清單」，為 `plan.md`「系統介面盤點」的每個介面找出 contracts、data、ui 中實作所依據的 operation、資料表或畫面，並記下上游缺口，建立「介面對照」。
3. `THINK` 依「任務輸入」、「介面對照」與已載入的「任務清單檢查清單」，把工作排入 Setup、Foundational、spec.md 每個 User Story 一個 Phase（依 spec 順序）與 Polish，逐一寫出任務描述與 Must Read／Optional 參考，建立「任務規劃」。

完成條件：「介面對照」涵蓋盤點表的每個介面，「任務規劃」已涵蓋每個 User Story。

## Phase 3 -- 產出 tasks.md

1. `READ` `templates/tasks.md` 與 `templates/tasks.example.md`，載入骨架與範例，命名載入結果為「tasks 樣板組」。
2. `WRITE` 依「tasks 樣板組」與「任務規劃」，將 `tasks.md` 寫入「目標 spec」所在目錄，不建立或修改其他檔案：標題填 spec.md 的功能名稱與英文名稱，spec 目錄填目錄名稱；Reference Loading Contract 第 4 點只列出目標 spec 目錄中存在的文件；User Story Phase 數依 spec.md 調整，Polish 的 Phase 編號接在最後一個 User Story 之後；樣板的英文固定段落保留原文，其餘內文使用繁體中文。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_tasks.py --spec-dir <目標 spec 目錄絕對路徑> <tasks.md 絕對路徑>`，取得「任務清單檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
4. `CHECK` 「任務清單檢查結果」沒有 `issues`，逐條驗證「任務清單檢查清單」，比對 `tasks.md` 與「tasks 樣板組」的區塊順序與固定段落，確認步驟 2 的填寫要求均已滿足；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 3；未通過時修正 `tasks.md` 後返回步驟 3，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
5. `WRITE` 向使用者回報 `tasks.md` 路徑、各 Phase 的任務數、Notes 中的待確認項目、「任務清單檢查結果」的 `warnings`，以及「未通過項」（沒有時說明全部通過）。

完成條件：`tasks.md` 已寫入，「任務清單檢查結果」、「任務清單檢查清單」與樣板結構已通過或未通過的項目已記為「未通過項」，且已回報。
