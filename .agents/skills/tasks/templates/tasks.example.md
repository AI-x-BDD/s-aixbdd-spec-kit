---

description: "Task list for 線上 PVP 1A2B 猜數字對戰平台 implementation"
---

# Tasks: 線上 PVP 1A2B 猜數字對戰平台 (Online PVP 1A2B)

**Input**: Design documents from `/specs/001-online-pvp-1a2b/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, techstack.md, data/data-model.dbml, contracts/openapi.yaml, contracts/asyncapi.yaml, ui/plan.md

**Tests**: spec.md 沒有明確要求測試或 TDD，因此各使用者故事不產生測試任務。Setup 只依 research §9 安裝與設定測試工具，供之後需要時使用。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`、`frontend/src/`（依 plan.md 的 Structure Decision）
- 後端 Prisma schema、migration 與 Docker Compose 放在 `backend/`；不建立 `shared/`，前端自行宣告與合約一致的型別

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 依 plan.md 的 Source Code 建立 `frontend/` 與 `backend/` 目錄結構（含 `frontend/tests/unit/`、`frontend/tests/e2e/`、`backend/tests/unit/`、`backend/tests/integration/`）
- [ ] T002 在 `backend/package.json` 初始化後端專案：相依 `express@5`、`zod@4`、`socket.io@4.8`、`@prisma/client@7.10`、`@prisma/adapter-pg`、`pg`；開發相依 `prisma@7.10`、`typescript@6.0`、`tsx`；script `dev` 為 `tsx watch src/server.ts`、`build` 以 `tsc` 輸出到 `backend/dist/`（research §2、§3、§4、§6）
- [ ] T003 [P] 在 `frontend/package.json` 初始化前端專案：相依 `react@19`、`react-dom@19`、`socket.io-client@4.8`；開發相依 `vite@8`、`@vitejs/plugin-react@6`、`typescript@6.0`（research §1、§4）；不安裝路由、全域狀態與 i18n 套件（techstack.md「本次開發不引入的技術」）
- [ ] T004 [P] 在 `backend/tsconfig.json` 設定 TypeScript 6.0 `strict: true`、輸出目錄 `dist/`
- [ ] T005 [P] 在 `frontend/tsconfig.json` 設定 TypeScript 6.0 `strict: true` 與 React JSX
- [ ] T006 [P] 在 `frontend/vite.config.ts` 掛上 `@vitejs/plugin-react`，並以 `server.proxy` 把 `/api` 與 `/socket.io`（`ws: true`）轉給 `http://localhost:3000`（research §1）
- [ ] T007 [P] 在 `backend/docker-compose.yml` 建立 `postgres:18` 容器（開發與測試資料庫），並在 `backend/.env.example` 寫入 `DATABASE_URL` 連線字串（research §6）
- [ ] T008 [P] 在 `backend/` 與 `frontend/` 設定 ESLint 10＋`typescript-eslint` 8 與 Prettier（`eslint.config.js`、`.prettierrc`），並在兩邊的 `package.json` 加入 `check` script，同時執行 `tsc --noEmit` 與 ESLint（research §2、§9）
- [ ] T009 [P] 依 research §9 安裝測試工具：`backend/package.json` 加入 Vitest 5、Supertest 7、`socket.io-client@4.8` 開發相依並建立 `backend/vitest.config.ts`；`frontend/package.json` 加入 Vitest 5、`@playwright/test@1.64` 並建立 `frontend/vitest.config.ts`、`frontend/playwright.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend

- [ ] T010 在 `backend/prisma.config.ts` 設定 Prisma 7 的資料庫連線（讀取 `DATABASE_URL`）與 migration 路徑 `prisma/migrations`（research §6）
- [ ] T011 在 `backend/prisma/schema.prisma` 設定 `prisma-client` generator、`previewFeatures = ["partialIndexes"]`、PostgreSQL datasource，並建立 enum `room_status`（`waiting`、`ready`、`setting_secrets`、`playing`、`finished`）、`room_role`（`host`、`opponent`）、`game_end_reason`（`solved`、`opponent_left`、`cancelled`）（data/data-model.dbml Enums）
- [ ] T012 在 `backend/prisma/schema.prisma` 建立 `Player` model（對應 `players`）：`id uuid [pk]`；`token uuid [not null, unique]`；`nickname varchar(12) [not null]`「1–12 字，不得為空（FR-001）；不要求唯一」；`room_id uuid`「尚未配對或已離開房間時為 null」；`room_role room_role`「room_id 為 null 時也必須為 null」；`created_at timestamptz [not null, default: now()]`；唯一索引 `(room_id, room_role)` 名稱 `uq_players_room_role`「每間房間最多一位房主與一位對手，即最多兩位玩家（FR-004）」；`Ref: players.room_id > rooms.id [delete: set null]`
- [ ] T013 在 `backend/prisma/schema.prisma` 建立 `Room` model（對應 `rooms`）：`id uuid [pk]`；`pair_code char(4) [not null]`「四位數字配對碼，可重複數字（FR-005）」；`status room_status [not null, default: 'waiting']`；`current_turn room_role`「只有 playing 時有值，進入 playing 時設為 host」；`winner_role room_role`「finished 且 end_reason 為 solved 或 opponent_left 時有值，cancelled 時為 null」；`end_reason game_end_reason`「只有 finished 時有值」；`created_at timestamptz [not null, default: now()]`；部分唯一索引 `@@unique([pairCode], where: { status: "waiting" })` 名稱 `uq_rooms_pair_code_waiting`（research §7）
- [ ] T014 在 `backend/` 執行 `prisma migrate dev --name init_players_rooms`，產生 `backend/prisma/migrations/` 下的遷移檔，確認 SQL 含 `UNIQUE (pair_code) WHERE status = 'waiting'`
- [ ] T015 在 `backend/src/db/prisma.ts` 以 `@prisma/adapter-pg` 與 `pg` 建立並匯出單一 Prisma Client（秘密答案的全域 `omit` 於 US2 的 T036 加入）
- [ ] T016 [P] 在 `backend/src/middleware/errorHandler.ts` 定義 `AppError(code, httpStatus)` 與 Express 錯誤處理中介層，所有錯誤一律回 `{ "error": { "code": "<錯誤碼>" } }`；zod 驗證失敗依欄位轉成 `NICKNAME_INVALID`、`PAIR_CODE_INVALID`、`SECRET_INVALID`、`GUESS_INVALID` 並回 `400`（contracts/openapi.yaml `Error`、research §3）
- [ ] T017 [P] 在 `backend/src/schemas/requests.ts` 建立 zod schema：暱稱 `trim()` 後 1～12 字；配對碼 `/^\d{4}$/`；秘密答案與猜測 `/^(?!.*(\d).*\1)\d{4}$/`；以 `z.infer` 匯出請求型別（research §3、FR-001、FR-005、FR-017）
- [ ] T018 在 `backend/src/middleware/auth.ts` 實作 Bearer token 中介層：以 `Authorization: Bearer <token>` 查出 `Player` 放到 `req`，缺少、無效或玩家已被刪除時拋出 `UNAUTHORIZED`（401）（research §5）
- [ ] T019 [P] 在 `backend/src/realtime/events.ts` 宣告 `ServerToClientEvents`：`room:updated`（`RoomState`）、`game:ended`（`GameResult`）、`room:closed`（`RoomClosedNotice`），以及 `RoomState`、`RoomPlayer`、`GuessRecord` 型別，欄位與 contracts/asyncapi.yaml 一致；除 `GameResult.secrets` 外不得有任何秘密答案欄位（research §8、NFR-002）
- [ ] T020 在 `backend/src/services/roomState.ts` 實作 `toRoomState()`，把資料庫的房間、玩家與猜測紀錄轉成 `RoomState`：狀態對應 `waiting`→`waiting_for_opponent`、`ready`→`ready_to_start`、`setting_secrets`→`setting_secrets`、`playing`→`in_progress`、`finished`→`finished`；`current_turn` 角色轉成 `currentTurnPlayerId`；`secretSet` 只回布林值（plan.md 未列此檔，見 Notes）
- [ ] T021 在 `backend/src/realtime/roomGateway.ts` 實作 Socket.IO 閘道：`io.use()` 驗證 `handshake.auth.token`，缺少或無效時以 `connect_error` 回 `UNAUTHORIZED`、同一 token 已有連線時回 `ALREADY_CONNECTED`（錯誤碼放在 `err.message`，內容放在 `err.data`）；維護 playerId → socket 對照，並提供 `isConnected(playerId)`、`joinRoomChannel(playerId, roomId)`、`leaveRoomChannel(playerId, roomId)`、`emitToRoom(roomId, event, payload)`，room 名稱為 `room:<roomId>`（contracts/asyncapi.yaml、research §4、§5）
- [ ] T022 在 `backend/src/server.ts` 建立 Express 5 應用程式（`express.json()`、路徑前綴 `/api`、掛上 `errorHandler`），以同一個 HTTP 伺服器建立 `new Server<…, ServerToClientEvents>(httpServer, { pingInterval: 10000, pingTimeout: 5000 })` 並掛上 `roomGateway`，監聽 3000 埠；匯出 `app` 供 Supertest 使用（research §3、§4）

### Frontend

- [ ] T023 [P] 在 `frontend/src/text/zh-TW.ts` 集中所有介面文字，並把錯誤碼 `NICKNAME_INVALID`、`PAIR_CODE_INVALID`、`SECRET_INVALID`、`GUESS_INVALID`、`UNAUTHORIZED`、`NOT_HOST`、`ROOM_NOT_FOUND`、`ALREADY_IN_ROOM`、`SOCKET_NOT_CONNECTED`、`MATCH_BUSY`、`OPPONENT_NOT_JOINED`、`GAME_ALREADY_STARTED`、`GAME_NOT_IN_SETUP`、`SECRET_ALREADY_SET`、`GAME_NOT_IN_PROGRESS`、`NOT_YOUR_TURN`、`ALREADY_CONNECTED` 對應成臺灣繁體中文（research §1、NFR-004）
- [ ] T024 [P] 在 `frontend/src/styles.css` 依 ui/plan.md §2 建立全域樣式：配色（背景 `#F3F2FF`、卡片 `#FFFFFF`、主色 `#5B5BD6`、強調 `#FFC83D`、文字 `#24224A`、次要文字 `#6D6A92`、錯誤 `#D2454B`、等待中 `#A0710B`、成功 `#2B9468`）、中文字體與數字用等寬字體、內容最大寬度 720px、360px 寬仍可操作、卡片圓角 16px、藍紫膠囊主要按鈕、暱稱首字圓形頭像（plan.md 未列此檔，見 Notes）
- [ ] T025 [P] 在 `frontend/src/api/httpClient.ts` 實作 REST 呼叫：路徑前綴 `/api`、帶入 `Authorization: Bearer <token>`、錯誤回應解析成錯誤碼；宣告與 contracts/openapi.yaml 一致的請求與回應型別
- [ ] T026 [P] 在 `frontend/src/api/gameSocket.ts` 實作 Socket.IO 連線：`io({ auth: { token }, reconnection: false, transports: ["websocket"] })`，以與 contracts/asyncapi.yaml 一致的 `ServerToClientEvents` 型別訂閱 `room:updated`、`game:ended`、`room:closed`，並處理 `connect_error` 與 `disconnect`（research §4）
- [ ] T027 [P] 在 `frontend/src/components/DigitInput.tsx` 實作四格等寬數字輸入元件，支援兩種模式：配對碼（允許重複數字，FR-005）與不重複數字（秘密答案、猜測，FR-017），即時顯示格式提示，文字取自 `frontend/src/text/zh-TW.ts`
- [ ] T028 在 `frontend/src/App.tsx` 建立頂層 `useReducer` 畫面狀態機骨架：畫面 `entry`、`room`、`secretSetup`、`battle`、`finished`，狀態保存玩家 session（token 只放在 React 狀態，不寫入 `localStorage` 或 Cookie）、房間快照與入口提示訊息；並建立 `frontend/src/main.tsx` 與 `frontend/index.html` 掛載應用程式、載入 `styles.css`（research §1、§5）

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 以四碼配對碼開房或加入房間 (Priority: P1) 🎯 MVP

