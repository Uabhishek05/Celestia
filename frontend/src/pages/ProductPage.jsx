import { Heart, ShoppingBag, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import Seo from "../components/common/Seo";
import { useStore } from "../context/StoreContext";
import { formatCurrency } from "../utils/format";
import { toAbsoluteUrl } from "../utils/siteMetadata";

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist } = useStore();
  const [activeImage, setActiveImage] = useState(0);

  const product = useMemo(
    () => products.find((item) => item._id === productId || item.slug === productId),
    [products, productId]
  );
  const related = useMemo(
    () => products.filter((item) => item.category === product?.category && item._id !== product?._id).slice(0, 3),
    [products, product]
  );

  if (!product) {
    return <div className="container-shell py-20">Product not found.</div>;
  }

  return (
    <section className="container-shell py-10">
      <Seo
        title={product.name}
        description={product.description}
        path={`/product/${product.slug || product._id}`}
        type="product"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          category: product.category,
          image: product.images?.map((image) => toAbsoluteUrl(image)),
          sku: product._id,
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: product.price,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: toAbsoluteUrl(`/product/${product.slug || product._id}`)
          },
          aggregateRating: product.rating
            ? {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.reviews || 1
              }
            : undefined
        }}
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <div className="glass-panel overflow-hidden p-3">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="h-[520px] w-full rounded-[24px] object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {product.images.map((image, index) => (
              <button key={image} className="glass-panel overflow-hidden p-2" onClick={() => setActiveImage(index)}>
                <img src={image} alt="" className="h-28 w-full rounded-2xl object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="glass-panel h-fit p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-clay">{product.category}</p>
          <h1 className="mt-2 font-display text-5xl text-wine dark:text-pearl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold text-wine dark:text-pearl">
              {formatCurrency(product.price)}
            </span>
            <span className="text-ink/40 line-through dark:text-pearl/40">
              {formatCurrency(product.originalPrice)}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-ink/70 dark:text-pearl/70">
            <Star className="h-4 w-4 fill-gold text-gold" />
            {product.rating} rating · {product.reviews} reviews · {product.stock} in stock
          </div>
          <p className="mt-6 leading-7 text-ink/75 dark:text-pearl/75">{product.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => addToCart(product)} className="btn-primary">
              <ShoppingBag className="mr-2 h-4 w-4" /> Add to cart
            </button>
            <button
              onClick={() => {
                addToCart(product);
                navigate("/checkout");
              }}
              className="btn-secondary"
            >
              Buy now
            </button>
            <button onClick={() => toggleWishlist(product)} className="btn-secondary">
              <Heart className="mr-2 h-4 w-4" /> Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="section-title">Related Products</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
