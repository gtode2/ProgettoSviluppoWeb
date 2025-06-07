// test/api_userArea.test.js
/**
 * Test User Area & User Info
 * 
 * Copre:
 * - GET /userArea per ottenere la pagina dell’area utente (atteso 200)
 * - POST /user per ottenere i dati dell’utente (atteso 200 con proprietà "user")
 */
const { testGET, testPOSTWithHeaders } = require('../helpers');

let uaUser = {};
let uaUserCookies = '';

function registerAndLoginUA(callback) {
  const timestamp = Date.now();
  uaUser = {
    name: "UA Test",
    surname: "User",
    username: "uauser_" + timestamp,
    email: "ua_" + timestamp + "@example.com",
    phone: "5556667777",
    password: "secret",
    user_type: "customer"
  };
  testPOSTWithHeaders('/registrazione', uaUser, 200, (err) => {
    if (err) return callback(err);
    const loginPayload = { cred: uaUser.username, pw: uaUser.password };
    testPOSTWithHeaders('/login', loginPayload, 200, (err, loginResult) => {
      if (err) return callback(err);
      if (loginResult.res.headers['set-cookie']) {
        uaUserCookies = loginResult.res.headers['set-cookie'].join('; ');
      }
      callback(null);
    });
  });
}

function runUATests() {
  console.log("Inizio test API User Area & Info...");
  registerAndLoginUA((err) => {
    if (err) return console.error("Setup User Area fallito:", err.message);
    testGET('/userArea', 200, { "Cookie": uaUserCookies }, (err) => {
      if (err) console.error("GET /userArea fallito:", err.message);
      else console.log("GET /userArea superato.");

      testPOSTWithHeaders('/user', {}, 200, (err, result) => {
        if (err) console.error("POST /user fallito:", err.message);
        else {
          try {
            const jsonUser = JSON.parse(result.data);
            assert.ok(jsonUser.user, "Proprietà 'user' mancante");
            console.log("POST /user superato.");
          } catch(e) {
            console.error("Parsing POST /user fallito:", e.message);
          }
        }
      });
    });
  });
}

setTimeout(runUATests, 2000);
