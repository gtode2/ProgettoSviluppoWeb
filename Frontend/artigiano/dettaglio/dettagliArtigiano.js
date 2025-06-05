function getActIdFromUrl() {
  const params = new URLSearchParams(window.location.search);  
  return params.get("actid");
}

// Popola i campi HTML con i dati del prodotto
function mostraDettaglioProdotto(p) {
  console.log("Prodotto ricevuto:", p);
  document.getElementById("nome").textContent = p.name;
  document.getElementById("descrizione").textContent = p.descr;
  document.getElementById("prezzo").textContent = p.costo;
  document.getElementById("quantita").textContent =
    (p.amm !== undefined && p.amm !== null) ? p.amm : "0";
  document.getElementById("categoria").textContent = p.cat || "non specificata";
  document.getElementById("artigiano").textContent = p.nome_attivita
}

// Funzione per chiudere il dettaglio del prodotto
function closeProduct() {
  console.log("close");
  if (window.parent && typeof window.parent.closeProduct === 'function') { 
    window.parent.closeProduct();
  } else {
    window.history.back();
  }
}
  
// Inizializzazione: recupera l'ID, chiama l'API e popola la pagina
document.addEventListener("DOMContentLoaded", async () => {
  document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(max-width: 768px)").matches) {
    // Redirect immediato alla pagina "modifica.html"
    window.location.href = "/Frontend/artigiano/dettaglio/dettagliArtigiano.html";
  }
});

  const actid = getActIdFromUrl();
  try {
    const response = await fetch(`/artigiano?actid=${actid}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    const data = await response.json();
    if (!response.ok) {

      //gestione errori

      document.getElementById("descrizione").innerHTML = `
        <div class="alert alert-danger">Errore nel caricamento dell'Artigiano.</div>
      `;
    } else {
      console.log("Prodotti caricati correttamente");
      console.log(data.act);
      
      document.getElementById("nome").innerText = data.act.nome
      document.getElementById("indirizzo").innerText = data.act.indirizzo
      document.getElementById("email").innerText = data.act.email
      document.getElementById("ntel").innerText = data.act.ntel
      document.getElementById("descrizione").innerText = data.act.descr

      /*
      
      if (data.prodotti && data.prodotti.length > 0) {
        const prodottoSelezionato = data.prodotti.find(prod => String(prod.id) === id);
        if (prodottoSelezionato) {
          mostraDettaglioProdotto(prodottoSelezionato);
        } else {
          document.getElementById("descrizione").innerHTML = `
            <div class="alert alert-warning">Artigiano non trovato.</div>
          `;
        }
      } else {
        document.getElementById("descrizione").innerHTML = `
          <div class="alert alert-warning">Artigiano non trovato.</div>
        `;
      }

      */
    }
  } catch (err) {
    console.error(err);
    alert("Errore di rete.");
  }
});