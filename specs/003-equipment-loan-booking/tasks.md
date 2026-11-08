---

description: "Task list for 設備借用與預約系統 implementation"
---

# Tasks: 設備借用與預約系統 (Equipment Loan and Booking System)

**Input**: Design documents from `/specs/003-equipment-loan-booking/`（依下方 Reference Loading Contract 按任務載入）

**Tests**: spec.md 沒有明確要求撰寫測試或採用 TDD，因此各使用者故事 Phase 不產生獨立測試任務。Setup 依 research §6 安裝與設定 Vitest 5、Supertest 7 與 Playwright 1.65 測試工具，並在 Polish Phase 執行 SC-001～SC-005 的量測與端對端驗證任務。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. 每個階段內再依 plan.md「系統介面盤點」的技術端點（資料庫、後端、前端）分組，標題列出該組實作的介面編號；每個任務下方以 Must Read／Optional 列出執行時要讀的文件部位。

## Reference Loading Contract

執行本檔的任務時，依下列規則載入 `/specs/003-equipment-loan-booking/` 的文件：

1. 開工前只讀本檔，不預先讀 spec package 的其他文件。
2. 每個任務下方列出它的參考，分兩級：
   - **Must Read**：開始這個任務前一定要讀完的部位。
   - **Optional**：只在遇到該項 Why 描述的情況時才讀。
3. 每項參考寫成 `` `檔案` → 部位 — Why：理由 ``。Why 說明這個部位決定任務的哪一部分，讀的時候以它為重點。
4. 只讀列出的部位，不讀整份文件。部位以文件內可搜尋的識別字定位：
   - `contracts/openapi.yaml`：operationId，或 `components` 底下的 schema、response 名稱
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

- **Web app**: `apps/equipment-loan/backend/src/`、`apps/equipment-loan/frontend/src/`（依 plan.md 的 Structure Decision）
- Docker Compose、啟動說明 `README.md` 與跨前後端 Playwright E2E 測試放在 `apps/equipment-loan/` 頂層；Prisma schema、migrations 與 demo seed 放在 `apps/equipment-loan/backend/prisma/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 依 plan.md 的 Source Code 建立 `apps/equipment-loan/`、`apps/equipment-loan/frontend/`、`apps/equipment-loan/backend/` 與 `apps/equipment-loan/e2e/` 目錄結構，並在 `apps/equipment-loan/.gitignore` 設定忽略 `node_modules/`、`dist/`、`.env`、`playwright-report/` 與 `test-results/`（plan.md 未列 `.gitignore`，見 Notes）（research §1）
  - **Must Read**
    - `plan.md` → `Source Code (repository root)` — Why：專案頂層與前後端目錄及檔案配置
    - `research.md` → §1 — Why：原始碼放置於 `apps/equipment-loan/` 並拆分為 `frontend/` 與 `backend/`
- [ ] T002 在 `apps/equipment-loan/backend/package.json` 與 `apps/equipment-loan/backend/tsconfig.json` 初始化後端專案：設定 TypeScript 6.0（`strict: true`）、Node.js 24 LTS 以上環境，安裝相依套件 `express`（Express 5）、`zod`（zod 4）、`@prisma/client`、`@prisma/adapter-pg`、`pg`，以及開發相依 `typescript`、`tsx`、`prisma`（Prisma 7.10）、`@types/express`、`@types/pg`；設定 scripts `dev`、`build`、`db:migrate`、`db:seed`（research §2、§3、§5）
  - **Must Read**
    - `techstack.md` → `技術堆疊總覽` — Why：後端與資料庫存取採用的套件及版本
    - `techstack.md` → `本次開發不引入的技術` — Why：確認不引入 `socket.io`、`bcrypt`、`express-session`、`jsonwebtoken`、`luxon`、`moment`
    - `research.md` → §2、§3、§5 — Why：TypeScript 6.0、Node.js 24 LTS 以上、`tsx`、Express 5、zod 4 與 Prisma 7.10 設定方式
- [ ] T003 [P] 在 `apps/equipment-loan/frontend/package.json`、`apps/equipment-loan/frontend/tsconfig.json` 與 `apps/equipment-loan/frontend/vite.config.ts` 初始化前端專案：安裝 React 19（`react`、`react-dom`）、Vite 8（`vite`）、`@vitejs/plugin-react` 6 與 TypeScript 6.0，不引入 `react-router`、`zustand`、`@reduxjs/toolkit`、`react-i18next` 或 `socket.io-client`；在 `vite.config.ts` 設定 `server.proxy` 將 `/api` 轉發至 `http://localhost:3000`（research §1、§2）
  - **Must Read**
    - `techstack.md` → `技術堆疊總覽` — Why：前端採用的 React 19、Vite 8、`@vitejs/plugin-react` 6 與 TypeScript 6.0 版本
    - `techstack.md` → `本次開發不引入的技術` — Why：確認不引入前端路由、全域狀態管理與國際化套件
    - `research.md` → §1 — Why：Vite `/api` 代理與頂層狀態切換架構
- [ ] T004 [P] 在 `apps/equipment-loan/docker-compose.yml` 設定 `postgres:18` 容器（連接埠與開發／測試資料庫設定），並在 `apps/equipment-loan/backend/.env.example` 提供 `DATABASE_URL` 與 `PORT=3000` 範例（research §5）
  - **Must Read**
    - `research.md` → §5 — Why：以 Docker Compose 啟動 PostgreSQL 18 容器供開發與測試使用
    - `plan.md` → `Source Code (repository root)` — Why：`docker-compose.yml` 與 `.env.example` 的放置路徑
- [ ] T005 [P] 在 `apps/equipment-loan/backend/` 與 `apps/equipment-loan/frontend/` 設定 ESLint 10（`typescript-eslint` 8）與 Prettier（建立 `eslint.config.mjs` 與 `.prettierrc`，見 Notes），並在兩邊 `package.json` 加入 `check` script 執行 `tsc --noEmit`、ESLint 與 `prettier --check`（research §2、§6）
  - **Must Read**
    - `research.md` → §2、§6 — Why：靜態檢查、型別檢查與格式化工具鏈版本及設定要求
    - `techstack.md` → `技術堆疊總覽` — Why：ESLint 10、`typescript-eslint` 8 與 Prettier 版本
