# 根因報告：technical-research－新增techstack產出

- 紀錄目錄：`specs/skill-engineering/13-technical-research-新增techstack產出/`
- 問題證據：
  - 本次對話中，使用者以 `/artifact-to-skill-engineering` 提出的客製化需求：「research markdown 裡面只有技術決策……希望還可以多一個 techstack.md，用來總結本次開發計劃整體引入了哪些技術決策」，以及 clarify 後使用者選定的 `1-1, 2-1, 3-1`（一頁總覽並供下游使用；依架構分層的單一表格，用途欄不寫理由；附加「本次開發不引入的技術」）與版本欄選 1（research 沒指定版本時寫 `—`）。
  - 使用者已確認定稿的樣板組：`.agents/skills/technical-research/templates/techstack.example.md`（SHA-256 `64ae6ee1597451943b2742cbca6a67dd4428b6709b7a456e26e0c6538a66d493`）與 `templates/techstack.md`。
  - Skill 檔案：`.agents/skills/technical-research/SKILL.md`、`rules/技術決策-格式規範.md`。
  - 結構診斷：`technical-research` 2 個 error（`templates/techstack.md`、`templates/techstack.example.md` 皆為 REF004 孤兒部位）、0 個 warning；沒有呼叫者，委派 `clarify`。
  - 既有驗收條件：`specs/skill-engineering/12-technical-research-建立/blueprint.md` 第 1 節 E1～E10。

## 1. 使用者回報的問題

`technical-research` 只產出 `research.md`，內容按主題分章，讀者看不到這次開發整體用了哪些技術。使用者要它多產出一份 `techstack.md` 當技術總覽，樣板組已經定稿，但 Skill 的 SOP 與規則還沒有涵蓋這份檔案。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | research.md 寫在目標 spec.md 的同一個目錄，結構符合 research 樣板組：標題為「技術研究與決策紀錄 (Research): <功能名稱>」，`Feature Branch` 為該目錄名稱，`Date` 為執行當日，`Spec` 連結為 `./spec.md`，每個主題章節依序包含 `Decision`、`Rationale`、`Alternatives considered` | 既有 | 通用 | S1 |
| E2 | 每個主題的 `Decision` 只寫一個確定方案，不以「或」並列未決定的方案 | 既有 | 通用 | S1 |
| E3 | 每個主題的 `Alternatives considered` 至少一條，每條以粗體寫出方案名稱並寫出捨棄原因；被捨棄的方案不出現在 `Decision` | 既有 | 通用 | S1 |
| E4 | 使用者輸入中的每項技術限制都被某個主題的 `Decision` 採納，沒有任何 `Decision` 違反使用者的技術限制 | 既有 | 通用 | S1 |
| E5 | `Rationale` 與 `Alternatives considered` 引用的 FR／SC 編號都存在於目標 spec.md | 既有 | 通用 | S1 |
| E6 | `Decision` 與 `Rationale` 對套件或 API 能力的描述，與該套件目前的官方文件一致 | 既有 | 通用 | S1 |
| E7 | 主題章節數依實際需要決策的主題決定，編號從 1 連續，沒有空章節，也沒有殘留的填位符號 | 既有 | 通用 | S1 |
| E8 | 找不到 spec.md 時停止執行，不建立 research.md 與 techstack.md，並告知使用者先產出 spec.md | 既有＋本次（擴及 techstack.md） | 通用 | S2 |
| E9 | 目標目錄已有 research.md 或 techstack.md 時，使用者未同意前兩份檔案都不覆寫 | 既有＋推定（擴及 techstack.md）：techstack.md 由 research.md 整理而來，只覆寫其中一份會讓兩份對不起來 | 通用 | S3 |
| E10 | 使用者的技術限制彼此衝突時，先向使用者提問再決策，相關主題的 `Decision` 採用使用者的回答 | 既有 | 通用 | S4 |
| E11 | techstack.md 寫在 research.md 的同一個目錄，結構符合 techstack 樣板組：標題為「技術堆疊 (Tech Stack): <功能名稱>」，標頭依序為 `Feature Branch`、`Date`、`Spec`（`./spec.md`）、`Research`（`./research.md`），之後依序只有「技術堆疊總覽」（分層、技術、版本、用途、決策來源五欄）與「本次開發不引入的技術」（技術、不引入原因、決策來源三欄）兩個段落；沒有殘留的填位符號，回報時列出 techstack.md 路徑 | 本次 | 通用 | S1 |
| E12 | 「技術堆疊總覽」的每一列技術都出現在 research.md 某個主題的 `Decision` 中，決策來源欄寫 `research §<主題編號>` 且指向該主題；research.md 各 `Decision` 採用的語言、框架、套件、執行環境、資料儲存與工具都有對應列，只決定設計或實作方式、沒有引入技術的決策不列 | 本次 | 通用 | S1 |
| E13 | 用途欄只寫該技術負責的功能，不寫採用理由，也不引用 FR／SC；版本欄只寫 research.md 明確指定的版本，research.md 沒有指定時寫 `—` | 本次 | 通用 | S1 |
| E14 | 「本次開發不引入的技術」的每一列都是 research.md 某主題 `Alternatives considered` 中被捨棄的技術，決策來源欄指向該主題；只代表「自行實作」、不會引入任何技術的替代方案不列 | 本次（定稿時確立） | 通用 | S1 |
| E15 | 「分層」依本次專案的實際架構命名（範例的五層只適用前後端分離的 Web 專案），同一分層的列相鄰排列 | 推定：範例只有一種專案型態，CLI、行動 App 等專案若照抄五層會出現空層或歸類錯誤，Skill 每次都得決定分層 | 通用 | S1 |
| E16 | research.md 沒有任何被捨棄的技術時，「本次開發不引入的技術」段落保留標題，以一句「本次沒有被捨棄的技術。」取代表格 | 推定：骨架以 `{{EXCLUDED_TECH_ROWS}}` 表示表格列，沒有可列項目時留空表格或刪掉段落都會偏離樣板，Skill 遇到時必須決定 | 通用 | S5 |
| E17 | 使用者提到 techstack.md、技術堆疊時會觸發 `technical-research` | 推定：description 目前只寫產出 research.md，使用者要求「整理技術堆疊」時可能不會觸發 | 通用 | S1 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E11～E16 | 每次執行都寫出 techstack.md | 沒有任何步驟載入 techstack 樣板組或寫出 techstack.md | 觀察：結構診斷對 `templates/techstack.md`、`templates/techstack.example.md` 回報 REF004 孤兒部位；`grep -i 'techstack\|技術堆疊'` 在 `SKILL.md` 與 `rules/` 沒有任何結果 |
| E12～E16 | 總覽表的取材範圍、用途與版本寫法、不引入清單的取捨固定 | 沒有任何部位規定，只能從範例推測 | 觀察：`rules/技術決策-格式規範.md` Rule 1～3 只規範 research.md 的 `Decision`、`Rationale`、`Alternatives considered` |
| E9 | 已有 techstack.md 時先詢問 | 只檢查 research.md | 觀察：`SKILL.md` P1-5「『目標 spec』所在目錄已有 `research.md` 時，詢問使用者是否覆寫」 |
| E8 | 停止時也不建立 techstack.md | 停止條件沒有提到 techstack.md，但 P1-3 停止時不會執行任何寫入 | 觀察：`SKILL.md` P1-3 停止執行，Phase 2 才寫檔；推論：E8 目前已滿足，techstack.md 加入後只要寫檔仍在 Phase 2 就不受影響（依據上述觀察） |
| E17 | description 提到 techstack.md | 只提到 research.md | 觀察：`SKILL.md` frontmatter `description`「產出與 spec.md 同目錄的 research.md」，觸發詞沒有 techstack.md、技術堆疊 |

