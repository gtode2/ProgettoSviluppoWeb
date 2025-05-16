// 🔁 Caricamento asincrono dei prodotti dal backend
async function caricaProdotti() {
  try {
    const res = await fetch("/getProducts", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    const container = document.getElementById("lista-prodotti");
    container.innerHTML = "";

    data.prodotti.forEach(p => addProduct(p.nome, p.immagine, p.descrizione, p.prezzo, p.id));
  } catch (error) {
    console.error("Errore nel caricamento prodotti:", error);
  }
}

// 🧱 Costruzione dinamica della card prodotto
function addProduct(nome, immagine, descrizione, prezzo, id) {
  const container = document.getElementById("lista-prodotti");
  const col = document.createElement("div");
  col.className = "col-md-4 mb-4";

  col.innerHTML = `
    <div class="card text-center shadow-sm">
      <img src="${immagine}" class="card-img-top" alt="${nome}">
      <div class="card-body">
        <h5 class="card-title">${nome}</h5>
        <p class="card-text">${descrizione}</p>
        <p class="price text-success fw-bold">€${prezzo}</p>
        <input type="number" class="form-control quantita-input my-2" value="1" min="1" />

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
}

// 📦 Comunicazione con iframe
function addToCart(id, name, price) {
  const iframeWin = window.parent.document.getElementById("lat-iframe")?.contentWindow;
  if (iframeWin?.addToCart) {
    iframeWin.addToCart(id, name, price);
  }
}

// 🛒 Carrello globale
const carrello = [];

// 🧠 Logica evento click su tutta la lista
document.getElementById("lista-prodotti").addEventListener("click", (e) => {
  if (e.target.classList.contains("aggiungi-carrello")) {
    const card = e.target.closest(".card");
    const nome = card.querySelector(".card-title").textContent;
    const prezzo = parseFloat(card.querySelector(".price").textContent.replace("€", ""));
    const quantità = parseInt(card.querySelector(".quantita-input").value) || 1;

    aggiungiAlCarrello(nome, prezzo, quantità);
  }
});

// ➕ Funzione gestione carrello
function aggiungiAlCarrello(nome, prezzo, quantità) {
  console.log(`Aggiunta al carrello: ${quantità} x ${nome} (€${prezzo})`);
  const esistente = carrello.find(item => item.nome === nome);

  if (esistente) {
    esistente.quantità += quantità;
  } else {
    carrello.push({ nome, prezzo, quantità });
  }

  alert(`${quantità} x "${nome}" aggiunto al carrello!`);
}

// 🟢 Gestione visibilità ruoli
document.addEventListener("DOMContentLoaded", () => {
  caricaProdotti();

  const tipoUtente = document.body.dataset.utente;
  document.querySelectorAll(".cliente").forEach(el => {
    el.classList.toggle("hidden", tipoUtente !== "cliente");
  });
  document.querySelectorAll(".artigiano").forEach(el => {
    el.classList.toggle("hidden", tipoUtente !== "artigiano");
  });
});
