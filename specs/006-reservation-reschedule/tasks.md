---

description: "Task list for 成員預約改期申請與改期成功前保留原預約 implementation"
---

# Tasks: 成員預約改期申請與改期成功前保留原預約 (Reservation Reschedule Request)

**Input**: Design documents from `/specs/006-reservation-reschedule/`（依下方 Reference Loading Contract 按任務載入）

**Tests**: spec.md 沒有明確要求撰寫自動化測試或 TDD，因此各使用者故事不產生測試任務。SC-001～SC-006 的量測（含 SC-006 前三次迭代既有功能回歸測試通過率）放在 Polish，以 research §5 決定的 Vitest 5、Supertest 7 與 Playwright 驗證。測試工具已在前三次迭代安裝，Setup 只確認既有工具與腳本，不另行安裝。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. 每個階段內再依 plan.md「系統介面盤點」的技術端點（資料庫、後端、前端）分組，標題列出該組實作的介面編號；每個任務下方以 Must Read／Optional 列出執行時要讀的文件部位。

## Reference Loading Contract

執行本檔的任務時，依下列規則載入 `/specs/006-reservation-reschedule/` 的文件：

1. 開工前只讀本檔，不預先讀 spec package 的其他文件。
2. 每個任務下方列出它的參考，分兩級：
   - **Must Read**：開始這個任務前一定要讀完的部位。
   - **Optional**：只在遇到該項 Why 描述的情況時才讀。
3. 每項參考寫成 `` `檔案` → 部位 — Why：理由 ``。Why 說明這個部位決定任務的哪一部分，讀的時候以它為重點。
4. 只讀列出的部位，不讀整份文件。部位以文件內可搜尋的識別字定位：
   - `contracts/openapi.yaml`：operationId，或 `components` 底下的 schema、response 名稱
   - `data/data-model.dbml`：`Table`、`Enum`、`Ref`，以及資料表內的索引名稱
   - `spec.md`：US 情境、FR／NFR／SC 編號、Edge Cases 項目、Key Entities 項目
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

- **Web app**: `apps/equipment-loan/backend/src/`、`apps/equipment-loan/frontend/src/`（依 plan.md 的 Structure Decision，本次沿用 005 的專案結構）
- Prisma schema、遷移檔與 demo seed 放在 `apps/equipment-loan/backend/prisma/`；後端測試放在 `apps/equipment-loan/backend/tests/unit/` 與 `apps/equipment-loan/backend/tests/integration/`；前端單元測試放在 `apps/equipment-loan/frontend/tests/unit/`；跨前後端 E2E 放在 `apps/equipment-loan/e2e/`
- 本次是既有系統的第 4 次迭代：任務以「擴充」或「確認」既有檔案為主，只新增 plan.md 列出的 `rescheduleService.ts`、`rescheduleRequestsRouter.ts`、`RescheduleDialog.tsx`，以及 Notes 列出的遷移檔與測試檔；不新增背景工作目錄（research §3）

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 依 plan.md 的 Source Code 確認 `apps/equipment-loan/` 既有的 `frontend/`、`backend/`、`e2e/`、`docker-compose.yml` 與 `README.md` 結構不變；記下本次要新增的 `apps/equipment-loan/backend/src/services/rescheduleService.ts`、`apps/equipment-loan/backend/src/routes/rescheduleRequestsRouter.ts` 與 `apps/equipment-loan/frontend/src/components/RescheduleDialog.tsx`，且不新增排程或背景工作目錄（research §3）
  - **Must Read**
    - `plan.md` → Source Code (repository root) — Why：前後端既有檔案與本次新增檔案的位置與職責
    - `plan.md` → Structure Decision — Why：只在既有模組內新增改期路由、服務與對話框元件，不新增背景工作目錄
- [ ] T002 [P] 確認 `apps/equipment-loan/backend/package.json` 與 `apps/equipment-loan/backend/prisma/schema.prisma` 的後端技術版本：Express 5、zod 4、TypeScript 6.0、Node.js 24 LTS 以上、`tsx`、Prisma ORM 7.10（`@prisma/adapter-pg`、`pg`）與 `previewFeatures = ["partialIndexes"]`；不安裝 `node-cron`、`pg_cron`、BullMQ、Redis 與 XState（research §1、§2、§3）
  - **Must Read**
    - `techstack.md` → 技術堆疊總覽 — Why：後端與資料儲存各套件採用的版本
    - `techstack.md` → 本次開發不引入的技術 — Why：不得安裝的排程、Redis 與狀態機套件
    - `research.md` → §1 — Why：維持 `partialIndexes` preview feature 以建立改期申請的部分唯一索引
- [ ] T003 [P] 確認 `apps/equipment-loan/frontend/package.json` 的前端技術版本：React 19、Vite 8、`@vitejs/plugin-react` 6、TypeScript 6.0、ESLint 10、`typescript-eslint` 8 與 Prettier；不安裝 react-day-picker、React Router、Zustand 與 react-i18next（research §4）
  - **Must Read**
    - `techstack.md` → 技術堆疊總覽 — Why：前端各套件採用的版本
    - `techstack.md` → 本次開發不引入的技術 — Why：不得安裝的日期選擇器、路由、全域狀態與國際化套件
    - `research.md` → §4 — Why：改期對話框重用既有 7 天 × 3 時段格子，不需要新套件
- [ ] T004 [P] 確認 `apps/equipment-loan/package.json` 與 `apps/equipment-loan/playwright.config.ts` 的測試腳本：`test:backend`（Vitest 5 + Supertest 7）、`test:frontend`（Vitest 5）、`test:e2e`（`@playwright/test` 1.65）、`db:migrate`、`db:seed` 與 `check` 都可執行（research §5）
  - **Must Read**
    - `research.md` → §5 — Why：本次沿用的測試工具與各自的用途
    - `techstack.md` → 技術堆疊總覽 — Why：測試工具的版本
- [ ] T005 在尚未修改程式的 005 版本上建立回歸基準：在 `apps/equipment-loan/` 執行 `docker compose up -d`、`npm run db:migrate`、`npm run db:seed`，再執行 `npm run test:backend`、`npm run test:frontend` 與 `npm run test:e2e`，記錄 003～005 既有測試的通過數，供 T054 比對（FR-015、SC-006）
  - **Must Read**
    - `spec.md` → FR-015、SC-006 — Why：前三次迭代既有功能必須完整保留，回歸測試通過率須達 100%
    - `research.md` → §5 — Why：要重跑的 003～005 全套整合測試與 E2E
  - **Optional**
    - `plan.md` → Source Code (repository root) — Why：需要確認 `docker-compose.yml` 與測試目錄位置時

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 資料庫（D1–D2 共用）

- [ ] T006 [P] 比對 `apps/equipment-loan/backend/prisma/schema.prisma` 與 data-model 中沿用 005 的資料表：D1 的 `users`、`captcha_challenges`、`sessions`，D2 的 `equipments`、`time_slots`、`reservations`（含 Enum `reservation_status` 的 6 個值、部分唯一索引 `uq_reservations_active_slot` 與 `uq_reservations_user_active_request`）；確認欄位、Enum 與索引一致，本次不修改這些資料表；發現差異時停下來回報（FR-015、FR-014）
  - **Must Read**
    - `data/data-model.dbml` → `Project "reservation-reschedule"` 的 Note — Why：沿用 005 的資料表、Enum 與索引皆不變，只以增量遷移新增改期申請
    - `data/data-model.dbml` → `Table users`、`Table captcha_challenges`、`Table sessions` — Why：D1 要比對的欄位與索引
    - `data/data-model.dbml` → `Table equipments`、`Table time_slots`、`Table reservations`、`Enum reservation_status` — Why：D2 要比對的欄位、6 態 Enum 與兩條部分唯一索引

### 後端（B1–B5 共用）

- [ ] T007 [P] 在 `apps/equipment-loan/backend/src/middleware/errorHandler.ts` 加入 5 個改期錯誤碼與 HTTP 狀態碼：`RESCHEDULE_NOT_ALLOWED`（409）、`RESCHEDULE_TARGET_INVALID`（400）、`RESCHEDULE_SLOT_CONFLICT`（409）、`RESCHEDULE_ALREADY_PENDING`（409）、`INVALID_RESCHEDULE_STATUS`（409）；保留既有錯誤碼，錯誤回應維持 `{ code, message }`，`message` 以臺灣繁體中文寫出失敗原因（NFR-001）
  - **Must Read**
    - `contracts/openapi.yaml` → `Error` — Why：錯誤回應格式與完整錯誤碼清單
    - `contracts/openapi.yaml` → `RescheduleBadRequest`、`CreateRescheduleConflict`、`RescheduleStatusConflict`、`ApproveRescheduleConflict` — Why：5 個新錯誤碼各自對應的 HTTP 狀態碼與情況
    - `spec.md` → NFR-001 — Why：錯誤提示必須明確說明失敗原因
- [ ] T008 [P] 在 `apps/equipment-loan/backend/src/utils/taipeiTime.ts` 擴充台灣時區工具：依預約日期與 `time_slots.start_time` 算出時段開始的 UTC 時間點、判斷時段在指定時間是否已開始、判斷日期是否在當日起算 7 天內；沿用既有 `Intl.DateTimeFormat`（`Asia/Taipei`）換算，供可改期檢查、核准檢查與自動失效共用（FR-001、FR-006、FR-011、FR-012）
  - **Must Read**
    - `research.md` → §3 — Why：時段開始時間沿用 `taipeiTime.ts` 的 `Asia/Taipei` 換算，失效時間要寫入時段開始時間
    - `data/data-model.dbml` → `Table time_slots` 的 `start_time` — Why：開始時間的格式與用途
    - `spec.md` → FR-001 — Why：7 天範圍與「尚未開始」的判斷依 `Asia/Taipei`
