---

description: "Task list for 逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查 implementation"
---

# Tasks: 逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查 (Overdue Discord Notification)

**Input**: Design documents from `/specs/008-overdue-discord-notification/`（依下方 Reference Loading Contract 按任務載入）

**Tests**: spec.md 沒有明確要求撰寫測試或 TDD，因此各使用者故事不為新功能產生測試任務。Setup 沿用前五版已安裝的 Vitest 5、Supertest 7 與 Playwright 1.65，不另外安裝測試工具。任務改變的既有行為中，既有測試依賴的有三處：`backend/tests/integration/api.test.ts` 斷言林雅婷的 `GET /api/reservations/my?status=checked_out` 只有 1 筆（`RV-20261108-03`）、`e2e/equipment-maintenance.spec.ts` 把 EQ-104 設為送修（EQ-104 有借用中預約時會回 `EQUIPMENT_ON_LOAN`）並在管理員登入後直接操作「設備狀態管理」、`frontend/tests/unit/zh-TW.test.ts` 斷言 `ERROR_MESSAGES` 有 19 個錯誤碼。T003、T017、T023 的描述已限制做法，不改變這些行為，所以不排更新既有測試的任務；實作時若必須偏離這些限制，要在同一個 Phase、同一組中補上更新該測試的任務。前五版回歸在 Polish 重跑（SC-007）。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. 每個階段內再依 plan.md「系統介面盤點」的技術端點（資料庫、後端、前端）分組，標題列出該組實作的介面編號；每個任務下方以 Must Read／Optional 列出執行時要讀的文件部位。

## Reference Loading Contract

執行本檔的任務時，依下列規則載入 `/specs/008-overdue-discord-notification/` 的文件：

1. 開工前只讀本檔，不預先讀 spec package 的其他文件。
2. 每個任務下方列出它的參考，分兩級：
   - **Must Read**：開始這個任務前一定要讀完的部位。
   - **Optional**：只在遇到該項 Why 描述的情況時才讀。
3. 每項參考寫成 `` `檔案` → 部位 — Why：理由 ``。Why 說明這個部位決定任務的哪一部分，讀的時候以它為重點。
4. 只讀列出的部位，不讀整份文件。部位以文件內可搜尋的識別字定位：
   - `contracts/openapi.yaml`：operationId，或 `components` 底下的 schema、response 名稱
   - `data/data-model.dbml`：`Table`、`Enum`、`Ref`
   - `spec.md`：US 情境、FR／NFR／SC 編號、Edge Cases 項目、Clarifications
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

- **Web app**：所有程式路徑都在 `apps/equipment-loan/` 底下；本檔的 `backend/`、`frontend/`、`e2e/`、`playwright.config.ts`、`README.md` 都是相對 `apps/equipment-loan/` 的路徑（依 plan.md 的 Structure Decision）
- 排程在 `backend/src/jobs/`、Discord 呼叫在 `backend/src/integrations/`、設定驗證在 `backend/src/config/`、本機 Discord 模擬器在 `backend/scripts/`；不另建頂層目錄
- 資料表與 Enum 以 Prisma 定義在 `backend/prisma/schema.prisma`，增量遷移放在 `backend/prisma/migrations/`；Prisma model 名稱沿用既有的 snake_case 資料表名稱（例如 `prisma.reservations`）
- SQL 使用的目前時間一律由應用程式傳入參數 `now`，不使用資料庫的 `now()`（research §2）

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] 在 `backend/.env.example` 保留既有的 `DATABASE_URL`、`PORT`，新增 `DISCORD_WEBHOOK_URL="http://127.0.0.1:4010/api/webhooks/000000000000000000/simulator-token"`（指向本機模擬器）、`OVERDUE_AUTO_CHECK_ENABLED=true`、`OVERDUE_CHECK_INTERVAL_SECONDS=60`，並以註解說明 `OVERDUE_CHECK_INTERVAL_SECONDS` 允許 `10`～`300`、展示 US3 手動檢查前把 `OVERDUE_AUTO_CHECK_ENABLED` 改為 `false`；`.env` 已由 `apps/equipment-loan/.gitignore` 忽略，不 commit（research §5、NFR-003）
  - **Must Read**
    - `research.md` → §5 — Why：三個設定項目、預設值、`.env.example` 的模擬器位址與 `.env` 不 commit
  - **Optional**
    - `research.md` → §2 — Why：需要確認檢查間隔的允許範圍與自動檢查開關只關閉自動逾期檢查時
- [ ] T002 在 `backend/package.json` 修改 scripts：`dev` 改為 `tsx watch --env-file-if-exists=.env src/server.ts`、`db:seed` 改為 `tsx --env-file-if-exists=.env prisma/seed.ts`，新增 `discord:sim` 為 `tsx scripts/discordWebhookSimulator.ts`；不新增任何相依套件（不引入 dotenv）。`playwright.config.ts` 的後端 webServer 與既有 E2E 的 `npm --prefix backend run db:seed` 都會改走這兩個 script；`.env` 的 `DATABASE_URL` 與程式預設值相同，既有測試的連線不變（research §5、research §6、NFR-003）
  - **Must Read**
    - `research.md` → §5 — Why：以 `--env-file-if-exists=.env` 載入 `.env` 的 `dev` 與 `db:seed` 寫法，以及後端目前沒有載入 `.env` 的現況
    - `research.md` → §6 — Why：模擬器以 `tsx` 執行與 `discord:sim` 指令
    - `techstack.md` → 本次開發不引入的技術 — Why：不得安裝的 dotenv、pino 等套件

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 前端（F1–F4 共用）

> 資料庫 D1、排程 S1–S3 與通知服務 N1、N2 第一個用到的是 US1，放在 US1；新錯誤碼只有 B2 使用，放在 US2。本階段沒有資料庫與後端任務，只建立 US2、US3 共用的管理員頁籤與頁面骨架。

- [ ] T003 在 `frontend/src/App.tsx` 的 `ViewName` 加入 `"overdue-notifications"`，在頁首導覽 `nav-admin` 之後新增只對管理員顯示的「逾期通知紀錄」頁籤（`data-testid` 比照既有 `nav-*` 命名），點擊後顯示 `OverdueNotificationsView`；頁籤文字加入 `frontend/src/text/zh-TW.ts` 的 `UI_TEXT.nav`。管理員登入後的預設畫面維持「設備狀態管理」，既有 `nav-login`、`nav-booking`、`nav-my-reservations`、`nav-equipment-status`、`nav-admin` 的位置與行為不變（`e2e/equipment-maintenance.spec.ts` 在管理員登入後直接等待 `equipment-status-table`）（見 Notes 待確認 5）（FR-003、FR-019、FR-020、NFR-002）
  - **Must Read**
    - `plan.md` → Source Code (repository root) — Why：`App.tsx` 本次只新增「逾期通知紀錄」管理員頁籤，以及 `OverdueNotificationsView.tsx` 的位置
    - `ui/plan.md` → §3.1 — Why：逾期通知紀錄頁的進入方式
    - `ui/plan.md` → §1 — Why：F4 前五版既有畫面本次行為不變，沿用 007 的畫面
    - `contracts/openapi.yaml` → `getCurrentUser` — Why：前端只在角色為 admin 時顯示「逾期通知紀錄」頁籤
  - **Optional**
    - `ui/plan.md` → §2 — Why：需要確認頁首導覽列的版面時
- [ ] T004 在 `frontend/src/views/OverdueNotificationsView.tsx` 建立頁面骨架：標題「逾期通知紀錄」與說明文字「借用中的設備超過時段結束時間還沒歸還時，系統會發 Discord 通知到管理員頻道。這裡列出每則通知的送出結果；送出失敗或結果不明的通知可以重送。」、頁頂橫幅區（US2 重送與 US3 立即檢查共用）、「通知清單」卡片標題列與右側按鈕區；版面依 ui/plan.md §2（內容最大寬度 1120px、卡片圓角 12px、360px 寬仍可操作、720px 以下改為一則通知一張卡片），沿用既有 CSS 變數與雙主題；清單、篩選與按鈕由 US2、US3 的任務補上（FR-003、NFR-002）
  - **Must Read**
    - `ui/plan.md` → §2 — Why：配色、字體、版面、狀態徽章與按鈕位置
    - `ui/overdue-notifications.html` → 雛形狀態「通知清單」 — Why：標題、說明文字、橫幅區與清單卡片的實際配置
  - **Optional**
    - `ui/overdue-notifications.html` → `<style>` — Why：需要對照雛形的實際樣式數值時

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 設備逾期未還時，系統自動發 Discord 通知提醒管理員 (Priority: P1) 🎯 MVP