- [ ] T006 [P] 在 `apps/equipment-loan/package.json`、`apps/equipment-loan/playwright.config.ts`、`apps/equipment-loan/backend/vitest.config.ts` 與 `apps/equipment-loan/frontend/vitest.config.ts` 設定測試工具：後端安裝 Vitest 5 與 Supertest 7，前端安裝 Vitest 5，頂層安裝 `@playwright/test` 1.65（plan.md 未列 `vitest.config.ts`，見 Notes）（research §6）
  - **Must Read**
    - `research.md` → §6 — Why：Vitest 5、Supertest 7 與 Playwright 1.65 的測試架構分工
    - `techstack.md` → `技術堆疊總覽` — Why：品質與測試分層的採用技術與版本

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 資料庫（D1–D2 共用）

- [ ] T007 在 `apps/equipment-loan/backend/prisma.config.ts` 與 `apps/equipment-loan/backend/prisma/schema.prisma` 設定 Prisma 7.10（開啟 `previewFeatures = ["partialIndexes"]`），定義 `user_role`（`member`、`admin`）、`equipment_status`（`available`、`unavailable`）、`reservation_status`（`confirmed`、`cancelled`）三個 Enum，以及 `users`、`captcha_challenges`、`sessions`、`equipments`、`time_slots`、`reservations` 六張資料表（每張表皆含 `created_at`、`updated_at`、`updated_by`、`deleted_at` 四個生命週期欄位、`reservations` 含 `uq_reservations_active_slot` 部分唯一索引 `WHERE status = 'confirmed' AND deleted_at IS NULL`），並產生初始 migration（FR-001、FR-002、FR-003、FR-005、FR-007、FR-011、research §5）
  - **Must Read**
    - `data/data-model.dbml` → `Enum user_role`、`Enum equipment_status`、`Enum reservation_status` — Why：三個 Enum 的定義值
    - `data/data-model.dbml` → `Table users`、`Table captcha_challenges`、`Table sessions`、`Table equipments`、`Table time_slots`、`Table reservations` — Why：六張資料表的欄位、型別、生命週期欄位与索引（含 `uq_reservations_active_slot` 部分唯一索引）
    - `data/data-model.dbml` → `Ref: sessions.user_id > users.id`、`Ref: reservations.user_id > users.id`、`Ref: reservations.equipment_id > equipments.id`、`Ref: reservations.slot_id > time_slots.id` — Why：資料表外鍵關聯
    - `research.md` → §5 — Why：Prisma 7.10 `partialIndexes` 設定與 `@prisma/adapter-pg` 連線方式
- [ ] T008 在 `apps/equipment-loan/backend/src/db/prisma.ts` 以 `@prisma/adapter-pg` 與 `pg` 建立並匯出 Prisma Client 單例，並啟動 PostgreSQL 18 容器執行 Prisma migration 確認資料表與部分唯一索引建立成功（research §5）
  - **Must Read**
    - `research.md` → §5 — Why：Prisma 7 透過 `@prisma/adapter-pg` 建立資料庫連線

### 後端（B1–B4 共用）

- [ ] T009 [P] 在 `apps/equipment-loan/backend/src/utils/password.ts` 實作 `hashPassword(password)` 與 `verifyPassword(password, storedHash)`（使用 Node.js 內建 `crypto.scrypt` 與 `crypto.timingSafeEqual`）；並在 `apps/equipment-loan/backend/prisma/seed.ts` 實作可重複執行的 demo seed 腳本：建立預建一般成員帳號 `lin.yating`（林雅婷）、`chen.guanting`（陳冠廷）與管理員帳號 `wu.chenghan`（吳承翰），建立 4 台單件獨立設備 `EQ-101`～`EQ-104`，建立 3 個單日固定時段（上午 `09:00`–`12:00`、下午 `13:00`–`17:00`、晚間 `18:00`–`21:00`，代碼與狀態轉換見 Notes 待確認 1），以及建立涵蓋有效預約（`confirmed`）與已取消預約（`cancelled`）的範例預約紀錄（FR-002、FR-003、FR-011、research §4、§6）
  - **Must Read**
    - `research.md` → §4、§6 — Why：以 `crypto.scrypt` 雜湊密碼，並以 Prisma seed 建立預建帳號、設備、固定時段與範例預約
    - `data/data-model.dbml` → `Table users`、`Table equipments`、`Table time_slots`、`Table reservations` — Why：預建資料寫入的欄位與唯一編號格式
    - `ui/plan.md` → §4 `index.html`、`booking.html`、`my-reservations.html`、`admin.html` — Why：對齊預建測試帳號（`lin.yating`、`chen.guanting`、`wu.chenghan`）、4 台設備（`EQ-101`～`EQ-104`）與範例預約資料
    - `spec.md` → FR-011 — Why：初始展示資料的最低組數與持久化要求
- [ ] T010 [P] 在 `apps/equipment-loan/backend/src/utils/taipeiTime.ts` 實作台灣業務時區（`Asia/Taipei`，UTC+8）工具函式：以 `Intl.DateTimeFormat` 取得當前台灣日期（`YYYY-MM-DD`）與時間（`HH:mm`），檢查預約日期是否在當日起算 7 天內（含當日），以及檢查指定日期與固定時段開始時間（`09:00`、`13:00`、`18:00`）是否已到達或已開始（FR-003、FR-004、FR-007、FR-008、research §3）
  - **Must Read**
    - `research.md` → §3 — Why：使用 Node.js 內建 `Intl.DateTimeFormat` 指定 `timeZone: "Asia/Taipei"` 計算日期範圍與固定時段開始時間
    - `spec.md` → FR-003、FR-004、FR-007、FR-008 — Why：當日起算 7 天內與時段開始前的業務判定規則
