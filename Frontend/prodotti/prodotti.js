let currentView = "card";
window.lastLoadedProducts = [];
window.lastUserType = null; 

async function cerca() {
  const txt = document.getElementById("searchbar").value.trim();
  let filters = getfilters();
  console.log("Filters iniziali:", filters);
  if (txt) {
    console.log("Ricerca:", txt);
    filters.search = txt;
  } else {
    console.log("Campo di ricerca vuoto");
  }
  loadFromServer(filters);
}


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
      showNoProductCard();
    } else {
      
      window.lastLoadedProducts = data.prodotti;
      window.lastUserType = data.usertype;
      
      renderProducts(window.lastLoadedProducts);
    }
  } catch (error) {
    console.error(error);
    alert("Errore di rete");
  }
}

function renderProducts(data) {
  const container = document.getElementById("lista-prodotti");
  container.innerHTML = "";
  
  if (currentView === "list") {
    container.className = "row";
    container.removeAttribute("style");
  } else if (currentView === "fullscreen") {
    container.className = "d-flex overflow-auto flex-row gap-4 px-4";
    container.style.scrollSnapType = "x mandatory";
  } else {
    container.className = "row justify-content-center";
    container.removeAttribute("style");
  }

  if(!data || data.prodotti === 0){
    showNoProductCard();
    console.log("AAAAA");
  }
  else{
      data.forEach(el => {
      const col = document.createElement("div");
      
      if (currentView === "card" || currentView === "fullscreen") {
        col.className = "col-md-4 mb-5 mt-5";
        
        if (lastUserType === 1) {
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
        col.className = "col-12 mb-3";
        
        if (lastUserType === 1) {  
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
}

function setViewMode(mode) {
  currentView = mode;
  renderProducts(window.lastLoadedProducts);
}

function edit(productId){
  window.parent.edit(productId) 
}

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

document.addEventListener("DOMContentLoaded", () => {
  loadFromServer();

  const btnSearch = document.getElementById("btn-search");
  if (btnSearch) {
    btnSearch.addEventListener("click", cerca);
  }

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

function showNoProductCard() {
  const container = document.getElementById("lista-prodotti");
  if (container) {
    container.innerHTML = "";

    const col = document.createElement("div");
    col.className = "col-12 mb-5 mt-5";

    col.innerHTML = `
      <div class="card text-center shadow-sm">
        <div class="card-body">
          <h5 class="card-title">Nessun prodotto stronzo</h5>
        </div>
      </div>
    `;
    container.appendChild(col);
  } else {
    console.warn("Container 'lista-prodotti' non trovato.");
  }
}
function clearFiltro(){
  window.location.reload();
}