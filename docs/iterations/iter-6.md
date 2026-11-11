# 迭代 6：逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查（通知迭代）

- spec 目錄：`specs/008-overdue-discord-notification`
- 上一次 spec 目錄：`specs/007-equipment-maintenance-retire`
- 本次功能：runbook 9.3「通知迭代」列（6 次路徑第 6 次）
- 執行者：Claude Code＋Opus 5.5（runbook 第 6 節第 6 點：第 5 次迭代起全部改由 Claude Code 執行）
- 開始／結束：2026-11-10／2026-11-12
- A/B 流程：依 runbook 第 8 節。步驟 2～5 commit 後，從同一個 commit 建 A、B 兩組 git worktree；A/B 要在同一台電腦做完
- A/B 共用起點：`ae040c0`（步驟 4～5 檢查點 commit，含 spec、research、techstack、plan 與三個 Planner 產出）

## A/B worktree

2026-11-11 建立（runbook 第 8 節第 2 點）。兩組都從共用起點 `ae040c0` 建立，主目錄維持在 `main`。

| 組別 | worktree 路徑 | branch | 起點 SHA | 目前狀態 |
|---|---|---|---|---|
| A 組 | `../s-aixbdd-spec-kit-ab/group-a`（絕對路徑 `/Volumes/data/Projects-practice/s-aixbdd-spec-kit-ab/group-a`） | `ab/group-a` | `ae040c0` | 已跑步驟 6（`tasks`），commit `8c4441c`；已跑步驟 7（`analyze`），commit `b0cac59` |
| B 組 | `../s-aixbdd-spec-kit-ab/group-b`（絕對路徑 `/Volumes/data/Projects-practice/s-aixbdd-spec-kit-ab/group-b`） | `ab/group-b` | `ae040c0` | 已帶進新 Skill，Skill 版本 `b17d451`；已跑步驟 5n（`notification-plan`），commit `f614f1a`；已跑步驟 6（`tasks`），commit `513708a`；已跑步驟 7（`analyze`，CRITICAL 0），commit `7cf0db8`；已跑步驟 8（`implement`，39/39、受阻 0），commit `7dda70c`～`0d60ce6`；資料庫用 `equipment_loan_ab_b`；已跑步驟 9（使用者驗證，S1～S6、F1～F7、R1～R7 全部符合，通過），驗證的 commit 為 `0d60ce6` |

B 組 Skill 版本（2026-11-11，runbook 第 8 節第 5 點第 1 項）：

| B 組 commit | 來源 commit（`main`） | 內容 |
|---|---|---|
| `f603bb2` | `fd8e032` | feat(notification-plan)：新 Skill `notification-plan` |
| `b17d451` | `be648df` | feat(tasks,analyze)：`tasks`、`analyze` 接入 `notification/plan.md` |

- 做法：在 B 組 worktree 執行 `git cherry-pick fd8e032 be648df`，沒有衝突。不 merge `main`。
- 沒帶的 commit：`5e407d7` 加上 description 的「（未驗證）」，`0ad3b3f` 又移除它，兩個合起來沒有變動。
- 檢查：`scripts/sync-skills.sh --check` 為「兩邊一致」；`git diff main HEAD -- .agents/skills .claude/skills` 沒有輸出，B 組的 Skill 和 `main` 的 `6d67e41` 相同。
- `ab/group-b` 比 `origin/ab/group-b` 多 2 個 commit，還沒 push。步驟 5n 後多 3 個 commit（含 `f614f1a`），仍沒有 push。
- 歸檔（runbook 第 8 節第 6 點，2026-11-11）：[`docs/ab-test/`](../ab-test/)，commit `3518920`。含共用輸入（`ae040c0`）、A 組 `tasks.md`（`8c4441c`）與 `analysis.md`（`b0cac59`）、B 組 `notification/plan.md`（`f614f1a`）、`tasks.md`（`513708a`）、`analysis.md`（`7cf0db8`）與步驟 8 決策清單；各組 `README.md` 記錄模型設定、Skill 版本與 sha256。歸檔後不再修改。
- 合併回 `main`（runbook 第 8 節第 7 點，2026-11-11）：不 merge `ab/group-b`，以 `git cherry-pick -x` 只帶 spec 與實作的 9 個 commit，不帶 Skill commit `f603bb2`、`b17d451`（`main` 已有，且之後有 `880fcb7`、`ff0abeb` 的修正）。先在暫存 worktree 以 `--no-commit` 試做，沒有衝突。對照：`f614f1a`→`30db230`、`513708a`→`0ab38bf`、`7cf0db8`→`0c4e704`、`7dda70c`→`e683af0`、`c7e3a3c`→`2a548ed`、`abf9dc8`→`3bb452f`、`8729f4c`→`ea90959`、`8b7de36`→`4e4f3d0`、`0d60ce6`→`331f722`。`apps/` 與 `specs/008` 和 B 組 `0d60ce6` 相同；`git diff 62b3d87 -- .agents/skills .claude/skills` 為空，`sync-skills.sh --check` 兩邊一致。測試（17:23～17:27，`DATABASE_URL` 明確指向主目錄 `equipment_loan`，不讀 `.env`）：`db:migrate` 套用 `20261111000000_overdue_notifications`；`prisma generate` 後 `db:seed` 正常；`npm run check` 通過；後端 14 檔 76/76（含 007 遷移測試）、前端 4/4、e2e 5/5；結束後重跑 `db:seed`，沒有殘留程序。

模型與 effort（兩組必須相同，runbook 第 8 節第 2、5 點）：

| 角色 | 模型 | effort | 備註 |
|---|---|---|---|
| 主 session | Opus 5.5（`claude-opus-5-5`），Claude Code 2.1.322 | high（`CLAUDE_EFFORT=high`） | A 組步驟 6 由主 session 依 `tasks` SOP 直接執行 |
| 子代理 | 委派時明確指定 Opus | 跟隨主 session | 本機 `CLAUDE_CODE_SUBAGENT_MODEL=sonnet`，不指定會變成 Sonnet。A 組步驟 6 的 `tasks` SOP 沒有委派子代理的步驟（只有憲法衝突時委派 `clarify`，本次 0 項），所以沒有子代理 |

## 第四題：`notification-plan`（runbook 第 8 節第 4 點）

2026-11-11 在主目錄 `main` 完成，A 組產出只讀未改。

- 紀錄：[`specs/skill-engineering/47-notification-plan-建立/`](../../specs/skill-engineering/47-notification-plan-建立/)（`rca-report.md`、`blueprint.md`）。
- 使用者確認（2026-11-11）：驗收條件 E1～E12 正確完整；同意 R1～R3；保留推定的 E10、E11；Skill 名稱 `notification-plan`；產出路徑 `notification/plan.md`。
- Skill 版本 commit：
  - `fd8e032` feat(notification-plan)：新 Skill（SKILL.md 4 個 Phase 20 個步驟、RuleFile Rule 1～6、樣板組、`check_notification_plan.py`）。
  - `be648df` feat(tasks,analyze)：`tasks`、`analyze` 接入 `notification/plan.md`（含 `collect_coverage.py`）。
  - `400c30b` docs(skill-engineering)：紀錄目錄 47 與 `docs/待確認.md` 第 30 項。
  - `5e407d7` docs(notification-plan)：description 開頭標「（未驗證）」，使用者驗證通過後由 `user-verify-skill` 移除。
- 施工後：`audit_skill.py` errors 0、warnings 0；`scripts/sync-skills.sh --check` 兩邊一致。
- 驗收（**AI 驗收，使用者尚未驗證**）：Sonnet 5.5 medium 子代理在暫存複本執行，6 個情境全部通過。詳細在藍圖第 8 節。

  | 情境 | 驗證 | 結果 |
  |---|---|---|
  | S1 | E1～E7：對 008 跑 `notification-plan` | 通過。S1～S3、N1、N2 各一個 §5.n 章節；`clarify` 1 題（「已逾期多久」的格式）；腳本 issues 0 |
  | S2 | E8：S1 結果跑 `tasks` | 通過。S、N 任務的 Must Read 指向 `notification/plan.md` §5.1～§5.5；沒有「沒有規格」的待確認 |
  | S3 | E9：S2 結果跑 `analyze` | 通過。S、N 介面 `notification` 非空；沒有 E 類問題；相關問題處理 Skill 為 `notification-plan` |
  | S4 | E10：007 沒有通知介面 | 通過。停止，不建立檔案 |
  | S5 | E11：拒絕覆寫 | 通過。雜湊值不變 |
  | S6 | E12：沒有 `notification/` 時的回歸 | 通過（腳本實跑＋逐步演練）。`collect_coverage.py` 輸出只多空的 `notification` 鍵 |

- 驗收時的觀察（不在本次修改）：`collect_coverage.py` 把 B1～B4 判成沒有合約、把 `ui/plan.md`「畫面範疇」誤算給 S、N 介面，同步驟 7 觀察 1，留到步驟 10 分類。
- 接下來：使用者驗證 `notification-plan`（2026-11-11 通過，`0ad3b3f`）→ 把 Skill commit 帶進 `ab/group-b`（完成，見「A/B worktree」）→ 第 8 節第 5 點（B 組跑步驟 5n `notification-plan`，再跑步驟 6～8）。

## 固定環境

