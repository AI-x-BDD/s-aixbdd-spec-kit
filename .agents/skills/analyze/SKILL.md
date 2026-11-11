---
name: analyze
description: 已有 spec.md、plan.md（含 system-analysis 委派產出的 ui/、data/、contracts/，以及 notification-plan 產出的 notification/）與 tasks.md，要在實作前檢查這些文件是否一致時使用；不修改任何上游文件，比對 spec、plan、Planner 產出與 tasks 的重複、歧義、不足、涵蓋缺口與不一致（包括 API 合約、資料模型與 UI 規劃之間的命名與行為差異），並依 `.agents/constitution/` 檢查憲法遵循，違反必須／不得規則為 CRITICAL，每個問題標出位置、建議與處理 Skill，寫成 spec 目錄的 analysis.md。觸發關鍵字：analyze、analysis.md、一致性分析、檢查一致性、跨文件檢查、憲法檢查、實作前檢查。分流：要修正 spec 改用 `s-specify` 或 `clarify-over-specs`；要修正某一種 Planner 產出改用 `api-plan`、`data-plan` 或 `ui-plan`；要修正通知規劃改用 `notification-plan`；要重新產生任務清單改用 `tasks`；要新增或修改憲法規則改用 `constitution`；依 tasks.md 實作改用 `implement`。
---

# SOP

## Phase 1 -- 收斂分析輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「分析輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行；沒有 `tasks.md` 時，告知使用者需要先拆解任務（可使用 `tasks`）並停止執行；停止時不建立任何檔案。
5. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`tasks.md`、`research.md`、`techstack.md` 與 `ui/`、`data/`、`contracts/`、`notification/` 下所有檔案的全文（不存在的略過），加入「分析輸入」。
6. `READ` 在專案根目錄執行 `find .agents/constitution -type f` 列出所有憲法檔（不截斷輸出）並讀取每個檔案；對 `skills/<Skill>/` 下的憲法檔，讀取專案 `.agents/skills/<Skill>/SKILL.md`（不存在時改讀 `.claude/skills/<Skill>/SKILL.md`）中列出鎖定項目的步驟；建立「憲法輸入」，沒有憲法檔時為空。

完成條件：「目標 spec」、`plan.md`、`tasks.md` 與同目錄的上游文件已讀取，「憲法輸入」已建立；或缺少輸入，已停止執行並回報。

## Phase 2 -- 偵測問題

1. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/collect_coverage.py --spec-dir <目標 spec 目錄絕對路徑>`，取得「涵蓋盤點」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
2. `CHECK` 退出狀態為零且標準輸出為可解析的 JSON；因參數或環境錯誤而失敗時修正後重新執行上一步，仍失敗時回報原因並停止執行，不建立任何檔案。
3. `READ` 偵測問題時，讀取 `rules/分析問題-格式規範.md` 的所有 Rule，建立「問題檢查清單」。
4. `THINK` 依「分析輸入」、「憲法輸入」、「涵蓋盤點」與已載入的「問題檢查清單」，比對各文件找出問題，為每個問題決定類別、嚴重度、位置、建議與處理 Skill，建立「問題清單」；並逐份憲法檔、逐條 Rule 記下對照結果，建立「憲法遵循結果」。
5. `CHECK` 逐條驗證「問題檢查清單」，並以 `grep -n` 確認「問題清單」每個位置的識別字都能在該檔案搜尋到；未通過時修正「問題清單」後重新驗證。

完成條件：「涵蓋盤點」已取得，「問題清單」與「憲法遵循結果」已通過「問題檢查清單」，且每個位置都能搜尋到。

## Phase 3 -- 產出 analysis.md

1. `READ` `templates/analysis.md` 與 `templates/analysis.example.md`，載入骨架與範例，命名載入結果為「分析報告樣板組」。
2. `WRITE` 依「分析報告樣板組」、「問題清單」、「憲法遵循結果」與「涵蓋盤點」，將 `analysis.md` 寫入「目標 spec」所在目錄（已存在時直接覆寫），不建立或修改其他檔案：說明文字使用繁體中文；問題清單依嚴重度由高到低排列，最多 50 筆，超過的部分在表格下方依類別與嚴重度摘要筆數；「需求涵蓋」、「介面涵蓋」與「統計」的數字取自「涵蓋盤點」。
3. `CHECK` 比對 `analysis.md` 與「分析報告樣板組」的區塊結構，確認沒有殘留的 `{{`、「統計」的數字與「涵蓋盤點」一致、步驟 2 的填寫要求均已滿足，且目標 spec 目錄只有 `analysis.md` 被建立或修改；未通過時修正 `analysis.md` 後重新驗證。
4. `WRITE` 向使用者回報 `analysis.md` 路徑、各嚴重度的問題數、CRITICAL 問題的 ID 與摘要，以及「下一步」，並說明本 Skill 沒有修改任何上游文件，要修正時依各問題的處理 Skill 執行。

完成條件：`analysis.md` 已寫入目標 spec 目錄且通過步驟 3 的檢查，其他檔案沒有被修改，且已回報。
