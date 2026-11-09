# 技術研究與決策紀錄 (Research): 設備現場領取與歸還登記及借用狀態檢視 (Equipment Pickup, Return Registration and Loan Status Tracking)

**Feature Branch**: `005-equipment-pickup-return`  
**Date**: 2026-11-09  
**Spec**: [spec.md](./spec.md)

## 1. 借用 6 態狀態擴充、領取／歸還稽核欄位、雙重部分唯一索引升級與無損資料遷移 (PostgreSQL 18 + Prisma ORM 7.10 + Docker Compose)

- **Decision**: 沿用 **PostgreSQL 18**（以 **Docker Compose** 啟動容器）與 **Prisma ORM 7.10**（搭配 **`@prisma/adapter-pg`** 與 **`pg`**，開啟 `previewFeatures = ["partialIndexes"]`），透過增量 Prisma Migration 無損擴充 `reservations` 資料表與部分唯一索引：
  - `reservation_status` Enum 由 4 個值擴充為 6 個值：`pending_approval`（待審核）、`confirmed`（已核准／有效）、`checked_out`（借用中）、`returned`（已歸還）、`rejected`（已駁回）、`cancelled`（已取消）。
  - `reservations` 資料表新增 4 個領取與歸還稽核欄位：`checked_out_at`（`Timestamptz(6)`，可為空）、`checked_out_by`（`Uuid`，可為空，外鍵指向 `users.id`）、`returned_at`（`Timestamptz(6)`，可為空）、`returned_by`（`Uuid`，可為空，外鍵指向 `users.id`）。
  - 升級兩條 PostgreSQL 部分唯一索引以涵蓋領取與歸還後的時段占用保護：
    1. `uq_reservations_active_slot`：`UNIQUE (equipment_id, reservation_date, slot_id) WHERE status IN ('confirmed', 'checked_out', 'returned') AND deleted_at IS NULL`，確保預約從 `confirmed` 轉為 `checked_out` 再轉為 `returned` 的全過程中，該設備時段持續受唯一索引保護，不會因狀態離開 `confirmed` 或提早歸還而被其他待審申請核准或他人重複預約（FR-004、FR-007）。
    2. `uq_reservations_user_active_request`：`UNIQUE (user_id, equipment_id, reservation_date, slot_id) WHERE status IN ('pending_approval', 'confirmed', 'checked_out') AND deleted_at IS NULL`，確保同一成員在未結束狀態下對同一設備時段最多僅能持有一筆紀錄。
- **Rationale**:
  - 符合使用者技術限制「沿用 `specs/004-equipment-approval-review/techstack.md`，只研究本次新增的技術主題。原始碼位置不變」。
  - 滿足 FR-001、FR-004、FR-007 與 SC-001、SC-002：若維持上一版 `uq_reservations_active_slot` 只過濾 `status = 'confirmed'`，一旦管理員將預約更新為 `checked_out` 或 `returned`，同一時段就會失去資料庫唯一約束保護；將 `'checked_out'` 與 `'returned'` 一併納入部分唯一索引過濾條件，可在 `< 15ms` 內於資料庫層級 100% 阻絕已領取或已履約時段被重複核准或重複預約。
  - 滿足 FR-009 與 SC-005（既有資料 100% 無損遷移）：`ALTER TYPE reservation_status ADD VALUE` 與新增可為空的 `checked_out_at`、`checked_out_by`、`returned_at`、`returned_by` 欄位不會破壞或重設前兩版既有的 `pending_approval`、`confirmed`、`rejected`、`cancelled` 資料列。
  - 滿足憲法 `.agents/constitution/skills/data-plan/data-model.md` Rule 1–4（保留 4 個生命週期欄位、軟刪除、`timestamptz`／`date` 型別、部分唯一索引過濾條件與 `returned`／`rejected`／`cancelled` 歷史保留）。
- **Alternatives considered**:
  - **新增獨立的 `loans` 資料表拆開儲存借用與歸還紀錄**：成員在「我的預約」（FR-006）與管理員在「預約與借用管理清單」（FR-005）皆需在同一個分頁清單中依 6 種狀態篩選並檢視審核、領取與歸還時間，拆成兩張表會導致跨表查詢與時段唯一索引無法直接在單一資料表強制約束。
  - **維持 `uq_reservations_active_slot` 僅鎖定 `status = 'confirmed'`**：當預約轉為 `checked_out` 或提早歸還轉為 `returned` 後，若同一時段尚有其他 `pending_approval` 申請，管理員核准時將繞過唯一索引造成同一時段重複出借，違反 FR-004 與 FR-007。
  - **Redis**：單機與區域網路規模下，PostgreSQL 交易與部分唯一索引即可在 `< 15ms` 完成狀態轉移與衝突保護，無須引入外部快取鎖服務。

