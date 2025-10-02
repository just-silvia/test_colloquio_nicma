//importo SQLite e axios

const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

//apertura DB

const db = new sqlite3.Database('posts.db', (error) => {
    if (error) {
        console.error('Errore di connessione al DB:', error.message);
    } else {
        console.log('Connesso al DB');
    }
});

//creazione tabella

db.run(`
    CREATE TABLE IF NOT EXISTS POST(
        USERID INTEGER,
        ID INTEGER,
        TITLE NVARCHAR(1024),
        BODY NVARCHAR(2048)
    )
    `, (error) => {
    if (error) {
        console.error('Errore di creazione della tabella:', error.message);
    } else {
        console.log('Tabella POST creata');
    }
});

//chiamata GET al json e inserisco dati nel DB

axios.get('https://jsonplaceholder.typicode.com/posts')
    .then((response) => {
        console.log(response.data.length);

        db.serialize(() => {
            const insertQuery = `
                INSERT INTO POST (USERID, ID, TITLE, BODY)
                VALUES (?, ?, ?, ?)
            `;

            const stmt = db.prepare(insertQuery);

            response.data.forEach(post => {
                stmt.run(post.userId, post.id, post.title, post.body);
            });

            stmt.finalize(() => {
                console.log('Dati inseriti');
            });
        });

        db.close();
    })
    .catch(error => {
        console.error("Errore durante la richiesta:", error.message);
        db.close();
    });