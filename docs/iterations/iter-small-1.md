# 迭代 small-1：008「逾期通知紀錄」4 種通知狀態徽章的 Light Mode 文字對比調到 WCAG AA 4.5:1 以上

- spec 目錄：`specs/008-overdue-discord-notification/`
- 做法：runbook 第 4 節「小變更路徑」（P0s → P5b → P8c → P8t → P8）
- 本次變更：008「逾期通知紀錄」的 4 種通知狀態徽章（送出中、送出成功、送出失敗、結果不明）在 Light Mode 的文字對比調到 WCAG AA 4.5:1 以上。只改徽章的文字色；全站共用的色彩變數、其他元件與 Dark Mode 不變。來源：批 7 驗收前以 `ui/plan.md` 色碼量測，Light Mode 對比為 2.86～4.24:1（同類問題見 runbook 第 5 節第 4 列遺留項 `iter-4.md:107`，那一項屬於 006，本次不標已處理）。
- 執行者：Claude Code＋Opus 5.5（runbook 第 6 節第 6 點）
- 開始／結束：2026-11-20／2026-11-20

## 固定環境

| 項目 | 值 |
|---|---|
| 電腦 | steve-10（`Mac14,7`，macOS 27.0.1） |
| 執行工具與版本 | Claude Code 2.1.329（主 session）；`uv` 0.12.1；Node.js 24.14.1 |
| 模型與 effort | Opus 5.5（`claude-opus-5-5`），high（`CLAUDE_EFFORT=high`） |
| 子代理模型 | 本機設定 `CLAUDE_CODE_SUBAGENT_MODEL=sonnet`。委派 SOP 執行的子代理要明確指定 Opus，才能和 iter-6 的模型一致 |
| Skill 版本（開始時） | `ee48eef`（`scripts/sync-skills.sh --check`：兩邊一致） |
| 其他 | `git config --global core.hooksPath` = `~/dotfiles/git/hooks`；`git status` 只有已知的未 commit 目錄 `docs/wb-secret-formula/`（不讀、不改、不 commit） |
| 中途變動 | 2026-11-20 P8c：`converge` 改由子代理執行（Agent 工具 `general-purpose`，明確指定 Opus），理由是要對照 008 全部文件與程式，主 session 的上下文不夠。主 session 核對子代理的結果。電腦、Skill 版本不變，commit 為 `9586fc7`。2026-11-20 P9 準備：換電腦，從 P9 準備接續（HEAD `65ad502`，`git log -1` 與交接時相同；`scripts/sync-skills.sh --check` 兩邊一致；`core.hooksPath` 有值）。新電腦為 stevedeMac-mini（`Mac14,12`，macOS 27.2.1），repo 路徑 `/Volumes/data/Projects-practice/s-aixbdd-spec-kit`；Node.js 26.8.2（符合 `techstack.md` 的「24 LTS 以上」，沿用）、`uv` 0.12.1、Claude Code 2.1.329、Docker 29.9.3／Compose 5.7.0；模型與 effort 不變。這台電腦沒有 `docs/wb-secret-formula/`，`git status` 乾淨 |
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
| 附加任務（P8t） | tasks（附加模式） | `tasks.md` 檔尾新增 `## Phase 7: Convergence`，T043～T045（T043→G1、T044→G2、T045→G3），未附加缺口 0 | 沒有修改 `convergence.md` 的「處理」欄，G1～G3 都維持「附加任務」 | 沒有 | P8t 檢查點 commit（標題「docs(specs): 附加 008 小變更 small-1 第 1 輪收斂任務 T043～T045」） |

### P8t 附加紀錄

- `pending_gaps.py`：第 1 輪待附加 G1、G2、G3，略過 0；附加後重跑為待附加 0。
- 新 Phase：Phase 7: Convergence，T043～T045。T043 標 `[P]`（只改前端）；T044、T045 都改 `backend/src/jobs/overdueScheduler.ts`，不標 `[P]`。
- 既有測試依賴：搜尋 `updated_by`、`沒有設定或格式不正確`、`odn-badge`、`isWebhookConfigured`。`overdueAuth.test.ts:123`（`updated_by` 為 null）與 `overdueDispatch.test.ts:426`（NS10 只有一次固定 log）讀過命中段落，行為不變，不需要更新測試任務。
- `check_tasks.py`：issues 0、warnings 0。`head -c` 比對附加前備份：既有內容不變。`git status` 只有 `tasks.md` 改變。
- 憲法遵循：讀取 `.agents/constitution/shared.md`（`skills/tasks/tasks.md` 不存在），必須／不得規則全部通過，沒有憲法偏離與未套用規則。
- G2、G3 不屬於本次變更（iter-6 既有的缺口）。使用者沒有改成「不處理」，所以依 Skill 規則附加。
| 實作（P8，Phase 7） | implement | T043～T045 完成 3／3，受阻 0；前端 `index.html`、`OverdueNotificationsView.tsx`，後端 `overdueScheduler.ts`、`notificationConfig.ts` | 沒有 | 沒有 Skill 問題；見 P8 紀錄的決策與觀察 | Phase 7 檢查點 commit（標題「fix(equipment-loan): 收斂 small-1 第 1 輪缺口 G1～G3」） |

### P8 實作紀錄（執行範圍：Phase 7）

- 完成數：範圍內 3／3（全部 45／45）。受阻任務：無。憲法：讀取 `shared.md`，必須／不得規則全部通過，沒有偏離與未套用規則。
- T043（G1）：`frontend/index.html` 的 `:root` 新增 4 個徽章文字色；`.odn-badge-sending／sent／failed／unknown` 改用它們。以暫時啟動的 Vite（5199 埠，驗證後關閉）量 computed style：Light Mode 5.49、6.49、5.30、6.37；Dark Mode 仍為 `--ink`。
- T044（G2）：`overdueScheduler.ts` 的恢復處理、領取與 5 種結果更新都寫 `updated_by = NULL`。以臨時整合測試（驗證後刪除）確認：重送後為管理員 ID，送出程序寫入後為 null。
- T045（G3）：`notificationConfig.ts` 新增 `checkWebhookUrlAtStartup()`，`start()` 開頭呼叫。實際啟動後端 3 次（3199 埠，驗證後關閉）：空白與格式錯誤都只寫固定文字，正確位址沒有警告，後端都能回應。
- Checkpoint：backend `npm run check` 通過、`npm test` 14 檔 76 測試通過；frontend `npm run check` 通過、`npm test` 2 檔 6 測試通過；`npm run test:e2e` 5 個通過（3000、4010、5183 埠驗證後都已關閉）。
- 決策紀錄：
  1. T045：啟動檢查沿用既有的 `readWebhookUrl()` 與「只警告一次」旗標。情況：任務要求啟動時寫 log，且 send 時的行為不變。決定：沒有設定時，警告在啟動時寫一次，之後送出不再重複，直到位址變成合法。理由：`notification/plan.md` §6 規定寫入時機是「啟動時」；既有程式本來就只警告一次，避免每秒的送出程序重複寫 log。影響：只有 `notificationConfig.ts`、`overdueScheduler.ts`；整合測試不呼叫 `start()`，NS10 不受影響。
  2. 執行方式：`implement` 的規則禁止在 SOP 中 commit；runbook 要求每個 Phase 結束 commit。完成報告後，由主 session 依檢查點 commit，不在任務執行中 commit。
