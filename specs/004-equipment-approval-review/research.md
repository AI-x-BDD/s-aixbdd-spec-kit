# 技術研究與決策紀錄 (Research): 設備人工審核設定與預約申請審核 (Equipment Approval Settings and Reservation Review)

**Feature Branch**: `004-equipment-approval-review`  
**Date**: 2026-11-09  
**Spec**: [spec.md](./spec.md)

## 1. 雙重部分唯一索引、人工審核狀態擴充與無損資料遷移 (PostgreSQL 18 + Prisma ORM 7.10 + Docker Compose)

- **Decision**: 沿用 **PostgreSQL 18**（以 **Docker Compose** 啟動容器）與 **Prisma ORM 7.10**（搭配 **`@prisma/adapter-pg`** 與 **`pg`**，開啟 `previewFeatures = ["partialIndexes"]`），以增量 Prisma Migration 擴充資料庫結構並執行無損遷移：
  - `equipments` 資料表新增 `requires_approval Boolean @default(false)` 欄位，表示該設備是否需要管理員人工審核。
  - `reservation_status` Enum 擴充為 4 個值：`pending_approval`（待審核）、`confirmed`（已核准／有效）、`rejected`（已駁回）、`cancelled`（已取消）；既有第一版有效預約維持 `confirmed` 不變。
  - `reservations` 資料表新增 `reviewed_by`（`Uuid`，可為空，外鍵指向 `users.id`）、`reviewed_at`（`Timestamptz(6)`，可為空）與 `reject_reason`（`VarChar(200)`，可為空），並新增待審佇列查詢索引 `idx_reservations_status_date_slot (status, reservation_date, slot_id, created_at)`。
  - 以兩條 PostgreSQL 部分唯一索引同時強制「待審不占位、核准唯一占位」與「同成員同設備時段防重複申請」：
    1. 保留 `uq_reservations_active_slot`：`UNIQUE (equipment_id, reservation_date, slot_id) WHERE status = 'confirmed' AND deleted_at IS NULL`，確保 `pending_approval` 不鎖定時段，且同一設備、日期與時段最多只有 1 筆 `confirmed` 預約。
    2. 新增 `uq_reservations_user_active_request`：`UNIQUE (user_id, equipment_id, reservation_date, slot_id) WHERE status IN ('pending_approval', 'confirmed') AND deleted_at IS NULL`，禁止同一成員對同一設備、日期與時段重複持有未結束的待審或已核准申請，同時允許在 `rejected` 或 `cancelled` 後重新申請並完整保留舊紀錄。
- **Rationale**:
  - 符合使用者技術限制「沿用 `specs/003-equipment-loan-booking/techstack.md`，只研究本次新增的技術主題。原始碼位置不變」。
  - 滿足 FR-002 與 SC-001（需人工審核設備送出後 100% 進入 `pending_approval` 且不鎖定時段）：`uq_reservations_active_slot` 的過濾條件僅限 `status = 'confirmed' AND deleted_at IS NULL`，多位不同成員可對同一設備時段同時寫入 `pending_approval` 紀錄。
  - 滿足 FR-003（禁止同一成員對同一設備、同一日期與同一固定時段重複送出多筆 `pending_approval` 或 `confirmed` 申請，但 `rejected` 或 `cancelled` 後可重送並保留舊紀錄）：由 `uq_reservations_user_active_request` 在資料庫引擎層攔截同一成員的並發重複送單。
  - 滿足 FR-010、FR-011 與 SC-003（既有有效預約 100% 無損遷移為 `confirmed`，切換設備設定不覆寫既有預約狀態）：新增欄位皆具安全預設值（`requires_approval = false`）或允許 `NULL`（`reviewed_by`、`reviewed_at`、`reject_reason`），既有 `confirmed` 資料列無須搬表或重設。
  - 滿足憲法 `.agents/constitution/skills/data-plan/data-model.md` Rule 1–4（保留 4 個生命週期欄位、軟刪除、`timestamptz`／`date` 型別、部分唯一索引過濾條件與 `rejected`／`cancelled` 終態歷程保留）。
