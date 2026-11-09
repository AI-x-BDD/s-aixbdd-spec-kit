# 迭代 4：成員申請改期，改期成功前保留原預約

- spec 目錄：`specs/006-reservation-reschedule`
- 上一次 spec 目錄：`specs/005-equipment-pickup-return`
- 執行者：OpenCode＋Gemini 4 Argon（步驟 0 至步驟 2 Phase 1 步驟 4）；Claude Code＋Opus 5.5（步驟 2 Phase 1 步驟 5 起）
- 開始／結束：2026-11-09／2026-11-10

## 固定環境

| 項目 | 值 |
|---|---|
| 電腦 | stevedeMac-mini（macOS） |
| 執行工具與版本 | OpenCode 1.19.5，Build agent |
| 模型與 effort | Gemini 4 Argon，high |
| Skill 版本（開始時） | `7af9ae0` |
| 中途變動 | 2026-11-09，步驟 2（`s-specify`）Phase 1 步驟 5 起，改由 Claude Code 2.1.319＋Opus 5.5（effort high）接續，同一台電腦；Skill 版本仍為 `7af9ae0`。接續方式：讀交接檔 `handoff-iter4-step2.md`，從 Phase 1 步驟 5 開始。Phase 1 步驟 1～4 由 Argon 完成 |
| 臨時改寫的提示詞 | 沒有 |

## 步驟紀錄

| 步驟 | Skill | 產出 | 使用者做了什麼 | 問題 | commit |
|---|---|---|---|---|---|
| 0 | （準備） | `docs/iterations/iter-4.md` | 貼 P0 開始第 4 次迭代 | 沒有 | — |
| 2 | `s-specify` | `specs/006-reservation-reschedule/spec.md` | 回答 `clarify` 2 輪共 5 題（皆採推薦選項） | 第 5 節第 4 列兩條觀察規則都有問到：「重新審核」在第 1 輪第 1 題；「改期失敗時原預約如何保留」在第 1 輪第 2 題（核准時新時段被占用→原預約不變）、第 2 輪第 4 題（失敗的記錄方式）與第 5 題（審核中原時段開始→改期申請失效、原預約照常）。推定需求 9 條（FR-004、FR-005、FR-008、FR-012、FR-013、FR-014、FR-015、NFR-001、NFR-002，含沿用的 SC-003、SC-005）；未確認事項 15 項（9 項寫成推定需求、4 項推定排除寫進 Out of Scope、2 項寫成一般 Assumption）。另見「流程不足」：執行者換人、執行者事先知道觀察規則 | `b18f186` |
| 3 | `clarify-over-specs` | 更新 `specs/006-reservation-reschedule/spec.md` | 回答 2 輪共 5 題（皆採推薦選項） | 沒有。觀察規則在步驟 2 已問到，本步依「影響 × 不確定性」排序。新增 FR-016（審核中登記領取原預約→改期申請失效）、FR-017（時段頁面標示「本人改期審核中」）；改期申請狀態改名為「改期審核中／改期成功／改期被駁回／改期已撤回／改期已失效」；FR-004 推定確認；新增 Out of Scope「管理員代成員改期」（使用者決定）。仍有 8 條推定需求（FR-005、FR-008、FR-012～FR-015、NFR-001、NFR-002）與 4 項推定排除未提問，判定為低影響（Outstanding）；程式位置 `apps/equipment-loan/` 屬技術資訊（Deferred） | `b18f186` |
| 4 | `technical-research` | `specs/006-reservation-reschedule/research.md`、`techstack.md` | 貼 P4（沒有決策缺口，未進入 `clarify`；目錄內沒有舊檔，未跳出覆寫確認） | 沒有。5 個主題都有單一 Decision；本次新增的技術主題是「時段開始時自動失效」，決定採查詢前惰性失效，不引入 `node-cron`、`pg_cron`、BullMQ；沿用的技術在每個主題都寫出本次理由，沒有直接照抄 005 | `46d1f7f` |
| 5 | `system-analysis`（含 Planner） | `plan.md`；Wave 1 `ui-plan` → `ui/plan.md`、`index.html`、`booking.html`、`my-reservations.html`、`admin.html`；Wave 2 `api-plan` → `contracts/openapi.yaml`、`data-plan` → `data/data-model.dbml` | 貼 P5（視覺風格沿用 003，未提問；目錄內沒有舊產出，未跳出覆寫確認） | 3 種端點、12 個介面（F1～F4、B1～B6、D1～D2）、2 個 Wave；沒有「沒有 Planner」的端點；需求編號查核 24 個全部找到、US1～US3 全部引用。三個 Planner 的檢查腳本都是第 1 輪通過（`check_ui.py` ok、`check_contracts.py` issues 0、`check_data_model.py` issues 0）。Planner 回報的待確認 5 項，留給步驟 7 `analyze`：(1) 成員能否直接預約自己「本人改期審核中」的時段（雛形擋、API 不擋）；(2) 新時段被他人占用後對申請人顯示「已被預約」（API 推論）；(3) 改期申請編號 `request_no`／`requestNumber` 不在 spec 與 research §1，兩個 Planner 各自加上且名稱對應一致；(4) 取消或領取導致失效時 `expired_at` 寫操作時間（data-plan 自訂）；(5) research §3 在交易開頭做惰性失效，請求失敗回滾時失效也會被還原，與 SC-004 衝突（api-plan 指出，research 的設計缺陷；步驟 6 複查後降級：每個讀取路徑都會先重跑失效，回滾只會延後寫入，使用者看到的狀態仍正確，影響低） | `46d1f7f` |
| 6 | `tasks` | `specs/006-reservation-reschedule/tasks.md`（60 個任務：Setup 5、Foundational 6、US1 13、US2 13、US3 14、Polish 9） | 貼 P6 | 沒有。`check_tasks.py` issues 0、warnings 0。舊資料遷移：T013（增量 migration 並比對遷移前後 `reservations`）、T006、T016；舊功能回歸：T005（建立基準）、T054、T060，另有 T009、T019、T031、T032 確認既有功能不受影響；demo seed 擴充：T014、T025、T038（T059 補 README、T060 重跑 seed）。Notes 待確認 5 項：改期申請編號產生規則、失效原因畫面文字、惰性失效的操作清單不一致、錯誤回應缺少細節欄位、沿用 005 的命名不一致。執行方式：主 session 把 SOP 交給同模型子代理完整執行，主 session 重跑檢查腳本複核 | `b4253c2` |
| 7 | `analyze` | `specs/006-reservation-reschedule/analysis.md` | 貼 P7 | CRITICAL 0、HIGH 2、MEDIUM 9、LOW 2；需求涵蓋 25/25（100%）、介面涵蓋 12/12；12 條憲法規則全部通過。HIGH：F1 惰性失效操作清單不一致（`technical-research`、`api-plan`）；F2 失效結果是否隨錯誤回應回滾，research §3 與合約矛盾（需要使用者決定）。MEDIUM 中 C3（核准時本人在新時段已有預約，違反 `uq_reservations_user_active_request` 時合約沒有錯誤碼）與 C4（改期申請狀態轉移缺並發控制）是步驟 2～5 沒抓到的新缺口。執行方式：同步驟 6 由子代理執行 SOP；子代理的 Write 被拒（子代理不得寫報告檔），由主 session 依子代理回傳的全文寫入 | `b4253c2` |
| 8 | `implement` | `apps/equipment-loan/`（`reschedule_requests` 增量遷移、改期 demo seed、即時改期／改期審核／撤回／惰性失效前後端、單元／整合／E2E 測試、`README.md`）、更新 `tasks.md`（60/60 完成） | 貼 P8 | 沒有 Skill 問題；受阻任務 0；自行決策 65 條（見下節）。最後驗證（假時鐘 19:00）：check 0 錯誤、backend 25/25、frontend 3/3、e2e 4/4；回歸 12/12 與修改前基準相同；SC-001～SC-006 量測全部達標（SC-005 最大 21.9 ms）。執行方式：依 runbook「一個 Phase 跑一次」，每個 Phase 由同模型子代理以 `--scope phase:N` 完整執行 SOP 並 commit | `a5f132a`、`40c98bb`、`4e67507`、`396641e`、`db40955`、`3cb3836` |


