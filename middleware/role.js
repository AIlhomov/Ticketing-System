/** Middleware to check if the user is an admin or a user **/

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).send('Access denied: Admins only');
    }
}

function isUser(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'user') {
        return next();
    } else {
        return res.status(403).send('Access denied');
    }
}

function isAgent(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'agent' || req.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).send('Access denied');
    }
}

module.exports = {
    isAdmin,
    isUser,
    isAgent
};