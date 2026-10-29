# 技術研究與決策紀錄 (Research): 線上 PVP 1A2B 猜數字對戰平台 (Online PVP 1A2B)

**Feature Branch**: `001-online-pvp-1a2b`  
**Date**: 2026-10-29  
**Spec**: [spec.md](./spec.md)

## 1. 前端架構與建置工具 (React + Vite)

- **Decision**: 前端採用 **React 19**，以 **Vite 8** 搭配 **`@vitejs/plugin-react` 6** 作為開發伺服器與打包工具；不引入路由與全域狀態管理套件，畫面（入口、房間、設定秘密答案、對戰、結束）由頂層元件的 `useReducer` 狀態機切換，狀態依 REST 回應與 Socket.IO 事件轉換；所有介面文字與錯誤提示集中在單一模組 `frontend/src/text/zh-TW.ts`，後端錯誤碼也在此對應成繁體中文；開發時以 Vite `server.proxy` 把 `/api` 與 `/socket.io`（`ws: true`）轉給後端。
- **Rationale**:
  - 符合使用者限制「前端 React＋Vite」。
  - spec 的 Assumptions 寫明「不支援斷線重連」，FR-016 要求對局結束後回到入口；玩家無法靠網址回到房間，所以以畫面狀態機切換畫面即可，不需要網址路由。
  - NFR-004 要求所有介面文字、狀態提示與錯誤提示使用自然清晰的臺灣繁體中文；集中在單一模組，可以一次檢查所有文字，後端只回錯誤碼，不會出現前後端用語不一致。
  - NFR-001 要求送出配對碼到看見房間畫面 `< 2 秒`；不含路由與狀態管理套件，首頁打包體積（含 `socket.io-client`）預估 `< 100 KB`（gzipped），首次載入不會占用這段時間。
- **Alternatives considered**:
  - **React Router 8**：可以用網址直接進入房間頁，但 spec 不支援斷線重連，重新整理後身分就失效，網址進房沒有用途，反而要處理失效網址的錯誤畫面。
  - **Zustand / Redux Toolkit**：本功能的前端狀態只有目前畫面、房間與猜測紀錄，`useReducer` 就能管理，額外的全域狀態套件沒有對應的需求。
  - **react-i18next**：spec 只要求臺灣繁體中文（NFR-004），沒有多語系需求，引入翻譯框架只多出設定與鍵值檔。

---

## 2. 開發語言、執行環境與靜態檢查 (TypeScript 6.0 + Node.js 24 LTS)

- **Decision**: 前後端都以 **TypeScript 6.0** 撰寫（`strict: true`）；後端執行環境採用 **Node.js 24 LTS**，開發時以 **`tsx`** 的 `tsx watch` 直接執行 TypeScript，建置以 `tsc` 輸出到 `backend/dist/`；靜態檢查採用 **ESLint 10** 搭配 **`typescript-eslint` 8**，格式化採用 **Prettier**。
- **Rationale**:
  - 使用者在 clarify 中表示接受 TypeScript；Prisma Client 與 Socket.IO 都提供型別，可以在編譯時檢查查詢結果與事件內容（見 §4、§6、§8）。
  - 查證 `typescript-eslint` 8.72.1 的 peer 相依範圍為 `typescript >=4.8.4 <6.1.0`，所以採用 TypeScript 6.0（目前 6.0.3），不採用 7.0。
  - Node.js 24 在 2025-10-28 進入 LTS、維護至 2028-04-30，本機環境為 v24.14.1；Prisma 7.10.1 要求 `node ^20.19 || ^22.12 || >=24.0`，Vite 8 要求 `^20.19.0 || >=22.12.0`，都相容，滿足使用者限制「後端 Express」的執行需求。
- **Alternatives considered**:
  - **JavaScript 搭配 JSDoc**：可以少一個編譯步驟，但使用者已接受 TypeScript；JSDoc 宣告 Socket.IO 事件與 Prisma 查詢結果的型別較冗長，NFR-002 的答案欄位檢查（§8）也較難由編譯器強制。
  - **TypeScript 7.0**：npm 最新版為 7.0.2，但 `typescript-eslint` 8.72.1 只支援到 `<6.1.0`，採用後靜態檢查無法執行。
  - **Node.js 26**：2026-10-28 才進入 LTS，本機環境與相依套件的實測基礎仍是 24；24 的維護期涵蓋本次開發。
  - **Node.js 內建型別剝除直接執行 `.ts`**：只支援可抹除的語法，且 import 必須寫 `.ts` 副檔名，Prisma 產生的 Client 要另外設定副檔名；`tsx` 不需要這些調整。

