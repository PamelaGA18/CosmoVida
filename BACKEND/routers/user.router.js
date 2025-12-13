// user.routes.js
const express = require("express");
const { register, login, fetchUsers, deleteUserById } = require("../controllers/user.controller");
const { authenticate, isAdmin } = require("../auth/auth.middleware");
const upload = require('../middleware/upload');


const { getProfile, updateProfile } = require("../controllers/user.controller");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", authenticate, isAdmin, fetchUsers);
router.delete("/:id", authenticate, isAdmin, deleteUserById)

router.get("/me", authenticate, getProfile);

// Vamos a agregar logs en la ruta de actualización de perfil
router.put("/me", authenticate, (req, res, next) => {
    console.log("=== RUTA /me PUT INICIADA ===");
    console.log("Usuario autenticado:", req.user);
    console.log("Content-Type:", req.headers['content-type']);
    next();
}, upload.single("image"), (req, res, next) => {
    console.log("=== DESPUÉS DE MULTER ===");
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    if (!req.file) {
        console.log("❌ ERROR: req.file es undefined/null");
        console.log("Posibles causas:");
        console.log("- Fieldname no coincide ('image' vs otro)");
        console.log("- Límite de tamaño excedido");
        console.log("- Tipo de archivo no permitido");
        console.log("- Error en middleware upload");
    } else {
        console.log("✅ Archivo recibido correctamente:", req.file);
    }
    next();
}, updateProfile);

module.exports = router;