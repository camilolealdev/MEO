import { NextRequest, NextResponse } from "next/server";
import { handleMPWebhook } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type !== "preapproval" || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    await handleMPWebhook(body.data.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("MercadoPago webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
