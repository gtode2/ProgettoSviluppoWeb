const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { checkTables, pool } = require('./logic/dbmanager');
const productRoutes = require('./logic/product');
const tokenUtils = require('./logic/userToken');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Init automatico tabelle
(async () => {
  console.log("⏳ Verifica tabelle DB...");
  await checkTables();
  console.log("✅ Inizializzazione DB completata.");
})();

// Test endpoint
app.get('/', (req, res) => {
  res.send('✅ Backend Dockerizzato attivo e funzionante!');
});

// Endpoint esempio per ottenere prodotti
app.get('/prodotti', async (req, res) => {
  try {
    const prodotti = await productRoutes.getProducts(pool);
    res.json(prodotti);
  } catch (error) {
    res.status(500).json({ error: "Errore interno nel recupero prodotti" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server backend attivo su http://localhost:${PORT}`);
});
