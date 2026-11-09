---

description: "Task list for 設備人工審核設定與預約申請審核 implementation"
---

# Tasks: 設備人工審核設定與預約申請審核 (Equipment Approval Settings and Reservation Review)

**Input**: Design documents from `/specs/004-equipment-approval-review/`（依下方 Reference Loading Contract 按任務載入）

**Tests**: spec.md 沒有明確要求撰寫測試或採用 TDD，因此各使用者故事 Phase 不產生獨立測試任務。Setup 依 research §4、§5 確認既有 Vitest 5、Supertest 7 與 Playwright 1.65 測試工具設定，並在 Polish Phase 執行 SC-001～SC-005 的量測、跨迭代舊功能回歸與端對端驗證任務。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. 每個階段內再依 plan.md「系統介面盤點」的技術端點（資料庫、後端、前端）分組，標題列出該組實作的介面編號；每個任務下方以 Must Read／Optional 列出執行時要讀的文件部位。

## Reference Loading Contract

執行本檔的任務時，依下列規則載入 `/specs/004-equipment-approval-review/` 的文件：

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

- [ ] T001 依 plan.md 的 Source Code 確認 `apps/equipment-loan/`、`apps/equipment-loan/frontend/`、`apps/equipment-loan/backend/` 與 `apps/equipment-loan/e2e/` 目錄結構與 `apps/equipment-loan/docker-compose.yml`（PostgreSQL 18）、`apps/equipment-loan/backend/.env.example` 設定齊備（FR-011、research §1、§4）
  - **Must Read**
    - `plan.md` → `Source Code (repository root)` — Why：前後端與資料庫遷移、測試目錄配置
    - `research.md` → §1、§4 — Why：沿用 `apps/equipment-loan/` 結構與 PostgreSQL 18 Docker Compose 環境
- [ ] T002 [P] 確認 `apps/equipment-loan/backend/package.json` 與 `apps/equipment-loan/backend/tsconfig.json` 的後端套件與腳本設定：TypeScript 6.0、Node.js 24 LTS 以上、`express`（Express 5）、`zod`（zod 4）、`@prisma/client`、`@prisma/adapter-pg`、`pg`、`prisma`（Prisma 7.10）、`tsx`、ESLint 10、Prettier、Vitest 5 與 Supertest 7，且不引入 `redis`、`xstate`、`socket.io`、`luxon`、`moment`、`bcrypt`、`express-session`、`jsonwebtoken`（research §1、§2、§4、§5）
  - **Must Read**
    - `techstack.md` → `技術堆疊總覽` — Why：後端與資料庫、測試工具採用的版本
    - `techstack.md` → `本次開發不引入的技術` — Why：確認不得安裝的後端套件類別
    - `research.md` → §2、§4、§5 — Why：後端執行環境、驗證與測試工具鏈設定
- [ ] T003 [P] 確認 `apps/equipment-loan/frontend/package.json`、`apps/equipment-loan/frontend/tsconfig.json`、`apps/equipment-loan/frontend/vite.config.ts` 與 `apps/equipment-loan/playwright.config.ts` 的前端與 E2E 設定：React 19、Vite 8（含 `/api` 代理至 `http://localhost:3000`）、`@vitejs/plugin-react` 6、TypeScript 6.0、ESLint 10、Prettier、Vitest 5 與 `@playwright/test` 1.65，且不引入 `react-router`、`zustand`、`@reduxjs/toolkit`、`react-i18next`（research §3、§4、§5）
  - **Must Read**
    - `techstack.md` → `技術堆疊總覽` — Why：前端與端對端測試採用的技術與版本
    - `techstack.md` → `本次開發不引入的技術` — Why：確認不得安裝的前端路由、狀態管理與國際化套件
    - `research.md` → §3、§5 — Why：前端架構與 Playwright E2E 測試設定

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 資料庫（D1–D2 共用）

- [ ] T004 在 `apps/equipment-loan/backend/prisma/schema.prisma` 擴充 D2 資料模型（保留 `previewFeatures = ["partialIndexes"]` 與 D1 的 `users`、`captcha_challenges`、`sessions`）：將 `reservation_status` Enum 擴充為 `pending_approval`、`confirmed`、`rejected`、`cancelled`；在 `equipments` 新增 `requires_approval Boolean @default(false)` 與 `idx_equipments_approval_status (requires_approval, status)` 索引；在 `reservations` 新增 `reviewed_by`（外鍵關聯 `users.id`）、`reviewed_at`（`Timestamptz(6)`）、`reject_reason`（`VarChar(200)`），保留 `uq_reservations_active_slot` 部分唯一索引（`WHERE status = 'confirmed' AND deleted_at IS NULL`），並新增 `uq_reservations_user_active_request` 部分唯一索引（`UNIQUE (user_id, equipment_id, reservation_date, slot_id) WHERE status IN ('pending_approval', 'confirmed') AND deleted_at IS NULL`）與 `idx_reservations_status_date_slot (status, reservation_date, slot_id, created_at)` 索引（FR-001、FR-002、FR-003、FR-005、FR-006、FR-007、FR-009、FR-010、FR-011、research §1）
  - **Must Read**
    - `data/data-model.dbml` → `Enum reservation_status`、`Table equipments`、`Table reservations`、`Ref: reservations.reviewed_by > users.id` — Why：新增的審核狀態 Enum、設備 `requires_approval` 欄位、預約審核欄位與兩條部分唯一索引定義
    - `research.md` → §1 — Why：雙重部分唯一索引（`uq_reservations_active_slot` 與 `uq_reservations_user_active_request`）與無損遷移設計
- [ ] T005 在 `apps/equipment-loan/backend/prisma/migrations/` 建立並執行增量無損 Prisma migration，將既有 PostgreSQL 18 資料庫升級至新結構，確認第一版既有 `confirmed` 有效預約、預建設備與帳號 100% 無損保留為 `confirmed` 有效狀態，並重新產生 Prisma Client（FR-010、FR-011、SC-003、research §1）
  - **Must Read**
    - `research.md` → §1 — Why：增量無損遷移步驟，確保既有 `confirmed` 資料列不遺失且不被降為待審
    - `spec.md` → FR-010、FR-011、SC-003 — Why：舊資料無損遷移為「已核准／有效」狀態的要求
