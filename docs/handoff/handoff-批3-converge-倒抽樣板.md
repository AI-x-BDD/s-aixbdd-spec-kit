# 交接：Spec Kit v1.4.2 調整計畫批 3（converge）— 第 2 步後半（倒抽樣板、反推 Skill）

- 建立日期：2026-11-20
- 專案：`/Volumes/data/Projects-practice/s-aixbdd-spec-kit`（branch `main`，最新 commit `af730d5`，比 `origin/main` 多數個 commit，尚未 push；使用者沒有要求 push）
- 工作目錄：只有未追蹤的 `.agents/skills/converge/` 與 `.claude/skills/converge/`（各只有 `templates/convergence.example.md`）。`scripts/sync-skills.sh --check` 為「兩邊一致」。沒有 commit。
- 前一份交接：`docs/handoff/handoff-批3-converge-開始.md`（第 3、4 節「不要自行處理的事」「工作偏好」仍然有效，本文件不重抄）。

## 1. 批 3 的進度

依據：`docs/dev/spec-kit-1.4.2-調整計畫.md` 第 4 節「批 3：converge（A1）」、第 6 節批 3 列、第 7 節 R1～R4、第 9 節決定 5。

批 3 施工順序（上一個對話提案，使用者回覆「照提案，開始做樣本」）：

1. ✅ 取得樣本：上游 `/speckit-converge` 在 `e035de3` 的 008 上執行。
2. ⏳ 新建 `converge`（`artifact-to-skill-engineering`）：
   - ✅ Phase 1～2：範例放入並定稿（使用者回覆「確認定稿」），定稿雜湊 `fd18248e3352d0cc53915066820e2b6618029178e41a78d915478a8dc386896b`。
   - ⏳ Phase 3（倒抽樣板）、Phase 4（委派 `skill-engineering` 新建）← 新對話從這裡開始。
3. 修改 `tasks` 附加模式（`skill-engineering`，優化模式）。
4. 驗收 S1～S6（`skill-tester`，Sonnet、medium）。
5. 和原版比較，使用者挑選後併回。
6. 收尾：runbook、README、LICENSE、計畫狀態、同步。

## 2. 樣本結果（沙盒在上一個 session 的暫存區，新對話讀不到；重點摘在這裡）

- 沙盒做法：`uvx --from git+https://github.com/github/spec-kit.git@v1.4.2 specify init sk142-converge --integration claude --non-interactive --script sh`；`git archive e035de3 apps/equipment-loan specs/008-overdue-discord-notification` 解壓進去；寫 `.specify/feature.json`（`feature_directory` 為 008 目錄）；`git init` 並 commit baseline；`claude -p "/speckit-converge" --model sonnet --permission-mode bypassPermissions`。約 1 分鐘完成。
- 上游只找到 1 個缺口：F1，partial、MEDIUM、FR-003（`OverdueNotificationsView.tsx` 固定 `page=1`、`pageSize=100`）。在 `## Notes` 之後附加 `## Phase 7: Convergence` 與 T040（`- [ ] T040 … per FR-003 (partial)`，沒有 Must Read）。
- 附加前的內容逐位元組不變（前段 sha256 相同）。
- 本專案的 `tasks/scripts/check_tasks.py` 與 `implement/scripts/tasks_state.py` 都能解析 Notes 之後的 Phase 7；兩支都只回報「T040 沒有 Must Read」。所以 `check_tasks.py` 預計不用改（實作時仍要實跑確認）。
- 樣本的弱點：證據沒有 `file:line`；沒有列出檢查範圍；把需要 UI 設計的換頁直接寫成任務。

## 3. converge 的設計與決定

定稿範例：`.agents/skills/converge/templates/convergence.example.md`（2 輪、G1～G5，所有行號都已對照 `e035de3`／`99755c9` 確認）。設計與 clarify 決定全文見第 5 節提示詞的「已知狀態」第 3、4 點。

## 4. 後續步驟要用的提案內容（只在上一個對話中，這裡保存）

### 4.1 `tasks` 附加模式要改的部位（第 3 步）

