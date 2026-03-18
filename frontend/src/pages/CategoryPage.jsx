import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import Seo from "../components/common/Seo";
import { useProducts } from "../hooks/useProducts";
import { toAbsoluteUrl } from "../utils/siteMetadata";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const category = decodeURIComponent(categoryName);
  const [sort, setSort] = useState("rating");
  const [priceRange, setPriceRange] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const bounds = useMemo(() => {
    if (priceRange === "low") return { minPrice: 0, maxPrice: 1000 };
    if (priceRange === "mid") return { minPrice: 1001, maxPrice: 2500 };
    if (priceRange === "high") return { minPrice: 2501, maxPrice: Infinity };
    return { minPrice: 0, maxPrice: Infinity };
  }, [priceRange]);

  const products = useProducts({ category, sort, ...bounds });
  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
  const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [category, sort, priceRange]);

  return (
    <section className="container-shell py-10">
      <Seo
        title={category}
        description={`Shop ${category} with premium finishes and curated styling.`}
        path={`/category/${encodeURIComponent(category)}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${category} | Celestia Premium`,
          url: toAbsoluteUrl(`/category/${encodeURIComponent(category)}`),
          description: `Shop ${category} with premium finishes and curated styling.`
        }}
      />
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-clay">Category edit</p>
          <h1 className="section-title mt-2">{category}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="glass-panel px-4 py-3 text-sm outline-none"
          >
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
          <select
            value={priceRange}
            onChange={(event) => setPriceRange(event.target.value)}
            className="glass-panel px-4 py-3 text-sm outline-none"
          >
            <option value="all">All prices</option>
            <option value="low">Under Rs. 1000</option>
            <option value="mid">Rs. 1000 - 2500</option>
            <option value="high">Above Rs. 2500</option>
          </select>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {paginatedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        {Array.from({ length: pageCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => setPage(index + 1)}
            className={index + 1 === page ? "btn-primary" : "btn-secondary"}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  );
}
