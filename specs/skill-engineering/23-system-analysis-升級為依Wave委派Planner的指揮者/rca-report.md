# 根因報告：system-analysis－升級為依Wave委派Planner的指揮者

- 紀錄目錄：`specs/skill-engineering/23-system-analysis-升級為依Wave委派Planner的指揮者/`
- 確認紀錄：使用者回覆「同意／都照建議」：同意第 2 節驗收條件與根因 R1–R3；推定的 E14、E23、E24 都保留。Phase 5 驗收 S2、S3 的 E16 未通過，補充 R4，使用者回覆「確認」同意 R4，並同意修正方式為 P5-3 改成逐字列出 P3-4 執行的兩個命令。
- 問題證據：本次對話上下文（`artifact-to-skill-engineering` 的客製化需求，以及使用者確認的整體變更清單）；`.agents/skills/system-analysis/SKILL.md` frontmatter 與 Phase 1–3；定稿範例 `templates/plan.example.md`（sha256 `a7fdbd57…433bd`）；紀錄 16 `blueprint.md` 第 1 節 E6、第 8 節「子代理回報的觀察」與「使用者實際驗證（2026-10-25）」；`api-plan`、`data-plan`、`ui-plan` 的 `SKILL.md` Phase 1（`ui-plan` 另含 Phase 2）；課程第三章第 14 單元筆記 `docs/tmp/系統分析的單一職責原則：產出多個 Planner Skills.md` 第 4、8 節

## 1. 使用者回報的問題