- [ ] T009 [P] 確認 `apps/equipment-loan/backend/src/middleware/authMiddleware.ts` 的 `requireAuth`（未登入回 `401 UNAUTHORIZED`）與 `requireAdmin`（一般成員回 `403 FORBIDDEN`）可直接套用到本次新增的改期路由，並提供目前使用者 ID 與角色；B1 的 `createCaptchaChallenge`、`login`、`getCurrentUser`、`logout` 行為不變（FR-005、FR-015、SC-006）
  - **Must Read**
    - `contracts/openapi.yaml` → `Unauthorized`、`Forbidden` — Why：未登入、角色不符與非本人資源的錯誤回應
    - `spec.md` → FR-005、SC-006 — Why：一般成員呼叫核准或駁回改期申請必須 100% 被拒絕
  - **Optional**
    - `contracts/openapi.yaml` → `login`、`getCurrentUser` — Why：需要確認 B1 登入與目前使用者回應未被改動時

### 前端（F2–F4 共用）

- [ ] T010 [P] 在 `apps/equipment-loan/frontend/src/text/zh-TW.ts` 加入改期相關的臺灣繁體中文文字：改期申請 5 態標籤（`pending_approval`「改期審核中」、`approved`「改期成功」、`rejected`「改期被駁回」、`withdrawn`「改期已撤回」、`expired`「改期已失效」）、時段狀態 `MY_RESCHEDULE_PENDING`「本人改期審核中」、4 種失效原因標籤（見 Notes 待確認 2）、5 個新錯誤碼的說明，以及「申請改期」、「撤回」、「改期申請」等按鈕與標示文字；預約 6 態標籤不變（NFR-001、FR-009、FR-017）
  - **Must Read**
    - `contracts/openapi.yaml` → `RescheduleRequestStatus`、`RescheduleExpireReason`、`SlotStatus` — Why：要對應標籤的狀態值與失效原因值
    - `contracts/openapi.yaml` → `Error` — Why：新錯誤碼的名稱
    - `spec.md` → NFR-001 — Why：新增介面文字、狀態標籤、按鈕與錯誤提示都要使用臺灣繁體中文
  - **Optional**
    - `ui/plan.md` → §4 `my-reservations.html` 的「預約清單與改期紀錄」 — Why：需要對照失效原因在畫面上的寫法時
- [ ] T011 在 `apps/equipment-loan/frontend/src/api/client.ts` 依合約加入或擴充 TypeScript 型別：`RescheduleRequestStatus`、`RescheduleExpireReason`、`RescheduleRequest`、`PendingRescheduleSummary`、`MyRescheduleSlotRef`、`AdminRescheduleRequestItem`、`AdminRescheduleRequestPage`、`CreateRescheduleRequestResponse`；`Reservation` 新增 `canReschedule`、`pendingRescheduleRequest`、`rescheduleRequests`，`AdminReservationItem` 新增 `pendingRescheduleRequest`，`EquipmentSlotAvailability` 新增 `myRescheduleRequest` 與 `SlotStatus` 的 `MY_RESCHEDULE_PENDING`、`availabilityStatus` 的 `reschedule_pending_by_me`（FR-009、FR-017）
  - **Must Read**
    - `contracts/openapi.yaml` → `RescheduleRequest`、`PendingRescheduleSummary`、`MyRescheduleSlotRef`、`CreateRescheduleRequestResponse` — Why：改期申請相關型別的欄位與可為 null 的欄位
    - `contracts/openapi.yaml` → `Reservation`、`AdminReservationItem`、`EquipmentSlotAvailability` — Why：既有型別要新增的欄位
    - `contracts/openapi.yaml` → `AdminRescheduleRequestItem`、`AdminRescheduleRequestPage` — Why：管理員改期申請清單的型別

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 成員把預約即時改到同一設備的另一個時段 (Priority: P1) 🎯 MVP

**Goal**: 成員在「我的預約」對原時段尚未開始的「已核准／有效」預約申請改期；免審核設備在新時段未被占用時立即改期，預約編號與狀態不變、原時段釋出，並建立「改期成功」的改期申請紀錄；不符合條件或新時段被占用時拒絕，原預約不變。

**Independent Test**: 準備一台「免審核」設備 X，成員 A 在 X 明日上午有一筆「已核准／有效」預約，X 明日下午尚未被占用；A 申請改到明日下午，驗證預約顯示明日下午、狀態仍為「已核准／有效」、預約編號不變，且成員 B 看到 X 明日上午為「可預約」。再讓成員 B 先預約 X 明日晚間，A 申請改到明日晚間，驗證系統拒絕且 A 的預約仍為明日下午。

### 資料庫（D2）

- [ ] T012 [US1] 在 `apps/equipment-loan/backend/prisma/schema.prisma` 新增 Enum `reschedule_request_status`（`pending_approval`、`approved`、`rejected`、`withdrawn`、`expired`）、Enum `reschedule_expire_reason`（`original_slot_started`、`new_slot_started`、`reservation_cancelled`、`reservation_checked_out`）與資料表 `reschedule_requests`：`id`、`request_no`（唯一，見 Notes 待確認 1）、`reservation_id`、`user_id`、`from_reservation_date`、`from_slot_id`、`to_reservation_date`、`to_slot_id`、`status`（預設 `pending_approval`）、`reviewed_by`、`reviewed_at`、`reject_reason`（`VarChar(200)`）、`withdrawn_at`、`expired_at`、`expire_reason`，以及 `created_at`、`updated_at`、`updated_by`、`deleted_at`；關聯指向 `reservations`、`users`、`time_slots`；以 `partialIndexes` 建立 `uq_reschedule_requests_pending_per_reservation`（`WHERE status = 'pending_approval' AND deleted_at IS NULL`），並建立 `idx_reschedule_requests_status_to_slot`、`idx_reschedule_requests_reservation_created`；不修改既有 model 的欄位、Enum 與索引（FR-002、FR-004、FR-009、FR-015）
  - **Must Read**
    - `data/data-model.dbml` → `Enum reschedule_request_status`、`Enum reschedule_expire_reason` — Why：兩個新 Enum 的值與每個值代表的情況
    - `data/data-model.dbml` → `Table reschedule_requests` — Why：欄位型別、可為 null 的欄位、預設值、部分唯一索引條件與兩個查詢索引
    - `data/data-model.dbml` → `Ref: reschedule_requests.reservation_id > reservations.id`、`Ref: reschedule_requests.user_id > users.id`、`Ref: reschedule_requests.reviewed_by > users.id`、`Ref: reschedule_requests.from_slot_id > time_slots.id`、`Ref: reschedule_requests.to_slot_id > time_slots.id` — Why：5 條外鍵關聯
    - `research.md` → §1 — Why：以一支增量遷移新增資料，不修改 `reservations` 既有欄位與兩條部分唯一索引
- [ ] T013 [US1] 在 `apps/equipment-loan/backend/prisma/migrations/` 以 `npx prisma migrate dev --create-only --name reschedule_requests` 產生增量遷移，檢查 `migration.sql` 只含新增 Enum、`reschedule_requests` 資料表、外鍵與索引，`uq_reschedule_requests_pending_per_reservation` 帶有 `WHERE` 條件，且沒有對既有資料表的 `ALTER`、`UPDATE`、`DROP`；在保有 005 資料的資料庫（T005 的狀態）執行 `npm run db:migrate` 並重新產生 Prisma Client，比對遷移前後 `reservations` 的筆數、`reservation_no`、`status`、`reservation_date` 與 `slot_id` 完全相同（FR-015、US1 情境 7）
  - **Must Read**
    - `research.md` → §1 — Why：增量遷移的內容與「不改寫既有資料列」的無損遷移要求
    - `spec.md` → US1 情境 7、FR-015 — Why：升級後既有預約的狀態、日期與時段必須與升級前相同
    - `data/data-model.dbml` → `Table reschedule_requests` 的 `uq_reschedule_requests_pending_per_reservation` — Why：部分唯一索引必須帶的 `WHERE` 條件
- [ ] T014 [US1] 在 `apps/equipment-loan/backend/prisma/seed.ts` 擴充 demo seed 的 US1 範例：保留 005 的預建帳號、4 台設備、3 個固定時段與預約 6 態範例；依執行當下的 `Asia/Taipei` 日期動態建立免審核設備（`EQ-104`）上一筆可即時改期的 `confirmed` 預約（同設備有未被占用的時段，另有一個時段被陳冠廷的 `confirmed` 預約占用，供展示改期被拒），以及免審核設備（`EQ-103`）上一筆 `approved` 改期申請範例（`reviewed_by`、`reviewed_at` 為 null），改期申請編號依 Notes 待確認 1 的暫行做法產生（FR-015）
  - **Must Read**
    - `spec.md` → FR-015 — Why：demo seed 必須包含免審核設備上可即時改期的預約與「改期成功」範例
    - `research.md` → §5 — Why：seed 依執行當下日期動態建立，並保留 005 的 6 態範例
    - `ui/plan.md` → §4 `my-reservations.html` 的「預約清單與改期紀錄」「申請改期（免審核設備）」 — Why：要展示的預約、可改期時段與被占用時段的情境
    - `data/data-model.dbml` → `Table reschedule_requests` — Why：`approved` 即時改期紀錄要填與留空的欄位
  - **Optional**
    - `ui/my-reservations.html` → 雛形狀態「預約清單與改期紀錄」 — Why：需要對照雛形的設備、時段與改期紀錄排列時

### 後端（B2、B3）

