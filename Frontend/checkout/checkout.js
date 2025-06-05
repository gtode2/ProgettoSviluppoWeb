document.addEventListener("DOMContentLoaded", async()=>{

})
async function checkout() {  
  const nome = document.getElementById("nome")
  const indirizzo = document.getElementById("indirizzo")
  const citta = document.getElementById("citta")
  const regione = document.getElementById("regione")

  
  if (!nome.value.trim()) {
    nome.setCustomValidity("Questo valore non può essere vuoto")
    nome.reportValidity()
    return
  }
  if (!indirizzo.value.trim()) {
    indirizzo.setCustomValidity("Questo valore non può essere vuoto")
    indirizzo.reportValidity()
    return
  }
  if (!citta.value.trim()) {
    citta.setCustomValidity("Questo valore non può essere vuoto")
    citta.reportValidity()
    return
  }
  console.log(regione.value);
  
  if (regione.value==="default") {
    regione.setCustomValidity("Selezionare una regione")
    regione.reportValidity()
    return
  }

  const addr = {
    nome:nome.value.trim(),
    indirizzo:indirizzo.value.trim(),
    citta:citta.value.trim(),
    regione:regione.value
  }
  try {
    const response = await fetch("/confirmCheckout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body:JSON.stringify({addr:addr})    
    })
    const data = await response.json()
    
    if (!response.ok) {
      if (response.status===401) {
        if (data.err==="missing token") {
          const result = await renewToken()
          if (result===1) {
            checkout()
          }else{
            window.location.href="/"
          }
        }
      }
    }else{
      console.log(data.id);
      
      const result = await stripe.redirectToCheckout({sessionId:data.id})
      if (result.error) {
          alert("Errore nel reindirizzamento: " + result.error.message);
      }
    }
  } catch (err) {
      console.log(err);
      alert("Errore di rete.");
  }
}

