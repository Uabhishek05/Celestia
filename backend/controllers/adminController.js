import Category from "../models/Category.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function generateUniqueSlug(name) {
  const baseSlug = slugify(name) || `product-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;

  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

async function generateUniqueCategorySlug(name) {
  const baseSlug = slugify(name) || `category-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;

  while (await Category.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

function normalizeImages(images = []) {
  if (!Array.isArray(images) || images.length < 1 || images.length > 3) {
    return { error: "Add between 1 and 3 product images." };
  }

  const normalized = images
    .filter(Boolean)
    .map((image) => (typeof image === "string" ? image.trim() : ""))
    .filter(Boolean);

  if (normalized.length < 1 || normalized.length > 3) {
    return { error: "Add between 1 and 3 product images." };
  }

  const invalidImage = normalized.find((image) => !image.startsWith("data:image/"));
  if (invalidImage) {
    return { error: "Only image uploads are supported." };
  }

  return {
    images: normalized.map((url) => ({ url, publicId: "" }))
  };
}

export async function getDashboard(req, res) {
  const [users, totalOrders, recentOrders, products] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5),
    Product.countDocuments()
  ]);

  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: { $in: ["paid", "pending"] } } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
  ]);

  return res.json({
    totalUsers: users,
    totalProducts: products,
    totalOrders,
    totalRevenue: revenueAgg[0]?.totalRevenue || 0,
    recentOrders
  });
}

export async function getUsers(req, res) {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  return res.json(users);
}

export async function getCategories(req, res) {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  return res.json(categories);
}

export async function createCategory(req, res) {
  const name = req.body?.name?.trim();
  const description = req.body?.description?.trim() || "";

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  const existing = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
  if (existing) {
    return res.status(400).json({ message: "Category already exists." });
  }

  const sortOrder = (await Category.countDocuments()) + 1;
  const category = await Category.create({
    name,
    description,
    slug: await generateUniqueCategorySlug(name),
    sortOrder
  });

  return res.status(201).json(category);
}

export async function getProducts(req, res) {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const products = await Product.find().sort({ createdAt: -1 }).limit(limit);
  return res.json(products);
}

export async function createProduct(req, res) {
  const {
    name,
    description,
    category = "Accessories",
    price,
    originalPrice,
    stock = 0,
    featured = false,
    tags = [],
    images = []
  } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Product name is required." });
  }

  if (!description?.trim()) {
    return res.status(400).json({ message: "Product description is required." });
  }

  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ message: "Product price must be greater than 0." });
  }

  const parsedStock = Math.max(0, Number(stock) || 0);
  const parsedOriginalPrice = Number(originalPrice);
  const normalizedImages = normalizeImages(images);
  if (normalizedImages.error) {
    return res.status(400).json({ message: normalizedImages.error });
  }

  const product = await Product.create({
    name: name.trim(),
    slug: await generateUniqueSlug(name),
    description: description.trim(),
    category: category?.trim() || "Accessories",
    price: parsedPrice,
    originalPrice:
      Number.isFinite(parsedOriginalPrice) && parsedOriginalPrice > 0 ? parsedOriginalPrice : undefined,
    stock: parsedStock,
    featured: Boolean(featured),
    tags: Array.isArray(tags)
      ? tags.map((tag) => String(tag).trim()).filter(Boolean)
      : String(tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
    images: normalizedImages.images
  });

  return res.status(201).json(product);
}

export async function toggleUserBlock(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  return res.json(user);
}
