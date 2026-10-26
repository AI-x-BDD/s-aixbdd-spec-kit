# 工程藍圖：data-plan－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/19-data-plan-建立/`
- 根因報告：無（新建模式）
- 確認紀錄：使用者於 Phase 4 回覆「確認」：接受推定的 E3、E4、E6、E7（皆為通用），確認藍圖其餘內容。前置決策：使用者於第 4 步提案回覆「都依照建議」：資料模型寫成 spec 目錄的 `data/data-model.dbml`；只在 plan.md 盤出資料庫端點時觸發；範例改用與 1A2B 無關的電商情境（與 `api-plan` 共用，見紀錄 18「共用電商情境」）。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 資料模型寫在目標 spec 目錄的 `data/data-model.dbml`；`Project` 區塊的 `database_type` 為 `techstack.md`／`research.md` 採用的資料庫；以 DBML 官方解析器（`@dbml/cli` 的 `dbml2sql`）解析沒有錯誤 | 本次（提案決策 2A；課程以 DBML 表達 Data Model） | 通用 |
| E2 | 每張資料表的 `Note` 標出所屬負責介面編號與需求依據；每個負責介面至少對應一張資料表；沒有負責介面以外的介面編號。負責介面為委派指定的介面編號，未指定時為 plan.md 盤點表中端點類型為資料庫的介面 | 本次（課程：每個 Planner 負責一種系統介面，由 `system-analysis` 依 Wave 委派） | 通用 |
| E3 | 負責介面的需求依據引用的每個 Key Entities 項目，都有對應的資料表，或在某張資料表的 `Note` 說明併入該表 | 推定：Key Entities 是 spec 對資料的主要描述，漏掉會讓後端無處存放 | 通用 |
| E4 | 資料表之間的關聯以 `Ref` 表達並標明基數；每張資料表有主鍵；需求中有固定狀態集合的欄位以 `Enum` 定義；需求要求唯一或必填的欄位標 `unique` 或 `not null` | 推定：DBML 的價值在於能一眼看出關聯與約束（課程以 dbdiagram 視覺化資料表與關聯） | 通用 |
| E5 | 只產出資料模型：執行後目標 spec 目錄只新增或改寫 `data/data-model.dbml`，不修改 `spec.md`、`plan.md` 與其他 Planner 的產出 | 本次（課程：每個 Planner 各自產出自己的 Artifact，不做總彙整） | 通用 |
| E6 | 目標 spec 目錄沒有 `plan.md` 時停止並告知先用 `system-analysis`；負責介面為空時停止並回報沒有資料庫介面；兩種情況都不建立 `data/` | 推定：負責介面來自 plan.md 的盤點；提案決策 4A 只在有資料庫端點時觸發 | 通用 |
| E7 | `data/data-model.dbml` 已存在時，委派內容沒有說明使用者已同意覆寫，就必須先詢問；使用者同意前不覆寫 | 推定：覆寫會遺失既有資料模型；`system-analysis` 已取得同意時不必重問 | 通用 |

## 2. To-Be SOP

````markdown
---
name: data-plan
description: （由 W1 依 skill-form-description 撰寫）（未驗證）已有 plan.md、要為資料庫介面設計資料模型時使用：依 plan.md 系統介面盤點中端點類型為資料庫的介面，或 system-analysis 委派的介面編號，參考 spec.md 的 Key Entities 與需求、技術研究採用的資料庫與前面 Wave 的產出，以 DBML 寫出資料表、欄位約束、Enum 與關聯，存成 spec 目錄的 data/data-model.dbml，每張資料表標出所屬介面與需求依據。通常由 system-analysis 依 Wave 委派，也可以單獨使用。使用者提到 data-plan、資料模型、data model、DBML、資料表設計、ER 圖時使用。盤點介面與安排 Wave 改用 system-analysis；設計 API 合約改用 api-plan；設計畫面與雛形改用 ui-plan。
---

# SOP

## Phase 1 -- 收斂規劃輸入