- 觀察（不在本次範圍，沒有修改）：同一頁的其他徽章對比也低於 4.5:1：「已歸還」徽章 Light Mode 4.34:1，「借用中」徽章 Dark Mode 3.68:1（白字在 `--primary` `#3B82F6` 上）。本次依 P0s 只改 4 種通知狀態徽章，記為遺留項候選，步驟 12 決定去向。
- 驗證時寫入資料庫的資料：臨時測試與 e2e 結束時都執行 `seedDatabase` 重設，開發資料庫為 demo seed 狀態。PostgreSQL 容器 `equipment-loan-postgres` 保持運行。
| 收斂評估第 2 輪（P8c） | converge | `convergence.md` 第 2 輪：已收斂（附加任務 0、上游缺口 0、不處理 0） | 沒有 | 子代理回報 2 項 Skill 問題，主 session 判斷 1 項成立（見問題 5） | P8c 檢查點 commit（標題「docs(specs): 新增 008 小變更 small-1 第 2 輪收斂評估，已收斂」） |
| 使用者驗證（P9） | — | 「使用者驗證」：啟動方式、情境 V1～V3、F1～F3、R1～R7、重設指令；agent 以 Agent Browser 代跑 | 要求 agent 代跑；依代跑結果回覆「通過」 | 準備時寫錯 3 個預期（R4、R5、重設後要重新登入），代跑時修正；`pg` 警告記為遺留項候選 | 不 commit（步驟 9 沒有檢查點） |
| Skill 表現檢查（P10） | — | 「Skill 表現檢查」表 12 列 | 貼 P10 | Skill 缺陷 3 項（`converge` 問題 2、3、5）；問題 1 為需求缺漏；問題 4 與其他項目沒有問題；程式錯誤 0 | 不 commit（步驟 10 沒有檢查點） |
| Skill 優化（P11） | skill-engineering | `converge` 的範例、SOP 與新增的 `rules/搜尋關鍵字-格式規範.md`；紀錄 `specs/skill-engineering/62-converge-範例樣板與搜尋規則缺漏/` | 見 `rca-report.md`、`blueprint.md` | 驗收的 Sonnet 子代理沒有找到 G1（見流程不足） | `3d2b105`（`fix(converge): ...`） |
| 優化後重跑（P11b） | converge | `convergence.md` 第 3 輪：已收斂（附加任務 0、上游缺口 0、不處理 0） | 貼 P11b | 子代理回報 6 項 Skill 問題候選，主 session 判斷 3 項成立、影響低（見問題 3、5 的 P11b 結果） | 和 P12 檢查點一起 commit |
| 收尾（P12） | — | 本檔「遺留項的去向」「流程不足」「影片素材清單」；runbook 第 5 節 008 列的遺留項 | 貼 P12 | 小變更路徑沒有寫遺留項要記在哪裡（見流程不足） | P12 檢查點 commit |

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

### P8c 第 2 輪紀錄

- 執行方式：和第 1 輪相同，由 Opus 子代理執行，主 session 核對。
- 結果：已收斂，沒有新缺口。前一輪重新確認：G1（`frontend/index.html:25-28`、`OverdueNotificationsView.tsx:637-640`）、G2（`overdueScheduler.ts:45`、`:57`、`:105`、`:119`、`:133`、`:148`、`:158`）、G3（`notificationConfig.ts:50-52`、`overdueScheduler.ts:241`）都已解決。主 session 抽查 `index.html:25-28` 與 `overdueScheduler.ts:241`，內容相符。
- 檢查範圍：和第 1 輪相同，任務改為 45（T001～T045），另加「前一輪缺口 3」列。
- `diff` 備份：只有「輪次」由 1 改為 2，其餘是檔尾新增的第 2 輪。`git status` 只有 `convergence.md` 改變。
- 下一步：依 runbook 小變更路徑第 3 點第 5 步，進入使用者驗證（P9）。

## Skill 表現檢查

