# 一致性分析報告：線上 PVP 1A2B 猜數字對戰平台 (Online PVP 1A2B)

- **Spec 目錄**：`specs/001-online-pvp-1a2b/`
- **分析日期**：2026-11-07
- **已分析文件**：`spec.md`、`plan.md`、`tasks.md`、`research.md`、`techstack.md`、`contracts/openapi.yaml`、`contracts/asyncapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`、`ui/room.html`、`ui/secret.html`、`ui/battle.html`
- **已讀取的憲法檔**：`shared.md`、`skills/api-plan/openapi.md`、`skills/data-plan/data-model.md`
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | 憲法 | CRITICAL | `data/data-model.dbml` → `Table players`、`Table rooms`、`Table secret_answers`、`Table guesses` | 4 張資料表都只有 `created_at`，缺少 `updated_at`、`updated_by`、`deleted_at`，違反 `skills/data-plan/data-model.md` Rule 1「每張會持久化的資料表都必須有 4 個生命週期欄位」 | 在 `data/data-model.dbml` 的 4 張資料表加上 `` updated_at timestamptz [not null, default: `now()`] ``、`updated_by uuid`、`deleted_at timestamptz`，名稱與型別照 Rule 1 的表格 | `data-plan` |
| D2 | 憲法 | CRITICAL | `data/data-model.dbml` → `Project "online-pvp-1a2b"`、`Table rooms`、`Ref: secret_answers.room_id > rooms.id [delete: cascade]`、`Ref: guesses.room_id > rooms.id [delete: cascade]`；`spec.md` → FR-001 | 資料模型把房間關閉寫成刪除資料列，並以 `[delete: cascade]` 連帶刪除秘密答案與猜測紀錄，違反 `skills/data-plan/data-model.md` Rule 2「刪除資料必須使用軟刪除」。FR-001 只明確要求不保存跨連線的身分與戰績，所以 `players` 斷線刪除符合例外；但 spec 沒有明確要求不保留房間、秘密答案與猜測紀錄，例外不成立 | 以憲法為準時，改 `data/data-model.dbml`：房間關閉改為設定 `deleted_at`，`uq_rooms_pair_code_waiting` 與等待中房間的查詢說明排除 `deleted_at` 不為 null 的資料列，移除兩條 `[delete: cascade]`，之後再讓 `tasks` 更新 T025、T036、T047；若決定這些資料也屬於「不保存」，改 `spec.md` 的 FR-001，明確寫出房間、秘密答案與猜測紀錄在對局結束後不保留 | 需要使用者決定（候選：`data-plan`、`s-specify`） |
| D3 | 憲法 | CRITICAL | `tasks.md` → `**Organization**`、`**Purpose**`、`**Checkpoint**`、`## Implementation Strategy` | `tasks.md` 有多段英文說明句，例如 `**Organization**` 的「Tasks are grouped by user story…」、各 Phase 的 `**Purpose**`、`**Checkpoint**` 句子、Phase Dependencies 的說明、Implementation Strategy 的步驟與 Notes 的前 6 條，違反 `shared.md` Rule 1「說明文字必須使用臺灣繁體中文」。這些句子不在 `tasks` 的鎖定項目內，鎖定的只有 Phase 標題、任務行格式與段落本身 | 把 `tasks.md` 中鎖定項目以外的英文說明句改寫成繁體中文，保留 `## Phase N:` 標題、任務行與段落標題；若要保留樣板英文固定段落，改用 `constitution` 在 `shared.md` Rule 1 加入例外 | 需要使用者決定（候選：`tasks`、`constitution`） |
| F1 | 不一致 | HIGH | `data/data-model.dbml` → `Enum game_end_reason` 的 `cancelled`；`contracts/openapi.yaml` → `leaveRoom`；`contracts/asyncapi.yaml` → `PLAYER_LEFT_DURING_SETUP` | 已記錄：tasks.md 待確認 1。設定秘密答案階段一方離開時，資料模型把房間保留為 `finished`＋`cancelled`；`leaveRoom` 與 `room:closed` 卻寫「關閉房間」，而資料模型對開始前的「關閉」是刪除資料列。兩種寫法會讓留下的玩家之後呼叫 `leaveRoom` 得到 `204` 或 `404`，行為不同 | 以資料模型為準時，改 `contracts/openapi.yaml` 的 `leaveRoom` 與 `contracts/asyncapi.yaml` 的 `sendRoomClosed`，寫明房間轉為已結束、留下的玩家仍要呼叫 `leaveRoom`；以合約為準時，改 `data/data-model.dbml` 的 `Enum room_status` 與 `Enum game_end_reason`，移除 `cancelled` 並寫明設定階段離開時關閉房間 | 需要使用者決定（候選：`api-plan`、`data-plan`） |
| F2 | 不一致 | MEDIUM | `data/data-model.dbml` → `Enum room_status`；`contracts/openapi.yaml` → `RoomState`；`contracts/asyncapi.yaml` → `RoomState` | 已記錄：tasks.md 待確認 1。`room_status` 的 `waiting`、`ready`、`playing` 與 `RoomState.status` 的 `waiting_for_opponent`、`ready_to_start`、`in_progress` 可以一一對應，但命名不同 | 選定一組命名後，改另一方：以合約為準時改 `data/data-model.dbml` 的 `Enum room_status`，以資料模型為準時改兩份合約的 `RoomState.status` | 需要使用者決定（候選：`data-plan`、`api-plan`） |
| F3 | 不一致 | MEDIUM | `data/data-model.dbml` → `Enum game_end_reason`；`contracts/asyncapi.yaml` → `GameResult` | 已記錄：tasks.md 待確認 1。`game_end_reason` 的 `solved`、`opponent_left` 與 `GameResult.reason` 的 `GUESSED_4A`、`PLAYER_LEFT` 可以一一對應，但命名與大小寫不同 | 選定一組命名後，改 `data/data-model.dbml` 的 `Enum game_end_reason` 或 `contracts/asyncapi.yaml` 的 `GameResult.reason`；`cancelled` 的處理見 F1 | 需要使用者決定（候選：`data-plan`、`api-plan`） |
| F4 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `RoomState`；`contracts/asyncapi.yaml` → `RoomState` | 兩份合約各自定義 `RoomState`，並互相宣稱「內容相同」；但 openapi 的 `status` 有 `finished`，asyncapi 沒有。T012、T019 依 asyncapi 宣告型別，T020 依 openapi 對應畫面，型別會不一致 | 在 `contracts/openapi.yaml` 的 `RoomState.status` 移除 `finished`（REST 回應不會回傳已結束的房間），或在兩份合約的 `description` 寫明差異；並改為只在一份合約定義 `RoomState`、`RoomPlayer`、`GuessRecord` | `api-plan` |
| F5 | 不一致 | MEDIUM | `research.md` → §8 `omit: { secret: false }`；`data/data-model.dbml` → `Table secret_answers` 的 `digits char(4)` | 技術研究把秘密答案欄位寫成 `secret`，資料模型與 T032、T045、T046 使用 `digits`，同一欄位命名不同 | 把 `research.md` §8 的 `omit: { secret: false }` 改為 `omit: { digits: false }`，與資料模型一致 | `technical-research` |
| F6 | 不一致 | MEDIUM | `contracts/asyncapi.yaml` → `HOST_LEFT_BEFORE_START`、`OPPONENT_LEFT_BEFORE_START`；`ui/plan.md` → §1「不在範疇」；`spec.md` → FR-007 | 已記錄：tasks.md 待確認 4。FR-007 只規定房主在開始前離開；房間已滿、尚未開始時對手離開，spec 沒有規定。合約以「最小假設」關閉房間並推播兩種 `room:closed`，`ui/plan.md` 卻把這個情境列為不在範疇，留下的玩家沒有畫面回饋 | 先在 `spec.md` 補上房間已滿、尚未開始時任一方離開的規則（房間關閉，或回到等待對手）；再依決定改 `ui/plan.md` §3.2、§4，補上兩種通知的入口提示，必要時同步改 `contracts/asyncapi.yaml` 的 `sendRoomClosed` | 需要使用者決定（候選：`clarify-over-specs`、`ui-plan`、`api-plan`） |
| F7 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `Error` 的 `MATCH_BUSY`、`ROOM_NOT_FOUND`、`NOT_HOST`；`contracts/asyncapi.yaml` → `ALREADY_CONNECTED`；`ui/plan.md` → §5 | 已記錄：tasks.md 待確認 5。合約有 11 個錯誤碼在 `ui/plan.md` §5 沒有畫面回饋（`UNAUTHORIZED`、`NOT_HOST`、`ROOM_NOT_FOUND`、`ALREADY_IN_ROOM`、`SOCKET_NOT_CONNECTED`、`MATCH_BUSY`、`GAME_ALREADY_STARTED`、`GAME_NOT_IN_SETUP`、`SECRET_ALREADY_SET`、`GAME_NOT_IN_PROGRESS`、`ALREADY_CONNECTED`）；待確認 5 漏列 `NOT_HOST`。通用文字「發生錯誤，請稍後再試」也難以滿足 NFR-004「讓使用者看得懂問題所在」 | 在 `ui/plan.md` §5 為這些錯誤碼補上畫面文字與後續操作（例如 `MATCH_BUSY` 提示稍後再試、`ROOM_NOT_FOUND` 回到入口），並同步更新對應的 `ui/*.html` | `ui-plan` |
| C1 | 不足 | MEDIUM | `contracts/asyncapi.yaml` → `sendRoomClosed`、`sendGameEnded`；`contracts/openapi.yaml` → `leaveRoom` | 已記錄：tasks.md 待確認 2。合約沒有寫明收到 `room:closed`、`game:ended` 之後，留下的玩家是否要呼叫 `leaveRoom`、token 與 Socket.IO 連線能否繼續用來重新配對（FR-016） | 在 `contracts/openapi.yaml` 的 `leaveRoom` 與 `contracts/asyncapi.yaml` 的 `sendRoomClosed`、`sendGameEnded` 寫明：收到通知後的離開方式、離開後同一個 token 是否可以再呼叫 `matchRoom` | `api-plan` |
| C2 | 不足 | MEDIUM | `data/data-model.dbml` → `Table players` 的 `room_role room_role`；`Ref: players.room_id > rooms.id [delete: set null]` | 已記錄：tasks.md 待確認 3。`room_role` 的 note 要求 `room_id` 為 null 時也必須為 null，但刪除房間時 `[delete: set null]` 只清空 `room_id`，資料模型也沒有約束保證這條規則 | 在 `data/data-model.dbml` 的 `Table players` 加上 `room_id` 與 `room_role` 同時為 null 或同時有值的約束說明（CHECK），或在 note 寫明由後端清空；若 D2 改為軟刪除，一併重新設計此關聯 | `data-plan` |
| C3 | 不足 | MEDIUM | `ui/plan.md` → §3.2 流程；`contracts/asyncapi.yaml` → `sendConnectError` | 已記錄：tasks.md 待確認 6。`ui/plan.md` 沒有規劃自己的 Socket.IO 連線建立失敗（`connect_error`）或對局中途斷線時的畫面與流程，spec Assumptions 不支援斷線重連，玩家需要知道發生了什麼事 | 在 `ui/plan.md` §3.2 與 §4 補上自己連線失敗與斷線時的狀態、提示文字與回到入口的流程，並同步更新 `ui/index.html` | `ui-plan` |
| B1 | 歧義 | MEDIUM | `spec.md` → FR-015；`research.md` → §4 `pingInterval + pingTimeout` | FR-015 要求一方斷線時「立即」判另一方獲勝，沒有量化標準；research §4 的設定在網路中斷時要約 15 秒才偵測到，無法判斷是否符合「立即」 | 在 `spec.md` 的 FR-015 寫出可量測的判定時間，例如「關閉分頁時 1 秒內、網路中斷時 15 秒內」 | `clarify-over-specs` |
| F8 | 不一致 | LOW | `plan.md` → `App.tsx`；`research.md` → §1；`ui/plan.md` → §3.1 頁面清單 | `plan.md` 與 research §1 把「結束」列為獨立畫面（入口、房間、設定答案、對戰、結束）；`ui/plan.md` 把對局結果放在 `battle.html` 內，T020 的 `screen` 也沒有結束畫面 | 把 `plan.md` 的 `App.tsx` 註解改為四個畫面（入口、房間、設定答案、對戰），對局結果屬於對戰畫面 | `system-analysis` |
| F9 | 不一致 | LOW | `ui/plan.md` → §2「四個等寬方格」；`ui/index.html` → `big-digits` | `ui/plan.md` §2 寫「四位數字以四個等寬方格呈現」，T027 依此實作四個方格；雛形的配對碼、答案與猜測輸入欄卻是單一輸入框加字距，只有顯示答案時用四格 | 在 `ui/plan.md` §2 寫明輸入欄與顯示欄的呈現方式，或把雛形的輸入欄改為四個方格 | `ui-plan` |
| F10 | 不一致 | LOW | `ui/room.html` → `離開後你會回到入口`；`ui/plan.md` → §4「確認離開房間」 | `room.html` 已有非房主的離開說明「離開後你會回到入口。」，`ui/plan.md` §4 沒有列出這個狀態；T029 與待確認 4 因此誤判雛形沒有非房主的確認視窗文字 | 在 `ui/plan.md` §4 補上以對手身分「確認離開房間」的狀態與文字；之後讓 `tasks` 把 T029 改為使用這段文字 | `ui-plan` |
| F11 | 不一致 | LOW | `ui/battle.html` → `這局判你獲勝`；`ui/plan.md` → §5「對手離線」 | 對手離線的結果卡，雛形說明為「小米 已離開對局，這局判你獲勝」，`ui/plan.md` §5 與 T050 為「你贏了！小米 已離開對局」，文字不同 | 統一 `ui/plan.md` §5 與 `ui/battle.html` 的對手離線文字 | `ui-plan` |
| C4 | 不足 | LOW | `plan.md` → Source Code (repository root)；`tasks.md` → Path Conventions 的 `styles.css` | T006、T007、T016 新增 `plan.md` 沒有定義的 ESLint、Prettier、Vitest、Playwright 設定檔與 `frontend/src/styles.css`；Path Conventions 把 `styles.css` 標為 research §1 的決定，但 research §1 沒有提到 `styles.css` | 在 `plan.md` 的 Source Code 補上這些設定檔與 `frontend/src/styles.css`，之後讓 `tasks` 移除 Path Conventions 中錯誤的 research §1 引用 | `system-analysis` |
| A1 | 重複 | LOW | `spec.md` → NFR-003、SC-003 | NFR-003 與 SC-003 都描述「對手畫面 1 秒內更新、比率 95% 以上」，兩處文字描述同一件事 | 保留 NFR-003 作為需求，把 `spec.md` 的 SC-003 改為引用 NFR-003 的量測方式，或刪除其中一項 | `s-specify` |
| A2 | 重複 | LOW | `spec.md` → Edge Cases「等待中房主離開」「秘密答案階段離開」；FR-007、FR-018 | 兩個 Edge Cases 項目重述 FR-007、FR-018 與 US1 情境 5、US2 情境 7 的內容，沒有新增邊界條件 | 把 `spec.md` 的這兩個 Edge Cases 改為引用 FR-007、FR-018，或刪除重複的敘述 | `s-specify` |
| B2 | 歧義 | LOW | `spec.md` → NFR-001「一般網路條件」 | NFR-001 的「一般網路條件」沒有量化標準，T053 只在本機 Docker 環境量測 | 在 `spec.md` 的 NFR-001 寫出網路條件，例如延遲與頻寬，或寫明以本機開發環境量測 | `clarify-over-specs` |
| B3 | 歧義 | LOW | `spec.md` → NFR-004「自然且清晰」 | NFR-004 的「自然且清晰」沒有判斷標準，T057 只能主觀檢查 | 在 `spec.md` 的 NFR-004 寫出檢查方式，例如列出用語規範或由使用者審閱通過 | `clarify-over-specs` |

