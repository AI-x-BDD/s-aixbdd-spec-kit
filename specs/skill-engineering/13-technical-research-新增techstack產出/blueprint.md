# 工程藍圖：technical-research－新增techstack產出

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/13-technical-research-新增techstack產出/`
- 根因報告：`specs/skill-engineering/13-technical-research-新增techstack產出/rca-report.md`（使用者回覆「同意全部」）
- 確認紀錄：使用者於 Phase 4 回覆「確認」：確認藍圖全部內容，包括 E1～E17（推定的 E9、E15、E16、E17 已於根因報告確認）、To-Be SOP、`rules/技術堆疊-格式規範.md` Rule 1～4 的界線（不引入清單以「是否有名稱可辨識」區分）、樣板組載入步驟由 W2 直接寫入，以及 S4 逐步演練、E16 必要時逐步演練的驗收方式

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
| E8 | 找不到 spec.md 時停止執行，不建立 research.md 與 techstack.md，並告知使用者先產出 spec.md | 既有＋本次（擴及 techstack.md） | 通用 |
| E9 | 目標目錄已有 research.md 或 techstack.md 時，使用者未同意前兩份檔案都不覆寫 | 既有＋推定（已確認） | 通用 |
| E10 | 使用者的技術限制彼此衝突時，先向使用者提問再決策，相關主題的 `Decision` 採用使用者的回答 | 既有 | 通用 |
| E11 | techstack.md 寫在 research.md 的同一個目錄，結構符合 techstack 樣板組：標題為「技術堆疊 (Tech Stack): <功能名稱>」，標頭依序為 `Feature Branch`、`Date`、`Spec`（`./spec.md`）、`Research`（`./research.md`），之後依序只有「技術堆疊總覽」（分層、技術、版本、用途、決策來源五欄）與「本次開發不引入的技術」（技術、不引入原因、決策來源三欄）兩個段落；沒有殘留的填位符號，回報時列出 techstack.md 路徑 | 本次 | 通用 |
| E12 | 「技術堆疊總覽」的每一列技術都出現在 research.md 某個主題的 `Decision` 中，決策來源欄寫 `research §<主題編號>` 且指向該主題；research.md 各 `Decision` 採用的語言、框架、套件、執行環境、資料儲存與工具都有對應列，只決定設計或實作方式、沒有引入技術的決策不列 | 本次 | 通用 |
| E13 | 用途欄只寫該技術負責的功能，不寫採用理由，也不引用 FR／SC；版本欄只寫 research.md 明確指定的版本，research.md 沒有指定時寫 `—` | 本次 | 通用 |
| E14 | 「本次開發不引入的技術」的每一列都是 research.md 某主題 `Alternatives considered` 中被捨棄的技術，決策來源欄指向該主題；只代表「自行實作」、不會引入任何技術的替代方案不列 | 本次 | 通用 |
| E15 | 「分層」依本次專案的實際架構命名，同一分層的列相鄰排列 | 推定（已確認） | 通用 |
| E16 | research.md 沒有任何被捨棄的技術時，「本次開發不引入的技術」段落保留標題，以一句「本次沒有被捨棄的技術。」取代表格 | 推定（已確認） | 通用 |
| E17 | 使用者提到 techstack.md、技術堆疊時會觸發 `technical-research` | 推定（已確認） | 通用 |

## 2. To-Be SOP

````markdown
---
name: technical-research
description: （未驗證）已有 spec.md、要做技術選型研究並記錄決策時使用：從 spec 的需求與使用者的技術限制盤點需要決策的技術主題，每個主題收斂成單一確定方案，寫出依據與被捨棄的替代方案，產出與 spec.md 同目錄的 research.md，再把採用與不引入的技術整理成同目錄的 techstack.md 技術堆疊總覽；技術限制互相衝突時會先委派 clarify 詢問使用者。使用者提到 technical research、research.md、techstack.md、技術研究、技術選型、技術堆疊、選框架、選資料庫、決策紀錄時使用。只需把功能描述寫成 spec.md 時改用 s-specify；要規劃類別、先畫類別圖再寫程式時改用 plan-with-class-diagram；只查詢單一套件用法或一般資料蒐集、不產出 research.md 時不使用此 Skill。
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

`rules/技術堆疊-格式規範.md`（新增，由 W3 抽取）的 Rule 清單：

- Rule 1 - 總覽表的每一列必須取自 research.md 的 Decision
  - 「技術堆疊總覽」每一列的技術都必須出現在 research.md 某個主題的 `Decision` 中。
  - 決策來源欄必須寫 `research §<主題編號>`；同一技術出現在多個主題時，必須合併為一列，來源以「、」並列（例如 `research §1、§2`）。
  - research.md 各 `Decision` 採用的語言、框架、套件、執行環境、資料儲存與工具，都必須有對應的列。
  - 只決定設計或實作方式、沒有引入技術的內容（例如資料表欄位、排序策略、API 端點）不得列入。
- Rule 2 - 用途與版本欄只寫事實，不寫理由
  - 用途欄必須只寫該技術在本次開發負責的功能。
  - 用途欄不得寫採用理由，不得引用 FR／SC 編號，也不得出現「以符合」、「因為」等理由句。
  - 版本欄必須只寫 research.md 明確指定的版本或版本下限，並照 research.md 的寫法。
  - research.md 沒有指定版本時，版本欄必須寫 `—`，不得依查證結果或自行判斷補上版本。
- Rule 3 - 分層依專案實際架構命名
  - 分層名稱必須依本次專案實際具備的架構部分命名。
  - 不得列出專案沒有的分層。
  - 同一分層的列必須相鄰排列。
- Rule 4 - 不引入清單只列被捨棄的具名技術或方案
  - 「本次開發不引入的技術」每一列都必須是 research.md 某主題 `Alternatives considered` 中被捨棄、且有名稱可辨識的技術或技術方案（套件、框架、服務、建置工具、儲存方式、演算法等）。
  - 決策來源欄必須指向該替代方案所在的主題。
  - 替代方案只是「不使用任何套件或工具、自行撰寫同樣功能」（例如自行解析檔案格式、不用建置工具）時，不得列入。
  - 不引入原因必須只寫一句摘要，不得重述該主題的 `Rationale`。
  - research.md 沒有任何可列的技術時，必須保留段落標題，並以一句「本次沒有被捨棄的技術。」取代表格。

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無 | — | 依 E1～E17 逐一追溯，As-Is 每個元素都仍能追溯到驗收條件或必要流程（見「保留」）；本次根因都是缺失，沒有重複或衝突的內容可刪。As-Is P2-7 回報步驟不刪除，改換到 Phase 3（見下表） |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter `description` | 修改 | 加入「再把採用與不引入的技術整理成同目錄的 techstack.md 技術堆疊總覽」與觸發詞 `techstack.md`、技術堆疊；開頭加「（未驗證）」 | R1、E11、E17；`CLAUDE.md`「未經學員實際驗證要標明」 |
| P1-5 `WRITE` 覆寫詢問 | 修改 | 檢查對象改為「`research.md` 或 `techstack.md`」，略過條件改為「兩份都沒有時」 | R1、E9；C9 |
| P1-6 `CHECK` 覆寫回覆 | 修改 | 不修改的對象改為「`research.md` 與 `techstack.md`」 | R1、E9；C9 |
| Phase 2 完成條件 | 修改 | 移除「且已向使用者回報」，回報改由 Phase 3 負責 | R1、E11 |
| As-Is P2-7 `WRITE` 回報 | 改換存放位置＋修改 | 移到 Phase 3 最後一步（To-Be P3-6）；回報內容加入 `techstack.md` 路徑 | R1、E11；C18 |
| Phase 3 -- 整理並產出 techstack.md（P3-1～P3-5 與完成條件） | 新增 | 載入技術堆疊規則、決定兩張表的列、載入 techstack 樣板組、寫入、驗證 | R1、E11～E16；C19～C25 |
| `rules/技術堆疊-格式規範.md` Rule 1～4 | 新增 | 見第 2 節 Rule 清單 | R2、E12～E16；C20～C23 |
| `LICENSE`（Skill 目錄）第 1 項 | 修改 | 加註 `templates/techstack.example.md` 沿用同一照片相簿情境，內容由 research 範例整理而成 | 專案 CLAUDE.md 規則 3 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter `name` | 觸發 | 無 |
| Phase 1、2 的標題 | Phase 1：E4、E8～E10；Phase 2：E1～E7 | 無（只組織步驟） |
| P1-1、P1-4 | E1、E4、E5 | C8 |
| P1-2、P1-3 | E8 | C6、C7 |
| P1-7～P1-9 | E4、E10 | C10～C12 |
| Phase 1 完成條件 | E4、E8～E10 | 無（只概述結果） |
| P2-1～P2-6 | E1～E7 | C13～C17 |
| `rules/技術決策-格式規範.md` Rule 1～3 | E2～E5 | C2～C5 |
| research 樣板組 `templates/research.md` 與 `.example.md`（使用者定稿） | E1 | C1；範例示範 C2～C5，不與存放位置矛盾 |
| techstack 樣板組 `templates/techstack.md` 與 `.example.md`（使用者定稿，雜湊 `64ae6ee1…d493`） | E11 | C19；範例示範 C20～C23，不與存放位置矛盾 |

techstack 樣板組已由 `artifact-to-skill-engineering` Phase 3 以 `skill-form-template` 建立並經使用者定稿，本藍圖不施工，只由 To-Be P3-3 載入；比照紀錄 12 的 research 樣板組，載入步驟由 W2 的 SOP 施工寫入，不另交 `skill-derive-template`（其施工會重新設計樣板，可能改動已定稿的範例）。

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 2 | 3 | +1 |
| 步驟 | 16 | 21 | +5 |
| RuleFile | 1 | 2 | +1 |
| Rule | 3 | 7 | +4 |
| 樣板組 | 2 | 2 | 0 |
| 腳本 | 0 | 0 | 0 |

- Phase +1、步驟 +5（R1、E11～E16）：
  - 刪除、改寫：既有步驟都只處理 research.md，沒有可改寫成產出 techstack.md 的步驟；把 techstack 的步驟塞進 Phase 2 的既有步驟，會讓「決定 Decision」與「整理總覽」兩種判斷混在同一步，自我檢查也無法分開計輪。
  - 改換存放位置：As-Is P2-7 回報移到 Phase 3，沒有新增回報步驟。
  - 新增：techstack.md 必須在 research.md 通過檢查後才能整理（E12、E14 以定稿的 research.md 為準），因此另開 Phase 3，含載入規則、決定列、載入樣板組、寫入、驗證 5 步；Phase 2 從 7 步變 6 步，總計 +5。
- RuleFile +1、Rule +4（R2、E12～E16）：
  - 刪除、改寫：`技術決策-格式規範.md` 規範的是 research.md 三個欄位怎麼決策，沒有可改寫的內容。
  - 改換存放位置：E12～E16 沒有既有位置。
  - 新增：「技術堆疊總覽」與「不引入清單」的取材與寫法需要判斷（設計決策算不算技術、手寫方案算不算具名方案），需要正反例；主題與既有 RuleFile 不同，載入時機也不同（Phase 3），併入既有 RuleFile 會讓 Phase 2 決策時載入無關的總覽規則，因此新增 `rules/技術堆疊-格式規範.md`。
- 腳本維持 0：「總覽每列都出現在 Decision 中」可以用文字比對，但技術名稱在兩份檔案的寫法不一定相同（`mysql2/promise` 與 `mysql2`），比對需要判斷，先以 RuleFile 處理。

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
| C9 | 已有 research.md 或 techstack.md 時須經使用者同意才覆寫，不同意時兩份都不修改（修改：擴及 techstack.md） | P1-5、P1-6 | SOP 流程 | 使用者確認閘門 |
| C10 | 每項使用者技術限制與影響技術選型的 FR／SC 都歸入主題（不變） | P1-7 | P1-7 步驟內文 | 單一步驟一句話 |
| C11 | 決策缺口的定義（不變） | P1-8 | P1-8 步驟內文 | 單一步驟一句話 |
| C12 | 決策缺口不為空時委派 clarify（不變） | P1-9 | SOP 流程 | 分支與委派 |
| C13 | research.md 寫入路徑與標頭填值（不變） | P2-5 | P2-5 步驟內文 | 填值來源只屬於寫入步驟 |
| C14 | 主題章節數、編號與分隔（不變） | P2-5 | P2-5 步驟內文 | 骨架已定稿，一句話即可表達 |
| C15 | research.md 內文語言（不變） | P2-5 | P2-5 步驟內文 | 一句話即可表達 |
| C16 | research.md 驗證最多 3 輪（不變） | P2-6 | SOP 流程 | 執行順序與停止條件 |
| C17 | 套件與 API 能力以 Context7 或官方文件查證（不變） | P2-1 | P2-1 步驟內文 | 單一步驟一句話 |
| C18 | 回報內容（兩份檔案路徑、Decision 摘要、clarify 決定項、未通過項）（修改：加入 techstack.md 路徑，移到 P3-6） | P3-6 | P3-6 步驟內文 | 只屬於回報步驟，一句話即可表達 |
| C19 | techstack.md 的標題、標頭四欄、兩個段落與兩張表的欄位（新增） | P3-4 | techstack 樣板組 | 約束整份產出檔案的結構；樣板組已定稿 |
| C20 | 總覽列取自 Decision、決策來源 `research §N` 格式與合併、Decision 採用的技術都有列、設計決策不列（新增） | P3-2 | `rules/技術堆疊-格式規範.md` Rule 1 | 判斷內容是「技術」還是「設計決策」需要語意，腳本無法判斷（理由見第 4 節）；骨架以區塊填位符號產生列，樣板無法逐列保證；需要正反例 |
| C21 | 用途欄不寫理由、版本欄只寫 research.md 指定的版本，否則 `—`（新增） | P3-2 | `rules/技術堆疊-格式規範.md` Rule 2 | 判斷一句話是功能還是理由需要語意；需要正反例 |
| C22 | 分層依專案實際架構命名、不列不存在的分層、同層相鄰（新增） | P3-2 | `rules/技術堆疊-格式規範.md` Rule 3 | 分層命名需要依專案判斷；需要不同專案型態的正反例 |
| C23 | 不引入清單只列具名的被捨棄技術或方案、排除自行撰寫的替代方案、原因只寫摘要、沒有可列項目時寫「本次沒有被捨棄的技術。」（新增） | P3-2 | `rules/技術堆疊-格式規範.md` Rule 4 | 判斷替代方案是否「具名」需要語意；需要正反例；空清單的寫法屬同一張表的取材結果，集中於本 Rule |
| C24 | techstack.md 寫入路徑，以及標題、`Feature Branch`、`Date` 與 research.md 相同（新增） | P3-4 | P3-4 步驟內文 | 填值來源只屬於寫入步驟，一句話即可表達；樣板只固定欄位位置 |
| C25 | techstack.md 驗證最多 3 輪，仍未通過記為「未通過項」（新增） | P3-5 | SOP 流程 | 執行順序與停止條件 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/technical-research/SKILL.md` frontmatter | 依第 2 節 To-Be 的 `description` | 無（只概述用途與觸發） | 已完成 |
| 2 | W2 | `skill-form-sop` | `.agents/skills/technical-research/SKILL.md` SOP | 寫入胖 SOP | C9、C18、C24、C25、C19（載入既有樣板組） | 已完成 |
| 3 | W3 | `skill-derive-rule` | Phase 3 -- 整理並產出 techstack.md 的 `THINK` 決定兩張表每一列的步驟 | 抽取 `rules/技術堆疊-格式規範.md`，並加入載入步驟、調整 `CHECK` 步驟 | C20～C23 | 已完成 |
| 4 | W4 | `skill-engineering` 直接撰寫 | `.agents/skills/technical-research/LICENSE` | 第 1 項加註 techstack 範例的來源 | 無（非 Skill 部位） | 已完成 |

