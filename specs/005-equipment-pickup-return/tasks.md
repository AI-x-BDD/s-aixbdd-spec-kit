---

description: "Task list for 設備現場領取與歸還登記及借用狀態檢視 implementation"
---

# Tasks: 設備現場領取與歸還登記及借用狀態檢視 (Equipment Pickup, Return Registration and Loan Status Tracking)

**Input**: Design documents from `/specs/005-equipment-pickup-return/`（依下方 Reference Loading Contract 按任務載入）

**Tests**: spec.md 沒有明確要求撰寫測試或採用 TDD，因此各使用者故事 Phase 不產生獨立測試任務。Setup 依 research §4、§5 確認既有 Vitest 5、Supertest 7 與 Playwright 1.65 測試工具設定，並在 Polish Phase 執行 SC-001～SC-005 的量測、前兩次迭代既有功能回歸與端對端驗證任務。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. 每個階段內再依 plan.md「系統介面盤點」的技術端點（資料庫、後端、前端）分組，標題列出該組實作的介面編號；每個任務下方以 Must Read／Optional 列出執行時要讀的文件部位。

## Reference Loading Contract

執行本檔的任務時，依下列規則載入 `/specs/005-equipment-pickup-return/` 的文件：

1. 開工前只讀本檔，不預先讀 spec package 的其他文件。
2. 每個任務下方列出它的參考，分兩級：
   - **Must Read**：開始這個任務前一定要讀完的部位。
   - **Optional**：只在遇到該項 Why 描述的情況時才讀。
3. 每項參考寫成 `` `檔案` → 部位 — Why：理由 ``。Why 說明這個部位決定任務的哪一部分，讀的時候以它為重點。
4. 只讀列出的部位，不讀整份文件。部位以文件內可搜尋的識別字定位：
   - `contracts/openapi.yaml`：operationId，或 `components` 底下的 schema、response 名稱
   - `data/data-model.dbml`：`Table`、`Enum`、`Ref`
   - `spec.md`：US 情境、FR／NFR／SC 編號、Edge Cases 項目
   - `research.md`、`ui/plan.md`：章節編號（§），以及表格中的畫面、狀態或操作編號
   - `techstack.md`、`plan.md`：章節標題
   - `ui/*.html`：雛形右下角「雛形狀態」面板的狀態名稱
5. 部位內有 `$ref` 或引用其他部位時，順著讀到被引用的部位。
6. Must Read 與任務描述矛盾時，停下來回報，不自行決定。
7. 讀完 Must Read 與 Optional 仍缺資訊時，回報缺少什麼，不為了補資訊讀完整份文件。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `apps/equipment-loan/backend/src/`、`apps/equipment-loan/frontend/src/`（依 plan.md 的 Structure Decision）
- Docker Compose、啟動說明 `README.md` 與跨前後端 Playwright E2E 測試放在 `apps/equipment-loan/` 頂層；Prisma schema、migrations 與 demo seed 放在 `apps/equipment-loan/backend/prisma/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 依 plan.md 的 Source Code 確認 `apps/equipment-loan/`、`apps/equipment-loan/frontend/`、`apps/equipment-loan/backend/` 與 `apps/equipment-loan/e2e/` 目錄結構與 `apps/equipment-loan/docker-compose.yml`（PostgreSQL 18）、`apps/equipment-loan/backend/.env.example` 設定齊備（FR-009、research §1、§4）
  - **Must Read**
    - `plan.md` → `Source Code (repository root)` — Why：前後端與資料庫遷移、測試目錄配置
    - `research.md` → §1、§4 — Why：沿用 `apps/equipment-loan/` 結構與 PostgreSQL 18 Docker Compose 環境
- [X] T002 [P] 確認 `apps/equipment-loan/backend/package.json`、`apps/equipment-loan/backend/tsconfig.json` 與 `apps/equipment-loan/backend/prisma.config.ts` 的後端套件與腳本設定：TypeScript 6.0、Node.js 24 LTS 以上、`express`（Express 5）、`zod`（zod 4）、`@prisma/client`、`@prisma/adapter-pg`、`pg`、`prisma`（Prisma 7.10）、`tsx`、ESLint 10、Prettier、Vitest 5 與 Supertest 7，且不引入 `redis`、`xstate`、`socket.io`、`luxon`、`moment`、`bcrypt`、`express-session`、`jsonwebtoken`（research §1、§2、§4、§5）
  - **Must Read**
    - `techstack.md` → `技術堆疊總覽` — Why：後端與資料庫、測試工具採用的版本
    - `techstack.md` → `本次開發不引入的技術` — Why：確認不得安裝的後端套件類別
    - `research.md` → §2、§4、§5 — Why：後端執行環境、驗證與測試工具鏈設定
- [X] T003 [P] 確認 `apps/equipment-loan/frontend/package.json`、`apps/equipment-loan/frontend/tsconfig.json`、`apps/equipment-loan/frontend/vite.config.ts` 與 `apps/equipment-loan/playwright.config.ts` 的前端與 E2E 設定：React 19、Vite 8（含 `/api` 代理至 `http://localhost:3000`）、`@vitejs/plugin-react` 6、TypeScript 6.0、ESLint 10、Prettier、Vitest 5 與 `@playwright/test` 1.65，且不引入 `react-router`、`zustand`、`@reduxjs/toolkit`、`react-i18next`（research §3、§4、§5）
  - **Must Read**
    - `techstack.md` → `技術堆疊總覽` — Why：前端與端對端測試採用的技術與版本
    - `techstack.md` → `本次開發不引入的技術` — Why：確認不得安裝的前端路由、狀態管理與國際化套件
    - `research.md` → §3、§5 — Why：前端架構與 Playwright E2E 測試設定

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 資料庫（D1–D2 共用）

- [X] T004 在 `apps/equipment-loan/backend/prisma/schema.prisma` 擴充 D2 資料模型（保留 `previewFeatures = ["partialIndexes"]` 與 D1 的 `users`、`captcha_challenges`、`sessions`）：將 `reservation_status` Enum 擴充為 6 個值（`pending_approval`、`confirmed`、`checked_out`、`returned`、`rejected`、`cancelled`）；在 `reservations` 新增 `checked_out_by`（`Uuid`，可為空，外鍵關聯 `users.id`）、`checked_out_at`（`Timestamptz(6)`，可為空）、`returned_by`（`Uuid`，可為空，外鍵關聯 `users.id`）、`returned_at`（`Timestamptz(6)`，可為空）；升級兩條 PostgreSQL 部分唯一索引 `uq_reservations_active_slot`（`UNIQUE (equipment_id, reservation_date, slot_id) WHERE status IN ('confirmed', 'checked_out', 'returned') AND deleted_at IS NULL`）與 `uq_reservations_user_active_request`（`UNIQUE (user_id, equipment_id, reservation_date, slot_id) WHERE status IN ('pending_approval', 'confirmed', 'checked_out') AND deleted_at IS NULL`），並確認 `idx_reservations_status_date_slot`、`idx_reservations_user_date_created`、`idx_reservations_date_slot_created`、`idx_reservations_date_equipment_status` 索引齊備（FR-001、FR-004、FR-007、FR-008、FR-009、research §1）
  - **Must Read**
    - `data/data-model.dbml` → `Enum reservation_status`、`Table equipments`、`Table time_slots`、`Table reservations` — Why：6 態狀態 Enum、領取／歸還稽核欄位、關聯外鍵與升級後的雙重部分唯一索引定義
    - `research.md` → §1 — Why：`uq_reservations_active_slot` 納入 `checked_out` 與 `returned`、`uq_reservations_user_active_request` 納入 `checked_out` 的設計與無損擴充方式
