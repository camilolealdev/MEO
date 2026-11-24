"use client";

import { useMemo, useState } from "react";
import type { FrameworkExplorerItem, FrameworkTier } from "./framework-types";

const tierLabels: Record<FrameworkTier, string> = {
  free: "Gratis",
  pro: "Pro",
  agency: "Agencia",
};

function compact(value: string, fallback: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean || fallback;
}

function tagList(values: string[], fallback: string) {
  return values.length ? values : [fallback];
}

export default function FrameworkExplorer({
  frameworks,
}: {
  frameworks: FrameworkExplorerItem[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tier, setTier] = useState<"all" | FrameworkTier>("all");
  const [selected, setSelected] = useState<string[]>([]);

  const categories = useMemo(
    () => Array.from(new Set(frameworks.map((framework) => framework.category))).sort(),
    [frameworks]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return frameworks.filter((framework) => {
      const haystack = `${framework.title} ${framework.category} ${framework.purpose}`.toLocaleLowerCase();
      return (
        (!normalizedQuery || haystack.includes(normalizedQuery)) &&
        (category === "all" || framework.category === category) &&
        (tier === "all" || framework.tier === tier)
      );
    });
  }, [category, frameworks, query, tier]);

  const compared = selected
    .map((slug) => frameworks.find((framework) => framework.slug === slug))
    .filter((framework): framework is FrameworkExplorerItem => Boolean(framework));

  function toggleFramework(slug: string) {
    setSelected((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : current.length < 3
          ? [...current, slug]
          : current
    );
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="matrix-title" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Matriz de decisión</p>
            <h2 id="matrix-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Encuentra el framework adecuado</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Filtra por contexto y compara hasta tres opciones antes de elegir tu siguiente paso.</p>
          </div>
          <p className="text-sm font-medium text-slate-600" aria-live="polite">{filtered.length} de {frameworks.length} frameworks</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]" role="search">
          <div>
            <label htmlFor="framework-search" className="sr-only">Buscar frameworks</label>
            <input
              id="framework-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Busca por nombre, categoría o propósito"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-500 focus-visible:border-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-100"
            />
          </div>
          <div>
            <label htmlFor="framework-category" className="sr-only">Filtrar por categoría</label>
            <select id="framework-category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus-visible:border-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-100">
              <option value="all">Todas las categorías</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="framework-tier" className="sr-only">Filtrar por nivel</label>
            <select id="framework-tier" value={tier} onChange={(event) => setTier(event.target.value as "all" | FrameworkTier)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus-visible:border-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-100">
              <option value="all">Todos los niveles</option>
              <option value="free">Gratis</option>
              <option value="pro">Pro</option>
              <option value="agency">Agencia</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Resultados de frameworks">
          {filtered.map((framework) => {
            const isSelected = selected.includes(framework.slug);
            const disabled = !isSelected && selected.length >= 3;
            return (
              <article key={framework.slug} className={`flex min-h-44 flex-col rounded-2xl border p-4 transition ${isSelected ? "border-indigo-600 bg-indigo-50/60 shadow-sm" : "border-slate-200 bg-slate-50/60 hover:border-slate-300"}`}>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold tabular-nums text-slate-500">{String(framework.number).padStart(3, "0")}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">{tierLabels[framework.tier]}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">{framework.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-600">{compact(framework.purpose, "Marco para ordenar decisiones de marketing.")}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="text-xs text-slate-500">{framework.category} · {framework.estimatedMinutes} min</span>
                  <button type="button" onClick={() => toggleFramework(framework.slug)} disabled={disabled} aria-pressed={isSelected} className="rounded-lg border border-indigo-700 px-3 py-2 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-700 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400">
                    {isSelected ? "Quitar" : "Comparar"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {!filtered.length && <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-700">No encontramos frameworks con esos filtros. Prueba con otra búsqueda.</p>}
      </section>

      <section aria-labelledby="comparison-title" className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Comparador</p>
            <h2 id="comparison-title" className="mt-2 text-2xl font-semibold tracking-tight">Contrasta antes de decidir</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Selecciona hasta tres frameworks para ver propósito, KPIs, límites y conexiones lado a lado.</p>
          </div>
          {selected.length > 0 && <button type="button" onClick={() => setSelected([])} className="self-start rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300">Limpiar selección</button>}
        </div>

        {!compared.length ? (
          <p className="mt-6 rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-300">Aún no hay frameworks seleccionados. Usa el botón “Comparar” en la matriz.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-700">
            <table className="min-w-[760px] w-full border-collapse text-left text-sm">
              <caption className="sr-only">Comparación de frameworks seleccionados</caption>
              <thead className="bg-slate-900">
                <tr>
                  <th scope="col" className="w-32 border-b border-slate-700 p-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Criterio</th>
                  {compared.map((framework) => <th scope="col" key={framework.slug} className="border-b border-slate-700 p-4 align-top text-base font-semibold text-white">{framework.title}<span className="mt-1 block text-xs font-normal text-slate-400">{framework.category}</span></th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Propósito", compared.map((framework) => compact(framework.purpose, "No especificado."))],
                  ["KPIs", compared.map((framework) => tagList(framework.kpis, "Define una línea base."))],
                  ["Límites", compared.map((framework) => compact(framework.limits, "Requiere contexto y validación."))],
                  ["Conexiones", compared.map((framework) => tagList(framework.connections, "Sin conexiones indicadas."))],
                ].map(([label, values]) => (
                  <tr key={label as string} className="align-top even:bg-slate-900/60">
                    <th scope="row" className="border-b border-slate-800 p-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{label as string}</th>
                    {(values as (string | string[])[]).map((value, index) => <td key={`${label}-${index}`} className="border-b border-slate-800 p-4 leading-6 text-slate-200">{Array.isArray(value) ? <ul className="list-disc space-y-1 pl-4">{value.slice(0, 5).map((item) => <li key={item}>{item}</li>)}</ul> : value}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
