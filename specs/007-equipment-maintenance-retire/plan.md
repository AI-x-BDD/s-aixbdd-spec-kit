# Implementation Plan: 設備送修與停用、恢復可用及受影響未來預約的處理 (Equipment Maintenance and Retirement)

**Branch**: `007-equipment-maintenance-retire` | **Date**: 2026-11-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-equipment-maintenance-retire/spec.md`

## Project Structure

### Documentation (this feature)

```text
specs/007-equipment-maintenance-retire/
├── spec.md                  # 設備送修與停用、恢復可用及受影響未來預約處理的功能需求規格
├── research.md              # 技術研究與選型決策紀錄
├── techstack.md             # 採用與不引入的技術堆疊總覽
├── plan.md                  # 本系統分析規劃文件
├── contracts/               # 後端介面合約
│   └── openapi.yaml         # 驗證碼登入、設備時段狀態與預約、成員預約查詢取消與改期、管理員設備清單與狀態變更（預覽、送修、停用、恢復可用）、審核與全體預約借還管理的 HTTP 合約（OpenAPI 3.1）
├── data/                    # 資料模型
│   └── data-model.dbml      # 使用者帳號、驗證碼挑戰、工作階段、設備（三種狀態）、設備狀態變更紀錄、固定時段、預約借還紀錄（含取消原因）與改期申請的 PostgreSQL 資料模型（DBML）
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
├── e2e/                             # 跨前後端端對端測試（設為送修與確認視窗、送修中標示與取消原因、停用隱藏、恢復可用後重新預約與前四版回歸）
├── frontend/
│   ├── package.json                 # 前端套件與腳本設定
│   ├── tsconfig.json                # 前端 TypeScript 6.0 設定
│   ├── vite.config.ts               # Vite 8 開發伺服器與 /api 代理設定
│   ├── vitest.config.ts             # 前端 Vitest 5 單元測試設定
│   ├── index.html                   # React 19 應用程式掛載頁
│   ├── src/
│   │   ├── main.tsx                 # 前端應用程式入口
│   │   ├── App.tsx                  # 登入狀態守門、頂部導覽、主題切換與成員／管理員頁籤切換
│   │   ├── api/
│   │   │   └── client.ts            # 封裝 Bearer token、預約借還、改期、審核、領取／歸還、設備審核設定與設備狀態預覽／變更 API 呼叫的 HTTP 客戶端
│   │   ├── text/
│   │   │   └── zh-TW.ts             # 臺灣繁體中文介面文字、設備 3 態與取消原因標籤、確認視窗文字及後端錯誤碼對應表
│   │   ├── views/
│   │   │   ├── LoginView.tsx        # 帳號密碼與驗證碼登入頁
│   │   │   ├── EquipmentBookingView.tsx # 設備清單（送修中標示、停用不顯示）、7 天內日期與固定時段狀態及預約申請視圖
│   │   │   ├── MyReservationsView.tsx   # 目前借用中設備、預約清單（含設備送修／停用取消原因與停用設備歷史紀錄）、改期與取消操作視圖
│   │   │   └── AdminOverviewView.tsx    # 設備清單（狀態、最近變更、設為送修／停用、恢復可用、審核設定）、待審預約與改期申請、全體預約借還管理（含取消原因）視圖
│   │   └── components/
│   │       ├── CaptchaBox.tsx       # 驗證碼顯示與重整元件
│   │       ├── SlotStatusBadge.tsx  # 固定時段狀態標籤（含本人改期審核中）
│   │       ├── RescheduleDialog.tsx # 選擇同一設備 7 天內新時段並送出改期的對話框元件
│   │       └── EquipmentStatusDialog.tsx # 設為送修或停用前顯示將取消預約數與將失效改期申請數的確認視窗元件
│   └── tests/
│       └── unit/                    # 前端元件、設備狀態與取消原因標籤、繁體中文錯誤訊息對應單元測試
└── backend/
    ├── package.json                 # 後端套件與腳本設定
    ├── tsconfig.json                # 後端 TypeScript 6.0 設定
    ├── vitest.config.ts             # 後端 Vitest 5 測試設定
    ├── .env.example                 # PostgreSQL 連線字串與伺服器埠號範例
    ├── prisma.config.ts             # Prisma 7 連線與設定檔
    ├── prisma/
    │   ├── schema.prisma            # 資料表、設備 3 態與取消原因 Enum、設備狀態變更紀錄及部分唯一索引定義（含 partialIndexes）
    │   ├── migrations/              # 資料庫結構無損遷移檔（本次新增 unavailable 改名 retired、新增 maintenance、cancel_reason 與 equipment_status_changes 的增量遷移）
    │   └── seed.ts                  # 預建帳號、設備（可用、送修中、停用）、固定時段、預約 6 態、改期申請 5 態與設備狀態變更紀錄範例的 demo seed 腳本
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
    │   │   ├── equipmentsRouter.ts  # /api/equipments 成員設備清單（排除停用）與固定時段狀態查詢路由
    │   │   ├── reservationsRouter.ts # /api/reservations 建立預約、本人紀錄查詢、取消與送出改期申請路由
    │   │   ├── rescheduleRequestsRouter.ts # /api/reschedule-requests 成員撤回改期申請路由
    │   │   └── adminRouter.ts       # /api/admin 設備清單、審核設定、設備狀態預覽與變更、待審預約與改期申請、全體預約、登記領取與歸還路由
    │   └── services/
    │       ├── authService.ts       # 驗證碼、帳號密碼驗證與工作階段服務
    │       ├── equipmentService.ts  # 設備清單（最近狀態變更）、固定時段狀態組裝與審核設定切換服務
    │       ├── equipmentStatusService.ts # 設備狀態預覽、設定送修／停用時同一交易內批次取消預約與改期失效、恢復可用與狀態變更紀錄服務
    │       ├── reservationService.ts # 預約建立（鎖定設備列並檢查設備狀態）、核准駁回、取消、登記領取與歸還服務
    │       └── rescheduleService.ts # 改期送出、即時改期、核准（鎖定設備列並檢查設備狀態）、駁回、撤回與到期惰性失效服務
    └── tests/
        ├── unit/                    # 台灣時區時段判斷、取消條件與改期條件檢查單元測試
        ├── integration/             # 送修停用與恢復的成功與拒絕路徑、確認時比對、並發序列化、回應時間、角色權限與前四版回歸之 Supertest + PostgreSQL 整合測試
        └── migration/               # 以 pg 逐支執行 migration.sql，驗證 unavailable 轉為 retired 與既有資料不變的遷移測試
