# 工程藍圖：api-plan、system-analysis（含 implement C26）－共用欄位與合約語意及 Wave 順序

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/60-api-plan-共用欄位與合約語意及Wave順序/`
- 根因報告：同一紀錄目錄的 `rca-report.md`。使用者 2026-11-20 回覆「都照建議」：確認 R1～R3、驗收條件 E1～E10（刪除原 E9 版本號、原 E10 縮小為 E9），以及 C26 的做法（見根因報告第 9 節）。
- 確認紀錄：使用者 2026-11-20 回覆「確認藍圖」。推定驗收條件 E8、E9 已在根因報告確認時同意（回覆「都照建議」）。
- C26 說明：`implement` 專案衛生規則只改一條 Rule，依計畫用 `skill-form-rule`，不做根因分析與 To-Be 推導；放在本藍圖只為一次確認、一起驗收（W5、W7、S5、E11）。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | `plan.md` 同時有資料庫介面與後端介面，且後端傳遞資料庫保存的資料時，資料庫所在的 Wave 排在後端所在的 Wave 之前；後端 Wave 的「依賴」寫出它依賴資料庫 Wave 的資料模型 | 本次 | 通用 |
| E2 | 沒有共用欄位依賴的端點類型仍放在同一個 Wave 平行分析；`plan.md` 沒有資料庫介面時，Wave 數不因本次修改增加 | 既有 | 通用 |
| E3 | `contracts/` 中對應資料模型欄位的 schema 欄位，與 `data/data-model.dbml` 的同一欄位一致：同一個字詞、同一種型別、同一組 Enum 值 | 本次 | 通用 |
| E4 | 合約需要資料模型沒有的保存欄位，或資料模型和 spec／research 衝突時，不修改 `data-model.dbml`，在「上游衝突」寫出衝突內容、`data-model.dbml` 的資料表與欄位、受影響的 `operationId`，建議處理 Skill 為 `data-plan` | 本次 | 通用 |
| E5 | spec 對某個 operation 要求副作用、冪等、事件順序、重試、逾時或版本相容時，該 operation 的 `description`（或 `info.description`）寫出這項語意，並引用要求它的需求編號 | 本次 | 通用 |
| E6 | spec 沒有要求上述語意時，合約不自行加入，例如不自行加 `Idempotency-Key` header、重試次數或逾時秒數 | 本次 | 通用 |
| E7 | 重跑 `analyze` 後，`analysis.md` 沒有「`contracts/` 與 `data/` 欄位命名不一致」的發現 | 本次 | 通用 |
| E8 | 名稱允許依各產出的命名風格轉換：snake_case ↔ camelCase 算一致；字詞、型別、值不同算不一致 | 推定（使用者 2026-11-20 同意） | 通用 |
| E9 | 延續既有功能的迭代（spec 要求向下相容前一版合約）中，前一版合約已有、和資料模型不一致的欄位維持原名，在「上游衝突」列一次並指名 `data-plan`；本次新增的共用欄位依 E3 和資料模型一致 | 推定（使用者 2026-11-20 同意） | 通用 |
| E10 | 既有核心預期不變：`system-analysis` 的 `plan.md` 結構、Wave 區塊格式、依 Wave 委派與回報；`api-plan` 的 tag 歸屬、需求引用、Edge Case 寫法、`check_contracts.py` 通過、覆寫前詢問 | 既有 | 通用 |
| E11 | `implement` 只在條件成立時建立或補齊 `.dockerignore`、`.npmignore`、`.terraformignore`、`.helmignore`；專案有 Kubernetes manifest 或 Terraform 時，`.gitignore` 涵蓋 kubeconfig、Secret manifest、私鑰、憑證與 Terraform state | 本次（C26，使用者 2026-11-20 同意做法） | 通用 |

## 2. To-Be SOP

三個 Skill 的 `SKILL.md`（frontmatter 與 SOP）都不變，全文同 HEAD `18f85d9` 的檔案，不在此重抄。

| Skill | To-Be 步驟的目的與追溯 | 對照 As-Is |
| ----- | ---------------------- | ---------- |
| `system-analysis` | Phase 2 步驟 3、4 載入並使用「Wave 安排檢查清單」（E1、E2）。R1 的修改落在 `rules/Wave安排-格式規範.md`，載入步驟已讀取該檔所有 Rule。其餘步驟追溯 E10 | 追溯結果相同，保留原文 |
| `api-plan` | Phase 1 步驟 4 已讀 `data/` 的既有檔案（E3 的輸入）；Phase 2 步驟 1、2 載入並使用「API 合約檢查清單」（E3～E6、E8、E9）；Phase 3 步驟 4 逐條驗證、步驟 5 回報「上游衝突」（E4、E9）。R2、R3 的修改落在 `rules/API合約-格式規範.md`，載入步驟已讀取該檔所有 Rule | 追溯結果相同，保留原文 |
| `implement` | Phase 2 步驟 8 已載入 `rules/專案衛生-格式規範.md` 所有 Rule（E11） | 不變 |

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無 | — | 沒有無法追溯的元素。三個範例中「後端與資料庫彼此沒有依賴」的寫法改寫，不刪除（見下表） |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `api-plan`／`rules/API合約-格式規範.md` Rule 3 | 修改 | 標題加入資料模型；新增 3 個條列（共用欄位依資料模型、需要不同時列上游衝突、既有合約欄位沿用原名）；修改「補上細節不算上游衝突」條列；新增 Good／Bad Example 3（W1） | R2；E3、E4、E8、E9；C12～C14 |
| `api-plan`／`rules/API合約-格式規範.md` Rule 5 | 新增 | spec 要求的互動語意必須寫進合約，沒有要求的不得自行加入（W2） | R3；E5、E6；C16、C17 |
| `system-analysis`／`rules/Wave安排-格式規範.md` Rule 1 | 修改 | 第 2 條列補上「後端傳遞資料庫保存的資料時，後端依賴資料庫」；Good Example 改成 3 個 Wave；新增 Bad Example 2（W3） | R1；E1、E2；C33 |
| `system-analysis`／`rules/Wave安排-格式規範.md` Rule 2 範例 | 修改 | Good／Bad Example 改成和 Rule 1 一致的 3 個 Wave（W3） | R1（範例不得和規則矛盾）；C34 |
| `system-analysis`／`templates/plan.example.md`「分析流程安排」 | 修改 | 改成 3 個 Wave：前端、金流 → 資料庫 → 後端（W4）；骨架 `templates/plan.md` 不變 | R1；C37 |
| `implement`／`rules/專案衛生-格式規範.md` Rule 1 | 修改 | 產物清單加入機密檔；Dockerfile 條列改寫成 4 種 ignore 檔的條件；Bad Example 加一例（W5） | C26；E11；C48、C49 |
| `api-plan/LICENSE` | 新增 | contract-driven 說明文件的衍生（W6） | 規則 3；計畫第 6 節批 5 |
| 根目錄 `LICENSE` 授權範圍 | 修改 | 加入 `api-plan` 一列（W6） | 規則 3 |
| `implement/LICENSE` | 修改 | 補上 ignore 檔條件的衍生（W7） | 規則 3；計畫第 6 節批 5 |

新增 Rule 5 前的考慮（重新設計 Rule 4）：

1. 刪除：沒有表達互動語意的既有內容可刪。
2. 改寫：Rule 2 的主題是 Edge Case 與驗證規則要寫成錯誤或正常結果；互動語意是行為保證，判斷方式不同，併入會讓 Rule 2 混兩個主題。Rule 3 處理上游一致性，不是語意涵蓋。
3. 改換存放位置：語意要求沒有既有存放位置。
4. 新增：在同一份 RuleFile 新增 Rule 5（同主題集中，約束分配 Rule 3）。

R2 選擇修改 Rule 3、不新增 Rule：共用欄位對齊是「依上游撰寫、問題列上游衝突」的一種，和 Rule 3 同主題，且根因位置在 Rule 3。

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| `api-plan` frontmatter 與 SOP 全部步驟、完成條件 | E3～E6、E10 | C1～C8、C18、C20、C22、C23 |
| `api-plan` Rule 1、Rule 2、Rule 4 | E10 | C9、C10、C15 |
| `api-plan` Rule 3 第 1～4 條列與既有 Example 1、2 | E10 | C11 |
| `api-plan` 合約樣板組（`openapi`、`asyncapi` 骨架與範例） | E10；範例 `openapi.example.yaml:133` 的重複付款通知來自 Edge Cases，符合 Rule 5，不改 | C19 |
| `api-plan/scripts/check_contracts.py` | E10 | C21 |
| `system-analysis` frontmatter 與 SOP 全部步驟、完成條件 | E1、E2、E10 | C24～C29、C35、C36、C38～C46 |
| `system-analysis/rules/系統介面盤點-格式規範.md` Rule 1、2 | E10 | C30、C31 |
| `system-analysis` Wave Rule 1 第 1、3～5 條列、Rule 2 條列 | E1、E2、E10 | C32、C34 |
| `system-analysis/templates/plan.md` 骨架，及 `plan.example.md` 的其他段落 | E10 | C37 |
| `implement` SOP 與其他 RuleFile | 不在本藍圖範圍（C26 只改專案衛生 Rule 1） | — |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase（api-plan／system-analysis） | 3／5 | 3／5 | 0 |
| 步驟（api-plan／system-analysis） | 21／30 | 21／30 | 0 |
| RuleFile（api-plan／system-analysis） | 1／2 | 1／2 | 0 |
| Rule（api-plan／system-analysis） | 4／4 | 5／4 | +1 |
| 樣板組（api-plan／system-analysis） | 2／1 | 2／1 | 0 |
| 腳本（api-plan／system-analysis） | 1／0 | 1／0 | 0 |
| `implement` 專案衛生 Rule | 1 | 1 | 0 |

- Rule +1：`api-plan` Rule 5（R3；E5、E6）。新增理由見第 3 節。
- 內容增減：Rule 3 新增 3 個條列、改寫 1 個條列、新增 1 組範例；Wave Rule 1 改寫 1 個條列、改寫 Good Example、新增 1 個 Bad Example；Rule 2 改寫兩個範例；`plan.example.md` 改寫 1 段；專案衛生 Rule 1 改寫 1 個條列、擴充 1 個條列、Bad Example 加 1 例。
- 沒有刪除的原因：三個 Skill 的 SOP 步驟都能追溯驗收條件；三個「後端與資料庫平行」的範例和新規則矛盾，處理方式是改寫，不是刪除。

## 5. 約束分配表

`api-plan`：

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 決定目標 spec；不存在或無法決定時停止 | P1-1～P1-3 | SOP 流程 | 既有，不變；分支 |
| C2 | 讀取 spec、`plan.md`、技術研究與 `ui/`、`data/`、`contracts/` 的既有檔案 | P1-4 | 步驟內文 | 既有，不變；E3 的輸入來源 |
| C3 | 憲法來源檔與鎖定項目 | P1-5 | 步驟內文 | 既有，不變 |
| C4 | 沒有 `plan.md` 或沒有後端介面時停止 | P1-6～P1-8 | SOP 流程 | 既有，不變；分支 |
| C5 | 依傳輸方式歸類介面與目標合約檔 | P1-9 | 步驟內文 | 既有，不變 |
| C6 | 既有合約檔覆寫前詢問 | P1-10、P1-11 | SOP 流程 | 既有，不變；使用者確認 |
| C7 | 只設計前端或外部系統與後端的介面；上游衝突只在 P3-5 回報，不委派 `clarify`、不停止 | P2-2 | 步驟內文 | 既有，不變 |
| C8 | 憲法衝突委派 `clarify` | P2-3～P2-5 | SOP 流程 | 既有，不變；分支 |
| C9 | operation 歸屬介面 tag、涵蓋每個介面、引用需求 | P2-2 | Rule 1 | 既有，不變；tag 與編號存在性另由 C21 的腳本機械檢查，Rule 1 負責「說明滿足哪一部分」的判斷 |
| C10 | Edge Case 與驗證規則寫成錯誤或正常結果，共用錯誤 schema | P2-2 | Rule 2 | 既有，不變 |
| C11 | 合約依 research Decision 與 spec；補上漏列的行為；上游衝突的四件事 | P2-2 | Rule 3 | 既有，不變 |
| C12 | 對應資料模型欄位的 schema 欄位，用同一個字詞、型別與 Enum 值；名稱可依命名風格轉換 | P2-2 | Rule 3 | 新增（R2；E3、E8）。腳本無法判斷哪個欄位對應哪個資料表欄位；不是檔案整體結構；需要正反例 |
| C13 | 合約需要資料模型沒有的保存欄位，或資料模型和 research／spec 衝突時，不改 `data-model.dbml`，列上游衝突並指名 `data-plan` | P2-2 | Rule 3 | 新增（R2；E4）。判斷「保存欄位」與衝突需要正反例 |
| C14 | spec 要求向下相容時，既有合約已有的欄位沿用原名，不一致時列上游衝突 | P2-2 | Rule 3 | 新增（E9）。和 C12 同主題 |
| C15 | 同一分支不得寫出相反行為 | P2-2 | Rule 4 | 既有，不變 |
| C16 | spec 要求副作用、冪等、事件順序、重試、逾時或版本相容時，在 operation（或 `info.description`）寫出並引用需求編號 | P2-2 | Rule 5 | 新增（R3；E5）。判斷需求是否要求這類語意需要正反例 |
| C17 | spec 沒有要求時，不自行加入冪等鍵、重試次數、逾時秒數、版本協商參數 | P2-2 | Rule 5 | 新增（R3；E6）。和 C16 同主題 |
| C18 | 依目標合約檔載入樣板組 | P3-1 | 步驟內文 | 既有，不變 |
| C19 | 合約檔頂層結構、共用 `Error` 元件、`info.version` | P3-2 | 合約樣板組 | 既有，不變（版本號留到第五章，`docs/待確認.md` 第 39 項） |
| C20 | 寫入位置、`info.title`、說明文字語言 | P3-2 | 步驟內文 | 既有，不變 |
| C21 | Redocly lint、tag、介面涵蓋、需求編號存在 | P3-3 | 腳本 `check_contracts.py` | 既有，不變 |
| C22 | 逐條驗證、最多 3 輪、未通過項 | P3-4 | SOP 流程 | 既有，不變 |
| C23 | 回報內容（含上游衝突） | P3-5 | 步驟內文 | 既有，不變 |

`system-analysis`：

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C24 | 決定目標 spec；不存在或無法決定時停止 | P1-1～P1-3 | SOP 流程 | 既有，不變 |
| C25 | 讀取 spec、技術研究與目錄清單 | P1-4 | 步驟內文 | 既有，不變 |
| C26 | 憲法來源檔與鎖定項目 | P1-5 | 步驟內文 | 既有，不變 |
| C27 | 缺技術研究時停止 | P1-6 | SOP 流程 | 既有，不變 |
| C28 | 既有 `plan.md` 覆寫、沿用或停止 | P1-7、P1-8 | SOP 流程 | 既有，不變 |
| C29 | 只決定介面、端點類型與需求依據；編號格式 | P2-2 | 步驟內文 | 既有，不變 |
| C30 | 介面從需求部位切出並歸類端點類型 | P2-2 | 系統介面盤點 Rule 1 | 既有，不變 |
| C31 | 需求依據可追溯並涵蓋所有 User Story | P2-2 | 系統介面盤點 Rule 2 | 既有，不變 |
| C32 | Wave 以端點類型為單位、依依賴排序、沒有依賴就平行、每個介面恰好一次 | P2-4 | Wave Rule 1 | 既有，不變 |
| C33 | 後端傳遞資料庫保存的資料時，後端依賴資料庫，資料庫排在後端之前 | P2-4 | Wave Rule 1 | 新增（R1；E1）。判斷是否傳遞保存資料需要正反例；Wave 安排不是固定結構，樣板無法保證 |
| C34 | Wave 區塊標題、Sub-agent 數、涵蓋介面、依賴、排序理由 | P2-4 | Wave Rule 2 | 既有，不變（範例改寫以配合 C33） |
| C35 | 專案結構（Documentation、Source Code、Structure Decision） | P3-1 | 步驟內文 | 既有，不變 |
| C36 | 憲法衝突委派 `clarify` | P3-2～P3-4 | SOP 流程 | 既有，不變 |
| C37 | `plan.md` 標頭與段落結構 | P3-6 | plan 樣板組 | 既有，不變（範例改寫以配合 C33） |
| C38 | 標題、Branch、Date、Input 與計數的填寫 | P3-6 | 步驟內文 | 既有，不變 |
| C39 | 需求編號查核命令 | P3-7 | 步驟內文 | 既有，不變；既有工具的單一命令 |
| C40 | 逐條驗證、最多 3 輪 | P3-8 | SOP 流程 | 既有，不變 |
| C41 | 端點類型對應 Planner；沒有 Planner 的介面 | P4-1 | 步驟內文 | 既有，不變 |
| C42 | Planner 既有產出覆寫前詢問 | P4-2～P4-4 | SOP 流程 | 既有，不變 |
| C43 | 視覺風格缺口委派 `clarify` | P4-5～P4-7 | SOP 流程 | 既有，不變 |
| C44 | 依 Wave 順序委派、同 Wave 平行、委派內容 | P5-1 | SOP 流程 | 既有，不變；Wave 增加時照順序多跑一輪 |
| C45 | 等子代理結束並記錄 | P5-2 | SOP 流程 | 既有，不變 |
| C46 | 回報內容（含各 Planner 的上游衝突） | P5-3 | 步驟內文 | 既有，不變 |

`implement`（C26，只列本次修改的 Rule 1）：

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C47 | `.gitignore` 涵蓋任務引入的產物、依實際位置撰寫、不忽略需要版控的檔案、只補缺少的條目、工具自己的 ignore 機制 | P2-9 | 專案衛生 Rule 1 | 既有，不變 |
| C48 | `.dockerignore`、`.npmignore`、`.terraformignore`、`.helmignore` 只在對應條件成立時建立或補齊 | P2-9 | 專案衛生 Rule 1 | 修改（改寫 Dockerfile 條列）；條件需要判斷與反例 |
| C49 | `.gitignore` 涵蓋機密檔：kubeconfig、Kubernetes Secret manifest、私鑰、憑證、Terraform state | P2-9 | 專案衛生 Rule 1 | 新增（擴充第 1 條列的產物清單） |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-rule` | `api-plan/rules/API合約-格式規範.md` Rule 3 | 共用欄位依資料模型 | C12～C14 | 已完成 |
| 2 | W2 | `skill-form-rule` | `api-plan/rules/API合約-格式規範.md` Rule 5 | 新增互動語意 Rule | C16、C17 | 已完成 |
| 3 | W3 | `skill-form-rule` | `system-analysis/rules/Wave安排-格式規範.md` Rule 1、2 | 資料庫排在後端之前 | C33、C34 | 已完成 |
| 4 | W4 | `skill-form-template` | `system-analysis/templates/plan.example.md` | 範例改成 3 個 Wave | C37 | 已完成 |
| 5 | W5 | `skill-form-rule` | `implement/rules/專案衛生-格式規範.md` Rule 1 | C26 ignore 檔條件 | C48、C49 | 已完成 |
| 6 | W6 | `skill-engineering` 直接寫入 | `api-plan/LICENSE`、根目錄 `LICENSE` | 新增衍生說明 | — | 已完成 |
| 7 | W7 | `skill-engineering` 直接寫入 | `implement/LICENSE` | 補 ignore 檔衍生 | — | 已完成 |
| 8 | W8 | `skill-engineering` 直接寫入（驗收通過後） | runbook 步驟 5、`SDD流程不足總整理.md` 第 1 項、計畫狀態行 | 同步紀錄 | — | 已完成 |

