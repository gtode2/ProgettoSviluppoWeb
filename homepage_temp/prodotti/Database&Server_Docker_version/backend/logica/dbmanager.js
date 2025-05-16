const { Pool } = require("pg");
const { db_user, db_port, db_pw } = require("../config.js");

const pool = new Pool({
    user: db_user,
    host: 'db', // ← nome servizio nel docker-compose
    database: 'postgres',
    password: db_pw,
    port: db_port
});

async function checkTables() {
    try {
        const tables = {
            utenti: creaUtenti,
            attivita: creaAttivita,
            reftok: creaRefTok,
            prodotti: creaProdotti
        };

        for (const [table, creator] of Object.entries(tables)) {
            const res = await pool.query(
                "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name=$1)",
                [table]
            );
            if (!res.rows[0].exists) {
                console.log(`Tabella "${table}" non trovata. Creazione in corso...`);
                await creator();
                console.log(`Tabella "${table}" creata con successo.`);
            }
        }

    } catch (error) {
        console.error("Errore durante la verifica o creazione delle tabelle:", error);
    }
}

async function creaUtenti() {
    await pool.query(`
        CREATE TABLE utenti (
            uid SERIAL PRIMARY KEY,
            nome VARCHAR NOT NULL,
            cognome VARCHAR NOT NULL,
            username VARCHAR NOT NULL,
            email VARCHAR NOT NULL,
            ntel BIGINT NOT NULL,
            password VARCHAR NOT NULL,
            usertype INT NOT NULL
        )
    `);
}

async function creaAttivita() {
    await pool.query(`
        CREATE TABLE attivita (
            actid INT PRIMARY KEY,
            nome VARCHAR NOT NULL,
            indirizzo VARCHAR,
            email VARCHAR NOT NULL,
            ntel INT,
            descr VARCHAR NOT NULL,
            FOREIGN KEY (actid) REFERENCES utenti(uid)
        )
    `);
}

async function creaRefTok() {
    await pool.query(`
        CREATE TABLE reftok (
            id SERIAL PRIMARY KEY,
            userid INT NOT NULL,
            token VARCHAR,
            exp TIMESTAMP NOT NULL,
            revoked BOOLEAN,
            FOREIGN KEY (userid) REFERENCES utenti(uid)
        )
    `);
}

async function creaProdotti() {
    await pool.query(`
        CREATE TABLE prodotti (
            id SERIAL PRIMARY KEY,
            actid INT NOT NULL,
            name VARCHAR NOT NULL,
            descr VARCHAR NOT NULL,
            costo FLOAT NOT NULL,
            amm INT NOT NULL,
            FOREIGN KEY (actid) REFERENCES attivita(actid)
        )
    `);
}

module.exports = { checkTables, pool };
