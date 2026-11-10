---

description: "Task list for 設備送修與停用、恢復可用及受影響未來預約的處理 implementation"
---

# Tasks: 設備送修與停用、恢復可用及受影響未來預約的處理 (Equipment Maintenance and Retirement)

**Input**: Design documents from `/specs/007-equipment-maintenance-retire/`（依下方 Reference Loading Contract 按任務載入）

**Tests**: spec.md 沒有明確要求撰寫測試或 TDD，因此各使用者故事不產生測試任務。Setup 不另外安裝測試工具：Vitest 5、Supertest 7 與 Playwright 1.65 已在前一版安裝（research §5）。SC-001～SC-006 的量測、前四版回歸與 FR-018 的遷移驗證放在 Polish 處理。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. 每個階段內再依 plan.md「系統介面盤點」的技術端點（資料庫、後端、前端）分組，標題列出該組實作的介面編號；每個任務下方以 Must Read／Optional 列出執行時要讀的文件部位。

## Reference Loading Contract

執行本檔的任務時，依下列規則載入 `/specs/007-equipment-maintenance-retire/` 的文件：

1. 開工前只讀本檔，不預先讀 spec package 的其他文件。
2. 每個任務下方列出它的參考，分兩級：
   - **Must Read**：開始這個任務前一定要讀完的部位。
   - **Optional**：只在遇到該項 Why 描述的情況時才讀。
3. 每項參考寫成 `` `檔案` → 部位 — Why：理由 ``。Why 說明這個部位決定任務的哪一部分，讀的時候以它為重點。
4. 只讀列出的部位，不讀整份文件。部位以文件內可搜尋的識別字定位：
   - `contracts/openapi.yaml`：operationId，或 `components` 底下的 schema、response 名稱
   - `data/data-model.dbml`：`Table`、`Enum`、`Ref`、`Project`
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

- **Web app**：任務中的程式路徑都相對於 `apps/equipment-loan/`，例如 `backend/src/`、`frontend/src/`、`e2e/`（依 plan.md 的 Structure Decision，沿用 006 的專案結構）
- 資料庫結構只改 `backend/prisma/schema.prisma`，並在 `backend/prisma/migrations/` 新增一支增量 Migration；demo seed 在 `backend/prisma/seed.ts`
- 前端只擴充既有 views 與 components，新增 `frontend/src/components/EquipmentStatusDialog.tsx`；不新增頁面路由與套件

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 在 `apps/equipment-loan/` 以 `docker compose up -d` 啟動 PostgreSQL 18，在根目錄、`backend/` 與 `frontend/` 執行 `npm install`，再執行 `npm run db:migrate` 套用 003～006 的既有 Migration、`npm run db:seed` 重設展示資料，確認 006 版本可以正常啟動；本次不新增任何套件（research §1）
  - **Must Read**
    - `techstack.md` → 技術堆疊總覽 — Why：本次沿用的前後端套件與版本，不新增相依
    - `research.md` → §1 — Why：沿用 PostgreSQL 18、Prisma ORM 7.10 與 Docker Compose 的開發資料庫
  - **Optional**
    - `techstack.md` → 本次開發不引入的技術 — Why：想加入對話框、路由、狀態管理或排程套件時，確認不得引入的技術
- [X] T002 在 `apps/equipment-loan/` 執行 `npm run check`、`npm run test:backend` 與 `npm run test:frontend`，記錄 006 版本的基準結果，作為之後前四版回歸比對的起點（research §5）
  - **Must Read**
    - `research.md` → §5 — Why：本次沿用的測試工具，以及要重跑 003～006 全套整合測試的回歸做法

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 資料庫（D1–D3 共用）

- [X] T003 在 `backend/prisma/schema.prisma` 更新資料模型：`enum equipment_status` 依序為 `available`、`maintenance`、`retired`；新增 `enum reservation_cancel_reason`（`member_cancelled`、`equipment_maintenance`、`equipment_retired`）；`reservations` 新增可為空的 `cancel_reason`，並新增索引 `idx_reservations_equipment_status_date`（`equipment_id, status, reservation_date`）；新增 `model equipment_status_changes`：`id`（`@db.Uuid`）、`equipment_id`、`from_status`、`to_status`、`changed_by`、`changed_at`（`@db.Timestamptz(6)`）、`cancelled_reservation_count`（`Int`，預設 0），以及 `created_at`、`updated_at`、`updated_by`、`deleted_at`，關聯到 `equipments` 與 `users`，索引 `idx_equipment_status_changes_equipment_changed`（`equipment_id, changed_at`）；`previewFeatures = ["partialIndexes"]` 與其餘 model、Enum、索引都不變（FR-001、FR-008、FR-015、FR-018）
  - **Must Read**
    - `data/data-model.dbml` → `Enum equipment_status`、`Enum reservation_cancel_reason` — Why：兩個 Enum 的值、順序與每個值代表的狀態
    - `data/data-model.dbml` → `Table equipment_status_changes` — Why：紀錄表的欄位、預設值、索引與只新增不修改的約束
    - `data/data-model.dbml` → `Table reservations` 的 `cancel_reason`、`idx_reservations_equipment_status_date` — Why：新增欄位的可為空規則與新增的索引
    - `data/data-model.dbml` → `Ref: equipment_status_changes.equipment_id > equipments.id`、`Ref: equipment_status_changes.changed_by > users.id` — Why：紀錄表的兩個外鍵
    - `research.md` → §1 — Why：Prisma schema 的 Enum 順序寫成 `available`、`maintenance`、`retired`
- [X] T004 在 `backend/` 以 `npx prisma migrate dev --create-only --name equipment_maintenance_retire` 產生 007 的 Migration（不套用），把自動產生的 SQL 改寫為：`ALTER TYPE "equipment_status" RENAME VALUE 'unavailable' TO 'retired'`、`ALTER TYPE "equipment_status" ADD VALUE 'maintenance' BEFORE 'retired'`（同一支 Migration 不使用 `maintenance`）；建立 `reservation_cancel_reason` 型別並新增 `reservations.cancel_reason`；以 `UPDATE reservations SET cancel_reason = 'member_cancelled' WHERE status = 'cancelled'` 補上既有取消紀錄；建立 `equipment_status_changes`、兩個外鍵與 `idx_equipment_status_changes_equipment_changed`；建立 `idx_reservations_equipment_status_date`；不改寫任何既有欄位值；最後執行 `npm run db:migrate` 確認套用成功（FR-018、US1 情境 13）
  - **Must Read**
    - `research.md` → §1 — Why：`RENAME VALUE`、`ADD VALUE` 的寫法，同一支 Migration 不能使用新值，以及不直接套用自動產生 SQL 的原因
    - `data/data-model.dbml` → `Project "equipment-maintenance-retire"` — Why：本次增量遷移要完成的 4 件事與無損遷移的範圍
    - `spec.md` → FR-018、US1 情境 13 — Why：既有不可用設備轉為停用，既有預約、借用與改期申請的狀態與內容都不得改變
  - **Optional**
    - `data/data-model.dbml` → `Enum reschedule_expire_reason` — Why：需要確認改期失效原因沿用 `reservation_cancelled`、不新增 Enum 值時
