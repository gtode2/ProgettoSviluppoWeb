// Variabili globali
let currentView = "card"; // Modalità di visualizzazione corrente: "card", "list", "fullscreen"
window.lastLoadedProducts = []; // Array dei prodotti caricati
window.lastUserType = null;    // Tipo utente (1 = cliente, 2 = artigiano, 0 = admin, ecc.)

// --- FUNZIONE DI RICERCA ---
async function cerca() {
  const txt = document.getElementById("searchbar").value.trim();
  let filters = getfilters(); // Funzione che deve essere definita per raccogliere eventuali filtri
  console.log("Filters iniziali:", filters);
  if (txt) {
    console.log("Ricerca:", txt);
    filters.search = txt;
  } else {
    console.log("Campo di ricerca vuoto");
  }
  loadFromServer(filters);
}

// --- LOAD DEI PRODOTTI DAL SERVER ---
async function loadFromServer(filters = null) {
  try {
    let res;
    if (filters !== null) {
      console.log("Caricamento prodotti con filtri");
      res = await fetch("/getProducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters: filters })
      });
    } else {
      console.log("Caricamento prodotti senza filtri");
      res = await fetch("/getProducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
    }
    const data = await res.json();
    if (data.prodotti === 0) {
      console.log("Nessun prodotto trovato");
    } else {
      // Salva globalmente i dati dei prodotti e il tipo utente
      window.lastLoadedProducts = data.prodotti;
      window.lastUserType = data.usertype;
      // Esegui il rendering dei prodotti usando la funzione renderProducts()
      renderProducts(window.lastLoadedProducts);
    }
  } catch (error) {
    console.error(error);
    alert("Errore di rete");
  }
}

