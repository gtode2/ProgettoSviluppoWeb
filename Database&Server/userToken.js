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

function checkToken(req,res){
    const {token} = req.body

        if (!token) {      
            console.log("no token");    
            res.status(401).json({error:"missing token"})
            return -1
        }else{
            console.log("token presente");
            const user = verify(token)
            console.log("eseguita verifica token");
            if (user==-1) {
                console.log("token non valido");
                res.status(401).json({error:"invalid token"})
                return -1
            }
            return user
        }

}

function verify(token) {
    try {
        const user = jwt.verify(token, SECRET_KEY)
        return user
    } catch (error) {
        console.log(error);
        return -1
    }
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

async function registerToken(user, pool) {

    const accessToken = createAccessToken(user.rows[0])
    const refreshToken = createRefreshToken(user.rows[0])
    console.log("creati token");
    
    //inserire refreshToken in db
    try {
        console.log(user.rows[0].password);
        const query = `
        INSERT INTO reftok(userid, token, exp, revoked)
        VALUES ($1, $2, $3, $4)
        `;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const values = [user.rows[0].uid, refreshToken, expiresAt, false];
        await pool.query(query,values)
        console.log("token in db");
    } catch (error) {
        console.log("non va un cazzo \n"+error);
        return -1
    }
    return {access: accessToken, refresh:refreshToken}    
}

module.exports={createAccessToken, createRefreshToken, checkToken, renewToken, registerToken}