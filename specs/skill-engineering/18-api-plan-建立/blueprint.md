# 工程藍圖：api-plan－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/18-api-plan-建立/`
- 根因報告：無（新建模式）
- 確認紀錄：使用者於 Phase 4 回覆「確認」：接受推定的 E3、E4、E6、E7（皆為通用），確認藍圖其餘內容。前置決策：使用者於第 4 步提案回覆「都依照建議」：合約放 spec 目錄的 `contracts/`；HTTP 用 OpenAPI 3.1、WebSocket／Socket.IO 用 AsyncAPI 3.0，兩種都有時各產一份；範例改用與 1A2B 無關的電商情境；沒有對應 Planner 的端點由 `system-analysis` 跳過並回報。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 合約寫在目標 spec 目錄的 `contracts/`：以 HTTP 傳輸的負責介面寫入 `contracts/openapi.yaml`（`openapi: 3.1.0`），以 WebSocket、Socket.IO 等事件傳輸的負責介面寫入 `contracts/asyncapi.yaml`（`asyncapi: 3.0.0`）；只產出負責介面實際用到的檔案；每個檔案以 `npx --yes @redocly/cli@2 lint --extends minimal` 檢查沒有 error | 本次（提案決策 2A、3A） | 通用 |
| E2 | 每個 operation 恰好有一個 tag 標出所屬負責介面，tag 名稱為「<介面編號> <介面名稱>」且與 plan.md 盤點表一致；每個負責介面至少對應一個 operation；沒有負責介面以外的 tag。負責介面為委派指定的介面編號，未指定時為 plan.md 盤點表中端點類型為後端的介面 | 本次（課程：每個 Planner 負責一種系統介面，由 `system-analysis` 依 Wave 委派） | 通用 |
| E3 | 每個 operation 的 `description` 引用至少一個目標 spec 中存在的需求編號（US、FR、NFR、SC） | 推定：與 `system-analysis` 的需求依據一致，合約可以追溯到需求，後續拆任務與驗收才有依據 | 通用 |
| E4 | 負責介面需求依據中的 Edge Cases 與驗證規則，在 OpenAPI 以 4xx 回應、在 AsyncAPI 以錯誤訊息表達；同一份合約的錯誤回應共用一個錯誤 schema | 推定：前端與後端最常對不齊的是錯誤情況，只寫成功路徑的合約不足以實作 | 通用 |
| E5 | 只產出 API 合約：執行後目標 spec 目錄只新增或改寫 `contracts/` 下的合約檔，不修改 `spec.md`、`plan.md` 與其他 Planner 的產出；合約不含資料表設計或程式實作 | 本次（課程：每個 Planner 各自產出自己的 Artifact，不做總彙整） | 通用 |
| E6 | 目標 spec 目錄沒有 `plan.md` 時停止並告知先用 `system-analysis`；負責介面為空時停止並回報沒有後端介面；兩種情況都不建立 `contracts/` | 推定：負責介面與介面名稱都來自 plan.md 的盤點 | 通用 |
| E7 | 要寫入的合約檔已存在時，委派內容沒有說明使用者已同意覆寫，就必須先詢問；使用者同意前不覆寫 | 推定：覆寫會遺失既有合約；`system-analysis` 已取得同意時不必重問 | 通用 |

## 2. To-Be SOP

````markdown
---
name: api-plan
description: （由 W1 依 skill-form-description 撰寫）（未驗證）已有 plan.md、要為後端介面產出 API 合約時使用：依 plan.md 系統介面盤點中端點類型為後端的介面，或 system-analysis 委派的介面編號，參考 spec.md、技術研究結果與前面 Wave 的產出，把 HTTP 介面寫成 OpenAPI 3.1、WebSocket／Socket.IO 等事件介面寫成 AsyncAPI 3.0，存到 spec 目錄的 contracts/，每個 operation 標出所屬介面與需求編號。通常由 system-analysis 依 Wave 委派，也可以單獨使用。使用者提到 api-plan、API 合約、API 文件、OpenAPI、AsyncAPI、contracts 時使用。盤點介面與安排 Wave 改用 system-analysis；設計資料模型改用 data-plan；設計畫面與雛形改用 ui-plan。
---

# SOP

## Phase 1 -- 收斂規劃輸入