**Goal**: 玩家以暱稱進站，輸入四碼配對碼後加入相同配對碼的等待中房間，或建立新房間成為房主；房主在對局開始前離開時關閉房間並釋出配對碼。

**Independent Test**: 以兩個互不相干的瀏覽器工作階段各輸入暱稱，先後輸入相同配對碼；驗證第一位成為房主並等待，第二位進入同一房間，雙方都看到彼此暱稱。再以第三個工作階段輸入同一配對碼，驗證其被分配到新的房間。

### Backend for User Story 1

- [ ] T029 [US1] 在 `backend/src/routes/playersRouter.ts` 實作 `POST /api/players`（`enterAsPlayer`）：以 zod 驗證暱稱，`crypto.randomUUID()` 產生 token，建立 `Player`，回 `201` 與 `PlayerSession`（`playerId`、`nickname`、`token`）；暱稱 trim 後為空或超過 12 字回 `NICKNAME_INVALID`；不需認證；在 `backend/src/server.ts` 掛上此 router（FR-001）
- [ ] T030 [US1] 在 `backend/src/services/matchService.ts` 實作 `matchRoom(playerId, pairCode)`：於 `prisma.$transaction(async (tx) => …)` 內以 `tx.$queryRaw` 執行 `SELECT id FROM rooms WHERE pair_code = ${pairCode} AND status = 'waiting' LIMIT 1 FOR UPDATE`；找到時把玩家設為 `opponent`、房間狀態改為 `ready`（`JOINED`）；找不到時建立 `waiting` 房間、玩家設為 `host`（`CREATED`）；捕捉 `P2002` 後重新執行整個交易最多 3 次，仍失敗拋出 `MATCH_BUSY`（503）；玩家已有 `room_id` 拋出 `ALREADY_IN_ROOM`、`roomGateway.isConnected()` 為 false 拋出 `SOCKET_NOT_CONNECTED`（409）（research §7、FR-002、FR-003、FR-004、Edge Cases 同時輸入同一配對碼）
- [ ] T031 [US1] 在 `backend/src/routes/roomsRouter.ts` 實作 `POST /api/rooms/match`（`matchRoom`）：套用 auth 中介層與配對碼 schema（`PAIR_CODE_INVALID`），交易提交後呼叫 `joinRoomChannel()` 並對 `room:<roomId>` 推播 `room:updated`，回 `200` 與 `MatchRoomResponse`（`matchResult`、`room`）；在 `backend/src/server.ts` 掛上此 router（FR-006、NFR-001）
- [ ] T032 [US1] 在 `backend/src/services/matchService.ts` 實作 `leaveRoom(playerId, roomId)` 的開始前分支：房間 `waiting`（只有房主）時刪除房間以釋出配對碼、不推播；房間 `ready` 時刪除房間，對留下的玩家推播 `room:closed`，房主離開 reason 為 `HOST_LEFT_BEFORE_START`、對手離開 reason 為 `OPPONENT_LEFT_BEFORE_START`（後者為待確認點，見 Notes）；玩家不在該房間時拋出 `ROOM_NOT_FOUND`（404）（FR-007、US1 情境 5）
- [ ] T033 [US1] 在 `backend/src/routes/roomsRouter.ts` 實作 `POST /api/rooms/:roomId/leave`（`leaveRoom`）：呼叫 `matchService.leaveRoom()`，把該玩家連線移出 `room:<roomId>`，回 `204`
- [ ] T034 [US1] 在 `backend/src/realtime/roomGateway.ts` 處理 `disconnect`：玩家在房間中時以 `matchService.leaveRoom()` 相同規則處理，之後刪除該 `Player`，讓 token 失效（research §4、§5）

