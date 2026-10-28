# 工程藍圖：system-analysis－升級為依Wave委派Planner的指揮者

- 模式：優化
- 紀錄目錄：`specs/skill-engineering/23-system-analysis-升級為依Wave委派Planner的指揮者/`
- 根因報告：`rca-report.md`（使用者回覆「同意／都照建議」確認 E1–E24 與 R1–R3，推定的 E14、E23、E24 保留）
- 確認紀錄：使用者於 Phase 4 回覆「都照建議」：確認藍圖全文與第 3 節三項刪除（原 P3-5 回報步驟、原 P3-4 括號內的 `grep` 方法、範例的照片相簿情境）；推定的 E25（沒有 `clarify` 時不委派 `ui-plan`，其他 Planner 照常）保留。Phase 5 驗收 S2、S3 的 E16 未通過，根因 R4（見 `rca-report.md`）；使用者回覆「確認」同意 R4 與修正方式：P5-3 改為逐字列出 P3-4 執行的兩個命令，新增工作項 W4。驗收後使用者回覆「都照建議」：刪除 S3 判斷方式中沒有驗收條件支撐的「沒有風格提問」。

## 1. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 |
| ---- | -------- | ---- | -------- |
| E1 | plan.md 寫在目標 spec.md 的同一個目錄，結構符合 plan 樣板組：標題為「Implementation Plan: <功能名稱>」，`Branch` 為該目錄名稱，`Date` 為執行當日，`Spec` 連結為 `./spec.md`，`Input` 為目標 spec 路徑；依序包含 `## Project Structure`（`### Documentation (this feature)`、`### Source Code (repository root)`、`**Structure Decision**`）與 `## 分析流程規劃`（`### 系統介面盤點`、`### 分析流程安排`）；沒有殘留的填位符號 | 既有 | 通用 |
| E2 | 系統介面盤點表的每一列是一個介面：介面名稱指出需求部位，不是只寫端點名稱；端點類型欄寫出端點類型與使用關係 | 既有 | 通用 |
| E3 | 每一列的需求依據都引用目標 spec 中存在的 US 情境、FR、NFR、SC 編號，或 Edge Cases、Key Entities 項目 | 既有 | 通用 |
| E4 | Wave 以技術端點為單位：同一端點類型的介面都在同一個 Wave；每個介面恰好出現在一個 Wave；每個 Wave 寫出涵蓋介面與排序理由，第 2 個以後的 Wave 寫出依賴前面 Wave 的哪些結果 | 既有 | 通用 |
| E5 | 同一個 Wave 有兩個以上端點類型時，Wave 標題標出平行分析的 Sub-agent 數（等於端點類型數），且這些端點之間沒有互相依賴 | 既有 | 通用 |
| E6 | plan.md 不含 API endpoint 清單、資料表欄位或畫面元件設計；`system-analysis` 自己只寫入 plan.md，目標 spec 目錄的其他新增檔案都在 `contracts/`、`data/`、`ui/` 下，沒有其他彙整檔 | 既有（改寫） | 通用 |
| E7 | 「系統介面盤點」開場句的端點類型數與介面數、「分析流程安排」開場句的 Wave 數，與表格及 Wave 區塊的實際數量一致 | 既有 | 通用 |
| E8 | 目標 spec 的每個 User Story 至少被一個介面的需求依據引用 | 既有 | 通用 |
| E9 | Source Code 樹與 Structure Decision 只使用 techstack.md／research.md 採用的技術 | 既有 | 通用 |
| E10 | 找不到 spec.md 時停止執行、不建立 plan.md，並告知使用者先產出 spec.md | 既有 | 通用 |
| E11 | 目標 spec 目錄沒有 techstack.md 也沒有 research.md 時停止執行、不建立 plan.md，並告知使用者先做技術研究 | 既有 | 通用 |
| E12 | 目標目錄已有 plan.md 時，先詢問並提供覆寫、沿用、停止三個選項；沿用時 plan.md 雜湊不變並直接依它委派；停止時 plan.md 雜湊不變、沒有建立任何 Planner 產出，回報寫明「沒有修改 plan.md、沒有委派任何 Planner」；回覆前不修改 plan.md、不委派 | 本次 | 通用 |
| E13 | Documentation 樹依盤點出的端點類型列出 Planner 的產出：後端列 `contracts/` 與 `openapi.yaml`（有事件傳輸時另列 `asyncapi.yaml`），資料庫列 `data/` 與 `data-model.dbml`，前端列 `ui/` 與 `plan.md`、`index.html`；`ui/` 不列其他 HTML 檔名 | 本次 | 通用 |
| E14 | 盤點沒有某種端點類型時，Documentation 樹不列該類型的產出目錄 | 推定（已確認） | 通用 |
| E15 | Source Code 樹的頂層目錄都對應盤點出的端點類型；技術研究沒有明確要求時，不出現 `shared/` 等不對應端點類型的頂層目錄 | 本次 | 通用 |
| E16 | 回報寫出需求編號查核的方式與結果：實際執行的 `grep` 命令、查核的編號數，以及在目標 spec 找不到的編號（沒有時寫明全部找到） | 本次 | 通用 |
| E17 | plan.md 確定後依 Wave 順序委派：前端交給 `ui-plan`、後端交給 `api-plan`、資料庫交給 `data-plan`；同一個 Wave 的 Planner 以子代理平行執行（在同一則訊息發出），前一個 Wave 的 Planner 都結束後才開始下一個 Wave | 本次 | 通用 |
| E18 | 每份委派內容寫出目標 spec 目錄、負責的介面編號（等於 plan.md 中該端點類型的所有介面）與使用者是否已同意覆寫；給 `ui-plan` 的委派內容另寫出視覺風格的氣質、配色與字體 | 本次 | 通用 |
| E19 | 盤點有前端介面，且使用者沒有指定視覺風格的氣質、配色或字體時，委派前讀取 `clarify` 的 `SKILL.md`，依其 SOP 以 Markdown 表格詢問缺少的項目；不使用 Skill 工具呼叫 `clarify`，也不使用 AskUserQuestion；使用者已指定三項時不詢問 | 本次 | 通用 |
| E20 | 沒有 Planner 的端點類型不委派；整個 Wave 都沒有 Planner 時跳過該 Wave；回報列出這些介面並標「沒有 Planner，未分析」 | 本次 | 通用 |
| E21 | 某個 Planner 依賴前面 Wave 中沒有被分析的端點時，委派內容註明「<介面編號> 未分析，請改依技術研究結果」，回報也列出這個依賴缺口 | 本次 | 通用 |
| E22 | 最後的回報寫出 plan.md 路徑與查核結果、每個 Wave 委派了哪些 Planner 及各自回報的產出路徑；不另寫總彙整檔 | 本次 | 通用 |
| E23 | 委派前，`contracts/`、`data/`、`ui/` 中已有本次要委派的 Planner 會寫入的檔案時，一次列出並詢問是否覆寫；同意時委派內容寫明已同意覆寫；不同意時不委派該 Planner，回報標「使用者未同意覆寫，未委派」 | 推定（已確認） | 通用 |
| E24 | 某個 Planner 停止或沒有產出時，回報列出它的停止原因；後面的 Wave 照常委派，依賴它的委派內容註明該介面沒有產出 | 推定（已確認） | 通用 |
| E25 | 有風格缺口、但專案的 `.agents/skills/clarify/SKILL.md` 與 `.claude/skills/clarify/SKILL.md` 都不存在時，不自行詢問或決定風格，也不委派 `ui-plan`，回報標「專案沒有 clarify，未委派」；其他 Planner 照常委派 | 推定：`ui-plan` 在同樣情況會停止（紀錄 22 E12），委派它只會得到停止；照 E24 的原則讓其他 Planner 繼續 | 通用 |

