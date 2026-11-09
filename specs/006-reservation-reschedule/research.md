# 技術研究與決策紀錄 (Research): 成員預約改期申請與改期成功前保留原預約 (Reservation Reschedule Request)

**Feature Branch**: `006-reservation-reschedule`  
**Date**: 2026-11-09  
**Spec**: [spec.md](./spec.md)

## 1. 改期申請資料表、每筆預約單一審核中申請約束與無損資料遷移 (PostgreSQL 18 + Prisma ORM 7.10 + Docker Compose)

- **Decision**: 沿用 **PostgreSQL 18**（以 **Docker Compose** 啟動容器）與 **Prisma ORM 7.10**（搭配 **`@prisma/adapter-pg`** 與 **`pg`**，維持 `previewFeatures = ["partialIndexes"]`），以一支增量 Prisma Migration 新增改期申請資料，不修改 `reservations` 既有欄位與兩條部分唯一索引：
  - 新增 Enum `reschedule_request_status`：`pending_approval`（改期審核中）、`approved`（改期成功）、`rejected`（改期被駁回）、`withdrawn`（改期已撤回）、`expired`（改期已失效）。
  - 新增 Enum `reschedule_expire_reason`：`original_slot_started`、`new_slot_started`、`reservation_cancelled`、`reservation_checked_out`。
  - 新增資料表 `reschedule_requests`：`id`（`Uuid`）、`reservation_id`（外鍵指向 `reservations.id`）、`user_id`（外鍵指向 `users.id`）、`from_reservation_date`（`Date`）、`from_slot_id`、`to_reservation_date`（`Date`）、`to_slot_id`（外鍵指向 `time_slots.id`）、`status`、`reviewed_by`、`reviewed_at`（`Timestamptz(6)`）、`reject_reason`（`VarChar(200)`）、`withdrawn_at`、`expired_at`、`expire_reason`，以及憲法規定的生命週期欄位。
  - 新增部分唯一索引 `uq_reschedule_requests_pending_per_reservation`：`UNIQUE (reservation_id) WHERE status = 'pending_approval' AND deleted_at IS NULL`，在資料庫層保證同一筆預約最多一筆改期審核中的申請（FR-004）。
  - 新增索引 `idx_reschedule_requests_status_to_slot`（`status, to_reservation_date, to_slot_id, created_at`）供待審清單排序與「設備預約」頁面查詢本人改期審核中的新時段（FR-005、FR-017），以及 `idx_reschedule_requests_reservation_created`（`reservation_id, created_at`）供「我的預約」列出每筆預約的改期紀錄（FR-009）。
  - 改期成功時，直接更新 `reservations.reservation_date` 與 `reservations.slot_id`；既有 `uq_reservations_active_slot`（`status IN ('confirmed', 'checked_out', 'returned')`）在 UPDATE 時同樣生效，所以新時段被占用時資料庫拒絕寫入。
- **Rationale**:
  - 符合使用者技術限制「沿用 `specs/005-equipment-pickup-return/techstack.md`，只研究本次新增的技術主題。原始碼位置不變」：資料庫、ORM 與遷移工具全部沿用，只新增一張表與兩個 Enum。
  - Clarifications 決定「每次改期都建立一筆獨立的改期申請紀錄」，失敗時原預約不變；獨立資料表讓原預約列在改期審核期間完全不被寫入，滿足 FR-003、FR-007 與 SC-002（原預約變動率 0%）。
  - 部分唯一索引在同一成員連點兩次「申請改期」時也只會成立一筆，滿足 FR-004；查證 Prisma ORM 7.10.1 的 `partialIndexes` 仍為現行 preview feature，且 005 已在 `reservations` 使用同一寫法。
  - 改期成功沿用同一筆預約列並由既有部分唯一索引保護新時段，滿足 FR-002、FR-006、FR-014 與 SC-003（時段重複占用 0%）。
  - 滿足 FR-015 與 SC-006：新增資料表與 Enum 不改寫既有 `reservations` 資料列，既有預約 100% 無損保留。
  - 滿足憲法 `.agents/constitution/skills/data-plan/data-model.md` Rule 1～4（生命週期欄位、軟刪除、`timestamptz`／`date` 型別、唯一性約束與歷程保留）：改期申請不實體刪除。
- **Alternatives considered**:
  - **在 `reservations` 加上 `pending_reschedule_*` 欄位，不建立獨立資料表**：只能保存一次改期，失敗後無法保留駁回原因與歷程，違反 Clarifications 第 4 題的決定與 FR-009。
  - **改期成功時取消原預約並建立一筆新預約**：預約編號會改變，違反 FR-002「預約編號與狀態不變」；而且取消與建立分成兩列，中途失敗時可能讓原預約先變成「已取消」，違反 SC-002。
  - **只在應用層檢查同一筆預約是否已有審核中申請**：兩個請求同時通過檢查時會建立兩筆，違反 FR-004。

