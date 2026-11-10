# 一致性分析報告：設備送修與停用、恢復可用及受影響未來預約的處理 (Equipment Maintenance and Retirement)

- **Spec 目錄**：`specs/007-equipment-maintenance-retire/`
- **分析日期**：2026-11-10
- **已分析文件**：`spec.md`、`plan.md`、`tasks.md`、`research.md`、`techstack.md`、`contracts/openapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`、`ui/booking.html`、`ui/my-reservations.html`、`ui/equipment-status.html`、`ui/admin.html`
- **已讀取的憲法檔**：`shared.md`、`skills/api-plan/openapi.md`、`skills/data-plan/data-model.md`
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | 不一致 | HIGH | `spec.md` → FR-009、FR-019、SC-002；`contracts/openapi.yaml` → `createReservation`；`tasks.md` → T039 | FR-009、US1 情境 12 與 SC-002 要求「預約與設定送修同時發生時，設備不留下尚未結束的預約，成員的請求不是被拒絕就是被取消」；FR-019 與 US1 情境 15 卻要求預約數和確認視窗不同時拒絕設定。新預約先提交時，設定一定因數量不同被拒絕，設備保持可用並留下這筆預約，所以「預約成立後被取消」不可能發生，FR-009 的保證也不成立。T039 依 FR-009 斷言「設備沒有尚未結束的預約」，在預約先提交的輪次會失敗 | 在 `spec.md` 決定兩條規則的關係：建議把 FR-009、US1 情境 12、SC-002 改成「設定送修或停用成功時，設備沒有尚未結束的預約；設定因 FR-019 被拒絕時，設備與預約都不變」，並把 `createReservation` description 的「成立後被該次設定取消」改為「或設定被拒絕」；`spec.md` 修正後，用 `tasks` 依新規則改寫 T039 的斷言 | `clarify-over-specs` |
| F2 | 不一致 | HIGH | `research.md` → §2；`contracts/openapi.yaml` → `updateEquipmentStatus`；`spec.md` → FR-019 | 已記錄：tasks.md 待確認 3。research §2 先判斷「目標等於目前狀態」（`EQUIPMENT_STATUS_UNCHANGED`），再比對 `expectedCurrentStatus`；合約先比對 `expectedCurrentStatus`（`EQUIPMENT_STATE_CHANGED`）。另一位管理員先把設備設成相同目標狀態時，兩種順序回不同錯誤碼；FR-019 規定狀態和確認視窗不同時要顯示「設備狀態已被變更，請重新確認」，支持合約的順序 | 以 FR-019 為準，修改 `research.md` §2 的交易步驟 2、3：借用中檢查之後，先比對 `expectedCurrentStatus` 回 `EQUIPMENT_STATE_CHANGED`，再判斷 `EQUIPMENT_STATUS_UNCHANGED` | `technical-research` |
| F3 | 不一致 | HIGH | `spec.md` → FR-005、SC-003；`research.md` → §3；`contracts/openapi.yaml` → `pickupReservationByAdmin` | research §3 只讓「新預約、核准待審預約、即時改期、核准改期」先以 `FOR SHARE` 鎖定設備列，登記領取不鎖。管理員甲設定送修的交易完成借用中檢查後，管理員乙對同一台設備登記領取並先提交，甲的批次 `UPDATE` 會跳過這筆已變成 `checked_out` 的預約，設備仍被設成送修中，違反 FR-005「設備有借用中的預約時必須拒絕」與 SC-003「成功率 0%」 | 修改 `research.md` §3，把登記領取（`pickupReservationByAdmin`）加入先以 `FOR SHARE` 鎖定設備列的操作，取得鎖後再檢查設備狀態與預約狀態；同步修改 `contracts/openapi.yaml` 的 `pickupReservationByAdmin` description 寫出鎖定順序；上游修正後，用 `tasks` 更新 T021 與 T039 的並發驗證 | `technical-research`、`api-plan` |
| F4 | 不一致 | HIGH | `contracts/openapi.yaml` → `createRescheduleRequest`；`research.md` → §3；`spec.md` → FR-004 | 已記錄：tasks.md 待確認 4。合約與 research §3 只要求免審核的即時改期先鎖定設備列；需人工審核設備送出改期申請時不鎖。這個申請和設定送修同時發生時，設定交易看不到尚未提交的申請，會留下指向已取消預約、仍為 `pending_approval` 的改期申請，違反 FR-004「同一次操作把改期審核中申請改成改期已失效」 | 以 FR-004 為準，修改 `research.md` §3，把需人工審核設備送出改期申請也納入 `FOR SHARE` 鎖定；同步修改 `contracts/openapi.yaml` 的 `createRescheduleRequest` description，寫明兩條路徑都先鎖設備列 | `technical-research`、`api-plan` |
| F5 | 不一致 | HIGH | `spec.md` → FR-008；`research.md` → §1；`data/data-model.dbml` → `Table equipment_status_changes` | 已記錄：tasks.md 待確認 5。FR-008 與 `Table equipment_status_changes` 規定紀錄不得刪除；research §1 卻決定 demo seed 以 `deleteMany` 重設全部資料（並以此為不採用觸發器的理由），重設時會實體刪除狀態變更紀錄。FR-008 與 FR-018、US1 情境 14 的 demo seed 重設互相衝突 | 需要使用者決定：demo seed 重設屬於例外時，在 `spec.md` FR-008 加上「開發與展示資料庫的 demo seed 重設除外」；不屬於例外時，修改 `research.md` §1 的重設方式（例如重建資料庫或另建展示資料庫），並評估是否加上觸發器 | 需要使用者決定（候選：`clarify-over-specs`、`technical-research`） |
| F6 | 不一致 | HIGH | `research.md` → §4；`ui/plan.md` → §4 `admin.html` 的「審核與借用管理總覽」、§5 `admin.html` 的「因設備送修或停用取消的預約」 | 已記錄：tasks.md 待確認 2。research §4 規定「我的預約」與全體預約管理在 `member_cancelled` 時都不顯示原因；ui/plan.md 在全體預約顯示「成員取消」。spec FR-015 只限制「我的預約」，FR-020 只要求顯示兩種設備原因，兩種做法都符合 spec，實作會做出不同畫面 | 需要使用者決定：採用 ui/plan.md 時，修改 `research.md` §4 的「「我的預約」與全體預約管理」一項，改為只有「我的預約」不顯示成員取消；採用 research 時，修改 `ui/plan.md` §4、§5 與 `ui/admin.html`，全體預約不顯示「成員取消」 | 需要使用者決定（候選：`technical-research`、`ui-plan`） |
| F7 | 不一致 | MEDIUM | `ui/plan.md` → §3.1；`plan.md` → `AdminOverviewView.tsx`；`research.md` → §4 | 已記錄：tasks.md 待確認 1。ui/plan.md §3.1 把管理員畫面拆成 `equipment-status.html`（設備狀態管理）與 `admin.html`（審核與借用管理）兩頁、頁首 5 個導覽；plan.md 只有一個 `AdminOverviewView.tsx`，research §4 寫「不新增頁面」。兩頁雛形可以一一對應到同一個 view 的兩個頁籤，只有命名與結構說法不同 | 修改 `plan.md` 的 Source Code：在 `App.tsx` 與 `AdminOverviewView.tsx` 的註解寫明管理員畫面分成「設備狀態管理」與「審核與借用管理」兩個頁籤，對應 ui/plan.md §3.1 的兩個雛形頁面 | `system-analysis` |
| F8 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `EquipmentStatusUnchanged`、`UpdateEquipmentStatusConflict`；`ui/plan.md` → §5 | B4 的兩種 409 在 ui/plan.md §5 沒有畫面回饋：(1) `EQUIPMENT_STATUS_UNCHANGED`：另一位管理員已先變更狀態後，本管理員從舊畫面點「設為送修」或「恢復可用」時回這個錯誤碼；(2) 確認時的 `EQUIPMENT_ON_LOAN`：預覽之後才有人登記領取，確認時才被拒絕。§5「設備借用中」只寫預覽時的回饋；`ui/equipment-status.html` 的 `confirmChange` 有確認時的借用中橫幅，ui/plan.md 卻沒有寫；T025、T026 也只處理 `EQUIPMENT_STATE_CHANGED` | 在 `ui/plan.md` §5 `equipment-status.html` 新增兩列：「設備狀態已是目標狀態」（顯示提示並重新拉取設備清單）與「確認時設備借用中」（關閉視窗、紅色橫幅與「前往登記歸還」），並同步更新雛形狀態；上游修正後，用 `tasks` 補到 T025、T026、T031 | `ui-plan` |
| F9 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `ApproveReservationConflict`、`ApproveRescheduleConflict`、`CreateRescheduleConflict`；`ui/plan.md` → §5 | 合約在核准待審預約、核准改期與即時改期新增 `EQUIPMENT_UNAVAILABLE`；ui/plan.md §5 只有 `booking.html` 的「預約時設備已送修」「預約時設備已停用」，`admin.html` 與 `my-reservations.html` 沒有這個錯誤碼的回饋。T027 自行決定以紅色橫幅顯示後端訊息，T035 沒有處理即時改期被拒 | 在 `ui/plan.md` §5 的 `admin.html` 新增「核准時設備送修中或已停用」，在 `my-reservations.html` 新增「改期時設備送修中或已停用」，寫出提示文字與重新拉取清單的行為 | `ui-plan` |
| F10 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `EquipmentSlotAvailability` 的 `slotCode`；`data/data-model.dbml` → `Table time_slots` 的 `slot_code` | 合約的 `slotCode` 為 `MORNING`、`AFTERNOON`、`EVENING`，資料表的 `slot_code` 為 `morning`、`afternoon`、`evening`，兩者可以一一對應，只有大小寫不同 | 在 `contracts/openapi.yaml` 的 `EquipmentSlotAvailability.slotCode` description 寫明它是 `time_slots.slot_code` 轉成大寫的值；或改成與資料表相同的小寫值（需確認 006 前端是否依賴大寫） | `api-plan` |
| F11 | 不一致 | LOW | `tasks.md` → T008、T010；`contracts/openapi.yaml` → `MemberVisibleEquipmentStatus` | T008、T010 把 `EquipmentWithSlotAvailability` 的 `status` 寫成三種值（含 `retired`）；合約以 `MemberVisibleEquipmentStatus` 限定只有 `available`、`maintenance`。T032 才把後端型別縮成兩種，前端 T010 沒有縮 | 修改 `tasks.md` 的 T008、T010：`EquipmentWithSlotAvailability.status` 使用 `MemberVisibleEquipmentStatus`，`AdminEquipmentSetting.status` 使用 `EquipmentStatus`，並把 `MemberVisibleEquipmentStatus` 加入 T010 的 Must Read | `tasks` |
| F12 | 不一致 | LOW | `contracts/openapi.yaml` → `createReservation`；`ui/plan.md` → §5 `booking.html` 的「預約時設備已送修」；`tasks.md` → T019 | 合約與 T019 的 `EQUIPMENT_UNAVAILABLE` 訊息只寫「設備送修中，無法預約」或「設備已停用，無法預約」；ui/plan.md 的橫幅還要寫出設備編號、名稱與「這筆預約沒有建立」等說明，T034 直接顯示後端訊息，畫面文字會和 ui/plan.md 不同 | 在 `contracts/openapi.yaml` 的 `createReservation` description 寫明訊息以「設備送修中，無法預約：」開頭並接設備編號、名稱與說明，和 ui/plan.md §5 一致；或在 `ui/plan.md` 改為只顯示後端的短訊息 | `api-plan` |
| F13 | 不一致 | LOW | `ui/plan.md` → §5；`ui/booking.html` → `STATES`；`ui/my-reservations.html` → `STATES` | ui/plan.md §5 寫「錯誤狀態同樣可從「雛形狀態」面板切換」，但「送修中設備的時段」「停用設備不顯示」「點選已被預約或已開始的時段」「恢復後原時段仍空著」「因設備送修或停用取消的預約」「成員自行取消的預約」「停用設備的歷史紀錄」「改期申請因原預約取消而失效」「取消確認視窗」不是任何雛形的面板狀態，只能在其他狀態中看到 | 在 `ui/booking.html`、`ui/my-reservations.html`、`ui/equipment-status.html`、`ui/admin.html` 的雛形狀態面板補上這些狀態；或修改 `ui/plan.md` §5 的說明，寫出這些情境要在哪個面板狀態中查看 | `ui-plan` |
| B1 | 歧義 | LOW | `spec.md` → NFR-002 | NFR-002 的「一般單機與區域網路環境」沒有量化標準（硬體規格、網路延遲），SC-006 也沒有寫量測環境，T040 無法確定在什麼環境量測 | 在 `spec.md` 的 NFR-002 與 SC-006 寫出量測環境，例如「以 Docker Compose 在開發機啟動 PostgreSQL 18、後端與資料庫在同一台機器」 | `clarify-over-specs` |

