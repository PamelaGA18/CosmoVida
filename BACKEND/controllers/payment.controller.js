require('dotenv').config();
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
    createCheckoutSession: async (req, res) => {
        try {
            console.log("🛒 Iniciando creación de sesión de pago Embedded...");

            const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
            const userId = req.user.id;

            console.log("👤 Usuario ID:", userId);
            console.log("🔑 Stripe Key:", process.env.STRIPE_SECRET_KEY ? "Presente" : "Faltante");

            // Buscar carrito
            const cart = await Cart.findOne({ user: userId }).populate("products.product");

            if (!cart || cart.products.length === 0) {
                console.log("⚠️ Carrito vacío o no encontrado");
                return res.status(404).json({
                    success: false,
                    message: "Tu carrito está vacío. Agrega productos antes de pagar."
                });
            }

            console.log("📦 Productos en carrito:", cart.products.length);

            // Crear line items para Stripe
            const lineItems = cart.products.map((item, index) => {
                const product = item.product;

                // Validar y convertir precio
                const price = parseFloat(product.price);
                if (isNaN(price) || price <= 0) {
                    console.error(`❌ Precio inválido para producto ${product.name}: ${product.price}`);
                    throw new Error(`Precio inválido para producto: ${product.name}`);
                }

                const unitAmount = Math.round(price * 100); // Convertir a centavos

                console.log(`📋 Item ${index + 1}: ${product.name}, Cantidad: ${item.quantity}, Precio: $${price.toFixed(2)}`);

                // Crear line item para Stripe (sin imágenes para evitar errores)
                return {
                    price_data: {
                        currency: 'mxn',
                        unit_amount: unitAmount,
                        product_data: {
                            name: product.name.substring(0, 100),
                            description: (product.short_desc || product.description || 'Producto de CosmoVida')
                                .substring(0, 500),
                            // No incluir imágenes - causa problemas con Embedded Checkout
                        }
                    },
                    quantity: item.quantity,
                    adjustable_quantity: {
                        enabled: true,
                        minimum: 1,
                        maximum: 10
                    }
                };
            });

            console.log("✅ Line items creados:", lineItems.length);

            // IMPORTANTE: Crear sesión para Embedded Checkout
            const session = await stripe.checkout.sessions.create({
                line_items: lineItems,
                mode: 'payment',
                ui_mode: 'embedded', // CLAVE para Embedded Checkout
                redirect_on_completion: 'never', // Embedded maneja el flujo
                return_url: `${FRONTEND_URL}/payment-return?session_id={CHECKOUT_SESSION_ID}`,
                metadata: {
                    userId: userId.toString(),
                    cartId: cart._id.toString(),
                    customerName: req.user.name || '',
                    customerEmail: req.user.email || ''
                },
                customer_email: req.user.email, // Email del cliente
                billing_address_collection: 'required',
                shipping_address_collection: {
                    allowed_countries: ['MX']
                },
                // Configuración específica para Embedded
                phone_number_collection: {
                    enabled: true
                },
                custom_text: {
                    submit: {
                        message: 'Gracias por tu compra en CosmoVida'
                    }
                }
            });

            console.log("🎉 Sesión Stripe creada exitosamente:", session.id);
            console.log("🔑 Client secret generado");

            // Guardar referencia de la sesión en el carrito
            await Cart.findOneAndUpdate(
                { user: userId },
                { $set: { stripeSessionId: session.id } },
                { new: true }
            );

            // IMPORTANTE: Solo UNA respuesta con el formato que espera Embedded Checkout
            return res.json({
                success: true,
                clientSecret: session.client_secret, // Esto es lo que espera Embedded Checkout
                sessionId: session.id,
                message: "Sesión de pago creada exitosamente"
            });

        } catch (error) {
            console.error("🔥 ERROR CRÍTICO en createCheckoutSession:");
            console.error("📝 Mensaje:", error.message);
            console.error("📊 Tipo:", error.type);
            console.error("🔢 Código:", error.code);
            console.error("📍 Parámetro:", error.param);

            if (error.raw) {
                console.error("📡 Raw error from Stripe:", error.raw.message);
            }

            // Respuesta de error estructurada
            let statusCode = 500;
            let userMessage = "Error creando sesión de pago";

            if (error.type === 'StripeInvalidRequestError') {
                statusCode = 400;
                userMessage = "Error en la configuración de pago. Verifica los datos.";
            } else if (error.code === 'STRIPE_CONNECTION_ERROR') {
                userMessage = "Error de conexión con el servicio de pagos. Intenta más tarde.";
            }

            res.status(statusCode).json({
                success: false,
                message: userMessage,
                error: error.message,
                stripeCode: error.code,
                param: error.param
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

            // Recuperar sesión de Stripe
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['line_items', 'customer']
            });

            const userId = session.metadata?.userId || req.user?.id;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudo identificar el usuario",
                    sessionStatus: session.status,
                    paymentStatus: session.payment_status
                });
            }

            console.log("📊 Estado de sesión:", {
                id: session.id,
                status: session.status,
                paymentStatus: session.payment_status,
                customerEmail: session.customer_details?.email
            });

            // Solo crear orden si el pago es exitoso
            if (session.payment_status === 'paid') {
                // Buscar carrito
                const cart = await Cart.findOne({ user: userId }).populate("products.product");
                
                // Verificar si ya existe una orden para esta sesión
                const existingOrder = await Order.findOne({ paymentId: sessionId });

                if (!existingOrder && cart && cart.products.length > 0) {
                    // Calcular total
                    const totalPrice = cart.products.reduce((sum, item) => {
                        const price = parseFloat(item.product.price) || 0;
                        return sum + (price * item.quantity);
                    }, 0);

                    // Crear nueva orden
                    const newOrder = new Order({
                        user: userId,
                        products: cart.products.map(item => ({
                            product: item.product._id,
                            quantity: item.quantity,
                            price: item.product.price,
                            name: item.product.name
                        })),
                        totalPrice: totalPrice.toFixed(2),
                        paymentId: sessionId,
                        paymentStatus: session.payment_status,
                        customerEmail: session.customer_details?.email || req.user?.email || '',
                        customerName: session.customer_details?.name || req.user?.name || '',
                        shipping: session.shipping_details || {},
                        billing: session.customer_details?.address || {}
                    });

                    await newOrder.save();

                    // Limpiar carrito
                    await Cart.findOneAndDelete({ user: userId });

                    console.log(`✅ Orden creada: ${newOrder._id}, Total: $${totalPrice.toFixed(2)}`);
                } else if (existingOrder) {
                    console.log(`ℹ️ Orden ya existente: ${existingOrder._id}`);
                }
            }

            // Devolver estado completo
            res.json({
                success: true,
                status: session.status,
                paymentStatus: session.payment_status,
                customerEmail: session.customer_details?.email || '',
                customerName: session.customer_details?.name || '',
                amountTotal: session.amount_total ? (session.amount_total / 100) : 0,
                amountSubtotal: session.amount_subtotal ? (session.amount_subtotal / 100) : 0,
                sessionId: session.id,
                shipping: session.shipping_details || null,
                metadata: session.metadata || {}
            });

        } catch (error) {
            console.error("❌ Error en sessionStatus:", error.message);
            
            res.status(500).json({
                success: false,
                message: "Error verificando estado de sesión",
                error: error.message,
                sessionId: req.query.session_id
            });
        }
    }
};