import "dotenv/config";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const EMAIL = "master871017@meo.com";
const PASSWORD = "Admin123!";

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 12);
  await sql`UPDATE "users" SET "password_hash" = ${hash} WHERE "email" = ${EMAIL}`;
  console.log(`Password set for ${EMAIL}`);
}

main().catch(console.error);
