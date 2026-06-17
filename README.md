# MEO — Marketing Engine Optimization Platform

Plataforma de aprendizaje para profesionales de marketing digital. Contiene **117 frameworks de marketing** organizados en **6 rutas de aprendizaje** con modelo freemium y tres niveles de acceso.

**Producción:** https://meo-steel.vercel.app  
**Repositorio:** https://github.com/Coorops25/MEO

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.6 (App Router + Turbopack) |
| Lenguaje | TypeScript 5 |
| Autenticación | NextAuth v5 (beta.31) — JWT strategy + Credentials provider |
| Base de datos | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM 0.45 |
| Estilos | Tailwind CSS v4 |
| Animaciones | Framer Motion 12 |
| Email | Resend (magic links) |
| Pagos | Stripe · MercadoPago · PayPal |
| Contenido | MDX (117 archivos) + JSON (6 rutas) |
| Deploy | Vercel (región iad1) |

---

## Estructura del proyecto

```
meo-platform/
├── app/
│   ├── (auth)/                     # Rutas de autenticación (layout propio)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (dashboard)/                # Rutas protegidas de usuario (layout propio)
│   │   ├── dashboard/page.tsx
│   │   ├── aprender/page.tsx
│   │   ├── mi-ruta/page.tsx
│   │   └── progreso/page.tsx
│   ├── (marketing)/                # Páginas públicas (layout propio)
│   │   ├── page.tsx                # Home
│   │   ├── curso/page.tsx          # Catálogo de frameworks
│   │   └── precios/page.tsx        # Página de precios
│   ├── admin/
│   │   ├── layout.tsx              # Guard de rol admin (server-side)
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── progress/route.ts
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts
│   │   │   └── webhook/route.ts
│   │   ├── mercadopago/
│   │   │   ├── checkout/route.ts
│   │   │   └── webhook/route.ts
│   │   └── paypal/
│   │       ├── checkout/route.ts
│   │       └── webhook/route.ts
│   ├── learn/
│   │   ├── [slug]/page.tsx         # Detalle de framework (MDX)
│   │   └── ruta/[slug]/page.tsx    # Detalle de ruta de aprendizaje
│   ├── layout.tsx                  # Root layout (Providers + fonts)
│   ├── globals.css
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── layout/
│   │   ├── Providers.tsx           # SessionProvider (client)
│   │   ├── Header.tsx              # Nav fija (client)
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   └── Sidebar.tsx             # Nav lateral autenticada (client)
│   ├── marketing/
│   │   ├── Hero.tsx                # Hero animado (client)
│   │   ├── PathsShowcase.tsx       # Grid de rutas (client)
│   │   └── PricingCard.tsx         # Tarjeta de precio (client)
│   └── ui/
│       ├── FrameworkCard.tsx       # Tarjeta de framework con tier/lock (client)
│       ├── TierGate.tsx            # Bloqueo de contenido por tier (client)
│       ├── ProgressRing.tsx        # SVG circular de progreso
│       └── MarkCompleteButton.tsx  # Botón completar framework (client)
├── lib/
│   ├── schema.ts                   # Esquema Drizzle ORM (PostgreSQL)
│   ├── db.ts                       # Conexión Neon HTTP
│   ├── auth.ts                     # Config NextAuth completa (server-only)
│   ├── content.ts                  # Carga MDX y JSON de contenido
│   ├── utils.ts                    # cn() helper Tailwind
│   ├── stripe.ts                   # Stripe checkout + webhook handler
│   ├── mercadopago.ts              # MercadoPago suscripciones
│   └── paypal.ts                   # PayPal suscripciones
├── types/
│   └── next-auth.d.ts              # Augmentación de tipos Session/User
├── content/
│   ├── frameworks/                 # 117 archivos MDX (#001–#117)
│   └── paths/                      # 6 archivos JSON de rutas
├── scripts/
│   └── convert-content.ts          # Convierte texto plano a MDX
├── auth.config.ts                  # Config NextAuth edge-safe (sin imports DB)
├── proxy.ts                        # Auth proxy / middleware (Next.js 16)
├── next.config.ts
├── drizzle.config.ts
├── vercel.json
└── package.json
```

---

## Base de datos

### Tablas (Drizzle ORM — PostgreSQL)