- [X] T005 在 `apps/equipment-loan/backend/prisma/migrations/` 建立並執行增量無損 Prisma migration，將既有 PostgreSQL 18 資料庫升級至 6 態借還結構與升級後的雙重部分唯一索引，確認前兩次迭代既有的 `pending_approval`、`confirmed`、`rejected`、`cancelled` 預約紀錄、預建設備與帳號 100% 無損遷移保留，並重新產生 Prisma Client（FR-009、SC-005、research §1）
  - **Must Read**
    - `research.md` → §1 — Why：增量無損遷移步驟，確保前兩版既有預約資料列不遺失且不被重設
    - `spec.md` → FR-009、SC-005 — Why：無損遷移既有預約資料與向下相容前兩次迭代功能的要求
- [X] T006 在 `apps/equipment-loan/backend/prisma/seed.ts` 擴充可重複執行的 demo seed 腳本：保留預建一般成員帳號 `lin.yating`（林雅婷）、`chen.guanting`（陳冠廷）、管理員帳號 `wu.chenghan`（吳承翰）、4 台預建設備（`EQ-101`、`EQ-102` 為 `requires_approval = true`，`EQ-103`、`EQ-104` 為 `requires_approval = false`）與 3 個單日固定時段（上午 `09:00`–`12:00`、下午 `13:00`–`17:00`、晚間 `18:00`–`21:00`，代碼轉換見 Notes 待確認 1）；依執行當下的 `Asia/Taipei` 日期動態建立涵蓋全部 6 種狀態的展示紀錄，包含當日晚間 `18:00–21:00` 尚未結束且可立即登記領取的 `confirmed` 預約（`RV-20261108-06`）、目前處於 `checked_out` 的借用中紀錄（含林雅婷當日借用中 `RV-20261108-03` 與陳冠廷前一日逾時未還借用中 `RV-20261107-05`）、已完成歸還的 `returned` 紀錄（`RV-20261108-01`，含領取與歸還時間及經手管理員吳承翰），以及 `pending_approval`（含同設備同時段雙人待審 `RV-20261109-08`、`RV-20261109-09`）、明日 `confirmed`（`RV-20261108-04`、`RV-20261108-07`）、`rejected`（`RV-20261109-07`）與 `cancelled`（`RV-20261107-06`）範例紀錄（FR-001、FR-004、FR-006、FR-009、research §5）
  - **Must Read**
    - `research.md` → §5 — Why：依執行當下台灣日期動態建立涵蓋 6 種狀態（含當日可領取、當日借用中、逾時未還借用中、已歸還）展示資料的配置
    - `data/data-model.dbml` → `Table equipments`、`Table reservations` — Why：寫入 `status`、`checked_out_by`、`checked_out_at`、`returned_by`、`returned_at`、`reviewed_by`、`reviewed_at`、`reject_reason`、`cancelled_at` 欄位
    - `ui/plan.md` → §4 `booking.html`、`my-reservations.html`、`admin.html` — Why：對齊雛形中的範例預約編號與 6 態借還展示紀錄
    - `spec.md` → FR-009 — Why：擴充 demo seed 涵蓋當日可立即登記領取、借用中、已歸還、待審核、已駁回與已取消範例紀錄

### 後端（B1–B6 共用）

- [X] T007 [P] 在 `apps/equipment-loan/backend/src/utils/taipeiTime.ts`、`apps/equipment-loan/backend/src/middleware/errorHandler.ts` 與 `apps/equipment-loan/backend/src/middleware/authMiddleware.ts` 擴充台灣時區當日時段結束時間窗檢核工具、錯誤碼與權限檢查：在 `taipeiTime.ts` 新增判斷預約日期是否為 `Asia/Taipei` 當日、是否大於當日日期（未來日期提前領取，對應 `PICKUP_DATE_NOT_TODAY`）或小於當日日期／當日當前時間已達到或超過該固定時段 `end_time`（過期未領補登，對應 `PICKUP_WINDOW_EXPIRED`）的輔助函式；在 `errorHandler.ts` 確保 `AppError` 完整支援 `components.schemas.Error` 的全部 19 個錯誤碼（新增 `PICKUP_DATE_NOT_TODAY`、`PICKUP_WINDOW_EXPIRED`、`RESERVATION_ALREADY_CHECKED_OUT`）；並確認 `requireAuth`（未登入回 `401 UNAUTHORIZED`）與 `requireAdmin`（一般成員呼叫管理員端點回 `403 FORBIDDEN`）符合 B1–B6 權限要求（FR-002、FR-003、FR-008、FR-009、NFR-001、SC-001、SC-005、research §2、§4）
  - **Must Read**
    - `contracts/openapi.yaml` → `Error`、`Unauthorized`、`Forbidden`、`PickupReservationBadRequest`、`PickupOrReturnReservationConflict`、`CancelReservationConflict` — Why：19 個錯誤碼 enum 與 400／401／403／404／409 回應格式
    - `research.md` → §2、§4 — Why：`Asia/Taipei` 當日時段時間窗判定規則、新增錯誤碼與管理員角色權限攔截

### 前端（F1–F4 共用）

- [X] T008 [P] 在 `apps/equipment-loan/frontend/src/text/zh-TW.ts` 與 `apps/equipment-loan/frontend/src/api/client.ts` 擴充臺灣繁體中文 6 態借還狀態文案、錯誤碼對應與 API 客戶端型別：在 `zh-TW.ts` 加入 6 種標準狀態標籤（「待審核」、「已核准／有效」、「借用中」、「已歸還」、「已駁回」、「已取消」）、時段 6 態標籤（「可預約」、「本人待審核」、「本人已預約」、「本人借用中」、「本人已歸還」、「已被預約」）、操作動作文案（「登記領取」、「登記歸還」）與 19 個錯誤碼（含 `PICKUP_DATE_NOT_TODAY`、`PICKUP_WINDOW_EXPIRED`、`RESERVATION_ALREADY_CHECKED_OUT`）的臺灣繁體中文訊息；在 `client.ts` 擴充 `ReservationStatus`、`SlotStatus`、`EquipmentSlotAvailability`、`Reservation` 與 `AdminReservationItem` 的領取／歸還稽核欄位（`checkedOutAt`、`checkedOutByUserId`、`checkedOutByUsername`、`checkedOutByName`、`returnedAt`、`returnedByUserId`、`returnedByUsername`、`returnedByName`、`canPickup`、`canReturn`、`canCancel`）及 `pickupReservationByAdmin`、`returnReservationByAdmin`、`listMyLoanReservations` API 呼叫函式（FR-001、FR-004、FR-005、FR-006、FR-007、FR-008、NFR-001、research §3）
  - **Must Read**
    - `contracts/openapi.yaml` → `Error`、`ReservationStatus`、`SlotStatus`、`EquipmentSlotAvailability`、`Reservation`、`AdminReservationItem` — Why：前端 API 客戶端 6 態型別、領取／歸還稽核欄位與 19 個錯誤碼定義
    - `ui/plan.md` → §2、§4、§5 — Why：借用中／已歸還配色變數、6 態狀態標籤與錯誤橫幅的臺灣繁體中文文案
    - `research.md` → §3 — Why：集中於 `zh-TW.ts` 管理借還狀態與錯誤提示文字

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 管理員於現場登記設備領取並轉入借用中狀態 (Priority: P1) 🎯 MVP

