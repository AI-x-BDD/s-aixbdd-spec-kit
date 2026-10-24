# 工程藍圖：technical-research－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/12-technical-research-建立/`
- 根因報告：無（新建模式）
- 確認紀錄：使用者於 Phase 4 回覆「1 接受、2 是、3 確認」：接受推定的 E4–E10（皆為通用）；確認範例衍生自 Spec-Kit 的產出，W4 依 `s-specify` 前例建立 LICENSE；確認藍圖其餘內容；施工中 W2 回報樣板組載入位置違反按需載入 Rule 1，重新設計後使用者回覆「確認」修改後的 To-Be SOP 與工作項

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | research.md 寫在目標 spec.md 的同一個目錄，結構符合 research 樣板組：標題為「技術研究與決策紀錄 (Research): <功能名稱>」，`Feature Branch` 為該目錄名稱，`Date` 為執行當日，`Spec` 連結為 `./spec.md`，每個主題章節依序包含 `Decision`、`Rationale`、`Alternatives considered` | 本次（使用者指定樣板組為必須產出的 Artifact） | 通用 |
| E2 | 每個主題的 `Decision` 只寫一個確定方案，不以「或」並列未決定的方案 | 本次（定稿時確立） | 通用 |
| E3 | 每個主題的 `Alternatives considered` 至少一條，每條以粗體寫出方案名稱並寫出捨棄原因；被捨棄的方案不出現在 `Decision` | 本次（定稿時確立） | 通用 |
| E4 | 使用者輸入中的每項技術限制都被某個主題的 `Decision` 採納，沒有任何 `Decision` 違反使用者的技術限制 | 推定：範例的 Rationale 逐條引用使用者限制（「不用 React」「最少套件」「不要第三方系統」），漏掉或違反限制的研究無法使用 | 通用 |
| E5 | `Rationale` 與 `Alternatives considered` 引用的 FR／SC 編號都存在於目標 spec.md | 推定：範例以 FR-001、SC-002 等編號對齊需求，引用不存在的編號會誤導後續規劃 | 通用 |
| E6 | `Decision` 與 `Rationale` 對套件或 API 能力的描述，與該套件目前的官方文件一致 | 推定：定稿時發現範例誤寫 `sharp` 能解析 EXIF 拍攝日期，查證文件後才更正 | 通用 |
| E7 | 主題章節數依實際需要決策的主題決定，編號從 1 連續，沒有空章節，也沒有殘留的填位符號 | 推定：骨架固定 5 個主題章節，委派時要求由 SOP 決定數量不同時的處理方式 | 通用 |
| E8 | 找不到 spec.md 時停止執行、不建立 research.md，並告知使用者先產出 spec.md | 推定：research.md 的標頭與 Rationale 都依賴 spec.md | 通用 |
| E9 | 目標目錄已有 research.md 時，使用者未同意前不覆寫該檔案 | 推定：覆寫會遺失使用者既有的研究紀錄 | 通用 |
| E10 | 使用者的技術限制彼此衝突時，先向使用者提問再決策，相關主題的 `Decision` 採用使用者的回答 | 推定：自行取捨衝突的限制，等於替使用者做決定 | 通用 |

## 2. To-Be SOP

````markdown
---
name: technical-research
description: （由 W1 依 skill-form-description 撰寫）已有 spec.md、要做技術選型研究並記錄決策時使用：從 spec 的需求與使用者的技術限制盤點需要決策的技術主題，每個主題收斂成單一確定方案，寫出依據與被捨棄的替代方案，產出與 spec.md 同目錄的 research.md；限制互相衝突時先委派 clarify 詢問使用者。使用者提到 technical research、技術研究、技術選型、research.md、決策紀錄時使用。把功能描述寫成 spec.md 時改用 s-specify；規劃類別設計時改用 plan-with-class-diagram。
---

# SOP

