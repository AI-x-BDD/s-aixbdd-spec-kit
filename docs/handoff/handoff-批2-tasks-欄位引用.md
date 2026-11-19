# 交接：Spec Kit v1.4.2 調整計畫批 2，第 2 個 Skill（tasks，C14 欄位引用）

- 建立日期：2026-11-19
- 專案：`/Volumes/data/Projects-practice/s-aixbdd-spec-kit`（branch `main`，本機 Mac mini）
- 計畫：`docs/dev/spec-kit-1.4.2-調整計畫.md`
- 最新 commit：`adb8162`（尚未 push）。批 2 的變更都還沒 commit。

## 1. 新對話要做的事

在新對話貼上下面的提示詞：

```text
請先讀取交接文件 docs/handoff/handoff-批2-tasks-欄位引用.md，了解目前進度、未 commit 的變更、待使用者決定的事與步調回饋；第 4 節待決定的事不要自行處理。
接著讀取 docs/dev/spec-kit-1.4.2-調整計畫.md 第 3.2 節 C14、第 4 節「批 2：欄位約束鏈」、第 6 節批 2 那一列，以及 specs/skill-engineering/54-data-plan-資料模型缺驗證規則與狀態轉換/blueprint.md（data-plan 已完成的「驗證」「轉換」「跨欄位」固定寫法，第 1 節與第 6 節 W3、W4）。
接著處理批 2 的第 2 個 Skill：用 skill-engineering 優化 tasks（C14 欄位引用）。tasks/scripts/check_tasks.py 是既有腳本，需要修改時用 skill-form-script。
依計畫第 4 節批 2 第 3 點取得樣本：在 repo 外的暫存沙盒放入 specs/008-overdue-discord-notification/ 的 spec、plan、data/、contracts/，跑上游 v1.4.2 的 /speckit.tasks，取得 Entity.field 引用的實際樣子；另讀 .spec-kit/v1.4.2/templates/commands/tasks.md 74、81、201-204 與 .spec-kit/v1.4.2/templates/tasks-template.md。沙盒不存在或無法執行上游命令時，回報原因並說明改用哪些證據。
引用格式依計畫第 4 點：寫成 data-model.dbml 的 table.column；tasks 範例刪掉重抄的約束，只留引用。
依 skill-engineering 的 SOP 做到需要使用者確認的閘門（驗收條件與根因分析），在閘門停下來等使用者確認，確認前不修改 Skill。
完成後依 CLAUDE.md 格式附上下一步提示詞。
```

## 2. 目前進度

1. 批 0、批 1：完成（見 `docs/handoff/批1-第5-6步-commit-跨機交接.md`、commit `6a2b756`～`adb8162`）。
2. 批 2 第 1 個 Skill `data-plan`：`skill-engineering` Phase 1～5 全部完成，S1～S3 驗收通過，使用者確認過根因報告與藍圖。
   - 紀錄目錄：`specs/skill-engineering/54-data-plan-資料模型缺驗證規則與狀態轉換/`（`rca-report.md`、`blueprint.md`，驗收結果在藍圖第 8 節）。
   - 使用者還沒有實際使用新版 `data-plan`，README 等文件若提到驗證狀態，不得寫成已驗證。
3. 批 2 第 2 個 Skill `tasks`：還沒開始。第 3 個 `analyze` 也還沒開始。

## 3. 未 commit 的變更（`git status`，13 項）

- `.claude/skills/data-plan/` 與 `.agents/skills/data-plan/`：`SKILL.md`、`rules/資料模型-格式規範.md`、`templates/data-model.example.dbml`、`scripts/check_data_model.py`，新增 `LICENSE`（兩邊已同步，`sync-skills.sh --check` 為「兩邊一致」）。
- 根目錄 `LICENSE`：授權範圍加入 `data-plan` 一列。
- `docs/待確認.md`：新增第 37 項（`notification-plan` 狀態表和資料模型轉換可能重複；批 2 不改）。
- `specs/skill-engineering/54-data-plan-資料模型缺驗證規則與狀態轉換/`（新目錄）。

## 4. 仍待使用者決定（新對話不要自行處理）

1. 批 2 何時 commit：上一個對話告訴使用者「可以現在先 commit data-plan，或等 3 個 Skill 做完一起 commit」，使用者沒有回答。commit 訊息要依 `docs/dev/迭代-runbook.md` 第 7.2 節寫 5 個欄位，使用者要求時才 commit。
2. `docs/handoff/批1-第5-6步-commit-跨機交接.md` 第 3 節的 5 項仍未決定（「（未驗證）」何時移除、批 1 tag、O4～O8 與第 36 項等）。

## 5. 給 tasks 這一步的線索（不在其他文件裡的觀察）

