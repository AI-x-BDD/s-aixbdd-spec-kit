# 技術研究與決策紀錄 (Research): 設備送修與停用、恢復可用及受影響未來預約的處理 (Equipment Maintenance and Retirement)

**Feature Branch**: `007-equipment-maintenance-retire`  
**Date**: 2026-11-10  
**Spec**: [spec.md](./spec.md)

## 1. 設備狀態 Enum 擴充、預約取消原因、設備狀態變更紀錄與無損資料遷移 (PostgreSQL 18 + Prisma ORM 7.10 + Docker Compose)

- **Decision**: 沿用 **PostgreSQL 18**（以 **Docker Compose** 啟動容器）與 **Prisma ORM 7.10**（搭配 **`@prisma/adapter-pg`** 與 **`pg`**，維持 `previewFeatures = ["partialIndexes"]`），以 `prisma migrate dev --create-only` 產生一支增量 Migration，再手動改寫 SQL 後套用：
  - **設備狀態 Enum `equipment_status`**：以 `ALTER TYPE "equipment_status" RENAME VALUE 'unavailable' TO 'retired'` 把既有值原地改名，再以 `ALTER TYPE "equipment_status" ADD VALUE 'maintenance' BEFORE 'retired'` 新增送修中；Prisma schema 的 Enum 順序寫成 `available`、`maintenance`、`retired`。同一支 Migration 不使用 `maintenance` 這個新值（不改預設值、不寫入資料）。
  - **預約取消原因**：新增 Enum `reservation_cancel_reason`（`member_cancelled`、`equipment_maintenance`、`equipment_retired`），在 `reservations` 新增可為空的 `cancel_reason` 欄位；同一支 Migration 以 `UPDATE reservations SET cancel_reason = 'member_cancelled' WHERE status = 'cancelled'` 補上既有取消紀錄的原因，不改動任何既有欄位的值。
  - **設備狀態變更紀錄**：新增資料表 `equipment_status_changes`：`id`（`Uuid`）、`equipment_id`（外鍵指向 `equipments.id`）、`from_status`、`to_status`（皆為 `equipment_status`）、`changed_by`（外鍵指向 `users.id`）、`changed_at`（`Timestamptz(6)`）、`cancelled_reservation_count`（`Int`），以及憲法規定的生命週期欄位；新增索引 `idx_equipment_status_changes_equipment_changed`（`equipment_id, changed_at`）供設備清單取得每台設備最近一次變更。紀錄只由服務層新增，程式中不提供修改與刪除路徑。
  - 改期申請沿用既有 `reschedule_expire_reason` 的 `reservation_cancelled`，不新增 Enum 值。
- **Rationale**:
  - 符合使用者技術限制「沿用 `specs/006-reservation-reschedule/techstack.md`，只研究本次新增的技術主題。原始碼位置不變」：資料庫、ORM、遷移工具與容器設定全部沿用，`apps/equipment-loan/backend/prisma/` 只新增一支 Migration。沿用的理由是本次只多了 Enum 值、一個欄位與一張只新增的紀錄表，006 選定的 PostgreSQL 18 與 Prisma 7.10 都能直接表達，不需要新技術。
  - 滿足 FR-018「無損遷移既有資料（既有標為不可用的設備轉為停用）」與 US1 驗收情境 13：查證 PostgreSQL 18 官方文件，`RENAME VALUE` 只改值的名稱、不改排序，既有 `unavailable` 的設備列不需重寫就變成 `retired`；`ADD VALUE` 在交易內執行時，新值要等交易提交後才能使用，所以同一支 Migration 不使用 `maintenance`。這比 005 Migration 採用的「改名舊型別、重建型別、以 `USING` 轉型」少了逐列轉型與重建索引兩個步驟。
  - 查證本機 Prisma CLI 7.10.1 的 `migrate dev --create-only` 只建立 Migration 不套用，可以在套用前把自動產生的 SQL 換成上述 `RENAME VALUE` 寫法，避免自動產生的 SQL 對已移除的 `unavailable` 值轉型失敗。
  - `cancel_reason` 以 Enum 區分三種原因，滿足 FR-015「成員自行取消的預約不顯示這兩種原因」與 FR-020；003～006 只有成員本人能取消預約（`POST /api/reservations/:reservationId/cancel`），所以既有取消紀錄補上 `member_cancelled` 是事實，不改變狀態與內容，符合 FR-018。
  - 設備狀態變更紀錄表滿足 FR-008 的六個欄位與 Key Entities「只新增、不修改、不刪除」；`(equipment_id, changed_at)` 索引讓設備清單取最近一筆紀錄只走索引，示範資料規模下預估每台設備 `< 1ms`。
  - 新增欄位與資料表不刪除任何既有資料列，滿足 SC-005 的前四次迭代回歸，以及憲法 `.agents/constitution/skills/data-plan/data-model.md` 的生命週期欄位與歷程保留規則。
