import type pg from "pg";
import { buildApp } from "../../src/app.js";

export function makeTestApp(pool: pg.Pool) {
  return buildApp(pool);
}