依課程第三章第 14 單元，`system-analysis` 要從「只做規劃」升級成指揮者：產出 plan.md 後依 Wave 委派 `ui-plan`、`data-plan`、`api-plan`，每個 Planner 各自產出自己的檔案，`system-analysis` 只負責規劃、委派、追蹤與交接，不另產總彙整。目前的 Skill 產出 plan.md 後就結束，Documentation 樹也沒有列出 Planner 的產出目錄。另外，紀錄 16 留下三項待處理的觀察：使用者實際驗證時 Source Code 樹多了不對應端點類型的 `shared/`；S2 的子代理沒有照 P3-4 用 `grep` 查核需求編號；S5b 的子代理指出 P1-7 拒絕覆寫而停止時，SOP 沒有規定要回報什麼。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | plan.md 寫在目標 spec.md 的同一個目錄，結構符合 plan 樣板組：標題為「Implementation Plan: <功能名稱>」，`Branch` 為該目錄名稱，`Date` 為執行當日，`Spec` 連結為 `./spec.md`，`Input` 為目標 spec 路徑；依序包含 `## Project Structure`（`### Documentation (this feature)`、`### Source Code (repository root)`、`**Structure Decision**`）與 `## 分析流程規劃`（`### 系統介面盤點`、`### 分析流程安排`）；沒有殘留的填位符號 | 既有 | 通用 | S1、S2、S3 |
| E2 | 系統介面盤點表的每一列是一個介面：介面名稱指出需求部位，不是只寫端點名稱；端點類型欄寫出端點類型與使用關係（例如「後端（前端 → 後端）」） | 既有 | 通用 | S1、S2 |
| E3 | 每一列的需求依據都引用目標 spec 中存在的 US 情境、FR、NFR、SC 編號，或 Edge Cases、Key Entities 項目 | 既有 | 通用 | S1、S2 |
| E4 | Wave 以技術端點為單位：同一端點類型的介面都在同一個 Wave；每個介面恰好出現在一個 Wave；每個 Wave 寫出涵蓋介面與排序理由，第 2 個以後的 Wave 寫出依賴前面 Wave 的哪些結果 | 既有 | 通用 | S1、S2 |
| E5 | 同一個 Wave 有兩個以上端點類型時，Wave 標題標出平行分析的 Sub-agent 數（等於端點類型數），且這些端點之間沒有互相依賴 | 既有 | 通用 | S2 |
| E6 | plan.md 不含 API endpoint 清單、資料表欄位或畫面元件設計；`system-analysis` 自己只寫入 plan.md，目標 spec 目錄的其他新增檔案都在 `contracts/`、`data/`、`ui/` 下，沒有其他彙整檔 | 既有（改寫：原「只做規劃、不產出其他檔案」依本次需求改為由 Planner 產出） | 通用 | S1、S2、S3 |
| E7 | 「系統介面盤點」開場句的端點類型數與介面數、「分析流程安排」開場句的 Wave 數，與表格及 Wave 區塊的實際數量一致 | 既有 | 通用 | S1、S2 |
| E8 | 目標 spec 的每個 User Story 至少被一個介面的需求依據引用 | 既有 | 通用 | S1、S2 |
| E9 | Source Code 樹與 Structure Decision 只使用 techstack.md／research.md 採用的技術 | 既有 | 通用 | S1、S2 |
| E10 | 找不到 spec.md 時停止執行、不建立 plan.md，並告知使用者先產出 spec.md | 既有 | 通用 | S7（回歸，逐步演練） |
| E11 | 目標 spec 目錄沒有 techstack.md 也沒有 research.md 時停止執行、不建立 plan.md，並告知使用者先做技術研究 | 既有 | 通用 | S7（回歸，逐步演練） |
| E12 | 目標目錄已有 plan.md 時，先詢問並提供三個選項：覆寫（重新產出 plan.md）、沿用（plan.md 雜湊不變，直接依它委派）、停止（plan.md 雜湊不變、沒有建立任何 Planner 產出，回報寫明「沒有修改 plan.md、沒有委派任何 Planner」）；使用者回覆前不修改 plan.md、不委派 | 本次（使用者確認紀錄 16 觀察 ③ 的處理方式） | 通用 | S4、S5 |
| E13 | Documentation 樹除了目錄中的既有文件與 plan.md，還依盤點出的端點類型列出 Planner 的產出：後端列 `contracts/` 與 `openapi.yaml`（有事件傳輸時另列 `asyncapi.yaml`），資料庫列 `data/` 與 `data-model.dbml`，前端列 `ui/` 與 `plan.md`、`index.html`；`ui/` 不列其他 HTML 檔名 | 本次（使用者確認 Documentation 樹涵蓋 `contracts/`、`data/`、`ui/`，`ui/` 只列確定的檔案） | 通用 | S1、S2、S3 |
| E14 | 盤點沒有某種端點類型時，Documentation 樹不列該類型的產出目錄（例如沒有資料庫端點就不列 `data/`） | 推定：沒有該端點就不會委派對應的 Planner，列出不會產生的目錄會誤導讀者 | 通用 | S3 |
| E15 | Source Code 樹的頂層目錄都對應盤點出的端點類型；技術研究沒有明確要求時，不出現 `shared/` 等不對應端點類型的頂層目錄 | 本次（紀錄 16 使用者實際驗證的觀察 ①） | 通用 | S1、S2、S3 |
| E16 | 回報寫出需求編號查核的方式與結果：實際執行的 `grep` 命令、查核的編號數，以及在目標 spec 找不到的編號（沒有時寫明全部找到） | 本次（紀錄 16 S2 觀察 ②） | 通用 | S1、S2 |
| E17 | plan.md 確定後依 Wave 順序委派：前端交給 `ui-plan`、後端交給 `api-plan`、資料庫交給 `data-plan`；同一個 Wave 的 Planner 以子代理平行執行（在同一則訊息發出），前一個 Wave 的 Planner 都結束後才開始下一個 Wave | 本次 | 通用 | S1、S2、S4 |
| E18 | 每份委派內容寫出目標 spec 目錄、負責的介面編號（等於 plan.md 中該端點類型的所有介面）與使用者是否已同意覆寫；給 `ui-plan` 的委派內容另寫出視覺風格的氣質、配色與字體 | 本次 | 通用 | S1、S2 |
| E19 | 盤點有前端介面，且使用者沒有指定視覺風格的氣質、配色或字體時，委派前讀取 `clarify` 的 `SKILL.md`，依其 SOP 以 Markdown 表格詢問缺少的項目；不使用 Skill 工具呼叫 `clarify`，也不使用 AskUserQuestion；使用者已指定三項時不詢問 | 本次（課程：沒有指定視覺風格時每次先用 `clarify` 問；使用者選擇由 `system-analysis` 委派前先問） | 通用 | S1、S2 |
| E20 | 沒有 Planner 的端點類型（金流等第三方、手機、硬體）不委派；整個 Wave 都沒有 Planner 時跳過該 Wave；回報列出這些介面並標「沒有 Planner，未分析」 | 本次 | 通用 | S2 |
| E21 | 某個 Planner 依賴前面 Wave 中沒有被分析的端點時，委派內容註明「<介面編號> 未分析，請改依技術研究結果」，回報也列出這個依賴缺口 | 本次 | 通用 | S2 |
| E22 | 最後的回報寫出 plan.md 路徑與查核結果、每個 Wave 委派了哪些 Planner 及各自回報的產出路徑；不另寫總彙整檔 | 本次 | 通用 | S1、S2 |
| E23 | 委派前，目標 spec 目錄的 `contracts/`、`data/`、`ui/` 中已有本次要委派的 Planner 會寫入的檔案時，一次列出這些檔案並詢問是否覆寫；同意時在委派內容寫明使用者已同意覆寫；不同意時不委派該 Planner，回報標「使用者未同意覆寫，未委派」 | 推定：Planner 以子代理執行時無法轉問使用者，會停在自己的覆寫確認閘門；三個 Planner 的 P1 都以委派內容的「已同意覆寫」略過閘門 | 通用 | S3 |
| E24 | 某個 Planner 停止或沒有產出時，回報列出它的停止原因；後面的 Wave 照常委派，依賴它的委派內容註明該介面沒有產出 | 推定：一個 Planner 失敗不應讓其他端點的分析都停下；註明缺口後由後續 Planner 改依技術研究結果，與 E21 一致 | 通用 | S3 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E6、E17、E18、E22 | 產出 plan.md 後依 Wave 委派三個 Planner 並回報產出路徑 | 產出 plan.md、回報後即結束；description 寫「只做規劃，不做各介面的實際分析」 | 觀察：`SKILL.md` frontmatter `description`；Phase 3 步驟 5 是最後一步；完成條件只到「已向使用者回報」 |
| E19 | 有前端介面且沒指定風格時，委派前先依 `clarify` 問風格 | 沒有任何步驟讀取 `clarify` | 觀察：`SKILL.md` Phase 1–3 沒有提到 `clarify` 或視覺風格 |
| E20、E21、E23、E24 | 處理沒有 Planner 的端點、依賴缺口、Planner 既有產出與 Planner 停止 | 沒有對應步驟 | 觀察：同上，`SKILL.md` 沒有委派相關步驟 |
| E12 | 三個選項，停止時有固定回報 | 只有同意覆寫／不同意兩種，不同意時停止，沒有規定回報內容，也沒有「沿用」 | 觀察：`SKILL.md` Phase 1 步驟 6、7；紀錄 16 第 8 節 S5b 的子代理觀察 |
| E13 | Documentation 樹列出 `contracts/`、`data/`、`ui/` | 只列目錄中既有的文件與本次的 plan.md | 觀察：`SKILL.md` Phase 3 步驟 1「列出目錄中的文件與本次的 `plan.md`」；定稿範例 Documentation 樹已列出三個目錄 |
| E15 | 沒有 `shared/` | 紀錄 16 使用者實際驗證的 Source Code 樹出現 `shared/` | 觀察：紀錄 16 第 8 節「使用者實際驗證」的觀察：「Source Code 樹多了 `shared/`（前後端共用型別與判定邏輯，依 research §3）」 |
| E16 | 回報寫出 `grep` 查核方式與結果 | S2 子代理以人工對照查核，沒有用 `grep`；回報沒有查核結果 | 觀察：紀錄 16 第 8 節「子代理回報的觀察」第 1 點；`SKILL.md` Phase 3 步驟 5 的回報項目沒有查核結果 |
| E16（Phase 5 驗收 S2、S3，依修正施工後） | 回報逐字寫出 P3-4 執行的兩個 `grep` 命令、查核的編號數與「缺少」「未引用」項目 | S2 回報只寫「我用 grep 檢查 `plan.md` 引用的編號，12 個 FR/NFR/SC 編號在 spec 都找得到」；S3 回報只寫「需求編號查核：26 個編號都找得到，US1–US3 都有引用」；兩者都沒有列出命令。S1 回報逐字列出兩個命令 | 觀察：S2、S3 測試 session 對話紀錄最後一則 assistant 訊息；兩者的 P3-4 都有實際執行 `grep` 管線（S2 第 7 個、S3 第 5 個工具呼叫） |

