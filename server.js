const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require('path');
const { checkdb } = require("./Database&Server/dbmanager.js");
const {createAccessToken, createRefreshToken, checkToken, renewToken, registerToken} = require("./Database&Server/userToken.js")
const {addProduct} = require("./Database&Server/products.js");
const {db_name, db_user, db_port, db_pw} = require("./config.js")



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
        res.sendFile(path.join(__dirname,"homepage","homepage.html"))
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
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `;
            const type=()=>{
                if (user_type=="artigiano") {
                    return 2
                }else{
                    return 1
                }
            }
            const values = [name, surname, username, email, phone, hashedPassword, type()];     
            const user = await pool.query(query, values);

            console.log("user in database");
            
            
            const tokens = await registerToken(user, pool)
            
            console.log(tokens["access"]);
            console.log("altro token")
            console.log(tokens["refresh"]);
            if (user_type=="artigiano") {
                res.status(200).json({
                    redirect: '/regAct',
                    accessToken: tokens["access"],
                    refreshToken: tokens["refresh"]

                })
            }
            else{

            }
        } catch (err) {
            console.error("Errore durante la registrazione:", err);
            res.status(500).send("Errore interno al server.");
        }
    });
    app.get("/RegAct",async(req,res)=>{
        res.sendFile(path.join(__dirname,"registrazione", "regact.html"))
    })
    app.post("/RegAct",async(req,res)=>{
        const user =checkToken(req,res) 
        if (user==-1) {
            return
        }
        //verifico che utente non abbia attività
        var query = `
            SELECT * FROM ATTIVITA
            WHERE actid = $1`

        var values = [user.id]
        var result = await pool.query(query,values)
        if (result.rows.length>0) {
            res.status(409).json({error:"utente ha già attività"})
            return
        }
        //aggiungo a DB
        query = `
            INSERT INTO attivita(actid, nome, indirizzo, email, ntel, descr)
            VALUES ($1,$2,$3,$4,$5,$6)
        `
        const {name, email, phone, address, descryption} = req.body
        values = [user.id, name, address, email, phone, descryption]
        try {
            result = pool.query(query,values)
            res.status(200)
        } catch (err) {
            console.log(err);
            res.status(500)           
        }
    })
    /////////////////////////////////////////////////////////////////////////
    //LOGIN

    app.get("/login",(req,res)=>{
        res.sendFile(path.join(__dirname,"login","login.html"))
    })
    app.post("/login", async(req,res)=>{  
        console.log("iniziata sequenza login");
        const {cred, pw} = req.body
        const query = "SELECT * FROM utenti WHERE username = $1"
        const hashedpw = await bcrypt.hash(pw,10);
        const values = [cred]
        const user = await pool.query(query,values)
        console.log(hashedpw)
        
        
        if (user.rows.length>0) {
            const isCorrect = await bcrypt.compare(pw, user.rows[0].password)
            if (!isCorrect) {
                    res.status(401).send("Credenziali non valide")
                    console.log("password errata");
                    return
            }
            const tokens = await registerToken(user, pool)
            console.log(tokens);
            
            var red = "http://localhost:3000/"
            console.log(user.rows[0].usertype);
            
            if (user.rows[0].usertype==2) {
                console.log("usertype=2");
                
                var red = "http://localhost:3000/TESTaddprod"
            }
            res.status(200).json({accessToken: tokens["access"], refreshToken:tokens["refresh"], redirect:red });
        }else{
            
            res.status(401).send("Credenziali non valide")
            console.log("no rows");
            
        } 

    })


    app.post("/renewToken", async (req,res)=>{
        console.log("chiamata a tokentest");
        const token = req.body

        
        const val = await renewToken(token,pool)
        console.log(val);
        if (val==-1) {
           res.send("403")
        }else{
            res.send("")
        }
    })
    app.post('/logout', async (req, res) => {
        console.log("logout");
        const { token } = req.body;
        
                //disabilitazione token
        const query = `UPDATE reftok SET revoked = true WHERE token=$1`
        const values = [token]
        try {
            await pool.query(query,values)
            
        } catch (error) {
            console.log(error);
            
        }
        console.log("logout effettuato");
        
        res.json({ message: 'Logout effettuato' });
        
        
    });

    app.post("/refreshToken", async(req,res)=>{
        const token = renewToken(req.body["token"], pool)
        if (token==-1) {
            res.status(401)
        }else{
            res.status(200).json({
                token:token
            })
        }
    })


    app.post("/addProduct", async(req,res)=>{
        console.log("add product avviata");
        const user = checkToken(req,res)
        
        if (user.role!=2) {
            console.log("tipo utente errato");
            res.status(401).json({error:"unauthorized"})
        }else{
            console.log(req.body);
            const result = await addProduct(req,pool)
            if (result==0) {
                res.status(200)
            }else{
                res.status(500)
            }
        }
        
    })

//FUNZIONI DI TEST TEMPORANEE
    //pagina di test aggiunta prodotti
    app.get("/TESTaddprod",(req,res)=>{
        res.sendFile(path.join(__dirname,"./testPages/prova.html"))
    }) 
    app.get("/TESTusertype",(req,res)=>{
        res.sendFile(path.join(__dirname,"./testPages/testusertype.html"))
    }) 
    
    app.get("/test",(req,res)=>{
        res.sendFile(path.join(__dirname,"prova.html"))
    })
    app.post("/test",async(req,res)=>{
        
        
    })
    

    app.listen(port, () => {
        console.log(`Server attivo su http://localhost:${port}`);
    });

    app.post("/ESEMPIOPROTECTED",(req,res)=>{
        //verifica presenza di token nel res
        if (!token) {
            return res.status(401).json({ message: 'Token mancante' });
        }

    })


}

main().catch((err) => {
    console.error("Errore durante l'inizializzazione del server:", err);
    process.exit(1);
  });