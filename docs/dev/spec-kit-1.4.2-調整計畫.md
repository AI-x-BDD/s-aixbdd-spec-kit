# Spec Kit v1.4.2 調整計畫

- 日期：2026-11-18
- 目標：把自建的 SDD 工作流更新到 Spec Kit v1.4.2 的功能，但保持本專案自己的樣子。
- 輸入：[落差分析](./spec-kit-1.4.2-落差分析.md)（58 項落差、要保留的 12 項做法、實際案例）；課程第二章第 10、11 單元，第三章第 10～18 單元，第四、五章導讀與第四章第 7、8 單元、第五章第 9～12 單元；上游 `github/spec-kit` tag `v1.4.2` 原文（把握「中」「低」的項目全部重讀）。
- 狀態：只有計畫。沒有建立或修改任何 Skill，沒有 commit。
- 「決定 N」：要由使用者決定的事。9 個決定已由使用者在 2026-11-19 以 `clarify` 確認，結論見第 9 節；各段已依結論修改。

## 1. 課程的做法（本計畫照這些做）

### 1.1 新建 Skill：Artifact-First（第三章第 10、11 單元）

1. 取得樣本：用 Spec Kit 原版命令跑一次，取得具體的產出物，不拿抽象的樣板。
2. 定稿範例：把樣本放進新 Skill 的 `templates/<名字>.example.md`，依需求改成理想樣本，有歧義時用 `clarify` 提問。
3. 抽樣板：用 `skill-form-template` 從範例倒抽骨架。
4. 反推 SOP 與 rules：用 `skill-engineering`，以樣板組為目標產出物，給原始輸入，要求先寫最簡 SOP、需要時才加 rules 與 scripts、避免過度工程、先提案。要明講「不參考 Spec Kit 其他內容、不做落差分析」。
5. 換情境驗收：驗收情境不能和樣本撞到，否則 AI 會照抄樣本（第 10 單元 35:04；第 14 單元把範例改成電商）。
6. 和原版比較：請 AI 條列「原版還有哪些優點可以加入」，使用者挑選，再用 `skill-engineering` 併回（第 10 單元 39:47～43:00）。

本專案的 `artifact-to-skill-engineering` 已涵蓋第 1～4 步。第 5、6 步要在每批另外做。

### 1.2 產出物是程式碼時（第三章第 16 單元）

`implement` 的產出是程式碼，不能用樣板限制，所以不走 Artifact-First。做法是：請 AI 列出上游命令的行為約束與好處，提案整合進本專案的流程，使用者選擇後用 `skill-engineering` 施工。

### 1.3 修改既有 Skill（第二章第 11 單元）

用 `skill-engineering`：根因分析 → 使用者確認 → `skill-form-sop` 重整 → 委派 `skill-derive-*` → 刪除無法追溯的內容 → 驗收。只改單一步驟時直接用：

- `skill-derive-script`：步驟「重複且輸入輸出明確」才抽腳本；單檔 Python、PEP 723、`uv run`（第二章第 10 單元 05:32～10:18）。既有腳本改內容用 `skill-form-script`。
- `skill-derive-rule`、`skill-derive-template`：為某一步加規則或樣板。

### 1.4 課程已經對 Spec Kit 做過的取捨（本計畫預設沿用）

| 上游做法 | 課程的決定 | 出處 |
|---|---|---|
| hook、插件化 | 不要。Skill 為了配合掛鉤，注意力品質會變差 | 第三章第 10 單元 40:21～41:24 |
| 樣板分層（Template Resolution Stack） | 不要，太複雜 | 同上 41:24～41:55 |
| 記錄目前功能的狀態檔 | 不要，直接在對話給 Spec Package 路徑 | 同上 41:24；第 12 單元 14:47～15:48 |
| 功能目錄的編號規則 | 採納 | 第 10 單元 40:52～41:24 |
| 提問預算（Clarification Budget） | 採納 | 第 10 單元 41:55～42:28 |
| 外顯式 Checklist Artifact | 採納 | 第 10 單元 42:28～42:58 |
| 一次只問一題 | 不要，太慢；一次 3～5 題 | 第 10 單元 42:28～42:58；第 17 單元 06:55～07:24 |
| 全域憲法、憲法放流程或工程原則 | 不要。憲法只約束產出物；測試另開 Skill | 第 18 單元 06:47～08:20 |
| Constitution Sync | 沒必要 | 第 18 單元 13:39～13:48 |
| Complexity Tracking、Summary、Tech Stack 段 | 刪除，對 AI 不好懂或重複 | 第 13 單元 11:03～12:03 |
| 一次載入全部 Artifact、硬性 TDD | 捨棄；TDD 留到第四章 | 第 16 單元 09:24～11:06 |
| repo 衛生（ignore 檔） | 保留 | 第 16 單元 07:41～08:44 |
| 答案接受後立即寫回、Taxonomy 分類表 | 保留（`clarify-over-specs`） | 第 17 單元 03:48～08:25 |

注意：課程採納了「外顯式 Checklist Artifact」，但本專案的 `s-specify` 只在記憶中自檢，沒有寫檔（落差 C1）。

### 1.5 後面章節會處理的事

- 第四章：`testplan` 放在 `system-analysis` 之後；`tasks` 每個測案拆成紅、綠、重構三個任務；`implement` 呼叫 `tdd`，紅燈要實跑確認失敗才打勾（第四章第 7、8 單元）。
- 第五章：`spec-by-example`、`dsl-refine` 加入流程；`tasks` 改以 Feature File 為單位；區分 Truth 與 Plan，`specs/plans/` 與 `specs/truth/` 分開；`truth-delta.md` 記錄每次對 Truth 的新增、修改、刪除；`tasks` 新增「Truth 對齊」Phase（第五章第 9～12 單元）。
- 課程沒有提到：converge、checklist 命令、欄位引用、成功標準寫法、bug 修正流程、構想評估。