#### `users`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | text (UUID) | PK, `crypto.randomUUID()` |
| name | text | |
| email | text | UNIQUE NOT NULL |
| emailVerified | timestamp | NextAuth email verification |
| passwordHash | text | bcrypt hash (credenciales) |
| image | text | URL foto de perfil |
| stripeCustomerId | text | Para Stripe Billing |
| tier | text | `"free"` · `"pro"` · `"agency"` · default `"free"` |
| role | text | `"user"` · `"admin"` · default `"user"` |
| createdAt | timestamp | default `NOW()` |

#### `accounts`
OAuth accounts vinculadas. PK compuesto `(provider, providerAccountId)`. Cascade delete desde `users`.

#### `sessions`
Sesiones de NextAuth (usadas por el adapter; la verificación usa JWT). Cascade delete desde `users`.

#### `verificationTokens`
Tokens de magic link. PK compuesto `(identifier, token)`.

#### `subscriptions`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | text (UUID) | PK |
| userId | text | FK → users.id (cascade) |
| stripeSubscriptionId | text | UNIQUE |
| stripePriceId | text | |
| status | text | Estado Stripe |
| tier | text | `"pro"` · `"agency"` |
| currentPeriodEnd | timestamp | |
| createdAt | timestamp | |

#### `progress`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | text (UUID) | PK |
| userId | text | FK → users.id (cascade) |
| frameworkSlug | text | Slug del framework completado |
| completedAt | timestamp | |
| timeSpentSeconds | integer | default 0 |

#### `pathEnrollments`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | text (UUID) | PK |
| userId | text | FK → users.id (cascade) |
| pathSlug | text | Slug de la ruta |
| startedAt | timestamp | |
| completedAt | timestamp | nullable |

### Ejecutar migraciones

```bash
# Aplicar schema a Neon (pushes schema directamente, sin archivos de migración)
DATABASE_URL="..." npx drizzle-kit push

# Explorar la BD con Drizzle Studio
DATABASE_URL="..." npx drizzle-kit studio
```

---

## Autenticación

### Arquitectura split-config (requerida por Next.js 16)

Next.js 16 ejecuta `proxy.ts` en el runtime de Node.js. Para que NextAuth funcione correctamente, la configuración está dividida en dos archivos:

**`auth.config.ts`** — sin imports de base de datos, usado por el proxy:
```typescript
export const authConfig = {
  providers: [],          // vacío: sin imports de providers aquí
  session: { strategy: "jwt" },
  pages: { signIn: "/login", newUser: "/onboarding" },
  callbacks: { jwt, session }   // solo mapea token.id/tier/role
}
```

**`lib/auth.ts`** — configuración completa, solo en server:
```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Google(...), Resend(...)],
  adapter: DrizzleAdapter(db, { ... }),
  callbacks: {
    async jwt({ token, user }) {
      // Solo hace query a DB en el primer login (when user exists)
      if (user) {
        const dbUser = await db.query.users.findFirst(...);
        token.tier = dbUser?.tier ?? "free";
        token.role = dbUser?.role ?? "user";
      }
      return token;
    }
  }
})
```

**Por qué JWT y no database sessions:** Con `DrizzleAdapter`, NextAuth usa sesiones en DB por defecto. El proxy no puede verificar esas sesiones sin acceso a DB. La estrategia JWT permite que el proxy valide el token localmente usando solo `AUTH_SECRET`.

### Flujo de login

```
Usuario → /login
  ├── Credentials (email + password) → JWT → /dashboard
  ├── Google OAuth → callback → /onboarding o /dashboard
  └── Email (Resend) → magic link → /login?token=... → /dashboard

/onboarding → elige perfil → redirect /dashboard?path={slug}
```

### Providers configurados

| Provider | Variables requeridas |
|----------|---------------------|
| Credentials (email + password) | Ninguna (usa `AUTH_SECRET` para JWT) |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Resend (magic link) | `RESEND_API_KEY` |

Los providers que no tengan sus variables de entorno configuradas se omiten automáticamente. Solo Credentials está siempre activo.

**Google OAuth — configurar redirect URI:**
En Google Cloud Console → Credentials → OAuth 2.0 Client, agregar:
```
https://meo-steel.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google  (desarrollo)
```

---

## Proxy / Middleware (`proxy.ts`)

Next.js 16 renombró `middleware.ts` → `proxy.ts`. El archivo controla el acceso a todas las rutas:

```typescript
const PUBLIC_PATHS = ["/", "/curso", "/precios", "/login", "/register"];

// Reglas:
// 1. Rutas públicas y webhooks → pasan sin autenticación
// 2. Sin sesión → redirect /login?callbackUrl={path}
// 3. Ruta /admin + role !== "admin" → redirect /dashboard
// 4. Resto → pasan (usuario autenticado)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts|robots\\.txt|sitemap\\.xml).*)"]
}
```

**Seguridad en capas:** El check de admin en el proxy es defense-in-depth. `app/admin/layout.tsx` también hace una verificación server-side independiente.

---

## Tiers de acceso

| Tier | Precio | Frameworks | Funcionalidades |
|------|--------|-----------|----------------|
| Explorer (free) | $0/mes | 8 (core) | Contenido introductorio |
| Practitioner (pro) | $29/mes | 117 | 6 rutas · quizzes · certificados · tracking |
| Orchestrator (agency) | $79/mes | 117 | Todo lo anterior + 20 planes sectoriales · PDFs · templates · soporte prioritario |

Los frameworks se asignan por tier en el frontmatter MDX:
- Frameworks #001–#008: `tier: "free"`
- Frameworks #009–#080: `tier: "pro"`
- Frameworks #081–#117: `tier: "agency"`

---

## Rutas y páginas

### Públicas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/(marketing)/page.tsx` | Landing: hero, 8 frameworks, 6 rutas, stats, Schema.org |
| `/curso` | `app/(marketing)/curso/page.tsx` | Catálogo completo de 117 frameworks por categoría |
| `/precios` | `app/(marketing)/precios/page.tsx` | Pricing con selector Stripe/MercadoPago/PayPal |
| `/login` | `app/(auth)/login/page.tsx` | Login Google + magic link |
| `/register` | `app/(auth)/register/page.tsx` | Registro Google + magic link |
| `/learn/[slug]` | `app/learn/[slug]/page.tsx` | Detalle framework (MDXRemote + TierGate) |
| `/learn/ruta/[slug]` | `app/learn/ruta/[slug]/page.tsx` | Detalle ruta de aprendizaje |
| `/robots.txt` | `app/robots.ts` | Auto-generado por Next.js |
| `/sitemap.xml` | `app/sitemap.ts` | 117 frameworks + 6 rutas + core pages |

### Protegidas (requieren sesión)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/onboarding` | `app/(auth)/onboarding/page.tsx` | Selección de perfil tras primer login |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Panel principal, stats, primeros frameworks |
| `/aprender` | `app/(dashboard)/aprender/page.tsx` | Los 117 frameworks con tier gating |
| `/mi-ruta` | `app/(dashboard)/mi-ruta/page.tsx` | Las 6 rutas de aprendizaje |
| `/progreso` | `app/(dashboard)/progreso/page.tsx` | Historial de progreso |

### Admin (requieren `role === "admin"`)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/admin` | `app/admin/page.tsx` | Panel admin: usuarios, métricas, contenido |

---

## API Routes

### `POST /api/auth/register`
Registra un nuevo usuario con email y contraseña.

**Auth:** Pública.

**Body:**
```json
{ "email": "user@email.com", "password": "min6chars", "name": "Opcional" }
```

**Response:** `{ "success": true }`

**Errors:** `400` (faltan campos), `409` (email ya registrado), `500` (error interno).

---

### `POST /api/progress`
Registra un framework como completado.

**Auth:** Sesión JWT requerida.

**Body:**
```json
{ "frameworkSlug": "seo-search-engine-optimization", "timeSpentSeconds": 120 }
```

**Response:**
```json
{ "success": true }
```

---

### `POST /api/stripe/checkout`
Crea una sesión de checkout en Stripe.

**Auth:** Sesión JWT requerida.

**Body:**
```json
{ "priceId": "price_1234..." }
```

**Response:**
```json
{ "url": "https://checkout.stripe.com/pay/..." }
```

---

### `POST /api/stripe/webhook`
Recibe eventos de Stripe. Validado con `STRIPE_WEBHOOK_SECRET`.

**Eventos manejados:**
- `checkout.session.completed` → actualiza tier del usuario
- `customer.subscription.updated` → actualiza tier
- `customer.subscription.deleted` → revierte a tier `"free"`

---

### `POST /api/mercadopago/checkout`
Crea suscripción en MercadoPago.

**Body:** `{ "tier": "pro" | "agency" }`