## 2. To-Be SOP

````markdown
---
name: system-analysis
description: （由 W1 依 skill-form-description 撰寫）已有 spec.md 與技術研究結果、要做系統分析時使用：依 spec 的需求部位盤點這次涉及的系統介面與技術端點類型（前端、後端、資料庫、手機、硬體、雲端第三方等），寫出需求依據，以技術端點為單位、依分析之間的依賴排成可平行分析的 Wave，連同專案結構寫成與 spec.md 同目錄的 plan.md；接著依 Wave 把前端、後端、資料庫介面分別委派給 ui-plan、api-plan、data-plan 平行產出，只負責規劃、委派、追蹤與回報，不另產總彙整。使用者提到 system analysis、系統分析、plan.md、介面盤點、端點盤點、分析流程規劃、Wave、委派 Planner 時使用。只需要單一種端點的產出（UI 雛形、API 合約、資料模型）時改用 ui-plan、api-plan 或 data-plan；只需把功能描述寫成 spec.md 時改用 s-specify；要做技術選型、產出 research.md 或 techstack.md 時改用 technical-research；要規劃類別、先畫類別圖再寫程式時改用 plan-with-class-diagram。
---

# SOP

## Phase 1 -- 收斂分析輸入

1. `READ` 使用者需求，以及專案根目錄下符合 `specs/<三位數編號>-<名稱>/spec.md` 的檔案清單（以 `ls specs/[0-9][0-9][0-9]-*/spec.md` 取得；沒有符合的檔案時清單為空），建立「分析輸入」。
2. `THINK` 決定「目標 spec」：使用者指定 spec.md 路徑或功能目錄時使用該 spec，未指定且清單只有一份時使用該份，其餘情況視為未決定。
3. `CHECK` 「目標 spec」不存在時，告知使用者需要先產出 spec.md（可使用 `s-specify`）並停止執行；清單有多份且使用者未指定時，列出清單請使用者指定並停止執行。
4. `READ` 「目標 spec」全文、同目錄的 `techstack.md` 與 `research.md`（不存在的檔案略過），以及同目錄的檔案清單，加入「分析輸入」。
5. `CHECK` 同目錄的 `techstack.md` 與 `research.md` 都不存在時，告知使用者需要先做技術研究（可使用 `technical-research`）並停止執行。
6. `WRITE` 「目標 spec」所在目錄已有 `plan.md` 時，詢問使用者要覆寫（重新產出 `plan.md`）、沿用（不修改 `plan.md`，直接依它委派 Planner）或停止；沒有時略過本步驟與下一步。
7. `CHECK` 使用者回覆：覆寫時進入 Phase 2；沿用時讀取既有 `plan.md` 的「系統介面盤點」表與「分析流程安排」，分別建立「介面清單」與「Wave 安排」，進入 Phase 4；選擇停止時，回報「沒有修改 plan.md、沒有委派任何 Planner」並停止執行；未回覆時停止執行，不修改 `plan.md`、不委派任何 Planner。

完成條件：「目標 spec」與同目錄的技術研究結果已讀取，且沒有既有 `plan.md`、使用者已同意覆寫，或已沿用既有 `plan.md` 建立「介面清單」與「Wave 安排」；或「目標 spec」不存在、無法確定、缺少技術研究結果，或使用者選擇停止、未回覆，已停止執行。

## Phase 2 -- 盤點系統介面並安排 Wave

1. `READ` 盤點系統介面時，讀取 `rules/系統介面盤點-格式規範.md` 的所有 Rule，建立「介面盤點檢查清單」。
2. `THINK` 依「分析輸入」與已載入的「介面盤點檢查清單」盤點系統介面，只決定介面、端點類型與需求依據，不設計介面內容（例如 API endpoint、資料表欄位、畫面元件）；介面編號以端點類型的英文代號字母開頭（例如前端 `F`、後端 `B`、資料庫 `D`，不同端點類型使用不同字母），同一端點類型內從 1 連續編號，建立「介面清單」。
3. `READ` 安排 Wave 時，讀取 `rules/Wave安排-格式規範.md` 的所有 Rule，建立「Wave 安排檢查清單」。
4. `THINK` 依「介面清單」與已載入的「Wave 安排檢查清單」，安排分析各介面的 Wave，建立「Wave 安排」。

完成條件：「介面清單」與「Wave 安排」已建立。

## Phase 3 -- 產出 plan.md

