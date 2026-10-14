import { auth } from "@/lib/auth";
import { getPathBySlug, getAllPaths } from "@/lib/content";
import { notFound } from "next/navigation";
import { PathCard } from "@/components/ui/PathCard";
import type { Tier } from "@/lib/tiers";
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

  const userTier: Tier = session?.user?.tier ?? "free";

  return (
    <div>
      <PathCard path={learningPath} userTier={userTier} />
    </div>
  );
}
