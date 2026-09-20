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
 *
 * Il porte aussi les notifications push et le badge de l'icône (voir la fin du
 * fichier) ; ces handlers sont indépendants des stratégies de cache ci-dessus.
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

// ── Notifications push ─────────────────────────────────────────────────────
// Ajout indépendant du cache : les handlers ci-dessous ne touchent ni aux
// stratégies de fetch ni au repli hors ligne.
//
// Charge utile envoyée par /api/push/send :
//   { id, title, body, url, badge, lang }

/** Met à jour le badge de l'icône (Chromium, Safari iOS 16.4+ installé). */
async function updateAppBadge(count) {
  try {
    if (typeof count !== "number" || !("setAppBadge" in self.navigator)) return;
    if (count > 0) await self.navigator.setAppBadge(count);
    else await self.navigator.clearAppBadge();
  } catch {
    // Badge non supporté : sans conséquence.
  }
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Jommba", body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    (async () => {
      // Safari exige qu'un push affiche toujours une notification.
      await self.registration.showNotification(data.title || "Jommba", {
        body: data.body || "",
        icon: "/icons/icon-192.png",
        // Une notification par événement ; un renvoi du même id la remplace.
        tag: data.id || undefined,
        lang: data.lang || "fr",
        data: { id: data.id, url: data.url || "/dashboard/notifications" },
      });
      await updateAppBadge(data.badge);
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { id, url } = event.notification.data || {};
  const target = new URL(url || "/dashboard/notifications", self.location.origin).href;

  event.waitUntil(
    (async () => {
      // 1) Marque comme lue et met le badge à jour. Un échec (hors ligne,
      //    session expirée) ne doit pas empêcher l'ouverture de la page.
      const markRead = fetch("/api/push/read", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => (json ? updateAppBadge(json.badge) : undefined))
        .catch(() => {});

      // 2) Réutilise la fenêtre ouverte si elle existe, sinon en ouvre une.
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = windows.find((c) => new URL(c.url).origin === self.location.origin);
      if (existing) {
        await existing.focus().catch(() => {});
        try {
          await existing.navigate(target);
        } catch {
          // navigate() peut être indisponible : la page écoute ce message.
          existing.postMessage({ type: "push-navigate", url: target });
        }
      } else {
        await self.clients.openWindow(target);
      }

      await markRead;
    })()
  );
});

// Le navigateur a renouvelé l'abonnement (clé expirée…) : on se réabonne avec
// la même clé applicative et on prévient le serveur. Sans session ouverte la
// requête échoue ; l'abonnement sera de toute façon resynchronisé à la
// prochaine visite (PushNotificationManager).
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const old = event.oldSubscription;
        const key = old && old.options && old.options.applicationServerKey;
        if (!key) return;
        const sub = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        });
      } catch {
        // Resynchronisé à la prochaine visite.
      }
    })()
  );
});
