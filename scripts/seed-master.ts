import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/schema";
import { eq } from "drizzle-orm";

const MASTER_EMAIL = "master871017@meo.com";
const MASTER_ID = "master-871017";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, MASTER_EMAIL),
  });

  if (existing) {
    console.log("Master user already exists:", existing.id);
    return;
  }

  await db.insert(schema.users).values({
    id: MASTER_ID,
    email: MASTER_EMAIL,
    name: "Master Admin 871017",
    tier: "agency",
    role: "admin",
    emailVerified: new Date(),
  });

  console.log("Master user created:", MASTER_ID);
  console.log("Email:", MASTER_EMAIL);
  console.log("Login via email magic link (Resend must work) or direct DB login.");
}

main().catch(console.error);
