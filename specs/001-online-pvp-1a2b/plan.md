# Implementation Plan: 線上 PVP 1A2B 猜數字對戰平台 (Online PVP 1A2B)

**Branch**: `001-online-pvp-1a2b` | **Date**: 2026-10-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-online-pvp-1a2b/spec.md`

## Project Structure

### Documentation (this feature)

```text
specs/001-online-pvp-1a2b/
├── spec.md                  # 線上 PVP 1A2B 對戰平台的功能需求規格
├── research.md              # 技術研究與選型決策紀錄
├── techstack.md             # 採用與不引入的技術堆疊總覽
├── plan.md                  # 本系統分析規劃文件
├── contracts/               # 後端介面合約
│   ├── openapi.yaml         # 進站、配對、離開房間、開始遊戲、設定秘密答案與提交猜測的 HTTP 合約（OpenAPI 3.1）
│   └── asyncapi.yaml        # 房間狀態、輪次、猜測結果與對局結束推播的 Socket.IO 事件合約（AsyncAPI 3.0）
├── data/                    # 資料模型
│   └── data-model.dbml      # 玩家、房間、秘密答案與猜測紀錄的 PostgreSQL 資料模型（DBML）
└── ui/                      # 前端畫面規劃與雛形
    ├── plan.md              # 畫面範疇、視覺風格、畫面與流程、狀態、驗證與錯誤回饋
    └── index.html           # 可互動雛形入口，其餘頁面依畫面流程決定
```

### Source Code (repository root)

```text
frontend/
├── package.json
├── tsconfig.json                   # TypeScript 6.0 strict 設定
├── vite.config.ts                  # Vite 設定（含 /api 與 /socket.io 代理）
├── index.html                      # React 應用程式掛載頁
├── src/
│   ├── main.tsx                    # React 應用程式入口
│   ├── App.tsx                     # 頂層 useReducer 畫面狀態機（入口、房間、設定答案、對戰、結束）
│   ├── text/
│   │   └── zh-TW.ts                # 所有介面文字與後端錯誤碼的繁體中文對照
│   ├── api/
│   │   ├── httpClient.ts           # 帶 Bearer token 的 REST 呼叫
│   │   └── gameSocket.ts           # Socket.IO 連線與型別化事件訂閱（不自動重連）
│   ├── views/
│   │   ├── EntryView.tsx           # 暱稱進站與配對碼輸入
│   │   ├── RoomView.tsx            # 等待對手、玩家暱稱與房主標示、開始遊戲
│   │   ├── SecretSetupView.tsx     # 設定秘密答案與等待對手設定
│   │   └── BattleView.tsx          # 輪流猜測、猜測紀錄與勝負揭曉
│   └── components/
│       └── DigitInput.tsx          # 四位數字輸入與即時格式提示
└── tests/
    ├── unit/                       # 畫面狀態機與輸入格式檢查的單元測試
    └── e2e/                        # 兩個 browser context 模擬雙人對戰的 Playwright 測試

backend/
├── package.json
├── tsconfig.json                   # TypeScript 6.0 strict 設定
├── .env.example                    # PostgreSQL 連線字串
├── docker-compose.yml              # 開發與測試用的 postgres:18 容器
├── prisma.config.ts                # Prisma 7 連線與 migration 設定
├── prisma/
│   ├── schema.prisma               # 玩家、房間、秘密答案與猜測紀錄（含 partialIndexes 預覽旗標）
│   └── migrations/                 # prisma migrate 產生的遷移檔
├── src/
│   ├── server.ts                   # Express 與 Socket.IO 共用的 HTTP 伺服器入口
│   ├── db/
│   │   └── prisma.ts               # 使用 @prisma/adapter-pg 並全域 omit 秘密答案的 Prisma Client
│   ├── middleware/
│   │   ├── auth.ts                 # 以 Bearer token 查出玩家
│   │   └── errorHandler.ts         # 統一回傳錯誤碼
│   ├── routes/
│   │   ├── playersRouter.ts        # 進站路由
│   │   └── roomsRouter.ts          # 配對、離開、開始遊戲、設定秘密答案、提交猜測路由
│   ├── schemas/
│   │   └── requests.ts             # 暱稱、配對碼、秘密答案與猜測的 zod schema
│   ├── services/
│   │   ├── matchService.ts         # 交易內 FOR UPDATE 與 P2002 重試的原子配對
│   │   ├── gameService.ts          # 開始遊戲、設定答案、輪次控制與勝負判定
│   │   └── scoreGuess.ts           # A／B 判定純函式
│   └── realtime/
│       ├── events.ts               # ServerToClientEvents 型別化事件定義
│       └── roomGateway.ts          # 連線驗證、加入 room、推播與斷線處理
└── tests/
    ├── unit/                       # scoreGuess 與輸入 schema 的單元測試
    └── integration/                # Supertest 與 socket.io-client 對真實 PostgreSQL 的整合測試
