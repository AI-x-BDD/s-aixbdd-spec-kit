# 一致性分析報告：逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查 (Overdue Discord Notification)

- **Spec 目錄**：`specs/008-overdue-discord-notification/`
- **分析日期**：2026-11-12
- **已分析文件**：`spec.md`、`plan.md`、`tasks.md`、`research.md`、`techstack.md`、`contracts/openapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`、`ui/overdue-notifications.html`、`notification/plan.md`
- **已讀取的憲法檔**：`shared.md`、`skills/api-plan/openapi.md`、`skills/data-plan/data-model.md`
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | 沒有發現問題 | — | — |

超過 50 筆的部分：無（共 0 筆）

## 2. 需求涵蓋

| 需求編號 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- |
| FR-001 | 是 | T009、T012、T013、T031 | |
| FR-002 | 是 | T012、T013、T031 | |
| FR-003 | 是 | T017、T019、T020、T021、T023、T025、T040、T041 | |
| FR-004 | 是 | T017、T019、T021、T023、T040、T041 | |
| FR-005 | 是 | T011、T018、T019、T021、T024、T033、T041 | |
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
| FR-015 | 是 | T006、T007、T008、T011、T031、T034 | |
| FR-016 | 是 | T007、T008、T011、T031 | |
| FR-017 | 是 | T003、T007、T011、T023、T031 | |
| FR-018 | 是 | T004、T009、T011、T018、T024、T026、T032 | |
| FR-019 | 是 | T019、T023、T025、T026、T029、T035 | |
| FR-020 | 是 | T003、T004、T005、T014、T015、T016、T025、T030、T036、T038、T039 | |
| FR-021 | 是 | T003、T011、T012、T031 | |
| NFR-002 | 是 | T010、T016、T020、T023、T027、T035 | |
| NFR-003 | 是 | T002、T003、T006、T007、T008、T017、T020、T023、T030、T034 | |
| SC-001 | 是 | T012、T031 | |
| SC-002 | 是 | T008、T032 | |
| SC-003 | 是 | T008、T031 | |
| SC-004 | 是 | T018、T033 | |
| SC-005 | 是 | T033 | |
| SC-006 | 是 | T034 | |
| SC-007 | 是 | T014、T035、T038 | |

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
| F1 管理員「逾期通知紀錄」頁籤的通知清單與狀態篩選介面 | 前端 | `ui/plan.md` → §1 畫面範疇、§3.1 頁面清單 | T020、T021、T022、T023、T024、T025 | T040、T041 也實作 F1 的換頁與改載最後一頁，但位於 Polish、沒有放在介面分組，涵蓋盤點沒有計入；`tasks.md` Notes 待確認 4 與 T041 的新增原因已說明，不列為問題 |
| F2 通知重送操作與「結果不明」確認視窗介面 | 前端 | `ui/plan.md` → §1 畫面範疇、§3.1 頁面清單 | T020、T021、T022、T023、T024、T025 | 重送後停在目前頁碼由 T041 實作 |
| F3 「立即檢查逾期」操作與建立數量提示介面 | 前端 | `ui/plan.md` → §1 畫面範疇、§3.1 頁面清單 | T027、T028、T029 | |
| F4 前五版成員與管理員既有畫面（登入、設備預約、我的預約、管理員總覽） | 前端 | `ui/plan.md` → §1 畫面範疇、§3.1 頁面清單 | T020、T021、T022、T023、T024、T025 | |
| B1 逾期通知紀錄查詢 API | 後端 | `contracts/openapi.yaml` → `listOverdueNotifications` | T016、T017、T018、T019 | |
| B2 通知重送 API | 後端 | `contracts/openapi.yaml` → `resendOverdueNotification` | T016、T017、T018、T019 | |
| B3 手動逾期檢查 API | 後端 | `contracts/openapi.yaml` → `runOverdueCheck` | T026 | |
| B4 前五版既有 API（驗證碼登入、設備與時段、預約、改期、審核、領取歸還、設備狀態） | 後端 | `contracts/openapi.yaml` → `createCaptchaChallenge`、`login`、`getCurrentUser` 等 24 個 operation | T016、T017、T018、T019 | |
| D1 逾期通知紀錄持久化 | 資料庫 | `data/data-model.dbml` → `Table overdue_notifications` | T003、T004、T005、T015 | |
| D2 前五版帳號、設備、固定時段、預約借還、改期與設備狀態變更資料存取與無損遷移 | 資料庫 | `data/data-model.dbml` → `Table users`、`Table captcha_challenges`、`Table sessions`、`Table equipments`、`Table equipment_status_changes`、`Table time_slots`、`Table reservations`、`Table reschedule_requests` | T003、T004、T005、T015 | |
| S1 逾期自動檢查排程 | 排程 | `notification/plan.md` → §5.1 | T006～T014 | |
| S2 通知送出與自動重試程序 | 排程 | `notification/plan.md` → §5.2 | T006～T014 | |
| S3 系統恢復運作時中斷通知的處理 | 排程 | `notification/plan.md` → §5.3 | T006～T014 | |
| N1 Discord Webhook 逾期通知送出 | 通知服務 | `notification/plan.md` → §5.4 | T006～T014 | |
| N2 本機 Discord Webhook 模擬器 | 通知服務 | `notification/plan.md` → §5.5 | T006～T014 | |

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
| 任務總數 | 41 |
| 介面總數 | 15 |
| 沒有 Planner 產出的介面數 | 0 |
| 沒有任務的介面數 | 0 |

## 7. 下一步

- 沒有 CRITICAL 問題，也沒有其他嚴重度的問題，可以繼續 `implement`。
- 上一版的 F1 已解決：`tasks.md` Notes「T041 新增」已改寫為「plan.md 的 Source Code 已列出本次新增的 `overdueNotificationsPaging.test.ts`（T041）」，與 `plan.md` Source Code 樹的 `frontend/tests/unit/` 一致，並保留新增原因與 `e2e/` 維持不新增的說明。
- 上一版的 F2 已解決：`notification/plan.md` §5.5「沒有對應模式的分類」與 §8 `UC2` 都已寫明「`plan.md` 的 `backend/tests/unit/` 本次不新增」，與 `plan.md` Source Code 樹的 `backend/tests/unit/` 一致。
- 這兩處修改沒有造成新的不一致：`tasks.md` T031 與 Notes 待確認 2、`notification/plan.md` §5.5、NS11、NS15、`UC2`、`plan.md` 的 `backend/tests/integration/` 與 `research.md` §6 對「4 類沒有模擬器模式的回應以 `node:http` 臨時固定回應位址經 `discordWebhookClient.send` 驗證」的說法一致。
