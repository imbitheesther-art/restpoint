const express = require("express");
const router = express.Router();
const { initiateMpesaPayment, handleInternalCallback, getPaymentStatus } = require("../controller/payment-controller");

// Import proper auth middleware
const { protect, authorize } = require("../../../global/middlewares/authMiddleware");

// Initiate M-Pesa Payment
router.post("/mpesa/stkpush", protect, initiateMpesaPayment);

// Get Payment Status (Polling)
router.get("/status/:checkoutId", protect, getPaymentStatus);

// Internal Callback from mpesa-service (no auth - called by M-Pesa API)
router.post("/callback", handleInternalCallback);

module.exports = router;