- [X] T005 在 `backend/prisma/seed.ts` 擴充 demo seed：重設方式見 Notes 待確認 5，沿用既有的 `deleteMany` 順序重設 006 的資料表；新增管理員黃詩涵（`huang.shihan`）；依執行當下的 `Asia/Taipei` 日期動態建立 6 台設備 `EQ-101`～`EQ-106`（`EQ-105 桌上型冷凍離心機 Eppendorf 5430R` 為 `maintenance` 且需人工審核，`EQ-106 紫外光可見光分光光譜儀 Hitachi U-2900` 為 `retired` 且免審核）；`EQ-101` 為可示範設為送修的「可用」設備，有未來的 `confirmed` 預約（含一筆 `pending_approval` 改期申請）與 `pending_approval` 預約；`EQ-105` 有因送修被取消的預約（`cancel_reason` 為 `equipment_maintenance`，`cancelled_at` 等於狀態變更時間）；`EQ-106` 有成員的 `returned` 紀錄與因停用被取消的預約（`equipment_retired`）；`EQ-102` 保留一筆逾期未還的 `checked_out`；既有 `cancelled` 範例補上 `member_cancelled`；新增 `EQ-105`（吳承翰）、`EQ-106`（黃詩涵）、`EQ-104`（黃詩涵）的 `equipment_status_changes`；保留 006 的帳號、時段、6 態預約與 5 態改期申請範例；執行 `npm run db:seed` 確認成功（FR-018、US1 情境 14）
  - **Must Read**
    - `research.md` → §5 — Why：demo seed 依執行當下日期動態建立的範例內容
    - `research.md` → §1 — Why：demo seed 以 `deleteMany` 重設全部資料的做法（見 Notes 待確認 5）
    - `spec.md` → FR-018、US1 情境 14 — Why：demo seed 至少要有的送修中、停用與可示範設為送修的設備
    - `ui/plan.md` → §4 `equipment-status.html` 的「設備清單」 — Why：6 台設備的狀態、審核設定與最近變更的展示資料
    - `ui/plan.md` → §4 `my-reservations.html` 的「預約清單」 — Why：送修取消、成員取消、停用設備歷史紀錄與改期審核中的展示資料
    - `data/data-model.dbml` → `Table equipment_status_changes`、`Table reservations` 的 `cancel_reason`、`cancelled_at` — Why：範例資料要填的欄位，以及取消時間等於狀態變更時間
  - **Optional**
    - `ui/plan.md` → §4 `index.html` 的「待登入」 — Why：需要確認 4 個預建帳號的名稱與角色時
    - `ui/plan.md` → §4 `admin.html` 的「審核與借用管理總覽」 — Why：需要對照全體預約中各種取消原因的範例時
    - `ui/plan.md` → §5 `equipment-status.html` 的「設備借用中」 — Why：需要確認逾期未還借用範例的日期與時段時

### 後端（B1–B5 共用）

- [X] T006 [P] 在 `backend/src/middleware/errorHandler.ts` 的 `ErrorCode` 新增 `EQUIPMENT_ON_LOAN`、`EQUIPMENT_STATUS_UNCHANGED`、`EQUIPMENT_STATE_CHANGED`，三者都回 `409`；`EQUIPMENT_ON_LOAN` 的訊息為「設備借用中，請先登記歸還」，`EQUIPMENT_STATE_CHANGED` 的訊息為「設備狀態已被變更，請重新確認」，`EQUIPMENT_STATUS_UNCHANGED` 的訊息說明設備已經是目標狀態（FR-005、FR-019、NFR-001）
  - **Must Read**
    - `contracts/openapi.yaml` → `Error`、`UpdateEquipmentStatusConflict`、`EquipmentStatusUnchanged` — Why：新增的 3 個錯誤碼、HTTP 狀態碼與各自的觸發情況
    - `spec.md` → FR-005、FR-019、NFR-001 — Why：借用中與狀態已變更的提示文字，以及錯誤提示要說明失敗原因
- [X] T007 [P] 在 `backend/src/middleware/authMiddleware.ts` 更新 `requireAdmin` 回傳 `403 FORBIDDEN` 的繁體中文訊息，寫明「設定送修、停用與恢復可用只限管理員操作」，並保留原本列出的審核與登記領取歸還操作（FR-017、NFR-001）
  - **Must Read**
    - `contracts/openapi.yaml` → `Forbidden` — Why：一般成員呼叫設定送修、停用與恢復可用時回 `FORBIDDEN`
    - `spec.md` → FR-017 — Why：只允許管理員操作，一般成員要收到權限不足的提示
  - **Optional**
    - `ui/plan.md` → §5 `equipment-status.html` 的「權限不足」 — Why：需要對齊畫面上權限不足說明的用詞時
- [X] T008 在 `backend/src/services/equipmentService.ts` 把 `EquipmentWithSlotAvailabilityDto` 與 `AdminEquipmentSettingDto` 的 `isActive` 換成 `status`（型別為 `available`、`maintenance`、`retired`），`toAdminEquipmentSettingDto` 的參數型別改為三態；`isBookable` 維持只在設備 `status` 為 `available` 時才可能為 true；確認 Migration 後的 Prisma Client 可以通過 `tsc --noEmit`（research §2、FR-006）
  - **Must Read**
    - `research.md` → §2 — Why：設備 DTO 以 `status` 取代 `isActive` 布林值的決策
    - `contracts/openapi.yaml` → `EquipmentStatus`、`AdminEquipmentSetting`、`EquipmentWithSlotAvailability` — Why：`status` 欄位的型別與兩種 DTO 的欄位
- [X] T009 在 `backend/src/services/reservationService.ts` 的 `cancelReservation`，取消時同時寫入 `cancel_reason` 為 `member_cancelled`，讓 Migration 後成員新取消的紀錄也有取消原因（FR-015、research §1）
  - **Must Read**
    - `contracts/openapi.yaml` → `cancelReservation` — Why：成員本人取消時 `cancelReason` 記為 `member_cancelled`
    - `data/data-model.dbml` → `Table reservations` 的 `cancel_reason` — Why：`status` 為 `cancelled` 時必填的規則與三種值

### 前端（F1、F2、F4、F5 共用）

- [X] T010 在 `frontend/src/api/client.ts` 新增 `EquipmentStatus`（`available`、`maintenance`、`retired`）與 `ReservationCancelReason` 型別，並把 `EquipmentWithSlotAvailability`、`AdminEquipmentSetting` 的 `isActive` 換成 `status`（research §2）
  - **Must Read**
    - `contracts/openapi.yaml` → `EquipmentStatus`、`ReservationCancelReason` — Why：兩個新型別的值
    - `contracts/openapi.yaml` → `EquipmentWithSlotAvailability`、`AdminEquipmentSetting` — Why：`status` 取代 `isActive` 後的欄位
- [X] T011 在 `frontend/src/text/zh-TW.ts` 新增設備 3 態標籤（`available` 可用、`maintenance` 送修中、`retired` 停用），並新增頁首導覽「設備狀態管理」，「審核與借用管理」維持原文字（見 Notes 待確認 1）（NFR-001）
  - **Must Read**
    - `spec.md` → NFR-001 — Why：設備狀態標籤必須使用臺灣繁體中文
    - `ui/plan.md` → §3.1 — Why：頁首 5 個頁面導覽的名稱與對應畫面（見 Notes 待確認 1）
- [X] T012 在 `frontend/src/views/EquipmentBookingView.tsx` 與 `frontend/src/views/AdminOverviewView.tsx`，把 `eq.isActive ? "可供借用" : "暫停借用"` 換成依 `status` 顯示的狀態徽章：「送修中」為琥珀色實心徽章（`--pending`、`--pending-soft`），「停用」為中性灰徽章（`--occupied`、`--occupied-soft`），文字取自 `zh-TW.ts`（NFR-001）
  - **Must Read**
    - `ui/plan.md` → §2 — Why：「送修中」與「停用」徽章的配色與樣式
- [X] T013 在 `frontend/src/App.tsx` 把管理員畫面拆成「設備狀態管理」與「審核與借用管理」兩個頁籤，兩者都沿用 `AdminOverviewView.tsx`，以傳入的區塊參數決定只顯示設備區塊或待審清單與全體預約區塊（見 Notes 待確認 1）；管理員登入後進入「設備狀態管理」，`frontend/src/views/LoginView.tsx` 的管理員登入成功卡片按鈕改為「前往設備狀態管理」；未登入時的提示改為「請先登入，才能查看設備預約、我的預約、設備狀態管理或審核與借用管理。」（FR-018）
  - **Must Read**
    - `ui/plan.md` → §3.1、§3.2 — Why：5 個頁面的進入方式，以及管理員登入後進入設備狀態管理的流程
    - `ui/plan.md` → §4 `index.html` 的「管理員登入成功」 — Why：管理員登入成功卡片的文字與按鈕
    - `ui/index.html` → 雛形狀態「管理員登入成功」 — Why：成功卡片的實際樣子
  - **Optional**
    - `ui/plan.md` → §5 `index.html` 的「未登入存取受保護頁面」 — Why：需要確認未登入提示的完整文字時

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 管理員把設備設成送修或停用，系統自動取消受影響的未來預約 (Priority: P1) 🎯 MVP

