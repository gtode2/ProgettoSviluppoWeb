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
      })
    }else{
      //gestione errori
    }
  } catch (error) {
    console.log(err);
    alert("Errore di rete.");
  }
});

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
      if (response.status===401) {
        if (data.err==="missing token") {
            const res = await renewToken()
            if (res===0) {
              addToCart(id,name,price)
            }else{
              window.parent.location.href="/"
            }
        }
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
    const data = await response.json()
    if (response.ok) {
      console.log("response ok");
      
      const riepilogo = document.getElementById("riepilogo");
      const totale = document.getElementById("totale");  
      riepilogo.innerHTML= ''
      totale.innerText = "€0"      
    }else{
      //gestione errori
      if (response.status===401) {
        if (data.err==="missing token") {
          const res = await renewToken()
          if (res===0) {
            console.log("tentativo rimozione");
            
            remove()
          }else{
            window.parent.location.href = "/"
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    alert("Errore di rete.");
  }




  

}
async function increase(){}
async function decrease(){}


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
      if (data.err==="missing token") {
        const res = await renewToken()
        if (res===0) {
          checkout()
        }else{
          window.parent.location.href = "/"
        }
      }
    }
  } catch (error) {
    console.log(error);
    alert("Errore di rete.");
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