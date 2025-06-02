// Nome della cache per questa versione della PWA.
const CACHE_NAME = 'pwa-cache-v1';

// Elenco degli asset da pre-caching, inclusi tutti i file utili per le transizioni:
const ASSETS_TO_CACHE = [
  // Pagine di navigazione fondamentali:
  '/Frontend/unlogged/unlogged.html',
  '/Frontend/registrazione/registrazione.html',
  '/Frontend/registrazione/regact.html',
  '/Frontend/login/login.html',
  '/Frontend/clienti/clienti.html',
  '/Frontend/admin/admin.html',
  '/Frontend/artigiano/artigiano.html',
  '/Frontend/userArea/userArea.html',
  // Altri asset statici
  '/Frontend/admin/report/report.html',
  '/Frontend/admin/report/banArtigiano.html',
  '/Frontend/admin/report/banProdotto.html',
  '/Frontend/artigiano/inserimento/inserimento.html',
  '/Frontend/artigiano/modifica/modifica.html',
  '/Frontend/cambiopassword/password.html',
  '/Frontend/checkout/checkout.html',
  '/Frontend/checkout/cancel.html',
  '/Frontend/checkout/success.html',
  '/Frontend/clienti/carrello/carrello.html',
  '/Frontend/clienti/report/report.html',
  '/Frontend/HomePage/HomePage.html',
  '/Frontend/login/accountBannato/ban.html',
  '/Frontend/prodotti/prodotti.html',
  '/Frontend/prodotti/dettaglio/dettagli.html',
  '/Frontend/renewToken/renewToken.html',
  '/Frontend/sw-register.js',
  '/manifest.webmanifest',
  '/Frontend/icons/icon-192.png',
  '/Frontend/icons/icon-512.png',
  '/Frontend/style.css',
  '/Frontend/unlogged/unlogged.js'
];

self.addEventListener('install', event => {
  // Forza la nuova versione del service worker ad attivarsi subito.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('Service Worker: Errore durante il caching degli asset:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  // Se la richiesta è di tipo "navigate" (ovvero l'utente sta passando da una pagina all'altra)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        console.log('Navigazione verso:', event.request.url);
        return cachedResponse || fetch(event.request).catch(() => {
          // In caso di errore (es. offline), fornisci una pagina di fallback.
          return caches.match('/Frontend/unlogged/unlogged.html');
        });
      })
    );
    return;
  }
  
  // Per tutte le altre richieste, usa la strategia cache-first.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetch(event.request);
      })
      .catch(error => {
        console.error('Service Worker: Errore durante il fetch:', error);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          // Elimina le cache che non corrispondono alla versione attuale.
          if (name !== CACHE_NAME) {
            console.log('Service Worker: Eliminazione cache vecchia:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