| Skill | 預期 | 實際 | 分類（需求缺漏／意圖改變／程式錯誤／Skill 缺陷／沒有問題） | 證據位置 |
|---|---|---|---|---|
| ui-plan（P5b 重跑） | 依本次變更調整 4 種通知狀態徽章的 Light Mode 文字色，其他規劃不變，`check_ui.py` 通過 | 新增 4 個徽章文字色，實測 5.30～6.49:1；`check_ui.py` issues 0；`git diff` 只有 `ui/` 3 個檔案。整份重寫的限制已記在「流程不足」第 1 列，runbook 小變更路徑本來就預期重寫 | 沒有問題 | 本檔「P5b 重跑紀錄」；`.agents/skills/ui-plan/SKILL.md:18-19`、`:45`；runbook 小變更路徑第 3 點第 2 步 |
| ui-plan（問題 1：配色對比低於 WCAG AA） | 文字色與底色的組合符合 WCAG AA 4.5:1 | 修改前 4 種徽章 2.86～4.24:1；006 淺色琥珀文字 3.19:1 | 需求缺漏。理由：① `spec.md`、憲法、`clarify` 都沒有對比需求，`ui-plan` 的 SOP 與兩份規則也沒有承諾對比，Skill 照 SOP 執行，沒有違反自己的規定；② `ui-plan` 已有接收專案規範的位置：Phase 1 步驟 5 讀取 `.agents/constitution/skills/ui-plan/ui-plan.md` 與 `ui-page.md`，Phase 4 步驟 5 逐條驗證，但這兩個檔不存在；③ 對比門檻（AA 或 AAA、套用到哪些元件）是專案的決定，由 `constitution` 寫進上述兩個檔最合適。去向：步驟 12 決定何時用 `constitution` 新增規則 | `.agents/skills/ui-plan/SKILL.md:14`、`:47`；`.agents/constitution/` 只有 `shared.md`、`skills/api-plan/`、`skills/data-plan/`；`.agents/skills/ui-plan/rules/` 搜尋「WCAG」「對比」「contrast」0 筆；本檔「變更來源的複核」；`iter-4.md:107` |
| converge（問題 2：範例缺少 Edge Case 列） | 範例的檢查範圍表和 SOP 一致 | SOP 要求 Edge Case 列，範例沒有；子代理依 SOP 自行補上 | Skill 缺陷 | `.agents/skills/converge/SKILL.md:21`、`:32`；`templates/convergence.example.md` 搜尋「Edge Case」0 筆 |
| converge（問題 3：全目錄搜尋沒有定義關鍵字與排除目錄） | SOP 寫明搜尋的關鍵字來源與要排除的目錄 | SOP 沒寫；子代理自訂主題關鍵字並排除 `node_modules/`、`test-results/` | Skill 缺陷 | `.agents/skills/converge/SKILL.md:22`；`apps/equipment-loan/` 下的 `node_modules/`、`test-results/` |
| converge（問題 4：不讀 api-plan、data-plan 的憲法檔） | 確認是否刻意 | description 明確只列 `shared.md` 與 `skills/implement/code.md`。這兩個檔約束的是 `contracts/` 與 `data/`，由 `analyze` 讀全部憲法檔檢查；`converge` 再拿程式對照 `contracts/`、`data/`，憲法要求已經透過這些文件傳到程式 | 沒有問題（刻意設計） | `.agents/skills/converge/SKILL.md:3`、`:13`；`.agents/skills/analyze/SKILL.md:15` |
| converge（子代理回報：「不處理」的規定互相矛盾） | 樣板、範例與 Rule 3 不矛盾 | Rule 3 只禁止 `converge` 寫「不處理」；「不處理」由使用者確認缺口時手動改寫，所以樣板與範例保留這個計數 | 沒有問題 | `.agents/skills/converge/rules/缺口判定-格式規範.md:83`；`templates/convergence.md:13`；`templates/convergence.example.md:11`、`:53`；runbook `docs/dev/迭代-runbook.md:274` |
| converge（問題 5：已收斂時缺口表的寫法沒有定義） | 樣板或 SOP 規定空的缺口表怎麼寫 | 子代理寫一列「—／本輪沒有缺口」；`tasks` 的 `pending_gaps.py` 把「—」當成一個 G 項目，列進 `skipped` | Skill 缺陷 | `.agents/skills/converge/templates/convergence.md:25-29`；`.agents/skills/converge/SKILL.md:32`；`specs/008-overdue-discord-notification/convergence.md:80-84`；本檔「問題 5」的 `pending_gaps.py` 結果 |
| converge（兩輪的缺口判定） | 找出本次變更與既有缺口，修正後判定已收斂 | 第 1 輪 G1～G3，主 session 抽查行號與內容相符；第 2 輪重新確認 3 項都已解決，已收斂 | 沒有問題 | 本檔「P8c 收斂評估紀錄」「P8c 第 2 輪紀錄」；`specs/008-overdue-discord-notification/convergence.md` |
| tasks（附加模式） | 只把第 1 輪的附加任務寫成檔尾的 Convergence Phase，前面內容不變 | Phase 7 T043～T045 對應 G1～G3；`check_tasks.py` issues 0；`head -c` 比對既有內容不變 | 沒有問題 | 本檔「P8t 附加紀錄」 |
| implement（Phase 7） | 完成 T043～T045，驗證通過才打勾 | 3／3 完成、受阻 0；backend 76 測試、frontend 6 測試、e2e 5 個通過 | 沒有問題 | 本檔「P8 實作紀錄」；commit `4dab6ec` |
| —（P9 準備，runbook 步驟 9 沒有對應的 Skill）：寫錯 3 個預期 | 驗證情境的預期和文件、seed 一致 | R4 寫成顯示「第 1／1 頁」，但 `ui/plan.md:121` 規定只有一頁時不顯示換頁列；R5 寫成固定 3 則，但 `RV-20261108-03` 在台北時間 17:00 以後也逾期，會建立 4 則；重設展示資料後寫成按「重新整理」即可，實際會清除登入狀態。代跑時已修正，程式行為都符合文件 | 沒有問題（不是 Skill 的產出，程式也沒有錯，是 agent 準備時的錯誤） | 本檔「agent 代跑結果」的「代跑時修正的預期」；`specs/008-overdue-discord-notification/ui/plan.md:121`；`apps/equipment-loan/backend/prisma/seed.ts:239` |
| —（後端執行時）：`pg` 的 `DeprecationWarning` | 後端 log 沒有警告 | 管理員登入時出現一次；來源是 Prisma 內部（`@prisma/client-engine-runtime` → `@prisma/adapter-pg` 7.10.1），不是專案程式；功能正常 | 沒有問題（和 small-1 無關，也不是程式和文件不一致）。去向：步驟 12 決定是否記為遺留項（`pg` 9.0 時會失效） | 本檔「agent 代跑結果」的「觀察」；`apps/equipment-loan/backend/package.json`（最後修改 `e683af0`） |

- Skill 缺陷：`converge` 的問題 2、3、5，交給步驟 11。
- 程式錯誤：沒有，不交給第 10 節 B1。
- 意圖改變：沒有。
- 需求缺漏：問題 1，去向在步驟 12 決定（`constitution`）。

## Skill 問題（交給 skill-engineering）

### 問題 1（步驟 10 分類為需求缺漏，不交給 skill-engineering）：ui-plan

- 發生了什麼：`ui-plan` 產出的配色讓文字在柔和底色上的對比低於 WCAG AA 4.5:1，而且 `check_ui.py` 與兩份格式規範都沒有檢查。008 的 4 種通知狀態徽章為 2.86～4.24:1；006 的淺色琥珀文字為 3.19:1。
- 原本預期：Planner 選定的文字色與底色組合可讀，至少符合 WCAG AA，或在回報中標出不符合的組合。
- 證據：`specs/008-overdue-discord-notification/ui/plan.md` 第 2 節（本次修改前的 `--primary`／`--success`／`--danger`／`--pending` 搭配 `-soft` 底色）；`ui/overdue-notifications.html:101-104`（修改前）；`iter-4.md:107`；`.agents/skills/ui-plan/rules/畫面規劃-格式規範.md` 與 `HTML雛形-格式規範.md` 沒有對比規則。
- 影響：低對比在批 7 驗收前才被量出，要另走小變更路徑修正；同一套配色沿用到之後的迭代時會重複發生。
- 分類（步驟 10）：需求缺漏。spec 與憲法都沒有對比需求，`ui-plan` 的 SOP 與規則也沒有承諾對比；`ui-plan` 已會讀取 `.agents/constitution/skills/ui-plan/` 的憲法檔，但該目錄不存在。由 `constitution` 新增 `ui-plan` 的可及性規則，時機在步驟 12 決定。理由見「Skill 表現檢查」。
- 處理結果：不交給 skill-engineering（步驟 10 分類為需求缺漏）。

### 問題 2：converge（範例缺少 Edge Case 列）

- 發生了什麼：SOP Phase 2 步驟 1 把 Edge Case 列為檢查項目，Phase 3 步驟 2 規定檢查範圍表每類一列，但範例的檢查範圍表沒有 Edge Case 列。子代理依 SOP 自行加上。
- 原本預期：範例和 SOP 一致。
- 證據：`.agents/skills/converge/SKILL.md:21`、`:32`；`.agents/skills/converge/templates/convergence.example.md` 搜尋「Edge Case」為 0 筆。
- 影響：照範例填寫的執行者可能漏掉 Edge Case 的計數。
- 處理結果：已由 `skill-engineering` 優化，commit `3d2b105`；紀錄 `specs/skill-engineering/62-converge-範例樣板與搜尋規則缺漏/`（`rca-report.md`、`blueprint.md`）。根因 R1（缺失）：範例的檢查範圍表缺少 SOP 要求的 Edge Case 列。修改：`templates/convergence.example.md` 兩輪檢查範圍表各加 Edge Case 一列，骨架不變。重跑結果（Sonnet medium 子代理，`git worktree` 暫存複本，`9586fc7`）：S1 的檢查範圍表有 Edge Case 13 列。
- P11b 重跑結果（2026-11-20，Agent 工具 `general-purpose` 子代理，明確指定 Opus，HEAD `3d2b105`，主 session 核對）：`convergence.md` 新增第 3 輪，已收斂（附加任務 0、上游缺口 0、不處理 0）。檢查範圍表有 Edge Case 列（13 項）。和重跑前比：第 1、2 輪的 Edge Case 列是子代理依 SOP 自行補上的；這次範例已有這一列，照範例填寫就有。`diff` 備份：只有「輪次」由 2 改為 3，其餘是檔尾新增的第 3 輪（第 92～128 行），前兩輪不變；`git status` 只多了 `convergence.md`，本紀錄檔的既有修改沒有被改動。

