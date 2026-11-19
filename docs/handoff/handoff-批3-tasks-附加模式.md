# 交接：Spec Kit v1.4.2 調整計畫批 3 — 第 3 步（tasks 附加模式）

- 建立日期：2026-11-20
- 專案：`/Volumes/data/Projects-practice/s-aixbdd-spec-kit`（branch `main`，最新 commit `af730d5`，比 `origin/main` 多數個 commit，尚未 push；使用者沒有要求 push）
- 工作目錄（未 commit）：
  - `M LICENSE`（授權範圍新增 converge 一條）
  - `?? .agents/skills/converge/`、`?? .claude/skills/converge/`（兩邊一致）
  - `?? specs/skill-engineering/57-converge-建立/`（`blueprint.md`）
- `scripts/sync-skills.sh --check`：「兩邊一致」。
- 前兩份交接仍然有效，本文件不重抄：
  - `docs/handoff/handoff-批3-converge-倒抽樣板.md`：第 1 節批 3 施工順序、第 4.1 節 tasks 附加模式要改的部位、第 4.2 節驗收情境初稿、第 4.3 節收尾、第 6 節注意事項。
  - `docs/handoff/handoff-批3-converge-開始.md`：第 3 節不要自行處理的事、第 4 節工作偏好。

## 1. 批 3 進度

1. ✅ 取得樣本（008，上游 `/speckit-converge`）。
2. ✅ 新建 `converge`（本次對話完成）：
   - Phase 3：`skill-form-template` 倒抽骨架 `templates/convergence.md`；範例雜湊維持 `fd18248e3352d0cc53915066820e2b6618029178e41a78d915478a8dc386896b`。
   - Phase 4：`skill-engineering` 新建模式，紀錄 `specs/skill-engineering/57-converge-建立/blueprint.md`。使用者 2026-11-20 回覆「確認藍圖，E11～E16 照推定，開始施工」。
   - 施工：`implementer` 完成 W1～W3；`SKILL.md` 和藍圖 To-Be SOP 逐行一致；`audit_skill.py` 0 error、0 warning；`converge/LICENSE` 與根 `LICENSE` 一條已加；已同步。
   - 施工差異（已記在藍圖第 8 節）：W3 的 Rule 1、Rule 3 範例改用和定稿範例不同的情境。
   - 單一溯源檢查通過（artifact-to-skill-engineering Phase 5）。
3. ⏳ 修改 `tasks` 附加模式 ← 新對話從這裡開始。
4. 驗收：`converge` 的 S1～S4（藍圖 57 第 7 節）加上 `tasks` 附加模式的情境（交接第 4.2 節 S4～S6，編號到時重排），用 `skill-tester`（Sonnet、medium）。
5. 和原版比較，使用者挑選後併回。
6. 收尾：runbook、README、計畫狀態、同步（交接第 4.3 節；LICENSE 的 converge 部分已完成，`tasks/LICENSE` 待第 3 步施工時處理）。

## 2. 第 3 步要知道的事

1. 附加模式的輸入格式以 `converge` 的樣板組為準：
   - `.agents/skills/converge/templates/convergence.md`：每輪是 `## 第 N 輪`，缺口表欄位為 `ID | 缺口類型 | 嚴重度 | 來源 | 證據 | 剩餘工作 | 處理`。
   - 範例 `convergence.example.md` 第 2 輪的 G5 是唯一「附加任務」列，可以用來對照附加模式要讀的欄位。
   - 處理欄的值只有「附加任務」「上游缺口：<Skill>」，以及使用者手動寫的「不處理」。
   - 嚴重度 CRITICAL、HIGH、MEDIUM、LOW（附加任務依此排序：CRITICAL、HIGH 在前）。
2. `converge` 的 SOP 在 Phase 3 下一步寫「有附加任務時依序執行 `tasks` 附加模式、執行 `implement` 只跑新 Phase、再執行 `converge`」。附加模式的觸發詞要對得上。
3. `tasks` 目前部位：`SKILL.md`、`rules/任務清單-格式規範.md`、`templates/tasks.md` 與 `tasks.example.md`、`scripts/check_tasks.py`、`LICENSE`（`.agents/skills/tasks/`）。
4. 這是優化模式，但沒有錯誤回報：
   - `skill-engineering` Phase 1 的「問題證據」改用功能缺口：`converge` 會產出「附加任務」列，`tasks` 目前沒有附加模式，只能整份重產（會觸發覆寫詢問）。
   - Phase 2 根因報告預期為「缺失」類型，根因位置在 `tasks` 的 SOP 與 RuleFile；報告要先給使用者確認。
