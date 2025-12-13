const express = require("express");
const { authenticate, isAdmin } = require("../auth/auth.middleware");
const { createCheckoutSesion, sessionStatus } = require("../controllers/payment.controller");

const router = express.Router();


router.get('/create-session', authenticate,  createCheckoutSesion);

router.get("/session-status", authenticate,  sessionStatus);

router.get("/public-session-status", sessionStatusPublic); // Ruta pública

module.exports = router;