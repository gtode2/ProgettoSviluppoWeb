CREATE TABLE utenti(
    uid SERIAL PRIMARY KEY ,
    nome VARCHAR NOT NULL,
    cognome VARCHAR NOT NULL,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    ntel VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    usertype INT NOT NULL, 
    banned BOOLEAN NOT NULL DEFAULT FALSE);
CREATE TABLE attivita(
    actid INT PRIMARY KEY,
    nome VARCHAR NOT NULL,
    indirizzo VARCHAR,
    email VARCHAR NOT NULL,
    ntel VARCHAR, 
    descr VARCHAR NOT NULL, 
    FOREIGN KEY(actid) REFERENCES utenti(uid));
CREATE TABLE RefTok(
    id SERIAL PRIMARY KEY,
    userid INT NOT NULL,
    token VARCHAR,
    exp TIMESTAMP NOT NULL,
    revoked BOOLEAN,
    FOREIGN KEY (userid) REFERENCES utenti(uid));
CREATE TABLE Prodotti(
    id SERIAL PRIMARY KEY,
    actid INT NOT NULL,
    name VARCHAR NOT NULL, 
    descr VARCHAR NOT NULL, 
    costo FLOAT NOT NULL, 
    amm INT NOT NULL, 
    banned BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (actid) REFERENCES attivita(actid));
CREATE TABLE Carrello(
    uid INT NOT NULL,
    productid INT NOT NULL, 
    quantita INT NOT NULL, 
    PRIMARY KEY (uid, productid),
    FOREIGN KEY (uid) REFERENCES utenti(uid), 
    FOREIGN KEY (productid) REFERENCES prodotti(id) ON DELETE CASCADE);
CREATE TABLE report(
    id SERIAL PRIMARY KEY,
    uid INT NOT NULL, 
    prodid INT NOT NULL, 
    type VARCHAR NOT NULL, 
    descr VARCHAR NOT NULL, 
    solved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(uid) REFERENCES utenti(uid),
    FOREIGN KEY(prodid) REFERENCES prodotti(id) ON DELETE CASCADE);
CREATE TABLE ordini (
    id SERIAL PRIMARY KEY,
    uid INT NOT NULL, 
    products JSONB NOT NULL, 
    sent BOOLEAN DEFAULT FALSE, 
    created TIMESTAMP NOT NULL, 
    expires_at TIMESTAMP, 
    FOREIGN KEY (uid) REFERENCES utenti(uid));