- [ ] T006 在 `apps/equipment-loan/backend/prisma/seed.ts` 擴充可重複執行的 demo seed 腳本：保留預建一般成員帳號 `lin.yating`（林雅婷）、`chen.guanting`（陳冠廷）、管理員帳號 `wu.chenghan`（吳承翰）與 3 個單日固定時段（上午 `09:00`–`12:00`、下午 `13:00`–`17:00`、晚間 `18:00`–`21:00`，代碼與狀態轉換見 Notes 待確認 1）；將 `EQ-101`、`EQ-102` 預設設為 `requires_approval = true`（需人工審核），`EQ-103`、`EQ-104` 設為 `requires_approval = false`（免審核）；並建立涵蓋 `pending_approval`（含林雅婷與陳冠廷同時針對 `EQ-101` 同一未開始時段提出的 2 筆待審申請，以及林雅婷對 `EQ-102` 的待審申請）、`confirmed`（含免審核成立與管理員吳承翰核准通過紀錄）、`rejected`（含管理員吳承翰審核時間與駁回原因）及 `cancelled` 四種狀態的展示資料（FR-005、FR-007、FR-011、research §5）
  - **Must Read**
    - `research.md` → §5 — Why：demo seed 預設需人工審核設備（`EQ-101`、`EQ-102`）、免審核設備（`EQ-103`、`EQ-104`）與四種狀態範例紀錄配置
    - `data/data-model.dbml` → `Table equipments`、`Table reservations` — Why：寫入 `requires_approval`、`status`、`reviewed_by`、`reviewed_at`、`reject_reason`、`cancelled_at` 欄位
    - `ui/plan.md` → §4 `booking.html`、`my-reservations.html`、`admin.html` — Why：對齊雛形中的展示設備審核模式與範例預約編號／駁回原因
    - `spec.md` → FR-011 — Why：擴充初始展示資料涵蓋需人工審核設備、免審核設備與四種狀態（含同設備同時段多筆待審）紀錄

### 後端（B1–B5 共用）

- [ ] T007 [P] 在 `apps/equipment-loan/backend/src/middleware/errorHandler.ts` 與 `apps/equipment-loan/backend/src/middleware/authMiddleware.ts` 擴充錯誤碼支援與權限檢查：確保 `AppError` 與錯誤處理中介層完整支援 `components.schemas.Error` 的全部 16 個錯誤碼（新增 `DUPLICATE_PENDING_OR_ACTIVE_RESERVATION` 與 `INVALID_RESERVATION_STATUS`），並確認 `requireAuth`（未登入回 `401 UNAUTHORIZED`）與 `requireAdmin`（一般成員呼叫管理員端點回 `403 FORBIDDEN`）符合 B1–B5 權限要求（FR-003、FR-008、FR-009、NFR-001、SC-005、research §2、§4）
  - **Must Read**
    - `contracts/openapi.yaml` → `Error`、`Unauthorized`、`Forbidden`、`CreateReservationConflict`、`CancelReservationConflict`、`ReviewReservationConflict` — Why：16 個錯誤碼 enum 與 400／401／403／404／409 回應格式
    - `research.md` → §2、§4 — Why：審核狀態錯誤碼與管理員角色權限攔截規則

### 前端（F1–F4 共用）

- [ ] T008 [P] 在 `apps/equipment-loan/frontend/src/text/zh-TW.ts` 與 `apps/equipment-loan/frontend/src/api/client.ts` 擴充臺灣繁體中文審核狀態文案、錯誤碼對應與 API 客戶端型別：在 `zh-TW.ts` 加入設備審核標示（「需人工審核」、「免審核」）、時段狀態（「本人待審核」）、預約審核狀態（「待審核」、「已核准／有效」、「已駁回」、「已取消」）及新增錯誤碼（`DUPLICATE_PENDING_OR_ACTIVE_RESERVATION`、`INVALID_RESERVATION_STATUS`）的繁體中文訊息；在 `client.ts` 擴充 `requiresApproval`、`availabilityStatus: 'available' | 'pending_by_me' | 'booked_by_me' | 'booked_by_others'`、`Reservation` 審核欄位（`reviewedBy`、`reviewedByDisplayName`、`reviewedAt`、`rejectReason`）與管理員審核／設備設定 API 呼叫函式（FR-001、FR-004、FR-005、FR-009、NFR-001、research §3）
  - **Must Read**
    - `contracts/openapi.yaml` → `Error`、`EquipmentSlotAvailability`、`EquipmentWithSlotAvailability`、`Reservation`、`AdminReservationItem`、`AdminEquipmentSetting` — Why：前端 API 客戶端型別與 16 個錯誤碼定義
    - `ui/plan.md` → §4、§5 — Why：各審核狀態標籤與錯誤橫幅的臺灣繁體中文文案
    - `research.md` → §3 — Why：集中於 `zh-TW.ts` 管理審核狀態與錯誤提示文字

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 成員申請需人工審核的設備時段並追蹤審核狀態與取消 (Priority: P1) 🎯 MVP

**Goal**: 已登入成員在設備與時段頁面分辨每台設備屬於「免審核」或「需人工審核」，檢視 4 種時段狀態（「可預約」、「本人待審核」、「本人已預約」、「已被預約」），對需人工審核設備送出申請進入「待審核」且不占用時段（允許其他成員同時申請同一時段，但禁止同一成員對同設備同時段重複申請），對免審核設備送出則立即成為「已核准／有效」並占用時段；並在「我的預約」查看四種狀態、審核時間與駁回原因，於時段開始前取消「待審核」或「已核准／有效」申請，且支援已駁回或已取消後重新申請。

**Independent Test**: 以預建成員帳號登入，檢視標示為「需人工審核」與「免審核」的設備；對「需人工審核」設備選取未開始時段送出申請，驗證狀態為「待審核」、對本人顯示「本人待審核」且另一位成員仍對同一時段看到「可預約」並能送出待審申請；驗證「免審核」設備送出仍立即成為「已核准／有效」；並在「我的預約」驗證可檢視「待審核」、「已核准／有效」、「已駁回」（含駁回原因）紀錄及在時段開始前取消「待審核」或「已核准／有效」申請。

### 資料庫（D1、D2）

- [ ] T009 [US1] 執行 `apps/equipment-loan/backend/prisma/seed.ts` 載入預建帳號（D1）與需人工審核／免審核設備、固定時段及四種狀態範例預約紀錄（D2），並驗證第一版驗證碼登入資料與雙重部分唯一索引在 PostgreSQL 中運作正常（FR-001、FR-002、FR-003、FR-011、SC-001、SC-003）
  - **Must Read**
    - `data/data-model.dbml` → `Table users`、`Table equipments`、`Table time_slots`、`Table reservations` — Why：確認 seed 資料寫入後符合雙重部分唯一索引與外鍵約束
    - `spec.md` → FR-011、SC-001、SC-003 — Why：驗證初始展示資料與第一版資料相容性

