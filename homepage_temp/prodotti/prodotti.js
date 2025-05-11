document.addEventListener("DOMContentLoaded", () => {
  function updateGridLayout() {
    const container = document.querySelector(".container");
    
    if (window.innerWidth < 768) {
      container.style.display = "block"; // Layout verticale su schermi piccoli
    } else {
      container.style.display = "grid";
      container.style.gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))";
      container.style.gap = "15px";
    }
  }

  // Esegui la funzione all'inizio e al ridimensionamento della finestra
  updateGridLayout();
  window.addEventListener("resize", updateGridLayout);
});
