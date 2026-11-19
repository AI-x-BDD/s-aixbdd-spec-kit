# 交接：Spec Kit v1.4.2 調整計畫批 2（欄位約束鏈）開工

- 建立日期：2026-11-19
- 專案：`/Volumes/data/Projects-practice/s-aixbdd-spec-kit`（branch `main`）
- 計畫：`docs/dev/spec-kit-1.4.2-調整計畫.md`
- 最新 commit：`adb8162`（尚未 push）。用 `git log --oneline -5` 查看。

## 1. 新對話要做的事

在新對話貼上下面的提示詞：

```text
請讀取 docs/dev/spec-kit-1.4.2-調整計畫.md 第 3.2 節 C13、C14、C15、C17、C20 與第 4 節「批 2：欄位約束鏈」、第 6 節批 2 那一列，開始批 2。
依計畫，依下游讀上游的順序處理 data-plan → tasks → analyze。每個 Skill 用 skill-engineering；既有腳本 tasks/scripts/check_tasks.py 與 analyze 的 collect_coverage.py 用 skill-form-script。
先從 data-plan 開始，依 skill-engineering 的 SOP 做到需要使用者確認的閘門（驗收條件、根因分析或藍圖），在閘門停下來等使用者確認，確認前不修改 Skill。
.spec-kit/v1.4.2/ 是本批的參考素材，依計畫需要時讀取。
完成後依 CLAUDE.md 格式附上下一步提示詞。
```

## 2. 目前進度

1. 批 0：完成（`6a2b756`）。
2. 批 1：計畫第 1 點的範圍全部完成。
   - 3 個 bug Skill 與第 33 項修正：見 `docs/handoff/批1-第5-6步-commit-跨機交接.md`。
   - 本次對話完成交接文件第 2 節的兩項，並補上交接文件漏列的 README 同步（計畫第 6 節批 1）：
     - `84d36b3`：runbook 新增第 10 節「錯誤修正流程」（B1、B1r、B2～B5 提示詞）；步驟 10 分類加入「意圖改變」，「程式錯誤」改走第 10 節。
     - `f9edd70`：README 加入 3 個 bug Skill（未驗證）與 `specs/bugs/`。
     - `adb8162`：第 10 節補上步驟 6（判定成立但有轉回 SDD 流程的項目時）與 B5 第 3 點。
3. 批 2：還沒開始。批 2 只依賴批 0。

## 3. 仍待使用者決定（新對話不要自行處理）

`docs/handoff/批1-第5-6步-commit-跨機交接.md` 第 3 節的 5 項都還沒有決定。本次對話給過建議，但使用者沒有表示同意，不能當成已決定：

- 建議過：「（未驗證）」先保留，到批 7 驗收用最終版跑過再移除；批 1 先不打 tag；O4～O8 與第 36 項先不處理。
- 使用者最後只說：先 commit，再開始批 2，其他事先不處理。

## 4. 使用者對步調的回饋（本次對話觀察到的）

1. 本機是 Mac mini（`scutil --get ComputerName` 已確認）。批 1 第 5、6 步在 MacBook Pro M1 做完後換到本機。`docs/handoff/批1-第5-6步-commit-跨機交接.md` 第 3 節第 4 項把舊電腦寫成 Mac mini，這是錯的：`/tmp/bugacc/` 等暫存資料不在本機，在 MacBook Pro M1。使用者覺得步調和之前不同。`.auto/mode`（自動模式，目前 `next=on`、`clarify=off`）與 Claude Code 記憶目錄都不在 git 裡，兩台可能不一樣。
2. 我把計畫已規定的項目分成幾區請使用者選，使用者看不懂為什麼要選。計畫已寫明的項目直接列為要做，不要拆成選項。
3. 建議或回報分很多段、很多點時，使用者說「看不懂」。回答先給一句結論，只列使用者現在要做的事。
4. 停下來等使用者的地方：`skill-engineering` 的使用者確認閘門、`bug-assess` 的核准、使用者實際驗證、commit／push／tag。

## 5. 專案規則重點（細節見 `CLAUDE.md`）

- 設計或優化 Skill 在主 session 用 Opus、effort high。Skill 驗收（Phase 5）委派 Sonnet、medium（`skill-tester` agent）。
- 改 `.claude/skills/` 後執行 `scripts/sync-skills.sh --from claude`，再 `--check`。
- 參考外部 Skill 改寫時，在 Skill 目錄放 `LICENSE`，並更新根目錄 `LICENSE`（計畫第 6 節批 2 那一列寫了要改哪些）。
- Skill 優化的 commit 訊息依 `docs/dev/迭代-runbook.md` 第 7.2 節寫 5 個欄位。
- 回覆用繁體中文、短句；每步結尾依 `CLAUDE.md`「回答方式」附下一步提示詞。

## 6. 建議使用的 Skill

- `skill-engineering`：data-plan、tasks、analyze 各跑一次（先 data-plan）。
- `skill-form-script`：修改 `tasks/scripts/check_tasks.py` 與 analyze 的 `collect_coverage.py`。
- `skill-form-rule`、`skill-form-template`、`skill-form-sop`：由 `skill-engineering` 編排施工時使用。
- `conventional-commits`：commit 前寫訊息。
