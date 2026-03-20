const CACHE_NAME = "remedies-app-v1";

// Files to cache (app shell)
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json"
];

// 🔹 Install – cache core files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // activate immediately
});

// 🔹 Activate – clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🔹 Fetch strategy
self.addEventListener("fetch", event => {
  const request = event.request;

  // 👉 Always try network first for DATA
  if (request.url.includes("/data/")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open("dynamic").then(cache => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 👉 Cache-first for static files
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});