**Goal**: 系統定期找出「借用中」且時段已結束的逾期借用，每筆只建立一則通知，在時段結束後 10 分鐘內送到 Discord；暫時失敗時依 Discord 要求的等待時間自動重試最多 3 次，等不到回應或送出後連線中斷時標成「結果不明」，系統恢復運作時依中斷情況繼續重試或標成「結果不明」。

**Independent Test**: 準備一筆今天下午時段（`13:00–17:00`）「借用中」的預約，以及一個可以收到通知的 Discord 頻道；在 `17:00` 後等待自動檢查；驗證 `17:10` 前頻道收到一則寫出設備、成員姓名、預約日期與時段、逾期多久的通知，之後的自動檢查不再發第二則；再讓 Discord 回應伺服器錯誤或不回應，驗證通知分別標成「送出失敗」與「結果不明」。

### 資料庫（D1、D2）

- [ ] T005 [US1] 在 `backend/prisma/schema.prisma` 新增 Enum `overdue_notification_status`（`sending`、`sent`、`failed`、`unknown`）、Enum `overdue_notification_failure_reason`（`rate_limited`、`discord_server_error`、`connection_failed`、`webhook_invalid`、`webhook_not_configured`、`message_rejected`）與 model `overdue_notifications`：`id`（`Uuid`）、`reservation_id`（`unique`，唯一約束名稱 `uq_overdue_notifications_reservation`）、`status`（預設 `sending`）、`attempt_count`（預設 0）、`auto_retry_count`（預設 0）、`next_attempt_at`、`last_attempted_at`、`failure_reason`、`sent_at`、`discord_message_id`（`Text`）、`created_at`、`updated_at`、`updated_by`、`deleted_at`，時間欄位用 `Timestamptz(6)`；以 `Ref: reservations.id - overdue_notifications.reservation_id` 建立一對一關聯（`reservations` 只加反向關聯欄位，不改任何既有欄位、Enum 與索引）；加上索引 `idx_overdue_notifications_status_created`（`status, created_at`）與 `idx_overdue_notifications_created`（`created_at`）；部分索引 `idx_overdue_notifications_due` 由 T006 寫在遷移 SQL（FR-012、FR-017、FR-020、FR-021、NFR-003）
  - **Must Read**
    - `data/data-model.dbml` → `Table overdue_notifications` — Why：欄位、預設值、可為空、唯一約束、三個索引與每個欄位在各狀態下的值
    - `data/data-model.dbml` → `Enum overdue_notification_status`、`Enum overdue_notification_failure_reason` — Why：兩個 Enum 的值與 `sending` 以 `next_attempt_at` 區分兩種情況
    - `data/data-model.dbml` → `Ref: reservations.id - overdue_notifications.reservation_id` — Why：一對一關聯的方向
    - `research.md` → §1 — Why：只新增 Enum 與資料表、不改既有資料表，`discord_message_id` 用字串保存
  - **Optional**
    - `data/data-model.dbml` → `Table reservations` — Why：需要確認既有 `reservations` 欄位與索引本次不變時
- [ ] T006 [US1] 以 `prisma migrate dev --create-only` 產生 `backend/prisma/migrations/<timestamp>_overdue_notifications/migration.sql`，在 SQL 中補上部分索引 `idx_overdue_notifications_due`（`next_attempt_at`，`WHERE status = 'sending'`），確認唯一約束名稱為 `uq_overdue_notifications_reservation`、SQL 只有建立兩個 Enum、`overdue_notifications`、索引與外鍵，沒有任何 `ALTER` 或 `UPDATE` 既有資料表的語句，再以 `npm run db:migrate` 套用（FR-012、FR-020、US1 情境 10）
  - **Must Read**
    - `research.md` → §1 — Why：以 `--create-only` 產生、檢查 SQL 後套用，以及部分索引 `idx_overdue_notifications_due` 的條件
    - `data/data-model.dbml` → `Table overdue_notifications` 的 `idx_overdue_notifications_due` — Why：部分索引的欄位與 `WHERE status = 'sending'` 條件
  - **Optional**
    - `data/data-model.dbml` → `Project` 的 Note — Why：需要確認本次遷移只新增、不改寫既有資料列時
- [ ] T007 [US1] 驗證無損遷移：在套用 T006 前以 `npm run db:seed` 建立前五版的展示資料，記錄 `users`、`captcha_challenges`、`sessions`、`equipments`、`equipment_status_changes`、`time_slots`、`reservations`、`reschedule_requests` 的資料列數與 `reservations` 各狀態筆數；套用 T006 後再查一次，確認全部不變且 `overdue_notifications` 為空表；既有的 `backend/tests/migration/equipmentMaintenanceRetire.test.ts` 只執行到 007 的遷移，本次不需修改（FR-020、US1 情境 10、Edge Cases「升級時已有的逾期借用」）
  - **Must Read**
    - `spec.md` → US1 情境 10、FR-020 — Why：升級後既有資料的狀態與內容都不變
    - `research.md` → §8 — Why：無損遷移的驗證方式與要比對的資料
  - **Optional**
    - `spec.md` → Edge Cases「升級時已有的逾期借用」 — Why：需要確認升級時已逾期的借用在第一次檢查才建立通知、遷移本身不建立時

### 後端（S1–S3、N1、N2、B4）

- [ ] T008 [P] [US1] 在 `backend/src/config/notificationConfig.ts` 以 zod 4 在啟動時驗證三個設定：`DISCORD_WEBHOOK_URL` 必須是 `http` 或 `https` 位址，空白或格式錯誤時視為「沒有設定」、後端照常啟動，log 只寫「DISCORD_WEBHOOK_URL 沒有設定或格式不正確」，不寫輸入值；`OVERDUE_AUTO_CHECK_ENABLED` 預設 `true`；`OVERDUE_CHECK_INTERVAL_SECONDS` 預設 `60`，允許 `10`～`300`。Webhook 位址只匯出給 `discordWebhookClient`，其他模組只拿到 `isWebhookConfigured`（FR-015、NFR-003、SC-006）
  - **Must Read**
    - `research.md` → §5 — Why：三個設定的驗證規則、沒有設定時的處理、log 規則與 Webhook 位址的使用範圍
    - `research.md` → §2 — Why：自動檢查開關只關閉自動逾期檢查，以及檢查間隔的預設值與允許範圍
  - **Optional**
    - `spec.md` → Edge Cases「Webhook 沒有設定或已失效」 — Why：需要確認沒有設定時通知要標成「送出失敗」、失敗原因不顯示 Webhook 位址時
- [ ] T009 [US1] 在 `backend/src/integrations/discordWebhookClient.ts` 實作 `discordWebhookClient.send(content)`（N1），回傳分類後的結果、不向外拋出原始錯誤：沒有設定 Webhook 時不送出請求，直接回不可重試 `webhook_not_configured`；請求以 `new URL(webhookUrl)` 加 `searchParams.set("wait", "true")`，`POST`、`Content-Type: application/json`，內容 `{ "content": <通知文字>, "allowed_mentions": { "parse": [] } }`，`signal: AbortSignal.timeout(10_000)`；依 research §3 的結果分類表把回應分成送出成功（`200` 且 JSON 有 `id`，回傳訊息編號）、可重試（`429` 且等待秒數 ≤ 60 為 `rate_limited`；`500`～`599` 為 `discord_server_error`；`fetch` 拋出 `TypeError` 且 `cause.code` 為 `ECONNREFUSED`、`ENOTFOUND`、`EAI_AGAIN`、`ENETUNREACH`、`EHOSTUNREACH`、`ENETDOWN`、`EHOSTDOWN`、`UND_ERR_CONNECT_TIMEOUT` 為 `connection_failed`，`localhost` 解析出兩個位址時以 `AggregateError` 的 `code` 判斷）、不可重試（`429` 且等待秒數 > 60 為 `rate_limited`；`401`、`403`、`404` 為 `webhook_invalid`；其他 `4xx` 為 `message_rejected`）與結果不明（`TimeoutError`、其他 `fetch` 錯誤如 `UND_ERR_SOCKET`、`ECONNRESET`、`EPIPE`、讀取回應內容失敗，以及 `200` 但沒有 `id`）；等待秒數先讀 `Retry-After` 標頭，沒有時讀回應 JSON 的 `retry_after`；每次收到回應時一併回傳 `X-RateLimit-Remaining` 與 `X-RateLimit-Reset-After`；log 只寫通知 ID、狀態、失敗原因 Enum、HTTP 狀態碼與錯誤代碼，需要標示目的地時只寫主機名稱，不寫請求 URL、請求物件、回應物件與錯誤物件原文（見 Notes 待確認 2）（FR-014、FR-015、FR-016、FR-017、NFR-003、US1 情境 5～8、11、12、15、SC-006）
  - **Must Read**
    - `research.md` → §3 — Why：請求格式、結果分類表、等待秒數的來源順序與速率限制標頭
    - `research.md` → §5 — Why：送出相關 log 只寫主機名稱與錯誤代碼，Webhook 位址不得進 log
    - `data/data-model.dbml` → `Enum overdue_notification_failure_reason` — Why：每種失敗結果對應的失敗原因值
    - `spec.md` → FR-014、FR-015、FR-016 — Why：哪些結果可以自動重試、哪些直接標「送出失敗」、哪些標「結果不明」
  - **Optional**
    - `spec.md` → Clarifications — Why：需要確認「只有確定訊息沒送出去才自動重試」與「等待超過 1 分鐘直接標送出失敗」的決策原文時
    - `plan.md` → 系統介面盤點 — Why：需要確認 N1 Discord Webhook 逾期通知送出的需求依據時
