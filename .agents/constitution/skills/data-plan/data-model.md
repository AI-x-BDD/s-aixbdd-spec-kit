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
