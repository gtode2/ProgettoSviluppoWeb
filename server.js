const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require('path');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
require('dotenv').config({path: './.env' });
const fs = require('fs');
const https = require('https');


const { checkdb } = require("./Backend/dbmanager.js");
const {checkToken, renewToken, registerToken} = require("./Backend/userToken.js")
const {addProduct, removeProduct, getProducts, addCart, removeCart, decrCart, getCart, emptyCart} = require("./Backend/products.js");
const {addReport, getReports, removeReport, removeReportedProduct, banArtigiano} = require("./Backend/reports.js");





async function main() {
    
    const app = express();
    const port = 3000;


    const options = {
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./cert.pem')
    }


    app.use(express.static(path.join(__dirname, "Frontend")));
    app.use(express.static(__dirname));


    app.use(cookieParser());
    app.use(cors({
        origin:'https://localhost:3005',
        credentials:true
    }));
    app.use((req, res, next) => {
        if (req.originalUrl === '/stripe/webhook') {
        next(); // salta express.json() per questa rotta
      } else {
        express.json()(req, res, next);
      }
    });
    const pool = await initDb()

    // Connessione PostgreSQL
    async function initDb() {
        var cdb = await checkdb()
        if (cdb===0) {
            console.log("Creazione pool");

            const pool = new Pool({
            user: process.env.DB_USER,
            host: "postgres",
            database: process.env.DB_NAME,
            password: process.env.DB_PW,
            port: process.env.DB_PORT,
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

        //DEVE VERIFICARE ANCHE PRESENZA DI PRODOTTI BANNATI NEL CARRELLO
        //RIMUOVERE REPORT SU PRODOTTI / UTENTI BANNATI

        try {
            await pool.query("BEGIN")
            const pending = await pool.query("SELECT id, expires_at, products FROM ordini WHERE expires_at<NOW()")            
            for(const el of pending.rows){
                //rimuovo da db
                await pool.query("DELETE FROM ordini WHERE id=$1",[el.uid])
                console.log("ordine rimosso");
                //aggiungo elementi a prodotti
                const prodotti = el.products
                for (const [id, prod] of Object.entries(prodotti)) {   
                    console.log(prod);
                                    
                    await pool.query(`UPDATE prodotti set amm=amm+$1 WHERE id=$2`,[prod.quantita, id])
                    console.log("reinseriti prodotti "+id);  
                }
            }
            await pool.query("COMMIT")
        } catch (error) {
            await pool.query("ROLLBACK")
            console.log(error);
        }
    });

    const stripe = require('stripe')(process.env.STRIPE_SECRET);
    const endpointSecret = "whsec_7a1e711d036e2611d7c4a3c44f46781dce517ce0364509d60986104464e6e4b6"; 


    /////////////////////////////////////////////////////////////////////////
    //HOMEPAGE
    app.get("/",async (req,res)=>{
        console.log("richiesta homepage");
        console.log(req.headers);
        try {
            const token = req.cookies.accessToken;
            if (!token) {
                if (!req.cookies.refreshToken) {
                    console.log("no token");
                    res.sendFile(path.join(__dirname,"Frontend/unlogged","unlogged.html"))                
                }else{
                    res.redirect("/renewToken?from=/")
                }
                
            }else{
                console.log(token);
            
                const user = checkToken(req,res,false)
                if (user!==-1) {
                    switch (user.usertype) {
                        case 1:
                            res.sendFile(path.join(__dirname,"Frontend","clienti/clienti.html"))
                            break;
                        case 2:
                            const response = await pool.query(`SELECT * FROM attivita WHERE actid=$1`, [user.uid])
                            if (response.rows.length===0) {
                                res.sendFile(path.join(__dirname,"Frontend", "registrazione/regact.html"))
                            }else{
                                res.sendFile(path.join(__dirname,"Frontend","artigiano/artigiano.html"))
                            }
                            break;
                        case 0:
                            res.sendFile(path.join(__dirname,"Frontend","admin/admin.html"))
                            break;
                        default:
                            res.sendFile(path.join(__dirname,"Frontend","unlogged/unlogged.html"))
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

        try {
            // Controlla se l'email è già registrata
            const checkQuery = "SELECT uid FROM utenti WHERE email = $1";
            const existing = await pool.query(checkQuery, [email]);

            if (existing.rows.length > 0) {
                return res.status(409).json({err:"Email già registrata."});
            }

            // Hash della password
            const hashedPassword = await bcrypt.hash(password, 10);

            const query = `
                INSERT INTO utenti (nome, cognome, username, email, ntel, password, usertype)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `;
            const type=()=>{
                if (user_type==="artigiano") {
                    return 2
                }else{
                    return 1
                }
            }
            const values = [name, surname, username, email, phone, hashedPassword, type()];     
            const user = await pool.query(query, values);

            console.log("user in database");
            
            
            const tokens = await registerToken(user, pool)
            if (user_type==="artigiano") {
                res.status(200)
                .cookie('accessToken', tokens["access"],{
                    httpOnly:true,
                    secure:true,
                    sameSite:'Strict',
                    maxAge: 50 * 60 * 1000 //50 minuti
                })
                .cookie('refreshToken', tokens["refresh"],{
                    httpOnly:true,
                    secure:true,
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
                    secure:true,
                    sameSite:'Strict',
                    maxAge: 50 * 60 * 1000 //50 minuti
                })
                .cookie('refreshToken', tokens["refresh"],{
                    httpOnly:true,
                    secure:true,
                    sameSite:'Strict',
                    maxAge:7 * 24 * 60 * 60 * 1000 //7 giorni
                }).json({})
            }
        } catch (err) {
            console.error("Errore durante la registrazione:", err);
            res.status(500).json({err:"Errore interno al server"});
        }
    });
    app.get("/RegAct",async(req,res)=>{
        res.sendFile(path.join(__dirname,"Frontend", "registrazione/regact.html"))
    })
    app.post("/RegAct",async(req,res)=>{
        const user =checkToken(req,res) 
        if (user===-1) {
            console.log("utente non valido");
            return
        }
        //verifico che utente non abbia attività
        var query = `
            SELECT * FROM ATTIVITA
            WHERE actid = $1`
        
        var result = await pool.query(query,[user.uid])
        if (result.rows.length>0) {
            res.status(409).json({err:"utente ha già attività"})
            return
        }
        //aggiungo a DB
        query = `
            INSERT INTO attivita(actid, nome, indirizzo, email, ntel, descr)
            VALUES ($1,$2,$3,$4,$5,$6)
        `
        const {name, email, phone, address, desc} = req.body
        const values = [user.uid, name, address, email, phone, desc]
        try {
            result = await pool.query(query,values)
            console.log("Aggiunta attività completata");
            res.status(200).json({})
        } catch (err) {
            console.log(err);
            res.status(500).json({})  
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
        const hashedpw = await bcrypt.hash(pw,10);
        const user = await pool.query("SELECT * FROM utenti WHERE username = $1",[cred])
        //console.log(hashedpw)
        
        
        if (user.rows.length>0) {
            
            const isCorrect = await bcrypt.compare(pw, user.rows[0].password)
            if (!isCorrect) {
                    res.status(401).json({err:"Credenziali non valide"})
                    console.log("password errata");
                    return
            }

            if (user.rows[0].banned===true) {
                res.status(403)
                .clearCookie('accessToken', {
                    httpOnly: true,
                    secure: true,      
                    sameSite: 'Strict', 
                })
                .clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: true, 
                    sameSite: 'Strict', 
                }).json({err:"banned"})
                return
            }
            const tokens = await registerToken(user, pool)
            console.log(tokens);
            
            res.status(200)
                .cookie('accessToken', tokens["access"],{
                    httpOnly:true,
                    secure:true, 
                    sameSite:'Strict',
                    maxAge: 50 * 60 * 1000 //50 minuti
                })
                .cookie('refreshToken', tokens["refresh"],{
                    httpOnly:true,
                    secure:true,
                    sameSite:'Strict',
                    maxAge:7 * 24 * 60 * 60 * 1000 //7 giorni
                }).json({usertype:user.usertype})
            
        }else{
            res.status(401).json({err:"Credenziali non valide"})
            console.log("no rows");
            
        } 

        

    })


    app.get("/renewToken", (req,res)=>{
        res.sendFile(path.join(__dirname,"Frontend","renewToken/renewToken.html"))
    })
    app.post("/renewToken", async (req,res)=>{
        const token = await renewToken(req, res, pool)
        if (token!==-1) {
            console.log("token generato correttamente");
            
            res.status(200)
            .cookie('accessToken', token,{
                httpOnly:true,
                secure:true, 
                sameSite:'Strict',
                maxAge: 50 * 60 * 1000 //50 minuti
            })
            .json({})
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
            secure: true,      
            sameSite: 'Strict', 
        })
        .clearCookie('refreshToken', {
            httpOnly: true,
            secure: true, 
            sameSite: 'Strict', 
        }).json({});
        
        
    });


    app.post("/addProduct", async(req,res)=>{
        console.log("add product avviata");
        const user = checkToken(req,res)
        if (user===-1) {
            return
        }
        if (user.usertype!=2) {
            console.log("tipo utente errato");
            res.status(401).json({})
        }else{
            console.log(req.body);
            
            const result = await addProduct(req, user.uid,pool)
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
            if (user!==-1 && user.usertype===2) {
                if (!filters) {
                    var filters = {}
                }
                filters.produttore = user.uid
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
                console.log(user.usertype);
                
                if (user!==-1) {
                    res.status(200).json({prodotti:result, usertype:user.usertype})
                }else{
                    res.status(200).json({prodotti:result, usertype:3})
                }
            }
        }else{
            console.log("richiesta prodotto specifico");
            //richiesta prodotto specifico
            var result  = await getProducts(pool, null, id)
            if (user!==-1) {
               res.status(200).json({prodotti:result, usertype:user.usertype})
            }else{
                res.status(200).json({prodotti:result, usertype:3})
            }
        
        }
    })

    app.post("/editProducts", async (req,res) => {
        console.log("AAAA");
        
        const {id, nome, descr, costo, qt, cat} = req.body
        if (!id) {
            res.status(400).json({err:"no id"})
            console.log("no id prodotto");
            
            return
        }
        const user = checkToken(req,res)
        if (user===-1) {
            return
        }
        try {
            const result = await pool.query(`SELECT * FROM prodotti WHERE id=$1 AND actid=$2`,[id, user.uid])
            if (result.rows.length===0) {
                console.log("no prod");
                res.status(401).json({err:"no product"})
                return
            }
            console.log("prodotto trovato");
            if (nome) {
                await pool.query(`UPDATE prodotti SET name=$1 WHERE id=$2`,[nome, id])
                console.log("nome modificato");
            }
            if (descr) {
                await pool.query(`UPDATE prodotti SET descr=$1 WHERE id=$2`,[descr, id])
                console.log("descr modificata");
            }
            if (costo) {
                await pool.query(`UPDATE prodotti SET costo=$1 WHERE id=$2`,[costo, id])
                console.log("costo mod");
                
            }
            if (qt) {
                await pool.query(`UPDATE prodotti SET amm=$1 WHERE id=$2`,[qt, id])
                console.log("qt mod");
                
            }
            if (cat) {
                await pool.query(`UPDATE prodotti SET cat=$1 WHERE id=$2`,[cat, id])
                console.log("cat mod");   
            }            
            res.status(200).json({})
        } catch (error) {
            console.log(error);
            res.status(500).json({})
            
        }
    })
     
    
    app.delete("/product", async(req,res)=>{
        console.log("eliminazione prodotto");
        const {pid} = req.body
        console.log("estratto product id ");
        
        if (!pid) {
            console.log("prodotto mancante");
            res.status(400).json({err:"no product"})
        }
        const user = checkToken(req,res)
        if(user===-1){
            return
        }
        const result = await removeProduct(pool, pid, user.uid)
        console.log("result = "+result);
        
        if (result === 0) {
            console.log("prodotto rimosso");
            res.status(200).json({})
        }else if (result===-1) {
            res.status(500).json({})
        }
        else if(result===-2){
            res.status(401).json({})
        }
        
        
    })


    app.post("/addCart", async (req,res) => {
        
        const {id, dec} = req.body
        if (!id) {
            console.log("missing product");    
            res.status(401).json({err:"missing product"})
            return
        }
        const user = checkToken(req,res)
        if (user=== -1) {
            if (user.usertype!==1) {
                res.status(401).json({err:"unauthorized"})
            }
            return
        }
        if (!dec) {
            //aggiungi o incrementa
            const status = await addCart(pool, id, user.uid)
            if (status===-1) {
                res.status(500).json({})
            } else if (status === 0) {
                res.status(200).json({res:"added"})
            } else if (status===-2){
                res.status(404).json({err:"product removed"})   
            }else {        
                res.status(200).json({res:status})
            }
        }else{
            //decrementa
            let status = null
            if (dec==="d") {
                status = await decrCart(pool, id, user.uid)
            }else if (dec==="r") {
                status = await removeCart(pool, id, user.uid)
            }else{
                res.status(400).json({})
                return
            }
            if (status===-1) {
                res.status(500).json({})
            } else if (status === 0) {
                res.status(200).json({res:"removed"})
            } else if (status===-2){
                res.status(404).json({err:"product removed"})   
            }else {        
                res.status(200).json({res:status})
            }
        }
        
        
    })


    app.post("/getCart", async (req,res) => {
        console.log("getCart");
        
        const user = checkToken(req,res)
        if (user!==-1) {
              if (user.usertype!==1) {
                res.status(401).json({})
                return
            }
            const response = await getCart(pool, user.uid)
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
              if (user.usertype!==1) {
                res.status(401).json({})
                return
            }
            const response = await emptyCart(pool, user.uid)
            if (response===0) {
                res.status(200).json({})
                console.log("AAA");
                
            }else{
                res.status(500).json({})                
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
        const response = await addReport(pool,user.uid, productid, dove, desc)
        console.log(response);
        if (response===0) {
            res.status(200).json({})
        }else if (response===-2) {
            res.status(404).json({})
        }else{
            res.status(500).json({})
        }
        
    })
    app.post("/getReports", async(req,res)=>{
        const user = checkToken(req,res)
        if (user!==-1) {
              if (user.usertype!==0) {
                res.status(401).json({})
                return
            }
            const response = await getReports(pool)
            if (response!==-1) {
                res.status(200).json({reports:response})
            }else{
                res.status(500).json({})
            }
        }
    })
    app.post("/closeReport", async (req,res) => {
        const user = checkToken(req,res)
        if (user===-1) {
            console.log("wrong token");
            return
        }
        if (user.usertype!==0) {
            console.log("wrong usertype");
            res.status(401).json({})
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
        if (user.usertype!==0) {
            console.log("wrong usertype");
            res.status(401).json({})
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
                console.log("artigiano rimosso correttamente");
            }else{
                res.status(500).json({})
            }
            //ban artigiano
        }
        
    })


    app.post("/artigiani", async(req,res)=>{
        console.log("richiesta artigiani");
        
        user = checkToken(req,res,false)
        if (user!==-1 && user.usertype===2) {
            res.status(200).send({art:0})
            console.log("utente artigiano");
            return
        }
        try {
            response = await pool.query("SELECT actid, attivita.nome FROM attivita JOIN utenti ON actid = uid WHERE banned=FALSE")
            res.status(200).json({art:response.rows})
            console.log(response.rows);
            
        } catch (error) {
            console.log(error);
            res.status(500).json({})
        }
    })


    app.get("/userArea", async (req,res)=>{
        const user = checkToken(req,res, false)
        
        if (user===-1) {
            return
        }
        if (user.usertype === 2) {
            const response = await pool.query(`SELECT * FROM attivita WHERE actid=$1`, [user.uid])
            if (response.rows.length===0) {
                console.log("no activity");
                res.sendFile(path.join(__dirname,"Frontend", "/registrazione/regact.html"))
                return
            }
        }
        res.sendFile(path.join(__dirname,"Frontend/userArea/userArea.html"))
        
    })
    app.post("/userArea", async(req,res)=>{        
        const user = checkToken(req,res)
        if (user.usertype===2) {
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
                console.log("ID = "+user.uid);
                
                const response = await pool.query(`SELECT nome, cognome, username, email, ntel FROM utenti WHERE uid = $1`, [user.uid])
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
        values.push(user.uid)
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
        if (user.usertype !== 1) {
            res.status(400).json({})
            return
        }
        
        try {
            await pool.query(`BEGIN`)

            //verifica quantità prodotti richiesti    
            const products = await pool.query(`SELECT * FROM carrello JOIN prodotti ON productid = id WHERE uid=$1 AND banned=FALSE`, [user.uid])
            console.log(products.rows);
            var ord = {}
        
            if (products.rowCount===0) {
                res.status(401).json({})
            }
            //per ogni prodotto
            for (const el of products.rows) {
                var qt = await pool.query(`SELECT amm, costo, name FROM prodotti WHERE id=$1`, [el.productid])
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
                    const prodData = {}
                    prodData["prezzo"] = qt.rows[0].costo
                    prodData["quantita"] = el.quantita
                    prodData["nome"] = qt.rows[0].name
                    if (!ord[el.actid]) {
                        ord[el.actid] = {};
                    }
                    ord[el.actid][el.productid]= prodData
                }
                console.log(ord);
                
            }
            
            console.log("prodotti verificati e bloccati");
            console.log(ord);
            //aggiungi ordine
            const exp = new Date(Date.now()+15*60*1000)
            await pool.query(`INSERT INTO ordini(uid, products, created, expires_at) VALUES ($1,$2,NOW(), $3)`, [user.uid, ord, exp])
            await pool.query(`DELETE FROM carrello WHERE uid=$1`, [user.uid])
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
    //restituire errore nel caso di prodotti banned
    app.post("/confirmCheckout", async (req,res)=>{
        //verifica id utente
        const user = checkToken(req,res)
        if (user===-1) {
            console.log("errore");
            
            return
        }
        //prendo informazioni ordine
        var elementi = await pool.query(`SELECT * FROM ordini WHERE uid=$1 AND expires_at IS NOT NULL`, [user.uid])
        //eseguire verifica e rimozione di elementi bannati
        //creo array con elementi
        var li = []
        if (elementi.rows.length===0) {
            res.status(401).json({err:"no order"})
            return
        }
        elementi = elementi.rows[0]
        console.log(elementi);
        try {
            await pool.query(`BEGIN`)
            for(const [id, prodBlock] of Object.entries(elementi.products)){
                //gestione prodotti produttore id
                //creo entry in db per ogni produttore
                console.log("id produttore = "+id);
                
                let aprod = {}
                for(const[prodId, prod] of Object.entries(prodBlock)){
                    //gestione prodotto specifico
                    var p = {}
                    var pricedata = {}
                    pricedata.currency = "eur"
                    pricedata.product_data = {name:prod.nome}
                    pricedata.unit_amount = Math.round(prod.prezzo * 100)
                    p.price_data = pricedata
                    p.quantity = prod.quantita
                    li.push(p)
                    aprod[prodId] = prod
                }
                await pool.query(`INSERT INTO ordini(uid, products, sent, created, expires_at, actid) values($1,$2,$3,$4,$5,$6)`,[user.uid, aprod, false, elementi.created, elementi.expires_at, id])
                console.log("aprod = "+JSON.stringify(aprod));    
            }
            await pool.query(`DELETE FROM ordini WHERE uid=$1 AND expires_at IS NOT NULL AND actid IS NULL`, [user.uid])            
            await pool.query(`COMMIT`)
            console.log("completato");
            
        } catch (error) {
            await pool.query(`ROLLBACK`)
            console.log(error);
            
        }

        console.log("AAAAA");
        
        console.log(JSON.stringify(li));
        

        try {   
            const session = await stripe.checkout.sessions.create({
                payment_method_types:['card'],
                mode:'payment',
                line_items:li,
                success_url:`https://localhost:3000/success`,
                cancel_url:`https://localhost:3000/cancelTransaction`,
                metadata:{
                    userId:user.uid.toString()
                }
            })
            console.log(session.id);
            
            res.json({id:session.id})
        } catch (error) {
            console.log(error);
            
        }
    })
    

    app.post("/stripe/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
        const sig = req.headers["stripe-signature"];
        let event;

        console.log("req.body = "+req.body);
        
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            console.log("impossibile verificare Webhook signature");
            console.log(err.message)
            
            return res.status(400).json({});
        }

        if (event.type === "checkout.session.completed") {
            try {
                const session = event.data.object;
                const userId = session.metadata.userId;
                await pool.query("UPDATE ordini SET expires_at=NULL WHERE uid = $1",[userId])
                console.log("Pagamento confermato per session ID:", session.id);
            } catch (error) {
                console.log(error);
                    
            }
        }

        res.status(200).end();
    });

    app.get("/success",(req,res)=>{
        res.sendFile(path.join(__dirname,"/Frontend/checkout/success.html"))
    })
    app.get("/cancel",(req,res)=>{
        res.sendFile(path.join(__dirname,"/Frontend/checkout/cancel.html"))
    })



    app.get("/changePassword", async(req,res)=>{
        res.sendFile(path.join(__dirname,"/Frontend/cambiopassword/password.html"))
    })
    app.post("/changePassword", async (req,res) => {
        const {vecchia, nuova} = req.body
        if (!vecchia || !nuova) {
            res.status(400).json({err:"missing data"})
            return
        }
        const user = checkToken(req,res)
        if (user===-1) {
            return
        }

        //verifica password vecchia
        try {
            const pw = await pool.query(`SELECT password FROM utenti WHERE uid=$1`, [user.uid])
            const isCorrect = await bcrypt.compare(vecchia, pw.rows[0].password)
            if (!isCorrect) {
                res.status(401).json({err:"wrong password"})
                return
            }
            //carica password nuova
            const hashedPassword = await bcrypt.hash(nuova, 10);
            await pool.query(`UPDATE utenti SET password=$1 WHERE uid=$2`, [hashedPassword, user.uid])
            res.status(200).json({})
        } catch (error) {
            console.log(error);
            res.status(500).json({})                
        }
        
    })

    app.post("/getOrders", async (req,res) => {
        const user = checkToken(req,res)
        if (user===-1) {
            return
        }
        if (user.usertype===1) {
            try {
                const ord = await pool.query('SELECT * FROM ordini WHERE uid =$1 AND expires_at IS NULL ORDER BY created DESC', [user.uid])
                console.log(ord.rows);
                
                res.status(200).json({ord:ord.rows})
            } catch (error) {
                console.log(error);
                res.status(500).json()
            }
        }else if(user.usertype===2){
            //gestione artigiano
        }else{
            res.status(401).json({})
        }
    })

    app.get("/ban", (req,res)=>{
        res.sendFile(path.join(__dirname,"Frontend/login/accountbannato/ban.html"))
    })

//FUNZIONI DI TEST TEMPORANEE
    
    app.get("/test",(req,res)=>{
        res.sendFile(path.join(__dirname,"/prova.html"))
    })




    //HTTP SOLO PER TESTARE STRIPE CON CERTIFICATO SELF-SIGNED
    app.listen(3001, () => {
        console.log(`Server attivo su http://localhost:${port}`);
    });
    https.createServer(options, app).listen(port, () => {
        console.log(`Server attivo su https://localhost:${port}`);
    });

    
    
    

}

main().catch((err) => {
    console.error("Errore durante l'inizializzazione del server:", err);
    process.exit(1);
  });