1. `READ` 使用者需求或委派內容，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「規劃輸入」。
2. `THINK` 決定「目標 spec」：使用者或委派內容指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `ui/`、`data/`、`contracts/` 下的既有檔案（不存在的略過），加入「規劃輸入」。
5. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行。
6. `THINK` 決定「負責介面」：委派內容指定介面編號時使用這些編號，否則使用 `plan.md`「系統介面盤點」表中端點類型為資料庫的所有介面；每個介面記下 plan.md 中的編號、名稱與需求依據。
7. `CHECK` 「負責介面」為空時，回報 `plan.md` 沒有資料庫介面、不產出資料模型，並停止執行。
8. `WRITE` `data/data-model.dbml` 已存在，且委派內容沒有說明使用者已同意覆寫時，詢問使用者是否覆寫；不存在或委派內容已說明同意時，略過本步驟與下一步。
9. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時，回報沒有修改既有資料模型、沒有產出任何檔案，並停止執行。

完成條件：「目標 spec」、`plan.md` 與技術研究結果已讀取，「負責介面」已決定，且沒有既有資料模型或使用者已同意覆寫；或缺少輸入、沒有資料庫介面、使用者不同意覆寫，已停止執行並回報。

## Phase 2 -- 設計資料模型

1. `READ` 設計資料模型時，讀取 `rules/資料模型-格式規範.md` 的所有 Rule，建立「資料模型檢查清單」。
2. `THINK` 依「規劃輸入」與已載入的「資料模型檢查清單」，為「負責介面」設計資料表、欄位、Enum、索引與關聯，欄位型別使用技術研究採用的資料庫支援的型別，不設計 API 或程式實作，建立「資料模型設計」。

完成條件：「資料模型設計」已涵蓋每個「負責介面」。

## Phase 3 -- 產出 data-model.dbml

