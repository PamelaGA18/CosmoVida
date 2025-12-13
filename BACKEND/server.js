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

// Agrega estas rutas al principio, después de los middlewares:

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'CosmoVida API funcionando',
        timestamp: new Date().toISOString()
    });
});

app.get('/test-upload', (req, res) => {
    res.json({ 
        message: 'Uploads directory test',
        uploadsPath: path.join(process.cwd(), 'uploads')
    });
});

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