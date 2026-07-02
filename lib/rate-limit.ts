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

// --- SEC-04: rate limiting distribuido con Upstash Redis (REST) --------------
//
// `rateLimitAsync` implementa la misma semántica de ventana fija que `rateLimit`
// pero de forma DISTRIBUIDA usando la REST API de Upstash (sin dependencias npm,
// solo `fetch`). El estado se comparte entre todas las instancias serverless, lo
// que cierra la brecha del limitador en memoria (por-instancia).
//
// Estrategia de resiliencia: si Upstash no está configurado, o si una llamada
// falla (red, timeout, respuesta inesperada), se cae al limitador en memoria
// `rateLimit`. Así el endpoint nunca queda sin ninguna protección ni se rompe
// por un fallo del store externo (fail-open hacia el limitador local).

// Forma mínima de la respuesta REST de Upstash: `{ "result": <valor> }`.
interface UpstashResponse {
  result: number | null;
}

/**
 * Ejecuta un comando de Redis contra la REST API de Upstash.
 *
 * Upstash acepta el comando como segmentos de path, p. ej.
 * `POST {url}/incr/{key}` o `POST {url}/expire/{key}/{seconds}`.
 * Devuelve el valor numérico de `result`, o `null` si la respuesta no es válida.
 */
async function upstashCommand(
  baseUrl: string,
  token: string,
  segments: string[]
): Promise<number | null> {
  const path = segments.map((s) => encodeURIComponent(s)).join("/");
  const res = await fetch(`${baseUrl}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    // No cachear: cada llamada debe golpear Redis.
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Upstash respondió ${res.status}`);
  }
  const data = (await res.json()) as UpstashResponse;
  return typeof data.result === "number" ? data.result : null;
}

/**
 * Rate limiter de ventana fija ASÍNCRONO y distribuido.
 *
 * - Si `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` están definidos,
 *   usa Upstash: `INCR key`; en la primera petición de la ventana (result === 1)
 *   fija el TTL con `EXPIRE key <windowSegundos>`. Si el contador supera el
 *   límite, deniega y estima `retryAfter` con `PTTL` (o `windowMs` si no hay TTL).
 * - Ante cualquier error de red/respuesta, o si faltan las envs, cae al
 *   limitador en memoria `rateLimit` (misma clave, límite y ventana).
 *
 * Mantiene la misma firma de resultado (`RateLimitResult`) que `rateLimit`.
 */
export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Sin Upstash configurado → limitador en memoria.
  if (!url || !token) {
    return rateLimit(key, limit, windowMs);
  }

  try {
    const windowSeconds = Math.ceil(windowMs / 1000);
    const count = await upstashCommand(url, token, ["incr", key]);

    // Respuesta inesperada: tratar como fallo y caer al limitador local.
    if (count === null) {
      return rateLimit(key, limit, windowMs);
    }

    // Primera petición de la ventana: fijar expiración para que el contador
    // se reinicie automáticamente al terminar la ventana.
    if (count === 1) {
      await upstashCommand(url, token, ["expire", key, String(windowSeconds)]);
    }

    if (count > limit) {
      // Estimar retryAfter con el TTL restante (PTTL en ms). Si Redis no
      // devuelve un TTL válido (-1/-2 o error), usar la ventana completa.
      let retryAfter = windowSeconds;
      const pttl = await upstashCommand(url, token, ["pttl", key]);
      if (pttl !== null && pttl > 0) {
        retryAfter = Math.ceil(pttl / 1000);
      }
      return { ok: false, retryAfter };
    }

    return { ok: true, retryAfter: 0 };
  } catch (err) {
    // Fail-open hacia el limitador en memoria: nunca dejar el endpoint sin
    // protección por un fallo del store distribuido.
    console.error("rateLimitAsync: fallo con Upstash, usando limitador en memoria:", err);
    return rateLimit(key, limit, windowMs);
  }
}
