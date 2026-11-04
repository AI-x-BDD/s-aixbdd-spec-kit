# 技術研究與決策紀錄 (Research): 1A2B 房間與對局聊天 (Room and Game Chat)

**Feature Branch**: `002-room-game-chat`  
**Date**: 2026-11-04  
**Spec**: [spec.md](./spec.md)

## 1. 聊天訊息儲存與房間生命週期 (PostgreSQL + Prisma)

- **Decision**: 聊天訊息存入既有的 **PostgreSQL 18**，沿用 **Prisma ORM 7.10**（driver adapter **`@prisma/adapter-pg`** 與 **`pg`**）存取：新增 `ChatMessage` model（資料表 `chat_messages`），以 `@relation(fields: [roomId], references: [id], onDelete: Cascade)` 關聯 `rooms`，刪除房間時資料庫連帶刪除該房間所有聊天訊息；訊息以 `sender_role`（沿用 `room_role`）與送出當下的 `sender_nickname` 記錄發送者，不以外鍵指向 `players`；欄位、索引與 Enum 的完整定義由 data-plan 決定。資料表以 `prisma migrate` 建立。
- **Rationale**:
  - 符合使用者限制「聊天訊息要存進資料庫」。spec 的 FR-008 要求「房間關閉後不保留該房間的聊天訊息」，本決策把這項限制解讀為「房間存在期間，聊天訊息以 PostgreSQL 為準，不放在 Node.js 行程記憶體；房間關閉時一併刪除」，限制與 FR-008 同時成立。
  - FR-008 要求房間關閉後不保留訊息；既有設計在房間關閉時刪除 `rooms` 列（`specs/001-online-pvp-1a2b` research §6），`onDelete: Cascade` 讓資料庫在同一個刪除動作中清掉聊天訊息，不需要另寫清理程式。查證 Prisma 文件：`onDelete: Cascade` 會成為外鍵的 `ON DELETE CASCADE` 子句。
  - FR-002 要求四個階段共用同一串訊息、切換階段時保留；訊息只關聯房間、不關聯階段，`rooms.status` 改變不影響 `chat_messages`。
  - 既有設計在玩家斷線時刪除 `players` 列；FR-007 要求對手離開後，留下的玩家仍看得到先前訊息與發送者暱稱（FR-001），所以發送者以角色與暱稱快照記錄，玩家列被刪除後訊息仍完整。
- **Alternatives considered**:
  - **Node.js 行程記憶體保存聊天訊息（以 `roomId` 為鍵的 `Map`）**：最簡單，但違反使用者限制「聊天訊息要存進資料庫」，行程重啟時正在進行的房間會遺失訊息。
  - **以外鍵 `sender_player_id` 指向 `players`**：玩家斷線時 `players` 列被刪除，外鍵只能設成 `SET NULL` 或連帶刪除訊息；前者失去發送者，後者讓留下的玩家看不到對手先前的訊息，違反 FR-001、FR-002。
  - **Redis 保存聊天串列（`RPUSH`／`LRANGE`）**：查詢最近訊息很快，但要多部署一個服務，且房間資料在 PostgreSQL，房間關閉時要跨兩個儲存體刪除，FR-008 的一致性要靠程式保證。

---

## 2. 送出聊天訊息與即時推播 (Express REST + Socket.IO)

