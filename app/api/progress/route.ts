import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { progress } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getFrameworkBySlug } from "@/lib/content";
import { hasAccess, type Tier } from "@/lib/tiers";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.query.progress.findMany({
    where: eq(progress.userId, session.user.id),
  });

  return NextResponse.json({ progress: rows });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { frameworkSlug, timeSpentSeconds } = (body ?? {}) as {
    frameworkSlug?: unknown;
    timeSpentSeconds?: unknown;
  };

  if (typeof frameworkSlug !== "string" || frameworkSlug.length === 0) {
    return NextResponse.json({ error: "frameworkSlug requerido" }, { status: 400 });
  }

  const time =
    typeof timeSpentSeconds === "number" && Number.isFinite(timeSpentSeconds) && timeSpentSeconds >= 0
      ? Math.floor(timeSpentSeconds)
      : 0;

  // El framework debe existir y el usuario debe tener acceso a su tier.
  const fw = getFrameworkBySlug(frameworkSlug);
  if (!fw) {
    return NextResponse.json({ error: "Framework no encontrado" }, { status: 404 });
  }
  const userTier: Tier = session.user.tier ?? "free";
  if (!hasAccess(userTier, fw.tier as Tier)) {
    return NextResponse.json({ error: "Tier insuficiente" }, { status: 403 });
  }

  try {
    // Upsert atómico: sin race condition (TOCTOU) y acumulando el tiempo en
    // lugar de ignorarlo cuando ya existe progreso previo.
    await db
      .insert(progress)
      .values({
        userId: session.user.id,
        frameworkSlug,
        timeSpentSeconds: time,
      })
      .onConflictDoUpdate({
        target: [progress.userId, progress.frameworkSlug],
        set: {
          timeSpentSeconds: sql`${progress.timeSpentSeconds} + ${time}`,
        },
      });
  } catch (error) {
    console.error("progress POST error:", error);
    return NextResponse.json({ error: "No se pudo guardar el progreso" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