## 4. 演練表

以推定輸入樣本「specs/003-team-todo/spec.md 寫好了，幫我做技術研究並整理技術堆疊。前端 React，後端 Node.js，資料庫 PostgreSQL。」逐步演練目前的 SOP（目標目錄已有 research.md 與 techstack.md 的情況另外標註）。

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| 觸發 | description 涵蓋「技術堆疊」 | 觀察：description 只寫 research.md | 觸發 `technical-research` | 推論：「技術研究」仍會觸發；只說「整理技術堆疊」時可能不觸發（依據 description 觀察） | 偏離 |
| P1-1～P1-4 | 無 | 無 | 「研究輸入」、「目標 spec」 | 推論：與 techstack.md 無關（依據步驟文字） | 一致 |
| P1-5～P1-6 | 無 | 無 | 已有 research.md 或 techstack.md 時詢問 | 觀察：只檢查 research.md；只有 techstack.md 時不詢問 | 偏離 |
| P1-7～P1-9 | 無 | 無 | 「主題清單」、「決策缺口」 | 推論：主題與缺口只依 spec 與使用者限制盤點，與 techstack.md 無關（依據步驟文字） | 一致 |
| P2-1～P2-3 | 技術決策檢查清單 | 觀察：已載入 Rule 1～3 | 每個主題的 `Decision`、`Rationale`、`Alternatives considered` | 推論：與既有行為相同（依據步驟文字） | 一致 |
| P2-4～P2-6 | research 樣板組 | 觀察：只載入 research 樣板組 | research.md | 推論：與既有行為相同 | 一致 |
| （缺） | techstack 樣板組與 techstack 規則 | 觀察：沒有任何步驟載入 | techstack.md | 觀察：沒有任何步驟寫出 techstack.md（REF004） | 偏離 |
| P2-7 | 無 | 無 | 回報 research.md 與 techstack.md 路徑 | 觀察：只回報 research.md | 偏離（連鎖） |

