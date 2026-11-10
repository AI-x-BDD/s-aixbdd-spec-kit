# 迭代 5：設備送修或停用、恢復可用，處理受影響的未來預約

- spec 目錄：（步驟 2 後由 `s-specify` 決定，預期 `specs/007-…`）
- 上一次 spec 目錄：`specs/006-reservation-reschedule`
- 本次功能：runbook 9.3 第 5 列（6 次路徑）
- 執行者：Claude Code＋Opus 5.5（runbook 第 6 節第 6 點：第 5 次迭代起全部改由 Claude Code 執行）
- 開始／結束：2026-11-10／（未結束）

## 固定環境

| 項目 | 值 |
|---|---|
| 電腦 | steve-10（MacBook Pro `Mac14,7`，macOS 27.0.1）。第 4 次迭代收尾在 stevedeMac-mini，第 13 天閘門起改用本機 |
| 執行工具與版本 | Claude Code 2.1.321（主 session）；`uv` 0.12.1；Node.js 24.14.1（`techstack.md` 要求 24 LTS 以上）；Docker 29.9.2、Docker Compose v5.6.1 |
| 模型與 effort | Opus 5.5（`claude-opus-5-5`），high（沿用第 4 次迭代步驟 2 起的設定） |
| Skill 版本（開始時） | `8bcc4fe`（`scripts/sync-skills.sh --check`：兩邊一致） |
| 中途變動 | 沒有 |
| 臨時改寫的提示詞 | 沒有（P0 依 9.5 原文，`{N}`=5、`{PREV_SPEC_DIR}`=`specs/006-reservation-reschedule`） |

## 步驟紀錄

