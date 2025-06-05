document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body:JSON.stringify({act:true})
        });

        data = await response.json();
        console.log(data);
        

        if (!response.ok) {
          //gestione errori
          console.log(response.status);
          
        } else {
          document.getElementById("nome").placeholder = data.act.nome;
          document.getElementById("email").placeholder = data.act.email;
          document.getElementById("telefono").placeholder = data.act.ntel;
          document.getElementById("indirizzo").placeholder = data.act.indirizzo;
          document.getElementById("descr").placeholder = data.act.descr
        }
    } catch (err) {
        console.log(err);
        alert("Errore di rete.");
    }
})

async function save() {
  const values = {};
  ["nome", "email", "telefono", "descr", "indirizzo"].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value) {
      values[id === "telefono" ? "ntel" : id] = el.value;
    }
  });
  try {
    const response = await fetch("/updateAct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json()
    if (response.ok) {
      window.location.reload();
    } else {
      //gestione errori
      if (response.status===401) {      
        if (data.err==="missing token") {
          const res = await renewToken()
          if (res===0) {            
            await save()
          }else{
            window.location.href="/"
          }
        }
      }
    }
  } catch (error) {
    window.location.href = "/";
  }
}

async function cancel() {
    document.getElementById("nome").value = "";
    document.getElementById("email").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("indirizzo").value = "";
    document.getElementById("descr").value = "";
}