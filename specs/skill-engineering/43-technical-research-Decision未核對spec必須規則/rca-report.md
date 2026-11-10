# 根因報告：technical-research－Decision 未核對 spec 必須規則

- 紀錄目錄：`specs/skill-engineering/43-technical-research-Decision未核對spec必須規則/`
- 問題證據：`docs/iterations/iter-5.md`「Skill 問題」問題 2、「Skill 表現檢查」`technical-research` 列；`specs/007-equipment-maintenance-retire/research.md`（commit `75855c6`）第 27 行（§1）、第 37 行（§2）、第 46 行（§2 Rationale）、第 65、69 行（§3）、第 108 行（§5）；`specs/007-equipment-maintenance-retire/spec.md`（commit `6918e53`，步驟 4 讀到的版本）第 50 行（US1 情境 14）、第 60 行（FR-004）、第 61 行（FR-005）、第 64 行（FR-008）、第 67 行（FR-019）、第 125 行（Edge Cases「確認視窗開啟後資料改變」）、Key Entities「設備狀態變更紀錄」；`specs/007-equipment-maintenance-retire/analysis.md` F2～F5；步驟 4 的對話紀錄（session `3420ef5b`，以下「紀錄第 N 項」指依序列出的訊息內容項序號；模型的思考內容沒有保存，THINK 步驟只能從產出判斷）；`.agents/skills/technical-research/SKILL.md`、`rules/技術決策-格式規範.md`、`rules/技術堆疊-格式規範.md`、`templates/research.md`

## 1. 使用者回報的問題

第 5 次迭代步驟 4，research.md 有 4 項 Decision 和 spec 既有的必須規則衝突：

1. §2 先判斷 `EQUIPMENT_STATUS_UNCHANGED`，再比對 `expectedCurrentStatus`。另一位管理員先改了狀態時，回的不是 FR-019 規定的「設備狀態已被變更，請重新確認」（F2）。
2. §3 的 `FOR SHARE` 清單沒有登記領取。設定送修可能在登記領取之後成功，違反 FR-005、SC-003（F3）。
3. §3 的清單沒有需人工審核設備的改期送出，會留下指向已取消預約的改期審核中申請，違反 FR-004（F4）。
4. §1 以 demo seed 的 `deleteMany` 重設當作不採用觸發器的理由，seed 會刪除狀態變更紀錄，和 FR-008「紀錄不得刪除」衝突（F5）。

4 項都是 HIGH，都由下游處理。F3 沒有任何 Planner 發現，到 `analyze` 才抓到。F3、F4 若照 research 實作會是程式錯誤，`implement` 推翻 research 後加鎖才避免。

原本預期：每個 Decision 符合它影響到的 spec 必須規則；做不到時寫進「決策缺口」，委派 `clarify` 讓使用者決定。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | `research.md` 的每個 Decision，在它適用的每種情境下，都不產生違反目標 spec 必須／不得規則（FR、NFR、SC、驗收情境、Edge Cases、Key Entities 的結構約束）的結果。「情境」包含：和其他操作（本次新增，或依 FR-018 等保留的既有操作）同時或先後發生，以及需人工審核等分支。Rationale 寫「滿足 FR-x」的敘述，在這些情境下也成立 | 本次 | 通用 | S1 |
| E2 | 沒有候選方案能同時滿足受影響的必須規則，或要滿足規則必須先做需求層面的決定（例如某個操作是否算規則的例外）時，Skill 不自行決定。它委派 `clarify` 讓使用者決定，依決定寫 Decision，並在 Rationale 寫出決定；Phase 3 回報列出這些項目 | 本次 | 通用 | S1 |
| E3 | 每個主題符合 `rules/技術決策-格式規範.md` Rule 1～3：單一 Decision、不違反使用者技術限制、Rationale 可追溯、Alternatives 有名稱與具體捨棄原因 | 既有 | 通用 | S1、S2 |
| E4 | 「主題清單」涵蓋每項使用者技術限制與影響技術選型的 FR／SC；每個主題都有章節，編號從 1 連續，欄位順序符合樣板 | 既有 | 通用 | S1、S2 |
| E5 | 只在目標 spec 目錄寫入 `research.md` 與 `techstack.md`；兩份任一已存在時先問是否覆寫；`techstack.md` 符合技術堆疊規範 | 既有 | 通用 | S1、S2 |
| E6 | Phase 3 回報包含兩份檔案路徑、每個主題的 Decision 摘要、經 `clarify` 由使用者決定的項目、未通過項與憲法遵循 | 既有 | 通用 | S1、S2 |
| E7 | 目標 spec 的必須規則沒有真的被 Decision 違反、也沒有真的互相衝突時，Skill 不為此委派 `clarify`，也不回報不存在的衝突；回報的每項衝突都指出 spec 中實際存在的條目 | 推定 | 通用 | S2 |

