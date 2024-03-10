const nodemailer = require('nodemailer');
const User = require('../model/userSchema');

const loginLoad = async (req, res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.error('Error in loginLoad:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    logger: true,
    debug: true
});

const sendOTP = async (req, res) => {
    try {
        const recipientEmail = req.body.email;
        console.log('Recipient Email:', recipientEmail);

        const otp = generateOTP();
        console.log('Generated OTP:', otp);

        const otpData = {
            otp,
            timestamp: Date.now()
        };

        req.session.data = { ...req.session.data, otpData };

        const data = {
            username: req.session.data.username, // Assuming 'username' is stored in req.session.data
            email: req.session.data.email,
            password: req.session.data.password,
            is_admin: 0,
            is_verified: 0,
            otp: otpData
        };

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.send('OTP sent successfully');
    } catch (error) {
        console.error('Error in sendOTP:', error.message);
        res.status(500).send('Error sending OTP');
    }
};

const otpverify = async (req, res) => {
    try {
        const { otp, otpData, resend } = req.body;

        if (resend) {
            // Resend OTP
            return await sendOTP(req, res);
        }

        if (otpData && otp === otpData.otp) {
            const currentTime = Date.now();
            const timeDifference = currentTime - otpData.timestamp;
            const timeLimit = 5 * 60 * 1000; // 5 minutes in milliseconds

            if (timeDifference <= timeLimit) {
                const { username, email, password } = req.session.data;
                const newUser = new User({
                    username,
                    email,
                    password
                });
                await newUser.save();

                req.session.data = null;

                res.render('otpverify', { success: 'Account created successfully!' });
            } else {
                res.render('otpverify', { error: 'OTP expired. Please request a new one.' });
            }
        } else {
            res.render('otpverify', { error: 'Incorrect OTP. Please try again.' });
        }
    } catch (error) {
        console.error('Error in otpverify:', error.message);
        res.status(500).send('Error verifying OTP');
    }
};

module.exports = {
    loginLoad,
    sendOTP,
    otpverify
};
