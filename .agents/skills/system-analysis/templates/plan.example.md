# Implementation Plan: 購物車與結帳

**Branch**: `004-shopping-cart-checkout` | **Date**: 2026-10-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-shopping-cart-checkout/spec.md`

## Project Structure

### Documentation (this feature)

```text
specs/004-shopping-cart-checkout/
├── spec.md                  # 購物車與結帳的功能需求規格
├── research.md              # 技術研究與選型決策紀錄
├── techstack.md             # 採用與不引入的技術堆疊總覽
├── plan.md                  # 本系統分析規劃文件
├── contracts/               # 後端介面合約
│   ├── openapi.yaml         # 購物車、結帳下單、綠界付款結果通知與訂單查詢的 HTTP 合約（OpenAPI 3.1）
│   └── asyncapi.yaml        # 訂單付款狀態推播的 Socket.IO 事件合約（AsyncAPI 3.0）
├── data/                    # 資料模型
│   └── data-model.dbml      # 商品、購物車、訂單與付款紀錄的 PostgreSQL 資料模型（DBML）
└── ui/                      # 前端畫面規劃與雛形
    ├── plan.md              # 畫面範疇、視覺風格、畫面與流程、狀態、驗證與錯誤回饋
    └── index.html           # 可互動雛形入口，其餘頁面依畫面流程決定
```

### Source Code (repository root)

```text
frontend/
├── package.json
├── vite.config.js                # Vite 設定（含 /api 與 Socket.IO 代理）
├── index.html                    # Vue 應用程式掛載頁
├── src/
│   ├── main.js                   # Vue 應用程式入口
│   ├── App.vue                   # 頁首導覽、購物車件數與畫面切換
│   ├── api/
│   │   ├── httpClient.js         # 購物車、結帳下單與訂單查詢的 REST 呼叫
│   │   └── orderSocket.js        # Socket.IO 連線與訂單付款狀態事件訂閱
│   ├── composables/
│   │   └── useCart.js            # 購物車內容、件數與庫存不足提示的共用狀態
│   ├── views/
│   │   ├── ProductListView.vue   # 商品列表與規格選擇
│   │   ├── CartView.vue          # 購物車檢視、數量調整與移除
│   │   ├── CheckoutView.vue      # 收件資料、前往綠界付款與付款結果
│   │   └── OrdersView.vue        # 訂單明細與付款狀態
│   └── components/
│       ├── VariantPicker.vue     # 商品規格與數量選擇面板
│       └── EcpayRedirectForm.vue # 以後端回傳的付款參數自動送出綠界付款表單
└── tests/
    ├── unit/                     # 購物車狀態與收件資料驗證的單元測試
    └── e2e/                      # 加入購物車到付款結果顯示的端對端測試

backend/
├── package.json
├── .env.example                  # PostgreSQL 連線字串與綠界 MerchantID、HashKey、HashIV
├── src/
│   ├── server.js                 # Express 與 Socket.IO 共用的 HTTP 伺服器入口
│   ├── routes/
│   │   ├── cartRouter.js         # /cart 購物車路由
│   │   ├── ordersRouter.js       # /orders 結帳下單與訂單查詢路由
│   │   └── ecpayRouter.js        # /payments/ecpay/notify 綠界付款結果通知路由
│   ├── realtime/
│   │   └── orderEvents.js        # 付款結果更新後推播給結帳頁的 Socket.IO 事件
│   ├── services/
│   │   ├── cartService.js        # 庫存檢查、已下架商品處理與數量調整
│   │   ├── orderService.js       # 建立訂單、付款逾時與付款結果更新
│   │   └── ecpayService.js       # 綠界付款參數組裝與 CheckMacValue 產生、驗證
│   ├── db/
│   │   ├── pool.js               # PostgreSQL 連線池
│   │   └── schema.sql            # 商品、購物車、訂單與付款紀錄資料表 DDL
│   └── middleware/
│       └── errorHandler.js       # 統一繁體中文錯誤回應
└── tests/
    ├── unit/                     # CheckMacValue 與庫存規則的單元測試
    └── integration/              # REST API、付款結果通知與 PostgreSQL 的整合測試
