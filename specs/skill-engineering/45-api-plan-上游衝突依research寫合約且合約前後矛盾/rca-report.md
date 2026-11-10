# 根因報告：api-plan－上游衝突依 research 寫合約且合約前後矛盾

- 紀錄目錄：`specs/skill-engineering/45-api-plan-上游衝突依research寫合約且合約前後矛盾/`
- 問題證據：`docs/iterations/iter-5.md`「Skill 問題」問題 4、Skill 表現檢查 `api-plan` 列、步驟紀錄第 5 列；`specs/007-equipment-maintenance-retire/contracts/openapi.yaml` 第 355 行（`createRescheduleRequest`）、第 723 行（`pickupReservationByAdmin`）、第 933 行與第 941 行（`updateEquipmentStatus`），`research.md` 第 65 行（§3），`spec.md` FR-004、FR-005、FR-019（commit `75855c6`）；`analysis.md` F3、F4（commit `96ef51b`）；步驟 5 的 api-plan 子代理紀錄（`~/.claude/projects/-Users-steve-tsao-projects-practice-s-aixbdd-spec-kit/dc2c62d8-d3f4-4b4e-890d-ad8e98bdadf9/subagents/agent-a75cef0d3adac0377.jsonl`，第 1 則委派內容、第 99 則最終回報）；`.agents/skills/api-plan/SKILL.md`、`rules/API合約-格式規範.md` Rule 3；`.agents/skills/system-analysis/SKILL.md` Phase 5；前次紀錄 `specs/skill-engineering/41-api-plan-合約與技術研究衝突時改寫規則/`、`43-technical-research-Decision未核對spec必須規則/blueprint.md` §8

## 1. 使用者回報的問題

第 5 次迭代步驟 5，api-plan 由 system-analysis 在 Wave 2 委派，產出 007 的 `contracts/openapi.yaml`，回報 2 項上游衝突。

1. 衝突 (1)：research §2 的檢查順序和 FR-019 不一致。合約依 spec 寫。
2. 衝突 (2)：research §3 的 `FOR SHARE` 清單沒有「需人工審核設備的改期送出」，會違反 FR-004。api-plan 自己判定違反 FR-004，合約卻照 research 寫，`createRescheduleRequest` 只規定免審核的即時改期先鎖設備列。兩項衝突的處理方式不同。
3. 登記領取不鎖設備列（`analysis.md` F3，違反 FR-005）沒有列為上游衝突。
4. `updateEquipmentStatus` 的開頭寫「之後先讓到期的改期申請失效」，`available` 分支寫「不讀取也不修改任何預約與改期申請」，合約前後矛盾。

原本預期：依 Rule 3 第 2 點「`research.md` 與 spec 不一致時依 spec」，合約規定兩條改期路徑都先以 `FOR SHARE` 鎖設備列，並把這件事記為上游衝突，處理 Skill 寫 `technical-research`。

影響：tasks 沿用成待確認 4 的暫行做法；implement T022 推翻合約與 tasks，兩條路徑都加鎖，才沒有違反 FR-004。合約至今仍只寫免審核路徑。T029 的矛盾由 implement 自行決策，影響小。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 判定 `research.md` 的 `Decision`（含 Decision 漏列 spec 需要的操作或檢查）會讓 spec 的必須／不得規則無法滿足時，合約中受影響的 operation 依 spec 寫出滿足該規則的行為，不照 research 寫出違反 spec 的行為；同一次執行中的每一項都這樣處理 | 本次 | 通用 | S1、S2、S3 |
| E2 | 發現 E1 的情況，或前面 Wave 的產出與 research／spec 不一致時，回報有獨立的「上游衝突」項目，每項寫出衝突內容、上游位置（research 的 § 編號、spec 的需求編號或前面 Wave 產出的位置）、受影響的 `operationId` 與建議處理 Skill；沒有時寫「無」 | 既有（41 的 E2） | 通用 | S1、S2、S3 |
| E3 | 同一份合約中，對同一個 operation 的同一種情況（同一個分支），`info.description`、operation 的 `description` 與 response 說明不得寫出相反的行為（例如開頭寫所有分支都先讓改期申請失效，`available` 分支又寫不讀取也不修改改期申請） | 本次 | 通用 | S1 |
| E4 | research 的 `Decision` 與 spec 一致時，合約依 research 的做法寫，不自行換成另一種做法；只補上上游沒有規定的細節（例如欄位、錯誤碼、檢查先後），且沒有與上游相反時，不記為上游衝突 | 既有（Rule 3 第 1、4 點） | 通用 | S2、S3 |
| E5 | 每個 operation 恰好一個「介面編號 介面名稱」tag，每個可規劃介面至少一個 operation，`description` 引用 spec 存在的需求編號；`check_contracts.py` 沒有 issues | 既有 | 通用 | S1、S2、S3 |
| E6 | 與憲法必須／不得規則無法同時滿足的項目，仍以「憲法衝突」委派 `clarify`；回報仍包含「憲法遵循」 | 既有 | 通用 | S3 |
| E7 | 已存在的合約檔在委派內容沒有說明同意覆寫時，先詢問使用者；不同意時不修改任何檔案 | 既有 | 通用 | S4 |
| E8 | 「上游衝突」只在回報中列出，不因此停止產出、不向使用者提問 | 既有（41 的推定 E6，已確認） | 通用 | S1、S2 |

