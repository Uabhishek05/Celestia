import Category from "../models/Category.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const defaultCategories = [
  { name: "Earrings", slug: "earrings", description: "Statement and everyday earrings", sortOrder: 1 },
  { name: "Necklaces", slug: "necklaces", description: "Layered and premium necklaces", sortOrder: 2 },
  { name: "Bracelets", slug: "bracelets", description: "Charm and signature bracelets", sortOrder: 3 },
  { name: "Phone Charms", slug: "phone-charms", description: "Decorative phone charms", sortOrder: 4 },
  { name: "Keychains", slug: "keychains", description: "Personalized keychains", sortOrder: 5 },
  { name: "Hair Accessories", slug: "hair-accessories", description: "Luxury hair accessories", sortOrder: 6 },
  { name: "Gift Hampers", slug: "gift-hampers", description: "Curated gift hampers", sortOrder: 7 },
  { name: "Handmade Cards", slug: "handmade-cards", description: "Handmade greeting cards", sortOrder: 8 },
  { name: "Accessories", slug: "accessories", description: "General accessories", sortOrder: 9 }
];

export async function ensureStoreCollections() {
  await Promise.all([
    User.createCollection(),
    Product.createCollection(),
    Order.createCollection(),
    Payment.createCollection(),
    Category.createCollection(),
    Coupon.createCollection()
  ]);

  for (const category of defaultCategories) {
    await Category.updateOne({ slug: category.slug }, { $setOnInsert: category }, { upsert: true });
  }

  const ordersWithoutPayments = await Order.find().select(
    "_id user totalAmount paymentMethod paymentStatus razorpayOrderId razorpayPaymentId razorpaySignature"
  );

  for (const order of ordersWithoutPayments) {
    await Payment.updateOne(
      { order: order._id },
      {
        $setOnInsert: {
          order: order._id,
          user: order.user,
          amount: order.totalAmount || 0,
          method: order.paymentMethod,
          status: order.paymentStatus,
          providerOrderId: order.razorpayOrderId || order.stripeSessionId || "",
          providerPaymentId: order.razorpayPaymentId || "",
          providerSignature: order.razorpaySignature || ""
        }
      },
      { upsert: true }
    );
  }
}
