import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FwResource {
  title: string;
  url: string;
  desc?: string;
}

interface FwResourcesProps {
  resources: FwResource[];
  className?: string;
}

/** Sección «Recursos» al final del artículo MDX, con acento de la categoría. */
export function FwResources({ resources, className }: FwResourcesProps) {
  if (!resources.length) return null;
  return (
    <section
      className={cn(
        "mt-14 rounded-2xl border fw-acc-border fw-acc-bg p-6",
        className
      )}
      aria-labelledby="fw-recursos-title"
    >
      <h2
        id="fw-recursos-title"
        className="font-display font-bold text-lg text-gray-900 mb-1 flex items-center gap-2"
      >
        <span className="fw-acc-bar-soft w-1.5 h-6 rounded-full" aria-hidden />
        Recursos
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Enlaces de referencia para profundizar en este framework.
      </p>
      <ul className="space-y-3">
        {resources.map((r) => (
          <li key={r.url}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2.5 rounded-xl bg-white/70 border border-white/80 px-4 py-3 transition-colors hover:bg-white hover:border-white"
            >
              <ExternalLink
                className="w-4 h-4 mt-0.5 fw-acc-text shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                aria-hidden
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900 underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current group-hover:text-gray-950">
                  {r.title}
                </span>
                {r.desc && (
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {r.desc}
                  </span>
                )}
                <span className="block text-[11px] text-gray-400 font-mono mt-1 break-all">
                  {r.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