### 問題 3：converge（全目錄關鍵字搜尋沒有定義關鍵字與排除目錄）

- 發生了什麼：Phase 2 步驟 2 要以 `grep -rln` 在 Source Code 根目錄搜尋「每個檢查項目的關鍵字」，但沒有定義約 190 個項目的關鍵字來源，也沒有排除 `node_modules/`、`test-results/`。子代理改用主題關鍵字（overdue、discord、webhook、逾期），並排除這些目錄。
- 原本預期：SOP 寫明關鍵字來源與排除的目錄。
- 證據：`.agents/skills/converge/SKILL.md:22`；`apps/equipment-loan/` 下有 `node_modules/`、`test-results/`。
- 影響：不同執行者的搜尋範圍不同，找到的「未要求」缺口可能不同。
- 處理結果：已由 `skill-engineering` 優化，commit `3d2b105`；紀錄 `specs/skill-engineering/62-converge-範例樣板與搜尋規則缺漏/`（`rca-report.md`、`blueprint.md`）。根因 R2（缺失）：SOP 沒有寫關鍵字來源與排除方式；第 1 輪補上的來源沒有區分本次新增與前幾版既有介面，S1 選出 141 個關鍵字、命中 63 個檔案，子代理自訂篩選（R2-2，返回 Phase 2 後修正）。修改：Phase 2 步驟 3 改用 `git grep -l --untracked`（依 `.gitignore` 排除依賴與建置產出）；新增步驟 2 載入 `rules/搜尋關鍵字-格式規範.md`（Rule 1 只取本次新增介面，Rule 2 只取本次專屬的程式識別字），步驟 6 逐條驗證；Phase 3 步驟 4 回報關鍵字與所屬介面。重跑結果（Sonnet medium 子代理，`9586fc7`，另放入 `node_modules/`、`test-results/`）：41 個關鍵字都屬於 008 新增介面，在前五版程式中都沒有出現；`git grep` 命中 26 個檔案；程式範圍沒有 `node_modules/`、`test-results/`。子代理回報 2 個 RuleFile 沒有寫到的邊界（同時標出新增與既有介面的任務、路徑內的模組名稱），不影響本次結果，記在 `blueprint.md` 的調整建議。
- P11b 重跑結果（同問題 2 的 P11b 重跑）：子代理回報 38 個搜尋關鍵字並列出所屬介面：F1、F2、B1～B3、D1、S1～S3、N1～N2，都是 008 的新增介面，沒有取既有介面 F4、B4、D2（F3 沒有專屬關鍵字，B3 的 `runOverdueCheck` 等字也用在 F3 的 T027～T029）。主 session 以同一組關鍵字重跑 `git grep -l --untracked -F ... -- apps/equipment-loan/`：命中 26 個檔案，沒有 `node_modules/`、`test-results/`；在前五版程式 `c7c2ac6` 命中 0 個。26 個檔案都已在程式範圍內，沒有加入新檔案。和重跑前比：第 1 輪用自訂的主題關鍵字（overdue、discord、webhook、逾期）與 `grep -rln`，手動排除依賴目錄，沒有列出關鍵字與所屬介面；這次依 `rules/搜尋關鍵字-格式規範.md` 選字，`.gitignore` 自動排除依賴與建置產出，回報列出關鍵字與介面。和驗收 S1（Sonnet，41 個關鍵字）比，關鍵字數量不同，命中檔案數相同（26 個）。
- P11b 子代理回報的 Skill 問題候選（主 session 判斷，本步不修改 Skill）：
  1. 任務的介面編號標在分組標題，一個標題涵蓋多個介面；T043～T045 沒有標介面編號（`rules/搜尋關鍵字-格式規範.md:4`）：和 `blueprint.md:371` 的邊界 ① 同類，已有紀錄，不影響本輪結果。
  2. Must Read／Optional 參考行算不算「任務內」沒有寫明（`rules/搜尋關鍵字-格式規範.md:4`）：成立，影響低。選字可能不同，命中檔案相同。
  3. CSS class、`data-testid`、HTTP 標頭名稱不在識別字類別內（`rules/搜尋關鍵字-格式規範.md:28`）：不成立。Rule 2 已列出允許的類別，不在清單內就不取；子代理刪掉 `odn-refresh-line`、`overdue-refreshing` 後重跑，符合規則。
  4. 沒有規定要取全部合格的識別字，還是可以只取一部分（`SKILL.md:23`）：成立，影響低。S1 取 41 個、本輪取 38 個，命中檔案都是 26 個。
  5. 樣板沒有位置記錄搜尋關鍵字（`SKILL.md:33`、`templates/convergence.md:21`）：不成立。Phase 3 步驟 4 規定把關鍵字回報給使用者，不寫進 `convergence.md` 是現有設計；下一輪依 RuleFile 重新選字。
  - 去向：第 2、4 項在步驟 12 決定是否記為遺留項。

### 問題 4（步驟 10 分類為沒有問題，不交給 skill-engineering）：converge（其他 Skill 的憲法檔不在讀取範圍，待確認是否刻意）

- 發生了什麼：SOP 只讀 `shared.md` 與 `skills/implement/code.md`。`.agents/constitution/skills/` 另有 `api-plan/openapi.md`、`data-plan/data-model.md`，程式違反它們時 converge 不會發現。
- 原本預期：SOP 寫明這兩個檔要不要納入。
- 證據：`.agents/skills/converge/SKILL.md:13`；`.agents/constitution/skills/` 底下有 `api-plan`、`data-plan`。
- 影響：可能是刻意設計（這兩個檔約束的是 Planner 產出，由 `analyze` 檢查）。步驟 10 再判斷。
- 分類（步驟 10）：沒有問題。`converge` 的 description（`SKILL.md:3`）明確只列 `shared.md` 與 `skills/implement/code.md`；`analyze`（`SKILL.md:15`）讀全部憲法檔檢查 `contracts/`、`data/`，`converge` 再拿程式對照這些文件。
- 處理結果：不交給 skill-engineering（步驟 10 分類為沒有問題）。

子代理另回報「樣板的結果欄位有『不處理 N』，但 Rule 3 禁止寫『不處理』」。主 session 判斷不成立：「不處理」由使用者在確認缺口時手動改寫（runbook 步驟 8c），converge 本身不寫，所以樣板保留這個計數是合理的。

### 問題 5：converge（已收斂時缺口表的寫法沒有定義）

