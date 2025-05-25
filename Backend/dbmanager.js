const { Pool } = require("pg");
require('dotenv').config({path: './ini.env' });


var pool = new Pool({
    user:process.env.db_user,
    host:'localhost',
    database:'postgres',
    password:process.env.db_pw,
    port:process.env.db_port    
})

const nomeDb = "dbprogetto"

async function checkdb()  {
    try {
        await pool.connect()
        const res = await pool.query('SELECT 1 FROM pg_database WHERE datname = $1',[nomeDb])
        if (res.rowCount>0) {
            console.log("DB Esiste")
            await setDb(nomeDb)
            await checkTables()
            console.log("verifica tabelle completata");
            
        }else{
            const res = await pool.query("CREATE DATABASE "+nomeDb)
            console.log("DB Creato")
            console.log("richiesta modifica database");
            await setDb(nomeDb)
            
            await pool.connect()
            console.log("connessione al database riuscita");
            await createTables()
            console.log("Tabelle create")
        }
        return 0
    } catch (error) {
        console.log("Impossibile verificare esistenza del DB\n Errore: "+error)
        return error
    }
}

async function setDb(nomedb){
    try {
        console.log("chiusura pool");
        pool.end()
    console.log("Pool chiuso");
    
    pool = new Pool({
        user:process.env.db_user,
        host:'localhost',
        database:nomedb,
        password:process.env.db_pw,
        port:process.env.db_port    
    })
    } catch (error) {
        console.log("impossibile chiudere il db\n"+error);
             
    }
}
async function createTables(){
    try {
        var corr 
        if (! await creaUtenti()) {
            corr=false 
        }
        if (! await creaAttivita()) {
            corr=false
        }
        if (! await creaRefTok()) {
            corr=false
        }
        if (! await creaProdotti()) {
            corr=false
        }
        if (! await creaCarrello()) {
            corr=false
        }
        if (! await creaReport()) {
            corr=false
        }
        if (! await creaOrdini()) {
            corr=false
        }
        

        if (!corr) {
            //gestione creazione tabelle errata    
        }
        
        //INSERIRE CREAZIONE NUOVE TABELLE
    } catch (error) {
        console.log("Impossibile creare la tabella\n"+error);
            
    }
}       
async function checkTables(){
    res_utenti = await pool.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='utenti')")
    if (! res_utenti.rows[0].exists) {
        await creaUtenti()
        console.log("Creata tabella utenti");   
    }
    res_attivita = await pool.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='attivita')")
    if(!res_attivita.rows[0].exists){
        await creaAttivita()
        console.log("Creata tabella attivita");
    }
    res_token = await pool.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='reftok')")
    if(!res_token.rows[0].exists){
        await creaRefTok()
        console.log("Creata tabella reftok");
    }
    res_prod = await pool.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='prodotti')")
    if(!res_prod.rows[0].exists){
        await creaProdotti()
        console.log("Creata tabella prodotti");
    }
    res_carr = await pool.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='carrello')")
    if(!res_prod.rows[0].exists){
        await creaCarrello()
        console.log("Creata tabella carrello");
    }
    res_report = await pool.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='report')")
    if(!res_prod.rows[0].exists){
        await creaReport()
        console.log("Creata tabella report");
    }
    res_ordini = await pool.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='ordini')")
    if(!res_prod.rows[0].exists){
        await creaOrdini()
        console.log("Creata tabella ordini");
    }

   
}




async function creaUtenti(){
    try {
        await pool.query("CREATE TABLE utenti(uid SERIAL PRIMARY KEY ,nome VARCHAR NOT NULL,cognome VARCHAR NOT NULL,username VARCHAR NOT NULL,email VARCHAR NOT NULL,ntel VARCHAR NOT NULL,password VARCHAR NOT NULL,usertype INT NOT NULL, banned BOOLEAN NOT NULL DEFAULT FALSE)")
        return true
    } catch (error) {
        console.log(error);        
        return false
    }
}
async function creaAttivita(){
    try {
        await pool.query("CREATE TABLE attivita(actid INT PRIMARY KEY,nome VARCHAR NOT NULL,indirizzo VARCHAR,email VARCHAR NOT NULL,ntel VARCHAR, descr VARCHAR NOT NULL, FOREIGN KEY(actid) REFERENCES utenti(uid))")
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}
async function creaRefTok(){
    try {
        await pool.query("CREATE TABLE RefTok(id SERIAL PRIMARY KEY,userid INT NOT NULL,token VARCHAR,exp TIMESTAMP NOT NULL,revoked BOOLEAN, FOREIGN KEY (userid) REFERENCES utenti(uid))")
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}
async function creaProdotti() {
    try {
        await pool.query("CREATE TABLE Prodotti(id SERIAL PRIMARY KEY,actid INT NOT NULL,name VARCHAR NOT NULL, descr VARCHAR NOT NULL, costo FLOAT NOT NULL, amm INT NOT NULL, banned BOOLEAN NOT NULL DEFAULT FALSE, FOREIGN KEY (actid) REFERENCES attivita(actid))")
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}
async function creaCarrello() {
    try {
        await pool.query("CREATE TABLE Carrello(uid INT NOT NULL, productid INT NOT NULL, quantita INT NOT NULL, PRIMARY KEY (uid, productid),FOREIGN KEY (uid) REFERENCES utenti(uid), FOREIGN KEY (productid) REFERENCES prodotti(id))")
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}

async function creaReport() {
    try {
        await pool.query("CREATE TABLE report(id SERIAL PRIMARY KEY, uid INT NOT NULL, prodid INT NOT NULL, type VARCHAR NOT NULL, descr VARCHAR NOT NULL, solved BOOLEAN,FOREIGN KEY(uid) REFERENCES utenti(uid), FOREIGN KEY(prodid) REFERENCES prodotti(id))")
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}

async function creaOrdini() {
    try {
        await pool.query("CREATE TABLE ordini (id SERIAL PRIMARY KEY, uid INT NOT NULL, products JSONB NOT NULL, sent BOOLEAN DEFAULT FALSE, created TIMESTAMP NOT NULL, expires_at TIMESTAMP, FOREIGN KEY (uid) REFERENCES utenti(uid))")
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}




module.exports={checkdb}