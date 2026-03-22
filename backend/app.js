import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { getDbStatus, isDbReady } from "./config/db.js";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";

const app = express();
const configuredOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || "").split(",")
].map((value) => value?.trim()).filter(Boolean);
const allowedOrigins = [...new Set([...configuredOrigins, "http://localhost:5173", "http://127.0.0.1:5173"])];

function isAllowedOrigin(origin) {
  if (!origin || allowedOrigins.includes(origin)) {
    return true;
  }

  // Allow Celestia Vercel production/preview domains without opening every origin.
  return /^https:\/\/celestia[-a-z0-9]*\.vercel\.app$/i.test(origin);
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many API requests. Please wait a few minutes and try again." }
});

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);
app.options("*", cors());
app.use(compression());
app.use(express.json({ limit: "15mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  const db = getDbStatus();
  const status = db.ready ? "ok" : "degraded";
  res.status(db.ready ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    db
  });
});

app.use("/api", apiLimiter);

app.use("/api", (req, res, next) => {
  if (req.path === "/health") {
    next();
    return;
  }

  if (!isDbReady()) {
    res.status(503).json({
      message: "Backend database is offline. Start MongoDB or set a working MONGODB_URI, then try again."
    });
    return;
  }

  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

export default app;