### 工作項內容

#### W1：frontmatter `description`

改為第 2 節 To-Be 的 `description` 全文：開頭加「（未驗證）」；「產出與 spec.md 同目錄的 research.md，」之後加入「再把採用與不引入的技術整理成同目錄的 techstack.md 技術堆疊總覽；」（原本的「；」改由此句結尾承接）；觸發詞在 `research.md` 之後加入 `techstack.md`，在「技術選型」之後加入「技術堆疊」。`name` 與其餘文字不變。

#### W2：胖 SOP

Phase 1 與 Phase 2 寫成第 2 節 To-Be 的全文（P1-5、P1-6、Phase 2 完成條件依差異表修改，As-Is P2-7 移除）。Phase 3 寫成下列胖 SOP（待抽取的約束暫寫在 `THINK` 步驟內文，沒有 RuleFile 載入步驟；techstack 樣板組已存在，載入步驟直接寫入）：

```markdown
## Phase 3 -- 整理並產出 techstack.md

1. `THINK` 依已寫入的 `research.md`，決定「技術堆疊總覽」與「本次開發不引入的技術」的每一列：總覽每一列的技術都必須出現在某個主題的 `Decision` 中，決策來源寫 `research §<主題編號>`，同一技術出現在多個主題時合併為一列並以「、」並列來源；各 `Decision` 採用的語言、框架、套件、執行環境、資料儲存與工具都要有列，只決定設計或實作方式、沒有引入技術的內容不列；用途欄只寫該技術負責的功能，不寫理由、不引用 FR／SC；版本欄只寫 research.md 明確指定的版本，沒有指定時寫 `—`；分層依專案實際架構命名，不列專案沒有的分層，同一分層的列相鄰；不引入清單只列 `Alternatives considered` 中被捨棄、有名稱可辨識的技術或技術方案，「不使用任何套件或工具、自行撰寫」的替代方案不列，原因只寫一句摘要；沒有可列的技術時，保留段落標題，以「本次沒有被捨棄的技術。」取代表格。
2. `READ` `templates/techstack.md` 與 `templates/techstack.example.md`，載入骨架與範例，命名載入結果為「techstack 樣板組」。
3. `WRITE` （同 To-Be P3-4 全文）
4. `CHECK` 驗證步驟 1 對兩張表的要求，並比對 `techstack.md` 與「techstack 樣板組」的標頭、段落順序與表格欄位；未通過時修正 `techstack.md` 後重新驗證，最多 3 輪，第 3 輪仍未通過時將未通過的要求記為「未通過項」。
5. `WRITE` （同 To-Be P3-6 全文）

完成條件：`techstack.md` 已寫入「目標 spec」所在目錄，步驟 1 的要求已通過或未通過的項目已記為「未通過項」，且已向使用者回報。
```

