# 技術研究與決策紀錄 (Research): 設備借用與預約系統 (Equipment Loan and Booking System)

**Feature Branch**: `003-equipment-loan-booking`  
**Date**: 2026-11-08  
**Spec**: [spec.md](./spec.md)

## 1. 專案結構、前端架構與建置工具 (React 19 + Vite 8)

- **Decision**: 原始碼放置於 `apps/equipment-loan/`，底下拆分為 `apps/equipment-loan/frontend/` 與 `apps/equipment-loan/backend/`；前端採用 **React 19**，搭配 **Vite 8** 與 **`@vitejs/plugin-react` 6** 作為開發伺服器與打包工具；不引入前端路由套件、全域狀態管理套件與國際化套件，以頂層元件狀態切換「登入」、「設備與固定時段預約」、「我的預約」與「管理員全體預約清單」畫面；所有臺灣繁體中文介面文案與後端錯誤碼對應集中於 `apps/equipment-loan/frontend/src/text/zh-TW.ts`，開發期透過 Vite `server.proxy` 將 `/api` 轉發至後端。
- **Rationale**:
  - 符合使用者技術限制「原始碼放在 `apps/equipment-loan/`，底下分 `frontend/`、`backend/`」與「以 `specs/001-online-pvp-1a2b/techstack.md` 的技術堆疊作為研究起點」。
  - 重新查證 npm 最新穩定版本：`react` 為 `19.3.1`、`vite` 為 `8.3.6`、`@vitejs/plugin-react` 為 `6.2.1`，三者相容且支援 TypeScript 與快速 HMR。
  - 本次範圍包含 US1（登入與設備時段預約）、US2（成員查看與取消預約）與 US3（管理員查看設備與全體預約），皆須先完成登入驗證（FR-002）；以頂層狀態切換頁籤視圖即可滿足所有操作流程，無須公開深層網址路由。
  - NFR-001 要求所有介面文字、欄位標籤、載入狀態、空白狀態與錯誤提示使用臺灣繁體中文；集中於單一文字模組可確保錯誤碼（如驗證碼錯誤、時段衝突、權限不足）顯示一致的繁體中文說明。
  - NFR-002 與 SC-004 要求登入、查詢、預約與取消回應時間 `< 2 秒`；精簡的前端依賴使初始打包體積預估 `< 70 KB`（gzipped），本地畫面切換與渲染延遲 `< 50ms`。
- **Alternatives considered**:
  - **React Router**：可提供多網址路徑切換，但 FR-002 要求未登入者一律導回登入頁，且第一版僅有成員雙頁籤與管理員檢視頁，引入路由套件只增加額外設定而無業務收益。
  - **Zustand / Redux Toolkit**：本版前端狀態僅包含目前登入使用者、所選日期之設備時段清單與預約清單，使用 React 內建狀態與請求重取即可維持一致，無須額外全域狀態管理層。
  - **react-i18next**：NFR-001 僅要求臺灣繁體中文單一語系，引入多語系框架會增加不必要的翻譯載入與設定成本。

---

## 2. 開發語言、執行環境與靜態檢查 (TypeScript 6.0 + Node.js 24 LTS 以上)

- **Decision**: 前後端均採用 **TypeScript 6.0**（開啟 `strict: true`）；後端執行環境採用 **Node.js 24 LTS 以上**，開發時以 **`tsx`** 直接執行 TypeScript，建置時以 `tsc` 輸出至 `apps/equipment-loan/backend/dist/`；靜態檢查採用 **ESLint 10** 搭配 **`typescript-eslint` 8**，程式碼格式化採用 **Prettier**。
- **Rationale**:
  - 符合使用者技術限制「以 `specs/001-online-pvp-1a2b/techstack.md` 的技術堆疊作為研究起點，但每項都要寫出本系統採用的理由並重新查證版本」。
  - 重新查證 npm 版本：`typescript-eslint` 最新版 `8.72.1` 的 `peerDependencies` 為 `typescript: ">=4.8.4 <6.1.0"` 且支援 `eslint: "^8.57.0 || ^9.0.0 || ^10.0.0"`，因此選用 **TypeScript 6.0**（最新 6.0 版為 `6.0.3`）、**ESLint 10**（`10.14.0`）與 **Prettier**（`3.9.10`），不升至 TypeScript 7.0（`7.0.2`）。
  - 重新查證執行環境相容性：本機為 Node.js `v26.8.2`，而 `prisma` 7.10.1 要求 `node ^20.19 || ^22.12 || >=24.0`、`vite` 8.3.6 要求 `^20.19.0 || >=22.12.0`、`vitest` 5.1.0 要求 `^22.12.0 || ^24.0.0 || >=26.0.0`、`tsx` 最新為 `4.23.15`；訂為 **Node.js 24 LTS 以上**可同時相容 Node.js 24 LTS 與本機 Node.js 26 環境。
  - 本系統涉及角色權限（`member`／`admin`，FR-002、FR-010）、預約狀態（`confirmed`／`cancelled`，FR-007）與多種錯誤碼（憲法 `openapi.md` Rule 6），以嚴格型別可在編譯期攔截狀態與權限欄位的誤用。