### Frontend for User Story 1

- [ ] T035 [P] [US1] 在 `frontend/src/views/EntryView.tsx` 實作進站與配對畫面（ui/plan.md F1）：暱稱欄（1–12 字）與 `DigitInput` 配對碼欄、說明「跟朋友輸入同一組配對碼，就會進到同一間房」、「進入配對」按鈕；送出時依序 `POST /api/players` → 以 token 建立 Socket.IO 連線 → `POST /api/rooms/match`，期間欄位停用、按鈕改為「配對中…」並轉圈；暱稱空白顯示「請輸入暱稱，最多 12 個字」；配對碼為「12a」或「123」時顯示「配對碼要是 4 位數字（0–9），例如 5208」且不送出；保留頁頂提示訊息的顯示位置（FR-001、FR-005、US1 情境 1、4）
- [ ] T036 [P] [US1] 在 `frontend/src/views/RoomView.tsx` 實作房間畫面的配對部分（ui/plan.md F2）：頁頂顯示配對碼；玩家區以圓形頭像列出房內玩家、標示「（房主）」與「（你）」；只有房主時顯示虛線空位「等待對手加入…」與轉圈；對手加入時提示「<暱稱> 加入了房間」；「離開房間」確認視窗文字「確定要離開嗎？你是房主，離開後房間會關閉，配對碼 <配對碼> 會開放給其他人使用」與「留在房間」「離開」（FR-006、FR-007、US1 情境 1、2、5）
- [ ] T037 [US1] 在 `frontend/src/App.tsx` 串接 US1 流程：配對回應後切到 `room`；`room:updated` 更新房間快照；`room:closed` 時回到 `entry` 並顯示「<暱稱> 離開了房間，這局無法繼續，不判定勝負」；離開房間成功後回到 `entry`、清空配對碼；錯誤碼一律經 `zh-TW.ts` 顯示

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 房主開始遊戲並雙方設定秘密答案 (Priority: P2)

