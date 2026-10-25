# 工程藍圖：system-analysis－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/16-system-analysis-建立/`
- 根因報告：無（新建模式）
- 確認紀錄：使用者於 Phase 4 回覆「1 接受、2 是、3 確認，驗收用 Sonnet」：接受推定的 E7–E12（皆為通用）；確認範例衍生自 Spec-Kit 的 plan.md，W5 依 `technical-research` 前例建立 LICENSE；確認藍圖其餘內容；依課程「要測試的話用笨一點的模型」，Phase 5 的驗收子代理改用 Sonnet。施工中發現定稿範例的 D1 引用 Key Entities、`s-specify` 產出的 spec 含 NFR，與 E3／C6／C7 的來源清單矛盾，S2 情境也與 RuleFile 範例重複；使用者回覆「1 同意、2 同意」：需求依據擴充為 US 情境、FR、NFR、SC、Edge Cases、Key Entities，S2 改用社區健身房課程預約情境。與 Codex 討論後使用者回覆「1、2、3 同意」：本次照原定以 Sonnet 驗收，S5 拆成 S5a（不給回覆，驗證停在確認閘門）與 S5b（預先回覆不覆寫）；選模原則另開 skill-engineering 優化；user-verify-skill 支援 Codex 記入 `docs/待確認.md`

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | plan.md 寫在目標 spec.md 的同一個目錄，結構符合 plan 樣板組：標題為「Implementation Plan: <功能名稱>」，`Branch` 為該目錄名稱，`Date` 為執行當日，`Spec` 連結為 `./spec.md`，`Input` 為目標 spec 路徑；依序包含 `## Project Structure`（`### Documentation (this feature)`、`### Source Code (repository root)`、`**Structure Decision**`）與 `## 分析流程規劃`（`### 系統介面盤點`、`### 分析流程安排`）；沒有殘留的填位符號 | 本次（使用者指定樣板組為必須產出的 Artifact） | 通用 |
| E2 | 系統介面盤點表的每一列是一個介面：介面名稱指出需求部位，不是只寫端點名稱（例如只寫「前端」）；端點類型欄寫出端點類型與使用關係（例如「後端（前端 → 後端）」） | 本次（定稿時確認以「需求部位 → 端點類型」的細顆粒度盤點） | 通用 |
| E3 | 每一列的需求依據都引用目標 spec 中存在的 US 情境、FR、NFR、SC 編號，或 Edge Cases、Key Entities 項目 | 本次（定稿時確認依據引用 spec.md） | 通用 |
| E4 | Wave 以技術端點為單位：同一端點類型的介面都在同一個 Wave；每個介面恰好出現在一個 Wave；每個 Wave 寫出涵蓋介面與排序理由，第 2 個以後的 Wave 寫出它依賴前面 Wave 的哪些結果 | 本次（使用者口述 Wave 依技術端點與需求依賴程度排序） | 通用 |
| E5 | 同一個 Wave 有兩個以上端點類型時，Wave 標題標出平行分析的 Sub-agent 數，且這些端點之間在「依賴」中沒有互相依賴 | 本次（使用者口述同一 Wave 內可開 Sub-agent 平行分析） | 通用 |
| E6 | 只做規劃：執行後目標 spec 目錄只新增或改寫 `plan.md`，不產出 data-model、API、UI/UX 等介面分析文件；plan.md 不含 API endpoint 清單、資料表欄位或畫面元件設計 | 本次（使用者口述各介面的分析委派給其他小 Skill，本 Skill 只做規劃） | 通用 |
| E7 | 「系統介面盤點」開場句的端點類型數與介面數、「分析流程安排」開場句的 Wave 數，與表格及 Wave 區塊的實際數量一致 | 推定：骨架的開場句有三個數字填位，數字與內容不符會誤導後續的介面分析 | 通用 |
| E8 | 目標 spec 的每個 User Story 至少被一個介面的需求依據引用 | 推定：細顆粒度盤點的目的是不漏需求；範例的 US1–US3 都有被引用 | 通用 |
| E9 | Source Code 樹與 Structure Decision 只使用 techstack.md／research.md 採用的技術，不出現其未採用的框架、資料庫或服務 | 推定：範例的 Structure Decision 依技術決策（Vite、Node.js、MySQL）說明結構，自行引入技術會和技術研究矛盾 | 通用 |
| E10 | 找不到 spec.md 時停止執行、不建立 plan.md，並告知使用者先產出 spec.md | 推定：plan.md 的標頭與需求依據都依賴 spec.md | 通用 |
| E11 | 目標 spec 目錄沒有 techstack.md 也沒有 research.md 時停止執行、不建立 plan.md，並告知使用者先做技術研究 | 推定：Source Code 樹與 Structure Decision 依賴技術決策；本 Skill 銜接在 `technical-research` 之後 | 通用 |
| E12 | 目標目錄已有 plan.md 時，使用者未同意前不覆寫該檔案 | 推定：覆寫會遺失使用者既有的規劃 | 通用 |