#### W3：抽取 `rules/技術堆疊-格式規範.md`

- 目標步驟：Phase 3 -- 整理並產出 techstack.md 的 `THINK` 步驟（「決定『技術堆疊總覽』與『本次開發不引入的技術』的每一列」）。
- Rule 1～4 的條列逐字照第 2 節 Rule 清單（C20～C23）。
- 正反例使用與既有 `rules/技術決策-格式規範.md` 相同的球場預約系統情境（PostgreSQL 16、FastAPI 等），不得使用照片相簿情境。每組先列出相關的 research.md `Decision`／`Alternatives considered` 片段，再列出 techstack.md 的表格列：
  - Rule 1 反例：總覽多列了 research 沒有採用的套件，且把「時段以 `tstzrange` 欄位儲存」這類設計決策列成一列。
  - Rule 2 反例：用途欄寫「滿足 FR-003 的防重複預約」，版本欄寫出 research 沒有指定的版本。
  - Rule 3：正例示範一個沒有前端的專案（例如球場預約的排程 CLI 或後台批次）只有實際存在的分層；反例照抄「前端」層。
  - Rule 4：正例列出被捨棄的 Firebase、應用層加鎖方案，不列「自行撰寫時段比對函式」；另一個正例示範沒有可列技術時的寫法；反例列入自行撰寫的替代方案，且原因重述整段 `Rationale`。
