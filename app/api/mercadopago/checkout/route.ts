import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createMPSubscription } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier } = await req.json();
  if (tier !== "pro" && tier !== "agency") {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  try {
    const initPoint = await createMPSubscription(
      session.user.id,
      session.user.email!,
      tier
    );
    return NextResponse.json({ url: initPoint });
  } catch (error) {
    console.error("MercadoPago checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