---

## 2. 現場領取當日時段時間窗檢核、單向狀態轉移與領取後禁取消防護 (Express 5 + zod 4)

- **Decision**: 沿用 **Express 5** 與 **zod 4** 於 `apps/equipment-loan/backend/` 擴充領取、歸還與狀態篩選 API，搭配 Node.js 內建 `Intl.DateTimeFormat`（`Asia/Taipei`）執行當日時段時間窗判定，不引入第三方狀態機套件、即時推播套件或第三方日期時間套件：
  - **管理員登記領取（`POST /api/admin/reservations/:reservationId/pickup`）**：在資料庫交易內讀取該筆預約與關聯的固定時段（`time_slots.end_time`），依序驗證：(1) 目前狀態必須為 `confirmed`，若為 `pending_approval`、`checked_out`、`returned`、`rejected` 或 `cancelled` 則回傳 `409 INVALID_RESERVATION_STATUS`（FR-001）；(2) 以 `Asia/Taipei` 業務時區比對當前日期與時間，若 `reservation_date` 大於當日日期（未來日期提前領取）則回傳 `400 PICKUP_DATE_NOT_TODAY`，若 `reservation_date` 小於當日日期或當日當前時間已達到／超過該固定時段 `end_time`（過期未領）則回傳 `400 PICKUP_WINDOW_EXPIRED`（FR-002）；驗證通過後更新為 `status = 'checked_out'`、`checked_out_at = now()`、`checked_out_by = adminUserId` 與 `updated_by = adminUserId`。
  - **管理員登記歸還（`POST /api/admin/reservations/:reservationId/return`）**：在資料庫交易內驗證該筆紀錄目前狀態必須為 `checked_out`，若為 `confirmed`（尚未領取）、`pending_approval`、`returned`（重複歸還）、`rejected` 或 `cancelled` 則回傳 `409 INVALID_RESERVATION_STATUS`；驗證通過時，不論當前時間在固定時段結束前或已超過結束時間（逾時歸還），一律更新為 `status = 'returned'`、`returned_at = now()`、`returned_by = adminUserId` 與 `updated_by = adminUserId`（FR-004）。
  - **成員取消申請防護（`POST /api/reservations/:reservationId/cancel`）**：在既有取消邏輯前先檢查狀態；若狀態已進入 `checked_out` 或 `returned`，即使當日該固定時段尚未結束，仍立即攔截並回傳 `409 RESERVATION_ALREADY_CHECKED_OUT`（FR-008）。
  - **成員與管理員分頁查詢擴充（`GET /api/reservations/my`、`GET /api/admin/reservations`）**：以 **zod 4** 驗證 `status` query 參數擴充支援 6 種狀態（`pending_approval`、`confirmed`、`checked_out`、`returned`、`rejected`、`cancelled`），並在回傳項目中包含 `checkedOutAt`、`checkedOutByUserId`、`checkedOutByName`、`returnedAt`、`returnedByUserId`、`returnedByName`（FR-005、FR-006）。
- **Rationale**:
  - 滿足 FR-001、FR-002 與 SC-001（當日未結束 `confirmed` 預約領取成功率 100%，非 `confirmed`、未來日期或過期未領攔截率 100%）。
  - 滿足 FR-004 與 SC-002（`checked_out` 紀錄於時段內與逾時後歸還成功率 100%，非 `checked_out` 狀態攔截率 100%）。
  - 滿足 FR-008 與 SC-003（進入 `checked_out` 或 `returned` 後成員取消請求 100% 被攔截拒絕）。
  - 滿足 NFR-002 與 SC-004（領取、歸還與狀態查詢操作回應時間 `< 2 秒`）：單鍵狀態更新與索引查詢在區域網路環境 P95 延遲 `< 25ms`。
- **Alternatives considered**:
  - **XState**：`confirmed -> checked_out -> returned` 為無分支的嚴格單向轉移，服務層明確狀態檢查與錯誤碼分支更易讀且無額外套件依賴。
  - **Socket.IO**：現場領取與歸還皆由管理員當面操作後同步回傳結果，無須引入 WebSocket 長連線推播。
  - **Luxon、Moment.js**：使用 Node.js 內建 `Intl.DateTimeFormat` 搭配 `timeZone: 'Asia/Taipei'` 即可精確取得台灣當日 `YYYY-MM-DD` 與 `HH:mm` 時段比較，不需額外安裝日期時間函式庫。

