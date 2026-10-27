# 根因報告：ui-plan－clarify未被找到

- 紀錄目錄：`specs/skill-engineering/22-ui-plan-clarify未被找到/`
- 確認紀錄：使用者要求參考課程提案後回覆「都照建議」：同意第 2 節驗收條件與根因 R1、R2；E12 改為找不到 `clarify` 時停止並告知（不保留直接詢問的退路）；E13 改為第 2 節不出現與實際不符的來源說明。依據為課程第三章第 14 單元「至少要每次 AI 都要先使用 clarify 去問風格、配色跟氣質」。Phase 5 驗收 S1 失敗後補充 R3，使用者對「呼叫方式」選 A（直接讀取 `clarify` 的 `SKILL.md`，不先試 Skill 工具）、其他 4 個同寫法的 Skill 先記入 `docs/待確認.md` 第 8 項，回覆「都照建議」。
- 問題證據：`user-verify-skill` 第 1 輪實跑紀錄（暫存專案 `/private/tmp/claude-501/-Volumes-data-Projects-practice-s-aixbdd-spec-kit/684f23b1-f01c-4c19-94e0-c34486444fa2/scratchpad/verify-ui-plan`）；測試 session 對話紀錄 `~/.claude/projects/-private-tmp-claude-501--Volumes-data-Projects-practice-s-aixbdd-spec-kit-684f23b1-f01c-4c19-94e0-c34486444fa2-scratchpad-verify-ui-plan/e4c57a67-fc69-47cd-bae0-8e06c1f0e9f0.jsonl`；產出檔 `specs/001-restaurant-waitlist/ui/plan.md`；`.agents/skills/ui-plan/SKILL.md` Phase 2、`templates/ui-plan.md` 第 2 節；`.agents/skills/clarify/SKILL.md`；紀錄 07、10、11、12、14、21 的驗收結果；Phase 5 驗收 S1 的測試 session 對話紀錄 `~/.claude/projects/-private-tmp-claude-501--Volumes-data-Projects-practice-s-aixbdd-spec-kit-684f23b1-f01c-4c19-94e0-c34486444fa2-scratchpad-accept-s1/53a4e094-4ae0-4c23-b700-5abcefd07d3a.jsonl`

## 1. 使用者回報的問題

使用者以 `user-verify-skill` 實際驗證 `ui-plan`：在只放 `ui-plan` 與 `clarify` 的暫存專案中，以 Sonnet 啟動全新的 Claude Code，送出沒有指定視覺風格的需求「specs/001-restaurant-waitlist 的系統分析做好了，幫我規劃前端畫面，做出可以實際點的 HTML 雛形。」。測試 session 沒有使用 `clarify`，而是自行以互動選單詢問氣質、配色與字體，並在回報中表示「技能裡找不到 clarify」，但暫存專案中 `.claude/skills/clarify/SKILL.md` 存在。使用者判定 E4 不通過。另外，`ui/plan.md` 第 2 節寫著「依 clarify 確認的結果：」，與實際情形不符。

## 2. 驗收條件

