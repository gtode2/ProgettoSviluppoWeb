function report(id) {
  console.log("AAAAAA");  
  document.getElementById('lat-iframe').src = './clienti/report/report.html?id=' + encodeURIComponent(id);;
}

function loadCart(id) {
    console.log("AAAAAA");
    
    document.getElementById('lat-iframe').src = '../carrello/carrello.html';
  }

document.addEventListener('DOMContentLoaded', function() {
  // Seleziona gli elementi
  const toggleOverlayButton = document.getElementById('btn-toggle-overlay');
  const artigianoOverlay = document.getElementById('cliente-overlay');
  const closeOverlayButton = document.getElementById('btn-close-cliente-overlay');

  // Gestione apertura overlay
  if (toggleOverlayButton) {
    toggleOverlayButton.addEventListener('click', function() {
      artigianoOverlay.classList.add('visible');
    });
  }

  // Gestione chiusura overlay
  if (closeOverlayButton) {
    closeOverlayButton.addEventListener('click', function() {
      artigianoOverlay.classList.remove('visible');
    });
  }
});
