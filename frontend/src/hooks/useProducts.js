import { useMemo } from "react";
import { useStore } from "../context/StoreContext";

export function useProducts({ category, sort, minPrice = 0, maxPrice = Infinity } = {}) {
  const { products, search } = useStore();

  return useMemo(() => {
    let filtered = [...products];

    if (category) {
      filtered = filtered.filter((product) => product.category === category);
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    filtered = filtered.filter((product) => product.price >= minPrice && product.price <= maxPrice);

    if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
    if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);

    return filtered;
  }, [products, category, sort, minPrice, maxPrice, search]);
}
