# 一致性分析報告：設備借用與預約系統 (Equipment Loan and Booking System)

- **Spec 目錄**：`specs/003-equipment-loan-booking/`
- **分析日期**：2026-11-08
- **已分析文件**：`spec.md`、`plan.md`、`tasks.md`、`research.md`、`techstack.md`、`contracts/openapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`、`ui/booking.html`、`ui/my-reservations.html`、`ui/admin.html`
- **已讀取的憲法檔**：`shared.md`、`skills/api-plan/openapi.md`、`skills/data-plan/data-model.md`
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | 不一致 | MEDIUM | `data/data-model.dbml` → `Table time_slots`、`Table equipments`；`contracts/openapi.yaml` → `EquipmentSlotAvailability`、`EquipmentWithSlotAvailability` | 已記錄：tasks.md 待確認 1。`time_slots.slot_code` 的註解值為小寫（`morning`、`afternoon`、`evening`）且 `equipments.status` 為 Enum（`available`、`unavailable`），而 `EquipmentSlotAvailability.slotCode` 為大寫（`MORNING`、`AFTERNOON`、`EVENING`）且 `EquipmentWithSlotAvailability` 使用布林欄位 `isActive`；兩者可一一對應 | 維持 `tasks.md` T009 與 T018 在後端服務層做欄位與大小寫轉換，或由 `api-plan`／`data-plan` 將 `contracts/openapi.yaml` 與 `data/data-model.dbml` 的欄位名稱及大小寫統一 | `api-plan`（或 `data-plan`） |
| F2 | 不一致 | MEDIUM | `data/data-model.dbml` → `Table reservations`；`contracts/openapi.yaml` → `Reservation`、`AdminReservationItem` | 已記錄：tasks.md 待確認 2。預約編號在 `data/data-model.dbml` 的 `Table reservations` 命名為 `reservation_no`，在 `contracts/openapi.yaml` 的 `Reservation` 與 `AdminReservationItem` 命名為 `reservationNumber`；兩者可一一對應 | 維持 `tasks.md` T019、T024、T028 在後端服務層將 `reservation_no` 映射為 `reservationNumber`，或由 `api-plan`／`data-plan` 統一命名 | `api-plan`（或 `data-plan`） |
| F3 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `createReservation` 的 `EQUIPMENT_UNAVAILABLE`、`RESOURCE_NOT_FOUND`；`ui/plan.md` → §5 | `contracts/openapi.yaml` 的 `createReservation` 與 `cancelReservation` 定義了 `EQUIPMENT_UNAVAILABLE`（設備目前不可用）與 `RESOURCE_NOT_FOUND`（設備、固定時段或預約紀錄不存在）錯誤碼，但 `ui/plan.md` §5 未單獨列出這兩個錯誤碼的表格列（`tasks.md` T014 已將兩者納入 `frontend/src/text/zh-TW.ts` 錯誤碼對應表） | 在 `ui/plan.md` §5 補上 `EQUIPMENT_UNAVAILABLE` 與 `RESOURCE_NOT_FOUND` 對應的錯誤回饋說明列 | `ui-plan` |

超過 50 筆的部分：無（共 3 筆，未超過 50 筆）

## 2. 需求涵蓋

