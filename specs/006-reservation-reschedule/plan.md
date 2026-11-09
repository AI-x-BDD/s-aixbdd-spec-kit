# Implementation Plan: 成員預約改期申請與改期成功前保留原預約 (Reservation Reschedule Request)

**Branch**: `006-reservation-reschedule` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-reservation-reschedule/spec.md`

## Project Structure

### Documentation (this feature)

```text
specs/006-reservation-reschedule/
├── spec.md                  # 成員預約改期申請與改期成功前保留原預約的功能需求規格
├── research.md              # 技術研究與選型決策紀錄
├── techstack.md             # 採用與不引入的技術堆疊總覽
├── plan.md                  # 本系統分析規劃文件
├── contracts/               # 後端介面合約
│   └── openapi.yaml         # 驗證碼登入、設備時段狀態與預約、成員預約查詢取消與改期申請、管理員審核（含改期申請）與現場領取歸還、設備審核設定的 HTTP 合約（OpenAPI 3.1）
├── data/                    # 資料模型
│   └── data-model.dbml      # 使用者帳號、驗證碼挑戰、工作階段、設備、固定時段、預約借還紀錄與改期申請的 PostgreSQL 資料模型（DBML）
└── ui/                      # 前端畫面規劃與雛形
    ├── plan.md              # 畫面範疇、視覺風格、畫面與流程、狀態、驗證與錯誤回饋
    └── index.html           # 可互動雛形入口，其餘頁面依畫面流程決定
```

### Source Code (repository root)

```text
apps/equipment-loan/
├── docker-compose.yml               # 開發與測試用 PostgreSQL 18 容器設定
├── README.md                        # 系統啟動、資料庫遷移、demo seed 重設與測試執行說明
├── package.json                     # 根目錄整合腳本與跨前後端 Playwright E2E 測試設定
├── playwright.config.ts             # Playwright 端對端測試設定
├── e2e/                             # 跨前後端端對端測試（即時改期、改期審核與衝突、本人改期審核中標示、撤回與前三版回歸）
├── frontend/
│   ├── package.json                 # 前端套件與腳本設定
│   ├── tsconfig.json                # 前端 TypeScript 6.0 設定
│   ├── vite.config.ts               # Vite 8 開發伺服器與 /api 代理設定
│   ├── index.html                   # React 19 應用程式掛載頁
│   ├── src/
│   │   ├── main.tsx                 # 前端應用程式入口
│   │   ├── App.tsx                  # 登入狀態守門、頂部導覽、主題切換與成員／管理員頁籤切換
│   │   ├── api/
│   │   │   └── client.ts            # 封裝 Bearer token、預約借還、改期申請、審核、領取／歸還與設備審核設定 API 呼叫的 HTTP 客戶端
│   │   ├── text/
│   │   │   └── zh-TW.ts             # 臺灣繁體中文介面文字、預約 6 態與改期申請 5 態標籤及後端錯誤碼對應表
│   │   ├── views/
│   │   │   ├── LoginView.tsx        # 帳號密碼與驗證碼登入頁
│   │   │   ├── EquipmentBookingView.tsx # 設備清單、7 天內日期與固定時段狀態（含本人改期審核中）及預約申請視圖
│   │   │   ├── MyReservationsView.tsx   # 目前借用中設備、預約清單、申請改期對話框、改期紀錄與撤回、取消操作視圖
│   │   │   └── AdminOverviewView.tsx    # 設備審核設定、待審預約與改期申請（核准／駁回）、全體預約借還管理（登記領取／歸還）視圖
│   │   └── components/
│   │       ├── CaptchaBox.tsx       # 驗證碼顯示與重整元件
│   │       ├── SlotStatusBadge.tsx  # 固定時段狀態標籤（含本人改期審核中）
│   │       └── RescheduleDialog.tsx # 選擇同一設備 7 天內新時段並送出改期的對話框元件
│   └── tests/
│       └── unit/                    # 前端元件、狀態標籤與繁體中文錯誤訊息對應單元測試
└── backend/
    ├── package.json                 # 後端套件與腳本設定
    ├── tsconfig.json                # 後端 TypeScript 6.0 設定
    ├── .env.example                 # PostgreSQL 連線字串與伺服器埠號範例
    ├── prisma.config.ts             # Prisma 7 連線與設定檔
    ├── prisma/
    │   ├── schema.prisma            # 資料表、預約與改期申請狀態 Enum 及部分唯一索引定義（含 partialIndexes）
    │   ├── migrations/              # 資料庫結構無損遷移檔
    │   └── seed.ts                  # 預建帳號、設備、固定時段、預約 6 態與改期申請 5 態範例的 demo seed 腳本
    ├── src/
    │   ├── server.ts                # Express 5 HTTP 伺服器啟動入口
    │   ├── app.ts                   # Express 應用程式組裝、路由掛載與統一錯誤處理
    │   ├── db/
    │   │   └── prisma.ts            # Prisma Client（搭配 @prisma/adapter-pg）單例
    │   ├── utils/
    │   │   ├── password.ts          # 密碼雜湊與比對工具
    │   │   ├── captcha.ts           # 驗證碼產生器
    │   │   └── taipeiTime.ts        # Asia/Taipei 當日日期、7 天範圍與固定時段開始結束時間判斷
    │   ├── middleware/
    │   │   ├── authMiddleware.ts    # Bearer session token 驗證與管理員角色檢查中介層
    │   │   └── errorHandler.ts      # 統一錯誤回應格式中介層
    │   ├── routes/
    │   │   ├── authRouter.ts        # /api/auth 驗證碼、登入、登出與目前使用者路由
    │   │   ├── equipmentsRouter.ts  # /api/equipments 設備與固定時段狀態查詢路由
    │   │   ├── reservationsRouter.ts # /api/reservations 建立預約、本人紀錄查詢、取消與送出改期申請路由
    │   │   ├── rescheduleRequestsRouter.ts # /api/reschedule-requests 成員撤回改期申請路由
    │   │   └── adminRouter.ts       # /api/admin 審核設定、待審預約與改期申請清單、核准／駁回、登記領取與歸還路由
    │   └── services/
    │       ├── authService.ts       # 驗證碼、帳號密碼驗證與工作階段服務
    │       ├── equipmentService.ts  # 設備清單、固定時段狀態組裝（含本人改期審核中）與審核設定切換服務
    │       ├── reservationService.ts # 預約建立、核准駁回、取消、登記領取與歸還服務（取消與領取時使改期申請失效）
    │       └── rescheduleService.ts # 改期送出、即時改期、核准、駁回、撤回與到期惰性失效服務
    └── tests/
        ├── unit/                    # 台灣時區時段判斷與改期條件檢查單元測試
        └── integration/             # 改期成功與拒絕路徑、並發占用、自動失效、角色權限與前三版回歸之 Supertest + PostgreSQL 整合測試
