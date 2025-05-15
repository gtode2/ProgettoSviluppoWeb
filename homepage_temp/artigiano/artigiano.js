// Funzione per caricare i prodotti
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
    try {
      fetch('/addProduct', {
        method:'POST',
        headers:{'Content-Type': 'application/json'},
        body:JSON.stringify(msg)             
      })
      .then(async res =>{
        console.log("RES");
        
        const data = await res.json()
        if (!res.ok) {
          console.log("BBBBB");
          
          //gestione errori caricamento prodotto
          //if(res.status===xxx){}
          //
        }else{
          const iframe = document.getElementById("prodotti-iframe")
          const iframeWin = iframe.contentWindow;
          const id = data.id        
          if (iframeWin && typeof iframeWin.addProduct === "function") {
            iframeWin.addProduct(document.getElementById("nome").value, document.getElementById("nome").value,document.getElementById("descrizione").value , document.getElementById("prezzo").value, id);
          } else {
            console.error("Funzione addProduct non trovata!");
          }
        }
      })
    } catch (error) {
      console.log(error);
      
    }
  })
})