### 步驟 8 `implement` 受阻任務與自行決策紀錄

- **受阻任務**：無（0 個）。
- **已知情況**：003～005 的既有測試 `backend/tests/integration/api.test.ts:44`、`:218` 與 `e2e/equipment-loan.spec.ts:81` 依賴「今日晚間時段 18:00–21:00 Asia/Taipei 尚未結束」，在時段外執行會失敗，修改前就存在，與本次無關。各 Phase 以假時鐘（平移 `Date` 到 19:00）比較回歸；工具放在 session scratchpad，沒有進版控。
- **自行決策紀錄**：

| Phase | 任務 | 情況 | 決定 | 影響範圍 |
|---|---|---|---|---|
| 1 | T004、T005 | 既有測試依賴晚間時段，23:32 執行時 backend 7/9、e2e 0/1 | 不改既有測試；基準記兩種條件（實際時間、時鐘 19:00 為 12/12） | T054、T060 的量測條件 |
| 1 | T005 | 任務要求「記錄」通過數，沒指定寫到哪裡 | 只記在 `check --verify` 與完成報告，不新增檔案 | 無 |
| 2 | T006 | `prisma migrate diff` 想重建兩條既有部分唯一索引 | 判定只是 `IN` → `= ANY(ARRAY)` 的文字正規化，不改；提醒 T013 刪除多出的語句 | T013 |
| 2 | T007 | 既有 `AppError` 沒有錯誤碼對狀態碼的對照 | 新增 `RESCHEDULE_ERROR_STATUS`、繁中預設訊息與 `rescheduleError()` | 改期服務 |
| 2 | T008 | 3 項時間工具中 2 項已有既有函式 | 只新增 `getSlotStartUtc`，其餘沿用 | T015、T039 |
| 2 | T009 | `requireAdmin` 的 403 訊息沒提到改期 | 不改，B1 行為維持不變 | 無 |
| 2 | T010 | 失效原因畫面文字沒有統一（待確認 2） | 採暫行做法 | T049、T055 |
| 2 | T010 | 既有 `zh-TW.test.ts` 斷言 `ERROR_MESSAGES` 恰好 19 個 key | 新錯誤碼放在 `RESCHEDULE_ERROR_MESSAGES`，擴充 `getErrorMessage` 一起查 | T055 |
| 2 | T011 | 合約的 `AdminReservationItem` 沒有 `canReschedule` 等欄位 | 拆出 `ReservationBaseDto`；依 `$ref` 新增 `TimeSlotSummary` | `client.ts` |
| 3 | T012 | Prisma 關聯要兩邊宣告，任務寫不改既有 model 欄位 | 只加關聯反向欄位（不產生資料庫欄位） | `schema.prisma` |
| 3 | T012、T014、T015 | `request_no` 產生規則未定義（待確認 1） | 格式 `RR-yyyyMMdd-隨機碼` | `seed.ts`、`rescheduleService.ts` |
| 3 | T013 | `prisma migrate dev` 在非互動環境不能執行 | 用 `script` 偽終端回答 y；刪掉重建既有索引的語句 | 遷移 `20261109154235_reschedule_requests` |
| 3 | T014 | 雛形的範例預約編號與 005 seed 衝突，日期寫死 | 沿用 005 的 `RV-20261108-05`；新增 `RV-20261109-13`、`RV-20261108-08`，日期動態 | `seed.ts` |
| 3 | T015 | 需人工審核路徑屬 T026 | 暫時回 500，T026 取代 | T026 |
| 3 | T015 | 上游沒規定同一預約被並發改期或取消（analyze C4） | 改寫預約時加條件（仍在原日期時段且 `confirmed`），否則 `RESCHEDULE_NOT_ALLOWED` | `rescheduleService.ts` |
| 3 | T016 | 命名轉換不一致（待確認 5） | 沿用 005 轉換；新增 `toMemberReservationDto` | `reservationService.ts` |
| 3 | T017 | zod 預設回英文訊息 | 新路由必填欄位補繁中訊息 | `reservationsRouter.ts` |
| 3 | T019、T024 | 寫入衝突時回 005 舊訊息 | 後端只改 P2002 訊息；前端自組「剛被其他預約占用」 | `reservationService.ts`、`EquipmentBookingView.tsx` |
| 3 | T021 | `client.ts` 沒有 `listEquipments` | 新增 | `client.ts` |
| 3 | T022 | 全域 CSS 在任務外檔案；API 只回預約 ID | 元件內 `rd-` 前綴樣式；`MY_RETURNED` 視為已被預約，`MY_RESCHEDULE_PENDING` 視為可改期（analyze C2） | `RescheduleDialog.tsx` |
| 3 | T023 | 頁頂錯誤要從對話框傳出 | `RescheduleDialog` 加 `onSubmitError` | `MyReservationsView.tsx` |
| 3 | Checkpoint | 回應缺少合約 `Reservation` 必填欄位 | 改用 `toMemberReservationDto`（合約權威高於 tasks） | `rescheduleService.ts`、`reservationService.ts` |
| 4 | T025、T026 | `request_no` 規則（待確認 1） | 同 Phase 3 | `seed.ts` |
| 4 | T025 | 雛形日期寫死 | 範例日期改成今天 +3／+4；可核准用 `RV-20261108-04`，駁回範例用 `RV-20261108-07` | `seed.ts`、US1 腳本預期 |
| 4 | T026 | 上游沒規定單一審核中的檢查順序與兩種 P2002 的區分 | 確認 `confirmed` 後先檢查；依索引名稱分成 `RESCHEDULE_ALREADY_PENDING`／`RESCHEDULE_SLOT_CONFLICT` | `rescheduleService.ts` |
| 4 | T028 | 核准時原預約非 `confirmed` 或時段已開始，失效寫入屬 US3 | 回 409 `INVALID_RESCHEDULE_STATUS`，不改申請狀態 | T039 |
| 4 | T028、T036 | 合約沒有占用者預約編號欄位（待確認 4） | 寫進錯誤訊息，前端從訊息取出 | `AdminOverviewView.tsx` |
| 4 | T029 | 空白駁回原因怎麼存未規定 | 存 `null`；服務層也檢查 200 字 | `rescheduleService.ts` |
| 4 | T030 | 任務寫 zod 驗證分頁，專案已有共用函式 | 用 `parsePaginationParams` | `adminRouter.ts` |
| 4 | T034 | T023 已實作 | 只驗證 | 無 |
| 4 | T035 | 沒有 `banner-pending` 樣式，只能改一個檔案 | inline style 套 `--pending` 色票 | `MyReservationsView.tsx` |
| 4 | T036 | 預設分頁「改期申請」與既有 e2e 衝突 | 依 ui/plan 預設「改期申請」，不改既有測試，留給 T054 | e2e `:98` |
| 4 | T036 | 駁回按鈕的行為屬 T037 | 先顯示按鈕 | T037 |
| 4 | T037 | 越權卡片與切換提示文字和 ui/plan 不同，既有 e2e 斷言 005 文字 | 越權卡片改 ui/plan 文字；切換提示保留 005 句子後接改期提示 | `AdminOverviewView.tsx` |
| 4 | Checkpoint | 改期被駁回的畫面屬 US3 | 本 Phase 以 HTTP 確認 | 無 |
| 5 | T038 | `request_no` 規則（待確認 1） | 同 Phase 3 | `seed.ts` |
| 5 | T038 | 雛形範例掛在 seed 不存在的預約 | 撤回範例改掛 `RV-20261109-12`；其餘沿用既有預約 | `seed.ts` |
| 5 | T038 | 「原時段開始」範例在 13:00 前執行 seed 時，失效時間晚於現在 | 接受，`expired_at` 依規定寫時段開始時間 | `seed.ts` |
| 5 | T039 | 惰性失效的操作清單不一致（待確認 3、analyze F1） | 取聯集；`cancelReservation` 不先跑 | T039、T042、T043 |
| 5 | T039 | 失效與操作同交易，操作回 409 時失效回滾（analyze F2） | 維持同一交易；`expired_at` 取時段開始時間，下一個操作會再寫入 | `rescheduleService.ts` |
| 5 | T039 | `listRescheduleRequests` 原本不在交易內 | 包進交易，開頭先跑失效 | `rescheduleService.ts` |
| 5 | T040 | 撤回失敗要顯示狀態與時間（待確認 4） | 寫進 `message` | `rescheduleService.ts` |
| 5 | T040 | 失效原因文字（待確認 2） | 沿用暫行文字 | `rescheduleService.ts` |
| 5 | T042 | 取消要不要先跑失效（待確認 3） | 不先跑；登記領取先跑 | `reservationService.ts` |
| 5 | T042 | 取消時 `updated_by` 未規定 | 取消填成員，領取填管理員 | `reservationService.ts` |
| 5 | T043 | `listAllReservations` 要不要先跑失效 | 先跑（聯集） | `reservationService.ts` |
| 5 | T043 | 合約 `AdminReservationItem.pendingRescheduleRequest` 必填 | 一律輸出，沒有時為 null | `reservationService.ts` |
| 5 | T044 | `z.coerce.boolean` 會把 `"false"` 轉成 true | 改用 `z.enum(["true","false"])` 再轉 boolean | `reservationsRouter.ts` |
| 5 | T045 | 命名轉換（待確認 5） | 沿用 005 | `equipmentService.ts` |
| 5 | T045 | 「本人改期審核中」與「本人待審核」同時段時誰優先未規定 | 照合約回 `MY_RESCHEDULE_PENDING` | T047、T048 |
| 5 | T045 | 進交易後不能用 `Promise.all` | 改依序查詢 | `equipmentService.ts` |
| 5 | T046 | `client.ts` 沒有 `listMyReservations` | 擴充既有 `listMyLoanReservations` | `client.ts` |
| 5 | T047 | badge 樣式在任務外檔案 | inline style | `SlotStatusBadge.tsx` |
| 5 | T048 | 圖例標題「6 態」不再正確 | 改成「固定時段狀態說明」 | `EquipmentBookingView.tsx` |
| 5 | T049 | 合約沒有「即時改期」旗標 | `approved` 且 `reviewedBy = null` 視為即時改期 | `MyReservationsView.tsx` |
| 5 | T050、T051 | 雛形橫幅文字與既有 e2e（`:196`、`:84`）斷言的 005 句子不同 | 保留 005 句子後接失效說明 | `MyReservationsView.tsx`、`AdminOverviewView.tsx` |
| 5 | T051 | 到期申請只得到通用 409 訊息 | 前端收到 `INVALID_RESCHEDULE_STATUS` 後查回最新狀態，組出 ui/plan 文字 | `AdminOverviewView.tsx` |
| 6 | T053 | 4 種請求不可能搶同一時段（免審核與需審核設備分屬不同路徑） | 分兩組各跑 4 輪（EQ-104、EQ-102） | `reschedule.test.ts` |
| 6 | T053 | 核准到期申請回 409 時失效寫入回滾 | 改用待審清單 API 量測 SC-004；服務不改，保留為已知現象 | 測試 |
| 6 | T054 | e2e `:98` 因預設分頁失敗 | 在既有測試加一次點擊「預約申請」分頁，不改任何斷言 | `e2e/equipment-loan.spec.ts` |
| 6 | T054、T060 | 既有測試依賴晚間時段 | 用假時鐘 19:00，與 T005 基準同條件；另以實際時間跑一次參考 | 量測條件 |
| 6 | T055 | 失效原因文字（待確認 2） | 沿用暫行做法 | `zh-TW.test.ts` |
| 6 | T056 | seed 沒有合適的明日免審核預約，對話框不讓點已占用格子 | 用 `RV-20261108-05`；A 先選、B 搶先、A 再送出 | `e2e/reschedule.spec.ts` |
| 6 | T057 | 沒有第二台電腦 | 同一台主機經區域網路介面 IP 量測 | 數字不含真實網路延遲 |
| 6 | T058 | 改期紀錄表格把 360px 頁面撐到 818px（本次造成） | 捲動容器加 `width: 0`、`minWidth: "100%"` | `MyReservationsView.tsx` |
| 6 | T058 | 設備預約頁超出 30px、管理頁超出 10px | 不改，005 已存在 | 無 |
| 6 | T058 | 淺色琥珀色文字對比 3.19:1，低於 WCAG AA | 保留 ui/plan 色碼（權威 2） | 要達 AA 需 `ui-plan` 調色 |

