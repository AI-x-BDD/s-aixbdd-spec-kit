---

description: "Task list for 線上 PVP 1A2B 猜數字對戰平台 implementation"
---

# Tasks: 線上 PVP 1A2B 猜數字對戰平台 (Online PVP 1A2B)

**Input**: Design documents from `/specs/001-online-pvp-1a2b/`（依下方 Reference Loading Contract 按任務載入）

**Tests**: spec.md 沒有明確要求撰寫測試或 TDD，因此各使用者故事不產生測試任務。Setup 只依 research §9 安裝與設定測試工具，供之後需要時使用；Success Criteria 的量測要求放在 Polish 以驗證任務處理。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. 每個階段內再依 plan.md「系統介面盤點」的技術端點（資料庫、後端、前端）分組，標題列出該組實作的介面編號；每個任務下方以 Must Read／Optional 列出執行時要讀的文件部位。

## Reference Loading Contract

執行本檔的任務時，依下列規則載入 `/specs/001-online-pvp-1a2b/` 的文件：

1. 開工前只讀本檔，不預先讀 spec package 的其他文件。
2. 每個任務下方列出它的參考，分兩級：
   - **Must Read**：開始這個任務前一定要讀完的部位。
   - **Optional**：只在遇到該項 Why 描述的情況時才讀。
3. 每項參考寫成 `` `檔案` → 部位 — Why：理由 ``。Why 說明這個部位決定任務的哪一部分，讀的時候以它為重點。
4. 只讀列出的部位，不讀整份文件。部位以文件內可搜尋的識別字定位：
   - `contracts/openapi.yaml`：operationId，或 `components` 底下的 schema、response、securityScheme 名稱
   - `contracts/asyncapi.yaml`：operation 名稱、`components.schemas` 名稱，或 `info.description`
   - `data/data-model.dbml`：`Table`、`Enum`、`Ref`
   - `spec.md`：US 情境、FR／NFR／SC 編號、Edge Cases 項目
   - `research.md`、`ui/plan.md`：章節編號（§），以及表格中的畫面、狀態或操作編號
   - `techstack.md`、`plan.md`：章節標題
   - `ui/*.html`：雛形右下角「雛形狀態」面板的狀態名稱
