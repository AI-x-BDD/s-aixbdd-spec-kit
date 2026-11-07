# 一致性分析報告：線上 PVP 1A2B 猜數字對戰平台 (Online PVP 1A2B)

- **Spec 目錄**：`specs/001-online-pvp-1a2b/`
- **分析日期**：2026-11-07
- **已分析文件**：`spec.md`、`plan.md`、`tasks.md`、`research.md`、`techstack.md`、`contracts/openapi.yaml`、`contracts/asyncapi.yaml`、`data/data-model.dbml`、`ui/plan.md`、`ui/index.html`、`ui/room.html`、`ui/secret.html`、`ui/battle.html`
- **已讀取的憲法檔**：`shared.md`、`skills/api-plan/openapi.md`、`skills/data-plan/data-model.md`
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | 憲法 | CRITICAL | `tasks.md` → `**Organization**`、`**Purpose**`、`**Checkpoint**`、`## Format:`、`## Implementation Strategy` | `tasks.md` 的說明文字有英文句子，例如「Tasks are grouped by user story to enable independent implementation and testing of each story.」「Project initialization and basic structure」「Each story adds value without breaking previous stories」「With multiple developers:」。這些句子不在 `tasks` Skill 的鎖定段落（Reference Loading Contract、Path Conventions、Dependencies & Execution Order、Notes）內，違反 `shared.md` Rule 1「說明文字必須使用臺灣繁體中文」 | 把 `tasks.md` 的 `**Organization**` 行、各 Phase 的 `**Purpose**` 與 `**Checkpoint**` 行、`## Format:` 的欄位說明、`## Implementation Strategy` 與 `## Parallel Example` 的英文說明改寫成臺灣繁體中文；`[P]`、`[Story]`、`Setup`、`MVP` 等識別字與技術術語保留原文 | `tasks` |
| F1 | 不一致 | HIGH | `plan.md` → `Source Code (repository root)` 的 `tests/`（「scoreGuess 與輸入 schema 的單元測試」）；`research.md` → §9；`tasks.md` → `**Tests**`、T054 | `plan.md` 規劃了 `backend/tests/unit/`、`backend/tests/integration/`、`frontend/tests/e2e/` 的測試內容，`research.md` §9 規定以 Vitest 對 `scoreGuess` 做表格式測試、以 Supertest 與 Playwright 驗證；`tasks.md` 的 `**Tests**` 行卻寫不產生測試任務，Polish 的 T052～T056 驗證腳本「一次性使用，不納入版本控制」。依 `tasks.md` 實作後，repo 不會有 `plan.md` 列出的自動化測試 | 需要使用者決定：要保留自動化測試時，改 `tasks.md`，把 T052～T056 與 T047 的驗證寫成 `backend/tests/`、`frontend/tests/` 下的測試檔；不保留時，改 `plan.md` 的 Source Code 移除 `tests/` 的內容說明，並改 `research.md` §9 的測試策略 | 需要使用者決定（候選：`tasks`、`system-analysis`、`technical-research`） |
| B1 | 歧義 | MEDIUM | `spec.md` → FR-015 | FR-015 是「必須 (MUST)」需求，卻寫「網路中斷時，伺服器預計約 15 秒內偵測到斷線，此為偵測目標…尚未驗證」，看不出 15 秒是不是驗收條件；T047 只驗證離開請求與關閉連線，沒有任務驗證網路中斷時的偵測時間 | 在 `spec.md` 的 FR-015 寫明 15 秒是不是驗收條件；是驗收條件時，再由 `tasks` 在 Polish 新增模擬網路中斷、量測偵測時間的驗證任務 | `clarify-over-specs` |
| F2 | 不一致 | MEDIUM | `contracts/asyncapi.yaml` → `GameResult`；`data/data-model.dbml` → `Table secret_answers` 的 `owner_role`；`tasks.md` → T045、T047 | `GameResult.secrets[].playerId` 與 `GuessRecord.playerId` 為必填，資料表卻只以角色（`owner_role`、`guesser_role`）記錄；T047 在猜測階段離開時先清空離開者的 `room_id`、`room_role` 再呼叫 `publishGameEnded`，T045 沒有寫出離開者的角色要怎麼對回 `playerId`，離開者的答案與猜測紀錄可能缺少 `playerId` | 在 `tasks.md` 的 T045 寫明以 `winnerPlayerId`、`leftPlayerId` 與 `rooms.winner_role` 把雙方角色對回玩家 ID，或把 T047 改成先呼叫 `publishGameEnded`，再清空離開者的 `room_id`、`room_role` | `tasks` |
| F3 | 不一致 | MEDIUM | `contracts/asyncapi.yaml` → `sendConnectError`；`ui/plan.md` → §5「自己連線失敗」「身分已失效」「連線被其他頁面占用」 | 合約的 `connect_error` 會帶 `UNAUTHORIZED` 或 `ALREADY_CONNECTED`；`ui/plan.md` §5 的「自己連線失敗」把所有 `connect_error` 都顯示為「連線中斷了…」，同時「身分已失效」「連線被其他頁面占用」又為這兩個錯誤碼各訂一句文字，同一個情境有兩種回饋 | 在 `ui/plan.md` §5 的「自己連線失敗」寫明只用於沒有錯誤碼的連線失敗；`connect_error` 的 `err.message` 為 `UNAUTHORIZED`、`ALREADY_CONNECTED` 時，分別使用「身分已失效」「連線被其他頁面占用」的文字 | `ui-plan` |
| F4 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `setSecret` 的 `SECRET_INVALID`、`submitGuess` 的 `GUESS_INVALID`；`ui/plan.md` → §5「答案有重複數字」「猜測有重複數字」 | 合約以同一個 `SECRET_INVALID`、`GUESS_INVALID` 表示格式不符與數字重複；`ui/plan.md` §5 只描述前端檢查，格式不符與數字重複各有不同文字，沒有後端回傳這兩個錯誤碼時的回饋，T017 只能把它們對應成「答案要是 4 位數字（0–9）」，數字重複被後端拒絕時文字不符 | 在 `ui/plan.md` §5 新增後端回傳 `SECRET_INVALID`、`GUESS_INVALID` 時的畫面回饋，文字需同時涵蓋格式不符與數字重複，例如「答案要是 4 個不重複的數字（0–9）」 | `ui-plan` |
| B2 | 歧義 | LOW | `spec.md` → NFR-001 | 「在一般網路條件下低於 2 秒」沒有定義「一般網路條件」，T052 在本機量測時無法判斷是否代表驗收條件 | 在 `spec.md` 的 NFR-001 寫出網路條件，例如延遲與頻寬，或明定以本機開發環境量測 | `clarify-over-specs` |
| B3 | 歧義 | LOW | `spec.md` → NFR-004 | 「自然且清晰」「讓使用者看得懂問題所在」沒有可檢查的標準，T057 只能主觀判斷 | 在 `spec.md` 的 NFR-004 補上檢查方式，例如每則錯誤提示都要寫出錯在哪個欄位與正確格式 | `clarify-over-specs` |
| C1 | 不足 | LOW | `plan.md` → `Source Code (repository root)`；`tasks.md` → T006、T007、T016 | T006、T007、T016 建立 `eslint.config.js`、`.prettierrc`、`vitest.config.ts`、`playwright.config.ts` 與 `frontend/src/styles.css`，`plan.md` 的 Source Code 沒有列出這些檔案；`tasks.md` 的 Notes 已記錄此差異 | 在 `plan.md` 的 Source Code 補上這些設定檔與 `frontend/src/styles.css` | `system-analysis` |
| F5 | 不一致 | LOW | `plan.md` → `B2` 的需求依據；`contracts/openapi.yaml` → `leaveRoom`、tag `B2 房間配對與離開 API` | `leaveRoom` 依 FR-015、FR-018 處理猜測階段與設定答案階段的離開（US2 情境 7、US3 情境 6），合約的 B2 tag 也列出 FR-018 與 US3 情境 6；`plan.md` 的 B2 需求依據只列 US3 情境 7，沒有 FR-015、FR-018 | 在 `plan.md` 系統介面盤點的 B2 需求依據補上 US2 情境 7、US3 情境 6、FR-015、FR-018 | `system-analysis` |
| F6 | 不一致 | LOW | `tasks.md` → `### 後端（B3、B4）` 的 T036、T047；`contracts/openapi.yaml` → `leaveRoom` | T036、T047 修改的 `leaveRoom` 屬於 B2，但放在組標題「後端（B3、B4）」下，涵蓋盤點會把這兩個任務算給 B3、B4 | 把 `tasks.md` Phase 4、Phase 5 的後端組標題改為「後端（B2、B3、B4）」 | `tasks` |
| F7 | 不一致 | LOW | `ui/plan.md` → §5「對手離線」；`ui/battle.html` → 雛形狀態 `opp-left` | `ui/plan.md` 的結果卡文字為「你贏了！小米 已離開對局」，雛形多了「，這局判你獲勝」 | 統一 `ui/plan.md` §5「對手離線」與 `ui/battle.html` 的結果卡文字，並同步 T050 的文字 | `ui-plan` |
| A1 | 重複 | LOW | `spec.md` → NFR-003、SC-003 | NFR-003 與 SC-003 都規定對手畫面在 1 秒內更新的比率達 95% 以上 | 在 `spec.md` 保留 SC-003 作為量測目標，把 NFR-003 改為引用 SC-003，或刪除其中一條 | `s-specify` |
| A2 | 重複 | LOW | `spec.md` → FR-015、Assumptions「（推定）」 | Assumptions 重述 FR-015 的「1 秒內結束對局」並標為「推定」，FR-015 卻是「必須 (MUST)」，同一個規定的強度說法不同 | 刪除 `spec.md` Assumptions 中重述 FR-015 的這一條，或移除「（推定）」 | `s-specify` |