**Goal**: 管理員在預約與借用管理頁面檢視或篩選「已核准／有效 (`confirmed`)」預約，對預約日期為當日（依 `Asia/Taipei`）且尚未超過該固定時段結束時間的預約單鍵執行「登記領取」，將狀態更新為「借用中 (`checked_out`)」並記錄實際領取時間與領取經手管理員；對非「已核准／有效」狀態、未來日期提前領取、已超過固定時段結束時間未領取的過期預約或一般成員越權呼叫一律攔截拒絕並顯示繁體中文錯誤提示。

**Independent Test**: 以預建管理員帳號登入，檢視一筆預約日期為當日且尚未超過該固定時段結束時間的「已核准／有效」預約並點擊「登記領取」，驗證狀態更新為「借用中」且顯示領取時間與領取經手管理員；再分別對未來日期的「已核准／有效」預約、已超過時段結束時間的未領取預約，以及處於「待審核」或「借用中」的紀錄嘗試執行登記領取，驗證系統皆拒絕操作並顯示對應的繁體中文錯誤提示。

### 資料庫（D1、D2）

- [X] T009 [US1] 執行 `apps/equipment-loan/backend/prisma/seed.ts` 載入預建帳號（D1）與 4 台設備、3 個固定時段及 6 種狀態展示紀錄（D2），驗證前兩版驗證碼登入資料、當日可領取預約 `RV-20261108-06` 與升級後的雙重部分唯一索引在 PostgreSQL 18 中運作正常（FR-001、FR-002、FR-009、SC-001、SC-005）
  - **Must Read**
    - `data/data-model.dbml` → `Table users`、`Table equipments`、`Table time_slots`、`Table reservations` — Why：確認 6 態 seed 資料寫入後符合雙重部分唯一索引與外鍵約束
    - `spec.md` → FR-009、SC-001、SC-005 — Why：驗證初始展示資料與前兩次迭代資料相容性

### 後端（B1、B5）

- [X] T010 [US1] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 實作 B5 的 `pickupReservationByAdmin({ adminUserId, reservationId })`（`POST /api/admin/reservations/:reservationId/pickup`）：於單一資料庫交易內查詢未軟刪除的目標預約與關聯的 `time_slots`（不存在回 `404 RESOURCE_NOT_FOUND`）；驗證目前 `status` 必須為 `'confirmed'`，若為 `'pending_approval'`、`'checked_out'`（重複點擊登記領取）、`'returned'`、`'rejected'` 或 `'cancelled'` 則拒絕領取並拋出 `409 INVALID_RESERVATION_STATUS`；以 `taipeiTime.ts` 依 `Asia/Taipei` 業務時區檢核 `reservation_date` 與固定時段 `end_time`，若 `reservation_date` 大於台灣當日日期（明日或未來日期提前領取）則拒絕並拋出 `400 PICKUP_DATE_NOT_TODAY`，若 `reservation_date` 小於台灣當日日期或當日當前時間已達到／超過 `end_time`（時段已結束卻未領取的過期預約）則拒絕補登並拋出 `400 PICKUP_WINDOW_EXPIRED`；驗證通過時將狀態更新為 `status = 'checked_out'`、寫入 `checked_out_at = now()`、`checked_out_by = adminUserId`、`updated_by = adminUserId`，並回傳完整 `AdminReservationItem`（欄位映射見 Notes 待確認 2）（FR-001、FR-002、NFR-001、NFR-002、SC-001、SC-004、US1 情境 1–4、Edge Cases 管理員對非當日預約或過期未領取預約嘗試登記領取、重複點擊登記領取或登記歸還）
  - **Must Read**
    - `contracts/openapi.yaml` → `pickupReservationByAdmin`、`AdminReservationItem`、`PickupReservationBadRequest`、`PickupOrReturnReservationConflict` — Why：登記領取的交易檢核順序、回應欄位與 `INVALID_RESERVATION_STATUS`／`PICKUP_DATE_NOT_TODAY`／`PICKUP_WINDOW_EXPIRED` 錯誤碼
    - `data/data-model.dbml` → `Table reservations`（`checked_out_by`、`checked_out_at`）、`Table time_slots`（`end_time`） — Why：讀取 `time_slots.end_time` 並更新 `status`、`checked_out_at`、`checked_out_by`
    - `research.md` → §2 — Why：管理員登記領取在交易內的狀態與當日時段時間窗檢核邏輯
    - `spec.md` → US1 情境 1–4、FR-001、FR-002、SC-001、Edge Cases「管理員對非當日預約或過期未領取預約嘗試登記領取」「重複點擊登記領取或登記歸還」 — Why：僅限當日且時段結束前的 `confirmed` 預約可登記領取
- [X] T011 [US1] 在 `apps/equipment-loan/backend/src/routes/adminRouter.ts` 掛載 `POST /api/admin/reservations/:reservationId/pickup`（`pickupReservationByAdmin`）：套用 `requireAuth`（未登入回 `401 UNAUTHORIZED`）與 `requireAdmin`（一般成員呼叫回 `403 FORBIDDEN`）中介層，以 zod 驗證路徑參數 `reservationId`（UUID，不合法回 `400 VALIDATION_FAILED`），呼叫 `reservationService.pickupReservationByAdmin` 並回傳 `200` 與更新後的 `AdminReservationItem`；同時確認 `apps/equipment-loan/backend/src/routes/authRouter.ts` 與 `apps/equipment-loan/backend/src/services/authService.ts` 的 B1 四個端點（`createCaptchaChallenge`、`login`、`getCurrentUser`、`logout`）與更新後的 Prisma schema 完全相容（FR-001、FR-002、FR-003、FR-009、SC-001、SC-005、US1 情境 1–5）
  - **Must Read**
    - `contracts/openapi.yaml` → `pickupReservationByAdmin`、`Forbidden`、`Unauthorized`、`ValidationFailed`、`createCaptchaChallenge`、`login`、`getCurrentUser`、`logout` — Why：登記領取路由路徑、UUID 參數驗證、`403 FORBIDDEN` 成員越權攔截與 B1 登入工作階段相容性
    - `spec.md` → US1 情境 5、FR-003、FR-009、SC-005 — Why：嚴格限制登記領取僅供管理員角色執行並保留前兩版驗證碼登入

### 前端（F1、F4）

