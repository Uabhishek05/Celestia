import { BarChart3, Minus, Package, Percent, Plus, ShieldCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import Seo from "../components/common/Seo";
import { useStore } from "../context/StoreContext";
import api from "../utils/api";
import { formatCurrency } from "../utils/format";
import { normalizeProduct } from "../utils/normalizeProduct";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  stock: "0",
  description: "",
  images: []
};

function buildAnalytics(dashboard) {
  const totals = [
    { label: "Users", value: dashboard?.totalUsers ?? 0 },
    { label: "Orders", value: dashboard?.totalOrders ?? 0 },
    { label: "Products", value: dashboard?.totalProducts ?? 0 },
    { label: "Revenue", value: Math.max(1, Math.round((dashboard?.totalRevenue ?? 0) / 1000)) }
  ];
  const maxValue = Math.max(...totals.map((item) => item.value), 1);

  return totals.map((item, index) => {
    const height = Math.max(28, Math.round((item.value / maxValue) * 100));
    return {
      id: `${index}-${item.label}-${item.value}`,
      label: item.label,
      value: item.value,
      height
    };
  });
}

async function filesToDataUrls(fileList) {
  const files = Array.from(fileList || []);
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              url: String(reader.result || "")
            });
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        })
    )
  );
}

export default function AdminPage() {
  const { user } = useStore();
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");
  const [busyOrderId, setBusyOrderId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  async function loadAdminData() {
    const [{ data: dashboardData }, { data: usersData }, { data: productsData }, { data: ordersData }, { data: categoriesData }] = await Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/users"),
      api.get("/admin/products"),
      api.get("/orders"),
      api.get("/admin/categories")
    ]);

    setDashboard(dashboardData);
    setUsers(usersData);
    setProducts(productsData.map(normalizeProduct));
    setOrders(ordersData);
    setCategories(categoriesData);
    setForm((current) => ({
      ...current,
      category:
        current.category ||
        categoriesData[0]?.name ||
        "Accessories"
    }));
  }

  useEffect(() => {
    async function run() {
      try {
        await loadAdminData();
      } catch (error) {
        console.error("Failed to load admin data", error);
        toast.error(error?.response?.data?.message || "Unable to load admin dashboard");
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === "admin") {
      run();
    } else {
      setLoading(false);
    }
  }, [user]);

  const analyticsBars = useMemo(() => buildAnalytics(dashboard), [dashboard]);

  if (loading) {
    return <section className="container-shell py-10">Loading admin dashboard...</section>;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/auth" replace />;
  }

  const summary = [
    { label: "Total Users", value: dashboard?.totalUsers ?? 0, icon: Users },
    { label: "Total Orders", value: dashboard?.totalOrders ?? 0, icon: Package },
    { label: "Revenue", value: formatCurrency(dashboard?.totalRevenue ?? 0), icon: BarChart3 },
    { label: "Products", value: dashboard?.totalProducts ?? 0, icon: Percent }
  ];

  const recentOrders = dashboard?.recentOrders ?? [];

  const updateFormValue = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const adjustNumericField = (key, delta, minimum = 0) => {
    setForm((current) => {
      const currentValue = Number(current[key]) || 0;
      const nextValue = Math.max(minimum, currentValue + delta);
      return {
        ...current,
        [key]: String(nextValue)
      };
    });
  };

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    if (files.some((file) => !file.type.startsWith("image/"))) {
      toast.error("Only image files are supported.");
      return;
    }

    if (form.images.length + files.length > 3) {
      toast.error("You can upload between 1 and 3 images per product.");
      return;
    }

    try {
      const nextImages = await filesToDataUrls(files);
      setForm((current) => ({
        ...current,
        images: [...current.images, ...nextImages]
      }));
    } catch (error) {
      toast.error(error.message || "Unable to load image preview");
    }
  };

  const removeImage = (name) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((image) => image.name !== name)
    }));
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.description.trim() || !form.price) {
      toast.error("Product name, price, and description are required.");
      return;
    }

    if (form.images.length < 1 || form.images.length > 3) {
      toast.error("Add between 1 and 3 product images.");
      return;
    }

    setSavingProduct(true);

    try {
      await api.post("/admin/products", {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        description: form.description.trim(),
        images: form.images.map((image) => image.url)
      });

      toast.success("Product added successfully");
      setForm(emptyForm);
      setShowAddForm(false);
      await loadAdminData();
    } catch (error) {
      console.error("Failed to add product", error);
      toast.error(error?.response?.data?.message || "Unable to add product");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    if (!newCategory.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setSavingCategory(true);

    try {
      const { data } = await api.post("/admin/categories", {
        name: newCategory.name.trim(),
        description: newCategory.description.trim()
      });
      setCategories((current) => [...current, data].sort((a, b) => a.sortOrder - b.sortOrder));
      setForm((current) => ({ ...current, category: data.name }));
      setNewCategory({ name: "", description: "" });
      setShowCategoryForm(false);
      toast.success("Category created");
    } catch (error) {
      console.error("Failed to create category", error);
      toast.error(error?.response?.data?.message || "Unable to create category");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleToggleUserBlock = async (member) => {
    setBusyUserId(member._id);

    try {
      const { data } = await api.patch(`/admin/users/${member._id}/block`);
      setUsers((current) =>
        current.map((entry) => (entry._id === data._id ? { ...entry, isBlocked: data.isBlocked } : entry))
      );
      toast.success(data.isBlocked ? "User blocked" : "User unblocked");
    } catch (error) {
      console.error("Failed to update user", error);
      toast.error(error?.response?.data?.message || "Unable to update user");
    } finally {
      setBusyUserId("");
    }
  };

  const handleOrderUpdate = async (orderId, updates) => {
    const existingOrder = orders.find((order) => order._id === orderId);
    if (!existingOrder) {
      return;
    }

    setBusyOrderId(orderId);

    try {
      const { data } = await api.patch(`/orders/${orderId}/status`, {
        orderStatus: updates.orderStatus ?? existingOrder.orderStatus,
        paymentStatus: updates.paymentStatus ?? existingOrder.paymentStatus
      });

      setOrders((current) => current.map((order) => (order._id === data._id ? data : order)));
      setDashboard((current) =>
        current
          ? {
              ...current,
              recentOrders: current.recentOrders.map((order) => (order._id === data._id ? data : order))
            }
          : current
      );
      toast.success("Order status updated");
    } catch (error) {
      console.error("Failed to update order", error);
      toast.error(error?.response?.data?.message || "Unable to update order");
    } finally {
      setBusyOrderId("");
    }
  };

  return (
    <section className="container-shell py-10">
      <Seo title="Admin Dashboard" description="Manage products, orders, analytics, and users." />
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-clay">Admin panel</p>
          <h1 className="section-title mt-2">Store Command Center</h1>
        </div>
        <button className="btn-primary">
          <ShieldCheck className="mr-2 h-4 w-4" /> Admin authenticated
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="glass-panel p-5">
              <Icon className="h-6 w-6 text-clay" />
              <p className="mt-5 text-sm text-ink/60 dark:text-pearl/60">{item.label}</p>
              <p className="font-display text-4xl text-wine dark:text-pearl">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="glass-panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <button type="button" className="btn-secondary" onClick={() => void loadAdminData()}>
                Refresh
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between rounded-3xl border border-white/20 px-4 py-4">
                  <div>
                    <p className="font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-ink/60 dark:text-pearl/60">{order.orderStatus}</p>
                  </div>
                  <div className="text-right">
                    <p>{formatCurrency(order.totalAmount)}</p>
                    <p className="text-sm text-clay">{order.paymentStatus}</p>
                  </div>
                </div>
              ))}
              {!recentOrders.length ? <p className="text-sm text-ink/60 dark:text-pearl/60">No recent orders.</p> : null}
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Analytics</h2>
              <span className="text-sm text-ink/50 dark:text-pearl/50">Based on live totals</span>
            </div>
            <div className="grid h-64 grid-cols-4 items-end gap-4">
              {analyticsBars.map((bar) => (
                <div key={bar.id} className="flex h-full flex-col items-center justify-end gap-3">
                  <div
                    className="w-full rounded-t-[32px] bg-gradient-to-t from-wine to-rosewater"
                    style={{ height: `${bar.height}%` }}
                    title={`${bar.label}: ${bar.value}`}
                  />
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{bar.label}</p>
                    <p className="text-xs text-ink/55 dark:text-pearl/60">{bar.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Product Management</h2>
              <button type="button" className="btn-primary" onClick={() => setShowAddForm((current) => !current)}>
                <Plus className="mr-2 h-4 w-4" />
                {showAddForm ? "Close form" : "Add product"}
              </button>
            </div>

            {showAddForm ? (
              <form onSubmit={handleProductSubmit} className="mb-6 space-y-4 rounded-[28px] border border-white/15 bg-white/5 p-4">
                <input
                  value={form.name}
                  onChange={(event) => updateFormValue("name", event.target.value)}
                  className="theme-field"
                  placeholder="Product name"
                  required
                />
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <select
                      value={form.category}
                      onChange={(event) => updateFormValue("category", event.target.value)}
                      className="theme-select"
                    >
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="text-xs font-semibold text-clay hover:text-wine dark:hover:text-pearl"
                      onClick={() => setShowCategoryForm((current) => !current)}
                    >
                      {showCategoryForm ? "Close category form" : "+ Create category"}
                    </button>
                  </div>
                  <div className="theme-stepper">
                    <button type="button" className="theme-stepper-button" onClick={() => adjustNumericField("price", -100, 0)}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={form.price}
                      onChange={(event) => updateFormValue("price", event.target.value)}
                      className="theme-stepper-value bg-transparent outline-none"
                      placeholder="Price"
                      required
                    />
                    <button type="button" className="theme-stepper-button" onClick={() => adjustNumericField("price", 100, 0)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="theme-stepper">
                    <button type="button" className="theme-stepper-button" onClick={() => adjustNumericField("stock", -1, 0)}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(event) => updateFormValue("stock", event.target.value)}
                      className="theme-stepper-value bg-transparent outline-none"
                      placeholder="Stock"
                    />
                    <button type="button" className="theme-stepper-button" onClick={() => adjustNumericField("stock", 1, 0)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {showCategoryForm ? (
                  <div className="rounded-[24px] border border-white/15 bg-white/5 p-4">
                    <p className="mb-3 text-sm font-semibold text-wine dark:text-pearl">Create new category</p>
                    <div className="space-y-3">
                      <input
                        value={newCategory.name}
                        onChange={(event) =>
                          setNewCategory((current) => ({ ...current, name: event.target.value }))
                        }
                        className="theme-field"
                        placeholder="Category name"
                      />
                      <textarea
                        value={newCategory.description}
                        onChange={(event) =>
                          setNewCategory((current) => ({ ...current, description: event.target.value }))
                        }
                        className="theme-field min-h-24"
                        placeholder="Short category description"
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCategorySubmit}
                        disabled={savingCategory}
                      >
                        {savingCategory ? "Creating..." : "Create category"}
                      </button>
                    </div>
                  </div>
                ) : null}
                <textarea
                  value={form.description}
                  onChange={(event) => updateFormValue("description", event.target.value)}
                  className="theme-field min-h-32"
                  placeholder="Product description"
                  required
                />

                <div className="rounded-[24px] border border-dashed border-white/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">Upload product images</p>
                      <p className="text-sm text-ink/60 dark:text-pearl/60">
                        Select 1 to 3 images from your system. All image formats supported by the browser are allowed.
                      </p>
                    </div>
                    <label className="btn-secondary cursor-pointer">
                      Choose files
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>

                  {form.images.length ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {form.images.map((image) => (
                        <div key={image.name} className="rounded-[24px] border border-white/20 p-3">
                          <img src={image.url} alt={image.name} className="h-32 w-full rounded-[18px] object-cover" />
                          <p className="mt-2 truncate text-xs text-ink/65 dark:text-pearl/65">{image.name}</p>
                          <button
                            type="button"
                            onClick={() => removeImage(image.name)}
                            className="mt-2 text-xs text-clay hover:text-wine dark:hover:text-pearl"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <button type="submit" className="btn-primary w-full" disabled={savingProduct}>
                  {savingProduct ? "Adding product..." : "Add product"}
                </button>
              </form>
            ) : null}

            <div className="space-y-4">
              {products.slice(0, 6).map((product) => (
                <div key={product._id} className="rounded-3xl border border-white/20 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-ink/60 dark:text-pearl/60">{product.category}</p>
                    </div>
                    <p className="text-sm text-clay">{formatCurrency(product.price)}</p>
                  </div>
                  <p className="mt-2 text-sm text-clay">Stock: {product.stock} | Images: {product.images.length}</p>
                </div>
              ))}
              {!products.length ? <p className="text-sm text-ink/60 dark:text-pearl/60">No products yet.</p> : null}
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Orders</h2>
              <span className="text-sm text-ink/50 dark:text-pearl/50">Live COD and online orders</span>
            </div>
            <div className="space-y-4">
              {orders.slice(0, 6).map((order) => (
                <div key={order._id} className="rounded-3xl border border-white/20 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-ink/60 dark:text-pearl/60">
                        {order.user?.name || "Guest"} · {order.paymentMethod?.toUpperCase()}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-wine dark:text-pearl">{formatCurrency(order.totalAmount)}</p>
                  </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="grid flex-1 gap-3 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-clay">Payment Status</p>
                        <select
                          value={order.paymentStatus}
                          disabled={busyOrderId === order._id}
                          onChange={(event) =>
                            void handleOrderUpdate(order._id, { paymentStatus: event.target.value })
                          }
                          className="theme-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-clay">Order Status</p>
                        <select
                          value={order.orderStatus}
                          disabled={busyOrderId === order._id}
                          onChange={(event) =>
                            void handleOrderUpdate(order._id, { orderStatus: event.target.value })
                          }
                          className="theme-select"
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!orders.length ? <p className="text-sm text-ink/60 dark:text-pearl/60">No orders yet.</p> : null}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold">Users</h2>
            <div className="mt-5 space-y-4 text-sm">
              {users.slice(0, 6).map((member) => (
                <div key={member._id} className="rounded-3xl border border-white/20 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-ink/60 dark:text-pearl/60">{member.email}</p>
                      <p className="mt-1 text-sm text-clay">{member.isBlocked ? "Blocked" : member.role}</p>
                    </div>
                    {member.role !== "admin" ? (
                      <button
                        type="button"
                        onClick={() => void handleToggleUserBlock(member)}
                        disabled={busyUserId === member._id}
                        className="btn-secondary min-w-28"
                      >
                        {busyUserId === member._id ? "Saving..." : member.isBlocked ? "Unblock" : "Block"}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
