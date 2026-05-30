import pg from "pg";
import type { Env } from "../config/env.js";

const { Pool } = pg;

export function makePool(env: Env): pg.Pool {
  return new Pool({
    connectionString: env.DATABASE_URL
  });
}

