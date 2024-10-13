const bcrypt = require('bcrypt');
const connection = require('../db');

// // Function to create a new user
// async function createUser(username, email, role, password) {
//     const hashedPassword = await bcrypt.hash(password, 10); // Hash password before storing it

//     return new Promise((resolve, reject) => {
//         const query = 'INSERT INTO users (username, email, role, password) VALUES (?, ?, ?, ?)';
//         connection.query(query, [username, email, role, hashedPassword], (err, result) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(result);
//         });
//     });
// }

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


module.exports = {
    getAllUsers
};