---

## 3. 成員「目前借用中設備」醒目區塊、時段 6 態標示與管理員領取／歸還操作介面 (React 19 + Vite 8)

- **Decision**: 沿用 **React 19**、**Vite 8** 與 **`@vitejs/plugin-react` 6** 於 `apps/equipment-loan/frontend/` 擴充成員端與管理員端借用狀態互動畫面，不引入前端路由套件、全域狀態管理套件或國際化套件：
  - **成員「我的預約」視圖**：
    1. 於頁面頂部新增「目前借用中設備」醒目區塊，獨立列出當前成員所有 `status === 'checked_out'` 的借用紀錄（顯示預約編號、設備編號、設備名稱、預約日期、固定時段與領取時間；若目前無借用中設備則顯示繁體中文空白狀態提示，FR-006）。
    2. 下方預約與借用歷史清單的狀態篩選擴充為全部紀錄及 6 種狀態（「待審核」、「已核准／有效」、「借用中」、「已歸還」、「已駁回」、「已取消」），對「借用中」與「已歸還」紀錄顯示領取時間與歸還時間，並對 `checked_out` 與 `returned` 紀錄隱藏「取消預約」按鈕（FR-006、FR-008）。
  - **成員「設備預約」時段視圖**：將固定時段對當前登入成員的可用性狀態擴充為：`AVAILABLE`（「可預約」）、`MY_PENDING`（「本人待審核」）、`MY_CONFIRMED`（「本人已預約」）、`MY_CHECKED_OUT`（「本人借用中」）、`MY_RETURNED`（「本人已歸還」）、`OCCUPIED`（「已被預約」，涵蓋他人已核准、他人借用中或他人當日已歸還，且不揭露他人身分）（FR-007）。
  - **管理員「審核與借用管理」視圖**：在全體預約與借用紀錄區塊提供 6 種狀態篩選（含快速篩選「已核准／有效（待領取）」與「借用中」），表格增列領取時間／經手管理員與歸還時間／經手管理員資訊；操作欄嚴格對齊後端條件——僅對狀態為 `confirmed` 且預約日期為當日、尚未超過該時段結束時間的紀錄顯示「登記領取」按鈕，僅對狀態為 `checked_out` 的紀錄顯示「登記歸還」按鈕，支援單鍵確認完成登記（FR-005）。
  - 所有新增的借用狀態標籤、按鈕文案與錯誤碼對應繁體中文說明集中維護於 `apps/equipment-loan/frontend/src/text/zh-TW.ts`（NFR-001）。
- **Rationale**:
  - 滿足 FR-005、FR-006、FR-007、FR-008 與 NFR-001（全臺灣繁體中文呈現，且前後端對「可領取、可歸還、可取消」狀態的定義 100% 對齊）。
  - 滿足 NFR-002 與 SC-004（操作回應時間 `< 2 秒`）。
- **Alternatives considered**:
  - **React Router**：維持既有頂部導覽頁籤（「設備預約」、「我的預約」、「審核與借用管理」）切換架構，操作流程最連貫。
  - **Zustand、Redux Toolkit**：每次領取、歸還或取消完成後直接重新拉取最新分頁清單與時段狀態即可確保畫面與資料庫一致，無須引入全域狀態庫。
  - **react-i18next**：單一臺灣繁體中文語系（NFR-001）由 `zh-TW.ts` 集中管理最簡潔。

---

## 4. 前後端型別對齊、管理員領取／歸還權限攔截與執行環境沿用 (TypeScript 6.0 + Node.js 24 LTS 以上 + ESLint 10)

- **Decision**: 前後端沿用 **TypeScript 6.0**、**Node.js 24 LTS 以上**、**`tsx`**、**ESLint 10**、**`typescript-eslint` 8** 與 **Prettier**；管理員專屬的 `POST /api/admin/reservations/:reservationId/pickup` 與 `POST /api/admin/reservations/:reservationId/return` 端點統一掛載於 `requireAuth`（未登入回 `401 UNAUTHORIZED`）與 `requireAdmin`（一般成員呼叫回 `403 FORBIDDEN`）中介層之後；登入與工作階段維持 Node.js 內建 `crypto.scrypt` 密碼驗證、7 位數區分大小寫英數驗證碼與 PostgreSQL `sessions` 資料表，不引入第三方密碼雜湊、Cookie Session 或 JWT 套件。
- **Rationale**:
  - 滿足 FR-003、SC-005（一般成員嘗試呼叫管理員專屬的登記領取或登記歸還功能時 100% 攔截拒絕並回傳 `403 FORBIDDEN`）與憲法 `.agents/constitution/skills/api-plan/openapi.md` Rule 6。
  - 滿足 FR-009（完整保留前兩版驗證碼登入與工作階段機制）。
