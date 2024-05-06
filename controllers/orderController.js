const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Cart = require('../model/cartSchema');
const Order = require('../model/orderSchema')
const Coupon = require('../model/couponSchema')
const Wallet = require('../model/walletSchema')
const PDFDocument = require('pdfkit');

 const Razorpay = require('razorpay')


 const loadOrderpage = async (req, res) => {
    try {
        const  couponId  = req.body;
        console.log(couponId,'kingking')
        const cartId = req.params.id;
        const userData = await User.findById(req.session.user_id);
        const username = userData.username;

        const cartData = await Cart.findById(cartId).populate('products.productId');
        const addresses = userData.Address || [];

        const cartItemsAddedToOrder = await Order.exists({ cartId: cartId });
        if (cartItemsAddedToOrder) {
            await Cart.findByIdAndDelete(cartId);
        }

        const activeCoupons = await Coupon.find({ isActive: '1' });

        

        res.render('checkout', { username, addresses, cart: cartData, coupons: activeCoupons });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
        res.render('pagenotfound');
    }
};



 
const checkstockorder = async (req, res) => {
    const cartId = req.params.cartId;
    console.log(cartId,"lemon")

    try {
        const cart = await Cart.findById(cartId).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const outOfStockProducts = cart.products.filter(item => item.productId.countinstock === 0);
        if (outOfStockProducts.length > 0) {
            return res.json({error: 'One or more products in the cart are out of stock' });
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

        const orderItems = cartData.products.map(product => {
            const productPrice = product.productId.afterdiscount ? product.productId.afterdiscount : product.productId.price;
            return {
                productId: product.productId._id,
                title: product.productId.name,
                image: product.productId.images,
                productPrice, // Use either afterdiscount or price based on availability
                quantity: product.quantity,
                price: productPrice * product.quantity,
            };
        });

        const orderData = {
            user: req.session.user_id,
            cart: cartId,
            orderStatus: 'Pending',
            items: orderItems,
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

        
        let totalAmount = 0;
        for (const item of order.items) {
            totalAmount += item.price * item.quantity;
        }

        
        let userWallet = await Wallet.findOne({ user: order.user });
        if (!userWallet) {
            userWallet = new Wallet({
                user: order.user,
                walletBalance: 0, 
                amountSpent: 0,
                refundAmount: 0,
                transactions: [] 
            });
            await userWallet.save();
        }

        
        userWallet.walletBalance += totalAmount;
        await userWallet.save();

        
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
        const perPage = 10; 
        const page = parseInt(req.query.page) || 1;
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / perPage);

        
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('user')
            .populate('items.productId')
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render('order', { orders, currentPage: page, totalPages });
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



const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, 
    key_secret: process.env.RAZORPAY_KEY_SECRET 
});


const RazorpayCheckout = async (req, res) => {
    try {
        let userId = req.session.user_id;
        const { totalAmount, cartId, addressId } = req.body;
        console.log('totalamount', req.body);

        const cartData = await Cart.findById(cartId).populate('products.productId');
        const items = cartData.products.map(product => {
            const productPrice = product.productId.afterdiscount ? product.productId.afterdiscount : product.productId.price;
            return {
                productId: product.productId._id,
                title: product.productId.name,
                image: product.productId.images,
                productPrice, // Use either afterdiscount or price based on availability
                quantity: product.quantity,
                price: productPrice * product.quantity,
            };
        });

        const userData = await User.findById(userId);
        const address = userData.Address.find(add => add._id.toString() === addressId);

        const options = {
            amount: totalAmount * 100,
            currency: 'INR',
            receipt: 'order_receipt_' + userId,
            payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);

        const orderData = {
            user: userId,
            cart: cartId,
            orderStatus: 'Pending',
            items: items,
            billTotal: totalAmount,
            shippingAddress: address,
            paymentMethod: 'Razorpay',
            paymentStatus: 'Success',
            orderDate: new Date(),
        };

        const newOrder = new Order(orderData);
        const savedOrder = await newOrder.save();

        for (const product of cartData.products) {
            await Product.findByIdAndUpdate(product.productId, { $inc: { countinstock: -product.quantity } });
        }

        // Delete the cart after successful order creation and stock updates
        await Cart.findByIdAndDelete(cartId);

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Error creating Razorpay order' });
    }
};


const RazorpayFail = async (req, res) => {
    try {
        const { cartId } = req.body; 
        console.log(cartId, "jklilll");

        
        const updatedOrder = await Order.findOneAndUpdate(
            { cart: cartId },
            { orderStatus: 'Pending', paymentStatus: 'Failed' },
            { new: true }
        );
        console.log(updatedOrder,"jkiuyl")

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Payment failure details received' });
    } catch (error) {
        console.error('Error handling Razorpay failure:', error);
        res.status(500).json({ error: 'Error handling Razorpay failure' });
    }
};




const vieworderdetails = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const username = user.username;

        const orderId = req.params.id;
        let order = await Order.findById(orderId);

        // Destructure the order object
        const { items } = order;

        res.render('vieworder', { orders: [order], items, username });
        
    } catch (error) {
        console.log(error);
        // Handle error response or redirect as needed
    }
}





const downloadpdf = async (req, res) => {
    try {
        const ordersData = JSON.parse(req.body.invoiceData);
        const doc = new PDFDocument();
        const fileName = "invoice.pdf";

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Pipe generated PDF directly to response stream
        doc.pipe(res);

        // Loop through each order
        ordersData.forEach((order, index) => {
            doc.text(`Order ${index + 1}`, { align: 'center' });
            doc.moveDown();

            // Draw order details table
            doc.font('Helvetica-Bold').text('Order Details:', { continued: true }).font('Helvetica');
            doc.moveDown();
             
            doc.text(`Date: ${order.orderDate}`);
            doc.text(`Order Status: ${order.orderStatus}`);
            doc.text(`Payment Method: ${order.paymentMethod}`);
            doc.text(`Total Amount: ₹${order.billTotal}`);
            doc.text(`Shipping Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country}, ${order.shippingAddress.postalCode}`);
            doc.moveDown();

            // Draw items table
            doc.font('Helvetica-Bold').text('Items:', { continued: true }).font('Helvetica');
            doc.moveDown();

            // Table headers
            doc.font('Helvetica-Bold').text('Product Name', 100, doc.y, { width: 200, align: 'left' });
            doc.text('Price', 300, doc.y, { width: 100, align: 'left' });
            doc.text('Quantity', 400, doc.y, { width: 100, align: 'left' });
            doc.text('Total', 500, doc.y, { width: 100, align: 'left' });
            doc.moveDown();

            // Table rows
            order.items.forEach((item, itemIndex) => {
                doc.text(item.title, 100, doc.y, { width: 200, align: 'left' });
                doc.text(`₹${item.productPrice}`, 300, doc.y, { width: 100, align: 'left' });
                doc.text(item.quantity.toString(), 400, doc.y, { width: 100, align: 'left' });
                doc.text(`₹${item.productPrice * item.quantity}`, 500, doc.y, { width: 100, align: 'left' });
                doc.moveDown();
            });
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
};











module.exports = {
    loadOrderpage,
    placeOrder,
    Ordersucess,
    cancelOrder,
    order,
    updateOrderStatus,
    checkstockorder,
    RazorpayCheckout,
    RazorpayFail,
    vieworderdetails,
    downloadpdf
    
};