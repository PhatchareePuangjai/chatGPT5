import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const sqlPath = path.join(__dirname, "..", "..", "db", "001_init.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    await client.query(sql);
    console.log("✅ Migration complete");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("❌ Migration failed:", e.message);
  process.exit(1);
});
