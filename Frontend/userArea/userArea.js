document.addEventListener("DOMContentLoaded", async () => {
  const logout = document.getElementById("logout")
  const annulla = document.getElementById("annulla")
  const salva = document.getElementById("salva")

  var data

  try {
    const response = await fetch("/userArea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    })
    data = await response.json()
    console.log(data.user);
    
    
    if (!response.ok) {
        window.location.href = "http://localhost:3000/"
    }else{
      document.getElementById("nome").placeholder = data.user.nome
      document.getElementById("cognome").placeholder= data.user.cognome
      document.getElementById("username").placeholder= data.user.username
      document.getElementById("email").placeholder= data.user.email
      document.getElementById("telefono").placeholder= data.user.ntel

    }
  } catch (err) {
      console.log(err);
      alert("Errore di rete.");
  }  
  annulla.addEventListener("click", ()=>{
    document.getElementById("nome").value = ""
    document.getElementById("cognome").value = ""
    document.getElementById("username").value = ""
    document.getElementById("email").value = ""
    document.getElementById("telefono").value = ""
    
  })
  salva.addEventListener("click", async ()=>{
    console.log("salva");
    //eseguire controlli validità informazioni inserite
    try {
      const response = await fetch("/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      window.location.href = "http://localhost:3000/"
    } catch (error) {
      window.location.href = "http://localhost:3000/"
    }
  })
  
  logout.addEventListener("click", async ()=>{
    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      window.location.href = "http://localhost:3000/"
    } catch (error) {
      window.location.href = "http://localhost:3000/"
    }
  })  
})



/*
const express = require('express');
const router = express.Router();
const dbManager = require('./dbManager'); // verificare che il path sia corretto

// Endpoint per i dati utente
router.get('/dati', async (req, res) => {
  try {
    const userId = req.session.userId; // Assumendo che usi le sessioni
    const user = await dbManager.getUserById(userId);

    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    res.json({
      nome: user.nome,
      email: user.email,
      ruolo: user.ruolo,
      registrato: user.dataRegistrazione
    });
  } catch (err) {
    console.error('Errore nel recupero dei dati utente:', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Endpoint per lo storico attività
router.get('/log', async (req, res) => {
  try {
    const userId = req.session.userId;
    const storico = await dbManager.getUserLog(userId);

    res.json(storico); // Array di stringhe o oggetti attività
  } catch (err) {
    console.error('Errore nel recupero dello storico attività:', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router;

*/