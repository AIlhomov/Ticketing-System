/**
 * @swagger
 * Module for ticket
 */

"use strict";

module.exports = {
    testConnection: testConnection
};

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

async function testConnection() {
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to database: ', err);
            return;
        }
        console.log('Connected to the database');
    });
}

