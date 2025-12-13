require('dotenv').config();
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const stripe = require('stripe')(process.env.STRIPE_SECRET);

module.exports = {
    createCheckoutSession: async (req, res) => {
        try {
            //  CORRECTO: Usar FRONTEND_URL dinámica
            const YOUR_DOMAIN = process.env.FRONTEND_URL || 'http://localhost:3000';

            const userId = req.user.id;
            const cart = await Cart.findOne({ user: userId }).populate("products.product");
            
            if (!cart || cart.products.length === 0) { 
                return res.status(404).json({ 
                    success: false, 
                    message: "Carrito vacío o no encontrado." 
                }); 
            }

            const lineItems = cart.products.map((x) => {
                return {
                    price_data: {
                        currency: 'mxn',
                        unit_amount: Math.round(x.product.price * 100), // Stripe usa centavos
                        product_data: {
                            name: x.product.name,
                            description: x.product.short_desc || x.product.description || '',
                            images: x.product.images && x.product.images.length > 0 
                                ? x.product.images 
                                : [],
                        }
                    },
                    quantity: x.quantity
                };
            });

            const session = await stripe.checkout.sessions.create({
                ui_mode: 'embedded',
                line_items: lineItems,
                mode: 'payment',
                return_url: `${YOUR_DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}`
            });

            //  IMPORTANTE: Guardar sessionId temporalmente si es necesario
            await Cart.findOneAndUpdate(
                { user: userId },
                { $set: { stripeSessionId: session.id } },
                { new: true }
            );

            console.log(" Session creada:", session.id);
            
            res.json({ 
                success: true, 
                clientSecret: session.client_secret,
                sessionId: session.id
            });
            
        } catch (error) {
            console.error(" Error en createCheckoutSession:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error creando sesión de pago",
                error: error.message 
            });
        }
    },

    sessionStatus: async (req, res) => {
        try {
            const sessionId = req.query.session_id;
            const userId = req.query.user_id || req.user?.id;
            
            if (!sessionId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "session_id es requerido" 
                });
            }

            const session = await stripe.checkout.sessions.retrieve(sessionId);

            // Buscar carrito del usuario
            const cart = await Cart.findOne({ user: userId }).populate("products.product");
            
            if (!cart) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Carrito no encontrado." 
                });
            }

            // Calcular total
            const totalPrice = cart.products.reduce((sum, item) => 
                sum + (item.product.price * item.quantity), 0
            );

            // Verificar si la orden ya existe
            const existingOrder = await Order.findOne({ paymentId: sessionId });
            
            if (!existingOrder) {
                // Crear nueva orden solo si no existe
                const newOrder = new Order({ 
                    user: userId, 
                    products: cart.products, 
                    totalPrice, 
                    paymentId: sessionId, 
                    paymentStatus: session.payment_status,
                    customerEmail: session.customer_details?.email || ''
                });
                await newOrder.save();

                // Limpiar carrito solo si el pago fue exitoso
                if (session.payment_status === 'paid') {
                    await Cart.findOneAndDelete({ user: userId });
                }
            }

            res.json({
                success: true,
                status: session.payment_status,
                customer_email: session.customer_details?.email || ''
            });
            
        } catch (error) {
            console.error(" Error en sessionStatus:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error verificando estado de sesión",
                error: error.message 
            });
        }
    }
};