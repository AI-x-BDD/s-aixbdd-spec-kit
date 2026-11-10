# 技術研究與決策紀錄 (Research): 逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查 (Overdue Discord Notification)

**Feature Branch**: `008-overdue-discord-notification`  
**Date**: 2026-11-11  
**Spec**: [spec.md](./spec.md)

## 1. 逾期通知資料表、通知狀態 Enum 與無損資料遷移 (PostgreSQL 18 + Prisma ORM 7.10 + Docker Compose)

- **Decision**: 沿用 **PostgreSQL 18**（以 **Docker Compose** 啟動容器）與 **Prisma ORM 7.10**（搭配 **`@prisma/adapter-pg`** 與 **`pg`**），以 `prisma migrate dev --create-only` 產生一支增量 Migration，檢查 SQL 後套用；只新增 Enum 與資料表，不修改任何既有資料表：
  - **通知狀態 Enum `overdue_notification_status`**：`sending`（送出中）、`sent`（送出成功）、`failed`（送出失敗）、`unknown`（結果不明）。
  - **失敗原因 Enum `overdue_notification_failure_reason`**：`rate_limited`（Discord 請求太頻繁）、`discord_server_error`（Discord 伺服器錯誤）、`connection_failed`（無法連線）、`webhook_invalid`（通知設定有誤：Webhook 已失效）、`webhook_not_configured`（通知設定有誤：沒有設定）、`message_rejected`（Discord 拒絕訊息內容）。畫面文字由前後端依 Enum 對應繁體中文，資料庫不存任何 Webhook 位址。
  - **資料表 `overdue_notifications`**：`id`（`Uuid`）、`reservation_id`（外鍵指向 `reservations.id`，唯一索引 `uq_overdue_notifications_reservation`）、`status`（預設 `sending`）、`attempt_count`（`Int`，累計嘗試次數，畫面顯示用）、`auto_retry_count`（`Int`，本輪已自動重試次數，建立與重送時歸 0）、`next_attempt_at`（`Timestamptz(6)`，可為空）、`last_attempted_at`、`failure_reason`、`sent_at`、`discord_message_id`（`Text`，Discord snowflake 以字串保存），以及憲法規定的生命週期欄位 `created_at`、`updated_at`、`updated_by`、`deleted_at`。
  - **「送出中」的兩種情況以 `next_attempt_at` 區分**：`status = 'sending'` 且 `next_attempt_at` 有值，代表等待送出或等待自動重試（Discord 確定沒收到）；`status = 'sending'` 且 `next_attempt_at` 為空，代表請求已送出、正在等待 Discord 回應。
  - **索引**：部分索引 `idx_overdue_notifications_due`（`next_attempt_at`，`WHERE status = 'sending'`）供送出程序找出到期的通知；`idx_overdue_notifications_status_created`（`status, created_at`）供通知紀錄頁依狀態篩選並由新到舊排序。
- **Rationale**:
  - 符合使用者技術限制「沿用 `specs/007-equipment-maintenance-retire/techstack.md`」：資料庫、ORM、遷移工具與容器設定全部沿用。沿用的理由是本次只多一張通知表與兩個 Enum，007 選定的 PostgreSQL 18 與 Prisma 7.10 都能直接表達，不需要新的儲存技術。
  - `reservation_id` 唯一索引在資料庫層保證每筆預約與借用紀錄最多一則通知，滿足 FR-012、SC-002 與 Key Entities「每筆預約與借用紀錄最多對應一則逾期通知」；自動檢查與手動檢查同時寫入時，後寫入的一方由唯一索引擋下（寫法見第 4 主題），滿足 FR-018。
  - 四個狀態值與 spec 的四種狀態一一對應，滿足 FR-017；`sent_at` 與 `discord_message_id` 記錄送出成功的時間與 Discord 訊息編號。Discord snowflake 是 64 位元整數，超過 JavaScript `Number` 的安全整數範圍，所以用字串保存。
  - 以 `next_attempt_at` 是否為空區分「等待自動重試」與「等待 Discord 回應」，讓系統恢復運作時能依 FR-021 分別處理：前者繼續自動重試，後者標成「結果不明」。
  - 重送更新同一列的 `status`、`attempt_count`、`last_attempted_at`，滿足 FR-005「不得建立新的通知」與 SC-004「通知總數不增加」。
  - 只新增 Enum 與資料表，不改動 003～007 任何既有資料表與資料列，滿足 FR-020 的無損遷移與 SC-007 的回歸要求。
  - 受影響的必須規則：FR-005、FR-012、FR-017、FR-018、FR-020、FR-021、Key Entities 的結構約束；比對的其他操作：自動檢查、手動檢查、重送、系統恢復運作時的處理（本次新增），以及登記歸還、demo seed 重設（既有操作）。登記歸還只改 `reservations`，不碰通知表，所以通知狀態不變，符合 Edge Cases「通知送出中或結果不明時借用被歸還：通知的狀態不變」。
- **Alternatives considered**:
  - **在 `reservations` 加上 `overdue_notified_at` 等通知欄位，不建通知表**：要改動 007 的既有資料表，嘗試次數、失敗原因與訊息編號都混進預約表，和 Key Entities 把「逾期通知」列為獨立實體不一致。
  - **把「送出中」拆成 `queued`、`in_flight` 兩個 Enum 值**：API 與畫面要再把兩個值合併成「送出中」，和 FR-017 的四種狀態不一致；以 `next_attempt_at` 是否為空區分，Enum 維持四個值。
  - **`discord_message_id` 用 `BigInt` 欄位**：Prisma 會回傳 JavaScript `bigint`，轉成 JSON 時要另外處理；訊息編號只用來顯示與比對，字串即可。
  - **失敗原因用自由文字欄位**：可能把例外訊息原文寫進資料庫，無法保證 NFR-003「Webhook 位址不得出現在通知紀錄與失敗原因」；Enum 只保存原因類型。

---