- **analyze 的 HIGH／MEDIUM 在實作中的結果**：F1、F2 依待確認 3 與 research §3 的暫行做法處理，F2 的回滾行為保留為已知現象（T053）；C4 由 T015 的條件更新部分處理；C2 由 T022 決定新時段顯示為可改期；C3（核准時本人在新時段已有預約）沒有專屬任務；依 T026 的決策，違反 `uq_reservations_user_active_request` 的 P2002 會歸為 `RESCHEDULE_SLOT_CONFLICT`，錯誤訊息不精確，留給步驟 9 驗證時確認。

## Skill 表現檢查

| Skill | 預期 | 實際 | 分類（需求缺漏／程式錯誤／Skill 缺陷／沒有問題） | 證據位置 |
|---|---|---|---|---|
| `s-specify` | 主動詢問第 5 節第 4 列觀察規則（「改期失敗時原預約如何保留」、「重新審核」），切分可獨立驗證的 User Story，並將 AI 預設值標為推定需求 | 2 輪 `clarify` 共 5 題涵蓋兩條觀察規則；切出 US1～US3、FR-001～FR-015、NFR-001～NFR-002、SC-001～SC-006，列出 9 條推定需求與 4 項推定排除。可信度有限，見「流程不足」 | 沒有問題 | `specs/006-reservation-reschedule/spec.md` `## Clarifications` |
| `clarify-over-specs` | 以 10 類分類表掃描整份 spec，依影響 × 不確定性排序，委派 `clarify` 提問並在每題標出分類，寫回最適合的段落並統一術語 | 掃出步驟 2 沒處理的狀態交互缺口（審核中提前登記領取，005 允許時段開始前領取），以及改期申請與預約狀態同名的術語衝突；5 題都標出分類；寫回 FR、驗收情境、Edge Cases、Key Entities、SC、Out of Scope、Clarifications，並移除已確認的推定引用 | 沒有問題 | `specs/006-reservation-reschedule/spec.md`（commit `b18f186`） |
| `clarify` | 依呼叫者指定的面向與題數上限（單輪最多 3 題、session 最多 5 題），直接於對話輸出 `Context`、`總結之提問` 與含推薦理由的 `Options` 表格，不使用 Ask 工具 | 第 1 輪 3 題、第 2 輪 2 題，依樣板直接輸出，第 2 題附 Mermaid 流程圖 | 沒有問題 | `specs/006-reservation-reschedule/spec.md` `## Clarifications` |
| `technical-research` | 只研究新增主題，每個主題單一 Decision 並寫出依據與替代方案 | 5 個主題都有單一 Decision；新增主題「自動失效」採惰性失效。漏定義兩件事，由 analyze 抓出：改期申請狀態轉移的並發控制（C4），以及 `request_no` 欄位（C1）；implement 以 T015 條件更新與暫行編號規則處理 | 需求缺漏 | `analysis.md` C1、C4；`research.md` §1、§2；`tasks.md` T015（決策紀錄 Phase 3） |
| `system-analysis` | 盤點介面、排 Wave、依 Wave 委派 Planner 並回報 | 12 個介面、2 個 Wave；需求編號查核 24/24、US1～US3 全部引用；三個 Planner 都有產出；回報了 Planner 的待確認 | 沒有問題 | `plan.md`；步驟紀錄第 5 列 |
| `ui-plan` | 依指定視覺風格產出 F1～F4 規劃與雛形 | 沿用 003 風格，4 頁雛形、`check_ui.py` ok。小缺口由 analyze 抓出：對話框中本人另一筆改期審核中的新時段怎麼顯示（C2）、失效原因缺 `new_slot_started` 文字（F4）、送出後 `RESCHEDULE_TARGET_INVALID` 的回饋（F7，ui-plan 在 Wave 1、SOP 規定不寫錯誤碼）；implement 以暫行做法處理，使用者驗證 15/15 通過 | 沒有問題 | `analysis.md` C2、F4、F7；`ui/plan.md` |
| `api-plan` | 依 spec、research 與前面 Wave 產出 B1～B6 合約，每個 operation 標出介面與需求 | 合約完整，`check_contracts.py` issues 0。但發現 research §3 的惰性失效在交易回滾時會被還原後，在 `info.description` 寫下與 research 相反的「失效結果不因本次請求的錯誤回應而還原」，只在回報中提醒，沒有以上游衝突處理；implement 依 research 實作，合約這句與程式行為不符 | Skill 缺陷 | `contracts/openapi.yaml` 第 9 行；`research.md` 第 57 行；`analysis.md` F2；決策紀錄 Phase 5 T039、Phase 6 T053；見「Skill 問題」問題 1 |
| `data-plan` | 依 Key Entities 與 research §1 產出 D1、D2 資料模型 | `check_data_model.py` issues 0；新增 `request_no`、`from_slot_id` 外鍵，並在回報中列出和 research §1 的差異與待確認 | 沒有問題 | `data/data-model.dbml`；步驟紀錄第 5 列 |
| `tasks` | 排出 Setup、Foundational、US1～US3、Polish；有遷移、回歸、demo seed 任務；上游缺口寫成 Notes 待確認 | 60 個任務、`check_tasks.py` issues 0／warnings 0；遷移 T013、回歸 T005／T054／T060、seed T014／T025／T038；Notes 待確認 5 項 | 沒有問題 | `tasks.md`；步驟紀錄第 6 列 |
| `analyze` | 不改上游，找出跨文件不一致並標出處理 Skill | CRITICAL 0、HIGH 2、MEDIUM 9、LOW 2；抓出步驟 2～6 都沒發現的 C3、C4 | 沒有問題 | `analysis.md` |
| `implement` | 一次一個任務、只讀 Must Read、驗證通過才打勾、全程不提問、決策寫進報告 | 60/60、受阻 0、決策 65 條；最後驗證 backend 25/25、frontend 3/3、e2e 4/4，回歸 12/12；Phase 4 Checkpoint 的既有 e2e 失敗依決策留到 T054 處理（加一次分頁點擊，不改斷言） | 沒有問題 | 步驟紀錄第 8 列與「步驟 8 implement 受阻任務與自行決策紀錄」 |
| （需求） | 核准改期時，成員在新時段已有自己的未結束預約，應有明確處理 | spec FR-006 沒有這個條件（analyze C3）；畫面擋住成員預約自己「本人改期審核中」的時段，所以只能從 API 觸發；觸發時回 `RESCHEDULE_SLOT_CONFLICT`，訊息不精確 | 需求缺漏 | `analysis.md` C3；決策紀錄 Phase 4 T026；留給下一次迭代或 `clarify-over-specs` |