## Phase 1 -- 收斂研究輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「研究輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及使用者指定的專案原則文件或專案中名為 `constitution.md` 的檔案（都沒有時視為空），加入「研究輸入」。
5. `WRITE` 「目標 spec」所在目錄已有 `research.md` 時，詢問使用者是否覆寫；沒有時略過本步驟與下一步。
6. `CHECK` 使用者回覆：同意覆寫時進入下一步；不同意或未回覆時停止執行，不修改既有的 `research.md`。
7. `THINK` 依「研究輸入」盤點需要決策的技術主題，每項使用者技術限制與每條影響技術選型的 FR／SC 都必須歸入至少一個主題，並為每個主題列出候選方案與適用的使用者限制、需求編號及專案原則，建立「主題清單」。
8. `THINK` 盤點「主題清單」中無法依「研究輸入」收斂成單一方案的主題，包括使用者限制彼此衝突、限制與需求衝突，或候選方案的取捨取決於使用者偏好，建立「決策缺口」。
9. `DELEGATE` 「決策缺口」不為空時，委派 `clarify` Skill（無法以 Skill 工具呼叫時，讀取 `clarify` 的 `SKILL.md` 並依其 SOP 執行），以「決策缺口」為優先提問面向、不要求詳記問答紀錄，取得使用者已確認的決策並加入「研究輸入」；「決策缺口」為空時略過本步驟。

完成條件：「目標 spec」已確定並讀取，「主題清單」涵蓋每項使用者技術限制與影響技術選型的需求，「決策缺口」的每一項都已由使用者決定；或「目標 spec」不存在、無法確定，或使用者不同意覆寫，已停止執行。

## Phase 2 -- 決策並產出 research.md

1. `READ` 以 Context7 或套件官方文件，查證「主題清單」各候選方案會用到的套件與 API 的目前能力、版本與限制，建立「查證結果」。
2. `READ` 決定技術決策時，讀取 `rules/技術決策-格式規範.md` 的所有 Rule，建立「技術決策檢查清單」。
3. `THINK` 依「研究輸入」、「查證結果」與已載入的「技術決策檢查清單」，為「主題清單」的每個主題決定 `Decision`、`Rationale` 與 `Alternatives considered`。
4. `READ` `templates/research.md` 與 `templates/research.example.md`，載入骨架與範例，命名載入結果為「research 樣板組」。
5. `WRITE` 依「research 樣板組」將 `research.md` 寫入「目標 spec」所在目錄：標題填 spec.md 的功能名稱，`Feature Branch` 填該目錄名稱，`Date` 填執行當日日期；主題章節數依「主題清單」增減，編號從 1 連續，章節之間以 `---` 分隔；內文使用繁體中文，欄位名稱與技術名詞維持原文。
6. `CHECK` 逐條驗證「技術決策檢查清單」，並比對 `research.md` 與「research 樣板組」的標頭及每個主題章節的欄位順序，確認「主題清單」的每個主題都有章節；未通過時修正 `research.md` 後重新驗證，最多 3 輪，第 3 輪仍未通過時將未通過的 Rule 與章節編號記為「未通過項」。
7. `WRITE` 向使用者回報 `research.md` 路徑、每個主題的 `Decision` 摘要、經 `clarify` 由使用者決定的項目，以及「未通過項」（沒有時說明全部通過）。

完成條件：`research.md` 已寫入「目標 spec」所在目錄，「技術決策檢查清單」已通過或未通過的項目已記為「未通過項」，且已向使用者回報。
````

## 3. 差異表

### 刪除

