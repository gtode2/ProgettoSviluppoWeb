const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require('path');
const { checkdb } = require("./Database&Server/dbmanager.js");
const {createAccessToken, createRefreshToken} = require("./Database&Server/userToken.js")



const db_user = "postgres"
const db_name = "dbprogetto"
const db_pw = "postgres"
const db_port = 5432 


async function main(params) {
    
    const app = express();
    const port = 3000;


    app.use(express.static(path.join(__dirname, "login")));
    app.use(express.static(path.join(__dirname, "registrazione")));
    app.use(express.static(path.join(__dirname, "homepage")));
    app.use(express.static(path.join(__dirname, "homepage_temp")));


    app.use(cors());
    app.use(bodyParser.json());
    const pool = await initDb()

    // Connessione PostgreSQL
    async function initDb() {
        var cdb = await checkdb()
        if (cdb==0) {
            console.log("Creazione pool");

            const pool = new Pool({
            user: db_user,
            host: "localhost",
            database: db_name,
            password: db_pw,
            port: db_port,
            });
            console.log("Pool creata correttamente");
            return pool

        }else{
            console.log("impossibile inizializzare DB");
            console.log(cdb);
        
            process.exit(0)
        }
    }

    /////////////////////////////////////////////////////////////////////////
    //HOMEPAGE
    app.get("/",(req,res)=>{
        res.sendFile(path.join(__dirname,"homepage_temp","unlogged.html"))
    })


    /////////////////////////////////////////////////////////////////////////
    //REGISTRAZIONE

    app.get("/registrazione",(req,res)=>{
        res.sendFile(path.join(__dirname,"registrazione","registrazione.html"))
    })
    // Endpoint registrazione
    app.post("/registrazione", async (req, res) => {
        const { name, surname, username, email, phone, password, user_type } = req.body;

        // Validazione lato server
        if (!name || !surname || !username || !email || !phone || !password || !user_type) {
            return res.status(400).send("Tutti i campi sono obbligatori.");
        }

        try {
            // Controlla se l'email è già registrata
            const checkQuery = "SELECT uid FROM utenti WHERE email = $1";
            const existing = await pool.query(checkQuery, [email]);

            if (existing.rows.length > 0) {
                return res.status(409).send("Email già registrata.");
            }

            // Hash della password
            const hashedPassword = await bcrypt.hash(password, 10);

            const query = `
                INSERT INTO utenti (nome, cognome, username, email, ntel, password, usertype)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            const type=()=>{
                if (user_type=="artigiano") {
                    return 2
                }else{
                    return 1
                }
            }
            const values = [name, surname, username, email, phone, hashedPassword, type()];     
            await pool.query(query, values);
            if (user_type=="artigiano") {
                res.redirect("/regAct")
            }
            res.status(200).send("Registrazione completata")
        } catch (err) {
            console.error("Errore durante la registrazione:", err);
            res.status(500).send("Errore interno al server.");
        }
    });
    app.get("/RegAct",async(req,res)=>{
        res.sendFile(path.join(__dirname,"registrazione", "regact.html"))
    })
    app.post("/RegAct",async(req,res)=>{
        
    })
    /////////////////////////////////////////////////////////////////////////
    //LOGIN

    app.get("/login",(req,res)=>{
        res.sendFile(path.join(__dirname,"login","login.html"))
    })
    app.post("/login", async(req,res)=>{  //NOME ROUTE TEMPORANEO
        console.log("iniziata sequenza login");
        
        const {cred, password} = req.body
        const query = "SELECT * FROM utenti WHERE email = $1 AND password = $2"
        const hashedpw = bcrypt.hash(password,10);
        const values = [cred, hashedpw]
        const user = await pool.query(query,values)
        
        if (user.rows.length>0) {
            const accessToken = createAccessToken(user.rows[0])
            const refreshToken = createRefreshToken(user.rows[0])
            console.log("creato token");
            
            //inserire refreshToken in db
            try {
                const query = `
                INSERT INTO utenti (userid, token, exp, revoked)
                VALUES ($1, $2, $3, $4)
                `;
                const now = new Date();
                const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                const values = [user.rows[0].uid, refreshToken, expiresAt, false];
                await pool.query(query,values)
            } catch (error) {
                console.log("non va un cazzo \n"+error);
                
            }
            
            res.status(200).send("Accesso eseguito")
            res.json({ accessToken, refreshToken });
        }else{
            res.status(401).send("Credenziali non valide")
        } 

    })



    app.listen(port, () => {
        console.log(`Server attivo su http://localhost:${port}`);
    });
}


main().catch((err) => {
    console.error("Errore durante l'inizializzazione del server:", err);
    process.exit(1);
  });