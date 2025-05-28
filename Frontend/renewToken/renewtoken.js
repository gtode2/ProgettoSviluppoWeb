document.addEventListener("DOMContentLoaded", async ()=>{
    try {
        const response = await fetch("/renewtoken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        })
        const params = new URLSearchParams(window.location.search);
        const from = params.get("from");
        if (response.ok) {
            window.location.href = from
        }else{
            window.location.href = "/"
        }
    } catch (err) {
        console.log(err);
        alert("Errore di rete.");
    }
}) 