document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id")
    try {
        const response = await fetch("/getProducts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({id:id})
        })
        const data = await response.json()    
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
        }
    } catch (err) {
        console.log(err);
        alert("Errore di rete.");
     }
})

function cancel() {
  window.parent.closeProduct()
}
async function send() {
  //esegue verifica inserimento valori
  //refresh prodotti
  window.parent.closeProduct()
}