- **Alternatives considered**:
  - **沿用 005 的「改名舊型別、重建 Enum、`USING` 轉型」寫法**：要以 `CASE` 把 `unavailable` 對應到 `retired` 並重建 `equipments` 上的兩個索引，步驟較多；`RENAME VALUE` 原地改名就能達成相同結果。
  - **直接套用 `prisma migrate dev` 自動產生的 Migration**：自動產生的 SQL 會把舊值轉成新 Enum，資料庫中仍有 `unavailable` 的設備列時轉型失敗或需要先改資料，違反 FR-018 的無損遷移。
  - **保留 `unavailable` 並另外新增 `maintenance`、`retired` 兩個值**：會留下沒有對應畫面狀態的第四種值，與 Key Entities「狀態改為三種」不一致。
  - **以 `cancel_reason` 為空代表成員取消，不補既有資料**：讀取端每次都要把空值解讀成成員取消，與明確寫出的兩種設備原因混用兩種表示法；補值後三種原因都能直接比對，FR-015 的判斷較單純。
  - **在 `equipments` 加上 `last_status_changed_by`、`last_status_changed_at` 欄位，不建紀錄表**：只能保存最近一次變更，違反 FR-008「為每次設備狀態變更保存一筆紀錄」。
  - **以 PostgreSQL 觸發器阻擋 `equipment_status_changes` 的 `UPDATE` 與 `DELETE`**：demo seed 的 `npm run db:seed` 以 `deleteMany` 重設全部資料，觸發器會讓重設失敗；本次沒有任何修改或刪除紀錄的 API，服務層只新增即可滿足 FR-008。

---

## 2. 設定送修／停用／恢復可用 API、同一交易內批次取消與改期失效、確認視窗預覽與確認時比對 (Express 5 + zod 4 + Prisma 互動式交易)

- **Decision**: 沿用 **Express 5**、**zod 4**、**TypeScript 6.0**、**Node.js 24 LTS 以上**與 **`tsx`**，在 `apps/equipment-loan/backend/` 新增 `equipmentStatusService` 與兩個管理員端點，掛在既有 `requireAuth`、`requireAdmin` 之後；寫入在單一 Prisma 互動式交易（`prisma.$transaction(async (tx) => ...)`，維持 PostgreSQL 預設的 `READ COMMITTED`）內完成：
  - **確認視窗預覽（`GET /api/admin/equipments/:equipmentId/status-change-preview`，查詢參數 `targetStatus` 接受 `maintenance`、`retired`）**：回傳設備目前狀態、將被取消的預約數 `cancelCount`、將失效的改期申請數 `expireCount`，以及是否有借用中的預約。
  - **變更狀態（`PATCH /api/admin/equipments/:equipmentId/status`）**：zod 驗證 `targetStatus`（`available`、`maintenance`、`retired`）；目標為送修中或停用時，另外必填 `expectedCurrentStatus`、`expectedCancelCount`、`expectedExpireCount`（取自預覽結果）。交易內依序：
    1. 以第 3 主題的寫法鎖定設備列，並先呼叫既有 `expireDueRescheduleRequests(tx, now)`。
    2. 設備有 `checked_out` 預約時回 `409 EQUIPMENT_ON_LOAN`（FR-005）；目標狀態等於目前狀態時回 `409 EQUIPMENT_STATUS_UNCHANGED`。
    3. 以預覽相同的條件重新計算目前狀態、`cancelCount` 與 `expireCount`，任一項和請求的 `expected*` 不同時回 `409 EQUIPMENT_STATE_CHANGED`，交易回滾（FR-019）。
    4. 以一條 `tx.$queryRaw` 的 `UPDATE reservations r SET status = 'cancelled', cancel_reason = ..., cancelled_at = now, updated_by = 管理員 FROM time_slots s WHERE r.equipment_id = ... AND r.status IN ('pending_approval', 'confirmed') AND r.deleted_at IS NULL AND 時段結束時間（reservation_date + s.end_time，`Asia/Taipei`）> now RETURNING r.id` 取消受影響預約（FR-002、FR-003）。
    5. 以一條 `updateMany` 把這些預約 `pending_approval` 的改期申請改為 `expired`，`expire_reason = 'reservation_cancelled'`，`expired_at = now`（FR-004）。
    6. 更新 `equipments.status`，新增一筆 `equipment_status_changes`（FR-008）。
  - 送修中與停用之間直接切換時走同一條路徑（FR-010）；恢復可用（`targetStatus = available`）只更新狀態並新增紀錄，不讀取也不修改任何預約與改期申請，保留 `requires_approval`（FR-011～FR-013）。
  - **擴充既有端點**：成員設備清單排除 `retired`；設備 DTO 以 `status` 取代 `isActive` 布林值；`POST /api/reservations` 遇到非可用設備時，沿用錯誤碼 `409 EQUIPMENT_UNAVAILABLE`，訊息依狀態寫「設備送修中，無法預約」或「設備已停用，無法預約」（FR-006）；管理員設備清單回傳最近一次狀態變更的管理員名稱與時間（FR-008）；「我的預約」與全體預約管理的 DTO 加入 `cancelReason`（FR-015、FR-020）。
