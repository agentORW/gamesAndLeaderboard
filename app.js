const express = require('express');
const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require("dotenv").config()
const mssql = require('mssql');

// Configure the connection string
const dbConfig = {
  user: process.env.db_user, // Azure SQL Database username
  password: process.env.db_password, // Azure SQL Database password
  server: process.env.db_url, // Azure SQL Database server name
  database: process.env.db_name, // Your database name
  options: {
    encrypt: true, // Encrypt the connection for security (important for Azure)
    trustServerCertificate: false // Ensure the server certificate is trusted
  }
};

// Establish database connection pool
const poolPromise = new mssql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log("Connected to Azure SQL Database");
        return pool;
    })
    .catch(err => console.error("Database Connection Failed!", err));


const app = express();

app.use(express.static(path.join(__dirname, "public")));

const SECRET_KEY = process.env.SECRET_KEY;

const db = sqlite3('./gamesAndLB.db', {verbose: console.log})

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/api/register', async (req, res) => {
  try {
      const { username, email, password } = req.body;
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const pool = await poolPromise;

      await pool.request()
          .input('username', mssql.NVarChar, username)
          .input('email', mssql.NVarChar, email)
          .input('password', mssql.NVarChar, hashedPassword)
          .query('INSERT INTO users (username, email, password) VALUES (@username, @email, @password)');
      
      res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Route to authenticate and log in a user
app.post('/api/login', async (req, res) => {
  try {
      const { email, password } = req.body;
      const pool = await poolPromise;
      
      const result = await pool.request()
          .input('email', sql.NVarChar, email)
          .query('SELECT * FROM users WHERE email = @email');
      
      const user = result.recordset[0];
      if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
          { id: user.id, email: user.email },
          SECRET_KEY,
          { expiresIn: '6h' }
      );
      
      res.json({ message: 'Login successful', token });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Protected route to get user details
app.get('/api/user', verifyToken, async (req, res) => {
  try {
      const pool = await poolPromise;
      const result = await pool.request()
          .input('id', sql.Int, req.userId)
          .query('SELECT username, email FROM users WHERE id = @id');
      
      if (result.recordset.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(result.recordset[0]);
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/index.html'));
});

app.get('/steinsakspapir', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/steinSaksPapir.html'));
});

app.get('/gjetttallet', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/views/gjettTallet.html'));
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

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = decoded.id;
    next();
  });
}

const port = 3000;

app.listen(port, () => {
    console.log('Server is running on port http://localhost:3000/');
});