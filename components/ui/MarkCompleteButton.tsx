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

  async function toggle() {
    if (completed) return;
    setLoading(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frameworkSlug: slug, timeSpentSeconds: 0 }),
    });
    setCompleted(true);
    setLoading(false);
  }

  return (
    <button onClick={toggle} disabled={loading || completed} className="flex items-center gap-1.5 text-sm font-medium transition-colors">
      {completed ? (
        <><CheckCircle className="w-4 h-4 text-lime-500" /><span className="text-lime-600">Completado</span></>
      ) : (
        <><Circle className="w-4 h-4 text-gray-400" /><span className="text-gray-500 hover:text-gray-700">{loading ? "..." : "Marcar completado"}</span></>
      )}
    </button>
  );
}
