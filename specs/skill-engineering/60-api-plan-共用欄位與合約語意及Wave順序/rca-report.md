# 根因報告：api-plan、system-analysis－共用欄位與合約語意及 Wave 順序

- 紀錄目錄：`specs/skill-engineering/60-api-plan-共用欄位與合約語意及Wave順序/`
- 確認紀錄：使用者 2026-11-20 回覆「都照建議」，對象是第 8 節 7 題與 C26 2 題的建議（見第 9 節）。依建議刪除原 E9（版本號）、把原 E10 縮小為新的 E9，驗收條件因此重新編號；R1～R3 確認。
- 範圍：Spec Kit v1.4.2 調整計畫批 5 的 C12。C26（`implement` 專案衛生規則）只改一條規則，改用 `skill-form-rule`，不在本報告內。
- 問題證據：
  - 計畫 `docs/dev/spec-kit-1.4.2-調整計畫.md` 第 3.2 節 C12 列、第 4 節批 5、第 7 節 R9、R15、第 9 節決定 9（使用者 2026-11-19 以 `clarify` 確認：「以 `data-plan` 為準，資料庫介面排在後端之前的 Wave」）。
  - 落差分析 `docs/dev/spec-kit-1.4.2-落差分析.md` C12 列（第 83 行）與第 86 行。
  - `docs/report/SDD流程不足總整理.md` 第 2 節第 1 列。
  - 迭代紀錄 `docs/iterations/iter-1.md:42-43、57、124`、`iter-2.md:42-43、126`、`iter-3.md:42、44、126`。
  - 產出物：`specs/003-equipment-loan-booking/plan.md:115-126`、`specs/003-equipment-loan-booking/analysis.md:13-14`（F1、F2，MEDIUM）、`specs/004`～`007/plan.md` 的 Wave 2、`specs/002-room-game-chat/plan.md:91-100`、`specs/003`～`008/contracts/openapi.yaml` 第 4 行、`specs/008-overdue-discord-notification/contracts/openapi.yaml:7、10、19`。
  - 基因來源（預期，不是失敗證據）：`.spec-kit/v1.4.2/docs/how-to/contract-driven-development.md`「What the contract defines」「One authoritative owner」。
  - Skill 檔案：`system-analysis` 的 `SKILL.md`、`rules/Wave安排-格式規範.md`、`templates/plan.example.md`；`api-plan` 的 `SKILL.md`、`rules/API合約-格式規範.md`、`templates/openapi.yaml`、`templates/asyncapi.yaml`。
  - 結構診斷：`audit_skill.py --graph`，`api-plan`、`system-analysis` 0 error、0 warning。

## 1. 使用者回報的問題

