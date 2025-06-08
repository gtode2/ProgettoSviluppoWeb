document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ act: true })
    });
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      if (response.status===401) {
        if (data.err==="missing token" || data.err==="invalid token") {
            const result = await renewToken()
            if (result ===1) {
              send()
            }else{
              window.parent.location.href="/"
            }
          }
      }else if (response.status===500) {
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
    } else {
      document.getElementById("nome").placeholder = data.act.nome;
      document.getElementById("email").placeholder = data.act.email;
      document.getElementById("telefono").placeholder = data.act.ntel;
      document.getElementById("indirizzo").placeholder = data.act.indirizzo;
      document.getElementById("descr").placeholder = data.act.descr;
    }
  } catch (err) {
    console.log(err);
    alert("Errore di rete.");
  }
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

async function save() {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const indirizzo = document.getElementById("indirizzo").value.trim();
  const descr = document.getElementById("descr").value.trim();
  
  if (!nome && !email && !telefono && !indirizzo && !descr) {
    alert("Nessun dato modificato");
    return;
  }
  
  if (email && !validateEmail(email)) {
    alert("Email non in formato accettabile");
    return;
  }
  
  const dataToUpdate = {};
  if (nome) dataToUpdate.nome = nome;
  if (email) dataToUpdate.email = email;
  if (telefono) dataToUpdate.ntel = telefono;
  if (indirizzo) dataToUpdate.indirizzo = indirizzo;
  if (descr) dataToUpdate.descr = descr;
  
  try {
    const response = await fetch("/act", {
      method: "PATCH", 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataToUpdate)
    });
    const result = await response.json();
    
    if (response.ok) {
      window.location.reload();
    } else {
      if (response.status===401) {
        if (result.err==="missing token" || result.err==="invalid token") {
          const res = await renewToken();
          if (res === 0) {
            await save();
          } else {
            window.location.href = "/";
          }  
        }
      }else if(response.status===400){
        if (result.err==="no value") {
          alert("nessun valore modificato")
        }
      }else if (response.status===500) {
        alert("errore del server")
      }else{
        alert("errore sconosciuto")
      }
      
    }
  } catch (error) {
    console.error("Errore:", error);
    alert("Errore durante l'aggiornamento");
  }
}

function cancel() {
  document.getElementById("nome").value = "";
  document.getElementById("email").value = "";
  document.getElementById("telefono").value = "";
  document.getElementById("indirizzo").value = "";
  document.getElementById("descr").value = "";
}
function checkValidity(){
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const indirizzo = document.getElementById("indirizzo").value.trim();
  const descr = document.getElementById("descr").value.trim(); 

  const getNome = nome.value.trim();
  const getCognome = cognome.value.trim();
  const getTelefono = telefono.value.trim();
  const getIndirizzo = indirizzo.value.trim();
  const getDescr = descr.value.trim();

  if(!getNome && !getCognome && !getTelefono && !getIndirizzo && getDescr ){
    return;
  }
  if(getEmail){
    const checkEmail =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
      alert("Email non in formato corretto");
      return;
    }
  }
}