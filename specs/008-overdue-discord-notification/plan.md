# Implementation Plan: 逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查 (Overdue Discord Notification)

**Branch**: `008-overdue-discord-notification` | **Date**: 2026-11-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-overdue-discord-notification/spec.md`

## Project Structure

### Documentation (this feature)

```text
specs/008-overdue-discord-notification/
├── spec.md                  # 逾期借用 Discord 通知、送出結果查看與重送、手動逾期檢查的功能需求規格
├── research.md              # 技術研究與選型決策紀錄
├── techstack.md             # 採用與不引入的技術堆疊總覽
├── plan.md                  # 本系統分析規劃文件
├── contracts/               # 後端介面合約
│   └── openapi.yaml         # 逾期通知紀錄查詢、通知重送、手動逾期檢查與前五版既有 API 的 HTTP 合約（OpenAPI 3.1）
├── data/                    # 資料模型
│   └── data-model.dbml      # 逾期通知（狀態與失敗原因 Enum）與前五版帳號、設備、時段、預約借還、改期、設備狀態變更的 PostgreSQL 資料模型（DBML）
├── notification/            # 沒有 Planner 的通知類介面規劃
│   └── plan.md              # S1～S3、N1、N2 的通知可靠性規劃：觸發條件、狀態轉換、失敗分類與重試界線、重複處理、各介面規格與驗收情境
└── ui/                      # 前端畫面規劃與雛形
    ├── plan.md              # 畫面範疇、視覺風格、畫面與流程、狀態、驗證與錯誤回饋
    ├── index.html           # 可互動雛形入口：登入與登出，管理員登入後前往逾期通知紀錄
    └── overdue-notifications.html # 逾期通知紀錄雛形：通知清單與狀態篩選、重送與「結果不明」確認視窗、立即檢查逾期
