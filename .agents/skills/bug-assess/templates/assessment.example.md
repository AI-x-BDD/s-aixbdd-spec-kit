# 錯誤評估：逾期通知紀錄頁按「重新整理」時畫面抖動

- **代號**：refresh-jitter
- **建立日期**：2026-11-19
- **來源**：使用者在對話中貼上的回饋（驗證 T041 時提出）
- **判定**：成立
- **嚴重度**：medium
- **核准狀態**：已核准（2026-11-19，核准首選修法第 1～4 項）

## 回報內容

> 在設備借用系統管理員的「逾期通知紀錄」頁（apps/equipment-loan 的前端），按「重新整理」按鈕時，畫面會抖動。使用者認定這是嚴重錯誤。這個回報是在驗證 T041（目前頁碼超過總頁數時改載最後一頁）時提出的。相關規格在 specs/008-overdue-discord-notification/。

## 症狀

管理員在「逾期通知紀錄」頁按「重新整理」，載入開始和載入結束時，清單區塊和工具列按鈕各上下、左右跳動一次；回應很快時看起來是畫面閃一下。`ui/plan.md` §4「重新整理中」只要求「重新整理」改為「重新整理中…」並停用、清單變淡並顯示轉圈，沒有要求版面位移。

## 完整預期行為

「目前」欄依程式碼判斷，沒有在瀏覽器實測。修正前與修正後的實測由 `bug-test` 依「量測方式」執行。量測都在桌面 1120px 與 360px 兩種寬度各做一次。

| # | 預期行為 | 目前 | 量測方式 | 通過標準 |
|---|---|---|---|---|
| E1 | 有反應：按下「重新整理」後，立即看得出系統正在處理 | 符合：按鈕立即改為「重新整理中…」並停用（`OverdueNotificationsView.tsx:363-371`），清單變淡（`:409`、`:552`） | Playwright 攔截 `listOverdueNotifications` 並延遲 2 秒回應；點擊「重新整理」後不等回應，立即讀按鈕文字、`disabled` 與載入提示列的可見性 | 點擊後 100ms 內：按鈕文字為「重新整理中…」、按鈕停用、載入提示列可見 |
| E2 | 不位移：載入前、載入中、載入後，清單與按鈕的位置和尺寸不變 | 不符合：載入提示列插入文件流、按鈕文字變長、空狀態被卸載，見「可疑程式路徑」第 1、2、4 項 | 同 E1 的延遲回應；在點擊前、「重新整理中…」期間、載入完成後，各記錄「立即檢查逾期」「重新整理」按鈕、`overdue-count`、`overdue-notifications-table`（篩選為空時改記 `overdue-empty-filter`）的 `boundingBox()` | 三個時間點的 x、y、寬、高相差都不超過 1px |
| E3 | 不閃爍：已經顯示的內容在載入期間不消失再出現 | 不符合：空狀態在載入期間被卸載，結束後再掛上（`:310-311`） | 攔截清單 API，分別以不延遲與延遲 2 秒回應；從點擊到載入完成，每個 animation frame 記錄清單、空狀態、`overdue-count` 是否存在且可見 | 兩種延遲下，這三個元素都沒有「可見 → 不可見 → 可見」的變化。載入提示列與按鈕文字的切換屬於 E1，不算閃爍 |
| E4 | 看得出完成：載入結束後，看得出已經更新完畢 | 符合：`refreshing` 由 `loading` 推出（`:308`），載入結束後按鈕恢復「重新整理」並可按，載入提示列移除，清單恢復不透明 | 延遲回應的資料比載入前多 1 則通知；回應送出後讀按鈕文字與 `disabled`、載入提示列可見性、清單透明度、`overdue-count` 文字 | 回應送出後 500ms 內：按鈕為「重新整理」且可按、載入提示列不可見、清單 `opacity` 為 1、`overdue-count` 顯示新的筆數 |

## 重現步驟