## 2. To-Be SOP

````markdown
---
name: system-analysis
description: （由 W1 依 skill-form-description 撰寫）已有 spec.md 與技術研究結果、要做系統分析的初步規劃時使用：依 spec 的需求部位盤點這次涉及的系統介面與技術端點類型（前端、後端、資料庫、手機、硬體、雲端第三方等），寫出需求依據，再以技術端點為單位、依分析之間的依賴排成可平行分析的 Wave，連同專案結構寫成與 spec.md 同目錄的 plan.md；只做規劃，不做各介面的實際分析。使用者提到 system analysis、系統分析、plan.md、介面盤點、端點盤點、分析流程規劃、Wave 時使用。把功能描述寫成 spec.md 時改用 s-specify；技術選型改用 technical-research；規劃類別設計改用 plan-with-class-diagram。
---

# SOP

## Phase 1 -- 收斂分析輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「分析輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文、同目錄的 `techstack.md` 與 `research.md`（不存在的檔案略過），以及同目錄的檔案清單，加入「分析輸入」。
5. `CHECK` 同目錄的 `techstack.md` 與 `research.md` 都不存在時，告知使用者需要先做技術研究（可使用 `technical-research`）並停止執行。
6. `WRITE` 「目標 spec」所在目錄已有 `plan.md` 時，詢問使用者是否覆寫；沒有時略過本步驟與下一步。
7. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時停止執行，不修改既有的 `plan.md`。

完成條件：「目標 spec」與同目錄的技術研究結果已讀取，且沒有既有 `plan.md` 或使用者已同意覆寫；或「目標 spec」不存在、無法確定、缺少技術研究結果，或使用者不同意覆寫，已停止執行。

## Phase 2 -- 盤點系統介面並安排 Wave

1. `READ` 盤點系統介面時，讀取 `rules/系統介面盤點-格式規範.md` 的所有 Rule，建立「介面盤點檢查清單」。
2. `THINK` 依「分析輸入」與已載入的「介面盤點檢查清單」盤點系統介面，只決定介面、端點類型與需求依據，不設計介面內容（例如 API endpoint、資料表欄位、畫面元件）；介面編號以端點類型的英文代號字母開頭（例如前端 `F`、後端 `B`、資料庫 `D`，不同端點類型使用不同字母），同一端點類型內從 1 連續編號，建立「介面清單」。
3. `READ` 安排 Wave 時，讀取 `rules/Wave安排-格式規範.md` 的所有 Rule，建立「Wave 安排檢查清單」。
4. `THINK` 依「介面清單」與已載入的「Wave 安排檢查清單」，安排分析各介面的 Wave，建立「Wave 安排」。

完成條件：「介面清單」與「Wave 安排」已建立。

## Phase 3 -- 產出 plan.md

1. `THINK` 依「分析輸入」與「介面清單」決定專案結構：Documentation 樹以「目標 spec」所在目錄為根，列出目錄中的文件與本次的 `plan.md`；Source Code 樹只使用 `techstack.md`／`research.md` 採用的技術，依「介面清單」的端點類型規劃頂層目錄；兩棵樹的每個檔案與目錄附一句用途註解；Structure Decision 用一段話說明結構選擇及所依據的技術決策，建立「專案結構」。
2. `READ` `templates/plan.md` 與 `templates/plan.example.md`，載入骨架與範例，命名載入結果為「plan 樣板組」。
3. `WRITE` 依「plan 樣板組」將 `plan.md` 寫入「目標 spec」所在目錄，不建立其他檔案：標題填 spec.md 的功能名稱，`Branch` 填該目錄名稱，`Date` 填執行當日日期，`Input` 填「目標 spec」的路徑；專案結構填「專案結構」，系統介面盤點與分析流程安排分別填「介面清單」與「Wave 安排」；開場句的端點類型數、介面數與 Wave 數依實際填入的內容計算；內文使用繁體中文，技術名詞維持原文。
4. `CHECK` 逐條驗證「介面盤點檢查清單」與「Wave 安排檢查清單」（需求編號以 `grep` 在「目標 spec」中查核），比對 `plan.md` 與「plan 樣板組」的標頭與段落結構並確認沒有殘留的 `{{`，確認步驟 3 的填寫要求均已滿足；未通過時修正 `plan.md` 後重新驗證，最多 3 輪，第 3 輪仍未通過時將未通過的 Rule 或要求記為「未通過項」。
5. `WRITE` 向使用者回報 `plan.md` 路徑、各端點類型的介面數、每個 Wave 涵蓋的端點類型，以及「未通過項」（沒有時說明全部通過）。

