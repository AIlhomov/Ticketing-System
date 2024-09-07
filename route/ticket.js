/**
 * @api {get} /ticket/:id Request Ticket information
 * @apiName GetTicket
 * @apiGroup Ticket
 * @apiVersion  1.0.0
 */

/**
 * @api {post} /ticket/ Create a new ticket
 * @apiName PostTicket
 * @apiGroup Ticket
 * @apiVersion  1.0.0
 * @apiParam {String} title The title of the ticket.
 * @apiParam {String} description The description of the ticket.
 * @apiParam {String} [assignedTo] The user the ticket is assigned to.
 * @apiParam {String} [createdBy] The user who created the ticket.
 * @apiParam {String} [type] The type of the ticket.
 * @apiParam {String} [priority] The priority of the ticket.
 * @apiParam {String} [status] The status of the ticket.
 * @apiParam {String} [createdAt] The date and time the ticket was created.
 * @apiParam {String} [updatedAt] The date and time the ticket was last updated.
 * @apiParam {String} [deletedAt] The date and time the ticket was deleted.
 */

"use strict";
const express = require('express');
const router = express.Router();
const ticketService = require('../src/ticket.js');

router.get('/', (req, res) => {
    res.redirect('ticket/index'); // Redirect to the ticket index page
});

router.get('/ticket/index', (req, res) => {
    let data = {
        title: 'Ticket',
        message: 'Welcome to the ticket page!'
    };
    res.render('ticket/pages/index', data); // Render the ticket index page
});

// Render the "Create New Ticket" form
router.get('/ticket/new', (req, res) => {
    let data = {
        title: 'New Ticket',
        message: 'Create a new ticket'
    };
    res.render('ticket/pages/new_ticket', data);  // Render the new ticket page
});

// Handle form submission and create a new ticket
router.post('/ticket/new', async (req, res) => {
    const { title, description, department } = req.body;

    try {
        await ticketService.createTicket(title, description, department);  // Call the function from src/ticket.js
        res.redirect('/ticket/list');  // Redirect to the list of tickets
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).send('Error creating ticket');
    }
});





// Route to display the list of tickets
router.get('/ticket/list', async (req, res) => {
    // Get sorting parameters from the query string, default to ID and ascending order
    const sort = req.query.sort || 'id';
    const order = req.query.order === 'desc' ? 'desc' : 'asc';

    try {
        // Fetch sorted tickets from the database
        const tickets = await ticketService.getSortedTickets(sort, order);
        
        // Render the view with tickets and sorting details
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
module.exports = router;