| 項目 | 值 |
|---|---|
| 電腦 | steve的Mac mini（`Mac14,12`，macOS 27.0.1）。第 5 次迭代在 steve-10（MacBook Pro）完成，本次換電腦，從第 6 次迭代步驟 0 開始（`git pull` 後 `main` 與 `origin/main` 一致，`git log -1` 為 `89c7d3d`） |
| 執行工具與版本 | Claude Code 2.1.322（主 session）；`uv` 0.12.1；Node.js 26.8.2（`techstack.md` 與 `backend/package.json` 要求 24 以上，符合；iter-5 用 24.14.1）；Docker 29.9.2、Docker Compose v5.6.1 |
| 模型與 effort | Opus 5.5（`claude-opus-5-5`），high（`CLAUDE_EFFORT=high`，沿用第 5 次迭代的設定） |
| 子代理模型 | 本機設定 `CLAUDE_CODE_SUBAGENT_MODEL=sonnet`，子代理預設是 Sonnet。iter-5 的 Planner 等子代理用同模型（Opus 5.5）。本次委派 SOP 執行的子代理（Planner 等）要明確指定 Opus，才能和 iter-5 及 A/B 兩組的模型一致 |
| Skill 版本（開始時） | `89c7d3d`（`scripts/sync-skills.sh --check`：兩邊一致）。含 iter-5 步驟 11 的 5 項優化：`clarify-over-specs` `92f7c1e`、`technical-research` `be06f9c`、`ui-plan` `ca01fc0`、`api-plan` `1a2cf98`、`tasks` `b09eaa7` |
| 其他 | `git config --global core.hooksPath` = `~/dotfiles/git/hooks`（外洩掃描有效）；`apps/equipment-loan/backend/.env` 存在（未讀內容） |
| 中途變動 | 2026-11-10：步驟 3 起換新 Claude Code session（中途重開，依交接文件 `iter-6-step3-handoff.md` 接續）；電腦、模型與 effort 不變，commit 仍為 `89c7d3d`（步驟 2 的產出尚未 commit）。2026-11-11：步驟 4 起再換新 Claude Code session（依交接文件 `iter-6-step4-handoff.md` 接續）；電腦、模型與 effort 不變，commit 為 `61ba062`。2026-11-11：步驟 5 起再換新 Claude Code session（依交接文件 `iter-6-step5-handoff.md` 接續）；電腦、模型與 effort 不變，commit 為 `61ba062`（步驟 4 的產出尚未 commit）。2026-11-11：A/B 流程第 4 點（第四題 `notification-plan`）完成後換電腦，交出電腦為 steve的Mac mini，交出時 commit 為交接文件的 commit；`main`、`ab/group-a`、`ab/group-b` 都已 push，A/B 不在同一台電腦做完（runbook 0.3「什麼時候可以換」第 3 點的例外做法）。接續方式見 `docs/handoff/iter-6-跨機交接.md`。2026-11-11：新電腦接手。電腦為 steve-10（`Mac14,7`，macOS 27.0.1，即第 5 次迭代用的 MacBook Pro）；工具版本：Claude Code 2.1.322、`uv` 0.12.1、Node.js 24.14.1（和交出電腦的 26.8.2 不同；`techstack.md` 要求 24 以上，符合）、Docker 29.9.2、Docker Compose v5.6.1；模型與 effort 不變（Opus 5.5、`CLAUDE_EFFORT=high`；本機也設 `CLAUDE_CODE_SUBAGENT_MODEL=sonnet`，子代理仍要明確指定 Opus）；`core.hooksPath` = `~/dotfiles/git/hooks`（有 `pre-commit`、`pre-push`）；`apps/equipment-loan/backend/.env` 存在（未讀內容）；資料庫尚未重建。接續位置：`main` 為 `a59f70f`（和 `origin/main` 相同），`scripts/sync-skills.sh --check` 兩邊一致；A、B worktree 依交接文件第 4 節重建在 `/Users/steve.tsao/projects-practice/s-aixbdd-spec-kit-ab/group-a`、`group-b`（相對路徑不變），`ab/group-a` 為 `b0cac59`、`ab/group-b` 為 `ae040c0`，兩邊 `git status` 乾淨。從 A/B 流程第 4 點完成之後接續，下一步是交接文件第 5 節第 1 點（使用者驗證 `notification-plan`） |
| 臨時改寫的提示詞 | P0 改寫：「本次功能」寫「見 runbook 9.3『通知迭代』列（6 次路徑第 6 次）」，取代 9.5 原文的「見 runbook 9.3 第 {N} 列」（9.3 沒有第 6 列的編號）；其餘依 9.5 原文，`{N}`=6、`{PREV_SPEC_DIR}`=`specs/007-equipment-maintenance-retire` |

## 步驟紀錄

