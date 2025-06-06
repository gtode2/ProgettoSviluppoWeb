// Funzione per caricare i prodotti
// Imposta gli event listener per aprire e chiudere l'overlay Artigiano
// Funzione per caricare i prodotti
// Imposta gli event listener per aprire e chiudere l'overlay Artigiano
document.addEventListener('DOMContentLoaded', function () {
    const toggleOverlayButton = document.getElementById('btn-toggle-overlay');
    const closeOverlayButton = document.getElementById('btn-close-overlay');
    const adminOverlay = document.getElementById('admin-overlay');
    const adminAreaButton = document.getElementById('adminOverlay');

    if (toggleOverlayButton) {
        toggleOverlayButton.addEventListener('click', function () {
            adminOverlay.classList.add('aperto'); // ✅ Overlay visibile
        });
    }

    if (closeOverlayButton) {
        closeOverlayButton.addEventListener('click', function () {
            adminOverlay.classList.remove('aperto'); // ✅ Overlay nascosto
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

function openProduct(id){
    window.parent.document.getElementById("lat-iframe").src="/prodotti/dettaglio/dettagli.html?id="+id
}

function closeProduct() {
    window.parent.document.getElementById("lat-iframe").src="/artigiano/inserimento/inserimento.html"
}

function edit(id){
  window.parent.document.getElementById("lat-iframe").src="/artigiano/modifica/modifica.html?id="+id
}