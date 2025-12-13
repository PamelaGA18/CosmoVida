require('dotenv').config();
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const stripe = require('stripe')(process.env.STRIPE_SECRET);

module.exports = {
    createCheckoutSession: async (req, res) => {
        try {
            //  Usar FRONTEND_URL dinámica SIN {CHECKOUT_SESSION_ID}
            const YOUR_DOMAIN = process.env.FRONTEND_URL || 'http://localhost:3000';
            
            // Asegurarnos de que la URL sea válida
            if (!YOUR_DOMAIN.startsWith('http')) {
                throw new Error(`URL inválida: ${YOUR_DOMAIN}`);
            }

            const userId = req.user.id;
            const cart = await Cart.findOne({ user: userId }).populate("products.product");
            
            if (!cart || cart.products.length === 0) { 
                return res.status(404).json({ 
                    success: false, 
                    message: "Carrito vacío o no encontrado." 
                }); 
            }

            const lineItems = cart.products.map((x) => {
                // Asegurarnos de que el precio sea un número válido
                const unitAmount = Math.round(parseFloat(x.product.price) * 100);
                if (isNaN(unitAmount) || unitAmount <= 0) {
                    throw new Error(`Precio inválido para producto: ${x.product.name}`);
                }

                return {
                    price_data: {
                        currency: 'mxn',
                        unit_amount: unitAmount,
                        product_data: {
                            name: x.product.name.substring(0, 100), // Stripe limita a 100 caracteres
                            description: (x.product.short_desc || x.product.description || '').substring(0, 500),
                            images: x.product.images && Array.isArray(x.product.images) && x.product.images.length > 0 
                                ? [x.product.images[0]] // Solo primera imagen
                                : [],
                        }
                    },
                    quantity: x.quantity
                };
            });

            //  Para Embedded Checkout, NO usar {CHECKOUT_SESSION_ID} en return_url
            const session = await stripe.checkout.sessions.create({
                ui_mode: 'embedded',
                line_items: lineItems,
                mode: 'payment',
                // IMPORTANTE: Para embedded, el return_url debe ser una URL simple
                // Stripe manejará la redirección automáticamente
                return_url: `${YOUR_DOMAIN}/return`,
                metadata: {
                    userId: userId.toString(),
                    cartId: cart._id.toString()
                }
            });

            // Guardar sessionId en el carrito
            await Cart.findOneAndUpdate(
                { user: userId },
                { $set: { stripeSessionId: session.id } },
                { new: true }
            );

            console.log(" Session creada exitosamente:", session.id);
            console.log(" Client Secret generado");
            
            res.json({ 
                success: true, 
                clientSecret: session.client_secret,
                sessionId: session.id
            });
            
        } catch (error) {
            console.error("❌ Error detallado en createCheckoutSession:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error creando sesión de pago",
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

    sessionStatus: async (req, res) => {
        try {
            const sessionId = req.query.session_id;
            
            if (!sessionId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "session_id es requerido" 
                });
            }

            const session = await stripe.checkout.sessions.retrieve(sessionId);
            
            // Obtener userId del metadata de la sesión
            const userId = session.metadata?.userId || req.query.user_id;
            
            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "No se pudo identificar el usuario" 
                });
            }

            // Buscar carrito
            const cart = await Cart.findOne({ user: userId }).populate("products.product");
            
            if (!cart) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Carrito no encontrado." 
                });
            }

            // Verificar si la orden ya existe
            const existingOrder = await Order.findOne({ paymentId: sessionId });
            
            if (!existingOrder && session.payment_status === 'paid') {
                // Calcular total
                const totalPrice = cart.products.reduce((sum, item) => 
                    sum + (item.product.price * item.quantity), 0
                );

                // Crear nueva orden
                const newOrder = new Order({ 
                    user: userId, 
                    products: cart.products, 
                    totalPrice, 
                    paymentId: sessionId, 
                    paymentStatus: session.payment_status,
                    customerEmail: session.customer_details?.email || '',
                    shipping: session.shipping_details || {}
                });
                await newOrder.save();

                // Limpiar carrito
                await Cart.findOneAndDelete({ user: userId });
                
                console.log(` Orden creada para usuario ${userId}, total: ${totalPrice}`);
            }

            res.json({
                success: true,
                status: session.payment_status,
                customer_email: session.customer_details?.email || '',
                sessionId: session.id
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