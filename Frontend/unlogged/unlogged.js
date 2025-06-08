document.addEventListener('DOMContentLoaded', function() {
    const toggleOverlayButton = document.getElementById('btn-toggle-overlay');
    const adminOverlay = document.getElementById('admin-overlay');
    const closeOverlayButton = document.getElementById('btn-close-overlay');
    const loginButton = document.getElementById('login');
    const registerButton = document.getElementById('register');

    if (toggleOverlayButton) {   
        toggleOverlayButton.addEventListener('click', function() {
            adminOverlay.classList.add('aperto'); // Aggiunge la classe per mostrare l'overlay
        });
    }

    if (closeOverlayButton) {
        closeOverlayButton.addEventListener('click', function() {
            adminOverlay.classList.remove('aperto'); // Rimuove la classe per nascondere l'overlay
        });
    }

    if (loginButton) {
        loginButton.addEventListener('click', function(event) {
            event.preventDefault(); // Previene il comportamento predefinito del form (submit)
            window.location.href = "/login";
        });
    }

    if (registerButton) {
        registerButton.addEventListener('click', function(event) {
            event.preventDefault(); // Previene il comportamento predefinito del form (submit)
            window.location.href = "/registrazione";
        });
    }
});

function openProduct(id){
    window.parent.document.getElementById("lat-iframe").src="/prodotti/dettaglio/dettagli.html?id="+id
}

function closeProduct() {
    window.parent.document.getElementById("lat-iframe").src="/clienti/carrello/carrello.html"
}