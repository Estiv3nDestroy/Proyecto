/**
 * ============================================================================
 *  Service Worker de NotaMínima
 * ============================================================================
 * Estrategia:
 *  - Navegaciones (HTML): "network first" con respaldo en caché. Así el
 *    estudiante siempre ve la última versión, pero la app sigue abriendo
 *    aunque esté sin internet (por ejemplo, en el salón sin señal).
 *  - Recursos estáticos: "stale while revalidate" para arranque instantáneo.
 *  - Peticiones a Supabase: nunca se cachean (siempre datos frescos).
 */

const CACHE_NAME = "notaminima-v1";
const PRECACHE_URLS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.svg", "./icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo gestionamos peticiones GET del mismo origen.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase, Google Fonts, etc.

  // Navegación: red primero, caché como respaldo offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html").then((cached) => cached ?? Response.error())),
    );
    return;
  }

  // Estáticos: responde desde caché y actualiza en segundo plano.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached ?? Response.error());

      return cached ?? network;
    }),
  );
});