- 執行方式：W1～W7 委派 `implementer` 子代理（Sonnet、medium），每次傳入對應的工作項內容並說明已經使用者確認。
- 沒有 SOP 與 frontmatter 工作項：三個 `SKILL.md` 不變，載入步驟已讀取各 RuleFile 的所有 Rule，`skill-form-rule` 不需更新載入步驟。
- 施工後：`audit_skill.py`（三個 Skill）、`./scripts/sync-skills.sh --from agents`、`--check`。

### 工作項內容

#### W1：`api-plan` Rule 3

1. 標題改為「合約必須依上游決策、spec 與資料模型撰寫，上游問題必須記為上游衝突」。
2. 第 1～4 條列保留原文。
3. 在第 4 條列（上游衝突的四件事）之前，新增 3 個條列：
   - 目標 spec 目錄有 `data/data-model.dbml` 時，對應資料表欄位的 request、response 與事件 schema 欄位，必須使用資料模型的同一個字詞、同一種型別與同一組 Enum 值。名稱可以依合約的命名風格轉換大小寫與底線（例如 `loan_no` 寫成 `loanNo`）；不得換字詞（`loan_no` 寫成 `loanNumber`）、換型別（Enum `status` 寫成布林 `isAvailable`），也不得換值（`on_loan` 寫成 `ON_LOAN`）。
   - 合約需要保存在資料庫、資料模型卻沒有的欄位或 Enum 值，或資料模型和 `research.md`／spec 不一致時，不得修改 `data-model.dbml`；合約依第 1～3 點與 spec 撰寫，並記為一項上游衝突，上游位置寫 `data-model.dbml` 的資料表與欄位，建議處理 Skill 為 `data-plan`。不保存在資料庫、由後端計算的回應欄位（例如可否續借）不算。
   - spec 要求向下相容，且合約延續其他 spec 目錄的既有合約時，既有合約已有的欄位必須沿用既有名稱，不依前兩點改名；這些欄位和資料模型不一致時，各記為一項上游衝突，建議處理 Skill 為 `data-plan`。
