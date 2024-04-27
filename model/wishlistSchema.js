const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishlistSchema = mongoose.Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    items:[{
       productId:{
        type: Schema.Types.ObjectId,
        ref:'Product',
        required:true
        
       } 
    }],
    status:{
        type:String,
        enum:['added','not-added'],
        default:'added'
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Wishlist',wishlistSchema);