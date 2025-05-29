let applica = false
document.addEventListener("DOMContentLoaded", async() => {
  const modalEl = document.getElementById('modalFiltri');
  const closebtn = document.getElementById("apply")

  //caricamento produttori
  try {
    const res = await fetch("/artigiani",{
      method: "POST",
      headers: { "Content-Type": "application/json" }})
    const data = await res.json()
    if (data!==0) {
      const block = document.getElementById("produttori")
      data.art.forEach(el => {
        const option = document.createElement("option")
        option.value = el.actid
        option.textContent = el.nome
        block.appendChild(option)
      });
    }else{
      //rimuovere selezione
    }
  } catch (error) {
    console.log(error);
    
  }

  closebtn.addEventListener("click", () => {
      applica = true
      console.log("Filtri applicati");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      cerca()
    });

  modalEl.addEventListener('hidden.bs.modal', function () {
    if (!applica) {
      document.getElementById('form-filtri').reset();
    }
    console.log("reset");
    applica = false
  });

  /*
  const tipoUtente = document.body.dataset.utente;
  if (tipoUtente === "cliente" || tipoUtente === "artigiano") {
    creaBottoneFiltro();
    caricaModaleFiltri();
  }
  */
});


function getfilters(){
  var filters = {}
  if (document.getElementById("categoria").value!=="default") {
    filters.cat = document.getElementById("categoria").value
    console.log("categoria");
    
  }
  if (document.getElementById("prezzoMin").value.trim()) {
    filters.min = document.getElementById("prezzoMin").value
    console.log("minimo");
  }if (document.getElementById("prezzoMax").value.trim()) {
    filters.max= document.getElementById("prezzoMax").value
    console.log("massimo");
  }
  if (document.getElementById("produttori").value.trim()!=="default") {
    filters.produttore= document.getElementById("produttori").value
    console.log("produttori");
  }
  if (document.getElementById("ordine").value.trim()!=="default") {
    filters.produttore= document.getElementById("ordine").value
    console.log("ordine");
  }
  return filters
}

/*
function caricaModaleFiltri() {
  fetch("/prodotti/filtro/filtro.html")
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("beforeend", html);
    })
    .catch(err => console.error("Errore nel caricamento dei filtri:", err));
}
*/
/*
function applicaFiltri() {
  const categoria = document.getElementById("categoria").value;
  const prezzoMin = parseFloat(document.getElementById("prezzoMin").value) || 0;
  const prezzoMax = parseFloat(document.getElementById("prezzoMax").value) || Infinity;

  // Puoi filtrare i prodotti già caricati nel DOM oppure ricaricare da backend
  const prodotti = document.querySelectorAll("#lista-prodotti .card");
  prodotti.forEach(card => {
    const prezzo = parseFloat(card.querySelector(".price").textContent.replace("€", ""));
    const matchPrezzo = prezzo >= prezzoMin && prezzo <= prezzoMax;
    const matchCategoria = categoria === "" || card.textContent.toLowerCase().includes(categoria.toLowerCase());

    card.style.display = (matchPrezzo && matchCategoria) ? "block" : "none";
  });
}
 */


