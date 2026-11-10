# 技術堆疊 (Tech Stack): 設備送修與停用、恢復可用及受影響未來預約的處理 (Equipment Maintenance and Retirement)

**Feature Branch**: `007-equipment-maintenance-retire`  
**Date**: 2026-11-10  
**Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)

## 技術堆疊總覽

| 分層 | 角色 | 採用技術 | 決策來源 |
| ---- | ---- | -------- | -------- |
| 前端 | 畫面與互動 | React 19 | research §4 |
| 前端 | 開發伺服器與打包 | Vite 8、`@vitejs/plugin-react` 6 | research §4 |
| 開發語言 | 前後端程式語言 | TypeScript 6.0 | research §2、§4 |
| 後端 | 執行環境 | Node.js 24 LTS 以上、`tsx` | research §2 |
| 後端 | HTTP API 與輸入驗證 | Express 5、zod 4 | research §2 |
| 資料儲存 | 帳號、工作階段、設備與設備狀態變更紀錄、固定時段、預約借還紀錄與改期申請 | PostgreSQL 18、Prisma ORM 7.10、`@prisma/adapter-pg`、`pg` | research §1、§2、§3、§5 |
| 資料儲存 | 開發與測試資料庫容器 | Docker Compose | research §1 |
| 品質與測試 | 靜態檢查與格式化 | ESLint 10、`typescript-eslint` 8、Prettier | research §4 |
| 品質與測試 | 單元、整合與遷移測試 | Vitest 5、Supertest 7 | research §5 |
| 品質與測試 | 端對端測試 | Playwright（`@playwright/test` 1.65） | research §5 |

## 本次開發不引入的技術

| 技術類別 | 代表技術 | 決策來源 |
| -------- | -------- | -------- |
| 狀態機套件 | XState | research §2 |
| 外部通知服務 | Discord Webhook | research §2 |
| 排程與背景工作 | `node-cron` | research §2 |
| 分散式鎖與快取服務 | Redis | research §3 |
| 對話框元件套件 | Radix UI Dialog | research §4 |
| 前端路由套件 | React Router | research §4 |
| 全域狀態管理套件 | Zustand | research §4 |