**Goal**: 管理員在設備清單把「可用」設備設為送修或停用，先在確認視窗看到將取消的預約數與將失效的改期申請數；確認後同一次操作取消這台設備尚未結束的「待審核」與「已核准／有效」預約、讓改期審核中申請失效，並保存狀態變更紀錄；設備借用中或確認時資料已變更就拒絕。

**Independent Test**: 準備一台「可用」設備，它有 1 筆明天的「已核准／有效」預約（附 1 筆「改期審核中」的改期申請）、1 筆後天的「待審核」預約與 1 筆過去的「已歸還」紀錄；管理員把它設成送修並確認；驗證設備顯示「送修中」，2 筆未來預約變成「已取消」且原因為「設備送修」，改期申請變成「改期已失效」，「已歸還」紀錄不變，成員再預約這台設備被拒絕。

### 後端（B2–B6）

> D2、D3 的 Enum、`cancel_reason` 與 `equipment_status_changes` 已在 Foundational 建立，本故事沒有資料庫任務。

- [X] T014 [US1] 在 `backend/src/services/equipmentService.ts` 擴充 `listAdminEquipments`：新增選填篩選 `status`；每台設備回傳 `lastStatusChange`（依 `idx_equipment_status_changes_equipment_changed` 取 `changed_at` 最大且 `deleted_at` 為 null 的一筆，join `users.display_name`，輸出 `changedBy`、`changedByDisplayName`、`changedAt`、`fromStatus`、`toStatus`，沒有紀錄時為 null）；回應新增 `statusCounts`（全部設備依狀態的台數，不受篩選影響）；`updateEquipmentApprovalMode` 回傳同一個含 `lastStatusChange` 的 DTO；在 `backend/src/routes/adminRouter.ts` 的 `GET /admin/equipments` 以 zod 驗證新的 `status` 查詢參數（FR-008、US1 情境 10）
  - **Must Read**
    - `contracts/openapi.yaml` → `listAdminEquipments`、`AdminEquipmentPage`、`AdminEquipmentSetting` — Why：新增的 `status` 篩選、`statusCounts` 與排序分頁規則
    - `contracts/openapi.yaml` → `LastEquipmentStatusChange`、`EquipmentStatusCounts` — Why：最近一次變更與狀態台數的欄位
    - `data/data-model.dbml` → `Table equipment_status_changes` — Why：取最近一次變更使用的索引與欄位
    - `data/data-model.dbml` → `Table users` 的 `display_name` — Why：最近變更的管理員名稱來源
  - **Optional**
    - `contracts/openapi.yaml` → `updateEquipmentApprovalMode` — Why：需要確認切換審核設定時設備送修中或停用也可以切換時
- [X] T015 [US1] 新增 `backend/src/services/equipmentStatusService.ts`，先寫預覽與確認共用的計數函式：這台設備 `deleted_at` 為 null、`status` 為 `pending_approval` 或 `confirmed`，且時段結束時間（`reservation_date` 加 `time_slots.end_time`，依 `Asia/Taipei` 解讀）晚於目前時間的預約數為 `cancelCount`；其中有 `pending_approval` 改期申請的筆數為 `expireCount`；`checked_out`（含逾期未還）的預約轉成 `checkedOutReservations`（依 `reservationDate`、`slotStartTime`、`reservationId` 由小到大，附 `isOverdue`）；再實作 `getEquipmentStatusChangePreview(equipmentId, targetStatus)`：在交易內先呼叫 `expireDueRescheduleRequests(tx, now)`，設備不存在回 `404 RESOURCE_NOT_FOUND`，`targetStatus` 等於目前狀態回 `409 EQUIPMENT_STATUS_UNCHANGED`，回傳 `EquipmentStatusChangePreview`；本操作不改變任何設備、預約與改期申請（FR-002、FR-003、FR-004、FR-005、FR-007、US1 情境 3、4、6、16）
  - **Must Read**
    - `contracts/openapi.yaml` → `getEquipmentStatusChangePreview`、`EquipmentStatusChangePreview`、`CheckedOutReservationSummary` — Why：3 個計數的條件、回傳欄位與借用中預約摘要的排序
    - `research.md` → §2 — Why：預覽與確認時共用同一組計算條件
    - `data/data-model.dbml` → `Table reservations`（`idx_reservations_equipment_status_date`）、`Table time_slots` 的 `end_time` — Why：判斷時段尚未結束的欄位與計數使用的索引
    - `spec.md` → FR-002、FR-003、FR-004、FR-005 — Why：要計入取消與失效的預約範圍，以及借用中的判斷
  - **Optional**
    - `spec.md` → Edge Cases「設備有逾期未還的借用」 — Why：需要確認逾期未還仍視為借用中時
- [X] T016 [US1] 在 `backend/src/services/equipmentStatusService.ts` 實作 `updateEquipmentStatus` 的送修與停用路徑（`targetStatus` 為 `maintenance` 或 `retired`）：以單一 `prisma.$transaction(async (tx) => ...)` 執行，第一個語句以 `tx.$queryRaw` 下達 `SELECT status FROM equipments WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`，接著呼叫 `expireDueRescheduleRequests(tx, now)`；依序檢查：有 `checked_out` 預約回 `EQUIPMENT_ON_LOAN`；目前狀態不等於 `expectedCurrentStatus` 回 `EQUIPMENT_STATE_CHANGED`、目標狀態等於目前狀態回 `EQUIPMENT_STATUS_UNCHANGED`（判斷順序見 Notes 待確認 3）；以 T015 的計數函式重算，和 `expectedCancelCount`、`expectedExpireCount` 任一不同回 `EQUIPMENT_STATE_CHANGED`；通過後以一條 `UPDATE reservations r SET status = 'cancelled', cancel_reason = ..., cancelled_at = now, updated_at = now, updated_by = 管理員 FROM time_slots s WHERE ... RETURNING r.id` 取消預約（`cancel_reason` 為 `equipment_maintenance` 或 `equipment_retired`）；以一條 `updateMany` 把這些預約的 `pending_approval` 改期申請改為 `expired`、`expire_reason` 為 `reservation_cancelled`、`expired_at` 為 now、`updated_by` 為管理員；更新 `equipments.status`、`updated_at`、`updated_by`（不改 `requires_approval`）；新增一筆 `equipment_status_changes`（`changed_at` 為 now，`cancelled_reservation_count` 為 RETURNING 的筆數）；回傳 `EquipmentStatusChangeResult`；送修中與停用直接切換走同一條路徑（FR-001、FR-002、FR-003、FR-004、FR-005、FR-008、FR-010、FR-019、US1 情境 2、5、6、7、8、11、15、16）
  - **Must Read**
    - `contracts/openapi.yaml` → `updateEquipmentStatus`、`SetEquipmentUnavailableRequest` — Why：檢查順序、批次更新內容與各錯誤碼
    - `contracts/openapi.yaml` → `EquipmentStatusChangeResult`、`EquipmentStatusChange` — Why：成功時的回應欄位
    - `research.md` → §2 — Why：交易內 6 個步驟、批次 `UPDATE ... RETURNING` 與不用 `version` 樂觀鎖的原因
    - `research.md` → §3 — Why：設備列 `FOR UPDATE` 必須是交易的第一個語句，所有路徑先鎖設備列再讀寫預約
    - `data/data-model.dbml` → `Table reservations` 的 `cancel_reason`、`cancelled_at`、`updated_by` — Why：取消預約時要寫入的欄位
    - `data/data-model.dbml` → `Table reschedule_requests` 的 `expire_reason`、`expired_at` — Why：改期申請失效時要寫入的欄位與時間
    - `spec.md` → FR-019、US1 情境 15 — Why：確認時狀態或數量不同要拒絕，且設備、預約與改期申請都不變
  - **Optional**
    - `data/data-model.dbml` → `Enum reservation_status` — Why：需要確認 `returned`、`rejected`、`cancelled` 不在取消範圍時
