# Spec Kit v1.4.2 與本專案 SDD 工作流的落差分析

- 日期：2026-11-18
- 比對對象：上游 `github/spec-kit` tag `v1.4.2`（2026-11-17）與本專案自建的 SDD Skills、專案憲法、迭代 runbook、自動模式。
- 做法：下載上游完整歷史（247 個 tag）與 v1.4.2 原始碼；分四個範圍由子代理（Opus）完整閱讀並逐條比對；主 session 抽查 14 處原文，全部相符。
- 狀態：只有分析，沒有修改任何 Skill。調整計畫另外寫。
- 上游路徑以 spec-kit repo 根目錄為準；本專案路徑以 repo 根目錄為準，`SK/` 代表 `.agents/skills/`。
- 修正：2026-11-19。依據是[調整計畫](./spec-kit-1.4.2-調整計畫.md)第 3.1 節：把握「中」「低」的項目重讀上游 v1.4.2 原文（commit `1e421b58805e33507258d917a16e4d2a403e8358`）後的結果。修正了 A5、B4、C4、C5、C12、C16、C22、C24、E3、E12 的描述，並調整 16 項的「把握」（14 項改為「高」，C19、C24 改為「低」）。修正處以「（修正）」標出。

## 1. 新舊版的分界

- 舊版：到 v1.0.6（2026-09-10）。README 只講一種流程（SDD）。課程教的 4+2 步（specify、plan、tasks、implement，加 clarify、analyze）屬於這個形狀。
- 新版：v1.0.7（2026-09-15，commit `3affdb2`「simplify README around three processes」）之後。README 第一節是「Choose your process」。
- 本專案的 `.spec-kit/` 是 2026-10-21 複製的 `1.2.2.dev0`。檔案上屬於新版（已有 `speckit-converge` 與 6 支 Python 腳本），但沒有安裝 bug、assess 擴充功能。自建 Skills 依課程製作，是舊版的形狀。

各功能加入上游的時間：

| 日期 | 版本 | 加入什麼 |
|---|---|---|
| 2025-09 | v0.0.50 | 最早只有 5 個命令：constitution、specify、plan、tasks、implement |
| 2025-09～10 | v0.0.52～57 | clarify、analyze、checklist |
| 2026-02-10 | v0.0.93 | extension 機制 |
| 2026-03-13 | v0.3.0 | preset |
| 2026-04-07 | v0.5.1 | git extension（建立分支移出核心） |
| 2026-04-14 | v0.7.0 | workflow 引擎 |
| 2026-05-30 | v0.9.0 | agent-context extension（更新 CLAUDE.md 等移出核心） |
| 2026-06-05 | v0.9.5 | bug extension（錯誤修正） |
| 2026-06-17 | v0.11.2 | converge 命令 |
| 2026-07-06～21 | v0.12.6～v0.13.2 | Python 腳本 |
| 2026-07-17 | v0.13.0 | assess extension（構想評估） |
| 2026-09-15 | v1.0.7 | README 改寫成三種流程 |
| 2026-09-21 | v1.0.9 | bundle；bugfix、assess 的 workflow |
| 2026-11-02 | v1.3.0 | taskstoissues 移出核心，改放 github extension |
| 2026-11-17 | v1.4.2 | tasks、analyze 的欄位引用規則 |

## 2. 落差清單

「把握」是比對者對判斷的信心。「實際案例」只寫迭代紀錄裡查得到的；沒有的寫「沒有」。

### A. 整條流程或整個步驟是本專案沒有的