## 2. 目標狀態

### 2.1 四種做法

#### SDD 流程（新功能）

1. `constitution`（視需要）
2. `s-specify`：新增寫出 `checklists/requirements.md`、編號腳本（批 4）
3. `clarify-over-specs`（視需要）：新增回報檢查清單前後通過數（批 4）
4. `technical-research`
5. `system-analysis` → `api-plan`、`data-plan`、`ui-plan`
6. `notification-plan`（視需要）
7. `tasks`：新增欄位引用（批 2）
8. `analyze`：新增欄位涵蓋、任務順序檢查（批 2）
9. `implement`
10. `converge`（新，批 3）：對照 spec、plan、tasks 與程式碼，寫缺口報告 `convergence.md`；有缺口時由 `tasks` 的附加模式在 `tasks.md` 結尾加 Convergence Phase → 回到第 9 步只做該 Phase → 再跑 `converge`，直到回報 Converged
11. 使用者驗證、Skill 表現檢查、收尾（runbook 既有步驟）

小變更路徑（批 7，只改 runbook）：沒有新技術主題時跳過 `technical-research`，沿用 `techstack.md`；沒有新介面時只重跑受影響的 Planner（runbook 既有 P5b）。

#### 錯誤修正流程（新，批 1）

報告放在 `specs/bugs/<slug>/`。

1. `bug-assess`：寫 `assessment.md`。內容：症狀、完整的預期行為、重現步驟（不知道的標待確認，不猜）、可疑程式路徑、判定、首選修法與 0～2 個替代、要改的檔案、要補的測試、風險。不改程式。
   - 判定為「要改變已同意的意圖」時（落差 B1），不進修正，轉回 SDD 流程。
2. 使用者關卡：使用者核准修法後才進第 3 步。
3. `bug-fix`：把 assessment 的修法、檔案、測試當契約，只改列出的檔案。發現 assessment 判斷錯誤時停止，寫「偏離」，建議重跑 `bug-assess`。寫 `fix.md`。
4. `bug-test`：重跑重現步驟、新測試、回歸。不改程式。寫 `test.md`。最高結果是「待使用者驗證」，不能寫「已驗證」。
5. 使用者驗證：結果寫進 `test.md`。

#### 構想評估流程（新，批 6）

報告放在 `specs/ideas/<slug>/`。

1. `idea-assess`：一個 Skill 依序跑 5 個 Phase：intake → research → define → shape → decide，中間沒有人工關卡。research 一定要寫「反對這個構想的證據」，找不到也要明寫。
2. 結論：go、needs-clarification、kill。go 需要問題成立度與證據強度都至少 adequate。
3. 使用者關卡：使用者決定是否採用。
4. go 時：交接摘要當作 `s-specify` 的功能描述，手動交接。

#### 自訂流程的做法

| 要做的事 | 用什麼 |
|---|---|
| 新增或改變流程、步驟、Skill | `skill-engineering`；有產出物範例時用 `artifact-to-skill-engineering` |
| 約束某個產出物的內容 | `constitution` |
| 串接步驟、放人工關卡、續跑 | runbook（一步一個提示詞，迭代紀錄記進度） |
| 自動接續 | 自動模式（`scripts/auto-mode.sh`） |
| 每種工作用哪個模型 | CLAUDE.md「模型與 effort」表 |
| 多個 agent 共用 | `scripts/sync-skills.sh` |

### 2.2 調整後的 Skill 清單

| Skill | 狀態 | 批次 |
|---|---|---|
| `bug-assess`、`bug-fix`、`bug-test` | 新建 | 1 |
| `converge` | 新建 | 3 |
| `idea-assess` | 新建 | 6 |
| `data-plan` | 修改：驗證規則、狀態轉換 | 2 |
| `tasks` | 修改：欄位引用（批 2）；附加模式（批 3） | 2、3 |
| `analyze` | 修改：欄位涵蓋、順序檢查、嚴重度細節 | 2 |
| `s-specify` | 修改：檢查清單檔、成功標準寫法、免問清單、讀者、編號腳本 | 4 |
| `clarify-over-specs` | 修改：檢查清單前後通過數 | 4 |
| `api-plan` | 修改：行為語意 | 5 |
| `system-analysis` | 修改：Wave 規則，資料庫介面排在後端介面之前，讓 `data-plan` 成為共用欄位的權威擁有者 | 5 |
| `implement` | 修改：ignore 檔條件 | 5 |
| `clarify` | 不改（外部 Skill，規則 2） | — |
| `constitution`、`technical-research`、`ui-plan`、`notification-plan`、`plan-with-class-diagram`、`user-verify-skill`、`skill-*` 家族、`conventional-commits` | 不改 | — |

新 Skill 名稱不能和全域 Skill 撞名。全域已有 `implement`、`diagnosing-bugs`。

## 3. 58 項逐項決定

### 3.1 重讀原文後的修正

把握「中」「低」的項目都重讀了上游原文。落差分析要修正的描述：

