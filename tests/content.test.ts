import { describe, it, expect } from "vitest";
import {
  getAllFrameworks,
  getFrameworkBySlug,
  getAllPaths,
  getPathBySlug,
} from "@/lib/content";

const VALID_TIERS = new Set(["free", "pro", "agency"]);

describe("getAllFrameworks", () => {
  const frameworks = getAllFrameworks();

  it("devuelve un array no vacío (117 frameworks)", () => {
    expect(Array.isArray(frameworks)).toBe(true);
    expect(frameworks.length).toBeGreaterThan(0);
    // El contenido actual del repo son 117 frameworks MDX.
    expect(frameworks.length).toBe(117);
  });

  it("está ordenado por 'number' ascendente", () => {
    for (let i = 1; i < frameworks.length; i++) {
      expect(frameworks[i].number).toBeGreaterThanOrEqual(frameworks[i - 1].number);
    }
  });

  it("cada framework tiene tier válido, slug y title no vacíos", () => {
    for (const fw of frameworks) {
      expect(VALID_TIERS.has(fw.tier)).toBe(true);
      expect(typeof fw.slug).toBe("string");
      expect(fw.slug.length).toBeGreaterThan(0);
      expect(typeof fw.title).toBe("string");
      expect(fw.title.length).toBeGreaterThan(0);
    }
  });

  it("los slug son únicos (sin colisiones)", () => {
    const slugs = frameworks.map((fw) => fw.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("los number son únicos", () => {
    const numbers = frameworks.map((fw) => fw.number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});

describe("getFrameworkBySlug", () => {
  it("devuelve un framework con content no vacío para un slug existente (primer free)", () => {
    const firstFree = getAllFrameworks().find((fw) => fw.tier === "free");
    expect(firstFree).toBeDefined();

    const full = getFrameworkBySlug(firstFree!.slug);
    expect(full).not.toBeNull();
    expect(full!.slug).toBe(firstFree!.slug);
    expect(typeof full!.content).toBe("string");
    expect(full!.content.length).toBeGreaterThan(0);
  });

  it("devuelve null para un slug inexistente", () => {
    expect(getFrameworkBySlug("__no-existe__")).toBeNull();
  });
});

describe("getAllPaths / getPathBySlug", () => {
  const paths = getAllPaths();

  it("devuelve rutas (6 en el contenido actual)", () => {
    expect(Array.isArray(paths)).toBe(true);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.length).toBe(6);
  });

  it("cada ruta tiene slug (string no vacío) y frameworks (array)", () => {
    for (const p of paths) {
      expect(typeof p.slug).toBe("string");
      expect(p.slug.length).toBeGreaterThan(0);
      expect(Array.isArray(p.frameworks)).toBe(true);
    }
  });

  it("getPathBySlug coincide con una ruta existente", () => {
    const first = paths[0];
    const found = getPathBySlug(first.slug);
    expect(found).not.toBeNull();
    expect(found!.slug).toBe(first.slug);
    expect(found!.name).toBe(first.name);
  });

  it("getPathBySlug devuelve null para una ruta inexistente", () => {
    expect(getPathBySlug("__no-existe__")).toBeNull();
  });
});

describe("coherencia referencial paths -> frameworks", () => {
  it("los slugs listados en path.frameworks existen entre los frameworks", () => {
    const frameworkSlugs = new Set(getAllFrameworks().map((fw) => fw.slug));
    const paths = getAllPaths();

    let total = 0;
    const missing: string[] = [];
    for (const p of paths) {
      for (const slug of p.frameworks) {
        total++;
        if (!frameworkSlugs.has(slug)) missing.push(`${p.slug}/${slug}`);
      }
    }

    expect(total).toBeGreaterThan(0);

    // Realidad del contenido actual: las 108 referencias resuelven al 100%.
    // Se mantiene un umbral tolerante (>=80%) por si en el futuro se añaden
    // frameworks aún no publicados a una ruta; hoy la lista de faltantes está
    // vacía y así lo afirmamos explícitamente.
    const resolvedRatio = (total - missing.length) / total;
    expect(resolvedRatio).toBeGreaterThanOrEqual(0.8);
    expect(missing).toEqual([]);
  });
});
