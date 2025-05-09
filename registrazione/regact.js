document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const prevmail = document.getElementById("prevmail")
    prevmail.addEventListener("change", ()=>{
        const mail = document.getElementById("mail")
        if (prevmail.checked) {
            mail.disabled=true
            mail.value="aaa" //inserire mail precedente
        }else{
            mail.disabled=false
            mail.value=""
        }
    })
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Controlla che il nome ci sia
        const checkName = () => {
            const name = document.getElementById("name").value.trim();
            return name.length >= 1;
        };
        const checkAddress = () => {
            const surname = document.getElementById("addr").value.trim();
            return surname.length >= 1;
        };

        //controlla che l'email sia corretta
        const checkEmail = () => {
            const email = document.getElementById("email").value.trim();
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        };

        const checkPhone = () => {
            const phone = document.getElementById("num").value.trim();
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
            surname: document.getElementById("surname").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            password: document.getElementById("password").value,
            user_type: document.getElementById("user_type").value
        };

        // Invia i dati al backend
        try {
            const response = await fetch("http://localhost:3000/RegAct", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                window.location.href = response.url
        
            } 

            //const text = await response.text();
            //alert(text);
        } catch (error) {
            alert("Errore di rete.");
            console.error(error);
        }
    });
});
