---

description: "Task list for 購物車與結帳 implementation"
---

# Tasks: 購物車與結帳 (Shopping Cart Checkout)

**Input**: Design documents from `/specs/004-shopping-cart-checkout/`（依下方 Reference Loading Contract 按任務載入）

**Tests**: spec.md 沒有明確要求測試或 TDD，因此各使用者故事不產生測試任務。Setup 只依 research §8 安裝與設定測試工具，供之後需要時使用。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. 每個階段內再依 plan.md「系統介面盤點」的技術端點（資料庫、後端、前端）分組，標題列出該組實作的介面編號；每個任務下方以 Must Read／Optional 列出執行時要讀的文件部位。

## Reference Loading Contract

執行本檔的任務時，依下列規則載入 `/specs/004-shopping-cart-checkout/` 的文件：

1. 開工前只讀本檔，不預先讀 spec package 的其他文件。
2. 每個任務下方列出它的參考，分兩級：
   - **Must Read**：開始這個任務前一定要讀完的部位。
   - **Optional**：只在遇到該項 Why 描述的情況時才讀。
3. 每項參考寫成 `` `檔案` → 部位 — Why：理由 ``。Why 說明這個部位決定任務的哪一部分，讀的時候以它為重點。
4. 只讀列出的部位，不讀整份文件。部位以文件內可搜尋的識別字定位：
   - `contracts/openapi.yaml`：operationId，或 `components` 底下的 schema、response 名稱
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
- 資料表 DDL 與開發用商品資料放在 `backend/src/db/`，Docker Compose 放在 `backend/`；不建立 `shared/`，前端直接使用與合約一致的欄位名稱

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 依 plan.md 的 Source Code 建立 `frontend/` 與 `backend/` 目錄結構（含 `frontend/tests/unit/`、`frontend/tests/e2e/`、`backend/tests/unit/`、`backend/tests/integration/`）
  - **Must Read**
    - `plan.md` → Source Code (repository root) — Why：前後端的目錄與檔案配置
- [ ] T002 在 `backend/package.json` 初始化後端專案：`"type": "module"`；相依 `express@5`、`zod@4`、`socket.io@4.8`、`pg@8`；script `dev` 為 `node --watch src/server.js`、`db:reset` 以 `psql "$DATABASE_URL"` 依序執行 `src/db/schema.sql` 與 `src/db/seed.sql`（research §2、§3）
  - **Must Read**
    - `techstack.md` → 技術堆疊總覽 — Why：後端各套件採用的版本
    - `research.md` → §3 — Why：開發期不做 migration，以 `db:reset` 重建資料庫
- [ ] T003 [P] 在 `frontend/package.json` 初始化前端專案：相依 `vue@3.5`、`socket.io-client@4.8`；開發相依 `vite@8`、`@vitejs/plugin-vue@6`（research §1）；不安裝路由與全域狀態套件（techstack.md「本次開發不引入的技術」）
  - **Must Read**
    - `techstack.md` → 技術堆疊總覽 — Why：前端各套件採用的版本
    - `techstack.md` → 本次開發不引入的技術 — Why：不得安裝的 Vue Router、Pinia
- [ ] T004 [P] 在 `frontend/vite.config.js` 掛上 `@vitejs/plugin-vue`，並以 `server.proxy` 把 `/api` 與 `/socket.io`（`ws: true`）轉給 `http://localhost:3000`（research §1）
  - **Must Read**
    - `research.md` → §1 — Why：開發時以 Vite `server.proxy` 轉發 `/api` 與 `/socket.io`
  - **Optional**
    - `contracts/asyncapi.yaml` → `servers.development` — Why：代理 Socket.IO 連線不通時，確認主機與 port
- [ ] T005 [P] 在 `backend/docker-compose.yml` 建立 `postgres:18` 容器（開發與測試資料庫），並在 `backend/.env.example` 寫入 `DATABASE_URL`、`ECPAY_MERCHANT_ID`、`ECPAY_HASH_KEY`、`ECPAY_HASH_IV`、`ECPAY_PAYMENT_URL`、`PUBLIC_BASE_URL`、`DEMO_CUSTOMER_ID`，綠界欄位以測試環境特店資料為預設值（research §3、§5、§7）
  - **Must Read**
    - `research.md` → §3 — Why：PostgreSQL 18 與 Docker Compose 的開發測試資料庫
    - `research.md` → §5 — Why：綠界測試環境網址與特店資料，HashKey、HashIV 只放在 `.env`
    - `research.md` → §7 — Why：以 `DEMO_CUSTOMER_ID` 代表已登入的顧客
- [ ] T006 [P] 在 `backend/` 與 `frontend/` 設定 ESLint 10 與 Prettier（`eslint.config.js`、`.prettierrc`，前端加上 `eslint-plugin-vue`），並在兩邊的 `package.json` 加入 `check` script 執行 ESLint 與 `prettier --check`（research §8）
  - **Must Read**
    - `research.md` → §8 — Why：靜態檢查與格式化的工具與命令
- [ ] T007 [P] 依 research §8 安裝測試工具：`backend/package.json` 加入 Vitest 4、Supertest 7 開發相依並建立 `backend/vitest.config.js`；`frontend/package.json` 加入 Vitest 4、`@vue/test-utils`、`@playwright/test` 並建立 `frontend/vitest.config.js`、`frontend/playwright.config.js`
  - **Must Read**
    - `research.md` → §8 — Why：前後端各自的測試工具與用途
    - `techstack.md` → 技術堆疊總覽（品質與測試） — Why：測試工具的版本

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 資料庫（D1）

- [ ] T008 在 `backend/src/db/schema.sql` 開頭以 `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` 重建 schema，並建立 `products`：`id uuid [pk]`；`name varchar(200) [not null]`；`is_listed boolean [not null, default: true]`「下架商品不可加入購物車」；`created_at timestamptz [not null, default: now()]`；以及 `product_variants`：`id uuid [pk]`；`product_id uuid [not null]`；`sku varchar(64) [not null, unique]`；`spec_label varchar(100) [not null]`「例如「黑色 / M」」；`unit_price integer [not null]`「新台幣，以元為單位」；`stock_quantity integer [not null, default: 0]`；索引 `product_id`；`Ref: product_variants.product_id > products.id`（research §3）
  - **Must Read**
    - `data/data-model.dbml` → `Table products`、`Table product_variants` — Why：欄位、約束與各欄位的用途
    - `data/data-model.dbml` → `Ref: product_variants.product_id > products.id` — Why：規格與商品的關聯
    - `research.md` → §3 — Why：DDL 寫在 `schema.sql`，開發期每次重建