```

### Source Code (repository root)

```text
apps/equipment-loan/
├── docker-compose.yml               # 開發與測試用 PostgreSQL 18 容器設定
├── README.md                        # 系統啟動、資料庫遷移、demo seed 重設、Discord 模擬器與「展示手動檢查前關閉自動檢查」的說明
├── package.json                     # 根目錄整合腳本與跨前後端 Playwright E2E 測試設定
├── playwright.config.ts             # Playwright 端對端測試設定（啟動後端時關閉自動檢查並啟動 Discord 模擬器）
├── e2e/                             # 跨前後端端對端測試：只重跑前五版核心流程回歸，本次不新增；新功能的畫面由使用者驗證涵蓋
├── frontend/
│   ├── package.json                 # 前端套件與腳本設定
│   ├── tsconfig.json                # 前端 TypeScript 6.0 設定
│   ├── vite.config.ts               # Vite 8 開發伺服器與 /api 代理設定
│   ├── vitest.config.ts             # 前端 Vitest 5 單元測試設定
│   ├── index.html                   # React 19 應用程式掛載頁
│   ├── src/
│   │   ├── main.tsx                 # 前端應用程式入口
│   │   ├── App.tsx                  # 登入狀態守門、頂部導覽、主題切換與成員／管理員頁籤切換（本次新增「逾期通知紀錄」頁籤，一般成員點開看到權限不足；管理員登入後的預設頁面維持設備狀態管理）
│   │   ├── api/
│   │   │   └── client.ts            # 封裝 Bearer token 與前五版 API 呼叫的 HTTP 客戶端（本次新增通知紀錄查詢、重送與手動檢查）
│   │   ├── text/
│   │   │   └── zh-TW.ts             # 臺灣繁體中文介面文字與後端錯誤碼對應表（本次新增通知 4 態、失敗原因、確認視窗文字與新錯誤碼）
│   │   ├── views/
│   │   │   ├── LoginView.tsx        # 帳號密碼與驗證碼登入頁
│   │   │   ├── EquipmentBookingView.tsx # 設備清單、7 天內日期與固定時段狀態及預約申請視圖
│   │   │   ├── MyReservationsView.tsx   # 目前借用中設備、預約清單、改期與取消操作視圖
│   │   │   ├── AdminOverviewView.tsx    # 設備清單與狀態操作、待審預約與改期申請、全體預約借還管理視圖
│   │   │   └── OverdueNotificationsView.tsx # 逾期通知清單、狀態篩選、借用是否已歸還、重送、重新整理與「立即檢查逾期」視圖
│   │   └── components/
│   │       ├── CaptchaBox.tsx       # 驗證碼顯示與重整元件
│   │       ├── SlotStatusBadge.tsx  # 固定時段狀態標籤
│   │       ├── RescheduleDialog.tsx # 選擇同一設備 7 天內新時段並送出改期的對話框元件
│   │       ├── EquipmentStatusDialog.tsx # 設為送修或停用前的確認視窗元件
│   │       └── ResendUnknownDialog.tsx   # 重送「結果不明」通知前提醒先到 Discord 頻道確認的確認視窗元件
│   └── tests/
│       └── unit/                    # 前五版既有的前端介面文字與繁體中文錯誤訊息對應單元測試，本次不新增
└── backend/
    ├── package.json                 # 後端套件與腳本設定（dev、db:seed 加上 --env-file-if-exists=.env，新增 discord:sim）
    ├── tsconfig.json                # 後端 TypeScript 6.0 設定
    ├── vitest.config.ts             # 後端 Vitest 5 測試設定
    ├── .env.example                 # PostgreSQL 連線字串、伺服器埠號、DISCORD_WEBHOOK_URL（指向本機模擬器）、OVERDUE_AUTO_CHECK_ENABLED、OVERDUE_CHECK_INTERVAL_SECONDS 範例
    ├── prisma.config.ts             # Prisma 7 連線與設定檔
    ├── prisma/
    │   ├── schema.prisma            # 資料表與 Enum 定義（本次新增 overdue_notifications、通知狀態與失敗原因 Enum、部分索引）
    │   ├── migrations/              # 資料庫結構無損遷移檔（本次新增只建 Enum 與 overdue_notifications 的增量遷移）
    │   └── seed.ts                  # demo seed（本次新增「昨天」時段的逾期借用，以及送出成功、送出失敗、結果不明與未通知各至少一筆）
    ├── scripts/
    │   └── discordWebhookSimulator.ts # 本機 Discord Webhook 模擬器（success、rate_limit、server_error、timeout、disconnect、not_found 模式與控制端點），同時匯出給整合測試使用
    ├── src/
    │   ├── server.ts                # Express 5 HTTP 伺服器啟動入口（本次加上啟動逾期排程）
    │   ├── app.ts                   # Express 應用程式組裝、路由掛載與統一錯誤處理（不啟動排程）
    │   ├── config/
    │   │   └── notificationConfig.ts # 以 zod 4 驗證 Discord Webhook 位址與自動檢查開關、間隔，只對外提供是否已設定
    │   ├── db/
    │   │   └── prisma.ts            # Prisma Client（搭配 @prisma/adapter-pg）單例
    │   ├── utils/
    │   │   ├── password.ts          # 密碼雜湊與比對工具
    │   │   ├── captcha.ts           # 驗證碼產生器
    │   │   └── taipeiTime.ts        # Asia/Taipei 當日日期、7 天範圍與固定時段開始結束時間判斷
    │   ├── middleware/
    │   │   ├── authMiddleware.ts    # Bearer session token 驗證與管理員角色檢查中介層
    │   │   └── errorHandler.ts      # 統一錯誤回應格式中介層（本次新增 OVERDUE_LOAN_RETURNED、OVERDUE_NOTIFICATION_NOT_RESENDABLE）
    │   ├── routes/
    │   │   ├── authRouter.ts        # /api/auth 驗證碼、登入、登出與目前使用者路由
    │   │   ├── equipmentsRouter.ts  # /api/equipments 成員設備清單與固定時段狀態查詢路由
    │   │   ├── reservationsRouter.ts # /api/reservations 建立預約、本人紀錄查詢、取消與送出改期申請路由
    │   │   ├── rescheduleRequestsRouter.ts # /api/reschedule-requests 成員撤回改期申請路由
    │   │   └── adminRouter.ts       # /api/admin 前五版管理員路由（本次新增逾期通知紀錄、通知重送與手動逾期檢查）
    │   ├── services/
    │   │   ├── authService.ts       # 驗證碼、帳號密碼驗證與工作階段服務
    │   │   ├── equipmentService.ts  # 設備清單、固定時段狀態組裝與審核設定切換服務
    │   │   ├── equipmentStatusService.ts # 設備狀態預覽、送修／停用與恢復可用服務
    │   │   ├── reservationService.ts # 預約建立、核准駁回、取消、登記領取與歸還服務
    │   │   ├── rescheduleService.ts # 改期送出、核准、駁回、撤回與到期惰性失效服務
    │   │   └── overdueNotificationService.ts # 逾期判定與建立通知（唯一索引防重複）、通知紀錄查詢、以條件式更新領取重送權服務
    │   ├── jobs/
    │   │   └── overdueScheduler.ts  # 程序內計時器：啟動時恢復中斷的通知、每 60 秒自動逾期檢查（.env 開關）、每 1 秒領取並送出到期通知與自動重試
    │   └── integrations/
    │       └── discordWebhookClient.ts # 以內建 fetch 呼叫 Discord Webhook（?wait=true、10 秒逾時），把回應分類為成功、可重試、不可重試與結果不明，log 只寫主機名稱
    └── tests/
        ├── unit/                    # 前五版既有的台灣時區時段判斷、改期條件與共用工具單元測試，本次不新增
        ├── integration/             # 自動與手動檢查、送出與自動重試、恢復處理、重送、並發不重複、回應時間、Webhook 位址不外洩、角色權限與前五版回歸之 Supertest + PostgreSQL + 模擬器整合測試；模擬器沒有對應模式的 4 類回應以臨時固定回應位址驗證分類（research §6）
        └── migration/               # 以 pg 逐支執行 migration.sql，驗證既有資料不變且 overdue_notifications 為空表的遷移測試
