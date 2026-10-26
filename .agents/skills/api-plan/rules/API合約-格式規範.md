# Rule 1 - operation 必須歸屬負責介面並引用需求

- 每個 operation 必須恰好有一個 tag，tag 名稱必須是「<介面編號> <介面名稱>」，且編號與名稱必須和 `plan.md` 系統介面盤點表的同一列一致。
- 每個可規劃介面必須至少有一個 operation。
- 不得為可規劃介面以外的介面設計 operation，也不得以技術層或資源名稱（例如 `books`、`loans`）作為 tag。
- 每個 operation 的 `description` 必須引用至少一個目標 spec 中存在的需求編號（US、FR、NFR、SC），並說明這個 operation 滿足該需求的哪一部分。

## Good Example

- 圖書館借閱的 plan.md 盤出 B1 館藏查詢 API、B2 借閱與歸還 API。每個 operation 只掛一個與盤點表一致的 tag，`description` 寫出對應的需求編號與內容。

```yaml
paths:
  /books:
    get:
      operationId: searchBooks
      tags: [B1 館藏查詢 API]
      description: 依 FR-001 以書名或作者關鍵字查詢館藏，並依 FR-002 回傳每本書的可借冊數。
  /loans:
    post:
      operationId: borrowBook
      tags: [B2 借閱與歸還 API]
      description: 依 FR-004 以借書證號借出指定館藏；FR-005 每張借書證最多同時借 5 本。
```

## Bad Example

- 同一份合約以資源名稱作為 tag，一個 operation 掛了兩個 tag，`description` 只寫「依需求」，看不出對應的介面與需求。

```yaml
paths:
  /loans:
    post:
      operationId: borrowBook
      tags: [loans, B1 館藏查詢 API]
      description: 依需求借書。
```

# Rule 2 - Edge Case 與驗證規則必須依 spec 的定義寫成錯誤或正常結果

- 可規劃介面需求依據中的每個 Edge Case 與驗證規則，必須在至少一個 operation 中有對應。
- spec 定義為拒絕或失敗的 Edge Case 與驗證規則，OpenAPI 必須以 4xx 回應表達；AsyncAPI 必須以錯誤訊息表達。
- spec 定義為正常結果的 Edge Case（例如照常處理、改走另一個正常流程），OpenAPI 必須以成功回應表達、AsyncAPI 必須以一般事件訊息表達，並在該 operation 的 `description` 寫出這個 Edge Case 與對應結果；不得寫成錯誤回應或錯誤訊息。
- 同一份合約的所有錯誤回應或錯誤訊息必須共用同一個錯誤 schema，以錯誤碼欄位指出錯誤情況。

## Good Example

- 圖書館借閱 spec 的 Edge Cases 有「借書證已停權時拒絕借閱」與「館藏已全部借出時改為登記預約」，FR-005 限制同時借閱 5 本。停權與借閱上限是拒絕，寫成 4xx 並共用 `Error` schema；全部借出時改為登記預約是 spec 定義的正常結果，寫成 201 回應的 `RESERVED` 狀態，並在 `description` 寫出這個 Edge Case。

```yaml
paths:
  /loans:
    post:
      description: 依 FR-004 借出指定館藏；館藏已全部借出時（Edge Cases）改為登記預約，回應狀態為 RESERVED。FR-005 每張借書證最多同時借 5 本。
      responses:
        '201':
          description: 借閱成功（BORROWED），或館藏已全部借出時登記預約成功（RESERVED）
          content:
            application/json:
              schema:
                type: object
                required: [status]
                properties:
                  status:
                    type: string
                    enum: [BORROWED, RESERVED]
        '403':
          $ref: '#/components/responses/CardSuspended'
        '409':
          $ref: '#/components/responses/LoanLimitReached'
components:
  schemas:
    Error:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
          enum: [CARD_SUSPENDED, LOAN_LIMIT_REACHED]
        message:
          type: string
  responses:
    CardSuspended:
      description: 借書證已停權（CARD_SUSPENDED）
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    LoanLimitReached:
      description: 已達同時借閱上限（LOAN_LIMIT_REACHED）
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
```

## Bad Example

- 同一份需求中，spec 定義為正常結果的「館藏已全部借出時改為登記預約」被寫成 409 錯誤；另一個歸還 operation 自行定義與其他回應不同的錯誤格式。

```yaml
paths:
  /loans:
    post:
      responses:
        '201':
          description: 借閱成功
        '409':
          description: 館藏已全部借出（NO_COPY_AVAILABLE）
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  /loans/{loanId}/return:
    post:
      responses:
        '400':
          description: 歸還失敗
          content:
            application/json:
              schema:
                type: object
                properties:
                  errorMsg:
                    type: string
```
