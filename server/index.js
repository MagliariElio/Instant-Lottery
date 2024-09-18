const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { validationResult, body } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const db = require("./dao/db");
const lotteryDao = require("./dao/lottery-dao");
const { initializeAuthentication, isLoggedIn } = require("./authentication");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const dayjs = require("dayjs");

// Initialize express
const app = new express();
const port = 3001;
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

// Set up middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors(corsOptions));

const DRAW_INTERVAL = 120000;
let lastDrawTime = Date.now();

initializeAuthentication(app, db.db);

const sqlFilePath = path.join(__dirname, "schemaDB.sql");
db.executeSqlFile(sqlFilePath);

// Initialize WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// When a client connects
io.on("connection", (socket) => {
  console.log("New Socket.IO connection", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Generate the current draw every 2 minutes and save to the DB
const processBets = async () => {
  const draw = await lotteryDao.getLastDraw();

  if (!draw) {
    return;
  }

  const drawNumbers = draw.numbers.split(",").map((n) => parseInt(n));

  const bets = await lotteryDao.getAllActiveBets(); // Retrieve all active bets

  for (const bet of bets) {
    const betNumbers = bet.numbers.split(",").map((n) => parseInt(n));
    const correctNumbers = betNumbers.filter((n) => drawNumbers.includes(n)).length;

    let winnings = 0;
    const cost = betNumbers.length === 1 ? 5 : betNumbers.length === 2 ? 10 : 15;

    if (correctNumbers === betNumbers.length) {
      winnings = 2 * cost;
    } else if (correctNumbers > 0) {
      winnings = (2 * cost * correctNumbers) / betNumbers.length;
    }

    const user = await lotteryDao.getUserById(bet.user_id);
    const totalPoints = user.points + winnings;
    await lotteryDao.updateUserPoints(bet.user_id, totalPoints); // Update the user's points
    await lotteryDao.deleteBets(draw.id); // Delete the user's placed bet
    const drawMessage = { userId: bet.user_id, points: totalPoints, correctNumbers: correctNumbers, numbers: betNumbers };
    io.emit("resultDraw", drawMessage);
  }
};

const generateDraw = async () => {
  let currentDraw = [];
  const numbers = new Set();

  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 90) + 1);
  }

  console.log("Performing the draw!");
  currentDraw = Array.from(numbers);

  /* If you want to force the draw, remove the comment here */
  // currentDraw.push(1);
  // currentDraw.push(2);
  // currentDraw.push(3);

  const drawTime = await lotteryDao.addDraw(currentDraw); // Save the draw in the DB

  lastDrawTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

  // Send the draw result to all connected WS clients
  const drawMessage = { draw: currentDraw, drawTime: drawTime };
  io.emit("draw", drawMessage);
};

// Execute this function after each draw
setInterval(async () => {
  await generateDraw();
  await processBets();
}, DRAW_INTERVAL);

// User registration
app.post("/api/register", async (req, res) => {
  const { username, password, name, surname } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  if (!name || !surname) {
    return res.status(400).json({ error: "Name and surname are required." });
  }

  try {
    // Check if the user already exists
    const existingUser = await lotteryDao.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already taken!" });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Add the user to the database
    const userId = await lotteryDao.addUser(username, hashedPassword, name, surname);
    const user = await lotteryDao.getUserById(userId);

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Error registering user." });
  }
});

// Return the current draw
app.get("/api/draw/current", isLoggedIn, async (req, res) => {
  const draw = await lotteryDao.getLastDraw();
  if (draw) {
    return res.status(200).json({ draw: draw.numbers.split(","), drawTime: draw.draw_time });
  } else {
    return res.status(403).json({ error: "There is no draw in this moment. Please, wait some minutes." });
  }
});

// Return All draws
app.get("/api/draw", isLoggedIn, async (req, res) => {
  const draws = await lotteryDao.getAllDraws();
  const transformedDraws = draws.map((draw) => {
    return {
      id: draw.id,
      numbers: draw.numbers.split(",").map(Number),
      drawTime: draw.draw_time,
    };
  });

  if (transformedDraws) {
    return res.status(200).json(transformedDraws);
  } else {
    return res.status(200).json([]);
  }
});

// Return the time left before the next draw
app.get("/api/time-left", (req, res) => {
  res.json({ lastDrawTime });
});

