const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require("dotenv").config()
//const mssql = require('mssql');
const sqlite3 = require('better-sqlite3')
const db = sqlite3('./gamesAndLB.db', {verbose: console.log})
const cookieParser = require('cookie-parser');

/* // Configure the connection string
const dbConfig = {
  user: process.env.db_user, // Azure SQL Database username
  password: process.env.db_password, // Azure SQL Database password
  server: process.env.db_url, // Azure SQL Database server name
  database: process.env.db_name, // Your database name
  options: {
    encrypt: true, // Encrypt the connection for security (important for Azure)
    trustServerCertificate: false, // Ensure the server certificate is trusted
    requestTimeout: 60000, // Increase request timeout (default is 15000ms)
    connectionTimeout: 120000 // Increase connection timeout (default is 15000ms)
  }
};

let poolPromise;

// Establish database connection pool
function attemptDBconnection () {
  poolPromise = new mssql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log("Connected to Azure SQL Database");
        return pool;
    })
    .catch(err => {console.error("Database Connection Failed!", err); attemptDBconnection()});
}

attemptDBconnection() */


const app = express();

app.use(express.static(path.join(__dirname, "public")));

const SECRET_KEY = process.env.SECRET_KEY;

//const db = sqlite3('./gamesAndLB.db', {verbose: console.log})

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.post('/api/register', async (req, res) => {
  try {
      const { username, email, password } = req.body;
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
      .run(username, email, hashedPassword);
      
      res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Route to authenticate and log in a user
app.post('/api/login', async (req, res) => {
  try {
      const { email, password } = req.body;
      
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      
      if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Make sure to include the user ID in the token payload
      const token = jwt.sign(
          { id: user.idusers, email: user.email },
          SECRET_KEY,
          { expiresIn: '6h' }
      );

      res.cookie('jwt', token, { httpOnly: false, secure: false });

      res.json({ message: 'Login successful', token });
      
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


app.get('/api/logout', async (req, res) => {
  res.clearCookie("jwt")
  res.sendFile(path.join(__dirname, '/public/views/loggInn.html'));
})

// Protected route to get user details
app.get('/api/user', verifyToken, async (req, res) => {
  try {
      const user = db.prepare('SELECT username, email FROM users WHERE id = ?').get(req.userId);
      
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(result.recordset[0]);
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/index.html'));
});

app.get('/steinsakspapir', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/steinSaksPapir.html'));
});

app.get('/gjetttallet', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/gjettTallet.html'));
});

app.get('/leaderboard', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, '/public/views/leaderboard.html'));
});

app.get('/logginn', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/views/loggInn.html'));
});

app.get('/registrer', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/views/registrer.html'));
});

app.get('/protected', verifyToken, (req, res) => {
  res.json({ 
    message: 'Access to protected route', 
    userId: req.userId 
  });
});

