require('dotenv').config()
const Cart = require("../models/cart.model");
const Order = require("../models/order.model")
const stripe = require('stripe')(process.env.STRIPE_SECRET)


module.exports = {

    createCheckoutSesion: async (req, res) => {
        try {
            const YOUR_DOMAIN = 'http://localhost:3000';

            const userId = req.user.id;
            const cart = await Cart.findOne({ user: userId }).populate("products.product");
            if (!cart) { return res.status(404).json({ success: false, message: "Cart is not there." }) }
            const lineItems = cart.products.map((x) => {
                return {
                    price_data: {
                        currency: 'mxn',
                        unit_amount: +x.product.price * 100,
                        product_data: {
                            name: x.product.name,
                            description: x.product.short_desc,
                            //images: x.product.images,
                            images: []
                        }
                    },
                    quantity: x.quantity
                }
            })
            const session = await stripe.checkout.sessions.create({
                ui_mode: 'embedded',
                line_items: lineItems,
                mode: 'payment',
                return_url: `${YOUR_DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`
            });

            res.send({ clientSecret: session.client_secret });
        } catch (error) {
            console.log(error)
        }

    },
    // payment.controller.js - Función sessionStatus CORREGIDA
sessionStatus: async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        
        // ✅ Usa el usuario autenticado desde el token, NO desde la query
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId }).populate("products.product");
        
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }
        
        const totalPrice = cart.products.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const newOrder = new Order({
            user: userId,
            products: cart.products,
            totalPrice,
            paymentId: session.id, // Usa el ID de la sesión de Stripe
            paymentStatus: session.payment_status
        });
        await newOrder.save();
        
        // Limpia el carrito
        await Cart.findOneAndDelete({ user: userId });
        
        // ✅ Envía una respuesta completa
        res.send({
            status: session.payment_status,
            customer_email: session.customer_details?.email || '',
            session_id: session.id // Útil para el frontend
        });
        
    } catch (error) {
        console.error("Error in sessionStatus:", error);
        res.status(500).json({ success: false, message: "Error verifying payment status." });
    }
}
}



