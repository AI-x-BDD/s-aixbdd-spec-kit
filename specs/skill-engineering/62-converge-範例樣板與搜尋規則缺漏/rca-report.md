# 根因報告：converge－範例樣板與搜尋規則缺漏

- 紀錄目錄：`specs/skill-engineering/62-converge-範例樣板與搜尋規則缺漏/`
- 問題證據：`docs/iterations/iter-small-1.md` 的「Skill 問題」問題 2、3、5 與「P8c 收斂評估紀錄」「P8c 第 2 輪紀錄」；產出檔 `specs/008-overdue-discord-notification/convergence.md`（第 1 輪 commit `05fe183`，第 2 輪 commit `374763a`）；`converge` 的 `SKILL.md`、`rules/缺口判定-格式規範.md`、`templates/convergence.md`、`templates/convergence.example.md`；下游讀取者 `.agents/skills/tasks/scripts/pending_gaps.py` 與它在 `374763a` 的實跑輸出；`converge` 的建立紀錄 `specs/skill-engineering/57-converge-建立/blueprint.md`

## 1. 使用者回報的問題

small-1 以子代理執行 `converge` 兩輪（008，HEAD `9586fc7` 與 `4dab6ec`）。執行者回報 3 個 Skill 問題，步驟 10 判定為 Skill 缺陷：

1. 問題 2：SOP 要求檢查範圍表列出 Edge Case，但範例的檢查範圍表沒有 Edge Case 列。子代理依 SOP 自行補上。
2. 問題 3：Phase 2 步驟 2 要以 `grep -rln` 搜尋「每個檢查項目的關鍵字」，但沒有定義關鍵字的來源，也沒有排除 `node_modules/`、`test-results/`。子代理自訂主題關鍵字，並自行排除這些目錄。
3. 問題 5：第 2 輪沒有缺口，但 SOP 與樣板沒有規定空的缺口表怎麼寫。子代理放了一列「—／本輪沒有缺口」，`tasks` 的 `pending_gaps.py` 把「—」當成一個缺口，列進 `skipped`。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | `spec.md` 有 Edge Cases 時，`convergence.md` 的檢查範圍表有「Edge Case」列，寫出數量；`converge` 的範例、樣板與 SOP 對檢查範圍表要列哪些類別的寫法一致 | 本次（問題 2） | 通用 | S1 |
| E2 | 關鍵字搜尋用的每個關鍵字，都能追溯到 `converge` 部位規定的來源；執行者的回報或 `convergence.md` 能看出用了哪些關鍵字 | 本次（問題 3） | 通用 | S1 |
| E3 | 關鍵字搜尋不回傳依賴、建置或測試產出目錄中的檔案（例如 `node_modules/`、`test-results/`）；`convergence.md` 的程式範圍與每個程式證據都不在這些目錄中 | 本次（問題 3） | 通用 | S1 |
| E4 | 結果為「已收斂」時，「缺口」段落依 `converge` 部位規定的固定寫法寫出，不由執行者自行決定 | 本次（問題 5） | 通用 | S2 |
| E5 | 結果為「已收斂」時，`tasks` 的 `pending_gaps.py` 讀取該輪的退出狀態為 0，`pending` 與 `skipped` 都是空的 | 推定（理由：`tasks` 附加模式以 `pending_gaps.py` 讀取最新一輪缺口表；缺口表少了分隔線時腳本退出 1，任何 ID 非空的列都會被當成缺口） | 通用 | S2 |
| E6 | 只新增或修改「目標 spec 目錄」的 `convergence.md`；既有輪次除了開頭的「輪次」那一行之外不變；不 commit | 既有（description；Phase 3 步驟 3） | 通用 | S1、S2 |
| E7 | 有缺口的輪次，每個缺口都寫出類型、嚴重度、來源、附行號的證據、剩餘工作與處理；處理為「附加任務」的缺口，`pending_gaps.py` 會列進 `pending` | 既有（description；Phase 2 完成條件） | 通用 | S1 |
| E8 | 檢查範圍表每類檢查項目一列；成功標準列寫明排除的編號或沒有排除；憲法規則列寫明略過的憲法檔；第 2 輪起有「前一輪缺口」列 | 既有（Phase 3 步驟 2） | 通用 | S1、S2 |

驗收情境：

