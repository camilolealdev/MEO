"use client";
import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

interface Props {
  slug: string;
  initialCompleted?: boolean;
}

export function MarkCompleteButton({ slug, initialCompleted = false }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function toggle() {
    if (completed) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frameworkSlug: slug, timeSpentSeconds: 0 }),
      });
      // Solo marcar completado si el servidor confirmó; si no, mostrar error
      // y permitir reintentar (no dejar el estado en un "completado" falso).
      if (!res.ok) {
        setError(true);
        return;
      }
      setCompleted(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={toggle} disabled={loading || completed} className="flex items-center gap-1.5 text-sm font-medium transition-colors">
      {completed ? (
        <><CheckCircle className="w-4 h-4 text-lime-500" /><span className="text-lime-600">Completado</span></>
      ) : error ? (
        <><Circle className="w-4 h-4 text-red-400" /><span className="text-red-500 hover:text-red-600">Error — reintentar</span></>
      ) : (
        <><Circle className="w-4 h-4 text-gray-400" /><span className="text-gray-500 hover:text-gray-700">{loading ? "..." : "Marcar completado"}</span></>
      )}
    </button>
  );
}