| 編號 | 上游做什麼 | 本專案現況 | 實際案例 | 把握 |
|---|---|---|---|---|
| A1 | **converge**：implement 後拿程式碼對照 spec、plan、tasks。缺口分 `missing`、`partial`、`contradicts`、`unrequested` 四種，分 4 級嚴重度。只能在 `tasks.md` 結尾附加 `## Phase N: Convergence` 的新任務，不改 spec、plan、既有任務與程式碼。打勾不算證據，所有任務重新驗證。沒有缺口時 `tasks.md` 逐位元組不變，回報 Converged。（`templates/commands/converge.md` 59-240） | 沒有任何 Skill 在實作後對照 spec。`SK/implement/SKILL.md` 37-40 只彙整任務結果 | 迭代 6 合併後重跑 `analyze` 才發現換頁缺口，補 T040、T041（`docs/iterations/iter-6.md` 95） | 高 |
| A2 | **錯誤修正流程**（bug extension）：assess → fix → test，三個命令各寫一份報告到 `.specify/bugs/<slug>/`。只有 fix 可以改程式。assess 與 fix 之間有人工關卡 | 沒有。runbook 步驟 10 的「程式錯誤」只寫「修程式」（`docs/dev/迭代-runbook.md` 243-246），6 次迭代從來沒有判定過這一類 | T042 畫面閃爍修了 3 次，約 60 分鐘（`iter-6.md` 310-312） | 高 |
| A3 | **構想評估流程**（assess extension）：intake → research → define → shape → decide，寫到 `.specify/assessments/<slug>/`。結論是 go、needs-clarification、kill | 沒有 Skill。選題時實際做過類似的事，但沒有固定格式（`docs/dev/第三題選題討論.md`） | 選題沒有固定的「反對證據」段，也沒有正式的 kill 判定 | 高 |
| A4 | **checklist 命令**：依領域產生 `checklists/<domain>.md`，內容是「需求的單元測試」，檢查需求有沒有寫清楚，不是驗證實作。清單歸審查者所有，命令不得自行打勾（`templates/commands/checklist.md`） | 沒有對應 Skill | 沒有 | 高 |
| A5 | **小變更的精簡流程**（lean preset）：5 支很短的命令（`presets/lean/`）。（修正）lean 的 README 只寫「沒有樣板」；「不跑編號腳本、不跑 hook」是從命令文字推得的 | 每次迭代都跑完整流程（runbook 662-677），沒有輕量路徑 | T040～T042 這類小修改都走完整的 analyze → ui-plan → tasks → implement | 中 |
| A6 | **quickstart.md**：plan 階段產出可執行的端到端驗證指南；implement 會讀它，Polish 有「Run quickstart.md validation」任務（`templates/commands/plan.md` 152-159） | 實作前沒有這份文件。只有 tasks 範例在 Polish 由 implement 寫 quickstart（`SK/tasks/templates/tasks.example.md` 354） | 沒有 | 高 |

### B. 修改既有功能與規格保存

| 編號 | 上游做什麼 | 本專案現況 | 實際案例 | 把握 |
|---|---|---|---|---|
| B1 | **缺陷與意圖改變的分流**：先分辨「違反已同意意圖的缺陷」和「要改變意圖的提案」。程式只是證據，不能取代需求（`docs/how-to/evolving-specs.md` 11-22） | runbook 步驟 10 只分需求缺漏、程式錯誤、Skill 缺陷三類，沒有「意圖改變」 | T042 第 2 次修正由自動模式直接改了 `ui/plan.md` §4 的意圖 | 高 |
| B2 | **意圖改變要回寫文件**：不可讓 tasks 或程式和仍然有效的 spec 互相矛盾（同上 46-48） | implement 的決策只寫進完成報告與迭代紀錄，沒有規定要回寫 spec、plan、contracts | 迭代 5 的 F1～F6 沒修就實作，正式文件仍和程式不一致（`docs/report/SDD流程不足總整理.md` 18、34） | 高 |
| B3 | **交付後規格保存的 4 種模型**：Flow-back、Flow-forward、Living spec、Constitution-only。要求團隊選一種並寫明（`docs/how-to/persisting-specs.md`） | 實際做法接近 Flow-forward（每次迭代開新目錄），但沒有寫明，也沒有寫舊目錄能不能改、以哪一份為準 | `docs/待確認.md` 第 3 項：同主題重跑分不出新舊以哪份為準 | 高 |
| B4 | **既有專案導入**：憲法只寫已成立，或團隊明確同意採用的規則（修正：原文不只「已成立」，`docs/how-to/existing-projects.md` 47）；第一個變更要有明確邊界；功能描述要寫「必須保持不變的相容邊界」（`docs/how-to/existing-projects.md`） | 第 2 次以後的描述會寫「延續上一次的系統」，但沒有要求寫相容邊界；憲法沒有「只寫已成立的規則」的規定 | 沒有 | 中 |
| B5 | **Spec of specs**：大型功能先寫 `roadmap.md`，每列有不可變 ID、範圍、依賴、狀態、子 spec 路徑；子 spec 回指 roadmap（`docs/how-to/spec-of-specs.md`） | runbook §5 的表格扮演 roadmap，但沒有 ID、狀態欄，spec 也沒有回指 | 迭代 4 的 C3 需求缺口寫「留給下一次迭代」，之後沒有追蹤（`iter-4.md` 109、126、232） | 高 |

