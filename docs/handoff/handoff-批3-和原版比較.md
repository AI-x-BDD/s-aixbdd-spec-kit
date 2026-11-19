# 交接：Spec Kit v1.4.2 調整計畫批 3 — 第 5 步（和原版比較）

- 建立日期：2026-11-20
- 專案：`/Volumes/data/Projects-practice/s-aixbdd-spec-kit`（branch `main`，最新 commit `ccb6d7f`，比 `origin/main` 多數個 commit，尚未 push；使用者沒有要求 push）
- 第 4 步的結果已 commit（使用者 2026-11-20 要求），工作目錄乾淨：
  - `a819b4a` feat(converge)：`converge` Skill、根 `LICENSE` 授權範圍、`specs/skill-engineering/57-converge-建立/`（含第 8 節驗收結果）
  - `ccb6d7f` feat(tasks)：`tasks` 附加模式（`SKILL.md`、Rule 6、`scripts/pending_gaps.py`、`tasks/LICENSE`）、`specs/skill-engineering/58-tasks-附加Convergence模式/`（含第 8 節驗收結果）
- `scripts/sync-skills.sh --check`：「兩邊一致」。第 4 步沒有修改任何 Skill。
- 跨機：批 2、批 3 的交接文件已從系統暫存目錄移到 `docs/handoff/`（`handoff-批2-*.md`、`handoff-批3-*.md`），文件之間的引用已改為 `docs/handoff/` 路徑。換電腦後先做第 5 節的接續檢查。
- 前幾份交接仍然有效，本文件不重抄：
  - `docs/handoff/handoff-批3-converge-倒抽樣板.md`：第 4.3 節收尾（第 6 步用）、第 6 節注意事項。
  - `docs/handoff/handoff-批3-converge-開始.md`：第 3 節不要自行處理的事、第 4 節工作偏好。
  - `docs/handoff/handoff-批3-驗收.md`：第 1 節批 3 第 1～3 步的細節。

## 1. 批 3 進度

1. ✅ 取得樣本（008，上游 `/speckit-converge`）。
2. ✅ 新建 `converge`（紀錄 57）。
3. ✅ 修改 `tasks` 附加模式（紀錄 58）。
4. ✅ 驗收（2026-11-20，本次對話完成）：
   - 方式：`skill-tester`（Sonnet、medium），每個情境一個子代理；測試環境為 007 `c7c2ac6` 的 `git archive` 複本，換上本次未提交的 skills 後 `git init` 並 commit 為基準。
   - `converge`：S1～S4 與靜態檢查全部通過。E13（未要求）與「已收斂」未涵蓋（007 沒有出現，依藍圖不捏造）。
   - `tasks` 附加模式：S1～S6 全部通過。情境輸入因 007 複本有 8 個 spec 目錄，改為指定 `specs/007-equipment-maintenance-retire/`，驗證條件不變。
   - 使用者 2026-11-20 回覆 converge S1 的缺口「G1～G9 都成立」，已記入藍圖 57 第 8 節 O3。
   - 細節（證據、觀察 O1～O3）見兩份藍圖第 8 節。
5. ⏳ 和原版比較，使用者挑選後併回 ← 新對話從這裡開始。
6. 收尾：runbook、README、計畫狀態、同步（交接 `handoff-批3-converge-倒抽樣板.md` 第 4.3 節）；`converge` 的 description「（未驗證）」在第 5 步完成後處理。

## 2. 第 5 步要知道的事

1. 課程做法：`docs/dev/spec-kit-1.4.2-調整計畫.md` 第 1 節第 6 點——請 AI 條列「原版還有哪些優點可以加入」，使用者挑選，再用 `skill-engineering` 併回（第 10 單元 39:47～43:00）。批 3 的規定在第 4 節「批 3：converge（A1）」第 5 點。
2. 比較對象：上游 `.spec-kit/v1.4.2/templates/commands/converge.md`（落差分析 A1 引用 59-240 行）。`.spec-kit/` 其他內容不讀（CLAUDE.md 規則 1）。
3. 本專案對照部位：
   - `.agents/skills/converge/`：`SKILL.md`、`rules/缺口判定-格式規範.md`、`templates/convergence.md`、`templates/convergence.example.md`（範例已定稿，sha256 `fd18248e…`，改它要使用者同意）。
   - `.agents/skills/tasks/`：`SKILL.md` Phase 4、`rules/任務清單-格式規範.md` Rule 6、`scripts/pending_gaps.py`。
4. 刻意不同、不列為優點的設計（使用者已確認）：缺口報告 `convergence.md` 和附加任務拆成 `converge` 與 `tasks` 兩個 Skill；處理欄只有「附加任務」「上游缺口：<Skill>」，「不處理」只由使用者手改；重跑時在檔尾新增一輪、舊輪次不動。
5. 驗收時的觀察，第 5 步要一併評估：
   - 藍圖 57 O1：子代理沒有讀完 P1-4 要求的全文（`ui/` 5 個 HTML 只 grep、`openapi.yaml` 只讀前段）。可對照原版怎麼處理讀取範圍。
   - 藍圖 57 O2：G4 的處理寫了兩個 Skill（`api-plan`、`technical-research`），Rule 3 沒有限定一個。
   - 藍圖 58 O1：附加模式不重新驗證缺口（依設計）。