- [X] T017 [US1] 在 `backend/src/routes/adminRouter.ts` 新增 `GET /admin/equipments/:equipmentId/status-change-preview`（`getEquipmentStatusChangePreview`）：以 zod 驗證路徑參數 uuid 與 `targetStatus`（`maintenance`、`retired`），不符時回 `VALIDATION_FAILED`；新增 `PATCH /admin/equipments/:equipmentId/status`（`updateEquipmentStatus`）：以 zod 驗證 `SetEquipmentUnavailableRequest`，缺少 expected 欄位時回 `VALIDATION_FAILED`，把 `req.authUser.id` 傳給服務作為經手管理員；兩者都掛在 `requireAuth`、`requireAdmin` 之後（FR-007、FR-017、NFR-002）
  - **Must Read**
    - `contracts/openapi.yaml` → `getEquipmentStatusChangePreview`、`updateEquipmentStatus` — Why：兩個路由的路徑、查詢參數、狀態碼與回應
    - `contracts/openapi.yaml` → `SetEquipmentUnavailableRequest` — Why：設為送修或停用時必填的 expected 欄位
- [X] T018 [US1] 在 `backend/src/services/reservationService.ts` 的 `toReservationDto` 加入 `cancelReason`（取自 `cancel_reason`，未取消時為 null），讓 `Reservation` 與 `AdminReservationItem` 都帶取消原因；`listAllReservations` 照常回傳送修中與停用設備上的紀錄（FR-020、US1 情境 17）
  - **Must Read**
    - `contracts/openapi.yaml` → `AdminReservationItem` 的 `cancelReason`、`cancelledAt` — Why：取消原因的值與為 null 的情況
    - `contracts/openapi.yaml` → `listAllReservations` — Why：全體預約回傳取消原因，管理員從這裡找出受影響的成員
- [X] T019 [US1] 在 `backend/src/services/reservationService.ts` 把 `createReservation` 的檢查與新增包進單一 `prisma.$transaction(async (tx) => ...)`：第一個語句以 `tx.$queryRaw` 下達 `SELECT status, requires_approval FROM equipments WHERE id = $1 AND deleted_at IS NULL FOR SHARE`，取得鎖之後才檢查狀態；`status` 不是 `available` 時回 `409 EQUIPMENT_UNAVAILABLE`，訊息依狀態寫「設備送修中，無法預約」或「設備已停用，無法預約」；新預約依鎖定後讀到的 `requires_approval` 決定 `pending_approval` 或 `confirmed`；`P2002` 轉成 `409` 的既有處理不變（FR-006、FR-009、FR-013、US1 情境 9、12、SC-002）
  - **Must Read**
    - `contracts/openapi.yaml` → `createReservation`、`CreateReservationConflict` — Why：交易內鎖定設備列的時機與 `EQUIPMENT_UNAVAILABLE` 的訊息
    - `research.md` → §3 — Why：`FOR SHARE` 與 `FOR UPDATE` 互斥的序列化做法，以及 `createReservation` 改成單一交易
    - `spec.md` → FR-006、FR-009 — Why：非可用設備拒絕新預約，同時發生時設備不留下未結束預約
- [X] T020 [US1] 在 `backend/src/services/reservationService.ts` 的 `approveReservation`，交易第一個語句改為 `SELECT status, requires_approval FROM equipments WHERE id = $1 AND deleted_at IS NULL FOR SHARE`；取得鎖之後，申請已非 `pending_approval` 時回 `409 INVALID_RESERVATION_STATUS`，若是因設備送修或停用被取消，訊息寫出取消時間與原因；設備 `status` 不是 `available` 時回 `409 EQUIPMENT_UNAVAILABLE`（FR-002、FR-009、Edge Cases 待審核的預約）
  - **Must Read**
    - `contracts/openapi.yaml` → `approveReservation`、`ApproveReservationConflict` — Why：鎖定順序與兩種 409 的判斷
    - `research.md` → §3 — Why：核准待審預約也要先以 `FOR SHARE` 鎖定設備列
    - `ui/plan.md` → §5 `admin.html` 的「核准時預約已取消」 — Why：錯誤訊息要寫出取消時間與原因
- [X] T021 [US1] 在 `backend/src/services/reservationService.ts` 的 `pickupReservationByAdmin` 與 `rejectReservation`，預約已因設備送修或停用被取消時回 `409 INVALID_RESERVATION_STATUS`，訊息寫出取消時間與取消原因；登記領取被拒時說明不能領取這台設備（FR-003、Edge Cases 時段進行中但尚未領取）
  - **Must Read**
    - `contracts/openapi.yaml` → `pickupReservationByAdmin`、`rejectReservation` — Why：已因設備送修或停用取消時的 409 與訊息內容
    - `spec.md` → FR-003 — Why：時段已開始但尚未領取的預約被取消後不能再領取
    - `ui/plan.md` → §5 `admin.html` 的「登記領取時預約已取消」 — Why：登記領取被拒時的提示文字
- [X] T022 [P] [US1] 在 `backend/src/services/rescheduleService.ts` 的 `createRescheduleRequest` 即時改期路徑（設備 `requires_approval` 為 false）與 `approveRescheduleRequest`，交易第一個語句改為 `SELECT status, requires_approval FROM equipments WHERE id = $1 AND deleted_at IS NULL FOR SHARE`，取得鎖之後設備 `status` 不是 `available` 時回 `409 EQUIPMENT_UNAVAILABLE`，訊息依狀態寫「設備送修中」或「設備已停用」；改期申請已因原預約被取消而 `expired` 時維持回 `409 INVALID_RESCHEDULE_STATUS`；需人工審核設備送出改期申請的路徑依合約不鎖設備列（見 Notes 待確認 4）（FR-004、FR-009）
  - **Must Read**
    - `contracts/openapi.yaml` → `createRescheduleRequest`、`approveRescheduleRequest` — Why：哪些路徑要先鎖定設備列，以及 `EQUIPMENT_UNAVAILABLE`、`INVALID_RESCHEDULE_STATUS` 的情況
    - `research.md` → §3 — Why：即時改期與核准改期申請的鎖定順序
  - **Optional**
    - `contracts/openapi.yaml` → `CreateRescheduleConflict`、`ApproveRescheduleConflict` — Why：需要確認各 409 錯誤碼的完整清單時

### 前端（F4、F5）

- [X] T023 [US1] 在 `frontend/src/api/client.ts` 新增 `getEquipmentStatusChangePreview(equipmentId, targetStatus)`（`GET /admin/equipments/{equipmentId}/status-change-preview`）與 `updateEquipmentStatus(equipmentId, body)`（`PATCH /admin/equipments/{equipmentId}/status`，`body` 型別為 `UpdateEquipmentStatusRequest`），以及 `EquipmentStatusChangePreview`、`CheckedOutReservationSummary`、`EquipmentStatusChangeResult`、`EquipmentStatusChange` 型別；`AdminEquipmentSetting` 加入 `lastStatusChange`，`AdminEquipmentPage` 加入 `statusCounts`，`Reservation` 與 `AdminReservationItem` 加入 `cancelReason`（FR-007、FR-008、FR-020）
  - **Must Read**
    - `contracts/openapi.yaml` → `getEquipmentStatusChangePreview`、`updateEquipmentStatus` — Why：呼叫的路徑、參數與回應
    - `contracts/openapi.yaml` → `EquipmentStatusChangePreview`、`UpdateEquipmentStatusRequest`、`EquipmentStatusChangeResult` — Why：預覽、請求與結果的前端型別
    - `contracts/openapi.yaml` → `LastEquipmentStatusChange`、`EquipmentStatusCounts`、`ReservationCancelReason` — Why：設備清單與預約清單新增欄位的型別