超過 50 筆的部分：無（共 14 筆，未超過 50 筆）

## 2. 需求涵蓋

| 需求編號 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- |
| FR-001 | 是 | T009、T013、T015、T021、T022、T028、T030、T059 | 見 F3 |
| FR-002 | 是 | T024、T026、T030、T059 | |
| FR-003 | 是 | T024、T026、T030、T059 | |
| FR-004 | 是 | T009、T024、T059 | |
| FR-005 | 是 | T021、T027、T028、T059 | |
| FR-006 | 是 | T023、T029、T030、T059 | |
| FR-007 | 是 | T025、T026、T029、T030、T059 | |
| NFR-001 | 是 | T024、T028、T030、T052 | 見 B2 |
| FR-008 | 是 | T033、T037、T039、T041、T059 | |
| FR-009 | 是 | T031、T035、T037、T040、T041、T059 | |
| FR-010 | 是 | T031、T035、T040、T041、T059 | |
| FR-018 | 是 | T036、T040、T041、T059 | 見 F5、F6 |
| NFR-002 | 是 | T012、T031、T032、T034、T035、T040、T045、T046、T049、T056 | |
| FR-011 | 是 | T042、T043、T046、T049、T059 | |
| FR-012 | 是 | T044、T046、T048、T049、T059 | |
| FR-013 | 是 | T042、T044、T046、T049、T059 | |
| FR-014 | 是 | T045、T046、T050、T051、T059 | 見 F2 |
| FR-015 | 是 | T047、T050、T051、T059 | 見 B1、F2、F5、A2 |
| FR-016 | 是 | T047、T050、T051、T059 | |
| NFR-003 | 是 | T019、T046、T049、T055 | 見 A1 |
| FR-017 | 是 | T037、T038、T040、T048、T049、T059 | 見 F4 |
| FR-019 | 是 | T009、T015、T025、T026、T030、T031、T036、T041、T042、T047、T051、T059 | |
| NFR-004 | 是 | T011、T016、T017、T027、T028、T057 | 見 B3 |
| SC-001 | 是 | T030、T052 | |
| SC-002 | 是 | T024、T053 | |
| SC-003 | 是 | T051、T055 | 見 A1 |
| SC-004 | 是 | T032、T056 | |
| SC-005 | 是 | T043、T054 | 見 F1 |

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
| F1 進站與配對碼輸入介面 | 前端 | `ui/plan.md` → §1、§3.1、§4、§5；`ui/index.html` | T016、T017、T018、T019、T020、T027、T028、T029、T030 | 見 F3 |
| F2 房間等待與開始遊戲介面 | 前端 | `ui/plan.md` → §1、§3.1、§4、§5；`ui/room.html` | T016、T017、T018、T019、T020、T027、T028、T029、T030、T038、T039、T040、T041 | |
| F3 秘密答案設定介面 | 前端 | `ui/plan.md` → §1、§3.1、§4、§5；`ui/secret.html` | T016、T017、T018、T019、T020、T038、T039、T040、T041 | 見 F4 |
| F4 輪流猜測與對局結果介面 | 前端 | `ui/plan.md` → §1、§3.1、§4、§5；`ui/battle.html` | T016、T017、T018、T019、T020、T049、T050、T051 | 見 F4、F7 |
| B1 玩家進站 API | 後端 | `contracts/openapi.yaml` → `enterAsPlayer` | T011、T012、T013、T014、T015、T021、T022、T023、T024、T025、T026 | |
| B2 房間配對與離開 API | 後端 | `contracts/openapi.yaml` → `matchRoom`、`leaveRoom` | T011、T012、T013、T014、T015、T021、T022、T023、T024、T025、T026 | 見 F5、F6 |
| B3 對局進行 API | 後端 | `contracts/openapi.yaml` → `startGame`、`setSecret`、`submitGuess` | T011、T012、T013、T014、T015、T033、T034、T035、T036、T037、T043、T044、T045、T046、T047、T048 | 見 F4、F6 |
| B4 房間與對局即時推播 | 後端 | `contracts/asyncapi.yaml` → `sendRoomUpdated`、`sendGameEnded`、`sendRoomClosed`、`sendConnectError` | T011、T012、T013、T014、T015、T021、T022、T023、T024、T025、T026、T033、T034、T035、T036、T037、T043、T044、T045、T046、T047、T048 | 見 F2、F3 |
| D1 玩家與房間配對資料存取 | 資料庫 | `data/data-model.dbml` → `Table players`、`Table rooms` | T008、T009、T010 | |
| D2 秘密答案與猜測紀錄持久化 | 資料庫 | `data/data-model.dbml` → `Table secret_answers`、`Table guesses` | T031、T032、T042 | 見 F2 |

