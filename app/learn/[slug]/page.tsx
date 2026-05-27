import { auth } from "@/lib/auth";
import { getFrameworkBySlug, getAllFrameworks } from "@/lib/content";
import { notFound } from "next/navigation";
import { TierGate } from "@/components/ui/TierGate";
import { MarkCompleteButton } from "@/components/ui/MarkCompleteButton";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Clock, Hash } from "lucide-react";
import type { Metadata } from "next";

const TIER_ORDER = { free: 0, pro: 1, agency: 2 } as const;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllFrameworks().map(fw => ({ slug: fw.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fw = getFrameworkBySlug(slug);
  if (!fw) return {};
  return {
    title: fw.title,
    description: `Aprende ${fw.title} — framework #${fw.number} del sistema MEO.`,
  };
}

export default async function FrameworkPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const fw = getFrameworkBySlug(slug);
  if (!fw) notFound();

  const userTier = ((session?.user as any)?.tier ?? "free") as "free" | "pro" | "agency";
  const isLocked = TIER_ORDER[userTier] < TIER_ORDER[fw.tier as keyof typeof TIER_ORDER];

  return (
    <div className="min-h-screen">
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5" />{fw.number}
            </span>
            <h1 className="font-display font-bold text-lg text-gray-900 truncate">{fw.title}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />{fw.estimatedMinutes} min
            </span>
            {session && !isLocked && <MarkCompleteButton slug={fw.slug} />}
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {isLocked ? (
          <TierGate requiredTier={fw.tier as "pro" | "agency"}>
            <div className="prose prose-lg max-w-none h-64 overflow-hidden">
              <p>{fw.content.substring(0, 500)}...</p>
            </div>
          </TierGate>
        ) : (
          <article className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-violet-600">
            <MDXRemote source={fw.content} />
          </article>
        )}
      </div>
    </div>
  );
}