- [X] T012 [US1] 在 `apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx` 與 `apps/equipment-loan/frontend/src/views/LoginView.tsx` 實作 US1 管理員現場「登記領取」操作與狀態回饋：確認 `LoginView.tsx` 維持 7 位數區分大小寫驗證碼登入與現場借還規則提示；在 `AdminOverviewView.tsx` 全體預約與借用管理清單對符合 `canPickup === true`（狀態為 `confirmed`、預約日期為當日且尚未超過固定時段結束時間）的紀錄開放單鍵「登記領取」按鈕（點擊中顯示「登記領取中…」並停用），對未來日期的 `confirmed` 預約標示「非當日預約（限當日領取）」、對時段已結束未領的 `confirmed` 預約標示「時段已結束未領（逾期不可領取）」而不開放領取按鈕；完成登記領取後顯示綠色成功橫幅、將該列狀態更新為「借用中」並顯示領取時間與領取經手管理員；若遭遇 `INVALID_RESERVATION_STATUS`、`PICKUP_DATE_NOT_TODAY` 或 `PICKUP_WINDOW_EXPIRED` 則顯示對應的臺灣繁體中文錯誤橫幅，一般成員越權進入時顯示紅色權限攔截卡片（FR-001、FR-002、FR-003、FR-005、FR-009、NFR-001、SC-001、SC-005、US1 情境 1–5）
  - **Must Read**
    - `ui/plan.md` → §3.3 `A1`、`A2`、`A14`、`A16`、§4 `index.html`、`admin.html` 的「篩選已核准／有效（待領取）紀錄」「登記領取處理中」「已完成登記領取（轉為借用中）」、§5 `admin.html` 的「登記領取非已核准狀態紀錄遭拒」「非當日預約提前登記領取遭拒」「時段已結束過期未領取補登遭拒」「一般成員越權執行領取、歸還或管理操作遭拒」 — Why：管理員單鍵登記領取流程、不可領取原因提示與各錯誤橫幅文案
    - `ui/admin.html` → 雛形狀態「篩選已核准／有效（待領取）紀錄」「登記領取處理中」「已完成登記領取（轉為借用中）」「登記領取非已核准狀態紀錄遭拒」「非當日預約提前登記領取遭拒」「時段已結束過期未領取補登遭拒」「一般成員越權執行領取、歸還或管理操作遭拒」 — Why：對照管理員表格領取按鈕、非當日／逾期提示與錯誤橫幅的實際呈現
    - `contracts/openapi.yaml` → `pickupReservationByAdmin`、`AdminReservationItem` — Why：呼叫的登記領取 API 與 `canPickup`、`checkedOutAt`、`checkedOutByName` 欄位
  - **Optional**
    - `ui/index.html` → 雛形狀態「待登入」「管理員登入成功」 — Why：需要核對登入頁現場領取歸還規範提醒與管理員登入導向文字時

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 管理員於現場登記設備歸還並留存完整借用稽核紀錄 (Priority: P2)

**Goal**: 管理員在預約與借用管理頁面支援依全部 6 種狀態（「待審核」、「已核准／有效」、「借用中」、「已歸還」、「已駁回」、「已取消」）篩選紀錄，完整檢視領取時間、領取經手管理員、歸還時間與歸還經手管理員，並對處於「借用中 (`checked_out`)」狀態的紀錄（不論在固定時段結束時間之前或超過結束時間後逾時歸還）單鍵點擊「登記歸還」，將狀態更新為「已歸還 (`returned`)」、記錄實際歸還時間與歸還經手管理員且保留完整歷史紀錄（同一固定時段視為已履約結案不重新開放）；對非「借用中」狀態的紀錄嘗試歸還則拒絕並顯示繁體中文錯誤提示。

**Independent Test**: 以預建管理員帳號登入，篩選「借用中」紀錄，分別對時段尚未結束的「借用中」紀錄與已超過時段結束時間的「借用中」紀錄點擊「登記歸還」，驗證兩者皆成功更新為「已歸還」並顯示歸還時間與歸還經手管理員；再嘗試對「已核准／有效」尚未領取的紀錄或「已歸還」紀錄執行登記歸還，驗證系統拒絕操作並顯示繁體中文錯誤提示。

### 後端（B4、B5、B6）

> D1 的 `users` 與 D2 的 `equipments`、`time_slots`、`reservations`（含領取與歸還稽核欄位及雙重部分唯一索引）已在 Phase 2 與 US1 建立，本故事沒有資料庫任務。

- [X] T013 [US2] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 實作 B5 的 `returnReservationByAdmin({ adminUserId, reservationId })`（`POST /api/admin/reservations/:reservationId/return`），並擴充 B4 的 `listAllReservations`（`GET /api/admin/reservations`）、`listPendingReservations`（`GET /api/admin/reservations/pending`）、`approveReservation`（`POST /api/admin/reservations/:reservationId/approve`）與 `rejectReservation`（`POST /api/admin/reservations/:reservationId/reject`）：`returnReservationByAdmin` 於單一資料庫交易內查詢未軟刪除的目標紀錄（不存在回 `404 RESOURCE_NOT_FOUND`），驗證目前 `status` 必須為 `'checked_out'`（若為尚未領取的 `'confirmed'`、重複歸還的 `'returned'`、`'pending_approval'`、`'rejected'` 或 `'cancelled'` 則拒絕並拋出 `409 INVALID_RESERVATION_STATUS`），通過時不論當前台灣時間在該固定時段結束時間之前或已超過結束時間（逾時歸還）皆允許結案，更新為 `status = 'returned'`、`returned_at = now()`、`returned_by = adminUserId`、`updated_by = adminUserId` 並完整保留歷史紀錄（同日時段繼續受 `uq_reservations_active_slot` 鎖定不重新開放）；`listAllReservations` 支援全部 6 種 `status`（`pending_approval`、`confirmed`、`checked_out`、`returned`、`rejected`、`cancelled`）與 `equipmentId` 篩選，join `checked_out_by` 與 `returned_by` 管理員資訊並計算 `canPickup`、`canReturn`（僅 `status === 'checked_out'` 為 `true`）、`canCancel`（欄位映射見 Notes 待確認 2）；`approveReservation` 重檢時段衝突時將 `status IN ('confirmed', 'checked_out', 'returned')` 皆視為已占用而攔截回 `409 RESERVATION_CONFLICT`（FR-004、FR-005、FR-007、FR-009、NFR-002、SC-002、SC-004、SC-005、US2 情境 1–4、Edge Cases 成員超過固定時段結束時間才逾時歸還設備、重複點擊登記領取或登記歸還、當日借用提早歸還後的時段占用保護）
  - **Must Read**
    - `contracts/openapi.yaml` → `returnReservationByAdmin`、`listAllReservations`、`listPendingReservations`、`approveReservation`、`rejectReservation`、`AdminReservationPage`、`AdminReservationItem`、`PickupOrReturnReservationConflict`、`ReviewReservationConflict` — Why：登記歸還規則、全體清單 6 態篩選、稽核與可操作欄位（`canPickup`、`canReturn`）及核准衝突重檢
    - `data/data-model.dbml` → `Table reservations`（`returned_by`、`returned_at`、`uq_reservations_active_slot`） — Why：更新 `returned_at`、`returned_by` 並透過 `uq_reservations_active_slot` 保持 `returned` 時段占用保護
    - `research.md` → §1、§2 — Why：允許逾時歸還、拒絕非 `checked_out` 歸還與提早歸還後不重開時段的設計
    - `spec.md` → US2 情境 1–4、FR-004、FR-005、FR-007、SC-002、Edge Cases「成員超過固定時段結束時間才逾時歸還設備」「重複點擊登記領取或登記歸還」「當日借用提早歸還後的時段占用保護」 — Why：借用中紀錄隨時可歸還、完整顯示 6 態稽核欄位與提早歸還結案保護
