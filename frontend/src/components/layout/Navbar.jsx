import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User2 } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useStore } from "../../context/StoreContext";

export default function Navbar({ onMenuToggle }) {
  const { cartItems, wishlist, darkMode, setDarkMode, search, setSearch, user } = useStore();

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-[#f1eae5]/78 backdrop-blur-xl dark:bg-[#191514]/80">
      <div className="container-shell flex items-center gap-4 py-4">
        <button className="rounded-full p-2 lg:hidden" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="font-display text-3xl font-semibold text-wine dark:text-pearl">
          Celestia
        </Link>
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
        <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
          <label className="glass-panel flex w-full max-w-xs items-center gap-2 px-4 py-2">
            <Search className="h-4 w-4 text-ink/50 dark:text-pearl/50" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search accessories"
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink/40 dark:placeholder:text-pearl/40"
            />
          </label>
          <button onClick={() => setDarkMode(!darkMode)} className="rounded-full p-2">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link to="/wishlist" className="relative rounded-full p-2">
            <Heart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 rounded-full bg-wine px-1.5 text-[10px] text-white">
              {wishlist.length}
            </span>
          </Link>
          <Link to="/profile" className="rounded-full p-2">
            <User2 className="h-5 w-5" />
          </Link>
          <Link to="/cart" className="relative rounded-full p-2">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 rounded-full bg-wine px-1.5 text-[10px] text-white">
              {cartItems.length}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