- [ ] T010 [US1] 在 `backend/src/services/overdueNotificationService.ts` 實作 `runOverdueCheck(now)`（S1，自動檢查與 US3 手動檢查共用）：以 Prisma 的 `tx.$queryRaw` 執行一條 `INSERT INTO overdue_notifications (...) SELECT r.id, ... FROM reservations r JOIN time_slots s ON s.id = r.slot_id WHERE r.status = 'checked_out' AND r.deleted_at IS NULL AND ((r.reservation_date + s.end_time::time) AT TIME ZONE 'Asia/Taipei') < $now ON CONFLICT (reservation_id) DO NOTHING RETURNING id`，新通知 `status = 'sending'`、`next_attempt_at = $now`、`created_at`、`updated_at` 為 `$now`；回傳 `RETURNING` 的列數作為這次新建立的通知數；不讀設備狀態；維持 `READ COMMITTED`（見 Notes 待確認 1）（FR-002、FR-011、FR-012、FR-018、SC-002、US1 情境 1～4、9、Edge Cases「時段結束後、檢查前已歸還」「逾期好幾天仍未歸還」「送修或停用設備的逾期借用」）
  - **Must Read**
    - `research.md` → §2 — Why：`runOverdueCheck(now)` 的 SQL、新通知的初始值，以及 `now` 由應用程式傳入
    - `research.md` → §4 — Why：手動與自動檢查同時執行時由 `ON CONFLICT (reservation_id) DO NOTHING` 讓後寫入的一方略過
    - `data/data-model.dbml` → `Table time_slots` 的 `end_time`、`Table reservations` 的 `status` — Why：逾期判定依據的欄位與 `checked_out`
    - `spec.md` → FR-011、FR-012 — Why：逾期判定不設寬限時間，已有通知的逾期借用不論狀態都不再建立
  - **Optional**
    - `data/data-model.dbml` → `Table reservations` 的 `idx_reservations_status_date_slot` — Why：需要確認檢查語句可用的索引時
- [ ] T011 [US1] 在 `backend/src/services/overdueNotificationService.ts` 實作通知文字組成：依通知對應的預約，以 `reservations.equipment_id`、`reservations.user_id`、`reservations.slot_id` 取出 `equipments.equipment_code` 與 `name`、`users.display_name`、`reservations.reservation_date`、`time_slots.name`、`start_time`、`end_time`，以送出當下的 `now` 計算已逾期多久，組成臺灣繁體中文、2000 字以內的通知文字；文字的版面與「逾期多久」的單位待確認（見 Notes 待確認 2）（FR-013、NFR-002、US1 情境 1）
  - **Must Read**
    - `spec.md` → FR-013、US1 情境 1 — Why：通知必須寫出的五項內容與範例（「下午 `13:00–17:00`」）
    - `research.md` → §3 — Why：通知文字使用繁體中文、長度 2000 字以內，`allowed_mentions` 讓姓名中的 `@everyone` 不提及他人
    - `data/data-model.dbml` → `Table users` 的 `display_name`、`Table equipments`、`Table time_slots` — Why：通知內容各項資料的來源欄位
  - **Optional**
    - `spec.md` → Clarifications — Why：需要確認通知寫出成員姓名的前提（頻道只有管理員看得到）時
- [ ] T012 [US1] 在 `backend/src/jobs/overdueScheduler.ts` 實作 `dispatchDueNotifications(now)`（S2）：一次只處理一則通知，處理完再找下一則，直到沒有到期的通知；以 `UPDATE overdue_notifications SET next_attempt_at = NULL, attempt_count = attempt_count + 1, last_attempted_at = $now WHERE id = (SELECT id FROM overdue_notifications WHERE status = 'sending' AND next_attempt_at <= $now ORDER BY next_attempt_at LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING ...` 領取並提交，再以 T011 組成文字、呼叫 T009 的 `send`，依結果更新同一列：送出成功設 `status = 'sent'`、`sent_at`、`discord_message_id`；可重試且 `auto_retry_count` 小於 3 時 `auto_retry_count` 加 1、`next_attempt_at` 設為 `$now` 加等待秒數（沒有等待秒數時依第 1、2、3 次自動重試分別等 2、4、8 秒），狀態維持 `sending`；可重試但 `auto_retry_count` 已達 3、或不可重試時設 `status = 'failed'` 與這次的 `failure_reason`；結果不明設 `status = 'unknown'`，不再自動重試；每次更新都寫 `updated_at`，`updated_by` 為 null；`X-RateLimit-Remaining` 為 `0` 時暫停到 `X-RateLimit-Reset-After` 秒之後才領取下一則；上一次執行還沒結束時跳過這一次（見 Notes 待確認 1）（FR-005、FR-014、FR-015、FR-016、FR-017、FR-018、SC-003、US1 情境 5～8、11、12、15、Edge Cases「自動重試時又等不到回應或連線中斷」「連線在訊息送出前就失敗」「Discord 要求等待很久」）
  - **Must Read**
    - `research.md` → §2 — Why：送出程序的領取語句、一次處理一則、速率限制暫停與跳過重疊執行
    - `research.md` → §3 — Why：可重試、不可重試、結果不明三類結果的處理、退避間隔與重試上限
    - `data/data-model.dbml` → `Table overdue_notifications` — Why：`attempt_count`、`auto_retry_count`、`next_attempt_at`、`failure_reason`、`sent_at`、`discord_message_id` 在各狀態下要寫入的值
    - `spec.md` → FR-014、FR-016 — Why：最多自動重試 3 次與標成「結果不明」後停止自動重試
  - **Optional**
    - `spec.md` → US1 情境 6 — Why：需要確認「自動重試 3 次後仍失敗」的計算方式（4 次請求）時
- [ ] T013 [US1] 在 `backend/src/jobs/overdueScheduler.ts` 實作 `recoverInterruptedNotifications(now)`（S3）與 `start()`：`recoverInterruptedNotifications` 執行 `UPDATE overdue_notifications SET status = 'unknown', updated_at = $now WHERE status = 'sending' AND next_attempt_at IS NULL`，`next_attempt_at` 有值的通知保留並保留 `auto_retry_count`；`start()` 先執行恢復處理，再依 `notificationConfig` 的 `OVERDUE_AUTO_CHECK_ENABLED` 決定是否在啟動後立即執行一次 `runOverdueCheck(now)` 並每 `OVERDUE_CHECK_INTERVAL_SECONDS` 秒執行一次，另每 1 秒執行一次 `dispatchDueNotifications(now)`；兩個排程都以 `setTimeout` 串接（上一次執行結束後才排下一次），`now` 每次取 `new Date()`；自動檢查關閉時，恢復處理與送出程序照常執行；匯出 `runOverdueCheck`、`dispatchDueNotifications`、`recoverInterruptedNotifications` 供直接呼叫（見 Notes 待確認 1）（FR-001、FR-002、FR-021、SC-001、US1 情境 9、13、14、Edge Cases「通知送出中時系統停止運作」「系統停止運作期間逾期」）
  - **Must Read**
    - `research.md` → §2 — Why：啟動時恢復的語句、自動逾期檢查與送出程序的執行時機，以及自動檢查開關只關閉自動逾期檢查
    - `spec.md` → FR-021 — Why：等待自動重試的通知繼續重試且總數仍最多 3 次，等待 Discord 回應的通知標成「結果不明」
    - `data/data-model.dbml` → `Enum overdue_notification_status` 的 `sending` — Why：以 `next_attempt_at` 是否為 null 區分兩種「送出中」
  - **Optional**
    - `research.md` → §8 — Why：需要確認匯出函式供直接呼叫、搭配 `vi.setSystemTime` 固定時間時