超過 50 筆的部分：無（共 14 筆，未超過 50 筆）

## 2. 需求涵蓋

| 需求編號 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- |
| FR-001 | 是 | T003、T016、T026 | |
| FR-002 | 是 | T015、T016、T020、T037 | |
| FR-003 | 是 | T015、T016、T021、T027、T037 | |
| FR-004 | 是 | T015、T016、T022、T027、T035 | 見 F4 |
| FR-005 | 是 | T006、T015、T016、T024、T025、T028 | 見 F3、F8 |
| FR-006 | 是 | T008、T019、T034 | 見 F12 |
| FR-007 | 是 | T015、T017、T023、T025、T026 | |
| FR-008 | 是 | T003、T014、T016、T023、T026 | 見 F5 |
| FR-009 | 是 | T019、T020、T022、T027、T039 | 見 F1 |
| FR-010 | 是 | T016、T026 | |
| FR-019 | 是 | T006、T016、T024、T025、T026、T037 | 見 F1、F2 |
| FR-020 | 是 | T018、T023、T027、T028 | 見 F6 |
| FR-011 | 是 | T029、T031、T032 | |
| FR-012 | 是 | T029、T031、T032、T035 | |
| FR-013 | 是 | T019、T029、T031 | |
| FR-014 | 是 | T032、T034 | 見 F11 |
| FR-015 | 是 | T003、T009、T033、T035 | |
| FR-016 | 是 | T033、T035 | |
| FR-017 | 是 | T007、T017、T030、T038 | |
| FR-018 | 是 | T003、T004、T005、T013、T041、T043、T044 | |
| NFR-001 | 是 | T006、T007、T011、T012、T024、T036 | |
| NFR-002 | 是 | T017、T040 | 見 B1 |
| SC-001 | 是 | T037、T042 | |
| SC-002 | 是 | T019、T039 | 見 F1 |
| SC-003 | 是 | T037 | 見 F3 |
| SC-004 | 是 | T029、T038、T042 | |
| SC-005 | 是 | T038、T043 | |
| SC-006 | 是 | T040 | 見 B1 |

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
| F1 驗證碼與帳號密碼登入登出介面 | 前端 | `ui/plan.md` → §1、§3.1 | T010、T011、T012、T013 | |
| F2 成員設備預約頁的送修中標示與停用隱藏介面 | 前端 | `ui/plan.md` → §1、§3.1 | T010、T011、T012、T013、T034、T035 | 見 F12、F13 |
| F3 成員「我的預約」取消原因與停用設備歷史紀錄介面 | 前端 | `ui/plan.md` → §1、§3.1 | T034、T035 | 見 F9、F13 |
| F4 管理員設備清單狀態操作與確認視窗介面 | 前端 | `ui/plan.md` → §1、§3.1 | T010、T011、T012、T013、T023、T024、T025、T026、T027、T028、T031 | 見 F7、F8 |
| F5 管理員全體預約管理的取消原因、待審清單與現場領取歸還介面 | 前端 | `ui/plan.md` → §1、§3.1 | T010、T011、T012、T013、T023、T024、T025、T026、T027、T028 | 見 F6、F7、F9 |
| B1 驗證碼挑戰與登入工作階段 API | 後端 | `contracts/openapi.yaml` → `createCaptchaChallenge`、`login`、`getCurrentUser`、`logout` | T006、T007、T008、T009 | |
| B2 成員設備清單、時段狀態查詢與預約建立 API | 後端 | `contracts/openapi.yaml` → `listEquipments`、`createReservation` | T006～T009、T014～T022、T032、T033 | 見 F1、F10、F12 |
| B3 管理員設備清單與人工審核設定 API | 後端 | `contracts/openapi.yaml` → `listAdminEquipments`、`updateEquipmentApprovalMode` | T006～T009、T014～T022 | |
| B4 設備狀態變更預覽與送修、停用、恢復可用 API | 後端 | `contracts/openapi.yaml` → `getEquipmentStatusChangePreview`、`updateEquipmentStatus` | T006～T009、T014～T022、T029、T030 | 見 F2、F8 |
| B5 成員預約查詢、取消與改期 API | 後端 | `contracts/openapi.yaml` → `listMyReservations`、`listMyLoanReservations`、`cancelReservation`、`createRescheduleRequest`、`withdrawRescheduleRequest` | T006～T009、T014～T022、T032、T033 | 見 F4、F9 |
| B6 管理員待審核准駁回（含改期申請）、全體預約與現場領取歸還 API | 後端 | `contracts/openapi.yaml` → `listPendingReservations`、`listAllReservations`、`approveReservation`、`rejectReservation`、`listRescheduleRequests`、`approveRescheduleRequest`、`rejectRescheduleRequest`、`pickupReservationByAdmin`、`returnReservationByAdmin` | T014～T022 | 見 F3、F9 |
| D1 帳號、驗證碼挑戰與工作階段資料存取 | 資料庫 | `data/data-model.dbml` → `Table users`、`Table captcha_challenges`、`Table sessions` | T003、T004、T005 | |
| D2 設備狀態與設備狀態變更紀錄持久化 | 資料庫 | `data/data-model.dbml` → `Table equipments`、`Table equipment_status_changes` | T003、T004、T005 | 見 F5 |
| D3 預約借還紀錄（含取消原因）與改期申請持久化 | 資料庫 | `data/data-model.dbml` → `Table time_slots`、`Table reservations`、`Table reschedule_requests` | T003、T004、T005 | 見 F10 |

