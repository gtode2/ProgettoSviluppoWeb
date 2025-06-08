document.addEventListener("DOMContentLoaded", function() {
  console.log("Inserimento caricato");
  
  const send = document.getElementById("sendProduct");
  if(send){
    send.addEventListener("click", function(event){
      event.preventDefault();
      if(validateForm()){
        sendData();
      }
    })
  }
})

async function sendData(){
  if(validateForm()){
    console.log("Invio prodotto");
  
    const msg = {
      name: document.getElementById("nome").value,
      descr: document.getElementById("descrizione").value,
      price: document.getElementById("prezzo").value,
      amm: document.getElementById("quantita").value,
      cat: document.getElementById("categoria").value
    };


    try {
      const response = await fetch("/addProduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg)
      
      })
      const data = await response.json()
      console.log("Risposta ricevuta")

      if (!response.ok) {
        if (response.status===401) {
          if (data.err==="missing token") {
              const res =await renewToken()
              if (res===0) {
                  await sendData()
              }else{
                  window.parent.location.href = "/"
              }
          }else if (data.err==="usertype") {
            alert("tipo utente errato\nredirect a homepage")
            window.parent.location.href = "/"
          }else if (data.err==="banned"){
            window.parent.location.href = "/"
          }
        }else if (response.status===500) {
          alert("errore del server")
        }else{
          alert("errore sconosciuto")
        }
      }else{
        console.log("prodotto inserito correttamente \n tentativo modifica prodotti");
          console.log("svuotamento inserimento prodotti");
          document.getElementById("nome").value = ""
          document.getElementById("descrizione").value = ""
          document.getElementById("prezzo").value = ""
          document.getElementById("quantita").value = ""
          document.getElementById("categoria").value = ""
          alert("Prodotto inserito correttamente")
        
      }
    } catch (err) {
        console.log(err);
        alert("Errore di rete.");
    }
  }
}


function validateForm(){
  let formValido = true;
  
  const nameInput = document.getElementById('nome');
  if(!nameInput.value.trim()){
    nameInput.setCustomValidity("Nome mancante");
    nameInput.reportValidity();
    formValido = false;
    return formValido;
  } else {
    nameInput.setCustomValidity("");
  }

  const descInput = document.getElementById('descrizione');
  if(!descInput.value.trim()){
    descInput.setCustomValidity("Descrizione mancante!");
    descInput.reportValidity();
    formValido = false;
    return formValido
  } else {
    descInput.setCustomValidity("");
  }

  const priceInput = document.getElementById("prezzo");
  if(!priceInput.value.trim()){
    priceInput.setCustomValidity("Prezzo mancante");
    priceInput.reportValidity();
    formValido = false;
    return formValido;
  } else if(parseFloat(priceInput.value) <= 0){
    priceInput.setCustomValidity("Il prezzo non può essere uguale o inferiore a 0");
    priceInput.reportValidity();
    formValido = false;
    return formValido;
  } else {
    priceInput.setCustomValidity("");
  }

   const quantitaInput = document.getElementById("quantita");
  if (!quantitaInput.value.trim()) {
    quantitaInput.setCustomValidity("Il campo quantità non può essere vuoto!");
    quantitaInput.reportValidity();
    formValido = false;
    return formValido;
  } else {
    const quantitaVal = parseFloat(quantitaInput.value);
    if (quantitaVal <= 0) {
      quantitaInput.setCustomValidity("La quantità non può essere inferiore o uguale a 0");
      quantitaInput.reportValidity();
      formValido = false;
      return formValido;
    } else if (!Number.isInteger(quantitaVal)) {
      quantitaInput.setCustomValidity("La quantità deve essere un numero intero!");
      quantitaInput.reportValidity();
      alert("Errore: la quantità deve essere un numero intero!");
      formValido = false;
      return formValido;
    } else {
      quantitaInput.setCustomValidity("");
    }
  }
  
  const categoriaInput = document.getElementById("categoria");
  if(!categoriaInput.value.trim()){
    categoriaInput.setCustomValidity("Il campo quantità non può essere vuoto!");
    categoriaInput.reportValidity();
    formValido = false;
    return formValido;
  }
  else{
    quantitaInput.setCustomValidity("");
  }
  
  return formValido;
}