```

**Structure Decision**: 採用 **Web application（`frontend/` + `backend/`）** 雙目錄結構。前端使用 Vue 3＋Vite
負責商品、購物車、結帳與訂單畫面；後端使用 Node.js＋Express 提供 REST API，並在同一個 HTTP 伺服器掛載
Socket.IO 推播付款結果。綠界 ECPay 全方位金流的參數組裝與 CheckMacValue 驗證、PostgreSQL 存取都由後端負責，
不是獨立部署的程式碼，所以不另建頂層目錄。

## 分析流程規劃

### 系統介面盤點

本次需求涉及 4 種技術端點：前端、後端、資料庫、金流，共盤出 12 個介面。

| 編號 | 介面 | 端點類型 | 需求依據 |
| --- | --- | --- | --- |
| F1 | 商品加入購物車介面 | 前端（使用者 → 前端） | US1 情境 1；FR-001 加入商品時選擇規格；FR-003 庫存不足時拒絕並提示；SC-001 加入購物車 1 秒內完成；Edge Cases 商品已下架 |
| F2 | 購物車檢視與數量調整介面 | 前端（使用者 → 前端） | US1 情境 2；FR-002 調整數量與移除商品；Edge Cases 數量超過庫存 |
| F3 | 結帳與付款結果介面 | 前端（使用者 → 前端） | US2 情境 1–3；FR-004 填寫收件資料並建立訂單；FR-005 導向綠界付款；FR-007 付款完成後結帳頁即時顯示結果；Edge Cases 付款逾時 |
| F4 | 訂單查詢介面 | 前端（使用者 → 前端） | US3 情境 1；FR-008 查看訂單明細與付款狀態 |
| B1 | 購物車 API | 後端（前端 → 後端） | FR-001 加入商品與規格；FR-002 調整數量與移除；FR-003 庫存不足時拒絕；Edge Cases 商品已下架、數量超過庫存 |
| B2 | 結帳下單 API | 後端（前端 → 後端） | US2 情境 1；FR-004 建立訂單；FR-005 回傳導向綠界付款所需的資訊 |
| B3 | 綠界付款結果通知接收 API | 後端（綠界 → 後端） | FR-006 接收綠界付款結果並更新訂單；NFR-001 付款通知須驗證 CheckMacValue；Edge Cases 重複的付款通知 |
| B4 | 訂單付款狀態推播 | 後端（前端 → Socket.IO） | US2 情境 3；FR-007 付款結果更新後即時推送到結帳頁；Edge Cases 付款逾時 |
| B5 | 訂單查詢 API | 後端（前端 → 後端） | US3 情境 1；FR-008 查詢訂單明細與付款狀態 |
| D1 | 購物車資料存取 | 資料庫（後端 → PostgreSQL） | Key Entities 商品、商品規格、購物車、購物車項目；FR-003 依規格庫存判斷是否可加入 |
| D2 | 訂單與付款紀錄持久化 | 資料庫（後端 → PostgreSQL） | Key Entities 訂單、訂單項目、付款紀錄；FR-006 依付款結果更新訂單狀態；Edge Cases 重複的付款通知不得重複入帳 |
| P1 | 綠界付款串接 | 金流（後端 → 綠界 ECPay） | US2 情境 2；FR-005 導向綠界全方位金流付款頁；FR-006 綠界回傳付款結果；NFR-001 CheckMacValue 產生與驗證 |

### 分析流程安排

本次規劃 2 個 Wave。

**Wave 1：前端、金流（2 個 Sub-agent 平行分析）**

- 涵蓋介面：F1、F2、F3、F4；P1
- 排序理由：US1 到 US3 都從使用者在商店頁面的操作開始，前端先確定使用者看到哪些資料、做哪些操作，後端才知道要提供哪些 API；金流只需要查閱綠界全方位金流的付款導向與付款結果通知規格，和前端分析沒有依賴，所以平行進行。

**Wave 2：後端、資料庫（2 個 Sub-agent 平行分析）**

- 涵蓋介面：B1、B2、B3、B4、B5；D1、D2
- 依賴：後端依 Wave 1 的前端操作（加入購物車、調整數量、結帳、查看訂單）與金流確定的付款導向參數、付款結果通知格式設計 API；資料庫依 Wave 1 確定的購物車操作與訂單付款狀態，搭配 Key Entities 推出資料結構，不需要等後端 API 定案。
- 排序理由：後端和資料庫都只依賴 Wave 1 的結果，彼此之間沒有先後依賴，所以放在同一個 Wave 平行分析。
