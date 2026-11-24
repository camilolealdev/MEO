import { describe, expect, it } from "vitest";
import { buildDiagnosticCatalog } from "@/lib/diagnostic";
import { getAllFrameworks } from "@/lib/content";

describe("diagnostic catalog", () => {
  it("usa el catálogo real y conserva sus metadatos de evidencia", () => {
    const frameworks = getAllFrameworks();
    const catalog = buildDiagnosticCatalog(frameworks);

    expect(catalog).toHaveLength(frameworks.length);
    expect(catalog.map((item) => item.slug)).toEqual(frameworks.map((item) => item.slug));
    expect(catalog.every((item) => item.reason.length > 0)).toBe(true);
    expect(catalog.every((item) => ["Alta", "Media", "Baja"].includes(item.evidence))).toBe(true);
  });

  it("usa una señal específica cuando el framework tiene reglas de recomendación", () => {
    const catalog = buildDiagnosticCatalog(getAllFrameworks());
    const seo = catalog.find((item) => item.slug === "seo-search-engine-optimization");

    expect(seo?.tags).toEqual(expect.arrayContaining(["visibility", "organic"]));
    expect(seo?.reason).toContain("demanda concreta");
  });
});
