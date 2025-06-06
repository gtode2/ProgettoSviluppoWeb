let count = 0

// Caricamento iniziale del carrello al DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/cart", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (response.ok) {
      console.log(data);
      data.carrello.forEach(el => {
        console.log(el);
        let qtt = (el.amm<el.quantita) ? el.amm : el.quantita 
        add(el.productid, el.name, el.costo, qtt);
        count +=el.quantita
      });
      counter()
    } else {
      if (response.status===401) {
        if (data.err==="usertype") {
          alert("tipo utente errato\nredirect a homepage")
          window.location.href = "/"
        }
      }else if (response.status===500) {
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
    }
  } catch (error) {
    console.error(error);
    alert("Errore di rete.");
  }
});

// Funzione per aggiungere un prodotto al carrello sia sul server che in pagina
async function addToCart(id, name, price, quantita=1) {
  try {
    const response = await fetch("/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id })
    });
    const data = await response.json();
    
    if (response.ok) {
      if (data.res === "added") {
        add(id, name, price, quantita);
        console.log("Prodotto aggiunto");
        count+=1
        counter()
      } else {
   
        ///////////////////////////////////////////////////
        document.getElementById(`qtt${id}`).textContent = Number(document.getElementById(`qtt${id}`).innerText)+1
        const totale = document.getElementById("totale");
        let tot = totale.innerText.replace("€", "").trim();
        console.log(data);
        
        let prezzo = parseFloat(tot) + price;
        totale.innerText = "€" + prezzo.toFixed(2);

        count+=1
        counter()

        console.log("Prodotto duplicato:", data.res);
      }
    } else {
      if (response.status===401) {
        if (data.err === "missing token" || data.err==="invalid token") {
          const res = await renewToken();
          if (res === 0) {
            addToCart(id, name, price, quantita);
          } else {
            window.parent.location.href = "/";
          }
        }
      }else if (response.status===400) {
        if (data.err==="missing product") {
          alert("formato messaggio errato")
          window.parent.reload()
        }else if (data.err==="invalid dec") {
          alert("formato messaggio errato")
        }
      }else if (response.status===404){
        if (data.err==="product removed") {
          alert("prodotto rimosso dall'artigiano")
          parent.location.reload()
        }
      }else if (response.status===409) {
        if (data.err==="max") {
          alert("impossibile aggiungere altri elementi:\nnumero massimo raggiunto")
        }
        else if (data.err==="0") {
          alert("prodotto esaurito")
        }
      }else if (response.status===500){
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
    }
  } catch (error) {
    console.error(error);
    alert("Errore di rete.");
  }
}

// Funzione per aggiungere il prodotto alla parte visuale del carrello
function add(id, name, price, quantita) {
  console.log("Aggiungo prodotto:", name);
  
  const riepilogo = document.getElementById("riepilogo");
  const totale = document.getElementById("totale");
  
  const riga = document.createElement("div");
  riga.className = "d-flex justify-content-between align-items-center border-bottom py-2";
  riga.id = `element${id}`
  riga.innerHTML = `
    <div><strong>${name}</strong></div> 
    <div>€${price}</div>
    <div id="qtt${id}">${quantita}</div>
    <div class="button" onclick="increase(${id}, ${price})">+</div>
    <div class="button" onclick="decrease(${id}, ${price})">-</div>
  `;
  riepilogo.appendChild(riga);
  
  let tot = totale.innerText.replace("€", "").trim();
  let prezzo = parseFloat(tot) + price*quantita;
  totale.innerText = "€" + prezzo.toFixed(2);
}

// Funzione per svuotare il carrello
async function remove() {
  try {
    const response = await fetch("/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Carrello svuotato con successo");
      
      document.getElementById("riepilogo").innerHTML = '';
      document.getElementById("totale").innerText = "€0";

      count=0
      counter()
    } else {
      if (response.status === 401) {
        if (data.err === "missing token" || data.err === "invalid token") {
          const res = await renewToken();
          if (res === 0) {
            console.log("Tentativo di rimozione dopo token rinnovato");
            remove();
          } else {
            window.parent.location.href = "/";
          }  
        }else if (data.err==="usertype") {
          alert("utente non autorizzato\nredirect a homepage")
        }   
      }else if (response.status===500) {
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
    }
  } catch (error) {
    console.error(error);
    alert("Errore di rete.");
  }
}

