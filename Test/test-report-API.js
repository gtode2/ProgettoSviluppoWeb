// run_all_tests.js
/**
 * Questo script esegue in sequenza tutti i file di test dell'API e, al termine,
 * genera un file HTML ("report-API.html") contenente un riepilogo dei risultati.
 *
 * I file di test da eseguire sono:
 *   1. test-report-home_reg.js
 *   2. test-authentication.js
 *   3. test-prodotti.js
 *   4. test-carrello.js
 *   5. test-ordini.js
 *   6. test-report.js
 *   7. test-ban.js
 *   8. test-cambiapassword.js
 *   9. test-updateUser.js
 *  10. test-userArea.js
 *  11. test-artigiano.js
 *  12. test-token.js
 *  13. test-checkout-avanzato.js
 *  14. test-stripe.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Elenco dei file di test, usando i nomi indicati.
const testFiles = [
  'test/test-report-home_reg.js',
  'test/test-authentication.js',
  'test/test-prodotti.js',
  'test/test-carrello.js',
  'test/test-ordini.js',
  'test/test-report.js',
  'test/test-ban.js',
  'test/test-cambiapassword.js',
  'test/test-updateUser.js',
  'test/test-userArea.js',
  'test/test-artigiano.js',
  'test/test-token.js',
  'test/test-checkout-avanzato.js',
  'test/test-stripe.js'
];

/**
 * Esegue un file di test usando `node <file>` e restituisce una Promise
 * che risolve un oggetto contenente il nome del file, stdout, stderr ed eventuale errore.
 */
function runTestFile(file) {
  return new Promise((resolve) => {
    exec(`node ${file}`, (error, stdout, stderr) => {
      resolve({
        file,
        stdout,
        stderr,
        error
      });
    });
  });
}

/**
 * Esegue in sequenza tutti i file di test e restituisce un array dei risultati.
 */
async function runAllTests() {
  const results = [];
  for (const file of testFiles) {
    console.log(`Esecuzione di ${file}...`);
    // Attende l'esecuzione del file corrente
    const result = await runTestFile(file);
    results.push(result);
  }
  return results;
}

/**
 * Genera un report HTML a partire dai risultati ottenuti.
 */
function generateHTMLReport(results) {
  let html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Report API</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; }
        .passed { color: green; font-weight: bold; }
        .failed { color: red; font-weight: bold; }
        .test { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; }
        pre { background-color: #f8f8f8; padding: 10px; border-radius: 5px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>Report API</h1>
      <h2>Summary</h2>
      <table>
        <tr>
          <th>File di Test</th>
          <th>Status</th>
        </tr>
  `;

  for (const result of results) {
    const status = (result.error || result.stderr.trim().length > 0) ? 'Failed' : 'Passed';
    html += `
      <tr>
        <td>${result.file}</td>
        <td class="${status === 'Passed' ? 'passed' : 'failed'}">${status}</td>
      </tr>
    `;
  }

  html += `</table>`;

  results.forEach(result => {
    const status = (result.error || result.stderr.trim().length > 0) ? 'Failed' : 'Passed';
    html += `
      <div class="test">
        <h3>${result.file} - <span class="${status === 'Passed' ? 'passed' : 'failed'}">${status}</span></h3>
        <h4>Output:</h4>
        <pre>${result.stdout}</pre>
        ${ result.stderr.trim() ? `<h4>Errori:</h4><pre>${result.stderr}</pre>` : '' }
        ${ result.error ? `<h4>Errore:</h4><pre>${result.error}</pre>` : '' }
      </div>
    `;
  });

  html += `
    </body>
  </html>
  `;
  return html;
}

// Funzione principale che esegue tutti i test e genera il report HTML.
async function main() {
  console.log("Avvio della suite di test API...");
  const results = await runAllTests();
  const reportHTML = generateHTMLReport(results);
  const outputFile = path.join(__dirname, '..', 'report-API.html');
  fs.writeFileSync(outputFile, reportHTML, 'utf8');
  console.log(`Report generato: ${outputFile}`);
}

main();
