import { auth } from "@/lib/auth";
import { getFrameworkBySlug, getAllFrameworks } from "@/lib/content";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkCompleteButton } from "@/components/ui/MarkCompleteButton";
import { FwCallout } from "@/components/ui/FwCallout";
import { FwTable } from "@/components/ui/FwTable";
import { FwStatBlock } from "@/components/ui/FwStatBlock";
import { FwCodeBlock } from "@/components/ui/FwCodeBlock";
import { FwSectionHeader } from "@/components/ui/FwSectionHeader";
import { FwDefinitionList } from "@/components/ui/FwDefinitionList";
import { FwResources } from "@/components/ui/FwResources";
import { getAccent, accentVars } from "@/lib/fw-theme";
import type { CSSProperties } from "react";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { Clock, Hash, Lock } from "lucide-react";
import { hasAccess, TIER_LABELS, type Tier } from "@/lib/tiers";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

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

const mdxComponents = {
  // Markdown -> componente (next-mdx-remote hace lookup lowercase)
  p: (props: React.ComponentPropsWithoutRef<"p">) => (
    <p {...props} className="mb-4 last:mb-0 text-[17px] leading-relaxed text-gray-700" />
  ),
  h1: (props: React.ComponentPropsWithoutRef<"h1">) => (
    <h1
      {...props}
      className="text-3xl font-display font-bold text-gray-900 mt-4 mb-5 tracking-tight"
    />
  ),
  h2: FwSectionHeader,
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className="text-lg font-display font-bold text-gray-900 mt-8 mb-3 pl-3 border-l-[3px] fw-acc-bar"
    />
  ),
  h4: (props: React.ComponentPropsWithoutRef<"h4">) => (
    <h4 {...props} className="text-base font-display font-bold text-gray-800 mt-6 mb-2" />
  ),
  a: (props: React.ComponentPropsWithoutRef<"a">) => (
    <a
      {...props}
      className="fw-acc-text underline underline-offset-4 hover:decoration-current transition-colors"
    />
  ),
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className="list-disc pl-5 mb-4 space-y-1.5" />
  ),
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
    <ol {...props} className="list-decimal pl-5 mb-4 space-y-1.5 marker:font-semibold" />
  ),
  li: (props: React.ComponentPropsWithoutRef<"li">) => (
    <li {...props} className="text-[17px] leading-relaxed text-gray-700 pl-1" />
  ),
  strong: (props: React.ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className="font-semibold text-gray-900" />
  ),
  em: (props: React.ComponentPropsWithoutRef<"em">) => (
    <em {...props} className="text-gray-700 italic" />
  ),
  code: (props: React.ComponentPropsWithoutRef<"code">) => (
    <code {...props} className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-violet-700" />
  ),
  blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="my-6 pl-5 py-1 border-l-[3px] fw-acc-bar italic text-gray-600 [&>p:last-child]:mb-0"
    />
  ),
  hr: () => <hr className="my-10 h-px bg-gray-200 border-0" />,
  // Componentes custom del MDX
  callout: FwCallout,
  table: FwTable,
  statblock: FwStatBlock,
  codeblock: FwCodeBlock,
  sectionheader: FwSectionHeader,
  subheader: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 {...props} className="text-base font-display font-bold text-gray-800 mt-6 mb-2" />
  ),
  deffinitionlist: FwDefinitionList,
  // Alias mayúsculas que el MDX podría generar
  Table: FwTable,
  CodeBlock: FwCodeBlock,
  Callout: FwCallout,
  SectionHeader: FwSectionHeader,
  SubHeader: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 {...props} className="text-base font-display font-bold text-gray-800 mt-6 mb-2" />
  ),
};

export default async function FrameworkPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const fw = getFrameworkBySlug(slug);
  if (!fw) notFound();

  const userTier: Tier = session?.user?.tier ?? "free";
  const canRead = hasAccess(userTier, fw.tier as Tier);
  const accent = getAccent(fw.category);

  return (
    <div className="min-h-screen bg-gray-50/70">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="fw-acc-bg fw-acc-text text-sm font-mono px-2 py-0.5 rounded-md">
              <Hash className="w-3.5 h-3.5 inline mr-1" />{fw.number}
            </span>
            <h1 className="font-display font-bold text-base text-gray-900 leading-tight">
              {fw.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {fw.estimatedMinutes} min
            </span>
            {session && canRead && <MarkCompleteButton slug={fw.slug} />}
          </div>
        </div>
      </div>

      {/* Container tipográfico */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {canRead ? (
          <article
            className="prose prose-base max-w-prose fw-body"
            style={accentVars(accent) as CSSProperties}
          >
            <div className="mb-8 flex flex-wrap items-center gap-3 text-xs text-gray-600 rounded-xl px-4 py-3 border fw-acc-border fw-acc-bg">
              <span className="flex items-center gap-1.5">
                <span className="font-mono fw-acc-text">#{String(fw.number).padStart(2, "0")}</span>
                <span className="text-gray-600">{fw.title}</span>
              </span>
              <span className="w-px h-4 bg-gray-200" />
              <span className="capitalize">{fw.category.replace(/-/g, " ")}</span>
              <span className="w-px h-4 bg-gray-200" />
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />{fw.estimatedMinutes} min lectura
              </span>
            </div>
            <MDXRemote
              source={fw.content}
              components={mdxComponents}
            />
            <FwResources resources={fw.resources} />
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl bg-violet-50/50 border border-violet-100">
            <Lock className="w-12 h-12 text-violet-500 mb-4" />
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
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
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
