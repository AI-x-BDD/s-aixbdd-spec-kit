# Implementation Plan: 設備借用與預約系統 (Equipment Loan and Booking System)

**Branch**: `003-equipment-loan-booking` | **Date**: 2026-11-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-equipment-loan-booking/spec.md`

## Project Structure

### Documentation (this feature)

```text
specs/003-equipment-loan-booking/
├── spec.md                  # 設備借用與預約系統的功能需求規格
├── research.md              # 技術研究與選型決策紀錄
├── techstack.md             # 採用與不引入的技術堆疊總覽
├── plan.md                  # 本系統分析規劃文件
├── contracts/               # 後端介面合約
│   └── openapi.yaml         # 驗證碼挑戰、登入工作階段、設備時段查詢、預約建立與取消、管理員全體預約查詢的 HTTP 合約（OpenAPI 3.1）
├── data/                    # 資料模型
│   └── data-model.dbml      # 使用者帳號、驗證碼挑戰、工作階段、設備、固定時段與預約紀錄的 PostgreSQL 資料模型（DBML）
└── ui/                      # 前端畫面規劃與雛形
    ├── plan.md              # 畫面範疇、視覺風格、畫面與流程、狀態、驗證與錯誤回饋
    └── index.html           # 可互動雛形入口，其餘頁面依畫面流程決定
```

### Source Code (repository root)

```text
apps/equipment-loan/
├── docker-compose.yml               # 開發與測試用 PostgreSQL 18 容器設定
├── README.md                        # 系統啟動、資料庫初始化、demo seed 重設與測試執行說明
├── package.json                     # 根目錄整合腳本與跨前後端 Playwright E2E 測試設定
├── playwright.config.ts             # Playwright 端對端測試設定
├── e2e/                             # 跨前後端端對端測試（登入驗證碼、預約、取消釋出、管理員檢視）
├── frontend/
│   ├── package.json                 # 前端套件與腳本設定
│   ├── tsconfig.json                # 前端 TypeScript 6.0 設定
│   ├── vite.config.ts               # Vite 8 開發伺服器與 /api 代理設定
│   ├── index.html                   # React 19 應用程式掛載頁
│   ├── src/
│   │   ├── main.tsx                 # 前端應用程式入口
│   │   ├── App.tsx                  # 登入狀態守門、頂部導覽、Light/Dark Mode 主題切換與成員／管理員頁籤切換
│   │   ├── api/
│   │   │   └── client.ts            # 封裝 Authorization Bearer token 與錯誤碼解析的 HTTP 客戶端
│   │   ├── text/
│   │   │   └── zh-TW.ts             # 臺灣繁體中文介面文字與後端錯誤碼對應表
│   │   ├── views/
│   │   │   ├── LoginView.tsx        # 帳號密碼與 7 位數區分大小寫驗證碼登入頁
│   │   │   ├── EquipmentBookingView.tsx # 預建設備清單、7 天內日期選擇與 3 個固定時段預約視圖
│   │   │   ├── MyReservationsView.tsx   # 成員個人預約紀錄清單與時段開始前取消操作視圖
│   │   │   └── AdminOverviewView.tsx    # 管理員預建設備與全體成員預約紀錄檢視視圖
│   │   └── components/
│   │       ├── CaptchaBox.tsx       # 7 位數英數驗證碼顯示與手動重整元件
│   │       └── SlotStatusBadge.tsx  # 固定時段狀態標籤（可預約、本人已預約、已被預約）
│   └── tests/
│       └── unit/                    # 前端元件與繁體中文錯誤訊息對應單元測試
└── backend/
    ├── package.json                 # 後端套件與腳本設定
    ├── tsconfig.json                # 後端 TypeScript 6.0 設定
    ├── .env.example                 # PostgreSQL 連線字串與伺服器埠號範例
    ├── prisma.config.ts             # Prisma 7 連線與設定檔
    ├── prisma/
    │   ├── schema.prisma            # PostgreSQL 資料表與部分唯一索引定義（含 partialIndexes）
    │   ├── migrations/              # 資料庫結構遷移檔
    │   └── seed.ts                  # 預建成員／管理員帳號、單件設備、3 個固定時段與範例預約的 demo seed 腳本
    ├── src/
    │   ├── server.ts                # Express 5 HTTP 伺服器啟動入口
    │   ├── app.ts                   # Express 應用程式組裝、路由掛載與統一錯誤處理
    │   ├── db/
    │   │   └── prisma.ts            # Prisma Client（搭配 @prisma/adapter-pg）單例
    │   ├── utils/
    │   │   ├── password.ts          # Node.js 內建 crypto.scrypt 密碼雜湊與比對工具
    │   │   ├── captcha.ts           # 7 位數區分大小寫英數驗證碼產生器
    │   │   └── taipeiTime.ts        # Asia/Taipei 業務時區之當日日期、7 天開放範圍與固定時段開始時間判斷
    │   ├── middleware/
    │   │   ├── authMiddleware.ts    # Bearer session token 驗證與管理員角色檢查中介層（401 UNAUTHORIZED／403 FORBIDDEN）
    │   │   └── errorHandler.ts      # 統一錯誤回應格式中介層
    │   ├── routes/
    │   │   ├── authRouter.ts        # /api/auth 驗證碼挑戰、登入、登出與目前使用者路由
    │   │   ├── equipmentsRouter.ts  # /api/equipments 預建設備與指定日期固定時段狀態查詢路由
    │   │   ├── reservationsRouter.ts # /api/reservations 建立預約、查詢本人預約與取消預約路由
    │   │   └── adminRouter.ts       # /api/admin/reservations 管理員查詢全體成員預約紀錄路由
    │   └── services/
    │       ├── authService.ts       # 驗證碼單次消耗、大小寫比對、帳號密碼驗證與工作階段管理服務
    │       ├── equipmentService.ts  # 設備清單與單日固定時段狀態（可預約／本人已預約／已被預約）組裝服務
    │       └── reservationService.ts # 預約時段驗證、部分唯一索引並發衝突轉換與取消釋出服務
    └── tests/
        ├── unit/                    # 驗證碼產生、台灣時區固定時段判斷與密碼雜湊單元測試
        └── integration/             # 登入驗證碼、10 並發搶約衝突、取消釋出與角色權限之 Supertest + PostgreSQL 整合測試
