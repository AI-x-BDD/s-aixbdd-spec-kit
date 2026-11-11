---

description: "Task list for 逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查 implementation"
---

# Tasks: 逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查 (Overdue Discord Notification)

**Input**: Design documents from `/specs/008-overdue-discord-notification/`（依下方 Reference Loading Contract 按任務載入）

**Tests**: spec.md 沒有明確要求撰寫自動化測試或 TDD，因此各使用者故事不為新功能產生測試任務。Setup 不另裝測試工具，沿用前一版已安裝的 Vitest 5、Supertest 7 與 Playwright 1.65（research §8）。已用本次會改動的檔案、函式與識別字（`seedDatabase`、`ERROR_MESSAGES`、管理員登入後的 `equipment-status-table`、`nav-*`、`playwright.config.ts` 的 `webServer`、後端 `dev` 指令、`prisma/migrations`）搜尋既有測試並讀過命中段落：T015 的 demo seed 與 T020 的錯誤碼說明在任務內避開既有測試依賴的行為，不需要改測試；T013 讓後端 `dev` 啟動排程，影響 Playwright 啟動的後端，在同一組以 T014 更新 `playwright.config.ts`。Success Criteria 的量測與前版回歸在 Polish 以驗證任務處理（SC-001～SC-007）。

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
   - `spec.md`：US 情境、FR／NFR／SC 編號、Edge Cases 項目
   - `research.md`、`ui/plan.md`：章節編號（§），以及表格中的畫面、狀態或操作編號
   - `notification/plan.md`：章節編號（§），以及表格與段落中的 TR、NS、UC、UD 編號
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

- **Web app**：沿用 `apps/equipment-loan/` 的 `backend/`、`frontend/` 與 `e2e/`（依 plan.md 的 Structure Decision）；任務中的路徑都相對於 `apps/equipment-loan/`
- 排程放在 `backend/src/jobs/`、Discord Webhook 呼叫放在 `backend/src/integrations/`、設定驗證放在 `backend/src/config/`、本機模擬器放在 `backend/scripts/`；不新增頂層目錄、不新增套件（techstack.md「本次開發不引入的技術」）

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 在 `backend/package.json` 的 scripts 把 `dev` 改為 `tsx watch --env-file-if-exists=.env src/server.ts`、`db:seed` 改為 `tsx --env-file-if-exists=.env prisma/seed.ts`，並新增 `discord:sim` 以 `tsx` 執行 `scripts/discordWebhookSimulator.ts`；不新增任何相依套件（research §5、§6）
  - **Must Read**
    - `research.md` → §5 — Why：以 `--env-file-if-exists=.env` 載入 `.env` 的原因與 `dev`、`db:seed` 的新寫法
    - `research.md` → §6 — Why：`discord:sim` 指令執行的模擬器檔案
    - `techstack.md` → 本次開發不引入的技術 — Why：不得安裝的 dotenv、axios、`undici`、`node-cron` 等套件
- [X] T002 [P] 在 `backend/.env.example` 新增 `DISCORD_WEBHOOK_URL`（值為 `http://127.0.0.1:4010/api/webhooks/000000000000000000/simulator-token`）、`OVERDUE_AUTO_CHECK_ENABLED`（`true`）、`OVERDUE_CHECK_INTERVAL_SECONDS`（`60`），保留既有 `DATABASE_URL`、`PORT`；確認 `.gitignore` 已忽略 `.env`（research §5、NFR-003）
  - **Must Read**
    - `research.md` → §5 — Why：三個設定的名稱、預設值與 `.env` 不 commit 的規定
  - **Optional**
    - `notification/plan.md` → §5.5 — Why：需要確認模擬器預設位址與連接埠時

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 資料庫（D1–D2 共用）

- [ ] T003 在 `backend/prisma/schema.prisma` 新增 `enum overdue_notification_status`（`sending`、`sent`、`failed`、`unknown`）、`enum overdue_notification_failure_reason`（`rate_limited`、`discord_server_error`、`connection_failed`、`webhook_invalid`、`webhook_not_configured`、`message_rejected`），以及 `model overdue_notifications`：`id`（`Uuid`）、`reservation_id`（唯一，外鍵指向 `reservations.id`）、`status`（預設 `sending`）、`attempt_count` 與 `auto_retry_count`（`Int`，預設 0）、`next_attempt_at`、`last_attempted_at`、`sent_at`（`Timestamptz(6)`，可為空）、`failure_reason`（可為空）、`discord_message_id`（`Text`，可為空）、`created_at`、`updated_at`、`updated_by`、`deleted_at`；索引 `idx_overdue_notifications_status_created`（`status, created_at`）與 `idx_overdue_notifications_created`（`created_at`）；`reservations` 只加反向關聯欄位，不改任何既有欄位、Enum 與索引（FR-012、FR-017、FR-020、FR-021、NFR-003）
  - **Must Read**
    - `data/data-model.dbml` → `Table overdue_notifications` — Why：欄位、預設值、可為空的條件、唯一約束與三個索引
    - `data/data-model.dbml` → `Enum overdue_notification_status`、`Enum overdue_notification_failure_reason` — Why：兩個 Enum 的值與每個值代表的情況
    - `data/data-model.dbml` → `Ref: reservations.id - overdue_notifications.reservation_id` — Why：通知與預約一對一的關聯
    - `research.md` → §1 — Why：`discord_message_id` 用 `Text` 而不用 `BigInt`、只新增不修改既有資料表
- [ ] T004 在 `backend/` 以 `prisma migrate dev --create-only` 產生 008 的增量遷移到 `backend/prisma/migrations/`，檢查並修改 `migration.sql`：唯一約束命名為 `uq_overdue_notifications_reservation`；手動加上部分索引 `idx_overdue_notifications_due`（`next_attempt_at`，`WHERE status = 'sending'`）；SQL 只能有建立兩個 Enum、建立 `overdue_notifications`、建立索引與外鍵的語句，不得有修改或改寫 003～007 既有資料表與資料列的語句；確認後執行 `npm run db:migrate` 套用（FR-018、FR-020、US1 情境 10）
  - **Must Read**
    - `research.md` → §1 — Why：以 `--create-only` 產生、檢查 SQL 後套用，以及部分索引與唯一約束的名稱
    - `data/data-model.dbml` → `Table overdue_notifications` 的 `idx_overdue_notifications_due` — Why：部分索引的欄位與 `WHERE status = 'sending'` 條件
  - **Optional**
    - `spec.md` → FR-020 — Why：需要確認無損遷移的範圍時
- [ ] T005 在 `backend/prisma/seed.ts` 的 `seedDatabase()` 開頭，於 `prisma.reservations.deleteMany()` 之前加上 `prisma.overdue_notifications.deleteMany()`，讓已有通知時重設 demo seed 不會被外鍵擋下；既有 007 範例資料不變（FR-020）
  - **Must Read**
    - `research.md` → §8 — Why：demo seed 先清除 `overdue_notifications` 再清除 `reservations`
    - `data/data-model.dbml` → `Ref: reservations.id - overdue_notifications.reservation_id` — Why：清除順序依據的外鍵

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 設備逾期未還時，系統自動發 Discord 通知提醒管理員 (Priority: P1) 🎯 MVP

