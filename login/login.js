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
