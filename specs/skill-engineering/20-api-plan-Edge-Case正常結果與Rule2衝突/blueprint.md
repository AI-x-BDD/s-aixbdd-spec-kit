# 工程藍圖：api-plan－Edge Case 正常結果與 Rule 2 衝突

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/20-api-plan-Edge-Case正常結果與Rule2衝突/`
- 根因報告：`specs/skill-engineering/20-api-plan-Edge-Case正常結果與Rule2衝突/rca-report.md`（R1，使用者已確認）
- 確認紀錄：使用者於 Phase 4 回覆「確認」（2026-10-26）：確認驗收條件（E4 依根因報告確認紀錄改寫，其餘沿用紀錄 18）與藍圖其餘內容；本次沒有推定的驗收條件。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 合約寫在目標 spec 目錄的 `contracts/`：HTTP 介面寫入 `openapi.yaml`（`openapi: 3.1.0`），WebSocket、Socket.IO 等事件介面寫入 `asyncapi.yaml`（`asyncapi: 3.0.0`）；只產出用到的檔案；Redocly lint 沒有 error | 既有（紀錄 18 E1） | 通用 |
| E2 | 每個 operation 恰好一個 tag「<介面編號> <介面名稱>」且與 plan.md 一致；每個負責介面至少一個 operation；沒有負責介面以外的 tag | 既有（紀錄 18 E2） | 通用 |
| E3 | 每個 operation 的 `description` 引用至少一個目標 spec 中存在的需求編號 | 既有（紀錄 18 E3） | 通用 |
| E4 | 負責介面需求依據中的 Edge Cases 與驗證規則都在合約中有對應：spec 定義為拒絕或失敗的，在 OpenAPI 以 4xx 回應、在 AsyncAPI 以錯誤訊息表達，同一份合約共用一個錯誤 schema；spec 定義為正常結果的，在 OpenAPI 以成功回應、在 AsyncAPI 以一般事件訊息表達，並在該 operation 的 `description` 寫出這個 Edge Case 與對應結果，不得寫成錯誤回應或錯誤訊息 | 本次（根因報告 R1，使用者確認；取代紀錄 18 E4） | 通用 |
| E5 | 只產出 API 合約：目標 spec 目錄只新增或改寫 `contracts/` 下的合約檔；合約不含資料表設計或程式實作 | 既有（紀錄 18 E5） | 通用 |
| E6 | 沒有 `plan.md`，或負責介面為空時停止並回報，不建立 `contracts/` | 既有（紀錄 18 E6） | 通用 |
| E7 | 要寫入的合約檔已存在且委派內容沒有說明使用者已同意時，先詢問；同意前不覆寫 | 既有（紀錄 18 E7） | 通用 |

## 2. To-Be SOP

SOP 與 frontmatter 不變，To-Be 即目前的 `SKILL.md`：

````markdown
---
name: api-plan
description: （未驗證）已有 plan.md、要為後端介面產出 API 合約時使用：依 plan.md 系統介面盤點中端點類型為後端的介面，或 system-analysis 委派的介面編號，參考 spec.md、技術研究結果與前面 Wave 的產出，把 HTTP 介面寫成 OpenAPI 3.1、WebSocket／Socket.IO 等事件介面寫成 AsyncAPI 3.0，存到 spec 目錄的 contracts/，每個 operation 標出所屬介面與需求編號。通常由 system-analysis 依 Wave 委派，也可以單獨使用。使用者提到 api-plan、API 合約、API 文件、OpenAPI、AsyncAPI、contracts 時使用。盤點介面與安排 Wave 改用 system-analysis；設計資料模型改用 data-plan；設計畫面與雛形改用 ui-plan。
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

無：Rule 2 第一條的原文（「每個 Edge Case 與驗證規則，必須對應到至少一個 operation 的錯誤情況」）以修改處理，不整條刪除；其要求「每個 Edge Case 與驗證規則都要有對應」仍追溯到 E4。

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `rules/API合約-格式規範.md` Rule 2 | 修改 | 標題改為「Edge Case 與驗證規則必須依 spec 的定義寫成錯誤或正常結果」；第一條改為「每個 Edge Case 與驗證規則必須在至少一個 operation 中有對應」；新增「spec 定義為正常結果的，以成功回應或一般事件訊息表達並寫入 `description`，不得寫成錯誤」一條；「拒絕或失敗→4xx／錯誤訊息」與「共用錯誤 schema」兩條保留文意；Good／Bad Example 補上正常結果的情境 | E4；R1（衝突）；C12 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter | E1、E2、E5（觸發與分流） | 無（只概述用途與觸發） |
| Phase 1 -- 收斂規劃輸入（P1-1～P1-10）與完成條件 | E1、E2、E6、E7 | C3–C10 |
| Phase 2 -- 設計 API 合約（P2-1～P2-2）與完成條件 | E2–E5 | C11、C12（載入）、C13 |
| Phase 3 -- 產出合約檔（P3-1～P3-5）與完成條件 | E1–E3、E5 | C1、C2、C14–C18 |
| `rules/API合約-格式規範.md` Rule 1 | E2、E3 | C11 |
| OpenAPI 樣板組（`templates/openapi.yaml`、`templates/openapi.example.yaml`） | E1；範例第 133 行「重複的付款通知仍回應 `1\|OK`」已符合修改後的 C12 | C1 |
| AsyncAPI 樣板組（`templates/asyncapi.yaml`、`templates/asyncapi.example.yaml`） | E1；範例的付款逾時以 `expired` 狀態事件推播，已符合修改後的 C12 | C2 |
| `scripts/check_contracts.py` | E1–E3 | C17 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 17 | 17 | 0 |
| RuleFile | 1 | 1 | 0 |
| Rule | 2 | 2 | 0 |
| 樣板組 | 2 | 2 | 0 |
| 腳本 | 1 | 1 | 0 |

- 內容增減：Rule 2 改寫第一條、新增一條「正常結果」的條列，正反例各補一段；沒有其他增減。
- 依重新設計 Rule 4 的順序：刪除不適用（Rule 2 的「每個 Edge Case 都要有對應」仍需要）；改寫可處理大部分，但「正常結果要寫進 `description`」在 Rule 2 中沒有可改寫的既有描述，因此新增一條；改換存放位置不適用（判斷 Edge Case 屬於拒絕或正常需要語意，仍屬 RuleFile）。

## 5. 約束分配表

沿用紀錄 18 第 5 節的 C1–C18，只有 C12 改寫：

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C12 | 可規劃介面需求依據中的每個 Edge Case 與驗證規則都在至少一個 operation 中有對應：spec 定義為拒絕或失敗的，OpenAPI 用 4xx 回應、AsyncAPI 用錯誤訊息；spec 定義為正常結果的，OpenAPI 用成功回應、AsyncAPI 用一般事件訊息，並在 `description` 寫出該 Edge Case 與結果，不得寫成錯誤；同一份合約共用一個錯誤 schema，錯誤碼指出錯誤情況 | P2-2 | `rules/API合約-格式規範.md` Rule 2 | 判斷 Edge Case 屬於拒絕還是正常結果需要讀 spec 的語意，腳本無法判斷；樣板無法逐一保證；需要「正常結果被寫成 409」的反例；與 C11 同屬 API 合約設計主題 |

其餘 C1–C11、C13–C18 的內容、所屬步驟與存放位置不變，見 `specs/skill-engineering/18-api-plan-建立/blueprint.md` 第 5 節。

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-rule` | `.agents/skills/api-plan/rules/API合約-格式規範.md` Rule 2 | 修改既有 Rule 2 的內容，不改變載入步驟 | C12 | 已完成 |

