import { auth } from "@/lib/auth";

export default async function ProgresoPage() {
  await auth();
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Mi Progreso</h1>
      <p className="text-gray-500 mb-8">Aquí verás tu avance cuando empieces a completar frameworks.</p>
      <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
        <p className="text-6xl mb-4">📊</p>
        <p className="font-display font-bold text-xl text-gray-900 mb-2">Sin actividad aún</p>
        <p className="text-gray-500 text-sm">Completa tu primer framework para ver estadísticas aquí.</p>
      </div>
    </div>
  );
}
