# 根因報告：ui-plan－未比對 research 決策也未回報上游衝突

- 紀錄目錄：`specs/skill-engineering/44-ui-plan-未比對research決策也未回報上游衝突/`
- 問題證據：`docs/iterations/iter-5.md`「Skill 問題」問題 3、Skill 表現檢查 `ui-plan`（F6）列、步驟紀錄第 5 列；`specs/007-equipment-maintenance-retire/research.md` 第 88 行、`ui/plan.md` 第 156、158、199 行（commit `75855c6`）；`analysis.md` F6；`tasks.md` T024、T027（Notes 待確認 2）；步驟 5 的 ui-plan 子代理紀錄（`~/.claude/projects/-Users-steve-tsao-projects-practice-s-aixbdd-spec-kit/dc2c62d8-d3f4-4b4e-890d-ad8e98bdadf9/subagents/agent-a2bfbdd24842d825e.jsonl`，「紀錄第 N 次工具呼叫」是 assistant 的 tool_use 依序編號）；`.agents/skills/ui-plan/SKILL.md`、`rules/畫面規劃-格式規範.md`、`rules/HTML雛形-格式規範.md`、`templates/ui-plan.md`；對照用 `.agents/skills/api-plan/SKILL.md` Phase 2 步驟 2、Phase 3 步驟 5 與 `rules/API合約-格式規範.md` Rule 3（commit `6669ebd`）、`.agents/skills/system-analysis/SKILL.md` Phase 5、`.agents/skills/data-plan/SKILL.md`

## 1. 使用者回報的問題

第 5 次迭代步驟 5，ui-plan 在 Wave 1 讀了 research.md。research §4 的 Decision 寫：「我的預約」與全體預約管理在 `cancelReason` 為 `member_cancelled` 時不顯示原因。ui/plan §4、§5 卻在全體預約管理（`admin.html`）顯示「成員取消」。ui-plan 回報「上游衝突：沒有」，4 項待確認也沒有這一項。tasks 才以待確認 2 列出，analyze 判為 F6（HIGH），implement 依 tasks 暫行做法顯示「成員取消」，research.md 與畫面不一致。

原本預期：和 research 的 Decision 不同時，照 research 寫，或把差異明確回報成上游衝突，寫出衝突內容、research 的 § 編號與處理 Skill（比照 api-plan Rule 3）。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | `ui/plan.md` 與 HTML 雛形中的畫面行為與顯示內容（第 3.3 節的操作、第 4 節的狀態呈現、第 5 節的畫面回饋），不得與 `research.md` 各主題 `Decision` 中規定畫面的內容或 spec 的需求相反；判定 research 有缺陷、research 與 spec 無法同時滿足，或前面 Wave 的產出與 research／spec 不一致時，保留上游的寫法（research 與 spec 不一致時依 spec），不自行改成另一種做法 | 本次 | 通用 | S1 |
| E2 | 發現 E1 的情況時，ui-plan 的回報有獨立的「上游衝突」項目，每項寫出衝突內容、上游位置（`research.md` 的 § 編號、spec 的需求編號或前面 Wave 產出的檔案與位置）、`ui/plan.md` 中受影響的頁面與節，以及建議的處理 Skill；沒有衝突時寫「無」 | 本次 | 通用 | S1、S2 |
| E3 | `check_ui.py` 沒有 issues；`ui/plan.md` 符合 UI 規劃樣板與畫面規劃 Rule 1～3；頁面清單的每一頁都有 HTML，入口為 `index.html` | 既有 | 通用 | S1、S2 |
| E4 | 視覺風格有缺口或有憲法衝突時，仍委派 `clarify` 取得使用者決定；回報仍包含「憲法遵循」 | 既有 | 通用 | S2 |
| E5 | `ui/` 已有檔案，且委派內容沒有說明同意覆寫時，先詢問使用者；不同意時不修改任何檔案 | 既有 | 通用 | S3 |
| E6 | 「上游衝突」只在回報中列出，不因此停止產出、不向使用者提問。推定理由：ui-plan 通常由 system-analysis 以子代理委派，子代理無法和使用者對話，停下會讓 Wave 沒有產出；決定權交給 analyze 與使用者（與 api-plan 的 E6 相同） | 推定 | 通用 | S1 |
| E7 | 補上上游沒有規定的畫面細節（例如提示文字、空狀態、確認方式），且沒有與上游相反時，不記為上游衝突；回報的每項上游衝突都指出上游中實際存在的條目。推定理由：E1、E2 若沒有這條界線，ui-plan 可能把每個自行設計的畫面細節都列成衝突，讓 analyze 與使用者無法分辨真正的衝突 | 推定 | 通用 | S1、S2 |

