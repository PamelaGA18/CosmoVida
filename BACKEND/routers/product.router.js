const express = require("express");
const { getProducts, createProduct, getSingleProduct, updateProductById, deleteProductById, deleteImageById } = require("../controllers/product.controller");
const { authenticate, isAdmin } = require("../auth/auth.middleware");
const upload = require('../middleware/multer');


const router = express.Router();

router.get("/", getProducts);
router.get("/:id",getSingleProduct);

router.post('/create',  authenticate, isAdmin, upload.array(`images`, 5), createProduct);

router.put("/:id",  authenticate, isAdmin, upload.array(`images`, 5),  updateProductById);
router.delete("/:id", authenticate, isAdmin,  deleteProductById);
router.delete("/:productId/image/:imageIndex", authenticate, isAdmin, deleteImageById)



module.exports = router;