驗收情境：

- **S1（原始輸入）**：以 `git archive 75855c6` 展開 `specs/`，刪除 `specs/007-equipment-maintenance-retire/` 的 `contracts/`、`data/`，保留 Wave 1 的 `ui/`，回到 Wave 2 開始前的狀態。委派內容只寫 system-analysis Phase 5 步驟 1 規定的項目（Skill 路徑、目標 spec 目錄、負責介面 B1～B6、`contracts/` 不存在、依賴缺口無），不另外要求「不要把合約改寫成和上游相反的規則」。預先回覆：無（不應提問）。判斷：(1) 回報列出 research §3 與 FR-004（需人工審核設備的改期送出）的衝突時，`createRescheduleRequest` 寫明需人工審核設備的改期送出也和設定送修或停用序列化（例如先以 `FOR SHARE` 鎖設備列再檢查狀態），不只規定免審核路徑；沒有列出這項衝突時，此判斷記為「未觸發」，以 S2 判斷 E1；(2) 回報中每項「research 會讓 spec 規則無法滿足」的上游衝突，合約都依 spec 寫；(3) `updateEquipmentStatus` 等 operation 對同一分支沒有相反的描述；(4) 上游衝突每項都有 4 件事；(5) `check_contracts.py` 沒有 issues，過程沒有提問，`git status` 只有 `contracts/`。
- **S2（構造，E1 的主要證據）**：以 `git archive 46d1f7f` 展開 `specs/`，刪除 `specs/006-reservation-reschedule/` 的 `contracts/`、`data/`。在 006 `research.md` §2「管理員核准」的 Decision 刪去「原預約仍為 `confirmed`」這項檢查，使它和 FR-006「核准時必須驗證原預約仍為已核准／有效」無法同時滿足（植入的是「Decision 漏列 spec 需要的檢查」，和 Rule 3 範例的領域不同）。委派內容同 S1 的項目，負責介面為 006 plan.md 的後端介面。預先回覆：無。判斷：(1) `approveRescheduleRequest`（或對應的核准改期 operation）的 `description` 寫明核准時驗證原預約仍為 `confirmed`，不是時拒絕；(2) 回報有一項上游衝突，上游位置為 research §2 與 FR-006，處理 Skill 為 `technical-research`；(3) research 其他沒有植入缺陷的 Decision（交易、`P2002` 轉 409、惰性失效）在合約中照 research 寫，沒有換成另一種做法；(4) `check_contracts.py` 沒有 issues，過程沒有提問。
- **S3（回歸）**：以 `git archive ed0f842` 展開 `specs/`，刪除 `specs/005-equipment-pickup-return/contracts/`，委派 api-plan 處理 005 的後端介面。預先回覆：`clarify` 提問時每題選推薦選項。判斷：(1) `check_contracts.py` 沒有 issues；(2) 回報包含每個介面的 operation 數、「上游衝突」（內容或「無」）與「憲法遵循」；(3) 列出的每項上游衝突都能在 005 research 或 spec 找到對應條目；其中「research 與 spec 無法同時滿足」的項目，合約依 spec 寫；(4) 只補上細節的項目沒有列為上游衝突。
- **S4（回歸）**：同 S3 的環境，但保留 `specs/005-equipment-pickup-return/contracts/openapi.yaml`，委派內容沒有說明同意覆寫。預先回覆：覆寫確認回答「不同意」。判斷：先列出既有合約檔並詢問；回覆後停止，`git status` 沒有變更，檔案雜湊值不變。

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 衝突 (2) 和衝突 (1) 一樣依 spec 寫：`createRescheduleRequest` 的需人工審核路徑也先鎖設備列 | 衝突 (1) 依 spec 寫；衝突 (2) 「違反 FR-004。合約照 research 寫，只在即時改期路徑描述鎖定」 | 觀察：子代理紀錄第 99 則「上游衝突」第 1、2 項；`openapi.yaml` 第 355 行只寫「免審核設備的即時改期在交易第一個語句以 … `FOR SHARE` 鎖定設備列」 |
| E2 | 衝突 (2) 的上游位置寫出 research §3 與 FR-004 | 上游位置只寫「research.md §3」，FR-004 只出現在內容裡 | 觀察：子代理紀錄第 99 則上游衝突第 2 項；衝突 (1) 的上游位置寫「research.md §2 PATCH 步驟 2–3；spec FR-019」 |
| E3 | `updateEquipmentStatus` 對 `available` 分支只有一種描述 | 開頭「之後先讓到期的改期申請失效」適用所有分支；`available` 分支寫「不讀取也不修改任何預約與改期申請」 | 觀察：`openapi.yaml` 第 933、941 行；`info.description` 第 9 行「設備狀態預覽與狀態變更同樣先執行惰性失效」 |

