const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Connessione PostgreSQL
const pool = new Pool({
    user: "tuo_utente",
    host: "localhost",
    database: "tuo_database",
    password: "tua_password",
    port: 5432,
});

// Endpoint registrazione
app.post("/registrazione", async (req, res) => {
    const { name, surname, email, phone, password, user_type } = req.body;

    // Validazione lato server
    if (!name || !surname || !email || !phone || !password || !user_type) {
        return res.status(400).send("Tutti i campi sono obbligatori.");
    }

    try {
        // Controlla se l'email è già registrata
        const checkQuery = "SELECT id FROM utenti WHERE email = $1";
        const existing = await pool.query(checkQuery, [email]);

        if (existing.rows.length > 0) {
            return res.status(409).send("Email già registrata.");
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO utenti (nome, cognome, email, telefono, password, tipo_utente)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [name, surname, email, phone, hashedPassword, user_type];

        await pool.query(query, values);
        res.status(200).send("Registrazione completata con successo.");
    } catch (err) {
        console.error("Errore durante la registrazione:", err);
        res.status(500).send("Errore interno al server.");
    }
});

app.listen(port, () => {
    console.log(`Server attivo su http://localhost:${port}`);
});
