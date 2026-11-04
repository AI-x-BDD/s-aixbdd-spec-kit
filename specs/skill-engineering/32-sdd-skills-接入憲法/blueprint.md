# 工程藍圖：sdd-skills－接入憲法

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/32-sdd-skills-接入憲法/`
- 根因報告：`rca-report.md`（R1、R2、R3，使用者已於 2026-11-03 回覆「照建議」確認）
- 確認紀錄：2026-11-03 使用者回覆「確認」，確認目前版本的工程藍圖（含推定驗收條件 E9、E10 與第 2 節列出的鎖定項目）

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 9 個 SDD Skill 在產出前讀取 `.agents/constitution/shared.md` 與落點表中自己產出物的憲法檔（`clarify-over-specs` 讀 `skills/s-specify/spec.md`；`system-analysis` 只讀 `skills/system-analysis/plan.md`，不代替 Planner 讀取，委派內容也不轉述憲法），檔案不存在時略過；Planner 由 `system-analysis` 委派時也自行讀取 | 本次 | 通用 |
| E2 | 產出物符合已載入憲法的每條「必須」與「不得」規則；憲法和 Skill 內建規則、樣板或範例不同時，依憲法 | 本次 | 通用 |
| E3 | 憲法規則和 Skill 的鎖定項目衝突時，鎖定項目不變、Skill 的檢查腳本仍通過；回報列出未套用的規則與衝突的鎖定項目 | 本次 | 通用 |
| E4 | 產出物違反「必須」或「不得」且可以修正時，修正後才完成；無法修正時（和 spec、上游產出或使用者需求衝突），會提問的 Skill 委派 `clarify` 詢問使用者，`implement` 不提問，把該任務記為受阻任務並寫進完成報告 | 本次 | 通用 |
| E5 | 產出物偏離「應」規則時，可以完成，並在回報寫出偏離的規則與理由 | 本次 | 通用 |
| E6 | 完成回報有「憲法遵循」：已載入的憲法檔路徑（都不存在時寫「沒有憲法檔」）、「必須／不得」是否全部通過、「應」的偏離與理由、因鎖定項目而未套用的規則 | 本次 | 通用 |
| E7 | 專案沒有任何憲法檔時，產出與接入前的規則相同：說明文字使用繁體中文，各 Skill 的檢查腳本通過 | 本次 | 通用 |
| E8 | 憲法規定說明文字的語言時，依憲法；沒有規定時使用繁體中文 | 本次 | 通用 |
| E9 | `technical-research` 不再讀取「專案中名為 `constitution.md` 的檔案」，改依 E1 讀取 `.agents/constitution/`；仍讀取使用者指定的專案原則文件 | 推定（已確認）：舊步驟沿用 Spec-Kit 的單一 `constitution.md`，本專案沒有這個檔名；保留會讓同一個約束有兩個來源 | 通用 |
| E10 | `clarify-over-specs` 和其他 Skill 一樣適用 E1–E6，讀取 `skills/s-specify/spec.md` 與 `shared.md`，寫回前後依 E2、E4 處理；不另外把憲法併入 10 類缺口掃描 | 推定（已確認）：`docs/待確認.md` 第 15 項；課程 27:37 確認 `clarify` 只負責互動提問 | 通用 |
| E11 | `constitution` Phase 1 步驟 1 以 `find .agents/constitution -type f` 列出全部既有憲法檔，再讀取每個檔案 | 本次 | 通用 |
| E12 | 各 Skill 既有的核心預期不變：產出路徑、樣板結構、確認閘門（覆寫詢問、`clarify` 委派）、檢查腳本與回報內容 | 既有 | 通用 |

## 2. To-Be SOP

本次不新增 Phase、RuleFile、樣板組或腳本；以下只列出每個 Skill 新增或修改的步驟全文，標為「原文」的步驟與未列出的步驟、完成條件一律保留原文。步驟編號為 To-Be 編號，新增步驟後的既有步驟依序後移，步驟內文中的「步驟 N」引用一併更新。

### 共用寫法（每個 Skill 依自己的檔名與鎖定項目填入）

- 憲法載入（新增 `READ`）：讀取專案根目錄 `.agents/constitution/shared.md` 與本 Skill 的憲法檔（不存在的略過），建立「憲法檢查清單」，並記下不受憲法覆寫的鎖定項目。
- 憲法核對（併入既有驗證 `CHECK`）：逐條驗證「憲法檢查清單」，和本 Skill 的檢查清單或樣板衝突時以「憲法檢查清單」為準；規則會改變鎖定項目時不套用，記入「未套用規則」；偏離「應」規則時，把規則與理由記入「憲法偏離」。
- 說明文字語言（改寫既有 `WRITE`）：「內文使用繁體中文」改為「說明文字的語言依『憲法檢查清單』，沒有規定時使用繁體中文」。
- 回報（併入既有回報 `WRITE`）：加上「憲法遵循」：已讀取的憲法檔路徑（都不存在時寫「沒有憲法檔」）、必須／不得規則是否全部通過、「憲法偏離」、「未套用規則」，以及經 `clarify` 決定的「憲法衝突」。
- 憲法衝突（只有原本沒有 `clarify` 委派可承接的 Skill 新增 `THINK`＋`DELEGATE`＋`CHECK`）：列出必須／不得規則和 spec、上游產出或使用者需求無法同時滿足的項目為「憲法衝突」，委派 `clarify` 詢問；已有缺口盤點與 `clarify` 委派的 Skill 改寫既有盤點步驟承接。

### `s-specify`

Phase 1 -- 對齊輸入與澄清需求：

| 步驟 | 動作 | 全文 |
| ---- | ---- | ---- |
| P1-3 | 新增 | `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/s-specify/spec.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：`### User Story N - 標題 (Priority: Pn)` 標題格式、`US`／`FR-`／`NFR-`／`SC-` 編號格式，以及 Clarifications、Edge Cases、Requirements、Key Entities、Success Criteria 段落。 |
| P1-4 | 原文 | （原 P1-3 載入 spec 樣板組） |
| P1-5 | 修改 | `THINK` 依「spec 樣板組」各段落需要的內容，盤點「需求輸入」中會改變使用者故事切分、需求歸戶、主要流程或正式驗收標準的缺漏、矛盾與歧義，以及和「憲法檢查清單」必須／不得規則無法同時滿足的需求，建立「需求缺口」。 |

Phase 3 -- 產出 spec.md 與自檢：

