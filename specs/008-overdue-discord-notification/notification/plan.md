# 通知規劃：逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查

- spec：`specs/008-overdue-discord-notification/spec.md`
- 上游：`plan.md`、`research.md`、`techstack.md`、`data/data-model.dbml`、`contracts/openapi.yaml`、`ui/plan.md`、`ui/overdue-notifications.html`
- 負責介面：S1、S2、S3、N1、N2

## 1. 範疇

### 負責介面

| 介面 | 名稱 | 端點類型 | 本文件負責 | 需求依據 |
| ---- | ---- | -------- | ---------- | -------- |
| S1 | 逾期自動檢查排程 | 排程（程序內計時器 → 後端） | 依固定間隔執行逾期判定，為還沒有通知的逾期借用建立通知；B3 手動檢查呼叫同一個函式 `runOverdueCheck` | US1 情境 1–4、9；US3 情境 1–4、6；FR-001、FR-002、FR-009、FR-011、FR-012、FR-018；SC-001、SC-002 |
| S2 | 通知送出與自動重試程序 | 排程（程序內計時器 → 後端） | 領取到期的「送出中」通知，呼叫 N1，依回應分類寫入結果、安排自動重試，並依速率限制暫停 | US1 情境 5–8、11、12、15；US2 情境 5、14；FR-005、FR-014、FR-015、FR-016、FR-017、FR-018；SC-003、SC-004 |
| S3 | 系統恢復運作時中斷通知的處理 | 排程（程序內計時器 → 後端） | 程序啟動時，把「已送出、等待 Discord 回應」的通知改為「結果不明」，保留「等待自動重試」的通知 | US1 情境 13、14；FR-021 |
| N1 | Discord Webhook 逾期通知送出 | 通知服務（後端 → Discord Webhook） | 請求格式、逾時、回應分類、通知內容版面與 Webhook 位址保護 | US1 情境 1、5–8、11、12、15；FR-013、FR-014、FR-015、FR-016、FR-017；NFR-002、NFR-003；SC-006 |
| N2 | 本機 Discord Webhook 模擬器 | 通知服務（後端 → 本機 Discord 模擬器） | Webhook 端點、模式切換與收到訊息查詢的控制操作，以及每個模式重現的回應 | US1 情境 4–8、11、12、15；US2 情境 14；SC-002、SC-003 |

### 不在範疇

| 介面 | 名稱 | 理由 |
| ---- | ---- | ---- |
| （無） | — | `plan.md` 系統介面盤點中端點類型不是前端、後端、資料庫的介面只有 S1～S3、N1、N2，5 個都負責通知觸發、送出、重試或結果追蹤，全部列為負責介面 |

### 觸發條件

| 編號 | 條件 | 觸發介面 | 讀取的資料 | 需求 |
| ---- | ---- | -------- | ---------- | ---- |
| TR1 | `OVERDUE_AUTO_CHECK_ENABLED` 為 `true`，到了自動檢查時間；預約 `status = 'checked_out'`、`deleted_at` 為空，且 `reservation_date` 加 `time_slots.end_time`（依 `Asia/Taipei`）早於 `now`，`overdue_notifications` 沒有它的 `reservation_id` | S1 | `reservations.status`、`reservations.reservation_date`、`reservations.slot_id`、`reservations.deleted_at`、`time_slots.end_time`、`overdue_notifications.reservation_id` | FR-001、FR-002、FR-011、FR-012 |
| TR2 | 管理員呼叫 B3 `runOverdueCheck`（`POST /admin/overdue-checks`）；逾期判定與 TR1 相同，不受 `OVERDUE_AUTO_CHECK_ENABLED` 影響 | S1（由 B3 呼叫） | 同 TR1 | FR-009、FR-010、FR-011、FR-012 |
| TR3 | 通知 `status = 'sending'`，且 `next_attempt_at` 不晚於 `now`；S2 沒有因速率限制暫停 | S2 | `overdue_notifications.status`、`overdue_notifications.next_attempt_at` | FR-005、FR-014、FR-021 |
| TR4 | 程序啟動；通知 `status = 'sending'` 且 `next_attempt_at` 為空 | S3 | `overdue_notifications.status`、`overdue_notifications.next_attempt_at` | FR-021 |

管理員以 B2 `resendOverdueNotification` 重送時，B2 把通知改回 `sending` 並設定 `next_attempt_at = now`，之後由 TR3 接手送出（見第 2 節）。

## 2. 通知狀態與轉換

狀態來源：`data/data-model.dbml` 的 `Enum overdue_notification_status`（與 `contracts/openapi.yaml` 的 `OverdueNotificationStatus` 相同）

| 狀態值 | 意義 | 終態 | 需求 |
| ------ | ---- | ---- | ---- |
| `sending` | 送出中。`next_attempt_at` 有值：等待第一次送出或等待自動重試，Discord 確定沒收到；`next_attempt_at` 為空：請求已送出，正在等待 Discord 回應 | 否 | FR-005、FR-017、FR-021 |
| `sent` | 送出成功，已記錄 `sent_at` 與 `discord_message_id` | 是 | FR-007、FR-017 |
| `failed` | 送出失敗，已記錄 `failure_reason`；自動處理不再變更，借用仍為 `checked_out` 時只有管理員重送會離開此狀態 | 否 | FR-005、FR-014、FR-015、FR-017 |
| `unknown` | 結果不明，不確定 Discord 是否收到；自動處理不再變更，借用仍為 `checked_out` 時只有管理員確認後重送會離開此狀態 | 否 | FR-006、FR-016、FR-017、FR-021 |

