const CACHE = "vendefacil-v3";
const BASE = self.registration.scope;
const CORE = [BASE, new URL("manifest.webmanifest", BASE).href, new URL("icons/app-icon.svg", BASE).href];

self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("message", event => { if (event.data?.type === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(BASE, copy)); return response; }).catch(() => caches.match(BASE)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});
