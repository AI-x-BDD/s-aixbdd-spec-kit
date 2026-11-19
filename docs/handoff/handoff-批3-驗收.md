# 交接：Spec Kit v1.4.2 調整計畫批 3 — 第 4 步（驗收 converge 與 tasks 附加模式）

- 建立日期：2026-11-20
- 專案：`/Volumes/data/Projects-practice/s-aixbdd-spec-kit`（branch `main`，最新 commit `af730d5`，比 `origin/main` 多數個 commit，尚未 push；使用者沒有要求 push）
- 工作目錄（全部未 commit）：
  - `M LICENSE`（授權範圍新增 converge 一條）
  - `M .agents/skills/tasks/`、`.claude/skills/tasks/`：`SKILL.md`、`rules/任務清單-格式規範.md`、`LICENSE`
  - `?? .agents/skills/tasks/scripts/pending_gaps.py`、`?? .claude/skills/tasks/scripts/pending_gaps.py`
  - `?? .agents/skills/converge/`、`?? .claude/skills/converge/`
  - `?? specs/skill-engineering/57-converge-建立/`（`blueprint.md`）
  - `?? specs/skill-engineering/58-tasks-附加Convergence模式/`（`rca-report.md`、`blueprint.md`）
- `scripts/sync-skills.sh --check`：「兩邊一致」。
- 前幾份交接仍然有效，本文件不重抄：
  - `docs/handoff/handoff-批3-converge-倒抽樣板.md`：第 4.3 節收尾（第 6 步用）、第 6 節注意事項。
  - `docs/handoff/handoff-批3-converge-開始.md`：第 3 節不要自行處理的事、第 4 節工作偏好。

## 1. 批 3 進度

1. ✅ 取得樣本（008，上游 `/speckit-converge`）。
2. ✅ 新建 `converge`（紀錄 57）。
3. ✅ 修改 `tasks` 附加模式（紀錄 58，本次對話完成）：
   - Phase 2 根因報告：使用者 2026-11-20 回覆「確認根因報告，E7、E8、E9 照推定」。R1（SOP 沒有附加模式，缺失）、R2（RuleFile 沒有 Convergence Phase 寫法，缺失）。
   - Phase 4 藍圖：使用者回覆「確認藍圖，同意新增 pending_gaps.py，開始施工」。
   - 施工：`implementer` 完成 W1～W5（description、Phase 1 改寫與分流、新增 Phase 4「附加 Convergence」12 步、Rule 6、`scripts/pending_gaps.py`、`tasks/LICENSE` 第 3 點）。
   - 施工差異 D1：原本 P4-11 用 `cmp -n`，macOS 的 BSD `cmp` 在前段相同時仍回退出狀態 1。W6 改為 `head -c <原檔位元組數> <tasks.md> | cmp - <附加前備份>`，使用者回覆「確認 W6，繼續施工」後施工。
   - 施工後結構診斷 0 error、1 warning（REF003：RuleFile 在 P2-1 與 P4-6 各載入一次，分屬兩種模式，依設計保留）。
   - `SKILL.md` 的 frontmatter、Phase 1、Phase 4 和藍圖 58 第 2 節逐字一致（程式比對）。
   - 實跑（007 `c7c2ac6` 暫存複本，手動附加 Phase 7）：`check_tasks.py` 0 issues，`tasks_state.py status` 沒有 `format_issues`，`next --scope phase:7` 發出 T047；`check_tasks.py` 不需要修改。
4. ⏳ 驗收 ← 新對話從這裡開始。
5. 和原版比較，使用者挑選後併回。
6. 收尾：runbook、README、計畫狀態、同步（交接 `handoff-批3-converge-倒抽樣板.md` 第 4.3 節；`converge/LICENSE`、根 `LICENSE`、`tasks/LICENSE` 都已完成）。

## 2. 第 4 步要知道的事

1. 驗收情境的來源：
   - `converge`：藍圖 57 第 7 節 S1～S4，加上一項靜態檢查（description 以「（未驗證）」開頭）。S1、S2 依序在同一份複本；S3、S4 各用另一份複本。藍圖註明 E13（未要求）與「已收斂」結果若沒出現，記「未涵蓋」，不捏造輸入。
   - `tasks` 附加模式：藍圖 58 第 7 節 S1～S6。S1→S2→S3 依序在同一份複本；S4、S5、S6 各用另一份複本。`convergence.md` 由驗收者依情境手寫，不用 008 與 `converge` 範例的 G5，也不依賴 `converge` S1 的產出，兩組可以平行準備。
