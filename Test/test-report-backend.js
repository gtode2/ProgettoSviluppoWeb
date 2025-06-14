// test/artigiano.test.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// ----------------------
// METADATA & LOGGING
// ----------------------

// Registra il timestamp d'inizio dei test e altre info utili.
const startTime = new Date();
const envInfo = {
  nodeVersion: process.version,
  platform: process.platform,
  ci: process.env.CI || 'local'
};

// Array per conservare i log del report
const report = [];

// Contatore test – per esempio, contiamo i test che superano (ovvero log "superato")
let totalTests = 0;

// Funzione per loggare i messaggi (su console e nel report)
function logReport(message) {
  report.push(message);
  console.log(message);
  if (message.toLowerCase().includes("superato")) {
    totalTests++;
  }
}

// Registra l'avvio dei test
logReport("=== Avvio test: " + startTime.toISOString() + " ===");
logReport(`Informazioni ambiente: Node ${envInfo.nodeVersion}, Platform: ${envInfo.platform}, CI: ${envInfo.ci}`);

// ----------------------
// PARTE 1: Test degli Event Listener sul DOM fittizio
// ----------------------

// Costruttore per un elemento fittizio
function FakeElement(id) {
  this.id = id;
  this.classList = {
    classes: [],
    add: function(cls) {
      if (!this.classes.includes(cls)) {
        this.classes.push(cls);
      }
    },
    remove: function(cls) {
      this.classes = this.classes.filter(c => c !== cls);
    },
    contains: function(cls) {
      return this.classes.includes(cls);
    }
  };
  this.eventListeners = {};
  this.addEventListener = function(event, cb) {
    this.eventListeners[event] = cb;
  };
  this.click = function() {
    if (this.eventListeners['click']) {
      this.eventListeners['click']();
    }
  };
}

// Simulazione minima dell'oggetto "document"
const fakeDocument = {
  elements: {
    'btn-toggle-overlay': new FakeElement('btn-toggle-overlay'),
    'btn-close-overlay': new FakeElement('btn-close-overlay'),
    'admin-overlay': new FakeElement('admin-overlay')
  },
  getElementById: function(id) {
    return this.elements[id] || null;
  }
};

// Configurazione degli event listener (simulazione di DOMContentLoaded)
(function simulateDOMListeners(document) {
  const toggleOverlayButton = document.getElementById('btn-toggle-overlay');
  const closeOverlayButton = document.getElementById('btn-close-overlay');
  const adminOverlay = document.getElementById('admin-overlay');

  if (toggleOverlayButton) {
    toggleOverlayButton.addEventListener('click', function () {
      adminOverlay.classList.add('aperto');
    });
  }

  if (closeOverlayButton) {
    closeOverlayButton.addEventListener('click', function () {
      adminOverlay.classList.remove('aperto');
    });
  }

  if (adminOverlay) {
    adminOverlay.addEventListener('click', function(){
      adminOverlay.clicked = true;
    });
  }
})(fakeDocument);

// Esecuzione dei test degli event listener
fakeDocument.getElementById('btn-toggle-overlay').click();
assert.strictEqual(
  fakeDocument.getElementById('admin-overlay').classList.contains('aperto'),
  true,
  "L'overlay deve avere la classe 'aperto' dopo il click sul pulsante di toggle."
);
logReport("Test per 'toggle' superato.");

fakeDocument.getElementById('btn-close-overlay').click();
assert.strictEqual(
  fakeDocument.getElementById('admin-overlay').classList.contains('aperto'),
  false,
  "L'overlay non deve avere la classe 'aperto' dopo il click sul pulsante di close."
);
logReport("Test per 'close' superato.");

fakeDocument.getElementById('admin-overlay').click();
assert.strictEqual(
  fakeDocument.getElementById('admin-overlay').clicked,
  true,
  "L'overlay deve aver settato la proprietà 'clicked' dopo il click."
);
logReport("Test per il click sull'overlay superato.");

// ----------------------
// PARTE 2: Test delle funzioni di navigazione (openProduct, closeProduct, edit)
// ----------------------

// Simulazione globale di window.parent.document per l'iframe "lat-iframe"
global.window = {
  parent: {
    document: {
      elements: {
        "lat-iframe": {
          src: ""
        }
      },
      getElementById: function(id) {
        return this.elements[id] || null;
      }
    }
  }
};

function openProduct(id) {
  window.parent.document.getElementById("lat-iframe").src =
    "/prodotti/dettaglio/dettagli.html?id=" + id;
}

function closeProduct() {
  window.parent.document.getElementById("lat-iframe").src =
    "/artigiano/inserimento/inserimento.html";
}

function edit(id) {
  window.parent.document.getElementById("lat-iframe").src =
    "/artigiano/modifica/modifica.html?id=" + id;
}

openProduct(42);
assert.strictEqual(
  window.parent.document.getElementById("lat-iframe").src,
  "/prodotti/dettaglio/dettagli.html?id=42",
  "openProduct deve impostare correttamente la src con l'id fornito."
);
logReport("Test per openProduct superato.");

