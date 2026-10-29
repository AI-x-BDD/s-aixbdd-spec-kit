# 技術堆疊 (Tech Stack): 線上 PVP 1A2B 猜數字對戰平台 (Online PVP 1A2B)

**Feature Branch**: `001-online-pvp-1a2b`  
**Date**: 2026-10-29  
**Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)

## 技術堆疊總覽

| 分層 | 角色 | 採用技術 | 決策來源 |
| ---- | ---- | -------- | -------- |
| 前端 | 畫面與互動 | React 19 | research §1 |
| 前端 | 開發伺服器與打包 | Vite 8、`@vitejs/plugin-react` 6 | research §1 |
| 前端 | 即時事件接收 | `socket.io-client` 4.8 | research §4 |
| 開發語言 | 前後端程式語言 | TypeScript 6.0 | research §2 |
| 後端 | 執行環境 | Node.js 24 LTS、`tsx` | research §2 |
| 後端 | HTTP API 與輸入驗證 | Express 5、zod 4 | research §3 |
| 後端 | 即時推播與斷線偵測 | Socket.IO 4.8 | research §4 |
| 資料儲存 | 玩家、房間、秘密答案與猜測紀錄 | PostgreSQL 18、Prisma ORM 7.10、`@prisma/adapter-pg`、`pg` | research §6、§7、§8 |
| 資料儲存 | 開發與測試資料庫容器 | Docker Compose | research §6 |
| 品質與測試 | 靜態檢查與格式化 | ESLint 10、`typescript-eslint` 8、Prettier | research §2 |
| 品質與測試 | 單元與整合測試 | Vitest 5、Supertest 7、`socket.io-client` 4.8 | research §9 |
| 品質與測試 | 端對端測試 | Playwright（`@playwright/test` 1.64） | research §9 |

## 本次開發不引入的技術

| 技術類別 | 代表技術 | 決策來源 |
| -------- | -------- | -------- |
| 前端路由套件 | React Router | research §1 |
| 全域狀態管理套件 | Zustand、Redux Toolkit | research §1 |
| 國際化套件 | react-i18next | research §1 |
| Cookie Session | express-session | research §5 |
| 權杖簽章套件 | `jsonwebtoken` | research §5 |
| 分散式鎖服務 | Redis | research §7 |