- **Alternatives considered**:
  - **將 `pending_approval` 一併納入 `uq_reservations_active_slot` 唯一索引**：會導致第一筆待審申請直接鎖死時段，其他成員無法對同一時段提出待審申請，違反 FR-002 與 SC-001「待審不占位」的決策。
  - **將待審申請與有效預約拆成兩張資料表（`approval_requests` 與 `reservations`）**：成員在「我的預約」（FR-004）與管理員在「全體預約紀錄」（FR-005）都需合併查詢四種狀態並統一編號與排序，拆表會造成跨表 `UNION` 與狀態搬移複雜化。
  - **Redis**：引入外部記憶體鎖定待審與核准衝突需額外維運容器且有鎖過期風險，PostgreSQL 原生雙重部分唯一索引即可在 `< 15ms` 內保證 0% 重複占用（SC-002）。

---

## 2. 管理員核准時段衝突重檢、狀態機轉移防護與審核 API 驗證 (Express 5 + zod 4)

- **Decision**: 沿用 **Express 5** 與 **zod 4** 於 `apps/equipment-loan/backend/` 擴充審核與設備設定 API，不引入第三方狀態機套件、即時推播套件或第三方日期時間套件：
  - **成員建立預約（`POST /api/reservations`）**：在交易內讀取目標設備的 `requires_approval`；若為 `false` 則直接以 `status = 'confirmed'` 寫入並由 `uq_reservations_active_slot` 保證唯一占位；若為 `true` 則先檢查該時段是否已有 `confirmed` 預約，若無則以 `status = 'pending_approval'` 寫入，並由 `uq_reservations_user_active_request` 攔截同一成員重複申請（回傳 `409 DUPLICATE_PENDING_OR_ACTIVE_RESERVATION`）。
  - **成員取消申請（`POST /api/reservations/:reservationId/cancel`）**：允許申請人本人在時段開始前（依 Node.js 內建 `Intl.DateTimeFormat` 之 `Asia/Taipei` 時間判定）對 `pending_approval` 或 `confirmed` 狀態的申請執行取消，更新為 `status = 'cancelled'` 與 `cancelled_at = now()`（FR-004）。
  - **管理員核准申請（`POST /api/admin/reservations/:reservationId/approve`）**：在單一資料庫交易內鎖定該筆申請列，驗證目前狀態必須為 `pending_approval`（否則回 `409 INVALID_RESERVATION_STATUS`）且尚未到達時段開始時間（否則回 `400 RESERVATION_ALREADY_STARTED`），接著將狀態更新為 `confirmed`、寫入 `reviewed_by = adminUserId` 與 `reviewed_at = now()`；若該設備時段已被另一筆 `confirmed` 預約占用，PostgreSQL `uq_reservations_active_slot` 立即拋出 `P2002` 唯一衝突，後端捕捉後回傳 `409 RESERVATION_CONFLICT`，原申請維持 `pending_approval` 不變（FR-006、FR-008）。
  - **管理員駁回申請（`POST /api/admin/reservations/:reservationId/reject`）**：以 **zod 4** 驗證選填的 `rejectReason`（字串修剪後長度上限 200 字，超出回 `400 VALIDATION_ERROR`），確認狀態為 `pending_approval` 且時段尚未開始後，更新為 `status = 'rejected'`、`reviewed_by = adminUserId`、`reviewed_at = now()` 與 `reject_reason`（FR-007、FR-008）。
  - **管理員切換設備審核設定（`PATCH /api/admin/equipments/:equipmentId/approval-mode`）**：僅更新 `equipments.requires_approval` 與 `updated_by`、`updated_at`，不修改 `reservations` 表中的任何既有 `confirmed` 或 `pending_approval` 紀錄（FR-009、FR-010）。
- **Rationale**:
  - 符合使用者技術限制「沿用 `specs/003-equipment-loan-booking/techstack.md`，只研究本次新增的技術主題」。
  - 滿足 FR-006、FR-008 與 SC-002（管理員或並發請求同時核准同一設備時段的多筆待審申請時，最終恰好 1 筆成為 `confirmed`，重複占用率 0%）：交易內更新為 `confirmed` 時直接受 `uq_reservations_active_slot` 部分唯一索引保護，單次核准交易在區域網路環境耗時 `< 20ms`，遠低於 NFR-002 與 SC-004 `< 2 秒` 的要求。
  - 滿足 FR-007（選填駁回原因上限 200 字）與 FR-010、SC-003（切換設備設定 100% 不影響既有 `confirmed` 與 `pending_approval` 紀錄）。