- [ ] T011 [P] 在 `apps/equipment-loan/backend/src/middleware/errorHandler.ts` 實作 `AppError(code, status, message)` 與 Express 統一錯誤處理中介層：所有錯誤回應符合 `components.schemas.Error`（`{ code, message }`），分頁參數不合法回 `400 PAGINATION_INVALID`，其餘請求格式驗證失敗回 `400 VALIDATION_FAILED`，並回傳臺灣繁體中文錯誤訊息（NFR-001、research §3）
  - **Must Read**
    - `contracts/openapi.yaml` → `Error`、`ValidationFailed`、`PaginationOrQueryInvalid` — Why：共用錯誤回應 schema、所有錯誤碼 enum 與 HTTP 狀態碼對應
    - `research.md` → §3 — Why：Express 5 與 zod 4 驗證錯誤轉換規則
    - `spec.md` → NFR-001 — Why：錯誤提示必須使用臺灣繁體中文並明確說明失敗原因
- [ ] T012 在 `apps/equipment-loan/backend/src/middleware/authMiddleware.ts` 實作 `requireAuth` 與 `requireAdmin` 中介層：從 `Authorization: Bearer <token>` 解析工作階段權杖並查詢 `sessions`（排除 `deleted_at IS NOT NULL` 或已超過 `expires_at` 的列）與關聯的 `users`；未帶 token 或工作階段無效時回傳 `401`（錯誤碼 `UNAUTHORIZED`），非 `admin` 角色存取管理員端點時回傳 `403`（錯誤碼 `FORBIDDEN`）（FR-002、FR-010、SC-005、research §4）
  - **Must Read**
    - `contracts/openapi.yaml` → `Unauthorized`、`Forbidden`、`getCurrentUser`、`listAllReservations` — Why：`401 UNAUTHORIZED` 與 `403 FORBIDDEN` 的觸發條件與回應格式
    - `data/data-model.dbml` → `Table sessions`、`Table users` — Why：有效工作階段與使用者角色的查詢條件
    - `research.md` → §4 — Why：Bearer session token 的驗證機制
- [ ] T013 在 `apps/equipment-loan/backend/src/app.ts` 與 `apps/equipment-loan/backend/src/server.ts` 建立 Express 5 應用程式骨架：設定 `express.json()`、掛載 `/api` 路由前綴與 `errorHandler`，並由 `server.ts` 監聽 `PORT`（預設 3000），匯出 `app` 供 Supertest 整合測試呼叫（research §3、§6）
  - **Must Read**
    - `research.md` → §3、§6 — Why：Express 5 `/api` 前綴與匯出 `app` 供 Supertest 測試
    - `contracts/openapi.yaml` → `servers` — Why：本機開發伺服器網址 `http://localhost:3000/api`

### 前端（F1–F4 共用）

- [ ] T014 [P] 在 `apps/equipment-loan/frontend/src/text/zh-TW.ts` 建立臺灣繁體中文文案與錯誤碼對應模組（涵蓋所有錯誤碼 `VALIDATION_FAILED`、`PAGINATION_INVALID`、`CAPTCHA_MISMATCH`、`CAPTCHA_EXPIRED`、`INVALID_CREDENTIALS`、`UNAUTHORIZED`、`FORBIDDEN`、`RESOURCE_NOT_FOUND`、`DATE_OUT_OF_RANGE`、`SLOT_ALREADY_STARTED`、`EQUIPMENT_UNAVAILABLE`、`RESERVATION_CONFLICT`、`RESERVATION_ALREADY_STARTED`、`RESERVATION_ALREADY_CANCELLED` 與介面標籤），並在 `apps/equipment-loan/frontend/src/api/client.ts` 實作封裝 `sessionStorage` Bearer token 讀取、儲存、清除與統一錯誤解析的 HTTP 客戶端（FR-002、NFR-001、research §1、§4）
  - **Must Read**
    - `contracts/openapi.yaml` → `Error` — Why：全部 14 個錯誤碼與錯誤回應格式
    - `ui/plan.md` → §5 — Why：各錯誤情境在畫面上的繁體中文回饋文字
    - `research.md` → §1、§4 — Why：`zh-TW.ts` 集中管理繁體中文文字，以及 `sessionStorage` 保存 Bearer token 的方式
- [ ] T015 在 `apps/equipment-loan/frontend/index.html`、`apps/equipment-loan/frontend/src/main.tsx` 與 `apps/equipment-loan/frontend/src/App.tsx` 建立前端應用程式入口、頂部導覽列（品牌標題、目前登入使用者與角色徽章、頁籤切換、Light Mode／Dark Mode 雙主題切換按鈕、登出按鈕）與 CSS 變數主題樣式（依 `ui/plan.md` §2 設定 `:root` Light Mode 預設色票與 `[data-theme="dark"]` Dark Mode 色票、無襯線正文字體與等寬驗證碼／編號字體）（FR-002、NFR-001、research §1）
  - **Must Read**
    - `ui/plan.md` → §2、§3.1、§3.2、§3.3 `A3` — Why：Light／Dark Mode 雙主題色票、字體、版面配置、4 個視圖切換與主題切換操作
    - `ui/index.html` → 雛形狀態「待登入」 — Why：對照頁首導覽列、主題切換按鈕與 CSS 變數結構
    - `research.md` → §1 — Why：以頂層元件狀態切換登入、設備預約、我的預約與管理員檢視畫面

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 成員登入、查看預建設備清單並預約單日固定時段 (Priority: P1) 🎯 MVP

**Goal**: 成員在登入頁檢視並輸入 7 位數區分大小寫英數驗證碼與預建帳號密碼完成登入（可重整驗證碼與登出），瀏覽預建單件設備於當日起 7 天內各單日固定時段的狀態（可預約、本人已預約、已被預約），並選擇未開始的可預約時段送出預約立即占用，同時阻擋並發重複搶約。

**Independent Test**: 以預建成員帳號、密碼與畫面上正確的 7 位數區分大小寫英數驗證碼登入，瀏覽預建設備清單，選擇當日起 7 天內的日期與一個可預約固定時段送出預約；驗證預約立即成立且重新載入後狀態持續顯示為「本人已預約」，並驗證驗證碼大小寫不符或多人同時搶同一時段時系統會拒絕並顯示繁體中文錯誤提示。

### 資料庫（D1、D2）

