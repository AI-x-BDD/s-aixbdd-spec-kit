# Rule 1 - 查詢清單的 operation 必須以 page 與 pageSize 分頁

- 本規則適用於回傳多筆資源的 `GET` operation，例如查詢聊天歷史、查詢房間清單。
- 這類 operation 必須有 `page` 與 `pageSize` 兩個 query 參數。
- `page` 必須是 `integer`，`minimum: 1`，`default: 1`，代表要取第幾頁。
- `pageSize` 必須是 `integer`，`minimum: 1`，`maximum: 100`，`default: 20`，代表每頁幾筆。
- 分頁參數必須命名為 `page` 與 `pageSize`，不得使用 `offset`、`limit`、`size` 等其他名稱。

## Good Example

- 查詢聊天歷史的 operation 帶 `page` 與 `pageSize`，型別、下限、上限與預設值都符合規則。

```yaml
/rooms/{roomId}/messages:
  get:
    operationId: listChatMessages
    parameters:
      - name: page
        in: query
        schema: { type: integer, minimum: 1, default: 1 }
      - name: pageSize
        in: query
        schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
```

## Bad Example

- 同一個 operation 改用 `offset`／`limit`，而且沒有上限，呼叫端可以一次取出全部訊息。

```yaml
/rooms/{roomId}/messages:
  get:
    operationId: listChatMessages
    parameters:
      - name: offset
        in: query
        schema: { type: integer }
      - name: limit
        in: query
        schema: { type: integer }
```

# Rule 2 - 分頁 operation 的成功回應必須包含分頁資訊

- 適用 Rule 1 的 operation，其 `200` 回應的 schema 必須是 `object`，不得直接回傳 `array`。
- 回應 object 必須包含 `items`、`page`、`pageSize`、`totalItems`、`totalPages` 五個 `required` 欄位。
- `items` 必須是本頁資料的 `array`；`page` 與 `pageSize` 必須回傳本次採用的值；`totalItems` 必須是符合條件的資料總筆數；`totalPages` 必須是總頁數，沒有資料時為 `0`。

## Good Example

- 回應以 object 包住本頁資料，並回傳第幾頁、每頁幾筆、總筆數與總頁數。

```yaml
ChatMessagePage:
  type: object
  required: [items, page, pageSize, totalItems, totalPages]
  properties:
    items:
      type: array
      items: { $ref: '#/components/schemas/ChatMessage' }
    page: { type: integer, minimum: 1 }
    pageSize: { type: integer, minimum: 1, maximum: 100 }
    totalItems: { type: integer, minimum: 0 }
    totalPages: { type: integer, minimum: 0 }
```

## Bad Example

- 回應直接是 array。呼叫端無法知道目前是第幾頁，也無法知道總共有幾筆。

```yaml
responses:
  '200':
    content:
      application/json:
        schema:
          type: array
          items: { $ref: '#/components/schemas/ChatMessage' }
```

# Rule 3 - 分頁參數不合法時必須回應 400

- `page` 或 `pageSize` 不是整數、小於下限或大於上限時，適用 Rule 1 的 operation 必須回應 `400`。
- `400` 回應必須使用本合約共用的錯誤 schema，錯誤碼必須是 `PAGINATION_INVALID`。
- 不得把不合法的值自動調整成合法值後照常回應。

## Good Example

- operation 列出 `400` 回應，錯誤 schema 的錯誤碼包含 `PAGINATION_INVALID`。

```yaml
responses:
  '400':
    description: page 或 pageSize 不合法（PAGINATION_INVALID）
    content:
      application/json:
        schema: { $ref: '#/components/schemas/Error' }
# components.schemas.Error.properties.code.enum 包含 PAGINATION_INVALID
```

## Bad Example

- `description` 寫明 `pageSize` 超過 100 時自動改成 100，合約宣告的上限和實際行為不一致。

```yaml
description: pageSize 超過 100 時以 100 處理。
responses:
  '200':
    description: 查詢成功
```

# Rule 4 - page 超過總頁數時必須回應空的 items

- `page` 大於 `totalPages` 時，適用 Rule 1 的 operation 必須回應 `200`。
- 這個回應的 `items` 必須是空 `array`，`totalItems` 與 `totalPages` 必須照常回傳。
- 這個情況不得寫成 `4xx` 回應。
- operation 的 `description` 必須寫出這個情況與對應結果。

## Good Example

- `description` 寫明超過總頁數時回應空的 `items`，並照常回傳總筆數與總頁數。

```yaml
description: 依 FR-002 查詢本房聊天歷史；page 大於 totalPages 時回應 200，items 為空陣列，totalItems 與 totalPages 照常回傳。
```

## Bad Example

- 超過總頁數寫成 `404`，呼叫端無法區分「頁碼超過」和「房間不存在」。

```yaml
responses:
  '404':
    description: 頁碼超過總頁數或房間不存在
```

# Rule 5 - 分頁 operation 必須寫出排序依據

- 適用 Rule 1 的 operation，其 `description` 必須寫出排序欄位與方向。
- 排序條件的最後一個欄位必須是唯一欄位，例如 `id`。

## Good Example

- 排序先依送出時間由舊到新，時間相同時依 `id`，每一頁的內容固定。

```yaml
description: 依 FR-002 查詢本房聊天歷史，依 created_at 由舊到新排序，created_at 相同時依 id 由小到大排序。
```

## Bad Example

- 只寫「依時間排序」，沒有寫方向，也沒有唯一欄位。兩則訊息時間相同時，可能在兩頁都出現，也可能都不出現。

```yaml
description: 查詢本房聊天歷史，依時間排序。
```
