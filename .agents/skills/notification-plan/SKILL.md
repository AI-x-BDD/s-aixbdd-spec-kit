---
name: notification-plan
description: 已有 plan.md 與 Planner 產出、要在 tasks 之前為沒有 Planner 的外部通知介面產出通知可靠性規劃時使用：依 plan.md 系統介面盤點挑出負責通知觸發、送出、重試與結果追蹤的介面（例如觸發通知的排程、送出與重試程序、外部通知服務與它的本機替身），參考 spec.md、技術研究結果與 contracts、data、ui 的產出，寫出觸發條件、通知狀態轉換、失敗分類與重試界線、重複處理、紀錄需求、各介面規格與驗收情境，存成 spec 目錄的 notification/plan.md；spec 沒決定的業務規則委派 clarify，需要改 API 合約、資料模型或 UI 時列為上游衝突，交回原 Planner。在 system-analysis 與 Planner 之後、tasks 之前單獨執行，不由 system-analysis 委派。使用者提到 notification-plan、通知規劃、通知可靠性、排程規格、Webhook 規格、重試與重複通知、沒有 Planner 的介面時使用。盤點介面改用 system-analysis；設計 API 合約、資料模型、畫面改用 api-plan、data-plan、ui-plan；技術選型改用 technical-research；拆任務改用 tasks。
---

# SOP

## Phase 1 -- 收斂規劃輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「規劃輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `contracts/`、`data/`、`ui/`、`notification/` 下的既有檔案全文（不存在的略過），加入「規劃輸入」。
5. `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/notification-plan/notification-plan.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：產出路徑 `notification/plan.md`、每個「負責介面」恰好一個以「§編號 介面編號 介面名稱」開頭的章節、引用的需求編號必須存在於 spec、「上游衝突」段落。
6. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行；`techstack.md` 與 `research.md` 都不存在時，告知使用者需要先做技術研究（可使用 `technical-research`）並停止執行。

完成條件：「目標 spec」、`plan.md`、技術研究結果與既有 Planner 產出已讀取；或缺少輸入，已停止執行並回報。

## Phase 2 -- 決定規劃範疇

1. `READ` 決定範疇與設計通知規劃時，讀取 `rules/通知規劃-格式規範.md` 的所有 Rule，建立「通知規劃檢查清單」。
2. `THINK` 依「規劃輸入」與已載入的「通知規劃檢查清單」決定「負責介面」與「不在範疇介面」；使用者指定介面編號時以指定為準；每個介面記下 plan.md 中的編號、名稱與需求依據。
3. `CHECK` 「負責介面」為空時，回報 `plan.md` 沒有負責通知的介面、不產出任何檔案，並停止執行。
4. `WRITE` 「目標 spec」所在目錄已有 `notification/plan.md` 時，詢問使用者是否覆寫；不存在時略過本步驟與下一步。
5. `CHECK` 使用者回覆：同意覆寫時進入 Phase 3；不同意或未回覆時，回報沒有修改既有 `notification/plan.md`、沒有產出任何檔案，並停止執行。

完成條件：「負責介面」已決定，且沒有既有 `notification/plan.md` 或使用者已同意覆寫；或沒有負責通知的介面、使用者不同意覆寫，已停止執行並回報。

## Phase 3 -- 設計通知規劃

1. `THINK` 依「規劃輸入」、「憲法檢查清單」與已載入的「通知規劃檢查清單」，為「負責介面」設計觸發條件、狀態轉換、失敗分類與重試界線、重複處理、介面規格、紀錄需求與驗收情境，建立「通知設計」，同時建立「上游衝突」與「業務規則缺口」；「上游衝突」只在 Phase 4 回報，不修改上游檔案，也不停止產出。
2. `THINK` 比對「憲法檢查清單」的必須／不得規則與「規劃輸入」，列出和 spec、`plan.md` 或技術研究無法同時滿足的項目，建立「憲法衝突」。
3. `DELEGATE` 「業務規則缺口」或「憲法衝突」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以這兩項為優先提問面向、不要求詳記問答紀錄，取得使用者的決定，依決定調整「通知設計」；兩項都為空時略過本步驟與下一步。
4. `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、沒有產出任何檔案，並停止執行；使用者未回覆時停止執行，回報沒有產出任何檔案。

完成條件：「通知設計」已涵蓋每個「負責介面」，「業務規則缺口」與「憲法衝突」都已有使用者決定。

## Phase 4 -- 產出 notification/plan.md

1. `READ` `templates/notification-plan.md` 與 `templates/notification-plan.example.md`，命名為「通知規劃樣板組」。
2. `WRITE` 依「通知規劃樣板組」與「通知設計」，將 `notification/plan.md` 寫入「目標 spec」所在目錄，不建立或修改其他檔案；說明文字語言依「憲法檢查清單」，沒有規定時使用繁體中文，識別字維持原文。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_notification_plan.py --spec-dir <目標 spec 目錄絕對路徑> --interfaces <負責介面編號，以逗號分隔> <notification/plan.md 絕對路徑>`，取得「規劃檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
4. `CHECK` 「規劃檢查結果」沒有 `issues`，逐條驗證「憲法檢查清單」與「通知規劃檢查清單」，比對 `notification/plan.md` 與「通知規劃樣板組」的段落結構並確認沒有殘留的 `{{`；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 3；未通過時修正 `notification/plan.md` 後返回步驟 3，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
5. `WRITE` 向使用者回報 `notification/plan.md` 的路徑、每個「負責介面」的章節、「不在範疇介面」與理由、經 `clarify` 決定的業務規則、「上游衝突」（含處理 Skill，沒有時寫「無」）、`warnings`、「未通過項」（沒有時說明全部通過）與「憲法遵循」（已讀取的憲法檔路徑，都不存在時寫「沒有憲法檔」；必須／不得規則是否全部通過；經 `clarify` 決定的「憲法衝突」），以及下一步：處理「上游衝突」後執行 `tasks`。

完成條件：`notification/plan.md` 已寫入「目標 spec」所在目錄，「規劃檢查結果」、「通知規劃檢查清單」與樣板結構已通過或未通過的項目已記為「未通過項」，且已回報。