- 施工註記：
  - Rule 清單的條列依 `skill-form-rule` 的 RuleFile Rule 7 補上「必須」「不得」等強度用詞，並把 Rule 1 第 2 條、Rule 2 拆成單一要求的條列；要求內容不變。本節 Rule 清單已同步為施工後的條列。
  - 工作項原寫 Rule 4 正例列出「應用層加鎖方案」。應用層加鎖屬於自行撰寫的邏輯，依同一條 Rule 的界線不應列入，施工改用具名的「Redis 分散式鎖」，與 Firebase 一起作為正例；「自行撰寫時段比對函式」作為不列的對照。
- After：To-Be P3-1 插入載入步驟；P3-2 改為依已寫入的 `research.md` 與已載入的「技術堆疊檢查清單」決定每一列，刪除內文中的約束；P3-5 改為「逐條驗證『技術堆疊檢查清單』」，「未通過的要求」改為「未通過的 Rule」；完成條件改為引用「技術堆疊檢查清單」。施工後 SOP 必須與第 2 節 To-Be SOP 一致。

#### W4：授權說明

- `.agents/skills/technical-research/LICENSE` 第 1 項在「範例內容經使用者定稿時修改。」之後加入：「`templates/techstack.example.md` 沿用同一照片相簿情境，內容由上述 research 範例整理而成。」其餘不變。
- 根目錄 `LICENSE` 的「授權範圍」已列出 `technical-research` 含 Spec-Kit 衍生內容，不修改。