---

## 3. 後端 HTTP API 與輸入驗證 (Express 5 + zod)

- **Decision**: 後端 HTTP API 採用 **Express 5**，所有玩家指令（進站、配對、開始遊戲、設定秘密答案、提交猜測、離開房間）都是 REST 端點，路徑前綴為 `/api`；請求內容以 **zod 4** 的 schema 驗證：配對碼 `/^\d{4}$/`，秘密答案與猜測 `/^(?!.*(\d).*\1)\d{4}$/`，暱稱 `trim()` 後 1～12 字；驗證失敗回 `400` 與 `{ "error": { "code": "<錯誤碼>" } }`，錯誤碼由前端對應成繁體中文（§1）。
- **Rationale**:
  - 符合使用者限制「後端 Express（REST）」。
  - FR-005 要求配對碼恰好四位數字，FR-017 要求秘密答案與猜測四位且互不重複，FR-001 要求暱稱不得為空；在後端以同一組 zod schema 驗證，繞過前端直接呼叫 API 也無法建立房間或送出不合法的答案。
  - zod 的 `z.infer` 可以從 schema 推導請求型別，路由處理函式不需要另外宣告型別（§2）。
  - NFR-004 要求錯誤提示讓使用者看得懂；後端只回穩定的錯誤碼，文字統一由前端模組決定。
- **Alternatives considered**:
  - **Fastify**：內建 JSON Schema 驗證與較高的吞吐量，但違反使用者限制「後端 Express」。
  - **express-validator**：以中介層鏈宣告規則，無法從規則推導 TypeScript 型別，路由要重複宣告請求型別。
  - **只在前端驗證**：可以直接呼叫 API 繞過，違反 FR-005、FR-017。

---

## 4. 即時推播與斷線偵測 (Socket.IO)

- **Decision**: 即時通訊採用 **Socket.IO 4.8**（伺服器端 `socket.io`、前端 `socket.io-client`），只負責伺服器推播與斷線偵測，不接收玩家指令：
  - 伺服器以 `new Server(httpServer, { pingInterval: 10000, pingTimeout: 5000 })` 掛在 Express 的同一個 HTTP 伺服器上；玩家連線後加入 Socket.IO room `room:<roomId>`，REST 指令完成並提交交易後，伺服器 `io.to("room:<roomId>").emit(...)` 推播房間狀態、輪次與猜測結果。
  - 前端以 `io({ auth: { token }, reconnection: false, transports: ["websocket"] })` 連線（`token` 見 §5）。
  - 伺服器收到 `disconnect` 時，比照玩家離開房間處理：設定秘密答案階段通知另一方對局無法繼續（FR-018），猜測階段判另一方獲勝（FR-015）。
  - 前後端以 `ServerToClientEvents` 介面宣告事件名稱與內容，傳給 `Server<…>` 與 `Socket<…>` 的泛型參數，事件格式由編譯器檢查。
- **Rationale**:
  - 符合使用者限制「即時通訊用 Socket.IO」；限制同時寫了「後端 Express（REST）」，本決策解讀為「指令走 REST、推播走 Socket.IO」，兩項限制都成立。
  - NFR-003 與 SC-003 要求對手畫面在 95% 以上的情況下 `< 1 秒` 更新；推播在 REST 交易提交後立即從同一個行程發出，經 WebSocket 傳到對手，同區域網路預估 `< 100ms`。
  - FR-015、FR-018 要求一方斷線或離開時處理另一方；關閉分頁或離開頁面時連線立即關閉、`disconnect` 立即觸發；網路中斷時依心跳設定在 `pingInterval + pingTimeout` 約 15 秒內偵測，預設值（25 秒＋20 秒）要約 45 秒。
  - spec 的 Assumptions 寫明「不支援斷線重連」，所以前端關閉自動重連，斷線就視為離開，與伺服器的處理一致。
