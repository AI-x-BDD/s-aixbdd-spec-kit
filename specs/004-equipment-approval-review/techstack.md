# 技術堆疊 (Tech Stack): 設備人工審核設定與預約申請審核 (Equipment Approval Settings and Reservation Review)

**Feature Branch**: `004-equipment-approval-review`  
**Date**: 2026-11-09  
**Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)

## 技術堆疊總覽

| 分層 | 角色 | 採用技術 | 決策來源 |
| ---- | ---- | -------- | -------- |
| 前端 | 畫面與互動 | React 19 | research §3 |
| 前端 | 開發伺服器與打包 | Vite 8、`@vitejs/plugin-react` 6 | research §3 |
| 開發語言 | 前後端程式語言 | TypeScript 6.0 | research §4 |
| 後端 | 執行環境 | Node.js 24 LTS 以上、`tsx` | research §4 |
| 後端 | HTTP API 與輸入驗證 | Express 5、zod 4 | research §2 |
| 資料儲存 | 帳號、驗證碼挑戰、工作階段、設備審核設定、固定時段與預約審核紀錄 | PostgreSQL 18、Prisma ORM 7.10、`@prisma/adapter-pg`、`pg` | research §1、§4 |
| 資料儲存 | 開發與測試資料庫容器 | Docker Compose | research §1 |
| 品質與測試 | 靜態檢查與格式化 | ESLint 10、`typescript-eslint` 8、Prettier | research §4 |
| 品質與測試 | 單元與整合測試 | Vitest 5、Supertest 7 | research §5 |
| 品質與測試 | 端對端測試 | Playwright（`@playwright/test` 1.65） | research §5 |

## 本次開發不引入的技術

| 技術類別 | 代表技術 | 決策來源 |
| -------- | -------- | -------- |
| 分散式鎖服務 | Redis | research §1 |
| 狀態機套件 | XState | research §2 |
| 即時推播套件 | Socket.IO | research §2 |
| 第三方日期時間套件 | Luxon、Moment.js | research §2 |
| 前端路由套件 | React Router | research §3 |
| 全域狀態管理套件 | Zustand、Redux Toolkit | research §3 |
| 國際化套件 | react-i18next | research §3 |
| 第三方密碼雜湊套件 | `bcrypt` | research §4 |
| Cookie Session 套件 | `express-session` | research §4 |
| 無狀態權杖簽章套件 | `jsonwebtoken` | research §4 |