超過 50 筆的部分：無（共 23 筆，未超過 50 筆）

## 2. 需求涵蓋

| 需求編號 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- |
| FR-001 | 是 | T009、T013、T015、T021、T022、T028、T059 | 見 D2 |
| FR-002 | 是 | T024、T026、T030、T059 | |
| FR-003 | 是 | T024、T026、T030、T059 | |
| FR-004 | 是 | T009、T024、T059 | |
| FR-005 | 是 | T021、T027、T028、T059 | |
| FR-006 | 是 | T023、T029、T030、T059 | |
| FR-007 | 是 | T025、T026、T029、T030、T059 | 見 F6、A2 |
| NFR-001 | 是 | T024、T028、T030、T053 | 見 B2 |
| FR-008 | 是 | T033、T037、T039、T041、T059 | |
| FR-009 | 是 | T031、T035、T037、T040、T041、T059 | |
| FR-010 | 是 | T031、T035、T040、T041、T059 | |
| FR-018 | 是 | T036、T040、T041、T059 | 見 F1、A2 |
| NFR-002 | 是 | T012、T031、T032、T034、T035、T040、T045、T046、T049、T056 | |
| FR-011 | 是 | T042、T043、T046、T049、T059 | |
| FR-012 | 是 | T044、T046、T048、T049、T059 | |
| FR-013 | 是 | T042、T044、T046、T049、T059 | |
| FR-014 | 是 | T045、T046、T050、T051、T059 | |
| FR-015 | 是 | T047、T050、T051、T059 | 見 B1 |
| FR-016 | 是 | T047、T050、T051、T059 | 見 C1 |
| NFR-003 | 是 | T019、T046、T049、T055 | 見 A1 |
| FR-017 | 是 | T037、T038、T040、T048、T049、T059 | |
| NFR-004 | 是 | T011、T016、T017、T027、T028、T057 | 見 F7、B3 |
| SC-001 | 是 | T030、T052 | |
| SC-002 | 是 | T024、T053 | |
| SC-003 | 是 | T051、T055 | 見 A1 |
| SC-004 | 是 | T032、T056 | |
| SC-005 | 是 | T043、T054 | |

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
| F1 進站與配對碼輸入介面 | 前端 | `ui/plan.md` → §1、§3.1；`ui/index.html` | T016、T017、T018、T019、T020、T027、T028、T029、T030 | 見 C3、F9 |
| F2 房間等待與開始遊戲介面 | 前端 | `ui/plan.md` → §1、§3.1；`ui/room.html` | T016、T017、T018、T019、T020、T027、T028、T029、T030、T038、T039、T040、T041 | 見 F6、F10 |
| F3 秘密答案設定介面 | 前端 | `ui/plan.md` → §1、§3.1；`ui/secret.html` | T016、T017、T018、T019、T020、T038、T039、T040、T041 | |
| F4 輪流猜測與對局結果介面 | 前端 | `ui/plan.md` → §1、§3.1；`ui/battle.html` | T016、T017、T018、T019、T020、T049、T050、T051 | 見 F8、F11 |
| B1 玩家進站 API | 後端 | `contracts/openapi.yaml` → `enterAsPlayer` | T011、T012、T013、T014、T015、T021、T022、T023、T024、T025、T026 | |
| B2 房間配對與離開 API | 後端 | `contracts/openapi.yaml` → `matchRoom`、`leaveRoom` | T011、T012、T013、T014、T015、T021、T022、T023、T024、T025、T026 | 見 F1、C1 |
| B3 對局進行 API | 後端 | `contracts/openapi.yaml` → `startGame`、`setSecret`、`submitGuess` | T011、T012、T013、T014、T015、T033、T034、T035、T036、T037、T043、T044、T045、T046、T047、T048 | 見 F4、F7 |
| B4 房間與對局即時推播 | 後端 | `contracts/asyncapi.yaml` → `sendRoomUpdated`、`sendGameEnded`、`sendRoomClosed`、`sendConnectError` | T011、T012、T013、T014、T015、T021、T022、T023、T024、T025、T026、T033、T034、T035、T036、T037、T043、T044、T045、T046、T047、T048 | 見 F3、F4、F6、C1 |
| D1 玩家與房間配對資料存取 | 資料庫 | `data/data-model.dbml` → `Table players`、`Table rooms` | T008、T009、T010 | 見 D1、D2、F2、C2 |
| D2 秘密答案與猜測紀錄持久化 | 資料庫 | `data/data-model.dbml` → `Table secret_answers`、`Table guesses` | T031、T032、T042 | 見 D1、D2、F5 |

