const Cart = require("../models/cart.model");

module.exports = {
    addToCart: async (req, res) => {
        try {

            const { productId } = req.body;
            const userId = req.user.id;
            let cart = await Cart.findOne({ user: userId });
            console.log(cart)
            if (cart) {
                const productIndex = cart.products.findIndex(x => x.product.equals(productId));
                if (productIndex >= 0) {
                    cart.products[productIndex].quantity += 1;
                } else {
                    cart.products.push({ product: productId, quantity: 1 })
                }
            } else {
                cart = new Cart({ user: userId, products: [{ product: productId, quantity: 1 }] })
            }

            const savedCart = await cart.save();
            res.status(200).json({ success: true, message: "Exito al añadir al carrito", cart: savedCart })

        } catch (error) {
            res.status(500).json({ success: false, message: "Error en crear Cart" })
        }
    },
    getCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const userCart = await Cart.findOne({ user: userId }).populate("products.product");
            res.status(200).json({ success: true, cart: userCart })
        } catch (error) {
            res.status(500).json({ success: false, message: "Error en obtener cart." })
        }
    },
    updateCart: async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }

        const productIndex = cart.products.findIndex(
            x => x.product.equals(productId)
        );

        if (productIndex < 0) {
            return res.status(404).json({ success: false, message: "Product not in cart." });
        }

        cart.products[productIndex].quantity = quantity;

        const updatedCart = await cart.save();
        return res.status(200).json({ success: true, message: "Carrrito actualizado.", cart:updatedCart });

    } catch (error) {
        console.log("Cart update", error);
        return res.status(500).json({ success: false, message: "Error en actualizar cart." });
    }
}
,
    deleteItemFromCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const productId = req.params.id;
            const cart = await Cart.findOne({ user: userId });
            console.log("id", productId)
            if (!cart) { res.status(404).json({ success: false, message: "Cart not found" }) }
            const productIndex = cart.products.findIndex(x => x.product.equals(productId))
            console.log("index", productIndex)
            if (productIndex >= 0) {
            //    delete cart.products[productIndex]
            cart.products.splice(productIndex,1)
            }
            const carAfterDelete = await cart.save();
            res.status(200).json({ success: true, message: "Fue eliminado correctamente.", cart: cart })
        } catch (error) {
            res.status(500).json({ success: false, message: "Error en eliminar." })
        }
    }
}