1. 迭代 1～3 每次都出現：同一個 Wave 平行執行的 `api-plan` 與 `data-plan` 不讀彼此的產出。同一個概念的欄位在兩份產出用不同的名稱、型別或值。`analyze` 每次列為 MEDIUM。`implement` 每次要在服務層做欄位映射。
2. 使用者的決定（決定 9）：共用欄位以 `data-plan` 的資料模型為準；資料庫介面排在後端介面之前的 Wave。
3. 計畫的範圍：`api-plan` 要寫出副作用、冪等、事件順序、重試、逾時、版本相容，但只在 spec 有要求時寫；共用欄位的名稱與約束以資料模型為準，不一致時列為上游衝突。
4. 風險 R9：權威擁有者只決定預設值。兩邊不一致時，`api-plan` 仍列為上游衝突，回報原 Planner，不自行修改另一方。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | `plan.md` 同時有資料庫介面與後端介面時，資料庫所在的 Wave 排在後端所在的 Wave 之前；後端 Wave 的「依賴」寫出它依賴資料庫 Wave 的資料模型 | 本次 | 通用 | S1、S2 |
| E2 | 沒有共用欄位依賴的端點類型仍放在同一個 Wave 平行分析；`plan.md` 沒有資料庫介面時，Wave 數不因本次修改增加 | 既有 | 通用 | S2 |
| E3 | `contracts/` 中對應資料模型欄位的 schema 欄位，與 `data/data-model.dbml` 的同一欄位一致：同一個字詞、同一種型別、同一組 Enum 值（名稱風格轉換見 E8） | 本次 | 通用 | S1 |
| E4 | `api-plan` 的設計需要和資料模型不同時（資料模型缺欄位，或資料模型和 spec 衝突），不修改 `data/data-model.dbml`，在回報的「上游衝突」寫出衝突內容、`data-model.dbml` 的資料表與欄位、受影響的 `operationId`，建議處理 Skill 為 `data-plan` | 本次 | 通用 | S3 |
| E5 | spec 對某個 operation 要求副作用、冪等、事件順序、重試、逾時或版本相容時，該 operation 的 `description`（或 `info.description`）寫出這項語意，並引用要求它的需求編號 | 本次 | 通用 | S4 |
| E6 | spec 沒有要求上述語意時，合約不自行加入，例如不自行加 `Idempotency-Key` header、重試次數或逾時秒數 | 本次 | 通用 | S1 |
| E7 | 重跑 `analyze` 後，`analysis.md` 沒有「`api-plan` 與 `data-plan` 欄位命名不一致」的發現 | 本次 | 通用 | S1 |
| E8 | 「同一個字詞」允許各產出依自己的命名風格轉換：DBML 用 snake_case、JSON 用 camelCase，`slot_code` ↔ `slotCode` 算一致；`reservation_no` ↔ `reservationNumber`（字詞不同）、`status` Enum ↔ `isActive` 布林（型別不同）、`morning` ↔ `MORNING`（值不同）算不一致 | 推定 | 通用 | S1 |
| E9 | 延續既有功能的迭代（spec 要求向下相容前一版合約）中，前一版合約已有、和資料模型不一致的欄位維持原名，在「上游衝突」列一次並指名 `data-plan`；只有本次新增的共用欄位依 E3 和資料模型一致 | 推定 | 通用 | S4 |
| E10 | 既有核心預期不變：`system-analysis` 的 `plan.md` 結構、Wave 區塊格式、依 Wave 委派與回報；`api-plan` 的 tag 歸屬、需求引用、Edge Case 寫法、`check_contracts.py` 通過、覆寫前詢問 | 既有 | 通用 | S1、S2、S3、S4 |

推定理由：

- E8：Skill 執行時必須判斷大小寫與底線轉換算不算不一致。`openapi.yaml` 到目前都用 camelCase，`data-model.dbml` 都用 snake_case；若要求逐字相同，所有 JSON 欄位都要改成 snake_case。
- E9：`iter-2.md:126`、`iter-3.md:126` 顯示後續迭代沿用前一版合約的欄位名。前端已經依這些欄位實作；若改成資料模型的名稱，會破壞 FR-020 這類向下相容要求。Skill 要決定既有欄位怎麼處理。

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 資料庫 Wave 在後端 Wave 之前 | 003～008 的資料庫與後端都在 Wave 2 平行；只有 002 把資料庫排在後端之前 | 觀察：`specs/003/plan.md:122-126`；`specs/004`～`008/plan.md` 的 Wave 2 標題；`specs/002/plan.md:91-100` |
| E3 | 合約欄位和資料模型一致 | `slot_code` 值小寫 vs `slotCode` 值大寫；`equipments.status` Enum vs `isActive` 布林；`reservation_no` vs `reservationNumber` | 觀察：`specs/003/analysis.md:13-14`；`iter-1.md:42-43` |
| E4 | 不一致時列為上游衝突，指名 `data-plan` | 不一致沒有出現在 `api-plan` 的上游衝突；由 `tasks` 寫成 Notes 待確認，由 `implement` 在服務層映射 | 觀察：`iter-1.md:57`（`api-plan` 判「沒有問題」，差異記於流程不足）、`iter-1.md:42-43` |
| E5 | spec 要求的語意都寫進合約 | 008 的 FR-018（同時重送只送一次）有寫，因為 research §4 的 Decision 涵蓋它；沒有任何部位要求逐項涵蓋這類需求 | 觀察：`specs/008/contracts/openapi.yaml:10、19`；`api-plan` Rule 1～4 |
| E7 | 沒有命名不一致的發現 | 迭代 1～3 每次都有 F1、F2（MEDIUM） | 觀察：`specs/003/analysis.md:13-14`；`iter-2.md:126`、`iter-3.md:126` |

## 4. 演練表

以迭代 1（`specs/003-equipment-loan-booking/`）演練。沒有當次的完整對話紀錄；「實際」欄以產出物與迭代紀錄為證據。