**Goal**: 房間湊滿兩人後，只有房主可以開始遊戲；雙方各自設定只有自己知道的四位不重複秘密答案，都完成後進入猜測階段並由房主先手。

**Independent Test**: 在已湊滿兩人的房間中，驗證只有房主能開始遊戲；雙方各自輸入合法的秘密答案後，確認畫面進入猜測階段，且任一方的畫面上都看不到對方的答案。

### Backend for User Story 2

- [ ] T038 [US2] 在 `backend/prisma/schema.prisma` 建立 `SecretAnswer` model（對應 `secret_answers`）：`id uuid [pk]`；`room_id uuid [not null]`；`owner_role room_role [not null]`「以角色而非玩家 id 記錄，玩家斷線刪除後仍能在結束時揭曉」；`digits char(4) [not null]`「四位不重複數字，可以 0 開頭（FR-017）；明文存放，供計算 A／B」；`created_at timestamptz [not null, default: now()]`；唯一索引 `(room_id, owner_role)` 名稱 `uq_secret_answers_room_owner`「每位玩家每場只設定一次」；`Ref: secret_answers.room_id > rooms.id [delete: cascade]`；執行 `prisma migrate dev --name add_secret_answers` 產生 `backend/prisma/migrations/` 下的遷移檔
- [ ] T039 [US2] 在 `backend/src/db/prisma.ts` 為 Prisma Client 加上全域 `omit: { secretAnswer: { digits: true } }`，預設排除秘密答案；只有 A／B 判定與對局結束揭曉的查詢可以 `omit: { digits: false }` 明確取回（research §8、NFR-002、SC-004）
- [ ] T040 [US2] 在 `backend/src/services/gameService.ts` 實作 `startGame(playerId, roomId)`：交易內 `FOR UPDATE` 鎖定房間；非房主拋出 `NOT_HOST`（403）；房間為 `waiting` 拋出 `OPPONENT_NOT_JOINED`（409）；房間已是 `setting_secrets`、`playing` 或 `finished` 拋出 `GAME_ALREADY_STARTED`（409）；成功時狀態 `ready` → `setting_secrets`（FR-008、US2 情境 1–3）
- [ ] T041 [US2] 在 `backend/src/services/gameService.ts` 實作 `setSecret(playerId, roomId, secret)`：交易內 `FOR UPDATE` 鎖定房間；不在 `setting_secrets` 拋出 `GAME_NOT_IN_SETUP`、該角色已有答案拋出 `SECRET_ALREADY_SET`（409）；寫入 `SecretAnswer`（`owner_role` 為玩家角色）；雙方都有答案時狀態改為 `playing`、`current_turn` 設為 `host`（FR-009、FR-010、US2 情境 4–6）
- [ ] T042 [US2] 在 `backend/src/routes/roomsRouter.ts` 實作 `POST /api/rooms/:roomId/start`（`startGame`）與 `POST /api/rooms/:roomId/secret`（`setSecret`，以 schema 驗證回 `SECRET_INVALID`），兩者都回 `200` 與 `RoomState`（不含答案），並在交易提交後對 `room:<roomId>` 推播 `room:updated`（contracts/openapi.yaml、contracts/asyncapi.yaml `sendRoomUpdated`）
- [ ] T043 [US2] 在 `backend/src/services/matchService.ts` 擴充 `leaveRoom()` 的 `setting_secrets` 分支：房間設為 `finished`、`end_reason` 為 `cancelled`、`winner_role` 為 null，對留下的玩家推播 `room:closed`（reason `PLAYER_LEFT_DURING_SETUP`、`leftPlayerId`、`leftPlayerNickname`），之後刪除房間（連帶刪除秘密答案）；斷線經 T034 走相同分支（FR-018、US2 情境 7）