| 步驟 | 動作 | 全文 |
| ---- | ---- | ---- |
| P3-3 | 修改 | `WRITE` 依「spec 樣板組」、已載入的「spec 文件檢查清單」與「憲法檢查清單」，以「需求決策」、Phase 2 的使用者故事與需求、「推定需求」、「未確認事項」及「澄清結果」，將 spec.md 寫入專案根目錄 `specs/<NNN>-<short-name>/spec.md`；說明文字的語言依「憲法檢查清單」，沒有規定時使用繁體中文，`Feature Branch` 填入 `<NNN>-<short-name>`，`Created` 填入執行當日日期，不建立 git 分支。 |
| P3-4 | 修改 | `CHECK` 逐條驗證「憲法檢查清單」與「spec 文件檢查清單」，並逐一比對 spec.md 與「spec 樣板組」的段落順序與各段落的條目格式，條目標題後的括號標記也必須與樣板相同；「憲法檢查清單」和「spec 文件檢查清單」或樣板衝突時以「憲法檢查清單」為準，規則會改變鎖定項目時不套用並記入「未套用規則」，偏離「應」規則時把規則與理由記入「憲法偏離」；未通過時修正 spec.md 後重新驗證，最多 3 輪，第 3 輪仍未通過時停止修正，將未通過的 Rule 與 spec.md 中的位置加入「未通過項」。 |
| P3-5 | 修改 | 原文最後加一句：「並回報『憲法遵循』：已讀取的憲法檔路徑（都不存在時寫『沒有憲法檔』）、必須／不得規則是否全部通過、『憲法偏離』、『未套用規則』，以及經 `clarify` 決定的憲法衝突。」 |

### `clarify-over-specs`

| 步驟 | 動作 | 全文 |
| ---- | ---- | ---- |
| P1-5 | 新增 | `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/s-specify/spec.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：`### User Story N - 標題 (Priority: Pn)` 標題格式、`US`／`FR-`／`NFR-`／`SC-` 編號格式，以及 Clarifications、Edge Cases、Requirements、Key Entities、Success Criteria 段落。 |
| P2-4 | 修改 | `WRITE` 依已載入的「寫回檢查清單」與「憲法檢查清單」，將「本輪澄清結果」的每項決策寫入「目標 spec」並存檔；只修改「目標 spec」，不建立其他檔案。 |
| P2-6 | 修改 | `CHECK` 逐條驗證「憲法檢查清單」、「寫回檢查清單」與「spec 格式檢查清單」，並比對「目標 spec」與 spec 樣板的段落順序及條目格式；清單衝突時依「憲法檢查清單」、「寫回檢查清單」、「spec 格式檢查清單」的順序為準，規則會改變鎖定項目時不套用並記入「未套用規則」，偏離「應」規則時把規則與理由記入「憲法偏離」；未通過時修正「目標 spec」後重新驗證，最多 3 輪，第 3 輪仍未通過時，將未通過的 Rule 與位置記為「未通過項」。 |
| P2-7 | 修改 | `THINK` 依寫回後的「目標 spec」更新「提問佇列」與「覆蓋地圖」：移除已解決的缺口，將答案引出的新缺口依「缺口掃描檢查清單」排入，並把仍違反「憲法檢查清單」必須／不得規則、需要使用者決定的內容排在「提問佇列」最前面。 |
| P3-2 | 修改 | 原文「『未通過項』與『未驗證原因』」之後加入「、『憲法遵循』（已讀取的憲法檔路徑，都不存在時寫『沒有憲法檔』；必須／不得規則是否全部通過；『憲法偏離』；『未套用規則』）」，其餘原文不變。 |

### `technical-research`

| 步驟 | 動作 | 全文 |
| ---- | ---- | ---- |
| P1-4 | 修改 | `READ` 「目標 spec」全文，以及使用者指定的專案原則文件（沒有時視為空），加入「研究輸入」；並讀取專案根目錄的 `.agents/constitution/shared.md`、`.agents/constitution/skills/technical-research/research.md` 與 `.agents/constitution/skills/technical-research/techstack.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：`research.md` 主題章節的連續編號與 `Decision` 欄位，`techstack.md` 的「技術堆疊總覽」與「本次開發不引入的技術」兩個段落。 |
| P1-8 | 修改 | `THINK` 盤點「主題清單」中無法依「研究輸入」收斂成單一方案的主題，包括使用者限制彼此衝突、限制與需求衝突、限制或需求和「憲法檢查清單」必須／不得規則衝突，或候選方案的取捨取決於使用者偏好，建立「決策缺口」。 |
| P2-3 | 修改 | `THINK` 依「研究輸入」、「查證結果」、「憲法檢查清單」與已載入的「技術決策檢查清單」，為「主題清單」的每個主題決定 `Decision`、`Rationale` 與 `Alternatives considered`。 |
| P2-5 | 修改 | 原文「內文使用繁體中文」改為「說明文字的語言依『憲法檢查清單』，沒有規定時使用繁體中文」，其餘原文不變。 |
| P2-6 | 修改 | 原文「逐條驗證『技術決策檢查清單』」改為「逐條驗證『憲法檢查清單』與『技術決策檢查清單』（衝突時以『憲法檢查清單』為準，規則會改變鎖定項目時不套用並記入『未套用規則』，偏離『應』規則時把規則與理由記入『憲法偏離』）」，其餘原文不變。 |
| P3-5 | 修改 | 原文「逐條驗證『技術堆疊檢查清單』」改為「逐條驗證『憲法檢查清單』與『技術堆疊檢查清單』（衝突時以『憲法檢查清單』為準，處理方式同 Phase 2 步驟 6）」，其餘原文不變。 |
| P3-6 | 修改 | 原文最後加入「，以及『憲法遵循』（已讀取的憲法檔路徑，都不存在時寫『沒有憲法檔』；必須／不得規則是否全部通過；『憲法偏離』；『未套用規則』）」。 |

### `system-analysis`

| 步驟 | 動作 | 全文 |
| ---- | ---- | ---- |
| P1-5 | 新增（P1-4 之後） | `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/system-analysis/plan.md`（不存在的略過），建立「憲法檢查清單」，不讀取 Planner 的憲法檔；鎖定項目不受憲法覆寫：「系統介面盤點」表的介面編號（端點類型英文代號字母加連續數字）、端點類型與需求依據欄，「分析流程安排」的 Wave 結構，以及 Documentation 樹中各 Planner 的產出路徑。 |
| P3-2 | 新增（P3-1 之後） | `THINK` 比對「憲法檢查清單」的必須／不得規則與「分析輸入」、「介面清單」、「Wave 安排」、「專案結構」，列出無法同時滿足的項目，建立「憲法衝突」。 |
| P3-3 | 新增 | `DELEGATE` 「憲法衝突」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以「憲法衝突」為優先提問面向、不要求詳記問答紀錄，取得使用者的決定，依決定調整「介面清單」、「Wave 安排」或「專案結構」；「憲法衝突」為空時略過本步驟與下一步。 |
| P3-4 | 新增 | `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、沒有寫入 `plan.md`，並停止執行；使用者未回覆時停止執行，不寫入 `plan.md`、不委派任何 Planner。 |
| P3-6 | 修改 | （原 P3-3）原文「內文使用繁體中文」改為「說明文字的語言依『憲法檢查清單』，沒有規定時使用繁體中文」，其餘原文不變。 |
| P3-8 | 修改 | （原 P3-5）原文「逐條驗證『介面盤點檢查清單』與『Wave 安排檢查清單』」改為「逐條驗證『憲法檢查清單』、『介面盤點檢查清單』與『Wave 安排檢查清單』（『憲法檢查清單』和其他兩份衝突時以『憲法檢查清單』為準，規則會改變鎖定項目時不套用並記入『未套用規則』，偏離『應』規則時把規則與理由記入『憲法偏離』）」；「重新執行步驟 4 與本步驟」改為「重新執行步驟 7 與本步驟」；「步驟 1 與步驟 3」改為「步驟 1 與步驟 6」；其餘原文不變。 |
| P5-3 | 修改 | 原文「沒有時說明全部通過」之後加入「；`plan.md` 的『憲法遵循』（已讀取的憲法檔路徑，都不存在時寫『沒有憲法檔』；必須／不得規則是否全部通過；『憲法偏離』；『未套用規則』；經 `clarify` 決定的『憲法衝突』）」；「逐字列出 Phase 3 步驟 4 執行的兩個命令」改為「逐字列出 Phase 3 步驟 7 執行的兩個命令」；其餘原文不變。 |

