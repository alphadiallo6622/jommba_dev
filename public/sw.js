/**
 * Service Worker Jommba.com
 *
 * Rôle volontairement minimal : rendre l'application installable et offrir un
 * repli hors ligne, SANS jamais servir de HTML périmé. Le site est dynamique
 * (Supabase, sessions, contenus temps réel) : mettre les pages en cache
 * casserait l'authentification et afficherait des données obsolètes.
 *
 * Stratégies :
 *  - Navigation (pages HTML) : réseau d'abord, page hors ligne en dernier recours.
 *  - Icônes PWA : cache d'abord (immuables, régénérées avec un nouveau nom au besoin).
 *  - Tout le reste (API, _next/*, images, Supabase…) : non intercepté, le
 *    navigateur gère normalement.
 */

// Incrémenter cette version force le remplacement des anciens caches.
const CACHE_VERSION = "jommba-v1";
const OFFLINE_URL = "/offline.html";

// Ressources indispensables au repli hors ligne.
const PRECACHE_URLS = [OFFLINE_URL, "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      // `ignoreVary` évite un échec d'install si une ressource manque.
      await cache.addAll(PRECACHE_URLS).catch(() => {});
      // Active immédiatement la nouvelle version sans attendre la fermeture
      // de tous les onglets.
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Purge les caches des versions précédentes.
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // On ne touche qu'aux GET de même origine : les POST (formulaires, actions
  // serveur) et les appels externes (Supabase, Cloudinary…) passent directement.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // ── Pages : réseau d'abord ──────────────────────────────────────────────
  // Garantit que l'utilisateur voit toujours des données fraîches et une
  // session valide ; le cache ne sert que si le réseau est indisponible.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open(CACHE_VERSION);
          const offline = await cache.match(OFFLINE_URL);
          return (
            offline ??
            new Response("Hors ligne", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }
      })()
    );
    return;
  }

  // ── Icônes PWA : cache d'abord ──────────────────────────────────────────
  if (url.pathname.startsWith("/icons/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_VERSION);
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })()
    );
  }

  // Tout le reste : comportement navigateur par défaut (aucun respondWith).
});