- [X] T014 [US2] 在 `apps/equipment-loan/backend/src/routes/adminRouter.ts` 與 `apps/equipment-loan/backend/src/services/equipmentService.ts` 掛載 `POST /api/admin/reservations/:reservationId/return`（`returnReservationByAdmin`）、擴充 `GET /api/admin/reservations` 的 zod `status` 參數支援 6 種狀態，並確認 B6 的 `listAdminEquipments`（`GET /api/admin/equipments`）與 `updateEquipmentApprovalMode`（`PATCH /api/admin/equipments/:equipmentId/approval-mode`）在切換設備人工審核設定時完整維持既有 `confirmed`、`checked_out`、`returned` 與 `pending_approval` 紀錄原狀態不變（代碼轉換見 Notes 待確認 1）（FR-003、FR-004、FR-005、FR-009、SC-002、SC-005、US2 情境 1–4）
  - **Must Read**
    - `contracts/openapi.yaml` → `returnReservationByAdmin`、`listAllReservations`、`listAdminEquipments`、`updateEquipmentApprovalMode`、`ReservationStatus`、`Forbidden` — Why：登記歸還路由、6 態 query 驗證與 B6 切換設備審核設定維持既有借還紀錄效力
    - `spec.md` → FR-003、FR-004、FR-005、FR-009、SC-002、SC-005 — Why：管理員權限保護與前兩版設備審核設定回歸

### 前端（F4）

- [X] T015 [US2] 在 `apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx` 與 `apps/equipment-loan/frontend/src/App.tsx` 擴充 F4 的 6 態狀態篩選、單鍵「登記歸還」操作與完整借還稽核欄位顯示：在 `App.tsx` 將管理員導覽頁籤名稱更新為「審核與借用管理」；在 `AdminOverviewView.tsx` 全體預約與借用管理區塊提供全部狀態與 6 種狀態（`pending_approval` 待審核、`confirmed` 已核准／有效（待領取）、`checked_out` 借用中（待歸還）、`returned` 已歸還、`rejected` 已駁回、`cancelled` 已取消）下拉與快速篩選頁籤，表格完整顯示「領取時間／經手管理員」與「歸還時間／經手管理員」（對逾時未還的 `checked_out` 紀錄標示「借用中（逾時未還）」）；僅對 `canReturn === true`（`status === 'checked_out'`，含時段內與逾時未還）的紀錄開放單鍵「登記歸還」按鈕（點擊中顯示「登記歸還中…」並停用），完成後將該列狀態更新為「已歸還」、顯示綠色成功橫幅與歸還稽核資訊並標示「已完成歸還結案」；同時保留預建設備審核設定切換與待審清單核准／駁回互動（FR-004、FR-005、FR-007、FR-009、NFR-001、NFR-002、SC-002、SC-004、US2 情境 1–4）
  - **Must Read**
    - `ui/plan.md` → §3.1、§3.3 `A12`、`A13`、`A15`、§4 `admin.html` 的「審核設定、待審清單與 6 態借還管理總覽」「篩選借用中（待歸還）紀錄」「登記歸還處理中」「已完成登記歸還（時段內歸還轉為已歸還）」「已完成逾時歸還登記（超過時段結束時間補還）」「已切換設備審核設定與核准待審申請」、§5 `admin.html` 的「登記歸還非借用中狀態紀錄遭拒」「多筆待審申請核准時段衝突」 — Why：管理員 6 態篩選、單鍵登記歸還（含逾時歸還）與稽核欄位呈現
    - `ui/admin.html` → 雛形狀態「審核設定、待審清單與 6 態借還管理總覽」「篩選借用中（待歸還）紀錄」「登記歸還處理中」「已完成登記歸還（時段內歸還轉為已歸還）」「已完成逾時歸還登記（超過時段結束時間補還）」「登記歸還非借用中狀態紀錄遭拒」 — Why：對照管理員表格歸還按鈕、逾時未還徽章與成功／錯誤橫幅的實際版面與文字
    - `contracts/openapi.yaml` → `returnReservationByAdmin`、`listAllReservations`、`AdminReservationItem` — Why：呼叫的登記歸還與 6 態查詢 API 及 `canReturn`、`returnedAt`、`returnedByName` 欄位

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 成員查看借用中設備與借用狀態，並於領取後禁止取消預約 (Priority: P3)

**Goal**: 已登入成員在「我的預約」頁面頂部透過「目前借用中設備」醒目區塊立即查看本人所有處於「借用中 (`checked_out`)」狀態的設備與領取時間（無借用中設備時顯示繁體中文空白狀態提示），並在下方清單依全部 6 種狀態篩選及檢視每筆紀錄的領取時間與歸還時間；在「設備預約」頁面檢視單日固定時段時，將 `confirmed`、`checked_out` 與當日已履約 `returned` 視為已占用時段，對借用人本人區分顯示「本人借用中」與「本人已歸還」，對其他成員統一顯示為「已被預約」且不揭露借用人身分；一旦紀錄進入 `checked_out` 或 `returned` 狀態，前端隱藏取消按鈕且後端拒絕任何取消請求。

**Independent Test**: 以預建成員帳號登入，進入「我的預約」頁面，驗證頁頂「目前借用中設備」醒目區塊顯示本人目前處於「借用中」的設備與領取時間，並切換狀態篩選檢視「借用中」與「已歸還」紀錄的領取／歸還時間；進入「設備預約」頁面驗證本人借用中的時段顯示為「本人借用中」；嘗試對「借用中」或「已歸還」的紀錄執行取消，驗證畫面不提供取消按鈕且後端拒絕取消請求。

### 後端（B2、B3）

> D2 的 `reservations` 6 態狀態、領取／歸還稽核欄位與雙重部分唯一索引已在 Phase 2 建立，本故事沒有資料庫任務。

