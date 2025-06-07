/**
 * Suite di test "Order" per la gestione degli ordini, dedicata agli utenti di tipo customer.
 * Copre:
 * - GET "/checkout": verifica che la pagina di checkout venga servita (HTML)
 * - POST "/checkout": in assenza di prodotti nel carrello, ci aspettiamo l'errore "empty"
 * - POST "/order": senza fornire un id, deve restituire la lista degli ordini (probabilmente vuota)
 * - GET "/order": senza parametro id, dovrebbe comportarsi con un redirect (dato che l'id non è trovato)
 * - PATCH "/order": inviato come customer (anziché artigiano) deve restituire 401 per autorizzazione
 */

const https = require('https');
const assert = require('assert');

const port = 3000; // Il server è in ascolto su https://localhost:3000

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

// Funzione POST che restituisce anche gli header (per gestire i cookie)
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
      assert.strictEqual(res.statusCode, expectedStatus, `POST ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`);
      callback(null, { res, data });
    } catch(e) {
      callback(e);
    }
  });
}

// Funzione GET per effettuare richieste e restituire i dati; è possibile includere header extra (ad esempio i Cookie)
function testGET(path, expectedStatus, extraHeaders, callback) {
  const headers = Object.assign({ 'Accept': 'text/html' }, extraHeaders || {});
  const options = {
    hostname: 'localhost',
    port: port,
    path: path,
    method: 'GET',
    rejectUnauthorized: false,
    headers: headers
  };
  httpsRequest(options, null, (err, res, data) => {
    if (err) return callback(err);
    try {
      assert.strictEqual(res.statusCode, expectedStatus, `GET ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`);
      callback(null, data);
    } catch(e) {
      callback(e);
    }
  });
}

// Funzione PATCH per aggiornare una risorsa
function testPATCHWithHeaders(path, payload, expectedStatus, extraHeaders, callback) {
  const dataString = JSON.stringify(payload);
  const headers = Object.assign({
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(dataString)
  }, extraHeaders || {});
  const options = {
    hostname: 'localhost',
    port: port,
    path: path,
    method: 'PATCH',
    rejectUnauthorized: false,
    headers: headers
  };
  httpsRequest(options, dataString, (err, res, data) => {
    if (err) return callback(err);
    try {
      assert.strictEqual(res.statusCode, expectedStatus, `PATCH ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`);
      callback(null, { res, data });
    } catch(e) {
      callback(e);
    }
  });
}

// Variabili per mantenere lo stato nella suite di test degli ordini
let orderCustomerCookies = '';
let orderCustomerUser = {};

// Funzione per registrare e loggare un nuovo utente customer (per gli ordini)
function registerAndLoginCustomer(callback) {
  const timestamp = Date.now();
  orderCustomerUser = {
    name: "OrderTest",
    surname: "User",
    username: "ordertestuser_" + timestamp,
    email: "order_" + timestamp + "@example.com",
    phone: "7778889999",
    password: "secret",
    user_type: "customer"
  };
  // Registrazione
  testPOSTWithHeaders('/registrazione', orderCustomerUser, 200, (err, result) => {
    if (err) {
      console.error("Registrazione customer (order) fallita:", err.message);
      return callback(err);
    }
    console.log("Registrazione customer (order) superata.");
    // Login
    const loginPayload = {
      cred: orderCustomerUser.username,
      pw: orderCustomerUser.password
    };
    testPOSTWithHeaders('/login', loginPayload, 200, (err, loginResult) => {
      if (err) {
        console.error("Login customer (order) fallito:", err.message);
        return callback(err);
      }
      console.log("Login customer (order) superato.");
      if (loginResult.res.headers["set-cookie"]) {
        orderCustomerCookies = loginResult.res.headers["set-cookie"].join('; ');
        console.log("Cookie di sessione acquisiti:", orderCustomerCookies);
      }
      callback(null);
    });
  });
}

// Sequenza dei test per gli endpoint degli ordini
function runTests() {
  console.log("Inizio test API Order (Customer)...");

  // 1. Registrazione e login
  registerAndLoginCustomer((err) => {
    if (err) return console.error("Errore durante registrazione/login (order):", err.message);

    // 2. GET "/checkout" – Verifica che la pagina di checkout venga servita (status 200, HTML)
    testGET('/checkout', 200, { "Cookie": orderCustomerCookies }, (err, data) => {
      if (err) {
        console.error("Test GET /checkout fallito:", err.message);
      } else {
        console.log("Test GET /checkout superato.");
      }

      // 3. POST "/checkout" – Con carrello vuoto, ci aspettiamo 404 con JSON { err: "empty" }
      testPOSTWithHeaders('/checkout', {}, 404, (err, dataResult) => {
        if (err) {
          console.error("Test POST /checkout fallito:", err.message);
        } else {
          try {
            const jsonData = JSON.parse(dataResult.data);
            assert.strictEqual(jsonData.err, "empty", "Messaggio errato per carrello vuoto");
            console.log("Test POST /checkout (carrello vuoto) superato.");
          } catch(e) {
            console.error("Errore parsing POST /checkout:", e.message);
          }
        }
  
        // 4. POST "/order" senza fornire un id, per ottenere la lista degli ordini
        testPOSTWithHeaders('/order', {}, 200, (err, orderResult) => {
          if (err) {
            console.error("Test POST /order (lista) fallito:", err.message);
          } else {
            try {
              const orderData = JSON.parse(orderResult.data);
              assert.ok(orderData.hasOwnProperty("ord"), "Proprietà 'ord' mancante nella risposta");
              // Per un utente nuovo, probabilmente argomento vuoto (array vuoto)
              console.log("Test POST /order (lista) superato. Risultato:", orderData);
            } catch(e) {
              console.error("Errore nel parsing della risposta POST /order:", e.message);
            }
          }
  
          // 5. GET "/order" senza parametro id – il server dovrebbe reindirizzare (redirect)
          testGET('/order', 302, { "Cookie": orderCustomerCookies }, (err, data) => {
            if (err) {
              console.error("Test GET /order (senza id) fallito:", err.message);
            } else {
              console.log("Test GET /order (senza id) superato.");
            }
  
            // 6. PATCH "/order" inviato come customer (non autorizzato per aggiornare ordini)
            // Inviamo un id arbitrario (es. 99999) e ci aspettiamo 401
            const patchPayload = { id: 99999 };
            testPATCHWithHeaders('/order', patchPayload, 401, { "Cookie": orderCustomerCookies }, (err, patchRes) => {
              if (err) {
                console.error("Test PATCH /order fallito:", err.message);
              } else {
                console.log("Test PATCH /order (non autorizzato come customer) superato.");
              }
              console.log("Test API Order completati.");
            });
          });
        });
      });
    });
  });
}

setTimeout(runTests, 2000);