## 4. 演練表

`system-analysis`，以紀錄 16 使用者實際驗證（1A2B，Sonnet）為輸入，對照本次驗收條件：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-5 | 無 | 無 | 目標 spec、techstack、research 已讀取 | 觀察：紀錄 16 第 8 節，測試 session 自動觸發後讀取並繼續 | 一致 |
| P1-6、P1-7 | 無 | 無 | 沒有既有 plan.md，略過 | 觀察：暫存專案沒有 plan.md | 一致（E12 的三個選項本輪未觸及；以 S5b 的觀察為證據，見第 3 節） |
| P2-1～P2-4 | 兩份 RuleFile | 觀察：已讀取 | 介面清單 F1–F4、B1–B4，Wave 1 前端、Wave 2 後端 | 觀察：紀錄 16 第 8 節，E1–E9 全部符合 | 一致 |
| P3-1 | 無 | 無 | 專案結構：Documentation 樹含 Planner 產出目錄（E13）；Source Code 樹頂層只對應端點類型（E15） | 觀察：步驟文字只要求列「目錄中的文件與本次的 plan.md」；實際 Source Code 樹多了 `shared/` | 偏離 |
| P3-2、P3-3 | plan 樣板組 | 觀察：已讀取 | plan.md | 觀察：plan.md 已寫入，結構符合 E1 | 一致 |
| P3-4 | 兩份檢查清單 | 觀察：已使用 | 查核結果，含 `grep` 查核需求編號 | 觀察：本輪有用 `grep`；紀錄 16 S2 的子代理以人工對照，步驟只在括號中寫方法，沒有要求回報查核結果，也沒有檢查 P3-1 的要求 | 偏離 |
| P3-5 | 無 | 無 | 回報後依 Wave 委派 Planner（E17–E24） | 觀察：回報後結束，沒有後續步驟 | 偏離 |

