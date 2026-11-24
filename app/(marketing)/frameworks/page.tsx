import FrameworkExplorer from "@/components/frameworks/FrameworkExplorer";
import type { FrameworkExplorerItem } from "@/components/frameworks/framework-types";
import { getAllFrameworks, getFrameworkBySlug } from "@/lib/content";

function section(content: string, heading: string) {
  const match = content.match(new RegExp(`^##\\s+${heading}\\s*$([\\s\\S]*?)(?=^##\\s+|$)`, "mi"));
  return match?.[1]?.trim() ?? "";
}

function paragraph(content: string, heading: string) {
  return section(content, heading)
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+[.)]\s+/gm, "")
    .replace(/\[[^\]]+\]\([^\)]+\)/g, "")
    .replace(/[*_`>#]/g, "")
    .split(/\n\s*\n/)[0]
    .replace(/\s+/g, " ")
    .trim();
}

function list(content: string, heading: string) {
  return section(content, heading)
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*]|\d+[.)])\s+/, "").replace(/[*_`]/g, "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

export default function FrameworksPage() {
  const frameworks = getAllFrameworks();
  const items: FrameworkExplorerItem[] = frameworks.map((meta) => {
    const full = getFrameworkBySlug(meta.slug);
    const content = full?.content ?? "";
    return {
      title: meta.title,
      number: meta.number,
      slug: meta.slug,
      category: meta.category,
      tier: meta.tier,
      estimatedMinutes: meta.estimatedMinutes,
      purpose: paragraph(content, "Propósito") || paragraph(content, "Definición"),
      kpis: list(content, "KPIs"),
      limits: paragraph(content, "Límites"),
      connections: list(content, "Conexiones"),
    };
  });

  return (
    <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="mb-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Biblioteca MEO</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Elige con contexto, no por intuición</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">Explora los frameworks del catálogo, filtra por problema y compara sus implicaciones antes de convertirlos en una ruta de trabajo.</p>
      </div>
      <FrameworkExplorer frameworks={items} />
    </main>
  );
}
