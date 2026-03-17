import ProductCard from "../components/product/ProductCard";
import Seo from "../components/common/Seo";
import { useStore } from "../context/StoreContext";

export default function WishlistPage() {
  const { wishlist } = useStore();

  return (
    <section className="container-shell py-10">
      <Seo title="Wishlist" description="Save premium accessories for later." />
      <h1 className="section-title">Wishlist</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {wishlist.length ? wishlist.map((product) => <ProductCard key={product._id} product={product} />) : <div className="glass-panel p-6">Your wishlist is empty.</div>}
      </div>
    </section>
  );
}
