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
        const products = await Product.find({ status: 'active' });
        res.render('product', { products });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading product page');
    }
};

let loadAddProduct = async (req, res) => {
    try {
        const categories = await Category.find({deleted: false}  );
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
    }
};



let editProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        const categories = await Category.find({deleted: false});
        res.render('editproduct', { product, categories });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}

const uploadForEditProduct =multer({ storage: storage }).array('images', 5);


const updateProduct = async (req, res) => {
    try {
      const productId = req.params.id;
      const { name, description, price, category, brand, status, countinstock, discountprice, afterdiscount } = req.body;
  
      // File upload logic
      uploadForEditProduct(req, res, async function (err) {
        if (err) {
          console.error(err);
          return res.status(400).send('File upload error.');
        }
  
        const updatedProduct = await Product.findByIdAndUpdate(productId, {
          name: name,
          description: description,
          price: price,
          category: category,
          brand: brand,
          status: status,
          countinstock: countinstock,
          discountprice: discountprice,
          afterdiscount: afterdiscount
        }, { new: true });
  
        // Logic to delete selected images
        if (req.body.deleteImages && req.body.deleteImages.length > 0) {
          updatedProduct.images = updatedProduct.images.filter(image => !req.body.deleteImages.includes(image));
        }
  
        // Logic to add new images
        if (req.files && req.files.length > 0) {
          const newImages = req.files.map(file => file.filename);
  
          // Check if updatedProduct.images is an array
          if (!Array.isArray(updatedProduct.images)) {
            updatedProduct.images = [];
          }
  
          updatedProduct.images = updatedProduct.images.concat(newImages);
        }
  
        await updatedProduct.save();
  
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
    }
};

const productdetails = async (req, res) => {
    try {

        const productid = req.params.id;
        const userId = req.session.user_id;
        
        // Check if user is authenticated
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        // Fetch user data
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
    }
}



module.exports = {
    product,
    loadAddProduct,
    addProduct,
    editProduct,
    updateProduct,
     deleteProduct,
    upload ,
    productdetails 
};
