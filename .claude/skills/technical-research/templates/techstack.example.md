# 技術堆疊 (Tech Stack): 照片相簿日期分組與拖放整理系統

**Feature Branch**: `001-photo-album-organizer`  
**Date**: 2026-10-20  
**Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)

## 技術堆疊總覽

| 分層 | 角色 | 採用技術 | 決策來源 |
| ---- | ---- | -------- | -------- |
| 前端 | 畫面與互動 | 原生 HTML5 / CSS3 / JavaScript（ES2022 以上，ES Modules） | research §1、§2 |
| 前端 | 開發伺服器與打包 | Vite | research §1 |
| 後端 | 執行環境 | Node.js 20 LTS 以上 | research §3 |
| 後端 | HTTP API 與照片上傳 | Express 5、`multer` | research §3 |
| 後端 | 縮圖與拍攝日期解析 | `sharp`、`exif-reader` | research §3 |
| 資料儲存 | 相簿與照片中繼資料 | MySQL 8.0 以上、`mysql2/promise` | research §3、§4 |
| 資料儲存 | 原圖與縮圖檔案 | 本機磁碟 `backend/uploads/` | research §3 |
| 品質與測試 | 靜態分析、格式化與型別檢查 | ESLint、Prettier、TypeScript（`tsc --noEmit --checkJs`） | research §5 |
| 品質與測試 | 單元、整合與 API 測試 | Vitest、Supertest | research §5 |
| 品質與測試 | 端對端測試 | Playwright | research §5 |

## 本次開發不引入的技術

| 技術類別 | 代表技術 | 決策來源 |
| -------- | -------- | -------- |
| 前端框架 | React、Vue | research §1 |
| 第三方拖放套件 | SortableJS、Dragula | research §2 |
| 雲端儲存服務 | AWS S3、Cloudinary | research §3 |
