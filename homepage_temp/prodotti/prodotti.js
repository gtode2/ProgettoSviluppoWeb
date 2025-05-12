document.addEventListener("DOMContentLoaded", () => {
  const tipoUtente = document.body.dataset.utente; // "cliente" o "artigiano"

  // Mostra/Nasconde pulsanti in base al tipo utente
  document.querySelectorAll(".cliente").forEach(el => {
    el.classList.toggle("hidden", tipoUtente !== "cliente");
  });
  document.querySelectorAll(".artigiano").forEach(el => {
    el.classList.toggle("hidden", tipoUtente !== "artigiano");
  });

  const prodotti = [
    {
      nome: "Collana in rame",
      descrizione: "Fatta a mano con tecnica wire wrapping",
      prezzo: 45,
      immagine: "img/prodotto1.jpg"
    },
    {
      nome: "Bracciale in cuoio",
      descrizione: "Lavorazione artigianale italiana",
      prezzo: 30,
      immagine: "img/prodotto2.jpg"
    }
  ];

  const container = document.querySelector(".row");
  container.innerHTML = ""; // Pulisce eventuali template statici

  prodotti.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    col.innerHTML = `
      <div class="card text-center shadow-sm">
        <img src="${p.immagine}" class="card-img-top" alt="${p.nome}">
        <div class="card-body">
          <h5 class="card-title">${p.nome}</h5>
          <p class="card-text">${p.descrizione}</p>
          <p class="price text-success fw-bold">€${p.prezzo}</p>

          <div class="d-flex justify-content-center gap-2 product-actions cliente">
            <button class="btn btn-primary aggiungi-carrello">Aggiungi al carrello</button>
            <button class="btn btn-outline-primary">Rimuovi</button>
          </div>

          <div class="d-flex justify-content-center gap-2 product-actions artigiano">
            <button class="btn btn-warning">Modifica</button>
            <button class="btn btn-danger">Elimina</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });

  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("aggiungi-carrello")) {
      const card = e.target.closest(".card");
      const titolo = card.querySelector(".card-title").textContent;
      const prezzo = parseFloat(card.querySelector(".price").textContent.replace("€", ""));
      aggiungiAlCarrello(titolo, prezzo);
    }
  });

  function aggiungiAlCarrello(nome, prezzo) {
    console.log(`Prodotto aggiunto al carrello: ${nome} - €${prezzo}`);
    // Implementazione futura
  }
});
