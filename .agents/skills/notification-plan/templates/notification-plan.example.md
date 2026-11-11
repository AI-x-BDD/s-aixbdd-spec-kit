# 通知規劃：預約到館 Email 通知

- spec：`specs/012-hold-pickup-email/spec.md`
- 上游：`plan.md`、`research.md`、`data/data-model.dbml`、`contracts/openapi.yaml`
- 負責介面：S1、E1、E2

## 1. 範疇

### 負責介面

| 介面 | 名稱 | 端點類型 | 本文件負責 | 需求依據 |
| ---- | ---- | -------- | ---------- | -------- |
| S1 | 到館通知排程 | 排程（程序內計時器 → 後端） | 找出可取書且尚未通知的預約，建立並送出通知，處理自動重試與系統恢復 | US1 情境 1–4；FR-001、FR-002、FR-005 |
| E1 | Email 服務送出 | 通知服務（後端 → Email 服務 API） | 送出請求、回應分類、通知內容 | US1 情境 1、5–7；FR-003、FR-004、FR-006；NFR-001 |
| E2 | 本機 Email 服務替身 | 通知服務（後端 → 本機替身） | 重現各類回應的控制操作 | US1 情境 5–7；SC-002 |

### 不在範疇

| 介面 | 名稱 | 理由 |
| ---- | ---- | ---- |
| M1 | 館員工作站條碼掃描器 | 端點類型為硬體，只負責登記書籍到館，不觸發、送出或追蹤通知；到館後的狀態變更由 B2 寫入，屬 `api-plan` 範疇 |

### 觸發條件

| 編號 | 條件 | 觸發介面 | 讀取的資料 | 需求 |
| ---- | ---- | -------- | ---------- | ---- |
| TR1 | 預約狀態為 `ready_for_pickup`，且沒有對應的 `hold_notification` | S1 | `hold.status`、`hold.ready_at`、`hold_notification.hold_id` | FR-001、FR-002 |
| TR2 | `hold_notification.status` 為 `queued`，且 `next_attempt_at` 不晚於現在 | S1 | `hold_notification.status`、`hold_notification.next_attempt_at` | FR-005 |

## 2. 通知狀態與轉換

狀態來源：`data/data-model.dbml` 的 `Enum hold_notification_status`

| 狀態值 | 意義 | 終態 | 需求 |
| ------ | ---- | ---- | ---- |
| `queued` | 已建立，等待第一次送出或自動重試 | 否 | FR-002、FR-005 |
| `sending` | 已送出請求，等待 Email 服務回應 | 否 | FR-003 |
| `delivered` | Email 服務已接受 | 是 | FR-004 |
| `failed` | 確定對方沒收到，且不再自動重試 | 是 | FR-005、FR-006 |
| `uncertain` | 不確定對方是否收到 | 是 | FR-007 |

| 從 | 事件 | 到 | 觸發介面 | 寫入欄位 | 需求 |
| -- | ---- | -- | -------- | -------- | ---- |
| （無） | 符合 TR1 | `queued` | S1 | `hold_id`、`status`、`attempt_count = 0`、`next_attempt_at = now` | FR-001、FR-002 |
| `queued` | 符合 TR2，送出請求 | `sending` | S1 | `status`、`attempt_count + 1`、`last_attempted_at` | FR-003 |
| `sending` | E1 回應 202 | `delivered` | E1 | `status`、`delivered_at`、`provider_message_id` | FR-004 |
| `sending` | E1 回應 429 或 503，未達上限 | `queued` | E1 | `status`、`next_attempt_at`、`failure_reason` | FR-005 |
| `sending` | E1 回應 429 或 503，已達上限 | `failed` | E1 | `status`、`failure_reason` | FR-005 |
| `sending` | E1 回應 400 或 422 | `failed` | E1 | `status`、`failure_reason` | FR-006 |
| `sending` | 15 秒沒有回應，或送出後連線中斷 | `uncertain` | E1 | `status`、`failure_reason` | FR-007 |

系統恢復運作時：

| 停止時的狀態 | 恢復後的處理 | 觸發介面 | 需求 |
| ------------ | ------------ | -------- | ---- |
| `queued` | 第一次排程依 TR2 繼續送出，`attempt_count` 沿用，不重新計算上限 | S1 | FR-005、FR-008 |
| `sending` | 第一次排程改成 `uncertain`，`failure_reason = connection_lost`，不自動重送 | S1 | FR-007、FR-008 |

## 3. 失敗分類與重試界線

| 回應 | 分類 | 對方是否收到 | 自動重試 | 等待與上限 | 最終狀態與原因 | 需求 |
| ---- | ---- | ------------ | -------- | ---------- | -------------- | ---- |
| 202 | 成功 | 是 | 否 | — | `delivered` | FR-004 |
| 429 | 暫時失敗 | 確定沒收到 | 是 | 依 `Retry-After`，超過 60 秒直接失敗；總共最多 3 次 | `failed`／`rate_limited` | FR-005 |
| 503 | 暫時失敗 | 確定沒收到 | 是 | 固定 30 秒；總共最多 3 次 | `failed`／`provider_error` | FR-005 |
| 400 | 永久失敗 | 確定沒收到 | 否 | — | `failed`／`rejected_content` | FR-006 |
| 422（收件者無效） | 永久失敗 | 確定沒收到 | 否 | — | `failed`／`invalid_recipient` | FR-006 |
| 連線在送出前失敗 | 暫時失敗 | 確定沒收到 | 是 | 固定 30 秒；總共最多 3 次 | `failed`／`provider_error` | FR-005 |
| 15 秒沒有回應 | 結果不明 | 不確定 | 否 | — | `uncertain`／`timeout` | FR-007 |
| 送出後連線中斷 | 結果不明 | 不確定 | 否 | — | `uncertain`／`connection_lost` | FR-007 |