1. `READ` 使用者需求或委派內容，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「規劃輸入」。
2. `THINK` 決定「目標 spec」：使用者或委派內容指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `ui/`、`data/`、`contracts/` 下的既有檔案（不存在的略過），加入「規劃輸入」。
5. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行。
6. `THINK` 決定「負責介面」：委派內容指定介面編號時使用這些編號，否則使用 `plan.md`「系統介面盤點」表中端點類型為後端的所有介面；每個介面記下 plan.md 中的編號、名稱與需求依據。
7. `CHECK` 「負責介面」為空時，回報 `plan.md` 沒有後端介面、不產出合約，並停止執行。
8. `THINK` 依 `techstack.md`／`research.md` 採用的傳輸方式歸類「負責介面」：以 HTTP 傳輸的介面歸入 `contracts/openapi.yaml`，以 WebSocket、Socket.IO、SSE 或訊息佇列等事件傳輸的介面歸入 `contracts/asyncapi.yaml`，同時使用兩種傳輸的介面兩邊都歸入；傳輸方式不屬於這兩類的介面記為「無法規劃介面」；有歸入介面的檔案建立為「目標合約檔」，其餘介面建立為「可規劃介面」。
9. `WRITE` 「目標合約檔」中有已存在的檔案，且委派內容沒有說明使用者已同意覆寫時，列出這些檔案並詢問使用者是否覆寫；沒有已存在的檔案或委派內容已說明同意時，略過本步驟與下一步。
10. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時，回報沒有修改既有合約檔、沒有產出任何檔案，並停止執行。

完成條件：「目標 spec」、`plan.md` 與技術研究結果已讀取，「可規劃介面」與「目標合約檔」已決定，且沒有既有合約檔或使用者已同意覆寫；或缺少輸入、沒有後端介面、使用者不同意覆寫，已停止執行並回報。

## Phase 2 -- 設計 API 合約

1. `READ` 設計 API 合約時，讀取 `rules/API合約-格式規範.md` 的所有 Rule，建立「API 合約檢查清單」。
2. `THINK` 依「規劃輸入」與已載入的「API 合約檢查清單」，為「可規劃介面」設計 operation、request、response、錯誤回應與 schema，只設計前端或外部系統與後端之間的介面，不設計資料表或程式實作，建立「API 設計」。

完成條件：「API 設計」已涵蓋每個「可規劃介面」。

## Phase 3 -- 產出合約檔