### 後端（B1、B2、B3）

- [ ] T010 [US1] 在 `apps/equipment-loan/backend/src/services/equipmentService.ts` 與 `apps/equipment-loan/backend/src/routes/equipmentsRouter.ts` 擴充 `listEquipments({ userId, date, category, requiresApproval, page, pageSize })`（`GET /api/equipments`）：支援選填 `requiresApproval` 布林篩選；每台設備回傳 `requiresApproval`；查詢該日未軟刪除且狀態為 `confirmed` 或（屬於當前登入成員 `userId` 且狀態為 `pending_approval`）的 `reservations`，當該時段已有 `confirmed` 預約時依是否為本人回傳 `booked_by_me` 或 `booked_by_others`，當該時段尚無 `confirmed` 但當前成員有一筆 `pending_approval` 時回傳 `pending_by_me`（附 `myReservationId`）且 `isBookable = false`，當只有其他成員有 `pending_approval`（或當前成員舊申請為 `rejected`／`cancelled`）時仍回傳 `available`（對一般成員不揭露他人待審申請；`slotCode` 與 `isActive` 轉換見 Notes 待確認 1）（FR-001、FR-002、FR-003、FR-011、NFR-002、SC-001、SC-004、US1 情境 1–3、8）
  - **Must Read**
    - `contracts/openapi.yaml` → `listEquipments`、`EquipmentAvailabilityPage`、`EquipmentWithSlotAvailability`、`EquipmentSlotAvailability` — Why：`requiresApproval` 篩選與回應欄位、`availabilityStatus` 四種狀態（`available`、`pending_by_me`、`booked_by_me`、`booked_by_others`）規則
    - `data/data-model.dbml` → `Table equipments`、`Table reservations` — Why：`requires_approval` 欄位與 `idx_reservations_date_equipment_status` 查詢索引
    - `spec.md` → US1 情境 1–3、8、FR-001、FR-002、FR-003、SC-001 — Why：他人待審不占位仍顯示「可預約」、本人待審顯示「本人待審核」、已駁回或已取消後恢復「可預約」
- [ ] T011 [US1] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 擴充 `createReservation({ userId, equipmentId, reservationDate, slotId })`（`POST /api/reservations`）：驗證 7 天內日期範圍（`DATE_OUT_OF_RANGE`）、時段未開始（`SLOT_ALREADY_STARTED`）與設備可用（`RESOURCE_NOT_FOUND`、`EQUIPMENT_UNAVAILABLE`）；在交易內先檢查該設備、日期與時段是否已有 `status = 'confirmed'` 的有效預約（已有則回 `409 RESERVATION_CONFLICT`），並檢查同一成員 `userId` 是否已對同一設備、日期與時段持有 `status IN ('pending_approval', 'confirmed')` 的未結束申請（已有或觸發 `uq_reservations_user_active_request` `P2002` 則回 `409 DUPLICATE_PENDING_OR_ACTIVE_RESERVATION`）；若目標設備 `requires_approval === true` 則建立 `status = 'pending_approval'` 的待審申請（不鎖定時段），若 `requires_approval === false` 則建立 `status = 'confirmed'` 的有效預約（若並發觸發 `uq_reservations_active_slot` `P2002` 則回 `409 RESERVATION_CONFLICT`），並回傳包含審核欄位與 `equipmentRequiresApproval` 的 `Reservation`（`reservation_no` 映射為 `reservationNumber` 見 Notes 待確認 2）（FR-002、FR-003、FR-010、FR-011、NFR-002、SC-001、SC-004、US1 情境 2–5、8、Edge Cases 同一成員對同一設備時段重複申請或駁回後重送）
  - **Must Read**
    - `contracts/openapi.yaml` → `createReservation`、`CreateReservationRequest`、`Reservation`、`CreateReservationBadRequest`、`CreateReservationConflict` — Why：建立待審或免審核預約的狀態分流、回應欄位與 `DUPLICATE_PENDING_OR_ACTIVE_RESERVATION`／`RESERVATION_CONFLICT` 錯誤碼
    - `data/data-model.dbml` → `Table equipments`、`Table reservations` — Why：`requires_approval` 判斷與 `uq_reservations_active_slot`、`uq_reservations_user_active_request` 兩條部分唯一索引
    - `research.md` → §1、§2 — Why：交易內依 `requires_approval` 分流寫入 `pending_approval` 或 `confirmed` 及 `P2002` 衝突錯誤映射
    - `spec.md` → US1 情境 2–5、8、FR-002、FR-003、SC-001、Edge Cases「同一成員對同一設備時段重複申請或駁回後重送」 — Why：待審不占位、同成員禁止重複申請與駁回／取消後允許重送
- [ ] T012 [US1] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 與 `apps/equipment-loan/backend/src/routes/reservationsRouter.ts` 擴充 B3 `listMyReservations({ userId, status, page, pageSize })`（`GET /api/reservations`）與 `cancelReservation({ userId, reservationId })`（`POST /api/reservations/:reservationId/cancel`）：`listMyReservations` 支援四種 `status`（`pending_approval`、`confirmed`、`rejected`、`cancelled`）篩選，並 join 設備與審核管理員（`reviewed_by`）回傳 `equipmentRequiresApproval`、`reviewedBy`、`reviewedByDisplayName`、`reviewedAt`、`rejectReason`；`cancelReservation` 允許本人在時段開始前取消處於 `pending_approval` 或 `confirmed` 的申請（更新為 `status = 'cancelled'` 與 `cancelled_at = now()`，保留歷史紀錄；若已為 `cancelled` 回 `409 RESERVATION_ALREADY_CANCELLED`，若為 `rejected` 回 `409 INVALID_RESERVATION_STATUS`，若已到達時段開始時間回 `409 RESERVATION_ALREADY_STARTED`，非本人回 `403 FORBIDDEN`；`reservation_no` 映射見 Notes 待確認 2）（FR-003、FR-004、FR-011、NFR-001、SC-003、US1 情境 6–8）
  - **Must Read**
    - `contracts/openapi.yaml` → `listMyReservations`、`cancelReservation`、`ReservationPage`、`Reservation`、`CancelReservationConflict` — Why：四種狀態篩選、審核欄位回傳與取消 `pending_approval`／`confirmed` 的錯誤碼規則
    - `data/data-model.dbml` → `Table reservations`、`Ref: reservations.reviewed_by > users.id` — Why：審核管理員關聯查詢與取消狀態更新
    - `research.md` → §2 — Why：允許取消 `pending_approval` 與 `confirmed` 並攔截 `rejected` 的狀態轉移規則
    - `spec.md` → US1 情境 6–8、FR-004 — Why：我的預約顯示四種狀態、審核時間與駁回原因，並支援時段開始前取消待審或已核准申請