- **Rationale**:
  - 符合使用者技術限制「沿用 006 techstack，只研究本次新增的技術主題」：HTTP 框架、驗證套件與交易寫法沿用 005、006 已驗證的作法。沿用的理由是本次的「批次取消＋改期失效＋寫紀錄」與 006 的「改期＋寫申請」同屬單一交易內多表寫入，同一套工具已能處理。
  - 單一交易讓設備狀態、取消預約、改期失效與狀態紀錄同時成功或同時回滾，滿足 FR-002「同一次操作」、FR-004、FR-005、SC-001（未結束預約 100% 取消、已結束紀錄變動率 0%）與 SC-003（借用中設定成功率 0%）；取消條件只比對 `pending_approval`、`confirmed` 與時段結束時間，`returned`、`rejected`、`cancelled` 不在條件內，所以不會被改到。
  - FR-007 只要求確認視窗顯示數量；預覽端點與確認時的重新計算共用同一組條件，確認時三個數字任一不同就拒絕，滿足 FR-019 與驗收情境 15。數量比對發生在設備列鎖定之後，所以比對到寫入之間不會有新預約插入。
  - 查證本機 `@prisma/client` 7.10.1 的型別定義，互動式交易支援 `maxWait`、`timeout`、`isolationLevel` 選項，未指定時使用資料庫預設隔離等級；本次不需要調整這些選項。
  - NFR-002 與 SC-006 要求 100 筆以內未結束預約時操作 `< 2 秒`：每次變更是一次交易內 1 次鎖定、3 次索引計數、2 條批次 `UPDATE`、1 次狀態更新與 1 次新增，100 筆預約只多出批次更新的列數，預估 `< 100ms`。
  - 管理員端點沿用 `requireAdmin`，一般成員呼叫回 `403 FORBIDDEN`，滿足 FR-017、SC-005 與憲法 `.agents/constitution/skills/api-plan/openapi.md` 的權限錯誤規則。
