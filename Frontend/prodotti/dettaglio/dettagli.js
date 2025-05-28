// Simulazione fetch prodotti (da localStorage o variabile globale)
function getProdotti() {
  return JSON.parse(localStorage.getItem("prodotti")) || [];
}

// Estrai ID da URL
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Mostra prodotto
function mostraDettaglioProdotto(p) {
  const container = document.getElementById("dettaglio-prodotto");

  container.innerHTML = `
    <div class="card">
      <img src="${p.immagine}" class="card-img-top" alt="${p.name}">
      <div class="card-body">
        <h5 class="card-title">${p.name}</h5>
        <p class="card-text">${p.descr}</p>
        <p class="card-text"><strong>Prezzo:</strong> €${p.costo}</p>
        <p class="card-text"><small class="text-muted">Categoria: ${p.categoria || 'non specificata'}</small></p>
      </div>
    </div>
  `;
}


// Init
document.addEventListener("DOMContentLoaded", async() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id")
  try {
    const response = await fetch("/getProducts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({id:id})
    })
    const data = await response.json()    

    if (!response.ok) {
      //gestione errore
    }else{      
      mostraDettaglioProdotto(data.prodotti[0]);
    }
  } catch (err) {
    console.log(err);
    alert("Errore di rete.");
  }
});


// Funzione per chiudere il dettaglio del prodotto
function closeProduct() {
  if (window.parent && window.parent.document) {
    const overlay = window.parent.document.getElementById("dettagli-overlay");
    const frame = window.parent.document.getElementById("dettagli-frame");
    if (overlay && frame) {
      frame.src = "";
      overlay.classList.add("d-none");
    }
  } else {
    window.location.href = "../prodotti/prodotti.html";
  }
}
