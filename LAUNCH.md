# 🚀 PokéHub · Pre-launch checklist

Este documento es la única lista de verificación entre "el código está listo"
y "puedo decírselo al mundo". Tachándolo todo, la app está al 100%.

## 1. Base de datos (Supabase)

- [ ] Ejecutar [`supabase/migrations/002_team_sharing.sql`](supabase/migrations/002_team_sharing.sql)
      en Supabase SQL Editor (si no se hizo ya).
- [ ] Ejecutar [`supabase/migrations/003_admin_extras.sql`](supabase/migrations/003_admin_extras.sql).
      Crea: `admin_audit_log`, `site_announcements`, columnas `is_featured/featured_at/featured_note` en `teams`.
- [ ] Ejecutar [`supabase/migrations/004_profiles_social.sql`](supabase/migrations/004_profiles_social.sql).
      Crea: `profiles`, `team_likes`, `team_comments`, `notifications`, trigger `handle_new_user`.
- [ ] Verificar en **Table Editor** que las 4 tablas nuevas existen.
- [ ] Activar backups automáticos: **Settings → Database → Point-in-time recovery**.

## 2. Variables de entorno (Vercel)

En **Settings → Environment Variables**, asegúrate de tener (Production + Preview):

- [ ] `NEXT_PUBLIC_SITE_URL` — tu dominio real (`https://pokehub-xxx.vercel.app` o tu dominio)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (sin `NEXT_PUBLIC_`)
- [ ] `NEXT_PUBLIC_ADMIN_EMAILS` (tu email separado por coma si hay varios)
- [ ] `ANTHROPIC_API_KEY` (opcional, solo si quieres `/api/recommend`)

### Opcionales (recomendadas para producción seria)

