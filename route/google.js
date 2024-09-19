const express = require('express');
const router = express.Router();
const passport = require('passport');

// Redirect to Google login page
router.get('/', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google callback URL
router.get('/callback', passport.authenticate('google', {
    failureRedirect: '/login'
}), (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
});

module.exports = router;
