// Funzione per caricare i prodotti
// Imposta gli event listener per aprire e chiudere l'overlay Artigiano
function gestisciOverlayArtigiano() {
  const btnApriOverlay = document.getElementById("btn-toggle-overlay");
  const btnChiudiOverlay = document.getElementById("btn-close-overlay");
  const overlayArtigiano = document.getElementById("admin-overlay");

  // Quando clicchi il pulsante di apertura, aggiungi la classe "aperto"
  btnApriOverlay.addEventListener("click", function() {
    overlayArtigiano.classList.add("aperto");
  });

  // Quando clicchi il pulsante di chiusura, rimuovi la classe "aperto"
  btnChiudiOverlay.addEventListener("click", function() {
    overlayArtigiano.classList.remove("aperto");
  });
}

// Codice da eseguire dopo il caricamento totale del DOM
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM Caricato");
  gestisciOverlayArtigiano();
  
  const send = document.getElementById("sendProduct");
  send.addEventListener("click", async (event) => {
    console.log("Invio prodotto");
    
    event.preventDefault();  // Potrai rimuovere questo parametro al cambio della gestione del form
    const msg = {
      name: document.getElementById("nome").value,
      descr: document.getElementById("descrizione").value,
      price: document.getElementById("prezzo").value,
      amm: document.getElementById("quantita").value
      // img può essere aggiunta se necessario
    };




    try {
      const response = await fetch("/addProduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg)
      
      })
      const data = await response.json()
      console.log("Risposta ricevuta")

      if (!response.ok) {
          // Inserisci qui la gestione degli errori (es. res.status per errori specifici)
          console.log("ERRORE");
          
      }else{
        console.log("prodotto inserito correttamente \n tentativo modifica prodotti");
        
        const iframe = document.getElementById("prodotti-iframe");
        const iframeWin = iframe.contentWindow;
        const id = data.id;
        /*
        if (iframeWin && typeof iframeWin.addProduct === "function") {
          iframeWin.addProduct(
            document.getElementById("nome").value,
            document.getElementById("nome").value,
            document.getElementById("descrizione").value,
            document.getElementById("prezzo").value,
            id
          )
        */
          console.log("svuotamento inserimento prodotti");
          
          document.getElementById("nome").value = ""
          document.getElementById("descrizione").value = ""
          document.getElementById("prezzo").value = ""
          document.getElementById("quantita").value = ""
        /*
        } else {
          console.error("Funzione addProduct non trovata nell'iframe!");
        }
        */
      }
    } catch (err) {
        console.log(err);
        alert("Errore di rete.");
    }
  })
})