// --- FUNZIONE RENDER PRODUCTS ---
// Questa funzione genera i prodotti in base al valore di currentView.
// Mantiene il template originale (per "card") e implementa la modalità "lista".
function renderProducts(data) {
  const container = document.getElementById("lista-prodotti");
  container.innerHTML = "";
  
  // Opzioni per il layout del container (puoi modificarle se vuoi)
  if (currentView === "list") {
    container.className = "row";  // Per la visualizzazione in lista, ogni prodotto occuperà una riga completa
    container.removeAttribute("style");
  } else if (currentView === "fullscreen") {
    container.className = "d-flex overflow-auto flex-row gap-4 px-4";
    container.style.scrollSnapType = "x mandatory";
  } else {
    // Default: modalità "card"
    container.className = "row justify-content-center";
    container.removeAttribute("style");
  }

  
  data.forEach(el => {
    const col = document.createElement("div");
    
    if (currentView === "card" || currentView === "fullscreen") {
      // Template originale in modalità "card" (o "fullscreen")
      col.className = "col-md-4 mb-5 mt-5";
      if (lastUserType === 1) {
    col.innerHTML= `
    <div class="card text-center shadow-sm" id="productcard${el.id}">
      <div class="card-body" onclick="openProduct(${el.id})">
        <h5 class="card-title">${el.name}</h5>
        <p class="card-text">${el.descr}</p>
        <p class="price text-success fw-bold">€${el.costo}</p>
        <p class="nome artigiano"></p>
        <div class="d-flex justify-content-center gap-2 product-actions cliente" style="padding-bottom:50px">
          <button class="btn btn-primary aggiungi-carrello" onclick="event.stopPropagation(); addToCart(${el.id}, '${el.name}', ${el.costo})">Aggiungi al carrello</button>
          <button class="btn btn-outline-primary" onclick="event.stopPropagation(); report(${el.id})">Segnala</button>
        </div>
      </div>
    </div>
    `;
    } else if (lastUserType === 2) {
    col.innerHTML = `
    <div class="card text-center shadow-sm" id="productcard${el.id}">
      <div class="card-body" onclick="openProduct(${el.id})">
        <h5 class="card-title">${el.name}</h5>
        <p class="card-text">${el.descr}</p>
        <p class="price text-success fw-bold">€${el.costo}</p>
        <div class="d-flex justify-content-center gap-2 product-actions artigiano">
          <button class="btn btn-warning" onclick="event.stopPropagation(); edit(${el.id})">Modifica</button>
          <button class="btn btn-danger" onclick="removeProduct(${el.id})">Elimina</button>
        </div>
      </div>
    </div>
    `;
    }else if(lastUserType===0){
    console.log("admin");
    col.innerHTML = `
      <div class="card text-center shadow-sm" id="productcard${el.id}">
        <div class="card-body" onclick="openProduct(${el.id})">
          <h5 class="card-title">${el.name}</h5>
          <p class="card-text">${el.descr}</p>
          <p class="price text-success fw-bold">€${el.costo}</p>
        </div>
      </div>`
        //admin
    }else{
      col.innerHTML = `
        <div class="card text-center shadow-sm" id="productcard${el.id}">
          <div class="card-body>
            <h5 class="card-title">${el.name}</h5>
            <p class="card-text">${el.descr}</p>
            <p class="price text-success fw-bold">€${el.costo}</p>
          </div>
        </div>`
      console.log("unlogged");
      //unlogged
    }
    } else if (currentView === "list") {
      // Template per la modalità lista:
      // Dispone l'immagine a sinistra e le info sulla destra, in una card più "lineare"
      col.className = "col-12 mb-3";
      col.innerHTML = `
        <div class="card shadow-sm" id="productcard${el.id}">
          <div class="row g-0">
            <div class="col-md-2">
            </div>
            <div class="col-md-10">
              <div class="card-body" onclick="openProduct(${el.id})">
                <h5 class="card-title">${el.name}</h5>
                <p class="card-text">${el.descr}</p>
                <p class="card-text"><small class="text-muted">€${el.costo}</small></p>
                <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart(${el.id}, '${el.name}', ${el.costo})">
                  Aggiungi al carrello
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    container.appendChild(col);
  });
}

// --- FUNZIONE PER CAMBIARE MODALITÀ DI VISUALIZZAZIONE ---
function setViewMode(mode) {
  currentView = mode;
  renderProducts(window.lastLoadedProducts);
}

// --- FUNZIONI DI DELEGAZIONE ---
function addToCart(id, name, price) {
  window.parent.addToCart(id, name, price);
}

function openProduct(id) {
  console.log("Apri prodotto:", id);
  window.parent.openProduct(id);
}

async function removeProduct(id) {
  try {
    const response = await fetch("/product", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pid: id })
    });
    if (!response.ok && response.status !== 404) {
      // Gestisci eventuali errori
    }
    const element = document.getElementById("productcard" + id);
    if (element) element.remove();
  } catch (error) {
    console.error(error);
    alert("Errore di rete.");
  }
}

function report(id) {
  window.parent.report(id);
}

function edit(id){
  window.parent.edit(id)
}

// --- Assegnazione dei listener una volta che il DOM è pronto ---
document.addEventListener("DOMContentLoaded", () => {
  // Carica i prodotti dal server senza filtri iniziali
  loadFromServer();

  // Imposta i listener per il pulsante di ricerca
  const btnSearch = document.getElementById("btn-search");
  if (btnSearch) {
    btnSearch.addEventListener("click", cerca);
  }

  // Imposta i listener per il cambio modalità visuale:
  const btnViewCard = document.getElementById("view-card");
  const btnViewList = document.getElementById("view-list");
  const btnViewFullscreen = document.getElementById("view-fullscreen");
  if (btnViewCard) btnViewCard.addEventListener("click", () => setViewMode("card"));
  if (btnViewList) btnViewList.addEventListener("click", () => setViewMode("list"));
  if (btnViewFullscreen) btnViewFullscreen.addEventListener("click", () => setViewMode("fullscreen"));
});
