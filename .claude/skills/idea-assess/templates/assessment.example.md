# 構想評估：設備借用與預約審核系統（含外部通知整合）

- **Slug**：equipment-loan-notify
- **建立日期**：2026-11-20
- **結論**：go
- **推薦方案**：B — 完整借用流程加可靠通知
- **整體證據信心**：medium

## 1. 構想收件

- **來源**：貼上的文字
- **類型**：new-capability

### 構想原文

> 構想：做一個『設備借用與預約審核系統，加一項外部通知整合』，當作 AI x BDD 課程第三題的練習專案。成員預約設備，管理員審核，追蹤領取、歸還、維修；借用逾期時呼叫外部通知服務（例如 Discord）提醒。我一個人開發，題目要能拆成 5～10 次 SDD 迭代，每次跑完 specify → research → plan → tasks → analyze → implement，並且每次都能暴露 SDD 工作流 Skill 的不足，讓我用來優化 Skill。複雜度要比之前做過的 1A2B 猜數字遊戲（Socket.IO 即時對戰）高。

### 重述

提案者想做一個讓成員預約設備、由管理員審核，並追蹤設備領取、歸還與維修的系統；借用逾期時，系統呼叫外部通知服務（例如 Discord）提醒。這個系統同時是課程練習題，目的是產生足夠多的 SDD 迭代，用來檢驗並優化 SDD 工作流 Skill。

### 提出者與背景

- **提出者**：專案開發者本人（構想原文自述「我一個人開發」）；姓名與角色 [NEEDS CLARIFICATION: 無法從構想原文確認]
- **觸發原因**：AI x BDD 課程第三題的練習；先前做過 1A2B 猜數字遊戲（Socket.IO 即時對戰），這次要更複雜。其他觸發事件（真實使用者需求、組織內的借用痛點）[NEEDS CLARIFICATION: 構想原文沒有提到]

### 初步未知事項

- [NEEDS CLARIFICATION: 「成員」與「管理員」是哪個團體？有真實使用者，還是只有開發者自己扮演？]
- [NEEDS CLARIFICATION: 要管理的設備種類與數量為何？每項設備是單件還是有多件庫存？]
- [NEEDS CLARIFICATION: 審核規則是什麼？例如是否每次預約都要審核、預約時段是否可重疊。]
- [NEEDS CLARIFICATION: 「逾期」如何定義？只在逾期當下通知一次，還是持續提醒？]
- [NEEDS CLARIFICATION: 外部通知服務是否限定 Discord？通知對象是借用人、管理員，還是頻道？]
- [NEEDS CLARIFICATION: 使用者身分驗證與權限要做到什麼程度？]
- [NEEDS CLARIFICATION: 「5～10 次 SDD 迭代」的判斷標準是什麼？是否有時間預算？]
- [NEEDS CLARIFICATION: 「複雜度比 1A2B 高」要如何衡量？]

## 2. 證據研究

本構想是練習專案，「使用者需求」多為假設。技術限制有 Discord 官方文件可查證；先例與通知可靠性的證據多來自第三方或廠商文章。讀取的專案檔案：沒有。

### 使用者與需求