```

**Structure Decision**: 採用 **Web application（`frontend/` + `backend/`）** 雙目錄結構。前端使用 React 19＋Vite 8＋TypeScript 6.0
負責進站、房間、設定答案與對戰畫面（research §1、§2）；後端使用 Node.js 24＋Express 5 提供 REST 指令，並在同一個 HTTP 伺服器掛載
Socket.IO 推播房間與對局事件（research §3、§4）。PostgreSQL 18 與 Prisma 7.10 的存取、原子配對與答案保護都由後端負責（research §6–§8），
不是獨立部署的程式碼，所以 Prisma schema 與 Docker Compose 放在 `backend/`，不另建頂層目錄；技術研究沒有要求前後端共用型別套件，所以不建立 `shared/`。

## 分析流程規劃

### 系統介面盤點

本次需求涉及 3 種技術端點：前端、後端、資料庫，共盤出 10 個介面。

| 編號 | 介面 | 端點類型 | 需求依據 |
| --- | --- | --- | --- |
| F1 | 進站與配對碼輸入介面 | 前端（使用者 → 前端） | US1 情境 1、4；FR-001 只輸入暱稱進站、暱稱為空時提示；FR-005 配對碼格式不符時以繁體中文提示；NFR-001 送出配對碼到看見房間低於 2 秒；SC-001 兩位新玩家 30 秒內進入同一房間；NFR-004 介面文字使用臺灣繁體中文 |
| F2 | 房間等待與開始遊戲介面 | 前端（使用者 → 前端） | US1 情境 2、5；US2 情境 1–3；FR-006 顯示房內玩家暱稱並標示房主；FR-007 房主離開時關閉房間；FR-008 只有房主在滿兩人時可開始 |
| F3 | 秘密答案設定介面 | 前端（使用者 → 前端） | US2 情境 4–7；FR-009 各自設定只有自己知道的答案；FR-010 雙方設定完成才進入猜測；FR-017 答案為四位不重複數字；FR-018 設定階段對手離開時回到入口 |
| F4 | 輪流猜測與對局結果介面 | 前端（使用者 → 前端） | US3 情境 1–6；FR-012 只有輪到的玩家可提交；FR-013 顯示所有猜測紀錄與 A／B；FR-014 猜出 4A 宣告勝者並揭曉答案；FR-015 對手斷線判己方獲勝；FR-016 結束後回到入口；Edge Cases 重複猜同一組數字 |
| B1 | 玩家進站 API | 後端（前端 → 後端） | FR-001 只以暱稱進站、不得要求註冊登入、暱稱為空時拒絕 |
| B2 | 房間配對與離開 API | 後端（前端 → 後端） | US1 情境 1–5；FR-002 配對碼相同且等待中時加入；FR-003 沒有符合時建立新房；FR-004 已滿或已開始視為沒有符合；FR-005 配對碼格式驗證；FR-007 房主離開時關閉房間並釋出配對碼；FR-016 對局結束後離開房間；Edge Cases 同時輸入同一配對碼、配對碼被占用；SC-002 配對正確率 100% |
| B3 | 對局進行 API | 後端（前端 → 後端） | US2 情境 1–6；US3 情境 1–5；FR-008 只有房主在滿兩人時可開始；FR-009 各自設定秘密答案；FR-011 依對手答案回報 A／B；FR-012 輪流制、房主先手；FR-014 猜出 4A 立即結束；FR-017 答案與猜測格式驗證；SC-005 A／B 與標準規則 100% 一致 |
| B4 | 房間與對局即時推播 | 後端（前端 → Socket.IO） | US1 情境 2；US2 情境 5–7；US3 情境 2、5–6；FR-006 雙方看到彼此暱稱；FR-010 雙方設定完成後同時進入猜測；FR-013 雙方畫面顯示猜測紀錄；FR-015 猜測階段斷線判另一方獲勝；FR-018 設定階段斷線通知另一方；NFR-002 結束前不得送出對手答案；NFR-003 對手畫面 1 秒內更新；SC-003 1 秒內更新比率達 95% |
| D1 | 玩家與房間配對資料存取 | 資料庫（後端 → PostgreSQL） | Key Entities 玩家、房間；FR-001 不保存跨連線戰績；FR-002–FR-004 同一配對碼最多一間等待中房間；FR-007 房間關閉後釋出配對碼；Edge Cases 同時輸入同一配對碼 |
| D2 | 秘密答案與猜測紀錄持久化 | 資料庫（後端 → PostgreSQL） | Key Entities 秘密答案、猜測紀錄；FR-012 記錄目前輪次；FR-013 依提交順序保存猜測紀錄；NFR-002 秘密答案只存在伺服器端；SC-004 對手取得答案次數為 0 |

### 分析流程安排

本次規劃 2 個 Wave。

**Wave 1：前端**

- 涵蓋介面：F1、F2、F3、F4
- 排序理由：US1 到 US3 都從玩家在畫面上的操作開始（進站、輸入配對碼、開始遊戲、設定答案、猜測），前端先確定玩家看到哪些資料、做哪些操作、在哪些時間點需要即時更新，後端才知道要提供哪些 REST 指令與推播事件，資料庫也才知道要保存哪些狀態。

**Wave 2：後端、資料庫（2 個 Sub-agent 平行分析）**

- 涵蓋介面：B1、B2、B3、B4；D1、D2
- 依賴：後端依 Wave 1 的畫面操作（進站、配對、離開、開始、設定答案、猜測）設計 REST 指令，依各畫面需要即時更新的時間點（對手加入、雙方設定完成、輪次切換、對局結束、對手斷線）設計推播事件；資料庫依 Wave 1 確定的房間狀態與猜測紀錄顯示內容，搭配 Key Entities 與 research §7、§8 的配對約束與答案保護推出資料結構。
- 排序理由：後端與資料庫都只依賴 Wave 1 的結果；資料庫的結構由 Key Entities、房間狀態與技術研究決定，不需要等後端 API 定案，所以兩者放在同一個 Wave 平行分析。
