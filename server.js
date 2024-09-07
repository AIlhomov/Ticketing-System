/*
* This is the main file for the server. It will be responsible for handling all the requests and responses.
* It will also be responsible for connecting to the database.
*/

"use strict";
const path = require('path');
const express = require('express');
const app = express();
const port = 1337;

const mysql = require('mysql2');
require('dotenv').config();

// Database connection
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ', err);
        return;
    }
    console.log('Connected to the database');
});



app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