## Skill 問題（交給 skill-engineering）

### 問題 1：api-plan

- 發生了什麼：api-plan 在 Wave 2 發現 research §3「在交易開頭呼叫 `expireDueRescheduleRequests`」會讓失效結果跟著請求失敗一起回滾。它沒有把這件事當成上游衝突處理，而是直接在合約 `info.description` 寫下相反的規則「失效結果不因本次請求的錯誤回應而還原」，只在子代理回報中提醒實作要改用獨立交易。之後 tasks、implement 都依 research 實作，最後合約的這句話與程式行為不符；implement 在 T053 量測 SC-004 時，必須改用會先提交失效的清單 API，才能量到 `expired`。
- 原本預期：Planner 發現技術研究的決策有問題時，合約要照 research 寫，或把衝突明確標成待確認並回報處理 Skill（`technical-research`），不要在合約中寫下與 research 相反、且沒有人採用的規則。
- 證據：`specs/006-reservation-reschedule/contracts/openapi.yaml` 第 9 行；`specs/006-reservation-reschedule/research.md` 第 57 行；`specs/006-reservation-reschedule/analysis.md` F2（HIGH）；本檔「步驟 8 implement 受阻任務與自行決策紀錄」Phase 5 T039、Phase 6 T053。api-plan SOP 只在 Phase 2 步驟 3 比對「憲法衝突」，沒有處理「和 spec 或技術研究衝突」的步驟。
- 影響：使用者看不到（每次讀取前都會重跑失效，`expired_at` 取時段開始時間）；但合約與程式不一致，analyze 標為 HIGH，SC-004 的量測方式要繞路。其他 Planner（ui-plan、data-plan）是否也缺這個步驟，未檢查。
- 處理結果：優化 commit `6669ebd`（`skill-engineering` 紀錄 `specs/skill-engineering/41-api-plan-合約與技術研究衝突時改寫規則/`）。根因 R1（缺失）：api-plan 只處理憲法衝突，沒有處理 spec／技術研究問題的規則與回報項目。修改：api-plan Phase 2 步驟 2 建立「上游衝突」（只回報、不委派 `clarify`、不停止）、Phase 3 步驟 5 回報「上游衝突」、`rules/API合約-格式規範.md` 新增 Rule 3；呼叫者 system-analysis Phase 5 步驟 3 轉述上游衝突。驗收（Sonnet medium、暫存複本）：S1 重跑 006 B1～B6，合約沒有與 research §3 相反的語句，上游衝突「無」（這次沒有發現回滾問題，發現與否仍取決於模型）；S2 重跑 005，列出 1 項上游衝突並依 spec 寫合約；S3 覆寫閘門不變；S4 system-analysis 回報演練通過。範圍只改 api-plan，data-plan、ui-plan 未改。P11b（以修改後的 Skill 重跑本次迭代的步驟 5）：使用者決定以 skill-engineering 驗收 S1 作為重跑結果，不在正式目錄重跑。理由：合約已實作，重產會讓合約與程式不一致。S1 結果見 `specs/skill-engineering/41-api-plan-合約與技術研究衝突時改寫規則/blueprint.md` §8。正式目錄的 `contracts/openapi.yaml` 第 9 行維持舊句，保留為優化前的證據

