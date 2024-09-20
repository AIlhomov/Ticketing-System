const bcrypt = require('bcrypt');
const connection = require('../src/db.js');

async function hashPasswords() {
    const users = [
        { username: 'admin', password: 'admin' },
        { username: 'user', password: 'user' }
    ];

    for (let user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const query = 'UPDATE users SET password = ? WHERE username = ?';
        connection.query(query, [hashedPassword, user.username], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
            } else {
                console.log(`Password for ${user.username} updated successfully.`);
            }
        });
    }
}

hashPasswords();