**Response:** `{ "url": "https://www.mercadopago.com/checkout/..." }`

---

### `POST /api/mercadopago/webhook`
Recibe eventos de MercadoPago.

**Body:** `{ "type": "preapproval", "data": { "id": "preapprovalId" } }`

---

### `POST /api/paypal/checkout`
Crea suscripción en PayPal.

**Body:** `{ "tier": "pro" | "agency" }`

**Response:** `{ "url": "https://www.paypal.com/checkoutnow?token=..." }`

---

### `POST /api/paypal/webhook`
Recibe eventos de PayPal.

**Eventos:** `BILLING.SUBSCRIPTION.ACTIVATED` · `CANCELLED` · `SUSPENDED` · `EXPIRED`

---

## Contenido (MDX + JSON)

### Frameworks — `content/frameworks/`

117 archivos MDX. Estructura del frontmatter:

```yaml
---
title: "SEO - Search Engine Optimization"
number: 1
slug: "seo-search-engine-optimization"
category: "core-meo"          # core-meo | estrategico | emergente | especializado | complementario | clasico | avanzado
tier: "free"                  # free | pro | agency
estimatedMinutes: 45
paths: ["seo-total", "agencias", "enterprise"]
---
```

Las funciones de acceso están en `lib/content.ts`:
- `getAllFrameworks()` → `FrameworkMeta[]`
- `getFrameworkBySlug(slug)` → `FrameworkFull | null`

### Rutas de aprendizaje — `content/paths/`

6 archivos JSON:

| Archivo | Slug | Descripción |
|---------|------|-------------|
| `seo-total.json` | `seo-total` | Domina todos los frameworks de posicionamiento orgánico |
| `agencias.json` | `agencias` | Stack completo para agencias de marketing |
| `enterprise.json` | `enterprise` | Frameworks para marketing corporativo a escala |
| `ecommerce.json` | `ecommerce` | Optimización de conversión y retención en e-commerce |
| `startups.json` | `startups` | Growth frameworks para startups en etapa temprana |
| `ia-futuro.json` | `ia-futuro` | IA aplicada al marketing: GEO, AEO, AIO |

Estructura JSON:
```json
{
  "slug": "seo-total",
  "name": "Ruta SEO Total",
  "description": "...",
  "audience": "Profesionales SEO, content strategists",
  "color": "from-violet-600 to-cyan-500",
  "frameworks": ["seo-search-engine-optimization", "..."]
}
```

---

## Variables de entorno

### Requeridas para producción

```env
# Base de datos
DATABASE_URL=postgresql://...@neon.tech/neondb?sslmode=require

# NextAuth
NEXTAUTH_URL=https://meo-steel.vercel.app
AUTH_SECRET=<string aleatorio 32+ chars, generar con: openssl rand -base64 32>

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (Resend)
RESEND_API_KEY=re_...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_AGENCY=price_...

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_PLAN_PRO=<plan_id>
MERCADOPAGO_PLAN_AGENCY=<plan_id>

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_PLAN_PRO=<plan_id>
PAYPAL_PLAN_AGENCY=<plan_id>
PAYPAL_MODE=live
```

### Gestionar en Vercel

```bash
vercel env add NOMBRE_VARIABLE production
vercel env ls
vercel env pull .env.local     # Descarga al entorno local
```

---

## Desarrollo local

### Requisitos previos
- Node.js 20+
- npm 10+
- Cuenta Neon PostgreSQL

### Setup

```bash
# Clonar repositorio
git clone https://github.com/Coorops25/MEO.git
cd meo-platform

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Aplicar schema a la base de datos
npx drizzle-kit push

# Iniciar servidor de desarrollo
npm run dev
```

Abre http://localhost:3000.

### Credenciales del admin

| Campo | Valor |
|-------|-------|
| Email | `master871017@meo.com` |
| Contraseña | `Admin123!` |
| Rol | `admin` |
| Tier | `agency` (acceso completo a 117 frameworks) |

### Scripts de utilidad

| Script | Propósito |
|--------|-----------|
| `scripts/set-password.ts` | Setea password_hash para un usuario existente |
| `scripts/seed-master.ts` | Crea el usuario master con tier=agency, role=admin |
| `scripts/apply-migration-0002.ts` | Aplica migración `password_hash` a Neon |

