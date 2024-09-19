const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const connection = require('./db');
require('dotenv').config();

// Local strategy for username/password login
passport.use(new LocalStrategy((username, password, done) => {
    const query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) return done(err);
        if (results.length === 0) return done(null, false, { message: 'Incorrect username.' });

        const user = results[0];
        
        // Validate password using bcrypt
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return done(err);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
}));

// Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    const googleId = profile.id;
    const email = profile.emails[0].value;
    
    const query = 'SELECT * FROM users WHERE google_id = ? OR email = ?';
    connection.query(query, [googleId, email], (err, results) => {
        if (err) return done(err);

        if (results.length === 0) {
            // Insert new user into the database
            const insertQuery = 'INSERT INTO users (google_id, email) VALUES (?, ?)';
            connection.query(insertQuery, [googleId, email], (err, result) => {
                if (err) return done(err);

                const newUser = { id: result.insertId, google_id: googleId, email: email };
                return done(null, newUser);
            });
        } else {
            return done(null, results[0]);
        }
    });
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) return done(err);
        done(null, results[0]);
    });
});