---

## 2. 改期、核准、駁回、撤回 API 與交易內並發衝突處理 (Express 5 + zod 4 + Prisma 互動式交易)

- **Decision**: 沿用 **Express 5**、**zod 4**、**TypeScript 6.0**、**Node.js 24 LTS 以上**與 **`tsx`**，在 `apps/equipment-loan/backend/` 新增改期 API；每個寫入操作都在單一 Prisma 互動式交易（`prisma.$transaction(async (tx) => ...)`）內完成，衝突以部分唯一索引違反（Prisma 錯誤碼 `P2002`）轉成 `409`，與 005 的 `approveReservation` 作法相同：
  - **成員送出改期（`POST /api/reservations/:reservationId/reschedule-requests`）**：zod 驗證 `toReservationDate`（`YYYY-MM-DD`）與 `toSlotId`；交易內依 FR-001 檢查本人、`confirmed`、原時段尚未開始、新時段在 7 天內且尚未開始、不同於原時段、未被占用。設備 `requires_approval = false` 時，在同一交易內更新預約日期與時段並建立 `approved` 的改期申請（FR-002）；`requires_approval = true` 時只建立 `pending_approval` 的改期申請（FR-003）。錯誤碼：`409 RESCHEDULE_NOT_ALLOWED`（狀態或原時段不符）、`400 RESCHEDULE_TARGET_INVALID`（新時段不符）、`409 RESCHEDULE_SLOT_CONFLICT`（新時段已被占用或 `P2002`）、`409 RESCHEDULE_ALREADY_PENDING`（`uq_reschedule_requests_pending_per_reservation` 違反，FR-004）。
  - **成員撤回（`POST /api/reschedule-requests/:rescheduleRequestId/withdraw`）**：只接受本人 `pending_approval` 的申請，更新為 `withdrawn` 並寫入 `withdrawn_at`；其他狀態回 `409 INVALID_RESCHEDULE_STATUS`（FR-010）。
  - **管理員待審清單（`GET /api/admin/reschedule-requests?status=pending_approval`）**：回傳申請成員、設備、原日期時段、新日期時段與申請時間，依新日期、時段順序與申請時間排序（FR-005）。
  - **管理員核准（`POST /api/admin/reschedule-requests/:rescheduleRequestId/approve`）**：交易內依 FR-006 檢查申請仍為 `pending_approval`、原預約仍為 `confirmed`、原時段與新時段都尚未開始；通過時更新預約日期與時段、申請改為 `approved` 並寫入 `reviewed_by`、`reviewed_at`。新時段已被占用時回 `409 RESCHEDULE_SLOT_CONFLICT`，交易回滾，申請維持 `pending_approval`。
  - **管理員駁回（`POST /api/admin/reschedule-requests/:rescheduleRequestId/reject`）**：zod 驗證選填的 `rejectReason`（最多 200 字），申請改為 `rejected`（FR-007）。
  - 核准與駁回端點掛在既有 `requireAuth` 與 `requireAdmin` 中介層之後，一般成員呼叫回 `403 FORBIDDEN`（FR-005）。
  - **擴充既有端點**：`POST /api/reservations/:reservationId/cancel` 與 `POST /api/admin/reservations/:reservationId/pickup` 在同一交易內，把該預約 `pending_approval` 的改期申請更新為 `expired`，`expire_reason` 分別為 `reservation_cancelled` 與 `reservation_checked_out`（FR-013、FR-016）。
- **Rationale**:
  - 符合使用者技術限制「沿用 005 techstack，只研究本次新增的技術主題」：HTTP 框架、驗證套件與交易寫法都沿用，只新增端點。
  - 單一交易讓「更新預約時段」與「寫入改期申請」同時成功或同時回滾，所以任何失敗都不會改到原預約，滿足 FR-002、FR-006 與 SC-001、SC-002（原預約變動率 0%）。
  - 新預約、即時改期、核准改期與核准待審預約都寫到同一條 `uq_reservations_active_slot`，同時送達時資料庫只讓一筆成功，其他筆收到 `P2002`，滿足 FR-014 與 SC-003（恰好 1 筆成功、重複占用 0%）。
  - NFR-002 與 SC-005 要求操作 `< 2 秒`：每個操作是一次交易內 3～5 個索引查詢與 1～2 次寫入，與 005 research §2 估計的 P95 `< 25ms` 屬同一級距，預估 `< 50ms`。
  - 管理員專屬端點沿用 `requireAdmin`，滿足 FR-005、SC-006 與憲法 `.agents/constitution/skills/api-plan/openapi.md` 的權限錯誤規則。
