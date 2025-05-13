(async ()=> {
    console.log("AAA");
    var at = localStorage.getItem("accessToken")
    
    if (!at) {
        at=-1
    }
    
    
    const response = await fetch("http://localhost:3000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({token:at})
    })
    .then(response => response.text()) 
    .then(data => {
        document.documentElement.innerHTML = data;
    })
    .catch(error => console.error('Errore:', error));
})()