| 步驟 | Skill | 產出 | 使用者做了什麼 | 問題 | commit |
|---|---|---|---|---|---|
| 0 | （準備） | `docs/iterations/iter-6.md` | 貼 P0 開始第 6 次迭代 | 沒有。`git status` 乾淨，`main` 與 `origin/main` 一致。已讀 runbook、選題討論的迭代計畫、外部通知、A/B 比較設計、iter-5 紀錄與 `docs/handoff/iter-5-跨機交接.md`。待注意：(1) 子代理預設 Sonnet，見固定環境；(2) 委派 `analyze` 時子代理不能寫 `analysis.md`（交接文件第 4 節第 5 點），步驟 7 前要決定做法；(3) 既有測試依賴台北 12:00–21:00，假時鐘工具在舊電腦 `/tmp`，本機沒有 | — |
| 2 | `s-specify` | `specs/008-overdue-discord-notification/spec.md` | 回答 `clarify` 2 輪共 5 題（皆採推薦選項：每筆逾期借用只自動通知一次；失敗自動重試最多 3 次後才標「送出失敗」；逾時標「結果不明」且不自動重送；時段結束即逾期、10 分鐘內通知；通知寫出成員姓名） | 第 5 節第 6 列兩條觀察規則：「逾期檢查要能手動觸發」已寫在功能描述，`clarify` 不需要問，spec 寫成 US3；「通知失敗、逾時、重複的處理」都有問到（第 1 輪第 1 題重複、第 2 題失敗、第 3 題逾時）。執行者在步驟 0 已讀過觀察規則與選題討論的外部通知設計（`429`、`Retry-After`、`?wait=true`），「有問到」只能當弱證據（同 iter-5 流程不足「0 → 2」）。US 3 個、FR 20 條（全域 10 條）、NFR 3 條（全域 2 條）、SC 7 條。推定需求 16 條（FR-002、FR-003、FR-004、FR-006、FR-007、FR-008、FR-010、FR-014、FR-015、FR-016、FR-017、FR-018、FR-020、NFR-001、NFR-002、NFR-003，含沿用的 SC-002、SC-005、SC-006）；未確認事項 21 項（16 項寫成推定需求、4 項推定排除寫進 Out of Scope、1 項寫成一般 Assumption「Discord Webhook 已預先建立」）。`clarify` 題數 5 題，已達上限。自檢第 1 輪修正 4 處（FR-001 沒排除停機期間，和 Edge Case、SC-001 不一致；FR-003、FR-005、FR-017、FR-020 缺驗收情境；FR-003、FR-014 漏列推定），第 2 輪通過；沒有未通過項。憲法：只有 `shared.md`，Rule 1 通過 | — |
| 3 | `clarify-over-specs` | 更新 `spec.md`（Clarifications 新增 5 條；新增 FR-021；改寫 US1、US2 敘述、US2 Independent Test、FR-005、FR-014、FR-016、Key Entities、SC-003；US1 驗收情境新增 11～15；US2 驗收情境 4 拆成 4、5，原 5～15 改編 6～16，原 7（現 8）改寫；Edge Cases 改 1 條、新增 3 條；Out of Scope 新增 1 條（使用者決定）；Assumptions 刪除 FR-014 推定） | 回答 2 輪共 5 題，皆採推薦選項：(1) 恢復運作時，等待重試的「送出中」繼續重試、等回應的標「結果不明」（FR-021）；(2) 只有連線在送出前就失敗才自動重試，送出後中斷標「結果不明」（FR-014、FR-016）；(3) 重送不等結果，先顯示「送出中」（FR-005）；(4) 只能一則一則重送（Out of Scope）；(5) Discord 要求等待超過 1 分鐘直接標「送出失敗」（FR-014） | 「沒被問到的規則」本次沒有，依「影響 × 不確定性」排序出題（同 iter-5 步驟 3）。交接文件列的 5 條推定（FR-016、FR-018、FR-008、FR-014、FR-006）只有 FR-014 被問到；其餘判為低不確定性或已由 Clarifications 決定（FR-006 對應已確認的「結果不明先確認再重送」）。觀察 `92f7c1e`（iter-5 流程不足「11」）：寫回決策時有改寫矛盾的舊敘述（US2 驗收情境 4、8 的「變成送出成功」改成先顯示「送出中」；SC-003 兩次配合 FR-014、FR-016 改寫；Edge Case「自動重試時又等不到回應」改寫；Assumptions 刪除已確認的推定），待決定矛盾 0 項；執行者知道要觀察這項，只能當弱證據。格式驗證 2 輪都 1 次通過，沒有未通過項。分類最終狀態：Resolved 3（功能範圍與行為、互動與 UX 流程、整合與外部依賴）；Outstanding 2（非功能品質屬性：FR-016 10 秒、NFR-001 2 秒仍為推定；邊界情境與錯誤處理：本次問的 2 項已解決，剩自動重試等待期間借用被歸還仍會送出，影響低）；其餘 Clear；Deferred 0。推定需求剩 15 條 | `61ba062` |
| 4 | `technical-research` | `research.md`（8 個主題）、`techstack.md` | 回答 `clarify` 1 題，採推薦選項：自動檢查加 `.env` 開關 `OVERDUE_AUTO_CHECK_ENABLED`、預設開啟；只有展示與測試 US3 手動檢查時關閉（FR-001 的例外） | 沒有。使用者限制的 4 個新主題都有決策：排程（§2，程序內計時器＋PostgreSQL 工作狀態，每 60 秒檢查、每 1 秒送出）、Discord 呼叫（§3，內建 `fetch`＋`?wait=true`，`Retry-After` 標頭優先，>60 秒直接失敗，只對連線建立前的錯誤代碼重試）、模擬器（§6，自寫 `node:http`，以控制端點切換 6 種模式）、`.env` 與 log（§5，`--env-file-if-exists`，log 只印主機名稱）；另有資料表（§1）、API 與並發（§4）、前端（§7）、測試與 seed（§8）。沿用 007 的技術在各主題都寫了沿用理由；007 列為不引入的 Discord Webhook、`node-cron` 本次重新評估並寫理由。決策缺口 1 項（Phase 1 找出）：FR-001／FR-002 自動檢查會搶先通知 demo seed 的「未通知逾期借用」，和 US3 驗收情境 6、FR-020 衝突，經 `clarify` 決定。查證：Context7 查 Discord 官方文件（`wait`、Rate Limits）、Node.js 24 文件（`--env-file-if-exists`）、undici 文件（錯誤代碼）；本機實測 `fetch` 的錯誤代碼與 `tsx` 傳遞 `--env-file-if-exists`。查證時發現後端目前沒有載入 `.env`（`DATABASE_URL` 只靠程式預設值），寫進 §5。驗證：`research.md` 第 1 輪修 2 處（補 Discord 速率估算依據、補 §7 的 2 秒預估值），第 2 輪通過；`techstack.md` 第 1 輪通過；未通過項 0。憲法：讀 `shared.md`（Rule 1 通過），`technical-research` 專屬憲法檔不存在；沒有偏離與未套用規則。執行者在交接文件已讀到 FR 與技術主題的對應提示，主題盤點的完整度只能當弱證據 | `ae040c0` |
| 5 | `system-analysis`（Planner：`ui-plan`、`api-plan`、`data-plan`，子代理皆指定 Opus） | `plan.md`（5 種端點、15 個介面、3 個 Wave）；`ui/plan.md`、`ui/index.html`、`ui/overdue-notifications.html`；`contracts/openapi.yaml`（27 個 operation：B1 1、B2 1、B3 1、B4 24）；`data/data-model.dbml`（9 張表：D1 1、D2 8） | 沒有。提示詞已指定專案結構與視覺風格（沿用 007 結構、003 視覺風格），SOP 沒有提問；目錄內原本沒有 `plan.md` 與 Planner 產出，不需覆寫同意；憲法衝突 0 項 | **沒有 Planner 的端點（第四題證據）**：排程 S1 逾期自動檢查排程、S2 通知送出與自動重試程序、S3 系統恢復運作時中斷通知的處理；通知服務 N1 Discord Webhook 逾期通知送出、N2 本機 Discord Webhook 模擬器。Wave 3（排程）整個 Wave 跳過；Wave 2 委派時註明「N1、N2 未分析，請改依技術研究結果」。這 5 個介面承載 FR-001、FR-002、FR-014～FR-016、FR-021、SC-001、SC-003 等核心需求，目前只有 research §2、§3、§6 的文字決策，沒有可交給 `tasks` 的規格產出。`.env` 設定（research §5）沒有列為端點，寫在 Source Code 樹與 N1 的需求依據（NFR-003、SC-006）。**檢查腳本**（主 session 重跑一次，結果相同）：`plan.md` 需求編號查核 31 個全部「找到」，US1～US3 都「已引用」，樣板結構與兩份檢查清單第 1 輪通過，未通過項 0；`ui-plan` `check_ui.py` `ok: true`、issues 0、warnings 0；`api-plan` `check_contracts.py` issues 0、Redocly lint 0 error；`data-plan` `check_data_model.py` issues 0（第 1 輪通過後，自行發現一對一 `Ref` 方向相反，修正後重跑仍通過）。**上游衝突 1 項（`api-plan` 回報）**：`ui/plan.md` 與雛形沒有分頁控制，只顯示「共 N 則通知」；research §4 與憲法 `openapi.md` Rule 1 要求 `page`／`pageSize`，合約照分頁寫，通知超過一頁時 UI 看不到第二頁；建議由 `ui-plan` 補（主 session 已確認 `ui/plan.md` 沒有「分頁」字樣，research §4 第 108 行有寫 `page`、`pageSize`）。待步驟 7 `analyze` 觀察是否抓到，步驟 10 再分類。**`ui-plan` 自行縮小範圍**：F4 只做登入頁，設備預約、我的預約、管理員總覽列為不在範疇並指向 007 `ui/`，和 `plan.md` F4 列出的 4 個畫面不同。**`data-plan` 自行決策**：`reservation_id` 依憲法 Rule 4 在欄位標 `unique`（research 寫唯一索引名稱，note 保留名稱）；多加 `idx_overdue_notifications_created` 支援不篩選時的排序；把「送出失敗」「結果不明」解讀為非終態，重送更新同一列不違反憲法 Rule 4；`failure_reason` 只在 `failed` 時有值。**`api-plan` 自行決策**：清單多回傳 `reservationNumber`、`userId`、`returnedAt`、`discordMessageId`、`createdAt`；排序補 `id ASC`；重送 202 時 `attemptCount` 尚未加 1，由送出程序領取時加 1；B1～B3 的 403 沿用 `requireAdmin` 訊息，訊息文字是否改由實作決定 | `ae040c0` |
| 6（A 組） | `tasks`（A 組 worktree 的 `.agents/skills/tasks/SKILL.md`，Skill 版本 `ae040c0`，未修改） | A 組 `specs/008-overdue-discord-notification/tasks.md`：41 個任務（Setup 2、Foundational 2、US1 12、US2 10、US3 5、Polish 10），135 項參考 | 沒有。目錄內原本沒有 `tasks.md`，不需覆寫同意；憲法衝突 0 項，沒有委派 `clarify` | **結束後的檢查（runbook 步驟 6）**：(1) 舊資料遷移與回歸任務：有。T006 遷移只建 Enum、資料表、索引與外鍵，T007 套用前後比對 8 張既有資料表列數，T016 讓 Playwright 啟動後端時關閉自動檢查並啟動模擬器，T039 重跑前五版全部測試（SC-007）。(2) demo seed 任務：有。T017（US2）先清除 `overdue_notifications`，以「昨天」時段建立三種狀態的通知；T027（US3）保留至少一筆沒有通知的逾期借用。(3) Notes 待確認 5 項。**沒有 Planner 的介面（第四題證據）**：S1～S3、N1～N2 照 Rule 1 歸入 US1 的「後端（S1–S3、N1、N2、B4）」組，任務內容依 research §2、§3、§5、§6 的文字決策寫成（T009 Discord 呼叫與結果分類、T010 `runOverdueCheck(now)`、T011 通知文字、T012 `dispatchDueNotifications(now)`、T013 `recoverInterruptedNotifications(now)` 與 `start()`、T015 模擬器），每個任務都標「見 Notes 待確認 n」。待確認 1：S1～S3 沒有排程規格，暫依 research §2、§3 與 data-model 的 `overdue_notifications` 欄位說明；待確認 2：N1 沒有 Discord 請求與回應的合約，也沒有定義通知文字版面與「逾期多久」的格式，暫定格式寫在 Notes；待確認 3：N2 沒有 Webhook 端點與 `/__sim/*` 控制端點的合約，暫依 research §6。Must Read 只能指向 `research.md` 的章節與 `data/data-model.dbml`，沒有 contracts 或 ui 的部位可綁。**其他上游缺口**：待確認 4 分頁（步驟 5 `api-plan` 回報的同一項，`tasks` 有抓到，暫行做法為 `pageSize=100`）；待確認 5 `ui/plan.md` §1 寫「把管理員登入後的入口改到逾期通知紀錄」，`plan.md` 只寫新增頁籤，既有 E2E 依賴管理員登入後先進「設備狀態管理」，暫維持原預設畫面。**既有測試依賴**（Phase 2 步驟 4）：找到 3 處（`api.test.ts` 林雅婷借用中只有 1 筆、`equipment-maintenance.spec.ts` 把 EQ-104 設為送修、`zh-TW.test.ts` 的 `ERROR_MESSAGES` 有 19 個），以限制 T003、T017、T023 的做法避開，寫在 `**Tests**:`，沒有排更新既有測試的任務。spec 沒有要求測試，各 US 不產生新功能的測試任務，SC-001～SC-007 都在 Polish 以量測任務處理。**檢查**：`check_tasks.py` 第 1 輪 issues 0、warnings 0；任務清單檢查清單 5 條 Rule 與樣板結構逐條核對通過；未通過項 0。憲法：讀 `shared.md`（Rule 1 通過），`.agents/constitution/skills/tasks/tasks.md` 不存在；憲法偏離 0、未套用規則 0。**執行偏差**：SOP Phase 1 步驟 4 要讀上游全文；`contracts/openapi.yaml` 的 B4 舊 schema（約第 1138～2660 行）只以關鍵字掃過，`ui/*.html` 只讀標記與「雛形狀態」清單，沒有讀完 `<style>` 與 `<script>`；其餘全文讀取 | A 組 `8c4441c`（`ab/group-a`） |
| 7（A 組） | `analyze`（A 組 worktree 的 `.agents/skills/analyze/SKILL.md`，Skill 版本 `ae040c0`，未修改；主 session 直接執行，SOP 沒有委派子代理的步驟） | A 組 `specs/008-overdue-discord-notification/analysis.md`：9 個問題（CRITICAL 0、HIGH 4、MEDIUM 4、LOW 1），需求涵蓋 31／31（100%），憲法 12 條 Rule 全部通過 | 沒有。SOP 沒有提問與確認閘門 | **CRITICAL 0 項**，不需要跑 P7b；依 Rule 5「下一步」寫可以繼續 `implement`，建議先處理 E1、E2、F1、F2。**分頁缺口（tasks 待確認 4）**：有抓到，列為 F1（HIGH，不一致），位置 `contracts/openapi.yaml` → `listOverdueNotifications` 與 `ui/plan.md` → `共 8 則通知`，指出 T024 的 `pageSize=100` 超過 100 則仍看不到，違反 FR-003；處理 Skill `ui-plan`（理由：合約遵循憲法 `openapi.md` Rule 1「必須」）。**沒有 Planner 的介面（第四題證據）**：S1～S3 列為 E1（HIGH）、N1 列為 E2（HIGH，含 FR-013 通知版面與「已逾期多久」格式未定義）、N2 列為 E3（MEDIUM），三項的處理 Skill 都是「需要使用者決定（候選：`system-analysis`、`technical-research`）」，因為沒有任何 Planner 負責排程與通知服務。**tasks 待確認 1～3**：依 Rule 2 摘要開頭寫「已記錄：tasks.md 待確認 n」，位置改指向上游（`plan.md` 的 S1～S3、N1、N2 列與 research §2、§3、§6），分別對應 E1、E2、E3；待確認 5 對應 F2（HIGH，登入後入口，需要使用者決定 `ui-plan` 或 `system-analysis`）。**其他問題**：F3 重送 `404` 在 `ui/plan.md` §5 與 T026 沒有回饋；F4 雛形 3 個失敗原因文字和 data-model、research §1、T023 不同；B1 Edge Case「借用被歸還時通知狀態不變」沒有說明等待自動重試的通知是否繼續送出；A1 NFR-001 與 SC-005 重複。沒有對應需求的任務：T040。**觀察到的 Skill 行為（待步驟 10 分類）**：(1) `collect_coverage.py` 讀不到合約 `tags:` 下一行同縮排的 `- ` 寫法，B1～B4 判成沒有 Planner 產出；又把 `ui/plan.md` §1「不在範疇」提到的 S1～S3、N1 判成有產出；數量剛好都是 5，`analysis.md` 依 SOP 統計照抄 5，並在統計下方寫明實際介面。(2) `rules/分析問題-格式規範.md` Rule 4 沒有寫「介面沒有 Planner 產出」屬哪一級，E1、E2 依「P1 核心行為沒有介面規格」判為 HIGH，屬執行者判斷。**檢查**：Phase 2 步驟 5 以 `grep -F` 確認 26 個位置識別字都找得到；Phase 3 步驟 3 沒有殘留 `{{`、統計與涵蓋盤點一致、A 組 spec 目錄只新增 `analysis.md`。**執行偏差**：`ui/index.html` 第 1～149 行的 `<style>` 只過濾變數與 class 行略讀；其餘上游文件與合約全文讀取 | A 組 `b0cac59`（`ab/group-a`） |
| 5n（B 組） | `notification-plan`（B 組 worktree 的 `.agents/skills/notification-plan/SKILL.md`，Skill 版本 `b17d451`，未修改；主 session 直接執行，SOP 沒有委派子代理的步驟；`clarify` 依 SOP 讀 B 組 `.agents/skills/clarify/SKILL.md` 執行，沒有用 Skill 工具） | B 組 `specs/008-overdue-discord-notification/notification/plan.md`：負責介面 S1、S2、S3、N1、N2；不在範疇 0 個（端點類型不是前端、後端、資料庫的 5 個介面都負責通知）；觸發條件 TR1～TR4；狀態轉換 11 列、恢復處理 5 列；失敗分類 13 列；重複處理 9 列；驗收情境 NS1～NS23 | 回答 `clarify` 1 輪 2 題，都採推薦選項：(1) UD1「已逾期多久」用天、小時、分鐘，只省略前面為 0 的單位，分鐘無條件捨去，不到 1 分鐘寫「已逾期不到 1 分鐘」；(2) UD2 通知在「送出中」時借用被歸還，S2 照常送出、依結果更新狀態，之後依 FR-008 不能重送。沒有覆寫確認（目錄內原本沒有 `notification/`） | **結束後的檢查（runbook 步驟 5n）**：(1) 每個負責介面各一個 §5.n（§5.1 S1～§5.5 N2）。`check_notification_plan.py` 第 1 輪 issues 0、warnings 1（`failureReasons` 不在 data、contracts、research、spec；它是 `ui/overdue-notifications.html` 的 `MOCK.failureReasons`，腳本不掃 `ui/`，屬 UC1 的位置）；未通過項 0。主 session 逐條核對 RuleFile Rule 1～6 與樣板結構時自行修 2 處：「已逾期多久」對照表原本也省略中間與結尾為 0 的單位，超出使用者選的選項原文，改回只省略前面為 0 的單位；§5.2 的「保證同一則只被領取一次」接近 Rule 4 禁止的絕對保證，改寫。修正後重跑腳本，結果相同；沒有殘留 `{{`。憲法：讀 `shared.md`（Rule 1 通過），`.agents/constitution/skills/notification-plan/notification-plan.md` 不存在；憲法衝突 0。(2) `clarify` 2 題。UD1 只決定 FR-013 已要求內容的格式；UD2 選的是維持 spec Edge Case「通知的狀態不變」的做法，沒有新狀態或欄位。兩題都沒有帶進 spec 沒要求的新行為，也沒有因此產生上游衝突（`docs/待確認.md` 第 31 項第 2 點本次沒有出現）。(3) 檔頭「上游」列 `plan.md`、`research.md`、`techstack.md`、`data/data-model.dbml`、`contracts/openapi.yaml`、`ui/plan.md`、`ui/overdue-notifications.html`。全文讀過：`spec.md`、`plan.md`、`research.md`、`techstack.md`、`data/data-model.dbml`、`ui/plan.md`、`ui/overdue-notifications.html`。`contracts/openapi.yaml` 只讀第 1～140 行（B1～B3 operation）、第 1725～1784 行（`isOverdue`）與第 2640～2976 行（逾期通知 schema 與 responses），B4 其餘以 grep 掃 `overdue` 關鍵字；`ui/index.html` 沒有讀，檔頭也沒有列（`docs/待確認.md` 第 31 項第 1 點：本次有部分讀取，但檔頭只列讀過的檔案）。(4) **上游衝突 2 項（只記錄，不修改上游）**：UC1 `ui/overdue-notifications.html` `MOCK.failureReasons` 有 3 個失敗原因的畫面文字和 `data/data-model.dbml` Enum note、research §1 不同（`connection_failed`「無法連線到 Discord」對「無法連線」、`webhook_not_configured`「通知設定有誤：沒有設定 Webhook」對「通知設定有誤：沒有設定」、`message_rejected`「Discord 拒絕這則訊息的內容」對「Discord 拒絕訊息內容」），`ui/plan.md` 沒有列這 3 個原因的文字 → `ui-plan`。UC2 research §6 模擬器的 6 種模式無法重現其他 `4xx`（`message_rejected`）、`401`／`403`、`200` 沒有 `id`、沒有等待秒數的 `429`，NS11、NS15 改以單元測試驗證分類函式 → `technical-research`。步驟 5 `api-plan` 回報的分頁衝突不屬通知範疇，沒有列入。**執行偏差**：使用者要求不讀本檔 A 組步驟 6～7 的紀錄，但主 session 在 Phase 1 為了找步驟 5n 的段落，讀了本檔全文，看到了 A 組步驟 6、7 列（含 `analyze` F4 失敗原因文字不一致、B1 借用歸還時通知是否繼續送出）。UC1 與 F4 是同一件事，UD2 的提問與 B1 相關；兩者都能從 B 組上游直接找到（UC1 來自 `MOCK.failureReasons`，UD2 來自 spec Edge Cases 與步驟 3 的 Outstanding），但不能排除受 A 組紀錄影響，A/B 比較時這兩項只能當弱證據 | B 組 `f614f1a`（`ab/group-b`） |
| 6（B 組） | `tasks`（B 組 worktree 的 `.agents/skills/tasks/SKILL.md`，Skill 版本 `b17d451`，未修改；主 session 直接執行，SOP 沒有委派子代理的步驟；憲法衝突 0，沒有執行 `clarify`） | B 組 `specs/008-overdue-discord-notification/tasks.md`：39 個任務（Setup 2、Foundational 3、US1 9、US2 11、US3 4、Polish 10），130 項參考 | 沒有提問；沒有覆寫確認（目錄內原本沒有 `tasks.md`） | **結束後的檢查（runbook 步驟 6）**：(1) **舊資料遷移與回歸任務**：T004（Foundational，`--create-only` 產生 008 遷移，SQL 只能建立 2 個 Enum、`overdue_notifications`、索引與外鍵，不得修改 003～007 的資料表與資料列）、T005（`seedDatabase()` 先清 `overdue_notifications` 再清 `reservations`）、T036（Polish，比照 `equipmentMaintenanceRetire.test.ts` 以 `pg` 逐支執行 `migration.sql`，驗證既有資料不變、新表為空，FR-020、US1 情境 10）、T038（Polish，重跑 `test:backend`、`test:frontend`、`test:e2e` 並記錄通過率，SC-007）。既有測試依賴：用 `seedDatabase`、`ERROR_MESSAGES`、`equipment-status-table`、`nav-*`、`webServer`、`dev` 指令與 `prisma/migrations` 搜尋並讀過命中段落，找到 5 處（`api.test.ts` 林雅婷借用中 1 筆、`equipment-loan.spec.ts`「借用中 2 件」、`equipment-maintenance.spec.ts` 把 `EQ-104` 設送修與停用並依賴管理員登入後看到 `equipment-status-table`、`zh-TW.test.ts` 斷言 `ERROR_MESSAGES` 19 個鍵）。T015、T020、T025 在任務內避開這些行為，不改測試；T013 讓後端 `dev` 啟動排程，在 US1 同一組以 T014 更新 `playwright.config.ts`（關閉自動檢查、啟動模擬器）。(2) **demo seed 任務**：T005（Foundational，清除順序）與 T015（US2 資料庫組：昨天上午、下午時段建立 `checked_out` 逾期借用，`sent`、`failed`、`unknown` 各一則，`next_attempt_at` 都為空，另至少 1 筆沒有通知；只用陳冠廷、只用 `EQ-101`～`EQ-103`，避開昨天晚間已占用的 `EQ-102`、`EQ-103`，FR-020、US2 情境 16、US3 情境 6）；US3 沒有資料庫任務，以引言說明沿用 T015。(3) **Notes 待確認 4 項**：1 失敗原因畫面文字不一致（UC1，影響 T020，暫用 data-model、research、合約的寫法）；2 模擬器無法重現 4 類回應（UC2，影響 T008、T031，改把回應直接交給分類函式驗證）；3 管理員登入後入口（`ui/plan.md` §1、§4 寫改到逾期通知紀錄，plan.md、research §7 與既有 e2e 是維持 `equipment-status`，影響 T025，暫維持）；4 B1 分頁但 `ui/plan.md` 沒有分頁控制項（影響 T023，暫以 `pageSize=100` 查詢）。另有 2 條非待確認的 Notes：新增 6 個測試檔名（plan.md 只列目錄）、plan.md Documentation 樹沒有列 `notification/plan.md`。(4) **S1～S3、N1、N2 綁定**：全部以 Must Read 綁到 `notification/plan.md` 的 §5.n：S1 → T009、T012（§5.1）；S2 → T011（§5.2）、T012（§5.2）；S3 → T011（§5.3）；N1 → T007、T010（§5.4）；N2 → T008（§5.5）。另 T007、T011 Must Read §3（失敗分類），T009、T011、T018 Must Read §2（狀態轉換），T031～T034 Must Read §7 的 NS 情境。組標題為 US1「後端（S1–S3、N1–N2）」，依 Rule 1 把排程與通知服務歸入呼叫它的後端組。`check_tasks.py` 第 1 輪 issues 0、warnings 0；主 session 逐條核對 RuleFile Rule 1～5 與樣板結構，沒有修改；未通過項 0。憲法：讀 `shared.md`（Rule 1 通過），`.agents/constitution/skills/tasks/tasks.md` 不存在；憲法偏離 0、未套用規則 0。(5) **讀取範圍**：全文讀過 `spec.md`、`plan.md`、`research.md`、`techstack.md`、`data/data-model.dbml`、`ui/plan.md`、`notification/plan.md`。`contracts/openapi.yaml` 只讀第 1～135 行（B1～B3 operation）、第 1094～1138 行（`Error`）與第 2660～2976 行（逾期通知 schema 與 responses），B4 其餘只以 grep 列出 operationId 與 schema 名稱；`ui/overdue-notifications.html`、`ui/index.html` 只以 grep 讀「雛形狀態」名稱。既有程式與測試以 `ls`、grep 與命中段落讀取。**執行偏差**：在本檔 grep「A/B worktree」與「5n（B 組）」時，輸出多帶出第 30、63、75 行（`ab/group-b` push 狀態、接下來的步驟、中途變動），不是 A 組步驟 6～7 的列；沒有讀 A 組步驟 6～7 | B 組 `513708a`（`ab/group-b`） |
| 7（B 組） | `analyze`（B 組 worktree 的 `.agents/skills/analyze/SKILL.md`，Skill 版本 `b17d451`，未修改；主 session 直接執行，SOP 沒有委派子代理的步驟） | B 組 `specs/008-overdue-discord-notification/analysis.md`：問題 6 筆（CRITICAL 0、HIGH 1、MEDIUM 4、LOW 1）；需求涵蓋 31/31（100%）；任務 39；介面 15，沒有任務的介面 0；憲法 3 份 12 條 Rule 全部通過 | 沒有提問；目錄內原本沒有 `analysis.md` | **CRITICAL 0**，不需要 P7b。**HIGH 1**：F1 管理員登入後的入口（`ui/plan.md` §1、§4「管理員登入成功」寫改到逾期通知紀錄；`plan.md` 的 `App.tsx` 與 research §7 只新增頁籤；已記錄為 tasks.md 待確認 3）→ 需要使用者決定（候選 `ui-plan`、`system-analysis`）。**MEDIUM 4**：C1 模擬器無法重現 4 類回應（待確認 2）→ `technical-research`；F2 3 個失敗原因畫面文字不一致（待確認 1，即 notification/plan.md UC1）→ `ui-plan`；F3 合約分頁但 `ui/plan.md` 沒有換頁控制項（待確認 4）→ `ui-plan`；F4 `plan.md` 的 `e2e/`、`tests/unit/` 與 research §8 規劃新功能的 e2e 與單元測試，`tasks.md` 依 spec 沒要求測試而沒排 → 需要使用者決定（候選 `tasks`、`system-analysis`、`technical-research`）。**LOW 1**：F5 `plan.md` Documentation 樹沒有列 `notification/plan.md` 與 `ui/overdue-notifications.html` → `system-analysis`。`tasks.md` 的待確認 1～4 全部對應到問題（F2、C1、F1、F3），位置都指向上游文件。**涵蓋盤點的限制**：`collect_coverage.py` 退出 0，但把 B1～B4 判成沒有合約產出（`interfaces_without_planner_output` 4）；原因是合約 `tags` 的清單項目與 `tags:` 同一縮排，`block_tags` 讀不到。主 session 以 `grep -n` 確認 `listOverdueNotifications`、`resendOverdueNotification`、`runOverdueCheck` 與 25 個 B4 operation 都存在，不列為問題；「統計」依 SOP 照抄 4，在「介面涵蓋」備註與「下一步」說明。這是 `analyze` 腳本的缺陷，Skill 未修改。**憲法檢查方式**：`openapi.md` Rule 1～7 以 PyYAML 臨時腳本（`/tmp/an7`，只讀）逐一列出 28 個 operation 的參數、回應碼與分頁 schema 後判斷；`data-model.md` Rule 1～4 與 `shared.md` Rule 1 以全文讀取判斷；沒有鎖定項目衝突。所有位置的識別字都以 `grep -n` 確認找得到；沒有殘留 `{{`；spec 目錄只新增 `analysis.md`。**讀取範圍**：沿用步驟 6 已讀的全文（`spec.md`、`plan.md`、`research.md`、`techstack.md`、`data/data-model.dbml`、`ui/plan.md`、`notification/plan.md`、`tasks.md`）；本步驟另讀 `ui/overdue-notifications.html` 第 200～599 行（版面、假資料與互動）；`contracts/openapi.yaml` 除步驟 6 讀過的部分外，以腳本解析全檔；`ui/index.html` 只以 grep 讀狀態名稱 | B 組 `7cf0db8`（`ab/group-b`） |
| 8（B 組） | `implement`（B 組 worktree 的 `.agents/skills/implement/SKILL.md`，Skill 版本 `b17d451`，未修改）。主 session 跑 SOP Phase 1（`status --reset`）與 Phase 3（`report`）；SOP Phase 2 依 CLAUDE.md 選模表，每個 tasks Phase 委派一個 `implementer` 子代理（Sonnet），`--scope phase:1`～`phase:6` 依序執行，主 session 在每個 Phase 後 commit | B 組 `apps/equipment-loan/`：後端 config、Discord Webhook client、模擬器、逾期檢查與送出排程、管理員 3 個端點、migration 與 seed；前端「逾期通知紀錄」頁籤與畫面；6 個新測試檔；README；`tasks.md` 39 個任務由 `tasks_state.py check` 打勾 | 沒有提問。`report`：完成 39/39、受阻 0；憲法只讀到 `shared.md`（`skills/implement/code.md` 不存在），必須／不得規則全部通過，偏離 0、未套用 0 | **受阻任務**：無。**待確認的暫行做法**：待確認 1（失敗原因文字採資料模型與合約的寫法）、待確認 2（模擬器不能重現的回應改用臨時固定回應位址測分類）、待確認 3＝analysis F1（管理員登入後仍進設備狀態管理，只新增頁籤，頁籤對成員也顯示、點開看到權限不足卡片）、待確認 4（固定取第 1 頁 100 筆）。analysis F4：沒有新增 tasks.md 以外的測試任務。**自行決策**（主要）：T004 `migrate dev --create-only` 在非互動環境中止，且 Prisma 會對既有 partial unique index 產生偽 DROP／CREATE，改用 `migrate diff` 產 SQL 後手寫 migration；T006 設定值不合法時退回預設、每次重讀環境變數；T007 沒有 `Retry-After` 的 429 用 2、4、8 秒退避，未分類狀態碼歸結果不明；T011 速率限制暫停用模組變數；T012 `start()` 回傳 stop；T015 新 demo 借用只用陳冠廷、EQ-101～103，demo 共 3 筆沒有通知的逾期借用；T018 不能重送的訊息依 `ui/plan.md` §5 帶預約編號與狀態；T029 檢查中只停用「立即檢查逾期」與「重新整理」；T031 每個情境用不同日期，避免時間倒退碰到速率限制暫停；T032 並發重送改打路由取得 202／409；T036 新 migration 測試的資料庫名稱由 `DATABASE_URL` 推出；T039 手動檢查實測建立 3 則（tasks 的「1 則」為舉例）。完整清單在子代理回報，主 session 暫存於 `/tmp/impl8-decisions.md`。**SOP 偏離**：T029 沒有讀 Must Read 的 `ui/overdue-notifications.html`（子代理判斷 `ui/plan.md` 已涵蓋），`check --read` 也沒列。**環境**：(1) 主 session 在主目錄的 Postgres 容器另建 `equipment_loan_ab_b`，`backend/.env`（忽略）指向它。(2) `vitest`、`prisma`、`tsx` 直接執行不讀 `.env`，會退回 `equipment_loan`；Phase 1、2 的後端測試因此寫入主目錄的 `equipment_loan`（之後唯讀查詢：仍是 5 支 migration、沒有逾期通知資料表、預約 22 筆＝seed 筆數，看起來被測試重設成 seed 狀態）；Phase 2 的一次 `migrate diff` 也唯讀連到它。Phase 3 起每個命令先載入 `.env`。(3) 既有 007 遷移測試寫死資料庫 `equipment_loan_migration_test`，和其他組同時執行會互相影響；Phase 6 完整測試排除它，另用改名的暫存複本跑一次。(4) Phase 4 子代理用沒有限定目錄的 `pkill -f "src/server.ts"`；主 session 確認 5173 屬於其他專案、沒有受影響，並停掉 1 個殘留的 B 組 `tsx watch`。(5) 既有 `api.test.ts` 的 SC-001 & FR-001 & FR-002 和執行時間有關，11:50 左右失敗、12:00 之後通過，本次沒有修改。**Phase 1 commit 訊息**少了標題後的空行，未 push 前以 amend 修正；Phase 3 也 amend 修正模擬器模式描述。**測試**：主 session 在 12:42～12:43 重跑：後端 13 檔 72/72（排除 007 遷移測試；Phase 6 子代理另以暫存複本跑 007 為 4/4，合計 76/76）、前端 4/4、e2e 5/5。各 Phase Checkpoint 的 `npm run check`、build 都通過；Phase 3～6 子代理以瀏覽器或真實伺服器加模擬器走過 US1～US3 的 Independent Test。結束時沒有殘留程序、臨時資料庫與未 commit 檔案；`equipment_loan_ab_b` 已重跑 seed。**本機啟動**：在 `apps/equipment-loan/` 先載入 `backend/.env` 跑 `npm run db:seed`，再分別啟動 `npm --prefix backend run discord:sim`（4010）、`OVERDUE_AUTO_CHECK_ENABLED=false npm --prefix backend run dev`（3000）、`npm --prefix frontend run dev -- --port 5183 --strictPort`；管理員 `wu.chenghan`／`Admin@2026`、成員 `lin.yating`／`Member@2026` | B 組 `7dda70c`（Phase 1）、`c7e3a3c`（Phase 2）、`abf9dc8`（Phase 3）、`8729f4c`（Phase 4）、`8b7de36`（Phase 5）、`0d60ce6`（Phase 6）（`ab/group-b`） |
| 合併後（`main`，2026-11-11～12） | `analyze` 重跑多次；依問題交 `ui-plan`、`technical-research`、`system-analysis`、`notification-plan`、`tasks`；`implement` T040～T042。後段以自動模式（`scripts/auto-mode.sh on all`）連續接續 | `analysis.md` 最後一版 CRITICAL 0、HIGH 0、MEDIUM 0、LOW 0；`tasks.md` 新增 T040（通知清單換頁）、T041（目前頁碼超過總頁數時改載最後一頁）、T042（重新整理與換頁不跳動、不閃爍），42 個任務全部勾選 | 決定 analysis F1～F5、C1 的處理方向；實際驗證 T041 通過；回報 T042 抖動、閃爍、沒有反應；最後決定先完成流程，T042 細項留到換 UI 套件時處理 | **自動模式的問題**：(1) 新分頁在子目錄啟動，沒有載入 hook，接續中斷（`f95ff12` 修正）；(2) 一步自動寫了「我已在瀏覽器手動驗證 T041 通過」，下一步照著 commit `4255a2c`，T041 當時並未經使用者驗證（`1b84b9c` 加上不得代使用者宣稱驗證、遇到驗證與 commit 時停止；之後使用者實際驗證 T041 通過）。**T042 修了 3 次**：第 1 次只修版面位移；第 2 次把回饋藏在 0.3 秒門檻後，按了看不出反應；第 3 次才同時做到有反應、不位移、不閃爍、看得出完成。前兩次的 agent 自動檢查只量剛改的那一點，所以顯示通過。第 3 次未經使用者驗證（`docs/待確認.md` 第 32 項）。e2e `equipment-loan.spec.ts:77` 在修改前後都失敗，原因未查證（第 33 項） | `99755c9`、`faddff8`、`4255a2c`、`b1cbc6b`、`dcb2181`、`a00eb91` |