| 編號 | 修正 |
|---|---|
| A5 | lean 的 README 只寫「沒有樣板」；「不跑 hook」是從命令文字推得的 |
| B4 | 上游規則是「已成立，或團隊明確同意採用」，不只「已成立」 |
| C4 | 上游沒有「同時有量化與質性」。上游要求的是 user-focused。本專案只收量化，比上游嚴 |
| C5 | 優先序與免問清單在上游 `specify.md:133、307-317`，不在 `clarify.md` |
| C12 | 本專案不是完全沒有逾時：Edge Case 有逾時的寫法。缺的是副作用、冪等、順序、版本與權威擁有者 |
| C16 | 上游也接受「使用者要求 TDD」；「先確認失敗」在 `tasks-template.md`，不在命令檔 |
| C22 | 不成立。上游也依 spec 的優先序；本專案 spec 的故事順序實際就是優先序 |
| C24 | 本專案的 Phase Checkpoint 已實跑 Independent Test 與 SC 量測，落差比原描述小 |
| E3 | 每步指定模型是引擎能力，`speckit/workflow.yml` 本身沒設定 |
| E12 | 上游 0.14.4 起已把憲法傳播移出核心，理由是會重複單一事實來源 |

把握改為「高」：C7、C8、C13、C17、C20、C26、B5、E2、E4～E8、E12。降為「低」：C19、C24。

### 3.2 決定總表

統計：做 20 項、不做 31 項、留到後面章節 7 項。

#### A. 整條流程或步驟

| 編號 | 決定 | 理由 | 批次 |
|---|---|---|---|
| A1 converge | 做 | 迭代 6 的換頁缺口要到合併後重跑 `analyze` 才發現；實作後對照 spec 的步驟課程與後面章節都沒有 | 3 |
| A2 錯誤修正流程 | 做 | T042 修了 3 次、約 60 分鐘，原因是沒先寫預期與根因；目標狀態要求這條流程 | 1 |
| A3 構想評估流程 | 做 | 目標狀態要求；選題時缺固定的反對證據與 kill 判定 | 6 |
| A4 checklist 命令 | 不做 | 課程採納的需求檢查清單由 C1 帶入；領域清單要審查者角色，且它在 implement 的關卡和「不提問」衝突 | — |
| A5 lean 精簡流程 | 做（只改 runbook） | 本專案的 `tasks` 需要 plan 與 Planner 產出，不能整段跳過；改寫成「可跳過哪些步驟」的小變更路徑 | 7 |
| A6 quickstart.md | 留到第四章 | 第四章 `testplan` 的 Acceptance Journey 是課程對端到端驗證的做法 | — |

#### B. 修改既有功能與規格保存

| 編號 | 決定 | 理由 | 批次 |
|---|---|---|---|
| B1 缺陷與意圖改變分流 | 做 | T042 第 2 次修正直接改了 `ui/plan.md` 的意圖；放進 `bug-assess` 的判定與 runbook 步驟 10 的分類 | 1 |
| B2 意圖改變回寫文件 | 留到第五章 | 第五章由 Truth Owner 修改 Truth 並寫 `truth-delta.md`；批 1 先規定意圖改變轉回 SDD 流程 | — |
| B3 規格保存模型 | 留到第五章 | 第五章的 Truth／Plan 分離就是本專案要選的模型（`docs/待確認.md` 第 3、4 項） | — |
| B4 既有專案導入 | 做（只改 runbook） | 第 2 次以後的功能描述加「必須保持不變的相容邊界」；憲法部分不改，`constitution` 本來只寫使用者描述的規則 | 7 |
| B5 Spec of specs | 做（只改 runbook） | 迭代 4 的 C3 寫「留給下一次」後沒有追蹤；runbook §5 表格加 ID、狀態、遺留項欄即可，不另建 roadmap 檔 | 7 |

#### C-1 需求階段

| 編號 | 決定 | 理由 | 批次 |
|---|---|---|---|
| C1 規格品質清單寫成檔案 | 做 | 課程採納了外顯式 Checklist Artifact，本專案沒有落實 | 4 |
| C2 憲法版本與修訂紀錄 | 不做 | git 歷史已是修訂紀錄；課程沒有採用；一人專案沒有共識流程要記 | — |
| C3 憲法放工程原則 | 不做 | 刻意的設計；課程明確反對（第 18 單元） | — |
| C4 成功標準寫法 | 做 | 補「從使用者或業務角度描述」一句；不加質性指標（上游也沒有） | 4 |
| C5 免問清單與提問優先序 | 做 | 寫在 `s-specify` 的需求缺口步驟，不寫進外部的 `clarify` | 4 |
| C6 一次問一題、每題寫回 | 不做 | 課程明確選一次 3～5 題（第 17 單元）；每輪寫回在效果上相同 | — |
| C7 跳過 clarify 要警告 | 做 | `s-specify` 的最後建議多一句重工風險，成本很低 | 4 |
| C8 讀者與依賴 | 做 | 規則加「讀者是非技術利害關係人」；對既有系統的依賴要放哪一段，在根因分析時處理（見風險 R8） | 4 |

#### C-2 規劃階段

| 編號 | 決定 | 理由 | 批次 |
|---|---|---|---|
| C9 兩次 Constitution Check | 不做 | `analyze` 已在 `tasks` 之後對全部產出物做憲法檢查；在 `system-analysis` 再查會重複，也超出它「只規劃、委派、回報」的職責 | — |
| C10 Complexity Tracking | 不做 | 刻意刪除；課程說對 AI 不好懂（第 13 單元） | — |
| C11 Technical Context 必填欄位 | 留到第五章 | `techstack.md` 在第五章改成 Truth，格式到時一起重設計（`docs/待確認.md` 第 4 項）；未解決判 ERROR 和本專案「記未通過項」的做法相反 | — |
| C12 合約行為語意與權威擁有者 | 做 | 迭代 1～3 每次都有 `api-plan` 與 `data-plan` 命名不一致（`SDD流程不足總整理.md` 第 1 項，未處理） | 5 |
| C13 資料模型驗證規則與狀態轉換 | 做 | C14、C15 要引用的欄位約束必須先寫在資料模型裡 | 2 |

