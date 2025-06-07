// test/api_ban.test.js
/**
 * Test Ban
 * 
 * Copre:
 * - POST /ban inviato da un utente non admin -> atteso 401
 */
const { testPOSTWithHeaders } = require('../helpers');

function runBanTests() {
  console.log("Inizio test API Ban...");
  // Per testare /ban, usiamo un utente "customer" già registrato in questa suite.
  // Qui non facciamo setup separato: ipotizziamo che POST /ban da customer restituisca 401
  testPOSTWithHeaders('/ban', {}, 401, (err) => {
    if (err) console.error("POST /ban fallito:", err.message);
    else console.log("POST /ban superato.");
  });
}

setTimeout(runBanTests, 2000);