### 工作項內容

#### W1：修改 Rule 2

- 標題：`# Rule 2 - Edge Case 與驗證規則必須依 spec 的定義寫成錯誤或正常結果`
- 規則說明：
  - 可規劃介面需求依據中的每個 Edge Case 與驗證規則，必須在至少一個 operation 中有對應。
  - spec 定義為拒絕或失敗的 Edge Case 與驗證規則，OpenAPI 必須以 4xx 回應表達；AsyncAPI 必須以錯誤訊息表達。
  - spec 定義為正常結果的 Edge Case（例如照常處理、改走另一個正常流程），OpenAPI 必須以成功回應表達、AsyncAPI 必須以一般事件訊息表達，並在該 operation 的 `description` 寫出這個 Edge Case 與對應結果；不得寫成錯誤回應或錯誤訊息。
  - 同一份合約的所有錯誤回應或錯誤訊息必須共用同一個錯誤 schema，以錯誤碼欄位指出錯誤情況。
- Good Example：沿用圖書館借閱情境。Edge Cases 為「借書證已停權時拒絕借閱」（拒絕→403）與「館藏已全部借出時改為登記預約」（正常結果→201，回應狀態為 `RESERVED`，`description` 寫出這個 Edge Case）；FR-005「同時借閱 5 本為上限」為驗證規則（拒絕→409）。錯誤共用 `Error` schema。
- Bad Example：同一份需求中，「館藏已全部借出時改為登記預約」被寫成 409 `NO_COPY_AVAILABLE`；另一個歸還 operation 自行定義與其他回應不同的錯誤格式。
- 不得使用 1A2B、健身房預約或電商情境。

## 7. 驗收情境

