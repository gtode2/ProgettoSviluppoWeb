function getActIdFromUrl() {
  const params = new URLSearchParams(window.location.search);  
  return params.get("actid");
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
  document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(max-width: 768px)").matches) {
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
      document.getElementById("descrizione").innerHTML = `
        <div class="alert alert-danger">Errore nel caricamento dell'Artigiano.</div>
      `;
      if (response.status===400) {
        alert("id attività mancante")
      }else if (response.status===500) {
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
    } else {
      console.log("Prodotti caricati correttamente");
      console.log(data.act);
      
      document.getElementById("nome").innerText = data.act.nome
      document.getElementById("indirizzo").innerText = data.act.indirizzo
      document.getElementById("email").innerText = data.act.email
      document.getElementById("ntel").innerText = data.act.ntel
      document.getElementById("descrizione").innerText = data.act.descr
    }
  } catch (err) {
    console.error(err);
    alert("Errore di rete.");
  }
});