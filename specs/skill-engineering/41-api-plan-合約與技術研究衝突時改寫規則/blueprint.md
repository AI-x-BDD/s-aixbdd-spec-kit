# 工程藍圖：api-plan－合約與技術研究衝突時改寫規則

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/41-api-plan-合約與技術研究衝突時改寫規則/`
- 根因報告：`rca-report.md`（R1，使用者已確認）
- 確認紀錄：
  - 2026-11-10 根因報告：使用者回覆「確認」，同意 E1～E6（含推定 E6）與 R1。範圍（待確認事項 4）沒有另外指定，依使用者最初的需求只改 api-plan；data-plan、ui-plan 不改。
  - 2026-11-10 工程藍圖：使用者回覆「確認」，確認 W1～W3、淨增減（Rule +1）與驗收情境 S1～S4。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 合約中的規則不得與 `research.md` 的 `Decision` 或 spec 的需求相反；發現上游有問題或無法同時滿足時，合約保留上游的寫法 | 本次 | 通用 |
| E2 | 發現 E1 的情況時，回報有獨立的「上游衝突」項目，每項寫出衝突內容、上游位置、受影響 operation 與建議處理 Skill；沒有時寫「無」 | 本次 | 通用 |
| E3 | 每個 operation 恰好一個「介面編號 介面名稱」tag，每個可規劃介面至少一個 operation，`description` 引用 spec 存在的需求編號；`check_contracts.py` 沒有 issues | 既有 | 通用 |
| E4 | 憲法衝突仍委派 `clarify`；回報仍包含「憲法遵循」 | 既有 | 通用 |
| E5 | 已存在的合約檔在委派內容沒有說明同意時，先詢問是否覆寫 | 既有 | 通用 |
| E6 | 「上游衝突」只在回報中列出，不停止產出、不提問（推定：子代理無法和使用者對話） | 推定（已確認） | 通用 |

## 2. To-Be SOP

### `api-plan/SKILL.md`

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

### `api-plan/rules/API合約-格式規範.md` 新增的 Rule 3

````markdown
# Rule 3 - 合約不得改寫上游決策，上游問題必須記為上游衝突

- 合約中的規則（`info.description`、operation 的 `description`、request 與 response 欄位、錯誤碼與狀態碼）必須與 `research.md` 各主題的 `Decision` 及 spec 的需求一致，不得寫出相反的規則或另一種做法。
- 判定 `research.md` 的 `Decision` 有缺陷、`research.md` 與 spec 無法同時滿足，或前面 Wave 的產出與 `research.md`／spec 不一致時，合約必須保留上游的寫法（`research.md` 與 spec 不一致時依 spec），並把這件事記為一項上游衝突。
- 每項上游衝突必須寫出四件事：衝突內容、上游位置（`research.md` 的 § 編號、spec 的需求編號或前面 Wave 產出的檔案與位置）、合約中受影響的 `operationId`，以及建議的處理 Skill（`research.md` 為 `technical-research`，spec 為 `clarify-over-specs`，前面 Wave 的產出為產出它的 Planner）。
- 補上上游沒有規定的細節（例如新增欄位或錯誤碼），且沒有與上游相反時，不算上游衝突。

## Good Example

- 圖書館借閱的 `research.md` §2 決定「借閱上限在應用層先查詢已借數量再寫入」。設計時發現兩個請求同時送出會都通過查詢；合約仍照 §2 描述，並記一項上游衝突。

```yaml
paths:
  /loans:
    post:
      operationId: createLoan
      description: 依 FR-005 每張借書證最多同時借 5 本；依 research §2，後端先查詢已借數量，達上限時回 409 LOAN_LIMIT。
```

```markdown
上游衝突：
1. 內容：research §2 先查詢再寫入，兩個請求同時送出時可能都通過，超過 FR-005 的 5 本上限。
   上游位置：research.md §2；受影響 operation：createLoan；建議處理 Skill：technical-research。
```

## Bad Example

- 同一情境，合約自行寫出與 research §2 相反的做法，只在回報結尾提醒，沒有指出上游位置與處理 Skill；之後依 research 實作的程式與合約不符。

```yaml
paths:
  /loans:
    post:
      operationId: createLoan
      description: 依 FR-005 每張借書證最多同時借 5 本；借閱上限由資料庫鎖保證，同時送出時一律只成功一筆。
