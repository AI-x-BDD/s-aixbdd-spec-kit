# 第三題第 5 次迭代收尾後跨機交接

- 建立日期：2026-11-10
- 交出電腦：steve-10（MacBook Pro，macOS 27.0.1）
- 交出時的執行者：Claude Code＋Opus 5.5（effort high）
- 交出時最新 commit：本文件的 commit（前一個是 `b1dcf2a` 第 5 次迭代收尾）
- 最後完成的 spec 目錄：`specs/007-equipment-maintenance-retire`

## 1. 目前進度

1. 第 5 次迭代（設備送修或停用、恢復可用）的 runbook 步驟 0～12 全部做完。詳細紀錄在 [`docs/iterations/iter-5.md`](../iterations/iter-5.md)，這裡不重寫。
2. 步驟 11 優化了 5 支 Skill，根因與驗收在 `specs/skill-engineering/42-…`～`46-…`：

   | 問題 | Skill | 優化 commit |
   |---|---|---|
   | 1 | `clarify-over-specs` | `92f7c1e` |
   | 2 | `technical-research` | `be06f9c` |
   | 3 | `ui-plan` | `ca01fc0` |
   | 4 | `api-plan` | `1a2cf98` |
   | 5 | `tasks` | `b09eaa7` |

3. 5 個問題的 P11b 都以 `skill-engineering` 驗收 S1 作為重跑結果，不在正式目錄重跑（使用者決定，理由寫在 iter-5.md 各問題的處理結果）。
4. 步驟 12 的「提議打 tag」沒有做。原因：步驟 9 的驗證由 AI 代做，使用者沒有親手操作。
5. 下一步是第 6 次迭代（通知迭代）的步驟 0（P0）。

## 2. 換電腦前，在舊電腦要做的事

1. 確認 `git status` 乾淨。
2. 由使用者執行 `git push`。交出時 `main` 比 `origin/main` 多 18 個 commit（含本文件）。
3. 要把驗證截圖帶去新電腦時，另外複製 `docs/tmp/iter-5-uv/`（被 git 忽略）。內容是步驟 9 的截圖 `shots/`（27 張）、`uv.mjs`、`run1.log`、`run2.log`、`results.json`。iter-5.md 影片素材清單第 7 列引用它。不複製也可以：依 iter-5.md「使用者驗證」的啟動方式與 `npm run db:seed` 重拍。
4. 要沿用 Claude Code 的偏好時，複製 `~/.claude/CLAUDE.md` 與記憶目錄（runbook 0.3 表格最後兩列）。

## 3. 新電腦第一次接手的檢查

照 [`docs/dev/迭代-runbook.md`](../dev/迭代-runbook.md) 0.3「新電腦第一次接手的檢查」做。runbook 第 6 節第 6 點：第 5 次迭代起全部由 Claude Code 執行，0.3 中 OpenCode、Argon 的項目不適用。和本次相關的重點：

1. `git pull`，確認 `git log -1` 是本文件的 commit。
2. `scripts/sync-skills.sh --check`，確認「兩邊一致」。
3. 工具版本對照 iter-5.md「固定環境」：Claude Code 2.1.321、`uv` 0.12.1、Node.js 24.14.1（`techstack.md` 要求 24 LTS 以上）、Docker 29.9.2、Docker Compose v5.6.1。
4. 確認 `git config --global core.hooksPath` 有值（外洩掃描）。通知迭代會用到 Discord Webhook URL，這一項一定要有。
5. `apps/equipment-loan/backend/.env` 依 `.env.example` 重建。不要從聊天或 git 傳。
6. 資料庫在新電腦是空的。依 iter-5.md「使用者驗證」的「啟動方式」重建，跑 `npm run db:migrate` 與 `npm run db:seed`。
7. 換電腦算環境變動。第 6 次迭代步驟 0 在 `iter-6.md`「固定環境」記下電腦、工具版本、模型與 effort。

## 4. 還沒完成的項目

1. 使用者親手驗證：第 5 次迭代（iter-5.md「使用者驗證」的 15 個情境，可抽查）與第 4 次迭代的 S2、S3、F5 都還沒做。結果寫進各自的「使用者回饋」。通過後才提議打 `ch3-…` tag，使用者同意才打，不 push tag。
2. SC-002 的計算時間點要使用者決定（iter-5.md 問題 1）。
3. 正式目錄 `specs/007-…` 的 spec、research、ui/plan、contracts、tasks 保留優化前的內容，和程式不一致（iter-5.md 流程不足「11」）。這是決定好的，不要自行改。
4. 既有測試依賴台北 12:00–21:00 的實際時間，沒有修（iter-5.md 流程不足「8」）。時段外跑回歸要用假時鐘；假時鐘工具在舊電腦的 `/tmp`，不會跟過去。
5. 委派 `analyze` 時，子代理不能寫 `analysis.md`（已發生 2 次）。第 6 次迭代步驟 7 之前，先決定改由主 session 直接執行，或事先確認子代理的寫檔權限（iter-5.md 流程不足「6、7」）。

