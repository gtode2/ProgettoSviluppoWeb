/**
 * Suite di test "prodotti" per la gestione dei prodotti (endpoint riservati agli artigiani)
 * Copre:
 * - Registrazione di un nuovo artigiano (POST "/registrazione")
 * - Completamento della registrazione artigiana (POST "/RegAct")
 * - Login come artigiano (POST "/login")
 * - Aggiunta di un prodotto (POST "/addProduct")
 * - Recupero dei prodotti (POST "/product")
 * - Aggiornamento di un prodotto (PATCH "/product")
 * - Eliminazione di un prodotto (DELETE "/product")
 */

const https = require('https');
const assert = require('assert');

const port = 3000; // L'applicazione è in ascolto su https://localhost:3000

// Funzione di utilità per effettuare richieste HTTPS generiche
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

// Funzione POST che restituisce anche gli header (utile per gestire i cookie)
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

// Funzione PATCH per aggiornare risorse
function testPATCHWithHeaders(path, payload, expectedStatus, headersExtra, callback) {
  const dataString = JSON.stringify(payload);
  const headers = Object.assign({
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(dataString)
  }, headersExtra || {});
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

// Funzione DELETE per effettuare richieste DELETE (con possibilità di inviare payload e header)
function testDELETEWithHeaders(path, payload, expectedStatus, headersExtra, callback) {
  let dataString = payload ? JSON.stringify(payload) : null;
  const headers = Object.assign({
    'Accept': 'application/json'
  }, headersExtra || {});
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
      assert.strictEqual(res.statusCode, expectedStatus, `DELETE ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`);
      callback(null, { res, data });
    } catch(e) {
      callback(e);
    }
  });
}

// Variabili per memorizzare lo stato nel flusso di test
let artisanCookies = '';       // Per salvare i cookie della sessione artigiana
let artisanUser = {};          // Per salvare username e password
let productId = null;          // Per memorizzare l'id del prodotto aggiunto

// Sequenza dei test da eseguire in serie:
function runTests() {
  console.log("Inizio test API Product (Artigiano)...");

  // 1. Registrazione di un nuovo artigiano
  const timestamp = Date.now();
  artisanUser = {
    name: "ArtigianoTest",
    surname: "User",
    username: "artigianotest_" + timestamp,
    email: "artigiano_" + timestamp + "@example.com",
    phone: "5551112222",
    password: "secret",
    user_type: "artigiano"
  };
  testPOSTWithHeaders('/registrazione', artisanUser, 200, (err, result) => {
    if (err) {
      console.error("Test POST /registrazione (artigiano) fallito:", err.message);
      return;
    }
    console.log("Test POST /registrazione (artigiano) superato.");
    // La risposta dovrebbe contenere { redirect: '/regAct' } per gli artigiani
    try {
      const body = JSON.parse(result.data);
      assert.strictEqual(body.redirect, '/regAct', "Redirect non corrisponde a '/regAct'");
    } catch(e) {
      console.error("Errore parsing risposta registrazione artigiana:", e.message);
    }

    // 2. Completamento della registrazione artigiana tramite POST /RegAct
    // Inviaamo dati minimi per completare la registrazione dell'attività
    const regActPayload = {
      name: "AttivitaTest",
      email: "attivita_" + timestamp + "@example.com",
      phone: "5550001111",
      address: "Via dei Test, 1",
      desc: "Attività di test per artigiano"
    };
    // Per /RegAct il token viene prelevato dai cookie inviati alla registrazione
    // Qui riutilizziamo gli stessi cookie eventualmente impostati (se presenti)
    artisanCookies = result.res.headers["set-cookie"] ? result.res.headers["set-cookie"].join('; ') : '';
    testPOSTWithHeaders('/RegAct', regActPayload, 200, (err, result2) => {
      if (err) {
        console.error("Test POST /RegAct fallito:", err.message);
        return;
      }
      console.log("Test POST /RegAct superato.");

      // 3. Login come artigiano
      const loginPayload = {
        cred: artisanUser.username,
        pw: artisanUser.password
      };
      testPOSTWithHeaders('/login', loginPayload, 200, (err, result3) => {
        if (err) {
          console.error("Test POST /login (artigiano) fallito:", err.message);
          return;
        }
        console.log("Test POST /login (artigiano) superato.");
        // Aggiorniamo i cookie della sessione artigiana
        artisanCookies = result3.res.headers["set-cookie"] ? result3.res.headers["set-cookie"].join('; ') : artisanCookies;
        // 4. Aggiunta di un prodotto (POST /addProduct)
        // Inviamo un payload fittizio; i campi richiesti dipendono da addProduct (si assume che "name" ed eventualmente "price" siano sufficienti)
        const productPayload = {
          name: "Prodotto Test",
          price: 100,
          description: "Descrizione di prodotto di test"
        };
        testPOSTWithHeaders('/addProduct', productPayload, 200, (err, result4) => {
          if (err) {
            console.error("Test POST /addProduct fallito:", err.message);
            return;
          }
          console.log("Test POST /addProduct superato.");

          // 5. Recupero dei prodotti (POST /product)
          // Chiamata senza "id" per ottenere la lista dei prodotti; se loggato come artigiano verrà aggiunto internamente filters.produttore = artisan uid
          // In questo test non inviamo payload, quindi inviamo {}
          testPOSTWithHeaders('/product', {}, 200, (err, result5) => {
            if (err) {
              console.error("Test POST /product (get list) fallito:", err.message);
              return;
            }
            console.log("Test POST /product (get list) superato.");
            let productsData;
            try {
              productsData = JSON.parse(result5.data);
              // Ci aspettiamo un oggetto con proprietà "prodotti" (lista)
              assert.ok(Array.isArray(productsData.prodotti), "prodotti non è un array");
              if (productsData.prodotti.length === 0) {
                console.warn("Nessun prodotto trovato nella lista.");
                return;
              }
              // Prendiamo il primo prodotto e salviamo il suo id
              productId = productsData.prodotti[0].id;
              console.log("Prodotto trovato, id:", productId);
            } catch(e) {
              console.error("Errore parsing risposta POST /product:", e.message);
              return;
            }

            // 6. Aggiornamento del prodotto (PATCH /product)
            const updatePayload = {
              id: productId,
              name: "Prodotto Test Modificato"
              // Altri campi possono essere eventualmente aggiornati
            };
            // Utilizziamo i cookie di sessione artigiana
            testPATCHWithHeaders('/product', updatePayload, 200, { "Cookie": artisanCookies }, (err, result6) => {
              if (err) {
                console.error("Test PATCH /product fallito:", err.message);
                return;
              }
              console.log("Test PATCH /product superato.");

              // 7. Eliminazione del prodotto (DELETE /product)
              // Inviaamo nel body { pid: productId }
              const deletePayload = { pid: productId };
              testDELETEWithHeaders('/product', deletePayload, 200, { "Cookie": artisanCookies }, (err, result7) => {
                if (err) {
                  console.error("Test DELETE /product fallito:", err.message);
                  return;
                }
                console.log("Test DELETE /product superato.");
                console.log("Test API Product completati.");
              });
            });
          });
        });
      });
    });
  });
}

// Avvia la suite di test con un breve ritardo per essere sicuro che il server sia attivo
setTimeout(runTests, 3000);
