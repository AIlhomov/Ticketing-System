"use strict";
const express = require('express');
const router = express.Router();
const ticketService = require('../src/ticket.js');
const multer = require('multer');
const userController = require('../src/userController.js');
const userService = require('../src/services/userService.js');
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const emailService = require('../src/emailService.js');
const crypto = require('crypto');
const axios = require('axios');

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
        if (err) {
            return res.status(400).send('Error uploading files: ' + err.message);
        }

        try {
            const userId = req.user ? req.user.id : null;
            const { title, description, category_id, category_name } = req.body;

            let finalCategoryId;

            // If category_id is 'new_category', automatically create the new category
            if (category_id === 'new_category') {
                if (!category_name) {
                    return res.status(400).send('Error: Category name is required for new categories.');
                }

                // Check if the category already exists
                let existingCategory = await ticketService.getCategoryByName(category_name);

                if (existingCategory) {
                    finalCategoryId = existingCategory.id;
                } else {
                    // Automatically create the new category
                    let newCategory = await ticketService.createCategory(category_name);
                    finalCategoryId = newCategory.id;
                }
            } else {
                // Validate that category_id is a valid integer
                finalCategoryId = parseInt(category_id, 10);
                if (isNaN(finalCategoryId)) {
                    return res.status(400).send('Error: Invalid category ID.');
                }

                const exists = await ticketService.categoryExists(finalCategoryId);
                if (!exists) {
                    return res.status(400).send('Error: Selected category does not exist.');
                }
            }

            // Proceed to create the ticket with the final category ID
            const ticket = await ticketService.createTicket(
                title,
                description,
                finalCategoryId,
                req.user.email,
                userId,
                req.files
            );

            res.redirect('/ticket/success');
        } catch (error) {
            console.error('Error creating ticket:', error);
            res.status(500).send('Error creating ticket');
        }
    });
});





// Route to update the status of a ticket
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


// View a single ticket's details and handle comment submission
router.get('/ticket/view/:id', async (req, res) => {
    const ticketId = req.params.id;

    try {
        const ticket = await ticketService.getTicketById(ticketId);
        const attachments = await ticketService.getAttachmentsByTicketId(ticketId);
        const comments = await ticketService.getTicketComments(ticketId); // Get all comments

        if (!ticket) {
            return res.status(404).send('Ticket not found');
        }

        const ticketClaim = await ticketService.getTicketClaim(ticketId); // Get the "claimed by" agent

        res.render('ticket/pages/view_ticket', {
            user: req.user,
            ticket: ticket,
            attachments: attachments,
            role: req.user.role,
            ticketClaim: ticketClaim,
            comments: comments // Add comments data
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
        await userService.createUser(username, email, "user", password); // When a new user registers they are assigned the role of "user"
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



// Route for viewing and sorting the user's tickets
router.get('/dashboard/tickets', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }

    const sort = req.query.sort || 'id';
    const order = req.query.order === 'desc' ? 'desc' : 'asc';

    try {
        const tickets = await ticketService.getSortedTicketsByUser(req.user.id, sort, order); // New service function

        return res.render('ticket/pages/user_ticket_list', {
            user: req.user,
            title: 'My Tickets',
            tickets,
            sort,
            order
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

// Route to create a new category (for agents)
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

// Route to edit an existing category (for agents)
router.post('/categories/edit', isAgent, async (req, res) => {
    const { categoryId, categoryName } = req.body;
    try {
        await ticketService.updateCategory(categoryId, categoryName);
        res.redirect('/categories/manage');
    } catch (error) {
        console.error('Error editing category:', error);
        res.status(500).send('Error editing category');
    }
});

// Fetch tickets associated with a category (for confirmation modal)
router.get('/categories/tickets/:categoryId', isAgent, async (req, res) => {
    const categoryId = req.params.categoryId;
    try {
        const tickets = await ticketService.getTicketsByCategoryId(categoryId);
        res.json(tickets); // Send tickets as JSON
    } catch (error) {
        console.error('Error fetching tickets by category:', error);
        res.status(500).send('Error fetching tickets');
    }
});

// Route to delete a category (for agents)
router.post('/categories/delete', isAgent, async (req, res) => {
    const categoryId = req.body.categoryId;
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
        const categories = await ticketService.getAllCategories();

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
    const updateData = { category }; // Start with only category

    // Allow updating title and description only if the user is an admin
    if (req.user.role === 'admin') {
        if (title) updateData.title = title;
        if (description) updateData.description = description;
    }

    try {
        await ticketService.updateTicket(ticketId, updateData);
        res.redirect('/ticket/list');
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).send('Error updating ticket');
    }
});

// Password - Reset

// Route to display the forgot password form
router.get('/forgot-password', (req, res) => {
    res.render('ticket/pages/forgot_password');
});


// Route for displaying the reset password form
router.get('/reset-password/:token', async (req, res) => {
    const user = await userController.findUserByResetToken(req.params.token);

    if (!user || user.reset_password_expires < Date.now()) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot-password');
    }

    res.render('ticket/pages/reset_password', { token: req.params.token });
});

// Route for handling forgot password submissions
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userController.findUserByEmail(email);
        if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot-password');
        }

        // Generate a reset token
        const token = crypto.randomBytes(20).toString('hex');
        
        await userController.setResetPasswordToken(user.id, token);

        await emailService.sendPasswordResetEmail(email, token);

        req.flash('message', 'An e-mail has been sent to ' + email + ' with further instructions.');
        res.redirect('/login');

    } catch (error) {
        console.error('Error handling forgot password:', error);
        res.status(500).send('Error handling forgot password.');
    }
});

// Route to handle resetting the password
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    const token = req.params.token;

    try {
        const user = await userController.findUserByResetToken(token);
        if (!user || user.reset_password_expires < Date.now()) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await userController.updatePassword(user.id, hashedPassword);

        req.flash('message', 'Your password has been reset successfully. You can now log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Error resetting password.');
    }
});



// Route to handle posting a comment
router.post('/ticket/comment/:id', async (req, res) => {
    const ticketId = req.params.id;
    const { comment } = req.body;

    try {
        const ticket = await ticketService.getTicketById(ticketId);

        if (!ticket) {
            return res.status(404).send('Ticket not found');
        }

        // Check if the user is allowed to comment
        if (req.user.role === 'user' && ticket.user_id !== req.user.id) {
            req.flash('error', 'You can only comment on your own tickets.');
            return res.redirect(`/ticket/view/${ticketId}`);
        }

        if (req.user.role === 'agent' && (!ticket.claimed_by || ticket.claimed_by !== req.user.id)) {
            req.flash('error', 'You can only comment on tickets you have claimed.');
            return res.redirect(`/ticket/view/${ticketId}`);
        }

        // Admins can always comment
        await ticketService.addComment(ticketId, req.user.id, comment);

        res.redirect(`/ticket/view/${ticketId}`);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Error adding comment');
    }
});

// --------------------------------------------------------------------------



module.exports = router;
