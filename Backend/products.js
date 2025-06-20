async function addProduct(req, uid, pool) {   
    const query = `
        INSERT INTO prodotti(actid, name, descr, costo, amm, cat)
        VALUES ($1,$2,$3,$4,$5, $6)
        RETURNING id
        `;
    const values = [uid, req.body["name"], req.body["descr"], req.body["price"], req.body["amm"], req.body["cat"]]
    try {
        const res = await pool.query(query,values)
        return 0
    } catch (error) {
        console.log(error);      
        return -1      
    }
    
}
async function removeProduct(pool, productid, uid) {
    try {
        //verifica che prodotto sia dell'utente selezionato
        var result =  await pool.query(`SELECT * FROM prodotti WHERE id = $1 AND actid=$2`, [productid, uid])
        if (result.rows.length===0) {
            return -2
        }
        
        result = await pool.query(`UPDATE prodotti SET banned=TRUE WHERE id=$1`,[productid])
        return 0 
    } catch (error) {
        return -1
    }
}
async function getProducts(pool, filters=null, id=null){
        
    var res=null
    try {
        if (id!==null) {
            //prodotto specifico
            res = await pool.query(`SELECT 
                prodotti.id, 
                prodotti.name, 
                prodotti.descr, 
                prodotti.costo, 
                prodotti.amm, 
                prodotti.banned, 
                prodotti.cat, 
                prodotti.actid,
                attivita.nome AS nome_attivita 
                FROM prodotti
                JOIN attivita ON prodotti.actid = attivita.actid 
                WHERE id = $1`, [id]) 
        }else if (filters!==null) {
            //caricamento prodotti con filtri
            var query = `SELECT * FROM prodotti WHERE banned = FALSE `
            //array contenente parametri

            var values = []
            //ricerca
            if (filters.search) {
                query = query + "AND name ILIKE $"+(values.length+1)+" OR descr ILIKE $"+(values.length+1)
                values.push("%"+filters.search+"%")
            }

            //prezzo minimo
            if (filters.min) {
                query = query + " AND costo >= $"+(values.length+1)
                values.push(filters.min)
            }

            //prezzo massimo
            if (filters.max) {
                query = query + " AND costo <= $"+(values.length+1)
                values.push(filters.max)
            }

            //categoria
            if (filters.cat) {
                query = query + " AND cat =$"+(values.length+1)
                values.push(filters.cat)           
            }

            //produttore
            if (filters.produttore) {
                query = query + " AND actid = $"+(values.length+1)
                values.push(filters.produttore)
            }
            //solo disponibili
            if (filters.disp) {

                ///////
                query = query + " AND amm != 0 "
            }
            //ordine
            if (!filters.order) {
                //order id desc default
                query = query + " ORDER BY id DESC"
            }else if (filters.order==="pa") {
                query = query + " ORDER BY costo DESC"
            }else if (filters.order==="pb") {
                query = query + " ORDER BY costo ASC"
            }else if (filters.order==="aa"){
                query = query + " ORDER BY name ASC"
            }else if (filters.order==="ac"){
                query = query + " ORDER BY name DESC"
            }
            res = await pool.query(query, values)

        }else{
            //caricamento prodotti senza filtri
            res = await pool.query(`SELECT * FROM prodotti WHERE banned = FALSE ORDER BY id DESC`)    
        }
        return res.rows
    } catch (error) {
        
    }
    
}
async function addCart(pool, prodid, uid){
    try {
        let  prod = await pool.query(`SELECT * FROM prodotti WHERE id=$1 AND banned=FALSE`, [prodid])
        if (prod.rows.length===0) {
            return -2
        } 
        let result = await pool.query(`SELECT * FROM carrello WHERE uid = $1 AND productid = $2`,[uid, prodid])

        if (prod.rows[0].amm===0) {
            return -3
        }
        
        if (result.rows.length!==0) {
            if (prod.rows[0].amm === (result.rows[0].quantita)) {
                return -4
            }   
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
async function decrCart(pool, prodid, uid) {
    try {
        var result = await pool.query(`SELECT * FROM prodotti WHERE id=$1 AND banned=FALSE`, [prodid])
        if (result.rows.length===0) {
            return -2
        } 

        result = await pool.query(`SELECT COUNT(*) FROM carrello WHERE uid = $1 AND productid = $2`,[uid, prodid])
    
        if (result.rows[0].count==="0") {
            return 1
        }
        await decrement(pool,prodid,uid)
        return 0
    } catch (error) {
        console.log(error);
        return -1
    }
}
async function removeCart(pool, prodid, uid) {
    try {
        await pool.query(`DELETE FROM carrello WHERE uid = $1 AND productid = $2`,[uid, prodid])
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
async function decrement(pool, prodid, uid) {
    try {
        const query = `
        UPDATE carrello
        SET quantita = quantita - 1
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
        const res = await pool.query(`SELECT * FROM carrello JOIN prodotti ON carrello.productid = prodotti.id WHERE uid = $1 AND banned=FALSE`, [uid])
        for(const el of res.rows){
            if (el.amm<el.quantita) {
                await pool.query(`UPDATE carrello SET quantita=$1 WHERE productid = $2 AND uid=$3`, [el.amm, el.id, uid])
                return getCart(pool, uid)
            }
        }
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
async function editProduct(pool, id, req) {
    const {nome, descr, prezzo, qt, cat} = req.body
    try {
        if (nome) {
                await pool.query(`UPDATE prodotti SET name=$1 WHERE id=$2`,[nome, id]);
            }
            if (descr) {
                await pool.query(`UPDATE prodotti SET descr=$1 WHERE id=$2`,[descr, id])
            }
            if (prezzo) {
                await pool.query(`UPDATE prodotti SET costo=$1 WHERE id=$2`,[prezzo, id])                
            }
            if (qt) {
                await pool.query(`UPDATE prodotti SET amm=$1 WHERE id=$2`,[qt, id])          
            }
            if (cat) {
                await pool.query(`UPDATE prodotti SET cat=$1 WHERE id=$2`,[cat, id]) 
            }
            return 0
    } catch (error) {
        console.log(error);
        return -1
    }
}

module.exports = {addProduct, removeProduct, getProducts, editProduct, addCart, removeCart, decrCart, getCart, emptyCart} 