
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registrato con successo:', registration);
        
        // Gestione degli aggiornamenti
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Nuovo contenuto è disponibile, in questo modo le transizioni saranno sempre aggiornate.
                console.log('Nuovo contenuto disponibile. Ricarica la pagina per aggiornarlo.');
              } else {
                console.log('Contenuto precached e pronto per l\'uso offline.');
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('❌ Errore durante la registrazione del Service Worker:', error);
      });
  });
}