- [ ] T016 [US1] 執行 `apps/equipment-loan/backend/prisma/seed.ts` 將 D1（`users`）與 D2（`equipments`、`time_slots`、`reservations`）預建資料寫入 PostgreSQL，並驗證預建的 2 組一般成員帳號、1 組管理員帳號、4 台單件設備與 3 個固定時段可正常查詢（FR-002、FR-003、FR-011）
  - **Must Read**
    - `data/data-model.dbml` → `Table users`、`Table equipments`、`Table time_slots`、`Table reservations` — Why：確認預建資料寫入後的資料表約束與欄位完整性
    - `spec.md` → FR-011 — Why：確認預建初始資料符合展示與驗證要求

### 後端（B1、B2）

- [ ] T017 [US1] 在 `apps/equipment-loan/backend/src/utils/captcha.ts` 與 `apps/equipment-loan/backend/src/services/authService.ts` 實作 B1 驗證碼挑戰與登入工作階段服務：`createCaptchaChallenge(previousChallengeId?)` 以 `A–Z`、`a–z`、`0–9` 隨機產生同時含英文與數字的 7 位數驗證碼並寫入 `captcha_challenges`（5 分鐘 `expires_at`），若傳入 `previousChallengeId` 則立即標記 `consumed_at` 作廢；`login({ username, password, challengeId, captchaCode })` 在交易內鎖定挑戰列，若不存在、已超過 `expires_at` 或 `consumed_at` 不為 null 則回 `400 CAPTCHA_EXPIRED`，否則立即寫入 `consumed_at` 單次消耗，再以嚴格區分大小寫（`===`）比對 `captchaCode`（不符回 `400 CAPTCHA_MISMATCH`）及驗證帳號密碼（不符回 `401 INVALID_CREDENTIALS`），通過後建立 `sessions` 並回傳 `LoginResponse`；另實作 `getCurrentUser` 與 `logout`（設定 `sessions.deleted_at`）（FR-001、FR-002、SC-001、SC-004、Edge Cases 驗證碼英文大小寫不符、過期或重複使用舊驗證碼）
  - **Must Read**
    - `contracts/openapi.yaml` → `createCaptchaChallenge`、`login`、`getCurrentUser`、`logout`、`CaptchaChallengeResponse`、`LoginRequest`、`LoginResponse`、`AuthenticatedUser` — Why：B1 四個 operation 的請求、回應與錯誤碼規格
    - `data/data-model.dbml` → `Table captcha_challenges`、`Table users`、`Table sessions` — Why：驗證碼挑戰單次消耗與工作階段寫入欄位
    - `research.md` → §4 — Why：7 位數區分大小寫驗證碼產生與單次消耗交易邏輯
    - `spec.md` → FR-001、FR-002、SC-001、Edge Cases「驗證碼英文大小寫不符、過期或重複使用舊驗證碼」 — Why：驗證碼大小寫敏感、5 分鐘過期與單次作廢規則
- [ ] T018 [US1] 在 `apps/equipment-loan/backend/src/services/equipmentService.ts` 實作 `listEquipments({ userId, date, category, page, pageSize })`：驗證 `page` 與 `pageSize`（不合法回 `400 PAGINATION_INVALID`）與 `date` 格式；查詢未軟刪除的 `equipments`（依 `equipment_code` ASC、`id` ASC 排序，若 `page > totalPages` 回傳空 `items`）與 3 個 `time_slots`（依 `sort_order` ASC），並比對該日 `status = 'confirmed'` 的 `reservations`，將各時段組裝為 `available`、`booked_by_me`（附 `myReservationId`）或 `booked_by_others`（不揭露其他預約成員身分），並依台灣時區計算 `isBookable`（`slotCode` 與 `isActive` 欄位轉換見 Notes 待確認 1）（FR-003、FR-004、NFR-002、SC-004）
  - **Must Read**
    - `contracts/openapi.yaml` → `listEquipments`、`EquipmentAvailabilityPage`、`EquipmentWithSlotAvailability`、`EquipmentSlotAvailability` — Why：分頁參數、排序規則、回應欄位與三種時段狀態 enum
    - `data/data-model.dbml` → `Table equipments`、`Table time_slots`、`Table reservations` — Why：設備、時段與當日有效預約的查詢欄位與索引 `idx_reservations_date_equipment_status`
    - `spec.md` → US1 情境 4、FR-003、FR-004 — Why：時段狀態區分「可預約」、「本人已預約」、「已被預約」且對一般成員隱藏他人身分
- [ ] T019 [US1] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 實作 `createReservation({ userId, equipmentId, reservationDate, slotId })`：檢查 `reservationDate` 是否在台灣時區當日起算 7 天內（超出回 `400 DATE_OUT_OF_RANGE`），檢查設備與固定時段是否存在（不存在回 `404 RESOURCE_NOT_FOUND`、設備不可用回 `409 EQUIPMENT_UNAVAILABLE`），檢查該時段是否尚未到達開始時間（已開始或已結束回 `400 SLOT_ALREADY_STARTED`）；在交易內產生 `reservation_no` 並寫入 `status = 'confirmed'` 的 `reservations` 資料列，若觸發 `uq_reservations_active_slot` 部分唯一索引衝突（Prisma `P2002`）則轉為 `409 RESERVATION_CONFLICT`，成功時回傳 `Reservation`（`reservation_no` 映射為 `reservationNumber` 見 Notes 待確認 2）（FR-004、FR-005、SC-002、SC-004、Edge Cases 多人同時搶約同一台設備的同一日期與時段、嘗試預約已開始／已過期時段或取消已開始的預約）
  - **Must Read**
    - `contracts/openapi.yaml` → `createReservation`、`CreateReservationRequest`、`Reservation`、`CreateReservationBadRequest`、`CreateReservationConflict` — Why：建立預約的請求、回應與 400／404／409 各錯誤碼
    - `data/data-model.dbml` → `Table reservations` — Why：`uq_reservations_active_slot` 部分唯一索引與寫入欄位
    - `research.md` → §5 — Why：以 PostgreSQL 部分唯一索引處理並發搶約衝突（捕捉 `P2002` 轉為 `409 RESERVATION_CONFLICT`）
    - `spec.md` → US1 情境 5–7、FR-004、FR-005、SC-002 — Why：預約立即占用時段與並發搶約最多 1 筆成功
