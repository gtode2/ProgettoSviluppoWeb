const express = require('express');
const router = express.Router();
const dbManager = require('./dbManager'); // Assicurati che il path sia corretto

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