- [ ] T009 在 `backend/src/db/seed.sql` 寫入開發用商品：「亞麻短袖襯衫」（含「黑色 / M」NT$1,280、庫存 2 件，以及至少一個庫存為 0 的規格）、「帆布托特包」（「墨綠 / 單一尺寸」NT$890）、「陶瓷馬克杯 350ml」（「灰藍」NT$420）、已下架的「手沖咖啡濾杯組」，名稱、規格與價格與雛形一致（plan.md 未列此檔，見 Notes）
  - **Must Read**
    - `ui/plan.md` → §4 `index.html` 的「商品列表」「選擇規格中」 — Why：商品、已下架商品與「庫存剩 2 件」的假資料
    - `ui/plan.md` → §5 `index.html` 的「規格已售完」 — Why：需要一個庫存為 0 的規格
  - **Optional**
    - `ui/checkout.html` → 雛形狀態「填寫收件資料」 — Why：需要對照各規格單價與訂單摘要金額時
- [ ] T010 執行 `docker compose up -d` 與 `npm run db:reset`，以 `psql` 確認 `products`、`product_variants` 已建立且 seed 資料可查詢
  - **Must Read**
    - `research.md` → §3 — Why：資料庫容器與 `db:reset` 的執行方式

### 後端（B1–B5 共用）

- [ ] T011 在 `backend/src/db/pool.js` 以 `pg` 建立並匯出單一連線池（讀取 `DATABASE_URL`），另匯出 `withTransaction(callback)`：取得連線後 `BEGIN`，callback 成功時 `COMMIT`、拋出錯誤時 `ROLLBACK`，最後釋放連線（research §3）
  - **Must Read**
    - `research.md` → §3 — Why：以 `pg` 連線池存取資料庫，不用 ORM；交易的使用方式
- [ ] T012 [P] 在 `backend/src/middleware/errorHandler.js` 定義 `AppError(code, httpStatus, message)` 與 Express 錯誤處理中介層，所有錯誤一律回 `{ "code": "<錯誤碼>", "message": "<繁體中文訊息>" }`；zod 驗證失敗轉成 `VALIDATION_FAILED` 並回 `400`，`message` 取第一個不符欄位的提示（contracts/openapi.yaml `Error`、research §2）
  - **Must Read**
    - `contracts/openapi.yaml` → `components.schemas.Error` — Why：錯誤回應格式與所有錯誤碼
    - `contracts/openapi.yaml` → `components.responses` — Why：每個錯誤碼對應的 HTTP 狀態碼
    - `research.md` → §2 — Why：錯誤訊息由後端產生繁體中文，前端直接顯示
- [ ] T013 在 `backend/src/server.js` 建立 Express 5 應用程式（`express.json()`、`express.urlencoded({ extended: false })`、路徑前綴 `/api`、掛上 `errorHandler`），以中介函式從 `DEMO_CUSTOMER_ID` 設定 `req.customerId`；以同一個 HTTP 伺服器建立 Socket.IO `Server`，監聽 3000 埠；匯出 `app` 供 Supertest 使用（research §2、§6、§7）
  - **Must Read**
    - `research.md` → §2 — Why：Express 5 與路徑前綴 `/api`
    - `research.md` → §6 — Why：Socket.IO 與 Express 共用 HTTP 伺服器
    - `research.md` → §7 — Why：目前顧客的取得方式
  - **Optional**
    - `contracts/openapi.yaml` → `receiveEcpayPaymentResult` — Why：需要確認綠界通知為 `application/x-www-form-urlencoded`、必須解析表單內容時

### 前端（F1–F4 共用）

- [ ] T014 [P] 在 `frontend/src/api/httpClient.js` 實作 REST 呼叫：路徑前綴 `/api`、JSON 請求與回應；錯誤回應解析成 `ApiError`（`code`、`message`、HTTP 狀態碼），畫面直接顯示 `message`
  - **Must Read**
    - `contracts/openapi.yaml` → `components.schemas.Error` — Why：錯誤回應的欄位
    - `research.md` → §2 — Why：錯誤訊息由後端產生，前端不再對應文字
- [ ] T015 在 `frontend/src/App.vue` 建立頁首（品牌「拾日選物」、「商品」「購物車（件數）」「我的訂單」導覽）與畫面切換骨架：以 `ref` 保存目前畫面 `products`、`cart`、`checkout`、`orders`，不使用 Vue Router；在 `App.vue` 的全域 `<style>` 依 ui/plan.md §2 寫入配色變數（背景 `#F7F4EE`、卡片 `#FFFFFF`、主色 `#2F5D50`、文字 `#23302B`、次要文字 `#6B7570`、錯誤 `#B4442F`、等待中 `#9A6A14`、成功 `#2F7D4F`）、中文字體與金額等寬數字、內容最大寬度 1080px、360px 寬仍可操作、卡片圓角 12px、墨綠實心膠囊主要按鈕；並建立 `frontend/src/main.js` 與 `frontend/index.html` 掛載應用程式（research §1）
  - **Must Read**
    - `research.md` → §1 — Why：不用路由，畫面由 `App.vue` 的狀態切換
    - `ui/plan.md` → §2 — Why：配色、字體與版面規則
    - `ui/plan.md` → §3.1 — Why：四個畫面與頁首的進入方式
  - **Optional**
    - `ui/checkout.html` → `<style>` — Why：需要對照雛形的實際樣式數值時

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 加入購物車並調整 (Priority: P1) 🎯 MVP

**Goal**: 顧客在商品列表選擇規格與數量後加入購物車，並能在購物車調整數量或移除商品；庫存不足或商品已下架時拒絕並提示。

**Independent Test**: 在商品列表選「亞麻短袖襯衫（黑色 / M）」1 件加入購物車，確認頁首購物車件數立即加 1；到購物車把數量調到 3 件，確認被拒絕並提示「庫存只剩 2 件」；移除該項目後購物車顯示「購物車是空的」。

