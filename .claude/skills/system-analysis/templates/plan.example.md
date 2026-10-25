# Implementation Plan: 照片相簿日期分組與拖放整理系統 (Photo Album Organizer)

**Branch**: `001-photo-album-organizer` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-photo-album-organizer/spec.md`

## Project Structure

### Documentation (this feature)

```text
specs/001-photo-album-organizer/
├── plan.md              # 本實作計畫文件 (/speckit.plan 產出)
├── research.md          # Phase 0 技術研究與決策紀錄 (/speckit.plan 產出)
├── data-model.md        # Phase 1 MySQL 資料模型與狀態轉換設計 (/speckit.plan 產出)
├── quickstart.md        # Phase 1 快速啟動與端對端驗證指南 (/speckit.plan 產出)
├── contracts/           # Phase 1 前後端 REST API 介面契約 (/speckit.plan 產出)
│   └── rest-api.md
└── tasks.md             # Phase 2 實作任務清單 (將由 /speckit.tasks 產出)
```

### Source Code (repository root)

```text
backend/
├── package.json
├── .env.example
├── src/
│   ├── server.js                # Express 應用程式入口與靜態圖片路由掛載
│   ├── config/
│   │   └── db.js                # MySQL2 連線池設定與初始化腳本
│   ├── models/
│   │   ├── schema.sql           # albums 與 photos 資料表 DDL
│   │   ├── albumRepository.js   # 相簿 CRUD 與年月分組查詢
│   │   └── photoRepository.js   # 照片新增、刪除、同相簿重排與跨相簿移動 Transaction
│   ├── services/
│   │   ├── albumService.js      # 相簿商業邏輯與連動清理實體圖片檔
│   │   └── photoService.js      # 圖片格式/20MB 驗證、EXIF 日期解析與縮圖生成
│   ├── api/
│   │   ├── albumsRouter.js      # /api/albums 路由控制器
│   │   ├── photosRouter.js      # /api/photos 路由控制器與 multer 上傳中介層
│   │   └── errorHandler.js      # 統一繁體中文錯誤回應中介層
│   └── utils/
│       └── dateGroupFormatter.js # YYYY-MM 轉「YYYY 年 M 月」分組聚合工具
├── uploads/
│   ├── originals/               # 儲存上傳之原始圖片檔
│   └── thumbnails/              # 儲存平鋪式預覽專用縮圖
└── tests/
    ├── unit/                    # 日期分組、檔案驗證與排序邏輯單元測試
    └── integration/             # REST API 與 MySQL 整合測試 (Supertest)

frontend/
├── package.json
├── vite.config.js               # Vite 設定（含 /api 與 /uploads 代理設定）
├── index.html                   # 應用程式主頁面語意化 HTML5 結構
├── src/
│   ├── main.js                  # 前端初始化入口與事件綁定
│   ├── styles/
│   │   ├── variables.css        # 設計系統變數（色彩、間距、字體、陰影）
│   │   ├── layout.css           # 主頁面、日期分組標題與相簿卡片佈局
│   │   └── photo-grid.css       # 平鋪式網格預覽與拖放視覺回饋樣式
│   ├── services/
│   │   └── apiClient.js         # 封裝向後端查詢、上傳、刪除與拖放排序之 Fetch API
│   ├── state/
│   │   └── store.js             # 前端狀態管理（相簿分組狀態、樂觀更新與錯誤還原快照）
│   ├── components/
│   │   ├── DateGroupSection.js  # 「年＋月」日期分組區塊渲染元件
│   │   ├── AlbumCard.js         # 單層相簿區塊（含標題、展開/收合控制、平鋪照片網格）
│   │   ├── PhotoTile.js         # 單張平鋪照片縮圖項目與無障礙操作按鈕
│   │   ├── UploadModal.js       # 匯入照片與建立/選擇相簿對話框
│   │   ├── ConfirmDialog.js     # 刪除含照片相簿之繁體中文確認提示框
│   │   └── Toast.js             # 繁體中文操作回饋與略過檔案錯誤通知
│   └── controllers/
│       └── dragDropController.js # 主頁照片同相簿重排與跨相簿移動拖放控制器
└── tests/
    ├── unit/                    # 前端狀態管理、日期格式化與拖放計算單元測試
    └── e2e/                     # Playwright 端對端驗收測試
