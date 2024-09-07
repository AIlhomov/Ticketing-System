/**
 * @swagger
 * Module for ticket
 */

"use strict";

const mysql = require('mysql2');
require('dotenv').config();

// Database connection configuration
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
    } else {
        console.log('Connected to the database');
    }
});

// Function to create a new ticket in the database
async function createTicket(title, description, department) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO tickets (title, description, department, status) VALUES (?, ?, ?, ?)';
        connection.query(query, [title, description, department, 'open'], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

// Function to get all tickets from the database
async function getTickets() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tickets';
        connection.query(query, (err, tickets) => {
            if (err) {
                reject(err);
            } else {
                resolve(tickets);
            }
        });
    });
}

module.exports = {
    createTicket,
    getTickets
};
