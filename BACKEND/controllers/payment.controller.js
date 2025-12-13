require('dotenv').config()
const Cart = require("../models/cart.model");
const Order = require("../models/order.model")
const stripe = require('stripe')(process.env.STRIPE_SECRET)


module.exports = {

    createCheckoutSesion: async (req, res) => {
    try {
        // Usar variable de entorno o lógica dinámica
        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId }).populate("products.product");
        
        if (!cart || cart.products.length === 0) { 
            return res.status(404).json({ success: false, message: "Cart is empty." });
        }
        
        const lineItems = cart.products.map((x) => {
            return {
                price_data: {
                    currency: 'mxn',
                    unit_amount: Math.round(x.product.price * 100), // Asegurar número entero
                    product_data: {
                        name: x.product.name,
                        description: x.product.short_desc,
                        // Si no quieres imágenes, quita el array
                        images: []
                    }
                },
                quantity: x.quantity
            }
        });
        
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: lineItems,
            mode: 'payment',
            return_url: `${FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`
            // No necesitas pasar user_id aquí, viene del token
        });

        res.send({ clientSecret: session.client_secret });
    } catch (error) {
        console.log("Error creating checkout session:", error);
        res.status(500).json({ success: false, message: "Error creating checkout session." });
    }
},
    sessionStatus: async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        
        // El userId viene del token (req.user.id), no del query
        const userId = req.user.id;
        
        const cart = await Cart.findOne({ user: userId }).populate("products.product");
        
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }
        
        const totalPrice = cart.products.reduce((sum, item) => 
            sum + item.product.price * item.quantity, 0
        );
        
        // Verificar si la orden ya existe para evitar duplicados
        const existingOrder = await Order.findOne({ paymentId: req.query.session_id });
        
        if (!existingOrder) {
            const newOrder = new Order({ 
                user: userId, 
                products: cart.products, 
                totalPrice, 
                paymentId: req.query.session_id, 
                paymentStatus: session.payment_status 
            });
            await newOrder.save();
            
            // Limpiar carrito solo si se creó la orden
            await Cart.findOneAndDelete({ user: userId });
        }
        
        res.send({
            status: session.payment_status,
            customer_email: session.customer_details?.email || 'No email provided'
        });
    } catch (error) {
        console.log("Error in session status:", error);
        res.status(500).json({ success: false, message: "Error in setting session." });
    }
}
}