無（新建模式）

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter | 新增 | `name: technical-research` 與 description（用途、觸發關鍵字、與 `s-specify`、`plan-with-class-diagram` 的分流） | E1 |
| Phase 1 -- 收斂研究輸入（P1-1～P1-9） | 新增 | 決定目標 spec、讀取原則文件、覆寫確認、盤點主題與決策缺口、委派 clarify | E1、E4、E5、E8、E9、E10（C6–C12、C17） |
| Phase 2 -- 決策並產出 research.md（P2-1～P2-7） | 新增 | 查證套件、載入決策規則、決策、載入樣板組、寫入、驗證、回報 | E1–E7（C1–C5、C13–C16、C18） |
| `rules/技術決策-格式規範.md` Rule 1～3 | 新增 | Rule 1：Decision 單一確定且不違反使用者限制；Rule 2：Rationale 依據可追溯；Rule 3：Alternatives 寫出名稱與捨棄原因 | E2–E5（C2–C5） |
| `LICENSE`（Skill 目錄）與根目錄 `LICENSE` 授權範圍 | 新增 | 依 `s-specify` 前例註明 Spec-Kit 衍生內容並保留 MIT 全文；待使用者確認來源後施工 | 專案 CLAUDE.md 規則 3 |

### 保留

無（新建模式）

`templates/research.md` 與 `templates/research.example.md` 已由 `artifact-to-skill-engineering` 建立並經使用者定稿，本藍圖不施工，只由 P2-4 載入（C1）。

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 2 | +2 |
| 步驟 | 0 | 16 | +16 |
| RuleFile | 0 | 1 | +1 |
| Rule | 0 | 3 | +3 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 0 | 0 | 0 |

