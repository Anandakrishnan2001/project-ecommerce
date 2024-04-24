const Product = require("../model/productSchema");
const Category = require('../model/categorySchema');
const User = require('../model/userSchema')
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
        const perPage = 10; // Number of products per page
        const page = parseInt(req.query.page) || 1; // Current page, default to 1 if not provided

        const totalProducts = await Product.countDocuments({ status: 'active' });
        const totalPages = Math.ceil(totalProducts / perPage);

        const products = await Product.find({ status: 'active' })
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render('product', { products, currentPage: page, totalPages });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading product page');
    }
};


let loadAddProduct = async (req, res) => {
    try {
        const categories = await Category.find({ deleted: false });
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
                        .resize(1500, 750)
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
        res.render('pagenotfound')
    }
};





let editProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        const categories = await Category.find({ deleted: false });
        res.render('editproduct', { product, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};


const uploadForEditProduct = multer({
    storage: storage
}).array('newImages', 5);


const updateProduct = async (req, res) => {
    try {
        uploadForEditProduct(req, res, async function (err) {
            if (err) {
                console.error(err);
                return res.status(400).send('File upload error.');
            }
            const productId = req.params.id;
            const { name, description, price, category, countinstock, discountPrice, afterdiscount, deleteImages } = req.body;

            const updatedProductData = {
                name,
                description,
                price,
                category,
                countinstock,
                discountprice: discountPrice,
                afterdiscount,
            };

            if (deleteImages && deleteImages.length > 0) {

                if (!updatedProductData.images) {
                    updatedProductData.images = [];
                }

                updatedProductData.images = updatedProductData.images.filter(image => !deleteImages.includes(image));
            }




            if (req.files && req.files.length > 0) {
                const processedImages = [];
                for (const file of req.files) {
                    const imageBuffer = await sharp(file.path)
                        .resize(1500, 750)
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


                if (!updatedProductData.images) {
                    updatedProductData.images = [];
                }

                updatedProductData.images = updatedProductData.images.concat(processedImages);
            }

            const updatedProduct = await Product.findByIdAndUpdate(productId, updatedProductData, { new: true });

            res.redirect('/admin/product');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};


let deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const softDelete = req.body.softDelete;
        console.log('Deleting product:', productId);

        if (softDelete) {

            await Product.findByIdAndUpdate(productId, { status: 'deleted' }, { new: true });
        } else {

            await Product.findByIdAndDelete(productId);
        }

        res.redirect('/admin/product');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
        res.render('pagenotfound')
    }
};

const productdetails = async (req, res) => {
    try {

        const productid = req.params.id;
        const userId = req.session.user_id;


        if (!userId) {
            return res.status(401).send('Unauthorized');
        }


        const userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).send('User not found');
        }


        const username = userData.username;


        const singleproduct = await Product.findById(productid);
        if (!singleproduct) {
            return res.status(404).send('Product not found');
        }


        res.render("product-single", { singleproduct, username });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
        res.render('pagenotfound')
    }
}



module.exports = {
    product,
    loadAddProduct,
    addProduct,
    editProduct,
    updateProduct,
    deleteProduct,
    upload,
    productdetails
};
