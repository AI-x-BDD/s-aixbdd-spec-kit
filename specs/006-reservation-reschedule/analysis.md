# 一致性分析報告：成員預約改期申請與改期成功前保留原預約 (Reservation Reschedule Request)

- **Spec 目錄**：`specs/006-reservation-reschedule/`
- **分析日期**：2026-11-09
- **已分析文件**：`spec.md`、`plan.md`、`tasks.md`、`research.md`、`techstack.md`、`contracts/openapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`、`ui/booking.html`、`ui/my-reservations.html`、`ui/admin.html`
- **已讀取的憲法檔**：`shared.md`、`skills/api-plan/openapi.md`、`skills/data-plan/data-model.md`
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | 不一致 | HIGH | `research.md` → `expireDueRescheduleRequests`；`contracts/openapi.yaml` → `listAllReservations`、`cancelReservation` | 已記錄：tasks.md 待確認 3。惰性失效要先執行的操作清單不一致：`research.md` §3 與合約 `info.description` 都列 8 個操作，不含 `listAllReservations`，但 `listAllReservations` 的 description 寫查詢前先失效；兩份都沒有列 `cancelReservation`，成員取消一筆新時段已開始、尚未被惰性失效的申請時，`expire_reason` 會記成 `reservation_cancelled`，不是 `new_slot_started`，借用管理表格也可能把已到期的申請標成「改期審核中」 | 以兩份文件的聯集為準，並補上 `cancelReservation`：在 `research.md` §3 的操作清單加入 `listAllReservations` 與 `cancelReservation`；在 `contracts/openapi.yaml` 的 `info.description` 清單加入「管理員全體預約查詢」與「取消預約」，並在 `cancelReservation` 的 description 寫明處理前先讓到期的改期申請失效 | `technical-research`（`research.md`）、`api-plan`（`contracts/openapi.yaml`） |
| F2 | 不一致 | HIGH | `research.md` → `交易開頭都先呼叫此函式`；`contracts/openapi.yaml` → `失效結果不因本次請求的錯誤回應而還原` | `research.md` §3 要求在各操作的交易開頭呼叫 `expireDueRescheduleRequests`，§2 又規定每個寫入操作在單一互動式交易內完成；核准、撤回或送出改期回 `409` 時交易回滾，失效結果也一起還原。合約卻寫「失效結果不因本次請求的錯誤回應而還原」。兩種做法的資料庫狀態不同，T053 對 SC-004「申請 100% 變成 `expired`」的斷言結果也會不同 | 需要使用者決定：以合約為準時，把 `research.md` §3 改成「在主交易之前以獨立交易執行並提交失效」；以 `research.md` 為準時，刪除合約 `info.description` 的這句話，並註明失效結果只在操作成功或下一次查詢時保存 | 需要使用者決定（候選：`technical-research`、`api-plan`） |
| C1 | 不足 | MEDIUM | `data/data-model.dbml` → `request_no`；`research.md` → `新增資料表` | 已記錄：tasks.md 待確認 1。`request_no` 只有範例 `RR-20261109-02`，沒有定義產生規則（日期取申請日或新日期、流水號或亂數）；`research.md` §1 的 `reschedule_requests` 欄位清單也沒有 `request_no`，T012、T014、T015、T025、T026、T038 只能用暫行做法 | 在 `data/data-model.dbml` 的 `request_no` note 寫明格式與產生規則（例如 `RR-` 加申請當下 `Asia/Taipei` 日期 `yyyyMMdd` 加流水號或隨機碼，以及唯一衝突時的處理）；並在 `research.md` §1 的欄位清單補上 `request_no` | `data-plan`、`technical-research` |
| C2 | 不足 | MEDIUM | `ui/plan.md` → `申請改期（免審核設備）`；`contracts/openapi.yaml` → `MY_RESCHEDULE_PENDING`；`ui/my-reservations.html` → `cellStatus` | 申請改期對話框沒有定義本人另一筆改期審核中申請的新時段要顯示成什麼。合約對該時段回傳 `MY_RESCHEDULE_PENDING` 且 `isBookable = false`；雛形的 `cellStatus` 不看改期申請，把它顯示為「可改期」；後端依 FR-001 也會接受。T022 依 `slotStatus` 與 `isBookable` 判斷格子時，結果不確定 | 在 `ui/plan.md` §4 的「申請改期（免審核設備）」「申請改期（需人工審核設備）」補上 `MY_RESCHEDULE_PENDING` 格子的標示與可否選取，並同步 `ui/my-reservations.html` 的 `cellStatus` | `ui-plan` |
| C3 | 不足 | MEDIUM | `spec.md` → `FR-006`；`contracts/openapi.yaml` → `approveRescheduleRequest`；`data/data-model.dbml` → `uq_reservations_user_active_request` | FR-006 的核准檢查沒有包含「成員在新時段沒有其他未結束預約」。成員送出改期後，可以再對同一設備、同一新時段建立預約；之後核准改期時 UPDATE 會違反 `uq_reservations_user_active_request`，合約沒有定義這個情況的錯誤碼，T028 只把 `uq_reservations_active_slot` 的 `P2002` 轉成 `RESCHEDULE_SLOT_CONFLICT` | 在 `spec.md` FR-006 補上這個核准條件與失敗結果（申請維持「改期審核中」或改為其他狀態），再在 `contracts/openapi.yaml` 的 `approveRescheduleRequest` 與 `ApproveRescheduleConflict` 補上對應錯誤碼 | 需要使用者決定（候選：`clarify-over-specs`、`api-plan`） |
| C4 | 不足 | MEDIUM | `research.md` → `改期、核准、駁回、撤回 API 與交易內並發衝突處理`；`spec.md` → `SC-002` | `research.md` §2 只用部分唯一索引處理時段搶占，沒有定義同一筆改期申請同時被撤回與核准、或核准與取消原預約／登記領取同時發生時的處理（例如以 `WHERE status = 'pending_approval'` 的條件更新或列鎖）。兩個交易都可能成功，撤回後原預約仍被改到新時段，違反 SC-002「原預約變動率 0%」 | 在 `research.md` §2 補上改期申請狀態轉移的並發控制：撤回、核准、駁回與失效都以 `status = 'pending_approval'` 為條件更新，更新筆數為 0 時回 `409 INVALID_RESCHEDULE_STATUS`；核准時鎖定原預約列 | `technical-research` |
| F3 | 不一致 | MEDIUM | `data/data-model.dbml` → `request_no`；`contracts/openapi.yaml` → `requestNumber` | 已記錄：tasks.md 待確認 1。改期申請編號在資料表為 `request_no`，在合約為 `requestNumber`，可以一一對應但命名不同 | 沿用 005 `reservation_no` ↔ `reservationNumber` 的慣例，在 `data/data-model.dbml` 的 `request_no` note 寫明對應合約欄位 `requestNumber` | `data-plan` |
| F4 | 不一致 | MEDIUM | `spec.md` → `改期申請 (Reschedule Request)`；`ui/plan.md` → `原預約已取消`；`ui/my-reservations.html` → `原預約已登記領取`；`contracts/openapi.yaml` → `RescheduleExpireReason` | 已記錄：tasks.md 待確認 2。失效原因的畫面文字沒有統一：spec Key Entities 寫「原時段開始、新時段開始、原預約取消、原預約被登記領取」，`ui/plan.md` 與雛形寫「原時段開始」「原預約已取消」「原預約已登記領取」，且沒有 `new_slot_started` 的文字 | 在 `ui/plan.md` §4「預約清單與改期紀錄」補上 `RescheduleExpireReason` 4 個值與畫面文字的對應表（含 `new_slot_started`），並同步雛形 | `ui-plan` |
| F5 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `ApproveRescheduleConflict`、`AdminRescheduleRequestItem`；`ui/plan.md` → `核准時新時段已被占用` | 已記錄：tasks.md 待確認 4。`ui/plan.md` §5 要在列上標示占用新時段的預約編號，並在「審核時申請已撤回」「撤回失敗」「核准時原時段已開始」顯示時間、操作者與失效原因；合約 `Error` 只有 `code` 與 `message`，`AdminRescheduleRequestItem` 也沒有占用預約編號欄位 | 需要使用者決定：在合約的 `Error` 加選填的 `details`（例如 `conflictReservationNumber`、`currentStatus`、`changedAt`），或把 `ui/plan.md` §5 改成只顯示後端 `message` | 需要使用者決定（候選：`api-plan`、`ui-plan`） |
| F6 | 不一致 | MEDIUM | `data/data-model.dbml` → `slot_code`、`Table equipments`；`contracts/openapi.yaml` → `slotCode`、`isActive` | 已記錄：tasks.md 待確認 5。沿用 005 的命名可以一一對應但不同：`slot_code` 小寫 `morning` 等對應合約大寫 `MORNING` 等；`equipments.status`（`available`／`unavailable`）對應 `isActive`；`reservation_no`、`checked_out_by`、`returned_by` 對應 `reservationNumber`、`checkedOutByUserId`、`returnedByUserId` | 在 `data/data-model.dbml` 對應欄位的 note 寫明合約欄位名稱與值的轉換（大小寫、`status` ↔ `isActive`），不改欄位本身 | `data-plan` |
| F7 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `RESCHEDULE_TARGET_INVALID`；`ui/plan.md` → `驗證與錯誤回饋` | 合約在送出改期時可能回 `400 RESCHEDULE_TARGET_INVALID`（例如對話框開著時新時段已開始）；`ui/plan.md` §5 只定義點選格子時的提示，沒有送出後收到此錯誤碼的畫面回饋 | 在 `ui/plan.md` §5 的 `my-reservations.html` 新增「送出時新時段已不符合條件」：對話框顯示後端 `message`、重新載入格子，原預約不變；並同步雛形 | `ui-plan` |
| A1 | 重複 | LOW | `spec.md` → `NFR-002`、`SC-005` | NFR-002 與 SC-005 用幾乎相同的文字描述同一組操作「回應時間低於 2 秒」 | 在 `spec.md` 保留 NFR-002 的條件，把 SC-005 改成引用 NFR-002 的量測結果（例如「NFR-002 所列操作 100% 低於 2 秒」） | `s-specify` |
| B1 | 歧義 | LOW | `spec.md` → `NFR-002` | 「一般單機與區域網路環境」沒有量化的量測條件（資料量、並發數、硬體），T057 的量測結果無法比較 | 在 `spec.md` NFR-002 寫出量測條件，例如「demo seed 資料量、單一使用者、本機 Docker PostgreSQL」 | `clarify-over-specs` |

