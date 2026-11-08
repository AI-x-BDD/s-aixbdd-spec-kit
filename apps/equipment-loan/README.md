# 精密實驗設備借用中心（設備借用與預約系統）

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

# 4. 套用 Prisma 資料庫遷移並寫入預建展示資料（demo seed）
npm run db:migrate
npm run db:seed

# 5. 啟動後端（http://localhost:3000/api）與前端（http://localhost:5173）
npm --prefix backend run dev
npm --prefix frontend run dev
```

## 3. 重設展示資料（Demo Seed）

隨時可在 `apps/equipment-loan/` 執行下列指令重設預建帳號、4 台單件設備、3 個單日固定時段與範例預約紀錄：

```bash
npm run db:seed
```

### 預建測試帳號

| 角色 | 姓名 | 登入帳號 | 登入密碼 |
| --- | --- | --- | --- |
| 一般成員 (`member`) | 林雅婷 | `lin.yating` | `Member@2026` |
| 一般成員 (`member`) | 陳冠廷 | `chen.guanting` | `Member@2026` |
| 管理員 (`admin`) | 吳承翰 | `wu.chenghan` | `Admin@2026` |

> 登入時需同時輸入畫面上顯示的 7 位數英數驗證碼（嚴格區分英文大小寫，有效期限 5 分鐘，單次送出或重整後立即失效）；也可直接點擊登入頁右側「預建展示帳號快速帶入」按鈕自動填入。

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