- [ ] T016 [US3] 在 `apps/equipment-loan/backend/src/services/equipmentService.ts` 與 `apps/equipment-loan/backend/src/routes/equipmentsRouter.ts` 擴充 B2 的 `listEquipments`（`GET /api/equipments`），並在 `apps/equipment-loan/backend/src/services/reservationService.ts` 擴充 B2 的 `createReservation`（`POST /api/reservations`）：`listEquipments` 查詢指定日期時，將狀態為 `confirmed`、`checked_out` 或當日已履約完畢之 `returned` 的紀錄皆視為已占用該設備時段（`isBookable = false`），對借用人本人區分回傳 `slotStatus: 'MY_CONFIRMED'`（`availabilityStatus: 'booked_by_me'`）、`'MY_CHECKED_OUT'`（`'checked_out_by_me'`）或 `'MY_RETURNED'`（`'returned_by_me'`）並附帶 `myReservationId`，對其他成員則統一回傳 `slotStatus: 'OCCUPIED'`（`availabilityStatus: 'booked_by_others'`，`myReservationId: null`）且不揭露借用人身分（代碼轉換見 Notes 待確認 1）；`createReservation` 在交易內檢查目標設備時段是否已有 `status IN ('confirmed', 'checked_out', 'returned')` 的占用紀錄（已有或觸發 `uq_reservations_active_slot` 則回 `409 RESERVATION_CONFLICT`，提早歸還結案不重新開放同一時段），並檢查同一成員是否已對同一設備時段持有 `status IN ('pending_approval', 'confirmed', 'checked_out')` 的未結束紀錄（已有或觸發 `uq_reservations_user_active_request` 則回 `409 DUPLICATE_PENDING_OR_ACTIVE_RESERVATION`）（FR-004、FR-007、FR-009、NFR-002、SC-003、SC-004、US3 情境 3、Edge Cases 當日借用提早歸還後的時段占用保護）
  - **Must Read**
    - `contracts/openapi.yaml` → `listEquipments`、`createReservation`、`SlotStatus`、`EquipmentSlotAvailability`、`CreateReservationConflict` — Why：6 態時段狀態（`slotStatus` 與 `availabilityStatus`）對本人與他人的區分規則，以及 `checked_out`／`returned` 的時段占用衝突保護
    - `data/data-model.dbml` → `Table reservations` — Why：`uq_reservations_active_slot`（涵蓋 `confirmed`、`checked_out`、`returned`）與 `uq_reservations_user_active_request`（涵蓋 `pending_approval`、`confirmed`、`checked_out`）索引約束
    - `research.md` → §1、§3 — Why：時段 6 態標示與當日提早歸還結案不重新開放預約的設計
    - `spec.md` → US3 情境 3、FR-007、SC-003、Edge Cases「當日借用提早歸還後的時段占用保護」 — Why：對本人顯示「本人借用中」／「本人已歸還」、對他人顯示「已被預約」且隱藏身分
- [ ] T017 [US3] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 與 `apps/equipment-loan/backend/src/routes/reservationsRouter.ts` 擴充 B3 的 `listMyReservations`（`GET /api/reservations`）、新增 `listMyLoanReservations`（`GET /api/reservations/my`）路由別名，並強化 `cancelReservation`（`POST /api/reservations/:reservationId/cancel`）領取後禁取消防護：`listMyReservations` 與 `listMyLoanReservations` 支援依全部 6 種 `status`（`pending_approval`、`confirmed`、`checked_out`、`returned`、`rejected`、`cancelled`）篩選，join `checked_out_by` 與 `returned_by` 管理員資訊回傳 `checkedOutAt`、`checkedOutByUserId`、`checkedOutByName`、`returnedAt`、`returnedByUserId`、`returnedByName` 與 `canCancel`（僅當 `status` 為 `'pending_approval'` 或尚未領取之 `'confirmed'` 且未達時段開始時間時為 `true`，一旦進入 `'checked_out'` 或 `'returned'` 即為 `false`；欄位映射見 Notes 待確認 2）；`cancelReservation` 在檢查時段開始時間之前先檢查紀錄狀態，若狀態已進入 `'checked_out'` 或 `'returned'`（包含成員於當日固定時段正式開始前已先提早領取的情況），立即攔截拒絕並回傳 `409 RESERVATION_ALREADY_CHECKED_OUT` 與繁體中文錯誤訊息（FR-006、FR-008、FR-009、NFR-001、NFR-002、SC-003、SC-004、US3 情境 1、2、4、Edge Cases 成員於當日提早領取後，在時段開始前嘗試自行取消預約）
  - **Must Read**
    - `contracts/openapi.yaml` → `listMyReservations`、`listMyLoanReservations`、`cancelReservation`、`ReservationPage`、`Reservation`、`CancelReservationConflict` — Why：個人 6 態查詢（含 `/reservations/my`）、領取／歸還稽核欄位與 `409 RESERVATION_ALREADY_CHECKED_OUT` 攔截規則
    - `data/data-model.dbml` → `Table reservations` — Why：以 `idx_reservations_user_date_created` 查詢本人借用中與 6 態紀錄
    - `research.md` → §2 — Why：在取消邏輯前優先攔截 `checked_out` 與 `returned` 並回傳 `409 RESERVATION_ALREADY_CHECKED_OUT`
    - `spec.md` → US3 情境 1、2、4、FR-006、FR-008、SC-003、Edge Cases「成員於當日提早領取後，在時段開始前嘗試自行取消預約」 — Why：頁頂目前借用中查詢、6 態歷史篩選與一旦領取後即嚴格禁止取消

### 前端（F2、F3）

- [ ] T018 [P] [US3] 在 `apps/equipment-loan/frontend/src/components/SlotStatusBadge.tsx` 與 `apps/equipment-loan/frontend/src/views/EquipmentBookingView.tsx` 擴充 F2 的單日固定時段 6 態借用狀態顯示：在 `SlotStatusBadge.tsx` 與時段按鈕支援 6 種狀態——`AVAILABLE`（`available`，翠綠「可預約」）、`MY_PENDING`（`pending_by_me`，琥珀橘「本人待審核」）、`MY_CONFIRMED`（`booked_by_me`，靛藍「本人已預約」）、`MY_CHECKED_OUT`（`checked_out_by_me`，湖水青藍「本人借用中」並標註已登記領取不可取消）、`MY_RETURNED`（`returned_by_me`，青松綠「本人已歸還」並標註已歸還結案不重開預約）與 `OCCUPIED`（`booked_by_others`，中性灰「已被預約」且不揭露借用人身分）；頂部工具列新增固定時段 6 態圖例說明，並在點擊已占用／已歸還或本人未結束時段嘗試送出時顯示對應繁體中文錯誤橫幅（FR-007、FR-009、NFR-001、SC-003、US3 情境 3、Edge Cases 當日借用提早歸還後的時段占用保護）
  - **Must Read**
    - `ui/plan.md` → §2、§3.3 `A4`、`A5`、§4 `booking.html` 的「檢視設備與固定時段 6 態狀態（本人視角）」「其他成員視角檢視借用中與已歸還時段（顯示已被預約）」、§5 `booking.html` 的「同成員重複申請同一設備時段」「送出時時段已被占用」 — Why：固定時段 6 態色彩、徽章文字與本人／其他成員視角呈現
    - `ui/booking.html` → 雛形狀態「檢視設備與固定時段 6 態狀態（本人視角）」「其他成員視角檢視借用中與已歸還時段（顯示已被預約）」「同成員重複申請同一設備時段」「送出時時段已被占用」 — Why：對照 6 態時段按鈕樣式、圖例與錯誤橫幅文字
    - `contracts/openapi.yaml` → `listEquipments`、`EquipmentSlotAvailability`、`SlotStatus` — Why：6 態時段欄位與狀態值
