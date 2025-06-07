// run_backend_tests.js
// Questo script esegue dei test sulle funzioni del backend e genera un report HTML
// nella directory principale (root del progetto).

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Importa i moduli dal backend (il percorso risale alla cartella backend)
const tokenModule = require('../backend/token');         // Esporta: createAccessToken, createRefreshToken, checkToken, renewToken, registerToken
const reportsModule = require('../backend/reports');       // Esporta: addReport, getReports, removeReport, removeReportedProduct, banArtigiano
const productsModule = require('../backend/products');     // Esporta: addProduct, removeProduct, getProducts, editProduct, addCart, decrCart, removeCart, getCart, emptyCart
// Inserisci altri moduli se necessari

// Definiamo un dummyPool per simulare le query al database (dummy, minimal)
const dummyPool = {
  async query(query, params) {
    // Se la query contiene "SELECT * FROM reftok", simuliamo di aver trovato il token
    if (query.includes("SELECT * FROM reftok")) {
      return { rows: [{ token: params[0] }] };
    }
    // Altrimenti, per INSERT, UPDATE o altre query, restituisce un oggetto con rows vuote
    return { rows: [] };
  }
};

// Array per raccogliere i risultati dei test
let tests = [];

// Funzione helper per registrare i risultati
function recordResult(name, status, message = '') {
  tests.push({ name, status, message });
}

