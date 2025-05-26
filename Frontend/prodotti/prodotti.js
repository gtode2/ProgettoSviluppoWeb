async function cerca(){
  const txt = document.getElementById("searchbar").value.trim()
  var filters = getfilters()
  console.log(filters);
  if (!txt) {
    console.log("vuoto");
  }else{
    console.log(txt);
    filters.search = txt
  }
  loadFromServer(filters)
}

async function loadFromServer(filters=null) {
  try {
    if (filters!==null) {
      console.log("ricerca con filtri");
      
      var res = await fetch("/getProducts",{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body:JSON.stringify({filters:filters})
    })
  }else{
    console.log("no filtri");
    
    var res = await fetch("/getProducts",{
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })
  }
  const data = await res.json()
    if (data.prodotti===0) {
      //gestione mancanza prodotti
      console.log("no prodotti");
      
    }else{
      load(data)
    }
  } catch (error) {
   console.log(error);
  alert("Errore di rete")    
  }
}


function load(data) {
  const container = document.querySelector(".row");
    container.innerHTML = "";
    const usertype = data.usertype
    console.log("usertype = "+usertype);
    
    data.prodotti.forEach(el => {
      console.log(el.name);
      console.log(el);
      
      const col = document.createElement("div");
      col.className = "col-md-4 mb-5 mt-5";
      //PT per gestire responsive
      
      col.innerHTML = `
      <div class="card text-center shadow-sm">
        <img src="${el.immagine}" class="card-img-top" alt="${el.name}">
        <div class="card-body" onclick="openProduct(${el.id})">
          <h5 class="card-title">${el.name}</h5>
          <p class="card-text">${el.descr}</p>
          <p class="price text-success fw-bold">€${el.costo}</p>`;
    if (usertype === 1) {
  col.innerHTML = col.innerHTML + `
    <div class="d-flex justify-content-center gap-2 product-actions cliente" style="padding-bottom:50px">
      <button class="btn btn-primary aggiungi-carrello" onclick="addToCart(${el.id}, '${el.name}', ${el.costo})">Aggiungi al carrello</button>
      <button class="btn btn-outline-primary" onclick="report(${el.id})">Segnala</button>
    </div>
    </div>
  </div>
</div>
  `;
}
else if(usertype===2){
      col.innerHTML=col.innerHTML+`
      <div class="d-flex justify-content-center gap-2 product-actions artigiano">
            <button class="btn btn-warning">Modifica</button>
            <button class="btn btn-danger">Elimina</button>
          </div>
        </div>
      </div>
      `
    }else if(usertype===0){
      console.log("admin");
      
      //admin
    }else{
      console.log("unlogged");
      
      //unlogged
    }
    container.appendChild(col);
  });
}



//aggiornare add product a nuovo sistema di rappresentazione prodotti
function addProduct(name, immagine, descr, costo, id) {
      var container = document.querySelector(".row");
      var col = document.createElement("div");
      col.className = "col-md-4 mb-4";
      col.innerHTML = `
      <div class="card text-center shadow-sm">
        <img src="${image}" class="card-img-top" alt="${name}">
        <div class="card-body">
          <h5 class="card-title">${name}</h5>
          <p class="card-text">${descr}</p>
          <p class="price text-success fw-bold">€${cost}</p>

          <div class="d-flex justify-content-center gap-2 product-actions cliente">
            <button class="btn btn-primary aggiungi-carrello" onclick="addToCart(${id},'${name}',${cost})">Aggiungi al carrello</button>
            <button class="btn btn-outline-primary">Rimuovi</button>
          </div>

          <div class="d-flex justify-content-center gap-2 product-actions artigiano">
            <button class="btn btn-warning">Modifica</button>
            <button class="btn btn-danger">Elimina</button>
          </div>
        </div>
      </div>
    `;
    container.prepend(col);
}
function addToCart(id, name, price){
  const iframeWin = window.parent.document.getElementById("lat-iframe").contentWindow;
  iframeWin.addToCart(id, name, price);
}
function report(id){
  window.parent.report(id);
}

document.addEventListener("DOMContentLoaded", () => {
  loadFromServer()

  const tipoUtente = document.body.dataset.utente; // "cliente" o "artigiano"

  // Mostra/Nasconde pulsanti in base al tipo utente
  document.querySelectorAll(".cliente").forEach(el => {
    el.classList.toggle("hidden", tipoUtente !== "cliente");
  });
  document.querySelectorAll(".artigiano").forEach(el => {
    el.classList.toggle("hidden", tipoUtente !== "artigiano");
  });

  /*const prodotti = [
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

  /*
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
  */

  


  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("aggiungi-carrello")) {
      const card = e.target.closest(".card");
      const titolo = card.querySelector(".card-title").textContent;
      const prezzo = parseFloat(card.querySelector(".price").textContent.replace("€", ""));
      aggiungiAlCarrello(titolo, prezzo);
    }
  });








  /*
  function aggiungiAlCarrello(nome, prezzo) {
    console.log(`Prodotto aggiunto al carrello: ${nome} - €${prezzo}`);
    // Implementazione futura
  }
  */
});
//Implementazione della componente di filtro

let currentView = "card"; // Default

function setViewMode(mode) {
  currentView = mode;
  renderProducts(lastLoadedProducts); // Rende dinamico il layout
}

/*
function cerca() {
  const query = document.getElementById("searchbar").value.trim().toLowerCase();
  if (!query) return;

  currentView = "list"; // 👈 Imposta modalità lista per ricerca

  const filtered = lastLoadedProducts.filter(p =>
    p.nome.toLowerCase().includes(query) || 
    p.descrizione.toLowerCase().includes(query)
  );

  renderProducts(filtered);
}
*/


function renderProducts(data) {
  const container = document.getElementById("lista-prodotti");
  container.innerHTML = "";

  if (currentView === "fullscreen") {
    container.className = "d-flex overflow-auto flex-row gap-4 px-4";
    container.style.scrollSnapType = "x mandatory";
  } else {
    container.className = "row justify-content-center";
    container.style = "";
  }

  data.forEach(p => {
    let card = document.createElement("div");
    let layoutClass = "";

    if (currentView === "card") {
      layoutClass = "col-md-4 mb-4";
    } else if (currentView === "list") {
      layoutClass = "col-12 mb-3";
    } else if (currentView === "fullscreen") {
      layoutClass = "flex-shrink-0";
      card.style.minWidth = "100vw";
      card.style.scrollSnapAlign = "start";
    }

    card.className = layoutClass;

    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${p.immagine}" class="card-img-top" alt="${p.nome}">
        <div class="card-body">
          <h5 class="card-title">${p.nome}</h5>
          <p class="card-text">${p.descrizione}</p>
          <p class="price text-success fw-bold">€${p.prezzo}</p>
          <button class="btn btn-primary" onclick="addToCart(${p.id}, '${p.nome}', ${p.prezzo})">Aggiungi al carrello</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Al caricamento iniziale
/*async function caricaProdotti() {
  try {
    const res = await fetch("/getProducts", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    lastLoadedProducts = data.prodotti;
    renderProducts(data.prodotti);
  } catch (err) {
    console.error(err);
  }
}*/

function openProduct(id) {
  console.log(id);
  window.parent.openProduct(id)  
}
