// PokéHub Service Worker
// Estrategias:
//  - Sprites/artwork de PokéAPI (raw.githubusercontent): cache-first
//    (las imágenes nunca cambian — el ID es estable).
//  - HTML pokédex (/pokedex, /pokedex/*): stale-while-revalidate.
//  - API y resto: network-first (no cache offline para dinámicos).
//
// La estrategia es DEFENSIVA: si algo falla, sirve la respuesta normal de la
// red sin intervenir. No bloqueamos nunca.

const CACHE_NAME = 'pokehub-v1';
const SPRITE_CACHE = 'pokehub-sprites-v1';
const HTML_CACHE = 'pokehub-pages-v1';

// Recursos pre-cacheados al instalar (página offline fallback)
const PRECACHE = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (k) => ![CACHE_NAME, SPRITE_CACHE, HTML_CACHE].includes(k)
          )
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function isSpriteRequest(url) {
  return (
    url.hostname === 'raw.githubusercontent.com' &&
    url.pathname.includes('/PokeAPI/sprites/')
  );
}

function isPokedexPage(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname === '/pokedex' ||
      url.pathname.startsWith('/pokedex/') ||
      url.pathname.match(/^\/(en|fr|de|it)\/pokedex/))
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // Sprites: cache-first (immutable)
  if (isSpriteRequest(url)) {
    event.respondWith(
      caches.open(SPRITE_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          // No cachear errores
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch (e) {
          // Si offline y no está cacheado: devolver placeholder transparente
          return new Response(
            new Blob(
              [Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII='), (c) => c.charCodeAt(0))],
              { type: 'image/png' }
            )
          );
        }
      })
    );
    return;
  }

  // Páginas de la pokédex: stale-while-revalidate
  if (isPokedexPage(url)) {
    event.respondWith(
      caches.open(HTML_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached); // fallback al cache si la red falla
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Resto: passthrough (no interceptamos)
});