暫存專案只放 `.claude/skills/api-plan/`（含本次修改）與情境所需的 spec 檔，`git init` 後提交初始狀態；素材由執行者準備（S1 同使用者實際驗證的健身房預約素材，S2 同紀錄 18 S1 的 1A2B PostgreSQL 版素材）。直接呼叫者：無（`audit_skill.py --graph` 的 `callers.api-plan` 為空），不需要呼叫者回歸情境。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1–E5 | 本次 | `specs/002-gym-class-booking/` 含 spec.md、techstack.md（Express REST、MySQL）、plan.md（後端 B1–B5，B5 為 node-cron 排程）。輸入（本次問題的原始輸入）：「specs/002-gym-class-booking 的系統分析已經做完了，幫我把後端的 API 合約寫出來。」 | 無 | 只產出 `contracts/openapi.yaml`；`check_contracts.py --interfaces B1,B2,B3,B4` 退出碼 0；「兩位會員同時預約最後一個名額」與「綠界重複送出付款通知」以成功回應表達，且對應 operation 的 `description` 寫出該 Edge Case 與結果；「距開課不足 2 小時取消」「重複預約同一時段」等拒絕情況為 4xx；錯誤共用一個 schema；`git status` 只有 `contracts/` |
| S2 | E1–E5 | 回歸 | `specs/001-online-pvp-1a2b/` 含 spec.md、techstack.md（Express REST 處理配對與查詢、Socket.IO 處理房內事件、PostgreSQL 保存進行中對局）、research.md、plan.md（後端 B1、B2 為 REST，B3、B4 為 Socket.IO）。輸入：「/api-plan specs/001-online-pvp-1a2b」 | 無 | 產出 `openapi.yaml` 與 `asyncapi.yaml`；`check_contracts.py --interfaces B1,B2,B3,B4` 退出碼 0；配對碼格式（FR-005）、秘密答案與猜測格式（FR-017）、非輪到的玩家出手（FR-012）為 4xx 或錯誤訊息；AsyncAPI 合約中，配對碼被占用時開新房、重複猜同一組數字、設定答案階段有人離開等 spec 定義的正常結果，不出現在錯誤 schema 的錯誤碼中；`git status` 只有 `contracts/` |
| S3 | E6 | 回歸 | 同紀錄 18 S3、S4 | 無 | 逐步演練：P1-5、P1-7 的停止分支未受本次修改影響（只改 Rule 2），沿用紀錄 18 的驗收結果，不實際重跑 |
| S4 | E7 | 回歸 | 同紀錄 18 S5 | 無 | 逐步演練：P1-9、P1-10 的覆寫確認未受本次修改影響，沿用紀錄 18 的驗收結果，不實際重跑 |

## 8. 驗收結果

- 施工：W1 已完成；Rule 2 的 4 段 YAML 範例皆可解析；`SKILL.md` 與第 2 節 To-Be 逐字相同。
- 施工後結構診斷：`audit_skill.py` 對 `api-plan` 為 0 error、0 warning。
- 同步：`./scripts/sync-skills.sh --from agents` 成功，`--check` 為「兩邊一致」；同步輸出沒有只存在於目標端、未被刪除的 Skill。
- 驗收方式：S1、S2 各在 scratchpad 的獨立暫存專案執行（只放含本次修改的 `.claude/skills/api-plan/` 與素材，`git init` 後提交初始狀態），由不帶本次分析脈絡的子代理直接讀 `SKILL.md` 逐步執行。驗收模型：**Sonnet**（Claude Code Agent 工具 `model: sonnet`、`effort: medium`；主模型為 Opus 5.5），兩個情境平行執行。主代理另以 `git status`、`check_contracts.py` 與解析合約內容複查。scratchpad 先前被清空，1A2B PostgreSQL 版素材依紀錄 18 的內容重建。
- S1 通過：只產出 `contracts/openapi.yaml`（B1 1、B2 1、B3 2、B4 1 個 operation，B5 列為無法規劃介面）；主代理重跑 `check_contracts.py --interfaces B1,B2,B3,B4` 的 `issues` 為空；「兩位會員同時預約最後一個名額」以 `POST /bookings` 的 201 表達，`description` 寫明一位 `CONFIRMED`、另一位 `WAITLISTED`；「綠界重複送出付款通知」以 `POST /payments/ecpay/notify` 的 200 `1|OK` 表達，`description` 寫明不重複確認；重複預約 409 `ALREADY_BOOKED`、開課前不足 2 小時取消 422 `CANCEL_WINDOW_CLOSED`，錯誤共用一個 `Error` schema；`git status` 只有 `contracts/`。
- S2 通過（回歸）：產出 `openapi.yaml`（B1、B2 各 1）與 `asyncapi.yaml`（B3、B4 各 7）；`check_contracts.py` 的 `issues` 為空；配對碼格式 400 `MATCH_CODE_INVALID`、答案與猜測格式 `NUMBER_INVALID`、未輪到 `NOT_YOUR_TURN`；AsyncAPI 錯誤碼（8 個）沒有配對碼被占用、重複猜同一組數字、設定答案階段離開等正常結果，三者分別以 `room:closed`、`guess:result`、`room:aborted` 一般事件表達，`description` 註明「Edge Cases……屬正常結果」；同時輸入同一配對碼與配對碼被占用以 OpenAPI 200 的 `CREATED`／`JOINED` 表達；`git status` 只有 `contracts/`。
- S3、S4（回歸）：逐步演練。本次只修改 Rule 2，Phase 1 的停止分支（P1-5、P1-7）與覆寫確認（P1-9、P1-10）沒有任何文字變動，沿用紀錄 18 S3–S5 的通過結果，未實際重跑。

