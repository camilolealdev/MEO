import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const FRAMEWORKS_DIR = path.join(process.cwd(), "content", "frameworks");
const PATHS_DIR = path.join(process.cwd(), "content", "paths");

export interface FrameworkResource {
  title: string;
  url: string;
  desc?: string;
}

export interface FrameworkMeta {
  title: string;
  number: number;
  slug: string;
  category: string;
  tier: "free" | "pro" | "agency";
  estimatedMinutes: number;
  paths: string[];
  readingTime: string;
  resources: FrameworkResource[];
  evidenceLevel: "high" | "medium" | "low";
  sourceCount: number;
  primarySourceCount: number;
  lastUpdated: string | null;
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
): Omit<
  FrameworkMeta,
  "readingTime" | "evidenceLevel" | "sourceCount" | "primarySourceCount" | "lastUpdated"
> | null {
  const { title, number, slug, category, tier, estimatedMinutes, paths, resources } = data;

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
    resources: Array.isArray(resources)
      ? (resources as FrameworkResource[]).filter(
          (r) =>
            r && typeof r.title === "string" && typeof r.url === "string"
        )
      : [],
  };
}

const PRIMARY_SOURCE_HOSTS = new Set([
  "developers.google.com",
  "support.google.com",
  "www.w3.org",
  "www.nist.gov",
  "nvlpubs.nist.gov",
  "c2pa.org",
  "spec.c2pa.org",
  "ico.org.uk",
  "eur-lex.europa.eu",
  "digital-strategy.ec.europa.eu",
  "learn.microsoft.com",
  "www.iso.org",
]);

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) {
    return false;
  }
  return !Number.isNaN(Date.parse(value));
}

function deriveEvidence(resources: FrameworkResource[]) {
  const validResources = resources.filter((resource) => {
    try {
      const url = new URL(resource.url);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  });
  const primarySourceCount = validResources.filter((resource) => {
    const hostname = new URL(resource.url).hostname.toLowerCase();
    return (
      PRIMARY_SOURCE_HOSTS.has(hostname) ||
      hostname.endsWith(".gov") ||
      hostname.endsWith(".gov.uk") ||
      hostname.endsWith(".gov.co") ||
      hostname.endsWith(".edu")
    );
  }).length;

  return {
    sourceCount: validResources.length,
    primarySourceCount,
    evidenceLevel:
      validResources.length >= 2 && primarySourceCount >= 1
        ? ("high" as const)
        : validResources.length >= 1
          ? ("medium" as const)
          : ("low" as const),
  };
}

function getLastUpdated(data: Record<string, unknown>): string | null {
  for (const key of ["updatedAt", "lastUpdated", "reviewedAt"]) {
    if (isValidDate(data[key])) return data[key];
  }
  return null;
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
      const evidence = deriveEvidence(meta.resources);
      result.push({
        ...meta,
        ...evidence,
        lastUpdated: getLastUpdated(data as Record<string, unknown>),
        readingTime: readingTime(content).text,
        content,
      });
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
    resources: fw.resources,
    evidenceLevel: fw.evidenceLevel,
    sourceCount: fw.sourceCount,
    primarySourceCount: fw.primarySourceCount,
    lastUpdated: fw.lastUpdated,
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