## 7. 驗收情境

測試環境：每個情境各建一個暫存專案（`git init` 後提交），`.claude/skills/` 放入本次施工版的 `technical-research` 與 `clarify`，記錄執行前的 `git status` 與相關檔案雜湊。

- `specs/002-expense-tracker/spec.md`：個人記帳本，含 FR-001～FR-006、SC-001～SC-003（與紀錄 12 S1 相同的需求內容）。
- `specs/003-log-summary-cli/spec.md`：命令列工具，讀取伺服器存取日誌檔、輸出每小時請求數與錯誤率摘要，可輸出成 CSV；含 FR-001～FR-005、SC-001～SC-002（SC-001：100 MB 日誌 10 秒內完成）；沒有任何畫面或伺服器。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E7、E11～E15、E17 | 本次 | 專案含 002。輸入：「specs/002-expense-tracker/spec.md 寫好了，幫我做技術研究並整理技術堆疊。前端用 Vue 3 + Vite，後端用 Python FastAPI，資料庫用 SQLite，要能匯出 CSV，部署在一台 VPS，不使用雲端託管服務。」 | clarify 提問時回覆「照你的建議」 | research.md 符合 E1～E7（檢查方式同紀錄 12 S1）；`techstack.md` 存在於同目錄，標題、標頭四欄、兩個段落與欄位符合 E11，無 `{{`；總覽每一列的技術都能在對應 `research §N` 的 `Decision` 找到，Vue 3、Vite、FastAPI、SQLite 都有列，沒有資料表欄位或 API 端點這類設計決策列；用途欄沒有 FR／SC 編號與「因為」「以符合」；每個非 `—` 的版本都能在 research.md 找到；同一分層的列相鄰；不引入清單每列都能在對應主題的 `Alternatives considered` 找到，沒有「自行撰寫」「手刻」類方案；回報列出兩份檔案路徑；`description` 含 `techstack.md` 與「技術堆疊」 |
| S2 | E8 | 回歸 | 暫存專案沒有 `specs/` 目錄。輸入：「幫我做技術研究並整理技術堆疊，前端用 React、後端用 Go。」 | 無 | 回覆要求先產出 spec.md（提到 `s-specify`）；`git status --short` 為空，沒有新增 research.md 或 techstack.md |
| S3 | E9 | 本次 | 專案含 002 與既有的 `techstack.md`（記錄雜湊），沒有 research.md。輸入同 S1 | 詢問是否覆寫時回覆「不要覆寫」 | 寫入任何檔案前有詢問是否覆寫；`techstack.md` 雜湊與執行前相同；沒有新增 research.md |
| S4 | E10 | 回歸（逐步演練） | 專案含 002。輸入：「幫我為 specs/002-expense-tracker 做技術研究。不要安裝任何第三方套件，後端用 FastAPI，資料庫 SQLite。」 | clarify 提問時回覆「FastAPI 可以用，其他套件越少越好」 | P1-7～P1-9 與 Phase 2 本次未修改，紀錄 12 S4 已實跑通過；逐步演練確認 Phase 3 只讀取已寫入的 research.md，不改變 P1-9 的提問與 Decision |
| S5 | E11～E16 | 本次 | 專案含 003。輸入：「幫我為 specs/003-log-summary-cli 做技術研究並整理技術堆疊。用 Python 3.12，只用標準函式庫，打包成單一指令。」 | clarify 提問時回覆「照你的建議」 | `techstack.md` 結構符合 E11；分層沒有「前端」「後端」或其他專案不存在的分層，同層相鄰；Python 3.12 的版本欄為 `3.12`（或 research.md 的原寫法）；總覽與不引入清單的取材符合 E12～E14；若 research.md 沒有被捨棄的具名技術，段落寫「本次沒有被捨棄的技術。」（E16）；若有，以逐步演練確認 E16：把 research.md 的 `Alternatives considered` 換成只有自行撰寫的方案後，依 Rule 4 應產出該句 |