### Frontend for User Story 2

- [ ] T044 [P] [US2] 在 `frontend/src/views/RoomView.tsx` 加入開始遊戲功能：只有房主看到「開始遊戲」按鈕，按下後改為「開始中…」並停用；房內只有房主時在按鈕下方顯示黃色提示「還沒有對手加入，等對手進房後才能開始遊戲」；對手身分不顯示按鈕，改顯示「等房主 <暱稱> 開始遊戲」（FR-008、US2 情境 1–3）
- [ ] T045 [P] [US2] 在 `frontend/src/views/SecretSetupView.tsx` 實作設定秘密答案畫面（ui/plan.md F3）：以不重複模式的 `DigitInput` 輸入答案，說明「設定 4 個不重複的數字，可以 0 開頭，只有你看得到」；送出時欄位停用、按鈕改為「送出中…」；「1123」顯示「答案要是 4 個不重複的數字，1 重複了」、「73」或「7a10」顯示「答案要是 4 位數字（0–9）」且不送出；送出後顯示「你的答案 <答案>」與鎖頭圖示及「等待對手設定答案」；依 `secretSet` 顯示對手「<暱稱> 設定中…」或綠色「<暱稱> 已設定好答案」；雙方完成時顯示「雙方都準備好了！<房主暱稱> 先猜」；「離開房間」確認視窗「確定要離開嗎？離開後這局會取消，不判定勝負」與「留下來」「離開」（FR-009、FR-010、FR-017、FR-018、US2 情境 4–7）
- [ ] T046 [US2] 在 `frontend/src/App.tsx` 串接 US2 流程：`room:updated` 的 `status` 為 `setting_secrets` 時切到 `secretSetup`、為 `in_progress` 時切到 `battle`；`room:closed` 的 `PLAYER_LEFT_DURING_SETUP` 先彈出視窗「<暱稱> 離開了房間，這局無法繼續，不判定勝負」與「回到入口」，按下後回到 `entry`，暱稱欄保留並在頁頂顯示同一句提示（FR-018）

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 輪流猜對方答案直到分出勝負 (Priority: P3)

