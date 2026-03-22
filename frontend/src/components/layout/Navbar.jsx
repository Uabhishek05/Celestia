import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User2 } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useStore } from "../../context/StoreContext";

export default function Navbar({ onMenuToggle }) {
  const { cartItems, wishlist, darkMode, setDarkMode, search, setSearch, user } = useStore();

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-[#f1eae5]/78 backdrop-blur-xl dark:bg-[#191514]/80">
      <div className="container-shell flex items-center gap-2 py-3 sm:gap-4 sm:py-4">
        {/* Menu Button (Mobile) */}
        <button className="rounded-full p-2 lg:hidden" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link to="/" className="font-display text-2xl sm:text-3xl font-semibold text-wine dark:text-pearl whitespace-nowrap">
          Celestia
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {["Shop", "Collections", "Gifting", ...(user?.role === "admin" ? ["Admin"] : [])].map((item) => (
            <NavLink
              key={item}
              to={item === "Admin" ? "/admin" : item === "Shop" ? "/category/Earrings" : "/"}
              className="text-sm font-medium text-ink/70 transition hover:text-wine dark:text-pearl/70 dark:hover:text-white"
            >
              {item}
            </NavLink>
          ))}
        </nav>

        {/* Search (Desktop Only) */}
        <div className="hidden flex-1 items-center justify-center md:flex px-4">
          <label className="glass-panel flex w-full max-w-sm items-center gap-2 px-3 py-2">
            <Search className="h-4 w-4 text-ink/50 dark:text-pearl/50" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search accessories"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40 dark:placeholder:text-pearl/40"
            />
          </label>
        </div>

        {/* Mobile + Desktop Actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          {/* Dark Mode Toggle */}
          <button onClick={() => setDarkMode(!darkMode)} className="rounded-full p-1.5 sm:p-2 hover:bg-white/10 transition">
            {darkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>

          {/* Wishlist (Mobile) */}
          <Link to="/wishlist" className="relative rounded-full p-1.5 sm:p-2 lg:hidden hover:bg-white/10 transition">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 rounded-full bg-wine px-1 text-[8px] sm:text-[10px] text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* User Profile (Desktop) */}
          <Link to="/profile" className="hidden sm:block rounded-full p-2 hover:bg-white/10 transition">
            <User2 className="h-5 w-5" />
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative rounded-full p-1.5 sm:p-2 hover:bg-white/10 transition">
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            {cartItems.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 rounded-full bg-wine px-1 text-[8px] sm:text-[10px] text-white">
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
