const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")
const path = require("path")

const app = express();

// IMPORT ROUTERS
const productRouter = require("./routers/product.router");
const categoryRouter = require("./routers/category.router");
const colorRouter = require('./routers/color.router');
const cartRouter = require("./routers/cart.router");
const orderRouter = require("./routers/order.router");
const userRouter = require("./routers/user.router")
const paymentRouter = require("./routers/payment.router")

// MIDDLEWARES
const corsOption = { exposedHeaders: "Authorization" }
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// CONNECTING TO MONGODB
mongoose.connect(process.env.MONGO_URL).then((res) => {
    console.log("MongoDB está conectado.")
}).catch(e => {
    console.log("Error en conección.", e)
})

app.get('/', (req, res) => {
    console.log('--- ¡Ruta Raíz Invocada! ---'); // <--- NUEVO LOG
    res.send('API CosmoVida Online y Lista.'); // <--- SOLO TEXTO
});
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ROUTES
app.use("/products", productRouter);
app.use("/category", categoryRouter)
app.use("/color", colorRouter)
app.use("/cart", cartRouter)
app.use("/order", orderRouter)
app.use("/user", userRouter);
app.use("/payment", paymentRouter)

const PORT = process.env.PORT;
app.listen(PORT, () => { console.log(`El servidor está corriendo en el puerto ${PORT}`) })

// En el backend
app.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            // Procesar pedido aquí
            await processSuccessfulPayment(session);
        }
        
        res.json({received: true});
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});