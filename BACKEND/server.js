const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")
const path = require("path")
require('dotenv').config()

const app = express();

// Verificar variables de entorno críticas
console.log("=== CONFIGURACIÓN DEL SERVIDOR ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_URL:", process.env.MONGO_URL ? "✅ Configurada" : "❌ No configurada");
console.log("STRIPE_SECRET:", process.env.STRIPE_SECRET ? "✅ Configurada" : "❌ No configurada");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "No configurada");
console.log("BACKEND_URL:", process.env.BACKEND_URL || "No configurada");
console.log("================================");

// MIDDLEWARES
const corsOption = { 
    exposedHeaders: "Authorization",
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// CONNECTING TO MONGODB
mongoose.connect(process.env.MONGO_URL)
.then((res) => {
    console.log("✅ MongoDB está conectado.")
})
.catch(e => {
    console.error("❌ Error en conección a MongoDB:", e.message)
})

// Ruta de prueba de Stripe
app.get('/test-stripe', async (req, res) => {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET);
        const balance = await stripe.balance.retrieve();
        res.json({ 
            success: true, 
            message: "Stripe configurado correctamente",
            available: balance.available[0].amount 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error en Stripe",
            error: error.message 
        });
    }
});

app.get('/', (req, res) => {
    res.json({ 
        message: 'API CosmoVida Online',
        timestamp: new Date().toISOString(),
        endpoints: ['/products', '/cart', '/order', '/user', '/payment']
    });
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ROUTES
app.use("/products", require("./routers/product.router"));
app.use("/category", require("./routers/category.router"));
app.use("/color", require('./routers/color.router'));
app.use("/cart", require("./routers/cart.router"));
app.use("/order", require("./routers/order.router"));
app.use("/user", require("./routers/user.router"));
app.use("/payment", require("./routers/payment.router"));

// Middleware para errores
app.use((err, req, res, next) => {
    console.error("❌ Error no manejado:", err);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { 
    console.log(`🚀 El servidor está corriendo en el puerto ${PORT}`) 
});