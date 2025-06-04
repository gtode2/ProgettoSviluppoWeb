const fs = require("fs");
const path = require("path");

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

// Imposta il percorso della directory Front-end; modifica in base alla struttura
const cssDir = path.join(__dirname, '..', 'FrontEnd');
const cssFiles = getFiles(cssDir, ".css");

console.log("Test sui file CSS in " + cssDir);
console.log("----------------------------------------------------");

let totalCssFiles = cssFiles.length;
let passedCss = 0;

cssFiles.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  const errors = [];
  
  // Controlla che il contenuto non sia vuoto
  if (!content.trim()) {
    errors.push("Il file è vuoto");
  }
  
  // Controlla se il file contiene almeno una coppia di parentesi graffe (indicativo di regole CSS)
  if (!content.includes("{") || !content.includes("}")) {
    errors.push("Il file non contiene regole CSS (manca { o })");
  }
  
  if (errors.length > 0) {
    console.log(`File: ${file}\n  ERRORI: ${errors.join(" - ")}`);
  } else {
    console.log(`File: ${file} - OK`);
    passedCss++;
  }
});

console.log("----------------------------------------------------");
console.log(`CSS Test - Superati: ${passedCss} di ${totalCssFiles}`);
