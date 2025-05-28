// Funzione per caricare i prodotti
// Imposta gli event listener per aprire e chiudere l'overlay Artigiano
// Funzione per caricare i prodotti
// Imposta gli event listener per aprire e chiudere l'overlay Artigiano
document.addEventListener('DOMContentLoaded', function () {
  const btnToggle   = document.getElementById('btn-toggle-overlay');
  const btnClose    = document.getElementById('btn-close-overlay');
  const overlay     = document.getElementById('admin-overlay');
  const btnUserInfo = document.getElementById('btn-toggle-overlay2');

  // Apertura overlay: su mobile il pulsante apre l'overlay a full screen
  btnToggle.addEventListener('click', function () {
    overlay.classList.add('visible');
    btnToggle.classList.add('d-none'); // Nasconde il pulsante di apertura
  });

  // Chiusura overlay: il bottone chiude l'overlay e ripristina il pulsante mobile
  btnClose.addEventListener('click', function () {
    overlay.classList.remove('visible');
    btnToggle.classList.remove('d-none');
  });

  btnUserInfo.addEventListener('click', function () {
    window.location.href = '../userArea/userArea.html';
  });
});

// Codice da eseguire dopo il caricamento totale del DOM
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Caricato");
  gestisciOverlayArtigiano();

  // Gestione del form che si trova nell'iframe "inserimento.html"
  const iframeInserimento = document.getElementById("iframe-inserimento");

  // Quando l'iframe ha finito di caricare il suo contenuto...
  iframeInserimento.addEventListener("load", function () {
    // Accediamo al documento interno dell'iframe
    const iframeDoc =
      iframeInserimento.contentDocument || iframeInserimento.contentWindow.document;
    const send = iframeDoc.getElementById("sendProduct");

    send.addEventListener("click", async (event) => {
      console.log("Invio prodotto dall'iframe");
      event.preventDefault(); // Previene il comportamento default del submit

      // Recupera i valori del form dall'iframe
      const msg = {
        name: iframeDoc.getElementById("nome").value,
        descr: iframeDoc.getElementById("descrizione").value,
        price: iframeDoc.getElementById("prezzo").value,
        amm: iframeDoc.getElementById("quantita").value
      };

      try {
        const response = await fetch("/addProduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg)
        });

        const data = await response.json();
        console.log("Risposta ricevuta", data);

        if (!response.ok) {
          console.log("ERRORE");
        } else {
          console.log("Prodotto inserito correttamente");

          // Se la pagina dei prodotti ha, ad esempio, una funzione per aggiornare la visualizzazione,
          // potresti provare a chiamarla qui utilizzando l'iframe dei prodotti.
          const iframeProdotti = document.getElementById("prodotti-iframe");
          /* Esempio:
          if (
            iframeProdotti.contentWindow &&
            typeof iframeProdotti.contentWindow.addProduct === "function"
          ) {
            iframeProdotti.contentWindow.addProduct(
              msg.name,
              msg.descr,
              msg.price,
              data.id
            );
          }
          */

          // Svuota i campi del form
          iframeDoc.getElementById("nome").value = "";
          iframeDoc.getElementById("descrizione").value = "";
          iframeDoc.getElementById("prezzo").value = "";
          iframeDoc.getElementById("quantita").value = "";
        }
      } catch (err) {
        console.error(err);
        alert("Errore di rete.");
      }
    });
  });
});
