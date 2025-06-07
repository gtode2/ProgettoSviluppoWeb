let applica = false
document.addEventListener("DOMContentLoaded", async() => {
  const modalEl = document.getElementById('modalFiltri');
  const closebtn = document.getElementById("apply")

  //caricamento produttori
  try {
    const res = await fetch("/artigiani",{
      method: "POST",
      headers: { "Content-Type": "application/json" }})
    const data = await res.json()
    await renewToken() //blocco caricamento artigiani in caso di token scaduto
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
  var filters = {}
  if (document.getElementById("categoria").value!=="default") {
    filters.cat = document.getElementById("categoria").value
    console.log("categoria");
    
  }
  if (document.getElementById("prezzoMin").value.trim()) {
    filters.min = document.getElementById("prezzoMin").value
    console.log("minimo");
  }if (document.getElementById("prezzoMax").value.trim()) {
    filters.max= document.getElementById("prezzoMax").value
    console.log("massimo");
  }
  if (document.getElementById("produttori").value.trim()!=="default") {
    filters.produttore= document.getElementById("produttori").value
    console.log("produttori");
  }
  if (document.getElementById("ordine").value.trim()!=="default") {
    filters.order= document.getElementById("ordine").value
    console.log("ordine");
  }
  if (document.getElementById("disponibili").value==="on") {
    filters.disp=true
  }else{
    filters.disp=false
  }
  return filters
}


