import { NextResponse } from 'next/server';

// This route serves the service worker at /sw.js
// The Service-Worker-Allowed header grants it root scope
export async function GET() {
  const swScript = `
const CACHE_VERSION = 'v1';
const APP_SHELL_CACHE = 'madlibs-shell-' + CACHE_VERSION;
const DATA_CACHE = 'madlibs-data-' + CACHE_VERSION;

// Static assets to cache on install (app shell)
const APP_SHELL_URLS = [
  '/',
  '/join',
  '/manifest.webmanifest',
];

// ─── Install: pre-cache app shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS))
  );
  self.skipWaiting();
});

// ─── Activate: clean up old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== APP_SHELL_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: routing strategy ──────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // API routes: network-first, cache fallback (so data stays fresh when online)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, DATA_CACHE));
    return;
  }

  // Static assets (_next/static): cache-first (fingerprinted, safe to cache forever)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, APP_SHELL_CACHE));
    return;
  }

  // HTML pages: network-first with app shell fallback
  event.respondWith(networkFirstWithShellFallback(request));
});

// ─── Strategies ───────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: 'You are offline. Connect to see latest data.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function networkFirstWithShellFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(APP_SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fall back to root (app shell)
    return caches.match('/');
  }
}

// ─── Background sync placeholder ─────────────────────────────────────────────
// Story data is server-authoritative; the 2-second polling in StoryPage
// handles real-time sync when online. No local write queue needed.
`;

  return new NextResponse(swScript, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
