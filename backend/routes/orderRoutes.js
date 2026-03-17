import { Router } from "express";
import {
  createOrder,
  createRazorpayOrder,
  createStripeCheckout,
  getAllOrders,
  getMyOrders,
  updateOrderStatus,
  verifyRazorpayPayment
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, createOrder);
router.post("/razorpay-order", protect, createRazorpayOrder);
router.post("/razorpay-verify", protect, verifyRazorpayPayment);
router.post("/stripe-checkout", protect, createStripeCheckout);
router.get("/mine", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
