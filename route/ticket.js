"use strict";
const express = require('express');
const router = express.Router();
const ticketService = require('../src/ticket.js');
const multer = require('multer');
const userService = require('../src/userController.js');
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/', (req, res) => {
    res.redirect('ticket/index');
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
        message: 'Create a new ticket'
    };
    res.render('ticket/pages/new_ticket', data);
});

// Create a new ticket
router.post('/ticket/new', (req, res) => {
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

            // Create the ticket in the database
            const { title, description, department } = req.body;
            const ticket = await ticketService.createTicket(title, description, department);

            // If files were uploaded, save the attachments to the database
            if (req.files && req.files.length > 0) {
                const attachmentPromises = req.files.map(file => {
                    const attachmentData = {
                        ticket_id: ticket.insertId,
                        file_name: file.filename,
                        file_path: file.path,
                        mime_type: file.mimetype,
                        size: file.size
                    };
                    return ticketService.saveAttachment(attachmentData);
                });

                await Promise.all(attachmentPromises);
            }

            res.redirect('/ticket/list');
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
        const ticket = await ticketService.getTicketById(ticketId);
        const attachment = await ticketService.getAttachmentByTicketId(ticketId);

        res.render('ticket/pages/view_ticket', { ticket, attachment });
    } catch (err) {
        console.error('Error fetching ticket:', err);
        res.status(500).send('Error fetching ticket details.');
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
router.get('/ticket/list', async (req, res) => {
    const sort = req.query.sort || 'id';
    const order = req.query.order === 'desc' ? 'desc' : 'asc';

    try {
        const tickets = await ticketService.getSortedTickets(sort, order);
        
        res.render('ticket/pages/list_tickets', { 
            title: 'List of Tickets', 
            tickets, 
            sort, 
            order 
        });
    } catch (error) {
        console.error('Error retrieving tickets:', error);
        res.status(500).send('Error retrieving tickets');
    }
});

// -----------------------------------------------
// Registration route
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        await userService.createUser(username, password, email);
        res.redirect('/login');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
});

// Render the login page
router.get('/login', (req, res) => {
    res.render('ticket/pages/login', { title: 'Login' });
});

// Handle login form submission using a local strategy
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            // Show error message if login failed
            return res.render('ticket/pages/login', { message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            // Redirect to dashboard or home on success
            return res.redirect('/dashboard');
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
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
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

module.exports = router;
