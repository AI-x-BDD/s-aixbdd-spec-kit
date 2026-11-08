# 技術堆疊 (Tech Stack): 設備借用與預約系統 (Equipment Loan and Booking System)

**Feature Branch**: `003-equipment-loan-booking`  
**Date**: 2026-11-08  
**Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)

## 技術堆疊總覽

| 分層 | 角色 | 採用技術 | 決策來源 |
| ---- | ---- | -------- | -------- |
| 前端 | 畫面與互動 | React 19 | research §1 |
| 前端 | 開發伺服器與打包 | Vite 8、`@vitejs/plugin-react` 6 | research §1 |
| 開發語言 | 前後端程式語言 | TypeScript 6.0 | research §2 |
| 後端 | 執行環境 | Node.js 24 LTS 以上、`tsx` | research §2 |
| 後端 | HTTP API 與輸入驗證 | Express 5、zod 4 | research §3 |
| 資料儲存 | 帳號、驗證碼挑戰、工作階段、設備、固定時段與預約紀錄 | PostgreSQL 18、Prisma ORM 7.10、`@prisma/adapter-pg`、`pg` | research §4、§5 |
| 資料儲存 | 開發與測試資料庫容器 | Docker Compose | research §5 |
| 品質與測試 | 靜態檢查與格式化 | ESLint 10、`typescript-eslint` 8、Prettier | research §2 |
| 品質與測試 | 單元與整合測試 | Vitest 5、Supertest 7 | research §6 |
| 品質與測試 | 端對端測試 | Playwright（`@playwright/test` 1.65） | research §6 |

## 本次開發不引入的技術

| 技術類別 | 代表技術 | 決策來源 |
| -------- | -------- | -------- |
| 前端路由套件 | React Router | research §1 |
| 全域狀態管理套件 | Zustand、Redux Toolkit | research §1 |
| 國際化套件 | react-i18next | research §1 |
| 即時推播套件 | Socket.IO | research §3 |
| 第三方日期時間套件 | Luxon、Moment.js | research §3 |
| 第三方密碼雜湊套件 | `bcrypt` | research §4 |
| Cookie Session 套件 | `express-session` | research §4 |
| 無狀態權杖簽章套件 | `jsonwebtoken` | research §4 |
| 分散式鎖服務 | Redis | research §5 |