2. 測試環境：007 在 commit `c7c2ac6` 的版本（`git archive c7c2ac6` 或 `git worktree`），再放入本次未提交的 `.agents/skills/` 與 `.claude/skills/`。007 的 `tasks.md` 有 Phase 1～6、T001～T046，Notes 有待確認 1～5；`check_tasks.py` 對它的基準結果是 0 issues、0 warnings。
3. 藍圖 58 S1 的判斷方式已改用 `head -c <原大小> tasks.md | cmp - <備份>`，不要用 `cmp -n`（macOS 會誤判）。
4. 驗收子代理：`skill-tester`（Sonnet、medium），不帶本次分析脈絡；只給 Skill 路徑、測試環境位置、情境輸入與預先回覆。子代理寫報告檔可能被平台擋下，改以回報全文與 `git status` 判斷副作用。
5. `tasks` S6 是產生模式回歸：只驗證 Phase 1 的覆寫詢問，回覆「不同意」後停止；Phase 2、3 沒有修改，已用逐字比對確認。
6. 驗收失敗來自 Skill 時：停止，回報失敗情境、證據與疑似根因，不自行修改 Skill（`tasks` 依 skill-engineering 優化模式返回 Phase 2；`converge` 是新建模式，返回 Phase 3）。
7. 驗收結果分別寫入藍圖 57、58 的第 8 節（58 的第 8 節已有施工結果，接在後面寫）。
8. `converge` S1 找到的缺口是否為真，要請使用者確認（藍圖 57 S1 的通過條件之一）。
9. `scripts/auto-mode.sh status`：`clarify` off、`next` on。需要使用者決定時寫「自動接續停止：」加原因。
10. 上一個 session 的 scratchpad（`s007.*` 暫存複本等）新對話讀不到，也不需要。

## 3. 新對話要執行的提示詞

```text
繼續 Spec Kit v1.4.2 調整計畫批 3 的第 4 步：驗收 converge 與 tasks 附加模式。

先讀取交接文件 docs/handoff/handoff-批3-驗收.md（第 1 節進度、第 2 節第 4 步要知道的事）；它引用的 handoff-批3-converge-開始.md 第 3、4 節也要讀。

已知狀態：
1. converge 已施工並同步（.agents/skills/converge/，description 開頭「（未驗證）」）；藍圖 specs/skill-engineering/57-converge-建立/blueprint.md，第 7 節為驗收情境 S1～S4 與一項靜態檢查。
2. tasks 附加模式已施工並同步（.agents/skills/tasks/ 的 SKILL.md Phase 1 與 Phase 4、rules/任務清單-格式規範.md Rule 6、scripts/pending_gaps.py、LICENSE 第 3 點）；藍圖 specs/skill-engineering/58-tasks-附加Convergence模式/blueprint.md，第 7 節為驗收情境 S1～S6，第 8 節記錄施工結果與施工差異 D1（已以 W6 修正）。
3. 所有修改都尚未 commit。

要做的事：
1. 讀取 .claude/skills/skill-engineering/SKILL.md 的 Phase 5 步驟 10～18，以及兩份藍圖的第 1、7、8 節。把兩組情境整理成一份驗收清單（converge S1～S4 與靜態檢查在前，tasks S1～S6 在後），寫明新舊編號對照。
2. 依 Phase 5 步驟 10～11，為每個情境建立包含本次未提交修改的暫存專案複本（放在 scratchpad），依情境描述準備測試環境：都用 007 在 commit c7c2ac6 的版本；tasks 的情境另依藍圖 58 第 7 節手寫 convergence.md。記錄執行前的 git status 與相關檔案 sha256。
3. 依 Phase 5 步驟 12～13，以 skill-tester agent（Sonnet、medium）執行每個情境，只提供 Skill 路徑、測試環境位置、情境輸入與預先回覆，並要求回報確認閘門內容與最終產出；子代理不能寫報告檔時，改以回報全文與 git status 判斷副作用。
4. 依 Phase 5 步驟 17 判斷每個情境。失敗來自測試環境時修正後重跑並記錄；失敗來自 Skill 時停止，回報失敗的情境、證據與疑似根因，不自行修改 Skill。
5. 依 Phase 5 步驟 18，把驗收結果分別寫入兩份藍圖第 8 節，並向使用者回報；converge S1 找到的缺口是否為真，請使用者確認。
6. 不修改任何 Skill；不讀 .spec-kit/ 其他內容；docs/待確認.md 第 38 項不處理；不 commit。

完成後依 CLAUDE.md 格式附上下一步提示詞。
```

## 4. 建議使用的 Skill

- `skill-engineering`（讀 `.claude/skills/skill-engineering/SKILL.md`）：Phase 5 步驟 10～18 的驗收流程。
- `skill-tester` agent（Sonnet、medium）：逐情境執行驗收。
- `converge`、`tasks`：受驗收的 Skill，由 `skill-tester` 在暫存複本中依 `SKILL.md` 執行。
- `clarify`（`disable-model-invocation: true`，讀 `.claude/skills/clarify/SKILL.md`）：驗收結果需要使用者決定時，每輪最多 3 題。
- wsa-course MCP（`search`、`get_lesson_content`）：使用者回「以上問題, use wsa-course, 提案建議給我參考」時使用。
- `conventional-commits`：使用者要求 commit 時。
