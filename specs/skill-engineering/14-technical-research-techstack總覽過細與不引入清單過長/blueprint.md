# 工程藍圖：technical-research－techstack總覽過細與不引入清單過長

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/14-technical-research-techstack總覽過細與不引入清單過長/`
- 根因報告：`specs/skill-engineering/14-technical-research-techstack總覽過細與不引入清單過長/rca-report.md`（使用者回覆「同意」）
- 確認紀錄：使用者於 Phase 4 回覆「確認」：確認藍圖全部內容，包括 E1～E18（推定的 E16 已於根因報告確認）、第 2 節 Rule 1～4 清單、W1 的範例設計，以及 S1、S5 實跑、S2～S4 逐步演練的驗收方式

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | research.md 寫在目標 spec.md 的同一個目錄，結構符合 research 樣板組：標題為「技術研究與決策紀錄 (Research): <功能名稱>」，`Feature Branch` 為該目錄名稱，`Date` 為執行當日，`Spec` 連結為 `./spec.md`，每個主題章節依序包含 `Decision`、`Rationale`、`Alternatives considered` | 既有 | 通用 |
| E2 | 每個主題的 `Decision` 只寫一個確定方案，不以「或」並列未決定的方案 | 既有 | 通用 |
| E3 | 每個主題的 `Alternatives considered` 至少一條，每條以粗體寫出方案名稱並寫出捨棄原因；被捨棄的方案不出現在 `Decision` | 既有 | 通用 |
| E4 | 使用者輸入中的每項技術限制都被某個主題的 `Decision` 採納，沒有任何 `Decision` 違反使用者的技術限制 | 既有 | 通用 |
| E5 | `Rationale` 與 `Alternatives considered` 引用的 FR／SC 編號都存在於目標 spec.md | 既有 | 通用 |
| E6 | `Decision` 與 `Rationale` 對套件或 API 能力的描述，與該套件目前的官方文件一致 | 既有 | 通用 |
| E7 | 主題章節數依實際需要決策的主題決定，編號從 1 連續，沒有空章節，也沒有殘留的填位符號 | 既有 | 通用 |
| E8 | 找不到 spec.md 時停止執行，不建立 research.md 與 techstack.md，並告知使用者先產出 spec.md | 既有 | 通用 |
| E9 | 目標目錄已有 research.md 或 techstack.md 時，使用者未同意前兩份檔案都不覆寫 | 既有 | 通用 |
| E10 | 使用者的技術限制彼此衝突時，先向使用者提問再決策，相關主題的 `Decision` 採用使用者的回答 | 既有 | 通用 |
| E11 | techstack.md 寫在 research.md 的同一個目錄，結構符合 techstack 樣板組：標題為「技術堆疊 (Tech Stack): <功能名稱>」，標頭依序為 `Feature Branch`、`Date`、`Spec`（`./spec.md`）、`Research`（`./research.md`），之後依序只有「技術堆疊總覽」（分層、角色、採用技術、決策來源四欄）與「本次開發不引入的技術」（技術類別、代表技術、決策來源三欄）兩個段落，沒有架構摘要或其他段落；沒有殘留的填位符號，回報時列出 techstack.md 路徑 | 既有＋本次 | 通用 |
| E12 | 「技術堆疊總覽」每一列代表一個系統角色，同一角色用到的技術寫在同一格，同一個角色不拆成多列；採用技術格中的每個技術都出現在 research.md 某個主題的 `Decision` 中，決策來源欄以 `research §<主題編號>` 列出該列所有技術出自的主題；research.md 各 `Decision` 採用、需要選用的語言、平台、框架、套件、服務、資料儲存與工具都出現在某一列；只決定設計或實作方式、沒有引入技術的決策不列 | 既有＋本次 | 通用 |
| E13 | 角色欄只寫該列在系統中負責的部分，不寫採用理由、不引用 FR／SC，也不描述各技術在什麼時候使用；版本寫在技術名稱之後，只寫 research.md 明確指定的版本或版本下限並照其寫法，research.md 沒有指定時不寫版本 | 既有＋本次 | 通用 |
| E14 | 「本次開發不引入的技術」每一列都是「整類不用」的排除：該技術類別在總覽中沒有任何技術屬於它，代表技術都出自決策來源所指主題的 `Alternatives considered`；同類之中選了別家、實作或寫法的取捨與自行撰寫的替代方案都不列；不寫不引入的原因 | 本次 | 通用 |
| E15 | 「分層」依本次專案的實際架構命名，不列專案沒有的分層，同一分層的列相鄰排列 | 既有 | 通用 |
| E16 | 沒有任何可列的「整類不用」排除時，「本次開發不引入的技術」段落保留標題，以一句「本次沒有整類不引入的技術。」取代表格 | 既有＋推定（已確認） | 通用 |
| E17 | 使用者提到 techstack.md、技術堆疊時會觸發 `technical-research` | 既有 | 通用 |
| E18 | 平台內建的功能（瀏覽器 API、Node.js 內建模組與命令列旗標、程式語言標準函式庫的模組、CSS 功能等不需另外選用或安裝的能力）不出現在總覽的任何一格；平台本身照 E12 列出 | 本次 | 通用 |

## 2. To-Be SOP

To-Be 的 `SKILL.md` 與 As-Is 逐字相同（本次不修改 frontmatter 與 SOP）：

````markdown
---
name: technical-research
description: 已有 spec.md、要做技術選型研究並記錄決策時使用：從 spec 的需求與使用者的技術限制盤點需要決策的技術主題，每個主題收斂成單一確定方案，寫出依據與被捨棄的替代方案，產出與 spec.md 同目錄的 research.md，再把採用與不引入的技術整理成同目錄的 techstack.md 技術堆疊總覽；技術限制互相衝突時會先委派 clarify 詢問使用者。使用者提到 technical research、research.md、techstack.md、技術研究、技術選型、技術堆疊、選框架、選資料庫、決策紀錄時使用。只需把功能描述寫成 spec.md 時改用 s-specify；要規劃類別、先畫類別圖再寫程式時改用 plan-with-class-diagram；只查詢單一套件用法或一般資料蒐集、不產出 research.md 時不使用此 Skill。
---

# SOP

## Phase 1 -- 收斂研究輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「研究輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及使用者指定的專案原則文件或專案中名為 `constitution.md` 的檔案（都沒有時視為空），加入「研究輸入」。
5. `WRITE` 「目標 spec」所在目錄已有 `research.md` 或 `techstack.md` 時，詢問使用者是否覆寫；兩份都沒有時略過本步驟與下一步。
6. `CHECK` 使用者回覆：同意覆寫時進入下一步；不同意或未回覆時停止執行，不修改既有的 `research.md` 與 `techstack.md`。
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

完成條件：`research.md` 已寫入「目標 spec」所在目錄，且「技術決策檢查清單」已通過或未通過的項目已記為「未通過項」。

## Phase 3 -- 整理並產出 techstack.md

1. `READ` 整理技術堆疊時，讀取 `rules/技術堆疊-格式規範.md` 的所有 Rule，建立「技術堆疊檢查清單」。
2. `THINK` 依已寫入的 `research.md` 與已載入的「技術堆疊檢查清單」，決定「技術堆疊總覽」與「本次開發不引入的技術」的每一列。
3. `READ` `templates/techstack.md` 與 `templates/techstack.example.md`，載入骨架與範例，命名載入結果為「techstack 樣板組」。
4. `WRITE` 依「techstack 樣板組」將 `techstack.md` 寫入「目標 spec」所在目錄：標題、`Feature Branch` 與 `Date` 填入與 `research.md` 相同的值。
5. `CHECK` 逐條驗證「技術堆疊檢查清單」，並比對 `techstack.md` 與「techstack 樣板組」的標頭、段落順序與表格欄位；未通過時修正 `techstack.md` 後重新驗證，最多 3 輪，第 3 輪仍未通過時將未通過的 Rule 記為「未通過項」。
6. `WRITE` 向使用者回報 `research.md` 與 `techstack.md` 的路徑、每個主題的 `Decision` 摘要、經 `clarify` 由使用者決定的項目，以及「未通過項」（沒有時說明全部通過）。

完成條件：`techstack.md` 已寫入「目標 spec」所在目錄，「技術堆疊檢查清單」已通過或未通過的項目已記為「未通過項」，且已向使用者回報。
````

`rules/技術堆疊-格式規範.md`（改寫，由 W1 施工）的 Rule 清單：

- Rule 1 - 總覽每一列代表一個系統角色
  - 「技術堆疊總覽」每一列必須代表本次系統中的一個角色，也就是系統負責的一塊工作（例如 HTTP API、資料庫、端對端測試）。
  - 同一角色用到的技術必須寫在同一格，以「、」分隔；同一角色不得拆成多列。
  - 採用技術格中的每個技術都必須出現在 research.md 某個主題的 `Decision` 中。
  - 決策來源欄必須以 `research §<主題編號>` 列出該列所有技術出自的主題，多個主題以「、」並列（例如 `research §1、§2`）。
  - research.md 各 `Decision` 採用、需要選用的語言、平台、框架、套件、服務、資料儲存與工具，都必須出現在某一列。
  - 平台內建的功能（瀏覽器 API、Node.js 內建模組與命令列旗標、程式語言標準函式庫的模組、CSS 功能等不需另外選用或安裝的能力）不得出現在任何一格；平台本身（例如原生 JavaScript、Node.js、Python）依前一條列出。
  - 只決定設計或實作方式、沒有引入技術的內容（例如資料表欄位、排序策略、API 端點）不得列入。
- Rule 2 - 角色與版本只寫事實
  - 角色欄必須只寫該列在系統中負責的部分。
  - 角色欄不得寫採用理由，不得引用 FR／SC 編號，也不得出現「以符合」、「因為」等理由句。
  - 角色欄不得描述各技術在什麼時候使用或如何分工。
  - 版本必須寫在採用技術格的技術名稱之後，只寫 research.md 明確指定的版本或版本下限，並照 research.md 的寫法。
  - research.md 沒有指定版本時，不得寫版本，也不得依查證結果或自行判斷補上版本。
- Rule 3 - 分層依專案實際架構命名（條列不變）
  - 分層名稱必須依本次專案實際具備的架構部分命名。
  - 不得列出專案沒有的分層。
  - 同一分層的列必須相鄰排列。
- Rule 4 - 不引入清單只列整類不用的技術類別
  - 「本次開發不引入的技術」每一列必須是一個技術類別（例如前端框架、雲端儲存服務、ORM、訊息佇列），且「技術堆疊總覽」中沒有任何技術屬於該類別。
  - 代表技術欄必須只列 research.md 中屬於該類別、被捨棄的具名技術，且每個都出自決策來源所指主題的 `Alternatives considered`。
  - 決策來源欄必須以 `research §<主題編號>` 指向代表技術所在的主題，多個主題以「、」並列。
  - 代表技術採用後會承擔總覽某一列的角色、取代該列的採用技術時（例如已採用 Vitest 時的 Jest、已採用 Caddy 時的 Nginx），屬於總覽已採用的同類技術，不論技術類別如何命名，都不得列入。
  - 實作或寫法的取捨（例如分頁方式、欄位型別、排序演算法、資料格式、部署寫法）與自行撰寫同樣功能的替代方案不得列入。
  - 不得寫不引入的原因、比較或替代方案的說明。
  - 沒有可列的技術類別時，必須保留段落標題，並以一句「本次沒有整類不引入的技術。」取代表格。

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| Rule 1 第 1、2 條（以單一技術為列的單位、同一技術跨主題合併為一列） | `rules/技術堆疊-格式規範.md` | 表達的「一列一技術」與 E12 矛盾（R1）；由改寫後的 Rule 1 第 1～4 條取代 |
| Rule 2 第 1、4 條的「用途欄」「版本欄寫 `—`」 | 同上 | 定稿樣板已無用途欄與版本欄（R3）；由改寫後的 Rule 2 取代 |
| Rule 4 第 1、4 條（收錄所有具名替代方案、原因寫一句摘要） | 同上 | 與 E14 矛盾（R2）；由改寫後的 Rule 4 取代 |
| Rule 1～4 的 Good／Bad Example 中的舊表格 | 同上 | 使用舊的五欄與含「不引入原因」的三欄，與定稿樣板衝突（R3）；改寫為新欄位的範例 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| `rules/技術堆疊-格式規範.md` Rule 1 | 修改 | 標題改為「總覽每一列代表一個系統角色」；條列改為第 2 節 Rule 1；新增平台內建功能不列的條列；正反例改用角色列 | R1、R3、E12、E18；C20、C26 |
| `rules/技術堆疊-格式規範.md` Rule 2 | 修改 | 標題改為「角色與版本只寫事實」；條列改為第 2 節 Rule 2；正反例改用新欄位 | R3、E13；C21 |
| `rules/技術堆疊-格式規範.md` Rule 3 | 修改 | 條列不變；正反例改用新欄位，命令列分層改用第三方套件示範（標準函式庫模組依 Rule 1 不列） | R3、E15；C22 |
| `rules/技術堆疊-格式規範.md` Rule 4 | 修改 | 標題改為「不引入清單只列整類不用的技術類別」；條列改為第 2 節 Rule 4；空清單句子改為「本次沒有整類不引入的技術。」；正反例改用技術類別／代表技術 | R2、R3、E14、E16；C23 |
| `rules/技術堆疊-格式規範.md` Rule 4 第 4 條與 Bad Example 3（第二輪） | 修改 | 同類判斷改為「代表技術是否會承擔總覽某一列的角色」，不論類別如何命名；新增 Bad Example 3（Caddy 與改稱「網頁伺服器」的 Nginx） | R4、E14；C23 |
| techstack 樣板組 `templates/techstack.md` 與 `.example.md` | 修改（已完成） | 由 `artifact-to-skill-engineering` Phase 2～3 經使用者定稿並倒抽骨架（範例雜湊 `4a2939a1…93cc`），本藍圖不施工 | E11；C19 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter `name` 與 `description` | 觸發、E17 | 無（只概述用途與觸發） |
| Phase 1～3 的標題與完成條件 | Phase 1：E4、E8～E10；Phase 2：E1～E7；Phase 3：E11～E16、E18 | 無（只組織步驟、概述結果） |
| P1-1、P1-4 | E1、E4、E5 | C8 |
| P1-2、P1-3 | E8 | C6、C7 |
| P1-5、P1-6 | E9 | C9 |
| P1-7～P1-9 | E4、E10 | C10～C12 |
| P2-1～P2-6 | E1～E7 | C13～C17 |
| P3-1 `READ` 載入技術堆疊規則 | E12～E16、E18 | 引用 C20～C23、C26 的載入結果 |
| P3-2 `THINK` 決定兩張表的每一列 | E12～E16、E18 | 引用載入結果，不重述約束 |
| P3-3 `READ` 載入 techstack 樣板組 | E11 | C19 的載入結果 |
| P3-4 `WRITE` 寫入 techstack.md | E11 | C24 |
| P3-5 `CHECK` 驗證 techstack.md | E11～E16、E18 | C25 |
| P3-6 `WRITE` 回報 | E11 | C18 |
| `rules/技術決策-格式規範.md` Rule 1～3 | E2～E5 | C2～C5 |
| `rules/技術堆疊-格式規範.md` Rule 3 條列 | E15 | C22 |
| research 樣板組 `templates/research.md` 與 `.example.md` | E1 | C1；範例示範 C2～C5，不與存放位置矛盾 |
| `LICENSE`（Skill 目錄） | 專案 CLAUDE.md 規則 3 | 無（techstack 範例仍沿用照片相簿情境，由 research 範例整理而成，敘述仍正確） |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 21 | 21 | 0 |
| RuleFile | 2 | 2 | 0 |
| Rule | 7 | 7 | 0 |
| 樣板組 | 2 | 2 | 0 |
| 腳本 | 0 | 0 | 0 |

- 內容增減：`rules/技術堆疊-格式規範.md` Rule 1、2、4 的條列改寫（刪除舊取材方式，改為角色列與整類不用），Rule 1 新增一條平台內建功能不列的條列（E18）；Rule 1～4 的範例全部改用新欄位。
- Rule 1 新增條列而非新增 Rule：
  - 刪除、改寫：As-Is 沒有任何條列談內建功能，無法只靠改寫表達。
  - 改換存放位置：E18 沒有既有位置。
  - 新增：「哪些東西進總覽」是 Rule 1 的同一主題，放在 Rule 1 的條列中，與「需要選用的技術都要有列」並排，才能看出平台本身要列、平台內建功能不列的界線；不另開 Rule。
- 腳本維持 0：判斷某技術是不是平台內建、某類別在總覽中是否已有技術屬於它，都需要語意判斷，無法以程式比對。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | research.md 的標頭欄位與主題章節結構（不變） | P2-5 | research 樣板組 | 約束整份產出檔案的結構 |
| C2 | `Decision` 只寫一個確定方案（不變） | P2-3 | `rules/技術決策-格式規範.md` Rule 1 | 需要語意判斷與正反例 |
| C3 | `Decision` 不得違反使用者的技術限制（不變） | P2-3 | `rules/技術決策-格式規範.md` Rule 1 | 需要語意判斷與正反例 |
| C4 | `Rationale` 依據可追溯（不變） | P2-3 | `rules/技術決策-格式規範.md` Rule 2 | 需要判斷與正反例 |
| C5 | `Alternatives considered` 名稱與捨棄原因（不變） | P2-3 | `rules/技術決策-格式規範.md` Rule 3 | 需要判斷與正反例 |
| C6 | 決定目標 spec 的規則（不變） | P1-2 | P1-2 步驟內文 | 單一步驟一句話 |
| C7 | 目標 spec 不存在或無法確定時停止（不變） | P1-3 | SOP 流程 | 分支與停止 |
| C8 | 專案原則文件的來源（不變） | P1-4 | P1-4 步驟內文 | 單一步驟一句話 |
| C9 | 已有 research.md 或 techstack.md 時須經使用者同意才覆寫，不同意時兩份都不修改（不變） | P1-5、P1-6 | SOP 流程 | 使用者確認閘門 |
| C10 | 每項使用者技術限制與影響技術選型的 FR／SC 都歸入主題（不變） | P1-7 | P1-7 步驟內文 | 單一步驟一句話 |
| C11 | 決策缺口的定義（不變） | P1-8 | P1-8 步驟內文 | 單一步驟一句話 |
| C12 | 決策缺口不為空時委派 clarify（不變） | P1-9 | SOP 流程 | 分支與委派 |
| C13 | research.md 寫入路徑與標頭填值（不變） | P2-5 | P2-5 步驟內文 | 填值來源只屬於寫入步驟 |
| C14 | 主題章節數、編號與分隔（不變） | P2-5 | P2-5 步驟內文 | 骨架已定稿，一句話即可表達 |
| C15 | research.md 內文語言（不變） | P2-5 | P2-5 步驟內文 | 一句話即可表達 |
| C16 | research.md 驗證最多 3 輪（不變） | P2-6 | SOP 流程 | 執行順序與停止條件 |
| C17 | 套件與 API 能力以 Context7 或官方文件查證（不變） | P2-1 | P2-1 步驟內文 | 單一步驟一句話 |
| C18 | 回報內容（兩份檔案路徑、Decision 摘要、clarify 決定項、未通過項）（不變） | P3-6 | P3-6 步驟內文 | 只屬於回報步驟，一句話即可表達 |
| C19 | techstack.md 的標題、標頭四欄、兩個段落，以及總覽四欄（分層、角色、採用技術、決策來源）與不引入清單三欄（技術類別、代表技術、決策來源）（修改：欄位改變） | P3-4 | techstack 樣板組 | 約束整份產出檔案的結構；樣板組已定稿 |
| C20 | 總覽一列一個角色、同角色技術同一格、採用技術取自 Decision、決策來源列出所有出處主題、需要選用的技術都有列、設計決策不列（修改：列的單位改為角色） | P3-2 | `rules/技術堆疊-格式規範.md` Rule 1 | 判斷哪些技術屬於同一角色需要語意，腳本無法判斷；骨架以區塊填位符號產生列，樣板無法逐列保證；需要正反例 |
| C21 | 角色欄不寫理由與使用時機、版本寫在技術名稱後且只照 research.md 指定（修改：用途欄改為角色欄、版本欄移入採用技術格） | P3-2 | `rules/技術堆疊-格式規範.md` Rule 2 | 判斷一句話是角色還是理由需要語意；版本是否「明確指定」需要對照 research.md 的寫法；需要正反例 |
| C22 | 分層依專案實際架構命名、不列不存在的分層、同層相鄰（不變；範例改用新欄位） | P3-2 | `rules/技術堆疊-格式規範.md` Rule 3 | 分層命名需要依專案判斷；需要不同專案型態的正反例 |
| C23 | 不引入清單只列總覽中沒有任何技術屬於它的技術類別、代表技術取自 Alternatives、排除同類競品／實作取捨／自行撰寫、不寫原因、空清單寫「本次沒有整類不引入的技術。」（修改：收錄標準改為整類不用） | P3-2 | `rules/技術堆疊-格式規範.md` Rule 4 | 判斷替代方案屬於哪一類、該類是否已被採用需要語意；需要正反例；空清單的寫法屬同一張表的取材結果，集中於本 Rule |
| C24 | techstack.md 寫入路徑，以及標題、`Feature Branch`、`Date` 與 research.md 相同（不變） | P3-4 | P3-4 步驟內文 | 填值來源只屬於寫入步驟，一句話即可表達 |
| C25 | techstack.md 驗證最多 3 輪，仍未通過記為「未通過項」（不變） | P3-5 | SOP 流程 | 執行順序與停止條件 |
| C26 | 平台內建功能不出現在總覽任何一格，平台本身照列（新增） | P3-2 | `rules/技術堆疊-格式規範.md` Rule 1 | 判斷是否為平台內建需要語意；與 C20 同屬「哪些東西進總覽」的取材主題，放在同一條 Rule 才能看出界線；需要正反例 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-rule` | `.agents/skills/technical-research/rules/技術堆疊-格式規範.md` | 改寫 Rule 1～4 的條列與正反例，不改變載入步驟 | C20～C23、C26 | 已完成 |
| 2 | W2 | `skill-form-rule` | 同上 | 第二輪：改寫 Rule 4 第 4 條，新增 Bad Example 3，不改變載入步驟 | C23 | 已完成 |