## 2. 逾期檢查與通知送出的排程方式 (Node.js 24 內建計時器 + PostgreSQL 18 工作狀態)

- **Decision**: 在後端程序內以 **Node.js 24 LTS 以上**的內建計時器（`setTimeout` 串接，上一次執行結束後才排下一次）實作排程模組 `overdueScheduler`，由 **`tsx`** 啟動的 `src/server.ts` 呼叫 `start()`；`src/app.ts` 不啟動排程，Supertest 測試匯入 `app` 時不會跑排程。所有排程狀態都存在 **PostgreSQL 18** 的 `overdue_notifications`（第 1 主題），由 **Prisma ORM 7.10** 的 `tx.$queryRaw` 下達；SQL 使用的目前時間一律由應用程式傳入參數 `now`，不使用資料庫的 `now()`：
  1. **啟動時恢復（FR-021）**：`start()` 先執行 `UPDATE overdue_notifications SET status = 'unknown', updated_at = $now WHERE status = 'sending' AND next_attempt_at IS NULL`；`next_attempt_at` 有值的通知保留，由送出程序繼續自動重試。
  2. **自動逾期檢查**：環境變數 `OVERDUE_AUTO_CHECK_ENABLED` 預設 `true`；開啟時，啟動後立即執行一次，之後每 `OVERDUE_CHECK_INTERVAL_SECONDS` 秒執行一次（預設 `60`，允許 `10`～`300`）。檢查與手動檢查共用同一個函式 `runOverdueCheck(now)`，以一條 `INSERT INTO overdue_notifications (...) SELECT r.id, ... FROM reservations r JOIN time_slots s ON s.id = r.slot_id WHERE r.status = 'checked_out' AND r.deleted_at IS NULL AND ((r.reservation_date + s.end_time::time) AT TIME ZONE 'Asia/Taipei') < $now ON CONFLICT (reservation_id) DO NOTHING RETURNING id` 建立通知，新通知為 `sending`，`next_attempt_at = $now`；回傳的列數就是這次新建立的通知數。
  3. **送出程序**：每 1 秒執行一次 `dispatchDueNotifications(now)`，一次只處理一則通知，處理完再找下一則，直到沒有到期的通知：
     - 以 `UPDATE overdue_notifications SET next_attempt_at = NULL, attempt_count = attempt_count + 1, last_attempted_at = $now WHERE id = (SELECT id FROM overdue_notifications WHERE status = 'sending' AND next_attempt_at <= $now ORDER BY next_attempt_at LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING ...` 領取一則通知並提交，再依第 3 主題呼叫 Discord，最後依結果更新同一列。
     - 第 3 主題回報 Discord 的 `X-RateLimit-Remaining` 為 `0` 時，送出程序暫停到 `X-RateLimit-Reset-After` 秒之後才領取下一則。
     - 上一次執行還沒結束時，跳過這一次。
  4. **展示與測試用的開關**：`OVERDUE_AUTO_CHECK_ENABLED=false` 只關閉第 2 項的自動逾期檢查；第 1 項的恢復處理與第 3 項的送出程序照常執行，手動檢查與重送的通知照常送出。
- **Rationale**:
  - 對應使用者技術限制「本次新增主題：逾期檢查的排程方式」。本主題只用 Node.js 內建計時器與既有 PostgreSQL，不新增套件或服務，符合「沿用 007 techstack」。Node.js 24、`tsx`、Prisma 沿用的理由：後端已是長時間執行的 Node.js 程序，排程放在同一個程序內即可。
  - 滿足 FR-001 與 SC-001 的「時段結束後 10 分鐘內送出」：最差情況是時段結束後 60 秒內被檢查到，1 秒內被送出程序領取，加上第 3 主題最多 10 秒的等待，合計約 71 秒，低於 10 分鐘。一次有 100 則通知時，送出程序依 Discord 的速率限制標頭排隊；Discord 文件沒有公開 Webhook 的固定上限，實際以回應標頭為準；以每分鐘約 30 則估算，100 則約 3.5 分鐘送完，仍低於 10 分鐘。
  - 滿足 FR-002：啟動後立即執行一次逾期檢查，停機期間才逾期的借用在恢復運作後的第一次檢查中找出。
  - 滿足 FR-021：恢復處理只把「請求已送出、等待 Discord 回應」的通知標成「結果不明」，「等待自動重試」的通知由送出程序繼續處理，`auto_retry_count` 保留，所以重試總數仍依 FR-014 最多 3 次。採用的解讀：送出程序領取通知並提交後，就算已經送出；若程序剛好在提交後、請求寫出前停止，這則通知會標成「結果不明」。這段時間極短，而且只會多一則需要管理員確認的通知，不會造成重複送出，符合 FR-016 避免重複的方向。
  - 自動檢查的開關依使用者經 `clarify` 決定（2026-11-11）：自動檢查加一個 `.env` 開關、預設開啟；只有展示 US3 手動檢查時才關閉並重啟後端。關閉期間不符合 FR-001，這個例外只用於展示與測試。理由：後端只要在跑，自動檢查最多 1 分鐘就會先通知 demo seed 留下的「還沒有通知的逾期借用」，US3 驗收情境 6 就無法穩定成立。
  - 檢查間隔由環境變數提供，符合 Out of Scope「自動檢查的間隔由系統設定提供，不提供管理畫面修改」；上限 300 秒讓最差情況仍低於 FR-001 的 10 分鐘。
  - SQL 的目前時間由應用程式傳入，測試可以用 `vi.setSystemTime` 固定時間，不必等真實時段結束。
  - 受影響的必須規則：FR-001、FR-002、FR-011、FR-012、FR-014、FR-018、FR-021、SC-001、SC-002、US1 驗收情境 9、13、14、US3 驗收情境 4、6；比對的其他操作：手動檢查、重送（本次新增），以及登記領取（既有操作，建立「借用中」）、登記歸還（既有操作，結束「借用中」）。登記歸還在檢查語句之前提交時，這筆借用不再是 `checked_out`，不建立通知，滿足 US1 驗收情境 3；在之後提交時，借用在檢查當下確實逾期，依 FR-011 建立通知。兩個程序同時領取時，`FOR UPDATE SKIP LOCKED` 讓同一則通知只被領取一次。
