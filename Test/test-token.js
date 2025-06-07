/**
 * Suite di test "Renew Token":
 * - GET /renewToken → verifica che la pagina venga servita correttamente (atteso 200)
 * - POST /renewToken → rinnovo del token con cookie validi (atteso 200)
 */

const { testPOSTWithHeaders, testGET } = require('../helpers');

let rtUser = {};
let rtUserCookies = '';

function registerAndLoginForRenew(callback) {
  const timestamp = Date.now();
  rtUser = {
    name: "RenewTest",
    surname: "User",
    username: "renewuser_" + timestamp,
    email: "renew_" + timestamp + "@example.com",
    phone: "7778880000",
    password: "secret",
    user_type: "customer"
  };
  testPOSTWithHeaders('/registrazione', rtUser, 200, (err) => {
    if (err) return callback(err);
    const loginPayload = { cred: rtUser.username, pw: rtUser.password };
    testPOSTWithHeaders('/login', loginPayload, 200, (err, loginResult) => {
      if (err) return callback(err);
      if (loginResult.res.headers['set-cookie']) {
        rtUserCookies = loginResult.res.headers['set-cookie'].join('; ');
      }
      callback(null);
    });
  });
}

function runRenewTokenTests() {
  console.log("Inizio test API Renew Token...");

  // 1. GET /renewToken – dovrebbe restituire il file HTML (status 200)
  testGET('/renewToken', 200, {}, (err, data) => {
    if (err) console.error("[Renew Token] GET /renewToken fallito:", err.message);
    else console.log("[Renew Token] GET /renewToken superato.");

    // 2. POST /renewToken con token valido nei cookie
    registerAndLoginForRenew((err) => {
      if (err) {
        console.error("[Renew Token] Setup registrazione/login fallito:", err.message);
        return;
      }
      testPOSTWithHeaders('/renewToken', {}, 200, (err, result) => {
        if (err) console.error("[Renew Token] POST /renewToken fallito:", err.message);
        else {
          try {
            const jsonData = JSON.parse(result.data);
            assert.deepStrictEqual(jsonData, {}, "[Renew Token] La risposta JSON non è quella attesa.");
            console.log("[Renew Token] POST /renewToken superato.");
          } catch (e) {
            console.error("[Renew Token] Parsing POST /renewToken fallito:", e.message);
          }
        }
      });
    });
  });
}

setTimeout(runRenewTokenTests, 2000);