1. `THINK` 依「分析輸入」與「介面清單」決定專案結構：Documentation 樹以「目標 spec」所在目錄為根，列出目錄中的文件、本次的 `plan.md`，以及「介面清單」中各端點類型的產出（後端列 `contracts/openapi.yaml`，有以 WebSocket、Socket.IO、SSE 或訊息佇列傳輸的後端介面時另列 `contracts/asyncapi.yaml`；資料庫列 `data/data-model.dbml`；前端列 `ui/plan.md` 與 `ui/index.html`，`index.html` 註明是雛形入口、其餘頁面依畫面流程決定），「介面清單」沒有的端點類型不列；Source Code 樹只使用 `techstack.md`／`research.md` 採用的技術，頂層目錄只對應「介面清單」的端點類型，技術研究沒有明確要求時不建立 `shared/` 等不對應端點類型的頂層目錄；兩棵樹的每個檔案與目錄附一句用途註解；Structure Decision 用一段話說明結構選擇及所依據的技術決策，建立「專案結構」。
2. `READ` `templates/plan.md` 與 `templates/plan.example.md`，載入骨架與範例，命名載入結果為「plan 樣板組」。
3. `WRITE` 依「plan 樣板組」將 `plan.md` 寫入「目標 spec」所在目錄，不建立其他檔案：標題填 spec.md 的功能名稱，`Branch` 填該目錄名稱，`Date` 填執行當日日期，`Input` 填「目標 spec」的路徑；專案結構填「專案結構」，系統介面盤點與分析流程安排分別填「介面清單」與「Wave 安排」；開場句的端點類型數、介面數與 Wave 數依實際填入的內容計算；內文使用繁體中文，技術名詞維持原文。
4. `CHECK` 在專案根目錄執行 `grep -oE '(FR|NFR|SC)-[0-9]+' <plan.md 路徑> | sort -u | while read -r id; do grep -q -- "$id" <目標 spec 路徑> && echo "找到 $id" || echo "缺少 $id"; done` 查核 plan.md 引用的需求編號，再執行 `grep -oE 'User Story [0-9]+' <目標 spec 路徑> | sort -u | while read -r _ _ n; do grep -qE "US${n}([^0-9]|$)" <plan.md 路徑> && echo "已引用 US$n" || echo "未引用 US$n"; done` 查核 User Story 涵蓋，將兩個命令與輸出記為「需求編號查核結果」。
5. `CHECK` 逐條驗證「介面盤點檢查清單」與「Wave 安排檢查清單」（需求編號以「需求編號查核結果」判定，不得有「缺少」或「未引用」），比對 `plan.md` 與「plan 樣板組」的標頭與段落結構並確認沒有殘留的 `{{`，確認步驟 1 與步驟 3 的要求均已滿足；未通過時修正 `plan.md` 後重新執行步驟 4 與本步驟，最多 3 輪，第 3 輪仍未通過時將未通過的 Rule 或要求記為「未通過項」。

完成條件：`plan.md` 已寫入「目標 spec」所在目錄，「需求編號查核結果」已記錄，兩份檢查清單與樣板結構已通過或未通過的項目已記為「未通過項」。

## Phase 4 -- 準備委派

1. `THINK` 依「介面清單」與「Wave 安排」建立「委派計畫」：端點類型為前端的介面交給 `ui-plan`、後端交給 `api-plan`、資料庫交給 `data-plan`，每個 Planner 的負責介面為該端點類型在「介面清單」中的所有介面編號；其他端點類型的介面記為「沒有 Planner」；每個 Wave 記下要委派的 Planner，沒有任何 Planner 的 Wave 記為跳過。
2. `READ` 「目標 spec」所在目錄中「委派計畫」各 Planner 會寫入的既有檔案（`ui-plan` 為 `ui/` 下的所有檔案，`api-plan` 為 `contracts/openapi.yaml` 與 `contracts/asyncapi.yaml`，`data-plan` 為 `data/data-model.dbml`；不存在的略過），依 Planner 建立「既有產出」。
3. `WRITE` 「既有產出」不為空時，依 Planner 一次列出這些檔案，詢問使用者各 Planner 是否同意覆寫；為空時略過本步驟與下一步。
4. `CHECK` 使用者回覆：同意覆寫的 Planner 在「委派計畫」記為已同意覆寫；不同意的 Planner 從「委派計畫」移除並記為「使用者未同意覆寫，未委派」，移除後沒有任何 Planner 的 Wave 記為跳過；未回覆時停止執行，回報 `plan.md` 路徑與沒有委派任何 Planner。
5. `THINK` 「委派計畫」有 `ui-plan` 時，依「分析輸入」判斷使用者需求是否已指定視覺風格的氣質、配色與字體：三項都已指定時記為「視覺風格」，有未指定的項目時列為「風格缺口」；沒有 `ui-plan` 時略過本步驟與下兩步。
6. `DELEGATE` 「風格缺口」不為空時，讀取專案根目錄的 `.agents/skills/clarify/SKILL.md`（不存在時改讀 `.claude/skills/clarify/SKILL.md`）並依其 SOP 執行，不使用 Skill 工具呼叫 `clarify`，以「風格缺口」為優先提問面向、不要求詳記問答紀錄，取得使用者確認的項目，與已指定的項目合併為「視覺風格」；「風格缺口」為空，或兩個 `SKILL.md` 都不存在時，略過本步驟。
7. `CHECK` 「風格缺口」不為空且兩個 `SKILL.md` 都不存在時，將 `ui-plan` 從「委派計畫」移除並記為「專案沒有 clarify，未委派」，移除後沒有任何 Planner 的 Wave 記為跳過；使用者未回覆或 `clarify` 停止時，停止執行，回報 `plan.md` 路徑與沒有委派任何 Planner；「視覺風格」的氣質、配色與字體都已確定時進入 Phase 5。

完成條件：「委派計畫」已決定每個 Wave 要委派的 Planner、負責介面與覆寫同意，有 `ui-plan` 時「視覺風格」已確定；或使用者未回覆、`clarify` 停止，已停止執行並回報。

## Phase 5 -- 依 Wave 委派並回報

1. `DELEGATE` 依「Wave 安排」的順序取下一個未處理的 Wave，記為跳過的 Wave 直接標為已處理；其餘 Wave 為「委派計畫」中的每個 Planner 各開一個子代理，同一個 Wave 的子代理在同一則訊息中平行發出，委派內容寫明：使用的 Planner Skill、目標 spec 目錄、負責介面編號、使用者已同意覆寫（只在已同意時寫）、`ui-plan` 的「視覺風格」氣質、配色與字體，以及這個 Wave 的「依賴」提到的前面 Wave 介面中，記為「沒有 Planner」、未委派或未完成者，逐一註明「<介面編號> 未分析，請改依技術研究結果」。
2. `CHECK` 等這個 Wave 的子代理都結束後，記下每個 Planner 回報的產出路徑；Planner 停止或沒有產出時，記下停止原因並將它的負責介面記為未完成；還有未處理的 Wave 時返回步驟 1，全部處理完時進入步驟 3。
3. `WRITE` 向使用者回報，不另寫彙整檔：`plan.md` 路徑（本次產出時另附各端點類型的介面數、每個 Wave 涵蓋的端點類型、逐字列出 Phase 3 步驟 4 執行的兩個命令，以及查核的編號數與「缺少」「未引用」的項目、「未通過項」，沒有時說明全部通過；沿用時註明沿用既有 `plan.md`）；每個 Wave 委派的 Planner 與各自回報的產出路徑；標為「沒有 Planner，未分析」的介面；未委派或未完成的 Planner 與原因；委派內容中註明的依賴缺口。

完成條件：每個 Wave 都已處理，已委派的 Planner 都已結束，且已向使用者回報 `plan.md`、各 Planner 的產出路徑、未分析的介面與依賴缺口。
````

## 3. 差異表

### 刪除

