# 一致性分析報告：逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查 (Overdue Discord Notification)

- **Spec 目錄**：`specs/008-overdue-discord-notification/`
- **分析日期**：2026-11-11
- **已分析文件**：`spec.md`、`plan.md`、`tasks.md`、`research.md`、`techstack.md`、`contracts/openapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`、`ui/overdue-notifications.html`、`notification/plan.md`
- **已讀取的憲法檔**：`shared.md`、`skills/api-plan/openapi.md`、`skills/data-plan/data-model.md`
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | 不一致 | HIGH | `ui/plan.md` → §1 的「管理員登入後的入口改到逾期通知紀錄」、§4 `index.html` 的「管理員登入成功」；`plan.md` → `App.tsx`；`research.md` → §7 | 已記錄：tasks.md 待確認 3。`ui/plan.md` 寫管理員登入後的入口改到逾期通知紀錄，並在登入成功卡片放「前往逾期通知紀錄」；`plan.md` 的 `App.tsx` 與 `research.md` §7 只寫新增「逾期通知紀錄」管理員頁籤，沒有改變登入後的頁面。兩種讀法會做出不同的登入後行為，前版 e2e 也依賴管理員登入後進入設備狀態管理 | 維持登入後進入設備狀態管理時，在 `ui/plan.md` §1 寫明只有雛形 `index.html` 的入口改到逾期通知紀錄，實際系統只新增頁籤；要改變登入後頁面時，在 `plan.md` 的 `App.tsx` 與 `research.md` §7 寫出新的預設頁面，並在 `tasks.md` 排入更新前版 e2e 的任務 | 需要使用者決定（候選：`ui-plan`、`system-analysis`） |
| C1 | 不足 | MEDIUM | `research.md` → §6；`notification/plan.md` → §8 UC2 | 已記錄：tasks.md 待確認 2。模擬器的 6 種模式無法重現其他 `4xx`（`message_rejected`）、`401`／`403`（`webhook_invalid`）、`200` 沒有 `id` 與沒有等待秒數的 `429`；這幾類只能把回應直接交給分類函式驗證，整合測試與手動展示無法重現 FR-015 的「Discord 拒絕這則訊息的內容」 | 在 `research.md` §6 的模式表決定是否新增可設定狀態碼與回應內容的模式（例如任意 `4xx`、`200` 不帶 `id`、`429` 不帶等待秒數）；不新增時，在 §6 寫明這幾類以分類函式驗證 | `technical-research` |
| F2 | 不一致 | MEDIUM | `ui/overdue-notifications.html` → `failureReasons`；`data/data-model.dbml` → `Enum overdue_notification_failure_reason`；`contracts/openapi.yaml` → `OverdueNotificationFailureReason` | 已記錄：tasks.md 待確認 1。`connection_failed`、`webhook_not_configured`、`message_rejected` 的畫面文字在雛形寫「無法連線到 Discord」「通知設定有誤：沒有設定 Webhook」「Discord 拒絕這則訊息的內容」，資料模型與合約寫「無法連線」「通知設定有誤：沒有設定」「Discord 拒絕訊息內容」；可以一一對應，`ui/plan.md` 沒有列出這 3 個原因的文字 | 在 `ui/plan.md` §5 列出 6 種失敗原因的畫面文字並決定採用的寫法，同步 `ui/overdue-notifications.html` 的 `failureReasons`；若改用雛形的寫法，再交 `data-plan`、`api-plan` 同步 Enum 說明 | `ui-plan` |
| F3 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `listOverdueNotifications`；`ui/plan.md` → §4 `overdue-notifications.html` 的「通知清單」 | 已記錄：tasks.md 待確認 4。`listOverdueNotifications` 分頁（`pageSize` 預設 20、上限 100），`ui/plan.md` 只顯示「共 8 則通知」，沒有規劃換頁控制項，也沒有說明通知超過一頁時的呈現；通知超過 100 則時，FR-003 要列出的每則通知無法全部看到 | 在 `ui/plan.md` §3.3 與 §4 加上換頁操作與狀態（例如上一頁、下一頁與目前頁碼），並同步 `ui/overdue-notifications.html` 的雛形狀態 | `ui-plan` |
| F4 | 不一致 | MEDIUM | `plan.md` → `e2e/`；`research.md` → §8；`tasks.md` → **Tests** | `plan.md` Source Code 的 `e2e/` 與 `tests/unit/` 以及 `research.md` §8 規劃了逾期通知紀錄、重送、確認視窗、立即檢查逾期的端對端測試，以及時區、回應分類、通知內容的單元測試；`tasks.md` 依 spec 沒有要求測試，只在 Polish 以整合測試驗證 SC，沒有任務建立新的 e2e 與單元測試 | 要保留 `plan.md` 與 `research.md` §8 的測試規劃時，在 `tasks.md` 的 Polish 加入新的 e2e 與單元測試任務；要以 `tasks.md` 為準時，在 `plan.md` 的 `e2e/`、`tests/unit/` 說明與 `research.md` §8 刪去新功能的 e2e 與單元測試 | 需要使用者決定（候選：`tasks`、`system-analysis`、`technical-research`） |
| F5 | 不一致 | LOW | `plan.md` → Documentation (this feature)；`notification/plan.md` → 負責介面 | `plan.md` 的 Documentation 樹沒有列出 `notification/plan.md` 與 `ui/overdue-notifications.html`，但兩份文件都已產出，S1～S3、N1、N2 的規格在 `notification/plan.md` | 在 `plan.md` Documentation 樹加上 `notification/plan.md`（S1～S3、N1、N2 的通知可靠性規劃）與 `ui/overdue-notifications.html` | `system-analysis` |