## 4. 憲法遵循

| 憲法檔 | Rule | 適用產出物 | 結果 | 問題 ID |
| --- | --- | --- | --- | --- |
| `shared.md` | Rule 1 文件的說明文字必須使用繁體中文 | `spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/plan.md`、`contracts/`、`data/`、`tasks.md` | 違反 | D3 |
| `skills/api-plan/openapi.md` | Rule 1 查詢清單的 operation 必須以 page 與 pageSize 分頁 | `contracts/openapi.yaml` | 不適用（沒有回傳多筆資源的 `GET` operation） | — |
| `skills/api-plan/openapi.md` | Rule 2 分頁 operation 的成功回應必須包含分頁資訊 | `contracts/openapi.yaml` | 不適用（沒有適用 Rule 1 的 operation） | — |
| `skills/api-plan/openapi.md` | Rule 3 分頁參數不合法時必須回應 400 | `contracts/openapi.yaml` | 不適用（沒有適用 Rule 1 的 operation） | — |
| `skills/api-plan/openapi.md` | Rule 4 page 超過總頁數時必須回應空的 items | `contracts/openapi.yaml` | 不適用（沒有適用 Rule 1 的 operation） | — |
| `skills/api-plan/openapi.md` | Rule 5 分頁 operation 必須寫出排序依據 | `contracts/openapi.yaml` | 不適用（沒有適用 Rule 1 的 operation） | — |
| `skills/data-plan/data-model.md` | Rule 1 每張資料表必須有生命週期欄位 | `data/data-model.dbml` | 違反 | D1 |
| `skills/data-plan/data-model.md` | Rule 2 刪除資料必須使用軟刪除 | `data/data-model.dbml` | 違反 | D2 |

