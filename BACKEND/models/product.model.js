const mongoose = require('mongoose');

const schema = mongoose.Schema;

const productSchema = new schema({
    name:{type:String, required: true},
    description:{type:String, required: true},
    short_desc:{type:String, required:false},
    images:[{type:String, required:true}],
    price:{type: Number, required:true},
    stock: { type: Number, required: true, default: 0 }, 
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    color:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Color",
        required:true
    },

    createdAt: {type:Date, default:new Date()}
})

module.exports = mongoose.model("Product", productSchema)