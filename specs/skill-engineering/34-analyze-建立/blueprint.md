# 工程藍圖：analyze－建立

- 模式：新建
- 紀錄目錄：`specs/skill-engineering/34-analyze-建立/`
- 根因報告：無（新建模式）
- 確認紀錄：使用者於 Phase 4 回覆「好」（2026-11-04）：接受推定的 E2、E4（「應」為 MEDIUM 與鎖定項目部分）、E5、E6、E7、E8（皆為通用），確認藍圖其餘內容。前置決策：使用者同意讀取 `.spec-kit/` 的 `speckit-analyze` 作為基因來源（2026-11-04，`docs/待確認.md` 第 18 項待做 1）。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 執行前後，目標 spec 目錄只有 `analysis.md` 被建立或覆寫；`spec.md`、`plan.md`、`research.md`、`techstack.md`、`tasks.md`、`ui/`、`data/`、`contracts/` 與 `.agents/constitution/` 的檔案雜湊都不變 | 本次（使用者：檢查是否一致；Spec-Kit 基因 STRICTLY READ-ONLY） | 通用 |
| E2 | 報告寫成目標 spec 目錄的 `analysis.md`，區塊順序與樣板組一致：標頭、問題清單、需求涵蓋、介面涵蓋、憲法遵循、沒有對應需求的任務、統計、下一步；沒有殘留 `{{` | 推定：Spec-Kit 只在對話輸出報告；本專案常跨對話、換電腦接手，寫成檔案才能在之後對照修正 | 通用 |
| E3 | 上游文件對同一概念的命名、值或行為說法不同時（包括 `contracts/`、`data/`、`ui/` 之間），問題清單有一筆「不一致」問題，位置至少列出兩個不同文件，每個位置寫出可在該文件搜尋到的識別字 | 本次（使用者：檢查 spec、plan（含 ui、data、contracts）、tasks 是否一致；`docs/待確認.md` 第 11 項：跨 Planner 的一致性檢查等做 Analyze 時考慮） | 通用 |
| E4 | 每份憲法檔都對照它約束的產出物：違反「必須」或「不得」規則的問題嚴重度為 CRITICAL，違反「應」規則為 MEDIUM；規則中的例外成立，或規則要求改變對應 Skill 的鎖定項目時，不列為違反；「憲法遵循」段落逐份憲法檔、逐條 Rule 列出結果 | 本次（使用者：違反憲法視為高嚴重度）；「應」為 MEDIUM 與鎖定項目為推定：本專案憲法的「應」允許有理由時偏離，鎖定項目不受憲法覆寫（32 號紀錄） | 通用 |
| E5 | 「需求涵蓋」列出 spec.md 每個 FR、NFR、SC 與引用它的任務 ID；「介面涵蓋」列出 `plan.md` 系統介面盤點的每個介面、它在 `contracts/`、`data/`、`ui/` 的對應部位與任務；兩段與「統計」的數字和 `collect_coverage.py` 的輸出一致 | 推定：Spec-Kit 的 Coverage Summary 與 Metrics；重跑時數字要固定（Spec-Kit「Deterministic results」） | 通用 |
| E6 | 已寫在 `tasks.md` Notes「待確認 n」的問題仍列入問題清單，摘要標出「已記錄：tasks.md 待確認 n」，位置仍指向上游文件，不只指向 `tasks.md` | 推定：001 的 `tasks.md` 已記下第 10、11、13 項；只抄 Notes 不能證明 Analyze 會自己找出問題 | 通用 |
| E7 | 每個問題都有「建議」與「處理 Skill」（產出該文件的 Skill，無法判斷以哪一方為準時寫「需要使用者決定」）；有 CRITICAL 問題時，「下一步」寫明 `implement` 前先處理 | 推定：Spec-Kit Next Actions；本專案每份文件都有對應的產出 Skill | 通用 |
| E8 | 找不到目標 spec、有多份 spec 而使用者沒有指定，或目標 spec 目錄缺少 `plan.md` 或 `tasks.md` 時，停止並指出要先執行的 Skill，不建立 `analysis.md` | 推定：Spec-Kit 要求 tasks 完成後才能執行 | 通用 |

## 2. To-Be SOP

````markdown
---
name: analyze
description: （由 W1 依 skill-form-description 撰寫）
---

# SOP

## Phase 1 -- 收斂分析輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「分析輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行；沒有 `tasks.md` 時，告知使用者需要先拆解任務（可使用 `tasks`）並停止執行；停止時不建立任何檔案。
5. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`tasks.md`、`research.md`、`techstack.md` 與 `ui/`、`data/`、`contracts/` 下所有檔案的全文（不存在的略過），加入「分析輸入」。
6. `READ` 在專案根目錄執行 `find .agents/constitution -type f` 列出所有憲法檔（不截斷輸出）並讀取每個檔案；對 `skills/<Skill>/` 下的憲法檔，讀取專案 `.agents/skills/<Skill>/SKILL.md`（不存在時改讀 `.claude/skills/<Skill>/SKILL.md`）中列出鎖定項目的步驟；建立「憲法輸入」，沒有憲法檔時為空。

完成條件：「目標 spec」、`plan.md`、`tasks.md` 與同目錄的上游文件已讀取，「憲法輸入」已建立；或缺少輸入，已停止執行並回報。