- [ ] T014 [US1] 在 `backend/src/server.ts` 於 `app.listen` 之後呼叫 `overdueScheduler.start()`；`backend/src/app.ts` 不啟動排程，既有 Supertest 測試匯入 `app` 時不會執行排程（FR-001、FR-002、research §2）
  - **Must Read**
    - `research.md` → §2 — Why：由 `src/server.ts` 呼叫 `start()`，`src/app.ts` 不啟動排程
    - `plan.md` → Source Code (repository root) — Why：`server.ts` 本次加上啟動逾期排程、`app.ts` 不啟動排程
- [ ] T015 [P] [US1] 在 `backend/scripts/discordWebhookSimulator.ts` 以 `node:http` 實作本機 Discord Webhook 模擬器（N2），只用 Node.js 內建模組：預設監聽 `127.0.0.1:4010`（`DISCORD_SIM_PORT` 可改），啟動時可用 `--mode=<模式>` 指定初始模式；Webhook 端點 `POST /api/webhooks/:webhookId/:token` 依模式回應 `success`（有 `?wait=true` 回 `200` 與 `{ id, channel_id, content, timestamp }`，`id` 為遞增的 snowflake 字串；沒有時回 `204`）、`rate_limit`（`429`、`Retry-After` 標頭與 `{ message, retry_after, global: false }`，秒數由 `retryAfterSeconds` 設定，預設 `2`）、`server_error`（`statusCode` 設定的 `5xx`，預設 `500`）、`timeout`（讀完請求後不回應）、`disconnect`（讀完請求後直接中斷連線）、`not_found`（`404` 與 `{ message: "Unknown Webhook", code: 10015 }`）；`failTimes` 讓前 N 次依模式回應、之後改回 `success`；每次回應都附上 `X-RateLimit-Remaining` 與 `X-RateLimit-Reset-After`；控制端點 `GET /__sim/state`、`PUT /__sim/mode`（JSON `{ mode, retryAfterSeconds?, statusCode?, failTimes? }`）、`GET /__sim/messages`、`DELETE /__sim/messages`；log 只寫模式與收到的訊息數，不寫請求路徑；同一檔案匯出 `createDiscordWebhookSimulator()`，可用連接埠 `0` 在其他程序內啟動（見 Notes 待確認 3）（FR-014、FR-015、FR-016、NFR-003、US1 情境 4～8、11、12、15、SC-003）
  - **Must Read**
    - `research.md` → §6 — Why：六種模式的回應、`failTimes`、速率限制標頭、控制端點、監聽位址與 log 規則
  - **Optional**
    - `research.md` → §3 — Why：需要確認模擬器的回應要讓 T009 分類成哪一類時
    - `plan.md` → 系統介面盤點 — Why：需要確認 N2 本機 Discord Webhook 模擬器要重現的情境時
- [ ] T016 [US1] 在 `playwright.config.ts` 的後端 webServer（`npm --prefix backend run dev`）加上環境變數 `OVERDUE_AUTO_CHECK_ENABLED=false` 與指向模擬器的 `DISCORD_WEBHOOK_URL`，並新增一個 webServer 以 `npm --prefix backend run discord:sim` 啟動模擬器（port `4010`）；`reuseExistingServer`、`timeout`、前端 webServer 與既有設定不變，讓 T014 啟動的排程不會在既有 E2E（前五版的 B4 與 F4 流程）執行期間對 demo seed 的逾期借用建立通知（FR-020、SC-007、US1 情境 10、research §8）
  - **Must Read**
    - `research.md` → §8 — Why：Playwright 啟動後端時關閉自動檢查並啟動模擬器
    - `plan.md` → Source Code (repository root) — Why：`playwright.config.ts` 本次的修改範圍
  - **Optional**
    - `research.md` → §6 — Why：需要確認模擬器的預設連接埠與 Webhook 位址格式時

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 管理員查看每則通知有沒有送出成功，重送失敗的通知 (Priority: P2)

**Goal**: 管理員在「逾期通知紀錄」頁看到每則通知的設備、借用成員、預約日期與時段、狀態、嘗試次數與時間、借用是否已歸還，可以依狀態篩選；可以重送「送出失敗」與「結果不明」的通知（結果不明先確認），重送後立即顯示「送出中」、重新整理看到結果，且只更新同一則通知。

**Independent Test**: 準備三筆逾期借用的通知，狀態分別為「送出成功」、「送出失敗」、「結果不明」，其中「送出失敗」那筆借用仍為「借用中」；以管理員登入開啟「逾期通知紀錄」頁；驗證三則通知的內容與狀態；在 Discord 正常時重送「送出失敗」的通知，驗證這則通知立即顯示「送出中」，重新整理清單後同一則通知變成「送出成功」、嘗試次數增加且頻道收到通知；對「結果不明」的通知點擊「重送」，驗證先出現確認視窗。

### 資料庫（D1、D2）

- [ ] T017 [US2] 在 `backend/prisma/seed.ts` 的 `seedDatabase()` 開頭先 `prisma.overdue_notifications.deleteMany()`，再執行既有的 `reschedule_requests`、`reservations` 等清除；依執行當下的 `Asia/Taipei` 日期，以「昨天」的時段建立「借用中」的逾期借用，並各配一則「送出成功」（`sent_at` 與假的 `discord_message_id`）、「送出失敗」（`failure_reason`，借用仍為 `checked_out`）、「結果不明」通知，`attempt_count`、`last_attempted_at`、`created_at` 依狀態合理填寫；保留 007 的全部範例。限制：可以讓既有的「昨天」逾期借用（`RV-20261107-05`、`RV-20261109-19`）配通知，新增的逾期借用只用陳冠廷與 EQ-101、EQ-103，不新增林雅婷的 `checked_out`（`backend/tests/integration/api.test.ts` 斷言林雅婷借用中只有 `RV-20261108-03`），不在 EQ-104 建立 `checked_out`（`e2e/equipment-maintenance.spec.ts` 要把 EQ-104 設為送修），新增的預約不得違反 `uq_reservations_active_slot`（昨天晚間的 EQ-102、EQ-103 已被占用）（FR-020、US2 情境 16、SC-007）
  - **Must Read**
    - `research.md` → §8 — Why：demo seed 先清除 `overdue_notifications`、以「昨天」的時段建立逾期借用與三種狀態的通知
    - `data/data-model.dbml` → `Table overdue_notifications` — Why：三種狀態各自必填與必須為 null 的欄位
    - `data/data-model.dbml` → `Table reservations` 的 `uq_reservations_active_slot` — Why：新增逾期借用不得占用已被占用的設備與時段
    - `spec.md` → FR-020、US2 情境 16 — Why：demo seed 必須包含「送出成功」、「送出失敗」、「結果不明」各至少一則
  - **Optional**
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「通知清單」 — Why：需要參考失敗原因與已歸還等展示組合時

### 後端（B1、B2）

- [ ] T018 [US2] 在 `backend/src/middleware/errorHandler.ts` 比照既有 `RescheduleErrorCode`、`EquipmentStatusErrorCode` 的寫法新增逾期通知錯誤碼 `OVERDUE_LOAN_RETURNED`（`409`，訊息「借用已歸還，不需要重送」）與 `OVERDUE_NOTIFICATION_NOT_RESENDABLE`（`409`，訊息說明通知目前的狀態），加入 `ErrorCode`；訊息使用臺灣繁體中文，不含 Webhook 位址（FR-007、FR-008、NFR-002、NFR-003）
  - **Must Read**
    - `contracts/openapi.yaml` → `components.schemas.Error`、`ResendOverdueNotificationConflict` — Why：兩個新錯誤碼與 `409` 回應的情況
    - `spec.md` → FR-007、FR-008 — Why：拒絕重送時的提示文字要求
  - **Optional**
    - `ui/plan.md` → §5 `overdue-notifications.html` 的「重送時借用已歸還」「重送時通知已在送出中」「重送時通知已送出成功」 — Why：需要確認畫面直接顯示的錯誤訊息全文時
