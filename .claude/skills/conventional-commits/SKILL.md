---
name: conventional-commits
description: 依 Conventional Commits 1.0.0 判斷 commit type、scope 與 breaking change，並撰寫或審查 commit message。用在：根據 git diff 寫 commit message、判斷該用 feat／fix／refactor／chore 等哪個 type、檢查既有 commit message 是否合規、處理一個 commit 混了多種修改要不要拆、dependency／CSS／revert 等容易誤判的情境，以及設計團隊的 type／scope 規則。
---

# SOP

## Phase 1 -- 分析變更與適用規則

1. `READ` 使用者需求與提供的變更摘要或待審查訊息；依 repository 產生訊息時，讀取 `git status`、`git diff --staged`，沒有 staged 時讀取 `git diff`，建立「本次輸入」。
2. `READ` 有專案環境時，讀取適用的 CONTRIBUTING、commitlint 與 release 設定及 `git log --oneline -30`，建立「專案慣例」；沒有專案環境時記錄為無額外規則。
3. `READ` 分析變更時，讀取 `rules/變更分類-格式規範.md` 的所有 Rule，建立「變更分類檢查清單」。
4. `THINK` 依「本次輸入」、「專案慣例」與「變更分類檢查清單」，決定修改目的、是否分拆與各訊息的 type。
5. `READ` 決定或審查訊息內容時，讀取 `rules/提交訊息-格式規範.md` 的所有 Rule，建立「提交訊息檢查清單」。
6. `THINK` 依「提交訊息檢查清單」與「專案慣例」，決定 scope、相容性影響及訊息組成。
7. `READ` 涉及 revert、既有 commit 修正、squash merge 或 release 工具行為時，讀取 `rules/歷史處理-格式規範.md` 的所有 Rule，建立「歷史處理檢查清單」。
8. `THINK` 已載入「歷史處理檢查清單」時，依其判斷本次的歷史處理或工具限制；其餘情境直接進入 Phase 2。

完成條件：各項變更的目的、type、scope、相容性影響與是否分拆已有依據，適用的檢查清單均已載入。

## Phase 2 -- 產生訊息與交付

1. `WRITE` 依「變更分類檢查清單」、「提交訊息檢查清單」、「專案慣例」及已載入的「歷史處理檢查清單」，產生訊息或審查結果，指出採用的規則來源。
2. `CHECK` 逐條核對所有已載入的檢查清單與使用者要求；未通過時修正後重新檢查。
3. `DELEGATE` 使用者明確要求 commit 時才使用 Git 建立 commit，執行前重新核對 status、diff 與本次提交範圍；只要求訊息或審查時交付文字，不變更 index 或檔案。

完成條件：訊息或審查結果通過所有適用檢查清單，Git 操作符合使用者授權。