4. 最後一個條列（補上細節不算上游衝突）改為：「補上 `research.md`、spec 與資料模型都沒有規定的細節（例如錯誤碼、檢查先後、計算出的回應欄位），且沒有與上游相反時，不算上游衝突。spec 的必須／不得規則要求、`Decision` 卻漏列的操作、檢查、執行路徑或鎖不算細節，必須依第 2 點處理；需要保存、資料模型卻沒有的欄位也不算細節，必須依前面的資料模型條列處理。」
5. 新增 Good Example 3：圖書館借閱的 `data-model.dbml` 有 `loans.loan_no`、`books.status`（Enum `available`、`on_loan`、`lost`）；spec FR-011 要求借閱紀錄保存「到期提醒已寄出」，資料模型沒有這個欄位。合約用 `loanNo`、`status` 沿用同一組 Enum 值；到期提醒欄位照 spec 寫進回應，並記一項上游衝突（內容、`data-model.dbml` → `Table loans`、受影響 `getLoan`、建議 `data-plan`）。`canRenew` 是後端計算的欄位，不記衝突。
6. 新增 Bad Example 3：同一份資料模型，合約寫 `loanNumber`、布林 `isAvailable`、大寫 `ON_LOAN`；缺少的到期提醒欄位直接在回報寫「已補上欄位」，沒有列為上游衝突，也沒有指名 `data-plan`。

