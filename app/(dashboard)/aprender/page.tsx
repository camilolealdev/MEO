import { auth } from "@/lib/auth";
import { getAllFrameworks } from "@/lib/content";
import { FrameworkCard } from "@/components/ui/FrameworkCard";

export default async function AprenderPage() {
  const session = await auth();
  const tier = session?.user.tier ?? "free";
  const all = getAllFrameworks();

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Explorar Frameworks</h1>
      <p className="text-gray-500 mb-8">Los 120 frameworks del sistema MEO.</p>

      <div className="space-y-10">
        <div>
          <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Todos los frameworks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {all.map((fw, i) => (
              <FrameworkCard key={fw.slug} framework={fw} userTier={tier} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