## 5. 沒有對應需求的任務

- T001（Phase 1 Setup）：依 plan.md 建立 `frontend/` 與 `backend/` 目錄結構。
- T002（Phase 1 Setup）：初始化後端 `package.json` 與 `tsconfig.json`。
- T003（Phase 1 Setup）：初始化前端 `package.json` 與 `tsconfig.json`。
- T004（Phase 1 Setup）：設定 `vite.config.ts` 與 `/api`、`/socket.io` 代理。
- T005（Phase 1 Setup）：建立 `postgres:18` 的 Docker Compose 與 `.env.example`。
- T006（Phase 1 Setup）：設定 ESLint flat config 與 Prettier。
- T007（Phase 1 Setup）：建立 Vitest 與 Playwright 測試設定。
- T008（Phase 2 Foundational）：設定 `prisma.config.ts` 與三個 enum。
- T010（Phase 2 Foundational）：建立使用 `@prisma/adapter-pg` 的 `PrismaClient`。
- T014（Phase 2 Foundational）：建立 Express 5 與 Socket.IO 共用的 HTTP 伺服器。
- T018（Phase 2 Foundational）：實作前端 REST 呼叫 `httpClient.ts`。
- T020（Phase 2 Foundational）：建立 `App.tsx` 頂層 `useReducer` 畫面狀態機。
- T058（Phase 6 Polish）：在前後端執行 `npm run check`。