## 4. 憲法遵循

| 憲法檔 | Rule | 適用產出物 | 結果 | 問題 ID |
| --- | --- | --- | --- | --- |
| `shared.md` | Rule 1 文件的說明文字必須使用繁體中文 | `spec.md`、`research.md`、`techstack.md`、`plan.md`、`ui/plan.md`、`contracts/`、`data/`、`tasks.md`（`tasks.md` 的鎖定段落不計） | 違反 | D1 |
| `skills/data-plan/data-model.md` | Rule 1 每張資料表必須有生命週期欄位 | `data/data-model.dbml`（4 張表都有 `created_at`、`updated_at`、`updated_by`、`deleted_at`，名稱與型別相符） | 通過 | — |
| `skills/data-plan/data-model.md` | Rule 2 刪除資料必須使用軟刪除 | `data/data-model.dbml`（FR-019 明確要求不保留，例外成立） | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 1 查詢清單的 operation 必須以 page 與 pageSize 分頁 | `contracts/openapi.yaml`（沒有回傳多筆資源的 `GET` operation） | 不適用 | — |
| `skills/api-plan/openapi.md` | Rule 2 分頁 operation 的成功回應必須包含分頁資訊 | `contracts/openapi.yaml`（沒有分頁 operation） | 不適用 | — |
| `skills/api-plan/openapi.md` | Rule 3 分頁參數不合法時必須回應 400 | `contracts/openapi.yaml`（沒有分頁 operation） | 不適用 | — |
| `skills/api-plan/openapi.md` | Rule 4 page 超過總頁數時必須回應空的 items | `contracts/openapi.yaml`（沒有分頁 operation） | 不適用 | — |
| `skills/api-plan/openapi.md` | Rule 5 分頁 operation 必須寫出排序依據 | `contracts/openapi.yaml`（沒有分頁 operation） | 不適用 | — |