完成條件：`plan.md` 已寫入「目標 spec」所在目錄，兩份檢查清單與樣板結構已通過或未通過的項目已記為「未通過項」，且已向使用者回報。
````

## 3. 差異表

### 刪除

無（新建模式）

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter | 新增 | `name: system-analysis` 與 description（用途、觸發關鍵字、與 `s-specify`、`technical-research`、`plan-with-class-diagram` 的分流） | E1–E6 |
| Phase 1 -- 收斂分析輸入（P1-1～P1-7） | 新增 | 決定目標 spec、讀取技術研究結果、缺少輸入時停止、覆寫確認 | E1、E9–E12（C2–C5） |
| Phase 2 -- 盤點系統介面並安排 Wave（P2-1～P2-4） | 新增 | 載入介面盤點規則、盤點介面、載入 Wave 規則、安排 Wave | E2–E8（C6–C11） |
| Phase 3 -- 產出 plan.md（P3-1～P3-5） | 新增 | 決定專案結構、載入樣板組、寫入、驗證、回報 | E1、E6、E7、E9（C1、C12–C18） |
| `rules/系統介面盤點-格式規範.md` Rule 1～2 | 新增 | Rule 1：介面從需求部位切出並歸類端點類型；Rule 2：需求依據可追溯且涵蓋所有 User Story | E2、E3、E8（C6、C7） |
| `rules/Wave安排-格式規範.md` Rule 1～2 | 新增 | Rule 1：Wave 以技術端點為單位依依賴排序；Rule 2：Wave 區塊寫出涵蓋介面、依賴與排序理由 | E4、E5（C9、C10） |
| `LICENSE`（Skill 目錄）與根目錄 `LICENSE` 授權範圍 | 新增 | 依 `technical-research` 前例註明 Spec-Kit 衍生內容並保留 MIT 全文 | 專案 CLAUDE.md 規則 3 |

### 保留

無（新建模式）

`templates/plan.md` 與 `templates/plan.example.md` 已由 `artifact-to-skill-engineering` 建立並經使用者定稿（範例雜湊 `f2a39a058262e58e6a5ca2cbb8ef140cbc09b4b727da79dfdf79567118e6b6cf`），本藍圖不施工，只由 P3-2 載入（C1）。

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 3 | +3 |
| 步驟 | 0 | 16 | +16 |
| RuleFile | 0 | 2 | +2 |
| Rule | 0 | 4 | +4 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 0 | 0 | 0 |

