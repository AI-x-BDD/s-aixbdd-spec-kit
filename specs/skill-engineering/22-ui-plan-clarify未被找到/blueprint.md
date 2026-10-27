# 工程藍圖：ui-plan－clarify未被找到

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/22-ui-plan-clarify未被找到/`
- 根因報告：[rca-report.md](./rca-report.md)（R1、R2 使用者已確認；R3 為驗收 S1 發現，使用者已選定處理方式）
- 確認紀錄：使用者以 `user-verify-skill` 實際驗證 `ui-plan` 第 1 輪判定不通過（E4）；根因報告經使用者要求參考課程提案後回覆「都照建議」：同意驗收條件與 R1、R2；E12（推定）改為找不到 `clarify` 時停止並告知，不保留直接詢問的退路；E13（推定）改為第 2 節不出現與實際不符的來源說明，以刪除樣板固定句處理。使用者於 Phase 4 檢視工程藍圖（含兩項刪除：As-Is P2-3 直接詢問步驟、UI 規劃樣板組第 2 節固定句）後回覆「確認」。Phase 5 驗收 S1 失敗（R3：先試 Skill 工具時，Claude Code 的錯誤訊息禁止以其他方式代跑 `clarify`），使用者選 A：P2-2 直接讀取專案的 `clarify/SKILL.md`、不使用 Skill 工具；其他 4 個同寫法的 Skill 先記入 `docs/待確認.md` 第 8 項；回覆「都照建議」。新增 W3；使用者檢視修改後的藍圖後回覆「確認」。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | 產出寫在目標 spec 目錄的 `ui/`：`ui/plan.md` 符合 UI 規劃樣板組（標頭與第 1–5 節的標題、表格欄位）；`ui/plan.md` 第 3.1 節頁面清單的第一列為 `index.html`，清單中每個檔案都存在於 `ui/`，`ui/` 沒有清單以外的 HTML；每個 HTML 符合 HTML 頁面樣板組（固定部分逐字保留、沒有殘留 `{{`） | 既有 | 通用 |
| E2 | `ui/plan.md` 第 1 節每個負責介面至少一列、第 3.1 節每個負責介面至少對應一頁；第 1 節與第 3.1 節的介面欄沒有負責介面以外的介面編號，「不在範疇」可以引用其他介面編號說明由誰負責；第 3.2 節流程圖的節點代號不與 plan.md 盤點表的介面編號相同。負責介面為委派指定的介面編號，未指定時為 plan.md 盤點表中端點類型為前端的介面 | 既有 | 通用 |
| E3 | `ui/plan.md` 引用的每個需求編號（US、FR、NFR、SC）都存在於目標 spec；第 5 節涵蓋負責介面需求依據中的每個 Edge Case 與驗證規則 | 既有 | 通用 |
| E4 | 使用者需求或委派內容沒有指定視覺風格的氣質、配色或字體，且專案有 `clarify` 時，寫入 `ui/` 之前先讀取 `clarify` 的 `SKILL.md`，依其 SOP 詢問缺少的項目：以 Markdown 表格列出選項、標示推薦選項並提供 `Others`，不使用 Ask Tool；`ui/plan.md` 第 2 節記錄確認後的風格，每頁 `:root` 的色彩 token 與第 2 節配色一致 | 本次（使用者判定 E4 不通過；課程：沒有指定視覺風格時每次先用 `clarify` 問，不腦補） | 通用 |
| E5 | 以瀏覽器打開每頁時，`ui/plan.md` 第 3.3 節列出的該頁操作都能實際操作並改變畫面；假資料寫出具體名稱與數值，同一實體在不同頁面的名稱與數值相同；頁面沒有說明雛形用途或規格的文件段落 | 既有 | 通用 |
| E6 | 每頁有「雛形狀態」面板，選項包含 `ui/plan.md` 第 4 節該頁的每個狀態（名稱相同），選擇後畫面切到該狀態；第 5 節的每個情境可從面板的某個狀態直接看到，或從某個狀態經頁面操作到達 | 既有 | 通用 |
| E7 | 每頁是單一檔案：CSS 與 JS 內嵌，沒有引用 `http://`、`https://` 或 `//` 開頭的外部資源；頁面之間的連結只指向頁面清單中的檔案；以 `file://` 打開並切換每個雛形狀態時沒有 JS 錯誤 | 既有 | 通用 |
| E8 | `ui/plan.md` 只寫使用者操作與畫面回饋，沒有 API 路徑、HTTP 狀態碼或錯誤碼 | 既有 | 通用 |
| E9 | 執行後目標 spec 目錄只新增、改寫或刪除 `ui/` 下的檔案，不修改 `spec.md`、`plan.md` 與其他 Planner 的產出 | 既有 | 通用 |
| E10 | 目標 spec 目錄沒有 `plan.md` 時停止並告知先用 `system-analysis`；負責介面為空時停止並回報沒有前端介面；兩種情況都不建立 `ui/` | 既有 | 通用 |
| E11 | `ui/` 下已有檔案時，委派內容沒有說明使用者已同意覆寫，就必須先列出既有檔案並詢問；使用者同意前不修改 `ui/` | 既有 | 通用 |
| E12 | 有風格缺口時，只有在專案的 `.agents/skills/clarify/SKILL.md` 與 `.claude/skills/clarify/SKILL.md` 都不存在時，才回報需要 `clarify` 並停止，不建立 `ui/`、不自行詢問或決定風格 | 推定（使用者回覆「都照建議」確認）：課程第三章第 14 單元要求「每次 AI 都要先使用 clarify 去問風格、配色跟氣質」，`clarify` 是基本建設；不保留直接詢問的退路，與 `s-specify`、`technical-research` 一致 | 通用 |
| E13 | `ui/plan.md` 第 2 節不出現與實際取得方式不符的風格來源說明 | 推定（使用者回覆「都照建議」確認）：本次產出第 2 節寫「依 clarify 確認的結果」但實際沒有使用 `clarify`；委派已指定風格時（紀錄 21 的 S2）也不經 `clarify`；課程只要求記錄視覺風格，沒有要求記錄來源 | 通用 |

## 2. To-Be SOP

````markdown
---
name: ui-plan
description: （未驗證）已有 plan.md、要為前端介面規劃畫面並產出可互動雛形時使用：依 plan.md 系統介面盤點中端點類型為前端的介面，或 system-analysis 委派的介面編號，參考 spec.md 的需求與 Edge Cases，先以 clarify 確認視覺風格，產出 spec 目錄的 ui/plan.md（畫面範疇、視覺風格、畫面與流程、狀態、驗證與錯誤回饋），再依 plan.md 產出 ui/ 下可互動、含假資料的靜態 HTML 雛形，多頁時以 index.html 為入口。通常由 system-analysis 依 Wave 委派，也可以單獨使用。使用者提到 ui-plan、UI 規劃、畫面規劃、wireframe、prototype、雛形、HTML mockup 時使用。盤點介面與安排 Wave 改用 system-analysis；設計 API 合約改用 api-plan；設計資料模型改用 data-plan。
---

# SOP

## Phase 1 -- 收斂規劃輸入

1. `READ` 使用者需求或委派內容，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「規劃輸入」。
2. `THINK` 決定「目標 spec」：使用者或委派內容指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文，以及同目錄的 `plan.md`、`techstack.md`、`research.md` 與 `ui/` 下的既有檔案清單（不存在的略過），加入「規劃輸入」。
5. `CHECK` 同目錄沒有 `plan.md` 時，告知使用者需要先做系統分析（可使用 `system-analysis`）並停止執行。
6. `THINK` 決定「負責介面」：委派內容指定介面編號時使用這些編號，否則使用 `plan.md`「系統介面盤點」表中端點類型為前端的所有介面；每個介面記下 plan.md 中的編號、名稱與需求依據。
7. `CHECK` 「負責介面」為空時，回報 `plan.md` 沒有前端介面、不產出 UI 規劃與雛形，並停止執行。
8. `WRITE` `ui/` 下已有檔案，且委派內容沒有說明使用者已同意覆寫時，列出這些檔案並詢問使用者是否覆寫；`ui/` 不存在、沒有檔案，或委派內容已說明同意時，略過本步驟與下一步。
9. `CHECK` 使用者回覆：同意覆寫時進入 Phase 2；不同意或未回覆時，回報沒有修改既有 UI 規劃與雛形、沒有產出任何檔案，並停止執行。

完成條件：「目標 spec」、`plan.md` 與技術研究結果已讀取，「負責介面」已決定，且 `ui/` 沒有既有檔案或使用者已同意覆寫；或缺少輸入、沒有前端介面、使用者不同意覆寫，已停止執行並回報。

## Phase 2 -- 確認視覺風格

1. `THINK` 依「規劃輸入」判斷使用者需求或委派內容是否已指定視覺風格的氣質、配色與字體：三項都已指定時記為「視覺風格」，有未指定的項目時列為「風格缺口」。
2. `DELEGATE` 「風格缺口」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以「風格缺口」為優先提問面向、不要求詳記問答紀錄，取得使用者確認的項目，與已指定的項目合併為「視覺風格」；「風格缺口」為空，或兩個 `SKILL.md` 都不存在時，略過本步驟。
3. `CHECK` 「風格缺口」不為空，且兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、沒有產出任何檔案，並停止執行；使用者未回覆或 `clarify` 停止時，回報沒有產出任何檔案並停止執行；與已指定的項目合併後，「視覺風格」的氣質、配色與字體都已確定時進入 Phase 3。

完成條件：「視覺風格」的氣質、配色與字體都已確定；或專案沒有 `clarify`、使用者未回覆，已停止執行並回報。

## Phase 3 -- 規劃畫面並產出 ui/plan.md

1. `READ` 規劃畫面時，讀取 `rules/畫面規劃-格式規範.md` 的所有 Rule，建立「畫面規劃檢查清單」。
2. `THINK` 依「規劃輸入」、「視覺風格」與已載入的「畫面規劃檢查清單」，為「負責介面」規劃畫面範疇、頁面清單、流程、使用者操作、各頁狀態、驗證與錯誤回饋，以及跨頁共用的假資料；只寫使用者操作與畫面回饋，不寫 API 路徑、HTTP 狀態碼或錯誤碼，建立「畫面規劃」。
3. `READ` `templates/ui-plan.md` 與 `templates/ui-plan.example.md`，載入骨架與範例，命名載入結果為「UI 規劃樣板組」。
4. `WRITE` 依「UI 規劃樣板組」與「畫面規劃」，將 `plan.md` 寫入「目標 spec」所在目錄的 `ui/`：標題填 spec.md 的功能名稱，`Date` 填執行當日日期，第 2 節填「視覺風格」與依它決定的色碼、字體與版面；內文使用繁體中文，檔名與識別字使用英文。

完成條件：`ui/plan.md` 已寫入，且「畫面規劃」涵蓋每個「負責介面」。

## Phase 4 -- 產出 HTML 雛形並驗證

1. `READ` `templates/ui-page.html` 與 `templates/ui-page.example.html`，載入骨架與範例，命名載入結果為「HTML 頁面樣板組」。
2. `READ` 撰寫 HTML 雛形時，讀取 `rules/HTML雛形-格式規範.md` 的所有 Rule，建立「HTML 雛形檢查清單」。
3. `WRITE` 依「HTML 頁面樣板組」、已載入的「HTML 雛形檢查清單」與 `ui/plan.md`，為第 3.1 節頁面清單的每一頁在 `ui/` 寫入一個 HTML 檔；已同意覆寫時，刪除 `ui/` 中不在頁面清單的既有 HTML；不建立或修改 `ui/` 以外的檔案。
4. `DELEGATE` 在本 Skill 目錄執行 `uv run --script scripts/check_ui.py --spec <目標 spec 絕對路徑> --interfaces <負責介面編號，以逗號分隔> <ui 目錄絕對路徑>`，取得「UI 檢查結果」；若缺少 `uv`，依 https://docs.astral.sh/uv/getting-started/installation/ 的目前平台安裝說明安裝後重試，安裝失敗時回報原因並停止。
5. `CHECK` 「UI 檢查結果」沒有問題，逐條驗證「畫面規劃檢查清單」與「HTML 雛形檢查清單」，比對 `ui/plan.md` 與「UI 規劃樣板組」的標題與表格欄位、每個 HTML 與「HTML 頁面樣板組」的固定部分，並確認步驟 3 與 Phase 3 步驟 4 的填寫要求均已滿足；有瀏覽器自動化工具時，以 `file://` 打開每頁、逐一切換雛形狀態並確認沒有 JS 錯誤，沒有工具時將瀏覽器檢查記為「未驗證」；腳本因參數或環境錯誤而失敗時修正後重新執行步驟 4；未通過時修正 `ui/` 下的檔案後返回步驟 4，最多 3 輪，第 3 輪仍未通過時將未通過的項目記為「未通過項」。
6. `WRITE` 向使用者或委派方回報 `ui/plan.md` 與每個 HTML 的路徑（標出入口 `index.html`）、每個「負責介面」對應的頁面、「視覺風格」摘要、瀏覽器檢查結果，以及「未通過項」（沒有時說明全部通過）。

完成條件：`ui/plan.md` 與頁面清單的每個 HTML 已寫入，UI 檢查結果、兩份檢查清單與樣板結構已通過或未通過的項目已記為「未通過項」，且已回報。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| As-Is P2-3 `WRITE`「「風格缺口」不為空且找不到 `clarify` 時，直接向使用者詢問…」 | `SKILL.md` Phase 2 步驟 3 | E12 改為無法取得 `clarify` 時停止；直接詢問的分支不再追溯到任何驗收條件，且是 R1 中讓錯誤判定無法被發現的退路 |
| `templates/ui-plan.md` 第 2 節固定句「依 clarify 確認的結果：」及其後的空行（範例 `templates/ui-plan.example.md` 同位置） | UI 規劃樣板組 | R2（衝突）：只與經 `clarify` 的路徑一致，與 P2-1 已指定風格的路徑矛盾；E13 不要求記錄來源，刪除後只保留一個來源（第 2 節的風格內容） |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| P2-2 `DELEGATE` 委派 `clarify` | 修改 | 「找得到 `clarify` 時讀取其 `SKILL.md`」改為「讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`」；略過條件改為風格缺口為空，或兩處都不存在。第一版寫法「委派 `clarify` Skill（無法以 Skill 工具呼叫時…）」已由 W1 施工，因 R3 再由 W3 改寫 | R1（不可檢查 → 改寫為可檢查的描述）、R3（衝突 → 改寫一方，只保留讀取 `SKILL.md` 一種方式）；E4；C11 |
| As-Is P2-4 `CHECK` → To-Be P2-3 | 修改 | 新增「兩個 `SKILL.md` 都不存在時，回報需要先在專案加入 `clarify`、沒有產出任何檔案並停止」；其餘分支文字保留，「使用者回覆或 `clarify` 的結果：」前導語隨 P2-3 刪除而移除 | E4、E12；C12 |
| Phase 2 完成條件 | 修改 | 停止情況加入「專案沒有 `clarify`」 | E12；概述 C12 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| frontmatter（`name`、`description`，含「（未驗證）」與「先以 clarify 確認視覺風格」） | 觸發與分流；E4 仍以 `clarify` 確認風格，描述不變 | 無（只概述） |
| Phase 1 -- 收斂規劃輸入（P1-1～P1-9）與完成條件 | E2、E10、E11 | C3–C9 |
| P2-1 `THINK` 判斷風格缺口 | E4 | C10 |
| Phase 3 -- 規劃畫面並產出 ui/plan.md（P3-1～P3-4）與完成條件 | E1–E3、E8 | C1、C13–C17 |
| Phase 4 -- 產出 HTML 雛形並驗證（P4-1～P4-6）與完成條件 | E1、E4–E7、E9 | C2、C18–C25 |
| `rules/畫面規劃-格式規範.md` Rule 1–3 | E1–E3 | C13–C15 |
| `rules/HTML雛形-格式規範.md` Rule 1–3 | E4–E7 | C19–C21 |
| UI 規劃樣板組（第 2 節固定句以外的部分） | E1 | C1 |
| HTML 頁面樣板組 | E1 | C2 |
| `scripts/check_ui.py` | E1–E3、E6、E7 | C22 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 4 | 4 | 0 |
| 步驟 | 23 | 22 | -1 |
| RuleFile | 2 | 2 | 0 |
| Rule | 6 | 6 | 0 |
| 樣板組 | 2 | 2 | 0 |
| 腳本 | 1 | 1 | 0 |

- 內容增減：刪除 P2-3 直接詢問的分支（R1、E12）；改寫 P2-2 的取得方式與 P2-3（原 P2-4）的停止分支；刪除 UI 規劃樣板組第 2 節固定句（R2、E13）。沒有任何項目淨增加。
- 呼叫者：目前沒有其他 Skill 委派 `ui-plan`（結構診斷 `callers` 為空），不需要呼叫者回歸情境。本次沒有改變 `ui-plan` 的輸入格式；委派內容已指定三項風格時行為不變（S2）。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | `ui/plan.md` 的標頭（功能名稱、Spec／Plan 連結、Date、負責介面、雛形入口）與第 1–5 節的標題、說明句及表格欄位；第 2 節不寫風格來源（本次修改：刪除固定句「依 clarify 確認的結果：」） | P3-4 | UI 規劃樣板組 | 約束整份產出檔案的結構；不是可由腳本產生的內容。R2：固定句與 P2-1 已指定風格的路徑矛盾，依衝突的修改方向刪除，只保留第 2 節的風格內容（E13） |
| C2 | HTML 頁面的固定部分：`:root` token 名稱、`[hidden]` 規則、雛形狀態面板的 CSS 與 markup、頁首結構、`MOCK`、`$`、`timers`、`STATES`、`markState`／`applyState` 的位置與寫法 | P4-3 | HTML 頁面樣板組 | 約束每一份頁面檔案的整體結構；屬於另一種產出格式 |
| C3 | 決定目標 spec 的規則（指定優先，否則唯一一份） | P1-2 | P1-2 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C4 | 目標 spec 不存在或無法確定時停止 | P1-3 | SOP 流程 | 屬於分支與停止 |
| C5 | 沒有 plan.md 時停止並指向 `system-analysis` | P1-5 | SOP 流程 | 屬於分支與停止 |
| C6 | 負責介面的決定方式（委派指定優先，否則 plan.md 中端點類型為前端的介面） | P1-6 | P1-6 步驟內文 | 只屬於單一步驟，一句話即可表達，不需正反例 |
| C7 | 負責介面為空時停止並回報 | P1-7 | SOP 流程 | 屬於分支與停止 |
| C8 | `ui/` 有既有檔案時須經使用者同意才覆寫，委派內容已說明同意時免問 | P1-8、P1-9 | SOP 流程 | 屬於使用者確認閘門 |
| C9 | 不同意覆寫時回報未修改、未產出並停止 | P1-9 | SOP 流程 | 屬於分支與停止 |
| C10 | 視覺風格的三個必要項目為氣質、配色與字體，三項都已指定才算已指定 | P2-1 | P2-1 步驟內文 | 只屬於判斷缺口的步驟，列舉即可表達；判斷需求是否指定了風格需要語意，腳本無法判斷 |
| C11 | 有風格缺口時委派 `clarify` 詢問，不自行決定；讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`，不存在時改讀 `.claude/skills/clarify/SKILL.md`，不使用 Skill 工具呼叫（本次修改：以可檢查的取得方式取代「找得到 `clarify`」，刪除直接詢問的分支；R3 後改為只讀取 `SKILL.md`） | P2-2 | SOP 流程 | 屬於委派；R1 為不可檢查，改寫為可由檔案是否存在判斷的描述；R3 為衝突，只保留一種取得方式（E4） |
| C12 | 有風格缺口而無法取得 `clarify` 時回報需要 `clarify` 並停止；使用者未回覆或 `clarify` 停止時回報並停止（本次修改：所屬步驟由 P2-4 改為 P2-3，新增無法取得 `clarify` 的停止分支） | P2-3 | SOP 流程 | 屬於分支與停止（E4、E12） |
| C13 | 頁面切分：依功能流程決定一到多頁，相鄰流程且共用主要內容的畫面放同一頁、以畫面狀態切換；檔名為英文小寫，第一頁為流程第一個畫面並命名 `index.html`；每個負責介面至少對應一頁 | P3-2 | `rules/畫面規劃-格式規範.md` Rule 1 | 判斷哪些畫面合併成一頁需要理解流程，腳本無法判斷；樣板只固定頁面清單欄位；需要「每個畫面拆一頁」與「把無關功能塞進同一頁」的反例 |
| C14 | 需求追溯與介面範圍：第 1 節每列的需求依據在每個需求編號後寫出對應的需求內容；第 3.3、4、5 節每列的需求依據至少引用一個目標 spec 中的需求編號或 Edge Case 名稱，不得只寫「依需求」或留空；第 1 節與第 3.1 節的介面欄只出現負責介面，「不在範疇」可以引用其他介面編號說明由誰負責，第 3.2 節流程圖的節點代號不與 plan.md 盤點表的介面編號相同；不在範疇列出 spec 沒有涵蓋、使用者可能預期的畫面 | P3-2 | `rules/畫面規劃-格式規範.md` Rule 2 | 判斷哪個需求對應哪個畫面需要語意，腳本只能事後檢查編號存在；需要「需求依據只寫『依需求』」與「把後端介面列成畫面」的反例 |
| C15 | 狀態與錯誤回饋：第 4 節為每頁列出畫面會經過的狀態（含載入中、空狀態、等待外部結果與成功，有適用時）；第 5 節涵蓋負責介面需求依據中的每個 Edge Case 與驗證規則，觸發條件與畫面回饋寫出具體值與實際顯示的文字 | P3-2 | `rules/畫面規劃-格式規範.md` Rule 3 | 判斷需要哪些狀態與錯誤情境需要語意；需要「只寫正常狀態」與「回饋只寫『顯示錯誤訊息』」的反例；與 C13、C14 同屬畫面規劃主題 |
| C16 | 只寫使用者操作與畫面回饋，不寫 API 路徑、HTTP 狀態碼或錯誤碼 | P3-2 | P3-2 步驟內文 | 只屬於規劃步驟，一句話即可表達，不需正反例 |
| C17 | `ui/plan.md` 的填值與語言：標題填功能名稱、`Date` 填執行當日、第 2 節填「視覺風格」與依它決定的色碼、字體與版面；內文繁體中文，檔名與識別字英文 | P3-4 | P3-4 步驟內文 | 填值來源只屬於寫入步驟；樣板只固定欄位位置 |
| C18 | HTML 只寫入 `ui/`；已同意覆寫時刪除 `ui/` 中不在頁面清單的既有 HTML | P4-3 | P4-3 步驟內文 | 只屬於寫入步驟，一句話即可表達 |
| C19 | 單檔與跨頁一致：CSS 與 JS 內嵌、不引用外部資源；`:root` token 值依 `ui/plan.md` 第 2 節；`BASE_STYLES`、頁首、`NAV_LINKS` 與 `HEADER_EXTRA` 各頁相同，只有目前頁的導覽連結加 `aria-current="page"`；頁面之間只連到頁面清單中的檔案 | P4-3 | `rules/HTML雛形-格式規範.md` Rule 1 | 判斷哪些內容屬於共用、token 如何對應配色需要語意；樣板只固定 token 名稱，無法保證各頁的填值相同；需要「各頁頁首與配色各寫一套」的反例 |
| C20 | 互動與雛形狀態：第 3.3 節列出的該頁操作都有可點擊或可輸入的元素，操作後畫面改變，需要等待外部結果時以 `setTimeout` 模擬並推進到下一個狀態；`STATE_ENTRIES` 包含第 4 節該頁的每個狀態，`label` 與狀態名稱相同；第 5 節的每個情境可從某個狀態直接看到或經操作到達，同一頁的多個欄位驗證錯誤合併為「欄位驗證錯誤」 | P4-3 | `rules/HTML雛形-格式規範.md` Rule 2 | 判斷操作要改變哪些畫面需要理解流程；腳本只能檢查面板選項名稱；需要「按鈕沒有反應」與「錯誤狀態只能看程式碼才知道」的反例 |
| C21 | 像真的產品：假資料使用「畫面規劃」的實體，寫出具體名稱、數值與日期，同一實體在不同頁面的名稱與數值相同，不得用 lorem ipsum、「商品 A」、「測試資料」；頁面只放產品畫面，不得加入說明雛形用途、規格或需求編號的段落（雛形狀態面板除外） | P4-3 | `rules/HTML雛形-格式規範.md` Rule 3 | 判斷假資料是否具體、段落是否屬於說明文件需要語意；需要「佔位假資料」與「頁面上寫需求說明」的反例 |
| C22 | 機械檢查：`ui/plan.md` 存在；第 3.1 節頁面清單第一列為 `index.html`、每個檔案存在、`ui/` 沒有清單以外的 HTML；第 1 節介面欄只出現負責介面且每個負責介面都出現，第 3.1 節每個負責介面至少一頁；引用的需求編號都存在於目標 spec；每頁沒有殘留 `{{`、沒有外部資源、相對 `.html` 連結都在頁面清單中；每頁 `STATES` 的 `label` 包含第 4 節該頁的每個狀態；第 3.2 節 Mermaid 流程圖的節點代號不與目標 spec 同目錄 `plan.md` 盤點表的介面編號相同；每段內嵌 `<script>` 通過 `node --check`（沒有 Node.js 時記為警告） | P4-4 | `scripts/check_ui.py` | 輸入（spec、介面編號、`ui/` 目錄）與輸出（問題清單）明確、可重複執行，結果可由程式判斷；跨多個檔案比對，人工容易遺漏 |
| C23 | 瀏覽器檢查：有瀏覽器自動化工具時以 `file://` 打開每頁、逐一切換雛形狀態並確認沒有 JS 錯誤；沒有工具時記為「未驗證」 | P4-5 | P4-5 步驟內文 | 需要的工具依執行環境而定，腳本無法假設可用；只屬於驗證步驟，一句話即可表達 |
| C24 | 驗證最多 3 輪，仍未通過記為「未通過項」 | P4-5 | SOP 流程 | 屬於執行順序與停止條件 |
| C25 | 回報內容（各檔路徑與入口、負責介面對應頁面、視覺風格摘要、瀏覽器檢查結果、未通過項） | P4-6 | P4-6 步驟內文 | 只屬於回報步驟，一句話即可表達 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-sop` | `.agents/skills/ui-plan/SKILL.md` Phase 2 -- 確認視覺風格 | 改寫 `DELEGATE` 委派 `clarify` 步驟、刪除 `WRITE` 直接詢問步驟、改寫 `CHECK` 步驟與完成條件 | C11、C12 | 已完成 |
| 2 | W2 | `skill-form-template` | `.agents/skills/ui-plan/templates/ui-plan.md` 與 `ui-plan.example.md` | 刪除第 2 節固定句「依 clarify 確認的結果：」及其後空行 | C1 | 已完成 |
| 3 | W3 | `skill-form-sop` | `.agents/skills/ui-plan/SKILL.md` Phase 2 -- 確認視覺風格 | 依 R3 改寫 `DELEGATE` 委派 `clarify` 步驟與 `CHECK` 步驟的取得方式（不使用 Skill 工具） | C11、C12 | 已完成 |

不需要 LICENSE 更新：本次只改寫自建內容，沒有複製 `clarify` 或 Spec-Kit 的內容。

### 工作項內容

#### W1：改寫 Phase 2

以 `skill-form-sop` 將 `.agents/skills/ui-plan/SKILL.md` 的「## Phase 2 -- 確認視覺風格」整段（從標題到完成條件）改為第 2 節 To-Be SOP 的同一段；Phase 1、3、4 與 frontmatter 不變。改寫後 `# SOP` 必須與第 2 節 To-Be SOP 逐字相同。

#### W3：改寫 P2-2、P2-3 的 `clarify` 取得方式（R3）

以 `skill-form-sop` 將 `.agents/skills/ui-plan/SKILL.md` 的「## Phase 2 -- 確認視覺風格」中，`DELEGATE` 委派 `clarify` 的步驟與其後的 `CHECK` 步驟，改為第 2 節 To-Be SOP 的同兩步；其餘內容不變。改寫後 `# SOP` 必須與第 2 節 To-Be SOP 逐字相同。

#### W2：刪除樣板第 2 節固定句

以 `skill-form-template` 修改 UI 規劃樣板組：

- `templates/ui-plan.md`：刪除「## 2. 視覺風格」與「- 氣質：{{STYLE_MOOD}}」之間的「依 clarify 確認的結果：」與其後的空行，使 `## 2. 視覺風格` 之後空一行直接接 `- 氣質：`。
- `templates/ui-plan.example.md`：同位置刪除同一句與其後空行，其餘內容不變。
- 修改後骨架實例比對範例必須仍為全文相符；記錄範例新雜湊，原雜湊 `9efc4329…742a` 作廢。

## 7. 驗收情境

所有情境在 scratchpad 的獨立暫存專案執行，`git init` 後提交初始狀態並記錄 `git status`。給執行者的指示只提供 `ui-plan` 的路徑或自然語言需求、測試環境位置、情境輸入與預先回覆，不提及 `clarify` 是否存在或位於何處。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1–E9、E13 | 本次 | 重現使用者驗證的原始輸入：暫存專案 `.claude/skills/` 放 `ui-plan` 與 `clarify`，`specs/001-restaurant-waitlist/` 放使用者驗證用的 spec.md、plan.md（前端 F1–F3、後端 B1–B4、資料庫 D1）、techstack.md、research.md。以 Herdr 開新 pane 啟動全新的 `claude --model sonnet`，送出自然語言需求「specs/001-restaurant-waitlist 的系統分析做好了，幫我規劃前端畫面，做出可以實際點的 HTML 雛形。」 | 出現視覺風格提問時，回答「氣質：溫暖親切；配色：暖橘＋米白；字體：系統預設字體」 | 對話紀錄顯示寫入 `ui/` 前讀取了 `clarify` 的 `SKILL.md`、沒有以 Skill 工具呼叫 `clarify`，風格題以 Markdown 表格列出選項、標示推薦並提供 `Others`，沒有呼叫 `AskUserQuestion`；主代理重跑 `check_ui.py --interfaces F1,F2,F3` 退出碼 0；`ui/plan.md` 與 3 頁以上 HTML 通過骨架實例比對；第 2 節記錄回答的風格、沒有「依 clarify 確認的結果」，每頁 `:root` 與第 2 節配色一致；第 5 節涵蓋 spec 的 5 個 Edge Case；沒有 API 路徑、HTTP 狀態碼或錯誤碼；主代理以 `agent-browser --session` 打開每頁、切換每個雛形狀態沒有 JS 錯誤，第 3.3 節操作可操作並改變畫面，假資料具體且跨頁一致；`git status` 只有 `ui/` 新增 |
| S2 | E2、E9、E13 | 回歸 | 紀錄 21 S2 的健身房預約素材（Vue 3、Express REST、MySQL；plan.md 前端 F1–F3、後端 B1–B5、資料庫 D1–D3；既有 `ui/plan.md` 與 `ui/old-booking.html`），暫存專案放 `ui-plan` 與 `clarify`。由子代理執行，輸入：「system-analysis 委派：目標 spec 為 specs/002-gym-class-booking，負責介面 F1、F2（Wave 1）。視覺風格：清爽運動風；配色：白底、活力橘主色；字體：圓體。使用者已同意覆寫既有產出。」 | 無（遇到確認閘門時回報並結束） | 沒有風格提問與覆寫確認，沒有讀取 `clarify`；第 1 節、第 3.1 節介面欄只有 F1、F2；`check_ui.py --interfaces F1,F2` 退出碼 0；第 2 節為清爽運動風、白底、橘色主色、圓體，沒有「依 clarify 確認的結果」；`ui/old-booking.html` 已刪除；`git status` 只有 `ui/` 的變更 |
| S3 | E9、E12 | 本次 | 同 S1 的候位素材，但暫存專案 `.claude/skills/` 只放 `ui-plan`（沒有 `clarify`，`.agents/skills/` 不存在）。由子代理執行，輸入同 S1 的自然語言需求 | 無 | 回報需要先在專案加入 `clarify` 並停止；沒有出現任何風格提問（文字或互動選單），沒有自行決定風格；沒有 `ui/`；`git status` 乾淨 |
| S4 | E10 | 回歸 | 紀錄 21 S3：同 S1，但沒有 plan.md | 無 | 回報需要先做系統分析並提到 `system-analysis`；沒有 `ui/`；沒有風格提問 |
| S5 | E10 | 回歸 | 紀錄 21 S4：同 S1，但 plan.md 只有後端與資料庫介面 | 無 | 回報沒有前端介面；沒有 `ui/`；沒有風格提問 |
| S6 | E11 | 回歸 | 紀錄 21 S5：同 S1，另有既有 `ui/plan.md`（記錄雜湊） | 無（遇到確認閘門時回報並結束） | 回報中詢問是否覆寫並列出 `ui/plan.md`；該檔雜湊不變；沒有新增 HTML；沒有風格提問 |

S4–S6 只經過 Phase 1，本次修改不影響 Phase 1 的步驟與部位，依 Phase 5 步驟 13 改為逐步演練，並沿用紀錄 21 的實跑結果。S1 以 Herdr 頂層 session 執行，原因是問題只在有 Skill 清單、可使用 `AskUserQuestion` 的真實 session 中出現；Herdr 啟動的 session 不帶本次分析脈絡，並顯式指定 Sonnet。

## 8. 驗收結果

- 施工：W1–W3 已完成；施工後 `SKILL.md` 的 `# SOP` 與第 2 節 To-Be SOP 逐字相同；UI 規劃樣板組骨架實例比對範例全文相符，範例雜湊 `ab116a06…9a36`。
- 施工後結構診斷：`audit_skill.py` 對 `ui-plan` 為 0 error、0 warning。
- 同步：`./scripts/sync-skills.sh --from agents` 成功，`--check` 為「兩邊一致」；同步輸出沒有只存在於目標端、未被刪除的 Skill。
- 驗收方式：驗收模型 **Sonnet**（主模型為 Opus 5.5）。S1 以 Herdr 開新 pane 啟動全新的 `claude --model sonnet`（Sonnet 5.5、medium effort、auto mode），送出自然語言需求；S2、S3 以 Agent 工具 `model: sonnet`、`effort: medium` 的子代理直接讀 `SKILL.md` 逐步執行。給執行者的指示都沒有提及 `clarify`。每個情境在 scratchpad 的獨立暫存專案執行，主代理另以 `git status`、雜湊、`check_ui.py`、骨架實例比對與自己的 `agent-browser --session` 複查。
- S1 通過（第二輪，W3 施工後）：對話紀錄的工具呼叫依序為 `ls … .agents/skills/clarify .claude/skills/clarify`、`cat … ../../.claude/skills/clarify/SKILL.md`、`cat rules/*.md templates/clarify-question-round.md templates/clarify-question-round.example.md`（`clarify` 目錄），之後才寫入 `ui/`；全程沒有 `Skill(clarify)` 與 `AskUserQuestion`。風格題 3 題，每題有 Context、總結之提問與 Markdown 表格選項，標示推薦並提供 Others；主代理依預先回覆作答「1-1、2-1、3-1」。主代理重跑 `check_ui.py --interfaces F1,F2,F3` 為 ok、issues 與 warnings 為空；`ui/plan.md` 與 3 頁 HTML 骨架實例比對全部相符；第 2 節為溫暖親切、主色 `#D9531E`、底色 `#FBF6EE`、系統字體，沒有「依 clarify 確認的結果」，3 頁 `:root` 一致；第 5 節涵蓋 spec 的 5 個 Edge Case；沒有 API 路徑、HTTP 狀態碼或錯誤碼；主代理切換 30 個雛形狀態（8＋10＋12）沒有 JS 錯誤；假資料（暖暖食堂、B017、0912-345-678）跨頁一致；`git status` 只有 `ui/` 4 個新檔。
- S2 通過（第一輪，見施工紀錄）；W3 只改 P2-2、P2-3 中風格缺口不為空時的取得方式，S2 的風格缺口為空、不經過該分支，沿用結果。
- S3 通過（第二輪，W3 施工後）：子代理檢查 `.agents/skills/clarify/SKILL.md` 與 `.claude/skills/clarify/SKILL.md` 都不存在後，在 P2-3 回報需要先加入 `clarify` 並停止；沒有任何風格提問；沒有 `ui/`；主代理確認 `git status` 乾淨。
- S4–S6：只經過 Phase 1，本次沒有修改 Phase 1 的步驟與部位，依 Phase 5 步驟 13 以逐步演練確認，沿用紀錄 21 S3–S5 的實跑結果。
- 觀察：S1 測試 session 動筆前讀了 `check_ui.py` 原始碼，並在自己的 scratchpad 以產生器組裝 HTML（不在專案內）；雛形以 `localStorage` 同步「暫停取號」狀態到其他頁，紀錄 21 的提案決策為「假資料跨頁一致但不跨頁保存」，但這項決策沒有寫進任何部位（RuleFile 與樣板都沒有相關約束），不屬於本次驗收條件；後台 PIN `1234` 只寫在 JS 中。S1 第一次送出需求時 Herdr 回報 `agent_prompt_stalled`（第一輪），畫面確認輸入框為空後重送。兩輪 S1 的信任資料夾確認都由主代理選 Yes（主代理建立的驗收暫存專案）。

### 施工紀錄

- W1、W2 已完成：P2 改寫後與當時的 To-Be 逐字相同；樣板與範例刪除固定句，骨架實例比對範例全文相符，範例新雜湊 `ab116a06…9a36`（原 `9efc4329…742a` 作廢）。`audit_skill.py` 0 error、0 warning；`sync-skills.sh --from agents` 成功、`--check` 兩邊一致。
- 第一輪驗收（驗收模型 Sonnet；S1 以 Herdr 頂層 `claude --model sonnet`，S2、S3 以 Agent 工具 `model: sonnet`、`effort: medium`）：
  - S2 通過：沒有風格提問與覆寫確認、沒有讀取 `clarify`；主代理重跑 `check_ui.py --interfaces F1,F2` 為 ok；第 2 節沒有「依 clarify 確認的結果」；介面欄只有 F1、F2，F3 只出現在「不在範疇」；`old-booking.html` 已刪除；`git status` 只有 `ui/` 的變更。
  - S3 通過：檢查兩個 `SKILL.md` 路徑都不存在後，回報需要先加入 `clarify` 並停止；沒有任何風格提問；沒有 `ui/`；`git status` 乾淨。
  - S1 失敗：測試 session 以 `ls` 找到 `.claude/skills/clarify/SKILL.md`（R1 已修正），但依 P2-2 先以 Skill 工具呼叫 `clarify`，Claude Code 回傳「Do not replicate this skill's workflow by other means」，測試 session 停下來請使用者自行執行 `/clarify`，沒有產出檔案。S1 第一次送出需求時 Herdr 回報 `agent_prompt_stalled`，畫面確認輸入框為空、沒有開始回合後重送一次。S1 的信任資料夾確認由主代理選 Yes（主代理建立的驗收暫存專案）。
- 依 Phase 5 步驟 17 返回 Phase 2：根因報告補 R3（衝突），使用者選 A 並同意其他 4 個 Skill 記入 `docs/待確認.md` 第 8 項；藍圖新增 W3。

### 使用者實際驗證（2026-10-27）

- 方式：使用者觸發 `/user-verify-skill ui-plan`，選定實跑需求 A「餐廳線上候位」（驗收紀錄 21 沒用過、與範例電商不同）。以 Herdr 在呼叫者 pane 下方開新 pane，於 scratchpad 的暫存專案（`.claude/skills/` 只放 `ui-plan` 與 `clarify`，素材為 `specs/001-restaurant-waitlist/` 的 spec.md、plan.md〔前端 F1–F3、後端 B1–B4、資料庫 D1〕、techstack.md、research.md；`.claude/` 加入 `.git/info/exclude`）啟動全新的 `claude --model sonnet`。實跑需求以自然語言送出、不指名 Skill、不指定視覺風格：「specs/001-restaurant-waitlist 的系統分析做好了，幫我規劃前端畫面，做出可以實際點的 HTML 雛形。」
- 權限處理：兩輪的信任資料夾都由使用者回答「Yes, I trust this folder」；測試 session 為 auto mode，Bash 皆由分類器放行，主代理沒有代為放行任何權限。
- 結果（第 1 輪，紀錄 21 版本，Sonnet 5.5 medium effort）：測試 session 自行觸發 `ui-plan`。P2-2 只寫「找得到 `clarify` 時」，測試 session 沒有查找 `.claude/skills/`，回報「技能裡找不到 clarify」，改以 `AskUserQuestion` 互動選單問氣質、配色、字體；使用者在 pane 中選溫暖親切、暖橘＋米白、Noto Sans TC。產出 `ui/plan.md` 與 3 頁 HTML，`check_ui.py` 為 ok、骨架實例比對相符、29 個雛形狀態無 JS 錯誤，但第 2 節寫「依 clarify 確認的結果」與事實不符。使用者判定不通過（E4），交由 `skill-engineering` 優化，紀錄目錄 `specs/skill-engineering/22-ui-plan-clarify未被找到/`（根因 R1–R3，見 `rca-report.md`）。
- 結果（第 2 輪，本紀錄版本，Sonnet 5.5 medium effort）：以相同需求與素材重建暫存專案。測試 session 自行觸發 `ui-plan`，先 `ls` 兩個 `clarify/SKILL.md` 路徑，再讀取 `.claude/skills/clarify/SKILL.md` 與其 rules、出題樣板，以「Clarify Round 1」用 Markdown 表格出三題（各有 Context、總結之提問、推薦選項與 Others）；全程沒有 `Skill(clarify)` 與 `AskUserQuestion`。使用者回覆「都照推薦」，主代理轉送「1, 1, 1」。約 7 分 22 秒完成。主代理重跑 `check_ui.py --interfaces F1,F2,F3` 退出碼 0、issues 為空；`ui/plan.md` 與 `index.html`、`progress.html`、`staff.html` 骨架實例比對相符；第 2 節為溫暖親切、主色 `#E8590C`、底色 `#FBF6EE`、系統字型，沒有來源固定句，3 頁 `:root` 一致；第 5 節涵蓋 spec 的 5 個 Edge Case；沒有 API 路徑或狀態碼；主代理以 `agent-browser --session verify-v2` 切換 31 個雛形狀態（8＋10＋13）無 JS 錯誤，實際操作取號（3 人得 B017、前方 4 組、約 20 分鐘）與後台登入叫號（B013 倒數 04:59）；`git status` 只有 `ui/` 4 個新檔。E1–E9、E13 符合；E10–E12 本輪未觸及（已由驗收 S3–S6 驗證）。
- 觀察：
  - 兩輪測試 session 都在自己的 scratchpad 以產生器腳本組裝 HTML，沒有放進專案。
  - 後台 PIN（第 1 輪 `1234`、第 2 輪 `2580`）只寫在 session 回報與 JS 中，頁面與 `ui/plan.md` 沒有；不知道 PIN 也能從雛形狀態面板切到候位管理。
  - 第 2 輪人數輸入 8 時，主代理讀到的畫面文字只有「7 人以上請洽櫃台」的提示，未確認是否需失焦才顯示錯誤；「人數超過 6 人」狀態可由面板直接切換。
  - 委派 `clarify` 時先試 Skill 工具會被 Claude Code 擋下（R3）；其他 4 個同寫法的 Skill 已記入 `docs/待確認.md` 第 8 項。
- 結論：使用者判定第 2 輪通過。`description` 已移除「（未驗證）」前綴，並以 `./scripts/sync-skills.sh --from agents` 同步，`--check` 為兩邊一致。
