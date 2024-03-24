const express = require('express');
const userRoute = express();
const session = require("express-session");
const userController = require("../controllers/userController");

userRoute.use(session({ secret: "sessionSecret" }));
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/users');

// Existing routes
userRoute.get('/', userController.Loadhome);
userRoute.get('/login', userController.loadlogin);
userRoute.post('/login', userController.verifyLogin);
userRoute.get('/loginedhome', userController.loginedhome);
userRoute.get('/signup', userController.loadsign);
userRoute.post('/signup', userController.loadotp);
userRoute.post('/otp', userController.otpverify); 
userRoute.get('/shop',userController.loadshop)

module.exports = userRoute;