### C. SDD 各步驟內部的差異

#### C-1 需求階段（specify、clarify、constitution）

| 編號 | 上游做什麼 | 本專案現況 | 把握 |
|---|---|---|---|
| C1 | **規格品質清單寫成檔案**：specify 把 16 項檢查寫成 `checklists/requirements.md`；clarify 重新評估並回報「12/16 → 15/16」與退步項目（`templates/commands/specify.md` 148-238；`clarify.md` 210-227） | s-specify 有同類驗證（最多 3 輪），但只在記憶中做，不寫檔；clarify-over-specs 重驗但沒有前後通過數（`SK/s-specify/SKILL.md` 28、37） | 高 |
| C2 | **憲法有版本與修訂紀錄**：semver 版本號、Ratified 與 Last Amended 日期、檔頭的 Sync Impact Report；每條原則寫理由（`templates/commands/constitution.md` 96-132） | 憲法檔只有規則編號、條文、Good/Bad 範例，沒有版本、日期、理由欄（`SK/constitution/templates/constitution-file.md`） | 高 |
| C3 | **憲法可以放工程原則**（TDD、簡單性、可觀測性等），供 plan 檢核 | 憲法只約束產出物內容；流程類需求被拒絕並轉給 skill-engineering（`SK/constitution/rules/憲法落點-格式規範.md` 93-116）。這是刻意的設計 | 高 |
| C4 | **成功標準的寫法**：要以使用者或業務角度描述（user-focused）。（修正）上游沒有要求「同時有量化與質性指標」 | 只要求「有數值門檻」與「不提技術」（`SK/s-specify/rules/spec-文件-格式規範.md` 67-70）。本專案只收量化指標，這點比上游嚴；缺的是「從使用者或業務角度描述」 | 中 |
| C5 | **免問的預設清單與提問優先序**：範圍 > 安全／隱私 > UX > 技術細節；資料保存期、效能目標等用業界預設，不問。（修正）出處是 `templates/commands/specify.md` 133、307-317，不在 `clarify.md` | clarify 只籠統寫「低風險預設不要問」，沒有把安全／隱私列為高優先 | 中 |
| C6 | **clarify 的互動**：一次只問 1 題；每答一題立即寫回 spec；可用短答；回「yes」就採推薦；追問不算題數 | 一輪最多 3 題，一律表格選項，每輪結束才寫回一次 | 高 |
| C7 | **跳過 clarify 要警告重工風險** | 只把 clarify-over-specs 列為可選，沒有警告 | 高 |
| C8 | **spec 的讀者與依賴**：寫給非技術利害關係人；Assumptions 要列對既有系統的依賴 | 只禁止寫技術，沒有規定讀者；Assumptions 沒有要求列外部依賴 | 高 |

#### C-2 規劃階段（plan）