驗收情境：

- **S1（原始輸入）**：以 `git archive 75855c6` 展開 `specs/`，刪除 `specs/007-equipment-maintenance-retire/` 的 `ui/`、`contracts/`、`data/`，回到 Wave 1 開始前的狀態。委派內容依 system-analysis Phase 5 步驟 1 的項目，和步驟 5 相同：Skill 路徑、目標 spec 目錄、負責介面 F1～F5、`ui/` 不存在、視覺風格沿用 003、依賴缺口無；不另外要求回報上游衝突。預先回覆：無（不應提問）。判斷：(1) 全體預約管理的 `member_cancelled` 不顯示取消原因「成員取消」；或顯示「成員取消」，並在「上游衝突」列出 research §4、受影響的頁面與節及處理 Skill（只在 ui-plan 判定 research §4 有缺陷時才可以這樣做）；(2) 回報有「上游衝突」項目，列出的每項都有 E2 的 4 件事，且都指出 007 research 或 spec 中實際存在的條目；(3) `check_ui.py` 沒有 issues，`git status` 只有 `ui/` 下的檔案；(4) 沒有向使用者提問。
- **S2（回歸）**：以 `git archive 46d1f7f` 展開 `specs/`，刪除 `specs/006-reservation-reschedule/` 的 `ui/`、`contracts/`、`data/`。使用者直接執行 ui-plan（不經 system-analysis），沒有指定視覺風格。預先回覆：`clarify` 每題選推薦選項。判斷：(1) 視覺風格經 `clarify` 決定；(2) `check_ui.py` 沒有 issues，`git status` 只有 `ui/` 下的檔案；(3) 回報包含「上游衝突」（內容或「無」）與「憲法遵循」；(4) 列出的每項上游衝突都能在 006 research 或 spec 找到對應條目，且畫面規劃確實和它相反（E7）。
- **S3（回歸）**：同 S2 的環境，但保留 `specs/006-reservation-reschedule/ui/`，委派內容沒有說明同意覆寫。預先回覆：覆寫確認回答「不同意」。判斷：先列出既有檔案並詢問；回覆後停止，`git status` 沒有任何變更。

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 全體預約管理依 research §4 不顯示「成員取消」，或保留上游寫法並回報 | `admin.html` 的「審核與借用管理總覽」、「篩選已取消的預約」與第 5 節「因設備送修或停用取消的預約」都顯示「成員取消」 | 觀察：`research.md` 第 88 行；`ui/plan.md` 第 156、158、199 行（`75855c6`）；子代理紀錄第 19 次工具呼叫（寫入 `ui/plan.md`）與第 25 次（`world.js` 的 `CANCEL_REASON` 含 `member_cancelled: '成員取消'`） |
| E2 | 回報以獨立項目列出 research §4 的差異、位置與處理 Skill | 回報寫「上游衝突：沒有」，4 項待確認沒有這一項 | 觀察：子代理最後一則回報的「上游衝突與待確認事項」；`iter-5.md` 步驟紀錄第 5 列 |

## 4. 演練表

