const User = require('../model/userSchema');
const bcrypt = require('bcrypt');

const adminlogin = async (req, res) => {
    try {
        res.render('adminlogin');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading admin login page');
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
 
        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('adminlogin');
                } else {
                    req.session.user_id = userData._id;
                    
                    res.redirect('/admin/dashboard');
                }
            } else {
                res.render('adminlogin', { message: "Email or password is incorrect" });
            }
        } else {
            res.render('adminlogin', { message: "You are not the admin" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error verifying admin login');
    }
}

const dashboard = async (req, res) => {
    try {
        res.render('dashboard');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading dashboard');
    }
}




module.exports = {
    adminlogin,
    verifyLogin,
    dashboard,
    
}
