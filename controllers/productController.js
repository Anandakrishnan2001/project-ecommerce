const Product = require("../model/productSchema");
const Category = require('../model/categorySchema');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/productimages'); 
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage }).array('images', 5);

let product = async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' });
        res.render('product', { products });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading product page');
    }
};

let loadAddProduct = async (req, res) => {
    try {
        const categories = await Category.find({ status: 'Active' });
        res.render('addproduct', { categories });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading add product page');
    }
};
let addProduct = async (req, res) => {
    try {
       
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                
                console.log('Multer error:', err);
                res.status(500).send('Error uploading images');
                return;
            } else if (err) {
                
                console.log('Unknown error:', err);
                res.status(500).send('Unknown error occurred');
                return;
            }

            
            if (!req.files || req.files.length === 0) {
                res.status(400).send('No images uploaded');
                return;
            }

            try {
                const processedImages = [];
                for (const file of req.files) {
                   
                    const imageBuffer = await sharp(file.path)
                        .resize(400, 400)
                        .toBuffer();
                    
                    
                    const filename = `cropped_${Date.now()}-${file.originalname}`;
                    const imagePath = path.join(__dirname, '..', 'public', 'productimages', filename);

                   
                    fs.writeFileSync(imagePath, imageBuffer);

                   
                    try {
                        fs.unlinkSync(file.path);
                    } catch (unlinkError) {
                        console.log('Error deleting file:', unlinkError.message);
                    }

                   
                    processedImages.push(filename);
                }

                
                const { name, description, price, category, brand, status, countinstock, discountprice, afterdiscount } = req.body;
                const newProduct = new Product({
                    name,
                    description,
                    images: processedImages,
                    price,
                    category,
                    brand,
                    status,
                    countinstock,
                    discountprice,
                    afterdiscount
                });

              
                await newProduct.save();

                
                res.redirect('/admin/product');
            } catch (sharpError) {
                console.log('Sharp error:', sharpError.message);
                res.status(500).send('Error processing images: ' + sharpError.message);
            }
        });
    } catch (error) {
        console.log('Error adding product:', error);
        res.status(500).send('Error adding product');
    }
};


let editProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            res.status(404).send('Product not found');
            return;
        }
        res.render('editproduct', { product });
    } catch (error) {
        console.log('Error editing product:', error);
        res.status(500).send('Error editing product');
    }
};

let updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.redirect('/admin/product');
    } catch (error) {
        console.log('Error updating product:', error);
        res.status(500).send('Error updating product');
    }
};

let deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await Product.findByIdAndDelete(id);
        res.redirect('/admin/product');
    } catch (error) {
        console.log('Error deleting product:', error);
        res.status(500).send('Error deleting product');
    }
};
module.exports = {
    product,
    loadAddProduct,
    addProduct,
    editProduct,
    updateProduct,
    deleteProduct,
    upload  // Export multer upload middleware if needed for other routes
};
