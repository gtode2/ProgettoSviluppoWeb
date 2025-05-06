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
            checkTables()
        }else{
            const res = await pool.query("CREATE DATABASE "+nomeDb)
            console.log("DB Creato")
            await setDb(nomeDb)
            await createTables()
        }
        return 0
    } catch (error) {
        console.log("Impossibile verificare esistenza del DB\n Errore: "+error)
        return error
    }
}

async function setDb(nomedb){
    await pool.end()
    pool = new Pool({
        user:db_user,
        host:'localhost',
        database:nomedb,
        password:db_pw,
        port:db_port    
    })
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


        if (!corr) {
            //gestione creazione tabelle errata    
        }
        
        //INSERIRE CREAZIONE NUOVE TABELLE
    } catch (error) {
        console.log("Impossibile creare la tabella\n"+error);
            
    }
}       
async function checkTables(){
    if (! await pool.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='utenti')")) {
        await creaUtenti()
        console.log("Creata tabella utenti");
        
    }
    if(await pool.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='attivita')")){
        await creaAttivita()
        console.log("Creata tabella attivita");
    }
}



async function creaUtenti(){
    try {
        await pool.query("CREATE TABLE utenti(uid SERIAL PRIMARY KEY ,nome VARCHAR NOT NULL,cognome VARCHAR NOT NULL,email VARCHAR NOT NULL,ntel INT NOT NULL,password VARCHAR NOT NULL,usertype INT NOT NULL,activity SERIAL)")
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

module.exports={checkdb}