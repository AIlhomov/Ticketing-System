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
const ticket = require('../src/ticket.js');

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

module.exports = router;