5. 部位內有 `$ref` 或引用其他部位時，順著讀到被引用的部位。
6. Must Read 與任務描述矛盾時，停下來回報，不自行決定。
7. 讀完 Must Read 與 Optional 仍缺資訊時，回報缺少什麼，不為了補資訊讀完整份文件。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`、`frontend/src/`（依 plan.md 的 Structure Decision）
- Prisma schema 與 Docker Compose 放在 `backend/`；不建立 `shared/`，前端在 `frontend/src/api/gameSocket.ts` 自行宣告與合約一致的事件型別
- 各畫面樣式集中在 `frontend/src/styles.css`，所有介面文字集中在 `frontend/src/text/zh-TW.ts`（research §1）

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 依 plan.md 的 Source Code 建立 `frontend/` 與 `backend/` 目錄結構（含 `frontend/tests/unit/`、`frontend/tests/e2e/`、`backend/tests/unit/`、`backend/tests/integration/`、`backend/prisma/migrations/`）（research §1、§6）
  - **Must Read**
    - `plan.md` → Source Code (repository root) — Why：前後端的目錄與檔案配置
    - `plan.md` → Structure Decision — Why：Prisma schema 與 Docker Compose 放在 `backend/`，不建立 `shared/`
- [ ] T002 在 `backend/package.json` 與 `backend/tsconfig.json` 初始化後端專案：`"type": "module"`、`strict: true`；相依 `express@5`、`zod@4`、`socket.io@4.8`、`@prisma/client@7.10`、`@prisma/adapter-pg`、`pg`；開發相依 `typescript@6.0`、`tsx`、`prisma@7.10`、`eslint@10`、`typescript-eslint@8`、`prettier`、`vitest@5`、`supertest@7`、`socket.io-client@4.8` 與對應的 `@types/*`；script `dev` 為 `tsx watch src/server.ts`、`build` 為 `tsc`、`check` 為 `tsc --noEmit && eslint . && prettier --check .`、`test` 為 `vitest run`（research §2、§3、§4、§6、§9）
  - **Must Read**
    - `techstack.md` → 技術堆疊總覽 — Why：後端各套件採用的版本
    - `research.md` → §2 — Why：TypeScript 6.0 `strict`、`tsx watch` 與 `tsc` 輸出到 `backend/dist/`、ESLint 10 搭配 `typescript-eslint` 8
    - `research.md` → §9 — Why：測試工具的版本，以及 `tsc --noEmit` 與 ESLint 併入同一個檢查命令
- [ ] T003 [P] 在 `frontend/package.json` 與 `frontend/tsconfig.json` 初始化前端專案：`strict: true`；相依 `react@19`、`react-dom@19`、`socket.io-client@4.8`；開發相依 `vite@8`、`@vitejs/plugin-react@6`、`typescript@6.0`、`eslint@10`、`typescript-eslint@8`、`prettier`、`vitest@5`、`@playwright/test@1.64` 與 `@types/react`、`@types/react-dom`；script `dev` 為 `vite`、`build` 為 `tsc --noEmit && vite build`、`check` 為 `tsc --noEmit && eslint . && prettier --check .`、`test` 為 `vitest run`；不安裝 React Router、Zustand、Redux Toolkit、react-i18next（research §1、§2、§9）
  - **Must Read**
    - `techstack.md` → 技術堆疊總覽 — Why：前端各套件採用的版本
    - `techstack.md` → 本次開發不引入的技術 — Why：不得安裝的路由、全域狀態與國際化套件
    - `research.md` → §1 — Why：React 19＋Vite 8 與不引入路由、全域狀態管理套件
- [ ] T004 [P] 在 `frontend/vite.config.ts` 掛上 `@vitejs/plugin-react`，並以 `server.proxy` 把 `/api` 與 `/socket.io`（`ws: true`）轉給 `http://localhost:3000`（research §1、§4）
  - **Must Read**
    - `research.md` → §1 — Why：開發時以 Vite `server.proxy` 轉發 `/api` 與 `/socket.io`
  - **Optional**
    - `contracts/asyncapi.yaml` → `servers.development` — Why：代理 Socket.IO 連線不通時，確認主機、port 與只用 WebSocket 傳輸
- [ ] T005 [P] 在 `backend/docker-compose.yml` 建立 `postgres:18` 容器（開發與測試資料庫），並在 `backend/.env.example` 寫入 `DATABASE_URL`（research §6）
  - **Must Read**
    - `research.md` → §6 — Why：PostgreSQL 18 與 Docker Compose 的開發測試資料庫，連線字串放環境變數
- [ ] T006 [P] 在 `backend/eslint.config.js`、`frontend/eslint.config.js` 設定 ESLint 10 flat config（`typescript-eslint` 8），並在兩邊建立 `.prettierrc`（research §2；plan.md 未列這些檔案，見 Notes）
  - **Must Read**
    - `research.md` → §2 — Why：靜態檢查與格式化的工具組合
- [ ] T007 [P] 依 research §9 建立測試設定：`backend/vitest.config.ts`（涵蓋 `tests/unit`、`tests/integration`，連到 Docker Compose 的測試資料庫）、`frontend/vitest.config.ts`（涵蓋 `tests/unit`）、`frontend/playwright.config.ts`（`tests/e2e`，webServer 啟動 Vite；plan.md 未列這些檔案，見 Notes）
  - **Must Read**
    - `research.md` → §9 — Why：前後端各自的測試工具與測試資料庫的連線方式

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 資料庫（D1 共用）

- [ ] T008 在 `backend/prisma.config.ts` 讀取 `DATABASE_URL` 並指定 schema 與 migrations 位置，在 `backend/prisma/schema.prisma` 開頭設定 generator `prisma-client`（`previewFeatures = ["partialIndexes"]`）、datasource `postgresql`，並建立 enum：`RoomStatus`（`waiting`、`ready`、`setting_secrets`、`playing`、`finished`，`@@map("room_status")`）、`RoomRole`（`host`、`opponent`，`@@map("room_role")`）、`GameEndReason`（`solved`、`opponent_left`、`cancelled`，`@@map("game_end_reason")`）；enum 值與合約 `RoomState.status` 的對應見 Notes 待確認 1（research §6）
  - **Must Read**
    - `data/data-model.dbml` → `Enum room_status`、`Enum room_role`、`Enum game_end_reason` — Why：三個 enum 的值與每個值代表的情況
    - `research.md` → §6 — Why：`prisma-client` generator、`partialIndexes` 預覽旗標與 `prisma.config.ts` 的連線設定
- [ ] T009 在 `backend/prisma/schema.prisma` 建立 `Player`（`@@map("players")`）：`id uuid [pk]`；`token uuid [not null, unique]`；`nickname varchar(12) [not null]`；`room_id uuid`；`room_role room_role`；`created_at timestamptz [not null, default: now()]`；`@@unique([roomId, roomRole], map: "uq_players_room_role")`，以及 `Room`（`@@map("rooms")`）：`id uuid [pk]`；`pair_code char(4) [not null]`；`status room_status [not null, default: 'waiting']`；`current_turn room_role`；`winner_role room_role`；`end_reason game_end_reason`；`created_at timestamptz [not null, default: now()]`；`@@unique([pairCode], where: { status: waiting }, map: "uq_rooms_pair_code_waiting")`；`Ref: players.room_id > rooms.id [delete: set null]`；執行 `docker compose up -d` 與 `npx prisma migrate dev --name init_players_rooms`，以 `psql` 確認兩張表與兩個索引已建立；刪除房間後 `room_role` 不會自動清空，見 Notes 待確認 3（FR-001、FR-004、research §6、§7）
  - **Must Read**
    - `data/data-model.dbml` → `Table players`、`Table rooms` — Why：欄位、約束、`uq_players_room_role` 與 `uq_rooms_pair_code_waiting`
    - `data/data-model.dbml` → `Ref: players.room_id > rooms.id [delete: set null]` — Why：房間刪除時玩家 `room_id` 的行為
    - `research.md` → §7 — Why：以 `@@unique([pairCode], where: { status: "waiting" })` 保證同一配對碼最多一間等待中房間
- [ ] T010 在 `backend/src/db/prisma.ts` 以 `@prisma/adapter-pg`（`PrismaPg`）與 `pg` 讀取 `DATABASE_URL` 建立並匯出單一 `PrismaClient`（`prisma`）；秘密答案的全域 `omit` 於 US2 建立 `secret_answers` 後加入（research §6、§8）
  - **Must Read**
    - `research.md` → §6 — Why：Prisma 7 必須透過 driver adapter 連線，使用 `@prisma/adapter-pg` 與 `pg`
  - **Optional**
    - `research.md` → §8 — Why：需要確認之後全域 `omit` 在 Client 設定中的位置時

### 後端（B1–B4 共用）

- [ ] T011 [P] 在 `backend/src/middleware/errorHandler.ts` 定義 `AppError(code, httpStatus)` 與 Express 錯誤處理中介層，所有錯誤一律回 `{ "error": { "code": "<錯誤碼>" } }`；`ZodError` 依第一個不符欄位轉成錯誤碼並回 `400`：`nickname`→`NICKNAME_INVALID`、`pairCode`→`PAIR_CODE_INVALID`、`secret`→`SECRET_INVALID`、`guess`→`GUESS_INVALID`；錯誤碼與狀態碼：`UNAUTHORIZED` 401、`NOT_HOST` 403、`ROOM_NOT_FOUND` 404、`ALREADY_IN_ROOM`／`SOCKET_NOT_CONNECTED`／`OPPONENT_NOT_JOINED`／`GAME_ALREADY_STARTED`／`GAME_NOT_IN_SETUP`／`SECRET_ALREADY_SET`／`GAME_NOT_IN_PROGRESS`／`NOT_YOUR_TURN` 409、`MATCH_BUSY` 503（NFR-004、research §3）
  - **Must Read**
    - `contracts/openapi.yaml` → `components.schemas.Error` — Why：錯誤回應格式與完整錯誤碼清單
    - `contracts/openapi.yaml` → `components.responses` — Why：每個錯誤碼對應的 HTTP 狀態碼
    - `research.md` → §3 — Why：後端只回穩定的錯誤碼，繁體中文文字由前端決定
- [ ] T012 [P] 在 `backend/src/realtime/events.ts` 宣告 `RoomState`、`RoomPlayer`、`GuessRecord`、`GameResult`、`RoomClosedNotice` 型別與 `ServerToClientEvents`（`room:updated` 帶 `RoomState`、`game:ended` 帶 `GameResult`、`room:closed` 帶 `RoomClosedNotice`），`ClientToServerEvents` 為空；只有 `GameResult` 有 `secrets` 欄位，其餘型別不得出現秘密答案欄位（NFR-002、research §4、§8）
  - **Must Read**
    - `contracts/asyncapi.yaml` → `RoomState`、`RoomPlayer`、`GuessRecord`、`GameResult`、`RoomClosedNotice` — Why：各事件的欄位、必填與列舉值（`reason`、`role`、`status`）
    - `research.md` → §8 — Why：除對局結束事件外，事件型別不得有秘密答案欄位
- [ ] T013 在 `backend/src/middleware/auth.ts` 實作 Bearer 驗證中介層：讀取 `Authorization: Bearer <token>`，以 `prisma.player.findUnique({ where: { token } })` 查出玩家並掛到 `req.player`；缺少 token 或查不到玩家時拋出 `AppError('UNAUTHORIZED', 401)`（FR-001、research §5）
  - **Must Read**
    - `research.md` → §5 — Why：不透明 token 以 `Authorization: Bearer <token>` 帶入，由中介層查出玩家
    - `contracts/openapi.yaml` → `components.securitySchemes.playerToken`、`components.responses.Unauthorized` — Why：驗證方式與 `UNAUTHORIZED` 的情況
- [ ] T014 在 `backend/src/server.ts` 建立 Express 5 應用程式（`express.json()`、路徑前綴 `/api`、最後掛上 `errorHandler`），以同一個 `http.createServer(app)` 建立 `new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, { pingInterval: 10000, pingTimeout: 5000 })`；匯出 `app`、`httpServer`、`io` 供 Supertest 與整合測試使用，監聽 3000 埠只在直接執行 `server.ts` 時進行（research §3、§4）
  - **Must Read**
    - `research.md` → §3 — Why：Express 5 與路徑前綴 `/api`
    - `research.md` → §4 — Why：Socket.IO 掛在同一個 HTTP 伺服器，以及 `pingInterval`、`pingTimeout` 的值
  - **Optional**
    - `contracts/asyncapi.yaml` → `servers.development` — Why：需要確認 Socket.IO 路徑 `/socket.io` 與只用 WebSocket 傳輸時
- [ ] T015 在 `backend/src/realtime/roomGateway.ts` 實作 `registerRoomGateway(io)`：`io.use()` 驗證 `handshake.auth.token`，token 缺少或無效時以 `err.message = 'UNAUTHORIZED'`、`err.data = { error: { code: 'UNAUTHORIZED' } }` 拒絕，同一個 token 已有連線時以 `ALREADY_CONNECTED` 拒絕；維護 `playerId → socket` 對照，匯出 `isConnected(playerId)`、`joinRoomChannel(playerId, roomId)`（加入 `room:<roomId>`）、`leaveRoomChannel(playerId, roomId)`、`emitToRoom(roomId, event, payload)` 與 `onPlayerDisconnect(handler)`；`disconnect` 時先呼叫已登錄的 handler，再刪除該玩家資料；並在 `backend/src/server.ts` 呼叫 `registerRoomGateway(io)`（FR-001、research §4、§5）
  - **Must Read**
    - `contracts/asyncapi.yaml` → `sendConnectError`、`ALREADY_CONNECTED` — Why：連線驗證失敗的錯誤碼與 `err.message`、`err.data` 的放法
    - `research.md` → §5 — Why：每個 token 只允許一條連線，斷線時刪除玩家資料
    - `research.md` → §4 — Why：`disconnect` 比照玩家離開房間處理，room 命名為 `room:<roomId>`
  - **Optional**
    - `contracts/asyncapi.yaml` → `info.description` — Why：需要確認事件只推播給 `room:<roomId>` 且 REST 交易提交後才推播時

### 前端（F1–F4 共用）

- [ ] T016 在 `frontend/index.html` 建立掛載點（`lang="zh-Hant-TW"`），在 `frontend/src/main.tsx` 以 React 19 掛載 `App`，並在 `frontend/src/styles.css`（plan.md 未列，見 Notes）寫入共用樣式：配色變數（背景 `#F3F2FF`、卡片 `#FFFFFF`、主色 `#5B5BD6`、強調 `#FFC83D`、文字 `#24224A`、次要文字 `#6D6A92`、錯誤 `#D2454B`、等待中 `#A0710B`、成功 `#2B9468`）、系統無襯線中文字體（PingFang TC、Noto Sans TC、微軟正黑體）、配對碼與答案用等寬字體（SF Mono、Menlo、Consolas）搭配等寬數字、內容最大寬度 720px、360px 寬仍可操作、卡片圓角 16px、藍紫實心膠囊主要按鈕（NFR-004、research §1）
  - **Must Read**
    - `ui/plan.md` → §2 — Why：配色、字體與版面規則
    - `research.md` → §1 — Why：React 19＋Vite 8 掛載，不引入路由與全域狀態管理套件
  - **Optional**
    - `ui/index.html` → `<style>` — Why：需要對照雛形的實際樣式數值時
- [ ] T017 在 `frontend/src/text/zh-TW.ts` 建立 `ERROR_TEXT`（錯誤碼 → 臺灣繁體中文文字）與 `errorText(code, params?)`：`NICKNAME_INVALID`「請輸入暱稱，最多 12 個字」、`PAIR_CODE_INVALID`「配對碼要是 4 位數字（0–9），例如 5208」、`SECRET_INVALID`「答案要是 4 位數字（0–9）」、`GUESS_INVALID`「猜測要是 4 位數字（0–9）」、`OPPONENT_NOT_JOINED`「還沒有對手加入，等對手進房後才能開始遊戲」、`NOT_YOUR_TURN`「還沒輪到你，這次猜測沒有送出，請等 <對手暱稱> 猜完」；其餘錯誤碼沒有上游文字，先回通用文字「發生錯誤，請稍後再試」（見 Notes 待確認 5）；之後各畫面的文字都加在此檔（NFR-004、research §1）
  - **Must Read**
    - `ui/plan.md` → §5 — Why：各驗證與錯誤情境的畫面文字
    - `contracts/openapi.yaml` → `components.schemas.Error` — Why：需要對應文字的完整錯誤碼清單
    - `research.md` → §1 — Why：所有介面文字與錯誤碼對應集中在單一模組
- [ ] T018 [P] 在 `frontend/src/api/httpClient.ts` 實作 REST 呼叫 `request(method, path, { token, body })`：路徑前綴 `/api`、JSON 請求與回應，有 token 時帶 `Authorization: Bearer <token>`；非 2xx 時解析 `{ error: { code } }` 並拋出 `ApiError(code, httpStatus)`；`204` 回傳 `undefined`；token 只由呼叫端以參數傳入，不寫入 `localStorage` 或 Cookie（research §1、§5）
  - **Must Read**
    - `contracts/openapi.yaml` → `components.schemas.Error` — Why：錯誤回應的格式
    - `research.md` → §5 — Why：token 只放在 React 狀態，以 Bearer 帶入
- [ ] T019 [P] 在 `frontend/src/api/gameSocket.ts` 宣告與合約一致的 `RoomState`、`RoomPlayer`、`GuessRecord`、`GameResult`、`RoomClosedNotice` 型別，並實作 `connectGameSocket(token, handlers)`：`io({ auth: { token }, reconnection: false, transports: ["websocket"] })`，訂閱 `room:updated`、`game:ended`、`room:closed`，`connect_error` 時以 `err.message` 作為錯誤碼呼叫 `onConnectError`，`disconnect` 時呼叫 `onDisconnect`，回傳主動斷線的函式；自己的連線中斷或建立失敗時的畫面見 Notes 待確認 6（NFR-003、research §4、§5）
  - **Must Read**
    - `contracts/asyncapi.yaml` → `info.description` — Why：前端連線的參數與每個 token 只允許一條連線
    - `contracts/asyncapi.yaml` → `sendConnectError` — Why：`connect_error` 時錯誤碼放在 `err.message`
    - `contracts/asyncapi.yaml` → `RoomState`、`GameResult`、`RoomClosedNotice` — Why：事件資料的型別
- [ ] T020 在 `frontend/src/App.tsx` 建立頂層 `useReducer` 畫面狀態機，狀態含 `screen`（`entry`、`room`、`secret`、`battle`）、`session`（`playerId`、`nickname`、`token`）、`room`（`RoomState`）、`result`（`GameResult`）、`notice`；動作含 `signedIn`、`roomUpdated`、`gameEnded`、`roomClosed`、`backToEntry`；以 `screenForStatus` 把 `RoomState.status` 對應到畫面：`waiting_for_opponent`／`ready_to_start`→`room`、`setting_secrets`→`secret`、`in_progress`→`battle`；不使用路由（research §1）
  - **Must Read**
    - `research.md` → §1 — Why：畫面由 `useReducer` 狀態機依 REST 回應與 Socket.IO 事件切換
    - `ui/plan.md` → §3.2 — Why：各畫面之間的轉換條件
    - `contracts/openapi.yaml` → `RoomState` — Why：`status` 的值決定目前畫面

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 以四碼配對碼開房或加入房間 (Priority: P1) 🎯 MVP

**Goal**: 玩家以暱稱進站後輸入四碼配對碼：有相同配對碼且在等待對手的房間就加入成為對手，沒有符合的房間就開新房間成為房主；房主在對局開始前離開時房間關閉並釋出配對碼。

**Independent Test**: 以兩個互不相干的瀏覽器工作階段各輸入暱稱，先後輸入配對碼 `1234`；確認第一位成為房主並看到「等待對手加入…」，第二位進入同一房間，雙方畫面都顯示彼此暱稱；再以第三個工作階段輸入 `1234`，確認被分配到新的房間；房主離開等待中的房間後，再輸入 `1234` 會建立新房間。

### 後端（B1、B2、B4）

> D1 的 `players`、`rooms` 已在 Foundational 建立，本故事沒有資料庫任務。

- [ ] T021 [US1] 在 `backend/src/schemas/requests.ts` 以 zod 4 定義 `enterPlayerSchema`（`nickname`：`trim()` 後 1～12 字）與 `matchRoomSchema`（`pairCode`：`/^\d{4}$/`）（FR-001、FR-005、research §3）
  - **Must Read**
    - `research.md` → §3 — Why：暱稱 `trim()` 後 1～12 字與配對碼 `/^\d{4}$/` 的規則
    - `contracts/openapi.yaml` → `EnterPlayerRequest`、`MatchRoomRequest` — Why：請求欄位與格式
- [ ] T022 [US1] 在 `backend/src/routes/playersRouter.ts` 實作 `POST /api/players`（`enterAsPlayer`，不需 token）：以 `enterPlayerSchema` 驗證，用 `crypto.randomUUID()` 產生 `token` 與玩家 `id`，把暱稱與 token 存入 `players`，回 `201` 與 `PlayerSession`（`playerId`、`nickname`、`token`）；暱稱空白或超過 12 字時回 `400` `NICKNAME_INVALID`；在 `backend/src/server.ts` 掛上此 router（FR-001、research §5）
  - **Must Read**
    - `contracts/openapi.yaml` → `enterAsPlayer`、`PlayerSession` — Why：路徑、`201` 回應與 `NICKNAME_INVALID`
    - `research.md` → §5 — Why：token 由 `crypto.randomUUID()` 產生並與暱稱存入玩家資料
- [ ] T023 [US1] 在 `backend/src/realtime/roomGateway.ts` 實作 `buildRoomState(roomId)` 與 `publishRoomUpdated(roomId)`：讀出房間與房內玩家（房主在前），組成 `RoomState`（`roomId`、`pairCode`、`status`、`hostPlayerId`、`players`、`currentTurnPlayerId: null`、`guesses: []`），`status` 由資料庫值轉成合約值（`waiting`→`waiting_for_opponent`、`ready`→`ready_to_start`，見 Notes 待確認 1），再以 `emitToRoom` 推播 `room:updated`；`secretSet` 先固定為 `false`，由 US2 補上（FR-006、research §4）
  - **Must Read**
    - `contracts/asyncapi.yaml` → `sendRoomUpdated` — Why：推播的時機與房間狀態快照的內容
    - `contracts/openapi.yaml` → `RoomState`、`RoomPlayer` — Why：欄位、`role` 與 `status` 的列舉值
    - `research.md` → §4 — Why：REST 指令交易提交後才推播
- [ ] T024 [US1] 在 `backend/src/services/matchService.ts` 實作 `matchRoom(playerId, pairCode)`：玩家沒有 Socket.IO 連線（`isConnected` 為 false）拋出 `SOCKET_NOT_CONNECTED`，已在房間內拋出 `ALREADY_IN_ROOM`（皆 409）；在 `prisma.$transaction` 內以 `$queryRaw` 執行 `SELECT id FROM rooms WHERE pair_code = ${pairCode} AND status = 'waiting' LIMIT 1 FOR UPDATE`，找到時玩家成為 `opponent`、房間 `status` 改為 `ready`、`matchResult` 為 `JOINED`，找不到時（含相同配對碼的房間已滿或已開始）建立 `status = 'waiting'` 的新房間、玩家成為 `host`、`matchResult` 為 `CREATED`；Prisma 錯誤碼 `P2002` 時重新執行整個交易，最多 3 次，仍失敗拋出 `MATCH_BUSY`（503）；提交後呼叫 `joinRoomChannel` 與 `publishRoomUpdated`，回傳 `matchResult` 與 `RoomState`（FR-002、FR-003、FR-004、SC-002、NFR-001、Edge Cases 同時輸入同一配對碼、配對碼被占用）
  - **Must Read**
    - `research.md` → §7 — Why：交易內 `FOR UPDATE`、部分唯一索引與 `P2002` 重試最多 3 次
    - `contracts/openapi.yaml` → `matchRoom`、`MatchRoomResponse`（含 `MatchConflict`、`MatchBusy`） — Why：`JOINED`／`CREATED` 的判斷與各錯誤碼
    - `data/data-model.dbml` → `Table rooms` 的 `uq_rooms_pair_code_waiting` — Why：同一配對碼最多一間等待中房間的保證
  - **Optional**
    - `spec.md` → Edge Cases「配對碼被占用」 — Why：需要確認房間已滿或已開始時改建新房間而不是拒絕時
- [ ] T025 [US1] 在 `backend/src/services/matchService.ts` 實作 `leaveRoom(playerId, roomId)`（本任務處理 `waiting`、`ready` 兩種狀態，其他狀態由 US2、US3 補上）：玩家不在該房間拋出 `ROOM_NOT_FOUND`（404）；`waiting` 時刪除房間以釋出配對碼；`ready` 時刪除房間並對留下的玩家推播 `room:closed`（離開者是房主為 `HOST_LEFT_BEFORE_START`，是對手為 `OPPONENT_LEFT_BEFORE_START`，帶 `leftPlayerId`、`leftPlayerNickname`）；兩種情況都把房內玩家的 `room_id` 與 `room_role` 一併清空（見 Notes 待確認 3），並對離開者呼叫 `leaveRoomChannel`（FR-007、Edge Cases 等待中房主離開）
  - **Must Read**
    - `contracts/openapi.yaml` → `leaveRoom` — Why：各房間狀態離開時的處理與 `ROOM_NOT_FOUND`
    - `contracts/asyncapi.yaml` → `sendRoomClosed`、`RoomClosedNotice` — Why：`room:closed` 的 `reason`、推播對象與欄位
    - `data/data-model.dbml` → `Ref: players.room_id > rooms.id [delete: set null]` — Why：刪除房間時玩家 `room_id` 的行為
  - **Optional**
    - `spec.md` → FR-007 — Why：需要確認釋出配對碼的條件時
- [ ] T026 [US1] 在 `backend/src/routes/roomsRouter.ts` 實作 `POST /api/rooms/match`（`matchRoom`，掛 `auth` 中介層、以 `matchRoomSchema` 驗證，回 `200` 與 `MatchRoomResponse`）與 `POST /api/rooms/:roomId/leave`（`leaveRoom`，回 `204`）；在 `backend/src/server.ts` 掛上此 router 於 `/api/rooms`，並以 `onPlayerDisconnect` 登錄斷線處理：玩家在房間內時呼叫 `matchService.leaveRoom`（FR-002、FR-003、FR-007、research §4）
  - **Must Read**
    - `contracts/openapi.yaml` → `matchRoom`、`leaveRoom` — Why：兩個路由的路徑、狀態碼與回應
    - `research.md` → §4 — Why：Socket.IO `disconnect` 時比照玩家離開房間處理

### 前端（F1、F2）

- [ ] T027 [US1] 在 `frontend/src/components/DigitInput.tsx` 實作四位數字輸入（四個等寬方格、等寬字體），props 含 `value`、`onChange`、`label`、`disabled`、`error`；本任務只處理配對碼：空白、少於四位或含非數字時，在欄位下方顯示「配對碼要是 4 位數字（0–9），例如 5208」並以紅框標示；文字加在 `frontend/src/text/zh-TW.ts`（FR-005、US1 情境 4、NFR-004）
  - **Must Read**
    - `ui/plan.md` → §2 — Why：四位數字以四個等寬方格呈現、使用等寬字體
    - `ui/plan.md` → §5 `index.html` 的「配對碼含非數字」「配對碼少於四位」 — Why：驗證文字與紅框呈現
    - `ui/index.html` → 雛形狀態「欄位驗證錯誤」 — Why：欄位錯誤時的實際樣子
- [ ] T028 [US1] 在 `frontend/src/views/EntryView.tsx` 實作進站與配對畫面（F1）：暱稱欄（1–12 字）、配對碼欄（`DigitInput`）、說明「跟朋友輸入同一組配對碼，就會進到同一間房」與「進入配對」按鈕；送出時暱稱空白或只有空格顯示「請輸入暱稱，最多 12 個字」、配對碼不合格式顯示配對碼錯誤文字，並且不呼叫 `onSubmit(nickname, pairCode)`；`submitting` 時欄位停用、按鈕改為「配對中…」並顯示轉圈；`error` 以 `errorText` 顯示；`notice`（文字與色調）顯示在頁頂；`initialNickname` 帶入暱稱欄（FR-001、FR-005、US1 情境 4、NFR-001、NFR-004）
  - **Must Read**
    - `ui/plan.md` → §3.3 A1、A2 — Why：本畫面的使用者操作
    - `ui/plan.md` → §4 `index.html` 的「填寫暱稱與配對碼」「配對中」「對局結束後回到入口」「對手離開後回到入口」 — Why：各狀態的呈現與頁頂提示的位置
    - `ui/plan.md` → §5 `index.html` 的「暱稱空白」「配對碼含非數字」「配對碼少於四位」 — Why：驗證文字與紅框呈現
    - `ui/index.html` → 雛形狀態「填寫暱稱與配對碼」「配對中」「欄位驗證錯誤」 — Why：欄位、說明文字與按鈕的實際樣子
- [ ] T029 [US1] 在 `frontend/src/views/RoomView.tsx` 實作房間畫面等待與顯示部分（F2）：頁頂顯示配對碼；玩家區以暱稱首字圓形頭像列出房內玩家，房主標示「（房主）」、自己標示「（你）」；只有房主時顯示虛線空位「等待對手加入…」與轉圈；對手加入後顯示「<暱稱> 加入了房間」；以對手身分檢視時顯示「等房主 <暱稱> 開始遊戲」；「離開房間」開啟確認視窗：房主為「確定要離開嗎？你是房主，離開後房間會關閉，配對碼 <配對碼> 會開放給其他人使用」與「留在房間」「離開」，非房主的確認視窗文字見 Notes 待確認 4；配對碼被占用時照常顯示新房間，不顯示錯誤（FR-006、FR-007、US1 情境 1、2、5）
  - **Must Read**
    - `ui/plan.md` → §3.3 A3、A5 — Why：本畫面的使用者操作
    - `ui/plan.md` → §4 `room.html` 的「等待對手加入」「對手已加入」「以對手身分檢視」「確認離開房間」 — Why：各狀態的呈現與文字
    - `ui/plan.md` → §5 `room.html` 的「配對碼已被占用」「房主在等待中離開」 — Why：配對碼被占用與房主離開時的畫面回饋
    - `ui/room.html` → 雛形狀態「等待對手加入」「對手已加入」「以對手身分檢視」「確認離開房間」 — Why：玩家區、空位與確認視窗的實際樣子
- [ ] T030 [US1] 在 `frontend/src/App.tsx` 串接 US1 流程：`EntryView` 的 `onSubmit` 依序呼叫 `enterAsPlayer`、`connectGameSocket(token)`（等 `connect` 成功）、`matchRoom`，成功後 dispatch `signedIn` 與 `roomUpdated`；`room:updated` 更新 `room` 並依 `screenForStatus` 切換畫面；`RoomView` 的「離開」呼叫 `leaveRoom` 後斷開 Socket.IO、回到入口並清空配對碼欄；收到 `room:closed` 時回到入口，頁頂以黃色提示「<leftPlayerNickname> 離開了房間，這局無法繼續」（`HOST_LEFT_BEFORE_START`、`OPPONENT_LEFT_BEFORE_START` 的提示見 Notes 待確認 4）；回到入口後再次配對要重新呼叫 `enterAsPlayer`（見 Notes 待確認 2）；Socket.IO 連線失敗或自己的連線中斷時回到入口並以通用文字提示（見 Notes 待確認 6）（FR-002、FR-003、FR-006、FR-007、NFR-001、SC-001）
  - **Must Read**
    - `ui/plan.md` → §3.2 — Why：入口與房間之間的轉換條件
    - `contracts/openapi.yaml` → `enterAsPlayer`、`matchRoom`、`leaveRoom` — Why：呼叫的順序、請求與回應
    - `contracts/asyncapi.yaml` → `info.description` — Why：取得 token 後要先建立 Socket.IO 連線，才能呼叫配對
    - `research.md` → §1 — Why：畫面依 REST 回應與 Socket.IO 事件切換，token 只放在 React 狀態

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 房主開始遊戲並雙方設定秘密答案 (Priority: P2)

**Goal**: 房間湊滿兩位玩家後，房主按下開始，雙方各自設定只有自己知道的四位不重複秘密答案，兩人都完成後進入猜測階段並由房主先手；設定階段有一方離開時通知另一方，不判定勝負。

**Independent Test**: 在已湊滿兩人的房間中，確認只有房主看得到「開始遊戲」且房內只有房主時按下會提示需等待對手；房主開始後雙方各自輸入合法答案（例如 `7310`），輸入 `1123` 會被拒絕；雙方都完成後進入猜測階段並由房主先手，任一方畫面都看不到對方的答案；設定答案階段一方離開時，另一方看到「<暱稱> 離開了房間，這局無法繼續，不判定勝負」並回到入口。

### 資料庫（D2）

- [ ] T031 [US2] 在 `backend/prisma/schema.prisma` 建立 `SecretAnswer`（`@@map("secret_answers")`）：`id uuid [pk]`；`room_id uuid [not null]`；`owner_role room_role [not null]`；`digits char(4) [not null]`；`created_at timestamptz [not null, default: now()]`；`@@unique([roomId, ownerRole], map: "uq_secret_answers_room_owner")`；`Ref: secret_answers.room_id > rooms.id [delete: cascade]`；執行 `npx prisma migrate dev --name add_secret_answers` 確認建立成功（FR-009、FR-010、NFR-002）
  - **Must Read**
    - `data/data-model.dbml` → `Table secret_answers` — Why：欄位、`owner_role` 以角色記錄，以及唯一索引 `uq_secret_answers_room_owner`
    - `data/data-model.dbml` → `Ref: secret_answers.room_id > rooms.id [delete: cascade]` — Why：房間刪除時連帶刪除秘密答案
- [ ] T032 [US2] 在 `backend/src/db/prisma.ts` 為 `PrismaClient` 加上全域 `omit: { secretAnswer: { digits: true } }`，預設查詢不取回秘密答案；只有 A／B 判定與對局結束揭曉的查詢以 `omit: { digits: false }` 明確取回（NFR-002、SC-004、research §8）
  - **Must Read**
    - `research.md` → §8 — Why：全域 `omit` 預設排除秘密答案欄位，只有 A／B 判定與對局結束揭曉才取回
    - `data/data-model.dbml` → `Table secret_answers` 的 `digits` — Why：要排除的欄位

### 後端（B3、B4）

- [ ] T033 [US2] 在 `backend/src/services/gameService.ts` 實作 `startGame(playerId, roomId)`：在交易內讀取房間；玩家不在該房間拋出 `ROOM_NOT_FOUND`，不是房主拋出 `NOT_HOST`（403），房間 `waiting` 拋出 `OPPONENT_NOT_JOINED`（409），房間已是 `setting_secrets`、`playing` 或 `finished` 拋出 `GAME_ALREADY_STARTED`（409）；`ready` 時把 `status` 改為 `setting_secrets`，提交後呼叫 `publishRoomUpdated`，回傳 `RoomState`；狀態值對應見 Notes 待確認 1（FR-008、US2 情境 1–3）
  - **Must Read**
    - `contracts/openapi.yaml` → `startGame`（含 `Forbidden`、`StartConflict`） — Why：各錯誤碼對應的情況與成功後的房間狀態
    - `data/data-model.dbml` → `Enum room_status` — Why：`waiting`、`ready`、`setting_secrets` 代表的情況
    - `spec.md` → FR-008 — Why：只有房主在房內已有兩位玩家時可以開始
- [ ] T034 [US2] 在 `backend/src/realtime/roomGateway.ts` 的 `buildRoomState` 補上 `RoomPlayer.secretSet`：依 `secret_answers` 是否已有該玩家角色的資料決定，查詢只確認是否存在，不取回 `digits`（NFR-002、US2 情境 5）
  - **Must Read**
    - `contracts/openapi.yaml` → `RoomPlayer` — Why：`secretSet` 只揭露是否設定，不含答案內容
    - `research.md` → §8 — Why：事件與回應型別沒有秘密答案欄位
- [ ] T035 [US2] 在 `backend/src/services/gameService.ts` 實作 `setSecret(playerId, roomId, secret)`：在 `FOR UPDATE` 鎖定房間的交易內處理；房間不在 `setting_secrets` 拋出 `GAME_NOT_IN_SETUP`，該玩家已有 `secret_answers` 拋出 `SECRET_ALREADY_SET`（皆 409）；寫入 `secret_answers`（`owner_role` 取玩家的 `room_role`，`digits` 為 `secret`）；雙方都已設定時把房間 `status` 改為 `playing`、`current_turn` 設為 `host`；提交後呼叫 `publishRoomUpdated`，回傳不含答案的 `RoomState`（FR-009、FR-010、NFR-002、US2 情境 5、6）
  - **Must Read**
    - `contracts/openapi.yaml` → `setSecret`（含 `SecretConflict`） — Why：階段限制、只能設定一次與各錯誤碼
    - `data/data-model.dbml` → `Table secret_answers` 的 `uq_secret_answers_room_owner` — Why：每位玩家每場只設定一次
    - `data/data-model.dbml` → `Table rooms` 的 `current_turn` — Why：進入 `playing` 時設為 `host`
    - `research.md` → §8 — Why：答案只存在 PostgreSQL，回應與推播不含答案
- [ ] T036 [US2] 在 `backend/src/services/matchService.ts` 的 `leaveRoom` 補上 `setting_secrets` 狀態（FR-018）：把房間 `status` 改為 `finished`、`end_reason` 為 `cancelled`、`winner_role` 為 null，離開者的 `room_id` 與 `room_role` 清空，對留下的玩家推播 `room:closed`（`reason` 為 `PLAYER_LEFT_DURING_SETUP`，帶 `leftPlayerId`、`leftPlayerNickname`），不判定勝負；房內已沒有玩家時刪除房間（連帶刪除 `secret_answers`）（FR-018、US2 情境 7、Edge Cases 秘密答案階段離開）
  - **Must Read**
    - `contracts/asyncapi.yaml` → `sendRoomClosed` — Why：`PLAYER_LEFT_DURING_SETUP` 的推播條件與欄位
    - `contracts/openapi.yaml` → `leaveRoom` — Why：設定秘密答案階段離開時關閉房間、不判定勝負
    - `data/data-model.dbml` → `Enum game_end_reason` — Why：`cancelled` 代表設定答案階段離開、不判定勝負
- [ ] T037 [US2] 在 `backend/src/schemas/requests.ts` 新增 `setSecretSchema`（`secret`：`/^(?!.*(\d).*\1)\d{4}$/`），並在 `backend/src/routes/roomsRouter.ts` 實作 `POST /api/rooms/:roomId/start`（`startGame`，回 `200` 與 `RoomState`）與 `POST /api/rooms/:roomId/secret`（`setSecret`，以 `setSecretSchema` 驗證，回 `200` 與 `RoomState`），兩者都掛 `auth` 中介層（FR-008、FR-009、FR-017、research §3）
  - **Must Read**
    - `contracts/openapi.yaml` → `startGame`、`setSecret`、`SetSecretRequest` — Why：路徑、請求欄位、狀態碼與回應
    - `research.md` → §3 — Why：秘密答案四位不重複的正則表示式

### 前端（F2、F3）

- [ ] T038 [US2] 在 `frontend/src/components/DigitInput.tsx` 新增 `unique` 模式與對應文字（加在 `frontend/src/text/zh-TW.ts`）：`label` 為「答案」或「猜測」時，少於四位或含非數字顯示「答案要是 4 位數字（0–9）」或「猜測要是 4 位數字（0–9）」，有重複數字顯示「答案要是 4 個不重複的數字，<數字> 重複了」或「猜測要是 4 個不重複的數字，<數字> 重複了」（<數字> 為第一個重複的數字）；可以 0 開頭（FR-017、US2 情境 4）
  - **Must Read**
    - `ui/plan.md` → §5 `secret.html` 的「答案有重複數字」「答案少於四位或含非數字」 — Why：答案欄的驗證文字
    - `ui/plan.md` → §5 `battle.html` 的「猜測有重複數字」「猜測少於四位或含非數字」 — Why：猜測欄使用同一個元件，文字不同
- [ ] T039 [US2] 在 `frontend/src/views/RoomView.tsx` 補上開始遊戲：房主在房內滿兩人時顯示可按的「開始遊戲」，按下呼叫 `onStart`，期間按鈕改為「開始中…」並停用；房內只有房主時按下「開始遊戲」，在按鈕下方顯示黃色提示「還沒有對手加入，等對手進房後才能開始遊戲」，畫面維持等待對手加入；非房主不顯示「開始遊戲」（FR-008、US2 情境 1–3）
  - **Must Read**
    - `ui/plan.md` → §3.3 A4 — Why：房主開始遊戲的操作
    - `ui/plan.md` → §4 `room.html` 的「對手已加入」「開始遊戲中」 — Why：按鈕可按與「開始中…」停用的呈現
    - `ui/plan.md` → §5 `room.html` 的「對手尚未加入就開始」「非房主沒有開始功能」 — Why：提示文字與非房主的畫面
    - `ui/room.html` → 雛形狀態「開始遊戲中」「對手尚未加入就開始」 — Why：按鈕與提示的實際樣子
- [ ] T040 [US2] 在 `frontend/src/views/SecretSetupView.tsx` 實作設定秘密答案畫面（F3）：`DigitInput`（`unique`、`label` 為「答案」）與說明「設定 4 個不重複的數字，可以 0 開頭，只有你看得到」，對手狀態「<暱稱> 設定中…」，對手先完成時改為綠色「<暱稱> 已設定好答案」並提示「<暱稱> 已經準備好了，換你設定」；送出中答案停用、按鈕改為「送出中…」；送出後輸入區換成「你的答案 <答案>」與鎖頭圖示（答案只存在本機狀態，不向伺服器取回）、轉圈與「等待對手設定答案」；雙方完成時黃色提示條「雙方都準備好了！<房主暱稱> 先猜」；「離開房間」確認視窗「確定要離開嗎？離開後這局會取消，不判定勝負」與「留下來」「離開」；對手離開時彈出視窗「<暱稱> 離開了房間，這局無法繼續，不判定勝負」與「回到入口」（FR-009、FR-010、FR-017、FR-018、NFR-002、US2 情境 4–7）
  - **Must Read**
    - `ui/plan.md` → §3.3 A6、A7、A8 — Why：本畫面的使用者操作
    - `ui/plan.md` → §4 `secret.html` 的「設定秘密答案」「送出答案中」「對手先完成設定」「等待對手設定答案」「雙方設定完成」「確認離開房間」 — Why：各狀態的呈現與文字
    - `ui/plan.md` → §5 `secret.html` 的「對手在設定階段離開」 — Why：對手離開時的彈出視窗與回到入口
    - `ui/secret.html` → 雛形狀態「設定秘密答案」「送出答案中」「對手先完成設定」「等待對手設定答案」「雙方設定完成」「確認離開房間」「對手在設定階段離開」 — Why：各狀態的實際樣子
- [ ] T041 [US2] 在 `frontend/src/App.tsx` 串接 US2 流程：`RoomView` 的 `onStart` 呼叫 `startGame`；`SecretSetupView` 的送出呼叫 `setSecret`，成功後把自己的答案存在 reducer 狀態 `mySecret`；`room:updated` 的 `status` 為 `setting_secrets` 時切到 `secret`、`in_progress` 時切到 `battle`；設定階段收到 `room:closed`（`PLAYER_LEFT_DURING_SETUP`）時顯示對手離開視窗，按「回到入口」後回到入口並以黃色提示顯示同一句文字；離開設定畫面呼叫 `leaveRoom` 後回到入口；回到入口後的連線處理見 Notes 待確認 2（FR-008、FR-009、FR-010、FR-018）
  - **Must Read**
    - `ui/plan.md` → §3.2 — Why：房間、設定答案、對戰與入口之間的轉換
    - `contracts/openapi.yaml` → `startGame`、`setSecret` — Why：呼叫的 API 與回應
    - `contracts/asyncapi.yaml` → `sendRoomUpdated`、`sendRoomClosed` — Why：切換畫面與對手離開的推播

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 輪流猜對方答案直到分出勝負 (Priority: P3)

**Goal**: 猜測階段兩位玩家輪流猜對方的四位秘密答案，每次猜測後回報幾 A 幾 B；先猜出 4A 的玩家獲勝，對局結束並揭曉雙方答案；猜測階段一方離開時判另一方獲勝。

**Independent Test**: 兩位玩家進入猜測階段後輪流提交猜測：對方答案為 `1234` 時猜 `1243` 回報 `2A2B`；未輪到的玩家提交會被拒絕；其中一方猜出 `4A` 後雙方畫面宣告勝者並揭曉雙方答案；另開一場，對戰中一方離開，另一方被判獲勝。

### 資料庫（D2）

- [ ] T042 [US3] 在 `backend/prisma/schema.prisma` 建立 `Guess`（`@@map("guesses")`）：`id uuid [pk]`；`room_id uuid [not null]`；`sequence integer [not null]`；`guesser_role room_role [not null]`；`digits char(4) [not null]`；`a_count smallint [not null]`；`b_count smallint [not null]`；`created_at timestamptz [not null, default: now()]`；`@@unique([roomId, sequence], map: "uq_guesses_room_sequence")`；`Ref: guesses.room_id > rooms.id [delete: cascade]`；執行 `npx prisma migrate dev --name add_guesses` 確認建立成功（FR-011、FR-013）
  - **Must Read**
    - `data/data-model.dbml` → `Table guesses` — Why：欄位、可與先前猜測重複的 `digits`，以及唯一索引 `uq_guesses_room_sequence`
    - `data/data-model.dbml` → `Ref: guesses.room_id > rooms.id [delete: cascade]` — Why：房間刪除時連帶刪除猜測紀錄

### 後端（B3、B4）

- [ ] T043 [P] [US3] 在 `backend/src/services/scoreGuess.ts` 實作純函式 `scoreGuess(secret: string, guess: string): { a: number; b: number }`：`a` 為數字與位置皆相同的個數，`b` 為數字出現在答案中但位置不同的個數；例如答案 `1234`、猜測 `1243` 回 `{ a: 2, b: 2 }`（FR-011、SC-005、US3 情境 1）
  - **Must Read**
    - `spec.md` → US3 情境 1、FR-011 — Why：A／B 的定義與 `1234` 猜 `1243` 回報 `2A2B` 的範例
    - `research.md` → §8 — Why：A／B 由後端純函式 `scoreGuess` 計算，前端不計算
- [ ] T044 [US3] 在 `backend/src/realtime/roomGateway.ts` 的 `buildRoomState` 補上輪次與猜測紀錄：`status` 為 `playing` 時 `currentTurnPlayerId` 取 `current_turn` 角色對應的玩家，其餘為 `null`（`playing` 轉為 `in_progress`，見 Notes 待確認 1）；`guesses` 依 `sequence` 遞增列出，`guesser_role` 轉成 `playerId`，`a_count`、`b_count` 轉成 `a`、`b`（FR-012、FR-013）
  - **Must Read**
    - `contracts/openapi.yaml` → `RoomState`、`GuessRecord` — Why：`currentTurnPlayerId` 與 `guesses` 的欄位
    - `data/data-model.dbml` → `Table guesses` — Why：`guesser_role`、`a_count`、`b_count` 對應的欄位
    - `data/data-model.dbml` → `Table rooms` 的 `current_turn` — Why：輪次以角色記錄
- [ ] T045 [US3] 在 `backend/src/realtime/roomGateway.ts` 實作 `publishGameEnded(roomId, { reason, winnerPlayerId, leftPlayerId })`：以 `omit: { digits: false }` 取回雙方 `secret_answers`，連同完整 `guesses` 組成 `GameResult`（`secrets` 每筆含 `playerId`、`secret`），推播 `game:ended`；本事件是對局結束前唯一含秘密答案的事件（FR-014、NFR-002）
  - **Must Read**
    - `contracts/asyncapi.yaml` → `sendGameEnded`、`GameResult` — Why：`reason`、`winnerPlayerId`、`leftPlayerId`、`secrets` 與 `guesses` 的內容
    - `research.md` → §8 — Why：只有對局結束事件同時帶雙方答案，且需以 `omit: { digits: false }` 取回
    - `data/data-model.dbml` → `Table secret_answers` — Why：答案以 `owner_role` 記錄，需對回玩家 ID
- [ ] T046 [US3] 在 `backend/src/services/gameService.ts` 實作 `submitGuess(playerId, roomId, guess)`：在 `$queryRaw` `SELECT … FROM rooms WHERE id = ${roomId} FOR UPDATE` 鎖定房間的交易內處理；房間不在 `playing` 拋出 `GAME_NOT_IN_PROGRESS`，`current_turn` 不是該玩家的角色拋出 `NOT_YOUR_TURN`（皆 409，不新增紀錄）；以 `omit: { digits: false }` 取回對手答案，呼叫 `scoreGuess`，寫入 `guesses`（`sequence` 為目前最大值加 1，重複猜同一組數字照常記錄）；`a` 為 4 時把房間改為 `finished`、`end_reason` 為 `solved`、`winner_role` 為提交者，否則 `current_turn` 換成對手；提交後，沒有猜出 4A 時呼叫 `publishRoomUpdated`，猜出 4A 時呼叫 `publishGameEnded`（`reason` 為 `GUESSED_4A`、`leftPlayerId` 為 null）；回傳 `SubmitGuessResponse`（`guess`、`status`、`currentTurnPlayerId`、`winnerPlayerId`）且不含任何秘密答案（FR-011、FR-012、FR-013、FR-014、NFR-002、NFR-003、US3 情境 2、3、5、Edge Cases 重複猜同一組數字）
  - **Must Read**
    - `contracts/openapi.yaml` → `submitGuess`（含 `GuessConflict`）、`SubmitGuessResponse` — Why：輪次檢查、各錯誤碼與回應欄位
    - `research.md` → §8 — Why：鎖定房間後再檢查輪次、遞增序號、`4A` 結束對局，交易提交後才推播
    - `data/data-model.dbml` → `Table guesses` 的 `uq_guesses_room_sequence` — Why：同一場的提交順序不重複
    - `data/data-model.dbml` → `Table rooms` 的 `winner_role`、`end_reason` — Why：結束對局時要寫入的欄位
  - **Optional**
    - `spec.md` → Edge Cases「重複猜同一組數字」 — Why：需要確認重複猜測也要記入紀錄並交換輪次時
- [ ] T047 [US3] 在 `backend/src/services/matchService.ts` 的 `leaveRoom` 補上 `playing` 與 `finished` 狀態（FR-015、FR-016）：`playing` 時把房間改為 `finished`、`end_reason` 為 `opponent_left`、`winner_role` 為留下玩家的角色，呼叫 `publishGameEnded`（`reason` 為 `PLAYER_LEFT`，`winnerPlayerId` 為留下的玩家，`leftPlayerId` 為離開者；離開者被刪除前先取得 ID）；`finished` 時只讓離開者離開房間；兩種情況在房內已沒有玩家時刪除房間（連帶刪除 `secret_answers` 與 `guesses`）（FR-015、FR-016、US3 情境 6）
  - **Must Read**
    - `contracts/openapi.yaml` → `leaveRoom` — Why：猜測階段與對局已結束時離開的處理
    - `contracts/asyncapi.yaml` → `sendGameEnded`、`PLAYER_LEFT` — Why：猜測階段一方離開時的推播內容
    - `data/data-model.dbml` → `Enum game_end_reason` — Why：`opponent_left` 代表猜測階段一方離開
    - `data/data-model.dbml` → `Project "online-pvp-1a2b"` — Why：房間關閉，或對局結束且雙方都離開後刪除房間
- [ ] T048 [US3] 在 `backend/src/schemas/requests.ts` 新增 `submitGuessSchema`（`guess`：`/^(?!.*(\d).*\1)\d{4}$/`），並在 `backend/src/routes/roomsRouter.ts` 實作 `POST /api/rooms/:roomId/guesses`（`submitGuess`，掛 `auth` 中介層，回 `201` 與 `SubmitGuessResponse`）（FR-012、FR-017）
  - **Must Read**
    - `contracts/openapi.yaml` → `submitGuess`、`SubmitGuessRequest` — Why：路徑、請求欄位、`201` 回應與 `GUESS_INVALID`

### 前端（F4）

- [ ] T049 [US3] 在 `frontend/src/views/BattleView.tsx` 實作對戰部分（F4）：輪到自己時黃色提示條「輪到你猜！」，猜測欄（`DigitInput`，`unique`、`label` 為「猜測」）與「送出猜測」可操作；輪到對手時提示條改為淡紫「<暱稱> 正在猜…」並轉圈，猜測欄停用、按鈕為「等待 <暱稱> 猜測」；送出中按鈕為「送出中…」；上方顯示「你的答案 <答案>」與「<暱稱> 的答案 ● ● ● ●」；紀錄區列出每筆猜測的玩家、數字與 A／B（例如 `2A2B`），沒有紀錄時顯示「還沒有人猜，<房主暱稱> 先手」，重複猜過的組合旁加註灰色小字「猜過了」；格式錯誤時仍為「輪到你猜！」；`NOT_YOUR_TURN` 時在猜測欄上方以紅色提示顯示錯誤文字，紀錄不新增；「離開對局」確認視窗「確定要離開嗎？對戰中離開，這局會直接判 <暱稱> 獲勝」與「繼續對戰」「離開」（FR-011、FR-012、FR-013、FR-017、NFR-002、NFR-003、US3 情境 1–4、Edge Cases 重複猜同一組數字）
  - **Must Read**
    - `ui/plan.md` → §3.3 A9、A10、A11 — Why：本畫面的使用者操作
    - `ui/plan.md` → §4 `battle.html` 的「尚無猜測紀錄」「輪到你猜」「送出猜測中」「輪到對手猜」「確認離開對局」 — Why：各狀態的呈現與文字
    - `ui/plan.md` → §5 `battle.html` 的「猜測有重複數字」「猜測少於四位或含非數字」「還沒輪到你」「重複猜同一組數字」 — Why：驗證與錯誤回饋的文字
    - `ui/battle.html` → 雛形狀態「尚無猜測紀錄」「輪到你猜」「送出猜測中」「輪到對手猜」「確認離開對局」「欄位驗證錯誤」「還沒輪到你」「重複猜同一組數字」 — Why：各狀態的實際樣子
- [ ] T050 [US3] 在 `frontend/src/views/BattleView.tsx` 補上對局結果部分：收到 `GameResult` 時不顯示猜測欄；你獲勝時顯示黃色結果卡「你贏了！第 <n> 手猜中 <暱稱> 的答案」，對手獲勝時顯示淡紫結果卡「<暱稱> 獲勝」與「<暱稱> 在第 <n> 手猜中你的答案」，`reason` 為 `PLAYER_LEFT` 時顯示「你贏了！<暱稱> 已離開對局」；三種都揭曉雙方答案，猜中的最後一筆紀錄標示勝利；結果卡提供「回到入口」（FR-014、FR-015、FR-016、US3 情境 5、6）
  - **Must Read**
    - `ui/plan.md` → §3.3 A12 — Why：結果畫面的使用者操作
    - `ui/plan.md` → §4 `battle.html` 的「你獲勝」「對手獲勝」 — Why：兩種結果卡的呈現與文字
    - `ui/plan.md` → §5 `battle.html` 的「對手離線」 — Why：對手離線時的結果卡文字
    - `ui/battle.html` → 雛形狀態「你獲勝」「對手獲勝」「對手離線」 — Why：結果卡與揭曉答案的實際樣子
    - `contracts/asyncapi.yaml` → `GameResult` — Why：`reason`、`winnerPlayerId`、`secrets` 與 `guesses` 的欄位
- [ ] T051 [US3] 在 `frontend/src/App.tsx` 串接 US3 流程：`BattleView` 的送出呼叫 `submitGuess`；`room:updated` 在 `in_progress` 時更新猜測紀錄與輪次；`game:ended` 時把 `GameResult` 存入 `result`，畫面維持 `battle` 並顯示結果卡；結果卡的「回到入口」與對戰中確認離開都呼叫 `leaveRoom`，再斷開 Socket.IO，回到入口並帶入暱稱、配對碼欄留白，結果卡回到入口時頁頂提示「上一局已結束，輸入配對碼開始新的一局」；回到入口後的連線處理見 Notes 待確認 2（FR-014、FR-015、FR-016、SC-003）
  - **Must Read**
    - `ui/plan.md` → §3.2 — Why：對戰、結果與入口之間的轉換
    - `ui/plan.md` → §4 `index.html` 的「對局結束後回到入口」 — Why：回到入口時的頁頂提示
    - `contracts/openapi.yaml` → `submitGuess`、`leaveRoom` — Why：呼叫的 API 與回應
    - `contracts/asyncapi.yaml` → `sendGameEnded` — Why：對局結束的推播條件

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T052 [P] 驗證兩位新玩家進入同一間房間的時間：以 Playwright 的兩個 `browser.newContext()` 重複 10 次，從輸入暱稱開始到兩邊都看到房間畫面，記錄是否在 30 秒內完成，確認至少 9 次成功（SC-001）；腳本為一次性使用，不納入版本控制
  - **Must Read**
    - `spec.md` → SC-001 — Why：90% 以上、30 秒內完成的判斷標準
    - `research.md` → §9 — Why：以 Playwright 兩個 browser context 模擬兩位玩家
- [ ] T053 [P] 驗證配對正確率與配對時間：以 Supertest 對 Docker Compose 的 PostgreSQL，用 50 組隨機配對碼各自走一次「第一位 `matchRoom` 回 `CREATED`、第二位回 `JOINED` 且為同一間房、第三位回 `CREATED` 且為新房間」，另以並行送出同一配對碼的兩個請求確認不會各自開房，全部符合（SC-002、Edge Cases 同時輸入同一配對碼）；同時量測每次 `matchRoom` 的回應時間低於 2 秒（NFR-001）；腳本為一次性使用，不納入版本控制
  - **Must Read**
    - `spec.md` → SC-002、NFR-001 — Why：50 組隨機配對碼 100% 正確與 2 秒內看到房間
    - `research.md` → §9 — Why：以並行請求對真實 PostgreSQL 驗證部分唯一索引與 `FOR UPDATE`
- [ ] T054 [P] 驗證 A／B 判定：以 100 組不同的答案與猜測組合呼叫 `scoreGuess`，與另寫的逐位比對對照結果，確認一致率達 100%（SC-005）；腳本為一次性使用，不納入版本控制
  - **Must Read**
    - `spec.md` → SC-005 — Why：100 組組合、一致率 100% 的判斷標準
    - `research.md` → §9 — Why：以表格式測試驗證 `scoreGuess`
- [ ] T055 [P] 驗證對手畫面更新時間：以兩個 `socket.io-client` 連線，量測 100 次猜測從 `submitGuess` 的 REST 回應到對手收到 `room:updated` 的時間，確認第 95 百分位低於 1 秒（SC-003、NFR-003）；腳本為一次性使用，不納入版本控制
  - **Must Read**
    - `spec.md` → SC-003、NFR-003 — Why：1 秒內更新且比率達 95% 以上的判斷標準
    - `research.md` → §9 — Why：量測 100 次並檢查第 95 百分位的方法
- [ ] T056 [P] 驗證秘密答案不外洩：在 `setting_secrets` 與 `playing` 階段，收集對手視角的所有 REST 回應與 Socket.IO 事件，確認內容中沒有任何一方的答案欄位或答案值，次數為 0；確認只有 `game:ended` 含 `secrets`（SC-004、NFR-002）；腳本為一次性使用，不納入版本控制
  - **Must Read**
    - `spec.md` → SC-004、NFR-002 — Why：結束前對手取得答案的次數必須為 0
    - `contracts/asyncapi.yaml` → `GameResult` — Why：唯一含秘密答案的事件
- [ ] T057 [P] 以 Chrome DevTools 在 360px 與 720px 寬度檢查四個畫面都能完整操作，配色與版面符合 ui/plan.md §2，並逐一觸發 `ERROR_TEXT` 與各畫面的文字，確認都是自然清晰的臺灣繁體中文（NFR-004）
  - **Must Read**
    - `ui/plan.md` → §2 — Why：配色與版面的檢查標準
    - `ui/plan.md` → §5 — Why：所有錯誤提示文字的檢查標準
- [ ] T058 在 `backend/` 與 `frontend/` 執行 `npm run check`（`tsc --noEmit`、ESLint、`prettier --check`），修正所有錯誤（research §2、§9）
  - **Must Read**
    - `research.md` → §9 — Why：`check` 命令包含的檢查項目
- [ ] T059 依 `spec.md` 三個使用者故事的 Independent Test，以兩個瀏覽器工作階段完整走一次：配對、開始遊戲、設定答案、輪流猜測到分出勝負，再另開一場驗證設定階段離開與對戰中離開（FR-001–FR-018）
  - **Must Read**
    - `spec.md` → US1、US2、US3 的 Independent Test — Why：手動驗證的步驟與預期結果

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US2 以 US1 的房間配對為前提（要先有兩位玩家的房間才能開始遊戲），US3 以 US2 的秘密答案為前提，因此建議依 P1 → P2 → P3 循序進行
  - 前端與後端任務在同一個故事內可以平行（不同檔案）
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: 需要 US1 的 `matchRoom`、`RoomView` 與 `leaveRoom`；`schema.prisma`（T031）擴充 T009，`prisma.ts`（T032）擴充 T010，`matchService.ts`（T036）擴充 T025
- **User Story 3 (P3)**: 需要 US2 的 `secret_answers` 與 `setSecret`；`schema.prisma`（T042）擴充 T031，`matchService.ts`（T047）擴充 T036，`roomGateway.ts`（T044、T045）擴充 T023、T034

### Within Each User Story

- `schema.prisma` → `prisma.ts` → services → `roomGateway.ts` 推播 → routes → 前端元件與 view → `App.tsx` 串接
- `schema.prisma`、`zh-TW.ts`、`requests.ts`、`roomsRouter.ts`、`matchService.ts`、`gameService.ts`、`roomGateway.ts`、`server.ts`、`DigitInput.tsx`、`RoomView.tsx`、`BattleView.tsx`、`App.tsx` 在同一故事內由多個任務修改，這些任務要循序進行
- Story complete before moving to next priority

### Parallel Opportunities

- Setup：T003～T007 可平行
- Foundational：後端 T011、T012 與前端 T018、T019 可平行，且前端與後端兩條鏈可同時進行
- US1：後端（T021～T026）與前端（T027～T030）兩條鏈可同時進行，`App.tsx` 串接（T030）等後端 API 可呼叫後再驗證
- US2：後端（T033～T037）與前端（T038～T041）兩條鏈可同時進行；T031、T032 要先完成
- US3：T043（`scoreGuess`）可與 T042 同時開始；後端（T044～T048）與前端（T049～T051）兩條鏈可同時進行
- Polish：T052～T057 可平行

---

## Parallel Example: User Story 1

```bash
# 後端與前端同時開工：
Task: "實作 matchRoom in backend/src/services/matchService.ts"
Task: "實作配對碼輸入元件 in frontend/src/components/DigitInput.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "實作 setSecret in backend/src/services/gameService.ts"
Task: "實作設定秘密答案畫面 in frontend/src/views/SecretSetupView.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "實作 scoreGuess in backend/src/services/scoreGuess.ts"
Task: "建立 guesses 資料表 in backend/prisma/schema.prisma"
Task: "實作輪流猜測畫面 in frontend/src/views/BattleView.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 以 US1 的 Independent Test 驗證兩位玩家配對進同一間房、第三位被分配到新房間
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP：玩家可以用配對碼開房或加入房間)
3. Add User Story 2 → Test independently → Deploy/Demo（房主可以開始遊戲，雙方設定秘密答案）
4. Add User Story 3 → Test independently → Deploy/Demo（雙方可以輪流猜測直到分出勝負）
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done，每個故事依序進行，故事內分工：
   - Developer A：後端（`schema.prisma`、services、`roomGateway.ts`、routes）
   - Developer B：前端（`DigitInput`、views、`App.tsx`）
3. 雙方以 contracts/openapi.yaml 與 contracts/asyncapi.yaml 為介面約定，故事完成後一起驗證

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- plan.md 的 Source Code 沒有列出 `backend/eslint.config.js`、`frontend/eslint.config.js`、`backend/.prettierrc`、`frontend/.prettierrc`（T006）、`backend/vitest.config.ts`、`frontend/vitest.config.ts`、`frontend/playwright.config.ts`（T007）與 `frontend/src/styles.css`（T016，各畫面樣式也寫在此檔），本 tasks.md 新增這些檔案；若要維持 plan.md 的結構，可把樣式改寫在 `frontend/index.html` 的 `<style>`，工具設定檔改放 `package.json`
- 待確認 1：房間狀態命名不一致：data-model.dbml 的 `room_status` 為 `waiting`、`ready`、`setting_secrets`、`playing`、`finished`，openapi.yaml 與 asyncapi.yaml 的 `RoomState.status` 為 `waiting_for_opponent`、`ready_to_start`、`setting_secrets`、`in_progress`、`finished`；`game_end_reason`（`solved`、`opponent_left`、`cancelled`）與 `GameResult.reason`（`GUESSED_4A`、`PLAYER_LEFT`）也不同，且設定階段離開在資料模型記為 `finished`（`cancelled`）、合約卻以 `room:closed` 通知而不是 `finished`；T008、T023、T033、T044 先在 `roomGateway.ts` 以對應表轉換（`waiting`→`waiting_for_opponent`、`ready`→`ready_to_start`、`playing`→`in_progress`），若決定統一命名，需同步修改 data-model.dbml 與 contracts
- 待確認 2：contracts 沒有說明 `room:closed`、`game:ended` 之後玩家的 token 與 Socket.IO 連線是否繼續使用，也沒有說明回到入口後如何重新配對；T030、T041、T051 先讓前端回到入口時斷開 Socket.IO（房間仍存在時先呼叫 `leaveRoom`），下次配對重新呼叫 `enterAsPlayer` 取得新 token，待 api-plan 補上合約後再對齊
- 待確認 3：data-model.dbml 的 `Ref: players.room_id > rooms.id [delete: set null]` 只會把 `room_id` 設為 null，`room_role` 仍保留舊值，但 `Table players` 註明 `room_id` 為 null 時 `room_role` 也必須為 null，且沒有 CHECK 約束；T009、T025 先在服務層離開或關閉房間時同時清空 `room_id` 與 `room_role`，是否補上 CHECK 約束等 data-plan 決定
- 待確認 4：ui/plan.md 的「不在範疇」明列房間已滿、遊戲尚未開始時對手離開的畫面不規劃，但 asyncapi.yaml 已有 `HOST_LEFT_BEFORE_START`、`OPPONENT_LEFT_BEFORE_START` 兩種 `room:closed`，雛形也沒有非房主離開的確認視窗文字與這兩種通知的入口提示；T029、T030 先讓非房主的確認視窗只顯示「確定要離開嗎？」與「留在房間」「離開」，收到這兩種通知時沿用「<leftPlayerNickname> 離開了房間，這局無法繼續」的黃色入口提示，待 ui-plan 補上畫面與文字後再調整
- 待確認 5：ui/plan.md 只提供 `NICKNAME_INVALID`、`PAIR_CODE_INVALID`、`SECRET_INVALID`、`GUESS_INVALID`、`OPPONENT_NOT_JOINED`、`NOT_YOUR_TURN` 的畫面文字，`UNAUTHORIZED`、`ROOM_NOT_FOUND`、`ALREADY_IN_ROOM`、`SOCKET_NOT_CONNECTED`、`MATCH_BUSY`、`GAME_ALREADY_STARTED`、`GAME_NOT_IN_SETUP`、`SECRET_ALREADY_SET`、`GAME_NOT_IN_PROGRESS`、`ALREADY_CONNECTED` 沒有對應文字；T017 先讓 `errorText` 對這些錯誤碼回傳通用文字「發生錯誤，請稍後再試」，待 ui-plan 補上文字後再逐一替換
- 待確認 6：ui/plan.md 沒有規劃自己的 Socket.IO 連線建立失敗（`connect_error`）或對局中斷開（`disconnect`）時的畫面；T019、T030 先回到入口並以待確認 5 的通用文字提示，待 ui-plan 補上畫面後再調整