- 新建模式，所有元素都是新增。Phase 1 對應 E10–E12 的停止與確認分支；Phase 2 對應 E2–E8 的兩項判斷；Phase 3 對應 E1、E6、E7、E9 的產出。
- RuleFile 分成兩份：介面盤點（切分與依據）和 Wave 安排（排序與區塊寫法）是兩個不同的判斷主題，分別在 P2-2 與 P2-4 兩個步驟使用，按需載入；兩者都需要正反例（例如「只寫『前端』」與「依需求部位命名」的對比）才能一致執行。
- 不建立腳本：介面編號是否在 Wave 中恰好出現一次、開場句數字是否一致，都屬於產出時的判斷結果，以 P3-4 的逐條驗證檢查；需求編號存在與否以 `grep` 單一命令查核，不另建腳本包裝。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | plan.md 的標頭欄位、`Project Structure` 與 `分析流程規劃` 的段落結構、盤點表表頭與兩句開場句 | P3-3 | plan 樣板組 | 約束整份產出檔案的結構；結構由樣板固定，不需腳本計算 |
| C2 | 決定目標 spec 的規則（指定優先，否則唯一一份） | P1-2 | P1-2 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C3 | 目標 spec 不存在或無法確定時停止 | P1-3 | SOP 流程 | 屬於分支與停止 |
| C4 | techstack.md 與 research.md 都不存在時停止 | P1-5 | SOP 流程 | 屬於分支與停止 |
| C5 | 已有 plan.md 時須經使用者同意才覆寫 | P1-6、P1-7 | SOP 流程 | 屬於使用者確認閘門 |
| C6 | 介面從需求部位切出：逐一檢視 US、FR、NFR、SC、Edge Cases、Key Entities 歸出需求部位，每個部位依負責的端點類型各列一個介面；端點類型涵蓋前端、後端、資料庫、手機、硬體、雲端第三方等；介面名稱指出需求部位；端點類型欄寫出使用關係 | P2-2 | `rules/系統介面盤點-格式規範.md` Rule 1 | 判斷需求部位的邊界與負責端點需要語意，腳本無法判斷；骨架以區塊填位符號產生表格列，樣板無法逐列保證；需要「只寫端點名稱」與「依需求部位命名」的正反例 |
| C7 | 需求依據引用目標 spec 中存在的 US 情境、FR、NFR、SC 編號或 Edge Cases、Key Entities 項目並摘要相關內容；每個 User Story 至少被一列引用 | P2-2 | `rules/系統介面盤點-格式規範.md` Rule 2 | 判斷哪些需求項目支撐某介面需要語意；需要正反例；與 C6 同屬介面盤點主題 |
| C8 | 介面編號以端點類型英文代號字母開頭、不同類型不同字母、同類型內從 1 連續 | P2-2 | P2-2 步驟內文 | 只屬於單一步驟，一句話即可表達，屬機械規則不需正反例；編號由 AI 在盤點時產生，腳本無從預先產生 |
| C9 | Wave 以技術端點為單位：同一端點類型的介面在同一 Wave；依分析之間的依賴排序，被依賴者在前；彼此沒有依賴的端點放同一 Wave 平行；每個介面恰好出現在一個 Wave | P2-4 | `rules/Wave安排-格式規範.md` Rule 1 | 判斷端點分析之間是否有依賴需要語意（例如金流是否依賴前端）；需要正反例（以需求部位分 Wave 的反例） |
| C10 | Wave 區塊寫法：標題「**Wave N：端點類型…**」，兩個以上端點類型時加註平行的 Sub-agent 數；列出涵蓋介面、排序理由，第 2 個以後的 Wave 列出依賴前面 Wave 的哪些結果 | P2-4 | `rules/Wave安排-格式規範.md` Rule 2 | 骨架以 `{{WAVE_BLOCKS}}` 區塊填位符號表示，樣板無法保證區塊內的欄位；Wave 1 與後續 Wave 欄位不同，需要正反例；與 C9 同屬 Wave 安排主題 |
| C11 | 只決定介面、端點類型與需求依據，不設計介面內容（API endpoint、資料表欄位、畫面元件） | P2-2 | P2-2 步驟內文 | 只屬於盤點步驟，一句話即可表達；不需正反例 |
| C12 | 只寫入 plan.md，不建立其他檔案 | P3-3 | P3-3 步驟內文 | 只屬於寫入步驟，一句話即可表達 |
| C13 | 開場句的端點類型數、介面數與 Wave 數依實際內容計算 | P3-3 | P3-3 步驟內文 | 填值規則只屬於寫入步驟；樣板只固定句型位置 |
| C14 | 標頭填值（功能名稱、目錄名稱、執行當日、目標 spec 路徑） | P3-3 | P3-3 步驟內文 | 填值來源只屬於寫入步驟；樣板只固定欄位位置 |
| C15 | 專案結構：Documentation 樹列出目標目錄中的文件與 plan.md；Source Code 樹只用技術研究採用的技術、依端點類型規劃頂層目錄；每個檔案與目錄附用途註解；Structure Decision 說明結構選擇與依據的技術決策 | P3-1 | P3-1 步驟內文 | 只屬於決定專案結構的步驟；樣板只以區塊填位符號固定位置，無法保證樹的內容；使用者於課程中表示文件結構之後再評價，先不建立 RuleFile |
| C16 | 內文繁體中文，技術名詞維持原文 | P3-3 | P3-3 步驟內文 | 一句話即可表達 |
| C17 | 驗證最多 3 輪，仍未通過記為「未通過項」 | P3-4 | SOP 流程 | 屬於執行順序與停止條件 |
| C18 | 回報內容（路徑、各端點類型的介面數、每個 Wave 的端點類型、未通過項） | P3-5 | P3-5 步驟內文 | 只屬於回報步驟，一句話即可表達 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/system-analysis/SKILL.md` frontmatter | 建立 `name` 與 `description` | 無（只概述用途與觸發） | 已完成 |
| 2 | W2 | `skill-form-sop` | `.agents/skills/system-analysis/SKILL.md` SOP | 寫入胖 SOP | C2–C5、C8、C11–C18、C1、C6、C7、C9、C10 | 已完成 |
| 3 | W3 | `skill-derive-rule` | Phase 2 -- 盤點系統介面並安排 Wave 的 `THINK` 安排 Wave 步驟 | 抽取 `rules/Wave安排-格式規範.md`，並加入載入步驟、調整 `CHECK` 步驟 | C9、C10 | 已完成 |
| 4 | W4 | `skill-derive-rule` | Phase 2 -- 盤點系統介面並安排 Wave 的 `THINK` 盤點系統介面步驟 | 抽取 `rules/系統介面盤點-格式規範.md`，並加入載入步驟、調整 `CHECK` 步驟 | C6、C7 | 已完成 |
| 5 | W5 | `skill-engineering` 直接撰寫 | `.agents/skills/system-analysis/LICENSE` 與根目錄 `LICENSE` | 依使用者確認的來源撰寫授權說明 | 無（非 Skill 部位） | 已完成 |

### 工作項內容

#### W1：frontmatter

- `name: system-analysis`
- `description`：已有 spec.md 與技術研究結果、要做系統分析的初步規劃時使用；依 spec 的需求部位盤點這次涉及的系統介面與技術端點類型（前端、後端、資料庫、手機、硬體、雲端第三方等），寫出需求依據，再以技術端點為單位、依分析之間的依賴排成可平行分析的 Wave，連同專案結構寫成與 spec.md 同目錄的 plan.md；只做規劃，不做各介面的實際分析。觸發關鍵字：system analysis、系統分析、plan.md、介面盤點、端點盤點、分析流程規劃、Wave。分流：把功能描述寫成 spec.md 改用 `s-specify`；技術選型改用 `technical-research`；規劃類別設計改用 `plan-with-class-diagram`。
- 依專案慣例，未經使用者實際驗證前，`description` 開頭加「（未驗證）」。
- 不加 `disable-model-invocation`。

#### W2：胖 SOP

Phase 1 與 Phase 3 與 To-Be SOP 全文相同，只有 P3-4 改為下列文字（尚未建立 RuleFile，以步驟內文的要求驗證）：

```markdown
4. `CHECK` 驗證 Phase 2 步驟 1 與步驟 2 對介面清單與 Wave 安排的要求（需求編號以 `grep` 在「目標 spec」中查核），比對 `plan.md` 與「plan 樣板組」的標頭與段落結構並確認沒有殘留的 `{{`，確認步驟 3 的填寫要求均已滿足；未通過時修正 `plan.md` 後重新驗證，最多 3 輪，第 3 輪仍未通過時將未通過的要求記為「未通過項」。
```

Phase 2 寫成下列胖 SOP（待抽取的約束暫寫在 `THINK` 步驟內文，沒有 RuleFile 載入步驟）：

```markdown
## Phase 2 -- 盤點系統介面並安排 Wave

