import { getAllFrameworks } from "@/lib/content";
import { FrameworkCard } from "@/components/ui/FrameworkCard";

export default function CursoPage() {
  const frameworks = getAllFrameworks();

  const grouped = {
    "core-meo": frameworks.filter(f => f.category === "core-meo"),
    "estrategico": frameworks.filter(f => f.category === "estrategico"),
    "emergente": frameworks.filter(f => f.category === "emergente"),
    "especializado": frameworks.filter(f => f.category === "especializado"),
    "complementario": frameworks.filter(f => f.category === "complementario"),
    "clasico": frameworks.filter(f => f.category === "clasico"),
    "avanzado": frameworks.filter(f => f.category === "avanzado"),
  };

  const LABELS: Record<string, string> = {
    "core-meo": "8 Componentes Core MEO",
    "estrategico": "Frameworks Estratégicos",
    "emergente": "Frameworks Emergentes",
    "especializado": "Frameworks Especializados",
    "complementario": "Disciplinas Complementarias",
    "clasico": "Frameworks Clásicos",
    "avanzado": "Frameworks Avanzados",
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h1 className="font-display font-bold text-5xl text-gray-900 mb-4">
          Los <span className="gradient-text">120 frameworks</span> MEO
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto">
          El catálogo completo del sistema Marketing Engine Optimization.
        </p>
      </div>
      {Object.entries(grouped).map(([cat, fws]) => fws.length > 0 && (
        <section key={cat} className="mb-16">
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">{LABELS[cat]}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fws.map((fw, i) => (
              <FrameworkCard key={fw.slug} framework={fw} userTier="free" index={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