- 新建模式，所有元素都是新增。Phase 1 對應 E8–E10 的停止與確認分支及 E4 的主題盤點；Phase 2 對應 E1–E7 的產出。
- RuleFile 只有一份：決策、依據與替代方案三項判斷都屬於「技術決策」主題，需要正反例（例如定稿時「`sharp`（或原生 EXIF 解析）」這種並列寫法）才能一致執行。
- 不建立腳本：FR／SC 編號存在與否可用 `grep` 單一命令檢查，屬於 P2-5 的驗證內容，不另建腳本包裝。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | research.md 的標頭欄位與主題章節的 `Decision`／`Rationale`／`Alternatives considered` 結構 | P2-5 | research 樣板組 | 約束整份產出檔案的結構；不需腳本計算 |
| C2 | `Decision` 只寫一個確定方案，不以「或」並列未決方案 | P2-3 | `rules/技術決策-格式規範.md` Rule 1 | 判斷「或」是並列方案還是列舉不採用的項目需要語意，腳本無法判斷；樣板只固定欄位、無法限制內容；需要正反例 |
| C3 | `Decision` 不得違反使用者的技術限制 | P2-3 | `rules/技術決策-格式規範.md` Rule 1 | 判斷是否違反限制需要語意（例如「不要第三方系統」指外部服務還是 npm 套件）；需要正反例；與 C2 同屬決策本身 |
| C4 | `Rationale` 依據可追溯：引用使用者限制、目標 spec 中存在的 FR／SC 編號或專案原則；spec 有量化目標時寫出本方案的預期數值 | P2-3 | `rules/技術決策-格式規範.md` Rule 2 | 依據是否充分需要判斷；需要正反例；屬技術決策主題 |
| C5 | `Alternatives considered` 每條以粗體寫出方案名稱與捨棄原因，原因引用 C4 同類依據；主題清單中未採用的候選方案都列入 | P2-3 | `rules/技術決策-格式規範.md` Rule 3 | 捨棄原因是否具體需要判斷；需要正反例；屬技術決策主題 |
| C6 | 決定目標 spec 的規則（指定優先，否則唯一一份） | P1-2 | P1-2 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C7 | 目標 spec 不存在或無法確定時停止 | P1-3 | SOP 流程 | 屬於分支與停止 |
| C8 | 專案原則文件的來源（使用者指定或 `constitution.md`） | P1-4 | P1-4 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C9 | 已有 research.md 時須經使用者同意才覆寫 | P1-5、P1-6 | SOP 流程 | 屬於使用者確認閘門 |
| C10 | 每項使用者技術限制與影響技術選型的 FR／SC 都歸入至少一個主題 | P1-7 | P1-7 步驟內文 | 只屬於盤點步驟，一句話即可表達；不需正反例 |
| C11 | 決策缺口的定義（限制衝突、限制與需求衝突、取決於使用者偏好） | P1-8 | P1-8 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C12 | 決策缺口不為空時委派 clarify | P1-9 | SOP 流程 | 屬於分支與委派 |
| C13 | 寫入路徑與標頭填值（功能名稱、目錄名稱、執行當日） | P2-5 | P2-5 步驟內文 | 填值來源只屬於寫入步驟；樣板只固定欄位位置 |
| C14 | 主題章節數依主題清單增減，編號從 1 連續，以 `---` 分隔 | P2-5 | P2-5 步驟內文 | 骨架已定稿、固定 5 章，不改骨架；一句話即可表達 |
| C15 | 內文繁體中文，欄位名稱與技術名詞維持原文 | P2-5 | P2-5 步驟內文 | 一句話即可表達 |
| C16 | 驗證最多 3 輪，仍未通過記為「未通過項」 | P2-6 | SOP 流程 | 屬於執行順序與停止條件 |
| C17 | 套件與 API 能力以 Context7 或官方文件查證 | P2-1 | P2-1 步驟內文 | 只屬於查證步驟，一句話即可表達；查證需要網路與判斷，不適合腳本 |
| C18 | 回報內容（路徑、Decision 摘要、clarify 決定項、未通過項） | P2-7 | P2-7 步驟內文 | 只屬於回報步驟，一句話即可表達 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/technical-research/SKILL.md` frontmatter | 建立 `name` 與 `description` | 無（只概述用途與觸發） | 已完成 |
| 2 | W2 | `skill-form-sop` | `.agents/skills/technical-research/SKILL.md` SOP | 寫入胖 SOP | C6–C18、C1 | 已完成 |
| 3 | W3 | `skill-derive-rule` | Phase 2 -- 決策並產出 research.md 的 `THINK` 決定 Decision 步驟 | 抽取 `rules/技術決策-格式規範.md`，並加入載入步驟、調整 `CHECK` 步驟 | C2–C5 | 已完成 |
| 4 | W4 | `skill-engineering` 直接撰寫 | `.agents/skills/technical-research/LICENSE` 與根目錄 `LICENSE` | 依使用者確認的來源撰寫授權說明 | 無（非 Skill 部位） | 已完成 |

### 工作項內容

#### W1：frontmatter

- `name: technical-research`
- `description`：已有 spec.md、要做技術選型研究並記錄決策時使用；從 spec 的需求與使用者的技術限制盤點技術主題，每個主題收斂成單一確定方案，寫出依據與被捨棄的替代方案，產出與 spec.md 同目錄的 research.md；限制衝突時先委派 clarify。觸發關鍵字：technical research、技術研究、技術選型、research.md、決策紀錄。分流：把功能描述寫成 spec.md 改用 `s-specify`；規劃類別設計改用 `plan-with-class-diagram`。
- 不加 `disable-model-invocation`。
- 施工註記：`skill-form-description` 觸發演練時發現使用者層級的 `research` Skill 範圍重疊，依其 Rule 3 在 description 結尾補上「只查詢單一套件用法或一般資料蒐集、不產出 research.md 時不使用此 Skill」。

#### W2：胖 SOP

Phase 1 與 To-Be SOP 的 Phase 1 全文相同（樣板組載入步驟在 Phase 2，緊接在寫入步驟之前）。Phase 2 寫成下列胖 SOP（待抽取的約束暫寫在 `THINK` 步驟內文，沒有 RuleFile 載入步驟）：

```markdown
## Phase 2 -- 決策並產出 research.md

