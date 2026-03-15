// ① Pusher Beams PRIMERO — maneja push events y notificationclick
importScripts("https://js.pusher.com/beams/service-worker.js");

// ─── ChambaPe PWA Service Worker v3 ──────────────────────────────────────────
// Estrategias de cache:
//  · _next/static/*   → CacheFirst (inmutables, hash en nombre)
//  · res.cloudinary.com → CacheFirst con TTL de 7 días
//  · navigate (HTML)  → NetworkFirst + fallback /offline
//  · /api/*           → NetworkOnly (nunca cachear datos dinámicos)
//  · Pusher / Clerk   → NetworkOnly (no interceptar)
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_VERSION = "v3";
const STATIC_CACHE  = `chambape-static-${CACHE_VERSION}`;
const IMAGE_CACHE   = `chambape-images-${CACHE_VERSION}`;
const PAGE_CACHE    = `chambape-pages-${CACHE_VERSION}`;
const OFFLINE_URL   = "/offline";

// Recursos pre-cacheados en install (pequeño app shell crítico)
const PRECACHE = [
  OFFLINE_URL,
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ─── Install: pre-cache app shell ────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        cache.addAll(PRECACHE).catch(() => {
          // Si algún recurso falla, no bloqueamos la instalación
          return Promise.resolve();
        })
      )
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: limpiar caches obsoletos ──────────────────────────────────────
self.addEventListener("activate", (event) => {
  const VALID = [STATIC_CACHE, IMAGE_CACHE, PAGE_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !VALID.includes(k)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: estrategias de cache ─────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Nunca interceptar: APIs dinámicas, Pusher, Clerk, HMR
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.hostname.includes("pusher") ||
    url.hostname.includes("clerk") ||
    url.hostname.includes("fonts.googleapis") ||
    url.hostname.includes("fonts.gstatic")
  ) return;

  // Imágenes Cloudinary → CacheFirst con TTL 7 días
  if (url.hostname === "res.cloudinary.com") {
    event.respondWith(cacheFirstWithTTL(request, IMAGE_CACHE, 7 * 24 * 3600 * 1000));
    return;
  }

  // Assets estáticos Next.js (_next/static) → CacheFirst inmutable
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Imágenes locales y fonts → CacheFirst
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/sounds/") ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navegación HTML → NetworkFirst con fallback /offline
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Network error", { status: 503 });
  }
}

async function cacheFirstWithTTL(request, cacheName, ttlMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    const dateHeader = cached.headers.get("date");
    if (!dateHeader || Date.now() - new Date(dateHeader).getTime() < ttlMs) {
      return cached;
    }
  }
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return cached || new Response("Network error", { status: 503 });
  }
}

async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response("Sin conexión", { status: 503 });
  }
}

// ─── Mensaje desde el cliente (actualizaciones de SW) ────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
