let id 

document.addEventListener("DOMContentLoaded", ()=>{
            const conferma = document.getElementById("conferma")
            const params = new URLSearchParams(window.location.search);
            id = params.get("id");
            console.log(id);
            
            if (!id) {
                document.getElementById("title").textContent="si è verificato un errore nel caricamento"
                conferma.disabled=true
            }
        })

function cancel() {
    window.parent.document.getElementById("lat-iframe").src="./admin/report/report.html"
}

async function confirmP() {
    try {
        const response = await fetch("/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },            
        body: JSON.stringify({id:id, type:0})
        })
        const data = await response.json()
        console.log("AAAAA");
        if (!response.ok) {
            //gestione response 
        }else{
            window.parent.document.getElementById("prodotti-iframe").src="./prodotti/prodotti.html"
            window.parent.document.getElementById("lat-iframe").src="./admin/report/report.html"
        }
    } catch (err) {
        console.log(err);
        alert("Errore di rete.");
    }
}

async function confirmA() {
    try {
        const response = await fetch("/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },            
        body: JSON.stringify({id:id, type:1})
        })
        const data = await response.json()
        console.log("AAAAA");
        if (!response.ok) {
            //gestione response 
        }else{
            window.parent.document.getElementById("prodotti-iframe").src="./prodotti/prodotti.html"
            window.parent.document.getElementById("lat-iframe").src="./admin/report/report.html"
        }
    } catch (err) {
        console.log(err);
        alert("Errore di rete.");
    }
}