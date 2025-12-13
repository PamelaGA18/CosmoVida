require('dotenv').config()
const Cart = require("../models/cart.model");
const Order = require("../models/order.model")
const stripe = require('stripe')(process.env.STRIPE_SECRET)
console.log("Stripe configurado. Modo:", process.env.NODE_ENV);

module.exports = {
    createCheckoutSession: async (req, res) => { // <- Corregir nombre (2 "s")
        try {
            const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
            
            console.log("=== CREATING CHECKOUT SESSION ===");
            console.log("User ID:", req.user.id);
            console.log("Frontend URL:", FRONTEND_URL);
            
            const userId = req.user.id;
            const cart = await Cart.findOne({ user: userId }).populate("products.product");
            
            if (!cart) { 
                console.log("Cart not found for user:", userId);
                return res.status(404).json({ success: false, message: "Cart is not there." });
            }
            
            if (!cart.products || cart.products.length === 0) {
                console.log("Cart is empty for user:", userId);
                return res.status(400).json({ success: false, message: "Cart is empty." });
            }
            
            console.log("Cart products:", cart.products.length);
            
            // Crear line items para Stripe
            const lineItems = cart.products.map((item) => {
                const product = item.product;
                console.log(`Processing product: ${product.name}, Price: ${product.price}`);
                
                return {
                    price_data: {
                        currency: 'mxn',
                        unit_amount: Math.round(product.price * 100), // Asegurar entero
                        product_data: {
                            name: product.name,
                            description: product.short_desc || product.description || '',
                            // Si no quieres imágenes, no incluyas el campo o déjalo como array vacío
                            images: []
                        }
                    },
                    quantity: item.quantity || 1
                };
            });
            
            console.log("Line items created:", lineItems.length);
            
            // Crear sesión de Stripe
            const session = await stripe.checkout.sessions.create({
                ui_mode: 'embedded',
                line_items: lineItems,
                mode: 'payment',
                return_url: `${FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`
            });
            
            console.log("Stripe session created:", session.id);
            
            res.json({ 
                success: true, 
                clientSecret: session.client_secret,
                sessionId: session.id
            });
            
        } catch (error) {
            console.error("Error creating checkout session:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error creating checkout session.",
                error: error.message 
            });
        }
    },
    
    sessionStatus: async (req, res) => {
        try {
            console.log("=== CHECKING SESSION STATUS ===");
            console.log("Session ID:", req.query.session_id);
            console.log("User ID from token:", req.user.id);
            
            const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
            
            const userId = req.user.id;
            const cart = await Cart.findOne({ user: userId }).populate("products.product");
            
            if (!cart) {
                return res.status(404).json({ success: false, message: "Cart not found." });
            }
            
            const totalPrice = cart.products.reduce((sum, item) => {
                return sum + (item.product.price * item.quantity);
            }, 0);
            
            console.log("Total price:", totalPrice);
            console.log("Payment status:", session.payment_status);
            
            // Verificar si la orden ya existe para evitar duplicados
            const existingOrder = await Order.findOne({ paymentId: req.query.session_id });
            
            if (!existingOrder) {
                console.log("Creating new order...");
                const newOrder = new Order({ 
                    user: userId, 
                    products: cart.products, 
                    totalPrice, 
                    paymentId: req.query.session_id, 
                    paymentStatus: session.payment_status 
                });
                await newOrder.save();
                console.log("Order saved:", newOrder._id);
                
                // Limpiar carrito
                await Cart.findOneAndDelete({ user: userId });
                console.log("Cart cleared for user:", userId);
            } else {
                console.log("Order already exists:", existingOrder._id);
            }
            
            res.json({
                success: true,
                status: session.payment_status,
                customer_email: session.customer_details?.email || req.user.email || 'No email provided'
            });
            
        } catch (error) {
            console.error("Error in session status:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error in setting session.",
                error: error.message 
            });
        }
    }
}