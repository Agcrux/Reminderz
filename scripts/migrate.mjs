import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
const sql = neon(process.env.DATABASE_URL);
const statements = readFileSync(new URL("../schema.sql", import.meta.url), "utf8")
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) await sql.query(statement);
console.log(`Applied ${statements.length} schema statements.`);
