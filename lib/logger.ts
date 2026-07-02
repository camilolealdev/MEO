// Logger estructurado mínimo y sin dependencias (cierre parcial de OBS-01).
//
// - En producción emite UNA línea JSON por evento vía `console[level]`, apta
//   para ser recolectada por la plataforma (Vercel) o un agregador externo.
// - En desarrollo usa un formato legible por humanos.
//
// No añade dependencias npm. El punto de integración con un proveedor externo
// (p. ej. Sentry) se deja preparado en `instrumentation.ts`, no aquí.

export type LogLevel = "info" | "warn" | "error";

export type LogMeta = Record<string, unknown>;

export type LogFn = (message: string, meta?: LogMeta) => void;

export interface Logger {
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

const isProduction = (): boolean => process.env.NODE_ENV === "production";

function emit(level: LogLevel, message: string, meta?: LogMeta): void {
  const time = new Date().toISOString();

  if (isProduction()) {
    // Una línea JSON por log. `meta` se expande al nivel raíz; las claves
    // reservadas (level/message/time) tienen prioridad y no se sobreescriben.
    const record: Record<string, unknown> = { ...meta, level, message, time };
    console[level](JSON.stringify(record));
    return;
  }

  // Desarrollo: formato legible.
  const prefix = `[${time}] ${level.toUpperCase()} ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    console[level](prefix, meta);
  } else {
    console[level](prefix);
  }
}

export const logger: Logger = {
  info: (message, meta) => emit("info", message, meta),
  warn: (message, meta) => emit("warn", message, meta),
  error: (message, meta) => emit("error", message, meta),
};
