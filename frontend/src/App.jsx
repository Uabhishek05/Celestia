import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Loader from "./components/common/Loader";
import Layout from "./components/layout/Layout";

const AdminPage = lazy(() => import("./pages/AdminPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const FooterInfoPage = lazy(() => import("./pages/FooterInfoPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<Loader cards={4} compact />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/footer-info" element={<FooterInfoPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage initialMode="signup" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