- **Alternatives considered**:
  - **`node-cron`**：只多了 cron 語法；每 60 秒一次的固定間隔用內建計時器即可。它也不保存狀態，FR-021 的恢復處理仍要靠資料庫。007 不引入它是因為當時沒有排程需求；本次有排程需求，但仍不需要 cron 語法。
  - **pg-boss（以 PostgreSQL 為儲存的工作佇列）**：會另建自己的 schema，通知狀態要在工作表與 `overdue_notifications` 各存一份；逾期未完成的工作會被重新執行，「請求已送出、等待回應」的通知會被重送，違反 FR-021 與 FR-016；重試間隔在建立工作時決定，不適合依每次 `Retry-After` 調整。
  - **BullMQ 搭配 Redis**：要新增 Redis 服務並修改 `docker-compose.yml`；Redis 在 005～007 都已決定不引入。
  - **PostgreSQL `pg_cron` 擴充套件**：官方 `postgres:18` 映像沒有內建，要改映像；而且 `pg_cron` 只能執行 SQL，不能呼叫 Discord。
  - **作業系統 crontab 定時呼叫手動檢查 API**：排程設定不在 repo 與 `docker-compose.yml` 中，每台電腦都要另外設定（runbook 0.3 換電腦接力）；後端停止時 crontab 照樣呼叫並失敗。
  - **每則通知各自用記憶體中的 `setTimeout` 等待重試**：程序停止時計時器消失，恢復後不會繼續重試，違反 FR-021。
  - **不加開關，接受 US3 驗收情境 6 有時間限制**：使用者經 `clarify` 決定不採用，展示結果不穩定。

---

## 3. 呼叫 Discord Webhook 與送出結果分類（`?wait=true`、`429` 與 `Retry-After`、10 秒逾時）(Node.js 24 內建 `fetch` + Discord Webhook)

- **Decision**: 以 **Node.js 24 LTS 以上**內建的 `fetch` 呼叫 **Discord Webhook** 的 Execute Webhook 端點，封裝成 `discordWebhookClient.send(content)`，回傳分類後的結果，不向外拋出原始錯誤：
  - **請求**：以 `new URL(webhookUrl)` 加上 `searchParams.set("wait", "true")`，`POST`、`Content-Type: application/json`，內容 `{ "content": <通知文字>, "allowed_mentions": { "parse": [] } }`；`signal: AbortSignal.timeout(10_000)`，涵蓋等待回應標頭與讀取回應內容。通知文字依 FR-013 寫出設備編號與名稱、成員姓名、預約日期與時段、送出當下已逾期多久，使用繁體中文，長度在 2000 字以內。
  - **結果分類**：

    | 情況 | 分類 | 處理 |
    |---|---|---|
    | `200` 且回應 JSON 有 `id` | 送出成功 | 記錄 `sent_at` 與 `discord_message_id` |
    | `429`，等待秒數 ≤ 60 | 可重試（`rate_limited`） | 依等待秒數設定 `next_attempt_at` |
    | `429`，等待秒數 > 60 | 不可重試（`rate_limited`） | 直接標「送出失敗」 |
    | `500`～`599` | 可重試（`discord_server_error`） | 依退避間隔設定 `next_attempt_at` |
    | `fetch` 拋出 `TypeError`，`cause.code` 為 `ECONNREFUSED`、`ENOTFOUND`、`EAI_AGAIN`、`ENETUNREACH`、`EHOSTUNREACH`、`ENETDOWN`、`EHOSTDOWN`、`UND_ERR_CONNECT_TIMEOUT` | 可重試（`connection_failed`） | 依退避間隔設定 `next_attempt_at` |
    | `401`、`403`、`404` | 不可重試（`webhook_invalid`） | 直接標「送出失敗」 |
    | 其他 `4xx` | 不可重試（`message_rejected`） | 直接標「送出失敗」 |
    | 沒有設定 Webhook 位址 | 不可重試（`webhook_not_configured`） | 不送出請求，直接標「送出失敗」 |
    | `TimeoutError`（10 秒）、其他 `fetch` 錯誤（例如 `UND_ERR_SOCKET`、`ECONNRESET`、`EPIPE`、讀取回應內容失敗）、`200` 但沒有 `id` | 結果不明 | 標「結果不明」，不自動重試 |

  - **等待秒數**：先讀 `Retry-After` 標頭，沒有時讀回應 JSON 的 `retry_after`；兩者都沒有時，改用退避間隔。
  - **退避間隔**：`5xx`、連線失敗與沒有等待秒數的 `429`，第 1、2、3 次自動重試分別等 2、4、8 秒。
  - **重試上限**：可重試的結果在 `auto_retry_count` 已達 3 時，改標「送出失敗」，失敗原因為最後一次的原因。
  - **速率限制標頭**：每次收到回應時，把 `X-RateLimit-Remaining` 與 `X-RateLimit-Reset-After` 回報給第 2 主題的送出程序。