`system-analysis`：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-8 | 無 | 無 | 分析輸入、目標 spec | 觀察：`plan.md:5` 的 Input 為 003 的 spec | 一致 |
| P2-1、P2-2 | 介面盤點檢查清單 | 無證據 | 介面清單 | 觀察：`plan.md` 盤出 F、B、D 三種端點 | 一致 |
| P2-3 | Wave 安排檢查清單 | 無證據 | Wave 安排檢查清單 | 推論：`plan.md:122-126` 的寫法和 Rule 1、Rule 2 的 Good Example 相同（依據 P2-4 的觀察） | 一致 |
| P2-4 | Wave 安排檢查清單 | 推論：已使用 | 資料庫 Wave 在後端 Wave 之前（E1） | 觀察：Wave 2 為「後端、資料庫」平行，排序理由寫「兩者之間沒有先後依賴」（`plan.md:122-126`） | 偏離 |
| P3-6～P3-8 | plan 樣板組 | 無證據 | `plan.md` 通過三份檢查清單 | 觀察：迭代 1 的步驟 4 沒有回報未通過項（`iter-1.md`） | 一致 |
| P5-1 | 無 | 無 | 依 Wave 委派 | 觀察：Wave 2 平行委派 `api-plan` 與 `data-plan`（`iter-1.md:124`） | 一致 |

`api-plan`（Wave 2，和 `data-plan` 平行）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-4 | `data/` 的既有檔案 | 推論：`data-model.dbml` 當時還沒寫出，讀不到（依據 P5-1 的平行委派） | 規劃輸入含資料模型 | 推論：規劃輸入沒有資料模型 | 偏離（承接 `system-analysis` P2-4） |
| P2-1 | API 合約檢查清單 | 無證據 | API 合約檢查清單 | — | 一致 |
| P2-2 | API 合約檢查清單 | 無證據 | 共用欄位依資料模型的 API 設計；不一致記為上游衝突 | 觀察：`reservationNumber`、`isActive`、大寫 `slotCode`；上游衝突沒有這些項目（`iter-1.md:57`） | 偏離 |
| P3-4 | API 合約檢查清單 | 無證據 | 檢查結果 | 觀察：`check_contracts.py` 0 issues（`iter-1.md:57`） | 一致 |

