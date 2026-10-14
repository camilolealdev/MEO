import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { progress } from "@/lib/schema";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return <div className="max-w-4xl mx-auto px-6 py-16"><p className="text-red-500">Acceso denegado</p></div>;
  }

  const [userList, subList, progressCount] = await Promise.all([
    db.query.users.findMany({ orderBy: (u, { desc }) => [desc(u.createdAt)], limit: 50 }),
    db.query.subscriptions.findMany(),
    db.select({ count: progress.id }).from(progress),
  ]);

  const totalUsers = userList.length;
  const activeSubs = subList.filter(s => s.status === "active" || s.status === "trialing").length;
  const totalProgress = progressCount.length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl text-gray-900 mb-8">Panel Admin</h1>
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-display font-bold text-2xl text-gray-900">{totalUsers}</h3>
          <p className="text-gray-500 text-sm mt-1">usuarios registrados</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-display font-bold text-2xl text-gray-900">{activeSubs}</h3>
          <p className="text-gray-500 text-sm mt-1">suscripciones activas</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-display font-bold text-2xl text-gray-900">{totalProgress}</h3>
          <p className="text-gray-500 text-sm mt-1">frameworks completados</p>
        </div>
      </div>

      <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Usuarios ({totalUsers})</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-3 font-medium text-gray-600">Tier</th>
              <th className="px-4 py-3 font-medium text-gray-600">Rol</th>
              <th className="px-4 py-3 font-medium text-gray-600">Creado</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(u => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.name ?? "—"}</td>
                <td className="px-4 py-3"><span className="capitalize text-xs font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">{u.tier}</span></td>
                <td className="px-4 py-3 text-gray-600 capitalize">{u.role}</td>
                <td className="px-4 py-3 text-gray-400">{u.createdAt?.toLocaleDateString() ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