| 步驟 | Skill | 產出 | 使用者做了什麼 | 問題 | commit |
|---|---|---|---|---|---|
| 0 | （準備） | `docs/iterations/iter-5.md` | 貼 P0 開始第 5 次迭代 | 沒有。`git status` 乾淨；`main` 比 `origin/main` 多 3 個 commit（未 push，不影響本次） | — |
| 2 | `s-specify` | `specs/007-equipment-maintenance-retire/spec.md` | 回答 `clarify` 2 輪共 4 題（皆採推薦選項：送修暫時／停用長期且都不刪除；自動取消未來預約；借用中不可設定；不填預計恢復日期） | 第 5 節第 5 列兩條觀察規則都有問到：「送修時受影響預約的處理」在第 1 輪第 2 題（另有第 3 題借用中、第 2 輪第 4 題恢復日期）；「停用與刪除的差別」在第 1 輪第 1 題（選項 3「停用就是刪除設備」與推薦選項「都不刪除」對比）。執行者在步驟 0 已知道觀察規則，「有問到」只能當弱證據（見流程不足）。US 3 個、FR 18 條（全域 2 條）、NFR 2 條。推定需求 10 條（FR-003、FR-007、FR-008、FR-009、FR-010、FR-013、FR-016、FR-018、NFR-001、NFR-002，含沿用的 SC-002、SC-006）；未確認事項 15 項（10 項寫成推定需求、4 項推定排除寫進 Out of Scope、1 項寫成一般 Assumption）。`clarify` 題數 4 題，未達上限 5 題 | `6918e53` |
| 3 | `clarify-over-specs` | 更新 `specs/007-equipment-maintenance-retire/spec.md` | 回答 2 輪共 5 題（皆採推薦選項） | 沒有。本次沒有「沒被問到的規則」（步驟 2 已問到兩條觀察規則），依「影響 × 不確定性」排序出題。新增 FR-019（確認時資料和確認視窗不同→拒絕，「設備狀態已被變更，請重新確認」）、FR-020（全體預約管理頁顯示取消原因）；FR-002 改為取消「時段尚未結束」的待審核預約（原寫「尚未開始」，與 US1、SC-001 不一致）；FR-007、FR-008 推定確認；Out of Scope「通知受影響成員」改為使用者決定，新增「確認視窗列出受影響預約明細」「設備狀態變更歷程畫面」（使用者決定）；US1 驗收情境新增 15～17。仍有 8 條推定需求（FR-003、FR-009、FR-010、FR-013、FR-016、FR-018、NFR-001、NFR-002，含沿用的 SC-002、SC-006）與 3 項推定排除未提問。分類狀態：領域與資料模型、術語與一致性為 Deferred（既有 `unavailable` 設備遷移成「停用」的對應與 FR-018 舊稱「不可用」，已達 5 題上限）；功能範圍與行為、非功能品質屬性為 Outstanding（送修文字說明等推定排除、沿用前版 2 秒門檻，影響低）；互動與 UX 流程、邊界情境與錯誤處理為 Resolved；其他 4 類 Clear | `6918e53` |
| 4 | `technical-research` | `specs/007-equipment-maintenance-retire/research.md`、`techstack.md` | 貼 P4（技術限制：沿用 006 `techstack.md`，只研究新增主題，原始碼位置不變）；不需要同意覆寫（目錄原本沒有這兩份） | 沒有。盤點 5 個主題，「決策缺口」為空，沒有委派 `clarify`：①設備狀態 Enum 以 `RENAME VALUE` 把 `unavailable` 改名 `retired`、`ADD VALUE maintenance`，新增 `cancel_reason` 與只新增的 `equipment_status_changes`；②設定／恢復 API 在單一交易內批次取消、改期失效與寫紀錄，確認時重新計算數量比對（FR-019）；③設備列鎖 `FOR UPDATE`／`FOR SHARE` 序列化並發（FR-009），`createReservation` 改包交易；④前端擴充既有畫面，自製確認視窗；⑤測試沿用，新增以 `pg` 逐支執行 `migration.sql` 的遷移測試。沿用 006 的技術在每個主題的 Rationale 都寫了沿用理由。技術堆疊與 006 相同，沒有新增套件；不引入清單 7 類。查證：PostgreSQL 18 官方文件（列鎖衝突表、`ALTER TYPE`）、本機 Prisma 7.10.1 CLI 與型別定義（Prisma 官網文件已是 8.x，改以本機版本查證）。憲法：只有 `shared.md`，Rule 1 通過；沒有未通過項、憲法偏離與未套用規則 | `75855c6` |
| 5 | `system-analysis`（含 Planner） | `plan.md`；Wave 1 `ui-plan` → `ui/plan.md`、`index.html`、`booking.html`、`my-reservations.html`、`equipment-status.html`、`admin.html`；Wave 2 `api-plan` → `contracts/openapi.yaml`（24 個 operation）、`data-plan` → `data/data-model.dbml`（8 張表，新增 `equipment_status_changes`） | 貼 P5（專案結構沿用 006、視覺風格沿用 003，未提問；目錄內沒有舊產出，未跳出覆寫確認） | 3 種端點、14 個介面（F1～F5、B1～B6、D1～D3）、2 個 Wave（Wave 1 前端；Wave 2 後端、資料庫平行）；沒有「沒有 Planner」的端點（Discord 等外部通知已列 Out of Scope，未盤成介面）；需求編號查核 28 個全部找到、US1～US3 全部引用；沒有憲法衝突，三個 Planner 都沒有委派 `clarify`。三個檢查腳本都是第 1 輪通過：`check_ui.py` ok（`ui-plan` 修 2 個小問題後第 2 輪仍 ok）、`check_contracts.py` issues 0（Redocly warnings 25：`security-defined` 24、`no-server-example.com` 1，與 006 相同不算 issue）、`check_data_model.py` issues 0；主 session 重跑三支腳本結果相同。**上游衝突 3 項**：(1) `api-plan`：research §2 PATCH 先回 `EQUIPMENT_STATUS_UNCHANGED` 再比對 `expected*`，另一位管理員已改狀態時與 FR-019「設備狀態已被變更，請重新確認」不一致，合約依 spec 先比對 `expectedCurrentStatus`（處理 Skill：`technical-research`）；(2) `api-plan`：research §3 的 `FOR SHARE` 清單沒有「需人工審核設備的改期申請送出」，設定送修時可能留下已取消預約上的改期審核中申請，違反 FR-004，合約照 research 寫（處理 Skill：`technical-research`）；(3) `data-plan`：research §1 的 demo seed 以 `deleteMany` 重設，會刪除 `equipment_status_changes`，與 FR-008「紀錄不得刪除」及憲法 data-model Rule 2 衝突，需使用者決定是否為例外。**待確認 11 項**（留給步驟 7 `analyze`）：`ui-plan` 4 項（核准／領取／取消時預約已因送修取消的拒絕訊息；從未變更的設備「最近變更」顯示「尚無狀態變更」，含遷移後的停用設備；恢復可用不需確認視窗；雛形拆成設備狀態與審核借用兩頁，實作是 `AdminOverviewView.tsx` 單頁區塊）；`api-plan` 4 項（預覽回傳 `checkedOutReservations` 明細與 `statusCounts` 等補充細節；核准時先檢查申請狀態再檢查設備狀態；設備 DTO 以 `status` 取代 `isActive` 是破壞性變更；欄位名稱與 data-plan 待比對）；`data-plan` 3 項（`time_slots` 的 `HH:mm` 是否屬憲法 Rule 3；`cancel_reason` 必填與 `from_status ≠ to_status` 只寫在 note；新索引 `idx_reservations_equipment_status_date` 未列在 research §1）。執行方式：主 session 依 SOP 執行 `system-analysis`，Planner 由同模型（Opus 5.5）子代理讀取 `.agents/skills/<planner>/SKILL.md` 執行 | `75855c6` |
| 6 | `tasks` | `specs/007-equipment-maintenance-retire/tasks.md`（46 個任務：Setup 2、Foundational 11、US1 15、US2 3、US3 4、Polish 11） | 貼 P6；沒有既有 `tasks.md`，未跳出覆寫確認 | `check_tasks.py` 第 1 輪 issues 0、warnings 0；主 session 依 Phase 3 步驟 4 逐條核對規則後修正 2 處（T005 的 seed 重設與 FR-008「紀錄不得刪除」不一致，補成待確認 5，依 Rule 4；T025 依賴 T023 卻標 `[P]`，移除，依 Rule 2），第 2 輪仍是 issues 0、warnings 0（142 項參考）。憲法：只有 `shared.md`（Rule 1 通過），沒有 `tasks` 專屬憲法，「憲法衝突」為空，沒有委派 `clarify`；沒有憲法偏離與未套用規則。舊資料遷移：T003（schema）、T004（`RENAME VALUE`、`ADD VALUE`、`cancel_reason` 補 `member_cancelled`）、T041（`backend/tests/migration/` 遷移測試）；舊功能回歸：T002（006 基準）、T043（修正依賴 `isActive`／`unavailable` 的斷言後跑 backend、frontend、e2e，SC-005）。T043 沒有提到 iter-4 的假時鐘條件，也沒有預先排「管理員頁拆成兩個頁籤、登入成功按鈕改字」造成的既有 e2e 更新（同 iter-4 流程不足 6 → 8），步驟 8 要留意；demo seed 擴充：T005（6 台設備含送修中、停用、可示範設為送修，FR-018、US1 情境 14）、T044（README）、T046（手動走 Independent Test）。Notes 待確認 5 項：①管理員畫面拆兩頁 vs plan.md 只有 `AdminOverviewView.tsx`；②全體預約是否顯示「成員取消」（research §4 vs ui/plan）；③送修檢查順序（research §2 vs contracts，即步驟 5 上游衝突 1）；④需人工審核的改期送出沒鎖設備列（即步驟 5 上游衝突 2）；⑤seed `deleteMany` 刪除狀態變更紀錄 vs FR-008（即步驟 5 上游衝突 3）。執行方式：主 session 把 SOP 交給同模型子代理執行；子代理寫完 `tasks.md` 後因 API 額度用完（429）中止、沒有回報，主 session 換帳號後從 Phase 3 步驟 3 接手（重跑腳本、步驟 4 核對與修正、步驟 5 回報） | `96ef51b` |
| 7 | `analyze` | `specs/007-equipment-maintenance-retire/analysis.md`（14 筆問題） | 貼 P7；沒有既有 `analysis.md` | CRITICAL 0、HIGH 6、MEDIUM 4、LOW 4。HIGH：F1 FR-009／SC-002 與 FR-019 互相衝突（新預約先提交時設定必因數量不同被拒絕，設備留下預約，T039 斷言會失敗；處理 `clarify-over-specs`，再用 `tasks` 改 T039）；F2 research §2 與合約的檢查順序不同（`technical-research`）；F3 登記領取不鎖設備列，設定送修可能在領取後成功、違反 FR-005／SC-003（`technical-research`、`api-plan`）；F4 需人工審核的改期送出不鎖設備列（`technical-research`、`api-plan`）；F5 seed `deleteMany` vs FR-008（需要使用者決定，候選 `clarify-over-specs`、`technical-research`）；F6 全體預約是否顯示「成員取消」research §4 vs ui/plan（需要使用者決定，候選 `technical-research`、`ui-plan`）。MEDIUM：F7 管理員畫面兩頁 vs 單一 view（`system-analysis`）、F8 B4 兩種 409 在 ui/plan §5 沒有回饋（`ui-plan`）、F9 核准與改期的 `EQUIPMENT_UNAVAILABLE` 沒有畫面回饋（`ui-plan`）、F10 `slotCode` 大小寫（`api-plan`）。LOW：F11～F13（`tasks`、`api-plan`、`ui-plan`）、B1 NFR-002 量測環境（`clarify-over-specs`）。憲法：`shared.md` Rule 1、`openapi.md` Rule 1～7、`data-model.md` Rule 1～4 全部通過。`collect_coverage.py` 退出 0：需求 28／28（100%）、任務 46、介面 14、沒有 Planner 產出或沒有任務的介面 0、未對應需求任務 5、待確認 5、佔位符 0；主 session 重跑結果相同。**已知項目對照**：步驟 5 的上游衝突 3 項全部抓到（F2、F4、F5）；`tasks.md` Notes 待確認 1～5 全部抓到（F7、F6、F2、F4、F5）；待確認 5 判為 HIGH 不是 CRITICAL，理由是 `data-model.md` Rule 2 約束 `data-model.dbml`，DBML 本身寫軟刪除，`deleteMany` 寫在沒有專屬憲法的 `research.md`（主 session 核對後同意）；步驟 5 的待確認 11 項只直接對應 2 項（F7 拆兩頁、F10 欄位命名），1 項部分對應（F9），1 項明確判斷不違反（`time_slots` 的 `HH:mm` 不屬 Rule 3），其餘 7 項（尚無狀態變更、恢復可用不需確認、預覽 `checkedOutReservations` 補充、核准檢查順序、`isActive`→`status` 破壞性變更、`cancel_reason` 必填只在 note、新索引未列 research §1）沒有列為問題，這些多是 Planner 自行補充的細節，不一定是跨文件矛盾。另新抓到 2 項未曾記錄的衝突（F1、F3）。待驗證假設「`analyze` 漏查衝突」在本次不成立。執行方式：主 session 把 SOP 交給同模型子代理執行；子代理完成 Phase 1～3 的分析，但寫入 `analysis.md` 時被工具擋下（子代理不能用 Write 寫報告檔），改為回傳全文，由主 session 寫入；子代理自述 `ui/*.html` 的 `<style>` 區塊沒有逐行讀（偏離 Phase 1 步驟 5「讀全文」，CSS 不影響本次問題判斷）。主 session 複核：重跑 `collect_coverage.py`、以 `grep` 確認 14 筆問題的所有位置識別字都找得到、確認沒有殘留 `{{`、目標目錄只新增 `analysis.md`，並抽查 F1（research §3 第 69 行「因數量不同依 FR-019 拒絕」）、F3（§3 的 `FOR SHARE` 清單沒有登記領取）證據成立 | `96ef51b` |
| 8 | `implement` | `apps/equipment-loan/`（007 增量遷移 `20261110032526_equipment_maintenance_retire`、設備 3 態與取消原因、demo seed 6 台設備、設為送修／停用／恢復可用與預覽 API、登記領取與改期加 `FOR SHARE`、`EquipmentStatusDialog.tsx`、管理員兩頁籤、成員端送修標示與停用隱藏、整合／並發／效能／遷移／E2E 測試、`README.md`）、更新 `tasks.md`（46/46 完成） | 貼 P8 | 沒有 Skill 問題；受阻任務 0；自行決策 54 條（見下節）。最後驗證（主 session 12:38 重跑，實際時間與假時鐘 19:00 結果相同）：check 通過、backend 40/40、frontend 4/4、e2e 5/5；既有回歸 backend 25、frontend 3、e2e 4 全部通過，與 Phase 1 基準相同（SC-005）；遷移測試 4/4（FR-018）；SC-006 最大 19.7 ms（設為送修）。既有測試只補頁籤點擊與 `$queryRaw` mock，沒有刪改斷言（主 session 以 `git diff 96ef51b..HEAD` 確認只有新增行）。**analysis HIGH 在實作中的結果**：F1 真的發生，T039「預約 × 設定送修」3 次執行各 20 輪中 18、18、19 輪是預約先提交，設定依 FR-019 回 `409 EQUIPMENT_STATE_CHANGED`、設備留下預約，要管理員重新確認才變成 0 筆；F3 真的存在，T021 在登記領取加 `FOR SHARE` 後並發 10 輪殘留 0；F4 不採 tasks 暫行做法，T022 兩條改期路徑都加鎖後殘留 0；F2、F5、F6 依 tasks 暫行做法。執行方式：依 runbook「一個 Phase 跑一次」，每個 Phase 由同模型子代理（fork）以 `--scope phase:N` 完整執行 SOP 並 commit（Phase 4、5 由同一個子代理依序執行、各自 commit）；每個 Phase 結束，主 session 重跑 check 與測試、核對 tasks.md 勾選數與 commit 內容（沒有 `.env`、`node_modules/`、`dist/`、`test-results/`）。子代理沒有遇到 429 或寫檔被擋 | `b63acf3`、`cf8c199`、`2105502`、`b61e320`、`92f6cbc`、`c7c2ac6` |
| 9 | （使用者驗證） | 本檔「使用者驗證」：啟動方式、重設指令、15 個情境（S1～S5、F1～F5、R1～R5）與結果；證據 `docs/tmp/iter-5-uv/`（被 git 忽略） | 要求 AI 代為驗證 | 不是使用者親手操作；第一輪腳本誤判 3 項，修正後第二輪 112/112 通過；使用者回饋待補 | 只改迭代紀錄（步驟 10 補 SHA） |

