import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useStore();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onMenuToggle={() => setMenuOpen((open) => !open)} />
      {menuOpen ? (
        <div className="container-shell py-4 lg:hidden">
          <div className="glass-panel flex flex-col gap-3 p-4 text-sm">
            <Link to="/">Home</Link>
            <Link to="/category/Earrings">Shop</Link>
            {user?.role === "admin" ? <Link to="/admin">Admin</Link> : null}
          </div>
        </div>
      ) : null}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