1. `READ` 「目標合約檔」包含 `contracts/openapi.yaml` 時讀取 `templates/openapi.yaml` 與 `templates/openapi.example.yaml`，包含 `contracts/asyncapi.yaml` 時讀取 `templates/asyncapi.yaml` 與 `templates/asyncapi.example.yaml`，命名載入結果為「合約樣板組」。
2. `WRITE` 依「合約樣板組」與「API 設計」，將「目標合約檔」寫入「目標 spec」所在目錄的 `contracts/`，不建立或修改其他檔案：`info.title` 填 spec.md 的功能名稱；`summary` 與 `description` 使用繁體中文，路徑、欄位名稱、`operationId` 等識別字使用英文。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_contracts.py --spec <目標 spec 絕對路徑> --interfaces <可規劃介面編號，以逗號分隔> <目標合約檔絕對路徑…>`，取得「合約檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
4. `CHECK` 「合約檢查結果」沒有問題，逐條驗證「API 合約檢查清單」，比對合約檔與「合約樣板組」的頂層結構並確認沒有殘留的 `{{`，確認步驟 2 的填寫要求均已滿足；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 3；未通過時修正合約檔後返回步驟 3，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
5. `WRITE` 向使用者或委派方回報每個合約檔的路徑、每個「可規劃介面」的 operation 數、「無法規劃介面」，以及「未通過項」（沒有時說明全部通過）。

完成條件：「目標合約檔」已寫入 `contracts/`，合約檢查結果、「API 合約檢查清單」與樣板結構已通過或未通過的項目已記為「未通過項」，且已回報。
````

## 3. 差異表

### 刪除

無（新建模式）

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter | 新增 | `name: api-plan` 與 description（用途、觸發關鍵字、與 `system-analysis`、`data-plan`、`ui-plan` 的分流） | E1、E2、E5 |
| Phase 1 -- 收斂規劃輸入（P1-1～P1-10） | 新增 | 決定目標 spec、讀取 plan.md 與技術研究、決定負責介面與目標合約檔、缺少輸入時停止、覆寫確認 | E1、E2、E6、E7（C3–C10） |
| Phase 2 -- 設計 API 合約（P2-1～P2-2） | 新增 | 載入 API 合約規則、設計合約 | E2–E5（C11、C12、C13） |
| Phase 3 -- 產出合約檔（P3-1～P3-5） | 新增 | 載入樣板組、寫入、腳本檢查、驗證、回報 | E1–E3、E5（C1、C2、C14–C18） |
| `rules/API合約-格式規範.md` Rule 1～2 | 新增 | Rule 1：operation 歸屬負責介面並引用需求；Rule 2：錯誤情況寫成錯誤回應並共用錯誤 schema | E2–E4（C11、C12） |
| `templates/openapi.yaml`、`templates/openapi.example.yaml` | 新增 | OpenAPI 3.1 骨架與電商範例 | E1（C1） |
| `templates/asyncapi.yaml`、`templates/asyncapi.example.yaml` | 新增 | AsyncAPI 3.0 骨架與電商範例 | E1（C2） |
| `scripts/check_contracts.py` | 新增 | 以 Redocly CLI lint 合約，並機械比對 tag、負責介面涵蓋與需求編號 | E1–E3（C17） |

### 保留

無（新建模式）

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 3 | +3 |
| 步驟 | 0 | 17 | +17 |
| RuleFile | 0 | 1 | +1 |
| Rule | 0 | 2 | +2 |
| 樣板組 | 0 | 2 | +2 |
| 腳本 | 0 | 1 | +1 |

- 新建模式，所有元素都是新增。Phase 1 對應 E6、E7 的停止與確認分支，以及 E1、E2 需要先決定的負責介面與目標檔案；Phase 2 對應 E2–E5 的設計判斷；Phase 3 對應 E1–E3、E5 的產出與檢查。
- 樣板組有兩組：OpenAPI 與 AsyncAPI 是兩種產出格式，依約束分配 Rule 3「同一種產出格式只能有一組樣板」各一組，P3-1 只載入本次需要的格式。
- 腳本一支：Redocly lint 是單一命令，但 tag 是否恰好一個、負責介面是否都被涵蓋、引用的需求編號是否存在於 spec，都是輸入輸出明確、可由程式判斷的工作；紀錄 16 的驗收也顯示 Sonnet 不一定照步驟用 `grep` 查核，交給腳本較可靠。
- RuleFile 一份兩條：operation 歸屬與錯誤回應都屬於「API 合約設計」主題，在同一個步驟使用。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | `contracts/openapi.yaml` 的頂層結構：`openapi: 3.1.0`、`info`（title、version、description）、`servers`、`tags`（每個負責介面一個，附需求依據摘要）、`paths`、`components.schemas`（含共用 `Error`）與 `components.responses` | P3-2 | OpenAPI 樣板組 | 約束整份產出檔案的結構；不是可由腳本產生的內容 |
| C2 | `contracts/asyncapi.yaml` 的頂層結構：`asyncapi: 3.0.0`、`info`、`servers`、`channels`、`operations`（每個 operation 以 tag 標出介面）、`components.messages` 與 `components.schemas`（含共用錯誤訊息） | P3-2 | AsyncAPI 樣板組 | 同 C1，屬於另一種產出格式 |
| C3 | 決定目標 spec 的規則（指定優先，否則唯一一份） | P1-2 | P1-2 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C4 | 目標 spec 不存在或無法確定時停止 | P1-3 | SOP 流程 | 屬於分支與停止 |
| C5 | 沒有 plan.md 時停止並指向 `system-analysis` | P1-5 | SOP 流程 | 屬於分支與停止 |
| C6 | 負責介面的決定方式（委派指定優先，否則 plan.md 中端點類型為後端的介面） | P1-6 | P1-6 步驟內文 | 只屬於單一步驟，一句話即可表達，不需正反例 |
| C7 | 負責介面為空時停止並回報 | P1-7 | SOP 流程 | 屬於分支與停止 |
| C8 | 依技術研究採用的傳輸方式把介面歸入 OpenAPI 或 AsyncAPI，只產出有介面歸入的檔案，其他傳輸方式記為無法規劃 | P1-8 | P1-8 步驟內文 | 只屬於決定目標檔案的步驟；HTTP 與事件傳輸的分界明確，列舉即可表達，不需正反例；判斷需要讀技術研究的語意，腳本無法判斷 |
| C9 | 既有合約檔須經使用者同意才覆寫，委派內容已說明同意時免問 | P1-9、P1-10 | SOP 流程 | 屬於使用者確認閘門 |
| C10 | 不同意覆寫時回報未修改、未產出並停止 | P1-10 | SOP 流程 | 屬於分支與停止 |
| C11 | operation 歸屬與追溯：每個 operation 恰好一個 tag「<介面編號> <介面名稱>」且與 plan.md 一致；每個可規劃介面至少一個 operation；不為非負責介面設計 operation；`description` 引用目標 spec 中存在的需求編號並說明對應的需求內容 | P2-2 | `rules/API合約-格式規範.md` Rule 1 | 判斷哪些需求對應哪個 operation 需要語意，腳本只能事後檢查格式；需要「依技術層命名 tag」「description 只寫『依需求』」等反例 |
| C12 | 錯誤回應：需求依據中的 Edge Cases 與驗證規則各對應一個錯誤情況，OpenAPI 用 4xx 回應、AsyncAPI 用錯誤訊息；同一份合約共用一個錯誤 schema，錯誤碼指出錯誤情況 | P2-2 | `rules/API合約-格式規範.md` Rule 2 | 判斷哪些 Edge Case 要對應哪個狀態碼需要語意；需要「只寫 200」與「每個 operation 各自定義錯誤格式」的反例；與 C11 同屬 API 合約設計主題 |
| C13 | 只設計前端或外部系統與後端之間的介面，不設計資料表或程式實作 | P2-2 | P2-2 步驟內文 | 只屬於設計步驟，一句話即可表達 |
| C14 | 只寫入目標合約檔，不建立或修改其他檔案 | P3-2 | P3-2 步驟內文 | 只屬於寫入步驟，一句話即可表達 |
| C15 | 填值與語言：`info.title` 填功能名稱；`summary`、`description` 用繁體中文，識別字用英文 | P3-2 | P3-2 步驟內文 | 填值來源只屬於寫入步驟；樣板只固定欄位位置 |
| C16 | 驗證最多 3 輪，仍未通過記為「未通過項」 | P3-4 | SOP 流程 | 屬於執行順序與停止條件 |
| C17 | 機械檢查：Redocly CLI（`@redocly/cli@2`，`lint --extends minimal`）沒有 error；每個 operation 恰好一個 tag 且以可規劃介面編號開頭；每個可規劃介面至少一個 operation；`description` 引用的需求編號至少一個且都存在於目標 spec | P3-3 | `scripts/check_contracts.py` | 輸入（spec、介面編號、合約檔）與輸出（問題清單）明確、可重複執行，結果可由程式判斷 |
| C18 | 回報內容（合約檔路徑、各介面 operation 數、無法規劃介面、未通過項） | P3-5 | P3-5 步驟內文 | 只屬於回報步驟，一句話即可表達 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/api-plan/SKILL.md` frontmatter | 建立 `name` 與 `description` | 無（只概述用途與觸發） | 已完成 |
| 2 | W2 | `skill-form-sop` | `.agents/skills/api-plan/SKILL.md` SOP | 寫入胖 SOP | C3–C18、C1、C2、C11、C12 | 已完成 |
| 3 | W3 | `skill-derive-script` | Phase 3 -- 產出合約檔的 `CHECK` 機械檢查步驟 | 抽取 `scripts/check_contracts.py`，加入 `DELEGATE` 執行步驟、調整 `CHECK` 步驟 | C17 | 已完成 |
| 4 | W4 | `skill-derive-template` | Phase 3 -- 產出合約檔的 `WRITE` 寫入合約檔步驟 | 抽取 OpenAPI 與 AsyncAPI 兩組樣板，加入載入步驟 | C1、C2 | 已完成 |
| 5 | W5 | `skill-derive-rule` | Phase 2 -- 設計 API 合約的 `THINK` 設計步驟 | 抽取 `rules/API合約-格式規範.md`，加入載入步驟、調整 `CHECK` 步驟 | C11、C12 | 已完成 |

不需要 LICENSE：OpenAPI／AsyncAPI 合約、SOP、RuleFile 與範例都是重新撰寫，沒有衍生自 Spec-Kit 或 `clarify` 的內容。

### 工作項內容

#### W1：frontmatter

- `name: api-plan`
- `description`：已有 plan.md、要為後端介面產出 API 合約時使用；依 plan.md 系統介面盤點中端點類型為後端的介面，或 `system-analysis` 委派的介面編號，參考 spec.md、技術研究結果與前面 Wave 的產出，把 HTTP 介面寫成 OpenAPI 3.1、WebSocket／Socket.IO 等事件介面寫成 AsyncAPI 3.0，存到 spec 目錄的 `contracts/`，每個 operation 標出所屬介面與需求編號。通常由 `system-analysis` 依 Wave 委派，也可以單獨使用。觸發關鍵字：api-plan、API 合約、API 文件、OpenAPI、AsyncAPI、contracts。分流：盤點介面與安排 Wave 改用 `system-analysis`；設計資料模型改用 `data-plan`；設計畫面與雛形改用 `ui-plan`。
- 未經使用者實際驗證前，`description` 開頭加「（未驗證）」。
- 不加 `disable-model-invocation`（`system-analysis` 需要能委派）。

#### W2：胖 SOP

Phase 1 與 To-Be SOP 全文相同。Phase 2 與 Phase 3 寫成下列胖 SOP（待抽取的約束暫寫在步驟內文，沒有 RuleFile、樣板組與腳本的載入或執行步驟）：

```markdown
## Phase 2 -- 設計 API 合約

1. `THINK` 依「規劃輸入」為「可規劃介面」設計 operation、request、response、錯誤回應與 schema，只設計前端或外部系統與後端之間的介面，不設計資料表或程式實作：每個 operation 恰好有一個 tag，名稱為「<介面編號> <介面名稱>」並與 plan.md 盤點表一致；每個可規劃介面至少有一個 operation，不為其他介面設計 operation；`description` 引用目標 spec 中存在的需求編號（US、FR、NFR、SC）並說明 operation 對應的需求內容。需求依據中的 Edge Cases 與驗證規則各對應一個錯誤情況，OpenAPI 以 4xx 回應表達、AsyncAPI 以錯誤訊息表達；同一份合約的錯誤回應共用一個錯誤 schema，以錯誤碼指出錯誤情況，建立「API 設計」。

完成條件：「API 設計」已涵蓋每個「可規劃介面」。

## Phase 3 -- 產出合約檔

1. `WRITE` 依「API 設計」，將「目標合約檔」寫入「目標 spec」所在目錄的 `contracts/`，不建立或修改其他檔案：`contracts/openapi.yaml` 依序包含 `openapi: 3.1.0`、`info`（title、version、description）、`servers`、`tags`（每個可規劃介面一個，description 摘要需求依據）、`paths`、`components`（`schemas` 含共用的 `Error`，`responses` 放共用錯誤回應）；`contracts/asyncapi.yaml` 依序包含 `asyncapi: 3.0.0`、`info`、`servers`、`channels`、`operations`（每個 operation 以 tag 標出介面）、`components`（`messages` 與 `schemas`，含共用錯誤訊息）。`info.title` 填 spec.md 的功能名稱；`summary` 與 `description` 使用繁體中文，路徑、欄位名稱、`operationId` 等識別字使用英文。
2. `CHECK` 以 `npx --yes @redocly/cli@2 lint --extends minimal <目標合約檔…>` 檢查沒有 error；逐一確認每個 operation 恰好有一個 tag 且以可規劃介面編號開頭、每個可規劃介面至少有一個 operation、`description` 引用的需求編號至少一個且都能在「目標 spec」中以 `grep` 找到；驗證 Phase 2 步驟 1 的設計要求與步驟 1 的填寫要求均已滿足；未通過時修正合約檔後重新驗證，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
3. `WRITE` 向使用者或委派方回報每個合約檔的路徑、每個「可規劃介面」的 operation 數、「無法規劃介面」，以及「未通過項」（沒有時說明全部通過）。

完成條件：「目標合約檔」已寫入 `contracts/`，步驟 2 的檢查已通過或未通過的項目已記為「未通過項」，且已回報。
```

#### W3：抽取 `scripts/check_contracts.py`

- 目標步驟：Phase 3 -- 產出合約檔的 `CHECK` 步驟（「以 `npx --yes @redocly/cli@2 lint` 檢查」）。
- 介面：`uv run --script scripts/check_contracts.py --spec <spec.md> --interfaces <編號,編號> <合約檔…>`；PEP 723 依賴 `pyyaml`。
- 行為：
  1. 執行 `npx --yes @redocly/cli@2 lint --extends minimal --format stylish <合約檔…>`；退出狀態非零時，把 Redocly 的 error 摘要列為問題（warning 不列）。找不到 `npx` 時以退出碼 2 回報環境錯誤。
  2. 解析每個合約檔：`openapi` 開頭的檔案逐一走訪 `paths` 下的 HTTP 方法；`asyncapi` 開頭的檔案逐一走訪 `operations`（tag 為 `{name: ...}` 物件）。
  3. 每個 operation：tag 數量必須恰好一個，且 tag 名稱以 `--interfaces` 中的某個編號加一個空白開頭；`description` 以 `\b(?:US\d+|(?:FR|NFR|SC)-\d+)\b` 找出的需求編號至少一個，且每個都出現在 spec 文字中。
  4. `--interfaces` 中每個編號至少被一個 operation 的 tag 涵蓋。
  5. 標準輸出 JSON：`{"files": [...], "operations": [{"file", "id", "tag", "requirements"}], "coverage": {"<編號>": <operation 數>}, "issues": [...]}`；`issues` 為空時退出碼 0，有問題時 1，參數或環境錯誤時 2。
- 施工註記：Redocly 改用 `--format json`，從 `problems` 只取 `severity: error`，比解析 stylish 文字可靠；需求編號的邊界改用 ASCII 前後文判斷（`(?<![A-Za-z0-9-])…(?![A-Za-z0-9])`），因為 Python 的 `\b` 把中文字視為字元，「依FR-001」會比對不到；spec 以「User Story N」書寫時，`USN` 也視為存在。職責與介面不變。
- After：Phase 3 的 `CHECK` 拆成 `DELEGATE` 執行腳本（To-Be P3-3）與 `CHECK` 判讀「合約檢查結果」並驗證其餘要求（To-Be P3-4）；`CHECK` 內文中屬於 C17 的檢查描述刪除。完成條件改為「合約檢查結果……已通過」。

#### W4：抽取兩組合約樣板

- 目標步驟：Phase 3 -- 產出合約檔的 `WRITE` 步驟（「將『目標合約檔』寫入……`contracts/`」）。
- 樣板組：
  - `templates/openapi.yaml` 與 `templates/openapi.example.yaml`（C1）。
  - `templates/asyncapi.yaml` 與 `templates/asyncapi.example.yaml`（C2）。
- 範例使用下方「共用電商情境」，不得使用 1A2B、照片相簿、健身房預約或線上課程訂閱情境：
  - OpenAPI 範例涵蓋 B1–B3：B1 購物車 API（加入商品、查詢購物車、調整數量、移除商品）、B2 結帳下單 API（建立訂單並取得綠界付款導向資訊）、B3 綠界付款結果通知接收 API（綠界 → 後端的 Webhook，回應 `1|OK`）。
  - AsyncAPI 範例涵蓋 B4：訂單付款狀態推播（後端 → 前端，Socket.IO 事件 `order:payment-updated`，以及付款失敗的錯誤訊息）。
  - 兩份範例都必須通過 `scripts/check_contracts.py`（以範例 spec 的需求編號為準，W4 施工時在暫存目錄放一份只含編號的 spec 片段做檢查，不放進 Skill）。
- After：To-Be P3-1 插入載入步驟（依「目標合約檔」決定載入哪一組）；P3-2 改為依「合約樣板組」寫入，刪除內文中屬於 C1、C2 的結構描述，保留 C14、C15；P3-4 加入「比對合約檔與『合約樣板組』的頂層結構並確認沒有殘留的 `{{`」。

#### W5：抽取 `rules/API合約-格式規範.md`

- 目標步驟：Phase 2 -- 設計 API 合約的 `THINK` 步驟（「為『可規劃介面』設計 operation」）。
- Rule 1 - operation 必須歸屬負責介面並引用需求（C11）：反例為 tag 依技術層命名（例如 `cart`、`order`）、一個 operation 掛兩個介面 tag、`description` 只寫「依需求」。
- Rule 2 - 錯誤情況必須寫成錯誤回應並共用錯誤 schema（C12）：反例為只寫 `200`，或每個 operation 各自定義不同的錯誤格式。
- 正反例使用與樣板範例不同的情境（例如圖書館借閱或餐廳訂位），不得使用 1A2B。
- After：To-Be P2-1 插入載入步驟；P2-2 改為依已載入的「API 合約檢查清單」設計，刪除內文中屬於 C11、C12 的約束，保留 C13；P3-4 加入「逐條驗證『API 合約檢查清單』」。施工後 SOP 必須與第 2 節 To-Be SOP 一致。

#### 共用電商情境（W4 範例；`data-plan`、`ui-plan` 與 `system-analysis` 的範例共用）

功能「購物車與結帳」（`specs/004-shopping-cart-checkout/`）。技術研究採用 Vue 3＋Vite、Node.js＋Express（REST）、Socket.IO、PostgreSQL、綠界 ECPay 全方位金流。需求編號：

- US1 加入購物車並調整（FR-001 加入商品並選擇規格、FR-002 調整數量與移除、FR-003 庫存不足時拒絕並提示）
- US2 結帳付款（FR-004 填寫收件資料並建立訂單、FR-005 導向綠界付款、FR-006 接收綠界付款結果並更新訂單、FR-007 付款完成後結帳頁即時顯示結果）
- US3 查看訂單（FR-008 查看訂單明細與付款狀態）
- NFR-001 付款通知須驗證 CheckMacValue；SC-001 加入購物車 1 秒內完成
- Edge Cases：商品已下架、數量超過庫存、重複的付款通知、付款逾時
- Key Entities：商品、商品規格、購物車、購物車項目、訂單、訂單項目、付款紀錄

介面：前端 F1 商品加入購物車介面、F2 購物車檢視與數量調整介面、F3 結帳與付款結果介面、F4 訂單查詢介面；後端 B1–B4（如上）、B5 訂單查詢 API；資料庫 D1 購物車資料存取、D2 訂單與付款紀錄持久化；金流 P1 綠界付款。

## 7. 驗收情境

所有情境的暫存專案只放 `.claude/skills/api-plan/` 與情境所需的 spec 檔，`git init` 後提交初始狀態；`plan.md`、`techstack.md`、`research.md` 由執行者準備。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1–E5 | 本次 | `specs/001-online-pvp-1a2b/` 含 spec.md，以及 techstack.md（React＋Vite、Express REST 處理建房與查詢、Socket.IO 處理對戰事件、PostgreSQL 存對戰紀錄）、research.md、plan.md（含前端、後端、資料庫介面，後端同時有 REST 與 Socket.IO 介面）。輸入：「/api-plan specs/001-online-pvp-1a2b」 | 無 | `contracts/openapi.yaml` 與 `contracts/asyncapi.yaml` 都存在；執行者另跑 `check_contracts.py`（以 plan.md 的全部後端介面為 `--interfaces`）退出碼 0；沒有 F、D 開頭的 tag；spec 的 Edge Cases（例如房間已滿、猜測格式錯誤）在合約中有對應的 4xx 或錯誤訊息，且錯誤共用一個 schema；`git status` 只顯示 `contracts/` 新增；合約沒有資料表定義 |
| S2 | E1、E2、E5 | 本次 | `specs/002-gym-class-booking/` 含 spec.md（社區健身房課程預約，沿用紀錄 16 S2 的情境）、techstack.md（Express REST，沒有事件傳輸）、plan.md（後端 B1–B5）。輸入：「system-analysis 委派：目標 spec 為 specs/002-gym-class-booking，負責介面 B1、B2、B3（Wave 2）。使用者已同意覆寫既有產出。」 | 無 | 只產出 `contracts/openapi.yaml`，沒有 `asyncapi.yaml`；tag 只有 B1、B2、B3 三個，B4、B5 沒有出現；`check_contracts.py --interfaces B1,B2,B3` 退出碼 0；`git status` 只顯示 `contracts/` 新增 |
| S3 | E6 | 本次 | 同 S1，但沒有 plan.md。輸入同 S1 | 無 | 回覆要求先做系統分析（提到 `system-analysis`）；沒有 `contracts/` |
| S4 | E6 | 本次 | 同 S1，但 plan.md 只有前端介面（沒有後端）。輸入同 S1 | 無 | 回報沒有後端介面；沒有 `contracts/` |
| S5 | E7 | 本次 | 同 S1，另有既有 `contracts/openapi.yaml`（記錄雜湊）。輸入同 S1 | 無（遇到確認閘門時回報並結束） | 回報中有詢問是否覆寫並列出 `contracts/openapi.yaml`；該檔雜湊與執行前相同；沒有 `contracts/asyncapi.yaml` |

## 8. 驗收結果

- 施工：W1–W5 已完成；施工後 `SKILL.md` 的 `# SOP` 與第 2 節 To-Be SOP 逐字相同。施工中刪除兩條 RuleFile 中超出 C11、C12 的條列，以及一句重述樣板 `enum` 結構的說明；腳本的兩處實作差異見 W3 施工註記。
- 施工後結構診斷：`audit_skill.py` 對 `api-plan`、`data-plan` 均為 0 error、0 warning。
- 同步：`./scripts/sync-skills.sh --from agents` 成功，`--check` 為「兩邊一致」；同步輸出沒有只存在於目標端、未被刪除的 Skill。
- 驗收方式：每個情境各在 scratchpad 的獨立暫存專案中執行（只放 `.claude/skills/api-plan/` 與情境所需的 spec 檔，`git init` 後提交初始狀態），由不帶本次分析脈絡的子代理直接讀 `SKILL.md` 逐步執行。驗收模型：**Sonnet**（Claude Code Agent 工具 `model: sonnet`、`effort: medium`；主模型為 Opus 5.5），10 個情境（兩個 Skill 各 5 個）平行執行。子代理只取得 Skill 路徑、專案根目錄、日期、情境輸入與「無預先回覆，遇確認閘門就回報結束」的指示。主代理另以 `git status`、雜湊與兩支檢查腳本複查產出，不只採信子代理自述。
- 素材：1A2B 的 techstack／research 改為 Express REST（配對、查詢）＋Socket.IO（房內事件）＋PostgreSQL。因 spec FR-001 規定不保存跨連線戰績，research §4 寫成「保存進行中的房間與對局狀態，讓多實例共享、以交易處理同時配對，對局結束後刪除」。健身房預約 spec 由執行者重寫（紀錄 16 的暫存檔已清除），techstack 只用 REST 與 MySQL。
- S1 通過：產出 `contracts/openapi.yaml`（B1、B2 各 1 個 operation）與 `contracts/asyncapi.yaml`（B3、B4 各 6 個 operation）；主代理重跑 `check_contracts.py --interfaces B1,B2,B3,B4` 退出碼 0、`issues` 為空，tag 只有 B1–B4；OpenAPI 以 400／403／404 表達暱稱必填、配對碼格式（FR-001、FR-005）等錯誤，AsyncAPI 以 `game:error` 傳送 `SECRET_INVALID`、`GUESS_INVALID`、`NOT_YOUR_TURN` 等錯誤，兩份合約各自共用一個 `Error` schema；`git status` 只有 `contracts/`；合約沒有資料表定義。
- S2 通過：只產出 `contracts/openapi.yaml`，沒有 asyncapi.yaml；tag 只有 B1、B2、B3（plan.md 的 B4、B5 沒有出現）；`check_contracts.py --interfaces B1,B2,B3` 退出碼 0；委派內容已說明同意覆寫，未出現確認閘門；`git status` 只有 `contracts/`。
- S3 通過：停在 Phase 1 步驟 5，回報需先做系統分析並提到 `system-analysis`；`git status` 乾淨。
- S4 通過：停在 Phase 1 步驟 7，回報 plan.md 沒有後端介面；`git status` 乾淨。
- S5 通過：停在覆寫確認閘門，列出 `contracts/openapi.yaml` 並詢問是否覆寫；該檔雜湊執行前後皆為 `7e2eedd627e4a646…`；沒有 asyncapi.yaml；`git status` 乾淨。
- 觀察：子代理的回報文字多為自行整理，不是逐字依 P3-5 列項；所需項目（路徑、各介面 operation 數、無法規劃介面、未通過項）都有出現，不影響判定。