不滿意點 3（登記領取不鎖沒有列為衝突）沒有寫成驗收條件，理由見第 6 節最後一列與第 8 節第 3 題。

## 4. 演練表

`api-plan`（第 5 次迭代 Wave 2，由主 session 依 system-analysis Phase 5 委派，Opus 5.5 子代理）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-3 | 委派內容、spec 清單 | 觀察：第 1 則委派內容指定 007 | 目標 spec | 觀察：產出寫入 007 的 `contracts/` | 一致 |
| P1-4 | spec、plan、techstack、research、`ui/` | 觀察：回報引用 research §1～§3、FR-004、FR-019 與 UI 的「可用 4｜送修中 1｜停用 1」 | 規劃輸入含 research 與 spec | 同左 | 一致 |
| P1-5 | 憲法檔 | 觀察：回報列出已讀 `shared.md`、`openapi.md` | 憲法檢查清單 | 同左 | 一致 |
| P1-6～P1-11 | 無 | 無 | 負責介面 B1～B6，全部歸入 `openapi.yaml`；不需覆寫確認 | 觀察：回報 24 個 operation 分屬 B1～B6，沒有 `asyncapi.yaml` | 一致 |
| P2-1 | `rules/API合約-格式規範.md` | 觀察：回報「『API 合約檢查清單』Rule 1–3 … 全部通過」；上游衝突的 4 件事格式和 Rule 3 第 3 點相同 | API 合約檢查清單（含 Rule 3） | 同左 | 一致 |
| P2-2 | 規劃輸入、憲法檢查清單、API 合約檢查清單 | 已載入 | 依 spec 處理所有「research 會讓 spec 規則無法滿足」的項目；同一分支只有一種行為 | 觀察：衝突 (1) 寫「research 和 spec 不一致時依 spec」，依 spec 設計；衝突 (2) 判定「違反 FR-004」，卻「合約照 research 寫」；`available` 分支的設計和交易開頭的惰性失效相反 | 偏離 |
| P2-3～P2-5 | 無 | 無 | 憲法衝突為空，略過 `clarify` | 觀察：回報「憲法衝突：無，所以沒有委派 `clarify`」 | 一致 |
| P3-1～P3-2 | 合約樣板組 | 觀察：回報「頂層結構和樣板相同」 | `openapi.yaml` | 觀察：第 355、933、941 行寫入 P2-2 的設計 | 偏離（P2-2 的結果） |
| P3-3～P3-4 | `check_contracts.py`；三份檢查清單 | 觀察：第 1 輪 exit 0、issues 0 | 合約檢查通過，逐條驗證檢查清單 | 觀察：腳本只檢查 Redocly、tag、介面涵蓋與需求編號（`--help`）；檢查清單沒有「同一分支不得相反」的項目，所以 941 行的矛盾沒有被找到 | 一致（依現有規則） |
| P3-5 | 無 | 無 | 回報（含上游衝突） | 觀察：第 99 則回報上游衝突 2 項、待確認 4 項 | 一致 |

