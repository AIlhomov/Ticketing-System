const express = require('express');
const router = express.Router();
const userService = require('../src/services/userService'); // Assume you have a service to handle user operations
const { isAdmin } = require('../middleware/role');

// Display user creation form (for admins only)
router.get('/create', isAdmin, (req, res) => {
    res.render('ticket/pages/create_user', {
        user: req.user || null // Pass current user info to the view
    });
});

// Handle user creation (for admins only)
router.post('/create', isAdmin, async (req, res) => {
    const { username, email, role, password } = req.body;

    try {
        await userService.createUser(username, email, role, password);
        res.redirect('/users/manage'); // Redirect to user management page after creation
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
});

// Display all users (for admins only)
router.get('/manage', isAdmin, async (req, res) => {
    try {
        const users = await userService.getAllUsers(); // Function to get all users from the database
        res.render('ticket/pages/user_listing', 
            { users,
                user: req.user || null // Pass current user info to the view
            });
    } catch (error) {
        console.error('Error retrieving users:', error); 
        res.status(500).send('Error retrieving users');
    }
});

module.exports = router;