### 資料庫（D1）

- [ ] T016 [US1] 在 `backend/src/db/schema.sql` 建立 `carts`：`id uuid [pk]`；`customer_id uuid [not null, unique]`「每位顧客只有一個進行中的購物車」；`updated_at timestamptz [not null, default: now()]`；以及 `cart_items`：`id uuid [pk]`；`cart_id uuid [not null]`；`variant_id uuid [not null]`；`quantity integer [not null]`「必須大於 0，以 `CHECK (quantity > 0)` 保證」；`added_at timestamptz [not null, default: now()]`；唯一索引 `(cart_id, variant_id)` 名稱 `uq_cart_items_cart_variant`；`Ref: cart_items.cart_id > carts.id [delete: cascade]`、`Ref: cart_items.variant_id > product_variants.id`；執行 `npm run db:reset` 確認建立成功
  - **Must Read**
    - `data/data-model.dbml` → `Table carts`、`Table cart_items` — Why：欄位、約束與唯一索引 `uq_cart_items_cart_variant`
    - `data/data-model.dbml` → `Ref: cart_items.cart_id > carts.id`、`Ref: cart_items.variant_id > product_variants.id` — Why：刪除購物車時連帶刪除項目

### 後端（B1）

- [ ] T017 [US1] 在 `backend/src/services/cartService.js` 實作 `getCart(customerId)`：以 `cart_id` 查出購物車項目並 join `product_variants`、`products`，轉成 `Cart`（`items` 依 `added_at` 排序；`variantName` 取自 `spec_label`；`subtotal` 為 `unitPrice × quantity`；`totalAmount` 為小計總和）；顧客還沒有購物車時回空的 `items` 與 `totalAmount: 0`（FR-001、FR-002、SC-001）
  - **Must Read**
    - `contracts/openapi.yaml` → `getCart`、`Cart`、`CartItem` — Why：輸出的欄位與金額計算
    - `data/data-model.dbml` → `Table cart_items`、`Table product_variants` — Why：轉換來源的欄位，以及 SC-001 要以 `cart_id` 查詢項目
- [ ] T018 [US1] 在 `backend/src/services/cartService.js` 實作 `addItem(customerId, variantId, quantity)`：規格不存在拋出 `PRODUCT_NOT_FOUND`（404）；商品 `is_listed` 為 false 拋出 `PRODUCT_UNAVAILABLE`（409）；購物車中已有數量加上本次數量超過 `stock_quantity` 時拋出 `INSUFFICIENT_STOCK`（409），訊息寫出目前可購買的數量，例如「黑色 / M 只剩 2 件」；顧客沒有購物車時先建立；以 `ON CONFLICT ON CONSTRAINT uq_cart_items_cart_variant DO UPDATE` 累加同一規格的數量並更新 `carts.updated_at`；只比對庫存、不鎖定也不扣減（research §4、FR-001、FR-003、Edge Cases 商品已下架）
  - **Must Read**
    - `contracts/openapi.yaml` → `addCartItem`（含 `NotFound`、`Conflict`） — Why：累加數量的規則與各錯誤碼
    - `research.md` → §4 — Why：加入購物車只比對庫存，下單時才鎖定並扣減
    - `spec.md` → FR-001、FR-003、Edge Cases「商品已下架」 — Why：庫存不足與已下架時都要拒絕並提示
    - `data/data-model.dbml` → `Table products` 的 `is_listed`、`Table cart_items` 的 `uq_cart_items_cart_variant` — Why：判斷下架與累加數量依據的欄位
- [ ] T019 [US1] 在 `backend/src/services/cartService.js` 實作 `updateQuantity(customerId, itemId, quantity)` 與 `removeItem(customerId, itemId)`：項目不在該顧客的購物車時拋出 `CART_ITEM_NOT_FOUND`（404）；新數量超過 `stock_quantity` 時拋出 `INSUFFICIENT_STOCK`（409）、數量維持原值，訊息為「庫存只剩 <n> 件」；兩者都更新 `carts.updated_at` 並回傳最新的 `Cart`（FR-002、FR-003、Edge Cases 數量超過庫存）
  - **Must Read**
    - `contracts/openapi.yaml` → `updateCartItemQuantity`、`removeCartItem` — Why：兩個操作的回應與錯誤碼
    - `spec.md` → FR-002、Edge Cases「數量超過庫存」 — Why：拒絕時錯誤訊息要寫出目前可購買的數量
- [ ] T020 [US1] 在 `backend/src/routes/cartRouter.js` 實作 `GET /api/cart`（`getCart`）、`POST /api/cart/items`（`addCartItem`，回 `201`）、`PATCH /api/cart/items/:itemId`（`updateCartItemQuantity`）、`DELETE /api/cart/items/:itemId`（`removeCartItem`），以 zod 驗證 `AddCartItemRequest`、`UpdateCartItemRequest` 與路徑參數 uuid（不符時回 `VALIDATION_FAILED`），四者都回最新的 `Cart`；在 `backend/src/server.js` 掛上此 router（FR-001、FR-002）
  - **Must Read**
    - `contracts/openapi.yaml` → `getCart`、`addCartItem`、`updateCartItemQuantity`、`removeCartItem` — Why：四個路由的路徑、請求、狀態碼與回應
    - `contracts/openapi.yaml` → `AddCartItemRequest`、`UpdateCartItemRequest` — Why：請求欄位與 `quantity` 最小值

### 前端（F1、F2）

- [ ] T021 [US1] 在 `frontend/src/composables/useCart.js` 實作模組層級共用的購物車狀態：`cart`、`itemCount`（各項數量總和）、`loading`、`updatingItemId`，以及 `load()`、`addItem()`、`updateQuantity()`、`removeItem()`，每個操作成功後以回應的 `Cart` 取代狀態，失敗時把 `ApiError` 拋給畫面（research §1）
  - **Must Read**
    - `research.md` → §1 — Why：購物車共用狀態放在 composable，不用 Pinia
    - `contracts/openapi.yaml` → `Cart`、`CartItem` — Why：狀態的資料結構
  - **Optional**
    - `ui/plan.md` → §3.3 A2 — Why：需要確認頁首件數要在加入成功後立即更新時
