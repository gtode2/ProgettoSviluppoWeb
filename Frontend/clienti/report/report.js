async function send() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');  
  const sdata = {
    productid: id,
    dove: document.getElementById("sel").value,
    desc: document.getElementById("motivo").value
  };

  try {
    const response = await fetch("/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sdata)
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log("segnalazione inviata");
      exit();
    } else {
      if (response.status === 401) {
        if (data.err === "missing token" || data.err === "invalid token") {
          const res = await renewToken();
          if (res === 0) {
            send();
          } else {
            window.parent.location.href = "/";
          }
        }
      } else if (response.status === 400) {
        if (data.err === "missing info") {
          alert("informazioni mancanti");
        }
      } else if (response.status === 500) {
        alert("errore del server");
      } else {
        alert("errore sconosciuto");
      }
    }
  } catch (error) {
    console.log(error);
    alert("Errore di rete.");
  }
}

function exit() {
  if (typeof window.parent.closeProduct === "function") {
    window.parent.closeProduct();
  }
  window.parent.loadCart();
}

document.addEventListener('DOMContentLoaded', function () {
  const sel = document.getElementById('sel');
  const motivo = document.getElementById('motivo');
  const conf = document.getElementById('conf');
  const invia = document.getElementById('invia');
  const annulla = document.getElementById('annulla');

  function validateForm() {
    const validSelect = sel.value && sel.value !== "";
    const validMotivo = motivo.value.trim() !== "";
    const validConf = conf.checked;

    invia.disabled = !(validSelect && validMotivo && validConf);
  }

  sel.addEventListener('change', validateForm);
  motivo.addEventListener('input', validateForm);
  conf.addEventListener('change', validateForm);

  validateForm();
  
  if (invia) {
      invia.addEventListener('click', async () => {
        await send();
      });
    }

  if (annulla) {
    annulla.addEventListener('click', function () {
      sel.selectedIndex = 0;
      motivo.value = "";
      conf.checked = false;
      validateForm();
      exit();
    });
  }
});
