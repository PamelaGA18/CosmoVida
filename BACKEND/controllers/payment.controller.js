require('dotenv').config();
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// Función para validar URLs de imágenes
const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    try {
        // Verificar si es una URL válida
        const urlObj = new URL(url);
        
        // Stripe solo acepta HTTPS para imágenes
        if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
            return false;
        }
        
        // Verificar extensión de imagen
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const hasValidExtension = validExtensions.some(ext => 
            url.toLowerCase().endsWith(ext)
        );
        
        return hasValidExtension;
    } catch (e) {
        // No es una URL válida
        return false;
    }
};

// Función para construir URL completa de imagen
const buildImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Si ya es una URL completa
    if (imagePath.startsWith('http')) {
        // Asegurarnos de que sea HTTPS para producción
        return imagePath.replace('http://', 'https://');
    }
    
    // Si es una ruta relativa, construir URL completa
    const BACKEND_URL = process.env.BACKEND_URL || 'https://cosmovida.onrender.com';
    return `${BACKEND_URL}/uploads/${imagePath}`;
};

module.exports = {
    createCheckoutSession: async (req, res) => {
        try {
            // URL del frontend
            const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
            
            const userId = req.user.id;
            const cart = await Cart.findOne({ user: userId }).populate("products.product");
            
            if (!cart || cart.products.length === 0) { 
                return res.status(404).json({ 
                    success: false, 
                    message: "Carrito vacío o no encontrado." 
                }); 
            }

            const lineItems = cart.products.map((item, index) => {
                const product = item.product;
                
                // Validar precio
                const unitAmount = Math.round(parseFloat(product.price) * 100);
                if (isNaN(unitAmount) || unitAmount <= 0) {
                    throw new Error(`Precio inválido para producto: ${product.name}`);
                }

                // Preparar imágenes para Stripe
                const imagesForStripe = [];
                
                if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                    // Tomar solo la primera imagen y validarla
                    const firstImage = product.images[0];
                    const imageUrl = buildImageUrl(firstImage);
                    
                    if (imageUrl && isValidImageUrl(imageUrl)) {
                        imagesForStripe.push(imageUrl);
                    }
                }
                
                // Si no hay imágenes válidas, dejar el array vacío (Stripe lo acepta)
                // O puedes usar una imagen por defecto:
                // if (imagesForStripe.length === 0) {
                //     imagesForStripe.push('https://via.placeholder.com/300x300?text=Producto');
                // }

                return {
                    price_data: {
                        currency: 'mxn',
                        unit_amount: unitAmount,
                        product_data: {
                            name: product.name.substring(0, 100), // Stripe límite 100 chars
                            description: (product.short_desc || product.description || 'Producto sin descripción')
                                .substring(0, 500), // Stripe límite 500 chars
                            images: imagesForStripe, // Array vacío si no hay imágenes válidas
                            metadata: {
                                productId: product._id.toString(),
                                sku: product.sku || `SKU-${product._id}`
                            }
                        }
                    },
                    quantity: item.quantity
                };
            });

            // Verificar que hayamos creado line items válidos
            if (lineItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No se pudieron crear items válidos para el pago"
                });
            }

            console.log(" Creando sesión con", lineItems.length, "items");

            const session = await stripe.checkout.sessions.create({
                ui_mode: 'embedded',
                line_items: lineItems,
                mode: 'payment',
                return_url: `${FRONTEND_URL}/return`,
                metadata: {
                    userId: userId.toString(),
                    cartId: cart._id.toString()
                },
                billing_address_collection: 'required',
                shipping_address_collection: {
                    allowed_countries: ['MX', 'US'] // Países permitidos
                },
                phone_number_collection: {
                    enabled: true
                },
                custom_text: {
                    shipping_address: {
                        message: 'Ingresa tu dirección de envío'
                    },
                    submit: {
                        message: 'Pagar ahora'
                    }
                }
            });

            // Guardar sessionId
            await Cart.findOneAndUpdate(
                { user: userId },
                { $set: { stripeSessionId: session.id } },
                { new: true }
            );

            console.log(" Sesión Stripe creada:", session.id);
            
            res.json({ 
                success: true, 
                clientSecret: session.client_secret,
                sessionId: session.id
            });
            
        } catch (error) {
            console.error(" Error detallado en createCheckoutSession:", {
                message: error.message,
                type: error.type,
                code: error.code,
                param: error.param
            });
            
            res.status(500).json({ 
                success: false, 
                message: "Error creando sesión de pago",
                error: error.message,
                stripeError: error.code,
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

            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['line_items.data.price.product']
            });
            
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

            // Solo crear orden si el pago es exitoso
            if (session.payment_status === 'paid') {
                const existingOrder = await Order.findOne({ paymentId: sessionId });
                
                if (!existingOrder) {
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
                        shipping: session.shipping_details || {},
                        billing: session.customer_details || {}
                    });
                    await newOrder.save();

                    // Limpiar carrito
                    await Cart.findOneAndDelete({ user: userId });
                    
                    console.log(` Orden ${newOrder._id} creada para usuario ${userId}`);
                }
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