"use strict";
const express = require('express');
const router = express.Router();
const ticketService = require('../src/ticket.js');
const multer = require('multer');
const userService = require('../src/userController.js');
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { isAdmin, isAgent, isUser, isAgentOrAdmin } = require('../middleware/role');

router.get('/', (req, res) => {
    if (req.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/home');
    }
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

router.get('/ticket/new', async (req, res) => {
    try {
        const categories = await ticketService.getAllCategories(); // Fetch categories from the database
        res.render('ticket/pages/new_ticket', {
            categories: categories,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
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

            const userId = req.user ? req.user.id : null;
            const { title, description, category_id, email } = req.body;

            console.log('CATEGORRY:', category_id);

            let userEmail;
            if (req.user) {
                userEmail = req.user.email;
            } else {
                userEmail = email;
                if (!userEmail) {
                    return res.status(400).send('Error: Email is required for anonymous ticket submissions.');
                }
            }
            const ticket = await ticketService.createTicket(title, description, category_id, userEmail, userId, req.files);

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
        // Get the user email for the ticket
        const userEmail = await ticketService.getUserEmailByTicketId(ticketId);

        // Update the ticket status
        await ticketService.updateTicketStatus(ticketId, newStatus, userEmail);

        res.redirect('/ticket/list');
    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).send('Error updating ticket status');
    }
});


// View a single ticket's details
router.get('/ticket/view/:id', async (req, res) => {
    const ticketId = req.params.id;

    try {
        const ticket = await ticketService.getTicketById(ticketId);
        const attachments = await ticketService.getAttachmentsByTicketId(ticketId);

        if (!ticket) {
            return res.status(404).send('Ticket not found');
        }

        const ticketClaim = await ticketService.getTicketClaim(ticketId); // Get the "claimed by" agent

        console.log(ticketClaim);
        console.log("TICKET:: ", ticket)

        res.render('ticket/pages/view_ticket', {
            user: req.user,
            ticket: ticket,
            attachments: attachments,
            role: req.user.role,
            ticketClaim: ticketClaim
        });
    } catch (error) {
        console.error('Error retrieving ticket details:', error);
        return res.status(500).send('Error retrieving ticket details');
    }
});

// Route to close a ticket
router.get('/ticket/close/:id', async (req, res) => {
    const ticketId = req.params.id;

    try {
        // Close the ticket
        await ticketService.closeTicket(ticketId);

        // Fetch ticket details
        const ticket = await ticketService.getTicketById(ticketId);

        // Send email notification
        await ticketService.notifyTicketClosure(ticket);

        res.redirect('/ticket/list');
    } catch (error) {
        console.error('Error closing ticket:', error);
        res.status(500).send('Error closing ticket');
    }
});

// Display a list of tickets
router.get('/ticket/list', isAgent, async (req, res) => {
    const sort = req.query.sort || 'id';
    const order = req.query.order === 'desc' ? 'desc' : 'asc';

    try {
        const tickets = await ticketService.getSortedTicketsWithClaim(sort, order);

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
    const { username, email, password } = req.body;

    try {
        await userService.createUser(username, email, password);
        res.redirect('/login');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send(error);
    }
});

router.get('/login', (req, res) => {
    res.render('ticket/pages/login', { title: 'Login' });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res.render('ticket/pages/login', { 
                message: info ? info.message : 'Login failed. Please try again.' 
            });
        }

        req.logIn(user, (err) => {
            if (err) return next(err);

            if (user.role === 'admin' || user.role === 'agent') {
                return res.redirect('/dashboard');
            } else if (user.role === 'user') {
                return res.redirect('/dashboard');
            } else {
                return res.redirect('/');
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
        res.redirect('/login'); 
    });
});
// --------------------------------------------------------------------------
// Register page
router.get('/register', (req, res) => {
    res.render('ticket/pages/register', { title: 'Register' });
});

// Handle registration
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        const query = 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, "user")';
        connection.query(query, [username, hash, email], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }

            res.redirect('/login');
        });
    });
});

