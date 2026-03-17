export function calculateTotals(items, coupon = null) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 2500 ? 0 : 149;
  let discount = 0;

  if (coupon && coupon.active && subtotal >= coupon.minimumCartValue) {
    discount =
      coupon.discountType === "percentage"
        ? Math.round((subtotal * coupon.value) / 100)
        : coupon.value;
  }

  return {
    subtotal,
    shippingFee,
    discount,
    totalAmount: subtotal + shippingFee - discount
  };
}
