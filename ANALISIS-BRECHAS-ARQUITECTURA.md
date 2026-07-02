# Análisis de Brechas de Arquitectura — MEO Platform

> **Fecha:** 2026-07-01
> **Proyecto:** `meo-platform` — Next.js 16.2.6 · React 19 · TypeScript 5 · Drizzle ORM + Neon PostgreSQL · NextAuth v5 · Tailwind v4
> **Producción:** https://meo-steel.vercel.app
> **Alcance:** revisión de arquitectura, seguridad, pagos, capa de datos, contenido, frontend, calidad y operaciones sobre el código real (no la documentación).
> **Método:** análisis en 4 dimensiones (auth/seguridad · pagos · datos/API · frontend/tooling) con verificación directa de los hallazgos críticos.

---

## 0. Cómo usar este documento

Este archivo es el **punto de continuación** del trabajo. Está organizado así:

1. **Resumen ejecutivo** y mapa de calor por área.
2. **Backlog priorizado** (P0–P3) — la lista accionable para ejecutar en orden.
3. **Detalle por dominio** — cada brecha con `archivo:línea`, impacto y remediación concreta.
4. **Apéndices** — deuda transversal, tabla maestra de hallazgos, verificación pendiente.

Cada hallazgo tiene un **ID estable** (p.ej. `SEC-01`, `PAY-03`) para poder referenciarlo en commits/PRs/issues. Al cerrar uno, marca su casilla `- [ ]` → `- [x]`.

Convención de severidad: 🔴 **Crítica** (fuga de ingresos/datos o vulnerabilidad explotable) · 🟠 **Alta** (bug funcional o riesgo operativo serio) · 🟡 **Media** (deuda con impacto) · 🟢 **Baja** (mejora).

---

## 1. Resumen ejecutivo

La plataforma tiene una **arquitectura base sólida y bien pensada**: separación de config de auth edge-safe vs server (`auth.config.ts` / `lib/auth.ts`), route groups limpios, defensa en profundidad en `/admin`, verificación correcta de firma en Stripe, `next/font` optimizado y un modelo de contenido MDX+JSON coherente.

Sin embargo, el "camino feliz" oculta **brechas que comprometen el modelo de negocio y la seguridad**:

- 🔴 **El contenido premium no está protegido en el servidor.** Cualquier usuario (incluso sin pagar) puede leer los 117 frameworks navegando directo a `/learn/<slug>`. El gating es puramente visual en el cliente. **→ fuga total de ingresos.**
- 🔴 **Los webhooks de MercadoPago y PayPal fallan-abierto** (`if (!secret) return true`): si falta una variable de entorno, cualquiera puede otorgarse un tier de pago.
- 🔴 **El tier no se refresca tras pagar** y **persiste tras cancelar** (JWT stale de ~30 días).
- 🔴 **Contraseña de super-admin hardcodeada** en el repositorio (`scripts/set-password.ts`).
- 🔴 **`priceId` de Stripe sin validar** → un price arbitrario otorga `pro` por defecto.
- 🟠 **Cero tests, cero CI/CD, cero observabilidad** (sin error tracking, sin health check).
- 🟠 **N+1 de filesystem** en carga de contenido (hasta ~2.400 lecturas de archivo por render de ruta).

### Mapa de calor por área

| Área | Estado | Severidad máx. | Hallazgos |
|------|--------|----------------|-----------|
| Autorización / tier gating | ❌ Crítico | 🔴 | Contenido premium sin gate server-side; sitemap y prerender exponen premium |
| Pagos / webhooks | ❌ Crítico | 🔴 | Fail-open en firmas, sin idempotencia, sin reconciliación, doble cobro en upgrade |
| Autenticación / sesión | ⚠️ Débil | 🔴 | Tier stale tras pago, sin rate limit, enumeración de usuarios |
| Secretos / config | ⚠️ Débil | 🔴 | Password admin en repo; sin headers de seguridad |
| Capa de datos / migraciones | ⚠️ Débil | 🟠 | Drift schema↔SQL, sin índices en FKs, sin enums/CHECK |
| Contenido (MDX) | ⚠️ Débil | 🔴(perf) | N+1 de FS, sin caché, sin validación de frontmatter |
| Testing | ❌ Ausente | 🟠 | 0 tests, sin runner |
| CI/CD | ❌ Ausente | 🟠 | Sin pipeline, deploy directo a `main` sin gate |
| Observabilidad | ❌ Ausente | 🟠 | Sin Sentry, sin logging estructurado, sin health check |
| Manejo de errores UI | ⚠️ Débil | 🟠 | Sin error/loading/not-found boundaries |
| SEO técnico | ⚠️ Débil | 🟠 | Dominio hardcodeado incorrecto, sin OG/canonical |
| Rendimiento frontend | 🟡 Mejorable | 🟡 | 117 componentes Framer Motion client, sin next/image |