**Goal**: 兩位玩家輪流猜對方的秘密答案，每次猜測後回報幾 A 幾 B；先猜出 4A 者獲勝，對局結束並揭曉雙方答案；猜測階段一方離開時另一方獲勝。

**Independent Test**: 以兩位玩家進入猜測階段，輪流提交猜測；驗證 A、B 回饋與標準 1A2B 規則一致，輪次交替，其中一方猜出 4A 後對局結束並宣告勝者。

### Backend for User Story 3

- [ ] T047 [P] [US3] 在 `backend/src/services/scoreGuess.ts` 實作純函式 `scoreGuess(secret: string, guess: string): { a: number; b: number }`，A 為數字與位置皆正確、B 為數字正確但位置錯誤，不依賴資料庫與網路（research §8、FR-011、SC-005）
- [ ] T048 [US3] 在 `backend/prisma/schema.prisma` 建立 `Guess` model（對應 `guesses`）：`id uuid [pk]`；`room_id uuid [not null]`；`sequence integer [not null]`「本場從 1 開始遞增的提交順序，在鎖定房間的交易中取得」；`guesser_role room_role [not null]`；`digits char(4) [not null]`「四位不重複數字（FR-017）；可與先前猜測重複」；`a_count smallint [not null]`「0–4」；`b_count smallint [not null]`「0–4」；`created_at timestamptz [not null, default: now()]`；唯一索引 `(room_id, sequence)` 名稱 `uq_guesses_room_sequence`；`Ref: guesses.room_id > rooms.id [delete: cascade]`；執行 `prisma migrate dev --name add_guesses` 產生 `backend/prisma/migrations/` 下的遷移檔
- [ ] T049 [US3] 在 `backend/src/services/gameService.ts` 實作 `submitGuess(playerId, roomId, guess)`：交易內 `FOR UPDATE` 鎖定房間；不在 `playing` 拋出 `GAME_NOT_IN_PROGRESS`、`current_turn` 不是提交者角色拋出 `NOT_YOUR_TURN`（409，不新增紀錄）；以 `omit: { digits: false }` 取回對手的 `SecretAnswer` 並呼叫 `scoreGuess`；寫入 `sequence` 為本場最大值＋1 的 `Guess`；`a` 為 4 時狀態改為 `finished`、`end_reason` 為 `solved`、`winner_role` 為提交者、`current_turn` 為 null，否則把 `current_turn` 交給對手；重複猜同一組數字照常處理（FR-011、FR-012、FR-013、FR-014、Edge Cases 重複猜同一組數字）
- [ ] T050 [US3] 在 `backend/src/routes/roomsRouter.ts` 實作 `POST /api/rooms/:roomId/guesses`（`submitGuess`，以 schema 驗證回 `GUESS_INVALID`），回 `201` 與 `SubmitGuessResponse`（不含秘密答案）；交易提交後，未結束時推播 `room:updated`，猜出 4A 時改推播 `game:ended`（reason `GUESSED_4A`、`winnerPlayerId`、`leftPlayerId` 為 null、雙方 `secrets`、完整 `guesses`），這是唯一取回雙方答案送出的地方（contracts/asyncapi.yaml `sendGameEnded`、NFR-002、NFR-003）
- [ ] T051 [US3] 在 `backend/src/services/matchService.ts` 擴充 `leaveRoom()`：`playing` 時房間設為 `finished`、`end_reason` 為 `opponent_left`、`winner_role` 為留下的一方，推播 `game:ended`（reason `PLAYER_LEFT`、`leftPlayerId` 為離開者、揭曉雙方 `secrets`）；`finished` 時只清除該玩家的 `room_id`，雙方都離開後刪除房間（連帶刪除秘密答案與猜測紀錄）；斷線經 T034 走相同分支（FR-015、FR-016、US3 情境 6）