超過 50 筆的部分：無（共 13 筆，未超過 50 筆）

## 2. 需求涵蓋

| 需求編號 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- |
| FR-001 | 是 | T008、T015、T016、T017、T018、T021、T022、T023、T052 | 見 C2 |
| FR-002 | 是 | T012、T015、T017、T018、T021、T022、T023、T024、T032 | |
| FR-003 | 是 | T026、T034、T035、T045、T048 | |
| FR-004 | 是 | T012、T016、T026、T035、T053 | |
| FR-005 | 是 | T009、T027、T030、T033、T036、T037 | 見 F5 |
| FR-006 | 是 | T008、T028、T032、T033、T036 | 見 C3、C4 |
| FR-007 | 是 | T029、T033、T037 | |
| FR-008 | 是 | T026、T027、T031、T037 | |
| FR-009 | 是 | T010、T011、T012、T016、T043、T044、T046、T049、T058 | 見 F4 |
| FR-010 | 是 | T040、T041、T046、T050 | 見 C4 |
| FR-011 | 是 | T008、T039、T042、T051 | 見 F1、F2 |
| FR-012 | 是 | T008、T039、T051 | 見 F1、F2 |
| FR-013 | 是 | T042、T050 | 見 F1 |
| FR-014 | 是 | T006、T015、T019、T022、T024、T028、T032 | |
| FR-015 | 是 | T005、T006、T009、T012、T013、T014、T020、T025、T038、T054、T059、T060 | |
| FR-016 | 是 | T042、T043、T051 | |
| FR-017 | 是 | T010、T011、T045、T047、T048、T058 | 見 C2 |
| NFR-001 | 是 | T007、T010、T020、T022、T055、T058 | |
| NFR-002 | 是 | T023、T050、T057 | 見 A1、B1 |
| SC-001 | 是 | T015、T053 | |
| SC-002 | 是 | T026、T028、T029、T040、T053 | 見 C4 |
| SC-003 | 是 | T053 | |
| SC-004 | 是 | T039、T042、T051、T053 | 見 F1、F2 |
| SC-005 | 是 | T057 | 見 A1 |
| SC-006 | 是 | T005、T009、T030、T037、T053、T054、T060 | |

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
| F1 驗證碼與帳號密碼登入登出介面 | 前端 | `ui/plan.md` → §1、§3.1；`ui/index.html` | T020、T021、T022、T023、T024 | |
| F2 設備時段狀態與預約介面（含本人改期審核中標示） | 前端 | `ui/plan.md` → §1、§3.1；`ui/booking.html` | T010、T011、T020、T021、T022、T023、T024、T046、T047、T048、T049、T050、T051 | |
| F3 成員預約清單、申請改期、改期紀錄與撤回介面 | 前端 | `ui/plan.md` → §1、§3.1；`ui/my-reservations.html` | T010、T011、T020、T021、T022、T023、T024、T033、T034、T035、T036、T037、T046、T047、T048、T049、T050、T051 | 見 C2、F4、F7 |
| F4 管理員改期申請審核、待審預約與現場領取歸還介面 | 前端 | `ui/plan.md` → §1、§3.1；`ui/admin.html` | T010、T011、T033、T034、T035、T036、T037、T046、T047、T048、T049、T050、T051 | 見 F5 |
| B1 驗證碼挑戰與登入工作階段 API | 後端 | `contracts/openapi.yaml` → `createCaptchaChallenge`、`login`、`getCurrentUser`、`logout` | T007、T008、T009 | |
| B2 設備時段狀態查詢與預約建立 API | 後端 | `contracts/openapi.yaml` → `listEquipments`、`createReservation` | T007、T008、T009、T015、T016、T017、T018、T019、T039、T040、T041、T042、T043、T044、T045 | 見 C2 |
| B3 成員預約查詢、取消與改期申請送出、撤回 API | 後端 | `contracts/openapi.yaml` → `listMyReservations`、`listMyLoanReservations`、`cancelReservation`、`createRescheduleRequest`、`withdrawRescheduleRequest` | T007、T008、T009、T015、T016、T017、T018、T019、T026、T027、T028、T029、T030、T031、T032、T039、T040、T041、T042、T043、T044、T045 | 見 F1、F2、F7、C4 |
| B4 管理員待審清單（含改期申請）與核准駁回 API | 後端 | `contracts/openapi.yaml` → `listPendingReservations`、`listAllReservations`、`approveReservation`、`rejectReservation`、`listRescheduleRequests`、`approveRescheduleRequest`、`rejectRescheduleRequest` | T007、T008、T009、T026、T027、T028、T029、T030、T031、T032、T039、T040、T041、T042、T043、T044、T045 | 見 F1、F2、F5、C3、C4 |
| B5 管理員現場登記領取與登記歸還 API | 後端 | `contracts/openapi.yaml` → `pickupReservationByAdmin`、`returnReservationByAdmin` | T007、T008、T009、T039、T040、T041、T042、T043、T044、T045 | 見 C4 |
| B6 管理員設備人工審核設定切換 API | 後端 | `contracts/openapi.yaml` → `listAdminEquipments`、`updateEquipmentApprovalMode` | T026、T027、T028、T029、T030、T031、T032 | |
| D1 帳號、驗證碼挑戰與工作階段資料存取 | 資料庫 | `data/data-model.dbml` → `Table users`、`Table captcha_challenges`、`Table sessions` | T006 | |
| D2 預約借還紀錄與改期申請持久化 | 資料庫 | `data/data-model.dbml` → `Table equipments`、`Table time_slots`、`Table reservations`、`Table reschedule_requests` | T006、T012、T013、T014、T025、T038 | 見 C1、C3、F3、F6 |