- **Alternatives considered**:
  - **XState**：本次預約狀態轉移僅有 `pending_approval -> confirmed | rejected | cancelled` 與 `confirmed -> cancelled` 四條明確路徑，在服務層以條件判斷加上資料庫唯一索引即可 100% 防護，引入狀態機套件會增加不必要的抽象層。
  - **Socket.IO**：本次迭代的審核、核准與駁回皆為 HTTP 請求／回應操作，無即時推播需求，維持不引入。
  - **Luxon、Moment.js**：時段開始時間截止判定延續使用 Node.js 內建 `Intl.DateTimeFormat`（`Asia/Taipei`），無須安裝第三方日期時間套件。

---

## 3. 成員與管理員審核介面狀態呈現與互動架構 (React 19 + Vite 8)

- **Decision**: 沿用 **React 19**、**Vite 8** 與 **`@vitejs/plugin-react` 6** 於 `apps/equipment-loan/frontend/` 擴充前端畫面與狀態呈現，不引入前端路由套件、全域狀態管理套件或國際化套件：
  - **設備與固定時段預約視圖**：在每張設備卡片標示「需人工審核」或「免審核」徽章，並在固定時段按鈕呈現 4 種對當前登入成員的狀態——`AVAILABLE`（「可預約」）、`MY_PENDING`（「本人待審核」）、`MY_CONFIRMED`（「本人已預約」）、`OCCUPIED`（「已被預約」）；對一般成員不揭露其他成員的待審申請或預約人姓名（FR-001、FR-002）。
  - **成員「我的預約」視圖**：顯示「待審核」、「已核准／有效」、「已駁回」與「已取消」四種狀態標籤、審核時間與駁回原因，並對尚未開始的「待審核」與「已核准／有效」申請提供取消確認操作（FR-004）。
  - **管理員「設備審核設定與待審清單」視圖**：在管理員頁面提供預建設備的「需人工審核／免審核」切換控制項（FR-009）、預設依預約日期由近到遠、固定時段順序及申請建立時間由早到晚排序的「待審核申請清單」（支援單筆核准、單筆開啟選填上限 200 字駁回原因對話框並駁回，FR-005、FR-006、FR-007），以及支援 4 種狀態篩選的全體預約紀錄表格。
  - 所有新增狀態標籤與審核錯誤碼訊息集中定義於 `apps/equipment-loan/frontend/src/text/zh-TW.ts`（NFR-001）。
- **Rationale**:
  - 滿足 FR-001、FR-004、FR-005、FR-009 與 NFR-001（全介面文字、審核狀態標籤、待審清單、駁回原因輸入與錯誤提示皆使用臺灣繁體中文）。
  - 滿足 NFR-002 與 SC-004（切換設備審核設定、送出待審申請、查詢待審清單、執行核准或駁回回應時間 `< 2 秒`）：操作完成後立即以回應資料或並行 `fetch` 更新畫面狀態，前端重渲染時間 `< 50ms`。
- **Alternatives considered**:
  - **React Router**：系統仍以登入後的角色與頂部導覽頁籤切換視圖，不需多層公開 URL 路由。
  - **Zustand、Redux Toolkit**：設備清單、待審清單與全體預約清單皆可在動作完成後直接由 API 重新取得最新權威狀態，不需額外全域狀態同步庫。
  - **react-i18next**：僅需臺灣繁體中文單一語系（NFR-001），維持集中文字常數檔即可。

---

## 4. 前後端型別安全、工作階段權限攔截與執行環境沿用 (TypeScript 6.0 + Node.js 24 LTS 以上 + ESLint 10)