- [ ] T020 [US1] 在 `apps/equipment-loan/backend/src/routes/authRouter.ts` 與 `apps/equipment-loan/backend/src/routes/equipmentsRouter.ts` 及 `apps/equipment-loan/backend/src/routes/reservationsRouter.ts` 實作 B1 與 B2 路由：`POST /api/auth/captcha`（`createCaptchaChallenge`）、`POST /api/auth/login`（`login`）、`GET /api/auth/me`（`getCurrentUser`）、`POST /api/auth/logout`（`logout`）、`GET /api/equipments`（`listEquipments`）、`POST /api/reservations`（`createReservation`），並在 `apps/equipment-loan/backend/src/app.ts` 掛載這些路由（FR-001、FR-002、FR-003、FR-004、FR-005）
  - **Must Read**
    - `contracts/openapi.yaml` → `createCaptchaChallenge`、`login`、`getCurrentUser`、`logout`、`listEquipments`、`createReservation` — Why：六個端點的 HTTP 方法、路徑、狀態碼與 zod 請求驗證規則

### 前端（F1、F2）

- [ ] T021 [P] [US1] 在 `apps/equipment-loan/frontend/src/components/CaptchaBox.tsx` 與 `apps/equipment-loan/frontend/src/views/LoginView.tsx` 實作 F1 登入與驗證碼畫面：進入時呼叫 `POST /api/auth/captcha` 顯示等寬字體 7 位數區分大小寫英數驗證碼，支援點擊「重整驗證碼」更換新驗證碼，提供預建成員（林雅婷、陳冠廷）與管理員（吳承翰）快速帶入按鈕，表單驗證空白與 7 碼長度，登入失敗（`CAPTCHA_MISMATCH`、`CAPTCHA_EXPIRED`、`INVALID_CREDENTIALS`）時顯示繁體中文錯誤橫幅並自動呼叫重整換發新驗證碼、清空驗證碼輸入框（FR-001、FR-002、NFR-001、SC-001、US1 情境 1–3）
  - **Must Read**
    - `ui/plan.md` → §3.3 `A1`、`A2`、§4 `index.html`、§5 `index.html` — Why：登入頁的所有操作、載入／待登入／已重整／登入成功狀態與各錯誤回饋文字
    - `ui/index.html` → 雛形狀態「待登入」「已重整驗證碼」「驗證碼大小寫不符」「驗證碼已過期或重複使用」「帳號或密碼錯誤」 — Why：驗證碼盒、快速帶入按鈕與錯誤橫幅的視覺呈現
    - `contracts/openapi.yaml` → `createCaptchaChallenge`、`login` — Why：呼叫的 API 欄位與錯誤碼
- [ ] T022 [P] [US1] 在 `apps/equipment-loan/frontend/src/components/SlotStatusBadge.tsx` 與 `apps/equipment-loan/frontend/src/views/EquipmentBookingView.tsx` 實作 F2 設備清單與單日固定時段預約畫面：提供當日起算 7 天內的日期選擇器與設備分類篩選，呼叫 `GET /api/equipments` 顯示單件設備卡片與上午 `09:00–12:00`、下午 `13:00–17:00`、晚間 `18:00–21:00` 三個固定時段狀態（`available` 顯示翠綠「可預約」、`booked_by_me` 顯示靛藍「本人已預約」、`booked_by_others` 顯示中性灰「已被預約」且不揭露他人身分）；點選可預約且未開始時段後於確認面板點擊「確認送出預約」呼叫 `POST /api/reservations`，成功時顯示預約編號與「查看我的預約」按鈕並更新時段為「本人已預約」，遇到 `RESERVATION_CONFLICT`、`SLOT_ALREADY_STARTED`、`DATE_OUT_OF_RANGE` 時顯示繁體中文錯誤橫幅並重新載入時段狀態（FR-003、FR-004、FR-005、NFR-001、US1 情境 4–7）
  - **Must Read**
    - `ui/plan.md` → §3.3 `A4`、`A5`、`A6`、`A7`、§4 `booking.html`、§5 `booking.html` — Why：設備時段頁的操作、狀態呈現與衝突／過期／超範圍錯誤回饋
    - `ui/booking.html` → 雛形狀態「檢視設備與時段」「已選取可預約時段」「預約成功」「同時搶約時段衝突」「選擇已開始或已結束時段」 — Why：設備卡片、3 個固定時段按鈕與右側確認面板的版面及文字
    - `contracts/openapi.yaml` → `listEquipments`、`createReservation` — Why：查詢設備時段與建立預約的參數及回應結構
- [ ] T023 [US1] 在 `apps/equipment-loan/frontend/src/App.tsx` 串接 US1 登入守門、重新載入維持工作階段與登出流程：啟動時若 `sessionStorage` 有 token 則呼叫 `GET /api/auth/me` 恢復登入狀態（確保重新整理頁面後仍維持登入並顯示「本人已預約」），未登入時只顯示 `LoginView` 並阻擋受保護視圖，點擊頁首「登出」時呼叫 `POST /api/auth/logout`、清除 `sessionStorage` 並返回 `LoginView`（FR-002、US1 情境 1、5、8）
  - **Must Read**
    - `ui/plan.md` → §3.1、§3.2、§4 `index.html` 的「已登出」、§5 `index.html` 的「未登入存取受保護頁面」 — Why：登入後導向、未登入守門與登出後的畫面狀態
    - `contracts/openapi.yaml` → `getCurrentUser`、`logout` — Why：恢復工作階段與登出的 API 呼叫

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 成員查看與取消自己的預約並釋出時段 (Priority: P2)

**Goal**: 已登入成員在「我的預約」查看依預約日期由新到舊、固定時段順序及建立時間排序的個人預約紀錄（含有效預約與已取消預約），並在時段開始前取消本人有效預約；取消後保留「已取消」歷史紀錄並立即釋出該時段供重新預約。

**Independent Test**: 以已有一筆未開始有效預約的成員帳號登入，進入「我的預約」查看清單並對該筆預約執行取消；驗證預約狀態變為「已取消」、歷史紀錄仍保留於清單中，且回到設備時段頁面時該時段已恢復為「可預約」並可再次被成功預約。

### 後端（B3）

