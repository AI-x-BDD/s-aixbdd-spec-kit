# 真實 Discord 連線步驟

- 建立日期：2026-11-12
- 目的：補做迭代 6 漏掉的「真實 Discord 送達」驗證，並取得影片要用的截圖。
- 狀態：**未完成**。等使用者建立 Webhook。

## 1. 為什麼要做

迭代 6 的開發、測試與驗證都使用本機的 Discord 模擬器（`127.0.0.1:4010`）。模擬器是使用者電腦上一個假裝成 Discord 的小程式，用來測試「失敗、太忙、不回應」。用模擬器發出的訊息不會出現在 Discord 上。

選題規劃（`docs/dev/第三題選題討論.md` 第 200、356 行）要求：失敗情況用模擬器驗證，成功送出要用真實 Discord 驗證。迭代 6 沒有做真實 Discord 驗證，就打了 tag `iter-6-overdue-notification`。

## 2. 名詞

| 名詞 | 說明 |
|---|---|
| 模擬器 | 使用者電腦上假裝成 Discord 的程式。訊息只送到使用者的電腦 |
| Webhook | Discord 官方功能。每個頻道可以產生一個網址，程式把訊息送到這個網址，訊息就出現在真實的 Discord 頻道 |
| Bot（機器人） | 另一種連接 Discord 的方式，需要申請 token，可以讀訊息與回覆。本系統只需要發通知，不需要 Bot |

Webhook 網址就是連線憑證。任何人拿到網址，都能往這個頻道發訊息，所以只能放在 `.env`，不能 commit、截圖或貼到對話中。`.env` 不會進 git。

## 3. 使用者要做的事（約 3 分鐘）

1. 打開 Discord，按左側最下面的「＋」，選「建立我的伺服器」。名稱隨意，例如「設備借用通知」。
2. 在伺服器的「#一般」頻道名稱旁邊，按齒輪「編輯頻道」。
3. 左側選「整合」，按「建立 Webhook」。
4. 點剛建立的 Webhook，按「複製 Webhook 網址」。
5. 打開 `apps/equipment-loan/backend/.env`，加一行：

   ```
   DISCORD_WEBHOOK_URL="貼上剛才複製的網址"
   ```

6. 存檔後告訴 Claude Code「Webhook 好了」。網址不用給 Claude Code。

## 4. Claude Code 接著做的事

1. 啟動後端與前端，不啟動模擬器，也不在指令帶入 `DISCORD_WEBHOOK_URL`，讓後端讀 `.env` 的真實網址。
2. 執行 `npm run db:seed`，用管理員登入，到「逾期通知紀錄」按「立即檢查逾期」。
3. 請使用者在 Discord 頻道確認收到逾期通知。
4. 截一張「Discord 頻道訊息＋系統逾期通知紀錄（含 Message ID）」的同框畫面。截圖不能露出 Webhook 網址。
5. 把結果寫進 `docs/iterations/iter-6.md` 的「使用者驗證」與「影片素材清單」。
6. 驗證通過後，詢問使用者是否要把 tag `iter-6-overdue-notification` 移到新的 commit。

## 5. 回來後接續的提示詞

```
依 docs/discord/真實Discord連線步驟.md 第 4 節，補做迭代 6 的真實 Discord 送達驗證。我已在 apps/equipment-loan/backend/.env 設好 DISCORD_WEBHOOK_URL。
```

## 6. 最後報告的進度（同時記錄）

1. 第 1 項「SDD 流程不足總整理」：已寫好，`docs/report/SDD流程不足總整理.md`，等使用者確認內容。
2. 第 2 項「第四題前後比較報告」：還沒做。先檢查 `docs/iterations/iter-6-ab-比較.md` 是否足夠。
3. 第 3 項「旁白稿與鏡頭清單」：還沒做，需要本文件的真實 Discord 截圖。
4. 第 4 項「提交前核對」：還沒做。
