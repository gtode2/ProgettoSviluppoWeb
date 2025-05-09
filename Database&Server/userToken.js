const jwt = require('jsonwebtoken')

const SECRET_KEY="chiaveesempio"
const REFRESH_SECRET_KEY="chiaveesempiomapiubrutta"

// Funzione per creare un access token
function createAccessToken(user) {
    return jwt.sign({ id: user.uid, nome: user.name, mail: user.email }, SECRET_KEY, { expiresIn: '1h' });
}

// Funzione per creare un refresh token
function createRefreshToken(user) {
    return jwt.sign({ id: user.uid, nome: user.nome, mail: user.email }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
}

module.exports={createAccessToken, createRefreshToken}