- **Alternatives considered**:
  - **交易內以 `SELECT ... FOR UPDATE` 鎖定新時段再寫入**：新時段可能還沒有任何資料列可以鎖；改用部分唯一索引不需額外鎖，且與 005 的衝突處理一致。
  - **把改期併入既有 `PATCH /api/reservations/:reservationId`**：改期需要建立獨立的改期申請資源並有自己的撤回、核准、駁回動作，併入同一端點會讓一個端點同時處理多種狀態轉移，與 FR-003～FR-010 的資源劃分不一致。
  - **XState**：改期申請的狀態轉移只有 `pending_approval` 到 4 種結束狀態，服務層明確檢查與錯誤碼即可，和 005 不引入狀態機套件的決定一致。

---

## 3. 時段開始時的改期申請自動失效 (查詢前惰性失效，不引入排程器)

- **Decision**: 以服務層函式 `expireDueRescheduleRequests(tx, now)` 實作 FR-011 與 FR-012 的自動失效，不引入排程器或背景工作佇列：
  - 函式以一條 `UPDATE reschedule_requests ... WHERE status = 'pending_approval' AND deleted_at IS NULL AND (原時段開始時間 <= now OR 新時段開始時間 <= now)` 把到期申請改為 `expired`；`expire_reason` 依先到的時段寫入 `original_slot_started` 或 `new_slot_started`，`expired_at` 寫入該時段的開始時間（`Asia/Taipei`），不是寫入被查詢到的時間。
  - 下列操作在交易開頭都先呼叫此函式：送出改期、撤回、管理員待審清單、管理員核准、管理員駁回、成員「我的預約」查詢、「設備預約」時段查詢、管理員登記領取。
  - 核准端點另外直接檢查原時段與新時段都尚未開始（FR-006），所以即使沒有先跑失效函式，也不會核准到期申請。
  - 時段開始時間沿用既有 `apps/equipment-loan/backend/src/utils/taipeiTime.ts` 的 `Intl.DateTimeFormat`（`Asia/Taipei`）換算。
- **Rationale**:
  - SC-004 要求原時段或新時段開始時仍在審核的申請 100% 變成「改期已失效」，且管理員核准成功率 0%。改期申請的狀態只在上列操作中被讀取或寫入，每次讀寫前先失效，所以使用者與管理員看到的狀態一定正確；核准端點的時間檢查是第二道保護。
  - `expired_at` 寫入時段開始時間，讓 FR-009 顯示的失效時間不受「什麼時候有人打開頁面」影響。
  - 符合使用者技術限制「只研究本次新增的技術主題」：不必新增排程套件、背景程序或部署設定，`docker-compose.yml` 不變。
  - 失效函式只掃 `pending_approval` 列並使用 `idx_reschedule_requests_status_to_slot`，在每台設備每日 3 個時段、7 天範圍的資料量下預估 `< 5ms`，不影響 NFR-002 的 `< 2 秒`。
- **Alternatives considered**:
  - **`node-cron` 每分鐘執行失效工作**：要新增套件與常駐排程，最長有 1 分鐘的延遲窗；延遲窗內管理員仍可能看到應失效的申請，需要再加核准前檢查，等於兩套機制。
  - **Node.js `setInterval` 在 API 程序內定時執行**：多個後端程序或重啟時會重複或漏跑，而且測試時難以控制時間。
  - **PostgreSQL `pg_cron` 擴充**：官方 `postgres:18` 映像檔沒有內建，要改用自訂映像檔並調整 `docker-compose.yml`，違反「原始碼位置不變、只研究新增主題」的精簡方向。
  - **BullMQ 延遲工作**：需要 Redis，005 已決定不引入 Redis。

---

## 4. 申請改期對話框、改期紀錄、「本人改期審核中」時段標示與管理員改期審核介面 (React 19 + Vite 8)

