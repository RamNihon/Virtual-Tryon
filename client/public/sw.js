/*
  ─── SERVICE WORKER (classic script, NOT an ES module) ───────
  This file lives in `public/` and is registered directly via
  `navigator.serviceWorker.register('/sw.js')` in index.js —
  meaning it's served to the browser completely raw, with no
  webpack/babel processing at all. Files in `public/` are never
  bundled; they're copied as-is into the build output.

  That's why `import { precacheAndRoute } from 'workbox-precaching'`
  broke everything: browsers only allow `import` statements in
  files loaded as ES modules (`<script type="module">` or a
  service worker explicitly registered with `{ type: 'module' }`).
  This registration doesn't do that, so the browser treated the
  import as a syntax error and refused to run the entire file —
  which is why push notifications appeared to silently fail
  ("Couldn't reach the service worker"): the service worker was
  never actually running at all.

  Fix: no imports, no bundler-dependent APIs (precacheAndRoute,
  self.__WB_MANIFEST) — just plain JS a browser can run directly.
  A small hand-written cache replaces what workbox was doing,
  so offline/fast-repeat-load behavior isn't lost, just no
  longer dependent on a build step this file never goes through.
--------------------------------------------------------------*/

const CACHE_NAME = "virtualtryon-static-v1";

// Only the guaranteed-to-exist app shell files are pre-cached.
// Hashed build assets (main.[hash].js etc.) can't be listed here
// by name since this file isn't processed at build time to know
// those hashes — they're cached on first visit instead, via the
// fetch handler below.
const APP_SHELL = ["/", "/index.html", "/logo192.png", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {
        // Non-fatal if a shell file 404s — don't block install.
      }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      ),
    ),
  );
  self.clients.claim();
});

// Cache-first for same-origin GET requests, network fallback —
// covers hashed JS/CSS bundles after their first successful load.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    }),
  );
});

/*
  ─── PUSH NOTIFICATIONS ───────────────────────────────────
  Fires when the backend sends a push message (see
  server/config/webpush.js). The payload is whatever JSON
  object the backend sent — title/body/url are the fields
  this dashboard's push sender always includes.
--------------------------------------------------------------*/
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: "VirtualTryOn", body: event.data.text() };
  }

  const options = {
    body: payload.body || "",
    icon: payload.icon || "/logo192.png",
    badge: "/logo192.png",
    data: { url: payload.url || "/dashboard" },
    tag: payload.tag || "default",
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "VirtualTryOn", options),
  );
});

// Clicking the notification focuses an existing dashboard tab if
// one's already open, instead of always opening a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});