E7 推定理由：E2 讓 Skill 多一條委派 `clarify` 的路徑。沒有 E7 時，Skill 可能為了保險，把一般的技術取捨都當成需求衝突來問使用者。

驗收情境：

- **S1（原始輸入）**：在暫存目錄以 `git archive 6918e53` 展開 `specs/` 與 `apps/`（`specs/007-equipment-maintenance-retire/` 只有 `spec.md`，`apps/equipment-loan/` 是 007 實作前的程式），再複製修改後的 `.agents`、`.claude`、`AGENTS.md`、`CLAUDE.md`。backend 的 `node_modules` 以符號連結指向正式目錄，只供查證 CLI 與型別版本。輸入與第 5 次迭代 P4 相同：目標 spec `specs/007-equipment-maintenance-retire/spec.md`；技術限制「沿用 `specs/006-reservation-reschedule/techstack.md`，只研究本次新增的技術主題。原始碼位置不變」。預先回覆：`clarify` 提問時每題選推薦選項。判斷：
  1. 另一位管理員先改了設備狀態（包含改成同一個目標狀態）時，Decision 描述的流程回 FR-019 規定的拒絕與訊息。
  2. 會讓設備產生未結束預約、借用中預約或改期審核中申請的操作（新增預約、核准待審預約、即時改期、核准改期申請、需人工審核設備的改期送出、登記領取），都和設定送修或停用序列化；或 Decision 寫出另一種機制，並說明 FR-004、FR-005、FR-009 在同時發生時成立。
  3. demo seed 的重設不刪除設備狀態變更紀錄；或 FR-008 與 seed 重設的關係已委派 `clarify`，依使用者的決定寫入 Decision 與 Rationale。
  4. E3～E6 成立。
- **S2（回歸）**：在暫存目錄以 `git archive b18f186` 展開 `specs/` 與 `apps/`（`specs/006-reservation-reschedule/` 只有 `spec.md`），其餘同 S1。輸入：目標 spec `specs/006-reservation-reschedule/spec.md`；技術限制「沿用 `specs/005-equipment-pickup-return/techstack.md`，只研究本次新增的技術主題。原始碼位置不變」。預先回覆：`clarify` 提問時每題選推薦選項。判斷：E3～E7 成立；回報或 `clarify` 提問中的每項衝突，都能在 006 spec 找到對應的條目。

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | §2 的檢查順序在「另一位管理員先改了狀態」時回 FR-019 的訊息 | 先判斷 `EQUIPMENT_STATUS_UNCHANGED`，同目標狀態時回另一個錯誤碼 | 觀察：`research.md` 第 37、38 行；`spec.md` 第 67 行 FR-019、第 125 行 Edge Cases；`analysis.md` F2 |
| E1 | §3 的序列化涵蓋登記領取與需人工審核設備的改期送出 | 清單只有新增預約、核准待審預約、即時改期、核准改期申請 | 觀察：`research.md` 第 65 行；`analysis.md` F3、F4 |
| E1 | §2 Rationale「單一交易……滿足 FR-004、FR-005、SC-003」在同時發生時成立 | 在 `READ COMMITTED` 下，借用中檢查後提交的登記領取，與還沒提交的改期申請，都不在設定交易的檢查範圍內 | 觀察：`research.md` 第 33、46 行；`analysis.md` F3、F4 |
| E1、E2 | seed 重設不刪除狀態變更紀錄，或交給使用者決定 | §1 以 `deleteMany` 重設當作不採用觸發器的理由；§5 只寫「擴充 `npm run db:seed`」；沒有委派 `clarify` | 觀察：`research.md` 第 27、108 行；紀錄第 34 項（讀到 `seed.ts` 第 33～39 行的 `deleteMany`）、第 58 項（「沒有決策缺口，不需要 `clarify`」）；`analysis.md` F5 |
| E6 | 回報這 4 項，或回報經 `clarify` 決定的項目 | 回報「問題：沒有」 | 觀察：紀錄第 74 項 |