## 4. 憲法遵循

| 憲法檔 | Rule | 適用產出物 | 結果 | 問題 ID |
| --- | --- | --- | --- | --- |
| `shared.md` | Rule 1 文件的說明文字必須使用繁體中文 | `spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/plan.md`、`contracts/openapi.yaml`、`data/data-model.dbml`、`tasks.md` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 1 查詢清單的 operation 必須以 page 與 pageSize 分頁 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 2 分頁 operation 的成功回應必須包含分頁資訊 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 3 分頁參數不合法時必須回應 400 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 4 page 超過總頁數時必須回應空的 items | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 5 分頁 operation 必須寫出排序依據 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 6 需要驗證身分或權限的 operation 必須分別定義 401 與 403 錯誤回應 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 7 時間點與純日期欄位必須使用 ISO 8601 格式並以 Asia/Taipei 為業務時區 | `contracts/openapi.yaml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 1 每張資料表必須有生命週期欄位 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 2 刪除資料必須使用軟刪除 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 3 時間點與純日期欄位必須分別使用 timestamptz 與 date 型別 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 4 唯一性約束與業務歷程保留必須明確定義 | `data/data-model.dbml` | 通過 | — |

## 5. 沒有對應需求的任務

- T001（Phase 1 Setup）：啟動 PostgreSQL 18、安裝套件、套用 003～006 的 Migration 並重設展示資料，確認 006 版本可以啟動。
- T002（Phase 1 Setup）：執行 `npm run check` 與前後端測試，記錄 006 版本的回歸基準。
- T010（Phase 2 Foundational）：在 `frontend/src/api/client.ts` 新增 `EquipmentStatus`、`ReservationCancelReason` 型別，並以 `status` 取代 `isActive`（見 F11）。
- T045（Phase 6 Polish）：執行 `npm run check`（`tsc --noEmit`、ESLint、`prettier --check`）並修正錯誤。
- T046（Phase 6 Polish）：依 `README.md` 以 demo seed 手動走一次 US1～US3 的 Independent Test。

## 6. 統計

| 項目 | 數字 |
| --- | --- |
| 需求總數 | 28 |
| 有任務的需求數 | 28 |
| 涵蓋率 | 100% |
| 任務總數 | 46 |
| 介面總數 | 14 |
| 沒有 Planner 產出的介面數 | 0 |
| 沒有任務的介面數 | 0 |

## 7. 下一步

- 沒有 CRITICAL 問題，可以繼續 `implement`。
- 建議 `implement` 前先處理 6 個 HIGH 問題：
  - F1、F5、F6 需要使用者決定。F1 用 `clarify-over-specs` 釐清 FR-009 與 FR-019 的關係；F5、F6 先決定以哪一方為準，再交給候選的處理 Skill。
  - F2 用 `technical-research` 修正 research §2 的檢查順序。
  - F3、F4 用 `technical-research` 與 `api-plan` 補上登記領取與需人工審核改期送出的設備列鎖定。
  - 上游修正後，用 `tasks` 重新產生或更新受影響的任務（T016、T021、T022、T039 等），再重新執行 `analyze`。
- MEDIUM 的 F7～F10 建議在 US1 實作前處理；LOW 的 F11～F13、B1 可以之後再處理。
