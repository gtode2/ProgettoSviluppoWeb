document.addEventListener("DOMContentLoaded", () => {
    
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Controlla che il nome ci sia
        const checkName = () => {
            const name = document.getElementById("name").value.trim();
            return name.length >= 1;
        };
        const checkAddress = () => {
            const addr = document.getElementById("addr").value.trim();
            return addr.length >= 1;
        };

        //controlla che l'email sia corretta
        const checkEmail = () => {
            const email = document.getElementById("email").value.trim();
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        };

        const checkPhone = () => {
            const phone = document.getElementById("phone").value.trim();
            const regex = /^[0-9]{9,15}$/;
            return regex.test(phone);
        };


        // Esegui i check
        if (
            !checkName() ||
            !checkAddress() ||
            !checkEmail() ||
            !checkPhone() 
        ) {
            alert("Compila tutti i campi correttamente.");
            return;
        }

        // Se tutto è valido, prepara i dati
        const formData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            address: document.getElementById("addr").value,
            desc: document.getElementById("descr").value
        };

        // Invia i dati al backend
        /*
        try {
            
            });
            if (response.ok) {
                window.location.href = response.url
            } 
            else{
                
            }

            const text = await response.json();
            alert(text);
        } catch (error) {
            alert("Errore di rete.");
            console.error(error);
        }

        */


        try {
            const response = await fetch("/RegAct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
            
            })
            const data = await response.json()     
            console.log(response.status);       
            if (!response.ok) {
                
                if (response.status===401) {
                    if (data.error==="missing token") {
                        alert("token mancante")
                        window.location.href = "http://localhost:3000/login"                        
                    }
                    else if (data.error==="invalid token") {
                        //rimanda a refresh
                    }
                }else if (response.status===409) {
                    alert("hai già un attività")
                    window.location.href = "http://localhost:3000/"
                }else{
                    alert("errore sconosciuto")
                }
                
            }else{
                console.log("Registrazione attività completata");
                
                window.location.href = "http://localhost:3000/"
                //redirect a homepage
            }
        } catch (err) {
            console.log(err);
            alert("Errore di rete.");
        }
    });
});
