"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="p-8 max-w-4xl">
      <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
        <h1 className="font-display font-bold text-xl text-gray-900 mb-2">
          No pudimos cargar esta sección
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Ocurrió un error al obtener tus datos. Intenta de nuevo.
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-lg bg-gradient-meo text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