| 編號 | 上游做什麼 | 本專案現況 | 把握 |
|---|---|---|---|
| C9 | **Constitution Check 關卡**：研究前檢查一次，設計完成後再檢查一次；違反且沒有理由時判 ERROR（`templates/commands/plan.md` 68-72、164） | system-analysis 與各 Planner 各自檢查憲法，但所有 Planner 完成後沒有一次跨產出物的重查，要到 analyze 才整體檢查 | 中 |
| C10 | **Complexity Tracking**：違反原則時寫「為什麼需要」與「為什麼放棄較簡單的方案」 | 已刪除（`SK/system-analysis/LICENSE` 6）。偏離只在回報列出，沒有寫進 plan.md | 高 |
| C11 | **Technical Context 必填欄位**：Target Platform、Performance Goals、Constraints、Scale/Scope 等；不確定的標 NEEDS CLARIFICATION 並變成研究任務；未解決就判 ERROR | techstack.md 沒有這些欄位；未解決的記為「未通過項」，檔案照樣產出 | 中 |
| C12 | **合約要寫行為語意**：副作用、冪等性、事件順序、重試、逾時、版本與相容性；每個介面有一個權威擁有者（`docs/how-to/contract-driven-development.md`） | api-plan 的規則沒有這些；版本固定 0.1.0；只有通知介面有重試規則。（修正）本專案不是完全沒有逾時：Edge Case 有逾時的寫法；缺的是副作用、冪等、事件順序、版本與權威擁有者。api-plan 與 data-plan 同一個 Wave 各自產出，共用欄位沒有指定以誰為準 | 中 |
| C13 | **資料模型寫狀態轉換與驗證規則**（長度、範圍、格式） | data-plan 只要求 Enum、unique、not null、索引、Ref | 高 |

C12 的實際案例：`SDD流程不足總整理.md` 17、31（第 1 項，未處理）。

#### C-3 任務與分析階段（tasks、analyze）

| 編號 | 上游做什麼 | 本專案現況 | 把握 |
|---|---|---|---|
| C14 | **欄位引用**：每個有約束的欄位至少被一個任務以 `Entity.field` 引用；以引用取代重抄約束（`templates/commands/tasks.md` 74、81、201-204） | 資料表列為 Must Read，但沒有「每個受約束欄位至少引用一次」的要求；範例還把整串約束抄進任務描述 | 高 |
| C15 | **analyze 的欄位涵蓋表**：缺引用或任務約束和 data-model 矛盾，列 HIGH；另出 Constrained-Field Coverage 表 | 沒有欄位層級的檢查 | 高 |
| C16 | **測試任務**：spec 明確要求或使用者要求 TDD 時產生（`templates/commands/tasks.md` 148）；每份合約一個合約測試；測試先寫並確認先失敗。（修正）「先確認失敗」寫在 `templates/tasks-template.md` 85、182、249，不在命令檔 | 只看 spec 有沒有要求；沒有合約測試與「先確認失敗」 | 中 |
| C17 | **analyze 檢查任務順序矛盾**（整合任務排在基礎任務之前） | 6 個類別都沒有順序檢查 | 高 |
| C18 | **analyze 的修正建議先問使用者**，同意後才提出具體修改 | 直接給修改方向與處理 Skill，不詢問 | 高 |
| C19 | **analyze 重跑要得到相同的問題 ID 與計數** | 沒有寫明 | 低 |
| C20 | **analyze 嚴重度細節**：安全或效能描述模糊列 HIGH；涵蓋率分母不含上線後 KPI 類 SC；統計分類別件數 | 沒有這三項 | 高 |
| C21 | **tasks 完成回報**：可平行的機會、建議的 MVP 範圍、各故事的獨立測試標準 | 只回報各 Phase 任務數、待確認、warnings | 中 |
| C22 | **User Story Phase 依優先度排序** | 依 spec 的出現順序。（修正）落差不成立：上游也依 spec 的優先序；本專案 spec 的故事順序實際就是優先序 | 低 |

#### C-4 實作階段（implement）

| 編號 | 上游做什麼 | 本專案現況 | 把握 |
|---|---|---|---|
| C23 | **checklist 關卡**：開工前統計 `checklists/` 的勾選狀態，有未勾項目就停下來問（`templates/commands/implement.md` 56-88） | 沒有。而且 implement 規定執行中不得提問，和這個關卡的設計相反 | 高 |
| C24 | **完成驗證**：最後對照整個 spec 與 plan，確認功能符合、測試通過、覆蓋率達標 | 每個任務與每個 Phase 有驗證，但沒有逐條對照 FR/SC。（修正）本專案的 Phase Checkpoint 已實跑 Independent Test 與 SC 量測，落差比原描述小 | 低 |
| C25 | **[P] 任務平行執行**，建議每個 [P] 任務委派一個子代理 | [P] 也逐一執行。這是刻意的設計 | 高 |
| C26 | **ignore 檔**：另外處理 `.npmignore`、`.terraformignore`、`.helmignore` 與 k8s | 只處理 `.gitignore`、`.dockerignore`、Prettier、ESLint | 高 |