超過 50 筆的部分：無（共 6 筆，未超過 50 筆）

## 2. 需求涵蓋

| 需求編號 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- |
| FR-001 | 是 | T009、T012、T013、T031 | |
| FR-002 | 是 | T012、T013、T031 | |
| FR-003 | 是 | T017、T019、T020、T021、T023、T025 | 見 F3 |
| FR-004 | 是 | T017、T019、T021、T023 | |
| FR-005 | 是 | T011、T018、T019、T021、T024、T033 | |
| FR-006 | 是 | T020、T022、T024 | |
| FR-007 | 是 | T016、T018、T024 | |
| FR-008 | 是 | T016、T017、T018、T020、T023、T024 | |
| FR-009 | 是 | T009、T026、T028、T029 | |
| FR-010 | 是 | T026、T027、T028、T029 | |
| NFR-001 | 是 | T026、T029、T033 | |
| FR-011 | 是 | T009 | |
| FR-012 | 是 | T003、T009、T017、T023、T026、T029、T032 | |
| FR-013 | 是 | T010、T031 | |
| FR-014 | 是 | T007、T008、T011、T031 | |
| FR-015 | 是 | T006、T007、T008、T011、T031、T034 | 見 C1、F2 |
| FR-016 | 是 | T007、T008、T011、T031 | |
| FR-017 | 是 | T003、T007、T011、T023、T031 | |
| FR-018 | 是 | T004、T009、T011、T018、T024、T026、T032 | |
| FR-019 | 是 | T019、T023、T025、T026、T029、T035 | |
| FR-020 | 是 | T003、T004、T005、T014、T015、T016、T025、T030、T036、T038、T039 | 見 F1 |
| FR-021 | 是 | T003、T011、T012、T031 | |
| NFR-002 | 是 | T010、T016、T020、T023、T027、T035 | 見 F2 |
| NFR-003 | 是 | T002、T003、T006、T007、T008、T017、T020、T023、T030、T034 | |
| SC-001 | 是 | T012、T031 | |
| SC-002 | 是 | T008、T032 | |
| SC-003 | 是 | T008、T031 | 見 C1 |
| SC-004 | 是 | T018、T033 | |
| SC-005 | 是 | T033 | |
| SC-006 | 是 | T034 | |
| SC-007 | 是 | T014、T035、T038 | |

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
| F1 管理員「逾期通知紀錄」頁籤的通知清單與狀態篩選介面 | 前端 | `ui/plan.md` → §1 畫面範疇、§3.1 頁面清單 | T020、T021、T022、T023、T024、T025 | 見 F2、F3 |
| F2 通知重送操作與「結果不明」確認視窗介面 | 前端 | `ui/plan.md` → §1 畫面範疇、§3.1 頁面清單 | T020、T021、T022、T023、T024、T025 | |
| F3 「立即檢查逾期」操作與建立數量提示介面 | 前端 | `ui/plan.md` → §1 畫面範疇、§3.1 頁面清單 | T027、T028、T029 | |
| F4 前五版成員與管理員既有畫面（登入、設備預約、我的預約、管理員總覽） | 前端 | `ui/plan.md` → §1 畫面範疇、§3.1 頁面清單 | T020、T021、T022、T023、T024、T025 | 見 F1 |
| B1 逾期通知紀錄查詢 API | 後端 | 涵蓋盤點：無（以 `grep -n` 確認有 `contracts/openapi.yaml` → `listOverdueNotifications`） | T016、T017、T018、T019 | 涵蓋盤點沒有解析到 operation 的 `tags`：合約的 `tags` 清單項目與 `tags:` 同一縮排，`collect_coverage.py` 讀不到；不列為問題。見 F3 |
| B2 通知重送 API | 後端 | 涵蓋盤點：無（以 `grep -n` 確認有 `contracts/openapi.yaml` → `resendOverdueNotification`） | T016、T017、T018、T019 | 同 B1 的涵蓋盤點限制，不列為問題 |
| B3 手動逾期檢查 API | 後端 | 涵蓋盤點：無（以 `grep -n` 確認有 `contracts/openapi.yaml` → `runOverdueCheck`） | T026 | 同 B1 的涵蓋盤點限制，不列為問題 |
| B4 前五版既有 API（驗證碼登入、設備與時段、預約、改期、審核、領取歸還、設備狀態） | 後端 | 涵蓋盤點：無（以 `grep -n` 確認 `contracts/openapi.yaml` 有 `login`、`listEquipments` 等 25 個 B4 operation） | T016、T017、T018、T019 | 同 B1 的涵蓋盤點限制，不列為問題 |
| D1 逾期通知紀錄持久化 | 資料庫 | `data/data-model.dbml` → `Table overdue_notifications` | T003、T004、T005、T015 | |
| D2 前五版帳號、設備、固定時段、預約借還、改期與設備狀態變更資料存取與無損遷移 | 資料庫 | `data/data-model.dbml` → `Table users`、`Table captcha_challenges`、`Table sessions`、`Table equipments`、`Table equipment_status_changes`、`Table time_slots`、`Table reservations`、`Table reschedule_requests` | T003、T004、T005、T015 | |
| S1 逾期自動檢查排程 | 排程 | `notification/plan.md` → §5.1 | T006～T014 | |
| S2 通知送出與自動重試程序 | 排程 | `notification/plan.md` → §5.2 | T006～T014 | |
| S3 系統恢復運作時中斷通知的處理 | 排程 | `notification/plan.md` → §5.3 | T006～T014 | |
| N1 Discord Webhook 逾期通知送出 | 通知服務 | `notification/plan.md` → §5.4 | T006～T014 | 見 C1 |
| N2 本機 Discord Webhook 模擬器 | 通知服務 | `notification/plan.md` → §5.5 | T006～T014 | 見 C1 |