- [ ] T019 [US2] 在 `backend/src/services/overdueNotificationService.ts` 實作通知紀錄查詢（`listOverdueNotifications` 的服務層）：排除 `deleted_at` 不為 null 的資料列，可依 `status` 篩選，依 `created_at` 由新到舊、相同時依 `id` 由小到大排序，分頁回傳 `items`、`page`、`pageSize`、`totalItems`、`totalPages`（`page` 超過 `totalPages` 時 `items` 為空陣列）；每則轉成 `OverdueNotification`：設備編號與名稱、`reservationNumber`、成員 `userDisplayName`、預約日期與時段、`status`、`attemptCount`、`lastAttemptedAt`、`sentAt`、`discordMessageId`、`failureReason`、`loanReturned`（預約為 `returned`）、`returnedAt`、`canResend`（`status` 為 `failed` 或 `unknown` 且預約仍為 `checked_out`）、`createdAt`；不回傳 Webhook 位址（FR-003、FR-004、FR-008、FR-017、NFR-003、US2 情境 1～3、9～12、Edge Cases「通知送出中或結果不明時借用被歸還」「逾期好幾天仍未歸還」）
  - **Must Read**
    - `contracts/openapi.yaml` → `listOverdueNotifications`、`OverdueNotificationPage`、`OverdueNotification` — Why：篩選、排序、分頁與每個欄位的來源與 null 條件
    - `data/data-model.dbml` → `Table overdue_notifications`、`Table reservations` 的 `returned_at` — Why：清單欄位與借用是否已歸還的來源
    - `research.md` → §4 — Why：`canResend` 與 `loanReturned` 的判斷
  - **Optional**
    - `data/data-model.dbml` → `Table overdue_notifications` 的 `idx_overdue_notifications_status_created`、`idx_overdue_notifications_created` — Why：需要確認排序與篩選可用的索引時
- [ ] T020 [US2] 在 `backend/src/services/overdueNotificationService.ts` 實作重送（`resendOverdueNotification` 的服務層）：以一條條件式更新 `UPDATE overdue_notifications n SET status = 'sending', next_attempt_at = $now, auto_retry_count = 0, failure_reason = NULL, updated_by = 管理員, updated_at = $now FROM reservations r WHERE n.id = $1 AND r.id = n.reservation_id AND n.status IN ('failed', 'unknown') AND r.status = 'checked_out' RETURNING n.id` 領取重送權，不改 `attempt_count`（由送出程序領取時加 1），成功時回傳狀態為 `sending`、`canResend` 為 false 的 `OverdueNotification`；更新 0 列時重新讀取通知與預約，依序判斷：通知不存在拋出 `RESOURCE_NOT_FOUND`（404）、預約已不是 `checked_out` 拋出 `OVERDUE_LOAN_RETURNED`（409，訊息附上預約編號、成員、設備與歸還時間）、通知為 `sending` 或 `sent` 拋出 `OVERDUE_NOTIFICATION_NOT_RESENDABLE`（409，訊息說明目前狀態，`sent` 時附上送出時間）；不建立新的通知（FR-005、FR-007、FR-008、FR-018、SC-004、US2 情境 4、5、8、13、14、Edge Cases「通知送出中或結果不明時借用被歸還」）
  - **Must Read**
    - `contracts/openapi.yaml` → `resendOverdueNotification`、`ResendOverdueNotificationConflict`、`NotFound` — Why：條件式更新的條件、`202` 回傳內容與更新 0 列時的判斷順序與錯誤碼
    - `research.md` → §4 — Why：以單一條件式更新防止兩位管理員同時重送時送出兩次
    - `data/data-model.dbml` → `Table overdue_notifications` 的 `auto_retry_count`、`attempt_count`、`updated_by` — Why：重送時要歸 0、不改與要記錄的欄位
  - **Optional**
    - `ui/plan.md` → §5 `overdue-notifications.html` 的「重送時借用已歸還」「重送時通知已送出成功」 — Why：需要確認錯誤訊息附上哪些資料時
- [ ] T021 [US2] 在 `backend/src/routes/adminRouter.ts`（掛在既有 `requireAuth`、`requireAdmin` 之後）新增 `GET /api/admin/overdue-notifications`（`listOverdueNotifications`）：以既有 `parsePaginationParams` 解析 `page`、`pageSize`（預設 20、上限 100，不合法回 `400` `PAGINATION_INVALID`），以 zod 驗證選填的 `status` 為四種通知狀態之一（不合法回 `400` `VALIDATION_FAILED`），回 `200` 與 `OverdueNotificationPage`；新增 `POST /api/admin/overdue-notifications/:notificationId/resend`（`resendOverdueNotification`）：以 zod 驗證 `notificationId` 為 UUID（不合法回 `400` `VALIDATION_FAILED`），呼叫 T020 後回 `202` 與 `OverdueNotification`；一般成員呼叫時沿用 `requireAdmin` 回 `403` `FORBIDDEN`（FR-003、FR-004、FR-005、FR-019、US2 情境 15、SC-007）
  - **Must Read**
    - `contracts/openapi.yaml` → `listOverdueNotifications`、`resendOverdueNotification` — Why：兩個路由的路徑、查詢與路徑參數、狀態碼與回應
    - `contracts/openapi.yaml` → `PaginationOrQueryInvalid`、`Forbidden` — Why：`400` 兩種錯誤碼的區分與一般成員的 `403`
  - **Optional**
    - `contracts/openapi.yaml` → `OverdueNotificationStatus` — Why：需要確認 `status` 查詢參數允許的值時

### 前端（F1、F2）

- [ ] T022 [P] [US2] 在 `frontend/src/api/client.ts` 以既有 `apiRequest` 新增 `listOverdueNotifications(params?: { status?, page?, pageSize? })`（`GET /admin/overdue-notifications`）與 `resendOverdueNotification(notificationId)`（`POST /admin/overdue-notifications/{notificationId}/resend`），並新增與合約一致的 `OverdueNotification`、`OverdueNotificationPage`、通知狀態與失敗原因型別（FR-003、FR-004、FR-005）
  - **Must Read**
    - `contracts/openapi.yaml` → `listOverdueNotifications`、`resendOverdueNotification` — Why：兩個呼叫的方法、路徑與參數
    - `contracts/openapi.yaml` → `OverdueNotification`、`OverdueNotificationPage`、`OverdueNotificationStatus`、`OverdueNotificationFailureReason` — Why：型別的欄位、可為 null 的欄位與 Enum 值
- [ ] T023 [P] [US2] 在 `frontend/src/text/zh-TW.ts` 新增通知狀態標籤（`sending` 送出中、`sent` 送出成功、`failed` 送出失敗、`unknown` 結果不明）、失敗原因文字（`rate_limited`「Discord 請求太頻繁」、`discord_server_error`「Discord 伺服器錯誤」、`connection_failed`「無法連線」、`webhook_invalid`「通知設定有誤：Webhook 已失效」、`webhook_not_configured`「通知設定有誤：沒有設定」、`message_rejected`「Discord 拒絕訊息內容」）、借用欄「借用中」「已歸還」、篩選選項「全部」、空清單與權限不足文字、「結果不明」重送確認視窗文字，以及 `OVERDUE_LOAN_RETURNED`、`OVERDUE_NOTIFICATION_NOT_RESENDABLE` 的錯誤訊息；兩個新錯誤碼比照既有 `RESCHEDULE_ERROR_MESSAGES`、`EQUIPMENT_STATUS_ERROR_MESSAGES` 另建對應表並接到 `getErrorMessage`，不加進 `ERROR_MESSAGES`（`frontend/tests/unit/zh-TW.test.ts` 斷言 `ERROR_MESSAGES` 有 19 個）（FR-003、FR-006、FR-007、FR-008、FR-019、NFR-002）
  - **Must Read**
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「通知清單」「沒有符合篩選的通知」「沒有逾期通知」「重送結果不明確認視窗」 — Why：狀態標籤、借用欄、空清單與確認視窗的畫面文字
    - `ui/plan.md` → §5 `overdue-notifications.html` 的「送出失敗的通知顯示失敗原因」「Webhook 已失效」「權限不足」 — Why：失敗原因與權限不足的文字
    - `data/data-model.dbml` → `Enum overdue_notification_failure_reason` — Why：六種失敗原因與各自的繁體中文說明
    - `spec.md` → NFR-002 — Why：失敗原因與錯誤提示必須明確說明原因
