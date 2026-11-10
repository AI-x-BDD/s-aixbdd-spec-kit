# 工程藍圖：api-plan－上游衝突依 research 寫合約且合約前後矛盾

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/45-api-plan-上游衝突依research寫合約且合約前後矛盾/`
- 根因報告：`rca-report.md`（R1、R2、R3，使用者已確認；確認紀錄見第 9、11 節）
- 確認紀錄：
  - 2026-11-10 根因報告：使用者同意 E1～E8 與 R1、R2；F3（登記領取不鎖）不列為 api-plan 的驗收條件，也不修改 api-plan；同意 S2 的植入方式（在 006 research §2 刪掉「原預約仍為 `confirmed`」）。
  - 2026-11-10 工程藍圖：使用者同意 W1、W2 與第 2 節 Rule 3、Rule 4 全文；同意刪除「Decision 有缺陷」類別（不違反 spec 的缺陷不再記為上游衝突）；同意驗收情境 S1～S4。
  - 2026-11-10 根因報告（R3）：使用者同意 R3；修改只限 Rule 3 第 2 點、第 5 點與 Good Example 1，SOP 與驗收條件不改；修改後重跑 S1、S2、S3。
  - 2026-11-10 工程藍圖第 2 版：使用者同意 Rule 3 第 2 點、第 5 點與 Good Example 1 的新文字及兩項刪除；同意不新增 Bad Example；同意 W3 與第 2 輪驗收範圍（重跑 S1、S2、S3，S4 沿用第 1 輪）。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 判定 `research.md` 的 `Decision`（含 Decision 漏列 spec 需要的操作或檢查）會讓 spec 的必須／不得規則無法滿足時，合約中受影響的 operation 依 spec 寫出滿足該規則的行為，不照 research 寫出違反 spec 的行為；同一次執行中的每一項都這樣處理 | 本次 | 通用 |
| E2 | 發現 E1 的情況，或前面 Wave 的產出與 research／spec 不一致時，回報有獨立的「上游衝突」項目，每項寫出衝突內容、上游位置（research 的 § 編號、spec 的需求編號或前面 Wave 產出的位置）、受影響的 `operationId` 與建議處理 Skill；沒有時寫「無」 | 既有（41 的 E2） | 通用 |
| E3 | 同一份合約中，對同一個 operation 的同一種情況（同一個分支），`info.description`、operation 的 `description` 與 response 說明不得寫出相反的行為 | 本次 | 通用 |
| E4 | research 的 `Decision` 與 spec 一致時，合約依 research 的做法寫，不自行換成另一種做法；只補上上游沒有規定的細節（例如欄位、錯誤碼、檢查先後），且沒有與上游相反時，不記為上游衝突 | 既有（Rule 3 第 1、4 點） | 通用 |
| E5 | 每個 operation 恰好一個「介面編號 介面名稱」tag，每個可規劃介面至少一個 operation，`description` 引用 spec 存在的需求編號；`check_contracts.py` 沒有 issues | 既有 | 通用 |
| E6 | 與憲法必須／不得規則無法同時滿足的項目，仍以「憲法衝突」委派 `clarify`；回報仍包含「憲法遵循」 | 既有 | 通用 |
| E7 | 已存在的合約檔在委派內容沒有說明同意覆寫時，先詢問使用者；不同意時不修改任何檔案 | 既有 | 通用 |
| E8 | 「上游衝突」只在回報中列出，不因此停止產出、不向使用者提問 | 既有（41 的推定 E6，已確認） | 通用 |

## 2. To-Be SOP

`SKILL.md` 不變（frontmatter、3 個 Phase、21 個步驟與完成條件都保留原文）。理由：

- R1、R2 都位於 `rules/API合約-格式規範.md`，依重新設計 Rule 3，修改落在 RuleFile，不在 SOP 補償。
- Phase 2 步驟 1 讀取 RuleFile 的所有 Rule，新增的 Rule 4 會自動載入。
- Phase 2 步驟 2 依檢查清單設計，Phase 3 步驟 4 逐條驗證「API 合約檢查清單」，已涵蓋 Rule 4 的檢查（R2 反事實檢驗的前提），不需新增 `CHECK`。

### `api-plan/SKILL.md`（不變）

````markdown
---
name: api-plan
description: 已有 plan.md、要為後端介面產出 API 合約時使用：依 plan.md 系統介面盤點中端點類型為後端的介面，或 system-analysis 委派的介面編號，參考 spec.md、技術研究結果與前面 Wave 的產出，把 HTTP 介面寫成 OpenAPI 3.1、WebSocket／Socket.IO 等事件介面寫成 AsyncAPI 3.0，存到 spec 目錄的 contracts/，每個 operation 標出所屬介面與需求編號。通常由 system-analysis 依 Wave 委派，也可以單獨使用。使用者提到 api-plan、API 合約、API 文件、OpenAPI、AsyncAPI、contracts 時使用。盤點介面與安排 Wave 改用 system-analysis；設計資料模型改用 data-plan；設計畫面與雛形改用 ui-plan。
---

# SOP

## Phase 1 -- 收斂規劃輸入

1. `READ` 使用者需求或委派內容，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「規劃輸入」。
2. `THINK` 決定「目標 spec」：使用者或委派內容指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `ui/`、`data/`、`contracts/` 下的既有檔案（不存在的略過），加入「規劃輸入」。
5. `READ` 專案根目錄的 `.agents/constitution/shared.md`、`.agents/constitution/skills/api-plan/openapi.md` 與 `.agents/constitution/skills/api-plan/asyncapi.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：每個 operation 只有一個以「介面編號 介面名稱」開頭的 tag、每個「可規劃介面」至少一個 operation、`description` 引用 spec 存在的需求編號，以及合約檔路徑 `contracts/openapi.yaml`、`contracts/asyncapi.yaml`。
6. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行。
7. `THINK` 決定「負責介面」：委派內容指定介面編號時使用這些編號，否則使用 `plan.md`「系統介面盤點」表中端點類型為後端的所有介面；每個介面記下 plan.md 中的編號、名稱與需求依據。
8. `CHECK` 「負責介面」為空時，回報 `plan.md` 沒有後端介面、不產出合約，並停止執行。
9. `THINK` 依 `techstack.md`／`research.md` 採用的傳輸方式歸類「負責介面」：以 HTTP 傳輸的介面歸入 `contracts/openapi.yaml`，以 WebSocket、Socket.IO、SSE 或訊息佇列等事件傳輸的介面歸入 `contracts/asyncapi.yaml`，同時使用兩種傳輸的介面兩邊都歸入；傳輸方式不屬於這兩類的介面記為「無法規劃介面」；有歸入介面的檔案建立為「目標合約檔」，其餘介面建立為「可規劃介面」。
10. `WRITE` 「目標合約檔」中有已存在的檔案，且委派內容沒有說明使用者已同意覆寫時，列出這些檔案並詢問使用者是否覆寫；沒有已存在的檔案或委派內容已說明同意時，略過本步驟與下一步。
11. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時，回報沒有修改既有合約檔、沒有產出任何檔案，並停止執行。

