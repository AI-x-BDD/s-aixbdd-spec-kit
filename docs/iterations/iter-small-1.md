# 迭代 small-1：008「逾期通知紀錄」4 種通知狀態徽章的 Light Mode 文字對比調到 WCAG AA 4.5:1 以上

- spec 目錄：`specs/008-overdue-discord-notification/`
- 做法：runbook 第 4 節「小變更路徑」（P0s → P5b → P8c → P8t → P8）
- 本次變更：008「逾期通知紀錄」的 4 種通知狀態徽章（送出中、送出成功、送出失敗、結果不明）在 Light Mode 的文字對比調到 WCAG AA 4.5:1 以上。只改徽章的文字色；全站共用的色彩變數、其他元件與 Dark Mode 不變。來源：批 7 驗收前以 `ui/plan.md` 色碼量測，Light Mode 對比為 2.86～4.24:1（同類問題見 runbook 第 5 節第 4 列遺留項 `iter-4.md:107`，那一項屬於 006，本次不標已處理）。
- 執行者：Claude Code＋Opus 5.5（runbook 第 6 節第 6 點）
- 開始／結束：2026-11-20／<未結束>

## 固定環境

| 項目 | 值 |
|---|---|
| 電腦 | steve-10（`Mac14,7`，macOS 27.0.1） |
| 執行工具與版本 | Claude Code 2.1.329（主 session）；`uv` 0.12.1；Node.js 24.14.1 |
| 模型與 effort | Opus 5.5（`claude-opus-5-5`），high（`CLAUDE_EFFORT=high`） |
| 子代理模型 | 本機設定 `CLAUDE_CODE_SUBAGENT_MODEL=sonnet`。委派 SOP 執行的子代理要明確指定 Opus，才能和 iter-6 的模型一致 |
| Skill 版本（開始時） | `ee48eef`（`scripts/sync-skills.sh --check`：兩邊一致） |
| 其他 | `git config --global core.hooksPath` = `~/dotfiles/git/hooks`；`git status` 只有已知的未 commit 目錄 `docs/wb-secret-formula/`（不讀、不改、不 commit） |
| 中途變動 | 2026-11-20 P8c：`converge` 改由子代理執行（Agent 工具 `general-purpose`，明確指定 Opus），理由是要對照 008 全部文件與程式，主 session 的上下文不夠。主 session 核對子代理的結果。電腦、Skill 版本不變，commit 為 `9586fc7` |
| 臨時改寫的提示詞 | P0s 改寫：比 runbook 9.5 的 P0s 多 2 句。① 規則多一條「docs/wb-secret-formula/ 是已知的未 commit 檔案，不算 git status 不乾淨；不要讀取、修改或 commit 它。」② 結尾多一句「完成後依 CLAUDE.md 格式附上下一步提示詞。」其餘依 9.5 原文，`{N}`=`small-1`、`{SPEC_DIR}`=`specs/008-overdue-discord-notification`。實際貼上的內容見下方「P0s 實際貼上的內容」 |

### P0s 實際貼上的內容

