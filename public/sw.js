// Offline support: pages are network-first (so new releases show up),
// hashed bundles/assets are cache-first (their names change on every build).
// renamed when old cached files should be cleared out
const CACHE = 'emcalc-v2'

// The local dev server reuses script names between edits, so a worker there
// serves stale code. If one was installed (older builds registered it there),
// clear its caches, remove it and reload the page.
const LOCAL = ['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname)

if (LOCAL) {
  self.addEventListener('install', () => self.skipWaiting())
  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.registration.unregister()
      const windows = await self.clients.matchAll({ type: 'window' })
      windows.forEach((client) => client.navigate(client.url))
    })())
  })
}

if (!LOCAL) self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add('/')))
  self.skipWaiting()
})

if (!LOCAL) self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

if (!LOCAL) self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  // always ask the server which version is deployed
  if (url.pathname === '/version.json') return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('/', copy))
          return response
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, copy))
      }
      return response
    }))
  )
})
