// test/api_updateUser.test.js
/**
 * Test Update User
 * 
 * Copre:
 * - POST /updateUser per aggiornare un dato (ad es. il cognome) -> atteso 200
 */
const { testPOSTWithHeaders } = require('../helpers');

let uuUser = {};
let uuUserCookies = '';

function registerAndLoginUU(callback) {
  const timestamp = Date.now();
  uuUser = {
    name: "UU Test",
    surname: "User",
    username: "uuuser_" + timestamp,
    email: "uu_" + timestamp + "@example.com",
    phone: "3334445555",
    password: "secret",
    user_type: "customer"
  };
  testPOSTWithHeaders('/registrazione', uuUser, 200, (err) => {
    if (err) return callback(err);
    const loginPayload = { cred: uuUser.username, pw: uuUser.password };
    testPOSTWithHeaders('/login', loginPayload, 200, (err, loginResult) => {
      if (err) return callback(err);
      if (loginResult.res.headers['set-cookie']) {
        uuUserCookies = loginResult.res.headers['set-cookie'].join('; ');
      }
      callback(null);
    });
  });
}

function runUUTests() {
  console.log("Inizio test API Update User...");
  registerAndLoginUU((err) => {
    if (err) return console.error("Setup UpdateUser fallito:", err.message);
    const updatePayload = { cognome: "UpdatedSurname" };
    testPOSTWithHeaders('/updateUser', updatePayload, 200, (err) => {
      if (err) console.error("POST /updateUser fallito:", err.message);
      else console.log("POST /updateUser superato.");
    });
  });
}

setTimeout(runUUTests, 2000);
