# 第三題第 4 次迭代收尾後跨機交接

- 建立日期：2026-11-10
- 交出電腦：stevedeMac-mini（macOS）
- 交出時的執行者：Claude Code＋Opus 5.5（effort high）
- 交出時最新 commit：本文件的 commit（前一個是 `d1e59f4` 迭代紀錄、`6669ebd` api-plan 優化）
- 最後完成的 spec 目錄：`specs/006-reservation-reschedule`

## 1. 目前進度

1. 第 4 次迭代（成員申請改期）的 runbook 步驟 0～12 全部做完。詳細紀錄在 [`docs/iterations/iter-4.md`](../iterations/iter-4.md)，這裡不重寫。
2. 步驟 11 的 Skill 優化：api-plan 問題 1，commit `6669ebd`。根因與驗收在 `specs/skill-engineering/41-api-plan-合約與技術研究衝突時改寫規則/`。
3. P11b 不在正式目錄重跑，以 skill-engineering 驗收 S1 作為重跑結果（使用者決定，理由寫在 iter-4.md 問題 1）。
4. 步驟 12 的「提議打 tag」還沒做。原因：步驟 9 的驗證由 AI 代做，使用者沒有親手操作。

## 2. 換電腦前，在舊電腦要做的事

1. 確認 `git status` 乾淨。
2. 由使用者執行 `git push`。交出時 `main` 比 `origin/main` 多 3 個 commit（`6669ebd`、`d1e59f4`、本文件）。
3. 要把驗證截圖帶去新電腦時，另外複製 `docs/tmp/iter-4-uv/`（被 git 忽略，不會跟著 git 過去）。內容是步驟 9 的截圖 `shots/`（S1～S5、F1～F5、R1～R5）、驗證腳本 `uv.mjs`、`run3.log`。影片素材清單第 3 列引用它。不複製也可以：依 iter-4.md「使用者驗證」的啟動方式與 `npm run db:seed` 重拍。
4. 要沿用 Claude Code 的偏好時，複製 `~/.claude/CLAUDE.md` 與記憶目錄（runbook 0.3 表格最後兩列有說明）。

## 3. 新電腦第一次接手的檢查

照 [`docs/dev/迭代-runbook.md`](../dev/迭代-runbook.md) 0.3「新電腦第一次接手的檢查」做。和本次相關的重點：

1. `git pull`，確認 `git log -1` 是本文件的 commit。
2. `scripts/sync-skills.sh --check`，確認「兩邊一致」。
3. `apps/equipment-loan/backend/.env` 依 `.env.example` 重建。不要從聊天或 git 傳。
4. 資料庫在新電腦是空的。下一步（閘門決定）不需要啟動服務。要親手抽查第 4 次迭代時，依 iter-4.md「使用者驗證」的「啟動方式」重建，再跑 `npm run db:seed`。
5. 換電腦算環境變動。下一次迭代開始時，在新的 `iter-<N>.md`「固定環境」記下電腦、執行工具與版本、模型與 effort。

## 4. 還沒完成的項目

1. 第 13 天閘門（runbook 第 5 節第 4 列備註）：決定走 6 次或 5 次路徑。通過條件在 [`docs/dev/第三題選題討論.md`](../dev/第三題選題討論.md) 第 292 行。目前狀況：
   - 前 4 次完成：是。
   - 使用者驗證通過：第 4 次由 AI 代驗，使用者還沒親手抽查。
   - 第四題方向：還沒確認。
   - 影片用的 Skill 優化案例：還沒選。候選是 api-plan 問題 1（iter-4.md 影片素材清單第 1 列）。
   - 使用者第 14～15 天能不能平行處理第四題：要問使用者。
2. tag：使用者親手抽查並確認通過後，才提議打 `ch3-…` tag。使用者同意才打，不 push tag。
3. 留給下一次迭代或 `clarify-over-specs` 的缺漏：需求缺漏 C3、technical-research 缺漏 C1 與 C4。細節在 iter-4.md「Skill 表現檢查」與「流程不足」。
4. data-plan、ui-plan 可能也有「只比對憲法衝突」的缺口。使用者決定這次不改，也還沒檢查。
5. 3 個依賴晚間 18:00–21:00 的舊測試沒有修（iter-4.md 流程不足）。

## 5. 注意

1. 不修改任何 Skill（`.claude/skills/`、`.agents/skills/`），除非使用者用 `skill-engineering` 要求優化。
2. Skill 一律用路徑讀取專案內的 `.agents/skills/<name>/SKILL.md`，不用同名的全域 Skill（runbook 第 2 節）。
3. 第 5 次迭代的內容由閘門決定：6 次路徑做「送修／停用」，5 次路徑直接做通知迭代（runbook 第 5 節第 5、6 列）。閘門沒決定前不要開始第 5 次迭代。
4. Argon API 預計 2026-11-26 到期（runbook 第 6 節）。

## 6. Suggested skills