| 需求編號 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- |
| FR-001 | 是 | T007、T017、T020、T021 | |
| FR-002 | 是 | T007、T009、T012、T014、T015、T016、T017、T020、T021、T023 | |
| FR-003 | 是 | T007、T009、T010、T016、T018、T020、T022 | 見 F1 |
| FR-004 | 是 | T010、T018、T019、T020、T022 | 見 F3 |
| FR-005 | 是 | T007、T019、T020、T022 | |
| FR-006 | 是 | T024、T025、T026、T027 | 見 F2 |
| FR-007 | 是 | T007、T010、T024、T025、T026、T027 | |
| FR-008 | 是 | T010、T024、T025、T026 | |
| FR-009 | 是 | T028、T029、T030、T031 | 見 F2 |
| FR-010 | 是 | T012、T028、T029、T030、T031 | |
| FR-011 | 是 | T007、T009、T016、T034 | |
| NFR-001 | 是 | T011、T014、T015、T021、T022、T026、T030、T033 | |
| NFR-002 | 是 | T018、T028、T032 | |
| SC-001 | 是 | T017、T021、T032 | |
| SC-002 | 是 | T019、T032 | |
| SC-003 | 是 | T024、T032 | |
| SC-004 | 是 | T017、T018、T019、T024、T032 | |
| SC-005 | 是 | T012、T024、T029、T030、T032 | |

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
| F1 驗證碼與帳號密碼登入登出介面 | 前端（使用者 → 前端） | `ui/plan.md` → §1、§3.1；`ui/index.html` | T014、T015、T021、T022、T023 | |
| F2 設備清單與單日固定時段預約介面 | 前端（使用者 → 前端） | `ui/plan.md` → §1、§3.1；`ui/booking.html` | T014、T015、T021、T022、T023 | 見 F3 |
| F3 成員個人預約查詢與取消介面 | 前端（使用者 → 前端） | `ui/plan.md` → §1、§3.1；`ui/my-reservations.html` | T014、T015、T026、T027 | |
| F4 管理員設備與全體成員預約檢視介面 | 前端（使用者 → 前端） | `ui/plan.md` → §1、§3.1；`ui/admin.html` | T014、T015、T030、T031 | |
| B1 驗證碼挑戰與登入工作階段 API | 後端（前端 → 後端） | `contracts/openapi.yaml` → `createCaptchaChallenge`、`login`、`getCurrentUser`、`logout` | T009、T010、T011、T012、T013、T017、T018、T019、T020 | |
| B2 設備與單日固定時段預約 API | 後端（前端 → 後端） | `contracts/openapi.yaml` → `listEquipments`、`createReservation` | T009、T010、T011、T012、T013、T017、T018、T019、T020 | 見 F1、F2、F3 |
| B3 成員個人預約查詢與取消 API | 後端（前端 → 後端） | `contracts/openapi.yaml` → `listMyReservations`、`cancelReservation` | T009、T010、T011、T012、T013、T024、T025 | 見 F2 |
| B4 管理員全體預約查詢 API | 後端（前端 → 後端） | `contracts/openapi.yaml` → `listAllReservations` | T009、T010、T011、T012、T013、T028、T029 | 見 F2 |
| D1 帳號、驗證碼挑戰與工作階段資料存取 | 資料庫（後端 → PostgreSQL） | `data/data-model.dbml` → `Table users`、`Table captcha_challenges`、`Table sessions` | T007、T008、T016 | |
| D2 設備、固定時段與預約紀錄持久化 | 資料庫（後端 → PostgreSQL） | `data/data-model.dbml` → `Table equipments`、`Table time_slots`、`Table reservations` | T007、T008、T016 | 見 F1、F2 |

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

- T001（Phase 1 Setup）：建立 `apps/equipment-loan/` 前後端與 E2E 目錄結構及 `.gitignore`。
- T002（Phase 1 Setup）：初始化後端 `package.json` 與 `tsconfig.json`。
- T003（Phase 1 Setup）：初始化前端 `package.json`、`tsconfig.json` 與 `vite.config.ts`。
- T004（Phase 1 Setup）：設定 `docker-compose.yml`（PostgreSQL 18）與 `.env.example`。
- T005（Phase 1 Setup）：設定前後端 ESLint 10 與 Prettier 靜態檢查。
- T006（Phase 1 Setup）：設定 Vitest 5、Supertest 7 與 Playwright 1.65 測試工具。
- T008（Phase 2 Foundational）：建立 Prisma Client 單例並驗證初始資料庫遷移。
- T013（Phase 2 Foundational）：建立 Express 5 應用程式骨架與伺服器啟動入口。
- T035（Phase 6 Polish）：執行全專案靜態檢查、型別檢查、demo seed 重設與全套自動化測試。

## 6. 統計

| 項目 | 數字 |
| --- | --- |
| 需求總數 | 18 |
| 有任務的需求數 | 18 |
| 涵蓋率 | 100% |
| 任務總數 | 35 |
| 介面總數 | 10 |
| 沒有 Planner 產出的介面數 | 0 |
| 沒有任務的介面數 | 0 |

## 7. 下一步

- 沒有 CRITICAL 或 HIGH 問題，可以直接進入 `implement` 依 `tasks.md` 實作。
- 3 筆 MEDIUM 問題（F1、F2、F3）皆已有明確的一一對應與錯誤碼對應做法（`tasks.md` T009、T014、T018、T019、T024、T028 已涵蓋），若希望上游文件字面完全一致，可選用 `api-plan`、`data-plan` 或 `ui-plan` 對齊。