### `api-plan`

| 步驟 | 動作 | 全文 |
| ---- | ---- | ---- |
| P1-5 | 新增（P1-4 之後） | `READ` 專案根目錄的 `.agents/constitution/shared.md`、`.agents/constitution/skills/api-plan/openapi.md` 與 `.agents/constitution/skills/api-plan/asyncapi.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：每個 operation 只有一個以「介面編號 介面名稱」開頭的 tag、每個「可規劃介面」至少一個 operation、`description` 引用 spec 存在的需求編號，以及合約檔路徑 `contracts/openapi.yaml`、`contracts/asyncapi.yaml`。 |
| P2-2 | 修改 | `THINK` 依「規劃輸入」、「憲法檢查清單」與已載入的「API 合約檢查清單」，為「可規劃介面」設計 operation、request、response、錯誤回應與 schema，只設計前端或外部系統與後端之間的介面，不設計資料表或程式實作，建立「API 設計」。 |
| P2-3 | 新增 | `THINK` 比對「憲法檢查清單」的必須／不得規則與「規劃輸入」，列出和 spec、`plan.md` 或技術研究無法同時滿足的項目，建立「憲法衝突」。 |
| P2-4 | 新增 | `DELEGATE` 「憲法衝突」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以「憲法衝突」為優先提問面向、不要求詳記問答紀錄，取得使用者的決定，依決定調整「API 設計」；「憲法衝突」為空時略過本步驟與下一步。 |
| P2-5 | 新增 | `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、沒有產出任何檔案，並停止執行；使用者未回覆時停止執行，回報沒有產出任何檔案。 |
| P3-2 | 修改 | 原文「`summary` 與 `description` 使用繁體中文」改為「`summary` 與 `description` 的語言依『憲法檢查清單』，沒有規定時使用繁體中文」，其餘原文不變。 |
| P3-4 | 修改 | 原文「逐條驗證『API 合約檢查清單』」改為「逐條驗證『憲法檢查清單』與『API 合約檢查清單』（衝突時以『憲法檢查清單』為準，規則會改變鎖定項目時不套用並記入『未套用規則』，偏離『應』規則時把規則與理由記入『憲法偏離』）」，其餘原文不變。 |
| P3-5 | 修改 | 原文最後加入「，以及『憲法遵循』（已讀取的憲法檔路徑，都不存在時寫『沒有憲法檔』；必須／不得規則是否全部通過；『憲法偏離』；『未套用規則』；經 `clarify` 決定的『憲法衝突』）」。 |

### `data-plan`

| 步驟 | 動作 | 全文 |
| ---- | ---- | ---- |
| P1-5 | 新增（P1-4 之後） | `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/data-plan/data-model.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：每張資料表的 `Note` 以「介面編號：」開頭並引用 spec 存在的需求編號、每個「負責介面」至少一張資料表、`Project` 的 `database_type`，以及檔案路徑 `data/data-model.dbml`。 |
| P2-2 | 修改 | `THINK` 依「規劃輸入」、「憲法檢查清單」與已載入的「資料模型檢查清單」，為「負責介面」設計資料表、欄位、Enum、索引與關聯，欄位型別使用技術研究採用的資料庫支援的型別，不設計 API 或程式實作，建立「資料模型設計」。 |
| P2-3 | 新增 | `THINK` 比對「憲法檢查清單」的必須／不得規則與「規劃輸入」，列出和 spec、`plan.md` 或技術研究無法同時滿足的項目，建立「憲法衝突」。 |
| P2-4 | 新增 | `DELEGATE` 「憲法衝突」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以「憲法衝突」為優先提問面向、不要求詳記問答紀錄，取得使用者的決定，依決定調整「資料模型設計」；「憲法衝突」為空時略過本步驟與下一步。 |
| P2-5 | 新增 | `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、沒有產出任何檔案，並停止執行；使用者未回覆時停止執行，回報沒有產出任何檔案。 |
| P3-2 | 修改 | 原文「`Note` 使用繁體中文」改為「`Note` 的語言依『憲法檢查清單』，沒有規定時使用繁體中文」，其餘原文不變。 |
| P3-4 | 修改 | 原文「逐條驗證『資料模型檢查清單』」改為「逐條驗證『憲法檢查清單』與『資料模型檢查清單』（衝突時以『憲法檢查清單』為準，規則會改變鎖定項目時不套用並記入『未套用規則』，偏離『應』規則時把規則與理由記入『憲法偏離』）」，其餘原文不變。 |
| P3-5 | 修改 | 原文最後加入「，以及『憲法遵循』（已讀取的憲法檔路徑，都不存在時寫『沒有憲法檔』；必須／不得規則是否全部通過；『憲法偏離』；『未套用規則』；經 `clarify` 決定的『憲法衝突』）」。 |

### `ui-plan`

Phase 2 標題改為 `## Phase 2 -- 確認視覺風格與憲法衝突`。

