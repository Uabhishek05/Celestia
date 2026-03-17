import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { ensureAdminUser } from "../utils/ensureAdminUser.js";
import { generateToken } from "../utils/generateToken.js";
import { isMailConfigured, sendMail } from "../utils/mailer.js";

const populateUser = (query) =>
  query
    .populate("wishlist")
    .populate("cart.product");

function normalizeProduct(product) {
  if (!product) return null;
  return {
    _id: product._id,
    id: product._id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice,
    stock: product.stock,
    rating: product.rating,
    images: (product.images || []).map((image) => image?.url).filter(Boolean),
    featured: product.featured,
    tags: product.tags || []
  };
}

function serializeUser(userDoc) {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    isBlocked: userDoc.isBlocked,
    wishlist: (userDoc.wishlist || []).map(normalizeProduct).filter(Boolean),
    cart: (userDoc.cart || [])
      .map((entry) => {
        const product = normalizeProduct(entry.product);
        if (!product) return null;
        return { ...product, quantity: entry.quantity };
      })
      .filter(Boolean)
  };
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function sanitizeUserStore(user) {
  user.wishlist = (user.wishlist || []).filter((id) => isValidObjectId(id));
  user.cart = (user.cart || []).filter(
    (entry) => entry?.product && isValidObjectId(entry.product) && Number(entry.quantity) > 0
  );
}

export async function signup(req, res) {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  return res.status(201).json({
    user: serializeUser(user),
    token: generateToken(user._id)
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@celestia.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

  if (email === adminEmail && password === adminPassword) {
    await ensureAdminUser({ resetPassword: true });
  }

  const user = await populateUser(User.findOne({ email }));
  if (!user || user.isBlocked) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({
    user: serializeUser(user),
    token: generateToken(user._id)
  });
}

export async function googleLogin(req, res) {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: "Google credential missing" });
  }

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  if (!response.ok) {
    return res.status(401).json({ message: "Invalid Google credential" });
  }

  const payload = await response.json();
  if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    return res.status(401).json({ message: "Google client mismatch" });
  }

  if (payload.email_verified !== "true") {
    return res.status(401).json({ message: "Google email is not verified" });
  }

  let user = await populateUser(User.findOne({ email: payload.email }));
  if (!user) {
    const generatedPassword = await bcrypt.hash(`${payload.sub}-${Date.now()}`, 10);
    user = await User.create({
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      password: generatedPassword
    });
    user = await populateUser(User.findById(user._id));
  }

  return res.json({
    user: serializeUser(user),
    token: generateToken(user._id)
  });
}

