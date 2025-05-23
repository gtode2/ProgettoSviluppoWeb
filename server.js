const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require('path');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');


const { checkdb } = require("./Backend/dbmanager.js");
const {createAccessToken, createRefreshToken, checkToken, renewToken, registerToken} = require("./Backend/userToken.js")
const {addProduct, getProducts, addCart, getCart, emptyCart} = require("./Backend/products.js");
const {addReport, getReports, removeReport, removeReportedProduct, banArtigiano} = require("./Backend/reports.js");
const {db_name, db_user, db_port, db_pw} = require("./config.js")




async function main() {
    
    const app = express();
    const port = 3000;


    app.use(express.static(path.join(__dirname, "homepage")));
    app.use(express.static(path.join(__dirname, "Frontend/unlogged")));
    app.use(express.static(path.join(__dirname, "Frontend/registrazione")));
    app.use(express.static(path.join(__dirname, "Frontend/admin")));
    app.use(express.static(path.join(__dirname, "Frontend/artigiano")));
    app.use(express.static(path.join(__dirname, "Frontend/clienti")));
    app.use(express.static(path.join(__dirname, "Frontend/tokencheck")));
    app.use(express.static(path.join(__dirname, "Frontend")));


    app.use(cookieParser());
    app.use(cors({
        origin:'http://localhost:3000',
        credentials:true
    }));
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
    cron.schedule('* * * * *', async() => {
        console.log("Controllo ordini scaduti...");
        try {
            await pool.query("BEGIN")
            const pending = await pool.query("SELECT id, expires_at, products FROM ordini WHERE expires_at<NOW()")
            console.log(pending.rows);
            
            for(const el of pending.rows){
                //rimuovo da db
                await pool.query("DELETE FROM ordini WHERE id=$1",[el.id])
                console.log("ordine rimosso");
                //aggiungo elementi a prodotti
                const prodotti = el.products
                for (const [id, qt] of Object.entries(prodotti)) {
                    await pool.query(`UPDATE prodotti set amm=amm+$1 WHERE id=$2`,[qt, id])
                    console.log("reinseriti prodotti "+id);  
                }
            }
            await pool.query("COMMIT")
        } catch (error) {
            await pool.query("ROLLBACK")
            console.log(error);
        }
        console.log("procedura completata");
    });

    /////////////////////////////////////////////////////////////////////////
    //HOMEPAGE
    app.get("/",(req,res)=>{
        console.log("richiesta homepage");
        console.log(req.headers);
        try {
            const token = req.cookies.accessToken;
            if (!token) {
            console.log("no token");
            res.sendFile(path.join(__dirname,"Frontend/unlogged","unlogged.html"))
        }else{
            console.log(token);
            
            const user = checkToken(req,res,token)
            if (user!==-1) {
                switch (user.role) {
                    case 1:
                        
                        res.sendFile(path.join(__dirname,"Frontend","/clienti/clienti.html"))
                        break;
                    case 2:
                        res.sendFile(path.join(__dirname,"Frontend","/artigiano/artigiano.html"))
                        break;
                    case 0:
                        res.sendFile(path.join(__dirname,"Frontend","/admin/admin.html"))
                        break;
                    default:
                        res.sendFile(path.join(__dirname,"Frontend","/unlogged/unlogged.html"))
                        break;
                }
            }
            
        }
        } catch (error) {
            console.log(error);
            res.status(500)
            
            
        }
    })
    

    /////////////////////////////////////////////////////////////////////////
    //REGISTRAZIONE

    app.get("/registrazione",(req,res)=>{
        res.sendFile(path.join(__dirname,"Frontend","registrazione/registrazione.html"))
    })
    // Endpoint registrazione
    app.post("/registrazione", async (req, res) => {
        const { name, surname, username, email, phone, password, user_type } = req.body;

        // Validazione lato server
        /*
        teoricamente inutile -> dati verificati lato client        
        if (!name || !surname || !username || !email || !phone || !password || !user_type) {
            return res.status(400).send("Tutti i campi sono obbligatori.");
        }

        */ 
        try {
            // Controlla se l'email è già registrata
            const checkQuery = "SELECT uid FROM utenti WHERE email = $1";
            const existing = await pool.query(checkQuery, [email]);

            if (existing.rows.length > 0) {
                return res.status(409).json({error:"Email già registrata."});
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
                res.status(200)
                .cookie('accessToken', tokens["access"],{
                    httpOnly:true,
                    secure:false, ////////IMPOSTARE SECURE TRUE UNA VOLTA ATTIVATO HTTPS
                    sameSite:'Strict',
                    maxAge: 50 * 60 * 1000 //50 minuti
                })
                .cookie('refreshToken', tokens["refresh"],{
                    httpOnly:true,
                    secure:false, ////////IMPOSTARE SECURE TRUE UNA VOLTA ATTIVATO HTTPS
                    sameSite:'Strict',
                    maxAge:7 * 24 * 60 * 60 * 1000 //7 giorni
                }).json({
                    redirect: '/regAct',
                })
            }
            else{
                res.status(200)
                .cookie('accessToken', tokens["access"],{
                    httpOnly:true,
                    secure:false, ////////IMPOSTARE SECURE TRUE UNA VOLTA ATTIVATO HTTPS
                    sameSite:'Strict',
                    maxAge: 50 * 60 * 1000 //50 minuti
                })
                .cookie('refreshToken', tokens["refresh"],{
                    httpOnly:true,
                    secure:false, ////////IMPOSTARE SECURE TRUE UNA VOLTA ATTIVATO HTTPS
                    sameSite:'Strict',
                    maxAge:7 * 24 * 60 * 60 * 1000 //7 giorni
                }).json({})
            }
        } catch (err) {
            console.error("Errore durante la registrazione:", err);
            res.status(500).json({error:"Errore interno al server"});
        }
    });
    app.get("/RegAct",async(req,res)=>{
        res.sendFile(path.join(__dirname,"Frontend", "registrazione/regact.html"))
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
        res.sendFile(path.join(__dirname,"Frontend","login/login.html"))
    })
    app.post("/login", async(req,res)=>{  
        console.log("iniziata sequenza login");
        const {cred, pw} = req.body
        const query = "SELECT * FROM utenti WHERE username = $1"
        const hashedpw = await bcrypt.hash(pw,10);
        const values = [cred]
        const user = await pool.query(query,values)
        //console.log(hashedpw)
        
        
        if (user.rows.length>0) {
            
            const isCorrect = await bcrypt.compare(pw, user.rows[0].password)
            if (!isCorrect) {
                    res.status(401).json({error:"Credenziali non valide"})
                    console.log("password errata");
                    return
            }
            const tokens = await registerToken(user, pool)
            console.log(tokens);
            
            res.status(200)
                .cookie('accessToken', tokens["access"],{
                    httpOnly:true,
                    secure:false, ////////IMPOSTARE SECURE TRUE UNA VOLTA ATTIVATO HTTPS
                    sameSite:'Strict',
                    maxAge: 50 * 60 * 1000 //50 minuti
                })
                .cookie('refreshToken', tokens["refresh"],{
                    httpOnly:true,
                    secure:false, ////////IMPOSTARE SECURE TRUE UNA VOLTA ATTIVATO HTTPS
                    sameSite:'Strict',
                    maxAge:7 * 24 * 60 * 60 * 1000 //7 giorni
                }).json({usertype:user.role})
            
        }else{
            res.status(401).json({error:"Credenziali non valide"})
            console.log("no rows");
            
        } 

        

    })


    app.post("/renewToken", async (req,res)=>{
        console.log("chiamata a tokentest");
        const token = req.body

        
        const val = await renewToken(token,pool)
        console.log(val);
        if (val==-1) {
           res.status(403)
        }else{
            //da sistemare
            //res.send("")
        }
    })
    app.post('/logout', async (req, res) => {
        console.log("logout");
        const token = req.cookies.refreshToken
                //disabilitazione token
        const query = `UPDATE reftok SET revoked = true WHERE token=$1`
        const values = [token]
        try {
            await pool.query(query,values)
            
        } catch (error) {
            console.log(error);
            
        }
        console.log("logout effettuato");
        
        res.status(200)
        .clearCookie('accessToken', {
            httpOnly: true,
          secure: false,      // oppure true, in base a come era stato impostato
            sameSite: 'Strict', // deve corrispondere alle opzioni originali
        })
        .clearCookie('refreshToken', {
            httpOnly: true,
          secure: false,      // oppure true, in base a come era stato impostato
            sameSite: 'Strict', // deve corrispondere alle opzioni originali
        }).json({});
        
        
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
        if (user===-1) {
            return
        }
        if (user.role!=2) {
            console.log("tipo utente errato");
            res.status(401).json({error:"unauthorized"})
        }else{
            console.log(req.body);
            
            const result = await addProduct(req, user.id,pool)
            if (result===0) {
                res.status(200).json({})
            }else{
                res.status(500).json({})
            }
        }
    })


    app.post("/getProducts", async(req,res)=>{     
        console.log("Get products");
        var {filters} = req.body  
        user = await checkToken(req,res,false)
        const {id} = req.body


        if (!id) {
            console.log("richiesta prodotti");
            if (user!==-1 && user.role===2) {
                if (!filters) {
                    var filters = {}
                }
                filters.produttore = user.id
            }
            if (!filters) {
                var result = await getProducts(pool)    
            }else{
                var result = await getProducts(pool, filters)
            }

            //verifica quantità risultati
            
            if (result.length===0) {
                console.log("nessun risultato trovato");
                res.status(200).json({prodotti:0})
            }else{
                console.log(result);
                if (user!==-1) {
                    res.status(200).json({prodotti:result, usertype:user.role})
                }else{
                    res.status(200).json({prodotti:result, usertype:3})
                }
            }
        }else{
            console.log("richiesta prodotto specifico");
            //richiesta prodotto specifico
            var result  = await getProducts(pool, null, id)
            if (user!==-1) {
               res.status(200).json({prodotti:result, usertype:user.role})
            }else{
                res.status(200).json({prodotti:result, usertype:3})
            }
        
        }
        /*
        
        else{
            console.log("richiesta prodotto specifico");
            //richiesta prodotto specifico
            prod = await getProducts(pool, null, id)
        }
        console.log(user);
        
        
        */
    })
    
    
    
    app.post("/addCart", async (req,res) => {
        
        const {id} = req.body
        if (!id) {
            console.log("missing product");
                        
            res.status(401).json({error:"missing product"})
            return
        }
        const user = checkToken(req,res)
        if (user!== -1) {
            if (user.role!==1) {
                res.status(401).json({error:"unauthorized"})
                return
            }   
            const status = await addCart(pool, id, user.id)
            if (status===-1) {
                res.status(500).json({})
            } else if (status === 0) {
                res.status(200).json({res:"added"})
            } else {        
                res.status(200).json({res:status})
            }
        }
        
        
    })
    app.post("/getCart", async (req,res) => {
        console.log("getCart");
        
        const user = checkToken(req,res)
        if (user!==-1) {
              if (user.role!==1) {
                res.status(401).json({error:"unauthorized"})
                return
            }
            const response = await getCart(pool, user.id)
            if (response!==-1) {
                res.status(200).json({carrello:response})
                console.log("AAA");
                
            }else{
                res.status(500).json({})
                console.log("BBB");
                
            }
        }
    })

    app.post("/emptyCart", async (req,res) => {
        console.log("emptyCart");
        
        const user = checkToken(req,res)
        if (user!==-1) {
              if (user.role!==1) {
                res.status(401).json({error:"unauthorized"})
                return
            }
            const response = await emptyCart(pool, user.id)
            if (response===0) {
                res.status(200).json({})
                console.log("AAA");
                
            }else{
                res.status(500).json({})
                console.log("BBB");
                
            }
        }
    })
    

    app.post("/addReport", async(req,res)=>{
        console.log("add report");
        
        user = await checkToken(req,res)
        if (user===-1) {
            return
        }
        const {productid, dove, desc} = req.body
        if (!productid && !dove && !desc) {
            console.log("informazioni mancanti");
            res.status(400).json({})
            return
        }
        const response = await addReport(pool,user.id, productid, dove, desc)
        console.log(response);
        if (response===0) {
            res.status(200).json({})
        }else{
            res.status(500).json({})
        }
        
    })
    app.post("/getReports", async(req,res)=>{
        //verifica token
        const user = checkToken(req,res)
        if (user!==-1) {
              if (user.role!==0) {
                res.status(401).json({error:"unauthorized"})
                return
            }
            const response = await getReports(pool)
            if (response!==-1) {
                res.status(200).json({reports:response})
                console.log("AAA");
                
            }else{
                res.status(500).json({})
                console.log("BBB");
                
            }
        }
        //chiamata funzione reporst/getReports        
    })
    app.post("/closeReport", async (req,res) => {
        const user = checkToken(req,res)
        if (user===-1) {
            console.log("wrong token");
            return
        }
        if (user.role!==0) {
            console.log("wrong usertype");
            res.status(401).json({error:"unauthorized"})
            return
        }
        const {id}=req.body
        if (!id) {
            res.status(400).json({})
            console.log("missing id");
            
            return
        }

        const result = await removeReport(pool, id)    
        if (result===0) {
            res.status(200).json({})
            console.log("report chiuso correttamente");
            
        }else{
            res.status(500).json({})
        }
    })


    app.post("/ban", async (req,res) => {
        const user = checkToken(req,res)
        if (user===-1) {
            console.log("wrong token");
            return
        }
        if (user.role!==0) {
            console.log("wrong usertype");
            res.status(401).json({error:"unauthorized"})
            return
        }
        const {id, type}=req.body
        if (!id && !type) {
            res.status(400).json({})
            console.log("missing info");
            return
        }

        if (type===0) {    
            const result = await removeReportedProduct(pool,id)    
            if (result===0) {
                res.status(200).json({})
                console.log("prodotto rimosso correttamente");
            }else{
                res.status(500).json({})
            }
        }else{
            const result = await banArtigiano(pool,id)    
            if (result===0) {
                res.status(200).json({})
                console.log("prodotto rimosso correttamente");
            }else{
                res.status(500).json({})
            }
            //ban artigiano
        }
        
    })


    app.post("/artigiani", async(req,res)=>{
        console.log("richiesta artigiani");
        
        user = checkToken(req,res,false)
        if (user!==-1 && user.role===2) {
            res.status(200).send({art:0})
            console.log("utente artigiano");
            
        }
        try {
            response = await pool.query("SELECT actid, nome FROM attivita")
            res.status(200).json({art:response.rows})
            console.log(response.rows);
            
        } catch (error) {
            console.log(error);
            res.status(500).json({})
        }
    })

    app.post("/userArea", async(req,res)=>{        
        const user = checkToken(req,res)
        if (user.role===2) {
            console.log("artigiano");
            try {
                const response = await pool.query(`SELECT utenti.nome AS unome, utenti.cognome AS ucognome, utenti.username, utenti.email AS umail, utenti.ntel AS untel, attivita.nome AS anome, attivita.indirizzo, attivita.email AS amail, attivita.ntel AS antel, attivita.descr  FROM utenti JOIN attivita ON utenti.uid=attivita.actid WHERE uid = $1`, [user.uid])
                //gestire richiesta acquisti
                
                res.status(200).json({user:response.rows[0]})
            } catch (error) {
                console.log(error);
                res.status(500).json({})
            }
        }else{
            console.log("cliente");
            try {                
                console.log("ID = "+user.id);
                
                const response = await pool.query(`SELECT nome, cognome, username, email, ntel FROM utenti WHERE uid = $1`, [user.id])
                //gestire richiesta acquisti
                res.status(200).json({user:response.rows[0]})
                console.log(response);
                
            } catch (error) {
                console.log(error);
                res.status(500).json({})
            }
        }
        
    })

    app.post("/updateUser", async (req,res) => {
        const {nome, cognome, username, email, ntel} = req.body
        const user = checkToken(req,res)
        if (user===-1) {
            return
        }
        //gestione dati generici (nome, cognome, username, email, numero telefono)
        var query = `UPDATE utenti SET `
        var values = []

        if(nome){
            query += ` nome = $`+(values.length+1)
            values.push(nome)
        }
        if (cognome) {
            if (values.length!==0) {
                query += ` , `
            }
            query += ` cognome = $`+(values.length+1)
            values.push(cognome)
        }
        if (username) {
            if (values.length!==0) {
                query += ' , '
            }
            query += ` username = $`+(values.length+1)
            values.push(username)
        }
        if (email) {
            if (values.length!==0) {
                query += ' , '
            }
            query += ` email = $`+(values.length+1)
            values.push(email)
        }
        if (ntel) {
            if (values.length!==0) {
                query += ' , '
            }
            query += ` ntel = $`+(values.length+1)
            values.push(ntel)
        }

        if (user===2) {
            //gestione update dati artigiano
        }

        query = query + ` WHERE uid = $`+(values.length+1)
        values.push(user.id)
        try {
            if (values.length<2) {
                res.status(400).json({})
                return
            }
            console.log(query);
            console.log(values);
            
            const result = await pool.query(query, values)
            res.status(200).json({})
        } catch (error) {
            console.log(error);
            res.status(500).json({})
        }
        
        


    })
    
    app.post("/checkout", async(req,res)=>{
        //verifica utente
        user = checkToken(req,res)
        if (user===-1) {
            return
        }
        if (user.role !== 1) {
            res.status(400).json({})
            return
        }
        
        try {
            await pool.query(`BEGIN`)

            //verifica quantità prodotti richiesti    
            const products = await pool.query(`SELECT * FROM carrello WHERE uid=$1`, [user.id])
            console.log(products.rows);
            var ord = {}
        
            if (products.rowCount===0) {
                res.status(401).json({})
            }
            for (const el of products.rows) {
                var qt = await pool.query(`SELECT amm FROM prodotti WHERE id=$1`, [el.productid])
                console.log("\nprodotto: "+el.productid);
                
                console.log("disponibile = "+qt.rows[0].amm);
                console.log("richiesta = "+el.quantita);
                
                if (qt.rows[0].amm<el.quantita) {
                    console.log("troppo pochi")
                    await pool.query(`ROLLBACK`)
                    res.status(409).json({error:"prodotti non sufficienti"})
                    return
                }else{
                    //riduci quantità
                    await pool.query(`UPDATE prodotti SET amm=$1 WHERE id=$2`, [(qt.rows[0].amm-el.quantita), el.productid])
                    console.log(`qtità corretta \n ${qt.rows[0].amm-el.quantita} rimanente`);
                    ord[el.productid]= el.quantita
                }
            }
            
            console.log("prodotti verificati e bloccati");
            console.log(ord);
            //aggiungi ordine
            const exp = new Date(Date.now()+15*60*1000)
            await pool.query(`INSERT INTO ordini(uid, products, created, expires_at) VALUES ($1,$2,NOW(), $3)`, [user.id, ord, exp])
            await pool.query(`DELETE FROM carrello WHERE uid=$1`, [user.id])
            //invia pagina
            res.status(200).json({})
            await pool.query(`COMMIT`)
        } catch (error) {
            await pool.query(`ROLLBACK`)
            console.log(error);
            
            res.status(500).json({})
        }
        

    })
    app.get("/checkout", (req,res)=>{
        res.sendFile(path.join(__dirname,"Frontend","/checkout/checkout.html"))
    })

//FUNZIONI DI TEST TEMPORANEE
    app.get("/userArea", (req,res)=>{
        res.sendFile(path.join(__dirname,"Frontend/userArea/userArea.html"))
    })
    app.get("/test",(req,res)=>{
        res.sendFile(path.join(__dirname,"prova.html"))
    })
    app.post("/test",async(req,res)=>{
        
        
    })
    
    app.post("/ESEMPIOPROTECTED",(req,res)=>{
        //verifica presenza di token nel res
        if (!token) {
            return res.status(401).json({ message: 'Token mancante' });
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