| 從 | 事件 | 到 | 觸發介面 | 寫入欄位 | 需求 |
| -- | ---- | -- | -------- | -------- | ---- |
| （無） | 符合 TR1 或 TR2 | `sending` | S1 | `reservation_id`、`status = 'sending'`、`attempt_count = 0`、`auto_retry_count = 0`、`next_attempt_at = now`、`created_at`、`updated_at` | FR-001、FR-009、FR-012 |
| `sending` | 符合 TR3，S2 領取通知並提交 | `sending` | S2 | `next_attempt_at = NULL`、`attempt_count + 1`、`last_attempted_at = now`、`updated_at` | FR-005、FR-017、FR-018 |
| `sending` | N1 回應 `200` 且回應 JSON 有 `id` | `sent` | S2、N1 | `status`、`sent_at = now`、`discord_message_id`、`updated_at` | FR-017 |
| `sending` | N1 回應可重試（`429` 等待 60 秒以內、`5xx`、送出前連線失敗），`auto_retry_count` 小於 3 | `sending` | S2、N1 | `next_attempt_at = now + 等待秒數`、`auto_retry_count + 1`、`updated_at` | FR-014 |
| `sending` | N1 回應可重試，`auto_retry_count` 已達 3 | `failed` | S2、N1 | `status`、`failure_reason`（最後一次的原因：`rate_limited`、`discord_server_error` 或 `connection_failed`）、`updated_at` | FR-014 |
| `sending` | N1 回應 `429` 且等待秒數超過 60 | `failed` | S2、N1 | `status`、`failure_reason = 'rate_limited'`、`updated_at` | FR-014 |
| `sending` | N1 回應 `401`、`403`、`404`，其他 `4xx`，或沒有設定 Webhook 位址 | `failed` | S2、N1 | `status`、`failure_reason`（`webhook_invalid`、`message_rejected` 或 `webhook_not_configured`）、`updated_at` | FR-015 |
| `sending` | N1 等待 10 秒沒有回應、送出後連線中斷，或回應沒有訊息編號 | `unknown` | S2、N1 | `status`、`updated_at` | FR-016 |
| `sending` | 符合 TR4（程序啟動時仍在等待 Discord 回應） | `unknown` | S3 | `status`、`updated_at` | FR-021 |
| `failed` | 管理員以 B2 `resendOverdueNotification` 重送，借用仍為 `checked_out` | `sending` | B2 | `status`、`next_attempt_at = now`、`auto_retry_count = 0`、`failure_reason = NULL`、`updated_by`、`updated_at` | FR-005、FR-007、FR-008、FR-018 |
| `unknown` | 管理員在確認視窗確認後以 B2 `resendOverdueNotification` 重送，借用仍為 `checked_out` | `sending` | B2 | `status`、`next_attempt_at = now`、`auto_retry_count = 0`、`updated_by`、`updated_at` | FR-005、FR-006、FR-008、FR-018 |

- 登記歸還只更新 `reservations`，不修改 `overdue_notifications`。依使用者決定 UD2，通知在 `sending` 時借用被歸還，S2 照常送出，依 N1 的回應更新狀態；之後依 FR-008 不能重送。
- 重送不建立新列，`attempt_count` 不歸 0（SC-004）。

系統恢復運作時：

| 停止時的狀態 | 恢復後的處理 | 觸發介面 | 需求 |
| ------------ | ------------ | -------- | ---- |
| `sending`，`next_attempt_at` 為空（已送出、等待 Discord 回應） | 程序啟動時先改為 `unknown`，不自動重送 | S3 | FR-016、FR-021 |
| `sending`，`next_attempt_at` 有值（等待送出或等待自動重試） | 保留原值；S2 啟動後依 TR3 繼續送出，`auto_retry_count` 沿用，重試總數仍最多 3 次 | S2 | FR-014、FR-021 |
| `failed` | 維持原值，不自動處理 | — | FR-014、FR-015 |
| `unknown` | 維持原值，不自動處理 | — | FR-016 |
| （停機期間才逾期、還沒有通知的借用） | S3 完成後，S1 立即執行第一次自動檢查，依 TR1 建立通知 | S1 | FR-002 |

## 3. 失敗分類與重試界線

自動重試的上限與等待時間取自 spec FR-014 與 research §3：

- 每輪最多自動重試 3 次（含第一次送出，最多 4 次請求）；建立通知與管理員重送時 `auto_retry_count` 歸 0。
- 等待秒數：先讀 `Retry-After` 標頭，沒有時讀回應 JSON 的 `retry_after`，兩者都沒有時用退避間隔。
- 退避間隔：第 1、2、3 次自動重試分別等 2、4、8 秒。

