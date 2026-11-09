# 一致性分析報告：設備現場領取與歸還登記及借用狀態檢視 (Equipment Pickup, Return Registration and Loan Status Tracking)

- **Spec 目錄**：`specs/005-equipment-pickup-return/`
- **分析日期**：2026-11-09
- **已分析文件**：`spec.md`、`plan.md`、`tasks.md`、`research.md`、`techstack.md`、`contracts/openapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`、`ui/booking.html`、`ui/my-reservations.html`、`ui/admin.html`
- **已讀取的憲法檔**：`shared.md`、`skills/api-plan/openapi.md`、`skills/data-plan/data-model.md`
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | 不一致 | MEDIUM | `data/data-model.dbml` → `Table time_slots`、`Table equipments`；`contracts/openapi.yaml` → `EquipmentSlotAvailability`、`EquipmentWithSlotAvailability`、`AdminEquipmentSetting` | 已記錄：tasks.md 待確認 1。`time_slots.slot_code` 的註解值為小寫（`morning`、`afternoon`、`evening`）且 `equipments.status` 為 Enum（`available`、`unavailable`），而 `EquipmentSlotAvailability.slotCode` 為大寫（`MORNING`、`AFTERNOON`、`EVENING`）且 `EquipmentWithSlotAvailability`、`AdminEquipmentSetting` 使用布林欄位 `isActive`；兩者可一一對應 | 維持 `tasks.md` T006、T014 與 T016 在後端服務層做欄位與大小寫轉換，或由 `api-plan`／`data-plan` 將 `contracts/openapi.yaml` 與 `data/data-model.dbml` 的欄位名稱及大小寫統一 | `api-plan`（或 `data-plan`） |
| F2 | 不一致 | MEDIUM | `spec.md` → `Key Entities`；`data/data-model.dbml` → `Table reservations`；`contracts/openapi.yaml` → `Reservation`、`AdminReservationItem` | 已記錄：tasks.md 待確認 2。預約編號與領取／歸還經手管理員欄位在規格、資料模型與 API 合約命名不同：預約編號在 `data/data-model.dbml` 的 `Table reservations` 為 `reservation_no`，在 `contracts/openapi.yaml` 的 `Reservation` 與 `AdminReservationItem` 為 `reservationNumber`；經手管理員在 `spec.md` 的 `Key Entities` 為 `checked_out_by_user_id`、`returned_by_user_id`，在 `data/data-model.dbml` 的 `Table reservations` 為 `checked_out_by`、`returned_by`，在 `contracts/openapi.yaml` 的 `Reservation` 與 `AdminReservationItem` 為 `checkedOutByUserId`、`checkedOutByUsername`、`checkedOutByName`、`returnedByUserId`、`returnedByUsername`、`returnedByName`；各欄位皆可一一對應 | 維持 `tasks.md` T010、T013 與 T017 在資料庫層使用 `data/data-model.dbml` 欄位名稱並於後端服務層映射為 `contracts/openapi.yaml` 的回應欄位，或由 `api-plan`／`data-plan`／`s-specify` 統一欄位名稱 | `api-plan`（或 `data-plan`、`s-specify`） |

超過 50 筆的部分：無（共 2 筆，未超過 50 筆）

## 2. 需求涵蓋