```

```markdown
提醒：research §2 的做法有並發問題，實作時請改用資料庫鎖。
```
````

### `system-analysis/SKILL.md` Phase 5 步驟 3（呼叫者，只改回報項目）

在現有回報項目最後的「委派內容中註明的依賴缺口」之後加上「；各 Planner 回報的「上游衝突」（逐項原文列出，Planner 沒有回報這一項時略過）」。其餘文字不變。

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無 | — | As-Is 的每個元素都追溯到 E3～E5 或必要流程（見保留）；R1 是缺失，沒有可刪除的錯誤內容 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| api-plan P2-2 | 修改 | 產出由「API 設計」擴充為「API 設計」與「上游衝突」，並寫明上游衝突只回報、不委派 `clarify`、不停止 | R1；E1、E2、E6；C9、C10 |
| api-plan P3-5 | 修改 | 回報項目加入「上游衝突」（沒有時寫「無」） | R1；E2；C19 |
| `rules/API合約-格式規範.md` Rule 3 | 新增 | 合約不得改寫上游決策；上游衝突的判定條件與四項內容；正反例 | R1；E1、E2；C11 |
| system-analysis P5-3 | 修改 | 回報項目加入各 Planner 回報的「上游衝突」 | 重新設計 Rule 6（api-plan 的輸出改變，呼叫者要轉述）；E2；C20 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter（name、description） | 觸發與分流；不需改：description 已涵蓋「參考 spec、技術研究結果與前面 Wave 的產出」 | — |
| api-plan Phase 1 步驟 1～11 與完成條件 | 必要流程（輸入、目標 spec、負責介面、傳輸分類）；E5 | C1～C7 |
| api-plan P2-1 | E1～E3（載入 API 合約檢查清單，含新 Rule 3） | C8 |
| api-plan P2-3～P2-5 與 Phase 2 完成條件 | E4 | C12、C13 |
| api-plan Phase 3 步驟 1～4 與完成條件 | E3 | C14～C18 |
| `rules/API合約-格式規範.md` Rule 1 | E3 | C21 |
| `rules/API合約-格式規範.md` Rule 2 | E3（Edge Case 與 spec 一致）；既有核心預期 | C22 |
| `templates/openapi.yaml`、`openapi.example.yaml` | E3（合約結構） | C23 |
| `templates/asyncapi.yaml`、`asyncapi.example.yaml` | E3（事件合約結構） | C24 |
| `scripts/check_contracts.py` | E3 | C25 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 21 | 21 | 0 |
| RuleFile | 1 | 1 | 0 |
| Rule | 2 | 3 | +1 |
| 樣板組 | 2 | 2 | 0 |
| 腳本 | 1 | 1 | 0 |

- Rule +1 的理由（R1、E1、E2）：依序考慮刪除、改寫、改換存放位置與新增。沒有錯誤內容可刪除；Rule 1（tag 與需求引用）與 Rule 2（Edge Case 與 spec 一致）是不同主題，改寫它們會把兩個主題混在一起；判斷「上游是否有缺陷、與上游是否相反」需要正反例，不能只放在步驟內文；同主題（合約內容）已有 RuleFile，所以擴充既有檔案而不新增檔案。
- 步驟不增加：上游衝突的建立併入 P2-2（同一個設計動作），回報併入 P3-5。
- 只有新增與修改、沒有刪除：As-Is 每個元素都追溯到既有預期，R1 是缺失類型。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 讀取需求與 spec 清單，決定目標 spec，缺少或多份時停止 | P1-1～P1-3 | SOP 流程 | 分支與停止屬於流程 |
| C2 | 讀取 spec、plan、techstack、research、ui、data、contracts | P1-4 | 步驟內文 | 單一步驟、一句話 |
| C3 | 讀取憲法檔並列出鎖定項目 | P1-5 | 步驟內文 | 單一步驟、一句話 |
| C4 | 沒有 plan.md 時停止 | P1-6 | SOP 流程 | 分支 |
| C5 | 負責介面的決定方式 | P1-7、P1-8 | 步驟內文 | 單一步驟、一句話 |
| C6 | 依傳輸方式歸類介面與合約檔 | P1-9 | 步驟內文 | 單一步驟、一句話、不需正反例 |
| C7 | 既有合約檔的覆寫確認 | P1-10、P1-11 | SOP 流程 | 使用者確認閘門 |
| C8 | 載入 API 合約檢查清單 | P2-1 | SOP 流程 | 載入時機 |
| C9 | 依規劃輸入設計 operation 等，只設計介面不設計資料表 | P2-2 | 步驟內文 | 單一步驟、一句話 |
| C10 | 上游衝突只回報、不委派 `clarify`、不停止產出 | P2-2 | SOP 流程 | 屬於分支（不進入 clarify、不停止）；不能放 RuleFile |
| C11 | 合約不得改寫上游決策；上游衝突的判定與四項內容 | P2-2（經 P2-1 載入） | `rules/API合約-格式規範.md` Rule 3 | 腳本無法判斷「上游決策是否有缺陷、合約是否相反」；不是整份檔案結構，樣板無法保證；持續適用且需要正反例；同主題已有 RuleFile，擴充而不新增 |
| C12 | 憲法衝突的建立 | P2-3 | 步驟內文 | 單一步驟、一句話 |
| C13 | 憲法衝突委派 `clarify`，缺 clarify 或未回覆時停止 | P2-4、P2-5 | SOP 流程 | 委派與分支 |
| C14 | 依合約樣板組產出合約 | P3-1、P3-2 | 合約樣板組 | 整份檔案結構 |
| C15 | `info.title` 與說明文字語言、識別字英文 | P3-2 | 步驟內文 | 單一步驟、一句話 |
| C16 | 執行 `check_contracts.py` | P3-3 | 腳本 | 可由程式判斷 |
| C17 | 檢查與修正最多 3 輪 | P3-4 | SOP 流程 | 迴圈 |
| C18 | 憲法優先、偏離與未套用規則的記錄方式 | P3-4 | 步驟內文 | 單一步驟 |
| C19 | 回報項目（含上游衝突，沒有時寫「無」） | P3-5 | 步驟內文 | 回報項目清單只屬於單一步驟、一句話；上游衝突每項的四項內容由 C11 規定，這裡只引用 |
| C20 | system-analysis 回報轉述各 Planner 的上游衝突 | system-analysis P5-3 | 步驟內文 | 回報項目只屬於單一步驟 |
| C21 | tag、介面涵蓋、需求引用 | P2-2、P3-4 | `rules/API合約-格式規範.md` Rule 1 | 既有，不變 |
| C22 | Edge Case 與驗證規則的錯誤／正常結果寫法 | P2-2、P3-4 | `rules/API合約-格式規範.md` Rule 2 | 既有，不變 |
| C23 | OpenAPI 合約結構 | P3-2 | OpenAPI 樣板組 | 既有，不變 |
| C24 | AsyncAPI 合約結構 | P3-2 | AsyncAPI 樣板組 | 既有，不變 |
| C25 | 合約的 tag、需求編號、lint 檢查 | P3-3 | `scripts/check_contracts.py` | 既有，不變 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-sop` | `api-plan/SKILL.md` Phase 2「設計 API 合約」的 `THINK` 步驟（「為「可規劃介面」設計 operation」）與 Phase 3「產出合約檔」的 `WRITE` 回報步驟（「向使用者或委派方回報」） | 依 To-Be SOP 修改兩個步驟的文字 | C10、C19 | 已完成 |
| 2 | W2 | `skill-form-sop` | `system-analysis/SKILL.md` Phase 5「依 Wave 委派並回報」的 `WRITE` 回報步驟（「向使用者回報，不另寫彙整檔」） | 在回報項目最後加入各 Planner 回報的「上游衝突」 | C20 | 已完成 |
| 3 | W3 | `skill-form-rule` | `api-plan/rules/API合約-格式規範.md` | 在 Rule 2 之後新增 Rule 3（含 Good／Bad Example），內容依 To-Be | C11 | 已完成 |