第一個偏離點：`system-analysis` P2-4（`THINK` 安排 Wave）。`api-plan` P1-4 的偏離是它的後果。`api-plan` P2-2 另有自己的偏離：反事實演練顯示，即使資料模型讀得到，P2-2 仍沒有規則要求依它命名（見 R2）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `system-analysis`／`rules/Wave安排-格式規範.md`／Rule 1 第 2 點與 Good Example；Rule 2 Good Example；`templates/plan.example.md:114-118` | 缺失 | 觀察：Rule 1 只寫「某個端點類型的分析需要使用另一個端點類型的分析結果時，視為依賴」，沒有說後端合約要用資料模型的欄位。三個範例都把「後端、資料庫」放同一個 Wave，理由寫「彼此沒有先後依賴」。推論：依賴由執行者自行判斷，範例教的是「沒有依賴」；所以 003～008 都排成平行，只有 002 排成先資料庫（依據第 3 節 E1 的觀察）。 | 假設 Rule 1 規定「後端介面使用資料庫介面的欄位時，後端依賴資料庫」，範例也改成資料庫在前：P2-4 會排出資料庫 Wave 在前，E1 可滿足；P5-1 依序委派，`api-plan` P1-4 讀得到 `data-model.dbml`。單靠 R1 無法滿足 E3、E4、E7（見 R2）。 |
| R2 | `api-plan`／`rules/API合約-格式規範.md`／Rule 3（第 3、4 點）；`SKILL.md` Phase 2 步驟 2 | 缺失 | 觀察：Rule 3 第 3 點只處理「前面 Wave 的產出和 `research.md`／spec 不一致」，沒有要求共用欄位依前面 Wave 的資料模型命名，也沒有把「合約需要和資料模型不同」列為上游衝突。第 4 點的建議處理 Skill 有「產出它的 Planner」，但沒有對應的觸發條件。推論：迭代 2、3 主 session 已提示參考前一版的 `data-model.dbml`，新欄位才一致（`iter-2.md:126`），可見沒有提示時，`api-plan` 不會自己對齊。 | 假設 R1 已改正，且 Rule 3 規定「對應資料模型欄位的 schema 欄位依資料模型的字詞、型別與 Enum 值；需要不同時不改資料模型，列為上游衝突並指名 `data-plan`」：P2-2 會用 `reservationNo`、`status` Enum、小寫值，E3、E7 可滿足；資料模型缺欄位時寫入上游衝突，E4 可滿足。E9 的既有欄位也在同一條規則處理。 |
| R3 | `api-plan`／`rules/API合約-格式規範.md`／Rule 1～4（沒有涵蓋互動語意的規則）；`templates/openapi.yaml:4`、`templates/asyncapi.yaml:4` | 缺失 | 觀察：Rule 1 只要求每個 operation 引用至少一個需求，Rule 2 只要求涵蓋 Edge Case 與驗證規則。spec 用 FR 寫出的重試、冪等、順序、逾時、相容要求，沒有規則要求寫進合約。008 的 FR-018 有寫進去，是因為 research §4 的 Decision 涵蓋它（Rule 3），不是因為有規則要求（`specs/008/contracts/openapi.yaml:10、19`）。版本號寫死在樣板。推論：research 沒有涵蓋的語意要求，現在不保證進合約。本專案還沒有產出物實際漏寫的觀察，這一項是靜態缺口。 | 假設新增規則「spec 對 operation 要求這六類語意時，`description` 必須寫出並引用需求編號；spec 沒要求時不得自行加入」：S4 對 008 重跑時，FR-005、FR-014、FR-016、FR-018、FR-020 對應的 operation 都寫出語意，E5 可滿足；S1 的 003 沒有這類要求，E6 可滿足。合約版本號留到第五章，不在本批處理（第 9 節第 4 點）。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H1：`api-plan` 沒有讀 `data/` | 未載入 | 觀察：`api-plan` Phase 1 步驟 4 已讀取 `data/` 的既有檔案。讀不到是因為平行執行時檔案還不存在（R1），不是步驟沒有載入。 |
| H2：`system-analysis` 委派時沒有交出前面 Wave 的產出 | 交接缺陷 | 觀察：Phase 5 步驟 1 已交出 spec 目錄，Planner 在自己的 P1-4 讀目錄內的檔案。改正交接也解決不了同一 Wave 平行執行時檔案不存在的問題。 |
| H3：憲法缺少命名規則 | 缺失（憲法） | 觀察：`.agents/constitution/` 沒有欄位命名規則。反事實：加一條「JSON 用 camelCase、DBML 用 snake_case」只解決 `slot_code` ↔ `slotCode` 的大小寫，解決不了 `reservation_no` ↔ `reservationNumber` 的字詞差異、`status` ↔ `isActive` 的型別差異。另外，決定 9 已選擇「以 `data-plan` 為準」，不選憲法命名規則。 |
| H4：模型能力或個案 | 非 Skill 問題 | 觀察：迭代 1～3 連續 3 次出現同一種差異，003～008 的 Wave 都照 Rule 範例排成平行。現象和 Skill 的範例一致，不是隨機的模型差異。 |
| H5：改成以 `api-plan` 為準，`data-plan` 排在後端之後 | 流程缺陷 | 觀察：計畫第 9 節決定 9，使用者已選「以 `data-plan` 為準」。 |

## 7. 影響範圍

1. 直接或間接委派 `api-plan` 的 Skill：`system-analysis`（Phase 5 步驟 1）。
2. 直接或間接委派 `system-analysis` 的 Skill：無。由 runbook 步驟 5 執行。
3. 不委派、但讀取這兩個 Skill 產出的 Skill（不在修改範圍，供驗收時注意）：
   - `data-plan`：排到後端之前的 Wave 後，同一次迭代讀不到 `contracts/`。平行時本來也讀不到，行為不變。
   - `tasks`、`analyze`、`converge`、`notification-plan`：讀 `plan.md`、`contracts/`、`data/`。
   - `ui-plan`：仍在 Wave 1，看不到後端錯誤碼。這是 `SDD流程不足總整理.md` 第 1 項的後半，不在 C12 範圍。
4. 同步：runbook 步驟 5 說明 Wave 順序改變；`api-plan` 新增 `LICENSE`（contract-driven 說明文件的衍生）；`SDD流程不足總整理.md` 第 1 項更新狀態（計畫第 6 節批 5）。
5. 風險 R15：有資料庫與後端的功能會多一個 Wave。以 003 推算，Wave 從 2 個變成 3 個（前端 → 資料庫 → 後端）。

