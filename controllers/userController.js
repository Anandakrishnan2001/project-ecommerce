const nodemailer = require('nodemailer');

const loginLoad = async (req, res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.log(error.message);
    }
};

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASSWORD // your email password
    }
});

const sendOTP = (req, res) => {
    try {
        // Retrieve recipient email from session
        const recipientEmail = req.session.data.email; // Assuming email is stored in session data
        console.log('Recipient Email:', recipientEmail);

        // Generate OTP
        const otp = generateOTP();
        console.log('Generated OTP:', otp);

        // Email configuration
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`
        };

        // Send the email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).send('Error sending OTP');
            } else {
                console.log('Email sent:', info.response);
                res.send('OTP sent successfully');
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error sending OTP');
    }
};

const otpverify = async (req, res) => {
    try {
        let { username, email, password, confirm_password } = req.body;
        let data = { username, email, password, confirm_password };
        req.session.data = data;

        // Generate OTP
        const otp = generateOTP();
        console.log('Generated OTP:', otp);

        // Retrieve recipient email from session
        const recipientEmail = req.session.data.email;

        // Email configuration
        const mailOptions = {
            from:  process.env.EMAIL_USER,
            to: recipientEmail,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`
        };

        // Send the email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).send('Error sending OTP');
            } else {
                console.log('Email sent:', info.response);
                res.render('otpverify');
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error sending OTP');
    }
};

module.exports = {
    loginLoad,
    sendOTP,
    otpverify
};
