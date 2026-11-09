# 第三題第 3 次迭代（`005-equipment-pickup-return`）跨機交接文件

- 建立日期：2026-11-09
- 交出電腦：`steve-10（macOS）`
- 交出時最新 commit：見 `git log -1`（規格與 Planner 產出 commit `ed0f842`、迭代紀錄 commit `570eb88`）
- 目標 spec 目錄：`specs/005-equipment-pickup-return`
- 上一次 spec 目錄：`specs/004-equipment-approval-review`

## 1. 目前完成進度（步驟 0 ～ 步驟 5）

詳見 [`docs/iterations/iter-3.md`](../iterations/iter-3.md)：

1. **步驟 0（準備）**：建立 `docs/iterations/iter-3.md`，記錄固定環境（OpenCode 1.19.5 Build agent、Gemini 4 Argon high、起始 Skill 版本 `fce38b1`）。
2. **步驟 2（`s-specify`）與步驟 3（`clarify-over-specs`）**：產出並澄清 [`specs/005-equipment-pickup-return/spec.md`](../../specs/005-equipment-pickup-return/spec.md)（commit `a3ea247`），主動問出「預約與借用的狀態轉移限制」，並消除全部推定項目。
3. **步驟 4（`technical-research`）**：產出 [`research.md`](../../specs/005-equipment-pickup-return/research.md) 與 [`techstack.md`](../../specs/005-equipment-pickup-return/techstack.md)（commit `ed0f842`）。
4. **步驟 5（`system-analysis` 含 `ui-plan`、`api-plan`、`data-plan`）**：產出 [`plan.md`](../../specs/005-equipment-pickup-return/plan.md)、[`ui/`](../../specs/005-equipment-pickup-return/ui/)、[`contracts/openapi.yaml`](../../specs/005-equipment-pickup-return/contracts/openapi.yaml)、[`data/data-model.dbml`](../../specs/005-equipment-pickup-return/data/data-model.dbml)（commit `ed0f842`），三個 Planner 檢查腳本與 64 個雛形狀態瀏覽器檢查皆 0 issues。

## 2. 接下來在新電腦要執行的步驟（步驟 6 ～ 步驟 12）

依 [`docs/dev/迭代-runbook.md`](../dev/迭代-runbook.md) 第 4 節與第 9.5 節依序執行：

1. **P0r（跨機接續檢查）**：確認 `git status` 乾淨，並在 `docs/iterations/iter-3.md` 的「固定環境 → 中途變動」記下新電腦名稱、工具版本、目前 commit SHA 與從步驟 6 接續。
2. **步驟 6（P6 `tasks`）**：產出 `specs/005-equipment-pickup-return/tasks.md` 並執行 `check_tasks.py`。
3. **步驟 7（P7 `analyze`）**：產出 `specs/005-equipment-pickup-return/analysis.md`，確認無 CRITICAL 後執行步驟 6～7 檢查點 commit。
4. **步驟 8（P8 `implement`）**：依 `tasks.md` 實作 `apps/equipment-loan/`（含 6 態與雙重部分唯一索引無損 migration、6 態 demo seed 擴充、前後端領取／歸還／目前借用中功能與 Vitest／Supertest／Playwright 測試），每個 Phase 結束 commit 一次。
5. **步驟 9（P9 使用者驗證）**、**步驟 10（P10 檢查 Skill 表現）**、**步驟 12（P12 收尾）**。

## 3. Suggested Skills

> **重要規則（見 `docs/dev/迭代-runbook.md` 第 2 節）**：OpenCode 同時載入專案與全域 Skills，且全域有同名但內容不同的 `implement`。新 session 的 Agent **必須一律透過檔案路徑讀取專案內的 `.agents/skills/<name>/SKILL.md` 並依其 SOP 執行**，不使用全域同名 Skill，也不修改 `.agents/skills/` 與 `.claude/skills/`。

接下來步驟 6～12 依序使用的專案 Skills：

- `tasks`：`.agents/skills/tasks/SKILL.md`（步驟 6）
- `analyze`：`.agents/skills/analyze/SKILL.md`（步驟 7）
- `implement`：`.agents/skills/implement/SKILL.md`（步驟 8，務必指定此路徑）
- `conventional-commits`：`.agents/skills/conventional-commits/SKILL.md`（各檢查點 commit 訊息規範）

## 4. 新電腦接手前置檢查（見 runbook 0.3）

1. `git pull`，確認最新 commit 包含本交接文件與 `specs/005-equipment-pickup-return/`。
2. 執行 `scripts/sync-skills.sh --check`，確認輸出「兩邊一致」。
3. 確認 `apps/equipment-loan/backend/.env` 已存在（若無，執行 `cp -n apps/equipment-loan/backend/.env.example apps/equipment-loan/backend/.env`），且 Docker PostgreSQL 容器與 `node_modules/` 可正常運作。

## 5. 新電腦可直接貼上的提示詞

### 5.1 第一則：貼 `P0r` 接續

```text
我們要接續第三題第 3 次迭代。請先讀 docs/dev/迭代-runbook.md 全文，再讀 docs/iterations/iter-3.md 與 docs/handoff/iter-3-跨機交接.md。
規則與 P0 相同（一步只做我貼的那一步；用路徑指定 Skill；不改 Skill；檢查點可 commit、不 push、不打 tag；3 行回報；繁體中文）。
請做這幾件事，然後停下來等我貼下一步：
1. 依 iter-3.md 的步驟紀錄，告訴我最後完成的步驟與下一步。
2. 確認 git status 乾淨、最後一個 commit 與 iter-3.md 記錄的一致。
3. 在 iter-3.md 的「固定環境」記下這次接續：電腦、OpenCode 版本、模型與 effort、目前 commit SHA、從哪一步接續。
本次資料：
- 本次 spec 目錄：specs/005-equipment-pickup-return
- 上一次 spec 目錄：specs/004-equipment-approval-review
```

### 5.2 第二則：貼 `P6`（步驟 6 `tasks`）

```text
請做 runbook 步驟 6：讀取 .agents/skills/tasks/SKILL.md 並依其 SOP 執行。
目標 spec：specs/005-equipment-pickup-return/spec.md
完成後依步驟 6 的「結束後的檢查」回報（舊資料遷移與回歸任務、demo seed 任務、Notes 待確認數量）。
```
