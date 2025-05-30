// Caricamento iniziale del carrello al DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/getCart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (response.ok) {
      console.log(data);
      data.carrello.forEach(el => {
        add(el.productid, el.name, el.costo);
      });
    } else {
      // Gestione errori in caso di risposta non ok
      console.error("Errore nella risposta:", data);
    }
  } catch (error) {
    console.error(error);
    alert("Errore di rete.");
  }
});

// Funzione per aggiungere un prodotto al carrello sia sul server che in pagina
async function addToCart(id, name, price) {
  console.log("Nome prodotto:", name);
  try {
    const response = await fetch("/addCart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id })
    });
    const data = await response.json();
    
    if (response.ok) {
      if (data.res === "added") {
        add(id, name, price);
        console.log("Prodotto aggiunto");
      } else {
        await increase();  // considerare di implementare la logica in increase()
        console.log("Prodotto duplicato:", data.res);
      }
    } else {
      if (data.res === "product removed") {
        alert("Il prodotto è stato rimosso dall'artigiano");
        parent.location.reload();
      }
      if (response.status === 401) {
        if (data.err === "missing token") {
          const res = await renewToken();
          if (res === 0) {
            addToCart(id, name, price);
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

// Funzione per aggiungere il prodotto alla parte visuale del carrello
function add(id, name, price) {
  console.log("Aggiungo prodotto:", name);
  
  const riepilogo = document.getElementById("riepilogo");
  const totale = document.getElementById("totale");
  
  const riga = document.createElement("div");
  riga.className = "d-flex justify-content-between align-items-center border-bottom py-2";
  riga.innerHTML = `
    <div><strong>${name}</strong></div> 
    <div>€${price}</div>
    <div>${quantita}</div>
    <div class="button">+</div>
    <div class="button">-</div>
  `;
  riepilogo.appendChild(riga);
  
  let tot = totale.innerText.replace("€", "").trim();
  let prezzo = parseFloat(tot) + price;
  totale.innerText = "€" + prezzo.toFixed(2);
}

// Funzione per svuotare il carrello
async function remove() {
  try {
    const response = await fetch("/emptyCart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Carrello svuotato con successo");
      
      document.getElementById("riepilogo").innerHTML = '';
      document.getElementById("totale").innerText = "€0";
    } else {
      // Gestione errori per svuotamento carrello
      if (response.status === 401 && data.err === "missing token") {
        const res = await renewToken();
        if (res === 0) {
          console.log("Tentativo di rimozione dopo token rinnovato");
          remove();
        } else {
          window.parent.location.href = "/";
        }
      }
    }
  } catch (error) {
    console.error(error);
    alert("Errore di rete.");
  }
}

// Funzioni placeholder per future implementazioni
async function increase() {
  // Logica per aumentare la quantità nel carrello se già presente
}

async function decrease() {
  // Logica per diminuire la quantità nel carrello
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
      if (data.err === "missing token") {
        const res = await renewToken();
        if (res === 0) {
          checkout();
        } else {
          window.parent.location.href = "/";
        }
      }
    }
  } catch (error) {
    console.error(error);
    alert("Errore di rete.");
  }
}

// Funzione per rinnovare il token
async function renewToken() {
  try {
    const response = await fetch("/renewToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok ? 0 : -1;
  } catch (error) {
    console.error(error);
    return -1;
  }
}

// Associa i gestori degli eventi ai pulsanti
document.addEventListener("DOMContentLoaded", () => {
  const btnPagamento = document.getElementById("proseguiPagamento");
  const btnSvuota = document.getElementById("svuotaCarrello");

  btnPagamento.addEventListener("click", () => checkout());
  btnSvuota.addEventListener("click", () => remove());
});