| 回應 | 分類 | 對方是否收到 | 自動重試 | 等待與上限 | 最終狀態與原因 | 需求 |
| ---- | ---- | ------------ | -------- | ---------- | -------------- | ---- |
| `200` 且回應 JSON 有 `id` | 成功 | 是 | 否 | — | `sent` | FR-017 |
| `200` 但回應 JSON 沒有 `id`，或讀取回應內容失敗 | 結果不明 | 不確定 | 否 | — | `unknown`（`failure_reason` 為空） | FR-016、FR-017 |
| `204`（請求漏加 `wait=true`） | 結果不明 | 是 | 否 | — | `unknown`（拿不到 FR-017 要求的訊息編號，比照「`200` 沒有 `id`」） | FR-016、FR-017 |
| `429`，等待秒數 60 以內 | 暫時失敗 | 確定沒收到 | 是 | 依等待秒數；每輪最多 3 次 | `failed`／`rate_limited` | FR-014 |
| `429`，等待秒數超過 60 | 暫時失敗（超過等待上限） | 確定沒收到 | 否 | 不等待 | `failed`／`rate_limited` | FR-014 |
| `500`～`599` | 暫時失敗 | 確定沒收到（依 FR-014 視為沒收到，殘留風險見第 4 節） | 是 | 退避 2、4、8 秒；每輪最多 3 次 | `failed`／`discord_server_error` | FR-014 |
| 送出前連線失敗（`cause.code` 為 `ECONNREFUSED`、`ENOTFOUND`、`EAI_AGAIN`、`ENETUNREACH`、`EHOSTUNREACH`、`ENETDOWN`、`EHOSTDOWN`、`UND_ERR_CONNECT_TIMEOUT`） | 暫時失敗 | 確定沒收到 | 是 | 退避 2、4、8 秒；每輪最多 3 次 | `failed`／`connection_failed` | FR-014 |
| `401`、`403`、`404` | 永久失敗 | 確定沒收到 | 否 | — | `failed`／`webhook_invalid` | FR-015 |
| 其他 `4xx`（例如 `400`） | 永久失敗 | 確定沒收到 | 否 | — | `failed`／`message_rejected` | FR-015 |
| 沒有設定 Webhook 位址（不送出請求） | 永久失敗 | 確定沒收到 | 否 | — | `failed`／`webhook_not_configured` | FR-015 |
| 送出後 10 秒沒有回應（`TimeoutError`） | 結果不明 | 不確定 | 否 | — | `unknown`（`failure_reason` 為空） | FR-016 |
| 送出後連線中斷（`UND_ERR_SOCKET`、`ECONNRESET`、`EPIPE`），或其他不在上列的 `fetch` 錯誤 | 結果不明 | 不確定 | 否 | — | `unknown`（`failure_reason` 為空） | FR-016 |
| 等待 Discord 回應時程序停止 | 結果不明 | 不確定 | 否 | — | 啟動時由 S3 改為 `unknown` | FR-021 |

## 4. 重複處理

| 來源 | 防護 | 殘留風險 |
| ---- | ---- | -------- |
| 自動檢查與手動檢查同時找到同一筆逾期借用 | `overdue_notifications.reservation_id` 唯一約束 `uq_overdue_notifications_reservation`，以 `INSERT ... ON CONFLICT (reservation_id) DO NOTHING` 建立，後寫入的一方略過 | 無 |
| 已有通知的逾期借用在之後的檢查再被找到 | 同上；不論既有通知的狀態都不再建立 | 無 |
| 兩次送出程序同時領取同一則通知 | 領取語句使用 `FOR UPDATE SKIP LOCKED`，並在同一語句把 `next_attempt_at` 設為空；S2 上一次執行還沒結束時跳過這一次 | 無 |
| 兩位管理員同時重送同一則通知 | B2 以一條條件式更新（`status IN ('failed', 'unknown')` 且預約為 `checked_out`）領取重送權，後執行的一方更新 0 列並回 `409` | 無 |
| 自動重試時前一次其實已送達 | 只對「確定沒收到」的回應自動重試；送出後中斷、逾時與沒有訊息編號都標 `unknown`，不重試 | Discord 回 `5xx` 後仍建立了訊息時，頻道可能出現兩則相同的通知 |
| 送出前連線失敗的判定錯誤 | 可重試清單只列連線建立前的錯誤代碼，其他錯誤一律標 `unknown` | 無（誤判只會多一則需要管理員確認的 `unknown`） |
| 程序在等待 Discord 回應時停止 | 啟動時 S3 把這類通知改為 `unknown`，不自動重送 | 無（Discord 其實沒收到時，管理員要確認後手動重送） |
| 管理員重送 `unknown` 通知 | F2 重送前顯示確認視窗，提醒先到 Discord 頻道確認沒收到 | 管理員沒有確認、前一次其實已送達時，頻道會出現兩則相同的通知（spec Edge Cases） |
| 管理員重送 `failed` 通知 | `failed` 只來自確定沒收到的回應 | 前一次是 `5xx` 且 Discord 其實已建立訊息時，頻道會出現兩則相同的通知 |

## 5. 介面規格

### 5.1 S1 逾期自動檢查排程

- 觸發時機：
  - `server.ts` 呼叫 `start()`；`start()` 先完成 S3，再啟動 S1 與 S2。`app.ts` 不啟動排程。
  - `OVERDUE_AUTO_CHECK_ENABLED` 為 `true`（預設）時，S3 完成後立即執行一次 `runOverdueCheck(now)`，之後每 `OVERDUE_CHECK_INTERVAL_SECONDS` 秒執行一次（預設 60，允許 10～300）。
  - 以 `setTimeout` 串接：上一次執行結束後才排下一次。
  - `OVERDUE_AUTO_CHECK_ENABLED` 為 `false` 時不排自動檢查；B3 `runOverdueCheck` 照常呼叫同一個函式（TR2）。