| 編號 | 驗證 | 類型 | 輸入 | 預先回覆 | 判斷方式 |
| ---- | ---- | ---- | ---- | -------- | -------- |
| S1 | E1、E2、E3、E6、E7、E8 | 本次（問題 2、3 的原始輸入） | 008 在 commit `9586fc7` 的複本（沒有 `convergence.md`），在 `apps/equipment-loan/` 放入 `node_modules/` 與 `test-results/`，兩個目錄中各有含 `overdue`、`discord`、`webhook` 的檔案；指定 spec 目錄 `specs/008-overdue-discord-notification` | 無（`converge` 執行中不提問） | 1. 檢查範圍表有 Edge Case 列；範例、樣板與 SOP 的檢查範圍類別一致。2. 回報或 `convergence.md` 列出的每個關鍵字，都能對到部位規定的來源。3. 程式範圍與證據中沒有 `node_modules/`、`test-results/` 的路徑。4. 每個缺口都有 7 欄，行號存在。5. `pending_gaps.py` 退出 0，「附加任務」的缺口都在 `pending`。6. `git status` 只多了 `convergence.md`，沒有 commit |
| S2 | E4、E5、E6、E8 | 本次（問題 5 的原始輸入） | 008 在 commit `4dab6ec` 的複本（`convergence.md` 只有第 1 輪，G1～G3 已由 T043～T045 處理） | 無 | 1. 第 2 輪結果是「已收斂」，「缺口」段落和部位規定的寫法相同。2. `pending_gaps.py` 退出 0，`pending`、`skipped` 都是 `[]`。3. 和執行前的備份比較，只有「輪次」那一行改變，其他都是檔尾新增。4. 有「前一輪缺口」列 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E1 | 範例與 SOP 都列出 Edge Case 列 | SOP 列出 Edge Case，範例沒有；這次的產出有 Edge Case 列，是子代理依 SOP 自行補上 | 觀察：`.agents/skills/converge/SKILL.md:21`、`:32`；`templates/convergence.example.md` 搜尋「Edge Case」0 筆；`convergence.md` 第 1 輪檢查範圍表「Edge Case 13」；`iter-small-1.md` 問題 2 |
| E2 | 關鍵字來源有規定 | 沒有規定；子代理自訂主題關鍵字 overdue、discord、webhook、逾期 | 觀察：`SKILL.md:22`；`iter-small-1.md` 問題 3 |
| E3 | 搜尋不包含依賴與產出目錄 | SOP 只寫 `grep -rln`，沒有排除；子代理自行排除 | 觀察：`SKILL.md:22`；`apps/equipment-loan/.gitignore` 列出 `node_modules/`、`test-results/`；`iter-small-1.md` 問題 3 |
| E4 | 已收斂時缺口段落有固定寫法 | 子代理寫一列「— ／本輪沒有缺口」 | 觀察：`specs/008-overdue-discord-notification/convergence.md:80-84` |
| E5 | `pending_gaps.py` 的 `skipped` 為空 | `skipped` 為 `[{"id": "—", "handling": "—", "reason": "處理不是附加任務"}]` | 觀察：在 `374763a` 實跑 `pending_gaps.py` 的輸出（本次重跑，結果相同） |

E6、E7、E8 沒有落差：第 1 輪 G1～G3 由主 session 抽查行號相符；第 2 輪的 `diff` 只有「輪次」那一行與檔尾新增（`iter-small-1.md`「P8c 收斂評估紀錄」「P8c 第 2 輪紀錄」）。

## 4. 演練表

沒有子代理的完整對話紀錄。「實際」欄以產出檔、`iter-small-1.md` 的紀錄與 Skill 檔案為來源。