### 使用者實際驗證（2026-10-26）

- 方式：使用者觸發 `/user-verify-skill`，並要求與 `data-plan` 同時驗證；以 Herdr 在同一個 tab 開 pane，在 scratchpad 的暫存專案 `uv-api-plan`（`.claude/skills/` 只放 `api-plan`，素材為健身房課程預約的 spec.md、techstack.md、plan.md；`.claude/` 加入 `.git/info/exclude`）啟動全新的 Claude Code。實跑需求以自然語言送出、不指名 Skill：「specs/002-gym-class-booking 的系統分析已經做完了，幫我把後端的 API 合約寫出來。」
- 權限處理：使用者事先授權在暫存專案內執行 `uv run --script …check_*.py` 及其呼叫的 `npx` 時可單次放行；兩輪都沒有出現權限確認（測試 session 為 auto mode），實際沒有使用授權。開場的信任資料夾由使用者回答「Yes, I trust this folder」，第 2 輪沿用同一路徑的信任設定。
- 結果（第 1 輪，紀錄 18 版本，Opus 5.5 high effort，`claude` 預設模型）：自動觸發成功，約 3 分 14 秒完成；B1–B4 共 8 個 operation，B5 列為無法規劃介面，檢查腳本 `issues` 為空。測試 session 把 spec 定義為正常結果的兩個 Edge Case 寫成成功回應，理由是「和樣板範例的做法一致」，與 Rule 2「每個 Edge Case 都要對應錯誤情況」的字面矛盾。使用者參考 wsa-course 的提案後判定不通過，交由 `skill-engineering` 優化（本紀錄 20：R1 衝突，改寫 Rule 2）。第 1 輪產出另存為 scratchpad 的 `round1-opus-openapi.yaml`。
- 結果（第 2 輪，本紀錄 20 版本，Sonnet 5.5 medium effort，`claude --model sonnet`）：依課程「要測試的話用笨一點的模型」改用 Sonnet；暫存專案刪除後以相同素材重建，送出相同需求。自動觸發成功，約 1 分 10 秒完成；只產出 `contracts/openapi.yaml`（B1 1、B2 1、B3 2、B4 1 個 operation，B5 列為無法規劃介面）；主代理重跑 `check_contracts.py --interfaces B1,B2,B3,B4` 的 `issues` 為空；「同時搶最後名額」以 `POST /bookings` 的 201 `WAITLISTED` 表達、「綠界重複通知」以 200 `1|OK` 表達，兩者的 `description` 都寫明是正常結果；重複預約 409、開課前不足 2 小時取消 422、CheckMacValue 失敗 400，共用一個 `Error` schema；`git status` 只有 `contracts/openapi.yaml`。E1–E5 符合，E6、E7 本輪未觸及（已由紀錄 18 S3–S5 驗證）。
- 觀察：
  - 付費課程額滿時 `POST /bookings/paid` 回 409 `CLASS_FULL`，而 `POST /bookings` 只接受免費課程，付費課程因此無法排候補，與 FR-003 及「另一位排入候補」的 Edge Case 對不上。素材 spec 沒有定義付費課程能否候補、遞補後是否需付款（第 1 輪 Opus 也列為待補），使用者同意視為 spec 缺口、留待之後的 `clarify-over-specs` 處理；但 Sonnet 沒有把這項假設列入「請確認」的清單。
  - 素材 spec 的 US2「付款成功才保留名額」與 FR-006「逾時釋出名額」互相矛盾（第 1 輪 Opus 指出），屬測試素材問題，不影響判定。
  - `user-verify-skill` 沒有規定測試 session 的模型，第 1 輪因此用了 Opus；已記入 `docs/待確認.md` 第 7 項。
- 結論：使用者判定通過。`description` 已移除「（未驗證）」前綴，並以 `./scripts/sync-skills.sh --from agents` 同步，`--check` 為兩邊一致。