**Goal**: 系統自動找出逾期借用，在時段結束後 10 分鐘內把通知送到 Discord；每筆逾期借用只通知一次，暫時失敗時依規則自動重試，等不到回應或送出後中斷時標成「結果不明」，系統恢復運作時正確處理中斷的通知。

**Independent Test**: 準備一筆今天下午時段（`13:00–17:00`）「借用中」的預約，並以 `npm --prefix backend run discord:sim` 啟動本機模擬器；`17:00` 後等待自動檢查，確認 `17:10` 前模擬器收到一則寫出設備、成員姓名、預約日期與時段、逾期多久的通知，之後的自動檢查不再送第二則；再把模擬器切到 `server_error` 與 `timeout`，確認通知分別標成「送出失敗」與「結果不明」。

### 後端（S1–S3、N1–N2）

> D1 的 `overdue_notifications` 已在 Foundational 建立，本故事沒有資料庫任務。

- [ ] T006 [P] [US1] 在 `backend/src/config/notificationConfig.ts` 以 zod 4 驗證 `DISCORD_WEBHOOK_URL`（必須是 `http` 或 `https` 位址）、`OVERDUE_AUTO_CHECK_ENABLED`（預設 `true`）、`OVERDUE_CHECK_INTERVAL_SECONDS`（預設 `60`，允許 `10`～`300`）；位址空白或格式錯誤時視為沒有設定，後端照常啟動，log 只寫「DISCORD_WEBHOOK_URL 沒有設定或格式不正確」，不寫輸入值；Webhook 位址只提供給 `discordWebhookClient`，其他模組只拿到 `isWebhookConfigured`；設定要能讀到整合測試啟動模擬器後才設定的環境變數（research §5、§8、FR-015、NFR-003）
  - **Must Read**
    - `research.md` → §5 — Why：三個設定的驗證規則、沒有設定時的處理與 log 規則
    - `notification/plan.md` → §6 — Why：「Webhook 位址設定錯誤」的 log 不得記錄輸入值
    - `spec.md` → NFR-003 — Why：Webhook 位址不得出現在畫面、紀錄與系統紀錄檔
  - **Optional**
    - `research.md` → §8 — Why：需要確認整合測試如何把 `DISCORD_WEBHOOK_URL` 指向測試程序內的模擬器時
- [ ] T007 [US1] 在 `backend/src/integrations/discordWebhookClient.ts` 實作 `discordWebhookClient.send(content)`：以 `new URL(webhookUrl)` 加上 `searchParams.set("wait", "true")`，`POST`、`Content-Type: application/json`，內容 `{ "content": <通知文字>, "allowed_mentions": { "parse": [] } }`，`signal: AbortSignal.timeout(10_000)` 涵蓋等待標頭與讀取回應內容；沒有設定 Webhook 位址時不送出請求，直接回傳 `webhook_not_configured`；依 notification/plan.md §3 把結果分成成功（`200` 且有 `id`）、可重試（`429` 等待 60 秒以內、`5xx`、送出前連線失敗的 `cause.code` 清單）、不可重試（`429` 等待超過 60 秒、`401`／`403`／`404` 為 `webhook_invalid`、其他 `4xx` 為 `message_rejected`）與結果不明（`TimeoutError`、送出後連線中斷、其他 `fetch` 錯誤、`200` 沒有 `id`、`204`）；等待秒數先讀 `Retry-After` 標頭、再讀 `retry_after`，都沒有時回報使用退避間隔；每次收到回應時回報 `X-RateLimit-Remaining` 與 `X-RateLimit-Reset-After`；不向外拋出原始錯誤，log 只寫狀態碼、錯誤代碼與主機名稱（FR-014、FR-015、FR-016、FR-017、NFR-003、US1 情境 5～8、11、12、15）
  - **Must Read**
    - `notification/plan.md` → §3 — Why：每種回應的分類、是否自動重試、等待秒數來源與最終狀態
    - `notification/plan.md` → §5.4 — Why：請求格式、10 秒逾時、沒有設定時不送出，以及速率限制標頭的回報
    - `research.md` → §3 — Why：送出前連線失敗的 `cause.code` 清單，以及只在確定沒收到時重試的理由
    - `notification/plan.md` → §6 — Why：送出結果 log 可寫與不得寫的內容
  - **Optional**
    - `notification/plan.md` → §4 — Why：需要確認誤判送出前或送出後連線失敗的影響時
- [ ] T008 [P] [US1] 在 `backend/scripts/discordWebhookSimulator.ts` 以 `node:http` 實作本機 Discord Webhook 模擬器，匯出 `createDiscordWebhookSimulator()`（整合測試以連接埠 `0` 啟動），直接執行時監聽 `127.0.0.1:4010`（`DISCORD_SIM_PORT` 可改）並接受 `--mode=<模式>`：`POST /api/webhooks/:webhookId/:token` 依 `success`、`rate_limit`、`server_error`、`timeout`、`disconnect`、`not_found` 六種模式回應，每次回應附 `X-RateLimit-Remaining` 與 `X-RateLimit-Reset-After`；`failTimes` 用完後改回 `success`；控制端點 `GET /__sim/state`、`PUT /__sim/mode`（設定不合法時回 `400` `{"error": "invalid mode settings"}`，模式不變）、`GET /__sim/messages`、`DELETE /__sim/messages`，其他路徑回 `404` `{"error": "not found"}`；log 只寫模式與收到的訊息數，不寫請求路徑；無法重現的回應分類不自創模式（見 Notes 待確認 2）（FR-014、FR-015、FR-016、NFR-003、SC-002、SC-003）
  - **Must Read**
    - `notification/plan.md` → §5.5 — Why：啟動方式、控制操作的請求與錯誤回應、每個模式的回應與是否記錄訊息
    - `research.md` → §6 — Why：以 `node:http` 自寫、測試與展示共用同一份程式
  - **Optional**
    - `notification/plan.md` → §8 UC2 — Why：需要確認哪幾類回應模擬器無法重現時
- [ ] T009 [US1] 在 `backend/src/services/overdueNotificationService.ts` 實作 `runOverdueCheck(now)`：以 `tx.$queryRaw` 執行一條 `INSERT INTO overdue_notifications (...) SELECT r.id, ... FROM reservations r JOIN time_slots s ON s.id = r.slot_id WHERE r.status = 'checked_out' AND r.deleted_at IS NULL AND ((r.reservation_date + s.end_time::time) AT TIME ZONE 'Asia/Taipei') < $now ON CONFLICT (reservation_id) DO NOTHING RETURNING id`，新通知 `status = 'sending'`、`attempt_count = 0`、`auto_retry_count = 0`、`next_attempt_at = $now`；`now` 由呼叫端傳入，SQL 不使用資料庫的 `now()`；不讀 `equipments.status`；回傳的列數就是這次新建立的通知數（FR-001、FR-009、FR-011、FR-012、FR-018、US1 情境 1～4、Edge Cases 時段結束後、檢查前已歸還）
  - **Must Read**
    - `notification/plan.md` → §5.1 — Why：檢查語句、寫入欄位、時間來源與重疊執行的處理
    - `notification/plan.md` → §1 的 TR1、TR2 — Why：逾期判定條件與讀取的欄位
    - `notification/plan.md` → §2 — Why：建立通知時第一列轉換的寫入欄位
    - `research.md` → §2 — Why：`runOverdueCheck(now)` 由自動檢查與手動檢查共用
  - **Optional**
    - `spec.md` → Edge Cases「送修或停用設備的逾期借用」 — Why：需要確認逾期判定為何不看設備狀態時