// Funzione per generare il report HTML
function generateHTMLReport(results) {
  let html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Report Backend API</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { text-align: center; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      th { background-color: #f0f0f0; }
      .passed { color: green; font-weight: bold; }
      .failed { color: red; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>Report Backend API</h1>
    <h2>Summary</h2>
    <table>
      <tr>
        <th>Test</th>
        <th>Status</th>
        <th>Message</th>
      </tr>`;
  results.forEach(result => {
    html += `
      <tr>
        <td>${result.name}</td>
        <td class="${result.status === 'Passed' ? 'passed' : 'failed'}">${result.status}</td>
        <td>${result.message}</td>
      </tr>`;
  });
  html += `
    </table>
  </body>
</html>`;
  return html;
}

/* ============================
   TEST DELLE FUNZIONI DI TOKEN
   ============================ */

// 1. Test per createAccessToken
function testCreateAccessToken() {
  let user = { uid: 1, usertype: "customer" };
  let token = tokenModule.createAccessToken(user);
  assert.ok(typeof token === "string", "L'access token deve essere una stringa");

  // Verifica decodificando il token
  const jwt = require('jsonwebtoken');
  let decoded = jwt.verify(token, "chiaveesempio");
  assert.strictEqual(decoded.uid, user.uid, "Uid decodificato non corrisponde");
  return "createAccessToken passed";
}

// 2. Test per createRefreshToken
function testCreateRefreshToken() {
  let user = { uid: 2, usertype: "customer" };
  let token = tokenModule.createRefreshToken(user);
  assert.ok(typeof token === "string", "Il refresh token deve essere una stringa");
  const jwt = require('jsonwebtoken');
  let decoded = jwt.verify(token, "chiaveesempiomapiubrutta");
  assert.strictEqual(decoded.uid, user.uid, "Uid decodificato non corrisponde nel refresh token");
  return "createRefreshToken passed";
}

// 3. Test per checkToken
function testCheckToken() {
  let user = { uid: 3, usertype: "customer" };
  let accessToken = tokenModule.createAccessToken(user);

  let req = { cookies: { accessToken: accessToken } };
  // Creiamo una response dummy
  let res = {
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.jsonObj = obj; return this; }
  };

  let result = tokenModule.checkToken(req, res, false);
  assert.ok(result && result.uid === user.uid, "checkToken non ha restituito l'utente previsto");
  return "checkToken passed";
}

// 4. Test per renewToken (asincrono)
async function testRenewToken() {
  let user = { uid: 4, usertype: "customer" };
  let refreshToken = tokenModule.createRefreshToken(user);
  let req = { cookies: { refreshToken: refreshToken } };
  let res = {
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.jsonObj = obj; return this; }
  };
  let newToken = await tokenModule.renewToken(req, res, dummyPool);
  assert.ok(typeof newToken === "string", "renewToken non ha restituito una stringa");
  return "renewToken passed";
}

// 5. Test per registerToken (asincrono)
async function testRegisterToken() {
  let dummyUserResult = { rows: [{ uid: 5, usertype: "customer", password: "secret" }] };
  let tokens = await tokenModule.registerToken(dummyUserResult, dummyPool);
  assert.ok(tokens && typeof tokens.access === "string", "registerToken non ha restituito un access token valido");
  assert.ok(tokens && typeof tokens.refresh === "string", "registerToken non ha restituito un refresh token valido");
  return "registerToken passed";
}

/* ============================
   TEST DELLE FUNZIONI DI REPORTS
   ============================ */
async function testAddReport() {
  let result = await reportsModule.addReport(dummyPool, 1, 1, "spam", "report test");
  assert.strictEqual(result, 0, "addReport dovrebbe restituire 0 in caso di successo");
  return "addReport passed";
}

async function testGetReports() {
  let rep = await reportsModule.getReports(dummyPool);
  assert.ok(Array.isArray(rep), "getReports dovrebbe restituire un array");
  return "getReports passed";
}

/* ============================
   TEST DELLE FUNZIONI DI PRODOTTI
   ============================ */
async function testAddProduct() {
  let req = {
    body: {
      name: "Prodotto Test",
      descr: "Descrizione",
      price: 100,
      amm: 10,
      cat: "Categoria1"
    }
  };
  let result = await productsModule.addProduct(req, 1, dummyPool);
  assert.strictEqual(result, 0, "addProduct non ha restituito 0");
  return "addProduct passed";
}

async function testAddCart() {
  let result = await productsModule.addCart(dummyPool, 1, 1);
  assert.strictEqual(result, 0, "addCart non ha restituito 0");
  return "addCart passed";
}

/* ============================
   ESECUZIONE DEI TEST
   ============================ */
async function runBackendTests() {
  // Test delle funzioni TOKEN
  try {
    recordResult("testCreateAccessToken", "Passed", testCreateAccessToken());
  } catch (e) {
    recordResult("testCreateAccessToken", "Failed", e.toString());
  }
  try {
    recordResult("testCreateRefreshToken", "Passed", testCreateRefreshToken());
  } catch (e) {
    recordResult("testCreateRefreshToken", "Failed", e.toString());
  }
  try {
    recordResult("testCheckToken", "Passed", testCheckToken());
  } catch(e) {
    recordResult("testCheckToken", "Failed", e.toString());
  }
  try {
    let r = await testRenewToken();
    recordResult("testRenewToken", "Passed", r);
  } catch (e) {
    recordResult("testRenewToken", "Failed", e.toString());
  }
  try {
    let r = await testRegisterToken();
    recordResult("testRegisterToken", "Passed", r);
  } catch (e) {
    recordResult("testRegisterToken", "Failed", e.toString());
  }

  // Test delle funzioni REPORTS
  try {
    let r = await testAddReport();
    recordResult("testAddReport", "Passed", r);
  } catch(e) {
    recordResult("testAddReport", "Failed", e.toString());
  }
  try {
    let r = await testGetReports();
    recordResult("testGetReports", "Passed", r);
  } catch(e) {
    recordResult("testGetReports", "Failed", e.toString());
  }

  // Test delle funzioni PRODOTTI
  try {
    let r = await testAddProduct();
    recordResult("testAddProduct", "Passed", r);
  } catch(e) {
    recordResult("testAddProduct", "Failed", e.toString());
  }
  try {
    let r = await testAddCart();
    recordResult("testAddCart", "Passed", r);
  } catch(e) {
    recordResult("testAddCart", "Failed", e.toString());
  }

  // Generazione del report HTML nella directory principale (root)
  const reportHTML = generateHTMLReport(tests);
  const outputFile = path.join(__dirname, '..', 'report-backend.html');
  fs.writeFileSync(outputFile, reportHTML, 'utf8');
  console.log(`Report Backend generato: ${outputFile}`);
}

// Avvio dei test
runBackendTests();
