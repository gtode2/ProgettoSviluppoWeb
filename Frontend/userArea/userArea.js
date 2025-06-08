document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const isBackground = params.get("mode") === "background";
  const userType = params.get("user") || "cliente";
  const bgIframe = document.getElementById("user-bg-iframe");

  if (isBackground && bgIframe) {
    const src = userType === "artigiano"
      ? "/artigiano/artigiano.html?mode=background"
      : "/clienti/clienti.html?mode=background";
    bgIframe.src = src;
  }
  
  if (isBackground) {
    document.querySelectorAll("button, input").forEach(el => {
      el.disabled = true;
      el.style.pointerEvents = "none";
      el.style.opacity = "0.5";
    });
    return; 
  }

  let data;

  if(userType !== "admin"){
    getOrders();
  }


  try {
    const response = await fetch("/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    data = await response.json();

    if (!response.ok) {
      if (response.status===401) {
        const result = await renewToken()
        if (result===0) {
          window.location.reload()
        }else{
          window.location.href="/"
        }
      }else if (response.status===500) {
        alert("errore del server nel caricamento delle informazioni")
      }else{
        alert("errore sconosciuto nel caricamento delle informazioni")
      }
    } else {
      document.getElementById("nome").placeholder = data.user.nome;
      document.getElementById("cognome").placeholder = data.user.cognome;
      document.getElementById("username").placeholder = data.user.username;
      document.getElementById("email").placeholder = data.user.email;
      document.getElementById("telefono").placeholder = data.user.ntel;
    }
  } catch (err) {
    console.log(err);
    alert("Errore di rete.");
  }
});

async function cancel() {
  ["nome", "cognome", "username", "email", "telefono"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}


async function save() {
  if(!checkValidity()){
    return;
  }
  
  const values = {};
  ["nome", "cognome", "username", "email", "telefono"].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value) {
      values[id === "telefono" ? "ntel" : id] = el.value;
    }
  });
  try {
    const response = await fetch("/updateUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json()
    if (response.ok) {
      window.location.reload()
    } else {
      if (response.status===401) {      
        if (data.err==="missing token") {
          const res = await renewToken()
          if (res===0) {            
            await save()
          }else{
            window.location.href="/"
          }
        }
      }else if (response.status===400) {
        alert("nessna informazione modificata")
      }else if (response.status===500) {
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
    }
  } catch (error) {
    window.location.href = "/";
  }
}

async function logout() {
  try {
      await fetch("/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
    } finally {
      window.location.href = "/";
    }
}

async function getOrders() {
  try {
    const response = await fetch("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    })
    const data = await response.json()
    if (!response.ok) {
      if (response.status===401) {
        if (data.err === "missing token") {
          const result = await renewToken()
          if (result===1) {
            getOrders()
          }else{
            window.location.href="/"
          }
        }else if (data.err==="unauthorized") {
          alert("caricamento ordini non autorizzato")
        }
      }else if (response.status===500) {
        alert("errore nel server durante il caricamento degli ordini")
      }else{
        alert("errore sconosciuto durante il caricamento degli ordini")
      }
    }else{
      console.log("risultato valido");
      console.log(data.ord);
      let contanier = document.getElementById("orderscontainer")
      if (data.ut === 2) {
        data.ord.forEach(el => {
        let qtt = Object.keys(el.products).length
        let prodotti = qtt===1 ? "prodotto" : "prodotti"
        let status = el.sent ? "completato" : "da inviare"  
        let element = `
          <div class="order-card" onclick="openOrder(${el.id})" id="orderelement">
            <div class="order-content">
              <p class="order-date">${new Date(el.created).toISOString().split("T")[0]}</p>
              <p class="order-detail">${qtt + " " + prodotti}</p>
              <p class="order-status">${status}</p>
            </div>
          </div>
        `
        contanier.innerHTML+=element
      });
      }else{
        data.ord.forEach(el => {
        let qtt = Object.keys(el.products).length
        let prodotti = qtt===1 ? "prodotto" : "prodotti"
        let status = el.sent ? "inviato" : "in elaborazione" 
        let element = `
          <div class="border-bottom" onclick="openOrder(${el.id})" id="orderelement">
            <p class="mt-3">${new Date(el.created).toISOString().split("T")[0]}</p>
            <p>${qtt+" "+prodotti}</p>
            <p>${status}</p>
          </div>
        
        `
        contanier.innerHTML+=element
      });
      }
    }
  } catch (err) {
      console.log(err);
      alert("Errore di rete.");
  }  
}

function openOrder(id) {
  window.location.href="/order?id="+id
}


function closeUserArea() {
      window.location.href="/"
}

function checkValidity(){
  const nome = document.getElementById("nome");
  const cognome = document.getElementById("cognome");
  const username =  document.getElementById("username");
  const email = document.getElementById("email");
  const telefono = document.getElementById("telefono"); 

  const getNome = nome.value.trim();
  const getCognome = cognome.value.trim();
  const getUsername = username.value.trim();
  const getEmail = email.value.trim();
  const getTelefono = telefono.value.trim();

  if(!getNome && !getCognome && !getUsername && !getEmail && getTelefono ){
    return;
  }
  if(getEmail){
    const checkEmail =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(checkEmail)){
      alert("Email non in formato corretto");
      return;
    }
  }
}