`converge` 第 1 輪（HEAD `9586fc7`，問題 2、3）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-3 | 無 | 無 | 目標 spec 目錄 | 觀察：`convergence.md:3` 為 `specs/008-overdue-discord-notification/` | 一致 |
| P1-4 | 無 | 無 | 評估文件；略過的憲法檔 | 觀察：檢查範圍「憲法規則」列寫 `skills/implement/code.md` 不存在、略過 | 一致 |
| P1-5、P1-6 | 無 | 無 | 評估狀態與變更基準 | 觀察：評估狀態寫 `9586fc7` 與工作目錄狀態；沒有既有評估，不備份 | 一致 |
| P2-1 | 無 | 無 | 檢查項目含 Edge Case | 觀察：檢查範圍表有 Edge Case 13 | 一致 |
| P2-2 | 無 | 無 | 以 SOP 規定的關鍵字，在 Source Code 根目錄搜尋，結果可重現 | 觀察：`SKILL.md:22` 只寫「每個檢查項目的關鍵字」與 `grep -rln`，沒有關鍵字來源與排除目錄；子代理自訂 4 個主題關鍵字，並排除 `node_modules/`、`test-results/`（`iter-small-1.md` 問題 3） | 偏離 |
| P2-3～P2-5 | 缺口判定檢查清單 | 無證據（沒有對話紀錄） | 缺口清單通過 Rule 1～5 與行號檢查 | 觀察：G1～G3 由主 session 以 `sed -n` 抽查，內容支持描述（`iter-small-1.md`「P8c 收斂評估紀錄」） | 一致 |
| P3-1 | 收斂評估樣板組 | 觀察：子代理回報範例的檢查範圍表沒有 Edge Case 列，表示已讀範例（`iter-small-1.md` 問題 2） | 樣板組與 SOP 一致的寫法 | 觀察：範例第 1 輪 `:15-25`、第 2 輪 `:57-68` 都沒有 Edge Case 列，SOP `:32` 要求每類一列 | 偏離 |
| P3-2 | 收斂評估樣板組 | 觀察：同上 | 檢查範圍表每類一列 | 觀察：產出有 Edge Case 列，子代理依 SOP 自行補上 | 一致 |
| P3-3、P3-4 | 收斂評估樣板組 | 無證據 | 結構檢查通過；回報 | 觀察：`git status` 只多了 `convergence.md`，HEAD 仍為 `9586fc7` | 一致 |

`converge` 第 2 輪（HEAD `4dab6ec`，問題 5）：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1～P1-6 | 無 | 無 | 評估文件、既有評估與備份 | 觀察：`diff` 備份只差「輪次」那一行（`iter-small-1.md`「P8c 第 2 輪紀錄」） | 一致 |
| P2-1～P2-5 | 缺口判定檢查清單 | 無證據 | 缺口清單為空；前一輪重新確認 G1～G3 | 觀察：`convergence.md` 第 2 輪「前一輪缺口 3」列與重新確認段 | 一致 |
| P3-1 | 收斂評估樣板組 | 無證據 | 樣板組有「已收斂」時缺口段落的寫法 | 觀察：`templates/convergence.md:25-29` 只有 `{{GAP_ROWS}}`；範例兩輪都是「有缺口」，沒有已收斂的輪次 | 偏離 |
| P3-2 | 收斂評估樣板組 | 無證據 | 依規定寫出空的缺口段落 | 觀察：`convergence.md:80-84` 寫一列 `| — | — | — | — | 本輪沒有缺口 | — | — |`；`SKILL.md:32` 只規定結果寫「已收斂」與下一步 | 偏離 |
| P3-3 | 收斂評估樣板組 | 無證據 | 結構檢查能發現不符合規定的缺口段落 | 觀察：步驟只比對表格欄位與 `{{`，沒有可比對的規定；推論：佔位列可以通過（依據 P3-1 的觀察） | 一致 |
| 下游：`tasks` P3-3（`pending_gaps.py`） | 無 | 無 | `pending`、`skipped` 都空 | 觀察：`skipped` 有 ID「—」一筆；`pending_gaps.py:122-127` 把 ID 非空的每一列當成缺口；`:116-117` 表格少於 2 列（表頭與分隔線）時退出 1 | 偏離 |

第一個偏離點：

