function closeProduct() {
    window.parent.document.getElementById("lat-iframe").src = "/admin/report/report.html";
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
