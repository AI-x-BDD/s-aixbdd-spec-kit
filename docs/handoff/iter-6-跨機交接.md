# 第三題第 6 次迭代（通知迭代）A/B 第 4 點完成後跨機交接

- 建立日期：2026-11-11
- 交出電腦：steve的Mac mini（`Mac14,12`，macOS 27.0.1）
- 交出時的執行者：Claude Code 2.1.322＋Opus 5.5（effort high）
- 交出時最新 commit：
  - `main`：本文件的 commit（前一個是 `5e407d7`）
  - `ab/group-a`：`b0cac59`（A 組步驟 7 `analyze`）
  - `ab/group-b`：`ae040c0`（A/B 共用起點，還沒有跑任何步驟）
- spec 目錄：`specs/008-overdue-discord-notification`

## 1. 目前進度

1. 第 6 次迭代步驟 0～5 已完成，產出在 `main`。A/B 共用起點是 `ae040c0`。詳細紀錄在 [`docs/iterations/iter-6.md`](../iterations/iter-6.md)，這裡不重寫。
2. A/B 流程（runbook 第 8 節）：
   | 點 | 內容 | 狀態 |
   |---|---|---|
   | 1～2 | 步驟 2～5、建立 A、B worktree | 完成 |
   | 3 | A 組跑步驟 6～7 | 完成，`ab/group-a` 的 `8c4441c`（`tasks`）、`b0cac59`（`analyze`） |
   | 4 | 第四題：用 `skill-engineering` 建新 Skill，修改 `tasks`、`analyze` 接入 | 完成，AI 驗收通過，**使用者尚未驗證** |
   | 5 | B 組跑新 Skill，再跑步驟 6～8 | 未開始 |
   | 6～7 | 歸檔 A、B 產出，B 組實作合併回主線 | 未開始 |
3. 第四題的 Skill 版本 commit（都在 `main`）：
   | commit | 內容 |
   |---|---|
   | `fd8e032` | feat(notification-plan)：新 Skill `notification-plan` |
   | `be648df` | feat(tasks,analyze)：`tasks`、`analyze` 接入 `notification/plan.md` |
   | `400c30b` | docs(skill-engineering)：紀錄目錄 47、`docs/待確認.md` 第 30 項 |
   | `5e407d7` | docs(notification-plan)：description 開頭標「（未驗證）」 |
4. 第四題紀錄：[`specs/skill-engineering/47-notification-plan-建立/blueprint.md`](../../specs/skill-engineering/47-notification-plan-建立/blueprint.md)。驗收結果在第 8 節，S1～S6 全部通過。

## 2. 換電腦前，在舊電腦已做的事

1. 3 個 branch 都已 push：`main`、`ab/group-a`、`ab/group-b`。
2. runbook 0.3「什麼時候可以換」第 3 點規定 A/B 要在同一台電腦做完。這次 A 組做完步驟 7、B 組還沒開始就換電腦，所以兩組都 push 到自己的 branch，在新電腦重建 worktree。這是例外做法，已記在 iter-6.md「固定環境」的中途變動。
3. 舊電腦的暫存驗收環境（scratchpad 的 `acc47/`）不帶走。驗收結果已寫進藍圖第 8 節。

## 3. 新電腦第一次接手的檢查

照 [`docs/dev/迭代-runbook.md`](../dev/迭代-runbook.md) 0.3「新電腦第一次接手的檢查」做。runbook 第 6 節第 6 點：第 5 次迭代起全部由 Claude Code 執行，0.3 中 OpenCode、Argon 的項目不適用。和本次相關的重點：

1. `git pull`，確認 `git log -1` 是本文件的 commit。
2. `scripts/sync-skills.sh --check`，確認「兩邊一致」。
3. 工具版本對照 iter-6.md「固定環境」：Claude Code 2.1.322、`uv` 0.12.1、Node.js 26.8.2（`techstack.md` 要求 24 以上）、Docker 29.9.2、Docker Compose v5.6.1。版本不同時記進 iter-6.md「固定環境」的中途變動。
4. 確認 `git config --global core.hooksPath` 有值（外洩掃描）。通知迭代會用到 Discord Webhook URL，這一項一定要有。
5. `apps/equipment-loan/backend/.env` 依 `.env.example` 重建。Webhook URL 從 Discord 頻道設定重新複製，不要從聊天或 git 傳。
6. 資料庫在新電腦是空的。到步驟 8 之前再依 iter-5.md「使用者驗證」的「啟動方式」跑 `npm run db:migrate` 與 `npm run db:seed`。
7. 模型與 effort 必須和 A 組相同：主 session Opus 5.5、effort high。子代理要明確指定 Opus。新電腦若也設了 `CLAUDE_CODE_SUBAGENT_MODEL=sonnet`，不指定時子代理會變成 Sonnet。

## 4. 在新電腦重建 A、B worktree

worktree 只存在本機，要從 branch 重建。路徑和舊電腦相同，放在主目錄旁邊的 `s-aixbdd-spec-kit-ab/`。在主目錄執行：

```bash
git fetch origin
git worktree add --track -b ab/group-a ../s-aixbdd-spec-kit-ab/group-a origin/ab/group-a
git worktree add --track -b ab/group-b ../s-aixbdd-spec-kit-ab/group-b origin/ab/group-b
git -C ../s-aixbdd-spec-kit-ab/group-a log -1 --format='%h %s'   # 應為 b0cac59
git -C ../s-aixbdd-spec-kit-ab/group-b log -1 --format='%h %s'   # 應為 ae040c0
```

新電腦已有同名的本機 branch 時，改用 `git worktree add ../s-aixbdd-spec-kit-ab/group-a ab/group-a`，並確認它和 `origin/ab/group-a` 相同。

