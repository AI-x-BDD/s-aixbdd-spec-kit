# 交接：Spec Kit v1.4.2 調整計畫批 2，第 3 個 Skill（analyze）Phase 5 施工與驗收

- 建立日期：2026-11-19
- 專案：`/Volumes/data/Projects-practice/s-aixbdd-spec-kit`（branch `main`）
- 計畫：`docs/dev/spec-kit-1.4.2-調整計畫.md`（批 2：第 4 節；同步：第 6 節批 2 那一列；R10、R12：第 7 節）
- 最新 commit：`adb8162`（尚未 push）。批 2 的三個 Skill 變更都還沒 commit。

## 1. 目前進度

1. 批 2 第 1 個 `data-plan`、第 2 個 `tasks`：`skill-engineering` Phase 1～5 都完成，驗收通過。紀錄在 `specs/skill-engineering/54-…/`、`specs/skill-engineering/55-…/`（藍圖第 8 節）。
2. 批 2 第 3 個 `analyze`：Phase 1～4 完成。
   - 紀錄目錄：`specs/skill-engineering/56-analyze-缺欄位涵蓋表與任務順序檢查/`
   - `rca-report.md`：根因 R1～R4，確認紀錄在第 9 節。
   - `blueprint.md`：確認紀錄在檔頭；施工工作項 W1～W8 都是「待施工」；驗收情境在第 7 節；第 8 節「驗收結果」寫「尚未施工」。
   - 還沒有修改 `.claude/skills/analyze/` 的任何檔案。
3. 下一步：`skill-engineering` Phase 5（施工與驗收），從步驟 1 開始。

## 2. 未 commit 的變更

- `data-plan`、`tasks` 兩邊的 Skill 檔案、根目錄 `LICENSE`、`docs/待確認.md`（以 `git status` 為準）。
- 新目錄：`specs/skill-engineering/54-…/`、`55-…/`、`56-…/`。

## 3. Phase 5 的注意事項（不在藍圖裡的觀察）

1. 施工順序依藍圖第 6 節：W1 `skill-form-description` → W2 `skill-form-sop` → W3～W5 `skill-form-rule` → W6 `skill-form-template` → W7 `skill-form-script` → W8 直接修改 `analyze/LICENSE`。委派時傳入藍圖「工作項內容」中該工作項的完整內容，並說明內容已經使用者確認。
2. W6 範例的行號（`data/data-model.dbml:64、77、79`）取自 `.claude/skills/data-plan/templates/data-model.example.dbml`；施工時以該檔的實際行號為準（藍圖已寫明）。
3. W7 可參考 `.claude/skills/tasks/scripts/check_tasks.py` 的 `parse_dbml`、`constrained_fields`，了解已驗證過的解析情況，但 `analyze` 的腳本要自己寫，不得 import 或呼叫它（驗收條件 E9）。
4. 驗收（步驟 10～17）：
   - 每個情境在暫存專案複本執行：放 session scratchpad，排除 `.git`、`node_modules`，`git init` 建基準 commit。
   - 委派 `skill-tester`，Agent 工具指定 `model: sonnet`、`effort: medium`。上次 `tasks` 的 4 個情境平行執行。
   - S1 要先在複本中以 `data-plan`、`tasks` 重跑 008，取得新寫法的資料模型與任務清單，再注入 5 處缺陷，然後才跑 `analyze`。準備步驟不屬驗收，可以由主 session 或另一個子代理做。
   - S2 要用 006 的重跑前 `analysis.md` 做比對，複本要保留它的原檔。
   - S3 用 007 原樣。預期找到 T008／T043 的順序問題，以及 NFR-002 的效能模糊列 HIGH。
5. 施工後執行 `audit_skill.py`、`./scripts/sync-skills.sh --from claude`、`--check`。
6. 上游樣本：沙盒在 session scratchpad，新對話可能找不到。需要的內容已摘錄在 `rca-report.md` 的「上游樣本的寫法」。
7. 計畫 R10（SC 分母規則改變的 commit 要記在迭代紀錄）不在 `analyze` 內，藍圖不處理。commit 時在訊息或迭代紀錄註明即可，由使用者決定。

## 4. 仍待使用者決定（新對話不要自行處理）

1. 批 2 何時 commit：三個 Skill 都做完後才問使用者。commit 訊息依 `docs/dev/迭代-runbook.md` 第 7.2 節寫 5 個欄位；使用者要求時才 commit。
2. runbook 步驟 6、7 的檢查點要加欄位引用與涵蓋表（計畫第 6 節批 2）。`analyze` 驗收通過後，先提議再改，不要自行修改。
3. `docs/handoff/批1-第5-6步-commit-跨機交接.md` 第 3 節的 5 項仍未決定。

## 5. 使用者對步調的回饋

1. 計畫已寫明的項目直接做，不拆成選項。
2. 回覆先給一句結論，只列使用者現在要做的事。
3. 停下來的地方：確認閘門、使用者實際驗證、commit／push／tag。
4. 閘門問題寫成可以一句話回答的編號清單。
5. 自動模式 `.auto/mode`：`next=on`、`clarify=off`。

## 6. 建議使用的 Skill

- `skill-engineering`：主流程（Phase 5）。
- `skill-form-description`（W1）、`skill-form-sop`（W2）、`skill-form-rule`（W3～W5）、`skill-form-template`（W6）、`skill-form-script`（W7）。
- `conventional-commits`：使用者要求 commit 時才用。
