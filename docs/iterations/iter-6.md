# 迭代 6：逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查（通知迭代）

- spec 目錄：`specs/008-overdue-discord-notification`
- 上一次 spec 目錄：`specs/007-equipment-maintenance-retire`
- 本次功能：runbook 9.3「通知迭代」列（6 次路徑第 6 次）
- 執行者：Claude Code＋Opus 5.5（runbook 第 6 節第 6 點：第 5 次迭代起全部改由 Claude Code 執行）
- 開始／結束：2026-11-10／（未結束）
- A/B 流程：依 runbook 第 8 節。步驟 2～5 commit 後，從同一個 commit 建 A、B 兩組 git worktree；A/B 要在同一台電腦做完

## 固定環境

| 項目 | 值 |
|---|---|
| 電腦 | steve的Mac mini（`Mac14,12`，macOS 27.0.1）。第 5 次迭代在 steve-10（MacBook Pro）完成，本次換電腦，從第 6 次迭代步驟 0 開始（`git pull` 後 `main` 與 `origin/main` 一致，`git log -1` 為 `89c7d3d`） |
| 執行工具與版本 | Claude Code 2.1.322（主 session）；`uv` 0.12.1；Node.js 26.8.2（`techstack.md` 與 `backend/package.json` 要求 24 以上，符合；iter-5 用 24.14.1）；Docker 29.9.2、Docker Compose v5.6.1 |
| 模型與 effort | Opus 5.5（`claude-opus-5-5`），high（`CLAUDE_EFFORT=high`，沿用第 5 次迭代的設定） |
| 子代理模型 | 本機設定 `CLAUDE_CODE_SUBAGENT_MODEL=sonnet`，子代理預設是 Sonnet。iter-5 的 Planner 等子代理用同模型（Opus 5.5）。本次委派 SOP 執行的子代理（Planner 等）要明確指定 Opus，才能和 iter-5 及 A/B 兩組的模型一致 |
| Skill 版本（開始時） | `89c7d3d`（`scripts/sync-skills.sh --check`：兩邊一致）。含 iter-5 步驟 11 的 5 項優化：`clarify-over-specs` `92f7c1e`、`technical-research` `be06f9c`、`ui-plan` `ca01fc0`、`api-plan` `1a2cf98`、`tasks` `b09eaa7` |
| 其他 | `git config --global core.hooksPath` = `~/dotfiles/git/hooks`（外洩掃描有效）；`apps/equipment-loan/backend/.env` 存在（未讀內容） |
| 中途變動 | 2026-11-10：步驟 3 起換新 Claude Code session（中途重開，依交接文件 `iter-6-step3-handoff.md` 接續）；電腦、模型與 effort 不變，commit 仍為 `89c7d3d`（步驟 2 的產出尚未 commit）。2026-11-11：步驟 4 起再換新 Claude Code session（依交接文件 `iter-6-step4-handoff.md` 接續）；電腦、模型與 effort 不變，commit 為 `61ba062`。2026-11-11：步驟 5 起再換新 Claude Code session（依交接文件 `iter-6-step5-handoff.md` 接續）；電腦、模型與 effort 不變，commit 為 `61ba062`（步驟 4 的產出尚未 commit） |
| 臨時改寫的提示詞 | P0 改寫：「本次功能」寫「見 runbook 9.3『通知迭代』列（6 次路徑第 6 次）」，取代 9.5 原文的「見 runbook 9.3 第 {N} 列」（9.3 沒有第 6 列的編號）；其餘依 9.5 原文，`{N}`=6、`{PREV_SPEC_DIR}`=`specs/007-equipment-maintenance-retire` |

## 步驟紀錄

