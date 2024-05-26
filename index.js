   let express = require('express');
   let app = express();
   const path  = require('path');
   const nocache = require('nocache');
   const session = require("express-session");
   const mongoose = require('mongoose');
   require('dotenv').config()
   mongoose.connect(process.env.MONGO_URL);
  
    
   app.use(nocache())
   app.use(express.static(path.join(__dirname,'views')))
   app.use(express.static(path.join(__dirname,'public')))
   app.use(session({
      secret: process.env.SESSION_SECRET ,
      resave: false,
      saveUninitialized: false,
     
  }));
//   app.use(formdata.parse())
 
   //for userroute
   const userRoute = require('./routes/userroute')
   app.use('/',userRoute);
  //for adminroute
   const adminRoute = require('./routes/adminroute')
   app.use('/admin',adminRoute);
  
   // app.use("/*", function (req, res) {
   //    res.redirect("/pageerror");
   //  });

   const port = process.env.PORT||3000

   app.listen(port,()=>{
      console.log(`App is started in the ${port}`)
   } )