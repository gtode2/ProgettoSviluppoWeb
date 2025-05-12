// JavaScript per la gestione delle interazioni nell'area admin

document.addEventListener('DOMContentLoaded', function () {
  // Seleziona gli elementi necessari
  const btnOpenOverlay = document.getElementById('btn-toggle-overlay');
  const btnCloseOverlay = document.getElementById('btn-close-overlay');
  const adminOverlay = document.getElementById('admin-overlay');
  
  // Apre l'overlay al click sul bottone "Apri Area Artigiano"
  btnOpenOverlay.addEventListener('click', function () {
    adminOverlay.classList.add('active');
  });
  
  // Chiude l'overlay al click sul bottone di chiusura
  btnCloseOverlay.addEventListener('click', function () {
    adminOverlay.classList.remove('active');
  });

  // Caricamento dinamico dei prodotti dell'artigiano (esempio)
  const listaProdotti = document.getElementById('lista-prodotti');
  const prodotti = [
    { name: "Prodotto A", description: "Descrizione del prodotto A" },
    { name: "Prodotto B", description: "Descrizione del prodotto B" },
    { name: "Prodotto C", description: "Descrizione del prodotto C" }
  ];
  
  prodotti.forEach(prodotto => {
    const divProdotto = document.createElement('div');
    divProdotto.classList.add('prodotto-item');
    divProdotto.innerHTML = `<h3>${prodotto.name}</h3><p>${prodotto.description}</p>`;
    listaProdotti.appendChild(divProdotto);
  });
  
  // Caricamento dinamico delle segnalazioni recenti (esempio)
  const listaSegnalazioni = document.getElementById('lista-segnalazioni');
  const segnalazioni = [
    { id: 1, message: "Errore nel caricamento del prodotto", date: "2025-04-28" },
    { id: 2, message: "Richiesta di aggiornamento informazioni", date: "2025-04-30" },
    { id: 3, message: "Problema di visualizzazione su mobile", date: "2025-05-01" }
  ];
  
  segnalazioni.forEach(seg => {
    const li = document.createElement('li');
    li.setAttribute('data-segid', seg.id);
    li.innerHTML = `<span>${seg.message} - ${seg.date}</span>
                    <button onclick="rimuoviSegnalazione(${seg.id})">Rimuovi</button>`;
    listaSegnalazioni.appendChild(li);
  });
});

// Funzione per generare il report mensile
function generaReport() {
  // Simulazione della generazione del report; in un progetto reale potrebbe essere una chiamata AJAX
  alert("Generazione del report mensile in corso...");
}

// Funzione per verificare l'integrità del database
function verificaDatabase() {
  // Simulazione della verifica del database; in un progetto reale potrebbe essere una chiamata AJAX
  alert("Verifica dell'integrità del database in corso...");
}

// Funzione per rimuovere una segnalazione in base al suo ID
function rimuoviSegnalazione(segId) {
  const segnalazione = document.querySelector(`li[data-segid="${segId}"]`);
  if (segnalazione) {
    segnalazione.remove();
    alert(`Segnalazione ${segId} rimossa.`);
  } else {
    alert("Segnalazione non trovata.");
  }
}