- **Rationale**:
  - 對應使用者技術限制「呼叫 Discord Webhook（用 `?wait=true` 確認送達，處理 `429` 與 `Retry-After`）」。查證 Discord 官方文件 Execute Webhook：`wait` 預設 `false`，此時回 `204 No Content`，且「沒有儲存的訊息也不會回錯誤」；`wait=true` 會等伺服器確認並回傳建立的訊息，所以能確認送達並取得 FR-017 要記錄的訊息編號。
  - 查證 Discord 官方文件 Rate Limits：超過限制時回 `429` 與 JSON（`retry_after` 為秒數，浮點數），應依 `Retry-After` 標頭或 `retry_after` 欄位決定等待時間；文件範例的標頭是 `65`、欄位是 `64.57`，標頭是進位後的整數，不會比欄位短。依使用者限制原話「處理 `429` 與 `Retry-After`」，優先採用標頭。`> 60` 秒直接標「送出失敗」，滿足 FR-014 與 Clarifications「Discord 要求等待超過 1 分鐘時直接標成送出失敗」、US1 驗收情境 15。
  - 只有確定 Discord 沒收到時才自動重試，滿足 FR-014、FR-016 與 Clarifications「只有連線在訊息送出前就失敗才自動重試」。本機 Node.js 26.8.2 實測：連線被拒時 `cause.code` 為 `ECONNREFUSED`（`localhost` 解析出兩個位址時是 `AggregateError`，`code` 同樣是 `ECONNREFUSED`）；DNS 失敗為 `ENOTFOUND`；伺服器讀完請求內容後中斷連線為 `UND_ERR_SOCKET`；`AbortSignal.timeout` 到期為 `TimeoutError`。undici 官方文件說明 `UND_ERR_CONNECT_TIMEOUT` 表示連線還沒建立，`UND_ERR_SOCKET` 是一般的連線錯誤，可能發生在請求送出之後。因此可重試清單只列連線建立前的錯誤；不在清單內的錯誤一律標「結果不明」，最壞情況只是多一則需要管理員確認的通知，不會重複送出。
  - FR-016 的 10 秒由 `AbortSignal.timeout(10_000)` 實作，逾時一律標「結果不明」，滿足 US1 驗收情境 8、12 與 SC-003「自動重送次數為 0」。
  - Webhook 已失效（`404`）、沒有設定、內容被拒（`400`）都不會自己恢復，不自動重試，滿足 FR-015 與 US1 驗收情境 7。
  - 自動重試最多 3 次滿足 FR-014 與 US1 驗收情境 6；退避間隔 2、4、8 秒合計 14 秒，加上 4 次請求，仍遠低於 FR-001 的 10 分鐘。spec 沒有規定 `5xx` 的等待時間，這是實作選擇。
  - 依 `X-RateLimit-Remaining` 先暫停，避免一次送出大量通知時連續收到 `429`、耗盡 3 次重試而標成「送出失敗」，保護 SC-001 與 SC-003。
  - `allowed_mentions.parse` 設為空陣列，成員姓名或設備名稱即使含有 `@everyone` 等字樣，也不會在頻道中提及他人；通知內容仍依 FR-013 原樣顯示。
  - 自動檢查、手動檢查與重送都經過同一個 `send`，滿足 FR-009「使用相同的通知規則」與 FR-005「重送時依 FR-014～FR-016 處理」。
  - 受影響的必須規則：FR-005、FR-009、FR-013、FR-014、FR-015、FR-016、FR-017、SC-003、NFR-002（失敗原因要明確）、NFR-003；比對的其他操作：自動檢查、手動檢查、重送、系統恢復運作時的處理（本次新增）。
- **Alternatives considered**:
  - **不加 `?wait=true`**：Discord 回 `204` 且不回傳訊息，沒有儲存的訊息也不回錯誤，無法確認送達，也拿不到 FR-017 的訊息編號；違反使用者「用 `?wait=true` 確認送達」的限制。
  - **以 `retry_after` 欄位優先、標頭為輔**：欄位精度較高，但使用者限制明確寫 `Retry-After`；標頭是進位後的整數，等待時間只會較長，比較不會再次收到 `429`。
  - **discord.js 的 `WebhookClient`**：內建的請求佇列會自行重試 `429` 與 `5xx`，失敗分類被包在套件內，無法逐次記錄嘗試次數與原因；連線中斷後的自動重試可能造成重複通知，違反 FR-016。
  - **axios**：多一個套件；內建 `fetch` 搭配 `AbortSignal.timeout` 已能設定 10 秒逾時並取得錯誤代碼。
  - **npm `undici` 套件的 `RetryHandler`**：預設可重試的錯誤包含 `ECONNRESET`、`EPIPE`、`UND_ERR_SOCKET`，這些可能發生在請求送出之後，重試會造成重複通知，違反 FR-016；重試狀態只存在記憶體，違反 FR-021。
  - **以 `node:https` 的 `request` 追蹤連線建立事件來分辨送出前或送出後**：分辨得更精確，但要分別處理 `http`（本機模擬器）與 `https`（Discord），程式較多；錯誤代碼清單已能保證只在確定沒送出時重試，誤判只會多一則「結果不明」。
  - **只在收到 `429` 時才等待，不讀速率限制標頭**：一次送出大量通知時會連續收到 `429`，耗盡 3 次重試後標成「送出失敗」，管理員要逐則重送。

---

## 4. 管理員通知紀錄、重送與手動檢查 API，以及並發控制 (Express 5 + zod 4 + PostgreSQL 18 唯一索引與條件式更新)

- **Decision**: 沿用 **Express 5**、**zod 4** 與 **TypeScript 6.0**，在 `apps/equipment-loan/backend/` 新增 `overdueNotificationService` 與三個管理員端點，掛在既有 `requireAuth`、`requireAdmin` 之後；所有寫入以 **PostgreSQL 18** 的單一語句完成，維持 `READ COMMITTED`：
  - **通知紀錄（`GET /api/admin/overdue-notifications`）**：zod 驗證查詢參數 `status`（四種狀態之一，可省略）與既有的 `page`、`pageSize`；依 `created_at` 由新到舊排序，每則回傳設備編號與名稱、成員姓名、預約日期與時段、狀態、嘗試次數、最後嘗試時間、送出時間、失敗原因、借用是否已歸還（`loanReturned`），以及可否重送（`canResend`：狀態為 `failed` 或 `unknown`，且預約仍為 `checked_out`）。
  - **重送（`POST /api/admin/overdue-notifications/:notificationId/resend`）**：
    1. 以一條條件式更新領取重送權：`UPDATE overdue_notifications n SET status = 'sending', next_attempt_at = $now, auto_retry_count = 0, failure_reason = NULL, updated_by = 管理員, updated_at = $now FROM reservations r WHERE n.id = $1 AND r.id = n.reservation_id AND n.status IN ('failed', 'unknown') AND r.status = 'checked_out' RETURNING n.id`。
    2. 有更新到時，回 `202 Accepted` 與狀態為「送出中」的通知，不等送出結果；送出由第 2 主題的送出程序在 1 秒內接手。
    3. 沒有更新到時，重新讀取通知與預約，依序判斷：通知不存在回 `404 RESOURCE_NOT_FOUND`；借用已歸還回 `409 OVERDUE_LOAN_RETURNED`「借用已歸還，不需要重送」；狀態為送出中或送出成功時回 `409 OVERDUE_NOTIFICATION_NOT_RESENDABLE`，訊息說明目前狀態。
  - **手動逾期檢查（`POST /api/admin/overdue-checks`）**：呼叫第 2 主題的 `runOverdueCheck(now)`，回 `200` 與 `{ createdCount }`，不等通知送出。
  - 新錯誤碼加入既有 `ErrorCode` 與 `errorHandler`，訊息使用繁體中文；一般成員呼叫三個端點時，沿用 `requireAdmin` 回 `403 FORBIDDEN`。