> D2 的 `reservations` 資料表、狀態 Enum 與索引已在 Phase 2 與 US1 建立，本故事沒有資料庫任務。

- [ ] T024 [US2] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 實作 `listMyReservations({ userId, status, page, pageSize })` 與 `cancelReservation({ userId, reservationId })`：`listMyReservations` 驗證分頁參數（不合法回 `400 PAGINATION_INVALID`），查詢該成員未軟刪除的預約紀錄並依 `reservation_date` DESC、`time_slots.sort_order` ASC、`created_at` DESC、`id` ASC 排序（`page > totalPages` 時回傳空 `items`）；`cancelReservation` 在交易內鎖定預約列，不存在回 `404 RESOURCE_NOT_FOUND`，非本人預約回 `403 FORBIDDEN`，狀態已為 `cancelled` 回 `409 RESERVATION_ALREADY_CANCELLED`，依台灣時區已到達或超過時段開始時間回 `409 RESERVATION_ALREADY_STARTED`，通過時將 `status` 更新為 `cancelled`、填入 `cancelled_at` 與 `updated_by`（保留原資料列不物理刪除），使該時段立即脫離 `uq_reservations_active_slot` 部分唯一索引而釋出（`reservation_no` 映射見 Notes 待確認 2）（FR-006、FR-007、FR-008、SC-003、SC-004、SC-005、Edge Cases 時段取消後再次預約、嘗試預約已開始／已過期時段或取消已開始的預約、成員嘗試越權取消他人預約或查看管理員清單）
  - **Must Read**
    - `contracts/openapi.yaml` → `listMyReservations`、`cancelReservation`、`ReservationPage`、`Reservation`、`CancelReservationConflict`、`Forbidden` — Why：個人預約分頁查詢、排序依據与取消預約的回應及 403／404／409 錯誤碼
    - `data/data-model.dbml` → `Table reservations` — Why：取消時更新 `status = 'cancelled'` 與 `cancelled_at`、保留原資料列並釋出 `uq_reservations_active_slot`
    - `spec.md` → US2 情境 1–4、FR-006、FR-007、FR-008、SC-003、SC-005 — Why：個人預約排序、時段開始前取消、保留歷史紀錄與立即釋出時段規則
- [ ] T025 [US2] 在 `apps/equipment-loan/backend/src/routes/reservationsRouter.ts` 掛載 `GET /api/reservations`（`listMyReservations`）與 `POST /api/reservations/:reservationId/cancel`（`cancelReservation`），以 zod 驗證 query 與路徑參數 `reservationId`（UUID）（FR-006、FR-007、FR-008）
  - **Must Read**
    - `contracts/openapi.yaml` → `listMyReservations`、`cancelReservation` — Why：路由路徑、query／path 參數與狀態碼

### 前端（F3）

- [ ] T026 [P] [US2] 在 `apps/equipment-loan/frontend/src/views/MyReservationsView.tsx` 實作 F3 個人預約查詢與取消畫面：呼叫 `GET /api/reservations` 列出本人預約紀錄（顯示預約編號、設備編號與名稱、預約日期、固定時段、狀態徽章、建立時間與取消時間），支援全部／有效預約／已取消狀態篩選；對尚未開始的 `confirmed` 預約提供「取消預約」按鈕與確認取消對話框，點擊「確認取消並釋出時段」呼叫 `POST /api/reservations/:reservationId/cancel`，成功後顯示綠色成功橫幅與「前往設備預約重新預約」按鈕並更新該筆狀態為「已取消」，失敗時顯示對應繁體中文錯誤橫幅（FR-006、FR-007、FR-008、NFR-001、US2 情境 1–4）
  - **Must Read**
    - `ui/plan.md` → §3.3 `A8`、`A9`、`A10`、§4 `my-reservations.html`、§5 `my-reservations.html` — Why：我的預約頁的操作、確認取消對話框、取消成功回饋與三種取消失敗錯誤訊息
    - `ui/my-reservations.html` → 雛形狀態「個人預約清單」「確認取消預約」「取消成功並釋出時段」「取消已開始或已過期預約」「重複取消已取消預約」 — Why：預約列表、取消確認對話框與狀態徽章的實際呈現
    - `contracts/openapi.yaml` → `listMyReservations`、`cancelReservation` — Why：呼叫的 API 與回應欄位
- [ ] T027 [US2] 在 `apps/equipment-loan/frontend/src/App.tsx` 串接 US2 導覽流程：將頁首「我的預約」頁籤、`EquipmentBookingView` 預約成功橫幅的「查看我的預約」與 `MyReservationsView` 取消成功橫幅的「前往設備預約重新預約」雙向串接，並在切換回 `EquipmentBookingView` 時重新取得最新設備時段狀態（FR-006、FR-007、US2 情境 2、3）
  - **Must Read**
    - `ui/plan.md` → §3.1、§3.2 — Why：`booking.html` 與 `my-reservations.html` 之間的頁面切換流程

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 管理員登入並檢視所有設備與全體成員預約清單 (Priority: P3)

**Goal**: 管理員登入後檢視所有預建單件設備清單與全體成員的預約紀錄清單（含預約成員帳號與姓名、設備、日期、固定時段、狀態、建立時間與取消時間），且一般成員嘗試存取時會被後端與前端攔截拒絕。

**Independent Test**: 以預建管理員帳號、密碼與 7 位數驗證碼登入系統，進入管理員檢視頁面；驗證可看到所有預建設備以及不同成員建立與取消的預約紀錄，且一般成員嘗試存取管理員全體預約清單時會被拒絕。

### 後端（B4）

> D1 的 `users` 與 D2 的 `equipments`、`time_slots`、`reservations` 已在 Phase 2 與 US1 建立並寫入預建資料，本故事沒有資料庫任務。