- [ ] T015 [US1] 新增 `apps/equipment-loan/backend/src/services/rescheduleService.ts`，實作 `createRescheduleRequest({ userId, reservationId, toReservationDate, toSlotId })`（`POST /api/reservations/:reservationId/reschedule-requests`）的可改期檢查與免審核即時改期：在單一 `prisma.$transaction(async (tx) => ...)` 內，預約或時段不存在回 `404 RESOURCE_NOT_FOUND`，非本人預約回 `403 FORBIDDEN`；預約不是 `confirmed` 或原時段已開始回 `409 RESCHEDULE_NOT_ALLOWED`；新時段與原時段相同、已開始、超出當日起算 7 天，或本人在同一設備、日期與時段已有 `pending_approval`、`confirmed`、`checked_out` 預約時回 `400 RESCHEDULE_TARGET_INVALID`；新時段已被 `confirmed`、`checked_out` 或 `returned` 紀錄占用時回 `409 RESCHEDULE_SLOT_CONFLICT`；設備在送出當下 `requires_approval = false` 時，更新該筆 `reservations` 的 `reservation_date`、`slot_id`、`updated_at`、`updated_by`（`id`、`reservation_no`、`status` 不變），並建立 `status = 'approved'` 的 `reschedule_requests`（保存 `from_*`、`to_*`，`reviewed_by`、`reviewed_at` 為 null）；寫入時違反 `uq_reservations_active_slot`（Prisma `P2002`）轉成 `409 RESCHEDULE_SLOT_CONFLICT` 並讓交易回滾；回傳 `CreateRescheduleRequestResponse`；`request_no` 的產生見 Notes 待確認 1；錯誤訊息依 ui/plan.md §5 寫出預約編號與時段；`requires_approval = true` 的路徑由 T026 實作（FR-001、FR-002、FR-014、SC-001、US1 情境 1、3–6）
  - **Must Read**
    - `contracts/openapi.yaml` → `createRescheduleRequest`（含 `RescheduleBadRequest`、`CreateRescheduleConflict`） — Why：各項檢查的順序、錯誤碼與 `201` 回應內容
    - `research.md` → §2 — Why：單一互動式交易內完成檢查與寫入，`P2002` 轉成 `409`
    - `data/data-model.dbml` → `Table reservations` 的 `uq_reservations_active_slot`、`uq_reservations_user_active_request` — Why：新時段占用與本人重複預約由這兩條部分唯一索引保護
    - `spec.md` → FR-001、FR-002 — Why：可改期條件與即時改期時預約編號、狀態不變、原時段釋出
  - **Optional**
    - `ui/plan.md` → §5 `my-reservations.html` 的「新時段已被占用」「預約已不可改期」 — Why：需要對照錯誤訊息的寫法時
    - `spec.md` → Key Entities「改期申請 (Reschedule Request)」 — Why：需要確認免審核即時改期時審核欄位為空時
- [ ] T016 [US1] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 擴充 B3 `listMyReservations`（`GET /api/reservations`）與 `listMyLoanReservations`（`GET /api/reservations/my`）的回應轉換：每筆預約加上 `canReschedule`（`status` 為 `confirmed`、原時段尚未開始且沒有改期審核中申請時為 true，由 005 升級的既有預約同樣計算）、`pendingRescheduleRequest`（`PendingRescheduleSummary` 或 null）、`rescheduleRequests`（依 `createdAt` 由新到舊、相同時依 `id` 由小到大，含 `reviewedByDisplayName` 與 `canWithdraw`）與 `equipmentRequiresApproval`；`cancelReservation` 的回應使用同一轉換；欄位命名對應沿用 005（見 Notes 待確認 5）（FR-001、FR-004、FR-009、US1 情境 4、7）
  - **Must Read**
    - `contracts/openapi.yaml` → `listMyReservations`、`listMyLoanReservations` — Why：`canReschedule` 的計算條件與改期紀錄的回傳要求
    - `contracts/openapi.yaml` → `Reservation`、`RescheduleRequest`、`PendingRescheduleSummary` — Why：回應欄位、排序與可為 null 的欄位
    - `data/data-model.dbml` → `Table reschedule_requests` 的 `idx_reschedule_requests_reservation_created` — Why：依預約列出改期紀錄的查詢索引
- [ ] T017 [US1] 在 `apps/equipment-loan/backend/src/routes/reservationsRouter.ts` 掛上 `POST /api/reservations/:reservationId/reschedule-requests`（`createRescheduleRequest`）：套用 `requireAuth`，以 zod 驗證路徑參數 uuid 與 `CreateRescheduleRequestRequest`（`toReservationDate` 為 `YYYY-MM-DD`、`toSlotId` 為 uuid），不符時回 `400 VALIDATION_FAILED`；成功回 `201`（FR-001、FR-002）
  - **Must Read**
    - `contracts/openapi.yaml` → `createRescheduleRequest`、`CreateRescheduleRequestRequest` — Why：路徑、請求欄位格式、狀態碼與回應
- [ ] T018 [US1] 在 `apps/equipment-loan/backend/src/services/equipmentService.ts` 與 `apps/equipment-loan/backend/src/routes/equipmentsRouter.ts` 擴充 B2 `listEquipments`（`GET /api/equipments`）：新增選填查詢參數 `equipmentId`（zod uuid，不符時回 `400 VALIDATION_FAILED`），只回傳該設備；確認即時改期後原時段不再被該預約占用，對其他成員回傳 `AVAILABLE`；`slotCode`、`isActive` 等欄位對應沿用 005（見 Notes 待確認 5）（FR-001、FR-002、US1 情境 2）
  - **Must Read**
    - `contracts/openapi.yaml` → `listEquipments` — Why：`equipmentId` 篩選條件與原時段釋出後的狀態
    - `contracts/openapi.yaml` → `EquipmentSlotAvailability` — Why：時段狀態欄位與 `isBookable` 的條件
- [ ] T019 [US1] 確認 `apps/equipment-loan/backend/src/services/reservationService.ts` 的 B2 `createReservation`（`POST /api/reservations`）：與即時改期同時搶同一設備、日期與時段時，寫入違反 `uq_reservations_active_slot` 的請求回 `409 RESERVATION_CONFLICT`，訊息為「預約失敗：… 剛被其他預約占用，請改選其他時段。」；改期成功後釋出的原時段可以照常預約（FR-014、US1 情境 2、6、Edge Cases 同時搶同一新時段）
  - **Must Read**
    - `contracts/openapi.yaml` → `createReservation`（含 `CreateReservationConflict`） — Why：與改期同時占用時只有一筆成功，失敗回 `RESERVATION_CONFLICT`
    - `spec.md` → FR-014、Edge Cases「同時搶同一新時段」 — Why：同時占用只能一筆成功，改期失敗者原預約不變
  - **Optional**
    - `ui/plan.md` → §5 `booking.html` 的「時段已被占用」 — Why：需要對照錯誤訊息的寫法時

### 前端（F1、F2、F3）

- [ ] T020 [P] [US1] 在 `apps/equipment-loan/frontend/src/views/LoginView.tsx` 把預建帳號旁的提醒區塊改為「預約與改期提醒」，列出 3 點：開放當日起算 7 天內尚未開始的固定時段；原時段尚未開始的「已核准／有效」預約，可以在「我的預約」申請改期到同一台設備的另一個時段；改期成功之前，原本的預約照常有效；登入流程不變（FR-015、NFR-001）
  - **Must Read**
    - `ui/index.html` → 雛形狀態「待登入」 — Why：提醒區塊的標題與 3 點文字
    - `ui/plan.md` → §4 `index.html` 的「待登入」 — Why：登入頁的預設呈現
- [ ] T021 [US1] 在 `apps/equipment-loan/frontend/src/api/client.ts` 新增 `createRescheduleRequest(reservationId, { toReservationDate, toSlotId })` 呼叫 `POST /api/reservations/:reservationId/reschedule-requests`，並讓 `listEquipments` 接受選填的 `equipmentId`（FR-001、FR-002）
  - **Must Read**
    - `contracts/openapi.yaml` → `createRescheduleRequest`、`listEquipments` — Why：請求參數、回應型別與錯誤碼
- [ ] T022 [US1] 新增 `apps/equipment-loan/frontend/src/components/RescheduleDialog.tsx` 申請改期對話框：顯示預約編號、設備（含「免審核」或「需人工審核」）與原時段；以 `listEquipments({ date, equipmentId })` 逐日取得當日起算 7 天的同一設備時段狀態（合約一次只查一天），組成 7 天 × 3 時段格子，另加第 8 天欄位標示「未開放」；格子依狀態標示「原時段」、「已開始」、「本人已有預約」、「已被預約」、「可改期」；點選非「可改期」格子時依 ui/plan.md §5 顯示紅色提示；沒選新時段就送出時顯示「請先選擇一個標示「可改期」的新時段。」；送出中按鈕改為「送出改期中…」並停用格子；免審核設備顯示綠色說明「這台設備免審核：送出時新時段仍未被占用，就立即改期…」；`RESCHEDULE_SLOT_CONFLICT` 時在對話框顯示「改期失敗：… 沒有任何變更。」並把該格改為「已被預約」；置中彈窗，手機寬度改為全螢幕、格子可左右捲動（FR-001、FR-002、FR-014、NFR-001、US1 情境 3、5）
  - **Must Read**
    - `ui/plan.md` → §3.3 A10、A11 — Why：選新時段與送出的操作
    - `ui/plan.md` → §4 `my-reservations.html` 的「申請改期（免審核設備）」「送出改期中」 — Why：對話框、格子標示與送出中的呈現
    - `ui/plan.md` → §5 `my-reservations.html` 的「未選擇新時段」「新時段與原時段相同」「新時段已開始」「新時段超出 7 天」「新時段已被預約」「本人在新時段已有預約」「新時段已被占用」 — Why：每種不可選情況的提示文字
    - `ui/my-reservations.html` → 雛形狀態「申請改期（免審核設備）」「送出改期中」「新時段已被占用」 — Why：對話框配置與格子樣式的實際樣子
    - `contracts/openapi.yaml` → `listEquipments`、`EquipmentSlotAvailability` — Why：判斷格子狀態要用的 `slotStatus`、`myReservationId` 與 `isBookable`
  - **Optional**
    - `ui/plan.md` → §2 — Why：需要確認對話框在手機寬度的版面規則時
