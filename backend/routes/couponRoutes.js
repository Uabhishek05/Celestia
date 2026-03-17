import { Router } from "express";
import { createCoupon, getCoupons, validateCoupon } from "../controllers/couponController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:code", validateCoupon);
router.get("/", protect, adminOnly, getCoupons);
router.post("/", protect, adminOnly, createCoupon);

export default router;
