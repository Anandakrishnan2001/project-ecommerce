const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Cart = require('../model/cartSchema');
const Order = require('../model/orderSchema')
// const razorpay = require('razorpay')


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
        res.render('pagenotfound')
    }
}

 
const checkstockorder = async (req, res) => {
    const cartId = req.params.cartId;
    console.log(cartId,"lemon")

    try {
        const cart = await Cart.findById(cartId).populate('products.product');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const outOfStockProducts = cart.products.filter(item => item.product.countInStock === 0);
        if (outOfStockProducts.length > 0) {
            return res.status(400).json({ error: 'One or more products in the cart are out of stock' });
        }

        return res.json({ success: true, message: 'All products in the cart are in stock' });
    } catch (error) {
        console.error('Error checking stock in cart:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const placeOrder = async (req, res) => {
    try {
        const { cartId, addressId, paymentMethod, totalAmount } = req.body;
        console.log(cartId, addressId, paymentMethod, totalAmount, "Hellobilll");

        const userData = await User.findById(req.session.user_id);
        console.log(userData, "gellmino");

        const cartData = await Cart.findById(cartId).populate('products.productId');
        console.log(cartData, "mellinono");

        const address = userData.Address.find((add) =>
            add._id.toString() === addressId
        );

        if (!address) {
            throw new Error('Invalid address ID.');
        }

        if (cartData.products.length === 0) {
            throw new Error('Your cart is empty. Please add products before placing an order.');
        }

        const outOfStockProducts = cartData.products.filter(product => product.productId.countinstock === 0);
        if (outOfStockProducts.length > 0) {
            throw new Error('Some products in your cart are out of stock.');
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
            billTotal: totalAmount,
            shippingAddress: address,
            paymentMethod,
            paymentStatus: 'Pending',
        };

        const newOrder = await Order.create(orderData);

        for (const product of cartData.products) {
            await Product.findByIdAndUpdate(product.productId, { $inc: { countinstock: -product.quantity } });
        }

        await Cart.findByIdAndUpdate(cartId, { $set: { products: [], total: 0 } });

        // Send JSON response with order details
        res.status(200).json({ message: 'Order placed successfully.', order: newOrder });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(400).json({ error: error.message });
    }
};





const Ordersucess = async(req,res)=>{
    try {
        const userData = await User.findById(req.session.user_id);
        const username = userData.username;

        res.render('ordersuccess',{username})
    } catch (error) {
      console.log(error) 
      res.render('pagenotfound') 
    }
}

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Increment countinstock for each item in the order
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { countinstock: item.quantity } });
        }

        // Update order status to 'Cancelled'
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: 'Cancelled' }, { new: true });

        res.status(200).json({ success: true, message: 'Order cancelled successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
        res.render('pagenotfound');
    }
};

const order = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('user').populate('items.productId');

        res.render('order', { orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal Server Error');
        res.render('pagenotfound');
    }
};






const updateOrderStatus = async (req, res) => {
    const orderId = req.params.orderId;
    const { newStatus } = req.body;

    console.log(orderId, 'manvirsingh');
    console.log(req.body, 'lemon');

    try {
        if (newStatus === 'Cancelled') {
          
        } else {
           
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: newStatus }, { new: true });

            if (!updatedOrder) {
                return res.status(404).json({ error: 'Order not found' });
            }

         
            return res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'Failed to update order status' });
    }
};








module.exports = {
    loadOrderpage,
    placeOrder,
    Ordersucess,
    cancelOrder,
    order,
    updateOrderStatus,
    checkstockorder
    
};