---

## 2. Backlog priorizado (orden de ejecución recomendado)

### P0 — Bloqueantes de seguridad / ingresos (hacer ya)

- [x] **AUTH-01 / DATA-06** — ✅ Gate de tier **server-side** en `app/learn/[slug]/page.tsx` (paywall antes de `<MDXRemote>`). Usa `lib/tiers.ts` (nuevo módulo central).
- [x] **DATA-07** — ✅ Premium excluido de `generateStaticParams` (solo `free`) y del `sitemap.ts`.
- [x] **PAY-01 / PAY-02** — ✅ Webhooks MercadoPago y PayPal ahora **fail-closed** en producción (rechazan si falta el secreto; permisivos solo en dev). MP además protege `timingSafeEqual` (PAY-17).
- [x] **PAY-06** — ✅ `priceId` validado contra allowlist en `/api/stripe/checkout`; eliminado el default a `pro` en `lib/stripe.ts` (loggea price/userId desconocidos).
- [x] **SEC-08** — ✅ Contraseña admin hardcodeada eliminada; `scripts/set-password.ts` lee `ADMIN_EMAIL`/`ADMIN_PASSWORD` de env. **Pendiente manual: rotar la credencial ya expuesta en el historial de git.**
- [x] **AUTH-02 / PAY-08** — ✅ Refresco periódico de tier/rol en el callback `jwt` (`lib/auth.ts`): revalida contra la BD cada 5 min además de en login/`update()`. Acota la obsolescencia del JWT y propaga upgrades/cancelaciones/bajas de rol en minutos.

> **Verificación:** ✅ `tsc --noEmit`, `eslint`, `next build` — todos exit 0 (ver §4.3).
> **Extra resuelto de paso:** SEO-01 (dominio vía `NEXT_PUBLIC_SITE_URL`), FE-03 (tiers centralizados en `lib/tiers.ts`), AUTH-05 (eliminados `as any` de la sesión).

### P1 — Robustez de pagos y datos

- [x] **PAY-05** — ✅ Idempotencia de webhooks: tabla `webhook_events(provider, event_id UNIQUE)` + helper `isNewWebhookEvent` conectado en Stripe/MP/PayPal (degradación segura si la tabla no existe aún). **Requiere aplicar la migración `0003`.**
- [x] **PAY-09** — ✅ Sincronización Stripe: si falta `metadata.userId` (updated/deleted) se resuelve por `stripeCustomerId`.
- [ ] **PAY-10** — Reconciliación: verificación en `success_url` + cron diario contra cada proveedor. _(pendiente — necesita cron/infra)_
- [x] **PAY-11** — ✅ Dunning: `active`/`trialing`/`past_due` conservan acceso; solo se degrada en estados terminales (Stripe). MP/PayPal pendientes de afinar.
- [x] **DATA-08** — ✅ `/api/progress`: upsert atómico (`onConflictDoUpdate` + acumula tiempo), validación de entrada y autorización por tier.
- [x] **CONTENT-01/02/03** — ✅ Caché a nivel de módulo (Map por slug, O(1)), manejo de errores por archivo y validación de frontmatter en `lib/content.ts`.
- [x] **SEC-04** — ✅ Rate limiting en `/register` (por IP) y `authorize`/login (por email) + mitigación de timing (SEC-05, hash dummy) y hardening de registro (SEC-06 pass≥8, SEC-09 email). _(limitador en memoria; migrar a Upstash para serverless robusto)_
- [x] **PAY-15** — ✅ Stripe `deleted` marca `subscriptions.status='canceled'` (evita divergencia con `users.tier`).
- [x] **DATA-01/03/04 · PAY-03** — ✅ `updatedAt` en `users`/`subscriptions`, índices en FKs, unique en `path_enrollments`, columna `provider` en `subscriptions`. **Requiere aplicar la migración `0003`.**

### P2 — Calidad, CI y observabilidad

