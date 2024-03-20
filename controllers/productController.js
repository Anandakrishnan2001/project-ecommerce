const Product = require("../model/productSchema");
const Category = require('../model/categorySchema');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/productimages'); // Save uploaded files to the 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Rename files with timestamp
    }
});// Use memory storage to handle file uploads as buffers
const upload = multer({ storage: storage }).array('images', 5);

let product = async (req, res) => {
    try {
        res.render('product');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading product page');
    }
};

let loadaddproduct = async (req, res) => {
    try {
        const categories = await Category.find({ status: 'Active' });
        res.render('addproduct', { categories });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading add product page');
    }
};
let addproduct = async (req, res) => {
    try {
        // Call the upload middleware to handle file uploads
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred during upload
                console.log('Multer error:', err);
                res.status(500).send('Error uploading images');
                return;
            } else if (err) {
                // An unknown error occurred
                console.log('Unknown error:', err);
                res.status(500).send('Unknown error occurred');
                return;
            }

            // Check if images were uploaded successfully
            if (!req.files || req.files.length === 0) {
                res.status(400).send('No images uploaded');
                return;
            }

            // Process uploaded images using Sharp and store them in the same directory
            const processedImages = [];
            for (const file of req.files) {
                try {
                    // Check file extension
                    const fileExtension = path.extname(file.originalname).toLowerCase();
                    if (!['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
                        console.log('Unsupported file extension');
                        res.status(400).send('Unsupported file extension');
                        return;
                    }
                    console.log(file.originalname)
                    // Resize and save the image using Sharp
                    const imageBuffer = await sharp(file.path)
                        .resize(400, 400)
                        .toBuffer();

                    processedImages.push(imageBuffer);

                    // Delete the original unresized file
                    try {
                        fs.unlinkSync(file.path);
                    } catch (unlinkError) {
                        console.log('Error deleting file:', unlinkError.message);
                    }
                } catch (sharpError) {
                    console.log('Sharp error:', sharpError.message);
                    res.status(500).send('Error processing images: ' + sharpError.message);
                    return;
                }
            }

            // Create new product instance with image data as Buffers
            const { name, description, price, category, brand, status, countinstock, discountprice, afterdiscount } = req.body;
            const newProduct = new Product({
                name,
                description,
                images: processedImages, // Save image data as Buffers to the database
                price,
                category,
                brand,
                status,
                countinstock,
                discountprice,
                afterdiscount
            });

            // Save the new product to the database
            await newProduct.save();

            // Redirect to a success page or render a success message
            res.redirect('/admin/product');
        });
    } catch (error) {
        console.log('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
};


module.exports = {
    product,
    loadaddproduct,
    addproduct,
    upload  // Export multer upload middleware if needed for other routes
};
