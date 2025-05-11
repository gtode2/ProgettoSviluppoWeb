

async function addProduct(req, pool) {
    const query = `
            INSERT INTO prodotti(actid, name, descr, costo, amm)
            VALUES ($1,$2,$3,$4,$5)
        `;
        const values = [1, req.body["name"], req.body["descr"], req.body["price"], req.body["amm"]]
        try {
            const res = await pool.query(query,values)
            console.log("Inserimento prodotto completato");
            return 0
        } catch (error) {
            console.log(error);      
            return -1      
        }
}

module.exports = {addProduct} 