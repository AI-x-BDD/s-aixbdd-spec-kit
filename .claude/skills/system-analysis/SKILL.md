---
name: system-analysis
description: 已有 spec.md 與技術研究結果、要做系統分析時使用：依 spec 的需求部位盤點這次涉及的系統介面與技術端點類型（前端、後端、資料庫、手機、硬體、雲端第三方等），寫出需求依據，以技術端點為單位、依分析之間的依賴排成可平行分析的 Wave，連同專案結構寫成與 spec.md 同目錄的 plan.md；接著依 Wave 把前端、後端、資料庫介面分別委派給 ui-plan、api-plan、data-plan 平行產出，只負責規劃、委派、追蹤與回報，不另產總彙整。使用者提到 system analysis、系統分析、plan.md、介面盤點、端點盤點、分析流程規劃、Wave、委派 Planner 時使用。只需要單一種端點的產出（UI 雛形、API 合約、資料模型）時改用 ui-plan、api-plan 或 data-plan；只需把功能描述寫成 spec.md 時改用 s-specify；要做技術選型、產出 research.md 或 techstack.md 時改用 technical-research；要規劃類別、先畫類別圖再寫程式時改用 plan-with-class-diagram。
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