- 時間來源：應用程式傳入的 `now`；SQL 不使用資料庫的 `now()`，測試以 `vi.setSystemTime` 固定時間（research §2、§8）。
- 讀取：TR1 列出的欄位。逾期判定只看預約狀態與時段，不讀 `equipments.status`（spec Edge Cases）。
- 寫入：以一條 `INSERT INTO overdue_notifications (...) SELECT ... ON CONFLICT (reservation_id) DO NOTHING RETURNING id` 建立通知，欄位依第 2 節第一列；回傳的列數就是 B3 回應的 `createdCount`。
- 重疊執行：
  - 自動檢查之間不會重疊（`setTimeout` 串接）。
  - 自動檢查與 B3 同時執行時，由唯一約束擋下後寫入的一方（第 4 節）。
  - 登記歸還在檢查語句之前提交時，該借用不再是 `checked_out`，不建立通知；在之後提交時，依 FR-011 已建立的通知保留。
- 系統恢復：程序啟動後的第一次自動檢查找出停機期間才逾期的借用（FR-002）；這時通知可能晚於時段結束後 10 分鐘。
- 時間預算：檢查最多延遲 60 秒（預設間隔），S2 在 1 秒內領取，N1 最多等 10 秒，合計約 71 秒，低於 FR-001 的 10 分鐘（research §2）。

### 5.2 S2 通知送出與自動重試程序

- 觸發時機：`start()` 啟動後每 1 秒執行一次 `dispatchDueNotifications(now)`；上一次執行還沒結束時跳過這一次。不受 `OVERDUE_AUTO_CHECK_ENABLED` 影響。
- 時間來源：應用程式傳入的 `now`。
- 處理方式：一次只處理一則通知，處理完再找下一則，直到沒有符合 TR3 的通知：
  1. 領取：`UPDATE overdue_notifications SET next_attempt_at = NULL, attempt_count = attempt_count + 1, last_attempted_at = $now WHERE id = (SELECT id FROM overdue_notifications WHERE status = 'sending' AND next_attempt_at <= $now ORDER BY next_attempt_at LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING ...`，並提交。
  2. 讀取通知內容的資料：`equipments.equipment_code`、`equipments.name`、`users.display_name`、`reservations.reservation_date`、`time_slots.name`、`time_slots.start_time`、`time_slots.end_time`。
  3. 依 5.4 組出通知內容；「已逾期多久」依送出當下的 `now` 計算，自動重試與重送都重新計算（FR-013）。
  4. 呼叫 N1 `discordWebhookClient.send(content)`，取得分類結果。
  5. 依第 2 節轉換表與第 3 節分類更新同一列。
- 借用已歸還：不檢查 `reservations.status`，照常送出（使用者決定 UD2）。
- 速率限制：N1 回報 `X-RateLimit-Remaining` 為 `0` 時，S2 暫停到 `X-RateLimit-Reset-After` 秒之後才領取下一則（research §2、§3）。
- 讀取：TR3 列出的欄位與上列內容資料。
- 寫入：依第 2 節，只寫 `overdue_notifications`。
- 重疊執行：同一程序內以「上一次還沒結束就跳過」避免重疊；多個領取者同時執行時`FOR UPDATE SKIP LOCKED` 讓同一則只被一個領取者領取。
- 系統恢復：等待送出或自動重試的通知（`next_attempt_at` 有值）由 S2 繼續處理，`auto_retry_count` 沿用（FR-021）；等待回應的通知已由 S3 先改為 `unknown`。

### 5.3 S3 系統恢復運作時中斷通知的處理

- 觸發時機：`start()` 的第一步，執行一次 `recoverInterruptedNotifications(now)`；完成後才啟動 S1 與 S2。
- 時間來源：應用程式傳入的 `now`。
- 讀取：`overdue_notifications.status`、`overdue_notifications.next_attempt_at`。
- 寫入：`UPDATE overdue_notifications SET status = 'unknown', updated_at = $now WHERE status = 'sending' AND next_attempt_at IS NULL`；`next_attempt_at` 有值的通知不修改。
- 重疊執行：只在啟動時執行一次，這時 S1、S2 還沒啟動，不會重疊。
- 系統恢復：本介面就是恢復處理。程序剛好在 S2 領取提交後、請求寫出前停止時，這則通知也會變成 `unknown`；Discord 沒收到，只會多一則需要管理員確認的通知，不會重複送出（research §2）。

### 5.4 N1 Discord Webhook 逾期通知送出

- 封裝：`discordWebhookClient.send(content)` 回傳分類結果（第 3 節），不向外拋出原始錯誤。Webhook 位址只交給 `discordWebhookClient`；其他模組只拿到 `isWebhookConfigured`。
- 請求：
  - 方法與位址：`POST` `DISCORD_WEBHOOK_URL`，以 `new URL(webhookUrl)` 加上 `searchParams.set("wait", "true")`。
  - 主要標頭：`Content-Type: application/json`。
  - 內容：`{ "content": <通知文字>, "allowed_mentions": { "parse": [] } }`；通知文字在 2000 字以內。
  - 逾時：`AbortSignal.timeout(10_000)`，涵蓋等待回應標頭與讀取回應內容（FR-016）。
  - 沒有設定 Webhook 位址時不送出請求，直接回傳 `webhook_not_configured`。
