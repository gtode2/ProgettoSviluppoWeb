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
      res = await fetch("/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters: filters })
      });
    } else {
      console.log("Caricamento prodotti senza filtri");
      res = await fetch("/product", {
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
    // Template per la modalità "card" o "fullscreen"
    col.className = "col-md-4 mb-5 mt-5";
    
    if (lastUserType === 1) {
      // Caso "cliente"
      col.innerHTML = `
        <div class="card text-center shadow-sm" id="productcard${el.id}">
          <div class="card-body">
            <h5 class="card-title">${el.name}</h5>
            <p class="card-text">${el.descr}</p>
            <p class="card-text">${el.cat}</p>
            <p class="price text-success fw-bold">€${el.costo}</p>
            <p class="nome artigiano"></p>
            
            <div class="d-flex flex-column gap-2 product-actions cliente">
              <div class="d-flex justify-content-center gap-2">
                ${
                  el.amm > 0 
                  ? `
                    <button class="btn btn-primary aggiungi-carrello" onclick="event.stopPropagation(); addToCart(${el.id}, '${el.name}', ${el.costo})">Aggiungi al carrello</button>
                  `
                  : `<button class="btn btn-danger" disabled>Quantità finita</button>`
                }
                <button class="btn btn-outline-primary" onclick="event.stopPropagation(); report(${el.id})">Segnala</button>
              </div>
              <button class="btn btn-secondary w-100" onclick="event.stopPropagation(); openProduct(${el.id})">Dettagli</button>
            </div>
          </div>
        </div>
      `;
    } else if (lastUserType === 2) {
      // Caso "artigiano"
      col.innerHTML = `
        <div class="card text-center shadow-sm" id="productcard${el.id}">
          <div class="card-body">
            <h5 class="card-title">${el.name}</h5>
            <p class="card-text">${el.descr}</p>
            <p class="card-text">${el.cat}</p>
            <p class="price text-success fw-bold">€${el.costo}</p>
            
            <div class="d-flex flex-column gap-2 product-actions artigiano">
              <div class="d-flex justify-content-center gap-2">
                ${ el.amm <= 0 ? `<p class="text-danger fw-bold m-0">Quantità 0</p>` : `` }
                <button class="btn btn-warning" onclick="event.stopPropagation(); edit(${el.id})">Modifica</button>
                <button class="btn btn-danger" onclick="event.stopPropagation(); removeProduct(${el.id})">Elimina</button>
              </div>
              <button class="btn btn-secondary w-100" onclick="event.stopPropagation(); openProduct(${el.id})">Dettagli</button>
            </div>
          </div>
        </div>
      `;
    } else if (lastUserType === 0) {
      // Caso "admin"
      console.log("admin");
      col.innerHTML = `
        <div class="card text-center shadow-sm" id="productcard${el.id}">
          <div class="card-body">
            <h5 class="card-title">${el.name}</h5>
            <p class="card-text">${el.descr}</p>
            <p class="card-text">${el.cat}</p>
            <p class="price text-success fw-bold">€${el.costo}</p>
            
            <div class="d-flex flex-column gap-2 product-actions admin">
              <button class="btn btn-secondary w-100" onclick="event.stopPropagation(); openProduct(${el.id})">Dettagli</button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Caso "unlogged" o non definito
      col.innerHTML = `
        <div class="card text-center shadow-sm" id="productcard${el.id}">
          <div class="card-body">
            <h5 class="card-title">${el.name}</h5>
            <p class="card-text">${el.descr}</p>
            <p class="card-text">${el.cat}</p>
            <p class="price text-success fw-bold">€${el.costo}</p>
            
            <div class="d-flex flex-column gap-2 product-actions unlogged">
              <button class="btn btn-secondary w-100" onclick="event.stopPropagation(); openProduct(${el.id})">Dettagli</button>
            </div>
          </div>
        </div>
      `;
      console.log("unlogged");
    }
    
  } else if (currentView === "list") {
    // Template per la modalità lista: immagine a sinistra e info a destra
    col.className = "col-12 mb-3";
    
    if (lastUserType === 1) {  
      // Caso "cliente"
      col.innerHTML = `
        <div class="card shadow-sm" id="productcard${el.id}">
          <div class="row g-0">
            <div class="col-md-2">
              <!-- eventuale immagine o placeholder -->
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">${el.name}</h5>
                <p class="card-text">${el.descr}</p>
                <p class="card-text">${el.cat}</p>
                <p class="card-text"><small class="text-muted">€${el.costo}</small></p>
                
                <!-- Contenitore dei pulsanti allineati a destra -->
                <div class="d-flex justify-content-end gap-2 ps-2">
                  ${
                    el.amm > 0
                      ? `<button class="btn btn-primary" onclick="event.stopPropagation(); addToCart(${el.id}, '${el.name}', ${el.costo})">Aggiungi al carrello</button>`
                      : `<button class="btn btn-danger" disabled>Quantità finita</button>`
                  }
                  <button class="btn btn-outline-primary" onclick="event.stopPropagation(); report(${el.id})">Segnala</button>
                  <button class="btn btn-secondary" onclick="event.stopPropagation(); openProduct(${el.id})">Dettagli</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (lastUserType === 2) {  
      // Caso "artigiano"
      col.innerHTML = `
        <div class="card shadow-sm" id="productcard${el.id}">
          <div class="row g-0">
            <div class="col-md-2">
              <!-- eventuale immagine o placeholder -->
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">${el.name}</h5>
                <p class="card-text">${el.descr}</p>
                <p class="card-text">${el.cat}</p>
                <p class="card-text"><small class="text-muted">€${el.costo}</small></p>
                
                <!-- Contenitore dei pulsanti allineati a destra -->
                <div class="d-flex justify-content-end gap-2 ps-2">
                  ${ el.amm <= 0 ? `<p class="text-danger fw-bold m-0">Quantità 0</p>` : `` }
                  <button class="btn btn-warning" onclick="event.stopPropagation(); edit(${el.id})">Modifica</button>
                  <button class="btn btn-danger" onclick="event.stopPropagation(); removeProduct(${el.id})">Elimina</button>
                  <button class="btn btn-secondary" onclick="event.stopPropagation(); openProduct(${el.id})">Dettagli</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (lastUserType === 0) {  
      // Caso "admin"
      col.innerHTML = `
        <div class="card shadow-sm" id="productcard${el.id}">
          <div class="row g-0">
            <div class="col-md-2">
              <!-- eventuale immagine o placeholder -->
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">${el.name}</h5>
                <p class="card-text">${el.descr}</p>
                <p class="card-text">${el.cat}</p>
                <p class="card-text"><small class="text-muted">€${el.costo}</small></p>
                
                <!-- Contenitore dei pulsanti allineati a destra -->
                <div class="d-flex justify-content-end gap-2 ps-2">
                  <button class="btn btn-secondary" onclick="event.stopPropagation(); openProduct(${el.id})">Dettagli</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {  
      // Caso "unlogged" o non definito
      col.innerHTML = `
        <div class="card shadow-sm" id="productcard${el.id}">
          <div class="row g-0">
            <div class="col-md-2">
              <!-- eventuale immagine o placeholder -->
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <h5 class="card-title">${el.name}</h5>
                <p class="card-text">${el.descr}</p>
                <p class="card-text">${el.cat}</p>
                <p class="card-text"><small class="text-muted">€${el.costo}</small></p>
                
                <!-- Contenitore dei pulsanti allineati a destra -->
                <div class="d-flex justify-content-end gap-2 ps-2">
                  <button class="btn btn-secondary" onclick="event.stopPropagation(); openProduct(${el.id})">Dettagli</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      console.log("unlogged");
    }
  }
  
  container.appendChild(col);
});

}

// --- FUNZIONE PER CAMBIARE MODALITÀ DI VISUALIZZAZIONE ---
function setViewMode(mode) {
  currentView = mode;
  renderProducts(window.lastLoadedProducts);
}

function edit(productId){
  if(window.innerWidth<= 768){
    window.location.href = "/Frontend/artigiano/modifica/modifica.html?id=" + productId;
  }else{
    window.parent.edit(productId)
  }  
}

// --- FUNZIONI DI DELEGAZIONE ---
function addToCart(id, name, price) {
  const validPrice = validateAndFormatPrice(price);
  if(validPrice === null){
    alert("Prodotto non aggiunto: \n si prega di inserire un prezzo valido")
    return;
  }
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
      body: JSON.stringify({pid:id})
    })
    if (!response.ok) {
      if (response.status!==404) {
        //gestione errori 
      }
    }else{
      const element = document.getElementById("productcard"+id)
      element.remove()
    }
  } catch (err) {
    console.log(err);
    alert("Errore di rete.");
  }
}
function report(id) {
  window.parent.report(id);
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
  const btnwarning = document.getElementById("modifica");
  const btnViewCard = document.getElementById("view-card");
  const btnViewList = document.getElementById("view-list");
  const btnViewFullscreen = document.getElementById("view-fullscreen");
  if (btnViewCard) btnViewCard.addEventListener("click", () => setViewMode("card"));
  if (btnViewList) btnViewList.addEventListener("click", () => setViewMode("list"));
  if (btnViewFullscreen) btnViewFullscreen.addEventListener("click", () => setViewMode("fullscreen"));
  if (btnwarning) btnwarning.addEventListener('click', function(){
        window.location.href = "Frontend/artigiano/modifica/modifica.html";
  })
});

//function per validare un prezzo
function validateAndFormatPrice(input){
  if(typeof input === "string"){
    input = input.trim();
    if(input === ""){
      alert("il campo prezzo non può essere vuoto");
      return;
    }
  }
  const num = parseFloat(input);
  if(isNaN(num)){
    alert("Prezzo non valido: deve essere un numero");
    return;
  }
  if(num <= 0){
    alert("Il prezzo deve essere maggiore di 0");
    return;
  }
  return num.toFixed(2);
}