```text
我們要走 runbook 第 4 節的「小變更路徑」，代號 small-1。請先讀 docs/dev/迭代-runbook.md 全文，再做小變更路徑第 3 點第 1 步（準備）。
規則：
- 每一步只做我貼給你的那一步，做完就停下來等我貼下一步。
- 每一步都用路徑指定 Skill：讀取 .agents/skills/<name>/SKILL.md 並依其 SOP 執行，不用同名的全域 Skill。
- 不修改任何 Skill（.claude/skills/、.agents/skills/）。發現 Skill 問題時，依 runbook 第 7 節格式記進 docs/iterations/iter-small-1.md。
- 我同意你在 runbook 第 4 節（含小變更路徑）標出的檢查點自行 commit，commit 訊息依 .agents/skills/conventional-commits/SKILL.md。不 push、不打 tag。
- 每一步結束時，用 3 行以內回報：產出、問題、下一步。
- 用繁體中文回覆。
- docs/wb-secret-formula/ 是已知的未 commit 檔案，不算 git status 不乾淨；不要讀取、修改或 commit 它。
本次資料：
- 目標 spec 目錄：specs/008-overdue-discord-notification
- 本次變更：008「逾期通知紀錄」的 4 種通知狀態徽章（送出中、送出成功、送出失敗、結果不明）在 Light Mode 的文字對比調到 WCAG AA 4.5:1 以上。只改徽章的文字色；全站共用的色彩變數、其他元件與 Dark Mode 不變。來源：批 7 驗收前以 ui/plan.md 色碼量測，Light Mode 對比為 2.86～4.24:1（同類問題見第 5 節第 4 列遺留項 iter-4.md:107，那一項屬於 006，本次不標已處理）。
做準備時：
1. 確認本次變更符合小變更路徑第 1 點的每個條件。有不符合的條件時，列出來並停下來。
2. 依第 7 節樣板建立 docs/iterations/iter-small-1.md，「本次功能」寫本次變更，並依 9.0「固定環境」寫進執行工具版本、模型與 effort、Skill 版本（git rev-parse --short HEAD）。本提示詞比 runbook 的 P0s 多了 docs/wb-secret-formula/ 與「附上下一步提示詞」兩句，依 9.0 把實際貼上的內容記進紀錄。
3. 回報下一步要貼的 P5b 中「負責介面」應填的介面編號（取自 specs/008-overdue-discord-notification/plan.md 的系統介面盤點）。
完成後依 CLAUDE.md 格式附上下一步提示詞。
```

## 準備（P0s）

### 小變更路徑第 1 點的條件

| 條件 | 結果 | 依據 |
|---|---|---|
| 只改既有 spec 目錄中 Planner 的產出，目錄已有 `spec.md`、`plan.md`、`techstack.md` 或 `research.md`、`tasks.md` | 符合 | 要改的是 `ui/`（`ui-plan`）。008 目錄有 `spec.md`、`plan.md`、`research.md`、`techstack.md`、`tasks.md` |
| 不新增介面 | 符合 | 徽章屬於既有前端介面 F1（通知清單）；`plan.md` 系統介面盤點不變 |
| 不新增技術主題 | 符合 | 只調色，`research.md`、`techstack.md` 不變 |
| 不改 `spec.md` 的需求 | 符合 | `spec.md` 沒有對比或 WCAG 的需求（搜尋「WCAG」「對比」「contrast」沒有結果）；狀態標籤文字與 4 種狀態不變 |

### 變更來源的複核

以 `ui/overdue-notifications.html:101-104` 的徽章樣式（文字色 `--primary`／`--success`／`--danger`／`--pending`，底色為對應的 `-soft`）與 `ui/plan.md:41-50` 的 Light Mode 色碼，用 WCAG 2.x 相對亮度公式重算：

| 徽章 | 文字色 | 底色 | 對比 |
|---|---|---|---|
| 送出中 | `#2563EB` | `#DBEAFE` | 4.24:1 |
| 送出成功 | `#16A34A` | `#DCFCE7` | 3.00:1 |
| 送出失敗 | `#DC2626` | `#FEE2E2` | 3.95:1 |
| 結果不明 | `#D97706` | `#FEF3C7` | 2.86:1 |

結果和本次變更寫的 2.86～4.24:1 一致，4 種都低於 4.5:1。Dark Mode 的徽章文字色是 `--ink`（`ui/overdue-notifications.html:107`），本次不變。

### 和本次有關的遺留項（runbook 第 5 節）

- 第 4 列：淺色琥珀文字對比 3.19:1（`iter-4.md:107`）→ 屬於 006，本次不標已處理（依本次變更的說明）。
- 第 6 列：畫面沒有顯示 Message ID（`iter-6.md:333`）、「重送」按鈕文字擠成兩行（`iter-6.md:334`）→ 和本次同一頁，但不在本次範圍，本次不處理。

