const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const express = require("express");
require('dotenv').config();

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET;

const app = express();
app.use(bodyParser.json());

function createAccessToken(user) {
    return jwt.sign({
        id: user.uid,
        nome: user.name,
        mail: user.email,
        role: user.usertype
    }, SECRET_KEY, { expiresIn: '1h' });
}

function createRefreshToken(user) {
    return jwt.sign({
        id: user.uid,
        nome: user.nome,
        mail: user.email
    }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
}

function verify(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return -1;
    }
}

function checkToken(req, res) {
    const token = req.cookies?.accessToken;
    if (!token) {
        return res.status(401).json({ error: "missing token" });
    }

    const user = verify(token);
    if (user === -1) {
        return res.status(401).json({ error: "invalid token" });
    }

    return user;
}

async function renewToken(token, pool) {
    token = token.token;
    try {
        const res = await pool.query(`SELECT * FROM reftok WHERE token=$1`, [token]);
        if (res.rows.length === 0 || res.rows[0].revoked) return -1;

        const user = jwt.verify(token, REFRESH_SECRET_KEY);
        return createAccessToken(user);
    } catch (error) {
        return -1;
    }
}

async function registerToken(user, pool) {
    const accessToken = createAccessToken(user.rows[0]);
    const refreshToken = createRefreshToken(user.rows[0]);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
        await pool.query(`
            INSERT INTO reftok(userid, token, exp, revoked)
            VALUES ($1, $2, $3, $4)
        `, [user.rows[0].uid, refreshToken, expiresAt, false]);

        return { access: accessToken, refresh: refreshToken };
    } catch (error) {
        console.log(error);
        return -1;
    }
}

module.exports = { createAccessToken, createRefreshToken, checkToken, renewToken, registerToken };
