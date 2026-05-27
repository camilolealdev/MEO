import fs from "fs";
import path from "path";

// The MEO content files are in the parent directory of meo-platform
const SOURCE_DIR = path.resolve(process.cwd(), "..");
const OUTPUT_DIR = path.join(process.cwd(), "content", "frameworks");

const TIER_MAP: Record<number, "free" | "pro" | "agency"> = {};
for (let i = 1; i <= 8; i++) TIER_MAP[i] = "free";
for (let i = 9; i <= 80; i++) TIER_MAP[i] = "pro";
for (let i = 81; i <= 116; i++) TIER_MAP[i] = "agency";

const CATEGORY_MAP: Record<number, string> = {};
for (let i = 1; i <= 8; i++) CATEGORY_MAP[i] = "core-meo";
for (let i = 9; i <= 17; i++) CATEGORY_MAP[i] = "estrategico";
for (let i = 18; i <= 29; i++) CATEGORY_MAP[i] = "emergente";
for (let i = 30; i <= 39; i++) CATEGORY_MAP[i] = "especializado";
for (let i = 40; i <= 45; i++) CATEGORY_MAP[i] = "complementario";
for (let i = 46; i <= 80; i++) CATEGORY_MAP[i] = "clasico";
for (let i = 81; i <= 116; i++) CATEGORY_MAP[i] = "avanzado";

const PATH_MAP: Record<number, string[]> = {
  1: ["seo-total", "agencias", "enterprise"],
  2: ["seo-total"],
  3: ["ia-futuro", "startups"],
  4: ["seo-total", "ecommerce"],
  5: ["ia-futuro", "enterprise"],
  6: ["agencias", "ecommerce", "enterprise"],
  7: ["seo-total", "ecommerce", "agencias"],
  8: ["seo-total", "agencias"],
};

const ESTIMATED_MINUTES: Record<string, number> = {
  "core-meo": 45, "estrategico": 35, "emergente": 40,
  "especializado": 30, "complementario": 25, "clasico": 30, "avanzado": 50,
};

interface FrameworkSection {
  number: number;
  title: string;
  content: string;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function parseFrameworks(text: string): FrameworkSection[] {
  const frameworks: FrameworkSection[] = [];

  // Split on ## #N: headers (the actual pattern used in the file)
  const sections = text.split(/(?=^## #\d+:)/m);

  for (const section of sections) {
    const match = section.match(/^## #(\d+):\s*(.+?)$/m);
    if (!match) continue;

    const num = parseInt(match[1]);
    if (isNaN(num) || num < 1 || num > 116) continue;

    frameworks.push({
      number: num,
      title: match[2].trim().replace(/\*\*/g, ""),
      content: section,
    });
  }

  return frameworks;
}

function createMDX(fw: FrameworkSection): string {
  const cat = CATEGORY_MAP[fw.number] ?? "clasico";
  const tier = TIER_MAP[fw.number] ?? "pro";
  const paths = PATH_MAP[fw.number] ?? [];
  const minutes = ESTIMATED_MINUTES[cat] ?? 30;
  const slug = slugify(fw.title);

  const frontmatter = `---
title: "${fw.title.replace(/"/g, '\\"')}"
number: ${fw.number}
slug: "${slug}"
category: "${cat}"
tier: "${tier}"
estimatedMinutes: ${minutes}
paths: ${JSON.stringify(paths)}
---

`;

  const body = fw.content
    .replace(/^## #\d+:\s*.+$/m, "")
    .trim();

  return frontmatter + body + "\n\n---\n\n## Quiz\n\n> Próximamente: preguntas de comprensión.\n";
}

// Main execution
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Read only the content files (no extensions, not directories, not docs folder)
const sourceEntries = fs.readdirSync(SOURCE_DIR);
const sourceFiles = sourceEntries.filter(f => {
  const fullPath = path.join(SOURCE_DIR, f);
  if (!fs.statSync(fullPath).isFile()) return false;
  if (f.includes(".")) return false; // skip files with extensions
  if (f.toLowerCase().startsWith("docs")) return false;
  return true;
});

console.log(`Found ${sourceFiles.length} source files:`, sourceFiles);

let allFrameworks: FrameworkSection[] = [];

for (const file of sourceFiles) {
  const filePath = path.join(SOURCE_DIR, file);
  const text = fs.readFileSync(filePath, "utf-8");
  const frameworks = parseFrameworks(text);
  console.log(`  ${file}: parsed ${frameworks.length} frameworks`);
  allFrameworks = allFrameworks.concat(frameworks);
}

// Deduplicate — keep first occurrence per number
const seen = new Set<number>();
const unique = allFrameworks.filter(fw => {
  if (seen.has(fw.number)) return false;
  seen.add(fw.number);
  return true;
});

unique.sort((a, b) => a.number - b.number);
console.log(`\nTotal unique frameworks: ${unique.length}`);
console.log("Numbers found:", unique.map(f => f.number).join(", "));

for (const fw of unique) {
  const filename = `${String(fw.number).padStart(3, "0")}-${slugify(fw.title)}.mdx`;
  const mdx = createMDX(fw);
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), mdx);
}

console.log(`\n✓ Written ${unique.length} MDX files to content/frameworks/`);
