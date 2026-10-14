import { getAllFrameworks, getAllPaths } from "@/lib/content";
import { PathsShowcase } from "@/components/marketing/PathsShowcase";
import { FrameworkCard } from "@/components/ui/FrameworkCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programa MEO",
  description: "Vista publica del programa completo MEO con rutas y catalogo de frameworks.",
};

export default function ProgramaPage() {
  const frameworks = getAllFrameworks();
  const paths = getAllPaths();

  const grouped = {
    "core-meo": frameworks.filter((f) => f.category === "core-meo"),
    estrategico: frameworks.filter((f) => f.category === "estrategico"),
    emergente: frameworks.filter((f) => f.category === "emergente"),
    especializado: frameworks.filter((f) => f.category === "especializado"),
    complementario: frameworks.filter((f) => f.category === "complementario"),
    clasico: frameworks.filter((f) => f.category === "clasico"),
    avanzado: frameworks.filter((f) => f.category === "avanzado"),
  };

  const labels: Record<string, string> = {
    "core-meo": "8 Componentes Core MEO",
    estrategico: "Frameworks Estrategicos",
    emergente: "Frameworks Emergentes",
    especializado: "Frameworks Especializados",
    complementario: "Disciplinas Complementarias",
    clasico: "Frameworks Clasicos",
    avanzado: "Frameworks Avanzados",
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <section className="text-center mb-16">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600 mb-4">
          Vista Publica
        </p>
        <h1 className="font-display font-bold text-5xl text-gray-900 mb-4">
          Todo el <span className="gradient-text">programa MEO</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          Comparte esta pagina para ver la estructura completa del programa sin iniciar sesion:
          rutas, niveles y los 120 frameworks del sistema.
        </p>
      </section>

      <section className="bg-gray-50 rounded-3xl px-8 py-10 mb-20 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-gray-900 mb-3">
            6 rutas guiadas
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Cada ruta organiza el programa por perfil, industria o nivel de madurez.
          </p>
        </div>
        <PathsShowcase paths={paths} />
      </section>

      <section className="mb-10">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl text-gray-900 mb-3">
            Catalogo completo de frameworks
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            El contenido premium sigue bloqueado sin acceso, pero aqui se ve todo el programa y su estructura.
          </p>
        </div>
      </section>

      {Object.entries(grouped).map(([category, items]) =>
        items.length > 0 ? (
          <section key={category} className="mb-16">
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">
              {labels[category]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((fw, index) => (
                <FrameworkCard key={fw.slug} framework={fw} userTier="free" index={index} />
              ))}
            </div>
          </section>
        ) : null
      )}
    </div>
  );
}