- [X] T024 [US1] 在 `frontend/src/text/zh-TW.ts` 新增取消原因標籤（`equipment_maintenance` 設備送修、`equipment_retired` 設備停用、`member_cancelled` 成員取消，見 Notes 待確認 2）、確認視窗與設備操作文字（「設為送修」「設為停用」「確認設為送修」「確認設為停用」「設定中…」、「將取消 N 筆預約、M 筆改期申請將失效」），以及錯誤碼 `EQUIPMENT_ON_LOAN`、`EQUIPMENT_STATUS_UNCHANGED`、`EQUIPMENT_STATE_CHANGED` 的說明（NFR-001、FR-005、FR-019）
  - **Must Read**
    - `ui/plan.md` → §4 `equipment-status.html` 的「設為送修確認視窗」「狀態變更處理中」「已設為送修」 — Why：確認視窗、處理中與完成橫幅的文字
    - `ui/plan.md` → §5 `equipment-status.html` 的「設備借用中」「設備狀態已被變更」 — Why：兩種拒絕情況的提示文字
    - `spec.md` → NFR-001 — Why：新增文字與錯誤提示使用臺灣繁體中文並說明失敗原因
- [X] T025 [US1] 新增 `frontend/src/components/EquipmentStatusDialog.tsx`，沿用 `RescheduleDialog.tsx` 的自製對話框寫法：開啟時呼叫 `getEquipmentStatusChangePreview`，計算中顯示轉圈與「正在計算將取消的預約與將失效的改期申請…」並停用確認按鈕；預覽完成後顯示標題「設為送修：<設備編號> <設備名稱>」、狀態「可用 → 送修中」、大字「將取消 N 筆預約、M 筆改期申請將失效」、取消範圍與已結束紀錄不變、恢復後不會自動復原的說明，目標為停用時加上「停用後，這台設備會從成員的設備清單隱藏。」；按鈕「取消」與「確認設為送修」或「確認設為停用」；確認時把 `currentStatus`、`cancelCount`、`expireCount` 原樣放入 `expectedCurrentStatus`、`expectedCancelCount`、`expectedExpireCount`；送出中兩個按鈕都停用，確認按鈕改為「設定中…」；`hasCheckedOutReservation` 為 true 時不顯示數量，改為紅框「設備借用中，請先登記歸還」並列出每筆借用（逾期時說明已超過歸還時間），停用確認按鈕並提供「前往登記歸還」；收到 `EQUIPMENT_STATE_CHANGED` 時關閉視窗並把錯誤交給上層顯示；手機寬度改為全螢幕（FR-005、FR-007、FR-019、US1 情境 3、4、8、15）
  - **Must Read**
    - `research.md` → §4 — Why：確認視窗先呼叫預覽、確認時帶入預覽結果、收到 409 時關閉視窗的處理
    - `ui/plan.md` → §3.3 A10、A11、A12 — Why：開啟、確認與取消確認視窗的使用者操作
    - `ui/plan.md` → §4 `equipment-status.html` 的「計算受影響預約中」「設為送修確認視窗」「狀態變更處理中」「改為停用確認視窗」 — Why：視窗各狀態的呈現
    - `ui/plan.md` → §5 `equipment-status.html` 的「設備借用中」「設備狀態已被變更」「取消確認視窗」 — Why：拒絕與取消時的回饋
    - `ui/equipment-status.html` → 雛形狀態「計算受影響預約中」「設為送修確認視窗」「設備借用中」 — Why：視窗版面與大字數量的實際樣子
    - `contracts/openapi.yaml` → `EquipmentStatusChangePreview` — Why：確認時要原樣帶入的 3 個值
- [X] T026 [US1] 在 `frontend/src/views/AdminOverviewView.tsx` 的設備區塊（「設備狀態管理」頁籤，見 Notes 待確認 1）顯示摘要「可用 N｜送修中 N｜停用 N」（取自 `statusCounts`）；每列顯示狀態徽章、審核設定與最近變更（`changedByDisplayName` 與依 `Asia/Taipei` 顯示的 `changedAt`，`lastStatusChange` 為 null 時顯示「尚無狀態變更」）；「可用」列提供「設為送修」「設為停用」，「送修中」列提供「設為停用」，「停用」列提供「設為送修」，點擊後開啟 `EquipmentStatusDialog`；成功後重新拉取設備清單，頁頂綠色橫幅「已將 <設備> 設為「送修中」，取消 N 筆預約，M 筆改期申請已失效。」與「查看受影響的預約」，送修中改為停用時改寫成「從「送修中」改為「停用」」的句型；收到 `EQUIPMENT_STATE_CHANGED` 時頁頂紅色橫幅「設備狀態已被變更，請重新確認。」並重新拉取清單；720px 以下改為一台設備一張卡片；一般成員開啟時顯示「權限不足」卡片（FR-001、FR-007、FR-008、FR-010、FR-019、US1 情境 1、10、11）
  - **Must Read**
    - `ui/plan.md` → §4 `equipment-status.html` 的「載入中」「設備清單」「已設為送修」「已改為停用」 — Why：設備清單、最近變更與完成橫幅的呈現
    - `ui/plan.md` → §5 `equipment-status.html` 的「設備狀態已被變更」「權限不足」 — Why：確認被拒後的橫幅與一般成員開啟時的畫面
    - `ui/equipment-status.html` → 雛形狀態「設備清單」「已設為送修」「已改為停用」 — Why：列的欄位、按鈕配置與橫幅的實際樣子
    - `research.md` → §4 — Why：各狀態顯示的操作按鈕與操作後重新拉取清單
    - `contracts/openapi.yaml` → `AdminEquipmentPage` — Why：`statusCounts` 與 `lastStatusChange` 的來源
- [X] T027 [US1] 在 `frontend/src/views/AdminOverviewView.tsx` 的待審清單與全體預約區塊（「審核與借用管理」頁籤）：全體預約新增取消原因欄，`cancelReason` 為 `equipment_maintenance` 顯示琥珀色「設備送修」、`equipment_retired` 顯示灰色「設備停用」、`member_cancelled` 顯示「成員取消」（見 Notes 待確認 2），並顯示取消時間；核准申請、核准改期或登記領取收到 `INVALID_RESERVATION_STATUS`、`INVALID_RESCHEDULE_STATUS`、`EQUIPMENT_UNAVAILABLE` 時，頁頂紅色橫幅顯示後端訊息，並重新拉取待審清單與全體預約；登記歸還完成的橫幅加上「前往設備狀態管理」（FR-020、FR-003、FR-004、FR-009、US1 情境 17）
  - **Must Read**
    - `ui/plan.md` → §4 `admin.html` 的「設備送修後的總覽」「篩選已取消的預約」「登記歸還完成」 — Why：取消原因欄、篩選結果與登記歸還後的連結
    - `ui/plan.md` → §5 `admin.html` 的「因設備送修或停用取消的預約」「核准時預約已取消」「核准改期時申請已失效」「登記領取時預約已取消」 — Why：取消原因樣式與 3 種被拒情況的回饋
    - `ui/admin.html` → 雛形狀態「設備送修後的總覽」「核准時預約已取消」「登記領取時預約已取消」 — Why：表格欄位與紅色橫幅的實際樣子
    - `spec.md` → FR-020 — Why：全體預約管理頁必須顯示「設備送修」或「設備停用」
- [X] T028 [US1] 在 `frontend/src/App.tsx` 串接 US1 的頁籤切換：設備狀態管理的「查看受影響的預約」切到「審核與借用管理」並把全體預約篩選設為「已取消」；確認視窗的「前往登記歸還」切到「審核與借用管理」；登記歸還完成橫幅的「前往設備狀態管理」切回「設備狀態管理」（見 Notes 待確認 1）（FR-005、FR-020）
  - **Must Read**
    - `ui/plan.md` → §3.2 — Why：設備狀態管理與審核與借用管理之間的轉換
  - **Optional**
    - `ui/plan.md` → §5 `equipment-status.html` 的「設備借用中」 — Why：需要確認「前往登記歸還」出現的位置時

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 管理員把送修中或停用的設備恢復成可用 (Priority: P2)

**Goal**: 管理員對「送修中」或「停用」設備點擊「恢復可用」，設備改回「可用」並保留原本的人工審核設定；送修或停用時被取消的預約與失效的改期申請都不復原。

