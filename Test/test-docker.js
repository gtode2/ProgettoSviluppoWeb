// test/test-docker.js
"use strict";

const { execSync } = require("child_process");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Funzione per eseguire un comando in modalità sincrona
function runCommand(command) {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (err) {
    console.error(`Errore nell'eseguire il comando '${command}':`, err);
    process.exit(1);
  }
}

// 1. Avvio dei servizi utilizzando docker-compose
console.log("Avvio dei servizi con docker-compose...");
runCommand("docker-compose up -d");

// 2. Funzione per attendere che l'app sia pronta controllando l'endpoint /health tramite https
function waitForHealth(url, callback) {
  const options = {
    rejectUnauthorized: false // Per accettare certificati self-signed
  };
  const request = https.get(url, options, (res) => {
    if (res.statusCode === 200) {
      callback(true);
    } else {
      callback(false);
    }
    res.resume(); // Consuma il response body
  });
  request.on("error", () => {
    callback(false);
  });
}

function waitForContainerReady(url, intervalMs, timeoutMs) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    function check() {
      waitForHealth(url, (ready) => {
        if (ready) {
          console.log("Servizio app pronto.");
          resolve();
        } else if (Date.now() - start > timeoutMs) {
          reject(new Error("Timeout in attesa dell'health check."));
        } else {
          setTimeout(check, intervalMs);
        }
      });
    }
    check();
  });
}

async function runTests() {
  // 3. Attesa che l'app sia pronta (health check su https://localhost:3000/health)
  console.log("Attesa che l'app sia pronta (controllo /health su https://localhost:3000/health)...");
  try {
    await waitForContainerReady("https://localhost:3000/health", 1000, 30000);
  } catch (err) {
    console.error("Il container non è risultato pronto:", err);
    runCommand("docker-compose down");
    process.exit(1);
  }
  
  // 4. Esecuzione dei test di integrazione
  console.log("Esecuzione dei test di integrazione...");
  try {
    runCommand("npm run test:integration");
  } catch (err) {
    console.error("I test di integrazione hanno fallito:", err);
  }
  
  // 5. Arresto dei container
  console.log("Arresto dei servizi con docker-compose down...");
  runCommand("docker-compose down");

  // 6. Generazione del report HTML.
  const reportContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Deployment Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; }
          p { font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>Deployment Test Report</h1>
        <p>I test di integrazione sono stati eseguiti. Controlla i log per i dettagli.</p>
      </body>
    </html>
  `;
  
  // Salva il report nella directory principale (la directory superiore rispetto a "test")
  const outputFile = path.join(__dirname, "..", "report-deployment.html");
  fs.writeFileSync(outputFile, reportContent, "utf8");
  console.log(`Report generato: ${outputFile}`);
}

runTests();