### 工作項內容

#### W1：改寫 `rules/技術堆疊-格式規範.md`

- 施工類型：修改既有部位內容，不改變載入步驟（P3-1 已載入本檔，P3-2、P3-5 引用「技術堆疊檢查清單」，都不修改）。
- Rule 標題與條列逐字照第 2 節 Rule 清單。
- 正反例沿用既有的球場預約系統情境（PostgreSQL 16、FastAPI 等），不得使用照片相簿情境；表格欄位必須與定稿樣板相同（總覽四欄、不引入清單三欄）。每組先列出相關的 research.md 片段，再列出 techstack.md 片段：
  - Rule 1 正例：research §1 的 `Decision` 採用 Python 3.12 以上、FastAPI、Uvicorn、PostgreSQL 16、`psycopg` 3，並以標準函式庫 `zoneinfo` 處理時區；§2 以 PostgreSQL 的排除約束搭配 `tstzrange` 欄位。總覽中 FastAPI 與 Uvicorn 同列「HTTP API」，PostgreSQL 與 `psycopg` 同列並以 `research §1、§2` 列出來源；`zoneinfo` 與 `tstzrange` 不列。
  - Rule 1 反例：FastAPI、Uvicorn 拆成兩列；PostgreSQL 依主題拆成兩列；`zoneinfo` 與 `tstzrange` 各列一列。
  - Rule 2 正例：版本照 research 寫法（`Python 3.12 以上`、`PostgreSQL 16`），FastAPI 沒有指定版本就不寫；角色欄只寫負責的部分。
  - Rule 2 反例：FastAPI 寫出 research 沒有指定的版本，沒有版本的技術寫 `—`；角色欄寫「以排除約束滿足 FR-003 的防重複預約」與「FastAPI 處理請求、Uvicorn 在部署時啟動服務」。
  - Rule 3 正例：球場預約的每日對帳命令列工具，分層只有執行環境、命令列、資料儲存、品質與測試，命令列兩列（例如 Typer 負責指令與參數、Rich 負責終端機報表）相鄰；不得用標準函式庫模組示範（依 Rule 1 不列）。反例：照抄「前端」「後端」空層，兩個命令列的列被資料儲存隔開。
  - Rule 4 Good Example 1：research §1 捨棄 Django（總覽已採用 FastAPI，同類 Web 框架）與 Firebase Realtime Database；§2 捨棄 Redis 分散式鎖、應用層先查詢再寫入、自行撰寫時段比對函式。清單只列「雲端資料庫服務｜Firebase Realtime Database｜research §1」與「分散式鎖服務｜Redis｜research §2」，說明 Django、應用層先查詢再寫入、自行撰寫函式為何不列。
  - Rule 4 Good Example 2：每日對帳工具的 research.md 只捨棄 Click（總覽已採用同類的 Typer）與自行解析 `sys.argv`；段落保留標題，以「本次沒有整類不引入的技術。」取代表格。
  - Rule 4 Bad Example 1：同一份球場預約 research.md，清單列入 Django 與「應用層先查詢再寫入」，並在代表技術後加上不引入原因。
  - Rule 4 Bad Example 2：同一個對帳工具，沒有可列的類別時留下只有表頭的空表格。
