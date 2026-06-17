import { Hero } from "@/components/marketing/Hero";
import { getAllFrameworks, getAllPaths } from "@/lib/content";
import { FrameworkCard } from "@/components/ui/FrameworkCard";
import { PathsShowcase } from "@/components/marketing/PathsShowcase";

export default function HomePage() {
  const frameworks = getAllFrameworks().slice(0, 8);
  const paths = getAllPaths();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "MEO — Marketing Engine Optimization",
    description: "Sistema completo de 117 frameworks de marketing digital integrado con IA.",
    provider: { "@type": "Organization", name: "MEO", url: "https://meo.com" },
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Explorer" },
      { "@type": "Offer", price: "29", priceCurrency: "USD", name: "Practitioner" },
      { "@type": "Offer", price: "79", priceCurrency: "USD", name: "Orchestrator" },
    ],
  };

  return (
    <>
      {/* Safe: jsonLd is 100% static server data, never user-supplied */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl text-gray-900 mb-3">
            Los 8 componentes <span className="gradient-text">core MEO</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            El sistema parte de 8 disciplinas fundamentales. Gratuitos para todos.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {frameworks.map((fw, i) => (
            <FrameworkCard key={fw.slug} framework={fw} userTier="free" index={i} />
          ))}
        </div>
      </section>
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl text-gray-900 mb-3">
              6 rutas para <span className="gradient-text">tu perfil</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Cada ruta combina los frameworks más relevantes para tu industria.
            </p>
          </div>
          <PathsShowcase paths={paths} />
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display font-bold text-4xl text-gray-900 mb-16">
          El sistema más <span className="gradient-text">completo</span> del mundo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "117", label: "Frameworks integrados" },
            { value: "981+", label: "Páginas de contenido" },
            { value: "6", label: "Rutas guiadas" },
            { value: "+250%", label: "ROI promedio 12 meses" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-5xl gradient-text mb-2">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