- **Decision**: 前後端沿用 **TypeScript 6.0**、**Node.js 24 LTS 以上**、**`tsx`**、**ESLint 10**、**`typescript-eslint` 8** 與 **Prettier**；後端權限中介層維持 `requireAuth`（未登入回 `401 UNAUTHORIZED`）與 `requireAdmin`（非管理員存取待審清單、核准／駁回或修改設備審核設定時回 `403 FORBIDDEN`）；登入驗證維持 Node.js 內建 `crypto.scrypt` 密碼驗證、7 位數區分大小寫英數驗證碼挑戰與 PostgreSQL `sessions` 資料表（前端 `sessionStorage` Bearer token），不引入第三方密碼雜湊、Cookie Session 或 JWT 套件。
- **Rationale**:
  - 滿足 FR-008、FR-009、SC-005（一般成員嘗試修改設備審核設定、查詢待審清單或執行核准／駁回時 100% 攔截拒絕）與憲法 `.agents/constitution/skills/api-plan/openapi.md` Rule 6（`401` 與 `403` 嚴格分離）。
  - 滿足 FR-011 與 SC-003（100% 向下相容第一版 7 位數區分大小寫英數驗證碼登入與工作階段管理）。
- **Alternatives considered**:
  - **`bcrypt`**：Node.js 內建 `crypto.scrypt` 已滿足密碼雜湊需求，無須新增原生編譯套件。
  - **`express-session`**：同瀏覽器分頁共用 Cookie 不利於多視窗同時操作不同成員與管理員驗證審核流程。
  - **`jsonwebtoken`**：PostgreSQL `sessions` 表可直接支援即時登出失效，無須額外維護 JWT 黑名單。

---

## 5. 並發核准衝突測試、跨迭代回歸驗證與展示資料擴充策略 (Vitest 5 + Supertest 7 + Playwright 1.65)

- **Decision**: 沿用 **Vitest 5**、**Supertest 7** 與 **Playwright（`@playwright/test` 1.65）** 擴充自動化測試與展示資料：
  - **後端整合測試（Vitest 5 + Supertest 7）**：針對真實 PostgreSQL 18 測試資料庫新增：(1) 需人工審核設備送出申請進入 `pending_approval` 且另一成員可同時申請同一時段（SC-001）；(2) 同一成員對同設備同時段重複申請遭 `409` 攔截，駁回或取消後可重新申請（FR-003）；(3) 同一設備時段有多筆 `pending_approval` 時，以 `Promise.all` 並發送出核准請求，驗證最終僅 1 筆成為 `confirmed`、其餘 100% 回 `409 RESERVATION_CONFLICT`（SC-002）；(4) 切換設備 `requires_approval` 前後，既有 `confirmed` 與 `pending_approval` 紀錄 100% 維持原狀態（SC-003）；(5) 一般成員呼叫管理員端點 100% 回 `403 FORBIDDEN`（SC-005）；並完整重跑第一版所有整合測試確認回歸通過。
  - **展示資料重設（Demo Seed，`backend/prisma/seed.ts`）**：擴充 `npm run db:seed`，將預建 4 台設備中的 `EQ-101`（4K 雷射投影機）與 `EQ-102`（全片幅單眼相機組）預設設為 `requires_approval = true`，`EQ-103` 與 `EQ-104` 設為 `requires_approval = false`；並預建涵蓋 `confirmed`、`pending_approval`（含林雅婷與陳冠廷同時針對同一台需審核設備同一時段提出的 2 筆待審申請，供直接展示核准衝突攔截）、`rejected`（含駁回原因）與 `cancelled` 四種狀態的展示紀錄（FR-011）。
  - **端對端測試（Playwright 1.65）**：於 `apps/equipment-loan/e2e/` 擴充瀏覽器自動化測試，覆蓋成員送出待審申請、管理員核准與同時段第二筆待審核准衝突攔截、填寫原因駁回、切換設備人工審核設定，以及第一版既有流程回歸。
- **Rationale**:
  - 滿足 SC-001、SC-002、SC-003、SC-004、SC-005 的可量測驗收門檻與 FR-011 的展示資料重設要求。
- **Alternatives considered**:
  - **以記憶體 Mock 取代真實 PostgreSQL 測試並發核准**：無法驗證 `uq_reservations_active_slot` 與 `uq_reservations_user_active_request` 兩條 PostgreSQL 部分唯一索引在交易並發下的真實約束行為（SC-002）。
  - **不更新 `seed.ts` 而僅在測試中動態建立待審資料**：違反 FR-011「擴充初始展示資料（demo seed）以包含預設開啟需人工審核的設備、免審核設備、待審核申請、已核准／有效預約、已駁回申請與已取消紀錄」的要求。