## 4. 演練表

`technical-research`（第 5 次迭代步驟 4）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-3 | 使用者需求、spec 清單 | 觀察：紀錄第 4、15 項 | 目標 spec 為 007 | 觀察：同左 | 一致 |
| P1-4 | 目標 spec 全文、憲法檔 | 觀察：紀錄第 15、18 項讀 spec 全文；紀錄第 20 項讀 `shared.md`（technical-research 憲法檔不存在） | 研究輸入、憲法檢查清單 | 觀察：同左 | 一致 |
| P1-5～P1-6 | 無 | 無 | 目錄沒有既有檔案，略過 | 觀察：紀錄第 15 項 `ls` 只有 `spec.md` | 一致 |
| P1-7 | 研究輸入 | 已載入；另讀 006 techstack／research、既有程式（紀錄第 20～36 項） | 主題清單；每項限制與影響技術選型的 FR／SC 至少歸入一個主題 | 觀察：5 個主題；紀錄第 63 項列出 research 引用了 FR-001～FR-020。FR-004、FR-005 歸在 §2，§3 只列 FR-009、SC-002、NFR-002 | 一致（步驟只要求至少歸入一個主題） |
| P1-8 | 主題清單、憲法檢查清單 | 已載入 | 決策缺口 | 觀察：紀錄第 58 項「沒有決策缺口」。這時已讀到 seed 的 `deleteMany`（紀錄第 34 項）、FR-008「紀錄不得刪除」與 US1 情境 14「demo seed 重設」。步驟列的缺口類別只有：使用者限制互相衝突、限制與需求衝突、限制或需求與憲法衝突、取決於使用者偏好；沒有「需求之間衝突」或「必須規則無法由任何候選方案滿足」 | 一致（依步驟文字）；預期的缺口不在步驟列的類別中 |
| P2-1 | 官方文件 | 觀察：紀錄第 44～54 項查 PostgreSQL 18 列鎖衝突表、`ALTER TYPE`、Prisma | 查證結果 | 觀察：同左 | 一致 |
| P2-2 | `rules/技術決策-格式規範.md` | 觀察：紀錄第 41 項 | 技術決策檢查清單 | 觀察：同左。Rule 1 第 4 點只要求不違反「使用者在輸入中提出的技術限制」；Rule 2 第 2 點只要求「引用的 spec 編號必須存在」 | 一致 |
| P2-3 | 研究輸入、查證結果、兩份檢查清單 | 已載入 | 每個 Decision 在適用情境下不違反 spec 必須規則（E1） | 觀察：§2 檢查順序與 FR-019 的情境不符；§3 清單漏了登記領取與需人工審核的改期送出；§1 以 `deleteMany` 為理由；§2 Rationale 宣稱滿足 FR-004、FR-005、SC-003 | 偏離 |
| P2-4～P2-5 | research 樣板組 | 觀察：紀錄第 41 項 | 依樣板寫入 | 觀察：紀錄第 59 項 | 一致 |
| P2-6 | 憲法、技術決策檢查清單、樣板組 | 已載入 | 找出 P2-3 違反必須規則的 Decision 並修正 | 觀察：紀錄第 62 項修正兩處寫法並列出引用的編號（只確認編號存在）；紀錄第 65 項在 §2 補引用 SC-003。沒有拿 Decision 和 FR-004、FR-005、FR-008、FR-019 比對 | 偏離（P2-3 的結果沒有被抓到） |
| P3-1～P3-5 | 技術堆疊檢查清單、techstack 樣板組 | 已載入 | `techstack.md` | 觀察：紀錄第 68 項 | 一致 |
| P3-6 | 無 | 無 | 回報衝突或經 `clarify` 決定的項目 | 觀察：紀錄第 74 項「問題：沒有」 | 偏離（P2-3 的結果） |