第一個偏離點：`api-plan` Phase 2 步驟 2（設計 API 合約）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `api-plan`／`rules/API合約-格式規範.md`／Rule 3 第 2 點與 Good Example、Bad Example | 衝突 | 觀察：Rule 3 第 2 點把三種情況並列——「`Decision` 有缺陷」、「`research.md` 與 spec 無法同時滿足」、「前面 Wave 不一致」——主句要求「合約必須保留上游的寫法」，只有括號寫「`research.md` 與 spec 不一致時依 spec」。觀察：Good Example 的 research §2「先查詢再寫入」會讓借閱超過 FR-005 的 5 本上限，是 research 讓 spec 規則無法滿足的情況，範例卻要求「合約仍照 §2 描述」；Bad Example 把滿足 FR-005 的「資料庫鎖保證只成功一筆」標為錯誤。範例與括號的要求相反。觀察：同一次執行中，衝突 (1) 引用括號（「research 和 spec 不一致時依 spec」），衝突 (2) 把漏列操作當成「Decision 有缺陷」，照主句與範例保留 research，上游位置也只寫 research §3（子代理紀錄第 99 則）。推論：Rule 3 對「Decision 有缺陷且因此違反 spec」同時給出兩種答案，子代理對兩項衝突各採一種，所以處理方式不同（依據上列三項觀察）。觀察：Rule 3 第 1 點又禁止「另一種做法」，research 沒有列出的鎖是否算「另一種做法」，規則沒有界線，也讓「依 spec」容易被讀成違反第 1 點 | 假設 Rule 3 只有一種讀法：「research 的 Decision（含漏列）會讓 spec 必須規則無法滿足時，受影響的 operation 依 spec 寫出滿足規則的行為（沿用 research 已採用的機制補上），並記為上游衝突，上游位置寫出 research 與 spec 編號」，範例也照這個讀法。在 P2-2，衝突 (2) 會和衝突 (1) 一樣依 spec 設計，`createRescheduleRequest` 的需人工審核路徑也先鎖設備列，E1、E2 成立；research 與 spec 一致時仍照 research，E4 成立；其他步驟不受影響，E5～E8 成立 |
| R2 | `api-plan`／`rules/API合約-格式規範.md`（Rule 1～3 都沒有）；由 Phase 3 步驟 4 逐條驗證 | 缺失 | 觀察：Rule 1～3 只規定 tag 與需求引用、Edge Case 對應與錯誤 schema、上游決策；Phase 3 步驟 4 的 `CHECK` 驗證腳本、三份檢查清單、樣板結構與填寫要求，沒有任何部位要求同一份合約對同一分支不得寫出相反的行為。觀察：`check_contracts.py --help` 只檢查 Redocly、tag、介面涵蓋與需求編號，不比對語意。觀察：`openapi.yaml` 第 933 行的「之後先讓到期的改期申請失效」和第 9 行 `info.description` 一致，第 941 行 `available` 分支寫相反的「不讀取也不修改任何預約與改期申請」。推論：預期沒有在任何部位表達，所以 P3-4 依現有規則判定通過，矛盾留到 implement T029（依據上列觀察） | 假設 API 合約檢查清單有一條「同一 operation 的同一分支，`info.description`、`description` 與 response 說明不得相反」，P3-4 已規定「逐條驗證 API 合約檢查清單」，會比對 933 行與 941 行，修正 `available` 分支的描述後返回 P3-3，E3 成立；其他步驟不變 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| 子代理沒有載入 Rule 3 | 未載入 | 觀察：回報寫「Rule 1–3 … 全部通過」，上游衝突的 4 件事格式和 Rule 3 第 3 點相同，衝突 (1) 引用 Rule 3 括號的原句 |
| 模型粗心，Rule 3 本身沒有問題 | 非 Skill 問題（模型能力） | 觀察：Rule 3 的 Good Example 就是「research 缺陷讓 spec 規則無法滿足，合約照 research」，子代理對衝突 (2) 的做法和範例相同（R1 的觀察），所以這是規則與範例互相矛盾，不是沒有遵守已寫的規則 |
| 委派內容「不要把合約改寫成和上游相反的規則」讓子代理照 research 寫 | 交接缺陷（system-analysis） | 觀察：system-analysis Phase 5 步驟 1 規定的委派項目沒有這一句，是主 session 額外加的；觀察：同一份委派內容下，衝突 (1) 仍依 spec 寫，所以這一句不是兩項處理方式不同的原因。S1 改用只含步驟 1 項目的委派內容，避免干擾 |
| 合約矛盾可以改由 `check_contracts.py` 檢查 | 載體過弱 | 推論：矛盾是兩段自然語言描述的語意相反（933 行與 941 行），腳本無法可靠判斷，只能由 AI 依檢查清單比對（依據 R2 的 `--help` 觀察） |
| 合約矛盾只是模型疏忽 | 非 Skill 問題（模型能力） | 觀察：沒有任何部位要求檢查合約內部的一致性（R2 的觀察），依缺陷類型表屬於「預期沒有在任何部位表達」 |
| 登記領取不鎖（F3）沒有列為衝突，是 api-plan 缺少「核對 research 是否滿足 spec 必須規則」的步驟 | 缺失（api-plan）／非 Skill 問題（責任在上游） | 觀察：research §3 的清單沒有登記領取，合約 `pickupReservationByAdmin`（第 723 行）沒有寫鎖，也沒有和上游相反，所以合約本身沒有違反 Rule 3。觀察：technical-research 已在 `be06f9c` 要求 Decision 在同時、先後情境下符合 spec 必須規則（含既有操作），43 的驗收 S1 重跑 007 時，登記領取已和送修序列化（43 `blueprint.md` §8）。觀察：analyze 抓到 F3（`analysis.md` 第 15 行）。推論：要 api-plan 主動找出 research 的每個並發缺口，等於在每個 Planner 重做 technical-research 的核對；建議不列為 api-plan 的驗收條件（見第 8 節第 3 題） |