- [ ] T022 [P] [US1] 在 `frontend/src/components/VariantPicker.vue` 實作規格與數量選擇面板（ui/plan.md F1）：列出規格與單價，庫存為 0 的規格停用並標示「已售完」；選定規格後顯示「庫存剩 <n> 件」；尚未選規格時停用「加入購物車」並顯示「請先選擇規格」；數量大於庫存時顯示「<規格> 只剩 <n> 件」並停用按鈕；送出時按鈕改為「加入中…」並停用；`PRODUCT_UNAVAILABLE` 時在面板內顯示「這件商品剛剛下架了，無法加入購物車」，並通知商品列表把該商品改為已下架（FR-001、FR-003、Edge Cases 商品已下架、數量超過庫存）
  - **Must Read**
    - `ui/plan.md` → §3.3 A1、A2 — Why：本面板的使用者操作
    - `ui/plan.md` → §4 `index.html` 的「選擇規格中」「加入中」 — Why：各狀態的呈現
    - `ui/plan.md` → §5 `index.html` 的「未選規格」「規格已售完」「數量超過庫存」「加入時商品剛下架」 — Why：面板內的驗證與錯誤回饋
    - `ui/index.html` → 雛形狀態「選擇規格中」「加入中」 — Why：面板配置與文字的實際樣子
    - `contracts/openapi.yaml` → `addCartItem` — Why：呼叫的 API 與錯誤碼
- [ ] T023 [P] [US1] 在 `frontend/src/views/ProductListView.vue` 實作商品列表（ui/plan.md F1）：載入中以 4 張灰色骨架卡呈現；商品卡顯示線條圖示、名稱與價格；已下架商品卡片轉灰、標示「已下架」並停用按鈕；點選商品開啟 `VariantPicker`；加入成功後關閉面板，底部提示「已加入購物車」與「查看購物車」；商品與規格資料的取得方式待確認（見 Notes 待確認 2）（FR-001、SC-001、US1 情境 1）
  - **Must Read**
    - `ui/plan.md` → §4 `index.html` 的「載入中」「商品列表」「加入成功」 — Why：各狀態的呈現
    - `ui/plan.md` → §5 `index.html` 的「商品已下架」 — Why：已下架商品卡的呈現
    - `ui/index.html` → 雛形狀態「載入中」「商品列表」「加入成功」 — Why：商品卡與底部提示的實際樣子
    - `spec.md` → US1 情境 1 — Why：從商品列表加入購物車的預期結果
- [ ] T024 [P] [US1] 在 `frontend/src/views/CartView.vue` 實作購物車畫面（ui/plan.md F2）：載入中以骨架呈現；項目列顯示圖示、商品名稱、規格、單價、「−」「＋」數量（最小為 1）、小計與移除；更新中停用該列「−」「＋」並以轉圈取代數量；`INSUFFICIENT_STOCK` 時數量維持原值、該列下方顯示錯誤訊息；結帳區顯示件數、合計與「前往結帳」；購物車為空時顯示「購物車是空的」與「去逛逛」並隱藏結帳區；已下架商品的列轉灰並停用「前往結帳」的資料來源待確認（見 Notes 待確認 2）（FR-002、FR-003、US1 情境 2）
  - **Must Read**
    - `ui/plan.md` → §3.3 A3、A4 — Why：本畫面的使用者操作
    - `ui/plan.md` → §4 `cart.html` — Why：載入中、有商品、更新中與購物車是空的呈現
    - `ui/plan.md` → §5 `cart.html` — Why：數量超過庫存與已下架商品的回饋
    - `ui/cart.html` → 雛形狀態（全部） — Why：各狀態的實際樣子
    - `contracts/openapi.yaml` → `updateCartItemQuantity`、`removeCartItem` — Why：呼叫的 API 與錯誤碼
- [ ] T025 [US1] 在 `frontend/src/App.vue` 串接 US1 流程：啟動時呼叫 `useCart().load()`；頁首購物車件數綁定 `itemCount`；「商品」「購物車」導覽與加入成功提示的「查看購物車」切換畫面；購物車為空時的「去逛逛」回到 `products`
  - **Must Read**
    - `ui/plan.md` → §3.1、§3.2 — Why：商品列表與購物車之間的進入方式
  - **Optional**
    - `ui/plan.md` → §4 `index.html` 的「加入成功」 — Why：需要確認頁首件數加 1 的時機時

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 結帳付款 (Priority: P2)

**Goal**: 顧客填寫收件資料建立訂單，導向綠界付款頁付款；付款完成返回結帳頁後，付款結果自動更新顯示。

**Independent Test**: 購物車有商品時進入結帳，填寫收件人「林佳穎」、手機「0912345678」與收件地址並送出；確認建立待付款訂單並導向綠界測試付款頁；以測試信用卡付款後返回結帳頁，確認不重新整理就從「付款結果確認中」更新為「付款成功」，且同一筆付款通知重送不會重複更新訂單。

### 資料庫（D2）

- [ ] T026 [US2] 在 `backend/src/db/schema.sql` 建立 enum `order_status`（`pending_payment`、`paid`、`payment_failed`、`expired`）與 `payment_status`（`pending`、`succeeded`、`failed`），以及 `orders`：`id uuid [pk]`；`order_no varchar(20) [not null, unique]`「綠界 MerchantTradeNo，限 20 字元英數」；`customer_id uuid [not null]`；`status order_status [not null, default: 'pending_payment']`；`recipient_name varchar(50) [not null]`；`recipient_phone varchar(20) [not null]`；`shipping_address varchar(200) [not null]`；`total_amount integer [not null]`；`created_at timestamptz [not null, default: now()]`；索引 `(customer_id, created_at)` 名稱 `idx_orders_customer_created`；`order_items`：`id`、`order_id`、`variant_id`、`spec_label`「下單當下的規格快照」、`unit_price`「下單當下的單價快照」、`quantity`；`payments`：`id`、`order_id`、`ecpay_trade_no varchar(20) [unique]`「重複的付款通知以此去重」、`status payment_status [not null, default: 'pending']`、`amount`、`check_mac_verified boolean [not null, default: false]`、`notified_at timestamptz`、`created_at`，索引 `order_id` 名稱 `idx_payments_order`；`Ref: order_items.order_id > orders.id [delete: cascade]`、`Ref: order_items.variant_id > product_variants.id`、`Ref: payments.order_id > orders.id`；執行 `npm run db:reset` 確認建立成功
  - **Must Read**
    - `data/data-model.dbml` → `Enum order_status`、`Enum payment_status` — Why：兩個 enum 的值與每個值代表的情況
    - `data/data-model.dbml` → `Table orders`、`Table order_items`、`Table payments` — Why：欄位、快照欄位、`ecpay_trade_no` 唯一約束與索引
    - `data/data-model.dbml` → `Ref: order_items.order_id > orders.id`、`Ref: order_items.variant_id > product_variants.id`、`Ref: payments.order_id > orders.id` — Why：三個關聯與刪除行為

