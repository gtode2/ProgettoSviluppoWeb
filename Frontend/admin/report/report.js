document.addEventListener("DOMContentLoaded", async()=>{
    try {
        const response = await fetch("/getReports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },            
        })
        const data = await response.json()
        console.log("AAAAA");
        
        if (!response.ok) {
            //gestire errori
           
        }else{
            data.reports.forEach(e => {
                const type = (e)=>{
                    switch (e.type) {
                        case "NA":
                            return "Nome artigiano"
                        case "NP":
                            return "Nome prodotto"
                        case "IP":
                            return "Immagine prodotto"
                        case "DP":
                            return "Descrizione prodotto"
                        default:
                            return "Errore sconosciuto"
                    }
                }
                const riepilogo = document.getElementById("lista-report"); 
                const riga = document.createElement("div");
                riga.className = "justify-content-between align-items-center border-bottom py-2";
                riga.id = "reportblock"+e.id
                riga.innerHTML = `
                    <div><strong>Errore in:</strong> ${type(e)}</div>
                    <div><strong>Descrizione:</strong> ${e.descr}</div>
                    <div><strong>Fatta da:</strong> ${e.username}</div>
                    <div class="admin-actions mt-2">
                      <button class="btn btn-danger" onclick="removeReport(${e.id})">🗑 Rimuovi Segnalazione</button>
                      <button class="btn btn-outline-danger" onclick="openProd(${e.prodid})">🔎 Visualizza Prodotto</button>
                      <button class="btn btn-outline-danger" onclick="removeProd(${e.id})">❌ Rimuovi Prodotto </button>
                      <button class="btn btn-dark" onclick="banArtigiano(${e.id})">🚫 Banna Artigiano</button>
                    </div>`;
                riepilogo.appendChild(riga);
            });
        }
    } catch (err) {
        console.log(err);
        alert("Errore di rete.");
    }
})


async function removeReport(id) {
    try {
        const response = await fetch("/closeReport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },            
        body: JSON.stringify({id:id})
        })
        const data = await response.json()
        console.log("AAAAA");
        
        if (!response.ok) {
            //gestione response 
            if (response.status===401) {
                if (data.err==="missing token") {
                    const res =await renewToken()
                    if (res===0) {
                        await removeReport(id)
                    }else{
                        window.parent.location.href = "/"
                    }
                }
            }
        }else{
          const riepilogo = document.getElementById("lista-report"); 
          riepilogo.removeChild(document.getElementById("reportblock"+id))
        }
    } catch (err) {
        console.log(err);
        alert("Errore di rete.");
    }
}
function removeProd(id) {
    window.parent.document.getElementById("lat-iframe").src="./admin/report/banProdotto.html?id="+id
}
function openProd(id){
    window.parent.openProduct(id)
}
function banArtigiano(id) {
    window.parent.document.getElementById("lat-iframe").src="./admin/report/banArtigiano.html?id="+id
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