6. 流程：先只列出並提案，等使用者挑選；挑選前不修改任何 Skill、藍圖、runbook 或計畫。使用者挑選後，`converge` 依 `skill-engineering` 新建模式的修改、`tasks` 依優化模式（先根因再藍圖），施工後要重跑受影響的驗收情境。
7. `scripts/auto-mode.sh status`：`clarify` off、`next` on。需要使用者決定時寫「自動接續停止：」加原因。
8. 本次對話的 scratchpad（7 份測試複本 `cA`～`tD`、`refs.py` 行號核對腳本）新對話讀不到。重跑驗收時依藍圖第 8 節「驗收方式」重建。

## 3. 新對話要執行的提示詞

```text
繼續 Spec Kit v1.4.2 調整計畫批 3 的第 5 步：converge 與 tasks 附加模式和原版比較。

先讀取：
1. 交接文件 docs/handoff/handoff-批3-和原版比較.md（第 1 節進度、第 2 節第 5 步要知道的事）；它引用的 handoff-批3-converge-開始.md 第 3、4 節也要讀。
2. docs/dev/spec-kit-1.4.2-調整計畫.md 第 1 節第 6 點與第 4 節「批 3：converge（A1）」。
3. 兩份藍圖的第 1、2、8 節：specs/skill-engineering/57-converge-建立/blueprint.md、specs/skill-engineering/58-tasks-附加Convergence模式/blueprint.md。

已知狀態：
1. 第 4 步驗收已完成：converge S1～S4 與靜態檢查、tasks S1～S6 全部通過，結果寫在兩份藍圖第 8 節。使用者回覆 converge S1 的缺口「G1～G9 都成立」。
2. converge 的 description 仍以「（未驗證）」開頭。
3. 第 4 步的結果已 commit（a819b4a、ccb6d7f），工作目錄乾淨。

要做的事：
1. 讀取上游原版 .spec-kit/v1.4.2/templates/commands/converge.md（計畫指定的比較對象；.spec-kit/ 其他內容不讀）。
2. 對照本專案的 .agents/skills/converge/（SKILL.md、rules/、templates/）與 .agents/skills/tasks/ 的附加模式（SKILL.md Phase 4、rules/任務清單-格式規範.md Rule 6、scripts/pending_gaps.py），條列「原版還有哪些優點可以加入」。每項寫：原版位置（行號）、優點一句話、本專案目前做法、併回時會影響的 Skill 與部位。交接文件第 2 節第 5 點的驗收觀察一併評估。
3. 交接文件第 2 節第 4 點列出的刻意不同設計不列為優點，只在最後一句帶過。
4. 只列出並提案，等使用者挑選；挑選前不修改任何 Skill、藍圖、runbook 或計畫，不 commit。docs/待確認.md 第 38 項不處理。

完成後依 CLAUDE.md 格式附上下一步提示詞。
```

## 4. 建議使用的 Skill

- `skill-engineering`（讀 `.claude/skills/skill-engineering/SKILL.md`）：使用者挑選後併回；`converge` 走新建模式的設計修改，`tasks` 走優化模式。
- `skill-tester` agent（Sonnet、medium）：併回後重跑受影響的驗收情境。
- `clarify`（`disable-model-invocation: true`，讀 `.claude/skills/clarify/SKILL.md`）：挑選結果需要使用者回答設計點時，每輪最多 3 題。
- wsa-course MCP（`search`、`get_lesson_content`）：使用者回「以上問題, use wsa-course, 提案建議給我參考」時使用（第 10 單元 39:47～43:00）。
- `conventional-commits`：使用者要求 commit 時。

## 5. 換電腦後的接續檢查

1. 在專案根目錄執行 `git pull`，確認 `git log --oneline -5` 含 `a819b4a` feat(converge)、`ccb6d7f` feat(tasks) 與交接文件的 commit。
2. 執行 `git status --short`，確認工作目錄乾淨。
3. 執行 `./scripts/sync-skills.sh --check`，確認「兩邊一致」。
4. 執行 `uv --version`，確認可以執行 `uv run --script`（`tasks` 的 `pending_gaps.py`、`check_tasks.py` 需要）。沒有時依 https://docs.astral.sh/uv/getting-started/installation/ 安裝。
5. 執行 `scripts/auto-mode.sh status`，確認 `clarify`、`next` 的狀態。狀態存在 `.auto/`（不進 git），新電腦預設可能不同；原電腦為 `clarify` off、`next` on，要相同時執行 `scripts/auto-mode.sh on next`（`next` 會用 Herdr 開新分頁，需要在 Herdr pane 內）。
6. 確認 `.spec-kit/v1.4.2/templates/commands/converge.md` 存在（第 5 步的比較對象）。
