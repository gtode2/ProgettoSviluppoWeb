document.addEventListener('DOMContentLoaded', () => {
  // Elementi principali del DOM
  const overlay = document.querySelector('.admin-overlay');
  const closeBtn = document.querySelector('.btn-close-overlay');
  const annullaBtn = document.getElementById('annullaBtn');
  const checkoutForm = document.getElementById('checkoutForm');
  const outputMsg = document.getElementById('outputMsg');
  const openBtn = document.getElementById('openCheckout'); // solo presente in mobile

  // Funzione per chiudere l'overlay
  const closeOverlay = () => {
    overlay.classList.remove('aperto');
  };

  // Event listener per chiudere l'overlay tramite il pulsante di chiusura
  closeBtn.addEventListener('click', closeOverlay);
  annullaBtn.addEventListener('click', closeOverlay);

  // Event listener per aprire l'overlay in modalità mobile
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      overlay.classList.add('aperto');
    });
  }

  // Gestione della submission del form di checkout
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Verifica che il pagamento sia approvato
    const approvato = document.getElementById('approva').checked;
    if (!approvato) {
      outputMsg.textContent = 'Devi approvare il pagamento.';
      outputMsg.classList.remove('text-success');
      outputMsg.classList.add('text-danger');
      return;
    }

    // Simulazione dell'elaborazione del pagamento con un messaggio
    outputMsg.textContent = 'Pagamento in elaborazione...';
    outputMsg.classList.remove('text-danger');
    outputMsg.classList.add('text-success');

    // Simula un breve ritardo prima di confermare il successo del pagamento
    setTimeout(() => {
      outputMsg.textContent = 'Pagamento completato con successo!';
    }, 1500);
  });
});
