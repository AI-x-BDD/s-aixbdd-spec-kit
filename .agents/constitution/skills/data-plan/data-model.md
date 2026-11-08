# Rule 1 - 每張資料表必須有生命週期欄位

- 每張會持久化的資料表都必須有下列 4 個欄位，欄位名稱與型別不得更改：

| 欄位 | 型別與設定 | 意義 |
|---|---|---|
| `created_at` | `` timestamptz [not null, default: `now()`] `` | 建立時間 |
| `updated_at` | `` timestamptz [not null, default: `now()`] `` | 最後修改時間；建立時與 `created_at` 相同 |
| `updated_by` | `uuid` | 最後修改者的 ID；由系統排程或匿名操作修改時為 null |
| `deleted_at` | `timestamptz` | 軟刪除時間；未刪除時為 null |

## Good Example

- 聊天訊息資料表有全部 4 個生命週期欄位，名稱與型別都符合上表。

```dbml
Table chat_messages {
  id uuid [pk]
  room_id uuid [not null, ref: > rooms.id]
  sender_id uuid [not null]
  content varchar(100) [not null, note: '1–100 字（FR-004）']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  updated_by uuid [note: '最後修改者的玩家 ID；系統修改時為 null']
  deleted_at timestamptz [note: '軟刪除時間；未刪除時為 null']
}
```

## Bad Example

- 資料表只有 `created_at`，而且用 `sent_at` 自訂時間欄位名稱，缺少修改與刪除的稽核資訊。

```dbml
Table chat_messages {
  id uuid [pk]
  room_id uuid [not null, ref: > rooms.id]
  content varchar(100) [not null]
  sent_at timestamp
  created_at timestamptz
}
```

# Rule 2 - 刪除資料必須使用軟刪除

- 資料模型描述刪除行為時，必須寫成「設定 `deleted_at`」，不得寫成刪除資料列。
- 查詢有效資料的說明必須排除 `deleted_at` 不為 null 的資料列。
- 例外：spec 明確要求不保留的資料，可以直接刪除資料列，包括以 `[delete: cascade]` 連帶刪除。

## Good Example

### Example 1

- 房間關閉時以 `deleted_at` 標記，查詢等待中房間時排除已軟刪除的資料列。

```dbml
Table rooms {
  id uuid [pk]
  pair_code char(4) [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  updated_by uuid
  deleted_at timestamptz

  Note: 'D1：房間關閉時設定 deleted_at；查詢等待中房間時排除 deleted_at 不為 null 的資料列。'
}
```

### Example 2

- spec FR-008 明確要求房間關閉後不保留聊天訊息，因此聊天訊息隨房間連帶刪除。

```dbml
Table chat_messages {
  id uuid [pk]
  room_id uuid [not null]

  Note: 'D1：FR-008 房間關閉時連帶刪除。'
}

Ref: chat_messages.room_id > rooms.id [delete: cascade]
```

## Bad Example

### Example 1

- `Note` 寫成刪除資料列，刪除後沒有任何稽核紀錄。

```dbml
Table rooms {
  id uuid [pk]
  pair_code char(4) [not null]

  Note: 'D1：房間關閉時刪除此列。'
}
```

### Example 2

- spec 沒有要求不保留猜測紀錄，猜測紀錄卻隨房間連帶刪除。

```dbml
Table guesses {
  id uuid [pk]
  room_id uuid [not null]

  Note: 'D2：房間關閉時一併刪除猜測紀錄。'
}

Ref: guesses.room_id > rooms.id [delete: cascade]
```

# Rule 3 - 時間點與純日期欄位必須分別使用 timestamptz 與 date 型別

- 記錄時間點（timestamp）的欄位必須使用 `timestamptz` 型別。
- 記錄純日曆日期（date）的欄位必須使用 `date` 型別，並以 `Asia/Taipei`（UTC+8）作為業務時區解讀。
- 時間點欄位不得使用不含時區的 `timestamp`、整數或字串型別；純日期欄位不得使用字串型別。

## Good Example

- 預約資料表的預約日期使用 `date` 型別並註明 `Asia/Taipei` 業務時區，取消時間點使用 `timestamptz` 型別。

```dbml
Table reservations {
  id uuid [pk]
  reservation_date date [not null, note: '預約借用日期（依 Asia/Taipei 時區解讀）']
  cancelled_at timestamptz [note: '取消時間點（UTC）']
}
```

## Bad Example

- 預約日期改用 `varchar(10)` 字串，取消時間點改用不含時區的 `timestamp`。

```dbml
Table reservations {
  id uuid [pk]
  reservation_date varchar(10) [not null]
  cancelled_at timestamp
}
```

# Rule 4 - 唯一性約束與業務歷程保留必須明確定義

- 單一欄位要求唯一時，該欄位必須標記 `unique`；多欄位組合要求唯一時，必須在資料表的 `indexes` 區塊宣告 `(欄位1, 欄位2, ...) [unique, name: '...']`。
- 僅對特定有效狀態生效的部分唯一約束（partial unique index），必須在該索引或欄位的 `note` 寫明過濾條件。
- 預約取消、駁回、歸還等業務終態必須以狀態欄位與對應時間欄位保留原資料列，不得物理刪除資料列，也不得直接覆寫既有歷史紀錄。

## Good Example

- 設備預約表以複合唯一索引並在 `note` 寫明僅對有效預約狀態生效，取消預約時保留原資料列並記錄 `status` 與 `cancelled_at`。

```dbml
Enum reservation_status {
  confirmed
  cancelled
}

Table reservations {
  id uuid [pk]
  equipment_id uuid [not null]
  reservation_date date [not null]
  slot_id uuid [not null]
  status reservation_status [not null, default: 'confirmed']
  cancelled_at timestamptz [note: '取消時填入時間並將 status 改為 cancelled，保留原資料列']

  indexes {
    (equipment_id, reservation_date, slot_id) [unique, name: 'uq_reservations_active_slot', note: '僅在 status = confirmed 且 deleted_at IS NULL 時生效']
  }
}
```

## Bad Example

- 設備、日期與時段沒有宣告唯一索引，且在 `Note` 將取消預約寫成直接刪除預約資料列。

```dbml
Table reservations {
  id uuid [pk]
  equipment_id uuid [not null]
  reservation_date date [not null]
  slot_id uuid [not null]

  Note: '取消預約時直接刪除此列，釋出時段。'
}
```
