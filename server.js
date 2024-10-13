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
const routeTicket = require('./route/ticket.js'); // Route for ticket handling
const userRoutes = require('./route/users.js');   // Route for user handling
const knowledgeBaseRoutes = require('./route/knowledge_base.js'); // Route for knowledge base handling
const flash = require('connect-flash');

const session = require('express-session');
const passport = require('passport');
require('./src/auth');

app.use(express.urlencoded({ extended: true }));
app.use(flash());

app.use(session({
    secret: 'keyboardCat',
    resave: false,
    saveUninitialized: false,
    store: new session.MemoryStore({
        checkPeriod: 86400000
    }),
    cookie: { secure: false }
}));
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.error = req.flash('error');
    res.locals.message = req.flash('message');
    next();
});
app.use(passport.initialize());
app.use(passport.session());



app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(middleware.logIncomingToConsole);

// Routes
app.use("/", routeTicket);             // Default route for ticketing system
app.use("/ticket", routeTicket);        // Ticket route for specific ticket management
app.use('/uploads', express.static('uploads')); // For serving uploaded files

app.use("/users", userRoutes);          // Route for user creation and management
app.use("/knowledge_base", knowledgeBaseRoutes); // Route for knowledge base


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
