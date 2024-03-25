const nodemailer = require('nodemailer');
const User = require('../model/userSchema');
const bcrypt = require('bcrypt');
const Product = require('../model/productSchema')

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
    }
};

const verifyLogin = async (req, res) => {
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
    }
};

const loginedhome = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        if (userData) {
            const username = userData.username; 
            res.render('loginedhome', { username });
        } else {
            res.redirect('/login'); 
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading logged-in home page');
    }
};


const loadsign = async (req, res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading signup page');
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
    }
};

const otpverify = async (req, res) => {
    try {
       
        if (req.session.data.otp == req.body.otp) {
            console.log("OTP is correct");

            if (req.session.data.otpexpiration < Date.now()) {
              res.render("otp",{message: 'your Otp has expired. Resending OTP.'});

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

            res.render('shop', { username, products });
    
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error loading logged-in home page');
    }
};

const productdetails = async (req, res) => {
    try {
        
        const productid = req.params.id;
        const userId = req.session.user_id;
console.log(userId)
console.log(productid)
        // Check if user is authenticated
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        // Fetch user data
        const userData = await User.findById(userId);
        if (!userData) {
            return res.status(404).send('User not found');
        }

        // Get username from user data
        const username = userData.username;

        // Fetch single product data
        const singleproduct = await Product.findById(productid);
        if (!singleproduct) {
            return res.status(404).send('Product not found');
        }
console .log(singleproduct.images)
        // Render the product-single view with data
        res.render("product-single", { singleproduct, username });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
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
    productdetails

    }