- 施工時依 `skill-form-rule` 的 `rules/RuleFile-格式規範.md` 檢查；條列或範例需要調整才能符合時，回報差異而不自行改寫第 2 節 Rule 清單。

## 7. 驗收情境

測試環境：每個實跑情境各建一個暫存專案（`git init` 後提交），`.claude/skills/` 放入施工後的 `technical-research` 與 `clarify`，記錄執行前的 `git status` 與相關檔案雜湊。

- `specs/002-expense-tracker/spec.md`：個人記帳本，含 FR-001～FR-006（記帳、分類、月度統計、圖表、帳號登入、CSV 匯出）、SC-001～SC-003；內容依紀錄 12、13 的同名 spec 重建。
- `specs/003-log-summary-cli/spec.md`：命令列工具，讀取伺服器存取日誌檔、輸出每小時請求數與錯誤率摘要，可輸出成 CSV；含 FR-001～FR-005、SC-001～SC-002（SC-001：100 MB 日誌 10 秒內完成）；沒有任何畫面或伺服器。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E7、E11～E14、E17、E18 | 本次（原始輸入） | 專案含 002。輸入：「specs/002-expense-tracker/spec.md 寫好了，幫我做技術研究並整理技術堆疊。前端用 React，後端用 Node.js，資料庫用 PostgreSQL，部署用 Docker，套件越少越好。」 | clarify 提問時回覆「照你的建議」 | research.md 符合 E1～E7（結構、`Decision` 不含「或」、Alternatives 粗體名稱、FR／SC 存在）；techstack.md 標頭與兩個段落符合樣板，總覽為「分層｜角色｜採用技術｜決策來源」、不引入為「技術類別｜代表技術｜決策來源」，無 `{{`、無其他段落；總覽沒有兩列的角色相同；採用技術格中的每個技術都能在所列 `research §N` 的 `Decision` 找到；React、Node.js、PostgreSQL、Docker 都出現在某一列；`Intl`、`fetch`、`--env-file`、CSS 功能等平台內建功能都不出現；角色欄沒有 FR／SC 編號與「因為」「以符合」；版本都能在 research.md 找到，沒有 `—`；不引入清單的每個技術類別在總覽中都沒有屬於它的技術，代表技術都在所列主題的 `Alternatives considered` 中；沒有分頁、欄位型別、資料格式、部署寫法等實作取捨；沒有原因欄；回報列出兩份檔案路徑 |
| S2 | E8 | 回歸（逐步演練） | 暫存專案沒有 `specs/` 目錄。輸入：「幫我做技術研究並整理技術堆疊，前端用 React、後端用 Go。」 | 無 | P1-1～P1-3 本次未修改，紀錄 13 S2 已實跑通過；逐步演練確認停在 P1-3、不寫任何檔案 |
| S3 | E9 | 回歸（逐步演練） | 專案含 002 與既有的 `techstack.md`，沒有 research.md。輸入同 S1 | 詢問是否覆寫時回覆「不要覆寫」 | P1-5、P1-6 本次未修改，紀錄 13 S3 已實跑通過；逐步演練確認在 P1-6 停止、不修改 techstack.md |
| S4 | E10 | 回歸（逐步演練） | 專案含 002。輸入：「幫我為 specs/002-expense-tracker 做技術研究。不要安裝任何第三方套件，後端用 FastAPI，資料庫 SQLite。」 | clarify 提問時回覆「FastAPI 可以用，其他套件越少越好」 | P1-7～P1-9 與 Phase 2 本次未修改，紀錄 12 S4 已實跑通過；逐步演練確認 Phase 3 只讀取已寫入的 research.md |
| S5 | E11～E16、E18 | 本次 | 專案含 003。輸入：「幫我為 specs/003-log-summary-cli 做技術研究並整理技術堆疊。用 Python 3.12，只用標準函式庫，打包成單一指令。」 | clarify 提問時回覆「照你的建議」 | techstack.md 結構符合 E11；分層沒有「前端」「後端」或其他專案不存在的分層，同層相鄰；Python 版本照 research 寫法；`argparse`、`csv`、`datetime`、`sys` 等標準函式庫模組都不出現在總覽；總覽沒有兩列的角色相同，每個技術都能在對應 `Decision` 找到；不引入清單只含總覽沒有任何技術屬於它的類別（例如第三方套件類別），沒有 `datetime.strptime()` 用法、Python 新版功能這類寫法取捨；清單為空時寫「本次沒有整類不引入的技術。」（E16），清單不為空時以逐步演練確認 E16：把 research.md 的替代方案換成只有同類競品與自行撰寫的方案後，依 Rule 4 應產出該句 |