- [ ] T010 [US1] 在 `backend/src/services/overdueNotificationService.ts` 實作通知內容的組字函式，依送出當下的 `now` 產生四行文字：「【逾期未還】設備編號 設備名稱」、「借用成員：成員姓名」、「預約時段：YYYY-MM-DD（星期）時段名稱 HH:mm–HH:mm」、「已逾期 N 天 N 小時 N 分鐘」；日期與星期依 `Asia/Taipei` 換算，沿用 `backend/src/utils/taipeiTime.ts` 的時段時間判斷；分鐘無條件捨去，只省略前面為 0 的單位，不到 1 分鐘寫「已逾期不到 1 分鐘」；全文 2000 字以內（FR-013、NFR-002、US1 情境 1）
  - **Must Read**
    - `notification/plan.md` → §5.4 — Why：四行版面、欄位來源、「已逾期多久」寫法對照與填值範例
    - `notification/plan.md` → §7 NS22 — Why：逾期時間寫法的六個對照值
  - **Optional**
    - `notification/plan.md` → §8 UD1 — Why：需要確認「已逾期多久」格式的使用者決定時
- [ ] T011 [US1] 在 `backend/src/jobs/overdueScheduler.ts` 實作並匯出 `recoverInterruptedNotifications(now)` 與 `dispatchDueNotifications(now)`：恢復處理執行 `UPDATE overdue_notifications SET status = 'unknown', updated_at = $now WHERE status = 'sending' AND next_attempt_at IS NULL`；送出程序一次處理一則，以 `UPDATE overdue_notifications SET next_attempt_at = NULL, attempt_count = attempt_count + 1, last_attempted_at = $now WHERE id = (SELECT id FROM overdue_notifications WHERE status = 'sending' AND next_attempt_at <= $now ORDER BY next_attempt_at LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING ...` 領取並提交，讀取設備、成員與時段資料，以 T010 組出內容，呼叫 `discordWebhookClient.send(content)`，依 notification/plan.md §2 轉換表更新同一列（成功寫 `sent_at`、`discord_message_id`；可重試且 `auto_retry_count` 小於 3 時設 `next_attempt_at = now + 等待秒數`、`auto_retry_count + 1`，退避 2、4、8 秒；已達 3 或不可重試時標 `failed` 與 `failure_reason`；結果不明標 `unknown`、`failure_reason` 為空）；不檢查借用是否已歸還；`X-RateLimit-Remaining` 為 `0` 時暫停到 `X-RateLimit-Reset-After` 秒之後才領取下一則；只寫 `overdue_notifications`，`updated_by` 為空（FR-005、FR-014、FR-015、FR-016、FR-017、FR-018、FR-021、US1 情境 5～8、11～15、Edge Cases 自動重試時又等不到回應或連線中斷）
  - **Must Read**
    - `notification/plan.md` → §5.2 — Why：送出程序的處理步驟、領取語句、借用已歸還照常送出與速率限制暫停
    - `notification/plan.md` → §5.3 — Why：恢復處理的更新語句與只在啟動時執行一次
    - `notification/plan.md` → §2 — Why：每個事件的狀態轉換與要寫入的欄位，以及系統恢復運作時各狀態的處理
    - `notification/plan.md` → §3 — Why：重試上限、等待秒數與退避間隔，以及每種分類的最終狀態與原因
    - `data/data-model.dbml` → `Table overdue_notifications` 的 `next_attempt_at`、`auto_retry_count` — Why：以 `next_attempt_at` 是否為空區分等待自動重試與等待 Discord 回應
  - **Optional**
    - `notification/plan.md` → §8 UD2 — Why：需要確認送出中時借用被歸還為何照常送出時
    - `notification/plan.md` → §4 — Why：需要確認兩個領取者同時執行時的防護時
- [ ] T012 [US1] 在 `backend/src/jobs/overdueScheduler.ts` 實作並匯出 `start()`：先執行一次 `recoverInterruptedNotifications(now)`，完成後才啟動檢查與送出；`OVERDUE_AUTO_CHECK_ENABLED` 為 `true` 時立即執行一次 `runOverdueCheck(now)`，之後以 `setTimeout` 串接每 `OVERDUE_CHECK_INTERVAL_SECONDS` 秒執行一次，上一次結束後才排下一次；為 `false` 時不排自動檢查；`dispatchDueNotifications(now)` 不受開關影響，每 1 秒執行一次，上一次還沒結束時跳過這一次（FR-001、FR-002、FR-021、SC-001、US1 情境 9、Edge Cases 系統停止運作期間逾期）
  - **Must Read**
    - `notification/plan.md` → §5.1 — Why：`start()` 的啟動順序、自動檢查開關與間隔、`setTimeout` 串接
    - `notification/plan.md` → §5.2 — Why：送出程序每 1 秒執行、不受開關影響、重疊時跳過
    - `research.md` → §2 — Why：開關只關閉自動逾期檢查，恢復處理與送出程序照常執行
  - **Optional**
    - `notification/plan.md` → §7 NS18 — Why：需要確認停機期間才逾期的借用在啟動後如何被補發時
- [ ] T013 [US1] 在 `backend/src/server.ts` 於 `app.listen` 之後呼叫 `overdueScheduler` 的 `start()`；`backend/src/app.ts` 不啟動排程，Supertest 匯入 `app` 時不會跑排程（FR-001、FR-002、research §2）
  - **Must Read**
    - `research.md` → §2 — Why：排程由 `src/server.ts` 啟動、`src/app.ts` 不啟動的理由
    - `plan.md` → Source Code (repository root) — Why：`server.ts` 與 `app.ts` 本次的分工
- [ ] T014 [US1] 更新 `playwright.config.ts` 的 `webServer`：T013 讓 `npm --prefix backend run dev` 啟動排程，自動檢查會為 demo seed 的逾期借用建立並送出通知；後端那一項加上 `env`，設定 `OVERDUE_AUTO_CHECK_ENABLED=false` 與指向模擬器的 `DISCORD_WEBHOOK_URL`，並新增一項以 `npm --prefix backend run discord:sim` 啟動模擬器（連接埠 `4010`）；既有三支 `e2e/*.spec.ts` 不修改（FR-020、SC-007）
  - **Must Read**
    - `research.md` → §8 — Why：Playwright 啟動後端時關閉自動檢查並啟動模擬器
    - `plan.md` → Source Code (repository root) — Why：`playwright.config.ts` 本次要加的設定
  - **Optional**
    - `notification/plan.md` → §5.5 — Why：需要確認模擬器的指令、連接埠與 `.env.example` 位址時

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 管理員查看每則通知有沒有送出成功，重送失敗的通知 (Priority: P2)

**Goal**: 管理員在「逾期通知紀錄」頁查看每則通知的內容與狀態、依狀態篩選，對「送出失敗」直接重送、對「結果不明」確認後重送，重送後立即看到「送出中」，重新整理看到結果。