- [x] **QUAL-01** — ✅ CI en `.github/workflows/ci.yml`: `lint` + `typecheck` + `test` + `build` en push/PR a `main`; scripts `typecheck`/`test` en `package.json`. **Pendiente manual:** activar branch protection en GitHub.
- [x] **QUAL-02** — ✅ Vitest instalado + suite inicial (10 tests) para `lib/tiers` y `lib/rate-limit`. _(pendiente ampliar a content/webhooks y e2e Playwright)_
- [~] **OBS-01** — Parcial: el `catch` de firma del webhook Stripe ya loggea. Sentry (`instrumentation.ts` + `onRequestError`) queda pendiente _(requiere cuenta/DSN)_.
- [x] **OBS-02** — ✅ Endpoint `/api/health` con `SELECT 1` contra Neon (503 si no responde).
- [x] **UI-01** — ✅ `app/global-error.tsx`, `app/not-found.tsx`, `(dashboard)/error.tsx`, `(dashboard)/loading.tsx`.
- [x] **UI-02** — ✅ `MarkCompleteButton` comprueba `res.ok`, no marca completado si falla y ofrece reintentar.
- [x] **SEC-11** — ✅ Headers HSTS/`X-Content-Type-Options`/`X-Frame-Options`/`Referrer-Policy`/`Permissions-Policy` en `next.config.ts`. **CSP pendiente** (requiere nonce por el JSON-LD inline).
- [x] **SEO-01/SEO-02** — ✅ Dominio vía `NEXT_PUBLIC_SITE_URL` en `sitemap`/`robots`/`layout`; añadidos OpenGraph/Twitter/canonical en `layout.tsx`.

> **⚠️ ACCIÓN REQUERIDA — aplicar migración `drizzle/0003_gap_analysis.sql`:**
> El código de idempotencia (PAY-05) y las columnas nuevas (`provider`, `updatedAt`) dependen de esta migración. Es **aditiva y no destructiva** (`CREATE TABLE/INDEX IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`). Aplicar con:
> ```bash
> DATABASE_URL="postgresql://..." npx drizzle-kit push
> # o ejecutar el SQL de drizzle/0003_gap_analysis.sql directamente en Neon
> ```
> No la apliqué automáticamente para no modificar la BD de producción sin tu visto bueno. El helper `isNewWebhookEvent` degrada de forma segura si la tabla aún no existe (procesa el webhook y loggea), así que el deploy no se rompe si el orden se invierte.
>
> **Otros items que aún requieren infraestructura/decisión:**
> - **SEC-04** — el limitador actual es en memoria (por-instancia). Para serverless robusto: migrar a Upstash/Redis.
> - **OBS-01 (Sentry)** — requiere cuenta/DSN.
> - **PAY-10 (reconciliación)** — requiere un cron.
> - **QUAL-02** — ampliar la suite (content/webhooks) y añadir e2e Playwright.
> - **DATA-02/05** (enums/CHECK, `timestamptz`) — pendientes; conviene consolidarlas en la próxima migración.

### P3 — Deuda técnica y pulido

- [ ] **DATA-01..05** — `updatedAt`, `pgEnum`/CHECK para `tier`/`role`/`status`, índices en FKs, unique en `pathEnrollments`, `timestamptz`.
- [ ] **DATA-09** — Unificar estrategia de migraciones (drizzle-kit generate con journal) y eliminar scripts ad-hoc.
- [ ] **PAY-12** — Portal de gestión / cancelación in-app; manejo de reembolsos y chargebacks; upgrade/downgrade sin doble cobro.
- [ ] **FE-01** — Reducir `'use client'` en listados de 117 tarjetas (CSS `fade-in-up` ya existe en `globals.css`).
- [ ] **FE-02** — Implementar `/progreso` real (hoy es un stub que no lee la tabla `progress`).
- [ ] **QUAL-03** — Endurecer `tsconfig` (`ES2022`, `noUncheckedIndexedAccess`) y ESLint; pre-commit hook.

---

## 3. Detalle por dominio

### 3.1 Autorización y tier gating 🔴

| ID | Sev | Ubicación | Brecha | Remediación |
|----|-----|-----------|--------|-------------|
| **AUTH-01** | 🔴 | `app/learn/[slug]/page.tsx:27-58` | La página obtiene `session` (línea 29) pero **solo la usa para mostrar el botón** (línea 47). Renderiza `<MDXRemote source={fw.content} />` (línea 53) **sin comparar `fw.tier` con el tier del usuario**. Un usuario `free` —o anónimo— lee cualquier framework `pro`/`agency` navegando a la URL. **Verificado en código.** | Calcular `userTier` desde sesión/BD; si `TIER_ORDER[userTier] < TIER_ORDER[fw.tier]`, renderizar paywall o `redirect('/precios')` y **no** emitir `fw.content`. |
| **DATA-07** | 🔴 | `app/learn/[slug]/page.tsx:13-15` · `app/sitemap.ts:8-13` | `generateStaticParams` prerenderiza **todos** los frameworks (premium incluido) → HTML estático servible. El `sitemap` publica URLs premium (solo baja `priority`). | Excluir no-`free` del prerender y del sitemap, o servir solo preview. |
| **AUTH-03** | 🟡 | `app/(dashboard)/aprender/page.tsx:19-22` · `app/learn/ruta/[slug]/page.tsx:42-44` | Gating solo cosmético (`opacity-60`, oculta link) — depende de que la ruta destino proteja (que no lo hace). | Se resuelve con AUTH-01. |
| **DATA-10** | 🟡 | `app/learn/[slug]/page.tsx:47` · `MarkCompleteButton.tsx` | El botón "completar" aparece con solo tener sesión, sin validar acceso al framework. | Renderizar solo si el usuario tiene acceso. |

