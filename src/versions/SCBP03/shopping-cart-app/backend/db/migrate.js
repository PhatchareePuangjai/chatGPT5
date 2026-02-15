import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Create backend/.env from .env.example");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const sql = await fs.readFile(path.join(__dirname, "../../db/001_init.sql"), "utf8");
  await pool.query(sql);
  await pool.end();
  console.log("Migration complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
