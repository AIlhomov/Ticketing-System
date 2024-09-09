/**
 * @swagger
 * Module for ticket
 */

"use strict";

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
    } else {
        console.log('Connected to the database');
    }
});

// Creating new ticket
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

// Get all tickets from the database
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

async function getSortedTickets(sort, order) {
    return new Promise((resolve, reject) => {
        const validColumns = ['id', 'title', 'department', 'status'];
        const sortBy = validColumns.includes(sort) ? sort : 'id';

        const query = `SELECT * FROM tickets ORDER BY ${sortBy} ${order.toUpperCase()}`;
        connection.query(query, (err, tickets) => {
            if (err) {
                reject(err);
            } else {
                resolve(tickets); // Return the sorted tickets
            }
        });
    });
}



// Ticket status
async function updateTicketStatus(id, status) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE tickets SET status = ? WHERE id = ?';
        connection.query(query, [status, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = {
    createTicket,
    getTickets,
    getSortedTickets,
    updateTicketStatus
};