- [ ] T024 [US2] 在 `frontend/src/views/OverdueNotificationsView.tsx` 實作通知清單與狀態篩選（F1）：開啟時呼叫 `listOverdueNotifications`（分頁做法見 Notes 待確認 4），載入中以灰色骨架與「正在載入逾期通知紀錄…」呈現；清單上方「通知狀態」下拉選單（全部、送出中、送出成功、送出失敗、結果不明）與「依通知建立時間由新到舊排列」，顯示「共 N 則通知」；欄位為設備、借用成員、預約日期與時段、通知狀態、嘗試次數、最後嘗試時間（沒有時顯示「—」）、借用、操作；狀態徽章「送出中」靛藍加轉圈、「送出成功」綠色並顯示送出時間、「送出失敗」紅色並在下方以紅色條顯示「失敗原因：…」、「結果不明」琥珀色；借用欄「借用中」或「已歸還」與歸還時間；只在 `canResend` 為 true 時顯示「重送」，已歸還時操作欄顯示「借用已歸還」灰字；沒有符合篩選時顯示「目前沒有「送出中」的通知」這類文字與「顯示全部通知」；沒有任何通知時顯示「目前沒有逾期通知」；「重新整理」按鈕重新載入清單，載入中改為「重新整理中…」並停用；收到 `403` 時隱藏篩選列與清單，顯示紅框「權限不足」卡片與「切換管理員帳號登入」（FR-003、FR-004、FR-008、FR-019、NFR-002、NFR-003、US2 情境 1～3、9～12、15）
  - **Must Read**
    - `ui/plan.md` → §3.3 A6、A7、A11、A13 — Why：本任務的使用者操作
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「載入中」「通知清單」「篩選送出失敗」「沒有符合篩選的通知」「沒有逾期通知」「重新整理中」「重新整理後」 — Why：各狀態的呈現
    - `ui/plan.md` → §5 `overdue-notifications.html` 的「送出失敗的通知顯示失敗原因」「送出成功的通知」「送出中的通知」「借用已歸還的通知」「逾期好幾天仍未歸還」「權限不足」 — Why：各狀態徽章、失敗原因、已歸還與權限不足的回饋
    - `ui/overdue-notifications.html` → 雛形狀態「載入中」「通知清單」「篩選送出失敗」「沒有符合篩選的通知」 — Why：表格、篩選列與狀態徽章的實際樣子
    - `contracts/openapi.yaml` → `listOverdueNotifications` — Why：呼叫的 API、`canResend` 與 `loanReturned` 的意義
  - **Optional**
    - `ui/plan.md` → §2 — Why：需要確認 720px 以下改為卡片與徽章配色時
- [ ] T025 [P] [US2] 在 `frontend/src/components/ResendUnknownDialog.tsx` 比照既有 `RescheduleDialog.tsx` 的自製對話框寫法實作重送「結果不明」的確認視窗（F2）：標題「重送「結果不明」的通知？」，列出設備編號與名稱、成員姓名、預約日期與時段、最後嘗試時間；琥珀色提醒「請先到 Discord 確認」與「系統上次送出這則通知後沒有收到 Discord 回應，Discord 頻道可能已經收到。請先到 Discord 通知頻道確認沒有收到這則通知再重送，重送可能造成頻道出現兩則相同的通知。」；按鈕「取消」與「已確認沒收到，重送」；置中彈窗，手機寬度改為全螢幕；不使用 `window.confirm` 與對話框套件（FR-006、NFR-002、US2 情境 6、7、Edge Cases「結果不明但 Discord 其實已收到」）
  - **Must Read**
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「重送結果不明確認視窗」 — Why：視窗的標題、內容、提醒文字與按鈕
    - `ui/overdue-notifications.html` → 雛形狀態「重送結果不明確認視窗」 — Why：視窗的實際樣子
    - `research.md` → §7 — Why：沿用既有 `RescheduleDialog.tsx` 寫法、不用 `window.confirm` 與 Radix UI Dialog
  - **Optional**
    - `ui/plan.md` → §2 — Why：需要確認手機寬度改為全螢幕的規則時
- [ ] T026 [US2] 在 `frontend/src/views/OverdueNotificationsView.tsx` 串接重送（F2）：「送出失敗」的「重送」直接呼叫 `resendOverdueNotification`，按鈕改為「重送中…」並停用；「結果不明」的「重送」先開啟 `ResendUnknownDialog`，「取消」時不呼叫 API、通知不變、不顯示橫幅，「已確認沒收到，重送」才呼叫；收到 `202` 時頁頂藍色橫幅「已重新送出 RV-… 的通知，目前為「送出中」。請稍後按「重新整理」查看送出結果。」並重新拉取清單；收到 `409` 時以紅色橫幅顯示 API 的繁體中文訊息並重新拉取清單（FR-005、FR-006、FR-007、FR-008、FR-018、US2 情境 4～8、13、14）
  - **Must Read**
    - `ui/plan.md` → §3.3 A8、A9、A10 — Why：重送與確認視窗的使用者操作
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「重送處理中」「已重送，送出中」 — Why：重送中與重送後的呈現
    - `ui/plan.md` → §5 `overdue-notifications.html` 的「取消重送結果不明的通知」「重送時借用已歸還」「重送時通知已在送出中」「重送時通知已送出成功」 — Why：取消與三種 `409` 的畫面回饋
    - `ui/overdue-notifications.html` → 雛形狀態「重送處理中」「已重送，送出中」 — Why：按鈕與橫幅的實際樣子
    - `contracts/openapi.yaml` → `resendOverdueNotification` — Why：`202` 不等送出結果與 `409` 的錯誤碼
  - **Optional**
    - `research.md` → §7 — Why：需要確認畫面不自動更新、依伺服器回傳的 `canResend` 顯示按鈕時

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 管理員手動執行一次逾期檢查 (Priority: P3)

**Goal**: 管理員在「逾期通知紀錄」頁點擊「立即檢查逾期」，系統立即執行和自動檢查相同的逾期檢查，顯示這次建立了幾則通知或「沒有新的逾期借用」，已有通知的逾期借用不再建立通知。

**Independent Test**: 準備一筆時段已結束、還沒有通知的「借用中」預約，以及一筆已有「送出失敗」通知的逾期借用；以管理員登入點擊「立即檢查逾期」；驗證畫面顯示這次建立 1 則通知、Discord 頻道收到第一筆借用的通知，第二筆借用沒有新增通知；再點擊一次，驗證顯示「沒有新的逾期借用」。

### 資料庫（D2）

> D1 的 `overdue_notifications` 已在 US1 建立，本故事只調整 demo seed 的 D2 預約資料。

- [ ] T027 [US3] 在 `backend/prisma/seed.ts` 確認 T017 之後仍至少保留一筆「昨天」時段、沒有通知的「借用中」逾期借用（例如 `RV-20261109-19`），任何時間執行 demo seed 後都能示範手動檢查；不足時依 T017 的限制補上，並在該筆旁加註解說明供 US3 示範使用（FR-020、US3 情境 6）
  - **Must Read**
    - `spec.md` → FR-020、US3 情境 6 — Why：demo seed 必須包含至少一筆還沒有通知、可以示範手動檢查的逾期借用
    - `research.md` → §8 — Why：以「昨天」的時段建立，避免中午前執行 seed 時沒有逾期借用
  - **Optional**
    - `research.md` → §2 — Why：需要確認自動檢查開啟時會先通知這筆逾期借用、展示前要關閉自動檢查時

### 後端（B3）

- [ ] T028 [US3] 在 `backend/src/routes/adminRouter.ts`（掛在既有 `requireAuth`、`requireAdmin` 之後）新增 `POST /api/admin/overdue-checks`（`runOverdueCheck`）：不需要請求內容，以 `new Date()` 呼叫 T010 的 `runOverdueCheck(now)`，回 `200` 與 `OverdueCheckResult`（`createdCount` 為這次新建立的通知數），不等通知送出；`OVERDUE_AUTO_CHECK_ENABLED` 為 false 時照常執行；一般成員呼叫時沿用 `requireAdmin` 回 `403` `FORBIDDEN`、不建立任何通知（FR-009、FR-010、FR-012、FR-018、FR-019、NFR-001、US3 情境 1～5、Edge Cases「手動檢查與自動檢查同時執行」）
  - **Must Read**
    - `contracts/openapi.yaml` → `runOverdueCheck`、`OverdueCheckResult` — Why：路徑、`200` 回應、`createdCount` 的計算與不等送出結果
    - `research.md` → §4 — Why：手動檢查呼叫和自動檢查相同的 `runOverdueCheck(now)`，`100` 筆以內預估 `< 100ms`
  - **Optional**
    - `contracts/openapi.yaml` → `Forbidden` — Why：需要確認一般成員呼叫時的錯誤碼時

### 前端（F3）

- [ ] T029 [P] [US3] 在 `frontend/src/api/client.ts` 以既有 `apiRequest` 新增 `runOverdueCheck()`（`POST /admin/overdue-checks`），回傳與合約一致的 `OverdueCheckResult` 型別（FR-009、FR-010）
  - **Must Read**
    - `contracts/openapi.yaml` → `runOverdueCheck`、`OverdueCheckResult` — Why：呼叫的方法、路徑與回應型別
