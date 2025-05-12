class Carrello {
  constructor() {
    this.prodotti = JSON.parse(localStorage.getItem("carrello")) || [];
  }

  aggiungi(prodotto) {
    this.prodotti.push(prodotto);
    this.salva();
  }

  rimuovi(index) {
    this.prodotti.splice(index, 1);
    this.salva();
  }

  svuota() {
    this.prodotti = [];
    this.salva();
  }

  salva() {
    localStorage.setItem("carrello", JSON.stringify(this.prodotti));
  }

  getTotale() {
    return this.prodotti.reduce((tot, p) => tot + p.prezzo, 0);
  }

  stampa() {
    console.table(this.prodotti);
  }

  getLista() {
    return this.prodotti;
  }
}

// Esempio d'uso:
const carrello = new Carrello();

// Da usare in prodotti.js ad esempio:
function aggiungiAlCarrello(nome, prezzo) {
  carrello.aggiungi({ nome, prezzo });
  alert(`✅ ${nome} aggiunto al carrello!`);
}
