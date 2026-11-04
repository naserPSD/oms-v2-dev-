// Dev reset: the previous worker served stale /_next/static JS (StaleWhileRevalidate).
// This build clears that cache and unregisters so the browser loads the current bundle.
// `npm run build` regenerates the production service worker.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      await Promise.all(clients.map((client) => client.navigate(client.url)));
    })(),
  );
});
