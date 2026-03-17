import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "../components/common/Seo";
import { useStore } from "../context/StoreContext";
import { formatCurrency } from "../utils/format";

export default function CartPage() {
  const { cartItems, cartTotals, updateQuantity, removeFromCart } = useStore();

  return (
    <section className="container-shell py-10">
      <Seo title="Cart" description="Review your shopping cart and continue to secure checkout." />
      <h1 className="section-title">Your Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {cartItems.length ? (
            cartItems.map((item) => (
              <div key={item._id} className="glass-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <img src={item.images[0]} alt={item.name} className="h-28 w-28 rounded-3xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-ink/60 dark:text-pearl/60">{item.category}</p>
                  <p className="mt-2 font-semibold text-wine dark:text-pearl">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="rounded-full p-2" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span>{item.quantity}</span>
                  <button className="rounded-full p-2" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </button>
                  <button className="rounded-full p-2 text-red-500" onClick={() => removeFromCart(item._id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel p-8">
              <p>Your cart is empty.</p>
            </div>
          )}
        </div>
        <aside className="glass-panel h-fit p-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{cartTotals.shipping ? formatCurrency(cartTotals.shipping) : "Free"}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{formatCurrency(cartTotals.discount)}</span>
            </div>
            <div className="flex justify-between border-t border-white/20 pt-3 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(cartTotals.total)}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary mt-6 w-full">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
