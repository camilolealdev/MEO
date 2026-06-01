import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { progress, pathEnrollments } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getAllFrameworks } from "@/lib/content";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { FrameworkCard } from "@/components/ui/FrameworkCard";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const tier = session?.user?.tier ?? "free";
  const name = session?.user?.name?.split(" ")[0] ?? "estudiante";
  const allFrameworks = getAllFrameworks();
  const recentFrameworks = allFrameworks.slice(0, 4);

  let completedCount = 0;
  let activePathsCount = 0;
  if (userId) {
    const [progressRows, pathRows] = await Promise.all([
      db.query.progress.findMany({ where: eq(progress.userId, userId) }),
      db.query.pathEnrollments.findMany({ where: eq(pathEnrollments.userId, userId) }),
    ]);
    completedCount = progressRows.length;
    activePathsCount = pathRows.filter(p => !p.completedAt).length;
  }

  const pct = allFrameworks.length > 0 ? Math.round((completedCount / allFrameworks.length) * 100) : 0;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Hola, {name} 👋</h1>
      <p className="text-gray-500 mb-8">Continúa donde lo dejaste.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-5">
          <ProgressRing value={pct} size={70} />
          <div>
            <p className="font-display font-bold text-2xl text-gray-900">{completedCount}</p>
            <p className="text-sm text-gray-500">frameworks completados</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <p className="font-display font-bold text-2xl text-gray-900">{activePathsCount}</p>
          <p className="text-sm text-gray-500 mt-1">rutas activas</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <p className="font-display font-bold text-2xl gradient-text capitalize">{tier}</p>
          <p className="text-sm text-gray-500 mt-1">plan actual</p>
          {tier === "free" && (
            <Link href="/precios" className="text-xs text-violet-600 font-medium mt-1 block hover:underline">Upgrade →</Link>
          )}
        </div>
      </div>
      <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Comenzar a aprender</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentFrameworks.map((fw, i) => (
          <FrameworkCard key={fw.slug} framework={fw} userTier={tier} index={i} />
        ))}
      </div>
    </div>
  );
}