> ✅ **Correcto:** el doble control de `/admin` (`proxy.ts:32-34` + `app/admin/layout.tsx` + `app/admin/page.tsx`) es defensa en profundidad bien hecha (sujeta a AUTH-02).

### 3.2 Pagos y suscripciones 🔴

| ID | Sev | Ubicación | Brecha | Remediación |
|----|-----|-----------|--------|-------------|
| **PAY-01** | 🔴 | `app/api/mercadopago/webhook/route.ts:7` | `if (!secret) return true;` → **fail-open**. Sin `MERCADOPAGO_WEBHOOK_SECRET`, cualquier POST activa tiers. **Verificado.** | Fail-closed: si no hay secreto en prod, rechazar (500) o abortar arranque. |
| **PAY-02** | 🔴 | `app/api/paypal/webhook/route.ts:21-22` | `if (!webhookId) return true;` → mismo fail-open. | Fail-closed; cachear token OAuth; tratar fallo de verificación de red como 5xx reintentable, no 401. |
| **PAY-06** | 🔴 | `app/api/stripe/checkout/route.ts:11` · `lib/stripe.ts:57` | `priceId` llega del cliente sin validar; `TIER_PRICES[priceId] ?? "pro"` → un price ajeno/menor otorga **`pro` gratis**. | Validar `priceId ∈ {STRIPE_PRICE_PRO, STRIPE_PRICE_AGENCY}`; rechazar lo demás; sin default. |
| **PAY-09** | 🔴 | `lib/stripe.ts:58-59` | `handleSubscriptionUpsert` sale si no hay `subscription.metadata.userId`, que **normalmente viene vacío** en `updated`/`deleted` (el metadata se puso en la Checkout Session, no en la Subscription). Renovaciones/cancelaciones no se reflejan. | Propagar `subscription_data.metadata.userId` o resolver por `stripeCustomerId` (ya está en `users`). |
| **PAY-05** | 🟠 | Todos los webhooks | Sin deduplicación de eventos ni guard de orden. `onConflictDoUpdate` da idempotencia por fila, pero un evento tardío puede reactivar un tier cancelado. | Tabla `webhook_events(provider, event_id UNIQUE)`; comparar timestamp/`current_period_end` para descartar eventos rancios. |
| **PAY-11** | 🟠 | `lib/stripe.ts:82` · `lib/mercadopago.ts:103` · `lib/paypal.ts:121` | `tier = status==='active' ? tier : 'free'` degrada **de inmediato** en `past_due` (dunning normal de Stripe). | Mantener tier si `status ∈ {active, past_due, trialing}` y `currentPeriodEnd > now`; degradar solo en `canceled/unpaid/expired`. |
| **PAY-10** | 🟠 | checkout redirects (`lib/stripe.ts:49`, etc.) | Redirige optimista a `/dashboard?upgraded=true`; tier solo se otorga por webhook. Si el webhook falla, el usuario paga y **no obtiene acceso**, sin recuperación. | Verificar en `success_url` (consultar sesión/suscripción por API) + cron de reconciliación. |
| **PAY-03** | 🟠 | `lib/schema.ts:50-59` | Esquema **monoproveedor**: MP y PayPal guardan sus IDs dentro de columnas `stripe*`. Sin columna `provider`, sin unique por `userId` → múltiples suscripciones activas. | Añadir `provider`; normalizar identidad; unique parcial por `userId` sobre activas. |
| **PAY-04** | 🟠 | `lib/paypal.ts:93-95` | `custom_id` sin validar: si no contiene `:`, `tier` queda `undefined` y se inserta fila con tier inválido. | Validar formato antes de insertar; loggear y rechazar si malformado. |
| **PAY-13** | 🟠 | `mercadopago.ts` · `paypal.ts` | Upgrade/downgrade **crea nueva suscripción sin cancelar la previa** → doble cobro (agravado por falta de unique por `userId`). | Detectar suscripción existente; Stripe `subscriptions.update` con proration; MP/PayPal cancelar la previa antes de crear. |
| **PAY-14** | 🟡 | `mp/webhook:25` · `paypal/webhook:15` | Solo se escuchan eventos de alta/baja; se ignoran renovaciones y pagos fallidos → sin dunning ni refresco de periodo. | Manejar `payment`/`PAYMENT.SALE.COMPLETED` y `*.PAYMENT.FAILED`. |
| **PAY-15** | 🟡 | `stripe/webhook/route.ts:31-32` | En `deleted` se baja `users.tier` pero **no** se toca `subscriptions.status` → divergencia permanente. | Actualizar también `subscriptions.status='canceled'`. |
| **PAY-16** | 🟡 | `mercadopago.ts:90` | `currentPeriodEnd` fijado siempre a `now + 30d` (ficticio). | Usar la fecha real del preapproval. |
| **PAY-17** | 🟡 | `mercadopago/webhook/route.ts:15` | `timingSafeEqual` lanza `RangeError` con longitudes distintas → responde 500 en vez de 401. | Comparar longitudes primero → 401 determinista. |
| **PAY-12** | 🟠 | — (ausente) | Sin portal/cancelación in-app (la UI dice "Cancela cuando quieras"), sin reembolsos/chargebacks, sin trials. | `stripe.billingPortal`, endpoints de cancelación, escuchar `charge.refunded`/`dispute`. |
| **PAY-18** | 🟡 | webhooks | Sin `export const runtime = "nodejs"` (usan `crypto`/`Buffer`). Frágil si algún día se fuerza edge. | Declarar runtime nodejs. |

