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

# Rule 3 - 合約必須依上游決策與 spec 撰寫，上游問題必須記為上游衝突

- 合約中的規則（`info.description`、operation 的 `description`、request 與 response 欄位、錯誤碼與狀態碼）必須與 `research.md` 各主題的 `Decision` 及 spec 的需求一致，不得寫出相反的規則，也不得把 `Decision` 採用的機制換成另一種機制（例如把資料庫鎖換成樂觀鎖重試）。
- 合約為了滿足 spec 的必須／不得規則而寫出的每一項操作、檢查、執行路徑或鎖，必須和 `research.md` 對應主題的 `Decision` 比對。`Decision` 已列出清單（例如鎖定清單、檢查項目、適用路徑），清單卻沒有這個 operation，或對同一個 operation 沒有這一項時；或照 `Decision` 的寫法會讓該規則無法滿足時，合約中受影響的 operation 必須依 spec 寫出滿足該規則的行為，並把這件事記為一項上游衝突。補上的行為必須優先沿用 `Decision` 已採用的機制；沒有可沿用的機制時，只寫出 spec 要求的結果，不自行選定新技術。依本點補上的行為不算第 1 點的另一種機制。
- 前面 Wave 的產出與 `research.md`／spec 不一致時，合約必須依第 1、2 點處理，不沿用前面 Wave 的寫法，並把這件事記為一項上游衝突。
- 每項上游衝突必須寫出四件事：衝突內容、上游位置（`research.md` 的 § 編號、spec 的需求編號或前面 Wave 產出的檔案與位置；第 2 點的情況必須同時寫出 `research.md` 的 § 編號與 spec 的需求編號）、合約中受影響的 `operationId`，以及建議的處理 Skill（`research.md` 為 `technical-research`，spec 為 `clarify-over-specs`，前面 Wave 的產出為產出它的 Planner）。
- 補上 `research.md` 與 spec 都沒有規定的細節（例如欄位、錯誤碼、檢查先後），且沒有與上游相反時，不算上游衝突。spec 的必須／不得規則要求、`Decision` 卻漏列的操作、檢查、執行路徑或鎖不算細節，必須依第 2 點處理。

## Good Example

### Example 1

- 圖書館借閱的 `research.md` §3 決定「借閱在交易第一個語句以 `SELECT … FOR UPDATE` 鎖定借書證列，再計算已借冊數」，清單沒有列出「預約取書轉為借閱」。spec FR-005 規定每張借書證最多同時借 5 本，預約取書也會增加借閱冊數；照 §3 寫時，預約取書和借閱同時送出可能都通過檢查。比對 §3 清單和 FR-005：合約為了 FR-005 在預約取書也要鎖借書證列，§3 清單沒有這個 operation，所以是第 2 點的情況。合約照 §3 寫借閱，預約取書沿用 §3 的鎖補上，並記一項上游衝突。

```yaml
paths:
  /loans:
    post:
      operationId: createLoan
      description: 依 FR-005 每張借書證最多同時借 5 本；依 research §3，交易第一個語句以 SELECT … FOR UPDATE 鎖定借書證列，再計算已借冊數，達上限時回 409 LOAN_LIMIT_REACHED。
  /holds/{holdId}/checkout:
    post:
      operationId: checkoutHold
      description: 依 FR-009 把到館預約轉為借閱；依 FR-005，和借閱相同，交易第一個語句以 SELECT … FOR UPDATE 鎖定借書證列，再計算已借冊數，達上限時回 409 LOAN_LIMIT_REACHED。
```

```markdown
上游衝突：
1. 內容：research §3 的鎖定清單沒有預約取書；照 §3 寫時，預約取書和借閱同時送出可能都通過檢查，超過 FR-005 的 5 本上限。合約依 FR-005 在 checkoutHold 沿用 §3 的鎖。
   上游位置：research.md §3、spec FR-005；受影響 operation：checkoutHold；建議處理 Skill：technical-research。
```

