import { describe, expect, it } from "vitest";
import { getFrameworkBySlug } from "@/lib/content";
import { buildFrameworkTemplate, getFrameworkTemplate } from "@/lib/framework-tools";

describe("framework tools", () => {
  it("deriva evidencia sin inventar una fecha de actualización", () => {
    const framework = getFrameworkBySlug("seo-search-engine-optimization");
    expect(framework).not.toBeNull();
    expect(["high", "medium", "low"]).toContain(framework!.evidenceLevel);
    expect(framework!.sourceCount).toBeGreaterThan(0);
    expect(framework!.lastUpdated).toBeNull();
  });

  it("genera una plantilla Markdown con contexto y campos operativos", () => {
    const framework = getFrameworkBySlug("seo-search-engine-optimization");
    const markdown = buildFrameworkTemplate(framework!);

    expect(markdown).toContain('frameworkSlug: "seo-search-engine-optimization"');
    expect(markdown).toContain("## Diagnóstico y línea base");
    expect(markdown).toContain("## Límites y riesgos");
    expect(markdown).toContain("Google Search Central");
  });

  it("resuelve plantillas solo para frameworks existentes", () => {
    expect(getFrameworkTemplate("seo-search-engine-optimization")).not.toBeNull();
    expect(getFrameworkTemplate("__no-existe__")).toBeNull();
  });
});
