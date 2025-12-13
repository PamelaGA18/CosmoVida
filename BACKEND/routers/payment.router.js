const express = require("express");
const { authenticate } = require("../auth/auth.middleware");
const { createCheckoutSession, sessionStatus } = require("../controllers/payment.controller"); // <- Nombre corregido

const router = express.Router();

router.get('/create-session', authenticate, createCheckoutSession); // <- Nombre corregido
router.get("/session-status", authenticate, sessionStatus);

module.exports = router;