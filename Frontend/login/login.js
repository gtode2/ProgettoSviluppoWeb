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
            console.log("AAAAA");
            
            if (!response.ok) {
              if (response.status===403) {
                window.location.href = "/ban"
              }
              else{
                alert("Credenziali errate")
              }
            }else{
                console.log("tentativo di href");
                
                window.location.href = "http://localhost:3000/"
                //redirect a homepage
            }
        } catch (err) {
            console.log(err);
            alert("Errore di rete.");
        }
    })
})


        
/*
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("send");

  btn.addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("⚠️ Inserisci entrambi i campi.");
      return;
    }

    // Simulazione accesso
    if (username === "admin" && password === "admin123") {
      alert("Accesso Admin effettuato!");
      // window.location.href = "admin.html";
    } else {
      alert(`✅ Bentornato, ${username}`);
      // window.location.href = "cliente.html" o "artigiano.html";
    }
  });
});

*/
