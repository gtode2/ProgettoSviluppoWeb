document.addEventListener("DOMContentLoaded", ()=>{
    document.getElementById("send").addEventListener("click", async ()=>{
        
        const cred = document.getElementById("username")
        const pw = document.getElementById("password")

        
        const checkCred=()=>{
            return cred.value.length >0
        }
        const checkPassword =()=>{
            return pw.value.length >0
        }
        
        if (!checkCred()||!checkPassword()) {
            alert("Compila tutti i campi correttamente.")
            return
        }
        const formData = {
            cred: cred.value,
            pw: pw.value
        }
        
        try {
            const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
            
            })
            const data = await response.json()
            
            if (!response.ok) {
              if (response.status===403) {
                window.location.href = "/ban"
              }
              else if (response.status===401) {
                alert("Credenziali errate")
              }
            }else{
                console.log("tentativo di href");
                
                window.location.href = "/"
            }
        } catch (err) {
            console.log(err);
            alert("Errore di rete.");
        }
    })
})


