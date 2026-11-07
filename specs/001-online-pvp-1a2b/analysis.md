# 一致性分析報告：線上 PVP 1A2B 猜數字對戰平台 (Online PVP 1A2B)

- **Spec 目錄**：`specs/001-online-pvp-1a2b/`
- **分析日期**：2026-11-07
- **已分析文件**：`spec.md`、`plan.md`、`tasks.md`、`research.md`、`techstack.md`、`contracts/openapi.yaml`、`contracts/asyncapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`、`ui/room.html`、`ui/secret.html`、`ui/battle.html`
- **已讀取的憲法檔**：`shared.md`、`skills/api-plan/openapi.md`、`skills/data-plan/data-model.md`
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | 不足 | MEDIUM | `research.md` → §5「玩家身分與連線識別」；`contracts/openapi.yaml` → `enterAsPlayer` | 玩家資料只在 Socket.IO `disconnect` 時刪除；玩家呼叫 `enterAsPlayer` 後一直沒有建立連線（關閉分頁、`connect_error` 後前端清除身分）時，`players` 資料列永遠不會被刪除，和 FR-019「玩家連線結束後不保留其玩家資料」不符 | 在 `research.md` §5 決定沒有建立連線的玩家的清除規則（例如進站後 N 秒內沒有連線就刪除），再依決策更新 `contracts/openapi.yaml` 的 `enterAsPlayer` description 與 `tasks.md` 的 T015、T022 | `technical-research` |
| C2 | 不足 | MEDIUM | `research.md` → §7「配對碼原子配對」；`tasks.md` → T025、T033 | research 只為配對與提交猜測規定交易內 `FOR UPDATE`；T025 `leaveRoom` 與 T033 `startGame` 只寫「同一個交易內」，沒有鎖定房間列。房主離開與對手配對同時發生時，可能刪除已有對手的房間（違反 `players` 的 CHECK 而失敗，或對手留在已刪除的房間）；開始遊戲與對手離開同時發生時，房間狀態可能錯亂 | 在 `tasks.md` 的 T025、T033、T036、T047 寫明先以 `SELECT … FROM rooms WHERE id = ${roomId} FOR UPDATE` 鎖定房間，再讀取狀態與房內玩家 | `tasks` |
| F1 | 不一致 | MEDIUM | `contracts/asyncapi.yaml` → `GameResult`；`data/data-model.dbml` → `Table secret_answers` 的 `owner_role`；`tasks.md` → T045、T047 | 合約以 `playerId` 表示玩家（`GameResult.secrets[].playerId`、`GuessRecord.playerId`、`winnerPlayerId`、`currentTurnPlayerId`），資料表以 `room_role` 表示（`owner_role`、`guesser_role`、`winner_role`、`current_turn`），可以透過 `players` 一一對應；但 T047 先清空離開者的 `room_id`、`room_role` 再呼叫 `publishGameEnded`，T045 只寫「需對回玩家 ID」，沒有寫出離開者的角色怎麼對回 `leftPlayerId` | 在 `tasks.md` T045 寫明角色對回玩家 ID 的方式：留下的玩家由 `players` 查出，離開者的角色為 `winner_role` 的另一方，對回參數 `leftPlayerId`；或在 T047 改為呼叫 `publishGameEnded` 後才清空離開者的欄位 | `tasks` |
| F2 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `GuessRecord`；`data/data-model.dbml` → `Table guesses` | 合約的 `guess`、`a`、`b` 與資料表的 `digits`、`a_count`、`b_count` 可以一一對應，但命名不同 | 以其中一方為準統一命名，例如把 `Table guesses` 的欄位改為 `guess`、`a`、`b`，或在 `GuessRecord` 各欄位的 description 註明對應的資料表欄位 | 需要使用者決定（候選：`data-plan`、`api-plan`） |
| F3 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `SetSecretRequest`；`contracts/asyncapi.yaml` → `GameResult`；`data/data-model.dbml` → `Table secret_answers` | 合約的秘密答案欄位叫 `secret`，資料表叫 `digits`，可以一一對應，但命名不同 | 以其中一方為準統一命名，例如把 `Table secret_answers` 的 `digits` 改為 `secret`，並同步更新 research §8 與 T032 的 `omit` 欄位名稱 | 需要使用者決定（候選：`data-plan`、`api-plan`） |
| F4 | 不一致 | MEDIUM | `ui/plan.md` → §5「連線尚未完成」；`tasks.md` → T030 | `ui/plan.md` 規定收到 `SOCKET_NOT_CONNECTED` 時提示「請稍後再按一次「進入配對」」，由使用者再按才重試；T030 寫「等 `connect` 事件後重試 `matchRoom`」，會被實作成自動重試，和提示文字不符 | 以 `ui/plan.md` 為準，把 `tasks.md` T030 改為收到 `SOCKET_NOT_CONNECTED` 時只顯示提示並停用暱稱欄，使用者再按「進入配對」時，若連線已建立才呼叫 `matchRoom` | `tasks` |
| F5 | 不一致 | MEDIUM | `plan.md` → Source Code（`scoreGuess 與輸入 schema 的單元測試`）；`research.md` → §9「品質與測試策略」；`tasks.md` → T052、T053、T054、T055、T056 | `plan.md` 把 `backend/tests/unit/`、`backend/tests/integration/`、`frontend/tests/e2e/` 寫成存放單元、整合與 Playwright 測試的目錄，research §9 也決定了測試工具；`tasks.md` 卻不產生測試任務，Polish 的驗證腳本「不納入版本控制」，這些目錄會保持空白 | 決定是否保留自動化測試：保留時，在 `tasks.md` 把 T052～T056 改為寫入對應 `tests/` 目錄並納入版本控制；不保留時，修改 `plan.md` 的 Source Code，刪除測試目錄的說明 | 需要使用者決定（候選：`tasks`、`system-analysis`） |
| F6 | 不一致 | MEDIUM | `spec.md` → SC-001；`tasks.md` → T052 | SC-001 量測兩位新玩家從進站到進入同一間房間的時間，包含玩家輸入的操作時間；T052 以 Playwright 自動化腳本量測，量不到玩家的實際操作時間，無法證明 SC-001 | 在 `tasks.md` T052 加上真人操作的驗證方式（例如 10 組真人玩家實測），Playwright 只保留 NFR-001 的量測；或把 `spec.md` 的 SC-001 改寫成系統可自動量測的條件 | 需要使用者決定（候選：`tasks`、`s-specify`） |
| A1 | 重複 | LOW | `spec.md` → NFR-003、SC-003 | NFR-003 與 SC-003 都規定「對手畫面在 1 秒內更新的比率達 95% 以上」，內容重複 | 在 `spec.md` 保留 NFR-003 作為需求，把 SC-003 改寫為引用 NFR-003 的量測方式（例如 100 次猜測的第 95 百分位） | `s-specify` |
| A2 | 重複 | LOW | `spec.md` → NFR-002、SC-004 | NFR-002 與 SC-004 都規定「對局結束前對手不得取得秘密答案」，內容重複 | 在 `spec.md` 保留 NFR-002 作為需求，把 SC-004 改寫為引用 NFR-002 的量測方式 | `s-specify` |
| B1 | 歧義 | LOW | `spec.md` → NFR-001 | 「一般網路條件下」沒有量化標準，T052 在本機量測時無法判斷是否符合這個條件 | 在 `spec.md` 的 NFR-001 寫出網路條件，例如「延遲 100ms 以內、頻寬 10 Mbps 以上」 | `clarify-over-specs` |
| B2 | 歧義 | LOW | `spec.md` → NFR-004 | 「自然且清晰」「讓使用者看得懂問題所在」沒有量化標準，T057 只能主觀檢查 | 在 `spec.md` 的 NFR-004 寫出檢查標準，例如「每則錯誤提示寫出錯在哪個欄位與正確格式」 | `clarify-over-specs` |
| C3 | 不足 | LOW | `plan.md` → Source Code；`tasks.md` → T006、T007、T016 | `tasks.md` 新增 `plan.md` Source Code 沒有定義的元件：`eslint.config.js`、`.prettierrc`、`vitest.config.ts`、`playwright.config.ts` 與 `frontend/src/styles.css`；`tasks.md` Notes 已說明 | 把這些檔案加入 `plan.md` 的 Source Code；或依 `tasks.md` Notes 的替代做法，把設定放進 `package.json`、樣式放進 `frontend/index.html` | 需要使用者決定（候選：`system-analysis`、`tasks`） |
| F7 | 不一致 | LOW | `plan.md` → F4；`ui/plan.md` → F4 輪流猜測與對局結果介面 | `plan.md` 的 F4 需求依據為「US3 情境 1–7」，`ui/plan.md` 畫面範疇的 F4 寫「US3 情境 1–6」，沒有列出情境 7（對局結束後保留房間到最後一位玩家離開） | 在 `ui/plan.md` §1 的 F4 需求依據改為「US3 情境 1–7」並補上 FR-019 | `ui-plan` |
| F8 | 不一致 | LOW | `plan.md` → B2；`contracts/openapi.yaml` → `B2 房間配對與離開 API` | `plan.md` 的 B2 需求依據包含 US2 情境 7 與 FR-015；合約的 B2 tag description 沒有列出這兩項，`leaveRoom` 卻處理這兩個情境 | 在 `contracts/openapi.yaml` 的 B2 tag description 補上 US2 情境 7 與 FR-015 | `api-plan` |
| F9 | 不一致 | LOW | `ui/plan.md` → §5「對手離線」；`ui/battle.html` → 雛形狀態「對手離線」 | `ui/plan.md` 的結果卡文字為「你贏了！小米 已離開對局」，雛形為「小米 已離開對局，這局判你獲勝」，文字不同 | 統一 `ui/plan.md` §5「對手離線」與 `ui/battle.html` 的結果卡文字（T050 依 `ui/plan.md`） | `ui-plan` |
| F10 | 不一致 | LOW | `ui/plan.md` → §4「對手先完成設定」；`ui/secret.html` → 雛形狀態「對手先完成設定」 | `ui/plan.md` 的對手狀態為綠色「小米 已設定好答案」，雛形的狀態列只顯示「✓ 已設定」 | 統一 `ui/plan.md` §4「對手先完成設定」與 `ui/secret.html` 的對手狀態文字（T040 依 `ui/plan.md`） | `ui-plan` |
| F11 | 不一致 | LOW | `tasks.md` → T017；`contracts/asyncapi.yaml` → `ALREADY_CONNECTED`；`contracts/openapi.yaml` → `Error` | T017 的 Must Read 說 `contracts/openapi.yaml` 的 `Error` 是「完整錯誤碼清單」，但 `ALREADY_CONNECTED` 只定義在 `contracts/asyncapi.yaml`；任務描述有列出這個錯誤碼，Must Read 沒有指向來源 | 在 `tasks.md` T017 的 Must Read 加上 `contracts/asyncapi.yaml` → `sendConnectError`，並把 openapi `Error` 的 Why 改為「HTTP 錯誤碼清單」 | `tasks` |