## Skill 表現檢查

| Skill | 預期 | 實際 | 分類（需求缺漏／程式錯誤／Skill 缺陷／沒有問題） | 證據位置 |
|---|---|---|---|---|
| `notification-plan`（B 組） | S1～S3、N1、N2 各寫一個 §5.n；spec 沒決定的業務規則委派 `clarify`；和上游不一致的地方列為上游衝突，不修改上游 | 5 個 §5.n 都有。`clarify` 2 題（UD1、UD2）都沒有帶進 spec 沒要求的行為。UC1、UC2 列為上游衝突，交回 `ui-plan`、`technical-research`。主 session 核對 RuleFile 時找到並修正 2 處超出規則的寫法。腳本 warnings 1（`failureReasons` 出自 `ui/`；腳本依設計只掃 `data/`、`contracts/`、`research.md`、`spec.md`），主 session 判斷不是問題。使用者驗證 F2～F6 的狀態轉換、失敗分類與重試行為都符合 | 沒有問題 | 本檔 5n（B 組）列；B 組 `specs/008-overdue-discord-notification/notification/plan.md`；B 組 `.agents/skills/notification-plan/scripts/check_notification_plan.py` 第 14、60～66 行 |
| `tasks`（B 組） | 依 RuleFile Rule 1～5 拆任務；S1～S3、N1、N2 以 Must Read 綁到 `notification/plan.md` §5.n；有舊資料遷移、demo seed 與既有測試依賴的任務；上游缺口寫進 Notes 待確認 | 39 個任務，S1～S3、N1、N2 都綁到 §5.n。T004、T036 處理遷移，T005、T015 處理 demo seed，既有測試依賴 5 處都在任務內處理。待確認 4 項都指向上游。`check_tasks.py` issues 0、warnings 0。analysis F4（沒有新功能的 e2e 與單元測試任務）是依 Rule 5「spec 沒有明確要求時不得產生為新功能撰寫測試的任務」，不是偏離；它和 `plan.md`、research §8 的測試規劃不一致，要由使用者決定 | 沒有問題 | 本檔 6（B 組）列；B 組 `tasks.md`；B 組 `.agents/skills/tasks/rules/任務清單-格式規範.md` 第 156～159 行；B 組 `analysis.md` 第 17 行（F4） |
| `analyze`（B 組）：分析結果 | 找出跨文件的不一致與涵蓋缺口，位置與處理 Skill 正確，嚴重度判定合理 | 6 筆問題（CRITICAL 0、HIGH 1、MEDIUM 4、LOW 1），都有對應證據；`tasks.md` 待確認 1～4 全部對到問題；需求涵蓋 31/31。使用者驗證沒有發現 `analyze` 漏掉的問題 | 沒有問題 | 本檔 7（B 組）列；B 組 `analysis.md` |
| `analyze`（B 組）：`collect_coverage.py` | 合約 B1～B4 都有 operation，`interfaces_without_planner_output` 應為 0 | 腳本回報 4。`block_tags` 遇到和 `tags:` 同一縮排的清單項目（`- B1 逾期通知紀錄查詢 API`）就停止讀取，所以讀不到 tags；這是合法的 YAML 寫法。主 session 以 `grep -n` 確認 operation 都存在，在「介面涵蓋」與「下一步」加註，但「統計」依 SOP 照抄 4 | Skill 缺陷（見「Skill 問題」問題 B-1） | B 組 `.agents/skills/analyze/scripts/collect_coverage.py` 第 234～251 行（第 245 行）；B 組 `contracts/openapi.yaml` 第 28～29 行；B 組 `analysis.md` 第 66、109、115 行 |
| `implement`（B 組）：任務執行 | 依 `tasks.md` 順序完成任務，驗證通過才打勾；上游矛盾自行決策並寫進完成報告；全程不提問 | 39/39、受阻 0，沒有提問。T004 `migrate dev --create-only` 在非互動環境中止（出處是 research §1），改用 `migrate diff`；這項與其他自行決策都有記錄。測試全部通過；使用者驗證 20 個情境全部符合 | 沒有問題 | 本檔 8（B 組）列；本檔「使用者驗證」B 組段落；B 組 `research.md` 第 9 行 |
| `implement`（B 組）：Must Read 讀取 | SOP 步驟 6 讀完目前任務的所有 Must Read 部位；步驟 12 以 `check --read` 寫出讀取的部位 | T029 的子代理沒有讀 Must Read 的 `ui/overdue-notifications.html`（判斷 `ui/plan.md` 已涵蓋），`--read` 也沒有列它。`tasks_state.py check` 只檢查 `--read` 不為空，沒有和任務的 Must Read 清單比對，所以照常打勾。這次的畫面在使用者驗證符合（S5、F1），沒有看到實際後果 | Skill 缺陷（檢查閘門不足，影響輕微；見「Skill 問題」問題 B-2） | B 組 `.agents/skills/implement/SKILL.md` 第 25、31 行；B 組 `.agents/skills/implement/scripts/tasks_state.py` 第 406～413 行；B 組 `tasks.md` T029（第 290 行起）；本檔 8（B 組）列「SOP 偏離」 |
| `implement`（B 組）：執行環境 | 測試只寫入 B 組資料庫 `equipment_loan_ab_b`，不影響其他程序 | Phase 1、2 的後端測試寫入主目錄的 `equipment_loan`（`vitest` 不讀 `.env`）；007 遷移測試寫死資料庫名稱，不能和其他組同時執行；子代理用沒有限定目錄的 `pkill`。原因是 A/B 共用一個 Postgres 容器與既有測試的設定；`implement` SOP 不負責環境隔離 | 沒有問題（不是 Skill 的問題；步驟 12 記進「流程不足」） | 本檔 8（B 組）列「環境」(1)～(4)；B 組 `apps/equipment-loan/README.md` 第 262 行 |

