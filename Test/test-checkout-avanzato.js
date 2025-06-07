// test/api_checkoutAdvanced.test.js
/**
 * Suite di test "Checkout Advanced"
 * Copre:
 * - GET /success (status 200, pagina HTML)
 * - GET /cancel (status 200, pagina HTML)
 * - POST /confirmCheckout:
 *    a) Senza il campo "addr" → atteso 400
 *    b) Con "addr" fornito, ma senza ordine in DB → atteso 401 con JSON { err: "no order" }
 */

const { testGET, testPOSTWithHeaders } = require('../helpers');

let checkoutUser = {};
let checkoutUserCookies = '';

function registerAndLoginForCheckout(callback) {
  const timestamp = Date.now();
  checkoutUser = {
    name: "CheckoutTest",
    surname: "User",
    username: "checkoutuser_" + timestamp,
    email: "checkout_" + timestamp + "@example.com",
    phone: "6667778888",
    password: "secret",
    user_type: "customer"
  };
  testPOSTWithHeaders('/registrazione', checkoutUser, 200, (err) => {
    if (err) return callback(err);
    const loginPayload = { cred: checkoutUser.username, pw: checkoutUser.password };
    testPOSTWithHeaders('/login', loginPayload, 200, (err, loginResult) => {
      if (err) return callback(err);
      if (loginResult.res.headers["set-cookie"]) {
        checkoutUserCookies = loginResult.res.headers["set-cookie"].join('; ');
      }
      callback(null);
    });
  });
}

function runCheckoutAdvancedTests() {
  console.log("Inizio test API Checkout Advanced...");

  // 1. GET /success – atteso 200 (pagina HTML)
  testGET('/success', 200, {}, (err, data) => {
    if (err) console.error("[Checkout Advanced] GET /success fallito:", err.message);
    else console.log("[Checkout Advanced] GET /success superato.");

    // 2. GET /cancel – atteso 200 (pagina HTML)
    testGET('/cancel', 200, {}, (err, data) => {
      if (err) console.error("[Checkout Advanced] GET /cancel fallito:", err.message);
      else console.log("[Checkout Advanced] GET /cancel superato.");

      // 3. Setup per POST /confirmCheckout
      registerAndLoginForCheckout((err) => {
        if (err) {
          console.error("[Checkout Advanced] Setup registrazione/login fallito:", err.message);
          return;
        }
        // 3a. POST /confirmCheckout senza campo "addr" – atteso 400
        testPOSTWithHeaders('/confirmCheckout', {}, 400, (err, result) => {
          if (err) console.error("[Checkout Advanced] POST /confirmCheckout (missing addr) fallito:", err.message);
          else console.log("[Checkout Advanced] POST /confirmCheckout (missing addr) superato.");

          // 3b. POST /confirmCheckout con "addr" fornito; poiché non esiste un ordine, atteso 401 con { err: "no order" }
          const payload = { addr: "Via Test 1" };
          testPOSTWithHeaders('/confirmCheckout', payload, 401, (err, result) => {
            if (err) console.error("[Checkout Advanced] POST /confirmCheckout (no order) fallito:", err.message);
            else {
              try {
                const jsonData = JSON.parse(result.data);
                if (jsonData.err === "no order")
                  console.log("[Checkout Advanced] POST /confirmCheckout (no order) superato.");
                else
                  console.error("[Checkout Advanced] POST /confirmCheckout (no order) errore: messaggio errato.");
              } catch(e) {
                console.error("[Checkout Advanced] Parsing POST /confirmCheckout fallito:", e.message);
              }
            }
          });
        });
      });
    });
  });
}

setTimeout(runCheckoutAdvancedTests, 2000);
