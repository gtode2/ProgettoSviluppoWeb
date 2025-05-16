document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("acquistoForm");
  const quantita = document.getElementById("quantita");
  const feedback = document.getElementById("feedback");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const valore = parseInt(quantita.value.trim());

    if (isNaN(valore) || valore <= 0) {
      feedback.textContent = "❌ Inserisci una quantità valida (maggiore di 0).";
      feedback.className = "text-danger mt-2";
      return;
    }

    feedback.textContent = `✅ Acquisto confermato! Quantità: ${valore}`;
    feedback.className = "text-success mt-2";
    form.reset();
  });
});