第一個偏離點：觸發（frontmatter `description`）。Skill 內第一個偏離的 SOP 步驟是 P1-5～P1-6（覆寫檢查只看 research.md）；產出 techstack.md 的步驟則完全不存在。三者都出自同一件事：`SKILL.md` 的產出定義只有 research.md。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `technical-research`／`SKILL.md`／frontmatter `description`、Phase 1 P1-5～P1-6、Phase 2（P2-4～P2-7 與完成條件） | 缺失 | 觀察：description、覆寫檢查、樣板載入、寫檔、自我檢查與回報都只提到 research.md；結構診斷回報 techstack 樣板組為孤兒部位。推論：無論樣板組多完整，執行者都不會產出 techstack.md（依據上述觀察） | 假設 `SKILL.md` 的產出定義包含 techstack.md：description 會涵蓋技術堆疊，覆寫檢查會看兩份檔案，Phase 2 會在 research.md 之後載入 techstack 樣板組、寫出並檢查 techstack.md，P2-7 會回報路徑，E8、E9、E11、E17 可滿足 |
| R2 | `technical-research`／`rules/`（`技術決策-格式規範.md` Rule 1～3 之外沒有 techstack 規則） | 缺失 | 觀察：Rule 1～3 只規範 research.md 三個欄位。推論：總覽表要納入哪些技術、用途與版本怎麼寫、哪些被捨棄方案算「技術」、分層怎麼命名、沒有被捨棄技術時怎麼寫，都只能從單一範例推測（依據上述觀察與第 6 節 H1） | 假設有規範這五項的規則並在寫 techstack.md 前載入：E12～E16 都有可逐條檢查的依據，自我檢查能判斷違反 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H1：樣板範例已經足以示範寫法，不需要規則 | 非 Skill 問題 | 觀察：範例的版本欄有 10 列 `—`，但範例本身無法說明 `—` 代表「research 沒有指定」還是「沒查到」；範例只有一種專案型態的五層；範例沒有「沒有被捨棄的技術」的情況；範例省略了 research §1～§3 的手刻類替代方案，但沒有說明省略的判斷標準。推論：E13～E16 的判斷無法從範例推出（依據上述觀察） |
| H2：樣板組已存在，只是沒有載入，加一個 `READ` 步驟即可 | 未載入 | 觀察：SOP 中不只沒有載入步驟，也沒有寫檔、檢查與回報步驟，覆寫檢查也只看 research.md。推論：只補載入步驟，執行者仍沒有寫出 techstack.md 的指示，E9、E11 無法滿足（依據 R1 的觀察） |
| H3：techstack.md 應該另做一個 Skill 產出 | 流程缺陷 | 觀察：使用者明確要求在 `technical-research` 加產出；課程〈【基因工程】把「技術可行性分析和決策」拆出來：/technical-research〉約 5:30 說明此 Skill 的職責包含「整理出本次開發涉及的技術堆疊決策總結」。推論：拆成另一個 Skill 不符合使用者需求（依據上述觀察） |

## 7. 影響範圍

- 沒有其他 Skill 委派 `technical-research`（結構診斷 `callers` 為空）。
- `technical-research` 委派 `clarify`；本次根因不在 `clarify`。

## 8. 待確認事項

1. 驗收條件是否正確、完整？特別是本次新增的 E11～E14，以及擴充後的 E8。
2. 是否同意 R1、R2？
3. E9 擴充是推定的：已有 research.md 或 techstack.md 任一份時就先詢問，使用者不同意時兩份都不覆寫。是否同意？
4. E15 是推定的：分層依專案實際架構命名，不固定為範例的五層。是否同意？
5. E16 是推定的：沒有被捨棄的技術時保留段落標題，以「本次沒有被捨棄的技術。」取代表格。是否同意？
6. E17 是推定的：description 加上 techstack.md、技術堆疊的觸發詞。是否同意？
7. 仍缺少的證據：無。

## 9. 確認紀錄

使用者回覆「同意全部」：同意驗收條件 E1～E17、根因 R1、R2，以及推定的 E9 擴充（任一份存在就先詢問，不同意時兩份都不覆寫）、E15（分層依專案實際架構命名）、E16（沒有被捨棄的技術時保留標題並以「本次沒有被捨棄的技術。」取代表格）與 E17（description 加上 techstack.md、技術堆疊觸發詞）。