1. description：加入附加模式、`convergence.md`、Convergence 等觸發詞。
2. Phase 1：加判斷模式的步驟；使用者指定 `convergence.md` 或附加時，略過步驟 7、8 的覆寫詢問（R2），進入新的附加 Phase。
3. 新增 Phase「附加 Convergence」：
   1. 讀最新一輪「處理＝附加任務」且尚未被任務引用的 G 項目。
   2. 沒有時回報 `tasks.md` 沒有改變並停止（前後 sha256 相同）。
   3. 只讀這些 G 項目來源所指的上游部位。
   4. 寫 `## Phase <最大+1>: Convergence`：ID 從最大值往後接；不加 `[US]`；CRITICAL、HIGH 在前；每個任務 Must Read 引用 `convergence.md → G#`，受約束欄位用 `table.column`；Phase 最後寫 Checkpoint；附加模式不寫待確認（不能改 Notes）。
   5. 寫入前複製原檔；寫入後 `cmp -n <原大小>`（或前段 sha256）確認前段不變，再跑 `check_tasks.py`。
4. `rules/任務清單-格式規範.md`：新增 Rule 6「Convergence Phase 的寫法」，附 Good／Bad Example；任務格式只在 `tasks` 規則定義。
5. 不改：樣板 `tasks.md`、`tasks.example.md`；`check_tasks.py`（實跑不通過才用 `skill-form-script`）；`implement`（`--scope phase:N` 已可只跑新 Phase，R4）。
6. `tasks/LICENSE` 補 converge 附加任務的衍生。

### 4.2 驗收情境初稿（S1 起都和 008 樣本不同）

| # | 情境 | 通過條件 |
|---|---|---|
| S1 | 007 在完成 commit `c7c2ac6` 的暫存複本執行 `converge` | `git status` 只多 `convergence.md`；每個 `file:line` 存在；每列有來源、類型、嚴重度、處理；使用者確認缺口是否為真 |
| S2 | 上游缺口分流（取自 S1） | 需要上游設計的缺口標「上游缺口：<Skill>」，沒改 spec、plan、Planner 產出；S1 沒有時記「未涵蓋」，不捏造 |
| S3 | spec 目錄缺 `tasks.md` | 停止並指名先執行 `tasks`，不產出檔案 |
| S4 | 以 S1 的 `convergence.md` 附加 | 前段逐位元組不變；`check_tasks.py` 沒有 issues；`tasks_state.py status` 沒有 `format_issues`；`status --reset --scope phase:N` 只列新 Phase |
| S5 | 已收斂或沒有「附加任務」列 | `tasks.md` sha256 不變，沒有空 Phase 標題 |
| S6 | 第二輪：已有 Convergence Phase | 新 Phase 接在下方，舊 Phase 不變，ID 接續，只附加未被引用的 G 項目 |

### 4.3 收尾同步（第 6 步）

- runbook：步驟 8 之後加「8c `converge`」「8t `tasks` 附加」與提示詞；補完回到步驟 8 只跑新 Phase，直到已收斂，再進步驟 9。
- README：Skill 清單加 `converge`、流程圖。
- LICENSE：`converge/LICENSE`（spec-kit MIT 全文）；根 `LICENSE` 加 1 列。
- 新 Skill description 開頭「（未驗證）」。
- 計畫開頭狀態行更新批 3。

## 5. 新對話要執行的提示詞（使用者指定）

