require('dotenv').config()
const Cart = require("../models/cart.model");
const Order = require("../models/order.model")
const stripe = require('stripe')(process.env.STRIPE_SECRET)


module.exports = {
    createCheckoutSesion: async (req, res) => {
        try {
            // ✅ Usar variable de entorno
            const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
            const userId = req.user.id;
            
            const cart = await Cart.findOne({ user: userId }).populate("products.product");
            if (!cart) { 
                return res.status(404).json({ success: false, message: "Cart not found." }) 
            }
            
            const lineItems = cart.products.map((x) => {
                return {
                    price_data: {
                        currency: 'mxn',
                        unit_amount: +x.product.price * 100,
                        product_data: {
                            name: x.product.name,
                            description: x.product.short_desc,
                            images: x.product.images ? [`${process.env.BACKEND_URL}/uploads/${x.product.images[0]}`] : []
                        }
                    },
                    quantity: x.quantity
                }
            });
            
            const session = await stripe.checkout.sessions.create({
                ui_mode: 'embedded',
                line_items: lineItems,
                mode: 'payment',
                // ✅ URL correcta
                return_url: `${FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}`
            });

            res.send({ clientSecret: session.client_secret });
        } catch (error) {
            console.log("Error creating checkout session:", error);
            res.status(500).json({ success: false, message: "Error creating checkout session" });
        }
    },
    
    sessionStatus: async (req, res) => {
        try {
            const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
            
            // ✅ Obtener userId de query params
            const userId = req.query.user_id;
            
            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }
            
            const cart = await Cart.findOne({ user: userId }).populate("products.product");
            if (!cart) {
                return res.status(404).json({ success: false, message: "Cart not found." });
            }
            
            const totalPrice = cart.products.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
            
            const newOrder = new Order({ 
                user: userId, 
                products: cart.products, 
                totalPrice, 
                paymentId: req.query.session_id, 
                paymentStatus: session.payment_status 
            });
            await newOrder.save();

            // Limpiar carrito
            await Cart.findOneAndDelete({ user: userId });

            res.send({
                status: session.payment_status,
                customer_email: session.customer_details?.email || ''
            });
        } catch (error) {
            console.log("Session status error:", error);
            res.status(500).json({ success: false, message: "Error checking session status" });
        }
    }
}