### 步驟 8 `implement` 受阻任務與自行決策紀錄

- **受阻任務**：無（0 個）。
- **已知情況**：既有測試有時刻相依，只在 Asia/Taipei 12:00–21:00 全部通過（iter-4 記為 18:00–21:00 不完整）。11:21 實跑 backend 24/25（`backend/tests/integration/api.test.ts:79` 預期上午時段已結束）、e2e 2/4（`e2e/equipment-loan.spec.ts:75`、`e2e/reschedule.spec.ts:177`）。各 Phase 以假時鐘（平移 `Date` 到 19:00）比較回歸，工具放在 `/tmp/iter5-fakeclock/`，沒有進版控。T044 已把 README 的時段說明改成 12:00–21:00。
- **自行決策紀錄**：

| Phase | 任務 | 情況 | 決定 | 影響範圍 |
|---|---|---|---|---|
| 1 | T002 | 主 session 判斷 11:20 不需要假時鐘；實跑 backend 24/25、e2e 2/4 | 基準記兩組：實際時間一組、假時鐘 19:00 一組（backend 25/25、frontend 3/3、e2e 4/4） | T043 與各 Phase 的回歸條件 |
| 2 | T004 | `prisma migrate dev --create-only` 在非互動環境報錯 | 改用 `prisma migrate diff` 產生 SQL，手改成 `RENAME VALUE`／`ADD VALUE` 後以 `npm run db:migrate` 套用 | 遷移檔、T041 |
| 2 | T005 | 待確認 5（F5）：seed `deleteMany` vs FR-008 | 採暫行做法：seed 第一行清除 `equipment_status_changes`；服務層不提供刪除路徑 | `seed.ts`、README |
| 2 | T005 | EQ-101（可示範設為送修）有 006 的借用中 RV-20261108-03，直接設送修回 `EQUIPMENT_ON_LOAN`；既有測試依賴這筆 | 保留不改，示範前先登記歸還 | T042 改用 EQ-104、T044 示範步驟、T046 |
| 2 | T005 | 任務要 EQ-102 有逾期借用，006 seed 的逾期借用在 EQ-103 | 新增 RV-20261109-19（EQ-102 昨天晚間、`checked_out`），EQ-103 那筆不變 | `seed.ts` |
| 2 | T008 | 合約成員 DTO 只有 2 態，任務寫兩個 DTO 都用 3 態 | TS 型別先用 3 態，排除 `retired` 留給 T032 | `equipmentService.ts` |
| 2 | T013 | 任務要改「登入成功卡片」按鈕字，程式沒有這張卡片 | 不新增卡片、不改 `LoginView.tsx`；管理員登入後直接進「設備狀態管理」頁籤 | `App.tsx` |
| 2 | T013、Checkpoint | 管理員改成先進入設備狀態頁籤，3 支既有 e2e 失敗 | 不改專案 e2e，留給 T043；用 `/tmp` 複本加頁籤點擊驗證 4/4 | T043 |
| 3 | T016 | 待確認 3（F2）：檢查順序 research vs contracts | 依 contracts：借用中 → `expectedCurrentStatus` → `EQUIPMENT_STATUS_UNCHANGED` → 重算數量 | `equipmentStatusService.ts`、T037 |
| 3 | T016 | `equipmentService.ts` 的 DTO 轉換函式沒有 export，任務沒提到改這個檔案 | 在 `equipmentStatusService.ts` 自組 DTO | `equipmentStatusService.ts` |
| 3 | T018 | 必填 `cancel_reason` 讓既有單元測試型別檢查失敗 | 資料列型別改選填，沒有值時輸出 null | `reservationService.ts` |
| 3 | T020 | 核准時設備非可用，上游沒有訊息（F9） | 「無法核准：設備送修中／已停用，無法預約」 | `reservationService.ts` |
| 3 | T020 | 申請已因設備取消時的訊息 | 依 ui/plan §5 寫取消時間與原因；其他狀態沿用 006 | `reservationService.ts` |
| 3 | T021 | **F3**：登記領取不鎖設備列 | 在 `pickupReservationByAdmin` 交易開頭加 `FOR SHARE`（FR-005、SC-003 優先於 research） | `reservationService.ts`、T039 |
| 3 | T021 | 駁回訊息沒有範例 | 比照核准；登記領取加「不能領取這台設備」 | `reservationService.ts` |
| 3 | T022 | **待確認 4（F4）**：需人工審核的改期送出不鎖設備列 | 不採暫行做法；兩條改期路徑都加 `FOR SHARE`（FR-004 優先） | `rescheduleService.ts`、T039 |
| 3 | T022 | `EQUIPMENT_UNAVAILABLE` 沒有完整句子 | 「無法改期／無法核准：設備送修中（已停用），不能改到新時段。」 | `rescheduleService.ts` |
| 3 | T024 | 待確認 2（F6）：全體預約是否顯示「成員取消」 | 採暫行做法，新增「成員取消」標籤 | `zh-TW.ts`、T027 |
| 3 | T024 | 既有測試斷言 `ERROR_MESSAGES` 恰好 19 個 | 新錯誤碼放在獨立的 `EQUIPMENT_STATUS_ERROR_MESSAGES` | `zh-TW.ts`、T036 |
| 3 | T025 | 確認時回 `EQUIPMENT_ON_LOAN`，任務沒寫處理方式 | 和 `EQUIPMENT_STATE_CHANGED` 一樣關閉視窗，交給上層顯示（比照雛形） | `EquipmentStatusDialog.tsx` |
| 3 | T025 | 借用中紅框標題文字 | 直接引用 `EQUIPMENT_ON_LOAN` 的說明 | `EquipmentStatusDialog.tsx` |
| 3 | T026 | 待確認 1（F7）：管理員畫面兩頁 vs 單一 view | 沿用 Phase 2 的兩個頁籤、共用 `AdminOverviewView.tsx` | `AdminOverviewView.tsx` |
| 3 | T026 | 清單改表格，既有 e2e 依賴原 testid | 改表格、720px 以下轉卡片，原 testid 全部保留 | `AdminOverviewView.tsx` |
| 3 | T026 | 切換頁籤要 `App.tsx` 配合 | 新增選填 prop，由 T028 串接 | T028 |
| 3 | T026 | 「設備狀態已被變更」橫幅的完整句子 | 依 ui/plan 寫完整句；確認時借用中顯示「前往登記歸還」 | `AdminOverviewView.tsx` |
| 3 | T026 | 狀態摘要：ui/plan 是文字，雛形是徽章 | 3 個徽章，以「｜」分隔 | `AdminOverviewView.tsx` |
| 3 | T027 | 取消原因欄的樣式 | 琥珀「設備送修」、灰「設備停用」、純文字「成員取消」，附取消時間 | `AdminOverviewView.tsx` |
| 3 | T027 | 核准改期遇到已失效申請，ui/plan 有指定句子 | 在 `describeRescheduleNotPending` 補 `reservation_cancelled` 的句子 | `AdminOverviewView.tsx` |
| 3 | T027 | 「前往設備狀態管理」按鈕 | 新增選填 prop；橫幅維持 005 原文，只加按鈕 | T028 |
| 3 | T027 | 表格原本已有「建立／取消時間」欄 | 另外新增「取消原因」欄 | `AdminOverviewView.tsx` |
| 3 | T028 | 篩選狀態在 `AdminOverviewView.tsx` 內部 | 新增 `initialStatusFilter`、`onGoToReturn` prop；從頁首導覽切換時篩選重設為「全部」 | `App.tsx`、`AdminOverviewView.tsx` |
| 3 | Checkpoint | T022 新增的 `$queryRaw` 讓 `backend/tests/unit/reschedule.test.ts` 的 `fakeTx` 5 個測試失敗 | 不改專案測試，留給 T043；以暫時副本補 mock 驗證 10/10。Phase 3～5 以 backend 20/25 commit | T043 |
| 4 | T029 | contracts 共用說明「鎖定後先讓到期改期申請失效」vs available 分支「不讀不改預約與改期」 | 恢復路徑不呼叫 `expireDueRescheduleRequests`，只鎖設備列、改狀態、寫紀錄 | `equipmentStatusService.ts` |
| 4 | T029 | 送修／停用與恢復都要更新狀態、寫紀錄、組 DTO | 抽出檔案內部的 `writeStatusChange()` | `equipmentStatusService.ts` |
| 4 | T030 | 原 `targetStatus` 錯誤訊息只列 2 個值 | 改成「必須為 available、maintenance 或 retired」 | `adminRouter.ts` |
| 4 | T031 | 任務的橫幅只寫「送修時取消的預約…」，雛形依變更前狀態分兩句 | 依雛形分送修／停用兩句；補 `.btn-success` 樣式 | `zh-TW.ts`、`AdminOverviewView.tsx` |
| 5 | T032 | DTO 改 2 態，Prisma 列仍是 3 態 | 查詢加 `status in (available, maintenance)`，非 maintenance 輸出 available | `equipmentService.ts` |
| 5 | T033 | 任務要求所有已取消都寫時間與原因，ui/plan 只有送修範例 | 設備原因照 ui/plan；成員自行取消自訂句；沒有取消時間時沿用 006 原句 | `reservationService.ts` |
| 5 | T034 | 後端訊息比 ui/plan 橫幅簡短 | 後端訊息當前綴，再接 ui/plan 說明句；依是否含「停用」選句 | `zh-TW.ts`、`EquipmentBookingView.tsx` |
| 5 | T034 | 任務寫「清單件數更新」，頁面原本沒有件數 | 新增「共 N 台設備」（ui/plan §4、雛形） | `EquipmentBookingView.tsx` |
| 5 | T034 | 送修提示：ui/plan 比雛形少一句 | 用雛形全文 | `zh-TW.ts` |
| 5 | T034 | 時段格子：ui/plan 寫灰色，雛形用琥珀淺底 | 格子灰色停用，狀態徽章琥珀「送修中」 | `EquipmentBookingView.tsx` |
| 5 | T034 | Phase 2 的送修中徽章是淺底加框，雛形是琥珀實心 | 改成實心（`var(--pending)` 底、白字） | `EquipmentBookingView.tsx` |
| 5 | T035 | 任務寫兩種原因都用琥珀色條，雛形停用是灰色 | 送修琥珀、停用灰，與 T027 一致 | `MyReservationsView.tsx` |
| 5 | T035 | 「改期已失效」徽章與 `RESERVATION_ALREADY_CANCELLED` 橫幅 006 已實作 | 不改，只在 Checkpoint 實測 | 無 |
| 6 | T037 | 任務寫「依 US1 Independent Test 的資料」，Must Read 沒有列這段 | 另讀 US1 Independent Test 一行；用專用測試設備 EQ-901 建同結構資料；送修、停用各測一次 | `equipmentStatus.test.ts` |
| 6 | T039 | **F1**：FR-009／SC-002 與 FR-019 互相衝突；預約先提交的輪次設定必被拒絕 | 不改程式。該輪斷言設定回 `409 EQUIPMENT_STATE_CHANGED` 且資料不變，再模擬管理員重新預覽、確認，最後斷言留下 0 筆 | `equipmentStatusConcurrency.test.ts`；SC-002「同時發生時」的計算時間點要 `clarify-over-specs` 決定 |
| 6 | T039 | 上游沒說核准會不會改變將取消的筆數 | 斷言設定一定成功，核准先或設定先都接受 | 同上 |
| 6 | T040 | 量測停用需要第二批未結束預約 | 恢復可用後再建 100 筆，日期錯開 | `equipmentStatusPerformance.test.ts` |
| 6 | T041 | 上游沒指定獨立測試資料庫的位置 | 在同一台 PostgreSQL 建 `equipment_loan_migration_test`，測完 `DROP ... WITH (FORCE)` | 遷移測試 |
| 6 | T042 | EQ-101 有借用中預約 | E2E 改用 EQ-104；確認視窗數量以同時刻的預覽 API 為準，不寫死 | `e2e/equipment-maintenance.spec.ts` |
| 6 | T043 | 任務寫「修正依賴 `isActive`／`unavailable` 的斷言」，實際沒有這類斷言；真正的失敗是頁籤與 mock | 補 5 處頁籤點擊（`equipment-loan.spec.ts` 2、`reschedule.spec.ts` 3）與 `$queryRaw` mock，不改斷言 | 2 支 e2e、`unit/reschedule.test.ts` |
| 6 | T044 | README 寫回歸只在 18:00–21:00 全過，Phase 1 實測是 12:00–21:00 | 改成 12:00–21:00 | README §4 |
| 6 | T044 | seed 有 6 台設備與第二位管理員；EQ-101 要先歸還 | 更新設備表與帳號表；示範步驟先登記歸還；註明 seed 重設會清除狀態變更紀錄 | README §3.2、§3.5、§6 |
| 6 | T046 | 「手動」驗證由子代理執行 | 用臨時 Playwright 雙視窗腳本依 README §6 步驟 1～7 操作，20 項核對通過；12:3x 執行，US1 情境 6、16（時段進行中）改由 T037 的 `vi.setSystemTime` 涵蓋，情境 16 的停用版本沒有專屬測試 | 步驟 9 使用者驗證要補 |

