import { db } from "./db";
import { webhookEvents } from "./schema";

/**
 * Registra un evento de webhook para garantizar idempotencia.
 *
 * @returns `true` si el evento es nuevo y debe procesarse; `false` si ya se
 * había recibido (duplicado → omitir reprocesamiento).
 *
 * Degradación segura: si el registro falla (p.ej. la migración 0003 aún no se
 * aplicó y la tabla no existe), se loggea y se devuelve `true` para no perder
 * eventos legítimos. La idempotencia se activa automáticamente una vez migrada.
 */
export async function isNewWebhookEvent(
  provider: string,
  eventId: string
): Promise<boolean> {
  if (!eventId) return true; // sin id no se puede deduplicar; procesar
  try {
    const inserted = await db
      .insert(webhookEvents)
      .values({ provider, eventId })
      .onConflictDoNothing({
        target: [webhookEvents.provider, webhookEvents.eventId],
      })
      .returning({ id: webhookEvents.id });
    return inserted.length > 0;
  } catch (error) {
    console.error(`isNewWebhookEvent: no se pudo registrar ${provider}:${eventId}`, error);
    return true;
  }
}