#### C-3 任務與分析階段

| 編號 | 決定 | 理由 | 批次 |
|---|---|---|---|
| C14 欄位引用 | 做 | v1.4.2 最新功能；改用引用可刪掉任務描述裡重抄的約束，符合單一溯源 | 2 |
| C15 analyze 欄位涵蓋表 | 做 | 和 C14 成對；沒有它就檢查不到 C14 有沒有做到 | 2 |
| C16 測試任務 | 留到第四章 | 第四章 `tasks` 每個測案拆紅、綠、重構，紅燈先失敗 | — |
| C17 任務順序檢查 | 做 | 只要在 F 類（不一致）加一種情況，成本低 | 2 |
| C18 修正建議先問使用者 | 不做 | `analyze` 本來不改文件；由使用者依 runbook 步驟 7 決定交給哪個 Skill，效果相同 | — |
| C19 重跑得到相同 ID | 不做 | 把握低；ID 規則與涵蓋腳本已是確定的 | — |
| C20 嚴重度細節 | 做 | SC 分母含上線後 KPI 會讓涵蓋率偏低；安全、效能描述模糊應列 HIGH | 2 |
| C21 tasks 完成回報 | 不做 | Independent Test 與 MVP 標記已在 `tasks.md` 裡，回報再列一次是重複 | — |
| C22 依優先度排序 | 不做 | 重讀後不成立 | — |

#### C-4 實作階段

| 編號 | 決定 | 理由 | 批次 |
|---|---|---|---|
| C23 checklist 關卡 | 不做 | 和 `implement` 全程不提問衝突；A4 也不做，沒有清單可查 | — |
| C24 完成驗證對照 FR/SC | 留到第四、五章 | 第四章的 Acceptance Journey、第五章的 Acceptance Gate 會做；對照 spec 的缺口另由 converge 處理 | — |
| C25 [P] 平行執行 | 不做 | 刻意的設計；一次一個任務由腳本強制 | — |
| C26 其他 ignore 檔 | 做 | 課程保留這個基因；只在專案用到 npm 發布、Terraform、Helm、k8s 時才處理 | 5 |

#### D. 腳本與目前功能

| 編號 | 決定 | 理由 | 批次 |
|---|---|---|---|
| D1 `feature.json` | 不做 | 課程明確不要；runbook 以 `{SPEC_DIR}` 在提示詞寫明路徑，已等效 | — |
| D2 建立目錄的腳本 | 做 | 課程採納編號規則；`specs/` 已有兩個 `001-`，現行 SOP 文字察覺不到 | 4 |
| D3 共用前置檢查腳本 | 不做 | 每個 Skill 要能獨立運作；共用腳本會讓 Skill 互相依賴 | — |
| D4 三種腳本語言 | 不做 | 課程只用 Python 加 `uv run` | — |

#### E. 自訂流程的機制

| 編號 | 決定 | 理由 | 批次 |
|---|---|---|---|
| E1 命令前後的 hook | 不做 | 課程明確反對插件化 | — |
| E2 樣板分層覆寫 | 不做 | 課程說太複雜；改樣板用 `skill-form-template`，約束內容用憲法 | — |
| E3 workflow 引擎 | 不做 | runbook 加自動模式已提供關卡與續跑；新流程寫進 runbook | — |
| E4 extension | 不做 | `skill-engineering` 加 `sync-skills.sh` 已等效 | — |
| E5 preset | 不做 | 內容用憲法、流程用 `skill-engineering`；lean 的需求由 A5 處理 | — |
| E6 bundle | 不做 | 一人專案；兩邊 skills 同步已涵蓋 | — |
| E7 artifact inventory | 不做 | 本專案沒有來源層；`audit_skill.py --graph` 足夠 | — |
| E8 雜湊升級機制 | 不做 | 外部 Skill 只有 `clarify`，`clarify/LICENSE` 已記修改處 | — |
| E9 handoffs | 不做 | Skill 回報的下一步建議加自動模式 `next` 已等效 | — |
| E10 git extension | 不做 | `s-specify` 刻意不建分支；commit 由使用者在 runbook 檢查點決定 | — |
| E11 agent-context | 不做 | 會讓 CLAUDE.md 每次迭代都變動並觸發同步；runbook 已在提示詞寫路徑 | — |
| E12 constitution-sync | 不做 | 課程說沒必要；上游也已移出核心 | — |

#### F. 影響小或不適用

| 編號 | 決定 | 理由 | 批次 |
|---|---|---|---|
| F1 Monorepo | 留到第五章 | 第五章重排 `specs/plans/` 與 `specs/truth/` 時一起處理多系統混放 | — |
| F2 github extension | 不做 | 一人課程專案用不到 issues | — |
| F3 plan.md Summary | 不做 | 刻意刪除 | — |
| F4 散佈方式 | 不做 | 和工作流內容無關 | — |
| F5 URL 安全政策 | 不做 | bug 與構想都來自使用者自己 | — |

## 4. 分批

先後依賴：批 0 → 批 1；批 2 → 批 3；批 4、批 5 獨立；批 1、3、6 → 批 7。

### 批 0：準備（不改 Skill）

