const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const express = require("express");

const SECRET_KEY="chiaveesempio"
const REFRESH_SECRET_KEY="chiaveesempiomapiubrutta"
const app = express();
app.use(bodyParser.json());


// Funzione per creare un access token
function createAccessToken(user) {
    return jwt.sign({ uid: user.uid, usertype: user.usertype}, SECRET_KEY, { expiresIn: '1h' });    
}

// Funzione per creare un refresh token
function createRefreshToken(user) {
    console.log("usertype ="+user.usertype);
    
    return jwt.sign({ uid: user.uid, usertype: user.usertype}, REFRESH_SECRET_KEY, { expiresIn: '7d' });
}

function checkToken(req, res, send=true){
    const token = req.cookies.accessToken;
    if (!token) {      
        console.log("no token");
        if (send) {
            res.status(401).json({err:"missing token"})    
        }    
        return -1
    }else{
        console.log("token presente");
        const user = verify(token)
        console.log("eseguita verifica token");
        if (user==-1) {
            console.log("token non valido");
            if (send) {
                res.status(401).json({err:"invalid token"})
            }
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

async function renewToken(req, res, pool){
    const token = req.cookies.refreshToken;
    //verifico esistenza token
    if (!token) {
        res.status(401).json({err:"missing token"})
        console.log("missing token");
        
        return -1
    }
    const query = `SELECT * FROM reftok WHERE token=$1`
    console.log(token);
    var response 
    try {
        console.log("verifica esistenza token");
        
        response = await pool.query(query,[token])
        console.log("verifica a db eseguita");

        
        if (response.rows.length===0) {
            console.log("Token not found");
            res.status(401).json({err:"token not found"})
            return -1
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({})
        return -1
        
    }
    console.log("token trovato");
    
    console.log("token ancora valido");
    
    //verifico correttezza (jwt.verify)

    try {
        user = jwt.verify(token,REFRESH_SECRET_KEY)
        console.log("verifica eseguita");
        console.log("usertype = "+user.usertype);
        
    } catch (error) {
        console.log("Verification  failed");    
        console.log(error);
        res.status(401).json({err:"Verification  failed"})
        return -1        
    }
    console.log("creazione nuovo token");    
    const newToken = createAccessToken(user)
    console.log("token creato");
    return newToken


}

async function registerToken(user, pool) {

    console.log(user.rows[0].usertype);
    
    const accessToken = createAccessToken(user.rows[0])
    const refreshToken = createRefreshToken(user.rows[0])
    console.log("creati token");
    
    //inserire refreshToken in db
    try {
        console.log(user.rows[0].password);
        const query = `
        INSERT INTO reftok(userid, token, exp)
        VALUES ($1, $2, $3)
        `;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const values = [user.rows[0].uid, refreshToken, expiresAt, ];
        await pool.query(query,values)
        console.log("token in db");
    } catch (error) {
        console.log("non va un cazzo \n"+error);
        return -1
    }
    return {access: accessToken, refresh:refreshToken}    
}

module.exports={createAccessToken, createRefreshToken, checkToken, renewToken, registerToken}