- [ ] T013 [US1] 確認 `apps/equipment-loan/backend/src/services/authService.ts` 與 `apps/equipment-loan/backend/src/routes/authRouter.ts` 的 B1 四個端點（`createCaptchaChallenge`、`login`、`getCurrentUser`、`logout`）與更新後的 Prisma schema 完全相容並維持 7 位數區分大小寫英數驗證碼單次消耗行為（FR-011、SC-003）
  - **Must Read**
    - `contracts/openapi.yaml` → `createCaptchaChallenge`、`login`、`getCurrentUser`、`logout` — Why：確認 B1 合約介面與回應格式不變
    - `spec.md` → FR-011、SC-003 — Why：完整保留並向下相容第一版驗證碼登入與工作階段維持功能

### 前端（F1、F2、F3）

- [ ] T014 [P] [US1] 在 `apps/equipment-loan/frontend/src/components/SlotStatusBadge.tsx` 與 `apps/equipment-loan/frontend/src/views/EquipmentBookingView.tsx` 擴充 F2 設備審核標示與單日固定時段預約申請畫面：在每張設備卡片標示琥珀色「需人工審核」或翠綠色「免審核」徽章，並提供審核模式篩選（全部／需人工審核／免審核）；時段按鈕支援 4 種狀態（`available` 顯示翠綠「可預約」、`pending_by_me` 顯示琥珀橘「本人待審核」、`booked_by_me` 顯示靛藍「本人已預約」、`booked_by_others` 顯示中性灰「已被預約」且不揭露他人待審或預約身分）；選取時段後右側確認面板依設備 `requiresApproval` 顯示對應說明與按鈕文字（「送出待審核申請」或「確認送出預約」），送出後分別顯示琥珀色待審提示橫幅（狀態變為「本人待審核」）或綠色預約成立橫幅（狀態變為「本人已預約」），遇到 `DUPLICATE_PENDING_OR_ACTIVE_RESERVATION` 或 `RESERVATION_CONFLICT` 時顯示繁體中文錯誤橫幅（FR-001、FR-002、FR-003、FR-011、NFR-001、SC-001、US1 情境 1–5、8、Edge Cases 同一成員對同一設備時段重複申請或駁回後重送）
  - **Must Read**
    - `ui/plan.md` → §3.3 `A4`、`A5`、`A6`、`A7`、§4 `booking.html`、§5 `booking.html` — Why：設備審核模式徽章、4 種時段狀態、待審／免審核送出橫幅與重複申請錯誤訊息
    - `ui/booking.html` → 雛形狀態「檢視設備審核標示與時段」「其他成員檢視待審時段仍可預約」「已選取需人工審核設備時段」「已選取免審核設備時段」「需人工審核申請已送出（待審核）」「免審核預約立即成立（已核准／有效）」「同成員重複申請同一設備時段」 — Why：對照設備卡片、時段徽章與確認面板的版面與文字
    - `contracts/openapi.yaml` → `listEquipments`、`createReservation` — Why：查詢參數、回應欄位與錯誤碼
- [ ] T015 [P] [US1] 在 `apps/equipment-loan/frontend/src/views/MyReservationsView.tsx` 擴充 F3 成員個人預約審核狀態查詢與取消畫面：支援依全部、待審核（`pending_approval`）、已核准／有效（`confirmed`）、已駁回（`rejected`）、已取消（`cancelled`）篩選；每筆紀錄顯示設備審核模式標籤、預約狀態徽章、審核時間（`reviewedAt`）、審核管理員名稱（`reviewedByDisplayName`）與駁回原因（`rejectReason`）；對尚未到達時段開始時間的 `pending_approval` 與 `confirmed` 申請分別提供「取消待審申請」與「取消預約」按鈕及確認對話框，取消成功後顯示對應綠色橫幅並更新為「已取消」；對 `rejected` 或 `cancelled` 紀錄提供「重新申請此時段」按鈕導回設備預約頁（FR-003、FR-004、FR-011、NFR-001、US1 情境 6–8）
  - **Must Read**
    - `ui/plan.md` → §3.3 `A8`、`A9`、`A10`、§4 `my-reservations.html`、§5 `my-reservations.html` — Why：四種審核狀態篩選、駁回原因呈現、取消待審／已核准確認對話框與錯誤回饋
    - `ui/my-reservations.html` → 雛形狀態「個人預約清單（含四種審核狀態與駁回原因）」「確認取消待審核申請」「確認取消已核准／有效預約」「已取消待審核申請」「已取消有效預約並釋出時段」「取消已駁回或已取消申請」 — Why：對照個人預約卡片、駁回原因區塊與對話框文字
    - `contracts/openapi.yaml` → `listMyReservations`、`cancelReservation` — Why：API 欄位與取消錯誤碼
- [ ] T016 [US1] 確認 `apps/equipment-loan/frontend/src/views/LoginView.tsx` 與 `apps/equipment-loan/frontend/src/App.tsx` 的 F1 登入與頂部導覽流程：保持 7 位數區分大小寫英數驗證碼登入與重整、Light／Dark Mode 切換，並在 `MyReservationsView` 點擊「重新申請此時段」時切換至 `EquipmentBookingView` 並帶入該筆申請的預約日期（FR-003、FR-004、FR-011、US1 情境 8）
  - **Must Read**
    - `ui/plan.md` → §3.1、§3.2、§4 `index.html` — Why：登入頁、設備預約頁與我的預約頁之間的切換流程

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 管理員於待審清單核准或駁回預約申請並重檢時段衝突 (Priority: P2)

**Goal**: 管理員登入後於「待審核申請清單」檢視依預約日期由近到遠、固定時段順序及申請建立時間由早到晚排序的待審申請，對未開始的待審申請執行「核准」（即時重檢時段衝突，未占用則更新為「已核准／有效」並正式鎖定時段，已被占用則以 `409 RESERVATION_CONFLICT` 攔截並保留為待審核）或「駁回」（可選填上限 200 字駁回原因，更新為「已駁回」並保留歷史紀錄），並在全體預約紀錄依四種狀態篩選與檢視審核資訊，同时攔截一般成員越權操作。