```

**Structure Decision**: 依使用者指定「沿用 `specs/006-reservation-reschedule/plan.md` 的專案結構（`apps/equipment-loan/`）」與 `research.md` §1–§5 的決策，維持 `frontend/`（React 19 + Vite 8 + TypeScript 6.0）與 `backend/`（Node.js 24 LTS 以上 + Express 5 + Prisma 7.10）兩個頂層目錄，以及 `apps/equipment-loan/` 層的 `docker-compose.yml`、`README.md` 與 Playwright `e2e/`；本次依 research §2 新增 `equipmentStatusService.ts`、依 research §4 新增 `EquipmentStatusDialog.tsx`、依 research §5 新增 `backend/tests/migration/`，其餘只擴充既有模組。research §2、§4 決定不引入排程器、外部通知服務與前端路由套件，所以不新增背景工作或通知相關的目錄。

## 分析流程規劃

### 系統介面盤點

本次需求涉及 3 種技術端點：前端、後端、資料庫，共盤出 14 個介面。

| 編號 | 介面 | 端點類型 | 需求依據 |
| --- | --- | --- | --- |
| F1 | 驗證碼與帳號密碼登入登出介面 | 前端（使用者 → 前端） | FR-018 完整保留並向下相容前四次迭代已實作的登入功能；SC-005 前四次迭代既有功能回歸測試通過率達 100% |
| F2 | 成員設備預約頁的送修中標示與停用隱藏介面 | 前端（使用者 → 前端） | US3 情境 1–2；US1 情境 9；US2 情境 1–2；FR-014 送修中設備標示「送修中」且不提供預約操作，停用設備不出現在成員清單；FR-006 從未重新整理的頁面預約非可用設備時顯示說明設備狀態的錯誤提示；FR-011 恢復可用後成員可以預約未來時段；NFR-001 設備狀態標籤與錯誤提示使用臺灣繁體中文 |
| F3 | 成員「我的預約」取消原因與停用設備歷史紀錄介面 | 前端（使用者 → 前端） | US3 情境 3–5；US2 情境 3；FR-015 因設備送修或停用被取消的預約顯示取消原因，成員自行取消的不顯示；FR-016 照常顯示在送修中或停用設備上的歷史紀錄與設備名稱；FR-012 恢復可用後被取消的預約仍顯示「已取消」；Edge Cases 停用設備的歷史紀錄 |
| F4 | 管理員設備清單狀態操作與確認視窗介面 | 前端（使用者 → 前端） | US1 情境 1、3、4、8、10、11、15；US2 情境 1–2；FR-001 對可用設備設為送修或停用；FR-007 先顯示確認視窗列出將取消的預約數與將失效的改期申請數，取消時不變；FR-005 借用中時顯示「設備借用中，請先登記歸還」；FR-008 每列顯示最近一次狀態變更的管理員名稱與時間；FR-010 送修中與停用之間直接切換；FR-011 恢復可用；FR-013 恢復後保留人工審核設定；FR-019 確認時資料不同顯示「設備狀態已被變更，請重新確認」；NFR-001 確認視窗與錯誤提示使用臺灣繁體中文；NFR-002 操作回應低於 2 秒；Edge Cases 確認視窗開啟後資料改變 |
| F5 | 管理員全體預約管理的取消原因、待審清單與現場領取歸還介面 | 前端（使用者 → 前端） | US1 情境 17；FR-020 全體預約管理頁為因設備送修或停用被取消的預約顯示取消原因；FR-004 失效的改期申請之後管理員不能核准；FR-018 保留審核、改期審核與領取歸還功能；Edge Cases 待審核的預約被取消後不留在待審清單 |
| B1 | 驗證碼挑戰與登入工作階段 API | 後端（前端 → 後端） | FR-018 保留前四次迭代的驗證碼登入與工作階段；FR-017 以管理員角色限制設備狀態操作；SC-005 既有功能回歸 100% 通過 |
| B2 | 成員設備清單、時段狀態查詢與預約建立 API | 後端（前端 → 後端） | US3 情境 1–2；US1 情境 9、12；US2 情境 1–2、4；FR-014 成員設備清單排除停用設備並回傳送修中狀態；FR-006 非可用設備的新預約以說明設備狀態的繁體中文錯誤拒絕；FR-009 新預約與設定送修或停用同時發生時不留下未結束預約；FR-013 恢復後新預約依人工審核設定直接成立或進入待審核；SC-002 非可用設備新預約成功率 0%、並發時留下未結束預約 0 筆 |
| B3 | 管理員設備清單與人工審核設定 API | 後端（前端 → 後端） | US1 情境 10；FR-008 設備清單回傳每台設備最近一次狀態變更的管理員名稱與時間；FR-013 恢復可用時保留人工審核設定；FR-017 只允許管理員呼叫；FR-018 保留審核設定切換功能 |
| B4 | 設備狀態變更預覽與送修、停用、恢復可用 API | 後端（前端 → 後端） | US1 情境 1–8、11、12、15、16；US2 情境 1–5；FR-001 設為送修或停用且不刪除設備與紀錄；FR-002、FR-003 同一次操作取消時段尚未結束的待審核與尚未領取的已核准預約並記錄取消原因；FR-004 同一次操作使改期審核中申請失效；FR-005 借用中時拒絕；FR-007 確認前回傳將取消的預約數與將失效的改期申請數；FR-008 每次變更保存一筆紀錄；FR-009 與預約、核准同時發生時序列化；FR-010 送修中與停用直接切換；FR-011、FR-012 恢復可用且不復原已取消預約；FR-017 一般成員呼叫回傳權限不足；FR-019 確認時狀態或數量不同時拒絕且資料不變；NFR-002 100 筆以內預約時回應低於 2 秒；SC-001 未結束預約 100% 取消、已結束紀錄變動率 0%；SC-003 借用中設定成功率 0%；SC-004 恢復後復原率 0%；SC-006 操作回應時間低於 2 秒 |
| B5 | 成員預約查詢、取消與改期 API | 後端（前端 → 後端） | US3 情境 3–5；US2 情境 3；FR-015 回傳取消原因，成員自行取消為成員取消；FR-016 回傳送修中或停用設備上的歷史紀錄與設備名稱；FR-009 即時改期與設定送修或停用同時發生時序列化；FR-018 保留查詢、取消、改期與撤回功能 |
| B6 | 管理員待審核准駁回（含改期申請）、全體預約與現場領取歸還 API | 後端（前端 → 後端） | US1 情境 17；FR-020 全體預約清單回傳取消原因；FR-009 核准待審預約或改期申請與設定送修或停用同時發生時序列化；FR-004 失效的改期申請不能核准；FR-018 保留審核、改期審核與領取歸還功能；Edge Cases 待審核的預約、改期申請審核中 |
| D1 | 帳號、驗證碼挑戰與工作階段資料存取 | 資料庫（後端 → PostgreSQL） | Key Entities 使用者帳號；FR-017 依角色限制設定送修、停用與恢復可用；FR-018 保留前四次迭代的帳號、驗證碼與工作階段資料 |
| D2 | 設備狀態與設備狀態變更紀錄持久化 | 資料庫（後端 → PostgreSQL） | Key Entities 設備、設備狀態變更紀錄；FR-001 設備三種狀態且不刪除設備；FR-008 每次狀態變更保存設備、變更前後狀態、經手管理員、變更時間與被取消的預約數，紀錄不得刪除；FR-013 保留 `requires_approval`；FR-018 既有不可用設備無損轉為停用並擴充 demo seed |
| D3 | 預約借還紀錄（含取消原因）與改期申請持久化 | 資料庫（後端 → PostgreSQL） | Key Entities 預約與借用紀錄、改期申請、固定時段定義；FR-002、FR-003 取消時記錄取消原因與取消時間；FR-004 改期申請失效原因沿用「原預約已取消」；FR-012 恢復可用不復原已取消預約；FR-015 區分成員取消、設備送修、設備停用三種取消原因；FR-018 無損遷移既有預約與改期資料並擴充送修、停用 demo seed；SC-001 已結束紀錄變動率 0% |

### 分析流程安排

本次規劃 2 個 Wave。

**Wave 1：前端**

- 涵蓋介面：F1、F2、F3、F4、F5
- 排序理由：US1 到 US3 都從管理員在設備清單的狀態操作，以及成員在「設備預約」與「我的預約」頁面的檢視開始；前端先確定確認視窗顯示的數量、狀態操作按鈕、最近變更欄位、送修中標示與取消原因的顯示方式，後端與資料庫才能據此對齊 API 與資料結構。

**Wave 2：後端、資料庫（2 個 Sub-agent 平行分析）**

- 涵蓋介面：B1、B2、B3、B4、B5、B6；D1、D2、D3
- 依賴：後端依 Wave 1 確定的確認視窗預覽數量、設為送修／停用／恢復可用操作、最近變更欄位與取消原因顯示設計 REST API 合約；資料庫依 Wave 1 確定的最近變更與取消原因顯示資訊，搭配 `spec.md` 的 Key Entities 設計設備狀態、狀態變更紀錄與取消原因的資料結構。
- 排序理由：後端與資料庫都只依賴 Wave 1 的前端分析結果；設備狀態值、取消原因、狀態變更紀錄欄位與交易鎖定作法已在 `spec.md` 與 `research.md` §1–§3 定義，兩者之間沒有先後依賴，所以放在同一個 Wave 平行分析。
