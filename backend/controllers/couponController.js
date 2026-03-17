import Coupon from "../models/Coupon.js";

export async function createCoupon(req, res) {
  const coupon = await Coupon.create({ ...req.body, code: req.body.code.toUpperCase() });
  return res.status(201).json(coupon);
}

export async function getCoupons(req, res) {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return res.json(coupons);
}

export async function validateCoupon(req, res) {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), active: true });
  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found" });
  }
  return res.json(coupon);
}