1. 基因庫：保留 `.spec-kit/` 現有的 `1.2.2.dev0` 內容；把用到的 v1.4.2 部分（bug、assess extension、converge 命令、更新後的 tasks 與 analyze 樣板）加進 `.spec-kit/v1.4.2/`，記錄上游 tag 與 commit。`.spec-kit/LICENSE` 已涵蓋。
2. 樣本沙盒：在 repo 外的暫存目錄依上游 v1.4.2 文件安裝 Spec Kit 與 bug、assess extension（指令以執行當時的上游文件為準）。不安裝到本 repo 的 agent 目錄（規則 1）。
3. 修正落差分析：依第 3.1 節改描述與把握。
4. 使用者要做：確認批 0 的變更。
5. 驗收：沙盒可以執行 `/speckit.bug.assess` 等命令；`git status` 只有 `.spec-kit/` 與 `docs/` 的變更。

### 批 1：錯誤修正流程（A2、B1）

1. 範圍：新建 `bug-assess`、`bug-fix`、`bug-test`，報告寫到 `specs/bugs/<slug>/`；runbook 新增「錯誤修正流程」一節與提示詞；步驟 10 的分類加「意圖改變」，「程式錯誤」改成走錯誤修正流程。
2. 課程做法：
   - `bug-assess`、`bug-test`：產出是文件，用 `artifact-to-skill-engineering`。
   - `bug-fix`：產出是程式碼，用第 1.2 節的做法：列出 `speckit.bug.fix` 的行為約束（只改列出的檔案、偏離時停、Status 三種），提案後用 `skill-engineering` 施工。
3. 樣本：沙盒放入 commit `dcb2181`（T041 完成、T042 修正前）的程式與 `specs/008-overdue-discord-notification/`。以 T042 的原始回饋（`iter-6.md`「合併後修正」：按重新整理畫面抖動）跑 `/speckit.bug.assess` → 使用者核准 → `/speckit.bug.fix` → `/speckit.bug.test`，取得 3 份報告。
4. 定稿範例時要加入的本專案做法：
   - 中文化，術語和本專案一致。
   - 「完整預期行為」清單：有反應、不位移、不閃爍、看得出完成（`SDD流程不足總整理.md` 第 10 項）。
   - 判定多一種「意圖改變」，轉回 SDD 流程。
   - `bug-test` 最高只到「待使用者驗證」（保留做法 9）。
5. 換情境驗收：`docs/待確認.md` 第 33 項 e2e `equipment-loan.spec.ts:77`（疑似依賴實際時間，迭代 4～6 共 4 次）。這是測試類問題，和樣本的畫面類問題不同。驗收時實際修好它。
6. 和原版比較：請 AI 條列 bug extension 還有哪些優點，使用者挑選後併回。
7. 使用者要做：核准 assessment 的修法；實際重現並驗證第 33 項修正。
8. 依賴：批 0。

### 批 2：欄位約束鏈（C13、C14、C15、C17、C20）

1. 範圍：修改 `data-plan` → `tasks` → `analyze`，依下游讀上游的順序。
2. 課程做法：每個 Skill 用 `skill-engineering`；`tasks/scripts/check_tasks.py` 與 `analyze` 的 `collect_coverage.py` 是既有腳本，用 `skill-form-script`。
3. 樣本：沙盒放入 `specs/008-overdue-discord-notification/` 的 spec、plan、`data/`、`contracts/`，跑上游 v1.4.2 的 `/speckit.tasks` 與 `/speckit.analyze`，取得 `Entity.field` 引用與 Constrained-Field Coverage 表的實際樣子。另讀上游 `templates/commands/tasks.md` 74、81、201-204。
4. 要定的格式：DBML 的欄位引用寫成 `table.column`；`tasks` 範例刪掉重抄的約束，只留引用。
5. 換情境驗收：在暫存複本對另一個 spec 目錄（例如 `specs/006-reservation-reschedule/`）重跑 `data-plan` → `tasks` → `analyze`，比對前後；新 `tasks.md` 跑 `tasks_state.py status` 時 `format_issues` 必須為空。
6. 使用者要做：確認根因分析與提案；看驗收比對結果。
7. 依賴：批 0。

### 批 3：converge（A1）

1. 範圍：
   - 新建 `converge`：只寫缺口報告 `convergence.md`（放在 spec 目錄），不寫 `tasks.md`。
   - 修改 `tasks`：新增附加模式，讀 `convergence.md`，在 `tasks.md` 結尾附加 `## Phase N: Convergence`，不改既有內容。
   - runbook 在 `implement` 之後加 converge 與 tasks 附加兩步。
2. 課程做法：
   - `converge`：報告是文件，用 `artifact-to-skill-engineering`。
   - `tasks` 附加模式：用 `skill-engineering`；任務格式仍只在 `tasks` 的規則定義。
3. 樣本：沙盒放入 commit `99755c9` 的前一個 commit（迭代 6 合併後、依 analyze 修正上游前）的程式與 `specs/008-overdue-discord-notification/`，跑 `/speckit.converge`。檢查它能不能找出換頁缺口（後來的 T040）。上游把報告與附加任務合在一起；定稿範例時把缺口報告拆成 `convergence.md`。
4. 換情境驗收：另一個已實作完成的 spec 目錄（例如 `specs/007-equipment-maintenance-retire/`）在其完成 commit 的狀態。還要驗：沒有缺口時 `tasks` 不執行附加，`tasks.md` 逐位元組不變；附加後既有內容逐位元組不變（用 `diff` 比對附加前的檔案）；`tasks_state.py status` 沒有 `format_issues`，`implement` 能只執行新 Phase。
5. 和原版比較：使用者挑選後併回。
6. 使用者要做：確認找到的缺口是否真的是缺口。
7. 依賴：批 2（任務格式與 `tasks` 的修改都要先完成）。