| 步驟 | 動作 | 全文 |
| ---- | ---- | ---- |
| P1-5 | 新增（P1-4 之後） | `READ` 專案根目錄的 `.agents/constitution/shared.md`、`.agents/constitution/skills/ui-plan/ui-plan.md` 與 `.agents/constitution/skills/ui-plan/ui-page.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：`ui/plan.md` 的章節編號、第 1 節只列負責介面、第 3.1 節頁面清單以反引號標出 HTML 檔名且第一列為 `index.html`、第 3.2 節流程節點代號不得與介面編號相同、第 4 節各頁狀態；每個 HTML 的 `const STATES = [ … ];` 雛形狀態面板、不引用外部資源、只連到頁面清單內的頁面。 |
| P2-2 | 新增（P2-1 之後） | `THINK` 比對「憲法檢查清單」的必須／不得規則與「規劃輸入」，列出和 spec、`plan.md` 或技術研究無法同時滿足的項目，建立「憲法衝突」。 |
| P2-3 | 修改 | （原 P2-2）`DELEGATE` 「風格缺口」或「憲法衝突」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以「風格缺口」與「憲法衝突」為優先提問面向、不要求詳記問答紀錄，取得使用者確認的項目，與已指定的項目合併為「視覺風格」，並把使用者對「憲法衝突」的決定記為「憲法決策」；兩者都為空，或兩個 `SKILL.md` 都不存在時，略過本步驟。 |
| P2-4 | 修改 | （原 P2-3）原文「『風格缺口』不為空，且兩個 `SKILL.md` 都不存在時」改為「『風格缺口』或『憲法衝突』不為空，且兩個 `SKILL.md` 都不存在時」，其餘原文不變。 |
| P3-2 | 修改 | `THINK` 依「規劃輸入」、「視覺風格」、「憲法檢查清單」、「憲法決策」與已載入的「畫面規劃檢查清單」，為「負責介面」規劃畫面範疇、頁面清單、流程、使用者操作、各頁狀態、驗證與錯誤回饋，以及跨頁共用的假資料；只寫使用者操作與畫面回饋，不寫 API 路徑、HTTP 狀態碼或錯誤碼，建立「畫面規劃」。 |
| P3-4 | 修改 | 原文「內文使用繁體中文」改為「說明文字的語言依『憲法檢查清單』，沒有規定時使用繁體中文」，其餘原文不變。 |
| P4-3 | 修改 | 原文「依『HTML 頁面樣板組』、已載入的『HTML 雛形檢查清單』與 `ui/plan.md`」改為「依『HTML 頁面樣板組』、已載入的『HTML 雛形檢查清單』、『憲法檢查清單』與 `ui/plan.md`」，其餘原文不變。 |
| P4-5 | 修改 | 原文「逐條驗證『畫面規劃檢查清單』與『HTML 雛形檢查清單』」改為「逐條驗證『憲法檢查清單』、『畫面規劃檢查清單』與『HTML 雛形檢查清單』（『憲法檢查清單』和其他兩份衝突時以『憲法檢查清單』為準，規則會改變鎖定項目時不套用並記入『未套用規則』，偏離『應』規則時把規則與理由記入『憲法偏離』）」，其餘原文不變。 |
| P4-6 | 修改 | 原文最後加入「，以及『憲法遵循』（已讀取的憲法檔路徑，都不存在時寫『沒有憲法檔』；必須／不得規則是否全部通過；『憲法偏離』；『未套用規則』；『憲法決策』）」。 |

### `tasks`

| 步驟 | 動作 | 全文 |
| ---- | ---- | ---- |
| P1-5 | 新增（P1-4 之後） | `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/tasks/tasks.md`（不存在的略過），建立「憲法檢查清單」；鎖定項目不受憲法覆寫：`## Phase N:` 標題與 Setup、Foundational、每個 User Story、Polish 的 Phase 順序，任務行 `- [ ] T001` 格式與連續 ID，`[USn]` 標籤，`**Must Read**`／`**Optional**` 參考行 `` `檔案` → 部位 — Why：理由 `` 格式，組標題括號中的介面編號，`待確認 n` 與 Notes 的對應，`**Tests**:` 行，以及 Reference Loading Contract、Path Conventions、Dependencies & Execution Order、Notes 段落。 |
| P2-3 | 修改 | `THINK` 依「任務輸入」、「介面對照」、「憲法檢查清單」與已載入的「任務清單檢查清單」，把工作排入 Setup、Foundational、spec.md 每個 User Story 一個 Phase（依 spec 順序）與 Polish，逐一寫出任務描述與 Must Read／Optional 參考，建立「任務規劃」。 |
| P2-4 | 新增 | `THINK` 比對「憲法檢查清單」的必須／不得規則與「任務輸入」，列出和 spec 或上游產出無法同時滿足的項目，建立「憲法衝突」。 |
| P2-5 | 新增 | `DELEGATE` 「憲法衝突」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以「憲法衝突」為優先提問面向、不要求詳記問答紀錄，取得使用者的決定，依決定調整「任務規劃」；「憲法衝突」為空時略過本步驟與下一步。 |
| P2-6 | 新增 | `CHECK` 兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、沒有產出任何檔案，並停止執行；使用者未回覆時停止執行，回報沒有產出任何檔案。 |
| P3-2 | 修改 | 原文「其餘內文使用繁體中文」改為「其餘說明文字的語言依『憲法檢查清單』，沒有規定時使用繁體中文」，其餘原文不變。 |
| P3-4 | 修改 | 原文「逐條驗證『任務清單檢查清單』」改為「逐條驗證『憲法檢查清單』與『任務清單檢查清單』（衝突時以『憲法檢查清單』為準，規則會改變鎖定項目時不套用並記入『未套用規則』，偏離『應』規則時把規則與理由記入『憲法偏離』）」，其餘原文不變。 |
| P3-5 | 修改 | 原文最後加入「，以及『憲法遵循』（已讀取的憲法檔路徑，都不存在時寫『沒有憲法檔』；必須／不得規則是否全部通過；『憲法偏離』；『未套用規則』；經 `clarify` 決定的『憲法衝突』）」。 |

### `implement`

| 步驟 | 動作 | 全文 |
| ---- | ---- | ---- |
| P2-3 | 新增（P2-2 之後） | `READ` 專案根目錄的 `.agents/constitution/shared.md` 與 `.agents/constitution/skills/implement/code.md`（不存在的略過），建立「憲法檢查清單」，並建立空的「憲法偏離」與「未套用規則」；鎖定項目不受憲法覆寫：任務依 `tasks_state.py` 指定的順序一次執行一個，`tasks.md` 的核取方塊只由 `tasks_state.py check` 變更。 |
| P2-9 | 修改 | （原 P2-8）原文「依『目前任務』、『任務參考』、『實作檢查清單』、『專案衛生檢查清單』與『決策檢查清單』實作任務」改為「依『目前任務』、『任務參考』、『憲法檢查清單』、『實作檢查清單』、『專案衛生檢查清單』與『決策檢查清單』實作任務」，其餘原文不變。 |
| P2-11 | 修改 | （原 P2-10）`CHECK` 依「驗證檢查清單」與「憲法檢查清單」驗證本任務，取得「驗證結果」（「憲法檢查清單」和實作規則衝突時以「憲法檢查清單」為準，規則會改變鎖定項目時不套用並記入「未套用規則」，偏離「應」規則時把規則與理由記入「憲法偏離」）；未通過時修正後重新驗證，最多 3 輪；第 3 輪仍未通過，或任務要求和「憲法檢查清單」的必須／不得規則無法同時滿足時，依「決策檢查清單」處理，不向使用者提問，和憲法衝突的任務記入「受阻任務」並寫明衝突的規則；任務記入「受阻任務」時略過步驟 12。 |
| P3-2 | 修改 | 原文「『決策紀錄』」之後加入「、『憲法遵循』（已讀取的憲法檔路徑，都不存在時寫『沒有憲法檔』；必須／不得規則是否全部通過；『憲法偏離』；『未套用規則』；因憲法衝突而受阻的任務）」，其餘原文不變。 |