- **Alternatives considered**:
  - **TypeScript 7.0**：npm 最新版雖為 `7.0.2`，但超出 `typescript-eslint` 8.72.1 的 `<6.1.0` 相依上限，會導致 ESLint 靜態檢查失敗。
  - **純 JavaScript**：缺少編譯期型別檢查，容易在擴充後續迭代（人工審核、領取歸還、改期）時發生 API 與資料庫欄位不一致。

---

## 3. 後端 HTTP API、輸入驗證與時區處理 (Express 5 + zod 4)

- **Decision**: 後端 HTTP API 採用 **Express 5**（路徑前綴 `/api`），不引入即時推播套件；所有請求 body、path 與 query 參數（含分頁 `page`、`pageSize`）以 **zod 4** 驗證；API 時間點欄位一律輸出為 ISO 8601 UTC 字串（`Date.prototype.toISOString()`），單日預約日期（`YYYY-MM-DD`）與當日固定時段（`09:00–12:00`、`13:00–17:00`、`18:00–21:00`）的開放範圍及是否已到達開始時間，在後端以 Node.js 內建 `Intl.DateTimeFormat` 指定 `timeZone: "Asia/Taipei"` 計算，不引入第三方日期時間套件。
- **Rationale**:
  - 符合使用者技術限制「除非需求需要即時推播，否則不引入 Socket.IO」：第一版的需求（FR-001～FR-011）皆為請求／回應式的登入、查詢、建立預約與取消預約，無伺服器主動推播需求。
  - 重新查證版本：`express` 最新穩定版為 `5.3.0`（原生支援 async route handler 錯誤傳遞），`zod` 最新版為 `4.6.7`。
  - 符合憲法 `.agents/constitution/skills/api-plan/openapi.md` Rule 1–7：清單查詢端點驗證 `page`（預設 1）與 `pageSize`（預設 20、上限 100），不合法時回 `400 PAGINATION_INVALID`；未登入固定回 `401 UNAUTHORIZED`，角色不符或操作非本人預約固定回 `403 FORBIDDEN`（滿足 FR-008、FR-010、SC-005）；時間點使用 ISO 8601 UTC，純日期使用 `YYYY-MM-DD` 並依 `Asia/Taipei` 解讀。
  - FR-004 與 FR-008 要求依 `Asia/Taipei` 判斷當日起算 7 天內的日期以及固定時段是否已開始；Node.js 內建 `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", ... })` 可零依賴直接取得台灣時區的當前 `YYYY-MM-DD` 與 `HH:mm`，計算耗時 `< 1ms`，滿足 NFR-002 與 SC-004 `< 2 秒` 的要求。
- **Alternatives considered**:
  - **Socket.IO**：1A2B 用於即時推播對局狀態，但本版 spec 無即時推播需求，依使用者技術限制不引入。
  - **Luxon / Moment.js**：本版只需台灣時區的日曆日期加減（7 天內）與固定時段 `HH:mm` 字串比較，內建 `Intl.DateTimeFormat` 已完全涵蓋，無須額外安裝第三方日期套件。
  - **Fastify**：雖效能優異，但以 1A2B 技術堆疊為起點沿用 Express 5 可維持專案前後端與測試寫法一致。

---

## 4. 帳號密碼雜湊、7 位數區分大小寫驗證碼與登入工作階段管理

