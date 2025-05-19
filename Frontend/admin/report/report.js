document.addEventListener("DOMContentLoaded", async()=>{
    try {
            const response = await fetch("/getReports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },            
            })
            const data = await response.json()
            console.log("AAAAA");
            
            if (!response.ok) {
                alert("Credenziali errate")
            }else{
                data.reports.forEach(e => {
                    const riepilogo = document.getElementById("lista-report"); 
                    const riga = document.createElement("div");
                    riga.className = "d-flex justify-content-between align-items-center border-bottom py-2";
                    riga.innerHTML = `
                      <div><strong>${e.prodid}</strong></div>
                    `;
                    riepilogo.appendChild(riga);
                });
                
            }
        } catch (err) {
            console.log(err);
            alert("Errore di rete.");
        }


    
})