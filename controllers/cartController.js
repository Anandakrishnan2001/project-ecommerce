const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Cart = require('../model/cartSchema');

const cart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        const username = userData.username;

        const cartData = await Cart.findOne({ userId }).populate('products.productId').sort({ updatedAt: -1 });
        if (!cartData || !cartData.products || cartData.products.length === 0) {
            res.render('cart', { cart: { products: [], total: 0 }, username: username });
        } else {
            const sortedProducts = cartData.products.sort((a, b) => b.createdAt - a.createdAt);
            cartData.products = sortedProducts;
            res.render('cart', { cart: cartData, username: username });
        }
    } catch (error) {
        console.log('Error Occurred: ', error);
        res.status(500).send('Internal Server Error');
};
}


const addtoCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user_id;

        let cart = await Cart.findOne({ userId: userId }).populate('products.productId');

        const existingProductIndex = cart ? cart.products.findIndex(item => item.productId._id.equals(productId)) : -1;

        if (existingProductIndex !== -1) {
            return res.status(400).json({ error: 'Product already in cart' });
        }
        if (!cart) {
            cart = new Cart({ userId });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.countInStock <= 0) {
            return res.status(400).json({ error: 'Product out of stock' });
        }

        cart.products.unshift({ productId: productId, quantity: 1 });
        cart.total += product.afterdiscount;
       
        await Promise.all([cart.save(), product.save()]); 

        console.log(cart.total);
        const updatedCart = await Cart.findOne({ userId: userId }).populate('products.productId');
        res.status(200).json({ message: 'Product added to cart successfully', cart: updatedCart });
    } catch (error) {
        console.log("Error Occurred: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const checkStock = async (req, res) => {
    try {
        const productId = req.params.id;
        console.log(productId,"ghjgfhd")

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
console.log(product.countinstock,"hello world")
        res.status(200).json({ countinstock: product.countinstock });
    } catch (error) {
        console.error('Error checking stock:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




const updateQuantity = async (req, res) => {
    const { productId, newQuantity } = req.params;
    const userId = req.session.user_id;

    try {
        if (!userId || !productId || isNaN(newQuantity) || parseInt(newQuantity) <= 0) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        let cart = await Cart.findOne({ userId }).populate('products.productId');
        const product = await Product.findById(productId);

        if (!cart || !product) {
            return res.status(404).json({ error: 'Cart or product not found' });
        }

        const existingProduct = cart.products.find(item => item.productId.equals(productId));

        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        const prevQuantity = existingProduct.quantity;
        let updatedQuantity = parseInt(newQuantity);
        updatedQuantity = Math.min(Math.max(updatedQuantity, 1), 10);

        const quantityChange = updatedQuantity - prevQuantity;

        // Check if the requested quantity exceeds available stock
        if (quantityChange > 0 && product.countinstock < quantityChange) {
            return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
        }

        cart.total += quantityChange * product.afterdiscount;
        existingProduct.quantity = updatedQuantity;

        await cart.save();

        // Update stock only when the product is purchased
        if (quantityChange > 0) {
            product.countinstock -= quantityChange;
            await product.save();
        }

        console.log('Cart updated:', cart);

        // Return the updated cart and product details
        res.status(200).json({ message: 'Quantity updated successfully', cart, updatedProduct: existingProduct });
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
        const totalPriceToRemove = productToDelete.quantity * productToDelete.productId.afterdiscount;
        cart.total -= totalPriceToRemove;

        // Remove the product from the cart
        cart.products = cart.products.filter(item => !item.productId.equals(productId));

        await cart.save();
        console.log('Cart updated after deletion:', cart);

        // Send the updated cart data along with the deleted product ID as JSON response to the frontend
        res.json({ message: 'Item deleted successfully', cart, deletedProductId: productId });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};













module.exports = {
    cart,
    addtoCart,
    updateQuantity,
    deleteCartItem,
    checkStock
}