### 批 4：需求階段（C1、C4、C5、C7、C8、D2）

1. 範圍：修改 `s-specify`、`clarify-over-specs`。
2. 課程做法：
   - `s-specify` 整體用 `skill-engineering`。
   - C1 檢查清單用 `skill-derive-template`（樣板放 `s-specify/templates/`）。
   - D2 用 `skill-derive-script`：只做 sequential；找出最大編號加一；遇到重複編號時警告但照樣繼續；不覆寫既有目錄。兩個 `001-` 目錄都保留。
3. 樣本：沙盒跑上游 `/speckit.specify`，輸入 runbook 第 9.3 節第 1 列的功能描述，取得 `checklists/requirements.md`；再跑 `/speckit.clarify`，取得「前後通過數」的回報。
4. 換情境驗收：用一個沒用過的領域寫新的功能描述（不用 1A2B、相簿、設備借用）。驗：產出 `checklists/requirements.md`；`clarify-over-specs` 回報前後通過數；在暫存複本放兩個同編號目錄時腳本會警告。
5. 使用者要做：確認根因分析與提案；回答驗收時的 `clarify` 提問。
6. 依賴：批 0。

### 批 5：合約語意與小修（C12、C26）

1. 範圍：
   - `api-plan`：寫副作用、冪等、事件順序、重試、逾時、版本相容，只在 spec 有要求時寫；共用欄位的名稱與約束以 `data-plan` 的資料模型為準，不一致時列為上游衝突。
   - `system-analysis`：Wave 規則改成資料庫介面排在後端介面之前，讓 `api-plan` 讀得到資料模型。
   - `implement`：專案衛生規則加 ignore 檔條件。
2. 課程做法：`api-plan`、`system-analysis` 用 `skill-engineering`；C26 只改一條規則，用 `skill-form-rule`。
3. 樣本：上游 `docs/how-to/contract-driven-development.md` 是基因來源（這是說明文件，沒有命令可跑）；實際案例是 `SDD流程不足總整理.md` 第 1 項。
4. 換情境驗收：在暫存複本對 `specs/003-equipment-loan-booking/` 重跑 `system-analysis`（含 Planner）與 `analyze`，看命名不一致的 MEDIUM 是否消失；記下 Wave 數量是否增加。
5. 使用者要做：確認根因分析與提案。
6. 依賴：批 0。

### 批 6：構想評估（A3）

1. 範圍：新建 `idea-assess`（1 個 Skill，5 個 Phase），報告寫到 `specs/ideas/<slug>/`；runbook 加「構想評估流程」一節。
2. 課程做法：報告是文件，用 `artifact-to-skill-engineering`。上游的 5 份報告要合成幾個檔案，在定稿範例時決定。
3. 樣本：沙盒以 `docs/dev/第三題選題討論.md` 的 A+ 原始構想跑上游 assess 的 5 個命令。
4. 換情境驗收：用選題時沒選的一個候選，或使用者新提的構想。把結論和選題討論的實際決定對照。
5. 和原版比較：使用者挑選後併回。
6. 使用者要做：判斷評估結論是否合理。
7. 依賴：批 0。

### 批 7：runbook 整合（A5、B4、B5）

1. 範圍：只改 runbook。
   - 第 2 節之前加「四種做法」總覽（第 2.1 節）。
   - 小變更路徑：可跳過的步驟與條件。
   - P2 功能描述樣板加「必須保持不變的相容邊界」。
   - §5 表格加 ID、狀態、遺留項欄。
2. 課程做法：只改 runbook。
3. 驗收：使用者照 runbook 走一次小變更（例如第 32 項 T042 的後續處理），確認每個提示詞可以直接貼上。
4. 依賴：批 1、3、6。

## 5. 自訂流程機制對照

| 上游機制 | 本專案對應 | 判定 | 說明 |
|---|---|---|---|
| hook（命令前後） | agent 層 hook（`answer-style.sh`、自動模式）；Skill 內的 `DELEGATE` 步驟 | 不適合 | 課程反對；要加步驟就改 SOP |
| 樣板分層 | Skill 內 `templates/`、`skill-form-template`、憲法 | 不適合 | 課程說太複雜 |
| workflow 引擎 | runbook（關卡、提示詞）、迭代紀錄（續跑）、自動模式（接續） | 已等效，要補流程 | 錯誤修正、構想評估、converge、小變更路徑要寫進 runbook（批 1、3、6、7） |
| 每步指定模型 | CLAUDE.md 模型表；自動模式 `--model` 套用整條鏈 | 已等效 | 不補 |
| preset | 憲法（產出內容）、`skill-engineering`（流程） | 已等效 | lean 的需求改成小變更路徑 |
| extension | `skill-engineering` 加 `sync-skills.sh` | 已等效 | |
| bundle | `.claude/skills` 與 `.agents/skills` 同步 | 已等效 | 一人專案 |
| artifact inventory | `audit_skill.py --graph` | 不適合 | 沒有來源層 |
| 升級 manifest | 規則 2 加 `clarify/LICENSE` 修改紀錄 | 已等效 | 只有一個外部 Skill |
| handoffs | Skill 回報的下一步、自動模式 `next` | 已等效 | |
| constitution-sync | `constitution` 寫入後檢查並回報衝突 | 已等效 | 上游也移出核心 |
| git extension | runbook 檢查點由使用者 commit | 不適合 | 不自動 commit |
| agent-context | 提示詞寫 `{SPEC_DIR}` | 已等效 | |