app.get('/api/leaderboard', verifyToken, (req, res) => {
  try {
      const gameId = req.query.gameId; // Optional filter by game
      const sortBy = req.query.sortBy || 'wins'; // Default sort by wins
      
      let query = `
          SELECT username, wins, losses, draw, idGame
          FROM leaderboard
          INNER JOIN users
      `;
      
      // Add game filter if specified
      if (gameId && gameId !== 'all') {
          query += ` WHERE idGame = ?`;
      }
      
      // Execute the query
      let stmt = db.prepare(query);
      let results = gameId && gameId !== 'all' 
          ? stmt.all(gameId)
          : stmt.all();
      
      // Sort results based on sortBy parameter
      if (sortBy === 'wins') {
          results.sort((a, b) => b.wins - a.wins);
      } else if (sortBy === 'winrate') {
          results.sort((a, b) => {
              const totalA = a.wins + a.losses + a.draw;
              const totalB = b.wins + b.losses + b.draw;
              const rateA = totalA > 0 ? a.wins / totalA : 0;
              const rateB = totalB > 0 ? b.wins / totalB : 0;
              return rateB - rateA;
          });
      } else if (sortBy === 'games') {
          results.sort((a, b) => {
              const totalA = a.wins + a.losses + a.draw;
              const totalB = b.wins + b.losses + b.draw;
              return totalB - totalA;
          });
      }
      
      res.json(results);
  } catch (error) {
      console.error('Error retrieving leaderboard data:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/games/rps', verifyToken, (req, res) => {
  const { choice: playerChoice } = req.body;
  const choices = ['stein', 'saks', 'papir'];
  const computerChoice = choices[Math.floor(Math.random() * choices.length)];
  const gameId = 0;

  let result = '';
  if (playerChoice === computerChoice) {
      result = 'Uavgjort!';
  } else if (
      (playerChoice === 'stein' && computerChoice === 'saks') ||
      (playerChoice === 'papir' && computerChoice === 'stein') ||
      (playerChoice === 'saks' && computerChoice === 'papir')
  ) {
      result = 'Du vant!';
  } else {
      result = 'Du tapte!';
  }

  // Check or insert leaderboard row
  const exists = db.prepare('SELECT 1 FROM leaderboard WHERE idUser = ? AND idGame = ?').get(req.userId, gameId);
  if (!exists) {
      db.prepare('INSERT INTO leaderboard (idUser, idGame, wins, losses, draw) VALUES (?, ?, 0, 0, 0)')
        .run(req.userId, gameId);
  }

  const stmt = result === 'Du vant!'
      ? 'UPDATE leaderboard SET wins = wins + 1 WHERE idUser = ? AND idGame = ?'
      : result === 'Du tapte!'
          ? 'UPDATE leaderboard SET losses = losses + 1 WHERE idUser = ? AND idGame = ?'
          : 'UPDATE leaderboard SET draw = draw + 1 WHERE idUser = ? AND idGame = ?';

  db.prepare(stmt).run(req.userId, gameId);

  res.json({ result, computerChoice });
});

app.post('/api/games/guess-number', verifyToken, (req, res) => {
  try {
    const { guess, difficulty } = req.body;
    const guessNum = parseInt(guess);
    const difficultyNum = parseInt(difficulty);
    
    // Verify that we have a valid userId from the token
    if (!req.userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }

    console.log(req.userId)
    
    const generatedNumber = Math.floor(Math.random() * 100) + 1;
    const win = Math.abs(guessNum - generatedNumber) <= difficultyNum;
    const result = win ? 'Du vant!' : 'Du tapte!';
    const gameId = 1;
    
    //console.log(`User ID: ${req.userId}, Game ID: ${gameId}, Guess: ${guessNum}, Generated: ${generatedNumber}`);

    // Check or insert leaderboard row
    const exists = db.prepare('SELECT 1 FROM leaderboard WHERE idUser = ? AND idGame = ?').get(req.userId, gameId);
    if (!exists) {
      db.prepare('INSERT INTO leaderboard (idUser, idGame, wins, losses, draw) VALUES (?, ?, 0, 0, 0)')
        .run(req.userId, gameId);
    }

    const stmt = win
      ? 'UPDATE leaderboard SET wins = wins + 1 WHERE idUser = ? AND idGame = ?'
      : 'UPDATE leaderboard SET losses = losses + 1 WHERE idUser = ? AND idGame = ?';

    db.prepare(stmt).run(req.userId, gameId);

    res.json({ result, generatedNumber });
  } catch (error) {
    console.error('Error in guess-number game:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.cookies.jwt;
  
  if (!token) {
    console.log('No token provided');
    return res.redirect('/logginn');
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log('Token verification error:', err);
      return res.redirect('/logginn');
    }
    
    //console.log('Decoded token:', decoded);
    
    // Check for user ID in the token
    if (decoded.id) {
      // Use the ID from the token
      req.userId = decoded.id;
      next();
    }
    else {
      console.log('Invalid token payload - no id or email:', decoded);
      return res.redirect('/logginn');
    }
  });
}

function notLoggedIn(req, res, next) {
  const token = req.cookies.jwt;

  console.log(token)

  if (!token) {
    next()
  }
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = decoded.id;
    return res.sendFile(path.join(__dirname, '/public/views/index.html'))
  });
}

const port = 3000;

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}/`);
});