- [ ] T019 [P] [US3] 在 `apps/equipment-loan/frontend/src/views/MyReservationsView.tsx` 實作 F3 的頁頂「目前借用中設備」醒目區塊、6 種狀態篩選與領取後隱藏取消按鈕：於頁面頂部新增「目前借用中設備」醒目區塊，獨立列出當前成員所有 `status === 'checked_out'` 的借用中設備（顯示預約編號、借用中徽章、設備編號、設備名稱、預約日期、固定時段、領取時間、領取經手管理員與「已領取設備禁止自行取消預約」提示；當名下無借用中設備時顯示繁體中文空白狀態提示「目前名下沒有借用中的設備。當您於預約當日到現場由管理員完成『登記領取』後，借用中的設備與領取時間會立即顯示於此區塊。」）；下方預約與借用清單提供全部紀錄與 6 種狀態（`pending_approval` 待審核、`confirmed` 已核准／有效、`checked_out` 借用中、`returned` 已歸還、`rejected` 已駁回、`cancelled` 已取消）篩選頁籤，對「借用中」與「已歸還」紀錄顯示領取時間、歸還時間與經手管理員，並嚴格隱藏「取消預約」按鈕（改顯示「已領取借用中（不可取消）」或「已完成歸還結案（不可取消）」；若收到 `RESERVATION_ALREADY_CHECKED_OUT` 則顯示紅色錯誤橫幅）（FR-006、FR-008、FR-009、NFR-001、NFR-002、SC-003、SC-004、US3 情境 1、2、4、Edge Cases 成員於當日提早領取後，在時段開始前嘗試自行取消預約）
  - **Must Read**
    - `ui/plan.md` → §3.3 `A8`、`A9`、`A10`、`A11`、§4 `my-reservations.html` 的「個人借用中醒目區塊與 6 態預約清單」「目前無借用中設備（空白狀態）」「篩選借用中與已歸還紀錄」、§5 `my-reservations.html` 的「取消已領取借用中或已歸還設備遭拒」 — Why：頁頂目前借用中設備醒目區塊、空白狀態、6 態篩選與領取後隱藏取消按鈕的設計與文案
    - `ui/my-reservations.html` → 雛形狀態「個人借用中醒目區塊與 6 態預約清單」「目前無借用中設備（空白狀態）」「篩選借用中與已歸還紀錄」「取消已領取借用中或已歸還設備遭拒」 — Why：對照頁頂醒目區塊、借還稽核資訊框與不可取消提示的實際版面与文字
    - `contracts/openapi.yaml` → `listMyReservations`、`listMyLoanReservations`、`cancelReservation`、`Reservation` — Why：呼叫的查詢與取消 API 及 `checkedOutAt`、`checkedOutByName`、`returnedAt`、`returnedByName`、`canCancel` 欄位

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T020 [P] 在 `apps/equipment-loan/backend/tests/unit/` 與 `apps/equipment-loan/backend/tests/integration/` 擴充並執行 Vitest + Supertest 自動化驗證測試，連接真實 PostgreSQL 18 資料庫量測並確認：（1）管理員對預約當日且尚未超過固定時段結束時間的 `confirmed` 預約執行 `pickupReservationByAdmin` 時 100% 成功更新為 `checked_out` 並完整記錄 `checkedOutAt` 與 `checkedOutByUserId`，對 `pending_approval`、`checked_out`、`returned`、`rejected`、`cancelled` 狀態（回 `409 INVALID_RESERVATION_STATUS`）或對明日未來預約（回 `400 PICKUP_DATE_NOT_TODAY`）、過去／當日已超過時段結束時間未領取預約（回 `400 PICKUP_WINDOW_EXPIRED`）嘗試登記領取時 100% 被攔截拒絕（SC-001、FR-001、FR-002）；（2）管理員對時段結束前及超過時段結束時間（逾時歸還）的 `checked_out` 紀錄執行 `returnReservationByAdmin` 時 100% 成功更新為 `returned` 並完整記錄 `returnedAt` 與 `returnedByUserId`，提早歸還後該時段仍受 `uq_reservations_active_slot` 保護而不被重新預約或核准，對非 `checked_out` 狀態嘗試登記歸還時 100% 回 `409 INVALID_RESERVATION_STATUS`（SC-002、FR-004、FR-007）；（3）成員查詢目前借用中設備與 6 態清單 100% 準確，且對 `checked_out`（含當日時段開始前已提早領取）或 `returned` 紀錄嘗試呼叫 `cancelReservation` 時 100% 回 `409 RESERVATION_ALREADY_CHECKED_OUT`（SC-003、FR-006、FR-008）；（4）管理員執行登記領取、登記歸還與成員查詢目前借用中設備及借用狀態清單的 API 回應時間均 `< 2 秒`（SC-004、NFR-002）；（5）一般成員嘗試呼叫 `POST /api/admin/reservations/:reservationId/pickup` 或 `POST /api/admin/reservations/:reservationId/return` 時 100% 回 `403 FORBIDDEN`，且前兩次迭代既有功能（7 位數大小寫驗證碼登入、免審核與需人工審核申請、待審核准衝突重檢、設備審核設定切換）回歸測試通過率達 100%（SC-005、FR-003、FR-009）
  - **Must Read**
    - `spec.md` → SC-001、SC-002、SC-003、SC-004、SC-005、NFR-002、FR-009 — Why：五項可量測成功標準、回應時間門檻與前兩次迭代回歸要求
    - `research.md` → §1、§2、§5 — Why：雙重部分唯一索引升級驗證、當日時段時間窗與逾時歸還測試及跨迭代回歸測試設計
- [ ] T021 [P] 在 `apps/equipment-loan/frontend/tests/unit/` 與 `apps/equipment-loan/e2e/` 擴充並執行前端單元測試與 Playwright 端對端測試：驗證 US1（管理員對當日未結束 `confirmed` 預約單鍵登記領取轉為「借用中」、非當日與過期未領不開放領取）、US2（管理員依 6 種狀態篩選、對時段內與逾時未還的「借用中」紀錄單鍵登記歸還轉為「已歸還」並顯示領取／歸還經手管理員）、US3（成員在「我的預約」頁頂「目前借用中設備」醒目區塊查看借用中設備、6 態歷史篩選、時段頁面區分顯示「本人借用中」與「本人已歸還」且對他人顯示「已被預約」、領取後隱藏取消按鈕並禁止取消），以及前兩版核心流程回歸、一般成員越權攔截、Light／Dark Mode 主題切換、臺灣繁體中文介面文字（NFR-001）與 360px／1120px 寬度操作正常
  - **Must Read**
    - `spec.md` → US1、US2、US3、NFR-001、SC-001、SC-002、SC-003、SC-005 — Why：三個 User Story 的獨立測試、驗收情境與前兩版回歸要求
    - `ui/plan.md` → §2、§4、§5 — Why：視覺風格、RWD 寬度與 6 態借還狀態／錯誤橫幅文字核對