## 5. 第 6 次迭代（通知迭代）的注意事項

1. 依 runbook 第 8 節的 A/B 流程：步驟 2～5 commit 後，從同一個 commit 建 A、B 兩組 git worktree。**A/B 要在同一台電腦做完**；必須換電腦時，兩組各自 commit 到自己的 branch 再 push（runbook 0.3「什麼時候可以換」第 3 點）。
2. A、B 兩組用同一個模型與 effort，開跑時記進 `iter-6.md`。
3. Discord Webhook URL 放在 `.env`，不 commit，log 不印完整 URL（runbook 9.4「通知迭代」）。
4. 第 5 次迭代起由 Claude Code 執行，和第 1～3 次（Argon）的 Skill 表現不能直接比較（runbook 第 6 節第 5 點）。
5. 本次觀察：步驟 11 修改的 5 支 Skill 在完整流程中是否生效（iter-5.md 流程不足「11」）。

## 6. Suggested skills

1. commit 訊息：讀 `.agents/skills/conventional-commits/SKILL.md`（用路徑讀取）。
2. 第 6 次迭代依 runbook 9.5 的提示詞順序，用路徑讀取 `.agents/skills/<name>/SKILL.md`：`s-specify`、`clarify-over-specs`、`technical-research`、`system-analysis`、`tasks`、`analyze`、`implement`。不用同名的全域 Skill。
3. 第四題建新 Skill、或優化 Skill 時：在 Claude Code 用 Skill 工具呼叫 `skill-engineering`。

## 7. 新電腦可直接貼上的提示詞

### 7.1 第一則：接續檢查

```text
我們換了一台電腦，要接續第三題。請先讀 docs/handoff/iter-5-跨機交接.md，再讀 docs/dev/迭代-runbook.md 與 docs/iterations/iter-5.md。
規則：用路徑指定 Skill；不改 Skill；不 push、不打 tag；繁體中文回覆。
請做這幾件事，然後停下來等我：
1. 確認 git status 乾淨、git log -1 是交接文件的 commit。
2. 執行 scripts/sync-skills.sh --check，回報兩邊是否一致。
3. 依交接文件第 3 節，檢查工具版本、core.hooksPath、apps/equipment-loan/backend/.env 是否存在（不要印出內容）、資料庫能否 migrate 與 seed，列出缺少的項目。
4. 告訴我最後完成的步驟（第 5 次迭代步驟 12）與下一步（第 6 次迭代步驟 0）。
```

### 7.2 第二則：第 6 次迭代 P0

建議開新的 Claude Code session 再貼。

```text
我們要執行第三題第 6 次迭代。請先讀 docs/dev/迭代-runbook.md 全文，再做第 4 節的步驟 0（準備）。
規則：
- 每一步只做我貼給你的那一步，做完就停下來等我貼下一步。
- 每一步都用路徑指定 Skill：讀取 .agents/skills/<name>/SKILL.md 並依其 SOP 執行，不用同名的全域 Skill。
- 不修改任何 Skill（.claude/skills/、.agents/skills/）。發現 Skill 問題時，依 runbook 第 7 節格式記進 docs/iterations/iter-6.md。
- 我同意你在 runbook 第 4 節標出的檢查點自行 commit，commit 訊息依 .agents/skills/conventional-commits/SKILL.md。不 push、不打 tag。
- 每一步結束時，用 3 行以內回報：產出、問題、下一步。
- 用繁體中文回覆。
本次資料：
- 本次功能：見 runbook 9.3「通知迭代」列（6 次路徑第 6 次）
- 上一次 spec 目錄：specs/007-equipment-maintenance-retire
做步驟 0 時，依 runbook 9.0「固定環境」，把執行工具版本、模型與 effort、Skill 版本（git rev-parse --short HEAD）寫進 docs/iterations/iter-6.md 的開頭。
```

## 8. 本次對話的經過（舊電腦最後一個 session）

1. 使用者貼上交接提示，接續第 5 次迭代步驟 11 問題 5（`tasks`）。agent 建立 fix commit `b09eaa7` 與 docs commit `8a4e2f9`。
2. 使用者貼 P12。agent 更新 iter-5.md 的「流程不足」（改 2 列、加 2 列）、「影片素材清單」（8 列）、步驟紀錄第 10～12 列、開頭的 spec 目錄與結束日期，commit `b1dcf2a`。
3. 使用者要求建立本交接文件，準備換電腦。對話停在這裡。**新電腦的第一則貼 7.1，第二則貼 7.2。**
