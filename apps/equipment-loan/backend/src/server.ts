import { app } from "./app.js";
import { start as startOverdueScheduler } from "./jobs/overdueScheduler.js";

const port = Number(process.env.PORT ?? 3000);

const server = app.listen(port, () => {
  console.log(`Equipment loan backend listening on http://localhost:${port}/api`);
});

// 排程只在這裡啟動；app.ts 不啟動排程，Supertest 匯入 app 時不會跑排程
startOverdueScheduler().catch((error: unknown) => {
  const name = error instanceof Error ? error.name : "UnknownError";
  console.error(`[overdueScheduler] 啟動失敗 error=${name}`);
});

export { server };
