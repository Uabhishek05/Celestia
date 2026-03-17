import crypto from "crypto";
import mongoose from "mongoose";
import Stripe from "stripe";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import { calculateTotals } from "../utils/calculateTotals.js";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

async function syncPaymentRecord(order, overrides = {}) {
  await Payment.updateOne(
    { order: order._id },
    {
      $set: {
        user: order.user,
        amount: order.totalAmount || 0,
        method: order.paymentMethod,
        status: overrides.status || order.paymentStatus,
        providerOrderId:
          overrides.providerOrderId || order.razorpayOrderId || order.stripeSessionId || "",
        providerPaymentId: overrides.providerPaymentId || order.razorpayPaymentId || "",
        providerSignature: overrides.providerSignature || order.razorpaySignature || ""
      }
    },
    { upsert: true }
  );
}

function normalizeOrderItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one item before placing an order." };
  }

  const normalizedItems = items
    .map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = Number(item.price);

      if (!item?.name?.trim() || !Number.isFinite(price) || price <= 0) {
        return null;
      }

      const normalized = {
        name: item.name.trim(),
        price,
        quantity,
        image: item.image || ""
      };

      const productId = item.product || item.productId || item._id;
      if (productId && mongoose.Types.ObjectId.isValid(productId)) {
        normalized.product = productId;
      }

      return normalized;
    })
    .filter(Boolean);

  if (!normalizedItems.length) {
    return { error: "Order items are invalid." };
  }

  return { items: normalizedItems };
}

function normalizeShippingAddress(shippingAddress = {}, user = null) {
  return {
    name: shippingAddress.name || user?.name || "Customer",
    email: shippingAddress.email || user?.email || "",
    address: shippingAddress.address || "Address to be collected",
    city: shippingAddress.city || "Pending",
    postalCode: shippingAddress.postalCode || "000000"
  };
}

async function createRazorpayRemoteOrder({ amount, receipt }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys missing");
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`
    },
    body: JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      receipt,
      payment_capture: 1
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to create Razorpay order");
  }

  return response.json();
}

export async function createOrder(req, res) {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;
  const normalizedItems = normalizeOrderItems(items);
  if (normalizedItems.error) {
    return res.status(400).json({ message: normalizedItems.error });
  }

  const coupon = couponCode ? await Coupon.findOne({ code: couponCode.toUpperCase() }) : null;
  const totals = calculateTotals(normalizedItems.items, coupon);

  const order = await Order.create({
    user: req.user?._id,
    items: normalizedItems.items,
    shippingAddress: normalizeShippingAddress(shippingAddress, req.user),
    paymentMethod: paymentMethod === "cod" ? "cod" : "stripe",
    paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
    ...totals
  });

  await syncPaymentRecord(order);

  return res.status(201).json(order);
}

export async function createRazorpayOrder(req, res) {
  const { items, shippingAddress, couponCode } = req.body;
  const normalizedItems = normalizeOrderItems(items);
  if (normalizedItems.error) {
    return res.status(400).json({ message: normalizedItems.error });
  }

  const coupon = couponCode ? await Coupon.findOne({ code: couponCode.toUpperCase() }) : null;
  const totals = calculateTotals(normalizedItems.items, coupon);

  const order = await Order.create({
    user: req.user?._id,
    items: normalizedItems.items,
    shippingAddress: normalizeShippingAddress(shippingAddress, req.user),
    paymentMethod: "razorpay",
    paymentStatus: "pending",
    ...totals
  });

  const razorpayOrder = await createRazorpayRemoteOrder({
    amount: totals.totalAmount,
    receipt: `celestia_${order._id}`
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();
  await syncPaymentRecord(order, { providerOrderId: razorpayOrder.id });

  return res.status(201).json({
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID
  });
}

export async function verifyRazorpayPayment(req, res) {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    return res.status(500).json({ message: "Razorpay secret missing" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ message: "Invalid Razorpay signature" });
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      paymentStatus: "paid",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    },
    { new: true }
  );

  await syncPaymentRecord(order, {
    status: "paid",
    providerOrderId: razorpayOrderId,
    providerPaymentId: razorpayPaymentId,
    providerSignature: razorpaySignature
  });

  return res.json(order);
}

export async function createStripeCheckout(req, res) {
  if (!stripe) {
    return res.status(500).json({ message: "Stripe secret key missing" });
  }

  const { items, shippingAddress, couponCode } = req.body;
  const normalizedItems = normalizeOrderItems(items);
  if (normalizedItems.error) {
    return res.status(400).json({ message: normalizedItems.error });
  }

  const coupon = couponCode ? await Coupon.findOne({ code: couponCode.toUpperCase() }) : null;
  const totals = calculateTotals(normalizedItems.items, coupon);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/order-confirmation`,
    cancel_url: `${process.env.CLIENT_URL}/checkout`,
    line_items: normalizedItems.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: item.price * 100
      },
      quantity: item.quantity
    })),
    metadata: {
      shippingName: shippingAddress.name,
      couponCode: couponCode || ""
    }
  });

  const order = await Order.create({
    user: req.user?._id,
    items: normalizedItems.items,
    shippingAddress: normalizeShippingAddress(shippingAddress, req.user),
    paymentMethod: "stripe",
    paymentStatus: "pending",
    stripeSessionId: session.id,
    ...totals
  });

  await syncPaymentRecord(order, { providerOrderId: session.id });

  return res.status(201).json({ sessionId: session.id, orderId: order._id });
}

export async function getMyOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json(orders);
}

export async function getAllOrders(req, res) {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  return res.json(orders);
}

export async function updateOrderStatus(req, res) {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: req.body.orderStatus, paymentStatus: req.body.paymentStatus },
    { new: true }
  );

  if (order) {
    await syncPaymentRecord(order);
  }

  return res.json(order);
}