- 回應對照：依第 3 節。每次收到回應時，把 `X-RateLimit-Remaining` 與 `X-RateLimit-Reset-After` 回報給 S2。
- 通知內容逐行版面（依使用者決定 UD1；日期與時段寫法沿用 `ui/plan.md`）：

| 行 | 內容 | 來源 |
| -- | ---- | ---- |
| 1 | 【逾期未還】設備編號 設備名稱 | `equipments.equipment_code`、`equipments.name` |
| 2 | 借用成員：成員姓名 | `users.display_name` |
| 3 | 預約時段：YYYY-MM-DD（星期）時段名稱 HH:mm–HH:mm | `reservations.reservation_date`（依 `Asia/Taipei` 換算星期一～日）、`time_slots.name`、`time_slots.start_time`、`time_slots.end_time` |
| 4 | 已逾期 N 天 N 小時 N 分鐘 | 送出當下的 `now` 減去 `reservation_date` 加 `time_slots.end_time`（依 `Asia/Taipei`）；分鐘無條件捨去，只省略前面為 0 的單位（第一個不為 0 的單位之後都寫出）；不到 1 分鐘寫「已逾期不到 1 分鐘」 |

- 「已逾期多久」寫法對照：

| 逾期時間 | 第 4 行 |
| -------- | ------- |
| 40 秒 | 已逾期不到 1 分鐘 |
| 8 分 30 秒 | 已逾期 8 分鐘 |
| 2 小時 5 分 | 已逾期 2 小時 5 分鐘 |
| 3 小時 0 分 | 已逾期 3 小時 0 分鐘 |
| 1 天 3 小時 12 分 | 已逾期 1 天 3 小時 12 分鐘 |
| 2 天 0 小時 7 分 | 已逾期 2 天 0 小時 7 分鐘 |

- 填值範例：

```text
【逾期未還】EQ-102 四通道數位示波器 Keysight DSOX3024T
借用成員：陳冠廷
預約時段：2026-11-11（三）下午 13:00–17:00
已逾期 8 分鐘
```

- 機密：請求位址、請求物件、回應物件與錯誤物件原文都不寫進 log；需要標示目的地時只寫主機名稱（例如 `discord.com`），不寫路徑（NFR-003、research §5）。

### 5.5 N2 本機 Discord Webhook 模擬器

- 啟動：
  - 手動展示：後端 `package.json` 的 `discord:sim` 指令以 `tsx` 執行 `backend/scripts/discordWebhookSimulator.ts`，預設監聽 `127.0.0.1:4010`（`DISCORD_SIM_PORT` 可改），可用 `--mode=<模式>` 指定初始模式。
  - 整合測試：匯出的 `createDiscordWebhookSimulator()` 以連接埠 `0` 在測試程序內啟動，`DISCORD_WEBHOOK_URL` 指向它。
  - `.env.example` 的 `DISCORD_WEBHOOK_URL` 為 `http://127.0.0.1:4010/api/webhooks/000000000000000000/simulator-token`。
- 控制操作：

| 操作 | 請求 | 回應 | 錯誤回應 |
| ---- | ---- | ---- | -------- |
| 送出 Webhook 訊息 | `POST /api/webhooks/:webhookId/:token`，body 為 N1 的請求內容 | 依目前模式（見下表）；每次回應都附 `X-RateLimit-Remaining` 與 `X-RateLimit-Reset-After` | 依目前模式 |
| 查看目前模式 | `GET /__sim/state` | `200`，JSON 含 `mode`、`retryAfterSeconds`、`statusCode`、`failTimes` 與剩餘的 `failTimes` | — |
| 切換模式 | `PUT /__sim/mode`，JSON `{ mode, retryAfterSeconds?, statusCode?, failTimes? }` | `200`，回傳切換後的狀態（同 `GET /__sim/state`） | `mode` 不是 6 種模式之一、`statusCode` 不在 `500`～`599`、`retryAfterSeconds` 或 `failTimes` 不是 0 以上的整數：`400` `{"error": "invalid mode settings"}`，模式不變 |
| 列出收到的訊息 | `GET /__sim/messages` | `200`，訊息陣列（`id`、`content`、`timestamp`，依收到順序） | — |
| 清空收到的訊息 | `DELETE /__sim/messages` | `204` | — |
| 其他路徑 | 任何其他方法或路徑 | — | `404` `{"error": "not found"}` |

- 模式與重現的回應：

| 模式 | 回應 | 重現的分類（第 3 節） |
| ---- | ---- | ------------------- |
| `success` | 有 `?wait=true` 時記錄訊息並回 `200` 與 `{ id, channel_id, content, timestamp }`（`id` 為遞增的 snowflake 字串）；沒有時記錄訊息並回 `204` | 成功；`204`（漏加 `wait=true`） |
| `rate_limit` | `429`、`Retry-After` 標頭與 `{ message, retry_after, global: false }`，秒數由 `retryAfterSeconds` 設定（預設 2），不記錄訊息 | `429` 60 秒以內；`retryAfterSeconds = 120` 時為超過 60 秒 |
| `server_error` | `statusCode` 設定的 `5xx`（預設 `500`），不記錄訊息 | `500`～`599` |
| `timeout` | 讀完請求並記錄訊息後不回應 | 10 秒沒有回應 |
| `disconnect` | 讀完請求並記錄訊息後直接中斷連線 | 送出後連線中斷 |
| `not_found` | `404` 與 `{ message: "Unknown Webhook", code: 10015 }`，不記錄訊息 | `401`、`403`、`404` 中的 `404` |

