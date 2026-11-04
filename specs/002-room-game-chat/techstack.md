# 技術堆疊 (Tech Stack): 1A2B 房間與對局聊天 (Room and Game Chat)

**Feature Branch**: `002-room-game-chat`  
**Date**: 2026-11-04  
**Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)

## 技術堆疊總覽

| 分層 | 角色 | 採用技術 | 決策來源 |
| ---- | ---- | -------- | -------- |
| 前端 | 聊天區畫面與狀態 | React 19 | research §5、§7 |
| 前端 | 即時事件接收 | `socket.io-client` 4.8 | research §2 |
| 後端 | HTTP API 與輸入驗證 | Express 5、zod 4 | research §2、§3、§5 |
| 後端 | 即時推播 | Socket.IO 4.8 | research §2 |
| 資料儲存 | 聊天訊息 | PostgreSQL 18、Prisma ORM 7.10、`@prisma/adapter-pg`、`pg` | research §1、§4、§6 |
| 資料儲存 | 測試資料庫容器 | Docker Compose | research §8 |
| 品質與測試 | 單元測試 | Vitest 5 | research §8 |
| 品質與測試 | API 與推播測試 | Supertest 7、`socket.io-client` 4.8 | research §8 |
| 品質與測試 | 端對端測試 | Playwright（`@playwright/test` 1.64） | research §8 |

## 本次開發不引入的技術

| 技術類別 | 代表技術 | 決策來源 |
| -------- | -------- | -------- |
| 記憶體資料庫服務 | Redis | research §1、§6 |
| 請求頻率限制套件 | express-rate-limit、`rate-limit-redis` | research §6 |
| 字元切分套件 | `graphemer` | research §5 |
| HTML 淨化套件 | DOMPurify | research §5 |
