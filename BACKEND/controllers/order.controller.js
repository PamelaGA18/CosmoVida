const Order = require("../models/order.model");

const Cart = require("../models/cart.model")


module.exports = {

    
    getOrderByUser: async(req, res)=>{
        try {
            const userId = req.user.id;
            const orders = await Order.find({user:userId})
            res.status(200).json({success:true, orders})
        } catch (error) {
            res.status(500).json({ success: false, message: "Error al obtener el pedido del usuario." })
        }
    },
    getOrderById: async(req, res)=>{
        try {
            const order = await Order.findOne({_id:req.params.id}).populate("products.product")
            res.status(200).json({success:true, order})
        } catch (error) {
            res.status(500).json({ success: false, message: "Error al obtener el pedido del usuario." })
        }
    },
    getAllOrders: async(req, res)=>{
        try {
            const orders = await Order.find()
            res.status(200).json({success:true, orders})
        } catch (error) {
            res.status(500).json({ success: false, message: "Error al obtener el pedido del usuario." })
        }
    },
    updateOrderStatus:async(req, res)=>{
        try {
            const id = req.params.id
            const {orderStatus} = req.body;
            await Order.findOneAndUpdate({_id:id},{$set:{orderStatus}})
            res.status(200).json({success:true, message:"El pedido fue actualizado correctamente."})
        } catch (error) {
            res.status(500).json({ success: false, message: "Error al actualizar el pedido." })
        }
    }
}