## Skill 表現檢查

| Skill | 預期 | 實際 | 分類（需求缺漏／程式錯誤／Skill 缺陷／沒有問題） | 證據位置 |
|---|---|---|---|---|
| `implement` | 一次一個任務、只讀 Must Read、驗證通過才打勾、全程不提問、決策寫進報告 | 46/46、受阻 0、決策 54 條；最後驗證 backend 40/40、frontend 4/4、e2e 5/5，既有回歸全過；F1、F3、F4 都以決策處理並寫進報告。Phase 3～5 的 Checkpoint 有 5 個既有單元測試失敗，依決策留到 T043（比照 iter-4）；T037 多讀一段 Must Read 以外的部位並記錄 | 沒有問題 | 步驟紀錄第 8 列與「步驟 8 implement 受阻任務與自行決策紀錄」 |
| `analyze` | 實作前抓出會在實作中出問題的跨文件衝突 | HIGH F1、F3、F4 都在實作中真的出現：F1 在 T039 每 20 輪觸發 18～19 輪；F3、F4 若照 research／tasks 暫行做法會留下送修設備上的借用或改期申請，implement 改為加鎖 | 沒有問題 | `analysis.md` F1、F3、F4；決策紀錄 Phase 3 T021、T022，Phase 6 T039 |
| （需求） | SC-002「設備留下未結束預約為 0」在並發時有明確計算點 | FR-019 讓預約先提交的設定被拒絕，設備暫時留下預約，要管理員重新確認後才是 0 筆 | 需求缺漏 | `analysis.md` F1；決策紀錄 Phase 6 T039；留給 `clarify-over-specs` |
| `tasks` | 任務描述符合既有程式；預先排出 ui/plan 改變既有畫面造成的測試更新 | T013 要改不存在的「登入成功卡片」；T043 寫成修 `isActive`／`unavailable` 斷言，實際是頁籤點擊與 mock；T004 指定的 `migrate dev --create-only` 在非互動環境不能執行 | 待判斷（與 iter-4 流程不足 6 → 8 同類，第 2 次出現） | 決策紀錄 Phase 2 T004、T013，Phase 6 T043 |

