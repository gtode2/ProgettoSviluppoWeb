
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
        const res = await pool.query('SELECT * FROM report WHERE solved=false', [])
        return res.rows
    } catch (error) {
        console.log(error);
        return -1
    }
}

module.exports = {addReport, getReports}