超過 50 筆的部分：無（共 18 筆，未超過 50 筆）

## 2. 需求涵蓋

| 需求編號 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- |
| FR-001 | 是 | T009、T013、T015、T021、T022、T028、T030、T059 | 見 C1 |
| FR-002 | 是 | T024、T026、T030、T059 | 見 F4 |
| FR-003 | 是 | T024、T026、T030、T059 | |
| FR-004 | 是 | T009、T024、T059 | |
| FR-005 | 是 | T021、T027、T028、T059 | |
| FR-006 | 是 | T023、T029、T030、T059 | |
| FR-007 | 是 | T025、T026、T029、T030、T059 | 見 C2 |
| NFR-001 | 是 | T024、T028、T030、T052 | 見 B1 |
| FR-008 | 是 | T033、T037、T039、T041、T059 | 見 C2 |
| FR-009 | 是 | T031、T035、T037、T040、T041、T059 | 見 F3 |
| FR-010 | 是 | T031、T035、T040、T041、T059 | |
| FR-018 | 是 | T036、T040、T041、T059 | |
| NFR-002 | 是 | T012、T031、T032、T034、T035、T040、T045、T046、T049、T056 | 見 A2 |
| FR-011 | 是 | T042、T043、T046、T049、T059 | 見 F2 |
| FR-012 | 是 | T044、T046、T048、T049、T059 | |
| FR-013 | 是 | T042、T044、T046、T049、T059 | 見 F2 |
| FR-014 | 是 | T045、T046、T050、T051、T059 | 見 F1 |
| FR-015 | 是 | T047、T050、T051、T059 | 見 F1 |
| FR-016 | 是 | T047、T050、T051、T059 | |
| NFR-003 | 是 | T019、T046、T049、T055 | 見 A1 |
| FR-017 | 是 | T037、T038、T040、T048、T049、T059 | |
| FR-019 | 是 | T009、T015、T025、T026、T030、T031、T036、T041、T042、T047、T051、T059 | 見 C1 |
| NFR-004 | 是 | T011、T016、T017、T027、T028、T057 | 見 B2 |
| SC-001 | 是 | T030、T052 | 見 F6 |
| SC-002 | 是 | T024、T053 | |
| SC-003 | 是 | T051、T055 | 見 A1 |
| SC-004 | 是 | T032、T056 | 見 A2 |
| SC-005 | 是 | T043、T054 | |

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
| F1 進站與配對碼輸入介面 | 前端 | `ui/plan.md` → §1、§3.1；`ui/index.html` | T016～T020、T027～T030 | 見 F4 |
| F2 房間等待與開始遊戲介面 | 前端 | `ui/plan.md` → §1、§3.1；`ui/room.html` | T016～T020、T027～T030、T038～T041 | |
| F3 秘密答案設定介面 | 前端 | `ui/plan.md` → §1、§3.1；`ui/secret.html` | T016～T020、T038～T041 | 見 F10 |
| F4 輪流猜測與對局結果介面 | 前端 | `ui/plan.md` → §1、§3.1；`ui/battle.html` | T016～T020、T049～T051 | 見 F7、F9 |
| B1 玩家進站 API | 後端 | `contracts/openapi.yaml` → `enterAsPlayer` | T011～T015、T021～T026 | 見 C1 |
| B2 房間配對與離開 API | 後端 | `contracts/openapi.yaml` → `matchRoom`、`leaveRoom` | T011～T015、T021～T026 | T036、T047 也擴充 `leaveRoom`（分組標為 B3、B4）；見 C2、F8 |
| B3 對局進行 API | 後端 | `contracts/openapi.yaml` → `startGame`、`setSecret`、`submitGuess` | T011～T015、T033～T037、T043～T048 | 見 C2、F2、F3 |
| B4 房間與對局即時推播 | 後端 | `contracts/asyncapi.yaml` → `sendRoomUpdated`、`sendGameEnded`、`sendRoomClosed`、`sendConnectError` | T011～T015、T021～T026、T033～T037、T043～T048 | 見 F1、F11 |
| D1 玩家與房間配對資料存取 | 資料庫 | `data/data-model.dbml` → `Table players`、`Table rooms` | T008～T010 | |
| D2 秘密答案與猜測紀錄持久化 | 資料庫 | `data/data-model.dbml` → `Table secret_answers`、`Table guesses` | T031、T032、T042 | 見 F1、F2、F3 |

