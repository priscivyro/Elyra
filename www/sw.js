// ELYRA — service worker : rend l'appli disponible hors ligne (iPhone / navigateur).
// Changer VERSION à chaque mise à jour pour que les téléphones récupèrent la nouvelle version.
const VERSION = 'elyra-1.0.0';
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
  'fonts/fraunces-latin-400-normal.woff2', 'fonts/fraunces-latin-500-normal.woff2',
  'fonts/figtree-latin-400-normal.woff2', 'fonts/figtree-latin-600-normal.woff2', 'fonts/figtree-latin-700-normal.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Page : réseau d'abord (pour recevoir les mises à jour), sinon la copie hors ligne.
// Autres fichiers : copie hors ligne d'abord.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return r;
  })));
});