## 8. 驗收結果

- 施工後結構診斷：`technical-research` 0 個 error、0 個 warning；`rules/技術堆疊-格式規範.md` 由 P3-1 載入，techstack 樣板組由 P3-3 載入（施工前的 2 個 REF004 孤兒部位已消失）。
- 同步：`./scripts/sync-skills.sh --from agents` 與 `--check` 退出狀態皆為 0，結果「兩邊一致」；`AGENTS.md → CLAUDE.md` 同步後 `CLAUDE.md` 沒有差異；沒有只存在於目標端、未被刪除的 Skill。
- To-Be 一致性：施工後整份 `SKILL.md` 與第 2 節 To-Be 逐字相同；RuleFile 條列與第 2 節 Rule 清單相同；兩份範例雜湊不變（research `e7a0f50a…b5b9`、techstack `64ae6ee1…d493`）。
- 驗收方式：S1、S2、S3、S5 各在獨立的暫存專案（`git init` 並提交基準，`.claude/skills/` 放入施工版 `technical-research` 與 `clarify`）中，由不帶本次分析脈絡的子代理實跑；子代理只取得 Skill 路徑、專案根目錄、情境輸入與預先回覆。產出另以命令檢查標頭、章節、填位符號、FR／SC 編號、`Decision` 中的「或」，以及 techstack 每列與 research 的對應。S4 依第 7 節逐步演練。
- S1 通過：
  - clarify 問 1 題（VPS 是否綁定網域以取得 HTTPS 憑證），代入建議後繼續。
  - research.md 8 個主題、編號連續、三個欄位齊全、無 `{{`；引用的 FR／SC 都存在；`Decision` 不含「或」；Vue 3、Vite、FastAPI、SQLite、CSV 匯出、單台 VPS 都在 `Decision`，PaaS 與代管資料庫列為被捨棄方案。
  - techstack.md 標頭四欄與兩個段落符合樣板；總覽 23 列，每列技術都在所列 `research §N` 的 `Decision` 中，多主題來源合併（例如 FastAPI `research §3、§5、§6`）；非 `—` 的版本（3.12 以上、3、2.0、2）都照 research 寫法；用途欄無 FR／SC 與理由句；分層為執行環境、前端、後端、資料儲存、部署、品質與測試，同層相鄰；索引、WAL 等設計決策未列。
  - 不引入清單 19 列，都在對應主題的 `Alternatives considered` 中；自行撰寫類方案（SVG 繪圖、手寫 SQL、前端組 CSV Blob）未列。
  - 回報列出兩份檔案路徑；`description` 含 `techstack.md` 與「技術堆疊」。