- 本專案的主要「使用者」是開發者自己：目的是產生可重複的 SDD 迭代，檢驗工作流 Skill 的不足。 — [來源：ASSUMPTION，依構想原文的自述]（信心：medium）
- 設備借用、預約、借出與歸還是常見需求，已有開源專案專門處理（見「先例」）。 — [來源：https://github.com/JSY-Ben/KitGrab 、https://github.com/ecausp/librebooking]（信心：medium）
- 成員與管理員是否有真實使用者與真實痛點，沒有任何資料。 — [來源：ASSUMPTION]（信心：low）

### 先例

- KitGrab（PHP／MySQL，GPL-3.0）：使用者瀏覽目錄並送出預約；借出與歸還由專人處理；排程腳本把逾時未領取的預約標為 missed（預設 1 小時），另有腳本以 email 通知逾期使用者與管理員；頁面沒有描述審核步驟；專案 2 stars、0 forks。 — 顯示「逾期通知」常以排程腳本實作，且這類專案規模不大。 — [來源：https://github.com/JSY-Ben/KitGrab]（信心：high）
- Booked Scheduler：原開發者已不再開發 2.8.5.x 版，最後一版 2.8.5.5 是安全性修正；社群以 LibreBooking 接手，ecausp/librebooking 是 LibreBooking 的 fork，授權 GPLv3，0 stars、1 fork。 — 顯示既有開源預約系統的維護依賴社群，採用前要評估維護狀態。 — [來源：https://github.com/ecausp/librebooking]（信心：medium）
- Booked Scheduler 的審核功能（依資源開啟審核、新預約待審直到核准、未領取自動取消）：只有搜尋摘要提到，官方頁面抓取時只回傳機器人驗證頁，內容未能查證。 — [來源：https://www.bookedscheduler.com/features/ 、https://www.bookedscheduler.com/help/administration/managing-reservations 、https://bookedscheduler.com/?p=548]（信心：low）
- 本專案先前的 1A2B 猜數字遊戲（Socket.IO 即時對戰）：評估環境內沒有該專案資料，無法比較複雜度。 — [來源：ASSUMPTION，只有構想原文自述]（信心：low）

### 市場與現況

- 商業設備預約軟體很多，例如 Cheqroom、Skedda、Booqable、EQ Checkout、MyTurn；這份清單來自廠商共同出資、含分潤連結的行銷文章，不是中立評比。 — [來源：https://gitnux.org/best/equipment-reservation-software/]（信心：low）
- 使用者現在常用的替代方案：試算表、行事曆預約，或上述開源／商業預約軟體。 — [來源：ASSUMPTION]（信心：low）
- 不做這個專案的成本：少一個可拆成多次迭代的練習題；可改用既有開源系統當分析對象。 — [來源：ASSUMPTION]（信心：low）

### 資料與限制

- Discord 官方文件：限制依 bot 與使用者、依路由與全域套用，全域上限每秒 50 次；限制值不應寫死，要依回應的 `Retry-After` 標頭或 `retry_after` 欄位等待；webhook 以 `webhook_id` 加 token 計算路由限制，官方沒有公布 webhook 專屬的限制值；回應 404 的 webhook 不應再使用。 — [來源：https://docs.discord.com/developers/topics/rate-limits.md]（信心：high）
- 第三方指南：每個 webhook 每 2 秒可送 5 次，失敗的請求也計入限制；指南引用 Discord 官方文件，但這個數字官方沒有公布。 — [來源：https://birdie0.github.io/discord-webhooks-guide/other/rate_limits.html]（信心：medium）
- Webhook 送達保證：一般是至少一次（at-least-once）送達，接收方要容忍重複；「exactly-once」實務上是至少一次加接收方的冪等處理；Stripe 的冪等鍵保留 24 小時可作為去重期間的參考，超出去重期間的重複仍是風險。 — [來源：https://hookdeck.com/webhooks/guides/webhook-delivery-guarantees （webhook 基礎設施廠商的教學文章）]（信心：medium）
- 送出方的重試做法：指數退避加抖動（約在一天內重試 8 次），持續失敗的端點以斷路器暫停送出，重試用完的送出進入死信佇列，之後可重送。 — [來源：https://www.svix.com/resources/webhook-university/reliability/ （廠商文章）]（信心：medium）
- 對「逾期通知」的啟示：同一筆逾期借用需要通知紀錄與去重，避免重複提醒；送出要依 Discord 的限制標頭等待與重試，並分類失敗原因（例如 404 不再重試）。 — [來源：ASSUMPTION，依上列資料推論]（信心：medium）
- 單人開發的規模與時程限制；是否有部署環境、是否需要本機替身（stub）來模擬通知服務。 — [來源：ASSUMPTION]（信心：low）

### 反對這個構想的證據

- 已有開源專案涵蓋預約、借出、歸還與逾期通知（KitGrab、LibreBooking）；若目標是真實使用，直接採用現成產品更划算。 — [來源：https://github.com/JSY-Ben/KitGrab 、https://github.com/ecausp/librebooking]
- 沒有任何真實使用者需求的證據；需求完全來自練習目的。 — [來源：ASSUMPTION]
- 「每次迭代都能暴露 Skill 不足」無法事先保證；迭代拆太細可能變成人為切割。 — [來源：ASSUMPTION]
- 維修、領取、歸還、審核、通知五條線同時做，單人開發可能超出預期工作量。 — [來源：ASSUMPTION]
- Discord 沒有公布 webhook 專屬的限制值，通知的送出節奏只能依回應標頭動態調整，測試時難以重現限制情境。 — [來源：https://docs.discord.com/developers/topics/rate-limits.md]

### 缺口與待確認問題

- [NEEDS CLARIFICATION: 有沒有真實的借用團體與設備清單？]
- [NEEDS CLARIFICATION: 1A2B 專案的迭代數與遇到的 Skill 問題，作為「更複雜」的基準]
- [NEEDS CLARIFICATION: 通知是否要有本機替身，讓測試不依賴真實 Discord]
- [NEEDS CLARIFICATION: Snipe-IT 是否內建預約與申請審核？官方文件網址回傳 404，備用網址重新導向到其他主機，未查證]

### 來源

| 網址 | host | 抓取結果 | 性質 |
| ---- | ---- | -------- | ---- |
| https://github.com/JSY-Ben/KitGrab | github.com | 已抓取 | 開源專案 |
| https://github.com/ecausp/librebooking | github.com | 已抓取 | 開源專案 |
| https://docs.discord.com/developers/topics/rate-limits.md | docs.discord.com | 已抓取 | 官方文件 |
| https://birdie0.github.io/discord-webhooks-guide/other/rate_limits.html | birdie0.github.io | 已抓取 | 第三方指南 |
| https://hookdeck.com/webhooks/guides/webhook-delivery-guarantees | hookdeck.com | 已抓取 | 廠商教學文章 |
| https://www.svix.com/resources/webhook-university/reliability/ | www.svix.com | 已抓取 | 廠商文章 |
| https://gitnux.org/best/equipment-reservation-software/ | gitnux.org | 已抓取 | 廠商出資的行銷文章 |
| https://www.bookedscheduler.com/features/ | www.bookedscheduler.com | 抓取失敗：只回傳機器人驗證頁 | 產品網站 |
| https://www.bookedscheduler.com/help/administration/managing-reservations | www.bookedscheduler.com | 抓取失敗：只回傳機器人驗證頁 | 產品說明文件 |
| https://bookedscheduler.com/?p=548 | bookedscheduler.com | 抓取失敗：只回傳機器人驗證頁 | 無法判斷 |
| https://snipe-it.readme.io/docs/requestable-items | snipe-it.readme.io | 抓取失敗：HTTP 404 | 官方文件 |
| https://docs.snipeitapp.com/ | docs.snipeitapp.com | 未跟隨：重新導向到其他主機 | 官方文件 |

## 3. 問題定義

### 問題陳述

一個團體的成員要借用共用設備時，沒有一個地方能同時處理「預約、管理員審核、領取、歸還、維修」，也沒有人在借用逾期時主動提醒，設備因此難以追蹤、容易被延遲歸還。對提案者而言，另一個問題是：缺少一個複雜度足夠、能拆成多次 SDD 迭代的題目，來檢驗並優化 SDD 工作流 Skill。

### 受影響的使用者與利害關係人

- **使用者**：成員 — 預約設備、領取與歸還；逾期時收到提醒 [NEEDS CLARIFICATION: 真實人數與身分未知]
- **使用者**：管理員 — 審核預約、記錄領取、歸還與維修 [NEEDS CLARIFICATION: 是否為同一人]
- **利害關係人**：專案開發者（提案者）— 同時是決策者、出資者（時間）與 Skill 優化的受益者；單人開發（來源：構想收件）
- **利害關係人**：外部通知服務（例如 Discord）— 提供者；限制由第三方決定，官方要求依回應標頭處理（來源：證據研究的「資料與限制」）

### 目標

- 讓一次預約從提出、審核、領取、歸還到維修有可追蹤的狀態。
- 借用逾期時，借用人或管理員能收到提醒，且不會重複轟炸。
- 題目的範圍能拆成 5～10 次 SDD 迭代，每次都跑完整流程。
- 每次迭代都能產生對 SDD 工作流 Skill 的觀察，供優化使用。
- 複雜度高於先前的 1A2B 猜數字遊戲。

### 非目標

- 不追求與 KitGrab、LibreBooking 等既有產品競爭或取代它們。
- 不處理計費、採購、折舊等資產管理範疇 [NEEDS CLARIFICATION: 待提案者確認]。
- 不保證真實營運使用；本專案以練習為主 [NEEDS CLARIFICATION: 是否有真實使用者]。
- 不在問題定義討論技術選型與架構。

### 成功指標

- 能拆出 5～10 個迭代，每個迭代走完六個 SDD 步驟（定性／計數；基準：1A2B 專案的迭代數 unknown）
- 每次迭代至少記錄一項 Skill 不足的觀察（定性；基準：unknown）
- 逾期借用觸發通知，且同一筆借用在規則範圍內不重複通知（可量測；基準：目前沒有通知）
- 複雜度高於 1A2B（定性；基準：1A2B 的狀態數與整合數 unknown）

### 不做的代價

不做這個題目，提案者仍需要另一個題目來練習 SDD 流程與優化 Skill；成員借用設備仍靠既有的人工方式（例如試算表或口頭）處理，逾期靠人工提醒。以練習專案而言，主要成本是少了一次練習機會，沒有營運損失。

### 待確認問題

- [NEEDS CLARIFICATION: 成員、管理員的真實身分與人數]
- [NEEDS CLARIFICATION: 設備種類、庫存模型（單件或多件）]
- [NEEDS CLARIFICATION: 審核規則與時段衝突規則]
- [NEEDS CLARIFICATION: 逾期的定義與提醒頻率]
- [NEEDS CLARIFICATION: 通知對象與通知服務是否限定 Discord]
- [NEEDS CLARIFICATION: Discord webhook 專屬的限制值（官方未公布，只有第三方數字）]
- [NEEDS CLARIFICATION: 1A2B 專案的複雜度基準]

## 4. 方案構想

### 方案

#### 方案 A — 最小核心：預約與審核

- **概述**：成員為某項設備提出預約，管理員核准或駁回。不含領取、歸還、維修，也不含通知。
- **投入規模**：small
- **取捨**：做得快、風險低；但狀態數少，複雜度可能只略高於 1A2B，也不會產生外部整合方面的 Skill 觀察。
- **範圍失控風險**：預約時段衝突規則；庫存是單件還是多件。

#### 方案 B — 完整借用流程加可靠通知

- **概述**：在方案 A 之上，加上領取、歸還、維修狀態的追蹤，以及借用逾期時呼叫外部通知服務（例如 Discord）提醒。通知有狀態與重試，同一筆逾期借用不會重複通知。可依功能分成 5～10 次迭代，由小到大逐步加入。
- **投入規模**：medium
- **取捨**：狀態與規則夠多，涵蓋資料、後端、前端與外部整合，最能暴露 Skill 在多類規劃產出與跨文件一致性上的不足；代價是單人開發的工作量較大，通知要依第三方的限制標頭處理。
- **範圍失控風險**：逾期的定義與排程觸發；通知失敗分類與重試界線；重複通知；維修與預約衝突；身分驗證與權限。

#### 方案 C — 直接採用現成開源產品（不自己開發）

- **概述**：部署 KitGrab 或 LibreBooking 等既有產品，自己只做必要的通知整合或設定。
- **投入規模**：small
- **取捨**：真實需求最快被滿足；但不能產生 SDD 迭代，無法達成「練習並優化 Skill」的主要目標。
- **範圍失控風險**：既有產品的客製與升級；授權（GPL）；社群維護狀態（Booked 原開發者已停止開發）；與自己的流程不合。

### 推薦

建議方案 B。理由：本專案的核心目標是產生可拆成 5～10 次、且複雜度高於 1A2B 的迭代（見「問題定義」的目標與成功指標）。方案 A 的複雜度不足，方案 C 不符合練習目的。方案 B 可以由小到大拆迭代，若時間不足，仍可停在做完核心流程的階段。

### 不在範圍內（方案 B）

- 計費、採購、折舊等資產管理。
- 與既有產品競爭的完整功能（例如多語系、報表、行事曆同步）。
- 技術選型、資料模型、API 設計（留給 `s-specify` 之後的步驟）。

### 待驗證的假設

- 單人開發者能在可接受的時間內完成 5～10 次迭代。
- Discord（或可替換的通知服務）可用 webhook 方式呼叫；官方沒有公布 webhook 專屬的限制值，第三方指南的每 2 秒 5 次足以支援本專案的通知量。
- 通知可用本機替身測試，不需要每次呼叫真實 Discord。
- 「複雜度高於 1A2B」可由狀態數、整合數與規則數比較得出。

## 5. 判定

### 評分表

| 準則 | 評級 | 理由 |
| ---- | ---- | ---- |
| 問題成立度 | adequate | 借用流程是常見需求，已有開源先例；作為練習題，「產生可迭代的題目」這個問題成立。真實使用者痛點無資料。 |
| 證據強度 | adequate | 先例（KitGrab、LibreBooking）與 Discord 限制（官方文件）已直接查證；通知可靠性做法來自廠商文章；需求面是假設。對練習目的足夠，對營運目的不足。 |
| 價值與不做的代價 | adequate | 不做的成本只是少一次練習機會；做的價值是 Skill 優化的觀察，價值明確但不可量化。 |
| 可行性與投入規模 | adequate | 方案 B 為 medium，可由小到大拆迭代，時間不足時可提早停止；單人開發負擔需追蹤。 |
| 策略契合度 | adequate | 符合課程第三題與 Skill 優化的目標；專案憲法內容未提供 [NEEDS CLARIFICATION: 專案憲法是否限制題目範圍]。 |
| 風險掌握度 | adequate | 主要風險（逾期定義、通知重試與重複、Discord 限制、工作量）已列出，並有縮小範圍的退路；尚未全部緩解。 |

### 判定理由

結論為 go。問題與證據雖然不強，但達到 go 的門檻：問題成立度與證據強度皆為 adequate，且有推薦的方案。這是練習專案，評估重點是「能否產生有價值的迭代」，方案 B 能達成。證據的缺口（真實使用者、webhook 專屬限制值）列為帶到規格的待確認問題，不阻擋進入。若之後目標改成真實營運，應重新評估證據研究與問題定義。

### 交接給 `s-specify`

- **問題**：成員借用共用設備缺少一個能處理預約、審核、領取、歸還、維修並在逾期時主動提醒的流程；同時需要一個能拆成多次 SDD 迭代的題目。
- **採用方案**：方案 B — 完整借用流程加可靠通知，由小到大分 5～10 次迭代。
- **範圍**：在範圍內：預約、審核、領取、歸還、維修狀態追蹤、逾期通知（含狀態、重試、去重）。不在範圍內：計費、採購、折舊、多語系、報表、行事曆同步、技術選型與架構。
- **成功指標**：可拆出 5～10 次迭代並各跑完整 SDD 流程；每次迭代至少記錄一項 Skill 不足；逾期借用觸發通知且不重複；複雜度高於 1A2B。
- **帶到規格的待確認問題**：成員與管理員身分；設備種類與庫存模型；審核與時段衝突規則；逾期定義與提醒頻率；通知對象與服務；webhook 專屬限制值；1A2B 的複雜度基準；身分驗證與權限範圍；5～10 次迭代的判斷標準與時間預算；通知是否用本機替身。

```text
讀取 `.agents/skills/s-specify/SKILL.md` 並依其 SOP 執行。功能描述：做一個設備借用與預約審核系統，讓團體成員預約共用設備、由管理員審核，並追蹤領取、歸還與維修狀態；借用逾期時呼叫外部通知服務（例如 Discord）提醒，通知要記錄狀態、失敗時重試、同一筆逾期借用不重複通知。這是單人開發的課程練習專案，要能由小到大拆成 5～10 次 SDD 迭代，複雜度高於先前的 1A2B 猜數字遊戲。不做計費、採購、折舊、多語系、報表、行事曆同步。成功指標：可拆出 5～10 次迭代並各跑完整 SDD 流程、每次迭代至少記錄一項 Skill 不足、逾期借用觸發通知且不重複、複雜度高於 1A2B。待確認：成員與管理員身分、設備種類與庫存模型（單件或多件）、審核與時段衝突規則、逾期定義與提醒頻率、通知對象與服務、Discord webhook 專屬限制值（官方未公布）、身分驗證與權限範圍、5～10 次迭代的判斷標準與時間預算、1A2B 的複雜度基準、通知是否用本機替身。
```
