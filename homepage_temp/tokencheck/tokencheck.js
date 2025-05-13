document.addEventListener("DOMContentLoaded", async()=>{
    console.log("AAA");
    var at = localStorage.getItem("accessToken")
    console.log(at);
    
    if (!at) {
        at=-1        
    }
    
    try {
        const response = await fetch("http://localhost:3000/", {
            method: "GET",
            headers: { 
            "Content-Type": "application/json",
            "token": at.toString()
            }
        })
        console.log("inviato");
        
        if(!response.ok){
            console.log("errore");
            
            
        }else{{
            window.location.href = "http://localhost:3000/"
        }}
    } catch (error) {
        alert("aaa")
    }
})
