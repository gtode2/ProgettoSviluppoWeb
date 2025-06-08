let applica = false
document.addEventListener("DOMContentLoaded", async() => {
  const modalEl = document.getElementById('modalFiltri');
  const closebtn = document.getElementById("apply")

  try {
    const res = await fetch("/artigiani",{
      method: "POST",
      headers: { "Content-Type": "application/json" }})
    const data = await res.json()
    await renewToken()
    if (res.ok) {
      if (data.art!==0) {
        const block = document.getElementById("produttori")
        console.log(data.art);
      
        data.art.forEach(el => {
          const option = document.createElement("option")
          option.value = el.actid
          option.textContent = el.nome
          block.appendChild(option)
        });
      }else{
        const block = document.getElementById("bloccoartigiano")
        block.remove()
      }
    }
  } catch (error) {
    console.log(error);
    
  }

  closebtn.addEventListener("click", () => {
      applica = true
      console.log("Filtri applicati");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      cerca()
    });

  modalEl.addEventListener('hidden.bs.modal', function () {
    if (!applica) {
      document.getElementById('form-filtri').reset();
    }
    console.log("reset");
    applica = false
  });

});


function getfilters(){
  var filters = {};


  var categoriaElem = document.getElementById("categoria");
  if (categoriaElem) {
    let catVal = categoriaElem.value.trim();
    if (catVal !== "default") { 
      filters.cat = catVal;
      console.log("categoria:", catVal);
    } else {
      console.log("categoria impostata a default");
    }
  } else {
    console.warn("Elemento con id 'categoria' non trovato");
  }

  
  var prezzoMinElem = document.getElementById("prezzoMin");
  if (prezzoMinElem) {
    let minVal = prezzoMinElem.value.trim();
    if (minVal) {
      filters.min = minVal;
      console.log("minimo:", minVal);
    }
  } else {
    console.warn("Elemento con id 'prezzoMin' non trovato");
  }

  
  var prezzoMaxElem = document.getElementById("prezzoMax");
  if (prezzoMaxElem) {
    let maxVal = prezzoMaxElem.value.trim();
    if (maxVal) {
      filters.max = maxVal;
      console.log("massimo:", maxVal);
    }
  } else {
    console.warn("Elemento con id 'prezzoMax' non trovato");
  }

  
  var produttoriElem = document.getElementById("produttori");
  if (produttoriElem) {
    let prodVal = produttoriElem.value.trim();
    if (prodVal !== "default") {
      filters.produttore = prodVal;
      console.log("produttori:", prodVal);
    }
  } else {
    console.warn("Elemento con id 'produttori' non trovato");
  }

  
  var ordineElem = document.getElementById("ordine");
  if (ordineElem) {
    let ordVal = ordineElem.value.trim();
    if (ordVal !== "default") {
      filters.order = ordVal;
      console.log("ordine:", ordVal);
    }
  } else {
    console.warn("Elemento con id 'ordine' non trovato");
  }

  
  var disponibiliElem = document.getElementById("disponibili");
  if (disponibiliElem) {
    filters.disp = disponibiliElem.value === "on";
    console.log("disponibilità:", filters.disp);
  } else {
    console.warn("Elemento con id 'disponibili' non trovato");
    filters.disp = false; 
  }

  return filters;
}