1. 以管理員登入，開啟「逾期通知紀錄」頁，清單至少有 1 則通知，視窗寬度 1120px。
2. 點擊清單標題列右側的「重新整理」。
3. 觀察：載入期間「正在重新整理…」那一行插入在篩選列和「共 N 則通知」之間，把筆數、表格和換頁列往下推；載入結束後這一行移除，內容又彈回原位。同時「重新整理」改成「重新整理中…」，按鈕變寬，左邊的「立即檢查逾期」被往左推，結束後再推回來。
4. 頁頂原本有橫幅（例如重送後的藍色橫幅）時，按下「重新整理」的當下橫幅消失，整張卡片往上移一次。
5. 目前是「沒有符合篩選的通知」或「目前沒有逾期通知」的空狀態時，載入期間空狀態區塊消失，結束後再出現。

這些位移在一般重新整理就會出現，不限於 T041 的情境（目前頁碼超過總頁數、改載最後一頁）。

## 搜尋線索

| 線索 | 類型 | 搜尋結果 |
|---|---|---|
| `overdue-refreshing` | 元件識別字 | 命中 `OverdueNotificationsView.tsx` 的載入提示列；`e2e/`、`frontend/tests/` 沒有命中 |
| `overdue-refresh-btn` | 元件識別字 | 命中 `OverdueNotificationsView.tsx` 的「重新整理」按鈕；`e2e/`、`frontend/tests/` 沒有命中 |
| `overdue-empty-filter` | 元件識別字 | 命中 `OverdueNotificationsView.tsx` 的空狀態；`e2e/`、`frontend/tests/` 沒有命中 |
| 抖動、跳動、版面位移、CLS | log 字串 | 在 spec.md、`ui/plan.md` 沒有命中 |

## 可疑程式路徑

- `apps/equipment-loan/frontend/src/views/OverdueNotificationsView.tsx:397-402` — `{refreshing && <div className="odn-refresh-line">…}` 只在載入期間掛上，位置在 `.odn-toolbar` 和 `.odn-count` 之間，在正常文件流裡，沒有預留高度。CSS（同檔 `:544`）為 `font-size: 13px; margin-bottom: 8px`，加上 12px 轉圈，載入期間把下方內容往下推約 28px，結束後彈回。這是最可能的主因（E2）。
- `apps/equipment-loan/frontend/src/views/OverdueNotificationsView.tsx:363-371` — 按鈕文字在「重新整理」（4 字）和「重新整理中…」（6 字）之間切換，按鈕沒有固定寬度。`.odn-section-head`（`:542`）是 `justify-content: space-between`，`.odn-toolbar-actions` 靠右，所以「立即檢查逾期」會左右位移。窄螢幕下 `flex-wrap: wrap` 還可能讓按鈕列換行，高度也跟著變（E2）。
- `apps/equipment-loan/frontend/src/views/OverdueNotificationsView.tsx:277-280` — `handleRefresh()` 先 `setBanner(null)`，頁頂橫幅（`:319-328`）立即移除，整個清單卡片往上移。`ui/plan.md` §4 的「重新整理中」狀態規定先隱藏橫幅，雛形同樣先 `hideBanner()`，所以這一項照意圖實作，不是缺陷，見「轉回 SDD 流程的項目」。
- `apps/equipment-loan/frontend/src/views/OverdueNotificationsView.tsx:310-311` — `showEmptyAll`、`showEmptyFilter` 都要求 `!loading`，空狀態在重新整理期間被卸載，結束後再掛上（E2、E3）。
- `apps/equipment-loan/frontend/src/views/OverdueNotificationsView.tsx:35-45`（T041 `fetchPageWithinRange`）— 目前頁碼超過總頁數時多查一次，載入期間拉長，第 3 步的位移持續較久，比較容易被注意到；它本身不造成位移。改載最後一頁後清單從 1 則變 20 則的高度變化是預期結果，不屬於本錯誤。
- `specs/008-overdue-discord-notification/ui/overdue-notifications.html:245`、`:156`、`:586-596` — 雛形本身就用 `hidden` 切換 `#refresh-line`，位置一樣在 `#count-text` 上方，按鈕文字一樣切換。實作忠實照雛形做，所以位移是從雛形繼承來的，不是 T041 造成的回歸。

## 相關測試

