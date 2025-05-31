let id = null
let defCat = null
let c = true
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    id = params.get("id")
    try {
        const response = await fetch("/getProducts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({id:id})
        })
        let data = await response.json()    
        if (!response.ok) {
          console.log(response.status + "\n"+ response.err);     
          //gestione errore
        }else{  
          console.log(data.prodotti[0]);
          document.getElementById("nome").placeholder=data.prodotti[0].name
          document.getElementById("descrizione").placeholder=data.prodotti[0].descr
          document.getElementById("prezzo").placeholder=data.prodotti[0].costo
          document.getElementById("quantita").placeholder=data.prodotti[0].amm
          document.getElementById("categoria").value=data.prodotti[0].cat          
          defCat = data.prodotti[0].cat
        }
    } catch (err) {
        console.log(err);
        alert("Errore di rete.");
     }
})

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