- 發生了什麼：第 2 輪沒有缺口，但 SOP 與樣板都沒有規定空的缺口表要怎麼寫，範例也沒有「已收斂」的輪次。子代理保留表頭，放一列「本輪沒有缺口」。
- 原本預期：樣板或 SOP 規定已收斂時缺口表的寫法。
- 證據：`.agents/skills/converge/templates/convergence.md:25-29` 只有 `{{GAP_ROWS}}`；`.agents/skills/converge/SKILL.md:32` 只規定結果寫「已收斂」與下一步；`specs/008-overdue-discord-notification/convergence.md` 第 2 輪缺口表。
- 影響：不同執行者寫法不同，讀取 `convergence.md` 的腳本會把那一列當成缺口：主 session 實跑 `tasks` 的 `pending_gaps.py`，`skipped` 出現 `{'id': '—', 'handling': '—', 'reason': '處理不是附加任務'}`。這次沒有造成錯誤，但「—」被當成一個 G 項目。
- 處理結果：已由 `skill-engineering` 優化，commit `3d2b105`；紀錄 `specs/skill-engineering/62-converge-範例樣板與搜尋規則缺漏/`（`rca-report.md`、`blueprint.md`）。根因 R3（缺失）：SOP 與樣板沒有定義空缺口表的寫法。修改：Phase 3 步驟 2 規定「缺口清單」為空時缺口表只保留表頭與分隔線，步驟 3 檢查資料列和「缺口清單」一一對應。重跑結果（Sonnet medium 子代理，`4dab6ec`）：S2 第 2 輪已收斂，缺口表只有表頭與分隔線，`pending_gaps.py` 的 `pending`、`skipped` 都是 `[]`。
- P11b 重跑結果（同問題 2 的 P11b 重跑）：第 3 輪已收斂，缺口表只有表頭與分隔線，沒有資料列；重跑前的第 2 輪是一列「—／本輪沒有缺口」。主 session 實跑 `pending_gaps.py`：`round` 為 3，`pending`、`skipped` 都是 `[]`，不再出現「—」項目。
- P11b 子代理另回報候選：前一輪沒有缺口時，「前一輪缺口的重新確認」段的寫法沒有定義（`SKILL.md:33`、`templates/convergence.md:23`），子代理寫一句「第 2 輪沒有缺口，本輪沒有要重新確認的項目」。主 session 判斷成立，影響低：`pending_gaps.py` 不讀這一段，結果不受影響。去向在步驟 12 決定是否記為遺留項。

第 2 輪子代理再次回報「『不處理』的規定互相矛盾」，並補充 `convergence.example.md:11`、`:53` 也有「不處理 0」。主 session 維持第 1 輪的判斷：「不處理」由使用者確認缺口時手動改寫（runbook 步驟 8c），converge 不寫，Rule 3 只約束 converge，三份文件沒有矛盾。步驟 10 若要再確認，可把這一點列入。

## 使用者驗證

### 準備（P9 第一段，2026-11-20）

#### 準備時的自我確認（agent 做的，不代替使用者驗證）

1. 啟動 Docker Desktop，`docker compose up -d --wait`、`npm run db:migrate`（沒有待套用的 migration）、`npm run db:seed` 都成功。seed 後 `overdue_notifications` 為 `sent`、`failed`、`unknown` 各 1 則，`updated_by` 都是空值。
2. 這台電腦的 `backend/.env` 只有 `DATABASE_URL` 與 `PORT`，沒有 `DISCORD_WEBHOOK_URL` 與兩個 `OVERDUE_*` 設定。不補上時，後端啟動就會出現 T045 的警告，通知會送出失敗。所以啟動方式第 2 步要先補 `.env`。
3. 以臨時埠（後端 3299、模擬器 4299）確認 V2 的觀察法：模擬器設 `rate_limit`、`failTimes:1` 時，第 1 則重送的通知收到 429 後，送出程序暫停；暫停期間重送的第 2 則維持「送出中」，`updated_by` 是管理員 ID；暫停結束後兩則都變成 `sent`，`updated_by` 都是空值。
4. 以臨時埠 3298 啟動後端 4 次，確認 T045 的 log：`DISCORD_WEBHOOK_URL` 空白、`not-a-url`、只讀這台電腦的 `.env`（沒有這個設定），都只出現固定文字「DISCORD_WEBHOOK_URL 沒有設定或格式不正確」，不出現輸入值；設為模擬器位址時沒有警告。4 次後端都能回應。
5. 臨時程序都已關閉（3298、3299、4299 沒有程序在監聽），並再跑一次 `npm run db:seed`，資料庫回到 demo seed 狀態。PostgreSQL 容器保持運行。

#### 啟動方式（從乾淨環境開始）

全部指令都在 `apps/equipment-loan/` 執行。

1. 開啟 Docker Desktop，等它就緒。
2. 安裝依賴，並建立與補齊 `backend/.env`（已有的設定不會被覆寫）：

   ```bash
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   cp -n backend/.env.example backend/.env || true
   grep -q '^DISCORD_WEBHOOK_URL=' backend/.env || grep '^DISCORD_WEBHOOK_URL=' backend/.env.example >> backend/.env
   grep -q '^OVERDUE_AUTO_CHECK_ENABLED=' backend/.env || echo 'OVERDUE_AUTO_CHECK_ENABLED=false' >> backend/.env
   grep -q '^OVERDUE_CHECK_INTERVAL_SECONDS=' backend/.env || echo 'OVERDUE_CHECK_INTERVAL_SECONDS=60' >> backend/.env
   ```

3. 確認 `backend/.env` 的 `DISCORD_WEBHOOK_URL` 是模擬器位址 `http://127.0.0.1:4010/api/webhooks/000000000000000000/simulator-token`，`OVERDUE_AUTO_CHECK_ENABLED` 是 `false`。理由：自動檢查會在 R3 之前先為 3 筆逾期借用建立通知（README 7.3 第 4 點）。已經是 `true` 時，本次驗證期間改成 `false`。
4. 啟動資料庫，套用 migration，重設展示資料：

   ```bash
   docker compose up -d --wait
   npm run db:migrate
   npm run db:seed
   ```

5. 開 3 個終端機，各執行一個：

   ```bash
   # 終端機 A：Discord Webhook 模擬器（127.0.0.1:4010）
   npm --prefix backend run discord:sim

   # 終端機 B：後端（http://localhost:3000/api）
   npm --prefix backend run dev

   # 終端機 C：前端（預設 http://localhost:5173）
   npm --prefix frontend run dev
   ```

6. 準備時 5173 埠沒有程序占用。5173 被占用時，Vite 會改用下一個埠，請用終端機 C 印出的網址。下面情境的「前端網址」都指這個網址。
7. 用一般視窗登入成員林雅婷（`lin.yating`／`Member@2026`），用無痕視窗登入管理員吳承翰（`wu.chenghan`／`Admin@2026`）。可按登入頁的「預建展示帳號快速帶入」。管理員登入後先進入「設備狀態管理」，再切到「逾期通知紀錄」頁籤。
8. 切換 Light／Dark Mode：按頁首右側的「深色模式」／「淺色模式」按鈕。