### 後端（B2、B3、B4、P1）

- [ ] T027 [P] [US2] 在 `backend/src/services/ecpayService.js` 實作綠界串接（P1）：`computeCheckMacValue(params)` 依 research §5 的步驟（參數依名稱排序、前後加上 `HashKey`／`HashIV`、URL encode 後轉小寫、SHA256 後轉大寫）產生檢查碼；`verifyCheckMacValue(params)` 以 `crypto.timingSafeEqual` 比對；`buildPaymentRedirect(order, items)` 組出 `{ action, fields }`，`action` 為 `ECPAY_PAYMENT_URL`，`fields` 含 `MerchantID`、`MerchantTradeNo`、`MerchantTradeDate`、`PaymentType=aio`、`TotalAmount`、`TradeDesc`、`ItemName`、`ReturnURL`（`<PUBLIC_BASE_URL>/api/payments/ecpay/notify`）、`ClientBackURL`（`<PUBLIC_BASE_URL>/?orderId=<orderId>`）、`ChoosePayment=ALL`、`EncryptType=1` 與 `CheckMacValue`（FR-005、NFR-001）
  - **Must Read**
    - `research.md` → §5 — Why：付款頁網址、必要欄位、CheckMacValue 演算法與返回網址的決策
    - `contracts/openapi.yaml` → `CreateOrderResponse` 的 `paymentRedirect` — Why：回傳給前端的表單格式
    - `contracts/openapi.yaml` → `EcpayPaymentNotification` — Why：要驗證的通知欄位
    - `spec.md` → NFR-001 — Why：付款通知必須驗證 CheckMacValue
  - **Optional**
    - `plan.md` → 系統介面盤點 — Why：需要確認 P1 綠界付款串接的需求依據時
- [ ] T028 [US2] 在 `backend/src/services/orderService.js` 實作 `createOrder(customerId, recipient)`：以 `withTransaction` 執行；購物車沒有項目拋出 `CART_EMPTY`（422）；以 `SELECT … FROM product_variants … FOR UPDATE` 鎖定購物車內的規格，商品已下架拋出 `PRODUCT_UNAVAILABLE`、庫存不足拋出 `INSUFFICIENT_STOCK`（409），訊息寫出商品、規格與剩餘數量並說明「訂單沒有建立」；通過後扣減 `stock_quantity`，以 `SC` 加 `yyyyMMdd` 加 5 碼英數產生 `order_no`，寫入 `orders`、`order_items`（規格與單價快照）與一筆 `pending` 的 `payments`，最後清空購物車項目（research §4、§5、FR-004、Edge Cases 數量超過庫存、商品已下架）
  - **Must Read**
    - `research.md` → §4 — Why：下單時在交易內鎖定規格、再次檢查並扣減庫存
    - `contracts/openapi.yaml` → `createOrder`（含 `Conflict`、`CartEmpty`） — Why：拒絕下單的情況與錯誤碼
    - `data/data-model.dbml` → `Table orders`、`Table order_items`、`Table payments` — Why：建立訂單時要寫入的欄位與快照
    - `spec.md` → US2 情境 1、FR-004 — Why：以收件資料與購物車內容建立待付款訂單
  - **Optional**
    - `research.md` → §5 — Why：需要確認 `order_no` 的格式與長度限制時
- [ ] T029 [US2] 在 `backend/src/routes/ordersRouter.js` 實作 `POST /api/orders`（`createOrder`）：以 zod 驗證 `CreateOrderRequest`，手機號碼先去掉「-」與空白再比對 `^09\d{8}$`，不符時回 `VALIDATION_FAILED`；呼叫 `orderService.createOrder()` 後以 `ecpayService.buildPaymentRedirect()` 組出付款資訊，回 `201` 與 `CreateOrderResponse`；在 `backend/src/server.js` 掛上此 router（FR-004、FR-005、US2 情境 2）
  - **Must Read**
    - `contracts/openapi.yaml` → `createOrder`、`CreateOrderRequest`、`CreateOrderResponse` — Why：請求欄位、`201` 回應與付款導向資訊
    - `ui/plan.md` → §5 `checkout.html` 的「手機號碼格式錯誤」 — Why：手機號碼的比對前要先去掉「-」與空白
- [ ] T030 [US2] 在 `backend/src/realtime/orderEvents.js` 實作 Socket.IO 事件：收到 `order:watch` 時查詢訂單，不存在時送出 `order:error`（`ORDER_NOT_FOUND`）、不屬於目前顧客時送出 `order:error`（`ORDER_FORBIDDEN`），通過後加入 room `order:<orderId>` 並立即送出一次目前的 `order:payment-updated`；匯出 `publishPaymentUpdated(orderId, paymentStatus, failureReason)` 對該 room 推播；訂單狀態轉成 `paymentStatus`：`pending_payment`→`pending`、`paid`→`paid`、`payment_failed`→`failed`、`expired`→`expired`（見 Notes 待確認 3）；在 `backend/src/server.js` 註冊（research §6、FR-007）
  - **Must Read**
    - `contracts/asyncapi.yaml` → `receiveOrderWatch`、`sendOrderPaymentUpdated`、`sendOrderError` — Why：訂閱、推播與錯誤三個事件的觸發條件
    - `contracts/asyncapi.yaml` → `OrderPaymentStatus`、`components.schemas.Error` — Why：推播內容與錯誤碼
    - `research.md` → §6 — Why：以 `order:<orderId>` room 推播，訂閱時先送一次目前狀態
    - `data/data-model.dbml` → `Enum order_status` — Why：轉換來源的狀態值
