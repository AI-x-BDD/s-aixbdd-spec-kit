// E2E 專用時鐘平移：由 playwright.config.ts 以 `node --import` 預載到 Playwright 啟動的後端。
// 把行程的 Date 平移到「啟動當天 Asia/Taipei 的 E2E_FIXED_TAIPEI_TIME（預設 14:30）」，之後時間照常往前走。
// 14:30 取自 005 ui/plan.md 的雛形情境：今天上午時段已結束、今天晚間時段尚未結束，
// 讓依實際時刻判斷的「可否領取」在任何時刻執行 E2E 都得到相同結果。不影響正式執行的後端。

const BaseDate = globalThis.Date;
const fixedTime = process.env.E2E_FIXED_TAIPEI_TIME ?? "14:30";

if (!/^\d{2}:\d{2}$/.test(fixedTime)) {
  throw new Error(
    `E2E_FIXED_TAIPEI_TIME 必須是 HH:MM 格式，收到：${fixedTime}`,
  );
}

const startedAt = BaseDate.now();
const taipeiToday = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new BaseDate(startedAt));
const offsetMs =
  BaseDate.parse(`${taipeiToday}T${fixedTime}:00+08:00`) - startedAt;

class ShiftedDate extends BaseDate {
  constructor(...args) {
    if (args.length === 0) {
      super(BaseDate.now() + offsetMs);
    } else {
      super(...args);
    }
  }

  static now() {
    return BaseDate.now() + offsetMs;
  }

  // 讓原生程式建立的 Date（例如資料庫驅動回傳的時間）仍通過 instanceof Date 檢查
  static [Symbol.hasInstance](value) {
    return value instanceof BaseDate;
  }
}

globalThis.Date = ShiftedDate;
