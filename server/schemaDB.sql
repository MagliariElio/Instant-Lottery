
BEGIN TRANSACTION;

-- Table for the users
DROP TABLE IF EXISTS `users`;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 100
);

-- Table for the draws
DROP TABLE IF EXISTS `draws`;

CREATE TABLE draws (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numbers TEXT NOT NULL,
    draw_time TEXT NOT NULL
);


-- Table for the bets
DROP TABLE IF EXISTS `bets`;

CREATE TABLE bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    draw_id INTEGER,
    numbers TEXT NOT NULL,
    bet_time TEXT NOT NULL,
   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
   FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO users (username, password, name, surname, points)
VALUES 
    ('michael.brown', '$2a$10$N8hz8J1j54W3uDOQ0/045uc2ABtzHcqfXZsOjRL4PYuIcnfMC6CJK', 'Michael', 'Brown', 85), 
    ('lisa.white', '$2a$10$AvQj88VCdvaflW4cZJO1heAtBMwFkaScNd0MGktEHg.7BjiKbVJse', 'Lisa', 'White', 90), 
    ('david.green', '$2a$10$BJ.7YGKtSdz4X0IU2OFRY.qjgCJoesoeFqdAAhZoOUUUFRW..7cYu', 'David', 'Green', 95),
    ('claire.harris', '$2a$10$eTcaAzvl5Wd.4UhWW4GEkuEq41xf/FEeQJtXil7c9O0jx7aB20elO', 'Claire', 'Harris', 100), 
    ('james.wilson', '$2a$10$5946hp.JULFvQ7Uw6TJXHu3BCklqxCU0o0xrRKE/2zs9xYSMoapOe', 'James', 'Wilson', 100);

INSERT INTO bets (user_id, numbers, bet_time)
VALUES 
    ((SELECT id FROM users WHERE username = 'michael.brown'), '5, 12, 23', '2024-09-15 14:00:00'),
    ((SELECT id FROM users WHERE username = 'lisa.white'), '7, 25', '2024-09-15 14:00:30'),
    ((SELECT id FROM users WHERE username = 'david.green'), '30', '2024-09-15 14:01:00');

COMMIT;
PRAGMA foreign_keys = ON;