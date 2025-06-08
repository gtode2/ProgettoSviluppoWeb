document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const checkName = () => {
            const name = document.getElementById("name").value.trim();
            return name.length >= 1;
        };
        const checkSurname = () => {
            const surname = document.getElementById("surname").value.trim();
            return surname.length >= 1;
        };

        const checkUsername=()=>{
            const username = document.getElementById("username").value.trim();
            return username.length >= 1;
        }
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
            const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/; 
            if(password.length < 8){
                alert("La password deve contenere almeno 8 caratteri");
                return false;
            }else if(!strongPasswordRegex.test(password)){
                alert("La password non è sicura. Verifica di avere: \n un carattere maiuscolo; \n un carattere minuscolo; \n un carattere speciale; \n un numero");
                return false;
            }
            return true;
        };

        const checkConfirmPassword = () => {
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm_password").value;
            return password === confirmPassword;
        };

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

        const formData = {
            name: document.getElementById("name").value,
            surname: document.getElementById("surname").value,
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            password: document.getElementById("password").value,
            user_type: document.getElementById("user_type").value
        };

        try {
            const response = await fetch("/registrazione", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
            
            })
            const data = await response.json()
                        
            if (!response.ok) {
              if (response.status===409) {
                alert("utente già registrato")
              }
            else if (response.status===500) {
                alert("errore del server")
            } else{
                alert("errore sconosciuto")
              }
            }else{
                if (data.redirect) {
                    window.location.href = data.redirect
                }else{
                    window.location.href = "/"
                }
            }
        } catch (err) {
            console.log(err);
            alert("Errore di rete.");
        }
    });
});
