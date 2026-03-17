import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: Number,
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    images: [{ url: String, publicId: String }],
    featured: { type: Boolean, default: false },
    tags: [String]
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