> ✅ **Correcto:** Stripe verifica la firma bien (`app/api/stripe/webhook/route.ts:14` con `constructEvent` sobre `req.text()` crudo).

### 3.3 Autenticación y sesión 🔴

| ID | Sev | Ubicación | Brecha | Remediación |
|----|-----|-----------|--------|-------------|
| **AUTH-02** | 🔴 | `lib/auth.ts:55-65` | El callback `jwt` solo consulta BD en login inicial. Tras pagar, el JWT (~30d) sigue mostrando `free`; tras cancelar, mantiene el tier pagado hasta expirar. | Leer tier de BD en páginas de contenido, o `update()` tras retorno de pago; reducir `session.maxAge`; considerar sesiones DB para revocar. |
| **SEC-08** | 🔴 | `scripts/set-password.ts:7-8` | Contraseña en texto plano hardcodeada (constante `PASSWORD`) para el super-admin `master871017@meo.com` (`role:admin`, `tier:agency`). El valor está versionado en el repo. | Eliminar del repo; leer de env/prompt; **rotar la credencial ya expuesta**; forzar cambio en primer login. |
| **SEC-04** | 🟠 | `app/api/auth/register/route.ts:7` · `lib/auth.ts:20` | Sin rate limiting → creación masiva de cuentas y fuerza bruta/credential stuffing. | Rate limit por IP/email (p.ej. Upstash) + captcha en registro. |
| **SEC-05** | 🟠 | `register/route.ts:21-23` · `lib/auth.ts:28-31` | Enumeración de usuarios: `409` explícito + canal de temporización (bcrypt solo corre si el usuario existe). | Mensaje genérico; ejecutar `bcrypt.compare` contra hash dummy siempre. |
| **AUTH-04** | 🟠 | `auth.config.ts:11-16` | El `jwt` del config edge solo asigna `token.id`; rol/tier no revocables hasta re-login. | Validar rol contra BD en acciones admin sensibles. |
| **SEC-06** | 🟡 | `register/route.ts:14` vs `register/page.tsx:128` | Servidor acepta password de 6 chars; cliente exige 8. Sin complejidad ni chequeo de breach. | Elevar a ≥8-12 server-side; zxcvbn/HIBP. |
| **SEC-07** | 🟡 | `register/route.ts:31` | `emailVerified: new Date()` sin confirmación real → cualquiera "verifica" el email de otro. | No marcar verificado; enviar correo de confirmación. |
| **SEC-09** | 🟡 | `register/route.ts:11` | Email sin validación de formato server-side. | Validar con Zod/regex. |
| **AUTH-05** | 🟡 | `auth.config.ts:20-21` · `lib/auth.ts:69-70` | `(token as any).tier ?? "free"` degrada silenciosamente y elude `types/next-auth.d.ts`. | Tipar correctamente; eliminar `as any`. |
| **SEC-12** | 🟢 | `.env.example:5` | Usa `NEXTAUTH_URL` (v5 usa `AUTH_URL`); si falta, las URLs de retorno de pago quedan `"undefined/dashboard"`. | Alinear a `AUTH_URL`; validar env al arranque. |

> ✅ **Correcto:** bcrypt cost 12; sin secretos hardcodeados en `lib/` (salvo SEC-08 en scripts).

### 3.4 Capa de datos, migraciones y contenido 🟠

