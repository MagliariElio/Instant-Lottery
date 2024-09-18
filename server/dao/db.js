"use strict";

const sqlite = require("sqlite3").verbose();
const fs = require('fs');

// open the database
const db = new sqlite.Database("./dao/lottery.db", (err) => {
  if (err) {
    console.error("Errore durante la connessione al database", err.message);
  } else {
    console.log("Connesso al database SQLite.");
  }
});

const executeSqlFile = (filePath) => {
  const sql = fs.readFileSync(filePath, "utf8");

  db.exec(sql, (err) => {
    if (err) {
      console.error("Error executing SQL file:", err.message);
    } else {
      console.log("Database initialized successfully.");
    }
  });
};

module.exports = { db, executeSqlFile };
