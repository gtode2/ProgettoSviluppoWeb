/*
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

  getLista() {
    return this.prodotti;
  }

  stampa() {
    console.table(this.prodotti);
  }
}
*/

async function addToCart(id, name, price) {
  console.log(name);
  try {
    const response = await fetch("/addCart", {
      method:"POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({id:id})
    })
    const data = await response.json()
    if (response.ok) {
      
      if (data.res==="added") {
        add(id, name, price)
        console.log("aggiunto");
        
      }else{
        increase()
        console.log("duplicato");
        console.log(data.res);
        
      }
    }else{
      if (data.res==="product removed") {
        alert("il prodotto è stato rimosso dall'artigiano")
        parent.location.reload()
      }
    }
  } catch (error) {
    console.log(err);
    alert("Errore di rete.");
  }
  //comunica con server inviando id prodotto per carrello
  //se res.ok -> aggiunge prodotto
  //aggiunge valore a totale
  
}

function add(id, name, price) {
  console.log("nome ="+name);
  
  const riepilogo = document.getElementById("riepilogo");
  const totale = document.getElementById("totale");
  
  const riga = document.createElement("div");
    riga.className = "d-flex justify-content-between align-items-center border-bottom py-2";
    riga.innerHTML = `
      <div><strong>${name}</strong></div>
      <div>€${price}</div>
    `;
    riepilogo.appendChild(riga);
  var tot = totale.innerText
  tot = tot.replace("€", "").trim()
  var prezzo = parseFloat(tot)+price
  totale.innerText = "€"+prezzo.toFixed(2)
}
async function remove(){
  try {
    const response = await fetch("/emptyCart", {
      method:"POST",
      headers: { "Content-Type": "application/json"},
    })
    if (response.ok) {
      console.log("response ok");
      
      const riepilogo = document.getElementById("riepilogo");
      const totale = document.getElementById("totale");  
      riepilogo.innerHTML= ''
      totale.innerText = "€0"      
    }else{
      //gestione errori
    }
  } catch (error) {
    console.log(err);
    alert("Errore di rete.");
  }




  

}
function increase(){}
function decrease(){}

// DOM: genera riepilogo dinamico
document.addEventListener("DOMContentLoaded", async() => {
  try {
    const response = await fetch("/getCart", {
      method:"POST",
      headers: { "Content-Type": "application/json"},
    })
    const data = await response.json()
    if (response.ok) {
      console.log(data);
      data.carrello.forEach(el => {
      add(el.productid, el.name, el.costo)        
      });
      
    }else{
      //gestione errori
    }
  } catch (error) {
    console.log(err);
    alert("Errore di rete.");
  }
  
  
  //const totale = document.getElementById("totale");
  
  /*
  const carrello = new Carrello();
  const lista = carrello.getLista();
  
  if (lista.length === 0) {
    riepilogo.innerHTML = `<div class="alert alert-info">Il carrello è vuoto.</div>`;
    totale.textContent = "€0";
    return;
  }

  lista.forEach((p, i) => {
    const riga = document.createElement("div");
    riga.className = "d-flex justify-content-between align-items-center border-bottom py-2";
    riga.innerHTML = `
      <div><strong>${p.nome}</strong></div>
      <div>€${p.prezzo.toFixed(2)}</div>
    `;
    riepilogo.appendChild(riga);
  });

  totale.textContent = `€${carrello.getTotale().toFixed(2)}`;

  document.getElementById("proseguiPagamento").addEventListener("click", () => {
    alert("Pagamento simulato! Grazie per l'acquisto.");
    carrello.svuota();
    location.reload();
  });

  document.getElementById("svuotaCarrello").addEventListener("click", () => {
    if (confirm("Sei sicuro di voler svuotare il carrello?")) {
      carrello.svuota();
      location.reload();
    }
  });
  */
});

async function checkout(){
  console.log("checkout");
  
  try {
    const response = await fetch("/checkout", {
      method:"POST",
      headers: { "Content-Type": "application/json"},
    })
    const data = await response.json()
    if (response.ok) {
      parent.window.location.href = "/checkout";
    }else{
      //gestione errori
    }
  } catch (error) {
    console.log(error);
    alert("Errore di rete.");
  }
}
