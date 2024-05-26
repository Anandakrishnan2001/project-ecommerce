
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Number,
        required: true
    },
    is_verified: {
        type: Number,
        required: true
    },
    ReferralCode:{
        type:String

    },
    Address: [{
        houseName: {
            type: String,
            required: true
        },
        street: {
            type: String,
            requried: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        postalCode: {
            type: Number,
            required: true
        },
        phoneNumber: {
            type: Number,
            required: true
        },
        type: {
            type: String,
        }
    }]


})

const User = mongoose.model("User", userSchema)

module.exports = User;