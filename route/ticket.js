"use strict";
const express = require('express');
const router = express.Router();
const ticketService = require('../src/ticket.js');
const multer = require('multer');
const userService = require('../src/userController.js');
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { isAdmin, isUser } = require('../middleware/role');

router.get('/', (req, res) => {
    res.redirect('ticket/home');
});

router.get('/home', (req, res) => {
    res.render('ticket/pages/homepage', { title: 'Home', user: req.user || null });
});

router.get('/ticket/index', (req, res) => {
    let data = {
        title: 'Ticket',
        message: 'Welcome to the ticket page!',
        user: req.user || null
    };
    res.render('ticket/pages/index', data);
});

router.get('/ticket/new', (req, res) => {
    let data = {
        title: 'New Ticket',
        message: 'Create a new ticket',
        user: req.user || null
    };
    res.render('ticket/pages/new_ticket', data);
});

// Create a new ticket
router.post('/ticket/new', (req, res) => {

    if (!req.user) {
        return res.status(401).send('Unauthorized: User not logged in');
    }

    ticketService.uploadFiles(req, res, async (err) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('Error: Each file must be less than 1MB.');
        } else if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).send('Error: You can only upload up to 5 files.');
        } else if (err) {
            return res.status(400).send('Error uploading files: ' + err.message);
        }

        try {
            console.log('Uploaded Files:', req.files);
            console.log('Form Data:', req.body);

            const userId = req.user ? req.user.id : null; // Ensure this is an integer, not an object
            const { title, description, department, email } = req.body;

            let userEmail;
            if (req.user) {
                userEmail = req.user.email; // Use the email of the logged-in user
            } else {
                userEmail = email; // Use the provided email for anonymous users
                if (!userEmail) {
                    return res.status(400).send('Error: Email is required for anonymous ticket submissions.');
                }
            }
            // Create the ticket in the database and pass the files array
            const ticket = await ticketService.createTicket(title, description, department, userEmail, userId, req.files);

            // Redirect to success page or confirmation message
            res.redirect('/ticket/success');
        } catch (error) {
            console.error('Error creating ticket:', error);
            res.status(500).send('Error creating ticket');
        }
    });
});





router.post('/ticket/update-status/:id', async (req, res) => {
    const ticketId = req.params.id;
    const newStatus = req.body.status;

    try {
        await ticketService.updateTicketStatus(ticketId, newStatus);
        res.redirect('/ticket/list');
    } catch (err) {
        console.error('Error updating ticket status:', err);
        res.status(500).send('Error updating status');
    }
});

// View a single tickets details
router.get('/ticket/view/:id', async (req, res) => {
    const ticketId = req.params.id;

    try {
        // Fetch ticket details
        const ticket = await ticketService.getTicketById(ticketId);

        // Fetch related attachments
        const attachments = await ticketService.getAttachmentsByTicketId(ticketId);

        if (!ticket) {
            return res.status(404).send('Ticket not found');
        }

        // Render the view_ticket page and pass ticket and attachments data
        res.render('ticket/pages/view_ticket', {
            user: req.user,  // Pass the user for role-based rendering
            ticket: ticket,
            attachments: attachments  // Pass attachments here
        });
    } catch (error) {
        console.error('Error retrieving ticket details:', error);
        return res.status(500).send('Error retrieving ticket details');
    }
});

// Close a single ticket
router.get('/ticket/close/:id', async (req, res) => {
    const ticketId = req.params.id;

    try {
        await ticketService.updateTicketStatus(ticketId, 'closed');
        res.redirect('/ticket/list');
    } catch (err) {
        console.error('Error closing ticket:', err);
        res.status(500).send('Error closing ticket');
    }
});

// Display a list of tickets
router.get('/ticket/list', isAdmin, async (req, res) => {
    const sort = req.query.sort || 'id';
    const order = req.query.order === 'desc' ? 'desc' : 'asc';

    try {
        const tickets = await ticketService.getSortedTickets(sort, order);
        
        res.render('ticket/pages/list_tickets', { 
            title: 'List of Tickets', 
            tickets, 
            sort, 
            order,
            user: req.user || null 
        });
    } catch (error) {
        console.error('Error retrieving tickets:', error);
        res.status(500).send('Error retrieving tickets');
    }
});

// -----------------------------------------------
// Registration route
router.post('/register', async (req, res) => {
    const { username, password, email, role } = req.body;

    try {
        await userService.createUser(username, password, email, role);
        res.redirect('/login');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
});

router.get('/login', (req, res) => {
    res.render('ticket/pages/login', { title: 'Login' });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            // Show error message if login failed
            return res.render('ticket/pages/login', { 
                message: info ? info.message : 'Login failed. Please try again.' 
            });
        }

        req.logIn(user, (err) => {
            if (err) return next(err);

            // Redirect to dashboard based on user role
            if (user.role === 'admin') {
                return res.redirect('/dashboard');
            } else if (user.role === 'user') {
                return res.redirect('/dashboard'); // Adjust according to your flow
            } else {
                return res.redirect('/'); // Default to home page
            }
        });
    })(req, res, next);
});


// Google OAuth login route
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/dashboard');
});

// Log out route
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/login'); // Redirect to login or another page after logging out
    });
});
// --------------------------------------------------------------------------
// Show register page
router.get('/register', (req, res) => {
    res.render('ticket/pages/register', { title: 'Register' });
});

// Handle registration
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Hash the password
    bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        // Insert the user into the database
        const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
        connection.query(query, [username, hash, email], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            // Redirect to the login page after successful registration
            res.redirect('/login');
        });
    });
});

// Dashboard route
router.get('/dashboard', async (req, res) => {
    // Check if the user is logged in
    if (!req.user) {
        return res.redirect('/login');
    }

    try {
        let tickets = [];

        // If the user is an admin, fetch all tickets
        if (req.user.role === 'admin') {
            tickets = await ticketService.getAllTickets(); // Fetch all tickets for admin
            return res.render('ticket/pages/admin_dashboard', { 
                user: req.user, 
                title: 'Admin Dashboard', 
                tickets 
            });
        }

        // If the user is a regular user, fetch only their submitted tickets
        if (req.user.role === 'user') {
            tickets = await ticketService.getTicketsByUserId(req.user.id); // Fetch user's tickets
            return res.render('ticket/pages/user_dashboard', { 
                user: req.user, 
                title: 'User Dashboard', 
                tickets 
            });
        }

        // Handle any unexpected roles by redirecting to login or throwing an error
        return res.redirect('/login');

    } catch (error) {
        console.error('Error retrieving tickets:', error);
        return res.status(500).send('Error retrieving tickets');
    }
});


//Success route
router.get('/ticket/success', (req, res) => {
    res.render('ticket/pages/ticket_success', { title: 'Success' });
});

module.exports = router;