## 使用者驗證

- 驗證對象 commit：`3cb3836`（步驟 8 最後一個 commit）
- commit SHA：`3cb3836`
- 驗證方式：使用者要求由 AI 代為驗證（2026-11-10）。Claude Code 子代理以 Playwright 開兩個獨立 browser context（代表一般視窗與無痕視窗），走真實登入頁（從畫面讀驗證碼輸入），用實際時間、不用假時鐘，依 S5 → S1 → F1 → S2 → S3 → S4 → F2 → F3 → F4 → F5 → R1～R5 順序操作並截圖。**不是使用者親手操作。**
- 執行時間：2026-11-10 06:48:29–06:49:40（Asia/Taipei）；F5 在 18:00 前完成。
- 情境與結果：15/15 通過（S1～S5、F1～F5、R1～R5），沒有不符合預期的情境。
  - S5：林雅婷看到「改期成功」（審核時間「—」）、「改期已撤回」、2 筆「改期已失效」（原時段開始、原預約已取消）；陳冠廷看到「改期被駁回」與原因。
  - S1：即時改期成功、預約編號不變；陳冠廷看到原時段「可預約」並實際預約成功。
  - F1：已被預約的格子不能選，原預約不變。
  - S2、S3：送出後「改期審核中」、本人時段頁虛線框「本人改期審核中」、他人「可預約」；管理員預設「改期申請」分頁，核准後預約改到新時段、原時段釋出。
  - S4：撤回後「改期已撤回」，「申請改期」重新出現。
  - F2：核准衝突時紅色橫幅寫出占用者 `RV-20261109-12`；駁回原因超過 200 字時對話框不關閉；短原因駁回成功。
  - F3、F4：不可改期的 5 種預約沒有按鈕；一般成員看到「權限不足」。
  - F5：審核中登記領取原預約，申請變成「改期已失效」，原因「原預約已登記領取」。
  - R1～R5：驗證碼大小寫、免審核預約與取消、待審核准衝突、登記歸還與領取後禁取消、時段本人標示都正常。