- 問題 3：P2-2（`READ` 以關鍵字擴大程式範圍）。
- 問題 2：P3-1（載入的範例和 SOP 對檢查範圍表的要求不同）。產出本身沒有錯，是子代理自行依 SOP 處理。
- 問題 5：P3-1（樣板組沒有已收斂時的寫法），延續到 P3-2 與下游 `pending_gaps.py`。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `converge`／`templates/convergence.example.md`／第 1 輪檢查範圍表 `:15-25`、第 2 輪 `:57-68` | 衝突 | 觀察：`SKILL.md:21` 把 Edge Case 列為檢查項目，`:32` 要求檢查範圍表每類一列；範例沒有 Edge Case 列。觀察：commit `db1aaa6` 把 Edge Case 加進 SOP，範例最後修改是建立時的 `a819b4a`；`57-converge-建立/blueprint.md:13` 寫範例「已經使用者定稿……本次不改寫」。推論：SOP 改了，範例因為定稿沒有同步，兩個部位的要求不一致（依據前兩項觀察）。 | 假設範例有 Edge Case 列：P3-1 載入的樣板組和 SOP 一致，P3-2 不需要執行者判斷誰對，E1 可滿足；E6～E8 不受影響。 |
| R2 | `converge`／`SKILL.md`／Phase 2 步驟 2（`:22`） | 缺失 | 觀察：步驟只寫「以 `grep -rln` 在 `plan.md` Source Code 的根目錄內搜尋每個『檢查項目』的關鍵字」；`rules/` 與樣板都沒有寫關鍵字來源或排除目錄。觀察：`57-converge-建立/blueprint.md:397` 驗收時已記下 O5「SOP 沒有說明關鍵字怎麼選」，當時「暫不修改」。觀察：`apps/equipment-loan/.gitignore` 列出 `node_modules/`、`test-results/`，這兩個目錄在 Source Code 根目錄內。推論：`grep -rln` 不看 `.gitignore`，照 SOP 原文執行會搜尋到依賴與產出目錄（依據前述觀察）。 | 假設 P2-2 規定了關鍵字來源與要排除的目錄：不同執行者會用同一來源的關鍵字，搜尋不包含依賴與產出目錄，E2、E3 可滿足；E7 的缺口判定方式不變。 |
| R3 | `converge`／`templates/convergence.md`「缺口」段落（`:25-29`）與 `SKILL.md` Phase 3 步驟 2（`:32`） | 缺失 | 觀察：樣板只有 `{{GAP_ROWS}}`；SOP 只規定「已收斂」的結果文字與下一步；範例沒有已收斂的輪次。觀察：子代理寫了一列「—」，`pending_gaps.py` 把它列進 `skipped`。觀察：`pending_gaps.py:116-117` 在缺口表少於 2 列時退出 1。推論：沒有任何部位規定已收斂時缺口段落的寫法，執行者寫佔位列會被當成缺口，刪掉整個表格會讓 `tasks` 附加模式停止（依據前述觀察）。 | 假設樣板或 SOP 規定了已收斂時缺口段落的寫法，且這個寫法讓 `pending_gaps.py` 讀到 0 列：P3-2 寫出固定格式，P3-3 可以比對，E4、E5 可滿足；有缺口的輪次（E7）不受影響。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H1：子代理沒有讀範例，才自己決定檢查範圍表的列（問題 2） | 未載入 | 觀察：子代理回報了範例缺少 Edge Case 列（`iter-small-1.md` 問題 2），表示已讀範例 |
| H2：問題 2 是模型自己的判斷差異 | 非 Skill 問題 | 觀察：不一致在 Skill 檔案中就看得到（`SKILL.md:21`、`:32` 與範例 `:15-25`），和由誰執行無關 |
| H3：P2-5 沒有檢查搜尋範圍，才讓搜尋結果因人而異（問題 3） | 不可檢查 | 推論：P2-5（`SKILL.md:25`）只檢查缺口的行號；就算加上檢查，也沒有關鍵字來源與排除目錄的規定可以比對，反事實無法滿足 E2、E3（依據 `SKILL.md:22` 的觀察） |
| H4：`plan.md` 的 Source Code 沒有標出要排除的目錄（問題 3） | 非 Skill 問題 | 觀察：搜尋命令與根目錄由 `SKILL.md:22` 規定；`plan.md` Source Code 列出的是程式目錄，`node_modules/` 位在根目錄內是一般專案的常態，不是這次輸入的缺漏 |
| H5：`tasks` 的 `pending_gaps.py` 沒有略過非 G 編號的列（問題 5） | 載體過弱 | 推論：只改腳本時，執行者仍可能刪掉整個表格，`pending_gaps.py:116-117` 會退出 1，`convergence.md` 的寫法也仍然因人而異，E4 無法滿足（依據 `pending_gaps.py:116-117` 與 R3 的觀察）；且腳本的檔頭說明「處理不是附加任務的列進 skipped」，行為和它的規定一致 |
| H6：問題 5 是子代理的個人寫法 | 非 Skill 問題 | 觀察：樣板、SOP、範例都沒有已收斂時的寫法（`templates/convergence.md:25-29`、`SKILL.md:32`），任何執行者都必須自己決定 |