`implement` 其餘引用步驟編號的內文依新編號更新：P2-5（原 P2-4）的「重新執行步驟 3」改為「重新執行步驟 4」，P2-12（原 P2-11）的「回到步驟 3」改為「回到步驟 4」，P2-14（原 P2-13）的「返回步驟 3」改為「返回步驟 4」。

### `constitution`

| 步驟 | 動作 | 全文 |
| ---- | ---- | ---- |
| P1-1 | 修改 | `READ` 使用者需求；在專案根目錄執行 `find .agents/constitution -type f` 列出所有既有憲法檔（不截斷輸出），並讀取列出的每個檔案，建立「憲法輸入」。 |

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| 「或專案中名為 `constitution.md` 的檔案（都沒有時視為空）」 | `technical-research` P1-4 內文 | 無法追溯：E9；憲法改由同一步驟讀取 `.agents/constitution/`（C3） |
| 「內文使用繁體中文」等寫死的語言要求 | `s-specify` P3-3、`technical-research` P2-5、`system-analysis` P3-3、`api-plan` P3-2、`data-plan` P3-2、`ui-plan` P3-4、`tasks` P3-2 | 改寫為「依『憲法檢查清單』，沒有規定時使用繁體中文」（C6）；原文表達的固定語言和 E8 衝突 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| 9 個 SDD Skill 的憲法載入 `READ` | 新增（8 個 Skill）／修改（`technical-research` P1-4） | 讀取 `shared.md` 與本 Skill 憲法檔，建立「憲法檢查清單」，列出鎖定項目 | R1、R2；E1、E3、E9、E10（C1–C3） |
| 憲法衝突的 `THINK`＋`DELEGATE`＋`CHECK` | 新增（`system-analysis`、`api-plan`、`data-plan`、`tasks`）；`ui-plan` 新增 `THINK`、修改既有 `DELEGATE`／`CHECK` | 無法同時滿足的必須／不得規則委派 `clarify` | R1；E4（C4） |
| 既有缺口盤點 `THINK` | 修改（`s-specify` P1-5、`technical-research` P1-8、`clarify-over-specs` P2-7） | 把憲法衝突併入既有缺口 | R1；E4、E10（C4） |
| 設計或寫入步驟引用「憲法檢查清單」 | 修改 | 加入「憲法檢查清單」作為依據 | R1；E2（C5） |
| 寫入步驟的語言 | 修改 | 依憲法，沒有規定時繁中 | R1；E7、E8（C6） |
| 既有驗證 `CHECK` | 修改 | 逐條驗證「憲法檢查清單」、優先順序、未套用規則、憲法偏離；`implement` 衝突時記受阻任務 | R1；E2、E3、E4、E5（C7、C8） |
| 既有回報 `WRITE` | 修改 | 加入「憲法遵循」 | R1；E6（C9） |
| `ui-plan` Phase 2 標題 | 修改 | 「確認視覺風格」改為「確認視覺風格與憲法衝突」 | E4 |
| `constitution` P1-1 | 修改 | 指定 `find .agents/constitution -type f` 不截斷 | R3；E11（C10） |
| `docs/待確認.md` 第 15 項 | 修改（非 Skill 部位） | 移到「已確認」，結論「載入 `skills/s-specify/spec.md`，依共同機制處理」 | E10 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| 10 個 Skill 的 frontmatter（`name` 與 `description`） | E12：description 概述的產出與觸發情境不變；憲法是所有 SDD Skill 共同的產出前置，不改變分流 | 無（只概述用途與觸發情境） |
| 10 個 Skill 的所有 Phase（`ui-plan` Phase 2 只改標題）與完成條件 | E12 | 無（只組織步驟與概述結果） |
| 10 個 Skill 未列於第 2 節的步驟 | E12：輸入、確認閘門、委派、檢查腳本與回報的既有流程 | 各 Skill 既有約束（C11） |
| 10 個 Skill 的所有 RuleFile、Rule、樣板組與腳本 | E12：產出格式與檢查腳本保證的鎖定項目 | 各 Skill 既有約束（C11） |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 33 | 33 | 0 |
| 步驟 | 186 | 207 | +21 |
| RuleFile | 21 | 21 | 0 |
| Rule | 71 | 71 | 0 |
| 樣板組 | 11 | 11 | 0 |
| 腳本 | 5 | 5 | 0 |

計數範圍：本次修改的 10 個 Skill（9 個 SDD Skill 與 `constitution`）。

增加的 21 個步驟：8 個憲法載入 `READ`（R1、E1；`technical-research` 改寫既有 P1-4，不新增）；`system-analysis`、`api-plan`、`data-plan`、`tasks` 各 3 個憲法衝突步驟，共 12 個（E4）；`ui-plan` 1 個憲法衝突 `THINK`（E4，委派與檢查改寫既有 P2-3、P2-4）；`implement` 的衝突處理併入既有驗證步驟，不新增。