## 7. 影響範圍

- 直接委派 api-plan 的 Skill：`system-analysis`（Phase 5 步驟 1 依 Wave 委派，步驟 3 原文轉述「上游衝突」）。本次只會改變 api-plan 的處理方式，回報項目與格式不變，system-analysis 的轉述不受影響。
- 沒有其他 Skill 間接委派 api-plan。
- 同類寫法：`ui-plan` Rule 4（`ca01fc0`）的第 2 點沿用同一句，但 Good Example 1 已依 FR-003 保留額滿提示，範例和括號一致，沒有 R1 的範例衝突；主句與括號的並列寫法相同。`data-plan` 沒有上游衝突規則（iter-5 問題 3 已註明）。

## 8. 待確認事項

1. 驗收條件 E1～E8 是否正確、完整？E1、E3 是本次新增；E2、E4～E8 是既有預期，其中 E8 沿用 41 已確認的推定。
2. 是否同意根因 R1（Rule 3 第 2 點的主句、括號和範例對「research 缺陷讓 spec 無法滿足」給出相反答案）與 R2（沒有部位要求合約內部不得自相矛盾）？
3. 不滿意點 3（登記領取不鎖沒有列為衝突）：建議不列為 api-plan 的驗收條件，也不修改 api-plan。理由：合約沒有和上游相反；找出 research 的並發缺口是 technical-research 的責任，`be06f9c` 已修正，analyze 也有抓到。若你希望 api-plan 也要主動核對，我會加一條推定的驗收條件，並說明它和 technical-research 重複的範圍。
4. 驗收情境：S2 在 006 research §2 植入缺陷（刪去「原預約仍為 `confirmed`」），作為 E1 的主要證據，因為 S1 不一定會再次發現衝突 (2)。是否同意這個植入方式？
5. 仍缺少的證據：無。子代理沒有留下推理紀錄（thinking 為空），衝突 (2) 為何歸類為「Decision 有缺陷」只能從回報文字推論。

## 9. 確認紀錄

- 2026-11-10：使用者確認根因報告。
  1. 同意驗收條件 E1～E8 與根因 R1、R2。
  2. 不滿意點 3（登記領取不鎖，`analysis.md` F3）照第 8 節第 3 題的建議處理：不列為 api-plan 的驗收條件，也不修改 api-plan。
  3. 同意 S2 的植入方式：在 006 `research.md` §2「管理員核准」的 Decision 刪掉「原預約仍為 `confirmed`」。

## 10. 驗收失敗後的補充根因（Phase 5 步驟 17 返回本 Phase）