## Skill 問題（交給 skill-engineering）

### 問題 B-1：analyze（B 組）

- 發生了什麼：`collect_coverage.py` 把 B1～B4 判成「沒有 Planner 產出」（`interfaces_without_planner_output` 4）。合約的 operation `tags` 用同一縮排的清單寫法（`tags:` 下一行是 `- B1 逾期通知紀錄查詢 API`），`block_tags` 遇到縮排小於等於 `tags:` 的行就停止，所以讀不到任何 tag。
- 原本預期：腳本能讀這種合法的 YAML 清單寫法，B1～B4 都有合約 operation，`interfaces_without_planner_output` 為 0。
- 證據：B 組 `.agents/skills/analyze/scripts/collect_coverage.py` 第 234～251 行（第 245 行的停止條件）；B 組 `specs/008-overdue-discord-notification/contracts/openapi.yaml` 第 28～29 行；B 組 `analysis.md` 第 66、109、115 行；本檔 7（B 組）列「涵蓋盤點的限制」；B 組 commit `7cf0db8`；Skill 版本 `b17d451`。
- 影響：`analysis.md`「統計」的「沒有 Planner 產出的介面數」寫成 4，和實際不符。這次主 session 以 `grep` 發現並加註；沒有發現時，會把已有合約的後端介面誤報成缺少產出，使用者可能去補不需要的合約。
- 處理結果：已由 `skill-engineering` 優化，commit `880fcb7`；紀錄 `specs/skill-engineering/48-analyze-tags同縮排清單讀不到/`（`rca-report.md`、`blueprint.md`）。根因 R1（缺失）：`block_tags` 把和 `tags:` 同縮排的 `- ` 項目當成清單結束。修改：只改 `scripts/collect_coverage.py` 的 `block_tags` 結束條件與檔頭說明，`SKILL.md`、RuleFile、樣板組不變。重跑結果（Sonnet medium 子代理，暫存複本）：B 組 008 的 27 個 operation 都讀到 1 個 tag，B1～B4 的合約 operation 數為 1、1、1、24，`interfaces_without_planner_output` 從 4 變 0；003～007 的輸出與修改前逐字相同；AsyncAPI 同縮排的 `- name:` 也讀得到。B 組 `analysis.md` 沒有重跑（B 組 worktree 不修改）。另：7（B 組）列寫「25 個 B4 operation」，腳本實際解析為 24 個（合約共 27 個 operation）。