## Skill 問題（交給 skill-engineering）

（目前沒有）

## 使用者驗證

- 驗證對象 commit：`c7c2ac6`（步驟 8 最後一個程式 commit；之後的 `985ccb2` 只改迭代紀錄，用 `main` 驗證即可）
- commit SHA：`c7c2ac6`
- 驗證方式：使用者要求由 AI 代為驗證（2026-11-10）。Claude Code（Opus 5.5）寫獨立的 Playwright 腳本，不沿用 `apps/equipment-loan/e2e/`。腳本走真實登入頁，從畫面讀驗證碼後輸入；用實際時間，不用假時鐘；依下方「執行順序」操作並截圖。**不是使用者親手操作。**
- 執行時間：2026-11-10 12:53:07–12:53:25（Asia/Taipei），在建議的 12:00–21:00 內。開始前與結束後各跑一次 `db:seed`。
- 情境與結果：15/15 通過（S1～S5、F1～F5、R1～R5），共 112 項檢查，失敗 0 項。沒有不符合預期的情境。
  - S1：6 台設備狀態正確，摘要「可用 4｜送修中 1｜停用 1」，最近變更的管理員正確；成員看到「共 5 台設備」，`EQ-105` 送修中且 3 個時段都不能點，沒有 `EQ-106`；`RV-20261108-14` 顯示「取消原因：設備送修｜取消時間」，`RV-20261027-02` 顯示 `EQ-106` 名稱與「已歸還」，`RV-20261107-06` 沒有設備取消原因。
  - S2、F2：確認視窗「將取消 4 筆預約、1 筆改期申請將失效」；按「取消」後設備與變更紀錄都不變，重開數量相同；確認後橫幅「…設為「送修中」，取消 4 筆預約，1 筆改期申請已失效。」，最近變更顯示吳承翰 12:53；「查看受影響的預約」篩選已取消，4 筆都是「設備送修」；改期申請分頁不再有 `RV-20261108-04`。
  - S3：成員看到 `EQ-101`「送修中」與暫停預約提示；`RV-20261108-04` 已取消、設備送修，改期紀錄「改期已失效」（原預約已取消）；陳冠廷 2 筆都是已取消、設備送修。
  - S4：數量 0／0，橫幅「從「送修中」改為「停用」，沒有需要取消的預約。」；成員看到「共 4 台設備」，沒有 `EQ-101`；歷史紀錄仍顯示設備名稱，取消原因仍是「設備送修」。
  - S5：恢復可用不開確認視窗，`EQ-101` 橫幅寫「停用時取消的預約不會自動復原」、`EQ-105` 寫「送修時…」；成員看到「共 5 台設備」；`EQ-101`、`EQ-105` 新預約都進入「待審核」；被取消的預約與失效的改期都沒有復原。
  - F1：`EQ-101`（`RV-20261108-03`）與 `EQ-102`（`RV-20261109-19`）都顯示「設備借用中，請先登記歸還」，確認按鈕停用，狀態不變。
  - F3：舊頁面送出 `EQ-101` 預約，紅色橫幅「設備送修中，無法預約：EQ-101 … 目前送修中，這筆預約沒有建立，請改選其他設備。」，沒有建立預約。
  - F4：數量從 2 筆開始；成員預約 `EQ-104` 後，確認時顯示「設備狀態已被變更，請重新確認」，`EQ-104` 仍可用；重開變成 3 筆。
  - F5：成員開「設備狀態管理」看到「權限不足」，沒有任何狀態變更按鈕。
  - R1～R5：驗證碼大小寫、免審核預約與成員取消（全體預約顯示「成員取消」）、待審核准衝突、借用中禁取消與登記歸還、即時改期都正常。