第一個偏離點：P3-1（`THINK` 決定專案結構）。P3-4 與 P3-5 是另外兩個獨立的偏離點，各自對應一個根因。

Phase 5 驗收 S2、S3（依修正施工後的 `system-analysis`）：P1-1～P5-2 一致（P3-4 有執行兩個 `grep` 命令，P5-1 依 Wave 委派）；P5-3 應逐字回報命令，實際只摘要結果，判定偏離。第一個偏離點是 P5-3，成因見 R4。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `system-analysis`／`SKILL.md`／Phase 3 步驟 1 | 缺失 | 觀察：步驟只要求 Documentation 樹列出「目錄中的文件與本次的 `plan.md`」，沒有任何部位要求列出 Planner 的產出目錄；Source Code 樹只寫「依端點類型規劃頂層目錄」，沒有說明不對應端點類型的目錄是否允許。觀察：紀錄 16 實際驗證的測試 session 依 research §3 建了 `shared/`，並在回報中自己指出偏離。推論：E13、E14 沒有在任何部位表達；E15 的界線沒有寫出，執行者可以把技術研究提到的共用邏輯解讀成需要獨立目錄（依據上述觀察） | 假設 P3-1 寫出各端點類型對應的產出目錄與檔案、沒有該端點類型時不列，並寫明技術研究沒有明確要求時不建不對應端點類型的頂層目錄：1A2B 的 Documentation 樹會列出 `contracts/`、`data/`、`ui/`，Source Code 樹不會有 `shared/`，E13–E15 可滿足；E1、E9 不受影響 |
| R2 | `system-analysis`／`SKILL.md`／Phase 3 步驟 4、步驟 5 | 不可檢查 | 觀察：P3-4 只在括號中寫「需求編號以 `grep` 在『目標 spec』中查核」，P3-5 的回報項目沒有查核結果；紀錄 16 S2 的子代理以人工對照完成查核，沒有留下可核對的結果。推論：是否照方法查核無法從產出或回報判斷，`CHECK` 無法發現偏離（依據上述觀察） | 假設 P3-4 寫出具體 `grep` 命令，P3-5 要求回報命令、查核編號數與找不到的編號：執行者必須實際執行命令才能回報，S2 那類人工對照會在回報中顯現，E16 可滿足；E3 的判定方式不變 |
| R3 | `system-analysis`／`SKILL.md`／frontmatter `description`、Phase 1 步驟 6–7、Phase 3 步驟 5 之後 | 流程缺陷 | 觀察：description 寫「只做規劃，不做各介面的實際分析」，SOP 在 P3-5 回報後結束；P1-6、P1-7 只有同意覆寫／不同意兩種回覆，不同意時停止且沒有規定回報（紀錄 16 S5b 觀察）。觀察：三個 Planner 的 P1-1 讀取「委派內容」，P1-6 以委派的介面編號為負責介面，覆寫閘門在委派內容說明已同意時略過；`ui-plan` P2-1 在委派內容已指定氣質、配色與字體時不詢問。推論：下游已經準備好接收委派，缺的是上游的委派階段、委派前的風格提問與覆寫確認，以及沿用既有 plan.md 直接進入委派的入口（依據上述觀察） | 假設 description 改為規劃後依 Wave 委派，P1-6、P1-7 提供覆寫／沿用／停止三個選項並規定停止回報，plan.md 確定後新增委派階段（端點對應 Planner、委派前依 `clarify` 問風格、檢查 Planner 既有產出、依 Wave 平行委派、處理沒有 Planner 的端點與依賴缺口、彙整回報）：E6、E12、E17–E24 可滿足；E1–E5、E7–E11 的盤點與 plan.md 寫入步驟不受影響 |
| R4 | `system-analysis`／`SKILL.md`／Phase 5 步驟 3（「『需求編號查核結果』的命令、查核的編號數與『缺少』『未引用』的項目」） | 不可檢查 | 觀察：P3-4 把「兩個命令與輸出」記為「需求編號查核結果」，P5-3 只寫回報「『需求編號查核結果』的命令」，沒有說明要逐字列出；三個情境中 S1 列出命令，S2、S3 以一句「用 grep 檢查」帶過。推論：「命令」可以被讀成「說明查核方式」，摘要寫法也符合字面，P5-3 無法判斷是否違反（依據上述觀察） | 假設 P5-3 改為逐字列出 P3-4 執行的兩個命令：S2、S3 的回報必須貼出命令原文，E16 可滿足；其他回報項目與 E22 不受影響 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H4：三個 Planner 沒有提供被委派的入口 | 交接缺陷 | 觀察：`api-plan`、`data-plan`、`ui-plan` 的 P1-1 都讀取「使用者需求或委派內容」，P1-6 以委派指定的介面編號為負責介面，覆寫閘門在委派內容說明已同意時略過；`ui-plan` P2-1 在委派已指定三項風格時不詢問；紀錄 18 S2、紀錄 21 S2 以委派格式驗收通過 |
| H5：`shared/` 是 `rules/Wave安排-格式規範.md` 或 `rules/系統介面盤點-格式規範.md` 造成的 | 衝突 | 觀察：兩份 RuleFile 只規範盤點表與 Wave 區塊，沒有提到 Source Code 樹；`shared/` 的依據是 research §3（紀錄 16 第 8 節） |
| H6：Sonnet 能力不足，跳過 `grep` | 非 Skill 問題 | 觀察：紀錄 16 實際驗證的 Sonnet session 有用 `grep` 查核；同一模型時有時無，差別在步驟沒有要求留下可核對的結果（R2） |
| H7：定稿範例和 Wave 規則衝突（Wave 1 標 2 個 Sub-agent，但 P1 沒有 Planner） | 衝突 | 觀察：使用者確認 Wave 標題的 Sub-agent 數依端點類型計數，實際委派數只寫在回報；課程第 14 單元實測的 plan.md 也沒有寫用哪個 Skill |
| H8（R4 階段）：Sonnet 能力不足，略過回報項目 | 非 Skill 問題 | 觀察：同一模型的 S1 逐字列出命令；S2、S3 的其他回報項目（各 Wave 的 Planner、產出路徑、沒有 Planner 的介面、依賴缺口）都有列出，只有字面可做兩種解讀的「命令」被摘要 |

