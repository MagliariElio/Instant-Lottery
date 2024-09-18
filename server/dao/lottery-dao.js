"use strict";

const dbFile = require("./db");
const db = dbFile.db;
const dayjs = require("dayjs");

// Funzioni wrapper
const dbAllAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const dbRunAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });

const dbGetAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

// Aggiungi un utente
exports.addUser = (username, password, name, surname) => {
  const query = "INSERT INTO users (username, password, name, surname) VALUES (?, ?, ?, ?)";
  return dbRunAsync(query, [username, password, name, surname]);
};

// Ottieni un utente per username
exports.getUserByUsername = (username) => {
  const query = "SELECT id, name, surname, username, points FROM users WHERE username = ?";
  return dbGetAsync(query, [username]);
};

// Ottieni un utente per ID
exports.getUserById = (id) => {
  const query = "SELECT id, name, surname, username, points FROM users WHERE id = ?";
  return dbGetAsync(query, [id]);
};

// Aggiorna i dati dell'utente
exports.updateUserById = async (name, surname, id) => {
  const query = "UPDATE users SET name = ?, surname = ? WHERE id = ?";
  await dbRunAsync(query, [name, surname, id]);
  return this.getUserById(id);
};

// Aggiungi una scommessa
exports.addBet = async (userId, numbers, cost) => {
  const betTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const numbersStr = numbers.join(",");
  const query = "INSERT INTO bets (user_id, numbers, bet_time) VALUES (?, ?, ?)";
  await dbRunAsync(query, [userId, numbersStr, betTime]);

  const user = await this.getUserById(userId);
  const totalCost = user.points - cost;
  await this.updateUserPoints(userId, totalCost);
  return totalCost;
};

// Aggiungi un'estrazione
exports.addDraw = async (numbers) => {
  const drawTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const numbersStr = numbers.join(",");
  const query = "INSERT INTO draws (numbers, draw_time) VALUES (?, ?)";
  await dbRunAsync(query, [numbersStr, drawTime]);
  return drawTime;
};

// Ottieni l'estrazione corrente
exports.getLastDraw = () => {
  const query = "SELECT id, numbers, draw_time FROM draws ORDER BY draw_time DESC LIMIT 1";
  return dbGetAsync(query, []);
};

// Ottieni i 3 migliori giocatori
exports.getTopPlayers = () => {
  const query = "SELECT username, points FROM users ORDER BY points DESC LIMIT 3";
  return dbAllAsync(query, []);
};

// Ottieni tutte le scommesse presenti
exports.getAllActiveBets = () => {
  const query = "SELECT id, user_id, numbers, bet_time FROM bets WHERE draw_id IS NULL ORDER BY bet_time DESC";
  return dbAllAsync(query, []);
};

exports.getAllDraws = () => {
  const query = "SELECT id, numbers, draw_time FROM draws ORDER BY draw_time DESC";
  return dbAllAsync(query, []);
};

// Aggiorna i punti dell'utente
exports.updateUserPoints = async (userId, points) => {
  const query = "UPDATE users SET points = ? WHERE id = ?";
  return dbRunAsync(query, [points, userId]);
};

// Elimina logicamente le scommesse dopo l'estrazione inserendo l'id del draw a cui si riferivano
exports.deleteBets = (drawId) => {
  const query = "UPDATE bets SET draw_id = ? WHERE draw_id IS NULL AND user_id IN (SELECT user_id FROM draws WHERE id = ?)";
  return dbRunAsync(query, [drawId, drawId]);
};

// Elimina la scommessa fatta di recente
exports.deleteCurrentBet = (userId) => {
  const query = "DELETE FROM bets WHERE user_id = ? AND draw_id IS NULL";
  return dbRunAsync(query, [userId]);
};

// Prende l'ultima bet in corso
exports.getLastBet = (userId) => {
  const query = "SELECT id, user_id, numbers, bet_time FROM bets WHERE user_id = ? AND draw_id IS NULL";
  return dbGetAsync(query, [userId]);
};

// Prende una bet a seconda dell'user id
exports.getBet = (userId, drawId) => {
  const query = "SELECT id, user_id, numbers, bet_time FROM bets WHERE user_id = ? AND draw_id = ?";
  return dbGetAsync(query, [userId, drawId]);
};

// Prende tutte le bet relative all'utente
exports.getAllBetsByUserId = (userId) => {
  const query = "SELECT id, user_id, draw_id, numbers, bet_time FROM bets WHERE user_id = ?";
  return dbAllAsync(query, [userId]);
};