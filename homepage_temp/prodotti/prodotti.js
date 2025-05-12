document.addEventListener("DOMContentLoaded", () => {
<<<<<<< HEAD
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
          <button class="btn btn-outline-primary w-100 aggiungi-carrello">Aggiungi al carrello</button>
        </div>
      </div>
    `;
    container.appendChild(col);
  });

  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("aggiungi-carrello")) {
      const card = e.target.closest(".card");
      const titolo = card.querySelector(".card-title").textContent;
      aggiungiAlCarrello(titolo, parseFloat(card.querySelector(".price").textContent.replace("€", "")));
      // Puoi integrare con classe Carrello (vedi sotto)
    }
=======
  const tipoUtente = document.body.dataset.utente; // "cliente" o "artigiano"

  document.querySelectorAll(".cliente").forEach(el => {
    el.classList.toggle("hidden", tipoUtente !== "cliente");
  });

  document.querySelectorAll(".artigiano").forEach(el => {
    el.classList.toggle("hidden", tipoUtente !== "artigiano");
>>>>>>> 363b584 (Fixed implementation DOM and BootStrap)
  });
});