## Phase 2 -- 偵測問題

1. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/collect_coverage.py --spec-dir <目標 spec 目錄絕對路徑>`，取得「涵蓋盤點」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
2. `CHECK` 退出狀態為零且標準輸出為可解析的 JSON；因參數或環境錯誤而失敗時修正後重新執行上一步，仍失敗時回報原因並停止執行，不建立任何檔案。
3. `READ` 偵測問題時，讀取 `rules/分析問題-格式規範.md` 的所有 Rule，建立「問題檢查清單」。
4. `THINK` 依「分析輸入」、「憲法輸入」、「涵蓋盤點」與已載入的「問題檢查清單」，比對各文件找出問題，為每個問題決定類別、嚴重度、位置、建議與處理 Skill，建立「問題清單」；並逐份憲法檔、逐條 Rule 記下對照結果，建立「憲法遵循結果」。
5. `CHECK` 逐條驗證「問題檢查清單」，並以 `grep -n` 確認「問題清單」每個位置的識別字都能在該檔案搜尋到；未通過時修正「問題清單」後重新驗證。

完成條件：「涵蓋盤點」已取得，「問題清單」與「憲法遵循結果」已通過「問題檢查清單」，且每個位置都能搜尋到。

## Phase 3 -- 產出 analysis.md

1. `READ` `templates/analysis.md` 與 `templates/analysis.example.md`，載入骨架與範例，命名載入結果為「分析報告樣板組」。
2. `WRITE` 依「分析報告樣板組」、「問題清單」、「憲法遵循結果」與「涵蓋盤點」，將 `analysis.md` 寫入「目標 spec」所在目錄（已存在時直接覆寫），不建立或修改其他檔案：說明文字使用繁體中文；問題清單依嚴重度由高到低排列，最多 50 筆，超過的部分在表格下方依類別與嚴重度摘要筆數；「需求涵蓋」、「介面涵蓋」與「統計」的數字取自「涵蓋盤點」。
3. `CHECK` 比對 `analysis.md` 與「分析報告樣板組」的區塊結構，確認沒有殘留的 `{{`、「統計」的數字與「涵蓋盤點」一致、步驟 2 的填寫要求均已滿足，且目標 spec 目錄只有 `analysis.md` 被建立或修改；未通過時修正 `analysis.md` 後重新驗證。
4. `WRITE` 向使用者回報 `analysis.md` 路徑、各嚴重度的問題數、CRITICAL 問題的 ID 與摘要，以及「下一步」，並說明本 Skill 沒有修改任何上游文件，要修正時依各問題的處理 Skill 執行。

完成條件：`analysis.md` 已寫入目標 spec 目錄且通過步驟 3 的檢查，其他檔案沒有被修改，且已回報。
````

## 3. 差異表

基因取捨（Spec-Kit `speckit-analyze` → 本 Skill）：

| Spec-Kit 元素 | 處理 | 理由 |
| ---- | ---- | ---- |
| Extension hooks（before／after_analyze） | 不採用 | 本專案沒有 `.specify/extensions.yml` |
| `check-prerequisites.sh` 取得 FEATURE_DIR | 改寫 | 改用本專案 SDD Skill 共同的「目標 spec」決定方式（P1-1～P1-4） |
| 只在對話輸出報告、不寫檔 | 改寫 | 改為只寫入 `analysis.md`，上游文件仍不修改（E1、E2） |
| `.specify/memory/constitution.md` 單一憲法 | 改寫 | 改讀 `.agents/constitution/` 全部憲法檔，依產出物對照，並排除例外與鎖定項目（E4） |
| 偵測 A–F 六類、嚴重度四級、50 筆上限 | 沿用並擴充 | 「不一致」加入跨 Planner 產出的比對（E3）；嚴重度依本專案憲法的強度用詞（E4） |
| Coverage Summary、Metrics | 沿用，改由腳本產生 | E5 |
| 最後詢問是否提供修正建議 | 不採用 | 每個問題已有「建議」與「處理 Skill」（E7），再問一次沒有後續流程 |

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter | 新增 | `name`、`description` | 觸發與分流 |
| Phase 1 -- 收斂分析輸入（6 步） | 新增 | 決定目標 spec、缺輸入時停止、讀上游文件、讀憲法與鎖定項目 | E4、E8；C2–C6 |
| Phase 2 -- 偵測問題（5 步） | 新增 | 執行盤點腳本、載入問題規範、偵測、驗證位置 | E3–E7；C7–C14 |
| Phase 3 -- 產出 analysis.md（4 步） | 新增 | 載入樣板組、寫入、檢查、回報 | E1、E2、E5、E7；C1、C15–C17 |
| `rules/分析問題-格式規範.md`（5 條 Rule） | 新增 | 類別與 ID、位置、憲法對照、嚴重度、建議與處理 Skill | E3、E4、E6、E7；C9–C13 |
| 樣板組 `templates/analysis.md`／`analysis.example.md` | 新增 | `analysis.md` 的整體結構；範例使用購物車與結帳情境 | E2、E5；C1 |
| `scripts/collect_coverage.py` | 新增 | 盤點需求、任務、介面、Planner 產出、待確認與佔位符號，輸出 JSON | E5；C7 |
| `LICENSE` | 新增 | 註明 Spec-Kit `speckit-analyze` 衍生內容並保留 MIT 全文；更新根目錄 `LICENSE` 授權範圍 | CLAUDE.md 規則 3 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| 無（新建模式） | — | — |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 0 | 3 | +3 |
| 步驟 | 0 | 15 | +15 |
| RuleFile | 0 | 1 | +1 |
| Rule | 0 | 5 | +5 |
| 樣板組 | 0 | 1 | +1 |
| 腳本 | 0 | 1 | +1 |

- 新建模式，所有元素都是新增。
- RuleFile：問題類別、位置寫法、憲法對照、嚴重度與處理 Skill 都需要判斷與正反例（E3、E4、E6、E7），同屬「分析問題」主題，集中在一個檔案。
- 樣板組：`analysis.md` 是一份有固定區塊與表格欄位的產出檔案（E2）。
- 腳本：001 有 27 個需求編號、50 多個任務、10 個介面，逐一對照任務與 Planner 產出時人工容易漏算；輸入（spec 目錄）與輸出（JSON）明確，結果可由程式判斷，重跑時數字固定（E5）。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | `analysis.md` 的結構：標頭（spec 目錄、分析日期、已分析文件、已讀取的憲法檔、「本報告不修改任何上游文件」）；1 問題清單（ID、類別、嚴重度、位置、摘要、建議、處理 Skill）；2 需求涵蓋（需求編號、有任務、任務 ID、備註）；3 介面涵蓋（介面、端點類型、Planner 產出、任務、備註）；4 憲法遵循（憲法檔、Rule、適用產出物、結果、問題 ID）；5 沒有對應需求的任務；6 統計；7 下一步 | P3-2 | 分析報告樣板組 | 約束整份產出檔案的結構；內容需要依分析結果填寫，不是腳本可以產生的檔案 |
| C2 | 決定目標 spec 的規則（指定優先，否則唯一一份） | P1-2 | P1-2 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C3 | 目標 spec 不存在或無法確定時停止 | P1-3 | SOP 流程 | 屬於分支與停止 |
| C4 | 缺 `plan.md` 或 `tasks.md` 時停止，指向 `system-analysis` 或 `tasks`，不建立檔案 | P1-4 | SOP 流程 | 屬於分支與停止 |
| C5 | 讀取範圍：目標 spec 與同目錄所有上游文件全文 | P1-5 | P1-5 步驟內文 | 只屬於單一步驟；跨 Planner 比對需要全文 |
| C6 | 讀取全部憲法檔，以及對應 Skill 的鎖定項目步驟 | P1-6 | P1-6 步驟內文 | 只屬於單一步驟，一句話即可表達；命令為既有工具的單一命令 |
| C7 | 涵蓋盤點：spec.md 的 FR／NFR／SC 定義與 User Story；`tasks.md` 每個任務（ID、所在 Phase、`[USk]`、引用的需求編號，含 `FR-002–FR-004` 範圍展開）、組標題的介面編號與該組任務；`plan.md` 系統介面盤點的介面（編號、名稱、端點類型）；每個介面在 `contracts/` 的 operation（以 tag 開頭的介面編號對應）、`data/` 的 `Table`（以 `Note` 開頭的介面編號對應）、`ui/plan.md` 中提到該編號的段落；每個需求的任務 ID；沒有引用任何需求編號、且不屬於 User Story Phase 的任務；`tasks.md` Notes 的「待確認 n」；所有文件中的 `{{`、`TODO`、`TBD`、`TKTK`、`???`；統計（需求總數、有任務的需求數、涵蓋率、任務總數、介面總數、沒有 Planner 產出的介面數、沒有任務的介面數） | P2-1 | `scripts/collect_coverage.py` | 輸入與輸出明確、可以重複執行，結果可由程式判斷；數量多，人工容易漏算 |
| C8 | 腳本失敗時修正重跑，仍失敗則停止且不建立檔案 | P2-2 | SOP 流程 | 屬於分支與停止 |
| C9 | 問題類別與 ID：A 重複、B 歧義（模糊形容詞沒有量化標準、佔位符號）、C 不足（需求缺對象或可量測結果、任務引用 spec／plan 沒有定義的元件）、D 憲法、E 涵蓋（需求沒有任務、介面沒有 Planner 產出或沒有任務、需要建置的 SC 沒有任務）、F 不一致（同一概念在不同文件的命名或值不同、同一情境的行為說法不同、合約的錯誤碼在 `ui/plan.md` 沒有對應的回饋、spec 與 plan 的技術或資料實體互相矛盾）；ID 為類別字母加流水號，例如 `F2` | P2-4 | `rules/分析問題-格式規範.md` Rule 1 | 判斷屬於哪一類、兩個名稱是否指同一概念需要語意；需要「命名可一一對應仍算不一致」的正例與「把同一問題拆成多筆」的反例 |
| C10 | 位置：每個位置寫成 `` `檔案` → 識別字 ``（operationId、schema、`Table`／`Enum`、§ 編號、FR／NFR／SC 編號、表格中的畫面或狀態名稱）；F 類至少兩個不同文件；不得只指向 `tasks.md` Notes；問題已寫在 `tasks.md` Notes「待確認 n」時，摘要開頭標「已記錄：tasks.md 待確認 n」 | P2-4 | `rules/分析問題-格式規範.md` Rule 2 | 選擇哪個識別字能定位問題需要判斷；需要「只寫 tasks.md 待確認 1」的反例 |
| C11 | 憲法對照：憲法檔對應的產出物（`shared.md` 依其 Rule 寫明的範圍；`skills/s-specify/spec.md` → `spec.md`、`skills/technical-research/research.md`／`techstack.md`、`skills/system-analysis/plan.md`、`skills/api-plan/openapi.md`／`asyncapi.md`、`skills/data-plan/data-model.md`、`skills/ui-plan/ui-plan.md`／`ui-page.md`、`skills/tasks/tasks.md`；`skills/implement/code.md` 約束程式碼，不在分析範圍，結果寫「不適用」）；規則中的例外成立時不列為違反；規則要求改變對應 Skill 鎖定項目時不列為違反，結果寫「不套用（鎖定項目）」；產出物早於憲法時仍照常對照；每條 Rule 的結果為「通過」、「違反」、「不適用」或「不套用（鎖定項目）」 | P2-4 | `rules/分析問題-格式規範.md` Rule 3 | 判斷規則是否適用、例外是否成立需要語意；需要「把鎖定項目列為違反」的反例 |
| C12 | 嚴重度：CRITICAL 為違反「必須」或「不得」規則、缺少核心文件、或 P1 User Story 的需求沒有任何任務；HIGH 為上游文件互相矛盾且會讓實作做出不同行為、需求互相衝突、驗收標準無法測試；MEDIUM 為命名不同但可一一對應、違反「應」規則、缺少非功能需求的任務、邊界情況說明不足；LOW 為文字與輕微重複 | P2-4 | `rules/分析問題-格式規範.md` Rule 4 | 分級需要判斷影響；需要「可一一對應的命名差異列為 HIGH」的反例 |
| C13 | 建議與處理 Skill：建議寫出要改哪個文件的哪個部位、往哪個方向改；處理 Skill 填產出該文件的 Skill（`spec.md` → `s-specify` 或 `clarify-over-specs`；`research.md`、`techstack.md` → `technical-research`；`plan.md` → `system-analysis`；`contracts/` → `api-plan`；`data/` → `data-plan`；`ui/` → `ui-plan`；`tasks.md` → `tasks`；需要修改憲法時 → `constitution`）；涉及多個文件而無法判斷以哪一方為準時寫「需要使用者決定」並列出候選；「下一步」在有 CRITICAL 時寫明 `implement` 前先處理，只有 HIGH 以下時寫可以繼續並列出建議先處理的問題 | P2-4 | `rules/分析問題-格式規範.md` Rule 5 | 判斷哪一方為準需要語意；需要「只寫『請修正』」的反例 |
| C14 | 以 `grep -n` 確認每個位置的識別字可搜尋到 | P2-5 | P2-5 步驟內文 | 既有工具的單一命令即可完成，不另建腳本 |
| C15 | 寫入與填值：只寫入 `analysis.md`，已存在時直接覆寫；說明文字繁體中文；依嚴重度排序；最多 50 筆，其餘摘要筆數；涵蓋與統計數字取自「涵蓋盤點」 | P3-2 | P3-2 步驟內文 | 填值規則只屬於寫入步驟；樣板只固定位置 |
| C16 | 寫入後檢查：結構、`{{`、統計數字、只有 `analysis.md` 被修改 | P3-3 | P3-3 步驟內文 | 只屬於單一檢查步驟；結構本身由 C1 的樣板組保證 |
| C17 | 回報內容（路徑、各嚴重度數、CRITICAL 摘要、下一步、未修改上游文件） | P3-4 | P3-4 步驟內文 | 只屬於回報步驟，一句話即可表達 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/analyze/SKILL.md` frontmatter | 建立 `name` 與 `description` | 無（只概述用途與觸發） | 已完成 |
| 2 | W2 | `skill-form-sop` | `.agents/skills/analyze/SKILL.md` SOP | 寫入胖 SOP | C1–C17 | 已完成 |
| 3 | W3 | `skill-derive-template` | Phase 3 -- 產出 analysis.md 的 `WRITE` 寫入步驟 | 抽取 `templates/analysis.md`、`templates/analysis.example.md`，加入載入步驟、調整 `CHECK` 步驟 | C1 | 已完成 |
| 4 | W4 | `skill-derive-rule` | Phase 2 -- 偵測問題的 `THINK` 偵測步驟 | 抽取 `rules/分析問題-格式規範.md`，加入載入步驟、調整 `CHECK` 步驟 | C9–C13 | 已完成 |
| 5 | W5 | `skill-derive-script` | Phase 2 -- 偵測問題的 `THINK` 盤點步驟 | 抽取 `scripts/collect_coverage.py`，改為 `DELEGATE` 執行步驟並加入 `CHECK` 步驟 | C7、C8 | 已完成 |
| 6 | W6 | `skill-engineering` 直接撰寫 | `.agents/skills/analyze/LICENSE`、根目錄 `LICENSE` | 註明 Spec-Kit 衍生內容並保留 MIT 全文；授權範圍加入 `analyze` | CLAUDE.md 規則 3 | 已完成 |

### 工作項內容

#### W1：frontmatter

- `name: analyze`
- `description`：已有 spec.md、plan.md（含 system-analysis 委派產出的 ui/、data/、contracts/）與 tasks.md，要在實作前檢查這些文件是否一致時使用；不修改任何上游文件，比對 spec、plan、Planner 產出與 tasks 的重複、歧義、不足、涵蓋缺口與不一致（包括 API 合約、資料模型與 UI 規劃之間的命名與行為差異），並依 `.agents/constitution/` 檢查憲法遵循，違反必須／不得規則為 CRITICAL，每個問題標出位置、建議與處理 Skill，寫成 spec 目錄的 analysis.md。觸發關鍵字：analyze、analysis.md、一致性分析、檢查一致性、跨文件檢查、憲法檢查、實作前檢查。分流：要修正 spec 改用 `s-specify` 或 `clarify-over-specs`；要修正某一種 Planner 產出改用 `api-plan`、`data-plan` 或 `ui-plan`；要重新產生任務清單改用 `tasks`；要新增或修改憲法規則改用 `constitution`；依 tasks.md 實作改用 `implement`。
- 未經使用者實際驗證前，`description` 開頭加「（未驗證）」。

#### W2：胖 SOP

Phase 1 與 To-Be SOP 全文相同。Phase 2 與 Phase 3 寫成下列胖 SOP：

```markdown
## Phase 2 -- 偵測問題

1. `THINK` 依「分析輸入」盤點涵蓋，建立「涵蓋盤點」：spec.md 的 FR／NFR／SC 定義與 User Story；`tasks.md` 每個任務的 ID、所在 Phase、`[USk]` 與引用的需求編號（`FR-002–FR-004` 這類範圍要展開）、組標題的介面編號與該組任務；`plan.md` 系統介面盤點的每個介面（編號、名稱、端點類型），以及它在 `contracts/` 中 tag 以該編號開頭的 operation、`data/` 中 `Note` 以該編號開頭的 `Table`、`ui/plan.md` 中提到該編號的段落；每個需求的任務 ID；沒有引用任何需求編號、且不屬於 User Story Phase 的任務；`tasks.md` Notes 的「待確認 n」；所有文件中的 `{{`、`TODO`、`TBD`、`TKTK`、`???`；統計：需求總數、有任務的需求數、涵蓋率、任務總數、介面總數、沒有 Planner 產出的介面數、沒有任務的介面數。
2. `THINK` 依「分析輸入」、「憲法輸入」與「涵蓋盤點」，比對各文件找出問題，為每個問題決定類別、嚴重度、位置、建議與處理 Skill，建立「問題清單」；並逐份憲法檔、逐條 Rule 記下對照結果，建立「憲法遵循結果」：
   - 類別與 ID：A 重複、B 歧義（模糊形容詞沒有量化標準、佔位符號）、C 不足（需求缺對象或可量測結果、任務引用 spec／plan 沒有定義的元件）、D 憲法、E 涵蓋（需求沒有任務、介面沒有 Planner 產出或沒有任務、需要建置的 SC 沒有任務）、F 不一致（同一概念在不同文件的命名或值不同、同一情境的行為說法不同、合約的錯誤碼在 `ui/plan.md` 沒有對應的回饋、spec 與 plan 的技術或資料實體互相矛盾）；ID 為類別字母加流水號。
   - 位置：每個位置寫成 `` `檔案` → 識別字 ``（operationId、schema、`Table`／`Enum`、§ 編號、FR／NFR／SC 編號、表格中的畫面或狀態名稱）；F 類至少兩個不同文件；不得只指向 `tasks.md` Notes；問題已寫在 `tasks.md` Notes「待確認 n」時，摘要開頭標「已記錄：tasks.md 待確認 n」。
   - 憲法對照：`shared.md` 依其 Rule 寫明的範圍；`skills/s-specify/spec.md` 對照 `spec.md`，`skills/technical-research/research.md`、`techstack.md` 對照同名文件，`skills/system-analysis/plan.md` 對照 `plan.md`，`skills/api-plan/openapi.md`、`asyncapi.md` 對照 `contracts/` 的同名合約，`skills/data-plan/data-model.md` 對照 `data/data-model.dbml`，`skills/ui-plan/ui-plan.md` 對照 `ui/plan.md`、`ui-page.md` 對照 `ui/*.html`，`skills/tasks/tasks.md` 對照 `tasks.md`；`skills/implement/code.md` 約束程式碼，結果寫「不適用」。規則中的例外成立時不列為違反；規則要求改變對應 Skill 的鎖定項目時不列為違反，結果寫「不套用（鎖定項目）」；產出物早於憲法時仍照常對照；每條 Rule 的結果為「通過」、「違反」、「不適用」或「不套用（鎖定項目）」。
   - 嚴重度：CRITICAL 為違反「必須」或「不得」規則、缺少核心文件、或 P1 User Story 的需求沒有任何任務；HIGH 為上游文件互相矛盾且會讓實作做出不同行為、需求互相衝突、驗收標準無法測試；MEDIUM 為命名不同但可一一對應、違反「應」規則、缺少非功能需求的任務、邊界情況說明不足；LOW 為文字與輕微重複。
   - 建議與處理 Skill：建議寫出要改哪個文件的哪個部位、往哪個方向改；處理 Skill 填產出該文件的 Skill（`spec.md` → `s-specify` 或 `clarify-over-specs`；`research.md`、`techstack.md` → `technical-research`；`plan.md` → `system-analysis`；`contracts/` → `api-plan`；`data/` → `data-plan`；`ui/` → `ui-plan`；`tasks.md` → `tasks`；需要修改憲法時 → `constitution`）；涉及多個文件而無法判斷以哪一方為準時寫「需要使用者決定」並列出候選；「下一步」在有 CRITICAL 時寫明 `implement` 前先處理，只有 HIGH 以下時寫可以繼續並列出建議先處理的問題。
3. `CHECK` 逐項確認步驟 2 的要求，並以 `grep -n` 確認「問題清單」每個位置的識別字都能在該檔案搜尋到；未通過時修正「問題清單」後重新驗證。

完成條件：「涵蓋盤點」已建立，「問題清單」與「憲法遵循結果」已通過步驟 2 的要求，且每個位置都能搜尋到。

## Phase 3 -- 產出 analysis.md

1. `WRITE` 依「問題清單」、「憲法遵循結果」與「涵蓋盤點」，將 `analysis.md` 寫入「目標 spec」所在目錄（已存在時直接覆寫），不建立或修改其他檔案。檔案依序包含：標頭（spec 目錄、分析日期、已分析文件、已讀取的憲法檔，以及「本報告不修改任何上游文件」）；`## 1. 問題清單`（欄位：ID、類別、嚴重度、位置、摘要、建議、處理 Skill）；`## 2. 需求涵蓋`（欄位：需求編號、有任務、任務 ID、備註）；`## 3. 介面涵蓋`（欄位：介面、端點類型、Planner 產出、任務、備註）；`## 4. 憲法遵循`（欄位：憲法檔、Rule、適用產出物、結果、問題 ID）；`## 5. 沒有對應需求的任務`；`## 6. 統計`；`## 7. 下一步`。說明文字使用繁體中文；問題清單依嚴重度由高到低排列，最多 50 筆，超過的部分在表格下方依類別與嚴重度摘要筆數；「需求涵蓋」、「介面涵蓋」與「統計」的數字取自「涵蓋盤點」。
2. `CHECK` 確認 `analysis.md` 依步驟 1 的區塊順序與欄位、「統計」的數字與「涵蓋盤點」一致、步驟 1 的填寫要求均已滿足，且目標 spec 目錄只有 `analysis.md` 被建立或修改；未通過時修正 `analysis.md` 後重新驗證。
3. `WRITE` 向使用者回報 `analysis.md` 路徑、各嚴重度的問題數、CRITICAL 問題的 ID 與摘要，以及「下一步」，並說明本 Skill 沒有修改任何上游文件，要修正時依各問題的處理 Skill 執行。

完成條件：`analysis.md` 已寫入目標 spec 目錄且通過步驟 2 的檢查，其他檔案沒有被修改，且已回報。
```

#### W3：抽取樣板組（Phase 3 寫入步驟）

- 從胖 SOP Phase 3 的 `WRITE` 寫入步驟抽出 C1：`templates/analysis.md`（骨架，含 `{{}}` 填位符號）與 `templates/analysis.example.md`（購物車與結帳情境 `specs/004-shopping-cart-checkout/` 的完整報告，至少含一筆 F 類跨 Planner 不一致、一筆 D 類 CRITICAL、一筆標「已記錄：tasks.md 待確認 n」的問題、一條「不套用（鎖定項目）」的憲法結果）。
- After：Phase 3 加入 `READ` 樣板組載入步驟；寫入步驟改為依「分析報告樣板組」；`CHECK` 改為比對樣板組區塊結構並確認沒有殘留 `{{`；步驟 1 中的區塊與欄位描述刪除，C15 的填值要求保留在寫入步驟。

#### W4：抽取 RuleFile（Phase 2 偵測步驟）

- 從胖 SOP Phase 2 的 `THINK` 偵測步驟抽出 C9–C13，寫成 `rules/分析問題-格式規範.md` 的 Rule 1 問題類別與 ID、Rule 2 位置、Rule 3 憲法對照、Rule 4 嚴重度、Rule 5 建議與處理 Skill，每條附 Good／Bad Example（使用購物車與結帳情境，不使用 1A2B）。
- After：Phase 2 在偵測步驟前加入 `READ` 規範載入步驟，偵測步驟改為依已載入的「問題檢查清單」；`CHECK` 改為逐條驗證「問題檢查清單」並保留 `grep -n` 位置確認（C14）。

#### W5：抽取腳本（Phase 2 盤點步驟）

- 從胖 SOP Phase 2 的 `THINK` 盤點步驟抽出 C7，寫成 `scripts/collect_coverage.py`：參數 `--spec-dir <目錄>`；標準輸出 JSON，至少包含 `requirements`（`id`、`kind`、`tasks`）、`user_stories`、`tasks`（`id`、`phase`、`story`、`requirements`）、`interfaces`（`id`、`name`、`endpoint_type`、`contracts`、`data`、`ui`、`tasks`）、`unmapped_tasks`、`pending_notes`、`placeholders`（`file`、`line`、`text`）、`metrics`；缺少 `spec.md`、`plan.md` 或 `tasks.md` 時以非零狀態結束並在標準錯誤輸出說明。
- After：盤點步驟改為 `DELEGATE` 執行腳本取得「涵蓋盤點」，並在其後加入 `CHECK`：退出狀態為零且輸出為可解析 JSON，失敗時修正重跑，仍失敗則停止且不建立檔案（C8）。

#### W6：LICENSE

- `.agents/skills/analyze/LICENSE`：本 Skill 為自建 Skill，偵測類別（重複、歧義、不足、憲法、涵蓋、不一致）、嚴重度四級、50 筆上限、Coverage Summary 與 Metrics 的概念衍生自 GitHub Spec Kit 的 `speckit-analyze`（MIT License，Copyright GitHub, Inc.）；SOP、跨 Planner 比對、憲法對照、`analysis.md` 樣板組、RuleFile 與腳本為重新撰寫；保留 MIT 授權全文。
- 根目錄 `LICENSE` 授權範圍：比照 `tasks` 加入一行 `analyze`。

## 7. 驗收情境

測試環境皆為專案的暫存複本，含 `.agents/skills/analyze/`、`.agents/constitution/`（目前版本）與 `specs/001-online-pvp-1a2b/` 全部產出；情境輸入使用 1A2B，與樣板範例的購物車情境不同。執行前記錄 `git status` 與所有檔案的雜湊。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E3、E4、E5、E6、E7 | 本次 | 「幫我檢查 specs/001-online-pvp-1a2b 的 spec、plan、tasks 有沒有互相矛盾」 | 無 | (1) 只新增 `specs/001-online-pvp-1a2b/analysis.md`，其他檔案雜湊不變；(2) 區塊順序與樣板組一致、無 `{{`；(3) F 類問題涵蓋 `docs/待確認.md` 第 11 項（`data/data-model.dbml` → `room_status` 與 `contracts/` → `RoomState`）、第 13 項之 1（`game_end_reason` 與 `GameResult`）、第 10 項（`ui/plan.md` §1 與 `contracts/asyncapi.yaml` 的 `OPPONENT_LEFT_BEFORE_START`），每筆位置至少兩個文件，且識別字可 grep 到；(4) 這三筆的摘要標「已記錄：tasks.md 待確認 1」或「待確認 4」；(5) `data-model.md` Rule 1 對 `players`、`rooms`、`secret_answers`、`guesses` 結果為「違反」，對應問題為 D 類 CRITICAL；`skills/implement/code.md` 結果為「不適用」；(6) 需求涵蓋列出 27 個 FR／NFR／SC，任務 ID 與統計和重跑 `collect_coverage.py` 的輸出一致；介面涵蓋列出 F1–F4、B1–B4、D1–D2；(7) 每筆問題有建議與處理 Skill；有 CRITICAL 時下一步寫 `implement` 前先處理 |
| S2 | E1、E3、E4、E5 | 本次 | 同 S1 輸入。測試環境另外修改：(a) `spec.md` FR-005 的「恰好四位」改為「恰好六位」；(b) `spec.md` 新增 `- **FR-019**: 系統必須 (MUST) 在對戰畫面顯示雙方已用的猜測次數。`；(c) `.agents/constitution/skills/api-plan/openapi.md` 新增 Rule 6「每個 operation 的 `tags` 必須使用資源名稱，例如 `rooms`」；(d) 同檔新增 Rule 7「每個 operation 應宣告 `429` 回應」 | 無 | (1) 只新增 `analysis.md`；(2) 有 F 類問題，位置含 `spec.md` → FR-005 與 `contracts/openapi.yaml` 的配對碼 `pattern`（或 `ui/plan.md` 的配對碼說明）；(3) 需求涵蓋中 FR-019 沒有任務，並有一筆 E 類問題；(4) 憲法遵循中 Rule 6 結果為「不套用（鎖定項目）」，沒有對應的違反問題；Rule 7 結果為「違反」，對應問題嚴重度為 MEDIUM；這 4 項都不是 `tasks.md` Notes 已記錄的內容 |
| S3 | E8、E1 | 本次 | (a) 測試環境刪除 `specs/001-online-pvp-1a2b/tasks.md`，輸入「分析 specs/001-online-pvp-1a2b 的一致性」；(b) 測試環境另放一份 `specs/002-room-game-chat/`（目前版本，沒有 `tasks.md`），輸入「幫我做 analyze」 | 無 | (a) 停止並指向 `tasks`，沒有建立 `analysis.md`；(b) 列出兩份 spec 請使用者指定並停止，沒有建立任何檔案；兩者其他檔案雜湊不變 |

## 8. 驗收結果

- 結構診斷：`analyze` 為 0 個 error、0 個 warning。
- 同步：`./scripts/sync-skills.sh --from agents` 與 `--check` 退出狀態均為零，結果為「兩邊一致」；沒有只存在於目標端、未被刪除的 Skill。
- To-Be 一致性：`.agents/skills/analyze/SKILL.md` 的 SOP 與第 2 節逐字相同（P1 6、P2 5、P3 4 步）。
- 施工方式：W1–W6 由 `implementer` 子代理依本藍圖與各 `skill-form-*`／`skill-derive-*` 的 SOP 施工，沒有回報差異。腳本實跑 001：27 個需求、59 個任務、10 個介面、6 個待確認；002（沒有 `tasks.md`）以狀態 2 結束。
- 驗收方式：每個情境在 `/tmp/accept34.*/<情境>` 暫存專案執行（含 `.agents/skills/`、`.agents/constitution/` 與 `specs/001-online-pvp-1a2b/`，執行前以 git commit 記錄基準）。子代理不帶本次分析脈絡，以 Agent 工具指定 `model: sonnet`、`effort: medium`（Sonnet 5.5，低於主模型 Opus 5.5），以 `general-purpose` 執行。執行後由主 session 以 `git status`、`analysis.md` 內容與重跑 `collect_coverage.py` 核對。

| 編號 | 結果 | 摘要 |
| ---- | ---- | ---- |
| S1 | 通過 | 只新增 `analysis.md`；8 個區塊與樣板一致、無 `{{`；F1 涵蓋第 11 項與第 13 項之 1（位置含 `Enum room_status`、`Enum game_end_reason`、`RoomState`、`GameResult`），F2 涵蓋第 10 項（`ui/plan.md` 不在範疇、`OPPONENT_LEFT_BEFORE_START`），兩筆都標「已記錄：tasks.md 待確認 1／4」；D1 CRITICAL 為 `data-model.md` Rule 1；需求涵蓋 27 列、統計與重跑腳本一致；每筆有處理 Skill；下一步寫 `implement` 前先處理。`code.md` 不存在，判斷項 (5) 的「不適用」無從檢查 |
| S2 | 通過 | 只新增 `analysis.md`；F1（HIGH）位置含 `spec.md` → FR-005、`matchRoom`、`Table rooms`；FR-019 無任務並有 E1；Rule 6 為「不套用（鎖定項目）」，沒有對應問題；Rule 7 為「違反」，D4 為 MEDIUM；這 4 項都不在 `tasks.md` Notes |
| S3 | 通過 | (a) 缺 `tasks.md` 時停止並指向 `tasks`；(b) 列出 001、002 請使用者指定並停止；兩者 `git status` 都沒有變更 |

- 驗收條件對照：E1（S1–S3）、E2（S1）、E3（S1、S2）、E4（S1、S2）、E5（S1、S2）、E6（S1）、E7（S1）、E8（S3）。
- 觀察（未施工，待使用者決定）：
  1. `shared.md` Rule 1 與 `tasks.md` 的英文固定段落：S1 判「通過」，S2 判「違反」並列 CRITICAL（D3）。`tasks` 的 SOP 規定樣板的英文固定段落保留原文，和 `shared.md` Rule 1 的字面要求衝突，兩次執行的判斷不同。
  2. 嚴重度合併：S1 把命名差異與「設定階段離開」的行為差異合成一筆 F1 並列 MEDIUM；S2 拆成兩筆，行為差異列 HIGH。Rule 4 規定一筆符合多個等級時取最高，S1 偏離。
  3. 需求涵蓋率會被範圍引用蓋掉：001 的 T059 引用 `FR-001–FR-018`，腳本展開後每個 FR 都有任務，涵蓋率 100%。
  4. 有多份 spec 時只列清單，沒有提醒哪一份缺 `tasks.md`（S3b）。
- 個案驗收條件：無。

### 使用者實際驗證（2026-11-04）

- 方式：以 `user-verify-skill` 在暫存專案 `/tmp/verify-analyze.iQIU` 實跑。素材為 `specs/001-online-pvp-1a2b/` 全部產出、`.agents/constitution/`（目前版本）與 9 個 SDD Skill 的 `SKILL.md`（供讀取鎖定項目）；`analyze` 放在 `.claude/skills/`。以 Herdr 在新 pane 啟動全新的 Claude Code，測試模型為 `sonnet`、推理強度 `medium`。需求以自然語言送出、不指名 Skill：「準備開始實作 001 之前，幫我確認 API 合約、資料模型和畫面規劃之間有沒有對不起來的地方，也檢查有沒有違反專案憲法」。
- 權限處理：信任資料夾由使用者回答「Yes, I trust this folder」；測試 session 為 auto mode，之後沒有權限提問，沒有自行放行。
- 結果（第 1 輪）：通過。測試 session 自行觸發 `analyze`；只新增 `analysis.md`；8 個區塊與樣板一致、無 `{{`；找出第 10、11、13 項（F1 HIGH 行為差異、F2 MEDIUM 命名差異、F3、F4、C2–C4），7 筆標「已記錄：tasks.md 待確認 n」；D2、D3 為 `data-model.md` Rule 1、2 的 CRITICAL；統計 27 需求、59 任務、10 介面，與腳本一致；每筆有處理 Skill，下一步寫 `implement` 前先處理。E1–E7 符合；E8 本輪未涵蓋（S3 已驗證）。
- 觀察：
  1. `shared.md` Rule 1 對 `tasks.md` 英文固定段落再次判為違反（D1 CRITICAL），與 S2 相同，見 `docs/待確認.md` 第 24 項。
  2. 本輪嚴重度合併正確（行為差異 HIGH、命名差異 MEDIUM），S1 的偏離沒有重現。
  3. 回報後主動詢問是否代為處理 D3 或呼叫 `data-plan`；SOP 沒有這一步，但沒有修改任何檔案。
- 結論：使用者判定通過，移除 `description` 開頭的「（未驗證）」；重跑同步，結果為「兩邊一致」。