- [ ] T023 [US1] 在 `apps/equipment-loan/frontend/src/views/MyReservationsView.tsx` 串接即時改期：只對 `canReschedule` 為 true 的預約顯示「申請改期」，點擊後開啟 `RescheduleDialog`；即時改期成功後重新載入清單，頁頂綠色橫幅「改期成功：預約 …已改到 …，預約編號與「已核准／有效」狀態不變；原時段 … 已釋出。」並附「到設備預約查看時段」；`RESCHEDULE_NOT_ALLOWED` 時頁頂紅色橫幅「無法改期：…只有原時段尚未開始的「已核准／有效」預約可以改期。」；原時段已開始的「已核准／有效」預約顯示「原時段已開始，不能申請改期或取消；請在時段結束前到現場由管理員登記領取。」（FR-001、FR-002、NFR-002、US1 情境 1、4、7）
  - **Must Read**
    - `ui/plan.md` → §4 `my-reservations.html` 的「預約清單與改期紀錄」「即時改期成功」 — Why：哪些預約顯示「申請改期」與成功橫幅的文字
    - `ui/plan.md` → §5 `my-reservations.html` 的「預約已不可改期」 — Why：不可改期時的畫面與提示
    - `ui/my-reservations.html` → 雛形狀態「預約清單與改期紀錄」「即時改期成功」「預約已不可改期」 — Why：預約卡片按鈕位置與橫幅的實際樣子
    - `contracts/openapi.yaml` → `Reservation` 的 `canReschedule` — Why：顯示「申請改期」的條件
- [ ] T024 [US1] 確認 `apps/equipment-loan/frontend/src/views/EquipmentBookingView.tsx`：即時改期後原時段對其他成員顯示「可預約」並可預約；送出預約收到 `RESERVATION_CONFLICT` 時頁頂紅色橫幅「預約失敗：… 剛被其他預約占用，請改選其他時段。」並把該時段改為「已被預約」（FR-002、FR-014、US1 情境 2、6）
  - **Must Read**
    - `ui/plan.md` → §4 `booking.html` 的「即時改期後原時段釋出（其他成員視角）」 — Why：原時段釋出後的呈現
    - `ui/plan.md` → §5 `booking.html` 的「時段已被占用」 — Why：同時搶占失敗的提示文字與時段狀態
    - `ui/booking.html` → 雛形狀態「即時改期後原時段釋出（其他成員視角）」「時段已被占用」 — Why：時段格子與橫幅的實際樣子

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 需人工審核設備的改期由管理員審核，核准前保留原預約 (Priority: P2)

**Goal**: 需人工審核設備的改期送出後建立「改期審核中」申請，原預約維持「已核准／有效」並占用原時段、新時段不保留；管理員在待審清單的「改期申請」分頁核准或駁回，核准時重檢衝突，新時段被占用時拒絕核准且原預約不變。

**Independent Test**: 準備一台「需人工審核」設備 Y，成員 A 在 Y 後天上午有一筆「已核准／有效」預約；A 申請改到 Y 後天晚間，驗證出現「改期審核中」的改期申請、原預約仍為後天上午、成員 B 看到後天晚間為「可預約」。管理員核准後，驗證預約改到後天晚間、後天上午釋出。再準備第二筆改期申請並讓 B 先占用新時段，驗證管理員核准被拒、原預約不變，駁回後改期申請為「改期被駁回」。

### 資料庫（D2）

- [ ] T025 [US2] 在 `apps/equipment-loan/backend/prisma/seed.ts` 擴充 demo seed 的 US2 範例：維持 `EQ-101`、`EQ-102` 為 `requires_approval = true`；依執行當下的 `Asia/Taipei` 日期動態建立一筆可以核准的 `pending_approval` 改期申請（林雅婷、新時段未被占用）、一筆新時段已被其他 `confirmed` 預約占用而核准會被拒的 `pending_approval` 改期申請（陳冠廷），以及一筆 `rejected` 改期申請範例（`reviewed_by` 為吳承翰、填寫 `reject_reason`），改期申請編號見 Notes 待確認 1；執行 `npm run db:seed` 後確認管理員待審清單至少有這兩筆改期審核中申請（FR-015、US2 情境 8）
  - **Must Read**
    - `spec.md` → US2 情境 8、FR-015 — Why：seed 重設後待審清單必須有可核准與核准會被拒的申請
    - `ui/plan.md` → §4 `admin.html` 的「審核設定、待審清單與借用管理總覽」 — Why：待審清單要展示的改期申請情境
    - `ui/plan.md` → §5 `admin.html` 的「核准時新時段已被占用」 — Why：核准會被拒的申請與占用預約的關係
  - **Optional**
    - `ui/admin.html` → 雛形狀態「審核設定、待審清單與借用管理總覽」 — Why：需要對照雛形的成員、設備與原／新時段組合時

### 後端（B3、B4、B6）

- [ ] T026 [US2] 在 `apps/equipment-loan/backend/src/services/rescheduleService.ts` 的 `createRescheduleRequest` 加入需人工審核路徑與單一審核中限制：兩條路徑都先檢查該預約是否已有 `pending_approval` 的改期申請，有時回 `409 RESCHEDULE_ALREADY_PENDING`，訊息為「無法送出：預約 … 已有一筆改期審核中的申請 …，請先撤回這筆申請，再重新申請改期。」；設備在送出當下 `requires_approval = true` 時，只建立 `status = 'pending_approval'` 的 `reschedule_requests`（`request_no` 見 Notes 待確認 1），不寫入 `reservations`、不保留新時段；並發建立時違反 `uq_reschedule_requests_pending_per_reservation`（`P2002`）同樣轉成 `409 RESCHEDULE_ALREADY_PENDING`，與 `uq_reservations_active_slot` 的 `P2002` 分開判斷（FR-003、FR-004、FR-008、SC-002、US2 情境 1、2）
  - **Must Read**
    - `contracts/openapi.yaml` → `createRescheduleRequest`（含 `CreateRescheduleConflict`） — Why：需人工審核設備建立改期審核中申請與 `RESCHEDULE_ALREADY_PENDING` 的情況
    - `data/data-model.dbml` → `Table reschedule_requests` 的 `uq_reschedule_requests_pending_per_reservation` — Why：同一預約最多一筆改期審核中申請的資料庫保證
    - `research.md` → §1、§2 — Why：改期審核期間原預約列完全不被寫入，並發送出時只會成立一筆
  - **Optional**
    - `ui/plan.md` → §5 `my-reservations.html` 的「已有改期審核中申請」 — Why：需要對照錯誤訊息的寫法時
- [ ] T027 [US2] 在 `apps/equipment-loan/backend/src/services/rescheduleService.ts` 實作 `listRescheduleRequests({ status, equipmentId, page, pageSize })`（`GET /api/admin/reschedule-requests`）：只取未軟刪除的申請，依 `toReservationDate` 由近到遠、`toSlot.sortOrder` 由小到大、`createdAt` 由早到晚、`id` 由小到大排序；回傳 `AdminRescheduleRequestPage`，每筆含申請成員、預約編號、設備、原日期時段、新日期時段與申請時間；不受設備目前 `requires_approval` 影響（FR-005、FR-008、US2 情境 3、7）
  - **Must Read**
    - `contracts/openapi.yaml` → `listRescheduleRequests` — Why：篩選條件、排序、分頁與越界頁碼的規則
    - `contracts/openapi.yaml` → `AdminRescheduleRequestItem`、`AdminRescheduleRequestPage` — Why：每筆申請的回應欄位
    - `data/data-model.dbml` → `Table reschedule_requests` 的 `idx_reschedule_requests_status_to_slot` — Why：待審清單排序使用的索引
- [ ] T028 [US2] 在 `apps/equipment-loan/backend/src/services/rescheduleService.ts` 實作 `approveRescheduleRequest({ adminUserId, rescheduleRequestId })`（`POST /api/admin/reschedule-requests/:rescheduleRequestId/approve`）：在單一交易內檢查申請仍為 `pending_approval`（否則 `409 INVALID_RESCHEDULE_STATUS`）、原預約仍為 `confirmed`、原時段與新時段都尚未開始、新時段未被 `confirmed`、`checked_out` 或 `returned` 紀錄占用；通過時更新原預約的 `reservation_date`、`slot_id`、`updated_by`（`id`、`reservation_no`、`status` 不變），申請改為 `approved` 並寫入 `reviewed_by`、`reviewed_at`；新時段被占用或寫入時違反 `uq_reservations_active_slot` 回 `409 RESCHEDULE_SLOT_CONFLICT`，交易回滾、申請維持 `pending_approval`；錯誤訊息寫出占用的預約編號（見 Notes 待確認 4）；回傳 `AdminRescheduleRequestItem`（FR-006、FR-014、SC-002、US2 情境 3、4、Edge Cases 核准時新時段已被他人占用）
  - **Must Read**
    - `contracts/openapi.yaml` → `approveRescheduleRequest`（含 `ApproveRescheduleConflict`） — Why：核准時的重檢項目、錯誤碼與回滾後的狀態
    - `spec.md` → FR-006、Edge Cases「核准時新時段已被他人占用」 — Why：核准成功與被拒時預約與申請各自的結果
    - `research.md` → §2 — Why：核准在單一交易內完成，衝突以 `P2002` 轉成 `409`
  - **Optional**
    - `ui/plan.md` → §5 `admin.html` 的「核准時新時段已被占用」 — Why：需要對照錯誤訊息的寫法時
- [ ] T029 [US2] 在 `apps/equipment-loan/backend/src/services/rescheduleService.ts` 實作 `rejectRescheduleRequest({ adminUserId, rescheduleRequestId, rejectReason })`（`POST /api/admin/reschedule-requests/:rescheduleRequestId/reject`）：申請不是 `pending_approval` 時回 `409 INVALID_RESCHEDULE_STATUS`；申請改為 `rejected`，寫入 `reviewed_by`、`reviewed_at` 與選填的 `reject_reason`，原預約的日期、時段與狀態不變；回傳 `AdminRescheduleRequestItem`（FR-007、SC-002、US2 情境 5）
  - **Must Read**
    - `contracts/openapi.yaml` → `rejectRescheduleRequest`、`RejectRescheduleRequestRequest` — Why：駁回原因上限、錯誤碼與回應
    - `spec.md` → FR-007 — Why：駁回要記錄的資料，以及原預約不得變動