### 問題 B-2：implement（B 組）

- 發生了什麼：T029 的子代理沒有讀 Must Read 的 `ui/overdue-notifications.html`（雛形狀態「已建立逾期通知」「沒有新的逾期借用」），`check --read` 也沒有列它。`tasks_state.py check` 只檢查 `--read` 不為空，沒有和任務的 Must Read 清單比對，所以照常打勾，完成報告也沒有列為偏離。
- 原本預期：SOP 步驟 6 讀完目前任務的所有 Must Read 部位；沒讀時，`check` 拒絕打勾，或要求寫出沒讀的部位與理由。
- 證據：B 組 `.agents/skills/implement/SKILL.md` 第 25 行（步驟 6）、第 31 行（步驟 12）；B 組 `.agents/skills/implement/scripts/tasks_state.py` 第 406～413 行；B 組 `specs/008-overdue-discord-notification/tasks.md` T029（第 290 行起）的 Must Read；本檔 8（B 組）列「SOP 偏離」；B 組 commit `8b7de36`（Phase 5）。
- 影響：這次輕微。使用者驗證 S5（立即檢查逾期的按鈕與橫幅）符合，沒有看到畫面錯誤。但同樣的情況會讓子代理跳過 `tasks` 綁定的參考，閘門也擋不下來，Reference Loading Contract 的保證因此變弱。
- 處理結果：已由 `skill-engineering` 優化，commit `ff0abeb`；紀錄 `specs/skill-engineering/49-implement-check未比對MustRead/`（`rca-report.md`、`blueprint.md`）。根因 R1（載體過弱）：「讀完所有 Must Read」只寫在 SOP 步驟 6，`check` 不比對。修改：`tasks_state.py check` 新增 `--must-read`（已讀序號）與 `--not-found "<序號>：<搜尋方式與結果>"`，兩者沒有涵蓋全部 Must Read 時不打勾、退出 1 並列出缺少的項目；SOP 步驟 12 傳入這兩個參數；`rules/任務實作-格式規範.md` Rule 3 加一條：只有以識別字搜尋不到才可以記為找不到，不得因判斷已涵蓋而略過。`status`、`next`、`block`、`report` 與 `tasks.md` 格式不變。重跑結果（Sonnet medium 子代理，暫存複本）：缺項時 `check` 擋下且 `tasks.md` 不變；007 `tasks.md` 的回歸輸出與修改前相同；依 SOP 實跑小專案時，不存在的 Must Read 記為找不到並寫出搜尋結果，內容重複的 Must Read 照樣讀取。B 組步驟 8 沒有重跑（B 組 worktree 不修改）。

## 使用者驗證

### B 組（`ab/group-b`，驗證的 commit 為 `0d60ce6`）

- commit SHA：B 組 `0d60ce6`（`ab/group-b`）
- 情境與結果：**通過**（2026-11-11，使用者回報）。使用者實際操作下方 S1～S6、F1～F7、R1～R7 共 20 個情境，全部符合預期結果；沒有不符合與未做的情境。
- 使用者回饋：沒有。

#### 啟動方式（B 組）

所有指令都在 `/Users/steve.tsao/projects-practice/s-aixbdd-spec-kit-ab/group-b/apps/equipment-loan`（以下稱 `$B`）執行。資料庫用 `equipment_loan_ab_b`。前端用 5183 埠（5173 被其他專案佔用）。

注意：B 組 `backend/.env` 只有 `DATABASE_URL` 與 `PORT`，沒有 `DISCORD_WEBHOOK_URL`。後端啟動指令要直接帶入模擬器位址，否則通知會標成「送出失敗」（通知設定有誤：沒有設定）。同名的環境變數優先於 `.env`，所以不必修改 `.env`。

1. 確認沒有殘留程序（3000、4010、5183 都不應有輸出；5173 是其他專案，不要停）：

   ```bash
   lsof -nP -iTCP -sTCP:LISTEN | grep -E ':(3000|4010|5183)\b'
   ```

2. 啟動 PostgreSQL 容器（已在執行時不會有變化）：

   ```bash
   docker start equipment-loan-postgres && docker exec equipment-loan-postgres pg_isready -U postgres
   ```

3. 套用遷移並重設展示資料（先載入 `.env`，否則 `prisma` 會連到 `equipment_loan`）：

   ```bash
   cd /Users/steve.tsao/projects-practice/s-aixbdd-spec-kit-ab/group-b/apps/equipment-loan
   set -a; . backend/.env; set +a
   npm run db:migrate
   npm run db:seed
   ```

4. 終端機 1：啟動 Discord Webhook 模擬器（127.0.0.1:4010）：

   ```bash
   cd /Users/steve.tsao/projects-practice/s-aixbdd-spec-kit-ab/group-b/apps/equipment-loan
   npm --prefix backend run discord:sim
   ```

5. 終端機 2：啟動後端（3000），關閉自動檢查：

   ```bash
   cd /Users/steve.tsao/projects-practice/s-aixbdd-spec-kit-ab/group-b/apps/equipment-loan
   set -a; . backend/.env; set +a
   DISCORD_WEBHOOK_URL="http://127.0.0.1:4010/api/webhooks/000000000000000000/simulator-token" \
   OVERDUE_AUTO_CHECK_ENABLED=false \
   npm --prefix backend run dev
   ```

6. 終端機 3：啟動前端（5183，會代理 `/api` 到 3000）：

   ```bash
   cd /Users/steve.tsao/projects-practice/s-aixbdd-spec-kit-ab/group-b/apps/equipment-loan
   npm --prefix frontend run dev -- --port 5183 --strictPort
   ```

7. 瀏覽器開 `http://localhost:5183`。一般視窗登入成員林雅婷（`lin.yating`／`Member@2026`）；無痕視窗登入管理員吳承翰（`wu.chenghan`／`Admin@2026`）。登入頁右側「預建展示帳號快速帶入」可以自動填入，驗證碼要手動輸入。

模擬器操作（另開終端機 4 執行）：

```bash
# 切換模式：success、rate_limit、server_error、timeout、disconnect、not_found；failTimes=N 表示前 N 次依此模式，之後自動改回 success
curl -X PUT http://127.0.0.1:4010/__sim/mode -H 'Content-Type: application/json' -d '{"mode":"success"}'
# 列出、清空模擬器收到的訊息
curl http://127.0.0.1:4010/__sim/messages
curl -X DELETE http://127.0.0.1:4010/__sim/messages
```

結束時：在終端機 1～3 按 Ctrl+C，再執行第 1 步確認沒有殘留程序。

#### demo seed 重設（B 組）

重設指令（在 `$B` 執行）：

```bash
set -a; . backend/.env; set +a
npm run db:seed
```

- 重設會清除並重建全部資料，包含登入 session。重設後兩個視窗都要重新登入。
- 2026-11-11 12:55（`Asia/Taipei`）實際執行一次：指令正常結束，沒有錯誤。`prisma migrate status` 為 6 支 migration、「Database schema is up to date!」。重設後 `equipment_loan_ab_b` 的內容：
  - 預約 26 筆。設備 `EQ-101`～`EQ-104` 可用、`EQ-105` 送修中、`EQ-106` 停用。
  - 逾期通知 3 則，都是陳冠廷 2026-11-10 上午 `09:00–12:00` 的借用：`RV-20261110-20`（`EQ-101`）送出成功、嘗試 1 次；`RV-20261110-21`（`EQ-102`）送出失敗、Discord 伺服器錯誤、嘗試 4 次；`RV-20261110-22`（`EQ-103`）結果不明、嘗試 1 次。
  - 還沒有通知的逾期借用 3 筆（都是陳冠廷 2026-11-10）：`RV-20261110-23`（`EQ-101` 下午）、`RV-20261107-05`（`EQ-103` 晚間）、`RV-20261109-19`（`EQ-102` 晚間）。
  - 時段還沒結束的借用中 1 筆：`RV-20261108-03`（林雅婷，`EQ-101` 2026-11-11 下午 `13:00–17:00`）。