- `failTimes`：前 N 次請求依目前模式回應，之後自動改回 `success`。
- 送出前連線失敗：停止模擬器，後端呼叫時得到 `ECONNREFUSED`。
- 沒有對應模式的分類：其他 `4xx`、`401`、`403`、`200` 沒有 `id`、沒有等待秒數的 `429`。依 `research.md` §6，整合測試以 `node:http` 在連接埠 `0` 臨時啟動只回傳固定回應的位址，`DISCORD_WEBHOOK_URL` 指向它，`discordWebhookClient.send` 經真實 `fetch` 收到回應後驗證分類；測試放在 `tests/integration/`，不新增單元測試（`plan.md` 的 `backend/tests/unit/` 本次不新增）。使用模擬器的整合情境與手動展示不涵蓋這 4 類（見 UC2）。
- 模擬器的 log 只寫模式與收到的訊息數，不寫請求路徑（路徑含 Webhook token）。

## 6. 紀錄需求

| 紀錄項目 | 寫入位置 | 寫入時機 | 不得記錄 | 需求 |
| -------- | -------- | -------- | -------- | ---- |
| 通知狀態、嘗試次數與最後嘗試時間 | `overdue_notifications.status`、`attempt_count`、`last_attempted_at` | 建立、S2 領取、每次轉換 | — | FR-003、FR-005、FR-017 |
| 本輪自動重試次數與下一次送出時間 | `overdue_notifications.auto_retry_count`、`next_attempt_at` | 建立、安排自動重試、S2 領取、B2 重送 | — | FR-014、FR-021 |
| 送出成功時間與 Discord 訊息編號 | `overdue_notifications.sent_at`、`discord_message_id` | N1 回應 `200` 且有 `id` 時 | — | FR-003、FR-017 |
| 失敗原因 | `overdue_notifications.failure_reason`（只存 6 種 Enum 值之一） | 轉為 `failed` 時；B2 重送時清為空 | 例外訊息原文、Webhook 位址 | FR-003、FR-014、FR-015、NFR-002、NFR-003 |
| 管理員重送者 | `overdue_notifications.updated_by` | B2 重送時；S1、S2、S3 寫入時為空 | — | FR-005 |
| 送出結果摘要 | 應用程式 log（`console`） | S2 每次處理完一則通知 | Webhook 位址的任何部分（含路徑、Webhook ID 與 token）、請求與回應物件、錯誤物件原文 | NFR-003、SC-006 |
| 送出結果摘要可寫的內容 | 同上 | 同上 | — | 通知 ID、狀態、失敗原因 Enum、HTTP 狀態碼、錯誤代碼（例如 `ECONNREFUSED`）、目的地主機名稱 |
| Webhook 位址設定錯誤 | 應用程式 log | 啟動時 `DISCORD_WEBHOOK_URL` 空白或格式錯誤 | 輸入值 | FR-015、NFR-003 |

## 7. 驗收情境

### NS1 時段結束後送出第一則通知

- 介面：S1、S2、N1、N2
- 需求：US1 情境 1；FR-001、FR-011、FR-013、FR-017；SC-001
- Given 陳冠廷借用 `EQ-102`，今天下午時段 `17:00` 結束，預約仍為 `checked_out`；N2 模式為 `success`；`now` 為 `17:08:30`
- When S1 執行，接著 S2 執行
- Then 建立 1 則通知並變成 `sent`，`attempt_count` 為 1，記錄 `sent_at` 與 `discord_message_id`；N2 收到 1 則訊息，內容與 5.4 的填值範例相同

### NS2 時段還沒結束或已歸還不建立通知

- 介面：S1
- 需求：US1 情境 2、3；FR-011
- Given 一筆 `checked_out` 預約的時段還沒結束；另一筆下午時段的預約在 `17:03` 已登記歸還（`returned`）
- When `17:05` S1 執行
- Then 兩筆預約都沒有通知

### NS3 已有通知的逾期借用不再建立

- 介面：S1、N2
- 需求：US1 情境 4；US3 情境 3；FR-012；SC-002
- Given 一筆逾期借用已有 `sent` 通知，另一筆已有 `failed` 通知，兩筆都仍為 `checked_out`
- When S1 再執行 3 次
- Then 兩筆借用仍各只有 1 則通知，原狀態不變，N2 沒有收到新訊息

### NS4 請求太頻繁、等待後重試成功

- 介面：S2、N1、N2
- 需求：US1 情境 5；FR-014；SC-003
- Given N2 模式為 `rate_limit`，`retryAfterSeconds = 2`、`failTimes = 1`
- When S2 執行一次，2 秒後再執行
- Then 第一次後通知仍為 `sending`，`next_attempt_at` 為 2 秒後、`auto_retry_count` 為 1；第二次後為 `sent`，`attempt_count` 為 2，N2 只有 1 則訊息

### NS5 請求太頻繁且要求等待超過 1 分鐘