完成條件：「目標 spec」、`plan.md` 與技術研究結果已讀取，「可規劃介面」與「目標合約檔」已決定，且沒有既有合約檔或使用者已同意覆寫；或缺少輸入、沒有後端介面、使用者不同意覆寫，已停止執行並回報。

## Phase 2 -- 設計 API 合約

1. `READ` 設計 API 合約時，讀取 `rules/API合約-格式規範.md` 的所有 Rule，建立「API 合約檢查清單」。
2. `THINK` 依「規劃輸入」、「憲法檢查清單」與已載入的「API 合約檢查清單」，為「可規劃介面」設計 operation、request、response、錯誤回應與 schema，只設計前端或外部系統與後端之間的介面，不設計資料表或程式實作，建立「API 設計」，並把設計時發現的上游問題建立為「上游衝突」；「上游衝突」只在 Phase 3 步驟 5 回報，不委派 `clarify`，也不停止產出。
3. `THINK` 比對「憲法檢查清單」的必須／不得規則與「規劃輸入」，列出和 spec、`plan.md` 或技術研究無法同時滿足的項目，建立「憲法衝突」。
4. `DELEGATE` 「憲法衝突」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以「憲法衝突」為優先提問面向、不要求詳記問答紀錄，取得使用者的決定，依決定調整「API 設計」；「憲法衝突」為空時略過本步驟與下一步。
5. `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、沒有產出任何檔案，並停止執行；使用者未回覆時停止執行，回報沒有產出任何檔案。

完成條件：「API 設計」已涵蓋每個「可規劃介面」。

## Phase 3 -- 產出合約檔

1. `READ` 「目標合約檔」包含 `contracts/openapi.yaml` 時讀取 `templates/openapi.yaml` 與 `templates/openapi.example.yaml`，包含 `contracts/asyncapi.yaml` 時讀取 `templates/asyncapi.yaml` 與 `templates/asyncapi.example.yaml`，命名載入結果為「合約樣板組」。
2. `WRITE` 依「合約樣板組」與「API 設計」，將「目標合約檔」寫入「目標 spec」所在目錄的 `contracts/`，不建立或修改其他檔案：`info.title` 填 spec.md 的功能名稱；`summary` 與 `description` 的語言依「憲法檢查清單」，沒有規定時使用繁體中文，路徑、欄位名稱、`operationId` 等識別字使用英文。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_contracts.py --spec <目標 spec 絕對路徑> --interfaces <可規劃介面編號，以逗號分隔> <目標合約檔絕對路徑…>`，取得「合約檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
4. `CHECK` 「合約檢查結果」沒有問題，逐條驗證「憲法檢查清單」與「API 合約檢查清單」（衝突時以「憲法檢查清單」為準，規則會改變鎖定項目時不套用並記入「未套用規則」，偏離「應」規則時把規則與理由記入「憲法偏離」），比對合約檔與「合約樣板組」的頂層結構並確認沒有殘留的 `{{`，確認步驟 2 的填寫要求均已滿足；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 3；未通過時修正合約檔後返回步驟 3，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
5. `WRITE` 向使用者或委派方回報每個合約檔的路徑、每個「可規劃介面」的 operation 數、「無法規劃介面」、「上游衝突」（沒有時寫「無」），以及「未通過項」（沒有時說明全部通過）與「憲法遵循」（已讀取的憲法檔路徑，都不存在時寫「沒有憲法檔」；必須／不得規則是否全部通過；「憲法偏離」；「未套用規則」；經 `clarify` 決定的「憲法衝突」）。

