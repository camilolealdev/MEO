// Hook de instrumentación de Next.js 16 (cierre parcial de OBS-01).
//
// `onRequestError` se dispara cuando el servidor de Next captura un error del
// lado servidor (Server Components, Route Handlers, Server Actions, Proxy).
// Aquí lo registramos con nuestro logger estructurado, sin proveedor externo.
//
// Firma verificada contra los tipos locales de Next:
//   node_modules/next/dist/server/instrumentation/types.d.ts
//   -> Instrumentation.onRequestError = (error: unknown, request, context) => void | Promise<void>
// (el `error` es `unknown` en el tipo real, aunque la doc lo describe como Error).

import { type Instrumentation } from "next";
import { logger, type LogMeta } from "@/lib/logger";

// Se ejecuta una sola vez al iniciar cada instancia del servidor. No-op por
// ahora; punto de arranque para instrumentación futura (OTel, etc.).
export function register(): void {
  // Intencionadamente vacío.
}

function extractErrorMeta(error: unknown): LogMeta {
  if (error instanceof Error) {
    const meta: LogMeta = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    // Next añade `digest` a los errores procesados por React; es el ID único
    // que permite correlacionar el error real.
    const digest = (error as { digest?: unknown }).digest;
    if (typeof digest === "string") {
      meta.digest = digest;
    }
    return meta;
  }
  return { message: String(error) };
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  logger.error("Unhandled server request error", {
    ...extractErrorMeta(error),
    request: {
      // Ruta/URL del recurso donde ocurrió el error, p. ej. /blog?name=foo
      path: request.path,
      method: request.method,
    },
    context: {
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
      revalidateReason: context.revalidateReason,
    },
  });

  // Integracion futura con un proveedor externo (aun NO instalado).
  // Cuando exista una cuenta/DSN, se activaria aqui SIN importar el paquete
  // estaticamente (import dinamico) para mantener este cierre dep-free, p. ej.:
  //
  //   if (process.env.SENTRY_DSN) {
  //     const Sentry = await import("@sentry/nextjs");
  //     Sentry.captureRequestError(error, request, context);
  //   }
  //
  // De momento solo dejamos el guard de entorno preparado, sin efecto real:
  if (process.env.SENTRY_DSN) {
    logger.warn("SENTRY_DSN presente pero la integracion externa aun no esta implementada");
  }
};
