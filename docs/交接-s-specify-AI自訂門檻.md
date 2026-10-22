# 交接：s-specify 優化 06－AI 自訂的門檻未標成推定需求

使用者在 2026-10-22 要換電腦，請新電腦上的 agent 依本文件接著做。這個專案目錄只處理 Skill 優化；skill-engineering 家族的跨專案同步在另一個專案處理，不要在這裡討論或修改。

## 開場方式

在新電腦的本專案開新對話，貼上：「交接文件：docs/交接-s-specify-AI自訂門檻.md，從 Phase 5 步驟 10 的驗收環境繼續」。

## 先確認檔案有帶過來

這次的修改在舊電腦上**尚未 commit**。換電腦前若沒有提交並 push，下列檔案不會出現在新電腦上，要先回報使用者：

- `.agents/skills/s-specify/rules/功能與非功能需求-格式規範.md`（Rule 6）
- `.agents/skills/s-specify/rules/spec-文件-格式規範.md`（Rule 4）
- `.agents/skills/s-specify/templates/spec.example.md`（Assumptions）
- 上面三個檔案在 `.claude/skills/s-specify/` 的同步副本
- 紀錄目錄 `specs/skill-engineering/06-s-specify-AI自訂的門檻未標成推定需求/`（`rca-report.md`、`blueprint.md`）
- 本文件

## 目前進度

- 走 `skill-engineering` 優化模式，目標 Skill `s-specify`，`.agents/skills` 是生效的一側。
- 根因報告 `rca-report.md`：使用者已確認（見該檔末尾的確認紀錄）。
- 工程藍圖 `blueprint.md`：使用者已確認；W1～W3 都已施工並標為「已完成」。
- Phase 5 已完成到步驟 9：
  - 施工後結構診斷：`s-specify` 0 個 error、0 個 warning，退出狀態 0。
  - `./scripts/sync-skills.sh --from agents` 與 `--check` 都成功，結果「兩邊一致」，沒有只存在於目標端的 Skill，`CLAUDE.md` 沒有變動。
  - 已逐段比對：`SKILL.md` 與藍圖第 2 節 To-Be SOP 相同；FR 規則 Rule 6、spec 文件規則 Rule 4、範例 Assumptions 與藍圖 W1～W3 全文相同；`SKILL.md`、骨架 `templates/spec.md`、使用者故事規則沒有變動。
- **停在步驟 10（建立驗收環境），尚未取得使用者同意。**

## 下一步：驗收環境（等使用者同意）

使用者看不懂原本「複製整個 repo 再刪掉檔案」的做法，而且對刪除感到不安。助理改提下列做法，**使用者還沒回覆**，要先用白話說明並取得同意：

1. 在 `/tmp` 建 3 個空的測試資料夾（S1 圖書館、S2 報帳、S3 診所），各自 `git init` 並做一次初始 commit，用來檢查有沒有新增分支。
2. 每個資料夾只複製兩個 Skill 到 `.agents/skills/`：修改後的 `s-specify`，以及它委派的 `clarify`。
3. S2 另外複製 `specs/001-online-pvp-1a2b/` 進去，用來確認新產出編成 `002`；S1、S3 沒有 `specs/`。
4. 記錄執行前狀態：`git status`、`git branch`、`specs/` 清單、`s-specify` 檔案雜湊。
5. 不刪除任何檔案，不碰本專案。

不推薦的替代方案：不派子代理，改成逐步演練。使用者還沒選。

驗收情境、輸入、預先回覆與判斷方式見 `blueprint.md` 第 7 節（S1～S3）。執行方式比照紀錄 05 的 `blueprint.md` 第 8 節「驗收方式」：

- 每個情境由不帶本次分析脈絡的子代理執行，只提供 Skill 路徑、測試環境位置、情境輸入與預先回覆（clarify 回覆「都依推薦」），並要求它只在測試環境內工作。
- 要求子代理回報：clarify 的每一題與回答、交回的剩餘風險、Phase 2 結束時的 FR／NFR 清單與「推定需求」清單、Phase 3 有沒有新增或修改 FR／NFR／驗收情境，以及最終產出路徑。
- 執行者自己再逐條檢查產出的 spec.md：列出 FR、NFR、Success Criteria 中的每一個數值門檻與品質要求，對照 Input、Clarifications 與回答，判定它有來源、是直接換算，還是由 AI 決定，再依第 7 節判斷 E1～E10。

驗收後：把結果寫進 `blueprint.md` 第 8 節（目前寫「尚未施工」），內容比照紀錄 05 第 8 節；向使用者回報結果，以及個案驗收條件的調整建議。失敗來自 Skill 時，依 `skill-engineering` Phase 5 步驟 13 返回 Phase 2。

## 驗收通過之後

1. 提交：Skill 修改與紀錄文件分開提交，描述用繁體中文，結尾加 `Co-Authored-By` 行（依當時的系統指示）。push 前先問使用者。可參考前幾輪的提交，例如 `fda65b8`（Skill）與 `03c0f16`（紀錄）。
2. 逐項詢問使用者，下列兩個觀察要不要處理（來自紀錄 04 的驗收子代理回報；第三個觀察「Success Criteria 門檻來源」已經併入本輪）：
   - **故事排序張力**：`rules/使用者故事-格式規範.md` Rule 2 要求「P1 是最先要證明的核心價值」，又要求「依賴其他故事的排在後面」。1A2B 的猜題是核心玩法，卻只能排 P3。
   - **同主題既有 spec**：`specs/` 已有同主題 spec（例如 `001-online-pvp-1a2b`）時，Phase 1 只讀目錄名稱、不讀內容，新 spec 可能重複或漏掉舊 spec 處理過的細節。規則沒有說明怎麼處理。
3. 舊電腦 `/tmp/s-specify-accept-04.2YTX/`、`/tmp/s-specify-accept-05.ukfM/` 的證據不會帶過來；根因報告已記下引用的行號與內容，不影響後續。

## 建議使用的 Skill

- `skill-engineering`：從 Phase 5 步驟 10 繼續（驗收環境 → 子代理執行 → 檢查 → 寫入驗收結果）。
- `conventional-commits`：使用者要求提交時使用。
- 問到課程進度時使用 wsa-course MCP；不要轉述呼叫了哪支工具。

## 與使用者互動的注意事項

舊電腦上的 memory 不會帶過來，以下是這位使用者明確表達過的偏好：

- 一律用繁體中文；先講結論，只講重點，不長篇鋪陳，不每次重提所有待辦；一次只問需要決定的事。
- 要執行較長的指令或任何刪除前，先用白話說明會做什麼、動到哪裡；建立測試環境優先從空資料夾組裝，不在複本裡刪檔。
- 同步和 Skill 優化分開處理，不寫在同一則訊息裡。`s-specify` 不是家族成員，改它不需要跑跨專案同步。
- 不要自行擴大使用者界定的範圍；不確定時先用一句話確認。本輪範圍只有數值門檻與品質要求，不含寫需求時才決定的系統行為。
- 核對課程進度時，先確認使用者看到哪個單元或時間點，只比到那裡，回答分「已對齊」「不一樣」「沒辦法比」三類。使用者目前已上完〈【基因工程】改造屬於自己的 SDD 工作流：/specify〉。
- `clarify` 與 `.spec-kit/` 是外部內容，不得修改；`.agents/skills` 改完要跑 `./scripts/sync-skills.sh --from agents` 與 `--check`。