### P5b 的「負責介面」

- 填 `F1、F2、F3、F4`（`plan.md` 系統介面盤點中端點類型為前端的全部介面，和現有 `ui/plan.md:5` 的負責介面相同）。
- 理由：徽章本身屬於 F1，但 `ui-plan` 同意覆寫後會依「負責介面」重寫整份 `ui/plan.md` 與 `ui/` 的 HTML，第 1 節只列負責介面（`.agents/skills/ui-plan/SKILL.md` Phase 1 步驟 5），Phase 4 步驟 3 會刪除不在頁面清單的既有 HTML。只填 F1 時，F2～F4 的規劃與頁面可能被刪掉。

## 步驟紀錄

| 步驟 | Skill | 產出 | 使用者做了什麼 | 問題 | commit |
|---|---|---|---|---|---|
| 準備（P0s） | — | `docs/iterations/iter-small-1.md` | 貼 P0s | 沒有 | 不 commit（小變更路徑第 3 點第 1 步沒有檢查點） |
| 重跑 Planner（P5b） | ui-plan | `ui/plan.md`、`ui/index.html`、`ui/overdue-notifications.html` | 貼 P5b；同意覆寫 `ui/` 的 3 個檔案 | 見問題 1（候選） | P5b 檢查點 commit（標題「docs(specs): 調高 008 通知狀態徽章 Light Mode 文字對比至 WCAG AA」） |
| 收斂評估（P8c） | converge | `convergence.md` 第 1 輪：有缺口（附加任務 3、上游缺口 0、不處理 0） | 還沒確認缺口 | 子代理回報 4 項 Skill 問題，主 session 判斷 3 項成立（見問題 2～4） | P8c 檢查點 commit（標題「docs(specs): 新增 008 小變更 small-1 第 1 輪收斂評估」） |

### P5b 重跑紀錄

- Planner：`ui-plan`（`.agents/skills/ui-plan/SKILL.md`），負責介面 F1、F2、F3、F4。
- 為什麼重跑：本次變更。4 種通知狀態徽章的 Light Mode 文字對比為 2.86～4.24:1，低於 WCAG AA 4.5:1。
- 閘門：Phase 1 第 9 步列出 `ui/` 的 3 個既有檔案並詢問覆寫，使用者回覆「同意」。Phase 2 沒有風格缺口（提示詞指定沿用現有 `ui/plan.md` 的視覺風格），也沒有憲法衝突（只有 `shared.md`，`ui-plan` 沒有專屬憲法檔），所以沒有委派 `clarify`。
- 重跑結果：
  1. `ui/plan.md`：Date 改為 2026-11-20；第 2 節配色新增 4 個徽章文字色 `--badge-sending-ink` `#1D4ED8`、`--badge-sent-ink` `#166534`、`--badge-failed-ink` `#B91C1C`、`--badge-unknown-ink` `#92400E`（Dark Mode 沿用 `--ink`）；版面說明寫明只用在通知狀態徽章。其餘章節不變。
  2. `ui/index.html`、`ui/overdue-notifications.html`：`:root` 新增上述 4 個 token，4 個 `.badge-*` 規則的 `color` 改用它們。兩頁的共用樣式仍相同（HTML 雛形規範 Rule 1）。既有變數、轉圈、邊框、其他元件與 Dark Mode 規則不變。
  3. `check_ui.py --interfaces F1,F2,F3,F4`：`ok: true`，issues 0、warnings 0。
  4. 瀏覽器檢查（Chrome DevTools MCP，`file://`）：`overdue-notifications.html` 24 個雛形狀態、`index.html` 11 個雛形狀態逐一切換，沒有 JS 錯誤，console 沒有 error／warn。
  5. 實測對比（computed style）：Light Mode 送出中 5.49、送出成功 6.49、送出失敗 5.30、結果不明 6.37，都在 4.5:1 以上；Dark Mode 為 9.90、8.71、9.58、8.67（沒有變動）。
  6. 上游衝突：無。未通過項：無。憲法遵循：讀取 `.agents/constitution/shared.md`，必須／不得規則全部通過，沒有憲法偏離、未套用規則與憲法決策。
  7. `git diff` 只有 `ui/` 的 3 個檔案（另有本紀錄檔）。