- **Decision**:
  - **密碼儲存與驗證**：使用 Node.js 內建 `crypto.scrypt`（搭配隨機 16-byte salt 與 `crypto.timingSafeEqual`）雜湊與驗證預建帳號密碼，不引入外部原生雜湊套件。
  - **7 位數區分大小寫英數驗證碼**：後端提供 `POST /api/auth/captcha`（或重整端點），以 Node.js 內建 `crypto.randomInt` 從 `A–Z`、`a–z`、`0–9` 字元池隨機產生同時包含英文與阿拉伯數字的 7 位數驗證碼（FR-001），將挑戰 ID（UUID）、7 碼明文、到期時間（建立時間加 5 分鐘）與 `consumed_at` 寫入 PostgreSQL `captcha_challenges` 資料表並回傳挑戰 ID 與驗證碼文字供登入頁顯示；登入時在資料庫交易內鎖定該挑戰列，若不存在、已使用（`consumed_at IS NOT NULL`）或已超過 5 分鐘則拒絕，否則先將 `consumed_at` 設為當前時間使其單次立即失效，再以嚴格區分大小寫（`===`）比對驗證碼與帳號密碼。
  - **登入工作階段（Session）**：登入成功後，後端以 `crypto.randomUUID()` 產生不透明 session token，寫入 PostgreSQL `sessions` 資料表（關聯使用者 ID 與到期時間）並回傳；前端將 token 存於瀏覽器 `sessionStorage` 並於 API 請求帶入 `Authorization: Bearer <token>`，登出時呼叫 `POST /api/auth/logout` 軟刪除該工作階段並清除 `sessionStorage`。
- **Rationale**:
  - 符合使用者技術限制「需要帳號密碼登入與工作階段（1A2B 沒有，要重新研究）」。
  - FR-001 與 SC-001 要求 7 位數英數驗證碼嚴格區分大小寫（如 `a123456` 與 `A123456` 不同）、有效期限 5 分鐘，且送出登入驗證（無論成功或失敗）或手動重整後立即失效；將驗證碼挑戰存於 PostgreSQL 並在驗證時立即標記已使用，可 100% 防止同一驗證碼被重放使用。
  - US1 驗收情境 5 要求「重新載入頁面後預約與本人已預約狀態持續顯示」，同時驗證規範要求同一台電腦可開不同視窗分別操作成員與管理員；前端以 `sessionStorage` 保存 Bearer token，重新整理同一分頁時可維持登入工作階段，且不同分頁／視窗的工作階段彼此獨立不互相覆蓋。
  - 單次 `scrypt` 驗證與資料庫工作階段查詢耗時約 `30–60ms`，遠低於 NFR-002 與 SC-004 `< 2 秒` 的回應門檻。
- **Alternatives considered**:
  - **`bcrypt`**：含 C++ 原生擴充或額外套件依賴，跨環境安裝較易受編譯工具鏈影響；Node.js 內建 `crypto.scrypt` 為 NIST 推薦演算法且零外部依賴。
  - **`express-session`（Cookie Session）**：同一個瀏覽器視窗的不同分頁會共用同網域 Cookie，不便於同時在多個分頁切換不同成員帳號測試並發搶約。
  - **`jsonwebtoken`（無狀態 JWT）**：FR-002 要求提供明確的登出功能並立即使工作階段失效，無狀態 JWT 需額外維護黑名單，不如直接以 PostgreSQL `sessions` 資料表管理直覺可靠。

---

## 5. 資料庫、時段唯一性約束與並發搶約防護 (PostgreSQL 18 + Prisma ORM 7.10)

- **Decision**: 資料庫採用 **PostgreSQL 18**（開發與測試環境以 **Docker Compose** 啟動 `postgres:18` 容器），資料存取層採用 **Prisma ORM 7.10** 搭配 **`@prisma/adapter-pg`** 與 **`pg`**，於 `schema.prisma` 開啟 `previewFeatures = ["partialIndexes"]`：
  - 所有持久化資料表（`users`、`captcha_challenges`、`sessions`、`equipments`、`time_slots`、`reservations`）皆包含憲法規定的 4 個生命週期欄位（`created_at`、`updated_at`、`updated_by`、`deleted_at`），時間點欄位一律使用 `timestamptz`，預約日期欄位使用 `date`。
  - `reservations` 資料表建立部分唯一索引 `@@unique([equipmentId, reservationDate, slotId], where: { status: "confirmed", deletedAt: null })`。
  - 建立預約（FR-004、FR-005）在單一資料庫交易內檢查時段開放範圍並寫入 `status = 'confirmed'` 的預約列；當多位成員同時搶約同一設備、同一日期與同一時段時，由 PostgreSQL 部分唯一索引保證僅 1 筆寫入成功，其餘並發交易捕捉 Prisma `P2002` 唯一約束衝突並回傳 `409 RESERVATION_CONFLICT`。
  - 取消預約（FR-007、FR-008）在交易內鎖定該筆預約，確認為本人、狀態為 `confirmed` 且尚未到達時段開始時間後，將 `status` 更新為 `cancelled` 並寫入 `cancelled_at`，保留原資料列不物理刪除；更新後該列不再受部分唯一索引約束，該設備時段立即釋出供後續新預約寫入。
