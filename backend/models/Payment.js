import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: { type: String, enum: ["stripe", "razorpay", "cod"], required: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    providerOrderId: { type: String, default: "" },
    providerPaymentId: { type: String, default: "" },
    providerSignature: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
