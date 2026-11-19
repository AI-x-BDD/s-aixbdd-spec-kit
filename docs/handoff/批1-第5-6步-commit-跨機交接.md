# Spec Kit v1.4.2 調整計畫批 1 第 5、6 步完成後跨機交接

- 建立日期：2026-11-19
- 計畫：`docs/dev/spec-kit-1.4.2-調整計畫.md` 第 4 節「批 1：錯誤修正流程」。
- 交出時最新 commit：本文件最後一次修改的 commit（`git log -1 -- docs/handoff/批1-第5-6步-commit-跨機交接.md`）。批 1 第 5、6 步的修改都已 commit 並 push 到 `origin/main`，用 `git log --oneline -8` 查看。

## 1. 目前進度

1. 第 5 步：建立 `bug-assess`、`bug-fix`、`bug-test`（紀錄 `specs/skill-engineering/50～52`），並用它們處理 `docs/待確認.md` 第 33 項。處理產出在 `specs/bugs/pickup-test-time-dependent/`，程式修正在 `apps/equipment-loan`（e2e 固定時刻、`api.test.ts` SC-001～SC-003 固定時刻）。
2. 第 6 步：以 `skill-engineering` 優化 3 個 Skill，併回原版優點並修正驗收問題（紀錄 `specs/skill-engineering/53-bug-assess-fix-test-併回原版優點與驗收問題/`）。共兩輪。第 2 輪驗收 S1～S6、S8 全部通過，結果在該目錄 `blueprint.md` 第 8 節（8.6～8.10）。
3. 3 個 Skill 的 `description` 仍標「（未驗證）」。

## 2. 批 1 還沒做的範圍

計畫第 4 節批 1 第 1 點的範圍中，下列兩項還沒有做（`docs/dev/迭代-runbook.md` 沒有「錯誤修正流程」）：

1. runbook 新增「錯誤修正流程」一節與提示詞。
2. runbook 步驟 10 的分類加「意圖改變」，「程式錯誤」改成走錯誤修正流程。

## 3. 待使用者決定的事（不要自行處理）

1. 3 個 Skill 的「（未驗證）」要不要移除。依 `CLAUDE.md`，要使用者實際驗證通過才能移除。
2. 53 藍圖 8.10 的觀察 O4～O8，以及 8.1 最後一點的小觀察，要不要處理。
3. `docs/待確認.md` 第 36 項：`bug-assess` P1-4 已在 53 第 1 輪拆成 `WRITE`＋`CHECK`；P4-4 的 `CHECK` 仍含「還原這些變更」。要不要另開一輪處理。
4. 舊電腦（Mac mini）的暫存資料要不要清理：`/tmp/bugacc/` 的 7 個舊 worktree、`/tmp/bugacc53/`、`/tmp/bf2-old-fix.md`。這些只在舊電腦，新電腦不需要。
5. 計畫批 1 第 5、6 點要不要標成完成；批 1 完成後要不要打 annotated tag（依 `CLAUDE.md` 規則 6，先問使用者）。


決定（2026-11-19，使用者回覆「B 照建議」）：

1. 「（未驗證）」保留，等使用者用錯誤修正流程實際處理一個真的 bug 後再移除。
2. 觀察 O6 與 8.1 的施工觀察併入 `docs/待確認.md` 第 36 項；O4、O5、O7、O8 不處理。
3. 第 36 項另開一輪，排在批 7 之後。
4. 舊電腦的暫存資料，下次使用 Mac mini 時再刪除。
5. 計畫標記批 1 完成；不打 tag，等批 0～7 完成並經使用者驗證後，錄影片前再打。
## 4. 建議使用的 Skill

- `skill-engineering`：處理第 3 節的觀察或第 36 項時使用。
- `writing-for-agents`：修改 runbook 時使用。
- `conventional-commits`：commit 前寫 commit message。
