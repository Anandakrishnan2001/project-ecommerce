const express = require('express');
const adminRoute = express();
const session = require("express-session");
const adminController = require("../controllers/adminController");
const customerController = require("../controllers/customerController");
const categoryController = require("../controllers/categoryController");

// Add session middleware
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
adminRoute.get('/customer', customerController.customer);
adminRoute.post('/block/:userId', customerController.blockUser);
adminRoute.post('/unblock/:userId', customerController.unblockUser);

// Route for displaying category details
adminRoute.get('/category', categoryController.category);
adminRoute.post('/addCategory', categoryController.addCategory); // Route for adding categories
adminRoute.post('/editCategory/:categoryId', categoryController.editCategory); // Route for editing categories
adminRoute.post('/softDeleteCategory/:categoryId', categoryController.softDeleteCategory); // Route for soft deleting categories

module.exports = adminRoute;