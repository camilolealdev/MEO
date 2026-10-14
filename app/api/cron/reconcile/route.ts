import { NextRequest, NextResponse } from "next/server";
import { stripe, handleSubscriptionUpsert } from "@/lib/stripe";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/schema";
import { eq } from "drizzle-orm";

// PAY-10: reconciliación periódica de suscripciones.
//
// Los webhooks pueden perderse (caídas, reintentos agotados, despliegues). Este
// job re-obtiene el estado real de cada suscripción en el proveedor y lo vuelve
// a aplicar en la BD, corrigiendo derivas entre el proveedor y `subscriptions`.

// Nunca cachear: debe ejecutar contra datos vivos en cada invocación del cron.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Autenticación del cron: solo Vercel Cron (o quien tenga el secreto) puede
  // disparar la reconciliación.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Sin secreto configurado no podemos autenticar → no exponer el endpoint.
    return NextResponse.json(
      { error: "CRON_SECRET no está configurado." },
      { status: 503 }
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let reconciled = 0;
  let errors = 0;

  // --- Stripe -------------------------------------------------------------
  const stripeSubs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.provider, "stripe"));

  for (const row of stripeSubs) {
    try {
      const sub = await stripe.subscriptions.retrieve(row.stripeSubscriptionId);
      await handleSubscriptionUpsert(sub);
      reconciled += 1;
    } catch (err) {
      // Loggear y continuar: un fallo en una suscripción no debe abortar el
      // resto de la reconciliación.
      errors += 1;
      console.error(
        `reconcile: fallo al reconciliar la suscripción Stripe ${row.stripeSubscriptionId}:`,
        err
      );
    }
  }

  // --- MercadoPago --------------------------------------------------------
  // TODO(PAY-10): reconciliar suscripciones de MercadoPago (preapprovals) vía su
  // API cuando se implemente la lógica de upsert equivalente.

  // --- PayPal -------------------------------------------------------------
  // TODO(PAY-10): reconciliar suscripciones de PayPal vía su API cuando se
  // implemente la lógica de upsert equivalente.

  return NextResponse.json({ reconciled, errors });
}
