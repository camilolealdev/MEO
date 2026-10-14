# Resumen de cambios — MEO Platform

Fecha: 2026-10-14 · Commit: `feat(meo): inicializa plataforma MEO`

## Qué es
Plataforma "MEO" (Método Efecto Organic): Next.js 15 + TypeScript + Tailwind + Neon (Postgres) + Drizzle ORM + NextAuth (credential + Stripe). Lección de SEO completa como ejemplo de framework.

## Archivos principales
| Ruta | Qué hace |
|---|---|
| `app/` | Rutas: landing, learn (frameworks), learn/ruta (paths), dashboard, admin, checkout, api/* |
| `lib/db.ts` + `lib/schema.ts` | Conexión Neon + schema Drizzle (users, frameworks, lessons, progress, orders) |
| `lib/auth.ts` + `auth.config.ts` + `types/next-auth.d.ts` | NextAuth con roles/tiers tipados (free/pro/agency, user/admin) |
| `lib/stripe.ts` + `lib/paypal.ts` | Integración de pagos (MercadoPago también disponible) |
| `content/frameworks/*.mdx` | Contenido MDX (001-seo completo) con componentes Fw* |
| `content/paths/*.json` | Rutas de aprendizaje (ej: `seo-total.json`) |
| `components/ui/*` | UI: PathCard, FrameworkCard, FwTable, FwCallout, FwCodeBlock, MarkCompleteButton, etc. |
| `components/dashboard/Sidebar.tsx` | Navegación del dashboard |
| `app/global-error.tsx` | Error boundary global en español |
| `scripts/check-mdx.mts` | Validación de MDX en CI/local |
| `proxy.ts` | Middleware (regiones/auth) |
| `tests/` | 22 tests (tiers, rate-limit, content) — todos pasan |

## Verificación
- `npm run typecheck` ✅ 0 errores
- `npm run lint` ✅ 0 errores (1 warning no bloqueante)
- `npm run test` ✅ 22/22
- `npm run build` ✅ (simulado con envs dummy de CI)

## Pendiente para VER los cambios aplicados
1. **Subir a GitHub** → push a `camilolealdev/MEO` (bloqueado antes por scope; ahora sin el workflow).
2. **Desplegar en Vercel** (vercel.com → Import repo) o `npm run dev` en local.
3. **Variables de entorno** en Vercel/Local: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `PAYPAL_*` / `MERCADOPAGO_*` opcionales.
4. **Migrar la DB**: `npm run db:migrate` (o `prisma migrate deploy` si usas Prisma CLI) contra Neon.
5. Crear admin inicial: `scripts/` de seed o registro + UPDATE manual de rol.

Nota: `.github/workflows/ci.yml` se quitó de este commit porque el token de GitHub disponible no tiene scope `workflow`; añadirlo luego desde la web de GitHub o regenerando el token con ese scope.