| 編號 | 驗收條件 | 來源 | 適用範圍 | 驗收情境 |
| ---- | -------- | ---- | -------- | -------- |
| E1 | 產出寫在目標 spec 目錄的 `ui/`：`ui/plan.md` 符合 UI 規劃樣板組（標頭與第 1–5 節的標題、表格欄位）；`ui/plan.md` 第 3.1 節頁面清單的第一列為 `index.html`，清單中每個檔案都存在於 `ui/`，`ui/` 沒有清單以外的 HTML；每個 HTML 符合 HTML 頁面樣板組（固定部分逐字保留、沒有殘留 `{{`） | 既有 | 通用 | S1、S2 |
| E2 | `ui/plan.md` 第 1 節每個負責介面至少一列、第 3.1 節每個負責介面至少對應一頁；第 1 節與第 3.1 節的介面欄沒有負責介面以外的介面編號，「不在範疇」可以引用其他介面編號說明由誰負責；第 3.2 節流程圖的節點代號不與 plan.md 盤點表的介面編號相同。負責介面為委派指定的介面編號，未指定時為 plan.md 盤點表中端點類型為前端的介面 | 既有 | 通用 | S1、S2 |
| E3 | `ui/plan.md` 引用的每個需求編號（US、FR、NFR、SC）都存在於目標 spec；第 5 節涵蓋負責介面需求依據中的每個 Edge Case 與驗證規則 | 既有 | 通用 | S1 |
| E4 | 使用者需求或委派內容沒有指定視覺風格的氣質、配色或字體，且專案有 `clarify` 時，寫入 `ui/` 之前先讀取 `clarify` 的 `SKILL.md`，依其 SOP 詢問缺少的項目：以 Markdown 表格列出選項、標示推薦選項並提供 `Others`，不使用 Ask Tool；`ui/plan.md` 第 2 節記錄確認後的風格，每頁 `:root` 的色彩 token 與第 2 節配色一致 | 本次（使用者判定 E4 不通過；課程：沒有指定視覺風格時每次先用 `clarify` 問，不腦補） | 通用 | S1 |
| E5 | 以瀏覽器打開每頁時，`ui/plan.md` 第 3.3 節列出的該頁操作都能實際操作並改變畫面；假資料寫出具體名稱與數值，同一實體在不同頁面的名稱與數值相同；頁面沒有說明雛形用途或規格的文件段落 | 既有 | 通用 | S1 |
| E6 | 每頁有「雛形狀態」面板，選項包含 `ui/plan.md` 第 4 節該頁的每個狀態（名稱相同），選擇後畫面切到該狀態；第 5 節的每個情境可從面板的某個狀態直接看到，或從某個狀態經頁面操作到達 | 既有 | 通用 | S1 |
| E7 | 每頁是單一檔案：CSS 與 JS 內嵌，沒有引用 `http://`、`https://` 或 `//` 開頭的外部資源；頁面之間的連結只指向頁面清單中的檔案；以 `file://` 打開並切換每個雛形狀態時沒有 JS 錯誤 | 既有 | 通用 | S1 |
| E8 | `ui/plan.md` 只寫使用者操作與畫面回饋，沒有 API 路徑、HTTP 狀態碼或錯誤碼 | 既有 | 通用 | S1 |
| E9 | 執行後目標 spec 目錄只新增、改寫或刪除 `ui/` 下的檔案，不修改 `spec.md`、`plan.md` 與其他 Planner 的產出 | 既有 | 通用 | S1、S2、S3 |
| E10 | 目標 spec 目錄沒有 `plan.md` 時停止並告知先用 `system-analysis`；負責介面為空時停止並回報沒有前端介面；兩種情況都不建立 `ui/` | 既有 | 通用 | S4、S5 |
| E11 | `ui/` 下已有檔案時，委派內容沒有說明使用者已同意覆寫，就必須先列出既有檔案並詢問；使用者同意前不修改 `ui/` | 既有 | 通用 | S6 |
| E12 | 有風格缺口時，只有在專案的 `.agents/skills/clarify/SKILL.md` 與 `.claude/skills/clarify/SKILL.md` 都不存在時，才回報需要 `clarify` 並停止，不建立 `ui/`、不自行詢問或決定風格 | 推定（使用者回覆「都照建議」確認）：課程第三章第 14 單元要求「每次 AI 都要先使用 clarify 去問風格、配色跟氣質」，`clarify` 是基本建設；不保留直接詢問的退路，與 `s-specify`、`technical-research` 一致 | 通用 | S3 |
| E13 | `ui/plan.md` 第 2 節不出現與實際取得方式不符的風格來源說明 | 推定（使用者回覆「都照建議」確認）：本次產出第 2 節寫「依 clarify 確認的結果」但實際沒有使用 `clarify`；委派已指定風格時（紀錄 21 的 S2）也不經 `clarify`；課程只要求記錄視覺風格，沒有要求記錄來源 | 通用 | S1、S2 |

## 3. 落差