- **Decision**: 送出訊息沿用「指令走 REST、推播走 Socket.IO」：前端以 `POST /api/rooms/{roomId}/chat-messages`（**Express 5**，`Authorization: Bearer <token>`）送出 `{ clientMessageId, content }`；後端在 Prisma 互動式交易中以 `SELECT … FROM rooms WHERE id = ${roomId} FOR UPDATE` 鎖定房間，確認送出者是房內玩家、房間不是「對手已離開」的狀態，再寫入訊息（順序與去重見 §4，頻率限制見 §6）；交易提交後以 **Socket.IO 4.8** `io.to("room:<roomId>").emit("chatMessageCreated", message)` 推播給房內所有連線（含發送者），REST 回應同一筆訊息。這個端點不讀寫 `rooms.current_turn`。端點、事件與錯誤碼的完整格式由 api-plan 決定。
- **Rationale**:
  - 既有規格限制「後端 Express（REST）」與「即時通訊用 Socket.IO」（`specs/001-online-pvp-1a2b` research §3、§4）；spec 的 Assumptions 寫明「延續既有 1A2B 規格」，聊天沿用同一套分工，前後端不需要第二套指令傳輸方式。
  - NFR-001 與 SC-001 要求對手在 95% 以上的情況下 `< 1 秒` 看到訊息；一次交易包含一次房間鎖定、一次頻率計數查詢與一次寫入，預估 `< 20ms`，加上同一個行程發出的 WebSocket 推播，同區域網路預估 `< 100ms`。
  - FR-006 要求聊天不受輪次限制、不得改變輪次；聊天端點不檢查也不寫入 `current_turn`，猜測端點不受聊天影響。
  - FR-007 要求對手離開後停用送出；前端依既有的房間狀態推播停用輸入框，後端在鎖定房間後再檢查一次，繞過前端直接呼叫 API 也送不出去。
  - FR-001 要求房內所有玩家都看到訊息；推播給整個 Socket.IO room，發送者也收到同一筆訊息，雙方畫面的內容相同。
- **Alternatives considered**:
  - **以 Socket.IO 事件加 acknowledgement 送出訊息**：少一次 HTTP 往返，但與既有「指令走 REST」的分工不一致，Supertest 也無法直接測試送出規則（FR-004、FR-005）。
  - **交易提交前就推播**：可以早幾毫秒送達，但交易失敗時對手已看到不存在的訊息，違反 FR-015「沒有送達的訊息對手不顯示」。

---

## 3. 查詢本房聊天歷史的 HTTP API

- **Decision**: 提供 `GET /api/rooms/{roomId}/chat-messages`（**Express 5**，`Authorization: Bearer <token>`），只允許目前在該房間的玩家呼叫，其他玩家回 `403`；回傳該房間的聊天訊息，依 `sequence` 由小到大排序，以 `page` 與 `pageSize` 分頁（`pageSize` 最大 100）。前端在進入房間（建立房間或加入房間成功）且 Socket.IO 連線已加入 `room:<roomId>` 之後，以 `pageSize=100` 從 `page=1` 依序取到 `totalPages`，把回應與期間收到的 `chatMessageCreated` 推播依 `sequence` 合併、以訊息 `id` 去重。參數與回應格式由 api-plan 決定。
- **Rationale**:
  - 符合使用者限制「提供 HTTP API 讓玩家查詢本房的聊天歷史」；本決策把「本房」解讀為「呼叫者目前所在的房間」，所以只開放給房內玩家，房外玩家與已離開的玩家都查不到，同時符合 FR-008「進入另一間房間時不得顯示先前房間的訊息」與 Out of Scope「不提供跨房間保存、查詢」。
  - FR-003 要求加入者看到房主在加入前送出的所有訊息；加入者先加入推播頻道再查歷史，查詢期間房主送出的新訊息會由推播補上，合併去重後不漏也不重複。
  - 專案憲法 `.agents/constitution/skills/api-plan/openapi.md` 規定查詢清單的 API 必須以 `page` 與 `pageSize` 分頁。FR-005 限制每位玩家每 10 秒最多 5 則，一間房間最多兩人；房主在等待中獨自送訊息時，每分鐘最多累積 30 則，所以進房時通常 1 頁（100 則）就能取完，分頁不會拖慢載入。
  - FR-013 要求所有玩家的訊息順序相同；歷史 API 與推播都帶同一個 `sequence`，前端只依 `sequence` 排序。
- **Alternatives considered**:
  - **以游標分頁（`?beforeSequence=`、`limit`）查詢**：可以處理很長的聊天紀錄，但違反專案憲法規定的 `page` 與 `pageSize` 分頁格式。
  - **不分頁、一次回傳全部訊息**：房間的訊息數受 FR-005 限制，一次回傳也很小，但違反專案憲法「查詢清單必須分頁」的規定。
  - **加入房間時由 Socket.IO 推播完整歷史**：不需要另外的 HTTP 端點，但違反使用者限制「提供 HTTP API 讓玩家查詢本房的聊天歷史」。

---

## 4. 訊息順序與傳送失敗重送 (房內遞增序號 + `clientMessageId` 去重)

