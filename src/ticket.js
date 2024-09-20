/**
 * @swagger
 * Module for ticket
 */

"use strict";

const connection = require('./db.js');
const multer = require('multer');
const path = require('path');

async function createTicket(title, description, department, email, file) {
    return new Promise((resolve, reject) => {
        
        const query = 'INSERT INTO tickets (title, description, department, status) VALUES (?, ?, ?, ?)';
        connection.query(query, [title, description, department, email, 'open'], (err, result) => {
            if (err) {
                reject(err);
                return;
            } 

            const ticketId = result.insertId;

            if (file) {
                const attachmentQuery = 'INSERT INTO attachments (ticket_id, file_name, file_path, mime_type, size) VALUES (?, ?, ?, ?, ?)';
                connection.query(attachmentQuery, [ticketId, file.filename, file.path, file.mimetype, file.size], (err, attachmentResult) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(attachmentResult);
                    }
                });
            } else {
                resolve(result);
            }
            
        });
    });
}


// Get all tickets from the database
async function getTickets() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT t.*, a.file_name, a.file_path FROM tickets t
            LEFT JOIN attachments a ON t.id = a.ticket_id
        `;
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

// Fetch a single ticket by ID
async function getTicketById(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tickets WHERE id = ?';
        connection.query(query, [id], (err, result) => {
            if (err) {
                reject(err);
            } else if (result.length === 0) {
                resolve(null);
            } else {
                resolve(result[0]);
            }
        });
    });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedFilename = file.originalname.replace(/\s+/g, '_'); // Replace spaces with underscores
        cb(null, uniqueSuffix + '-' + sanitizedFilename);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Error: File type not supported!'));
    }
};

// Multer upload configuration
const uploadFiles = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024, files: 5 }, // 1MB per file, up to 5 files
    fileFilter: fileFilter
}).array('file', 5); // Expecting up to 5 files from 'attachments' field

// Get attachment by ticket ID
async function getAttachmentByTicketId(ticketId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM attachments WHERE ticket_id = ?';
        connection.query(query, [ticketId], (err, result) => {
            if (err) {
                reject(err);
            } else if (result.length === 0) {
                resolve(null); // No attachment found
            } else {
                resolve(result[0]); // Return the attachment
            }
        });
    });
}

// Save the attachment data to the database
async function saveAttachment(attachmentData) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO attachments (ticket_id, file_name, file_path, mime_type, size) 
                       VALUES (?, ?, ?, ?, ?)`;
        const values = [
            attachmentData.ticket_id,
            attachmentData.file_name,
            attachmentData.file_path,
            attachmentData.mime_type,
            attachmentData.size
        ];

        connection.query(query, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

// Function to fetch all tickets (for admin)
async function getAllTickets() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tickets';
        connection.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// Function to fetch tickets by user ID (for regular user)
async function getTicketsByUserId(userId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tickets WHERE user_id = ?';
        connection.query(query, [userId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

module.exports = {
    createTicket,
    getTickets,
    getSortedTickets,
    updateTicketStatus,
    getTicketById,
    uploadFiles,
    getAttachmentByTicketId,
    saveAttachment,
    getAllTickets,
    getTicketsByUserId
};
