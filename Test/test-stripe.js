/**
 * Suite di test "Stripe Webhook":
 * 
 * Verifica l'endpoint POST /stripe/webhook inviando un payload raw (stringa JSON)
 * con un header "stripe-signature" fittizio, in modo da simulare la verifica fallita.
 * Ci si aspetta che, per firma non valida, il server risponda con status 400.
 */

const { httpsRequest, port } = require('../helpers');
const assert = require('assert');
const https = require('https');

function runStripeWebhookTest(callback) {
  console.log("\n[Stripe Webhook] Inizio test Stripe Webhook...");

  // Creiamo un payload raw fittizio (come stringa)
  const payload = JSON.stringify({ test: "webhook" });
  
  // Configuriamo le opzioni per la richiesta POST verso /stripe/webhook.
  // Dato che nell'endpoint del server viene usato express.raw({ type: 'application/json' }),
  // inviamo il body come stringa raw e impostiamo il Content-Length corrispondente.
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/stripe/webhook',
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      // Impostiamo un header "stripe-signature" fittizio (non valido)
      'stripe-signature': 'invalid_signature'
    }
  };

  httpsRequest(options, payload, (err, res, data) => {
    if (err) {
      console.error("[Stripe Webhook] Richiesta fallita:", err.message);
      return callback(err);
    }
    try {
      // Ci aspettiamo che la verifica della firma fallisca e quindi
      // ottenendo uno status 400
      assert.strictEqual(res.statusCode, 400, `[Stripe Webhook] Atteso 400, ricevuto ${res.statusCode}`);
      console.log("[Stripe Webhook] Test superato (status 400 come atteso).");
    } catch(e) {
      console.error("[Stripe Webhook] Test fallito:", e.message);
    }
    callback(null);
  });
}

setTimeout(() => {
  runStripeWebhookTest(() => {
    console.log("Test API Stripe Webhook completato.");
  });
}, 2000);
