import "dotenv/config";
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

// Migracion aditiva (IF NOT EXISTS). Uso: npx tsx scripts/apply-migration-0003.ts
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const statements = readFileSync("drizzle/0003_gap_analysis.sql", "utf8")
    .split(/;\s*\n/)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
  for (const s of statements) {
    await sql(s);
    console.log("OK:", s.split("\n")[0].slice(0, 80));
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
