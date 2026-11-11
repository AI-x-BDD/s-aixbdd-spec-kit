# 技術堆疊 (Tech Stack): 逾期借用的 Discord 通知、送出結果查看與重送、手動逾期檢查 (Overdue Discord Notification)

**Feature Branch**: `008-overdue-discord-notification`  
**Date**: 2026-11-11  
**Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)

## 技術堆疊總覽

| 分層 | 角色 | 採用技術 | 決策來源 |
| ---- | ---- | -------- | -------- |
| 前端 | 畫面與互動 | React 19 | research §7 |
| 前端 | 開發伺服器與打包 | Vite 8、`@vitejs/plugin-react` 6 | research §7 |
| 開發語言 | 前後端程式語言 | TypeScript 6.0 | research §4、§7 |
| 後端 | 執行環境 | Node.js 24 LTS 以上、`tsx` | research §2、§3、§5、§6 |
| 後端 | HTTP API 與輸入驗證 | Express 5、zod 4 | research §4、§5 |
| 資料儲存 | 帳號、工作階段、設備與設備狀態變更紀錄、固定時段、預約借還紀錄、改期申請與逾期通知紀錄 | PostgreSQL 18、Prisma ORM 7.10、`@prisma/adapter-pg`、`pg` | research §1、§2、§4、§8 |
| 資料儲存 | 開發與測試資料庫容器 | Docker Compose | research §1 |
| 外部服務 | 逾期通知訊息 | Discord Webhook | research §3 |
| 品質與測試 | 靜態檢查與格式化 | ESLint 10、`typescript-eslint` 8、Prettier | research §7 |
| 品質與測試 | 單元、整合與遷移測試 | Vitest 5、Supertest 7 | research §8 |
| 品質與測試 | 端對端測試 | Playwright（`@playwright/test` 1.65） | research §8 |

## 本次開發不引入的技術

| 技術類別 | 代表技術 | 決策來源 |
| -------- | -------- | -------- |
| 排程套件與資料庫排程擴充 | `node-cron`、`pg_cron` | research §2 |
| 工作佇列 | pg-boss、BullMQ | research §2 |
| 快取與佇列服務 | Redis | research §2、§4 |
| Discord 用戶端套件 | discord.js | research §3 |
| HTTP 用戶端套件 | axios、`undici` | research §3、§6 |
| 環境變數載入套件 | dotenv | research §5 |
| 日誌套件 | pino | research §5 |
| HTTP 模擬工具 | WireMock、msw、nock | research §6、§8 |
| 伺服器狀態管理套件 | TanStack Query | research §7 |
| 即時推播 | Socket.IO | research §7 |
| 對話框元件套件 | Radix UI Dialog | research §7 |
| 前端路由套件 | React Router | research §7 |