// Place a bet
app.post("/api/bet", isLoggedIn, async (req, res) => {
  const { numbers } = req.body;
  if (!Array.isArray(numbers) || numbers.length === 0 || numbers.length > 3) {
    return res.status(400).json({ error: "You must bet on 1 to 3 numbers." });
  }

  const cost = numbers.length === 1 ? 5 : numbers.length === 2 ? 10 : 15;
  if (req.user.points < cost) {
    return res.status(400).json({ error: "Not enough points." });
  }

  const lastBet = await lotteryDao.getLastBet(req.user.id);
  if (lastBet) {
    const numbersDb = lastBet.numbers.split(",").map(Number);

    if (numbersDb.length === numbers.length) {
      if (numbersDb.every((value, index) => value === numbers[index])) {
        return res.status(403).json({ error: "You have already placed a bet. You cannot place another bet at this time." });
      } else {
        // Update the previous cost and After it will update the cost and the bet
        const totalCost = req.user.points + cost;
        await lotteryDao.updateUserPoints(req.user.id, totalCost);
        await lotteryDao.deleteCurrentBet(req.user.id);
      }
    } else {
      const costDB = numbersDb.length === 1 ? 5 : numbersDb.length === 2 ? 10 : 15;
      const totalCost = req.user.points + costDB;
      await lotteryDao.updateUserPoints(req.user.id, totalCost);
      await lotteryDao.deleteCurrentBet(req.user.id);
    }
  }

  // Deduct points and register the bet
  const totalCost = await lotteryDao.addBet(req.user.id, numbers, cost);

  res.json(totalCost);
});

// Delete the last bet before the draw
app.delete("/api/bet", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user.id;
    const bet = await lotteryDao.getLastBet(userId);

    if (bet) {
      await lotteryDao.deleteCurrentBet(userId);

      numbers = bet.numbers.split(",").map(Number);
      const cost = numbers.length === 1 ? 5 : numbers.length === 2 ? 10 : 15;
      var user = await lotteryDao.getUserById(userId);
      const totalPoints = user.points + cost;
      await lotteryDao.updateUserPoints(userId, totalPoints);

      user.points = totalPoints;
      res.status(200).json(user);
    } else {
      res.status(200).json({});
    }
  } catch (error) {
    console.error("Error deleting current bet:", error);
    res.status(500).json({ error: "Failed to delete bet" });
  }
});

// Leaderboard of the top 3 players
app.get("/api/leaderboard", isLoggedIn, async (req, res) => {
  const players = await lotteryDao.getTopPlayers();
  res.json(players);
});

// Get All Bets of the current user
app.get("/api/bet", isLoggedIn, async (req, res) => {
  const bet = await lotteryDao.getAllBetsByUserId(req.user.id);
  res.json(bet);
});

// Get the last Bet of the current user
app.get("/api/bet/current", isLoggedIn, async (req, res) => {
  const bet = await lotteryDao.getLastBet(req.user.id);
  if (bet) {
    bet.numbers = bet.numbers.split(",").map(Number);
  }
  res.json(bet ? bet : {});
});

// Get the previous numbers of the bet of the current user
app.get("/api/bet/previous", isLoggedIn, async (req, res) => {
  const draw = await lotteryDao.getLastDraw();
  if (!draw) {
    return res.json([]);
  }

  const bet = await lotteryDao.getBet(req.user.id, draw.id);

  if (bet) {
    const numbers = bet.numbers.split(",").map(Number);
    return res.json(numbers);
  } else {
    return res.json([]);
  }
});

// Authenticate and login
app.post(
  "/api/session",
  body("username", "Must be entered a valid username!").isString().notEmpty(),
  body("password", "Password can not be empty!").isString().notEmpty(),
  (req, res, next) => {
    // Validate the input fields
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map((e) => e.msg));
      return res.status(400).json({ error: errList });
    }

    // Perform authentication
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(err.status || 500).json({ error: [err.msg || "Authentication failed."] });
      }

      if (!user) {
        return res.status(401).json({ error: ["Incorrect username or password."] });
      }

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }

        // Send the authenticated user's info
        return res.json(req.user);
      });
    })(req, res, next);
  }
);

/**
 * Check if the user is logged in and return their info
 */
app.get("/api/session/current", isLoggedIn, async (req, res) => {
  try {
    // Retrieve detailed information about the authenticated user
    const user = await lotteryDao.getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: ["Database error"] });
  }
});

app.put("/api/profile/update", isLoggedIn, async (req, res) => {
  const { name, surname } = req.body;
  const userId = req.user.id;

  // Update the user's information
  const user = await lotteryDao.updateUserById(name, surname, userId);
  if (user) {
    return res.status(200).json(user);
  } else {
    return res.status(404).json({ error: "User not found" });
  }
});

/**
 * Logout and session destruction
 */
app.delete("/api/session", isLoggedIn, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: ["Failed to logout"] });
    }
    res.status(204).end();
  });
});

// Activate the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log("Socket.IO server initialized and running");
});
