document.addEventListener("DOMContentLoaded", async () => {
  console.log("LOAD");
  const logout = document.getElementById("logout")
  try {
    const response = await fetch("/userArea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    })
    const data = await response.json()
    
    if (!response.ok) {
        window.location.href = "http://localhost:3000/"
    }else{
      //inserimento elementi
    }
  } catch (err) {
      console.log(err);
      alert("Errore di rete.");
  }  
  logout.addEventListener("click", async ()=>{
    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await response.json()
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