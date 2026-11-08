import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3000);

const server = app.listen(port, () => {
  console.log(`Equipment loan backend listening on http://localhost:${port}/api`);
});

export { server };
