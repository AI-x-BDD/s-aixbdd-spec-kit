# 一致性分析報告：購物車與結帳 (Shopping Cart and Checkout)

- **Spec 目錄**：`specs/004-shopping-cart-checkout/`
- **分析日期**：2026-11-04
- **已分析文件**：`spec.md`、`plan.md`、`tasks.md`、`research.md`、`techstack.md`、`contracts/openapi.yaml`、`data/data-model.dbml`、`ui/plan.md`
- **已讀取的憲法檔**：`shared.md`、`skills/api-plan/openapi.md`、`skills/data-plan/data-model.md`、`skills/tasks/tasks.md`、`skills/implement/code.md`
- **說明**：本報告不修改任何上游文件。

## 1. 問題清單

| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 | 處理 Skill |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | 憲法 | CRITICAL | `data/data-model.dbml` → `Table orders` | `orders` 沒有 `updated_at` 欄位，違反 `skills/data-plan/data-model.md` Rule 1「每張資料表必須有 `created_at` 與 `updated_at`」 | 在 `data/data-model.dbml` 的 `orders` 加上 `updated_at timestamp [not null]` | `data-plan` |
| F1 | 不一致 | HIGH | `spec.md` → FR-005；`contracts/openapi.yaml` → `applyDiscount` | FR-005 規定折扣碼每位顧客只能使用一次；`applyDiscount` 的 description 寫「同一折扣碼可重複套用」，實作會做出不同行為 | 需要使用者決定：以 FR-005 為準時，改 `contracts/openapi.yaml` 的 `applyDiscount` 並新增已使用的錯誤碼；以合約為準時，改 `spec.md` 的 FR-005 | 需要使用者決定（候選：`api-plan`、`s-specify`） |
| B1 | 歧義 | HIGH | `spec.md` → Edge Cases「庫存不足」 | 「盡快提示庫存不足」是效能描述，沒有量化標準 | 在 `spec.md` 的 Edge Cases 寫出提示時間，例如「1 秒內」 | `clarify-over-specs` |
| E2 | 涵蓋 | HIGH | `data/data-model.dbml` → `orders.order_no` | 受約束欄位 `orders.order_no` 的「驗證」（只含英文字母與數字）沒有任何實作任務在 Must Read 引用 | 在 `tasks.md` 產生訂單編號的 T009 的 Must Read 加入 `` `data/data-model.dbml` → `orders.order_no` `` | `tasks` |
| F4 | 不一致 | HIGH | `tasks.md` → T006；`data/data-model.dbml` → `cart_items.quantity` | T006 寫 `quantity` 可以調整為 0 並保留這一列；`cart_items.quantity` 的「驗證」為大於 0 | 以資料模型為準，改 T006：數量調整為 0 時刪除這一列 | `tasks` |
| F5 | 不一致 | HIGH | `tasks.md` → T005、T007 | T005 呼叫 T007 才建立的 `cartRepository.findByVariant()`，沒有寫依賴 | 把建立 `cartRepository.findByVariant()` 移到 T005 之前，或在 T005 寫出依賴 T007 | `tasks` |
| D2 | 憲法 | MEDIUM | `contracts/openapi.yaml` → `createOrder`、`payOrder` | 兩個 operation 沒有宣告 `429` 回應，違反 `skills/api-plan/openapi.md` Rule 3「每個 operation 應宣告 `429` 回應」 | 在 `createOrder` 與 `payOrder` 加上 `429` 回應，沿用 `components.responses` 的 `RateLimited` | `api-plan` |
| E1 | 涵蓋 | MEDIUM | `spec.md` → NFR-001 | NFR-001（結帳頁在 2 秒內顯示）沒有任何任務引用 | 在 `tasks.md` 的 Polish Phase 加一個量測結帳頁載入時間的任務，引用 NFR-001 | `tasks` |
| F2 | 不一致 | MEDIUM | `contracts/openapi.yaml` → schema `OrderStatus`；`data/data-model.dbml` → `Enum order_status` | 合約的 `PAID`、`FAILED` 與資料表的 `paid`、`payment_failed` 可以一一對應，但命名與大小寫不同 | 以 `data/data-model.dbml` 的 `order_status` 為準，把 `OrderStatus` 的值改為 `paid`、`payment_failed` | `api-plan` |
| F3 | 不一致 | MEDIUM | `contracts/openapi.yaml` → `payOrder` 的 `PAYMENT_DECLINED`；`ui/plan.md` → §5 | 已記錄：tasks.md 待確認 1。付款被拒的錯誤碼 `PAYMENT_DECLINED` 在 `ui/plan.md` §5 沒有對應的畫面回饋 | 在 `ui/plan.md` §5 新增 `PAYMENT_DECLINED` 的提示文字與重試操作，並同步更新 `ui/checkout.html` | `ui-plan` |

超過 50 筆的部分：無（共 10 筆，未超過 50 筆）

## 2. 需求涵蓋