```text
繼續 Spec Kit v1.4.2 調整計畫批 3 的第 2 步後半：依 artifact-to-skill-engineering 的 Phase 3～4，為 converge 倒抽樣板並反推 Skill。

已知狀態：
1. 範例 .agents/skills/converge/templates/convergence.example.md 已由使用者確認定稿（2026-11-19 回覆「確認定稿」），定稿雜湊 fd18248e3352d0cc53915066820e2b6618029178e41a78d915478a8dc386896b；.claude/skills/converge/ 已同步，內容相同。
2. 範例情境：008 spec 目錄，第 1 輪（e035de3）G1～G4 都是上游缺口，第 2 輪（程式 e035de3、ui/research/plan 用 99755c9 版本、tasks.md 不含 T040）G5 為附加任務。
3. 使用者在 clarify 的決定：範例寫 2 輪；tasks.md Notes 中還沒解決的待確認每項都列為缺口；上游文件互相矛盾時，處理寫程式沒有遵循的那一方的 Skill，剩餘工作寫明程式遵循哪一方。
4. 先前提案的設計（使用者回覆「照提案」）：converge 只新增或修改 spec 目錄的 convergence.md；不啟動系統、不跑測試、執行中不提問；勾選不算證據，每個任務都重新對照程式；缺口類型為缺少／部分／矛盾／未要求；嚴重度 CRITICAL～LOW，違反憲法必須／不得規則為 CRITICAL；處理欄只有「附加任務」「上游缺口：<Skill>」「不處理」，「不處理」只由使用者手動改；需要上游沒定義的設計時列為上游缺口；重跑時在檔尾新增「第 N 輪」，舊輪次不動，G 編號跨輪接續；憲法讀 .agents/constitution/shared.md 與 skills/implement/code.md（不存在則略過）；缺少 spec.md、plan.md 或 tasks.md 時停止並指名要先執行的 Skill。
5. 上游來源：github/spec-kit tag v1.4.2，commit 1e421b58805e33507258d917a16e4d2a403e8358，MIT；輸入樣本為 e035de3 的 specs/008-overdue-discord-notification/ 與 apps/equipment-loan/。

要做的事：
1. 讀取 .claude/skills/artifact-to-skill-engineering/SKILL.md。起始階段為「定稿範例已確認」：以上述定稿雜湊為「定稿雜湊」，從 Phase 3 開始執行，委派 skill-form-template 倒抽骨架 templates/convergence.md，不得修改範例；完成後確認雜湊不變。
2. 進入 Phase 4，委派 skill-engineering 以新建模式建立 converge（description 開頭寫「（未驗證）」），把上述設計與決定當作需求輸入；只依樣板組設計，不讀 .spec-kit/ 其他內容、不做落差分析。skill-engineering 的 Phase 4 工程藍圖要先向使用者提案並等待確認，確認前不施工。
3. 本步驟不處理 tasks 附加模式、runbook、README、計畫與 LICENSE（施工階段才依藍圖處理 LICENSE）；docs/待確認.md 第 38 項不處理；不 commit。
4. 依 CLAUDE.md 規則 4 從編輯的那一邊執行 scripts/sync-skills.sh，並以 --check 確認。

完成後依 CLAUDE.md 格式附上下一步提示詞。
```

## 6. 注意事項

1. `artifact-to-skill-engineering` 的 SOP 預設在 `.agents/skills/` 施工；本次範例在 `.agents/` 一側建立後同步，所以之後從 `.agents/` 編輯就用 `scripts/sync-skills.sh --from agents`。若改從 `.claude/` 編輯，改用 `--from claude`，不要兩邊都改。
2. 這兩個 Skill 的 `disable-model-invocation: true`（`artifact-to-skill-engineering`、`clarify`）：讀 `SKILL.md` 依 SOP 執行，不用 Skill 工具呼叫。
3. `skill-engineering` 的紀錄目錄接續 `specs/skill-engineering/`，目前最大編號 56，下一個是 57（例如 `57-converge-建立`）。
4. `scripts/auto-mode.sh status`：`clarify` off、`next` on。需要使用者決定時寫「自動接續停止：」加原因（R14）。
5. 第 2 步之後的 `tasks` 附加模式（第 4.1 節）要等 `converge` 完成後才做。

## 7. 建議使用的 Skill

- `artifact-to-skill-engineering`：讀 `.claude/skills/artifact-to-skill-engineering/SKILL.md`，從 Phase 3 開始。
- `skill-form-template`：Phase 3 倒抽骨架 `templates/convergence.md`。
- `skill-engineering`：Phase 4 新建 `converge`；工程藍圖要先等使用者確認；之後第 3 步也用它改 `tasks`。
- `skill-form-description`、`skill-form-sop`、`skill-derive-rule`：由 `skill-engineering` 施工時委派。
- `clarify`：藍圖或規則有歧義時，讀 `.claude/skills/clarify/SKILL.md` 執行，每輪最多 3 題。
- `skill-tester` agent（Sonnet、medium）：驗收時使用。
- `conventional-commits`：使用者要求 commit 時。
