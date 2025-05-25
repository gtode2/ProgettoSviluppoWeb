function report(id) {
  console.log("AAAAAA");  
  document.getElementById('lat-iframe').src = './clienti/report/report.html?id=' + encodeURIComponent(id);;
}

function loadCart() {
    document.getElementById('lat-iframe').src = '../carrello/carrello.html';
  }

document.addEventListener('DOMContentLoaded', function () {
  const btnToggle = document.getElementById('btn-toggle-overlay');
  const btnClose = document.getElementById('btn-close-cliente-overlay');
  const overlay = document.getElementById('client-overlay');

  // Apertura overlay: su mobile il pulsante apre il riepilogo acquisto in full screen
  btnToggle.addEventListener('click', function () {
    overlay.classList.add('visible');
    btnToggle.classList.add('d-none'); // Nasconde il pulsante una volta aperto il riepilogo
  });

  // Chiusura overlay: il pulsante in alto a sinistra chiude l'overlay e ripristina il pulsante mobile
  btnClose.addEventListener('click', function () {
    overlay.classList.remove('visible');
    btnToggle.classList.remove('d-none');
  });
});
