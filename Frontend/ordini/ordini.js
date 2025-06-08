document.addEventListener("DOMContentLoaded", ()=>{
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    getOrders(id)

})


async function getOrders(id) {
  try {
    const response = await fetch("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body:JSON.stringify({id:id})
    })
    const data = await response.json()
    if (!response.ok) {
      if (response.status===401) {
        if (data.err === "missing token" || data.err==="invalid token") {
          const result = await renewToken()
          if (result===1) {
            getOrders()
          }else{
            window.location.href="/"
          }
        }else if (data.err==="unauthorized") {
          alert("accesso non autorizzzato")
          window.location.href="/userArea"
        }
      }else if (response.status===500) {
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
    }else{
      console.log("risultato valido");
      let contanier = document.getElementById("elencoprodotti")
      for(const [id, product] of Object.entries(data.ord.products)){
        let element = `
          <div class="bt-3 d-flex">
            <p class="mb-0">${product.nome}</p>
            <p class="mb-0 ms-3">${product.prezzo}</p>
            <p class="mb-0 ms-3">x ${product.quantita}</p>
          </div>
        `
        contanier.innerHTML+=element
      }
      if (data.ut === 2) {
        console.log("artigiano");
        if (!data.ord.sent) {
          element = `
            <div class="mb-3">
            <button type = "button" class="btn btn-primary" onclick="complete(${data.ord.id})">conferma invio ordine</button>
            </div>
          `
          contanier.innerHTML+=element
        }else{
          element = `
            <div class="mt-5 mb-3">
              <h5>Ordine inviato</h5>
            </div>
          `
          contanier.innerHTML+=element
        }
      }else{
        console.log(data.ord);
        
        console.log("utente");
        
        element = `
        <div class="mb-3">
          <h5 class="text-start mb-4">Hai bisogno di aiuto?</h5>
          <p class="text-start">Indirizzo Email:</p>
          <p class="text-start" id="email">${data.ord.email}</p>
          <p class="text-start">Numero di telefono:</p>
          <p class="text-start" id="ntel">${data.ord.ntel}</p>
        </div>
        `
      contanier.innerHTML+=element
      }
      
      document.getElementById("nome").innerText=data.ord.addr["nome"]
      document.getElementById("indirizzo").innerText=data.ord.addr["indirizzo"]
      document.getElementById("citta").innerText=data.ord.addr["citta"]
      document.getElementById("regione").innerText=data.ord.addr["regione"]

    }
  } catch (err) {
      console.log(err);
      alert("Errore di rete.");
  }  
}


async function complete(id) {
  try {
    const response = await fetch("/order", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body:JSON.stringify({id:id})
    })
    const data = await response.json()
    if (!response.ok) {
      if (response.status===400) {
        if (data.err==="missing id") {
          alert("informazioni ordine mancanti")
        }
      }else if (response.status===401) {
        if (data.err==="missing token" || data.err==="invalid token") {
          const result = checkToken()
          if (result===0) {
            complete(id)
          }else{
            window.location.href="/"
          }
        }else if (data.err==="unauthorized") {
          alert("modifica non autorizzata")
          window.location.href="/userArea"
        }
      }else if (response.status==500){
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
    }
    else{
      window.location.reload()
    }
  }catch(error){
    console.log(error);
    alert("Errore di rete")
  }
}

function exit() {
  const res = renewToken()
  if (res===0) {
    window.location.href="/userArea"  
  }else{
    window.location.href="/"
  }
  
}