**Independent Test**: 以預建管理員帳號登入，檢視已有兩位成員針對同一設備、同一未開始時段提出的兩筆「待審核」申請；先核准第一筆申請，驗證狀態變為「已核准／有效」並正式占用時段；接著嘗試核准第二筆同設備同時段的待審申請，驗證系統因時段衝突拒絕核准並顯示繁體中文錯誤提示，接著將第二筆申請填寫原因並駁回，驗證狀態更新為「已駁回」並保留紀錄。

### 後端（B4）

> D1 的 `users` 與 D2 的 `equipments`、`time_slots`、`reservations`（含審核欄位與雙重部分唯一索引）已在 Phase 2 與 US1 建立，本故事沒有資料庫任務。

- [ ] T017 [US2] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 實作 `listPendingReservations({ equipmentId, page, pageSize })`（`GET /api/admin/reservations/pending`）與擴充 `listAllReservations({ status, equipmentId, page, pageSize })`（`GET /api/admin/reservations`）：驗證分頁參數（不合法回 `400 PAGINATION_INVALID`）；`listPendingReservations` 查詢未軟刪除且 `status = 'pending_approval'` 的申請，依 `reservation_date` ASC、`time_slots.sort_order` ASC、`created_at` ASC、`id` ASC 排序；`listAllReservations` 支援四種 `status`（`pending_approval`、`confirmed`、`rejected`、`cancelled`）與 `equipmentId` 篩選，依 `reservation_date` DESC、`time_slots.sort_order` ASC、`created_at` DESC、`id` ASC 排序；兩者皆 join 申請成員與審核管理員（`reviewed_by`），回傳含 `equipmentRequiresApproval`、`reviewedBy`、`reviewedByUsername`、`reviewedByDisplayName`、`reviewedAt`、`rejectReason` 的 `AdminReservationPage`（`reservation_no` 映射見 Notes 待確認 2）（FR-005、FR-010、NFR-002、SC-004、US2 情境 1）
  - **Must Read**
    - `contracts/openapi.yaml` → `listPendingReservations`、`listAllReservations`、`AdminReservationPage`、`AdminReservationItem` — Why：管理員待審清單與全體預約清單的分頁參數、排序方向與回應欄位
    - `data/data-model.dbml` → `Table reservations`、`Ref: reservations.reviewed_by > users.id` — Why：使用 `idx_reservations_status_date_slot` 與 `idx_reservations_date_slot_created` 索引查詢及關聯審核管理員
    - `spec.md` → US2 情境 1、FR-005 — Why：待審清單預設依預約日期由近到遠、固定時段順序及申請建立時間由早到晚排序
- [ ] T018 [US2] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 實作 `approveReservation({ adminUserId, reservationId })`（`POST /api/admin/reservations/:reservationId/approve`）與 `rejectReservation({ adminUserId, reservationId, rejectReason })`（`POST /api/admin/reservations/:reservationId/reject`）：在單一資料庫交易內鎖定目標預約列，不存在回 `404 RESOURCE_NOT_FOUND`，若 `status !== 'pending_approval'`（例如申請人已先行取消、已核准或已駁回）回 `409 INVALID_RESERVATION_STATUS`，若依台灣時區該預約時段已到達或超過開始時間回 `400 RESERVATION_ALREADY_STARTED`；執行 `approveReservation` 時檢查同一設備、日期與時段是否已有 `status = 'confirmed'` 預約（已有或更新時觸發 `uq_reservations_active_slot` `P2002` 唯一衝突則回 `409 RESERVATION_CONFLICT`，保持原申請為 `pending_approval`），通過時更新為 `status = 'confirmed'`、`reviewed_by = adminUserId`、`reviewed_at = now()`、`updated_by = adminUserId`；執行 `rejectReservation` 時將 `status` 更新為 `rejected`、`reviewed_by = adminUserId`、`reviewed_at = now()`、`reject_reason = rejectReason ?? null`、`updated_by = adminUserId` 並保留歷史紀錄，回傳 `AdminReservationItem`（FR-006、FR-007、FR-008、NFR-002、SC-002、SC-004、US2 情境 2–5、Edge Cases 多筆待審申請針對同一設備時段時的核准衝突、管理員正要核准時申請人已先行取消或時段已開始）
  - **Must Read**
    - `contracts/openapi.yaml` → `approveReservation`、`rejectReservation`、`RejectReservationRequest`、`AdminReservationItem`、`ReviewReservationBadRequest`、`ReviewReservationConflict` — Why：核准與駁回的請求、回應與 400／404／409 錯誤碼
    - `data/data-model.dbml` → `Table reservations` — Why：`uq_reservations_active_slot` 核准衝突保護與 `reviewed_by`、`reviewed_at`、`reject_reason` 欄位更新
    - `research.md` → §2 — Why：交易內鎖定、檢查時段未開始、捕捉 `P2002` 回傳 `409 RESERVATION_CONFLICT` 並保留 `pending_approval` 的實作方式
    - `spec.md` → US2 情境 2–5、FR-006、FR-007、FR-008、SC-002、Edge Cases「多筆待審申請針對同一設備時段時的核准衝突」「管理員正要核准時申請人已先行取消或時段已開始」 — Why：核准重檢時段衝突、選填上限 200 字駁回原因與非待審／已開始時段拒絕審核
- [ ] T019 [US2] 在 `apps/equipment-loan/backend/src/routes/adminRouter.ts` 掛載 B4 路由：`GET /api/admin/reservations/pending`（`listPendingReservations`）、`GET /api/admin/reservations`（`listAllReservations`）、`POST /api/admin/reservations/:reservationId/approve`（`approveReservation`）與 `POST /api/admin/reservations/:reservationId/reject`（`rejectReservation`），全部套用 `requireAuth` 與 `requireAdmin` 中介層（一般成員呼叫回 `403 FORBIDDEN`），並以 zod 驗證路徑參數 `reservationId`（UUID）、分頁篩選參數與 `rejectReason`（選填字串，長度上限 200 字，超出回 `400 VALIDATION_FAILED`）（FR-005、FR-006、FR-007、FR-008、SC-005、US2 情境 1–6、Edge Cases 一般成員越權存取待審清單、審核申請或修改設備審核設定）
  - **Must Read**
    - `contracts/openapi.yaml` → `listPendingReservations`、`listAllReservations`、`approveReservation`、`rejectReservation`、`RejectReservationRequest`、`Forbidden` — Why：四個管理員審核端點的路徑、參數驗證與 `403 FORBIDDEN` 權限攔截
    - `spec.md` → US2 情境 4、6、FR-007、FR-008、SC-005 — Why：駁回原因 200 字上限驗證與限制僅管理員角色可執行