- **Rationale**:
  - 符合使用者技術限制「沿用 007 techstack」：HTTP 框架、驗證套件與錯誤格式沿用 005～007 的作法。沿用的理由是三個端點都是一般的管理員查詢與寫入，既有 Express 5 與 zod 4 已能處理。
  - 重送只用一條條件式更新：兩位管理員同時重送同一則通知時，後執行的語句等前一個交易提交後重新檢查條件，看到狀態已是 `sending`，更新 0 列並回 `409`，所以 Discord 只收到一次，滿足 FR-018 與 US2 驗收情境 14。
  - 手動檢查與自動檢查同時執行時，`INSERT ... ON CONFLICT (reservation_id) DO NOTHING` 讓後寫入的一方等前一方提交後略過，同一筆借用只有一則通知，滿足 FR-012、FR-018、SC-002 與 US3 驗收情境 4。
  - 重送不等結果，滿足 FR-005 與 Clarifications「重送不等結果，系統立即把通知標成送出中並回到清單」；手動檢查不等送出，滿足 FR-010。
  - NFR-001 與 SC-005 要求 100 筆以內手動檢查 `< 2 秒`：檢查是一條 `INSERT ... SELECT`，只掃描 `checked_out` 預約並寫入 100 列，預估 `< 100ms`。
  - 判斷順序先看借用是否已歸還，再看通知狀態：FR-008 規定借用已歸還時「收到重送時必須拒絕並顯示『借用已歸還，不需要重送』」，不分通知狀態；其餘依 FR-007 說明目前狀態。只對 `failed`、`unknown` 開放重送，滿足 FR-007 與 US2 驗收情境 10、11、13。
  - 三個端點都要管理員權限，滿足 FR-019、SC-007、US2 驗收情境 15、US3 驗收情境 5，以及憲法 `.agents/constitution/skills/api-plan/openapi.md` 的權限錯誤規則。
  - 受影響的必須規則：FR-003～FR-010、FR-012、FR-018、FR-019、NFR-001、SC-002、SC-004、SC-005；比對的其他操作：自動檢查、送出程序（本次新增），以及登記歸還（既有操作）。登記歸還在重送語句之前提交時，重送被拒絕；在之後提交時，重送已經開始，通知狀態依送出結果變化，符合 Edge Cases「通知送出中時借用被歸還：通知的狀態不變」。
- **Alternatives considered**:
  - **先讀取通知狀態，再在應用層判斷後更新**：兩位管理員同時通過判斷時，同一則通知會被送出兩次，違反 FR-018 與 US2 驗收情境 14。
  - **把重送交易改成 `SERIALIZABLE` 隔離等級**：衝突時以 `40001` 失敗，要另外寫重試迴圈；條件式更新只讓真正衝突的請求失敗。
  - **PostgreSQL advisory lock（`pg_advisory_xact_lock`）**：鎖的鍵值要由通知 ID 自行換算，而且仍要另外檢查狀態；條件式更新在同一條語句中完成檢查與寫入。
  - **Redis 分散式鎖**：要新增 Redis 服務；唯一索引與條件式更新已能保證不重複。
  - **重送與手動檢查在 API 內同步等 Discord 結果**：重送違反 Clarifications「重送不等結果」；手動檢查有 100 則通知時最多要等 100 次 10 秒，違反 NFR-001 的 2 秒。

---

## 5. Webhook URL 設定與機密保護（`.env`、不 commit、log 不印完整 URL）(Node.js 24 `--env-file-if-exists` + zod 4)

- **Decision**: 在 `apps/equipment-loan/backend/.env` 新增三個設定，並以 **Node.js 24 LTS 以上**的命令列旗標 `--env-file-if-exists=.env` 載入（經 **`tsx`** 傳給 Node.js）：
  - **設定項目**：`DISCORD_WEBHOOK_URL`（Webhook 位址）、`OVERDUE_AUTO_CHECK_ENABLED`（預設 `true`）、`OVERDUE_CHECK_INTERVAL_SECONDS`（預設 `60`）。
  - **`.env.example`**：列出三個設定，`DISCORD_WEBHOOK_URL` 填第 6 主題本機模擬器的位址 `http://127.0.0.1:4010/api/webhooks/000000000000000000/simulator-token`。`.env` 已由 `apps/equipment-loan/.gitignore` 忽略，不 commit。
  - **載入方式**：後端 `package.json` 的 `dev` 改為 `tsx watch --env-file-if-exists=.env src/server.ts`，`db:seed` 改為 `tsx --env-file-if-exists=.env prisma/seed.ts`。
  - **設定驗證**：新增 `src/config/notificationConfig.ts`，啟動時以 **zod 4** 驗證三個設定。`DISCORD_WEBHOOK_URL` 必須是 `http` 或 `https` 位址；空白或格式錯誤時視為「沒有設定」，後端照常啟動，通知依第 3 主題標成「送出失敗」（`webhook_not_configured`）。log 只寫「DISCORD_WEBHOOK_URL 沒有設定或格式不正確」，不寫輸入值。
  - **使用範圍**：Webhook 位址只交給 `discordWebhookClient`，其他模組只拿到 `isWebhookConfigured`。
  - **log 規則**：送出相關的 log 只寫通知 ID、狀態、失敗原因 Enum、HTTP 狀態碼與錯誤代碼（例如 `ECONNREFUSED`），不寫請求 URL、請求物件、回應物件與錯誤物件原文；需要標示目的地時只寫主機名稱（例如 `discord.com`），不寫路徑。