- 偏離與注意：前兩輪有 3 個情境被驗證腳本誤判（腳本寫死編號、誤讀前一個情境的橫幅），修正腳本後從乾淨 seed 重跑第三輪，表內是第三輪結果。R5 的「本人借用中」來自 F5 剛登記領取的 `RV-20261108-06`，因為 R4 已把 `RV-20261108-03` 歸還。
- 證據：截圖與腳本原本放在 session scratchpad（`scratchpad/uv/shots/`、`uv.mjs`、`run3.log`）；步驟 12 已複製到 `docs/tmp/iter-4-uv/`（被 git 忽略，不在 repo）；可用 `db:seed` 重現。
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

### 重設展示資料

```bash
cd apps/equipment-loan && npm run db:seed
```

- 2026-11-10 06:36 已實際執行並確認：17 筆預約；改期申請 8 筆，涵蓋 5 種狀態（改期審核中 3、改期成功 1、改期被駁回 1、改期已撤回 1、改期已失效 2）。
- 下列「今天」「明天」「後天」都以執行 `db:seed` 當天為準。換天驗證時，先重跑 `db:seed`。
- 每個情境會改變資料。要重做某個情境時，先重跑 `db:seed`。
- 情境 F5 要在今天 18:00 前做。18:00 一到，`RV-20261108-06` 的原時段開始，它的改期申請會自動失效，失效原因會變成「原時段開始」。

### 帳號與視窗

- 一般視窗：成員。無痕視窗：另一位成員或管理員。
- 林雅婷 `lin.yating`、陳冠廷 `chen.guanting`（密碼 `Member@2026`）；管理員吳承翰 `wu.chenghan`（密碼 `Admin@2026`）。登入頁可按「預建展示帳號快速帶入」。

### 成功操作

| 編號 | 操作步驟 | 預期結果 |
|---|---|---|
| S1 免審核即時改期（US1） | 1. 林雅婷開「我的預約」。2. 在 `RV-20261108-05`（`EQ-104` 後天上午）按「申請改期」。3. 選後天下午，送出。4. 陳冠廷開「設備預約」，選後天，看 `EQ-104` 上午。 | 綠色橫幅顯示改期成功；預約編號仍是 `RV-20261108-05`，狀態「已核准／有效」，時段變成後天下午；改期紀錄有一筆「改期成功」。陳冠廷看到後天上午「可預約」，而且可以預約。 |
| S2 需人工審核改期送出（US2） | 1. 陳冠廷開「我的預約」。2. 在 `RV-20261108-07`（`EQ-101` 明天下午）按「申請改期」。3. 選後天上午，送出。4. 陳冠廷與林雅婷各開「設備預約」，選後天，看 `EQ-101` 上午。 | 琥珀色橫幅顯示改期審核中；原預約仍是明天下午、「已核准／有效」；這筆預約不再顯示「申請改期」。陳冠廷看到後天上午「本人改期審核中」（虛線框），林雅婷看到「可預約」。 |
| S3 管理員核准改期（US2） | 1. 吳承翰開「審核與借用管理」。2. 確認預設顯示「改期申請」分頁。3. 核准 S2 的申請。4. 陳冠廷重新整理「我的預約」；林雅婷看 `EQ-101` 明天下午。 | 綠色橫幅；申請從清單移除。陳冠廷的 `RV-20261108-07` 變成後天上午，改期紀錄顯示「改期成功」與審核時間。林雅婷看到明天下午「可預約」。 |
| S4 成員撤回（US3） | 1. 林雅婷開「我的預約」。2. 在 `RV-20261108-04` 的改期紀錄按「撤回」並確認。3. 吳承翰重新整理「改期申請」分頁。 | 申請變成「改期已撤回」；原預約仍是明天上午、「已核准／有效」，重新出現「申請改期」。管理員清單不再有這筆。 |
| S5 改期紀錄與篩選（US3） | 1. 林雅婷開「我的預約」，檢視各預約的改期紀錄，切換「改期審核中」篩選。2. 陳冠廷開「我的預約」，看 `RV-20261108-07` 的紀錄（S3 之前先看）。 | 林雅婷看到：`RV-20261108-08`「改期成功」（即時改期，沒有審核者）、`RV-20261109-12`「改期已撤回」、`RV-20261108-03`「改期已失效」（原時段開始）、`RV-20261107-06`「改期已失效」（原預約已取消）。每筆都有原時段、新時段與申請時間。陳冠廷的 `RV-20261108-07` 有一筆「改期被駁回」與駁回原因。 |