查資料庫的指令（V2、F2 使用；容器內使用者是 `postgres`）：

```bash
docker exec equipment-loan-postgres psql -U postgres -d equipment_loan -c "SELECT r.reservation_no, n.status, n.updated_by, n.next_attempt_at FROM overdue_notifications n JOIN reservations r ON r.id = n.reservation_id ORDER BY r.reservation_no;"
```

吳承翰的使用者 ID 是 `11111111-1111-4111-8111-111111111103`。

#### 重設展示資料

```bash
npm run db:seed
```

- 重設後的 3 則通知：`RV-20261110-20`（`EQ-101`）送出成功、`RV-20261110-21`（`EQ-102`）送出失敗、`RV-20261110-22`（`EQ-103`）結果不明，`updated_by` 都是空值。另有 3 筆還沒有通知的逾期借用：`RV-20261107-05`、`RV-20261109-19`、`RV-20261110-23`。
- 後端執行中也可以重設。重設會清除登入狀態：重設後兩個視窗都要先按「登出」，再重新登入。
- 每個情境開始前都先重設，除非情境寫明接著上一個情境做。

#### 驗證情境

徽章顏色的預期值（ui/plan.md 第 2 節）：

| 徽章 | Light Mode 文字色（computed `color`） | Light Mode 對比 | Dark Mode 文字色 | Dark Mode 對比 |
|---|---|---|---|---|
| 送出中 | `#1d4ed8`（`rgb(29, 78, 216)`），底色 `#dbeafe` | 5.49:1 | `#f8fafc`（`rgb(248, 250, 252)`） | 9.90:1 |
| 送出成功 | `#166534`（`rgb(22, 101, 52)`），底色 `#dcfce7` | 6.49:1 | 同上 | 8.71:1 |
| 送出失敗 | `#b91c1c`（`rgb(185, 28, 28)`），底色 `#fee2e2` | 5.30:1 | 同上 | 9.58:1 |
| 結果不明 | `#92400e`（`rgb(146, 64, 14)`），底色 `#fef3c7` | 6.37:1 | 同上 | 8.67:1 |

量測方式：在徽章上按右鍵 →「檢查」，看 Computed 的 `color` 與 `background-color`；或在 Styles 面板點色塊，看 Contrast ratio 是否有 AA 的勾。

**成功操作**

| 編號 | 操作步驟 | 預期結果 |
|---|---|---|
| V1 3 種結果徽章的 Light Mode | 1. 重設展示資料。<br>2. 管理員視窗切到 Light Mode，打開「逾期通知紀錄」。<br>3. 檢查 `RV-20261110-20`、`-21`、`-22` 的徽章。 | 1. 「送出成功」「送出失敗」「結果不明」的文字色與底色符合上表 Light Mode 欄。<br>2. DevTools 的對比都在 4.5:1 以上（AA 打勾）。<br>3. 肉眼看文字清楚，比底色深很多。 |
| V1d 3 種結果徽章的 Dark Mode | 1. 接著 V1，按「深色模式」。<br>2. 檢查同樣 3 個徽章。 | 1. 3 個徽章的文字色都是 `#f8fafc`，底色是深色。<br>2. 和本次修改前一樣，對比符合上表 Dark Mode 欄。 |
| V2 「送出中」徽章與 T044（`updated_by`） | 1. 重設展示資料。<br>2. 另開終端機，讓模擬器第 1 次回 429、等 45 秒：<br>`curl -X PUT http://127.0.0.1:4010/__sim/mode -H 'Content-Type: application/json' -d '{"mode":"rate_limit","retryAfterSeconds":45,"failTimes":1}'`<br>3. 管理員對 `RV-20261110-21`（送出失敗）按「重送」。<br>4. 接著對 `RV-20261110-22`（結果不明）按「重送」，在確認視窗按「已確認沒收到，重送」。<br>5. 在 45 秒內執行上方的查資料庫指令。<br>6. 在 45 秒內按「重新整理」，用 Light Mode 與 Dark Mode 各檢查一次兩則的「送出中」徽章。<br>7. 從第 3 步算起等 50 秒以上，按「重新整理」，再查一次資料庫。 | 1. 第 3、4 步後頁頂顯示「已重新送出 … 的通知，目前為「送出中」」。<br>2. 第 5 步：`RV-20261110-21` 是 `sending`、`updated_by` 空值（送出程序已處理一次，收到 429）；`RV-20261110-22` 是 `sending`、`updated_by` 是吳承翰的 ID（只有管理員重送寫入）。<br>3. 第 6 步：兩則都是「送出中」徽章，Light Mode 文字 `#1d4ed8`、底色 `#dbeafe`、藍色邊框，Dark Mode 文字 `#f8fafc`，都清楚可讀。<br>4. 第 7 步：兩則都變成「送出成功」，`updated_by` 都是空值。<br>5. 終端機 B 沒有出現 Webhook 位址。 |
| V3 T045：位址正確時沒有警告 | 1. 看終端機 B 啟動後端時的輸出。 | 1. 只出現 `Equipment loan backend listening on http://localhost:3000/api`，沒有「DISCORD_WEBHOOK_URL 沒有設定或格式不正確」。 |

**關鍵失敗**

| 編號 | 操作步驟 | 預期結果 |
|---|---|---|
| F1 T045：位址空白 | 1. 在終端機 B 按 Ctrl+C 停止後端。<br>2. 用空白位址啟動：`DISCORD_WEBHOOK_URL= npm --prefix backend run dev`（真實環境變數優先於 `.env`，不用改檔案）。<br>3. 看終端機 B 的輸出。<br>4. 管理員重新整理「逾期通知紀錄」。 | 1. 啟動輸出有一行「DISCORD_WEBHOOK_URL 沒有設定或格式不正確」，只出現一次，沒有任何位址或輸入值。<br>2. 後端照常啟動，頁面能載入清單。 |
| F2 T045：位址格式錯誤，通知送出失敗 | 1. 重設展示資料。停止後端，用錯誤格式啟動：`DISCORD_WEBHOOK_URL=not-a-url npm --prefix backend run dev`。<br>2. 看終端機 B 的輸出。<br>3. 管理員對 `RV-20261110-21` 按「重送」，等 2 秒後按「重新整理」。<br>4. 用 Light Mode 與 Dark Mode 檢查這則的徽章與失敗原因。<br>5. 查資料庫。 | 1. 啟動輸出有固定文字警告，沒有出現 `not-a-url`。<br>2. `RV-20261110-21` 變回「送出失敗」，顯示「失敗原因：通知設定有誤：沒有設定」。<br>3. 「送出失敗」徽章在兩種模式的顏色符合上表。<br>4. 資料庫中這則是 `failed`、`updated_by` 空值。<br>5. 終端機 B 的後續 log 不再重複警告。 |
| F3 收尾 | 1. 停止後端，用 `npm --prefix backend run dev` 重新啟動（讀回 `.env` 的模擬器位址）。<br>2. 重設展示資料。 | 1. 啟動輸出沒有警告（同 V3）。 |

**前幾次功能的回歸**

