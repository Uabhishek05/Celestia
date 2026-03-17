import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { categories, products as seedProducts } from "../data/products";
import api from "../utils/api";
import { calculateCartTotals } from "../utils/format";
import { normalizeProduct } from "../utils/normalizeProduct";

const StoreContext = createContext(null);

const readLocal = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() => seedProducts.map(normalizeProduct));
  const [cartItems, setCartItems] = useState(() => readLocal("celestia-cart", []));
  const [wishlist, setWishlist] = useState(() => readLocal("celestia-wishlist", []));
  const [user, setUser] = useState(() => readLocal("celestia-user", null));
  const [token, setToken] = useState(() => localStorage.getItem("celestia-token") || "");
  const [darkMode, setDarkMode] = useState(() => readLocal("celestia-dark", false));
  const [search, setSearch] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem("celestia-token")));

  const applyServerUserState = (serverUser) => {
    setUser(serverUser);
    setWishlist(serverUser?.wishlist || []);
    setCartItems(serverUser?.cart || []);
  };

  useEffect(() => {
    localStorage.setItem("celestia-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("celestia-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("celestia-user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("celestia-token", token);
    } else {
      localStorage.removeItem("celestia-token");
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem("celestia-dark", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        const { data } = await api.get("/products", { params: { limit: 100 } });
        if (!ignore && Array.isArray(data.products) && data.products.length) {
          setProducts(data.products.map(normalizeProduct));
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to load products", error);
        }
      } finally {
        if (!ignore) {
          setProductsLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function hydrateUser() {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const hasGuestState = cartItems.length > 0 || wishlist.length > 0;
        const { data } = hasGuestState
          ? await api.post("/auth/sync-store", {
              cartItems: cartItems.map((item) => ({ productId: item._id, quantity: item.quantity })),
              wishlistIds: wishlist.map((item) => item._id)
            })
          : await api.get("/auth/profile");
        if (!ignore) {
          applyServerUserState(data);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to load profile", error);
          applyServerUserState(null);
          setToken("");
        }
      } finally {
        if (!ignore) {
          setAuthLoading(false);
        }
      }
    }

    hydrateUser();
    return () => {
      ignore = true;
    };
  }, [token]);

  const addToCart = (product, quantity = 1) => {
    const normalizedProduct = normalizeProduct(product);
    setCartItems((current) => {
      const existing = current.find((item) => item._id === normalizedProduct._id);
      if (existing) {
        return current.map((item) =>
          item._id === normalizedProduct._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { ...normalizedProduct, quantity }];
    });
    toast.success(`${normalizedProduct.name} added to cart`);

    if (token && normalizedProduct._id) {
      api
        .put("/auth/cart/item", { productId: normalizedProduct._id, quantity: quantity + (cartItems.find((item) => item._id === normalizedProduct._id)?.quantity || 0) })
        .then(({ data }) => applyServerUserState(data))
        .catch((error) => console.error("Failed to persist cart item", error));
    }
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((current) =>
      current.map((item) =>
        item._id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );

    if (token) {
      api
        .put("/auth/cart/item", { productId, quantity: Math.max(1, quantity) })
        .then(({ data }) => applyServerUserState(data))
        .catch((error) => console.error("Failed to update cart item", error));
    }
  };

  const removeFromCart = (productId) => {
    setCartItems((current) => current.filter((item) => item._id !== productId));
    toast.success("Item removed from cart");

    if (token) {
      api
        .delete(`/auth/cart/item/${productId}`)
        .then(({ data }) => applyServerUserState(data))
        .catch((error) => console.error("Failed to remove cart item", error));
    }
  };

  const toggleWishlist = (product) => {
    const normalizedProduct = normalizeProduct(product);
    setWishlist((current) => {
      const exists = current.some((item) => item._id === normalizedProduct._id);
      toast.success(exists ? "Removed from wishlist" : "Added to wishlist");
      return exists
        ? current.filter((item) => item._id !== normalizedProduct._id)
        : [...current, normalizedProduct];
    });

    if (token && normalizedProduct._id) {
      api
        .post("/auth/wishlist/toggle", { productId: normalizedProduct._id })
        .then(({ data }) => applyServerUserState(data))
        .catch((error) => console.error("Failed to persist wishlist", error));
    }
  };

  const authenticate = ({ user: nextUser, token: nextToken }) => {
    applyServerUserState(nextUser);
    setToken(nextToken);
  };

  const logout = () => {
    applyServerUserState(null);
    setToken("");
  };

  const clearCart = () => {
    setCartItems([]);

    if (token) {
      return api
        .delete("/auth/cart")
        .then(({ data }) => applyServerUserState(data))
        .catch((error) => console.error("Failed to clear cart", error));
    }

    return Promise.resolve();
  };

  const value = useMemo(
    () => ({
      products,
      categories,
      cartItems,
      wishlist,
      user,
      token,
      darkMode,
      search,
      productsLoading,
      authLoading,
      setSearch,
      setUser,
      setToken,
      setDarkMode,
      addToCart,
      updateQuantity,
      removeFromCart,
      toggleWishlist,
      authenticate,
      logout,
      clearCart,
      cartTotals: calculateCartTotals(cartItems)
    }),
    [products, cartItems, wishlist, user, token, darkMode, search, productsLoading, authLoading]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
