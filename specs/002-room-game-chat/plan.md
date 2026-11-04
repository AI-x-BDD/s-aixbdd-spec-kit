# Implementation Plan: 1A2B 房間與對局聊天 (Room and Game Chat)

**Branch**: `002-room-game-chat` | **Date**: 2026-11-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-room-game-chat/spec.md`

## Project Structure

### Documentation (this feature)

```text
specs/002-room-game-chat/
├── spec.md                  # 1A2B 房間與對局聊天的功能需求規格
├── research.md              # 技術研究與選型決策紀錄
├── techstack.md             # 採用與不引入的技術堆疊總覽
├── plan.md                  # 本系統分析規劃文件
├── contracts/               # 後端介面合約
│   ├── openapi.yaml         # 送出聊天訊息與查詢本房聊天歷史的 HTTP 合約（OpenAPI 3.1）
│   └── asyncapi.yaml        # 聊天訊息即時推播的 Socket.IO 事件合約（AsyncAPI 3.0）
├── data/                    # 資料模型
│   └── data-model.dbml      # 聊天訊息的 PostgreSQL 資料模型（DBML）
└── ui/                      # 前端畫面規劃與雛形
    ├── plan.md              # 畫面範疇、視覺風格、畫面與流程、狀態、驗證與錯誤回饋
    └── index.html           # 可互動雛形入口，其餘頁面依畫面流程決定
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── text/
│   │   └── zh-TW.ts                # 修改：加入聊天區文字與聊天錯誤碼的繁體中文對照
│   ├── api/
│   │   ├── httpClient.ts           # 修改：加入送出聊天訊息（5 秒逾時）與查詢聊天歷史的 REST 呼叫
│   │   └── gameSocket.ts           # 修改：加入聊天訊息推播事件訂閱
│   ├── chat/
│   │   ├── chatReducer.ts          # 新增：訊息依 sequence 合併去重、傳送失敗、靜音標記、展開收合與未讀數量
│   │   └── countGraphemes.ts       # 新增：以 Intl.Segmenter 計算字數（與後端同一份邏輯）
│   ├── components/
│   │   └── ChatPanel.tsx           # 新增：聊天區（訊息清單、輸入框、未讀數量、靜音切換、重送）
│   └── views/
│       ├── RoomView.tsx            # 修改：掛上聊天區
│       ├── SecretSetupView.tsx     # 修改：掛上聊天區
│       └── BattleView.tsx          # 修改：對戰與結果畫面掛上聊天區
└── tests/
    ├── unit/                       # 新增：chatReducer 與 countGraphemes 的單元測試
    └── e2e/                        # 新增：雙人聊天、傳送失敗重送與靜音的 Playwright 測試

backend/
├── prisma/
│   ├── schema.prisma               # 修改：新增 ChatMessage model 與 rooms 的連帶刪除關聯
│   └── migrations/                 # 新增：建立 chat_messages 的遷移檔
├── src/
│   ├── routes/
│   │   └── chatRouter.ts           # 新增：/api/rooms/:roomId/chat-messages 的送出與查詢路由
│   ├── schemas/
│   │   └── chat.ts                 # 新增：聊天訊息內容與 clientMessageId 的 zod schema
│   ├── services/
│   │   ├── chatService.ts          # 新增：交易內鎖定房間、頻率限制、遞增序號、clientMessageId 去重與寫入
│   │   └── countGraphemes.ts       # 新增：以 Intl.Segmenter 計算字數（與前端同一份邏輯）
│   └── realtime/
│       └── events.ts               # 修改：ServerToClientEvents 加入聊天訊息推播事件
└── tests/
    ├── unit/                       # 新增：聊天 schema 與 countGraphemes 的單元測試
    └── integration/                # 新增：送出、歷史查詢、頻率限制、並行順序、重送去重與房間刪除的整合測試
