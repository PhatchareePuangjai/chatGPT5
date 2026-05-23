import { createPool } from "../db/pool.js";
import { getConfig } from "../config/index.js";
import { createApp } from "./app.js";

const pool = createPool();
const cfg = getConfig();
const app = createApp(pool);

app.listen(cfg.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`backend listening on :${cfg.PORT}`);
});