| 編號 | 操作步驟 | 預期結果 |
|---|---|---|
| R1 登入與頁籤 | 1. 重設展示資料。<br>2. 兩個視窗各自登入。<br>3. 管理員依序點「設備狀態管理」「審核與借用管理」「逾期通知紀錄」等頁籤。<br>4. 成員點「設備預約」「我的預約」。 | 1. 每個頁籤都能載入，沒有錯誤訊息。<br>2. 管理員登入後先進入「設備狀態管理」。 |
| R2 成員不能看通知紀錄 | 1. 成員視窗點「逾期通知紀錄」。 | 1. 顯示權限不足的畫面，看不到通知清單。 |
| R3 篩選 | 1. 管理員在「通知狀態」依序選「送出成功」「送出失敗」「結果不明」「送出中」「全部」。 | 1. 前 3 個各顯示 1 則。<br>2. 「送出中」顯示「目前沒有「送出中」的通知」與「顯示全部通知」。<br>3. 「全部」顯示 3 則。 |
| R4 換頁列 | 1. 看清單下方。 | 1. 不顯示換頁列。demo seed 只有 3 到 7 則，少於每頁 20 則；只有一頁時不顯示換頁列（`ui/plan.md:121`）。 |
| R5 立即檢查逾期 | 1. 管理員按「立即檢查逾期」。<br>2. 等 2 秒後按「重新整理」。<br>3. 再按一次「立即檢查逾期」。 | 1. 第 1 次：台北時間 17:00 前顯示「這次建立 3 則逾期通知」，清單多出 `RV-20261107-05`、`RV-20261109-19`、`RV-20261110-23`；17:00 以後是「這次建立 4 則逾期通知」，另多出林雅婷今天下午 13:00–17:00 借用中的 `RV-20261108-03`。重新整理後新的通知都是「送出成功」。<br>2. 第 2 次顯示「沒有新的逾期借用」。<br>3. 終端機 A 的模擬器收到的訊息數和第 1 次建立的則數相同。 |
| R6 重送「結果不明」的確認視窗 | 1. 重設展示資料，重新整理。<br>2. 對 `RV-20261110-22` 按「重送」。<br>3. 在確認視窗按「取消」。 | 1. 確認視窗標題是「重送「結果不明」的通知？」，有「請先到 Discord 確認」的說明，按鈕是「取消」與「已確認沒收到，重送」。<br>2. 取消後這則仍是「結果不明」。 |
| R7 其他徽章與元件沒有變 | 1. 在 Light Mode 與 Dark Mode 檢查「借用中」「已歸還」徽章、失敗原因列、送出時間列與按鈕。 | 1. 顏色和本次修改前相同（本次只改 4 種通知狀態徽章的文字色）。<br>2. 已知遺留項候選：「已歸還」徽章 Light Mode 4.34:1、「借用中」徽章 Dark Mode 3.68:1，本次不處理，不算不通過。 |

#### 驗證後

1. 停止終端機 A、B、C 的程序（Ctrl+C）。
2. 執行 `npm run db:seed`，讓資料庫回到 demo seed 狀態。
3. `OVERDUE_AUTO_CHECK_ENABLED` 原本是 `true` 時，改回 `true`。

### agent 代跑結果（Agent Browser，2026-11-20 20:11～20:16，HEAD `65ad502`；不是使用者驗證）

使用者要求 agent 用 Agent Browser 代跑上面的情境。agent 照「啟動方式」啟動（5173 沒有被占用），用 2 個瀏覽器 session 分別登入吳承翰與林雅婷。

- 結果：V1、V1d、V2、V3、F1～F3、R1～R7 都符合預期。量測值和「徽章顏色的預期值」表相同（Light 5.49／6.49／5.30／6.37，Dark 9.90／8.71／9.58／8.67）。
- V2：重送後 45 秒內，`RV-20261110-21` 是 `sending`、`updated_by` 為空值；`RV-20261110-22` 是 `sending`、`updated_by` 為 `11111111-1111-4111-8111-111111111103`。暫停結束後，兩則都是 `sent`、`updated_by` 為空值。後端 log 沒有出現 Webhook 位址。
- F1、F2：啟動 log 只有一行固定文字，沒有輸入值。F2 重送後是 `failed`／`webhook_not_configured`，畫面顯示「失敗原因：通知設定有誤：沒有設定」。
- R7：`git diff 4dab6ec~1 HEAD -- apps/equipment-loan/frontend` 只有 4 個徽章文字色變數與 4 條 `.odn-badge-*` 規則。「借用中」徽章、失敗原因列、送出時間列的顏色仍用原本的變數。demo 資料沒有已歸還的通知，所以畫面上量不到「已歸還」徽章。
- 代跑時修正的預期（agent 寫錯，程式沒有錯）：
  1. R4：只有一頁時不顯示換頁列（`ui/plan.md:121`）。原本寫成會顯示「第 1／1 頁」。
  2. R5：台北時間 17:00 以後會建立 4 則。`RV-20261108-03` 是今天下午 13:00–17:00 的借用中預約，17:00 以後也算逾期。原本寫成固定 3 則。
  3. 重設展示資料會清除登入狀態，重設後要重新登入。原本寫成按「重新整理」就可以。
- 觀察（不在本次範圍，遺留項候選）：後端 log 有 `pg` 的 `DeprecationWarning: Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0`。這是警告，不是錯誤，功能正常。用 `NODE_OPTIONS=--trace-deprecation` 重跑後確認：
  - 觸發時機是管理員登入與載入第一個頁面，不是處理通知。只查通知清單、只送出通知時都不會出現。Node 每個程序只印一次。
  - 呼叫來源是 Prisma 內部（`@prisma/client-engine-runtime` 的 `query-interpreter.ts:515` `#withChunkTransaction` → `@prisma/adapter-pg` 7.10.1 `PgTransaction.queryRaw`），不是專案程式。專案程式沒有使用 `$transaction`。
  - 和 small-1 無關：本次沒有改登入、Prisma 或依賴版本。`backend/package.json` 最後一次修改是 `e683af0`（迭代 6 Phase 1）。
  - 風險：`pg` 升到 9.0 時這種用法會失效。目前 `pg` 是 8.23.1。去向在步驟 12 決定。
- 收尾：3000、4010、5173 的程序與 2 個瀏覽器 session 都已關閉，資料庫已重設為 demo seed。這台電腦的 `backend/.env` 保留啟動方式第 2 步補上的 3 行。`OVERDUE_AUTO_CHECK_ENABLED` 原本沒有設定（預設 `true`），現在是 `false`。

### 結果（P9 第二段，使用者回報後填寫）

- commit SHA：`65ad502`（驗證時的 HEAD；small-1 的程式在 `4dab6ec`，之後只有文件 commit）
- 情境與結果：通過。V1、V1d、V2、V3、F1～F3、R1～R7 由 agent 以 Agent Browser 代跑，結果見上方「agent 代跑結果」。使用者依代跑結果判定通過，沒有親自操作畫面。
- 使用者回饋：
  1. 回覆「通過」。
  2. 回覆寫法不清楚：結論埋在中間、範圍外的內容太多、停下來時不知道要做什麼。已改善：`CLAUDE.md`「回答方式」加上金字塔結構，`scripts/hooks/answer-style.sh` 與 `scripts/hooks/auto-clarify.sh` 改成同樣的規則。這不屬於本次迭代，還沒 commit。（之後已 commit：`e1d22ab`）