#### W2：`api-plan` Rule 5

新增於 Rule 4 之後：

```markdown
# Rule 5 - spec 要求的互動語意必須寫進合約，沒有要求的不得自行加入

- 可規劃介面需求依據中的需求（FR、NFR、Edge Cases、Clarifications）對某個 operation 要求下列任一種語意時，該 operation 的 `description` 必須寫出這項語意與對應結果，並引用需求編號：副作用（會改變或不改變哪些資料、會不會觸發其他動作）、冪等（重複送出的結果）、事件順序、重試、逾時、版本相容（延續哪個既有合約、哪些行為不變）。
- 同一項語意適用多個 operation 時，可以寫在 `info.description`，並依 Rule 4 寫出例外。
- 語意的實作機制依 Rule 3 處理；`research.md` 沒有決定機制時，只寫 spec 要求的結果，不自行選定機制。
- spec 沒有要求上述語意時，不得自行加入冪等鍵、重試次數、逾時秒數、版本協商參數等機制或數值。
```

- Good Example：圖書館借閱 spec FR-012「同一張借書證對同一館藏重複送出預約時，不建立第二筆預約」、Clarifications「預約保留 3 天，逾時自動取消」。`createHold` 的 `description` 寫出重複送出時回 200 並回傳既有預約（FR-012），以及保留 3 天、逾時取消（Clarifications）；spec 沒有要求重試，合約不寫重試。
- Bad Example 1：同一份 spec，`createHold` 只寫「依 FR-012 建立預約」，沒有寫重複送出的結果。
- Bad Example 2：spec 沒有任何冪等或重試要求，合約自行加入 `Idempotency-Key` header，並寫「失敗時用戶端重試 3 次」。

#### W3：`system-analysis` Wave Rule 1、2

1. Rule 1 第 2 條列改為：「某個端點類型的分析需要使用另一個端點類型的分析結果時，視為依賴；被依賴的端點類型必須放在較前面的 Wave。後端介面的 request、response 或事件會傳遞資料庫介面保存的資料時，後端依賴資料庫，資料庫必須排在後端之前，讓後端以資料模型的欄位為準。」其餘條列保留原文。
2. Rule 1 Good Example 改為：線上課程訂閱（F1–F2、B1–B3、D1、P1）。前端與金流沒有依賴，在 Wave 1 平行；資料庫依 Wave 1 確定的課程瀏覽與訂閱狀態推出資料結構，在 Wave 2；後端 API 依前端操作與金流付款結果設計，回傳的課程與訂閱欄位來自資料庫，在 Wave 3。表格三列：`1 | 前端、金流 | F1、F2；P1`、`2 | 資料庫 | D1`、`3 | 後端 | B1、B2、B3`。
3. Rule 1 既有 Bad Example 保留，改名為 Bad Example 1；新增 Bad Example 2：同一份盤點，Wave 2 寫「後端、資料庫（2 個 Sub-agent 平行分析）」，排序理由寫「彼此沒有依賴」，但後端回傳的訂閱狀態是資料庫保存的欄位。
4. Rule 2 Good Example 改成和 Rule 1 Good Example 一致的 3 個區塊：Wave 1「前端、金流（2 個 Sub-agent 平行分析）」只有涵蓋介面與排序理由；Wave 2「資料庫」不加註，依賴寫 Wave 1 的課程瀏覽與訂閱狀態；Wave 3「後端」不加註，依賴寫 Wave 1 的前端操作、金流付款事件與 Wave 2 的資料模型欄位。
5. Rule 2 Bad Example 改成同一份 3 個 Wave：Wave 1 有兩個端點類型卻沒有加註 Sub-agent 數、沒有排序理由；Wave 3 沒有寫依賴 Wave 2 的哪些結果。

#### W4：`system-analysis/templates/plan.example.md`

只改「### 分析流程安排」段落，其餘保留原文：