### 10.1 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E2 | S2：research §2「管理員核准」漏列「原預約仍為 `confirmed`」，回報有一項上游衝突，上游位置為 research §2 與 FR-006 | 合約 `approveRescheduleRequest` 依 FR-006 寫了這項檢查（E1 成立），回報的上游衝突只有 `listAllReservations` 一項，沒有這一項 | 觀察：`/tmp/acc45/s2/.../contracts/openapi.yaml` 第 605 行；子代理最終回報「上游衝突」只有 1 項；子代理紀錄中，撰寫第 605 行前後都沒有提到 research §2 的檢查清單 |
| E2 | S1：research §3 只列「成員即時改期」先鎖設備列，需人工審核的改期送出也要鎖（FR-004） | 合約 `rescheduleReservation` 兩條路徑都寫先鎖（E1 成立），並寫「依 research §3 與 FR-009」，沒有記為上游衝突（依判斷方式記為「未觸發」） | 觀察：`/tmp/acc45/s1/.../contracts/openapi.yaml` 第 413 行；`research.md` 第 65 行 |

### 10.2 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R3 | `api-plan`／`rules/API合約-格式規範.md`／Rule 3 第 2 點的觸發條件與第 5 點 | 不可檢查 | 觀察：第 2 點以「判定 `Decision` … 會讓 spec 的必須／不得規則無法滿足時」開頭，沒有說明要比對什麼才算判定。觀察：S1、S2 的子代理都直接依 spec 寫出 research 漏列的鎖或檢查，E1 成立，卻沒有把它和 research 的清單比對，所以沒有形成「判定」，也沒有記為上游衝突；S1 還把補上的鎖寫成「依 research §3」。觀察：同一次 S1、S2 中，子代理對「research 清單沒有列出的 operation」（S1 登記領取、S2 全體預約查詢）有記為上游衝突。推論：子代理只在「整個 operation 不在 research 清單」時會發現；「operation 在清單內，但清單少一項檢查或少一條路徑」時，依 spec 寫完就沒有回頭比對（依據上列觀察）。觀察：第 5 點「補上上游沒有規定的細節…不算上游衝突」的「上游」沒有指明是 research 還是 spec，漏列的檢查也可能被讀成「research 沒有規定的細節」 | 假設第 2 點改成可檢查的寫法：「合約為了滿足 spec 必須／不得規則而寫出的操作、檢查、路徑或鎖，`Decision` 對同一 operation 已列出清單卻沒有這一項時，就是本點的情況」，第 5 點寫明「spec 必須規則要求、`Decision` 漏列的項目不算細節」。S2 寫第 605 行時，比對 research §2 的 3 項與 FR-006 的 4 項，會記出上游衝突；S1 的 `rescheduleReservation` 也會記出 research §3 與 FR-004。其他步驟不受影響，E1、E3～E8 維持 |

### 10.3 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| S2 的植入太弱：research §2 仍寫「依 FR-006 檢查…」，子代理可以合理地把它讀成「依 FR-006 全部檢查」 | 測試環境 | 部分成立，不能完全排除。但 S1 是原始輸入，research §3 沒有「依 FR-xxx」的字樣，子代理同樣依 spec 補上卻沒有記為衝突，所以植入方式不是唯一原因 |
| 新的 Rule 3 沒有被載入 | 未載入 | 觀察：S1、S2 都記了「research 清單沒有列出的 operation」，上游位置同時寫 research 與 spec，並寫「沿用 §3 的機制」，用的是新 Rule 3 第 2、4 點的寫法 |
| 要 api-plan 主動找出 research 的所有缺口（第 8 節第 3 題） | 責任在上游 | R3 不要求 api-plan 主動找出缺口，只要求比對「合約自己已經依 spec 寫出、而 research 清單沒有」的項目，範圍是合約已寫出的內容 |

### 10.4 待確認事項

1. 是否同意 R3（第 2 點的觸發條件不可檢查，第 5 點的「上游」沒有指明）？
2. 修改方向：只改 `rules/API合約-格式規範.md` Rule 3 第 2 點與第 5 點的文字，並在 Good Example 1 補一句「比對 §3 清單與 FR-005」。SOP 不改。
3. 驗收情境不變，重跑 S1、S2（S3、S4 已通過，Rule 3 修改後也重跑 S3 確認沒有多報）。

## 11. 確認紀錄（R3）

- 2026-11-10：使用者確認第 10 節。
  1. 同意根因 R3：Rule 3 第 2 點的觸發條件不可檢查，第 5 點的「上游」沒有指明。
  2. 同意修改方向：只改 `rules/API合約-格式規範.md` Rule 3 第 2 點、第 5 點與 Good Example 1；SOP 與驗收條件不改。
  3. 同意修改後重跑 S1、S2、S3。
