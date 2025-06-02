let id = null
let defCat = null
let c = true
document.addEventListener('DOMContentLoaded', () => {
  const dettaglioContainer = document.getElementById('dettaglio-prodotto');
  
  // Recupera l'ID prodotto dalla query string (esempio: ?id=123)
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    dettaglioContainer.innerHTML = '<div class="alert alert-warning">ID prodotto mancante.</div>';
    return;
  }
  
  // Richiesta all'API per recuperare i dati del prodotto
  fetch(`/api/prodotti/${productId}`)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(product => {
      // Costruisce il contenuto della card con i dati del prodotto
      const productCard = `
        <div class="card">
          <img src="${product.imageUrl}" class="card-img-top" alt="${product.nome}">
          <div class="card-body">
            <h5 class="card-title">${product.nome}</h5>
            <p class="card-text">${product.descrizione}</p>
            <p class="card-text"><strong>Prezzo:</strong> €${product.prezzo}</p>
            <p class="card-text"><strong>Quantità:</strong> ${product.quantita}</p>
          </div>
        </div>
      `;
      dettaglioContainer.innerHTML = productCard;
    })
    .catch(error => {
      console.error('Errore durante il recupero dei dati del prodotto:', error);
      dettaglioContainer.innerHTML = '<div class="alert alert-danger">Errore nel caricamento del prodotto.</div>';
    });
  
  // Funzionalità per il pulsante di chiusura
  const closeButton = document.getElementById('chiudiArea');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      // Ad esempio: torna indietro usando la history del browser
      window.history.back();
    });
  }
});


function checkNome(){
  const nome = document.getElementById("nome").value.trim()
  if (!nome) {
    return false
  }
  return true
}
function checkDesc() {
  const desc = document.getElementById("descrizione").value.trim()
  if (!desc) {
    return false
  } 
  return true
}
function checkPrezzo(){
  const prezzo = document.getElementById("prezzo")
  if (!prezzo.value.trim()) {
    return false
  }
  return true
}
function checkQtt() {
  const quantita = document.getElementById("quantita")
  if (!quantita.value.trim()) {
    return false
  }
  return true
}
function checkCat(){
  const cat = document.getElementById("categoria").value
  return cat!==defCat
}

function cancel() {
  window.parent.closeProduct()
}
async function send() {
  let data = {}
  data.id=id
  let nome = checkNome()
  if (nome) {
    data.nome=document.getElementById("nome").value.trim()
  } 
  let descrizione = checkDesc()
  if (descrizione) {
    data.descr = document.getElementById("descrizione").value.trim()
  }
  let prezzo = checkPrezzo()
  if (prezzo) {
    data.prezzo = document.getElementById("prezzo").value.trim()
  }  
  let quantita = checkQtt()
  if (quantita) {
    data.qt = document.getElementById("quantita").value.trim()
  }
  let categoria = checkCat()
  if (categoria) {
    data.cat = document.getElementById("categoria").value
  }
  
  
  //eseguire verifica valori
  
  if (!nome && !descrizione && !prezzo && !quantita && !categoria) {
    console.log("nessun valore inserito");
  }else{
    try {
      const response = await fetch("/editProducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      data = await response.json()    
      if (!response.ok) {  
        if (response.status===401) {
          if (data.err==="missing token") {
            const result = await renewToken()
            if (result ===1) {
              send()
            }else{
              window.parent.location.href="/"
            }
          }
        }
        console.log(response.status);
          
        //gestione errore
      }else{
        window.parent.document.getElementById("prodotti-iframe").contentWindow.location.reload()
        window.parent.closeProduct()
      }
    } catch (error) {
      console.log(error);
    }   
  }
}

async function renewToken() {
    try {
        const response = await fetch("/renewToken", {
            method:"POST",
            headers: { "Content-Type": "application/json" }, 
        })
        if (response.ok) {
            return 0
        }else{
            return -1
        }
    } catch (error) {
        console.log(error);
        
    }
}