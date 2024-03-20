const Product = require("../model/productSchema");
const Category = require('../model/categorySchema');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

let product = async (req, res) => {
    try {
        res.render('product');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading product page');
    }
}

let loadaddproduct = async (req, res) => {
    try {
     
        const categories = await Category.find({ status: 'Active' });

       
        res.render('addproduct', { categories });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading add product page');
    }
}

let addproduct = async (req, res) => {
    try {
        
        // Extract product details from request body
        const { name, description, price, category, brand, status, countinstock, discountprice, afterdiscount } = req.body;

       console.log(req.body)
;

        // Create new product instance
        const newProduct = new Product({
            name: name,
            description: description,
            // images:images, 
            price:price,
            category:category,
            brand:brand,
            status:status,
            countinstock:countinstock,
            discountprice:discountprice,
            afterdiscount:afterdiscount
        });

        // Save the new product to the database
        await newProduct.save();

        // Redirect to a success page or render a success message
        res.redirect('/admin/products'); // This line sends a response to the client
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error adding product');
    }
}




module.exports = {
    product,
    loadaddproduct,
    addproduct
}