export async function forgotPassword(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: "If that email is registered, a password reset link has been sent."
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.passwordResetToken = hashedToken;
    user.passwordResetExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
    const appName = "Celestia";

    if (isMailConfigured()) {
      await sendMail({
        to: user.email,
        subject: `${appName} password reset`,
        text: `Reset your ${appName} password using this link: ${resetLink}. This link expires in 30 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2c221f;">
            <h2 style="margin: 0 0 12px; color: #6f4338;">Reset your password</h2>
            <p style="margin: 0 0 16px;">We received a request to reset your ${appName} password.</p>
            <p style="margin: 0 0 20px;">
              <a href="${resetLink}" style="display: inline-block; padding: 12px 20px; border-radius: 999px; background: #7d4a3e; color: #ffffff; text-decoration: none; font-weight: 600;">
                Reset password
              </a>
            </p>
            <p style="margin: 0 0 12px;">This link expires in 30 minutes.</p>
            <p style="margin: 0; font-size: 13px; color: #7e6a63;">If you did not request this, you can safely ignore this email.</p>
          </div>
        `
      });

      return res.json({
        message: "If that email is registered, a password reset link has been sent."
      });
    }

    return res.json({
      message: "Email delivery is not configured yet. Use the direct reset link below for local development.",
      resetLink
    });
  } catch (error) {
    console.error("Forgot password failed", error);
    return res.status(500).json({
      message: error.message || "Unable to send reset email right now"
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();
    const token = req.body.token?.trim();

    if (!email || !password || !token) {
      return res.status(400).json({ message: "Email, token, and new password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return res.json({
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Reset password failed", error);
    return res.status(500).json({
      message: error.message || "Unable to reset password right now"
    });
  }
}

export async function verifyResetToken(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const token = req.body.token?.trim();

    if (!email || !token) {
      return res.status(400).json({ message: "Email and reset token are required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() }
    }).select("_id email passwordResetExpiresAt");

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    return res.json({
      message: "Secure reset link verified",
      expiresAt: user.passwordResetExpiresAt
    });
  } catch (error) {
    console.error("Verify reset token failed", error);
    return res.status(500).json({
      message: error.message || "Unable to verify reset link right now"
    });
  }
}

export async function getGoogleClientConfig(req, res) {
  return res.json({
    clientId: process.env.GOOGLE_CLIENT_ID || ""
  });
}

export async function getProfile(req, res) {
  const rawUser = await User.findById(req.user._id).select("-password");
  sanitizeUserStore(rawUser);
  await rawUser.save();
  const user = await populateUser(User.findById(req.user._id).select("-password"));
  return res.json(serializeUser(user));
}

export async function syncStore(req, res) {
  const { cartItems = [], wishlistIds = [] } = req.body;
  const user = await User.findById(req.user._id);
  sanitizeUserStore(user);

  if (Array.isArray(wishlistIds) && wishlistIds.length) {
    const validWishlistIds = wishlistIds.filter(isValidObjectId);
    const validWishlistProducts = await Product.find({ _id: { $in: validWishlistIds } }).select("_id");
    const ids = validWishlistProducts.map((product) => product._id);
    user.wishlist = [...new Set([...user.wishlist.map(String), ...ids.map(String)])];
  }

  if (Array.isArray(cartItems) && cartItems.length) {
    const productIds = cartItems.map((item) => item.productId).filter(isValidObjectId);
    const validProducts = await Product.find({ _id: { $in: productIds } }).select("_id");
    const validSet = new Set(validProducts.map((product) => String(product._id)));

    cartItems.forEach((item) => {
      if (!validSet.has(String(item.productId))) return;
      const existing = user.cart.find((entry) => String(entry.product) === String(item.productId));
      if (existing) {
        existing.quantity = Math.max(existing.quantity, item.quantity || 1);
      } else {
        user.cart.push({ product: item.productId, quantity: Math.max(1, item.quantity || 1) });
      }
    });
  }

  await user.save();
  const populated = await populateUser(User.findById(user._id).select("-password"));
  return res.json(serializeUser(populated));
}

export async function toggleWishlist(req, res) {
  const { productId } = req.body;
  if (!isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const user = await User.findById(req.user._id);
  sanitizeUserStore(user);
  const exists = user.wishlist.some((id) => String(id) === String(productId));
  user.wishlist = exists
    ? user.wishlist.filter((id) => String(id) !== String(productId))
    : [...user.wishlist, productId];
  await user.save();

  const populated = await populateUser(User.findById(user._id).select("-password"));
  return res.json(serializeUser(populated));
}

export async function setCartItem(req, res) {
  const { productId, quantity } = req.body;
  if (!isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const user = await User.findById(req.user._id);
  sanitizeUserStore(user);
  const nextQuantity = Math.max(0, Number(quantity) || 0);
  const existing = user.cart.find((entry) => String(entry.product) === String(productId));

  if (nextQuantity <= 0) {
    user.cart = user.cart.filter((entry) => String(entry.product) !== String(productId));
  } else if (existing) {
    existing.quantity = nextQuantity;
  } else {
    user.cart.push({ product: productId, quantity: nextQuantity });
  }

  await user.save();
  const populated = await populateUser(User.findById(user._id).select("-password"));
  return res.json(serializeUser(populated));
}

export async function removeCartItem(req, res) {
  if (!isValidObjectId(req.params.productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const user = await User.findById(req.user._id);
  sanitizeUserStore(user);
  user.cart = user.cart.filter((entry) => String(entry.product) !== String(req.params.productId));
  await user.save();

  const populated = await populateUser(User.findById(user._id).select("-password"));
  return res.json(serializeUser(populated));
}

export async function clearCart(req, res) {
  const user = await User.findById(req.user._id);
  sanitizeUserStore(user);
  user.cart = [];
  await user.save();

  const populated = await populateUser(User.findById(user._id).select("-password"));
  return res.json(serializeUser(populated));
}
