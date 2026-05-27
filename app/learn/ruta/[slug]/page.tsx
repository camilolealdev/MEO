import { auth } from "@/lib/auth";
import { getPathBySlug, getAllPaths, getFrameworkBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import { FrameworkCard } from "@/components/ui/FrameworkCard";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPaths().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = getPathBySlug(slug);
  if (!path) return {};
  return { title: path.name, description: path.description };
}

export default async function PathPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const learningPath = getPathBySlug(slug);
  if (!learningPath) notFound();

  const userTier = ((session?.user as any)?.tier ?? "free") as "free" | "pro" | "agency";
  const frameworks = learningPath.frameworks
    .map(s => getFrameworkBySlug(s))
    .filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-12">
        <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${learningPath.color} mb-4`} />
        <h1 className="font-display font-bold text-5xl text-gray-900 mb-3">{learningPath.name}</h1>
        <p className="text-xl text-gray-500 max-w-xl">{learningPath.description}</p>
        <p className="text-sm text-gray-400 mt-3">Para: {learningPath.audience}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {frameworks.map((fw, i) => fw && (
          <FrameworkCard key={fw.slug} framework={fw} userTier={userTier} index={i} />
        ))}
      </div>
    </div>
  );
}
