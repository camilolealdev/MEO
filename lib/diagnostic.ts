import type { FrameworkMeta } from "@/lib/content";

export type DiagnosticFramework = {
  slug: string;
  title: string;
  reason: string;
  evidence: "Alta" | "Media" | "Baja";
  updatedAt: string;
  tags: string[];
};

const signals: Record<string, { reason: string; tags: string[] }> = {
  "sostac-framework": { reason: "Ordena el diagnóstico, los objetivos, la estrategia y el plan de acción.", tags: ["clarity", "plan", "growth"] },
  "race-framework": { reason: "Convierte el recorrido de adquisición a fidelización en etapas medibles.", tags: ["visibility", "conversion", "retention", "measurement"] },
  "seo-search-engine-optimization": { reason: "Mejora la capacidad de ser encontrado cuando existe una demanda concreta.", tags: ["visibility", "organic", "measurement"] },
  "aeo-answer-engine-optimization": { reason: "Ayuda a estructurar respuestas útiles y verificables para búsquedas con IA.", tags: ["visibility", "organic", "clarity"] },
  "jobs-to-be-done-jtbd": { reason: "Aclara el progreso que la persona intenta conseguir y qué mensaje necesita.", tags: ["audience", "clarity", "conversion"] },
  "stp-segmentation-targeting-positioning": { reason: "Ayuda a elegir segmentos prioritarios y una posición defendible.", tags: ["audience", "plan", "clarity"] },
  "funnel-de-ventas-tradicional": { reason: "Localiza dónde se pierde la demanda y qué experiencia debe mejorarse.", tags: ["conversion", "measurement", "product"] },
  "data-analytics-frameworks": { reason: "Conecta preguntas de negocio, eventos, métricas y decisiones.", tags: ["measurement", "optimize", "growth"] },
  "imc-integrated-marketing-communications": { reason: "Alinea el mensaje, la audiencia y la ejecución entre canales.", tags: ["coordination", "relationship", "growth"] },
  "customer-retention-framework": { reason: "Convierte señales de uso y satisfacción en acciones de permanencia.", tags: ["retention", "relationship", "measurement"] },
  "customer-feedback-loop-framework": { reason: "Cierra el ciclo entre señales de clientes, aprendizaje y mejora.", tags: ["retention", "product", "audience", "optimize"] },
  "agile-marketing-framework": { reason: "Permite priorizar experimentos, aprender rápido y coordinar entregas.", tags: ["optimize", "coordination", "growth"] },
};

function fallbackSignals(framework: FrameworkMeta) {
  const category = framework.category.toLowerCase();
  const tags = [
    category.includes("seo") || category.includes("contenido") ? "organic" : "plan",
    category.includes("cliente") || category.includes("audiencia") ? "audience" : "clarity",
    framework.tier === "agency" ? "growth" : "measurement",
  ];
  return {
    reason: `${framework.title} ofrece un punto de partida estructurado para trabajar este problema dentro de ${framework.category}.`,
    tags: [...new Set(tags)],
  };
}

export function buildDiagnosticCatalog(frameworks: FrameworkMeta[]): DiagnosticFramework[] {
  return frameworks.map((framework) => {
    const signal = signals[framework.slug] ?? fallbackSignals(framework);
    return {
      slug: framework.slug,
      title: framework.title,
      reason: signal.reason,
      evidence: framework.evidenceLevel === "high" ? "Alta" : framework.evidenceLevel === "medium" ? "Media" : "Baja",
      updatedAt: framework.lastUpdated ?? "Sin fecha declarada",
      tags: signal.tags,
    };
  });
}