### 前端（F4）

- [ ] T020 [P] [US2] 在 `apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx` 實作 F4 的「待審核申請清單」區塊、核准操作、駁回原因對話框與全體成員預約紀錄四種狀態篩選：管理員登入時呼叫 `GET /api/admin/reservations/pending` 顯示依預約日期由近到遠、固定時段順序及建立時間由早到晚排序的待審清單，提供單筆「核准申請」按鈕（呼叫 `POST /api/admin/reservations/:reservationId/approve`，成功時顯示綠色橫幅並刷新待審與全體清單；若同設備同時段已被先核准的預約占用而回 `409 RESERVATION_CONFLICT`，顯示紅色衝突錯誤橫幅並保留該筆於待審清單供駁回）與「駁回申請」按鈕（開啟對話框支援選填駁回原因、即時顯示 `N / 200 字` 並攔截超過 200 字輸入，確認後呼叫 `POST /api/admin/reservations/:reservationId/reject`）；全體預約表格支援全部、`pending_approval`、`confirmed`、`rejected`、`cancelled` 篩選並顯示審核管理員、審核時間與駁回原因；一般成員誤入時顯示紅色權限攔截卡片（FR-005、FR-006、FR-007、FR-008、NFR-001、SC-002、SC-005、US2 情境 1–6）
  - **Must Read**
    - `ui/plan.md` → §3.3 `A12`、`A13`、`A14`、`A15`、§4 `admin.html`、§5 `admin.html` — Why：待審清單排序、核准成功、同設備同時段核准衝突、駁回原因對話框（200 字上限）、申請人已取消／時段已開始錯誤與越權攔截回饋
    - `ui/admin.html` → 雛形狀態「設備審核設定、待審清單與全體預約總覽」「已核准申請並鎖定時段」「填寫駁回原因對話框」「已駁回待審申請」「篩選已駁回與已取消紀錄」「欄位驗證錯誤」「多筆待審申請核准時段衝突」「核准或駁回時申請人已取消或非待審狀態」「核准或駁回時時段已開始或已過期」「一般成員越權存取或操作遭拒」 — Why：對照待審清單表格、駁回對話框與各錯誤橫幅的視覺呈現與文案
    - `contracts/openapi.yaml` → `listPendingReservations`、`listAllReservations`、`approveReservation`、`rejectReservation` — Why：呼叫的管理員 API 與回應結構
- [ ] T021 [US2] 在 `apps/equipment-loan/frontend/src/App.tsx` 確認管理員導覽名稱與待審數量同步：將管理員導覽頁籤標題更新為「審核與預約管理」，支援管理員登入後直接進入 `AdminOverviewView` 處理待審清單（FR-005、FR-008、US2 情境 1、6）
  - **Must Read**
    - `ui/plan.md` → §3.1、§3.2、§4 `index.html` 的「管理員登入成功」 — Why：管理員導覽頁籤標題與進入流程

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 管理員切換指定設備的人工審核設定並維持既有預約效力 (Priority: P3)

**Goal**: 管理員在設備管理介面查看所有預建單件設備的目前審核設定，並將指定設備在「免審核」與「需人工審核」之間切換且持久化保存；切換設定時保持切換前既有的「已核准／有效」預約與「待審核」申請原狀態與效力不變，僅對切換後新送出的預約申請套用最新設定，且一般成員嘗試修改時 100% 攔截拒絕。

**Independent Test**: 以管理員帳號登入，將一台原本「免審核」且已有既有「已核准／有效」預約的設備切換為「需人工審核」；驗證既有預約仍維持「已核准／有效」且不被退回，而切換後由成員對該設備送出的新預約申請則進入「待審核」狀態；再將一台已有「待審核」申請的設備切換回「免審核」，驗證原「待審核」申請仍留在待審清單可由管理員審核，而之後新送出的預約則直接成為「已核准／有效」。

### 後端（B5）

> D2 的 `equipments.requires_approval` 欄位與索引已在 Phase 2 建立，本故事沒有資料庫任務。

- [ ] T022 [US3] 在 `apps/equipment-loan/backend/src/services/equipmentService.ts` 實作 B5 `listAdminEquipments({ category, requiresApproval, page, pageSize })`（`GET /api/admin/equipments`）與 `updateEquipmentApprovalMode({ adminUserId, equipmentId, requiresApproval })`（`PATCH /api/admin/equipments/:equipmentId/approval-mode`）：`listAdminEquipments` 驗證分頁參數（不合法回 `400 PAGINATION_INVALID`），依 `equipment_code` ASC、`id` ASC 分頁回傳 `AdminEquipmentPage`（含 `requiresApproval` 與 `updatedAt`；`isActive` 轉換見 Notes 待確認 1）；`updateEquipmentApprovalMode` 查詢未軟刪除的目標設備（不存在回 `404 RESOURCE_NOT_FOUND`），僅更新 `equipments.requires_approval`、`updated_at = now()` 與 `updated_by = adminUserId`，不修改 `reservations` 表中的任何既有 `confirmed` 或 `pending_approval` 資料列，並回傳更新後的 `AdminEquipmentSetting`（FR-009、FR-010、NFR-002、SC-003、SC-004、US3 情境 1–3、Edge Cases 設備在「免審核」與「需人工審核」之間來回切換）
  - **Must Read**
    - `contracts/openapi.yaml` → `listAdminEquipments`、`updateEquipmentApprovalMode`、`UpdateEquipmentApprovalModeRequest`、`AdminEquipmentSetting`、`AdminEquipmentPage` — Why：管理員查詢與切換設備人工審核設定的請求、回應與錯誤碼
    - `data/data-model.dbml` → `Table equipments`、`Table reservations` — Why：更新 `equipments.requires_approval` 與 `updated_by` 時保持既有 `reservations` 狀態不變
    - `research.md` → §2 — Why：切換設備審核模式僅更新 `equipments` 資料表、不變動既有預約紀錄的設計
    - `spec.md` → US3 情境 1–3、FR-009、FR-010、SC-003、Edge Cases「設備在「免審核」與「需人工審核」之間來回切換」 — Why：舊預約保留原有效力、既有待審維持待審、新設定僅適用於切換後新送出的申請