- **Decision**:
  - 順序：在 §2 鎖定房間的交易中，以 `MAX(sequence) + 1` 取得房內遞增的 `sequence`，`chat_messages` 以 `@@unique([roomId, sequence])` 保證不重複；前端只依 `sequence` 排序與顯示。
  - 去重：前端送出前以瀏覽器內建 `crypto.randomUUID()` 產生 `clientMessageId`，重送時沿用同一個值；`chat_messages` 以 `@@unique([roomId, senderRole, clientMessageId])` 保證同一則訊息只存一筆。後端在鎖定房間後先查詢同一個 `clientMessageId`，已存在時直接回傳既有訊息，不重新寫入、不再推播，也不計入頻率限制（§6）。
  - 失敗判定：前端以 `fetch` 搭配 `AbortSignal.timeout(5000)` 送出；請求逾時、網路錯誤與 `5xx` 回應時，把該訊息標示「傳送失敗」並保留在發送者的聊天區，由玩家手動重送；收到同一個 `clientMessageId` 的 `chatMessageCreated` 推播時，把該訊息改為已送達。
- **Rationale**:
  - FR-013 與 Acceptance Scenario 10 要求雙方幾乎同時送出時順序相同；同一間房間的送出交易都要先鎖定房間，`sequence` 在鎖內依序取得，提交順序與序號一致，雙方依序號排序就會得到相同順序。這與既有猜測紀錄的序號做法相同（`specs/001-online-pvp-1a2b` research §8）。
  - FR-015 與 Acceptance Scenario 18 要求重送成功後對手只看到一次；最難處理的情況是伺服器已寫入、回應卻沒送到發送者，發送者以同一個 `clientMessageId` 重送時，後端回傳既有訊息而不再推播，對手只看到一次。
  - FR-015 與 Acceptance Scenario 17 要求沒有送達的訊息不出現在對手畫面；訊息只在交易提交後推播（§2），請求沒有到達伺服器時資料庫沒有這筆訊息，對手不會收到。
  - NFR-001 要求 `< 1 秒` 送達；5 秒逾時遠大於正常往返（預估 `< 100ms`），只在網路確實不穩時才判定失敗，不會把正常訊息誤標為失敗。
- **Alternatives considered**:
  - **以 PostgreSQL identity 欄位（`@default(autoincrement())`）作為順序**：序號在寫入時取得、不是在提交時取得，兩個交易同時進行時，序號較大的可能先提交並先推播；且沒有房間鎖時，頻率限制的計數也會互相競爭（§6）。
  - **以 `created_at` 時間戳排序**：同一毫秒寫入的訊息無法排出唯一順序，違反 FR-013。
  - **自動重送**：可以減少手動操作，但違反 spec Clarifications「由玩家手動重送」的決定。

---

## 5. 訊息內容驗證與純文字呈現 (zod + `Intl.Segmenter` + React 文字節點)

- **Decision**:
  - 長度：「字」以使用者看到的字元（Unicode grapheme cluster）計算，前後端都以平台內建的 `new Intl.Segmenter("zh-TW", { granularity: "grapheme" })` 計數，放在前後端共用的 `countGraphemes(text)` 函式。
  - 後端以 **zod 4** schema 驗證 `content`：`z.string().refine(s => s.trim().length > 0)` 拒絕只含空白的訊息，`refine(s => countGraphemes(s) <= 100)` 拒絕超過 100 個字的訊息；內容不 trim、不改寫，原樣儲存；驗證失敗回 `400` 與錯誤碼，前端在送出前用同一組規則先檢查。
  - 錯誤碼對應的繁體中文提示，加入既有的 `frontend/src/text/zh-TW.ts`。
  - 呈現：以 **React 19** 的文字節點輸出訊息內容（`<p>{message.content}</p>`），不使用 `dangerouslySetInnerHTML`，不引入 Markdown 與 HTML 轉換。
