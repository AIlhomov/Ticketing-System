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
    res.redirect('ticket/index');
});

router.get('/ticket/index', (req, res) => {
    let data = {
        title: 'Ticket',
        message: 'Welcome to the ticket page!'
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
router.post('/ticket/new', async (req, res) => {
    const { title, description, department } = req.body;

    try {
        await ticketService.createTicket(title, description, department);
        res.redirect('/ticket/list');
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).send('Error creating ticket');
    }
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
        if (!ticket) {
            res.status(404).send('Ticket not found');
            return;
        }
        res.render('ticket/pages/view_ticket', { ticket });
    } catch (err) {
        console.error('Error fetching ticket:', err);
        res.status(500).send('Error fetching ticket');
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
module.exports = router;