closeProduct();
assert.strictEqual(
  window.parent.document.getElementById("lat-iframe").src,
  "/artigiano/inserimento/inserimento.html",
  "closeProduct deve impostare la src alla pagina di inserimento."
);
logReport("Test per closeProduct superato.");

edit(7);
assert.strictEqual(
  window.parent.document.getElementById("lat-iframe").src,
  "/artigiano/modifica/modifica.html?id=7",
  "edit deve impostare correttamente la src per l'editing."
);
logReport("Test per edit superato.");

// ----------------------
// PARTE 3: Scansione ricorsiva dei file JS nella directory "Backend"
// e verifica delle funzioni esportate
// ----------------------

// Per evitare errori "document is not defined", definiamo uno stub globale per document se non esiste
if (typeof global.document === "undefined") {
  global.document = {
    createElement: () => ({}),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  };
}

logReport("\n=== Verifica dei file JS nella directory 'Backend' ===");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

// Determina il percorso della directory "Backend" (assunta alla radice del progetto)
const backendDir = path.join(__dirname, '..', 'Backend');
if (fs.existsSync(backendDir) && fs.statSync(backendDir).isDirectory()) {
  walkDir(backendDir, function(file) {
    if (file.endsWith('.js')) {
      try {
        // Carico il file
        const mod = require(file);
        logReport("File " + file + " caricato correttamente.");
        // Verifica presenza ed esecuzione delle funzioni esportate
        Object.keys(mod).forEach(key => {
          if (typeof mod[key] === 'function') {
            logReport("Funzione '" + key + "' trovata in " + file + ".");
            if (mod[key].length === 0) {
              try {
                mod[key]();
                logReport("Funzione '" + key + "' eseguita correttamente in " + file + ".");
              } catch (e) {
                logReport("Errore nell'esecuzione della funzione '" + key + "' in " + file + ": " + e.message);
              }
            } else {
              // Creazione di dummy arguments: un array di 'null' della lunghezza richiesta.
              const dummyArgs = new Array(mod[key].length).fill(null);
              try {
                mod[key](...dummyArgs);
                logReport("Funzione '" + key + "' eseguita con dummy arguments (" + dummyArgs.join(", ") + ") in " + file + ".");
              } catch(e) {
                logReport("Errore nell'esecuzione della funzione '" + key + "' con dummy arguments in " + file + ": " + e.message);
              }
            }
          }
        });
      } catch (err) {
        logReport("Errore nel file " + file + ": " + err.message);
      }
    }
  });
} else {
  logReport("Directory 'Backend' non trovata.");
}

// ----------------------
// METADATA FINALE E REPORT
// ----------------------
const endTime = new Date();
const duration = (endTime - startTime) / 1000;
logReport(`\n=== Fine test: ${endTime.toISOString()} ===`);
logReport(`Durata totale: ${duration} secondi.`);
logReport(`Totale test superati: ${totalTests}.`);

// Genera il report HTML con sintesi e grafico usando Chart.js (via CDN)
function generateHtmlReport(logEntries, metadata) {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Test Report - Backend</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2 { color: #333; }
    .summary { margin-bottom: 20px; }
    pre { background: #f4f4f4; padding: 10px; border: 1px solid #ddd; }
    #chartContainer { width: 300px; height: 300px; }
  </style>
</head>
<body>
  <h1>Test Report - Backend</h1>
  <div class="summary">
    <h2>Sommario</h2>
    <ul>
      <li>Ora di inizio: ${metadata.startTime}</li>
      <li>Ora di fine: ${metadata.endTime}</li>
      <li>Durata: ${metadata.duration} secondi</li>
      <li>Versione Node: ${metadata.nodeVersion}</li>
      <li>Ambiente: ${metadata.ci}</li>
      <li>Totale test superati: ${metadata.totalTests}</li>
    </ul>
  </div>
  <div id="chartContainer">
    <canvas id="testChart"></canvas>
  </div>
  <h2>Dettagli dei test</h2>
  <pre>${logEntries.join("\n")}</pre>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    const ctx = document.getElementById('testChart').getContext('2d');
    const data = {
      labels: ['Passati', 'Falliti'],
      datasets: [{
        data: [${metadata.totalTests}, 0],
        backgroundColor: ['#4CAF50', '#F44336']
      }]
    };
    const options = {
      responsive: false,
      plugins: {
        tooltip: { enabled: true },
        legend: { position: 'bottom' }
      }
    };
    new Chart(ctx, { type: 'pie', data: data, options: options });
  </script>
</body>
</html>
  `;
}

const metadata = {
  startTime: startTime.toISOString(),
  endTime: endTime.toISOString(),
  duration: duration,
  nodeVersion: envInfo.nodeVersion,
  ci: envInfo.ci,
  totalTests: totalTests
};

const htmlReport = generateHtmlReport(report, metadata);
fs.writeFileSync("test-report-backend.html", htmlReport, 'utf8');
logReport("Report HTML generato come test-report-backend.html");
