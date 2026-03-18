import Hero from "../components/home/Hero";
import HomeSections from "../components/home/HomeSections";
import Seo from "../components/common/Seo";
import { toAbsoluteUrl } from "../utils/siteMetadata";

export default function HomePage() {
  return (
    <>
      <Seo
        title="Premium Accessories"
        description="Shop premium earrings, necklaces, hampers, charms, and handcrafted gifting."
        path="/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Celestia Premium",
          url: toAbsoluteUrl("/"),
          potentialAction: {
            "@type": "SearchAction",
            target: `${toAbsoluteUrl("/category/Earrings")}?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <Hero />
      <HomeSections />
    </>
  );
}