- [ ] T031 [US2] 在 `backend/src/services/orderService.js` 實作 `applyPaymentResult(notification)`：以 `withTransaction` 依 `MerchantTradeNo` 鎖定訂單；該訂單的 `payments.ecpay_trade_no` 已有值時視為重複通知，不改變任何資料並回 `{ changed: false }`；`RtnCode` 為 `1` 時 `payments` 設為 `succeeded`、訂單設為 `paid`，否則 `payments` 設為 `failed`、訂單設為 `payment_failed` 並回補庫存；兩種情況都寫入 `ecpay_trade_no`、`check_mac_verified = true` 與 `notified_at`（research §4、FR-006、Edge Cases 重複的付款通知）
  - **Must Read**
    - `contracts/openapi.yaml` → `receiveEcpayPaymentResult`、`EcpayPaymentNotification` — Why：通知欄位與重複通知的處理
    - `data/data-model.dbml` → `Table payments`（`ecpay_trade_no`、`check_mac_verified`）、`Enum order_status` — Why：去重依據與要更新的欄位
    - `spec.md` → FR-006、Edge Cases「重複的付款通知」 — Why：依付款結果更新訂單，重複通知不得重複入帳
    - `research.md` → §4 — Why：付款失敗時回補庫存
- [ ] T032 [US2] 在 `backend/src/routes/ecpayRouter.js` 實作 `POST /api/payments/ecpay/notify`（`receiveEcpayPaymentResult`）：先以 `ecpayService.verifyCheckMacValue()` 驗證，失敗時回 `400` `CHECKSUM_INVALID` 且不更新訂單；通過後呼叫 `orderService.applyPaymentResult()`，交易提交後若有變更則呼叫 `orderEvents.publishPaymentUpdated()`（失敗時帶 `RtnMsg` 為 `failureReason`）；最後回 `200` 純文字 `1|OK`；在 `backend/src/server.js` 掛上此 router（FR-006、FR-007、NFR-001）
  - **Must Read**
    - `contracts/openapi.yaml` → `receiveEcpayPaymentResult`（含 `ChecksumInvalid`） — Why：表單格式請求、`1|OK` 回應與驗證失敗的處理
    - `contracts/asyncapi.yaml` → `sendOrderPaymentUpdated` — Why：付款結果更新後推播給結帳頁
  - **Optional**
    - `research.md` → §6 — Why：需要確認推播要在交易提交後才送出時
- [ ] T033 [US2] 在 `backend/src/services/orderService.js` 實作 `expireOverdueOrders()`：把建立超過付款期限仍為 `pending_payment` 的訂單設為 `expired` 並回補庫存，交易提交後對每筆呼叫 `publishPaymentUpdated(orderId, 'expired')`；在 `backend/src/server.js` 以 `setInterval` 每分鐘執行一次（research §5、Edge Cases 付款逾時）
  - **Must Read**
    - `research.md` → §5 — Why：付款期限的長度
    - `research.md` → §4 — Why：逾時取消時回補庫存
    - `spec.md` → Edge Cases「付款逾時」 — Why：逾時後訂單取消、不會扣款
    - `contracts/asyncapi.yaml` → `sendOrderPaymentUpdated` — Why：逾時時推播 `expired`

### 前端（F3）

- [ ] T034 [P] [US2] 在 `frontend/src/api/orderSocket.js` 實作 `watchOrder(orderId, { onUpdate, onError })`：以 `io({ transports: ["websocket"] })` 連線後送出 `order:watch`，只處理 `orderId` 相符的 `order:payment-updated`，收到 `order:error` 時呼叫 `onError`；回傳取消訂閱並斷線的函式（research §6）
  - **Must Read**
    - `contracts/asyncapi.yaml` → `receiveOrderWatch`、`sendOrderPaymentUpdated`、`sendOrderError` — Why：要送出與訂閱的事件
    - `contracts/asyncapi.yaml` → `OrderPaymentStatus`、`components.schemas.Error` — Why：回呼收到的資料
  - **Optional**
    - `contracts/asyncapi.yaml` → `info.description` — Why：需要確認本合約與 HTTP 合約的分工時
- [ ] T035 [P] [US2] 在 `frontend/src/components/EcpayRedirectForm.vue` 實作自動送出的付款表單：以 `paymentRedirect.action` 為 `action`、`method="post"`，`fields` 逐一轉成 hidden input，元件掛載後立即 `submit()`，不修改任何欄位值（FR-005）
  - **Must Read**
    - `contracts/openapi.yaml` → `CreateOrderResponse` 的 `paymentRedirect` — Why：表單欄位要原樣送出
    - `ui/plan.md` → §4 `checkout.html` 的「前往綠界付款頁」 — Why：送出前的全頁過場
- [ ] T036 [US2] 在 `frontend/src/views/CheckoutView.vue` 實作結帳表單部分（ui/plan.md F3）：左側收件人姓名、手機號碼與收件地址，右側以 `useCart` 顯示訂單摘要；送出時驗證並以紅框與訊息標出錯誤欄位（「請填寫收件人姓名」「請輸入 09 開頭的 10 碼手機號碼」「請填寫收件地址」），焦點移到第一個錯誤欄位；送出中欄位停用、按鈕改為「建立訂單中…」；`INSUFFICIENT_STOCK`、`PRODUCT_UNAVAILABLE` 在頁頂顯示錯誤訊息與「回購物車」；購物車為空時不顯示表單，改顯示「購物車是空的，無法結帳」與「去逛逛」；建立成功後顯示全頁過場「正在前往綠界付款頁…」並掛上 `EcpayRedirectForm`（FR-004、FR-005、US2 情境 1、2）
  - **Must Read**
    - `ui/plan.md` → §3.3 A5、A6 — Why：本畫面的使用者操作
    - `ui/plan.md` → §4 `checkout.html` 的「填寫收件資料」「建立訂單中」「前往綠界付款頁」 — Why：各狀態的呈現
    - `ui/plan.md` → §5 `checkout.html` 的「收件人姓名空白」「手機號碼格式錯誤」「收件地址空白」「下單時庫存不足」「下單時商品已下架」「購物車為空」 — Why：驗證與錯誤回饋的文字
    - `ui/checkout.html` → 雛形狀態「填寫收件資料」「欄位驗證錯誤」「建立訂單中」「下單時庫存不足」「下單時商品已下架」「購物車為空」「前往綠界付款頁」 — Why：表單、摘要與錯誤提示的實際樣子
    - `contracts/openapi.yaml` → `createOrder` — Why：呼叫的 API 與錯誤碼