## 8. 待確認事項

以下保留展示時的原題。第 4、5 題的「E9」「E10」是重新編號前的原 E9、原 E10，處理結果見第 9 節。

1. 第 2 節的驗收條件 E1～E10 是否正確、完整？適用範圍都判為通用，是否符合你的預期？
2. 是否同意第 5 節的根因 R1、R2、R3？R3 沒有實際漏寫的產出物證據，只是靜態缺口，是否仍要在本批處理？
3. E8 是推定：允許 snake_case ↔ camelCase 轉換，字詞、型別、值不同才算不一致。是否需要？還是要求逐字相同？
4. E9 是推定：`info.version` 本批維持 `0.1.0`，相容只寫在 `description`。是否需要？還是要定版本號規則？
5. E10 是推定：延續既有功能的迭代中，前一版合約已有的不一致欄位維持原名、記為上游衝突，只有新欄位對齊資料模型。是否需要？還是要一律對齊、接受破壞相容？
6. `SDD流程不足總整理.md` 第 1 項的後半（`ui-plan` 在 Wave 1 看不到後端錯誤碼）不在本批範圍。更新狀態時寫成「部分處理」，是否同意？
7. 仍缺少的證據：迭代 1 當次 `system-analysis` 與 `api-plan` 的完整執行紀錄（演練表中「無證據」的列）。這些列不影響第一個偏離點的判定。

## 9. 確認結果（2026-11-20）

使用者回覆「都照建議」。依課程查證後的建議處理：

1. 驗收條件：同意，刪除原 E9（版本號），原 E10 縮小為新的 E9，原 E11 改為 E10。
2. 根因：同意 R1、R2、R3；R3 只加一條有條件的規則，不改樣板。
3. E8：允許 snake_case ↔ camelCase 轉換；字詞、型別或值不同才算不一致。要逐字統一時，改用 `constitution` 寫進 `api-plan` 的憲法檔（第三章第 18 單元 34:38）。
4. 原 E9：本批不改合約版本號；記入 `docs/待確認.md` 第 39 項，第五章 Truth 與 `truth-delta.md` 時處理（第五章第 11、12 單元；第四章第 7 單元 26:34）。
5. 新 E9：既有欄位維持原名並列一次上游衝突，新欄位對齊資料模型；完整做法同第 4 點，記入 `docs/待確認.md` 第 39 項。
6. `SDD流程不足總整理.md` 第 1 項更新為「部分處理」，`ui-plan` 看不到後端錯誤碼的部分繼續追蹤。
7. 缺少的執行紀錄不補。
8. C26：允許讀取上游 `speckit-implement` 的 ignore 段落（已讀：npm 為 `.npmignore`（if publishing）、Terraform 為 `.terraformignore`、Helm 為 `.helmignore`；Kubernetes 沒有專屬 ignore 檔，上游只列 `*.secret.yaml`、`secrets/`、`.kube/`、`kubeconfig*`、`*.key`、`*.crt` 等要忽略的樣式）；「要發布 npm」以 `package.json` 沒有 `"private": true` 判斷。


## 10. 驗收失敗的根因分析：S4（2026-11-20）

Phase 5 驗收 S4 判斷 (b) 兩次不通過。依 `skill-engineering` Phase 5 步驟 17 返回 Phase 2。驗收條件 E1～E11 不變。

### 10.1 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E9 | B4 延續 007 合約、和資料模型不一致的欄位維持原名，各列一項上游衝突並指名 `data-plan` | 欄位維持原名，但兩次回報都寫「上游衝突：無」。未列出的不一致：`reservationNumber` ↔ `reservations.reservation_no`（字詞不同，合約 12 處）；`slotCode` 值 `MORNING` 等 ↔ `time_slots.slot_code` 的 `morning` 等（值不同） | 觀察：S4、S4 重跑的子代理回報第 3 項；`specs/008-overdue-discord-notification/data/data-model.dbml:193、208`（repo 與複本相同）、`contracts/openapi.yaml:1353、1400` |