### D. 腳本與「目前功能」的追蹤

| 編號 | 上游做什麼 | 本專案現況 | 把握 |
|---|---|---|---|
| D1 | **`feature.json` 記錄目前功能**：specify 寫入，所有下游命令讀它；可用環境變數覆寫（`scripts/python/common.py` 137-190） | 沒有指標檔。多數 Skill 遇到多份 spec 就停下來問；`clarify-over-specs` 直接取編號最大的目錄。實際上每一步靠 runbook 的 `{SPEC_DIR}` 在提示詞寫明 | 高 |
| D2 | **建立功能目錄的腳本**：編號取最大加一；號碼已被使用時自動往後找並警告；另有 timestamp 模式；git extension 還會掃描本機與遠端分支避免撞號（`scripts/python/create_new_feature.py`） | s-specify 用 SOP 文字決定編號，沒有腳本，沒有 timestamp 模式。`specs/` 實際已有兩個 `001-` 開頭的目錄，現有規則不會察覺 | 高 |
| D3 | **共用的前置檢查腳本**：回傳 `FEATURE_DIR`、`AVAILABLE_DOCS` 等固定欄位的 JSON；缺文件時報錯並說出要先跑哪個命令（`scripts/python/check_prerequisites.py`、`setup_plan.py`、`setup_tasks.py`） | 前置檢查寫在各 Skill 的 SOP 文字；腳本只檢查產出物，不負責找路徑 | 高 |
| D4 | **三種腳本語言**：bash、PowerShell、Python 各 6 支，初始化時選一種 | 自建腳本只有 Python，以 `uv run --script` 執行 | 高 |

### E. 自訂流程的機制

| 編號 | 上游做什麼 | 本專案現況 | 把握 |
|---|---|---|---|
| E1 | **命令前後的 hook**：每個命令開始前讀 `hooks.before_<命令>`，結束後讀 `hooks.after_<命令>`；必跑的自動執行，可選的顯示提示；設定檔讀不到要明講 | SDD 各步驟前後沒有可登記的掛點。只有 agent 層的 hook（提醒回答方式、自動接續） | 高 |
| E2 | **樣板分層覆寫**：專案 override → preset → extension → 核心，可 replace、prepend、append、wrap（`scripts/python/common.py` 315-353） | 樣板固定放在 Skill 內，要改只能改 Skill。憲法分 shared 與各 Skill 檔，可以約束產出內容，但不能換樣板 | 高 |
| E3 | **workflow 引擎**：用 YAML 串起步驟；spec 後、plan 後各有審查關卡；有 run ID 可續跑（`workflows/speckit/workflow.yml`）。（修正）每一步可各自指定模型與 effort 是引擎的能力，`speckit/workflow.yml` 本身沒有設定 | 關卡靠「一步一個提示詞」；續跑靠迭代紀錄；自動模式的模型與 effort 套用到全部步驟；「哪種工作用哪個模型」只寫在 CLAUDE.md 表格 | 中 |
| E4 | **extension**：用 `extension.yml` 宣告新增的命令、hook、設定檔，可安裝與移除 | 新增 Skill 用 `skill-engineering`，沒有宣告檔與安裝機制 | 高 |
| E5 | **preset**：整包替換或調整命令與樣板，例如 lean、constitution-sync | 沒有對應做法 | 高 |
| E6 | **bundle**：把 extension、preset、workflow 打包成一個角色或團隊的設定 | 沒有對應做法 | 高 |
| E7 | **artifact inventory**：`specify artifact list` 列出每個命令、樣板、腳本、hook 的來源層 | `audit_skill.py --graph` 產出 Skill 的結構診斷與呼叫關係，但沒有來源層的概念 | 高 |
| E8 | **升級機制**：manifest 記錄受管檔案的雜湊，升級時只更新沒被改過的檔案；`specs/`、憲法、原始碼永遠不動（`docs/upgrade.md`） | 外部 Skill 規定「從上游重新複製，再手動套用修改」，沒有雜湊 manifest | 高 |
| E9 | **handoffs**：命令 frontmatter 宣告下一步命令與提示詞 | 部分 Skill 在回報文字建議下一步；runbook 與自動模式另外處理接續 | 高 |
| E10 | **git extension**：自動建立功能分支、驗證分支名稱、每個命令前後可自動 commit（預設關閉） | s-specify 明寫不建立分支；commit 在 runbook 的檢查點手動做 | 高 |
| E11 | **agent-context extension**：在 CLAUDE.md、AGENTS.md 的標記區塊自動寫入目前 plan 的路徑 | `sync-skills.sh` 讓兩份檔案保持相同，但沒有指向目前 plan 的區塊 | 高 |
| E12 | **constitution-sync preset**：憲法更新後，自動對齊專案自己的樣板與命令，並列出已更新與待更新的檔案。（修正）上游 0.14.4 起已把憲法傳播移出核心，理由是會重複單一事實來源 | constitution 寫入後檢查相關 Skill 與既有產出物，只回報衝突，不修改；結果只在對話中，不寫進憲法檔 | 高 |

