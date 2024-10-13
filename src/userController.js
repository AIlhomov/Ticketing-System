const bcrypt = require('bcrypt');
const connection = require('./db');

async function createUser(username, email, password) {
    return new Promise((resolve, reject) => {
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                reject(err);
            }

            const query = 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, "user")';
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


// Function to find a user by their email
async function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        connection.query(query, [email], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
}

// Function to find a user by reset token
async function findUserByResetToken(token) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE reset_password_token = ?';
        connection.query(query, [token], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
}

// Function to set the reset token and expiration
async function setResetPasswordToken(userId, token) {
    const expires = Date.now() + 3600000; // 1 hour expiration
    return new Promise((resolve, reject) => {
        const query = 'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?';
        connection.query(query, [token, expires, userId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// Function to update the user's password and clear reset token and expiration
async function updatePassword(userId, newPassword) {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE users 
            SET password = ?, reset_password_token = NULL, reset_password_expires = NULL 
            WHERE id = ?
        `;
        connection.query(query, [newPassword, userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}


module.exports = {
    createUser,
    getUserByUsername,
    getUserById,
    findUserByEmail,
    findUserByResetToken,
    setResetPasswordToken,
    updatePassword
};
