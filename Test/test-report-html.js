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
});

console.log("----------------------------------------------------");
console.log(`HTML Test - Superati: ${passedHtml} di ${totalHtmlFiles}`);
