import { getFrameworkTemplate } from "@/lib/framework-tools";

export const dynamic = "force-static";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const result = getFrameworkTemplate(slug);

  if (!result) {
    return new Response("Framework no encontrado", { status: 404 });
  }

  return new Response(result.markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.framework.slug}-template.md"`,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
