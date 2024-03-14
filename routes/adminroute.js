const express = require('express');
const adminRoute = express();
const session = require("express-session");
const adminController = require("../controllers/adminController");

// Set up session middleware
adminRoute.use(session({ secret: "sessionSecret", resave: true, saveUninitialized: true }));

// Parse incoming requests with JSON payloads
adminRoute.use(express.json());

// Parse incoming requests with URL-encoded payloads
adminRoute.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine and specify the views directory
adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');

// Routes for admin login and dashboard
adminRoute.get('/', adminController.adminlogin);
adminRoute.post('/', adminController.verifyLogin);
adminRoute.get('/dashboard', adminController.dashboard);

// Route for displaying customer details
adminRoute.get('/customer', adminController.customer);

// Routes for blocking and unblocking users
adminRoute.post('/block/:userId', adminController.blockUser);
adminRoute.post('/unblock/:userId', adminController.unblockUser);

module.exports = adminRoute;