### F. 影響小或目前不適用

| 編號 | 上游做什麼 | 說明 |
|---|---|---|
| F1 | Monorepo：每個成員專案有自己的 `specs/`、編號與憲法 | 本專案 `specs/` 混放 1A2B、聊天室、設備借用三個系統並共用編號。目前只有一個 app 在開發，影響小 |
| F2 | github extension：把 tasks 轉成 GitHub issues | 一個人的課程專案用不到 |
| F3 | plan.md 的 Summary 段落 | 已刻意刪除 |
| F4 | catalog、MCP server、PyPI 安裝、43 種 agent 整合 | 屬於 Spec Kit 這個工具的散佈方式，和工作流內容無關 |
| F5 | bug 與 assess 命令的 URL 安全政策、slug 多層解析、symlink 檢查 | bug 與構想都來自使用者自己，不來自外部網址 |

## 3. 錯誤修正與構想評估的內容（供自建時參考）

### 錯誤修正（`extensions/bug/commands/`）

- **assess**：讀入報告；寫症狀與預期；列重現步驟（不知道的標 `[NEEDS CLARIFICATION]`，不猜）；找可疑的程式路徑；判 Verdict（`valid`、`likely valid, needs reproduction`、`invalid`）與 Severity；提出一個首選修法與 0～2 個替代，列出要改的檔案、要補的測試、風險。這一步不改程式。
- **fix**：把 assessment 的修法、檔案、測試、風險當成契約。只改列出的檔案，修改要最小。發現 assessment 判斷錯誤時，停止改程式，寫進「Deviations from Assessment」，建議重跑 assess。Status 是 `applied`、`partial`、`not-applied`。
- **test**：重跑重現步驟、新測試與回歸。不改程式。結果是 `verified`、`partial`、`failed`。**assessment 列了重現步驟但實際沒有執行時，只靠測試通過不能標 `verified`，必須降為 `partial`**（`speckit.bug.test.md` 193）。

### 構想評估（`extensions/assess/commands/`）

- **intake**：保留原文，中性重述，記來源與類型。不評估、不想解法。
- **research**：從使用者與需求、既有做法、市場、資料與限制四面調查。每條主張附來源，否則標 `ASSUMPTION`。**每次都要寫「Evidence Against the Idea」，找不到也要明寫**（`speckit.assess.research.md` 93）。
- **define**：只停在問題空間。寫問題陳述、使用者、Goals 與 Non-Goals、成功指標、什麼都不做的代價。
- **shape**：提出 2～3 個方案，一定有「最小可行」方案；每個方案寫 Appetite（願意花的預算，不是估計）、取捨、可能卡住的地方。可以推薦「不做」。
- **decide**：6 項準則評分。**go 需要問題成立度與證據強度都至少 adequate**；證據不足只能判 needs-clarification；kill 要直接寫理由。只有 go 才寫交接摘要，交給 specify。交接是手動的。

## 4. 本專案有、上游沒有的做法（調整時要保留）