- 執行方式：依 SOP 重寫 `ui/plan.md` 與兩個 HTML 時，保留原有內容，只改動和本次變更有關的段落（見流程不足第 1 列）。

### P8c 收斂評估紀錄

- 結果：第 1 輪，有缺口（附加任務 3、上游缺口 0、不處理 0）。沒有 CRITICAL 與 HIGH。
- 檢查範圍：FR 21、NFR 3、SC 7（沒有排除）、US 情境 37、Edge Case 13、介面 15、技術決定 8、憲法規則 1（`skills/implement/code.md` 不存在）、任務 42（T001～T042）、待確認 4（都已有上游決定）。
- 主 session 以 `sed -n` 抽查 G1～G3 的程式與文件行號，內容支持描述。`git status` 只多了 `convergence.md`，HEAD 仍為 `9586fc7`。

| G 編號 | 類型 | 嚴重度 | 摘要 | 處理（converge 寫的） | 和本次變更的關係 |
|---|---|---|---|---|---|
| G1 | 部分 | MEDIUM | `frontend/src/views/OverdueNotificationsView.tsx:637-640` 的 4 種通知狀態徽章文字仍用 `--primary`／`--success`／`--danger`／`--pending`，沒有改用 `ui/plan.md:51-54` 的 4 個徽章文字色 | 附加任務 | 本次變更要落到程式的部分 |
| G2 | 部分 | MEDIUM | 送出程序與恢復處理寫入 `overdue_notifications` 時沒有把 `updated_by` 設為 null（`backend/src/jobs/overdueScheduler.ts:43-56`、`:88-150`；`data/data-model.dbml:85`），重送後保留管理員 ID | 附加任務 | 不屬於本次變更，iter-6 既有的缺口 |
| G3 | 部分 | MEDIUM | 啟動時沒有驗證 `DISCORD_WEBHOOK_URL`，位址沒有設定時要等第一則通知送出才寫 log（`backend/src/config/notificationConfig.ts:23-35`、`backend/src/jobs/overdueScheduler.ts:225-234`；`notification/plan.md:242`） | 附加任務 | 不屬於本次變更，iter-6 既有的缺口 |

- 等待使用者確認：每個缺口是不是真的缺口；G2、G3 要在 small-1 處理，還是改為「不處理」並記為第 5 節第 6 列的遺留項。

## Skill 表現檢查

| Skill | 預期 | 實際 | 分類（需求缺漏／意圖改變／程式錯誤／Skill 缺陷／沒有問題） | 證據位置 |
|---|---|---|---|---|

## Skill 問題（交給 skill-engineering）

### 問題 1（候選，步驟 10 再分類）：ui-plan

- 發生了什麼：`ui-plan` 產出的配色讓文字在柔和底色上的對比低於 WCAG AA 4.5:1，而且 `check_ui.py` 與兩份格式規範都沒有檢查。008 的 4 種通知狀態徽章為 2.86～4.24:1；006 的淺色琥珀文字為 3.19:1。
- 原本預期：Planner 選定的文字色與底色組合可讀，至少符合 WCAG AA，或在回報中標出不符合的組合。
- 證據：`specs/008-overdue-discord-notification/ui/plan.md` 第 2 節（本次修改前的 `--primary`／`--success`／`--danger`／`--pending` 搭配 `-soft` 底色）；`ui/overdue-notifications.html:101-104`（修改前）；`iter-4.md:107`；`.agents/skills/ui-plan/rules/畫面規劃-格式規範.md` 與 `HTML雛形-格式規範.md` 沒有對比規則。
- 影響：低對比在批 7 驗收前才被量出，要另走小變更路徑修正；同一套配色沿用到之後的迭代時會重複發生。
- 分類待定：spec 與憲法都沒有對比需求。這可能是 Skill 缺陷（`ui-plan` 應檢查可讀性），也可能屬於憲法（`constitution` 新增 `ui-plan` 的可及性規則）。步驟 10 再判斷。
- 處理結果：<由 Claude Code 填>

