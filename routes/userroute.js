const express = require('express');
const userRoute = express();
const userController = require("../controllers/userController");
const productController = require("../controllers/productController")
const CartController = require('../controllers/cartController')
const OrderController = require ('../controllers/orderController')
const auth  = require('../middlewares/auth');


userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/users');


userRoute.get("/pageerror", userController.pagenotfound)

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
userRoute.post('/profile/editAddress/:id',auth.isLogin,userController.editAddress)
userRoute.delete('/profile/deleteAddress/:id',auth.isLogin,userController.deleteAddress)
userRoute.post('/profile/updateUsernameEmail',auth.isLogin,userController.editUsernameEmail)
userRoute.post('/profile/changePassword',auth.isLogin,userController.changePassword)
userRoute.get('/cart', auth.isLogin, CartController.cart);
 userRoute.post('/cart/add/:id', auth.isLogin, CartController. addtoCart);
 userRoute.post('/cart/update-quantity/:productId/:newQuantity', auth.isLogin, CartController.updateQuantity);
userRoute.delete('/cart/delete/:productId',auth.isLogin,CartController.deleteCartItem);
userRoute.get('/checkout/:id',auth.isLogin,OrderController.loadOrderpage)
userRoute.post('/place-order',auth.isLogin,OrderController.placeOrder);
userRoute.get('/ordersucess',auth.isLogin,OrderController.Ordersucess)
userRoute.post('/cancel-order/:orderId',auth.isLogin,OrderController.cancelOrder)

module.exports = userRoute;