完成條件：「目標合約檔」已寫入 `contracts/`，合約檢查結果、「API 合約檢查清單」與樣板結構已通過或未通過的項目已記為「未通過項」，且已回報。
````

### `api-plan/rules/API合約-格式規範.md` 的 To-Be

Rule 1、Rule 2 保留原文。Rule 3 整條改寫（標題、條列、正反例），在 Rule 3 之後新增 Rule 4。

第 2 版（R3）：只改 Rule 3 第 2 點、第 5 點與 Good Example 1 的說明段落；下方為改寫後全文，其餘文字與第 1 版相同。

````markdown
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
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 「判定 `research.md` 的 `Decision` 有缺陷」這個獨立類別（As-Is Rule 3 第 2 點的第一種情況） | `rules/API合約-格式規範.md` Rule 3 第 2 點 | R1（衝突）：子代理把「漏列操作」歸入這個類別，照主句保留 research，造成衝突 (2) 依 research 寫。To-Be 只留兩種情況：會讓 spec 必須／不得規則無法滿足的缺陷（含漏列）依 spec（E1）；和 spec 一致時依 research（E4）。「有缺陷但不違反 spec 也要記為上游衝突」無法追溯到 E1～E8（E2 只涵蓋 E1 的情況與前面 Wave 不一致）。**刪除後的影響**：不違反 spec 的缺陷（例如效能或寫法偏好）不再記為上游衝突，合約照 research 寫 |
| 主句「合約必須保留上游的寫法」與括號「（`research.md` 與 spec 不一致時依 spec）」 | 同上 | R1：主句與括號對同一種情況給出相反答案。改寫成 To-Be 第 2、3 點，只留一種讀法（列在下表「修改」） |
| As-Is Good Example（research §2 先查詢再寫入，超過 FR-005 上限，合約仍照 §2 描述） | Rule 3 Good Example | R1：範例示範「research 讓 spec 規則無法滿足時照 research 寫」，和 E1 相反，也和括號相反。由 To-Be Good Example 1、2 取代 |
| As-Is Bad Example（把滿足 FR-005 的「資料庫鎖保證只成功一筆」標為錯誤） | Rule 3 Bad Example | R1：把依 spec 的寫法標為錯誤，和 E1 相反。由 To-Be Bad Example 1、2 取代 |
| 第 2 點的觸發寫法「`Decision`（包含 `Decision` 漏列…）會讓 spec 的必須／不得規則無法滿足時」（第 2 版，W3） | Rule 3 第 2 點 | R3（不可檢查）：沒有說明要比對什麼才算判定。由「逐項和 `Decision` 比對，清單沒有這個 operation 或這一項，或照寫會讓規則無法滿足」取代。**刪除後的影響**：判斷範圍不變，只多了比對方法 |
| 第 5 點的「上游沒有規定的細節」（第 2 版，W3） | Rule 3 第 5 點 | R3（不可檢查）：「上游」沒有指明，漏列的檢查會被讀成 research 沒有規定的細節。由「`research.md` 與 spec 都沒有規定」取代，並寫明漏列項目不算細節。**刪除後的影響**：spec 要求、research 漏列的項目不再被當成細節略過 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| Rule 3 標題 | 修改 | 「合約不得改寫上游決策…」改為「合約必須依上游決策與 spec 撰寫…」，避免「依 spec 補上」被讀成「改寫上游決策」 | R1；E1、E4；C14、C15 |
| Rule 3 第 1 點 | 修改 | 「另一種做法」改為「把 `Decision` 採用的機制換成另一種機制」，並舉例；其餘原文保留 | R1（第 1 點界線不清）；E4；C14 |
| Rule 3 第 2 點 | 改寫 | 只處理「Decision（含漏列）讓 spec 必須／不得規則無法滿足」：依 spec 寫、記為上游衝突、優先沿用 Decision 的機制、沒有機制時只寫 spec 要求的結果、不算第 1 點的另一種機制 | R1；E1、E2、E8；C15 |
| Rule 3 第 3 點（新條列，來自 As-Is 第 2 點的第三種情況） | 改寫 | 前面 Wave 與 research／spec 不一致時依第 1、2 點，不沿用前面 Wave 的寫法，記為上游衝突 | R1（原句「保留上游的寫法」沒有指明是哪個上游）；E2、E4；C16 |
| Rule 3 第 4 點（As-Is 第 3 點） | 修改 | 上游位置加上「第 2 點的情況必須同時寫出 `research.md` 的 § 編號與 spec 的需求編號」；其餘原文保留 | R1（衝突 (2) 只寫 research §3）；E2；C17 |
| Rule 3 第 5 點（As-Is 第 4 點） | 修改 | 例子由「例如新增欄位或錯誤碼」改為「例如欄位、錯誤碼、檢查先後」，和 E4 一致 | E4；C18 |
| Rule 3 Good Example 1、2，Bad Example 1、2 | 新增（取代刪除的舊範例） | 圖書館借閱領域（不是 005～007 的驗收領域）。Good 1：漏列預約取書，依 FR-005 沿用 §3 的鎖，上游位置寫兩者；Good 2：只補細節，不記衝突；Bad 1：本次的失敗型態（判定違反 spec 仍照 research 寫，上游位置只寫 research）；Bad 2：換成另一種機制 | R1；E1、E2、E4；C15、C17、C18、C14 |
| `rules/API合約-格式規範.md` Rule 4 | 新增 | 同一 operation 的同一分支不得寫出相反的行為；總述涵蓋每個分支，不適用時寫出例外；發現相反時依 Rule 3 決定並只留一種；正反例各 1 組 | R2（缺失）；E3；C19 |
| Rule 3 第 2 點（第 2 版） | 改寫 | 觸發條件改成可檢查：合約為了 spec 規則寫出的每項操作、檢查、執行路徑或鎖，逐項和 `Decision` 比對；清單沒有這個 operation、沒有這一項，或照寫會讓規則無法滿足時，依 spec 寫並記為上游衝突。後半句（沿用機制、不算另一種機制）保留原文 | R3（不可檢查）；E1、E2；C15 |
| Rule 3 第 5 點（第 2 版） | 改寫 | 「上游」改為「`research.md` 與 spec 都」；加一句「spec 規則要求、`Decision` 漏列的項目不算細節，依第 2 點」 | R3（不可檢查）；E2、E4；C18 |
| Rule 3 Good Example 1 說明段落（第 2 版） | 修改 | 加一句比對過程：比對 §3 清單和 FR-005，清單沒有預約取書，所以是第 2 點的情況。YAML 與回報區塊不變 | R3；E1、E2；C15 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter（name、description） | 觸發與分流；description 是概述，不是存放位置，本次不改變觸發 | — |
| Phase 1 步驟 1～11 與完成條件 | 必要流程（輸入、目標 spec、憲法、負責介面、傳輸歸類）；E7 | C1～C8 |
| Phase 2 步驟 1 | 必要流程（載入 API 合約檢查清單，新增 Rule 4 自動載入） | C9 |
| Phase 2 步驟 2 | E1、E2、E8；步驟只引用檢查清單，沒有重述 Rule 3 的判斷 | C10、C11 |
| Phase 2 步驟 3～5 與完成條件 | E6 | C20、C21 |
| Phase 3 步驟 1～5 與完成條件 | E3、E5、E2（回報項目）；步驟 4 逐條驗證檢查清單，已涵蓋 Rule 4 | C22～C27 |
| `rules/API合約-格式規範.md` Rule 1 | E5 | C12 |
| `rules/API合約-格式規範.md` Rule 2 | E5（Edge Case 與錯誤 schema 是既有合約品質要求，屬於 E5 的「既有」範圍） | C13 |
| OpenAPI 樣板組、AsyncAPI 樣板組 | E5 | C23 |
| `scripts/check_contracts.py` | E5 | C25 |
| Rule 3 Bad Example 1、2 與 Good Example 2（第 2 版不改） | R1；E1、E2、E4。第 2 版考慮在 Bad Example 1 補上 S1 的型態（依 spec 補上卻寫成依 research，沒有記衝突），不採用：使用者確認的範圍只到第 2、5 點與 Good Example 1；R3 是不可檢查，修改方向是改寫原有要求，Good Example 1 補上的比對句已示範第 2 點的檢查 | C14、C15、C17、C18 |
| 呼叫者 `system-analysis` Phase 5 步驟 1、3 | 委派內容與「上游衝突」轉述的名稱、格式都不變，不需改 | — |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 21 | 21 | 0 |
| RuleFile | 1 | 1 | 0 |
| Rule | 3 | 4 | +1 |
| 樣板組 | 2 | 2 | 0 |
| 腳本 | 1 | 1 | 0 |

