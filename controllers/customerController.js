const User = require('../model/userSchema');



const customer = async (req, res) => {
    try {
        const users = await User.find({ is_admin: 0 });
        res.render('customer', { users });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading customer details');
    }
}

const blockUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId)
        await User.findByIdAndUpdate(userId, { is_verified: 0 });
        res.redirect('/admin/customer'); // Redirect back to the customer page after blocking
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error blocking user');
    }
}

const unblockUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        await User.findByIdAndUpdate(userId, { is_verified: 1 });
        res.redirect('/admin/customer'); // Redirect back to the customer page after unblocking
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error unblocking user');
    }
}


module.exports = {
    customer,
    blockUser,
    unblockUser
}