## 5. 接下來的順序

1. **使用者驗證 `notification-plan`。**
   - 用 `user-verify-skill` 驗證（需要 Herdr）。通過時它會移除 description 的「（未驗證）」，並寫入藍圖。
   - 主目錄的 `specs/008-overdue-discord-notification` 沒有 `notification/`、`tasks.md`、`analysis.md`，可以直接當驗證輸入（在暫存複本跑，不寫主目錄）。
   - 不通過時，交給 `skill-engineering` 優化後重新驗證，B 組等驗證通過再開始。
2. **把 Skill commit 帶進 `ab/group-b`。**
   - 只帶修改 Skill 的 commit，不 merge 整個 `main`。`main` 有 iter-6.md 與藍圖，裡面寫了 A 組 `tasks`、`analyze` 的結果，B 組讀到會影響 A/B 比較。
   - 在 B 組 worktree 執行：

     ```bash
     cd ../s-aixbdd-spec-kit-ab/group-b
     git cherry-pick $(git log --reverse --format=%h ae040c0..main -- .agents/skills .claude/skills)
     scripts/sync-skills.sh --check
     ```

   - 帶進去的 commit 應包含 `fd8e032`、`be648df`、`5e407d7`，以及驗證時新增的 Skill commit。把 B 組的 Skill 版本（`git -C ../s-aixbdd-spec-kit-ab/group-b rev-parse --short HEAD`）記進 iter-6.md 的「A/B worktree」。
3. **A/B 流程第 5 點：B 組跑 `notification-plan`，再跑步驟 6～8。**
   - runbook 9.5 還沒有 B 組跑 `notification-plan` 的提示詞（藍圖附錄第 1 點）。開始前要先在 runbook 第 8 節第 5 點與 9.0 階段對照補上，位置在 P5 之後、P6 之前。
   - 用與 A 組相同的模型設定，在 B 組 worktree 執行；產出 commit 到 `ab/group-b`，不放進主目錄。

## 6. 還沒完成的項目

1. 使用者親手驗證：`notification-plan`（本次）、第 5 次迭代與第 4 次迭代的部分情境（見 `iter-5-跨機交接.md` 第 4 節第 1 點）。通過後才提議打 tag，使用者同意才打，不 push tag。
2. `collect_coverage.py` 把 B1～B4 判成沒有合約、把 `ui/plan.md`「畫面範疇」誤算給 S、N 介面（iter-6 步驟 7 觀察 1），留到步驟 10 分類。
3. `docs/待確認.md` 第 30 項：`constitution` 的產出物對照表沒有 `notification/plan.md`。
4. 主目錄有一個未追蹤目錄 `docs/選模評估/`（另一個 session 在 2026-11-11 07:50 建立的選模評估草稿，使用者尚未確認）。交出時依使用者的決定處理，見第 8 節第 4 點。

## 7. Suggested skills

1. commit 訊息：讀 `.agents/skills/conventional-commits/SKILL.md`（用路徑讀取）。
2. 使用者驗證：在 Claude Code 用 Skill 工具呼叫 `user-verify-skill`（`disable-model-invocation`，要由使用者以 `/user-verify-skill` 觸發）。
3. 驗證不通過、要優化 Skill 時：用 Skill 工具呼叫 `skill-engineering`。
4. B 組的步驟 6～8 依 runbook 9.5 的提示詞，用路徑讀取 `.agents/skills/<name>/SKILL.md`：`notification-plan`、`tasks`、`analyze`、`implement`。不用同名的全域 Skill。

## 8. 本次對話的經過（舊電腦最後一個 session）

1. 使用者確認紀錄 47 的根因報告與藍圖，agent 依 `skill-engineering` Phase 5 施工 12 個工作項，結構診斷 0 error，兩邊同步一致。
2. 以 Sonnet medium 子代理在暫存複本跑 S1～S6，全部通過，結果寫進藍圖第 8 節。
3. 使用者要換電腦。agent 記錄 `docs/待確認.md` 第 30 項，分開 commit（`fd8e032`、`be648df`、`400c30b`），補標「（未驗證）」（`5e407d7`），更新 iter-6.md，寫本文件。
4. `docs/選模評估/` 不屬於本次工作，依使用者決定處理後才 push。**新電腦的第一則貼第 9 節的提示詞。**

## 9. 新電腦第一則可直接貼上的提示詞

```text
我們換了一台電腦，要接續第三題第 6 次迭代（通知迭代）。請先讀 docs/handoff/iter-6-跨機交接.md，再讀 docs/dev/迭代-runbook.md 第 0.3、8 節與 docs/iterations/iter-6.md。
規則：用路徑指定 Skill；不改 Skill；不 push、不打 tag；繁體中文回覆。
請做這幾件事，然後停下來等我：
1. 確認 git status 乾淨、git log -1 是交接文件的 commit。
2. 執行 scripts/sync-skills.sh --check，回報兩邊是否一致。
3. 依交接文件第 3 節，檢查工具版本、core.hooksPath、apps/equipment-loan/backend/.env 是否存在（不要印出內容），列出缺少的項目；資料庫先不用建。
4. 依交接文件第 4 節重建 A、B 兩個 worktree，確認 ab/group-a 是 b0cac59、ab/group-b 是 ae040c0，兩邊 git status 乾淨。
5. 把新電腦的電腦名稱、工具版本與接續位置記進 docs/iterations/iter-6.md「固定環境」的中途變動，commit。
6. 告訴我最後完成的是 A/B 流程第 4 點，下一步是交接文件第 5 節第 1 點：使用者驗證 notification-plan。
```