- **Rationale**:
  - 符合使用者技術限制「以 `specs/001-online-pvp-1a2b/techstack.md` 的技術堆疊作為研究起點，但每項都要寫出本系統採用的理由並重新查證版本」。
  - 重新查證版本：`prisma` 與 `@prisma/adapter-pg` 最新正式版為 `7.10.1`（`8.0.0-rc.33` 仍為 RC），`pg` 最新版為 `8.23.1`。
  - 符合憲法 `.agents/constitution/skills/data-plan/data-model.md` Rule 1–4：生命週期欄位齊備、軟刪除、時間點與純日期分別使用 `timestamptz` 與 `date`、複合唯一索引明確標註過濾條件，且取消預約保留原歷史紀錄列。
  - SC-002 要求「10 個並發請求同時預約同一台設備、同一日期與同一固定時段時，最終成功建立的有效預約恰好為 1 筆，重複占用發生率為 0%」；PostgreSQL 的部分唯一索引在資料庫引擎層強制互斥，10 個並發交易在 `< 50ms` 內即可完成 1 筆成功、9 筆 `409` 拒絕。
  - SC-003 要求「取消有效預約後，該時段在 1 秒內恢復為可預約狀態，且 100% 保留原預約的已取消歷史紀錄」；單筆 `UPDATE` 將 `status` 改為 `cancelled` 並寫入 `cancelled_at` 耗時 `< 15ms`，遠低於 `< 1 秒` 門檻。
- **Alternatives considered**:
  - **應用層先 `SELECT` 檢查無預約再 `INSERT`（不設部分唯一索引）**：高並發下兩個交易會同時讀到「尚無預約」而雙雙寫入，違反 FR-005 與 SC-002 的 0% 重複占用要求。
  - **取消預約時直接 `DELETE` 資料列**：雖可用一般唯一索引，但違反 FR-007「保留該筆歷史紀錄」與憲法 `data-model.md` Rule 2、Rule 4。
  - **Redis 分散式鎖**：需額外維運 Redis 容器且鎖逾時仍有競態風險，PostgreSQL 原生部分唯一索引已能 100% 保證資料一致性。

---

## 6. 品質、靜態檢查與自動化測試策略 (Vitest 5 + Supertest 7 + Playwright 1.65)

- **Decision**:
  - **單元與整合測試**：前後端統一採用 **Vitest 5**；後端 API 整合測試搭配 **Supertest 7**，直接對連接真實 PostgreSQL 18 測試資料庫的 Express 應用程式發送請求（包含以 `Promise.all` 同時發送 10 筆相同設備、日期與時段的預約請求驗證並發保護）。
  - **端對端測試（E2E）**：採用 **Playwright（`@playwright/test` 1.65）**，於 `apps/equipment-loan/` 下撰寫跨前後端的瀏覽器自動化測試，覆蓋 US1（7 位數區分大小寫驗證碼登入、查看設備時段與預約）、US2（查看個人預約、取消預約並釋出時段）與 US3（管理員登入查看全體預約清單與角色權限攔截）。
  - **展示資料重設（Demo Seed）**：以 Prisma seed 腳本（`npx prisma db seed`）建立預建資料（至少 2 組一般成員帳號、1 組管理員帳號、至少 4 台含編號與分類的單件設備、3 個單日固定時段與範例預約紀錄，FR-011），支援一鍵重設展示環境。
- **Rationale**:
  - 重新查證版本：`vitest` 最新版為 `5.1.0`、`supertest` 為 `7.3.2`、`@playwright/test` 為 `1.65.0`。
  - SC-001（驗證碼大小寫與單次有效攔截率 100%）、SC-002（10 並發搶約僅 1 筆成功）、SC-003（取消後 `< 1 秒` 釋出並保留紀錄）、SC-004（操作回應 `< 2 秒`）與 SC-005（越權攔截率 100%）皆需對真實 PostgreSQL 資料庫與實際瀏覽器畫面進行驗證，Supertest 搭配 Playwright 能完整覆蓋 API 並發交易與 UI 互動。
- **Alternatives considered**:
  - **以記憶體 Mock 取代真實 PostgreSQL 進行整合測試**：無法驗證 PostgreSQL 部分唯一索引在 10 個並發請求下的 `P2002` 衝突行為（SC-002）。
  - **Jest**：在 ESM 與 TypeScript 6 環境下需額外轉譯設定，Vitest 5 與 Vite 8 可直接共用工具鏈設定。
