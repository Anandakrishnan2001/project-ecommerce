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

userRoute.get('/login',userController.loadlogin);

userRoute.get('/signup',userController.loadsign);

userRoute.post('/signup',userController.loaduser);

userRoute.post('/otpverify',userController.loaduser);

userRoute.post('/', userController.otpverify);



// New route for sending OTP via email
// userRoute.get('/sendOTP', userController.sendOTP);

module.exports = userRoute;
