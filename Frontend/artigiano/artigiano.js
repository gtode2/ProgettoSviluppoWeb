// Funzione per caricare i prodotti
// Imposta gli event listener per aprire e chiudere l'overlay Artigiano
// Funzione per caricare i prodotti
// Imposta gli event listener per aprire e chiudere l'overlay Artigiano
document.addEventListener('DOMContentLoaded', function () {
  const btnToggle   = document.getElementById('btn-toggle-overlay');
  const btnClose    = document.getElementById('btn-close-overlay');
  const overlay     = document.getElementById('admin-overlay');
  const btnUserInfo = document.getElementById('btn-toggle-overlay2');

  // Apertura overlay: su mobile il pulsante apre l'overlay a full screen
  btnToggle.addEventListener('click', function () {
    overlay.classList.add('visible');
    btnToggle.classList.add('d-none'); // Nasconde il pulsante di apertura
  });

  // Chiusura overlay: il bottone chiude l'overlay e ripristina il pulsante mobile
  btnClose.addEventListener('click', function () {
    overlay.classList.remove('visible');
    btnToggle.classList.remove('d-none');
  });

  btnUserInfo.addEventListener('click', function () {
    window.location.href = '../userArea/userArea.html';
  });
});