施工順序依施工委派 Rule 3：沒有刪除部位與 frontmatter；先 SOP（W1、W2），再修改既有部位內容（W3）；沒有抽取工作項。新增 Rule 不改變載入步驟（P2-1 已載入整個 RuleFile），所以交給 `skill-form-rule`。

### 工作項內容

- **W1**（已經使用者確認）：
  - Phase 2「設計 API 合約」的 `THINK` 步驟：在「建立「API 設計」」之後加上「，並把設計時發現的上游問題建立為「上游衝突」；「上游衝突」只在 Phase 3 步驟 5 回報，不委派 `clarify`，也不停止產出」。
  - Phase 3「產出合約檔」的 `WRITE` 回報步驟：在「「無法規劃介面」」之後加上「、「上游衝突」（沒有時寫「無」）」。
  - 其餘步驟與完成條件不變。
- **W2**（已經使用者確認）：system-analysis Phase 5 的 `WRITE` 回報步驟，在「委派內容中註明的依賴缺口」之後加上「；各 Planner 回報的「上游衝突」（逐項原文列出，Planner 沒有回報這一項時略過）」。
- **W3**（已經使用者確認）：在 `rules/API合約-格式規範.md` 的 Rule 2 之後新增 Rule 3，標題、條列與正反例依 To-Be「新增的 Rule 3」全文。

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E6 | 原始輸入 | 暫存專案複本；刪除 `specs/006-reservation-reschedule/contracts/`；委派 api-plan 處理 006 的 B1～B6，委派內容與第 4 次迭代步驟 5 相同 | 無（不應提問） | (1) 合約沒有與 research §3「交易開頭呼叫此函式」相反的語句，例如「失效結果不因本次請求的錯誤回應而還原」；(2) 回報有「上游衝突」項目，若列出項目，每項都有內容、上游位置、受影響 operationId 與建議處理 Skill；(3) 合約檔已產出，過程沒有提問 |
| S2 | E2、E3、E4 | 回歸 | 暫存專案複本；刪除 `specs/005-equipment-pickup-return/contracts/`；委派 api-plan 處理 005 的 B1～B6 | 無 | `check_contracts.py` 沒有 issues；回報包含每個介面的 operation 數、「上游衝突」（內容或「無」）與「憲法遵循」 |
| S3 | E5 | 回歸 | 暫存專案複本；保留 `specs/005-equipment-pickup-return/contracts/openapi.yaml`；委派 api-plan 處理 005 的 B1～B6，委派內容不提覆寫 | 「不同意覆寫」 | 先列出既有合約檔並詢問；回覆不同意後回報沒有修改既有合約檔，檔案雜湊值不變 |
| S4 | E2（呼叫者 system-analysis） | 回歸（逐步演練） | 以修改後的 system-analysis Phase 5 步驟 3，套用 S1 的 api-plan 回報 | 無 | 演練回報內容包含 api-plan 回報的「上游衝突」原文；其他回報項目與修改前相同。system-analysis 完整執行要委派三個 Planner，副作用大，改為逐步演練 |