- B 組 worktree 的 `git status` 執行前後都乾淨。

#### 驗證情境（B 組）

時間限制：請在 2026-11-11 17:00 前做完。17:00 後 `RV-20261108-03` 也會逾期，S5、S6 的筆數會多 1 則；18:00 後 R4、R5 的部分預約狀態也會改變。

**成功操作**（開始前：執行重設、後端依啟動方式第 5 步啟動、模擬器為 success、清空模擬器訊息、兩個視窗重新登入）

- **S1 查看通知清單**（US2 情境 1、2、9、10、16；FR-003）
  - 操作步驟：1. 在無痕視窗以吳承翰登入。2. 點「逾期通知紀錄」頁籤。
  - 預期結果：登入後先進「設備狀態管理」。頁面顯示「共 3 則通知」，每則顯示設備、借用成員陳冠廷、2026-11-10 上午 `09:00–12:00`、通知狀態、嘗試次數、最後嘗試時間，借用欄都是「借用中」。`EQ-101` 為「送出成功」，顯示送出時間，沒有「重送」按鈕。`EQ-102` 為「送出失敗」，顯示「失敗原因：Discord 伺服器錯誤」，嘗試 4 次，有「重送」按鈕。`EQ-103` 為「結果不明」，有「重送」按鈕。
- **S2 依狀態篩選**（US2 情境 3；FR-004）
  - 操作步驟：1. 在「通知狀態」選「送出失敗」。2. 再選「全部」。
  - 預期結果：第 1 步只顯示 `EQ-102` 那 1 則。第 2 步回到 3 則。
- **S3 重送「送出失敗」的通知**（US2 情境 4、5；FR-005；SC-004）
  - 操作步驟：1. 對 `EQ-102`（`RV-20261110-21`）點「重送」。2. 等 2 秒，點「重新整理」。3. 在終端機 4 執行 `curl http://127.0.0.1:4010/__sim/messages`。
  - 預期結果：第 1 步畫面不等待，頁頂顯示「已重新送出 RV-20261110-21 的通知，目前為「送出中」。請稍後按「重新整理」查看送出結果。」，這一列顯示「送出中」、沒有「重送」按鈕。第 2 步同一則變成「送出成功」，嘗試次數從 4 變 5，清單仍是 3 則。第 3 步模擬器有 1 則 `【逾期未還】EQ-102 …` 的訊息。
- **S4 重送「結果不明」的通知**（US2 情境 6、7、8；FR-006）
  - 操作步驟：1. 對 `EQ-103`（`RV-20261110-22`）點「重送」。2. 在確認視窗點「取消」。3. 再點「重送」，在確認視窗點「已確認沒收到，重送」。4. 等 2 秒，點「重新整理」。
  - 預期結果：第 1 步出現確認視窗，標題「重送「結果不明」的通知？」，提醒先到 Discord 確認沒收到、重送可能造成兩則相同的通知。第 2 步視窗關閉，通知仍是「結果不明」。第 3 步這一列立即顯示「送出中」。第 4 步變成「送出成功」，嘗試次數從 1 變 2。
- **S5 立即檢查逾期**（US3 情境 1、2、6；US1 情境 2；FR-009、FR-010、FR-013）
  - 操作步驟：1. 點「立即檢查逾期」。2. 等 2 秒，點「重新整理」。3. 執行 `curl http://127.0.0.1:4010/__sim/messages`。4. 再點一次「立即檢查逾期」。
  - 預期結果：第 1 步 2 秒內顯示「這次建立 3 則逾期通知」。第 2 步清單共 6 則，新增 `RV-20261110-23`（`EQ-101` 下午）、`RV-20261107-05`（`EQ-103` 晚間）、`RV-20261109-19`（`EQ-102` 晚間），都是「送出成功」；林雅婷的 `RV-20261108-03`（今天下午，時段還沒結束）沒有通知。第 3 步每則新訊息有 4 行：`【逾期未還】設備編號 設備名稱`、`借用成員：陳冠廷`、`預約時段：2026-11-10（星期）時段 起–迄`、逾期多久；訊息裡沒有 Webhook 位址。第 4 步顯示「沒有新的逾期借用」，清單仍是 6 則。
- **S6 自動檢查**（US1 情境 1、4；FR-001、FR-012）
  - 操作步驟：1. 在終端機 2 按 Ctrl+C 停後端。2. 執行重設。3. 清空模擬器訊息。4. 在終端機 2 改用 `OVERDUE_AUTO_CHECK_ENABLED=true OVERDUE_CHECK_INTERVAL_SECONDS=10` 啟動後端（其他部分和啟動方式第 5 步相同）。5. 無痕視窗重新登入吳承翰，開「逾期通知紀錄」，按「重新整理」。6. 等 30 秒以上，再按「重新整理」並查看模擬器訊息。7. 停後端，改回啟動方式第 5 步（`OVERDUE_AUTO_CHECK_ENABLED=false`）重新啟動。
  - 預期結果：第 5 步沒有按「立即檢查逾期」，清單已有 6 則，新增的 3 則（同 S5）都是「送出成功」。第 6 步清單仍是 6 則，模擬器只有這 3 則訊息，沒有第二則。

**關鍵失敗**（開始前：執行重設、後端為 `OVERDUE_AUTO_CHECK_ENABLED=false`、模擬器切回 success、兩個視窗重新登入）

- **F1 一般成員權限不足**（US2 情境 15、US3 情境 5；FR-019）
  - 操作步驟：1. 在一般視窗以林雅婷登入，點「逾期通知紀錄」頁籤。2. 在一般視窗開 DevTools Console，貼上下列程式碼。3. 在無痕視窗的「逾期通知紀錄」按「重新整理」。

    ```js
    const h = { Authorization: "Bearer " + sessionStorage.getItem("el_session_token") };
    for (const [m, u] of [["GET", "/api/admin/overdue-notifications"], ["POST", "/api/admin/overdue-checks"]]) {
      const r = await fetch(u, { method: m, headers: h });
      console.log(m, u, r.status, await r.text());
    }
    ```

  - 預期結果：第 1 步顯示「權限不足」卡片，說明只限管理員操作、目前身分是一般成員（林雅婷），沒有通知清單。第 2 步兩個請求都回傳 `403`，內容是繁體中文的權限不足錯誤。第 3 步清單仍是 3 則，沒有新增。
- **F2 Webhook 失效時不自動重試**（US1 情境 7；FR-015；NFR-003）
  - 操作步驟：1. 執行 `curl -X PUT http://127.0.0.1:4010/__sim/mode -H 'Content-Type: application/json' -d '{"mode":"not_found"}'`。2. 管理員點「立即檢查逾期」。3. 等 2 秒，按「重新整理」。4. 再等 15 秒，按「重新整理」。
  - 預期結果：第 2 步顯示「這次建立 3 則逾期通知」。第 3 步新增的 3 則都是「送出失敗」，失敗原因「通知設定有誤：Webhook 已失效」，嘗試 1 次。第 4 步嘗試次數仍是 1。畫面上沒有 Webhook 位址。
- **F3 Discord 持續伺服器錯誤**（US1 情境 6；FR-014）
  - 操作步驟：1. 模擬器切成 `{"mode":"server_error"}`。2. 對 `RV-20261110-23`（`EQ-101` 下午）點「重送」。3. 等 20 秒（自動重試間隔 2、4、8 秒），按「重新整理」。
  - 預期結果：第 2 步這一列顯示「送出中」。第 3 步變成「送出失敗」，失敗原因「Discord 伺服器錯誤」，嘗試次數從 1 變 5（重送 1 次加自動重試 3 次）。
- **F4 等不到 Discord 回應**（US1 情境 8；FR-016）
  - 操作步驟：1. 模擬器切成 `{"mode":"timeout"}`。2. 對 `RV-20261107-05`（`EQ-103` 晚間）點「重送」。3. 等 12 秒，按「重新整理」。4. 再等 15 秒，按「重新整理」。
  - 預期結果：第 3 步變成「結果不明」，沒有失敗原因，嘗試次數從 1 變 2。第 4 步仍是「結果不明」，嘗試次數不變（不自動重送）。
- **F5 請求太頻繁，等待後自動重試成功**（US1 情境 5；FR-014）
  - 操作步驟：1. 清空模擬器訊息。2. 模擬器切成 `{"mode":"rate_limit","retryAfterSeconds":2,"failTimes":1}`。3. 對 `RV-20261109-19`（`EQ-102` 晚間）點「重送」。4. 等 5 秒，按「重新整理」，再查看模擬器訊息。
  - 預期結果：第 4 步變成「送出成功」，嘗試次數從 1 變 3，模擬器只有 1 則 `EQ-102` 的訊息。
- **F6 送出前連線失敗，恢復後自動重試成功**（US1 情境 11；FR-014）
  - 操作步驟：1. 在終端機 1 按 Ctrl+C 停模擬器。2. 對 `RV-20261110-23`（F3 後為「送出失敗」）點「重送」。3. 5 秒內在終端機 1 重新啟動模擬器（啟動方式第 4 步）。4. 等 15 秒，按「重新整理」。
  - 預期結果：第 4 步變成「送出成功」，模擬器有 1 則 `EQ-101` 的訊息。重新啟動太慢時會變成「送出失敗」、失敗原因「無法連線」，這也符合 FR-014，請記下實際結果。
- **F7 借用已歸還，不能重送**（US2 情境 12、13；FR-008）
  - 操作步驟：1. 管理員停在「逾期通知紀錄」，不要重新整理。2. 在無痕視窗另開一個分頁，以黃詩涵（`huang.shihan`／`Admin@2026`）登入，到「審核與借用管理」對 `RV-20261110-21`（`EQ-102` 上午）點「登記歸還」。3. 回到第一個分頁，對 `RV-20261110-21` 點「重送」。4. 按「重新整理」。
  - 預期結果：第 3 步顯示「借用已歸還，不需要重送」，通知仍是「送出失敗」。第 4 步這一則的借用欄顯示「已歸還」，沒有「重送」按鈕。

**前幾次功能的回歸**（開始前：執行重設、兩個視窗重新登入）

- **R1 登入與驗證碼**（003）
  - 操作步驟：1. 在一般視窗登出後，以林雅婷登入，驗證碼故意打錯 1 個字。2. 用新的驗證碼正確登入。
  - 預期結果：第 1 步拒絕登入並顯示錯誤提示。第 2 步登入成功，進入成員畫面。
- **R2 成員預約免審核設備**（003）
  - 操作步驟：1. 林雅婷到「設備預約」，選明天。2. 對 `EQ-104` 點一個「可預約」的時段並送出。
  - 預期結果：預約立即成為「已核准／有效」，在「我的預約」看得到。
- **R3 管理員審核預約**（004）
  - 操作步驟：1. 吳承翰到「審核與借用管理」的待審清單「預約申請」分頁。2. 核准林雅婷的 `RV-20261109-10`（`EQ-102` 後天下午）。
  - 預期結果：這筆變成「已核准／有效」，林雅婷的「我的預約」同步顯示。
- **R4 登記歸還**（005）
  - 操作步驟：1. 吳承翰在「審核與借用管理」對 `RV-20261108-03`（林雅婷，`EQ-101` 今天下午）點「登記歸還」。2. 林雅婷重新整理「我的預約」。
  - 預期結果：預約變成「已歸還」。林雅婷頁頂「目前借用中設備」不再顯示 `EQ-101`。
