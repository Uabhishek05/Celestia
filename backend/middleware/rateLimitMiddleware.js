const buckets = new Map();

function cleanupExpiredBuckets(now) {
  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function buildKey(prefix, req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string" && forwarded.trim()
      ? forwarded.split(",")[0].trim()
      : req.ip || req.socket?.remoteAddress || "unknown";

  return `${prefix}:${ip}`;
}

export function createRateLimiter({ prefix, windowMs, maxRequests, message }) {
  return function rateLimiter(req, res, next) {
    const now = Date.now();
    cleanupExpiredBuckets(now);

    const key = buildKey(prefix, req);
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs
      });
      return next();
    }

    if (existing.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        message
      });
    }

    existing.count += 1;
    return next();
  };
}

export const forgotPasswordLimiter = createRateLimiter({
  prefix: "forgot-password",
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: "Too many password reset requests. Please wait 15 minutes and try again."
});

export const resetPasswordVerifyLimiter = createRateLimiter({
  prefix: "reset-password-verify",
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: "Too many reset-link verification attempts. Please wait 15 minutes and try again."
});

export const resetPasswordLimiter = createRateLimiter({
  prefix: "reset-password",
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: "Too many password reset attempts. Please wait 15 minutes and try again."
});
