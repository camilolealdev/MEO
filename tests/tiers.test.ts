import { describe, it, expect } from "vitest";
import { hasAccess, TIER_ORDER, TIER_LABELS, type Tier } from "@/lib/tiers";

describe("hasAccess", () => {
  it("permite acceso al mismo tier", () => {
    expect(hasAccess("pro", "pro")).toBe(true);
  });

  it("permite acceso a un tier inferior", () => {
    expect(hasAccess("agency", "pro")).toBe(true);
    expect(hasAccess("agency", "free")).toBe(true);
    expect(hasAccess("pro", "free")).toBe(true);
  });

  it("deniega acceso a un tier superior", () => {
    expect(hasAccess("free", "pro")).toBe(false);
    expect(hasAccess("free", "agency")).toBe(false);
    expect(hasAccess("pro", "agency")).toBe(false);
  });

  it("un usuario free no puede leer contenido de pago", () => {
    const paid: Tier[] = ["pro", "agency"];
    for (const t of paid) expect(hasAccess("free", t)).toBe(false);
  });
});

describe("TIER_ORDER / TIER_LABELS", () => {
  it("mantiene el orden free < pro < agency", () => {
    expect(TIER_ORDER.free).toBeLessThan(TIER_ORDER.pro);
    expect(TIER_ORDER.pro).toBeLessThan(TIER_ORDER.agency);
  });

  it("tiene una etiqueta por tier", () => {
    expect(TIER_LABELS.free).toBe("Explorer");
    expect(TIER_LABELS.pro).toBe("Practitioner");
    expect(TIER_LABELS.agency).toBe("Orchestrator");
  });
});
