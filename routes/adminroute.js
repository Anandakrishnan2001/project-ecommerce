const express = require('express');
const adminRoute = express();
const adminController = require("../controllers/adminController");
const customerController = require("../controllers/customerController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const OrderController = require ('../controllers/orderController')
const offerController = require('../controllers/offerController')
const couponController = require('../controllers/couponController')

// Parse incoming requests with JSON payloads
adminRoute.use(express.json());

// Parse incoming requests with URL-encoded payloads
adminRoute.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine and specify the views directory
adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');


adminRoute.get("/pageerror", adminController.pagenotfound)

// Routes for admin login and dashboard
adminRoute.get('/', adminController.adminlogin);
adminRoute.post('/', adminController.verifyLogin);
adminRoute.get('/dashboard', adminController.dashboard);
adminRoute.get('/orderdetail/:id',adminController.orderdetail)

// Route for displaying customer details
adminRoute.get('/customer', customerController.customer);
adminRoute.post('/block/:userId', customerController.blockUser);
adminRoute.post('/unblock/:userId', customerController.unblockUser);

// Route for displaying category details
adminRoute.get('/category', categoryController.categoryGet);
adminRoute.post('/addCategory', categoryController.addcategoryPost); 
adminRoute.post('/updatecategory/:id', categoryController.updatecategoryPost); 
adminRoute.post('/deletecategory/:id', categoryController.deletecategoryPost);

// Route for displaying product details
adminRoute.get('/product', productController.product);
adminRoute.get('/addproduct', productController.loadAddProduct);
adminRoute.post('/addproduct', productController.addProduct);
 adminRoute.get('/editproduct/:id', productController.editProduct); 
 adminRoute.post('/product/:id', productController.updateProduct);
 adminRoute.post('/product/delete/:id', productController.deleteProduct);


adminRoute.get('/order',OrderController.order)
adminRoute.post('/admin/orders/:formId', OrderController.updateOrderStatus);
adminRoute.get('/salesreport', OrderController.salereport);

adminRoute.get('/offer',offerController.offer)
adminRoute.post('/add-discountoffer',offerController.offercategoryupdate)
adminRoute.get('/categories-with-offers', offerController.getCategoriesWithOffers);
adminRoute.post('/update-category-offer',offerController.updateCategoryOffer)
adminRoute.post('/delete-category-offer',offerController.deleteCategoryOffer)
adminRoute.post('/add-product-offer',offerController.productdiscountoffer)
adminRoute.delete('/delete-product-offer/:id',offerController.deleteProductDiscount)


adminRoute.get('/coupon',couponController.coupon)
adminRoute.get('/get-coupons',couponController.getcoupon)
adminRoute.post('/create-coupon',couponController.addcoupon)
adminRoute.post('/update-coupon/:id',couponController.updatecoupon)
adminRoute.delete('/delete-coupon/:id',couponController.deletecoupon)
adminRoute.get('/get-coupon/:id',couponController.getcouponsupdate)
adminRoute.get('/generate-pdf',OrderController.pdfsalereport)

module.exports = adminRoute;
