const express = require('express');
const sqlite3 = require('better-sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require("dotenv").config()

const app = express();

app.use(express.static("public"));

const SECRET_KEY = process.env.SECRET_KEY;

const db = new sqlite3.Database('./gamesAndLB.db', (err) => {
  if (err) {
    console.error('Error connecting to the database', err);
  }
  console.log('Connected to the SQLite database.');
});

// Middleware to parse JSON bodies
app.use(express.json());

function validateUser(username, password) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
      if (err) {
        reject(err);
      } else if (!user) {
        reject(new Error('User not found'));
      } else {
        // Compare provided password with stored hash
        const isValid = bcrypt.compareSync(password, user.password);
        if (isValid) {
          resolve(user);
        } else {
          reject(new Error('Invalid password'));
        }
      }
    });
  });
}

// Middleware for JWT validation
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
};

// Route to register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
      .run(username, email, hashedPassword);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to authenticate and log in a user
app.post('/api/login', async (req, res) => {
  /* try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ email: user.email }, 'secret');
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  } */
    try {
      const { email, password } = req.body;
      const user = await validateUser(email, password);
      
      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email }, 
        SECRET_KEY, 
        { expiresIn: '1h' }
      );
  
      res.json({ 
        message: 'Login successful', 
        token: token 
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
});

// Protected route to get user details
app.get('/api/user', verifyToken, (req, res) => {
  try {
    const user = db.prepare('SELECT username, email FROM users WHERE email = ?').get(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/steinsakspapir', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/steinSaksPapir.html'));
});

app.get('/gjetttallet', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/gjettTallet.html'));
});

app.get('/logginn', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/loggInn.html'));
});

const port = 3000;

app.listen(port, () => {
    console.log('Server is running on port http://localhost:3000/');
});