- **Alternatives considered**:
  - **全部指令改走 Socket.IO 事件與 acknowledgement**：少一套傳輸方式，但違反使用者限制「後端 Express（REST）」，Supertest 也無法直接測試指令。
  - **`ws` 原生 WebSocket 套件**：要自行實作房間廣播、心跳與事件命名，Socket.IO 都已內建。
  - **REST 輪詢**：每秒輪詢時，對手平均要多等 0.5 秒才看到更新，網路延遲加上去容易超過 NFR-003 的 1 秒；也無法偵測斷線（FR-015）。

---

## 5. 玩家身分與連線識別 (伺服器發放的不透明 token)

- **Decision**: 玩家以 `POST /api/players` 送出暱稱進站，後端以 Node.js 內建 `crypto.randomUUID()` 產生不透明 token，與暱稱一起存入 PostgreSQL 的玩家資料（§6）並回傳；前端只把 token 放在 React 狀態中，不寫入 `localStorage` 或 Cookie；REST 請求以 `Authorization: Bearer <token>` 帶入，由 Express 中介層查出玩家；Socket.IO 以 `io.use()` 中介層驗證 `handshake.auth.token`，每個 token 只允許一條連線；連線中斷時刪除該玩家資料。
- **Rationale**:
  - FR-001 要求只輸入暱稱即可進站、不得要求註冊登入、不得保存跨連線的戰績；token 只存在記憶體中的 React 狀態，關閉分頁就消失，斷線時伺服器端也一併刪除，不會留下跨連線身分。
  - spec 的 Independent Test 以「兩個互不相干的瀏覽器工作階段」模擬兩位玩家；token 不放 Cookie，同一個瀏覽器開兩個分頁也是兩位玩家，測試與手動驗證都更容易。
  - spec 的 Assumptions 寫明「暱稱不要求唯一」「暱稱長度上限於技術規劃階段決定」；本決策以 token 區分玩家，暱稱上限定為 12 字（§3）。
- **Alternatives considered**:
  - **express-session 搭配 Cookie**：同一個瀏覽器的分頁共用 Cookie，只能當同一位玩家；Session 預設會存活到過期，與 FR-001「不保存跨連線」的精神不符。
  - **JWT（`jsonwebtoken`）**：無狀態權杖在玩家斷線後仍然有效，要另外維護撤銷清單才能讓斷線的玩家失效，比直接查資料庫更複雜。
  - **以 Socket.IO 的 `socket.id` 作為身分**：REST 請求沒有 `socket.id`，要求前端在每個請求附上 `socket.id` 等於把它當 token 用，卻又無法在建立連線前完成進站。

---

## 6. 資料庫與資料存取 (PostgreSQL + Prisma ORM)

- **Decision**: 資料庫採用 **PostgreSQL 18**，以 **Prisma ORM 7.10** 存取：`schema.prisma` 使用 `prisma-client` generator 並開啟 `previewFeatures = ["partialIndexes"]`，連線透過 driver adapter **`@prisma/adapter-pg`** 與 **`pg`**，連線設定寫在 `prisma.config.ts`，資料表以 `prisma migrate` 建立與遷移；Prisma Client 以全域 `omit` 設定預設排除秘密答案欄位（§8）。資料庫存放進行中的玩家、房間、秘密答案與猜測紀錄；房間關閉或對局結束且雙方都離開後刪除該房間與其猜測紀錄。開發與測試環境以 **Docker Compose** 啟動 `postgres:18` 容器。
- **Rationale**:
  - 符合使用者限制「資料庫 PostgreSQL（保存進行中的對局）」；本決策把這項限制解讀為「進行中的對局狀態以 PostgreSQL 為準，不放在 Node.js 行程記憶體」，結束的對局不保留，同時符合 FR-001「不得保存跨連線的戰績」。
  - 使用者在 clarify 中選擇 Prisma 作為資料存取層。
  - FR-002～FR-004 與 Edge Cases「同時輸入同一配對碼」需要資料庫層的唯一性保證（§7）；查證 Prisma 7.4 起 `@@unique` 可加 `where` 宣告部分唯一索引（需 `partialIndexes` 預覽旗標），約束寫在 schema 中，不必手動修改 migration SQL。
  - 查證 Prisma 7 改為 TypeScript 實作的查詢引擎，連線必須透過 driver adapter；PostgreSQL 使用官方的 `@prisma/adapter-pg`。