- [ ] T022 [P] 更新 `apps/equipment-loan/README.md`，補充本次迭代新增的管理員現場登記領取與登記歸還、成員「目前借用中設備」醒目區塊與 6 態狀態轉移規則說明、無損資料庫遷移指令（`npm run db:migrate`）、涵蓋 6 種狀態的 demo seed 重設指令（`npm run db:seed`）與雙視窗展示驗證步驟（FR-009、research §5）
  - **Must Read**
    - `plan.md` → `Source Code (repository root)` — Why：`apps/equipment-loan/README.md` 的用途說明
    - `research.md` → §1、§5 — Why：無損資料庫遷移與 6 態 demo seed 的預建資料說明
- [ ] T023 在 `apps/equipment-loan/backend/`、`apps/equipment-loan/frontend/` 與 `apps/equipment-loan/` 執行 `npm run check`（`tsc --noEmit`、ESLint、Prettier）、執行 `npm run db:seed` 確認 6 態展示資料重設成功，並執行全套單元、整合及 Playwright E2E 測試，確認全部零錯誤通過（FR-009、SC-001、SC-002、SC-003、SC-004、SC-005、research §4、§5）
  - **Must Read**
    - `research.md` → §4、§5 — Why：靜態檢查、型別檢查、demo seed 重設與全套自動化測試通過標準

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US2 需要 US1 的「登記領取」與 `checked_out` 狀態邏輯（先有借用中紀錄才能執行登記歸還），US3 需要 US1 與 US2 的領取／歸還稽核欄位與 6 態狀態，建議依 P1（US1）→ P2（US2）→ P3（US3）順序推進
  - 同一 User Story 內的前端視圖元件與後端服務（不同檔案）可平行開發
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: 依賴 US1 擴充的 `reservationService.ts`、`adminRouter.ts` 與 `AdminOverviewView.tsx`，新增管理員「登記歸還」與全體 6 態借還篩選功能
- **User Story 3 (P3)**: 依賴 Phase 2 的 6 態 schema 與 US1、US2 的領取／歸還狀態資料，擴充成員「目前借用中設備」醒目區塊、時段 6 態標示與領取後禁取消防護

### Within Each User Story

- 資料庫與 seed（T009）→ 後端服務（T010、T013、T016～T017）→ 後端路由（T011、T014、T016～T017）→ 前端視圖與元件（T012、T015、T018～T019）
- `reservationService.ts`（T010 → T013 → T016 → T017）、`equipmentService.ts`（T014 → T016）、`adminRouter.ts`（T011 → T014）、`AdminOverviewView.tsx`（T012 → T015）跨任務修改同一檔案，必須依序執行
- Story complete before moving to next priority

### Parallel Opportunities

- Setup：T002、T003 可平行執行
- Foundational：T006 完成後，後端 T007 與前端 T008 可平行執行
- US1：T009 完成後，前端 T012 可與後端 T010、T011 平行進行
- US2：前端 T015 可與後端 T013、T014 平行進行
- US3：前端 T018（`SlotStatusBadge.tsx` 與 `EquipmentBookingView.tsx`）、T019（`MyReservationsView.tsx`）可彼此平行，並可與後端 T016、T017 平行進行
- Polish：T020、T021、T022 可平行進行

---

## Parallel Example: User Story 1

```bash
# 後端 B5 登記領取服務與前端 F4 管理員登記領取畫面同時開發：
Task: "實作 pickupReservationByAdmin in apps/equipment-loan/backend/src/services/reservationService.ts"
Task: "實作管理員單鍵登記領取與狀態提示 in apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "實作 returnReservationByAdmin 與 6 態 listAllReservations in apps/equipment-loan/backend/src/services/reservationService.ts"
Task: "擴充管理員 6 態篩選、單鍵登記歸還與稽核欄位顯示 in apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "擴充 listEquipments 6 態時段狀態與 cancelReservation 領取後禁取消 in apps/equipment-loan/backend/src/services/"
Task: "擴充單日固定時段 6 態借用狀態顯示 in apps/equipment-loan/frontend/src/views/EquipmentBookingView.tsx"
Task: "實作頁頂目前借用中設備醒目區塊與 6 態歷史篩選 in apps/equipment-loan/frontend/src/views/MyReservationsView.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 以 US1 的 Independent Test 驗證管理員對當日未結束「已核准／有效」預約執行登記領取轉為「借用中」，並攔截非已核准、未來日期與過期未領預約
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready（完成 6 態與雙重部分唯一索引無損遷移及 6 態 demo seed）
2. Add User Story 1 → Test independently → Deploy/Demo (MVP：管理員於現場登記設備領取並轉入借用中狀態)
3. Add User Story 2 → Test independently → Deploy/Demo（管理員於現場登記設備歸還並依 6 種狀態檢視完整借還稽核紀錄）
4. Add User Story 3 → Test independently → Deploy/Demo（成員查看目前借用中設備醒目區塊、時段 6 態狀態並於領取後禁止取消）
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done，每個故事依序推進，故事內前後端平行分工：
   - Developer A：後端（Prisma 6 態與雙重部分唯一索引交易、當日時段領取時間窗檢核、逾時歸還、領取後禁取消與 Express 路由）
   - Developer B：前端（管理員單鍵登記領取／歸還與 6 態表格、成員「目前借用中設備」醒目區塊與時段 6 態徽章視圖）
3. 雙方以 `contracts/openapi.yaml` 為介面約定，故事完成後一起驗收

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- 待確認 1：固定時段代碼大小寫與設備可用欄位在資料模型與 API 合約命名不同（`data/data-model.dbml` 的 `time_slots.slot_code` 註解為小寫 `morning`、`afternoon`、`evening` 且 `equipments.status` 為 Enum `available`／`unavailable`；`contracts/openapi.yaml` 的 `EquipmentSlotAvailability.slotCode` 為大寫 `MORNING`、`AFTERNOON`、`EVENING` 且 `EquipmentWithSlotAvailability`、`AdminEquipmentSetting` 為布林欄位 `isActive`）。T006、T014 與 T016 延續前兩版做法在後端轉換（將 `slot_code` 轉大寫輸出為 `slotCode`、將 `status === 'available'` 轉為 `isActive: true`）；若要完全統一命名，需同步更新 `data-model.dbml` 或 `openapi.yaml`
- 待確認 2：預約編號與領取／歸還經手管理員欄位在規格、資料模型與 API 合約命名不同（預約編號於 `data/data-model.dbml` 為 `reservations.reservation_no`，於 `contracts/openapi.yaml` 為 `reservationNumber`；經手管理員於 `spec.md` Key Entities 為 `checked_out_by_user_id`、`returned_by_user_id`，於 `data/data-model.dbml` 為 `checked_out_by`、`returned_by`，於 `contracts/openapi.yaml` 為 `checkedOutByUserId`、`checkedOutByUsername`、`checkedOutByName`、`returnedByUserId`、`returnedByUsername`、`returnedByName`）。T010、T013 與 T017 延續前兩版做法在資料庫層使用 `data-model.dbml` 欄位名稱，並於後端服務層 join `users` 映射為 `openapi.yaml` 的回應欄位；若要統一欄位名稱，需同步更新 `data-model.dbml` 或 `openapi.yaml`