1. 上游 v1.4.2 的 `plan.md` Phase 1 對 data-model 只有兩行（「Validation rules from requirements」「State transitions if applicable」），內容和 1.2.2 相同；v1.4.2 真正的改動在 `tasks.md`、`analyze.md` 把 data-model 當欄位約束的唯一來源。上游的「constrained field」包含 nullable／required 與型別內的約束，若照上游定義，幾乎每個欄位都算受約束欄位；本專案要怎麼界定，留給 tasks 的根因分析與藍圖決定。
2. `data-plan` 的 `check_data_model.py` 報告每張資料表有 `constrained_fields`（有「驗證」或「轉換」的欄位）與 `cross_field_rules`（「跨欄位」條數），tasks／analyze 可以參考這個界定方式，但每個 Skill 要能獨立運作，不得依賴 data-plan 的腳本。
3. 問題證據可用：`specs/008-overdue-discord-notification/tasks.md` T003 把 `overdue_notifications` 的欄位重抄一次（`auto_retry_count`「`Int`，預設 0」），漏掉 data model note 裡的「0～3」範圍；T011 等任務也重抄了大段約束。tasks 的 RuleFile `rules/任務清單-格式規範.md` 第 106 行附近有 Must Read 寫法範例（`data/data-model.dbml` → `Table reservations` 的 `expires_at`）。
4. 既有 `specs/` 的 data model 是舊寫法（沒有「驗證」「轉換」「跨欄位」），計畫風險 R12 規定舊目錄不重跑。tasks 的驗收若要用新寫法的資料模型，需要先在暫存複本重跑 `data-plan`（批 2 第 5 點的換情境驗收就是這樣做：暫存複本對 006 重跑 data-plan → tasks → analyze）。上一輪 S1 的產出（新寫法的 006 資料模型）在 session 暫存區，可能已被清除，不要依賴。
5. 沙盒：本機（Mac mini）沒有批 0 的 Spec Kit 沙盒，舊沙盒與 `/tmp/bugacc/` 只在 MacBook Pro M1。本機已有 `specify` CLI（`~/.local/bin/specify`）與 `uvx`。依計畫第 4 節批 0 第 2 點，在 repo 外新建暫存目錄安裝，指令以當時上游文件為準（先用 Context7 或上游 README 查 v1.4.2 的 init 方式），不得安裝到本 repo 的 agent 目錄（CLAUDE.md 規則 1）。
6. 影響範圍提醒：修改 tasks 時，直接呼叫者與下游讀者要查 `audit_skill.py --graph`；結構診斷的呼叫圖可能抓不到文字委派（data-plan 那次就沒抓到 `system-analysis`），要以 SKILL.md 內文核對。runbook 步驟 6、7 的檢查點要加欄位引用與涵蓋表（計畫第 6 節批 2），通常在 tasks、analyze 都做完後一起改。

## 6. 使用者對步調的回饋（沿用上一份交接，本次仍適用）

1. 計畫已寫明的項目直接列為要做，不拆成選項讓使用者選。
2. 回覆先給一句結論，只列使用者現在要做的事；分很多段、很多點時使用者會看不懂。
3. 停下來等使用者的地方：`skill-engineering` 的確認閘門（根因報告、藍圖）、使用者實際驗證、commit／push／tag。
4. 本次使用者的回覆都很短（「都同意，E3～E5 保留，繼續 Phase 3」「確認藍圖，進入 Phase 5 施工」）；閘門的問題寫成可以一句話回答的編號清單，效果較好。
5. 自動模式 `.auto/mode` 目前 `next=on`、`clarify=off`；有使用者決定的閘門時照常停下。

## 7. 專案規則重點（細節見 `CLAUDE.md`）

- 設計或優化 Skill 在主 session 執行；Skill 驗收（Phase 5）委派 `skill-tester`，Agent 工具指定 `model: sonnet`、`effort: medium`。
- 改 `.claude/skills/` 後執行 `scripts/sync-skills.sh --from claude`，再 `--check`。
- 參考上游改寫時更新該 Skill 的 `LICENSE`（`tasks/LICENSE` 已存在，計畫要求註明 v1.4.2 欄位引用的衍生）。
- 回覆用繁體中文、短句；每步結尾依 `CLAUDE.md`「回答方式」附下一步提示詞。

## 8. 建議使用的 Skill

- `skill-engineering`：優化 `tasks`（本次），之後 `analyze`。
- `skill-form-script`：修改 `tasks/scripts/check_tasks.py`；之後 `analyze` 的 `collect_coverage.py`。
- `skill-form-rule`、`skill-form-template`、`skill-form-sop`、`skill-form-description`：由 `skill-engineering` 施工時使用。
- `conventional-commits`：使用者要求 commit 時寫訊息。
