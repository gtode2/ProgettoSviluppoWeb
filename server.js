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


const {checkToken, renewToken, registerToken} = require("./Backend/userToken.js")
const {addProduct, removeProduct, getProducts, editProduct, addCart, removeCart, decrCart, getCart, emptyCart} = require("./Backend/products.js");
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
        origin:'https://localhost:3000',
        credentials:true
    }));
    app.use((req, res, next) => {
        if (req.originalUrl === '/stripe/webhook') {
        next(); // salta express.json() per questa rotta
      } else {
        express.json()(req, res, next);
      }
    });

    const pool = new Pool({
        user: process.env.DB_USER,
        host: "postgres",
        database: process.env.DB_NAME,
        password: process.env.DB_PW,
        port: process.env.DB_PORT,
    });


    cron.schedule('* * * * *', async() => {
        //rimozione token scaduti
        try {
            let pending = await pool.query(`SELECT * FROM reftok WHERE exp<NOW()`)            
            if (pending.rowCount!==0) {
                for(let el of pending.rows){
                    await pool.query(`DELETE FROM reftok WHERE id=$1`,[el.id])
                }
                                        
            }
        } catch (error) {
            console.log(error);
            
        }

        //rimozione prodotti bannati da carrelli
        try {
            await pool.query(`DELETE FROM carrello USING prodotti WHERE carrello.productid = prodotti.id AND prodotti.banned = true;`)
        } catch (error) {
            console.log(error);
        }
        //rimozione report prodotti / utenti bannati
        try {
            await pool.query(`UPDATE report SET solved = true FROM prodotti WHERE report.prodid = prodotti.id AND prodotti.banned = true`)
        } catch (error) {
            console.log(error);
            
        }

        //rimozione prodotti pending scaduti
        try {
<<<<<<< HEAD
            
=======
>>>>>>> 25ef689a4aac95ef516620779d3f68ce66142a5c
            await pool.query("BEGIN")
            let pending = await pool.query("SELECT id, expires_at, products FROM ordini WHERE expires_at<NOW()")            
            for(let el of pending.rows){
                //rimuovo da db
                await pool.query("DELETE FROM ordini WHERE id=$1",[el.id])
                //aggiungo elementi a prodotti
                const prodotti = el.products                
                for (const [actid, prod] of Object.entries(prodotti)) {   
                    for (const [prodid, prodotto] of Object.entries(prodotti)) {   
                        await pool.query(`UPDATE prodotti SET amm = amm + $1 WHERE id = $2`, [prodotto.quantita, prodid]);
                    }
                    await pool.query("COMMIT");                
                }
            }
        } catch (error) {
            await pool.query("ROLLBACK")
            console.log(error);
        }
    });

    const stripe = require('stripe')(process.env.STRIPE_SECRET);
    const endpointSecret = process.env.STRIPE_WSS; 

    app.get("/",async (req,res)=>{        
        try {
            const token = req.cookies.accessToken;
            if (!token) {
                if (!req.cookies.refreshToken) {
                    res.sendFile(path.join(__dirname,"Frontend/unlogged","unlogged.html"))                
                }else{
                    res.redirect("/renewToken?from=/")
                }
                
            }else{            
                const user = checkToken(req,res,false)
                if (user!==-1) {
                    switch (user.usertype) {
                        case 1:
                            res.sendFile(path.join(__dirname,"Frontend","clienti/clienti.html"))
                            break;
                        case 2:
                            const response = await pool.query(`SELECT * FROM attivita WHERE actid=$1`, [user.uid])
                            if (response.rows.length===0) {
                                res.redirect("/regact")
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
    

    app.get("/registrazione",(req,res)=>{
        res.sendFile(path.join(__dirname,"Frontend","registrazione/registrazione.html"))
    })
    app.post("/registrazione", async (req, res) => {
        const { name, surname, username, email, phone, password, user_type } = req.body;
        if (!name || !surname || !username || !email || !phone || !password || !user_type) {
            res.status(400).json({err:"missing info"})
            return
        }
        try {
            const checkQuery = "SELECT uid FROM utenti WHERE email = $1";
            let existing = await pool.query(checkQuery, [email]);

            if (existing.rows.length > 0) {
                res.status(409).json({err:"mail"});
                return
            }
            existing = await pool.query(`SELECT uid FROM utenti WHERE username=$1`, [username])
            if (existing.rows.length>0) {
                res.status(409).json({err:"username"})
                return
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
            
            const tokens = await registerToken(user, pool)
            if (user_type==="artigiano") {
                res.status(200)
                .cookie('accessToken', tokens["access"],{
                    httpOnly:true,
                    secure:true,
                    sameSite:'Strict',
                    maxAge: 30 * 60 * 1000 //50 minuti
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
                    maxAge: 30 * 60 * 1000 //30 minuti
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
        const user = checkToken(req,res,false)
        if (user===-1) {
            res.redirect("/")
        }
        if (user.usertype!==2) {
            res.redirect("/")
        }else{
            const result = await pool.query("SELECT * FROM attivita WHERE actid = $1", [user.uid])
            if (result.rowCount!==0) {
                res.redirect("/")
            }else{
                res.sendFile(path.join(__dirname,"Frontend", "registrazione/regact.html"))
            }        
        }
    })
    app.post("/RegAct",async(req,res)=>{
        const user =checkToken(req,res) 
        if (user===-1) {
            return
        }
        //verifico che utente non abbia attività
        var query = `
            SELECT * FROM ATTIVITA
            WHERE actid = $1`
        
        var result = await pool.query(query,[user.uid])
        if (result.rows.length>0) {
            res.status(409).json({err:"ex"})
            return
        }
        //aggiungo a DB
        query = `
            INSERT INTO attivita(actid, nome, indirizzo, email, ntel, descr)
            VALUES ($1,$2,$3,$4,$5,$6)
        `
        const {name, email, phone, address, desc} = req.body
        if (!name || !email || !phone || !address || !desc) {
            res.status(400).json({err:"missing info"})
            return
        }
        const values = [user.uid, name, address, email, phone, desc]
        try {
            result = await pool.query(query,values)
            res.status(200).json({})
        } catch (err) {
            console.log(err);
            res.status(500).json({})  
        }
    })

    app.get("/login",(req,res)=>{
        res.sendFile(path.join(__dirname,"Frontend","login/login.html"))
    })
    app.post("/login", async(req,res)=>{  
        const {cred, pw} = req.body
        const hashedpw = await bcrypt.hash(pw,10);        
        const user = await pool.query("SELECT * FROM utenti WHERE username = $1",[cred])

        
        
        if (user.rows.length>0) {
            
            const isCorrect = await bcrypt.compare(pw, user.rows[0].password)
            if (!isCorrect) {
                    res.status(401).json({err:"wrong info"})
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
            res.status(401).json({err:"wrong info"})            
        } 

        

    })


    app.get("/renewToken", (req,res)=>{
        res.sendFile(path.join(__dirname,"Frontend","renewToken/renewToken.html"))
    })
    app.post("/renewToken", async (req,res)=>{
        const token = await renewToken(req, res, pool)
        if (token!==-1) {            
            res.status(200)
            .cookie('accessToken', token,{
                httpOnly:true,
                secure:true, 
                sameSite:'Strict',
                maxAge: 50 * 60 * 1000 //50 minuti
            })
            .json({})
        }else{
            res.status(401)
            .clearCookie('refreshToken', {
                httpOnly:true,
                secure:true,
                sameSite:`Strict`
            }).json({err:"rem"})
        }
    })
    app.delete('/logout', async (req, res) => {
        const token = req.cookies.refreshToken
        try {
            await pool.query(`DELETE FROM reftok WHERE token=$1`,[token])
            
        } catch (error) {
            console.log(error);
            
        }
        
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
        const user = checkToken(req,res)
        if (user===-1) {
            return
        }
        let result =  await pool.query(`SELECT * FROM utenti WHERE uid=$1 AND banned=FALSE`, [user.uid])
        if (result.rowCount===0) {
            res.status(401).json({err:"banned"})
        }
        if (user.usertype!=2) {
            res.status(401).json({err:"usertype"})
        }else{            
            result = await addProduct(req, user.uid,pool)
            if (result===0) {
                res.status(200).json({})
            }else{
                res.status(500).json({})
            }
        }
    })


    app.post("/product", async(req,res)=>{     
        var {filters} = req.body  
        user = await checkToken(req,res,false)
        const {id} = req.body


        if (!id) {
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
                res.status(200).json({prodotti:0})
            }else{                
                if (user!==-1) {
                    res.status(200).json({prodotti:result, usertype:user.usertype})
                }else{
                    res.status(200).json({prodotti:result, usertype:3})
                }
            }
        }else{
            var result  = await getProducts(pool, null, id)
            if (user!==-1) {
               res.status(200).json({prodotti:result, usertype:user.usertype})
            }else{
                res.status(200).json({prodotti:result, usertype:3})
            }
        
        }
    })

    app.patch("/product", async (req,res) => { 
        const {id} = req.body
        if (!id) {
            res.status(400).json({err:"missing id"})            
            return
        }
        const user = checkToken(req,res)
        if (user===-1) {
            return
        }
        try {
            let result = await pool.query(`SELECT * FROM prodotti WHERE id=$1 AND actid=$2`,[id, user.uid])
            if (result.rows.length===0) {
                res.status(401).json({err:"missing product"})
                return
            }
            result = await editProduct(pool,id,req)
            
            if (result===0) {
                res.status(200).json({})    
            }else{
                res.status(500).json({})
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({})
            
        }
    })
     
    
    app.delete("/product", async(req,res)=>{
        const {pid} = req.body
        if (!pid) {
            res.status(400).json({err:"no product"})
        }
        const user = checkToken(req,res)
        if(user===-1){
            return
        }
        const result = await removeProduct(pool, pid, user.uid)
        
        if (result === 0) {
            res.status(200).json({})
        }else if (result===-1) {
            res.status(500).json({})
        }
        else if(result===-2){
            res.status(401).json({})
        }
        
        
    })


    app.post("/cart", async (req,res) => {
        
        const {id, dec} = req.body
        
        if (!id) {
            res.status(400).json({err:"missing product"})
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
            }else if (status===-3) {
                res.status(409).json({err:"0"})
            }else if (status===-4) {
                res.status(409).json({err:"max"})
            }else{        
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
                res.status(400).json({err:"invalid dec"})
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


    app.get("/cart", async (req,res) => {       
        const user = checkToken(req,res, false)
        if (user===-1) {
            res.redirect("/renewtoken?from=/cart")
        }else{
            if (user.usertype!==1) {
                res.status(401).json({err:"usertype"})
                return
            }
            const response = await getCart(pool, user.uid)
            if (response!==-1) {
                res.status(200).json({carrello:response})
            }else{
                res.status(500).json({})                
            }
        }
    })
    
    app.delete("/cart", async (req,res) => {
        const user = checkToken(req,res)
        if (user!==-1) {
              if (user.usertype!==1) {
                res.status(401).json({err:"usertype"})
                return
            }
            const response = await emptyCart(pool, user.uid)
            if (response===0) {
                res.status(200).json({})                
            }else{
                res.status(500).json({})                
            }
        }
    })
    

    app.post("/report", async(req,res)=>{        
        user = await checkToken(req,res)
        if (user===-1) {
            return
        }
        const {productid, dove, desc} = req.body
        if (!productid && !dove && !desc) {
            res.status(400).json({err:"missing info"})
            return
        }
        const response = await addReport(pool,user.uid, productid, dove, desc)
        if (response===0) {
            res.status(200).json({})
        }else{
            res.status(500).json({})
        }
        
    })
    app.get("/report", async(req,res)=>{
        const user = checkToken(req,res, false)
        if (user===-1) {
            res.redirect("/renewtoken?from=/report")
        }
        else{
            if (user.usertype!==0) {
                res.status(401).json({err:"usertype"})
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
    app.patch("/report", async (req,res) => {
        const user = checkToken(req,res)
        if (user===-1) {
            return
        }
        if (user.usertype!==0) {
            res.status(401).json({err:"usertype"})
            return
        }
        const {id}=req.body
        if (!id) {
            res.status(400).json({err:"missing id"})
            return
        }

        const result = await removeReport(pool, id)    
        if (result===0) {
            res.status(200).json({})
            
        }else{
            res.status(500).json({})
        }
    })


    app.post("/ban", async (req,res) => {
        const user = checkToken(req,res)
        if (user===-1) {
            return
        }
        if (user.usertype!==0) {
            res.status(401).json({err:"usertype"})
            return
        }
        const {id, type}=req.body
        if (!id && !type) {
            res.status(400).json({err:"missing info"})
            return
        }

        if (type===0) {    
            const result = await removeReportedProduct(pool,id)    
            if (result===0) {
                res.status(200).json({})
            }else{
                res.status(500).json({})
            }
        }else{
            const result = await banArtigiano(pool,id)    
            if (result===0) {
                res.status(200).json({})
            }else{
                res.status(500).json({})
            }
        }
        
    })


    app.post("/artigiani", async(req,res)=>{
        
        user = checkToken(req,res,false)
        if (user!==-1 && user.usertype===2) {
            res.status(200).send({art:0})
            return
        }
        try {
            response = await pool.query("SELECT actid, attivita.nome FROM attivita JOIN utenti ON actid = uid WHERE banned=FALSE")
            res.status(200).json({art:response.rows})            
        } catch (error) {
            console.log(error);
            res.status(500).json({})
        }
    })


    app.get("/userArea", async (req,res)=>{
        const user = checkToken(req,res, false)
        
        if (user===-1) {
            res.redirect("/renewtoken?from=/userarea")
        }
        if (user.usertype === 2) {
            const response = await pool.query(`SELECT * FROM attivita WHERE actid=$1`, [user.uid])
            if (response.rows.length===0) {
                res.redirect("/regact")
                return
            }else{
                res.sendFile(path.join(__dirname,"Frontend/userArea/userAreaArtigiano.html"))
                return
            }
        }
        res.sendFile(path.join(__dirname,"Frontend/userArea/userArea.html"))
        
    })
    app.post("/user", async(req,res)=>{        
        const user = checkToken(req,res)
        const {act} = req.body
        if (user.usertype===2 && act) {
            try {
                const response = await pool.query(`SELECT * FROM attivita WHERE actid = $1`, [user.uid])
                res.status(200).json({act:response.rows[0]})
            } catch (error) {
                console.log(error);
                res.status(500).json({})
            }
        }else{
            try {                                
                const response = await pool.query(`SELECT nome, cognome, username, email, ntel FROM utenti WHERE uid = $1`, [user.uid])
                res.status(200).json({user:response.rows[0], ut:user.usertype})                
            } catch (error) {
                console.log(error);
                res.status(500).json({})
            }
        }
        
    })
    app.get("/editAct", async (req,res) => {
        const user = checkToken(req,res, false)
        if (user===-1 || user.usertype!==2) {
            res.redirect("/userArea")
        }
        res.sendFile(path.join(__dirname,"Frontend/artigiano/modificaAttivita/modificaatt.html"))
    })

    app.patch("/act", async (req,res) => {
        const {nome, email, ntel, descr} = req.body
        const user = checkToken(req,res)
        if (user===-1) {
            return
        }
        var query = `UPDATE attivita  SET `
        var values = []

        if(nome){
            query += ` nome = $`+(values.length+1)
            values.push(nome)
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
        if (descr) {
            if (values.length!==0) {
                query += ' , '
            }
            query += ` descr = $`+(values.length+1)
            values.push(descr)
        }
        
        query = query + ` WHERE actid = $`+(values.length+1)
        values.push(user.uid)
        try {
            if (values.length<2) {
                res.status(400).json({err:"no value"})
                return
            }    
            await pool.query(query, values)
            res.status(200).json({})
        } catch (error) {
            console.log(error);
            res.status(500).json({})
        }
        
    })

    app.post("/updateUser", async (req,res) => {
        const {nome, cognome, username, email, ntel} = req.body
        const user = checkToken(req,res)
        if (user===-1) {
            return
        }
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

        query = query + ` WHERE uid = $`+(values.length+1)
        values.push(user.uid)
        try {
            if (values.length<2) {
                res.status(400).json({err:"empty"})
                return
            }
            
            const result = await pool.query(query, values)
            res.status(200).json({})
        } catch (error) {
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
            res.status(401).json({err:"unauthorized"})
            return
        }
        
        try {
            await pool.query(`BEGIN`)

            //verifica quantità prodotti richiesti    
            const products = await pool.query(`SELECT * FROM carrello JOIN prodotti ON productid = id WHERE uid=$1 AND banned=FALSE`, [user.uid])
            var ord = {}
            if (products.rowCount===0) {
                res.status(404).json({err:"empty"})
            }
            //per ogni prodotto
            for (const el of products.rows) {
                var qt = await pool.query(`SELECT amm, costo, name FROM prodotti WHERE id=$1`, [el.productid])      
                if (qt.rows[0].amm<el.quantita) {
                    await pool.query(`ROLLBACK`)
                    res.status(409).json({err:"not enough"})
                    return
                }else{
                    //riduci quantità
                    await pool.query(`UPDATE prodotti SET amm=$1 WHERE id=$2`, [(qt.rows[0].amm-el.quantita), el.productid])
                    const prodData = {}
                    prodData["prezzo"] = qt.rows[0].costo
                    prodData["quantita"] = el.quantita
                    prodData["nome"] = qt.rows[0].name
                    if (!ord[el.actid]) {
                        ord[el.actid] = {};
                    }
                    ord[el.actid][el.productid]= prodData
                } 
            }
            
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
        const user = checkToken(req,res,false)
        if (!user || user.usertype!==1) {
            res.redirect("/renewtoken?from=/checkout")
        }
        res.sendFile(path.join(__dirname,"Frontend","/checkout/checkout.html"))
    })
    app.post("/confirmCheckout", async (req,res)=>{
        const {addr} = req.body
        if (!addr) {
            res.status(400).json({err:"missing addr"})
        }
        const user = checkToken(req,res)
        if (user===-1) {            
            return
        }
        //prendo informazioni ordine
        var elementi = await pool.query(`SELECT * FROM ordini WHERE uid=$1 AND expires_at IS NOT NULL AND actid IS NULL`, [user.uid])
        //eseguire verifica e rimozione di elementi bannati
        //creo array con elementi
        var li = []
        if (elementi.rows.length===0) {
            res.status(401).json({err:"no order"})
            return
        }
        elementi = elementi.rows[0]
        try {
            await pool.query(`BEGIN`)
            for(const [id, prodBlock] of Object.entries(elementi.products)){
                //gestione prodotti produttore id
                //creo entry in db per ogni produttore             
                
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
                await pool.query(`INSERT INTO ordini(uid, products, sent, created, expires_at, actid, addr) values($1,$2,$3,$4,$5,$6,$7)`,[user.uid, aprod, false, elementi.created, elementi.expires_at, id, addr])
            }
            await pool.query(`DELETE FROM ordini WHERE uid=$1 AND expires_at IS NOT NULL AND actid IS NULL`, [user.uid])            
            await pool.query(`COMMIT`)            
        } catch (error) {
            await pool.query(`ROLLBACK`)
            res.status(500).json({})
            console.log(error);
            
        }
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
            
            res.status(200).json({id:session.id})
        } catch (error) {
            console.log(error);
            res.status(500).json({})
        }
    })

    app.post("/stripe/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
        const sig = req.headers["stripe-signature"];
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            console.log(err.message)
            
            return res.status(400).json({});
        }

        if (event.type === "checkout.session.completed") {
            try {
                const session = event.data.object;
                const userId = session.metadata.userId;
                await pool.query("UPDATE ordini SET expires_at=NULL WHERE uid = $1",[userId])
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
        const user = checkToken(req,res,false)
        if (user===-1) {
            res.redirect("/renewtoken?from=/changePassword")
        }
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



    app.post("/order", async (req,res) => {
        const user = checkToken(req,res)
        
        const {id} = req.body
        
        if (user===-1) {
            return
        }
        if (!id) {
            if (user.usertype===1) {
                try {
                    const ord = await pool.query('SELECT * FROM ordini WHERE uid =$1 AND expires_at IS NULL ORDER BY created DESC', [user.uid])
                    res.status(200).json({ord:ord.rows, ut:1})
                } catch (error) {
                    console.log(error);
                    res.status(500).json()
                }
            }else if(user.usertype===2){                
                try {
                    const ord = await pool.query('SELECT * FROM ordini WHERE actid =$1 AND expires_at IS NULL ORDER BY sent DESC, created DESC', [user.uid])                
                    res.status(200).json({ord:ord.rows, ut:2})
                } catch (error) {
                    console.log(error);
                    res.status(500).json()
                }
            }else{
                res.status(401).json({err:"unauthorized"})
            }
        }else{            
            //seleziono ordine
            let result
            if (user.usertype===1) {                
                result = await pool.query(`SELECT * FROM ordini JOIN attivita ON attivita.actid = ordini.actid WHERE id=$1 AND uid = $2`, [id, user.uid])
            }else if(user.usertype===2){                
                result = await pool.query(`SELECT * FROM ordini WHERE id=$1 AND actid = $2`, [id, user.uid])
            }else{                
                res.status(401).json({err:"unauthorized"})
                return
            }
            if (result.rowCount===0) {
                res.status(404).json({err:"not found"})
                return
            }

            res.status(200).json({ord:result.rows[0], ut:user.usertype})
            
            //restituisco prodotti
        }

        
    })

    app.patch("/order", async(req,res)=>{
        const {id} = req.body
        const user = checkToken(req,res)
        if (!id) {
            res.status(400).json({err:"missing id"})
        }
        if (user===-1) {
            return
        }

        //verifica che ordine si riferisca a artigiano
        
        
        try {
            const art = await res.pool(`SELECT actid FROM ordini WHERE id=$1`, [id])
            if (!art || art[0].actid!==user.uid) {
                res.status(401).json({err:"unauthorized"})
            }
            await pool.query(`UPDATE ordini SET sent = TRUE WHERE id=$1`, [id])    
            res.status(200).json({})
        } catch (error) {
            console.log(error);
            res.status(500).json({err:error})
        }
    })

    app.get("/order", async (req,res) => {
        const user = checkToken(req,res, false)
        if (user===-1) {
            res.redirect("/renewToken?from=/order")
            return
        }
        const id = req.query.id
        if (!id) {
            res.redirect("/")
            return
        }
        let result 
        if (user.usertype === 2) {
            result = await pool.query(`SELECT * FROM ordini WHERE actid = $1 AND expires_at IS NULL AND id = $2`, [user.uid, id])
            if (result.rowCount !== 1) {
                res.status(404).json({err:"product not found"})
                return
                
            }
        }else if (user.usertype === 1) {
            result = await pool.query(`SELECT * FROM ordini WHERE uid = $1 AND expires_at IS NULL AND id = $2`, [user.uid, id])
            if (result.rowCount !== 1) {
                res.status(404).json({err:"product not found"})
                return
            }
        }
        res.sendFile(path.join(__dirname,"Frontend",`/ordini/ordine.html`))
    })
    


    app.get("/ban", (req,res)=>{
        res.sendFile(path.join(__dirname,"Frontend/login/accountbannato/ban.html"))
    })

    app.get("/artigiano", async (req,res) => {
        const actid = req.query.actid
        if (!actid) {
            res.status(400).json({err:"missing act"})
        }        
        try {
            const result = await pool.query(`SELECT attivita.nome, attivita.indirizzo, attivita.email, attivita.ntel, attivita.descr FROM attivita JOIN utenti on attivita.actid = utenti.uid WHERE actid=$1 AND banned=false`, [actid])
            if (result.rowCount===0) {
                res.status(404).json({err:"act not found"})
                return
            }
            res.status(200).json({act:result.rows[0]})
        } catch (error) {
            console.log(error);
            res.status(500).json({})
        }
    })





    //HTTP SOLO PER TESTARE STRIPE CON CERTIFICATO SELF-SIGNED
    app.listen(3001, () => {
        console.log(`Server attivo su http://localhost:${port}`);
    });
    https.createServer(options, app).listen(port, () => {
        console.log(`Server attivo su https://localhost:${port+1}`);
    });

}

main().catch((err) => {
    console.error("Errore durante l'inizializzazione del server:", err);
    process.exit(1);
  });