## 7. 影響範圍

- 委派關係：沒有其他 Skill 委派 `converge`（`audit_skill.py --graph` 沒有指向 `converge` 的邊）。
- 讀取 `convergence.md` 的下游：`tasks` 附加模式的 `scripts/pending_gaps.py`（受 R3 影響）。runbook 步驟 8c、8t 與「小變更路徑」第 3 點第 3、4 步使用這兩支 Skill。
- R1 位於建立時使用者定稿的範例（`57-converge-建立/blueprint.md:13`）。
- R2 在建立時的驗收已記為觀察 O5、決定「暫不修改」（`57-converge-建立/blueprint.md:397`）；這次再次出現，並多了排除目錄的問題。
- `converge` 的 description 仍標「（未驗證）」。

## 8. 待確認事項

1. 第 2 節的驗收條件 E1～E8 與情境 S1、S2 是否正確、完整，適用範圍都標「通用」是否符合你的預期？
2. 是否同意第 5 節的根因 R1、R2、R3？
3. E5（已收斂時 `pending_gaps.py` 的 `pending`、`skipped` 都是空的）是推定的預期，是否需要保留？
4. R1 位於你定稿的範例。同意 R1 時，之後的設計會修改這份定稿範例，是否可以？
5. 仍缺少的證據：沒有子代理的完整對話紀錄，P2-3～P3-4 部分步驟的「實際載入」記為無證據；判定改用產出檔與主 session 的抽查紀錄。

確認紀錄：2026-11-20 使用者回覆「確認驗收條件 E1～E8 與根因 R1、R2、R3，保留 E5，同意修改定稿範例」。

## 第 2 輪：R2 的關鍵字來源（Phase 5 驗收 S1 失敗後返回）

- 問題證據：工程藍圖第 8 節 S1 結果；S1 子代理回報的關鍵字清單（141 個）與命中檔案（63 個）；`specs/008-overdue-discord-notification/plan.md:118-138` 系統介面盤點；`contracts/openapi.yaml:15-25` 的 tags（B1～B4）；`data/data-model.dbml:273-277` 的 TableGroup（D1、D2）。

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P2-2（修改後） | 無 | 無 | 只和本次功能有關、執行者不需自訂篩選的關鍵字 | 觀察：依修改後的 C30 取全部 27 個 operationId、9 張資料表（含前五版的 B4、D2）與 193 個反引號字串；子代理自訂「長度至少 6、含底線或大小寫混合」篩選；命中 63 個檔案 | 偏離 |

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R2-2 | `converge`／`SKILL.md` Phase 2 步驟 2 的 C30（本次第 1 輪施工寫入） | 缺失 | 觀察：C30 沒有區分本次新增介面與前幾版既有介面；008 的 `plan.md` B4、F4、D2 是既有介面，合約 tag 與 TableGroup 都標出所屬介面。觀察：反引號字串含檔案路徑以外的數字、HTTP 狀態碼、JSON 與測試資料，C30 沒有排除。推論：「選哪些識別字」需要判斷新增或既有、專屬或通用，一句步驟內文無法表達，需要正反例（依前兩項觀察）。 | 假設關鍵字只取新增介面（008 為 F1～F3、B1～B3、D1、S1～S3、N1～N2）的 operationId、資料表與任務中的專屬識別字：以 18 個這類識別字實測 `git grep`，命中 23 個檔案，不需要執行者自訂篩選，E2、E3 可滿足。 |

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| 關鍵字數量太多是模型能力問題 | 非 Skill 問題 | 觀察：141 個關鍵字都符合 C30 的字面，是 C30 本身沒有限制 |
| 在 P2-5 檢查命中檔案數量即可 | 不可檢查 | 推論：沒有選字規則時，檢查只能看數量，無法判斷哪個關鍵字不該選 |

確認紀錄：2026-11-20 使用者回覆「同意 R2 回到根因分析，關鍵字只取本次 spec 新增介面的識別字，規則放進 RuleFile」。