## 遺留項的去向（P12）

本檔寫明「步驟 12 決定去向」的項目，去向如下。都記進 runbook 第 5 節 008 列的「遺留項」，前面標「small-1：」（理由見「流程不足」最後一列）。

1. 問題 1（`ui-plan` 配色對比，需求缺漏）→ 用 `constitution` 新增 `.agents/constitution/skills/ui-plan/` 的對比規則。門檻（AA 或 AAA）與套用的元件由使用者決定，在下一次迭代的步驟 1 處理。
2. 同一頁其他徽章的對比（P8 紀錄的觀察：「已歸還」Light Mode 4.34:1、「借用中」Dark Mode 3.68:1）→ 第 1 項的規則確定後，以小變更路徑（`ui-plan`）處理，和第 5 節第 4 列的淺色琥珀文字一起處理。
3. `pg` 的 `DeprecationWarning`（agent 代跑結果的觀察）→ 現在不處理。來源是 Prisma 內部，功能正常；升級 `pg` 到 9.0 或升級 Prisma 之前要先處理。
4. 問題 3 的 P11b 候選第 2、4 項（Must Read／Optional 參考行算不算「任務內」、要不要取全部合格的識別字）與問題 5 的 P11b 候選（前一輪沒有缺口時「前一輪缺口的重新確認」段的寫法）→ 下次用 `skill-engineering` 優化 `converge` 時一起處理，和 `specs/skill-engineering/62-converge-範例樣板與搜尋規則缺漏/blueprint.md:371` 的調整建議合併。三項都不影響本次結果。

## 流程不足

| 步驟 | 問題 | 影響 | 試過的優化 |
|---|---|---|---|
| P5b | `ui-plan` 只有整份重寫模式：同意覆寫後依樣板重寫 `ui/plan.md` 與所有 HTML，Phase 4 第 3 步還會刪除不在頁面清單的 HTML。小變更只要改 4 條 CSS 與配色表，SOP 沒有「只改指定部分」的做法 | 重寫時可能動到不相關的規劃；負責介面填少了會刪掉其他介面的內容（準備時已改填 F1～F4） | 本次重寫時保留原內容，只改相關段落，並以 `git diff` 確認範圍。runbook 已修改（批 7 收尾）：小變更路徑第 3 點第 2 步與 P0s 第 3 項寫明「負責介面」填 Planner 負責的全部介面。整份重寫是 `ui-plan` 本身的限制，不修改 Skill |
| P8c | 小變更的 `converge` 對照整個 spec 目錄，所以前幾次迭代留下的缺口也會出現（G2、G3 是 iter-6 的既有缺口）。小變更路徑沒有寫這類缺口要在本次處理，還是改為「不處理」 | 小變更的範圍變大：多改 2 個後端檔案，多一個 Phase 與一輪 `converge` | 使用者沒有把 G2、G3 改為「不處理」，依 Skill 規則附加並處理。runbook 已修改（批 7 收尾）：小變更路徑第 3 點第 3 步寫明既有缺口二選一（本次處理，或改為「不處理」並記為第 5 節遺留項），缺口表加「和本次變更的關係」欄 |
| P8c、P11 | runbook 沒有規定 `converge` 用哪個模型。主 session 的上下文不夠，改由子代理執行；本機子代理預設是 Sonnet | `converge` 優化的驗收中，Sonnet 子代理（S1 與基準對照）兩次都沒有找到 G1（`blueprint.md:211`）。用 Sonnet 跑正式 P8c 會漏判 | 正式 P8c 的 3 輪都由明確指定 Opus 的子代理執行，主 session 核對（本檔「中途變動」）。runbook 已修改（批 7 收尾）：步驟 8c 第 3 點與 P8c 提示詞規定用和主 session 相同等級的模型，委派時明確指定，不用 Sonnet |
| P9 | 準備驗證情境時，沒有逐項對照 `ui/plan.md` 與 seed 寫預期 | 寫錯 3 個預期（R4、R5、重設後要重新登入）。使用者照著做時，會把正確的行為判為不通過 | 代跑時發現並修正（本檔「代跑時修正的預期」）。runbook 已修改（批 7 收尾）：步驟 9 第 1 點與 P9 提示詞第 2 項要求預期結果附依據位置、時間條件與重設後是否要重新登入 |
| 12（小變更路徑） | runbook 小變更路徑第 3 點第 5 步規定步驟 12 不在第 5 節新增列，但沒有寫本次的遺留項要記在哪裡 | 遺留項不在第 5 節時，下一次迭代的步驟 0 讀不到 | 本次記在 008 列的「遺留項」，前面標「small-1：」。runbook 已修改（批 7 收尾）：小變更路徑第 3 點第 5 步寫明遺留項記在目標 spec 目錄那一列並標「small-<序號>：」；P12 提示詞加上更新第 5 節的一項 |

## 影片素材清單

| 要證明什麼 | 證據路徑 | commit SHA | 重現步驟 | 只能當下保存？ |
|---|---|---|---|---|
| 小變更路徑走完一輪：`ui-plan` 調色 → `converge` 第 1 輪找到 G1～G3 → `tasks` 附加 T043～T045 → `implement` → 第 2 輪已收斂 | `specs/008-overdue-discord-notification/convergence.md` 第 1、2 輪；`tasks.md` Phase 7；本檔「步驟紀錄」 | `9586fc7`、`05fe183`、`f947b9c`、`4dab6ec`、`374763a` | 依序 `git show` 這 5 個 commit，對照第 1 輪缺口表與第 2 輪「前一輪缺口的重新確認」 | 否 |
| 4 種通知狀態徽章的 Light Mode 對比由 2.86～4.24:1 提高到 5.30～6.49:1 | `specs/008-overdue-discord-notification/ui/overdue-notifications.html`；本檔「變更來源的複核」「P5b 重跑紀錄」 | 修改前 `9586fc7^`，雛形 `9586fc7`，程式 `4dab6ec` | 以 `git show 9586fc7^:specs/008-overdue-discord-notification/ui/overdue-notifications.html` 取出修改前的雛形，和現在的雛形各開一次，在 DevTools 看徽章的 Contrast ratio | 否 |
| `skill-engineering` 優化 `converge` 前後的差異：空缺口表、搜尋關鍵字只取本次新增介面 | `convergence.md` 第 2 輪（缺口表有一列「—」）與第 3 輪（只有表頭與分隔線）；`specs/skill-engineering/62-converge-範例樣板與搜尋規則缺漏/`；本檔問題 2、3、5 的 P11b 結果 | `3d2b105`；第 3 輪在 P12 檢查點 commit | 以 `.agents/skills/tasks/scripts/pending_gaps.py` 分別讀 `374763a` 與現在的 `convergence.md`：前者 `skipped` 有「—」，後者 `pending`、`skipped` 都是 `[]` | 否 |