## 4. 憲法遵循

| 憲法檔 | Rule | 適用產出物 | 結果 | 問題 ID |
| --- | --- | --- | --- | --- |
| `shared.md` | Rule 1 文件的說明文字必須使用繁體中文 | `spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/plan.md`、`contracts/openapi.yaml`、`data/data-model.dbml`、`tasks.md` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 1 查詢清單的 operation 必須以 page 與 pageSize 分頁 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 2 分頁 operation 的成功回應必須包含分頁資訊 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 3 分頁參數不合法時必須回應 400 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 4 page 超過總頁數時必須回應空的 items | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 5 分頁 operation 必須寫出排序依據 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 6 需要驗證身分或權限的 operation 必須分別定義 401 與 403 錯誤回應 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 7 時間點與純日期欄位必須使用 ISO 8601 格式並以 Asia/Taipei 為業務時區 | `contracts/openapi.yaml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 1 每張資料表必須有生命週期欄位 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 2 刪除資料必須使用軟刪除 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 3 時間點與純日期欄位必須分別使用 timestamptz 與 date 型別 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 4 唯一性約束與業務歷程保留必須明確定義 | `data/data-model.dbml` | 通過 | — |

## 5. 沒有對應需求的任務

- T001（Phase 1 Setup）：修改後端 `package.json` 的 `dev`、`db:seed` 並新增 `discord:sim`。
- T037（Phase 6 Polish）：執行 `npm run check`，修正靜態檢查錯誤。

## 6. 統計

| 項目 | 數字 |
| --- | --- |
| 需求總數 | 31 |
| 有任務的需求數 | 31 |
| 涵蓋率 | 100% |
| 任務總數 | 39 |
| 介面總數 | 15 |
| 沒有 Planner 產出的介面數 | 4 |
| 沒有任務的介面數 | 0 |

## 7. 下一步

- 沒有 CRITICAL 問題，可以繼續 `implement`。
- 「沒有 Planner 產出的介面數」4 是涵蓋盤點的解析限制（B1～B4 的合約 operation 都存在，見「介面涵蓋」備註），不需要補產出。
- 建議先處理 F1：由使用者決定管理員登入後的頁面，再交 `ui-plan` 或 `system-analysis` 修正；決定前 `implement` 依 `tasks.md` 待確認 3 的暫行做法。
- 建議一併處理 C1（`technical-research`）、F2、F3（`ui-plan`）與 F4（需要使用者決定）；F5 可以之後再交 `system-analysis` 處理。