### Frontend for User Story 3

- [ ] T052 [P] [US3] 在 `frontend/src/views/BattleView.tsx` 實作對戰與結果畫面（ui/plan.md F4）：顯示回合數、「你的答案 <答案>」與「<對手暱稱> 的答案 ● ● ● ●」；輪到自己時黃色提示條「輪到你猜！」並開放不重複模式的 `DigitInput` 與「送出猜測」，送出時改為「送出中…」；輪到對手時淡紫提示條「<對手暱稱> 正在猜…」並轉圈、按鈕停用且文字為「等待 <對手暱稱> 猜測」；猜測紀錄依 `sequence` 列出暱稱、數字與 A／B，沒有紀錄時顯示「還沒有人猜，<房主暱稱> 先手」，重複猜過的數字加註灰色小字「猜過了」；「4409」顯示「猜測要是 4 個不重複的數字，4 重複了」、「40」或「40a6」顯示「猜測要是 4 位數字（0–9）」；`NOT_YOUR_TURN` 顯示「還沒輪到你，這次猜測沒有送出，請等 <對手暱稱> 猜完」；結果卡：獲勝「你贏了！第 <n> 手猜中 <對手暱稱> 的答案」、落敗「<對手暱稱> 獲勝」與「<對手暱稱> 在第 <n> 手猜中你的答案」、對手離開「你贏了！<對手暱稱> 已離開對局」，揭曉雙方答案並提供「回到入口」；「離開對局」確認視窗「確定要離開嗎？對戰中離開，這局會直接判 <對手暱稱> 獲勝」與「繼續對戰」「離開」（FR-011～FR-017、US3 情境 1–6）
- [ ] T053 [US3] 在 `frontend/src/App.tsx` 串接 US3 流程：`room:updated` 更新猜測紀錄與輪次；`game:ended` 切到 `finished` 並保存勝負與雙方答案；按「回到入口」時呼叫 `POST /api/rooms/:roomId/leave` 後回到 `entry`，保留暱稱與 token、清空配對碼，頁頂顯示「上一局已結束，輸入配對碼開始新的一局」（FR-014、FR-016）

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T054 [P] 在 `specs/001-online-pvp-1a2b/quickstart.md` 寫下本機啟動步驟：`docker compose up -d`、`prisma migrate dev`、`npm run dev`（後端 `tsx watch`、前端 Vite），以及用兩個瀏覽器工作階段手動走完 US1～US3 的 Independent Test
- [ ] T055 [P] 檢查 `frontend/src/views/` 與 `frontend/src/components/` 沒有寫死的介面文字，全部改從 `frontend/src/text/zh-TW.ts` 取用，並逐條確認用語為自然的臺灣繁體中文（NFR-004）
- [ ] T056 秘密答案外洩檢查：確認 `backend/src/` 中只有 `gameService.submitGuess()` 與對局結束揭曉使用 `omit: { digits: false }`，所有 REST 回應與 `room:updated`、`room:closed` 的內容都不含秘密答案（NFR-002、SC-004）
- [ ] T057 [P] 以 Chrome DevTools 在 360px 與 720px 寬度檢查四個畫面都能完整操作，配色與版面符合 ui/plan.md §2
- [ ] T058 在 `backend/` 與 `frontend/` 執行 `npm run check`（`tsc --noEmit`＋ESLint）與 Prettier，修正所有錯誤
- [ ] T059 依 `specs/001-online-pvp-1a2b/quickstart.md` 走一次完整流程驗證

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US2 以 US1 的配對與房間為前提（要先有兩人同房），US3 以 US2 的秘密答案為前提，因此建議依 P1 → P2 → P3 循序進行
  - 前端與後端任務在同一個故事內可以平行（不同檔案）
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: 需要 US1 的 `matchRoom` 才能湊滿兩人；`leaveRoom()`（T043）擴充 US1 的 T032，`RoomView.tsx`（T044）擴充 US1 的 T036
- **User Story 3 (P3)**: 需要 US2 的 `SecretAnswer` 與 `playing` 狀態；`leaveRoom()`（T051）擴充 T043，`App.tsx`（T053）擴充 T046

