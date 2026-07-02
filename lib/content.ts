import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const FRAMEWORKS_DIR = path.join(process.cwd(), "content", "frameworks");
const PATHS_DIR = path.join(process.cwd(), "content", "paths");

export interface FrameworkMeta {
  title: string;
  number: number;
  slug: string;
  category: string;
  tier: "free" | "pro" | "agency";
  estimatedMinutes: number;
  paths: string[];
  readingTime: string;
}

export interface FrameworkFull extends FrameworkMeta {
  content: string;
}

export interface LearningPath {
  slug: string;
  name: string;
  description: string;
  audience: string;
  frameworks: string[];
  color: string;
}

// Caché a nivel de módulo: los MDX/JSON solo cambian con un redeploy, así que se
// leen y parsean una sola vez por instancia del servidor. Antes cada llamada a
// getFrameworkBySlug escaneaba los 117 archivos → N+1 de filesystem por request.
let frameworksCache: FrameworkFull[] | null = null;
let frameworksBySlug: Map<string, FrameworkFull> | null = null;
let pathsCache: LearningPath[] | null = null;

const VALID_TIERS = new Set(["free", "pro", "agency"]);

function validateFrameworkMeta(
  data: Record<string, unknown>,
  file: string
): Omit<FrameworkMeta, "readingTime"> | null {
  const { title, number, slug, category, tier, estimatedMinutes, paths } = data;

  if (typeof slug !== "string" || slug.length === 0) {
    console.error(`content: ${file} sin 'slug' válido — omitido`);
    return null;
  }
  if (typeof title !== "string" || title.length === 0) {
    console.error(`content: ${file} sin 'title' válido — omitido`);
    return null;
  }
  if (typeof tier !== "string" || !VALID_TIERS.has(tier)) {
    console.error(`content: ${file} con 'tier' inválido (${String(tier)}) — omitido`);
    return null;
  }

  return {
    title,
    number: typeof number === "number" ? number : 0,
    slug,
    category: typeof category === "string" ? category : "sin-categoria",
    tier: tier as "free" | "pro" | "agency",
    estimatedMinutes: typeof estimatedMinutes === "number" ? estimatedMinutes : 0,
    paths: Array.isArray(paths) ? (paths as string[]) : [],
  };
}

function loadFrameworks(): FrameworkFull[] {
  if (frameworksCache) return frameworksCache;

  const result: FrameworkFull[] = [];
  let files: string[] = [];
  try {
    files = fs.readdirSync(FRAMEWORKS_DIR).filter((f) => f.endsWith(".mdx"));
  } catch (e) {
    console.error(`content: no se pudo leer ${FRAMEWORKS_DIR}:`, e);
    frameworksCache = [];
    frameworksBySlug = new Map();
    return frameworksCache;
  }

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(FRAMEWORKS_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      const meta = validateFrameworkMeta(data as Record<string, unknown>, file);
      if (!meta) continue;
      result.push({ ...meta, readingTime: readingTime(content).text, content });
    } catch (e) {
      console.error(`content: error procesando ${file} — omitido:`, e);
    }
  }

  result.sort((a, b) => a.number - b.number);
  frameworksCache = result;
  frameworksBySlug = new Map(result.map((fw) => [fw.slug, fw]));
  return frameworksCache;
}

export function getAllFrameworks(): FrameworkMeta[] {
  // Se devuelve la metadata sin el `content` para no filtrar el cuerpo MDX a
  // los listados (que no lo necesitan).
  return loadFrameworks().map((fw) => ({
    title: fw.title,
    number: fw.number,
    slug: fw.slug,
    category: fw.category,
    tier: fw.tier,
    estimatedMinutes: fw.estimatedMinutes,
    paths: fw.paths,
    readingTime: fw.readingTime,
  }));
}

export function getFrameworkBySlug(slug: string): FrameworkFull | null {
  loadFrameworks();
  return frameworksBySlug?.get(slug) ?? null;
}

export function getAllPaths(): LearningPath[] {
  if (pathsCache) return pathsCache;
  if (!fs.existsSync(PATHS_DIR)) {
    pathsCache = [];
    return pathsCache;
  }

  const result: LearningPath[] = [];
  let files: string[] = [];
  try {
    files = fs.readdirSync(PATHS_DIR).filter((f) => f.endsWith(".json"));
  } catch (e) {
    console.error(`content: no se pudo leer ${PATHS_DIR}:`, e);
    pathsCache = [];
    return pathsCache;
  }

  for (const file of files) {
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(PATHS_DIR, file), "utf-8"));
      if (parsed && typeof parsed.slug === "string") {
        result.push(parsed as LearningPath);
      } else {
        console.error(`content: ${file} sin 'slug' válido — omitido`);
      }
    } catch (e) {
      console.error(`content: error parseando ${file} — omitido:`, e);
    }
  }

  pathsCache = result;
  return pathsCache;
}

export function getPathBySlug(slug: string): LearningPath | null {
  return getAllPaths().find((p) => p.slug === slug) ?? null;
}