**Independent Test**: 準備一台「送修中」的設備，它有一筆送修時被取消的預約，且設備設定為需人工審核；管理員點擊「恢復可用」；驗證設備變成「可用」，被取消的預約仍為「已取消」，成員可以預約它的未來時段，新預約進入「待審核」。

### 後端（B4）

> D2 的 `equipment_status_changes` 已在 Foundational 建立，本故事沒有資料庫任務。

- [X] T029 [US2] 在 `backend/src/services/equipmentStatusService.ts` 的 `updateEquipmentStatus` 新增恢復可用路徑（`targetStatus` 為 `available`）：沿用同一個交易與 `FOR UPDATE` 鎖定；目前狀態已是 `available` 時回 `409 EQUIPMENT_STATUS_UNCHANGED`；否則只更新 `equipments.status`、`updated_at`、`updated_by`，不改 `requires_approval`；新增一筆 `equipment_status_changes`，`cancelled_reservation_count` 為 0；不讀取也不修改任何預約與改期申請；回傳 `EquipmentStatusChangeResult`，`expiredRescheduleRequestCount` 為 0（FR-011、FR-012、FR-013、US2 情境 1–4、SC-004）
  - **Must Read**
    - `contracts/openapi.yaml` → `updateEquipmentStatus`、`RestoreEquipmentRequest` — Why：恢復可用的處理範圍、回應與 `EQUIPMENT_STATUS_UNCHANGED` 的情況
    - `research.md` → §2 — Why：恢復可用只更新狀態並新增紀錄，不讀取也不修改預約與改期申請
    - `data/data-model.dbml` → `Table equipment_status_changes` 的 `cancelled_reservation_count` — Why：恢復可用時為 0
    - `spec.md` → FR-012、FR-013 — Why：被取消的預約不得自動復原，人工審核設定要保留
- [X] T030 [US2] 在 `backend/src/routes/adminRouter.ts` 的 `PATCH /admin/equipments/:equipmentId/status`，zod 驗證改為接受 `UpdateEquipmentStatusRequest` 的兩種格式：`SetEquipmentUnavailableRequest` 與只帶 `targetStatus: "available"` 的 `RestoreEquipmentRequest`；一般成員呼叫時由 `requireAdmin` 回 `403 FORBIDDEN`，設備狀態不變（FR-017、US2 情境 5）
  - **Must Read**
    - `contracts/openapi.yaml` → `UpdateEquipmentStatusRequest`、`RestoreEquipmentRequest` — Why：兩種請求格式與恢復可用不需要 expected 欄位
    - `spec.md` → US2 情境 5、FR-017 — Why：一般成員呼叫恢復可用時被拒絕且設備狀態不變

### 前端（F4）

- [X] T031 [US2] 在 `frontend/src/views/AdminOverviewView.tsx` 的設備區塊，為「送修中」與「停用」列加上「恢復可用」：點擊後不開確認視窗，直接以 `updateEquipmentStatus(equipmentId, { targetStatus: "available" })` 送出；處理中按鈕改為「恢復中…」並停用；成功後重新拉取設備清單，頁頂綠色橫幅「已將 <設備> 恢復為「可用」，審核設定維持「<需人工審核或免審核>」。送修時取消的預約不會自動復原。」；橫幅與按鈕文字加入 `frontend/src/text/zh-TW.ts`（FR-011、FR-012、FR-013、US2 情境 1、2）
  - **Must Read**
    - `ui/plan.md` → §3.3 A13 — Why：恢復可用的使用者操作
    - `ui/plan.md` → §4 `equipment-status.html` 的「恢復可用處理中」「已恢復可用」 — Why：處理中與完成橫幅的呈現
    - `ui/equipment-status.html` → 雛形狀態「恢復可用處理中」「已恢復可用」 — Why：按鈕與橫幅的實際樣子
    - `research.md` → §4 — Why：「送修中」與「停用」列都提供「恢復可用」

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 成員看到設備送修或停用的狀態與預約被取消的原因 (Priority: P3)

**Goal**: 成員在「設備預約」頁看到「送修中」設備的標示且不能預約，「停用」設備不出現；在「我的預約」看到因設備送修或停用被取消的預約與取消原因，以及停用設備上的歷史紀錄。

**Independent Test**: 準備一台「送修中」設備、一台「停用」設備、一筆因送修被取消的成員預約，以及一筆該成員在停用設備上的「已歸還」紀錄；以該成員登入；驗證「設備預約」頁的顯示、「我的預約」中的取消原因與歷史紀錄。

### 後端（B2、B5）

> D2、D3 已在 Foundational 建立，本故事沒有資料庫任務。

- [ ] T032 [US3] 在 `backend/src/services/equipmentService.ts` 的 `listEquipments` 只查 `status` 為 `available` 或 `maintenance` 的設備：`retired` 不出現在 `items`，也不計入 `totalItems`；以 `equipmentId` 篩選停用設備時回 `200` 與空的 `items`；`EquipmentWithSlotAvailabilityDto.status` 型別改為 `available`、`maintenance`；`maintenance` 設備的所有時段 `isBookable` 為 false；設備恢復可用後，被取消預約的原時段回 `AVAILABLE`（FR-014、FR-011、FR-012、US3 情境 1、2、US2 情境 1、2）
  - **Must Read**
    - `contracts/openapi.yaml` → `listEquipments`、`EquipmentWithSlotAvailability`、`MemberVisibleEquipmentStatus` — Why：排除停用、`totalItems` 的計算與送修中時段一律不可預約
    - `data/data-model.dbml` → `Table equipments`（`idx_equipments_category_status`） — Why：成員清單排除 `retired` 使用的索引
    - `spec.md` → FR-014 — Why：送修中設備標示且不提供預約，停用設備不出現在成員清單
- [ ] T033 [US3] 在 `backend/src/services/reservationService.ts` 的 `cancelReservation`，預約已取消時回 `409 RESERVATION_ALREADY_CANCELLED`，訊息寫出依 `Asia/Taipei` 顯示的取消時間與取消原因（例如因設備送修取消時寫出「設備送修」）；確認 `listMyReservations` 不以設備 `status` 篩選，送修中與停用設備上的紀錄照常回傳設備編號與名稱（FR-015、FR-016、US3 情境 3、4）
  - **Must Read**
    - `contracts/openapi.yaml` → `cancelReservation`、`CancelReservationConflict` — Why：已因設備送修或停用取消時的 409 與訊息內容
    - `contracts/openapi.yaml` → `listMyReservations` — Why：本人在送修中或停用設備上的紀錄照常回傳
    - `ui/plan.md` → §5 `my-reservations.html` 的「取消時預約已因設備送修取消」 — Why：錯誤訊息的文字

### 前端（F2、F3）

- [ ] T034 [US3] 在 `frontend/src/views/EquipmentBookingView.tsx`，`status` 為 `maintenance` 的設備卡片顯示琥珀色「送修中」徽章與「設備送修中，暫停預約」，3 個時段顯示「送修中」且為不能點選的灰色格子，點選時右側面板不變；送出預約收到 `EQUIPMENT_UNAVAILABLE` 時，頁頂紅色橫幅顯示後端訊息、清除右側選取並重新拉取設備清單（停用設備會消失，清單件數更新）（FR-014、FR-006、US3 情境 1、2、US1 情境 9）
  - **Must Read**
    - `ui/plan.md` → §4 `booking.html` 的「檢視固定時段狀態」「設備恢復可用後」 — Why：送修中標示與恢復可用後清單的呈現
    - `ui/plan.md` → §5 `booking.html` 的「送修中設備的時段」「停用設備不顯示」「預約時設備已送修」「預約時設備已停用」 — Why：時段格子的樣式與兩種預約被拒的回饋
    - `ui/booking.html` → 雛形狀態「檢視固定時段狀態」「預約時設備已送修」「預約時設備已停用」 — Why：設備卡片與紅色橫幅的實際樣子
    - `contracts/openapi.yaml` → `EquipmentSlotAvailability` 的 `isBookable` — Why：送修中時一律為 false，前端據此不提供預約