### Example 2

- 同一份 research 的借閱與 FR-005 一致。合約照 §3 寫，自行補上錯誤碼 `LOAN_LIMIT_REACHED`，以及「先檢查借書證停權，再計算已借冊數」的先後，沒有和上游相反，不記為上游衝突。

```yaml
paths:
  /loans:
    post:
      operationId: createLoan
      description: 依 FR-006 先檢查借書證是否停權，停權時回 403 CARD_SUSPENDED；再依 FR-005 與 research §3，交易第一個語句以 SELECT … FOR UPDATE 鎖定借書證列，計算已借冊數，達上限時回 409 LOAN_LIMIT_REACHED。
```

```markdown
上游衝突：無
```

## Bad Example

### Example 1

- 同 Good Example 1 的 research，合約只在借閱寫鎖，預約取書照 §3 沒有寫鎖；回報已判定違反 FR-005，合約仍照 research 寫，上游位置也只寫 research §3。

```yaml
paths:
  /holds/{holdId}/checkout:
    post:
      operationId: checkoutHold
      description: 依 FR-009 把到館預約轉為借閱，計算已借冊數，達上限時回 409 LOAN_LIMIT_REACHED。
```

```markdown
上游衝突：
1. 內容：research §3 沒有鎖定預約取書，會違反 FR-005。合約照 research 寫。
   上游位置：research.md §3；受影響 operation：checkoutHold；建議處理 Skill：technical-research。
```

### Example 2

- 同 Good Example 2 的情境，research §3 與 FR-005 一致，合約卻把 §3 的資料庫鎖換成另一種機制；之後依 research 實作的程式與合約不符。

```yaml
paths:
  /loans:
    post:
      operationId: createLoan
      description: 依 FR-005 每張借書證最多同時借 5 本；借書證以 version 欄位做樂觀鎖，版本衝突時重試 3 次。
```

# Rule 4 - 同一 operation 的同一分支不得寫出相反的行為

- 同一份合約中，`info.description`、operation 的 `description` 與 response 的 `description` 對同一個 operation 的同一個分支（同一種請求條件、狀態值或回應）描述的行為必須一致，不得一處寫要做、另一處寫不做，也不得寫出兩種不同結果。
- 適用於多個 operation 或多個分支的總述（例如「所有寫入操作都先…」），視為描述它涵蓋的每一個分支；某個分支不適用時，總述必須寫出例外，或改為列出適用的 operation 或分支。
- 發現相反的描述時，必須依 Rule 3 決定該分支的正確行為，修改所有相關描述，只留下一種行為。

## Good Example

- 圖書館借閱 spec FR-006 規定借閱與續借前檢查借書證是否停權，FR-008 規定停權的借書證仍可歸還。總述寫出歸還是例外，各 operation 與 response 的描述和總述一致。

```yaml
info:
  description: 借閱與續借都先檢查借書證是否停權（FR-006）；歸還不檢查停權（FR-008）。
paths:
  /loans/{loanId}/renew:
    post:
      operationId: renewLoan
      description: 依 FR-007 延長到期日 14 天；依 FR-006 先檢查借書證是否停權。
      responses:
        '200':
          description: 借書證未停權，到期日已延長 14 天
        '403':
          $ref: '#/components/responses/CardSuspended'
  /loans/{loanId}/return:
    post:
      operationId: returnBook
      description: 依 FR-008 登記歸還；停權的借書證仍可歸還，不檢查停權。
```

## Bad Example

- 同一份需求中，總述寫所有借閱寫入都先檢查停權，續借的 200 回應卻寫不檢查；同一個分支有兩種相反的行為。

```yaml
info:
  description: 所有借閱寫入操作都先檢查借書證是否停權。
paths:
  /loans/{loanId}/renew:
    post:
      operationId: renewLoan
      description: 依 FR-007 延長到期日 14 天。
      responses:
        '200':
          description: 續借不檢查借書證狀態，直接延長到期日 14 天
```