- S2 通過：停在 P1-3，告知先產出 spec.md 並提到 `s-specify`；`git status --short` 為空。
- S3 通過：P1-5 列出 `techstack.md` 已存在、`research.md` 不存在並詢問是否覆寫，收到「不要覆寫」後於 P1-6 停止；`techstack.md` 雜湊 `4e04a7d6…dd6f` 與執行前相同，沒有新增 research.md。
- S4 通過（逐步演練）：`git diff` 顯示 P1-7～P1-9 與 P2-1～P2-6 一字未改；Phase 3 只讀取已寫入的 research.md，不提問、不修改 `Decision`；E10 的行為與紀錄 12 S4 實跑結果相同。
- S5 通過：
  - clarify 問 1 題（`zipapp`、單一 `.py` 或 console script 的交付形式），代入建議後繼續。
  - techstack.md 分層為執行環境、命令列、輸入與解析、輸出、打包與發佈、品質與測試，沒有「前端」「後端」等不存在的分層，同層相鄰（E15）；CPython 版本欄 `3.12` 照 research 寫法；總覽 13 列、不引入清單 20 列都能在 research 找到對應；結構、填位符號與 FR／SC 引用皆通過。
  - research.md 有被捨棄的具名技術，沒有觸發 E16；E16 以逐步演練驗證：P3-1 載入的 Rule 4 末條要求沒有可列技術時保留標題並寫「本次沒有被捨棄的技術。」，Example 2 示範該寫法，P3-5 逐條驗證該條，將 research 的替代方案全換成自行撰寫類時會產出該句。