- 介面：S2、N1、N2
- 需求：US1 情境 15；FR-014
- Given N2 模式為 `rate_limit`，`retryAfterSeconds = 120`
- When S2 執行
- Then 通知為 `failed`／`rate_limited`，`attempt_count` 為 1，之後的 S2 不再送出；畫面失敗原因為「Discord 請求太頻繁」

### NS6 伺服器錯誤自動重試 3 次仍失敗

- 介面：S2、N1、N2
- 需求：US1 情境 6；FR-014
- Given N2 模式為 `server_error`，`statusCode = 500`
- When S2 依退避間隔 2、4、8 秒執行到沒有到期通知
- Then 通知為 `failed`／`discord_server_error`，`attempt_count` 為 4、`auto_retry_count` 為 3，之後的 S2 不再送出，N2 沒有記錄訊息

### NS7 送出前連線失敗、恢復後重試成功

- 介面：S2、N1、N2
- 需求：US1 情境 11；FR-014
- Given N2 已停止
- When S2 執行一次（得到 `ECONNREFUSED`），之後啟動 N2（模式 `success`），2 秒後 S2 再執行
- Then 第一次後通知仍為 `sending`、`auto_retry_count` 為 1；第二次後為 `sent`，N2 只有 1 則訊息

### NS8 送出前連線一直失敗

- 介面：S2、N1
- 需求：FR-014；NFR-002
- Given N2 已停止
- When S2 依退避間隔執行到沒有到期通知
- Then 通知為 `failed`／`connection_failed`，`attempt_count` 為 4

### NS9 Webhook 已失效不重試

- 介面：S2、N1、N2
- 需求：US1 情境 7；FR-015
- Given N2 模式為 `not_found`
- When S2 執行
- Then 通知為 `failed`／`webhook_invalid`，`attempt_count` 為 1，之後的 S2 不再送出；失敗原因、API 回應與 log 都沒有 Webhook 位址

### NS10 沒有設定 Webhook 位址

- 介面：S2、N1
- 需求：FR-015；NFR-003
- Given `DISCORD_WEBHOOK_URL` 空白，後端照常啟動
- When S2 執行
- Then 不送出請求，通知為 `failed`／`webhook_not_configured`；log 只寫「DISCORD_WEBHOOK_URL 沒有設定或格式不正確」

### NS11 Discord 拒絕訊息內容

- 介面：N1
- 需求：FR-015
- Given 測試以 `node:http` 臨時啟動只回傳 `400` 的固定回應位址，`DISCORD_WEBHOOK_URL` 指向它（N2 沒有這個模式，依 `research.md` §6，見 UC2）
- When `discordWebhookClient.send` 經真實 `fetch` 送出並分類回應
- Then 結果為不可重試的 `message_rejected`，S2 據此把通知標為 `failed`／`message_rejected`；固定回應位址只收到 1 次請求

### NS12 等不到回應標為結果不明

- 介面：S2、N1、N2
- 需求：US1 情境 8；FR-016；SC-003
- Given N2 模式為 `timeout`
- When S2 執行，10 秒後請求逾時
- Then 通知為 `unknown`，`failure_reason` 為空；N2 有 1 則訊息；之後的 S2 不自動重送，N2 仍只有 1 則

### NS13 對方可能已收到、送出後連線中斷

- 介面：S2、N1、N2
- 需求：US1 情境 12；FR-016；SC-003
- Given N2 模式為 `disconnect`
- When S2 執行
- Then 通知為 `unknown`；N2 有 1 則訊息（Discord 可能已收到）；之後的 S2 不自動重送

### NS14 自動重試途中等不到回應

- 介面：S2、N1、N2
- 需求：FR-014、FR-016；spec Edge Cases 自動重試時又等不到回應或連線中斷
- Given N2 模式為 `server_error`、`failTimes = 1`，第一次失敗後改為 `timeout`
- When S2 執行兩次（間隔 2 秒）
- Then 第二次後通知為 `unknown`，`auto_retry_count` 為 1，不再自動重試

### NS15 回應沒有訊息編號

- 介面：N1
- 需求：FR-016、FR-017
- Given 測試以 `node:http` 臨時啟動回傳 `200` 但回應 JSON 沒有 `id` 的固定回應位址，`DISCORD_WEBHOOK_URL` 指向它（N2 沒有這個模式，依 `research.md` §6，見 UC2）
- When `discordWebhookClient.send` 經真實 `fetch` 送出並分類回應
- Then 結果為「結果不明」，通知標為 `unknown`，`failure_reason` 為空，不自動重試；固定回應位址只收到 1 次請求

### NS16 恢復時等待自動重試的通知繼續重試

- 介面：S3、S2、N2
- 需求：US1 情境 13；FR-021
- Given 一則通知 `status = 'sending'`、`next_attempt_at` 有值、`auto_retry_count = 2` 時程序停止；N2 模式為 `success`
- When 程序啟動，S3 執行後 S2 執行
- Then S3 不修改這則通知；S2 送出後通知為 `sent`，N2 只有 1 則訊息

### NS17 恢復時等待回應的通知標為結果不明

- 介面：S3
- 需求：US1 情境 14；FR-021
- Given 一則通知 `status = 'sending'`、`next_attempt_at` 為空時程序停止
- When 程序啟動，S3 執行
- Then 通知為 `unknown`；之後的 S2 不送出這則通知

### NS18 停機期間才逾期的借用

