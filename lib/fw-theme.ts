// Acento visual por categoría de framework. Los componentes Fw* consumen estas
// variables CSS vía las utilidades .fw-acc-* de globals.css (con fallback violeta).
export interface CategoryAccent {
  label: string;
  color: string;
  soft: string;
  border: string;
}

export const CATEGORY_ACCENTS: Record<string, CategoryAccent> = {
  "core-meo": { label: "Core MEO", color: "#6D28D9", soft: "#F5F3FF", border: "#DDD6FE" },
  clasico: { label: "Clásico", color: "#1D4ED8", soft: "#EFF6FF", border: "#BFDBFE" },
  avanzado: { label: "Avanzado", color: "#0E7490", soft: "#ECFEFF", border: "#A5F3FC" },
  emergente: { label: "Emergente", color: "#4D7C0F", soft: "#F7FEE7", border: "#D9F99D" },
  estrategico: { label: "Estratégico", color: "#B45309", soft: "#FFFBEB", border: "#FDE68A" },
  especializado: { label: "Especializado", color: "#BE123C", soft: "#FFF1F2", border: "#FECDD3" },
  complementario: { label: "Complementario", color: "#475569", soft: "#F8FAFC", border: "#E2E8F0" },
};

export const DEFAULT_ACCENT: CategoryAccent = CATEGORY_ACCENTS["core-meo"];

export function getAccent(category: string): CategoryAccent {
  return CATEGORY_ACCENTS[category] ?? DEFAULT_ACCENT;
}

/** Style object para el wrapper del artículo: habilita .fw-acc-* dentro. */
export function accentVars(a: CategoryAccent): Record<string, string> {
  return {
    "--fw-acc": a.color,
    "--fw-acc-soft": a.soft,
    "--fw-acc-border": a.border,
  };
}
