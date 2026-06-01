import fs from "fs";
import path from "path";

const SOURCE_DIR = path.resolve(process.cwd(), "..");
const OUTPUT_DIR = path.join(process.cwd(), "content", "frameworks");
const PATHS_DIR = path.join(process.cwd(), "content", "paths");
const CANONICAL_SOURCE = "116-FRAMEWORKS-DEFINICIONES";

type Tier = "free" | "pro" | "agency";

interface Framework {
  number: number;
  title: string;
  slug: string;
  category: string;
  tier: Tier;
  estimatedMinutes: number;
  definition: string;
  paths: string[];
}

interface SourceSection {
  number: number;
  title: string;
  content: string;
  sourceFile: string;
}

interface SourceText {
  fileName: string;
  text: string;
}

interface LearningPathDefinition {
  slug: string;
  name: string;
  description: string;
  audience: string;
  color: string;
  numbers: number[];
}

const TIER_MAP: Record<number, Tier> = {};
for (let i = 1; i <= 8; i += 1) TIER_MAP[i] = "free";
for (let i = 9; i <= 80; i += 1) TIER_MAP[i] = "pro";
for (let i = 81; i <= 116; i += 1) TIER_MAP[i] = "agency";

const CATEGORY_MAP: Record<number, string> = {};
for (let i = 1; i <= 8; i += 1) CATEGORY_MAP[i] = "core-meo";
for (let i = 9; i <= 17; i += 1) CATEGORY_MAP[i] = "estrategico";
for (let i = 18; i <= 29; i += 1) CATEGORY_MAP[i] = "emergente";
for (let i = 30; i <= 39; i += 1) CATEGORY_MAP[i] = "especializado";
for (let i = 40; i <= 45; i += 1) CATEGORY_MAP[i] = "complementario";
for (let i = 46; i <= 80; i += 1) CATEGORY_MAP[i] = "clasico";
for (let i = 81; i <= 116; i += 1) CATEGORY_MAP[i] = "avanzado";

const ESTIMATED_MINUTES: Record<string, number> = {
  "core-meo": 45,
  estrategico: 35,
  emergente: 40,
  especializado: 30,
  complementario: 25,
  clasico: 30,
  avanzado: 50,
};