```

**Structure Decision**: 沿用 `specs/001-online-pvp-1a2b` 的 **Web application（`frontend/` + `backend/`）** 雙目錄結構，只列出本次新增與修改的檔案。前端以 React 19 的 `useReducer` 管理聊天區、靜音與未讀數量（research §5、§7）；後端以 Express 5 提供送出與歷史查詢的 REST 端點，並沿用同一個 HTTP 伺服器上的 Socket.IO 推播聊天訊息（research §2、§3）；聊天訊息以 Prisma 7.10 存入 PostgreSQL 18，順序、去重與頻率限制都在後端的同一個交易中處理（research §1、§4、§6）。技術研究沒有要求前後端共用型別套件，所以 `countGraphemes` 在前後端各放一份相同邏輯，不建立 `shared/`。

## 分析流程規劃

### 系統介面盤點

本次需求涉及 3 種技術端點：前端、後端、資料庫，共盤出 7 個介面。

| 編號 | 介面 | 端點類型 | 需求依據 |
| --- | --- | --- | --- |
| F1 | 聊天訊息送出與顯示介面 | 前端（使用者 → 前端） | US1 情境 1–13、16–18；FR-001 送出文字訊息並顯示發送者暱稱；FR-002 四個階段共用一個聊天室、結果畫面仍可聊天；FR-003 加入者看到房主先前的訊息；FR-004 空白與超過 100 個字時提示並不送出；FR-005 洗頻時提示稍後再傳；FR-006 對戰中不論輪次都能聊天；FR-007 對手離開時顯示「對手已離開」並停用送出；FR-008 不顯示先前房間的訊息；FR-013 雙方訊息順序相同；FR-015 沒有送達時標示「傳送失敗」並可手動重送；NFR-002 聊天區文字使用臺灣繁體中文；NFR-003 訊息以純文字呈現；SC-005 新玩家 10 秒內找到聊天區並送出第一則訊息；Edge Cases 剛好 100 個字、訊息沒有送達 |
| F2 | 聊天區展開收合與未讀數量介面 | 前端（使用者 → 前端） | US1 情境 14–15；FR-014 收合期間顯示未讀數量、展開後歸零 |
| F3 | 對手靜音設定介面 | 前端（使用者 → 前端） | US2 情境 1–7；FR-009 靜音後不顯示對手新訊息、已顯示的保留；FR-010 被靜音者沒有任何提示；FR-011 取消靜音後不補顯示；FR-012 靜音只在當次房間有效；FR-016 靜音期間不計入未讀數量；SC-004 靜音後對手新訊息出現次數為 0；Key Entities 靜音設定 |
| B1 | 聊天訊息送出 API | 後端（前端 → 後端） | US1 情境 1、4–5、7–9、12、16–18；FR-001 接受房內玩家的文字訊息；FR-004 拒絕空白與超過 100 個字的訊息；FR-005 10 秒內最多 5 則；FR-006 送出聊天不改變輪次；FR-007 對手離開後拒絕送出；FR-010 被靜音者的訊息照常接受；FR-015 重送成功後只保存一次；SC-003 10 秒內送出 20 則時對手最多看到 5 則；Edge Cases 靜音期間對手洗頻、剛好 100 個字 |
| B2 | 本房聊天歷史查詢 API | 後端（前端 → 後端） | US1 情境 2–3、13；FR-002 切換階段時保留已送出的訊息；FR-003 加入者取得房主在加入前送出的所有訊息；FR-008 只能查詢目前所在房間的訊息；FR-013 依相同先後順序回傳；SC-002 四個階段的 20 則訊息全部保留且順序正確 |
| B3 | 聊天訊息即時推播 | 後端（前端 → Socket.IO） | US1 情境 1、4、6、10–11；FR-001 房內所有玩家都收到新訊息；FR-007 對手離開時通知留下的玩家；FR-013 推播帶相同的先後順序；NFR-001 對手 95% 以上在 1 秒內看到訊息；SC-001 1 秒內顯示的比率達 95% 以上 |
| D1 | 聊天訊息持久化 | 資料庫（後端 → PostgreSQL） | Key Entities 聊天室、聊天訊息；FR-002 訊息跨階段保留在同一間房間；FR-005 依最近 10 秒的訊息計算送出頻率；FR-008 房間關閉時連帶刪除訊息；FR-013 房內遞增的先後順序；FR-015 同一則重送訊息只存一筆；Edge Cases 房主等待時傳訊息後離開、設定答案階段對手離開 |

### 分析流程安排

本次規劃 2 個 Wave。

**Wave 1：前端、資料庫（2 個 Sub-agent 平行分析）**

- 涵蓋介面：F1、F2、F3；D1
- 排序理由：US1 與 US2 都從玩家在聊天區的操作開始（送出、重送、展開收合、靜音），前端先確定玩家看到哪些訊息資訊、做哪些操作、在哪些時間點需要即時更新，後端才知道要提供哪些 REST 端點與推播事件。資料庫的結構由 Key Entities 與 research §1、§4、§6 的連帶刪除、遞增序號、`clientMessageId` 去重與頻率計數決定，不需要等前端畫面定案；靜音、展開收合與未讀數量只存在前端（research §7），不影響資料表，所以兩者彼此沒有依賴，放在同一個 Wave 平行分析。

**Wave 2：後端**

- 涵蓋介面：B1、B2、B3
- 依賴：後端依 Wave 1 的前端操作（送出、重送、進房載入歷史）與需要即時更新的時間點（新訊息、對手離開）設計 REST 端點與推播事件，並依 Wave 1 資料庫確定的訊息欄位（`sequence`、`clientMessageId`、發送者角色與暱稱）定義請求、回應與事件內容。
- 排序理由：後端的端點與事件內容同時依賴前端操作與資料庫欄位，必須等 Wave 1 兩個端點類型都完成後才能分析。
