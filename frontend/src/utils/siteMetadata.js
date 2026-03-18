export const siteName = "Celestia Premium";
export const siteUrl = (import.meta.env.VITE_SITE_URL || "http://localhost:5173").replace(/\/$/, "");
export const defaultDescription =
  "Shop premium accessories, gifting collections, and curated everyday luxury from Celestia.";

export function toAbsoluteUrl(path = "/") {
  if (!path) return siteUrl;
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