| 步驟 | Skill | 產出 | 使用者做了什麼 | 問題 | commit |
|---|---|---|---|---|---|
| 0 | （準備） | `docs/iterations/iter-6.md` | 貼 P0 開始第 6 次迭代 | 沒有。`git status` 乾淨，`main` 與 `origin/main` 一致。已讀 runbook、選題討論的迭代計畫、外部通知、A/B 比較設計、iter-5 紀錄與 `docs/handoff/iter-5-跨機交接.md`。待注意：(1) 子代理預設 Sonnet，見固定環境；(2) 委派 `analyze` 時子代理不能寫 `analysis.md`（交接文件第 4 節第 5 點），步驟 7 前要決定做法；(3) 既有測試依賴台北 12:00–21:00，假時鐘工具在舊電腦 `/tmp`，本機沒有 | — |
| 2 | `s-specify` | `specs/008-overdue-discord-notification/spec.md` | 回答 `clarify` 2 輪共 5 題（皆採推薦選項：每筆逾期借用只自動通知一次；失敗自動重試最多 3 次後才標「送出失敗」；逾時標「結果不明」且不自動重送；時段結束即逾期、10 分鐘內通知；通知寫出成員姓名） | 第 5 節第 6 列兩條觀察規則：「逾期檢查要能手動觸發」已寫在功能描述，`clarify` 不需要問，spec 寫成 US3；「通知失敗、逾時、重複的處理」都有問到（第 1 輪第 1 題重複、第 2 題失敗、第 3 題逾時）。執行者在步驟 0 已讀過觀察規則與選題討論的外部通知設計（`429`、`Retry-After`、`?wait=true`），「有問到」只能當弱證據（同 iter-5 流程不足「0 → 2」）。US 3 個、FR 20 條（全域 10 條）、NFR 3 條（全域 2 條）、SC 7 條。推定需求 16 條（FR-002、FR-003、FR-004、FR-006、FR-007、FR-008、FR-010、FR-014、FR-015、FR-016、FR-017、FR-018、FR-020、NFR-001、NFR-002、NFR-003，含沿用的 SC-002、SC-005、SC-006）；未確認事項 21 項（16 項寫成推定需求、4 項推定排除寫進 Out of Scope、1 項寫成一般 Assumption「Discord Webhook 已預先建立」）。`clarify` 題數 5 題，已達上限。自檢第 1 輪修正 4 處（FR-001 沒排除停機期間，和 Edge Case、SC-001 不一致；FR-003、FR-005、FR-017、FR-020 缺驗收情境；FR-003、FR-014 漏列推定），第 2 輪通過；沒有未通過項。憲法：只有 `shared.md`，Rule 1 通過 | — |
| 3 | `clarify-over-specs` | 更新 `spec.md`（Clarifications 新增 5 條；新增 FR-021；改寫 US1、US2 敘述、US2 Independent Test、FR-005、FR-014、FR-016、Key Entities、SC-003；US1 驗收情境新增 11～15；US2 驗收情境 4 拆成 4、5，原 5～15 改編 6～16，原 7（現 8）改寫；Edge Cases 改 1 條、新增 3 條；Out of Scope 新增 1 條（使用者決定）；Assumptions 刪除 FR-014 推定） | 回答 2 輪共 5 題，皆採推薦選項：(1) 恢復運作時，等待重試的「送出中」繼續重試、等回應的標「結果不明」（FR-021）；(2) 只有連線在送出前就失敗才自動重試，送出後中斷標「結果不明」（FR-014、FR-016）；(3) 重送不等結果，先顯示「送出中」（FR-005）；(4) 只能一則一則重送（Out of Scope）；(5) Discord 要求等待超過 1 分鐘直接標「送出失敗」（FR-014） | 「沒被問到的規則」本次沒有，依「影響 × 不確定性」排序出題（同 iter-5 步驟 3）。交接文件列的 5 條推定（FR-016、FR-018、FR-008、FR-014、FR-006）只有 FR-014 被問到；其餘判為低不確定性或已由 Clarifications 決定（FR-006 對應已確認的「結果不明先確認再重送」）。觀察 `92f7c1e`（iter-5 流程不足「11」）：寫回決策時有改寫矛盾的舊敘述（US2 驗收情境 4、8 的「變成送出成功」改成先顯示「送出中」；SC-003 兩次配合 FR-014、FR-016 改寫；Edge Case「自動重試時又等不到回應」改寫；Assumptions 刪除已確認的推定），待決定矛盾 0 項；執行者知道要觀察這項，只能當弱證據。格式驗證 2 輪都 1 次通過，沒有未通過項。分類最終狀態：Resolved 3（功能範圍與行為、互動與 UX 流程、整合與外部依賴）；Outstanding 2（非功能品質屬性：FR-016 10 秒、NFR-001 2 秒仍為推定；邊界情境與錯誤處理：本次問的 2 項已解決，剩自動重試等待期間借用被歸還仍會送出，影響低）；其餘 Clear；Deferred 0。推定需求剩 15 條 | `61ba062` |
| 4 | `technical-research` | `research.md`（8 個主題）、`techstack.md` | 回答 `clarify` 1 題，採推薦選項：自動檢查加 `.env` 開關 `OVERDUE_AUTO_CHECK_ENABLED`、預設開啟；只有展示與測試 US3 手動檢查時關閉（FR-001 的例外） | 沒有。使用者限制的 4 個新主題都有決策：排程（§2，程序內計時器＋PostgreSQL 工作狀態，每 60 秒檢查、每 1 秒送出）、Discord 呼叫（§3，內建 `fetch`＋`?wait=true`，`Retry-After` 標頭優先，>60 秒直接失敗，只對連線建立前的錯誤代碼重試）、模擬器（§6，自寫 `node:http`，以控制端點切換 6 種模式）、`.env` 與 log（§5，`--env-file-if-exists`，log 只印主機名稱）；另有資料表（§1）、API 與並發（§4）、前端（§7）、測試與 seed（§8）。沿用 007 的技術在各主題都寫了沿用理由；007 列為不引入的 Discord Webhook、`node-cron` 本次重新評估並寫理由。決策缺口 1 項（Phase 1 找出）：FR-001／FR-002 自動檢查會搶先通知 demo seed 的「未通知逾期借用」，和 US3 驗收情境 6、FR-020 衝突，經 `clarify` 決定。查證：Context7 查 Discord 官方文件（`wait`、Rate Limits）、Node.js 24 文件（`--env-file-if-exists`）、undici 文件（錯誤代碼）；本機實測 `fetch` 的錯誤代碼與 `tsx` 傳遞 `--env-file-if-exists`。查證時發現後端目前沒有載入 `.env`（`DATABASE_URL` 只靠程式預設值），寫進 §5。驗證：`research.md` 第 1 輪修 2 處（補 Discord 速率估算依據、補 §7 的 2 秒預估值），第 2 輪通過；`techstack.md` 第 1 輪通過；未通過項 0。憲法：讀 `shared.md`（Rule 1 通過），`technical-research` 專屬憲法檔不存在；沒有偏離與未套用規則。執行者在交接文件已讀到 FR 與技術主題的對應提示，主題盤點的完整度只能當弱證據 | 見步驟 4～5 檢查點 commit |
| 5 | `system-analysis`（Planner：`ui-plan`、`api-plan`、`data-plan`，子代理皆指定 Opus） | `plan.md`（5 種端點、15 個介面、3 個 Wave）；`ui/plan.md`、`ui/index.html`、`ui/overdue-notifications.html`；`contracts/openapi.yaml`（27 個 operation：B1 1、B2 1、B3 1、B4 24）；`data/data-model.dbml`（9 張表：D1 1、D2 8） | 沒有。提示詞已指定專案結構與視覺風格（沿用 007 結構、003 視覺風格），SOP 沒有提問；目錄內原本沒有 `plan.md` 與 Planner 產出，不需覆寫同意；憲法衝突 0 項 | **沒有 Planner 的端點（第四題證據）**：排程 S1 逾期自動檢查排程、S2 通知送出與自動重試程序、S3 系統恢復運作時中斷通知的處理；通知服務 N1 Discord Webhook 逾期通知送出、N2 本機 Discord Webhook 模擬器。Wave 3（排程）整個 Wave 跳過；Wave 2 委派時註明「N1、N2 未分析，請改依技術研究結果」。這 5 個介面承載 FR-001、FR-002、FR-014～FR-016、FR-021、SC-001、SC-003 等核心需求，目前只有 research §2、§3、§6 的文字決策，沒有可交給 `tasks` 的規格產出。`.env` 設定（research §5）沒有列為端點，寫在 Source Code 樹與 N1 的需求依據（NFR-003、SC-006）。**檢查腳本**（主 session 重跑一次，結果相同）：`plan.md` 需求編號查核 31 個全部「找到」，US1～US3 都「已引用」，樣板結構與兩份檢查清單第 1 輪通過，未通過項 0；`ui-plan` `check_ui.py` `ok: true`、issues 0、warnings 0；`api-plan` `check_contracts.py` issues 0、Redocly lint 0 error；`data-plan` `check_data_model.py` issues 0（第 1 輪通過後，自行發現一對一 `Ref` 方向相反，修正後重跑仍通過）。**上游衝突 1 項（`api-plan` 回報）**：`ui/plan.md` 與雛形沒有分頁控制，只顯示「共 N 則通知」；research §4 與憲法 `openapi.md` Rule 1 要求 `page`／`pageSize`，合約照分頁寫，通知超過一頁時 UI 看不到第二頁；建議由 `ui-plan` 補（主 session 已確認 `ui/plan.md` 沒有「分頁」字樣，research §4 第 108 行有寫 `page`、`pageSize`）。待步驟 7 `analyze` 觀察是否抓到，步驟 10 再分類。**`ui-plan` 自行縮小範圍**：F4 只做登入頁，設備預約、我的預約、管理員總覽列為不在範疇並指向 007 `ui/`，和 `plan.md` F4 列出的 4 個畫面不同。**`data-plan` 自行決策**：`reservation_id` 依憲法 Rule 4 在欄位標 `unique`（research 寫唯一索引名稱，note 保留名稱）；多加 `idx_overdue_notifications_created` 支援不篩選時的排序；把「送出失敗」「結果不明」解讀為非終態，重送更新同一列不違反憲法 Rule 4；`failure_reason` 只在 `failed` 時有值。**`api-plan` 自行決策**：清單多回傳 `reservationNumber`、`userId`、`returnedAt`、`discordMessageId`、`createdAt`；排序補 `id ASC`；重送 202 時 `attemptCount` 尚未加 1，由送出程序領取時加 1；B1～B3 的 403 沿用 `requireAdmin` 訊息，訊息文字是否改由實作決定 | 見步驟 4～5 檢查點 commit |

## Skill 表現檢查

| Skill | 預期 | 實際 | 分類（需求缺漏／程式錯誤／Skill 缺陷／沒有問題） | 證據位置 |
|---|---|---|---|---|

## Skill 問題（交給 skill-engineering）

（目前沒有）

## 使用者驗證

- commit SHA：
- 情境與結果：
- 使用者回饋：

## 流程不足

| 步驟 | 問題 | 影響 | 試過的優化 |
|---|---|---|---|

## 影片素材清單

| 要證明什麼 | 證據路徑 | commit SHA | 重現步驟 | 只能當下保存？ |
|---|---|---|---|---|
