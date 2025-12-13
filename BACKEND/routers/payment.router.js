const express = require("express");
const { authenticate, isAdmin } = require("../auth/auth.middleware");
const { createCheckoutSesion, sessionStatus } = require("../controllers/payment.controller");

const router = express.Router();


router.get('/create-session', authenticate,  createCheckoutSesion);

router.get("/session-status", authenticate,  sessionStatus);



module.exports = router;