1. `THINK` 依「分析輸入」盤點系統介面，只決定介面、端點類型與需求依據，不設計介面內容（例如 API endpoint、資料表欄位、畫面元件）：逐一檢視目標 spec 的 User Story 情境、FR、SC 與 Edge Cases，把描述同一組使用者操作或系統職責的需求歸成一個需求部位；每個需求部位依實際負責的技術端點類型（前端、後端、資料庫、手機、硬體、雲端第三方如金流或通知服務等）各列一個介面，介面名稱指出需求部位，不得只寫端點名稱；端點類型欄寫出端點類型與使用關係（例如「後端（前端 → 後端）」）；需求依據引用目標 spec 中存在的 US 情境、FR、SC 或 Edge Cases 編號並摘要與此介面相關的內容，每個 User Story 至少被一個介面引用；介面編號以端點類型的英文代號字母開頭（例如前端 `F`、後端 `B`、資料庫 `D`，不同端點類型使用不同字母），同一端點類型內從 1 連續編號，建立「介面清單」。
2. `THINK` 依「介面清單」安排分析各介面的 Wave：以技術端點類型為單位，同一端點類型的介面都放在同一個 Wave；依端點分析之間的依賴排序，被依賴的端點放在前面的 Wave，彼此沒有依賴的端點放在同一個 Wave 平行分析；每個介面恰好出現在一個 Wave。每個 Wave 寫成一個區塊：標題為「**Wave N：<端點類型>、<端點類型>**」，有兩個以上端點類型時在標題後加「（<數量> 個 Sub-agent 平行分析）」；區塊內依序列出「涵蓋介面」（介面編號）、「依賴」（第 2 個以後的 Wave 才寫，說明依賴前面 Wave 的哪些結果）與「排序理由」，建立「Wave 安排」。

