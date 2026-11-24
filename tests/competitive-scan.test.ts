import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());
const casesDir = join(root, "content", "cases");
const scanPath = join(root, "docs", "MEO-competitive-scan-2026.md");

describe("competitive scan and cases", () => {
  it("keeps the competitive scan and at least three cases", () => {
    expect(existsSync(scanPath)).toBe(true);
    expect(readdirSync(casesDir).filter((name) => name.endsWith(".mdx")).length).toBeGreaterThanOrEqual(3);
  });

  it("labels cases without public evidence as examples or hypotheses", () => {
    const files = readdirSync(casesDir).filter((name) => name.endsWith(".mdx"));
    for (const file of files) {
      const content = readFileSync(join(casesDir, file), "utf8");
      expect(content).toMatch(/status:\s*["']ejemplo-hipotesis["']/);
      expect(content).toMatch(/Etiqueta/);
      expect(content).toMatch(/## Fuentes/);
    }
  });

  it("documents every requested competitor with an official source", () => {
    const scan = readFileSync(scanPath, "utf8");
    for (const name of ["Smart Insights", "Kickframe", "Clues", "MarkCMO", "CXL"]) {
      expect(scan).toContain(name);
    }
    for (const url of [
      "https://www.smartinsights.com/",
      "https://kickframetoolbox.com/",
      "https://cluesframeworks.com/",
      "https://markcmo.com/resources",
      "https://cxl.com/institute/",
    ]) {
      expect(scan).toContain(url);
    }
  });
});