- [ ] T035 [P] [US3] 在 `frontend/src/views/MyReservationsView.tsx`，`cancelReason` 為 `equipment_maintenance` 或 `equipment_retired` 的預約顯示「已取消」徽章與琥珀色條「取消原因：設備送修｜取消時間 YYYY-MM-DD HH:mm」（或「設備停用」）；`member_cancelled` 只顯示「取消時間 …」；送修中或停用設備上的紀錄照常顯示設備編號、名稱與狀態；改期紀錄中失效的申請顯示灰色「改期已失效」與「失效原因：原預約已取消」；取消預約收到 `RESERVATION_ALREADY_CANCELLED` 時，頁頂紅色橫幅顯示後端訊息並重新拉取清單（FR-015、FR-016、FR-012、FR-004、US3 情境 3、4、5、US2 情境 3）
  - **Must Read**
    - `ui/plan.md` → §4 `my-reservations.html` 的「預約清單」「設備送修後的預約清單」「設備恢復可用後的預約清單」 — Why：取消原因、成員取消與停用設備紀錄的呈現
    - `ui/plan.md` → §5 `my-reservations.html` 的「因設備送修或停用取消的預約」「成員自行取消的預約」「停用設備的歷史紀錄」「改期申請因原預約取消而失效」「取消時預約已因設備送修取消」 — Why：各種預約卡片的文字與取消被拒的回饋
    - `ui/my-reservations.html` → 雛形狀態「預約清單」「設備送修後的預約清單」「取消時預約已因設備送修取消」 — Why：琥珀色條與改期紀錄的實際樣子
    - `contracts/openapi.yaml` → `Reservation` 的 `cancelReason`、`cancelledAt` — Why：取消原因與取消時間的來源
    - `spec.md` → FR-015 — Why：成員自行取消的預約不顯示「設備送修」或「設備停用」

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T036 [P] 在 `frontend/tests/unit/zh-TW.test.ts` 補上設備 3 態標籤、3 種取消原因標籤與 `EQUIPMENT_ON_LOAN`、`EQUIPMENT_STATUS_UNCHANGED`、`EQUIPMENT_STATE_CHANGED` 錯誤說明的檢查，確認都是臺灣繁體中文並說明失敗原因（NFR-001）
  - **Must Read**
    - `spec.md` → NFR-001 — Why：檢查標準
- [ ] T037 在 `backend/tests/integration/equipmentStatus.test.ts` 以 Vitest 5 + Supertest 7 與真實 PostgreSQL 18 驗證：依 US1 Independent Test 的資料設為送修後，尚未結束的 `pending_approval` 與 `confirmed` 預約 100% 變成 `cancelled` 並帶 `equipment_maintenance`，`returned`、`rejected`、`cancelled` 紀錄完全不變；以 `vi.setSystemTime` 固定在時段進行中，確認已開始未領取與已開始仍待審核的預約一併取消（SC-001、FR-002、FR-003）；設備有 `checked_out` 預約時設定送修與停用都回 `EQUIPMENT_ON_LOAN` 且資料不變（SC-003）；開啟預覽後插入新預約再確認，回 `EQUIPMENT_STATE_CHANGED` 且設備、預約與改期申請都不變（FR-019）
  - **Must Read**
    - `spec.md` → SC-001、SC-003、FR-019 — Why：量測標準與確認時資料改變的預期結果
    - `research.md` → §5 — Why：整合測試的資料庫、`vi.setSystemTime` 與 FR-019 的驗證方式
- [ ] T038 在 `backend/tests/integration/equipmentStatus.test.ts` 再驗證：恢復可用後被取消的預約 0% 復原，成員對恢復設備未來時段的預約 100% 依 `requires_approval` 成立或進入 `pending_approval`（SC-004）；一般成員呼叫預覽、設為送修、設為停用與恢復可用 100% 回 `403 FORBIDDEN`（SC-005、FR-017）
  - **Must Read**
    - `spec.md` → SC-004、SC-005 — Why：量測標準
    - `research.md` → §5 — Why：整合測試的寫法
- [ ] T039 [P] 在 `backend/tests/integration/equipmentStatusConcurrency.test.ts` 以 `Promise.all` 同時送出新預約與設定送修、同時核准待審預約與設定送修，各重複 20 輪，每輪確認設備沒有尚未結束的 `pending_approval` 或 `confirmed` 預約，且新預約不是被拒絕就是被取消並帶 `equipment_maintenance`（SC-002、FR-009）
  - **Must Read**
    - `spec.md` → SC-002、US1 情境 12 — Why：並發時設備留下未結束預約的筆數必須為 0
    - `research.md` → §5 — Why：重複 20 輪的並發驗證方式
  - **Optional**
    - `research.md` → §3 — Why：並發驗證失敗、需要確認鎖的取得順序時
- [ ] T040 [P] 在 `backend/tests/integration/equipmentStatusPerformance.test.ts` 為一台設備建立 100 筆尚未結束的預約，量測預覽、設為送修、設為停用與恢復可用的回應時間都低於 2 秒（SC-006、NFR-002）
  - **Must Read**
    - `spec.md` → SC-006、NFR-002 — Why：回應時間的量測標準
    - `research.md` → §5 — Why：建立 100 筆預約後量測的做法
- [ ] T041 [P] 在 `backend/tests/migration/equipmentMaintenanceRetire.test.ts` 以 `pg` 在獨立測試資料庫依序執行 `backend/prisma/migrations/` 中 007 之前的 `migration.sql`，寫入一台 `unavailable` 設備與各種狀態的預約、借用與改期申請，再執行 007 的 `migration.sql`，確認設備變成 `retired`、既有取消紀錄的 `cancel_reason` 為 `member_cancelled`，其餘欄位值與資料列數都不變（FR-018、US1 情境 13）
  - **Must Read**
    - `research.md` → §5 — Why：逐支執行 `migration.sql` 的遷移測試做法
    - `spec.md` → FR-018、US1 情境 13 — Why：無損遷移的檢查標準
- [ ] T042 [P] 在 `e2e/equipment-maintenance.spec.ts` 以 Playwright 1.65 走完：管理員設為送修並在確認視窗看到數量、成員看到「送修中」與取消原因「設備送修」、停用設備從成員清單消失、恢復可用後成員重新預約（SC-001、SC-004）
  - **Must Read**
    - `spec.md` → US1、US2、US3 的 Independent Test — Why：端對端測試要走的流程
    - `research.md` → §5 — Why：端對端測試的範圍
- [ ] T043 修正 003～006 既有測試中依賴 `isActive` 或 `unavailable` 的斷言，再執行 `npm run test:backend`、`npm run test:frontend` 與 `npm run test:e2e`，確認前四版回歸 100% 通過（SC-005）
  - **Must Read**
    - `spec.md` → SC-005、FR-018 — Why：前四版既有功能必須完整保留
- [ ] T044 [P] 在 `README.md` 補上 007 的資料庫遷移（`npm run db:migrate`）、demo seed 內容（送修中、停用與可示範設為送修的設備）、新測試的執行方式，以及設為送修、恢復可用的示範步驟（FR-018）
  - **Must Read**
    - `spec.md` → FR-018 — Why：demo seed 必須包含的展示資料
    - `research.md` → §5 — Why：遷移測試、整合測試與端對端測試的執行方式
- [ ] T045 在 `apps/equipment-loan/` 執行 `npm run check`（`tsc --noEmit`、ESLint、`prettier --check`），修正所有錯誤（research §4）
  - **Must Read**
    - `techstack.md` → 技術堆疊總覽 — Why：靜態檢查與格式化使用的工具
