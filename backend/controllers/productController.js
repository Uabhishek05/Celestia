import Product from "../models/Product.js";

export async function getProducts(req, res) {
  const { category, sort = "createdAt", page = 1, limit = 12, search = "" } = req.query;
  const query = {};

  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: "i" };

  const sortMap = {
    newest: { createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { rating: -1 }
  };

  const products = await Product.find(query)
    .sort(sortMap[sort] || sortMap.newest)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Product.countDocuments(query);
  return res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

export async function getProductBySlug(req, res) {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json(product);
}

export async function createProduct(req, res) {
  const product = await Product.create(req.body);
  return res.status(201).json(product);
}

export async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return res.json(product);
}

export async function deleteProduct(req, res) {
  await Product.findByIdAndDelete(req.params.id);
  return res.json({ message: "Product deleted" });
}
