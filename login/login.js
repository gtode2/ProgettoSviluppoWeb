document.addEventListener("DOMContentLoaded", ()=>{
    document.getElementById("send").addEventListener("click", async ()=>{
        const cred = document.getElementById("username")
        const pw = document.getElementById("password")

        
        const checkCred=()=>{
            return cred.value.length >0
        }
        const checkPassword =()=>{
            return pw.value.length >0
        }
        
        if (!checkCred()||!checkPassword()) {
            alert("Compila tutti i campi correttamente.")
            return
        }
        const formData = {
            cred: cred.value,
            pw: pw.value
        }
        // Invia i dati al backend
        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                window.location.href = response.url
        
            } 

            //const text = await response.text();
            //alert(text);
        } catch (error) {
            alert("Errore di rete.");
            console.error(error);
        }

    })
})


        




/* VECCHIO CONTENUTO DI LOGIN.JS
const bcrypt = require('bcrypt');
const db = require('./db'); // Modulo per interagire con il database

async function handleLogin(req, res) {
    try {
        // Prendi i dati dal form
        const { name, surname, email, phone, password } = req.body;

        // Esegui un trim sugli input per evitare caratteri non visibili indesiderati
        const cleanName = name ? name.trim() : '';
        const cleanSurname = surname ? surname.trim() : '';
        const username = cleanName + cleanSurname;

        // Controlla che i campi non siano vuoti
        if (!cleanName || !cleanSurname || !email || !phone || !password) {
            return res.status(400).send('Tutti i campi sono obbligatori.');
        }

        // Query per ottenere l'utente dal database
        const query = 'SELECT * FROM users WHERE username = ?';
        const users = await db.query(query, [username]);

        if (!users || users.length === 0) {
            return res.status(401).send('Credenziali non valide.');
        }

        // Verifica la password con bcrypt
        const isPasswordValid = await bcrypt.compare(password, users[0].password);

        if (!isPasswordValid) {
            return res.status(401).send('Credenziali non valide.');
        }

        // Effettua il login: crea una sessione o un token JWT
        req.session.user = { id: users[0].id, username: users[0].username };
        res.status(200).send('Login effettuato con successo.');
    } catch (error) {
        console.error('Errore durante il login:', error);
        res.status(500).send('Errore del server.');
    }
}

module.exports = { handleLogin };
*/