1. 閘門判斷與回報：不需要 Skill，讀 runbook 與選題討論即可。
2. commit 訊息：讀 `.agents/skills/conventional-commits/SKILL.md`（用路徑讀取）。
3. 開始第 5 次迭代後，依 runbook 第 9.5 節的提示詞順序使用 `s-specify`、`clarify-over-specs`、`technical-research`、`system-analysis`、`tasks`、`analyze`、`implement`（都用 `.agents/skills/<name>/SKILL.md` 路徑）。
4. 要優化 Skill 時：在 Claude Code 用 Skill 工具呼叫 `skill-engineering`。

## 7. 新電腦可直接貼上的提示詞

### 7.1 第一則：接續檢查

```text
我們換了一台電腦，要接續第三題。請先讀 docs/handoff/iter-4-跨機交接.md，再讀 docs/dev/迭代-runbook.md 與 docs/iterations/iter-4.md。
規則：用路徑指定 Skill；不改 Skill；不 push、不打 tag；繁體中文回覆。
請做這幾件事，然後停下來等我：
1. 確認 git status 乾淨、git log -1 是交接文件的 commit。
2. 執行 scripts/sync-skills.sh --check，回報兩邊是否一致。
3. 告訴我最後完成的步驟（第 4 次迭代步驟 12）與下一步（第 13 天閘門）。
```

### 7.2 第二則：第 13 天閘門

```text
第 4 次迭代已收尾（commit d1e59f4）。請依 docs/dev/迭代-runbook.md 第 5 節第 4 列備註與 docs/dev/第三題選題討論.md「迭代次數（第三次修正）」，整理第 13 天閘門的判斷依據（目前進度、Argon 到期日 2026-11-26、剩餘迭代 5／6 的工作量），讓我決定走 6 次或 5 次路徑；同時列出第四題方向的待確認點，並把 api-plan 問題 1 列為影片用 Skill 優化案例的候選，讓我決定。
```

## 8. 本次對話原貌（舊電腦最後一個 session）

依使用者要求，盡量保留原文。新電腦的 agent 讀完本節，就知道對話停在哪裡、下一則要貼什麼。

### 8.1 使用者的指示（原文）

```text
請讀 /var/folders/df/_gkj2bcd1vl2x5cg2lqsfrch0000gn/T/handoff-iter4-step12.md，然後讀
  docs/dev/迭代-runbook.md 與 docs/iterations/iter-4.md，接著做第三題第 4 次迭代的 runbook 步驟 12：
  1. 更新 docs/iterations/iter-4.md 的「流程不足」與「影片素材清單」。P11b 以 skill-engineering 驗收
  S1 作為重跑結果，不在正式目錄重跑。
  2. 依檢查點 commit。
  3. 回報本次迭代的完成狀況，並列出還沒完成的項目。
```

說明：上面的 `handoff-iter4-step12.md` 在舊電腦的暫存目錄，不會跟過去。它的內容已經做完，並寫進 iter-4.md，新電腦不需要讀它。

### 8.2 Agent 做了什麼

1. 把 P11b 寫進 iter-4.md 問題 1 的「處理結果」。
2. 在「流程不足」新增 6 列，在「影片素材清單」新增 4 列。
3. 把步驟 9 的驗證截圖從 session 暫存區複製到 `docs/tmp/iter-4-uv/`。
4. 把結束日期填成 2026-11-10。
5. commit `d1e59f4`（`docs(iterations): 新增第 4 次迭代完整執行、驗證與收尾紀錄`），沒有 push。

### 8.3 Agent 的最後回報（原文）

> 第 4 次迭代的步驟 12 做完了，已 commit `d1e59f4`，沒有 push。
>
> **完成狀況**：runbook 步驟 0 到 12 都做完了，步驟 1 這次不需要。步驟 12 的第 3 項「提議打 tag」還沒做。
>
> **還沒完成的項目**
> 1. runbook 第 5 節第 4 列的 3 項備註都還沒處理：
>    - 第 13 天閘門：決定走 6 次或 5 次路徑。
>    - 確認第四題的方向。
>    - 選 1 個影片用的 Skill 優化案例。我建議用 api-plan 問題 1，由你決定。
> 2. tag 還沒打。驗證由 AI 代做，所以「使用者回饋」是空白，還不符合規則第 6 條。你親手抽查幾個情境並確認通過後，我才提議打 `ch3-…` tag。
> 3. 3 個缺漏沒有處理，留給下一次迭代或 `clarify-over-specs`：需求缺漏 C3；technical-research 缺漏 C1（`request_no`）與 C4（改期申請的並發控制）。
> 4. data-plan 與 ui-plan 可能也有「只比對憲法衝突」的同樣缺口。依你這次決定的範圍，它們沒有改，也還沒檢查。
> 5. 3 個依賴晚間時段的舊測試沒有修。
>
> 目前完成了第 12 步，第 4 次迭代的 runbook 已經走完。下一步是第 5 節第 4 列的第 13 天閘門：決定走 6 次或 5 次路徑，同時確認第四題方向與影片案例。
>
> （下一步提示詞就是本文件 7.2）

### 8.4 之後的對話

使用者要求建立本交接文件，準備換電腦。對話停在這裡。**新電腦的第一則貼 7.1，第二則貼 7.2。**
