# Analisis de Usuarios y Contenido - Brechas y Pendientes

> Fecha: 2026-07-03
> Proyecto: `meo-platform`
> Alcance: revision puntual de las areas de usuarios, autenticacion, admin y contenido.

## Resumen

La base quedo bastante mejor que en la revision inicial:

- El acceso al contenido premium ya se protege server-side en `app/learn/[slug]/page.tsx`.
- El contenido ya no se expone por `generateStaticParams` ni por `sitemap` cuando es premium.
- La carga de frameworks ya no hace N+1 de filesystem; ahora hay cache en memoria por instancia.
- El endpoint de progreso ya valida acceso por tier antes de escribir.

Siguen abiertas brechas concretas en el dominio de usuarios y en la validacion estructural del contenido. Ninguna de las de abajo requiere reinterpretar el estado del repo: todas salen del codigo actual.

## Usuarios

### U-01 - Enumeracion de usuarios en registro

- Severidad: alta
- Evidencia: `app/api/auth/register/route.ts:33-38`
- Hallazgo: el registro responde `409` con el mensaje `Este email ya esta registrado.` cuando el correo existe. Eso permite confirmar cuentas validas desde fuera.
- Impacto: facilita password spraying, phishing dirigido y mapeo de usuarios.
- Pendiente: responder con mensaje generico y costo temporal equivalente, igual que ya se hizo en login.

### U-02 - Verificacion de email marcada sin prueba real

- Severidad: alta
- Evidencia: `app/api/auth/register/route.ts:42-47`
- Hallazgo: el alta por credenciales inserta `emailVerified: new Date()` en el momento del registro.
- Impacto: cualquier persona puede registrar un correo ajeno y queda tratado como verificado.
- Pendiente: dejar `emailVerified` en `null` y agregar flujo real de confirmacion.

### U-03 - Panel admin muestra metricas incompletas o truncadas

- Severidad: media
- Evidencia: `app/admin/page.tsx:11-19`
- Hallazgo: `users.findMany(... limit: 50)` se usa tambien para calcular `totalUsers`, asi que el KPI nunca supera 50 aunque existan mas registros.
- Impacto: el panel subreporta usuarios y puede inducir decisiones operativas incorrectas.
- Pendiente: separar el listado paginado del conteo real con `count(*)`.

### U-04 - Conteo de progreso cargado de forma ineficiente

- Severidad: media
- Evidencia: `app/admin/page.tsx:11-19`
- Hallazgo: `db.select({ count: progress.id }).from(progress)` seguido de `progressCount.length` cuenta filas trayendo todas, no con agregacion real.
- Impacto: el panel admin escala mal a medida que crece `progress`.
- Pendiente: reemplazar por agregacion SQL real.

## Contenido

### C-01 - Validacion incompleta del frontmatter de frameworks

- Severidad: media
- Evidencia: `lib/content.ts:42-69`
- Hallazgo: solo se valida `slug`, `title` y `tier`. Si `number`, `estimatedMinutes` o `paths` llegan mal, el loader los degrada a `0` o hace cast laxo.
- Impacto: se pueden publicar frameworks con orden roto, tiempos falsos o rutas inconsistentes sin fallar el build.
- Pendiente: validar el schema completo del frontmatter y rechazar archivos invalidos en lugar de corregirlos silenciosamente.

### C-02 - Sin deteccion runtime de colisiones de `slug` o `number`

- Severidad: media
- Evidencia: `lib/content.ts:98-100`
- Hallazgo: el mapa `frameworksBySlug` pisa silenciosamente la entrada anterior si dos MDX comparten `slug`; tampoco hay guardas para `number` duplicado.
- Impacto: un archivo puede ocultar a otro y producir contenido incorrecto sin error claro en runtime.
- Pendiente: detectar duplicados al cargar contenido y fallar de forma explicita.

### C-03 - Validacion debil de learning paths

- Severidad: media
- Evidencia: `lib/content.ts:141-151`
- Hallazgo: para los JSON de `content/paths` solo se valida que exista `slug`. `name`, `description`, `audience`, `color` y el tipo de `frameworks` no se validan realmente.
- Impacto: una ruta malformada puede romper UI o dejar datos basura visibles sin ser descartada.
- Pendiente: validar el schema completo de `LearningPath`.

### C-04 - Cobertura de tests de contenido aun incompleta para casos invalidos

- Severidad: baja
- Evidencia: `tests/content.test.ts:11-119`
- Hallazgo: hay buena cobertura del catalogo actual, unicidad y referencias, pero no hay pruebas para archivos corruptos, frontmatter invalido, colisiones ni rechazo de paths mal formados.
- Impacto: futuras regresiones del loader pueden entrar sin alarma si el contenido "feliz" sigue pasando.
- Pendiente: agregar fixtures invalidos y tests negativos del loader.

## Cerrado en esta revision

- `app/learn/[slug]/page.tsx` ya hace gate server-side y no emite MDX premium a usuarios sin acceso.
- `app/sitemap.ts` ya excluye frameworks premium.
- `lib/content.ts` ya cachea frameworks y paths por modulo.
- `app/api/progress/route.ts` ya valida existencia del framework y acceso por tier.

## Pendientes sugeridos

1. Corregir primero `U-01` y `U-02`; son las brechas mas claras del flujo de usuarios.
2. Corregir `U-03` y `U-04` junto con una pequena mejora del panel admin para separar KPIs de listados.
3. Endurecer `C-01`, `C-02` y `C-03` con validacion estricta del loader.
4. Ampliar `tests/content.test.ts` con casos negativos para blindar el parser.