```markdown
本次規劃 3 個 Wave。

**Wave 1：前端、金流（2 個 Sub-agent 平行分析）**

- 涵蓋介面：F1、F2、F3、F4；P1
- 排序理由：（保留原文）

**Wave 2：資料庫**

- 涵蓋介面：D1、D2
- 依賴：資料庫依 Wave 1 確定的購物車操作與訂單付款狀態，搭配 Key Entities 推出資料結構。
- 排序理由：後端 API 回傳的購物車項目、訂單與付款狀態都是資料庫保存的資料，資料庫先確定欄位，後端才能以資料模型為準命名；資料庫只依賴 Wave 1，所以排在 Wave 2。

**Wave 3：後端**

- 涵蓋介面：B1、B2、B3、B4、B5
- 依賴：後端依 Wave 1 的前端操作（加入購物車、調整數量、結帳、查看訂單）與金流確定的付款導向參數、付款結果通知格式設計 API，並依 Wave 2 資料模型的購物車、訂單與付款紀錄欄位定義 request、response 與推播事件。
- 排序理由：後端同時依賴 Wave 1 與 Wave 2 的結果，必須排在最後。
```

開場句的端點類型數、介面數不變。

#### W5：`implement` 專案衛生 Rule 1（C26）

1. 第 1 條列的產物清單加入「機密檔（kubeconfig、Kubernetes Secret manifest、私鑰與憑證檔、Terraform state）」，其餘文字保留。
2. 「只有專案中存在 Dockerfile 時，才可以建立 `.dockerignore`。」改為：「下列 ignore 檔只有在條件成立時才可以建立或補齊：專案存在 Dockerfile 時的 `.dockerignore`；`package.json` 存在且沒有 `"private": true`（套件會發布到 npm）時的 `.npmignore`；存在 Terraform 檔（`*.tf`）時的 `.terraformignore`；存在 Helm chart（`Chart.yaml`）時的 `.helmignore`。」
3. 其餘條列與 Good Example 保留原文。
4. Bad Example 的說明加一句：另外在 `package.json` 有 `"private": true` 的專案建立了 `.npmignore`。

#### W6：`api-plan/LICENSE` 與根目錄 `LICENSE`

1. 新增 `api-plan/LICENSE`，格式同 `system-analysis/LICENSE`：本 skill 為自建 Skill，含 GitHub Spec Kit（MIT）`docs/how-to/contract-driven-development.md` 的衍生內容——合約要寫出的行為語意（副作用、冪等、事件順序、重試、逾時、版本相容）與「一個介面一個權威擁有者、權威方不得單方修改」的概念，本專案改寫為 `rules/API合約-格式規範.md` Rule 3 的資料模型條列與 Rule 5；SOP、RuleFile、樣板與腳本為重新撰寫，未直接複製上游檔案。附 MIT 全文。
2. 根目錄 `LICENSE`「授權範圍」依現有格式加入 `.claude/skills/api-plan/` 與 `.agents/skills/api-plan/` 一列。

#### W7：`implement/LICENSE`

第 1 點「依專案技術建立或補齊 ignore 檔」後補上：「（含 `.npmignore`、`.terraformignore`、`.helmignore` 的建立條件，以及 Kubernetes、Terraform 機密檔要忽略的樣式）」。其餘不變。

#### W8：同步紀錄（驗收通過後）

1. `docs/dev/迭代-runbook.md` 步驟 5 加一句：資料庫介面排在後端之前的 Wave（批 5），有資料庫與後端的功能會多一個 Wave。
2. `docs/report/SDD流程不足總整理.md` 第 1 項處理狀態改為「部分處理」：批 5 讓資料庫排在後端之前、`api-plan` 共用欄位依資料模型（紀錄 60）；`ui-plan` 看不到後端錯誤碼仍未處理。第 3 節第 2 點同步。
3. 計畫開頭狀態行加入批 5 完成。

## 7. 驗收情境

每個情境在 `$TMPDIR/b5-accept/S<N>/` 建立含本次未提交修改的專案複本，記錄執行前 `git status` 與相關檔案雜湊。驗收子代理用 Agent 工具 `general-purpose`、`model: sonnet`、`effort: medium`，只寫在指定目錄；收尾確認 `/tmp` 沒有殘留。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E3、E6、E7、E8、E10 | 本次 | 在複本對 `specs/003-equipment-loan-booking/` 執行 `system-analysis`（含 Planner），再執行 `analyze` | `plan.md` 覆寫：覆寫；Planner 覆寫：全部同意；視覺風格：沿用 003 既有 `ui/plan.md` 的氣質、配色與字體；`clarify` 憲法衝突：選推薦選項；`analyze` 覆寫：同意 | (a) `plan.md` 資料庫 Wave 在後端 Wave 之前，後端「依賴」寫出資料模型；(b) 時段代碼、設備狀態、預約編號三組欄位在 `openapi.yaml` 與 `data-model.dbml` 的字詞、型別、Enum 值一致（snake／camel 轉換算一致）；(c) 003 spec 沒有冪等、重試、逾時要求，合約沒有 `Idempotency-Key`、重試次數或逾時秒數；(d) `analysis.md` 沒有 `contracts/` 與 `data/` 欄位命名不一致的發現（`tasks.md` 和新合約的差異不算）；(e) `check_contracts.py` 通過、`plan.md` 結構同樣板；記下 Wave 數（預期 3）。子代理不能再開子代理時，依 Wave 順序在同一個代理內執行 Planner，並在結果註明 |
| S2 | E2、E10 | 回歸 | 在複本新建一份沒有資料庫的 spec 與技術研究：「匯率換算：使用者在網頁輸入金額與兩種幣別，後端即時呼叫外部匯率服務換算並回傳結果，不保存任何資料」，執行 `system-analysis` 到 Phase 3 完成即停止（Phase 4、5 不受本次修改影響，由 S1 涵蓋） | 無既有 `plan.md` | `plan.md` 沒有資料庫介面；Wave 依前端 → 後端與外部服務的依賴排列，沒有因本次修改多出 Wave；沒有依賴的端點類型在同一個 Wave；Wave 區塊格式符合 Rule 2 |
| S3 | E3、E4、E10 | 本次 | 在複本把 `specs/003-equipment-loan-booking/data/data-model.dbml` 的 `reservations.reservation_no` 欄位刪除，單獨執行 `api-plan`，委派介面 B1～B4 | 合約覆寫：同意 | (a) `data-model.dbml` 的雜湊和執行前相同；(b) 回報的「上游衝突」有一項指出預約編號在 `data-model.dbml` → `Table reservations` 沒有欄位，寫出受影響的 `operationId`，建議處理 Skill 為 `data-plan`；(c) 時段代碼、設備狀態依資料模型；(d) `check_contracts.py` 通過 |
| S4 | E5、E9、E10 | 本次 | 在複本對 `specs/008-overdue-discord-notification/` 單獨執行 `api-plan`，委派介面 B1～B4 | 合約覆寫：同意 | (a) B1～B3 需求依據中要求副作用、冪等、順序、重試、逾時或相容的需求（判斷時逐條列出），對應 operation 或 `info.description` 都寫出語意並引用編號；(b) B4 延續 007 合約的既有欄位（例如 `reservationNumber`）維持原名，和 `data-model.dbml` 不一致的欄位列在上游衝突並指名 `data-plan`；(c) B1～B3 新欄位依資料模型；(d) `check_contracts.py` 通過 |
| S5 | E11 | 本次（逐步演練） | 子代理讀 `implement/rules/專案衛生-格式規範.md`，對三個專案描述判斷要建立或補齊哪些 ignore 檔與 `.gitignore` 條目：(1) Node 前端，`package.json` 有 `"private": true`，沒有 Dockerfile；(2) 發布到 npm 的工具套件，`package.json` 沒有 `private`；(3) 有 `deploy/k8s/*.yaml`、`charts/app/Chart.yaml` 與 `infra/*.tf` 的後端 | 無 | (1) 只有 `.gitignore`，不建 `.npmignore`、`.dockerignore`；(2) 建 `.npmignore`；(3) 建 `.helmignore`、`.terraformignore`，`.gitignore` 涵蓋 kubeconfig、Secret manifest、私鑰、憑證與 Terraform state，不忽略 `.terraform.lock.hcl` |

