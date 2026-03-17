export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

export const calculateCartTotals = (cartItems) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 2500 ? 0 : cartItems.length ? 149 : 0;
  const discount = subtotal > 5000 ? Math.round(subtotal * 0.1) : 0;
  return {
    subtotal,
    shipping,
    discount,
    total: subtotal + shipping - discount
  };
};