- **Rationale**:
  - 對應使用者技術限制「Webhook URL 放在 `.env`，不 commit，log 不印完整 URL」。採用的解讀：spec 的 NFR-003 比使用者限制更嚴格，規定 Webhook 位址「不得出現在任何畫面、通知紀錄、失敗原因、錯誤提示與系統紀錄檔中」，所以 log 連部分路徑也不印，只印主機名稱；Webhook ID 與 token 都在路徑中。這同時滿足 SC-006「出現次數為 0」。
  - 查證現況：後端沒有任何載入 `.env` 的程式，`tsx` 也不會自動載入；`DATABASE_URL` 能運作，只是因為程式中的預設值剛好和 `.env.example` 相同。所以本次必須加上載入方式，否則 `.env` 中的 Webhook 位址不會生效。
  - 查證 Node.js 24 官方文件：`--env-file-if-exists` 在 v24.10.0 起為穩定功能，檔案不存在時不報錯；同名變數以真實環境變數優先，測試與 Playwright 可以直接以環境變數覆寫。本機實測 `tsx` 4 會把這個旗標傳給 Node.js：檔案存在時讀得到變數，檔案不存在時只顯示提示並繼續執行。
  - 沒有設定時不讓後端停止，而是把通知標成「送出失敗」，滿足 FR-015 與 Edge Cases「Webhook 沒有設定或已失效……失敗原因不顯示 Webhook 位址」。
  - zod 4 沿用 005～007 的輸入驗證套件，沿用的理由是設定驗證和請求驗證是同一類工作。
  - 失敗原因只存 Enum（第 1 主題），API 錯誤訊息由錯誤碼對應，畫面、通知紀錄與錯誤提示都不會帶出位址，滿足 NFR-003。
  - 受影響的必須規則：NFR-003、SC-006、FR-015；比對的其他操作：自動檢查、手動檢查、重送、送出程序（本次新增），以及既有 `errorHandler` 的 `console.error(err)`（既有程式）。Discord 相關錯誤在 `discordWebhookClient` 內就轉成分類結果，不會拋到 `errorHandler`。
- **Alternatives considered**:
  - **dotenv 套件**：多一個套件，提供的功能 Node.js 24 已內建。
  - **在 `src/server.ts` 呼叫 `process.loadEnvFile()`**：ES Module 的 `import` 會先執行，`src/db/prisma.ts` 在匯入時就讀取 `DATABASE_URL`，這時 `.env` 還沒載入；檔案不存在時還會拋錯，要另外處理。
  - **pino 搭配 `redact` 設定**：多一個套件；`redact` 依物件路徑遮蔽，遮不到寫在訊息字串中的位址。本次的作法是位址從頭就不進 log。
  - **把 Webhook 位址存在資料庫，由管理員在畫面設定**：違反 Out of Scope「在畫面上設定通知」，而且位址會出現在畫面與資料庫中，違反 NFR-003。

---

## 6. 本機 Discord Webhook 模擬器（可切換成功、`429`、`5xx`、逾時）(Node.js 24 `node:http` + `tsx`)

- **Decision**: 以 **Node.js 24 LTS 以上**內建的 `node:http` 自行撰寫模擬器 `apps/equipment-loan/backend/scripts/discordWebhookSimulator.ts`，以 **`tsx`** 執行（後端 `package.json` 新增 `discord:sim` 指令），預設監聽 `127.0.0.1:4010`（`DISCORD_SIM_PORT` 可改）。同一個檔案匯出 `createDiscordWebhookSimulator()`，整合測試以連接埠 `0` 在測試程序內啟動：
  - **Webhook 端點 `POST /api/webhooks/:webhookId/:token`**：依目前模式回應：

    | 模式 | 回應 |
    |---|---|
    | `success` | 有 `?wait=true` 時回 `200` 與 `{ id, channel_id, content, timestamp }`（`id` 為遞增的 snowflake 字串）；沒有時回 `204`，方便抓出漏加 `wait` 的錯誤 |
    | `rate_limit` | `429`、`Retry-After` 標頭與 `{ message, retry_after, global: false }`；秒數由 `retryAfterSeconds` 設定（預設 `2`，可設 `120` 測試超過 1 分鐘） |
    | `server_error` | `statusCode` 設定的 `5xx`（預設 `500`） |
    | `timeout` | 讀完請求後不回應 |
    | `disconnect` | 讀完請求後直接中斷連線 |
    | `not_found` | `404` 與 `{ message: "Unknown Webhook", code: 10015 }` |

  - **`failTimes`**：前 N 次請求依模式回應，之後改回 `success`，用來示範「`429` 後重試成功」與「重試 3 次仍失敗」。
  - **每次回應都附上 `X-RateLimit-Remaining` 與 `X-RateLimit-Reset-After`**。
  - **控制端點**：`GET /__sim/state` 查看模式；`PUT /__sim/mode` 以 JSON `{ mode, retryAfterSeconds?, statusCode?, failTimes? }` 切換模式，不必重啟；`GET /__sim/messages` 列出收到的訊息；`DELETE /__sim/messages` 清空紀錄。啟動時也可以用 `--mode=<模式>` 指定初始模式。
  - **連線在送出前失敗**：停止模擬器即可，後端呼叫時得到 `ECONNREFUSED`。
  - **模擬器的 log**：只寫模式與收到的訊息數，不寫請求路徑。
