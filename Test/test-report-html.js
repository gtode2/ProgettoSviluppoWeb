const fs = require("fs");
const path = require("path");

// Funzione che scansiona ricorsivamente la directory per individuare i file con una specifica estensione
function getFiles(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      getFiles(fullPath, ext, fileList);
    } else if (path.extname(file).toLowerCase() === ext) {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

// Imposta il percorso della directory Front-end (modifica in base alla struttura del tuo progetto)
const htmlDir = path.join(__dirname, '..', 'FrontEnd');
const htmlFiles = getFiles(htmlDir, ".html");

console.log("Test sui file HTML in " + htmlDir);
console.log("----------------------------------------------------");

let totalHtmlFiles = htmlFiles.length;
let passedHtml = 0;

// Salviamo i risultati in un array di oggetti per poi generare il report
let results = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  const errors = [];
  
  // Controlla se il file inizia con <!DOCTYPE html>
  if (!content.trim().toLowerCase().startsWith("<!doctype html>")) {
    errors.push("Manca la dichiarazione <!DOCTYPE html>");
  }
  
  // Controlla se esiste un tag <html> con attributo lang
  if (!/<html\s+[^>]*lang\s*=\s*["'][a-zA-Z\-]+["']/.test(content)) {
    errors.push("Manca il tag <html> con attributo lang");
  }
  
  // Controlla se esiste il tag <head>
  if (!/<head>/i.test(content)) {
    errors.push("Manca il tag <head>");
  }
  
  // Controlla se esiste il tag <body>
  if (!/<body\b[^>]*>/i.test(content)) {
    errors.push("Manca il tag <body>");
  }
  
  if (errors.length > 0) {
    console.log(`File: ${file}\n  ERRORI: ${errors.join(" - ")}`);
  } else {
    console.log(`File: ${file} - OK`);
    passedHtml++;
  }
  
  // Aggiunge il risultato all'array
  results.push({
    file,
    errors
  });
});

console.log("----------------------------------------------------");
console.log(`HTML Test - Superati: ${passedHtml} di ${totalHtmlFiles}`);

// ----------------------
// GENERAZIONE REPORT HTML
// ----------------------
function generateReport(results, totalFiles, passed) {
  let failed = totalFiles - passed;
  let html = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Report Test - FrontEnd HTML</title>
  <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1, h2 { color: #333; }
      table { border-collapse: collapse; width: 100%; margin-top: 20px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      th { background: #f0f0f0; }
      .passed { color: green; font-weight: bold; }
      .failed { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Report Test - FrontEnd HTML</h1>
  <h2>Sommario</h2>
  <ul>
    <li>Total files testati: ${totalFiles}</li>
    <li>File superati: <span class="passed">${passed}</span></li>
    <li>File con errori: <span class="failed">${failed}</span></li>
  </ul>
  <h2>Dettaglio Test</h2>
  <table>
    <tr>
      <th>File</th>
      <th>Risultato</th>
      <th>Errori</th>
    </tr>
`;
  results.forEach(result => {
    let fileName = path.relative(path.join(__dirname, '..'), result.file);
    if (result.errors.length === 0) {
      html += `<tr>
        <td>${fileName}</td>
        <td class="passed">OK</td>
        <td>-</td>
      </tr>
      `;
    } else {
      html += `<tr>
        <td>${fileName}</td>
        <td class="failed">Errore</td>
        <td>${result.errors.join(" - ")}</td>
      </tr>
      `;
    }
  });
  html += `
  </table>
</body>
</html>  
`;
  return html;
}

const reportHtml = generateReport(results, totalHtmlFiles, passedHtml);

// Salva il report nella directory principale (la root del progetto)
const outputPath = path.join(__dirname, '..', "report-frontend.html");
fs.writeFileSync(outputPath, reportHtml, "utf8");
console.log("Report HTML generato: " + outputPath);
