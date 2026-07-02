import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { progress } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getAllFrameworks } from "@/lib/content";
import { ProgressRing } from "@/components/ui/ProgressRing";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function ProgresoPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const allFrameworks = getAllFrameworks();
  const bySlug = new Map(allFrameworks.map((fw) => [fw.slug, fw]));

  const rows = userId
    ? await db.query.progress.findMany({ where: eq(progress.userId, userId) })
    : [];

  const completed = rows
    .map((r) => ({ row: r, fw: bySlug.get(r.frameworkSlug) }))
    .sort((a, b) => b.row.completedAt.getTime() - a.row.completedAt.getTime());

  const pct =
    allFrameworks.length > 0 ? Math.round((rows.length / allFrameworks.length) * 100) : 0;
  const totalMinutes = Math.round(
    rows.reduce((acc, r) => acc + (r.timeSpentSeconds ?? 0), 0) / 60
  );

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Mi Progreso</h1>
      <p className="text-gray-500 mb-8">Tu avance a través de los frameworks MEO.</p>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <p className="text-6xl mb-4" aria-hidden>
            📊
          </p>
          <p className="font-display font-bold text-xl text-gray-900 mb-2">Sin actividad aún</p>
          <p className="text-gray-500 text-sm mb-6">
            Completa tu primer framework para ver estadísticas aquí.
          </p>
          <Link
            href="/aprender"
            className="inline-block px-5 py-2.5 rounded-lg bg-gradient-meo text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Explorar frameworks →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-5">
              <ProgressRing value={pct} size={70} />
              <div>
                <p className="font-display font-bold text-2xl text-gray-900">{rows.length}</p>
                <p className="text-sm text-gray-500">de {allFrameworks.length} completados</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="font-display font-bold text-2xl text-gray-900">{pct}%</p>
              <p className="text-sm text-gray-500 mt-1">del sistema MEO</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="font-display font-bold text-2xl text-gray-900">{totalMinutes}</p>
              <p className="text-sm text-gray-500 mt-1">minutos de estudio</p>
            </div>
          </div>

          <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Historial</h2>
          <ul className="space-y-2">
            {completed.map(({ row, fw }) => (
              <li
                key={row.id}
                className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle className="w-5 h-5 text-lime-500 shrink-0" aria-hidden />
                  <span className="font-medium text-gray-900 truncate">
                    {fw?.title ?? row.frameworkSlug}
                  </span>
                </div>
                <time className="text-sm text-gray-400 shrink-0" dateTime={row.completedAt.toISOString()}>
                  {row.completedAt.toLocaleDateString("es-CO")}
                </time>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