- **Decision**: 沿用 **React 19**、**Vite 8**、**`@vitejs/plugin-react` 6**、**TypeScript 6.0**、**ESLint 10**、**`typescript-eslint` 8** 與 **Prettier**，在 `apps/equipment-loan/frontend/` 擴充畫面，不引入前端路由、全域狀態管理、國際化或日期選擇器套件：
  - **成員「我的預約」**：只對 `confirmed` 且原時段尚未開始、沒有改期審核中申請的預約顯示「申請改期」按鈕（FR-001、FR-004）；點擊後開啟對話框，重用既有「設備預約」的 7 天 × 3 時段格子選擇新時段。每筆預約下方列出改期紀錄（狀態、原／新日期時段、申請時間、審核時間、駁回原因），有改期審核中申請的預約顯示「改期審核中」標籤與「撤回」按鈕（FR-009、FR-010）。
  - **成員「設備預約」時段視圖**：既有時段狀態（`AVAILABLE`、`MY_PENDING`、`MY_CONFIRMED`、`MY_CHECKED_OUT`、`MY_RETURNED`、`OCCUPIED`）新增 `MY_RESCHEDULE_PENDING`（「本人改期審核中」），只對申請人本人回傳；其他成員看到的仍是 `AVAILABLE`（FR-017）。
  - **管理員「審核與借用管理」**：待審區塊新增「改期申請」分頁，列出原日期時段與新日期時段，提供「核准」與「駁回」（駁回時可填 200 字內原因）（FR-005～FR-007）。
  - 改期申請的 5 種狀態標籤（改期審核中、改期成功、改期被駁回、改期已撤回、改期已失效）與新錯誤碼的繁體中文說明，集中加入既有 `apps/equipment-loan/frontend/src/text/zh-TW.ts`（NFR-001）。
- **Rationale**:
  - 滿足 FR-001、FR-009、FR-010、FR-017 與 NFR-001；按鈕顯示條件與後端檢查條件相同，前後端對「可改期、可撤回」的定義一致。
  - Clarifications 決定新時段對本人標示「本人改期審核中」、對其他成員仍顯示「可預約」；在既有時段狀態列舉加一個只對本人回傳的值即可做到，不揭露他人申請。
  - 重用既有 7 天 × 3 時段格子，固定時段只有 21 格，不需要日期選擇器套件；每次操作後重新拉取清單，延續 005 的作法，滿足 NFR-002 的 `< 2 秒`。
- **Alternatives considered**:
  - **react-day-picker 等日期選擇器套件**：可選日期只有當日起 7 天、每天 3 個固定時段，既有格子已涵蓋，新增套件只增加相依。
  - **在時段格子對其他成員顯示「有人改期審核中」**：會揭露他人申請，違反 Clarifications 第 3 題（FR-017）「對其他成員仍顯示可預約且不揭露該申請」。
  - **React Router、Zustand、react-i18next**：沿用 005 的決定，頁籤切換、重新拉取資料與 `zh-TW.ts` 已足夠。

---

## 5. 改期與自動失效測試、前三版回歸與改期 Demo Seed (Vitest 5 + Supertest 7 + Playwright 1.65)

- **Decision**: 沿用 **Vitest 5**、**Supertest 7** 與 **Playwright（`@playwright/test` 1.65）**：
  - **後端整合測試（Vitest 5 + Supertest 7，真實 PostgreSQL 18 測試資料庫）**：涵蓋 FR-001～FR-017 的成功與拒絕路徑；以 `Promise.all` 同時送出即時改期與新預約，驗證恰好 1 筆成功（FR-014、SC-003）；以 Vitest 的 `vi.setSystemTime` 把系統時間設到原時段或新時段開始時間，驗證申請變成 `expired`、核准回 `409`（FR-011、FR-012、SC-004）；並重跑 003～005 全套整合測試（SC-006）。
  - **展示資料重設（`backend/prisma/seed.ts`）**：擴充 `npm run db:seed`，依執行當下的 `Asia/Taipei` 日期動態建立：免審核設備上可即時改期的 `confirmed` 預約、可核准的 `pending_approval` 改期申請、新時段已被他人占用的 `pending_approval` 改期申請，以及 `approved`、`rejected`、`withdrawn`、`expired` 改期申請範例，並保留 005 的 6 態範例（FR-015）。
  - **端對端測試（Playwright 1.65）**：在 `apps/equipment-loan/e2e/` 新增成員與管理員雙視窗流程：免審核即時改期、需審核改期送出後時段頁面顯示「本人改期審核中」、管理員核准與核准衝突、成員撤回，以及前三版核心流程回歸。
- **Rationale**:
  - 滿足 SC-001～SC-006 的可量測門檻；SC-004 依賴時間到達，`vi.setSystemTime` 讓測試不必等到真實時段開始。
  - FR-015 要求 demo seed 包含可核准與核准會被拒絕的改期申請；以執行當下日期動態計算，管理員開機即可驗證，延續 005 的作法。
  - 符合使用者技術限制「沿用 005 techstack」：測試工具全部沿用。
- **Alternatives considered**:
  - **以固定日期建立 demo seed**：日期過了之後，改期申請會因時段已開始而全部失效，無法展示 FR-006 的核准成功路徑。
  - **只用單元測試模擬交易**：無法驗證 `uq_reservations_active_slot` 與 `uq_reschedule_requests_pending_per_reservation` 在並發寫入時的真實資料庫行為（FR-004、FR-014）。