**Independent Test**: 執行 demo seed 後以管理員登入開啟「逾期通知紀錄」頁，確認「送出成功」、「送出失敗」、「結果不明」三則通知的內容與狀態；在模擬器為 `success` 時重送「送出失敗」的通知，確認立即顯示「送出中」，重新整理後同一則通知變成「送出成功」、嘗試次數增加且模擬器收到通知；對「結果不明」的通知點擊「重送」，確認先出現確認視窗。

### 資料庫（D1–D2）

- [ ] T015 [US2] 在 `backend/prisma/seed.ts` 擴充 demo seed：依執行當下的 `Asia/Taipei` 日期，以「昨天」的上午、下午時段建立 `checked_out` 的逾期借用，其中 3 筆各配一則 `overdue_notifications`：`sent`（`sent_at`、假的 `discord_message_id`、`last_attempted_at`、`attempt_count` 至少 1）、`failed`（`failure_reason`，例如 `discord_server_error`，`attempt_count = 4`、`auto_retry_count = 3`）、`unknown`（`failure_reason` 為空）；三則的 `next_attempt_at` 都為空；另外至少 1 筆逾期借用沒有通知，供手動檢查示範；保留 007 的全部範例資料。為了不改變既有測試依賴的資料：新借用的成員只用陳冠廷（`backend/tests/integration/api.test.ts` 斷言林雅婷借用中只有 1 筆、`e2e/equipment-loan.spec.ts` 斷言「借用中 2 件」），設備只用 `EQ-101`～`EQ-103`（`e2e/equipment-maintenance.spec.ts` 會把 `EQ-104` 設為送修與停用，`EQ-105`、`EQ-106` 不是可用狀態），並避開昨天晚間已被占用的 `EQ-102`、`EQ-103`（`uq_reservations_active_slot`）；`reservation_no` 沿用既有 `RV-<日期>-<序號>` 格式（FR-020、US2 情境 16、US3 情境 6）
  - **Must Read**
    - `research.md` → §8 — Why：demo seed 以「昨天」時段動態建立逾期借用，三種狀態各一則與至少一筆未通知
    - `data/data-model.dbml` → `Table overdue_notifications` — Why：各狀態必填與必須為空的欄位
    - `data/data-model.dbml` → `Table reservations` 的 `uq_reservations_active_slot` — Why：同一設備、日期與時段只能有一筆占用的紀錄
    - `data/data-model.dbml` → `Enum equipment_status` — Why：逾期借用的設備一定是 `available`
  - **Optional**
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「通知清單」 — Why：需要對照雛形的假資料挑選失敗原因與嘗試次數時

### 後端（B1、B2、B4）

- [ ] T016 [P] [US2] 在 `backend/src/middleware/errorHandler.ts` 比照 `EquipmentStatusErrorCode` 的寫法新增錯誤碼 `OVERDUE_LOAN_RETURNED`、`OVERDUE_NOTIFICATION_NOT_RESENDABLE`：加入 `ErrorCode`，HTTP 狀態都是 `409`，預設訊息分別為「借用已歸還，不需要重送」與說明通知目前狀態、不能重送的繁體中文，並提供可帶入詳細訊息的建立函式；前五版的錯誤碼、狀態碼與訊息不變（FR-007、FR-008、FR-020、NFR-002）
  - **Must Read**
    - `contracts/openapi.yaml` → `ResendOverdueNotificationConflict`、`Error` — Why：兩個新錯誤碼與錯誤回應格式
    - `contracts/openapi.yaml` → `resendOverdueNotification` — Why：兩個錯誤碼各自的觸發情況與訊息內容
    - `research.md` → §4 — Why：新錯誤碼加入既有 `ErrorCode` 與 `errorHandler`
- [ ] T017 [US2] 在 `backend/src/services/overdueNotificationService.ts` 實作通知紀錄查詢：依選填的 `status` 與 `page`、`pageSize` 查出 `overdue_notifications`（排除 `deleted_at` 不為空），join `reservations`、`equipments`、`users`、`time_slots`，依 `created_at` 由新到舊、相同時依 `id` 由小到大排序；轉成 `OverdueNotification`（`reservationNumber` 取 `reservation_no`；`loanReturned` 在預約為 `returned` 時為 true；`returnedAt` 取 `returned_at`；`canResend` 只有在 `status` 為 `failed` 或 `unknown`、且預約仍為 `checked_out` 時為 true；`failureReason` 只回傳 Enum 值），回傳 `OverdueNotificationPage`；`page` 超過 `totalPages` 時回空的 `items`（FR-003、FR-004、FR-008、FR-012、NFR-003、US2 情境 1～3、9～12、Edge Cases 逾期好幾天仍未歸還）
  - **Must Read**
    - `contracts/openapi.yaml` → `listOverdueNotifications` — Why：篩選條件、排序、`canResend` 與 `loanReturned` 的計算規則與超過頁數的回應
    - `contracts/openapi.yaml` → `OverdueNotification`、`OverdueNotificationPage` — Why：回傳的欄位與可為空的條件
    - `data/data-model.dbml` → `Table overdue_notifications` 的 `idx_overdue_notifications_status_created`、`idx_overdue_notifications_created` — Why：篩選與排序依據的索引
  - **Optional**
    - `data/data-model.dbml` → `Table reservations` 的 `returned_at` — Why：需要確認歸還時間的來源欄位時
- [ ] T018 [US2] 在 `backend/src/services/overdueNotificationService.ts` 實作重送：以一條條件式更新 `UPDATE overdue_notifications n SET status = 'sending', next_attempt_at = $now, auto_retry_count = 0, failure_reason = NULL, updated_by = 管理員, updated_at = $now FROM reservations r WHERE n.id = $1 AND r.id = n.reservation_id AND n.status IN ('failed', 'unknown') AND r.status = 'checked_out' RETURNING n.id` 領取重送權，成功時回傳狀態為 `sending`、`canResend` 為 false 的 `OverdueNotification`，不等送出結果、不建立新列、`attempt_count` 不歸 0；更新 0 列時重新讀取通知與預約，依序判斷：通知不存在拋出 `RESOURCE_NOT_FOUND`（404）；預約已不是 `checked_out` 拋出 `OVERDUE_LOAN_RETURNED`（409），訊息為「借用已歸還，不需要重送」並附預約編號、成員、設備與歸還時間；狀態為 `sending` 或 `sent` 拋出 `OVERDUE_NOTIFICATION_NOT_RESENDABLE`（409），訊息說明目前狀態，`sent` 時附送出時間（FR-005、FR-007、FR-008、FR-018、SC-004、US2 情境 4～8、13、14、Edge Cases 通知送出中或結果不明時借用被歸還）
  - **Must Read**
    - `contracts/openapi.yaml` → `resendOverdueNotification`（含 `ResendOverdueNotificationConflict`、`NotFound`） — Why：條件式更新的寫入欄位、`202` 回應與更新 0 列時的判斷順序與錯誤碼
    - `research.md` → §4 — Why：只用一條條件式更新，讓兩位管理員同時重送時只有一方成功
    - `notification/plan.md` → §2 — Why：`failed` 與 `unknown` 經 B2 重送回到 `sending` 時的寫入欄位
    - `ui/plan.md` → §5 `overdue-notifications.html` 的「重送時借用已歸還」「重送時通知已在送出中」「重送時通知已送出成功」 — Why：三種拒絕訊息要帶出的資訊
  - **Optional**
    - `notification/plan.md` → §4 — Why：需要確認重送 `failed` 或 `unknown` 通知的殘留重複風險時
