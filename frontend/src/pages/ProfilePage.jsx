import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import Seo from "../components/common/Seo";
import { useStore } from "../context/StoreContext";
import api from "../utils/api";
import { formatCurrency } from "../utils/format";

export default function ProfilePage() {
  const { user, logout, authLoading } = useStore();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadOrders() {
      try {
        const { data } = await api.get("/orders/mine");
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders", error);
        toast.error(error?.response?.data?.message || "Unable to load orders");
      }
    }

    if (user) {
      loadOrders();
    }
  }, [user]);

  if (!authLoading && !user) return <Navigate to="/auth" replace />;
  if (authLoading) return <section className="container-shell py-10">Loading profile...</section>;

  return (
    <section className="container-shell py-10">
      <Seo title="Profile" description="Manage your profile and review recent orders." path="/profile" noindex />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="glass-panel p-6">
          <h1 className="section-title text-4xl">Profile</h1>
          <p className="mt-4 font-semibold">{user.name}</p>
          <p className="text-sm text-ink/60 dark:text-pearl/60">{user.email}</p>
          <button className="btn-secondary mt-6 w-full" onClick={logout}>
            Logout
          </button>
        </aside>
        <div className="glass-panel p-6">
          <h2 className="text-2xl font-semibold">Order History</h2>
          <div className="mt-5 space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between rounded-3xl border border-white/20 px-4 py-4"
              >
                <div>
                  <p className="font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-ink/60 dark:text-pearl/60">{order.orderStatus}</p>
                </div>
                <span className="font-semibold text-wine dark:text-pearl">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            ))}
            {!orders.length ? <p className="text-sm text-ink/60 dark:text-pearl/60">No orders yet.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
