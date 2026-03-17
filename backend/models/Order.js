import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
        image: String
      }
    ],
    shippingAddress: {
      name: String,
      email: String,
      address: String,
      city: String,
      postalCode: String
    },
    subtotal: Number,
    shippingFee: Number,
    discount: Number,
    totalAmount: Number,
    paymentMethod: { type: String, enum: ["stripe", "razorpay", "cod"], default: "stripe" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing"
    },
    stripeSessionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