## 5. 沒有對應需求的任務

- T001（Phase 1 Setup）：依 plan.md 建立 `frontend/` 與 `backend/` 目錄結構。
- T002（Phase 1 Setup）：初始化後端專案的 `package.json` 與 `tsconfig.json`。
- T003（Phase 1 Setup）：初始化前端專案的 `package.json` 與 `tsconfig.json`。
- T004（Phase 1 Setup）：設定 Vite 的 React plugin 與 `/api`、`/socket.io` 代理。
- T005（Phase 1 Setup）：建立 `postgres:18` 的 Docker Compose 與 `DATABASE_URL` 範例。
- T006（Phase 1 Setup）：設定前後端的 ESLint 與 Prettier。
- T007（Phase 1 Setup）：建立 Vitest 與 Playwright 的測試設定。
- T008（Phase 2 Foundational）：設定 `prisma.config.ts` 與 `schema.prisma` 的 generator、datasource 與三個 enum。
- T010（Phase 2 Foundational）：以 `@prisma/adapter-pg` 建立共用的 `PrismaClient`。
- T014（Phase 2 Foundational）：建立 Express 應用程式與共用 HTTP 伺服器上的 Socket.IO。
- T018（Phase 2 Foundational）：實作前端 REST 呼叫 `httpClient.ts`。
- T020（Phase 2 Foundational）：建立 `App.tsx` 的頂層 `useReducer` 畫面狀態機。
- T058（Phase 6 Polish）：執行前後端的 `npm run check` 並修正錯誤。

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

- 有 CRITICAL 問題：`implement` 前先處理 D1，請用 `tasks` 把 `tasks.md` 鎖定段落以外的英文說明改寫成臺灣繁體中文，再重新執行 `analyze`。
- F1 需要使用者決定是否保留自動化測試，決定後交給 `tasks`、`system-analysis` 或 `technical-research`。
- 建議一併處理 B1、F2、F3、F4；B2、B3、C1、F5、F6、F7、A1、A2 可以之後再處理。
