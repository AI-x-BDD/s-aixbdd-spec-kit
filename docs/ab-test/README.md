# 第 6 次迭代 A/B 比較：原始產出歸檔

本目錄保存第 6 次迭代（通知迭代）A/B 比較的輸入與兩組原始產出。依據是 `docs/dev/迭代-runbook.md` 第 8 節第 6 點，以及 `docs/dev/第三題選題討論.md` 的「A/B 比較設計」與「當下必須保存的證據」。

## 比較目的

確認新 Skill `notification-plan` 與 `tasks`、`analyze` 的接入，能不能讓沒有 Planner 的外部通知介面得到「明確的決策與可執行的任務」。

- A 組：原 workflow（`tasks` → `analyze`），沒有 `notification-plan`。
- B 組：加入 `notification-plan` 與下游接入（`notification-plan` → `tasks` → `analyze` → `implement`）。
- 只實作 B 組。A 組沒有實作，所以不能宣稱 A 組「一定會出錯」；比較報告要分開寫「規劃改善」與「執行結果」。
- 這只是單一案例，不能證明新 Skill 普遍有效。

## 共用起點

- commit `ae040c0`（`main`）：步驟 4～5 的檢查點，含 spec、research、techstack、plan 與三個 Planner 產出。
- 兩組都從這個 commit 建立 git worktree，在同一台電腦、同一個模型設定下執行。詳見各組 `README.md`。
- 兩組都沒有修改共用輸入（B 組 `notification-plan` 列出的上游衝突只記錄，不修改上游）。

## 目錄

| 路徑 | 內容 |
|---|---|
| `input/specs/008-overdue-discord-notification/` | 共用輸入，從 `ae040c0` 取出的 9 個檔案 |
| `group-a/` | A 組的 Skill 版本、模型設定與原始產出（`tasks.md`、`analysis.md`） |
| `group-b/` | B 組的 Skill 版本、模型設定與原始產出（`notification/plan.md`、`tasks.md`、`analysis.md`、步驟 8 的決策清單） |

## 歸檔規則

- 所有檔案以 `git show <commit>:<路徑>` 從該組 commit 取出，不是從工作目錄複製；`group-b/implement/decisions.md` 例外，見 `group-b/README.md`。
- 歸檔日期：2026-11-11（`Asia/Taipei`）。
- 歸檔後不再修改。分析與展示用的摘錄另外存，不寫進本目錄的原始檔。
- 對話紀錄存在本機，不放進 repo。
- 迭代紀錄：`docs/iterations/iter-6.md`。

## 輸入檔 sha256

| 檔案（`input/specs/008-overdue-discord-notification/` 之下） | sha256 |
|---|---|
| `spec.md` | `a13864ab70e842eb2d304fa3e97a0774e23cc62d1430dcefff6c7aed506ce74c` |
| `research.md` | `e3668c33f49451d4d6bfb928d0bac47bfc7d8046e2fcee029abe3e1ec2066f31` |
| `techstack.md` | `f0e6899e73c83cbb330902713959c8241e767f984f93be71efd1442f82b56afb` |
| `plan.md` | `37663ded3794a234fa7d0f1b47047a90362e71d30429311ca1e3b02f9b575054` |
| `contracts/openapi.yaml` | `bef0384adc4d8d778a034487eab35ccd4e06cba949c0e4241cd6ccd172d34330` |
| `data/data-model.dbml` | `d1154314ba2423ef067544a53aef07a2cb4d21f41ee123845876bf0f543cc0be` |
| `ui/plan.md` | `28d7cb1ba8d183ec99ab2d2a88541a31556e7d31175bdd77e77a511ee5e6dce8` |
| `ui/index.html` | `3f6a41c3bf484359472e59dc7155ef28996d84c0add8e73345d7e20b155041ba` |
| `ui/overdue-notifications.html` | `eec1a7f7aea9fb7b09f942efa5c092380352943db1d057f2034ec08af72c7af2` |