- [ ] T030 [US2] 在 `apps/equipment-loan/backend/src/routes/adminRouter.ts` 掛上 `GET /api/admin/reschedule-requests`（`listRescheduleRequests`）、`POST /api/admin/reschedule-requests/:rescheduleRequestId/approve`（`approveRescheduleRequest`）、`POST /api/admin/reschedule-requests/:rescheduleRequestId/reject`（`rejectRescheduleRequest`）：三者都套用 `requireAuth` 與 `requireAdmin`（一般成員回 `403 FORBIDDEN`）；以 zod 驗證 `status`（`RescheduleRequestStatus`）、`equipmentId`、`page`、`pageSize`（不合法回 `400 PAGINATION_INVALID`）、路徑參數 uuid 與 `rejectReason`（最多 200 字，不符回 `400 VALIDATION_FAILED`）（FR-005、SC-006、US2 情境 6）
  - **Must Read**
    - `contracts/openapi.yaml` → `listRescheduleRequests`、`approveRescheduleRequest`、`rejectRescheduleRequest` — Why：三個路由的路徑、參數、狀態碼與回應
    - `contracts/openapi.yaml` → `PaginationOrQueryInvalid`、`Forbidden` — Why：分頁錯誤與一般成員越權的回應
    - `spec.md` → FR-005、US2 情境 6 — Why：一般成員呼叫核准或駁回必須被拒並回傳權限不足的提示
- [ ] T031 [US2] 確認 `apps/equipment-loan/backend/src/services/equipmentService.ts` 的 B6 `updateEquipmentApprovalMode`（`PATCH /api/admin/equipments/:equipmentId/approval-mode`）不更新任何 `reschedule_requests`：切換前送出的改期審核中申請維持 `pending_approval` 並留在待審清單，切換後新送出的改期依最新設定判斷（FR-008、US2 情境 7）
  - **Must Read**
    - `contracts/openapi.yaml` → `updateEquipmentApprovalMode` — Why：切換時既有預約與改期審核中申請都維持原狀態
    - `spec.md` → FR-008 — Why：切換前後送出的改期各自的處理方式
- [ ] T032 [US2] 確認 `apps/equipment-loan/backend/src/services/reservationService.ts` 的 B4 `approveReservation`（`POST /api/admin/reservations/:reservationId/approve`）：改期成功釋出原時段後，針對該時段的待審預約可以照常核准；他人改期審核中申請的新時段不阻擋核准；與即時改期、核准改期同時占用同一時段時只有一筆成功，失敗回 `409 RESERVATION_CONFLICT`（FR-002、FR-006、FR-014、Edge Cases 改期成功後原時段的其他待審申請）
  - **Must Read**
    - `contracts/openapi.yaml` → `approveReservation` — Why：釋出時段後可核准、改期審核中申請不占用時段，以及衝突時的錯誤碼
    - `spec.md` → Edge Cases「改期成功後原時段的其他待審申請」 — Why：原時段釋出後待審預約可以依 004 規則核准

### 前端（F3、F4）

- [ ] T033 [US2] 在 `apps/equipment-loan/frontend/src/api/client.ts` 新增 `listRescheduleRequests({ status, equipmentId, page, pageSize })`、`approveRescheduleRequest(rescheduleRequestId)` 與 `rejectRescheduleRequest(rescheduleRequestId, { rejectReason })`（FR-005、FR-006、FR-007）
  - **Must Read**
    - `contracts/openapi.yaml` → `listRescheduleRequests`、`approveRescheduleRequest`、`rejectRescheduleRequest` — Why：三個呼叫的參數、回應型別與錯誤碼
- [ ] T034 [US2] 在 `apps/equipment-loan/frontend/src/components/RescheduleDialog.tsx` 依 `equipmentRequiresApproval` 顯示需人工審核設備的琥珀色說明「這台設備需人工審核：送出後建立「改期審核中」的申請。管理員核准前，原預約照常有效並繼續占用原時段，新時段不會替您保留。」（FR-003、US2 情境 1）
  - **Must Read**
    - `ui/plan.md` → §4 `my-reservations.html` 的「申請改期（需人工審核設備）」 — Why：需人工審核設備的說明文字與格子標示
    - `ui/my-reservations.html` → 雛形狀態「申請改期（需人工審核設備）」 — Why：說明區塊的實際樣子
- [ ] T035 [US2] 在 `apps/equipment-loan/frontend/src/views/MyReservationsView.tsx` 處理改期審核中申請的送出結果：`rescheduleRequest.status` 為 `pending_approval` 時頁頂琥珀色橫幅「改期申請 … 已送出，目前為「改期審核中」。管理員核准前，預約 … 仍為 … 的「已核准／有效」；新時段 … 不會替您保留。」，重新載入後該預約不再顯示「申請改期」；`RESCHEDULE_ALREADY_PENDING` 時頁頂紅色橫幅顯示須先撤回的提示（FR-003、FR-004、US2 情境 1、2）
  - **Must Read**
    - `ui/plan.md` → §4 `my-reservations.html` 的「改期申請已送出」 — Why：送出後的橫幅文字與按鈕隱藏
    - `ui/plan.md` → §5 `my-reservations.html` 的「已有改期審核中申請」 — Why：重複送出時的提示文字
    - `ui/my-reservations.html` → 雛形狀態「改期申請已送出」「已有改期審核中申請」 — Why：橫幅的實際樣子
- [ ] T036 [US2] 在 `apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx` 的待審清單加入「改期申請（n）」與「預約申請（n）」分頁，預設顯示改期申請：以 `listRescheduleRequests({ status: 'pending_approval' })` 取得清單，每筆顯示「改期申請」標示、改期申請編號、成員、預約編號、設備、「原 … → 新 …」與申請時間，提供「核准改期」與「駁回」；核准中按鈕改為「核准中…」並停用；核准成功後頁頂綠色橫幅「已核准改期申請 …：…已改到 …，狀態仍為「已核准／有效」；原時段 … 已釋出。審核管理員 …，審核時間 …。」並移出清單；`RESCHEDULE_SLOT_CONFLICT` 時該列紅框並顯示頁頂紅色橫幅，申請留在清單（見 Notes 待確認 4）；清單為空時顯示「目前沒有待審的改期申請」；「預約申請」分頁沿用既有待審預約清單（FR-005、FR-006、US2 情境 3、4）
  - **Must Read**
    - `ui/plan.md` → §3.3 A14、A15 — Why：切換分頁與核准改期的操作
    - `ui/plan.md` → §4 `admin.html` 的「審核設定、待審清單與借用管理總覽」「待審預約申請分頁」「核准改期處理中」「改期核准成功」「待審清單沒有改期申請」 — Why：清單、分頁、處理中與成功的呈現
    - `ui/plan.md` → §5 `admin.html` 的「核准時新時段已被占用」 — Why：核准被拒時該列與橫幅的呈現
    - `ui/admin.html` → 雛形狀態「審核設定、待審清單與借用管理總覽」「改期核准成功」「核准時新時段已被占用」 — Why：清單項目配置與橫幅的實際樣子
    - `contracts/openapi.yaml` → `approveRescheduleRequest` — Why：核准的錯誤碼與回應
- [ ] T037 [US2] 在 `apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx` 加入改期駁回、審核設定切換提示與越權畫面：「駁回」開啟「駁回改期申請」對話框，列出改期申請、成員、設備、原時段與新時段，駁回原因欄顯示「n / 200」，超過 200 字時欄位紅框並顯示「駁回原因最多 200 字，目前 n 字。」且不關閉；「確認駁回」處理中改為「駁回中…」；駁回成功後頁頂綠色橫幅說明狀態變成「改期被駁回」、原預約不變；切換設備審核設定後的提示列出仍留在待審清單的改期審核中申請；一般成員開啟時隱藏管理區塊，顯示「權限不足」卡片與「返回設備預約」、「切換管理員帳號登入」（FR-005、FR-007、FR-008、SC-006、US2 情境 5–7）
  - **Must Read**
    - `ui/plan.md` → §3.3 A16、A17 — Why：駁回與切換審核設定的操作
    - `ui/plan.md` → §4 `admin.html` 的「填寫改期駁回原因」「駁回改期處理中」「改期已駁回」「已切換設備審核設定」 — Why：駁回對話框、處理中、成功與切換提示的呈現
    - `ui/plan.md` → §5 `admin.html` 的「駁回原因超過 200 字」「一般成員越權操作」 — Why：字數驗證與越權畫面的文字
    - `ui/admin.html` → 雛形狀態「填寫改期駁回原因」「改期已駁回」「已切換設備審核設定」「駁回原因超過 200 字」「一般成員越權操作」 — Why：對話框與權限不足卡片的實際樣子
    - `contracts/openapi.yaml` → `rejectRescheduleRequest` — Why：駁回的請求欄位與錯誤碼

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 成員追蹤改期進度、撤回申請，並在時限到時自動結案 (Priority: P3)

**Goal**: 成員在「我的預約」查看每筆預約的改期紀錄與「改期審核中」標示，可以撤回審核中的申請；原時段或新時段開始、原預約被取消或被登記領取時，審核中的申請自動「改期已失效」；「設備預約」頁面對本人標示「本人改期審核中」，對其他成員仍顯示「可預約」。

**Independent Test**: 準備成員 A 名下分別處於「改期審核中」、「改期成功」、「改期被駁回」的改期申請，驗證「我的預約」顯示各自的狀態、原時段、新時段與駁回原因，且改期審核中的預約另外標示「改期審核中」。A 撤回一筆改期審核中的申請，驗證變成「改期已撤回」且原預約不變。再準備原時段即將開始、新時段即將開始、原預約將被取消，以及原預約將被提前登記領取的四筆改期審核中的申請，驗證四者都變成「改期已失效」且管理員無法核准。另在「設備預約」頁面驗證改期審核中申請的新時段對 A 標示「本人改期審核中」、對成員 B 顯示「可預約」。

### 資料庫（D2）

