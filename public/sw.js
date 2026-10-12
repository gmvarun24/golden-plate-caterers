/* Golden Plate service worker: makes the installed app open instantly and survive a dropped
 * connection. Registered in production only (src/components/pwa/ServiceWorker.tsx).
 *
 * Strategy
 *   /_next/static, /brand, /icons, /fonts  cache-first (content-hashed or rarely changing)
 *   /_next/image                            stale-while-revalidate, capped
 *   page navigations                        network-first → last cached copy → /offline
 *   everything else (admin, API, quotes,
 *   RSC/data requests, Server Actions)      untouched, straight to the network
 *
 * Bump VERSION to drop every cache on the next visit.
 */
const VERSION = 'v1'
const STATIC_CACHE = `gp-static-${VERSION}`
const IMAGE_CACHE = `gp-images-${VERSION}`
const PAGE_CACHE = `gp-pages-${VERSION}`
const OFFLINE_URL = '/offline'
const MAX_IMAGES = 80
const MAX_PAGES = 30

const PRECACHE = [OFFLINE_URL, '/brand/favicon.svg', '/icons/icon-192.png']

/** Never cached: private, admin, or always-fresh routes. */
const BYPASS = [/^\/admin/, /^\/api\//, /^\/q\//, /^\/design-system/]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  const keep = new Set([STATIC_CACHE, IMAGE_CACHE, PAGE_CACHE])
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (BYPASS.some((re) => re.test(url.pathname))) return
  // React Server Component payloads and prefetches: let Next.js handle them (and its own retries).
  if (request.headers.has('RSC') || url.searchParams.has('_rsc')) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request))
    return
  }
  if (/^\/(_next\/static|brand|icons|fonts)\//.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }
  if (url.pathname.startsWith('/_next/image')) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE, MAX_IMAGES))
  }
})

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      await cache.put(request, response.clone())
      trim(PAGE_CACHE, MAX_PAGES)
    }
    return response
  } catch {
    return (
      (await cache.match(request, { ignoreSearch: true })) ||
      (await caches.match(OFFLINE_URL)) ||
      Response.error()
    )
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(cacheName)
    cache.put(request, response.clone())
  }
  return response
}

async function staleWhileRevalidate(request, cacheName, max) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone()).then(() => trim(cacheName, max))
      }
      return response
    })
    .catch(() => cached || Response.error())
  return cached || network
}

/** Keep a cache to `max` entries, oldest first out. */
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)))
}