| 元素 | 位置 | 理由 |
| ---- | ---- | ---- |
| P3-5 回報步驟 | Phase 3 步驟 5 | 回報內容改由 P5-3 在委派結束後一次回報（E16、E22）；原 P3-5 的回報項目 C18 改換存放位置到 P5-3，保留此步驟會在委派前就結束回合 |
| P3-4 括號內的「需求編號以 `grep` 在『目標 spec』中查核」 | Phase 3 步驟 4 | R2：方法只寫在括號內無法檢查，改由新的 P3-4 寫出具體命令並記錄結果（C20），P3-5 只引用「需求編號查核結果」 |
| 範例的照片相簿情境 | `templates/plan.example.md` | 已由 `artifact-to-skill-engineering` 以使用者定稿的電商範例取代（雜湊 `a7fdbd57…433bd`），本藍圖不施工 |

### 修改、合併、改換存放位置與新增

| 元素 | 動作 | 內容 | 追溯 |
| ---- | ---- | ---- | ---- |
| frontmatter `description` | 修改 | 刪除「只做規劃，不做各介面的實際分析」，改為規劃後依 Wave 委派三個 Planner、只負責規劃委派追蹤與回報；觸發關鍵字加「委派 Planner」；分流加「只需要單一種端點的產出時改用 ui-plan、api-plan 或 data-plan」 | R3；E6、E17 |
| P1-6、P1-7 覆寫確認 | 修改 | 兩個選項改為覆寫／沿用／停止；沿用時讀取既有 plan.md 建立「介面清單」與「Wave 安排」並跳到 Phase 4；停止時固定回報「沒有修改 plan.md、沒有委派任何 Planner」 | R3；E12（C5） |
| Phase 1 完成條件 | 修改 | 加入沿用與選擇停止的結果 | E12 |
| P3-1 專案結構 | 修改 | Documentation 樹加入各端點類型的產出與不列缺少的端點類型；Source Code 樹的頂層目錄只對應端點類型、不建 `shared/` | R1；E13–E15（C15、C19） |
| P3-4 需求編號查核 | 新增 | 寫出 FR／NFR／SC 存在查核與 User Story 涵蓋查核兩個 `grep` 命令，結果記為「需求編號查核結果」。新增前的考量：刪除不適用（E16 需要查核結果）；改寫原 P3-4 括號內的方法會讓同一步驟同時執行命令與逐條驗證兩件事，命令結果無法被 P5-3 唯一引用；改換存放位置到腳本不適用（施工委派 Rule 2：既有工具的單一命令必須寫在步驟內文） | R2；E3、E8、E16（C20） |
| P3-5 驗證（原 P3-4） | 修改 | 需求編號改以「需求編號查核結果」判定；驗證範圍加入步驟 1 的要求；重試時連同步驟 4 一起重跑 | R1、R2；E13–E16（C17） |
| Phase 3 完成條件 | 修改 | 刪除「已向使用者回報」，加入「需求編號查核結果已記錄」 | R2；E16 |
| Phase 4 -- 準備委派（P4-1～P4-7） | 新增 | 建立委派計畫（端點對應 Planner、跳過沒有 Planner 的 Wave）；檢查 Planner 既有產出並一次詢問覆寫；有 `ui-plan` 且沒指定風格時讀取 `clarify` 的 `SKILL.md` 詢問；沒有 `clarify` 時不委派 `ui-plan`。新增前的考量：As-Is 沒有任何委派相關內容可刪除、改寫或改換存放位置 | R3；E17–E20、E23、E25（C21–C24） |
| Phase 5 -- 依 Wave 委派並回報（P5-1～P5-3） | 新增 | 依 Wave 順序平行委派、記錄產出與停止、彙整回報。新增前的考量同上；回報步驟由原 P3-5 改換存放位置併入 P5-3 | R3；E6、E16、E17、E18、E20–E22、E24（C18、C25–C28） |
| P5-3 回報的需求編號查核項目 | 修改（R4 階段） | 「『需求編號查核結果』的命令」改為「逐字列出 Phase 3 步驟 4 執行的兩個命令」 | R4；E16（C18） |
| `LICENSE`（Skill 目錄） | 修改 | 第 1 點刪除「以及照片相簿範例情境」，改註明 `templates/plan.example.md` 的購物車與結帳情境為自行撰寫；Spec-Kit 衍生的標頭與 Project Structure 段落結構仍保留於骨架與範例，MIT 全文保留；根目錄 `LICENSE` 的授權範圍不變 | 專案 CLAUDE.md 規則 3 |

### 保留

| 元素 | 追溯 | 約束 |
| ---- | ---- | ---- |
| P1-1～P1-5 | E10、E11；必要流程（決定輸入） | C2、C3、C4 |
| Phase 2（P2-1～P2-4）與完成條件 | E2–E5、E7、E8 | C6–C11 |
| P3-2 載入樣板組 | E1 | C1 |
| P3-3 寫入 plan.md | E1、E6、E7 | C12、C13、C14、C16 |
| `rules/系統介面盤點-格式規範.md` Rule 1～2 | E2、E3、E8 | C6、C7 |
| `rules/Wave安排-格式規範.md` Rule 1～2 | E4、E5 | C9、C10 |
| `templates/plan.md` 與 `templates/plan.example.md` | E1、E13–E15（範例已依本次需求定稿） | C1 |

## 4. 淨增減

| 項目 | As-Is | To-Be | 增減 |
| ---- | ----- | ----- | ---- |
| Phase | 3 | 5 | +2 |
| 步驟 | 16 | 26 | +10 |
| RuleFile | 2 | 2 | 0 |
| Rule | 4 | 4 | 0 |
| 樣板組 | 1 | 1 | 0 |
| 腳本 | 0 | 0 | 0 |

- 增加的 2 個 Phase 與 10 個步驟都來自 R3 缺少的委派階段（E17–E24）：Phase 4 有三個獨立的使用者互動（覆寫 Planner 既有產出、視覺風格、沒有 `clarify` 的處理），必須在第一個子代理發出前完成，因為 Planner 以子代理執行時無法轉問使用者；Phase 5 只有委派、檢查與回報三步。Phase 3 淨增 0（新增 P3-4 查核命令，刪除原 P3-5 回報）。
- 不新增 RuleFile：委派計畫、既有產出路徑與委派內容欄位都是機械對應，一句話可表達，不需要正反例；風格提問的判斷由 `clarify` 本身的 RuleFile 負責。
- 不新增腳本：需求編號查核是 `grep` 管線，屬於既有工具的單一命令，寫在 P3-4 內文；委派與等待由 agent 的子代理工具完成。

## 5. 約束分配表

