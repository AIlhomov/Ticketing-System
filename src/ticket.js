/**
 * Module for ticket
 */

"use strict";

const connection = require('./db.js');
const multer = require('multer');
const path = require('path');
const { sendEmail } = require('./emailService');

async function createTicket(title, description, category_id, email, userId, files) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO tickets (title, description, category_id, email, user_id, status) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(query, [title, description, category_id, email, userId, 'open'], (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            const ticketId = result.insertId;
            console.log(ticketId);
            if (files && files.length > 0) {
                const attachmentQuery = 'INSERT INTO attachments (ticket_id, file_name, file_path, mime_type, size) VALUES ?';
                const attachmentData = files.map(file => [ticketId, file.filename, file.path, file.mimetype, file.size]);

                connection.query(attachmentQuery, [attachmentData], (err, attachmentResult) => {
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

async function getSortedTickets(sort, order) { // Prob.
    return new Promise((resolve, reject) => {
        const validColumns = ['id', 'title', 'category', 'status'];
        const sortBy = validColumns.includes(sort) ? sort : 'id';

        const query = `SELECT * FROM tickets ORDER BY ${sortBy} ${order.toUpperCase()}`;
        connection.query(query, (err, tickets) => {
            if (err) {
                reject(err);
            } else {
                resolve(tickets);
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

async function getTicketById(id) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT t.*, u.username AS claimed_by_username
            FROM tickets t
            LEFT JOIN users u ON t.claimed_by = u.id
            WHERE t.id = ?
        `;
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
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedFilename = file.originalname.replace(/\s+/g, '_');
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
}).array('file', 5);

// Get attachment by ticket ID
async function getAttachmentByTicketId(ticketId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM attachments WHERE ticket_id = ?';
        connection.query(query, [ticketId], (err, result) => {
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

// Save the attachment data to the database
async function saveAttachment(attachmentData) {
    const query = 'INSERT INTO attachments (ticket_id, file_name, file_path, mime_type, size) VALUES (?, ?, ?, ?, ?)';
    const values = [
        attachmentData.ticket_id,
        attachmentData.file_name,
        attachmentData.file_path,
        attachmentData.mime_type,
        attachmentData.size
    ];
    console.log('Inserting into attachments:', attachmentData);
    
    return new Promise((resolve, reject) => {
        connection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error saving attachment:', err);
                return reject(err);
            }
            resolve(result);
        });
    });
}


// Function to fetch all tickets (for admin)
async function getAllTickets() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT tickets.*, categories.name AS category_name 
            FROM tickets 
            LEFT JOIN categories ON tickets.category_id = categories.id
        `;
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
async function getAttachmentsByTicketId(ticketId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM attachments WHERE ticket_id = ?';
        connection.query(query, [ticketId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}


// Count tickets by status for admin
async function countTicketsByStatus(status) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS count FROM tickets WHERE status = ?';
        connection.query(query, [status], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0].count);
            }
        });
    });
}

// Count tickets by status for user
async function countTicketsByUserAndStatus(userId, status) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS count FROM tickets WHERE user_id = ? AND status = ?';
        connection.query(query, [userId, status], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0].count);
            }
        });
    });
}

async function claimTicket(ticketId, userId) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE tickets SET claimed_by = ? WHERE id = ?';
        connection.query(query, [userId, ticketId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

// ------------------------------------------------------------
async function getSortedTicketsWithClaim(sort, order) {
    return new Promise((resolve, reject) => {
        let validSortColumns = ['id', 'title', 'status', 'created_at', 'category_name', 'claimed_by_username']; // List of valid columns to sort by

        if (!validSortColumns.includes(sort)) {
            sort = 'id'; // Fallback to 'id' if the sort column is invalid
        }

        const query = `
            SELECT t.*, u.username AS claimed_by_username, c.name AS category_name 
            FROM tickets t 
            LEFT JOIN users u ON t.claimed_by = u.id
            LEFT JOIN categories c ON t.category_id = c.id
            ORDER BY ?? ${order};
        `;

        connection.query(query, [sort], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}



// Update ticket status and send notification
async function updateTicketStatus(ticketId, status) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE tickets SET status = ? WHERE id = ?';
        connection.query(query, [status, ticketId], async (err, result) => {
            if (err) {
                reject(err);
            } else {
                // Get the userId and userEmail associated with the ticket
                const userQuery = 'SELECT user_id, email FROM tickets WHERE id = ?';
                connection.query(userQuery, [ticketId], async (err, userResult) => {
                    if (err) {
                        reject(err);
                    } else if (userResult.length === 0) {
                        reject('No user found for this ticket');
                    } else {
                        const { user_id, email } = userResult[0];  // Get userId and userEmail

                        // Email notification to the user
                        const emailSubject = `Your ticket status has been updated`;
                        const emailContent = `
                            <p>Dear User,</p>
                            <p>The status of your ticket has been updated to: <strong>${status}</strong>.</p>
                            <p>Thank you for using our support service.</p>
                            <p>Best regards,<br/>Ticketing Support Team</p>
                        `;

                        try {
                            // Pass both userId and userEmail to the sendEmail function
                            await sendEmail(email, emailSubject, emailContent, user_id);
                            console.log('Email sent successfully');
                        } catch (error) {
                            console.error('Error sending email:', error);
                        }

                        resolve(result);
                    }
                });
            }
        });
    });
}


async function getUserEmailByTicketId(ticketId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT email FROM tickets WHERE id = ?';
        connection.query(query, [ticketId], (err, result) => {
            if (err) {
                reject(err);
            } else if (result.length === 0) {
                resolve(null);
            } else {
                resolve(result[0].email);
            }
        });
    });
}


