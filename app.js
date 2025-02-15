const express = require('express');
const path = require('path');

const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
});

const port = 3000;

app.listen(port, () => {
    console.log('Server is running on port http://localhost:3000/');
});