| 編號 | 約束 | 所屬步驟 | 存放位置 | 理由 |
| ---- | ---- | -------- | -------- | ---- |
| C1 | plan.md 的標頭欄位、`Project Structure` 與 `分析流程規劃` 的段落結構、盤點表表頭與兩句開場句（既有，不變） | P3-3 | plan 樣板組 | 約束整份產出檔案的結構；結構由樣板固定，不需腳本計算 |
| C2 | 決定目標 spec 的規則（既有，不變） | P1-2 | P1-2 步驟內文 | 只屬於單一步驟，一句話即可表達 |
| C3 | 目標 spec 不存在或無法確定時停止（既有，不變） | P1-3 | SOP 流程 | 屬於分支與停止 |
| C4 | techstack.md 與 research.md 都不存在時停止（既有，不變） | P1-5 | SOP 流程 | 屬於分支與停止 |
| C5 | 已有 plan.md 時詢問覆寫／沿用／停止，沿用時直接進入委派，停止時回報「沒有修改 plan.md、沒有委派任何 Planner」（修改） | P1-6、P1-7 | SOP 流程 | 屬於使用者確認閘門與 Phase 轉移 |
| C6 | 介面從需求部位切出並歸類端點類型（既有，不變） | P2-2 | `rules/系統介面盤點-格式規範.md` Rule 1 | 需要語意判斷與正反例 |
| C7 | 需求依據可追溯並涵蓋所有 User Story（既有，不變） | P2-2 | `rules/系統介面盤點-格式規範.md` Rule 2 | 需要語意判斷與正反例；與 C6 同主題 |
| C8 | 介面編號規則（既有，不變） | P2-2 | P2-2 步驟內文 | 一句話即可表達，屬機械規則 |
| C9 | Wave 以技術端點為單位並依依賴排序（既有，不變） | P2-4 | `rules/Wave安排-格式規範.md` Rule 1 | 需要判斷依賴與正反例 |
| C10 | Wave 區塊寫法與 Sub-agent 數（既有，不變；Sub-agent 數依端點類型計數） | P2-4 | `rules/Wave安排-格式規範.md` Rule 2 | 區塊填位符號無法保證欄位；需要正反例 |
| C11 | 只決定介面、端點類型與需求依據，不設計介面內容（既有，不變） | P2-2 | P2-2 步驟內文 | 一句話即可表達 |
| C12 | P3-3 只寫入 plan.md，不建立其他檔案（既有，不變） | P3-3 | P3-3 步驟內文 | 一句話即可表達 |
| C13 | 開場句的數字依實際內容計算（既有，不變） | P3-3 | P3-3 步驟內文 | 填值規則只屬於寫入步驟 |
| C14 | 標頭填值（既有，不變） | P3-3 | P3-3 步驟內文 | 填值來源只屬於寫入步驟 |
| C15 | Documentation 樹：目錄中的文件、plan.md，以及各端點類型的產出目錄與檔案（後端 `contracts/openapi.yaml`，有事件傳輸時加 `asyncapi.yaml`；資料庫 `data/data-model.dbml`；前端 `ui/plan.md` 與 `ui/index.html`），沒有的端點類型不列；每個檔案與目錄附用途註解；Structure Decision 說明依據（修改） | P3-1 | P3-1 步驟內文 | 樣板以 `{{DOCUMENTATION_TREE}}` 區塊填位符號表示，無法逐項保證；產出清單是固定對應，一句話可列完，不需正反例；腳本無法判斷哪些既有文件要附什麼註解 |
| C16 | 內文繁體中文，技術名詞維持原文（既有，不變） | P3-3 | P3-3 步驟內文 | 一句話即可表達 |
| C17 | 驗證最多 3 輪，重試時連同查核命令重跑，仍未通過記為「未通過項」（修改：加入重跑查核） | P3-5 | SOP 流程 | 屬於執行順序與停止條件 |
| C18 | 回報內容：plan.md 路徑與介面數、Wave 端點類型、需求編號查核結果、未通過項；各 Wave 的 Planner 與產出路徑；沒有 Planner 的介面；未委派或未完成的 Planner；依賴缺口；不另寫彙整檔（修改並改換存放位置：P3-5 → P5-3） | P5-3 | P5-3 步驟內文 | 只屬於回報步驟；項目是固定清單，不需正反例 |
| C19 | Source Code 樹只使用採用的技術，頂層目錄只對應端點類型，技術研究沒有明確要求時不建 `shared/`（修改：自 C15 拆出並加入 `shared/` 界線） | P3-1 | P3-1 步驟內文 | 判斷依據是「介面清單」的端點類型與技術研究，一句話可表達；與 C15 的存放判斷相同，但涉及不同的樹，依約束分配 Rule 1 拆開以便追溯；樣板只以區塊填位符號固定位置 |
| C20 | 需求編號查核以兩個具體 `grep` 命令執行，命令與輸出記為「需求編號查核結果」（新增） | P3-4 | P3-4 步驟內文 | 既有工具的單一命令即可完成，依約束分配 Rule 2 必須寫在步驟內文，不另建腳本 |
| C21 | 端點類型對應 Planner（前端 `ui-plan`、後端 `api-plan`、資料庫 `data-plan`），負責介面為該端點類型的所有介面，其他端點類型記為「沒有 Planner」，沒有 Planner 的 Wave 跳過（新增） | P4-1 | P4-1 步驟內文 | 固定對應，一句話可表達；腳本需要解析 plan.md 的自然語言表格，收益低於成本；不需正反例 |
| C22 | 各 Planner 會寫入的既有檔案位置（新增） | P4-2 | P4-2 步驟內文 | 固定路徑清單，一句話可表達；與三個 Planner 自己的覆寫閘門檢查的位置相同 |
| C23 | 既有產出依 Planner 一次詢問覆寫，不同意時不委派並記為「使用者未同意覆寫，未委派」（新增） | P4-3、P4-4 | SOP 流程 | 屬於使用者確認閘門與分支 |
| C24 | 視覺風格判斷三項、依 `clarify` 的 `SKILL.md` 詢問且不用 Skill 工具、沒有 `clarify` 時不委派 `ui-plan`（新增） | P4-5～P4-7 | 判斷與讀取路徑在 P4-5、P4-6 步驟內文；沒有 `clarify` 與未回覆的分支在 SOP 流程（P4-7） | 判斷與路徑各一句話；`clarify` 的提問格式由 `clarify` 的 RuleFile 與樣板負責，不重述；分支屬於流程 |
| C25 | 依 Wave 順序委派，同 Wave 的子代理在同一則訊息平行發出，該 Wave 都結束後才進下一個 Wave（新增） | P5-1、P5-2 | SOP 流程 | 屬於執行順序 |
| C26 | 委派內容欄位：Planner Skill、目標 spec 目錄、負責介面、已同意覆寫、`ui-plan` 的視覺風格（新增） | P5-1 | P5-1 步驟內文 | 固定欄位清單，一句話可表達；委派內容不是產出檔案，不適用樣板組 |
| C27 | 依賴缺口：這個 Wave「依賴」提到的前面 Wave 介面中，沒有 Planner、未委派或未完成者，註明「<介面編號> 未分析，請改依技術研究結果」（新增） | P5-1 | P5-1 步驟內文 | 判斷範圍以 plan.md 的「依賴」為準，一句話可表達 |
| C28 | Planner 停止或沒有產出時記下原因、負責介面記為未完成，其他 Wave 照常處理（新增） | P5-2 | SOP 流程 | 屬於分支與執行順序 |

