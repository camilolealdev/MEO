import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// No cachear: el health check debe reflejar el estado actual en cada llamada.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("health check: fallo de conexión a la BD:", error);
    return NextResponse.json({ status: "error", db: "unreachable" }, { status: 503 });
  }
}