- [ ] T028 [US3] 在 `apps/equipment-loan/backend/src/services/reservationService.ts` 實作 `listAllReservations({ status, equipmentId, page, pageSize })`：驗證分頁參數（不合法回 `400 PAGINATION_INVALID`），查詢全體成員未軟刪除的預約紀錄並 join `users`、`equipments`、`time_slots`，依 `reservation_date` DESC、`time_slots.sort_order` ASC、`created_at` DESC、`id` ASC 排序，回傳包含 `username` 與 `userDisplayName` 的 `AdminReservationPage`（`page > totalPages` 時回傳空 `items`；`reservation_no` 映射見 Notes 待確認 2）（FR-009、FR-010、NFR-002）
  - **Must Read**
    - `contracts/openapi.yaml` → `listAllReservations`、`AdminReservationPage`、`AdminReservationItem` — Why：管理員全體預約查詢的分頁參數、篩選參數、排序依據與回應欄位
    - `data/data-model.dbml` → `Table reservations`、`Table users`、`Table equipments`、`Table time_slots` — Why：關聯查詢欄位與索引 `idx_reservations_date_slot_created`
    - `spec.md` → US3 情境 1、FR-009 — Why：管理員檢視全體成員預約紀錄的欄位與排序要求
- [ ] T029 [US3] 在 `apps/equipment-loan/backend/src/routes/adminRouter.ts` 實作 `GET /api/admin/reservations`（`listAllReservations`），掛上 `requireAuth` 與 `requireAdmin` 中介層（一般成員呼叫時回傳 `403 FORBIDDEN`），以 zod 驗證 query 參數，並在 `apps/equipment-loan/backend/src/app.ts` 掛載此路由（FR-009、FR-010、SC-005、Edge Cases 成員嘗試越權取消他人預約或查看管理員清單）
  - **Must Read**
    - `contracts/openapi.yaml` → `listAllReservations`、`Forbidden` — Why：端點路徑、query 參數與非管理員呼叫時的 `403 FORBIDDEN` 回應
    - `spec.md` → US3 情境 2、FR-010、SC-005 — Why：限制僅管理員可存取全體預約清單

### 前端（F4）

- [ ] T030 [P] [US3] 在 `apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx` 實作 F4 管理員設備與全體成員預約檢視畫面：當目前登入者為 `admin` 時，同時載入預建單件設備總覽（`GET /api/equipments`）與全體成員預約紀錄（`GET /api/admin/reservations`），支援依預約狀態（全部／有效預約／已取消）與設備篩選；當一般成員（`member`）嘗試切換至此視圖或收到 `403 FORBIDDEN` 時，隱藏管理表格並顯示紅色權限攔截卡片與「返回設備預約」「切換管理員帳號登入」按鈕（FR-009、FR-010、NFR-001、SC-005、US3 情境 1–2）
  - **Must Read**
    - `ui/plan.md` → §3.3 `A11`、`A12`、`A13`、§4 `admin.html`、§5 `admin.html` — Why：管理員總覽頁的操作、篩選狀態與一般成員越權存取攔截回饋
    - `ui/admin.html` → 雛形狀態「全體設備與預約總覽」「篩選已取消預約紀錄」「一般成員越權存取遭拒」 — Why：設備總覽卡、全體成員預約表格與權限攔截卡片的實際呈現
    - `contracts/openapi.yaml` → `listAllReservations`、`listEquipments` — Why：管理員畫面呼叫的 API 與欄位
- [ ] T031 [US3] 在 `apps/equipment-loan/frontend/src/App.tsx` 串接 US3 管理員登入導向與頁首導覽：管理員（`admin`）登入成功後預設支援前往「全體預約管理」（`AdminOverviewView`），並保留頁首頁籤切換與角色權限顯示（FR-009、FR-010、US3 情境 1–2）
  - **Must Read**
    - `ui/plan.md` → §3.1、§3.2、§4 `index.html` 的「管理員登入成功」 — Why：管理員登入後的導向與頁首導覽結構

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T032 [P] 在 `apps/equipment-loan/backend/tests/unit/` 與 `apps/equipment-loan/backend/tests/integration/` 撰寫並執行 Vitest + Supertest 自動化驗證測試，連接真實 PostgreSQL 18 資料庫量測並確認：（1）100% 登入請求強制驗證 7 位數驗證碼且嚴格區分大小寫（如 `a123456` 與 `A123456` 不同）、超過 5 分鐘或重送舊驗證碼 100% 攔截（SC-001）；（2）以 `Promise.all` 發送 10 個並發請求同時預約同一台設備、同一日期與同一固定時段，最終成功建立的有效預約恰好為 1 筆、其餘 9 筆皆回 `409 RESERVATION_CONFLICT`，重複占用率 0%（SC-002）；（3）取消未開始預約後 `< 1 秒` 內該時段恢復 `available` 且保留原 `cancelled` 紀錄（SC-003）；（4）登入、查詢、預約与取消 API 回應時間均 `< 2 秒`（NFR-002、SC-004）；（5）一般成員嘗試取消他人預約或呼叫 `GET /api/admin/reservations` 時 100% 回 `403 FORBIDDEN`（SC-005）
  - **Must Read**
    - `spec.md` → SC-001、SC-002、SC-003、SC-004、SC-005、NFR-002 — Why：五項可量測成功標準與回應時間門檻
    - `research.md` → §5、§6 — Why：以 Supertest 對真實 PostgreSQL 測試 10 並發搶約與單次驗證碼消耗
- [ ] T033 [P] 在 `apps/equipment-loan/frontend/tests/unit/` 與 `apps/equipment-loan/e2e/` 撰寫並執行前端單元測試與 Playwright 端對端測試：驗證 US1（驗證碼大小寫不符攔截、重整驗證碼、成員登入、預約固定時段與重新載入頁面維持「本人已預約」）、US2（查看個人預約、取消預約並釋出時段供重新預約）、US3（管理員登入檢視所有設備與全體成員預約、一般成員越權攔截），以及 Light Mode／Dark Mode 主題切換、臺灣繁體中文介面文字（NFR-001）與 360px／1120px 寬度操作正常
  - **Must Read**
    - `spec.md` → US1、US2、US3、NFR-001 — Why：三個 User Story 的獨立測試與驗收情境及繁體中文介面要求
    - `ui/plan.md` → §2、§4、§5 — Why：Light／Dark Mode 視覺風格、RWD 寬度與各畫面狀態／錯誤文字核對