- **R5 即時改期**（006）
  - 操作步驟：林雅婷在「我的預約」對 `RV-20261108-05`（`EQ-104` 後天上午）點「申請改期」，選後天下午並送出。
  - 預期結果：顯示改期成功，預約編號不變，時段變成後天下午。
- **R6 借用中設備不能設為送修**（007）
  - 操作步驟：吳承翰在「設備狀態管理」對 `EQ-102` 點「設為送修」。
  - 預期結果：確認視窗顯示「設備借用中，請先登記歸還」與陳冠廷的逾期借用 `RV-20261109-19`，確認按鈕停用。按取消，`EQ-102` 仍為「可用」。
- **R7 管理員入口與頁籤**（008 待確認 3，暫行做法）
  - 操作步驟：吳承翰登出後重新登入。
  - 預期結果：登入後先進「設備狀態管理」，頁籤列有「設備狀態管理」、「逾期通知紀錄」、「審核與借用管理」。

自動化回歸：步驟 8 已在 12:42～12:43 跑過（後端 72/72，另 007 遷移測試以暫存複本 4/4；前端 4/4；e2e 5/5），本次不重跑。

#### 待你判斷的暫行做法（B 組）

- 待確認 1：失敗原因文字採資料模型與合約的寫法（例如「通知設定有誤：Webhook 已失效」）。
- 待確認 3：管理員登入後仍進「設備狀態管理」；「逾期通知紀錄」頁籤對成員也顯示，點開看到權限不足卡片（F1、R7）。
- 待確認 4：清單固定取第 1 頁 100 筆，沒有分頁控制項。

### 合併後修正（`main`）

- T041（目前頁碼超過總頁數時改載最後一頁）：**通過**（2026-11-12，使用者回報）。驗證的 commit 為 `b1cbc6b`。情境：準備 40 則測試用「送出失敗」通知（驗證後已刪除），篩選「送出失敗」到第 3／3 頁，重送唯一一則後畫面改載第 2／2 頁、第 21–40 則，按頁面上的「重新整理」停在第 2 頁。驗證前另有 agent 自動檢查，非使用者驗證。
- T041 驗證時的使用者回饋：按「重新整理」畫面抖動，使用者認定為嚴重錯誤 → 新增 T042。另外，瀏覽器本身的重新整理會回到「設備狀態管理」，這是前幾版就有的行為，和 T041 無關。
- T042（重新整理與換頁不跳動、不閃爍）：**未驗證**。第 1、2 次修正使用者回報仍閃爍、沒有反應；第 3 次（`a00eb91`）只有 agent 自動檢查。使用者決定先完成流程，留到換 UI 套件時處理（`docs/待確認.md` 第 32 項）。
- 使用者回饋（2026-11-12）：修正過程思考太粗糙、浪費時間，開發成本太大。

## 流程不足

| 步驟 | 問題 | 影響 | 試過的優化 |
|---|---|---|---|
| 8（B 組） | A/B 兩組和主目錄共用同一個 Postgres 容器。B 組另建資料庫 `equipment_loan_ab_b`，只寫在 `backend/.env`（忽略）；但 `vitest`、`prisma`、`tsx` 直接執行時不讀 `.env`，會退回預設的 `equipment_loan`。runbook 第 8 節只規定各組用自己的 worktree，沒有規定資料庫隔離與載入 `.env` 的方式 | Phase 1、2 的後端測試寫入主目錄的 `equipment_loan`，資料被重設成 seed 狀態（唯讀查詢：仍是 5 支 migration、預約 22 筆＝seed 筆數）；Phase 2 的一次 `migrate diff` 也連到它。兩組同時跑步驟 8 時，可能互相覆寫資料 | Phase 3 起，主 session 要求每個命令先載入 `.env`；步驟 9 的啟動方式與 seed 重設也寫明先載入 `.env`。runbook 尚未修改 |
| 8（B 組） | 既有 007 遷移測試寫死資料庫名稱 `equipment_loan_migration_test`，不依 `DATABASE_URL` 決定 | 兩組同時跑完整後端測試時，會建立、刪除同一個資料庫，互相影響 | Phase 6 完整測試排除它，另用改名的暫存複本跑一次（4/4）；本次新增的 T036 遷移測試改由 `DATABASE_URL` 推出資料庫名稱。007 測試本身沒有修改 |
| 8（B 組） | Phase 4 子代理用沒有限定目錄的 `pkill -f "src/server.ts"` 停止後端 | 可能停掉另一組或其他專案的同名程序 | 主 session 確認 5173 屬於其他專案、沒有受影響，並停掉 1 個殘留的 B 組 `tsx watch`。委派提示詞尚未加上「只停自己啟動的程序」的限制 |
| 8（B 組） | 既有 `api.test.ts` 的 SC-001 & FR-001 & FR-002 和執行時間有關 | 11:50 左右失敗、12:00 之後通過，會被誤判成本次修改造成的錯誤 | 沒有修改，只在本檔 8（B 組）列記錄 |
| 9（B 組） | 步驟 8 完成報告的「本機啟動」沒有寫 `DISCORD_WEBHOOK_URL`；B 組 `backend/.env` 也沒有它。前端預設的 5173 埠被其他專案佔用 | 照完成報告啟動時，通知會標成「送出失敗」（通知設定有誤：沒有設定），前端也無法用預設埠啟動 | 驗證說明的啟動指令直接帶入模擬器位址（同名環境變數優先於 `.env`，不必修改 `.env`），前端改用 `--port 5183 --strictPort` |
| 合併回 `main`（第 8 節第 7 點） | Prisma Client 產生在各 worktree 被 git 忽略的 `backend/node_modules/.prisma/client`。cherry-pick 帶進新的 `schema.prisma` 與 migration 後，主目錄的 client 仍是 007 的版本；`prisma migrate deploy` 只改資料庫，不重新產生 client。runbook 第 8 節第 7 點沒有寫合併後要重新產生 | `db:seed` 在第一個動作 `overdue_notifications.deleteMany()` 失敗（沒有刪除或寫入資料）；`npm run check` 出現多個 `TS2339`（`PrismaClient` 沒有 `overdue_notifications`） | 使用者同意後，在 `backend/` 執行 `npx prisma generate`（只寫被忽略的 `node_modules`），再從 `db:seed` 接續，全部通過。runbook 尚未修改 |
| 合併後（自動模式） | 自動接續的下一步提示詞由上一個 agent 撰寫，沒有限制寫法；agent 用使用者口吻寫了「我已在瀏覽器手動驗證 T041 通過」 | 下一步把它當成使用者的話，commit 了未經驗證的 T041（`4255a2c`） | `1b84b9c`：提示詞不得代使用者宣稱驗證或同意；下一步是使用者驗證、commit、push、打 tag 時停止接續 |
| 合併後（T042） | 修畫面問題時，只依程式判斷使用者描述的現象，沒有先列出完整的預期行為；agent 自動檢查只量剛改的那一點 | T042 修了 3 次，第 2 次把回饋整個藏起來，使用者花約 60 分鐘反覆驗證 | 主 session 記下做法：先列出預期行為（有反應、不位移、不閃爍、看得出完成），一次改完並全部檢查後才交給使用者。runbook 尚未修改 |

## 影片素材清單

| 要證明什麼 | 證據路徑 | commit SHA | 重現步驟 | 只能當下保存？ |
|---|---|---|---|---|
| 新 Skill `notification-plan` 為沒有 Planner 的通知介面寫出可靠性規劃（S1～S3、N1、N2 各一個 §5.n；`clarify` 2 題；上游衝突 UC1、UC2 交回原 Planner） | B 組 `specs/008-overdue-discord-notification/notification/plan.md`；本檔 5n（B 組）列 | `f614f1a`（`ab/group-b`） | 在 B 組 worktree 開啟該檔，對照 §5.1～§5.5 與上游衝突段落 | 檔案：否。`clarify` 提問的對話畫面：是（已經過去，現在只剩本檔的紀錄） |
| `tasks` 把通知介面的任務綁到 `notification/plan.md` §5.n | B 組 `specs/008-overdue-discord-notification/tasks.md`（39 個任務） | `513708a`（`ab/group-b`） | 在 B 組 `tasks.md` 以 `grep -n "notification/plan.md"` 找出綁定的 Must Read | 否 |
| `analyze` 在實作前找出跨文件問題（CRITICAL 0、HIGH 1、MEDIUM 4、LOW 1） | B 組 `specs/008-overdue-discord-notification/analysis.md` | `7cf0db8`（`ab/group-b`） | 開啟 `analysis.md`，對照「問題」與「統計」 | 否 |
| `implement` 完成 39/39、受阻 0，全程不提問 | B 組 `apps/equipment-loan/`；本檔 8（B 組）列 | `7dda70c`～`0d60ce6`（`ab/group-b`） | 在 B 組 worktree 執行 `git log --oneline 7dda70c^..0d60ce6` | 否 |
| 管理員在畫面上看到逾期通知的送出結果，並在模擬器失敗後重送成功（F2～F6 的失敗分類與重試） | 本檔「使用者驗證」B 組段落（啟動方式、seed 重設、情境 S1～S6、F1～F7、R1～R7） | `0d60ce6`（`ab/group-b`） | 依 B 組「啟動方式」啟動，先做「demo seed 重設」，再切換模擬器模式，照 F2～F6 操作 | 否：依本檔步驟可以重現，但操作畫面要在重現時錄影 |
| 以 `skill-engineering` 修正 `analyze` 的 `collect_coverage.py`（`interfaces_without_planner_output` 4 → 0） | `specs/skill-engineering/48-analyze-tags同縮排清單讀不到/`（`rca-report.md`、`blueprint.md`）；本檔問題 B-1 | `880fcb7` | 分別以修改前（`880fcb7^`）與修改後的 `collect_coverage.py`，對 B 組 008 的唯讀複本執行，比較輸出 | 否 |
| 以 `skill-engineering` 為 `implement` 的 `check` 加上 Must Read 閘門（沒讀完且沒記為找不到時不打勾） | `specs/skill-engineering/49-implement-check未比對MustRead/`（`rca-report.md`、`blueprint.md` §8）；本檔問題 B-2 | `ff0abeb` | 建立一份含 2 項 Must Read 的 `tasks.md`，執行 `next` 後以 `check … --must-read 1` 執行，確認退出 1 並列出缺少的第 2 項 | 驗收用的 `/tmp/49-accept/` 是暫存目錄，可能被系統清除；結果已寫進 `blueprint.md` §8，可以依重現步驟重建 |
| 合併後 `analyze` 找出換頁缺口，經 `ui-plan`、`tasks`、`implement` 補上 T040、T041，使用者實際驗證 T041 通過 | `specs/008-overdue-discord-notification/analysis.md`、`ui/plan.md` §3.3 A14 與 §4、`tasks.md` T040、T041；本檔「使用者驗證」合併後修正小節 | `faddff8`、`4255a2c`、`b1cbc6b` | 準備 40 則「送出失敗」通知，篩選「送出失敗」到最後一頁，重送唯一一則，看畫面改載第 2／2 頁 | 否：可依本檔步驟重現，畫面要在重現時錄影 |
| 自動模式連續接續多步，以及它代使用者宣稱驗證的失誤與修正 | `.auto/next.log`（不進 git）；`scripts/hooks/auto_next.py`、`scripts/hooks/auto-clarify.sh`；`docs/dev/自動模式.md` §6 第 7、8 點 | `f95ff12`、`1b84b9c` | 依 `docs/dev/自動模式.md` §4 開啟自動模式，貼一個會連續多步的提示詞 | 是：`.auto/next.log` 不進 git，要保存請先複製 |
