const bcrypt = require('bcrypt');
const connection = require('./db');

async function createUser(username, password, email) {
    return new Promise((resolve, reject) => {
        // Hash the password using bcrypt before saving it
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                reject(err);
            }

            // Insert the new user with the hashed password
            const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
            connection.query(query, [username, hash, email], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    });
}

// Function to get a user by username
async function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE username = ?';
        connection.query(query, [username], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
}

// Function to get a user by ID
async function getUserById(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        connection.query(query, [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
}

module.exports = {
    createUser,
    getUserByUsername,
    getUserById
};
