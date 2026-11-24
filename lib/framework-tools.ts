import { getFrameworkBySlug, type FrameworkFull } from "@/lib/content";

export interface FrameworkTemplateData {
  framework: FrameworkFull;
  markdown: string;
}

function escapeYaml(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildFrameworkTemplate(framework: FrameworkFull): string {
  const resources = framework.resources
    .map((resource) => `- [${resource.title}](${resource.url})`)
    .join("\n");
  const updated = framework.lastUpdated ?? "Pendiente de revisión explícita";

  return `---
title: "${escapeYaml(framework.title)} — plantilla de trabajo"
frameworkSlug: "${framework.slug}"
evidenceLevel: "${framework.evidenceLevel}"
lastUpdated: "${updated}"
---

# ${framework.title}

> Plantilla operativa derivada de **${framework.title}**. Completa los campos con evidencia del proyecto y conserva los límites del framework.

## Contexto del framework

- Número: ${framework.number}
- Categoría: ${framework.category}
- Nivel: ${framework.tier}
- Tiempo estimado de lectura: ${framework.estimatedMinutes} minutos
- Nivel de evidencia derivado: **${framework.evidenceLevel}** (${framework.sourceCount} fuentes válidas; ${framework.primarySourceCount} fuente(s) primaria(s) reconocible(s))
- Última actualización declarada: **${updated}**

## Objetivo

<!-- ¿Qué decisión o problema concreto resolverá esta aplicación? -->

## Diagnóstico y línea base

- Situación actual:
- Audiencia o sistema afectado:
- Datos disponibles y permisos:
- Línea base y periodo:

## Aplicación

1. Define el alcance y el resultado observable.
2. Documenta entradas, supuestos y restricciones.
3. Ejecuta las acciones del framework en un experimento o ciclo acotado.
4. Revisa resultados frente a la línea base.
5. Registra decisiones, responsables y siguiente iteración.

## Indicadores

- KPI principal:
- Indicadores de calidad o riesgo:
- Método de atribución:
- Criterio de éxito o abandono:

## Límites y riesgos

- Qué no demuestra este framework:
- Riesgos de privacidad, sesgo, accesibilidad o dependencia de plataforma:
- Revisión humana necesaria:

## Evidencia y decisiones

- Hallazgo:
- Fuente o registro:
- Fecha de observación:
- Decisión tomada:
- Confianza: baja / media / alta

## Fuentes de referencia

${resources || "- Añadir una fuente primaria o canónica antes de usar esta plantilla."}

## Próxima revisión

- Fecha propuesta:
- Responsable:
- Cambio que debe comprobarse:
`;
}

export function getFrameworkTemplate(slug: string): FrameworkTemplateData | null {
  const framework = getFrameworkBySlug(slug);
  return framework ? { framework, markdown: buildFrameworkTemplate(framework) } : null;
}