- **Rationale**:
  - 對應使用者技術限制「可切換成功、`429`、`5xx`、逾時的本機模擬器」：四種情況都是模式之一，以控制端點在執行中切換，步驟 9 的使用者驗證不必重啟後端或模擬器。
  - 涵蓋 spec 的失敗情境：US1 驗收情境 5（`429` 後成功，`failTimes = 1`）、6（`5xx` 連續 4 次）、7（`404`）、8（逾時）、11（停止模擬器後再啟動）、12（`disconnect`）、15（`retryAfterSeconds = 120`），以及 SC-003。
  - 模擬器走真實的 HTTP 連線，後端看到的錯誤和連線真實的 Discord 時相同。本機實測：伺服器讀完請求內容後中斷連線，`fetch` 得到 `UND_ERR_SOCKET`；不回應時，`AbortSignal.timeout` 到期得到 `TimeoutError`。這讓第 3 主題的分類能被直接驗證。
  - 收到的訊息清單可以驗證「頻道只有一則」，支援 SC-002、US1 驗收情境 4、5、11 與 US2 驗收情境 14。
  - 同一份程式同時供整合測試與手動展示使用，兩邊行為一致；只用 Node.js 內建模組與既有 `tsx`，不新增套件。`tsx` 沿用的理由是後端已用它執行 TypeScript。
  - 受影響的必須規則：FR-014、FR-015、FR-016、SC-003、NFR-003；模擬器不參與正式操作，只提供可重現的回應。
- **Alternatives considered**:
  - **真實的 Discord 測試頻道**：無法隨時產生 `429`、`5xx`、逾時與送出後中斷，只能驗證成功的情況。
  - **WireMock（Docker 容器）**：要在 `docker-compose.yml` 新增一個 Java 容器；要回傳含遞增 `id` 的 Discord 訊息格式，得另寫回應樣板，比自寫的模擬器更複雜。
  - **msw（Mock Service Worker）**：只在測試程序內攔截請求，步驟 9 執行中的後端用不到；模擬的連線錯誤是一般 `TypeError`，沒有 `ECONNREFUSED`、`UND_ERR_SOCKET` 等代碼，無法驗證第 3 主題的分類。
  - **nock**：同樣只在測試程序內攔截，限制同 msw。
  - **npm `undici` 套件的 `MockAgent`**：只在測試程序內有效，而且要額外安裝 `undici` 才能指定給 `fetch`。

---

## 7. 逾期通知紀錄頁、重送確認視窗與立即檢查逾期 (React 19 + Vite 8)

- **Decision**: 沿用 **React 19**、**Vite 8**、**`@vitejs/plugin-react` 6**、**TypeScript 6.0**、**ESLint 10**、**`typescript-eslint` 8** 與 **Prettier**，在 `apps/equipment-loan/frontend/` 擴充既有管理員畫面，不新增套件：
  - **管理員頁籤新增「逾期通知紀錄」（`OverdueNotificationsView.tsx`）**：表格欄位依 FR-003；送出成功顯示送出時間，送出失敗顯示失敗原因；顯示借用「借用中」或「已歸還」；狀態篩選下拉選單（全部、送出中、送出成功、送出失敗、結果不明）；依 `canResend` 顯示「重送」按鈕；提供「重新整理」按鈕。
  - **重送**：「送出失敗」直接呼叫重送 API；「結果不明」先開啟自製確認視窗 `ResendUnknownDialog.tsx`，寫法沿用既有 `RescheduleDialog.tsx`，提醒先到 Discord 頻道確認沒收到、重送可能造成重複通知；收到 `202` 後重新拉取清單，這則通知顯示「送出中」；收到 `409` 時顯示 API 的繁體中文訊息。
  - **「立即檢查逾期」按鈕**：`createdCount > 0` 時顯示「這次建立 N 則逾期通知」，為 `0` 時顯示「沒有新的逾期借用」，然後重新拉取清單。
  - 狀態標籤、失敗原因、確認視窗文字與新錯誤碼說明集中加入既有 `src/text/zh-TW.ts`。
- **Rationale**:
  - 符合使用者技術限制「沿用 007 techstack」：管理員頁籤、自製對話框與 `zh-TW.ts` 都已存在。沿用的理由是本次只多一個清單頁與一個確認視窗，既有元件寫法已能涵蓋。
  - 滿足 FR-003、FR-004、FR-006、FR-007、FR-008 與 US2 驗收情境 1～13；重送後不等結果、由管理員重新整理看到結果，滿足 FR-005 與 Clarifications「送出結束後，管理員重新整理清單看到結果」。
  - 「立即檢查逾期」只等 API 回傳建立數量，滿足 FR-010；NFR-001 要求 100 筆以內 `< 2 秒`，API 預估 `< 100ms`（第 4 主題），加上重新拉取清單一次，預估 `< 500ms`。
  - 所有新文字使用臺灣繁體中文並集中管理，滿足 NFR-002。
  - 受影響的必須規則：FR-003～FR-010、NFR-002；比對的其他操作：自動檢查與送出程序（本次新增，會在管理員開著頁面時改變通知狀態）。畫面不自動更新，管理員重新整理時看到最新狀態；按鈕依伺服器回傳的 `canResend` 顯示，過時的畫面送出重送時由第 4 主題拒絕（US2 驗收情境 13）。
- **Alternatives considered**:
  - **TanStack Query 定時輪詢清單**：Clarifications 已決定由管理員重新整理看到結果，不需要自動更新；多一個套件。
  - **Socket.IO 或 Server-Sent Events 即時推播通知狀態**：spec 沒有即時更新的需求；第 1 次迭代的技術限制是「除非需求需要即時推播，否則不引入 Socket.IO」。
  - **瀏覽器內建 `window.confirm`**：文字樣式和既有自製對話框不一致；既有 Playwright 測試都操作自製對話框，原生對話框要另寫事件處理。
  - **Radix UI Dialog 等對話框元件套件**：既有對話框都是自製的，只多一個確認視窗，不值得新增套件與第二種寫法。
  - **新增獨立頁面並引入 React Router**：沿用 005～007 以頁籤切換、不引入前端路由的決定，新頁籤放在既有管理員區塊即可。