// Function to close a ticket
async function closeTicket(ticketId) {
    const updateQuery = 'UPDATE tickets SET status = "closed" WHERE id = ?';

    return new Promise((resolve, reject) => {
        connection.query(updateQuery, [ticketId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

// Function to fetch ticket details
async function getTicketById(ticketId) {
    const ticketQuery = 'SELECT * FROM tickets WHERE id = ?';

    return new Promise((resolve, reject) => {
        connection.query(ticketQuery, [ticketId], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
}

// Function to send email notification
async function notifyTicketClosure(ticket) {
    const emailSubject = `Ticket #${ticket.id} Closed`;
    const emailBody = `<p>Your ticket titled "${ticket.title}" has been closed.</p>`;

    if (ticket.email) {
        await sendEmail(ticket.email, emailSubject, emailBody);
    } else {
        console.error('No email associated with this ticket.');
    }
}

// Get all categories
async function getAllCategories() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM categories';
        connection.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// Create a new category
async function createCategory(name) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO categories (name) VALUES (?)';
        connection.query(query, [name], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

// Delete a category
async function deleteCategory(id) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM categories WHERE id = ?';
        connection.query(query, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

async function getTicketClaim(ticketId) {
    return new Promise((resolve, reject) => {
        const query = ` SELECT t.*, u.username AS claimed_by_username 
                        FROM tickets t 
                        LEFT JOIN users u ON t.claimed_by = u.id
                        WHERE t.id = ?;`;
        connection.query(query, [ticketId], (err, result) => {
            if (err) {
                reject(err);
            } else if (result.length === 0) {
                resolve(null);
            } else {
                resolve(result[0].claimed_by_username);
            }
        });
    });
}

async function getTicketById(ticketId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT t.*, c.name as category_name
            FROM tickets t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.id = ?
        `;
        connection.query(query, [ticketId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
}

async function updateTicket(ticketId, updatedData) {
    return new Promise((resolve, reject) => {
        const { title, description, category } = updatedData;
        const query = `
            UPDATE tickets 
            SET title = ?, description = ?, category_id = ? 
            WHERE id = ?
        `;
        connection.query(query, [title, description, category, ticketId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getSortedTicketsByUser(userId, sort, order) {
    return new Promise((resolve, reject) => {
        let validSortColumns = ['id', 'title', 'status', 'created_at', 'category_name', 'claimed_by_username']; // List of valid columns to sort by

        if (!validSortColumns.includes(sort)) {
            sort = 'id'; // Fallback to 'id' if the sort column is invalid
        }

        const query = `
            SELECT t.*, u.username AS claimed_by_username, c.name AS category_name 
            FROM tickets t 
            LEFT JOIN users u ON t.claimed_by = u.id
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = ?  -- Ensure only the logged-in user's tickets are fetched
            ORDER BY ?? ${order};
        `;

        connection.query(query, [userId, sort], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Fetch tickets by category ID
async function getTicketsByCategoryId(categoryId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM tickets WHERE category_id = ?;
        `;
        connection.query(query, [categoryId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Get all comments for a specific ticket
async function getTicketComments(ticketId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT comments.text, comments.created_at, users.username 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            WHERE comments.ticket_id = ?
            ORDER BY comments.created_at ASC
        `;
        connection.query(query, [ticketId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

// Add a comment to a ticket
async function addComment(ticketId, userId, commentText) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO comments (ticket_id, user_id, text, created_at) VALUES (?, ?, ?, NOW())';
        connection.query(query, [ticketId, userId, commentText], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

async function getCategoryByName(categoryName) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, name FROM categories WHERE name = ?';
        connection.query(query, [categoryName], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length > 0) {
                resolve(results[0]); // Return the category object
            } else {
                resolve(null); // Category not found
            }
        });
    });
}

async function categoryExists(categoryId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id FROM categories WHERE id = ?';
        connection.query(query, [categoryId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.length > 0); // Returns true if exists, false otherwise
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
    getTicketsByUserId,
    getAttachmentsByTicketId,
    countTicketsByStatus,
    countTicketsByUserAndStatus,
    claimTicket,
    getSortedTicketsWithClaim,
    updateTicketStatus,
    getUserEmailByTicketId,
    closeTicket,
    getTicketById,
    notifyTicketClosure,
    getAllCategories,
    createCategory,
    deleteCategory,
    getTicketClaim,
    getTicketById,
    updateTicket,
    getSortedTicketsByUser,
    getTicketsByCategoryId,
    getTicketComments,
    addComment,
    getCategoryByName,
    categoryExists
};