完成條件：（同 To-Be Phase 2 完成條件）
```

- 施工註記：胖 SOP 尚無 RuleFile，Phase 3 完成條件暫寫「Phase 2 的要求與樣板結構已通過」；W4 的 After 一併改回 To-Be 的「兩份檢查清單與樣板結構已通過」。

#### W3：抽取 `rules/Wave安排-格式規範.md`

- 目標步驟：Phase 2 -- 盤點系統介面並安排 Wave 的 `THINK` 步驟（「依『介面清單』安排分析各介面的 Wave」）。
- Rule 1 - Wave 必須以技術端點為單位並依依賴排序（C9）：同一端點類型的介面在同一個 Wave；被依賴的端點在前；彼此沒有依賴的端點放同一個 Wave；每個介面恰好出現在一個 Wave。反例：以需求部位分 Wave（例如 Wave 1 放「前端結帳介面＋後端結帳 API」、Wave 2 放「前端訂閱介面＋後端訂閱 API」），或同一端點類型的介面拆到不同 Wave。
- Rule 2 - Wave 區塊必須寫出涵蓋介面、依賴與排序理由（C10）：標題格式與平行 Sub-agent 數的加註；Wave 1 列「涵蓋介面」與「排序理由」，第 2 個以後的 Wave 另列「依賴」；反例：沒有排序理由，或後續 Wave 沒有說明依賴。
- 正反例使用與 plan 樣板組範例不同的情境（例如含金流第三方端點的線上課程訂閱）。
- After：To-Be P2-3 插入載入步驟；P2-4 改為依已載入的「Wave 安排檢查清單」安排 Wave，刪除內文中的約束；P3-4 的驗證改為逐條驗證「Wave 安排檢查清單」。

#### W4：抽取 `rules/系統介面盤點-格式規範.md`

- 目標步驟：Phase 2 -- 盤點系統介面並安排 Wave 的 `THINK` 步驟（「依『分析輸入』盤點系統介面」）。
- Rule 1 - 介面必須從需求部位切出並歸類端點類型（C6）：逐一檢視 US 情境、FR、SC、Edge Cases，把描述同一組使用者操作或系統職責的需求歸成一個需求部位；每個部位依負責的端點類型各列一個介面；端點類型涵蓋前端、後端、資料庫、手機、硬體、雲端第三方（金流、通知服務等）；介面名稱指出需求部位；端點類型欄寫出使用關係。反例：只列「前端」「後端」「資料庫」三列。
- Rule 2 - 需求依據必須可追溯並涵蓋所有 User Story（C7）：每列引用目標 spec 中存在的編號並摘要相關內容；每個 User Story 至少被一列引用。反例：引用不存在的編號，或只寫「依需求」。
- 正反例使用與 plan 樣板組範例不同的情境。
- After：To-Be P2-1 插入載入步驟；P2-2 改為依已載入的「介面盤點檢查清單」盤點，刪除內文中屬於 C6、C7 的約束，保留 C8、C11；P3-4 的驗證改為逐條驗證兩份檢查清單，「未通過的要求」改為「未通過的 Rule 或要求」。施工後 SOP 必須與第 2 節 To-Be SOP 一致。

#### W5：授權說明

- 使用者確認範例來自 Spec-Kit 的產出時：在 `.agents/skills/system-analysis/LICENSE` 依 `technical-research/LICENSE` 前例，註明 `templates/plan.md` 與 `templates/plan.example.md` 的 plan.md 標頭與 Project Structure 段落結構（Documentation、Source Code、Structure Decision）及照片相簿範例情境衍生自 GitHub Spec Kit（MIT，Copyright GitHub, Inc.），「分析流程規劃」段落、SOP 與 RuleFile 為重新撰寫，並保留 MIT 全文；根目錄 `LICENSE` 的「授權範圍」新增一條列出 `system-analysis`。
- 使用者表示範例為自行撰寫時：不建立 LICENSE，根目錄 `LICENSE` 不修改。

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1–E9 | 本次 | 暫存專案含 `specs/001-online-pvp-1a2b/spec.md`（沿用本 repo 的線上 PVP 1A2B spec），以及執行者依該 spec 準備的 `techstack.md` 與 `research.md`。輸入：「/system-analysis specs/001-online-pvp-1a2b」 | 無 | `specs/001-online-pvp-1a2b/plan.md` 存在且符合 E1；盤點表每列名稱不是單純端點名稱，端點類型欄有「→」；引用的 US／FR／SC 編號都能在 spec 以 `grep` 找到；每個 US 都被引用；每個介面編號在 Wave 區塊恰好出現一次，同一字母開頭的介面在同一 Wave；第 2 個以後的 Wave 有「依賴」；有兩個以上端點類型的 Wave 標出 Sub-agent 數；開場句三個數字與實際一致；Source Code 樹沒有 techstack.md 以外的技術；spec 目錄只新增 plan.md，plan.md 沒有 API endpoint 清單或資料表欄位 |
| S2 | E2–E5、E7 | 本次 | 暫存專案含執行者準備的 `specs/002-gym-class-booking/spec.md`（社區健身房課程預約，含綠界 ECPay 金流與 LINE 通知）與 `techstack.md`。輸入：「幫我替 specs/002-gym-class-booking 做系統分析的初步規劃」 | 無 | 盤點表出現雲端第三方類型的介面（金流或通知），其餘判斷同 S1 的 E2–E5、E7 項目 |
| S3 | E10 | 本次 | 暫存專案沒有 `specs/` 目錄。輸入：「/system-analysis」 | 無 | 回覆要求先產出 spec.md（提到 `s-specify`）；專案中沒有新增任何 plan.md |
| S4 | E11 | 本次 | 暫存專案只有 `specs/001-online-pvp-1a2b/spec.md`，沒有 techstack.md 與 research.md。輸入同 S1 | 無 | 回覆要求先做技術研究（提到 `technical-research`）；沒有新增 plan.md |
| S5a | E12 | 本次 | 暫存專案同 S1，另有既有 `plan.md`（記錄雜湊）。輸入同 S1 | 無（遇到確認閘門時回報並結束） | 回報中有詢問是否覆寫；`plan.md` 雜湊與執行前相同 |
| S5b | E12 | 本次 | 同 S5a | 詢問是否覆寫時回覆「不要覆寫」 | 有詢問是否覆寫；`plan.md` 雜湊與執行前相同；註明未驗證同一 session 續接回覆 |

## 8. 驗收結果

- 結構診斷：`system-analysis` 為 0 個 error、0 個 warning；`rules/系統介面盤點-格式規範.md` 由 P2-1 載入，`rules/Wave安排-格式規範.md` 由 P2-3 載入，樣板組由 P3-2 載入。
- 同步：`./scripts/sync-skills.sh --from agents` 後 `--check` 為「兩邊一致」；沒有只存在於目標端、未被刪除的 Skill。施工前曾執行一次 `--from claude`，把使用者在 `.claude` 端定稿的樣板組同步到 `.agents` 端。
- To-Be 一致性：施工後 `SKILL.md` 的 `# SOP` 與第 2 節 To-Be SOP 逐字相同；範例雜湊仍為 `f2a39a058262e58e6a5ca2cbb8ef140cbc09b4b727da79dfdf79567118e6b6cf`。
- 驗收方式：6 個情境各在獨立的暫存專案（只放 `.claude/skills/system-analysis/` 與情境所需的 spec 檔，`git init` 後提交初始狀態）中，由不帶本次分析脈絡的子代理實際執行；模型為 **Sonnet**（Claude Code Agent 工具 `model: sonnet`，未另外指定推理強度）。子代理只取得 Skill 路徑、專案根目錄、日期、情境輸入與預先回覆。S1 的 `techstack.md`／`research.md` 與 S2 的 spec、techstack 由執行者準備。產出另以腳本檢查標頭、段落順序、填位符號、端點類型欄、需求編號存在與否、User Story 涵蓋、Wave 歸屬與標題、開場句數字，並以 `git status` 與雜湊比對副作用。
- S1 通過：產出 `specs/001-online-pvp-1a2b/plan.md`；盤出前端 F1–F4、後端 B1–B3 共 7 個介面，因 research §4 決定狀態只放記憶體而沒有列資料庫端點；Wave 1 前端、Wave 2 後端（含依賴）；引用的 26 個 FR／NFR／SC 編號都存在，US1–US3 都被引用；原始碼樹只用 React、Vite、Socket.IO、Express，沒有 techstack 以外的技術；spec 目錄只新增 plan.md，沒有 API endpoint 或欄位定義。
- S2 通過：盤出前端 4、後端 7、資料庫 3、金流 2（綠界付款、退款）、通知服務 1（LINE）共 17 個介面；Wave 1 前端、金流、通知服務（標 3 個 Sub-agent），排序理由說明三者互不依賴；Wave 2 後端、資料庫（標 2 個 Sub-agent）並寫出依賴；開場句數字一致；引用的編號都存在，US1–US3 都被引用。
- S3 通過：停在 P1-3，提示先以 `s-specify` 產出 spec.md；`git status` 為空。
- S4 通過：停在 P1-5，提示先以 `technical-research` 做技術研究；`git status` 為空。
- S5a 通過：停在 P1-6／P1-7，展示是否覆寫既有 `plan.md` 的提問後，未取得回覆即停止；`plan.md` 雜湊 `23a0874e…` 與執行前相同。
- S5b 通過：以預先回覆「不要覆寫」代答後於 P1-7 停止；`plan.md` 雜湊與執行前相同。未驗證同一 session 中續接回覆的行為。
- 約束分配：C1–C18 各只出現在指定的存放位置；P2-2、P2-4 只引用檢查清單，不重述 Rule 內容。
- 個案驗收條件：無。
- 子代理回報的觀察（未修改 Skill）：
  - S2 的子代理自述 P3-4 以人工對照 spec 查核需求編號，沒有照步驟使用 `grep`；腳本複查結果全部存在，不影響 E3，但顯示括號內的方法指示在 Sonnet 上不一定被遵守。
  - S5b 的子代理指出 P1-7 拒絕覆寫而停止時，SOP 沒有規定停止時要回報什麼。
  - S2 把課前提醒排程 B7 的端點類型寫成「後端（APScheduler → 後端）」，使用關係的寫法可接受但不直觀。