```bash
# Setear/actualizar contraseña del master
npx tsx scripts/set-password.ts

# Sembrar usuario master (si no existe)
npx tsx scripts/seed-master.ts

# Aplicar migración 0002 (columna password_hash)
npx tsx scripts/apply-migration-0002.ts
```

### Crear usuario admin (primera vez)

```bash
node --input-type=module <<'EOF'
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
await sql`
  INSERT INTO users (id, name, email, tier, role, created_at)
  VALUES (gen_random_uuid(), 'Admin', 'tu@email.com', 'agency', 'admin', NOW())
  ON CONFLICT (email) DO UPDATE SET role = 'admin', tier = 'agency'
`;
console.log("Usuario admin creado");
EOF
```

### Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo con Turbopack
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run lint       # ESLint
npx drizzle-kit push     # Sincronizar schema con Neon
npx drizzle-kit studio   # UI visual de la BD
```

---

## Despliegue (Vercel)

### Auto-deploy
El proyecto tiene Git integration con Vercel. Cada push a `main` dispara un deploy de producción automáticamente.

### Deploy manual
```bash
npm install -g vercel
vercel login
vercel link                    # Primera vez: vincular proyecto
vercel --prod                  # Deploy a producción
```

### Configuración en Vercel (`vercel.json`)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "regions": ["iad1"]
}
```

### Webhooks de pago — configurar en cada plataforma

**Stripe:** Dashboard → Developers → Webhooks → Add endpoint  
URL: `https://meo-steel.vercel.app/api/stripe/webhook`  
Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

**MercadoPago:** Panel → Notificaciones → Webhooks  
URL: `https://meo-steel.vercel.app/api/mercadopago/webhook`

**PayPal:** Developer Dashboard → My Apps → Webhooks  
URL: `https://meo-steel.vercel.app/api/paypal/webhook`

---

## Flujos principales

### Flujo de suscripción

```
Usuario en /precios
  → selecciona tier + proveedor
  → POST /api/{stripe|mercadopago|paypal}/checkout
  → redirect a checkout del proveedor
  → pago exitoso
  → webhook → handleSubscriptionUpsert
  → UPDATE users SET tier = 'pro'|'agency'
  → próximo request: JWT se refresca con nuevo tier
```

### Flujo de aprendizaje

```
Usuario en /curso → elige framework
  → /learn/{slug}
  → getFrameworkBySlug(slug) carga MDX
  → si tier insuficiente: TierGate bloquea contenido → link a /precios
  → si tier ok: MDXRemote renderiza contenido
  → usuario hace clic "Marcar completado"
  → POST /api/progress { frameworkSlug, timeSpentSeconds }
  → INSERT en tabla progress
  → botón muestra checkmark
```

---

## Arquitectura de componentes

```
app/layout.tsx
└── Providers (SessionProvider)
    ├── (marketing)/layout.tsx
    │   ├── Header
    │   └── Footer
    ├── (dashboard)/layout.tsx
    │   └── Sidebar
    └── (auth)/layout.tsx
```

### Convenciones

- **`"use client"`** — solo en componentes con state, event handlers, o hooks de React
- **Server Components** — todos los demás (fetching de datos directamente)
- **Layouts con grupos** `(marketing)`, `(dashboard)`, `(auth)` — aíslan navegación y layouts sin afectar la URL

---

## SEO

### Sitemap generado dinámicamente

`app/sitemap.ts` genera URLs para:
- Homepage (priority: 1.0)
- /curso (priority: 0.9)
- /precios (priority: 0.8)
- 117 frameworks: `free` → priority 0.9, `pro`/`agency` → priority 0.7
- 6 rutas de aprendizaje (priority: 0.8)

### robots.txt

```
User-Agent: *
Allow: /
Disallow: /dashboard
Disallow: /admin
Disallow: /api/
Sitemap: https://meo.com/sitemap.xml
```

### Schema.org

La homepage incluye JSON-LD de tipo `Course` con offers para los tres tiers.

---

## Módulo de conversión de contenido

`scripts/convert-content.ts` convierte archivos de texto plano al formato MDX:

```bash
npx tsx scripts/convert-content.ts
```

- Lee archivos de texto fuente desde el directorio padre
- Detecta secciones con headers `## #N: Título`
- Asigna tier automáticamente: #1–8 → free, #9–80 → pro, #81–117 → agency
- Genera frontmatter YAML con metadatos completos
- Escribe 117 archivos `.mdx` en `content/frameworks/`