1. `READ` 以 Context7 或套件官方文件，查證「主題清單」各候選方案會用到的套件與 API 的目前能力、版本與限制，建立「查證結果」。
2. `THINK` 依「研究輸入」與「查證結果」，為「主題清單」的每個主題決定 `Decision`、`Rationale` 與 `Alternatives considered`：`Decision` 只寫一個確定方案，不以「或」並列未決方案，且不得違反使用者的技術限制；`Rationale` 引用使用者限制、目標 spec 中存在的 FR／SC 編號或專案原則作為依據，spec 有量化目標時寫出本方案的預期數值；`Alternatives considered` 每條以粗體寫出方案名稱與捨棄原因，原因引用同類依據，主題清單中未採用的候選方案都列入。
3. `READ` `templates/research.md` 與 `templates/research.example.md`，載入骨架與範例，命名載入結果為「research 樣板組」。
4. `WRITE` （同 To-Be P2-5 全文）
5. `CHECK` 驗證步驟 2 對 `Decision`、`Rationale` 與 `Alternatives considered` 的要求，並比對 `research.md` 與「research 樣板組」的標頭及每個主題章節的欄位順序，確認「主題清單」的每個主題都有章節；未通過時修正 `research.md` 後重新驗證，最多 3 輪，第 3 輪仍未通過時將未通過的要求與章節編號記為「未通過項」。
6. `WRITE` （同 To-Be P2-7 全文）

