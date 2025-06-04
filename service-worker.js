// Nome della cache per questa versione della PWA.
const CACHE_NAME = 'pwa-cache-v1';

// Elenco degli asset da pre-caching, inclusi tutti i file utili per le transizioni:
const ASSETS_TO_CACHE = [
  // Pagine di navigazione fondamentali:
  '/Frontend/admin/admin.html',
  '/Frontend/admin/report/report.html',
  '/Frontend/admin/report/banArtigiano.html',
  '/Frontend/admin/report/banProdotto.html',
  '/Frontend/artigiano/artigiano.html',
  '/Frontend/artigiano/inserimento/inserimento.html',
  '/Frontend/artigiano/modifica/modifica.html',
  '/Frontend/modificaAttivita/modificaatt.html',
  '/Frontend/cambiopassword/password.html',
  '/Frontend/checkout/cancel.html',
  '/Frontend/checkout/checkout.html',
  '/Frontend/checkout/success.html',
  '/Frontend/clienti/clienti.html',
  '/Frontend/clienti/carrello/carrello.html',
  '/Frontend/clienti/report/report.html',
  '/Frontend/HomePage/HomePage.html',
  '/Frontend/login/login.html',
  '/Frontend/login/accountBannato/ban.html',
  '/Frontend/ordini/ordine.html',
  '/Frontend/prodotti/prodotti.html',
  '/Frontend/prodotti/dettaglio/dettagli.html',
  '/Frontend/registrazione/regact.html',
  '/Frontend/registrazione/registrazione.html',
  '/Frontend/renewToken/renewToken.html',
  '/Frontend/unlogged/unlogged.html',
  '/Frontend/userArea/userArea.html',
  '/Frontend/userArea/userAreaArtigiano.html',

  //Asset statici
  '/Frontend/admin/report/report.css',
  '/Frontend/artigiano/inserimento/inserimento.css',
  '/Frontend/cambiopassword/password.css',
  '/Frontend/checkout/checkout.css',
  '/Frontend/clienti/carrello/carrello.css',
  '/Frontend/clienti/report/report.css',
  '/Frontend/HomePage/HomePage.css',
  '/Frontend/login/login.css',
  '/Frontend/prodotti/dettaglio/dettagli.css',
  '/Frontend/prodotti/prodotti.css',
  '/Frontend/registrazione/regact.css',
  '/Frontend/registrazione/registrazione.css',
  '/style.css',

  //Manifest & registrazione service worker
  '/manifest.webmanifest',
  '/sw-register.js'
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