| 測試 | 共用的資料或前提 | 是否受影響 | 說明 |
|---|---|---|---|
| `frontend/tests/unit/overdueNotificationsPaging.test.ts` | 共用 `fetchPageWithinRange` | 否 | 修法只改 JSX 結構與 CSS，不改 `fetchPageWithinRange` 的頁碼邏輯 |

## 根本原因假設

重新整理期間，有幾個元素在正常文件流中出現或消失，或改變尺寸，而且都沒有預留空間：載入提示列「正在重新整理…」插入在清單上方、「重新整理」按鈕文字變長、空狀態被卸載。載入開始時發生一次位移，結束時再反向位移一次，回應快的時候看起來就是畫面閃一下。雛形 `ui/overdue-notifications.html` 的做法相同，所以這是一般重新整理就會發生的既有行為，不是 T041 引入的；T041 在頁碼超過總頁數時多一次請求，拉長了位移持續的時間，所以在驗證 T041 時被注意到。頁頂橫幅清除造成的上移另外存在，它照 `ui/plan.md` §4 實作。信心：medium-high（程式碼路徑明確，但沒有在瀏覽器實測）。

### 嚴重度理由

使用者認定為嚴重錯誤，評估給 `medium`：每次重新整理都會位移，管理員會以為系統壞掉，但不影響資料正確性，影響範圍只有這一頁，也不是回歸，所以不到 `high`。

- 使用者影響：每次重新整理都會位移，管理員每天使用這一頁，會以為系統壞掉，但功能仍可用。
- 波及範圍：只有「逾期通知紀錄」頁；FR-003～FR-005 都仍然滿足。
- 資料風險：無。不影響資料正確性、權限、通知送出或重送結果。
- 新的回歸或長期存在：長期存在，不是回歸。位移從雛形繼承而來，不是 T041 造成。
- 差異：spec.md、`ui/plan.md` 都沒有版面穩定或 CLS 的明確要求（已搜尋「抖動」「跳動」「版面位移」「CLS」，沒有命中），使用者也確認沒有 CLS 的驗收標準。

## 修法

**首選**：讓重新整理期間的版面尺寸保持不變，只改可見性、透明度和文字：

1. 載入提示列一直掛在 DOM 上、預留高度，平時用 `visibility: hidden` 隱藏，只在 `refreshing` 時顯示，並加 `role="status"`。代價是平時清單上方多約 28px 空白。對應 E1、E2。
2. 「重新整理」按鈕的寬度固定在較長文字的寬度：用 grid 疊放兩段文字，只顯示其中一段，文字切換就不會影響「立即檢查逾期」的位置。「立即檢查逾期」／「檢查中…」用同樣的做法。對應 E1、E2、E4。
3. 空狀態在重新整理期間保留，只加上淡化 class，不卸載：`showEmptyAll`、`showEmptyFilter` 改成在 `loaded` 後依 `items.length` 與載入時的篩選判斷，不看 `loading`。對應 E2、E3。
4. 雛形 `ui/overdue-notifications.html` 同步第 1～3 項，讓雛形和修正後的實作一致；`ui/plan.md` 的文字不修改。

以上不需要改後端和 API 合約，也不改 `fetchPageWithinRange` 的頁碼邏輯。

**替代做法**：

- 只做第 1 項（預留載入提示列空間）：改動最小，消除最大的垂直位移，但按鈕的左右位移與空狀態的閃爍仍在，E2、E3 不通過。
- 載入提示列改成疊在 `.odn-table-wrap` 上方的絕對定位遮罩（`.odn-table-wrap` 加 `position: relative`）：平時沒有空白，但 720px 以下的卡片版面要另外處理定位，改動較大。
- 不建議：回應很快時延遲顯示載入提示（例如 200ms 後才顯示）。點擊後 200ms 內看不出反應，E1 不通過；載入較久時位移仍在。
- 不建議：移除載入提示列，只保留表格淡化和按鈕文字。這會改變 `ui/plan.md` §4「換頁中」的「顯示『正在載入第 2 頁…』」，屬於意圖改變。

**要改的檔案**：

- `apps/equipment-loan/frontend/src/views/OverdueNotificationsView.tsx`（JSX 結構和同檔的 `OVERDUE_NOTIFICATIONS_CSS`）
- `specs/008-overdue-discord-notification/ui/overdue-notifications.html`（雛形同步）
- `apps/equipment-loan/e2e/overdue-notifications-refresh.spec.ts`（新增）

