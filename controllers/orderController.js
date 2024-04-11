const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Cart = require('../model/cartSchema');
const Order = require('../model/orderSchema')


const loadOrderpage = async (req, res) => {
    try {
        const cartId  = req.params.id; 
        const userData = await User.findById(req.session.user_id);
        const username = userData.username;

        const cartData = await Cart.findById(cartId).populate('products.productId');
       
        const addresses = userData.Address || [];
        

        res.render('checkout', { username, addresses ,cart:cartData});
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}



const placeOrder = async (req, res) => {
    try {
        const { cartId, addressId, paymentMethod } = req.body;
        const userData = await User.findById(req.session.user_id);
        const cartData = await Cart.findById(cartId).populate('products.productId');
        const address = userData.Address.find((add) =>
            add._id.toString() == addressId
        );

        // Check if the cart is empty
        if (cartData.products.length === 0) {
            throw new Error('Your cart is empty. Please add products before placing an order.');
        }

        const orderData = {
            user: req.session.user_id,
            cart: cartId,
            orderStatus: 'Pending',
            items: cartData.products.map(product => ({
                productId: product.productId._id,
                title: product.productId.name,
                image: product.productId.images,
                productPrice: product.productId.afterdiscount,
                quantity: product.quantity,
                price: product.productId.afterdiscount * product.quantity,
            })),
            billTotal: cartData.total,
            shippingAddress: address,
            paymentMethod,
            paymentStatus: 'Pending',
        };

        const newOrder = await Order.create(orderData);

        await Cart.findByIdAndUpdate(cartId, { $set: { products: [], total: 0 } });

        // Send a success response or redirect to a success page
        res.status(200).send('Order placed successfully.');

    } catch (error) {
        console.error('Error placing order:', error);

        // Send an error response with SweetAlert
        res.status(400).send(error.message);
    }
}


const Ordersucess = async(req,res)=>{
    try {
        const userData = await User.findById(req.session.user_id);
        const username = userData.username;

        res.render('ordersuccess',{username})
    } catch (error) {
      console.log(error)  
    }
}



module.exports = {
    loadOrderpage,
    placeOrder,
    Ordersucess
};