- [ ] T046 依 `README.md` 以 demo seed 手動走一次 US1～US3 的 Independent Test，逐條核對各故事的 Acceptance Scenarios
  - **Must Read**
    - `spec.md` → US1、US2、US3 的 Independent Test — Why：手動驗證的步驟
    - `spec.md` → US1、US2、US3 的 Acceptance Scenarios — Why：逐條核對的預期結果

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US2 恢復可用需要 US1 設成「送修中」或「停用」的設備，US3 的取消原因需要 US1 取消的預約；demo seed（T005）已有送修中與停用範例，所以 US2、US3 也可以在 US1 完成前用 seed 資料驗證，但建議依 P1 → P2 → P3 循序進行
  - 同一故事內，前端與後端任務在不同檔案時可以平行
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: `equipmentStatusService.ts`（T029）擴充 T016 的 `updateEquipmentStatus`，`adminRouter.ts`（T030）擴充 T017，`AdminOverviewView.tsx`（T031）擴充 T026
- **User Story 3 (P3)**: `equipmentService.ts`（T032）擴充 T008、T014，`reservationService.ts`（T033）擴充 T009、T018～T021，`EquipmentBookingView.tsx`（T034）擴充 T012；顯示取消原因需要 T018 的 `cancelReason` 與 T024 的標籤

### Within Each User Story

- `schema.prisma` → Migration → seed → services → routes → `client.ts` 與 `zh-TW.ts` → components 與 views → `App.tsx` 串接
- `equipmentService.ts`、`equipmentStatusService.ts`、`reservationService.ts`、`adminRouter.ts`、`client.ts`、`zh-TW.ts`、`AdminOverviewView.tsx`、`App.tsx` 由多個任務修改，這些任務要依編號循序進行
- Story complete before moving to next priority

### Parallel Opportunities

- Foundational：T006、T007 可與資料庫任務 T003～T005 同時進行；T010～T013（前端）可與後端任務同時進行
- US1：T022（`rescheduleService.ts`）可與 T014～T021 同時進行；T023、T024 完成後，T025（`EquipmentStatusDialog.tsx`）可與後端任務同時進行
- US3：T035（`MyReservationsView.tsx`）可與 T032～T034 同時進行
- Polish：T036、T039～T042、T044 可平行

---

## Parallel Example: User Story 1

```bash
# 後端與前端同時開工：
Task: "實作 updateEquipmentStatus 送修與停用路徑 in backend/src/services/equipmentStatusService.ts"
Task: "即時改期與核准改期先鎖設備列 in backend/src/services/rescheduleService.ts"
Task: "實作設為送修或停用確認視窗 in frontend/src/components/EquipmentStatusDialog.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "實作 updateEquipmentStatus 恢復可用路徑 in backend/src/services/equipmentStatusService.ts"
Task: "設備清單加上恢復可用 in frontend/src/views/AdminOverviewView.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "成員設備清單排除停用設備 in backend/src/services/equipmentService.ts"
Task: "顯示取消原因與停用設備歷史紀錄 in frontend/src/views/MyReservationsView.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 以 US1 的 Independent Test 驗證設為送修、確認視窗數量、取消原因與成員再預約被拒絕
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP：管理員可以把設備設成送修或停用，受影響的未來預約自動取消)
3. Add User Story 2 → Test independently → Deploy/Demo（管理員可以把設備恢復成可用，成員重新預約）
4. Add User Story 3 → Test independently → Deploy/Demo（成員看得到送修中標示與預約被取消的原因）
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done，每個故事依序進行，故事內分工：
   - Developer A：後端（`equipmentStatusService.ts`、`equipmentService.ts`、`reservationService.ts`、`rescheduleService.ts`、`adminRouter.ts`）
   - Developer B：前端（`client.ts`、`zh-TW.ts`、`EquipmentStatusDialog.tsx`、各 views、`App.tsx`）
3. 雙方以 contracts/openapi.yaml 為介面約定，故事完成後一起驗證

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- plan.md 的 Source Code 只列出目錄，沒有列出下列新增檔案的檔名：T004 的 `backend/prisma/migrations/<時間戳>_equipment_maintenance_retire/migration.sql`（`migrations/` 的增量遷移）、T037～T040 的 `backend/tests/integration/equipmentStatus.test.ts`、`equipmentStatusConcurrency.test.ts`、`equipmentStatusPerformance.test.ts`、T041 的 `backend/tests/migration/equipmentMaintenanceRetire.test.ts`、T042 的 `e2e/equipment-maintenance.spec.ts`；檔名依 plan.md 對各目錄的用途說明命名，可依團隊慣例調整
- 待確認 1：ui/plan.md §3.1 把管理員畫面拆成 `equipment-status.html`（設備狀態管理）與 `admin.html`（審核與借用管理）兩頁，頁首有 5 個導覽；plan.md 的 Source Code 只有 `AdminOverviewView.tsx` 一個管理員 view，同時負責設備清單、待審清單與全體預約，沒有列出設備狀態管理的獨立 view。受影響任務：T011、T013、T026、T027、T028。暫行做法：不新增 view 檔，在 `App.tsx` 新增「設備狀態管理」頁籤，兩個頁籤都使用 `AdminOverviewView.tsx` 並以參數決定顯示的區塊；若決定新增獨立 view，需回 system-analysis 更新 plan.md 的 Source Code
- 待確認 2：research §4 寫「我的預約」與全體預約管理在 `cancelReason` 為 `member_cancelled` 時都不顯示原因；ui/plan.md §4、§5 的 `admin.html` 卻在全體預約顯示「成員取消」。spec FR-020 只要求全體預約管理顯示「設備送修」「設備停用」，FR-015 不顯示設備原因的限制只針對「我的預約」。受影響任務：T024、T027。暫行做法：依 ui/plan.md 在全體預約顯示「成員取消」，「我的預約」不顯示；若決定依 research §4，T027 改為 `member_cancelled` 時不顯示原因
- 待確認 3：設為送修或停用的檢查順序不一致。research §2 是借用中 → 目標等於目前狀態（`EQUIPMENT_STATUS_UNCHANGED`）→ 重算目前狀態與數量（`EQUIPMENT_STATE_CHANGED`）；contracts/openapi.yaml 的 `updateEquipmentStatus` 是借用中 → 目前狀態不等於 `expectedCurrentStatus`（`EQUIPMENT_STATE_CHANGED`）→ 目標等於目前狀態（`EQUIPMENT_STATUS_UNCHANGED`）。管理員甲開啟確認視窗後，管理員乙先把同一台設備設成相同的目標狀態時，兩種順序會回不同的錯誤碼。受影響任務：T016。暫行做法：依 contracts 與 spec FR-019、Edge Cases「確認視窗開啟後資料改變」，先比對 `expectedCurrentStatus` 回 `EQUIPMENT_STATE_CHANGED`，再判斷 `EQUIPMENT_STATUS_UNCHANGED`；需 api-plan 與 technical-research 對齊
- 待確認 4：contracts/openapi.yaml 的 `createRescheduleRequest` 與 research §3 只要求免審核的即時改期先以 `FOR SHARE` 鎖定設備列；需人工審核設備送出改期申請時沒有鎖。這個申請和設定送修或停用同時發生時，設定交易看不到尚未提交的新申請，可能留下指向已取消預約、仍為 `pending_approval` 的改期申請，與 spec FR-004「同一次操作把改期審核中申請改成改期已失效」不一致。受影響任務：T022。暫行做法：依 contracts 只在即時改期與核准改期路徑加鎖，T039 的並發驗證若發現殘留，回報後由 api-plan 與 technical-research 決定是否把需人工審核的改期送出也納入 `FOR SHARE`
- 待確認 5：spec FR-008 規定設備狀態變更紀錄「不得刪除」，data/data-model.dbml 的 `Table equipment_status_changes` 也是只新增不修改；research §1 卻寫 demo seed 的 `npm run db:seed` 以 `deleteMany` 重設全部資料（並以此為不採用觸發器的理由），重設時會刪除 `equipment_status_changes` 的資料列。上游沒有說明 demo seed 重設是否屬於 FR-008 的例外。受影響任務：T005。暫行做法：依 research §1 與 §5，demo seed 重設時以 `deleteMany` 清除 `equipment_status_changes`（必須排在 `equipments`、`users` 之前），只用於開發與展示資料庫，服務層與 API 不提供任何刪除紀錄的路徑；若決定不屬於例外，需 technical-research 與 data-plan 改寫重設方式
