function getProductIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
      }

      // Popola i campi HTML con i dati del prodotto
      function mostraDettaglioProdotto(p) {
        console.log("Prodotto ricevuto:", p);
        document.getElementById("nome").textContent = p.name;
        document.getElementById("descrizione").textContent = p.descr;
        document.getElementById("prezzo").textContent = p.costo;
        document.getElementById("quantita").textContent =
          (p.amm !== undefined && p.amm !== null) ? p.amm : "0";
        document.getElementById("categoria").textContent = p.cat || "non specificata";
      }

      // Funzione per chiudere il dettaglio del prodotto
      function closeProduct() {
        console.log("close");
        if (window.parent && typeof window.parent.closeProduct === 'function') {
          window.parent.closeProduct();
        } else {
          window.history.back();
        }
      }

      function goBack() {
        closeProduct();
      }

      // Inizializzazione: recupera l'ID, chiama l'API e popola la pagina
      document.addEventListener("DOMContentLoaded", async () => {
        const id = getProductIdFromUrl();
        console.log("ID prodotto estratto dalla URL:", id);

        try {
          const response = await fetch("/getProducts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })
          });
          
          const data = await response.json();

          if (!response.ok) {
            console.error("Errore:", response.status, data.error || "");
            document.getElementById("descrizione").innerHTML = `
              <div class="alert alert-danger">Errore nel caricamento del prodotto.</div>
            `;
          } else {
            console.log("Prodotti caricati correttamente");
            if (data.prodotti && data.prodotti.length > 0) {
              const prodottoSelezionato = data.prodotti.find(prod => String(prod.id) === id);
              if (prodottoSelezionato) {
                mostraDettaglioProdotto(prodottoSelezionato);
              } else {
                document.getElementById("descrizione").innerHTML = `
                  <div class="alert alert-warning">Prodotto non trovato.</div>
                `;
              }
            } else {
              document.getElementById("descrizione").innerHTML = `
                <div class="alert alert-warning">Prodotto non trovato.</div>
              `;
            }
          }
        } catch (err) {
          console.error(err);
          alert("Errore di rete.");
        }
      });