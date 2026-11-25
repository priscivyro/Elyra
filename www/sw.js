// ELYRA — service worker : rend l'appli disponible hors ligne (iPhone / navigateur).
// Changer VERSION à chaque mise à jour.
const VERSION = 'elyra-1.8.0';
const CORE = [
  './', 'index.html', 'styles.css', 'content.js', 'seances.js', 'art.js', 'tag.js','outils.js','config.js','live.js','piper-worker.js', 'sons.js', 'app.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
  'fonts/fraunces-latin-400-normal.woff2', 'fonts/fraunces-latin-500-normal.woff2',
  'fonts/figtree-latin-400-normal.woff2', 'fonts/figtree-latin-600-normal.woff2', 'fonts/figtree-latin-700-normal.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  // On garde les audios déjà téléchargés d'une version à l'autre.
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'elyra-voix' && k !== 'elyra-piper').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Voix naturelle : gérée par piper-worker.js (fichiers lourds gardés à part).
  if (url.pathname.includes('/vendor/') || url.pathname.includes('/voix/modele/')) return;

  // Audios de la voix : copie gardée d'abord (ils ne changent jamais : le nom dépend du texte).
  if (url.pathname.includes('/voix/') && url.pathname.endsWith('.mp3')) {
    e.respondWith(caches.open('elyra-voix').then(c => c.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok) c.put(req, r.clone());
      return r;
    }))));
    return;
  }

  // Polices et icônes : copie gardée d'abord.
  if (url.pathname.includes('/fonts/') || url.pathname.includes('/icons/')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
    return;
  }

  // Le reste (page, code, liste des voix) : réseau d'abord pour recevoir les mises à jour, sinon copie hors ligne.
  e.respondWith(fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req.mode === 'navigate' ? 'index.html' : req, copy)); }
    return r;
  }).catch(() => caches.match(req.mode === 'navigate' ? 'index.html' : req).then(hit => hit || caches.match('index.html'))));
});
