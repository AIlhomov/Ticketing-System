// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next(); // User is authenticated and an admin
    } else {
        return res.status(403).send('Access denied: Admins only');
    }
}

// Middleware to check if the user is a regular user
function isUser(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'user') {
        return next(); // User is authenticated and a regular user
    } else {
        return res.status(403).send('Access denied');
    }
}

module.exports = {
    isAdmin,
    isUser
};