- [ ] `NEXT_PUBLIC_SENTRY_DSN` — Sentry para tracking de errores cliente
  - Crear cuenta en [sentry.io](https://sentry.io) → New project → Next.js
  - Copia el DSN
  - Opcional: añadir también `SENTRY_AUTH_TOKEN` (Settings → Auth Tokens) para que el build suba source maps
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — rate limit distribuido
  - Crear DB free en [console.upstash.com](https://console.upstash.com)
  - Copia REST URL + Token
  - Sin esto, el rate limit funciona pero es por-instancia (memoria local)

Tras añadirlas, **Redeploy con "Use existing Build Cache" DESACTIVADO**
(las `NEXT_PUBLIC_*` se hornean en build time).

## 3. QA manual por flujo

Abre el sitio publicado en navegador limpio (modo incógnito) y verifica:

### Anónimo (sin login)
- [ ] Landing carga sin errores, Hero visible
- [ ] `/pokedex` lista 1025 Pokémon, búsqueda funciona
- [ ] Click en un Pokémon → detalle carga con stats, evoluciones, contadores
- [ ] `/team-builder` permite añadir 6 Pokémon y guardar (localStorage)
- [ ] `/tools/damage-calc` calcula daños correctamente
- [ ] `/meta` y `/meta/champions` muestran datos reales (Smogon + Pikalytics)
- [ ] `/typemaster/play` permite jugar una partida
- [ ] `/guides` lista las 4 guías; cada guía abre y se ve bien
- [ ] `/community/teams` carga (vacío al principio es OK)

### Idiomas
- [ ] Click banderita 🇪🇸 → dropdown abre con 5 idiomas
- [ ] Click 🇬🇧 EN → URL pasa a `/en/...` y Navbar/Footer/Hero pasan a inglés
- [ ] Recarga la página → idioma se mantiene
- [ ] Click 🇪🇸 ES → vuelve a URL sin prefijo, todo en español
- [ ] `/en/guides` muestra las guías (contenido sigue en ES por ahora — esto es esperado)

### Auth flow
- [ ] `/login` → crear cuenta con email + contraseña
- [ ] Recibes email de confirmación de Supabase
- [ ] Click en el enlace → te lleva a `/` logueado
- [ ] Aparece el **OnboardingModal** con 3 pasos
- [ ] Paso 1: usernames con caracteres inválidos da error
- [ ] Paso 1: username válido pasa al paso 2
- [ ] Paso 2: elegir avatar → click "Siguiente" → paso 3
- [ ] Paso 3: click en cualquier card → modal cierra y va a esa página
- [ ] Aparece el avatar en `UserMenu` (esquina superior derecha)

### Logged in
- [ ] `UserMenu` muestra opciones: Mi perfil, Favoritos, Mis equipos, Stats, Admin (si admin)
- [ ] `/me` carga el editor de perfil con tus datos
- [ ] Editar bio + click "Guardar perfil" → mensaje de éxito
- [ ] `/u/<tu-username>` muestra tu perfil público
- [ ] **Crear y guardar un equipo**: ve a `/team-builder`, añade 6 Pokémon, guarda con nombre.
      Después comprueba en Supabase Table Editor → `teams` → debería aparecer el row
- [ ] Hacer público el equipo → URL `/teams/<slug>` accesible
- [ ] En el equipo público: dar like, dejar comentario
- [ ] Otro user (logueado en otro browser) puede ver el equipo, darle like y comentar
- [ ] Vuelves al primer user → la campana de notificaciones tiene contador rojo
- [ ] Click la campana → ves las notifs, se marcan como leídas

### Admin (solo tu email)
- [ ] `/admin` carga el dashboard con KPIs reales
- [ ] `/admin/users` lista usuarios
- [ ] `/admin/teams` permite despublicar/eliminar
- [ ] `/admin/announcements` permite crear un anuncio activo
- [ ] El anuncio aparece como banner sticky en todas las páginas
- [ ] `/admin/audit` lista las acciones admin recientes
- [ ] `/admin/system` muestra pings a APIs externas y env vars

### Seguridad (try-to-hack)
- [ ] `/login?next=//evil.com` NO redirige a evil.com tras login (queda en `/`)
- [ ] Como user normal NO admin, intenta GET `/api/admin/announcements` → debe devolver 403
- [ ] Spammeando `POST /api/teams/{id}/likes` 50× en 1 min → al 31º debe responder 429
- [ ] Borrar tu cuenta desde `/admin/users` (en otra cuenta de prueba) → cascade elimina sus teams

### Performance
- [ ] PageSpeed Insights (mobile) en la landing → puntuación > 80
- [ ] Lighthouse SEO → > 95
- [ ] Time to Interactive < 3s en una conexión típica

## 4. SEO / pre-indexación

- [ ] `https://tudominio.app/sitemap.xml` carga y tiene URLs de 5 locales
- [ ] `https://tudominio.app/robots.txt` permite crawl
- [ ] Open Graph image carga: `https://tudominio.app/opengraph-image`
- [ ] Pegar tu URL en [opengraph.xyz](https://www.opengraph.xyz/) muestra preview bonito
- [ ] **Google Search Console**: añadir el dominio, verificar propiedad, enviar sitemap

## 5. Ads (cuando llegues a ~500 visitas/día)

- [ ] Solicitar AdSense en [google.com/adsense](https://www.google.com/adsense)
- [ ] Una vez aprobado, añadir slots en:
  - `/community/teams` (banner inline cada N teams)
  - `/guides/[slug]` (banner inline mitad del artículo + banner cierre)
  - `/pokedex/[id]` (banner barra lateral)
  - NUNCA en `/team-builder`, `/tools/*`, `/typemaster/play` (herramientas core)
- [ ] Añadir cookie banner para consentimiento RGPD (CookieYes free tier o similar)
- [ ] Actualizar `/legal` ya menciona AdSense — confirmar que está al día

## 6. Monitorización post-launch

- [x] **Vercel Analytics + Speed Insights** ya wired en código (auto-activa en deploy)
- [x] **Sentry** ya wired — solo necesita el DSN en env vars
- [x] **Upstash rate limit** ya wired con fallback in-memory
- [ ] Revisar `/admin/system` cada semana — los pings a Pikalytics/Smogon deben ser verdes
- [ ] Revisar `/admin/audit` para detectar abusos
- [ ] Backup de la BBDD: Supabase Pro tiene PITR; Free tier tiene snapshot diario

## 7. Tests e2e

```bash
# Instalar el navegador la primera vez (solo dev)
npm run test:e2e:install

# Correr los 25+ tests
npm run test:e2e

# UI mode interactivo (mejor DX)
npm run test:e2e:ui
```

Los tests cubren:
- Landing carga + CTAs + performance
- Locale routing en los 5 idiomas
- Sitemap multilang
- Open redirect blocking + admin gate + API auth
- Navegación a todas las páginas principales
- API endpoints públicos sin auth

## 8. Cosas que YA están bien

- Seguridad fundamental (RLS, auth gates, no secrets expuestos)
- 5 idiomas con locale routing + hreflang
- Rate limiting en endpoints sensibles (likes 30/min, comments 10/min, profile 20/5min, replay 20/5min)
- Sanitización de `?next=` para prevenir open redirects
- Trigger SQL que auto-crea profile al registrarse
- Audit log de toda acción admin
- Sistema de roles admin con 3 capas de seguridad

## 9. Limitaciones conocidas (no-bloqueantes)

- Las 4 guías de SEO solo tienen contenido en español. EN/FR/DE/IT muestran la chrome traducida pero el cuerpo del artículo sigue en español. Mejora futura: añadir field `translations` a cada `Guide`.
- Muchas páginas internas (pokédex/[id], typemaster/*, etc) tienen strings hardcoded en español que en /en/ pages no se traducen. Es trabajo de iteración (~200 strings).
- Rate limiting es in-memory por instancia — al escalar muy fuerte conviene migrar a Upstash Redis con `@upstash/ratelimit`.
- Replay analyzer es V1 — formatos exóticos (Bo3, custom tiers) pueden no parsear bien.
