import { cn } from "@/lib/utils";
import type { LearningPath } from "@/lib/content";
import { FrameworkCard } from "./FrameworkCard";
import { getAllFrameworks } from "@/lib/content";
import type { Tier } from "@/lib/tiers";

interface PathCardProps {
  path: LearningPath;
  userTier: Tier;
}

export function PathCard({ path, userTier }: PathCardProps) {
  const frameworks = getAllFrameworks().filter((fw) => path.frameworks.includes(fw.slug));

  return (
    <section className="rounded-2xl overflow-hidden border border-gray-200 my-8">
      {/* Header con gradiente */}
      <div
        className={cn(
          "px-6 py-6 text-white relative overflow-hidden",
          path.color
            ? path.color.startsWith("from-")
              ? `bg-gradient-to-r ${path.color}`
              : path.color
            : "bg-gradient-to-r from-violet-600 to-cyan-500"
        )}
      >
        <div className="absolute inset-0 opacity-10" style={{ background: "url(\"data:image/svg+xml,%3Csvg width=\\\"60\\\" height=\\\"60\\\" viewBox=\\\"0 0 60 60\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\"%3E%3Cg fill=\\\"none\\\" fill-rule=\\\"evenodd\\\"%3E%3Cg fill=\\\"%23ffffff\\\" fill-opacity=\\\"0.4\\\"%3E%3Cpath d=\\\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="max-w-4xl mx-auto relative">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">
            Ruta de aprendizaje
          </span>
          <h2 className="font-display font-bold text-2xl mb-2">{path.name}</h2>
          <p className="text-white/80 text-sm max-w-2xl">{path.description}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-white/60">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="8" r="4" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeWidth={2} />
              </svg>
              {path.audience}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" strokeWidth={2} />
              </svg>
              {frameworks.length} frameworks
            </span>
          </div>
        </div>
      </div>

      {/* Grid de frameworks */}
      <div className="px-6 py-6 bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {frameworks.map((fw, idx) => (
            <FrameworkCard
              key={fw.slug}
              framework={fw}
              userTier={userTier}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