- [ ] T030 [P] [US3] 在 `frontend/src/text/zh-TW.ts` 新增「立即檢查逾期」按鈕文字、「檢查中…」、建立數量提示「這次建立 N 則逾期通知」與「沒有新的逾期借用」（FR-010、NFR-002）
  - **Must Read**
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「檢查逾期中」「已建立逾期通知」「沒有新的逾期借用」 — Why：按鈕與橫幅的畫面文字
- [ ] T031 [US3] 在 `frontend/src/views/OverdueNotificationsView.tsx` 的清單標題列右側（「重新整理」旁）加入「立即檢查逾期」（F3）：點擊後按鈕改為「檢查中…」並停用、「重新整理」也停用；呼叫 `runOverdueCheck`，`createdCount` 大於 0 時頁頂綠色橫幅「這次建立 N 則逾期通知」，為 0 時藍色橫幅「沒有新的逾期借用」，然後重新拉取清單；只等 API 回傳建立數量，不等送出結果；沒有任何通知時按鈕照常可用（FR-009、FR-010、FR-012、NFR-001、SC-005、US3 情境 1～3、6）
  - **Must Read**
    - `ui/plan.md` → §3.3 A12 — Why：本任務的使用者操作
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「檢查逾期中」「已建立逾期通知」「沒有新的逾期借用」 — Why：檢查中與兩種結果的呈現
    - `ui/plan.md` → §5 `overdue-notifications.html` 的「手動檢查遇到已有通知的逾期借用」 — Why：建立數量只算新的通知
    - `ui/overdue-notifications.html` → 雛形狀態「沒有新的逾期借用」 — Why：橫幅的實際樣子
    - `contracts/openapi.yaml` → `runOverdueCheck` — Why：`createdCount` 為 0 與大於 0 的顯示文字
  - **Optional**
    - `research.md` → §7 — Why：需要確認「立即檢查逾期」只等 API 回傳、之後重新拉取清單一次時

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T032 [P] 更新 `README.md`：複製 `backend/.env.example` 為 `backend/.env`、以 `npm --prefix backend run discord:sim` 啟動本機 Discord 模擬器與以 `PUT /__sim/mode` 切換 `success`、`rate_limit`、`server_error`、`timeout`、`disconnect`、`not_found` 模式、`npm run db:migrate` 套用本次遷移、`npm run db:seed` 重設展示資料；寫明展示 US3 手動檢查前先在 `.env` 設 `OVERDUE_AUTO_CHECK_ENABLED=false` 並重啟後端，以及關閉期間不符合 FR-001 的例外只用於展示與測試；不寫入任何真實 Webhook 位址（FR-001、FR-020、NFR-003、research §2、research §6）
  - **Must Read**
    - `research.md` → §8 — Why：README 要寫明展示 US3 前關閉自動檢查並重啟後端
    - `research.md` → §6 — Why：模擬器的啟動方式、模式與控制端點
    - `research.md` → §5 — Why：`.env` 的設定項目與不 commit
  - **Optional**
    - `plan.md` → Source Code (repository root) — Why：需要確認 README 要涵蓋的說明項目時
- [ ] T033 以模擬器 `success` 模式與 `OVERDUE_AUTO_CHECK_ENABLED=true` 啟動後端，建立一筆時段即將結束的「借用中」預約（或在測試資料庫以固定的 `now` 依序呼叫 `runOverdueCheck(now)`、`dispatchDueNotifications(now)`），記錄時段結束時間與 `GET /__sim/messages` 收到該通知的時間，確認差距在 10 分鐘內，且之後的檢查不再送出第二則（SC-001、SC-002、FR-001）
  - **Must Read**
    - `spec.md` → SC-001 — Why：時段結束後 10 分鐘內送出第一則通知的量測標準
    - `research.md` → §2 — Why：最差情況約 71 秒的估算依據，以及 `now` 由應用程式傳入
- [ ] T034 在測試資料庫建立數筆時段已結束、沒有通知的逾期借用，以 `Promise.all` 同時執行手動檢查（`POST /api/admin/overdue-checks`）與 `runOverdueCheck(now)`，重複 20 輪，每輪確認每筆借用只有 1 則通知、`GET /__sim/messages` 每筆只收到 1 則；再同時送出兩個 `POST /api/admin/overdue-notifications/:notificationId/resend`，確認一個回 `202`、另一個回 `409` `OVERDUE_NOTIFICATION_NOT_RESENDABLE`，模擬器只收到 1 次（SC-002、FR-012、FR-018、US2 情境 14、US3 情境 4）
  - **Must Read**
    - `spec.md` → SC-002、FR-018 — Why：同時檢查與同時重送的通過標準
    - `research.md` → §8 — Why：並發驗證重複 20 輪與模擬器訊息計數的做法
- [ ] T035 以 `PUT /__sim/mode` 依序切換 `rate_limit`（`failTimes = 1`）、`rate_limit`（`retryAfterSeconds = 120`）、`server_error`（連續 4 次）、`not_found`、`timeout`、`disconnect`，以及停止模擬器後再啟動，確認通知分別變成「送出成功」、「送出失敗」（`rate_limited`）、「送出失敗」（`discord_server_error`，`attempt_count` 為 4）、「送出失敗」（`webhook_invalid`，不自動重試）、「結果不明」、「結果不明」、「送出成功」；「結果不明」的通知之後 `attempt_count` 不再增加（自動重送 0 次）；另在請求送出後、回應前停止後端再啟動，確認通知變成「結果不明」（SC-003、FR-014、FR-015、FR-016、FR-021、US1 情境 5～8、11～15）
  - **Must Read**
    - `spec.md` → SC-003 — Why：自動重試內恢復時 100% 送出成功、結果不明自動重送 0 次的標準
    - `research.md` → §6 — Why：每個情境對應的模擬器模式與 `failTimes`、`retryAfterSeconds` 設定
- [ ] T036 在 Discord 正常時對 demo seed 的「送出失敗」通知重送，確認同一則通知變成「送出成功」、`attempt_count` 增加、`overdue_notifications` 的總數不變（SC-004、FR-005、US2 情境 5）
  - **Must Read**
    - `spec.md` → SC-004 — Why：重送後通知總數不增加的標準
- [ ] T037 建立 100 筆時段已結束、沒有通知的逾期借用，以管理員呼叫 `POST /api/admin/overdue-checks` 量測回應時間 `< 2 秒`，並在畫面上量測從點擊「立即檢查逾期」到顯示建立數量 `< 2 秒`（NFR-001、SC-005）
  - **Must Read**
    - `spec.md` → NFR-001、SC-005 — Why：100 筆以內低於 2 秒的量測標準
  - **Optional**
    - `research.md` → §7 — Why：需要確認畫面端包含重新拉取清單一次的預估時
- [ ] T038 以含 token 的 Webhook 位址跑完 T033～T037 後，搜尋後端所有 `console.log`、`console.warn`、`console.error` 的輸出、三個新 API 的回應內容、錯誤訊息、`overdue_notifications` 全部資料列與畫面，Webhook 位址的 token 出現次數必須為 0；並確認 `DISCORD_WEBHOOK_URL` 格式錯誤時 log 只寫「DISCORD_WEBHOOK_URL 沒有設定或格式不正確」（SC-006、NFR-003）
  - **Must Read**
    - `spec.md` → SC-006、NFR-003 — Why：Webhook 位址不得出現的位置與次數標準
    - `research.md` → §5 — Why：log 規則與只印主機名稱
- [ ] T039 以一般成員帳號呼叫 `GET /api/admin/overdue-notifications`、`POST /api/admin/overdue-notifications/:notificationId/resend`、`POST /api/admin/overdue-checks`，確認 100% 回 `403` `FORBIDDEN` 且沒有建立或送出通知；再執行 `npm run test:backend`、`npm run test:frontend`、`npm run test:e2e`，確認前五版既有測試 100% 通過並記錄通過率（SC-007、FR-019、FR-020）
  - **Must Read**
    - `spec.md` → SC-007 — Why：一般成員被拒絕與前五版回歸的通過標準
    - `contracts/openapi.yaml` → `Forbidden` — Why：一般成員呼叫管理員操作時的錯誤碼
- [ ] T040 在 `backend/` 與 `frontend/` 執行 `npm run check`（`tsc --noEmit`、ESLint 10、`prettier --check`），修正所有錯誤（research §7）
  - **Must Read**
    - `techstack.md` → 技術堆疊總覽 — Why：靜態檢查與格式化使用的工具
