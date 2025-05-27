document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const isBackground = params.get("mode") === "background";
  const userType = params.get("user") || "cliente";

  const logout = document.getElementById("logout");
  const annulla = document.getElementById("annulla");
  const salva = document.getElementById("salva");
  const bgIframe = document.getElementById("user-bg-iframe");

  // 🔁 Caricamento dinamico dello sfondo
  if (isBackground && bgIframe) {
    const src = userType === "artigiano"
      ? "../artigiano/artigiano.html?mode=background"
      : "../clienti/clienti.html?mode=background";
    bgIframe.src = src;
  }

  // 🔒 Se in modalità background → disattiva tutta la UI
  if (isBackground) {
    document.querySelectorAll("button, input").forEach(el => {
      el.disabled = true;
      el.style.pointerEvents = "none";
      el.style.opacity = "0.5";
    });
    return; // ❗ STOP: non caricare dati né bind eventi se siamo in modalità sfondo
  }

  // 👤 Richiesta dati utente
  let data;
  try {
    const response = await fetch("/userArea", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    data = await response.json();

    if (!response.ok) {
      window.location.href = "/";
    } else {
      document.getElementById("nome").placeholder = data.user.nome;
      document.getElementById("cognome").placeholder = data.user.cognome;
      document.getElementById("username").placeholder = data.user.username;
      document.getElementById("email").placeholder = data.user.email;
      document.getElementById("telefono").placeholder = data.user.ntel;
    }
  } catch (err) {
    console.log(err);
    alert("Errore di rete.");
  }

  // ❌ Pulsante Annulla
  annulla.addEventListener("click", () => {
    ["nome", "cognome", "username", "email", "telefono"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  });

  // 💾 Pulsante Salva
  salva.addEventListener("click", async () => {
    console.log("Salvataggio in corso...");

    const values = {};
    ["nome", "cognome", "username", "email", "telefono"].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.value) {
        values[id === "telefono" ? "ntel" : id] = el.value;
      }
    });

    try {
      const response = await fetch("/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        window.location.href = "/userArea";
      } else {
        console.log("Errore durante l'update", response.status);
      }
    } catch (error) {
      window.location.href = "/";
    }
  });

  // 🚪 Logout
  logout.addEventListener("click", async () => {
    try {
      await fetch("/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // anche se fallisce il logout, lo mandiamo fuori
    } finally {
      window.location.href = "/";
    }
  });
});
