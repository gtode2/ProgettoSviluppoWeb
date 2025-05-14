

async function addProduct(req, uid, pool) {   
    const query = `
        INSERT INTO prodotti(actid, name, descr, costo, amm)
        VALUES ($1,$2,$3,$4,$5)
        `;
    const values = [uid, req.body["name"], req.body["descr"], req.body["price"], req.body["amm"]]
    try {
        const res = await pool.query(query,values)
        console.log("Inserimento prodotto completato");
        return 0
    } catch (error) {
        console.log(error);      
        return -1      
    }
    
}

async function getProducts(pool){
    const res = await pool.query(`SELECT * FROM prodotti ORDER BY id DESC`)
    console.log(res.rows);
    return res.rows
    
}

module.exports = {addProduct, getProducts} 