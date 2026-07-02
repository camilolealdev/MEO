import "dotenv/config";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Credenciales por variables de entorno — nunca hardcodeadas en el repo.
// Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/set-password.ts
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error("Faltan variables de entorno: define ADMIN_EMAIL y ADMIN_PASSWORD.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(PASSWORD, 12);
  await sql`UPDATE "users" SET "password_hash" = ${hash} WHERE "email" = ${EMAIL}`;
  console.log(`Password set for ${EMAIL}`);
}

main().catch(console.error);