## 4. 憲法遵循

| 憲法檔 | Rule | 適用產出物 | 結果 | 問題 ID |
| --- | --- | --- | --- | --- |
| `shared.md` | Rule 1 文件的說明文字必須使用繁體中文 | `spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/plan.md`、`contracts/openapi.yaml`、`data/data-model.dbml`、`tasks.md` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 1 每張資料表必須有生命週期欄位 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 2 刪除資料必須使用軟刪除 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 3 時間點與純日期欄位必須分別使用 timestamptz 與 date 型別 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 4 唯一性約束與業務歷程保留必須明確定義 | `data/data-model.dbml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 1 查詢清單的 operation 必須以 page 與 pageSize 分頁 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 2 分頁 operation 的成功回應必須包含分頁資訊 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 3 分頁參數不合法時必須回應 400 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 4 page 超過總頁數時必須回應空的 items | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 5 分頁 operation 必須寫出排序依據 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 6 需要驗證身分或權限的 operation 必須分別定義 401 與 403 錯誤回應 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 7 時間點與純日期欄位必須使用 ISO 8601 格式並以 Asia/Taipei 為業務時區 | `contracts/openapi.yaml` | 通過 | — |

## 5. 沒有對應需求的任務

- T001（Phase 1 Setup）：確認 `apps/equipment-loan/` 既有結構，記下本次新增的檔案。
- T002（Phase 1 Setup）：確認後端套件版本與 `partialIndexes`，不安裝排程、Redis 與狀態機套件。
- T003（Phase 1 Setup）：確認前端套件版本，不安裝日期選擇器、路由、全域狀態與國際化套件。
- T004（Phase 1 Setup）：確認根目錄與 Playwright 的測試、遷移、seed 與檢查腳本。
- T056（Phase 6 Polish）：新增 `e2e/reschedule.spec.ts` 雙視窗 E2E；任務只引用 US1、US2、US3 與 research §5，沒有引用 FR／NFR／SC 編號。

## 6. 統計

| 項目 | 數字 |
| --- | --- |
| 需求總數 | 25 |
| 有任務的需求數 | 25 |
| 涵蓋率 | 100% |
| 任務總數 | 60 |
| 介面總數 | 12 |
| 沒有 Planner 產出的介面數 | 0 |
| 沒有任務的介面數 | 0 |

## 7. 下一步

- 沒有 CRITICAL 問題，可以繼續 `implement`。
- 建議先處理 2 筆 HIGH：F1（惰性失效的操作清單補齊，交給 `technical-research` 與 `api-plan`）；F2 需要使用者先決定失效結果要不要跟著錯誤回應回滾，決定後交給 `technical-research` 或 `api-plan`。
- 建議一併處理 C3、C4（核准時本人重複預約與改期申請狀態的並發控制），否則 T028、T040、T042 的實作與 T053 的驗收可能出現 SC-002 無法保證的情況。
- C1、C2、F3～F7 已有 tasks.md 的暫行做法或影響較小，可以在實作前或實作中處理；A1、B1 可以之後再處理。
