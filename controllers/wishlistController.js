const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Wishlist = require('../model/wishlistSchema')
const Cart = require('../model/cartSchema')



const wishlist = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        const username = userData.username;

        // Fetch wishlist items for the user
        const wishlistItems = await Wishlist.findOne({ user: userId }).populate('items.productId');
        console.log(wishlistItems, 'govindan'); // Make sure the data is fetched correctly

        res.render('wishlist', { username: username, wishlistItems: wishlistItems.items });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).send('Error fetching wishlist');
    }
};


const addToWishlist = async (req, res) => {
    try {
        const productId = req.params.id;

        console.log(productId,"jillmillkill")

        // Check if the product already exists in the user's wishlist
        const existingWishlist = await Wishlist.findOne({ user: req.session.user_id, 'items.productId': productId });

        if (existingWishlist) {
            return res.status(200).json({ success: false, message: 'Product is already in the wishlist.' });
        }

        // Add the product to the wishlist
        const wishlistItem = { productId: productId };
        const updatedWishlist = await Wishlist.findOneAndUpdate(
            { user: req.session.user_id },
            { $push: { items: wishlistItem } },
            { upsert: true, new: true } // Set { new: true } to return the updated document
        );

        if (updatedWishlist) {
            return res.status(200).json({ success: true, message: 'Product added to wishlist.' });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to add product to wishlist.' });
        }
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        return res.status(500).json({ success: false, message: 'Failed to add product to wishlist.' });
    }
};


const addToCartWishlist = async (req, res) => {
    try {
        const  productId  = req.params.id;
        const userId = req.session.user_id;

        const cart = await Cart.findOne({ user: userId });
        if (cart && cart.products.some(item => item.productId.toString() === productId)) {
          
            return res.status(400).json({ alreadyInCart: true });
        }

       
        await Wishlist.findOneAndUpdate(
            { user: userId },
            { $pull: { items: { productId: productId } } }
        );

        
        await Cart.findOneAndUpdate(
            { user: userId },
            { $push: { products: { productId: productId, quantity: 1 } } },
            { upsert: true }
        );

        res.status(200).json({ addedToCart: true });
    } catch (error) {
        console.error('Error adding to cart from wishlist:', error);
        res.status(500).json({ error: 'Error adding to cart from wishlist' });
    }
};






module.exports = {
    wishlist,
    addToWishlist,
    addToCartWishlist
}