- 內容增減：Rule 3 刪除「Decision 有缺陷」類別、主句與括號、舊正反例各 1 組；改寫成 5 個條列與正反例各 2 組。
- Rule +1 的理由（R2；E3）：依序考慮刪除、改寫、改換存放位置與新增。
  - 刪除：R2 是缺失，沒有錯誤內容可刪。
  - 改寫：Rule 1 管 tag 與需求引用，Rule 2 管 Edge Case 與錯誤 schema，Rule 3 管合約與上游的關係；「合約內部前後一致」是另一個判斷，併入任何一條都會把不同判斷混在一起。
  - 改換存放位置：沒有既有存放位置。腳本無法判斷兩段自然語言是否相反（根因報告第 6 節）；不是整份檔案結構，樣板無法保證；需要正反例，不能放在步驟內文。
  - 新增：屬於 API 合約內容的主題，已有同主題 RuleFile，所以在 `rules/API合約-格式規範.md` 新增 Rule 4，不新增檔案。
- 步驟不增加：Phase 3 步驟 4 已逐條驗證整份檢查清單。
- 第 2 版（R3）：數量不變。內容只改寫 Rule 3 第 2 點的觸發句、第 5 點的「上游」，並在 Good Example 1 加一句比對過程；沒有新增要求。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 讀取需求與 spec 清單，決定目標 spec，缺少或多份時停止 | P1-1～P1-3 | SOP 流程 | 分支與停止；既有，不變 |
| C2 | 讀取 spec、plan、techstack、research 與 `ui/`、`data/`、`contracts/` | P1-4 | 步驟內文 | 單一步驟、一句話；既有，不變 |
| C3 | 讀取憲法檔並列出鎖定項目 | P1-5 | 步驟內文 | 單一步驟、一句話；既有，不變 |
| C4 | 沒有 plan.md 時停止 | P1-6 | SOP 流程 | 分支；既有，不變 |
| C5 | 負責介面的決定方式 | P1-7 | 步驟內文 | 單一步驟、一句話；既有，不變 |
| C6 | 負責介面為空時停止 | P1-8 | SOP 流程 | 分支；既有，不變 |
| C7 | 依傳輸方式歸類到 openapi／asyncapi，建立可規劃介面與目標合約檔 | P1-9 | 步驟內文 | 單一步驟、一句話；既有，不變 |
| C8 | 已存在的合約檔的覆寫確認 | P1-10、P1-11 | SOP 流程 | 使用者確認閘門；既有，不變 |
| C9 | 設計前載入 API 合約檢查清單 | P2-1 | SOP 流程 | 載入時機；既有，不變 |
| C10 | 只設計前端或外部系統與後端之間的介面，不設計資料表或程式實作 | P2-2 | 步驟內文 | 單一步驟、一句話；既有，不變 |
| C11 | 上游衝突只在 Phase 3 步驟 5 回報，不委派 `clarify`，不停止產出 | P2-2 | SOP 流程 | 屬於分支（不進入 `clarify`、不停止）；既有，不變 |
| C12 | tag 與介面一致、每個介面至少一個 operation、`description` 引用需求編號 | P2-2、P3-4 | API 合約 Rule 1 | 既有，不變 |
| C13 | Edge Case 與驗證規則對應 4xx／一般結果，共用錯誤 schema | P2-2、P3-4 | API 合約 Rule 2 | 既有，不變 |
| C14 | 合約與 research／spec 一致，不寫相反規則，不把 Decision 的機制換成另一種機制 | P2-2、P3-4 | API 合約 Rule 3 | 腳本無法判斷語意是否相反或是否換了機制；不是整份檔案結構；需要正反例；同主題已有 Rule 3，改寫而不新增 |
| C15 | 合約為了 spec 必須／不得規則寫出的每項操作、檢查、執行路徑或鎖逐項和 Decision 比對；清單沒有這個 operation、沒有這一項，或照寫會讓規則無法滿足時依 spec，優先沿用 Decision 的機制，記為上游衝突（第 2 版改寫觸發條件） | P2-2、P3-4 | API 合約 Rule 3 | 同 C14；和 C14 同一個判斷主題，放同一條 Rule 才能界定「依 spec 補上」不算另一種機制 |
| C16 | 前面 Wave 與 research／spec 不一致時依 C14、C15，不沿用前面 Wave，記為上游衝突 | P2-2、P3-4 | API 合約 Rule 3 | 同 C14 |
| C17 | 上游衝突的四件事；C15 的情況上游位置同時寫 research § 與 spec 需求編號 | P2-2、P3-5 | API 合約 Rule 3 | 判斷上游位置要寫哪些需要正反例；不是整份檔案的結構，回報不是產出檔，樣板不適用 |
| C18 | 只補上 research 與 spec 都沒有規定的細節且不相反時，不算上游衝突；spec 規則要求、Decision 漏列的項目不算細節（第 2 版改寫） | P2-2、P3-4 | API 合約 Rule 3 | 同 C14 |
| C19 | 同一 operation 的同一分支，`info.description`、`description`、response 說明不得相反；總述涵蓋每個分支；發現時依 Rule 3 修正 | P2-2、P3-4 | API 合約 Rule 4（新增） | 腳本無法判斷兩段自然語言是否相反；不是整份檔案結構，樣板無法保證；持續適用且需要正反例；同主題已有 RuleFile，新增 Rule 而不新增檔案 |
| C20 | 憲法衝突的建立 | P2-3 | 步驟內文 | 單一步驟、一句話；既有，不變 |
| C21 | 憲法衝突委派 `clarify`（以路徑讀取，不用 Skill 工具），沒有 `clarify` 或未回覆時停止 | P2-4、P2-5 | SOP 流程 | 委派與分支；既有，不變 |
| C22 | 寫入前載入合約樣板組 | P3-1 | SOP 流程 | 載入時機；既有，不變 |
| C23 | OpenAPI／AsyncAPI 合約的頂層結構 | P3-2、P3-4 | 合約樣板組 | 既有，不變 |
| C24 | `info.title`、說明文字語言、識別字用英文，不建立其他檔案 | P3-2 | 步驟內文 | 既有，不變 |
| C25 | Redocly、tag、介面涵蓋、需求編號的檢查 | P3-3 | `scripts/check_contracts.py` | 既有，不變 |
| C26 | 驗證順序、憲法優先、鎖定項目、最多 3 輪 | P3-4 | SOP 流程 | 迴圈與優先順序；既有，不變 |
| C27 | 回報項目（含「上游衝突」，沒有時寫「無」） | P3-5 | 步驟內文 | 回報清單只屬於單一步驟；每項上游衝突的內容由 C17 規定，這裡只引用；既有，不變 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-rule` | `.agents/skills/api-plan/rules/API合約-格式規範.md` Rule 3 | 依第 2 節 To-Be 改寫 Rule 3 的標題、條列與正反例 | C14～C18 | 已完成 |
| 2 | W2 | `skill-form-rule` | `.agents/skills/api-plan/rules/API合約-格式規範.md` | 在 Rule 3 之後新增 Rule 4（含 Good／Bad Example），內容依第 2 節 To-Be | C19 | 已完成 |
| 3 | W3 | `skill-form-rule` | `.agents/skills/api-plan/rules/API合約-格式規範.md` Rule 3 第 2 點、第 5 點、Good Example 1 | 依第 2 節 To-Be（第 2 版）改寫這 3 處 | C15、C18 | 已完成 |

施工順序依施工委派 Rule 3：沒有刪除部位檔案、frontmatter 與 SOP 修改；只有修改既有部位內容（W1、W2）；沒有抽取工作項。新增 Rule 不改變載入步驟（Phase 2 步驟 1 已載入整個 RuleFile），所以交給 `skill-form-rule`。施工後執行 `./scripts/sync-skills.sh --from agents` 與 `--check`。W3 也是修改既有部位內容、不改變載入步驟，交給 `skill-form-rule`。

### 工作項內容

- **W1**：把 `rules/API合約-格式規範.md` 的 Rule 3（從「# Rule 3」到 Rule 3 的 Bad Example 結尾）整段換成第 2 節 To-Be「# Rule 3 - 合約必須依上游決策與 spec 撰寫，上游問題必須記為上游衝突」全文。Rule 1、Rule 2 不變。
- **W2**：在 W1 改寫後的 Rule 3 之後，新增第 2 節 To-Be「# Rule 4 - 同一 operation 的同一分支不得寫出相反的行為」全文。
- **W3**：在 `rules/API合約-格式規範.md` 的「# Rule 3 - 合約必須依上游決策與 spec 撰寫…」中，做 3 處替換，其餘文字不變：
  1. 以「`research.md` 的 `Decision`（包含 `Decision` 漏列…」開頭的條列（第 2 點），換成第 2 節 To-Be 以「合約為了滿足 spec 的必須／不得規則而寫出的每一項操作…」開頭的條列全文。
  2. 以「補上上游沒有規定的細節」開頭的條列（第 5 點），換成第 2 節 To-Be 以「補上 `research.md` 與 spec 都沒有規定的細節」開頭的條列全文。
  3. Good Example「### Example 1」的說明段落，在「照 §3 寫時，預約取書和借閱同時送出可能都通過檢查。」之後插入「比對 §3 清單和 FR-005：合約為了 FR-005 在預約取書也要鎖借書證列，§3 清單沒有這個 operation，所以是第 2 點的情況。」

## 7. 驗收情境

共同環境：每個情境用獨立的暫存目錄。以 `git archive <commit>` 展開 `specs/`；複製修改後的 `.agents`、`.claude`（排除 `node_modules`）、`AGENTS.md`、`CLAUDE.md`；`git init` 並 commit 一次當作基準。驗收子代理以 Agent 工具指定 `model: sonnet`、`effort: medium`，只提供 Skill 路徑、環境位置、委派內容或使用者輸入與預先回覆，回報確認閘門內容、最終回報原文、`git status` 與 `git diff --stat`。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E3、E5、E8；呼叫者 `system-analysis` 的委派輸入 | 原始輸入（兼呼叫者回歸） | `git archive 75855c6`；刪除 `specs/007-equipment-maintenance-retire/` 的 `contracts/`、`data/`，保留 `ui/`。委派內容只寫 system-analysis Phase 5 步驟 1 規定的項目：Skill 路徑、目標 spec 目錄、負責介面 B1～B6、`contracts/` 不存在、依賴缺口無；不另外要求「不要把合約改寫成和上游相反的規則」 | 無（不應提問） | (1) 回報列出 research §3 與 FR-004（需人工審核設備的改期送出）的衝突時，`createRescheduleRequest` 寫明需人工審核設備的改期送出也和設定送修或停用序列化，不只規定免審核路徑；沒有列出這項衝突時記為「未觸發」，以 S2 判斷 E1；(2) 回報中每項「research 會讓 spec 規則無法滿足」的上游衝突，合約都依 spec 寫，上游位置同時寫 research § 與 spec 編號；(3) `updateEquipmentStatus` 等 operation 對同一分支沒有相反的描述；(4) 上游衝突每項都有 4 件事；(5) `check_contracts.py` 沒有 issues，過程沒有提問，`git status` 只有 `contracts/` |
| S2 | E1、E2、E4、E5、E8 | 構造 | `git archive 46d1f7f`；刪除 `specs/006-reservation-reschedule/` 的 `contracts/`、`data/`。在 006 `research.md` §2「管理員核准」的 Decision 刪掉「原預約仍為 `confirmed`、」，並刪掉同一句的「依 FR-006 」（第 3 輪起），讓檢查清單成為封閉清單，使它和 FR-006 無法同時滿足；植入後 commit 進基準。委派內容同 S1 的項目，負責介面為 006 plan.md 的 B1～B6 | 無（不應提問） | (1) 核准改期的 operation（`approveRescheduleRequest` 或對應名稱）的 `description` 寫明核准時驗證原預約仍為 `confirmed`，不是時拒絕；(2) 回報有一項上游衝突，上游位置為 research §2 與 FR-006，處理 Skill 為 `technical-research`；(3) research 其他沒有植入缺陷的 Decision（單一交易、`P2002` 轉 409、惰性失效）在合約中照 research 寫，沒有換成另一種機制；(4) `check_contracts.py` 沒有 issues，過程沒有提問 |
| S3 | E4、E5、E6、E2 | 回歸 | `git archive ed0f842`；刪除 `specs/005-equipment-pickup-return/contracts/`，委派 api-plan 處理 005 的後端介面 | `clarify` 提問時每題選推薦選項 | (1) `check_contracts.py` 沒有 issues；(2) 回報包含每個介面的 operation 數、「上游衝突」（內容或「無」）與「憲法遵循」；(3) 列出的每項上游衝突都能在 005 research 或 spec 找到對應條目；其中「research 與 spec 無法同時滿足」的項目，合約依 spec 寫；(4) 只補上細節的項目沒有列為上游衝突 |
| S4 | E7 | 回歸 | 同 S3 的環境，但保留 `specs/005-equipment-pickup-return/contracts/openapi.yaml`，委派內容沒有說明同意覆寫 | 覆寫確認回答「不同意」 | 先列出既有合約檔並詢問；回覆後停止，`git status` 沒有變更，檔案雜湊值不變 |

第 2 輪（W3 施工後）：重跑 S1、S2、S3，每個情境都重新建立環境。S4 只驗證 Phase 1 的覆寫確認，W3 不影響，沿用第 1 輪結果。

直接呼叫者：`system-analysis`（Phase 5 步驟 1 委派、步驟 3 轉述「上游衝突」）。S1 以步驟 1 的委派內容執行，涵蓋呼叫者的輸入；api-plan 的回報項目與格式不變，步驟 3 的轉述不受影響。

## 8. 驗收結果

第 1 輪（2026-11-10，W1、W2 施工後）：

- 施工後結構診斷：`api-plan` errors 0、warnings 0。
- 同步：`./scripts/sync-skills.sh --from agents` exit 0，`--check`「兩邊一致」；沒有只存在於目標端的 Skill。
- 驗收方式：Agent 工具，`model: sonnet`、`effort: medium`，4 個子代理各用 `/tmp/acc45/s1`～`s4` 的獨立複本平行執行。

| 情境 | 結果 | 說明 |
| ---- | ---- | ---- |
| S1 | 通過（判斷 (1) 未觸發） | `check_contracts.py` 沒有 issues；沒有提問；`git status` 只有 `contracts/`。上游衝突 1 項（登記領取，research §3、FR-005、FR-003，沿用 §3 的 `FOR SHARE`）。`changeEquipmentStatus` 的 `available` 分支沒有相反的描述。觀察：`rescheduleReservation` 兩條路徑都寫先鎖（E1 成立），但沒有記為上游衝突 |
| S2 | **未通過** | 判斷 (1) 通過：`approveRescheduleRequest` 驗證原預約仍為 `confirmed`，不是時回 409。判斷 (2) 未通過：沒有 research §2／FR-006 的上游衝突（只回報 `listAllReservations` 1 項）。判斷 (3)、(4) 通過 |
| S3 | 通過 | `check_contracts.py` 沒有 issues；上游衝突 2 項都在 005 research §2 與 FR-001／FR-002／FR-004 找到對應條目，合約依 spec 寫；沒有自選新機制 |
| S4 | 通過 | 詢問覆寫，回覆「不同意」後停止；`git status` 沒有變更，雜湊值不變 |

- S2 失敗來自 Skill，依 Phase 5 步驟 17 返回 Phase 2，補充根因 R3 見 `rca-report.md` 第 10 節，等待使用者確認。

第 2 輪（2026-11-10，W3 施工後）：

- 施工後結構診斷：`api-plan` errors 0、warnings 0。
- 同步：`./scripts/sync-skills.sh --from agents` exit 0，`--check`「兩邊一致」；`git status` 只有 `api-plan` 的規則檔；沒有只存在於目標端的 Skill。
- 環境：刪除第 1 輪的 `/tmp/acc45/s1`～`s3` 後依第 7 節重建；S2 的植入字串只出現 1 次，植入後才 commit 基準。`s4` 保留，不重跑。
- 驗收方式：Agent 工具，`subagent_type: general-purpose`、`model: sonnet`、`effort: medium`，3 個子代理平行執行。判斷時由主 session 重跑 `check_contracts.py` 並打開合約核對。

| 情境 | 結果 | 說明 |
| ---- | ---- | ---- |
| S1 | 通過（判斷 (1) 已觸發） | `check_contracts.py` 沒有 issues；沒有提問；`git status` 只有 `contracts/`。上游衝突 2 項，每項 4 件事齊全，上游位置都同時寫 research §3 與 spec：(1) 登記領取（FR-003、FR-005），`pickupReservationByAdmin` 沿用 §3 的 `FOR SHARE`；(2) 需人工審核的改期送出（FR-004、FR-019），`createRescheduleRequest` 兩條路徑都先 `FOR SHARE`。第 1 輪沒有記出的 (2) 這次記出。`updateEquipmentStatus` 的編號步驟限定在 maintenance／retired，`available` 分支寫不讀取也不修改改期申請，沒有相反的描述 |
| S2 | **未通過** | 判斷 (1) 通過：`approveRescheduleRequest` 驗證原預約仍為 `confirmed`。判斷 (2) 未通過：回報「上游衝突：無」。子代理紀錄中，寫 `approveRescheduleRequest` 時照 FR-006 列出檢查，沒有和 research §2 比對的紀錄。判斷 (3)、(4) 通過 |
| S3 | 通過 | `check_contracts.py` 沒有 issues；上游衝突 2 項（領取時間邊界：research §2 與 FR-002；重複點擊並發：research §2 與 FR-001、FR-004），都能在 005 research 與 spec 找到，合約依 spec 寫，沒有自選新技術；新增錯誤碼等細節沒有列為上游衝突 |

- S2 觀察：006 research §2「管理員核准」原文為「交易內**依 FR-006** 檢查申請仍為 `pending_approval`、原時段與新時段都尚未開始」。S1 的 research §3 沒有「依 FR-xxx」字樣，這次記出了衝突；S2 沒有記出。這和根因報告第 10.3 節「S2 的植入太弱」的假設一致，等待使用者決定處理方式。

第 3 輪（2026-11-10，修正 S2 測試環境，只重跑 S2）：

- 修正理由：第 2 輪的植入只刪掉一項檢查，句子仍寫「交易內依 FR-006 檢查…」。照這句寫，FR-006 的每一項都會檢查到，spec 規則可以滿足，依 To-Be Rule 3 第 2 點可以不記衝突，所以測試環境和情境描述「使它和 FR-006 無法同時滿足」不一致。使用者選擇視為測試環境問題（Phase 5 步驟 17），同意同時刪掉「依 FR-006 」。
- 環境：刪除 `/tmp/acc45/s2` 後重建；植入後該句為「交易內檢查申請仍為 `pending_approval`、原時段與新時段都尚未開始」，植入後才 commit 基準。S1、S3 沿用第 2 輪結果，S4 沿用第 1 輪結果。
- 驗收方式：同第 2 輪。

| 情境 | 結果 | 說明 |
| ---- | ---- | ---- |
| S2 | 通過 | 判斷 (1)：`approveRescheduleRequest` 驗證原預約仍為 `confirmed`，不是時回 409 `RESCHEDULE_NOT_ALLOWED`。判斷 (2)：上游衝突有一項寫出 research §2 的核准檢查清單沒有「原預約仍為已核准／有效」，上游位置為 research §2 與 FR-006，處理 Skill 為 `technical-research`，4 件事齊全。另一項（送出改期的清單沒有 FR-001「本人在新時段沒有其他未結束預約」）在 46d1f7f 原文就存在，research §2 送出改期的清單確實沒有這一項，屬於正確記出。判斷 (3)：單一交易、`P2002` 轉 409、交易開頭先讓到期的申請失效都照 research 寫，沒有 `FOR UPDATE` 或樂觀鎖等另一種機制。判斷 (4)：主 session 重跑 `check_contracts.py` 沒有 issues；沒有提問；`git status` 只有 `contracts/` |

- 觀察（不影響本次判斷）：S2 子代理回報「沒有逐條核對憲法規則，只用腳本檢查」，沒有完整執行 Phase 3 步驟 4 的逐條驗證與樣板頂層結構比對；回報仍包含「憲法遵循」（E6）。本次修改沒有動到這一步，第 1、2 輪其他子代理都有執行，記為模型執行差異，不列為本次根因。

驗收結論：S1、S2、S3 通過（S1、S3 為第 2 輪，S2 為第 3 輪），S4 沿用第 1 輪通過。所有施工工作項為「已完成」，結構診斷沒有 error，兩側 skills 一致。

