// test/api_auth.test.js
/**
 * Suite di test "Auth" che copre:
 * - POST "/registrazione" per creare un nuovo utente "customer" (per scopi di test)
 * - POST "/login" per il login con credenziali corrette
 * - POST "/login" per il login con password errata
 * - DELETE "/logout" per il logout, usando i cookie ottenuti dal login
 */

const https = require('https');
const assert = require('assert');

const port = 3000; // Il server si aspetta connessioni su https://localhost:3000

// Funzione di utilità per le richieste HTTPS generiche
function httpsRequest(options, postData, callback) {
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => { callback(null, res, data); });
  });
  req.on('error', err => { callback(err); });
  if (postData) req.write(postData);
  req.end();
}

// Funzione POST che restituisce anche gli header (per i cookie)
function testPOSTWithHeaders(path, payload, expectedStatus, callback) {
  const dataString = JSON.stringify(payload);
  const options = {
    hostname: 'localhost',
    port: port,
    path: path,
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataString)
    }
  };
  httpsRequest(options, dataString, (err, res, data) => {
    if (err) return callback(err);
    try {
      assert.strictEqual(res.statusCode, expectedStatus,
        `POST ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`);
      callback(null, { res, data });
    } catch(e) {
      callback(e);
    }
  });
}

// Funzione DELETE che permette di inviare header aggiuntivi (per i cookie)
function testDELETEWithHeaders(path, payload, expectedStatus, extraHeaders, callback) {
  let dataString = payload ? JSON.stringify(payload) : null;
  let headers = {
    'Accept': 'application/json'
  };
  if (extraHeaders) Object.assign(headers, extraHeaders);
  if (dataString) {
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(dataString);
  }
  const options = {
    hostname: 'localhost',
    port: port,
    path: path,
    method: 'DELETE',
    rejectUnauthorized: false,
    headers: headers
  };
  httpsRequest(options, dataString, (err, res, data) => {
    if (err) return callback(err);
    try {
      assert.strictEqual(res.statusCode, expectedStatus,
        `DELETE ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`);
      callback(null, { res, data });
    } catch(e) {
      callback(e);
    }
  });
}

// Variabili per salvare i cookie dal login da utilizzare per il logout
let authCookies = '';

// Sequenza dei test:
function runTests() {
  console.log("Inizio test API Auth...");

  // 1. Registrazione di un nuovo utente per test Auth
  // Generiamo dati univoci per evitare conflitti (409)
  const timestamp = Date.now();
  const newUser = {
    name: "AuthTestName",
    surname: "AuthTestSurname",
    username: "authtestuser_" + timestamp,
    email: "auth_" + timestamp + "@example.com",
    phone: "0987654321",
    password: "secret",  // password nota per i test
    user_type: "customer"
  };
  testPOSTWithHeaders('/registrazione', newUser, 200, (err, result) => {
    if (err) {
      console.error("Test POST /registrazione (per auth) fallito:", err.message);
    } else {
      console.log("Test POST /registrazione (per auth) superato.");
    }

    // 2. Login corretto usando le credenziali appena registrate
    // Il login richiede le proprietà "cred" e "pw"
    const loginPayload = {
      cred: newUser.username, // potresti anche usare l'email
      pw: newUser.password
    };
    testPOSTWithHeaders('/login', loginPayload, 200, (err, result) => {
      if (err) {
        console.error("Test POST /login (correct) fallito:", err.message);
      } else {
        console.log("Test POST /login (correct) superato.");
        // Salva i cookie dal login per il logout
        // I cookie impostati sono in result.res.headers["set-cookie"]
        if (result.res.headers["set-cookie"] && result.res.headers["set-cookie"].length > 0) {
          authCookies = result.res.headers["set-cookie"].join('; ');
          console.log("Cookie acquisiti per sessione:", authCookies);
        } else {
          console.warn("Nessun cookie trovato dalla risposta di login.");
        }
      }

      // 3. Test Login con password errata
      const wrongLoginPayload = {
        cred: newUser.username,
        pw: "wrongpassword"
      };
      testPOSTWithHeaders('/login', wrongLoginPayload, 401, (err, result) => {
        if (err) {
          console.error("Test POST /login (wrong password) fallito:", err.message);
        } else {
          console.log("Test POST /login (wrong password) superato.");
        }

        // 4. Test DELETE /logout, usando i cookie ottenuti dal login corretto
        // Se abbiamo i cookie, includili nell'header "Cookie"
        if (!authCookies) {
          console.error("Cookie non disponibili, impossibile testare il logout.");
          console.log("Test API Auth completati.");
          return;
        }
        testDELETEWithHeaders('/logout', null, 200, { "Cookie": authCookies }, (err, result) => {
          if (err) {
            console.error("Test DELETE /logout fallito:", err.message);
          } else {
            console.log("Test DELETE /logout superato.");
          }
          console.log("Test API Auth completati.");
        });
      });
    });
  });
}

// Avvia i test dopo alcuni secondi per essere certi che il server sia attivo
setTimeout(runTests, 2000);