## 4. 憲法遵循

| 憲法檔 | Rule | 適用產出物 | 結果 | 問題 ID |
| --- | --- | --- | --- | --- |
| `shared.md` | Rule 1 文件的說明文字必須使用繁體中文 | `spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/plan.md`、`contracts/`、`data/`、`tasks.md` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 1 查詢清單的 operation 必須以 `page` 與 `pageSize` 分頁 | `contracts/openapi.yaml` | 不適用（沒有回傳多筆資源的 `GET` operation） | — |
| `skills/api-plan/openapi.md` | Rule 2 分頁 operation 的成功回應必須包含分頁資訊 | `contracts/openapi.yaml` | 不適用（沒有適用 Rule 1 的 operation） | — |
| `skills/api-plan/openapi.md` | Rule 3 分頁參數不合法時必須回應 400 | `contracts/openapi.yaml` | 不適用（沒有適用 Rule 1 的 operation） | — |
| `skills/api-plan/openapi.md` | Rule 4 `page` 超過總頁數時必須回應空的 `items` | `contracts/openapi.yaml` | 不適用（沒有適用 Rule 1 的 operation） | — |
| `skills/api-plan/openapi.md` | Rule 5 分頁 operation 必須寫出排序依據 | `contracts/openapi.yaml` | 不適用（沒有適用 Rule 1 的 operation） | — |
| `skills/data-plan/data-model.md` | Rule 1 每張資料表必須有生命週期欄位 | `data/data-model.dbml` | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 2 刪除資料必須使用軟刪除 | `data/data-model.dbml` | 通過（FR-019 明確要求不保留房間、秘密答案、猜測紀錄與玩家資料，例外成立） | — |