`ui-plan`（第 5 次迭代 Wave 1，由 system-analysis 委派，Opus 5.5 子代理）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-3 | 無 | 無 | 規劃輸入、目標 spec | 觀察：紀錄第 3～4 次工具呼叫列出 spec 清單並讀取 007 spec | 一致 |
| P1-4 | spec、plan、techstack、research、`ui/` 清單 | 觀察：第 5～8 次工具呼叫讀取 `plan.md`、`research.md`、`techstack.md` | 規劃輸入含 research | 觀察：回報待確認 4 引用「research §4 與 `plan.md` 的實際程式」 | 一致 |
| P1-5 | 憲法檔 | 觀察：第 5、7 次工具呼叫讀取 `shared.md` | 憲法檢查清單 | 觀察：回報列出已讀取 `shared.md`，其他兩份不存在 | 一致 |
| P1-6～P1-10 | 無 | 無 | 負責介面 F1～F5；`ui/` 不存在，略過覆寫確認 | 觀察：回報的介面對應表為 F1～F5；委派內容寫明 `ui/` 不存在 | 一致 |
| P2-1 | 無 | 無 | 視覺風格（委派內容已指定三項） | 觀察：回報「氣質、配色、字體與版面都沿用 003」 | 一致 |
| P2-2 | 憲法檢查清單、規劃輸入 | 已載入 | 憲法衝突 | 觀察：回報「沒有發生憲法衝突」；步驟文字只比對「憲法檢查清單」的必須／不得規則，沒有位置記錄「畫面規劃和 research 不同」 | 一致 |
| P2-3～P2-4 | 無 | 無 | 略過 `clarify` | 觀察：回報「沒有委派 `clarify`」 | 一致 |
| P3-1 | `rules/畫面規劃-格式規範.md` | 觀察：第 9 次工具呼叫 `cat rules/*.md` | 畫面規劃檢查清單 | 觀察：同左 | 一致 |
| P3-2 | 規劃輸入、視覺風格、憲法、畫面規劃檢查清單 | 已載入（含 research §4） | 與 research、spec 一致的畫面規劃 | 觀察：規劃中全體預約顯示「成員取消」，和 research §4「`member_cancelled` 不顯示原因」相反；紀錄中沒有任何比對 research §4 這一點的文字 | 偏離 |
| P3-3～P3-4 | UI 規劃樣板組 | 已載入（第 9 次工具呼叫） | `ui/plan.md` | 觀察：第 19 次工具呼叫寫入第 156、158、199 行 | 偏離（P3-2 的結果） |
| P4-1～P4-5 | HTML 樣板組、HTML 雛形規範、`check_ui.py` | 已載入、已執行 | HTML 與檢查結果 | 觀察：`check_ui.py` 第 1、2 輪 `ok: true`；腳本只比對 spec 編號與介面，不比對 research | 一致 |
| P4-6 | 無 | 無 | 回報 | 觀察：回報有「上游衝突：沒有」，但 SOP 的回報項目沒有「上游衝突」；這一項來自委派內容「以及你發現 spec 或 research 的問題（「上游衝突」或待確認事項）」 | 偏離（沒有回報位置，也沒有比對結果可回報） |

