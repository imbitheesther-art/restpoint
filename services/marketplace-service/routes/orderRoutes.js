const express = require("express");
const router = express.Router();

const {
  placeOrder, getAllOrders, getOrderById, getOrderByNumber,
  getOrdersByUser, getGuestOrders, getOrderStats, updateOrderStatus, cancelOrder,
  directOrder
} = require("../controller/order-controller");

// Import proper auth middleware
const { protect, authorizeAny } = require("../../../global/middlewares/authMiddleware");

// ─── Place Order ─────────────────────────────────────────────────────────────
router.post("/", protect, placeOrder);
router.post("/place", protect, placeOrder);

// ─── Stats & Admin (any authenticated user) ─────────────────────────────────────
router.get("/stats", protect, authorizeAny, getOrderStats);
router.get("/admin/all", protect, authorizeAny, getAllOrders);
router.get("/admin/stats", protect, authorizeAny, getOrderStats);

// ─── Guest & Tracking ─────────────────────────────────────────────────────────
router.get("/guest/lookup", getGuestOrders);
router.get("/track/:orderNumber", getOrderByNumber);

// ─── User Orders ──────────────────────────────────────────────────────────────
router.get("/user/:userId", protect, getOrdersByUser);

// ─── Status Update ────────────────────────────────────────────────────────────
router.patch("/admin/:id/status", protect, authorizeAny, updateOrderStatus);
router.patch("/:id/status", protect, authorizeAny, updateOrderStatus);

// ─── All Orders ───────────────────────────────────────────────────────────────
router.get("/", protect, authorizeAny, getAllOrders);

// ─── Single Order ─────────────────────────────────────────────────────────────
router.get("/:id", protect, getOrderById);
router.post("/:id/cancel", protect, cancelOrder);

module.exports = router;
