const express = require("express");
const { getAllOrders, getOrderByUser, updateOrderStatus, getOrderById } = require("../controllers/order.controller");
const { authenticate, isAdmin } = require("../auth/auth.middleware");

const router = express.Router();

router.get("/", authenticate, isAdmin,  getAllOrders);
router.get("/user", authenticate,  getOrderByUser);
router.get("/:id", authenticate, getOrderById)
//router.post('/create', authenticate,  createOrder);
router.put("/order-status/:id", authenticate, isAdmin, updateOrderStatus);



module.exports = router;