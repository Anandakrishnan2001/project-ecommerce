const nodemailer = require('nodemailer');
const User = require('../model/userSchema');
const bcrypt = require('bcrypt');
const Product = require('../model/productSchema')
const Category = require('../model/categorySchema');
const Order = require('../model/orderSchema')

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const Loadhome = async (req, res) => {
    try {
         res.render('home');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading home page');
       
    }
};

const loadlogin = async (req, res) => {
    try {
         res.render('login');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading login page');
        res.render('pagenotfound')
    }
};

const  verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    res.render('login', { message: "Email or passsword is incorrect " });
                } else {
                    req.session.user_id = userData._id;
                    req.session.user = true
                    res.redirect('loginedhome');
                }
            } else {
                res.render('login', { message: "Email or password is incorrect" });
            }
        } else {
            res.render('login', { message: "Email or password is incorrect" });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error verifying login');
        res.render('pagenotfound')
    }
};

const  loginedhome = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);

        if (userData) {
            const username = userData.username;
            res.render('loginedhome', { username });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading logged-in home page');
        res.render('pagenotfound')
    }
};


const loadsign = async (req, res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading signup page');
        res.render('pagenotfound')
    }
};

const loadotp = async (req, res) => {
    try {
        // Check if the session already contains OTP data
        if (!req.session.data || !req.session.data.otp) {
            // Generate OTP
            const otp = generateOTP();
            console.log('Generated OTP:', otp);

            let otpexpiration = Date.now() + 60000;
            let { username, email, password, confirm_password } = req.body;
            let data = { username, email, password, confirm_password, otp, otpexpiration };
            req.session.data = data;
            req.session.save();
            console.log(req.session.data);

            // Send OTP via email
            await sendOtpEmail(req.session.data.email, otp);
        }

        res.render('otp');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading OTP page');
        res.render('pagenotfound')
    }
};

const otpverify = async (req, res) => {
    try {

        if (req.session.data.otp == req.body.otp) {
            console.log("OTP is correct");

            if (req.session.data.otpexpiration < Date.now()) {
                res.render("otp", { message: 'your Otp has expired. Resending OTP.' });

                // Generate a new OTP
                const newOtp = generateOTP();
                console.log('Generated new OTP:', newOtp);

                // Update session data with the new OTP and reset the timer
                req.session.data.otp = newOtp;
                req.session.data.otpexpiration = Date.now() + 60000; // 60 seconds

                // Resend the new OTP via email
                await sendOtpEmail(req.session.data.email, newOtp);

                // Render 'otp' page with a message indicating the OTP has been resent
                return res.render('otp', { message: 'OTP has been resent. Please check your email.' });
            }

            const spassword = await securePassword(req.session.data.password);
            const user = new User({
                username: req.session.data.username,
                email: req.session.data.email,
                password: spassword,
                is_admin: 0,
                is_verified: 1
            });

            await user.save();
            console.log("User saved:", user);

            return res.render('login');
        } else {
            console.log("Incorrect OTP. Rendering 'otp' page.");
            return res.render('otp', { message: 'Incorrect OTP. Please try again.' });
        }

    } catch (error) {
        console.log("Error:", error.message);
        res.status(500).render('otp', { message: 'Error verifying OTP' });
        res.render('pagenotfound')
    }
};

const resendOTP = async (req, res) => {
    try {
        // Generate new OTP
        const newOtp = generateOTP();
        console.log('Generated new OTP:', newOtp);

        // Update session data with the new OTP and reset the timer
        req.session.data.otp = newOtp;
        req.session.data.otpexpiration = Date.now() + 60000; // 60 seconds

        // Resend the new OTP via email
        await sendOtpEmail(req.session.data.email, newOtp);

        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error resending OTP' });
        res.render('pagenotfound')
    }
};

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};


function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}

// Function to send OTP via email
function sendOtpEmail(recipientEmail, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: 'Your OTP',
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error('Error sending email:', error);

        } else {
            console.log('Email sent:', info.response);
        }
    });
}

const loadshop = async (req, res) => {
    try {
        const userId = req.session.user_id;



        const userData = await User.findById(userId);

        const username = userData.username;
        const products = await Product.find({ status: 'active' });
        const Categorys = await Category.find({deleted: false})
        res.render('shop', { username, products,Categorys });

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading logged-in home page');
        res.render('pagenotfound')
    }
};


const logout = async (req, res) => {
    try {
        req.session.user_id = null;
        res.redirect('/')

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading logged-in home page');
        res.render('pagenotfound')
    }
}


const Loadprofile = async (req, res) => {
    try {
        const userData = await User.findById(req.session.user_id);
        const userOrders = await Order.find({ user: req.session.user_id }).sort({ orderDate: -1 }).populate('items.productId'); 
        res.render('profile', { userData: userData, username: userData.username, orders: userOrders });

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading logged-in home page');
        res.render('pagenotfound')
    }
};



const AddAddress = async (req, res) => {
    try {
        console.log(req.body)
        const userId = req.session.user_id;
        console.log(userId)
        const userData = await User.findById(userId);

        if (userData) {
            const { houseName, street, city, state, country, postalCode, phoneNumber, type } = req.body;

            userData.Address.push({ houseName, street, city, state, country, postalCode, phoneNumber, type });
            await userData.save();

            res.status(200).json({ message: 'Address added successfully' });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Error adding address' });
        res.render('pagenotfound')
    }
};

const editAddress = async (req, res) => {

    const addressId = req.params.id
    console.log(addressId)
    const userId = req.session.user_id;
    try {

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const addressIndex = user.Address.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ error: 'Address not found or user does not own this address' });
        }


        user.Address[addressIndex].houseName = req.body.houseName;
        user.Address[addressIndex].street = req.body.street;
        user.Address[addressIndex].city = req.body.city;
        user.Address[addressIndex].state = req.body.state;
        user.Address[addressIndex].postalCode = req.body.postalCode;
        user.Address[addressIndex].country = req.body.country;
        user.Address[addressIndex].phoneNumber = req.body.phoneNumber;
        user.Address[addressIndex].addressType = req.body.addressType;
        await user.save();

        res.status(200).json({ message: 'Address updated successfully', updatedAddress: user.Address[addressIndex] });
    } catch (error) {
        console.error('Error updating address:', error.message);
        res.status(500).json({ error: 'Internal server error' });
        res.render('pagenotfound')
    }
};


const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.user_id;


        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.Address.pull(addressId);

        await user.save();

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Error deleting address' });
        res.render('pagenotfound')
    }
};

const editUsernameEmail = async (req, res) => {
    try {

        const { username, email } = req.body;


        const userId = req.session.user_id;


        const user = await User.findByIdAndUpdate(userId, { username: username, email: email }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Username and Email updated successfully', user });
    } catch (error) {
        console.error('Error updating username and email:', error.message);
        res.status(500).json({ error: 'Internal server error' });
        res.render('pagenotfound')
    }
};


const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        console.log(req.body)
        const userId = req.session.user_id;
        console.log(userId)
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }


        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password' });
        res.render('pagenotfound')
    }
};

 const pagenotfound = async(req,res)=>{
    res.render('pagenotfound')
}







module.exports = {
    Loadhome,
    loadlogin,
    verifyLogin,
    loginedhome,
    loadsign,
    loadotp,
    otpverify,
    resendOTP,
    loadshop,
    logout,
    Loadprofile,
    AddAddress,
    editAddress,
    deleteAddress,
    editUsernameEmail,
    changePassword,
    pagenotfound

}