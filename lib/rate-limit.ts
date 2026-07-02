// Rate limiter de ventana fija EN MEMORIA.
//
// ⚠️ Limitación conocida: el estado vive en la memoria del proceso, así que en
// serverless (Vercel) es por-instancia y no se comparte entre lambdas ni
// sobrevive a un cold start. Sirve como defensa básica contra fuerza bruta,
// pero para un límite robusto y distribuido hay que migrar a Upstash/Redis
// (ver SEC-04 en ANALISIS-BRECHAS-ARQUITECTURA.md).

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number; // segundos hasta poder reintentar (0 si ok)
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

/**
 * Extrae una IP de cliente razonable de las cabeceras del request.
 *
 * ⚠️ `x-forwarded-for` es manipulable por el cliente: un atacante puede rotar
 * el valor para obtener un bucket distinto por request y eludir el límite. En
 * Vercel conviene usar la IP que inyecta la plataforma (no la parte controlable
 * de XFF) y un store distribuido. Mitigación completa: SEC-04 con Upstash +
 * fuente de IP de confianza. Esto es defensa básica interim.
 */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
