const nodemailer = require('nodemailer');
const User = require('../model/userSchema');
const bcrypt = require('bcrypt');


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


const verifyLogin = async(req,res)=>{

    try{
        
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email})

        if(userData){

          const passwordMatch = await bcrypt.compare(password,userData.password);
           if(passwordMatch){
            if(userData.is_verified === 0){
                res.render('login')
            }
              else{
                req.session.user_id = userData._id;
                res.redirect('home')
              }
           }
           else{
               res.render('login',{message:"Email or password is incorrect"})
           }
        }else{
            res.render('login',{message:"Email or password is incorrect"})
        }
        

    }catch(error){
        console.log(error.message)
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

let otpexpiration = Date.now()+60000
        let { username, email, password, confirm_password } = req.body;
        let data = { username, email, password, confirm_password,otp,otpexpiration};
        req.session.data = data;
        req.session.save()
console.log(req.session.data)
res.render('otp');

  // Retrieve recipient email from session
  const recipientEmail = req.session.data.email;
console.log(recipientEmail)
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
        console.log(req.body.otp)
       if(req.session.data.otp == req.body.otp){
          if(req.session.data.otpexpiration<Date.now()){
          return res.render('otp')
          }const spassword = await securePassword(req.session.data.password);
          const user = new User({
            username: req.session.data.username,
            email: req.session.data.email,
            password: spassword,
            is_admin: 0,
            is_verified: 1
          });  
          await user.save();
          console.log(user)
       }
         


      
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error sending OTP');
    }
};


const securePassword = async(password)=>{
   
    try {
         
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;


    } catch (error){
        console.log(error.message)
    }
}

module.exports = {
    Loadhome,
    loadlogin,
    verifyLogin,
    loadsign,
    loaduser,
    otpverify
};
