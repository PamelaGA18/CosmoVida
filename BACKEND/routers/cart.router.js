const express = require("express");
const { addToCart, getCart, updateCart, deleteItem, deleteItemFromCart } = require("../controllers/cart.controller");
const { authenticate } = require("../auth/auth.middleware");

const router = express.Router();

router.get("/", authenticate, getCart);

router.post('/add', authenticate,  addToCart);

router.put("/:id", authenticate, updateCart);
router.delete("/:id", authenticate, deleteItemFromCart)



module.exports = router;