const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const express = require("express");
const { Pool } = require("pg");

const SECRET_KEY="chiaveesempio"
const REFRESH_SECRET_KEY="chiaveesempiomapiubrutta"
const app = express();
app.use(bodyParser.json());


// Funzione per creare un access token
function createAccessToken(user) {
    return jwt.sign({ id: user.uid, nome: user.name, mail: user.email, role: user.usertype}, SECRET_KEY, { expiresIn: '1h' });
    
    
}

// Funzione per creare un refresh token
function createRefreshToken(user) {
    return jwt.sign({ id: user.uid, nome: user.nome, mail: user.email }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
}

function checkToken(token){
    
}

async function renewToken(token, pool){
    //verifico esistenza token
    const query = `SELECT * FROM reftok WHERE token=$1`
    token = token["token"]
    const values = [token]
    console.log(token);
    var res = null
    try {
        console.log("verifica esistenza token");
        
        res = await pool.query(query,values)
        console.log("verifica a db eseguita");

        
        if (res.rows.length===0) {
            console.log("Token not found");
            return -1
        }
    } catch (error) {
        console.log(error);
        return -1
        
    }
    console.log("token trovato");
    
    //verifico validità (revoked)
    if (res.rows[0].revoked) {
        console.log("Token revoked");
        return -1
    }
    console.log("token ancora valido");
    
    //verifico correttezza (jwt.verify)

    try {
        user = jwt.verify(token,REFRESH_SECRET_KEY)
    } catch (error) {
        console.log("verify failed");    
        console.log(error);
        return -1        
    }
    console.log("creazione nuovo token");    
    const newToken = createAccessToken(user)
    console.log("token creato");
    return newToken


}

module.exports={createAccessToken, createRefreshToken, checkToken, renewToken}