### 施工差異紀錄

- W2：胖 SOP 尚無 RuleFile，Phase 3 完成條件暫寫「Phase 2 的要求」，W4 完成時改回 To-Be 文字。
- W3：Rule 2 的 Bad Example 初稿與 Good Example 情境不同，依 `RuleFile-格式規範.md` Rule 9 改為同一情境。
- W4：Rule 1 的端點類型欄格式初稿要求箭頭右側寫端點類型，與定稿範例「資料庫（後端 → MySQL）」矛盾，改為箭頭右側可以寫端點類型或採用的產品名稱。
- 驗收前發現 E3／C6／C7 的需求依據來源清單不含 Key Entities 與 NFR，與定稿範例 D1 及 `s-specify` 的 spec 格式矛盾；S2 情境與 RuleFile 範例重複。停止並回報，使用者確認後擴充來源清單（只修改 RuleFile 的 Rule 1、Rule 2 條列與 Rule 2 Good Example），S2 改用健身房預約情境；SOP 不受影響。
- 與 Codex 討論驗收子代理的選模後，S5 拆成 S5a、S5b；選模原則另開 `skill-engineering` 優化，`user-verify-skill` 支援 Codex 記入 `docs/待確認.md` 第 6 項。

### 使用者實際驗證（2026-10-25）