```

**Structure Decision**: 依使用者指定的專案結構與 `research.md` §1、§5、§6 決策，將系統置於 `apps/equipment-loan/`，底下拆分為 `frontend/`（React 19 + Vite 8 + TypeScript 6.0）與 `backend/`（Node.js 24 LTS 以上 + Express 5 + Prisma 7.10），並將 `docker-compose.yml`、`README.md` 與跨前後端的 Playwright `e2e/` 測試放在 `apps/equipment-loan/` 頂層；資料庫存取與時區驗證皆封裝於 `backend/` 內，不另建其他頂層目錄。

## 分析流程規劃

### 系統介面盤點

本次需求涉及 3 種技術端點：前端、後端、資料庫，共盤出 10 個介面。

| 編號 | 介面 | 端點類型 | 需求依據 |
| --- | --- | --- | --- |
| F1 | 驗證碼與帳號密碼登入登出介面 | 前端（使用者 → 前端） | US1 情境 1–3、8；FR-001 顯示 7 位數區分大小寫英數驗證碼並支援手動重整，驗證失敗時更新驗證碼與顯示繁體中文錯誤提示；FR-002 輸入預建帳號密碼與驗證碼登入、維持工作階段與登出，未登入時導向登入頁；NFR-001 全介面與錯誤提示使用臺灣繁體中文；NFR-002 登入回應時間低於 2 秒；SC-001 驗證碼大小寫不符或失效時 100% 攔截；SC-004 登入回應時間低於 2 秒；Edge Cases 驗證碼英文大小寫不符、過期或重複使用舊驗證碼 |
| F2 | 設備清單與單日固定時段預約介面 | 前端（使用者 → 前端） | US1 情境 4–7；FR-003 展示預建單件設備清單與所選日期的 3 個固定時段狀態（可預約、本人已預約、已被預約，對一般成員不揭露他人身分）；FR-004 選擇當日起 7 天內尚未開始的時段送出預約並拒絕過期或超範圍時段；FR-005 同時搶約衝突時顯示時段已被預約提示；NFR-001 臺灣繁體中文介面與錯誤提示；NFR-002 查詢與預約回應時間低於 2 秒；SC-004 查詢與建立預約回應時間低於 2 秒；Edge Cases 多人同時搶約同一台設備的同一日期與時段、嘗試預約已開始／已過期時段或取消已開始的預約 |
| F3 | 成員個人預約查詢與取消介面 | 前端（使用者 → 前端） | US2 情境 1–4；FR-006 依預約日期由新到舊、固定時段順序及建立時間顯示本人預約紀錄；FR-007 在預約時段開始前取消本人有效預約並立即釋出時段；FR-008 拒絕取消非本人、已開始或已取消的預約並顯示繁體中文錯誤提示；NFR-001 臺灣繁體中文介面與錯誤提示；NFR-002 查詢與取消回應時間低於 2 秒；SC-003 取消後 1 秒內恢復可預約狀態並保留已取消紀錄；SC-004 取消預約回應時間低於 2 秒；Edge Cases 時段取消後再次預約、嘗試預約已開始／已過期時段或取消已開始的預約 |
| F4 | 管理員設備與全體成員預約檢視介面 | 前端（使用者 → 前端） | US3 情境 1–2；FR-009 管理員查看所有預建設備清單與全體成員預約紀錄（依預約日期由新到舊、固定時段順序及建立時間排序）；FR-010 一般成員嘗試存取管理員全體預約清單時拒絕並顯示權限不足提示；NFR-001 臺灣繁體中文介面與錯誤提示；SC-005 一般成員越權存取管理員清單 100% 攔截；Edge Cases 成員嘗試越權取消他人預約或查看管理員清單 |
| B1 | 驗證碼挑戰與登入工作階段 API | 後端（前端 → 後端） | US1 情境 1–3、8；FR-001 產生與重整 7 位數區分大小寫英數驗證碼（有效期限 5 分鐘、送出驗證或重整後立即失效）並嚴格比對大小寫；FR-002 驗證預建帳號密碼、建立與驗證工作階段 token 及處理登出；NFR-002 登入驗證回應時間低於 2 秒；SC-001 100% 強制檢查 7 位數大小寫驗證碼並攔截無效請求；SC-004 登入回應時間低於 2 秒；Edge Cases 驗證碼英文大小寫不符、過期或重複使用舊驗證碼 |
| B2 | 設備與單日固定時段預約 API | 後端（前端 → 後端） | US1 情境 4–7；FR-003 回傳預建單件設備清單與指定日期各固定時段狀態（區分可預約、本人已預約、已被預約，對一般成員隱藏他人身分）；FR-004 依台灣時區檢查當日起 7 天內且尚未開始的時段並立即建立有效預約；FR-005 保證同一設備、同一日期與同一固定時段最多一筆有效預約，並發衝突時拒絕；NFR-002 查詢與建立預約回應時間低於 2 秒；SC-002 10 個並發搶約請求僅 1 筆成功、重複占用率 0%；SC-004 查詢與建立預約回應時間低於 2 秒；Edge Cases 多人同時搶約同一台設備的同一日期與時段、嘗試預約已開始／已過期時段或取消已開始的預約 |
| B3 | 成員個人預約查詢與取消 API | 後端（前端 → 後端） | US2 情境 1–4；FR-006 分頁查詢本人名下所有預約紀錄並依預約日期由新到舊、固定時段順序及建立時間排序；FR-007 在時段開始前將本人有效預約更新為已取消、記錄取消時間並釋出時段；FR-008 拒絕取消非本人、已開始或已取消的預約；NFR-002 查詢與取消回應時間低於 2 秒；SC-003 取消後 1 秒內恢復可預約狀態並保留已取消紀錄；SC-004 取消預約回應時間低於 2 秒；SC-005 一般成員嘗試取消他人預約 100% 攔截；Edge Cases 時段取消後再次預約、成員嘗試越權取消他人預約或查看管理員清單 |
| B4 | 管理員全體預約查詢 API | 後端（前端 → 後端） | US3 情境 1–2；FR-009 供管理員分頁查詢全體成員預約紀錄（含預約成員資訊，依預約日期由新到舊、固定時段順序及建立時間排序）；FR-010 限制僅管理員角色可呼叫，一般成員呼叫時回傳 403 權限不足；SC-005 一般成員存取管理員清單 100% 攔截；Edge Cases 成員嘗試越權取消他人預約或查看管理員清單 |
| D1 | 帳號、驗證碼挑戰與工作階段資料存取 | 資料庫（後端 → PostgreSQL） | Key Entities 使用者帳號、登入驗證碼挑戰；FR-001 儲存 7 位數區分大小寫驗證碼挑戰、5 分鐘到期時間與單次使用失效狀態；FR-002 儲存預建成員與管理員帳號密碼雜湊及登入工作階段；FR-011 預建至少 2 組一般成員帳號與 1 組管理員帳號；SC-001 防止已使用或過期驗證碼重複通過驗證 |
| D2 | 設備、固定時段與預約紀錄持久化 | 資料庫（後端 → PostgreSQL） | Key Entities 設備、固定時段定義、預約紀錄；FR-003 儲存單件獨立設備與 3 個單日固定時段定義；FR-005 以部分唯一索引強制同一設備、同一日期與同一固定時段在有效狀態下最多一筆預約；FR-007 取消時更新狀態與取消時間並保留原歷史紀錄列；FR-009 儲存供管理員查詢的全體成員預約歷程；FR-011 預建至少 4 台單件設備、3 個單日固定時段與範例預約紀錄並持久化保存；SC-002 10 並發搶約重複占用率 0%；SC-003 100% 保留已取消歷史紀錄 |

### 分析流程安排

本次規劃 2 個 Wave。

**Wave 1：前端**

- 涵蓋介面：F1、F2、F3、F4
- 排序理由：US1 到 US3 都從使用者（成員與管理員）在瀏覽器畫面的操作開始；前端先確定登入與驗證碼互動、設備單日固定時段檢視與預約、個人預約清單與取消、管理員全體預約檢視的畫面流程與顯示欄位，後端與資料庫才能據此對齊 API 契約與資料結構。

**Wave 2：後端、資料庫（2 個 Sub-agent 平行分析）**

- 涵蓋介面：B1、B2、B3、B4；D1、D2
- 依賴：後端依 Wave 1 確定的前端畫面操作流程、篩選分頁與錯誤提示需求設計 REST API 合約；資料庫依 Wave 1 確定的畫面資訊與預約狀態變化，搭配 `spec.md` 的 Key Entities 設計 PostgreSQL 資料表與部分唯一索引。
- 排序理由：後端與資料庫都只依賴 Wave 1 的前端分析結果，加上業務規則與唯一性約束已在 `spec.md` 與 `research.md` 明確定義，兩者之間沒有先後依賴，所以放在同一個 Wave 平行分析。
