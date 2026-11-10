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
| 6 | `tasks` | `specs/007-equipment-maintenance-retire/tasks.md`（46 個任務：Setup 2、Foundational 11、US1 15、US2 3、US3 4、Polish 11） | 貼 P6；沒有既有 `tasks.md`，未跳出覆寫確認 | `check_tasks.py` 第 1 輪 issues 0、warnings 0；主 session 依 Phase 3 步驟 4 逐條核對規則後修正 2 處（T005 的 seed 重設與 FR-008「紀錄不得刪除」不一致，補成待確認 5，依 Rule 4；T025 依賴 T023 卻標 `[P]`，移除，依 Rule 2），第 2 輪仍是 issues 0、warnings 0（142 項參考）。憲法：只有 `shared.md`（Rule 1 通過），沒有 `tasks` 專屬憲法，「憲法衝突」為空，沒有委派 `clarify`；沒有憲法偏離與未套用規則。舊資料遷移：T003（schema）、T004（`RENAME VALUE`、`ADD VALUE`、`cancel_reason` 補 `member_cancelled`）、T041（`backend/tests/migration/` 遷移測試）；舊功能回歸：T002（006 基準）、T043（修正依賴 `isActive`／`unavailable` 的斷言後跑 backend、frontend、e2e，SC-005）。T043 沒有提到 iter-4 的假時鐘條件，也沒有預先排「管理員頁拆成兩個頁籤、登入成功按鈕改字」造成的既有 e2e 更新（同 iter-4 流程不足 6 → 8），步驟 8 要留意；demo seed 擴充：T005（6 台設備含送修中、停用、可示範設為送修，FR-018、US1 情境 14）、T044（README）、T046（手動走 Independent Test）。Notes 待確認 5 項：①管理員畫面拆兩頁 vs plan.md 只有 `AdminOverviewView.tsx`；②全體預約是否顯示「成員取消」（research §4 vs ui/plan）；③送修檢查順序（research §2 vs contracts，即步驟 5 上游衝突 1）；④需人工審核的改期送出沒鎖設備列（即步驟 5 上游衝突 2）；⑤seed `deleteMany` 刪除狀態變更紀錄 vs FR-008（即步驟 5 上游衝突 3）。執行方式：主 session 把 SOP 交給同模型子代理執行；子代理寫完 `tasks.md` 後因 API 額度用完（429）中止、沒有回報，主 session 換帳號後從 Phase 3 步驟 3 接手（重跑腳本、步驟 4 核對與修正、步驟 5 回報） | — |
| 7 | `analyze` | `specs/007-equipment-maintenance-retire/analysis.md`（14 筆問題） | 貼 P7；沒有既有 `analysis.md` | CRITICAL 0、HIGH 6、MEDIUM 4、LOW 4。HIGH：F1 FR-009／SC-002 與 FR-019 互相衝突（新預約先提交時設定必因數量不同被拒絕，設備留下預約，T039 斷言會失敗；處理 `clarify-over-specs`，再用 `tasks` 改 T039）；F2 research §2 與合約的檢查順序不同（`technical-research`）；F3 登記領取不鎖設備列，設定送修可能在領取後成功、違反 FR-005／SC-003（`technical-research`、`api-plan`）；F4 需人工審核的改期送出不鎖設備列（`technical-research`、`api-plan`）；F5 seed `deleteMany` vs FR-008（需要使用者決定，候選 `clarify-over-specs`、`technical-research`）；F6 全體預約是否顯示「成員取消」research §4 vs ui/plan（需要使用者決定，候選 `technical-research`、`ui-plan`）。MEDIUM：F7 管理員畫面兩頁 vs 單一 view（`system-analysis`）、F8 B4 兩種 409 在 ui/plan §5 沒有回饋（`ui-plan`）、F9 核准與改期的 `EQUIPMENT_UNAVAILABLE` 沒有畫面回饋（`ui-plan`）、F10 `slotCode` 大小寫（`api-plan`）。LOW：F11～F13（`tasks`、`api-plan`、`ui-plan`）、B1 NFR-002 量測環境（`clarify-over-specs`）。憲法：`shared.md` Rule 1、`openapi.md` Rule 1～7、`data-model.md` Rule 1～4 全部通過。`collect_coverage.py` 退出 0：需求 28／28（100%）、任務 46、介面 14、沒有 Planner 產出或沒有任務的介面 0、未對應需求任務 5、待確認 5、佔位符 0；主 session 重跑結果相同。**已知項目對照**：步驟 5 的上游衝突 3 項全部抓到（F2、F4、F5）；`tasks.md` Notes 待確認 1～5 全部抓到（F7、F6、F2、F4、F5）；待確認 5 判為 HIGH 不是 CRITICAL，理由是 `data-model.md` Rule 2 約束 `data-model.dbml`，DBML 本身寫軟刪除，`deleteMany` 寫在沒有專屬憲法的 `research.md`（主 session 核對後同意）；步驟 5 的待確認 11 項只直接對應 2 項（F7 拆兩頁、F10 欄位命名），1 項部分對應（F9），1 項明確判斷不違反（`time_slots` 的 `HH:mm` 不屬 Rule 3），其餘 7 項（尚無狀態變更、恢復可用不需確認、預覽 `checkedOutReservations` 補充、核准檢查順序、`isActive`→`status` 破壞性變更、`cancel_reason` 必填只在 note、新索引未列 research §1）沒有列為問題，這些多是 Planner 自行補充的細節，不一定是跨文件矛盾。另新抓到 2 項未曾記錄的衝突（F1、F3）。待驗證假設「`analyze` 漏查衝突」在本次不成立。執行方式：主 session 把 SOP 交給同模型子代理執行；子代理完成 Phase 1～3 的分析，但寫入 `analysis.md` 時被工具擋下（子代理不能用 Write 寫報告檔），改為回傳全文，由主 session 寫入；子代理自述 `ui/*.html` 的 `<style>` 區塊沒有逐行讀（偏離 Phase 1 步驟 5「讀全文」，CSS 不影響本次問題判斷）。主 session 複核：重跑 `collect_coverage.py`、以 `grep` 確認 14 筆問題的所有位置識別字都找得到、確認沒有殘留 `{{`、目標目錄只新增 `analysis.md`，並抽查 F1（research §3 第 69 行「因數量不同依 FR-019 拒絕」）、F3（§3 的 `FOR SHARE` 清單沒有登記領取）證據成立 | — |

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
| 0 → 2 | 步驟 0 依 runbook 要讀第 5 節本次備註與選題討論的迭代計畫，執行者在 `s-specify` 之前已知道觀察規則（送修時受影響預約的處理；停用與刪除的差別）與待驗證假設（`data-plan` 混用停用與刪除、`analyze` 漏查衝突） | 與 iter-4 流程不足第 2 列相同：`clarify` 問到觀察規則時，不能確定是 Skill 自己找到的，只能當弱證據 | 沒有；執行 `s-specify` 時只依 SOP 盤點，不主動帶入觀察規則 |

## 影片素材清單

| 要證明什麼 | 證據路徑 | commit SHA | 重現步驟 | 只能當下保存？ |
|---|---|---|---|---|
