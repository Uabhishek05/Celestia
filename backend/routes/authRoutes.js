import { Router } from "express";
import rateLimit from "express-rate-limit";
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
import { validateBody } from "../middleware/validateMiddleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyResetTokenSchema
} from "../validation/authSchemas.js";

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please wait 15 minutes and try again." }
});

router.use(authLimiter);

router.post("/signup", validateBody(signupSchema), signup);
router.post("/login", validateBody(loginSchema), login);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPasswordLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/verify", resetPasswordVerifyLimiter, validateBody(verifyResetTokenSchema), verifyResetToken);
router.post("/reset-password", resetPasswordLimiter, validateBody(resetPasswordSchema), resetPassword);
router.get("/google-config", getGoogleClientConfig);
router.get("/profile", protect, getProfile);
router.post("/sync-store", protect, syncStore);
router.post("/wishlist/toggle", protect, toggleWishlist);
router.put("/cart/item", protect, setCartItem);
router.delete("/cart", protect, clearCart);
router.delete("/cart/item/:productId", protect, removeCartItem);

export default router;
