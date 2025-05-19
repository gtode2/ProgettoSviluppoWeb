document.addEventListener("DOMContentLoaded", () => {
  const tipoUtente = document.body.dataset.utente;
  if (tipoUtente === "cliente" || tipoUtente === "artigiano") {
    creaBottoneFiltro();
    caricaModaleFiltri();
  }
});

function creaBottoneFiltro() {
  const navForm = document.querySelector("form.form-inline");
  const btn = document.createElement("button");
  btn.className = "btn btn-outline-primary ms-2";
  btn.setAttribute("data-bs-toggle", "modal");
  btn.setAttribute("data-bs-target", "#filtroModal");
  btn.innerText = "Filtri";
  navForm.appendChild(btn);
}

function caricaModaleFiltri() {
  fetch("filtri.html")
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("beforeend", html);
    })
    .catch(err => console.error("Errore nel caricamento dei filtri:", err));
}
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
