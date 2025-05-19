document.addEventListener("DOMContentLoaded", ()=>{
    document.getElementById("login").addEventListener("click", (event)=>{
        event.preventDefault();
        window.location.href="http://localhost:3000/login"
    })
    document.getElementById("register").addEventListener("click", (event)=>{
        event.preventDefault();
        window.location.href="http://localhost:3000/registrazione"
    })
    //rimuovere parametro event e preventDefault una volta rimosso il form
    //per rimuovere il form sistemare il css

})