- [ ] T034 [P] 在 `apps/equipment-loan/README.md` 撰寫完整本機啟動、環境變數設定、Docker Compose PostgreSQL 18 啟動、Prisma migration、demo seed 重設指令（`npm run db:seed`）與單元／整合／Playwright E2E 測試執行說明（FR-011、research §6）
  - **Must Read**
    - `plan.md` → `Source Code (repository root)` — Why：`apps/equipment-loan/README.md` 的用途與專案結構對照
    - `research.md` → §5、§6 — Why：Docker Compose、Prisma migration、demo seed 與測試執行方式
- [ ] T035 在 `apps/equipment-loan/backend/`、`apps/equipment-loan/frontend/` 與 `apps/equipment-loan/` 執行 `npm run check`（`tsc --noEmit`、ESLint、Prettier）、demo seed 重設與全套單元、整合及 Playwright E2E 測試，確認全部零錯誤通過（research §2、§6）
  - **Must Read**
    - `research.md` → §2、§6 — Why：靜態檢查、型別檢查與全套自動化測試通過標準

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US2 需要 US1 的登入機制與預約建立能力，US3 需要 US1 的登入機制與預建設備／預約資料，建議依 P1（US1）→ P2（US2）→ P3（US3）順序推進
  - 同一 User Story 內的前端元件與後端服務（不同檔案）可平行開發
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: 依賴 US1 的登入工作階段與 `reservationService.ts`、`reservationsRouter.ts`、`App.tsx`，擴充個人預約查詢與取消釋出功能
- **User Story 3 (P3)**: 依賴 Phase 2 與 US1 建立的登入權限中介層、`reservationService.ts` 與 `App.tsx`，擴充管理員全體預約查詢與管理視圖

### Within Each User Story

- 資料庫與 seed（T016）→ 後端服務（T017～T019、T024、T028）→ 後端路由（T020、T025、T029）→ 前端視圖元件（T021～T022、T026、T030）→ `App.tsx` 串接（T023、T027、T031）
- `reservationService.ts`（T019 → T024 → T028）、`reservationsRouter.ts`（T020 → T025）與 `App.tsx`（T015 → T023 → T027 → T031）跨任務修改同一檔案，必須依序執行
- Story complete before moving to next priority

### Parallel Opportunities

- Setup：T003、T004、T005、T006 可平行執行
- Foundational：T008 完成後，後端 T009、T010、T011 與前端 T014 可平行執行
- US1：前端 T021（登入與驗證碼元件）、T022（設備與時段預約元件）可彼此平行，並可與後端 T017～T020 平行進行
- US2：前端 T026（`MyReservationsView.tsx`）可與後端 T024、T025 平行進行
- US3：前端 T030（`AdminOverviewView.tsx`）可與後端 T028、T029 平行進行
- Polish：T032、T033、T034 可平行進行

---

## Parallel Example: User Story 1

```bash
# 後端 B1/B2 服務與前端 F1/F2 畫面同時開發：
Task: "實作驗證碼與登入服務 in apps/equipment-loan/backend/src/services/authService.ts"
Task: "實作登入與 7 位數驗證碼畫面 in apps/equipment-loan/frontend/src/views/LoginView.tsx"
Task: "實作設備清單與單日固定時段預約畫面 in apps/equipment-loan/frontend/src/views/EquipmentBookingView.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "實作 listMyReservations 與 cancelReservation in apps/equipment-loan/backend/src/services/reservationService.ts"
Task: "實作個人預約查詢與取消畫面 in apps/equipment-loan/frontend/src/views/MyReservationsView.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "實作 listAllReservations in apps/equipment-loan/backend/src/services/reservationService.ts"
Task: "實作管理員設備與全體成員預約檢視畫面 in apps/equipment-loan/frontend/src/views/AdminOverviewView.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 以 US1 的 Independent Test 驗證 7 位數區分大小寫驗證碼登入、瀏覽預建設備固定時段、送出預約立即占用與並發衝突攔截
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP：成員以 7 位數驗證碼登入並預約單件設備固定時段)
3. Add User Story 2 → Test independently → Deploy/Demo（成員查看個人預約並在時段開始前取消以釋出時段）
4. Add User Story 3 → Test independently → Deploy/Demo（管理員登入檢視所有預建設備與全體成員預約清單）
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done，每個故事依序推進，故事內前後端平行分工：
   - Developer A：後端（Prisma 服務層、Express 路由與並發交易控制）
   - Developer B：前端（React 視圖、驗證碼與時段元件、Light/Dark Mode 與 `App.tsx` 串接）
3. 雙方以 `contracts/openapi.yaml` 為介面約定，故事完成後一起驗收

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- `plan.md` 的 Source Code 未單獨列出 `apps/equipment-loan/.gitignore`（T001）、`eslint.config.mjs` 與 `.prettierrc`（T005）、`apps/equipment-loan/backend/vitest.config.ts` 與 `apps/equipment-loan/frontend/vitest.config.ts`（T006）；為支援 `research.md` §2、§6 的靜態檢查與 Vitest 測試執行，本 `tasks.md` 新增這些設定檔
- 待確認 1：固定時段代碼大小寫與設備可用欄位在資料模型與 API 合約命名不同（`data/data-model.dbml` 的 `time_slots.slot_code` 註解為小寫 `morning`、`afternoon`、`evening` 且 `equipments.status` 為 Enum `available`／`unavailable`；`contracts/openapi.yaml` 的 `EquipmentSlotAvailability.slotCode` 為大寫 `MORNING`、`AFTERNOON`、`EVENING` 且 `EquipmentWithSlotAvailability` 為布林欄位 `isActive`）。T009 與 T018 先在後端轉換（將 `slot_code` 轉大寫輸出為 `slotCode`、將 `status === 'available'` 轉為 `isActive: true`）；若要完全統一命名，需同步更新 `data-model.dbml` 或 `openapi.yaml`
- 待確認 2：預約編號欄位在資料模型與 API 合約命名不同（`data/data-model.dbml` 的 `reservations.reservation_no` vs `contracts/openapi.yaml` 的 `Reservation.reservationNumber` 與 `AdminReservationItem.reservationNumber`）。T019、T024 與 T028 先在後端服務層將資料庫的 `reservation_no` 映射為 API 回應的 `reservationNumber`；若要統一欄位名稱，需同步更新 `data-model.dbml` 或 `openapi.yaml`
