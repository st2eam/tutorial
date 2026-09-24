const CACHE_NAME = 'shiyi-v6'
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest', './icons/icon.svg',
  './scores/always-with-me.musicxml', './scores/anheqiao.musicxml', './scores/canon-in-c.musicxml',
  './scores/castle-in-the-sky.musicxml', './scores/chengdu.musicxml', './scores/nanshannan.musicxml', './scores/summer.musicxml',
  './soundfonts/ukulele.sf2', './soundfonts/LICENSE-ukulele.txt', './soundfonts/README-ukulele.txt',
  './font/Bravura.woff2', './font/Bravura.svg', './font/Bravura-OFL.txt', './font/LICENSE',
]

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const base = self.registration.scope
    const htmlUrl = new URL('index.html', base)
    const response = await fetch(htmlUrl)
    const html = await response.text()
    const builtAssets = [...html.matchAll(/(?:src|href)="([^\"]+\.(?:js|css)(?:\?[^\"]*)?)"/g)]
      .map((match) => new URL(match[1], base).href)
    const manifestUrl = new URL('vite-manifest.json', base)
    const manifestResponse = await fetch(manifestUrl)
    const manifest = await manifestResponse.json()
    const manifestAssets = Object.values(manifest).flatMap((entry) => [entry.file, ...(entry.css ?? []), ...(entry.assets ?? [])])
      .filter((path) => typeof path === 'string')
      .map((path) => new URL(path, base).href)
    const shell = [...APP_SHELL.map((path) => new URL(path, base).href), ...builtAssets, manifestUrl.href, ...manifestAssets]
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
        if (response.ok) {
          const copy = response.clone()
          void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      }).catch(() => caches.match(new URL('index.html', self.registration.scope)))
    }),
  )
})
