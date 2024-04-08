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
            res.render('cart', { cart: { products: [], total: 0 },username: username });
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
        const productId = req.body.productId;
        const userId = req.session.user_id;
        


        const product = await Product.findById(productId);
        let cart = await Cart.findOne({ userId: userId });

        const existingProductIndex = cart ? cart.products.findIndex(item => item.productId.equals(productId)) : -1;

        if (existingProductIndex !== -1) {
            return res.status(400).send('Product already in cart');
        }
        if (!cart) {
            cart = new Cart({ userId });
        }
        cart.products.push({ productId: productId, quantity: 1 });

        cart.total += product.price;
        await cart.save();
        console.log(cart.total)
        res.redirect('/cart');
    } catch (error) {
        console.log("Error Occurred: ", error);
        res.status(500).send('Internal Server Error');
    }
}



const increaseQuantity = async (req, res) => {
    const { productId } = req.params;
    const userId = req.session.user_id;

    try {
        let cart = await Cart.findOne({ userId }).populate('products.productId');
        const product = await Product.findById(productId);

        if (!cart) {
            cart = new Cart({ userId });
        }

        const existingProduct = cart.products.find(item => item.productId.equals(productId));

        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.products.push({ productId: productId, quantity: 1 });
        }

        cart.total += product.price;
        await cart.save();

        res.status(200).json({ message: 'Quantity increased successfully', cart });
    } catch (error) {
        console.error('Error increasing quantity:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const decreaseQuantity = async (req, res) => {
    const { productId } = req.params;
    const userId = req.session.user_id;

    try {
        let cart = await Cart.findOne({ userId }).populate('products.productId');
        const product = await Product.findById(productId);

        if (!cart) {
            return res.status(400).json({ error: 'Cart not found' });
        }

        const existingProduct = cart.products.find(item => item.productId.equals(productId));

        if (!existingProduct) {
            return res.status(400).json({ error: 'Product not found in cart' });
        }

        if (existingProduct.quantity === 1) {
            // Remove the product if quantity is 1
            cart.products = cart.products.filter(item => !item.productId.equals(productId));
        } else {
            existingProduct.quantity--;
        }

        cart.total -= product.price;
        await cart.save();

        res.status(200).json({ message: 'Quantity decreased successfully', cart });
    } catch (error) {
        console.error('Error decreasing quantity:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};






module.exports = {
    cart,
    addtoCart,
   increaseQuantity,
   decreaseQuantity
}