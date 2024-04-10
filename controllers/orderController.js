const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Cart = require('../model/cartSchema');
const Order = require('../model/orderSchema')


const loadOrderpage = async (req, res) => {
    try {
        const cartId  = req.params.id; 
       
        // Assuming cartId is passed in the route
        const userData = await User.findById(req.session.user_id);
        const username = userData.username;

        const cartData = await Cart.findById(cartId).populate('products.productId');
       
        const addresses = userData.Address || [];
console.log(cartData,"jillkujhyt")
        res.render('checkout', { username, addresses ,cart:cartData});
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}



module.exports = {
    loadOrderpage
}