- **Alternatives considered**:
  - **在應用層逐筆讀出受影響預約再逐筆更新**：100 筆預約要 100 次往返，回應時間隨筆數線性增加；一條批次 `UPDATE ... RETURNING` 就能取得被取消的預約 ID。
  - **以 `equipments` 加上 `version` 欄位做樂觀鎖，取代數量比對**：成員新增預約與改期申請被處理時不會改到設備列，`version` 不變，無法偵測驗收情境 15「成員又送出一筆預約」的變化，違反 FR-019。
  - **設定時不取消，改在查詢時把非可用設備的預約顯示成已取消**：資料庫中的預約仍是 `confirmed`，仍占用 `uq_reservations_active_slot`，恢復可用後會自動復原，違反 FR-012 與 SC-004。
  - **XState 狀態機套件管理設備狀態**：設備只有三種狀態，可用、送修中、停用之間的轉移由服務層檢查目標狀態即可，和 005、006 不引入狀態機套件的決定一致。
  - **以 Discord Webhook 通知受影響成員**：Clarifications 已決定只在「我的預約」顯示取消原因，不發 Email、Discord 等外部通知（Out of Scope「通知受影響成員」）。
  - **以 `node-cron` 在預計恢復日期自動恢復可用**：Clarifications 已決定送修與停用都沒有結束日期，只能由管理員手動恢復（Out of Scope「預計恢復日期與自動恢復」）。

---

## 3. 設定送修或停用與成員預約、核准待審預約、改期並發時的序列化 (PostgreSQL 18 列鎖 `FOR UPDATE`／`FOR SHARE`)

- **Decision**: 以 **PostgreSQL 18** 的設備列鎖序列化「設備狀態變更」與「會讓設備產生未結束預約的操作」，維持 `READ COMMITTED`，透過 **Prisma ORM 7.10** 的 `tx.$queryRaw` 下達：
  - **設備狀態變更**：交易第一個語句為 `SELECT status FROM equipments WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`。
  - **會建立或成立預約的操作**：成員新增預約（`POST /api/reservations`）、管理員核准待審預約、成員即時改期、管理員核准改期申請，交易第一個語句為 `SELECT status, requires_approval FROM equipments WHERE id = $1 AND deleted_at IS NULL FOR SHARE`，取得鎖之後才檢查 `status = 'available'`；不是可用時依第 2 主題回 `409 EQUIPMENT_UNAVAILABLE`。
  - 目前 `createReservation` 的設備檢查與新增不在同一個交易內，本次改成包在單一互動式交易內，`P2002` 轉成 `409` 的既有處理不變。
  - 所有路徑都先鎖設備列、再讀寫預約與改期申請，鎖的取得順序一致。
- **Rationale**:
  - 滿足 FR-009、SC-002 與驗收情境 12（同時預約與送修時，設備留下未結束預約的筆數為 0）。查證 PostgreSQL 18 官方文件的列鎖衝突表：`FOR SHARE` 與 `FOR UPDATE` 互相衝突，所以兩種情況都安全。設定先拿到鎖時，預約交易要等設定提交，之後讀到最新的 `maintenance` 或 `retired`，拒絕預約；預約先拿到鎖時，設定要等預約提交，之後的語句看得到新預約，並把它取消或因數量不同依 FR-019 拒絕。
  - `FOR SHARE` 之間不衝突，同一台設備不同時段的多筆預約仍可同時處理，不會因本次功能變慢；006 以部分唯一索引 `uq_reservations_active_slot` 處理的時段衝突照舊有效。
  - 查證同一張衝突表：新增預約時外鍵檢查只對設備列取 `FOR KEY SHARE`，它不和一般 `UPDATE` 取得的 `FOR NO KEY UPDATE` 衝突，所以不能只靠外鍵與 `UPDATE equipments` 序列化，必須明確下達 `FOR SHARE`。
  - 鎖定範圍只有一台設備的一列，持有時間就是一次交易（預估 `< 100ms`），NFR-002 的 `< 2 秒` 不受影響。
  - 符合使用者技術限制「只研究本次新增的技術主題」：只使用已採用的 PostgreSQL 18 與 Prisma，不新增套件或服務。
- **Alternatives considered**:
  - **只依賴既有部分唯一索引 `uq_reservations_active_slot`**：索引只防止同一時段重複占用；設定送修與新預約不會寫到同一個唯一鍵，兩個交易都會成功，留下送修設備上的有效預約，違反 FR-009。
  - **把相關交易改成 `SERIALIZABLE` 隔離等級**：衝突時以 `40001` 失敗，每個寫入路徑都要自行加重試迴圈，而且同一台設備不同時段的預約也可能互相判定衝突；列鎖只讓真正衝突的請求排隊。
  - **PostgreSQL advisory lock（`pg_advisory_xact_lock`）**：鎖與資料列沒有綁定，鍵值要自行由設備 ID 換算，每條路徑都要記得用相同換算；直接鎖設備列不需要額外約定。
  - **Redis 分散式鎖**：要新增 Redis 服務並調整 `docker-compose.yml`，違反「只研究本次新增的技術主題、原始碼位置不變」的精簡方向；005、006 也已決定不引入 Redis。

