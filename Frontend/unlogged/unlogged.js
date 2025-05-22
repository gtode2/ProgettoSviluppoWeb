document.addEventListener('DOMContentLoaded', function() {
    // Seleziona gli elementi dal DOM
    const toggleOverlayButton = document.getElementById('btn-toggle-overlay');
    const adminOverlay = document.getElementById('admin-overlay');
    const closeOverlayButton = document.getElementById('btn-close-overlay');
    const loginButton = document.getElementById('login');
    const registerButton = document.getElementById('register');

    // Gestisce l'apertura dell'overlay
    if (toggleOverlayButton) {   
        toggleOverlayButton.addEventListener('click', function() {
            adminOverlay.classList.add('aperto'); // Aggiunge la classe per mostrare l'overlay
        });
    }

    // Gestisce la chiusura dell'overlay
    if (closeOverlayButton) {
        closeOverlayButton.addEventListener('click', function() {
            adminOverlay.classList.remove('aperto'); // Rimuove la classe per nascondere l'overlay
        });
    }

    // Gestisce il click sul pulsante "Accedi"
    if (loginButton) {
        loginButton.addEventListener('click', function(event) {
            event.preventDefault(); // Previene il comportamento predefinito del form (submit)
            window.location.href = "http://localhost:3000/login";
        });
    }

    // Gestisce il click sul pulsante "Registrati"
    if (registerButton) {
        registerButton.addEventListener('click', function(event) {
            event.preventDefault(); // Previene il comportamento predefinito del form (submit)
            window.location.href = "http://localhost:3000/registrazione";
        });
    }
});