// Dashboard route
router.get('/dashboard', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }

    try {
        let tickets = [];
        let ticketStats = {
            open: 0,
            closed: 0,
            in_progress: 0
        };

        if (req.user.role === 'admin') {
            tickets = await ticketService.getAllTickets();
        } else if (req.user.role === 'agent') {
            tickets = await ticketService.getAllTickets(); // Agents can view all tickets as well
        } else if (req.user.role === 'user') {
            tickets = await ticketService.getTicketsByUserId(req.user.id);
        }
        console.log("HERE ARE DASHBOARD TICKETS: ", req.user);
        tickets.forEach(ticket => {
            if (ticket.status === 'open' || ticket.status === 'open\r') {
                ticketStats.open++;
            } else if (ticket.status === 'closed' || ticket.status === 'closed\r') {
                ticketStats.closed++;
            } else if (ticket.status === 'in_progress' || ticket.status === 'in_progress\r') {
                ticketStats.in_progress++;
            }
        });

        if (req.user.role === 'admin') {
            return res.render('ticket/pages/admin_dashboard', { 
                user: req.user, 
                title: 'Admin Dashboard', 
                ticketStats, 
                tickets 
            });
        }

        if (req.user.role === 'agent') {
            return res.render('ticket/pages/agent_dashboard', { 
                user: req.user, 
                title: 'Agent Dashboard', 
                ticketStats, 
                tickets 
            });
        }

        return res.render('ticket/pages/user_dashboard', { 
            user: req.user, 
            title: 'User Dashboard', 
            ticketStats 
        });

    } catch (error) {
        console.error('Error retrieving tickets:', error);
        return res.status(500).send('Error retrieving tickets');
    }
});



// Route for viewing the user's tickets
router.get('/dashboard/tickets', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }

    try {
        const tickets = await ticketService.getTicketsByUserId(req.user.id);
        return res.render('ticket/pages/user_ticket_list', {
            user: req.user,
            title: 'My Tickets',
            tickets
        });
    } catch (error) {
        console.error('Error retrieving tickets:', error);
        return res.status(500).send('Error retrieving tickets');
    }
});


//Success route
router.get('/ticket/success', (req, res) => {
    res.render('ticket/pages/ticket_success', { title: 'Success' });
});

//-------------------------------------------------------------------------------------------

// Route to claim a ticket
router.post('/ticket/claim/:id', async (req, res) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'agent')) {
        return res.status(403).send('Unauthorized');
    }

    const ticketId = req.params.id;

    try {
        await ticketService.claimTicket(ticketId, req.user.id);  // Save the user ID of the admin claiming the ticket
        res.redirect(`/ticket/view/${ticketId}`);
    } catch (error) {
        console.error('Error claiming ticket:', error);
        res.status(500).send('Error claiming ticket');
    }
});

// -----------------------------------------------

// Route to show category management page (for agents)
router.get('/categories/manage', isAgent, async (req, res) => {
    try {
        const categories = await ticketService.getAllCategories();
        res.render('ticket/pages/manage_categories', { categories, user: req.user });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
});

router.post('/categories/create', isAgent, async (req, res) => {
    const { name } = req.body;
    try {
        await ticketService.createCategory(name);
        res.redirect('/categories/manage');
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).send('Error creating category');
    }
});

router.post('/categories/delete/:id', isAgent, async (req, res) => {
    const categoryId = req.params.id;
    try {
        await ticketService.deleteCategory(categoryId);
        res.redirect('/categories/manage');
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send('Error deleting category');
    }
});

// -----------------------------------------------
// Route to display the edit form
router.get('/ticket/edit/:id', isAgentOrAdmin, async (req, res) => {
    const ticketId = req.params.id;

    try {
        // Fetch the ticket data and categories
        const ticket = await ticketService.getTicketById(ticketId);
        const categories = await ticketService.getAllCategories(); // Fetch categories

        res.render('ticket/pages/edit_ticket', { 
            ticket: ticket,
            categories: categories,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).send('Error fetching ticket data');
    }
});

// Route to handle the ticket edit form submission
router.post('/ticket/edit/:id', isAgentOrAdmin, async (req, res) => {
    const ticketId = req.params.id;
    const { title, description, category } = req.body;

    try {
        // Update the ticket
        await ticketService.updateTicket(ticketId, { title, description, category });
        res.redirect('/ticket/list');
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).send('Error updating ticket');
    }
});


module.exports = router;
