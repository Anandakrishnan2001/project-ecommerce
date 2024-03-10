   let express = require('express');
require('dotenv').config()
   let app = express();
   const path  = require('path')
   const mongoose = require('mongoose');
   mongoose.connect("mongodb://127.0.0.1:27017/lensluxe");

    

   app.use(express.static(path.join(__dirname,'views')))
   app.use(express.static(path.join(__dirname,'public')))

   //for userroute
   const userRoute = require('./routes/userroute')
   app.use('/',userRoute);
  
   const port = process.env.PORT||3000

   app.listen(port,()=>{
      console.log(`App is started in the ${port}`)
   } )