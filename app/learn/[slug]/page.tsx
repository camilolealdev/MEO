import { auth } from "@/lib/auth";
import { getFrameworkBySlug, getAllFrameworks } from "@/lib/content";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkCompleteButton } from "@/components/ui/MarkCompleteButton";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Clock, Hash, Lock } from "lucide-react";
import { hasAccess, TIER_LABELS, type Tier } from "@/lib/tiers";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

// Solo se prerenderiza el contenido gratuito. Los frameworks de pago se
// renderizan de forma dinámica para que el gate de tier se evalúe por request
// y su HTML no quede cacheado como estático accesible sin autorización.
export async function generateStaticParams() {
  return getAllFrameworks()
    .filter(fw => fw.tier === "free")
    .map(fw => ({ slug: fw.slug }));
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

  // Autorización por tier — server-side. Nunca se emite el contenido de pago
  // a un usuario sin acceso; el gate del cliente (FrameworkCard) es solo UX.
  const userTier: Tier = session?.user?.tier ?? "free";
  const canRead = hasAccess(userTier, fw.tier as Tier);

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
            {session && canRead && <MarkCompleteButton slug={fw.slug} />}
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {canRead ? (
          <article className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-violet-600">
            <MDXRemote source={fw.content} />
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-violet-300 bg-violet-50/40">
            <Lock className="w-10 h-10 text-violet-500 mb-4" />
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
              Contenido {TIER_LABELS[fw.tier as Tier]}
            </h2>
            <p className="text-gray-600 max-w-md mb-6">
              Este framework requiere el plan <strong>{TIER_LABELS[fw.tier as Tier]}</strong>.
              {session ? " Mejora tu plan para desbloquearlo." : " Inicia sesión y elige un plan para acceder."}
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/precios"
                className="px-5 py-2.5 rounded-lg bg-gradient-meo text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Ver planes →
              </Link>
              {!session && (
                <Link
                  href={`/login?callbackUrl=/learn/${fw.slug}`}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