| 驗收條件 | 預期 | 實際 | 證據 |
| -------- | ---- | ---- | ---- |
| E4 | 讀取 `.claude/skills/clarify/SKILL.md`，依其 SOP 以 Markdown 表格出氣質、配色、字體題 | 沒有讀取 `clarify`，以 AskUserQuestion 互動選單出三題 | 觀察：對話紀錄第 41 則只列出 `.claude/skills/ui-plan`；第 44 則讀完 spec 等 4 檔後，第 55 則直接呼叫 `AskUserQuestion`，其間沒有任何查看 `.claude/skills/` 或讀取 `clarify/SKILL.md` 的工具呼叫；最終回報寫「技能裡找不到 clarify，所以視覺風格是直接問你的」 |
| E13 | 第 2 節沒有與實際不符的來源說明 | 第 2 節寫「依 clarify 確認的結果：」，實際沒有經過 `clarify` | 觀察：產出檔 `ui/plan.md` 第 2 節第 1 行；該句是 `templates/ui-plan.md` 第 20 行的固定文字 |
| E4（Phase 5 驗收 S1，依第一版修正施工後） | 讀取 `.claude/skills/clarify/SKILL.md`，依其 SOP 以 Markdown 表格出題 | 以 `ls` 找到 `.claude/skills/clarify/SKILL.md` 後，兩次以 Skill 工具呼叫 `clarify` 都收到錯誤，沒有讀取 `SKILL.md`，停下來請使用者自行輸入 `/clarify` 或直接提供三項風格；沒有產出檔案 | 觀察：S1 對話紀錄的工具呼叫依序為 `ls .agents/skills/clarify/SKILL.md .claude/skills/clarify/SKILL.md`、`Skill(clarify)` ×2；工具結果為「Skill clarify cannot be used with Skill tool due to disable-model-invocation. Ask the user to run /clarify themselves — it cannot be invoked via the Skill tool. Do not replicate this skill's workflow by other means — it is reserved for explicit user invocation.」 |

## 4. 演練表

`ui-plan`：

| 步驟 | 應載入 | 實際載入 | 應產出 | 實際產出 | 判定 |
| ---- | ------ | -------- | ------ | -------- | ---- |
| P1-1 | 無 | 無 | 規劃輸入（需求與 spec 清單） | 觀察：第 41 則執行 `ls specs/[0-9][0-9][0-9]-*/`，清單為 `001-restaurant-waitlist` | 一致 |
| P1-2 | 無 | 無 | 目標 spec | 觀察：需求指定 `specs/001-restaurant-waitlist` | 一致 |
| P1-3 | 無 | 無 | 目標 spec 存在，繼續 | 觀察：沒有停止 | 一致 |
| P1-4 | 無 | 無 | spec、plan、techstack、research 與 `ui/` 清單 | 觀察：第 44 則 `cat spec.md plan.md techstack.md; head -c 3000 research.md` | 一致 |
| P1-5 | 無 | 無 | 有 plan.md，繼續 | 觀察：沒有停止 | 一致 |
| P1-6 | 無 | 無 | 負責介面 F1、F2、F3 | 觀察：產出 `ui/plan.md` 標頭列出 F1–F3 | 一致 |
| P1-7 | 無 | 無 | 負責介面不為空，繼續 | 觀察：沒有停止 | 一致 |
| P1-8、P1-9 | 無 | 無 | `ui/` 不存在，略過 | 觀察：初始 commit 沒有 `ui/`，沒有出現覆寫詢問 | 一致 |
| P2-1 | 無 | 無 | 風格缺口：氣質、配色、字體 | 觀察：第 55 則的三題正好是氣質、配色、字體 | 一致 |
| P2-2 | `clarify` 的 `SKILL.md`（`.claude/skills/clarify/SKILL.md` 存在） | 觀察：沒有讀取，也沒有查找 | 依 `clarify` SOP 以 Markdown 表格出題 | 觀察：判定為找不到 `clarify` 而略過本步驟（最終回報） | 偏離 |
| P2-3 | 無 | 無 | 找不到 `clarify` 時才直接詢問 | 觀察：第 55 則以 `AskUserQuestion` 直接詢問 | 偏離（承接 P2-2 的錯誤判定） |
| P2-4 | 無 | 無 | 視覺風格三項確定 | 觀察：第 56 則使用者回答三題 | 一致 |
| P3-1～P3-3 | 畫面規劃檢查清單、UI 規劃樣板組 | 觀察：已讀取 `rules/*.md`、`templates/ui-plan.md` 與範例 | 畫面規劃、樣板組 | 觀察：已建立 | 一致 |
| P3-4 | UI 規劃樣板組 | 觀察：已使用 | 第 2 節填入視覺風格 | 觀察：第 2 節保留樣板固定句「依 clarify 確認的結果：」，與 P2-3 的實際來源不符 | 偏離 |
| P4-1～P4-6 | HTML 頁面樣板組、HTML 雛形檢查清單 | 觀察：已讀取 | 3 頁 HTML、檢查與回報 | 觀察：`check_ui.py` 退出碼 0；瀏覽器逐一切換狀態；回報列出路徑與風格 | 一致 |

