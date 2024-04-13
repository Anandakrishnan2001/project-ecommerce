const User = require('../model/userSchema');



const customer = async (req, res) => {
    try {
        const users = await User.find({ is_admin: 0 });
        res.render('customer', { users });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading customer details');
        res.render('pagenotfound')
    }
}

const blockUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId)
        await User.findByIdAndUpdate(userId, { is_verified: 0 });
       if(req.session.user_id===userId){
        console.log(req.session.user_id)
        req.session.user = false
        

       }
        res.redirect('/admin/customer'); 
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error blocking user');
        res.render('pagenotfound')
    }
}

const unblockUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        await User.findByIdAndUpdate(userId, { is_verified: 1 });
        res.redirect('/admin/customer'); 
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error unblocking user');
        res.render('pagenotfound')
    }
}


module.exports = {
    customer,
    blockUser,
    unblockUser
}