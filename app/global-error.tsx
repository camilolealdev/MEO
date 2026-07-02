"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Algo salió mal
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          Ocurrió un error inesperado. Intenta de nuevo.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.625rem 1.25rem",
            borderRadius: "0.5rem",
            background: "#7c3aed",
            color: "white",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