直接呼叫者回歸（重新設計 Rule 6）：`api-plan` 的直接呼叫者是 `system-analysis`，由 S1 涵蓋；`system-analysis` 沒有呼叫者；`implement` 沒有呼叫者。

額度提醒：S1 要跑 `system-analysis`、3 個 Planner 與 `analyze`，耗時與額度最大。開始驗收前先向使用者確認額度。

## 8. 驗收結果

### 施工

- W1～W7：`implementer` 子代理（Sonnet、medium）依工作項內容完成，沒有被 `skill-form-rule`、`skill-form-template` 拒絕。
- 主 session 檢查 diff 後修正 1 處：W1 Good Example 3 的借閱回應原本直接放館藏的 `status`，改成巢狀 `book.status`，說明文字同步。
- W8：待驗收通過後執行。

### 施工後結構診斷與同步

- `audit_skill.py`（`api-plan`、`system-analysis`、`implement`）：0 error、0 warning。
- `./scripts/sync-skills.sh --from agents`：退出狀態 0；沒有只存在於目標端的 Skill。`--check`：兩邊一致。
- 第 2 節 To-Be：三個 `SKILL.md` 都沒有修改，和藍圖一致。

### 驗收情境

使用者 2026-11-20 回覆「額度夠，開始驗收」後執行。

- 驗收方式：每個情境在 `$TMPDIR/b5-accept/S<N>/` 用 `rsync` 建立含未提交修改的複本（排除 `node_modules`），記錄執行前的 `git status` 與相關檔案雜湊。驗收模型：Agent 工具 `general-purpose`、`model: sonnet`、`effort: medium`，5 個情境平行執行。子代理讀複本內的 `SKILL.md` 執行，不使用 Skill 工具。
- S2 測試輸入：主 session 在複本新建 `specs/009-currency-conversion/` 的 `spec.md`、`research.md`、`techstack.md`。S3 測試輸入：在複本刪除 `reservations.reservation_no` 一列。

| 情境 | 結果 | 判斷依據 |
| ---- | ---- | -------- |
| S1 | 通過 | (a) Wave 1 前端 → Wave 2 資料庫 → Wave 3 後端，後端「依賴」寫出 Wave 2 資料模型的欄位；Wave 數 3（和預期相同）。(b) 主 session 自己比對：`slotCode` 字串、值 `morning` 等 ↔ `slot_code`；`EquipmentStatus` Enum `available`、`unavailable` ↔ `equipment_status`；`reservationNo` ↔ `reservation_no`。(c) 合約沒有 `Idempotency-Key`、重試次數或逾時秒數，`info.description` 寫「第一版不提供冪等鍵、重試或事件推播機制，spec 沒有要求」。(d) `analysis.md` 10 筆發現，沒有 `contracts/` 與 `data/` 命名不一致；F1 是 `tasks.md` 和新合約的差異，不算失敗。(e) `check_contracts.py` 0 issues；`plan.md` 段落結構和樣板相同。Planner 由子代理再開子代理（Sonnet）依 Wave 執行。`ui-plan` 只更新 `ui/plan.md` 日期、沒有重新產生雛形，不影響判斷方式 |
| S2 | 通過 | `plan.md` 沒有資料庫介面；Wave 1 前端、匯率服務平行，Wave 2 後端，共 2 個 Wave；Wave 區塊格式符合 Rule 2；需求編號查核沒有缺少；複本只新增 `specs/009-currency-conversion/plan.md` |
| S3 | 通過 | (a) `data-model.dbml` 雜湊和執行前相同（`867b2336…`）。(b) 上游衝突一項：預約編號在 `data-model.dbml` → `Table reservations` 沒有欄位，受影響 `createReservation`、`cancelReservation`、`listMyReservations`、`listAllReservations`，建議 `data-plan`。(c) `slotCode` 值改成小寫，`isActive` 改成 `status` Enum `available`、`unavailable`。(d) `check_contracts.py` 0 issues |
| S4 | 不通過 | (a) 通過：B2 寫出 FR-005（更新同一則通知、不等送出結果）、FR-007／FR-008（拒絕時通知不變）、FR-018（同時重送只送一次）；B3 寫出 FR-010、FR-012、FR-018；`info.description` 寫出 FR-020 向下相容。(b) 不通過：B4 沿用的 `reservationNumber`（資料模型 `reservations.reservation_no`）與大寫 `slotCode` 值（資料模型小寫）沒有列為上游衝突，回報寫「上游衝突：無」。(c) 通過：新 schema 的狀態與失敗原因 Enum 和資料模型相同。(d) 通過：`check_contracts.py` 0 issues。用新的複本、相同提示重跑一次，(b) 同樣不通過 |
| S5 | 通過（逐步演練） | (1) 只補 `.gitignore`，不建 `.npmignore`、`.dockerignore`；(2) 建 `.npmignore`；(3) 建 `.helmignore`、`.terraformignore`，`.gitignore` 涵蓋 kubeconfig、Secret manifest、私鑰、憑證、Terraform state，不忽略 `.terraform.lock.hcl`。子代理提出的歧義：Secret manifest 依檔名或 `kind: Secret` 辨認、`.terraform.lock.hcl` 是否算 lock 檔 |

- S4 失敗來自 Skill，依 Phase 5 步驟 17 返回 Phase 2。根因 R4 見根因報告第 10 節，等使用者確認。
- W8 與驗收後的同步尚未執行：要等所有情境通過。
- 觀察（不影響本次判斷方式）：S1 的 `ui-plan`、S3、S4 的子代理在使用者同意覆寫後，都以既有產出為底稿修補，沒有從零重寫。