- **Alternatives considered**:
  - **node-postgres（`pg`）直接寫 SQL**：鎖定與索引完全由 SQL 控制，但查詢結果型別要自行宣告、migration 要自行管理；使用者在 clarify 中選擇 Prisma。
  - **Drizzle ORM**：schema 以 TypeScript 宣告，部分索引與 `.for("update")` 都是穩定功能，但穩定版仍為 0.45.x、1.0 尚在 beta；使用者在 clarify 中選擇 Prisma。
  - **Prisma 8.0 RC**：部分唯一索引已轉正式功能，但查證 npm 上仍為 `8.0.0-rc.28`，不是正式版。
  - **Node.js 行程記憶體保存對局狀態**：沒有資料庫最簡單，但違反使用者限制「PostgreSQL（保存進行中的對局）」。

---

## 7. 配對碼原子配對 (部分唯一索引 + 交易內 `FOR UPDATE`)

- **Decision**: 配對在一個 Prisma 互動式交易 `prisma.$transaction(async (tx) => { … })`（PostgreSQL 預設 `READ COMMITTED`）內完成：
  1. 以 `tx.$queryRaw` 執行 `SELECT id FROM rooms WHERE pair_code = ${pairCode} AND status = 'waiting' LIMIT 1 FOR UPDATE`，鎖定符合的等待中房間。
  2. 找到時把玩家加入為對手，並把房間狀態從 `waiting` 改為已滿（其餘狀態值由 data-plan 定義）。
  3. 找不到時建立狀態為 `waiting` 的新房間，玩家成為房主；`rooms` 以 `@@unique([pairCode], where: { status: "waiting" })` 保證同一配對碼最多一間等待中房間。
  4. 同時建立同一配對碼的第二個交易會在唯一索引上等待第一個交易提交，然後收到 Prisma 錯誤碼 `P2002`；後端捕捉後重新執行整個交易，最多 3 次，重試時就會在步驟 1 找到並加入第一位玩家的房間。
- **Rationale**:
  - Edge Cases「同時輸入同一配對碼」要求先被處理的玩家成為房主、另一位加入，不得各自開房；部分唯一索引在資料庫層擋下第二間等待中房間，重試後第二位玩家加入第一間，滿足 FR-002、FR-003。
  - FR-004 要求房間最多兩人、已滿或已開始時視為沒有符合的房間；`FOR UPDATE` 鎖住等待中房間，兩人同時加入同一間時，第二人在鎖釋放後重新比對條件，房間已不是 `waiting`，於是進入步驟 3 建立新房間。
  - SC-002 要求 50 組隨機配對碼的配對正確率 100%；約束由資料庫保證，不依賴請求到達的時間順序，可以用並行請求的整合測試驗證（§9）。
  - NFR-001 要求送出配對碼到看見房間 `< 2 秒`；單一交易包含一次索引查詢與一次寫入，預估 `< 20ms`，重試 3 次也在 `100ms` 以內。
- **Alternatives considered**:
  - **`SERIALIZABLE` 隔離等級搭配重試**：同樣能避免雙開，但所有讀寫房間的交易都可能因序列化衝突失敗，猜測與開始遊戲也要處理重試；部分唯一索引只影響建立房間。
  - **`pg_advisory_xact_lock(hashtext(pair_code))` 咨詢鎖**：可以序列化同一配對碼的配對，但約束不在 schema 中，data-plan 的資料模型與 Prisma schema 都看不出這項保證。
  - **Node.js 行程內互斥鎖（以配對碼為鍵的 Promise 佇列）**：只在單一行程有效，且對局狀態不在 PostgreSQL，違反使用者限制「PostgreSQL（保存進行中的對局）」。
  - **Redis 分散式鎖（`SET NX PX`）**：要多部署一個服務，鎖逾時時仍可能雙開，違反 Edge Cases 的要求。

---

## 8. 秘密答案保護、輪次控制與 A／B 判定

