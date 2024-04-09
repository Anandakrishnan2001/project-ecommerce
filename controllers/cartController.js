const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Cart = require('../model/cartSchema');

const cart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        const username = userData.username;


        const cartData = await Cart.findOne({ userId }).populate('products.productId');
        if (!cartData || !cartData.products || cartData.products.length === 0) {
            res.render('cart', { cart: { products: [], total: 0 }, username: username });
        } else {
            res.render('cart', { cart: cartData, username: username });
        }
    } catch (error) {
        console.log('Error Occurred: ', error);
        res.status(500).send('Internal Server Error');
    }
};

const addtoCart = async (req, res) => {
    try {
        const productId = req.params.id; // Change to req.params.id to get product ID from URL
        const userId = req.session.user_id;

        const product = await Product.findById(productId);
        let cart = await Cart.findOne({ userId: userId });

        const existingProductIndex = cart ? cart.products.findIndex(item => item.productId.equals(productId)) : -1;

        if (existingProductIndex !== -1) {
            // Return a JSON response with an error message instead of sending text
            return res.status(400).json({ error: 'Product already in cart' });
        }
        if (!cart) {
            cart = new Cart({ userId });
        }
        cart.products.push({ productId: productId, quantity: 1 });

        cart.total += product.price;
        await cart.save();
        console.log(cart.total);

        // Send a JSON response with the updated cart data instead of redirecting
        res.status(200).json({ message: 'Product added to cart successfully', cart });
    } catch (error) {
        console.log("Error Occurred: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const updateQuantity = async (req, res) => {
    const { productId, newQuantity } = req.params;
    const userId = req.session.user_id;

    try {
        if (!userId || !productId || isNaN(newQuantity) || parseInt(newQuantity) <= 0) {
            // Validate input data
            return res.status(400).json({ error: 'Invalid input data' });
        }

        let cart = await Cart.findOne({ userId }).populate('products.productId');
        const product = await Product.findById(productId);

        if (!cart) {
            cart = new Cart({ userId });
        }

        const existingProduct = cart.products.find(item => item.productId.equals(productId));

        if (existingProduct) {
            const prevQuantity = existingProduct.quantity;

            // Ensure the new quantity is within the allowed range (1 to 10)
            let updatedQuantity = parseInt(newQuantity);
            updatedQuantity = Math.min(Math.max(updatedQuantity, 1), 10);

            // Calculate the quantity change
            const quantityChange = updatedQuantity - prevQuantity;

            // Update the total amount based on the quantity change
            cart.total += quantityChange * product.price;
            existingProduct.quantity = updatedQuantity;
        }

        await cart.save();
        console.log('Cart updated:', cart);
        res.status(200).json({ message: 'Quantity updated successfully', cart });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





const deleteCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.session.user_id;

        // Find the cart and the product to be deleted
        const cart = await Cart.findOne({ userId }).populate('products.productId');
        const productToDelete = cart.products.find(item => item.productId.equals(productId));

        if (!productToDelete) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        // Calculate the change in the cart total
        const totalPriceToRemove = productToDelete.quantity * productToDelete.productId.price;
        cart.total -= totalPriceToRemove;

        // Remove the product from the cart
        cart.products = cart.products.filter(item => !item.productId.equals(productId));

        await cart.save();
        console.log('Cart updated after deletion:', cart);
        res.json({ message: 'Item deleted successfully', cart });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};






module.exports = {
    cart,
    addtoCart,
    updateQuantity,
    deleteCartItem
}