1. Reference Loading Contract：每個任務列 Must Read、Optional 與 Why；implement 只讀這些部位，`check` 時比對已讀序號。
2. 系統介面盤點與 Wave 委派：先編號介面並寫需求依據，再依端點類型平行委派 Planner。
3. 每種產出物有專門的 Planner 與檢查腳本：OpenAPI／AsyncAPI、DBML、可互動 HTML 雛形、通知可靠性規劃。
4. 上游缺口不自行補齊：Planner 回報「上游衝突」並指定處理 Skill；tasks 寫成「待確認」。
5. implement 由腳本強制一次一個任務；受阻分 env、constitution、dependency 三種；全程不提問。
6. s-specify 在寫 spec 之前就問清楚，不留 `[NEEDS CLARIFICATION]`；沒問到的寫成「推定需求」並可追溯。
7. FR／NFR 歸屬到使用者故事；每條 FR 有一條 Then 直接驗證；優先級只依使用者價值排。
8. 憲法依產出物分檔，每條規則附 Good／Bad 範例，鎖定項目不受覆寫；各 Skill 回報憲法遵循、偏離與未套用規則。
9. 由使用者親手驗證，禁止 AI 代替使用者宣稱「已驗證」（`user-verify-skill`、自動模式的限制）。
10. 把 Skill 當工程物維護：`skill-engineering` 的根因分析、工程藍圖、子代理驗收。
11. 迭代紀錄固定記下模型、effort、Skill 版本；用 A/B 比較驗證新 Skill。
12. `.claude/skills` 與 `.agents/skills` 兩邊同步，多個 agent 共用同一套 Skill。

## 5. 本專案的實際案例與上游流程的對照

| 案例 | 發生了什麼 | 用上游流程會差在哪裡 |
|---|---|---|
| T040、T041（`iter-6.md` 95、309） | 合併後 analyze 找出換頁缺口，經 ui-plan、tasks、implement 補上 | 做法和 evolving-specs 一致；差別是上游用 converge 收尾。T041 曾被 agent 代寫「已驗證」，照 bug.test 的規則只能是 `partial` |
| T042（`iter-6.md` 310-312） | 畫面閃爍，沒先寫出預期與根因就修，修了 3 次；第 2 次改了 `ui/plan.md`；已打勾但使用者沒驗證 | assess 先寫症狀、重現與根因；fix 前有人工關卡；改意圖要記為偏離；修法無效要重新診斷；沒有使用者重現只能 `partial` |
| 測試依賴實際時間（`iter-4.md` 36、235；`iter-5.md` 282；`iter-6.md` 345） | 迭代 4～6 共遇到 4 次，每次用假時鐘繞過，根因沒查 | 開一個獨立的 bug 追蹤，和功能迭代分開 |
| 迭代 4 的 C3（`iter-4.md` 109、126、232） | 需求缺口寫「留給下一次迭代」，之後沒有後續 | 當成意圖要補，修改 spec 後再交付；roadmap 有狀態欄可以追蹤 |
| 迭代 5 的 F1～F6（`iter-5.md` 281、286） | 文件和程式不一致，刻意保留 | 上游要求修改文件，或明確宣告這些文件已退役 |
| 第三題選題（`第三題選題討論.md`） | 8 個候選加權計分，使用者決定 | 和 assess 的 define、shape、decide 對得上；缺固定的反對證據段與 kill 判定 |

## 6. 抽查紀錄

主 session 直接讀原文確認的 14 處：bug.test 的 verified 規則、bug.fix 的範圍限制、decide 的 go 條件、research 的 Evidence Against、converge 的只能附加規則與任務格式、implement 的 checklist 關卡、evolving-specs 的缺陷與意圖分流、persisting-specs 的 4 種模型、本專案 implement 的「不得修改 tasks.md」、s-specify 的「不建立 git 分支」、clarify-over-specs 的「編號最大」、`specs/` 的兩個 `001-` 目錄、runbook 步驟 10 的三種分類。全部和比對結果相符。

沒有抽查的項目，以表中的「把握」欄為準。把握「中」「低」的項目，動手前要再讀一次原文。

2026-11-19 補充：把握「中」「低」的項目已重讀原文，結果見調整計畫第 3.1 節，本文件已依此修正（見檔頭）。
