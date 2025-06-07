// test/api_artigiano.test.js
/**
 * Test Artigiano
 * 
 * Copre:
 * - GET /artigiano senza il parametro "actid" -> atteso 400
 */
const { testGET } = require('../helpers');

let artUser = {};
let artUserCookies = '';

function registerAndLoginArt(callback) {
  const timestamp = Date.now();
  // Anche se l’endpoint /artigiano è destinato a artigiani,
  // in questo test lo eseguiamo come customer (o comunque senza specificare actid) per verificare l’errore
  artUser = {
    name: "ArtigianoTest",
    surname: "User",
    username: "artuser_" + timestamp,
    email: "art_" + timestamp + "@example.com",
    phone: "8889990000",
    password: "secret",
    user_type: "customer" // usiamo customer per verificare il controllo sul parametro mancante
  };
  testPOSTWithHeaders = require('../helpers').testPOSTWithHeaders; // se non già importato
  testPOSTWithHeaders('/registrazione', artUser, 200, (err) => {
    if (err) return callback(err);
    const loginPayload = { cred: artUser.username, pw: artUser.password };
    require('../helpers').testPOSTWithHeaders('/login', loginPayload, 200, (err, loginResult) => {
      if (err) return callback(err);
      if (loginResult.res.headers['set-cookie']) {
        artUserCookies = loginResult.res.headers['set-cookie'].join('; ');
      }
      callback(null);
    });
  });
}

function runArtTests() {
  console.log("Inizio test API Artigiano...");
  registerAndLoginArt((err) => {
    if (err) return console.error("Setup Artigiano fallito:", err.message);
    testGET('/artigiano', 400, { "Cookie": artUserCookies }, (err) => {
      if (err) console.error("GET /artigiano (senza actid) fallito:", err.message);
      else console.log("GET /artigiano (senza actid) superato.");
    });
  });
}

setTimeout(runArtTests, 2000);