1. `READ` `templates/data-model.dbml` 與 `templates/data-model.example.dbml`，載入骨架與範例，命名載入結果為「資料模型樣板組」。
2. `WRITE` 依「資料模型樣板組」與「資料模型設計」，將 `data-model.dbml` 寫入「目標 spec」所在目錄的 `data/`，不建立或修改其他檔案：`Project` 名稱使用目標 spec 目錄名稱去掉編號後的英文名稱，`database_type` 填技術研究採用的資料庫；`Note` 使用繁體中文，資料表、欄位與 Enum 名稱使用英文 snake_case。
3. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_data_model.py --spec <目標 spec 絕對路徑> --interfaces <負責介面編號，以逗號分隔> <data-model.dbml 絕對路徑>`，取得「資料模型檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
4. `CHECK` 「資料模型檢查結果」沒有問題且其中的 `database_type` 與技術研究採用的資料庫一致，逐條驗證「資料模型檢查清單」，比對 `data-model.dbml` 與「資料模型樣板組」的區塊結構並確認沒有殘留的 `{{`，確認步驟 2 的填寫要求均已滿足；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 3；未通過時修正 `data-model.dbml` 後返回步驟 3，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
5. `WRITE` 向使用者或委派方回報 `data-model.dbml` 路徑、每個「負責介面」對應的資料表，以及「未通過項」（沒有時說明全部通過）。

完成條件：`data/data-model.dbml` 已寫入，資料模型檢查結果、「資料模型檢查清單」與樣板結構已通過或未通過的項目已記為「未通過項」，且已回報。
````

## 3. 差異表

### 刪除

無（新建模式）

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter | 新增 | `name: data-plan` 與 description（用途、觸發關鍵字、與 `system-analysis`、`api-plan`、`ui-plan` 的分流） | E1、E2、E5 |
| Phase 1 -- 收斂規劃輸入（P1-1～P1-9） | 新增 | 決定目標 spec、讀取 plan.md 與技術研究、決定負責介面、缺少輸入時停止、覆寫確認 | E2、E6、E7（C2–C8） |
| Phase 2 -- 設計資料模型（P2-1～P2-2） | 新增 | 載入資料模型規則、設計資料模型 | E2–E5（C9–C11） |
| Phase 3 -- 產出 data-model.dbml（P3-1～P3-5） | 新增 | 載入樣板組、寫入、腳本檢查、驗證、回報 | E1、E2、E5（C1、C12–C16） |
| `rules/資料模型-格式規範.md` Rule 1～2 | 新增 | Rule 1：資料表歸屬負責介面並涵蓋 Key Entities；Rule 2：關聯與欄位約束反映需求 | E2–E4（C9、C10） |
| `templates/data-model.dbml`、`templates/data-model.example.dbml` | 新增 | DBML 骨架與電商範例 | E1（C1） |
| `scripts/check_data_model.py` | 新增 | 以 DBML 官方解析器檢查語法，並機械比對資料表 Note 的介面編號與需求編號 | E1、E2（C15） |

### 保留

無（新建模式）

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 3 | +3 |
| 步驟 | 0 | 16 | +16 |
| RuleFile | 0 | 1 | +1 |
| Rule | 0 | 2 | +2 |
| 樣板組 | 0 | 1 | +1 |
| 腳本 | 0 | 1 | +1 |

- 新建模式，所有元素都是新增。Phase 1 對應 E6、E7 的停止與確認分支與 E2 的負責介面；Phase 2 對應 E2–E5 的設計判斷；Phase 3 對應 E1、E2、E5 的產出與檢查。
- 腳本一支，不能直接在步驟寫命令：`dbml2sql` 解析失敗時退出碼仍為 0，且會在工作目錄留下 `dbml-error.log`（2026-10-25 以 `@dbml/cli` 10.3.1 實測）；需要腳本在暫存目錄執行並依錯誤輸出判定。Python 的 `pydbml` 會把官方解析器接受的寫法判為錯誤，不採用。介面編號與需求編號的比對也可由程式判斷，一併放進腳本。
- RuleFile 一份兩條：資料表歸屬與欄位約束都屬於「資料模型設計」主題，在同一個步驟使用。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | `data-model.dbml` 的區塊結構與順序：開頭註解標出來源 spec 與產出日期、`Project`（`database_type`、`Note` 說明資料模型範圍）、`Enum`、依負責介面分段的 `Table`（每張附 `Note`）、檔尾集中的 `Ref`；每個負責介面以 `TableGroup` 收攏所屬資料表 | P3-2 | 資料模型樣板組 | 約束整份產出檔案的結構；不是可由腳本產生的內容 |
| C2 | 決定目標 spec 的規則（指定優先，否則唯一一份） | P1-2 | P1-2 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C3 | 目標 spec 不存在或無法確定時停止 | P1-3 | SOP 流程 | 屬於分支與停止 |
| C4 | 沒有 plan.md 時停止並指向 `system-analysis` | P1-5 | SOP 流程 | 屬於分支與停止 |
| C5 | 負責介面的決定方式（委派指定優先，否則 plan.md 中端點類型為資料庫的介面） | P1-6 | P1-6 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C6 | 負責介面為空時停止並回報 | P1-7 | SOP 流程 | 屬於分支與停止 |
| C7 | 既有資料模型須經使用者同意才覆寫，委派內容已說明同意時免問 | P1-8、P1-9 | SOP 流程 | 屬於使用者確認閘門 |
| C8 | 不同意覆寫時回報未修改、未產出並停止 | P1-9 | SOP 流程 | 屬於分支與停止 |
| C9 | 資料表歸屬與追溯：每張資料表的 `Note` 以「<介面編號>：」開頭並寫出需求依據（spec 中存在的需求編號或 Key Entities 項目）；每個負責介面至少一張資料表；不為非負責介面設計資料表；負責介面需求依據引用的每個 Key Entities 項目都有對應資料表或在 `Note` 說明併入哪張表 | P2-2 | `rules/資料模型-格式規範.md` Rule 1 | 判斷實體與資料表的對應、哪些實體可以合併需要語意；需要「依技術層命名、Note 只寫表名」與「漏掉 Key Entity」的反例 |
| C10 | 關聯與欄位約束：關聯以 `Ref` 表達並標明基數（`>`、`<`、`-`）；每張資料表有主鍵；固定狀態集合以 `Enum` 定義；需求要求唯一或必填的欄位標 `unique` 或 `not null`；需求中的查詢條件或效能要求（SC）對應的欄位建立 `indexes` | P2-2 | `rules/資料模型-格式規範.md` Rule 2 | 判斷哪條需求代表唯一性、哪個查詢需要索引需要語意；需要「狀態用自由字串」「關聯只寫在 Note」的反例；與 C9 同屬資料模型設計主題 |
| C11 | 欄位型別使用技術研究採用的資料庫支援的型別；不設計 API 或程式實作 | P2-2 | P2-2 步驟內文 | 只屬於設計步驟，一句話即可表達 |
| C12 | 只寫入 `data/data-model.dbml`，不建立或修改其他檔案 | P3-2 | P3-2 步驟內文 | 只屬於寫入步驟，一句話即可表達 |
| C13 | 填值與命名：`Project` 名稱用目錄英文名稱，`database_type` 填技術研究採用的資料庫；`Note` 用繁體中文，資料表、欄位與 Enum 名稱用英文 snake_case | P3-2 | P3-2 步驟內文 | 填值來源只屬於寫入步驟；樣板只固定欄位位置 |
| C14 | 驗證最多 3 輪，仍未通過記為「未通過項」 | P3-4 | SOP 流程 | 屬於執行順序與停止條件 |
| C15 | 機械檢查：以 `@dbml/cli@10` 的 `dbml2sql --postgres` 在暫存目錄解析，錯誤輸出含 `ERROR` 或退出碼非零即為語法錯誤；從產生的 SQL 取出資料表與 `COMMENT ON TABLE`，每張資料表的註解以負責介面編號開頭；每個負責介面至少一張資料表；註解引用的需求編號都存在於目標 spec；回報 `Project` 的 `database_type` | P3-3 | `scripts/check_data_model.py` | 輸入（spec、介面編號、DBML 檔）與輸出（問題清單）明確、可重複執行，結果可由程式判斷；官方 CLI 的退出碼與副作用需要包裝 |
| C16 | 回報內容（檔案路徑、各介面對應的資料表、未通過項） | P3-5 | P3-5 步驟內文 | 只屬於回報步驟，一句話即可表達 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/data-plan/SKILL.md` frontmatter | 建立 `name` 與 `description` | 無（只概述用途與觸發） | 已完成 |
| 2 | W2 | `skill-form-sop` | `.agents/skills/data-plan/SKILL.md` SOP | 寫入胖 SOP | C2–C16、C1、C9、C10 | 已完成 |
| 3 | W3 | `skill-derive-script` | Phase 3 -- 產出 data-model.dbml 的 `CHECK` 機械檢查步驟 | 抽取 `scripts/check_data_model.py`，加入 `DELEGATE` 執行步驟、調整 `CHECK` 步驟 | C15 | 已完成 |
| 4 | W4 | `skill-derive-template` | Phase 3 -- 產出 data-model.dbml 的 `WRITE` 寫入步驟 | 抽取資料模型樣板組，加入載入步驟 | C1 | 已完成 |
| 5 | W5 | `skill-derive-rule` | Phase 2 -- 設計資料模型的 `THINK` 設計步驟 | 抽取 `rules/資料模型-格式規範.md`，加入載入步驟、調整 `CHECK` 步驟 | C9、C10 | 已完成 |

不需要 LICENSE：DBML 資料模型、SOP、RuleFile 與範例都是重新撰寫，沒有衍生自 Spec-Kit 或 `clarify` 的內容。

### 工作項內容

#### W1：frontmatter

- `name: data-plan`
- `description`：已有 plan.md、要為資料庫介面設計資料模型時使用；依 plan.md 系統介面盤點中端點類型為資料庫的介面，或 `system-analysis` 委派的介面編號，參考 spec.md 的 Key Entities 與需求、技術研究採用的資料庫與前面 Wave 的產出，以 DBML 寫出資料表、欄位約束、Enum 與關聯，存成 spec 目錄的 `data/data-model.dbml`，每張資料表標出所屬介面與需求依據。通常由 `system-analysis` 依 Wave 委派，也可以單獨使用。觸發關鍵字：data-plan、資料模型、data model、DBML、資料表設計、ER 圖。分流：盤點介面與安排 Wave 改用 `system-analysis`；設計 API 合約改用 `api-plan`；設計畫面與雛形改用 `ui-plan`。
- 未經使用者實際驗證前，`description` 開頭加「（未驗證）」。
- 不加 `disable-model-invocation`。

#### W2：胖 SOP

Phase 1 與 To-Be SOP 全文相同。Phase 2 與 Phase 3 寫成下列胖 SOP：

```markdown
## Phase 2 -- 設計資料模型

1. `THINK` 依「規劃輸入」為「負責介面」設計資料表、欄位、Enum、索引與關聯，欄位型別使用技術研究採用的資料庫支援的型別，不設計 API 或程式實作：每張資料表的 `Note` 以「<介面編號>：」開頭並寫出需求依據（目標 spec 中存在的需求編號或 Key Entities 項目）；每個負責介面至少一張資料表，不為其他介面設計資料表；負責介面需求依據引用的每個 Key Entities 項目都有對應資料表，或在某張資料表的 `Note` 說明併入該表。關聯以 `Ref` 表達並標明基數；每張資料表有主鍵；固定的狀態集合以 `Enum` 定義；需求要求唯一或必填的欄位標 `unique` 或 `not null`；需求中的查詢條件或效能要求對應的欄位建立 `indexes`，建立「資料模型設計」。

完成條件：「資料模型設計」已涵蓋每個「負責介面」。

## Phase 3 -- 產出 data-model.dbml

1. `WRITE` 依「資料模型設計」，將 `data-model.dbml` 寫入「目標 spec」所在目錄的 `data/`，不建立或修改其他檔案：檔案依序包含開頭註解（來源 spec 路徑與產出日期）、`Project`（`database_type` 與說明資料模型範圍的 `Note`）、`Enum`、依負責介面分段的 `Table`（每段前以註解標出介面編號與名稱，每張資料表附 `Note`）、每個負責介面一個 `TableGroup`、檔尾集中的 `Ref`。`Project` 名稱使用目標 spec 目錄名稱去掉編號後的英文名稱，`database_type` 填技術研究採用的資料庫；`Note` 使用繁體中文，資料表、欄位與 Enum 名稱使用英文 snake_case。
2. `CHECK` 在暫存目錄執行 `npx --yes -p @dbml/cli@10 dbml2sql --postgres <data-model.dbml 絕對路徑>`，錯誤輸出沒有 `ERROR`；逐一確認每張資料表的 `Note` 以負責介面編號開頭、每個負責介面至少一張資料表、`Note` 引用的需求編號都能在「目標 spec」中以 `grep` 找到、`database_type` 與技術研究一致；驗證 Phase 2 步驟 1 的設計要求與步驟 1 的填寫要求均已滿足；未通過時修正後重新驗證，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
3. `WRITE` 向使用者或委派方回報 `data-model.dbml` 路徑、每個「負責介面」對應的資料表，以及「未通過項」（沒有時說明全部通過）。

完成條件：`data/data-model.dbml` 已寫入，步驟 2 的檢查已通過或未通過的項目已記為「未通過項」，且已回報。
```

#### W3：抽取 `scripts/check_data_model.py`

- 目標步驟：Phase 3 -- 產出 data-model.dbml 的 `CHECK` 步驟（「在暫存目錄執行 `npx --yes -p @dbml/cli@10 dbml2sql`」）。
- 介面：`uv run --script scripts/check_data_model.py --spec <spec.md> --interfaces <編號,編號> <data-model.dbml>`；不需第三方 Python 依賴。
- 行為：
  1. 在 `tempfile.TemporaryDirectory()` 中執行 `npx --yes -p @dbml/cli@10 dbml2sql --postgres <DBML 絕對路徑>`，擷取標準輸出與錯誤輸出；錯誤輸出含 `ERROR` 或退出碼非零時，把錯誤行列為問題並略過後續比對。找不到 `npx` 時以退出碼 2 回報環境錯誤。
  2. 從產生的 SQL 取出 `CREATE TABLE` 的資料表名稱（含 schema 前綴時取最後一段）與 `COMMENT ON TABLE ... IS '...'` 的註解（還原 `''`）。
  3. 每張資料表：必須有註解，且註解以 `--interfaces` 中的某個編號加「：」或「:」開頭；註解中以 `\b(?:US\d+|(?:FR|NFR|SC)-\d+)\b` 找出的需求編號都必須出現在 spec 文字中。
  4. `--interfaces` 中每個編號至少被一張資料表涵蓋。
  5. 從 DBML 原文以正規表示式取出 `Project` 區塊的 `database_type`，放進輸出。
  6. 標準輸出 JSON：`{"database_type", "tables": [{"name", "interface", "requirements"}], "coverage": {"<編號>": <資料表數>}, "issues": [...]}`；`issues` 為空時退出碼 0，有問題時 1，參數或環境錯誤時 2。
- 施工註記（W3）：實測 `dbml2sql` 在非 TTY 執行時，把 `ERROR:` 區塊印到標準輸出而不是錯誤輸出，退出碼仍為 0。腳本因此合併標準輸出與錯誤輸出，以獨立一行的 `ERROR:` 判定語法錯誤，並擷取「檔名(行,列): 訊息」列為問題。判定目的（偵測語法錯誤、不留下 `dbml-error.log`）與 C15 相同，只修正偵測位置；實測正常、語法錯誤、介面編號缺漏與需求編號不存在四種情況的退出碼與問題清單都符合設計。
- 施工註記（W3，主代理複查）：需求編號比對原用 `\b`，中文緊接編號（例如「依FR-001」）時比對不到，且 spec 以「User Story N」書寫時 `US1` 會被誤判為不存在；改為與 `api-plan` 的 `check_contracts.py` 相同的 ASCII 邊界與 `USN`→「User Story N」對應。職責與介面不變。
- After：Phase 3 的 `CHECK` 拆成 `DELEGATE` 執行腳本（To-Be P3-3）與 `CHECK` 判讀「資料模型檢查結果」並驗證其餘要求（To-Be P3-4）；`CHECK` 內文中屬於 C15 的檢查描述刪除，保留「`database_type` 與技術研究一致」的比對（判斷技術研究採用哪個資料庫需要語意）。

#### W4：抽取資料模型樣板組

- 目標步驟：Phase 3 -- 產出 data-model.dbml 的 `WRITE` 步驟（「將 `data-model.dbml` 寫入……`data/`」）。
- 樣板組：`templates/data-model.dbml` 與 `templates/data-model.example.dbml`（C1）。
- 範例使用紀錄 18「共用電商情境」的 D1 購物車資料存取（`products`、`product_variants`、`carts`、`cart_items`）與 D2 訂單與付款紀錄持久化（`orders`、`order_items`、`payments`），`database_type: 'PostgreSQL'`，含 `order_status`、`payment_status` 兩個 Enum、庫存與購物車項目的唯一約束、依訂單查詢付款的索引；不得使用 1A2B、照片相簿、健身房預約或線上課程訂閱情境。範例必須通過 `scripts/check_data_model.py`（W4 施工時在暫存目錄放一份只含編號的 spec 片段做檢查，不放進 Skill）。
- After：To-Be P3-1 插入載入步驟；P3-2 改為依「資料模型樣板組」寫入，刪除內文中屬於 C1 的結構描述，保留 C12、C13；P3-4 加入「比對 `data-model.dbml` 與『資料模型樣板組』的區塊結構並確認沒有殘留的 `{{`」。

#### W5：抽取 `rules/資料模型-格式規範.md`

- 目標步驟：Phase 2 -- 設計資料模型的 `THINK` 步驟（「為『負責介面』設計資料表」）。
- Rule 1 - 資料表必須歸屬負責介面並涵蓋 Key Entities（C9）：反例為 `Note` 只寫表名、資料表不屬於任何負責介面、Key Entities 的某個實體沒有對應。
- Rule 2 - 關聯與欄位約束必須反映需求（C10）：反例為狀態用自由字串、關聯只寫在 `Note` 沒有 `Ref`、需求要求「同一使用者同一時段只能預約一次」卻沒有唯一約束。
- 正反例使用與樣板範例不同的情境（例如圖書館借閱或餐廳訂位），不得使用 1A2B。
- After：To-Be P2-1 插入載入步驟；P2-2 改為依已載入的「資料模型檢查清單」設計，刪除內文中屬於 C9、C10 的約束，保留 C11；P3-4 加入「逐條驗證『資料模型檢查清單』」。施工後 SOP 必須與第 2 節 To-Be SOP 一致。

## 7. 驗收情境

所有情境的暫存專案只放 `.claude/skills/data-plan/` 與情境所需的 spec 檔，`git init` 後提交初始狀態；`plan.md`、`techstack.md`、`research.md` 由執行者準備（S1、S3、S4 與紀錄 18 共用同一組 1A2B 素材）。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1–E5 | 本次 | `specs/001-online-pvp-1a2b/` 含 spec.md，以及 techstack.md（PostgreSQL 存對戰紀錄）、research.md、plan.md（含資料庫介面 D1、D2）。輸入：「/data-plan specs/001-online-pvp-1a2b」 | 無 | `data/data-model.dbml` 存在；執行者另跑 `check_data_model.py --interfaces D1,D2` 退出碼 0 且 `database_type` 為 PostgreSQL；D1、D2 需求依據引用的 Key Entities 都有對應資料表或併入說明；每張表有主鍵、有 `Ref`、狀態欄位用 `Enum`；`git status` 只顯示 `data/` 新增 |
| S2 | E1、E2、E5 | 本次 | `specs/002-gym-class-booking/` 含 spec.md、techstack.md（MySQL）、plan.md（資料庫 D1–D3）。輸入：「system-analysis 委派：目標 spec 為 specs/002-gym-class-booking，負責介面 D1、D2（Wave 2）。使用者已同意覆寫既有產出。」 | 無 | `database_type` 為 MySQL；資料表 `Note` 只出現 D1、D2，沒有 D3；`check_data_model.py --interfaces D1,D2` 退出碼 0；`git status` 只顯示 `data/` 新增 |
| S3 | E6 | 本次 | 同 S1，但沒有 plan.md。輸入同 S1 | 無 | 回覆要求先做系統分析（提到 `system-analysis`）；沒有 `data/` |
| S4 | E6 | 本次 | `specs/001-online-pvp-1a2b/` 的 techstack 改為狀態只放記憶體，plan.md 沒有資料庫介面（同紀錄 16 S1 的結果）。輸入同 S1 | 無 | 回報沒有資料庫介面；沒有 `data/` |
| S5 | E7 | 本次 | 同 S1，另有既有 `data/data-model.dbml`（記錄雜湊）。輸入同 S1 | 無（遇到確認閘門時回報並結束） | 回報中有詢問是否覆寫；該檔雜湊與執行前相同 |

## 8. 驗收結果

- 施工：W1–W5 由分身代理施工完成，主代理複查後修正 `check_data_model.py` 的需求編號比對（見 W3 施工註記）；施工後 `SKILL.md` 的 `# SOP` 與第 2 節 To-Be SOP 逐字相同。
- 施工後結構診斷：`audit_skill.py` 對 `api-plan`、`data-plan` 均為 0 error、0 warning。
- 同步：`./scripts/sync-skills.sh --from agents` 成功，`--check` 為「兩邊一致」；同步輸出沒有只存在於目標端、未被刪除的 Skill。
- 驗收方式：每個情境各在 scratchpad 的獨立暫存專案中執行（只放 `.claude/skills/data-plan/` 與情境所需的 spec 檔，`git init` 後提交初始狀態），由不帶本次分析脈絡的子代理直接讀 `SKILL.md` 逐步執行。驗收模型：**Sonnet**（Claude Code Agent 工具 `model: sonnet`、`effort: medium`；主模型為 Opus 5.5），10 個情境（兩個 Skill 各 5 個）平行執行。子代理只取得 Skill 路徑、專案根目錄、日期、情境輸入與「無預先回覆，遇確認閘門就回報結束」的指示。主代理另以 `git status`、雜湊與兩支檢查腳本複查產出，不只採信子代理自述。
- 素材：1A2B 的 techstack／research 改為 Express REST（配對、查詢）＋Socket.IO（房內事件）＋PostgreSQL。因 spec FR-001 規定不保存跨連線戰績，research §4 寫成「保存進行中的房間與對局狀態，讓多實例共享、以交易處理同時配對，對局結束後刪除」。健身房預約 spec 由執行者重寫（紀錄 16 的暫存檔已清除），techstack 只用 REST 與 MySQL。
- S1 通過：產出 `data/data-model.dbml`；主代理重跑 `check_data_model.py --interfaces D1,D2` 退出碼 0，`database_type` 為 PostgreSQL；D1 為 `rooms`、`players`，D2 為 `games`、`secret_answers`、`guesses`，Key Entities 的玩家、房間、秘密答案、猜測紀錄都有對應；每張表有主鍵，8 條 `Ref` 標明基數，`room_status`、`player_role` 用 `Enum`，以 `unique` 處理同時輸入同一配對碼與每房角色上限；`git status` 只有 `data/`。
- S2 通過：`database_type` 為 MySQL；資料表 `Note` 只出現 D1、D2，D3 只出現在 `Project` 的範圍說明，沒有為 D3 建表；`check_data_model.py --interfaces D1,D2` 退出碼 0；未出現確認閘門；`git status` 只有 `data/`。
- S3 通過：停在 Phase 1 步驟 5，回報需先做系統分析並提到 `system-analysis`；`git status` 乾淨。
- S4 通過：停在 Phase 1 步驟 7，回報 plan.md 沒有資料庫介面，並指出與 research §4「只放記憶體」一致；`git status` 乾淨。
- S5 通過：停在覆寫確認閘門並詢問是否覆寫；`data/data-model.dbml` 雜湊執行前後皆為 `8f50e3d8feea3880…`；`git status` 乾淨。

### 使用者實際驗證（2026-10-26）

- 方式：使用者觸發 `/user-verify-skill`，並要求與 `api-plan` 同時驗證；以 Herdr 在同一個 tab 各開一個 pane，各自在 scratchpad 的暫存專案 `uv-data-plan`（`.claude/skills/` 只放 `data-plan`，素材為健身房課程預約的 spec.md、techstack.md、plan.md，與驗收 S2 相同；`.claude/` 加入 `.git/info/exclude`）啟動全新的 Claude Code。實跑需求以自然語言送出、不指名 Skill：「specs/002-gym-class-booking 已經有 plan.md 了，幫我設計資料庫的資料模型，我想用 dbdiagram 看 ER 圖。」與驗收 S2 不同，本次不指定介面，負責介面為 D1–D3。
- 權限處理：使用者事先授權在暫存專案內執行 `uv run --script …check_*.py` 及其呼叫的 `npx` 時可單次放行；兩輪都沒有出現權限確認（測試 session 為 auto mode），實際沒有使用授權。開場的信任資料夾由使用者回答「Yes, I trust this folder」。
- 結果（第 1 輪，Opus 5.5 high effort，`claude` 預設模型）：測試 session 第一個動作即自行呼叫 `data-plan`（自動觸發成功），約 1 分 32 秒完成。主代理重跑 `check_data_model.py --interfaces D1,D2,D3` 退出碼 0、`database_type` 為 MySQL；D1 `class_sessions`、D2 `members`／`bookings`／`waitlist_entries`、D3 `payments`，5 個 Key Entities 各有一張表；每張表有主鍵，6 個 `Enum`、8 條 `Ref`，以唯一約束處理重複預約與綠界重複通知；`git status` 只有 `data/data-model.dbml`。E1–E5 符合，E6、E7 本輪未觸及（已由驗收 S3–S5 驗證）。
- 結果（第 2 輪，Sonnet 5.5 medium effort，`claude --model sonnet`）：依課程〈【基因工程】系統分析的初步規劃 - 多端點盤點：/system-analysis〉「要測試的話用笨一點的模型」，使用者同意以 Sonnet 重跑後再判定；暫存專案以 `git clean` 還原到初始 commit（第 1 輪產出另存為 `round1-opus-data-model.dbml` 供比較），送出相同需求。測試 session 第一個動作即自行呼叫 `data-plan`，約 47 秒完成；主代理重跑檢查腳本退出碼 0、`database_type` 為 MySQL，D1–D3 對應的資料表與第 1 輪相同，5 張表都有主鍵，4 個 `Enum`、5 條 `Ref`；`git status` 只有 `data/data-model.dbml`。E1–E5 符合。
- 觀察：
  - 兩輪的設計取捨不同：Opus 以 `reserved_count` 欄位條件式扣減名額，Sonnet 不存剩餘名額、改為預約時鎖定課程時段列再以名額減有效預約數計算；兩者都能防止超賣。依課程〈/plan - 2：最專業的地方 -- 系統分析＆規劃產出物〉約 13:22「模型不一樣……大同小異」，不視為缺陷。
  - Sonnet 第一次執行檢查腳本時把 `--spec` 傳成 spec 目錄，發現後自行改傳 `spec.md` 重跑。SOP P3-3 寫「目標 spec 絕對路徑」；使用者同意只記為觀察，再次發生時再改寫為「目標 spec 的 spec.md 絕對路徑」或讓腳本接受目錄。
  - `user-verify-skill` 沒有規定測試 session 的模型，第 1 輪因此用了 Opus；已記入 `docs/待確認.md` 第 7 項。
- 結論：使用者判定通過。依 3-7 的 Review 重點（資料表、關聯與索引）與 3-10「80 分以上的滿意程度」為判準。`description` 已移除「（未驗證）」前綴，並以 `./scripts/sync-skills.sh --from agents` 同步，`--check` 為兩邊一致。
