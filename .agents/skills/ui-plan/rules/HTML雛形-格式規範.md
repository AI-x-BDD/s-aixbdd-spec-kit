# Rule 1 - 頁面必須是單一檔案且各頁共用同一套外觀

- 每頁的 CSS 必須寫在 `<style>` 內，JS 必須寫在不含 `src` 的 `<script>` 內。
- 不得以 `<link>`、`<script src>`、`<img src>`、`@import` 或 `url()` 引用 `http://`、`https://` 或 `//` 開頭的資源，字型與圖示庫也不例外。
- `:root` 的色彩 token 值必須取自 `ui/plan.md` 第 2 節的配色；第 2 節沒有列出的 token（例如 `--line`、`--primary-soft`）必須由同一組配色調淡或調暗推導，不得引入第 2 節以外的色相。
- `BASE_STYLES`、`HEADER_EXTRA`，以及 `NAV_LINKS` 的連結順序與文字，必須在每頁相同；只有目前頁的導覽連結加 `aria-current="page"`。
- 頁面之間的連結，包含 `href` 與 JS 字串中的頁面網址，只能指向 `ui/plan.md` 第 3.1 節頁面清單中的檔案。

## Good Example

- 餐廳訂位雛形的 `ui/plan.md` 第 2 節配色為背景 `#FBF7F2`、主色 `#B5532D` 磚紅，頁面清單為 `index.html`、`booking.html`、`my-bookings.html`。`booking.html` 的 token 取自第 2 節，淺色變化由主色調淡；導覽與 `index.html` 相同，只有「訂位」加上 `aria-current`。

```html
<style>
  :root {
    --bg: #FBF7F2;
    --primary: #B5532D;
    --primary-soft: #F3E1D8;
  }
</style>
<nav class="site-nav" aria-label="主要導覽">
  <a href="index.html">選擇時段</a>
  <a href="booking.html" aria-current="page">訂位</a>
  <a href="my-bookings.html">我的訂位</a>
</nav>
```

## Bad Example

- 同一份規劃中，`booking.html` 以 `<link>` 引用線上字型，主色改成第 2 節沒有的玫瑰紅，導覽順序與 `index.html` 不同，還連到頁面清單沒有的 `menu.html`。

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC">
<style>
  :root {
    --bg: #FBF7F2;
    --primary: #E11D48;
  }
</style>
<nav class="site-nav" aria-label="主要導覽">
  <a href="my-bookings.html">我的訂位</a>
  <a href="index.html">選擇時段</a>
  <a href="menu.html">菜單</a>
</nav>
```

# Rule 2 - 使用者操作與雛形狀態都必須能在頁面上操作

- `ui/plan.md` 第 3.3 節列出的該頁每個操作，必須有對應的按鈕、連結或輸入欄位，且操作後畫面必須改變，例如數字更新、顯示提示或切換到下一個畫面。
- 需要等待外部系統結果的操作，必須以 `setTimeout` 模擬等待，依第 4 節的狀態順序推進，並以 `markState` 同步面板顯示的目前狀態。
- 模擬等待的計時器必須放入 `timers`，讓 `applyState` 切換狀態時能清除。
- `STATE_ENTRIES` 必須包含第 4 節該頁的每個狀態，且 `label` 必須與第 4 節的狀態名稱逐字相同。
- 每個狀態的 `apply` 必須把畫面設成該狀態，不得只改變面板上的文字。
- 第 5 節的每個情境必須能從某個雛形狀態直接看到，或從某個狀態經頁面操作到達；同一頁有多個欄位驗證錯誤時，必須合併為一個 `label` 為「欄位驗證錯誤」的狀態。

## Good Example

- 餐廳訂位的 `booking.html`，第 4 節列出「填寫訂位資料」「送出訂位中」「訂位成功」，第 5 節有「訂位人電話格式錯誤」「訂位人姓名空白」「時段已額滿」。按下「確認訂位」後以計時器推進到「訂位成功」；兩個欄位錯誤合併為「欄位驗證錯誤」，「時段已額滿」有自己的狀態。

```js
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!validate(true)) { markState('invalid'); return; }
  setSubmitting(true);
  markState('submitting');
  timers.push(setTimeout(() => { showConfirmed(); markState('confirmed'); }, 1200));
});

const STATES = [
  { key: 'form', label: '填寫訂位資料', apply: () => { fillForm(); showView('form'); } },
  { key: 'submitting', label: '送出訂位中', apply: () => { fillForm(MOCK.filledForm); setSubmitting(true); } },
  { key: 'confirmed', label: '訂位成功', apply: () => showConfirmed() },
  { key: 'invalid', label: '欄位驗證錯誤', apply: () => { fillForm(MOCK.invalidForm); validate(false); } },
  { key: 'full', label: '時段已額滿', apply: () => { fillForm(MOCK.filledForm); showBanner(MOCK.fullMessage); } },
];
```

## Bad Example

- 同一個頁面，「確認訂位」按鈕沒有綁定事件；面板的 `label` 寫成「已滿」，與第 5 節的「時段已額滿」不同；「訂位成功」的 `apply` 只改面板文字，畫面仍停在表單；第 4 節的「送出訂位中」沒有對應狀態。

```js
const STATES = [
  { key: 'form', label: '填寫訂位資料', apply: () => showView('form') },
  { key: 'confirmed', label: '訂位成功', apply: () => { protoToggle.textContent = '訂位成功'; } },
  { key: 'full', label: '已滿', apply: () => {} },
];
```

# Rule 3 - 頁面必須像真的產品

- 假資料必須使用「畫面規劃」中的實體，寫出具體的名稱、數值、日期與編號。
- 假資料不得使用 lorem ipsum、「商品 A」、「使用者 1」、「NT$XXX」、「測試資料」等佔位內容。
- 同一實體出現在不同頁面時，例如同一筆訂位或同一位顧客，名稱、數值、日期與編號必須相同。
- 頁面畫面只能出現產品本身會顯示的內容；不得加入說明雛形用途、規格、需求編號或「之後串接 API」等開發說明的段落，雛形狀態面板除外。

## Good Example

- 餐廳訂位的 `booking.html` 與 `my-bookings.html` 都顯示同一筆訂位：巷口小館，2026-11-08（六）18:30，4 位，訂位人陳品妤，訂位編號 RS20261108017；畫面只有訂位資訊與操作按鈕。

| 頁面 | 顯示內容 |
| ---- | -------- |
| `booking.html` 訂位成功 | 「訂位成功」、RS20261108017、2026-11-08（六）18:30、4 位、陳品妤 0921556118 |
| `my-bookings.html` | RS20261108017、2026-11-08（六）18:30、4 位、狀態「已確認」 |

## Bad Example

- 同一筆訂位在兩頁的人數不同，訂位人寫成佔位名稱，`booking.html` 畫面上還有一段寫給開發者的說明。

| 頁面 | 顯示內容 |
| ---- | -------- |
| `booking.html` 訂位成功 | 「訂位成功」、RS20261108017、2026-11-08 18:30、4 位、使用者 1；下方段落「本頁對應 FR-004，之後串接訂位 API」 |
| `my-bookings.html` | RS20261108017、2026-11-08 18:30、2 位、狀態「已確認」 |
