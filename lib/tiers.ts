// Fuente única de verdad para la jerarquía de tiers.
// Server-safe (sin imports de cliente): puede usarse tanto en Server Components
// como en Client Components. Evita la duplicación de TIER_ORDER/TIER_LABELS.

export type Tier = "free" | "pro" | "agency";

export const TIER_ORDER: Record<Tier, number> = {
  free: 0,
  pro: 1,
  agency: 2,
};

export const TIER_LABELS: Record<Tier, string> = {
  free: "Explorer",
  pro: "Practitioner",
  agency: "Orchestrator",
};

/**
 * Determina si un usuario con `userTier` puede acceder a contenido que
 * requiere `requiredTier`. Es la comprobación canónica de autorización por tier.
 */
export function hasAccess(userTier: Tier, requiredTier: Tier): boolean {
  return TIER_ORDER[userTier] >= TIER_ORDER[requiredTier];
}
