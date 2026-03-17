import bcrypt from "bcryptjs";
import User from "../models/User.js";

export async function ensureAdminUser({ resetPassword = false } = {}) {
  const email = process.env.ADMIN_EMAIL || "admin@celestia.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.ADMIN_NAME || "Celestia Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    let shouldSave = false;

    if (existing.role !== "admin") {
      existing.role = "admin";
      shouldSave = true;
    }

    if (resetPassword) {
      existing.password = await bcrypt.hash(password, 10);
      shouldSave = true;
    }

    if (shouldSave) {
      await existing.save();
    }

    return existing;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const adminUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin"
  });

  console.log(`Seeded admin user: ${email}`);
  return adminUser;
}
