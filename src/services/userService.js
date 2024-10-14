const bcrypt = require('bcrypt');
const connection = require('../db');

// Function to create a new user
async function createUser(username, email, role, password) {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password before storing it

    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO users (username, email, role, password) VALUES (?, ?, ?, ?)';
        connection.query(query, [username, email, role, hashedPassword], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

async function getAllUsers() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users';
        connection.query(query, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

// Function to get a user by their ID
async function getUserById(userId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        connection.query(query, [userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results[0]);
        });
    });
}

// Function to update user details
async function updateUser(userId, username, email, role) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?';
        connection.query(query, [username, email, role, userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

// Function to delete a user
async function deleteUser(userId) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM users WHERE id = ?';
        connection.query(query, [userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}


module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser
};
