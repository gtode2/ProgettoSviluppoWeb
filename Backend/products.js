

async function addProduct(req, uid, pool) {   
    const query = `
        INSERT INTO prodotti(actid, name, descr, costo, amm)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING id
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

async function getProducts(pool, filters=null){
    const res = await pool.query(`SELECT * FROM prodotti WHERE banned = FALSE ORDER BY id DESC`)
    return res.rows
    
}
async function addCart(pool, prodid, uid){
    
    try {
        var query = `
            SELECT COUNT(*) 
            FROM carrello
            WHERE uid = $1
            AND productid = $2
        `
        var values = [uid, prodid]
        var result = await pool.query(query,values)
        console.log(result.rows[0].count);
        
        if (result.rows[0].count!=="0") {
            console.log("prodotto già nel carrello");
            result = increment(pool,prodid,uid)
            return result
        }

        query = `
            INSERT INTO carrello(uid, productid, quantita)
            VALUES ($1, $2, $3)
        `
        values = [uid, prodid, 1]
        await pool.query(query,values)
        return 0
    } catch (error) {
        console.log(error);
        return -1
    }
}
async function increment(pool, prodid, uid) {
    try {
        const query = `
        UPDATE carrello
        SET quantita = quantita + 1
        WHERE uid = $1
        AND productid = $2
        RETURNING quantita`
        const values = [uid, prodid]
        const res = await pool.query(query,values)
        return res.rows[0].quantita
    } catch (error) {
        console.log(error);
        return -1
        
    }
}
async function getCart(pool, uid){
    try {
        const res = await pool.query(`SELECT * FROM carrello JOIN prodotti ON carrello.productid = prodotti.id WHERE uid = $1 `, [uid])
        console.log(res.rows);
        return res.rows
    } catch (error) {
        console.log(error);
        return -1    
    }
}
async function emptyCart(pool, uid){
    try {
        await pool.query(`DELETE FROM carrello WHERE uid = $1`, [uid])
        return 0
    } catch (error) {
        console.log(error);
        return -1    
    }
}

module.exports = {addProduct, getProducts, addCart, getCart, emptyCart} 