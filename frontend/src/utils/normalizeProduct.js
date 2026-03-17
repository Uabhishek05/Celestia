export function normalizeProduct(product) {
  return {
    ...product,
    _id: product._id || product.id,
    id: product._id || product.id,
    badge: product.badge || (product.featured ? "Featured" : "Curated"),
    reviews: product.reviews ?? 0,
    images: Array.isArray(product.images)
      ? product.images.map((image) => (typeof image === "string" ? image : image?.url)).filter(Boolean)
      : []
  };
}