## 6. 統計

| 項目 | 數字 |
| --- | --- |
| 需求總數 | 27 |
| 有任務的需求數 | 27 |
| 涵蓋率 | 100% |
| 任務總數 | 59 |
| 介面總數 | 10 |
| 沒有 Planner 產出的介面數 | 0 |
| 沒有任務的介面數 | 0 |

## 7. 下一步

- 有 CRITICAL 問題：`implement` 前先處理 D1、D2、D3。D1 請用 `data-plan` 修正 `data/data-model.dbml`；D2 先決定以憲法（`data-plan` 改軟刪除）或 spec（`s-specify` 明確寫出不保留）為準；D3 先決定由 `tasks` 改寫英文說明句，或由 `constitution` 加入例外。處理後重新執行 `analyze`。
- F1 需要使用者決定設定階段離開時，以資料模型（房間保留為已結束）或合約（關閉房間）為準，決定後交給 `api-plan` 或 `data-plan`。
- 建議接著處理 F2–F7、C1–C3、B1；D2、F1、F2、F3 都會改到資料模型與合約，可以一起處理。LOW 問題（F8–F11、C4、A1、A2、B2、B3）可以之後再處理。
- 上游文件修正後，用 `tasks` 重新產生 `tasks.md`，讓任務與 Notes 的待確認同步更新。