- [ ] T023 [US3] 在 `apps/equipment-loan/backend/src/routes/adminRouter.ts` 掛載 B5 路由：`GET /api/admin/equipments`（`listAdminEquipments`）與 `PATCH /api/admin/equipments/:equipmentId/approval-mode`（`updateEquipmentApprovalMode`），套用 `requireAuth` 與 `requireAdmin` 中介層（一般成員呼叫時回傳 `403 FORBIDDEN`），並以 zod 驗證路徑參數 `equipmentId`（UUID）、分頁篩選參數與請求 body `{ requiresApproval: z.boolean() }`（不合法回 `400 VALIDATION_FAILED`）（FR-009、FR-010、SC-005、US3 情境 1、4、Edge Cases 一般成員越權存取待審清單、審核申請或修改設備審核設定）
  - **Must Read**
    - `contracts/openapi.yaml` → `listAdminEquipments`、`updateEquipmentApprovalMode`、`UpdateEquipmentApprovalModeRequest`、`Forbidden`、`ValidationFailed` — Why：路由路徑、zod 驗證規則與非管理員 `403 FORBIDDEN` 攔截
    - `spec.md` → US3 情境 4、FR-009、SC-005 — Why：一般成員嘗試變更設備人工審核設定時 100% 拒絕

### 前端（F4）

- [ ] T024 [US3] 在 `apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx` 擴充 F4 的「預建設備人工審核設定」管理區塊：呼叫 `GET /api/admin/equipments` 顯示每台預建單件設備的編號、名稱、分類、目前審核模式徽章（「需人工審核」或「免審核」）與最後更新時間，並提供「切換為需人工審核」／「切換為免審核」操作按鈕；點擊後呼叫 `PATCH /api/admin/equipments/:equipmentId/approval-mode`，儲存中按鈕顯示「儲存設定中…」並停用，成功後更新該設備卡片標示並顯示綠色成功橫幅說明既有「已核准／有效」預約與既有「待審核」申請均維持原狀態不變、新設定僅適用於後續新送出的預約申請（FR-009、FR-010、NFR-001、NFR-002、SC-003、SC-004、US3 情境 1–4）
  - **Must Read**
    - `ui/plan.md` → §3.3 `A11`、§4 `admin.html` 的「設備審核設定、待審清單與全體預約總覽」「切換設備審核設定中」「已切換設備審核設定（保留既有預約與待審）」 — Why：設備審核設定卡片、切換中狀態與切換成功橫幅文案
    - `ui/admin.html` → 雛形狀態「設備審核設定、待審清單與全體預約總覽」「切換設備審核設定中」「已切換設備審核設定（保留既有預約與待審）」 — Why：對照設備審核設定卡片與切換按鈕的實際視覺呈現
    - `contracts/openapi.yaml` → `listAdminEquipments`、`updateEquipmentApprovalMode` — Why：呼叫的設備設定 API 與回應欄位

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T025 [P] 在 `apps/equipment-loan/backend/tests/unit/` 與 `apps/equipment-loan/backend/tests/integration/` 擴充並執行 Vitest + Supertest 自動化驗證測試，連接真實 PostgreSQL 18 資料庫量測並確認：（1）成員對 `requires_approval = true` 設備送出申請 100% 進入 `pending_approval` 且不鎖定時段（另一成員可對同一時段送出待審申請，同一成員重複申請回 `409 DUPLICATE_PENDING_OR_ACTIVE_RESERVATION`，駁回或取消後可重送），對 `requires_approval = false` 設備送出 100% 立即成為 `confirmed` 並鎖定時段（SC-001、FR-002、FR-003）；（2）同一設備、同一日期與同一固定時段有多筆 `pending_approval` 申請時，以 `Promise.all` 並發送出核准請求，最終成功成為 `confirmed` 的預約恰好為 1 筆、其餘核准請求 100% 回 `409 RESERVATION_CONFLICT` 且維持 `pending_approval`，重複占用率 0%（SC-002、FR-006）；（3）管理員切換設備 `requires_approval` 設定（含免審核改需審核、需審核改免審核）時，100% 既有 `confirmed` 預約與既有 `pending_approval` 申請維持原狀態與效力，且第一版既有功能（7 位數大小寫驗證碼單次消耗、10 並發免審核搶約、時段開始前取消釋出）回歸測試通過率達 100%（SC-003、FR-010、FR-011）；（4）切換設備審核設定、送出待審申請、查詢待審清單、執行核准或駁回 API 回應時間均 `< 2 秒`（NFR-002、SC-004）；（5）一般成員嘗試呼叫 `GET /api/admin/equipments`、`PATCH /api/admin/equipments/:equipmentId/approval-mode`、`GET /api/admin/reservations/pending`、`POST /api/admin/reservations/:reservationId/approve` 或 `POST /api/admin/reservations/:reservationId/reject` 時 100% 回 `403 FORBIDDEN`（SC-005、FR-008、FR-009）
  - **Must Read**
    - `spec.md` → SC-001、SC-002、SC-003、SC-004、SC-005、NFR-002、FR-011 — Why：五項可量測成功標準、回應時間門檻與第一版回歸要求
    - `research.md` → §1、§2、§5 — Why：雙重部分唯一索引並發核准測試與跨迭代回歸測試設計
- [ ] T026 [P] 在 `apps/equipment-loan/frontend/tests/unit/` 與 `apps/equipment-loan/e2e/` 擴充並執行前端單元測試與 Playwright 端對端測試：驗證 US1（成員檢視需人工審核／免審核標示、送出待審申請顯示「本人待審核」、另一成員仍เห็น「可預約」並能送出待審申請、我的預約檢視駁回原因與取消待審或已核准申請）、US2（管理員於待審清單核准第一筆申請、核准同設備同時段第二筆待審申請遭衝突攔截、填寫原因駁回申請）、US3（管理員切換設備審核設定並維持既有已核准與待審紀錄效力、一般成員越權攔截），以及第一版驗證碼登入與免審核預約回歸、Light／Dark Mode 主題切換、臺灣繁體中文介面文字（NFR-001）與 360px／1120px 寬度操作正常
  - **Must Read**
    - `spec.md` → US1、US2、US3、NFR-001、SC-001、SC-002、SC-003、SC-005 — Why：三個 User Story 的獨立測試、驗收情境與跨迭代回歸要求
    - `ui/plan.md` → §2、§4、§5 — Why：視覺風格、RWD 寬度與各審核狀態／錯誤橫幅文字核對