```

**Structure Decision**: 依使用者指定「沿用 `specs/007-equipment-maintenance-retire/plan.md` 的專案結構（`apps/equipment-loan/`）」與 `research.md` §1–§8 的決策，維持 `frontend/`（React 19 + Vite 8 + TypeScript 6.0）與 `backend/`（Node.js 24 LTS 以上 + Express 5 + Prisma 7.10）兩個頂層目錄，以及 `apps/equipment-loan/` 層的 `docker-compose.yml`、`README.md` 與 Playwright `e2e/`。research §2 決定排程以後端程序內的內建計時器實作、research §3 決定以內建 `fetch` 呼叫 Discord Webhook，兩者都在後端程序內執行、不是獨立部署的程式，所以分別放在 `backend/src/jobs/` 與 `backend/src/integrations/`，不另建頂層目錄；research §5 新增 `backend/src/config/` 集中驗證 `.env` 設定；research §6 的本機模擬器只供測試與展示，放在 `backend/scripts/`；research §7 新增 `OverdueNotificationsView.tsx` 與 `ResendUnknownDialog.tsx`，其餘只擴充既有模組。research §2、§3、§7 決定不引入排程套件、工作佇列、Redis、Discord 用戶端套件與即時推播，所以不新增對應的目錄或服務。

## 分析流程規劃

### 系統介面盤點

本次需求涉及 5 種技術端點：前端、後端、資料庫、排程、通知服務，共盤出 15 個介面。

| 編號 | 介面 | 端點類型 | 需求依據 |
| --- | --- | --- | --- |
| F1 | 管理員「逾期通知紀錄」頁籤的通知清單與狀態篩選介面 | 前端（使用者 → 前端） | US2 情境 1–3、9–12、15、16；FR-003 依建立時間由新到舊列出設備、成員姓名、預約日期與時段、狀態、嘗試次數、最後嘗試時間，送出成功顯示送出時間、送出失敗顯示失敗原因；FR-004 依通知狀態篩選；FR-008 顯示借用是否已歸還，已歸還時不提供重送；FR-019 一般成員不能查看通知紀錄；NFR-002 狀態標籤與失敗原因使用臺灣繁體中文 |
| F2 | 通知重送操作與「結果不明」確認視窗介面 | 前端（使用者 → 前端） | US2 情境 4–8、13；FR-005 點擊重送後不等結果，立即顯示「送出中」，重新整理清單看到結果；FR-006 重送「結果不明」前顯示確認視窗，取消時通知不變；FR-007 送出中與送出成功的通知不提供重送，收到拒絕時顯示說明目前狀態的錯誤提示；FR-008 從未重新整理的頁面重送已歸還借用時顯示「借用已歸還，不需要重送」；NFR-002 確認視窗與錯誤提示使用臺灣繁體中文；Edge Cases 結果不明但 Discord 其實已收到 |
| F3 | 「立即檢查逾期」操作與建立數量提示介面 | 前端（使用者 → 前端） | US3 情境 1–3、6；FR-009 管理員手動執行一次逾期檢查；FR-010 立即顯示新建立的通知數，沒有時顯示「沒有新的逾期借用」；NFR-001 100 筆以內從點擊到顯示低於 2 秒；SC-005 手動檢查顯示建立數量低於 2 秒 |
| F4 | 前五版成員與管理員既有畫面（登入、設備預約、我的預約、管理員總覽） | 前端（使用者 → 前端） | US1 情境 10；FR-020 完整保留前五次迭代已實作的功能；SC-007 前五次迭代既有功能回歸測試通過率 100% |
| B1 | 逾期通知紀錄查詢 API | 後端（前端 → 後端） | US2 情境 1–3、9–12、15；FR-003 回傳清單欄位、送出時間與失敗原因並由新到舊排序；FR-004 依狀態篩選；FR-008 回傳借用是否已歸還與可否重送；FR-019 只允許管理員查看，一般成員回傳權限不足 |
| B2 | 通知重送 API | 後端（前端 → 後端） | US2 情境 4–8、13–15；FR-005 重送更新同一則通知為「送出中」且不等送出結果；FR-007 只對送出失敗與結果不明提供重送，其他狀態拒絕並說明目前狀態；FR-008 借用已歸還時拒絕並回傳「借用已歸還，不需要重送」；FR-018 多位管理員同時重送時只送出一次；FR-019 只允許管理員重送；SC-004 重送後通知總數不增加；Edge Cases 通知送出中或結果不明時借用被歸還 |
| B3 | 手動逾期檢查 API | 後端（前端 → 後端） | US3 情境 1–5；FR-009 使用和自動檢查相同的逾期判定與通知規則；FR-010 回傳新建立的通知數，不等送出結果；FR-012 已有通知的逾期借用不再建立通知；FR-018 和自動檢查同時執行時同一筆逾期借用只有一則通知；FR-019 只允許管理員執行；NFR-001 100 筆以內低於 2 秒；SC-002 同一筆逾期借用的通知數恰好 1 則；SC-005 手動檢查低於 2 秒；Edge Cases 手動檢查與自動檢查同時執行 |
| B4 | 前五版既有 API（驗證碼登入、設備與時段、預約、改期、審核、領取歸還、設備狀態） | 後端（前端 → 後端） | US1 情境 10；FR-020 完整保留並向下相容前五次迭代的 API；FR-019 沿用既有管理員角色檢查；SC-007 前五次迭代既有功能回歸測試通過率 100% |
| D1 | 逾期通知紀錄持久化 | 資料庫（後端 → PostgreSQL） | Key Entities 逾期通知；FR-012 每筆預約與借用紀錄最多一則通知；FR-017 記錄送出中、送出成功、送出失敗、結果不明，送出成功記錄送出時間與 Discord 訊息編號；FR-005 重送更新同一則通知的狀態、嘗試次數與最後嘗試時間；FR-018 同時檢查與同時重送不重複；FR-021 區分等待自動重試與等待 Discord 回應的「送出中」；FR-020 demo seed 包含送出成功、送出失敗、結果不明各至少一則；NFR-003 不保存 Webhook 位址 |
| D2 | 前五版帳號、設備、固定時段、預約借還、改期與設備狀態變更資料存取與無損遷移 | 資料庫（後端 → PostgreSQL） | Key Entities 預約與借用紀錄、設備、使用者帳號、固定時段定義；FR-011 依「借用中」狀態與固定時段結束時間判定逾期借用；FR-013 通知內容取設備編號與名稱、成員姓名、預約日期與時段；FR-020 無損遷移既有資料並擴充 demo seed 的未通知逾期借用；US1 情境 10 升級後既有資料不變；Edge Cases 送修或停用設備的逾期借用 |
| S1 | 逾期自動檢查排程 | 排程（程序內計時器 → 後端） | US1 情境 1–4、9；FR-001 自動定期檢查，時段結束後 10 分鐘內送出第一則通知；FR-002 恢復運作後第一次自動檢查找出停機期間的逾期借用；FR-011 逾期判定；FR-012 已有通知的逾期借用不再建立；SC-001 時段結束後 10 分鐘內送出；Edge Cases 時段結束後檢查前已歸還、逾期好幾天仍未歸還、升級時已有的逾期借用、系統停止運作期間逾期 |
| S2 | 通知送出與自動重試程序 | 排程（程序內計時器 → 後端） | US1 情境 5–8、11、12、15；US2 情境 5、14；FR-005 重送時依 FR-014～FR-016 處理；FR-014 暫時無法處理時自動重試最多 3 次，等待超過 1 分鐘直接標送出失敗；FR-015 不會自己恢復的失敗不自動重試；FR-016 等待 10 秒或送出後中斷標結果不明；SC-003 重試內恢復時 100% 送出成功、結果不明自動重送 0 次；Edge Cases 自動重試時又等不到回應或連線中斷、連線在訊息送出前就失敗 |
| S3 | 系統恢復運作時中斷通知的處理 | 排程（程序內計時器 → 後端） | US1 情境 13、14；FR-021 等待自動重試的通知繼續重試且總數仍最多 3 次，等待 Discord 回應的通知標成結果不明；Edge Cases 通知送出中時系統停止運作 |
| N1 | Discord Webhook 逾期通知送出 | 通知服務（後端 → Discord Webhook） | US1 情境 1、5–8、11、12、15；FR-013 通知寫出設備編號與名稱、成員姓名、預約日期與時段、已逾期多久；FR-014 依 Discord 要求的等待時間重試；FR-015 Webhook 失效、沒有設定或內容被拒時不重試；FR-016 10 秒沒有回應標結果不明；FR-017 記錄 Discord 回傳的訊息編號；NFR-002 通知內容使用臺灣繁體中文；NFR-003 Webhook 位址不得出現在畫面、紀錄與系統紀錄檔；SC-006 Webhook 位址出現次數為 0；Edge Cases Webhook 沒有設定或已失效、Discord 要求等待很久 |
| N2 | 本機 Discord Webhook 模擬器 | 通知服務（後端 → 本機 Discord 模擬器） | US1 情境 4–8、11、12、15 需要重現成功、請求太頻繁、伺服器錯誤、找不到 Webhook、逾時與送出後中斷的回應；US2 情境 14 驗證頻道只收到一次；SC-002 驗證每筆逾期借用只發一則；SC-003 驗證自動重試與結果不明的處理 |

### 分析流程安排

本次規劃 3 個 Wave。

**Wave 1：前端、通知服務（2 個 Sub-agent 平行分析）**

- 涵蓋介面：F1、F2、F3、F4；N1、N2
- 排序理由：US2、US3 都從管理員在「逾期通知紀錄」頁籤的查看、篩選、重送與立即檢查開始，前端先確定清單欄位、可重送條件、確認視窗與建立數量提示，後端才知道 API 要回傳哪些資料；通知服務只需要依 Discord Webhook 的官方行為（`?wait=true`、`429` 與 `Retry-After`、錯誤回應）決定通知內容、回應分類與模擬器要重現的回應，和前端分析沒有依賴，所以平行進行。

**Wave 2：後端、資料庫（2 個 Sub-agent 平行分析）**

- 涵蓋介面：B1、B2、B3、B4；D1、D2
- 依賴：後端依 Wave 1 前端確定的清單欄位、狀態篩選、可重送條件、重送後顯示「送出中」與建立數量提示設計 REST API 合約；資料庫依 Wave 1 前端確定的清單顯示資訊，以及通知服務確定的回應分類（失敗原因種類、Discord 訊息編號、等待秒數）設計逾期通知的狀態、失敗原因與時間欄位。
- 排序理由：後端與資料庫都只依賴 Wave 1 的結果；通知狀態、唯一性與條件式更新的作法已在 `spec.md` 的 Key Entities 與 `research.md` §1、§4 定義，後端 API 不需要等資料表定案，資料庫也不需要等 API 定案，所以放在同一個 Wave 平行分析。

**Wave 3：排程**

- 涵蓋介面：S1、S2、S3
- 依賴：排程依 Wave 2 資料庫確定的通知狀態、`next_attempt_at` 與唯一索引決定檢查、領取與恢復處理的寫入方式；依 Wave 1 通知服務確定的回應分類決定自動重試、送出失敗與結果不明的轉換。
- 排序理由：排程同時使用 Wave 1 通知服務的回應分類與 Wave 2 資料庫的通知狀態欄位，必須等兩者都確定後才能分析，所以排在最後。
