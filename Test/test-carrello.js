const https = require('https');
const assert = require('assert');

const port = 3000; // Il server è attivo su https://localhost:3000

// Funzione di utilità per richieste HTTPS generiche
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

// Funzione per le richieste POST che restituisce anche gli header
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
      assert.strictEqual(
        res.statusCode,
        expectedStatus,
        `POST ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`
      );
      callback(null, { res, data });
    } catch (e) {
      callback(e);
    }
  });
}

// Funzione per le richieste GET
function testGET(path, expectedStatus, extraHeaders, callback) {
  const options = {
    hostname: 'localhost',
    port: port,
    path: path,
    method: 'GET',
    rejectUnauthorized: false,
    headers: Object.assign({ 'Accept': 'application/json' }, extraHeaders || {})
  };
  httpsRequest(options, null, (err, res, data) => {
    if (err) return callback(err);
    try {
      assert.strictEqual(
        res.statusCode,
        expectedStatus,
        `GET ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`
      );
      callback(null, data);
    } catch (e) {
      callback(e);
    }
  });
}

// Funzione per le richieste DELETE che permette di inviare header
function testDELETEWithHeaders(path, payload, expectedStatus, extraHeaders, callback) {
  let dataString = payload ? JSON.stringify(payload) : null;
  const headers = Object.assign({ 'Accept': 'application/json' }, extraHeaders || {});
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
      assert.strictEqual(
        res.statusCode,
        expectedStatus,
        `DELETE ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`
      );
      callback(null, { res, data });
    } catch (e) {
      callback(e);
    }
  });
}

// Variabili per memorizzare lo stato nel flusso di test
let customerCookies = ''; // Per salvare i cookie della sessione customer
let customerUser = {};    // Per salvare i dati di login
// Per il test del carrello, useremo un product id fittizio (ad es. "1")
const testProductId = 1;

// Funzione di registrazione e login per customer
function registerAndLoginCustomer(callback) {
  const timestamp = Date.now();
  customerUser = {
    name: "CartTest",
    surname: "User",
    username: "carttestuser_" + timestamp,
    email: "carttest_" + timestamp + "@example.com",
    phone: "1112223333",
    password: "secret",
    user_type: "customer"
  };
  // Registrazione
  testPOSTWithHeaders('/registrazione', customerUser, 200, (err, result) => {
    if (err) {
      console.error("Registrazione customer fallita:", err.message);
      return callback(err);
    }
    console.log("Registrazione customer superata.");
    // Login
    const loginPayload = {
      cred: customerUser.username,
      pw: customerUser.password
    };
    testPOSTWithHeaders('/login', loginPayload, 200, (err, loginResult) => {
      if (err) {
        console.error("Login customer fallito:", err.message);
        return callback(err);
      }
      console.log("Login customer superato.");
      if (loginResult.res.headers["set-cookie"]) {
        customerCookies = loginResult.res.headers["set-cookie"].join('; ');
        console.log("Cookie di sessione acquisiti:", customerCookies);
      }
      callback(null);
    });
  });
}

// Sequenza dei test per il carrello
function runTests() {
  console.log("Inizio test API Cart...");

  // 1. Registrazione e login di un nuovo utente customer
  registerAndLoginCustomer((err) => {
    if (err) return console.error("Errore nella registrazione/login:", err.message);

    // 2. Test POST /cart senza fornire il campo "id" (manca il prodotto) -> atteso 400
    testPOSTWithHeaders('/cart', {}, 400, (err, result) => {
      if (err) {
        console.error("Test POST /cart (missing id) fallito:", err.message);
      } else {
        console.log("Test POST /cart (missing id) superato.");
      }

      // 3. Test POST /cart con un id fittizio (es. 1) e senza parametro "dec".
      // Se il prodotto non esiste, secondo la logica prevista, il server dovrebbe rispondere con 404.
      testPOSTWithHeaders('/cart', { id: testProductId }, 404, (err, result) => {
        if (err) {
          console.error("Test POST /cart (aggiunta con id fittizio) fallito:", err.message);
        } else {
          console.log("Test POST /cart (aggiunta/incremento con id fittizio) superato.");
        }
  
        // 4. Test POST /cart con un parametro "dec" non valido (es. "x") -> atteso 400
        testPOSTWithHeaders('/cart', { id: testProductId, dec: "x" }, 400, (err, result) => {
          if (err) {
            console.error("Test POST /cart (invalid dec) fallito:", err.message);
          } else {
            console.log("Test POST /cart (invalid dec) superato.");
          }
  
          // 5. Test GET /cart – dovrebbe restituire il carrello, anche se probabilmente vuoto (atteso 200)
          testGET('/cart', 200, { "Cookie": customerCookies }, (err, data) => {
            if (err) {
              console.error("Test GET /cart fallito:", err.message);
            } else {
              try {
                const jsonData = JSON.parse(data);
                assert.ok(jsonData.hasOwnProperty("carrello"), "La risposta non contiene la proprietà 'carrello'");
                console.log("Test GET /cart superato.");
              } catch(e) {
                console.error("Errore parsing GET /cart:", e.message);
              }
            }
  
            // 6. Test DELETE /cart per svuotare il carrello (atteso 200)
            testDELETEWithHeaders('/cart', null, 200, { "Cookie": customerCookies }, (err, result) => {
              if (err) {
                console.error("Test DELETE /cart fallito:", err.message);
              } else {
                console.log("Test DELETE /cart superato.");
              }
              console.log("Test API Cart completati.");
            });
          });
        });
      });
    });
  });
}

setTimeout(runTests, 2000);