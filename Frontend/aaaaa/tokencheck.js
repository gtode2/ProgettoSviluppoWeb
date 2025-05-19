document.addEventListener("DOMContentLoaded", async()=>{
    console.log("AAA");
    
    try {
        const response = await fetch("/", {
            method: "GET",
            headers: { 
            "Content-Type": "application/json",
            }
        })
        console.log("inviato");
        
        if(!response.ok){
            console.log("errore");
            
            
        }else{{
            window.location.href = "/"
        }}
    } catch (error) {
        alert("aaa")
    }
})
