import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { progress } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

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

  const body = await req.json();
  const { frameworkSlug, timeSpentSeconds } = body;

  if (!frameworkSlug) {
    return NextResponse.json({ error: "Missing frameworkSlug" }, { status: 400 });
  }

  const existing = await db.query.progress.findFirst({
    where: and(
      eq(progress.userId, session.user.id),
      eq(progress.frameworkSlug, frameworkSlug)
    ),
  });

  if (!existing) {
    await db.insert(progress).values({
      id: nanoid(),
      userId: session.user.id,
      frameworkSlug,
      timeSpentSeconds: timeSpentSeconds ?? 0,
    });
  }

  return NextResponse.json({ success: true });
}
