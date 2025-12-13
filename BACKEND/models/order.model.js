const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    products: [
        {
            product: { type: mongoose.Schema.ObjectId, ref: "Product" },
            quantity: { type: Number, required: true }
        }
    ],
    totalPrice:{type:Number, required:true},
    orderStatus:{type:String, default:"pending"},
    paymentStatus:{type:String, default:"pending"},
    paymentId:{type:String, required:true},
    createdAt:{type:Date, default: new Date()}
})

module.exports = mongoose.model("Order", orderSchema)