- **Alternatives considered**:
  - **`bcrypt`**：維持 Node.js 內建 `crypto.scrypt`，零原生編譯依賴。
  - **`express-session`**：維持 `sessionStorage` Bearer token 以支援同一瀏覽器開啟雙視窗分別登入成員與管理員進行現場領取／歸還對照驗證。
  - **`jsonwebtoken`**：維持資料庫 `sessions` 表管理工作階段，支援即時撤銷。

---

## 5. 領取時間窗與逾時歸還測試、前兩版回歸驗證與 Demo Seed 6 態展示資料擴充 (Vitest 5 + Supertest 7 + Playwright 1.65)

- **Decision**: 沿用 **Vitest 5**、**Supertest 7** 與 **Playwright（`@playwright/test` 1.65）** 擴充自動化測試與 6 態展示資料：
  - **後端整合測試（Vitest 5 + Supertest 7）**：針對真實 PostgreSQL 18 測試資料庫新增：(1) 管理員對當日未結束時段之 `confirmed` 預約成功執行登記領取，驗證轉為 `checked_out` 並寫入 `checkedOutAt` 與 `checkedOutByUserId`（SC-001）；(2) 管理員對 `pending_approval`、`checked_out`、`returned`、`rejected`、`cancelled` 狀態，或對明日未來預約、過去已結束時段預約嘗試登記領取時 100% 被攔截拒絕（FR-001、FR-002、SC-001）；(3) 管理員對時段內及已超過時段結束時間（逾時未還）的 `checked_out` 紀錄執行登記歸還皆 100% 成功轉為 `returned`，對非 `checked_out` 狀態嘗試登記歸還 100% 被攔截（FR-004、SC-002）；(4) 成員對 `checked_out` 或 `returned` 紀錄嘗試取消時 100% 回 `409 RESERVATION_ALREADY_CHECKED_OUT`（FR-008、SC-003）；(5) 一般成員呼叫領取或歸還 API 100% 回 `403 FORBIDDEN`（FR-003、SC-005）；並重跑前兩版全套整合測試確保 100% 回歸通過。
  - **展示資料重設（Demo Seed，`backend/prisma/seed.ts`）**：擴充 `npm run db:seed`，依據執行當下的 `Asia/Taipei` 日期動態建立涵蓋全部 6 種狀態的展示紀錄：(1) **當日可立即登記領取的 `confirmed` 預約**（配置於當日晚間 `18:00–21:00` 未結束時段，供管理員開機即可驗證登記領取）；(2) **目前處於 `checked_out`（借用中）的紀錄**（含林雅婷當日借用中設備與一筆前一日逾時未還的借用中設備，供成員在頁頂「目前借用中設備」區塊檢視及管理員直接驗證一般歸還與逾時歸還）；(3) **已完成歸還的 `returned` 紀錄**（含領取與歸還時間及經手管理員）；(4) 保留前兩版的 `pending_approval`（含同設備同時段雙人待審供驗證核准衝突）、明日 `confirmed`（供驗證成員取消）、`rejected` 與 `cancelled` 紀錄（FR-009）。
  - **端對端測試（Playwright 1.65）**：於 `apps/equipment-loan/e2e/` 擴充雙角色瀏覽器自動化測試，覆蓋管理員登記領取、成員在「我的預約」頁頂查看目前借用中設備與時段頁面「本人借用中」標示、領取後不可取消、管理員登記歸還，以及前兩版核心流程回歸。
- **Rationale**:
  - 滿足 SC-001、SC-002、SC-003、SC-004、SC-005 的可量測驗收門檻與 FR-009 的無損遷移及 6 態展示資料重設要求。
- **Alternatives considered**:
  - **以固定死寫的歷史日期建立 Demo Seed**：若將待領取預約固定寫在過去日期，管理員執行驗證時會因超過當日時段結束時間而無法測試成功領取（違反 FR-002 與 FR-009），因此必須以執行當下的台灣日期動態計算當日與明日展示資料。
  - **僅以單元測試模擬狀態轉換而不跑真實 PostgreSQL 整合測試**：無法驗證 `uq_reservations_active_slot` 在納入 `'checked_out'` 與 `'returned'` 後的真實資料庫部分唯一索引約束行為。
