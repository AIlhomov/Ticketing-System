const connection = require('../db');

// Get all articles
async function getAllArticles() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM knowledge_base ORDER BY created_at DESC';
        connection.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Create a new article
async function createArticle(title, content, category, createdBy) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO knowledge_base (title, content, category, created_by) VALUES (?, ?, ?, ?)';
        connection.query(query, [title, content, category, createdBy], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}


// Delete an article
async function deleteArticle(id) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM knowledge_base WHERE id = ?';
        connection.query(query, [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

async function getArticleById(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM knowledge_base WHERE id = ?';
        connection.query(query, [id], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result[0]);
        });
    });
}


module.exports = {
    getAllArticles,
    createArticle,
    deleteArticle,
    getArticleById
};
