const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Wishlist = require('../model/wishlistSchema')
const Cart = require('../model/cartSchema');




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

        const existingWishlist = await Wishlist.findOne({ user: req.session.user_id, 'items.productId': productId });

        if (existingWishlist) {
            return res.status(200).json({ success: false, message: 'Product is already in the wishlist.' });
        }

        const wishlistItem = { productId: productId };
        const updatedWishlist = await Wishlist.findOneAndUpdate(
            { user: req.session.user_id },
            { $push: { items: wishlistItem } },
            { upsert: true, new: true }
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
        const productId = req.params.id;
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const cart = await Cart.findOne({ userId: userId });
        if (cart && cart.products.some(item => item.productId.toString() === productId)) {
            return res.status(400).json({ alreadyInCart: true });
        }

        await Cart.findOneAndUpdate(
            { userId: userId },
            { $push: { products: { productId: productId, quantity: 1 } } },
            { upsert: true }
        );

        await Wishlist.findOneAndUpdate(
            { user: userId },
            { $pull: { items: { productId: productId } } }
        );

        res.status(200).json({ addedToCart: true });
    } catch (error) {
        console.error('Error adding to cart from wishlist:', error);
        res.status(500).json({ error: 'Error adding to cart from wishlist' });
    }
};




// const removeFromWishlist = async (req, res) => {
//     try {
//         const itemId = req.params.id;
//         console.log(itemId.toString(), "lemonside");

//         // Find the wishlist by user ID
//         const wishlist = await Wishlist.findOne({ user: req.session.user_id });
//         console.log(wishlist, "gillmillsl");

//         // Find the index of the item in the wishlist's items array
//         const itemIndex = wishlist.items.findIndex(item => item.productId.toString() === itemId);
//         console.log(itemIndex, 'fjdaskl;')

//         if (itemIndex !== -1) {
           
//             wishlist.items.splice(itemIndex, 1);
//             await wishlist.save();
//             res.status(200).json({ deleted: true });
//         } else {
//             res.status(404).json({ deleted: false, message: 'Item not found in wishlist' });
//         }
//     } catch (error) {
//         console.error('Error removing item from wishlist:', error);
//         res.status(500).json({ error: 'Error removing item from wishlist' });
//     }
// };










module.exports = {
    wishlist,
    addToWishlist,
    addToCartWishlist,
    // removeFromWishlist
}