function report(id) {
  console.log("AAAAAA");
  document.getElementById('lat-iframe').src = './clienti/report/report.html?id=' + encodeURIComponent(id);
}

/*  
TEORICAMENTE NON PIÙ UTILE - LASCIARE PER TEST
function loadCart() {
  document.getElementById('lat-iframe').src = '../carrello/carrello.html';
}
*/

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
function openProduct(id){
    window.parent.document.getElementById("lat-iframe").src="/prodotti/dettaglio/dettagli.html?id="+id
}

function closeProduct() {
    window.parent.document.getElementById("lat-iframe").src="/clienti/carrello/carrello.html"
}

async function addToCart(id, name, price){
  const frame = document.getElementById("lat-iframe")
  if (!frame.src.includes("carrello.html")) {
    frame.src = "/carrello/carrello.html"
    await new Promise(resolve => frame.onload = () => resolve());
  }

  console.log("load cart");
  frame.contentWindow.addToCart(id,name,price)
}