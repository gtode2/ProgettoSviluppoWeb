# ProgettoSviluppoWeb-
## Developer:
### Front-end developer: Mattia Sindoni
### Back-end developer: Gabriele Todeschini
### Database developer: Gabriele Todeschini
### Dev Ops: Mattia Sindoni

## Installazione
Per installare la nostra applicazione web occorre avere installato sul proprio portatile:
- Node (raccomandata 22.12);
- Docker;
- Database PostgreSQL
Per poter utilizzare l'applicazione, effettuare il seguente comando da terminale:
### git clone https://github.com/gtode2/ProgettoSviluppoWeb
una volta scaricata la directory, occorre inizializzare Docker, utilizzando il seguente comando:
### docker-compose up --build
Una volta effettuata l'installazione, occorre:
- impostare il .env con le informazioni richieste per usare postgres;
- impostare le key di Stripe nel file .env . Di seguito troverete il link di stripe dove, una volta registrati, potrete ottenere le chiavi sopra descritte:
https://dashboard.stripe.com/test/dashboard
Una volta ottenuta la suddetta key, andrà inserita nel seguente file:
- Key.js

## Utilizzo
Per poter utilizzare la nostra applicazione in locale, dovrete eseguire il comando di docker:
### docker-compose up --build
Al fine di semplicità, il team di sviluppo consiglia caldamente di utilizzare l'applicazione di docker.
Successivamente, il server sarà attivo sulla porta 3000 del localhost "in locale".

## Operazioni
Nella nostra PWA potrete registrarvi in due modi:
- cliente:
  Una persona registratasi come cliente può visualizzare il market e tutti i prodotti contenuti, potendo effettuare acquisti dei prodotti presenti e segnalazioni.
In aggiunta, il team di sviluppo ha predisposto una sezione per vedere gli ordini che sono stati effettuati e in che stato di spezione sono;
- artigiano:
  Una persona  registratasi come artigiano avrà una pagina ideata per la gestione dei propri prodotti all'interno dell'e-commerce, e alla loro gestione, come ad esempio l'inserimento di nuovi prodotti o l'aggiornamento delle informazioni e della quantità.
In aggiunta, il team di sviluppo ha predisposto una sezione per la visualizzazione degli ordini in attesa di essere confermati e spediti.

## Deployement
Al momento, la nostra applicazione opera con certificati Self Signed.
A seguito del deployement sarà necessario ottenere certificati validi per poter utilizzare la libreria Stripe per HTTPS e per utilizzare la web app come Progressive Web Application.
Al momento Stripe opera su HTTP, non avendo certificati riconosciuti, ma una volta ottenuto l'URL, occorrerà registrare una webhook. Fatto ciò, sarà possibile rimuovere la parte finale dal server il listener HTTP alla porta 3001 in modo da poter lavorare esclusivamente in HTTPS.
Al primo avvio, l'account admin verrà pre-caricato nel Db, con delle credenziali temporanee:
### username = admin
### password = Password
E' altamente consigliato al primo avvio di modificarle per renderle sicure utilizzando l'apposita funzionalità accessibile dall'area utente.

## Testing
Il team di testing ha anche predisposto degli appositi comandi npm di testing.
Per poterli attivare, sul terminale effettuare il seguente comando:
### docker-compose run --rm app npm
Per ulteriori informazioni, andare nell'apposita sezione package.json, sezione script.
Per il testing locale, invece, è necessario installare la CLI di Stripe per ottenere la chiave da inserire in "STRIPE_SESSION" dentro il .env (la chiave inizia con whsec...
