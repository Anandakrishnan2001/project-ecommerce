   let express = require('express');
   let app = express();
   const path  = require('path');
   const nocache = require('nocache');
   const session = require("express-session");
   const mongoose = require('mongoose');
   mongoose.connect("mongodb://127.0.0.1:27017/lensluxe");
   require('dotenv').config()
  
    
   app.use(nocache())
   app.use(express.static(path.join(__dirname,'views')))
   app.use(express.static(path.join(__dirname,'public')))
   app.use(session({
      secret: 'your_secret_key',
      resave: false,
      saveUninitialized: false,
     
  }));
 
   //for userroute
   const userRoute = require('./routes/userroute')
   app.use('/',userRoute);
  //for adminroute
   const adminRoute = require('./routes/adminroute')
   app.use('/admin',adminRoute);
  
   const port = process.env.PORT||3000

   app.listen(port,()=>{
      console.log(`App is started in the ${port}`)
   } )