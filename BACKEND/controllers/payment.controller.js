require('dotenv').config();
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const stripe = require('stripe')(process.env.STRIPE_SECRET);

module.exports = {
    createCheckoutSession: async (req, res) => {
        try {
            console.log("✅ Iniciando creación de sesión de pago...");

            const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
            const userId = req.user.id;

            console.log("👤 Usuario ID:", userId);

            // Buscar carrito
            const cart = await Cart.findOne({ user: userId }).populate("products.product");

            if (!cart || cart.products.length === 0) {
                console.log("❌ Carrito vacío o no encontrado");
                return res.status(404).json({
                    success: false,
                    message: "Carrito vacío o no encontrado."
                });
            }

            console.log("🛒 Productos en carrito:", cart.products.length);

            // Crear line items
            const lineItems = cart.products.map((item, index) => {
                const product = item.product;

                // Validar y convertir precio
                const price = parseFloat(product.price);
                if (isNaN(price) || price <= 0) {
                    console.error(`⚠️ Precio inválido para producto ${product.name}: ${product.price}`);
                    throw new Error(`Precio inválido para producto: ${product.name}`);
                }

                const unitAmount = Math.round(price * 100);

                console.log(`📦 Item ${index + 1}: ${product.name}, Cantidad: ${item.quantity}, Precio: $${price}`);

                return {
                    price_data: {
                        currency: 'mxn',
                        unit_amount: unitAmount,
                        product_data: {
                            name: product.name.substring(0, 100),
                            description: (product.short_desc || product.description || 'Producto de CosmoVida')
                                .substring(0, 500),
                        }
                    },
                    quantity: item.quantity
                };
            });

            console.log("✅ Line items creados:", lineItems.length);

            // Crear sesión de Stripe (REDIRECT CHECKOUT)
            const session = await stripe.checkout.sessions.create({
                line_items: lineItems,
                mode: 'payment',
                success_url: `${FRONTEND_URL}/?payment_success=1&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${FRONTEND_URL}/cart?canceled=1`,
                metadata: {
                    userId: userId.toString(),
                    cartId: cart._id.toString()
                },
                billing_address_collection: 'required',
                shipping_address_collection: {
                    allowed_countries: ['MX']
                },
                phone_number_collection: {
                    enabled: true
                }
            });

            console.log("🎫 Sesión Stripe creada:", session.id);
            console.log("🔗 URL de redirección:", session.url);

            // Guardar referencia de la sesión
            await Cart.findOneAndUpdate(
                { user: userId },
                { $set: { stripeSessionId: session.id } },
                { new: true }
            );

            // UNA SOLA RESPUESTA - Para Redirect Checkout
            res.json({ 
                success: true, 
                url: session.url,  // URL para redirigir al usuario a Stripe
                sessionId: session.id
            });

        } catch (error) {
            console.error("❌ ERROR en createCheckoutSession:");
            console.error("Mensaje:", error.message);
            console.error("Tipo:", error.type);
            console.error("Código:", error.code);

            res.status(500).json({
                success: false,
                message: "Error creando sesión de pago",
                error: error.message,
                stripeCode: error.code
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

            console.log("🔍 Verificando estado de sesión:", sessionId);

            const session = await stripe.checkout.sessions.retrieve(sessionId);
            const userId = session.metadata?.userId;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo identificar el usuario"
                });
            }

            // Buscar carrito
            const cart = await Cart.findOne({ user: userId }).populate("products.product");

            // Solo crear orden si el pago es exitoso
            if (session.payment_status === 'paid') {
                const existingOrder = await Order.findOne({ paymentId: sessionId });

                if (!existingOrder && cart) {
                    const totalPrice = cart.products.reduce((sum, item) =>
                        sum + (item.product.price * item.quantity), 0
                    );

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

                    console.log(`✅ Orden creada: ${newOrder._id}, Total: $${totalPrice}`);
                }
            }

            res.json({
                success: true,
                status: session.payment_status,
                customer_email: session.customer_details?.email || '',
                sessionId: session.id
            });

        } catch (error) {
            console.error("❌ Error en sessionStatus:", error);
            res.status(500).json({
                success: false,
                message: "Error verificando estado de sesión",
                error: error.message
            });
        }
    }
};