| 需求編號 | 計入涵蓋率 | 有任務 | 任務 ID | 備註 |
| --- | --- | --- | --- | --- |
| FR-001 | 是 | 是 | T003、T005、T008 | |
| FR-002 | 是 | 是 | T006、T008 | |
| FR-003 | 是 | 是 | T007、T008 | |
| FR-004 | 是 | 是 | T003、T009、T011 | |
| FR-005 | 是 | 是 | T009、T011 | 見 F1 |
| FR-006 | 是 | 是 | T010、T011 | |
| NFR-001 | 是 | 否 | — | 見 E1 |
| SC-001 | 否 | 否 | — | 上線後指標（上線後一季的結帳完成率），不計入涵蓋率 |

## 3. 介面涵蓋

| 介面 | 端點類型 | Planner 產出 | 任務 | 備註 |
| --- | --- | --- | --- | --- |
| F1 購物車畫面 | 前端 | `ui/plan.md` → §3.1 | T008 | |
| F2 結帳畫面 | 前端 | `ui/plan.md` → §3.1、§5 | T011 | 見 F3 |
| B1 購物車 API | 後端 | `contracts/openapi.yaml` → `addCartItem`、`updateCartItem`、`removeCartItem` | T005、T006、T007 | |
| B2 結帳與付款 API | 後端 | `contracts/openapi.yaml` → `applyDiscount`、`createOrder`、`payOrder` | T009、T010 | 見 F1、D2 |
| D1 購物車與訂單資料 | 資料庫 | `data/data-model.dbml` → `Table carts`、`Table cart_items`、`Table orders` | T003 | 見 D1 |

## 4. 欄位涵蓋

| 欄位 | 資料模型位置 | 規則 | 實作任務 | 備註 |
| --- | --- | --- | --- | --- |
| `cart_items.quantity` | `data/data-model.dbml:64` | 驗證 | T003、T006 | 見 F4 |
| `orders.order_no` | `data/data-model.dbml:77` | 驗證 | — | 見 E2 |
| `orders.status` | `data/data-model.dbml:79` | 轉換 | T003、T010 | |

## 5. 憲法遵循

| 憲法檔 | Rule | 適用產出物 | 結果 | 問題 ID |
| --- | --- | --- | --- | --- |
| `shared.md` | Rule 1 對使用者顯示的文字必須使用臺灣繁體中文 | `spec.md`、`ui/plan.md`、`ui/*.html` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 1 錯誤回應必須使用 `{ code, message }` 結構 | `contracts/openapi.yaml` | 通過 | — |
| `skills/api-plan/openapi.md` | Rule 2 每個 operation 的 `tags` 必須使用資源名稱，例如 `cart` | `contracts/openapi.yaml` | 不套用（鎖定項目） | — |
| `skills/api-plan/openapi.md` | Rule 3 每個 operation 應宣告 `429` 回應 | `contracts/openapi.yaml` | 違反 | D2 |
| `skills/data-plan/data-model.md` | Rule 1 每張資料表必須有 `created_at` 與 `updated_at` | `data/data-model.dbml` | 違反 | D1 |
| `skills/tasks/tasks.md` | Rule 1 每個任務描述應寫出檔案路徑 | `tasks.md` | 通過 | — |
| `skills/implement/code.md` | Rule 1 程式碼必須啟用 TypeScript `strict` | 程式碼 | 不適用 | — |

## 6. 沒有對應需求的任務

- T001（Phase 1 Setup）：建立專案目錄結構。
- T002（Phase 1 Setup）：設定 ESLint 與 Prettier。
- T004（Phase 2 Foundational）：建立後端共用錯誤處理。
- T012（Phase 6 Polish）：執行整體 lint 與型別檢查。

## 7. 統計

| 項目 | 數字 |
| --- | --- |
| 需求總數 | 8 |
| 不計入涵蓋率的 SC | 1（SC-001） |
| 計入涵蓋率的需求數 | 7 |
| 有任務的需求數 | 6 |
| 涵蓋率 | 85.7% |
| 任務總數 | 12 |
| 介面總數 | 5 |
| 沒有 Planner 產出的介面數 | 0 |
| 沒有任務的介面數 | 0 |
| 受約束欄位數 | 3 |
| 沒有 Must Read 引用的受約束欄位數 | 1 |
| 找不到的欄位引用數 | 0 |
| 問題數（依類別） | A 0、B 1、C 0、D 2、E 2、F 5 |
| 問題數（依嚴重度） | CRITICAL 1、HIGH 5、MEDIUM 4、LOW 0 |

## 8. 下一步

- 有 CRITICAL 問題：`implement` 前先處理 D1，請用 `data-plan` 修正 `data/data-model.dbml`，再重新執行 `analyze`。
- F1 需要使用者決定以 `spec.md` 或 `contracts/openapi.yaml` 為準，決定後交給對應的處理 Skill。
- HIGH 的 B1、E2、F4、F5 建議在 `implement` 前處理：B1 用 `clarify-over-specs`，E2、F4、F5 用 `tasks`。
- D2、E1、F2、F3 可以一併處理。