| ID | Sev | Ubicación | Brecha | Remediación |
|----|-----|-----------|--------|-------------|
| **CONTENT-01** | 🔴(perf) | `lib/content.ts:52-72` + `app/learn/ruta/[slug]/page.tsx:29-31` | N+1 de filesystem: `getFrameworkBySlug` escanea **todos** los MDX hasta hallar el slug; la página de ruta lo llama por cada framework → hasta ~2.400 lecturas+parseos por render. Como las páginas usan `auth()` → render dinámico → el costo es **por request**. | Cargar todos a un `Map` cacheado (`React.cache`/`unstable_cache`); `getFrameworkBySlug` O(1). |
| **CONTENT-02** | 🟠 | `lib/content.ts:36-37,55-56,77` | Cero manejo de errores: un MDX/JSON corrupto lanza excepción no capturada → 500 en toda la página y rompe `sitemap`/build. | `try/catch` por archivo, loggear el culpable, skip controlado. |
| **CONTENT-03** | 🟠 | `lib/content.ts:40-48,60-67` | Sin validación de frontmatter; `tier`/`number`/`slug` undefined rompen gating y ordenamiento (`NaN`). | Validar con Zod; rechazar/loggear inválidos. |
| **DATA-08** | 🟠 | `app/api/progress/route.ts:27-48` | Idempotencia por read-then-insert (TOCTOU) → 500 en concurrencia; `timeSpentSeconds` nunca se actualiza; validación mínima (`req.json()` sin try/catch); **sin autorización por tier** (un `free` marca progreso de `agency`). | `onConflictDoUpdate` atómico; Zod (`frameworkSlug` existente, `timeSpentSeconds` int≥0); validar tier; try/catch. |
| **DATA-09** | 🟠 | `drizzle/` (3 `.sql`, sin `meta/`) · `scripts/apply-migration-0002.ts` | Migraciones escritas a mano sin journal/snapshots; `password_hash` y `progress_user_slug_idx` no están en `0000` (drift); migración 0002 aplicada por script ad-hoc. Entorno nuevo desde `0000` queda incompleto. | Regenerar baseline con `drizzle-kit generate` (journal+snapshots) o formalizar migraciones manuales con tabla de control; CI que falle ante drift; eliminar scripts ad-hoc. |
| **DATA-02** | 🟠 | `lib/schema.ts:11-12,55-56` | `tier`/`role`/`status` son `text` sin CHECK/enum en BD (`$type` es solo compile-time). Un UPDATE manual introduce valores inválidos. | `pgEnum` o `CHECK (... IN (...))`. |
| **DATA-03** | 🟠 | `lib/schema.ts:16-38,52` | Faltan índices en FKs (`accounts.userId`, `sessions.userId`, `subscriptions.userId`) → seq scans al crecer. | `index().on(t.userId)`. |
| **DATA-01** | 🟠 | `lib/schema.ts` (global) | Ninguna tabla tiene `updatedAt` → imposible auditar cambios de tier/suscripción. | `updatedAt` con `$onUpdate`. |
| **DATA-04** | 🟡 | `lib/schema.ts:69-75` | `pathEnrollments` sin unique en `(userId, pathSlug)` → inscripciones duplicadas. | `uniqueIndex`. |
| **DATA-05** | 🟡 | `lib/schema.ts` (timestamps) | `timestamp` sin timezone → desfases con Neon/usuarios en distintas TZ. | `timestamp(..., { withTimezone: true })`. |
| **DATA-11** | 🟡 | `lib/schema.ts:64,72` | `frameworkSlug`/`pathSlug` texto libre sin integridad referencial (contenido en archivos) → filas huérfanas al renombrar slugs. | Job de validación slug↔archivo o mover catálogo a tabla. |
| **SEC-10** | 🟠 | `scripts/seed-master.ts` · `convert-content.ts` | Identidad de admin fija y predecible; `convert-content` depende del layout local del autor (`cwd/..`, filtros heurísticos) y sobrescribe los 117 MDX sin backup. | Parametrizar por env; filtros por allowlist; confirmar antes de sobrescribir. |

### 3.5 Frontend, calidad, CI y observabilidad 🟠