```

**Structure Decision**: 依使用者指定「沿用 `specs/005-equipment-pickup-return/plan.md` 的專案結構（`apps/equipment-loan/`）」與 `research.md` §1–§5 的決策，維持 `frontend/`（React 19 + Vite 8 + TypeScript 6.0）與 `backend/`（Node.js 24 LTS 以上 + Express 5 + Prisma 7.10）兩個頂層目錄，以及 `apps/equipment-loan/` 層的 `docker-compose.yml`、`README.md` 與 Playwright `e2e/`；本次只在既有模組內新增改期申請的路由、服務與前端對話框元件，research §3 決定不引入排程器，所以不新增背景工作目錄。

## 分析流程規劃

### 系統介面盤點

本次需求涉及 3 種技術端點：前端、後端、資料庫，共盤出 12 個介面。

| 編號 | 介面 | 端點類型 | 需求依據 |
| --- | --- | --- | --- |
| F1 | 驗證碼與帳號密碼登入登出介面 | 前端（使用者 → 前端） | FR-015 完整保留並向下相容前三次迭代已實作的登入功能；SC-006 前三次迭代既有功能回歸測試通過率達 100% |
| F2 | 設備時段狀態與預約介面（含本人改期審核中標示） | 前端（使用者 → 前端） | US1 情境 2；US2 情境 1；US3 情境 8；FR-017 改期審核中申請的新時段對本人標示「本人改期審核中」，對其他成員仍顯示「可預約」；FR-002 即時改期成功後原時段對其他成員顯示「可預約」；NFR-001 介面文字使用臺灣繁體中文 |
| F3 | 成員預約清單、申請改期、改期紀錄與撤回介面 | 前端（使用者 → 前端） | US1 情境 1、3–5、7；US3 情境 1–3、6；FR-001 只對原時段尚未開始的「已核准／有效」預約顯示「申請改期」，並只接受同一設備 7 天內可用的新時段；FR-002 免審核設備送出後即時改期，失敗時原預約不變；FR-003 需人工審核設備送出後建立改期審核中申請；FR-004 已有改期審核中申請時拒絕再送出並提示先撤回；FR-009 顯示改期紀錄 5 種狀態與「改期審核中」標示；FR-010 撤回改期審核中申請；FR-013 取消原預約時改期申請一併失效；NFR-001 繁體中文錯誤提示；NFR-002 操作回應低於 2 秒 |
| F4 | 管理員改期申請審核、待審預約與現場領取歸還介面 | 前端（使用者 → 前端） | US2 情境 3–8；US3 情境 7；FR-005 待審清單列出「改期申請」與原／新日期時段，提供核准與選填 200 字駁回原因；FR-006 核准成功時預約改到新時段，新時段被占用時顯示衝突並維持改期審核中；FR-007 駁回後顯示「改期被駁回」；FR-008 切換設備審核設定後改期審核中申請仍留在待審清單；FR-016 登記領取有改期審核中申請的預約時，申請一併失效；NFR-001 繁體中文介面與錯誤提示 |
| B1 | 驗證碼挑戰與登入工作階段 API | 後端（前端 → 後端） | FR-015 保留前三次迭代的驗證碼登入與工作階段；SC-006 既有功能回歸 100% 通過 |
| B2 | 設備時段狀態查詢與預約建立 API | 後端（前端 → 後端） | US3 情境 8；FR-017 對申請人本人回傳改期審核中的新時段狀態，對其他成員仍回傳可預約；FR-014 新預約與改期同時占用同一時段時只有一筆成功；FR-011、FR-012 查詢時段前先讓到期的改期申請失效；Edge Cases 同時搶同一新時段 |
| B3 | 成員預約查詢、取消與改期申請送出、撤回 API | 後端（前端 → 後端） | US1 情境 1–7；US2 情境 1–2；US3 情境 1–3、6；FR-001 檢查可改期的預約狀態與新時段條件；FR-002 免審核設備在同一交易內即時改期並建立「改期成功」紀錄；FR-003 需人工審核設備建立改期審核中申請且不保留新時段；FR-004 同一預約最多一筆改期審核中申請；FR-009 回傳每筆預約的改期紀錄；FR-010 撤回改期審核中申請；FR-013 取消預約時使改期申請失效；FR-014 並發占用只有一筆成功；NFR-002 回應低於 2 秒；SC-001、SC-002 原預約變動率 0%；SC-003 時段重複占用 0% |
| B4 | 管理員待審清單（含改期申請）與核准駁回 API | 後端（前端 → 後端） | US2 情境 3–8；US3 情境 4–5；FR-005 列出改期審核中申請並限管理員核准駁回；FR-006 核准時重檢申請狀態、原預約狀態、兩個時段尚未開始與新時段未被占用；FR-007 駁回並記錄原因；FR-008 切換審核設定不影響已送出的改期申請；FR-011、FR-012 原時段或新時段開始時申請自動失效、拒絕核准；SC-004 到期申請 100% 失效、核准成功率 0%；SC-006 一般成員呼叫 100% 被拒絕；Edge Cases 核准時新時段已被他人占用、審核中原時段開始、新時段比原時段早 |
| B5 | 管理員現場登記領取與登記歸還 API | 後端（前端 → 後端） | US3 情境 4、7；FR-016 登記領取有改期審核中申請的預約時，同一交易內使申請失效；FR-011 原時段開始後原預約仍可依 005 規則登記領取；FR-015 保留 005 的領取與歸還規則；Edge Cases 審核中提前登記領取原預約 |
| B6 | 管理員設備人工審核設定切換 API | 後端（前端 → 後端） | US2 情境 7；FR-008 切換後新送出的改期依最新設定決定即時改期或進入改期審核；FR-015 保留審核設定切換功能 |
| D1 | 帳號、驗證碼挑戰與工作階段資料存取 | 資料庫（後端 → PostgreSQL） | Key Entities 使用者帳號；FR-005 依角色限制管理員核准駁回改期申請；FR-015 保留前三次迭代的帳號、驗證碼與工作階段資料 |
| D2 | 預約借還紀錄與改期申請持久化 | 資料庫（後端 → PostgreSQL） | Key Entities 預約與借用紀錄、改期申請、設備、固定時段定義；FR-002、FR-006 改期成功時更新原預約的日期與時段，預約編號與狀態不變；FR-004 同一預約最多一筆改期審核中申請；FR-009 保存改期申請 5 種狀態、原／新日期時段、審核與失效資訊；FR-014 同一設備時段占用唯一；FR-015 無損遷移既有預約並擴充改期 demo seed；SC-003 時段重複占用 0% |

### 分析流程安排

本次規劃 2 個 Wave。

**Wave 1：前端**

- 涵蓋介面：F1、F2、F3、F4
- 排序理由：US1 到 US3 都從成員在「我的預約」與「設備預約」頁面的操作，以及管理員在待審清單的審核開始；前端先確定申請改期對話框、改期紀錄的狀態與欄位、「本人改期審核中」標示，以及管理員改期申請的核准駁回互動，後端與資料庫才能據此對齊 API 與資料結構。

**Wave 2：後端、資料庫（2 個 Sub-agent 平行分析）**

- 涵蓋介面：B1、B2、B3、B4、B5、B6；D1、D2
- 依賴：後端依 Wave 1 確定的改期送出、撤回、核准、駁回操作與畫面需要的改期紀錄欄位設計 REST API 合約；資料庫依 Wave 1 確定的改期紀錄顯示資訊，搭配 `spec.md` 的 Key Entities 設計改期申請資料表與唯一約束。
- 排序理由：後端與資料庫都只依賴 Wave 1 的前端分析結果；改期申請的狀態、唯一約束與交易作法已在 `spec.md` 與 `research.md` §1–§3 定義，兩者之間沒有先後依賴，所以放在同一個 Wave 平行分析。
