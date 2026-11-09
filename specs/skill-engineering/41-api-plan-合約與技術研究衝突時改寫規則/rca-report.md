# 根因報告：api-plan－合約與技術研究衝突時改寫規則

- 紀錄目錄：`specs/skill-engineering/41-api-plan-合約與技術研究衝突時改寫規則/`
- 問題證據：`docs/iterations/iter-4.md`「Skill 問題」問題 1；`specs/006-reservation-reschedule/contracts/openapi.yaml` 第 9 行；`specs/006-reservation-reschedule/research.md` 第 57 行；`specs/006-reservation-reschedule/analysis.md` F2；本次對話中 api-plan 子代理（Wave 2）的完成回報；`.agents/skills/api-plan/SKILL.md`、`rules/API合約-格式規範.md`；對照用 `.agents/skills/data-plan/SKILL.md`、`.agents/skills/ui-plan/SKILL.md`

## 1. 使用者回報的問題

第 4 次迭代步驟 5，api-plan 發現 research §3「在交易開頭呼叫 `expireDueRescheduleRequests`」會讓失效結果隨請求失敗回滾。它沒有把這件事當成上游衝突處理，而是在合約 `info.description` 寫下與 research 相反的規則「失效結果不因本次請求的錯誤回應而還原」，只在子代理回報的結尾以「提醒」帶過。之後 tasks、implement 都依 research 實作，合約這句話與程式行為不符；analyze 標為 HIGH（F2），implement 量測 SC-004 時必須繞路。

原本預期：Planner 發現技術研究的決策有問題時，合約要照 research 寫，或把衝突明確標成待確認並回報處理 Skill（`technical-research`），不要在合約中寫下與 research 相反、且沒有人採用的規則。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 合約中的規則（`info.description`、各 operation 的 `description`、錯誤碼與狀態碼）不得與 `research.md` 的 `Decision` 或 spec 的需求相反；發現兩者有問題或無法同時滿足時，合約保留上游的寫法，不自行改寫成另一種規則 | 本次 | 通用 | S1 |
| E2 | 發現 E1 的情況時，api-plan 的回報有一個獨立的「上游衝突」項目，每項寫出衝突內容、上游位置（`research.md` 章節或 spec 編號）、合約中受影響的 operation，以及建議的處理 Skill；沒有衝突時寫「無」 | 本次 | 通用 | S1、S2 |
| E3 | 每個 operation 恰好一個「介面編號 介面名稱」tag，每個可規劃介面至少一個 operation，`description` 引用 spec 存在的需求編號；`check_contracts.py` 沒有 issues | 既有 | 通用 | S2 |
| E4 | 與憲法必須／不得規則無法同時滿足的項目，仍以「憲法衝突」委派 `clarify` 取得使用者決定；回報仍包含「憲法遵循」 | 既有 | 通用 | S2 |
| E5 | 已存在的合約檔在委派內容沒有說明同意覆寫時，先詢問使用者 | 既有 | 通用 | S2 |
| E6 | 「上游衝突」只在回報中列出，不因此停止產出合約、不向使用者提問；推定理由：api-plan 通常由 system-analysis 以子代理委派，子代理無法和使用者對話，停下會讓整個 Wave 沒有產出；決定權交給 analyze 與使用者 | 推定 | 通用 | S1 |

驗收情境：

- **S1（原始輸入）**：在暫存複本中，把 `specs/006-reservation-reschedule/contracts/` 移除，委派 api-plan 處理 `specs/006-reservation-reschedule/` 的 B1～B6，委派內容與第 4 次迭代步驟 5 相同（含「目錄內沒有既有的 contracts/ 產出，不需要覆寫確認」）。預先回覆：無（不應提問）。判斷：(1) 產出的合約沒有任何與 research §3「交易開頭呼叫此函式」相反的語句（例如「失效結果不因本次請求的錯誤回應而還原」）；(2) 回報有「上游衝突」項目；若列出項目，每項都有內容、上游位置、受影響 operation 與建議處理 Skill；(3) 合約檔已產出。
- **S2（回歸）**：在暫存複本中，把 `specs/005-equipment-pickup-return/contracts/` 移除，委派 api-plan 處理 005 的 B1～B6。預先回覆：無。判斷：`check_contracts.py` 沒有 issues；回報包含每個介面的 operation 數、「上游衝突」（內容或「無」）與「憲法遵循」。

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 合約依 research §3 寫，或不寫與它相反的規則 | 合約寫「失效結果不因本次請求的錯誤回應而還原」，與 research §3 的「交易開頭呼叫」相反 | 觀察：`contracts/openapi.yaml` 第 9 行；`research.md` 第 57 行；`analysis.md` F2 |
| E2 | 回報以獨立項目列出衝突、位置與處理 Skill | 只在回報結尾以「這是給 tasks／implement 的提醒，不是產品規則」帶過，沒有指出處理 Skill，也沒有列成待確認 | 觀察：本次對話中 api-plan 子代理回報的最後一段 |

## 4. 演練表