## 7. 影響範圍

無：目前沒有其他 Skill 委派 `system-analysis`（結構診斷的 `callers` 為空）。本次升級後 `system-analysis` 會成為 `api-plan`、`data-plan`、`ui-plan` 的呼叫者，並讀取 `clarify` 的 `SKILL.md`；四者都不修改。

## 8. 待確認事項

（R4 階段）是否同意根因 R4（P5-3 的「『需求編號查核結果』的命令」沒有要求逐字列出，摘要寫法也符合字面）？驗收條件 E1–E25 不變。

（以下為第一輪）


1. 第 2 節的驗收條件是否正確、完整？E1–E5、E7–E11 沿用紀錄 16；E6 由「只做規劃」改寫為「plan.md 不含介面設計、其他檔案只由 Planner 寫入」；E12、E13、E15–E22 是你確認的變更清單。
2. 是否同意第 5 節的根因 R1、R2、R3？
3. E14「沒有某種端點類型時，Documentation 樹不列它的產出目錄」是推定的預期，要保留嗎？
4. E23「委派前檢查 Planner 既有產出、一次問是否覆寫，不同意就不委派該 Planner」是推定的預期，要保留嗎？
5. E24「某個 Planner 停止時，後面的 Wave 照常委派並註明缺口」是推定的預期，要保留嗎？