- [ ] T038 [US3] 在 `apps/equipment-loan/backend/prisma/seed.ts` 擴充 demo seed 的 US3 範例：依執行當下的 `Asia/Taipei` 日期動態建立一筆 `withdrawn` 改期申請（寫入 `withdrawn_at`）、一筆因原時段開始而 `expired` 的申請（`expire_reason = 'original_slot_started'`、`expired_at` 為原時段開始時間）、一筆因原預約取消而 `expired` 的申請（`reservation_cancelled`），以及一筆原時段為當日晚間、可示範取消或登記領取時一併失效的 `pending_approval` 申請，改期申請編號見 Notes 待確認 1；執行 `npm run db:seed` 後確認 seed 涵蓋改期申請 5 態與 005 的預約 6 態（FR-015、US3 情境 1）
  - **Must Read**
    - `spec.md` → FR-015 — Why：demo seed 必須包含「改期已撤回」與「改期已失效」範例
    - `data/data-model.dbml` → `Table reschedule_requests` 的 `expired_at`、`expire_reason`、`withdrawn_at` — Why：失效與撤回範例要填的欄位與失效時間的寫法
    - `ui/plan.md` → §4 `my-reservations.html` 的「預約清單與改期紀錄」 — Why：改期紀錄要展示的 5 種狀態
  - **Optional**
    - `ui/my-reservations.html` → 雛形狀態「預約清單與改期紀錄」 — Why：需要對照雛形的失效原因與撤回時間時

### 後端（B2–B5）

- [ ] T039 [US3] 在 `apps/equipment-loan/backend/src/services/rescheduleService.ts` 實作並匯出 `expireDueRescheduleRequests(tx, now)`：以一條 `UPDATE` 把 `status = 'pending_approval'`、`deleted_at IS NULL`，且原時段或新時段開始時間已到的申請改為 `expired`；`expire_reason` 依先到的時段寫入 `original_slot_started` 或 `new_slot_started`，`expired_at` 寫入該時段的開始時間，`updated_by` 為 null；在 `createRescheduleRequest`、`listRescheduleRequests`、`approveRescheduleRequest`、`rejectRescheduleRequest` 的交易開頭先呼叫，已失效的申請核准時回 `409 INVALID_RESCHEDULE_STATUS`（見 Notes 待確認 3）（FR-011、FR-012、SC-004、US3 情境 4、5、Edge Cases 審核中原時段開始、新時段比原時段早）
  - **Must Read**
    - `research.md` → §3 — Why：惰性失效的 `UPDATE` 條件、`expired_at` 的寫法與要先呼叫的操作清單
    - `contracts/openapi.yaml` → `approveRescheduleRequest` — Why：原時段或新時段開始後核准回 `INVALID_RESCHEDULE_STATUS`
    - `data/data-model.dbml` → `Enum reschedule_expire_reason`、`Table reschedule_requests` 的 `idx_reschedule_requests_status_to_slot` — Why：失效原因的值與掃描到期申請使用的索引
    - `spec.md` → FR-011、FR-012 — Why：兩種時段開始情況下申請與原預約各自的結果
- [ ] T040 [US3] 在 `apps/equipment-loan/backend/src/services/rescheduleService.ts` 實作 `withdrawRescheduleRequest({ userId, rescheduleRequestId })`（`POST /api/reschedule-requests/:rescheduleRequestId/withdraw`）：交易開頭先呼叫 `expireDueRescheduleRequests`；申請不存在回 `404 RESOURCE_NOT_FOUND`，非本人回 `403 FORBIDDEN`；不是 `pending_approval` 時回 `409 INVALID_RESCHEDULE_STATUS`，訊息寫出目前狀態與時間（見 Notes 待確認 4）；通過時改為 `withdrawn`，寫入 `withdrawn_at` 與 `updated_by`，原預約不變；回傳 `RescheduleRequest`（FR-010、SC-002、US3 情境 2、3）
  - **Must Read**
    - `contracts/openapi.yaml` → `withdrawRescheduleRequest`（含 `RescheduleStatusConflict`） — Why：撤回條件、錯誤碼與回應
    - `spec.md` → FR-010 — Why：撤回後移出待審清單、原預約不變，非審核中時拒絕
  - **Optional**
    - `ui/plan.md` → §5 `my-reservations.html` 的「撤回失敗」 — Why：需要對照錯誤訊息的寫法時
- [ ] T041 [US3] 新增 `apps/equipment-loan/backend/src/routes/rescheduleRequestsRouter.ts`，掛上 `POST /api/reschedule-requests/:rescheduleRequestId/withdraw`（`withdrawRescheduleRequest`）：套用 `requireAuth`，以 zod 驗證路徑參數 uuid（不符回 `400 VALIDATION_FAILED`），成功回 `200`；並在 `apps/equipment-loan/backend/src/app.ts` 以 `/api/reschedule-requests` 掛載此 router（FR-010）
  - **Must Read**
    - `contracts/openapi.yaml` → `withdrawRescheduleRequest` — Why：路徑、狀態碼與回應
    - `plan.md` → Source Code (repository root) — Why：`rescheduleRequestsRouter.ts` 的職責與 `app.ts` 的路由掛載
- [ ] T042 [US3] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 擴充取消與登記領取：B3 `cancelReservation`（`POST /api/reservations/:reservationId/cancel`）在同一交易內把該預約 `pending_approval` 的改期申請改為 `expired`（`expire_reason = 'reservation_cancelled'`、`expired_at` 為取消時間），回應的 `pendingRescheduleRequest` 為 null；B5 `pickupReservationByAdmin`（`POST /api/admin/reservations/:reservationId/pickup`）交易開頭先呼叫 `expireDueRescheduleRequests`，登記領取成功時在同一交易內把該預約 `pending_approval` 的申請改為 `expired`（`reservation_checked_out`），原時段開始後仍可依 005 規則登記領取（見 Notes 待確認 3）（FR-013、FR-016、FR-011、SC-004、US3 情境 4、6、7、Edge Cases 審核中取消原預約、審核中提前登記領取原預約）
  - **Must Read**
    - `contracts/openapi.yaml` → `cancelReservation` — Why：取消時申請同時失效與回應內容
    - `contracts/openapi.yaml` → `pickupReservationByAdmin` — Why：登記領取前先惰性失效、領取時申請同時失效
    - `research.md` → §2 — Why：取消與登記領取在同一交易內使申請失效
    - `spec.md` → FR-013、FR-016 — Why：取消與登記領取時申請失效並移出待審清單
- [ ] T043 [US3] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 擴充查詢：`listMyReservations`、`listMyLoanReservations` 與 B4 `listAllReservations`（`GET /api/admin/reservations`）在查詢前先呼叫 `expireDueRescheduleRequests`；`listMyReservations`、`listMyLoanReservations` 新增選填篩選 `hasPendingRescheduleRequest`；`listAllReservations` 每筆回傳 `pendingRescheduleRequest`（見 Notes 待確認 3）（FR-009、FR-016、US3 情境 1）
  - **Must Read**
    - `contracts/openapi.yaml` → `listMyReservations`、`listAllReservations` — Why：查詢前惰性失效、`hasPendingRescheduleRequest` 篩選與 `pendingRescheduleRequest` 欄位
    - `contracts/openapi.yaml` → `AdminReservationItem` — Why：管理員清單新增的改期審核中摘要
- [ ] T044 [US3] 在 `apps/equipment-loan/backend/src/routes/reservationsRouter.ts` 為 `GET /api/reservations` 與 `GET /api/reservations/my` 加入選填查詢參數 `hasPendingRescheduleRequest`（zod boolean，不符回 `400 VALIDATION_FAILED`）（FR-009）
  - **Must Read**
    - `contracts/openapi.yaml` → `listMyReservations`、`listMyLoanReservations` — Why：新增查詢參數的型別與意義
- [ ] T045 [US3] 在 `apps/equipment-loan/backend/src/services/equipmentService.ts` 擴充 B2 `listEquipments`：查詢前先呼叫 `expireDueRescheduleRequests`；某時段是目前登入成員本人 `pending_approval` 申請的新時段，且沒有被任何預約占用時，對本人回傳 `slotStatus = 'MY_RESCHEDULE_PENDING'`、`availabilityStatus = 'reschedule_pending_by_me'`、`isBookable = false`；只要是本人改期審核中申請的新時段，`myRescheduleRequest` 一律回傳 `MyRescheduleSlotRef`；其他成員仍依既有規則回傳 `AVAILABLE`，`myRescheduleRequest` 為 null，不揭露申請；`slotCode` 等欄位對應沿用 005（見 Notes 待確認 5）（FR-017、FR-003、US3 情境 8）
  - **Must Read**
    - `contracts/openapi.yaml` → `listEquipments` — Why：`MY_RESCHEDULE_PENDING` 的判斷條件與不揭露他人申請的規則
    - `contracts/openapi.yaml` → `EquipmentSlotAvailability`、`MyRescheduleSlotRef` — Why：新增狀態值與申請摘要欄位
    - `data/data-model.dbml` → `Table reschedule_requests` 的 `idx_reschedule_requests_status_to_slot` — Why：查詢本人改期審核中新時段使用的索引
    - `spec.md` → FR-017 — Why：對本人標示、對其他成員仍顯示可預約

### 前端（F2–F4）

- [ ] T046 [US3] 在 `apps/equipment-loan/frontend/src/api/client.ts` 新增 `withdrawRescheduleRequest(rescheduleRequestId)`，並讓 `listMyReservations` 接受選填的 `hasPendingRescheduleRequest`（FR-009、FR-010）
  - **Must Read**
    - `contracts/openapi.yaml` → `withdrawRescheduleRequest`、`listMyReservations` — Why：呼叫的路徑、參數與錯誤碼
- [ ] T047 [P] [US3] 在 `apps/equipment-loan/frontend/src/components/SlotStatusBadge.tsx` 加入 `MY_RESCHEDULE_PENDING`「本人改期審核中」標籤：琥珀色虛線框，與實線框的「本人待審核」區分（FR-017）
  - **Must Read**
    - `ui/plan.md` → §2 — Why：「本人改期審核中」使用琥珀色虛線框的規則與配色
    - `ui/booking.html` → 雛形狀態「本人改期審核中時段（本人視角）」 — Why：標籤的實際樣子
