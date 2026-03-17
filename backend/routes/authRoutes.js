import { Router } from "express";
import {
  forgotPasswordLimiter,
  resetPasswordLimiter,
  resetPasswordVerifyLimiter
} from "../middleware/rateLimitMiddleware.js";
import {
  clearCart,
  forgotPassword,
  getGoogleClientConfig,
  getProfile,
  googleLogin,
  login,
  resetPassword,
  verifyResetToken,
  setCartItem,
  signup,
  syncStore,
  toggleWishlist,
  removeCartItem
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/verify", resetPasswordVerifyLimiter, verifyResetToken);
router.post("/reset-password", resetPasswordLimiter, resetPassword);
router.get("/google-config", getGoogleClientConfig);
router.get("/profile", protect, getProfile);
router.post("/sync-store", protect, syncStore);
router.post("/wishlist/toggle", protect, toggleWishlist);
router.put("/cart/item", protect, setCartItem);
router.delete("/cart", protect, clearCart);
router.delete("/cart/item/:productId", protect, removeCartItem);

export default router;
