const express = require("express");
const { authenticate } = require("../auth/auth.middleware");
const { createCheckoutSession, sessionStatus } = require("../controllers/payment.controller");

const router = express.Router();

router.post('/create-session', authenticate, createCheckoutSession);

router.get("/session-status", authenticate, sessionStatus);

module.exports = router;