完成條件：（同 To-Be Phase 2 完成條件）
```

#### W3：抽取 `rules/技術決策-格式規範.md`

- 目標步驟：Phase 2 -- 決策並產出 research.md 的 `THINK` 步驟（「為『主題清單』的每個主題決定 `Decision`…」）。
- Rule 1 - Decision 必須是單一確定且符合使用者限制的方案（C2、C3）。正例：Decision 寫「以 `sharp` 產生縮圖、以 `exif-reader` 解析 `DateTimeOriginal`」；反例：「採用 `sharp`（或原生 EXIF 標頭解析）」。正反例使用與 research 樣板組範例不同的情境。
- Rule 2 - Rationale 的依據必須可追溯（C4）：引用使用者限制原意、目標 spec 中存在的 FR／SC 編號或專案原則；spec 有量化目標時寫出預期數值；反例為引用 spec 不存在的編號，或只寫「效能較好」。
- Rule 3 - Alternatives considered 必須寫出名稱與具體捨棄原因（C5）：每條粗體方案名稱加捨棄原因，原因引用同類依據；未採用的候選方案都列入。
- 施工註記：工作項同時要求「正反例使用與 research 樣板組範例不同的情境」，正例文字卻以 `sharp`／`exif-reader` 舉例；施工依前者，以球場預約系統情境示範同一種寫法，避免 RuleFile 與樣板組範例重複情境。
- After：To-Be P2-2 插入載入步驟；P2-3 改為依已載入的「技術決策檢查清單」決策，刪除內文中的約束；P2-6 改為「逐條驗證『技術決策檢查清單』」，「未通過的要求」改為「未通過的 Rule」；完成條件改為引用「技術決策檢查清單」。施工後 SOP 必須與第 2 節 To-Be SOP 一致。

#### W4：授權說明

- 使用者確認範例來自 Spec-Kit 的產出時：在 `.agents/skills/technical-research/LICENSE` 依 `s-specify/LICENSE` 前例，註明 `templates/research.md` 與 `templates/research.example.md` 的 research.md 段落結構（Decision／Rationale／Alternatives considered）與照片相簿範例情境衍生自 GitHub Spec Kit（MIT，Copyright GitHub, Inc.），SOP 與 RuleFile 為重新撰寫，並保留 MIT 全文；根目錄 `LICENSE` 的「授權範圍」新增一條列出 `technical-research`。
- 使用者表示範例為自行撰寫時：不建立 LICENSE，根目錄 `LICENSE` 不修改（屬「之後在本 repo 新建的自建 Skill」）。

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1–E7 | 本次 | 暫存專案含 `specs/002-expense-tracker/spec.md`（個人記帳，含 FR-001～FR-006、SC-001～SC-003）。輸入：「specs/002-expense-tracker/spec.md 寫好了，幫我做技術研究。前端用 Vue 3 + Vite，後端用 Python FastAPI，資料庫用 SQLite，要能匯出 CSV，部署在一台 VPS，不使用雲端託管服務。」 | clarify 提問時回覆「照你的建議」 | `specs/002-expense-tracker/research.md` 存在；標頭四欄符合 E1；章節編號從 1 連續且無 `{{`；每章三個欄位依序出現；Decision 沒有以「或」並列方案；每章 Alternatives 至少一條粗體名稱加原因；Vue 3、Vite、FastAPI、SQLite、CSV 匯出、VPS 部署都在 Decision 中，沒有採用雲端託管；引用的 FR／SC 編號都能在 spec.md 找到；抽查 Decision 中的套件能力宣稱與官方文件一致 |
| S2 | E8 | 本次 | 暫存專案沒有 `specs/` 目錄。輸入：「幫我做技術研究，前端用 React、後端用 Go。」 | 無 | 回覆要求先產出 spec.md（提到 `s-specify`）；專案中沒有新增任何 research.md |
| S3 | E9 | 本次 | 暫存專案含 `specs/002-expense-tracker/spec.md` 與既有 `research.md`（記錄雜湊）。輸入同 S1 | 詢問是否覆寫時回覆「不要覆寫」 | 有詢問是否覆寫；`research.md` 雜湊與執行前相同 |
| S4 | E10 | 本次 | 暫存專案同 S1。輸入：「幫我為 specs/002-expense-tracker 做技術研究。不要安裝任何第三方套件，後端用 FastAPI，資料庫 SQLite。」 | clarify 提問時回覆「FastAPI 可以用，其他套件越少越好」 | 寫入 research.md 前有針對「不裝第三方套件」與 FastAPI 的衝突提問；後端主題的 Decision 採用 FastAPI，Rationale 反映使用者的回答 |

## 8. 驗收結果

- 結構診斷：`technical-research` 為 0 個 error、0 個 warning；RuleFile 由 P2-2 載入，樣板組由 P2-4 載入。
- 同步：`./scripts/sync-skills.sh --from agents` 後 `--check` 為「兩邊一致」；沒有只存在於目標端、未被刪除的 Skill。
- To-Be 一致性：施工後 `SKILL.md` 的 `# SOP` 與第 2 節 To-Be SOP 逐字相同；範例雜湊仍為 `e7a0f50a579873a51e0cd3e619ac327ec683d16f908dee8d018621560f9ff5b9`。
- 驗收方式：四個情境各在含本次未提交修改的暫存專案複本（`git init` 後記錄乾淨狀態與 spec／research 雜湊）中，由不帶本次分析脈絡的子代理實際執行；子代理只取得 Skill 路徑、專案根目錄、情境輸入與預先回覆。產出另以命令檢查標頭、章節編號、填位符號、欄位數、FR／SC 編號存在與否及 Decision 中的「或」。
- S1 通過：產出 `specs/002-expense-tracker/research.md`，標頭四欄正確，7 個主題章節編號 1～7 連續、無 `{{`，每章三個欄位各一次；Vue 3、Vite、FastAPI、SQLite、CSV 匯出、單台 VPS 都在 Decision 中，雲端託管列為被捨棄的方案；引用的 FR-001～006、SC-001～003 都存在於 spec；Decision 不含「或」；每條 Alternatives 都有粗體名稱與捨棄原因；子代理以 Context7 查證 FastAPI、SQLAlchemy、Caddy、Vite、Alembic 等 10 個套件，抽查 `utf-8-sig` BOM、`SessionMiddleware` 預設 2 週等描述與文件一致。clarify 提問 1 題（HTTPS 連線方式），預先回覆後繼續。自我檢查第 1 輪抓到主題 1 的「20.19+ 或 22.12+」與主題 3 缺少目標比較，第 2 輪修正後通過。
- S2 通過：停在 P1-3，告知需先產出 spec.md 並提到 `s-specify`；`git status --short` 為空。
- S3 通過：在 P1-5 詢問是否覆寫，收到「不要覆寫」後於 P1-6 停止；`research.md` 雜湊 `b7985d30…` 與執行前相同，`git status --short` 為空。
- S4 通過：寫入任何檔案前，clarify 針對「不要安裝任何第三方套件」與 FastAPI 的衝突提問；主題 1 的 Decision 採用 FastAPI（加執行必需的 Uvicorn），Rationale 寫出使用者回答與採用的解讀，其餘功能改用標準函式庫。7 個主題、引用編號都存在；唯一含「或」的 Decision（主題 5「類型輸出為『收入』或『支出』」）是列舉欄位值，不是並列方案。
- 約束分配：C1–C18 各只出現在指定的存放位置；P2-3 只引用「技術決策檢查清單」，不重述 Rule 內容。
- 個案驗收條件：無。
- 子代理回報的觀察（未修改 Skill）：clarify 交還呼叫者時的「已確認決策／剩餘風險」摘要也會顯示給使用者，SOP 沒有說明這段算不算對使用者的展示；目前不影響任何驗收條件，留給使用者決定是否處理。

### 施工差異紀錄

- W2（`skill-form-sop`）回報：原 To-Be P1-7 在 Phase 1 載入「research 樣板組」，但第一個使用它的步驟是 Phase 2 的寫入步驟，違反 `SOP-按需載入-格式規範.md` Rule 1（載入步驟須與第一個依賴步驟同 Phase 且相鄰）。W2 停止，W1 已完成。
- 重新設計：樣板組載入步驟移到 Phase 2，緊接在寫入步驟之前（To-Be P2-4）；Phase 1 改為 9 步、Phase 2 改為 7 步，總步驟數不變；約束與工作項的步驟編號隨之更新，約束內容不變。

### 使用者實際驗證（2026-10-24）

- 方式：在暫存專案（`.claude/skills/` 放入本次施工版的 `technical-research` 與 `clarify`，`specs/002-expense-tracker/spec.md` 沿用 S1 的個人記帳本 spec）以 Herdr 開新 pane 啟動 Claude Code，輸入使用者選定的需求「specs/002-expense-tracker/spec.md 寫好了，幫我做技術研究。前端用 React，後端用 Node.js，資料庫用 PostgreSQL，部署用 Docker，套件越少越好。」；`clarify` 提問由使用者親自回答，執行者代為輸入並讀取結果。
- 權限處理：資料夾信任與讀取 clarify 規則的確認由執行者選 Yes；之後執行者以迴圈自動選第 2 個選項，除 Context7 外也放行了 Web Search、讀取 github.com，並把該測試 session 切到 auto mode。範圍僅限暫存專案與該 session，已向使用者揭露。
- 結果：`clarify` 在寫檔前問 2 題（後端「套件越少越好」的嚴格程度、JavaScript 或 TypeScript），使用者選「寬鬆版：允許 Express」與「JavaScript」；產出 `research.md` 共 11 個主題，React 19、Node.js 24 LTS、PostgreSQL、Docker、Express 5、JavaScript 都在 Decision 中，正式環境依賴只有 `express` 與 `postgres`；標頭正確、章節 1～11 連續、三個欄位齊全、Alternatives 皆有粗體名稱、引用的 FR-001～006 與 SC-001～003 都存在；唯一的 `{{` 是 JSX `style={{ … }}`，Decision 中的「或」都是列舉或條件。版本號由測試 session 查證，執行者未逐一複核。
- 結論：使用者確認驗證通過，移除 `description` 開頭的「（未驗證）」，其餘文字不變。測試專案、S1–S4 的暫存專案與測試用 pane 已移除。
