import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, search, setSearch } = useStore();

  const closeMenu = () => setMenuOpen(false);

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
            </div>
          </div>
        </>
      )}

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