- [ ] T037 [US2] 在 `frontend/src/views/CheckoutView.vue` 實作付款結果部分：帶有 `orderId` 進入時不顯示表單，改顯示結果卡並以 `watchOrder()` 訂閱；`pending` 顯示轉圈與「付款結果確認中」及「結果會自動更新，請勿關閉此頁」；`paid` 顯示「付款成功」、訂單編號、付款金額與付款方式；`failed` 顯示「付款未完成」與 `failureReason`，說明未扣款；`expired` 顯示「已超過付款期限」，說明訂單已取消、不會扣款；結果卡提供「查看訂單」；離開畫面時取消訂閱（FR-006、FR-007、US2 情境 3、Edge Cases 付款逾時）
  - **Must Read**
    - `ui/plan.md` → §3.3 A7 — Why：等待付款結果自動更新的操作
    - `ui/plan.md` → §4 `checkout.html` 的「等待付款結果」「付款成功」 — Why：結果卡的呈現
    - `ui/plan.md` → §5 `checkout.html` 的「付款失敗」「付款逾時」 — Why：失敗與逾時的說明文字
    - `ui/checkout.html` → 雛形狀態「等待付款結果」「付款成功」「付款失敗」「付款逾時」 — Why：結果卡的實際樣子
    - `contracts/asyncapi.yaml` → `OrderPaymentStatus` — Why：四種付款狀態與 `failureReason`
  - **Optional**
    - `contracts/asyncapi.yaml` → `sendOrderError` — Why：需要處理訂單不存在或不屬於目前顧客的錯誤時
- [ ] T038 [US2] 在 `frontend/src/App.vue` 串接 US2 流程：購物車的「前往結帳」切到 `checkout`；啟動時網址帶有 `orderId`（綠界 `ClientBackURL` 返回）就直接切到 `checkout` 的付款結果，並以 `history.replaceState` 移除查詢參數；建立訂單成功後重新 `load()` 購物車；「回購物車」切到 `cart`
  - **Must Read**
    - `ui/plan.md` → §3.2 — Why：購物車、結帳、綠界付款頁與付款結果之間的轉換
    - `research.md` → §5 — Why：綠界付款後以 `ClientBackURL` 帶 `orderId` 返回
  - **Optional**
    - `research.md` → §1 — Why：需要確認不用路由時如何讀取返回網址時

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 查看訂單 (Priority: P3)

**Goal**: 顧客查看自己的訂單列表，展開單筆訂單的明細與付款狀態。

**Independent Test**: 準備已付款、待付款、付款失敗、已逾時各一筆訂單；開啟「我的訂單」，確認 4 筆訂單由新到舊排列並標示正確的付款狀態，展開後可看到下單當下的規格、單價與付款紀錄。

### 後端（B5）

> D2 的 `orders`、`order_items`、`payments` 已在 US2 建立，本故事沒有資料庫任務。

- [ ] T039 [US3] 在 `backend/src/services/orderService.js` 實作 `listOrders(customerId)`：依 `idx_orders_customer_created` 由新到舊查出該顧客的訂單，每筆附上 `order_items` 的規格與單價快照，以及 `payments` 的付款狀態與通知時間；回傳格式待 contracts 補上 B5 合約後再對齊（見 Notes 待確認 1）（FR-008、US3 情境 1）
  - **Must Read**
    - `data/data-model.dbml` → `Table orders`（`idx_orders_customer_created`）、`Table order_items`、`Table payments` — Why：要查詢的欄位與排序依據的索引
    - `spec.md` → US3 情境 1、FR-008 — Why：訂單明細與付款狀態要呈現哪些資訊
  - **Optional**
    - `plan.md` → 系統介面盤點 — Why：需要確認 B5 訂單查詢 API 的需求依據時
- [ ] T040 [US3] 在 `backend/src/routes/ordersRouter.js` 實作訂單查詢路由，呼叫 `orderService.listOrders(req.customerId)`；路徑、回應格式與錯誤碼待 contracts 補上 B5 合約後實作（見 Notes 待確認 1）（FR-008）
  - **Must Read**
    - `plan.md` → 系統介面盤點 — Why：B5 訂單查詢 API 的需求依據

### 前端（F4）

- [ ] T041 [P] [US3] 在 `frontend/src/views/OrdersView.vue` 實作我的訂單畫面（ui/plan.md F4）：載入中以灰色骨架訂單卡呈現；訂單由新到舊列出訂單編號、日期、金額與狀態標籤（「已付款」「待付款」「付款失敗」「已逾時」）；展開單筆訂單顯示訂單項目與付款紀錄；沒有訂單時顯示「還沒有訂單」與「去逛逛」；呼叫的 API 待確認（見 Notes 待確認 1）（FR-008、US3 情境 1）
  - **Must Read**
    - `ui/plan.md` → §3.3 A8 — Why：本畫面的使用者操作
    - `ui/plan.md` → §4 `orders.html` — Why：載入中、有訂單與沒有訂單的呈現
    - `ui/orders.html` → 雛形狀態（全部） — Why：訂單卡、狀態標籤與展開明細的實際樣子
    - `data/data-model.dbml` → `Enum order_status` — Why：四種訂單狀態與標籤文字的對應
- [ ] T042 [US3] 在 `frontend/src/App.vue` 串接 US3 流程：頁首「我的訂單」與付款結果卡的「查看訂單」切到 `orders`；沒有訂單時的「去逛逛」回到 `products`
  - **Must Read**
    - `ui/plan.md` → §3.1、§3.2 — Why：我的訂單的進入方式

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T043 [P] 在 `specs/004-shopping-cart-checkout/quickstart.md` 寫下本機啟動步驟：`docker compose up -d`、`npm run db:reset`、`npm run dev`（後端 `node --watch`、前端 Vite）、設定 `PUBLIC_BASE_URL` 讓綠界能送達付款通知，以及用綠界測試信用卡走完 US1～US3 的 Independent Test
  - **Must Read**
    - `spec.md` → US1、US2、US3 的 Independent Test — Why：手動驗證的步驟
    - `research.md` → §5 — Why：綠界測試環境與付款通知需要對外可連線的網址
  - **Optional**
    - `research.md` → §3、§8 — Why：需要確認資料庫容器與測試資料庫的啟動方式時