- **Rationale**:
  - FR-004 要求拒絕只含空白與超過 100 個字的訊息；spec 的 Clarifications 只寫「最多 100 個字」，本決策把「字」解讀為「畫面上看到的一個字元」：Edge Cases 要求剛好 100 個字照常送出，FR-001 允許輸入法打出的 emoji；以 JavaScript 的 `length`（UTF-16 單位）計算時，一個 👍 算 2、一個 👨‍👩‍👧 算 8，玩家輸入 100 個字元會被誤判為超過上限。
  - `Intl.Segmenter` 是瀏覽器與 Node.js 內建的 API，前後端呼叫同一個函式，同一段文字在兩邊算出相同字數，不會出現前端放行、後端拒絕的情況。
  - NFR-003 要求訊息中的標記語法或程式碼不得被執行或轉成格式；React 會把文字節點中的 `<`、`>`、`&` 轉義後輸出，`<script>` 與 `**粗體**` 都以原文顯示。
  - NFR-002 要求錯誤提示讓玩家看得懂被拒絕的原因；沿用既有「後端只回錯誤碼、前端集中對應中文」的做法，「訊息不可空白」「訊息最多 100 個字」「請稍後再傳」都在同一個模組檢查用語。
- **Alternatives considered**:
  - **以 `String.prototype.length` 計算字數**：emoji 與組合字會被算成多個字，違反 Edge Cases「剛好 100 個字時照常送出」。
  - **`graphemer` 套件切分字元**：功能與 `Intl.Segmenter` 相同，但要多裝一個套件；Node.js 24 與目前主流瀏覽器都已內建 `Intl.Segmenter`。
  - **DOMPurify 淨化後以 HTML 呈現**：可以保留部分格式，但 NFR-003 要求不得轉成格式，訊息只需要純文字，淨化套件沒有用途。

---

## 6. 送出頻率限制 (交易內以資料庫計數的滑動視窗)

- **Decision**: 在 §2 鎖定房間的交易中，寫入新訊息前以 `SELECT COUNT(*) FROM chat_messages WHERE room_id = ${roomId} AND sender_role = ${senderRole} AND created_at > now() - interval '10 seconds'` 計算該玩家最近 10 秒已送出的訊息數；已達 5 則時不寫入，回 `429` 與錯誤碼，由前端顯示「請稍後再傳」。只有成功寫入的訊息計入；以同一個 `clientMessageId` 重送的訊息不重複計入（§4）。
- **Rationale**:
  - FR-005 要求最近 10 秒已送出 5 則時拒絕下一則；計數直接查詢已送出的訊息，任何連續 10 秒內最多寫入 5 則，是滑動視窗。
  - SC-003 要求玩家 10 秒內連續送出 20 則時，對手最多只看到 5 則；被拒絕的訊息不寫入、不推播，所以對手只會收到 5 則。
  - Edge Cases 要求被靜音的玩家仍受頻率限制；限制在後端執行，與對方是否靜音無關（靜音只在前端，見 §7）。
  - 同一間房間的送出都要先鎖定房間，同一位玩家同時送出的多個請求依序計數，不會有兩個請求都看到 4 則而一起寫入。
  - 計數查詢以 `room_id` 篩選，data-plan 為 `chat_messages` 的 `(room_id, sequence)` 建立的唯一索引就能縮小掃描範圍；房間的訊息數受本規則限制，預估 `< 5ms`，不影響 NFR-001。
- **Alternatives considered**:
  - **express-rate-limit**：查證其預設 `MemoryStore` 只存在單一行程記憶體，且以固定視窗計數；固定視窗在視窗交界前後可以各送 5 則，連續 10 秒內最多送出 10 則，違反 FR-005 與 SC-003。它也計算所有請求，空白訊息與重送都會占用額度，要用 `skipFailedRequests` 等設定另外排除。
  - **Redis 計數器（`rate-limit-redis`）**：可以跨行程同步，但要多部署一個服務；訊息已經存在 PostgreSQL，直接計數就有相同效果。
  - **只在前端限制**：直接呼叫 API 就能繞過，違反 SC-003。

---

## 7. 靜音、未讀數量與聊天區狀態 (前端 React 狀態)

