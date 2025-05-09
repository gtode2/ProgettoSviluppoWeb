document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Controlla che il nome ci sia
        const checkName = () => {
            const name = document.getElementById("name").value.trim();
            return name.length >= 1;
        };
        //controlla che ci sia il cognome
        const checkSurname = () => {
            const surname = document.getElementById("surname").value.trim();
            return surname.length >= 1;
        };

        const checkUsername=()=>{
            const username = document.getElementById("username").value.trim();
            return username.length >= 1;
        }
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

        const checkPassword = () => {
            const password = document.getElementById("password").value;
            return password.length >= 6;
        };

        const checkConfirmPassword = () => {
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm_password").value;
            return password === confirmPassword;
        };

        // Esegui i check
        if (
            !checkName() ||
            !checkSurname() ||
            !checkUsername()||
            !checkEmail() ||
            !checkPhone() ||
            !checkPassword() ||
            !checkConfirmPassword()
        ) {
            alert("Compila tutti i campi correttamente.");
            return;
        }

        // Se tutto è valido, prepara i dati
        const formData = {
            name: document.getElementById("name").value,
            surname: document.getElementById("surname").value,
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            password: document.getElementById("password").value,
            user_type: document.getElementById("user_type").value
        };

        // Invia i dati al backend
        try {
            const response = await fetch("http://localhost:3000/registrazione", {
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