### 10.2 演練表（`api-plan`，S4 與 S4 重跑）

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-4 | `data/`、`contracts/` 既有檔案 | 觀察：兩次回報都比對了 `data-model.dbml` 與 007 合約 | 規劃輸入含資料模型與既有合約 | 同左 | 一致 |
| P1-10、P1-11 | 無 | 無 | 覆寫詢問 | 觀察：兩次都依預先回覆同意覆寫 | 一致 |
| P2-1 | API 合約檢查清單 | 推論：已載入（回報引用 Rule 3 的「後端計算的欄位不算」，依據回報第 3 項） | 檢查清單 | — | 一致 |
| P2-2 | API 合約檢查清單 | 推論：已使用 | 沿用欄位維持原名；和資料模型不一致的沿用欄位列為上游衝突 | 觀察：沿用欄位維持原名；回報寫「B4 與 007 逐 operation 比對，除 `tags`、`description` 外沒有差異」，只把新 schema 和資料模型比對 | 偏離 |
| P3-4 | API 合約檢查清單 | 推論：已使用 | 逐條驗證，發現漏列的上游衝突 | 觀察：未通過項「無」 | 偏離（承接 P2-2） |
| P3-5 | 無 | 無 | 回報上游衝突 | 觀察：「上游衝突：無」 | 偏離（承接 P2-2） |

第一個偏離點：`api-plan` P2-2。兩次執行都以既有合約為底稿修補，沒有從零重寫（觀察：回報第 5 項）。這和偏離無關，S3 也用同樣的方式執行，卻列出了缺欄位的上游衝突（見 H3）。

### 10.3 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R4 | `api-plan`／`rules/API合約-格式規範.md`／Rule 3 第 6 條列（既有合約欄位）與 Good／Bad Example | 不可檢查 | 觀察：第 6 條列先寫「既有合約已有的欄位必須沿用既有名稱，不依前兩點改名」，再寫「和資料模型不一致時，各記為一項上游衝突」。Good／Bad Example 3 只示範新欄位與缺欄位，沒有範例示範「沿用欄位和資料模型不一致」。推論：執行者把第 6 條列讀成豁免資料模型比對，只用「和 007 一致」驗證前半句；後半句沒有可對照的範例，P3-4 逐條驗證時無法判斷漏列（依據 10.2 P2-2、P3-4 的觀察） | 推論：第 6 條列有正反例，Bad Example 寫出「和前一版一致，上游衝突：無」時，P2-2 與 P3-4 會把沿用欄位逐一和資料模型比對，列出 `reservationNumber` 與 `slotCode` 兩項，S4 (b) 可以通過；其餘條列與 S1、S3 行為不變 |

### 10.4 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H1：Rule 3 沒有要求沿用欄位列上游衝突 | 缺失 | 觀察：第 6 條列有「各記為一項上游衝突，建議處理 Skill 為 `data-plan`」 |
| H2：P2-1 沒有載入 Rule 3 | 未載入 | 觀察：兩次回報都引用 Rule 3 第 5 條列的「後端計算的欄位不算」 |
| H3：執行者用修補代替重寫，導致漏查 | 非 Skill 問題 | 觀察：S3 同樣以既有合約修補，仍依有範例的第 5 條列列出 `reservationNumber` 缺欄位的上游衝突。修補方式不會讓有範例的條列失效 |
| H4：模型單次漏判 | 非 Skill 問題 | 觀察：S4 與 S4 重跑用新的複本、相同提示，兩次都漏列同樣的欄位 |

### 10.5 影響範圍

1. 直接或間接委派 `api-plan` 的 Skill：`system-analysis`（Phase 5 步驟 1）。
2. 第 6 條列只在 spec 要求向下相容、合約延續既有合約時適用。S1、S3 沒有這個條件，結果不受影響。

### 10.6 待確認事項

1. 驗收條件 E1～E11 不變，是否同意？
2. 是否同意根因 R4（Rule 3 第 6 條列缺正反例，歸類為不可檢查）？
3. 仍缺少的證據：子代理的完整推理過程。10.2 的「推論」列依據子代理的回報文字。

### 10.7 確認結果（2026-11-20）

使用者回覆「都照建議」：

1. 驗收條件 E1～E11 不變。依據第四章第 1 單元（先寫驗收條件，再讓結果符合它）。
2. 同意根因 R4。依據第二章第 7 單元：每條規則都要有 Good／Bad Example；判準應由範例表達，不多寫重複描述。
3. S5 子代理提出的兩個歧義（Secret manifest 的辨認方式、`.terraform.lock.hcl` 是否算 lock 檔）本批不處理。
