import { Link } from "react-router-dom";
import Seo from "../components/common/Seo";

export default function OrderConfirmationPage() {
  return (
    <section className="container-shell py-20">
      <Seo title="Order Confirmed" description="Your order has been placed successfully." />
      <div className="mx-auto max-w-2xl glass-panel p-10 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-clay">Order confirmed</p>
        <h1 className="section-title mt-3">Your Celestia order is placed.</h1>
        <p className="mt-4 text-ink/70 dark:text-pearl/70">
          You’ll receive confirmation, shipping, and delivery updates by email.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="btn-primary">
            Continue shopping
          </Link>
          <Link to="/profile" className="btn-secondary">
            View orders
          </Link>
        </div>
      </div>
    </section>
  );
}