| 需求編號 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- |
| FR-001 | 是 | T004、T006、T008、T009、T010、T011、T012、T020 | 見 F2 |
| FR-002 | 是 | T007、T009、T010、T011、T012、T020 | |
| FR-003 | 是 | T007、T011、T012、T014、T020 | |
| FR-004 | 是 | T004、T006、T008、T013、T014、T015、T016、T020 | 見 F2 |
| FR-005 | 是 | T008、T012、T013、T014、T015 | 見 F2 |
| FR-006 | 是 | T006、T008、T017、T019、T020 | 見 F2 |
| FR-007 | 是 | T004、T008、T013、T015、T016、T018、T020 | 見 F1 |
| FR-008 | 是 | T004、T007、T008、T017、T019、T020 | |
| FR-009 | 是 | T001、T004、T005、T006、T007、T009、T011、T012、T013、T014、T015、T016、T017、T018、T019、T020、T022、T023 | 見 F1、F2 |
| NFR-001 | 是 | T007、T008、T010、T012、T015、T017、T018、T019、T021 | |
| NFR-002 | 是 | T010、T013、T015、T016、T017、T019、T020 | |
| SC-001 | 是 | T007、T009、T010、T011、T012、T020、T021、T023 | |
| SC-002 | 是 | T013、T014、T015、T020、T021、T023 | |
| SC-003 | 是 | T016、T017、T018、T019、T020、T021、T023 | |
| SC-004 | 是 | T010、T013、T015、T016、T017、T019、T020、T023 | |
| SC-005 | 是 | T005、T007、T009、T011、T012、T013、T014、T020、T021、T023 | |

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
| F1 驗證碼與帳號密碼登入登出介面 | 前端（使用者 → 前端） | `ui/plan.md` → §1、§3.1；`ui/index.html` | T008、T012 | |
| F2 設備審核標示與單日固定時段借用狀態預約介面 | 前端（使用者 → 前端） | `ui/plan.md` → §1、§3.1；`ui/booking.html` | T008、T018、T019 | |
| F3 成員目前借用中設備醒目區塊、6 態狀態查詢與領取前取消介面 | 前端（使用者 → 前端） | `ui/plan.md` → §1、§3.1；`ui/my-reservations.html` | T008、T018、T019 | |
| F4 管理員設備審核設定、待審核准駁回與現場領取歸還登記介面 | 前端（使用者 → 前端） | `ui/plan.md` → §1、§3.1；`ui/admin.html` | T008、T012、T015 | |
| B1 驗證碼挑戰與登入工作階段 API | 後端（前端 → 後端） | `contracts/openapi.yaml` → `createCaptchaChallenge`、`login`、`getCurrentUser`、`logout` | T007、T010、T011 | |
| B2 設備時段借用狀態查詢與預約申請建立 API | 後端（前端 → 後端） | `contracts/openapi.yaml` → `listEquipments`、`createReservation` | T007、T016、T017 | 見 F1、F2 |
| B3 成員目前借用中與歷史狀態查詢及領取前取消 API | 後端（前端 → 後端） | `contracts/openapi.yaml` → `listMyReservations`、`listMyLoanReservations`、`cancelReservation` | T007、T016、T017 | 見 F2 |
| B4 管理員待審清單、全體借還紀錄查詢與審核核准駁回 API | 後端（前端 → 後端） | `contracts/openapi.yaml` → `listPendingReservations`、`listAllReservations`、`approveReservation`、`rejectReservation` | T007、T013、T014 | 見 F2 |
| B5 管理員現場登記領取與登記歸還 API | 後端（前端 → 後端） | `contracts/openapi.yaml` → `pickupReservationByAdmin`、`returnReservationByAdmin` | T007、T010、T011、T013、T014 | 見 F2 |
| B6 管理員設備人工審核設定切換 API | 後端（前端 → 後端） | `contracts/openapi.yaml` → `listAdminEquipments`、`updateEquipmentApprovalMode` | T007、T013、T014 | 見 F1 |
| D1 帳號、驗證碼挑戰與工作階段資料存取 | 資料庫（後端 → PostgreSQL） | `data/data-model.dbml` → `Table users`、`Table captcha_challenges`、`Table sessions` | T004、T005、T006、T009 | |
| D2 設備審核設定、固定時段與預約借還 6 態紀錄持久化 | 資料庫（後端 → PostgreSQL） | `data/data-model.dbml` → `Table equipments`、`Table time_slots`、`Table reservations` | T004、T005、T006、T009 | 見 F1、F2 |

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

- T002（Phase 1 Setup）：確認後端 `package.json`、`tsconfig.json` 與 `prisma.config.ts` 套件與腳本設定。
- T003（Phase 1 Setup）：確認前端 `package.json`、`tsconfig.json`、`vite.config.ts` 與 `playwright.config.ts` 設定。

## 6. 統計

| 項目 | 數字 |
| --- | --- |
| 需求總數 | 16 |
| 有任務的需求數 | 16 |
| 涵蓋率 | 100% |
| 任務總數 | 23 |
| 介面總數 | 12 |
| 沒有 Planner 產出的介面數 | 0 |
| 沒有任務的介面數 | 0 |

## 7. 下一步

- 沒有 CRITICAL 或 HIGH 問題，可以直接進入 `implement` 依 `tasks.md` 實作。
- 2 筆 MEDIUM 問題（F1、F2）皆已有明確的一一對應與欄位映射做法（`tasks.md` T006、T010、T013、T014、T016、T017 已涵蓋），若希望上游文件字面完全一致，可選用 `api-plan`、`data-plan` 或 `s-specify` 對齊。
