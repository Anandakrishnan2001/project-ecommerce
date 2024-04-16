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
        res.render('pagenotfound')
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

        // Decrease countinstock for each product in the cart
        for (const product of cartData.products) {
            await Product.findByIdAndUpdate(product.productId, { $inc: { countinstock: -product.quantity } });
        }

        // Clear the cart after placing the order
        await Cart.findByIdAndUpdate(cartId, { $set: { products: [], total: 0 } });

        res.status(200).send('Order placed successfully.');

    } catch (error) {
        console.error('Error placing order:', error);

        res.status(400).send(error.message);
        res.render('pagenotfound');
    }
}



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






updateOrderStatus = async (req, res) => {
    const orderId = req.params.orderId; 
    const { newStatus } = req.body; 
    

    try {
       
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: newStatus }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        
        res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
        res.render('pagenotfound')
    }
};

module.exports = {
    loadOrderpage,
    placeOrder,
    Ordersucess,
    cancelOrder,
    order,
    updateOrderStatus,
    
};