---

## 8. 通知測試、並發與遷移驗證、前五版回歸與 Demo Seed (Vitest 5 + Supertest 7 + Playwright 1.65)

- **Decision**: 沿用 **Vitest 5**、**Supertest 7** 與 **Playwright（`@playwright/test` 1.65）**，資料庫用真實的 **PostgreSQL 18** 測試資料庫，Discord 用第 6 主題的模擬器：
  - **後端整合測試（Vitest 5 + Supertest 7）**：
    - 每個測試檔以 `createDiscordWebhookSimulator()` 在連接埠 `0` 啟動模擬器，並以環境變數把 `DISCORD_WEBHOOK_URL` 指向它。
    - 不啟動真實計時器，直接呼叫匯出的 `runOverdueCheck(now)`、`dispatchDueNotifications(now)`、`recoverInterruptedNotifications(now)`，搭配 `vi.setSystemTime` 固定時間；新測試不依賴執行當下的台北時間。
    - 涵蓋 US1～US3 的驗收情境與 FR-001～FR-021 的成功與拒絕路徑。
    - 並發：以 `Promise.all` 同時執行手動檢查與自動檢查，重複 20 輪，每輪驗證每筆借用只有 1 則通知、模擬器只收到 1 則訊息（SC-002）；同時送出兩個重送，驗證模擬器只收到 1 次（US2 驗收情境 14）。
    - 效能：建立 100 筆逾期借用後量測手動檢查的回應時間 `< 2 秒`（NFR-001、SC-005）。
    - 機密：以 `vi.spyOn` 收集 `console.log`、`console.warn`、`console.error` 的輸出，連同所有 API 回應與 `overdue_notifications` 的內容，搜尋 Webhook 位址的 token，出現次數必須為 0（SC-006）。
    - 回歸：重跑 003～007 全套整合測試（SC-007）。
  - **遷移測試（Vitest 5 + `pg`）**：在獨立測試資料庫依序執行 008 之前的 `migration.sql`，寫入各種狀態的預約、借用、改期申請與設備狀態變更紀錄，再執行 008 的 `migration.sql`，驗證既有資料列數與欄位值不變、`overdue_notifications` 已建立且是空表（FR-020、US1 驗收情境 10）。
  - **展示資料重設（`backend/prisma/seed.ts`）**：
    - `deleteMany` 先清除 `overdue_notifications`，再清除 `reservations`。
    - 依執行當下的 `Asia/Taipei` 日期，以「昨天」的時段動態建立「借用中」的逾期借用：其中 3 筆各配一則「送出成功」（含假的訊息編號）、「送出失敗」（含失敗原因）、「結果不明」通知，另外至少 1 筆沒有通知，供手動檢查示範。
    - 保留 007 的範例（FR-020、US2 驗收情境 16、US3 驗收情境 6）。
    - README 寫明：展示 US3 手動檢查前，先在 `.env` 設 `OVERDUE_AUTO_CHECK_ENABLED=false` 並重啟後端。
  - **端對端測試（Playwright 1.65）**：
    - 在 `apps/equipment-loan/e2e/` 新增：管理員查看逾期通知紀錄與篩選、重送「送出失敗」、「結果不明」的確認視窗、立即檢查逾期，以及前五版核心流程回歸。
    - Playwright 啟動後端時以環境變數設定 `OVERDUE_AUTO_CHECK_ENABLED=false`，並啟動模擬器。
- **Rationale**:
  - 符合使用者技術限制「沿用 007 techstack」：測試工具全部沿用。沿用的理由是本次新增的驗證需求（時間、並發、外部服務失敗、遷移、端對端）都能用既有 Vitest、Supertest、`pg` 與 Playwright 表達，外部服務由第 6 主題的模擬器提供。
  - 直接呼叫排程函式並固定時間，讓 FR-001、FR-011 的「時段結束後」與 FR-014 的重試間隔不必等真實時間；第 2 主題讓 SQL 使用應用程式傳入的時間，所以 `vi.setSystemTime` 對資料庫查詢也有效。
  - SC-002 與 FR-018 是並發性質，只有真實 PostgreSQL 才能驗證唯一索引、條件式更新與 `FOR UPDATE SKIP LOCKED`；重複多輪可以涵蓋兩種先後順序。
  - SC-006 要求出現次數為 0，所以收集 log、API 回應與資料庫內容一起搜尋，而不是只檢查程式碼。
  - FR-020 要求 demo seed 包含未通知的逾期借用與三種狀態的通知；用「昨天」的時段，任何時間執行 seed 都已逾期，不受當天時段是否結束影響。
  - 自動檢查的開關依使用者經 `clarify` 決定（2026-11-11）：展示與 Playwright 測試 US3 時關閉自動檢查，讓「剛執行 demo seed 後手動檢查至少建立 1 則」穩定成立。
  - FR-020 的無損遷移要在 008 之前插入舊資料才能驗證，`prisma migrate deploy` 只能一次套用全部 Migration，所以沿用 007 以 `pg` 逐支執行 `migration.sql` 的作法。
- **Alternatives considered**:
  - **啟動真實計時器並等待 60 秒的檢查間隔**：測試時間變長，結果受執行速度影響。
  - **以 msw 或 nock 在測試程序內模擬 Discord**：拿不到 `ECONNREFUSED`、`UND_ERR_SOCKET` 等錯誤代碼，無法驗證第 3 主題的分類（見第 6 主題）。
  - **以今天的時段建立 demo seed 的逾期借用**：中午 12:00 前執行 seed 時，今天沒有任何時段已結束，就沒有逾期借用可以展示。
  - **遷移只以 `prisma migrate deploy` 在空資料庫上驗證**：空資料庫沒有既有資料，測不到 FR-020 的無損保留。