第一個偏離點：P2-2（`DELEGATE` 委派 `clarify`）。P2-3 與 P3-4 的偏離都承接 P2-2 的判定；P3-4 另有一個獨立成因（見 R2）。

Phase 5 驗收 S1（依第一版修正施工後的 `ui-plan`）：P1-1～P2-1 一致；P2-2 應依修正後的步驟讀取 `clarify` 的 `SKILL.md` 並出題，實際找到檔案後先試 Skill 工具，依工具錯誤的指示停止，判定偏離。第一個偏離點仍是 P2-2，成因見 R3。

## 5. 根因

| 編號 | 位置 | 缺陷類型 | 說明與證據 | 反事實檢驗 |
| ---- | ---- | -------- | ---------- | ---------- |
| R1 | `ui-plan`／`SKILL.md`／Phase 2 步驟 2、步驟 3 | 不可檢查 | 觀察：P2-2 的條件是「找得到 `clarify` 時」，沒有寫要去哪裡找、用什麼方式找；P2-3 提供「找不到 `clarify` 時直接詢問」的分支。觀察：`clarify` 的 frontmatter 有 `disable-model-invocation: true`，測試 session 的 Skill 清單沒有 `clarify`（對話紀錄中 `- clarify:` 出現 0 次）。推論：「找不到」的判定沒有可檢查的依據，執行者沒有查找就判定找不到，P2-3 讓這個判定直接通往不經 `clarify` 的提問，P2-4 也無法分辨（依據上述觀察與第 3 節 E4 的觀察）。 | 假設 P2-2 指明 `clarify` 的取得方式（先以 Skill 工具委派，無法呼叫時讀取專案 `.agents/skills/clarify/SKILL.md` 或 `.claude/skills/clarify/SKILL.md`），且兩處都不存在時停止、不再提供直接詢問的分支：本次測試 session 會讀到 `.claude/skills/clarify/SKILL.md`，依其 Phase 2 以 Markdown 表格出題，E4 可滿足；沒有 `clarify` 的專案會停止並回報，E12 可滿足；E1–E3、E5–E11 不受影響。 |
| R2 | `ui-plan`／`templates/ui-plan.md`／第 2 節第 1 行「依 clarify 確認的結果：」（`templates/ui-plan.example.md` 同位置） | 衝突 | 觀察：樣板第 2 節開頭是固定文字「依 clarify 確認的結果：」；SOP 有三條取得風格的路徑：P2-1 三項都已指定時不經 `clarify`、P2-2 經 `clarify`、P2-3 直接詢問。觀察：紀錄 21 的 S2（委派已指定風格、沒有出現提問）通過，產出也依骨架保留這句。推論：只有 P2-2 一條路徑與這句一致，另外兩條路徑依樣板寫出的來源都會與事實不符（依據上述觀察）。 | 假設第 2 節不再固定寫出來源：不論風格經 `clarify` 取得或由需求、委派指定，第 2 節都不會出現與事實不符的來源，E13 可滿足；E1 的樣板結構檢查（標題與表格欄位）不受影響。 |
| R3 | `ui-plan`／`SKILL.md`／Phase 2 步驟 2（第一版修正的寫法「委派 `clarify` Skill（無法以 Skill 工具呼叫時，讀取…`SKILL.md`）」） | 衝突 | 觀察：`clarify` 設有 `disable-model-invocation: true`；目前的 Claude Code 在 Skill 工具呼叫它時，回傳「Do not replicate this skill's workflow by other means」的指示（S1 對話紀錄）。觀察：S1 測試 session 先試 Skill 工具，收到指示後沒有讀取 `SKILL.md`。推論：步驟要求「先試 Skill 工具、失敗再讀 `SKILL.md`」，但失敗的回應本身禁止讀取代跑，步驟的兩個分支互相矛盾，執行者只能二選一（依據上述觀察）。 | 假設 P2-2 直接讀取專案的 `clarify/SKILL.md` 並依其 SOP 執行、不先試 Skill 工具：S1 的測試 session 已能找到該檔（觀察），讀取後依 `clarify` Phase 2 出題，E4 可滿足；兩處都不存在時 P2-3 停止，E12 可滿足；S2（風格已指定）不經過此分支。 |