## 8. 驗收結果

- 施工後結構診斷：`technical-research` 0 個 error、0 個 warning；`rules/技術堆疊-格式規範.md` 仍由 P3-1 載入。
- 同步：`./scripts/sync-skills.sh --from agents` 與 `--check` 退出狀態皆為 0，結果「兩邊一致」；`AGENTS.md → CLAUDE.md` 同步後 `CLAUDE.md` 沒有差異；沒有只存在於目標端、未被刪除的 Skill。
- To-Be 一致性：`git diff` 顯示 `SKILL.md` 未變更，與第 2 節 To-Be 逐字相同；施工後 RuleFile 的 Rule 標題與條列以程式逐項比對第 2 節 Rule 清單，結果一致；techstack 範例雜湊 `4a2939a1…93cc` 與定稿雜湊相同。
- 驗收方式：S1、S5 各在獨立的暫存專案（`git init` 並提交基準，`.claude/skills/` 放入施工版 `technical-research` 與 `clarify`，spec 依第 7 節重建）中，由不帶本次分析脈絡的子代理實跑；子代理只取得 Skill 路徑、專案根目錄、情境輸入與預先回覆。產出另以命令檢查標頭、填位符號、FR／SC 編號、`Decision` 中的「或」，以及 techstack 每列與 research 的對應。S2～S4 依第 7 節逐步演練。
- S1 通過：
  - clarify 問 2 題（HTTPS 由哪一層負責、後端是否引入框架），代入建議後繼續。
  - research.md 9 個主題、編號連續、三個欄位齊全、無 `{{`；引用的 FR-001～006、SC-001～003 都存在；`Decision` 唯一的「或」是 CSV 跳脫規則的「逗號、雙引號或換行」，不是並列方案；React、Node.js、PostgreSQL、Docker 都在 `Decision` 中。
  - techstack.md 標頭四欄、兩個段落、欄位與樣板相同，沒有其他段落。總覽 6 列（紀錄 13 為 20 列），角色沒有重複；React 與 `react-dom`、PostgreSQL 與 `pg`、Docker 與 Docker Compose 各合併在同一格；每個技術都在所列 `research §N` 的 `Decision` 中；版本（React 19、Vite 8、Node.js 24 LTS 以上、PostgreSQL 18、`pg` 8、Caddy 2）都照 research 寫法，Docker 沒有指定版本就不寫，沒有 `—`。
  - research 的 `Decision` 提到的 `fetch`、`node:http`、`node:crypto`、`node:test`、SVG 都沒有出現在總覽（E18）。
  - 不引入清單 16 類（紀錄 13 為 28 項），每一類在總覽中都沒有屬於它的技術；同類競品 TypeScript、`postgres`（porsager）、Nginx 與實作取捨（前端自行加總、預先彙總表、前端 `Blob` 組 CSV、Node.js 內建 `https`）都沒有列；沒有原因欄。
  - 回報列出兩份檔案路徑。