const LEARNING_PATHS: LearningPathDefinition[] = [
  {
    slug: "seo-total",
    name: "Ruta SEO Total",
    description:
      "Domina los frameworks de posicionamiento organico, busqueda generativa, experiencia post-SERP y visibilidad en motores tradicionales, alternativos y de IA.",
    audience: "Profesionales SEO, content strategists, equipos de growth",
    color: "from-violet-600 to-cyan-500",
    numbers: [1, 2, 4, 5, 7, 8, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
  },
  {
    slug: "agencias",
    name: "Ruta Agencias",
    description:
      "Frameworks para vender, entregar y escalar MEO como servicio: estrategia, campanas, reporting, clientes, posicionamiento y orquestacion multicanal.",
    audience: "Agencias de marketing, consultores digitales, equipos client-facing",
    color: "from-cyan-500 to-lime-400",
    numbers: [1, 6, 8, 10, 12, 13, 15, 24, 32, 37, 43, 44, 45, 48, 55, 66, 71, 76, 93, 94, 97, 110],
  },
  {
    slug: "ecommerce",
    name: "Ruta Ecommerce",
    description:
      "Sistema para tiendas online: adquisicion, experiencia, conversion, retencion, personalizacion y decisiones de compra.",
    audience: "Ecommerce managers, founders DTC, equipos retail",
    color: "from-lime-400 to-violet-600",
    numbers: [1, 4, 6, 7, 8, 14, 24, 34, 49, 50, 52, 53, 57, 60, 63, 64],
  },
  {
    slug: "startups",
    name: "Ruta Startups",
    description:
      "Frameworks de validacion, traccion y crecimiento para encontrar posicionamiento, medir la metrica clave y escalar loops.",
    audience: "Founders, equipos growth, producto y marketing temprano",
    color: "from-violet-600 to-lime-400",
    numbers: [3, 5, 14, 16, 17, 30, 31, 32, 33, 34, 38, 39, 74, 115],
  },
  {
    slug: "enterprise",
    name: "Ruta Enterprise",
    description:
      "Arquitectura MEO para organizaciones grandes: datos, medicion, gobernanza, operaciones, automatizacion y protocolos adaptativos.",
    audience: "CMOs, marketing ops, enterprise teams",
    color: "from-gray-900 to-violet-600",
    numbers: [10, 12, 43, 44, 45, 56, 77, 78, 79, 80, 81, 83, 84, 85, 86, 112, 113, 114, 115, 116],
  },
  {
    slug: "ia-futuro",
    name: "Ruta IA & Futuro",
    description:
      "Frameworks para search generativo, IA aplicada, modelos predictivos, personalizacion, automatizacion y arquitectura future-proof.",
    audience: "Early adopters, equipos IA, innovators",
    color: "from-cyan-500 to-violet-600",
    numbers: [3, 5, 20, 21, 22, 23, 28, 58, 61, 64, 115, 116],
  },
];

const MANUAL_ALIASES = new Map<string, number>([
  ["visual ar seo", 22],
  ["visual seo ar vr optimization", 22],
  ["vso", 23],
  ["alternative search", 29],
  ["orchestration channel synchronization", 113],
  ["data unification advanced attribution", 114],
  ["automation de decisiones impulsada por ia", 115],
  ["automacion de decisiones impulsada por ia", 115],
  ["ai ux seo", 112],
]);

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function comparable(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/\+/g, " ")
    .replace(/\//g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(avanzado|advanced|framework|model|strategy|optimization|optimizacion|the|and|de|la|el|y)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleTokens(input: string): Set<string> {
  return new Set(comparable(input).split(" ").filter(token => token.length > 1));
}

function cleanTitle(rawTitle: string): string {
  return rawTitle
    .replace(/^#\d+:\s*/i, "")
    .replace(/^FRAMEWORK\s+#\d+:\s*/i, "")
    .replace(/^\d+(?:\.\d+)?\.\s*/i, "")
    .replace(/\s*\(Framework\s+#\d+\)\s*/i, "")
    .replace(/\s+AVANZADO\s+2025$/i, "")
    .replace(/\s+ADVANCED\s+2025$/i, "")
    .trim();
}

function escapeMdxText(content: string): string {
  return content.replace(/</g, "&lt;");
}

function cleanBody(content: string): string {
  return escapeMdxText(
    content
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\n\[Contin[^\]]+\]\n/gi, "\n")
      .replace(/\n\*\[Debido[\s\S]*?\]\*/gi, "\n")
      .replace(/\n---\n\n## CONCLUSI[\s\S]*$/i, "")
      .replace(/\n---\n\n\*\*Documento[\s\S]*$/i, "")
      .trim(),
  );
}

function parseCanonicalFrameworks(): Framework[] {
  const filePath = path.join(SOURCE_DIR, CANONICAL_SOURCE);
  const text = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
  const matches = [...text.matchAll(/^## #(\d+):\s*(.+)$/gm)];
  const frameworks: Framework[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const next = matches[index + 1];
    const number = Number(match[1]);
    if (!Number.isInteger(number) || number < 1 || number > 116) continue;

    const title = match[2].trim().replace(/\*\*/g, "");
    const start = match.index! + match[0].length;
    const end = next?.index ?? text.length;
    const definition = cleanBody(text.slice(start, end));
    const category = CATEGORY_MAP[number] ?? "clasico";

    frameworks.push({
      number,
      title,
      slug: slugify(title),
      category,
      tier: TIER_MAP[number] ?? "pro",
      estimatedMinutes: ESTIMATED_MINUTES[category] ?? 30,
      definition,
      paths: [],
    });
  }

  return frameworks.sort((a, b) => a.number - b.number);
}

function buildMatcher(frameworks: Framework[]) {
  const byNumber = new Map(frameworks.map(framework => [framework.number, framework]));
  const comparableByNumber = new Map(frameworks.map(framework => [framework.number, comparable(framework.title)]));
  const tokensByNumber = new Map(frameworks.map(framework => [framework.number, titleTokens(framework.title)]));

  function fromTitle(title: string): number | null {
    const normalized = comparable(title);
    if (!normalized) return null;

    const manual = MANUAL_ALIASES.get(normalized);
    if (manual) return manual;

    for (const [number, canonical] of comparableByNumber) {
      if (normalized === canonical || normalized.includes(canonical) || canonical.includes(normalized)) {
        return number;
      }
    }

    const tokens = titleTokens(title);
    let bestNumber: number | null = null;
    let bestScore = 0;

    for (const [number, candidateTokens] of tokensByNumber) {
      const shared = [...tokens].filter(token => candidateTokens.has(token)).length;
      const score = shared / Math.max(tokens.size, candidateTokens.size, 1);
      if (score > bestScore) {
        bestScore = score;
        bestNumber = number;
      }
    }

    return bestScore >= 0.55 ? bestNumber : null;
  }

  return { byNumber, fromTitle };
}

function parseHeading(rawHeading: string, fromTitle: (title: string) => number | null): { number: number; title: string } | null {
  let number: number | null = null;
  const frameworkNumber = rawHeading.match(/^FRAMEWORK\s+#(\d+):/i);
  const hashNumber = rawHeading.match(/^#(\d+):/i);
  const parentheticalNumber = rawHeading.match(/\(Framework\s+#(\d+)\)/i);
  const numberedTitle = rawHeading.match(/^\d+(?:\.\d+)?\.\s+(.+)$/);

  if (frameworkNumber) number = Number(frameworkNumber[1]);
  if (hashNumber) number = Number(hashNumber[1]);
  if (parentheticalNumber) number = Number(parentheticalNumber[1]);

  const title = cleanTitle(numberedTitle?.[1] ?? rawHeading);
  if (!number) number = fromTitle(title);
  if (!number || number < 1 || number > 116) return null;

  return { number, title };
}

function extractSourceSections(fileName: string, text: string, fromTitle: (title: string) => number | null): SourceSection[] {
  const normalizedText = text.replace(/\r\n/g, "\n");
  const headings = [...normalizedText.matchAll(/^#{2,3}\s+(.+)$/gm)]
    .map(match => ({
      raw: match[1].trim(),
      full: match[0],
      index: match.index!,
    }))
    .filter(heading => !/^PARTE\b|^NIVEL\b|^CAP[IÍ]TULO\b|^INTRODUCCI|^CONCLUSI|^TABLA\b/i.test(heading.raw));

  const sections: SourceSection[] = [];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const parsed = parseHeading(heading.raw, fromTitle);
    if (!parsed) continue;

    const start = heading.index + heading.full.length;
    const end = headings[index + 1]?.index ?? normalizedText.length;
    const content = cleanBody(normalizedText.slice(start, end));

    if (content.length < 80) continue;
    if (/requiere documento expandido/i.test(content)) continue;

    sections.push({
      number: parsed.number,
      title: parsed.title,
      content,
      sourceFile: fileName,
    });
  }

  return sections;
}

function sourceFiles(): string[] {
  return fs.readdirSync(SOURCE_DIR).filter(fileName => {
    const fullPath = path.join(SOURCE_DIR, fileName);
    if (!fs.statSync(fullPath).isFile()) return false;
    if (fileName.includes(".")) return false;
    if (/^(nul|con|prn|aux)$/i.test(fileName)) return false;
    if (fileName.startsWith("C")) return false;
    return true;
  });
}

function sourcePriority(fileName: string): number {
  const priorities: Record<string, number> = {
    "LIBRO-MAESTRO-MEO-2025": 10,
    "MEO-51-KPIS-DETALLADO": 9,
    "MEO-2025-Sistema-Completo": 8,
    "MEO-51-FRAMEWORKS-COMPLETO": 7,
    "15-FRAMEWORKS-INTEGRADOS": 6,
    "116-FRAMEWORKS-DEFINICIONES": 1,
  };
  return priorities[fileName] ?? 3;
}

function termsForFramework(framework: Framework): string[] {
  const rawTitle = framework.title.replace(/\([^)]*\)/g, "").trim();
  const terms = new Set<string>([rawTitle]);
  const [beforeDash] = rawTitle.split(/\s+-\s+/);
  if (beforeDash) terms.add(beforeDash.trim());
  if (rawTitle.includes("&")) {
    for (const part of rawTitle.split("&")) terms.add(part.trim());
  }

  const simplified = rawTitle
    .replace(/\b(Framework|Model|Strategy|Optimization|Optimizacion|Program|Marketing)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (simplified) terms.add(simplified);

  return [...terms].filter(term => term.length >= 5);
}

function usefulMention(snippet: string): boolean {
  if (snippet.length < 140) return false;
  return mentionScore(snippet, "") > 0;
}

function mentionScore(snippet: string, sourceFile: string): number {
  let score = sourcePriority(sourceFile);
  if (/(roi|kpi|metric|m[eé]trica|implement|strategy|estrateg|t[aá]ctic|herramient|tool|target|objetivo|timeline|fase|acciones|process|proceso|conversion|engagement|traffic|tr[aá]fico)/i.test(snippet)) score += 40;
  if (/(create|pitch|target|tools|stack|success signals|leading indicators|budget|growth rate)/i.test(snippet)) score += 20;
  if (/(tabla de contenidos|cada uno:\s*\d+\s*p[aá]ginas|cap[ií]tulos?\s+\d+)/i.test(snippet)) score -= 50;
  if (((snippet.match(/Framework #\d+/g) ?? []).length) >= 3) score -= 35;
  score += Math.min(20, Math.floor(snippet.length / 120));
  return score;
}

function collectMentionSections(framework: Framework, sourceTexts: SourceText[]): SourceSection[] {
  const terms = termsForFramework(framework);
  const mentions: Array<SourceSection & { score: number }> = [];
  const seen = new Set<string>();

  for (const source of sourceTexts) {
    if (source.fileName === CANONICAL_SOURCE) continue;
    const lines = source.text.replace(/\r\n/g, "\n").split("\n");

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].toLowerCase();
      if (!terms.some(term => line.includes(term.toLowerCase()))) continue;

      const start = Math.max(0, index - 4);
      const end = Math.min(lines.length, index + 9);
      const snippet = cleanBody(lines.slice(start, end).join("\n"));
      const key = comparable(snippet.slice(0, 400));
      if (seen.has(key)) continue;
      if (!usefulMention(snippet)) continue;

      seen.add(key);
      mentions.push({
        number: framework.number,
        title: framework.title,
        content: snippet,
        sourceFile: `${source.fileName} (mencion relacionada)`,
        score: mentionScore(snippet, source.fileName),
      });
    }
  }

  return mentions
    .sort((a, b) => b.score - a.score)
    .filter((mention, index, all) => {
      const normalized = comparable(mention.content);
      return !all.slice(0, index).some(previous => {
        const previousNormalized = comparable(previous.content);
        return previousNormalized.includes(normalized) || normalized.includes(previousNormalized);
      });
    })
    .slice(0, 2)
    .map(mention => ({
      number: mention.number,
      title: mention.title,
      content: mention.content,
      sourceFile: mention.sourceFile,
    }));
}

function dedupeSections(sections: SourceSection[]): SourceSection[] {
  const seen = new Set<string>();
  const sorted = [...sections].sort((a, b) => {
    const priorityDelta = sourcePriority(b.sourceFile) - sourcePriority(a.sourceFile);
    if (priorityDelta !== 0) return priorityDelta;
    return b.content.length - a.content.length;
  });

  return sorted.filter(section => {
    const key = comparable(section.content.slice(0, 500));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function selectSections(sections: SourceSection[]): SourceSection[] {
  const selected: SourceSection[] = [];
  let charCount = 0;

  for (const section of dedupeSections(sections)) {
    if (selected.length >= 3) break;
    if (charCount > 14000) break;
    selected.push(section);
    charCount += section.content.length;
  }

  return selected;
}

function buildPathLookup(frameworks: Framework[]): Map<number, string[]> {
  const lookup = new Map<number, string[]>();
  const validNumbers = new Set(frameworks.map(framework => framework.number));

  for (const learningPath of LEARNING_PATHS) {
    for (const number of learningPath.numbers) {
      if (!validNumbers.has(number)) continue;
      const current = lookup.get(number) ?? [];
      current.push(learningPath.slug);
      lookup.set(number, current);
    }
  }

  return lookup;
}

function focusFor(title: string, category: string): string {
  const key = comparable(title);
  if (/(seo|search|voice|visual|entity|geo|llmo|aeo|gseo)/.test(key)) return "visibilidad, citabilidad, autoridad y trafico cualificado";
  if (/(data|analytics|measurement|attribution|cdp|modeling|martech|automation|ai|machine|predictive)/.test(key)) return "datos, automatizacion, prediccion y decisiones medibles";
  if (/(conversion|cro|funnel|lead|purchase|lifecycle|retention|success|crm)/.test(key)) return "conversion, seguimiento del journey y mejora de ingresos";
  if (/(brand|story|content|social|community|pr|influencer|affiliate|video|podcast|partnership)/.test(key)) return "autoridad de marca, distribucion, narrativa y confianza";
  if (/(governance|operations|resource|performance|excellence|protocol|orchestration)/.test(key)) return "operacion, coordinacion, gobierno y escalabilidad";
  if (category === "estrategico") return "diagnostico, posicionamiento, planificacion y alineacion del equipo";
  return "implementacion practica, medicion y mejora continua dentro del sistema MEO";
}

function implementationGuide(framework: Framework, hasRichSource: boolean): string {
  const focus = focusFor(framework.title, framework.category);
  const routeText = framework.paths.length > 0 ? framework.paths.join(", ") : "catalogo general MEO";

  const intro = hasRichSource
    ? "Este bloque convierte la informacion local anterior en una secuencia accionable para la plataforma."
    : "La fuente local disponible para este framework era breve; este bloque desarrolla una guia operativa usando su definicion, categoria y relacion dentro del sistema MEO.";

  return `## Guia operativa MEO

${intro}

### Proposito dentro del sistema

${framework.title} funciona como modulo de ${focus}. En MEO no debe quedar como concepto aislado: debe conectarse con adquisicion, experiencia, datos y optimizacion continua.

### Aplicacion practica

1. Definir objetivo principal del framework y el resultado de negocio esperado.
2. Levantar baseline: estado actual, canales implicados, activos disponibles y brechas.
3. Mapear dependencias MEO: frameworks previos, datos necesarios, herramientas y responsables.
4. Ejecutar un sprint inicial de 2 a 4 semanas con entregables visibles.
5. Medir avance con KPIs semanales y documentar aprendizajes.
6. Integrar lo que funcione a la ruta ${routeText} y escalarlo como proceso repetible.

### KPIs sugeridos

- Impacto principal: mejora porcentual contra baseline del objetivo definido.
- Velocidad de implementacion: dias desde diagnostico hasta primera ejecucion medible.
- Calidad del activo: completitud, consistencia y cumplimiento del checklist MEO.
- Contribucion al funnel: trafico, engagement, conversion, retencion o eficiencia segun el caso.
- Sinergia: numero de frameworks MEO conectados con datos, contenido o automatizacion.

### Entregables minimos

- Diagnostico inicial y matriz de oportunidades.
- Checklist de implementacion por canal o activo.
- Dashboard simple con baseline, meta, avance y proximo experimento.
- Retro semanal con aprendizajes, bloqueos y siguiente iteracion.
`;
}

function quiz(framework: Framework): string {
  return `## Quiz

1. Cual es el objetivo principal de ${framework.title} dentro del sistema MEO?
2. Que dos KPIs usarias para saber si este framework esta generando impacto real?
3. Con que otro framework MEO lo combinarias primero y por que?
`;
}

function createMDX(framework: Framework, sections: SourceSection[]): string {
  const frontmatter = `---
title: "${framework.title.replace(/"/g, '\\"')}"
number: ${framework.number}
slug: "${framework.slug}"
category: "${framework.category}"
tier: "${framework.tier}"
estimatedMinutes: ${framework.estimatedMinutes}
paths: ${JSON.stringify(framework.paths)}
---

`;

  const selectedSections = selectSections(sections.filter(section => section.sourceFile !== CANONICAL_SOURCE));
  const sectionBlocks = selectedSections.map(section => `### Fuente: ${section.sourceFile}

${section.content}`).join("\n\n---\n\n");

  const sources = [CANONICAL_SOURCE, ...selectedSections.map(section => section.sourceFile)]
    .filter((source, index, all) => all.indexOf(source) === index);

  const body = [
    `## Definicion base\n\n${framework.definition}`,
    sectionBlocks ? `## Desarrollo desde fuentes locales\n\n${sectionBlocks}` : "",
    implementationGuide(framework, selectedSections.length > 0),
    quiz(framework),
    `## Fuentes locales usadas\n\n${sources.map(source => `- ${source}`).join("\n")}`,
  ].filter(Boolean).join("\n\n---\n\n");

  return `${frontmatter}${body}\n`;
}

function writeLearningPaths(frameworks: Framework[]): void {
  fs.mkdirSync(PATHS_DIR, { recursive: true });
  const byNumber = new Map(frameworks.map(framework => [framework.number, framework]));

  for (const learningPath of LEARNING_PATHS) {
    const frameworksForPath = learningPath.numbers
      .map(number => byNumber.get(number)?.slug)
      .filter((slug): slug is string => Boolean(slug));

    fs.writeFileSync(
      path.join(PATHS_DIR, `${learningPath.slug}.json`),
      `${JSON.stringify({
        slug: learningPath.slug,
        name: learningPath.name,
        description: learningPath.description,
        audience: learningPath.audience,
        color: learningPath.color,
        frameworks: frameworksForPath,
      }, null, 2)}\n`,
      "utf-8",
    );
  }
}

function main(): void {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const frameworks = parseCanonicalFrameworks();
  const matcher = buildMatcher(frameworks);
  const pathLookup = buildPathLookup(frameworks);
  for (const framework of frameworks) {
    framework.paths = pathLookup.get(framework.number) ?? [];
  }

  const sectionsByNumber = new Map<number, SourceSection[]>();
  const files = sourceFiles();
  const sourceTexts: SourceText[] = files.map(fileName => ({
    fileName,
    text: fs.readFileSync(path.join(SOURCE_DIR, fileName), "utf-8"),
  }));

  for (const source of sourceTexts) {
    const sections = extractSourceSections(source.fileName, source.text, matcher.fromTitle);
    for (const section of sections) {
      const current = sectionsByNumber.get(section.number) ?? [];
      current.push(section);
      sectionsByNumber.set(section.number, current);
    }
    console.log(`${source.fileName}: ${sections.length} sections matched`);
  }

  for (const framework of frameworks) {
    const existing = (sectionsByNumber.get(framework.number) ?? [])
      .filter(section => section.sourceFile !== CANONICAL_SOURCE);
    if (existing.length > 0) continue;

    const mentions = collectMentionSections(framework, sourceTexts);
    if (mentions.length === 0) continue;

    sectionsByNumber.set(framework.number, [
      ...(sectionsByNumber.get(framework.number) ?? []),
      ...mentions,
    ]);
  }

  for (const framework of frameworks) {
    const fileName = `${String(framework.number).padStart(3, "0")}-${framework.slug}.mdx`;
    const sections = sectionsByNumber.get(framework.number) ?? [];
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), createMDX(framework, sections), "utf-8");
  }

  writeLearningPaths(frameworks);

  const shortCount = frameworks.filter(framework => {
    const filePath = path.join(OUTPUT_DIR, `${String(framework.number).padStart(3, "0")}-${framework.slug}.mdx`);
    return fs.statSync(filePath).size < 1000;
  }).length;

  console.log(`Written ${frameworks.length} framework MDX files`);
  console.log(`Written ${LEARNING_PATHS.length} learning path JSON files`);
  console.log(`Frameworks under 1000 bytes: ${shortCount}`);
}

main();
