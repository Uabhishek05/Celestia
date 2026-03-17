import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { formatCurrency } from "../../utils/format";

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const liked = wishlist.some((item) => item._id === product._id);

  return (
    <div className="glass-panel group overflow-hidden">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-wine"
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        </button>
        <span className="absolute left-4 top-4 rounded-full bg-wine px-3 py-1 text-xs font-semibold text-white">
          {product.badge}
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-clay">{product.category}</p>
            <Link to={`/product/${product.slug || product._id}`} className="mt-1 block font-semibold text-ink dark:text-pearl">
              {product.name}
            </Link>
          </div>
          <div className="flex items-center gap-1 text-xs text-ink/60 dark:text-pearl/60">
            <Star className="h-4 w-4 fill-gold text-gold" />
            {product.rating}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-wine dark:text-pearl">{formatCurrency(product.price)}</span>
          <span className="text-sm text-ink/40 line-through dark:text-pearl/40">
            {formatCurrency(product.originalPrice)}
          </span>
        </div>
        <button onClick={() => addToCart(product)} className="btn-secondary w-full">
          <ShoppingBag className="mr-2 h-4 w-4" /> Quick add
        </button>
      </div>
    </div>
  );
}
