const Pool = require('pg').Pool
const pool = new Pool({
    user:'postgres',
    host:'localhost',
    database:'postgres',
    password:'postgres',
    port:5432    
})

export function checkdb()  {
    try {
        pool.connect()
        const res = pool.query('SELECT 1 FROM pg_database WHERE datname = $1',["dbprogetto"])
        if (res.rowCount>0) {
            console.log("DB Esiste")
        }else{
            const res = pool.query("CREATE DATABASE dbprogetto")
            console.log("DB Creato")
        }
        return 0
    } catch (error) {
        console.log("Impossibile verificare esistenza del DB\n Errore: "+error)
        return -1
    }
}