- [ ] T048 [US3] 在 `apps/equipment-loan/frontend/src/views/EquipmentBookingView.tsx` 顯示本人改期審核中時段：圖例加入「本人改期審核中」；該時段顯示改期申請編號；點選時右側面板以琥珀色說明「… 是您改期申請 … 的新時段（預約 … 原為 …）。管理員核准前，這個時段不會替您保留，原預約照常有效。」並顯示「查看我的預約」，「送出預約」不送出任何預約；其他成員檢視同一時段時顯示「可預約」（FR-017、FR-003、US3 情境 8）
  - **Must Read**
    - `ui/plan.md` → §3.3 A4、A5、A6 — Why：查看時段狀態、切換成員比對與點選本人改期審核中時段的操作
    - `ui/plan.md` → §4 `booking.html` 的「本人改期審核中時段（本人視角）」「改期審核中時段（其他成員視角）」 — Why：本人與其他成員看到的呈現
    - `ui/plan.md` → §5 `booking.html` 的「點選本人改期審核中時段」 — Why：右側面板的說明文字
    - `ui/booking.html` → 雛形狀態「本人改期審核中時段（本人視角）」「改期審核中時段（其他成員視角）」 — Why：時段格子與面板的實際樣子
    - `contracts/openapi.yaml` → `MyRescheduleSlotRef` — Why：面板說明要用的申請編號、預約編號與原時段
- [ ] T049 [US3] 在 `apps/equipment-loan/frontend/src/views/MyReservationsView.tsx` 顯示改期紀錄：每筆有改期紀錄的預約下方顯示可收合的「改期紀錄（n 筆）」表格，欄位為改期申請、狀態、原日期時段、新日期時段、申請時間、審核時間與說明；說明依狀態顯示「免審核設備，送出時立即改期」、「審核管理員 …」、「駁回原因：…｜審核管理員 …」、「撤回時間 …」、「失效原因：…｜失效時間 …」（失效原因文字見 Notes 待確認 2）或「等待管理員審核；核准前原預約照常有效」；有改期審核中申請的預約加上「改期審核中」標籤與提示「改期申請 … 審核中：要改到別的時段，請先撤回這筆申請再重新申請。」；篩選列加入「改期審核中（n）」；沒有符合篩選的預約時顯示「目前沒有符合篩選條件的預約」、「顯示全部預約」與「前往設備預約」（FR-009、US3 情境 1）
  - **Must Read**
    - `ui/plan.md` → §3.3 A8、A9 — Why：篩選與展開改期紀錄的操作
    - `ui/plan.md` → §4 `my-reservations.html` 的「預約清單與改期紀錄」「尚無符合篩選的預約」 — Why：改期紀錄表格、標籤與空狀態的呈現
    - `ui/my-reservations.html` → 雛形狀態「預約清單與改期紀錄」「尚無符合篩選的預約」 — Why：表格欄位與說明文字的實際樣子
    - `contracts/openapi.yaml` → `RescheduleRequest` — Why：每個欄位的來源與可為 null 的情況
- [ ] T050 [US3] 在 `apps/equipment-loan/frontend/src/views/MyReservationsView.tsx` 加入撤回與含改期審核中申請的取消：改期紀錄中審核中申請的「撤回」開啟確認對話框（改期申請、預約、原時段、新時段與撤回後的說明），處理中按鈕改為「撤回處理中…」，成功後頁頂綠色橫幅「已撤回改期申請 …。預約 … 仍為 … 的「已核准／有效」。」；`INVALID_RESCHEDULE_STATUS` 時頁頂紅色橫幅並重新載入紀錄（見 Notes 待確認 4）；有改期審核中申請的預約按「取消預約」時，對話框以琥珀色提示申請會同時變成「改期已失效」，處理中改為「取消處理中…」，成功後橫幅說明申請已失效（FR-010、FR-013、NFR-002、US3 情境 2、3、6）
  - **Must Read**
    - `ui/plan.md` → §3.3 A12、A13 — Why：撤回與取消預約的操作
    - `ui/plan.md` → §4 `my-reservations.html` 的「確認撤回改期申請」「撤回處理中」「改期申請已撤回」「確認取消預約（含改期審核中申請）」「取消處理中」「已取消預約且改期申請失效」 — Why：兩個對話框、處理中與成功的呈現
    - `ui/plan.md` → §5 `my-reservations.html` 的「撤回失敗」「取消有改期審核中申請的預約」 — Why：撤回失敗與取消時的提示
    - `ui/my-reservations.html` → 雛形狀態「確認撤回改期申請」「改期申請已撤回」「確認取消預約（含改期審核中申請）」「已取消預約且改期申請失效」「撤回失敗」 — Why：對話框與橫幅的實際樣子
    - `contracts/openapi.yaml` → `withdrawRescheduleRequest`、`cancelReservation` — Why：兩個操作的回應與錯誤碼
- [ ] T051 [US3] 在 `apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx` 處理改期申請失效：借用管理表格對 `pendingRescheduleRequest` 不為 null 的預約標示「改期審核中 …」；「登記領取」處理中改為「登記領取中…」，成功後頁頂綠色橫幅說明預約變成「借用中」且改期申請已同時變成「改期已失效」並移出待審清單，同時重新載入改期申請清單；核准或駁回收到 `INVALID_RESCHEDULE_STATUS` 時，依訊息顯示原時段已開始、新時段已開始或申請已撤回的頁頂紅色橫幅，並把該筆移出清單（見 Notes 待確認 4）（FR-011、FR-012、FR-016、SC-004、US3 情境 4、5、7）
  - **Must Read**
    - `ui/plan.md` → §3.3 A18 — Why：登記領取有改期審核中申請的預約的操作
    - `ui/plan.md` → §4 `admin.html` 的「登記領取處理中」「登記領取完成（改期申請已失效）」 — Why：處理中與成功的呈現
    - `ui/plan.md` → §5 `admin.html` 的「核准時原時段已開始」「核准時新時段已開始」「審核時申請已撤回」「登記領取有改期審核中申請的預約」 — Why：各失效情況的提示文字
    - `ui/admin.html` → 雛形狀態「登記領取完成（改期申請已失效）」「核准時原時段已開始」「核准時新時段已開始」「審核時申請已撤回」 — Why：表格標示與橫幅的實際樣子
    - `contracts/openapi.yaml` → `pickupReservationByAdmin`、`AdminReservationItem` — Why：登記領取回應與 `pendingRescheduleRequest` 欄位

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T052 [P] 新增 `apps/equipment-loan/backend/tests/unit/reschedule.test.ts`，以 Vitest 5 驗證 `taipeiTime.ts` 的時段開始時間換算與 7 天範圍判斷，以及可改期條件（狀態、原時段已開始、新時段相同、超出 7 天）的判斷結果（FR-001、research §5）
  - **Must Read**
    - `research.md` → §5 — Why：單元測試的範圍與工具
    - `spec.md` → FR-001 — Why：可改期條件的完整清單
- [ ] T053 [P] 新增 `apps/equipment-loan/backend/tests/integration/reschedule.test.ts`，以 Vitest 5 + Supertest 7 連接真實 PostgreSQL 18 測試資料庫量測：免審核即時改期成功與各種拒絕時原預約的日期、時段、狀態變動率為 0%（SC-001、SC-002）；以 `Promise.all` 同時送出即時改期、新預約、核准改期與核准待審預約，確認恰好 1 筆成功、時段重複占用 0%（SC-003）；以 `vi.setSystemTime` 把時間設到原時段或新時段開始，並涵蓋取消與登記領取，確認申請 100% 變成 `expired` 且核准回 `409`（SC-004）；一般成員呼叫核准、駁回改期申請 100% 回 `403`（SC-006）；同一預約並發送出兩次改期審核只成立一筆（FR-004）
  - **Must Read**
    - `research.md` → §5 — Why：整合測試的情境、並發與時間控制的方式
    - `spec.md` → SC-001、SC-002、SC-003、SC-004、SC-006 — Why：每項量測的門檻
  - **Optional**
    - `contracts/openapi.yaml` → `createRescheduleRequest`、`approveRescheduleRequest` — Why：需要確認斷言的狀態碼與錯誤碼時
- [ ] T054 回歸驗證：在 `apps/equipment-loan/` 重跑 003～005 既有的 `backend/tests/integration/api.test.ts`、`backend/tests/unit/utils.test.ts`、`frontend/tests/unit/zh-TW.test.ts` 與 `e2e/equipment-loan.spec.ts`，與 T005 的基準比對，通過率須為 100%；失敗時修正本次改動造成的回歸，不修改既有測試的預期（FR-015、SC-006）
  - **Must Read**
    - `spec.md` → FR-015、SC-006 — Why：前三次迭代既有功能必須完整保留，回歸通過率 100%
    - `research.md` → §5 — Why：重跑 003～005 全套整合測試與 E2E 的決定
- [ ] T055 [P] 在 `apps/equipment-loan/frontend/tests/unit/zh-TW.test.ts` 加入測試：改期申請 5 態、`MY_RESCHEDULE_PENDING`、4 種失效原因（文字見 Notes 待確認 2）與 5 個新錯誤碼都有臺灣繁體中文文字（NFR-001）
  - **Must Read**
    - `spec.md` → NFR-001 — Why：需要繁體中文的文字範圍
    - `contracts/openapi.yaml` → `RescheduleRequestStatus`、`RescheduleExpireReason`、`Error` — Why：要涵蓋的狀態值與錯誤碼
- [ ] T056 [P] 新增 `apps/equipment-loan/e2e/reschedule.spec.ts`，以 Playwright 1.65 的成員與管理員雙視窗流程驗證：免審核即時改期、需人工審核改期送出後「設備預約」頁面對本人顯示「本人改期審核中」、對其他成員顯示「可預約」、管理員核准與核准衝突、成員撤回（US1、US2、US3、research §5）
  - **Must Read**
    - `research.md` → §5 — Why：E2E 要涵蓋的流程
    - `spec.md` → US1、US2、US3 的 Independent Test — Why：每個故事的驗證步驟
- [ ] T057 [P] 在 demo seed 資料下量測送出改期、撤回改期、核准與駁回改期申請，以及 `GET /api/reservations` 查詢改期紀錄的回應時間，在單機與區域網路環境下都低於 2 秒（NFR-002、SC-005）
  - **Must Read**
    - `spec.md` → NFR-002、SC-005 — Why：回應時間的檢查標準與要量測的操作