| ID | Sev | Ubicación | Brecha | Remediación |
|----|-----|-----------|--------|-------------|
| **QUAL-02** | 🟠 | (ausente) | 0 tests, sin runner (ni Vitest/Jest/Playwright), sin script `test`. Lógica crítica (tier, webhooks, progreso) sin cobertura. | Vitest + RTL (unit/integración) + Playwright (e2e de flujos críticos). |
| **QUAL-01** | 🟠 | (ausente `.github/`) | Sin CI. Deploy directo a `main` por integración Vercel, sin `lint`/`typecheck`/`build`/`test` previos. | `ci.yml` con gate completo + branch protection; añadir script `typecheck`. |
| **OBS-01** | 🟠 | 6 rutas API + `stripe/webhook:15` | Sin Sentry, sin logger estructurado, sin analytics. El `catch {}` del webhook Stripe **no loggea** → fallos silenciosos. | Sentry (`instrumentation.ts`+`onRequestError`), pino, loggear el catch, `@vercel/analytics`. |
| **OBS-02** | 🟠 | (ausente) | Sin `/api/health` para readiness/liveness. | Endpoint que verifique conexión a Neon. |
| **UI-01** | 🟠 | (ausente) | Sin `global-error.tsx`/`not-found.tsx`/`error.tsx`/`loading.tsx`. Un fallo de `db.query` en dashboard crashea sin recuperación; segmentos async sin skeleton. | Añadir boundaries y estados de carga por segmento. |
| **UI-02** | 🟠 | `MarkCompleteButton.tsx:16-23` | Marca `completed=true` aunque el `fetch` falle o devuelva 4xx/5xx. | Comprobar `res.ok`, revertir estado, toast de error. |
| **SEC-11** | 🟠 | `next.config.ts:3-10` · `vercel.json` | Sin `headers()`: faltan CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`. | `async headers()` en `next.config.ts` (CSP con nonce si se usa `dangerouslySetInnerHTML`). |
| **SEO-01** | 🟠 | `app/layout.tsx:31` · `robots.ts:9` · `sitemap.ts:6` | `metadataBase`/robots/sitemap hardcodean `https://meo.com`, pero prod es `meo-steel.vercel.app` → canonicals/OG/sitemap rotos. | Derivar de `NEXT_PUBLIC_SITE_URL`. |
| **SEO-02** | 🟡 | `app/layout.tsx:24-32` · `learn/[slug]` | Sin `openGraph`/`twitter`/`opengraph-image`, sin `alternates.canonical`; JSON-LD solo en home. | Añadir OG/Twitter/canonical; structured data `Course` en detalle. |
| **FE-01** | 🟡 | `aprender/page.tsx:19-21` · `curso/page.tsx:41` | 117 `FrameworkCard` client con Framer Motion cada uno → sobrecarga de JS/hidratación. `fade-in-up` ya existe en `globals.css:38` sin usar. | Animación CSS o virtualización; reducir `'use client'`. |
| **FE-02** | 🟡 | `app/(dashboard)/progreso/page.tsx:3-16` | Feature documentada pero es **stub estático** — no lee la tabla `progress` (que sí se usa en `dashboard/page.tsx`). | Implementar lectura real del progreso. |
| **FE-03** | 🟡 | `mi-ruta/page.tsx:15-26` · `FrameworkCard`/`TierGate` | Duplicación: card de ruta reimplementada; `TIER_LABELS` duplicado; `signOut` repetido. | Centralizar en `lib/`/componentes reutilizables. |
| **A11Y-01** | 🟡 | `ProgressRing.tsx` · íconos lucide · emojis | SVG sin `role="img"`/`aria-label`; íconos decorativos sin `aria-hidden`; emojis semánticos sin alt; grises `text-gray-400` probablemente < WCAG AA. | Etiquetar SVG, `aria-hidden` en decorativos, revisar contraste. |
| **QUAL-03** | 🟡 | `tsconfig.json:3` · `eslint.config.mjs` | `target: ES2017` antiguo; faltan `noUncheckedIndexedAccess` etc.; ESLint mínimo; sin pre-commit. | `ES2022`+flags estrictos; reglas ESLint; husky+lint-staged. |
| **FE-04** | 🟡 | `next.config.ts:4-9` · `Sidebar.tsx:45-46` | `remotePatterns` configurado pero **ningún `<Image>`** se usa (avatar es inicial de texto). Config muerta o feature incompleta. | Usar `next/image` para avatares o retirar config; añadir `formats: [avif, webp]`. |

---

## 4. Apéndices

### 4.1 Patrones de brecha transversales (causas raíz)

1. **Gating cosmético** — la autorización vive en el cliente (ocultar enlaces) en lugar del servidor. Afecta AUTH-01, AUTH-03, DATA-06/07, DATA-10.
2. **Fail-open** — la ausencia de configuración desactiva la seguridad (`if (!secret) return true`). Afecta PAY-01, PAY-02.
3. **Fallos silenciosos** — `catch {}` sin log, webhooks que descartan pagos sin userId, `MarkCompleteButton` que ignora errores de red. Afecta OBS-01, PAY-09/10, UI-02.
4. **Confianza en el JWT como fuente de verdad mutable** — tier/rol firmados no se refrescan ni revocan. Afecta AUTH-02, AUTH-04.
5. **Sin red de seguridad** — cero tests, cero CI, cero observabilidad significa que las regresiones llegan a producción sin filtro. Afecta QUAL-01/02, OBS-01/02.

