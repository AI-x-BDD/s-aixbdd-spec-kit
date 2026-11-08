---
name: implement
description: 已有 tasks Skill 產出的 tasks.md（含 Reference Loading Contract 與每個任務的 Must Read／Optional），要依任務清單實際開發程式時使用：依 tasks.md 順序一次完成一個任務，只讀該任務綁定的文件部位，依任務類型驗證通過才打勾，Phase 完成時做 Checkpoint 驗證，全程不向使用者提問，上游矛盾與受阻自行決策並寫入完成報告；可只執行指定的任務 ID、範圍或 Phase。使用者提到 implement、實作、開發 tasks.md、執行任務、照任務清單開發時使用。還沒有 tasks.md，或要產生、修改任務清單時改用 tasks；寫程式前要先規劃類別圖時改用 plan-with-class-diagram。
---

# SOP

## Phase 1 -- 確定執行範圍

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/tasks.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/tasks.md` 取得；沒有符合的檔案時清單為空），建立「執行輸入」。
2. `THINK` 決定「目標 tasks」與「執行範圍」：使用者指定 spec 目錄或 tasks.md 路徑時使用該份，未指定且清單只有一份時使用該份，其餘情況視為未決定；使用者指定任務 ID、ID 範圍或 Phase 時，執行範圍寫成 `--scope` 參數（例如 `T005,T010-T014,phase:3`），未指定時為全部任務。
3. `CHECK` 「目標 tasks」不存在時，告知使用者需要先產出 tasks.md（可使用 `tasks`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py status <tasks.md 絕對路徑> --reset [--scope <執行範圍>]`，取得「任務狀態」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
5. `CHECK` 腳本退出狀態不為零時，依標準錯誤輸出修正參數後重新執行步驟 4；「任務狀態」的 `format_issues` 不為空時，列出問題，告知使用者以 `tasks` 重新產出 tasks.md 並停止執行；「任務狀態」的 `scope.remaining` 為空時，回報範圍內已全部完成並停止執行。

完成條件：已決定目標 tasks 與執行範圍，tasks.md 格式符合且範圍內有未完成的任務；或已停止並回報原因，沒有修改任何檔案。

## Phase 2 -- 逐一執行任務

1. `READ` 讀取 `rules/任務實作-格式規範.md` 的所有 Rule，建立「實作檢查清單」。
2. `READ` 依「實作檢查清單」，讀取「任務狀態」的 `context`（tasks.md 的 Tests 政策、Reference Loading Contract、Path Conventions、Dependencies & Execution Order 與 Notes），建立「執行脈絡」，並建立空的「決策紀錄」。
3. `READ` 「任務狀態」的 `constitution`（腳本讀取的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/implement/code.md` 全文，不存在的檔案列在 `missing`），建立「憲法檢查清單」，並建立空的「憲法偏離」與「未套用規則」；鎖定項目不受憲法覆寫：任務依 `tasks_state.py` 指定的順序一次執行一個，`tasks.md` 的核取方塊只由 `tasks_state.py check` 變更。
4. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py next <tasks.md 絕對路徑> [--scope <執行範圍>]`，取得「目前任務」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
5. `CHECK` 腳本退出狀態不為零時，依標準錯誤輸出修正參數後重新執行步驟 4；「目前任務」的 `task` 為 `null` 時進入 Phase 3。
6. `READ` 依「執行脈絡」的 Reference Loading Contract 與「實作檢查清單」，讀取「目前任務」列出的所有 Must Read 部位，建立「任務參考」。
7. `READ` 尚未載入時，讀取 `rules/自主決策-格式規範.md` 的所有 Rule，建立「決策檢查清單」。
8. `READ` 尚未載入時，讀取 `rules/專案衛生-格式規範.md` 的所有 Rule，建立「專案衛生檢查清單」。
9. `WRITE` 依「目前任務」、「任務參考」、「憲法檢查清單」、「實作檢查清單」、「專案衛生檢查清單」與「決策檢查清單」實作任務；遇到 Optional 的 Why 所描述的情況時，讀取該 Optional 部位。
10. `READ` 尚未載入時，讀取 `rules/任務驗證-格式規範.md` 的所有 Rule，建立「驗證檢查清單」。
11. `CHECK` 依「驗證檢查清單」與「憲法檢查清單」驗證本任務，取得「驗證結果」（「憲法檢查清單」和實作規則衝突時以「憲法檢查清單」為準，規則會改變鎖定項目時不套用並記入「未套用規則」，偏離「應」規則時把規則與理由記入「憲法偏離」）；未通過時修正後重新驗證，最多 3 輪；第 3 輪仍未通過，或任務要求和「憲法檢查清單」的必須／不得規則無法同時滿足時，依「決策檢查清單」處理，不向使用者提問。
12. `DELEGATE` 在本 Skill 目錄執行 `tasks_state.py`，取得「回寫結果」：驗證通過時執行 `uv run --script scripts/tasks_state.py check <tasks.md 絕對路徑> <任務 ID> --read "<本任務讀取的 Must Read 與 Optional 部位>" --verify "<驗證命令與結果>" [--scope <執行範圍>]`，把本任務標為 `[X]`；依「決策檢查清單」判定受阻時執行 `uv run --script scripts/tasks_state.py block <tasks.md 絕對路徑> <任務 ID> --cause <env|constitution|dependency> --detail "<受阻原因>" [--rule "<憲法檔路徑> Rule <編號>"] [--depends <所依賴的受阻任務 ID>...] [--scope <執行範圍>]`；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止；退出狀態不為零時，依標準錯誤輸出回到步驟 4 取得腳本指定的目前任務，不得以其他方式修改 tasks.md 的核取方塊。
13. `WRITE` 回報本任務進度：原文輸出「回寫結果」的 `progress`，再補充 Optional 的觸發情況與本任務的決策；決策同時依「決策檢查清單」加入「決策紀錄」。
14. `CHECK` 「目前任務」的 `closes_phase` 為 `true` 時，依「驗證檢查清單」執行該 Phase 的 Checkpoint 驗證，未通過時修正後重新驗證，最多 3 輪，仍未通過時依「決策檢查清單」記入「決策紀錄」；之後返回步驟 4。

完成條件：範圍內每個任務都已以 `check` 標為 `[X]` 或以 `block` 記為受阻，每個完成的 Phase 都已執行 Checkpoint 驗證，且期間沒有結束回合或等待使用者回覆。

## Phase 3 -- 完成報告

1. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/tasks_state.py report <tasks.md 絕對路徑> [--scope <執行範圍>] --must-pass <yes|no> [--must-detail "<未通過的規則與原因>"] [--deviation "<偏離的應規則與理由>"...] [--unapplied "<未套用的規則與衝突的鎖定項目>"...]`，取得「完成報告摘要」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止；並在專案根目錄執行 `git status --short`，取得「檔案變更」。
2. `WRITE` 向使用者回報完成報告：原文輸出「完成報告摘要」的 `report`，再依序補上各 Phase Checkpoint 驗證結果、「決策紀錄」、「檔案變更」中新增與修改的檔案，以及本機啟動與操作方式，沒有內容的項目寫「無」。

完成條件：完成報告已回報使用者。