- [ ] T019 [US2] 在 `backend/src/routes/adminRouter.ts` 以 `requireAuth`、`requireAdmin` 掛上 `GET /admin/overdue-notifications`（`listOverdueNotifications`）與 `POST /admin/overdue-notifications/:notificationId/resend`（`resendOverdueNotification`）：查詢以 `parsePaginationParams` 處理 `page`、`pageSize`（不合法回 `PAGINATION_INVALID`），zod 驗證 `status` 為四種狀態之一（不符回 `VALIDATION_FAILED`）；重送以 zod 驗證 `notificationId` 為 UUID（不符回 `VALIDATION_FAILED`），以 `req` 上的管理員 ID 呼叫 T018，成功回 `202`；一般成員沿用 `requireAdmin` 回 `403` `FORBIDDEN`（FR-003、FR-004、FR-005、FR-019、US2 情境 15）
  - **Must Read**
    - `contracts/openapi.yaml` → `listOverdueNotifications`、`resendOverdueNotification` — Why：兩個路由的路徑、參數、狀態碼與錯誤回應
    - `contracts/openapi.yaml` → `PaginationOrQueryInvalid`、`ValidationFailed`、`Forbidden` — Why：參數不合法與權限不足時的錯誤碼
    - `research.md` → §4 — Why：三個管理員端點掛在既有 `requireAuth`、`requireAdmin` 之後

### 前端（F1、F2、F4）

- [ ] T020 [US2] 在 `frontend/src/text/zh-TW.ts` 新增逾期通知的介面文字：管理員頁籤「逾期通知紀錄」；通知狀態「送出中」「送出成功」「送出失敗」「結果不明」；6 種失敗原因的說明（見 Notes 待確認 1）；借用「借用中」「已歸還」；篩選選項、清單欄位、空清單文字、重送與重新整理按鈕、橫幅與確認視窗文字；另比照 `EQUIPMENT_STATUS_ERROR_MESSAGES` 新增一組 `OVERDUE_LOAN_RETURNED`、`OVERDUE_NOTIFICATION_NOT_RESENDABLE` 的錯誤碼說明並接到 `getErrorMessage`，不加進 `ERROR_MESSAGES`（`frontend/tests/unit/zh-TW.test.ts` 斷言它有 19 個鍵）；不得出現 Webhook 位址（FR-003、FR-006、FR-008、NFR-002、NFR-003）
  - **Must Read**
    - `ui/plan.md` → §4 — Why：清單、篩選、空狀態、重送與重新整理各狀態的文字
    - `ui/plan.md` → §5 — Why：失敗原因、借用已歸還、確認視窗提醒與各錯誤橫幅的文字
    - `contracts/openapi.yaml` → `OverdueNotificationStatus`、`OverdueNotificationFailureReason` — Why：要對應文字的 4 種狀態與 6 種失敗原因
  - **Optional**
    - `ui/overdue-notifications.html` → 雛形狀態「重送結果不明確認視窗」 — Why：需要對照確認視窗的實際文字時
- [ ] T021 [US2] 在 `frontend/src/api/client.ts` 新增 `OverdueNotification`、`OverdueNotificationPage` 型別，以及呼叫 `listOverdueNotifications`（`GET /admin/overdue-notifications`，選填 `status`、`page`、`pageSize`）與 `resendOverdueNotification`（`POST /admin/overdue-notifications/{notificationId}/resend`）的函式，沿用既有 `apiRequest` 的 Bearer token 與錯誤處理（FR-003、FR-004、FR-005）
  - **Must Read**
    - `contracts/openapi.yaml` → `listOverdueNotifications`、`resendOverdueNotification` — Why：兩個呼叫的路徑、參數與回應
    - `contracts/openapi.yaml` → `OverdueNotification`、`OverdueNotificationPage` — Why：型別的欄位與可為空的條件
- [ ] T022 [US2] 在 `frontend/src/components/ResendUnknownDialog.tsx` 比照既有 `RescheduleDialog.tsx` 的寫法實作「結果不明」重送確認視窗：標題「重送「結果不明」的通知？」，列出設備編號與名稱、成員姓名、預約日期（星期）與時段、最後嘗試時間；琥珀色提醒先到 Discord 通知頻道確認沒有收到、重送可能造成重複通知；按鈕「取消」與「已確認沒收到，重送」；置中彈窗，手機寬度改為全螢幕；取消時只關閉視窗、不呼叫 API（FR-006、US2 情境 6、7、Edge Cases 結果不明但 Discord 其實已收到）
  - **Must Read**
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「重送結果不明確認視窗」 — Why：視窗的標題、內容、提醒文字與按鈕
    - `ui/plan.md` → §5 `overdue-notifications.html` 的「取消重送結果不明的通知」 — Why：取消時視窗關閉、通知不變、不顯示橫幅
    - `ui/overdue-notifications.html` → 雛形狀態「重送結果不明確認視窗」 — Why：視窗配置與文字的實際樣子
  - **Optional**
    - `ui/plan.md` → §2 — Why：需要確認琥珀色提醒與手機全螢幕的版面規則時
- [ ] T023 [US2] 在 `frontend/src/views/OverdueNotificationsView.tsx` 實作通知清單與狀態篩選（F1）：載入中以灰色骨架與「正在載入逾期通知紀錄…」呈現；「共 N 則通知」依 API 順序列出預約編號、設備編號與名稱、成員姓名、預約日期與時段、狀態徽章（「送出中」靛藍加轉圈、「送出成功」綠色、「送出失敗」紅色、「結果不明」琥珀色）、嘗試次數、最後嘗試時間（為空時顯示「—」）；`sent` 顯示送出時間，`failed` 在狀態下方以紅色條顯示「失敗原因：…」；借用欄顯示「借用中」或「已歸還」與歸還時間；`canResend` 為 true 才顯示「重送」，已歸還時操作欄顯示「借用已歸還」灰字；「通知狀態」下拉選單（全部、送出中、送出成功、送出失敗、結果不明）以 `status` 重新查詢；沒有通知與沒有符合篩選時顯示對應文字與「顯示全部通知」；時間以 `Asia/Taipei` 顯示；720px 以下改為一則一張卡片；一般成員或收到 `403` 時隱藏篩選列與清單，顯示「權限不足」卡片與「切換管理員帳號登入」；分頁做法見 Notes 待確認 4（FR-003、FR-004、FR-008、FR-012、FR-017、FR-019、NFR-002、NFR-003、US2 情境 1～3、9～12、15）
  - **Must Read**
    - `ui/plan.md` → §3.3 A6、A7、A13 — Why：本畫面的篩選、查看與權限不足時的操作
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「載入中」「通知清單」「篩選送出失敗」「沒有符合篩選的通知」「沒有逾期通知」 — Why：各狀態的呈現
    - `ui/plan.md` → §5 `overdue-notifications.html` 的「送出失敗的通知顯示失敗原因」「送出成功的通知」「送出中的通知」「借用已歸還的通知」「權限不足」 — Why：各種通知的顯示規則與權限不足的回饋
    - `ui/overdue-notifications.html` → 雛形狀態「通知清單」「篩選送出失敗」「權限不足」 — Why：表格、卡片與徽章的實際樣子
    - `contracts/openapi.yaml` → `listOverdueNotifications` — Why：`canResend` 與 `loanReturned` 決定按鈕與借用欄
  - **Optional**
    - `ui/plan.md` → §2 — Why：需要確認配色變數、等寬字體與 720px 以下卡片版面時