## 9. 第 2 輪設計：R4（2026-11-20）

- 依據：S4 驗收不通過，根因 R4 見根因報告第 10 節。使用者回覆「都照建議」，確認 E1～E11 不變、同意 R4（根因報告 10.7）。
- 確認紀錄：使用者 2026-11-20 回覆「確認藍圖」。

### 9.1 To-Be 與修改方向

- To-Be SOP 不變：`api-plan` 的 `SKILL.md` 全文不改。Phase 2 步驟 1、2 已載入 Rule 3，Phase 3 步驟 4 已逐條驗證 Rule 3（E9 的載入與驗證路徑存在）。
- R4 的缺陷類型是「不可檢查」。依重新設計 Rule 3，修改方向是把原有要求改寫成可檢查的描述，不另增要求。
- 依重新設計 Rule 4 的順序考慮：
  1. 刪除：第 6 條列表達 E9，不能刪除。
  2. 改寫：改寫第 6 條列，把「和資料模型比對」寫成獨立的一句，並寫出「和既有合約一致不代表和資料模型一致」。
  3. 改換存放位置：C14 的存放位置仍是 Rule 3（同主題，約束分配 Rule 3），不改換。
  4. 新增：新增 Good／Bad Example 4。範例只示範既有約束 C14，不新增約束。課程依據：第二章第 7 單元（每條規則都要有 Good／Bad Example，Good 是 Bad 的改良版，兩者能對照）；第三章第 14 單元（範例和測試情境不同，避免抄答案，所以繼續用圖書館借閱）。

### 9.2 差異表

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `api-plan`／`rules/API合約-格式規範.md` Rule 3 第 6 條列 | 修改 | 改寫成兩句：沿用既有名稱、型別與 Enum 值；沿用欄位仍逐一和資料模型比對，不一致時各記一項上游衝突（W9） | R4；E9；C14 |
| `api-plan`／`rules/API合約-格式規範.md` Rule 3 Good Example 4、Bad Example 4 | 新增 | 示範沿用欄位和資料模型不一致時的寫法（W9） | R4；E9；C14 |
| 其他 Rule、條列、範例、SOP、樣板與腳本 | 保留 | 同第 3 節 | 同第 3 節 |

淨增減：Rule 數不變；Rule 3 改寫 1 個條列、新增 1 組範例。約束分配表不變：C14 的內容與存放位置相同，只改寫成可檢查的描述。

### 9.3 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 9 | W9 | `skill-form-rule` | `api-plan/rules/API合約-格式規範.md` Rule 3 | 改寫第 6 條列，新增 Good／Bad Example 4 | C14 | 已完成 |

- 執行方式：委派 `implementer` 子代理（Sonnet、medium），傳入 W9 內容並說明已經使用者確認。
- 施工後：`audit_skill.py`（`api-plan`）、`./scripts/sync-skills.sh --from agents`、`--check`。

#### W9：`api-plan` Rule 3 第 6 條列與範例 4

1. 第 6 條列改為：「spec 要求向下相容，且合約延續其他 spec 目錄的既有合約時，既有合約已有的欄位必須沿用既有的名稱、型別與 Enum 值，不依前兩點修改。這些沿用欄位仍必須逐一和 `data-model.dbml` 的對應欄位比對；字詞、型別或 Enum 值不同時，每個欄位各記為一項上游衝突，上游位置寫 `data-model.dbml` 的資料表與欄位，建議處理 Skill 為 `data-plan`。和既有合約一致，不代表和資料模型一致。」
2. 新增 Good Example 4（放在 Good Example 3 之後）：圖書館借閱第 2 版，spec FR-015 要求向下相容第 1 版的借閱 API。第 1 版合約的 `getLoan` 有 `loanNumber`、館藏 `book.status` 值 `ON_LOAN`；`data-model.dbml` 是 `loans.loan_no`、`books.status`（Enum `available`、`on_loan`、`lost`）。本次新增的 `listDueReminders` 用 `loanNo`。合約 `getLoan` 維持 `loanNumber` 與 `ON_LOAN`，`description` 引用 FR-015；上游衝突列 2 項（`loanNumber` ↔ `Table loans` 的 `loan_no`；`ON_LOAN` ↔ `Table books` 的 `status` 值 `on_loan`），受影響 operation 都是 `getLoan`，建議處理 Skill 都是 `data-plan`。附 YAML 片段與上游衝突 Markdown 片段，格式同 Example 3。
3. 新增 Bad Example 4（放在 Bad Example 3 之後）：同 Good Example 4 的情境，合約內容相同，但回報寫「上游衝突：無。`getLoan` 和第 1 版合約逐欄比對一致」。說明：只和既有合約比對，沒有和資料模型比對，漏列 2 項上游衝突。
4. 其餘條列與 Example 1～3 保留原文。

### 9.4 驗收情境（第 2 輪）

| 編號 | 驗證 | 類型 | 做法 |
| ---- | ---- | ---- | ---- |
| S4 | E5、E9、E10 | 本次（重跑） | 輸入、預先回覆與判斷方式同第 7 節 S4。用新的複本與新的子代理 |
| S3 | E3、E4、E10 | 回歸 | Rule 3 第 5 條列與範例 3 不變，確認改寫沒有影響缺欄位的處理。第 2 輪依第 7 節 S3 執行（結果見 9.5）。第 3 輪依選項 A 修改：輸入改成「在複本把 `specs/003-equipment-loan-booking/data/data-model.dbml` 的 `equipments.equipment_code` 欄位刪除，單獨執行 `api-plan`，委派介面 B1～B4」；判斷方式 (b) 改成「回報的上游衝突有一項指出設備編號在 `data-model.dbml` → `Table equipments` 沒有欄位，寫出受影響的 `operationId`，建議處理 Skill 為 `data-plan`」；預先回覆與 (a)、(c)、(d) 同第 7 節 S3。用新的複本與新的子代理 |
| S1 | E1、E3、E6、E7、E8、E10 | 回歸 | 同第 7 節 S1。`api-plan` 由 `system-analysis` 委派，確認改寫沒有影響非向下相容的情境 |

- S2、S5 不重跑：`system-analysis` 的 Wave 規則與 `implement` 都沒有修改，第 1 輪結果有效。
- 全部通過後執行 W8，再執行 `./scripts/sync-skills.sh --from agents` 與 `--check`。

### 9.5 第 2 輪施工與驗收結果