- 個案驗收條件：無。
- 子代理回報的觀察（未造成情境失敗、未修改 Skill）：
  1. 不引入清單偏長：S5 列入「每行呼叫 `datetime.strptime()`」（已採用技術的另一種用法）與「Python 3.13 以後的新功能」，`datetime` 同時出現在總覽與不引入清單；S1 列入「無 BOM 的 UTF-8 CSV」等寫法層級的方案。符合 Rule 4 的「具名方案」，但清單會隨 research 的替代方案變長。
  2. 總覽顆粒度：S5 把 `sys`、`io`、`tempfile` 等標準函式庫模組逐一列出；Rule 1 沒有規定標準函式庫模組要逐一列還是合併。
  3. E9 的行為：只有 techstack.md 存在時回答「不要覆寫」，整個研究停止，research.md 也不產出（使用者已確認的 E9 行為）。
  4. 與本次修改無關的既有觀察：zsh 下 `ls specs/[0-9]…` 沒有命中時會報錯；「環境事實」（如是否有網域）與 spec 本身的模糊算不算決策缺口沒有規定；決策缺口與技術決策 Rule 1「寫明解讀」的分工不明；主題清單可否加入 spec 沒要求的主題（如測試）沒有規定。

### 使用者實際驗證（2026-10-24）

- 方式：在暫存專案（`.claude/skills/` 放入本次施工版的 `technical-research` 與 `clarify`，`specs/002-expense-tracker/spec.md` 沿用 S1 的個人記帳本 spec）以 Herdr 開新 pane 啟動 Claude Code（Opus 5.5 high effort），輸入使用者選定、與紀錄 12 使用者驗證相同的需求，加上「並整理技術堆疊」：「specs/002-expense-tracker/spec.md 寫好了，幫我做技術研究並整理技術堆疊。前端用 React，後端用 Node.js，資料庫用 PostgreSQL，部署用 Docker，套件越少越好。」執行者代為輸入並讀取結果。
- 權限處理：執行者只選了資料夾信任的 Yes；測試 session 啟動時已是 auto mode（使用者本機預設，非執行者切換），其間的 Context7、npm registry 與網頁查詢由 auto mode 放行。
- 結果：
  - 產出 `research.md`（9 個主題）與 `techstack.md`；結構符合兩組樣板、無 `{{`，引用的 FR／SC 都存在，`Decision` 沒有並列方案。
  - techstack 總覽 20 列，每列都在對應 `research §N` 的 `Decision` 中；版本欄 ES2023、24 LTS、19、18、3.x 都照 research 寫法，其餘為 `—`；用途欄無理由；分層為執行環境、前端、後端、資料儲存、部署、品質與測試，同層相鄰。
  - 不引入清單 28 項，都是具名的被捨棄技術或方案；「套件越少越好」反映為正式依賴只有 6 個 npm 套件。
- 觀察（未修改 Skill，列為之後的優化候選）：
  1. 這次沒有觸發 clarify：「套件越少越好」由 AI 自行採嚴格解讀並寫入 research §1；HTTPS 沒有寫進 research.md，只在回報中提醒部署前要決定（FR-005 登入需要加密連線）。紀錄 12 的 S1 與使用者驗證在同樣情況下都有提問，屬 Phase 1 決策缺口判斷（本次未修改）的不一致。
  2. 不引入清單偏長，含 `OFFSET` 分頁、`numeric(12,2)`、bind mount 等資料模型與部署寫法（與子代理觀察 1 相同）。
  3. 總覽顆粒度細：`Intl`、瀏覽器 `fetch`、CSS `conic-gradient`、`--env-file` 等內建功能各列一列（與子代理觀察 2 相同）。
- 結論：使用者確認驗證通過，移除 `description` 開頭的「（未驗證）」，其餘文字不變；第 2 節 To-Be 的 `description` 以本段為準。測試專案、S1～S5 的暫存專案與測試用 pane 已移除。
