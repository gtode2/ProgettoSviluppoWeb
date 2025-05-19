// Simulazione fetch prodotti (da localStorage o variabile globale)
function getProdotti() {
  return JSON.parse(localStorage.getItem("prodotti")) || [];
}

// Estrai ID da URL
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Mostra prodotto
function mostraDettaglioProdotto(prodotto) {
  const container = document.getElementById("dettaglio-prodotto");
  const utente = document.body.dataset.utente;

  if (!prodotto) {
    container.innerHTML = `<div class="card-body text-center"><p class="text-danger">Prodotto non trovato.</p></div>`;
    return;
  }

  container.innerHTML = `
    <img src="${prodotto.immagine}" class="card-img-top" alt="${prodotto.nome}">
    <div class="card-body">
      <h5 class="card-title">${prodotto.nome}</h5>
      <p class="card-text">${prodotto.descrizione}</p>
      <p class="card-text"><strong>Prezzo:</strong> €${prodotto.prezzo}</p>
      <p class="card-text"><small class="text-muted">Categoria: ${prodotto.categoria}</small></p>
      ${utente === "artigiano" ? `
        <div class="d-flex justify-content-between">
          <button class="btn btn-warning">Modifica</button>
          <button class="btn btn-danger">Elimina</button>
        </div>
      ` : ""}
    </div>
  `;
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  const id = getProductIdFromUrl();
  const prodotti = getProdotti();
  const prodotto = prodotti.find(p => p.id == id);
  mostraDettaglioProdotto(prodotto);
});
