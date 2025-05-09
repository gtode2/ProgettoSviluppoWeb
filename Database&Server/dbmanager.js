const { Pool } = require("pg");

const db_user = "postgres"
const db_pw = "postgres"
const db_port = 5432 

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
        await creaAttivita()
        console.log("Creata tabella reftok");
    }
   
}



async function creaUtenti(){
    try {
        await pool.query("CREATE TABLE utenti(uid SERIAL PRIMARY KEY ,nome VARCHAR NOT NULL,cognome VARCHAR NOT NULL,username VARCHAR NOT NULL,email VARCHAR NOT NULL,ntel INT NOT NULL,password VARCHAR NOT NULL,usertype INT NOT NULL,activity SERIAL)")
        return true
    } catch (error) {
        console.log(error);        
        return false
    }
}
async function creaAttivita(){
    try {
        await pool.query("CREATE TABLE attivita(actid SERIAL PRIMARY KEY,nome VARCHAR NOT NULL,indirizzo VARCHAR,email VARCHAR NOT NULL,ntel INT, descr VARCHAR NOT NULL)")
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

module.exports={checkdb}