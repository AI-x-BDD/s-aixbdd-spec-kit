# 工程藍圖：analyze－缺欄位涵蓋表與任務順序檢查

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/56-analyze-缺欄位涵蓋表與任務順序檢查/`
- 根因報告：同一紀錄目錄的 `rca-report.md`。使用者已確認 E1～E15、S1～S4 與 R1～R4；推定的 E4、E5 嚴重度、E7 判斷標準保留（2026-11-19，回覆「都同意」）
- 確認紀錄：使用者於 2026-11-19 Phase 4 回覆「確認」，同意 W1～W8、第 3 節的 2 項刪除與驗收情境 S1～S4
- 第 2 次根因報告確認：使用者於 2026-11-19 回覆「1 照建議改寫 (d)、2 同意 R5、3 另開一輪、4 接受」。S3 (d) 改為回歸檢查（見第 7 節）；R5 不在本輪處理，記在 `docs/待確認.md` 第 38 項；舊 F1 這類需要推理並行語意的問題屬於模型判斷，不列為必過

## 1. 驗收條件

「受約束欄位」：`data/` 下 `.dbml` 檔中，欄位 `note` 以「驗證：」或「轉換：」開頭的欄位，以及資料表 `Note` 的「跨欄位：」括號內列出的每個 `table.column`（和 `tasks` 的定義相同）。

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | `analysis.md` 有「欄位涵蓋」表：每個受約束欄位一列，列出 `table.column`、資料模型位置、實作任務 ID（在 Must Read 以 `` `data/data-model.dbml` → `table.column` `` 引用它的非測試任務）與備註；列數等於受約束欄位數 | 本次 | 通用 |
| E2 | 受約束欄位沒有實作任務引用時（只有測試任務引用、只引用 `Table <table>`、只在描述寫欄位名稱都不算），列一筆 E 類 HIGH，寫出欄位；任務引用的 `table.column` 在資料模型找不到時，列一筆 E 類 HIGH，寫出任務 ID 與該引用，不猜成別的欄位 | 本次 | 通用 |
| E3 | 任務描述寫出的欄位限制和資料模型矛盾時，即使有引用也列一筆 F 類 HIGH；位置列出任務 ID 與 `table.column`，摘要寫出兩邊的限制。只有引用、和資料模型一致的重述、不矛盾的「任務限定：」不列問題 | 本次 | 通用 |
| E4 | 沒有資料模型，或資料模型沒有受約束欄位時，「欄位涵蓋」寫「不適用」與原因，不產生 E2 的問題，不虛構欄位 | 推定（已確認） | 通用 |
| E5 | 任務順序矛盾列 F 類：(a) 用到後面任務才建立的檔案、資料表、函式或設定且沒寫依賴，HIGH；(b) 改變既有行為、更新相依既有測試的任務排在後面的 Phase，HIGH；(c) 標 `[P]` 的任務依賴同 Phase 其他任務，MEDIUM。位置可以是同一份 `tasks.md` 的兩個任務 ID | 本次（嚴重度為推定，已確認） | 通用 |
| E6 | 安全或效能描述沒有量化標準時，列 B 類 HIGH | 本次 | 通用 |
| E7 | 「需求涵蓋」的每個 SC 標出是否計入涵蓋率；只能在上線後以實際使用資料量測的 SC 不計入需求總數與涵蓋率，也不列 E 類；其他 SC 照常計入；「統計」寫出不計入的 SC 數與 ID | 本次（判斷標準為推定，已確認） | 通用 |
| E8 | 「統計」列出 A～F 各類別與各嚴重度的問題數 | 本次 | 通用 |
| E9 | 欄位涵蓋需要的 DBML 解析與引用比對由 `analyze` 自己的部位完成，不呼叫或讀取 `data-plan`、`tasks` 的腳本 | 本次 | 通用 |
| E10 | 只寫入 `analysis.md`，不修改上游文件；缺少 `spec.md`、`plan.md` 或 `tasks.md` 時停止，不建立檔案 | 既有 | 通用 |
| E11 | 問題歸入 A～F 一類，ID 連續；位置可搜尋；F 類至少兩個文件（任務順序除外）；建議寫出文件、部位與方向；處理 Skill 正確 | 既有 | 通用 |
| E12 | 每份憲法檔的每條 Rule 都有結果；違反「必須」「不得」為 D 類 CRITICAL | 既有 | 通用 |
| E13 | 嚴重度四級，符合多級取最高；可一一對應的命名差異不列 HIGH | 既有 | 通用 |
| E14 | 區塊結構與樣板一致、沒有 `{{`；最多 50 筆並摘要超出部分；「需求涵蓋」「介面涵蓋」「欄位涵蓋」「統計」的數字和涵蓋盤點一致 | 既有（「欄位涵蓋」為本次） | 通用 |
| E15 | 回報路徑、各嚴重度問題數、CRITICAL 的 ID 與摘要、「下一步」，並說明沒有修改上游 | 既有 | 通用 |

## 2. To-Be SOP

````markdown
---
name: analyze
description: 已有 spec.md、plan.md（含 system-analysis 委派產出的 ui/、data/、contracts/，以及 notification-plan 產出的 notification/）與 tasks.md，要在實作前檢查這些文件是否一致時使用；不修改任何上游文件，比對 spec、plan、Planner 產出與 tasks 的重複、歧義、不足、涵蓋缺口與不一致（包括 API 合約、資料模型與 UI 規劃之間的命名與行為差異、資料模型受約束欄位的任務引用與矛盾，以及任務順序），並依 `.agents/constitution/` 檢查憲法遵循，違反必須／不得規則為 CRITICAL，每個問題標出位置、建議與處理 Skill，寫成 spec 目錄的 analysis.md。觸發關鍵字：analyze、analysis.md、一致性分析、檢查一致性、跨文件檢查、欄位涵蓋、憲法檢查、實作前檢查。分流：要修正 spec 改用 `s-specify` 或 `clarify-over-specs`；要修正某一種 Planner 產出改用 `api-plan`、`data-plan` 或 `ui-plan`；要修正通知規劃改用 `notification-plan`；要重新產生任務清單改用 `tasks`；要新增或修改憲法規則改用 `constitution`；依 tasks.md 實作改用 `implement`。
---

# SOP

## Phase 1 -- 收斂分析輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「分析輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行；沒有 `tasks.md` 時，告知使用者需要先拆解任務（可使用 `tasks`）並停止執行；停止時不建立任何檔案。
5. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`tasks.md`、`research.md`、`techstack.md` 與 `ui/`、`data/`、`contracts/`、`notification/` 下所有檔案的全文（不存在的略過），加入「分析輸入」。
6. `READ` 在專案根目錄執行 `find .agents/constitution -type f` 列出所有憲法檔（不截斷輸出）並讀取每個檔案；對 `skills/<Skill>/` 下的憲法檔，讀取專案 `.agents/skills/<Skill>/SKILL.md`（不存在時改讀 `.claude/skills/<Skill>/SKILL.md`）中列出鎖定項目的步驟；建立「憲法輸入」，沒有憲法檔時為空。

完成條件：「目標 spec」、`plan.md`、`tasks.md` 與同目錄的上游文件已讀取，「憲法輸入」已建立；或缺少輸入，已停止執行並回報。

## Phase 2 -- 偵測問題

1. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/collect_coverage.py --spec-dir <目標 spec 目錄絕對路徑>`（「不計入的 SC」已建立且不為空時，加上 `--exclude-sc <以逗號分隔的 SC 編號>`），取得「涵蓋盤點」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
2. `CHECK` 退出狀態為零且標準輸出為可解析的 JSON；因參數或環境錯誤而失敗時修正後重新執行上一步，仍失敗時回報原因並停止執行，不建立任何檔案。
3. `READ` 偵測問題時，讀取 `rules/分析問題-格式規範.md` 的所有 Rule，建立「問題檢查清單」。
4. `THINK` 依「分析輸入」、「憲法輸入」、「涵蓋盤點」與已載入的「問題檢查清單」，比對各文件找出問題，為每個問題決定類別、嚴重度、位置、建議與處理 Skill，建立「問題清單」；判斷 spec.md 的每個 SC 是否計入涵蓋率，建立「不計入的 SC」；並逐份憲法檔、逐條 Rule 記下對照結果，建立「憲法遵循結果」。
5. `CHECK` 逐條驗證「問題檢查清單」，並以 `grep -n` 依「問題檢查清單」確認「問題清單」每個位置的識別字都能在該檔案搜尋到；未通過時修正「問題清單」後重新驗證。「不計入的 SC」和取得「涵蓋盤點」時使用的 `--exclude-sc` 不同時，重新執行步驟 1、2 取得「涵蓋盤點」，再驗證本步驟。

完成條件：已依「不計入的 SC」取得「涵蓋盤點」，「問題清單」與「憲法遵循結果」已通過「問題檢查清單」，且每個位置都能搜尋到。

## Phase 3 -- 產出 analysis.md

1. `READ` `templates/analysis.md` 與 `templates/analysis.example.md`，載入骨架與範例，命名載入結果為「分析報告樣板組」。
2. `WRITE` 依「分析報告樣板組」、「問題清單」、「憲法遵循結果」與「涵蓋盤點」，將 `analysis.md` 寫入「目標 spec」所在目錄（已存在時直接覆寫），不建立或修改其他檔案：說明文字使用繁體中文；問題清單依嚴重度由高到低排列，最多 50 筆，超過的部分在表格下方依類別與嚴重度摘要筆數；「需求涵蓋」、「介面涵蓋」、「欄位涵蓋」與「統計」的需求、任務、介面與欄位數字取自「涵蓋盤點」，問題件數取自「問題清單」。
3. `CHECK` 比對 `analysis.md` 與「分析報告樣板組」的區塊結構，確認沒有殘留的 `{{`、「統計」的數字與「涵蓋盤點」、「問題清單」一致、步驟 2 的填寫要求均已滿足，且目標 spec 目錄只有 `analysis.md` 被建立或修改；未通過時修正 `analysis.md` 後重新驗證。
4. `WRITE` 向使用者回報 `analysis.md` 路徑、各嚴重度的問題數、CRITICAL 問題的 ID 與摘要，以及「下一步」，並說明本 Skill 沒有修改任何上游文件，要修正時依各問題的處理 Skill 執行。

完成條件：`analysis.md` 已寫入目標 spec 目錄且通過步驟 3 的檢查，其他檔案沒有被修改，且已回報。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| Rule 1 E 類「或需要建置的 SC 沒有任務」的寫法 | `rules/分析問題-格式規範.md` Rule 1 第 6 條 | R3（衝突）：和腳本把全部 SC 計入分母的做法互相矛盾。改寫為「SC 沒有任務；上線後指標的 SC 依 Rule 1 新條列處理」，判斷標準只留在 Rule 1 新條列，分母只由腳本依 `--exclude-sc` 計算 |
| 範例需求涵蓋 SC-001「量測目標，不需要建置任務」與它在統計的計法 | `templates/analysis.example.md` 第 2、6 節 | R3（衝突）：寫「不需要建置任務」卻算進分母，和規則矛盾。改為上線後指標、標「否」、不計入 |

沒有刪除整個部位檔案、Phase 或步驟。

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter `description` | 修改 | 比對範圍加入「資料模型受約束欄位的任務引用與矛盾，以及任務順序」；觸發關鍵字加入「欄位涵蓋」 | E1、E3、E5；概述範圍，不寫判斷細節 |
| P2-1（`DELEGATE` 執行 `collect_coverage.py`） | 修改 | 加入「「不計入的 SC」已建立且不為空時，加上 `--exclude-sc`」 | R3、E7；C7 |
| P2-4（`THINK` 建立「問題清單」） | 修改 | 加入「判斷 spec.md 的每個 SC 是否計入涵蓋率，建立「不計入的 SC」」 | R3、E7；C15 由 Rule 1 存放，步驟只產生結果 |
| P2-5（`CHECK` 驗證與 grep） | 修改 | grep 改為「依「問題檢查清單」」確認（`table.column` 的確認方式在 Rule 2）；加入「不計入的 SC」和使用的 `--exclude-sc` 不同時，重新執行步驟 1、2 | R1、R3、E2、E7、E11；C7、C11 |
| Phase 2 完成條件 | 修改 | 「「涵蓋盤點」已取得」改為「已依「不計入的 SC」取得「涵蓋盤點」」 | E7 |
| P3-2（`WRITE` 寫入） | 修改 | 數字來源加入「欄位涵蓋」，並分出問題件數取自「問題清單」 | R1、R4、E1、E8、E14；C22 |
| P3-3（`CHECK` 檢查） | 修改 | 「統計」的數字與「涵蓋盤點」、「問題清單」一致 | E8、E14；C23 |
| `rules/分析問題-格式規範.md` Rule 1 | 修改 | 改寫 E 類 SC 條列；新增 4 個條列（受約束欄位的 E 類、欄位限制矛盾的 F 類、不適用、任務順序的 F 類、SC 是否計入）；既有範例加 `### Example 1`，新增 Example 2、Example 3 | R1、R2、R3、E1～E5、E7；C12～C15 |
| `rules/分析問題-格式規範.md` Rule 2 | 修改 | 第 1 條加入 `table.column` 的搜尋方式；第 3 條加入任務順序矛盾的例外；既有範例加 `### Example 1`，新增 Example 2 | R1、R2、E2、E3、E5、E11；C16 |
| `rules/分析問題-格式規範.md` Rule 4 | 修改 | HIGH 加入欄位缺引用與找不到的引用、欄位限制矛盾、任務順序 (a)(b)、安全或效能描述沒有量化標準；MEDIUM 加入 `[P]` 依賴；既有範例加 `### Example 1`，新增 Example 2 | R1、R2、R4、E2、E3、E5、E6；C18 |
| `templates/analysis.md` | 修改 | 需求涵蓋加「計入涵蓋率」欄；新增第 4 節「欄位涵蓋」，後面各節編號加 1；統計新增 7 列 | R1、R3、R4、E1、E7、E8；C20 |
| `templates/analysis.example.md` | 修改 | 依新骨架改寫；新增 E2、F4、F5，B1 改為 HIGH；SC-001 改為上線後指標；統計重算 | R1～R4；C21 |
| `scripts/collect_coverage.py` | 修改 | 新增 DBML 欄位解析、受約束欄位與引用盤點（`field_coverage`）、`--exclude-sc` 與分母計算 | R1、R3、E1、E2、E7、E9、E14；C9、C10 |
| `analyze/LICENSE` | 修改 | 第 1 點之後加入第 2 點，註明 Spec Kit v1.4.2 的衍生 | CLAUDE.md 規則 3；計畫第 6 節批 2 |

選新增條列而不是新 Rule 或新 RuleFile 的理由（重新設計 Rule 4）：
1. 刪除：沒有表達欄位涵蓋、任務順序或安全效能 HIGH 的既有內容可刪。SC 的既有寫法互相矛盾，已列為刪除後改寫。
2. 改寫：Rule 1 E 類 SC 條列改寫（R3）；Rule 2 第 1、3 條改寫加入例外。其他預期沒有可改寫的既有文字。
3. 改換存放位置：分母原本由腳本計算，維持在腳本，只加入排除參數；判斷標準需要語意判斷，放 RuleFile。
4. 新增：條列加在既有 Rule 1、2、4，不新增 Rule 或 RuleFile。類別歸屬在 Rule 1，位置寫法在 Rule 2，嚴重度在 Rule 4，和既有主題一致。

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| `name` | 必要（Skill 識別） | 無 |
| 三個 Phase；Phase 1、Phase 3 完成條件 | Phase 1：E10；Phase 3：E10、E14、E15 | 無（只概述結果） |
| P1-1～P1-6 | E10、E12 | C1～C5 |
| P2-2（腳本退出狀態） | E14 | C6 |
| P2-3（載入問題檢查清單） | E1～E8、E11～E13 | 無（只載入） |
| P3-1（載入樣板組） | E14 | 無（只載入） |
| P3-4（回報） | E15 | C24 |
| Rule 1 其餘既有條列（A～D、F 既有內容、ID 規則） | E11 | C12 |
| Rule 2 第 2、4 條 | E11 | C16 |
| Rule 3 | E12 | C17 |
| Rule 4 既有條列 | E13 | C18 |
| Rule 5 | E11、E15 | C19 |
| `collect_coverage.py` 既有輸出（requirements、user_stories、tasks、interfaces、unmapped_tasks、pending_notes、placeholders、undefined_requirement_refs） | E14 | C8 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 3 | 0 |
| 步驟 | 15 | 15 | 0 |
| RuleFile | 1 | 1 | 0 |
| Rule | 5 | 5 | 0 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 1 | 1 | 0 |

- 內容增減：Rule 1 改寫 1 個條列、新增 5 個條列與 2 組範例；Rule 2 改寫 2 個條列、新增 1 組範例；Rule 4 擴充 HIGH、MEDIUM 兩條並新增 1 組範例；P2-1、P2-4、P2-5、P3-2、P3-3 與 Phase 2 完成條件各加一段；樣板新增 1 節、1 欄、7 列統計；腳本新增 1 個命令列參數、1 個輸出鍵與 5 個統計數字。
- SC 分母重新取得盤點用 P2-5 的返回處理，不新增步驟。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | 目標 spec 的決定方式 | P1-2 | P1-2 步驟內文 | 既有，不變；單一步驟一句話 |
| C2 | 沒有 spec 或有多份未指定時停止 | P1-3 | SOP 流程 | 既有，不變；分支 |
| C3 | 缺少 `plan.md` 或 `tasks.md` 時停止，不建立檔案 | P1-4 | SOP 流程 | 既有，不變；分支 |
| C4 | 讀取的輸入清單 | P1-5 | P1-5 步驟內文 | 既有，不變；單一步驟一句話 |
| C5 | 憲法檔列出方式與鎖定項目 | P1-6 | P1-6 步驟內文 | 既有，不變；單一步驟 |
| C6 | 腳本的執行、`uv` 安裝與失敗處理 | P2-1、P2-2 | SOP 流程 | 既有，不變；委派與分支 |
| C7 | 有「不計入的 SC」時以 `--exclude-sc` 執行；和使用的排除清單不同時重新取得盤點 | P2-1、P2-5 | SOP 流程 | 屬於執行順序與返回（約束分配 Rule 2 第 1 條） |
| C8 | 需求、任務、介面、未對應任務、待確認、佔位符號、未定義需求引用的盤點與統計 | P2-1 | `scripts/collect_coverage.py` | 既有，不變；可由程式判斷 |
| C9 | 解析 `data/` 下 `.dbml` 的資料表、欄位與 note；依「驗證」「轉換」「跨欄位」列出受約束欄位；列出每個欄位在 Must Read 與 Optional 引用它的任務；列出找不到的 `table.column` 引用與原因；只用標準函式庫，不呼叫其他 Skill 的腳本 | P2-1 | `scripts/collect_coverage.py` | 輸入輸出明確、可重複執行、結果可由程式判斷（順序 1）。哪個引用任務是測試任務需要語意判斷，不在腳本 |
| C10 | `--exclude-sc` 的 SC 標為不計入；需求總數、不計入數、計入數、有任務的計入需求數與涵蓋率依此計算；參數含 spec 沒有的編號或不是 SC 時退出狀態 2 | P2-1 | `scripts/collect_coverage.py` | 計算可由程式判斷（順序 1）；哪些 SC 不計入需要判斷，由 C15 決定 |
| C11 | 以 `grep -n` 確認位置的識別字 | P2-5 | P2-5 步驟內文 | 既有；搜尋方式的例外存放在 C16，步驟只引用檢查清單 |
| C12 | 六個類別的定義、同一問題不拆不重複、ID 規則 | P2-4 | Rule 1 | 既有，不變；需要判斷與正反例 |
| C13 | 受約束欄位的界定；沒有實作任務引用（只有測試任務、只引用 `Table`、只寫欄位名稱、只在 Optional 都不算）與找不到的 `table.column` 引用各列一筆 E 類，不猜成別的欄位；任務描述的欄位限制與資料模型矛盾列 F 類，只有引用、一致的重述、不矛盾的「任務限定：」不列；沒有資料模型或受約束欄位時「欄位涵蓋」寫不適用、不列這些 E 類 | P2-4 | Rule 1 | 是否為實作任務、是否矛盾要判斷語意，腳本只能列出引用；需要正反例 |
| C14 | 任務順序矛盾 (a)(b)(c) 歸 F 類 | P2-4 | Rule 1 | 任務間的依賴要讀任務內容判斷，腳本無法判斷；需要正反例 |
| C15 | SC 是否計入的判斷標準：只能在上線後以實際使用資料量測的不計入，也不列 E 類；其他 SC 計入，沒有任務時列 E 類 | P2-4 | Rule 1 | 需要語意判斷；需要正反例。和 E 類同主題，改寫既有條列 |
| C16 | 位置寫法：可 `grep -n` 的識別字，`table.column` 以資料表名稱與欄位名稱各自可搜尋確認；F 類至少兩個文件，任務順序矛盾可列同一份 `tasks.md` 的兩個任務 ID；不得只指 Notes | P2-4、P2-5 | Rule 2 | 需要判斷；需要正反例 |
| C17 | 憲法逐檔逐 Rule 對照、結果種類、鎖定項目 | P2-4 | Rule 3 | 既有，不變 |
| C18 | 嚴重度四級與各級情況（新增：欄位缺引用、找不到的引用、欄位限制矛盾、任務順序 (a)(b)、安全或效能描述沒有量化標準為 HIGH；`[P]` 依賴為 MEDIUM），取最高 | P2-4 | Rule 4 | 需要判斷；需要正反例 |
| C19 | 建議、處理 Skill、下一步 | P2-4 | Rule 5 | 既有，不變 |
| C20 | `analysis.md` 的區塊結構與表頭：需求涵蓋的「計入涵蓋率」欄、「欄位涵蓋」節、統計各列 | P3-2 | 分析報告樣板組 | 約束整份產出的結構（順序 2）；腳本無法產生內容 |
| C21 | 範例示範 C12～C19 | P3-2 | 樣板組的範例 | 範例不是存放位置，只示範，不得和 C12～C19 矛盾 |
| C22 | 寫入位置、覆寫、語言、排序、50 筆、數字來源 | P3-2 | P3-2 步驟內文 | 既有；數字來源加入「欄位涵蓋」與問題件數，單一步驟 |
| C23 | 結構、`{{`、統計一致、只改 `analysis.md` | P3-3 | P3-3 步驟內文 | 既有；單一步驟 |
| C24 | 回報內容 | P3-4 | P3-4 步驟內文 | 既有，不變 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `analyze/SKILL.md` frontmatter | 比對範圍與觸發關鍵字 | 無 | 已完成 |
| 2 | W2 | `skill-form-sop` | Phase 2 -- 偵測問題的 `DELEGATE` 執行腳本、`THINK` 建立問題清單、`CHECK` 逐條驗證步驟與完成條件；Phase 3 -- 產出 analysis.md 的 `WRITE` 寫入、`CHECK` 結構檢查步驟 | 依第 2 節修改 | C7、C11、C22、C23 | 已完成 |
| 3 | W3 | `skill-form-rule` | `rules/分析問題-格式規範.md` Rule 1 | 改寫 1 條、新增 5 條與 Example 2、3 | C12～C15 | 已完成 |
| 4 | W4 | `skill-form-rule` | `rules/分析問題-格式規範.md` Rule 2 | 改寫第 1、3 條與 Example 2 | C16 | 已完成 |
| 5 | W5 | `skill-form-rule` | `rules/分析問題-格式規範.md` Rule 4 | 擴充 HIGH、MEDIUM 與 Example 2 | C18 | 已完成 |
| 6 | W6 | `skill-form-template` | `templates/analysis.md`、`templates/analysis.example.md` | 新欄、新節、統計列；範例改寫 | C20、C21 | 已完成 |
| 7 | W7 | `skill-form-script` | `scripts/collect_coverage.py` | 欄位盤點與 `--exclude-sc` | C9、C10 | 已完成 |
| 8 | W8 | `skill-engineering` 直接修改 | `analyze/LICENSE` | 註明 v1.4.2 衍生 | 無 | 已完成 |

沒有新增部位，也沒有改變載入步驟：P2-1 的腳本命令只加條件參數，P2-3 整份載入 RuleFile，P3-1 載入樣板組，因此 W3～W7 交給 `skill-form-*`。根目錄 `LICENSE` 的 `analyze` 那一列已寫「含 spec-kit」，不需修改。

### 工作項內容

#### W1：frontmatter

- `description` 的「（包括 API 合約、資料模型與 UI 規劃之間的命名與行為差異）」改為「（包括 API 合約、資料模型與 UI 規劃之間的命名與行為差異、資料模型受約束欄位的任務引用與矛盾，以及任務順序）」。
- 觸發關鍵字「跨文件檢查」之後加入「欄位涵蓋」。
- 其餘文字與分流保留原文。全文見第 2 節。

#### W2：SOP

1. Phase 2 的 `DELEGATE` 執行 `collect_coverage.py` 步驟：命令之後加入「（「不計入的 SC」已建立且不為空時，加上 `--exclude-sc <以逗號分隔的 SC 編號>`）」。
2. Phase 2 的 `THINK` 建立「問題清單」步驟：「建立「問題清單」；」之後加入「判斷 spec.md 的每個 SC 是否計入涵蓋率，建立「不計入的 SC」；」。
3. Phase 2 的 `CHECK` 逐條驗證步驟：「並以 `grep -n` 確認」改為「並以 `grep -n` 依「問題檢查清單」確認」；結尾加入「「不計入的 SC」和取得「涵蓋盤點」時使用的 `--exclude-sc` 不同時，重新執行步驟 1、2 取得「涵蓋盤點」，再驗證本步驟。」
4. Phase 2 完成條件：「「涵蓋盤點」已取得」改為「已依「不計入的 SC」取得「涵蓋盤點」」。
5. Phase 3 的 `WRITE` 寫入步驟：「「需求涵蓋」、「介面涵蓋」與「統計」的數字取自「涵蓋盤點」」改為「「需求涵蓋」、「介面涵蓋」、「欄位涵蓋」與「統計」的需求、任務、介面與欄位數字取自「涵蓋盤點」，問題件數取自「問題清單」」。
6. Phase 3 的 `CHECK` 結構檢查步驟：「「統計」的數字與「涵蓋盤點」一致」改為「「統計」的數字與「涵蓋盤點」、「問題清單」一致」。

其餘步驟與完成條件保留原文。修改後全文見第 2 節。

#### W3：Rule 1

1. 第 6 條（E 涵蓋）改寫為：「E 涵蓋：需求沒有任務、介面沒有 Planner 或 `notification-plan` 產出或沒有任務、SC 沒有任務（不計入涵蓋率的 SC 除外），或受約束欄位沒有引用。」
2. 在 F 類條列之後、ID 條列之前加入 5 個條列：
   - 受約束欄位指 `data/` 下 `.dbml` 檔中欄位 `note` 以「驗證：」或「轉換：」開頭的欄位，以及資料表 `Note` 的「跨欄位：」括號內列出的每個 `table.column`。每個受約束欄位沒有任何實作任務（建立該欄位、寫入或檢查該欄位值的非測試任務）在 Must Read 以 `table.column` 引用時，必須列一筆 E 類問題；只有測試任務引用、只在 Optional 引用、只引用 `Table <table>`、只在任務描述寫欄位名稱都不算引用。任務引用的 `table.column` 在資料模型找不到時，必須列一筆 E 類問題，寫出任務 ID 與該引用，不得猜成別的欄位，也不得算成另一個欄位的引用。
   - 任務描述寫出的欄位限制（長度、數值範圍、格式、可否為空、Enum 值、狀態轉換、跨欄位規則）和資料模型矛盾時，即使該任務已引用該欄位，也必須列一筆 F 類問題，摘要寫出資料模型與任務兩邊的限制。只有引用、和資料模型一致的重述，以及不矛盾的「任務限定：」不得列為問題。
   - 沒有 `data/` 下的 `.dbml` 檔，或資料模型沒有受約束欄位時，「欄位涵蓋」只寫一列 `| — | — | — | — | 不適用：<原因> |`，不得列出受約束欄位相關的 E 類問題，也不得虛構欄位。
   - 任務順序矛盾必須列為 F 類：任務用到後面任務才建立的檔案、資料表、函式或設定，且沒有寫出依賴；任務改變既有行為，更新相依既有測試的任務卻排在後面的 Phase；標 `[P]` 的任務依賴同 Phase 其他任務的結果。
   - spec.md 的每個 SC 必須判斷是否計入涵蓋率：只能在上線後以實際使用資料量測的 SC（例如業務 KPI、客訴量、留存率）不計入，沒有任務時也不得列為 E 類；可以在上線前以測試或量測驗證的 SC 必須計入，沒有任務時列為 E 類。
3. 既有 Good Example、Bad Example 加上 `### Example 1` 小標，內容保留原文。新增：

Good Example 2（購物車情境）：資料模型的 `cart_items.quantity` 有「驗證：大於 0」，`orders.order_no` 有「驗證：只含英文字母與數字」。T006 描述寫「`quantity` 可以調整為 0 並保留這一列」，和「大於 0」矛盾，雖然 T006 已引用 `cart_items.quantity` 仍列 F；`orders.order_no` 只有 Polish 的測試任務 T013 引用，列 E；T009 引用了不存在的 `orders.order_number`，另列一筆 E。

| ID | 類別 | 摘要 |
| --- | --- | --- |
| E2 | 涵蓋 | 受約束欄位 `orders.order_no` 只有測試任務 T013 引用，沒有實作任務引用 |
| E3 | 涵蓋 | T009 引用的 `orders.order_number` 在資料模型找不到 |
| F4 | 不一致 | T006 寫 `quantity` 可以調整為 0；`cart_items.quantity` 的「驗證」為大於 0 |

Bad Example 2（同一情境）：T006 已引用 `cart_items.quantity` 就不比對描述；把 `orders.order_number` 當成 `orders.order_no` 的引用，認定已涵蓋；T013 只是測試任務，也算成實作任務。

| ID | 類別 | 摘要 |
| --- | --- | --- |
| — | — | 沒有發現問題 |

Good Example 3（同一情境）：T005 在 `cartService.js` 呼叫 `cartRepository.findByVariant()`，這個函式由 T007 才建立，T005 沒有寫依賴，列 F；SC-001「上線後一季內，結帳完成率提升 10%」只能用上線後的實際使用資料量測，不計入涵蓋率，沒有任務也不列 E；SC-002「100 位測試使用者中 95% 能在 3 分鐘內完成結帳」可以在上線前量測，計入。

| ID | 類別 | 摘要 |
| --- | --- | --- |
| F5 | 不一致 | T005 用到 T007 才建立的 `cartRepository.findByVariant()`，沒有寫依賴 |

Bad Example 3（同一情境）：順序矛盾只在同一份 `tasks.md`，就不列問題；SC-001 沒有任務列為 E 類並算進分母；SC-002 因為需要使用者參與而不計入。

| ID | 類別 | 摘要 |
| --- | --- | --- |
| E2 | 涵蓋 | SC-001 沒有任何任務 |

#### W4：Rule 2

1. 第 1 條改為：「每個位置必須寫成 `` `檔案` → 識別字 ``，識別字必須能用 `grep -n` 在該檔案找到；`data/` 下 `.dbml` 檔的單一欄位寫成 `table.column`，資料表名稱與欄位名稱必須各自能用 `grep -n` 在該檔案找到。」
2. 第 3 條改為：「F 類問題的位置必須至少列出兩個不同的文件；任務順序矛盾的位置改為列出 `tasks.md` 中的兩個任務 ID，例如 `` `tasks.md` → T005、T007 ``。」
3. 第 2、4 條保留原文。既有 Good Example、Bad Example 加上 `### Example 1` 小標，內容保留原文。新增：

Good Example 2（同 Rule 1 Example 2、3 的情境）：欄位問題列出任務與資料模型兩個文件；順序矛盾只列 `tasks.md` 的兩個任務 ID。

| 位置 | 摘要 |
| --- | --- |
| `tasks.md` → T006；`data/data-model.dbml` → `cart_items.quantity` | T006 寫 `quantity` 可以調整為 0；資料模型的「驗證」為大於 0 |
| `tasks.md` → T005、T007 | T005 用到 T007 才建立的 `cartRepository.findByVariant()` |

Bad Example 2（同一情境）：欄位問題只寫資料表，看不出是哪個欄位；順序矛盾沒有任務 ID。

| 位置 | 摘要 |
| --- | --- |
| `data/data-model.dbml` → `Table cart_items` | 數量限制不一致 |
| `tasks.md` | 任務順序有問題 |

#### W5：Rule 4

1. HIGH 條列改為：「HIGH：上游文件互相矛盾且會讓實作做出不同行為、需求互相衝突、驗收標準無法測試、安全或效能描述沒有量化標準（例如「一般網路條件下」「安全地儲存」）、受約束欄位沒有實作任務引用、任務引用的 `table.column` 找不到、任務描述的欄位限制和資料模型矛盾，或任務用到後面任務才建立的內容、更新相依既有測試的任務排在後面的 Phase。」
2. MEDIUM 條列結尾加入「、標 `[P]` 的任務依賴同 Phase 其他任務的結果」。
3. 其餘條列保留原文。既有 Good Example、Bad Example 加上 `### Example 1` 小標，內容保留原文。新增：

Good Example 2（購物車情境）：NFR-002「結帳頁在一般網路條件下 2 秒內顯示」的「一般網路條件下」是效能描述，沒有量化標準，列 HIGH；「說明文字自然易讀」不是安全或效能描述，列 LOW；T008、T011 都標 `[P]`，但 T011 要用 T008 的 `CartSummary` 元件，列 MEDIUM。

| ID | 嚴重度 | 摘要 |
| --- | --- | --- |
| B1 | HIGH | NFR-002 的「一般網路條件下」沒有量化標準 |
| B2 | LOW | 「說明文字自然易讀」沒有量化標準 |
| F6 | MEDIUM | T008、T011 都標 `[P]`，T011 要用 T008 的 `CartSummary` |

Bad Example 2（同一情境）：效能描述模糊被當成文字問題列 LOW；`[P]` 標錯被列 HIGH。

| ID | 嚴重度 | 摘要 |
| --- | --- | --- |
| B1 | LOW | NFR-002 的「一般網路條件下」沒有量化標準 |
| F6 | HIGH | T008、T011 都標 `[P]`，T011 要用 T008 的 `CartSummary` |

#### W6：樣板組

`templates/analysis.md`（骨架）：

| 位置 | 修改後 |
| ---- | ------ |
| 第 2 節表頭 | `\| 需求編號 \| 計入涵蓋率 \| 有任務 \| 任務 ID \| 備註 \|` 與對應分隔列 |
| 第 3 節之後 | 新增 `## 4. 欄位涵蓋`，表頭 `\| 欄位 \| 資料模型位置 \| 規則 \| 實作任務 \| 備註 \|`、分隔列與 `{{FIELD_ROWS}}` |
| 原第 4～7 節 | 編號改為 5～8，標題不變 |
| 統計（新第 7 節） | 在「需求總數」之後加入「不計入涵蓋率的 SC \| {{EXCLUDED_SC}}」「計入涵蓋率的需求數 \| {{COUNTED_REQUIREMENTS}}」；在「沒有任務的介面數」之後加入「受約束欄位數 \| {{CONSTRAINED_FIELDS}}」「沒有 Must Read 引用的受約束欄位數 \| {{FIELDS_WITHOUT_MUST_READ}}」「找不到的欄位引用數 \| {{UNRESOLVED_FIELD_CITATIONS}}」「問題數（依類別） \| {{ISSUES_BY_CATEGORY}}」「問題數（依嚴重度） \| {{ISSUES_BY_SEVERITY}}」 |

`templates/analysis.example.md`（範例，情境不變：`specs/004-shopping-cart-checkout/`）：

| 位置 | 修改後 |
| ---- | ------ |
| 問題清單 | 依嚴重度由高到低排列：D1（CRITICAL，不變）；F1（HIGH，不變）；B1 改為 HIGH，摘要改為「「盡快提示庫存不足」是效能描述，沒有量化標準」，建議與處理 Skill 不變；新增 E2（涵蓋，HIGH，位置 `` `data/data-model.dbml` → `orders.order_no` ``，摘要「受約束欄位 `orders.order_no` 的「驗證」（只含英文字母與數字）沒有任何實作任務在 Must Read 引用」，建議「在 `tasks.md` 產生訂單編號的 T009 的 Must Read 加入 `` `data/data-model.dbml` → `orders.order_no` ``」，處理 Skill `tasks`）；新增 F4（不一致，HIGH，位置 `` `tasks.md` → T006；`data/data-model.dbml` → `cart_items.quantity` ``，摘要「T006 寫 `quantity` 可以調整為 0 並保留這一列；`cart_items.quantity` 的「驗證」為大於 0」，建議「以資料模型為準，改 T006：數量調整為 0 時刪除這一列」，處理 Skill `tasks`）；新增 F5（不一致，HIGH，位置 `` `tasks.md` → T005、T007 ``，摘要「T005 呼叫 T007 才建立的 `cartRepository.findByVariant()`，沒有寫依賴」，建議「把建立 `cartRepository.findByVariant()` 移到 T005 之前，或在 T005 寫出依賴 T007」，處理 Skill `tasks`）；D2、E1、F2、F3（MEDIUM，不變）。「超過 50 筆的部分」改為共 10 筆 |
| 需求涵蓋 | 每列加「計入涵蓋率」欄：FR-001～FR-006、NFR-001 為「是」；SC-001 改為「否」，備註改為「上線後指標（上線後一季的結帳完成率），不計入涵蓋率」 |
| 欄位涵蓋（新） | 3 列：`cart_items.quantity` \| `data/data-model.dbml:64` \| 驗證 \| T003、T006 \| 見 F4；`orders.order_no` \| `data/data-model.dbml:77` \| 驗證 \| — \| 見 E2；`orders.status` \| `data/data-model.dbml:79` \| 轉換 \| T003、T010 \| （空白） |
| 憲法遵循、沒有對應需求的任務 | 節號改為 5、6，內容不變 |
| 統計（第 7 節） | 需求總數 8；不計入涵蓋率的 SC「1（SC-001）」；計入涵蓋率的需求數 7；有任務的需求數 6；涵蓋率 85.7%；任務總數 12；介面總數 5；沒有 Planner 產出的介面數 0；沒有任務的介面數 0；受約束欄位數 3；沒有 Must Read 引用的受約束欄位數 1；找不到的欄位引用數 0；問題數（依類別）「A 0、B 1、C 0、D 2、E 2、F 5」；問題數（依嚴重度）「CRITICAL 1、HIGH 5、MEDIUM 4、LOW 0」 |
| 下一步（第 8 節） | 第 1、2 點不變；第 3 點改為「HIGH 的 B1、E2、F4、F5 建議在 `implement` 前處理：B1 用 `clarify-over-specs`，E2、F4、F5 用 `tasks`」；新增第 4 點「D2、E1、F2、F3 可以一併處理」 |

範例中的 `table.column` 與行號依 `data-plan` 範例 `templates/data-model.example.dbml` 的實際位置；施工時若行號不同，以該檔實際行號為準。

#### W7：`scripts/collect_coverage.py`

保留既有命令列介面、退出碼與既有輸出鍵，只用標準函式庫，不讀取或呼叫 `data-plan`、`tasks` 的腳本。新增：

1. 命令列參數 `--exclude-sc`：以逗號分隔的 SC 編號。每個編號必須是 spec.md 定義的 SC；有不存在或不是 SC 的編號時，在標準錯誤輸出原因並以退出狀態 2 結束。
2. `requirements` 每一項新增 `counted`（布林）：在 `--exclude-sc` 中為 `false`，其餘為 `true`。
3. `metrics` 調整與新增：`requirements_total`（spec 定義的全部需求，含義不變）、`requirements_excluded`（不計入數）、`requirements_counted`（計入數）、`requirements_with_tasks`（改為只算計入的需求中有任務的數量）、`coverage_rate`（`requirements_with_tasks / requirements_counted`，計入數為 0 時為 0.0）。
4. 解析 `data/` 下每個 `.dbml` 檔（不呼叫外部工具）：
   - `Table <name> … {` 區塊，名稱去掉引號，支援 `schema.table` 與 `as` 別名（以表名為準）；略過 `indexes { … }` 子區塊；字串內的大括號不影響區塊判斷。
   - 欄位行：欄位名稱、行號，以及 `[...]` 設定中的 `note: '…'`（支援 `\'` 跳脫與三引號字串）。
   - 資料表 `Note: '…'` 與 `Note { '''…''' }` 兩種寫法。
5. 受約束欄位：欄位 `note` 去掉開頭空白後以「驗證：」或「轉換：」開頭（記為 `驗證`、`轉換`），以及資料表 `Note` 中每段「跨欄位：…（…；…）」括號內、第一個分號前以頓號或逗號分隔的 `table.column`（記為 `跨欄位`）。同一欄位有多種時合併。
6. 解析 `tasks.md` 每個任務的 `**Must Read**` 與 `**Optional**` 參考行（`` - `檔案` → 部位 — Why：… ``）。參考的檔案以 `.dbml` 結尾時，部位中每個反引號內符合 `<識別字>.<識別字>`、且不以 `Ref` 開頭的字串視為欄位引用：資料表與欄位都存在時記為引用；不存在時記為找不到的引用，原因為「沒有資料表 `a`」或「資料表 `a` 沒有欄位 `b`」。
7. 新增輸出鍵 `field_coverage`：
   ```json
   {
     "data_models": ["data/data-model.dbml"],
     "constrained": [
       {"field": "orders.status", "file": "data/data-model.dbml", "line": 79, "kinds": ["轉換"],
        "must_read_tasks": ["T003", "T010"], "optional_tasks": []}
     ],
     "unresolved": [{"task": "T009", "file": "data/data-model.dbml", "field": "orders.order_number", "reason": "資料表 `orders` 沒有欄位 `order_number`"}]
   }
   ```
   沒有 `.dbml` 檔時 `data_models` 與 `constrained` 為空陣列，`unresolved` 仍記錄指向不存在檔案以外的引用（檔案不存在時不檢查）。
8. `metrics` 新增 `constrained_fields`、`constrained_fields_without_must_read`、`unresolved_field_citations`。
9. 檔頭說明與 `--help` 補上新參數、新輸出鍵與受約束欄位的界定。

自測（skill-form-script 驗證時，暫存目錄）：
- 以 `data-plan` 範例 `templates/data-model.example.dbml` 搭配 `tasks` 範例 `templates/tasks.example.md`，加上能讓腳本執行的最小 `spec.md`、`plan.md`，確認 `constrained` 為 6 個、`constrained_fields_without_must_read` 為 0、`unresolved` 為空。
- 刪掉一個受約束欄位的 Must Read 引用、寫入一個不存在的 `table.column`、只在 Optional 引用另一個受約束欄位：確認三者分別反映在 `must_read_tasks` 為空、`unresolved`、`optional_tasks`。
- 多行 `Note { ''' … ''' }`、帶引號的資料表名稱、字串內的大括號、`\'` 跳脫都能解析。
- `--exclude-sc SC-001`：該項 `counted` 為 `false`，`requirements_counted` 少 1，`coverage_rate` 依計入數計算；`--exclude-sc SC-999`、`--exclude-sc FR-001` 退出狀態 2。
- 既有 8 個 spec 目錄（舊寫法資料模型）：不帶 `--exclude-sc` 時，新舊腳本的既有輸出鍵內容相同（`requirements` 多出 `counted`、`metrics` 多出新鍵除外），`field_coverage.constrained` 為空。

#### W8：LICENSE

`analyze/LICENSE` 第 1 點之後加入第 2 點：

```text
2. GitHub Spec Kit v1.4.2（tag `v1.4.2`，commit `1e421b5`）`templates/commands/analyze.md` 第 105-106、116、119-120、
   152-155、161、163-164、171、192-197 行：受約束欄位盤點與引用對照、缺引用與找不到的引用列為涵蓋問題、
   任務限制和資料模型矛盾列為不一致、任務順序矛盾、安全或效能描述模糊與欄位問題列 HIGH、
   上線後指標不計入 SC 分母、Constrained-Field Coverage 表。本 Skill 改寫為 `data/data-model.dbml` 的
   `table.column`，受約束欄位以 data-plan 的「驗證」「轉換」「跨欄位」界定；RuleFile 條列、樣板組、範例與
   `scripts/collect_coverage.py` 的盤點為重新撰寫，未直接複製上游檔案。
```

## 7. 驗收情境

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1～E3、E5、E7～E11、E13～E15 | 本次 | 暫存複本的 `specs/008-overdue-discord-notification/`：先以改版後的 `data-plan`、`tasks` 重跑資料模型與任務清單（準備環境，不屬驗收），再注入 5 處缺陷：(1) 刪掉 `overdue_notifications.sent_at` 的所有引用；(2) 把一個引用改成 `overdue_notifications.discord_msg_id`；(3) 在一個寫入 `auto_retry_count` 的任務描述加「`auto_retry_count` 最多 5」；(4) 把建立 `overdue_notifications` 的任務移到第一個使用它的任務之後；(5) 在 `spec.md` 加 SC-008「上線後 3 個月內，管理員手動追討逾期設備的次數減少 50%」。接著執行 `analyze` | 無確認閘門 | (a) 準備環境後，「欄位涵蓋」列數等於 `check_data_model.py` 的 `constrained_fields` 加上跨欄位規則點名的欄位數（等於 `check_tasks.py` 的受約束欄位數）；(b) (1)(2) 各一筆 E 類 HIGH，(3) 一筆 F 類 HIGH 並寫出「0 到 3」與「最多 5」，(4) 一筆 F 類 HIGH；(c) SC-008 標為不計入，需求總數與涵蓋率不含它，SC-001～SC-007 都計入；(d) 「統計」有各類別與各嚴重度件數，且和問題清單一致；(e) 只有 `analysis.md` 改變 |
| S2 | E1、E7～E15 | 本次（換情境，計畫批 2 第 5 點） | 暫存複本的 `specs/006-reservation-reschedule/`：依序執行 `data-plan`、`tasks`、`analyze`，不注入缺陷 | `data-plan`、`tasks` 的覆寫詢問回覆「同意覆寫」 | (a) 「欄位涵蓋」列數等於 `check_data_model.py` 的 `constrained_fields` 加上跨欄位規則點名的欄位數（等於 `check_tasks.py` 的受約束欄位數），`check_tasks.py` 的 `uncited` 為空時沒有欄位缺引用的問題；(b) SC-001～SC-006 都計入，需求總數與重跑前的 `analysis.md` 相同；(c) 列出和重跑前 `analysis.md` 的問題差異；(d) `tasks_state.py status` 的 `format_issues` 為空；(e) 只有 `data/data-model.dbml`、`tasks.md`、`analysis.md` 改變 |
| S3 | E4～E6、E8、E10～E15 | 本次（原始輸入）＋回歸 | 暫存複本的 `specs/007-equipment-maintenance-retire/` 原樣（舊寫法資料模型、迭代 5 的 `tasks.md`），只執行 `analyze` | 無確認閘門 | (a) 「欄位涵蓋」寫「不適用」，沒有欄位缺引用的問題；(b) T008（Foundational）把 `isActive` 換成 `status`、T043（Polish）才修既有測試，列一筆 F 類 HIGH；(c) NFR-002「一般單機與區域網路環境」列 B 類 HIGH；(d) 重跑前 `analysis.md` 中屬於本次修改範圍的問題（任務順序 E5、欄位涵蓋 E1～E4、SC 分母 E7、安全或效能描述 E6）沒有消失；範圍外的漏列記入驗收結果，交給 R5 那一輪（`docs/待確認.md` 第 38 項），不判定失敗（2026-11-19 依第 2 次根因報告改寫，原文為「重跑前 `analysis.md` 的 D、F 類問題仍列出或寫明消失原因」）；(e) 只有 `analysis.md` 改變 |
| S4 | E10 | 回歸 | 暫存複本的 `specs/008-overdue-discord-notification/` 刪掉 `tasks.md` 後執行 `analyze` | 無確認閘門 | 回報需要先執行 `tasks` 並停止；`git status` 只有刪除的 `tasks.md`，沒有新檔案 |

直接呼叫者：無（沒有 Skill 委派 `analyze`），不需呼叫者回歸情境。`analysis.md` 的讀者是使用者（runbook 步驟 7）。

## 8. 驗收結果

- 施工：W1～W8 依第 6 節順序完成，被委派的 Skill 沒有回報與藍圖不一致。W6 範例行號 64、77、79 與 `data-plan` 範例 `data-model.example.dbml` 實際行號相同。
- 施工後結構診斷：`analyze` 0 個 error、0 個 warning。
- 同步：`./scripts/sync-skills.sh --from claude` 與 `--check` 退出狀態都是 0，結果為「兩邊一致」；同步輸出沒有只存在於目標端的 Skill。
- To-Be 一致性：施工後 `SKILL.md` 與第 2 節 To-Be 全文逐字相同。
- E9：`collect_coverage.py` 只 import 標準函式庫，沒有讀取或呼叫 `data-plan`、`tasks` 的腳本。
- 腳本自測（skill-form-script Phase 2，暫存目錄）：
  - `data-plan` 範例搭配 `tasks` 範例：`constrained` 6 個，`constrained_fields_without_must_read` 0，`unresolved` 為空。
  - 刪掉 `orders.status` 的 Must Read 引用、寫入 `orders.order_number` 與 `refunds.id`、`cart_items.quantity` 只在 Optional 引用：分別反映在 `must_read_tasks` 為空、`unresolved` 兩筆（原因各為「資料表 `orders` 沒有欄位 `order_number`」「沒有資料表 `refunds`」）、`optional_tasks`。
  - 多行 `Note { ''' … ''' }`、帶引號與 `as` 別名的資料表名稱、`schema.table`、字串內的大括號、`\'` 跳脫、`indexes` 子區塊的 note 都能正確解析；指向不存在 `.dbml` 檔的引用不檢查。
  - `--exclude-sc SC-001`：該項 `counted` 為 `false`，`requirements_counted` 少 1，`coverage_rate` 依計入數計算；`--exclude-sc SC-999`、`FR-001` 退出狀態 2。
  - 既有 spec 目錄：001（兩個）、003～008 不帶 `--exclude-sc` 時，新舊腳本的既有輸出鍵完全相同，`field_coverage.constrained` 都為空；002 新舊腳本都因缺少 `tasks.md` 退出狀態 2。
- 驗收方式：每個情境各在含本次未提交修改的暫存專案複本（排除 `.git`、`node_modules`，`git init` 建立基準 commit）中，由不帶本次分析脈絡的 `skill-tester` 子代理執行；Agent 工具指定 model `sonnet`、effort `medium`。S2、S3、S4 平行執行；S1 的準備步驟由另一個 `sonnet`／`medium` 子代理以 `data-plan`、`tasks` 重跑 008，主 session 注入 5 處缺陷並建立新的基準 commit 後，才執行 S1。
- 測試環境限制：S1 與 S3 重跑時，子代理以 Write 寫入 `analysis.md` 被平台拒絕（「Subagents should return findings as text, not write report files」），子代理改以文字回報全文。S2、S3 第一次執行沒有遇到這個限制。被拒的情境以回報全文判斷內容，以 `git status` 為空判斷沒有修改其他檔案。
- S1 通過：
  - (a) 「欄位涵蓋」5 列。`check_data_model.py` 的 `constrained_fields` 只列「驗證」「轉換」的 2 個欄位，另以 `cross_field_rules` 計 2 條跨欄位規則；依第 1 節的定義加上跨欄位點名的 `sent_at`、`discord_message_id`、`failure_reason` 共 5 個，與 `check_tasks.py` 的受約束欄位數相同。
  - (b) (1) E2 HIGH：`sent_at` 沒有實作任務引用；(2) E1 HIGH：T015 引用的 `overdue_notifications.discord_msg_id` 找不到，沒有算成 `discord_message_id` 的引用；(3) F1 HIGH：摘要寫出「最多 5」與「0 到 3」；(4) F2 HIGH：位置 `tasks.md` → T004、T003。
  - (c) SC-008 標「否」，需求總數 32、計入 31、涵蓋率 100%，SC-001～SC-007 都計入；子代理依 P2-5 帶 `--exclude-sc SC-008` 重新取得盤點。
  - (d) 統計有各類別與各嚴重度件數，與問題清單一致。
  - (e) `git status` 為空（寫入被平台拒絕，見上）。
- S2 通過：
  - (a) 「欄位涵蓋」9 列，等於 `check_tasks.py` 的受約束欄位 9 個（`check_data_model.py` 的 3 個「驗證」「轉換」欄位加上跨欄位點名的 6 個）；`uncited` 為空，沒有欄位缺引用的問題。
  - (b) SC-001～SC-006 都計入，需求總數 25，與重跑前相同。
  - (c) 和重跑前 `analysis.md` 的差異：重跑前 13 筆（F1～F7、C1～C4、A1、B1）；重跑後 5 筆（B1 HIGH、E1 SC-002 沒有任務、F1 T025 的 `myRescheduleRef`、F2 T034 標 `[P]` 依賴 T029、F3 7 個錯誤碼沒有畫面回饋）。B1 由 LOW 升為 HIGH（E6）。`tasks` 重跑後任務由約 60 個改為 34 個、Notes 待確認由 5 項改為 0 項，重跑前 C1、F3～F5 的「已記錄：待確認」連帶消失；但重跑前 F1、F2、C2～C4、F6、F7、A1 指向 `research.md`、`contracts/`、`ui/`，這些文件沒有改變，重跑後沒有列出，也沒有寫出消失原因。
  - (d) `tasks_state.py status`（在 `implement/scripts/`）的 `format_issues` 為空。
  - (e) `git status` 只有 `data/data-model.dbml`、`tasks.md`、`analysis.md` 改變。
- S3 未通過：
  - (a) 「欄位涵蓋」寫「不適用」，沒有欄位缺引用的問題；(b) T008、T043 列 F 類 HIGH；(c) NFR-002 列 B 類 HIGH；(e) 第一次執行 `git status` 只有 `analysis.md` 改變。以上符合。
  - (d) 不符合。第一次執行：重跑前 14 筆中，F3（登記領取不鎖設備列）、F9～F13 沒有列出，也沒有寫出消失原因；子代理自述沒有全文讀取 `ui/*.html`、沒有讀鎖定項目，且先讀到既有 `analysis.md`。
  - 在新的乾淨複本重跑一次（只加「不得以抽查或腳本取代 SOP 要求的讀取與判斷」「不讀既有 `analysis.md`」）：重跑前的 F2～F8、F10 仍列出（F3 改列 C1），但 F1（FR-009 與 FR-019 矛盾）、F9、F11～F13 沒有列出，也沒有寫出消失原因；另新增 F5（T013 依賴 T026）、F10（雛形多出設備位置與所屬單位）。007 的上游文件沒有改變。
  - 兩次執行都漏掉重跑前的 5 筆以上問題，漏掉的項目不同。依 Phase 5 步驟 17，失敗來源尚未確定是 Skill 還是驗收模型，需要回到 Phase 2 分析根因；Phase 5 停在步驟 17，等待使用者決定。
  - 診斷實跑（不算正式驗收，2026-11-19）：為了確認失敗來源是不是驗收模型，在新的乾淨複本 S3c 用同一份提示詞再跑一次，`skill-tester` 子代理以 Agent 工具指定 model `opus`、effort `high`（重跑前的 `analysis.md` 也是 Opus 產出）。寫入 `analysis.md` 被平台拒絕，以子代理回報的全文判斷，`git status` 為空。
    - 重跑前 14 筆中列出 9 筆：F2～F7、F10、B1 列出（F3 改列 C1 不足 MEDIUM，F7 升為 HIGH），F8 只列出 `EQUIPMENT_STATUS_UNCHANGED`。F1、F9、F11、F12、F13 沒有列出，也沒有寫出消失原因，和 Sonnet 重跑漏掉的 5 筆完全相同。
    - 另外新增 F6（T008、T043 順序，E5）、F9（`reservation_no` 等欄位與合約命名不同）、A1（NFR-002 與 SC-006 重複）；B1 列 HIGH（E6）。
    - 子代理把腳本輸出暫存到測試環境外的 scratchpad 檔案，已自行刪除；不影響專案。
    - 結論：換成 Opus 沒有找回漏掉的問題，兩種模型漏掉同一組問題（spec 內部需求矛盾、合約錯誤碼與 UI 回饋或訊息文字的差異、任務型別與合約 schema 的差異、ui/plan.md 與雛形狀態面板的差異），失敗來源較可能在 Skill 的偵測步驟，而不是驗收模型。
  - 第 2 次根因分析（`rca-report.md` 下半部）：R5 載體過弱，Phase 2 步驟 4 沒有逐項比對的單位，步驟 5 無法發現漏列；舊版有同樣的弱點，不是本輪造成。使用者確認後，(d) 改為回歸檢查，R5 另開一輪。
- S3 重新判定（依改寫後的 (d)，2026-11-19）：通過。以不帶舊報告的 S3b（Sonnet／medium）為正式依據：
  - (a)(b)(c)(e) 同上，符合。
  - (d) 重跑前 14 筆中，屬於本次修改範圍的只有 B1（E6），S3b 列為 B 類 HIGH，沒有消失；重跑前沒有任務順序、欄位涵蓋、SC 分母的問題。範圍外沒有列出的舊 F1、F9、F11、F12、F13 記入本節，交給 `docs/待確認.md` 第 38 項。
- S4 通過：停在 Phase 1 步驟 4，回報需要先執行 `tasks`；`git status` 只有刪除的 `tasks.md`，沒有新檔案。
- 觀察（不影響判定）：
  - S1 的 E1 位置寫成 `data/data-model.dbml` → `overdue_notifications.discord_message_id`，摘要寫「正確欄位為 `discord_message_id`」；沒有算成該欄位的引用，但位置沒有指向 T015 的錯誤引用本身。
  - S1 的「問題數（依類別）」寫成「E 涵蓋 2、F 不一致 2，其他類別 0」，沒有照範例逐一列出 A～F；「欄位涵蓋」的資料模型位置寫成 `檔案 → table.column`，沒有照範例寫成 `檔案:行號`。
- 約束分配：C1～C24 各只出現在指定的存放位置。
- 個案驗收條件調整建議：
  - S1、S2 的 (a)「`check_data_model.py` 報告的受約束欄位數」改為「`check_data_model.py` 的 `constrained_fields` 加上跨欄位規則點名的欄位數（等於 `check_tasks.py` 的受約束欄位數）」，與第 1 節的定義一致。
  - 已套用（2026-11-19，使用者回覆「A 照建議」）：第 7 節 S1、S2 的 (a) 已改寫。S1、S2 判定時已用這個欄位數，不需要重跑。
