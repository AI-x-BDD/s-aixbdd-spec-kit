# 技術堆疊 (Tech Stack): 照片相簿日期分組與拖放整理系統

**Feature Branch**: `001-photo-album-organizer`  
**Date**: 2026-10-20  
**Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)

## 技術堆疊總覽

| 分層 | 技術 | 版本 | 用途 | 決策來源 |
| ---- | ---- | ---- | ---- | -------- |
| 執行環境 | Node.js | 20 LTS 以上 | 後端執行環境 | research §3 |
| 前端 | Vite | — | 開發伺服器與打包 | research §1 |
| 前端 | 原生 HTML5 / CSS3 / JavaScript (ES Modules) | ES2022 以上 | 畫面、版面與互動邏輯 | research §1、§2 |
| 前端 | HTML5 Drag and Drop API + Pointer Events | — | 拖放排序與觸控支援 | research §2 |
| 後端 | Express | 5 | HTTP 路由層 | research §3 |
| 後端 | `multer` | — | 照片上傳解析 | research §3 |
| 後端 | `sharp` | — | 產生縮圖、取出 EXIF | research §3 |
| 後端 | `exif-reader` | — | 解析拍攝日期 | research §3 |
| 後端 | `mysql2/promise` | — | MySQL 連線池 | research §3 |
| 資料儲存 | MySQL | 8.0 以上 | 相簿與照片中繼資料 | research §4 |
| 資料儲存 | 本機磁碟 `backend/uploads/` | — | 原圖與縮圖檔案 | research §3 |
| 品質與測試 | ESLint + Prettier | — | 靜態分析與格式化 | research §5 |
| 品質與測試 | TypeScript (`tsc --noEmit --checkJs`) | — | JSDoc 型別檢查 | research §5 |
| 品質與測試 | Vitest + Supertest | — | 單元、整合與 API 測試 | research §5 |
| 品質與測試 | Playwright | — | 端對端測試 | research §5 |

## 本次開發不引入的技術

| 技術 | 不引入原因 | 決策來源 |
| ---- | ---------- | -------- |
| React / Vue | 使用者指定不用前端框架 | research §1 |
| SortableJS / Dragula | 屬於第三方拖放套件 | research §2 |
| AWS S3 / Cloudinary | 使用者指定不用第三方系統 | research §3 |
| MySQL BLOB / Base64 存圖 | 查詢超出效能預算 | research §3 |
| 浮點數 / LexoRank 排序 | 需要定期重新正規化 | research §4 |
| Jest / Mocha | ESM 支援需額外設定 | research §5 |
