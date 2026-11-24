'use client';

import { useMemo, useState } from 'react';
import type { DiagnosticFramework } from '@/lib/diagnostic';

type Choice = { value: string; label: string; hint?: string };


const choices = {
  objective: [
    { value: 'visibility', label: 'Ganar visibilidad y demanda' },
    { value: 'conversion', label: 'Mejorar conversión y experiencia' },
    { value: 'retention', label: 'Retener y desarrollar clientes' },
    { value: 'growth', label: 'Escalar crecimiento y operaciones' },
  ],
  stage: [
    { value: 'explore', label: 'Exploración', hint: 'Aún estoy definiendo el problema.' },
    { value: 'plan', label: 'Planificación', hint: 'Tengo una dirección y necesito priorizar.' },
    { value: 'execute', label: 'Ejecución', hint: 'Ya estoy activando canales y campañas.' },
    { value: 'optimize', label: 'Optimización', hint: 'Tengo datos y quiero mejorar resultados.' },
  ],
  channel: [
    { value: 'organic', label: 'Búsqueda y contenido' },
    { value: 'paid', label: 'Publicidad y adquisición pagada' },
    { value: 'product', label: 'Producto, web o experiencia digital' },
    { value: 'relationship', label: 'CRM, comunidad o clientes' },
  ],
  problem: [
    { value: 'clarity', label: 'No sé por dónde empezar' },
    { value: 'measurement', label: 'No puedo medir qué funciona' },
    { value: 'audience', label: 'No entiendo bien a mi audiencia' },
    { value: 'coordination', label: 'Los equipos o canales no están alineados' },
  ],
} satisfies Record<string, Choice[]>;

function recommendations(values: Record<string, string>, frameworkCatalog: DiagnosticFramework[]): DiagnosticFramework[] {
  const ranked = frameworkCatalog.map((framework, index) => {
    let score = 0;
    if (framework.tags.includes(values.objective)) score += 5;
    if (framework.tags.includes(values.stage)) score += 3;
    if (framework.tags.includes(values.channel)) score += 2;
    if (framework.tags.includes(values.problem)) score += 4;
    if (values.problem === 'measurement' && framework.evidence === 'Alta') score += 1;
    return { framework, score, index };
  });

  return ranked
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 4)
    .map(({ framework }) => framework);
}

function Question({ id, legend, options, value, onChange }: { id: string; legend: string; options: Choice[]; value: string; onChange: (value: string) => void }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-slate-950">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;
          return (
            <label key={option.value} htmlFor={optionId} className={`cursor-pointer rounded-xl border p-4 transition focus-within:ring-2 focus-within:ring-sky-600 ${value === option.value ? 'border-sky-700 bg-sky-50' : 'border-slate-300 bg-white hover:border-slate-500'}`}>
              <span className="flex items-start gap-3">
                <input id={optionId} name={id} type="radio" value={option.value} checked={value === option.value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-4 w-4 accent-sky-700" />
                <span>
                  <span className="block font-medium text-slate-950">{option.label}</span>
                  {option.hint && <span className="mt-1 block text-sm text-slate-700">{option.hint}</span>}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function DiagnosticWizard({ frameworks }: { frameworks: DiagnosticFramework[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const complete = Object.keys(choices).every((key) => values[key]);
  const result = useMemo(() => (complete ? recommendations(values, frameworks) : []), [complete, frameworks, values]);

  const setValue = (key: string, value: string) => {
    setSubmitted(false);
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-slate-900 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-800">MEO · diagnóstico</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Encuentra tu ruta de frameworks</h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">Responde cuatro preguntas y recibe una ruta corta, explicada y accionable. El resultado es una recomendación orientativa, no una garantía de rendimiento.</p>
      </header>

      <form className="mt-10 space-y-9" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
        <Question id="objective" legend="¿Cuál es tu objetivo principal?" options={choices.objective} value={values.objective ?? ''} onChange={(value) => setValue('objective', value)} />
        <Question id="stage" legend="¿En qué etapa estás?" options={choices.stage} value={values.stage ?? ''} onChange={(value) => setValue('stage', value)} />
        <Question id="channel" legend="¿Dónde ocurre principalmente el trabajo?" options={choices.channel} value={values.channel ?? ''} onChange={(value) => setValue('channel', value)} />
        <Question id="problem" legend="¿Qué problema quieres resolver primero?" options={choices.problem} value={values.problem ?? ''} onChange={(value) => setValue('problem', value)} />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={!complete} className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400">Generar mi ruta</button>
          {!complete && <p className="text-sm text-slate-700" role="status">Completa las cuatro preguntas para continuar.</p>}
        </div>
      </form>

      {submitted && result.length > 0 && (
        <section aria-labelledby="results-title" aria-live="polite" className="mt-14 border-t border-slate-300 pt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-800">Ruta recomendada</p>
          <h2 id="results-title" className="mt-2 text-3xl font-bold text-slate-950">Empieza por estos {result.length} frameworks</h2>
          <p className="mt-3 max-w-2xl text-slate-700">El orden prioriza ajuste al contexto, problema y etapa. Puedes trabajar de arriba abajo y revisar los límites antes de decidir.</p>
          <ol className="mt-7 grid gap-4 md:grid-cols-2">
            {result.map((framework, index) => (
              <li key={framework.slug} className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-900" aria-label={`Recomendación ${index + 1}`}>{index + 1}</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">Evidencia {framework.evidence}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-950"><a className="underline decoration-sky-700 underline-offset-4 hover:text-sky-800 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700" href={`/frameworks/${framework.slug}`}>{framework.title}</a></h3>
                <p className="mt-2 leading-7 text-slate-700">{framework.reason}</p>
                <p className="mt-4 text-sm text-slate-600">Revisado: {framework.updatedAt}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
