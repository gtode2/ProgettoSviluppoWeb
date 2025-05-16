async function caricaProdotti() {
  try {
    const res = await fetch("/getProducts",{
            method: "POST",
            headers: { "Content-Type": "application/json" }
    })


    const data = await res.json()
    const container = document.querySelector(".row");
    container.innerHTML = "";
    const usertype = data.usertype
    console.log("usertype = "+usertype);
    
    data.prodotti.forEach(el => {
      console.log(el.name);
      console.log(el);
      
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";
      
      
      col.innerHTML = `
      <div class="card text-center shadow-sm">
        <img src="${el.immagine}" class="card-img-top" alt="${el.name}">
        <div class="card-body">
          <h5 class="card-title">${el.name}</h5>
          <p class="card-text">${el.descr}</p>
          <p class="price text-success fw-bold">€${el.costo}</p>`;
    if (usertype===1) {
      col.innerHTML=col.innerHTML+`
      <div class="d-flex justify-content-center gap-2 product-actions cliente">
            <button class="btn btn-primary aggiungi-carrello" onclick="addToCart(${el.id},'${el.name}',${el.costo})" >Aggiungi al carrello</button>
            <button class="btn btn-outline-primary">Rimuovi</button>
            <button class="btn btn-outline-primary" onclick="report(${el.id})">Segnala</button>
          </div>
          </div>
        </div>
      </div>
      
      `
    }else if(usertype===2){
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

  } catch (error) {
    console.log(error);
    
  }
}
//aggiornare add product a nuovo sistema di rappresentazione prodotti
function addProduct(name, image, descr, cost, id) {
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
  
  
  caricaProdotti()

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