- [ ] T024 [US2] 在 `frontend/src/views/OverdueNotificationsView.tsx` 實作重送與重新整理（F2）：`failed` 的「重送」直接呼叫 `resendOverdueNotification`，`unknown` 先開 `ResendUnknownDialog`，確認後才呼叫；送出時該列按鈕改為「重送中…」並停用；收到 `202` 後顯示藍色橫幅「已重新送出 <預約編號> 的通知，目前為「送出中」。請稍後按「重新整理」查看送出結果。」並重新查詢清單，不等送出結果；收到 `409` 時以紅色橫幅顯示 API 回傳的繁體中文訊息並重新查詢清單；「重新整理」按鈕重新查詢，進行中改為「重新整理中…」並停用、清單變淡；不自動更新清單（FR-005、FR-006、FR-007、FR-008、FR-018、US2 情境 4～8、13、14）
  - **Must Read**
    - `ui/plan.md` → §3.3 A8～A11 — Why：重送「送出失敗」、重送「結果不明」、取消與重新整理的操作
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「重送處理中」「已重送，送出中」「重新整理中」「重新整理後」 — Why：重送與重新整理各階段的呈現
    - `ui/plan.md` → §5 `overdue-notifications.html` 的「重送時借用已歸還」「重送時通知已在送出中」「重送時通知已送出成功」 — Why：三種拒絕的橫幅與重新載入後的呈現
    - `contracts/openapi.yaml` → `resendOverdueNotification` — Why：`202` 回應與 `409` 錯誤碼
  - **Optional**
    - `ui/overdue-notifications.html` → 雛形狀態「已重送，送出中」「重送時借用已歸還」 — Why：需要對照橫幅位置與樣式時
- [ ] T025 [US2] 在 `frontend/src/App.tsx` 新增 `ViewName` 的逾期通知紀錄頁籤：頁首導覽加一個按鈕（文字取自 T020，`data-testid` 沿用既有 `nav-*` 命名），點擊時切到 `OverdueNotificationsView`；未登入時沿用 `LOGIN_REQUIRED_MESSAGE` 的處理，並依 ui/plan.md §5「未登入存取受保護頁面」把訊息改為「請先登入，才能使用設備預約、我的預約、管理員總覽與逾期通知紀錄。」；管理員登入後的預設頁面維持 `equipment-status`（見 Notes 待確認 3）；前五版既有頁籤與 `data-testid` 不變（FR-003、FR-019、FR-020、US2 情境 15）
  - **Must Read**
    - `ui/plan.md` → §3.1、§3.2 — Why：逾期通知紀錄的進入方式與流程
    - `ui/plan.md` → §5 `index.html` 的「未登入存取受保護頁面」 — Why：未登入提示的新文字
    - `plan.md` → Source Code (repository root) — Why：`App.tsx` 本次只新增「逾期通知紀錄」管理員頁籤
  - **Optional**
    - `ui/plan.md` → §1 — Why：需要確認前五版畫面為何沿用 007 而不重畫時

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 管理員手動執行一次逾期檢查 (Priority: P3)

**Goal**: 管理員在「逾期通知紀錄」頁點擊「立即檢查逾期」，立即看到這次建立了幾則通知；沒有新的逾期借用時顯示「沒有新的逾期借用」。

**Independent Test**: 在 `.env` 設 `OVERDUE_AUTO_CHECK_ENABLED=false` 並重啟後端，執行 demo seed；以管理員登入點擊「立即檢查逾期」，確認畫面顯示這次至少建立 1 則通知、模擬器收到通知，已有「送出失敗」通知的借用沒有新增通知；再點擊一次，確認顯示「沒有新的逾期借用」。

### 後端（B3）

> D1 的 `overdue_notifications` 已在 Foundational 建立，demo seed 的未通知逾期借用已在 US2 的 T015 建立，本故事沒有資料庫任務。

- [ ] T026 [US3] 在 `backend/src/routes/adminRouter.ts` 以 `requireAuth`、`requireAdmin` 掛上 `POST /admin/overdue-checks`（`runOverdueCheck`）：不需要請求內容，以目前時間呼叫 T009 的 `runOverdueCheck(now)`，回 `200` 與 `OverdueCheckResult`（`createdCount`），不等通知送出；不受 `OVERDUE_AUTO_CHECK_ENABLED` 影響；一般成員沿用 `requireAdmin` 回 `403` `FORBIDDEN`，不建立任何通知（FR-009、FR-010、FR-012、FR-018、FR-019、NFR-001、US3 情境 1～5、Edge Cases 手動檢查與自動檢查同時執行）
  - **Must Read**
    - `contracts/openapi.yaml` → `runOverdueCheck`、`OverdueCheckResult` — Why：路由、`200` 回應與 `createdCount` 的意義
    - `notification/plan.md` → §1 的 TR2 — Why：手動檢查和自動檢查用同一個函式且不受開關影響
  - **Optional**
    - `research.md` → §4 — Why：需要確認手動檢查與自動檢查同時執行時只有一方建立通知的原因時

### 前端（F3）

- [ ] T027 [US3] 在 `frontend/src/text/zh-TW.ts` 新增「立即檢查逾期」、「檢查中…」、「這次建立 N 則逾期通知」、「沒有新的逾期借用」的介面文字（FR-010、NFR-002）
  - **Must Read**
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「檢查逾期中」「已建立逾期通知」「沒有新的逾期借用」 — Why：按鈕與兩種結果橫幅的文字
- [ ] T028 [US3] 在 `frontend/src/api/client.ts` 新增 `OverdueCheckResult` 型別與呼叫 `runOverdueCheck`（`POST /admin/overdue-checks`）的函式（FR-009、FR-010）
  - **Must Read**
    - `contracts/openapi.yaml` → `runOverdueCheck`、`OverdueCheckResult` — Why：呼叫的路徑與回應欄位
