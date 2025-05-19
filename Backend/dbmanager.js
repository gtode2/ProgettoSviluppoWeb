const { Pool } = require("pg");
const {db_user, db_port, db_pw} = require("../config.js")

var pool = new Pool({
    user:db_user,
    host:'localhost',
    database:'postgres',
    password:db_pw,
    port:db_port    
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
        user:db_user,
        host:'localhost',
        database:nomedb,
        password:db_pw,
        port:db_port    
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
   
}




async function creaUtenti(){
    try {
        await pool.query("CREATE TABLE utenti(uid SERIAL PRIMARY KEY ,nome VARCHAR NOT NULL,cognome VARCHAR NOT NULL,username VARCHAR NOT NULL,email VARCHAR NOT NULL,ntel BIGINT NOT NULL,password VARCHAR NOT NULL,usertype INT NOT NULL, banned BOOLEAN NOT NUL DEFAULT FALSE)")
        return true
    } catch (error) {
        console.log(error);        
        return false
    }
}
async function creaAttivita(){
    try {
        await pool.query("CREATE TABLE attivita(actid INT PRIMARY KEY,nome VARCHAR NOT NULL,indirizzo VARCHAR,email VARCHAR NOT NULL,ntel INT, descr VARCHAR NOT NULL, FOREIGN KEY(actid) REFERENCES utenti(uid))")
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




module.exports={checkdb}