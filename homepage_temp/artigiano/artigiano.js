async function caricaProdotti() {
  const res = await fetch('../backend/prodotti.php');
  const prodotti = await res.json();

  const contenitore = document.getElementById("lista-prodotti");
  contenitore.innerHTML = "";

  prodotti.forEach(prod => {
    const div = document.createElement("div");
    div.className = "prodotto";
    div.innerHTML = `
      <h3>${prod.nome}</h3>
      <p>${prod.descrizione}</p>
      <strong>€${prod.prezzo}</strong>
      <div class="azioni">
        <button onclick="modificaProdotto(${prod.id})">Modifica</button>
        <button onclick="rimuoviProdotto(${prod.id})">Elimina</button>
      </div>
    `;
    contenitore.appendChild(div);
  });
}

caricaProdotti();
