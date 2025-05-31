function cancel() {
  window.location.href="/userarea"
}

function notEmpty() {
  let c = true
  const vecchia = document.getElementById("vecchia")
  const nuova = document.getElementById("nuova")
  const conferma = document.getElementById("conferma")

  //inserire verifica password del login

  if (!vecchia.value.trim()) {
    vecchia.setCustomValidity("Inserisci un valore");
    vecchia.reportValidity();
    c = false
  }
  if (!nuova.value.trim()) {
    nuova.setCustomValidity("Inserisci un valore");
    nuova.reportValidity();
    c = false
  }
  if (!conferma.value.trim()) {
    conferma.setCustomValidity("Inserisci un valore");
    conferma.reportValidity();
    c = false
  }
  return c
}

async function send() {
  const vecchia = document.getElementById("vecchia")
  const nuova = document.getElementById("nuova")
  const conferma = document.getElementById("conferma")

  if (notEmpty) {
    if (nuova.value.trim()!==conferma.value.trim()) {
      conferma.setCustomValidity("le password non coincidono");
      conferma.reportValidity();
      return
    }
    let data = {}
    data.nuova = nuova.value.trim()
    data.vecchia = vecchia.value.trim()
  
    try {
      const response = await fetch("/changePassword", {
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
          }else if(data.err==="wrong password"){
            vecchia.setCustomValidity("Password errata");
            vecchia.reportValidity();
          }
        }
        console.log(response.status);
          
        //gestione errore
      }else{
        alert("password modificata correttamente")
        window.location.href="/"
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