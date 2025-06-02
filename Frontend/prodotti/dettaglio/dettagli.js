// Simulazione fetch prodotti (da localStorage o variabile globale)
function getProdotti() {
  return JSON.parse(localStorage.getItem("prodotti")) || [];
}

// Estrai ID da URL
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/* 
  Funzione che popola i campi dell'HTML con i dati del prodotto.
  Si assume che l'oggetto prodotto (p) contenga almeno le proprietà:
  - name
  - descr    (descrizione)
  - costo
  - quantita (eventuale quantità)
  - categoria
*/
function mostraDettaglioProdotto(p) {
  console.log("nome=" + p.name);
  
  document.getElementById("nome").textContent = p.name;
  document.getElementById("descrizione").textContent = p.descr;
  document.getElementById("prezzo").textContent = p.costo;
  document.getElementById("quantita").textContent = p.quantita || "0";
  document.getElementById("categoria").textContent = p.categoria || "non specificata";
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

// Alias per l'handler del pulsante "Torna Indietro"
function goBack() {
  closeProduct();
}

// Init: recupera l'ID, chiama l'API e popola la pagina
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  
  const id = params.get("id");

  try {
    const response = await fetch("/getProducts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id })
    });
    
    const data = await response.json();

    if (!response.ok) {
      console.log(response.status + "\n" + response.err);
      // Visualizza un messaggio di errore all'interno del paragrafo "descrizione"
      document.getElementById("descrizione").innerHTML = `
        <div class="alert alert-danger">Errore nel caricamento del prodotto.</div>
      `;
    } else {
      console.log("Prodotto caricato correttamente");
      if (data.prodotti && data.prodotti.length > 0) {
        mostraDettaglioProdotto(data.prodotti[0]);
      } else {
        document.getElementById("descrizione").innerHTML = `
          <div class="alert alert-warning">Prodotto non trovato.</div>
        `;
      }
    }
  } catch (err) {
    console.log(err);
    alert("Errore di rete.");
  }
});