- 介面：S1、S2
- 需求：US1 情境 9；FR-002
- Given 程序停止期間，一筆 `checked_out` 預約的時段已經結束，還沒有通知；`OVERDUE_AUTO_CHECK_ENABLED` 為 `true`
- When 程序啟動
- Then S3 完成後的第一次 S1 為它建立 1 則通知，S2 送出

### NS19 手動檢查與自動檢查同時執行

- 介面：S1、N2
- 需求：US3 情境 4；FR-018；SC-002
- Given 一筆時段已結束、還沒有通知的 `checked_out` 預約；N2 模式為 `success`
- When 以 `Promise.all` 同時執行 B3 `runOverdueCheck` 與自動檢查，重複 20 輪（每輪重設資料）
- Then 每輪這筆借用都只有 1 則通知，兩邊的 `createdCount` 合計為 1，N2 只收到 1 則訊息

### NS20 重送「送出失敗」的通知由 S2 送出

- 介面：S2、N1、N2
- 需求：US2 情境 5、14；FR-005、FR-018；SC-004
- Given 一則 `failed`／`discord_server_error` 通知，`attempt_count = 4`，借用仍為 `checked_out`；N2 模式為 `success`
- When 兩位管理員同時以 B2 重送，之後 S2 執行
- Then 只有一個重送成功；通知變成 `sent`，`attempt_count` 為 5，通知總數不變，N2 只收到 1 則訊息，第 4 行依送出當下重新計算逾期時間

### NS21 送出中時借用被歸還，照常送出

- 介面：S2、N1、N2
- 需求：FR-008；spec Edge Cases 通知送出中或結果不明時借用被歸還
- Given 一則通知為 `sending`、等待自動重試；管理員在重試前登記歸還；N2 模式為 `success`
- When 到了 `next_attempt_at`，S2 執行
- Then S2 照常送出，通知為 `sent`，N2 有 1 則訊息（使用者決定 UD2）；之後 B1 回傳 `loanReturned` 為 `true`、`canResend` 為 `false`

### NS22 逾期時間的寫法

- 介面：N1
- 需求：FR-013；NFR-002
- Given 時段 `2026-11-10`（二）下午 `13:00–17:00`
- When 分別在 `17:00:40`、`17:08:30`、`19:05`、`20:00`、`2026-11-11 20:12`、`2026-11-12 17:07` 組出通知內容
- Then 第 4 行依序為「已逾期不到 1 分鐘」、「已逾期 8 分鐘」、「已逾期 2 小時 5 分鐘」、「已逾期 3 小時 0 分鐘」、「已逾期 1 天 3 小時 12 分鐘」、「已逾期 2 天 0 小時 7 分鐘」

### NS23 Webhook 位址不外洩

- 介面：N1、N2、S2
- 需求：NFR-003；SC-006
- Given 以 `vi.spyOn` 收集 `console.log`、`console.warn`、`console.error`；N2 依序切換 6 種模式並停止一次
- When S2 處理每種情況的通知
- Then log、所有 API 回應與 `overdue_notifications` 的內容都找不到 Webhook token，出現次數為 0

## 8. 上游衝突與使用者決定

### 上游衝突

| 編號 | 位置 | 問題 | 處理 Skill |
| ---- | ---- | ---- | ---------- |
| UC1 | `ui/overdue-notifications.html` `MOCK.failureReasons`；`ui/plan.md` §5 | 已解決：原問題為 3 個失敗原因（`connection_failed`、`webhook_not_configured`、`message_rejected`）的畫面文字與 `data/data-model.dbml` 的 `Enum overdue_notification_failure_reason` note、`research.md` §1 不同，且 `ui/plan.md` 沒有列出。`ui/plan.md` §5「失敗原因的畫面文字」已列出 6 種文字，與資料模型、合約一致，雛形 `failureReasons` 已同步。失敗原因的畫面文字以 `ui/plan.md` §5「失敗原因的畫面文字」為準；本文件只引用 Enum 值 | `ui-plan` |
| UC2 | `research.md` §6 模擬器模式表 | 已解決：原問題為 6 種模式無法重現第 3 節的 4 類回應：其他 `4xx`（`message_rejected`）、`401`／`403`（`webhook_invalid`）、`200` 沒有 `id`（結果不明）、沒有等待秒數的 `429`（退避間隔）。定案依 `research.md` §6：不新增模式；整合測試以 `node:http` 臨時固定回應位址經真實 `fetch` 驗證分類，不新增單元測試（與 `plan.md` 的 `backend/tests/unit/`「本次不新增」一致）；使用模擬器的整合情境與手動展示不涵蓋這 4 類。第 5.5 節、NS11、NS15 已依此改寫 | `technical-research` |

### 使用者決定

| 編號 | 問題 | 決定 | 影響段落 |
| ---- | ---- | ---- | -------- |
| UD1 | Discord 通知中的「已逾期多久」要用哪一種格式？ | 天、小時、分鐘，省略前面為 0 的單位；分鐘無條件捨去，不到 1 分鐘寫「已逾期不到 1 分鐘」 | 第 5.4 節、NS22 |
| UD2 | 通知在「送出中」時借用被歸還，系統要不要繼續把這則通知送到 Discord？ | 繼續送出，依送出結果更新狀態；S2 不檢查借用是否已歸還，之後依 FR-008 不能重送 | 第 2 節、第 5.2 節、NS21 |
