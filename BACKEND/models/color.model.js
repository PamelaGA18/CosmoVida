const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema({
    name:{type:String, required: true, unique:true, trim:true},
    description:{type:String},

    createdAt: {type:Date, default:new Date()}
})

module.exports = mongoose.model("Color", colorSchema)