**要補的測試**：

- `e2e/overdue-notifications-refresh.spec.ts`「有通知時重新整理」：依「完整預期行為」E1～E4 的量測方式與通過標準，在 1120px 與 360px 各跑一次。用可見性判斷載入提示列，不用它是否存在。
- 同一檔「篩選結果為空時重新整理」：篩選「送出中」後重新整理，依 E2、E3 量測 `overdue-empty-filter`，在兩種寬度各跑一次。
- E3 的不延遲情境與延遲 2 秒情境各一個測試案例。
- 既有的 `frontend/tests/unit/overdueNotificationsPaging.test.ts`（T041）不修改；重跑確認頁碼邏輯沒有受影響。
- 重跑 `npm run check`、`npm run test:frontend`、`npm run test:e2e`。前端 Vitest 為 `environment: "node"`，沒有 DOM，所以版面量測只能用 e2e。

**需要核准的命令**：

- `npm run test:e2e`：會把本機資料庫重設成 demo seed。

## 轉回 SDD 流程的項目

下列項目要改變已同意的意圖，不放進本次修法，由處理 Skill 先修改上游文件，再走 `tasks` → `implement`。

| # | 要改的事 | 已同意的意圖 | 處理 Skill |
|---|---|---|---|
| I1 | 按「重新整理」時，頁頂橫幅改成載入完成後才清除（使用者在澄清紀錄 Q3 的決定） | `ui/plan.md` §4「重新整理中」狀態：先隱藏頁頂橫幅 | `ui-plan` |
| I2 | 在畫面規劃寫明「重新整理與換頁期間版面不位移」，避免後續任務照舊雛形改回去 | `ui/plan.md` §4 沒有版面穩定的敘述 | `ui-plan` |

## 風險

| 面向 | 檢查結果 |
|---|---|
| API 相容性 | 已檢查，無。不改後端和 API 合約 |
| migration | 已檢查，無 |
| 效能 | 已檢查，無。載入提示列常駐 DOM，只多一個固定高度的元素 |
| 安全 | 已檢查，無 |
| 可觀測性 | 已檢查，無。目前在 `e2e/`、`frontend/tests/` 搜尋 `overdue-refreshing`、`overdue-refresh-btn` 沒有命中；新測試一律用可見性或 `aria-busy` 判斷，不用元素是否存在 |

- 一直掛在 DOM 上的載入提示需要處理無障礙：使用 `role="status"` 搭配 `aria-live="polite"`，隱藏時不讓螢幕閱讀器一直讀到它。
- 720px 以下卡片版面：按鈕列可能換行。固定按鈕寬度後要確認 360px 寬仍可完整操作（`ui/plan.md` 版面要求）。
- I1 完成前，橫幅清除造成的上移仍會發生。使用者驗證本次修正時，不要把這一項當成修正失敗。
- 本錯誤和 T041 無關，修正不應改動 `fetchPageWithinRange` 或 `load()` 的頁碼邏輯。

## 使用者關卡

### 澄清紀錄

| # | 問題 | 使用者回答 | 寫回位置 |
|---|---|---|---|
| Q1 | 你看到的「抖動」是哪幾種，在什麼視窗寬度？ | 清單上下跳和按鈕左右移都有，回應快的時候像閃一下；用桌面寬度。橫幅消失時也覺得跳了一下 | 「症狀」；「完整預期行為」E2、E3；I1 |
| Q2 | 認定「嚴重」的依據是什麼？有沒有 CLS 或無障礙的驗收標準？ | 每次按都會跳，看起來像系統壞掉；沒有 CLS 標準 | 「嚴重度理由」 |
| Q3 | 按「重新整理」時頁頂橫幅立即消失，要維持，還是改成載入完成後才清除？ | 改成載入完成後才清除 | I1 |

### 核准

- 核准日期：2026-11-19
- 核准的修法：首選修法第 1～4 項（第 4 項是雛形同步）
- 核准執行的命令：`npm run test:e2e`
- 不在本次修正範圍：I1、I2，轉回 `ui-plan`