- S2 通過（逐步演練）：P1-1～P1-3 未修改，`technical-research` 在 P1-3 停止、不寫檔，與紀錄 13 S2 的實跑結果相同。
- S3 通過（逐步演練）：P1-5、P1-6 未修改，只有 techstack.md 存在時詢問覆寫，「不要覆寫」時在 P1-6 停止，與紀錄 13 S3 相同。
- S4 通過（逐步演練）：P1-7～P1-9 與 Phase 2 未修改；Phase 3 只讀取已寫入的 research.md，不提問、不修改 `Decision`。
- S5 通過：
  - clarify 問 2 題（打包方式、「只用標準函式庫」的範圍），代入建議後繼續。
  - techstack.md 結構符合樣板；分層只有「執行環境」，沒有「前端」「後端」等不存在的分層；總覽只有「Python 3.12」一列，版本照 research 寫法；`argparse`、`gzip`、`re`、`csv`、`zipapp`、`unittest` 等標準函式庫模組都沒有出現（E18）。
  - 不引入清單 9 類，代表技術都在所列主題的 `Alternatives considered` 中；同屬標準函式庫的 `optparse`，以及 `datetime.strptime`、`multiprocessing`、浮點數 `round()`、CSV 最後一列寫略過行數等寫法取捨都沒有列。
  - 清單不為空，E16 以逐步演練驗證：Rule 4 末條要求沒有可列類別時保留標題並寫「本次沒有整類不引入的技術。」，Good Example 2 示範該寫法；把 research 的替代方案換成只有 `optparse` 與自行撰寫的方案時，沒有可列類別，依 Rule 4 會產出該句。