新增而不改寫的理由：8 個 Skill 原本沒有任何讀取憲法的步驟可改寫（R1 缺失）；載入步驟要產出獨立命名的「憲法檢查清單」並列出鎖定項目，併入既有輸入 `READ` 會讓一個步驟讀取兩類輸入、建立兩個結果。`system-analysis`、`api-plan`、`data-plan`、`tasks` 原本沒有可承接衝突的 `clarify` 委派，所以新增；`s-specify`、`technical-research`、`clarify-over-specs`、`ui-plan` 已有缺口盤點或 `clarify` 委派，改寫既有步驟承接。驗證與回報全部併入既有 `CHECK`、`WRITE`，不新增步驟。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 讀取 `shared.md` 與本 Skill 的憲法檔路徑，不存在時略過 | 各 Skill 的憲法載入 `READ` | 該步驟內文 | 只屬於單一步驟、一句話可表達；檔案路徑依落點表，各 Skill 不同；不需正反例；憲法檔是專案輸入，不是本 Skill 的部位，不適用腳本或樣板 |
| C2 | 本 Skill 的鎖定項目清單 | 各 Skill 的憲法載入 `READ` | 該步驟內文 | 交接決策「鎖定項目寫在各 Skill 的憲法載入步驟（一行清單）」；`constitution` 的 `rules/鎖定項目-格式規範.md` Rule 1 依此位置讀取；腳本已保證的結構由腳本檢查，清單只負責宣告不可覆寫 |
| C3 | `system-analysis` 不讀 Planner 的憲法檔、委派內容不轉述憲法 | `system-analysis` P1-5 | 該步驟內文 | 只屬於單一步驟；委派內容不變（P5-1 原文不提憲法） |
| C4 | 必須／不得規則和上游無法同時滿足時，委派 `clarify`；沒有 `clarify` 或未回覆時停止 | 各 Skill 的憲法衝突步驟或既有缺口盤點 | SOP 流程 | 屬於分支與使用者確認 |
| C5 | 設計與寫入時以「憲法檢查清單」為依據 | 各 Skill 的設計 `THINK` 或寫入 `WRITE` | 該步驟內文（引用載入結果名稱） | 只引用載入結果，不重述規則 |
| C6 | 說明文字的語言依憲法，沒有規定時繁中 | 各 Skill 的寫入 `WRITE` | 該步驟內文 | 既有語言要求的存放位置不變，只改寫內容；一句話可表達 |
| C7 | 驗證時「憲法檢查清單」優先於本 Skill 的檢查清單與樣板；規則改變鎖定項目時不套用並記「未套用規則」；偏離「應」記「憲法偏離」 | 各 Skill 的驗證 `CHECK` | 該步驟內文 | 屬於驗證步驟的判定分支；各 Skill 的驗證步驟不同，無共用 RuleFile；做成 RuleFile 會讓 9 個 Skill 各多一份同內容的檔案 |
| C8 | `implement` 不提問，和憲法衝突的任務記入「受阻任務」並寫明規則 | `implement` P2-11 | SOP 流程 | 屬於分支；受阻任務的處理方式由既有 `rules/自主決策-格式規範.md` 負責，本約束只決定進入該分支的條件 |
| C9 | 回報「憲法遵循」的 5 項內容 | 各 Skill 的回報 `WRITE` | 該步驟內文 | 只屬於回報步驟、一句話可表達；回報不是檔案產出，不適用樣板 |
| C10 | `constitution` 以 `find .agents/constitution -type f` 不截斷列檔 | `constitution` P1-1 | 該步驟內文 | 既有工具的單一命令即可完成，依約束分配 Rule 2 寫在步驟內文，不另建腳本 |
| C11 | 各 Skill 既有的 SOP、RuleFile、樣板與腳本約束 | 各自原步驟 | 原存放位置 | 既有，不變（E12） |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-sop` | `s-specify` SOP | 依第 2 節 `s-specify` 表施工 | C1、C2、C4–C7、C9 | 已完成 |
| 2 | W2 | `skill-form-sop` | `clarify-over-specs` SOP | 依第 2 節 `clarify-over-specs` 表施工 | C1、C2、C4、C5、C7、C9 | 已完成 |
| 3 | W3 | `skill-form-sop` | `technical-research` SOP | 依第 2 節 `technical-research` 表施工（含刪除 `constitution.md`） | C1、C2、C4–C7、C9 | 已完成 |
| 4 | W4 | `skill-form-sop` | `system-analysis` SOP | 依第 2 節 `system-analysis` 表施工 | C1–C7、C9 | 已完成 |
| 5 | W5 | `skill-form-sop` | `api-plan` SOP | 依第 2 節 `api-plan` 表施工 | C1、C2、C4–C7、C9 | 已完成 |
| 6 | W6 | `skill-form-sop` | `data-plan` SOP | 依第 2 節 `data-plan` 表施工 | C1、C2、C4–C7、C9 | 已完成 |
| 7 | W7 | `skill-form-sop` | `ui-plan` SOP | 依第 2 節 `ui-plan` 表施工（含 Phase 2 標題） | C1、C2、C4–C7、C9 | 已完成 |
| 8 | W8 | `skill-form-sop` | `tasks` SOP | 依第 2 節 `tasks` 表施工 | C1、C2、C4–C7、C9 | 已完成 |
| 9 | W9 | `skill-form-sop` | `implement` SOP | 依第 2 節 `implement` 表施工 | C1、C2、C5、C7–C9 | 已完成 |
| 10 | W10 | `skill-form-sop` | `constitution` SOP | 依第 2 節 `constitution` 表施工 | C10 | 已完成 |
| 11 | W11 | 主 session 直接修改 | `docs/待確認.md` 第 15 項 | 寫入決定與處理紀錄，移到「已確認」 | 無（非 Skill 部位） | 已完成 |

### 工作項內容

- W1–W10：委派內容為第 2 節對應 Skill 的表格全文與「共用寫法」；只做表格列出的新增與修改，未列出的步驟與完成條件保留原文，步驟編號依新增後重排並更新內文的步驟引用。沒有抽取部位，所以胖 SOP 即為最終 SOP，沒有 SOP 收尾工作項。W1–W10 互不重疊，以 `implementer` 子代理各自載入 `skill-form-sop` 平行施工。
- W11：`docs/待確認.md` 第 15 項寫「決定（2026-11-03）：載入 `skills/s-specify/spec.md`，依 9 個 SDD Skill 共同的憲法機制處理，不另外把憲法併入 10 類缺口掃描（紀錄 `specs/skill-engineering/32-sdd-skills-接入憲法/`）」，並移到「已確認」。
- 施工中修正（2026-11-03）：`technical-research` P3-6、`api-plan` P3-5、`data-plan` P3-5、`ui-plan` P4-6、`tasks` P3-5 依「原文最後加入『，以及『憲法遵循』…』」施工後，句子出現連續兩個「以及」；改為「…以及『未通過項』（…）與『憲法遵循』（…）」，內容不變。
- 施工時不修改 `clarify`、任何 RuleFile、樣板與腳本，也不修改 description。

## 7. 驗收情境

測試環境：每個情境各一份包含本次未提交修改的暫存專案複本（`.claude/skills/` 與 `.agents/skills/` 為修改後的 Skill，`specs/` 只放情境需要的 spec 目錄），執行前先 commit 基準狀態。「repo 憲法」指目前 `.agents/constitution/` 的 3 份檔案。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E6、E9、E12；呼叫者回歸（`system-analysis` → 3 個 Planner） | 本次（課程 32:00 原始輸入） | 環境：`specs/002-room-game-chat/`（只有 `spec.md`）；repo 憲法，加上測試用 `skills/technical-research/research.md`（Rule 1：每個主題的 `Rationale` 必須寫出採用方案的授權條款名稱）、`skills/system-analysis/plan.md`（Rule 1：Source Code 樹每個頂層目錄的註解必須寫出負責的介面編號）、`skills/ui-plan/ui-plan.md`（Rule 1：第 2 節必須寫出內文最小字級，單位 px）。輸入：「請對 specs/002-room-game-chat 做 technical-research，接著做 system-analysis，一次做完全部」 | `clarify` 提問時回覆「照推薦」 | `research.md` 每個主題的 `Rationale` 有授權條款；`plan.md` Source Code 頂層目錄註解有介面編號；`data/data-model.dbml` 每張表有 `created_at`、`updated_at`、`updated_by`、`deleted_at`，沒有硬刪除描述；`contracts/openapi.yaml` 的查詢聊天歷史 operation 符合 `openapi.md` Rule 1–5（`page`／`pageSize` 預設 20、上限 100，回應 `items`、`page`、`pageSize`、`totalItems`、`totalPages`，400 `PAGINATION_INVALID`，`description` 寫排序依據）；`ui/plan.md` 第 2 節有最小字級；4 個檢查腳本通過；每個 Skill 的回報有「憲法遵循」；對話紀錄顯示每個 Skill 讀取自己的憲法檔，`technical-research` 沒有搜尋 `constitution.md`，`system-analysis` 的委派內容沒有憲法內容 |
| S2 | E4 | 本次 | 環境：`specs/001-online-pvp-1a2b/` 複本，`spec.md` 的 User Story 3 加入「FR-019：玩家離開房間後，系統必須永久刪除該玩家在本房間的猜測紀錄，不得保留可復原的資料」，`plan.md` 的 D2 需求依據加入 FR-019；repo 憲法。輸入：「請為 specs/001-online-pvp-1a2b 重新設計資料模型，覆寫既有的 data-model.dbml」 | 覆寫詢問回覆「同意覆寫」；`clarify` 提問時回覆「猜測紀錄依 FR-019 直接刪除，其他資料表維持軟刪除」 | 寫入 DBML 前有委派 `clarify`，問題指出 `data-model.md` Rule 2 與 FR-019 衝突；`guesses` 沒有 `deleted_at`，其餘資料表有 4 個生命週期欄位；`check_data_model.py` 通過；回報的「憲法遵循」列出這項經 `clarify` 決定的衝突 |
| S3 | E7、E12 | 回歸 | 環境：`specs/001-online-pvp-1a2b/` 複本；刪除 `.agents/constitution/`。輸入：「請為 specs/001-online-pvp-1a2b 重新產出 API 合約，覆寫既有檔案」 | 覆寫詢問回覆「同意覆寫」 | 沒有詢問憲法相關問題；`summary` 與 `description` 為繁體中文；`check_contracts.py` 通過；回報的「憲法遵循」寫「沒有憲法檔」 |
| S4 | E3、E8 | 本次 | 環境：同 S3，但 `.agents/constitution/` 為 repo 憲法並改寫：`shared.md` Rule 1 改為「說明文字必須使用英文」；`skills/api-plan/openapi.md` 新增 Rule 6「每個 operation 的 tag 必須使用資源名稱，例如 rooms、guesses」。輸入同 S3 | 覆寫詢問回覆「同意覆寫」 | `summary` 與 `description` 為英文；每個 operation 的 tag 仍為「介面編號 介面名稱」；`check_contracts.py` 通過；回報的「未套用規則」列出 Rule 6 與衝突的 tag 鎖定項目 |
| S5 | E1、E2、E4、E5、E6 | 本次 | 環境：`specs/001-online-pvp-1a2b/` 複本；repo 憲法，加上測試用 `skills/tasks/tasks.md`（Rule 1：每個任務描述必須以動詞開頭；Rule 2：每個 Phase 的任務數應不超過 5 個）與 `skills/implement/code.md`（Rule 1：程式碼註解必須使用英文；Rule 2：不得使用 Prettier）。輸入一：「請為 specs/001-online-pvp-1a2b 重新產生 tasks.md，覆寫既有檔案」；輸入二：「請實作 specs/001-online-pvp-1a2b 的 Phase 1」 | 覆寫詢問回覆「同意覆寫」；`clarify` 提問時回覆「照推薦」 | `tasks.md` 的每個任務描述以動詞開頭，`check_tasks.py` 通過；任務數超過 5 的 Phase 在回報的「憲法偏離」寫出 Rule 2 與理由；`implement` 沒有向使用者提問；建立的設定檔沒有中文註解；要求 Prettier 的任務記為受阻，完成報告寫出 `code.md` Rule 2；其餘 Phase 1 任務已打勾；完成報告有「憲法遵循」 |
| S6 | E1、E2、E6、E10 | 本次 | 環境：沒有 spec 目錄；repo 憲法，加上測試用 `skills/s-specify/spec.md`（Rule 1：每個 User Story 必須至少有 3 個驗收情境；Rule 2：Assumptions 每一項必須標出來源為「使用者」或「推定」）。輸入一：「做一個團隊午餐訂購功能：同事在中午前登記要訂的便當，負責人截止後彙整訂單並通知店家」；輸入二：「請對剛產出的 spec 做 clarify-over-specs，問 2 題」 | `clarify` 提問時回覆「照推薦」 | `s-specify` 產出的每個 User Story 至少 3 個驗收情境，每項 Assumption 標出來源；`clarify-over-specs` 寫回後兩條規則仍成立；兩個 Skill 的回報都有「憲法遵循」；對話紀錄顯示兩個 Skill 都讀取 `skills/s-specify/spec.md` |
| S7 | E11 | 本次 | 環境：repo 憲法。輸入：「API 合約的錯誤回應都必須有 code 和 message 兩個欄位」 | `clarify` 提問時回覆「沒有其他要求，照我說的寫」 | 對話紀錄中第一個列出憲法檔的命令是 `find .agents/constitution -type f` 且沒有接 `head`；`skills/api-plan/openapi.md` 的 Rule 1–5 原文不變，新規則寫成 Rule 6 或併入同面向的既有 Rule |

## 8. 驗收結果

- 結構診斷：10 個 Skill 為 0 個 error、0 個 warning。
- 同步：`./scripts/sync-skills.sh --from agents` 與 `--check` 退出狀態均為零，結果為「兩邊一致」；沒有只存在於目標端、未被刪除的 Skill。`clarify` 沒有變更。
- To-Be 一致性：10 個 Skill 步驟總數 207（As-Is 186，+21），與第 4 節一致；`technical-research` 不再出現 `constitution.md`；9 個 SDD Skill 的回報步驟都有「憲法遵循」。
- 驗收方式：每個情境在 scratchpad 的 `accept32/<情境>` 暫存專案執行（含本次未提交修改，執行前 commit 基準狀態），執行後由主 session 以 `git status`、產出檔內容與檢查腳本重跑核對。子代理不帶本次分析脈絡，透過 Agent 工具指定 `model: sonnet`、`effort: medium`（Sonnet 5.5，低於主模型 Opus 5.5 的中階模型），以 `general-purpose` 執行。
- 情境補充：S1 的 002 spec 在 Out of Scope 排除聊天紀錄保存，`technical-research` 決定以伺服器記憶體保存、後端全用 Socket.IO，沒有產出 DBML 與 OpenAPI（和課程 32:00 的產出不同，屬合理的設計結果，不是 Skill 偏離）；為驗證 DBML 稽核欄位與分頁，新增 S1b。S5、S8 的子代理都選擇遵守「應」規則，E5 沒有被觸發；S1b 以兩條互相矛盾的「應」規則補驗 E5。

| 編號 | 結果 | 摘要 |
| ---- | ---- | ---- |
| S1 | 通過（部分判斷項不適用） | `research.md` 每個主題寫出授權條款；`plan.md` Source Code 頂層目錄註解有 F1–F4、B1–B4；`ui/plan.md` 第 2 節有「內文最小字級 14px」；`check_ui.py`、`check_contracts.py` 通過；每個 Skill（含 ui-plan、api-plan 子代理）只讀自己的憲法檔，沒有搜尋 `constitution.md`；委派內容沒有轉述憲法。DBML 與 OpenAPI 判斷項不適用（見情境補充）。執行者略過 `system-analysis` 的視覺風格閘門，為執行者偏離 |
| S1b | 通過 | 午餐訂購 spec（S6 產出）跑 `technical-research` → `system-analysis`：`data-model.dbml` 3 張表都有 `created_at`、`updated_at`、`updated_by`、`deleted_at`；`listOrderSummary` 有 `page`／`pageSize`（預設 20、上限 100），回應 `items`、`page`、`pageSize`、`totalItems`、`totalPages`，400 `PAGINATION_INVALID`，description 寫排序依據且最後為 `id`，page 超過總頁數回 200 空 `items`；3 個檢查腳本通過；data-plan 遇兩條矛盾的「應」規則，依 Rule 4 採複數並把 Rule 3 記入「憲法偏離」與理由（E5）。執行者再次以事後補寫代替展示 `technical-research` 的 clarify 與視覺風格閘門 |
| S2 | 通過 | 寫入 DBML 前委派 `clarify`，問題指出 `data-model.md` Rule 1、2 與 FR-019 衝突；`guesses` 沒有 `deleted_at`，其餘 3 張表有 4 個生命週期欄位；`check_data_model.py` 通過；「憲法遵循」列出經 `clarify` 決定的衝突 |
| S3 | 通過（回歸） | 沒有憲法相關提問；說明文字為繁體中文；`check_contracts.py` 通過；「憲法遵循」寫「沒有憲法檔」 |
| S4 | 通過 | `summary`／`description` 為英文；tag 仍為「介面編號 介面名稱」；`check_contracts.py` 通過；「未套用規則」列出 `openapi.md` Rule 6 與 tag 鎖定項目 |
| S5 | 通過（E5 未觸發） | `tasks.md` 每個任務描述以動詞開頭，`check_tasks.py` 0 issues；`implement` 沒有提問；要求 Prettier 的 T002、T003、T005 記為受阻並寫出 `code.md` Rule 2；設定檔註解為英文；完成報告有「憲法遵循」。每個 Phase 都排成 5 個任務以內，沒有偏離「應」規則 |
| S6 | 通過 | 3 個 User Story 各有 5、8、3 個驗收情境；Assumptions 每項標出「（使用者）」或「（推定）」；`clarify-over-specs` 寫回後仍成立；兩個 Skill 都讀 `skills/s-specify/spec.md`，回報有「憲法遵循」 |
| S7 | 通過 | 第一個列出憲法檔的命令是 `find .agents/constitution -type f`，沒有接 `head`；`openapi.md` 新增 Rule 6，Rule 1–5 原文不變 |
| S8 | E5 未觸發 | 補驗用：`openapi.md` 加「應」規則 `x-rate-limit`；子代理自行擬定 10、20、60 的數值並遵守，沒有偏離 |

- 驗收條件對照：E1（S1、S1b、S2–S6）、E2（S1、S1b、S2、S4–S6）、E3（S4）、E4（S2、S5）、E5（S1b）、E6（全部）、E7（S3）、E8（S4）、E9（S1、S1b）、E10（S6）、E11（S7）、E12（各檢查腳本通過；覆寫詢問 S2–S5、`clarify` 委派 S2、S6 正常；`system-analysis` 視覺風格閘門兩次被執行者略過，無法親自證實）。
- 觀察與調整建議（未施工，待使用者決定）：
  1. `tasks` 只讀自己的憲法檔，看不到 `skills/implement/code.md`；S5 依 research 排出 Prettier 任務，到 `implement` 才衝突並受阻。可考慮讓 `tasks` 也讀 `code.md`，在規劃階段就委派 `clarify`。
  2. 交接文件第 2 節的優先順序「Skill 專屬憲法檔 ＞ `shared.md`」沒有寫進 SOP；目前只寫「憲法 ＞ Skill 內建規則」。兩者衝突時的處理方式尚未定義，本次情境沒有遇到。
  3. spec 沒有提供數值時，子代理會自行擬定數值來遵守「應」規則（S8 的限流上限）。
  4. 由 `system-analysis` 以子代理委派的 Planner 無法直接向使用者提問；S1b 的 data-plan 子代理以預先回覆作答，實際使用時會停止並回報。
  5. 子代理執行者兩次以事後補寫代替展示互動閘門；需要由使用者以 `user-verify-skill` 實際驗證這些閘門。
  6. 既有問題（非本次修改）：`api-plan` 樣板的 `Error` schema 寫「繁體中文錯誤訊息」，和英文憲法有落差（S4）；`constitution` 寫規則時多加了「4xx 與 5xx」「列在 `required`」（S7，屬 31 號 E6 範圍）；「使用者原話寫覆寫」是否等於已同意覆寫，SOP 沒有說明（S2、S3）。
- 個案驗收條件：無。
- 調整建議的決定（2026-11-04，使用者回覆「照建議」）：
  1. 第 1 點不改，記入 `docs/待確認.md` 第 19 項。
  2. 第 2 點不改 SOP：`constitution` 的 E3 只讓「適用全部產出物、寫法不需依產出物改變」的規則寫入 `shared.md`（課程 19:30 把「成功與失敗回應」移回 api-plan），專屬檔與 `shared.md` 依此不會衝突；交接文件「Skill 專屬憲法檔 ＞ `shared.md`」視為被這個門檻取代。
  3. 第 5 點合併到交接文件 8.5（`constitution`）與 8.6（`technical-research` → `system-analysis`，比照課程 32:00）由使用者親自執行；通過後移除對應 Skill 的「（未驗證）」。
- 未驗證標記：依 CLAUDE.md 與 23、28、29 號紀錄的慣例，10 個 Skill 的 `description` 開頭加上「（未驗證）」，其餘文字不變；重跑同步，結果為「兩邊一致」。

### 使用者實際驗證（2026-11-04）

- 方式：沒有用 `user-verify-skill` 在暫存專案重跑。使用者在主專案對 `specs/002-room-game-chat` 實際執行 `technical-research` → `system-analysis`（比照課程 32:00），主 session 為 Opus 5.5，Wave 1、2 的 `ui-plan`、`data-plan`、`api-plan` 由子代理執行。過程與結果見 `docs/handoff/002-最終驗收紀錄.md`。
- 權限處理：在主專案執行，沒有建立暫存專案與 Herdr 測試 session。
- 結果：通過。`data-model.dbml` 的 `chat_messages` 有 4 個生命週期欄位；`listChatMessages` 符合 `openapi.md` Rule 1–5；`check_ui.py`、DBML 檢查、`check_contracts.py` 都沒有問題。
- 觀察：
  1. 軟刪除（`data-model.md` Rule 2）和 FR-008 衝突，`data-plan` 子代理沒有委派 `clarify`，自行保留連帶刪除。使用者事後決定在 Rule 2 加例外：「spec 明確要求不保留的資料，可以直接刪除資料列」。
  2. 視覺風格閘門有向使用者提問，使用者看不懂兩次提問，主 session 改採推薦選項。
  3. `technical-research` 決定不分頁，`api-plan` 依憲法改成分頁，主 session 事後修改 research §3。
- 結論：移除 `technical-research`、`system-analysis`、`api-plan`、`data-plan`、`ui-plan` 的「（未驗證）」；重跑同步，結果為「兩邊一致」。`s-specify`、`clarify-over-specs`、`tasks`、`implement` 這次沒有實際執行，保留「（未驗證）」。
