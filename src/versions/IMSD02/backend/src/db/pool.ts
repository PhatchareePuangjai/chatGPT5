import pg from "pg";
import { getConfig } from "../config/index.js";

const { Pool } = pg;

export function createPool({ database }: { database?: string } = {}) {
  const cfg = getConfig();
  return new Pool({
    host: cfg.POSTGRES_HOST,
    port: cfg.POSTGRES_PORT,
    user: cfg.POSTGRES_USER,
    password: cfg.POSTGRES_PASSWORD,
    database: database ?? cfg.POSTGRES_DB
  });
}