- 偏離與注意：
  1. 第一輪（12:52:00–12:52:39）有 3 項被腳本誤判，修正腳本後從乾淨 seed 重跑第二輪；上面是第二輪結果。誤判：R3 拒絕訊息沒有「衝突」兩字（實際是「…已被另一筆占用狀態紀錄（RV-20261109-08）鎖定；RV-20261109-09 仍維持「待審核」狀態」）；F3 把既有改期紀錄中的後天日期誤算成新預約；S3 在改期紀錄未展開時就讀取文字。
  2. 情境表 R3 寫「顯示時段衝突」，實際訊息寫「已被…鎖定」，意思相同，用字不同。
  3. 成員各用一個獨立 browser context（林雅婷、陳冠廷），沒有在同一個無痕視窗登出再登入。F3 需要的「沒有重新整理的舊頁面」由林雅婷的 context 保留。
- 證據：`docs/tmp/iter-5-uv/`（`uv.mjs`、`run1.log`、`run2.log`、`results.json`、`shots/` 27 張，被 git 忽略，不在 repo）。可用 `db:seed` 重現。
- 使用者回饋：（使用者未親手操作，待補）

### 啟動方式（從乾淨環境開始）

在 `apps/equipment-loan/` 依序執行：

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
cp -n backend/.env.example backend/.env || true
docker compose up -d --wait
npm run db:migrate
npm run db:seed
npm --prefix backend run dev     # 終端機 1：http://localhost:3000/api
npm --prefix frontend run dev    # 終端機 2：http://localhost:5173
```

- 已經跑過迭代 4 的資料庫：`npm run db:migrate` 只套用 `20261110032526_equipment_maintenance_retire/`，既有資料不刪除（README §2.2）。
- 故障排除：`db:seed` 出現 Prisma client 欄位或 Enum 錯誤時，執行 `npm --prefix backend exec prisma generate`，再重跑 `db:seed`（iter-4 換電腦時遇過，只改 `node_modules/`）。
- 3000 或 5173 埠已被占用時，先停掉占用的程式。E2E 用的是 5183 埠，不影響手動驗證。

### 重設展示資料

```bash
cd apps/equipment-loan && npm run db:seed
```

- 2026-11-10 12:43 已實際執行，並查資料庫確認：
  - 6 台設備：`EQ-101`～`EQ-104` 可用，`EQ-105` 送修中（需人工審核），`EQ-106` 停用（免審核）。
  - 因設備取消的範例預約都回來了：`RV-20261108-14`、`RV-20261108-15`（`EQ-105`，取消原因 `equipment_maintenance`），`RV-20261102-04`（`EQ-106`，`equipment_retired`）；`RV-20261107-06` 是 `member_cancelled`。
  - `EQ-106` 停用前的已歸還紀錄 `RV-20261027-02` 還在；`EQ-101` 借用中 `RV-20261108-03`、`EQ-102` 逾期借用中 `RV-20261109-19` 都在。
  - 設備狀態變更紀錄 3 筆：`EQ-104` 送修中→可用（黃詩涵，10-30 09:12）、`EQ-106` 可用→停用（黃詩涵，11-03 10:05）、`EQ-105` 可用→送修中（吳承翰，11-09 16:20）。
  - 改期申請 8 筆，5 種狀態都有（審核中 3、成功 1、被駁回 1、已撤回 1、已失效 2）。
- **重設會清除全部資料，包含設備狀態變更紀錄 `equipment_status_changes`**，再重建上面 3 筆。這是 tasks 待確認 5 的暫行做法，是 FR-008「紀錄不得刪除」的例外，只用於開發與展示資料庫。畫面與 API 沒有刪除紀錄的功能。
- 下列「今天」「明天」「後天」都以執行 `db:seed` 當天為準。換天驗證時，先重跑 `db:seed`。
- 每個情境會改變資料。要重做某個情境時，先重跑 `db:seed`，再從表格的「執行順序」第 1 步開始。

### 帳號、視窗與時段

- 一般視窗：管理員吳承翰 `wu.chenghan`（密碼 `Admin@2026`）。登入後先進「設備狀態管理」頁籤；審核、全體預約與借還在「審核與借用管理」頁籤。
- 無痕視窗：成員林雅婷 `lin.yating`、陳冠廷 `chen.guanting`（密碼 `Member@2026`）。換成員時按「登出」再登入。
- 第二位管理員黃詩涵 `huang.shihan`（密碼 `Admin@2026`）只出現在變更紀錄，本次不必登入。
- 登入頁可按「預建展示帳號快速帶入」，但驗證碼要自己輸入。
- **建議在台北時間 12:00–21:00 操作。** 原因：`EQ-104` 今天上午有陳冠廷未領取的 `RV-20261108-02`。12:00 前這個時段還沒結束，設為送修時它也會被取消（FR-002、FR-003），F4 的數量會從「2 筆」變成「3 筆」。其他情境不受時段影響。

### 執行順序

情境會互相影響，請照這個順序做：重設 → R1 → S1 → R2 → R3 → R5 → F1 → R4 → S2（含 F3 的準備）→ F3 → S3 → S4 → S5 → F4 → F5。

### 成功操作

| 編號 | 操作步驟 | 預期結果 |
|---|---|---|
| S1 seed 的送修／停用範例（US3 Independent Test、US1 情境 10、14） | 1. 吳承翰在「設備狀態管理」看設備清單、狀態摘要與「最近變更」欄。2. 林雅婷在「設備預約」看設備清單，點 `EQ-105` 的時段。3. 林雅婷開「我的預約」，看 `RV-20261108-14`、`RV-20261027-02`、`RV-20261107-06`。 | 1. 6 台設備；摘要是可用 4、送修中 1、停用 1。`EQ-105`「送修中」，最近變更吳承翰（昨天 16:20）；`EQ-106`「停用」，最近變更黃詩涵；`EQ-104`「可用」，最近變更黃詩涵；`EQ-101`～`EQ-103` 顯示「尚無狀態變更」。2. 顯示「共 5 台設備」，沒有 `EQ-106`。`EQ-105` 有琥珀「送修中」徽章與「設備送修中，暫停預約。管理員恢復可用後才能預約。」，時段都不能點選。3. `RV-20261108-14`「已取消」，顯示「取消原因：設備送修｜取消時間 …」。`RV-20261027-02` 照常顯示 `EQ-106` 的設備名稱與「已歸還」。`RV-20261107-06`「已取消」，不顯示「設備送修」或「設備停用」。 |
| S2 設為送修並取消受影響的預約（US1 Independent Test、情境 1～5、7、10、17） | 1. 先在無痕視窗以林雅婷開「設備預約」，日期選後天，**不要重新整理**（F3 會用到）。2. 吳承翰對 `EQ-101` 按「設為送修」，看確認視窗，按「取消」。3. 再按一次「設為送修」，按「確認設為送修」。4. 看頁頂橫幅與 `EQ-101` 這一列。5. 按「查看受影響的預約」。6. 切到「改期申請」分頁。 | 2. 確認視窗顯示「將取消 4 筆預約、1 筆改期申請將失效」。按「取消」後，`EQ-101` 仍是「可用」，最近變更仍是「尚無狀態變更」。3～4. 橫幅顯示「已將 EQ-101 … 設為「送修中」，取消 4 筆預約，1 筆改期申請已失效。」；`EQ-101` 變成「送修中」，最近變更顯示吳承翰與剛才的時間。5. 切到「審核與借用管理」，全體預約篩選「已取消」；`RV-20261108-04`、`RV-20261108-07`、`RV-20261109-08`、`RV-20261109-09` 的取消原因都是琥珀「設備送修」。`RV-20261108-03` 仍是「已歸還」，歸還時間與經手管理員不變。6. 不再有 `RV-20261108-04` 的申請。 |
| S3 成員看到取消原因與失效的改期（US3 情境 1、3；US1 情境 5） | 1. 林雅婷重新整理「設備預約」，看 `EQ-101`。2. 林雅婷開「我的預約」，看 `RV-20261108-04` 與它的改期紀錄，再看 `RV-20261109-08`。3. 換陳冠廷登入，開「我的預約」，看 `RV-20261108-07`、`RV-20261109-09`。 | 1. `EQ-101` 顯示「送修中」與暫停預約提示，時段都不能點選。2. `RV-20261108-04`「已取消」，顯示「取消原因：設備送修｜取消時間 …」；它的改期紀錄是「改期已失效」，失效原因「原預約已取消」。`RV-20261109-08` 也是「已取消」與「設備送修」。3. 陳冠廷兩筆都是「已取消」，取消原因「設備送修」。 |
| S4 送修中直接改為停用（US1 情境 11；US3 情境 2、4） | 1. 吳承翰回「設備狀態管理」，對送修中的 `EQ-101` 按「設為停用」，看確認視窗，按「確認設為停用」。2. 換林雅婷登入，開「設備預約」。3. 林雅婷開「我的預約」，看 `EQ-101` 的紀錄。 | 1. 確認視窗顯示「將取消 0 筆預約、0 筆改期申請將失效」。橫幅顯示「已將 EQ-101 … 從「送修中」改為「停用」，沒有需要取消的預約。」；`EQ-101` 直接變成「停用」，不必先恢復可用。2. 顯示「共 4 台設備」，清單沒有 `EQ-101`。3. `EQ-101` 的紀錄仍顯示設備名稱；`RV-20261108-04` 的取消原因仍是「設備送修」，沒有改成「設備停用」；`RV-20261108-03` 仍是「已歸還」。 |
| S5 恢復可用（US2 Independent Test、情境 1～4） | 1. 吳承翰對停用的 `EQ-101` 按「恢復可用」。2. 吳承翰對送修中的 `EQ-105` 按「恢復可用」。3. 林雅婷重新整理「設備預約」，選後天，預約 `EQ-101` 上午並按「確認送出預約」。4. 林雅婷選明天，預約 `EQ-105` 上午並送出。5. 林雅婷開「我的預約」。 | 1～2. 不開確認視窗。`EQ-101` 橫幅寫「…恢復為「可用」，審核設定維持「需人工審核」。停用時取消的預約不會自動復原。」；`EQ-105` 寫「…送修時取消的預約不會自動復原。」。兩台都變成「可用」，最近變更顯示吳承翰。3～4. 清單變成「共 5 台設備」（`EQ-106` 仍停用），`EQ-101` 重新出現，`EQ-105` 不再顯示「送修中」；兩筆新預約都進入「待審核」。5. `RV-20261108-04` 仍是「已取消」與「設備送修」，改期紀錄仍是「改期已失效」；`RV-20261108-14` 仍是「已取消」與「設備送修」。 |

### 關鍵失敗

| 編號 | 操作步驟 | 預期結果 |
|---|---|---|
| F1 設備借用中不能設定（FR-005、US1 情境 8） | 1. 吳承翰對 `EQ-101` 按「設為送修」。2. 按「取消」關閉；對 `EQ-102` 按「設為停用」，再按「取消」。3. 回到 `EQ-101`，再按「設為送修」，按「前往登記歸還」（接 R4）。 | 1. 確認視窗有紅框「設備借用中，請先登記歸還」，列出林雅婷的 `RV-20261108-03`；確認按鈕停用。2. `EQ-102` 同樣顯示借用中紅框，列出陳冠廷逾期的 `RV-20261109-19`，確認按鈕停用。兩台設備仍是「可用」，預約都不變。3. 切到「審核與借用管理」。 |
| F2 取消確認視窗（US1 情境 4） | 在 S2 第 2 步做：打開 `EQ-101` 的「設為送修」確認視窗後按「取消」。 | `EQ-101` 仍是「可用」，4 筆預約與 1 筆改期申請都不變（S2 第 3 步的數量仍是 4 與 1）。 |
| F3 從舊頁面預約送修中的設備（FR-006、US1 情境 9） | 1. S2 完成後，回到林雅婷**沒有重新整理**的「設備預約」頁（後天）。2. 點 `EQ-101` 上午，按「確認送出預約」。3. 開「我的預約」。 | 2. 紅色橫幅顯示「設備送修中，無法預約：EQ-101 … 目前送修中，這筆預約沒有建立，請改選其他設備。」3. 沒有新的 `EQ-101` 預約。 |
| F4 確認時資料已改變（FR-019、US1 情境 15；台北 12:00 後） | 1. 吳承翰對 `EQ-104` 按「設為送修」，看數量，**先不要確認**。2. 林雅婷在「設備預約」選明天，預約 `EQ-104` 上午並送出。3. 吳承翰按「確認設為送修」。4. 吳承翰重新按「設為送修」，看數量，按「取消」。 | 1. 「將取消 2 筆預約、0 筆改期申請將失效」（`RV-20261108-05`、`RV-20261109-13`）。2. 免審核，預約立即「已核准／有效」。3. 頁頂顯示「設備狀態已被變更，請重新確認」；`EQ-104` 仍是「可用」，林雅婷的新預約仍有效。4. 數量變成「將取消 3 筆預約」；取消後 `EQ-104` 仍是「可用」。 |
| F5 一般成員不能變更設備狀態（FR-017） | 林雅婷按頁首的「設備狀態管理」。 | 顯示「權限不足」卡片，看不到「設為送修」「設為停用」「恢復可用」按鈕。 |

### 前幾次功能的回歸

| 編號 | 操作步驟 | 預期結果 |
|---|---|---|
| R1 驗證碼登入（003） | 林雅婷用錯誤大小寫的驗證碼登入一次，再用正確驗證碼登入。 | 第一次被拒，顯示繁中錯誤，驗證碼重新產生；第二次登入成功，成員進「設備預約」。吳承翰登入後進「設備狀態管理」。 |
| R2 免審核預約與成員取消（003；US3 情境 5） | 陳冠廷在「設備預約」選明天，預約 `EQ-103` 下午並送出；再到「我的預約」取消它。吳承翰在全體預約看這筆。 | 預約立即「已核准／有效」；取消後變成「已取消」，成員畫面不顯示「設備送修」或「設備停用」；時段重新「可預約」。全體預約的取消原因欄顯示純文字「成員取消」。 |
| R3 待審預約核准衝突（004） | 吳承翰在「審核與借用管理」切到「預約申請」分頁，核准 `RV-20261109-08`，再核准 `RV-20261109-09`。 | 第一筆成功；第二筆顯示時段衝突，維持「待審核」。 |
| R4 借用中禁取消與登記歸還（005） | 1. 在 S1 第 3 步，林雅婷看「借用中」的 `RV-20261108-03`。2. 接 F1 第 3 步，吳承翰對 `RV-20261108-03` 按「登記歸還」，再按頁頂的「前往設備狀態管理」。 | 1. 沒有取消按鈕；頁頂「目前借用中設備」列出它。2. 變成「已歸還」，顯示歸還時間與經手管理員吳承翰；切回「設備狀態管理」。 |
| R5 免審核即時改期（006） | 林雅婷在「我的預約」對 `RV-20261108-05`（`EQ-104` 後天上午）按「申請改期」，選後天下午並送出。 | 綠色橫幅顯示改期成功；預約編號不變，時段變成後天下午，改期紀錄有一筆「改期成功」。 |

### 不在本次手動驗證內（由自動化測試涵蓋）

- US1 情境 6、16（時段已開始但未結束的預約被取消）：手動無法建立這種資料。由 `backend/tests/integration/equipmentStatus.test.ts` 以 `vi.setSystemTime` 涵蓋；情境 16 的停用版本沒有專屬測試（T046 決策紀錄）。
- US1 情境 12、FR-009（預約與設為送修同時發生）：`backend/tests/integration/equipmentStatusConcurrency.test.ts`，各 20 輪。
- US1 情境 13（從 003～006 的資料升級）：`backend/tests/migration/equipmentMaintenanceRetire.test.ts`。
- US2 情境 5（一般成員直接呼叫 API）：`equipmentStatus.test.ts:381`，預覽、設為送修、設為停用、恢復可用都回 `403 FORBIDDEN`。F5 只驗證畫面。
- 100 筆預約時的回應時間（< 2 秒）：`backend/tests/integration/equipmentStatusPerformance.test.ts`。

## 流程不足

| 步驟 | 問題 | 影響 | 試過的優化 |
|---|---|---|---|
| 0 → 2 | 步驟 0 依 runbook 要讀第 5 節本次備註與選題討論的迭代計畫，執行者在 `s-specify` 之前已知道觀察規則（送修時受影響預約的處理；停用與刪除的差別）與待驗證假設（`data-plan` 混用停用與刪除、`analyze` 漏查衝突） | 與 iter-4 流程不足第 2 列相同：`clarify` 問到觀察規則時，不能確定是 Skill 自己找到的，只能當弱證據 | 沒有；執行 `s-specify` 時只依 SOP 盤點，不主動帶入觀察規則 |
| 7 → 8 | 使用者選擇不先修 analysis.md 的 HIGH，直接進步驟 8 | F1 留在 spec，T039 以「管理員重新確認後才計 0 筆」斷言；F2～F6 由 implement 自行決策（F4 推翻 tasks 暫行做法） | 沒有；F1 留給 `clarify-over-specs`，F2～F6 的上游文件仍未對齊 |
| 8 | 既有測試的時刻相依範圍是 12:00–21:00，不是 iter-4 記的 18:00–21:00；主 session 交接時判斷 11:20 不需要假時鐘，判斷錯誤 | 實際時間在 12:00 前或 21:00 後執行，回歸會失敗；各 Phase 仍要用假時鐘比較 | 假時鐘工具放在 `/tmp/iter5-fakeclock/`，沒有進版控；README 已改成 12:00–21:00；既有測試仍沒有改成不依賴實際時間 |
| 6 → 8 | ui/plan 改變既有畫面（管理員兩頁籤）與 research 新增加鎖，使既有 e2e 3 支、單元測試 5 個失敗；`tasks` 的 T043 只寫修 `isActive`／`unavailable` 斷言（與 iter-4 流程不足 6 → 8 同類，第 2 次） | Phase 2～5 的 Checkpoint 都有既有測試失敗，留到 Polish T043 才修；中間各 Phase 要靠 `/tmp` 複本比較回歸 | 沒有；連續 2 次出現，可考慮交給 `skill-engineering` 檢查 `tasks` 的回歸任務規則 |
| 9 | 使用者要求 AI 代為驗證（Playwright 獨立腳本、實際時間），不是使用者親手操作（與 iter-4 流程不足第 9 列相同，第 2 次） | 「使用者回饋」空白；依專案規則第 6 條，tag 要等使用者實際驗證通過才提議。第一輪腳本誤判 3 項，第二輪才 112/112 | 沿用 iter-4 做法：獨立腳本走真實登入頁並截圖，不沿用 e2e；使用者親手抽查仍待補 |

## 影片素材清單

| 要證明什麼 | 證據路徑 | commit SHA | 重現步驟 | 只能當下保存？ |
|---|---|---|---|---|
