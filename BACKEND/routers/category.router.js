const express = require("express");
const { getCategory, createCategory, updateCategoryById, deleteCategoryById } = require("../controllers/category.controller");
const { authenticate, isAdmin } = require("../auth/auth.middleware");


const router = express.Router();

router.get("/", getCategory);

router.post('/create',authenticate, isAdmin, createCategory);

router.put("/:id",authenticate, isAdmin, updateCategoryById);
router.delete("/:id",authenticate, isAdmin, deleteCategoryById)



module.exports = router;