## 6. 施工工作項

| 順序 | 工作項 | 執行者 | 目標 | 內容 | 約束 | 狀態 |
| ---- | ------ | ------ | ---- | ---- | ---- | ---- |
| 1 | W1 | `skill-form-description` | `.agents/skills/system-analysis/SKILL.md` frontmatter | 修改 `description` | 無（只概述用途、觸發與分流） | 已完成 |
| 2 | W2 | `skill-form-sop` | `.agents/skills/system-analysis/SKILL.md` SOP | 寫入 To-Be SOP（本次沒有抽取工作項，胖 SOP 即 To-Be SOP） | C2–C5、C8、C11–C28 | 已完成 |
| 3 | W3 | `skill-engineering` 直接撰寫 | `.agents/skills/system-analysis/LICENSE` | 更新衍生內容說明 | 無（非 Skill 部位） | 已完成 |
| 4 | W4 | `skill-form-sop` | `.agents/skills/system-analysis/SKILL.md` Phase 5 -- 依 Wave 委派並回報的 `WRITE` 回報步驟 | 依 R4 改寫需求編號查核的回報項目 | C18 | 已完成 |

### 工作項內容

#### W1：frontmatter

- `name: system-analysis`（不變）。
- `description`：已有 spec.md 與技術研究結果、要做系統分析時使用：依 spec 的需求部位盤點這次涉及的系統介面與技術端點類型（前端、後端、資料庫、手機、硬體、雲端第三方等），寫出需求依據，以技術端點為單位、依分析之間的依賴排成可平行分析的 Wave，連同專案結構寫成與 spec.md 同目錄的 plan.md；接著依 Wave 把前端、後端、資料庫介面分別委派給 `ui-plan`、`api-plan`、`data-plan` 平行產出，只負責規劃、委派、追蹤與回報，不另產總彙整。觸發關鍵字：system analysis、系統分析、plan.md、介面盤點、端點盤點、分析流程規劃、Wave、委派 Planner。分流：只需要單一種端點的產出（UI 雛形、API 合約、資料模型）時改用 `ui-plan`、`api-plan` 或 `data-plan`；只需把功能描述寫成 spec.md 時改用 `s-specify`；要做技術選型、產出 research.md 或 techstack.md 時改用 `technical-research`；要規劃類別、先畫類別圖再寫程式時改用 `plan-with-class-diagram`。
- 依專案慣例，未經使用者實際驗證前，`description` 開頭加「（未驗證）」。
- 不加 `disable-model-invocation`。

#### W2：SOP

- 以第 2 節 To-Be SOP 的 `# SOP` 全文取代目前的 `# SOP`。本次沒有新增或抽取部位，胖 SOP 即 To-Be SOP；保留的既有載入步驟（P2-1、P2-3、P3-2）原文不變。
- 施工後 `SKILL.md` 的 `# SOP` 必須與第 2 節逐字相同。

#### W4：P5-3 回報項目（R4 階段）

- 目標步驟：Phase 5 -- 依 Wave 委派並回報的 `WRITE` 步驟（「向使用者回報，不另寫彙整檔」）。
- 將「『需求編號查核結果』的命令、查核的編號數與『缺少』『未引用』的項目」改為「逐字列出 Phase 3 步驟 4 執行的兩個命令，以及查核的編號數與『缺少』『未引用』的項目」，其餘文字不變。施工後 `SKILL.md` 的 `# SOP` 必須與第 2 節 To-Be SOP 逐字相同。

#### W3：LICENSE

- `.agents/skills/system-analysis/LICENSE` 第 1 點改為：`templates/plan.md` 與 `templates/plan.example.md` 的 plan.md 標頭（Branch／Date／Spec／Input）與 Project Structure 段落結構（Documentation、Source Code、Structure Decision）衍生自 GitHub Spec Kit；範例刪除了 Summary、Technical Context、Constitution Check、Complexity Tracking 段落；範例的「購物車與結帳」情境、「分析流程規劃」段落、本 Skill 的 SOP 與 RuleFile 為重新撰寫，未直接複製上述專案的檔案。MIT 全文保留。
- 根目錄 `LICENSE` 的授權範圍不變（仍含 Spec Kit 衍生內容）。

## 7. 驗收情境