## 4. 重複處理

| 來源 | 防護 | 殘留風險 |
| ---- | ---- | -------- |
| 兩次排程同時找到同一筆預約 | `hold_notification.hold_id` 唯一約束，第二次建立失敗時略過 | 無 |
| 自動重試時前一次其實已送達 | 只對確定沒收到的回應自動重試 | Email 服務回 503 後仍寄出時，會員可能收到兩封 |
| 館員手動重送 `uncertain` 通知 | 重送前由 B3 顯示確認視窗 | 前一次其實已寄出時，會員會收到兩封 |

## 5. 介面規格

### 5.1 S1 到館通知排程

- 觸發時機：程序啟動後立即執行一次，之後每 5 分鐘執行一次（FR-001）。
- 時間來源：資料庫 `now()`，不使用應用程式主機時間（research §2）。
- 讀取：`hold.status`、`hold.ready_at`、`hold_notification.status`、`hold_notification.next_attempt_at`。
- 寫入：依第 2 節轉換表。
- 重疊執行：上一次尚未結束時略過本次，不排隊（FR-008）。
- 系統恢復：依第 2 節「系統恢復運作時」，先處理 `sending`，再處理 `queued`（FR-008）。

### 5.2 E1 Email 服務送出

- 請求：`POST /v1/messages`，標頭 `Idempotency-Key: hold-<hold_id>-<attempt_count>`，逾時 15 秒（research §3）。
- 回應對照：依第 3 節。
- 通知內容逐行版面：

| 行 | 內容 | 來源 |
| -- | ---- | ---- |
| 主旨 | 【預約到館】《書名》可取書 | `book.title` |
| 1 | 會員姓名您好： | `member.name` |
| 2 | 您預約的《書名》已到館。 | `book.title` |
| 3 | 取書館別：館別名稱 | `branch.name` |
| 4 | 保留至：YYYY-MM-DD | `hold.pickup_deadline` |

- 填值範例：

```text
主旨：【預約到館】《小王子》可取書
王小明您好：
您預約的《小王子》已到館。
取書館別：中正分館
保留至：2026-12-03
```

### 5.3 E2 本機 Email 服務替身

- 控制操作：

| 操作 | 請求 | 回應 | 錯誤回應 |
| ---- | ---- | ---- | -------- |
| 設定模式 | `PUT /__mock/mode`，body `{"mode": "<模式>"}` | 204 | 模式不存在：400 `{"error": "unknown mode"}` |
| 查詢收到的郵件 | `GET /__mock/messages` | 200，郵件陣列 | — |
| 清除郵件 | `DELETE /__mock/messages` | 204 | — |

- 模式：`accept`（202）、`rate_limit`（429，`Retry-After: 5`）、`unavailable`（503）、`reject`（400）、`bad_recipient`（422）、`hang`（不回應）、`drop_after_send`（記錄郵件後中斷連線）。

## 6. 紀錄需求

| 紀錄項目 | 寫入位置 | 寫入時機 | 不得記錄 | 需求 |
| -------- | -------- | -------- | -------- | ---- |
| 每次嘗試的狀態、原因與時間 | `hold_notification` | 每次轉換 | — | FR-004、FR-005 |
| Email 服務訊息編號 | `hold_notification.provider_message_id` | 回應 202 時 | — | FR-004 |
| 送出失敗摘要 | 應用程式紀錄檔 | 每次失敗 | API 金鑰、會員 Email 全文 | NFR-001 |

## 7. 驗收情境

### NS1 可取書後送出通知

- 介面：S1、E1
- 需求：US1 情境 1；FR-001、FR-004
- Given 預約狀態為 `ready_for_pickup`，E2 模式為 `accept`
- When 排程執行
- Then 通知為 `delivered`，E2 收到一封主旨為「【預約到館】《小王子》可取書」的郵件

### NS2 暫時失敗後自動重試成功

- 介面：S1、E1、E2
- 需求：US1 情境 5；FR-005
- Given E2 模式為 `unavailable`
- When 排程執行一次後，E2 改為 `accept`，30 秒後排程再執行
- Then 通知為 `delivered`，`attempt_count` 為 2

### NS3 收件者無效不重試

- 介面：E1、E2
- 需求：US1 情境 6；FR-006
- Given E2 模式為 `bad_recipient`
- When 排程執行
- Then 通知為 `failed`／`invalid_recipient`，之後的排程不再送出

### NS4 對方可能已收到、本機沒收到回應

- 介面：E1、E2
- 需求：US1 情境 7；FR-007
- Given E2 模式為 `drop_after_send`
- When 排程執行
- Then 通知為 `uncertain`／`connection_lost`，E2 有 1 封郵件，之後的排程不自動重送

## 8. 上游衝突與使用者決定

### 上游衝突

| 編號 | 位置 | 問題 | 處理 Skill |
| ---- | ---- | ---- | ---------- |
| UC1 | `contracts/openapi.yaml` `HoldNotification.status` | `enum` 缺少 `uncertain`，與 `data/data-model.dbml` 的 `Enum hold_notification_status` 不一致 | `api-plan` |

### 使用者決定

| 編號 | 問題 | 決定 | 影響段落 |
| ---- | ---- | ---- | -------- |
| UD1 | 「保留至」日期是否顯示星期？ | 不顯示，只寫 YYYY-MM-DD | 第 5.2 節 |
