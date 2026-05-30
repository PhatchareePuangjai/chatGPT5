import "dotenv/config";
import { loadEnv } from "./config/env.js";
import { makePool } from "./db/pool.js";
import { buildApp } from "./app.js";

const env = loadEnv();
const pool = makePool(env);

const app = buildApp(pool);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ level: "info", msg: "server_listening", port: env.PORT }));
});
