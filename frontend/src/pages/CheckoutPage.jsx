import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Seo from "../components/common/Seo";
import LuxuryCheckoutCard from "../components/checkout/LuxuryCheckoutCard";
import { useStore } from "../context/StoreContext";
import api from "../utils/api";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const sampleItems = [
  { id: "aurora-pearl-earrings", name: "Aurora Pearl Earrings", quantity: 1, price: 1599 },
  { id: "blush-charm-bracelet", name: "Blush Charm Bracelet", quantity: 1, price: 1299 }
];

export default function CheckoutPage() {
  const { cartItems, updateQuantity, removeFromCart, user, clearCart } = useStore();
  const [previewItems, setPreviewItems] = useState(sampleItems);
  const [submitting, setSubmitting] = useState(false);
  const hasCartItems = cartItems.length > 0;
  const navigate = useNavigate();

  const checkoutItems = hasCartItems
    ? cartItems.map((item) => ({
        id: item._id,
        _id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    : previewItems;

  const handleIncreaseQuantity = (item) => {
    if (item._id) {
      updateQuantity(item._id, item.quantity + 1);
      return;
    }

    setPreviewItems((current) =>
      current.map((previewItem) =>
        previewItem.id === item.id
          ? { ...previewItem, quantity: previewItem.quantity + 1 }
          : previewItem
      )
    );
  };

  const handleDecreaseQuantity = (item) => {
    if (item._id) {
      if (item.quantity <= 1) {
        removeFromCart(item._id);
        return;
      }

      updateQuantity(item._id, item.quantity - 1);
      return;
    }

    setPreviewItems((current) =>
      current.flatMap((previewItem) => {
        if (previewItem.id !== item.id) return [previewItem];
        if (previewItem.quantity <= 1) return [];
        return [{ ...previewItem, quantity: previewItem.quantity - 1 }];
      })
    );
  };

  const handleRemoveItem = (item) => {
    if (item._id) {
      removeFromCart(item._id);
      return;
    }

    setPreviewItems((current) => current.filter((previewItem) => previewItem.id !== item.id));
  };

  const handleCheckoutSubmit = async ({ paymentMethod, items }) => {
    if (!user) {
      toast.error("Please log in before placing an order");
      navigate("/auth");
      return;
    }

    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!hasCartItems) {
      toast.error("Add real products to cart before checkout");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        items: items.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images?.[0] || ""
        })),
        shippingAddress: {
          name: user.name,
          email: user.email,
          address: "Address to be collected",
          city: "Pending",
          postalCode: "000000"
        },
        paymentMethod
      };

      if (paymentMethod === "razorpay") {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error("Razorpay SDK failed to load");
        }

        const { data } = await api.post("/orders/razorpay-order", payload);
        const razorpay = new window.Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Celestia",
          description: "Premium accessories checkout",
          order_id: data.razorpayOrderId,
          handler: async (response) => {
            try {
              await api.post("/orders/razorpay-verify", {
                orderId: data.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
              await clearCart();
              toast.success("Payment successful");
              navigate("/profile");
            } catch (error) {
              console.error("Razorpay verification failed", error);
              toast.error(error?.response?.data?.message || "Unable to verify Razorpay payment");
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: user.name,
            email: user.email
          },
          theme: {
            color: "#6b3e38"
          },
          modal: {
            ondismiss: () => setSubmitting(false)
          }
        });
        razorpay.open();
        return;
      }

      await api.post("/orders", payload);
      await clearCart();
      toast.success("Order placed successfully");
      navigate("/profile");
    } catch (error) {
      console.error("Failed to create order", error);
      toast.error(error?.response?.data?.message || "Unable to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-shell py-10">
      <Seo title="Checkout" description="Premium checkout for curated jewelry and accessories." />

      <div className="grid items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="glass-panel max-w-xl space-y-5 p-8">
          <span className="inline-flex rounded-full border border-wine/20 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.34em] text-clay backdrop-blur dark:border-white/15 dark:bg-white/5 dark:text-pearl/70">
            Secure Checkout
          </span>
          <div className="space-y-3">
            <h1 className="font-display text-4xl font-semibold leading-[0.95] text-wine dark:text-pearl sm:text-5xl">
              A minimal checkout with a luxury finish.
            </h1>
            <p className="max-w-lg text-base leading-7 text-ink/70 dark:text-pearl/70">
              Crafted for premium accessories, with warm glassmorphism surfaces, elegant contrast,
              and a payment flow ready for Razorpay or cash on delivery.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass-panel rounded-[24px] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-ink/45 dark:text-pearl/45">Curated</p>
              <p className="mt-3 font-display text-3xl text-gold [font-variant-numeric:lining-nums_tabular-nums]">02</p>
              <p className="mt-2 text-sm text-ink/65 dark:text-pearl/65">Signature pieces in this order preview.</p>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-ink/45 dark:text-pearl/45">Promise</p>
              <p className="mt-3 font-display text-3xl text-gold [font-variant-numeric:lining-nums_tabular-nums]">3-5</p>
              <p className="mt-2 text-sm text-ink/65 dark:text-pearl/65">Days for delivery with protected packaging.</p>
            </div>
          </div>
        </div>

        <LuxuryCheckoutCard
          items={checkoutItems}
          onIncreaseQuantity={handleIncreaseQuantity}
          onDecreaseQuantity={handleDecreaseQuantity}
          onRemoveItem={handleRemoveItem}
          onSubmit={handleCheckoutSubmit}
          submitting={submitting}
        />
      </div>
    </section>
  );
}
