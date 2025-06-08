const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const express = require("express");
require('dotenv').config({path: './.env' });

const SECRET_KEY=process.env.SECRET_KEY
const REFRESH_SECRET_KEY=process.env.REFRESH_SECRET_KEY
const app = express();
app.use(bodyParser.json());


// Funzione per creare un access token
function createAccessToken(user) {
    return jwt.sign({ uid: user.uid, usertype: user.usertype}, SECRET_KEY, { expiresIn: '1h' });    
}

// Funzione per creare un refresh token
function createRefreshToken(user) {
    return jwt.sign({ uid: user.uid, usertype: user.usertype}, REFRESH_SECRET_KEY, { expiresIn: '7d' });
}

function checkToken(req, res, send=true){
    const token = req.cookies.accessToken;
    if (!token) {      
        if (send) {
            res.status(401).json({err:"missing token"})    
        }    
        return -1
    }else{
        const user = verify(token)
        if (user==-1) {
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
        return -1
    }
    const query = `SELECT * FROM reftok WHERE token=$1`
    var response 
    try {
        response = await pool.query(query,[token])
        if (response.rows.length===0) {
            res.status(401).json({err:"token not found"})
            return -1
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({})
        return -1
        
    }

    //verifico correttezza (jwt.verify)

    try {
        user = jwt.verify(token,REFRESH_SECRET_KEY)
  
    } catch (error) {
        console.log(error);
        res.status(401).json({err:"Verification failed"})
        return -1        
    }   
    const newToken = createAccessToken(user)
    return newToken


}

async function registerToken(user, pool) {
    const accessToken = createAccessToken(user.rows[0])
    const refreshToken = createRefreshToken(user.rows[0])
    
    //inserire refreshToken in db
    try {
        const query = `
        INSERT INTO reftok(userid, token, exp)
        VALUES ($1, $2, $3)
        `;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const values = [user.rows[0].uid, refreshToken, expiresAt, ];
        await pool.query(query,values)
    } catch (error) {
        console.log(error);
        return -1
    }
    return {access: accessToken, refresh:refreshToken}    
}

module.exports={createAccessToken, createRefreshToken, checkToken, renewToken, registerToken}