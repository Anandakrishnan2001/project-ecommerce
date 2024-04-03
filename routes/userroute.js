const express = require('express');
const userRoute = express();
const userController = require("../controllers/userController");
const productController = require("../controllers/productController")
const auth  = require('../middlewares/auth');


userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/users');

// Existing routes
userRoute.get('/',auth.isLogout, userController.Loadhome);
userRoute.get('/login',auth.isLogout, userController.loadlogin);
userRoute.post('/login',auth.isLogout, userController.verifyLogin);
userRoute.get('/loginedhome',auth.isLogin, userController.loginedhome);
userRoute.get('/signup',auth.isLogout, userController.loadsign);
userRoute.post('/signup',auth.isLogout, userController.loadotp);
userRoute.post('/otp',auth.isLogout, userController.otpverify); 
userRoute.get('/shop',auth.isLogin,userController.loadshop)
userRoute.get('/product-single/:id',auth.isLogin,productController.productdetails)
userRoute.get('/logout',auth.isLogin,userController.logout)
userRoute.get('/profile',auth.isLogin,userController.Loadprofile)
userRoute.post('/profile/addAddress',auth.isLogin,userController.AddAddress)
module.exports = userRoute;
