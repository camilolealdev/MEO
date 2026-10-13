import "dotenv/config";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { nanoid } from "nanoid";

// Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/create-admin.ts
// Crea (o promueve) un usuario admin con tier agency. La contrasena nunca se guarda en el repo.
const EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error("Define ADMIN_EMAIL y ADMIN_PASSWORD.");
    process.exit(1);
  }
  if (PASSWORD.length < 12) {
    console.error("ADMIN_PASSWORD debe tener al menos 12 caracteres.");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL!);
  const hash = await bcrypt.hash(PASSWORD, 12);
  const id = `admin-${nanoid(10)}`;
  await sql`
    INSERT INTO "users" ("id", "email", "name", "tier", "role", "password_hash", "email_verified")
    VALUES (${id}, ${EMAIL}, 'Admin', 'agency', 'admin', ${hash}, now())
    ON CONFLICT ("email") DO UPDATE
      SET "role" = 'admin', "tier" = 'agency', "password_hash" = ${hash}, "email_verified" = now()`;
  console.log(`Admin listo: ${EMAIL}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