`api-plan`（第 4 次迭代 Wave 2，由 system-analysis 委派）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-3 | 無 | 無 | 規劃輸入、目標 spec | 觀察：回報以 `specs/006-reservation-reschedule/` 為目標 | 一致 |
| P1-4 | spec、plan、techstack、research、ui、data | 觀察：回報引用 research §2 的路徑與錯誤碼、§3 的惰性失效 | 規劃輸入含 research | 觀察：同左 | 一致 |
| P1-5 | 憲法檔 | 觀察：回報列出讀了 `shared.md`、`openapi.md` | 憲法檢查清單 | 觀察：同左 | 一致 |
| P1-6～P1-9 | 無 | 無 | 負責介面 B1～B6、目標合約檔 `openapi.yaml` | 觀察：回報 B1～B6 的 operation 數，無 AsyncAPI | 一致 |
| P1-10～P1-11 | 無 | 無 | 沒有既有合約，略過 | 觀察：委派內容寫明沒有既有產出 | 一致 |
| P2-1 | `rules/API合約-格式規範.md` | 觀察：回報逐條核對 Rule 1～2 | API 合約檢查清單 | 觀察：同左 | 一致 |
| P2-2 | 規劃輸入、憲法、API 合約檢查清單 | 已載入 | 與 spec、research 一致的 API 設計 | 觀察：設計中加入「失效結果不因本次請求的錯誤回應而還原」，與 research §3 相反（回報自述「research §3 是在交易開頭執行失效函式；請求失敗、交易回滾時，失效也會一起被還原」） | 偏離 |
| P2-3 | 憲法檢查清單 | 已載入 | 憲法衝突 | 觀察：憲法衝突為空；步驟文字只比對憲法規則，沒有位置記錄「和 research 衝突」 | 一致 |
| P3-2 | 合約樣板組 | 已載入 | 合約檔 | 觀察：第 9 行寫入 P2-2 的規則 | 偏離（P2-2 的結果） |
| P3-5 | 無 | 無 | 回報 | 觀察：回報沒有獨立的衝突項目，只有結尾提醒 | 偏離（沒有回報位置） |

第一個偏離點：`api-plan` Phase 2 步驟 2（設計 API）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `.agents/skills/api-plan/SKILL.md` Phase 2 步驟 2～3 與 Phase 3 步驟 5 | 缺失 | 觀察：步驟 2 只要求「依規劃輸入……設計」，沒有規定設計不得與 research 的 `Decision` 相反；步驟 3 只比對「憲法」必須／不得規則與規劃輸入，建立「憲法衝突」，沒有任何步驟處理「spec 或技術研究本身有問題、或兩者無法同時滿足」；Phase 3 步驟 5 的回報項目也沒有這一類。`rules/API合約-格式規範.md` Rule 1～2 只規定 tag、需求引用與 Edge Case，同樣沒有。推論：api-plan 發現 research 的缺陷時，SOP 沒有指定「保留上游寫法並回報」的去處，只能自行在合約中改寫規則（依據 P2-2 的觀察） | 假設 Phase 2 有步驟要求「不得改寫 research／spec 的決策；判定上游有問題時記為上游衝突」，Phase 3 步驟 5 回報「上游衝突」：在 P2-2 api-plan 會依 research §3 寫合約（不寫相反規則），P3-5 回報列出 research §3 的回滾問題與處理 Skill `technical-research`，E1、E2 成立；E3～E5 的步驟不受影響；E6 因只回報、不停止而成立 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| research.md 沒有被讀取，api-plan 不知道 §3 的決策 | 未載入 | 觀察：api-plan 回報直接描述 research §3「交易開頭執行失效函式」與回滾後果，P1-4 已載入 |
| system-analysis 委派時沒有交出 research 的決策 | 交接缺陷 | 觀察：委派內容寫明「research.md §2 已決定改期相關端點與錯誤碼，§3 已決定惰性失效」 |
| research §3 本身錯誤才是根因，api-plan 沒有問題 | 非 Skill 問題（上游內容） | 推論：research 的缺陷確實存在（analyze F2），但驗收條件 E1、E2 是 api-plan 遇到上游缺陷時的行為；即使 research 正確，SOP 仍沒有處理上游衝突的位置（依據 R1 的觀察），所以 api-plan 的缺失獨立成立。research 的缺陷另見 `iter-4.md` 的 technical-research 列（需求缺漏） |

## 7. 影響範圍

- 依結構診斷，沒有 Skill 以 Skill 工具直接呼叫 `api-plan`（`callers.api-plan` 為空）。
- 觀察：`system-analysis` Phase 4 步驟 1、Phase 5 步驟 1 以文字委派 `api-plan`（`.agents/skills/system-analysis/SKILL.md` 第 45 行起），並在 Phase 5 步驟 3 轉述 Planner 的回報。
- 下游讀取合約的 Skill：`tasks`（Rule 4 把上游不一致寫成 Notes 待確認）、`analyze`、`implement`。
- 觀察：`data-plan` Phase 2 步驟 3、`ui-plan` Phase 2 步驟 2 與 api-plan 使用相同的「只比對憲法」寫法（兩者 SKILL.md 中都只有「憲法衝突」一處提到無法同時滿足）。本次 data-plan 自行在回報中列出和 research §1 的差異，沒有發生同樣的問題；兩者是否要一起修改，不在本次問題範圍，見待確認事項。

## 8. 待確認事項

1. 驗收條件 E1～E6 是否正確、完整？
2. E6 是推定的預期：「上游衝突」只回報、不停止產出、不提問。是否同意？
3. 是否同意根因 R1（api-plan 缺少處理 spec／技術研究衝突的步驟與回報項目）？
4. data-plan、ui-plan 有相同的寫法，但本次沒有發生問題。這次只改 api-plan，還是三個 Planner 一起改？
5. 缺少的證據：無。

## 9. 確認紀錄

- 2026-11-10：使用者回覆「確認」，同意 E1～E6（含推定 E6）與 R1。待確認事項 4（範圍）沒有另外指定，依使用者最初的需求只改 api-plan；data-plan、ui-plan 不改。
