import { auth } from "@/lib/auth";
import { getAllPaths } from "@/lib/content";
import Link from "next/link";

export default async function MiRutaPage() {
  await auth();
  const paths = getAllPaths();

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Mis Rutas</h1>
      <p className="text-gray-500 mb-8">Elige la ruta que quieres recorrer.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paths.map(path => (
          <div key={path.slug} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
            <div className={`h-2 w-12 rounded-full bg-gradient-to-r ${path.color} mb-4`} />
            <h3 className="font-display font-bold text-xl text-gray-900 mb-1">{path.name}</h3>
            <p className="text-gray-500 text-sm mb-4">{path.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{path.frameworks.length} frameworks</span>
              <Link href={`/learn/ruta/${path.slug}`} className="text-sm font-semibold text-violet-600 hover:underline">
                Comenzar →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