- **Decision**: 靜音、聊天區展開與收合、未讀數量都只存在前端房間畫面的 **React 19** `useReducer` 狀態，後端不保存靜音設定、不提供靜音 API：
  - 每則收到的對手訊息在進入狀態時，依「此刻是否靜音」標記 `hiddenByMute`；標記後不再改變，取消靜音不會讓靜音期間的訊息重新顯示。
  - 未讀數量只在聊天區收合、且收到的是對手訊息且沒有 `hiddenByMute` 時加 1；展開聊天區時歸零。
  - 離開房間時，房間畫面的狀態整個清除，靜音設定不帶到下一間房間。
- **Rationale**:
  - FR-010 要求不得向被靜音的玩家顯示任何被靜音的提示；靜音設定不離開設定者的瀏覽器，伺服器與對手都不知道，不可能洩漏。
  - FR-009 要求已顯示的訊息保留、FR-011 要求取消靜音後不補顯示；在收到訊息當下標記且不改變，兩項需求都由同一個規則滿足。
  - FR-016 與 Acceptance Scenario 7 要求靜音期間未讀數量不變；未讀數量只計算沒有 `hiddenByMute` 的對手訊息。
  - FR-012 要求靜音只在當次房間有效；既有前端以頂層 `useReducer` 狀態機切換畫面（`specs/001-online-pvp-1a2b` research §1），離開房間就清除房間狀態，不需要額外清理。
  - SC-004 要求靜音後對手的新訊息出現在畫面的次數為 0；`hiddenByMute` 的訊息不進入渲染清單，可以用 reducer 單元測試與 Playwright 檢查畫面。
- **Alternatives considered**:
  - **後端保存靜音設定（`mute_settings` 資料表）並依設定過濾推播**：需要新增靜音 API、資料表與每條連線的過濾邏輯；spec 不要求跨裝置或重新連線後保留靜音（既有規格不支援斷線重連），前端狀態已滿足 FR-009～FR-012、FR-016。
  - **以 `localStorage` 保存靜音設定**：重新整理後仍保留，但靜音以房間為範圍（FR-012），重新整理後玩家已離開房間，保存沒有用途，反而要處理清除時機。

---

## 8. 品質與測試策略

- **Decision**: 沿用既有測試工具：
  - 單元測試：**Vitest 5** 測試 `countGraphemes`、zod 驗證 schema，以及聊天區 reducer 的靜音、未讀數量與傳送失敗狀態。
  - API 測試：**Supertest 7** 連到 Docker Compose 啟動的真實 PostgreSQL 18，測試送出、歷史查詢、重送去重、頻率限制、並行送出順序與刪除房間後訊息消失。
  - 推播測試：**`socket.io-client` 4.8** 量測送出到對手收到 `chatMessageCreated` 的時間。
  - 端對端測試：**Playwright**（`@playwright/test` 1.64）以兩個 `browser.newContext()` 模擬兩位玩家，以 `browserContext.setOffline(true)` 模擬網路不穩。
- **Rationale**:
  - SC-001 要求 95% 的訊息 `< 1 秒` 送達；以兩個 `socket.io-client` 連線送出 100 則訊息，檢查第 95 百分位 `< 1 秒`。
  - SC-003 要求 10 秒內送出 20 則時對手最多看到 5 則；以 Supertest 連續送出 20 則，確認只有 5 則回 `201`、對手連線只收到 5 則推播。
  - FR-013 要求順序一致；以 Supertest 讓兩位玩家並行送出訊息，確認雙方的歷史查詢結果順序相同、`sequence` 連續。§4 與 §6 的保證依賴 `FOR UPDATE` 與唯一索引，必須用真實 PostgreSQL 才測得到。
  - FR-015 要求重送後對手只看到一次；以同一個 `clientMessageId` 送出兩次，確認資料庫只有一筆、對手只收到一次推播；Playwright 再以離線模式驗證「傳送失敗」標示與手動重送。
  - SC-002 要求從等待對手到對局結束每階段 5 則、共 20 則全部保留且順序正確；Playwright 以兩位玩家走完四個階段後檢查結果畫面。
- **Alternatives considered**:
  - **以 Prisma mock 取代真實 PostgreSQL**：測不到 `FOR UPDATE`、唯一索引與 `ON DELETE CASCADE`，無法證明 FR-005、FR-008、FR-013、FR-015。
  - **Cypress**：一個測試只能控制一個瀏覽器分頁，無法同時操作兩位玩家完成 Independent Test。