驗收以 Herdr 在新 pane 啟動頂層 `claude --model sonnet`（Sonnet 5.5、effort medium）執行：S1–S5 會開子代理委派 Planner，子代理不能再開子代理，所以不使用 Agent 工具驗收。每個情境一個暫存專案，`.claude/skills/` 放修改後的 `system-analysis`、`api-plan`、`data-plan`、`ui-plan`、`clarify`，`git init` 後提交初始狀態；指示中不提 `clarify` 的存在或位置。素材避開電商情境：1A2B 沿用本 repo 的 `specs/001-online-pvp-1a2b/spec.md`，techstack／research 依紀錄 18、20 重建；健身房預約 spec 依紀錄 16、18 重建。主代理以 `git status`、雜湊、子代理工具呼叫紀錄（`~/.claude/projects/<暫存專案>/*.jsonl` 的 `tool_use`）與 Planner 的檢查腳本複查。

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1–E4、E6–E9、E13、E15–E19、E22 | 本次 | `specs/001-online-pvp-1a2b/` 含 spec.md、techstack.md 與 research.md（React＋Vite、Express REST、Socket.IO、PostgreSQL 保存進行中的對局），沒有 plan.md。輸入：「/system-analysis specs/001-online-pvp-1a2b」 | 風格提問時依推薦選項作答 | plan.md 符合 E1–E4、E7–E9；Documentation 樹列 `contracts/openapi.yaml`、`contracts/asyncapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`，`ui/` 沒有其他檔名；Source Code 頂層只有前後端對應的目錄、沒有 `shared/`；風格提問前有讀取 `clarify/SKILL.md`、提問為 Markdown 表格，沒有 `Skill(clarify)` 與 `AskUserQuestion`；Wave 1 只委派 `ui-plan`，Wave 2 的 `api-plan` 與 `data-plan` 在同一則訊息發出，且在 Wave 1 子代理結束後；委派內容含目標目錄、介面編號、三項風格；`contracts/`、`data/`、`ui/` 都有產出；回報含 `grep` 命令與查核結果、各 Planner 產出路徑；`git status` 只有 plan.md 與三個產出目錄 |
| S2 | E2–E5、E18、E20–E22 | 本次 | `specs/002-gym-class-booking/` 含健身房課程預約 spec（綠界 ECPay 金流、LINE 通知）與 techstack.md（Express REST、MySQL），沒有 plan.md。輸入：「幫我替 specs/002-gym-class-booking 做系統分析，前端風格：清爽運動感、白底配螢光綠、無襯線字體」 | 無 | 沒有出現風格提問；`ui-plan` 的委派內容含指定的三項風格；金流與通知介面沒有被委派，回報標「沒有 Planner，未分析」；Wave 2 的委派內容註明金流（與通知，若在依賴中）「未分析，請改依技術研究結果」，回報列出依賴缺口；Wave 標題的 Sub-agent 數等於端點類型數 |
| S3 | E1、E6、E13、E14、E23、E24 | 本次 | `specs/001-online-pvp-1a2b/` 含 spec.md、techstack.md、research.md（狀態只放記憶體，沒有資料庫），另有既有 `ui/index.html`（記錄雜湊），沒有 plan.md。輸入同 S1 | 詢問覆寫既有產出時回覆「ui 不要覆寫」 | Documentation 樹沒有 `data/`；沒有委派 `data-plan`；覆寫詢問列出 `ui/index.html`；沒有委派 `ui-plan`，`ui/index.html` 雜湊不變；回報標 `ui-plan`「使用者未同意覆寫，未委派」；Wave 2 的 `api-plan` 委派內容註明前端介面未分析；`contracts/` 有產出 |
| S4 | E12、E17 | 本次 | 同 S3 但沒有 `ui/`，另有既有 plan.md（只含後端 B1–B2 一個 Wave，記錄雜湊）。輸入同 S1 | 三選項時回覆「沿用」 | 有覆寫／沿用／停止三選項；plan.md 雜湊不變；只委派 `api-plan`，負責介面為 B1、B2；回報註明沿用既有 plan.md |
| S5 | E12 | 本次 | 同 S4。輸入同 S1 | 三選項時回覆「停止」 | plan.md 雜湊不變；沒有 `contracts/`、`data/`、`ui/`；回報含「沒有修改 plan.md、沒有委派任何 Planner」；`git status` 為空 |
| S6 | E25 | 本次 | 同 S1，但專案沒有 `clarify`（兩個 skills 目錄都沒有）。輸入同 S1 | 無 | 沒有風格提問、沒有 `AskUserQuestion`；沒有委派 `ui-plan`，回報標「專案沒有 clarify，未委派」；`api-plan`、`data-plan` 照常委派 |
| S7 | E10、E11 | 回歸 | P1-1～P1-5 本次沒有修改，以逐步演練驗證：沒有 `specs/` 的專案，以及只有 spec.md、沒有技術研究結果的專案 | 無 | 演練停在 P1-3 並提到 `s-specify`，或停在 P1-5 並提到 `technical-research`；兩者都不建立 plan.md |

- 呼叫者回歸：結構診斷的 `callers` 為空，沒有直接呼叫者需要回歸情境。被委派的三個 Planner 與 `clarify` 不修改，S1–S3 同時驗證它們接收委派內容的行為。

## 8. 驗收結果

- 施工：W1–W4 已完成。W1 依 `skill-form-description` 規則改寫 description（509 字元，觸發演練 6 則都符合預期）；W2 以 To-Be SOP 取代 `# SOP`；W3 更新 Skill 目錄 `LICENSE`；W4（R4 階段）由主代理依 `skill-form-sop` 規則直接改寫 P5-3 的一句，未另外載入該 Skill。施工後 `SKILL.md` 的 `# SOP` 與第 2 節 To-Be SOP 逐字相同；範例雜湊仍為 `a7fdbd57…433bd`；骨架不變。
- 施工後結構診斷：`audit_skill.py` 對 `system-analysis` 為 0 error、0 warning；兩份 RuleFile 由 P2-1、P2-3 載入，樣板組由 P3-2 載入。
- 同步：`./scripts/sync-skills.sh --from agents` 成功，`--check` 為「兩邊一致」；同步輸出沒有只存在於目標端、未被刪除的 Skill。
- 驗收方式：每個情境一個 scratchpad 暫存專案（`.claude/skills/` 放修改後的 `system-analysis` 與 `api-plan`、`data-plan`、`ui-plan`，S6 以外另放 `clarify`；`git init` 後提交初始狀態）。以 Herdr 在新 pane 啟動頂層 `claude --model sonnet`（Claude Code v2.1.312、Sonnet 5.5、effort medium、auto mode），信任資料夾由主代理選 Yes；指示中不提 `clarify`。預先回覆由主代理在確認閘門出現時輸入。主代理另以 `git status`、雜湊、測試 session 對話紀錄的 `tool_use`（Agent 呼叫的 message id 判斷是否同一則訊息、時間戳判斷 Wave 順序）與獨立腳本（骨架實例比對、開場句數字、Wave 歸屬與 Sub-agent 數、需求編號存在、US 涵蓋、Source Code 頂層目錄）複查。素材：1A2B 用本 repo 的 spec，PostgreSQL 版 techstack／research 沿用紀錄 20 的素材，記憶體版由主代理改寫 research §4 與 techstack；健身房預約沿用紀錄 18 的素材（只有 techstack，沒有 research）。
- S1 通過：plan.md 骨架比對通過、27 個編號都存在、US1–US3 都引用；Documentation 樹列 `contracts/openapi.yaml`、`asyncapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`；頂層只有 `frontend/`、`backend/`。委派前 `ls` 兩個 `clarify/SKILL.md` 位置並讀取 `.claude/skills/clarify/SKILL.md`，以 Markdown 表格問氣質、配色、字體，沒有 `Skill(clarify)` 與 `AskUserQuestion`；Wave 1 只委派 `ui-plan`（含三項風格），Wave 2 的 `api-plan`、`data-plan` 在同一則訊息（同一 message id）發出，時間在 `ui-plan` 結束後；三種產出都存在；回報逐字列出兩個 `grep` 命令與查核結果；`git status` 只有 plan.md 與三個產出目錄。
- S2 第 1 輪：E16 不通過（回報只寫「我用 grep 檢查」，沒有列出命令），其餘通過，根因 R4。S2r（W4 施工後重跑）通過：沒有風格提問，`ui-plan` 委派內容含指定的三項風格；P1 金流、L1 LINE 沒有委派，回報標「沒有 Planner，未分析」，`api-plan`、`data-plan` 的委派內容註明「P1、L1 未分析，請改依技術研究結果」；Wave 2 兩個 Planner 同一則訊息發出；Wave 標題 Sub-agent 數等於端點類型數；回報逐字列出兩個命令。第 1 輪另把排程盤成獨立端點並以 Wave 3 跳過（E20 的跳過路徑）。
- S3 第 1 輪：E16 不通過（同 S2），其餘通過：Documentation 樹沒有 `data/`、沒有委派 `data-plan`；委派前以選單列出 `ui/index.html` 詢問覆寫，回覆不同意後沒有委派 `ui-plan`、沒有風格提問，`ui/index.html` 雜湊 `16ec8902…` 不變；`api-plan` 委派內容註明 F1–F4 未分析；回報標 `ui-plan` 未委派與原因。S3r（W4 施工後重跑）通過 E16；`ui/index.html` 雜湊不變、只委派 `api-plan`。
- S4 通過：三選項出現；選「沿用」後 plan.md 雜湊 `c449d2c1…` 不變；只委派 `api-plan`，負責介面 B1、B2；回報註明沿用既有 plan.md、未重新查核。
- S5 通過：選「停止」後回報「沒有修改 `plan.md`，也沒有委派任何 Planner」；plan.md 雜湊不變，`git status` 為空。
- S6 通過：`ls` 兩個 `clarify/SKILL.md` 位置都不存在；沒有風格提問、沒有 `AskUserQuestion`；沒有委派 `ui-plan`，回報說明原因是沒有指定風格且專案沒有 `clarify`；`api-plan` 照常委派並註明 F1–F4 未分析。
- S7 通過（逐步演練）：P1-1～P1-5 與紀錄 16 已驗證的版本逐字相同；沒有 `specs/` 時停在 P1-3 並提示 `s-specify`，只有 spec.md 時停在 P1-5 並提示 `technical-research`，都不建立 plan.md。
- 未覆蓋：E24 的「Planner 停止或沒有產出」分支沒有被觸發（所有已委派的 Planner 都有產出）；只驗證了共用同一處理方式的「未委派」路徑（S3、S6）。
- 觀察（未修改 Skill）：
  - S3r 把覆寫詢問（P4-3）與三題風格（P4-6）合在同一輪問，沒有等覆寫回覆後才判斷是否需要問風格；第 7 節 S3 的判斷方式原有「沒有風格提問」，沒有對應的驗收條件，違反驗收條件 Rule 4；使用者回覆「都照建議」選 A：刪除該判斷項目，只記為觀察，不修改 Skill（影響只是多問一輪，第 1 輪 S3 有依序詢問）。
  - S4 的回報是英文；Skill 只規定 plan.md 內文使用繁體中文，沒有規定回報語言。其他情境都以繁體中文回報。
  - 委派內容的寫法各 session 不同（有的另附前面 Wave 的產出路徑、平行 Planner 不必等待等說明），都包含 E18 要求的欄位。
