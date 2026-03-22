import { LogOut, Search, User2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, search, setSearch, logout } = useStore();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onMenuToggle={() => setMenuOpen((open) => !open)} />

      {/* Slide Menu Drawer */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 top-16 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={closeMenu}
          />
          {/* Drawer */}
          <div className="fixed top-16 left-0 right-0 z-50 w-full animate-slide-down bg-[#f1eae5]/95 dark:bg-[#191514]/95 border-b border-white/15 lg:hidden">
            <div className="container-shell flex flex-col gap-4 py-4">
              {/* Search on Mobile */}
              <label className="glass-panel flex w-full items-center gap-2 px-3 py-2">
                <Search className="h-4 w-4 text-ink/50 dark:text-pearl/50" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search accessories"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40 dark:placeholder:text-pearl/40"
                />
              </label>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-2">
                {["Home", "Shop", "Collections", "Gifting", ...(user?.role === "admin" ? ["Admin"] : [])].map((item) => (
                  <Link
                    key={item}
                    to={item === "Admin" ? "/admin" : item === "Shop" ? "/category/Earrings" : item === "Home" ? "/" : "/"}
                    onClick={closeMenu}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-ink/80 dark:text-pearl/80 hover:bg-white/20 dark:hover:bg-white/10 transition"
                  >
                    {item}
                  </Link>
                ))}
              </nav>

              {/* User Profile Section (Mobile) */}
              <div className="border-t border-white/20 pt-4 mt-2">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <div className="px-4 py-2 text-sm">
                      <p className="font-semibold text-ink dark:text-pearl">{user.name}</p>
                      <p className="text-xs text-ink/60 dark:text-pearl/60">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-ink/80 dark:text-pearl/80 hover:bg-white/20 dark:hover:bg-white/10 transition"
                    >
                      <User2 className="h-4 w-4" />
                      View Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-wine dark:text-rose-400 hover:bg-wine/10 dark:hover:bg-rose-400/10 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={closeMenu}
                    className="block rounded-lg px-4 py-2 text-sm font-medium bg-wine text-white hover:bg-clay transition text-center"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
