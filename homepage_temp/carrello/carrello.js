class Carrello {
  constructor() {
    this.prodotti = JSON.parse(localStorage.getItem("carrello")) || [];
  }

  aggiungi(prodotto) {
    this.prodotti.push(prodotto);
    this.salva();
  }

  rimuovi(index) {
    this.prodotti.splice(index, 1);
    this.salva();
  }

  svuota() {
    this.prodotti = [];
    this.salva();
  }

  salva() {
    localStorage.setItem("carrello", JSON.stringify(this.prodotti));
  }

  getTotale() {
    return this.prodotti.reduce((tot, p) => tot + p.prezzo, 0);
  }

  getLista() {
    return this.prodotti;
  }

  stampa() {
    console.table(this.prodotti);
  }
}

// DOM: genera riepilogo dinamico
document.addEventListener("DOMContentLoaded", () => {
  const carrello = new Carrello();
  const lista = carrello.getLista();
  const riepilogo = document.getElementById("riepilogo");
  const totale = document.getElementById("totale");

  if (lista.length === 0) {
    riepilogo.innerHTML = `<div class="alert alert-info">Il carrello è vuoto.</div>`;
    totale.textContent = "€0";
    return;
  }

  lista.forEach((p, i) => {
    const riga = document.createElement("div");
    riga.className = "d-flex justify-content-between align-items-center border-bottom py-2";
    riga.innerHTML = `
      <div><strong>${p.nome}</strong></div>
      <div>€${p.prezzo.toFixed(2)}</div>
    `;
    riepilogo.appendChild(riga);
  });

  totale.textContent = `€${carrello.getTotale().toFixed(2)}`;

  document.getElementById("proseguiPagamento").addEventListener("click", () => {
    alert("Pagamento simulato! Grazie per l'acquisto.");
    carrello.svuota();
    location.reload();
  });

  document.getElementById("svuotaCarrello").addEventListener("click", () => {
    if (confirm("Sei sicuro di voler svuotare il carrello?")) {
      carrello.svuota();
      location.reload();
    }
  });
});