```

**Structure Decision**: 採用 **Web application (`frontend/` + `backend/`)**
雙目錄結構。前端使用 Vite 與純原生 HTML/CSS/JavaScript 保持極簡與零框架複雜度；後端使用 Node.js +
MySQL 獨立負責照片檔案接收、縮圖生成、EXIF 日期提取與資料庫持久化，前後端職責邊界清晰且易於獨立測試。

## 分析流程規劃

### 系統介面盤點

本次需求涉及 3 種技術端點：前端、後端、資料庫，共盤出 10 個介面。

| 編號 | 介面 | 端點類型 | 需求依據 |
| --- | --- | --- | --- |
| F1 | 主頁日期分組相簿瀏覽介面 | 前端（使用者 → 前端） | US1 情境 1；FR-003 依「年＋月」分組、由新到舊排列；FR-004 不提供嵌套操作 |
| F2 | 相簿管理與照片匯入介面 | 前端（使用者 → 前端） | US1 情境 2；FR-001 匯入時選擇既有相簿或建立新相簿；FR-002 刪除含照片相簿前的確認提示；Edge Cases 不支援或超過 20 MB 的檔案提示 |
| F3 | 相簿平鋪式照片預覽介面 | 前端（使用者 → 前端） | US2 情境 1–3；FR-005 主頁內嵌展開與收合；SC-003 200 張照片 2 秒內呈現 |
| F4 | 照片拖放整理介面 | 前端（使用者 → 前端） | US3 情境 1–3；FR-006 同相簿重排；FR-007 跨相簿移動；FR-008 拖放視覺回饋；Edge Cases 拖放中斷時還原 |
| B1 | 照片匯入與歸檔 API | 後端（前端 → 後端） | FR-001 支援 JPEG/JPG、PNG、WebP、GIF、AVIF 與 20 MB 上限；Edge Cases 缺少 EXIF 時改用檔案修改日期 |
| B2 | 相簿管理 API | 後端（前端 → 後端） | FR-002 建立、修改名稱與日期、刪除相簿及移除單張照片；FR-004 拒絕嵌套相簿 |
| B3 | 日期分組相簿與照片查詢 API | 後端（前端 → 後端） | FR-003 年月分組與降序排列；FR-005 主頁一次取得各相簿的照片縮圖 |
| B4 | 照片排序與跨相簿移動 API | 後端（前端 → 後端） | FR-006、FR-007 拖放後更新順序與歸屬；FR-009 自動保存 |
| D1 | 相簿與照片資料存取 | 資料庫（後端 → MySQL） | Key Entities 相簿、照片；FR-002 刪除相簿時一併移除照片；FR-004 單層扁平結構 |
| D2 | 照片排序與歸屬持久化 | 資料庫（後端 → MySQL） | FR-009 持久化保存自訂順序；SC-005 重新載入後順序 100% 一致 |

### 分析流程安排

本次規劃 2 個 Wave。

**Wave 1：前端**

- 涵蓋介面：F1、F2、F3、F4
- 排序理由：US1 到 US3 都是使用者在主頁上的操作。先確定使用者看到哪些資料、做哪些操作，Wave 2 的後端才知道要提供哪些 API。

**Wave 2：後端、資料庫（2 個 Sub-agent 平行分析）**

- 涵蓋介面：B1、B2、B3、B4；D1、D2
- 依賴：後端依 Wave 1 盤出的前端操作設計 API；資料庫依 Wave 1 確定的查詢與排序操作（F1 年月分組瀏覽、F4 拖放排序），搭配 Key Entities 推出資料結構，不需要等後端 API 定案。
- 排序理由：後端和資料庫都只依賴 Wave 1 的結果，彼此之間沒有先後依賴，所以放在同一個 Wave 平行分析。
