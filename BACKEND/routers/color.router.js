const express = require("express");
const { getColor, createColor, updateColorById, deleteColorById } = require("../controllers/color.controller");
const { authenticate, isAdmin } = require("../auth/auth.middleware");

const router = express.Router();

router.get("/", getColor);

router.post('/create', authenticate, isAdmin,  createColor);

router.put("/:id", authenticate, isAdmin,  updateColorById);
router.delete("/:id", authenticate, isAdmin,  deleteColorById)



module.exports = router;