// Funzioni placeholder per future implementazioni
async function increase(id, price) {
  try {
    const response = await fetch("/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id })
    });
    const data = await response.json();
    
    if (response.ok) {
      document.getElementById(`qtt${id}`).textContent = Number(document.getElementById(`qtt${id}`).innerText)+1
      const totale = document.getElementById("totale");
      let tot = totale.innerText.replace("€", "").trim();
      console.log(data);
      
      let prezzo = parseFloat(tot) + price;
      totale.innerText = "€" + prezzo.toFixed(2);

      count+=1
      counter()
    } else {
      if (response.status===401) {
        if (data.err === "missing token" || data.err==="invalid token") {
          const res = await renewToken();
          if (res === 0) {
            increase(id,price);
          } else {
            window.parent.location.href = "/";
          }
        }
      }else if (response.status===400) {
        if (data.err==="missing product") {
          alert("formato messaggio errato")
          window.parent.reload()
        }else if (data.err==="invalid dec") {
          alert("formato messaggio errato")
        }
      }else if (response.status===404){
        if (data.err==="product removed") {
          alert("prodotto rimosso dall'artigiano")
          parent.location.reload()
        }
      }else if (response.status===409) {
        if (data.err==="max") {
          alert("impossibile aggiungere altri elementi:\nnumero massimo raggiunto")
        }
        else if (data.err==="0") {
          alert("prodotto esaurito")
        }
      }else if (response.status===500){
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
    } 
  } catch (error) {
    console.error(error);
    alert("Errore di rete.");
  }
}

async function decrease(id, price) {
  if (document.getElementById(`qtt${id}`).textContent==="1") {
    //funzione per rimuovere
    try {
      const response = await fetch("/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, dec:"r"})
      });
      const data = await response.json();

      if (response.ok) {
        document.getElementById(`element${id}`).remove()
        const totale = document.getElementById("totale");
        let tot = totale.innerText.replace("€", "").trim();

        let prezzo = parseFloat(tot) - price;
        totale.innerText = "€" + prezzo.toFixed(2);

        count-=1
        counter()
      } else {
      if (response.status===401) {
        if (data.err === "missing token" || data.err==="invalid token") {
          const res = await renewToken();
          if (res === 0) {
            increase(id, price);
          } else {
            window.parent.location.href = "/";
          }
        }
      }else if (response.status===400) {
        if (data.err==="missing product") {
          alert("formato messaggio errato")
          window.parent.reload()
        }else if (data.err==="invalid dec") {
          alert("formato messaggio errato")
        }
      }else if (response.status===404){
        if (data.err==="product removed") {
          alert("prodotto non trovato")
          parent.location.reload()
        }
      }else if (response.status===409) {
        if (data.err==="max") {
          alert("impossibile aggiungere altri elementi:\nnumero massimo raggiunto")
        }
        else if (data.err==="0") {
          alert("prodotto esaurito")
        }
      }else if (response.status===500){
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
      } 
    } catch (error) {
      console.error(error);
      alert("Errore di rete.");
    }
    
  }else{
    //funzione per scalare
    try {
      const response = await fetch("/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, dec:"d"})
      });
      const data = await response.json();

      if (response.ok) {
        document.getElementById(`qtt${id}`).textContent = Number(document.getElementById(`qtt${id}`).innerText)-1
        const totale = document.getElementById("totale");
        let tot = totale.innerText.replace("€", "").trim();
        console.log(data);

        let prezzo = parseFloat(tot) - price;
        totale.innerText = "€" + prezzo.toFixed(2);

        count-=1
        counter()
      } else {
        if (data.res === "product removed") {
          alert("Il prodotto è stato rimosso dall'artigiano");
          parent.location.reload();
        }
        if (response.status === 401) {
          if (data.err === "missing token") {
            const res = await renewToken();
            if (res === 0) {
              decrease(id, price)
            } else {
              window.parent.location.href = "/";
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      alert("Errore di rete.");
    }
  }


  
  
}

// Funzione per procedere al checkout
async function checkout() {
  console.log("Eseguo checkout");
  try {
    const response = await fetch("/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (response.ok) {
      parent.window.location.href = "/checkout";
    } else {
      // Gestione errori per checkout
      if (response.status===401) {
        if (data.err === "missing token" || data.err==="invalid token") {
        const res = await renewToken();
        if (res === 0) {
          checkout();
        } else {
          window.parent.location.href = "/";
        }
        }
      }else if (response.status===404) {
        if (data.err==="empty") {
          alert("i prodotti nel carrello non sono più disponibili")
        }
      }else if (response.status===409){
        if (data.err==="not enough") {
          alert("alcuni prodotti non sono più disponibili nella quantità selezionata")
          window.parent.location.reload()
        }
      }else if (response.status===500){
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
    }
  } catch (error) {
    console.error(error);
    alert("Errore di rete.");
  }
}


// Associa i gestori degli eventi ai pulsanti
document.addEventListener("DOMContentLoaded", () => {
  const btnPagamento = document.getElementById("proseguiPagamento");
  const btnSvuota = document.getElementById("svuotaCarrello");

  btnPagamento.addEventListener("click", () => checkout());
  btnSvuota.addEventListener("click", () => remove());
});

function counter() {
  console.log(count);
  
  if (count===0) {
    document.getElementById("proseguiPagamento").disabled=true
    document.getElementById("svuotaCarrello").disabled=true
  }else{
    document.getElementById("proseguiPagamento").disabled=false
    document.getElementById("svuotaCarrello").disabled=false
  }
}