## 6. 每批完成後的同步

| 批 | `.spec-kit/` | runbook | README | LICENSE（規則 3） | 其他 |
|---|---|---|---|---|---|
| 0 | 加入 `.spec-kit/v1.4.2/`，記 tag `v1.4.2` 與 commit；現有內容不動 | 不改 | 結構表的 `.spec-kit/` 說明補上 `v1.4.2/` 子目錄 | 不改（`.spec-kit/LICENSE` 已有） | 修正落差分析 |
| 1 | 不改 | 錯誤修正流程一節、提示詞；步驟 10 分類 | Skill 清單加 3 個；結構表加 `specs/bugs/` | 3 個新 Skill 各放 `LICENSE`（來源 spec-kit bug extension，MIT 全文）；根 `LICENSE` 授權範圍加 3 列 | `sync-skills.sh --from claude`、`--check` |
| 2 | 不改 | 步驟 6、7 的檢查點加欄位引用與涵蓋表 | 不改 | `tasks`、`analyze` 的 `LICENSE` 註明 v1.4.2 欄位引用的衍生；`data-plan` 若引用上游 `plan.md` 的驗證規則文字，新增 `LICENSE` 並更新根 `LICENSE` | 同步 |
| 3 | 不改 | `implement` 之後加 converge 與 tasks 附加兩步與提示詞 | Skill 清單加 `converge`、流程圖 | `converge/LICENSE`；根 `LICENSE` 加 1 列；`tasks/LICENSE` 補 converge 附加任務的衍生 | 同步 |
| 4 | 不改 | P2 提示詞說明新產出 `checklists/` | 不改 | `s-specify`、`clarify-over-specs` 的 `LICENSE` 補 checklist 衍生 | 同步 |
| 5 | 不改 | 步驟 5 說明 Wave 順序改變 | 不改 | `api-plan` 新增 `LICENSE`（contract-driven 說明文件的衍生，含權威擁有者）；`implement/LICENSE` 補 ignore 檔 | 同步；`SDD流程不足總整理.md` 第 1 項更新狀態 |
| 6 | 不改 | 構想評估流程一節 | Skill 清單加 `idea-assess`；結構表加 `specs/ideas/` | `idea-assess/LICENSE`；根 `LICENSE` 加 1 列 | 同步 |
| 7 | 不改 | 第 2.1 節總覽、小變更路徑、相容邊界、§5 欄位 | 寫三種流程的入口 | 不改 | — |

每批都要：迭代紀錄或 Skill 優化 commit 依 runbook 第 7.2 節寫 5 個欄位；新 Skill 未經使用者驗證前在說明標「未驗證」（課程產出規範）。

## 7. 風險與處理方向

| # | 衝突 | 處理方向 |
|---|---|---|
| R1 | 附加的任務要通過 `tasks_state.py` 的格式：`## Phase N: 標題`、`- [ ] T###`、每個任務的 Must Read／Optional；`check_tasks.py` 也要通過 | 附加由 `tasks` 執行，沿用同一份任務格式規則；驗收時跑 `tasks_state.py status` 與 `check_tasks.py` |
| R2 | `tasks` 現在是整份重新產出，既有 `tasks.md` 存在時要問是否覆寫；附加模式若沿用這個流程，會蓋掉已打勾的任務 | 附加模式只在檔尾加內容，不問覆寫，既有內容必須逐位元組不變；任務編號從現有最大編號往後接。`implement` 不得修改 `tasks.md` 的規則不變 |
| R3 | converge 發現缺口時可能想「順便補」spec 或 plan，違反「上游缺口不自行補齊」 | converge 只附加任務；缺口屬上游時寫進報告，指定處理 Skill，不改上游 |
| R4 | `tasks_state.py` 的執行狀態（已發出、受阻）在附加新 Phase 後要能接續 | 驗收時用 `status --reset --scope phase:N` 只跑新 Phase |
| R5 | `bug-fix` 和 `implement` 一樣不提問，但錯誤修正流程在 assess 與 fix 之間有人工關卡 | 關卡放在兩個 Skill 之間（runbook），不在 `bug-fix` 內；`bug-fix` 執行中不提問，偏離寫進 `fix.md` |
| R6 | 上游 `bug.test` 可以標 `verified`；本專案禁止 AI 代替使用者宣稱已驗證 | `bug-test` 的結果改成「待使用者驗證」「部分」「失敗」；使用者驗證後由使用者或主 session 記錄 |
| R7 | 免問清單若寫進 `clarify` 會違反規則 2（外部 Skill 保持原樣） | 寫在 `s-specify` 的需求缺口步驟或 rules |
| R8 | C8 的「對既有系統的依賴」和 `s-specify` Assumptions 規則（只放預設前提與推定引用）衝突 | 在 `skill-engineering` 根因分析時決定放 Assumptions 的新類別，或和 B4 的相容邊界放同一段 |
| R9 | C12 指定權威擁有者後，可能被理解成「自行以權威方為準修改另一方」 | 權威只決定預設；不一致仍列為上游衝突，回報原 Planner |
| R10 | C20 改 SC 分母後，新舊 `analysis.md` 的涵蓋率不能直接比較 | 迭代紀錄註明分母規則改變的 commit |
| R11 | 第五章會把 `specs/` 改成 `plans/` 與 `truth/`；`specs/bugs/`、`specs/ideas/` 可能要再搬 | Skill 內的路徑集中在一處，方便之後改；第五章重排時一起處理 |
| R12 | 批 2 改變 `tasks.md` 格式，既有 `specs/` 的 `tasks.md` 不會符合新規則 | 新規則只用在新產出；舊目錄不重跑（第五章前不回溯） |
| R13 | 第三題影片與作業還沒完成；先改 Skill 會讓 repo 和影片內容不一致 | 見第 8 節 |
| R14 | 自動模式的 `clarify` 開關打開時，各批的 `clarify` 提問會被自動採推薦 | 執行需要使用者決定的批次前，先 `scripts/auto-mode.sh off clarify` |
| R15 | 資料庫介面排在後端之前，Wave 平行度變低，有些功能會多一個 Wave | 批 5 驗收時記下 Wave 數量；只在有共用欄位的介面之間加依賴，其他介面維持平行 |
| R16 | 新的 `specs/bugs/`、`specs/ideas/` 不符合三位數編號格式；有 Skill 用較寬的條件找目錄時可能誤選 | 批 1、6 驗收時確認 SDD Skill 列出的 spec 目錄清單不含這兩個目錄 |

