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

export function getAllFrameworks(): FrameworkMeta[] {
  const files = fs.readdirSync(FRAMEWORKS_DIR).filter(f => f.endsWith(".mdx"));
  return files.map(file => {
    const raw = fs.readFileSync(path.join(FRAMEWORKS_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const rt = readingTime(content);
    return {
      title: data.title,
      number: data.number,
      slug: data.slug,
      category: data.category,
      tier: data.tier,
      estimatedMinutes: data.estimatedMinutes,
      paths: data.paths ?? [],
      readingTime: rt.text,
    };
  }).sort((a, b) => a.number - b.number);
}

export function getFrameworkBySlug(slug: string): FrameworkFull | null {
  const files = fs.readdirSync(FRAMEWORKS_DIR).filter(f => f.endsWith(".mdx"));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(FRAMEWORKS_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    if (data.slug === slug) {
      return {
        title: data.title,
        number: data.number,
        slug: data.slug,
        category: data.category,
        tier: data.tier,
        estimatedMinutes: data.estimatedMinutes,
        paths: data.paths ?? [],
        readingTime: readingTime(content).text,
        content,
      };
    }
  }
  return null;
}

export function getAllPaths(): LearningPath[] {
  if (!fs.existsSync(PATHS_DIR)) return [];
  const files = fs.readdirSync(PATHS_DIR).filter(f => f.endsWith(".json"));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(PATHS_DIR, f), "utf-8")));
}

export function getPathBySlug(slug: string): LearningPath | null {
  return getAllPaths().find(p => p.slug === slug) ?? null;
}
