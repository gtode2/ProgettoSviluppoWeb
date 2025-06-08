function report(id) {
  document.getElementById('lat-iframe').src = '/clienti/report/report.html?id=' + encodeURIComponent(id);
}


function loadCart() {
  document.getElementById('lat-iframe').src = '/clienti/carrello/carrello.html';
}

function closeProduct() {
    window.parent.document.getElementById("lat-iframe").src = "/clienti/carrello/carrello.html";
}

function openProduct(id) {
    window.parent.document.getElementById("lat-iframe").src = "/prodotti/dettaglio/dettagli.html?id=" + id;
}

document.addEventListener('DOMContentLoaded', function () {
    const toggleOverlayButton = document.getElementById('btn-toggle-overlay');
    const closeOverlayButton = document.getElementById('btn-close-overlay');
    const adminOverlay = document.getElementById('admin-overlay');
    const adminAreaButton = document.getElementById('adminOverlay');

    if (toggleOverlayButton) {
        toggleOverlayButton.addEventListener('click', function () {
            adminOverlay.classList.add('aperto');
        });
    }

    if (closeOverlayButton) {
        closeOverlayButton.addEventListener('click', function () {
            adminOverlay.classList.remove('aperto');
        });
    }
    
    adminOverlay.onclick = null;

    if(adminAreaButton){
      adminAreaButton.addEventListener('click', function(event){
        event.stopPropagation();
        window.location.href = "/userArea";
      })
    }
});


async function addToCart(id, name, price){
  const frame = document.getElementById("lat-iframe")
  if (!frame.src.includes("carrello.html")) {
    frame.src = "/clienti/carrello/carrello.html"
    await new Promise(resolve => frame.onload = () => resolve());
  }

  console.log("load cart");
  frame.contentWindow.addToCart(id,name,price)
}