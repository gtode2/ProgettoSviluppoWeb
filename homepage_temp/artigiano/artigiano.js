// Funzione per caricare i prodotti
async function caricaProdotti() {
  try {
    const res = await fetch("../backend/prodotti.php");
    if (!res.ok) throw new Error("Errore nel recupero dei prodotti");
    const prodotti = await res.json();

    const contenitore = document.getElementById("lista-prodotti");
    contenitore.innerHTML = ""; // Pulizia del contenitore

    prodotti.forEach(prod => {
      const div = document.createElement("div");
      div.className = "prodotto";
      div.innerHTML = `
        <h3>${prod.nome}</h3>
        <p>${prod.descrizione}</p>
        <strong>€${prod.prezzo}</strong>
        <div class="azioni">
          <button onclick="modificaProdotto(${prod.id})">Modifica</button>
          <button onclick="rimuoviProdotto(${prod.id})">Elimina</button>
        </div>
      `;
      contenitore.appendChild(div);
    });
  } catch (error) {
    console.error("Errore durante il caricamento dei prodotti:", error);
  }
}

// Imposta gli event listener per aprire e chiudere l'overlay Artigiano
function gestisciOverlayArtigiano() {
  const btnApriOverlay = document.getElementById("btn-toggle-overlay");
  const btnChiudiOverlay = document.getElementById("btn-close-overlay");
  const overlayArtigiano = document.getElementById("admin-overlay");

  // Quando viene cliccato il bottone per aprire, aggiunge la classe "active"
  btnApriOverlay.addEventListener("click", function() {
    overlayArtigiano.classList.add("active");
  });

  // Quando viene cliccato il bottone per chiudere, la rimuove
  btnChiudiOverlay.addEventListener("click", function() {
    overlayArtigiano.classList.remove("active");
  });
}

// Codice da eseguire dopo il caricamento totale del DOM
document.addEventListener("DOMContentLoaded", function() {
  console.log("loaded");
  
  caricaProdotti();
  gestisciOverlayArtigiano();
  const send = document.getElementById("sendProduct")
  send.addEventListener("click", async (event)=>{
    console.log("send");
    
    event.preventDefault()
    //RIMUOVERE PREVENTDEFAULT E PARAMETRO EVENT UNA VOLTA RIMOSSO IL FORM E SISTEMATO IL CSS
    const msg = {
      name: document.getElementById("nome").value,
      descr: document.getElementById("descrizione").value,
      price: document.getElementById("prezzo").value,
      amm: document.getElementById("quantita").value
      //img: 
    }
    await fetch('/addProduct', {
      method:'POST',
      headers:{'Content-Type': 'application/json'},
      body:JSON.stringify(msg)             
    })
    .then(async res =>{
      const data = await res.json()
      if (!res.ok) {
        //gestione errori caricamento prodotto
        //if(res.status===xxx){}
        //
      }
    })
  })
})