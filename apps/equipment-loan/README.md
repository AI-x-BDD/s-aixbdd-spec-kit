# 精密實驗設備借用中心（設備借用與預約審核系統）

本目錄（`apps/equipment-loan/`）為「設備借用與預約審核系統」的原始碼與跨前後端測試入口。

## 1. 環境需求

- Node.js 24 LTS 以上
- Docker 與 Docker Compose（用於啟動 PostgreSQL 18 容器）

## 2. 快速啟動步驟

在 `apps/equipment-loan/` 目錄下依序執行：

```bash
# 1. 安裝頂層、後端與前端依賴
npm install
npm --prefix backend install
npm --prefix frontend install

# 2. 建立後端環境變數檔（若尚未建立）
cp -n backend/.env.example backend/.env || true

# 3. 啟動 PostgreSQL 18 容器
docker compose up -d --wait

# 4. 套用無損 Prisma 資料庫遷移並載入預建展示資料（demo seed）
npm run db:migrate
npm run db:seed

# 5. 啟動後端（http://localhost:3000/api）與前端（http://localhost:5173）
npm --prefix backend run dev
npm --prefix frontend run dev
```

## 3. 重設展示資料（Demo Seed）與預建設定

隨時可在 `apps/equipment-loan/` 執行下列指令重設預建帳號、4 台單件設備、3 個單日固定時段與涵蓋四種審核狀態的 10 筆範例預約紀錄：

```bash
npm run db:seed
```

### 3.1 預建測試帳號

| 角色 | 姓名 | 登入帳號 | 登入密碼 |
| --- | --- | --- | --- |
| 一般成員 (`member`) | 林雅婷 | `lin.yating` | `Member@2026` |
| 一般成員 (`member`) | 陳冠廷 | `chen.guanting` | `Member@2026` |
| 管理員 (`admin`) | 吳承翰 | `wu.chenghan` | `Admin@2026` |

> 登入時需同時輸入畫面上顯示的 7 位數英數驗證碼（嚴格區分英文大小寫，有效期限 5 分鐘，單次送出或重整後立即失效）；也可直接點擊登入頁右側「預建展示帳號快速帶入」按鈕自動填入。

### 3.2 預建單件設備與人工審核模式（迭代 2 擴充）

| 設備編號 | 設備名稱 | 分類 | 預設審核模式 (`requires_approval`) |
| --- | --- | --- | --- |
| `EQ-101` | 高解析度光學顯微鏡 Olympus BX53 | 光學檢測 | 需人工審核（送出進入 `pending_approval`，核准前不占用時段） |
| `EQ-102` | 四通道數位示波器 Keysight DSOX3024T | 電子量測 | 需人工審核（送出進入 `pending_approval`，核准前不占用時段） |
| `EQ-103` | 高精度工業熱像儀 FLIR E86 | 熱流分析 | 免審核（送出立即成為 `confirmed` 已核准／有效並占用時段） |
| `EQ-104` | 微量分光光度計 Thermo NanoDrop One | 生醫分析 | 免審核（送出立即成為 `confirmed` 已核准／有效並占用時段） |

### 3.3 預建四種狀態範例紀錄與展示情境

- **待審核 (`pending_approval`)**：
  - `RV-20261109-08`（林雅婷）與 `RV-20261109-09`（陳冠廷）同時申請 `EQ-101` 明日晚間 `18:00–21:00`：管理員核准其中一筆後，再核准另一筆會觸發 `409 RESERVATION_CONFLICT` 時段衝突攔截，可接著填寫原因駁回。
  - `RV-20261109-10`（林雅婷，`EQ-102` 後日下午 `13:00–17:00`）：其他成員檢視同一時段仍顯示「可預約」（待審不占位）。
- **已核准／有效 (`confirmed`)**：`RV-20261108-01`（第一版無損遷移）、`RV-20261108-03`、`RV-20261108-04`（管理員核准）、`RV-20261108-05`（免審核直接成立）。
- **已駁回 (`rejected`)**：`RV-20261109-07`（林雅婷，`EQ-102` 明日下午 `13:00–17:00`，附駁回原因，該時段已釋出可重新申請）。
- **已取消 (`cancelled`)**：`RV-20261108-02`、`RV-20261107-06`。

## 4. 靜態檢查與自動化測試

在 `apps/equipment-loan/` 目錄下執行：

```bash
# 型別檢查（tsc --noEmit）、ESLint 10 與 Prettier 檢查
npm run check

# 後端單元與整合測試（Vitest 5 + Supertest 7 + 真實 PostgreSQL 18）
npm run test:backend

# 前端單元測試（Vitest 5）
npm run test:frontend

# 跨前後端端對端測試（Playwright 1.65）
npm run test:e2e
```
