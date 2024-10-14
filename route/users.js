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
        res.redirect('/users/manage');
    } catch (error) {
        console.error('Error creating user:', error);

        // Check if the error is due to a duplicate entry
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).render('ticket/pages/user_exists', {
                message: 'User already exists. Please choose a different username or email.',
                user: req.user

            });
        }
        res.status(500).send('Error creating user');
    }
});

// Display all users (for admins only)
router.get('/manage', isAdmin, async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.render('ticket/pages/user_listing', 
            { users,
                user: req.user || null
            });
    } catch (error) {
        console.error('Error retrieving users:', error); 
        res.status(500).send('Error retrieving users');
    }
});

router.get('/success', (req, res) => {
    res.render('ticket/pages/user_success', { title: 'Success', user: req.user });
});

// Route to show the edit user form
router.get('/edit/:id', isAdmin, async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await userService.getUserById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('ticket/pages/edit_user', {
            userToEdit: user, // this is the user being edited
            user: req.user || null // current logged-in user
        });
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).send('Error retrieving user');
    }
});

// Route to handle updating the user
router.post('/edit/:id', isAdmin, async (req, res) => {
    const userId = req.params.id;
    const { username, email, role } = req.body;

    try {
        await userService.updateUser(userId, username, email, role);
        res.redirect('/users/manage'); // Redirect back to user management
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user');
    }
});

// Route to handle deleting the user
router.get('/delete/:id', isAdmin, async (req, res) => {
    const userId = req.params.id;

    try {
        await userService.deleteUser(userId);
        res.redirect('/users/manage'); // Redirect back to user management
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user');
    }
});


module.exports = router;