---

## 4. 管理員設備狀態操作與確認視窗、成員設備清單的送修中標示與停用隱藏、取消原因顯示 (React 19 + Vite 8)

- **Decision**: 沿用 **React 19**、**Vite 8**、**`@vitejs/plugin-react` 6**、**TypeScript 6.0**、**ESLint 10**、**`typescript-eslint` 8** 與 **Prettier**，在 `apps/equipment-loan/frontend/` 擴充既有畫面，不新增頁面與套件：
  - **管理員設備清單（`AdminOverviewView.tsx` 的設備區塊）**：新增狀態欄（可用、送修中、停用）與「最近變更」欄（管理員名稱、時間）；「可用」設備顯示「設為送修」「設為停用」，「送修中」顯示「設為停用」「恢復可用」，「停用」顯示「設為送修」「恢復可用」（FR-001、FR-008、FR-010、FR-011）。
  - **確認視窗元件 `EquipmentStatusDialog.tsx`**：點擊「設為送修」或「設為停用」時先呼叫預覽端點，顯示「將取消 N 筆預約、M 筆改期申請將失效」；按確認時把預覽結果放進請求；收到 `409 EQUIPMENT_STATE_CHANGED` 時顯示「設備狀態已被變更，請重新確認」並關閉視窗，管理員重新點擊時重新預覽（FR-007、FR-019）。寫法沿用既有 `RescheduleDialog.tsx` 的自製對話框。
  - **成員「設備預約」頁（`EquipmentBookingView.tsx`）**：依設備 DTO 的 `status` 顯示「送修中」標籤，該設備所有時段不顯示「預約」按鈕；停用設備由後端排除，不出現在清單（FR-014）。
  - **「我的預約」與全體預約管理**：`cancelReason` 為 `equipment_maintenance`、`equipment_retired` 時顯示「設備送修」「設備停用」，`member_cancelled` 不顯示原因（FR-015、FR-016、FR-020）。
  - 設備狀態標籤、取消原因、確認視窗文字與新錯誤碼說明集中加入既有 `apps/equipment-loan/frontend/src/text/zh-TW.ts`（NFR-001）。
- **Rationale**:
  - 符合使用者技術限制「沿用 006 techstack」：設備清單與「我的預約」都已存在，本次只加欄位、按鈕與一個對話框。沿用的理由是既有 React 元件與 `zh-TW.ts` 已能涵蓋新的顯示需求，不需要新的前端能力。
  - 確認視窗要先非同步取得數量、再依確認結果處理 `409`，瀏覽器內建 `window.confirm` 無法顯示載入中狀態與自訂錯誤；沿用 `RescheduleDialog.tsx` 的自製對話框寫法即可滿足 FR-007、FR-019。
  - 每次操作後重新拉取設備清單與預約清單，延續 005、006 的作法；畫面與後端使用同一組狀態值，前後端對「可預約」的定義一致，滿足 FR-006、FR-014 與 NFR-002 的 `< 2 秒`。
  - 所有新文字集中在 `zh-TW.ts`，滿足 NFR-001「使用臺灣繁體中文，且錯誤提示明確說明失敗原因」。
- **Alternatives considered**:
  - **瀏覽器內建 `window.confirm`**：只能顯示固定文字，無法在開啟前顯示載入中與預覽數量，也無法在視窗內顯示 FR-019 的拒絕訊息。
  - **Radix UI Dialog 等對話框元件套件**：既有 `RescheduleDialog.tsx` 與駁回視窗已是自製對話框，本次只多一個確認視窗，新增套件只增加相依與兩種對話框寫法。
  - **新增「設備管理」獨立頁面並引入 React Router**：Out of Scope 已排除新增與編輯設備基本資料，本次只加狀態操作，放在既有管理員設備區塊即可；沿用 005、006 以頁籤切換、不引入前端路由的決定。
  - **以 Zustand 共用設備狀態**：設備狀態只在管理員設備區塊與成員設備預約頁各自讀取，操作後重新拉取即可，不需要跨頁共用狀態。