## 8. 驗收結果

- 施工後結構診斷：`audit_skill.py --skill api-plan --skill system-analysis`，errors 0、warnings 0。
- 同步：`./scripts/sync-skills.sh --from agents` 後 `--check` 為「兩邊一致」；`git status` 只有 `api-plan/SKILL.md`、`api-plan/rules/API合約-格式規範.md`、`system-analysis/SKILL.md` 在兩側各一份，沒有只存在於目標端、未被刪除的 Skill，`CLAUDE.md` 沒有變動。
- 驗收模型：Claude Sonnet（Agent 工具 `model: sonnet`、`effort: medium`），不帶本次分析脈絡；每個情境使用獨立的暫存專案複本（`scratchpad/accept/S1～S3`，各自 `git init` 記錄基準）。

| 情境 | 結果 | 依據 |
| ---- | ---- | ---- |
| S1 | 通過 | 合約中沒有「還原／回滾／不因」等與 research §3 相反的語句，核准 operation 寫「核准前系統先讓……變成改期已失效，再於單一資料庫交易內驗證」，與 research §2、§3 一致；回報有「上游衝突：無」；過程沒有提問或停止；`git status` 只有新增 `contracts/`；`check_contracts.py` issues 0。注意：這次子代理沒有發現 research §3 的回滾問題，所以沒有列出衝突；E1、E2 只要求「不改寫上游」與「有上游衝突項目」，不要求一定發現 |
| S2 | 通過 | `check_contracts.py` issues 0；回報包含每個介面的 operation 數、「上游衝突」1 項（research §2 與 FR-002 在 `end_time` 整點的判斷不同，合約依 spec，寫出上游位置、受影響 `registerPickup` 與建議處理 Skill `technical-research`）與「憲法遵循」 |
| S3 | 通過 | 子代理先列出既有 `openapi.yaml` 並詢問是否覆寫；收到「不同意覆寫」後依 Phase 1 步驟 11 停止，沒有寫檔；檔案 SHA-1 前後都是 `1f3ae507…6977636`，`git status` 為空 |
| S4 | 通過（逐步演練） | 以 system-analysis 修改後的 Phase 5 步驟 3 套用 S2 的 api-plan 回報：回報在「委派內容中註明的依賴缺口」之後列出 api-plan 的上游衝突 1 項原文；ui-plan、data-plan 沒有這一項，依步驟略過；`git diff` 顯示步驟 3 只在句尾新增這一段，其他回報項目不變。完整執行 system-analysis 要委派三個 Planner，副作用大，所以改為演練 |

- 個案驗收條件：無。
- 調整建議：S1 顯示「是否發現上游缺陷」仍取決於模型；這次修改只保證發現時有固定的去處與回報格式。data-plan、ui-plan 有相同的寫法，若之後出現同樣問題，可沿用本次 Rule 3 的做法。
