/*
* This is the main file for the server. It will be responsible for handling all the requests and responses.
* It will also be responsible for connecting to the database.
*/

"use strict";
const path = require('path');
const express = require('express');
const app = express();
const port = 1337;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',   // Update as per your credentials
    password: 'password',
    database: 'ticketing_system'
});


app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