- [ ] T044 [P] 付款通知安全檢查：確認 `backend/src/routes/ecpayRouter.js` 在 `verifyCheckMacValue()` 通過前不讀寫資料庫；`ECPAY_HASH_KEY`、`ECPAY_HASH_IV` 只從環境變數讀取，沒有寫進程式碼、日誌或任何回應；以同一筆通知重送兩次，確認訂單與 `payments` 只更新一次（NFR-001、Edge Cases 重複的付款通知）
  - **Must Read**
    - `spec.md` → NFR-001、Edge Cases「重複的付款通知」 — Why：檢查標準
    - `research.md` → §5 — Why：HashKey、HashIV 的存放限制
- [ ] T045 [P] 以 Chrome DevTools 的 Network 面板量測加入購物車，從按下「加入購物車」到頁首件數更新在 1 秒內完成（SC-001）
  - **Must Read**
    - `spec.md` → SC-001 — Why：效能的檢查標準
- [ ] T046 [P] 以 Chrome DevTools 在 360px 與 1080px 寬度檢查四個畫面都能完整操作，配色與版面符合 ui/plan.md §2
  - **Must Read**
    - `ui/plan.md` → §2 — Why：配色與版面的檢查標準
- [ ] T047 在 `backend/` 與 `frontend/` 執行 `npm run check`（ESLint＋`prettier --check`），修正所有錯誤
  - **Must Read**
    - `research.md` → §8 — Why：`check` 命令包含的檢查項目
- [ ] T048 依 `specs/004-shopping-cart-checkout/quickstart.md` 走一次完整流程驗證
  - **Must Read**
    - `quickstart.md` — Why：T043 寫下的驗證步驟
    - `spec.md` → US1、US2、US3 的 Acceptance Scenarios — Why：逐條核對的預期結果

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US2 以 US1 的購物車為前提（要先有商品才能結帳），US3 以 US2 建立的訂單為前提，因此建議依 P1 → P2 → P3 循序進行
  - 前端與後端任務在同一個故事內可以平行（不同檔案）
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: 需要 US1 的 `cart_items` 與 `useCart` 才能建立訂單與顯示摘要；`schema.sql`（T026）擴充 T016
- **User Story 3 (P3)**: 需要 US2 的 `orders`、`order_items`、`payments`；`ordersRouter.js`（T040）擴充 T029，`App.vue`（T042）擴充 T038；B5 合約補上前，T039～T041 無法定案（Notes 待確認 1）

### Within Each User Story

- `schema.sql` → services → routes／推播 → 前端 composable 與 view → `App.vue` 串接
- `schema.sql`、`cartService.js`、`orderService.js`、`server.js`、`CheckoutView.vue`、`App.vue` 在同一故事內由多個任務修改，這些任務要循序進行
- Story complete before moving to next priority

### Parallel Opportunities

- Setup：T003～T007 可平行
- Foundational：資料庫 T008～T010 與後端 T012、前端 T014 可平行
- US1：T021 完成後，T022～T024（前端）可彼此平行，並可與 T017～T020（後端）同時進行
- US2：T027（綠界串接）可與 T026 同時開始；T034、T035 可與後端任務同時進行
- US3：T041 可與 T039、T040 同時進行
- Polish：T043～T046 可平行

---

## Parallel Example: User Story 1

```bash
# 後端與前端同時開工：
Task: "實作 addItem in backend/src/services/cartService.js"
Task: "實作規格與數量選擇面板 in frontend/src/components/VariantPicker.vue"
Task: "實作購物車畫面 in frontend/src/views/CartView.vue"
```

## Parallel Example: User Story 2

```bash
Task: "建立 orders、order_items、payments in backend/src/db/schema.sql"
Task: "實作綠界 CheckMacValue 與付款表單參數 in backend/src/services/ecpayService.js"
Task: "實作自動送出的付款表單 in frontend/src/components/EcpayRedirectForm.vue"
```

## Parallel Example: User Story 3

```bash
Task: "實作 listOrders in backend/src/services/orderService.js"
Task: "實作我的訂單畫面 in frontend/src/views/OrdersView.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 以 US1 的 Independent Test 驗證加入購物車與調整數量
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP：可以挑商品放進購物車)
3. Add User Story 2 → Test independently → Deploy/Demo（可以結帳並以綠界付款）
4. Add User Story 3 → Test independently → Deploy/Demo（可以查看訂單）
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done，每個故事依序進行，故事內分工：
   - Developer A：後端（`schema.sql`、services、routes、推播、綠界串接）
   - Developer B：前端（composable、views、`App.vue`）
3. 雙方以 contracts/openapi.yaml 與 contracts/asyncapi.yaml 為介面約定，故事完成後一起驗證

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- plan.md 的 Source Code 沒有列出 `backend/src/db/seed.sql`（T009），本 tasks.md 新增這個檔案；若要維持 plan.md 的結構，可改把開發用商品資料寫在 `schema.sql` 末端
- 待確認 1：plan.md 盤點了 B5 訂單查詢 API，但 contracts/openapi.yaml 只涵蓋 B1–B3，沒有 B5 的 operation；T039～T041 先依 plan.md 與 data-model 實作查詢，路徑與回應格式等 api-plan 補上 B5 合約後再定案
- 待確認 2：F1 商品列表需要商品、規格、單價、庫存與是否下架，但 plan.md 系統介面盤點沒有對應的後端介面，contracts 也沒有商品查詢的 operation；`CartItem` 也沒有商品是否下架的欄位，cart.html「購物車中有已下架商品」沒有資料來源。T023、T024 的這兩部分需回 system-analysis 補上介面後再實作
- 待確認 3：付款狀態命名不一致（DBML `order_status`：`pending_payment`、`paid`、`payment_failed`、`expired`；AsyncAPI `paymentStatus`：`pending`、`paid`、`failed`、`expired`）；T030 先以對應表轉換，若決定統一命名，需同步修改 T026、T030 與 contracts
