'use strict';

const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

/**
 * Helper function to initialize passport authentication with the LocalStrategy
 * 
 * @param app express app
 * @param db database instance
 */
function initializeAuthentication(app, db) {
    passport.use(new LocalStrategy((username, password, done) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
            if (err) {
                return done({ status: 500, msg: 'Database error' }, false);
            }
            if (!user) {
                return done({ status: 401, msg: 'Incorrect username or password!' }, false);
            }

            const isValidPassword = bcrypt.compareSync(password, user.password);
            if (!isValidPassword) {
                return done({ status: 401, msg: 'Incorrect username or password!' }, false);
            }

            return done(null, user); // Utente autenticato correttamente
        });
    }));

    // Serializzazione dell'utente
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserializzazione dell'utente
    passport.deserializeUser((id, done) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
            if (err) return done(err, null);
            done(null, user);
        });
    });

    // Inizializzazione di express-session
    app.use(session({
        secret: "386e60adeb6f34186ae167a0cea7ee1dfa4109314e8c74610671de0ef9662191",
        resave: false,
        saveUninitialized: false,
    }));

    // Inizializzazione di passport middleware
    app.use(passport.initialize());
    app.use(passport.session());
}

/**
 * Middleware di Express per verificare se l'utente è autenticato.
 * In caso contrario, risponde con un 401 Unauthorized.
 */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({ errors: ['Devi essere autenticato per effettuare questa richiesta!'] });
}

module.exports = { initializeAuthentication, isLoggedIn };
