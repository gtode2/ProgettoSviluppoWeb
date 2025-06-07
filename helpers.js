// helpers.js

const https = require('https');
const assert = require('assert');

const port = 3000; // Assumi che il server sia in ascolto su https://localhost:3000

/**
 * httpsRequest: Funzione generica per effettuare una richiesta HTTPS.
 *
 * @param {Object} options - Le opzioni da passare a https.request (hostname, port, path, method, headers, etc.)
 * @param {string|null} postData - Il payload da inviare. Se nullo non viene inviato nulla.
 * @param {Function} callback - Funzione di callback che riceve (err, res, data)
 */
function httpsRequest(options, postData, callback) {
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => { callback(null, res, data); });
  });
  req.on('error', (err) => { callback(err); });
  if (postData) req.write(postData);
  req.end();
}

/**
 * testPOSTWithHeaders: Invia una richiesta POST con payload JSON e controlla lo status code.
 *
 * @param {string} path - Il percorso dell'endpoint (es. "/registrazione")
 * @param {Object} payload - L'oggetto che verrà serializzato in JSON e inviato come payload.
 * @param {number} expectedStatus - Lo status code atteso.
 * @param {Function} callback - Funzione di callback con (err, {res, data}).
 * @param {Object} extraHeaders - (Opzionale) Eventuali intestazioni extra da aggiungere (es. per inviare i cookie).
 */
function testPOSTWithHeaders(path, payload, expectedStatus, callback, extraHeaders = {}) {
  const dataString = JSON.stringify(payload);
  const options = {
    hostname: 'localhost',
    port,
    path,
    method: 'POST',
    rejectUnauthorized: false,
    headers: Object.assign({
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataString)
    }, extraHeaders)
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

/**
 * testGET: Esegue una richiesta GET e verifica lo status code atteso.
 *
 * @param {string} path - Il percorso (es. "/userArea")
 * @param {number} expectedStatus - Lo status code atteso.
 * @param {Object} extraHeaders - (Opzionale) Eventuali intestazioni extra (es. Cookie).
 * @param {Function} callback - Funzione di callback con (err, data).
 */
function testGET(path, expectedStatus, extraHeaders = {}, callback) {
  const options = {
    hostname: 'localhost',
    port,
    path,
    method: 'GET',
    rejectUnauthorized: false,
    headers: Object.assign({ 'Accept': 'text/html' }, extraHeaders)
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

/**
 * testPATCHWithHeaders: Invia una richiesta PATCH con payload JSON e verifica lo status code.
 *
 * @param {string} path - Il percorso (es. "/product")
 * @param {Object} payload - Il payload JSON da inviare.
 * @param {number} expectedStatus - Lo status code atteso.
 * @param {Object} extraHeaders - (Opzionale) Eventuali intestazioni extra (es. Cookie).
 * @param {Function} callback - Funzione di callback con (err, {res, data}).
 */
function testPATCHWithHeaders(path, payload, expectedStatus, extraHeaders = {}, callback) {
  const dataString = JSON.stringify(payload);
  const headers = Object.assign({
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(dataString)
  }, extraHeaders);
  const options = {
    hostname: 'localhost',
    port,
    path,
    method: 'PATCH',
    rejectUnauthorized: false,
    headers
  };
  httpsRequest(options, dataString, (err, res, data) => {
    if(err) return callback(err);
    try{
      assert.strictEqual(
        res.statusCode,
        expectedStatus,
        `PATCH ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`
      );
      callback(null, { res, data });
    } catch(e) {
      callback(e);
    }
  });
}

/**
 * testDELETEWithHeaders: Invia una richiesta DELETE e verifica lo status code atteso.
 *
 * @param {string} path - Il percorso (es. "/cart")
 * @param {Object|null} payload - (Opzionale) Payload da inviare.
 * @param {number} expectedStatus - Lo status code atteso.
 * @param {Object} extraHeaders - (Opzionale) Intestazioni extra (es. per Cookie).
 * @param {Function} callback - Funzione di callback con (err, {res, data}).
 */
function testDELETEWithHeaders(path, payload, expectedStatus, extraHeaders = {}, callback) {
  let dataString = payload ? JSON.stringify(payload) : null;
  const headers = Object.assign({ 'Accept': 'application/json' }, extraHeaders);
  if (dataString) {
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(dataString);
  }
  const options = {
    hostname: 'localhost',
    port,
    path,
    method: 'DELETE',
    rejectUnauthorized: false,
    headers
  };
  httpsRequest(options, dataString, (err, res, data) => {
    if(err) return callback(err);
    try {
      assert.strictEqual(
        res.statusCode,
        expectedStatus,
        `DELETE ${path} – atteso ${expectedStatus}, ricevuto ${res.statusCode}`
      );
      callback(null, { res, data });
    } catch(e) {
      callback(e);
    }
  });
}

module.exports = {
  port,
  httpsRequest,
  testPOSTWithHeaders,
  testGET,
  testPATCHWithHeaders,
  testDELETEWithHeaders
};