### 問題 2：converge（範例缺少 Edge Case 列）

- 發生了什麼：SOP Phase 2 步驟 1 把 Edge Case 列為檢查項目，Phase 3 步驟 2 規定檢查範圍表每類一列，但範例的檢查範圍表沒有 Edge Case 列。子代理依 SOP 自行加上。
- 原本預期：範例和 SOP 一致。
- 證據：`.agents/skills/converge/SKILL.md:21`、`:32`；`.agents/skills/converge/templates/convergence.example.md` 搜尋「Edge Case」為 0 筆。
- 影響：照範例填寫的執行者可能漏掉 Edge Case 的計數。
- 處理結果：<由 Claude Code 填>

### 問題 3：converge（全目錄關鍵字搜尋沒有定義關鍵字與排除目錄）

- 發生了什麼：Phase 2 步驟 2 要以 `grep -rln` 在 Source Code 根目錄搜尋「每個檢查項目的關鍵字」，但沒有定義約 190 個項目的關鍵字來源，也沒有排除 `node_modules/`、`test-results/`。子代理改用主題關鍵字（overdue、discord、webhook、逾期），並排除這些目錄。
- 原本預期：SOP 寫明關鍵字來源與排除的目錄。
- 證據：`.agents/skills/converge/SKILL.md:22`；`apps/equipment-loan/` 下有 `node_modules/`、`test-results/`。
- 影響：不同執行者的搜尋範圍不同，找到的「未要求」缺口可能不同。
- 處理結果：<由 Claude Code 填>

### 問題 4：converge（其他 Skill 的憲法檔不在讀取範圍，待確認是否刻意）

- 發生了什麼：SOP 只讀 `shared.md` 與 `skills/implement/code.md`。`.agents/constitution/skills/` 另有 `api-plan/openapi.md`、`data-plan/data-model.md`，程式違反它們時 converge 不會發現。
- 原本預期：SOP 寫明這兩個檔要不要納入。
- 證據：`.agents/skills/converge/SKILL.md:13`；`.agents/constitution/skills/` 底下有 `api-plan`、`data-plan`。
- 影響：可能是刻意設計（這兩個檔約束的是 Planner 產出，由 `analyze` 檢查）。步驟 10 再判斷。
- 處理結果：<由 Claude Code 填>

子代理另回報「樣板的結果欄位有『不處理 N』，但 Rule 3 禁止寫『不處理』」。主 session 判斷不成立：「不處理」由使用者在確認缺口時手動改寫（runbook 步驟 8c），converge 本身不寫，所以樣板保留這個計數是合理的。

## 使用者驗證

- commit SHA：
- 情境與結果：
- 使用者回饋：

## 流程不足

| 步驟 | 問題 | 影響 | 試過的優化 |
|---|---|---|---|
| P5b | `ui-plan` 只有整份重寫模式：同意覆寫後依樣板重寫 `ui/plan.md` 與所有 HTML，Phase 4 第 3 步還會刪除不在頁面清單的 HTML。小變更只要改 4 條 CSS 與配色表，SOP 沒有「只改指定部分」的做法 | 重寫時可能動到不相關的規劃；負責介面填少了會刪掉其他介面的內容（準備時已改填 F1～F4） | 本次重寫時保留原內容，只改相關段落，並以 `git diff` 確認範圍 |

## 影片素材清單

| 要證明什麼 | 證據路徑 | commit SHA | 重現步驟 | 只能當下保存？ |
|---|---|---|---|---|