---

## 5. 送修停用測試、並發與遷移驗證、前四版回歸與 Demo Seed (Vitest 5 + Supertest 7 + Playwright 1.65)

- **Decision**: 沿用 **Vitest 5**、**Supertest 7** 與 **Playwright（`@playwright/test` 1.65）**：
  - **後端整合測試（Vitest 5 + Supertest 7，真實 PostgreSQL 18 測試資料庫）**：涵蓋 FR-001～FR-020 的成功與拒絕路徑；以 `vi.setSystemTime` 固定在時段進行中，驗證已開始未領取與已開始仍待審核的預約一併取消（FR-002、FR-003）；以 `Promise.all` 同時送出新預約與設定送修，重複 20 輪，每輪驗證設備沒有未結束預約（FR-009、SC-002）；開啟預覽後插入新預約再確認，驗證回 `409 EQUIPMENT_STATE_CHANGED` 且資料不變（FR-019）；建立 100 筆未結束預約後量測設定送修的回應時間 `< 2 秒`（SC-006）；並重跑 003～006 全套整合測試（SC-005）。
  - **遷移測試（Vitest 5 + `pg`）**：在獨立測試資料庫依序執行 `backend/prisma/migrations/` 中 007 之前的 `migration.sql`，寫入一台 `unavailable` 設備與各種狀態的預約、借用、改期申請，再執行 007 的 `migration.sql`，驗證設備變成 `retired`、既有取消紀錄的 `cancel_reason` 為 `member_cancelled`，其餘欄位與資料列數不變（FR-018、驗收情境 13）。
  - **展示資料重設（`backend/prisma/seed.ts`）**：擴充 `npm run db:seed`，依執行當下的 `Asia/Taipei` 日期動態建立：一台「送修中」設備與因送修被取消的預約、一台「停用」設備與其「已歸還」紀錄，以及一台有未來 `confirmed` 預約（含 `pending_approval` 改期申請）與 `pending_approval` 預約、可示範設為送修的「可用」設備；同時新增對應的設備狀態變更紀錄，並保留 006 的範例（FR-018、驗收情境 14）。
  - **端對端測試（Playwright 1.65）**：在 `apps/equipment-loan/e2e/` 新增管理員設為送修（確認視窗顯示數量）、成員看到「送修中」與取消原因、停用設備從成員清單消失、恢復可用後重新預約，以及前四版核心流程回歸。
- **Rationale**:
  - 滿足 SC-001～SC-006 的可量測門檻；FR-003 與 FR-002 的「時段已開始、尚未結束」依賴時間，`vi.setSystemTime` 讓測試不必等到真實時段。
  - SC-002 與 FR-009 是並發性質，只有真實 PostgreSQL 才能驗證第 3 主題的 `FOR SHARE`／`FOR UPDATE` 列鎖；重複多輪可以涵蓋「預約先拿到鎖」與「設定先拿到鎖」兩種順序。
  - FR-018 要求無損遷移既有資料，`prisma migrate deploy` 只能一次套用全部 Migration，無法在 007 之前插入舊資料；以 `pg` 逐支執行 `migration.sql`，才能驗證 `unavailable` 改名為 `retired` 時既有資料列不變。`pg` 已是 006 採用的套件。
  - FR-018 要求 demo seed 包含送修、停用與可示範設為送修的設備；以執行當下日期動態計算，管理員開機即可驗證，延續 005、006 的作法。
  - 符合使用者技術限制「沿用 006 techstack」：測試工具全部沿用。沿用的理由是本次新增的驗證需求（時間、並發、遷移、端對端）都能用既有 Vitest、Supertest、`pg` 與 Playwright 表達。
- **Alternatives considered**:
  - **只用單元測試模擬交易與鎖**：模擬物件不會真的取得 PostgreSQL 列鎖，無法驗證 FR-009 的並發行為。
  - **遷移只以 `prisma migrate deploy` 在空資料庫上驗證**：空資料庫沒有 `unavailable` 設備與既有預約，測不到 FR-018 的資料轉換與無損保留。
  - **以固定日期建立 demo seed**：日期過了之後，示範用的未來預約與改期申請都會變成已開始或已失效，無法展示設為送修時取消未來預約的效果。
