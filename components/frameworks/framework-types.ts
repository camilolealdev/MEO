export type FrameworkTier = "free" | "pro" | "agency";

export interface FrameworkExplorerItem {
  title: string;
  number: number;
  slug: string;
  category: string;
  tier: FrameworkTier;
  estimatedMinutes: number;
  purpose: string;
  kpis: string[];
  limits: string;
  connections: string[];
}
