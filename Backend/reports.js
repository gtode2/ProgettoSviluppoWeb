async function addReport(pool, uid, pid, type, desc) {
    const query = 'INSERT INTO report(uid, prodid, type, descr, solved) VALUES ($1,$2,$3,$4,$5)'
    const values = [uid,pid,type,desc,false]

    try {
        await pool.query(query,values)
        console.log("report aggiunto correttamente");
        return 0
    } catch (error) {
        console.log(error);
        return -1
    }
}

async function getReports(pool) {
    try {
        const res = await pool.query('SELECT id, report.uid, prodid, type, descr, utenti.username FROM report JOIN utenti ON report.uid=utenti.uid WHERE solved=false', [])
        return res.rows
    } catch (error) {
        console.log(error);
        return -1
    }
}

async function removeReport(pool, id) {
    try {
        const query = `UPDATE report SET solved=true WHERE id=$1`
        const values = [id]
        await pool.query(query,values)
        return 0
    } catch (error) {
        console.log(error);
        return -1
    }
}

async function removeReportedProduct(pool, id) {
    try {
        await pool.query(`BEGIN`) 
        await pool.query(`UPDATE report SET solved=true WHERE id=$1`,[id])
        const res = await pool.query(`SELECT prodotti.id FROM report JOIN prodotti ON report.prodid = prodotti.id WHERE report.id=$1`, [id]) //report join product
        await pool.query(`UPDATE prodotti SET banned=TRUE WHERE id=$1`,[res.rows[0].id])
        await pool.query(`UPDATE report SET solved=true WHERE report.prodid=$1`,[res.rows[0].id])
        await pool.query(`COMMIT`)
        return 0
    } catch (error) {
        await pool.query(`ROLLBACK`)
        console.log(error);
        console.log("esecuzione rollback");
        
        return -1
    }
}
async function banArtigiano(pool, id) {
    try {
        await pool.query(`BEGIN`) 
        await pool.query(`UPDATE report SET solved=true WHERE id=$1`,[id])
        const res = await pool.query(`
            SELECT attivita.actid FROM report 
            JOIN prodotti ON report.prodid=prodotti.id
            JOIN attivita ON prodotti.actid = attivita.actid
            WHERE report.id=$1`, [id]) //ottengo id utente (che corrisponde a id attività)
        const user = res.rows[0].actid
        console.log(user);
        
        await pool.query(`UPDATE utenti SET banned=TRUE WHERE uid=$1`,[user])
        await pool.query(`
            UPDATE report SET solved=true FROM prodotti, attivita, utenti 
            WHERE report.prodid= prodotti.id
            AND prodotti.actid = attivita.actid
            AND attivita.actid = utenti.uid
            AND utenti.uid = $1`,[user])
        //ban di tutti i prodotti di utente 
        await pool.query(`UPDATE prodotti SET banned=true WHERE actid=$1`, [user])
        await pool.query(`COMMIT`)
        return 0
    } catch (error) {
        await pool.query(`ROLLBACK`)
        console.log(error);
        console.log("esecuzione rollback");
        
        return -1
    }
}

module.exports = {addReport, getReports, removeReport, removeReportedProduct, banArtigiano}