const Mongoose = require("mongoose")
const categorySchema = Mongoose.Schema({
    name: {
        type: String,
        required: true

    },

    status: {
        type: String,
        enum: ['active', 'inactive', 'delete'],
        default: 'active'
    },
    update_at: {
        type: Date,
        default: Date.now
    },
    delete_at: {
        type: Date,
        default: null
    }
})

const Category = Mongoose.model("Category", categorySchema)

module.exports = Category 