- [ ] T058 [P] 以瀏覽器開發者工具在 360px 與 1120px 寬度檢查「我的預約」、申請改期對話框（手機寬度全螢幕、格子可左右捲動）、「設備預約」與「審核與借用管理」都能完整操作，深淺色主題的「本人改期審核中」虛線框與「改期審核中」標籤清楚可辨（FR-009、FR-017、NFR-001）
  - **Must Read**
    - `ui/plan.md` → §2 — Why：版面寬度、對話框與配色的檢查標準
- [ ] T059 [P] 更新 `apps/equipment-loan/README.md`：補充本次的改期申請功能、增量資料庫遷移指令（`npm run db:migrate`）、含改期申請 5 態範例的 demo seed 重設指令（`npm run db:seed`）、測試指令與雙視窗展示步驟（FR-015、research §5）
  - **Must Read**
    - `research.md` → §5 — Why：demo seed 的內容與測試指令
    - `plan.md` → Source Code (repository root) — Why：`README.md` 要說明的啟動、遷移、seed 重設與測試項目
- [ ] T060 最後驗證：在 `apps/equipment-loan/` 執行 `npm run check`（`tsc --noEmit`、ESLint、Prettier）、`npm run db:migrate`、`npm run db:seed`，再執行 `npm run test:backend`、`npm run test:frontend`、`npm run test:e2e`，全部零錯誤通過（FR-015、SC-006）
  - **Must Read**
    - `research.md` → §5 — Why：要執行的測試工具與範圍
    - `spec.md` → FR-015、SC-006 — Why：最後驗證的通過標準

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US2 需要 US1 建立的 `reschedule_requests` 資料表（T012、T013）與 `createRescheduleRequest` 的可改期檢查（T015）；US3 需要 US1 或 US2 建立的改期申請紀錄。因此建議依 P1 → P2 → P3 循序進行
  - 同一故事內，後端與前端任務在不同檔案時可以平行
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: 需要 US1 的資料表、遷移與 `createRescheduleRequest`（T012、T013、T015）；`rescheduleService.ts`（T026）、`seed.ts`（T025）、`client.ts`（T033）、`RescheduleDialog.tsx`（T034）、`MyReservationsView.tsx`（T035）擴充 US1 的同名檔案
- **User Story 3 (P3)**: 需要 US1、US2 的改期申請建立、核准與駁回；`rescheduleService.ts`（T039、T040）、`reservationService.ts`（T042、T043）、`equipmentService.ts`（T045）、`EquipmentBookingView.tsx`（T048）、`MyReservationsView.tsx`（T049、T050）與 `AdminOverviewView.tsx`（T051）擴充前面故事的同名檔案

### Within Each User Story

- `schema.prisma` → 遷移 → `seed.ts` → services → routes → `client.ts` → 元件 → views
- `seed.ts`、`rescheduleService.ts`、`reservationService.ts`、`equipmentService.ts`、`reservationsRouter.ts`、`client.ts`、`RescheduleDialog.tsx`、`MyReservationsView.tsx`、`EquipmentBookingView.tsx`、`AdminOverviewView.tsx` 由多個任務修改，這些任務要依 ID 順序循序進行
- Story complete before moving to next priority

### Parallel Opportunities

- Setup：T002～T004 可平行
- Foundational：T006～T010 可平行（不同檔案）；T011 修改的 `client.ts` 之後還會被各故事修改，因此不標 [P]
- US1：T020（`LoginView.tsx`）可與後端任務 T015～T019 同時進行；其餘前端任務修改的檔案會被後面的故事再修改，不標 [P]，但可在後端任務進行時依 ID 循序開工
- US2：前端 T033～T035 與後端 T026～T032 修改不同檔案，可以同時開工（同一檔案的任務仍依 ID 循序）；T036、T037 需要 T033
- US3：T047（`SlotStatusBadge.tsx`）可與後端任務 T039～T045 同時進行
- Polish：T052、T053、T055～T059 可平行；T054、T060 在其他 Polish 任務完成後執行

---

## Parallel Example: User Story 1

```bash
# 後端與前端同時開工：
Task: "實作 createRescheduleRequest 的可改期檢查與即時改期 in apps/equipment-loan/backend/src/services/rescheduleService.ts"
Task: "更新預約與改期提醒區塊 in apps/equipment-loan/frontend/src/views/LoginView.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "實作 listRescheduleRequests in apps/equipment-loan/backend/src/services/rescheduleService.ts"
Task: "新增改期申請 API 呼叫 in apps/equipment-loan/frontend/src/api/client.ts"
Task: "顯示需人工審核設備的說明 in apps/equipment-loan/frontend/src/components/RescheduleDialog.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "實作 expireDueRescheduleRequests in apps/equipment-loan/backend/src/services/rescheduleService.ts"
Task: "加入本人改期審核中標籤 in apps/equipment-loan/frontend/src/components/SlotStatusBadge.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 以 US1 的 Independent Test 驗證免審核設備即時改期、原時段釋出與被占用時拒絕，並確認升級後既有預約不變
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP：成員可以把免審核設備的預約即時改到另一個時段)
3. Add User Story 2 → Test independently → Deploy/Demo（需人工審核設備的改期由管理員核准或駁回，核准前原預約照常有效）
4. Add User Story 3 → Test independently → Deploy/Demo（成員可以追蹤改期紀錄、撤回申請，時段開始時申請自動失效）
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done，每個故事依序進行，故事內分工：
   - Developer A：資料庫與後端（`schema.prisma`、遷移、`seed.ts`、services、routes）
   - Developer B：前端（`client.ts`、`RescheduleDialog.tsx`、`SlotStatusBadge.tsx`、views）
3. 雙方以 `contracts/openapi.yaml` 為介面約定，故事完成後一起依 Independent Test 驗證

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- plan.md 的 Source Code 只列出目錄 `backend/prisma/migrations/`、`backend/tests/unit/`、`backend/tests/integration/`、`frontend/tests/unit/` 與 `e2e/`，沒有列出個別檔案。本 tasks.md 新增 `backend/prisma/migrations/<時間戳記>_reschedule_requests/migration.sql`（T013，Prisma 增量遷移的固定位置）、`backend/tests/unit/reschedule.test.ts`（T052）、`backend/tests/integration/reschedule.test.ts`（T053）與 `e2e/reschedule.spec.ts`（T056），把改期測試和 003～005 的既有測試分開，方便 T054 單獨重跑回歸；T005、T054、T055 使用的 `backend/tests/integration/api.test.ts`、`backend/tests/unit/utils.test.ts`、`frontend/tests/unit/zh-TW.test.ts`、`e2e/equipment-loan.spec.ts` 是前三次迭代已存在的檔案
- 待確認 1：改期申請編號在 `data/data-model.dbml` 為 `reschedule_requests.request_no`，在 `contracts/openapi.yaml` 為 `requestNumber`，兩者命名不同；上游也只有範例 `RR-20261109-02`，沒有定義產生規則（日期取申請日或新日期、流水號或亂數）。受影響任務：T012、T014、T015、T025、T026、T038。暫行做法：資料表欄位用 `request_no`、API 回應用 `requestNumber`，產生方式比照既有 `reservationService.ts` 的 `generateReservationNo`（`RR-` 加申請當下的 `Asia/Taipei` 日期 `yyyyMMdd` 加隨機碼），等 data-plan 或 api-plan 定案後再統一
- 待確認 2：失效原因的畫面文字沒有統一定義。`spec.md` Key Entities 寫「原時段開始、新時段開始、原預約取消或原預約被登記領取」；`ui/plan.md` §4 與 `ui/my-reservations.html` 使用「原預約已取消」、「原時段開始」、「原預約已登記領取」，且沒有 `new_slot_started` 的文字。受影響任務：T010、T049、T055。暫行做法：`original_slot_started`、`reservation_cancelled`、`reservation_checked_out` 依雛形文字，`new_slot_started` 依 spec 寫成「新時段開始」，等 ui-plan 補上對應表後再調整
- 待確認 3：惰性失效要先執行的操作清單不一致。`research.md` §3 列出 8 個操作，不含 `listAllReservations`；`contracts/openapi.yaml` 的 `listAllReservations` 卻寫查詢前先失效；兩者都沒有列 `cancelReservation`，所以成員取消一筆新時段已開始、但尚未被惰性失效的申請時，`expire_reason` 會記成 `reservation_cancelled` 而不是 `new_slot_started`。受影響任務：T039、T042、T043。暫行做法：依兩份文件的聯集執行（research §3 的 8 個操作加上 `listAllReservations`），`cancelReservation` 不先呼叫，等 api-plan 確認是否補上
- 待確認 4：`contracts/openapi.yaml` 的 `Error` 只有 `code` 與 `message`，`AdminRescheduleRequestItem` 也沒有占用新時段的預約編號欄位；但 `ui/plan.md` §5 的「核准時新時段已被占用」要在該列標示占用的預約編號，「審核時申請已撤回」、「撤回失敗」、「核准時原時段已開始」要顯示撤回或駁回時間、操作者與失效原因。受影響任務：T028、T036、T040、T050、T051。暫行做法：比照 005 既有 `reservationService.ts` 的寫法，由後端把這些細節寫進 `message`，前端直接顯示 `message` 並把該列標成紅框，不新增合約沒有的欄位
- 待確認 5：沿用 005 的命名在本次上游文件之間仍不一致：`time_slots.slot_code` 在 data-model 註解為小寫 `morning`、`afternoon`、`evening`，合約 `slotCode` 為大寫 `MORNING`、`AFTERNOON`、`EVENING`；`equipments.status`（Enum `available`／`unavailable`）對應合約的 `isActive`（boolean）；`reservations.reservation_no`、`checked_out_by`、`returned_by` 對應合約的 `reservationNumber`、`checkedOutByUserId`、`returnedByUserId`。受影響任務：T016、T018、T045。暫行做法：沿用 005 程式既有的轉換，不改資料表也不改合約欄位