## 5. 沒有對應需求的任務

- T001（Phase 1 Setup）：建立 `frontend/` 與 `backend/` 目錄結構。
- T002（Phase 1 Setup）：初始化後端專案與相依套件。
- T003（Phase 1 Setup）：初始化前端專案與相依套件。
- T004（Phase 1 Setup）：設定 Vite 與 `/api`、`/socket.io` 代理。
- T005（Phase 1 Setup）：建立 Docker Compose 的 PostgreSQL 18 容器與 `DATABASE_URL`。
- T006（Phase 1 Setup）：設定 ESLint 與 Prettier。
- T007（Phase 1 Setup）：建立 Vitest 與 Playwright 設定。
- T008（Phase 2 Foundational）：設定 `prisma.config.ts` 與 `schema.prisma` 的 generator、datasource、enum。
- T010（Phase 2 Foundational）：建立使用 `@prisma/adapter-pg` 的 Prisma Client。
- T014（Phase 2 Foundational）：建立 Express 與 Socket.IO 共用的 HTTP 伺服器入口。
- T018（Phase 2 Foundational）：實作前端 REST 呼叫模組。
- T020（Phase 2 Foundational）：建立前端頂層 `useReducer` 畫面狀態機。
- T058（Phase 6 Polish）：執行 `npm run check` 並修正錯誤。

## 6. 統計

| 項目 | 數字 |
| --- | --- |
| 需求總數 | 28 |
| 有任務的需求數 | 28 |
| 涵蓋率 | 100% |
| 任務總數 | 59 |
| 介面總數 | 10 |
| 沒有 Planner 產出的介面數 | 0 |
| 沒有任務的介面數 | 0 |

## 7. 下一步

- 沒有 CRITICAL 與 HIGH 問題，可以繼續 `implement`。
- 建議先處理會影響實作行為的問題：F4、C2、C1、F1，請依各問題的處理 Skill 修正後重新執行 `analyze`。
- F5、F6 需要使用者決定以哪一份文件為準，決定後交給對應的處理 Skill。
- F2、F3 可以和下一次 `data-plan` 或 `api-plan` 修改一起處理；A1、A2、B1、B2、C3、F7～F11 可以之後再處理。
