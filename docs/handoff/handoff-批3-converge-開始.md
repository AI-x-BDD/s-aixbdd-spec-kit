# 交接：Spec Kit v1.4.2 調整計畫批 3（converge）開始

- 建立日期：2026-11-19
- 專案：`/Volumes/data/Projects-practice/s-aixbdd-spec-kit`（branch `main`，最新 commit `af730d5`，比 `origin/main` 多數個 commit，尚未 push；使用者沒有要求 push）
- 工作目錄：乾淨（`git status` 為空），`scripts/sync-skills.sh --check` 為「兩邊一致」。

## 1. 目前狀態（細節以 commit 與檔案為準，不在這裡重抄）

1. 計畫狀態：`docs/dev/spec-kit-1.4.2-調整計畫.md` 開頭「狀態」行寫明批 0～2 完成、批 3～7 未開始。
2. 批 2 已提交：`54729e4`（data-plan）、`54ebbbe`（tasks）、`aa0a512`（analyze）、`af730d5`（runbook 步驟 6、7 檢查點、計畫狀態、待確認、批 1 交接決定）。紀錄在 `specs/skill-engineering/54-…`、`55-…`、`56-…`。
3. 批 3 依賴批 2（計畫第 4 節批 3 第 7 點）：`tasks` 的新任務格式（Must Read 以 `table.column` 引用受約束欄位）已就位，converge 附加的任務要用這個格式。
4. 上一個 session 的 scratchpad（S3c 等暫存複本）新對話看不到，也不需要。

## 2. 新對話要執行的提示詞（使用者指定）

```text
開始 Spec Kit v1.4.2 調整計畫的批 3（converge）。

1. 讀取 docs/dev/spec-kit-1.4.2-調整計畫.md 的開頭狀態、第 1 節（課程做法）、第 4 節「批 3：converge（A1）」、第 6 節批 3 那一列、第 7 節風險（R4 等與批 3 有關的項目）與第 9 節的決定。
2. 讀取 docs/dev/spec-kit-1.4.2-落差分析.md 中 A1 的內容，以及上游 .spec-kit/v1.4.2/ 中與 converge 相關的命令檔（只讀計畫指定的範圍）。
3. 依計畫第 4 節批 3 的課程做法，先為新建的 converge 走 Artifact-First：說明要產出的 convergence.md 範例方向、tasks 附加模式要改的部位，以及驗收情境的初稿，向使用者提案並等待確認；確認前不建立或修改任何 Skill、runbook 或計畫。
4. 批 2 的 docs/待確認.md 第 38 項（analyze R5）不在批 3 範圍，不處理。

完成後依 CLAUDE.md 格式附上下一步提示詞。
```

## 3. 不要自行處理的事

1. `docs/待確認.md` 第 38 項（`analyze` R5：跨文件比對沒有逐項比對單位）：使用者決定另開一輪，不在批 3。
2. `docs/待確認.md` 第 36 項（bug 三個 Skill 的下一輪，含觀察 O6）：排在批 7 之後。
3. bug 三個 Skill 的「（未驗證）」保留；tag 等批 0～7 完成並經使用者驗證後再打（`docs/handoff/批1-第5-6步-commit-跨機交接.md` 第 3 節的決定）。
4. push、commit、tag：使用者要求時才做。
5. `.spec-kit/` 與 `specs/001-photo-album-organizer/` 是參考素材，只讀計畫指定的範圍（CLAUDE.md 規則 1）。

## 4. 使用者的工作偏好（這幾輪觀察到的）

1. 遇到要使用者決定的事，使用者常回「以上問題, use wsa-course, 提案建議給我參考」：先用 wsa-course MCP 查課程依據，再給「一句結論＋每題建議＋課程依據」，最後給一句可直接回覆的範例（例如「A 照建議、B 照建議」）。不要把同一題拆成多個選項讓使用者挑。
2. 提案後等使用者明確回覆再動手（記憶「Propose before executing」）。
3. 回覆用繁體中文、ASD-STE100 約 80%；結尾依 CLAUDE.md 附「下一步提示詞」，下一步是 commit／需要使用者決定時改寫「自動接續停止：」加原因。
4. 驗收子代理照 CLAUDE.md 模型表：Skill 驗收用 Sonnet／medium（`skill-tester`）；子代理寫報告檔可能被平台擋下（「Subagents should return findings as text」），改以回報全文判斷、`git status` 判斷副作用。

## 5. 建議使用的 Skill

- `skill-engineering`：新建 `converge`（新建模式）與修改 `tasks` 附加模式（優化模式）的主流程；Phase 4 確認藍圖前不施工。
- 計畫第 1 節指定的 Artifact-First 做法（產出是文件的新 Skill）：依計畫寫法使用對應流程，先定範例再抽樣板。
- `skill-form-script`：`tasks` 既有腳本（`check_tasks.py`、`tasks_state.py` 相關）若要修改時使用。
- `clarify`：提案中有需要使用者回答的設計點時。
- `conventional-commits`：使用者要求 commit 時。
- wsa-course MCP（`get_learning_guide`、`search`、`get_lesson_content`）：使用者要求「use wsa-course 提案建議」時。
