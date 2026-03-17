import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/format";

const shippingBadges = [
  "🚚 Free Shipping",
  "📦 Delivery in 3–5 days",
  "↩️ Easy Returns"
];

export default function LuxuryCheckoutCard({
  items = [],
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  onSubmit,
  submitting = false
}) {
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const handleSubmit = () => {
    onSubmit?.({ paymentMethod, total, items });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel relative overflow-hidden rounded-[28px] p-4 text-ink shadow-soft sm:p-5"
    >
      <div className="relative">
        <div className="space-y-1">
          <p className="font-display text-[2rem] font-semibold tracking-tight text-wine dark:text-pearl">
            Order Summary
          </p>
          <p className="text-sm text-ink/55 dark:text-pearl/60">
            A refined final review before your order is placed.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div
              key={item.id ?? item._id ?? item.name}
              className="rounded-[20px] border border-wine/10 bg-white/70 p-3 text-sm text-ink/85 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-pearl/90"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-ink dark:text-white">{item.name}</p>
                  <p className="mt-1 text-xs text-ink/55 dark:text-pearl/55">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
                <p className="whitespace-nowrap text-base font-semibold tabular-nums text-ink dark:text-pearl">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 text-sm font-semibold tabular-nums text-ink dark:text-white">
                  <button
                    type="button"
                    onClick={() => onDecreaseQuantity?.(item)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-wine transition hover:bg-black/5 dark:text-pearl dark:hover:bg-white/10"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onIncreaseQuantity?.(item)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-wine transition hover:bg-black/5 dark:text-pearl dark:hover:bg-white/10"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem?.(item)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-wine/75 transition hover:bg-black/5 hover:text-wine dark:text-pearl/70 dark:hover:bg-white/10 dark:hover:text-pearl"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-wine/10 to-transparent dark:via-white/20" />

        <div className="mt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-wine dark:text-pearl">Total</p>
            <p className="mt-1 text-[2.15rem] font-semibold tabular-nums text-wine [font-variant-numeric:lining-nums_tabular-nums] dark:text-pearl">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {shippingBadges.map((badge) => (
            <div
              key={badge}
              className="rounded-full border border-wine/10 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-wine backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-pearl/80"
            >
              {badge}
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-xs uppercase tracking-[0.32em] text-wine dark:text-pearl">Payment Method</p>

          <label className="flex cursor-pointer items-start gap-3 rounded-[20px] border border-wine/10 bg-white/70 p-3 transition duration-300 hover:border-wine/20 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10">
            <input
              type="radio"
              name="payment-method"
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="mt-1 h-4 w-4 border-wine/30 bg-transparent text-gold focus:ring-gold/50"
            />
            <div>
              <p className="font-medium text-wine dark:text-pearl">Razorpay</p>
              <p className="text-sm text-wine/80 dark:text-pearl/80">UPI / Cards / Wallets</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-[20px] border border-wine/10 bg-white/70 p-3 transition duration-300 hover:border-wine/20 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10">
            <input
              type="radio"
              name="payment-method"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="mt-1 h-4 w-4 border-wine/30 bg-transparent text-gold focus:ring-gold/50"
            />
            <div>
              <p className="font-medium text-wine dark:text-pearl">Cash on Delivery</p>
              <p className="text-sm text-wine/80 dark:text-pearl/80">Pay when your package arrives</p>
            </div>
          </label>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary mt-5 w-full rounded-full py-3 text-sm shadow-[0_18px_36px_rgba(107,62,56,0.18)]"
        >
          {submitting
            ? "Processing..."
            : paymentMethod === "razorpay"
              ? `Pay Securely ${formatCurrency(total)}`
              : "Confirm Cash on Delivery"}
        </motion.button>

        <div className="mt-3 text-center font-sans">
          <p className="text-sm font-medium text-wine dark:text-pearl">🔒 100% Secure Payment</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-wine/80 dark:text-pearl/80">256-bit SSL encryption</p>
        </div>
      </div>
    </motion.section>
  );
}