第一個偏離點：`ui-plan` Phase 3 步驟 2（規劃畫面）。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `.agents/skills/ui-plan/SKILL.md` Phase 2 步驟 2、Phase 3 步驟 2、Phase 4 步驟 6；`rules/畫面規劃-格式規範.md` | 缺失 | 觀察：Phase 3 步驟 2 只要求「依規劃輸入……規劃」，沒有規定畫面規劃不得與 research 的 `Decision` 相反；Phase 2 步驟 2 只比對「憲法檢查清單」，建立「憲法衝突」，沒有步驟處理「research 或 spec 本身有問題、或兩者和畫面規劃不同」；Phase 4 步驟 6 的回報項目沒有「上游衝突」。`rules/畫面規劃-格式規範.md` Rule 1～3 只規定頁面切分、spec 編號追溯與狀態回饋，Rule 2 的「需求依據」只追溯 spec，不追溯 research。`check_ui.py` 也只比對 spec 與介面（`--help`：「against the spec and the responsible interfaces」）。觀察：api-plan 有同類規則（Rule 3）與回報項目，是 iter-4 問題 1 補上的；當時的影響範圍已記下 ui-plan 有相同寫法。推論：子代理讀了 research §4，但沒有任何部位要求它拿畫面規劃和 research 的 Decision 比對，所以「成員取消」的設計沒有被檢查，回報的「上游衝突：沒有」只是回應委派內容的額外要求，背後沒有比對（依據 P3-2、P4-6 的觀察） | 假設畫面規劃規則要求「畫面不得與 research 的 Decision、spec 相反；上游有問題時保留上游寫法並記為上游衝突」，Phase 3 規劃時建立「上游衝突」、Phase 4 步驟 6 回報它：在 P3-2，子代理比對 research §4 的取消原因顯示，全體預約不顯示「成員取消」，或保留上游寫法並在 P4-6 列出 research §4、`admin.html` 第 4、5 節與 `technical-research`，E1、E2 成立；只回報、不提問，E6 成立；補上的提示文字沒有和上游相反，不列為衝突，E7 成立；E3～E5 的步驟不受影響 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| research.md 沒有被讀取，ui-plan 不知道 §4 的決策 | 未載入 | 觀察：紀錄第 6、8 次工具呼叫 `cat research.md`；回報待確認 4 引用 research §4 |
| system-analysis 委派時沒有交出 research 或要求回報衝突 | 交接缺陷 | 觀察：委派內容寫明「spec.md、research.md、techstack.md、plan.md 都已存在」，P1-4 由 ui-plan 自己讀 research；委派內容另外要求回報「上游衝突」，子代理仍沒有比對。system-analysis Phase 5 步驟 3 已會轉述 Planner 的「上游衝突」（`.agents/skills/system-analysis/SKILL.md` 第 59 行），缺的是 ui-plan 產生這一項的位置 |
| ui-plan 照抄前一版 006 的雛形 | 非 Skill 問題（上游內容） | 觀察：子代理第 12～13 次工具呼叫讀了 006 `ui/plan.md`，但 006 的 `ui/plan.md` 與 `admin.html` 沒有「成員取消」或取消原因欄（`grep` 只在第 20 行找到「成員取消原預約後重新預約」的句子） |
| research §4 不該決定畫面細節，問題在 research | 非 Skill 問題（上游內容） | 推論：research §4 是否越界可以另外討論，但驗收條件 E1、E2 是 ui-plan 遇到上游決策時的行為；不論 research 該不該寫，SOP 都沒有比對與回報的位置（依據 R1 的觀察）。`analysis.md` F6 也判為「兩種做法都符合 spec，需要使用者決定」，表示衝突必須被回報，不能由 ui-plan 悄悄選一邊 |
| 模型讀了 research 卻疏忽，Skill 沒有問題 | 非 Skill 問題（模型能力） | 觀察：沒有任何部位表達「畫面不得與 research 相反」或「回報上游衝突」（見 R1 的觀察），所以這是預期沒有寫進 Skill，不是模型沒有遵守已寫的規則。同一迭代 data-plan 也沒有這個步驟，它回報衝突只能算模型行為（`iter-5.md` 問題 3 影響欄） |

## 7. 影響範圍

- 依結構診斷，`callers.ui-plan` 為 `system-analysis`（Phase 5 步驟 1 委派）。system-analysis Phase 5 步驟 3 已逐項轉述 Planner 回報的「上游衝突」，Planner 沒有回報這一項時略過。
- 下游讀取 `ui/plan.md` 與雛形的 Skill：`tasks`（把上游不一致寫成 Notes 待確認）、`analyze`、`implement`。
- 觀察：`data-plan` Phase 2 步驟 3 也只比對憲法，Phase 3 步驟 5 的回報沒有「上游衝突」，和 ui-plan 的 R1 寫法相同。本次 data-plan 回報了 research §1 的衝突（步驟紀錄第 5 列上游衝突 (3)），沒有發生同樣的問題。

## 8. 待確認事項

1. 驗收條件 E1～E7 是否正確、完整？
2. E6、E7 是推定的預期：「上游衝突」只回報、不停止、不提問；自行補上的畫面細節不算衝突。是否同意？
3. 是否同意根因 R1（ui-plan 缺少「畫面不得與 research／spec 相反」的規則與「上游衝突」回報項目）？
4. data-plan 有相同寫法，本次沒有發生問題，也不在 iter-5 的問題清單。這次只改 ui-plan，還是連 data-plan 一起改？
5. S1 的委派內容不另外要求回報上游衝突（步驟 5 的委派內容有這句，但 system-analysis SOP 沒有），以測出 Skill 本身的行為。是否同意？
6. 缺少的證據：無。

## 9. 確認紀錄

- 2026-11-10：使用者回覆「都照建議」。
  1. 同意驗收條件 E1～E7（含推定的 E6、E7）與根因 R1。
  2. 這次只改 ui-plan，data-plan 不改；之後在 `iter-5.md` 問題 3 的「處理結果」註明「data-plan 有相同寫法，未修改」。
  3. 同意 S1 的委派內容不另外要求回報上游衝突。