### 4.2 Tabla maestra de hallazgos por severidad

**🔴 Críticos (6):** AUTH-01, AUTH-02, PAY-01, PAY-02, PAY-06, PAY-09, SEC-08, CONTENT-01, DATA-07
_(nota: CONTENT-01 es crítico por rendimiento/DoS; el resto por seguridad/ingresos)_

**🟠 Altos (~20):** SEC-04, SEC-05, SEC-10, SEC-11, AUTH-04, PAY-03, PAY-04, PAY-05, PAY-10, PAY-11, PAY-12, PAY-13, DATA-01, DATA-02, DATA-03, DATA-08, DATA-09, CONTENT-02, CONTENT-03, QUAL-01, QUAL-02, OBS-01, OBS-02, UI-01, UI-02, SEO-01

**🟡 Medios / 🟢 Bajos:** SEC-06, SEC-07, SEC-09, SEC-12, AUTH-05, PAY-14..18, DATA-04, DATA-05, DATA-11, SEO-02, FE-01..04, A11Y-01, QUAL-03

### 4.3 Verificación realizada

**Diagnóstico:**
- ✅ `AUTH-01` — leído `app/learn/[slug]/page.tsx` completo: confirmado, sin gate de tier.
- ✅ `PAY-01` — leído `app/api/mercadopago/webhook/route.ts`: confirmado `if (!secret) return true` (línea 7).
- ⚠️ El resto de hallazgos provienen de análisis de código citado con `archivo:línea`; conviene reconfirmar los de pagos (`lib/stripe.ts`, `lib/paypal.ts`) antes de refactorizar, ya que dependen del comportamiento exacto de cada SDK.

**Correcciones P0 (2026-07-02):**
- ✅ `npm install` — exit 0.
- ✅ `tsc --noEmit` — exit 0, sin errores de tipos.
- ✅ `next build` — exit 0. `/learn/[slug]` pasó de estático a **`ƒ` (Dynamic)**, confirmando que el gate se evalúa por request.
- ⚠️ Warning pre-existente (no relacionado): hay dos lockfiles (`documents/bun.lock` y `meo-platform/package-lock.json`); Next infiere mal la raíz del workspace. Conviene fijar `turbopack.root` o eliminar el lockfile sobrante.
- ⏳ **Pendiente manual:** rotar la contraseña de admin ya expuesta en el historial de git (SEC-08 solo la retiró del código actual).

**Hallazgos del security review del commit (2026-07-02, atendidos):**
- ✅ **MP idempotencia — colisión de fallback:** se eliminó el fallback a `data.id` (el id del preapproval es estable entre eventos y colapsaba notificaciones distintas). Ahora solo se deduplica por id de notificación; sin él, se procesa.
- ✅ **Account-lockout DoS en login:** el rate limit pasó de clave por email a clave por IP (evita que un tercero bloquee una cuenta ajena).
- 🟡 **IP spoofing / bypass del limitador:** acotado. `x-forwarded-for` es manipulable; el limitador en memoria es defensa interina. Mitigación completa = SEC-04 con Upstash + IP de confianza (diferido).

**Correcciones P1/P2 (2026-07-02, segundo lote):**
- ✅ `vitest run` — 10/10 tests en verde.
- ✅ `tsc --noEmit` — exit 0.
- ✅ `eslint .` — 0 errores (15 warnings de deuda `no-explicit-any`).
- ✅ `next build` — exit 0.
- ⏳ **Pendiente manual:** aplicar la migración `drizzle/0003_gap_analysis.sql` (ver aviso arriba) y activar branch protection en `main`.

### 4.4 Notas de plataforma

- **Next.js 16** tiene breaking changes (ver `AGENTS.md`): `middleware.ts` → `proxy.ts`, `params` es `Promise`. No asumir APIs de versiones anteriores; consultar `node_modules/next/dist/docs/` antes de tocar routing/config.
- **NextAuth v5** usa `AUTH_*` (no `NEXTAUTH_*`) por convención — ver SEC-12.
- **Neon HTTP** (serverless): las transacciones multi-statement tienen limitaciones; validar que el upsert atómico de DATA-08 funcione sobre el driver HTTP o usar el driver de sesión.

---

_Documento generado como base de continuación. Actualiza las casillas del §2 a medida que cierres hallazgos y añade nuevos con IDs consecutivos por dominio._
