// Retires the Workbox service worker the 2020 version of this site installed.
// Browsers still running it fetch this changed script, which clears the old
// caches, unregisters itself and reloads open tabs into the current site.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key !== 'emcalc-v1').map((key) => caches.delete(key)))
    await self.registration.unregister()
    const windows = await self.clients.matchAll({ type: 'window' })
    windows.forEach((client) => client.navigate(client.url))
  })())
})