### 關鍵失敗

| 編號 | 操作步驟 | 預期結果 |
|---|---|---|
| F1 新時段已被占用（FR-001、FR-002） | 林雅婷對 `RV-20261108-05` 開「申請改期」，點後天晚間。 | 格子標示「已被預約」，點選時顯示原因，不能送出；原預約不變。 |
| F2 核准衝突與駁回（FR-006、FR-007） | 1. 吳承翰在「改期申請」分頁核准陳冠廷 `RV-20261108-11` 的申請。2. 改按「駁回」，先貼超過 200 字的原因，再改成短原因送出。 | 1. 該列紅框，紅色橫幅說明新時段已被 `RV-20261109-12` 占用；申請仍是「改期審核中」，原預約不變。2. 超過 200 字時欄位紅框、對話框不關閉；送出短原因後申請變成「改期被駁回」，陳冠廷看得到原因。 |
| F3 不可改期的預約（FR-001、FR-004） | 林雅婷在「我的預約」檢視「借用中」的 `RV-20261108-03`、「已駁回」的 `RV-20261109-07`、「已取消」的 `RV-20261107-06`、「待審核」的 `RV-20261109-08`，以及有改期審核中申請的預約。 | 這些預約都沒有「申請改期」按鈕。 |
| F4 一般成員越權（FR-005） | 林雅婷開「審核與借用管理」。 | 顯示「權限不足」卡片，看不到核准與駁回按鈕。 |
| F5 審核中登記領取原預約（FR-016，今天 18:00 前） | 1. 吳承翰在「改期申請」分頁確認有 `RV-20261108-06` 的申請。2. 在全體預約管理對 `RV-20261108-06`（`EQ-103` 今天晚間）按「登記領取」。3. 林雅婷看 `RV-20261108-06` 的改期紀錄。 | 登記領取成功，預約變成「借用中」；橫幅說明改期申請已失效；申請從「改期申請」分頁移除。林雅婷看到「改期已失效」，原因「原預約已登記領取」。 |

### 前幾次功能的回歸

| 編號 | 操作步驟 | 預期結果 |
|---|---|---|
| R1 驗證碼登入（003） | 用錯誤大小寫的驗證碼登入一次，再用正確驗證碼登入。 | 第一次被拒並顯示繁中錯誤，驗證碼重新產生；第二次登入成功。 |
| R2 免審核預約與取消（003） | 陳冠廷在「設備預約」預約 `EQ-103` 一個空的未來時段，再到「我的預約」取消。 | 預約立即成為「已核准／有效」；取消後變成「已取消」，時段重新「可預約」。 |
| R3 待審預約核准衝突（004） | 吳承翰切到「預約申請」分頁，核准 `RV-20261109-08`，再核准 `RV-20261109-09`。 | 第一筆成功；第二筆顯示時段衝突，維持「待審核」。 |
| R4 登記歸還與領取後禁取消（005） | 1. 林雅婷檢視「借用中」的 `RV-20261108-03`。2. 吳承翰對它按「登記歸還」。 | 1. 沒有取消按鈕；頁頂「目前借用中設備」列出它。2. 變成「已歸還」，顯示歸還時間與經手管理員。 |
| R5 時段 6 態標示（005） | 林雅婷與陳冠廷各開「設備預約」，選今天。 | 林雅婷看到本人的「本人借用中」「本人已歸還」標示；陳冠廷看到同一時段「已被預約」，看不到借用人。 |

### 不在本次手動驗證內

- analyze C3（核准時本人在新時段已有預約）：畫面不讓成員預約自己「本人改期審核中」的時段，所以手動操作無法重現；只能用 API 觸發，結果是 `RESCHEDULE_SLOT_CONFLICT`，訊息不精確。
- 003～005 有 3 個既有自動化測試只在 18:00–21:00 通過，修改前就存在；手動驗證不受影響。

## 流程不足

