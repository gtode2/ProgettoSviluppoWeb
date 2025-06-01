// service-worker.js
// Questo è il file del service worker che gestisce la cache e le richieste di rete.

// Nome della cache per questa versione della PWA. Incrementa il numero per forzare un aggiornamento della cache.
const CACHE_NAME = 'pwa-cache-v1';

// Elenco degli asset da pre-caching.
// Assicurati che tutti i percorsi siano assoluti dalla root del tuo server.
const ASSETS_TO_CACHE = [
  // La root del tuo sito web. Potrebbe essere la tua homepage principale.
  // Se la tua homepage è HomePage.html, potresti volerla specificare esplicitamente.
  '/', 
  '/Frontend/admin/admin.html',
  '/Frontend/admin/report/report.html',
  '/Frontend/admin/report/banArtigiano.html',
  '/Frontend/admin/report/banProdotto.html',
  '/Frontend/artigiano/artigiano.html',
  '/Frontend/artigiano/inserimento/inserimento.html',
  '/Frontend/artigiano/modifica/modifica.html',
  '/Frontend/cambiopassword/password.html',
  '/Frontend/checkout/checkout.html',
  '/Frontend/checkout/cancel.html',
  '/Frontend/checkout/success.html',
  '/Frontend/clienti/clienti.html',
  '/Frontend/clienti/carrello/carrello.html',
  '/Frontend/clienti/report/report.html',
  '/Frontend/HomePage/HomePage.html',
  '/Frontend/login/login.html',
  '/Frontend/login/accountBannato/ban.html',
  '/Frontend/prodotti/prodotti.html',
  '/Frontend/prodotti/dettaglio/dettagli.html',
  '/Frontend/registrazione/registrazione.html',
  '/Frontend/registrazione/regact.html',
  '/Frontend/renewToken/renewToken.html',
  '/Frontend/unlogged/unlogged.html',
  '/Frontend/userArea/userArea.html',
  // Aggiungi anche gli script e il manifest se non sono già inclusi implicitamente
  '/Frontend/sw-register.js',
  '/manifest.webmanifest',
  '/Frontend/icons/icon-192.png',
  '/Frontend/icons/icon-512.png',
  // Potresti voler includere anche i file CSS e JS specifici per le pagine.
  // Ad esempio, per unlogged.html:
  '/Frontend/unlogged/unlogged.css',
  '/Frontend/unlogged/unlogged.js'
];

// Evento 'install': Viene attivato quando il service worker viene installato.
// Qui si effettua il pre-caching degli asset.
self.addEventListener('install', event => {
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

// Evento 'fetch': Intercetta le richieste di rete.
// Tenta di servire i contenuti dalla cache prima di andare in rete.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Se la risorsa è in cache, la restituisce.
        // Altrimenti, va in rete per recuperarla.
        return cachedResponse || fetch(event.request);
      })
      .catch(error => {
        console.error('Service Worker: Errore durante il fetch:', error);
        // Puoi aggiungere una pagina offline qui se necessario
        // return caches.match('/offline.html');
      })
  );
});

// Evento 'activate': Viene attivato quando il service worker viene attivato.
// Qui si puliscono le vecchie cache.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          // Elimina tutte le cache che non corrispondono al CACHE_NAME corrente.
          if (name !== CACHE_NAME) {
            console.log('Service Worker: Eliminazione cache vecchia:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});