## 8. 執行順序

### 8.1 和交作業的先後

已決定：先完成第三題影片並繳交，再開始批 0。理由：

1. 影片旁白與鏡頭依據的是目前的 Skill 與迭代紀錄（`docs/video/旁白稿.md`）。先改 Skill，影片和 repo 會對不上。
2. 繳交後，提議在當時的最後一個 commit 打 annotated tag（規則 6，先問使用者），保存繳交時的狀態。
3. 本計畫沒有任何一批是第三題的繳交條件。

### 8.2 批次順序

批 0 → 批 1 → 批 2 → 批 3 → 批 4 → 批 5 → 批 6 → 批 7。

1. 批 1 先做：實際成本最高（T042 約 60 分鐘、測試依賴時間 4 次），不依賴其他批，不改既有 Skill。
2. 批 2 在批 3 之前：converge 附加的任務要用新格式。
3. 批 4、5 互相獨立，可以和批 3 交換。
4. 批 6 最後做新 Skill：構想評估的實際需求最少。
5. 批 7 收尾：需要前面三條流程都完成。

### 8.3 第一批的範圍

批 0 加批 1：

- 包含：基因庫加入 `.spec-kit/v1.4.2/`；樣本沙盒；落差分析修正；`bug-assess`、`bug-fix`、`bug-test` 與 `specs/bugs/`；runbook 錯誤修正流程一節與步驟 10 分類；LICENSE、README、同步。
- 不包含：converge、構想評估、任何既有 SDD Skill 的修改、`implement` 的修改。
- 完成條件：第 33 項經錯誤修正流程處理，使用者實際驗證通過；三個 Skill 標為已驗證或寫明未驗證的部分。

## 9. 使用者要做的決定

使用者在 2026-11-19 以 `clarify` 確認，9 題都選推薦選項。

| # | 決定 | 選項 | 影響 | 結論 |
|---|---|---|---|---|
| 1 | 什麼時候開始 | 交作業後／交作業前先打 tag／交作業前只做批 0 | 交作業前開始要先打 tag 保存繳交狀態 | 交作業後開始 |
| 2 | 確認 58 項的決定 | 照第 3.2 節／改 A4、C2、C9、C18、C11 其中幾項 | 改項目會改統計數字 | 全部照第 3.2 節，不改；統計維持做 20、不做 31、留到後面章節 7 |
| 3 | 錯誤修正 Skill 怎麼拆與命名 | 3 個 Skill／1 個 Skill 3 個 Phase／3 個加 `s-` 前綴 | Skill 數量；名稱不能和全域 Skill 撞名 | 3 個 Skill：`bug-assess`、`bug-fix`、`bug-test` |
| 4 | bug 與構想評估的產出物放哪裡 | `specs/`／`docs/`／上游的 `.specify/` | 第五章會重排 `specs/` | `specs/bugs/<slug>/` 與 `specs/ideas/<slug>/` |
| 5 | converge 怎麼寫入 `tasks.md` | (a) converge 直接附加；(b) converge 寫報告，`tasks` 附加 | (b) 要在 `tasks` 加附加模式 | (b)：converge 寫 `convergence.md`，`tasks` 以附加模式寫入 |
| 6 | 構想評估 Skill 怎麼拆 | 1 個 5 個 Phase／2 個／5 個 | Skill 數量與 runbook 步驟數 | 1 個 Skill `idea-assess`，5 個 Phase |
| 7 | 基因庫更新範圍 | 只加用到的部分到 `.spec-kit/v1.4.2/`／整個換掉／不放進 repo | 整個換掉會覆寫第三章的基因樣本 | 保留現有內容，用到的部分加進 `.spec-kit/v1.4.2/` |
| 8 | 編號腳本與兩個 `001-` 目錄 | 只做 sequential 並警告／加 timestamp／改名為 `000-` | 改名會讓既有引用失效 | 只做 sequential；兩個目錄都保留；遇到重複編號時警告 |
| 9 | 共用欄位怎麼統一 | 以 `data-plan` 為準／以 `api-plan` 為準／憲法加命名規則 | Wave 順序與平行度 | 以 `data-plan` 為準，資料庫介面排在後端之前的 Wave |

每批的驗收仍要使用者做：核准 assessment、實際重現與驗證、看比對結果、挑選原版優點。

## 10. 交給後面章節的項目

依規則 5 記在 `docs/待確認.md` 第 34、35 項，不排進本計畫：

- 第四章：A6、C16、C24（Acceptance Journey 部分）。
- 第五章：B2、B3、C11、C24（Acceptance Gate、Truth 對齊部分）、F1。
