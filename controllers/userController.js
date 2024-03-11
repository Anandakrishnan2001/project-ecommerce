const nodemailer = require('nodemailer');

const Loadhome= async (req, res) => {
    try {
        res.render('home');
    } catch (error) {
        console.log(error.message);
    }
};


const loadlogin = async(req,res)=>{
    try {
        res.render('login')
        
    } catch (error) {
        console.log(error)
    }
}

const loadsign = async(req,res)=>{
    try {
       res.render('signup') 
    } catch (error) {
       console.log(error) 
    }
}

const loaduser = async(req,res)=>{
    try {
 // Generate OTP
        const otp = generateOTP();
         console.log('Generated OTP:', otp);


        let { username, email, password, confirm_password } = req.body;
        let data = { username, email, password, confirm_password,otp};
        req.session.data = data;
console.log(req.session.data)
res.render('otpverify');

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
         
      }
  });

        

    } catch (error) {
        console.log(error)
    }
}

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


const otpverify = async (req, res) => {
    try {
        


      
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error sending OTP');
    }
};

module.exports = {
    Loadhome,
    loadlogin,
    loadsign,
    loaduser,
    otpverify
};
