/*
* This is the main file for the server. It will be responsible for handling all the requests and responses.
* It will also be responsible for connecting to the database.
*/

"use strict";

const port = 1337;

const path = require('path');
const express = require('express');
const app = express();
const middleware = require('./middleware/index.js');
const routeTicket = require('./route/ticket.js');

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(middleware.logIncomingToConsole);
app.use(express.static(path.join(__dirname, "public")));
app.use("/", routeTicket);
app.listen(port, logStartUpDetailsToConsole);



/**
 * Log app details to console when starting up.
 * @return {void}
 */
function logStartUpDetailsToConsole() {
    let routes = [];

    // Find what routes are supported
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Routes registered directly on the app
            routes.push(middleware.route);
        } else if (middleware.name === "router") {
            // Routes added as router middleware
            middleware.handle.stack.forEach((handler) => {
                let route;

                route = handler.route;
                route && routes.push(route);
            });
        }
    });

    console.info(`Server is listening on port ${port}.`);
    console.info('Server is on http://localhost:1337/');
    console.info("Available routes are:");
    console.info(routes);
}

app.use("/ticket", routeTicket);
app.use('/uploads', express.static('uploads'));
