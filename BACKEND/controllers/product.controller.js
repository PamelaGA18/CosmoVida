const Product = require("../models/product.model");
const fs = require("fs");
const path = require("path");

// -------------------------------------------
// NORMALIZAR ARRAYS DESDE REACT
// -------------------------------------------
function normalizeQueryArray(query, keyName) {
    if (!query) return undefined;

    if (query[keyName]) {
        return Array.isArray(query[keyName])
            ? query[keyName]
            : [query[keyName]];
    }

    if (query[`${keyName}[]`]) {
        return Array.isArray(query[`${keyName}[]`])
            ? query[`${keyName}[]`]
            : [query[`${keyName}[]`]];
    }

    // 3. key[0], key[1], key[0][0], etc.
    const keys = Object.keys(query).filter(k => k.startsWith(`${keyName}[`));
    if (keys.length > 0) {
        return keys.map(k => query[k]);
    }

    return undefined;
}

module.exports = {
    createProduct: async (req, res) => {
        try {
            const images = req.files.map(file => file.path);

            const newProduct = new Product({
                name: req.body.name,
                description: req.body.description,
                short_desc: req.body.short_desc,
                images: images,
                price: req.body.price,
                stock: req.body.stock,
                category: req.body.category,
                color: req.body.color
            });

            const savedProduct = await newProduct.save();
            res.status(200).json({ success: true, message: "Producto creado", savedProduct });
        } catch (error) {
            console.log("ERROR createProduct:", error);
            res.status(500).json({ success: false, message: "Error en Crear nuevo Producto." });
        }
    },

    // ---------------------------------------------------
    // GET PRODUCTS (FILTROS Y BUSCADOR)
    // ---------------------------------------------------
    getProducts: async (req, res) => {
        try {
            console.log("REQ QUERY COMPLETO:", req.query);

            const search = req.query.search || null;

            const category = normalizeQueryArray(req.query, "category");
            const color = normalizeQueryArray(req.query, "color");

            const filter = {};

            if (category) filter.category = { $in: category };
            if (color) filter.color = { $in: color };

            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ];
            }

            console.log("category:", category);
            console.log("color:", color);
            console.log("filter:", filter);

            const products = await Product.find(filter).populate(["color", "category"]);

            res.status(200).json({ success: true, products });
        } catch (error) {
            console.log("ERROR getProducts:", error);
            res.status(500).json({ success: false, message: "Error al obtener productos." });
        }
    },

    // ---------------------------------------------------
    // GET SINGLE PRODUCT
    // ---------------------------------------------------
    getSingleProduct: async (req, res) => {
        try {
            const id = req.params.id;
            const product = await Product.findById(id);

            res.status(200).json({ success: true, product });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error en obtener un solo producto." });
        }
    },

    updateProductById: async (req, res) => {
        try {
            const id = req.params.id;
            const { name, description, short_desc, price, stock, category, color } = req.body;

            let newImages = req.files.map(file => file.path);

            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ success: false, message: "Producto no encontrado" });
            }

            let images = [...product.images, ...newImages];

            const updateProduct = await Product.findByIdAndUpdate(
                id,
                { name, description, short_desc, price, stock, category, color, images },
                { new: true }
            );

            res.status(200).json({ success: true, message: "Producto actualizado", updateProduct });

        } catch (error) {
            res.status(500).json({ success: false, message: "Error en actualizar producto." });
        }
    },

    deleteProductById: async (req, res) => {
        try {
            const id = req.params.id;
            const product = await Product.findOne({_id:id});
            if(!product){ return res.status(404).json({success:false, message: "Producto no eliminado"})};
            product.images.forEach(image=>{
                const imagePath = image;
                if(fs.existsSync(imagePath)){
                    fs.unlinkSync(imagePath);
                }else{
                    console.warn("Imagen no eliminada:", imagePath);
                }
            })

            await Product.findByIdAndDelete(id);
            const productsAfterDelete = await Product.find();
            res.status(200).json({ success: true, message: "Producto eliminado", products: productsAfterDelete })
        } catch (error) {
            res.status(500).json({ success: false, message: "Error en eliminar producto." })
        }
    },

    deleteImageById: async (req, res) => {
        try {
            const productId = req.params.productId;
            const imageIndex = req.params.imageIndex;
            const productData = await Product.findById(productId);
            if (!productData) {
                return res.status(404).json({ success: false, message: "Producto no encontrado" });
            }
            const imagePath = productData.images[imageIndex];
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }else{
                    console.warn("Imagen no eliminada:", imagePath);
                }
            productData.images.splice(imageIndex, 1);
            await productData.save();

            res.status(200).json({ success: true, message: "Imagen eliminada", images: productData.images });
        } catch (error) {
            console.error("Error al eliminar imagen:", error);
            res.status(500).json({ success: false, message: "Error en eliminar la imagen." });
        }
    }
};