- 個案驗收條件：無。

### 使用者實際驗證（2026-10-28）

- 方式：以 `user-verify-skill` 在 scratchpad 建暫存專案 `uv-system-analysis`（`.claude/skills/` 放 `system-analysis`、`api-plan`、`data-plan`、`ui-plan`、`clarify`，`.claude/` 加入 `.git/info/exclude`；測試素材為使用者指定的 1A2B PostgreSQL 版 spec.md、techstack.md、research.md，不放 plan.md），以 Herdr 在新 pane 啟動 `claude --model sonnet`（Claude Code v2.1.312、Sonnet 5.5、effort medium、auto mode）。實跑需求以自然語言送出、不指名 Skill：「specs/001-online-pvp-1a2b 的 spec 和技術研究都做完了，幫我做系統分析，各介面的分析也一起做完。」
- 權限處理：信任資料夾由使用者回答 Yes，執行者代為輸入；之後沒有出現權限確認，執行者沒有代為放行任何項目。
- 結果（第 1 輪）：測試 session 第一個動作即自行呼叫 `system-analysis`（自動觸發成功）。寫入 plan.md 後讀取 `.claude/skills/clarify/SKILL.md`，以 Markdown 表格問氣質、配色、字體三題，沒有 `Skill(clarify)` 與 `AskUserQuestion`；使用者參考課程第三章第 14 單元選「1、1、1」（輕鬆休閒、藍紫主色加暖黃強調、無襯線體搭配等寬數字）。之後 Wave 1 委派 `ui-plan`（F1–F3，含三項風格），結束後 Wave 2 的 `api-plan`（B1–B3）與 `data-plan`（D1–D2）在同一則訊息平行發出。產出 plan.md（3 種端點、8 個介面、2 個 Wave）、`contracts/openapi.yaml`、`contracts/asyncapi.yaml`、`data/data-model.dbml`、`ui/plan.md` 與 `index.html`、`room.html`、`battle.html`。執行者複查：plan.md 骨架比對通過、27 個編號都存在、US1–US3 都引用、頂層只有 `frontend/`、`backend/`；`check_contracts.py`、`check_data_model.py`、`check_ui.py` 重跑皆 `issues: []`；以 `agent-browser` 打開 3 頁截圖，沒有 JS 錯誤。回報逐字列出兩個 `grep` 命令。對照通用驗收條件：E1–E9、E13、E15–E19、E22 符合；E10–E12、E14、E20、E21、E23–E25 本輪未觸及，已由 S2–S7 驗證。
- 結果（風格回饋）：使用者 Review plan.md 系統介面盤點、OpenAPI、DBML 與 HTML 雛形後，在同一個測試 session 送出「把 UI 雛形改成 Minecraft 風格」。`ui/` 的 3 頁與 `ui/plan.md` 第 2 節都更新（雜湊比對），plan.md、`contracts/`、`data/` 雜湊不變；3 頁截圖呈現泥土棕底、草地綠、像素字體。測試 session 沒有重新委派 `ui-plan`，直接改 HTML，3 頁都加入 Google Fonts 的 `<link>`，`check_ui.py` 回報「引用外部資源」。
- 觀察：風格回饋發生在 `system-analysis` 回報完成之後，不在本 Skill 的驗收條件與 SOP 範圍內；外部字型違反的是 `ui-plan` 的單一檔案規則，記入 `docs/待確認.md` 第 9 項。`room.html` 右上角「1／2 位玩家」灰字壓棕底，對比偏低。`api-plan` 自行訂暱稱上限 12 字與 `room:closed` 的兩種原因，已在回報中提示使用者。
- 結論：使用者判定通過，移除 `description` 開頭的「（未驗證）」，其餘文字不變。測試 pane 與暫存專案（含 Phase 5 驗收用的 `acc/`）已移除。
