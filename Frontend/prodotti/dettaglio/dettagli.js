function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function mostraDettaglioProdotto(p) {
  console.log("Prodotto ricevuto:", p);
  document.getElementById("nome").textContent = p.name;
  document.getElementById("descrizione").textContent = p.descr;
  document.getElementById("prezzo").textContent = p.costo;
  document.getElementById("quantita").textContent =
    (p.amm !== undefined && p.amm !== null) ? p.amm : "0";
  document.getElementById("categoria").textContent = p.cat || "non specificata";
  document.getElementById("artigiano").textContent = p.nome_attivita
  document.getElementById("artigiano").onclick = function () {
    art(p.actid)
  }
  console.log(p);
  
}

function closeProduct() {
  console.log("close");
  if (window.parent && typeof window.parent.closeProduct === 'function') {
    window.parent.closeProduct();
  } else {
    window.history.back();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const id = getProductIdFromUrl();
  console.log("ID prodotto estratto dalla URL:", id);

  try {
    const response = await fetch("/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id })
    });
          
    const data = await response.json();

    if (response.ok) {
      console.log("Prodotti caricati correttamente");
      if (data.prodotti && data.prodotti.length > 0) {
        const prodottoSelezionato = data.prodotti.find(prod => String(prod.id) === id);
        if (prodottoSelezionato) {
          mostraDettaglioProdotto(prodottoSelezionato);
        } else {
          document.getElementById("descrizione").innerHTML = `
            <div class="alert alert-warning">Prodotto non trovato.</div>
          `;
        }
      } else {
        document.getElementById("descrizione").innerHTML = `
          <div class="alert alert-warning">Prodotto non trovato.</div>
        `;
      }
    }
  } catch (err) {
    document.getElementById("descrizione").innerHTML = `
        <div class="alert alert-danger">Errore nel caricamento del prodotto.</div>
      `;
    console.error(err);
    alert("Errore di rete.");
    
  }
});

function art(actid) {
  console.log("art");
  window.location.href=`/artigiano/dettaglio/dettagliArtigiano.html?actid=${actid}`  
}