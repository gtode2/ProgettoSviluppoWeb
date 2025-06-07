// test/api_report.test.js
/**
 * Test Report
 * 
 * Copre:
 * - POST /report con payload mancante -> atteso 400
 * - POST /report con payload valido -> atteso 200
 * - GET /report come utente non admin -> atteso 401 con { err: "usertype" }
 * - PATCH /report come utente non admin -> atteso 401
 */

const { testPOSTWithHeaders, testGET, testPATCHWithHeaders } = require('../helpers');

// Per questi test usiamo un utente customer di prova.
let reportUser = {};
let reportUserCookies = '';

function registerAndLogin(callback) {
  const timestamp = Date.now();
  reportUser = {
    name: "ReportTest",
    surname: "User",
    username: "reportuser_" + timestamp,
    email: "report_" + timestamp + "@example.com",
    phone: "1112223333",
    password: "secret",
    user_type: "customer"
  };
  testPOSTWithHeaders('/registrazione', reportUser, 200, (err, regResult) => {
    if (err) return callback(err);
    const loginPayload = { cred: reportUser.username, pw: reportUser.password };
    testPOSTWithHeaders('/login', loginPayload, 200, (err, loginResult) => {
      if (err) return callback(err);
      if (loginResult.res.headers['set-cookie']) {
        reportUserCookies = loginResult.res.headers['set-cookie'].join('; ');
      }
      callback(null);
    });
  });
}

function runReportTests() {
  console.log("Inizio test API Report...");
  // Setup registrazione/login
  registerAndLogin((err) => {
    if (err) return console.error("Setup Report fallito:", err.message);

    // a) POST /report con payload mancante
    testPOSTWithHeaders('/report', {}, 400, (err) => {
      if (err) console.error("POST /report (payload mancante) fallito:", err.message);
      else console.log("POST /report (payload mancante) superato.");

      // b) POST /report con payload valido
      const validReport = { productid: 1, dove: "TestArea", desc: "Descrizione test report" };
      testPOSTWithHeaders('/report', validReport, 200, (err) => {
        if (err) console.error("POST /report (payload valido) fallito:", err.message);
        else console.log("POST /report (payload valido) superato.");

        // c) GET /report come non-admin -> atteso 401
        testGET('/report', 401, { "Cookie": reportUserCookies }, (err, data) => {
          if (err) console.error("GET /report fallito:", err.message);
          else {
            try {
              const jsonData = JSON.parse(data);
              if (jsonData.err === "usertype")
                console.log("GET /report (non admin) superato.");
              else console.error("GET /report: valore errato per err");
            } catch(e) {
              console.error("Parsing GET /report fallito:", e.message);
            }
          }

          // d) PATCH /report come non-admin -> atteso 401
          const patchPayload = { id: 1 };
          testPATCHWithHeaders('/report', patchPayload, 401, { "Cookie": reportUserCookies }, (err) => {
            if (err) console.error("PATCH /report fallito:", err.message);
            else console.log("PATCH /report (non admin) superato.");
          });
        });
      });
    });
  });
}

setTimeout(runReportTests, 2000);