- 個案驗收條件：無。
- 觀察（未造成情境失敗、未修改 Skill）：平台內建功能取代第三方套件時，該類別在總覽中沒有技術，因此會被列為「整類不用」。S1 的「測試框架｜Vitest、Jest」（改用 `node:test`）、S5 的 9 類都屬這種情況；這與定稿範例的「第三方拖放套件｜SortableJS、Dragula」（改用原生 Drag and Drop API）同一邏輯，符合 E14，但在「套件越少越好」「只用標準函式庫」這類限制下，清單會隨被捨棄的套件類別變長（S1 16 類、S5 9 類）。

### 使用者實際驗證（2026-10-24）

- 方式：在暫存專案（`.claude/skills/` 放入施工版的 `technical-research` 與 `clarify`，`specs/002-expense-tracker/spec.md` 依第 7 節重建）以 Herdr 開新 pane 啟動 Claude Code（Opus 5.5 high effort），輸入與 S1 相同的需求「specs/002-expense-tracker/spec.md 寫好了，幫我做技術研究並整理技術堆疊。前端用 React，後端用 Node.js，資料庫用 PostgreSQL，部署用 Docker，套件越少越好。」執行者代為輸入並讀取結果；clarify 提問由使用者親自回答。
- 權限處理：執行者只選了資料夾信任的 Yes；測試 session 啟動時已是 auto mode（使用者本機預設），其間的查詢由 auto mode 放行。
- 第一輪（W1 施工後）：
  - 測試 session 自行觸發 `technical-research`；clarify 問 2 題（語言、後端 HTTP 層），使用者回答「1-1, 2-2」（TypeScript、Express 5）。
  - 產出 research.md（8 個主題）與 techstack.md，結構符合樣板、無 `{{`，FR／SC 都存在。總覽 8 列、角色不重複，`fetch`、`node:test`、`crypto.scrypt`、SVG 都沒有列；不引入清單 19 類，Fastify、`pg`、Nginx 等同類技術與實作取捨都沒有列。
  - 使用者指出的問題：總覽有「部署｜容器編排｜Docker Compose」，不引入清單卻有「容器調度平台｜Kubernetes」，屬換名的同類技術（R4）。另兩點觀察使用者表示可以接受：`react-dom`、`@types/*` 未列且 Docker 只以 Docker Compose 出現；不引入清單 19 類偏長。
  - 處理：返回根因分析確認 R4，以 W2 改寫 Rule 4 第 4 條並新增 Bad Example 3；結構診斷 0 error、0 warning，同步後兩邊一致。
- 第二輪（W2 施工後，同一暫存專案重置後開新 session，輸入相同）：
  - 這次 clarify 沒有觸發，測試 session 自行決定 JavaScript 與 `node:http`（Phase 1 決策缺口判斷的既有不一致，本次未修改，使用者表示先忽略）。
  - research.md §7 仍捨棄 Kubernetes 與 Nginx，不引入清單都沒有列；Next.js、`postgres`、Create React App、TypeScript 等會承擔總覽角色的同類技術也都沒有列。總覽 6 列（含 `react-dom`、Docker），不引入清單 16 類。
- 結論：使用者確認驗證通過。`description` 本來就沒有「（未驗證）」，維持不變。測試專案與測試用 pane 已移除。
