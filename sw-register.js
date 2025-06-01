// sw-register.js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registrato con successo:', registration);
      })
      .catch(error => {
        console.error('❌ Errore durante la registrazione del Service Worker:', error);
      });
  });
}
