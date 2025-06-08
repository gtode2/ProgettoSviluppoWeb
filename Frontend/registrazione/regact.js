document.addEventListener("DOMContentLoaded", () => {
    loadUser()
});

async function loadUser(){
    try {
        const response = await fetch("/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        let data = await response.json();

        if (!response.ok) {
            if (response.status===401) {
                if (data.err==="missing token" || data.err==="invalid token") {
                    const result = await renewToken()
                    if (result === 0) {
                        loadUser()
                    }else{
                        window.location.href="/"
                    }
                }
            }else if(response.status===500){
                alert("errore del server nel caricamento delle informazioni")
            }else{
                alert("errore sconosciuto")
            }
        } else {
            document.getElementById("email").placeholder=data.user.email
            document.getElementById("phone").placeholder=data.user.ntel
        }
  } catch (err) {
    console.log(err);
    alert("Errore di rete.");
  }
}


async function send(){
    const checkName = () => {
        const name = document.getElementById("name").value.trim();
        return name.length >= 1;
    };
    const checkAddress = () => {
        const addr = document.getElementById("addr").value.trim();
        return addr.length >= 1;
    };

    const checkEmail = () => {
        const email = document.getElementById("email")
        if (email.value.trim()) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);   
        }
        return true
    };

    const checkPhone = () => {
        const phone = document.getElementById("phone")
        if (phone.value.trim()) {
            const regex = /^[0-9]{9,15}$/;
            return regex.test(phone);    
        }
        return true
        
    };

    if (
        !checkName() ||
        !checkAddress() ||
        !checkEmail() ||
        !checkPhone() 
    ) {
        alert("Compila tutti i campi correttamente.");
        return;
    }

    const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("addr").value,
        desc: document.getElementById("descr").value
    };

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
                if (data.err==="missing token") {
                    const res = renewToken()
                    if (res===0) {
                        await send()
                    }else{
                        window.location.href="/login"
                    }
                }
                
            }else if (response.status===409) {
                alert("hai già un'attività")
                window.location.href = "/"
            }else if (response.status===500) {
                alert("errore del server")
            }else{
                alert("errore sconosciuto")
            }
            
        }else{
            console.log("Registrazione attività completata");
            
            window.location.href = "/"
        }
    } catch (err) {
        console.log(err);
        alert("Errore di rete.");
    }
};



