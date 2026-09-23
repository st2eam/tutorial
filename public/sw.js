const CACHE_NAME = 'shiyin-v4'
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icons/favicon-32.png', './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const base = self.registration.scope
    const htmlUrl = new URL('index.html', base)
    const response = await fetch(htmlUrl)
    const html = await response.text()
    const builtAssets = [...html.matchAll(/(?:src|href)="([^\"]+\.(?:js|css)(?:\?[^\"]*)?)"/g)]
      .map((match) => new URL(match[1], base).href)
    const shell = [...APP_SHELL.map((path) => new URL(path, base).href), ...builtAssets]
    const cache = await caches.open(CACHE_NAME)
    await cache.addAll([...new Set(shell)])
  })())
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok && new URL(request.url).pathname.includes('/assets/')) {
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      }).catch(() => caches.match(new URL('index.html', self.registration.scope)))
    }),
  )
})