- 方式：在 scratchpad 建暫存專案 `uv-system-analysis`（`.claude/skills/` 只放本次版本的 `system-analysis`；素材沿用 S1 的 `specs/001-online-pvp-1a2b/` 的 spec.md、techstack.md、research.md，由使用者指定 1A2B 需求並確認），以 Herdr 開新 pane 啟動 `claude --model sonnet`（Sonnet 5.5、effort medium），依課程「測試用笨一點的模型」。實跑需求以自然語言送出、不指名 Skill：「specs/001-online-pvp-1a2b 的 spec 和技術研究都做完了，幫我做系統分析的初步規劃。」
- 權限處理：信任資料夾由使用者回答 Yes，執行者代為輸入。測試 session 預設為 auto mode，之後沒有出現任何權限確認或提問畫面；執行者沒有代為放行任何項目。
- 結果：測試 session 第一個動作即自行呼叫 `system-analysis` Skill（自動觸發成功），約 53 秒完成，P3-4 有以 `grep` 查核需求編號。產出 `plan.md`：前端 F1–F4、後端 B1–B4 共 8 個介面，依 research §4 沒有列資料庫；Wave 1 前端、Wave 2 後端並寫出依賴。對照 E1–E9 全部符合（引用的 27 個 FR／NFR／SC 編號都存在，Key Entities、Edge Cases 亦有引用；US1–US3 都被引用；開場句數字一致；只新增 plan.md）；E10–E12 本輪未觸及，已由 S3–S5b 驗證。
- 觀察：Source Code 樹多了 `shared/`（前後端共用型別與判定邏輯，依 research §3），不對應任何端點類型，與 P3-1「依端點類型規劃頂層目錄」輕微偏離；測試 session 自己在回報中指出。使用者決定留到下一個單元（〈系統分析的單一職責原則 - 產出多個 Planner Skills〉改寫 `system-analysis` 時）一併處理，與驗收觀察的 `grep` 與停止回報兩項一起評估。
- 結論：使用者判定通過，移除 `description` 開頭的「（未驗證）」，其餘文字不變。測試 pane 與暫存專案（含驗收用的 `sa-accept/`）已移除。