- **Decision**:
  - 秘密答案只存在 PostgreSQL，以 Prisma Client 全域設定 `omit` 預設排除秘密答案欄位；只有 A／B 判定與對局結束揭曉的查詢以 `omit: { secret: false }` 明確取回。
  - Socket.IO 的 `ServerToClientEvents`（§4）與 REST 回應型別中，除了對局結束事件之外，都沒有秘密答案欄位；對局結束事件同時帶雙方答案（FR-014）。
  - A／B 判定由後端純函式 `scoreGuess(secret: string, guess: string): { a: number; b: number }` 計算，不在前端計算。
  - 提交猜測時，在 Prisma 互動式交易中以 `FOR UPDATE` 鎖定房間，確認輪到提交者，寫入帶遞增序號的猜測紀錄，`4A` 時結束對局，否則把輪次交給對手；提交交易後才推播（§4）。
- **Rationale**:
  - NFR-002 與 SC-004 要求對局結束前，對手透過任何畫面或介面取得秘密答案的次數為 0；答案預設不被查出、事件型別沒有答案欄位，等於在查詢層與傳輸層各有一道檢查，新增端點或事件時漏掉排除也會被編譯器或預設設定擋下。
  - FR-011 與 SC-005 要求 A／B 回報與標準 1A2B 規則 100% 一致；純函式不依賴資料庫與網路，可以用 100 組答案與猜測直接測試（§9）。
  - FR-012 要求只有輪到的玩家可以提交猜測；鎖定房間後再檢查輪次，雙方同時提交時只有一筆會被接受，FR-013 的猜測紀錄順序也不會錯亂。
- **Alternatives considered**:
  - **在前端計算 A／B**：要把對手答案送到前端，違反 NFR-002。
  - **以雜湊儲存秘密答案**：可以防止資料庫外洩時直接看到答案，但計算 B（數字正確、位置錯誤）需要明文；本功能的答案只在單場對局內有效，雜湊帶來的保護不值得換成無法判定。
  - **在每個查詢與事件手動排除答案欄位**：沒有預設排除時，新增查詢只要漏寫一次就會外洩，違反 NFR-002。

---

## 9. 品質與測試策略

- **Decision**:
  - 單元與整合測試：前後端都採用 **Vitest 5**。
  - REST API 測試：以 **Supertest 7** 呼叫 Express 應用程式，並連到 Docker Compose 啟動的真實 PostgreSQL 18 測試資料庫。
  - 推播測試：以 **`socket.io-client` 4.8** 連線，驗證推播事件與斷線處理。
  - 端對端測試：採用 **Playwright**（`@playwright/test` 1.64），以兩個 `browser.newContext()` 模擬兩位玩家。
  - 型別檢查：`tsc --noEmit` 與 ESLint（§2）納入同一個檢查命令。
- **Rationale**:
  - SC-005 要求 100 組答案與猜測組合的 A／B 一致率 100%；以 Vitest 對 `scoreGuess` 做表格式測試（§8）。
  - SC-002 要求 50 組隨機配對碼的配對正確率 100%，且 Edge Cases 要求同時輸入不得雙開；以 Supertest 對真實 PostgreSQL 並行送出配對請求，才能驗證部分唯一索引與 `FOR UPDATE`（§7）。
  - SC-003 要求對手畫面在 1 秒內更新的比率達 95% 以上；以兩個 `socket.io-client` 連線，量測 100 次猜測從 REST 回應到對手收到事件的時間，檢查第 95 百分位 `< 1 秒`。
  - spec 各使用者故事的 Independent Test 都以兩個互不相干的瀏覽器工作階段驗證；Playwright 的兩個 browser context 各自獨立，可以在同一個測試中操作兩位玩家。
- **Alternatives considered**:
  - **Jest**：TypeScript 與 ESM 需要額外的轉譯設定，Vitest 直接沿用 Vite 的設定。
  - **以 Prisma mock 取代真實 PostgreSQL**：測不到部分唯一索引與 `FOR UPDATE`，無法證明 SC-002 與同時配對的 Edge Case。
  - **Cypress**：一個測試只能控制一個瀏覽器分頁，無法同時操作兩位玩家完成 Independent Test。