- [ ] T029 [US3] 在 `frontend/src/views/OverdueNotificationsView.tsx` 的清單標題列右側加上「立即檢查逾期」：點擊後按鈕改為「檢查中…」並停用、「重新整理」也停用；`createdCount` 大於 0 時顯示綠色橫幅「這次建立 N 則逾期通知」，為 0 時顯示藍色橫幅「沒有新的逾期借用」，然後重新查詢清單；沒有逾期通知時按鈕照常可用；收到 `403` 時顯示權限不足（FR-009、FR-010、FR-012、FR-019、NFR-001、US3 情境 1～3、5、6）
  - **Must Read**
    - `ui/plan.md` → §3.3 A12 — Why：立即檢查逾期的操作
    - `ui/plan.md` → §4 `overdue-notifications.html` 的「檢查逾期中」「已建立逾期通知」「沒有新的逾期借用」 — Why：檢查中與兩種結果的呈現
    - `ui/plan.md` → §5 `overdue-notifications.html` 的「手動檢查遇到已有通知的逾期借用」 — Why：建立數量只計新通知、既有通知不變
    - `ui/overdue-notifications.html` → 雛形狀態「已建立逾期通知」「沒有新的逾期借用」 — Why：按鈕位置與橫幅的實際樣子
  - **Optional**
    - `spec.md` → NFR-001 — Why：需要確認從點擊到顯示建立數量的時間上限時

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T030 [P] 更新 `README.md`：資料庫遷移、demo seed 重設、`.env` 的三個新設定、以 `npm --prefix backend run discord:sim` 啟動模擬器與 `PUT /__sim/mode` 切換模式，以及展示 US3 手動檢查前先在 `.env` 設 `OVERDUE_AUTO_CHECK_ENABLED=false` 並重啟後端；不寫出真實的 Webhook 位址（FR-020、NFR-003）
  - **Must Read**
    - `research.md` → §8 — Why：README 要寫明展示手動檢查前關閉自動檢查
    - `notification/plan.md` → §5.5 — Why：模擬器的啟動方式與控制操作
    - `research.md` → §5 — Why：三個設定與 `.env` 不 commit
- [ ] T031 [P] 量測送出時效與重試結果（SC-001、SC-003）：在 `backend/tests/integration/overdueDispatch.test.ts` 以 `createDiscordWebhookSimulator()` 在連接埠 `0` 啟動模擬器，搭配 `vi.setSystemTime` 直接呼叫 `runOverdueCheck(now)`、`dispatchDueNotifications(now)`、`recoverInterruptedNotifications(now)`，逐一跑 notification/plan.md §7 的 NS1～NS10、NS12～NS14、NS16～NS18、NS20～NS21，確認時段結束後 10 分鐘內送出、等待不超過 1 分鐘且 3 次內恢復時 100% 為 `sent`、逾時與送出後中斷 100% 為 `unknown` 且自動重送 0 次；模擬器無法重現的回應以分類函式直接驗證（見 Notes 待確認 2）；記錄每個情境的結果（FR-001、FR-002、FR-013～FR-017、FR-021）
  - **Must Read**
    - `notification/plan.md` → §7 — Why：每個驗收情境的 Given／When／Then
    - `spec.md` → SC-001、SC-003 — Why：送出時效與重試結果的通過標準
    - `research.md` → §8 — Why：固定時間、直接呼叫排程函式與模擬器的測試做法
  - **Optional**
    - `notification/plan.md` → §8 UC2 — Why：需要確認哪些分類只能直接交給分類函式驗證時
- [ ] T032 [P] 量測不重複（SC-002）：在 `backend/tests/integration/overdueConcurrency.test.ts` 以 `Promise.all` 同時執行手動檢查與自動檢查，重複 20 輪（每輪重設資料），確認每輪每筆借用只有 1 則通知、兩邊的 `createdCount` 合計為 1、模擬器只收到 1 則訊息；再同時送出兩個 `resendOverdueNotification`，確認只有一個回 `202`、另一個回 `409`，模擬器只收到 1 次（FR-012、FR-018、US2 情境 14、US3 情境 4）
  - **Must Read**
    - `notification/plan.md` → §7 NS19、NS20 — Why：並發檢查與並發重送的驗收情境
    - `spec.md` → SC-002 — Why：通知數恰好 1 則的通過標準
    - `research.md` → §8 — Why：並發測試重複 20 輪的做法
- [ ] T033 [P] 量測重送與回應時間（SC-004、SC-005）：在 `backend/tests/integration/overdueResend.test.ts` 確認重送「送出失敗」的通知、模擬器為 `success` 時，同一則通知變成 `sent`、`attempt_count` 加 1、通知總數不變；建立 100 筆逾期借用後量測 `POST /admin/overdue-checks` 的回應時間低於 2 秒（FR-005、NFR-001）
  - **Must Read**
    - `spec.md` → SC-004、SC-005 — Why：重送結果與手動檢查回應時間的通過標準
    - `research.md` → §8 — Why：以 100 筆逾期借用量測回應時間的做法
- [ ] T034 [P] 量測 Webhook 位址不外洩（SC-006）：在 `backend/tests/integration/overdueSecret.test.ts` 以 `vi.spyOn` 收集 `console.log`、`console.warn`、`console.error`，模擬器依序切換 6 種模式並停止一次，讓送出程序處理每種情況，再搜尋 log、所有 API 回應與 `overdue_notifications` 的內容，確認 Webhook token 出現次數為 0（NFR-003、FR-015）
  - **Must Read**
    - `notification/plan.md` → §7 NS23 — Why：收集與搜尋的範圍
    - `spec.md` → SC-006 — Why：出現次數為 0 的通過標準
    - `notification/plan.md` → §6 — Why：哪些紀錄項目不得記錄 Webhook 位址
- [ ] T035 [P] 量測角色權限（SC-007 的權限部分）：在 `backend/tests/integration/overdueAuth.test.ts` 以一般成員呼叫 `listOverdueNotifications`、`resendOverdueNotification`、`runOverdueCheck`，確認 100% 回 `403` `FORBIDDEN`、訊息為繁體中文，且沒有建立或送出任何通知（FR-019、NFR-002）
  - **Must Read**
    - `spec.md` → SC-007、FR-019 — Why：一般成員 100% 被拒絕且不建立通知
    - `contracts/openapi.yaml` → `Forbidden` — Why：權限不足的錯誤碼
- [ ] T036 [P] 驗證無損遷移（US1 情境 10）：在 `backend/tests/migration/overdueDiscordNotification.test.ts` 比照 `backend/tests/migration/equipmentMaintenanceRetire.test.ts`，在獨立測試資料庫以 `pg` 依序執行 008 之前的 `migration.sql`，寫入各種狀態的預約、借用、改期申請與設備狀態變更紀錄，再執行 008 的 `migration.sql`，確認既有資料列數與欄位值不變、`overdue_notifications` 已建立且是空表（FR-020）
  - **Must Read**
    - `research.md` → §8 — Why：以 `pg` 逐支執行 `migration.sql` 的遷移驗證做法
    - `spec.md` → US1 情境 10、FR-020 — Why：升級後既有資料不變的通過標準
- [ ] T037 在 `backend/` 與 `frontend/` 執行 `npm run check`（`tsc --noEmit`、ESLint、`prettier --check`），修正所有錯誤
  - **Must Read**
    - `techstack.md` → 技術堆疊總覽 — Why：靜態檢查與格式化使用的 ESLint 10、`typescript-eslint` 8 與 Prettier
- [ ] T038 執行 `npm run test:backend`、`npm run test:frontend` 與 `npm run test:e2e`，確認前五次迭代既有測試 100% 通過並記錄通過率（SC-007、FR-020）
  - **Must Read**
    - `spec.md` → SC-007 — Why：前五次迭代回歸的通過標準
  - **Optional**
    - `research.md` → §8 — Why：e2e 失敗、需要確認 Playwright 啟動後端與模擬器的設定時
