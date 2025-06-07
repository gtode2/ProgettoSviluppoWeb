// test/api_changePassword.test.js
/**
 * Test Change Password
 * 
 * Copre:
 * - POST /changePassword con password errata -> atteso 401
 * - POST /changePassword con password corretta -> atteso 200
 */
const { testPOSTWithHeaders } = require('../helpers');

let cpUser = {};
let cpUserCookies = '';

function registerAndLoginCP(callback) {
  const timestamp = Date.now();
  cpUser = {
    name: "CPTest",
    surname: "User",
    username: "cpuser_" + timestamp,
    email: "cp_" + timestamp + "@example.com",
    phone: "2223334444",
    password: "secret",
    user_type: "customer"
  };
  testPOSTWithHeaders('/registrazione', cpUser, 200, (err) => {
    if (err) return callback(err);
    const loginPayload = { cred: cpUser.username, pw: cpUser.password };
    testPOSTWithHeaders('/login', loginPayload, 200, (err, loginResult) => {
      if (err) return callback(err);
      if (loginResult.res.headers['set-cookie']) {
        cpUserCookies = loginResult.res.headers['set-cookie'].join('; ');
      }
      callback(null);
    });
  });
}

function runCPTests() {
  console.log("Inizio test API Change Password...");
  registerAndLoginCP((err) => {
    if (err) return console.error("Setup CP fallito:", err.message);
    
    // a) Tentativo con password errata
    const wrongPayload = { vecchia: "wrong", nuova: "newsecret" };
    testPOSTWithHeaders('/changePassword', wrongPayload, 401, (err) => {
      if (err) console.error("Change Password (wrong) fallito:", err.message);
      else console.log("Change Password (wrong) superato.");

      // b) Cambio password con password corretta
      const correctPayload = { vecchia: "secret", nuova: "newsecret" };
      testPOSTWithHeaders('/changePassword', correctPayload, 200, (err) => {
        if (err) console.error("Change Password (correct) fallito:", err.message);
        else console.log("Change Password (correct) superato.");
      });
    });
  });
}

setTimeout(runCPTests, 2000);
