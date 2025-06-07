// test/api_basic.test.js
/**
 * Suite di test "Basic" che copre:
 * - GET "/" per la homepage
 * - GET "/registrazione" per ottenere la pagina di registrazione
 * - POST "/registrazione" per creare un nuovo utente "customer"
 */

const https = require('https');
const assert = require('assert');

const port = 3000; // Il server è raggiungibile su https://localhost:3000

// Funzione di utilità per inviare una richiesta HTTPS
function httpsRequest(options, postData, callback) {
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => { callback(null, res, data); });
  });
  req.on('error', err => { callback(err); });
  if (postData) {
    req.write(postData);
  }
  req.end();
}

// Funzione GET con follow dei redirect (fino a 5 livelli)
function testGET(path, expectedStatus, callback, redirectCount = 0) {
  const options = {
    hostname: 'localhost',
    port: port,
    path: path,
    method: 'GET',
    rejectUnauthorized: false,
    headers: { 'Accept': 'application/json' }
  };

  httpsRequest(options, null, (err, res, data) => {
    if (err) return callback(err);
    if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && redirectCount < 5) {
      // Segue il redirect; la location può essere un URL o un percorso relativo
      return testGET(res.headers.location, expectedStatus, callback, redirectCount + 1);
    }
    try {
      assert.strictEqual(res.statusCode, expectedStatus, `GET ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`);
      callback(null, data);
    } catch(e) {
      callback(e);
    }
  });
}

// Funzione POST per inviare dati in JSON
function testPOST(path, payload, expectedStatus, callback) {
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
      assert.strictEqual(res.statusCode, expectedStatus, `POST ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`);
      callback(null, data);
    } catch(e) {
      callback(e);
    }
  });
}

// Esecuzione dei test in sequenza
function runTests() {
  console.log("Inizio test API Basic (Homepage & Registrazione)...");

  // 1. Test GET "/" – Homepage (ci aspettiamo 200)
  testGET('/', 200, (err, data) => {
    if (err) {
      console.error("Test GET / fallito:", err.message);
    } else {
      console.log("Test GET / superato.");
    }
    
    // 2. Test GET "/registrazione" – Page di registrazione (ci aspettiamo 200)
    testGET('/registrazione', 200, (err, data) => {
      if (err) {
        console.error("Test GET /registrazione fallito:", err.message);
      } else {
        console.log("Test GET /registrazione superato.");
      }
      
      // 3. Test POST "/registrazione" – Registrazione di un nuovo utente (customer)
      // Generiamo username ed email univoci per evitare conflitti (409)
      const timestamp = Date.now();
      const newUser = {
        name: "TestName",
        surname: "TestSurname",
        username: "testuser_" + timestamp,
        email: "test_" + timestamp + "@example.com",
        phone: "1234567890",
        password: "secret",
        user_type: "customer"
      };
      testPOST('/registrazione', newUser, 200, (err, data) => {
        if (err) {
          console.error("Test POST /registrazione fallito:", err.message);
        } else {
          try {
            const jsonResponse = JSON.parse(data);
            // Per customer, il server restituisce un JSON vuoto ( {} )
            assert.deepStrictEqual(jsonResponse, {}, "Risposta diversa da {}");
            console.log("Test POST /registrazione superato.");
          } catch(e) {
            console.error("Errore di parsing della risposta POST /registrazione:", e.message);
          }
        }
        console.log("Test API Basic completati.");
      });
    });
  });
}

// Avvia i test dopo un breve ritardo per garantire che il server sia attivo
setTimeout(runTests, 2000);
