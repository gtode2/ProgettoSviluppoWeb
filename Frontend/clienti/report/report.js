async function send(){
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');  
  //aggiungere verifica compilazione campi
  
  const sdata = {
            productid: id,
            dove:document.getElementById("sel").value,
            desc:document.getElementById("motivo").value
        }
  
  try {
    const response = await fetch("/addReport", {
      method:"POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(sdata)
    })
    const data = await response.json()
    if (response.ok) {
      exit()
    }else{
      if (response.status===401) {
        if (data.err==="missing token") {
          const res = await renewToken()
          if (res===0) {
            send()
          }else{
            window.parent.location.href="/"
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    alert("Errore di rete.");
  }


  
  }

function exit(){
  window.parent.loadCart();
}

// DOM: genera riepilogo dinamico
document.addEventListener("DOMContentLoaded", async() => {
  
  const conf = document.getElementById('conf');
  const invia = document.getElementById('invia');

  conf.addEventListener('change', () => {
    invia.disabled = !conf.checked;
  });
});



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