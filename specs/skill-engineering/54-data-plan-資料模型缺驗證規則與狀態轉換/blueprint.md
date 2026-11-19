# 工程藍圖：data-plan－資料模型缺驗證規則與狀態轉換

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/54-data-plan-資料模型缺驗證規則與狀態轉換/`
- 根因報告：同一紀錄目錄的 `rca-report.md`。使用者已確認 E1～E11 與 R1，推定的 E3、E4、E5 保留（2026-11-19）
- 確認紀錄：使用者於 2026-11-19 Phase 4 回覆「確認藍圖，進入 Phase 5 施工」，同意固定寫法、W1～W7 與驗收情境；沒有刪除項目

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 需求中限制單一欄位值的驗證規則（長度、數值範圍、格式、可接受的日期範圍），都寫在 `data-model.dbml` 該欄位的定義上，用固定寫法並附需求編號；只看固定寫法就能列出每個 `table.column` 的約束，不需要讀一般說明文字 | 本次 | 通用 |
| E2 | 需求規定狀態會改變的 Enum 欄位，在 `data-model.dbml` 有一處完整的狀態轉換：列出 Enum 每個值、每個允許的「從 → 到」與需求編號、哪些是終態；沒有列出的轉換即不允許。同一欄位的轉換不分散在 Enum 值、欄位與資料表的 `Note` | 本次 | 通用 |
| E3 | 跨欄位的驗證規則寫在資料表層級，列出涉及的每個 `table.column` 與需求編號 | 推定（已確認） | 通用 |
| E4 | 狀態轉換寫到 Enum 沒有的值，或約束引用 spec 沒有的需求編號時，`data-plan` 先修正再寫出，3 輪仍未通過時列為「未通過項」 | 推定（已確認） | 通用 |
| E5 | 需求沒有限制的欄位，固定寫法中不出現需求沒有的長度、範圍或格式約束；需求沒有狀態轉換時不寫轉換 | 推定（已確認） | 通用 |
| E6 | 每張資料表的 `Note` 以負責介面編號開頭並寫出需求依據；每個負責介面至少一張資料表；Key Entities 都有對應資料表或寫明併入哪張表 | 既有 | 通用 |
| E7 | 關聯用 `Ref` 標明基數；每張表有主鍵；固定狀態集合用 `Enum`；唯一、必填與查詢效能所需的欄位分別有 `unique`、`not null`、`indexes` | 既有 | 通用 |
| E8 | 驗證規則與狀態轉換只描述資料值的限制，不寫 API 錯誤碼、畫面提示或程式實作 | 既有 | 通用 |
| E9 | `check_data_model.py` 沒有問題，區塊結構與樣板一致，沒有殘留的 `{{` | 既有 | 通用 |
| E10 | 只寫入 `data/data-model.dbml`；既有檔案要先取得覆寫同意，不同意時不修改任何檔案 | 既有 | 通用 |
| E11 | 遵循憲法檔的必須／不得規則，回報路徑、介面與資料表對應、「未通過項」與「憲法遵循」 | 既有 | 通用 |

### 固定寫法（本藍圖的設計決定）

三種寫法都放在 DBML 的 `note` 字串裡。官方 parser（`@dbml/cli@10` 的 `dbml2sql`）會把它們原樣輸出成 `COMMENT ON COLUMN`／`COMMENT ON TABLE`，腳本可以解析（2026-11-19 在暫存目錄實測）。不用 DBML 的 `checks`：它只能寫 SQL 運算式，放不下需求編號，也寫不出「當日起算 7 天內」這種依目前時間判斷的規則。

| 寫法 | 放在哪裡 | 格式 |
| ---- | -------- | ---- |
| 驗證 | 該欄位 `note` 的開頭 | `驗證：<規則>（<依據>）；<規則>（<依據>）。<其他說明>` |
| 轉換 | 狀態欄位 `note` 的開頭，在「驗證」之前 | `轉換：初始 <值>（<依據>）、<值>（<依據>）；<從> → <到>（<依據>）；…；終態 <值>、<值>。<其他說明>` |
| 跨欄位 | 資料表 `Note`，在介面編號與需求依據之後 | `跨欄位：<規則>（<table.column>、<table.column>；<依據>）。` |

- `<依據>`：spec 存在的需求編號（US、FR、NFR、SC），或 `Key Entities <項目名稱>`、`Edge Cases <情境名稱>`。
- 型別與設定已表達的約束（`varchar(n)`、`not null`、`unique`、`Enum`、`default`）不在「驗證」重寫。
- 「驗證」只寫用該欄位的值（可加上目前時間）就能判斷的規則；「跨欄位」只寫同一列兩個以上欄位的規則；要比對其他資料列或資料表的規則（例如「同一讀者最多借 5 本」）不寫成這兩種。

## 2. To-Be SOP

````markdown
---
name: data-plan
description: 已有 plan.md、要為資料庫介面設計資料模型時使用：依 plan.md 系統介面盤點中端點類型為資料庫的介面，或 system-analysis 委派的介面編號，參考 spec.md 的 Key Entities 與需求、技術研究採用的資料庫與前面 Wave 的產出，以 DBML 寫出資料表、欄位約束、驗證規則、狀態轉換、Enum 與關聯，存成 spec 目錄的 data/data-model.dbml，每張資料表標出所屬介面與需求依據。通常由 system-analysis 依 Wave 委派，也可以單獨使用。使用者提到 data-plan、資料模型、data model、DBML、資料表設計、ER 圖、驗證規則、狀態轉換時使用。盤點介面與安排 Wave 改用 system-analysis；設計 API 合約改用 api-plan；設計畫面與雛形改用 ui-plan。
---

# SOP

## Phase 1 -- 收斂規劃輸入

1. `READ` 使用者需求或委派內容，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「規劃輸入」。
2. `THINK` 決定「目標 spec」：使用者或委派內容指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `ui/`、`data/`、`contracts/` 下的既有檔案（不存在的略過），加入「規劃輸入」。
5. `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/data-plan/data-model.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：每張資料表的 `Note` 以「介面編號：」開頭並引用 spec 存在的需求編號、每個「負責介面」至少一張資料表、`Project` 的 `database_type`，以及檔案路徑 `data/data-model.dbml`。
6. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行。
7. `THINK` 決定「負責介面」：委派內容指定介面編號時使用這些編號，否則使用 `plan.md`「系統介面盤點」表中端點類型為資料庫的所有介面；每個介面記下 plan.md 中的編號、名稱與需求依據。
8. `CHECK` 「負責介面」為空時，回報 `plan.md` 沒有資料庫介面、不產出資料模型，並停止執行。
9. `WRITE` `data/data-model.dbml` 已存在，且委派內容沒有說明使用者已同意覆寫時，詢問使用者是否覆寫；不存在或委派內容已說明同意時，略過本步驟與下一步。
10. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時，回報沒有修改既有資料模型、沒有產出任何檔案，並停止執行。

完成條件：「目標 spec」、`plan.md` 與技術研究結果已讀取，「負責介面」已決定，且沒有既有資料模型或使用者已同意覆寫；或缺少輸入、沒有資料庫介面、使用者不同意覆寫，已停止執行並回報。

## Phase 2 -- 設計資料模型

1. `READ` 設計資料模型時，讀取 `rules/資料模型-格式規範.md` 的所有 Rule，建立「資料模型檢查清單」。
2. `THINK` 依「規劃輸入」、「憲法檢查清單」與已載入的「資料模型檢查清單」，為「負責介面」設計資料表、欄位、Enum、索引、關聯、欄位驗證規則、跨欄位規則與狀態轉換，欄位型別使用技術研究採用的資料庫支援的型別，不設計 API 或程式實作，建立「資料模型設計」。
3. `THINK` 比對「憲法檢查清單」的必須／不得規則與「規劃輸入」，列出和 spec、`plan.md` 或技術研究無法同時滿足的項目，建立「憲法衝突」。
4. `DELEGATE` 「憲法衝突」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以「憲法衝突」為優先提問面向、不要求詳記問答紀錄，取得使用者的決定，依決定調整「資料模型設計」；「憲法衝突」為空時略過本步驟與下一步。
5. `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、沒有產出任何檔案，並停止執行；使用者未回覆時停止執行，回報沒有產出任何檔案。

完成條件：「資料模型設計」已涵蓋每個「負責介面」。

## Phase 3 -- 產出 data-model.dbml

1. `READ` `templates/data-model.dbml` 與 `templates/data-model.example.dbml`，載入骨架與範例，命名載入結果為「資料模型樣板組」。
2. `WRITE` 依「資料模型樣板組」與「資料模型設計」，將 `data-model.dbml` 寫入「目標 spec」所在目錄的 `data/`，不建立或修改其他檔案：`Project` 名稱使用目標 spec 目錄名稱去掉編號後的英文名稱，`database_type` 填技術研究採用的資料庫；`Note` 的語言依「憲法檢查清單」，沒有規定時使用繁體中文，資料表、欄位與 Enum 名稱使用英文 snake_case。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_data_model.py --spec <目標 spec 絕對路徑> --interfaces <負責介面編號，以逗號分隔> <data-model.dbml 絕對路徑>`，取得「資料模型檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
4. `CHECK` 「資料模型檢查結果」沒有問題且其中的 `database_type` 與技術研究採用的資料庫一致，逐條驗證「憲法檢查清單」與「資料模型檢查清單」（衝突時以「憲法檢查清單」為準，規則會改變鎖定項目時不套用並記入「未套用規則」，偏離「應」規則時把規則與理由記入「憲法偏離」），比對 `data-model.dbml` 與「資料模型樣板組」的區塊結構並確認沒有殘留的 `{{`，確認步驟 2 的填寫要求均已滿足；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 3；未通過時修正 `data-model.dbml` 後返回步驟 3，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
5. `WRITE` 向使用者或委派方回報 `data-model.dbml` 路徑、每個「負責介面」對應的資料表，以及「未通過項」（沒有時說明全部通過）與「憲法遵循」（已讀取的憲法檔路徑，都不存在時寫「沒有憲法檔」；必須／不得規則是否全部通過；「憲法偏離」；「未套用規則」；經 `clarify` 決定的「憲法衝突」）。

完成條件：`data/data-model.dbml` 已寫入，資料模型檢查結果、「資料模型檢查清單」與樣板結構已通過或未通過的項目已記為「未通過項」，且已回報。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無 | — | 所有既有元素都能追溯到 E6～E11；R1 是缺失，沒有表達錯誤約束的既有內容可刪 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter `description` | 修改 | 產出描述加入「驗證規則、狀態轉換」；觸發關鍵字加入「驗證規則、狀態轉換」 | E1、E2；概述產出，不表達約束 |
| P2-2（`THINK` 設計資料模型） | 修改 | 設計項目加入「欄位驗證規則、跨欄位規則與狀態轉換」，其餘保留原文 | R1、E1～E3；C9 |
| `rules/資料模型-格式規範.md` Rule 2 | 修改 | 新增「驗證」「跨欄位」寫法、適用界線與不虛構約束的條列，更新正反範例 | R1、E1、E3、E5；C17～C19 |
| `rules/資料模型-格式規範.md` Rule 3 | 新增 | 狀態轉換寫法：哪些 Enum 欄位要寫、一處完整、初始與終態、不分散、不虛構 | R1、E2、E5；C20 |
| `templates/data-model.example.dbml` | 修改 | 範例改用三種固定寫法；骨架不變 | R1、E1～E3，範例與 C17～C20 一致 |
| `scripts/check_data_model.py` | 修改 | 新增三種寫法的解析與一致性檢查，報告列出受約束欄位 | E4；C23 |
| `data-plan/LICENSE`、根目錄 `LICENSE` | 新增／修改 | 註明 Rule 2、Rule 3 參考 Spec Kit v1.4.2 `templates/commands/plan.md` Phase 1 的「Validation rules」「State transitions」與 `templates/commands/tasks.md` 的欄位約束來源；保留 MIT 全文；根 `LICENSE` 授權範圍加 `data-plan` | CLAUDE.md 規則 3；計畫第 6 節批 2 |

選新增而不是改寫的理由（重新設計 Rule 4）：Rule 2 沒有任何驗證規則或轉換的描述可以改寫；E1～E3 沒有既有存放位置。Rule 3 另立而不併入 Rule 2：狀態轉換要判斷哪些 Enum 欄位會改變狀態、哪些轉換被允許，判斷方式和單一欄位的值限制不同，需要自己的正反例；兩者仍在同一個 RuleFile（同主題）。

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| `name` | 必要（Skill 識別） | 無 |
| 三個 Phase 與完成條件 | Phase 1：E10；Phase 2：E1～E8；Phase 3：E9～E11 | 無（只概述結果） |
| P1-1～P1-10 | E6、E10、E11 | C1～C8 |
| P2-1（載入資料模型檢查清單） | E1～E7 | 無（只載入） |
| P2-3～P2-5（憲法衝突與 `clarify`） | E11 | C10 |
| P3-1（載入樣板組） | E9 | 無（只載入） |
| P3-2（寫入 `data-model.dbml`） | E9、E10 | C11 |
| P3-3（執行 `check_data_model.py`） | E4、E9 | C12 |
| P3-4（檢查與修正，最多 3 輪） | E4、E9、E11 | C13 |
| P3-5（回報） | E11 | C14 |
| `rules/資料模型-格式規範.md` Rule 1 | E6 | C15 |
| Rule 2 既有條列（`Ref`、主鍵、`Enum`、`unique`／`not null`、`indexes`） | E7 | C16 |
| `templates/data-model.dbml`（骨架） | E9 | C21 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 20 | 20 | 0 |
| RuleFile | 1 | 1 | 0 |
| Rule | 2 | 3 | +1 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 1 | 1 | 0 |

- Rule +1：Rule 3 狀態轉換（R1、E2、E5），理由見第 3 節。
- 內容增減：Rule 2 新增 3 個條列；P2-2 加入 3 個設計項目；範例改寫約束與轉換的寫法；腳本新增檢查。沒有刪除，因為 R1 是缺失，既有內容都能追溯。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 目標 spec 的決定方式 | P1-2 | P1-2 步驟內文 | 既有，不變；單一步驟一句話 |
| C2 | 沒有 spec 或有多份未指定時停止 | P1-3 | SOP 流程 | 既有，不變；分支 |
| C3 | 讀取的輸入清單 | P1-4 | P1-4 步驟內文 | 既有，不變；單一步驟一句話 |
| C4 | 憲法檔路徑與鎖定項目 | P1-5 | P1-5 步驟內文 | 既有，不變；單一步驟 |
| C5 | 沒有 `plan.md` 時停止 | P1-6 | SOP 流程 | 既有，不變；分支 |
| C6 | 負責介面的決定方式 | P1-7 | P1-7 步驟內文 | 既有，不變；單一步驟一句話 |
| C7 | 沒有資料庫介面時停止 | P1-8 | SOP 流程 | 既有，不變；分支 |
| C8 | 既有檔案先問覆寫 | P1-9、P1-10 | SOP 流程 | 既有，不變；使用者確認 |
| C9 | 設計涵蓋的項目；型別用採用資料庫支援的型別；不設計 API 或程式實作 | P2-2 | P2-2 步驟內文 | 修改；只屬於設計步驟，一句話可表達，不需正反例 |
| C10 | 憲法衝突委派 `clarify`；找不到 `clarify` 或未回覆時停止 | P2-3～P2-5 | SOP 流程 | 既有，不變；委派與分支 |
| C11 | 路徑、`Project` 名稱、`database_type`、`Note` 語言、snake_case | P3-2 | P3-2 步驟內文 | 既有，不變；單一步驟 |
| C12 | DBML 可解析、資料表 `Note` 的介面編號、介面涵蓋、需求編號存在 | P3-3 | `scripts/check_data_model.py` | 既有，不變；可由程式判斷 |
| C13 | 逐條驗證、憲法優先、最多 3 輪、未通過項 | P3-4 | P3-4 步驟內文 | 既有，不變；單一步驟 |
| C14 | 回報內容 | P3-5 | P3-5 步驟內文 | 既有，不變；單一步驟 |
| C15 | 資料表歸屬負責介面並涵蓋 Key Entities | P2-2 | Rule 1 | 既有，不變；需要判斷與正反例 |
| C16 | `Ref`、主鍵、`Enum`、`unique`／`not null`、`indexes` | P2-2 | Rule 2 | 既有，不變；需要判斷與正反例 |
| C17 | 單一欄位的驗證規則寫成欄位 `note` 開頭的「驗證」，每條附依據；型別與設定已表達的不重寫 | P2-2 | Rule 2 | 哪些需求是單一欄位的值限制要判斷語意，腳本無法判斷；骨架以區塊填位符號產生資料表，樣板無法逐欄位保證；需要正反例 |
| C18 | 同一列兩個以上欄位的規則寫成資料表 `Note` 的「跨欄位」，列出涉及的 `table.column` 與依據 | P2-2 | Rule 2 | 同 C17 |
| C19 | 「驗證」「跨欄位」只寫同一列可判斷的資料值限制，不寫需求沒有的約束，不寫要比對其他資料列的規則 | P2-2 | Rule 2 | 界線要判斷，需要正反例 |
| C20 | 需求規定狀態會改變的 Enum 欄位，在欄位 `note` 開頭寫一處「轉換」：初始值、每個允許的轉換與依據、終態；Enum 值與資料表 `Note` 不重述轉換；狀態不會改變的 Enum 不寫轉換 | P2-2 | Rule 3 | 哪些轉換被需求允許要判斷語意；樣板無法逐欄位保證；需要正反例 |
| C21 | `data-model.dbml` 的區塊結構（檔頭、Project、Enums、Tables、Table Groups、Relationships） | P3-2 | 資料模型樣板組 | 既有，不變；整份產出的結構 |
| C22 | 範例示範 C15～C20 | P3-2 | 資料模型樣板組的範例 | 範例不是存放位置，只示範，不得與 C15～C20 矛盾 |
| C23 | 三種寫法可解析；依據的需求編號存在；「轉換」的欄位型別是 Enum，引用的值都在 Enum 中，Enum 每個值都出現，終態沒有轉出，非終態至少一個轉出，至少一個初始值；「跨欄位」至少兩個欄位且都存在於該資料表；「轉換」不出現在資料表 `Note` | P3-3 | `scripts/check_data_model.py` | 輸入輸出明確、可重複執行、結果可由程式判斷（順序 1）；寫法本身由 Rule 2、Rule 3 定義，腳本只檢查一致性 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `data-plan/SKILL.md` frontmatter | `description` 加入驗證規則、狀態轉換 | 無 | 已完成 |
| 2 | W2 | `skill-form-sop` | Phase 2 -- 設計資料模型的 `THINK` 設計資料表步驟 | 設計項目加入欄位驗證規則、跨欄位規則與狀態轉換 | C9 | 已完成 |
| 3 | W3 | `skill-form-rule` | `rules/資料模型-格式規範.md` Rule 2 | 新增 3 個條列並更新正反範例 | C17～C19 | 已完成 |
| 4 | W4 | `skill-form-rule` | `rules/資料模型-格式規範.md` Rule 3（新） | 新增狀態轉換 Rule 與正反範例 | C20 | 已完成 |
| 5 | W5 | `skill-form-template` | `templates/data-model.example.dbml` | 改用三種固定寫法 | C22 | 已完成 |
| 6 | W6 | `skill-form-script` | `scripts/check_data_model.py` | 新增解析與一致性檢查 | C23 | 已完成 |
| 7 | W7 | `skill-engineering` 直接修改 | `data-plan/LICENSE`、根目錄 `LICENSE` | 註明衍生來源 | 無 | 已完成 |

沒有新增部位，也沒有改變載入步驟：Rule 3 加在已由 P2-1 整份載入的 RuleFile；腳本的執行步驟 P3-3 命令不變。因此 W3～W6 交給 `skill-form-*`。

施工差異（W3，為了讓範例不和新條列矛盾，沒有新增要求）：

- Rule 2 既有 Good Example 加上 `### Example 1` 小標，以便和 Example 2 區分。
- Rule 2 既有 Good Example 1 的 `active_copy_id` note 原本寫「借出中時等於 copy_id，歸還後設為 null」，這是跨欄位規則，違反新條列「不得寫在其中一個欄位的 `note`」。改為說明用途，關係移到資料表 `Note` 的「跨欄位」。
- Rule 2 兩個 Good Example 的 `status` 沒有「轉換」，會和 Rule 3 矛盾。說明句加上「`status` 的狀態轉換由 Rule 3 示範，本例省略」。

### 工作項內容

#### W1：frontmatter

- `description` 的「以 DBML 寫出資料表、欄位約束、Enum 與關聯」改為「以 DBML 寫出資料表、欄位約束、驗證規則、狀態轉換、Enum 與關聯」。
- 觸發關鍵字「ER 圖」之後加入「驗證規則、狀態轉換」。
- 其餘文字與分流保留原文。全文見第 2 節。

#### W2：SOP

Phase 2 -- 設計資料模型的 `THINK` 設計步驟修改後全文：

`THINK` 依「規劃輸入」、「憲法檢查清單」與已載入的「資料模型檢查清單」，為「負責介面」設計資料表、欄位、Enum、索引、關聯、欄位驗證規則、跨欄位規則與狀態轉換，欄位型別使用技術研究採用的資料庫支援的型別，不設計 API 或程式實作，建立「資料模型設計」。

其餘步驟保留原文。

#### W3：Rule 2

新增條列（放在既有條列之後）：

- 需求限制單一欄位的值（長度、數值範圍、格式、可接受的日期範圍），且只用該欄位的值（可加上目前時間）就能判斷時，必須寫在該欄位 `note` 的開頭：`驗證：<規則>（<依據>）；<規則>（<依據>）。`，之後才寫其他說明。`<依據>` 是 spec 存在的需求編號，或 `Key Entities <項目名稱>`、`Edge Cases <情境名稱>`。欄位型別與設定已表達的約束（`varchar(n)`、`not null`、`unique`、`Enum`、`default`）不得在「驗證」重寫。
- 需求限制同一列兩個以上欄位之間的關係時，必須寫在資料表 `Note` 的介面編號與需求依據之後：`跨欄位：<規則>（<table.column>、<table.column>；<依據>）。`；不得寫在其中一個欄位的 `note`。
- 「驗證」與「跨欄位」只寫需求規定的資料值限制：不得加入需求沒有的約束；要比對其他資料列或資料表的規則不得寫成這兩種寫法，改由 `unique`、索引或 `Ref` 表達，無法表達時不寫。

Good Example（沿用圖書館借閱情境，補充需求）：讀者編號為 R 加 11 位數字（FR-003）；借閱期限為借出日起 1 到 30 天（FR-004）；歸還時記錄歸還時間（FR-005）。`reader_no` 的格式寫成「驗證」，長度由 `varchar(12)` 表達、不重寫；`due_date` 的範圍要比較 `borrowed_at`，寫成「跨欄位」；`status = returned` 與 `returned_at` 的關係也寫成「跨欄位」。

```dbml
Table loans {
  id uuid [pk]
  copy_id uuid [not null]
  reader_no varchar(12) [not null, note: '驗證：R 加 11 位數字（FR-003）。讀者由會員系統管理，只保存讀者編號']
  status loan_status [not null, default: 'on_loan']
  borrowed_at timestamptz [not null]
  due_date date [not null]
  returned_at timestamptz

  Note: 'D2：Key Entities 借閱紀錄；FR-004 借書、FR-005 還書。跨欄位：due_date 為 borrowed_at 的日期之後 1 到 30 天（loans.due_date、loans.borrowed_at；FR-004）。跨欄位：status = returned 時 returned_at 不得為 null，其他狀態時為 null（loans.status、loans.returned_at；FR-005）。'
}
```

Bad Example（同一情境）：格式規則混在說明句中；`reader_no` 重寫 `varchar(12)` 已表達的長度；`due_date` 和 `borrowed_at` 的關係只寫在 `due_date` 的 `note`；加入需求沒有的「`copy_id` 不得為零值 UUID」；把「同一讀者最多借 5 本」這種要比對其他資料列的規則寫成「驗證」。

```dbml
Table loans {
  id uuid [pk]
  copy_id uuid [not null, note: '驗證：不得為零值 UUID（FR-004）']
  reader_no varchar(12) [not null, note: '讀者編號，必須是 R 開頭加 11 位數字，最多 12 字元']
  due_date date [not null, note: '驗證：借出後 1 到 30 天內（FR-004）；同一讀者最多借 5 本（FR-006）']

  Note: 'D2：Key Entities 借閱紀錄；FR-004 借書'
}
```

既有條列、既有 Good／Bad Example 的程式碼區塊保留原文；新增的正反範例放在既有範例之後，以 `### Example 2` 區分。

#### W4：Rule 3（新）

標題：`# Rule 3 - 狀態轉換必須寫在狀態欄位的一處`

條列：

- 需求規定狀態會改變的 `Enum` 欄位，必須在該欄位 `note` 的開頭寫「轉換」，放在「驗證」之前：`轉換：初始 <值>（<依據>）；<從> → <到>（<依據>）；…；終態 <值>、<值>。`，之後才寫其他說明。
- 「轉換」必須列出建立資料列時可用的每個初始值、需求允許的每個轉換與依據、每個終態；沒有列出的轉換表示不允許。`<依據>` 的寫法與 Rule 2 相同。
- 同一欄位的轉換只寫在這一處：`Enum` 值的 `note` 只寫該值的意思，資料表 `Note` 不得重述轉換。
- 需求沒有規定狀態改變的 `Enum` 欄位（例如角色）不得寫「轉換」，也不得加入需求沒有的轉換。

Good Example（圖書館借閱情境）：借出時建立 `on_loan`（FR-004）；超過期限未還改為 `overdue`（FR-007）；`on_loan`、`overdue` 都可以歸還（FR-005）。

```dbml
Enum loan_status {
  on_loan [note: '借出中']
  overdue [note: '逾期未還']
  returned [note: '已歸還']
}

Table loans {
  id uuid [pk]
  status loan_status [not null, default: 'on_loan', note: '轉換：初始 on_loan（FR-004）；on_loan → overdue（FR-007）；on_loan → returned（FR-005）；overdue → returned（FR-005）；終態 returned。借閱目前的狀態']
  Note: 'D2：Key Entities 借閱紀錄；FR-004、FR-005、FR-007'
}
```

Bad Example（同一情境）：轉換分散在 `Enum` 值的 `note` 與資料表 `Note`；漏掉 `overdue → returned`；沒有寫終態；`reader_role` 的需求沒有狀態改變，卻寫了「轉換」。

```dbml
Enum loan_status {
  on_loan [note: '借出中，逾期時改為 overdue']
  overdue [note: '逾期未還']
  returned [note: '已歸還']
}

Table loans {
  id uuid [pk]
  status loan_status [not null, default: 'on_loan']
  reader_role reader_role [not null, note: '轉換：初始 student（FR-002）；student → teacher（FR-002）']
  Note: 'D2：Key Entities 借閱紀錄；on_loan 歸還時改為 returned（FR-005）'
}
```

#### W5：`templates/data-model.example.dbml`

依 Rule 2、Rule 3 修改範例；骨架 `templates/data-model.dbml` 不修改；其他欄位與 note 保留原文：

| 位置 | 修改後 |
| ---- | ------ |
| `Enum order_status` 各值的 `note` | 只寫值的意思，刪除各值中的需求編號與觸發描述，例如 `pending_payment [note: '已建立訂單，等待付款結果']` |
| `orders.status` | `note: '轉換：初始 pending_payment（FR-004）；pending_payment → paid（FR-006）；pending_payment → payment_failed（FR-006）；pending_payment → expired（Edge Cases 付款逾時）；終態 paid、payment_failed、expired。訂單目前的付款狀態'` |
| `payments.status` | `note: '轉換：初始 pending（FR-005）；pending → succeeded（FR-006）；pending → failed（FR-006）；終態 succeeded、failed。付款結果'` |
| `cart_items.quantity` | `note: '驗證：大於 0（FR-002）。調整為 0 時改為刪除此列'` |
| `product_variants.stock_quantity` | `note: '驗證：大於或等於 0（FR-003）。加入與調整數量時比對庫存'` |
| `orders.order_no` | `note: '驗證：只含英文字母與數字（FR-005）。綠界 MerchantTradeNo'`（長度由 `varchar(20)` 表達） |
| `payments` 資料表 `Note` | 原文之後加 `跨欄位：status = succeeded 時 notified_at 不得為 null（payments.status、payments.notified_at；FR-006）。` |

#### W6：`scripts/check_data_model.py`

保留既有命令列介面、退出碼與既有檢查。新增：

1. 從 `dbml2sql` 輸出解析 `CREATE TYPE "<enum>" AS ENUM (...)`、`CREATE TABLE` 內每個欄位的型別，以及 `COMMENT ON COLUMN "<table>"."<column>" IS '...'`。
2. 欄位 `note` 開頭的「轉換：…。」與「驗證：…。」：
   - 只能出現在 `note` 開頭，順序為「轉換」再「驗證」；出現在其他位置時列為問題。
   - 「驗證」以 `；` 分隔，每條必須以 `（<依據>）` 結尾。
   - 「轉換」以 `；` 分隔，每項是 `初始 <值>（<依據>）`（多個值以 `、` 分隔，每個值各附依據）、`<從> → <到>（<依據>）` 或 `終態 <值>、<值>`。檢查：欄位型別是 Enum；引用的值都在該 Enum 中；Enum 每個值至少出現一次；至少一個初始值；終態沒有轉出；非終態至少一個轉出。
3. 資料表 `Note` 中的「跨欄位：…（<欄位>、<欄位>；<依據>）。」：至少兩個欄位，每個以 `<table>.<column>` 寫成且 `<table>` 是該資料表、`<column>` 存在。資料表 `Note` 出現「轉換：」時列為問題。
4. `<依據>`：其中的 US、FR、NFR、SC 編號都必須存在於 spec（沿用 `requirement_exists`）；沒有任何編號時必須以 `Key Entities ` 或 `Edge Cases ` 開頭。
5. JSON 報告每張資料表新增 `constrained_fields`（有「驗證」或「轉換」的欄位，寫成 `table.column`）與 `cross_field_rules`（「跨欄位」條數）；`--help` 與檔頭說明補上新檢查。

#### W7：LICENSE

- 新增 `.claude/skills/data-plan/LICENSE`，格式比照 `tasks/LICENSE`：說明 Rule 2 的驗證規則、跨欄位規則與 Rule 3 的狀態轉換，參考 Spec Kit v1.4.2（tag `v1.4.2`，commit `1e421b5`）`templates/commands/plan.md` Phase 1「Validation rules from requirements」「State transitions if applicable」與 `templates/commands/tasks.md` 把 data-model 當欄位約束來源的做法；寫法、SOP、RuleFile、樣板與腳本為重新撰寫；附 MIT 全文。
- 根目錄 `LICENSE`「授權範圍」在 `system-analysis` 那一列之後加入 `data-plan` 一列，寫法比照其他列。

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E4、E6～E11 | 本次 | 暫存專案複本，對 `specs/006-reservation-reschedule/` 執行 `data-plan`，負責介面為 plan.md 的資料庫介面 | 覆寫詢問回覆「同意覆寫」 | (1) `reschedule_requests.to_reservation_date` 的「當日起算 7 天內」是該欄位的「驗證」並附 FR-001；`reject_reason` 的 200 字只由 `varchar(200)` 表達一次；(2) `reschedule_requests.status` 與 `reservations.status` 各有一處「轉換」，Enum 每個值都出現，終態正確，Enum 值的 note 與資料表 `Note` 沒有重述轉換；(3) 「新時段不同於原時段」是 `reschedule_requests` 的「跨欄位」並列出涉及的欄位；(4) 在產出的複本把一個轉換的值改成 Enum 沒有的值、把一個依據改成 `FR-999`，腳本兩項都列為問題；(5) 原產出的腳本結果沒有問題；`git status` 只有 `data/data-model.dbml` 改變 |
| S2 | E1、E5～E9、E11 | 回歸（呼叫者 `system-analysis`） | 暫存專案複本，以 `system-analysis` 的委派內容格式對 `specs/002-room-game-chat/` 執行：負責介面為 plan.md 的資料庫介面，委派內容說明使用者已同意覆寫 | 無（不應出現覆寫詢問） | 沒有詢問覆寫；`chat_messages.content` 的「最多 100 個字」「不得只含空白」是該欄位的「驗證」並附 FR-004，「驗證」不含程式實作；`room_role` 沒有「轉換」；沒有需求以外的約束；Rule 1、Rule 2 既有要求與腳本檢查都通過 |
| S3 | E10 | 回歸 | 暫存專案複本，對 `specs/004-equipment-approval-review/` 執行 `data-plan` | 覆寫詢問回覆「不同意」 | 回報沒有修改既有資料模型；`git status` 與執行前相同 |

直接呼叫者：`system-analysis`（Phase 3 步驟 1）。本次不改變 `data-plan` 的輸入、輸出路徑與確認方式，`system-analysis` 的委派步驟不需修改；回歸由 S2 驗證。

## 8. 驗收結果

- 施工後結構診斷：`data-plan` 0 個 error、0 個 warning。
- 同步：`./scripts/sync-skills.sh --from claude` 與 `--check` 退出狀態都是 0，結果為「兩邊一致」；同步輸出沒有只存在於目標端的 Skill。
- 腳本自測（skill-form-script Phase 2）：範例 `data-model.example.dbml` 與既有 006、008 產出都沒有問題；故意寫錯的測試檔列出 14 項問題，涵蓋 Enum 值不存在、Enum 值遺漏、終態有轉出、非終態沒有轉出、轉換不在開頭、轉換用在非 Enum 欄位、依據格式錯、需求編號不存在、跨欄位寫在欄位、跨欄位欄位不存在、跨欄位少於兩個欄位、轉換寫在資料表 Note；檔案不存在時退出狀態 2。
- 驗收方式：S1～S3 各在含本次未提交修改的暫存專案複本（`git init` 建立基準 commit）中，由不帶本次分析脈絡的 `skill-tester` 子代理執行；Agent 工具指定 model `sonnet`、effort `medium`，3 個子代理平行執行。
- S1 通過：
  - `reschedule_requests.to_reservation_date` 有「驗證：必須在當日起算 7 天內，依 Asia/Taipei 解讀（FR-001）」；兩個 `reject_reason` 只用 `varchar(200)` 表達，沒有重寫。
  - `reschedule_requests.status`、`reservations.status` 各有一處「轉換」，腳本確認涵蓋 Enum 每個值；Enum 值的 note 只寫意思，資料表 `Note` 沒有重述轉換。
  - 「原日期時段與新日期時段不得相同」是 `reschedule_requests` 的「跨欄位」，列出 4 個欄位；另有 3 條狀態與時間欄位的跨欄位規則。
  - 變更測試：把一個轉換的值改成 `cancelled_x`、把一個依據改成 `FR-999`，腳本兩項都列為問題。
  - 腳本 1 輪沒有問題；`git status` 只有 `data/data-model.dbml` 改變。
  - 觀察（不影響判定）：子代理以 Python 改寫既有檔案，沒有從樣板重填；區塊結構與 `{{` 檢查仍通過。子代理另在暫存區寫了一份舊檔備份，位於測試根目錄外，屬於測試環境的副作用，不是 Skill 的行為。`reservations.status` 的 `pending_approval → cancelled` 依據是子代理從 spec 敘述推定，寫 FR-015。
- S2 通過（呼叫者 `system-analysis` 的回歸）：委派內容說明已同意覆寫，沒有出現覆寫詢問；`chat_messages.content` 有「驗證：不得只含空白（FR-004）；最多 100 個字（FR-004）」，「驗證」裡沒有程式實作；`room_role` 沒有「轉換」；子代理在第 1 輪後依 Rule 2 自己刪掉一條 spec 沒有的 `sequence` 約束（E5）；腳本沒有問題；`git status` 只有 `data/data-model.dbml` 改變。
- S3 通過：覆寫詢問回覆「不同意」後停止，回報沒有修改既有資料模型；`git status` 為空。
- 約束分配：C1～C23 各只出現在指定的存放位置；Rule 2 範例的施工差異見第 6 節，已讓範例和 Rule 2、Rule 3 一致。
- 個案驗收條件：無。