- [ ] T039 依 `README.md` 啟動後端、前端與模擬器，執行 demo seed，逐條走 US1～US3 的 Independent Test，並核對 US2 情境 16 與 US3 情境 6（FR-020）
  - **Must Read**
    - `spec.md` → US1、US2、US3 的 Independent Test — Why：手動驗證的步驟
    - `spec.md` → US2 情境 16、US3 情境 6 — Why：demo seed 後要看到的結果
  - **Optional**
    - `notification/plan.md` → §5.5 — Why：需要切換模擬器模式重現失敗情況時

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US2 的頁面要有通知紀錄才能驗證：可以用 T015 的 demo seed 獨立驗證查看與篩選，但重送後的送出要靠 US1 的送出程序（T011～T013）
  - US3 的手動檢查呼叫 US1 的 `runOverdueCheck`（T009），畫面擴充 US2 的 `OverdueNotificationsView.tsx`，因此建議依 P1 → P2 → P3 循序進行
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: 查看與篩選只依賴 Foundational 與 T015；重送後的實際送出需要 US1 的 T011～T013；`overdueNotificationService.ts`（T017、T018）擴充 T009、T010
- **User Story 3 (P3)**: 需要 US1 的 `runOverdueCheck`（T009）與 US2 的 `OverdueNotificationsView.tsx`（T023～T024）；`adminRouter.ts`（T026）擴充 T019，`zh-TW.ts`（T027）擴充 T020，`client.ts`（T028）擴充 T021

### Within Each User Story

- 資料庫（schema、migration、seed）→ 後端（config、integration、service、job、router、server）→ 前端（文字、API client、元件、view、`App.tsx`）
- `backend/prisma/seed.ts`、`backend/src/services/overdueNotificationService.ts`、`backend/src/jobs/overdueScheduler.ts`、`backend/src/routes/adminRouter.ts`、`frontend/src/text/zh-TW.ts`、`frontend/src/api/client.ts`、`frontend/src/views/OverdueNotificationsView.tsx` 由多個任務修改，這些任務要循序進行
- Story complete before moving to next priority

### Parallel Opportunities

- Setup：T002 可與 T001 平行
- US1：T006（設定）、T008（模擬器）可同時開工；T007 等 T006 完成
- US2：T016（錯誤碼）可與 T015（demo seed）同時進行；前端 T020～T022 可與後端 T017～T019 同時進行
- Polish：T030～T036 可平行

---

## Parallel Example: User Story 1

```bash
Task: "以 zod 4 驗證通知設定 in backend/src/config/notificationConfig.ts"
Task: "實作本機 Discord Webhook 模擬器 in backend/scripts/discordWebhookSimulator.ts"
```

## Parallel Example: User Story 2

```bash
Task: "擴充 demo seed 的逾期借用與三種狀態通知 in backend/prisma/seed.ts"
Task: "新增 OVERDUE_LOAN_RETURNED、OVERDUE_NOTIFICATION_NOT_RESENDABLE in backend/src/middleware/errorHandler.ts"
Task: "新增逾期通知的介面文字 in frontend/src/text/zh-TW.ts"
```

## Parallel Example: User Story 3

```bash
Task: "掛上 POST /admin/overdue-checks in backend/src/routes/adminRouter.ts"
Task: "新增立即檢查逾期的介面文字 in frontend/src/text/zh-TW.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 以 US1 的 Independent Test，搭配模擬器的 `success`、`server_error`、`timeout` 模式驗證自動通知、只通知一次與失敗分類
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP：設備逾期時 Discord 頻道自動收到通知)
3. Add User Story 2 → Test independently → Deploy/Demo（管理員可以查看送出結果並重送失敗的通知）
4. Add User Story 3 → Test independently → Deploy/Demo（管理員可以手動執行一次逾期檢查）
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done，每個故事依序進行，故事內分工：
   - Developer A：後端（config、Discord 呼叫、模擬器、service、排程、router）
   - Developer B：前端（`zh-TW.ts`、`client.ts`、確認視窗、`OverdueNotificationsView.tsx`、`App.tsx`）
3. 雙方以 contracts/openapi.yaml 為介面約定，故事完成後一起驗證

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- plan.md 的 Source Code 只列出 `backend/tests/integration/`、`backend/tests/migration/` 目錄，沒有列出檔名；本 tasks.md 新增 `overdueDispatch.test.ts`（T031）、`overdueConcurrency.test.ts`（T032）、`overdueResend.test.ts`（T033）、`overdueSecret.test.ts`（T034）、`overdueAuth.test.ts`（T035）與 `overdueDiscordNotification.test.ts`（T036），依驗證的 Success Criteria 分檔，對應 plan.md 這兩個目錄的說明
- plan.md 的 Documentation 樹沒有列出 `notification/plan.md`，但該檔已由 notification-plan 產出，本 tasks.md 照常引用
- 待確認 1：3 個失敗原因的畫面文字不一致：`ui/overdue-notifications.html` 的 `MOCK.failureReasons` 寫「無法連線到 Discord」「通知設定有誤：沒有設定 Webhook」「Discord 拒絕這則訊息的內容」，`data/data-model.dbml` 的 `Enum overdue_notification_failure_reason`、`research.md` §1 與 `contracts/openapi.yaml` 的 `OverdueNotificationFailureReason` 寫「無法連線」「通知設定有誤：沒有設定」「Discord 拒絕訊息內容」，`ui/plan.md` 沒有列出這 3 個原因（notification/plan.md §8 UC1）。影響 T020；在 ui-plan 決定前，T020 暫用 data-model、research 與合約一致的寫法
- 待確認 2：`research.md` §6 的 6 種模擬器模式無法重現其他 `4xx`（`message_rejected`）、`401`／`403`（`webhook_invalid`）、`200` 沒有 `id`、沒有等待秒數的 `429`（notification/plan.md §8 UC2）。影響 T008、T031；在 technical-research 決定前，T008 只實作 6 種模式，T031 把這幾類回應直接交給 T007 的分類函式驗證，整合測試與手動展示不涵蓋這幾類
- 待確認 3：`ui/plan.md` §1 寫「把管理員登入後的入口改到逾期通知紀錄」，§4 `index.html`「管理員登入成功」顯示「前往逾期通知紀錄」；但 plan.md Source Code 與 `research.md` §7 只寫新增「逾期通知紀錄」管理員頁籤，既有 `App.tsx` 管理員登入後直接進入 `equipment-status`，`e2e/equipment-maintenance.spec.ts` 也依賴管理員登入後看到 `equipment-status-table`。影響 T025；在 ui-plan 確認前，T025 維持管理員登入後進入 `equipment-status`，只新增頁籤
- 待確認 4：`contracts/openapi.yaml` 的 `listOverdueNotifications` 分頁（`pageSize` 預設 20、上限 100），但 `ui/plan.md` §4 沒有規劃分頁控制項，只顯示「共 N 則通知」。影響 T023；在 ui-plan 補上分頁前，T023 以 `page=1`、`pageSize=100` 查詢，「共 N 則通知」顯示 `totalItems`