第一個偏離點：`technical-research` Phase 2 步驟 3（決定 Decision），並在步驟 6（驗證）沒有被抓到。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `.agents/skills/technical-research/rules/技術決策-格式規範.md` Rule 1、Rule 2；由 `SKILL.md` Phase 2 步驟 3、6 套用 | 缺失 | 觀察：Rule 1 第 4 點只禁止違反使用者技術限制；Rule 2 第 2 點只檢查引用的編號存在；SKILL.md Phase 2 步驟 6 只驗證憲法、技術決策檢查清單與樣板。沒有任何部位要求「Decision 不得違反目標 spec 的必須／不得規則」，也沒有說明要拿哪些規則、在哪些情境下比對。觀察：P2-6 只列出引用編號（紀錄第 62 項）。推論：§2 Rationale 寫了「滿足 FR-004、FR-005」，但這句話是否成立，沒有規則要求檢查（依據上述觀察）。觀察：同一模型（Claude Code＋Opus 5.5）在 `analyze` 以跨文件比對規則檢查時，從同一份 spec 與 research 找出 F2～F5 | 假設規則要求：每個 Decision 列出它影響的必須／不得規則（不限本主題引用的編號，包含其他主題與既有操作相關的規則），逐條檢查「同時、先後發生與分支」情境下是否成立，P2-6 逐條驗證。F2：FR-019 與 Edge Cases 第 125 行明寫「另一位管理員改了設備狀態」，P2-6 會發現順序不符並修正。F4：FR-004 在需人工審核分支下比對 §3 清單，會補上改期送出。F3：FR-005 依賴「借用中」狀態，登記領取是 005 的既有操作（紀錄第 36 項讀過 005 的 migration），比對會補上登記領取；這一項要求執行者列出會改變該狀態的既有操作，是否找到仍取決於模型。F5：FR-008 比對 §1、§5，會發現 `deleteMany` 違反規則；若有方案不刪除紀錄就改寫，沒有時見 R2。E1 可成立 |
| R2 | `.agents/skills/technical-research/SKILL.md` Phase 1 步驟 8～9、Phase 2 | 流程缺陷 | 觀察：Phase 1 步驟 8 的缺口類別沒有「需求之間衝突」或「必須規則無法由任何候選方案滿足」；`clarify` 只在 Phase 1 步驟 9 委派，Phase 2 沒有任何 `DELEGATE` 步驟。觀察：F5 的 FR-008「紀錄不得刪除」與 US1 情境 14「demo seed 重設」，`analysis.md` 判為「需要使用者決定」。推論：R1 改正後，P2-3 或 P2-6 才發現某個必須規則沒有方案能滿足、或需要先決定例外時，Skill 沒有回到 `clarify` 的路徑；執行者只能自行決定「seed 重設是例外」，或留下違反規則的 Decision，E2 不成立（依據上述觀察） | 假設 Phase 1 步驟 8 的缺口包含這兩種情況，且 Phase 2 在決策或驗證時發現這種情況，會加入「決策缺口」、委派 `clarify`、再重新決策：F5 若沒有不刪除紀錄的重設方式，會問使用者「seed 重設是否算 FR-008 的例外」，依答案寫入 §1、§5。E2 成立；E3～E6 的步驟不受影響 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| spec 或技術決策規範沒有在決策前載入 | 未載入 | 觀察：紀錄第 15、18 項讀 spec 全文，紀錄第 41 項讀規則與樣板，都在紀錄第 59 項寫入之前 |
| spec 缺少需求，research 無從得知（需求缺漏） | 非 Skill 問題（上游內容） | 觀察：FR-004、FR-005、FR-008、FR-019 與 Edge Cases 第 125 行都在 `6918e53` 的 spec 中；`analyze` 只靠 spec 與 research 就找出 F2～F5；`iter-5.md`「Skill 表現檢查」已判定不是需求缺漏（與 iter-4 C1、C4 不同）。F5 涉及的 FR-008 與情境 14 的張力，由 R2 處理 |
| 模型推理能力不足，規則已有但模型想不到並發情境 | 非 Skill 問題 | 觀察：同一模型在 `analyze` 有比對規則時找出 F2～F5；research §3 第 69～71 行也做了 `FOR SHARE`／`FOR KEY SHARE` 的並發推理。推論：缺的是「要拿哪些規則比對」，不是推理能力 |
| Phase 1 步驟 7 把 FR-004、FR-005 分到 §2，§3 因此沒考慮它們 | 流程缺陷 | 觀察：步驟 7 只要求每條 FR 至少歸入一個主題，FR-004、FR-005 在 §2，符合步驟文字；§2 Rationale 自己就引用了 FR-004、FR-005，違反仍然存在。推論：即使分到 §3，也沒有步驟檢查 Decision 是否真的滿足它們，根因仍是 R1 |
| 應由下游 Planner 補上（api-plan Rule 3 等） | 交接缺陷（下游） | 觀察：F3 沒有任何 Planner 發現；api-plan 的衝突 (2) 發現了 F4 卻照 research 寫（問題 4）。推論：下游規則只能減少流到實作的錯誤，不能讓 `research.md` 本身符合 E1 |