- [ ] T027 [P] 更新 `apps/equipment-loan/README.md`，補充本次迭代新增的設備人工審核設定、待審申請與核准／駁回流程說明、無損資料庫遷移指令（`npm run db:migrate`）、擴充後的 demo seed 重設指令（`npm run db:seed`）與展示情境驗證步驟（FR-011、research §5）
  - **Must Read**
    - `plan.md` → `Source Code (repository root)` — Why：`apps/equipment-loan/README.md` 的用途說明
    - `research.md` → §1、§5 — Why：無損資料庫遷移與擴充後 demo seed 的預建資料說明
- [ ] T028 在 `apps/equipment-loan/backend/`、`apps/equipment-loan/frontend/` 與 `apps/equipment-loan/` 執行 `npm run check`（`tsc --noEmit`、ESLint、Prettier）、執行 `npm run db:seed` 確認展示資料重設成功，並執行全套單元、整合及 Playwright E2E 測試，確認全部零錯誤通過（FR-011、SC-003、research §4、§5）
  - **Must Read**
    - `research.md` → §4、§5 — Why：靜態檢查、型別檢查、demo seed 重設與全套自動化測試通過標準

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US2 需要 US1 的待審申請建立能力與 `reservationService.ts` 擴充，US3 需要 Phase 2 的 `requires_approval` 欄位與 US2 的 `AdminOverviewView.tsx` 管理頁面，建議依 P1（US1）→ P2（US2）→ P3（US3）順序推進
  - 同一 User Story 內的前端視圖元件與後端服務（不同檔案）可平行開發
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: 依賴 US1 擴充的 `reservationService.ts` 與待審申請資料，新增管理員待審清單查詢及核准／駁回功能
- **User Story 3 (P3)**: 依賴 Phase 2 的 `equipments.requires_approval` 欄位、US1 的 `equipmentService.ts` 與 US2 的 `adminRouter.ts`、`AdminOverviewView.tsx`，新增管理員設備人工審核設定切換功能

### Within Each User Story

- 資料庫與 seed（T009）→ 後端服務（T010～T013、T017～T018、T022）→ 後端路由（T010、T012、T019、T023）→ 前端視圖元件（T014～T015、T020、T024）→ `App.tsx` 串接（T016、T021）
- `equipmentService.ts`（T010 → T022）、`reservationService.ts`（T011 → T012 → T017 → T018）、`adminRouter.ts`（T019 → T023）、`AdminOverviewView.tsx`（T020 → T024）與 `App.tsx`（T016 → T021）跨任務修改同一檔案，必須依序執行
- Story complete before moving to next priority

### Parallel Opportunities

- Setup：T002、T003 可平行執行
- Foundational：T006 完成後，後端 T007 與前端 T008 可平行執行
- US1：前端 T014（`EquipmentBookingView.tsx` 與 `SlotStatusBadge.tsx`）、T015（`MyReservationsView.tsx`）可彼此平行，並可與後端 T010～T013 平行進行
- US2：前端 T020（`AdminOverviewView.tsx`）可與後端 T017～T019 平行進行
- US3：前端 T024（`AdminOverviewView.tsx` 設備設定區塊）可與後端 T022、T023 平行進行
- Polish：T025、T026、T027 可平行進行

---

## Parallel Example: User Story 1

```bash
# 後端 B2/B3 服務與前端 F2/F3 畫面同時開發：
Task: "擴充 listEquipments 回傳 requiresApproval 與 pending_by_me in apps/equipment-loan/backend/src/services/equipmentService.ts"
Task: "擴充設備審核標示與本人待審核時段畫面 in apps/equipment-loan/frontend/src/views/EquipmentBookingView.tsx"
Task: "擴充個人預約四種審核狀態與取消畫面 in apps/equipment-loan/frontend/src/views/MyReservationsView.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "實作 listPendingReservations、approveReservation 與 rejectReservation in apps/equipment-loan/backend/src/services/reservationService.ts"
Task: "實作管理員待審清單、核准與駁回原因對話框 in apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "實作 listAdminEquipments 與 updateEquipmentApprovalMode in apps/equipment-loan/backend/src/services/equipmentService.ts"
Task: "擴充管理員預建設備人工審核設定切換區塊 in apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 以 US1 的 Independent Test 驗證成員分辨需人工審核與免審核設備、送出待審申請不占位、檢視駁回原因與取消待審或已核准申請
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready（完成雙重部分唯一索引無損遷移與擴充 demo seed）
2. Add User Story 1 → Test independently → Deploy/Demo (MVP：成員申請需人工審核設備時段、追蹤審核狀態與取消)
3. Add User Story 2 → Test independently → Deploy/Demo（管理員於待審清單核准或駁回申請並重檢時段衝突）
4. Add User Story 3 → Test independently → Deploy/Demo（管理員動態切換設備人工審核設定並維持既有預約效力）
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done，每個故事依序推進，故事內前後端平行分工：
   - Developer A：後端（Prisma 雙重部分唯一索引交易、核准衝突重檢、設備審核設定與 Express 路由）
   - Developer B：前端（設備審核徽章、本人待審核狀態、駁回原因對話框、管理員待審清單與設備設定切換視圖）
3. 雙方以 `contracts/openapi.yaml` 為介面約定，故事完成後一起驗收

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- 待確認 1：固定時段代碼大小寫與設備可用欄位在資料模型與 API 合約命名不同（`data/data-model.dbml` 的 `time_slots.slot_code` 註解為小寫 `morning`、`afternoon`、`evening` 且 `equipments.status` 為 Enum `available`／`unavailable`；`contracts/openapi.yaml` 的 `EquipmentSlotAvailability.slotCode` 為大寫 `MORNING`、`AFTERNOON`、`EVENING` 且 `EquipmentWithSlotAvailability`、`AdminEquipmentSetting` 為布林欄位 `isActive`）。T006、T010 與 T022 延續第一版做法在後端轉換（將 `slot_code` 轉大寫輸出為 `slotCode`、將 `status === 'available'` 轉為 `isActive: true`）；若要完全統一命名，需同步更新 `data-model.dbml` 或 `openapi.yaml`
- 待確認 2：預約編號欄位在資料模型與 API 合約命名不同（`data/data-model.dbml` 的 `reservations.reservation_no` vs `contracts/openapi.yaml` 的 `Reservation.reservationNumber` 與 `AdminReservationItem.reservationNumber`）。T011、T012 與 T017 延續第一版做法在後端服務層將資料庫的 `reservation_no` 映射為 API 回應的 `reservationNumber`；若要統一欄位名稱，需同步更新 `data-model.dbml` 或 `openapi.yaml`