- W9：`implementer` 子代理（Sonnet、medium）依 `skill-form-rule` 完成，沒有被拒絕。主 session 檢查 diff 後修正 1 處：Good Example 4 的 `listDueReminders` 沒有 `description`，和 Rule 1（每個 operation 引用需求）不一致，補上「依 FR-016 列出到期前 3 天的借閱；本次新增的 loanNo 依資料模型 loans.loan_no 命名。」
- `audit_skill.py`（`api-plan`）：退出狀態 0，0 error、0 warning。`./scripts/sync-skills.sh --from agents`：退出狀態 0，沒有只存在於目標端的 Skill；`--check`：兩邊一致。`api-plan` 的 `SKILL.md` 沒有修改，和 9.1 的 To-Be 一致。
- 驗收：在 `$TMPDIR/b5-accept2/` 建立 S1、S3、S4 的新複本（S3 同樣刪除 `reservations.reservation_no`），驗收模型同第 1 輪。

| 情境 | 結果 | 判斷依據 |
| ---- | ---- | -------- |
| S4 | 通過 | (a) B1～B3 的語意描述保留，引用 FR-005、FR-010、FR-012、FR-018 等。(b) B4 沿用欄位列 3 項上游衝突、都指名 `data-plan`：`reservationNumber` ↔ `reservations.reservation_no`、`requestNumber` ↔ `reschedule_requests.request_no`、`slotCode` 大寫值 ↔ `time_slots.slot_code` 小寫值。(c) 008 新增的 `OverdueNotification.reservationNumber` 改成 `reservationNo`，對齊資料模型；沿用欄位維持原名。(d) `check_contracts.py` 0 issues |
| S1 | 通過 | (a) Wave 1 前端 → Wave 2 資料庫 → Wave 3 後端，後端「依賴」寫出 Wave 2 資料模型的欄位；Wave 數 3。(b) 這次 `data-plan` 產出的資料模型沒有 `slot_code`、`reservation_no`，設備狀態是布林 `equipment.is_available`；合約也沒有時段代碼與預約編號，用 `isAvailable`、`equipmentNo`、`memberId`，和資料模型一致（主 session 自己比對）。(c) 合約沒有冪等鍵、重試或逾時字樣。(d) `analysis.md` 的 F1、F2 是 `tasks.md` 和新產出的差異，F3 是 UI 顯示預約編號、資料模型與合約都沒有（UI 和下游的落差），都不是 `contracts/` 與 `data/` 命名不一致。(e) `check_contracts.py` 0 issues；`plan.md` 段落結構和樣板相同 |
| S3 | 不通過（待判斷原因） | (a) 雜湊和執行前相同。(c) `slotCode` 小寫、設備 `status` Enum，和資料模型一致。(d) 0 issues。(b) 不通過：子代理移除 `reservationNumber`，理由是「spec 與資料模型都沒有這個欄位」，回報「上游衝突：無」 |

- S3 (b) 的分析：003 的 spec 沒有要求預約編號（FR-006、FR-009 都沒有寫），只有 Wave 1 的 `ui/plan.md` 與雛形顯示 `RV-…`。合約是否需要這個欄位可以有兩種判斷：第 1 輪依 UI 保留並列衝突，第 2 輪依 spec 移除。S3 判斷方式的前提「合約需要預約編號」在 003 不成立。另外，第 2 輪移除了 UI 使用的欄位，卻沒有列出 UI 與合約的落差；S1 第 2 輪的 `api-plan` 則把同一件事列為上游衝突並指名 `ui-plan`。
- 使用者 2026-11-20 回覆「照建議」：選 A。S3 改成刪除 `equipments.equipment_code`（FR-003、Key Entities 明確要求唯一設備編號），判斷方式 (b) 改成指出設備編號在 `Table equipments` 沒有欄位；只重跑 S3。第 1 輪、第 2 輪的 S3 結果保留作紀錄。

#### S3 第 3 輪（選項 A，2026-11-20）

- 測試環境：在 `$TMPDIR/b5-accept3/S3/` 用 `rsync -a --exclude node_modules` 建立含未提交修改的複本，刪除 `data-model.dbml` 的 `equipments.equipment_code`（只有欄位定義那一行引用它，索引不用改）。執行前記錄 `git status` 與 `data-model.dbml`、`openapi.yaml`、`spec.md`、`plan.md` 的雜湊；複本和 repo 的差異只有這個欄位。
- 驗收方式：Agent 工具 `general-purpose`、`model: sonnet`、`effort: medium`，子代理讀 `ROOT/.agents/skills/api-plan/SKILL.md` 執行，不用 Skill 工具；預先回覆同第 7 節 S3（另加 clarify：推薦選項，沒有觸發）。判斷由主 session 自己用雜湊、`git diff`、`grep` 與重跑 `check_contracts.py` 核對，不只看回報。

| 情境 | 結果 | 判斷依據 |
| ---- | ---- | -------- |
| S3（第 3 輪） | 通過 | (a) `data-model.dbml` 雜湊和執行前相同；複本只多出 `openapi.yaml` 的修改，沒有其他副作用。(b) 上游衝突 1 項：FR-003 要求唯一設備編號，`data-model.dbml` → `Table equipments` 沒有編號欄位；合約依 FR-003 保留 `equipmentCode`；受影響 operation 寫出 `listEquipments`、`createReservation`、`listMyReservations`、`cancelReservation`、`listAllReservations`；建議處理 Skill 為 `data-plan`。(c) 和同一個複本的資料模型比對：`slotCode` 改成 `morning`／`afternoon`／`evening`（`time_slots.slot_code`），設備 `isActive` 改成 `status` Enum `available`／`unavailable`（`equipment_status`）；另外 `reservationNumber` → `reservationNo`、`userDisplayName` → `displayName`，複本的資料模型有 `reservation_no`、`display_name`，對齊正確；舊值沒有殘留。(d) 主 session 重跑 `check_contracts.py`：退出狀態 0，coverage B1 4、B2 2、B3 2、B4 1，issues 為空 |

- 子代理在同意覆寫後以既有合約為底稿修補，沒有從零重寫；判斷依實際 diff，不影響判斷方式。
- 子代理另外提到 `ui/plan.md` 登入失敗時顯示新驗證碼、合約錯誤回應只有 `code` 與 `message`，前端要再呼叫 `createCaptchaChallenge`；子代理判斷兩者不矛盾，不列為上游衝突。本批不處理。
- 第 2 輪結論：S1、S3、S4 通過；S2、S5 沿用第 1 輪的通過結果。全部驗收情境通過。
- W8：已完成。`docs/dev/迭代-runbook.md` 步驟 5 第 4 點加上資料庫排在後端之前的 Wave；`docs/report/SDD流程不足總整理.md` 第 1 項改為「部分處理」，第 3 節第 2 點同步；`docs/dev/spec-kit-1.4.2-調整計畫.md` 狀態行加入批 5 完成。
- 同步：`./scripts/sync-skills.sh --from agents` 退出狀態 0，沒有只存在於目標端的 Skill；`--check` 退出狀態 0，兩邊一致。