## 7. 影響範圍

- 依結構診斷，沒有 Skill 委派 `technical-research`（`callers.technical-research` 為空）。
- `technical-research` 只委派 `clarify`。`clarify` 是外部 Skill，本次根因不在其中。
- 下游讀取 `research.md` 的 Skill：`system-analysis`、`api-plan`、`data-plan`、`ui-plan`、`tasks`、`analyze`、`implement`。這次的 4 項衝突經過這些 Skill，到 `analyze` 才全部抓到，`implement` 自行決策。
- 觀察：`api-plan` Rule 3（`6669ebd`）假設「research 與 spec 不一致時依 spec」；research 違反 spec 的情況減少，問題 4 的觸發機會也會減少。問題 4 另外處理。

## 8. 待確認事項

1. 驗收條件 E1～E7 是否正確、完整？E7 是推定的，是否需要？
2. 是否同意根因 R1（技術決策規範沒有要求 Decision 符合 spec 的必須規則，也沒有比對範圍）？
3. 是否同意根因 R2（必須規則無法由任何方案滿足、或需要先決定例外時，沒有回到 `clarify` 的路徑）？R2 本次沒有實際發生，是 R1 改正後遇到 F5 這類情況會發生的事。
4. S1、S2 以 `git archive` 取出實作前的 `specs/` 與 `apps/`，讓 research 讀到的程式和當時一樣。可以嗎？
5. 缺少的證據：步驟 4 的模型思考內容沒有保存，P1-7、P1-8、P2-3 只能從產出判斷。其餘無。

## 9. 確認紀錄

- 2026-11-10：使用者確認：
  1. 同意驗收條件 E1～E7（含推定的 E7）、根因 R1、R2。
  2. 同意 S1、S2 以 `git archive` 取出實作前的 `specs/` 與 `apps/`。
- 使用者補充：
  1. R1 的新規則要寫出比對範圍：受影響的必須規則、同時／先後／分支情境，以及既有操作。不要只加一句「不得違反 spec」。
  2. R2 不新增 Phase。Phase 2 驗證時發現沒有方案能滿足必須規則，或需要先決定例外，就加入決策缺口，回到 Phase 1 步驟 9 委派 `clarify`，最多回去 1 次。
  3. S1 若只漏掉登記領取，先檢查產出是否照新規則列出會改變借用中狀態的既有操作。有列但不完整時記為模型差異，不回頭修 Skill。
