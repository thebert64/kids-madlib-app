import { NextResponse } from 'next/server';

export async function GET() {
  const swScript = `
const CACHE_VERSION = 'v2';
const APP_SHELL_CACHE = 'madlibs-shell-' + CACHE_VERSION;
const DATA_CACHE = 'madlibs-data-' + CACHE_VERSION;
const APP_SHELL_URLS = ['/', '/join', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];
// Self-contained (no JS chunks) so it renders even when nothing else is cached.
const OFFLINE_HTML = \`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#7c3aed">
<title>Offline - Mad Libs Stories</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;font-family:system-ui,sans-serif;background:linear-gradient(135deg,#f3e8ff,#dbeafe)">
<div style="background:#fff;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,.1);padding:32px;text-align:center;max-width:420px">
<div style="font-size:56px">📡</div><h1 style="color:#581c87">You're offline</h1>
<p style="color:#374151;font-size:18px">Stories need the internet to sync with your friends. Check your connection and try again!</p>
<button onclick="location.reload()" style="background:#7c3aed;color:#fff;border:0;border-radius:8px;padding:12px 24px;font-size:16px;font-weight:bold;cursor:pointer">🔄 Try Again</button>
</div></body></html>\`;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== APP_SHELL_CACHE && k !== DATA_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DATA_CACHE));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, APP_SHELL_CACHE));
  } else if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, APP_SHELL_CACHE, true));
  } else {
    event.respondWith(networkFirst(request, APP_SHELL_CACHE));
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(cacheName)).put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName, isPage) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(cacheName)).put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (isPage) {
      return new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}
`;
  return new NextResponse(swScript, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
