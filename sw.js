const CACHE_NAME = "lionlingo-offline-v26";
const APP_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/vocabulary-data.js?v=learning-flow-v10",
  "/vocabulary-topik-i.js?v=learning-flow-v10",
  "/vocabulary-topik-ii.js?v=learning-flow-v10",
  "/app.js?v=learning-flow-v10",
  "/manifest.webmanifest",
  "/vocabulary-template.csv",
  "/assets/lionlingo-hero-scene.png",
  "/assets/lionlingo-mascot-hero.png",
  "/assets/lionlingo-kids-ui.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/index.html")))
  );
});