| 步驟 | 問題 | 影響 | 試過的優化 |
|---|---|---|---|
| 2 | 步驟 2 中途換執行者：Phase 1 步驟 1～4 由 Argon 做，步驟 5 起由 Claude Code＋Opus 5.5 做 | runbook 第 6 節第 5 點：Skill 表現的差異可能來自模型。本次 `s-specify` 的提問品質不能直接和第 1～3 次迭代（Argon）比較 | 沒有；已記入「固定環境」的中途變動 |
| 2 | 交接檔 `handoff-iter4-step2.md` 寫出了觀察規則與「可能的缺口候選」（審核、新時段占位、失敗時原預約、可改期狀態等），接手的執行者在 Phase 1 步驟 5 盤點缺口之前就讀到 | 違反 runbook 9.1 第 3 點「功能描述不寫答案」的用意：`clarify` 問到觀察規則，不能確定是 Skill 自己找到的，還是執行者受交接檔影響。本次「有問到」的結論只能當弱證據 | 沒有；之後的交接檔不寫觀察規則與缺口候選，只寫做到哪一步 |
| 4 → 7 | research §3 的惰性失效放在交易開頭，請求失敗時失效會一起回滾；api-plan 在步驟 5 發現後，沒有回報上游衝突，而是在合約寫下相反規則；直到步驟 7 `analyze` 才以 F2（HIGH）抓出。research 另有缺漏 C1（`request_no`）、C4（改期申請並發控制），需求另有缺漏 C3（核准時本人在新時段已有預約） | 合約與程式不一致；implement 只能用暫行做法（決策紀錄 T015、T026、T039、T053）；C3 的錯誤訊息不精確 | 問題 1 已優化 api-plan（`6669ebd`）。research 的 C1、C4 與需求 C3 沒有處理，留給下一次迭代或 `clarify-over-specs`；data-plan、ui-plan 是否有同樣缺口未檢查 |
| 6～9 | 主 session 沒有自己跑 Skill，而是把 `tasks`、`analyze`、`implement`（每個 Phase 一個子代理，`--scope phase:N`）與使用者驗證交給同模型子代理完整執行，主 session 只重跑檢查腳本複核 | 主 session 的上下文較乾淨；但 Skill 的提問與決策過程只留在子代理回報，主 session 看不到中間過程，紀錄依賴子代理回報的完整度 | 沒有；已記入步驟紀錄第 6～8 列的「執行方式」 |
| 7 | `analyze` 子代理的 Write 被拒（子代理不得寫報告檔） | `analysis.md` 由主 session 依子代理回傳的全文寫入，不是 Skill 自己寫檔；回傳全文與檔案是否完全相同，只能靠主 session 照貼 | 沒有；之後委派 `analyze` 時，可改由主 session 直接執行，或事先確認子代理的寫檔權限 |
| 8 | 003～005 有 3 個既有測試（`backend/tests/integration/api.test.ts:44`、`:218`、`e2e/equipment-loan.spec.ts:81`）依賴「今日晚間時段 18:00–21:00 Asia/Taipei 尚未結束」，修改前就存在 | 時段外執行時，回歸測試會失敗，看不出是不是本次造成；各 Phase 要用假時鐘（平移 `Date` 到 19:00）比較回歸 | 假時鐘工具放在 session scratchpad，沒有進版控。既有測試沒有修，留給之後的迭代改成不依賴實際時間 |
| 6 → 8 | US2 依 ui/plan 把管理員待審區塊預設改成「改期申請」分頁，使 005 的 e2e `:98` 失敗；`tasks` 沒有預先排「更新既有 e2e」的任務 | Phase 4 Checkpoint 有既有 e2e 失敗，到 Polish T054 才補一次分頁點擊（不改斷言） | 沒有；之後 `tasks` 遇到 ui/plan 改變既有畫面預設值時，要排更新既有測試的任務 |
| 9 | 使用者要求 AI 代為驗證（Playwright 雙 browser context、實際時間），不是使用者親手操作 | 「使用者回饋」空白；依專案規則第 6 條，tag 要等使用者實際驗證通過才提議。前兩輪驗證腳本誤判 3 個情境，第三輪才 15/15 | 本次沒有沿用 implement 的 e2e 腳本，另寫獨立腳本走真實登入頁並截圖（回應 iter-3 流程不足第 2 列）；使用者親手抽查仍待補 |

## 影片素材清單

| 要證明什麼 | 證據路徑 | commit SHA | 重現步驟 | 只能當下保存？ |
|---|---|---|---|---|
| Skill 優化案例（建議影片用，待使用者決定）：`analyze` 抓出 api-plan 合約與 research 矛盾（F2），`skill-engineering` 做根因分析，api-plan 新增「上游衝突」回報；驗收 S1 重跑 006 後合約不再有相反語句，S2 重跑 005 列出 1 項上游衝突 | `specs/006-reservation-reschedule/analysis.md` F2；`specs/006-reservation-reschedule/contracts/openapi.yaml` 第 9 行（優化前的合約）；`specs/006-reservation-reschedule/research.md` 第 57 行；`specs/skill-engineering/41-api-plan-合約與技術研究衝突時改寫規則/rca-report.md`、`blueprint.md` §8；本檔「Skill 問題」問題 1 | `46d1f7f`（合約）、`b4253c2`（analysis）、`6669ebd`（優化） | 1. `git show 6669ebd` 看 api-plan 的修改。2. 對照 `openapi.yaml` 第 9 行與 `research.md` 第 57 行。3. 依 `blueprint.md` §7 在暫存複本重跑 S1、S2 | 否 |
| `clarify` 主動問到觀察規則（「改期失敗時原預約如何保留」「重新審核」）。弱證據：執行者事先讀過交接檔的觀察規則（流程不足第 2 列），影片使用時要說明 | `specs/006-reservation-reschedule/spec.md` `## Clarifications` | `b18f186` | 檢視 spec.md 的 Clarifications 與步驟紀錄第 2～3 列 | 否（提問當下的對話沒有保存） |
| 改期功能畫面：即時改期、改期審核中、管理員核准與駁回、撤回、自動失效、回歸 | 驗證截圖 `docs/tmp/iter-4-uv/shots/`（S1～S5、F1～F5、R1～R5，被 git 忽略）；驗證腳本 `docs/tmp/iter-4-uv/uv.mjs`、`run3.log` | `3cb3836` | 依「使用者驗證」的啟動方式與 `npm run db:seed` 重設資料，照情境表操作；F5 要在當天 18:00 前做 | 否（可重現；截圖只存在本機） |
| 改期的資料遷移、並發與量測：`reschedule_requests` 增量遷移、即時改期併發搶時段、SC-001～SC-006 量測 | `apps/equipment-loan/backend/prisma/migrations/20261109154235_reschedule_requests/`、`apps/equipment-loan/backend/tests/`、`apps/equipment-loan/e2e/reschedule.spec.ts` | `4e67507`、`3cb3836` | 在 `apps/equipment-loan/` 執行 `npm run db:migrate`、`npm run test:backend`、`npm run test:e2e`（既有 3 個測試要在 18:00–21:00 執行） | 否 |
