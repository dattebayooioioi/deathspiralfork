const CACHE = 'spin-mobile-shell-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './index.png'];
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  for (const path of SHELL) { try { const r = await fetch(path); if (r.ok) await cache.put(path, r); } catch (_) {} }
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith('spin-mobile-shell-') && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || /\.(wasm|pck)$/.test(url.pathname)) return;
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const response = await fetch(req);
    if (response.ok && /\.(html|js|png|webmanifest)$/.test(url.pathname)) { try { (await caches.open(CACHE)).put(req, response.clone()); } catch (_) {} }
    return response;
  })());
});