- [ ] T041 依 `README.md` 執行 `npm run db:seed` 後，以管理員與一般成員各一個瀏覽器視窗走完 US1～US3 的 Independent Test，並在 360px 與 1120px 寬度、Light Mode 與 Dark Mode 檢查逾期通知紀錄頁都能完整操作（US1、US2、US3、NFR-002）
  - **Must Read**
    - `spec.md` → US1、US2、US3 的 Independent Test — Why：手動驗證的步驟
    - `ui/plan.md` → §2 — Why：版面與雙主題的檢查標準
  - **Optional**
    - `spec.md` → US2 情境 16、US3 情境 6 — Why：需要確認 demo seed 重設後的預期展示結果時

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US2、US3 都需要 US1 的 `overdue_notifications`（T005、T006）；US2 的重送與 US3 的手動檢查建立的通知，都由 US1 的送出程序（T012、T013）送出，US3 的 `POST /api/admin/overdue-checks` 直接呼叫 US1 的 `runOverdueCheck(now)`（T010），因此建議依 P1 → P2 → P3 循序進行
  - 同一個故事內，前端與後端任務可以平行（不同檔案）
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: 需要 US1 的 `overdue_notifications`（T005、T006）才能寫入 demo seed 與查詢，重送後的送出需要 US1 的 T012、T013；`overdueNotificationService.ts`（T019、T020）擴充 T010、T011
- **User Story 3 (P3)**: 需要 US1 的 `runOverdueCheck(now)`（T010）與送出程序（T012、T013），以及 US2 的 `OverdueNotificationsView.tsx` 清單（T024）與 `adminRouter.ts` 新路由（T021）；`seed.ts`（T027）接在 T017 之後

### Within Each User Story

- `schema.prisma` → 遷移 → 設定與 Discord 呼叫 → service → 排程與 router → 前端 `client.ts`、`zh-TW.ts` → 元件與 view
- `overdueNotificationService.ts`（T010、T011、T019、T020）、`overdueScheduler.ts`（T012、T013）、`adminRouter.ts`（T021、T028）、`OverdueNotificationsView.tsx`（T004、T024、T026、T031）、`client.ts`（T022、T029）、`zh-TW.ts`（T003、T023、T030）、`seed.ts`（T017、T027）由多個任務修改，這些任務要依編號循序進行
- Story complete before moving to next priority

### Parallel Opportunities

- Setup：T001 可與 T002 同時進行
- Foundational：T003 完成後進行 T004
- US1：T008、T015 可與 T005～T007 同時進行；T009 完成後才進行 T012
- US2：T022、T023、T025 可彼此平行，並可與 T018～T021（後端）同時進行
- US3：T029、T030 可彼此平行，並可與 T028 同時進行
- Polish：T032 可與 T033～T039 同時進行；T033～T038 共用測試資料庫與模擬器，依序進行

---

## Parallel Example: User Story 1

```bash
# 資料庫與周邊模組同時開工：
Task: "新增 overdue_notifications 與兩個 Enum in backend/prisma/schema.prisma"
Task: "以 zod 驗證三個設定 in backend/src/config/notificationConfig.ts"
Task: "實作本機 Discord Webhook 模擬器 in backend/scripts/discordWebhookSimulator.ts"
```

## Parallel Example: User Story 2

```bash
Task: "新增 listOverdueNotifications 與 resendOverdueNotification in frontend/src/api/client.ts"
Task: "新增通知狀態、失敗原因與確認視窗文字 in frontend/src/text/zh-TW.ts"
Task: "實作重送結果不明的確認視窗 in frontend/src/components/ResendUnknownDialog.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "新增 POST /api/admin/overdue-checks in backend/src/routes/adminRouter.ts"
Task: "新增 runOverdueCheck in frontend/src/api/client.ts"
Task: "新增立即檢查逾期的文字 in frontend/src/text/zh-TW.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 以 US1 的 Independent Test，搭配本機 Discord 模擬器的 `success`、`server_error`、`timeout` 模式，驗證自動通知只發一則、失敗與結果不明的標示
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP：設備逾期未還時，管理員的 Discord 頻道自動收到通知)
3. Add User Story 2 → Test independently → Deploy/Demo（管理員可以查看每則通知的送出結果並重送失敗的通知）
4. Add User Story 3 → Test independently → Deploy/Demo（管理員可以立即執行一次逾期檢查）
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done，每個故事依序進行，故事內分工：
   - Developer A：資料庫與後端（`schema.prisma`、遷移、`discordWebhookClient.ts`、`overdueNotificationService.ts`、`overdueScheduler.ts`、`adminRouter.ts`、`seed.ts`）
   - Developer B：模擬器與前端（`discordWebhookSimulator.ts`、`client.ts`、`zh-TW.ts`、`ResendUnknownDialog.tsx`、`OverdueNotificationsView.tsx`）
3. 雙方以 `contracts/openapi.yaml` 與 `data/data-model.dbml` 為介面約定，故事完成後一起驗證

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- 本檔沒有新增 plan.md Source Code 以外的檔案；T006 的遷移檔放在 Source Code 列出的 `backend/prisma/migrations/`
- 待確認 1：plan.md 系統介面盤點了排程 S1 逾期自動檢查排程、S2 通知送出與自動重試程序、S3 系統恢復運作時中斷通知的處理，但 contracts、data、ui 沒有對應的排程規格（plan.md 的 Wave 3 沒有 Planner 可委派，整個 Wave 跳過）；目前只有 research §2、§3 的文字決策與 data-model 的 `overdue_notifications` 欄位說明。受影響的任務：T010、T012、T013。補齊前的暫行做法：依 research §2 的 SQL 與執行時機、research §3 的結果分類與退避間隔實作，狀態轉換以 data-model 的 `Table overdue_notifications` 與 `Enum overdue_notification_status` 為準；若之後補上排程規格，以規格為準修改這三個任務
- 待確認 2：plan.md 系統介面盤點了通知服務 N1 Discord Webhook 逾期通知送出，但 contracts 沒有描述 Discord 請求與回應的合約（例如 AsyncAPI 或外部 API 規格），也沒有定義通知文字的版面與「逾期多久」的單位與格式；目前只有 spec FR-013 的五項內容與 research §3 的請求格式、結果分類表。受影響的任務：T009、T011。補齊前的暫行做法：T009 依 research §3 實作；T011 每項內容各一行，「逾期多久」以送出當下的 `now` 計算，以「已逾期 X 天 Y 小時 Z 分鐘」表示、省略為 0 的單位；若之後補上通知內容規格，只需修改 T011
- 待確認 3：plan.md 系統介面盤點了通知服務 N2 本機 Discord Webhook 模擬器，但 contracts 沒有 Webhook 端點與 `/__sim/*` 控制端點的合約；目前只有 research §6 的模式表與控制端點說明。受影響的任務：T015、T032、T033～T035。補齊前的暫行做法：依 research §6 實作；控制端點的錯誤回應（例如未知模式）回 `400` 與一般 JSON 訊息，不加入 `contracts/openapi.yaml` 的錯誤碼
- 待確認 4：`contracts/openapi.yaml` 的 `listOverdueNotifications` 有 `page`、`pageSize`（預設 20、上限 100）並回傳 `OverdueNotificationPage`，但 `ui/plan.md` 與 `ui/overdue-notifications.html` 沒有分頁控制，只顯示「共 N 則通知」；通知超過一頁時畫面看不到之後的通知（system-analysis 委派時 `api-plan` 已回報，建議由 `ui-plan` 補分頁設計）。受影響的任務：T024。補齊前的暫行做法：前端以 `page=1`、`pageSize=100` 呼叫，「共 N 則通知」顯示 `totalItems`；`totalPages` 大於 1 時在清單下方顯示一行「只顯示最新 100 則」的提示，不自行設計分頁控制
- 待確認 5：`ui/plan.md` §1 寫「`index.html` 只保留登入與登出，並把管理員登入後的入口改到逾期通知紀錄」，§3.1 管理員登入成功後提供「前往逾期通知紀錄」；但 plan.md Source Code 對 `App.tsx` 只寫「本次新增「逾期通知紀錄」管理員頁籤」，沒有改變管理員登入後的預設畫面，而既有 `e2e/equipment-maintenance.spec.ts` 依賴 007 的「管理員登入後先進入「設備狀態管理」」。受影響的任務：T003。補齊前的暫行做法：管理員登入後的預設畫面維持「設備狀態管理」，只新增頁籤；若決定改成登入後進入逾期通知紀錄，要在 US2 的前端組補上更新 `e2e/equipment-maintenance.spec.ts`、`e2e/equipment-loan.spec.ts`、`e2e/reschedule.spec.ts` 中管理員登入後步驟的任務
