
const Mongoose = require('mongoose');

const userSchema = Mongoose.Schema({

username:{
    type:String,
    required:true
},
email:{
    type: String,
    required:true,
    unique:true
},
password:{
    type:String,
    required : true
}


})

const User = Mongoose.model("User",userSchema)

module.exports = User;