### Within Each User Story

- Prisma model 與 migration → services → routes／推播 → 前端 view → `App.tsx` 串接
- `matchService.ts`、`gameService.ts`、`roomsRouter.ts`、`App.tsx` 在同一故事內由多個任務修改，這些任務要循序進行
- Story complete before moving to next priority

### Parallel Opportunities

- Setup：T003～T009 可平行
- Foundational：後端 T016、T017、T019 可平行；前端 T023～T027 可平行，且可與後端任務同時進行
- US1：T035、T036（前端 view）可與 T029～T034（後端）同時進行
- US2：T044、T045 可與 T038～T043 同時進行
- US3：T047（純函式）可與 T048 同時開始；T052 可與後端任務同時進行
- Polish：T054、T055、T057 可平行

---

## Parallel Example: User Story 1

```bash
# 後端與前端同時開工：
Task: "實作 POST /api/players in backend/src/routes/playersRouter.ts"
Task: "實作進站與配對畫面 in frontend/src/views/EntryView.tsx"
Task: "實作房間畫面的配對部分 in frontend/src/views/RoomView.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "建立 SecretAnswer model 與 migration in backend/prisma/schema.prisma"
Task: "加入開始遊戲功能 in frontend/src/views/RoomView.tsx"
Task: "實作設定秘密答案畫面 in frontend/src/views/SecretSetupView.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "實作 scoreGuess 純函式 in backend/src/services/scoreGuess.ts"
Task: "建立 Guess model 與 migration in backend/prisma/schema.prisma"
Task: "實作對戰與結果畫面 in frontend/src/views/BattleView.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 以 US1 的 Independent Test 驗證配對與離開房間
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP：可以配對進同一間房)
3. Add User Story 2 → Test independently → Deploy/Demo（可以開始遊戲並設定答案）
4. Add User Story 3 → Test independently → Deploy/Demo（完整對戰）
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done，每個故事依序進行，故事內分工：
   - Developer A：後端（Prisma、services、routes、推播）
   - Developer B：前端（views、`App.tsx`）
3. 雙方以 contracts/openapi.yaml 與 contracts/asyncapi.yaml 為介面約定，故事完成後一起驗證

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- plan.md 的 Source Code 沒有列出 `backend/src/services/roomState.ts`（T020）與 `frontend/src/styles.css`（T024），本 tasks.md 新增這兩個檔案；若要維持 plan.md 的結構，可改把 `toRoomState()` 放進 `backend/src/realtime/events.ts`、樣式放進 `frontend/index.html`
- 待確認 1：兩人到齊、開始前對手離開，contracts 採 `room:closed` 的 `OPPONENT_LEFT_BEFORE_START`，但 spec 沒有規定、ui/plan.md 也未規劃該畫面；T032、T037 先照 contracts 實作
- 待確認 2：房間狀態命名不一致（API：`waiting_for_opponent`、`ready_to_start`、`setting_secrets`、`in_progress`、`finished`；DBML：`waiting`、`ready`、`setting_secrets`、`playing`、`finished`）；T020 先以對應表轉換，若決定統一命名，需同步修改 T011、T020 與 contracts
