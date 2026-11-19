// bug-test 量測用的「模擬時刻」：由 run-at.sh 以 NODE_OPTIONS=--import 預載到整個 Node 行程樹。
// 把 Date 平移到 SIM_ANCHOR_MS 那一天的台北 SIM_TAIPEI_TIME（HH:MM），時間照常往前走。
// 所有行程共用同一個 SIM_ANCHOR_MS（run-at.sh 啟動時的實際時間），因此平移量一致。
const BaseDate = globalThis.Date;
const simTime = process.env.SIM_TAIPEI_TIME;
const anchorMs = Number(process.env.SIM_ANCHOR_MS);

if (!/^\d{2}:\d{2}$/.test(simTime ?? "") || !Number.isFinite(anchorMs)) {
  throw new Error("sim-clock.mjs 需要 SIM_TAIPEI_TIME（HH:MM）與 SIM_ANCHOR_MS");
}

const taipeiDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new BaseDate(anchorMs));
const offsetMs = BaseDate.parse(`${taipeiDay}T${simTime}:00+08:00`) - anchorMs;

class SimDate extends BaseDate {
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
  static [Symbol.hasInstance](value) {
    return value instanceof BaseDate;
  }
}

globalThis.Date = SimDate;