## 6. 被排除的假設

| 假設 | 缺陷類型 | 排除依據 |
| ---- | -------- | -------- |
| H3：Sonnet 能力不足、跳過步驟 | 非 Skill 問題 | 觀察：同一個測試 session 依序執行了 P3-1 讀規則、P3-3／P4-1 讀樣板、P4-4 執行 `check_ui.py`、P4-5 以瀏覽器逐一切換雛形狀態（對話紀錄的工具呼叫），只有條件沒有寫明依據的 P2-2 偏離；觀察：紀錄 21 的 S1 驗收中，Sonnet 子代理在得知 `clarify` 存在後，依 `clarify` 出了三題 |
| H4：`clarify` 設了 `disable-model-invocation: true`，不在 Skill 清單裡 | 觸發缺陷 | 觀察：同一個 `clarify`（frontmatter 相同）在紀錄 07（`s-specify`）、10、11（`plan-with-class-diagram`）、12、14（`technical-research`）的使用者實際驗證中都有被執行並出題；這三個呼叫者的 SOP 寫「委派 `clarify` Skill（無法以 Skill 工具呼叫時，讀取 `clarify` 的 `SKILL.md` 並依其 SOP 執行）」，沒有「找得到」的條件與略過分支。推論：`disable-model-invocation` 本身不會造成略過，差別在呼叫端的寫法（依據上述觀察）。另外 `clarify` 是外部 Skill，依專案規則保持原樣 |
| H5（R3 階段）：Sonnet 過度保守，應自行改讀 `SKILL.md` | 非 Skill 問題 | 觀察：工具錯誤明確指示「Do not replicate this skill's workflow by other means」並要求請使用者自行執行；遵守工具指示是預期行為，步驟本身先要求嘗試 Skill 工具才讓這則指示出現 |
| H6（R3 階段）：拿掉 `clarify` 的 `disable-model-invocation` | 觸發缺陷 | 觀察：`clarify` 是外部 Skill，專案規則要求保持原樣；另有 4 個 Skill 委派它。使用者選擇修改 `ui-plan` 的呼叫方式 |

## 7. 影響範圍

無：目前沒有其他 Skill 委派 `ui-plan`（結構診斷的 `callers` 為空）。`system-analysis` 升級為依 Wave 委派三個 Planner 的指揮者是後續工作，屆時會成為呼叫者。

## 8. 待確認事項

1. 第 2 節的驗收條件是否正確、完整？E4 改寫為「讀取 `clarify` 的 `SKILL.md`、以 Markdown 表格出題、不使用 Ask Tool」，其餘 E1–E3、E5–E11 沿用紀錄 21。
2. 是否同意第 5 節的根因 R1（P2-2 的「找得到 `clarify`」沒有查找依據，P2-3 的退路讓錯誤判定無法被發現）？
3. 是否同意根因 R2（樣板第 2 節固定寫「依 clarify 確認的結果」，與另外兩條取得風格的路徑矛盾）？這一點不在你判定不通過的 E4 裡，是我核對時發現的。
4. E12「Skill 工具無法呼叫 `clarify`、專案兩處都沒有 `clarify/SKILL.md` 時，才直接詢問，並在回報中說明」是推定的預期，要保留嗎？還是要改成找不到 `clarify` 就停止，請使用者先安裝？
5. E13「第 2 節開頭說明風格來源，且與實際一致」是推定的預期，要保留嗎？
