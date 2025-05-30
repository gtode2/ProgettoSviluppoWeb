async function send() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  // Aggiungere eventuale verifica della compilazione dei campi
  
  const sdata = {
    productid: id,
    dove: document.getElementById("sel").value,
    desc: document.getElementById("motivo").value
  };

  try {
    const response = await fetch("/addReport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sdata)
    });
    const data = await response.json();
    
    if (response.ok) {
      exit();
    } else if (response.status === 401 && data.err === "missing token") {
      const res = await renewToken();
      if (res === 0) {
        send();
      } else {
        window.parent.location.href = "/";
      }
    }
  } catch (error) {
    console.log(error);
    alert("Errore di rete.");
  }
}

function exit() {
  window.parent.loadCart();
}

async function renewToken() {
  try {
    const response = await fetch("/renewToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return response.ok ? 0 : -1;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

// Associazione degli event listeners in un unico listener DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const btnInvia = document.getElementById("invia");
  const btnAnnulla = document.getElementById("annulla");
  const checkbox = document.getElementById("conf");

  // Controllo del checkbox per abilitare/disabilitare il pulsante "Invia segnalazione"
  checkbox.addEventListener("change", function () {
    btnInvia.disabled = !this.checked;
  });

  // Associa la funzione send al click del pulsante "Invia segnalazione"
  btnInvia.addEventListener("click", () => send());

  // Associa la funzione exit al click del pulsante "Cancella"
  btnAnnulla.addEventListener("click", () => exit());
});