5. `check_tasks.py` 與 `implement/scripts/tasks_state.py` 在 008 樣本上已能解析 Notes 之後的新 Phase（只回報沒有 Must Read）。藍圖施工後要實跑確認；不通過才用 `skill-form-script` 修改。
6. 紀錄目錄：`specs/skill-engineering/` 目前最大 57，下一個預期 58。
7. 編輯側：`converge` 與本次預期在 `.agents/skills/` 編輯，同步用 `scripts/sync-skills.sh --from agents`；不要兩邊都改。
8. `scripts/auto-mode.sh status`：`clarify` off、`next` on。需要使用者決定時寫「自動接續停止：」加原因。
9. 上一個 session 的 scratchpad 新對話讀不到，也不需要。

## 3. 新對話要執行的提示詞（使用者指定）

```text
繼續 Spec Kit v1.4.2 調整計畫批 3 的第 3 步：用 skill-engineering 優化模式，為 tasks 加上「附加 Convergence」模式。

已知狀態：
1. 批 3 第 2 步已完成施工：.agents/skills/converge/（SKILL.md、rules/缺口判定-格式規範.md、templates/convergence.md 與 convergence.example.md、LICENSE），已同步到 .claude/skills/，description 為「（未驗證）」；紀錄在 specs/skill-engineering/57-converge-建立/blueprint.md（驗收 S1～S4 排在批 3 第 4 步）。尚未 commit。
2. 交接文件 docs/handoff/handoff-批3-converge-倒抽樣板.md 第 4.1 節記錄了 tasks 附加模式要改的部位（description、Phase 1 模式判斷、新增「附加 Convergence」Phase、rules/任務清單-格式規範.md 新增 Rule 6、不改的部位、tasks/LICENSE），第 4.2 節有驗收情境初稿 S4～S6；前一份交接 docs/handoff/handoff-批3-converge-開始.md 第 3、4 節（不要自行處理的事、工作偏好）仍然有效。
3. converge 產出的 convergence.md 格式以 .agents/skills/converge/templates/convergence.md 與 convergence.example.md 為準：附加模式只讀最新一輪「處理」為「附加任務」且尚未被任務引用的 G 項目。

要做的事：
1. 讀取 .claude/skills/skill-engineering/SKILL.md，以優化模式處理 tasks；需求與證據來自上述交接文件第 4.1、4.2 節與 converge 的樣板組，本次是新增功能，不是錯誤回報。紀錄目錄用 scripts/next_record_dir.py 取得（預期為 58）。
2. Phase 2 根因報告與 Phase 4 工程藍圖都要先向使用者展示並等待明確確認，確認前不施工；推定的驗收條件逐條請使用者確認。
3. 不修改 converge、implement、tasks 的樣板組；check_tasks.py 只有實跑不通過時才列入藍圖；不讀 .spec-kit/ 其他內容；docs/待確認.md 第 38 項不處理；不 commit。
4. 有修改 Skill 時，依 CLAUDE.md 規則 4 從編輯的那一邊執行 scripts/sync-skills.sh，並以 --check 確認。

完成後依 CLAUDE.md 格式附上下一步提示詞。
```

## 4. 建議使用的 Skill

- `skill-engineering`（Skill 工具呼叫）：優化模式主流程；Phase 2 根因報告、Phase 4 工程藍圖都要等使用者確認。
- `skill-form-description`、`skill-form-sop`、`skill-form-rule`、`skill-derive-rule`：由 `skill-engineering` 施工時委派（`rules/任務清單-格式規範.md` 是既有 RuleFile，新增 Rule 6 用 `skill-form-rule`；Phase 新增的載入步驟依施工委派規則判斷）。
- `skill-form-script`：只有 `check_tasks.py` 實跑不通過時使用。
- `clarify`（`disable-model-invocation: true`，讀 `.claude/skills/clarify/SKILL.md` 依 SOP 執行）：藍圖有歧義時，每輪最多 3 題。
- `implementer` agent（Sonnet、medium）：藍圖確認後施工。
- `skill-tester` agent（Sonnet、medium）：第 4 步驗收時使用。
- wsa-course MCP（`search`、`get_lesson_content`）：使用者回「以上問題, use wsa-course, 提案建議給我參考」時，查課程依據後給「一句結論＋每題建議＋課程依據＋可直接回覆的句子」。
- `conventional-commits`：使用者要求 commit 時。
